/**
 * SVG → PNG renderer using @resvg/resvg-js with explicit CJK fonts.
 *
 * WHY THIS EXISTS:
 * sharp (librsvg) ignores @font-face in SVGs. On Vercel there are no system CJK
 * fonts, so some <text> with Chinese can render as tofu. resvg-js can load custom
 * font files in TTF/OTF/WOFF formats.
 *
 * FONT SOURCES:
 * - @fontsource/noto-serif-tc/.../noto-serif-tc-chinese-traditional-700-normal.woff
 *   (preferred for Traditional Chinese glyphs)
 * - @fontsource/noto-sans-symbols-2/.../noto-sans-symbols-2-symbols-400-normal.woff
 *   (Yi Jing / symbol coverage)
 * - apps/web/fonts/noto-serif-tc-700-subset.ttf (fallback, traced in Next config)
 */

import { Resvg, type ResvgRenderOptions } from "@resvg/resvg-js";
import { access } from "node:fs/promises";
import path from "node:path";
import { FONTSOURCE_WOFF_PATHS } from "./fontsource-woff-paths";

const FONT_FILENAME = "noto-serif-tc-700-subset.ttf";

let resolvedFontPaths: string[] | undefined;

async function findFontFiles(): Promise<string[]> {
  if (resolvedFontPaths !== undefined) return resolvedFontPaths;

  const files: string[] = [];

  // Prefer full Traditional Chinese WOFF from @fontsource to avoid missing glyphs.
  try {
    const resolvedWoff = FONTSOURCE_WOFF_PATHS.notoSerifTc700;
    await access(resolvedWoff);
    files.push(resolvedWoff);
  } catch {
    // best effort
  }
  // Add symbol coverage (e.g. Yi Jing hexagram symbols).
  try {
    const resolvedSymbolsWoff = FONTSOURCE_WOFF_PATHS.notoSansSymbols400;
    await access(resolvedSymbolsWoff);
    files.push(resolvedSymbolsWoff);
  } catch {
    // best effort
  }

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
      files.push(p);
      break;
    } catch {
      continue;
    }
  }

  resolvedFontPaths = files;
  return files;
}

/**
 * Render an SVG string to a PNG Buffer using resvg-js with the bundled CJK font.
 * Both CJK and Latin text render correctly on every platform.
 */
export async function renderSvgToPng(svg: string, width?: number): Promise<Buffer> {
  const fontPaths = await findFontFiles();

  const opts: ResvgRenderOptions = {
    fitTo: width ? { mode: "width", value: width } : undefined,
    font: {
      fontFiles: fontPaths,
      loadSystemFonts: true,
      // Prefer CJK-capable serif by default to avoid tofu fallbacks.
      defaultFontFamily: "Noto Serif TC",
      serifFamily: "Noto Serif TC",
      sansSerifFamily: "Arial",
    },
  };

  const resvg = new Resvg(svg, opts);
  const rendered = resvg.render();
  return Buffer.from(rendered.asPng());
}
