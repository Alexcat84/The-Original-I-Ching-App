import type { OracleBonesCastResult, OracleBonesVerdict, PerformOracleBonesOptions } from "./types.js";

export type Rng = () => number;

// Proportional redistribution of original weights after removing the silent verdict (was 15%).
// Original ratios preserved: auspicious_clear 25/85, others 20/85 each.
const WEIGHTS: Array<{ id: number; p: number }> = [
  { id: 1, p: 0.2941 }, // auspicious_clear   ~29.4%
  { id: 2, p: 0.2353 }, // auspicious_moderate ~23.5%
  { id: 3, p: 0.2353 }, // inauspicious_moderate ~23.5%
  { id: 4, p: 0.2353 }, // inauspicious_clear  ~23.5%
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
  return 4;
}

function verdictForPattern(patternId: number): { verdict: OracleBonesVerdict; affirmsPositive: boolean } {
  switch (patternId) {
    case 1:
      return { verdict: "auspicious_clear", affirmsPositive: true };
    case 2:
      return { verdict: "auspicious_moderate", affirmsPositive: true };
    case 3:
      return { verdict: "inauspicious_moderate", affirmsPositive: false };
    default:
      return { verdict: "inauspicious_clear", affirmsPositive: false };
  }
}

export function performOracleBonesCast(
  positiveCharge: string,
  negativeCharge: string,
  medium: OracleBonesCastResult["medium"],
  options?: PerformOracleBonesOptions,
): OracleBonesCastResult {
  const rng = options?.rng ?? Math.random;
  const patternId = rollCrackPattern(rng);
  const { verdict, affirmsPositive } = verdictForPattern(patternId);

  return {
    id: options?.id ?? newId(),
    patternId,
    verdict,
    affirmsPositive,
    positiveCharge: positiveCharge.trim(),
    negativeCharge: negativeCharge.trim(),
    medium,
  };
}

export function defaultNegativeCharge(positiveCharge: string, language: string): string {
  const p = positiveCharge.trim().replace(/\s+/g, " ");
  if (!p) return "";
  const core = p.replace(/\.$/, "");
  if (language.startsWith("es")) return `No se confirma que: ${core}.`;
  if (language.startsWith("en")) return `It will not be the case that: ${core}.`;
  if (language.startsWith("pt")) return `Não se confirma que: ${core}.`;
  if (language.startsWith("fr")) return `Il n'est pas confirmé que : ${core}.`;
  if (language.startsWith("de")) return `Es ist nicht bestätigt, dass: ${core}.`;
  if (language.startsWith("it")) return `Non è confermato che: ${core}.`;
  if (language.startsWith("ja")) return `次の内容は確認されません：${core}。`;
  if (language.startsWith("zh")) return `未能确认以下命题：${core}。`;
  if (language.startsWith("ko")) return `다음 명제는 확인되지 않습니다: ${core}.`;
  if (language.startsWith("ar")) return `لا يتأكد ما يلي: ${core}.`;
  if (language.startsWith("hi")) return `यह पुष्टि नहीं होती कि: ${core}।`;
  return `It will not be the case that: ${core}.`;
}
