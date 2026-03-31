import { upsertUserTier } from "@/lib/credits";
import {
  latestExpiresMsForSubscriberBundle,
  maxBillingTier,
  parseRevenueCatProductTierMapJson,
  pickTierFromEntitlementAndProductId,
  pickTierFromSubscriberBundle,
  type RevenueCatBillingTier,
} from "@/lib/revenuecat-tiers";

const RC_V1 = "https://api.revenuecat.com/v1";
const RC_V2 = "https://api.revenuecat.com/v2";

interface SubscriberResponse {
  subscriber?: {
    entitlements?: Record<
      string,
      {
        expires_date: string | null;
        grace_period_expires_date?: string | null;
        product_identifier?: string | null;
      }
    >;
    subscriptions?: Record<string, { expires_date: string | null; grace_period_expires_date?: string | null }>;
  };
}

export type SyncFromRevenueCatResult =
  | { ok: true; tier: RevenueCatBillingTier; source: "subscriber" | "not_found" }
  | {
      ok: false;
      error: "not_configured" | "upstream" | "invalid_response" | "billing_cycle_incomplete";
    };

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

/** v2 API often returns epoch ms (number); list endpoint may omit ISO strings. */
function asIsoFromUnknown(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) return new Date(ms).toISOString();
  }
  return null;
}

function pushV2ProductObjectTokens(prod: unknown, tokens: string[]): void {
  if (!prod || typeof prod !== "object") return;
  const p = prod as Record<string, unknown>;
  for (const v of [
    asString(p.id),
    asString(p.store_identifier),
    asString(p.display_name),
    asString(p.lookup_key),
  ]) {
    if (v) tokens.push(v);
  }
}

/** RC Billing product_id is often opaque (prod_…); entitlement lookup_key/display_name carry tier names. */
function collectV2SubscriptionTierTokens(sub: Record<string, unknown>): string[] {
  const tokens: string[] = [];
  for (const key of ["product_id", "product_identifier"] as const) {
    const v = asString(sub[key]);
    if (v) tokens.push(v);
  }
  pushV2ProductObjectTokens(sub.product, tokens);
  const ent = sub.entitlements;
  if (ent && typeof ent === "object" && ent !== null) {
    const items = (ent as { items?: unknown }).items;
    if (Array.isArray(items)) {
      for (const it of items) {
        if (!it || typeof it !== "object") continue;
        const o = it as Record<string, unknown>;
        for (const k of ["lookup_key", "display_name", "id"] as const) {
          const v = asString(o[k]);
          if (v) tokens.push(v);
        }
      }
    }
  }
  const pend = sub.pending_changes;
  if (pend && typeof pend === "object" && pend !== null) {
    pushV2ProductObjectTokens((pend as { product?: unknown }).product, tokens);
  }
  return tokens;
}

/** RC v2 / Web Billing payloads sometimes omit `status` or use alternate keys. */
export function rcV2SubscriptionStatusFromRaw(raw: Record<string, unknown>): string | null {
  const lifecycle =
    raw.lifecycle && typeof raw.lifecycle === "object" && raw.lifecycle !== null
      ? (raw.lifecycle as Record<string, unknown>)
      : null;
  return (
    asString(raw.status) ??
    asString(raw.state) ??
    asString(raw.subscription_status) ??
    asString(raw.display_status) ??
    asString(lifecycle?.status) ??
    asString(lifecycle?.state)
  );
}

function parseV2SubscriptionItem(raw: Record<string, unknown>): {
  id: string | null;
  status: string | null;
  givesAccess: boolean;
  productId: string | null;
  currentPeriodEndsAt: string | null;
} {
  return {
    id: asString(raw.id),
    status: rcV2SubscriptionStatusFromRaw(raw),
    givesAccess: raw.gives_access === true,
    productId: asString(raw.product_id) ?? asString(raw.product_identifier),
    currentPeriodEndsAt:
      asIsoFromUnknown(raw.current_period_ends_at) ??
      asIsoFromUnknown(raw.ends_at) ??
      asIsoFromUnknown(raw.expires_at) ??
      asIsoFromUnknown(raw.expiration_at) ??
      asIsoFromUnknown(raw.renews_at),
  };
}

function isActiveSubscriptionStatus(status: string | null): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return normalized === "active" || normalized === "trialing" || normalized === "in_grace_period";
}

function isTerminalV2SubscriptionStatus(status: string | null): boolean {
  if (!status) return false;
  const n = status.toLowerCase();
  return (
    n === "expired" ||
    n === "canceled" ||
    n === "cancelled" ||
    n === "revoked" ||
    n === "refunded"
  );
}

/**
 * Row is a billing candidate if not clearly ended and any of:
 * - known active status string
 * - RC marks gives_access
 * - current period end is still in the future (status sometimes missing on Web Billing)
 */
function isEligibleV2SubscriptionCandidate(
  raw: Record<string, unknown>,
  p: ReturnType<typeof parseV2SubscriptionItem>,
): boolean {
  if (isTerminalV2SubscriptionStatus(p.status)) return false;
  if (isActiveSubscriptionStatus(p.status)) return true;
  if (raw.gives_access === true) return true;
  const endMs = p.currentPeriodEndsAt ? new Date(p.currentPeriodEndsAt).getTime() : NaN;
  return Number.isFinite(endMs) && endMs > Date.now();
}

export type BestV2SubscriptionPick = {
  raw: Record<string, unknown>;
  tier: RevenueCatBillingTier;
  renewalIso?: string;
};

/**
 * RC v2 `.../customers/{id}/subscriptions` returns multiple rows (history + current).
 * Never use `items[0]` — order is not guaranteed; an expired plan can appear first.
 * Among eligible rows (active status, gives_access, or future period end), pick highest tier.
 */
export function pickBestActiveV2SubscriptionFromItems(items: unknown[]): BestV2SubscriptionPick | null {
  const rawRows = items.filter(
    (it): it is Record<string, unknown> => typeof it === "object" && it !== null,
  );
  const paired = rawRows.map((raw) => ({ raw, p: parseV2SubscriptionItem(raw) }));
  const actives = paired.filter(({ raw, p }) => isEligibleV2SubscriptionCandidate(raw, p));
  if (actives.length === 0) return null;

  const productTierMap = parseRevenueCatProductTierMapJson(process.env.REVENUECAT_PRODUCT_TIER_MAP);
  const scored = actives
    .map(({ raw, p }) => {
      const tierTokens = collectV2SubscriptionTierTokens(raw);
      const tier = pickTierFromEntitlementAndProductId(tierTokens, p.productId, productTierMap);
      const end = p.currentPeriodEndsAt;
      const renewalIso =
        end && !Number.isNaN(new Date(end).getTime()) ? new Date(end).toISOString() : undefined;
      return { raw, p, tier, renewalIso };
    })
    .filter((s) => s.tier !== "free");

  if (scored.length === 0) {
    if (actives.length > 0) {
      const tokenBlobs = actives.map(({ raw }) => collectV2SubscriptionTierTokens(raw));
      console.warn(
        "[RC REST v2] active subscription rows but tier mapped to free; tokens=",
        tokenBlobs,
      );
    }
    return null;
  }

  const best = scored.reduce((a, b) => {
    const winner = maxBillingTier(a.tier, b.tier);
    if (winner === b.tier && b.tier !== a.tier) return b;
    if (winner === a.tier && a.tier !== b.tier) return a;
    const aMs = a.renewalIso ? new Date(a.renewalIso).getTime() : 0;
    const bMs = b.renewalIso ? new Date(b.renewalIso).getTime() : 0;
    return bMs >= aMs ? b : a;
  });

  return { raw: best.raw, tier: best.tier, renewalIso: best.renewalIso };
}

/**
 * Web Billing / RC Billing often appears in v2 customer subscriptions while v1 /subscribers
 * may be empty or slow to reflect entitlements — same source as subscription status UI.
 */
async function loadTierFromV2CustomerSubscriptions(
  secret: string,
  projectId: string,
  appUserId: string,
): Promise<
  | { kind: "paid"; tier: RevenueCatBillingTier; renewalIso?: string }
  | { kind: "none" }
  | { kind: "failed" }
> {
  const customerId = encodeURIComponent(appUserId);
  let listRes: Response;
  try {
    listRes = await fetch(
      `${RC_V2}/projects/${projectId}/customers/${customerId}/subscriptions`,
      { headers: { Authorization: `Bearer ${secret}` }, cache: "no-store" },
    );
  } catch {
    return { kind: "failed" };
  }

  if (!listRes.ok) {
    console.warn("[RC REST v2] failed", listRes.status, appUserId.slice(0, 8));
    if (listRes.status === 404 || listRes.status === 400) return { kind: "none" };
    return { kind: "failed" };
  }

  const payload = (await listRes.json().catch(() => null)) as { items?: unknown[] } | null;
  if (!payload || !Array.isArray(payload.items)) {
    return { kind: "failed" };
  }

  const best = pickBestActiveV2SubscriptionFromItems(payload.items);
  if (!best) {
    return { kind: "none" };
  }

  return { kind: "paid", tier: best.tier, renewalIso: best.renewalIso };
}

type V1Load =
  | { kind: "ok"; body: SubscriberResponse }
  | { kind: "404" }
  | { kind: "forbidden" }
  | { kind: "error" };

async function loadV1Subscriber(secret: string, appUserId: string): Promise<V1Load> {
  const url = `${RC_V1}/subscribers/${encodeURIComponent(appUserId)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
  } catch {
    return { kind: "error" };
  }

  if (res.status === 404) return { kind: "404" };
  if (res.status === 403) return { kind: "forbidden" };
  if (!res.ok) {
    console.warn("[RC REST v1] failed", res.status, appUserId.slice(0, 8));
    return { kind: "error" };
  }

  try {
    const body = (await res.json()) as SubscriberResponse;
    return { kind: "ok", body };
  } catch {
    return { kind: "error" };
  }
}

function latestRenewalIso(isos: (string | undefined)[]): string | undefined {
  let bestMs = 0;
  let best: string | undefined;
  for (const raw of isos) {
    if (!raw) continue;
    const ms = new Date(raw).getTime();
    if (!Number.isFinite(ms)) continue;
    if (ms > bestMs) {
      bestMs = ms;
      best = new Date(ms).toISOString();
    }
  }
  return best;
}

/**
 * Merges RevenueCat v1 subscriber payload with v2 customer subscriptions (Web Billing).
 * Avoids leaving users on `free` when only v2 has the active Stripe/RC Billing subscription.
 */
export async function syncUserTierFromRevenueCatRest(appUserId: string): Promise<SyncFromRevenueCatResult> {
  const secret = process.env.REVENUECAT_SECRET_KEY?.trim();
  if (!secret) {
    return { ok: false, error: "not_configured" };
  }

  const projectId = process.env.REVENUECAT_PROJECT_ID?.trim();

  const v1 = await loadV1Subscriber(secret, appUserId);

  if (v1.kind === "forbidden") {
    console.warn("[RC REST] v1 returned 403 — key may be V2-only, using v2 only");
  }

  const now = Date.now();
  const candidates: { tier: RevenueCatBillingTier; renewalIso?: string }[] = [];

  if (v1.kind === "ok") {
    const entitlements = v1.body.subscriber?.entitlements;
    const subscriptions = v1.body.subscriber?.subscriptions;
    const tier = pickTierFromSubscriberBundle(entitlements, subscriptions, now);
    const renewalMs = latestExpiresMsForSubscriberBundle(entitlements, subscriptions, tier, now);
    const renewalIso =
      renewalMs !== null && Number.isFinite(renewalMs) ? new Date(renewalMs).toISOString() : undefined;
    candidates.push({ tier, renewalIso });
  }

  let v2Outcome: "skipped" | "paid" | "none" | "failed" = "skipped";
  if (projectId) {
    const v2 = await loadTierFromV2CustomerSubscriptions(secret, projectId, appUserId);
    if (v2.kind === "paid") {
      v2Outcome = "paid";
      candidates.push({ tier: v2.tier, renewalIso: v2.renewalIso });
    } else if (v2.kind === "none") {
      v2Outcome = "none";
    } else {
      v2Outcome = "failed";
    }
  }

  if (candidates.length === 0) {
    const v1Missing = v1.kind === "404" || v1.kind === "forbidden";
    if (v1Missing && (v2Outcome === "none" || v2Outcome === "skipped")) {
      return { ok: true, tier: "free", source: "not_found" };
    }
    if (v1.kind !== "forbidden") {
      console.warn("[RC REST] upstream - v1:", v1.kind, "v2:", v2Outcome);
    }
    return { ok: false, error: "upstream" };
  }

  const finalTier = candidates.map((c) => c.tier).reduce(maxBillingTier);
  const renewalIso = latestRenewalIso(candidates.map((c) => c.renewalIso));

  try {
    await upsertUserTier(appUserId, finalTier, renewalIso, { fromRevenueCatRest: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "billing_cycle_end_stale" || msg === "billing_cycle_end_missing") {
      console.warn("[revenuecat-rest] upsert skipped: incomplete billing cycle from REST", appUserId.slice(0, 8));
      return { ok: false, error: "billing_cycle_incomplete" };
    }
    throw e;
  }

  return { ok: true, tier: finalTier, source: "subscriber" };
}
