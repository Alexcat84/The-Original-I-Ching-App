/**
 * QA code: TS-DATA-003 iching-data-trigrams · v1.0.0
 * Area: packages/iching-data/src/trigrams
 * Family: DATA
 */

import { describe, expect, it } from "vitest";
import {
  getAllHexagramRecords,
  getAllTrigrams,
  trigramIdFromWilhelmLabel,
} from "./index.js";

describe("trigram labels (Wilhelm DE + legacy Baynes aliases)", () => {
  it("ships 8 trigrams with canonical DE labels", () => {
    const trigrams = getAllTrigrams();
    expect(trigrams).toHaveLength(8);
    expect(trigrams.map((t) => t.wilhelmLabel).sort()).toEqual(
      [
        "das Abgründige",
        "das Empfangende",
        "das Erregende",
        "das Haftende",
        "das Heitere",
        "das Sanfte",
        "das Schöpferische",
        "das Stillehalten",
      ].sort(),
    );
  });

  it("resolves canonical DE labels and OCR/Baynes aliases", () => {
    expect(trigramIdFromWilhelmLabel("das Schöpferische")).toBe("heaven");
    expect(trigramIdFromWilhelmLabel("der Himmel")).toBe("heaven");
    expect(trigramIdFromWilhelmLabel("THE CREATIVE")).toBe("heaven");
    expect(trigramIdFromWilhelmLabel("das Wasser")).toBe("water");
    expect(trigramIdFromWilhelmLabel("das Heitre")).toBe("lake");
  });

  it("maps every Wilhelm hex upper/lower trigram label", () => {
    for (const record of getAllHexagramRecords({ translator: "wilhelm" })) {
      expect(() => trigramIdFromWilhelmLabel(record.upperTrigram)).not.toThrow();
      expect(() => trigramIdFromWilhelmLabel(record.lowerTrigram)).not.toThrow();
    }
  });
});
