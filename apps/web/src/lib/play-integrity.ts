import { google } from "googleapis";
import { getUpstashRedis } from "@/lib/rate-limit";

const PACKAGE_NAME = "com.theoriginaliching.app";

export interface IntegrityVerdict {
  passed: boolean;
  reason?: string;
}

function getAuthClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const credentials = JSON.parse(raw);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/playintegrity"],
    });
  } catch {
    return null;
  }
}

/**
 * Verifies a Play Integrity token issued by the Android app.
 *
 * Fail-open / fail-closed policy:
 *  - 4xx from Google API (invalid token, bad packageName): ALWAYS fail-closed.
 *  - Credentials missing in production: ALWAYS fail-closed.
 *  - Redis unavailable in production: ALWAYS fail-closed (nonce cannot be checked).
 *  - 5xx / network / transient: fail-CLOSED by default.
 *    Set INTEGRITY_FAIL_OPEN=true to allow consultations during Google API outages
 *    (trade security for availability — operators opt in deliberately).
 *  - NODE_ENV !== production: always passes (emulator / dev build support).
 */
/**
 * @param token  The Play Integrity attestation token from the Android app.
 * @param userId The authenticated user id from the Bearer token (for nonce binding).
 */
export async function verifyIntegrityToken(token: string, userId: string): Promise<IntegrityVerdict> {
  if (process.env.NODE_ENV !== "production") {
    return { passed: true };
  }

  const auth = getAuthClient();
  if (!auth) {
    // Finding #3: missing credentials in prod → fail-closed, not skip.
    console.error("[play-integrity] GOOGLE_SERVICE_ACCOUNT_JSON absent or invalid in production");
    return { passed: false, reason: "misconfigured" };
  }

  try {
    const playintegrity = google.playintegrity({ version: "v1", auth });
    const res = await playintegrity.v1.decodeIntegrityToken({
      packageName: PACKAGE_NAME,
      requestBody: { integrityToken: token },
    });

    const payload = res.data.tokenPayloadExternal;
    if (!payload) return { passed: false, reason: "empty_payload" };

    // Finding #2: nonce MUST be present — tokens without a nonce are not bound
    // to a server-issued challenge and cannot be replay-protected.
    const nonce = payload.requestDetails?.nonce;
    if (!nonce) return { passed: false, reason: "missing_nonce" };

    const redis = getUpstashRedis();
    if (!redis) {
      // Finding #2: in production Redis is required for nonce bookkeeping.
      // Without it we cannot detect replayed tokens.
      console.error("[play-integrity] Upstash Redis unavailable — cannot verify nonce in production");
      return { passed: false, reason: "redis_unavailable" };
    }

    const storedUserId = await redis.get<string>(`integrity_nonce:${nonce}`);
    if (!storedUserId) return { passed: false, reason: "nonce_invalid_or_expired" };
    // Nonce must belong to the authenticated user making this request.
    if (storedUserId !== userId) return { passed: false, reason: "nonce_user_mismatch" };
    // Single-use: consume immediately after first successful lookup.
    await redis.del(`integrity_nonce:${nonce}`);

    const appVerdict = payload.appIntegrity?.appRecognitionVerdict;
    if (appVerdict !== "PLAY_RECOGNIZED") {
      return { passed: false, reason: `app_verdict:${appVerdict}` };
    }

    const deviceVerdicts = payload.deviceIntegrity?.deviceRecognitionVerdict ?? [];
    if (!deviceVerdicts.includes("MEETS_DEVICE_INTEGRITY")) {
      return { passed: false, reason: `device_verdict:${deviceVerdicts.join(",")}` };
    }

    return { passed: true };
  } catch (err: unknown) {
    // Finding #1: distinguish permanent errors from transient ones.
    const httpStatus = (err as { response?: { status?: number } })?.response?.status;

    if (typeof httpStatus === "number" && httpStatus >= 400 && httpStatus < 500) {
      // 4xx: invalid token, bad package name, INVALID_ARGUMENT → always fail-closed.
      return { passed: false, reason: `api_4xx:${httpStatus}` };
    }

    // 5xx / network / timeout: fail-closed by default.
    // Operators may set INTEGRITY_FAIL_OPEN=true to allow consultations
    // during documented Google API outages.
    console.error("[play-integrity] transient verification error:", err);
    if (process.env.INTEGRITY_FAIL_OPEN === "true") {
      return { passed: true };
    }
    return { passed: false, reason: "transient_error" };
  }
}
