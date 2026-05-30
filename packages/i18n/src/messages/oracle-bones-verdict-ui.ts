import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/** Mirrors `OracleBonesVerdict` from `@iching-oracle/oracle-bones-engine` (kept local to avoid a cross-package dependency). */
export type OracleBonesVerdictKey =
  | "auspicious_clear"
  | "auspicious_moderate"
  | "inauspicious_moderate"
  | "inauspicious_clear";

const ORACLE_BONES_VERDICT_UI: Record<
  AppLocale,
  Record<OracleBonesVerdictKey, string>
> = {
  es: {
    auspicious_clear: "吉: favorable claro (carga positiva)",
    auspicious_moderate: "吉: favorable moderado",
    inauspicious_moderate: "凶: desfavorable moderado",
    inauspicious_clear: "凶: desfavorable claro (carga negativa)",
  },
  en: {
    auspicious_clear: "吉: clear favorable (positive charge)",
    auspicious_moderate: "吉: moderate favorable",
    inauspicious_moderate: "凶: moderate unfavorable",
    inauspicious_clear: "凶: clear unfavorable (negative charge)",
  },
  pt: {
    auspicious_clear: "吉: favorável claro (carga positiva)",
    auspicious_moderate: "吉: favorável moderado",
    inauspicious_moderate: "凶: desfavorável moderado",
    inauspicious_clear: "凶: desfavorável claro (carga negativa)",
  },
  fr: {
    auspicious_clear: "吉: favorable net (charge positive)",
    auspicious_moderate: "吉: favorable modéré",
    inauspicious_moderate: "凶: défavorable modéré",
    inauspicious_clear: "凶: défavorable net (charge négative)",
  },
  de: {
    auspicious_clear: "吉: klar günstig (positive Ladung)",
    auspicious_moderate: "吉: mäßig günstig",
    inauspicious_moderate: "凶: mäßig ungünstig",
    inauspicious_clear: "凶: klar ungünstig (negative Ladung)",
  },
  it: {
    auspicious_clear: "吉: favorevole chiaro (carica positiva)",
    auspicious_moderate: "吉: favorevole moderato",
    inauspicious_moderate: "凶: sfavorevole moderato",
    inauspicious_clear: "凶: sfavorevole chiaro (carica negativa)",
  },
  ja: {
    auspicious_clear: "吉：明確に吉（正の荷）",
    auspicious_moderate: "吉：中庸の吉",
    inauspicious_moderate: "凶：中庸の凶",
    inauspicious_clear: "凶：明確に凶（負の荷）",
  },
  zh: {
    auspicious_clear: "吉：明确吉（正向命题）",
    auspicious_moderate: "吉：中度吉",
    inauspicious_moderate: "凶：中度凶",
    inauspicious_clear: "凶：明确凶（负向命题）",
  },
  ko: {
    auspicious_clear: "吉: 뚜렷한 길(긍정 전하)",
    auspicious_moderate: "吉: 보통의 길",
    inauspicious_moderate: "凶: 보통의 흉",
    inauspicious_clear: "凶: 뚜렷한 흉(부정 전하)",
  },
  ar: {
    auspicious_clear: "吉: إيجابي واضح (شحنة موجبة)",
    auspicious_moderate: "吉: إيجابي معتدل",
    inauspicious_moderate: "凶: سلبي معتدل",
    inauspicious_clear: "凶: سلبي واضح (شحنة سالبة)",
  },
  hi: {
    auspicious_clear: "吉: स्पष्ट शुभ (सकारात्मक प्रस्ताव)",
    auspicious_moderate: "吉: मध्यम शुभ",
    inauspicious_moderate: "凶: मध्यम अशुभ",
    inauspicious_clear: "凶: स्पष्ट अशुभ (नकारात्मक प्रस्ताव)",
  },
};

export function getOracleBonesVerdictLabel(
  locale: AppLocale,
  verdict: OracleBonesVerdictKey,
): string {
  const map = ORACLE_BONES_VERDICT_UI[locale] ?? ORACLE_BONES_VERDICT_UI[DEFAULT_LOCALE];
  return map[verdict];
}
