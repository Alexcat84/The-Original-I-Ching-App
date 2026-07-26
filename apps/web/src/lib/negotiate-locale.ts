import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";

const SUPPORTED = new Set<string>(SUPPORTED_LOCALES);

/**
 * Best-match locale from an `Accept-Language` header among the 11 supported
 * locales. Used ONLY on the first visit (no `iching_ui_locale` cookie yet); the
 * cookie is authoritative afterwards.
 *
 * All supported locales are primary two-letter codes (no region variants), so a
 * region-tagged preference resolves by its primary subtag: `pt-BR` -> `pt`,
 * `zh-TW` -> `zh`, `en-US` -> `en`. Anything unsupported falls back to the
 * default locale.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): AppLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part, i) => {
      const [rawTag, ...params] = part.trim().split(";");
      let q = 1;
      for (const p of params) {
        const m = p.trim().match(/^q=(\d(?:\.\d+)?)$/i);
        if (m) q = Number.parseFloat(m[1]);
      }
      return { tag: rawTag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0, i };
    })
    .filter((x) => x.tag && x.tag !== "*")
    // Highest q first; preserve source order for equal q (stable).
    .sort((a, b) => b.q - a.q || a.i - b.i);

  for (const { tag } of ranked) {
    const primary = tag.split("-")[0];
    if (SUPPORTED.has(primary)) return primary as AppLocale;
  }
  return DEFAULT_LOCALE;
}
