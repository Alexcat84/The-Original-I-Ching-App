/**
 * QA code: TS-WEB-OVR-004 overlay-title-pango · v1.0.0
 * Area: apps/web/src/lib/overlay-title-pango, sumi-hexagram-art (overlay variant)
 * Family: WEB-OVR
 *
 * Exercises the ACTUAL production path (buildSumiHexagramOverlaySvgDataUrl ->
 * renderOverlayTitleLayer -> sharp/Pango), not just markup/layout-math strings — that
 * gap (no test ever rendered through the real font-resolution path, see
 * docs/auditorias/20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md) is exactly why the
 * tofu/arrow-overlap regression shipped to production despite a green test suite.
 * Runs by default (no env-var skip) so it actually executes in CI on every change.
 */
import { describe, expect, it } from "vitest";
import * as fontkit from "fontkit";
import sharp from "sharp";
import { getAllHexagramRecords, type HexagramRecord } from "@iching-oracle/iching-data";
import { OVERLAY_TITLE_FONT_FILES, fontFileForLatinChar, renderArrowGlyph } from "../overlay-title-pango";
import { buildSumiHexagramOverlaySvgDataUrl, type SumiLineInput } from "../sumi-hexagram-art";

const wilhelm = getAllHexagramRecords({ translator: "wilhelm" });
const legge = getAllHexagramRecords({ translator: "legge" });
const zhouyi = getAllHexagramRecords({ translator: "zhouyi" });

const FIXTURE_LINES: SumiLineInput[] = [
  { position: 1, value: 7, isChanging: false },
  { position: 2, value: 7, isChanging: false },
  { position: 3, value: 7, isChanging: false },
  { position: 4, value: 7, isChanging: false },
  { position: 5, value: 7, isChanging: false },
  { position: 6, value: 7, isChanging: false },
];

// ---------------------------------------------------------------------------
// 1. Exhaustive, deterministic glyph-coverage — every codepoint in every
//    translator's real name data, checked against the exact font files and
//    selection rule the renderer uses. No rendering involved; fast and 100%
//    reproducible regardless of OS/fontconfig/system-font availability.
// ---------------------------------------------------------------------------

/** Our WOFF assets are single fonts, never font collections (.ttc). */
function openSingleFont(path: string): fontkit.Font {
  return fontkit.openSync(path) as fontkit.Font;
}

describe("overlay title font glyph coverage (exhaustive — all 64 hexagrams x 3 translators)", () => {
  const cjkFont = openSingleFont(OVERLAY_TITLE_FONT_FILES.cjk);
  const latinBasicFont = openSingleFont(OVERLAY_TITLE_FONT_FILES.latinBasic);
  const latinExtFont = openSingleFont(OVERLAY_TITLE_FONT_FILES.latinExt);

  function expectLatinCoverage(text: string, source: string) {
    for (const ch of text) {
      const cp = ch.codePointAt(0)!;
      const expectedFile = fontFileForLatinChar(ch);
      const font = expectedFile === OVERLAY_TITLE_FONT_FILES.latinBasic ? latinBasicFont : latinExtFont;
      expect(
        font.hasGlyphForCodePoint(cp),
        `${source}: missing glyph for "${ch}" (U+${cp.toString(16)}) in ${expectedFile}`,
      ).toBe(true);
    }
  }

  function expectCjkCoverage(text: string, source: string) {
    for (const ch of text) {
      const cp = ch.codePointAt(0)!;
      if (cp < 0x3400) continue; // shared punctuation/digits, not part of the CJK font's job
      expect(
        cjkFont.hasGlyphForCodePoint(cp),
        `${source}: missing hanzi glyph for "${ch}" (U+${cp.toString(16)})`,
      ).toBe(true);
    }
  }

  it("covers every Wilhelm name", () => {
    expect(wilhelm).toHaveLength(64);
    for (const hex of wilhelm) expectLatinCoverage(hex.name, `wilhelm #${hex.number} ${hex.name}`);
  });

  it("covers every Legge name (the diacritic-heavy translator that regressed)", () => {
    expect(legge).toHaveLength(64);
    for (const hex of legge) expectLatinCoverage(hex.name, `legge #${hex.number} ${hex.name}`);
  });

  it("covers every chineseName across all three translators with the CJK font", () => {
    for (const hex of [...wilhelm, ...legge, ...zhouyi]) {
      expectCjkCoverage(hex.chineseName, `#${hex.number} ${hex.chineseName}`);
    }
  });

  it("covers the Zhou Yi name field too — it's bare hanzi, not a romanization", () => {
    expect(zhouyi).toHaveLength(64);
    for (const hex of zhouyi) expectCjkCoverage(hex.name, `zhouyi #${hex.number} ${hex.name}`);
  });
});

describe("overlay title mutation arrow (drawn as a vector, not a font glyph)", () => {
  it("renders non-empty ink — no font/fallback dependency for U+2192 at all", async () => {
    const { buffer, width, height } = await renderArrowGlyph(32, "#2e2a22");
    const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
    let opaque = 0;
    for (let i = 3; i < data.length; i += info.channels) if (data[i]! > 10) opaque++;
    expect(opaque / (width * height)).toBeGreaterThan(0.05);
  });
});

// ---------------------------------------------------------------------------
// 2. Render-and-pixel-check through the real production function — catches
//    crashes, silently-empty renders, and missing-glyph fallbacks that the
//    static coverage check above can't (e.g. a font file failing to load).
// ---------------------------------------------------------------------------

type TitleBuildParams = {
  primaryNumber: number;
  primaryName: string;
  primaryChinese: string;
  transformedNumber?: number;
  transformedName?: string;
  transformedChinese?: string;
};

async function renderOverlayTitlePng(params: TitleBuildParams): Promise<Buffer> {
  const dataUrl = await buildSumiHexagramOverlaySvgDataUrl({
    lines: FIXTURE_LINES,
    ...params,
  });
  const prefix = "data:image/svg+xml;charset=utf-8,";
  const svg = decodeURIComponent(dataUrl.slice(prefix.length));
  const match = svg.match(/href="data:image\/png;base64,([^"]+)"/);
  if (!match) throw new Error("overlay SVG has no embedded title <image> — renderOverlayTitleLayer regressed");
  return Buffer.from(match[1]!, "base64");
}

/** Fraction of pixels with meaningful alpha in a cropped region — 0 means nothing rendered there. */
async function inkRatio(
  png: Buffer,
  region: { left: number; top: number; width: number; height: number },
): Promise<number> {
  const { data, info } = await sharp(png)
    .extract(region)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let opaque = 0;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i]! > 10) opaque++;
  }
  return opaque / (region.width * region.height);
}

// Generous regions covering both 1-line and 2-line English layouts (see
// overlay-title-layout.ts: SUMI_OVERLAY_HEX_TOP_Y=238 bounds how low EN text can sit).
const ZH_TITLE_REGION = { left: 0, top: 10, width: 1344, height: 170 };
const EN_TITLE_REGION = { left: 0, top: 140, width: 1344, height: 95 };
const MIN_INK_RATIO = 0.004;

function byNumber(records: readonly HexagramRecord[], number: number): HexagramRecord {
  const found = records.find((h) => h.number === number);
  if (!found) throw new Error(`hexagram #${number} not found`);
  return found;
}

describe("overlay title rendering — production regression case", () => {
  it("renders Legge #2 Khwăn -> #1 Khien without tofu or a dropped text node", async () => {
    const png = await renderOverlayTitlePng({
      primaryNumber: 2,
      primaryName: "Khwăn",
      primaryChinese: "坤",
      transformedNumber: 1,
      transformedName: "Khien",
      transformedChinese: "乾",
    });
    expect(await inkRatio(png, ZH_TITLE_REGION)).toBeGreaterThan(MIN_INK_RATIO);
    expect(await inkRatio(png, EN_TITLE_REGION)).toBeGreaterThan(MIN_INK_RATIO);
  });
});

describe("overlay title rendering — historically-broken resvg-tspan pairs (20260625-AUD-IMG-OVR-02)", () => {
  const knownBadPairs: Array<[number, number]> = [
    [3, 8],
    [6, 10],
    [8, 3],
    [10, 6],
  ];

  it.each(knownBadPairs)(
    "renders #%i -> #%i (resvg used to drop the entire English text node here)",
    async (p, t) => {
      const primary = byNumber(wilhelm, p);
      const transformed = byNumber(wilhelm, t);
      const png = await renderOverlayTitlePng({
        primaryNumber: primary.number,
        primaryName: primary.name,
        primaryChinese: primary.chineseName,
        transformedNumber: transformed.number,
        transformedName: transformed.name,
        transformedChinese: transformed.chineseName,
      });
      expect(await inkRatio(png, EN_TITLE_REGION)).toBeGreaterThan(MIN_INK_RATIO);
    },
  );

  it("renders Legge #6 -> #10 and #32 -> #34 with diacritics + arrow together", async () => {
    for (const [p, t] of [
      [6, 10],
      [32, 34],
    ] as const) {
      const primary = byNumber(legge, p);
      const transformed = byNumber(legge, t);
      const png = await renderOverlayTitlePng({
        primaryNumber: primary.number,
        primaryName: primary.name,
        primaryChinese: primary.chineseName,
        transformedNumber: transformed.number,
        transformedName: transformed.name,
        transformedChinese: transformed.chineseName,
      });
      expect(await inkRatio(png, EN_TITLE_REGION)).toBeGreaterThan(MIN_INK_RATIO);
    }
  });
});

describe("overlay title rendering — every standalone hexagram name (exhaustive over the real glyph set)", () => {
  it("renders all 64 Legge names standalone", async () => {
    for (const hex of legge) {
      const png = await renderOverlayTitlePng({
        primaryNumber: hex.number,
        primaryName: hex.name,
        primaryChinese: hex.chineseName,
      });
      const ratio = await inkRatio(png, EN_TITLE_REGION);
      expect(ratio, `legge #${hex.number} ${hex.name}`).toBeGreaterThan(MIN_INK_RATIO);
    }
  }, 30_000);

  it("renders all 64 Wilhelm names standalone", async () => {
    for (const hex of wilhelm) {
      const png = await renderOverlayTitlePng({
        primaryNumber: hex.number,
        primaryName: hex.name,
        primaryChinese: hex.chineseName,
      });
      const ratio = await inkRatio(png, EN_TITLE_REGION);
      expect(ratio, `wilhelm #${hex.number} ${hex.name}`).toBeGreaterThan(MIN_INK_RATIO);
    }
  }, 30_000);

  it("renders all 64 Zhou Yi names standalone (hanzi in the EN line)", async () => {
    for (const hex of zhouyi) {
      const png = await renderOverlayTitlePng({
        primaryNumber: hex.number,
        primaryName: hex.name,
        primaryChinese: hex.chineseName,
      });
      const ratio = await inkRatio(png, EN_TITLE_REGION);
      expect(ratio, `zhouyi #${hex.number} ${hex.name}`).toBeGreaterThan(MIN_INK_RATIO);
    }
  }, 30_000);
});

describe("overlay title rendering — one mutation pair per hexagram (comprehensive sweep)", () => {
  it("renders every Legge hexagram paired with its wrap-around neighbor", async () => {
    for (const hex of legge) {
      const nextNumber = (hex.number % 64) + 1;
      const next = byNumber(legge, nextNumber);
      const png = await renderOverlayTitlePng({
        primaryNumber: hex.number,
        primaryName: hex.name,
        primaryChinese: hex.chineseName,
        transformedNumber: next.number,
        transformedName: next.name,
        transformedChinese: next.chineseName,
      });
      const ratio = await inkRatio(png, EN_TITLE_REGION);
      expect(ratio, `legge #${hex.number} ${hex.name} -> #${next.number} ${next.name}`).toBeGreaterThan(
        MIN_INK_RATIO,
      );
    }
  }, 30_000);
});

describe("overlay title rendering — longest-name stress cases (max width / 2-line wrap)", () => {
  it("renders the longest Wilhelm name pair without an empty title", async () => {
    const sorted = [...wilhelm].sort((a, b) => b.name.length - a.name.length);
    const primary = sorted[0]!;
    const transformed = sorted[1]!;
    const png = await renderOverlayTitlePng({
      primaryNumber: primary.number,
      primaryName: primary.name,
      primaryChinese: primary.chineseName,
      transformedNumber: transformed.number,
      transformedName: transformed.name,
      transformedChinese: transformed.chineseName,
    });
    expect(await inkRatio(png, EN_TITLE_REGION)).toBeGreaterThan(MIN_INK_RATIO);
  });

  it("renders the longest Legge name pair (diacritics + max width) without an empty title", async () => {
    const sorted = [...legge].sort((a, b) => b.name.length - a.name.length);
    const primary = sorted[0]!;
    const transformed = sorted[1]!;
    const png = await renderOverlayTitlePng({
      primaryNumber: primary.number,
      primaryName: primary.name,
      primaryChinese: primary.chineseName,
      transformedNumber: transformed.number,
      transformedName: transformed.name,
      transformedChinese: transformed.chineseName,
    });
    expect(await inkRatio(png, EN_TITLE_REGION)).toBeGreaterThan(MIN_INK_RATIO);
  });
});
