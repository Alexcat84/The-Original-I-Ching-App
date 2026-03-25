import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isPersistableUuid } from "@/lib/session-ids";
import { getUpstashRedis } from "@/lib/rate-limit";

type Tier = "free" | "seeker" | "practitioner" | "master" | "oracle";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export const CREDITS_PER_MONTH: Record<Tier, number> = {
  free: 2,
  seeker: 60,
  practitioner: 180,
  master: 500,
  oracle: 2000,
};

interface UserCreditState {
  remaining: number;
  cycleStartedAt: number;
}

const creditsByKey = new Map<string, UserCreditState>();
const tierByUser = new Map<string, Tier>();

const CREDIT_REDIS_TTL_SEC = 40 * 24 * 60 * 60;

async function consumeTierCreditRedis(
  userKey: string,
  safeTier: Tier,
  limit: number,
): Promise<{ allowed: boolean; remaining: number; limit: number } | null> {
  const r = getUpstashRedis();
  if (!r) return null;
  const ym = new Date().toISOString().slice(0, 7);
  const safeKey = userKey.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 120);
  const redisKey = `iching:queries:v1:${ym}:${safeKey}:${safeTier}`;
  try {
    const used = await r.incr(redisKey);
    if (used === 1) {
      await r.expire(redisKey, CREDIT_REDIS_TTL_SEC);
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
  const limit = CREDITS_PER_MONTH[safeTier];
  const supabase = getSupabaseAdmin();
  if (supabase && isPersistableUuid(userKey)) {
    const { data: row } = await supabase
      .from("query_credits")
      .select("id, credits_total, credits_used, cycle_start, cycle_end")
      .eq("user_id", userKey)
      .maybeSingle();
    if (!row) {
      const cycleStart = new Date(now);
      const cycleEnd = new Date(now + MONTH_MS);
      await supabase.from("query_credits").insert({
        user_id: userKey,
        tier: safeTier,
        credits_total: limit,
        credits_used: 1,
        cycle_start: cycleStart.toISOString(),
        cycle_end: cycleEnd.toISOString(),
      });
      return { allowed: true, remaining: limit - 1, limit };
    }
    const cycleEnded = now >= new Date(row.cycle_end).getTime();
    const total = cycleEnded ? limit : row.credits_total;
    const used = cycleEnded ? 0 : row.credits_used;
    if (used >= total) {
      return { allowed: false, remaining: 0, limit: total, cycleEndIso: row.cycle_end };
    }
    const nextUsed = used + 1;
    const cycleStart = cycleEnded ? new Date(now).toISOString() : row.cycle_start;
    const cycleEnd = cycleEnded ? new Date(now + MONTH_MS).toISOString() : row.cycle_end;
    await supabase
      .from("query_credits")
      .update({
        tier: safeTier,
        credits_total: total,
        credits_used: nextUsed,
        cycle_start: cycleStart,
        cycle_end: cycleEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return { allowed: true, remaining: total - nextUsed, limit: total };
  }

  const fromRedis = await consumeTierCreditRedis(userKey, safeTier, limit);
  if (fromRedis) {
    return fromRedis;
  }

  const current = creditsByKey.get(userKey);
  if (!current || now - current.cycleStartedAt >= MONTH_MS) {
    const next: UserCreditState = { remaining: limit, cycleStartedAt: now };
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
    const cycleStart = renewalDateIso ? new Date(renewalDateIso) : new Date();
    const cycleEnd = new Date(cycleStart.getTime() + MONTH_MS);
    await supabase
      .from("query_credits")
      .upsert(
        {
          user_id: userKey,
          tier: safeTier,
          credits_total: CREDITS_PER_MONTH[safeTier],
          credits_used: 0,
          cycle_start: cycleStart.toISOString(),
          cycle_end: cycleEnd.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
  }
  return safeTier;
}

