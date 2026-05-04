import { describe, expect, it } from "vitest";
import {
  applyMutations,
  buildLine,
  castSixLines,
  determineMutationRule,
  getHexagram,
  linesToBinaryTopFirst,
  performCast,
  performCastFromLineValues,
  previewCastFromLineValues,
  selectTextsForClaude,
  throwThreeCoins,
} from "./engine.js";
import type { Line } from "./types.js";

function linesFromValues(values: number[]): Line[] {
  return values.map((v, i) => buildLine(v as 6 | 7 | 8 | 9, (i + 1) as Line["position"]));
}

describe("linesToBinaryTopFirst + getHexagram", () => {
  it("maps all yang to Qian (1)", () => {
    const lines = linesFromValues([7, 7, 7, 7, 7, 7]);
    expect(linesToBinaryTopFirst(lines)).toBe("111111");
    expect(getHexagram(lines).number).toBe(1);
  });

  it("maps all yin to Kun (2)", () => {
    const lines = linesFromValues([8, 8, 8, 8, 8, 8]);
    expect(linesToBinaryTopFirst(lines)).toBe("000000");
    expect(getHexagram(lines).number).toBe(2);
  });

  it("matches Wilhelm binary for hex 11 (Tai)", () => {
    const lines = linesFromValues([7, 7, 7, 8, 8, 8]);
    expect(linesToBinaryTopFirst(lines)).toBe("000111");
    expect(getHexagram(lines).number).toBe(11);
  });
});

describe("determineMutationRule", () => {
  it("NO_CHANGING", () => {
    const lines = linesFromValues([7, 8, 7, 8, 7, 8]);
    const p = getHexagram(lines);
    expect(determineMutationRule(p, lines, [])).toBe("NO_CHANGING");
  });

  it("ONE_CHANGING", () => {
    const lines = linesFromValues([9, 8, 7, 8, 7, 8]);
    const p = getHexagram(lines);
    expect(determineMutationRule(p, lines, [1])).toBe("ONE_CHANGING");
  });

  it("TWO_YIN_YANG", () => {
    const lines = linesFromValues([6, 9, 7, 8, 7, 8]);
    const p = getHexagram(lines);
    expect(determineMutationRule(p, lines, [1, 2])).toBe("TWO_YIN_YANG");
  });

  it("TWO_SAME_LOWER", () => {
    const lines = linesFromValues([6, 6, 7, 8, 7, 8]);
    const p = getHexagram(lines);
    expect(determineMutationRule(p, lines, [1, 2])).toBe("TWO_SAME_LOWER");
  });

  it("THREE_MIDDLE", () => {
    const lines = linesFromValues([6, 6, 6, 7, 8, 7]);
    const p = getHexagram(lines);
    expect(determineMutationRule(p, lines, [1, 2, 3])).toBe("THREE_MIDDLE");
  });

  it("FOUR_LOWEST_STABLE uses transformed", () => {
    const lines = linesFromValues([6, 6, 6, 6, 7, 8]);
    const p = getHexagram(lines);
    const t = getHexagram(applyMutations(lines));
    const rule = determineMutationRule(p, lines, [1, 2, 3, 4]);
    expect(rule).toBe("FOUR_LOWEST_STABLE");
    const texts = selectTextsForClaude(p, t, lines, [1, 2, 3, 4], rule);
    expect(texts.selectedLineTexts[0]?.fromHexagram).toBe("transformed");
  });

  it("FIVE_ONLY_STABLE", () => {
    const lines = linesFromValues([6, 6, 6, 6, 6, 7]);
    const p = getHexagram(lines);
    expect(determineMutationRule(p, lines, [1, 2, 3, 4, 5])).toBe("FIVE_ONLY_STABLE");
  });

  it("QIAN_ALL_NINE", () => {
    const lines = linesFromValues([9, 9, 9, 9, 9, 9]);
    const p = getHexagram(lines);
    expect(determineMutationRule(p, lines, [1, 2, 3, 4, 5, 6])).toBe("QIAN_ALL_NINE");
  });

  it("KUN_ALL_SIX", () => {
    const lines = linesFromValues([6, 6, 6, 6, 6, 6]);
    const p = getHexagram(lines);
    expect(determineMutationRule(p, lines, [1, 2, 3, 4, 5, 6])).toBe("KUN_ALL_SIX");
  });

  it("SIX_ALL_CHANGING for non Qian/Kun", () => {
    const lines = linesFromValues([9, 9, 6, 6, 6, 6]);
    const p = getHexagram(lines);
    expect(determineMutationRule(p, lines, [1, 2, 3, 4, 5, 6])).toBe("SIX_ALL_CHANGING");
  });
});

describe("selectTextsForClaude", () => {
  it("SIX_ALL_CHANGING clears primary image", () => {
    const lines = linesFromValues([9, 9, 6, 6, 6, 6]);
    const p = getHexagram(lines);
    const t = getHexagram(applyMutations(lines));
    const texts = selectTextsForClaude(p, t, lines, [1, 2, 3, 4, 5, 6], "SIX_ALL_CHANGING");
    expect(texts.primaryImage).toBe("");
  });

  it("QIAN_ALL_NINE sets special yao", () => {
    const lines = linesFromValues([9, 9, 9, 9, 9, 9]);
    const p = getHexagram(lines);
    const t = getHexagram(applyMutations(lines));
    const texts = selectTextsForClaude(p, t, lines, [1, 2, 3, 4, 5, 6], "QIAN_ALL_NINE");
    expect(texts.specialYaoText).toBeTruthy();
    expect(texts.selectedLineTexts).toHaveLength(0);
  });
});

describe("coin distribution (Monte Carlo)", () => {
  it("approximates 6/9 at 12.5% and 7/8 at 37.5%", () => {
    const n = 24_000;
    const counts = { 6: 0, 7: 0, 8: 0, 9: 0 };
    for (let k = 0; k < n; k++) {
      const v = throwThreeCoins(Math.random);
      counts[v]++;
    }
    const p6 = counts[6] / n;
    const p9 = counts[9] / n;
    const p7 = counts[7] / n;
    const p8 = counts[8] / n;
    expect(p6).toBeGreaterThan(0.11);
    expect(p6).toBeLessThan(0.14);
    expect(p9).toBeGreaterThan(0.11);
    expect(p9).toBeLessThan(0.14);
    expect(p7).toBeGreaterThan(0.35);
    expect(p7).toBeLessThan(0.40);
    expect(p8).toBeGreaterThan(0.35);
    expect(p8).toBeLessThan(0.40);
  });
});

describe("performCastFromLineValues", () => {
  it("matches performCast output for the same six values", () => {
    const rng = () => 0.4;
    const auto = performCast("q", "en", { rng, id: "auto-id" });
    const vec = auto.lines.map((l) => l.value) as [6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9];
    const manual = performCastFromLineValues("q", "en", vec, { id: "manual-id" });
    expect(manual.lines.map((l) => l.value)).toEqual(vec);
    expect(manual.primaryHexagram.number).toBe(auto.primaryHexagram.number);
    expect(manual.transformedHexagram?.number ?? null).toBe(auto.transformedHexagram?.number ?? null);
    expect(manual.changingLines).toEqual(auto.changingLines);
    expect(manual.mutationRule).toBe(auto.mutationRule);
  });

  it("throws when not exactly six values", () => {
    expect(() => performCastFromLineValues("q", "en", [7, 7, 7])).toThrow(RangeError);
  });

  it("previewCastFromLineValues matches manual cast fields", () => {
    const vec: [6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9, 6 | 7 | 8 | 9] = [7, 7, 7, 8, 8, 8];
    const full = performCastFromLineValues("q", "es", vec, { id: "x" });
    const prev = previewCastFromLineValues(vec);
    expect(prev.lines).toEqual(full.lines);
    expect(prev.primaryHexagram.number).toBe(full.primaryHexagram.number);
    expect(prev.transformedHexagram?.number ?? null).toBe(full.transformedHexagram?.number ?? null);
    expect(prev.changingLines).toEqual(full.changingLines);
    expect(prev.mutationRule).toBe(full.mutationRule);
  });
});

describe("performCast", () => {
  it("returns stable id with fixed rng sequence", () => {
    let s = 1;
    const rng = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    const a = performCast("test", "en", { rng, id: "fixed-id" });
    expect(a.id).toBe("fixed-id");
    expect(a.lines).toHaveLength(6);
  });

  it("castSixLines respects injected rng", () => {
    const seq = Array.from({ length: 18 }, () => 0.1);
    let idx = 0;
    const rng = () => seq[idx++] ?? 0.5;
    const lines = castSixLines(rng);
    expect(lines.every((l) => l.value === 6)).toBe(true);
  });
});
