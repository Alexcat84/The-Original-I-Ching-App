import * as Sentry from "@sentry/nextjs";

type IntegritySentrySource = "consult" | "client_event" | "challenge";

export interface IntegritySentryPayload {
  source: IntegritySentrySource;
  reason: string;
  traceId?: string | null;
  userId?: string | null;
  phase?: string;
  extra?: Record<string, unknown>;
}

function sentryLevelForReason(reason: string): Sentry.SeverityLevel {
  if (
    reason === "misconfigured" ||
    reason === "redis_unavailable" ||
    reason === "transient_error"
  ) {
    return "error";
  }
  if (
    reason.startsWith("device_verdict:") ||
    reason.startsWith("app_verdict:") ||
    reason.startsWith("play_protect:") ||
    reason.startsWith("app_access_risk:")
  ) {
    return "info";
  }
  return "warning";
}

/** Production-only — mirrors Axiom integrity events for Sentry alerts. */
export function captureIntegrityToSentry(
  message: string,
  payload: IntegritySentryPayload,
): void {
  if (process.env.VERCEL_ENV !== "production") return;

  Sentry.captureMessage(message, {
    level: sentryLevelForReason(payload.reason),
    tags: {
      api: "integrity",
      source: payload.source,
      reason: payload.reason,
      ...(payload.phase ? { phase: payload.phase } : {}),
    },
    extra: {
      traceId: payload.traceId ?? null,
      userId: payload.userId ?? null,
      ...payload.extra,
    },
  });
}

const CLIENT_EVENT_SENTRY_PHASES = new Set([
  "attest_error",
  "bridge_stale_fallback",
  "bridge_timeout",
  "challenge_http",
]);

export function shouldReportIntegrityClientEvent(
  phase: string,
  ok: boolean,
): boolean {
  if (!ok) return true;
  return CLIENT_EVENT_SENTRY_PHASES.has(phase);
}
