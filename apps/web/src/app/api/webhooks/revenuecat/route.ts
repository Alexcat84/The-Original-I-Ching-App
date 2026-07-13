import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "next-axiom";
import { getPackConfig } from "@/lib/token-packs";
import { revenueCatWebhookAuthorized } from "@/lib/revenuecat-webhook-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const REAL_PURCHASE_EVENTS = new Set(["NON_RENEWING_PURCHASE"]);
const TEST_EVENT = "TEST";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(s: unknown): s is string {
  return typeof s === "string" && UUID_RE.test(s);
}

/**
 * Tries to resolve a real Supabase UUID from a RevenueCat webhook event that
 * arrived with an anonymous app_user_id ($RCAnonymousID:...).
 *
 * RC Web Billing may create an anonymous customer when the hosted checkout
 * page runs without a valid SDK session (e.g. browser had a stale RC cookie
 * from a previous visit). The webhook event, however, includes two recovery
 * signals:
 *   1. `aliases` – array of all known IDs for that RC customer; a UUID in
 *      this array means the user previously identified themselves.
 *   2. `subscriber_attributes.$email` – the email RC collected during checkout;
 *      if present, we look it up in public.users to find the Supabase UUID.
 */
async function resolveAnonymousUserId(
  event: Record<string, unknown>,
  supabase: ReturnType<typeof getSupabaseAdmin>,
  log: Logger,
  anonymousId: string,
): Promise<string | null> {
  // ── 1. Check aliases array ───────────────────────────────────────────────
  const aliases = Array.isArray(event.aliases) ? event.aliases : [];
  const uuidAlias = aliases.find(isValidUUID);
  if (uuidAlias) {
    log.info("webhook_resolved_from_alias", {
      anonymous: anonymousId.slice(0, 32),
      resolved: uuidAlias.slice(0, 8),
    });
    return uuidAlias;
  }

  // ── 2. Check subscriber_attributes.$email ───────────────────────────────
  if (!supabase) return null;
  const attrs = event.subscriber_attributes as Record<string, unknown> | undefined;
  const emailAttr = attrs?.["$email"] as { value?: unknown } | undefined;
  const email = typeof emailAttr?.value === "string" ? emailAttr.value.trim() : null;

  if (!email) return null;

  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (userRow?.id) {
    log.info("webhook_resolved_from_email", {
      anonymous: anonymousId.slice(0, 32),
      email: email.slice(0, 6) + "…",
    });
    return userRow.id as string;
  }

  return null;
}

export async function POST(req: NextRequest) {
  const log = new Logger({ source: "api/webhooks/revenuecat" });
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[RC webhook] REVENUECAT_WEBHOOK_SECRET not configured — rejecting request");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }
  if (!revenueCatWebhookAuthorized(req, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const eventHash = createHash("sha256").update(rawBody).digest("hex");

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event as Record<string, unknown> | undefined;
  const eventType = (event?.type as string) ?? "";
  const userId = (event?.app_user_id as string) ?? "";
  const productId = (event?.product_id as string) ?? "";
  const rcEnvironment = String(event?.environment ?? "").toUpperCase();

  // TEST events AND SANDBOX-environment purchases (Stripe test cards — no real
  // money) must NEVER credit real tokens in production. Sandbox and production
  // share one RevenueCat project, so this production webhook also receives
  // sandbox events, and the sandbox checkout URL is a public NEXT_PUBLIC var —
  // without this gate anyone could pay with a 4242… test card and be granted
  // real tokens. Both are gated by the same env var (default OFF) so staging,
  // where it is ON, can still test end-to-end. Returns 200 so RevenueCat does
  // not retry the skipped event.
  const allowTestOrSandbox =
    process.env.REVENUECAT_ALLOW_TEST_EVENTS === "1" ||
    process.env.REVENUECAT_ALLOW_TEST_EVENTS === "true";
  if (eventType === TEST_EVENT && !allowTestOrSandbox) {
    log.info("webhook_test_event_skipped", { eventType });
    await log.flush();
    return NextResponse.json({ skipped: "test_event_disabled_in_production" });
  }
  // Fail-closed: with the flag off, only genuine PRODUCTION purchases credit
  // tokens. SANDBOX (or any missing/unknown environment) is rejected.
  if (eventType !== TEST_EVENT && rcEnvironment !== "PRODUCTION" && !allowTestOrSandbox) {
    log.info("webhook_non_production_event_skipped", { eventType, environment: rcEnvironment });
    await log.flush();
    return NextResponse.json({ skipped: "non_production_event_disabled" });
  }

  if (!REAL_PURCHASE_EVENTS.has(eventType) && eventType !== TEST_EVENT) {
    log.info("webhook_skipped", { eventType });
    await log.flush();
    return NextResponse.json({ skipped: eventType });
  }

  if (!userId || !productId) {
    log.error("webhook_missing_fields", { eventType, hasUserId: Boolean(userId), hasProductId: Boolean(productId) });
    console.error("[RC webhook] missing userId or productId");
    await log.flush();
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // ── Anonymous user resolution ────────────────────────────────────────────
  // RC sends "$RCAnonymousID:..." when the hosted checkout ran without a
  // properly identified SDK session. Before giving up, try to recover the
  // real Supabase UUID from the event's aliases array or the customer email.
  let resolvedUserId = userId;
  if (userId.startsWith("$RCAnonymousID:")) {
    if (event) {
      const recovered = await resolveAnonymousUserId(event, supabase, log, userId);
      if (recovered) resolvedUserId = recovered;
    }

    if (resolvedUserId === userId) {
      // Could not attribute — store for manual support resolution.
      const pack = getPackConfig(productId);
      if (supabase && pack) {
        await supabase.from("anonymous_purchase_log").upsert(
          {
            event_hash: eventHash,
            event_type: eventType,
            rc_anonymous_id: userId,
            product_id: productId,
            tokens: pack.tokens,
            raw_event: event as Record<string, unknown>,
          },
          { onConflict: "event_hash", ignoreDuplicates: true },
        );
      }
      log.error("webhook_anonymous_unresolved", { eventType, productId, userId: userId.slice(0, 32) });
      await log.flush();
      return NextResponse.json({ error: "anonymous_user_id_not_attributable" }, { status: 200 });
    }
  }

  const pack = getPackConfig(productId);
  if (!pack) {
    log.error("webhook_unknown_product", { productId, eventType });
    console.error(`[RC webhook] unknown product: ${productId}`);
    await log.flush();
    return NextResponse.json({ error: "unknown_product" }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  // Atomic idempotent grant: dedup insert + token credit in one transaction.
  // Uses grant_tokens_idempotent() (migration 039) so a transient DB failure
  // during the dedup step can never result in a duplicate grant on retry.
  const { data: grantResult, error: grantError } = await supabase.rpc("grant_tokens_idempotent", {
    p_event_hash: eventHash,
    p_event_type: eventType,
    p_user_id: resolvedUserId,
    p_tokens: pack.tokens,
    p_pack: productId,
  });

  if (grantError) {
    log.error("grant_tokens_idempotent_failed", { productId, tokens: pack.tokens, error: grantError.message, eventType });
    console.error("[RC webhook] grant_tokens_idempotent failed:", grantError.message);
    await log.flush();
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (grantResult === "already_processed") {
    log.info("webhook_duplicate", { eventType, productId });
    await log.flush();
    return NextResponse.json({ skipped: "already_processed" });
  }

  const wasAnonymous = resolvedUserId !== userId;
  log.info("tokens_granted", {
    userId: resolvedUserId.slice(0, 8),
    productId,
    tokens: pack.tokens,
    eventType,
    ...(wasAnonymous && { resolvedFromAnonymous: true }),
  });
  await log.flush();
  return NextResponse.json({ granted: pack.tokens, pack: productId });
}
