import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Sharp/librsvg on Linux (e.g. Vercel) has no CJK fonts. Overlay SVGs use <text> with Chinese;
 * without an embedded @font-face, glyphs render as tofu boxes.
 * Google Fonts css2 API with `text=` returns a small woff2 subset we embed as data: URL.
 */

const FONT_FAMILY = "NotoSerifSCOverlay";

let cachedSubsetKey: string | null = null;
let cachedWoff2Base64: string | null = null;
let cachedLocalWoff2Base64: string | null | undefined;

/** CJK + common punctuation used in overlay titles (e.g. arrow between hexagram names). */
export function collectOverlaySubsetChars(svg: string): string {
  const set = new Set<string>();
  for (const ch of svg) {
    const cp = ch.codePointAt(0) ?? 0;
    if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)) {
      set.add(ch);
    }
  }
  set.add("易");
  set.add("\u2192");
  return [...set].join("");
}

async function fetchSubsetWoff2Base64(subsetText: string): Promise<string | null> {
  if (!subsetText) return null;
  if (cachedSubsetKey === subsetText && cachedWoff2Base64) {
    return cachedWoff2Base64;
  }
  const cssUrl =
    "https://fonts.googleapis.com/css2?" +
    new URLSearchParams({
      family: "Noto Serif SC:wght@700",
      display: "swap",
      text: subsetText,
    }).toString();
  const cssRes = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!cssRes.ok) return null;
  const css = await cssRes.text();
  const m = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.woff2)\)/);
  if (!m?.[1]) return null;
  const fontRes = await fetch(m[1], { signal: AbortSignal.timeout(30_000) });
  if (!fontRes.ok) return null;
  const buf = Buffer.from(await fontRes.arrayBuffer());
  const b64 = buf.toString("base64");
  cachedSubsetKey = subsetText;
  cachedWoff2Base64 = b64;
  return b64;
}

/**
 * Prefer bundled local font first (no runtime network dependency on Google Fonts).
 */
async function loadLocalWoff2Base64(): Promise<string | null> {
  if (cachedLocalWoff2Base64 !== undefined) return cachedLocalWoff2Base64;
  try {
    const localPath = path.join(
      process.cwd(),
      "node_modules",
      "@fontsource",
      "noto-serif-sc",
      "files",
      "noto-serif-sc-chinese-simplified-700-normal.woff2",
    );
    const buf = await readFile(localPath);
    cachedLocalWoff2Base64 = buf.toString("base64");
    return cachedLocalWoff2Base64;
  } catch {
    cachedLocalWoff2Base64 = null;
    return null;
  }
}

/**
 * Injects a WOFF2 @font-face and rewrites font-family so librsvg can render Chinese overlay text.
 */
export async function embedCjkFontInOverlaySvg(svg: string): Promise<string> {
  if (!svg.includes("<text")) return svg;
  const subset = collectOverlaySubsetChars(svg);
  if (!subset) return svg;

  try {
    const b64 = (await loadLocalWoff2Base64()) ?? (await fetchSubsetWoff2Base64(subset));
    if (!b64) return svg;

    const face = `<defs><style type="text/css"><![CDATA[
@font-face{font-family:'${FONT_FAMILY}';font-style:normal;font-weight:700;src:url(data:font/woff2;base64,${b64}) format('woff2');font-display:swap;}
]]></style></defs>`;

    const withDefs = svg.replace(/<svg\s([^>]*)>/, `<svg $1>${face}`);
    return withDefs
      .replaceAll("font-family='Noto Serif SC, SimSun, STSong, serif'", `font-family='${FONT_FAMILY}, serif'`)
      .replaceAll('font-family="Noto Serif SC, SimSun, STSong, serif"', `font-family="${FONT_FAMILY}, serif"`)
      .replaceAll(
        'font-size="30" font-family="serif">易',
        `font-size="30" font-family="${FONT_FAMILY}, serif">易`,
      );
  } catch {
    return svg;
  }
}
