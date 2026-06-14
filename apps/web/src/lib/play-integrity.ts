import { google } from "googleapis";
import { getUpstashRedis } from "@/lib/rate-limit";
import {
  describeNonceShape,
  fingerprintIntegrityValue,
} from "@/lib/integrity-telemetry";

const PACKAGE_NAME = "com.theoriginaliching.app";

export interface IntegrityVerifyTelemetry {
  traceId: string | null;
  expectedNonceFp: string | null;
  googleNonceFp: string | null;
  nonceMatchExpected: boolean | null;
  redisHit: boolean;
  redisLookupVariant: "exact" | "trim_padding" | "miss";
  userIdMatch: boolean | null;
  tokenLen: number;
  googleNonceShape: ReturnType<typeof describeNonceShape> | null;
}

export interface IntegrityVerdict {
  passed: boolean;
  reason?: string;
  environment?: {
    playProtect: string | null;
    appsDetected: string[];
  };
  telemetry?: IntegrityVerifyTelemetry;
}

const BLOCKING_APP_RISK = ["KNOWN_CAPTURING", "KNOWN_CONTROLLING", "UNKNOWN_CAPTURING", "UNKNOWN_CONTROLLING"];
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

async function readExpectedNonceFp(
  redis: NonNullable<ReturnType<typeof getUpstashRedis>>,
  traceId: string | null,
): Promise<string | null> {
  if (!traceId) return null;
  try {
    const raw = await redis.get<string>(`integrity_trace:${traceId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { nonceFp?: string };
    return typeof parsed.nonceFp === "string" ? parsed.nonceFp : null;
  } catch {
    return null;
  }
}

async function lookupNonceUserId(
  redis: NonNullable<ReturnType<typeof getUpstashRedis>>,
  nonce: string,
): Promise<{ userId: string | null; variant: IntegrityVerifyTelemetry["redisLookupVariant"] }> {
  const exact = await redis.get<string>(`integrity_nonce:${nonce}`);
  if (exact) return { userId: exact, variant: "exact" };

  const trimmed = nonce.replace(/=+$/, "");
  if (trimmed !== nonce) {
    const padded = await redis.get<string>(`integrity_nonce:${trimmed}`);
    if (padded) return { userId: padded, variant: "trim_padding" };
  }

  return { userId: null, variant: "miss" };
}

export async function verifyIntegrityToken(
  token: string,
  userId: string,
  traceId: string | null = null,
): Promise<IntegrityVerdict> {
  const baseTelemetry: IntegrityVerifyTelemetry = {
    traceId,
    expectedNonceFp: null,
    googleNonceFp: null,
    nonceMatchExpected: null,
    redisHit: false,
    redisLookupVariant: "miss",
    userIdMatch: null,
    tokenLen: token.length,
    googleNonceShape: null,
  };

  if (process.env.NODE_ENV !== "production") {
    return { passed: true, telemetry: baseTelemetry };
  }

  const auth = getAuthClient();
  if (!auth) {
    console.error("[play-integrity] GOOGLE_SERVICE_ACCOUNT_JSON absent or invalid in production");
    return { passed: false, reason: "misconfigured", telemetry: baseTelemetry };
  }

  try {
    const playintegrity = google.playintegrity({ version: "v1", auth });
    const res = await playintegrity.v1.decodeIntegrityToken({
      packageName: PACKAGE_NAME,
      requestBody: { integrityToken: token },
    });

    const payload = res.data.tokenPayloadExternal;
    if (!payload) {
      return { passed: false, reason: "empty_payload", telemetry: baseTelemetry };
    }

    const nonce = payload.requestDetails?.nonce;
    if (!nonce) {
      return { passed: false, reason: "missing_nonce", telemetry: baseTelemetry };
    }

    const telemetry: IntegrityVerifyTelemetry = {
      ...baseTelemetry,
      googleNonceFp: fingerprintIntegrityValue(nonce),
      googleNonceShape: describeNonceShape(nonce),
    };

    const redis = getUpstashRedis();
    if (!redis) {
      console.error("[play-integrity] Upstash Redis unavailable — cannot verify nonce in production");
      return { passed: false, reason: "redis_unavailable", telemetry };
    }

    telemetry.expectedNonceFp = await readExpectedNonceFp(redis, traceId);
    if (telemetry.expectedNonceFp && telemetry.googleNonceFp) {
      telemetry.nonceMatchExpected = telemetry.expectedNonceFp === telemetry.googleNonceFp;
    }

    const lookup = await lookupNonceUserId(redis, nonce);
    telemetry.redisHit = lookup.userId !== null;
    telemetry.redisLookupVariant = lookup.variant;

    if (!lookup.userId) {
      return { passed: false, reason: "nonce_invalid_or_expired", telemetry };
    }

    telemetry.userIdMatch = lookup.userId === userId;
    if (!telemetry.userIdMatch) {
      return { passed: false, reason: "nonce_user_mismatch", telemetry };
    }

    const appVerdict = payload.appIntegrity?.appRecognitionVerdict;
    if (appVerdict !== "PLAY_RECOGNIZED") {
      return { passed: false, reason: `app_verdict:${appVerdict}`, telemetry };
    }

    const deviceVerdicts = payload.deviceIntegrity?.deviceRecognitionVerdict ?? [];
    if (!deviceVerdicts.includes("MEETS_DEVICE_INTEGRITY")) {
      return {
        passed: false,
        reason: `device_verdict:${deviceVerdicts.join(",")}`,
        telemetry,
      };
    }

    const playProtect =
      (payload as { environmentDetails?: { playProtectVerdict?: string } }).environmentDetails
        ?.playProtectVerdict ?? null;
    if (playProtect && BLOCKING_PLAY_PROTECT.includes(playProtect)) {
      return {
        passed: false,
        reason: `play_protect:${playProtect}`,
        environment: { playProtect, appsDetected: [] },
        telemetry,
      };
    }

    const appsDetected: string[] =
      (payload as { environmentDetails?: { appAccessRiskVerdict?: { appsDetected?: string[] } } })
        .environmentDetails?.appAccessRiskVerdict?.appsDetected ?? [];

    const activeRisk = appsDetected.filter((v) => BLOCKING_APP_RISK.includes(v));
    if (activeRisk.length > 0) {
      return {
        passed: false,
        reason: `app_access_risk:${activeRisk.join(",")}`,
        environment: { playProtect, appsDetected },
        telemetry,
      };
    }

    const redisKey =
      lookup.variant === "trim_padding" ? nonce.replace(/=+$/, "") : nonce;
    await redis.del(`integrity_nonce:${redisKey}`);

    return {
      passed: true,
      environment: { playProtect, appsDetected },
      telemetry,
    };
  } catch (err: unknown) {
    const httpStatus = (err as { response?: { status?: number } })?.response?.status;
    if (typeof httpStatus === "number" && httpStatus >= 400 && httpStatus < 500) {
      return { passed: false, reason: `api_4xx:${httpStatus}`, telemetry: baseTelemetry };
    }
    console.error("[play-integrity] transient verification error:", err);
    if (process.env.INTEGRITY_FAIL_OPEN === "true") {
      return { passed: true, telemetry: baseTelemetry };
    }
    return { passed: false, reason: "transient_error", telemetry: baseTelemetry };
  }
}
