/**
 * Maps RevenueCat entitlement identifiers to app billing tiers.
 * Identifiers in the RC dashboard must match these names (case-insensitive).
 */

export const TIER_PRIORITY = ["oracle", "master", "practitioner", "seeker"] as const;

export type PaidTier = (typeof TIER_PRIORITY)[number];

export type RevenueCatBillingTier = PaidTier | "free";

const TIER_SET = new Set<string>(TIER_PRIORITY);

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function resolveTierFromToken(token: string): RevenueCatBillingTier {
  if (TIER_SET.has(token)) return token as RevenueCatBillingTier;
  for (const tier of TIER_PRIORITY) {
    if (token.includes(tier)) return tier;
  }
  return "free";
}

export function pickTierFromEntitlementIdList(raw: string[]): RevenueCatBillingTier {
  const normalized = raw.map((id) => normalizeToken(id)).filter((id) => id.length > 0);
  for (const tier of TIER_PRIORITY) {
    if (normalized.some((id) => resolveTierFromToken(id) === tier)) return tier;
  }
  return "free";
}

/** Webhook payload: entitlement_ids array plus optional single entitlement_id. */
export function pickTierFromWebhookEntitlements(
  entitlement_ids: string[] | null | undefined,
  entitlement_id: string | undefined,
  product_id?: string,
): RevenueCatBillingTier {
  const raw = [...(entitlement_ids ?? [])];
  if (entitlement_id) raw.push(entitlement_id);
  if (product_id) raw.push(product_id);
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
    if (!isEntitlementActive(details, nowMs)) continue;
    activeIds.push(key);
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
    const entryTier = resolveTierFromToken(normalizeToken(key));
    if (entryTier !== tier) continue;
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
