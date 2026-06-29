import { getMutationRuleBookText } from "@iching-oracle/iching-data";
import type { Hexagram, Line, TextsForClaude, ZhuXiMutationRule } from "../types.js";

/**
 * Zhu Xi (朱熹) changing-line rules, from Yixue Qimeng (易學啟蒙, 1186, ch. 4 "明蓍策"),
 * per Joseph Adler's translation and the Yijing Dao (biroco.com) exposition.
 *
 * Difference from Huang: Zhu Xi does NOT always reduce to a single line.
 *  - 2 changing: read BOTH lines, upper is primary.
 *  - 3 changing: read BOTH judgments (no line text); emphasis via bottom-line rule (Adler ch. IV operational equivalent).
 *  - 4 changing: read BOTH stable lines of the transformed hexagram, lower is primary.
 */
export function determineMutationRuleZhuXi(
  primary: Hexagram,
  changing: number[],
): ZhuXiMutationRule {
  const n = changing.length;
  if (n === 6) {
    if (primary.number === 1) return "QIAN_ALL_NINE";
    if (primary.number === 2) return "KUN_ALL_SIX";
    return "ZX_SIX_TRANSFORMED";
  }
  if (n === 0) return "ZX_ZERO";
  if (n === 1) return "ZX_ONE";
  if (n === 2) return "ZX_TWO_UPPER";
  if (n === 3) return "ZX_THREE_JUDGMENTS";
  if (n === 4) return "ZX_FOUR_LOWER";
  if (n === 5) return "ZX_FIVE_ONLY";
  return "ZX_ZERO";
}

/**
 * Select the governing text(s) under Zhu Xi's rules. Receives the same `base`
 * object and `gl` helper used by the Huang path in engine.ts, so master-tradition
 * attachment and the prompt machinery work unchanged.
 */
export function selectTextsZhuXi(
  primary: Hexagram,
  transformed: Hexagram | null,
  _lines: Line[],
  changing: number[],
  rule: ZhuXiMutationRule,
  base: TextsForClaude,
  gl: (hex: Hexagram, pos: number) => string,
): TextsForClaude {
  const sorted = [...changing].sort((a, b) => a - b);
  const mutationRuleBookText = getMutationRuleBookText("zhuxi", rule);

  switch (rule) {
    case "ZX_ZERO":
      return {
        ...base,
        transformedJudgment: null,
        transformedImage: null,
        judgmentEmphasis: null,
        mutationRuleBookText,
      };

    case "ZX_ONE": {
      const pos = changing[0]!;
      return {
        ...base,
        selectedLineTexts: [
          { position: pos, text: gl(primary, pos), fromHexagram: "primary" },
        ],
        mutationRuleBookText,
      };
    }

    case "ZX_TWO_UPPER": {
      const low = sorted[0]!;
      const high = sorted[1]!;
      return {
        ...base,
        selectedLineTexts: [
          { position: low, text: gl(primary, low), fromHexagram: "primary", emphasis: "secondary" },
          { position: high, text: gl(primary, high), fromHexagram: "primary", emphasis: "primary" },
        ],
        mutationRuleBookText,
      };
    }

    case "ZX_THREE_JUDGMENTS": {
      // Adler ch. IV: first ten of the 20 three-changing cases → chen (primary) rules;
      // latter ten → hui (transformed). Operational equivalent: pos 1 among the three → primary.
      const emphasis: "primary" | "transformed" = sorted.includes(1) ? "primary" : "transformed";
      return {
        ...base,
        selectedLineTexts: [],
        judgmentEmphasis: emphasis,
        mutationRuleBookText,
      };
    }

    case "ZX_FOUR_LOWER": {
      if (!transformed) return base;
      const stable = [1, 2, 3, 4, 5, 6]
        .filter((p) => !changing.includes(p))
        .sort((a, b) => a - b);
      const low = stable[0]!;
      const high = stable[1]!;
      return {
        ...base,
        selectedLineTexts: [
          { position: low, text: gl(transformed, low), fromHexagram: "transformed", emphasis: "primary" },
          { position: high, text: gl(transformed, high), fromHexagram: "transformed", emphasis: "secondary" },
        ],
        mutationRuleBookText,
      };
    }

    case "ZX_FIVE_ONLY": {
      if (!transformed) return base;
      const only = [1, 2, 3, 4, 5, 6].find((p) => !changing.includes(p))!;
      return {
        ...base,
        selectedLineTexts: [
          { position: only, text: gl(transformed, only), fromHexagram: "transformed" },
        ],
        mutationRuleBookText,
      };
    }

    case "ZX_SIX_TRANSFORMED":
      return {
        ...base,
        primaryImage: "",
        selectedLineTexts: [],
        mutationRuleBookText,
      };

    case "QIAN_ALL_NINE":
      return {
        ...base,
        selectedLineTexts: [],
        readBothJudgments: true,
        specialYaoText:
          primary.yongJiu ??
          'All Nines (用九): "A host of dragons without a head; good fortune."',
        mutationRuleBookText,
      };

    case "KUN_ALL_SIX":
      return {
        ...base,
        selectedLineTexts: [],
        readBothJudgments: true,
        specialYaoText:
          primary.yongLiu ??
          'All Sixes (用六): "Perseverance brings advantage."',
        mutationRuleBookText,
      };
  }
}
