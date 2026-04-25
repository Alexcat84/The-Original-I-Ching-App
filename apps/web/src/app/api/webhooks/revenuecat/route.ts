import { NextRequest, NextResponse } from "next/server";
import { getPackConfig } from "@/lib/token-packs";
import { revenueCatWebhookAuthorized } from "@/lib/revenuecat-webhook-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const PURCHASE_EVENTS = new Set(["NON_RENEWING_PURCHASE", "TEST"]);

export async function POST(req: NextRequest) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[RC webhook] REVENUECAT_WEBHOOK_SECRET not configured — rejecting request");
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }
  if (!revenueCatWebhookAuthorized(req, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event as Record<string, unknown> | undefined;
  const eventType = (event?.type as string) ?? "";
  const userId = (event?.app_user_id as string) ?? "";
  const productId = (event?.product_id as string) ?? "";

  if (!PURCHASE_EVENTS.has(eventType)) {
    return NextResponse.json({ skipped: eventType });
  }

  if (!userId || !productId) {
    console.error("[RC webhook] missing userId or productId");
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const pack = getPackConfig(productId);
  if (!pack) {
    console.error(`[RC webhook] unknown product: ${productId}`);
    return NextResponse.json({ error: "unknown_product" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "db_not_configured" }, { status: 503 });
  }
  const { error } = await supabase.rpc("grant_tokens", {
    p_user_id: userId,
    p_tokens: pack.tokens,
    p_pack_id: productId,
  });

  if (error) {
    console.error("[RC webhook] grant_tokens failed:", error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ granted: pack.tokens, pack: productId });
}
