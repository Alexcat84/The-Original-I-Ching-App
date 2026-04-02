import type { OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";

/**
 * Simplified-Chinese glyph(s) composited on oracle-bone imagery (matches I Ching overlay font stack + embed path).
 * "Silent" uses 沉默 — literal "silence" in modern Chinese.
 */
export function oracleBonesVerdictChinese(verdict: OracleBonesVerdict): string {
  switch (verdict) {
    case "auspicious_clear":
    case "auspicious_moderate":
      return "吉";
    case "inauspicious_moderate":
    case "inauspicious_clear":
      return "凶";
    case "silent":
      return "沉默";
  }
}
