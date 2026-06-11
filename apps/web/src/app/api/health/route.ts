import { type NextRequest, NextResponse } from "next/server";
import { isUpstashConfigured, rateLimitByKey, getUpstashRedis } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Health check intentionally avoids Supabase/PostgREST queries.
// A DB ping every 60s from monitoring tools would permanently consume one pool slot
// and amplify Warp kills under login bursts. Redis check is sufficient for liveness.
export async function GET(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimitByKey({ key: `health:${ip}`, limit: 60, windowSeconds: 60 });
  if (!rl.ok) {
    return NextResponse.json({ status: "rate_limited" }, { status: 429 });
  }

  const rateLimitBackend = isUpstashConfigured() ? "upstash" : "in-memory-fallback";

  // Optional lightweight Redis ping — non-fatal if unavailable.
  let redisStatus: "ok" | "degraded" | "not_configured" = "not_configured";
  const redis = getUpstashRedis();
  if (redis) {
    try {
      await redis.ping();
      redisStatus = "ok";
    } catch {
      redisStatus = "degraded";
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    rateLimitBackend,
    redis: redisStatus,
  });
}
