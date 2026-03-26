import { upsertUserTier } from "@/lib/credits";
import {
  latestExpiresMsForTier,
  pickTierFromSubscriberEntitlements,
  type RevenueCatBillingTier,
} from "@/lib/revenuecat-tiers";

const RC_API = "https://api.revenuecat.com/v1";

interface SubscriberResponse {
  subscriber?: {
    entitlements?: Record<string, { expires_date: string | null; grace_period_expires_date?: string | null }>;
  };
}

export type SyncFromRevenueCatResult =
  | { ok: true; tier: RevenueCatBillingTier; source: "subscriber" | "not_found" }
  | { ok: false; error: "not_configured" | "upstream" | "invalid_response" };

/**
 * Loads the subscriber from RevenueCat REST API and updates query_credits tier to match active entitlements.
 * Use when webhooks are delayed, or after the Web SDK identifies the user.
 */
export async function syncUserTierFromRevenueCatRest(appUserId: string): Promise<SyncFromRevenueCatResult> {
  const secret = process.env.REVENUECAT_SECRET_KEY?.trim();
  if (!secret) {
    return { ok: false, error: "not_configured" };
  }

  const url = `${RC_API}/subscribers/${encodeURIComponent(appUserId)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "upstream" };
  }

  if (res.status === 404) {
    // No subscriber in RevenueCat yet — do not overwrite DB (avoid resetting credits on transient errors).
    return { ok: true, tier: "free", source: "not_found" };
  }

  if (!res.ok) {
    return { ok: false, error: "upstream" };
  }

  let body: SubscriberResponse;
  try {
    body = (await res.json()) as SubscriberResponse;
  } catch {
    return { ok: false, error: "invalid_response" };
  }

  const entitlements = body.subscriber?.entitlements;
  const now = Date.now();
  const tier = pickTierFromSubscriberEntitlements(entitlements, now);
  const renewalMs = latestExpiresMsForTier(entitlements, tier, now);
  const renewalIso =
    renewalMs !== null && Number.isFinite(renewalMs) ? new Date(renewalMs).toISOString() : undefined;

  await upsertUserTier(appUserId, tier, renewalIso);

  return { ok: true, tier, source: "subscriber" };
}
