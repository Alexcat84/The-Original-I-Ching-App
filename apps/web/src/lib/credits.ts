import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isPersistableUuid } from "@/lib/session-ids";
import { getUpstashRedis } from "@/lib/rate-limit";

export type Tier = "free" | "seeker" | "practitioner" | "master" | "oracle";
export type CreditsType = "monthly" | "lifetime";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const LIFETIME_END_ISO = "2999-12-31T00:00:00.000Z";
const ANNUAL_DISCOUNT = 0.1;

function annualPrice(monthly: number): number {
  return Number((monthly * 12 * (1 - ANNUAL_DISCOUNT)).toFixed(2));
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
    creditsTotal: 2,
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
  seeker: {
    creditsTotal: 15,
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
    priceMonthly: 6.99,
    priceAnnual: annualPrice(6.99),
  },
  practitioner: {
    creditsTotal: 40,
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
    priceMonthly: 11.99,
    priceAnnual: annualPrice(11.99),
  },
  master: {
    creditsTotal: 100,
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
    priceMonthly: 19.99,
    priceAnnual: annualPrice(19.99),
  },
  oracle: {
    creditsTotal: 350,
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
    priceMonthly: 44.99,
    priceAnnual: annualPrice(44.99),
  },
};

export const CREDITS_PER_MONTH: Record<Tier, number> = {
  free: TIER_CONFIG.free.creditsTotal,
  seeker: TIER_CONFIG.seeker.creditsTotal,
  practitioner: TIER_CONFIG.practitioner.creditsTotal,
  master: TIER_CONFIG.master.creditsTotal,
  oracle: TIER_CONFIG.oracle.creditsTotal,
};

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
): Promise<{ allowed: boolean; remaining: number; limit: number } | null> {
  const r = getUpstashRedis();
  if (!r) return null;
  const ym = new Date().toISOString().slice(0, 7);
  const safeKey = userKey.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 120);
  const redisKey =
    creditsType === "lifetime"
      ? `iching:queries:v2:lifetime:${safeKey}:${safeTier}`
      : `iching:queries:v2:${ym}:${safeKey}:${safeTier}`;
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
}> {
  const incomingTier = (["free", "seeker", "practitioner", "master", "oracle"] as const).includes(tier as Tier)
    ? (tier as Tier)
    : "free";
  const safeTier = tierByUser.get(userKey) ?? incomingTier;
  const now = Date.now();
  const tierConfig = TIER_CONFIG[safeTier];
  const limit = tierConfig.creditsTotal;
  const tierCreditsType = tierConfig.creditsType;
  const supabase = getSupabaseAdmin();
  if (supabase && isPersistableUuid(userKey)) {
    const { data: row } = await supabase
      .from("query_credits")
      .select("id, credits_total, credits_used, cycle_start, cycle_end, credits_type")
      .eq("user_id", userKey)
      .maybeSingle();
    if (!row) {
      const cycleStart = new Date(now);
      const cycleEnd = tierCreditsType === "lifetime" ? new Date(LIFETIME_END_ISO) : new Date(now + MONTH_MS);
      await supabase.from("query_credits").insert({
        user_id: userKey,
        tier: safeTier,
        credits_total: limit,
        credits_used: 1,
        credits_type: tierCreditsType,
        cycle_start: cycleStart.toISOString(),
        cycle_end: cycleEnd.toISOString(),
      });
      return { allowed: true, remaining: limit - 1, limit };
    }
    const rowCreditsType: CreditsType = row.credits_type === "lifetime" ? "lifetime" : tierCreditsType;
    const cycleEnded = rowCreditsType === "monthly" && now >= new Date(row.cycle_end).getTime();
    const total = limit;
    const used = cycleEnded ? 0 : row.credits_used;
    if (used >= total) {
      return {
        allowed: false,
        remaining: 0,
        limit: total,
        cycleEndIso: rowCreditsType === "monthly" ? row.cycle_end : null,
      };
    }
    const nextUsed = used + 1;
    const cycleStart =
      rowCreditsType === "monthly" && cycleEnded ? new Date(now).toISOString() : row.cycle_start;
    const cycleEnd =
      rowCreditsType === "monthly" && cycleEnded
        ? new Date(now + MONTH_MS).toISOString()
        : rowCreditsType === "lifetime"
          ? LIFETIME_END_ISO
          : row.cycle_end;
    await supabase
      .from("query_credits")
      .update({
        tier: safeTier,
        credits_total: total,
        credits_used: nextUsed,
        credits_type: rowCreditsType,
        cycle_start: cycleStart,
        cycle_end: cycleEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { allowed: true, remaining: total - nextUsed, limit: total };
  }

  const fromRedis = await consumeTierCreditRedis(userKey, safeTier, tierCreditsType, limit);
  if (fromRedis) {
    return fromRedis;
  }

  const current = creditsByKey.get(userKey);
  if (
    !current ||
    (tierCreditsType === "monthly" && now - current.cycleStartedAt >= MONTH_MS) ||
    current.creditsType !== tierCreditsType
  ) {
    const next: UserCreditState = { remaining: limit, cycleStartedAt: now, creditsType: tierCreditsType };
    creditsByKey.set(userKey, next);
  }
  const state = creditsByKey.get(userKey)!;
  if (state.remaining <= 0) {
    return { allowed: false, remaining: 0, limit };
  }
  state.remaining -= 1;
  return { allowed: true, remaining: state.remaining, limit };
}

export async function getUserBillingTier(userId: string): Promise<Tier> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return "free";
  const { data } = await supabase.from("query_credits").select("tier").eq("user_id", userId).maybeSingle();
  const t = data?.tier;
  if (t === "seeker" || t === "practitioner" || t === "master" || t === "oracle" || t === "free") {
    return t;
  }
  return "free";
}

export async function upsertUserTier(
  userKey: string,
  tier: string,
  renewalDateIso?: string,
): Promise<Tier> {
  const safeTier = (["free", "seeker", "practitioner", "master", "oracle"] as const).includes(tier as Tier)
    ? (tier as Tier)
    : "free";
  tierByUser.set(userKey, safeTier);
  creditsByKey.delete(userKey);
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const targetConfig = TIER_CONFIG[safeTier];
    const { data: existing } = await supabase
      .from("query_credits")
      .select("id, credits_used, cycle_start, credits_type")
      .eq("user_id", userKey)
      .maybeSingle();
    const isLifetime = targetConfig.creditsType === "lifetime";
    const cycleStart =
      isLifetime
        ? (existing?.cycle_start ?? new Date().toISOString())
        : renewalDateIso
          ? new Date(renewalDateIso).toISOString()
          : new Date().toISOString();
    const cycleEnd = isLifetime ? LIFETIME_END_ISO : new Date(new Date(cycleStart).getTime() + MONTH_MS).toISOString();
    const creditsUsed = isLifetime && existing && existing.credits_type === "lifetime" ? existing.credits_used : 0;
    await supabase
      .from("query_credits")
      .upsert(
        {
          user_id: userKey,
          tier: safeTier,
          credits_total: targetConfig.creditsTotal,
          credits_used: creditsUsed,
          credits_type: targetConfig.creditsType,
          cycle_start: cycleStart,
          cycle_end: cycleEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
  }
  return safeTier;
}

