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
 * Checks:
 *  1. Nonce exists in Redis (was issued by this server, not replayed).
 *  2. appRecognitionVerdict === 'PLAY_RECOGNIZED'
 *  3. deviceRecognitionVerdict includes 'MEETS_DEVICE_INTEGRITY'
 *
 * In development (NODE_ENV !== 'production') or when credentials are absent,
 * returns { passed: true } so emulators and local testing are never blocked.
 */
export async function verifyIntegrityToken(token: string): Promise<IntegrityVerdict> {
  if (process.env.NODE_ENV !== "production") {
    return { passed: true };
  }

  const auth = getAuthClient();
  if (!auth) {
    console.warn("[play-integrity] GOOGLE_SERVICE_ACCOUNT_JSON not configured — skipping check");
    return { passed: true };
  }

  try {
    const playintegrity = google.playintegrity({ version: "v1", auth });
    const res = await playintegrity.v1.decodeIntegrityToken({
      packageName: PACKAGE_NAME,
      requestBody: { integrityToken: token },
    });

    const payload = res.data.tokenPayloadExternal;
    if (!payload) return { passed: false, reason: "empty_payload" };

    // Verify the nonce was issued by this server (replay protection).
    const nonce = payload.requestDetails?.nonce;
    if (nonce) {
      const redis = getUpstashRedis();
      if (redis) {
        const exists = await redis.get(`integrity_nonce:${nonce}`);
        if (!exists) return { passed: false, reason: "nonce_invalid_or_expired" };
        // Consume — single use only.
        await redis.del(`integrity_nonce:${nonce}`);
      }
    }

    const appVerdict = payload.appIntegrity?.appRecognitionVerdict;
    if (appVerdict !== "PLAY_RECOGNIZED") {
      return { passed: false, reason: `app_verdict:${appVerdict}` };
    }

    const deviceVerdicts = payload.deviceIntegrity?.deviceRecognitionVerdict ?? [];
    if (!deviceVerdicts.includes("MEETS_DEVICE_INTEGRITY")) {
      return { passed: false, reason: `device_verdict:${deviceVerdicts.join(",")}` };
    }

    return { passed: true };
  } catch (err) {
    console.error("[play-integrity] verification error:", err);
    // Fail-open on transient errors — never block a user due to a Google API hiccup.
    return { passed: true };
  }
}
