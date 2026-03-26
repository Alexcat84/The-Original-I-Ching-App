/**
 * Maps RevenueCat entitlement identifiers to app billing tiers.
 * Identifiers in the RC dashboard must match these names (case-insensitive).
 */

export const TIER_PRIORITY = ["oracle", "master", "practitioner", "seeker"] as const;

export type PaidTier = (typeof TIER_PRIORITY)[number];

export type RevenueCatBillingTier = PaidTier | "free";

const TIER_SET = new Set<string>(TIER_PRIORITY);

export function pickTierFromEntitlementIdList(raw: string[]): RevenueCatBillingTier {
  const normalized = new Set(
    raw.map((id) => id.trim().toLowerCase()).filter((id) => TIER_SET.has(id)),
  );
  for (const tier of TIER_PRIORITY) {
    if (normalized.has(tier)) return tier;
  }
  return "free";
}

/** Webhook payload: entitlement_ids array plus optional single entitlement_id. */
export function pickTierFromWebhookEntitlements(
  entitlement_ids: string[] | null | undefined,
  entitlement_id: string | undefined,
): RevenueCatBillingTier {
  const raw = [...(entitlement_ids ?? [])];
  if (entitlement_id) raw.push(entitlement_id);
  return pickTierFromEntitlementIdList(raw);
}

interface RestEntitlementShape {
  expires_date: string | null;
  grace_period_expires_date?: string | null;
}

function isEntitlementActive(details: RestEntitlementShape, nowMs: number): boolean {
  if (details.expires_date === null || details.expires_date === undefined) return true;
  const exp = new Date(details.expires_date).getTime();
  if (Number.isNaN(exp)) return false;
  if (exp > nowMs) return true;
  const grace = details.grace_period_expires_date;
  if (grace) {
    const g = new Date(grace).getTime();
    if (!Number.isNaN(g) && g > nowMs) return true;
  }
  return false;
}

/**
 * REST subscriber object: all entitlements are listed; expired ones must be ignored.
 */
export function pickTierFromSubscriberEntitlements(
  entitlements: Record<string, RestEntitlementShape> | undefined,
  nowMs: number = Date.now(),
): RevenueCatBillingTier {
  if (!entitlements) return "free";
  const activeIds: string[] = [];
  for (const [key, details] of Object.entries(entitlements)) {
    const id = key.trim().toLowerCase();
    if (!TIER_SET.has(id)) continue;
    if (isEntitlementActive(details, nowMs)) activeIds.push(id);
  }
  return pickTierFromEntitlementIdList(activeIds);
}

/** Latest expiration among active entitlements that match the resolved tier (for billing cycle hints). */
export function latestExpiresMsForTier(
  entitlements: Record<string, RestEntitlementShape> | undefined,
  tier: RevenueCatBillingTier,
  nowMs: number = Date.now(),
): number | null {
  if (!entitlements || tier === "free") return null;
  let max: number | null = null;
  for (const [key, details] of Object.entries(entitlements)) {
    const id = key.trim().toLowerCase();
    if (id !== tier) continue;
    if (!isEntitlementActive(details, nowMs)) continue;
    if (details.expires_date === null || details.expires_date === undefined) {
      return null;
    }
    const exp = new Date(details.expires_date).getTime();
    if (Number.isNaN(exp)) continue;
    max = max === null ? exp : Math.max(max, exp);
  }
  return max;
}
