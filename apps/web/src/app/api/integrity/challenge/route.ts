import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getUpstashRedis, rateLimitByKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const CHALLENGE_TTL_SECONDS = 600; // 10 minutes

/**
 * GET /api/integrity/challenge
 * Issues a cryptographically random nonce for Play Integrity attestation.
 *
 * Security controls:
 *  - Requires Bearer auth (challenges are only useful to logged-in users).
 *  - Rate-limited: 10 challenges per minute per IP to prevent Redis exhaustion.
 *  - Nonce is stored as `integrity_nonce:{nonce} -> userId` so verification
 *    can confirm the token was minted for the requesting user.
 */
export async function GET(req: NextRequest) {
  // Finding #5: rate limit to prevent nonce-space exhaustion attacks.
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
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Finding #5: require auth so nonces are bound to a real user.
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const challenge = Buffer.from(bytes).toString("base64url");

  const redis = getUpstashRedis();
  if (redis) {
    // Store userId alongside the nonce so verifyIntegrityToken can bind nonce to user.
    await redis.set(
      `integrity_nonce:${challenge}`,
      authUser.userId,
      { ex: CHALLENGE_TTL_SECONDS },
    );
  }

  return NextResponse.json({ challenge, ttl: CHALLENGE_TTL_SECONDS });
}
