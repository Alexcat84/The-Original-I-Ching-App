/**
 * Labels derived only from Play Integrity API verdicts / backend check outcomes.
 * No speculative copy (piracy, sideload, etc.) — only what Google or our checks report.
 */

export type IntegrityFailureCategory =
  | "app_verdict"
  | "device_verdict"
  | "environment_verdict"
  | "nonce_verdict"
  | "backend_error"
  | "other";

export interface IntegrityFailureLabel {
  category: IntegrityFailureCategory;
  /** Axiom/Sentry event name — derived from verdict type + value when available. */
  eventName: string;
  /** Factual one-liner quoting the reported verdict or check outcome. */
  summary: string;
  /** Google appRecognitionVerdict when reason is app_verdict:* */
  appVerdict: string | null;
  /** Google deviceRecognitionVerdict values when reason is device_verdict:* */
  deviceVerdict: string | null;
}

function parseVerdictSuffix(reason: string, prefix: string): string | null {
  if (!reason.startsWith(prefix)) return null;
  const value = reason.slice(prefix.length);
  return value.length > 0 ? value : null;
}

function appVerdictEventName(verdict: string): string {
  return `integrity_app_verdict_${verdict.toLowerCase()}`;
}

export function labelIntegrityFailure(reason: string): IntegrityFailureLabel {
  const appVerdict = parseVerdictSuffix(reason, "app_verdict:");
  if (appVerdict) {
    return {
      category: "app_verdict",
      eventName: appVerdictEventName(appVerdict),
      summary: `Google Play Integrity appRecognitionVerdict: ${appVerdict}`,
      appVerdict,
      deviceVerdict: null,
    };
  }

  const deviceVerdict = parseVerdictSuffix(reason, "device_verdict:");
  if (deviceVerdict) {
    return {
      category: "device_verdict",
      eventName: `integrity_device_verdict_${deviceVerdict.replace(/,/g, "_").toLowerCase()}`,
      summary: `Google Play Integrity deviceRecognitionVerdict: ${deviceVerdict}`,
      appVerdict: null,
      deviceVerdict,
    };
  }

  if (reason.startsWith("play_protect:")) {
    const verdict = reason.slice("play_protect:".length);
    return {
      category: "environment_verdict",
      eventName: `integrity_play_protect_${verdict.toLowerCase()}`,
      summary: `Google Play Integrity playProtectVerdict: ${verdict}`,
      appVerdict: null,
      deviceVerdict: null,
    };
  }

  if (reason.startsWith("app_access_risk:")) {
    const risks = reason.slice("app_access_risk:".length);
    return {
      category: "environment_verdict",
      eventName: "integrity_app_access_risk",
      summary: `Google Play Integrity appAccessRiskVerdict: ${risks}`,
      appVerdict: null,
      deviceVerdict: null,
    };
  }

  if (reason === "nonce_invalid_or_expired") {
    return {
      category: "nonce_verdict",
      eventName: "integrity_nonce_not_found",
      summary: "Integrity nonce not found in Redis after Google token decode",
      appVerdict: null,
      deviceVerdict: null,
    };
  }

  if (reason === "nonce_user_mismatch") {
    return {
      category: "nonce_verdict",
      eventName: "integrity_nonce_user_mismatch",
      summary: "Integrity nonce userId does not match authenticated user",
      appVerdict: null,
      deviceVerdict: null,
    };
  }

  if (
    reason === "misconfigured" ||
    reason === "redis_unavailable" ||
    reason === "transient_error"
  ) {
    return {
      category: "backend_error",
      eventName: "integrity_check_failed",
      summary: `Play Integrity backend check failed: ${reason}`,
      appVerdict: null,
      deviceVerdict: null,
    };
  }

  return {
    category: "other",
    eventName: "integrity_check_failed",
    summary: `Play Integrity check failed: ${reason}`,
    appVerdict: null,
    deviceVerdict: null,
  };
}

export function integrityFailureLogFields(
  reason: string,
): IntegrityFailureLabel & { reason: string } {
  const label = labelIntegrityFailure(reason);
  return { reason, ...label };
}
