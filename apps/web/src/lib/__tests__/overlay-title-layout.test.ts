/**
 * QA code: TS-WEB-OVR-002 overlay-title-layout · v1.0.0
 * Area: apps/web/src/lib/overlay-title-layout
 * Family: WEB-OVR
 */

import { describe, expect, it } from "vitest";
import {
  OVERLAY_EN_MAX_WIDTH,
  SUMI_FALLBACK_HEX_TOP_Y,
  buildOverlayEnglishTitleLayout,
  estimateOverlayEnTextWidth,
} from "@/lib/overlay-title-layout";

describe("buildOverlayEnglishTitleLayout", () => {
  it("keeps short static titles on one line at base size", () => {
    const layout = buildOverlayEnglishTitleLayout({
      primaryNumber: 32,
      primaryName: "Hăng",
    });
    expect(layout.lines).toHaveLength(1);
    expect(layout.fontSize).toBeGreaterThanOrEqual(28);
  });

  it("splits long Wilhelm mutation titles into two lines without shrinking below min", () => {
    const layout = buildOverlayEnglishTitleLayout({
      primaryNumber: 26,
      primaryName: "The Taming Power of the Great",
      transformedNumber: 18,
      transformedName: "Work on What Has Been Spoiled [Decay]",
    });
    expect(layout.lines).toHaveLength(2);
    expect(layout.lines[0]).toBe("#26 The Taming Power of the Great");
    expect(layout.lines[1]).toBe("\u2192 #18 Work on What Has Been Spoiled [Decay]");
    for (const line of layout.lines) {
      expect(estimateOverlayEnTextWidth(line, layout.fontSize)).toBeLessThanOrEqual(
        OVERLAY_EN_MAX_WIDTH + 1,
      );
    }
    // Tracks EN_TWO_LINE_MARGIN_ABOVE_HEX (overlay-title-layout.ts, not exported):
    // minimum clearance between the second line's descenders and the hex bar.
    expect(layout.ys[1]! + layout.fontSize * 0.22).toBeLessThanOrEqual(SUMI_FALLBACK_HEX_TOP_Y - 20);
  });

  it("fits typical short mutation titles on one line", () => {
    const layout = buildOverlayEnglishTitleLayout({
      primaryNumber: 3,
      primaryName: "Difficulty at the Beginning",
      transformedNumber: 8,
      transformedName: "Holding Together [Union]",
    });
    expect(layout.lines).toHaveLength(1);
    expect(layout.lines[0]).toContain(" \u2192 #8 ");
    const widest = estimateOverlayEnTextWidth(layout.lines[0]!, layout.fontSize);
    expect(widest).toBeLessThanOrEqual(OVERLAY_EN_MAX_WIDTH + 1);
  });
});
