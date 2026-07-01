/**
 * QA code: TS-ENG-004 mutation-explore · v1.0.0
 * Area: packages/iching-engine/src/mutation-explore
 * Family: ENG
 */

import { describe, expect, it } from "vitest";
import {
  applyMaskToPrimary,
  buildCastCatalogEntry,
  buildSyntheticLinesFromMask,
  changingLinesFromMask,
  decodeCastIndex,
  deriveChangingLinesFromHexPair,
  encodeCastIndex,
  exploreMutation,
  lineValuesFromLines,
  maskFromChangingLines,
  MutationExploreError,
  reachableCastsFromPrimary,
} from "./mutation-explore.js";
import { buildLine } from "./engine.js";
import type { Line } from "./types.js";

function lv(values: number[]): Line[] {
  return values.map((v, i) => buildLine(v as 6 | 7 | 8 | 9, (i + 1) as Line["position"]));
}

describe("castIndex encoding", () => {
  it("encodes 9→54 canonical case as 573", () => {
    const mask = maskFromChangingLines([3, 4, 5, 6]);
    expect(mask).toBe(60);
    expect(encodeCastIndex(9, mask)).toBe(573);
  });

  it("round-trips all 4096 indices", () => {
    for (let i = 1; i <= 4096; i++) {
      const { primary, mask } = decodeCastIndex(i);
      expect(encodeCastIndex(primary, mask)).toBe(i);
    }
  });

  it("rejects castIndex 0 and 4097", () => {
    expect(() => decodeCastIndex(0)).toThrow(MutationExploreError);
    expect(() => decodeCastIndex(4097)).toThrow(MutationExploreError);
  });

  it("no-mutation mask=0 uses castIndex (p-1)*64+1", () => {
    expect(encodeCastIndex(9, 0)).toBe((9 - 1) * 64 + 1);
    expect(encodeCastIndex(1, 0)).toBe(1);
  });
});

describe("mask helpers", () => {
  it("changingLinesFromMask inverts maskFromChangingLines", () => {
    const lines = [1, 3, 6];
    const mask = maskFromChangingLines(lines);
    expect(changingLinesFromMask(mask)).toEqual(lines);
  });
});

describe("deriveChangingLinesFromHexPair", () => {
  it("derives 9→54 changing lines 3,4,5,6", () => {
    const { changingLines, stableLines } = deriveChangingLinesFromHexPair(9, 54);
    expect(changingLines).toEqual([3, 4, 5, 6]);
    expect(stableLines).toEqual([1, 2]);
  });

  it("same primary and transformed yields no changes", () => {
    const { changingLines } = deriveChangingLinesFromHexPair(9, 9);
    expect(changingLines).toEqual([]);
  });
});

describe("buildSyntheticLinesFromMask", () => {
  it("produces unique [7,7,9,6,9,9] for 9→54", () => {
    const lines = buildSyntheticLinesFromMask(9, 60);
    expect(lineValuesFromLines(lines)).toEqual([7, 7, 9, 6, 9, 9]);
    expect(applyMaskToPrimary(9, 60)).toBe(54);
  });
});

describe("exploreMutation — canonical 9→54", () => {
  it("Zhu Xi: ZX_FOUR_LOWER, L1+L2 of hex 54", () => {
    const result = exploreMutation({
      primaryNumber: 9,
      transformedNumber: 54,
      lineReadingSystem: "zhuxi",
    });
    expect(result.castIndex).toBe(573);
    expect(result.mutationRule).toBe("ZX_FOUR_LOWER");
    expect(result.changingLines).toEqual([3, 4, 5, 6]);
    const lineSelections = result.selections.filter((s) => s.kind === "line");
    expect(lineSelections).toHaveLength(2);
    expect(lineSelections.map((s) => s.hex)).toEqual([54, 54]);
    expect(lineSelections.map((s) => s.position)).toEqual([1, 2]);
    expect(result.textsByTranslator.wilhelm.selectedLineTexts).toHaveLength(2);
    expect(result.textsByTranslator.wilhelm.selectedLineTexts[0]?.fromHexagram).toBe(
      "transformed",
    );
  });

  it("Huang: FOUR_LOWEST_STABLE, only L2 of hex 54", () => {
    const result = exploreMutation({
      primaryNumber: 9,
      transformedNumber: 54,
      lineReadingSystem: "huang",
    });
    expect(result.mutationRule).toBe("FOUR_LOWEST_STABLE");
    const lineSelections = result.selections.filter((s) => s.kind === "line");
    expect(lineSelections).toHaveLength(1);
    expect(lineSelections[0]).toMatchObject({ hex: 54, position: 2 });
    expect(result.selections.some((s) => s.kind === "judgment")).toBe(false);
    expect(result.selections.some((s) => s.kind === "image")).toBe(false);
  });

  it("uses stored lines when provided (mode A parity)", () => {
    const stored = lv([7, 7, 9, 6, 9, 9]);
    const result = exploreMutation({
      primaryNumber: 9,
      lines: stored,
      lineReadingSystem: "zhuxi",
      mask: 60,
    });
    expect(result.linesUsed).toEqual(stored);
    expect(result.mutationRule).toBe("ZX_FOUR_LOWER");
  });
});

describe("exploreMutation — rule matrix", () => {
  it("no changing: NO_CHANGING / ZX_ZERO", () => {
    const huang = exploreMutation({ primaryNumber: 9, mask: 0, lineReadingSystem: "huang" });
    const zhuxi = exploreMutation({ primaryNumber: 9, mask: 0, lineReadingSystem: "zhuxi" });
    expect(huang.mutationRule).toBe("NO_CHANGING");
    expect(zhuxi.mutationRule).toBe("ZX_ZERO");
    expect(huang.changingLines).toEqual([]);
  });

  it("one changing: ONE_CHANGING / ZX_ONE", () => {
    const mask = maskFromChangingLines([4]);
    const huang = exploreMutation({ primaryNumber: 9, mask, lineReadingSystem: "huang" });
    const zhuxi = exploreMutation({ primaryNumber: 9, mask, lineReadingSystem: "zhuxi" });
    expect(huang.mutationRule).toBe("ONE_CHANGING");
    expect(zhuxi.mutationRule).toBe("ZX_ONE");
    const huangLineSelections = huang.selections.filter((s) => s.kind === "line");
    expect(huangLineSelections).toHaveLength(1);
    expect(huang.selections.some((s) => s.kind === "judgment" && s.judgmentScope === "primary")).toBe(
      false,
    );
    expect(
      huang.selections.some((s) => s.kind === "judgment" && s.judgmentScope === "transformed"),
    ).toBe(true);
    expect(huang.selections.some((s) => s.kind === "image")).toBe(false);
  });

  it("three changing Zhu Xi: ZX_THREE_JUDGMENTS without line texts", () => {
    const mask = maskFromChangingLines([2, 4, 6]);
    const result = exploreMutation({ primaryNumber: 9, mask, lineReadingSystem: "zhuxi" });
    expect(result.mutationRule).toBe("ZX_THREE_JUDGMENTS");
    expect(result.textsByTranslator.wilhelm.selectedLineTexts).toHaveLength(0);
    expect(result.textsByTranslator.wilhelm.judgmentEmphasis).toBeDefined();
  });

  it("Qian all nine: QIAN_ALL_NINE", () => {
    const mask = 63;
    const huang = exploreMutation({ primaryNumber: 1, mask, lineReadingSystem: "huang" });
    const zhuxi = exploreMutation({ primaryNumber: 1, mask, lineReadingSystem: "zhuxi" });
    expect(huang.mutationRule).toBe("QIAN_ALL_NINE");
    expect(zhuxi.mutationRule).toBe("QIAN_ALL_NINE");
    expect(huang.textsByTranslator.wilhelm.specialYaoText).toBeTruthy();
    expect(zhuxi.textsByTranslator.wilhelm.readBothJudgments).toBe(true);
  });

  it("Kun all six: KUN_ALL_SIX", () => {
    const mask = 63;
    const huang = exploreMutation({ primaryNumber: 2, mask, lineReadingSystem: "huang" });
    expect(huang.mutationRule).toBe("KUN_ALL_SIX");
  });
});

describe("reachableCastsFromPrimary", () => {
  it("returns 64 unique transformed hexes per primary", () => {
    for (let primary = 1; primary <= 64; primary++) {
      const casts = reachableCastsFromPrimary(primary);
      expect(casts).toHaveLength(64);
      const transformed = new Set(casts.map((entry) => entry.transformedNumber));
      expect(transformed.size).toBe(64);
      expect(casts[0]?.mask).toBe(0);
      expect(casts[0]?.transformedNumber).toBe(primary);
    }
  });
});

describe("64×64 hex pair sweep", () => {
  it("each valid pair has exactly one synthetic line configuration", () => {
    const configs = new Set<string>();
    for (let primary = 1; primary <= 64; primary++) {
      for (let transformed = 1; transformed <= 64; transformed++) {
        const { changingLines } = deriveChangingLinesFromHexPair(primary, transformed);
        const mask = maskFromChangingLines(changingLines);
        const lines = buildSyntheticLinesFromMask(primary, mask);
        const key = `${primary}:${transformed}:${lineValuesFromLines(lines).join(",")}`;
        configs.add(key);
        expect(applyMaskToPrimary(primary, mask)).toBe(transformed);
      }
    }
    expect(configs.size).toBe(64 * 64);
  });
});

describe("castIndex input path", () => {
  it("explores from castIndex alone", () => {
    const result = exploreMutation({ primaryNumber: 9, castIndex: 573, lineReadingSystem: "zhuxi" });
    expect(result.primaryNumber).toBe(9);
    expect(result.transformedNumber).toBe(54);
  });
});

describe("buildCastCatalogEntry", () => {
  it("matches exploreMutation for sample entries", () => {
    for (const [primary, mask] of [
      [1, 0],
      [9, 60],
      [44, maskFromChangingLines([1, 2, 3, 5, 6])],
      [1, 63],
    ] as const) {
      const entry = buildCastCatalogEntry(primary, mask);
      const huang = exploreMutation({ primaryNumber: primary, mask, lineReadingSystem: "huang" });
      const zhuxi = exploreMutation({ primaryNumber: primary, mask, lineReadingSystem: "zhuxi" });
      expect(entry.huang.rule).toBe(huang.mutationRule);
      expect(entry.zhuxi.rule).toBe(zhuxi.mutationRule);
      expect(entry.lineValues).toEqual(lineValuesFromLines(huang.linesUsed));
    }
  });
});

describe("two changing lines Huang", () => {
  it("resolves TWO_YIN_YANG vs TWO_SAME_LOWER from primary binary", () => {
    const yinYangMask = maskFromChangingLines([1, 2]);
    const lines = buildSyntheticLinesFromMask(9, yinYangMask);
    const result = exploreMutation({
      primaryNumber: 9,
      mask: yinYangMask,
      lines,
      lineReadingSystem: "huang",
    });
    expect(["TWO_YIN_YANG", "TWO_SAME_LOWER"]).toContain(result.mutationRule);
    expect(result.textsByTranslator.wilhelm.selectedLineTexts).toHaveLength(1);
  });
});

describe("textsByTranslator", () => {
  it("returns wilhelm, legge, and zhouyi bundles", () => {
    const result = exploreMutation({
      primaryNumber: 9,
      mask: 60,
      lineReadingSystem: "zhuxi",
    });
    expect(result.textsByTranslator.wilhelm.primaryJudgment.length).toBeGreaterThan(0);
    expect(result.textsByTranslator.legge.primaryJudgment.length).toBeGreaterThan(0);
    expect(result.textsByTranslator.zhouyi.primaryJudgment.length).toBeGreaterThan(0);
  });
});
