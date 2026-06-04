import { google } from "googleapis";
import { getUpstashRedis } from "@/lib/rate-limit";

const PACKAGE_NAME = "com.theoriginaliching.app";

export interface IntegrityVerdict {
  passed: boolean;
  reason?: string;
  /** Structured environment data for Axiom logging — undefined when not available. */
  environment?: {
    playProtect: string | null;
    appsDetected: string[];
  };
}

// App access risk values that indicate active capture/control of the device.
// These represent a direct privacy threat during an oracle consultation.
const BLOCKING_APP_RISK = ["KNOWN_CAPTURING", "KNOWN_CONTROLLING", "UNKNOWN_CAPTURING", "UNKNOWN_CONTROLLING"];

// Play Protect verdicts that indicate confirmed malware on the device.
const BLOCKING_PLAY_PROTECT = ["MALWARE_DETECTED"];

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
 * Checks (in order):
 *  1. Nonce present, valid, belongs to userId, single-use (Redis).
 *  2. appRecognitionVerdict === 'PLAY_RECOGNIZED'
 *  3. deviceRecognitionVerdict includes 'MEETS_DEVICE_INTEGRITY'
 *  4. playProtectVerdict — blocks on MALWARE_DETECTED; logs all others.
 *  5. appAccessRiskVerdict — blocks on active capturing/controlling apps;
 *     logs installs without blocking (avoid false positives from accessibility apps).
 *
 * Fail-open / fail-closed:
 *  - Missing credentials in prod → fail-closed.
 *  - Redis unavailable in prod → fail-closed.
 *  - 4xx Google API → fail-closed.
 *  - 5xx / transient → fail-closed unless INTEGRITY_FAIL_OPEN=true.
 *  - NODE_ENV !== production → always passes (dev / emulator).
 *
 * @param token  Play Integrity attestation token from the Android app.
 * @param userId Authenticated user id (Bearer token) — nonce is bound to this.
 */
export async function verifyIntegrityToken(token: string, userId: string): Promise<IntegrityVerdict> {
  if (process.env.NODE_ENV !== "production") {
    return { passed: true };
  }

  const auth = getAuthClient();
  if (!auth) {
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

    // ── 1. Nonce validation ──────────────────────────────────────────────────
    const nonce = payload.requestDetails?.nonce;
    if (!nonce) return { passed: false, reason: "missing_nonce" };

    const redis = getUpstashRedis();
    if (!redis) {
      console.error("[play-integrity] Upstash Redis unavailable — cannot verify nonce in production");
      return { passed: false, reason: "redis_unavailable" };
    }

    const storedUserId = await redis.get<string>(`integrity_nonce:${nonce}`);
    if (!storedUserId) return { passed: false, reason: "nonce_invalid_or_expired" };
    if (storedUserId !== userId) return { passed: false, reason: "nonce_user_mismatch" };
    await redis.del(`integrity_nonce:${nonce}`); // single-use

    // ── 2. App recognition ───────────────────────────────────────────────────
    const appVerdict = payload.appIntegrity?.appRecognitionVerdict;
    if (appVerdict !== "PLAY_RECOGNIZED") {
      return { passed: false, reason: `app_verdict:${appVerdict}` };
    }

    // ── 3. Device integrity ──────────────────────────────────────────────────
    const deviceVerdicts = payload.deviceIntegrity?.deviceRecognitionVerdict ?? [];
    if (!deviceVerdicts.includes("MEETS_DEVICE_INTEGRITY")) {
      return { passed: false, reason: `device_verdict:${deviceVerdicts.join(",")}` };
    }

    // ── 4. Play Protect status ───────────────────────────────────────────────
    const playProtect = (payload as any).environmentDetails?.playProtectVerdict as string | undefined ?? null;
    if (playProtect && BLOCKING_PLAY_PROTECT.includes(playProtect)) {
      return {
        passed: false,
        reason: `play_protect:${playProtect}`,
        environment: { playProtect, appsDetected: [] },
      };
    }

    // ── 5. App access risk ───────────────────────────────────────────────────
    const appsDetected: string[] =
      (payload as any).environmentDetails?.appAccessRiskVerdict?.appsDetected ?? [];

    const activeRisk = appsDetected.filter((v) => BLOCKING_APP_RISK.includes(v));
    if (activeRisk.length > 0) {
      // Active screen capture or device control detected — privacy threat.
      return {
        passed: false,
        reason: `app_access_risk:${activeRisk.join(",")}`,
        environment: { playProtect, appsDetected },
      };
    }

    return {
      passed: true,
      environment: { playProtect, appsDetected },
    };
  } catch (err: unknown) {
    const httpStatus = (err as { response?: { status?: number } })?.response?.status;
    if (typeof httpStatus === "number" && httpStatus >= 400 && httpStatus < 500) {
      return { passed: false, reason: `api_4xx:${httpStatus}` };
    }
    console.error("[play-integrity] transient verification error:", err);
    if (process.env.INTEGRITY_FAIL_OPEN === "true") {
      return { passed: true };
    }
    return { passed: false, reason: "transient_error" };
  }
}
