import { describe, expect, it } from "vitest";
import {
  OVERLAY_TITLE_EN_CLASS,
  OVERLAY_TITLE_EN_FONT,
  OVERLAY_TITLE_EN_FONT_WEIGHT,
  OVERLAY_TITLE_ZH_CLASS,
  OVERLAY_TITLE_ZH_FONT,
  collectCjkOverlayChars,
  collectLatinOverlayChars,
  embedCjkFontInOverlaySvg,
} from "@/lib/embed-svg-overlay-font";

function buildSampleOverlaySvg(subZh: string, subEn: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1344" height="768" viewBox="0 0 1344 768">
<text x="672" y="125" text-anchor="middle" class="${OVERLAY_TITLE_ZH_CLASS}" fill="#1c1a16" font-size="92" font-family='${OVERLAY_TITLE_ZH_FONT}' font-weight="700">${subZh}</text>
<text x="672" y="178" text-anchor="middle" class="${OVERLAY_TITLE_EN_CLASS}" fill="#2e2a22" font-size="32" font-family="${OVERLAY_TITLE_EN_FONT}" font-weight="${OVERLAY_TITLE_EN_FONT_WEIGHT}">${subEn}</text>
</svg>`;
}

describe("collectLatinOverlayChars", () => {
  it("includes Legge diacritics used in overlay names", () => {
    const chars = collectLatinOverlayChars("#32 Hăng → #35 Žin");
    expect(chars).toContain("ă");
    expect(chars).toContain("Ž");
    expect(chars).toContain("→");
  });
});

describe("collectCjkOverlayChars", () => {
  it("includes hanzi and mutation arrow", () => {
    const chars = collectCjkOverlayChars("恆 → 乾");
    expect(chars).toContain("恆");
    expect(chars).toContain("乾");
    expect(chars).toContain("→");
  });
});

describe("embedCjkFontInOverlaySvg", () => {
  it("embeds separate CJK and Latin faces without applying TC to the English line", async () => {
    const svg = buildSampleOverlaySvg("恆", "#32 Hăng");
    const embedded = await embedCjkFontInOverlaySvg(svg);

    expect(embedded).toContain("NotoSerifTCOverlay");
    expect(embedded).toContain("NotoSerifLatinOverlay");
    expect(embedded).toMatch(
      new RegExp(
        `class="${OVERLAY_TITLE_EN_CLASS}"[^>]*font-family="NotoSerifLatinOverlay`,
      ),
    );
    expect(embedded).not.toMatch(
      new RegExp(
        `class="${OVERLAY_TITLE_EN_CLASS}"[^>]*font-family='NotoSerifTCOverlay`,
      ),
    );
  });

  it("embeds symbol font when English overlay includes mutation arrow", async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1344" height="768" viewBox="0 0 1344 768">
<text x="672" y="125" text-anchor="middle" class="${OVERLAY_TITLE_ZH_CLASS}" fill="#1c1a16" font-size="92" font-family='${OVERLAY_TITLE_ZH_FONT}' font-weight="700">恆 → 乾</text>
<text x="672" y="178" text-anchor="middle" class="${OVERLAY_TITLE_EN_CLASS}" fill="#2e2a22" font-size="32" font-family="${OVERLAY_TITLE_EN_FONT}" font-weight="${OVERLAY_TITLE_EN_FONT_WEIGHT}">#32 Hăng <tspan font-family="'NotoSymbols2Overlay'">\u2192</tspan> #35 Žin</text>
</svg>`;
    const embedded = await embedCjkFontInOverlaySvg(svg);

    expect(embedded).toContain("NotoSymbols2Overlay");
    expect(embedded).toContain("NotoSerifLatinOverlay");
  });
});
