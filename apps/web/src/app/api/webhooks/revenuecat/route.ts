import { NextResponse } from "next/server";
import { upsertUserTier } from "@/lib/credits";

export const runtime = "edge";

const KNOWN_ENTITLEMENTS = new Set(["oracle", "master", "practitioner", "seeker"]);

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

function authMatches(req: Request, secret: string): boolean {
  const h = req.headers.get("authorization")?.trim() ?? "";
  return h === secret || h === `Bearer ${secret}`;
}

function pickTierFromEvent(ev: RevenueCatEvent): string {
  const ids = ev.entitlement_ids ?? [];
  const hit = ids.find((id) => KNOWN_ENTITLEMENTS.has(id));
  if (hit) return hit;
  if (ev.entitlement_id && KNOWN_ENTITLEMENTS.has(ev.entitlement_id)) return ev.entitlement_id;
  return "free";
}

export async function POST(req: Request) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET?.trim();
  if (secret && !authMatches(req, secret)) {
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

  const tier = pickTierFromEvent(event);
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
