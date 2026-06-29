import {
  getMutationRuleBookText,
  type MutationSystem,
} from "@iching-oracle/iching-data";
import {
  getMutationRuleTranslation,
  getMutationRuleSummaryLabel,
  type AppLocale,
} from "@iching-oracle/i18n";

export type MutationRuleDisplay = {
  originalEn: string;
  translation: string | null;
};

const ORACLE_BONES_RULE = "ORACLE_BONES";

function resolveSystem(lineReadingSystem: "huang" | "zhuxi"): MutationSystem {
  return lineReadingSystem === "zhuxi" ? "zhuxi" : "huang";
}

/** Mutation Explorer / verification: gold bookText EN + locale translation. */
export function formatMutationRuleForUi(params: {
  mutationRule: string;
  lineReadingSystem: "huang" | "zhuxi";
  locale: AppLocale;
}): MutationRuleDisplay {
  const { mutationRule, lineReadingSystem, locale } = params;
  if (!mutationRule || mutationRule === ORACLE_BONES_RULE) {
    return { originalEn: "", translation: null };
  }

  const system = resolveSystem(lineReadingSystem);
  const originalEn = getMutationRuleBookText(system, mutationRule);
  const translation =
    locale === "en" ? null : getMutationRuleTranslation(locale, mutationRule);

  return { originalEn, translation };
}

/** Consultation record / PDF: one-line summary in the user's locale. */
export function formatMutationRuleSummaryForUi(params: {
  mutationRule: string;
  locale: AppLocale;
}): string {
  const { mutationRule, locale } = params;
  if (!mutationRule || mutationRule === ORACLE_BONES_RULE) return "";
  return getMutationRuleSummaryLabel(locale, mutationRule);
}
