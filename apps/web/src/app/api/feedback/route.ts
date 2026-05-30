import { type NextRequest, NextResponse } from "next/server";
import { rateLimitByKey } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@iching-oracle/i18n";

export const runtime = "nodejs";

const VALID_PLATFORMS = new Set(["web", "android", "ios"]);

function sanitize(value: string): string {
  return value.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";

  const rl = await rateLimitByKey({ key: `feedback:${ip}`, limit: 5, windowSeconds: 3600 });
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const category = typeof body.category === "string" ? sanitize(body.category) : "";
  const description = typeof body.description === "string" ? sanitize(body.description) : "";
  const email = typeof body.email === "string" ? sanitize(body.email) : null;
  const locale = typeof body.locale === "string" ? sanitize(body.locale).slice(0, 10) : null;
  const appVersion = typeof body.app_version === "string" ? sanitize(body.app_version).slice(0, 50) : null;
  const platform = typeof body.platform === "string" ? sanitize(body.platform) : "web";
  const metadata = typeof body.metadata === "object" && body.metadata !== null ? body.metadata : {};

  if (!category || !(FEEDBACK_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "invalid_category" }, { status: 400 });
  }
  if (description.length < 20 || description.length > 1000) {
    return NextResponse.json({ error: "invalid_description" }, { status: 400 });
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (!VALID_PLATFORMS.has(platform)) {
    return NextResponse.json({ error: "invalid_platform" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "server_error" }, { status: 503 });
  }

  const { error } = await supabase.from("feedback").insert({
    category: category as FeedbackCategory,
    description,
    email: email ?? null,
    locale: locale ?? null,
    app_version: appVersion ?? null,
    platform,
    metadata,
  });

  if (error) {
    console.error("[feedback] insert error:", error.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
