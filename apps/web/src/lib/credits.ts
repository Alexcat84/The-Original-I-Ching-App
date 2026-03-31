import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isPersistableUuid } from "@/lib/session-ids";
import { getUpstashRedis } from "@/lib/rate-limit";
import {
  annualPriceUsd,
  FREE_LIFETIME_CONSULTATIONS,
  MASTER_CONSULTATIONS_PER_MONTH,
  ORACLE_CONSULTATIONS_PER_MONTH,
  PRACTITIONER_CONSULTATIONS_PER_MONTH,
  SEEKER_CONSULTATIONS_PER_MONTH,
  TIER_MONTHLY_PRICES_USD,
} from "@/lib/tier-billing-constants";

/**
 * Webhooks and server jobs use app_user_id without a Bearer session. If migration 003
 * never ran or a race left auth.users without public.users, billing writes fail. Heal
 * from Auth Admin when the UUID exists in auth.users.
 */
async function ensurePublicUserRowFromAuth(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data: row, error: readErr } = await supabase.from("users").select("id").eq("id", userId).maybeSingle();
  if (readErr) {
    console.error("[ensurePublicUserRowFromAuth] public.users read failed", readErr.message);
    return false;
  }
  if (row) return true;

  const { data: authRes, error: authErr } = await supabase.auth.admin.getUserById(userId);
  if (authErr || !authRes.user?.id) {
    console.warn("[ensurePublicUserRowFromAuth] no auth.users row for app_user_id", userId, authErr?.message);
    return false;
  }
  const email = authRes.user.email ?? "";
  if (!email) {
    console.warn("[ensurePublicUserRowFromAuth] auth user has no email", userId);
    return false;
  }

  const { error: upErr } = await supabase.from("users").upsert({ id: userId, email }, { onConflict: "id" });
  if (upErr) {
    console.error("[ensurePublicUserRowFromAuth] public.users upsert failed", upErr.message);
    return false;
  }
  return true;
}

export type Tier =
  | "free"
  | "seeker"
  | "seeker_monthly"
  | "seeker_annual"
  | "practitioner"
  | "master"
  | "oracle";

export type CreditsType = "monthly" | "lifetime";
export type CreditDenyReason =
  | "credits_depleted"
  | "period_expired"
  | "free_lifetime_depleted"
  | "billing_unavailable"
  | "grace_exhausted";

const KNOWN_TIERS = [
  "free",
  "seeker",
  "seeker_monthly",
  "seeker_annual",
  "practitioner",
  "master",
  "oracle",
] as const satisfies readonly Tier[];

/** Map legacy/generic RC tier and DB values to persisted app tier. */
export function normalizeBillingTier(tier: string): Tier {
  if (tier === "seeker") return "seeker_monthly";
  if ((KNOWN_TIERS as readonly string[]).includes(tier)) return tier as Tier;
  return "free";
}

/** Collapse Seeker variants for context-engine / watermark (same session depth as `seeker`). */
export type ContextTierKey = "free" | "seeker" | "practitioner" | "master" | "oracle";

export function toContextTierKey(tier: string): ContextTierKey {
  const t = normalizeBillingTier(tier);
  if (t === "seeker_monthly" || t === "seeker_annual") return "seeker";
  if (t === "practitioner" || t === "master" || t === "oracle" || t === "free") return t;
  return "free";
}

/** Short label for UI (Seeker monthly/annual both show as `seeker`). */
export function tierLabelForDisplay(tier: string): string {
  const t = normalizeBillingTier(tier);
  if (t === "seeker_monthly" || t === "seeker_annual") return "seeker";
  return t;
}

/** Degraded in-memory fallback only when Supabase is unavailable (no RC mirror in-process). */
const MEMORY_FALLBACK_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const GRACE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 horas
const GRACE_MAX_CONSULTATIONS = 3;
const GRACE_REDIS_KEY_PREFIX = "iching:grace:v1:";
const GRACE_REDIS_TTL_SEC = 24 * 60 * 60;
const LIFETIME_END_ISO = "2999-12-31T00:00:00.000Z";

export type UpsertUserTierOptions = {
  /** Set when called from syncUserTierFromRevenueCatRest to avoid infinite resync loops. */
  fromRevenueCatRest?: boolean;
  /** e.g. RevenueCat CANCELLATION — refresh period end without resetting monthly credits. */
  preserveMonthlyCredits?: boolean;
};

export type AccountBillingSnapshot = {
  tier: Tier;
  creditsUsed: number;
  creditsRemaining: number;
  cycleEnd: string | null;
  creditsLimit: number;
  creditsType: CreditsType;
};

function billingPeriodRedisKey(
  creditsType: CreditsType,
  cycleStart: string | null | undefined,
  cycleEnd: string | null | undefined,
): string | null {
  if (creditsType !== "monthly") return null;
  if (typeof cycleStart !== "string" || typeof cycleEnd !== "string") return null;
  if (!cycleStart.trim() || !cycleEnd.trim()) return null;
  const h = cycleStart.trim().slice(0, 40) + "_" + cycleEnd.trim().slice(0, 40);
  return h.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 120);
}

async function syncBillingFromRevenueCat(userKey: string): Promise<void> {
  const { syncUserTierFromRevenueCatRest } = await import("@/lib/revenuecat-rest");
  const res = await syncUserTierFromRevenueCatRest(userKey);
  if (!res.ok) {
    console.warn("[credits] RevenueCat REST sync failed", userKey.slice(0, 8), res.error);
  }
}

export interface TierConfig {
  creditsTotal: number;
  creditsType: CreditsType;
  maxSessionConsultations: number;
  historyDays: number;
  patternAnalysisLookback: number;
  imageWatermark: boolean;
  oracleBonesEnabled: boolean;
  yarrowMethodEnabled: boolean;
  twoFactorRequired: boolean;
  sharingEnabled: boolean;
  pdfDownload: boolean;
  claudeModel: "claude-sonnet-4-5-20250929";
  priceMonthly: number;
  priceAnnual: number;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  free: {
    creditsTotal: FREE_LIFETIME_CONSULTATIONS,
    creditsType: "lifetime",
    maxSessionConsultations: 1,
    historyDays: 0,
    patternAnalysisLookback: 0,
    imageWatermark: true,
    oracleBonesEnabled: true,
    yarrowMethodEnabled: true,
    twoFactorRequired: false,
    sharingEnabled: false,
    pdfDownload: true,
    claudeModel: "claude-sonnet-4-5-20250929",
    priceMonthly: 0,
    priceAnnual: 0,
  },
  /** Legacy / generic RC entitlement id `seeker` — uses `SEEKER_CONSULTATIONS_PER_MONTH` in tier-billing-constants. */
  seeker: {
    creditsTotal: SEEKER_CONSULTATIONS_PER_MONTH,
    creditsType: "monthly",
    maxSessionConsultations: 3,
    historyDays: 90,
    patternAnalysisLookback: 0,
    imageWatermark: true,
    oracleBonesEnabled: true,
    yarrowMethodEnabled: true,
    twoFactorRequired: false,
    sharingEnabled: false,
    pdfDownload: true,
    claudeModel: "claude-sonnet-4-5-20250929",
    priceMonthly: TIER_MONTHLY_PRICES_USD.seeker,
    priceAnnual: annualPriceUsd(TIER_MONTHLY_PRICES_USD.seeker),
  },
  seeker_monthly: {
    creditsTotal: SEEKER_CONSULTATIONS_PER_MONTH,
    creditsType: "monthly",
    maxSessionConsultations: 3,
    historyDays: 90,
    patternAnalysisLookback: 0,
    imageWatermark: true,
    oracleBonesEnabled: true,
    yarrowMethodEnabled: true,
    twoFactorRequired: false,
    sharingEnabled: false,
    pdfDownload: true,
    claudeModel: "claude-sonnet-4-5-20250929",
    priceMonthly: TIER_MONTHLY_PRICES_USD.seeker,
    priceAnnual: annualPriceUsd(TIER_MONTHLY_PRICES_USD.seeker),
  },
  seeker_annual: {
    creditsTotal: SEEKER_CONSULTATIONS_PER_MONTH,
    creditsType: "monthly",
    maxSessionConsultations: 3,
    historyDays: 90,
    patternAnalysisLookback: 0,
    imageWatermark: true,
    oracleBonesEnabled: true,
    yarrowMethodEnabled: true,
    twoFactorRequired: false,
    sharingEnabled: false,
    pdfDownload: true,
    claudeModel: "claude-sonnet-4-5-20250929",
    priceMonthly: TIER_MONTHLY_PRICES_USD.seeker,
    priceAnnual: annualPriceUsd(TIER_MONTHLY_PRICES_USD.seeker),
  },
  practitioner: {
    creditsTotal: PRACTITIONER_CONSULTATIONS_PER_MONTH,
    creditsType: "monthly",
    maxSessionConsultations: 5,
    historyDays: 0,
    patternAnalysisLookback: 0,
    imageWatermark: true,
    oracleBonesEnabled: true,
    yarrowMethodEnabled: true,
    twoFactorRequired: false,
    sharingEnabled: false,
    pdfDownload: true,
    claudeModel: "claude-sonnet-4-5-20250929",
    priceMonthly: TIER_MONTHLY_PRICES_USD.practitioner,
    priceAnnual: annualPriceUsd(TIER_MONTHLY_PRICES_USD.practitioner),
  },
  master: {
    creditsTotal: MASTER_CONSULTATIONS_PER_MONTH,
    creditsType: "monthly",
    maxSessionConsultations: 8,
    historyDays: 0,
    patternAnalysisLookback: 10,
    imageWatermark: true,
    oracleBonesEnabled: true,
    yarrowMethodEnabled: true,
    twoFactorRequired: false,
    sharingEnabled: false,
    pdfDownload: true,
    claudeModel: "claude-sonnet-4-5-20250929",
    priceMonthly: TIER_MONTHLY_PRICES_USD.master,
    priceAnnual: annualPriceUsd(TIER_MONTHLY_PRICES_USD.master),
  },
  oracle: {
    creditsTotal: ORACLE_CONSULTATIONS_PER_MONTH,
    creditsType: "monthly",
    maxSessionConsultations: 12,
    historyDays: 0,
    patternAnalysisLookback: 30,
    imageWatermark: true,
    oracleBonesEnabled: true,
    yarrowMethodEnabled: true,
    twoFactorRequired: false,
    sharingEnabled: false,
    pdfDownload: true,
    claudeModel: "claude-sonnet-4-5-20250929",
    priceMonthly: TIER_MONTHLY_PRICES_USD.oracle,
    priceAnnual: annualPriceUsd(TIER_MONTHLY_PRICES_USD.oracle),
  },
};

export const CREDITS_PER_MONTH: Record<Tier, number> = {
  free: TIER_CONFIG.free.creditsTotal,
  seeker: TIER_CONFIG.seeker.creditsTotal,
  seeker_monthly: TIER_CONFIG.seeker_monthly.creditsTotal,
  seeker_annual: TIER_CONFIG.seeker_annual.creditsTotal,
  practitioner: TIER_CONFIG.practitioner.creditsTotal,
  master: TIER_CONFIG.master.creditsTotal,
  oracle: TIER_CONFIG.oracle.creditsTotal,
};

/**
 * Single read (+ optional one re-read after stale billing sync). For /api/account/me.
 */
export async function getAccountBillingSnapshot(userId: string): Promise<AccountBillingSnapshot> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !isPersistableUuid(userId)) {
    const t: Tier = "free";
    const lim = CREDITS_PER_MONTH[t];
    return {
      tier: t,
      creditsUsed: 0,
      creditsRemaining: lim,
      cycleEnd: null,
      creditsLimit: lim,
      creditsType: TIER_CONFIG[t].creditsType,
    };
  }

  const readRow = () =>
    supabase
      .from("query_credits")
      .select("tier, cycle_end, credits_total, credits_used, credits_type")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  let { data } = await readRow();
  let tier: Tier =
    typeof data?.tier === "string" && (KNOWN_TIERS as readonly string[]).includes(data.tier)
      ? normalizeBillingTier(data.tier)
      : "free";

  const endMs = data?.cycle_end ? new Date(data.cycle_end).getTime() : NaN;
  if (tier !== "free" && Number.isFinite(endMs) && endMs < Date.now()) {
    await syncBillingFromRevenueCat(userId);
    const again = await readRow();
    data = again.data;
    tier =
      typeof data?.tier === "string" && (KNOWN_TIERS as readonly string[]).includes(data.tier)
        ? normalizeBillingTier(data.tier)
        : "free";
  }

  const lim = CREDITS_PER_MONTH[tier];
  const total = typeof data?.credits_total === "number" ? data.credits_total : lim;
  const used = typeof data?.credits_used === "number" ? data.credits_used : 0;

  return {
    tier,
    creditsUsed: used,
    creditsRemaining: Math.max(0, total - used),
    cycleEnd: typeof data?.cycle_end === "string" ? data.cycle_end : null,
    creditsLimit: lim,
    creditsType: TIER_CONFIG[tier].creditsType,
  };
}

interface UserCreditState {
  remaining: number;
  cycleStartedAt: number;
  creditsType: CreditsType;
}

const creditsByKey = new Map<string, UserCreditState>();
const tierByUser = new Map<string, Tier>();

const CREDIT_REDIS_TTL_SEC = 40 * 24 * 60 * 60;

async function consumeTierCreditRedis(
  userKey: string,
  safeTier: Tier,
  creditsType: CreditsType,
  limit: number,
  /** When set (monthly), aligns Redis with RevenueCat billing period from query_credits. */
  billingPeriodKey: string | null,
): Promise<{ allowed: boolean; remaining: number; limit: number } | null> {
  const r = getUpstashRedis();
  if (!r) return null;
  const ym = new Date().toISOString().slice(0, 7);
  const safeKey = userKey.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 120);
  const periodSeg =
    creditsType === "monthly"
      ? billingPeriodKey && billingPeriodKey.length > 0
        ? billingPeriodKey
        : ym
      : null;
  const redisKey =
    creditsType === "lifetime"
      ? `iching:queries:v2:lifetime:${safeKey}:${safeTier}`
      : `iching:queries:v2:period:${periodSeg}:${safeKey}:${safeTier}`;
  try {
    const used = await r.incr(redisKey);
    if (used === 1) {
      await r.expire(redisKey, creditsType === "lifetime" ? CREDIT_REDIS_TTL_SEC * 12 : CREDIT_REDIS_TTL_SEC);
    }
    if (used > limit) {
      await r.decr(redisKey);
      return { allowed: false, remaining: 0, limit };
    }
    return { allowed: true, remaining: limit - used, limit };
  } catch {
    return null;
  }
}

export async function consumeTierCredit(userKey: string, tier: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  /** Present when Supabase row exists and credits are exhausted (for UX copy). */
  cycleEndIso?: string | null;
  denyReason?: CreditDenyReason;
}> {
  const incomingTier = normalizeBillingTier(tier);
  const now = Date.now();

  let redisBillingPeriodKey: string | null = null;
  if (getUpstashRedis()) {
    const admin = getSupabaseAdmin();
    if (admin && isPersistableUuid(userKey)) {
      const { data: pr } = await admin
        .from("query_credits")
        .select("cycle_start, cycle_end, credits_type")
        .eq("user_id", userKey)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      redisBillingPeriodKey = billingPeriodRedisKey(
        pr?.credits_type === "lifetime" ? "lifetime" : "monthly",
        pr?.cycle_start as string | undefined,
        pr?.cycle_end as string | undefined,
      );
    }
  }

  const supabase = getSupabaseAdmin();
  if (supabase && isPersistableUuid(userKey)) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: row, error: rowError } = await supabase
        .from("query_credits")
        .select("id, tier, credits_total, credits_used, cycle_start, cycle_end, credits_type")
        .eq("user_id", userKey)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (rowError) {
        console.error("[consumeTierCredit] query_credits read failed", rowError.message);
        return { allowed: false, remaining: 0, limit: TIER_CONFIG.free.creditsTotal, denyReason: "billing_unavailable" };
      }

      const safeTier = normalizeBillingTier(
        typeof row?.tier === "string" ? row.tier : tierByUser.get(userKey) ?? incomingTier,
      );
      const tierConfig = TIER_CONFIG[safeTier];
      const limit = tierConfig.creditsTotal;
      const tierCreditsTypeFromConfig = tierConfig.creditsType;

      if (!row) {
        if (tierCreditsTypeFromConfig === "monthly") {
          await syncBillingFromRevenueCat(userKey);
          continue;
        }
        const cycleStart = new Date(now);
        const cycleEnd = new Date(LIFETIME_END_ISO);
        const { error: insertError } = await supabase.from("query_credits").insert({
          user_id: userKey,
          tier: safeTier,
          credits_total: limit,
          credits_used: 1,
          credits_type: "lifetime",
          cycle_start: cycleStart.toISOString(),
          cycle_end: cycleEnd.toISOString(),
        });
        if (insertError) {
          console.error("[consumeTierCredit] initial query_credits insert failed", insertError.message);
          return { allowed: false, remaining: 0, limit, denyReason: "billing_unavailable" };
        }
        return { allowed: true, remaining: limit - 1, limit };
      }

      const rowCreditsType: CreditsType = row.credits_type === "lifetime" ? "lifetime" : tierCreditsTypeFromConfig;
      const cycleEnded = rowCreditsType === "monthly" && now >= new Date(row.cycle_end).getTime();

      if (cycleEnded) {
        await syncBillingFromRevenueCat(userKey);
        continue;
      }

      const total = row.credits_total > 0 ? row.credits_total : limit;
      const used = row.credits_used;
      if (used >= total) {
        return {
          allowed: false,
          remaining: 0,
          limit: total,
          cycleEndIso: rowCreditsType === "monthly" ? row.cycle_end : null,
          denyReason: rowCreditsType === "lifetime" ? "free_lifetime_depleted" : "credits_depleted",
        };
      }
      const nextUsed = used + 1;
      const { data: updatedRows, error: updateError } = await supabase
        .from("query_credits")
        .update({
          tier: safeTier,
          credits_total: total,
          credits_used: nextUsed,
          credits_type: rowCreditsType,
          cycle_start: row.cycle_start,
          cycle_end: row.cycle_end,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .eq("credits_used", used)
        .select("id")
        .limit(1);
      if (updateError) {
        console.error("[consumeTierCredit] query_credits update failed", updateError.message);
        return { allowed: false, remaining: 0, limit, denyReason: "billing_unavailable" };
      }
      if (!updatedRows?.[0]?.id) {
        // Concurrent write won the race. Retry with a fresh read.
        continue;
      }
      return { allowed: true, remaining: total - nextUsed, limit: total };
    }

    console.warn("[consumeTierCredit] exhausted retries after contention/sync checks", userKey.slice(0, 8));

    const { data: finalRow } = await supabase
      .from("query_credits")
      .select("credits_total, credits_used, cycle_end, credits_type, tier")
      .eq("user_id", userKey)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const t = normalizeBillingTier(typeof finalRow?.tier === "string" ? finalRow.tier : incomingTier);
    const lim = TIER_CONFIG[t].creditsTotal;
    const finalCycleEndMs =
      finalRow?.credits_type !== "lifetime" && typeof finalRow?.cycle_end === "string"
        ? new Date(finalRow.cycle_end).getTime()
        : NaN;
    const isPaidTier = t !== "free";
    const cycleRecentlyExpired =
      Number.isFinite(finalCycleEndMs) && finalCycleEndMs < Date.now() && Date.now() - finalCycleEndMs <= GRACE_WINDOW_MS;
    const cycleExpiredBeyondGrace =
      Number.isFinite(finalCycleEndMs) && finalCycleEndMs < Date.now() && Date.now() - finalCycleEndMs > GRACE_WINDOW_MS;

    if (isPaidTier && cycleRecentlyExpired && typeof finalRow?.cycle_end === "string") {
      const redis = getUpstashRedis();
      if (redis) {
        const graceKey = `${GRACE_REDIS_KEY_PREFIX}${userKey.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 120)}`;
        try {
          const graceCount = await redis.incr(graceKey);
          if (graceCount === 1) {
            await redis.expire(graceKey, GRACE_REDIS_TTL_SEC);
          }
          if (graceCount > GRACE_MAX_CONSULTATIONS) {
            await redis.decr(graceKey);
            return {
              allowed: false,
              remaining: 0,
              limit: lim,
              cycleEndIso: finalRow.cycle_end,
              denyReason: "grace_exhausted",
            };
          }
        } catch {
          // If grace counter storage fails, do not hard-block paid users.
        }
      }
      console.warn(
        "[consumeTierCredit] billing unavailable grace window applied",
        userKey.slice(0, 8),
        finalRow.cycle_end,
      );
      return {
        allowed: true,
        remaining: 0,
        limit: lim,
        cycleEndIso: finalRow.cycle_end,
        denyReason: "billing_unavailable",
      };
    }

    if (isPaidTier && cycleExpiredBeyondGrace) {
      return {
        allowed: false,
        remaining: 0,
        limit: lim,
        cycleEndIso: typeof finalRow?.cycle_end === "string" ? finalRow.cycle_end : null,
        denyReason: "period_expired",
      };
    }

    if (t === "free") {
      return {
        allowed: false,
        remaining: 0,
        limit: lim,
        cycleEndIso: null,
        denyReason: "free_lifetime_depleted",
      };
    }

    return {
      allowed: false,
      remaining: 0,
      limit: lim,
      cycleEndIso:
        finalRow?.credits_type !== "lifetime" && typeof finalRow?.cycle_end === "string" ? finalRow.cycle_end : null,
      denyReason: "billing_unavailable",
    };
  }

  const safeTier = tierByUser.get(userKey) ?? incomingTier;
  const tierConfig = TIER_CONFIG[safeTier];
  const limit = tierConfig.creditsTotal;
  const tierCreditsType = tierConfig.creditsType;

  const fromRedis = await consumeTierCreditRedis(
    userKey,
    safeTier,
    tierCreditsType,
    limit,
    redisBillingPeriodKey,
  );
  if (fromRedis) {
    return fromRedis;
  }

  const current = creditsByKey.get(userKey);
  if (
    !current ||
    (tierCreditsType === "monthly" && now - current.cycleStartedAt >= MEMORY_FALLBACK_MONTH_MS) ||
    current.creditsType !== tierCreditsType
  ) {
    const next: UserCreditState = { remaining: limit, cycleStartedAt: now, creditsType: tierCreditsType };
    creditsByKey.set(userKey, next);
  }
  const state = creditsByKey.get(userKey)!;
  if (state.remaining <= 0) {
    return { allowed: false, remaining: 0, limit, denyReason: "credits_depleted" };
  }
  state.remaining -= 1;
  return { allowed: true, remaining: state.remaining, limit };
}

export async function getUserBillingTier(userId: string): Promise<Tier> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return "free";
  const { data } = await supabase
    .from("query_credits")
    .select("tier")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const t = data?.tier;
  if (typeof t === "string" && (KNOWN_TIERS as readonly string[]).includes(t)) {
    return normalizeBillingTier(t);
  }
  return "free";
}

export async function upsertUserTier(
  userKey: string,
  tier: string,
  renewalDateIso?: string,
  options?: UpsertUserTierOptions,
): Promise<Tier> {
  const safeTier = normalizeBillingTier(tier);
  tierByUser.set(userKey, safeTier);
  creditsByKey.delete(userKey);
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: userRow, error: userRowError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userKey)
      .maybeSingle();
    if (userRowError) {
      console.error("[upsertUserTier] public.users read failed", userRowError.message);
      throw new Error(`public_users_read: ${userRowError.message}`);
    }
    if (!userRow) {
      const healed = await ensurePublicUserRowFromAuth(supabase, userKey);
      if (!healed) {
        throw new Error("public_user_missing");
      }
    }

    const targetConfig = TIER_CONFIG[safeTier];
    const { data: existing, error: existingError } = await supabase
      .from("query_credits")
      .select("id, tier, credits_used, cycle_start, cycle_end, credits_type")
      .eq("user_id", userKey)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError) {
      console.error("[upsertUserTier] query_credits read failed", existingError.message);
      throw new Error(`query_credits_read: ${existingError.message}`);
    }
    const isLifetimeTarget = targetConfig.creditsType === "lifetime";
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const renewalMs = renewalDateIso ? new Date(renewalDateIso).getTime() : NaN;
    const hasFutureRenewal = Number.isFinite(renewalMs) && renewalMs > nowMs;

    let cycleStart: string;
    let cycleEnd: string;
    let creditsUsed: number;

    if (safeTier === "free" || isLifetimeTarget) {
      cycleStart = existing?.cycle_start ?? nowIso;
      cycleEnd = LIFETIME_END_ISO;
      if (existing?.credits_type === "lifetime") {
        creditsUsed = Math.min(existing.credits_used, FREE_LIFETIME_CONSULTATIONS);
      } else {
        creditsUsed = 0;
      }
    } else {
      if (!hasFutureRenewal) {
        if (!options?.fromRevenueCatRest) {
          const { syncUserTierFromRevenueCatRest } = await import("@/lib/revenuecat-rest");
          const syncRes = await syncUserTierFromRevenueCatRest(userKey);
          if (syncRes.ok) {
            return normalizeBillingTier(syncRes.tier);
          }
          throw new Error("billing_sync_required");
        }
        const existingEndMs = existing?.cycle_end ? new Date(existing.cycle_end).getTime() : NaN;
        const existingCycleStillValid =
          Number.isFinite(existingEndMs) &&
          existingEndMs > nowMs &&
          Boolean(existing?.cycle_start) &&
          Boolean(existing?.cycle_end);
        if (existingCycleStillValid && existing?.cycle_start && existing?.cycle_end) {
          cycleStart = existing.cycle_start;
          cycleEnd = existing.cycle_end;
        } else if (existing?.id) {
          console.warn(
            "[upsertUserTier] RC REST paid tier without future renewalIso; refusing to persist expired or unknown cycle",
            userKey.slice(0, 8),
          );
          throw new Error("billing_cycle_end_stale");
        } else {
          console.warn(
            "[upsertUserTier] RC REST paid tier without renewalIso and no query_credits row; refusing insert",
            userKey.slice(0, 8),
          );
          throw new Error("billing_cycle_end_missing");
        }
      } else {
        cycleStart = nowIso;
        cycleEnd = new Date(renewalMs).toISOString();
      }

      const oldEndMs = existing?.cycle_end ? new Date(existing.cycle_end).getTime() : NaN;
      const newEndMs = new Date(cycleEnd).getTime();
      const periodUnchanged =
        Boolean(existing) &&
        existing!.credits_type === "monthly" &&
        normalizeBillingTier(existing!.tier) === safeTier &&
        Number.isFinite(oldEndMs) &&
        Number.isFinite(newEndMs) &&
        oldEndMs === newEndMs;

      creditsUsed = periodUnchanged && existing ? existing.credits_used : 0;

      if (
        options?.preserveMonthlyCredits &&
        existing &&
        normalizeBillingTier(existing.tier) === safeTier &&
        existing.credits_type === "monthly"
      ) {
        creditsUsed = existing.credits_used;
      }

      if (periodUnchanged && existing) {
        cycleStart = existing.cycle_start;
        cycleEnd = existing.cycle_end;
      }
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("query_credits")
        .update({
          tier: safeTier,
          credits_total: targetConfig.creditsTotal,
          credits_used: creditsUsed,
          credits_type: targetConfig.creditsType,
          cycle_start: cycleStart,
          cycle_end: cycleEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      if (updateError) {
        console.error("[upsertUserTier] query_credits update failed", updateError.message);
        throw new Error(`query_credits_update: ${updateError.message}`);
      }
    } else {
      const { error: insertError } = await supabase.from("query_credits").insert({
        user_id: userKey,
        tier: safeTier,
        credits_total: targetConfig.creditsTotal,
        credits_used: creditsUsed,
        credits_type: targetConfig.creditsType,
        cycle_start: cycleStart,
        cycle_end: cycleEnd,
        updated_at: new Date().toISOString(),
      });
      if (insertError) {
        console.error("[upsertUserTier] query_credits insert failed", insertError.message);
        throw new Error(`query_credits_insert: ${insertError.message}`);
      }
    }
  }
  return safeTier;
}

