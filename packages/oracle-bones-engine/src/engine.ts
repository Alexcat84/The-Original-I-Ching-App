import type { OracleBonesCastResult, OracleBonesVerdict, PerformOracleBonesOptions } from "./types.js";

export type Rng = () => number;

const WEIGHTS: Array<{ id: number; p: number }> = [
  { id: 1, p: 0.25 },
  { id: 2, p: 0.2 },
  { id: 3, p: 0.2 },
  { id: 4, p: 0.2 },
  { id: 5, p: 0.15 },
];

function newId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `ob-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function rollCrackPattern(rng: Rng = Math.random): number {
  const u = rng();
  let acc = 0;
  for (const w of WEIGHTS) {
    acc += w.p;
    if (u < acc) return w.id;
  }
  return 5;
}

function verdictForPattern(patternId: number): { verdict: OracleBonesVerdict; affirmsPositive: boolean | null } {
  switch (patternId) {
    case 1:
      return { verdict: "auspicious_clear", affirmsPositive: true };
    case 2:
      return { verdict: "auspicious_moderate", affirmsPositive: true };
    case 3:
      return { verdict: "inauspicious_moderate", affirmsPositive: false };
    case 4:
      return { verdict: "inauspicious_clear", affirmsPositive: false };
    default:
      return { verdict: "silent", affirmsPositive: null };
  }
}

/**
 * Shang-style oracle bone draw: indeterminate (5) may repeat up to 3 times; then "silent ancestors".
 */
export function performOracleBonesCast(
  positiveCharge: string,
  negativeCharge: string,
  medium: OracleBonesCastResult["medium"],
  options?: PerformOracleBonesOptions,
): OracleBonesCastResult {
  const rng = options?.rng ?? Math.random;
  let ambiguousPasses = 0;
  let patternId = 5;

  for (;;) {
    const draw = rollCrackPattern(rng);
    if (draw !== 5) {
      patternId = draw;
      break;
    }
    ambiguousPasses += 1;
    if (ambiguousPasses >= 3) {
      patternId = 5;
      break;
    }
  }

  const { verdict, affirmsPositive } = verdictForPattern(patternId);

  return {
    id: options?.id ?? newId(),
    patternId,
    verdict,
    ambiguousPasses,
    affirmsPositive,
    positiveCharge: positiveCharge.trim(),
    negativeCharge: negativeCharge.trim(),
    medium,
  };
}

export function defaultNegativeCharge(positiveCharge: string, language: string): string {
  const p = positiveCharge.trim().replace(/\s+/g, " ");
  if (!p) return "";
  if (language.startsWith("en")) {
    return `It will not be the case that: ${p.replace(/\.$/, "")}.`;
  }
  return `No se confirma que: ${p.replace(/\.$/, "")}.`;
}
