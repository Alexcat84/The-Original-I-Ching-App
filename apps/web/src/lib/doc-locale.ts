import { cookies } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";

/** Set client-side when Supabase reports a session; server uses it to pick doc language. */
export const SESSION_PRESENT_COOKIE = "iching_session_present";

/** Mirrors app UI locale (same as home `document.cookie` for `iching_ui_locale`). */
export const UI_LOCALE_COOKIE = "iching_ui_locale";

function isAppLocale(raw: string | undefined): raw is AppLocale {
  return Boolean(raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw));
}

/**
 * Locale for legal/docs server pages:
 * - Not logged in (no session cookie): always English.
 * - Logged in: `iching_ui_locale` when valid, else `DEFAULT_LOCALE` (English).
 */
export async function resolveDocLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get(SESSION_PRESENT_COOKIE)?.value === "1";
  if (!hasSession) {
    return "en";
  }
  const raw = cookieStore.get(UI_LOCALE_COOKIE)?.value;
  if (isAppLocale(raw)) {
    return raw;
  }
  return DEFAULT_LOCALE;
}
