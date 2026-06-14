import * as Sentry from "@sentry/nextjs";
import {
  labelIntegrityFailure,
  type IntegrityFailureCategory,
} from "@/lib/integrity-failure-labels";

type IntegritySentrySource = "consult" | "client_event" | "challenge";

export interface IntegritySentryPayload {
  source: IntegritySentrySource;
  reason: string;
  traceId?: string | null;
  userId?: string | null;
  phase?: string;
  extra?: Record<string, unknown>;
}

function sentryLevelForCategory(category: IntegrityFailureCategory): Sentry.SeverityLevel {
  switch (category) {
    case "backend_error":
      return "error";
    case "app_verdict":
    case "device_verdict":
    case "environment_verdict":
    case "nonce_verdict":
      return "warning";
    default:
      return "info";
  }
}

/** Production-only — mirrors Axiom integrity events for Sentry alerts. */
export function captureIntegrityToSentry(
  message: string,
  payload: IntegritySentryPayload,
): void {
  if (process.env.VERCEL_ENV !== "production") return;

  const label = labelIntegrityFailure(payload.reason);
  const eventName = message === "integrity_check_failed" ? label.eventName : message;

  Sentry.captureMessage(eventName, {
    level: sentryLevelForCategory(label.category),
    tags: {
      api: "integrity",
      source: payload.source,
      reason: payload.reason,
      failure_category: label.category,
      ...(label.appVerdict ? { app_verdict: label.appVerdict } : {}),
      ...(label.deviceVerdict ? { device_verdict: label.deviceVerdict } : {}),
      ...(payload.phase ? { phase: payload.phase } : {}),
    },
    extra: {
      failureSummary: label.summary,
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
