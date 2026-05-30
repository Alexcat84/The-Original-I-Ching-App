import type { AppLocale } from "../locales.js";

/** Native language names for the locale selector (each shown in its own script). */
const LANGUAGE_LABELS: Record<AppLocale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  ja: "日本語",
  zh: "中文",
  ko: "한국어",
  ar: "العربية",
  hi: "हिन्दी",
};

export function getLanguageLabels(): Record<AppLocale, string> {
  return LANGUAGE_LABELS;
}
