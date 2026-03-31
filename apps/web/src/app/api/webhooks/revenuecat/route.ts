import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { upsertUserTier } from "@/lib/credits";
import { isDuplicateInsertErrorMessage } from "@/lib/db-idempotency";
import { syncUserTierFromRevenueCatRest } from "@/lib/revenuecat-rest";
import { pickTierFromWebhookEntitlements } from "@/lib/revenuecat-tiers";
import { computeRevenueCatEventHash } from "@/lib/revenuecat-webhook-idempotency";
import { revenueCatWebhookAuthorized } from "@/lib/revenuecat-webhook-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/** Events where we refresh tier + billing cycle from RevenueCat payload. */
const GRANT_UPDATE_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "CANCELLATION",
  "NON_RENEWING_PURCHASE",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "TEMPORARY_ENTITLEMENT_GRANT",
  "TEST",
]);

const REVOKE_TYPES = new Set(["EXPIRATION"]);

interface RevenueCatEvent {
  type?: string;
  id?: string;
  app_user_id?: string;
  entitlement_ids?: string[] | null;
  entitlement_id?: string;
  product_id?: string;
  store?: string;
  purchased_at_ms?: number;
  expiration_at_ms?: number;
}

async function claimEventOnce(eventHash: string, event?: RevenueCatEvent): Promise<"claimed" | "duplicate" | "no_store"> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return "no_store";
  const payload = {
    event_hash: eventHash,
    event_type: event?.type ?? null,
    app_user_id: event?.app_user_id ?? null,
  };
  const { error } = await supabase.from("revenuecat_webhook_events").insert(payload);
  if (!error) return "claimed";
  if (isDuplicateInsertErrorMessage(error.message)) {
    return "duplicate";
  }
  return "no_store";
}

export async function POST(req: Request) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[API /api/webhooks/revenuecat] REVENUECAT_WEBHOOK_SECRET is not set — rejecting webhook");
    return apiError(503, {
      error: "webhook_not_configured",
      code: "REVENUECAT_WEBHOOK_NOT_CONFIGURED",
      action: "check_config",
    });
  }
  if (!revenueCatWebhookAuthorized(req, secret)) {
    return apiError(401, { error: "unauthorized", code: "WEBHOOK_UNAUTHORIZED", action: "check_config" });
  }

  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch {
    return apiError(400, { error: "invalid_body", code: "WEBHOOK_INVALID_BODY", action: "retry" });
  }

  let payload: { event?: RevenueCatEvent };
  try {
    payload = JSON.parse(rawBody) as { event?: RevenueCatEvent };
  } catch {
    return apiError(400, { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "fix_input" });
  }

  const event = payload.event;
  if (!event?.type) {
    return apiError(400, { error: "missing_event", code: "WEBHOOK_MISSING_EVENT", action: "fix_input" });
  }

  if (event.type === "TRANSFER" && !event.app_user_id) {
    return NextResponse.json({ ok: true, skipped: true, reason: "transfer_no_app_user_id" });
  }

  if (!event.app_user_id) {
    return apiError(400, { error: "missing_user", code: "WEBHOOK_MISSING_USER", action: "fix_input" });
  }

  const eventHash = computeRevenueCatEventHash(rawBody, event);
  const claim = await claimEventOnce(eventHash, event);
  if (claim === "duplicate") {
    return NextResponse.json({ ok: true, duplicate: true, eventType: event.type });
  }

  const type = event.type;

  if (REVOKE_TYPES.has(type)) {
    // EXPIRATION is per product; the user may still have another active plan (e.g. upgrade). Re-fetch RC.
    const syncResult = await syncUserTierFromRevenueCatRest(event.app_user_id);
    if (!syncResult.ok) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        eventType: type,
        reason: "revoke_rest_unavailable",
      });
    }
    if (syncResult.source === "not_found") {
      await upsertUserTier(event.app_user_id, "free", undefined, { fromRevenueCatRest: true });
      return NextResponse.json({
        ok: true,
        appUserId: event.app_user_id,
        eventType: type,
        tier: "free",
        source: "not_found",
      });
    }
    if (syncResult.tier === "free") {
      await upsertUserTier(event.app_user_id, "free", undefined, { fromRevenueCatRest: true });
    }
    return NextResponse.json({
      ok: true,
      appUserId: event.app_user_id,
      eventType: type,
      tier: syncResult.tier,
      source: syncResult.tier === "free" ? "expiration_free" : "rest_after_revoke",
    });
  }

  if (!GRANT_UPDATE_TYPES.has(type)) {
    return NextResponse.json({ ok: true, skipped: true, eventType: type });
  }

  const tier = pickTierFromWebhookEntitlements(event.entitlement_ids, event.entitlement_id, event.product_id);
  if (tier === "free") {
    const syncResult = await syncUserTierFromRevenueCatRest(event.app_user_id);
    if (syncResult.ok && syncResult.tier !== "free") {
      return NextResponse.json({
        ok: true,
        appUserId: event.app_user_id,
        eventType: type,
        tier: syncResult.tier,
        source: "rest_fallback",
        store: event.store ?? null,
      });
    }
    return NextResponse.json({
      ok: true,
      skipped: true,
      eventType: type,
      reason: "no_mapped_entitlement",
      store: event.store ?? null,
    });
  }

  const renewalDateMs = typeof event.expiration_at_ms === "number" ? event.expiration_at_ms : event.purchased_at_ms;
  const renewalDate = renewalDateMs ? new Date(renewalDateMs).toISOString() : undefined;
  await upsertUserTier(event.app_user_id, tier, renewalDate);

  return NextResponse.json({
    ok: true,
    appUserId: event.app_user_id,
    eventType: type,
    tier,
  });
}
