/**

 * QA code: TS-WEB-OVR-004 overlay-title-pango · v1.2.0

 * Area: apps/web/src/lib/overlay-title-pango, sumi-hexagram-art (overlay variant)

 * Family: WEB-OVR

 *

 * Exercises the ACTUAL production path (buildSumiHexagramOverlaySvgDataUrl ->

 * renderOverlayTitleLayer -> @napi-rs/canvas/Skia), not just markup/layout-math

 * strings — that gap (no test ever rendered through the real font-resolution path,

 * see docs/auditorias/20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md) is exactly

 * why the tofu/arrow-overlap regression shipped to production despite a green test

 * suite. v1.2.0: mixed CJK/Latin segmentation (Zhou Yi #N); font assignment gate.

 */

import { access } from "node:fs/promises";

import { describe, expect, it, beforeAll } from "vitest";

import * as fontkit from "fontkit";

import sharp from "sharp";

import { getAllHexagramRecords, type HexagramRecord } from "@iching-oracle/iching-data";

import {

  assertOverlayTitleFontsRegistered,

  latinFontKeyForChar,

  resolveOverlayTitleFontPaths,

  type OverlayTitleFontPaths,

} from "../overlay-title-font-paths";

import {
  CJK_FAMILY,
  LATIN_BASIC_FAMILY,
  renderArrowGlyph,
  splitTextByOverlayFont,
} from "../overlay-title-pango";

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



/** Our WOFF assets are single fonts, never font collections (.ttc). */

function openSingleFont(path: string): fontkit.Font {

  return fontkit.openSync(path) as fontkit.Font;

}



describe("overlay title font paths (production resolver)", () => {

  it("resolveOverlayTitleFontPaths finds all three files on disk", async () => {

    const paths = await resolveOverlayTitleFontPaths();

    await expect(access(paths.latinBasic)).resolves.toBeUndefined();

    await expect(access(paths.latinExt)).resolves.toBeUndefined();

    await expect(access(paths.cjk)).resolves.toBeUndefined();

  });



  it("registerFromPath succeeds for resolved paths (Linux CI gate)", async () => {

    const paths = await resolveOverlayTitleFontPaths();

    expect(() => assertOverlayTitleFontsRegistered(paths)).not.toThrow();

  });

});



describe("overlay title mixed segmentation (Zhou Yi #N + hanzi, AUD-IMG-OVR-03 §15)", () => {

  it("routes # and digits to Latin, hanzi to CJK", () => {

    expect(splitTextByOverlayFont("#2 坤")).toEqual([

      { text: "#2 ", family: LATIN_BASIC_FAMILY },

      { text: "坤", family: CJK_FAMILY },

    ]);

  });



  it("keeps pure hanzi on a single CJK chunk", () => {

    expect(splitTextByOverlayFont("坤")).toEqual([{ text: "坤", family: CJK_FAMILY }]);

  });



  it("assigns every Zhou Yi subtitle char to a font that has the glyph", async () => {

    const paths = await resolveOverlayTitleFontPaths();

    const cjkFont = openSingleFont(paths.cjk);

    const latinBasicFont = openSingleFont(paths.latinBasic);

    const latinExtFont = openSingleFont(paths.latinExt);



    function assertLineGlyphs(line: string, label: string) {

      for (const { text, family } of splitTextByOverlayFont(line)) {

        for (const ch of text) {

          if (ch === " ") continue;

          const cp = ch.codePointAt(0)!;

          const font =

            family === CJK_FAMILY

              ? cjkFont

              : latinFontKeyForChar(ch) === "latinBasic"

                ? latinBasicFont

                : latinExtFont;

          expect(

            font.hasGlyphForCodePoint(cp),

            `${label}: missing ${ch} (U+${cp.toString(16)}) in ${family}`,

          ).toBe(true);

        }

      }

    }



    for (const hex of zhouyi) {

      assertLineGlyphs(`#${hex.number} ${hex.name}`, `zhouyi #${hex.number} standalone`);

    }

    assertLineGlyphs("#2 坤", "zhouyi mutation primary #2");

    assertLineGlyphs("#1 乾", "zhouyi mutation transformed #1");

  });

});



describe("overlay title font glyph coverage (exhaustive — all 64 hexagrams x 3 translators)", () => {

  let fontPaths: OverlayTitleFontPaths;

  let cjkFont: fontkit.Font;

  let latinBasicFont: fontkit.Font;

  let latinExtFont: fontkit.Font;



  beforeAll(async () => {

    fontPaths = await resolveOverlayTitleFontPaths();

    cjkFont = openSingleFont(fontPaths.cjk);

    latinBasicFont = openSingleFont(fontPaths.latinBasic);

    latinExtFont = openSingleFont(fontPaths.latinExt);

  });



  function expectLatinCoverage(text: string, source: string) {

    for (const ch of text) {

      const cp = ch.codePointAt(0)!;

      const fontKey = latinFontKeyForChar(ch);

      const font = fontKey === "latinBasic" ? latinBasicFont : latinExtFont;

      expect(

        font.hasGlyphForCodePoint(cp),

        `${source}: missing glyph for "${ch}" (U+${cp.toString(16)}) in ${fontKey} (${fontPaths[fontKey]})`,

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

    const buffer = renderArrowGlyph(32, "#2e2a22");

    const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });

    let opaque = 0;

    for (let i = 3; i < data.length; i += info.channels) if (data[i]! > 10) opaque++;

    expect(opaque / (info.width * info.height)).toBeGreaterThan(0.05);

  });

});



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



const ZH_TITLE_REGION = { left: 0, top: 10, width: 1344, height: 170 };

const EN_TITLE_REGION = { left: 0, top: 140, width: 1344, height: 95 };

const MIN_INK_RATIO = 0.004;



async function expectTitleInk(png: Buffer, label: string): Promise<void> {

  const zh = await inkRatio(png, ZH_TITLE_REGION);

  const en = await inkRatio(png, EN_TITLE_REGION);

  expect(zh, `${label} (ZH band)`).toBeGreaterThan(MIN_INK_RATIO);

  expect(en, `${label} (EN band)`).toBeGreaterThan(MIN_INK_RATIO);

}



function byNumber(records: readonly HexagramRecord[], number: number): HexagramRecord {

  const found = records.find((h) => h.number === number);

  if (!found) throw new Error(`hexagram #${number} not found`);

  return found;

}



describe("overlay title rendering — Zhou Yi regression (§0 / §15)", () => {

  it("renders #2 坤 -> #1 乾 with subtitle prefix and hanzi ink", async () => {

    const png = await renderOverlayTitlePng({

      primaryNumber: 2,

      primaryName: "坤",

      primaryChinese: "坤",

      transformedNumber: 1,

      transformedName: "乾",

      transformedChinese: "乾",

    });

    await expectTitleInk(png, "zhouyi #2 坤 -> #1 乾");

  });

});



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

    await expectTitleInk(png, "legge #2 Khwăn -> #1 Khien");

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

      await expectTitleInk(png, `wilhelm #${p} -> #${t}`);

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

      await expectTitleInk(png, `legge #${p} -> #${t}`);

    }

  });

});



describe("overlay title rendering — CJK gap characters (#43/#44, AUD-IMG-OVR-03 §10)", () => {

  it("renders #43 夬 -> #44 姤 with hanzi ink in the ZH band", async () => {

    const primary = byNumber(wilhelm, 43);

    const transformed = byNumber(wilhelm, 44);

    const png = await renderOverlayTitlePng({

      primaryNumber: primary.number,

      primaryName: primary.name,

      primaryChinese: primary.chineseName,

      transformedNumber: transformed.number,

      transformedName: transformed.name,

      transformedChinese: transformed.chineseName,

    });

    expect(await inkRatio(png, ZH_TITLE_REGION)).toBeGreaterThan(MIN_INK_RATIO);

    expect(await inkRatio(png, EN_TITLE_REGION)).toBeGreaterThan(MIN_INK_RATIO);

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

      await expectTitleInk(png, `legge #${hex.number} ${hex.name}`);

    }

  }, 30_000);



  it("renders all 64 Wilhelm names standalone", async () => {

    for (const hex of wilhelm) {

      const png = await renderOverlayTitlePng({

        primaryNumber: hex.number,

        primaryName: hex.name,

        primaryChinese: hex.chineseName,

      });

      await expectTitleInk(png, `wilhelm #${hex.number} ${hex.name}`);

    }

  }, 30_000);



  it("renders all 64 Zhou Yi names standalone (hanzi in the EN line)", async () => {

    for (const hex of zhouyi) {

      const png = await renderOverlayTitlePng({

        primaryNumber: hex.number,

        primaryName: hex.name,

        primaryChinese: hex.chineseName,

      });

      await expectTitleInk(png, `zhouyi #${hex.number} ${hex.name}`);

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

      await expectTitleInk(png, `legge #${hex.number} ${hex.name} -> #${next.number} ${next.name}`);

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

    await expectTitleInk(png, "longest wilhelm pair");

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

    await expectTitleInk(png, "longest legge pair");

  });

});


