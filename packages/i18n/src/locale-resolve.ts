import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "./locales.js";

export function isAppLocale(raw: string | null | undefined): raw is AppLocale {
  return Boolean(raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw));
}

/** Parse UI locale from cookie, storage, or `Accept-Language` fragments. */
export function parseAppLocale(raw: string | null | undefined): AppLocale {
  if (!raw) return DEFAULT_LOCALE;
  const t = raw.trim().toLowerCase();
  if (isAppLocale(t)) return t;
  return DEFAULT_LOCALE;
}
