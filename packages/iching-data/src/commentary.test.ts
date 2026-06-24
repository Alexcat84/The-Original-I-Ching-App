import { describe, expect, it } from "vitest";
import {
  getAllWilhelmCommentary,
  getWilhelmCommentaryByNumber,
  getAllLeggeCommentary,
  getLeggeCommentaryByNumber,
} from "./index.js";

describe("wilhelm commentary", () => {
  it("has 64 hexagrams", () => {
    expect(getAllWilhelmCommentary()).toHaveLength(64);
  });

  it("always has non-empty about block and per-point commentary", () => {
    for (const c of getAllWilhelmCommentary()) {
      expect(c.about.intro.length).toBeGreaterThan(0);
      expect(c.about.miscNotes.length).toBeGreaterThan(0);
      expect(c.about.rulerNote.length).toBeGreaterThan(0);
      expect(c.judgment.bookOne.length).toBeGreaterThan(0);
      expect(c.judgment.tenWings.length).toBeGreaterThan(0);
      expect(c.image.bookOne.length).toBeGreaterThan(0);
      expect(c.image.tenWings.length).toBeGreaterThan(0);
      expect(c.lines).toHaveLength(6);
      for (const line of c.lines) {
        expect(line.commentary.bookOne.length).toBeGreaterThan(0);
        expect(line.commentary.tenWings.length).toBeGreaterThan(0);
      }
    }
  });

  it("only has sequence empty for hex 1 and 2", () => {
    for (const c of getAllWilhelmCommentary()) {
      if (c.number === 1 || c.number === 2) {
        expect(c.about.sequence).toBe("");
      } else {
        expect(c.about.sequence.length).toBeGreaterThan(0);
      }
    }
  });

  it("only has wenYen for hex 1 and 2", () => {
    for (const c of getAllWilhelmCommentary()) {
      if (c.number === 1 || c.number === 2) {
        expect(c.wenYen).not.toBeNull();
        expect(c.wenYen?.text.length ?? 0).toBeGreaterThan(0);
      } else {
        expect(c.wenYen).toBeNull();
      }
    }
  });

  it("only has yong for hex 1 and 2", () => {
    for (const c of getAllWilhelmCommentary()) {
      if (c.number === 1 || c.number === 2) {
        expect(c.yong).not.toBeNull();
      } else {
        expect(c.yong).toBeNull();
      }
    }
  });

  it("looks up by number", () => {
    const c = getWilhelmCommentaryByNumber(1);
    expect(c.number).toBe(1);
  });
});

describe("legge commentary", () => {
  it("has 64 hexagrams", () => {
    expect(getAllLeggeCommentary()).toHaveLength(64);
  });

  it("always has non-empty footnotes and Great Symbolism image", () => {
    for (const c of getAllLeggeCommentary()) {
      expect(c.footnotes.length).toBeGreaterThan(0);
      expect(c.imageSymbolism.length).toBeGreaterThan(0);
    }
  });

  it("only has thwanIntro/linesIntro for hex 1", () => {
    for (const c of getAllLeggeCommentary()) {
      if (c.number === 1) {
        expect(c.thwanIntro?.length ?? 0).toBeGreaterThan(0);
        expect(c.linesIntro?.length ?? 0).toBeGreaterThan(0);
      } else {
        expect(c.thwanIntro).toBeNull();
        expect(c.linesIntro).toBeNull();
      }
    }
  });

  it("covers line positions 1-6, plus 7 (yong) only for hex 1 and 2", () => {
    for (const c of getAllLeggeCommentary()) {
      const positions = c.lineSymbolism.map((l) => l.position).sort((a, b) => a - b);
      if (c.number === 1 || c.number === 2) {
        expect(positions).toEqual([1, 2, 3, 4, 5, 6, 7]);
      } else {
        expect(positions).toEqual([1, 2, 3, 4, 5, 6]);
      }
      for (const line of c.lineSymbolism) {
        expect(line.note.length).toBeGreaterThan(0);
      }
    }
  });

  it("looks up by number", () => {
    const c = getLeggeCommentaryByNumber(1);
    expect(c.number).toBe(1);
  });
});
