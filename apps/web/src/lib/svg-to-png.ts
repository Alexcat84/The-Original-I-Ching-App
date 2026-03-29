/**
 * SVG → PNG renderer using @resvg/resvg-js with a bundled subset TTF.
 *
 * WHY THIS EXISTS:
 * sharp (librsvg) ignores @font-face in SVGs. On Vercel there are no system CJK
 * fonts, so all <text> with Chinese renders as tofu. resvg-js can load custom
 * font files, but only in TTF/OTF/WOFF format (NOT woff2).
 *
 * FONT FILE:
 * apps/web/fonts/noto-serif-tc-700-subset.ttf — a Google Fonts subset containing
 * all CJK characters used in I Ching hexagram names + basic Latin + punctuation.
 * ~55 KB, committed to the repo. Included in the Vercel bundle via
 * outputFileTracingIncludes in next.config.mjs.
 */

import { Resvg, type ResvgRenderOptions } from "@resvg/resvg-js";
import { access } from "node:fs/promises";
import path from "node:path";

const FONT_FILENAME = "noto-serif-tc-700-subset.ttf";

let resolvedFontPath: string | null | undefined;

async function findFontFile(): Promise<string | null> {
  if (resolvedFontPath !== undefined) return resolvedFontPath;

  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "fonts", FONT_FILENAME),
    path.join(cwd, "apps", "web", "fonts", FONT_FILENAME),
    path.join(cwd, "..", "web", "fonts", FONT_FILENAME),
    path.join(cwd, "..", "..", "apps", "web", "fonts", FONT_FILENAME),
  ];

  for (const p of candidates) {
    try {
      await access(p);
      resolvedFontPath = p;
      return p;
    } catch {
      continue;
    }
  }

  resolvedFontPath = null;
  return null;
}

/**
 * Render an SVG string to a PNG Buffer using resvg-js with the bundled CJK font.
 * Both CJK and Latin text render correctly on every platform.
 */
export async function renderSvgToPng(svg: string, width?: number): Promise<Buffer> {
  const fontPath = await findFontFile();

  const opts: ResvgRenderOptions = {
    fitTo: width ? { mode: "width", value: width } : undefined,
    font: {
      fontFiles: fontPath ? [fontPath] : [],
      loadSystemFonts: true,
      // Keep CJK glyphs explicit in SVG via embedded font-family replacements,
      // but prefer Latin-friendly fallback families for pinyin/roman text.
      defaultFontFamily: "Times New Roman",
      serifFamily: "Times New Roman",
      sansSerifFamily: "Arial",
    },
  };

  const resvg = new Resvg(svg, opts);
  const rendered = resvg.render();
  return Buffer.from(rendered.asPng());
}
