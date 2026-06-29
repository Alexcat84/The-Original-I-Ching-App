/**
 * Mutation rule display helpers (MUT-08).
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Mutation rules have a single source of truth in `@iching-oracle/iching-data`
 * (gold bookText EN). UI must never invent copy or reuse the old ES `ruleExplanation`.
 *
 * TWO SURFACES (product decision, 2026-06-28)
 * -------------------------------------------
 * 1. Consultation record + PDF export → ONE short localized line (space constrained).
 *    Use `formatMutationRuleSummaryForUi`.
 * 2. Mutation Explorer ("Verificar tirada") → full gold EN + full locale translation.
 *    Use `formatMutationRuleForUi`.
 *
 * WHAT DRIVES HUANG vs ZHU XI (not Wilhelm/Legge/Zhou Yi)
 * -------------------------------------------------------
 * The user's **line reading system** selector (`lineReadingSystem`: `huang` | `zhuxi`)
 * from panel order: Traductor → Lectura de líneas → Método → Ejecución.
 * Persisted on `consultations.line_reading_system` (migration 074).
 *
 * - Translator (Wilhelm/Legge/Zhou Yi) affects hexagram texts only.
 * - `lineReadingSystem` affects mutation rule codes, prompt `mutationRuleBookText`,
 *   and all rule copy in UI/PDF/Explorer.
 *
 * The engine emits different `mutationRule` enum codes per system in most cases
 * (e.g. Huang `THREE_MIDDLE` vs Zhu Xi `ZX_THREE_JUDGMENTS`). Exception: Qian/Kun
 * with all six lines changing share `QIAN_ALL_NINE` / `KUN_ALL_SIX` — those call
 * sites must pass `lineReadingSystem` so summary and translation pick Huang vs Zhu Xi.
 *
 * @see docs/auditorias/20260628-AUD-MUT-08-mutation-rules-ssot-antigravity-audit.md §7
 * @see packages/i18n/src/messages/iching-mutation-summary-ui.ts
 * @see packages/i18n/src/messages/iching-mutation-ui.ts
 */
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
    locale === "en"
      ? null
      : getMutationRuleTranslation(locale, mutationRule, system);

  return { originalEn, translation };
}

/** Consultation record / PDF: one-line summary in the user's locale. */
export function formatMutationRuleSummaryForUi(params: {
  mutationRule: string;
  lineReadingSystem: "huang" | "zhuxi";
  locale: AppLocale;
}): string {
  const { mutationRule, lineReadingSystem, locale } = params;
  if (!mutationRule || mutationRule === ORACLE_BONES_RULE) return "";
  return getMutationRuleSummaryLabel(locale, mutationRule, lineReadingSystem);
}
