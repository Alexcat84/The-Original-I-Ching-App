import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "next-axiom";
import { getPackConfig } from "@/lib/token-packs";
import { revenueCatWebhookAuthorized } from "@/lib/revenuecat-webhook-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const PURCHASE_EVENTS = new Set(["NON_RENEWING_PURCHASE", "TEST"]);

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

  if (!PURCHASE_EVENTS.has(eventType)) {
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

  const pack = getPackConfig(productId);
  if (!pack) {
    log.error("webhook_unknown_product", { productId, eventType });
    console.error(`[RC webhook] unknown product: ${productId}`);
    await log.flush();
    return NextResponse.json({ error: "unknown_product" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }

  // Atomic idempotent grant: dedup insert + token credit in one transaction.
  // Uses grant_tokens_idempotent() (migration 039) so a transient DB failure
  // during the dedup step can never result in a duplicate grant on retry.
  const { data: grantResult, error: grantError } = await supabase.rpc("grant_tokens_idempotent", {
    p_event_hash: eventHash,
    p_event_type: eventType,
    p_user_id: userId,
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

  log.info("tokens_granted", { userId: userId.slice(0, 8), productId, tokens: pack.tokens, eventType });
  await log.flush();
  return NextResponse.json({ granted: pack.tokens, pack: productId });
}
