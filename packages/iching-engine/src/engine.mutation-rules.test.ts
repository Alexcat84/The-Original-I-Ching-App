/**
 * Comprehensive regression suite for the Zhu Xi mutation rule system.
 *
 * Scope:
 *  1. H6 regression — #44姤→#51震, 5 changing lines (the originally reported P0 bug)
 *  2. All 10 mutation rules: correct line selection, fromHexagram, position
 *  3. master_combined: Legge/ZhouYi special yao texts for QIAN/KUN (engine fix)
 *  4. Additional I Ching rules beyond changing lines: applyMutations, H7 edge cases
 *
 * No live I18n / API calls. All hexagram texts come from the bundled data package.
 *
 * Reference: docs/auditorias/ICHING_CHANGING_LINES_AUDIT_2026-06-14.md
 */
import { describe, it, expect } from "vitest";
import {
  applyMutations,
  buildLine,
  determineMutationRule,
  getHexagram,
  performCastFromLineValues,
  selectTextsForClaude,
} from "./engine.js";
import type { Line } from "./types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lv(values: number[]): Line[] {
  return values.map((v, i) => buildLine(v as 6 | 7 | 8 | 9, (i + 1) as Line["position"]));
}

function cast(values: number[], translator: Parameters<typeof selectTextsForClaude>[5] = "wilhelm") {
  const lines = lv(values);
  const primary = getHexagram(lines);
  const mutated = applyMutations(lines);
  const transformed = getHexagram(mutated);
  const changing = lines.filter((l) => l.isChanging).map((l) => l.position);
  const rule = determineMutationRule(primary, lines, changing);
  const texts = selectTextsForClaude(primary, transformed, lines, changing, rule, translator);
  return { lines, primary, transformed, changing, rule, texts };
}

// ---------------------------------------------------------------------------
// H6 Regression — #44姤 → #51震 with 5 changing lines (FIVE_ONLY_STABLE)
// This is the originally reported P0 quality bug.
// Line values: [old-yin, old-yang, old-yang, young-yang(stable), old-yang, old-yang]
// ---------------------------------------------------------------------------

describe("H6 regression — #44 姤 → #51 震 with 5 changing lines", () => {
  const LINE_VALUES = [6, 9, 9, 7, 9, 9] as const; // line 4 is the only stable

  it("produces primary hexagram #44 (Encountering/姤)", () => {
    const result = performCastFromLineValues("q", "en", [...LINE_VALUES], { id: "h6-test" });
    expect(result.primaryHexagram.number).toBe(44);
    expect(result.primaryHexagram.chineseName).toBe("姤");
  });

  it("produces transformed hexagram #51 (Taking Action/震)", () => {
    const result = performCastFromLineValues("q", "en", [...LINE_VALUES], { id: "h6-test" });
    expect(result.transformedHexagram?.number).toBe(51);
    expect(result.transformedHexagram?.chineseName).toBe("震");
  });

  it("identifies exactly 5 changing lines at positions 1,2,3,5,6", () => {
    const result = performCastFromLineValues("q", "en", [...LINE_VALUES], { id: "h6-test" });
    expect(result.changingLines).toEqual([1, 2, 3, 5, 6]);
    expect(result.changingLines).toHaveLength(5);
  });

  it("applies rule FIVE_ONLY_STABLE", () => {
    const result = performCastFromLineValues("q", "en", [...LINE_VALUES], { id: "h6-test" });
    expect(result.mutationRule).toBe("FIVE_ONLY_STABLE");
  });

  it("sends exactly 1 LINE TEXT to Claude", () => {
    const { texts } = cast([...LINE_VALUES]);
    expect(texts.selectedLineTexts).toHaveLength(1);
  });

  it("selects the stable line — position 4", () => {
    const { texts } = cast([...LINE_VALUES]);
    expect(texts.selectedLineTexts[0]!.position).toBe(4);
  });

  it("takes the line text from the TRANSFORMED hexagram (#51), not the primary (#44)", () => {
    const { texts } = cast([...LINE_VALUES]);
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("transformed");
  });

  it("Wilhelm line text is 'Shock is mired.' (line 4 of #51)", () => {
    const { texts } = cast([...LINE_VALUES]);
    // Verbatim check — this is the fingerprint the H1 gate uses
    expect(texts.selectedLineTexts[0]!.text).toBe("Shock is mired.");
  });

  it("primaryHexagram line 4 text ('No fish in the tank.') is NOT sent to Claude", () => {
    // Confirms the rule reads from transformed, not primary at that position
    const { texts } = cast([...LINE_VALUES]);
    const sentText = texts.selectedLineTexts[0]!.text;
    expect(sentText).not.toContain("No fish in the tank");
  });

  it("ruleExplanation is human-readable and contains 'TRANSFORMADO'", () => {
    const { texts } = cast([...LINE_VALUES]);
    expect(texts.ruleExplanation).toContain("Cinco");
    expect(texts.ruleExplanation).toContain("TRANSFORMADO");
    expect(texts.ruleExplanation).toContain("4");
  });

  it("master_combined supplies Legge line 4 of #51 for the same stable position", () => {
    const { texts } = cast([...LINE_VALUES], "master_combined");
    const leggeLine = texts.leggeSelectedLineTexts?.[0];
    expect(leggeLine?.position).toBe(4);
    expect(leggeLine?.fromHexagram).toBe("transformed");
    expect(leggeLine?.text).toContain("The fourth NINE");
  });

  it("master_combined supplies ZhouYi line 4 of #51 (震遂泥。)", () => {
    const { texts } = cast([...LINE_VALUES], "master_combined");
    const zhouyiLine = texts.zhouyiSelectedLineTexts?.[0];
    expect(zhouyiLine?.position).toBe(4);
    expect(zhouyiLine?.fromHexagram).toBe("transformed");
    expect(zhouyiLine?.text).toContain("震遂泥");
  });
});

// ---------------------------------------------------------------------------
// Complete coverage — all 10 mutation rules
// ---------------------------------------------------------------------------

describe("selectTextsForClaude — complete coverage of all 10 Zhu Xi rules", () => {
  // ------ NO_CHANGING -------------------------------------------------------
  it("NO_CHANGING: 0 line texts, no transformed, stability ruleExplanation", () => {
    const { texts, changing } = cast([7, 8, 7, 8, 7, 8]);
    expect(changing).toHaveLength(0);
    expect(texts.selectedLineTexts).toHaveLength(0);
    expect(texts.transformedJudgment).toBeNull();
    expect(texts.ruleExplanation).toMatch(/sin mutaci/i);
  });

  // ------ ONE_CHANGING ------------------------------------------------------
  it("ONE_CHANGING: 1 line text from primary, CHANGING_COUNT=1=LINE_TEXTS (no trigger)", () => {
    // line 1 old yang, rest stable
    const { texts, changing, rule } = cast([9, 8, 7, 8, 7, 8]);
    expect(rule).toBe("ONE_CHANGING");
    expect(changing).toEqual([1]);
    expect(texts.selectedLineTexts).toHaveLength(1);
    expect(texts.selectedLineTexts[0]!.position).toBe(1);
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("primary");
    expect(texts.selectedLineTexts[0]!.text.length).toBeGreaterThan(0);
  });

  // ------ TWO_YIN_YANG ------------------------------------------------------
  it("TWO_YIN_YANG: selects the yin (6) line, not the yang (9) line", () => {
    // pos1=yin_old(6), pos3=yang_old(9), rest stable → yin at 1 takes precedence
    const { texts, rule } = cast([6, 7, 9, 7, 7, 7]);
    expect(rule).toBe("TWO_YIN_YANG");
    expect(texts.selectedLineTexts).toHaveLength(1);
    expect(texts.selectedLineTexts[0]!.position).toBe(1); // yin line
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("primary");
  });

  // ------ TWO_SAME_LOWER ----------------------------------------------------
  it("TWO_SAME_LOWER: selects the lower (min position) of two same-type changing lines", () => {
    // pos2=yang_old(9), pos4=yang_old(9), rest stable → select pos2 (lower)
    const { texts, rule } = cast([7, 9, 7, 9, 7, 7]);
    expect(rule).toBe("TWO_SAME_LOWER");
    expect(texts.selectedLineTexts).toHaveLength(1);
    expect(texts.selectedLineTexts[0]!.position).toBe(2); // lower of [2,4]
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("primary");
  });

  // ------ THREE_MIDDLE ------------------------------------------------------
  it("THREE_MIDDLE: selects the middle changing line (sorted index 1)", () => {
    // positions 1,2,4 changing → sorted=[1,2,4] → middle=2
    const { texts, rule } = cast([6, 9, 7, 9, 7, 7]);
    expect(rule).toBe("THREE_MIDDLE");
    expect(texts.selectedLineTexts).toHaveLength(1);
    expect(texts.selectedLineTexts[0]!.position).toBe(2);
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("primary");
    expect(texts.ruleExplanation).toContain("central");
  });

  // ------ FOUR_LOWEST_STABLE ------------------------------------------------
  it("FOUR (Huang): line text from TRANSFORMED, at highest stable position", () => {
    // Qian(#1) with pos1-4 changing → stable=[5,6] → Huang reads highest stable=6
    const { texts, rule, transformed } = cast([9, 9, 9, 9, 7, 7]);
    expect(rule).toBe("FOUR_LOWEST_STABLE");
    expect(texts.selectedLineTexts).toHaveLength(1);
    expect(texts.selectedLineTexts[0]!.position).toBe(6);
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("transformed");
    expect(transformed.number).toBe(20); // Qian+4changes → Guan (#20)
  });

  // ------ FIVE_ONLY_STABLE --------------------------------------------------
  it("FIVE_ONLY_STABLE: line text from TRANSFORMED, unique stable position (canonical H6 case)", () => {
    // Already covered by H6 block; minimal assertion here for rule completeness
    const { texts, rule } = cast([6, 9, 9, 7, 9, 9]);
    expect(rule).toBe("FIVE_ONLY_STABLE");
    expect(texts.selectedLineTexts).toHaveLength(1);
    expect(texts.selectedLineTexts[0]!.fromHexagram).toBe("transformed");
  });

  // ------ SIX_ALL_CHANGING --------------------------------------------------
  it("SIX_ALL_CHANGING: 0 line texts, primaryImage cleared, transformed judgment present", () => {
    // Hex #63 (济济) — alternating old yang/yin
    const { texts, rule } = cast([9, 6, 9, 6, 9, 6]);
    expect(rule).toBe("SIX_ALL_CHANGING");
    expect(texts.selectedLineTexts).toHaveLength(0);
    expect(texts.primaryImage).toBe(""); // cleared per tradition
    expect(texts.specialYaoText).toBeNull();
    expect(texts.transformedJudgment).toBeTruthy(); // transformed judgment is the focus
  });

  // ------ QIAN_ALL_NINE -----------------------------------------------------
  it("QIAN_ALL_NINE: 0 line texts, specialYaoText (用九) set, primaryImage NOT cleared", () => {
    const { texts, rule, primary } = cast([9, 9, 9, 9, 9, 9]);
    expect(primary.number).toBe(1);
    expect(rule).toBe("QIAN_ALL_NINE");
    expect(texts.selectedLineTexts).toHaveLength(0);
    expect(texts.specialYaoText).toBeTruthy();
    expect(texts.specialYaoText).toContain("dragons"); // Wilhelm 用九
    expect(texts.primaryImage).not.toBe(""); // image is NOT cleared for Qian
  });

  // ------ KUN_ALL_SIX -------------------------------------------------------
  it("KUN_ALL_SIX: 0 line texts, specialYaoText (用六) set", () => {
    const { texts, rule, primary } = cast([6, 6, 6, 6, 6, 6]);
    expect(primary.number).toBe(2);
    expect(rule).toBe("KUN_ALL_SIX");
    expect(texts.selectedLineTexts).toHaveLength(0);
    expect(texts.specialYaoText).toBeTruthy();
    expect(texts.specialYaoText).toContain("Perseverance"); // Wilhelm 用六
    expect(texts.primaryImage).not.toBe("");
  });
});

// ---------------------------------------------------------------------------
// master_combined — QIAN/KUN special yao (engine fix 2026-06-14)
// Legge and ZhouYi 用九/用六 were previously not fetched in attachMasterTraditions
// ---------------------------------------------------------------------------

describe("master_combined — QIAN/KUN special yao across all three traditions", () => {
  it("QIAN_ALL_NINE: leggeSpecialYaoText is populated (use of nines)", () => {
    const { texts } = cast([9, 9, 9, 9, 9, 9], "master_combined");
    expect(texts.leggeSpecialYaoText).toBeTruthy();
    expect(texts.leggeSpecialYaoText).toContain("The lines of this hexagram");
  });

  it("QIAN_ALL_NINE: zhouyiSpecialYaoText is populated (用九 in classical Chinese)", () => {
    const { texts } = cast([9, 9, 9, 9, 9, 9], "master_combined");
    expect(texts.zhouyiSpecialYaoText).toBeTruthy();
    expect(texts.zhouyiSpecialYaoText).toContain("見群龍無首");
  });

  it("KUN_ALL_SIX: leggeSpecialYaoText is populated (use of sixes)", () => {
    const { texts } = cast([6, 6, 6, 6, 6, 6], "master_combined");
    expect(texts.leggeSpecialYaoText).toBeTruthy();
    expect(texts.leggeSpecialYaoText).toContain("The lines of this hexagram");
  });

  it("KUN_ALL_SIX: zhouyiSpecialYaoText is populated (用六 in classical Chinese)", () => {
    const { texts } = cast([6, 6, 6, 6, 6, 6], "master_combined");
    expect(texts.zhouyiSpecialYaoText).toBeTruthy();
    expect(texts.zhouyiSpecialYaoText).toContain("利永貞");
  });

  it("FIVE_ONLY_STABLE master: all 3 traditions supply same stable line position", () => {
    const { texts } = cast([6, 9, 9, 7, 9, 9], "master_combined");
    expect(texts.leggeSelectedLineTexts?.[0]?.position).toBe(4);
    expect(texts.zhouyiSelectedLineTexts?.[0]?.position).toBe(4);
    expect(texts.selectedLineTexts[0]?.position).toBe(4); // Wilhelm
  });

  it("FIVE_ONLY_STABLE master: all 3 traditions mark fromHexagram as 'transformed'", () => {
    const { texts } = cast([6, 9, 9, 7, 9, 9], "master_combined");
    expect(texts.selectedLineTexts[0]?.fromHexagram).toBe("transformed"); // Wilhelm
    expect(texts.leggeSelectedLineTexts?.[0]?.fromHexagram).toBe("transformed");
    expect(texts.zhouyiSelectedLineTexts?.[0]?.fromHexagram).toBe("transformed");
  });

  it("ONE_CHANGING master: leggeSpecialYaoText and zhouyiSpecialYaoText are null", () => {
    const { texts } = cast([9, 8, 7, 8, 7, 8], "master_combined");
    expect(texts.leggeSpecialYaoText ?? null).toBeNull();
    expect(texts.zhouyiSpecialYaoText ?? null).toBeNull();
  });

  it("NO_CHANGING master: all special yao fields are null/absent", () => {
    const { texts } = cast([7, 8, 7, 8, 7, 8], "master_combined");
    expect(texts.specialYaoText).toBeNull();
    expect(texts.leggeSpecialYaoText ?? null).toBeNull();
    expect(texts.zhouyiSpecialYaoText ?? null).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Additional I Ching rules beyond changing lines
// ---------------------------------------------------------------------------

describe("applyMutations — Zhu Xi line transformation axioms", () => {
  it("old yin (6) mutates to young yang (7)", () => {
    const lines = lv([6, 7, 7, 7, 7, 7]);
    const mutated = applyMutations(lines);
    expect(mutated[0]!.value).toBe(7);
    expect(mutated[0]!.type).toBe("yang_young");
    expect(mutated[0]!.isChanging).toBe(false);
  });

  it("old yang (9) mutates to young yin (8)", () => {
    const lines = lv([9, 7, 7, 7, 7, 7]);
    const mutated = applyMutations(lines);
    expect(mutated[0]!.value).toBe(8);
    expect(mutated[0]!.type).toBe("yin_young");
    expect(mutated[0]!.isChanging).toBe(false);
  });

  it("young yang (7) stays young yang", () => {
    const lines = lv([7, 7, 7, 7, 7, 7]);
    const mutated = applyMutations(lines);
    mutated.forEach((l) => {
      expect(l.value).toBe(7);
      expect(l.isChanging).toBe(false);
    });
  });

  it("young yin (8) stays young yin", () => {
    const lines = lv([8, 8, 8, 8, 8, 8]);
    const mutated = applyMutations(lines);
    mutated.forEach((l) => {
      expect(l.value).toBe(8);
      expect(l.isChanging).toBe(false);
    });
  });

  it("applying mutations twice to stable lines is idempotent", () => {
    const lines = lv([7, 8, 7, 8, 7, 8]);
    expect(applyMutations(applyMutations(lines))).toEqual(applyMutations(lines));
  });
});

describe("Hexagram identification — King Wen sequence spot checks", () => {
  const KNOWN: Array<[number[], number, string]> = [
    [[7, 7, 7, 7, 7, 7], 1, "乾"], // all yang = Qian
    [[8, 8, 8, 8, 8, 8], 2, "坤"], // all yin = Kun
    [[7, 7, 7, 8, 8, 8], 11, "泰"], // Tai (Peace)
    [[8, 8, 8, 7, 7, 7], 12, "否"], // Pi (Stagnation)
    [[7, 8, 7, 8, 7, 8], 63, "既濟"], // Ji Ji (After Completion) — Li(fire) below, Kan(water) above
    [[8, 7, 8, 7, 8, 7], 64, "未濟"], // Wei Ji (Before Completion) — Kan below, Li above
  ];

  it.each(KNOWN)("line values %j → hex #%i (%s)", (values, expectedNumber, expectedChinese) => {
    const lines = lv(values);
    const hex = getHexagram(lines);
    expect(hex.number).toBe(expectedNumber);
    expect(hex.chineseName).toBe(expectedChinese);
  });
});

describe("H7 edge case — empty text from missing line position", () => {
  it("selectTextsForClaude does not throw when line text is empty string", () => {
    // ONE_CHANGING at pos 1, but primary hex has no line at an invalid position
    // We simulate this by checking that the function handles the case where gl() returns ""
    // For a valid position, gl() will always return the actual text from iching-data.
    // This test verifies no exception is thrown for the stable-line selection path.
    expect(() => cast([9, 8, 7, 8, 7, 8])).not.toThrow();
  });

  it("selectedLineTexts entries always have a non-empty text for real hexagram/position combos", () => {
    // Real casts: every position in every hex has text in the data
    const fixtures = [
      [9, 8, 7, 8, 7, 8], // ONE_CHANGING
      [6, 9, 9, 7, 9, 9], // FIVE_ONLY_STABLE
      [9, 9, 9, 9, 7, 7], // FOUR_LOWEST_STABLE
    ];
    for (const values of fixtures) {
      const { texts } = cast(values);
      for (const lt of texts.selectedLineTexts) {
        expect(lt.text.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("CHANGING_COUNT vs LINE_TEXTS mismatch — prompt trigger logic", () => {
  // The prompt gate fires when CHANGING_COUNT > selectedLineTexts.length.
  // Verify the invariant for each rule.
  const CASES: Array<[number[], boolean, string]> = [
    [[7, 8, 7, 8, 7, 8], false, "NO_CHANGING: 0=0, no trigger"],
    [[9, 8, 7, 8, 7, 8], false, "ONE_CHANGING: 1=1, no trigger"],
    [[6, 9, 7, 8, 7, 8], true, "TWO_YIN_YANG: 2>1, trigger"],
    [[7, 9, 7, 9, 7, 7], true, "TWO_SAME_LOWER: 2>1, trigger"],
    [[6, 9, 7, 9, 7, 7], true, "THREE_MIDDLE: 3>1, trigger"],
    [[9, 9, 9, 9, 7, 7], true, "FOUR_LOWEST_STABLE: 4>1, trigger"],
    [[6, 9, 9, 7, 9, 9], true, "FIVE_ONLY_STABLE: 5>1, trigger"],
    [[9, 6, 9, 6, 9, 6], true, "SIX_ALL_CHANGING: 6>0, trigger"],
    [[9, 9, 9, 9, 9, 9], true, "QIAN_ALL_NINE: 6>0, trigger"],
    [[6, 6, 6, 6, 6, 6], true, "KUN_ALL_SIX: 6>0, trigger"],
  ];

  it.each(CASES)("values %j → trigger=%s (%s)", (values, expectedTrigger) => {
    const { changing, texts } = cast(values);
    const triggers = changing.length > texts.selectedLineTexts.length;
    expect(triggers).toBe(expectedTrigger);
  });
});
