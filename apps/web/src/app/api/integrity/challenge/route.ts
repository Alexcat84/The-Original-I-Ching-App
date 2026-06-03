import { NextResponse } from "next/server";
import { getUpstashRedis } from "@/lib/rate-limit";

export const runtime = "nodejs";

const CHALLENGE_TTL_SECONDS = 600; // 10 minutes

/**
 * GET /api/integrity/challenge
 * Generates a cryptographically random nonce for Play Integrity attestation.
 * The nonce is stored in Redis with a TTL and consumed exactly once on verify.
 * No auth required — the challenge itself is not sensitive.
 */
export async function GET() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const challenge = Buffer.from(bytes).toString("base64url");

  const redis = getUpstashRedis();
  if (redis) {
    await redis.set(`integrity_nonce:${challenge}`, "1", { ex: CHALLENGE_TTL_SECONDS });
  }

  return NextResponse.json({ challenge, ttl: CHALLENGE_TTL_SECONDS });
}
