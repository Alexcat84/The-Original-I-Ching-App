const BASE_URL = "https://theoriginaliching.com";
const HREFLANG_LOCALES = ["en", "es", "pt", "fr", "de", "it", "ja", "zh", "ko"];

export function buildCanonicalMetadata(path: string) {
  const canonical = `${BASE_URL}${path}`;
  const languages: Record<string, string> = { "x-default": canonical };
  for (const locale of HREFLANG_LOCALES) {
    languages[locale] = canonical;
  }
  return { alternates: { canonical, languages } };
}
