/** Persisted choice for cookie / tracking consent (client only). */
export const COOKIE_CONSENT_STORAGE_KEY = "iching_cookie_consent_v1";

export type CookieConsentValue = "essential" | "all";

export function isCookieConsentValue(v: string | null): v is CookieConsentValue {
  return v === "essential" || v === "all";
}
