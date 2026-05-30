import type { MutationRule } from "@iching-oracle/iching-engine";
import type { OracleBonesVerdict, OracleBoneMedium } from "@iching-oracle/oracle-bones-engine";
import { getHomeChromeUiMessages, parseAppLocale } from "@iching-oracle/i18n";

export type TierKey = "free" | "seeker" | "practitioner" | "master" | "oracle";

export type OracleType = "iching" | "oracle_bones";

export interface OracleBonesHistorySnapshot {
  pattern_id: number;
  verdict: OracleBonesVerdict;
  positive_charge: string;
  negative_charge: string;
  medium: OracleBoneMedium;
}

export interface ConsultationSummary {
  position: number;
  question: string;
  primaryHexagramNumber: number;
  primaryHexagramName: string;
  primaryHexagramChinese: string;
  transformedHexagramName: string | null;
  changingLines: number[];
  mutationRule: MutationRule | "ORACLE_BONES";
  interpretationSummary: string;
  oracleType: OracleType;
  oracleBones?: OracleBonesHistorySnapshot;
}

export interface SessionContext {
  sessionId: string;
  theme: string;
  previousConsultations: ConsultationSummary[];
  patternHints: string | null;
}

/** sessionDepth = máximo de consultas en un mismo hilo (incl. la primera). No es límite de tokens. */
export const CONTEXT_LIMITS: Record<
  TierKey,
  { sessionDepth: number; historyCount: number }
> = {
  /** Free lifetime trial has no thread continuity. */
  free: { sessionDepth: 1, historyCount: 0 },
  seeker: { sessionDepth: 3, historyCount: 0 },
  practitioner: { sessionDepth: 5, historyCount: 0 },
  master: { sessionDepth: 8, historyCount: 10 },
  oracle: { sessionDepth: 12, historyCount: 30 },
};

export const CONTEXT_COST_PER_PRIOR = 0.00024;

export interface ConsultationHistoryRow {
  primary_hexagram_number: number;
  primary_hexagram_name: string;
  category: string;
  created_at: string;
}

export function buildPatternHintsFromHistory(
  history: ConsultationHistoryRow[],
  historyCount: number,
  language: "es" | "en",
): string | null {
  const slice = history.slice(0, historyCount);
  if (slice.length < 3) return null;

  const hexCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  for (const c of slice) {
    hexCounts[c.primary_hexagram_name] = (hexCounts[c.primary_hexagram_name] ?? 0) + 1;
    catCounts[c.category] = (catCounts[c.category] ?? 0) + 1;
  }

  const topHex = Object.entries(hexCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => `${name} (${count}x)`)
    .join(", ");

  const topCat = Object.entries(catCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "general";

  if (language === "en") {
    return `HISTORICAL PATTERNS (last ${slice.length} consultations):
Most frequent hexagrams: ${topHex}
Main thematic category: ${topCat}
Consultations analyzed: ${slice.length}`;
  }

  return `PATRONES HISTÓRICOS DEL CONSULTANTE (últimas ${slice.length} consultas):
Hexagramas más frecuentes: ${topHex}
Categoría temática principal: ${topCat}
Total de consultas analizadas: ${slice.length}`;
}

export interface PreviousConsultationRow {
  session_position: number;
  question: string;
  primary_hexagram_number: number;
  primary_hexagram_name: string;
  primary_hexagram_chinese: string;
  transformed_hexagram_name: string | null;
  changing_lines: number[];
  mutation_rule: string;
  interpretation: string;
    interpretation_summary?: string;
  oracle_type?: OracleType;
  oracle_bones?: OracleBonesHistorySnapshot;
}

export function summarizePreviousConsultations(
  rows: PreviousConsultationRow[],
  maxPrior: number,
): ConsultationSummary[] {
  return rows.slice(0, maxPrior).map((c) => ({
    position: c.session_position,
    question: c.question,
    primaryHexagramNumber: c.primary_hexagram_number,
    primaryHexagramName: c.primary_hexagram_name,
    primaryHexagramChinese: c.primary_hexagram_chinese,
    transformedHexagramName: c.transformed_hexagram_name,
    changingLines: c.changing_lines,
    mutationRule: (c.oracle_type === "oracle_bones" ? "ORACLE_BONES" : c.mutation_rule) as
      | MutationRule
      | "ORACLE_BONES",
    interpretationSummary: c.interpretation_summary || c.interpretation.slice(0, 200),
    oracleType: c.oracle_type ?? "iching",
    oracleBones: c.oracle_bones,
  }));
}

export function resolveSessionContext(params: {
  tier: TierKey;
  sessionId: string | null;
  isDeepening: boolean;
  sessionTitle: string | null;
  previousRows: PreviousConsultationRow[];
  patternHints: string | null;
  locale?: string | null;
}): SessionContext | null {
  const limits = CONTEXT_LIMITS[params.tier];
  if (limits.sessionDepth <= 1) return null;
  if (!params.sessionId || !params.isDeepening) return null;

  const maxPrior = Math.max(0, limits.sessionDepth - 1);
  const previousConsultations = summarizePreviousConsultations(params.previousRows, maxPrior);
  if (previousConsultations.length === 0) return null;

  const locale = parseAppLocale(params.locale ?? undefined);
  const chrome = getHomeChromeUiMessages(locale);

  return {
    sessionId: params.sessionId,
    theme: params.sessionTitle ?? chrome.consultationInProgress,
    previousConsultations,
    patternHints: params.patternHints,
  };
}
