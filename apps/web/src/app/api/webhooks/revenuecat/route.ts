import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { upsertUserTier } from "@/lib/credits";
import { isDuplicateInsertErrorMessage } from "@/lib/db-idempotency";
import { syncUserTierFromRevenueCatRest } from "@/lib/revenuecat-rest";
import { pickTierFromWebhookEntitlements } from "@/lib/revenuecat-tiers";
import { computeRevenueCatEventHash } from "@/lib/revenuecat-webhook-idempotency";
import { revenueCatWebhookAuthorized } from "@/lib/revenuecat-webhook-auth";
import { canonicalFromAliasGraph, upsertRevenueCatAliasGraph } from "@/lib/revenuecat-alias-map";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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
  id?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[] | null;
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

  // Persist alias graph so portal-session API can resolve canonical IDs for legacy anonymous customers.
  const aliasGraph = canonicalFromAliasGraph({
    appUserId: event.app_user_id,
    originalAppUserId: event.original_app_user_id,
    aliases: event.aliases,
  });
  if (aliasGraph) {
    await upsertRevenueCatAliasGraph(aliasGraph);
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
      console.log("[webhook EXPIRATION] user downgraded to free:", event.app_user_id?.slice(0, 8));
      return NextResponse.json({
        ok: true,
        appUserId: event.app_user_id,
        eventType: type,
        tier: "free",
        source: "not_found",
      });
    }
    if (syncResult.tier === "free") {
      console.log("[webhook EXPIRATION] user downgraded to free:", event.app_user_id?.slice(0, 8));
    }
    return NextResponse.json({
      ok: true,
      appUserId: event.app_user_id,
      eventType: type,
      tier: syncResult.tier,
      source: syncResult.tier === "free" ? "expiration_free" : "rest_after_revoke",
    });
  }

  if (type === "CANCELLATION") {
    const cancelTier = pickTierFromWebhookEntitlements(event.entitlement_ids, event.entitlement_id, event.product_id);
    if (cancelTier === "free") {
      const syncResult = await syncUserTierFromRevenueCatRest(event.app_user_id);
      if (!syncResult.ok) {
        return NextResponse.json({
          ok: true,
          skipped: true,
          eventType: type,
          reason: "cancellation_rest_unavailable",
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
      return NextResponse.json({
        ok: true,
        appUserId: event.app_user_id,
        eventType: type,
        tier: syncResult.tier,
        source: "cancellation_rest",
      });
    }
    const cancelRenewalMs =
      typeof event.expiration_at_ms === "number" ? event.expiration_at_ms : event.purchased_at_ms;
    const cancelRenewal = cancelRenewalMs ? new Date(cancelRenewalMs).toISOString() : undefined;
    await upsertUserTier(event.app_user_id, cancelTier, cancelRenewal, { preserveMonthlyCredits: true });
    return NextResponse.json({
      ok: true,
      appUserId: event.app_user_id,
      eventType: type,
      tier: cancelTier,
    });
  }

  if (!GRANT_UPDATE_TYPES.has(type)) {
    return NextResponse.json({ ok: true, skipped: true, eventType: type });
  }

  const tier = pickTierFromWebhookEntitlements(event.entitlement_ids, event.entitlement_id, event.product_id);

  // RENEWAL guard: skip if a more recent PRODUCT_CHANGE already set a higher tier.
  // Compares DB tier rank vs renewal tier rank; if DB is strictly higher and the DB
  // cycle_start postdates this event's purchased_at_ms, the RENEWAL is stale.
  if (type === "RENEWAL" && tier !== "free") {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: credRow } = await supabase
        .from("query_credits")
        .select("tier, cycle_start")
        .eq("user_id", event.app_user_id)
        .maybeSingle();
      if (credRow) {
        const tierRankMap: Record<string, number> = {
          free: 0, seeker: 1, seeker_monthly: 1, seeker_annual: 1,
          practitioner: 2, master: 3, oracle: 4,
        };
        const dbRank = tierRankMap[credRow.tier as string] ?? 0;
        const renewalRank = tierRankMap[tier] ?? 0;
        const dbCycleStartMs = credRow.cycle_start
          ? new Date(credRow.cycle_start as string).getTime()
          : 0;
        const eventPurchasedMs =
          typeof event.purchased_at_ms === "number" ? event.purchased_at_ms : 0;
        if (dbRank > renewalRank && dbCycleStartMs > eventPurchasedMs) {
          console.log("[webhook RENEWAL] skipped — newer plan change detected", {
            appUserId: event.app_user_id?.slice(0, 8),
            dbTier: credRow.tier,
            renewalTier: tier,
            dbCycleStartMs,
            eventPurchasedMs,
          });
          return NextResponse.json({
            ok: true,
            skipped: true,
            eventType: type,
            reason: "newer_plan_change",
          });
        }
      }
    }
  }

  if (type === "PRODUCT_CHANGE") {
    console.log("[webhook PRODUCT_CHANGE]", {
      appUserId: event.app_user_id?.slice(0, 8),
      entitlement_ids: event.entitlement_ids,
      entitlement_id: event.entitlement_id,
      product_id: event.product_id,
      resolvedTier: tier,
    });
  }

  if (tier === "free") {
    const syncResult = await syncUserTierFromRevenueCatRest(event.app_user_id);
    if (type === "PRODUCT_CHANGE") {
      console.log("[webhook PRODUCT_CHANGE] tier mapped to free — REST fallback:", {
        syncOk: syncResult.ok,
        syncTier: syncResult.ok ? syncResult.tier : null,
      });
    }
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
