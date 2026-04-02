import { cookies } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";
import { SESSION_PRESENT_COOKIE, UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";

export { SESSION_PRESENT_COOKIE, UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";

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
