import { upsertUserTier } from "@/lib/credits";
import {
  latestExpiresMsForSubscriberBundle,
  maxBillingTier,
  pickTierFromEntitlementIdList,
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

/** RC Billing product_id is often opaque (prod_…); entitlement lookup_key/display_name carry tier names. */
function collectV2SubscriptionTierTokens(sub: Record<string, unknown>): string[] {
  const tokens: string[] = [];
  for (const key of ["product_id", "product_identifier"] as const) {
    const v = asString(sub[key]);
    if (v) tokens.push(v);
  }
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
    const prod = (pend as { product?: unknown }).product;
    if (prod && typeof prod === "object" && prod !== null) {
      const p = prod as Record<string, unknown>;
      for (const v of [asString(p.id), asString(p.store_identifier), asString(p.display_name)]) {
        if (v) tokens.push(v);
      }
    }
  }
  return tokens;
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
    status: asString(raw.status),
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

  const rawRows = payload.items.filter(
    (it): it is Record<string, unknown> => typeof it === "object" && it !== null,
  );
  const paired = rawRows.map((raw) => ({ raw, p: parseV2SubscriptionItem(raw) }));

  const chosen =
    paired.find(({ p }) => p.givesAccess && isActiveSubscriptionStatus(p.status)) ??
    paired.find(({ p }) => isActiveSubscriptionStatus(p.status)) ??
    paired[0] ??
    null;

  const primary = chosen?.p ?? null;
  const primaryRaw = chosen?.raw ?? null;

  const hasAccess = Boolean(primary && (primary.givesAccess || isActiveSubscriptionStatus(primary.status)));
  if (!hasAccess || !primaryRaw) {
    return { kind: "none" };
  }

  const tierTokens = collectV2SubscriptionTierTokens(primaryRaw);
  const tier = pickTierFromEntitlementIdList(tierTokens);
  if (tier === "free") {
    if (process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview") {
      console.warn(
        "[revenuecat-rest] v2 subscription has access but tier mapped to free; check entitlement lookup_key vs TIER_PRIORITY. tokens=",
        tierTokens,
      );
    }
    return { kind: "none" };
  }

  const end = primary.currentPeriodEndsAt;
  const renewalIso =
    end && !Number.isNaN(new Date(end).getTime()) ? new Date(end).toISOString() : undefined;

  return { kind: "paid", tier, renewalIso };
}

type V1Load = { kind: "ok"; body: SubscriberResponse } | { kind: "404" } | { kind: "error" };

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
    if (v1.kind === "404" && (v2Outcome === "none" || v2Outcome === "skipped")) {
      return { ok: true, tier: "free", source: "not_found" };
    }
    console.warn("[RC REST] upstream - v1:", v1.kind, "v2:", v2Outcome);
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
