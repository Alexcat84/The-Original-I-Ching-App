export const CURRENT_TERMS_VERSION = "terms-2026-04-01";
export const CURRENT_PRIVACY_VERSION = "privacy-2026-04-01";
export const LEGAL_CONSENT_PENDING_STORAGE_KEY = "iching_legal_consent_pending_v1";

/** Stored on auth.users.user_metadata at email sign-up when the session is created only after email confirmation. */
export const PENDING_EMAIL_LEGAL_METADATA_KEY = "iching_pending_legal_consent_v1";

export type LegalConsentSource = "email_signup" | "google_oauth" | "post_login";

export type LegalConsentPayload = {
  accepted: true;
  termsVersion: string;
  privacyVersion: string;
  acceptedAt: string;
  source: LegalConsentSource;
};

export function createLegalConsentPayload(source: LegalConsentSource): LegalConsentPayload {
  return {
    accepted: true,
    termsVersion: CURRENT_TERMS_VERSION,
    privacyVersion: CURRENT_PRIVACY_VERSION,
    acceptedAt: new Date().toISOString(),
    source,
  };
}

export function isCurrentLegalConsentPayload(value: unknown): value is LegalConsentPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<LegalConsentPayload>;
  return (
    payload.accepted === true &&
    payload.termsVersion === CURRENT_TERMS_VERSION &&
    payload.privacyVersion === CURRENT_PRIVACY_VERSION &&
    typeof payload.acceptedAt === "string" &&
    (payload.source === "email_signup" || payload.source === "google_oauth" || payload.source === "post_login")
  );
}

/** Pending consent in user_metadata may be a JSON object (preferred) or legacy JSON string. */
export function parsePendingEmailLegalConsentFromUserMetadata(raw: unknown): LegalConsentPayload | null {
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }
  if (!isCurrentLegalConsentPayload(value)) return null;
  if (value.source !== "email_signup") return null;
  return value;
}
