import { getSupabaseAdmin } from "@/lib/supabase-admin";

type Tier = "free" | "seeker" | "practitioner" | "master" | "oracle";

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const CREDITS_PER_MONTH: Record<Tier, number> = {
  free: 3,
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

export async function consumeTierCredit(userKey: string, tier: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  const incomingTier = (["free", "seeker", "practitioner", "master", "oracle"] as const).includes(tier as Tier)
    ? (tier as Tier)
    : "free";
  const safeTier = tierByUser.get(userKey) ?? incomingTier;
  const now = Date.now();
  const limit = CREDITS_PER_MONTH[safeTier];
  const supabase = getSupabaseAdmin();
  if (supabase) {
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
      return { allowed: false, remaining: 0, limit: total };
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

