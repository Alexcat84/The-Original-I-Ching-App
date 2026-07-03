/**
 * QA code: TS-WEB-LIB-001 library-data · v1.0.0
 * Area: apps/web/src/lib/library
 * Family: WEB-LIB
 */

import { describe, expect, it } from "vitest";
import { getLibrarySummaries, getLibraryDetail } from "@/lib/library/library-data";
import { TRIGRAM_IDS } from "@/lib/library/trigram-meta";

describe("library-data (Wilhelm DE runtime)", () => {
  it("loads 64 summaries with resolvable trigram ids", () => {
    const summaries = getLibrarySummaries();
    expect(summaries).toHaveLength(64);
    for (const item of summaries) {
      expect(TRIGRAM_IDS).toContain(item.upperTrigram);
      expect(TRIGRAM_IDS).toContain(item.lowerTrigram);
      expect(item.englishName.length).toBeGreaterThan(0);
    }
  });

  it("uses Legge transliterations as display names (englishName comes from Legge, not Wilhelm DE)", () => {
    const summaries = getLibrarySummaries();
    const byNumber = new Map(summaries.map((s) => [s.number, s]));
    expect(byNumber.get(1)?.englishName).toBe("Khien");
    expect(byNumber.get(56)?.englishName).toBe("Lü");
    expect(byNumber.get(64)?.englishName).toBe("Wei Žî");
  });

  it("loads Wilhelm DE commentary for detail pages", () => {
    const detail = getLibraryDetail(1)!;
    expect(detail.records.wilhelm.judgment).toMatch(/Schöpf/i);
    expect(detail.commentary.wilhelm.about.intro.length).toBeGreaterThan(0);
  });
});
