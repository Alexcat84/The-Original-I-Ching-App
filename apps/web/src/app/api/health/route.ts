import { type NextRequest, NextResponse } from "next/server";
import { isUpstashConfigured, rateLimitByKey } from "@/lib/rate-limit";
import { getSupabaseAdmin, withSupabaseSemaphore } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimitByKey({ key: `health:${ip}`, limit: 60, windowSeconds: 60 });
  if (!rl.ok) {
    return NextResponse.json({ status: "rate_limited" }, { status: 429 });
  }
  const rateLimitBackend = isUpstashConfigured() ? "upstash" : "in-memory-fallback";

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: "not_configured",
        rateLimitBackend,
      },
      { status: 503 },
    );
  }

  const { error } = await withSupabaseSemaphore(async () =>
    supabase.from("users").select("id").limit(1),
  );
  if (error) {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: "unreachable",
        rateLimitBackend,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString(), rateLimitBackend });
}
