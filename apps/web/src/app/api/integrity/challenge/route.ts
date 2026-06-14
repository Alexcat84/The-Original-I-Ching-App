import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getUpstashRedis, rateLimitByKey } from "@/lib/rate-limit";
import { createApiLogger } from "@/lib/supabase-telemetry";
import {
  fingerprintIntegrityValue,
  readIntegrityTraceId,
} from "@/lib/integrity-telemetry";
import { captureIntegrityToSentry } from "@/lib/integrity-sentry";

export const runtime = "nodejs";

const CHALLENGE_TTL_SECONDS = 600; // 10 minutes
const TRACE_TTL_SECONDS = 600;

/**
 * GET /api/integrity/challenge
 * Issues a cryptographically random nonce for Play Integrity attestation.
 */
export async function GET(req: NextRequest) {
  const api = createApiLogger("api/integrity/challenge", req, "/api/integrity/challenge");
  const traceId = readIntegrityTraceId(req);

  const ip =
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rl = await rateLimitByKey({
    key: `integrity_challenge:${ip}`,
    limit: 10,
    windowSeconds: 60,
  });
  if (!rl.ok) {
    api.log.warn("integrity_challenge_denied", {
      requestId: api.requestId,
      traceId,
      reason: "rate_limited",
      userId: null,
    });
    captureIntegrityToSentry("integrity_challenge_denied", {
      source: "challenge",
      reason: "rate_limited",
      traceId,
    });
    await api.log.flush();
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    api.log.warn("integrity_challenge_denied", {
      requestId: api.requestId,
      traceId,
      reason: "auth_required",
      userId: null,
    });
    await api.log.flush();
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const challenge = Buffer.from(bytes).toString("base64url");
  const nonceFp = fingerprintIntegrityValue(challenge);

  const redis = getUpstashRedis();
  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      api.log.warn("integrity_challenge_denied", {
        requestId: api.requestId,
        traceId,
        reason: "redis_unavailable",
        userId: authUser.userId.slice(0, 8),
        nonceFp,
      });
      captureIntegrityToSentry("integrity_challenge_denied", {
        source: "challenge",
        reason: "redis_unavailable",
        traceId,
        userId: authUser.userId.slice(0, 8),
        extra: { nonceFp },
      });
      await api.log.flush();
      return NextResponse.json({ error: "integrity_unavailable" }, { status: 503 });
    }
  } else {
    await redis.set(
      `integrity_nonce:${challenge}`,
      authUser.userId,
      { ex: CHALLENGE_TTL_SECONDS },
    );
    if (traceId) {
      await redis.set(
        `integrity_trace:${traceId}`,
        JSON.stringify({
          nonceFp,
          userId: authUser.userId.slice(0, 8),
          issuedAt: Date.now(),
        }),
        { ex: TRACE_TTL_SECONDS },
      );
    }
  }

  api.log.info("integrity_challenge_issued", {
    requestId: api.requestId,
    traceId,
    userId: authUser.userId.slice(0, 8),
    nonceFp,
    challengeLen: challenge.length,
    challengeHasDash: challenge.includes("-"),
    challengeHasUnderscore: challenge.includes("_"),
    challengeHasPadding: challenge.endsWith("="),
    redisStored: Boolean(redis),
    ttlSeconds: CHALLENGE_TTL_SECONDS,
  });

  await api.log.flush();
  return NextResponse.json({ challenge, ttl: CHALLENGE_TTL_SECONDS, nonceFp });
}
