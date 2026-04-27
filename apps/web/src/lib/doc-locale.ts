import { cookies } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";
import { UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";

export { SESSION_PRESENT_COOKIE, UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";

function isAppLocale(raw: string | undefined): raw is AppLocale {
  return Boolean(raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw));
}

/**
 * Locale for legal/docs server pages.
 * Prefers `iching_ui_locale` when set (matches the in-app language selector), so /privacy, /terms, etc.
 * align with the UI even before session cookies are present.
 */
export async function resolveDocLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(UI_LOCALE_COOKIE)?.value;
  if (isAppLocale(raw)) {
    return raw;
  }
  return DEFAULT_LOCALE;
}
