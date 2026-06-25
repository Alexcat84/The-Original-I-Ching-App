/**
 * QA code: TS-ENG-003 line-reading-systems · v1.0.0
 * Area: packages/iching-engine/src/engine.line-reading-systems
 * Family: ENG
 */

/**
 * Line reading systems — full-coverage regression suite (Huang | Zhu Xi).
 *
 * Covers EVERY class of changing-line configuration (0,1,2yy,2same-yang,2same-yin,
 * 3A,3B,4,5,6,Qian,Kun) for BOTH systems, asserting rule, fromHexagram, position(s),
 * emphasis and judgmentEmphasis against the primary sources:
 *   - Zhu Xi, Yixue Qimeng (1186) ch.4 明蓍策, trans. Adler.
 *   - Alfred Huang, The Complete I Ching (1998/2010).
 *   - Ed Hacker, The I Ching Handbook (1993) — 3-line judgment-emphasis rule.
 */
import { describe, it, expect } from "vitest";
import {
  applyMutations,
  buildLine,
  determineMutationRule,
  getHexagram,
  selectTextsForClaude,
} from "./engine.js";
import { determineMutationRuleZhuXi } from "./rules/zhuxi.js";
import type { InterpretationMode, Line, LineReadingSystem } from "./types.js";

function lv(values: number[]): Line[] {
  return values.map((v, i) => buildLine(v as 6 | 7 | 8 | 9, (i + 1) as Line["position"]));
}

function cast(
  values: number[],
  system: LineReadingSystem,
  translator: InterpretationMode = "wilhelm",
) {
  const lines = lv(values);
  const primary = getHexagram(lines);
  const changing = lines.filter((l) => l.isChanging).map((l) => l.position);
  const transformed = changing.length > 0 ? getHexagram(applyMutations(lines)) : null;
  const huangRule = determineMutationRule(primary, lines, changing);
  const ruleName = system === "zhuxi" ? determineMutationRuleZhuXi(primary, changing) : huangRule;
  const texts = selectTextsForClaude(primary, transformed, lines, changing, huangRule, translator, system);
  return { primary, transformed, changing, ruleName, texts };
}

const pos = (t: ReturnType<typeof cast>["texts"]) =>
  t.selectedLineTexts.map((l) => l.position);

// ───────────────────────── HUANG (default) ─────────────────────────
describe("Huang reading system (default, reads fewer lines)", () => {
  it("0 changing → NO_CHANGING, judgment only", () => {
    const { ruleName, texts } = cast([7, 8, 7, 8, 7, 8], "huang");
    expect(ruleName).toBe("NO_CHANGING");
    expect(texts.selectedLineTexts).toHaveLength(0);
    expect(texts.primaryJudgment.length).toBeGreaterThan(0);
  });

  it("1 changing → ONE_CHANGING, the line", () => {
    const { ruleName, texts } = cast([9, 8, 7, 8, 7, 8], "huang");
    expect(ruleName).toBe("ONE_CHANGING");
    expect(pos(texts)).toEqual([1]);
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("primary");
  });

  it("2 yin+yang → TWO_YIN_YANG, only the yin line", () => {
    const { ruleName, texts } = cast([6, 9, 7, 8, 7, 8], "huang");
    expect(ruleName).toBe("TWO_YIN_YANG");
    expect(pos(texts)).toEqual([1]); // pos 1 is the yin (old yin) line
  });

  it("2 same polarity (yang) → TWO_SAME_LOWER, the lower", () => {
    const { ruleName, texts } = cast([7, 9, 7, 9, 7, 7], "huang");
    expect(ruleName).toBe("TWO_SAME_LOWER");
    expect(pos(texts)).toEqual([2]); // lower of {2,4}
  });

  it("2 same polarity (yin) → TWO_SAME_LOWER, the lower", () => {
    const { ruleName, texts } = cast([6, 7, 6, 7, 7, 7], "huang");
    expect(ruleName).toBe("TWO_SAME_LOWER");
    expect(pos(texts)).toEqual([1]); // lower of {1,3}
  });

  it("3 changing → THREE_MIDDLE, the middle by position", () => {
    const { ruleName, texts } = cast([6, 9, 7, 9, 7, 7], "huang"); // {1,2,4} → middle=2
    expect(ruleName).toBe("THREE_MIDDLE");
    expect(pos(texts)).toEqual([2]);
  });

  it("4 changing → FOUR_LOWEST_STABLE, HIGHEST stable of transformed (post-Huang alignment)", () => {
    const { ruleName, texts } = cast([9, 9, 9, 9, 7, 7], "huang"); // stable {5,6} → highest=6
    expect(ruleName).toBe("FOUR_LOWEST_STABLE");
    expect(pos(texts)).toEqual([6]);
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("transformed");
  });

  it("5 changing → FIVE_ONLY_STABLE, only stable of transformed", () => {
    const { ruleName, texts } = cast([9, 9, 9, 9, 9, 7], "huang"); // stable {6}
    expect(ruleName).toBe("FIVE_ONLY_STABLE");
    expect(pos(texts)).toEqual([6]);
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("transformed");
  });

  it("6 changing (non Qian/Kun) → SIX_ALL_CHANGING, transformed judgment only", () => {
    const { ruleName, texts } = cast([9, 9, 9, 6, 6, 6], "huang"); // Tai #11
    expect(ruleName).toBe("SIX_ALL_CHANGING");
    expect(texts.selectedLineTexts).toHaveLength(0);
    expect(texts.transformedJudgment?.length ?? 0).toBeGreaterThan(0);
  });

  it("6 Qian → QIAN_ALL_NINE (用九)", () => {
    const { ruleName, texts } = cast([9, 9, 9, 9, 9, 9], "huang");
    expect(ruleName).toBe("QIAN_ALL_NINE");
    expect(texts.specialYaoText?.length ?? 0).toBeGreaterThan(0);
  });

  it("6 Kun → KUN_ALL_SIX (用六)", () => {
    const { ruleName, texts } = cast([6, 6, 6, 6, 6, 6], "huang");
    expect(ruleName).toBe("KUN_ALL_SIX");
    expect(texts.specialYaoText?.length ?? 0).toBeGreaterThan(0);
  });
});

// ───────────────────────── ZHU XI ─────────────────────────
describe("Zhu Xi reading system", () => {
  it("0 changing → ZX_ZERO, judgment only", () => {
    const { ruleName, texts } = cast([7, 8, 7, 8, 7, 8], "zhuxi");
    expect(ruleName).toBe("ZX_ZERO");
    expect(texts.selectedLineTexts).toHaveLength(0);
    expect(texts.judgmentEmphasis ?? null).toBeNull();
  });

  it("1 changing → ZX_ONE, the line", () => {
    const { ruleName, texts } = cast([9, 8, 7, 8, 7, 8], "zhuxi");
    expect(ruleName).toBe("ZX_ONE");
    expect(pos(texts)).toEqual([1]);
  });

  it("2 yin+yang → ZX_TWO_UPPER, both lines, upper primary", () => {
    const { ruleName, texts } = cast([6, 9, 7, 8, 7, 8], "zhuxi"); // {1,2}
    expect(ruleName).toBe("ZX_TWO_UPPER");
    expect(texts.selectedLineTexts).toHaveLength(2);
    expect(texts.selectedLineTexts.find((l) => l.position === 2)!.emphasis).toBe("primary");
    expect(texts.selectedLineTexts.find((l) => l.position === 1)!.emphasis).toBe("secondary");
    expect(texts.selectedLineTexts.every((l) => l.fromHexagram === "primary")).toBe(true);
  });

  it("2 same polarity (yang) → ZX_TWO_UPPER, both lines, upper primary", () => {
    const { ruleName, texts } = cast([7, 9, 7, 9, 7, 7], "zhuxi"); // {2,4}
    expect(ruleName).toBe("ZX_TWO_UPPER");
    expect(texts.selectedLineTexts).toHaveLength(2);
    expect(texts.selectedLineTexts.find((l) => l.position === 4)!.emphasis).toBe("primary");
  });

  it("2 same polarity (yin) → ZX_TWO_UPPER, both lines, upper primary", () => {
    const { ruleName, texts } = cast([6, 7, 6, 7, 7, 7], "zhuxi"); // {1,3}
    expect(ruleName).toBe("ZX_TWO_UPPER");
    expect(texts.selectedLineTexts).toHaveLength(2);
    expect(texts.selectedLineTexts.find((l) => l.position === 3)!.emphasis).toBe("primary");
    expect(texts.selectedLineTexts.find((l) => l.position === 1)!.emphasis).toBe("secondary");
  });

  it("3 changing, bottom line moves (Hacker A) → ZX_THREE_JUDGMENTS, primary leads, no line", () => {
    const { ruleName, texts } = cast([6, 9, 7, 9, 7, 7], "zhuxi"); // {1,2,4} → 1 present
    expect(ruleName).toBe("ZX_THREE_JUDGMENTS");
    expect(texts.selectedLineTexts).toHaveLength(0);
    expect(texts.judgmentEmphasis).toBe("primary");
  });

  it("3 changing, bottom line stable (Hacker B) → ZX_THREE_JUDGMENTS, transformed leads", () => {
    const { ruleName, texts } = cast([7, 9, 7, 9, 9, 7], "zhuxi"); // {2,4,5} → no 1
    expect(ruleName).toBe("ZX_THREE_JUDGMENTS");
    expect(texts.selectedLineTexts).toHaveLength(0);
    expect(texts.judgmentEmphasis).toBe("transformed");
  });

  it("4 changing → ZX_FOUR_LOWER, both stable of transformed, lower primary", () => {
    const { ruleName, texts } = cast([9, 9, 9, 9, 7, 7], "zhuxi"); // stable {5,6}
    expect(ruleName).toBe("ZX_FOUR_LOWER");
    expect(texts.selectedLineTexts).toHaveLength(2);
    expect(texts.selectedLineTexts.find((l) => l.position === 5)!.emphasis).toBe("primary");
    expect(texts.selectedLineTexts.find((l) => l.position === 6)!.emphasis).toBe("secondary");
    expect(texts.selectedLineTexts.every((l) => l.fromHexagram === "transformed")).toBe(true);
  });

  it("5 changing → ZX_FIVE_ONLY, only stable of transformed", () => {
    const { ruleName, texts } = cast([9, 9, 9, 9, 9, 7], "zhuxi");
    expect(ruleName).toBe("ZX_FIVE_ONLY");
    expect(pos(texts)).toEqual([6]);
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("transformed");
  });

  it("6 changing (non Qian/Kun) → ZX_SIX_TRANSFORMED, transformed judgment only", () => {
    const { ruleName, texts } = cast([9, 9, 9, 6, 6, 6], "zhuxi");
    expect(ruleName).toBe("ZX_SIX_TRANSFORMED");
    expect(texts.selectedLineTexts).toHaveLength(0);
    expect(texts.transformedJudgment?.length ?? 0).toBeGreaterThan(0);
  });

  it("6 Qian → QIAN_ALL_NINE (用九) + both judgments (Zhu Xi)", () => {
    const { ruleName, texts } = cast([9, 9, 9, 9, 9, 9], "zhuxi");
    expect(ruleName).toBe("QIAN_ALL_NINE");
    expect(texts.specialYaoText?.length ?? 0).toBeGreaterThan(0);
    expect(texts.readBothJudgments).toBe(true);
    expect(texts.transformedJudgment?.length ?? 0).toBeGreaterThan(0);
  });

  it("6 Kun → KUN_ALL_SIX (用六, shared with Huang)", () => {
    const { ruleName, texts } = cast([6, 6, 6, 6, 6, 6], "zhuxi");
    expect(ruleName).toBe("KUN_ALL_SIX");
    expect(texts.specialYaoText?.length ?? 0).toBeGreaterThan(0);
  });
});

// ───────────────────────── DIVERGENCE MATRIX ─────────────────────────
describe("Huang vs Zhu Xi diverge ONLY on 2/3/4 changing lines", () => {
  const identical = [
    ["0", [7, 8, 7, 8, 7, 8]],
    ["1", [9, 8, 7, 8, 7, 8]],
    ["5", [9, 9, 9, 9, 9, 7]],
    ["6-nonQK", [9, 9, 9, 6, 6, 6]],
    ["Qian", [9, 9, 9, 9, 9, 9]],
    ["Kun", [6, 6, 6, 6, 6, 6]],
  ] as const;

  it.each(identical)("case %s yields identical line selection in both systems", (_label, values) => {
    const h = cast(values as unknown as number[], "huang").texts;
    const z = cast(values as unknown as number[], "zhuxi").texts;
    expect(pos(z)).toEqual(pos(h));
  });

  const divergent = [
    ["2yy", [6, 9, 7, 8, 7, 8]],
    ["2same-yang", [7, 9, 7, 9, 7, 7]],
    ["2same-yin", [6, 7, 6, 7, 7, 7]],
    ["3a", [6, 9, 7, 9, 7, 7]],
    ["3b", [7, 9, 7, 9, 9, 7]],
    ["4", [9, 9, 9, 9, 7, 7]],
  ] as const;

  it.each(divergent)("case %s diverges between systems", (_label, values) => {
    const h = cast(values as unknown as number[], "huang").texts;
    const z = cast(values as unknown as number[], "zhuxi").texts;
    const differ =
      pos(z).length !== pos(h).length ||
      JSON.stringify(pos(z)) !== JSON.stringify(pos(h)) ||
      (z.judgmentEmphasis ?? null) !== (h.judgmentEmphasis ?? null);
    expect(differ).toBe(true);
  });

  it("default (no system arg) equals Huang", () => {
    const lines = lv([6, 9, 7, 8, 7, 8]);
    const primary = getHexagram(lines);
    const transformed = getHexagram(applyMutations(lines));
    const changing = lines.filter((l) => l.isChanging).map((l) => l.position);
    const rule = determineMutationRule(primary, lines, changing);
    const def = selectTextsForClaude(primary, transformed, lines, changing, rule, "wilhelm");
    const huang = selectTextsForClaude(primary, transformed, lines, changing, rule, "wilhelm", "huang");
    expect(pos(def)).toEqual(pos(huang));
  });
});

// ───────────────────────── MASTER COMBINED + EMPHASIS PROPAGATION ─────────────────────────
describe("master_combined propagates emphasis to Legge/Zhou Yi traditions (H3 fix)", () => {
  it("ZX_TWO_UPPER under master_combined tags emphasis on legge/zhouyi line texts too", () => {
    const { texts } = cast([6, 9, 7, 8, 7, 8], "zhuxi", "master_combined");
    expect(texts.leggeSelectedLineTexts).toBeDefined();
    expect(texts.zhouyiSelectedLineTexts).toBeDefined();
    expect(texts.leggeSelectedLineTexts!.find((l) => l.position === 2)!.emphasis).toBe("primary");
    expect(texts.zhouyiSelectedLineTexts!.find((l) => l.position === 2)!.emphasis).toBe("primary");
  });
});
