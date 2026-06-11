import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSessionLimit as getSessionLimitFromPack } from "@/lib/token-packs";

/**
 * Consumable-token billing model.
 * - credits_total: current available tokens
 * - credits_used: lifetime consumed tokens
 * - total_purchased: lifetime purchased tokens
 * - last_pack: last granted pack id ("free" for signup gift)
 */
export type ContextTierKey = "free" | "seeker" | "practitioner" | "master";
export type Tier = string;

type QueryCreditsRow = {
  credits_total: number;
  credits_used: number;
  total_purchased: number;
  last_pack: string;
};

async function readCreditsRow(userId: string): Promise<QueryCreditsRow | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data } = await supabase
    .from("query_credits")
    .select("credits_total, credits_used, total_purchased, last_pack")
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

export function toContextTierKey(lastPack: string): ContextTierKey {
  if (lastPack === "tokens_master_100") return "master";
  if (lastPack === "tokens_practitioner_40") return "practitioner";
  if (lastPack === "tokens_seeker_20") return "seeker";
  return "free";
}

export function tierLabelForDisplay(lastPack: string): string {
  const key = toContextTierKey(lastPack);
  if (key === "master") return "master";
  if (key === "practitioner") return "practitioner";
  if (key === "seeker") return "seeker";
  return "free";
}

export async function getTokenBalance(userId: string): Promise<number> {
  const row = await readCreditsRow(userId);
  return row?.credits_total ?? 0;
}

export async function getLastPack(userId: string): Promise<string> {
  const row = await readCreditsRow(userId);
  return row?.last_pack ?? "free";
}

export async function getSessionLimit(userId: string): Promise<number> {
  const lastPack = await getLastPack(userId);
  return getSessionLimitFromPack(lastPack);
}

export async function canConsult(userId: string): Promise<boolean> {
  return (await getTokenBalance(userId)) > 0;
}

export async function consumeToken(userId: string, tokensToConsume: number = 1): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");
  const { data, error } = await supabase.rpc("consume_token", { p_user_id: userId, tokens_to_consume: tokensToConsume });
  if (error) throw error;
  return typeof data === "number" ? data : -1;
}

export async function initFreeUser(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.rpc("init_free_user", { p_user_id: userId });
}

// Compatibility snapshot used by current UI while token-pack UI rollout completes.
export async function getAccountBillingSnapshot(userId: string): Promise<{
  creditsUsed: number;
  creditsRemaining: number;
  creditsLimit: number;
  sessionLimit: number;
  lastPack: string;
  tokensPurchasedLifetime: number;
}> {
  const row = await readCreditsRow(userId);
  const lastPack = row?.last_pack ?? "free";
  return {
    creditsUsed: row?.credits_used ?? 0,
    creditsRemaining: row?.credits_total ?? 0,
    creditsLimit: row?.credits_total ?? 0,
    sessionLimit: getSessionLimitFromPack(lastPack),
    lastPack,
    tokensPurchasedLifetime: row?.total_purchased ?? 0,
  };
}

// Compatibility helper used by legacy consult/policy code paths.
export async function getUserBillingTier(userId: string): Promise<string> {
  return getLastPack(userId);
}

/**
 * Compensates consume_token on post-charge failure (audit CRIT-02).
 * tokens = 0 records the event in token_refund_log without refunding
 * (streaming partial-delivery case — see plan §2.4).
 * Returns the resulting balance, or -1 if user not found / params invalid.
 */
export async function refundToken(
  userId: string,
  tokensToRefund: number,
  reason: string,
): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return -1;
  const { data, error } = await supabase.rpc("refund_token", {
    p_user_id: userId,
    p_tokens: tokensToRefund,
    p_reason: reason,
  });
  if (error) throw error;
  return typeof data === "number" ? data : -1;
}

/**
 * Pre-refund check (audit §2.5): did this consultation actually persist?
 * Covers the "ambiguous success" case — upsert confirmed in Postgres but
 * the HTTP response toward Vercel was lost. If it exists, the reading is
 * recoverable via hydration; no refund needed.
 */
export async function consultationExists(consultationId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("supabase_admin_unavailable");
  const { data, error } = await supabase
    .from("consultations")
    .select("id")
    .eq("id", consultationId)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

