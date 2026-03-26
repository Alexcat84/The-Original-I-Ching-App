/**
 * SVG → PNG renderer using @resvg/resvg-js.
 *
 * WHY THIS EXISTS:
 * sharp (librsvg) ignores @font-face in SVGs. On Vercel where no system CJK
 * fonts exist, all <text> with Chinese characters renders as tofu boxes.
 * resvg-js can load custom font files, producing correct glyphs everywhere.
 *
 * FONT STRATEGY (in order):
 * 1. Bundled woff2 via fontFiles — works if resvg build includes woff2 support.
 * 2. Fetch WOFF subset from Google Fonts, cache in /tmp — guaranteed resvg compat.
 * 3. System fonts (loadSystemFonts: true) — handles localhost with CJK installed.
 */

import { Resvg, type ResvgRenderOptions } from "@resvg/resvg-js";
import { access, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const LOCAL_TC_FONT = "@fontsource/noto-serif-tc/files/noto-serif-tc-chinese-traditional-700-normal.woff2";
const requireForResolve = createRequire(import.meta.url);

const WOFF_CACHE = path.join(os.tmpdir(), "noto-serif-tc-700-iching.woff");

const ICHING_SUBSET =
  "易乾坤震巽坎離艮兌天地雷風水火山澤元亨利貞吉凶悔吝厲無妄大有同人師比小畜履泰否萃升困井革鼎歸妹豐旅漸復姤遁壯觀剝頤蠱蒙需訟謙豫隨臨損益夬解晉明夷家渙節中孚未濟既濟" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 #→.:,;!?'-()☯®©";

let resolvedFontFiles: string[] | undefined;

async function resolveBundledWoff2(): Promise<string | null> {
  try {
    return requireForResolve.resolve(LOCAL_TC_FONT);
  } catch {
    try {
      const p = path.join(
        process.cwd(),
        "node_modules",
        "@fontsource",
        "noto-serif-tc",
        "files",
        "noto-serif-tc-chinese-traditional-700-normal.woff2",
      );
      await access(p);
      return p;
    } catch {
      return null;
    }
  }
}

async function ensureGoogleWoff(): Promise<string | null> {
  try {
    await access(WOFF_CACHE);
    return WOFF_CACHE;
  } catch {
    /* not cached yet */
  }

  try {
    const cssUrl =
      "https://fonts.googleapis.com/css2?" +
      new URLSearchParams({
        family: "Noto Serif TC:wght@700",
        text: ICHING_SUBSET,
        display: "swap",
      }).toString();

    // IE 11 User-Agent → Google Fonts returns WOFF (not woff2).
    const cssRes = await fetch(cssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko",
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!cssRes.ok) return null;

    const css = await cssRes.text();
    const m = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
    if (!m?.[1]) return null;

    const fontRes = await fetch(m[1], { signal: AbortSignal.timeout(20_000) });
    if (!fontRes.ok) return null;

    const buf = Buffer.from(await fontRes.arrayBuffer());
    await writeFile(WOFF_CACHE, buf);
    return WOFF_CACHE;
  } catch {
    return null;
  }
}

async function getFontFiles(): Promise<string[]> {
  if (resolvedFontFiles) return resolvedFontFiles;

  const files: string[] = [];

  const bundled = await resolveBundledWoff2();
  if (bundled) files.push(bundled);

  const woff = await ensureGoogleWoff();
  if (woff) files.push(woff);

  resolvedFontFiles = files;
  return files;
}

/**
 * Render an SVG string to a PNG Buffer using resvg-js with bundled CJK font.
 * Both CJK and Latin text will render correctly on Vercel.
 */
export async function renderSvgToPng(svg: string, width?: number): Promise<Buffer> {
  const fontFiles = await getFontFiles();

  const opts: ResvgRenderOptions = {
    fitTo: width ? { mode: "width", value: width } : undefined,
    font: {
      fontFiles,
      loadSystemFonts: true,
      defaultFontFamily: "Noto Serif TC",
      serifFamily: "Noto Serif TC",
      sansSerifFamily: "Noto Serif TC",
    },
  };

  const resvg = new Resvg(svg, opts);
  const rendered = resvg.render();
  return Buffer.from(rendered.asPng());
}
