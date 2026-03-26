import { NextResponse } from "next/server";
import { upsertUserTier } from "@/lib/credits";
import { pickTierFromWebhookEntitlements } from "@/lib/revenuecat-tiers";
import { revenueCatWebhookAuthorized } from "@/lib/revenuecat-webhook-auth";

export const runtime = "nodejs";

/** Events where we refresh tier + billing cycle from RevenueCat payload. */
const GRANT_UPDATE_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "TEMPORARY_ENTITLEMENT_GRANT",
  "TEST",
]);

const REVOKE_TYPES = new Set(["EXPIRATION"]);

interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  entitlement_ids?: string[] | null;
  entitlement_id?: string;
  purchased_at_ms?: number;
}

export async function POST(req: Request) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[API /api/webhooks/revenuecat] REVENUECAT_WEBHOOK_SECRET is not set — rejecting webhook");
    return NextResponse.json({ ok: false, error: "webhook_not_configured" }, { status: 503 });
  }
  if (!revenueCatWebhookAuthorized(req, secret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: { event?: RevenueCatEvent };
  try {
    payload = (await req.json()) as { event?: RevenueCatEvent };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const event = payload.event;
  if (!event?.type) {
    return NextResponse.json({ ok: false, error: "missing_event" }, { status: 400 });
  }

  if (event.type === "TRANSFER" && !event.app_user_id) {
    return NextResponse.json({ ok: true, skipped: true, reason: "transfer_no_app_user_id" });
  }

  if (!event.app_user_id) {
    return NextResponse.json({ ok: false, error: "missing_user" }, { status: 400 });
  }

  const type = event.type;

  if (REVOKE_TYPES.has(type)) {
    await upsertUserTier(event.app_user_id, "free", undefined);
    return NextResponse.json({
      ok: true,
      appUserId: event.app_user_id,
      eventType: type,
      tier: "free",
    });
  }

  if (!GRANT_UPDATE_TYPES.has(type)) {
    return NextResponse.json({ ok: true, skipped: true, eventType: type });
  }

  const tier = pickTierFromWebhookEntitlements(event.entitlement_ids, event.entitlement_id);
  if (tier === "free") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      eventType: type,
      reason: "no_mapped_entitlement",
    });
  }

  const renewalDate = event.purchased_at_ms
    ? new Date(event.purchased_at_ms).toISOString()
    : undefined;
  await upsertUserTier(event.app_user_id, tier, renewalDate);

  return NextResponse.json({
    ok: true,
    appUserId: event.app_user_id,
    eventType: type,
    tier,
  });
}
