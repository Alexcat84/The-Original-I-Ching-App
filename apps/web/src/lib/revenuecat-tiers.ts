/**
 * Maps RevenueCat entitlement identifiers to app billing tiers.
 * Identifiers in the RC dashboard must match these names (case-insensitive).
 */

/** Higher tiers first; seeker variants before generic `seeker` so product ids match precisely. */
export const TIER_PRIORITY = ["oracle", "master", "practitioner", "seeker_annual", "seeker_monthly", "seeker"] as const;

export type PaidTier = (typeof TIER_PRIORITY)[number];

export type RevenueCatBillingTier = PaidTier | "free";

const TIER_RANK: Record<RevenueCatBillingTier, number> = {
  free: 0,
  seeker: 1,
  seeker_monthly: 1,
  seeker_annual: 1,
  practitioner: 2,
  master: 3,
  oracle: 4,
};

/** Highest paid tier wins (for merging v1 subscriber + v2 Web Billing). */
export function maxBillingTier(a: RevenueCatBillingTier, b: RevenueCatBillingTier): RevenueCatBillingTier {
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}

const TIER_SET = new Set<string>(TIER_PRIORITY);

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function resolveTierFromToken(token: string): RevenueCatBillingTier {
  if (TIER_SET.has(token)) return token as RevenueCatBillingTier;
  if (token.includes("seeker") && token.includes("annual")) return "seeker_annual";
  if (token.includes("seeker") && token.includes("monthly")) return "seeker_monthly";
  for (const tier of TIER_PRIORITY) {
    if (token.includes(tier)) return tier;
  }
  return "free";
}

function seekerFamily(t: RevenueCatBillingTier): boolean {
  return t === "seeker" || t === "seeker_monthly" || t === "seeker_annual";
}

/** Match entitlement tokens to billing tier (Seeker monthly/annual/generic share one product family). */
export function tierTokenMatchesBillingTier(
  resolved: RevenueCatBillingTier,
  target: RevenueCatBillingTier,
): boolean {
  if (resolved === target) return true;
  if (seekerFamily(resolved) && seekerFamily(target)) return true;
  return false;
}

export function pickTierFromEntitlementIdList(raw: string[]): RevenueCatBillingTier {
  const normalized = raw.map((id) => normalizeToken(id)).filter((id) => id.length > 0);
  for (const tier of TIER_PRIORITY) {
    if (normalized.some((id) => resolveTierFromToken(id) === tier)) return tier;
  }
  return "free";
}

/**
 * Optional JSON map for Web Billing opaque product ids (e.g. prod_abc) → tier when v2 list
 * payloads omit entitlement lookup_key. Example: {"prod559a41dadb":"oracle"}
 */
export function parseRevenueCatProductTierMapJson(
  raw: string | null | undefined,
): Readonly<Record<string, RevenueCatBillingTier>> {
  const trimmed = raw?.trim();
  if (!trimmed) return {};
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, RevenueCatBillingTier> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k !== "string" || typeof v !== "string") continue;
      const key = k.trim().toLowerCase();
      if (!key) continue;
      const val = v.trim().toLowerCase();
      if (val === "free") {
        out[key] = "free";
        continue;
      }
      const resolved = resolveTierFromToken(normalizeToken(v));
      if (resolved === "free") continue;
      out[key] = resolved;
    }
    return out;
  } catch {
    return {};
  }
}

function productTierMapFromEnv(): Readonly<Record<string, RevenueCatBillingTier>> {
  return parseRevenueCatProductTierMapJson(process.env.REVENUECAT_PRODUCT_TIER_MAP);
}

/**
 * Same as pickTierFromEntitlementIdList, then optional opaque Web Billing product_id → tier via env map.
 */
export function pickTierFromEntitlementAndProductId(
  entitlementTokens: string[],
  opaqueProductId: string | null | undefined,
  productTierMap?: Readonly<Record<string, RevenueCatBillingTier>>,
): RevenueCatBillingTier {
  const fromEntitlements = pickTierFromEntitlementIdList(entitlementTokens);
  if (fromEntitlements !== "free") return fromEntitlements;
  const map = productTierMap ?? productTierMapFromEnv();
  const key = opaqueProductId?.trim().toLowerCase();
  if (!key) return "free";
  const mapped = map[key];
  return mapped ?? "free";
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

export interface RestEntitlementShape {
  expires_date: string | null | undefined;
  grace_period_expires_date?: string | null;
  /** Present on v1 subscriber entitlements; links display name to store product id. */
  product_identifier?: string | null;
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

/** Active entitlement + subscription records as returned by GET /v1/subscribers/{id}. */
function collectTierTokensFromSubscriberRecords(
  entitlements: Record<string, RestEntitlementShape> | undefined,
  subscriptions: Record<string, RestEntitlementShape> | undefined,
  nowMs: number,
): string[] {
  const tokens: string[] = [];
  for (const [key, details] of Object.entries(entitlements ?? {})) {
    if (!isEntitlementActive(details, nowMs)) continue;
    tokens.push(key);
    const pid = details.product_identifier?.trim();
    if (pid) tokens.push(pid);
  }
  for (const [productId, details] of Object.entries(subscriptions ?? {})) {
    if (!isEntitlementActive(details, nowMs)) continue;
    tokens.push(productId);
  }
  return tokens;
}

/**
 * Full v1 subscriber: Web Billing often exposes the paid tier via subscription keys / product ids,
 * not only entitlement identifiers.
 */
export function pickTierFromSubscriberBundle(
  entitlements: Record<string, RestEntitlementShape> | undefined,
  subscriptions: Record<string, RestEntitlementShape> | undefined,
  nowMs: number = Date.now(),
): RevenueCatBillingTier {
  const tokens = collectTierTokensFromSubscriberRecords(entitlements, subscriptions, nowMs);
  if (tokens.length === 0) return "free";
  return pickTierFromEntitlementIdList(tokens);
}

/**
 * REST subscriber object: all entitlements are listed; expired ones must be ignored.
 */
export function pickTierFromSubscriberEntitlements(
  entitlements: Record<string, RestEntitlementShape> | undefined,
  nowMs: number = Date.now(),
): RevenueCatBillingTier {
  return pickTierFromSubscriberBundle(entitlements, undefined, nowMs);
}

/** Latest expiration among active entitlements that match the resolved tier (for billing cycle hints). */
export function latestExpiresMsForTier(
  entitlements: Record<string, RestEntitlementShape> | undefined,
  tier: RevenueCatBillingTier,
  nowMs: number = Date.now(),
): number | null {
  return latestExpiresMsForSubscriberBundle(entitlements, undefined, tier, nowMs);
}

/** Like latestExpiresMsForTier but includes subscription product ids and entitlement product_identifier. */
export function latestExpiresMsForSubscriberBundle(
  entitlements: Record<string, RestEntitlementShape> | undefined,
  subscriptions: Record<string, RestEntitlementShape> | undefined,
  tier: RevenueCatBillingTier,
  nowMs: number = Date.now(),
): number | null {
  if (tier === "free") return null;

  type Row = { tokens: string[]; details: RestEntitlementShape };
  const rows: Row[] = [];
  for (const [key, details] of Object.entries(entitlements ?? {})) {
    if (!isEntitlementActive(details, nowMs)) continue;
    const tokens = [key];
    const pid = details.product_identifier?.trim();
    if (pid) tokens.push(pid);
    rows.push({ tokens, details });
  }
  for (const [productId, details] of Object.entries(subscriptions ?? {})) {
    if (!isEntitlementActive(details, nowMs)) continue;
    rows.push({ tokens: [productId], details });
  }

  const relevant = rows.filter((row) =>
    row.tokens.some((t) =>
      tierTokenMatchesBillingTier(resolveTierFromToken(normalizeToken(t)), tier),
    ),
  );
  if (relevant.length === 0) return null;
  if (relevant.some((r) => r.details.expires_date === null || r.details.expires_date === undefined)) {
    return null;
  }

  let max: number | null = null;
  for (const r of relevant) {
    const exp = new Date(r.details.expires_date as string).getTime();
    if (Number.isNaN(exp)) continue;
    max = max === null ? exp : Math.max(max, exp);
  }
  return max;
}
