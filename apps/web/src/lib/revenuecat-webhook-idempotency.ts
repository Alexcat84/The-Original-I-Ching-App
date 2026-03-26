import { createHash } from "node:crypto";

type RevenueCatFingerprintEvent = {
  id?: string;
  type?: string;
  app_user_id?: string;
  purchased_at_ms?: number;
  entitlement_id?: string;
  entitlement_ids?: string[] | null;
};

export function computeRevenueCatEventHash(rawBody: string, event?: RevenueCatFingerprintEvent): string {
  const canonical = JSON.stringify({
    id: event?.id ?? null,
    type: event?.type ?? null,
    appUserId: event?.app_user_id ?? null,
    purchasedAtMs: event?.purchased_at_ms ?? null,
    entitlementId: event?.entitlement_id ?? null,
    entitlementIds: event?.entitlement_ids ?? null,
    rawBody,
  });
  return createHash("sha256").update(canonical).digest("hex");
}
