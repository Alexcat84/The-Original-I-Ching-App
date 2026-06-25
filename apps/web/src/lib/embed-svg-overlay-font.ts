import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

/**
 * Sharp/librsvg on Linux (e.g. Vercel) has no CJK or Latin Extended fonts. Overlay SVGs
 * use <text> for Chinese titles and English/Legge romanizations; without embedded
 * @font-face rules, glyphs render as tofu boxes.
 *
 * IMPORTANT REGRESSION NOTE:
 * - Keep local Traditional Chinese font loading as primary path for overlay-title-zh.
 * - Embed a separate Latin Extended face for overlay-title-en (Legge diacritics: ă, Ž…).
 * - Do NOT replace the English line's font-family with the CJK face — that caused
 *   subtitle/watermark regressions (see IMAGE_OVERLAY_LEGGE_DIACRITICS_AUDIT_2026-06-24.md).
 *
 * Google Fonts css2 API with `text=` remains fallback-only.
 */

export const OVERLAY_TITLE_ZH_FONT = "Noto Serif TC, Noto Serif SC, SimSun, STSong, serif";
export const OVERLAY_TITLE_EN_FONT = "Georgia, 'Noto Serif', serif";
export const OVERLAY_TITLE_EN_FONT_WEIGHT = "400";
export const OVERLAY_TITLE_ZH_CLASS = "overlay-title-zh";
export const OVERLAY_TITLE_EN_CLASS = "overlay-title-en";
/** Embedded Noto Sans Symbols 2 — mutation arrow (U+2192) in English tspans. */
export const OVERLAY_SYMBOL_FONT_FAMILY = "NotoSymbols2Overlay";

const CJK_FONT_FAMILY = "NotoSerifTCOverlay";
const LATIN_FONT_FAMILY = "NotoSerifLatinOverlay";
const SYMBOL_FONT_FAMILY = "NotoSymbols2Overlay";
const LOCAL_TC_FONT_SPEC =
  "@fontsource/noto-serif-tc/files/noto-serif-tc-chinese-traditional-700-normal.woff";
const LOCAL_LATIN_FONT_SPEC = "@fontsource/noto-serif/files/noto-serif-latin-ext-400-normal.woff";
const LOCAL_SYMBOL_FONT_SPEC =
  "@fontsource/noto-sans-symbols-2/files/noto-sans-symbols-2-symbols-400-normal.woff";
const requireForResolve = createRequire(import.meta.url);

let cachedCjkSubsetKey: string | null = null;
let cachedCjkWoff2Base64: string | null = null;
let cachedLatinSubsetKey: string | null = null;
let cachedLatinWoff2Base64: string | null = null;
let cachedLocalCjkWoff2Base64: string | null | undefined;
let cachedLocalLatinWoff2Base64: string | null | undefined;
let cachedLocalSymbolWoff2Base64: string | null | undefined;

function extractOverlayLineInnerText(svg: string, className: string): string {
  const re = new RegExp(`<text[^>]*class="${className}"[^>]*>([\\s\\S]*?)<\\/text>`, "gi");
  const parts: string[] = [];
  for (const match of svg.matchAll(re)) {
    if (match[1]) parts.push(match[1]);
  }
  return parts
    .join("")
    .replace(/<[^>]+>/g, "")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** CJK hanzi (+ arrow) used in overlay Chinese title line. */
export function collectCjkOverlayChars(text: string): string {
  const set = new Set<string>();
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)) {
      set.add(ch);
    }
  }
  if (text.includes("\u2192")) set.add("\u2192");
  return [...set].join("");
}

/** Latin overlay title chars (Legge diacritics, digits, punctuation). */
export function collectLatinOverlayChars(text: string): string {
  const set = new Set<string>();
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (
      (cp >= 0x20 && cp <= 0x7e) ||
      (cp >= 0x00a0 && cp <= 0x024f) ||
      (cp >= 0x0300 && cp <= 0x036f)
    ) {
      set.add(ch);
    }
  }
  set.add("\u2192");
  return [...set].join("");
}

/** @deprecated Use collectCjkOverlayChars / collectLatinOverlayChars on split lines. */
export function collectOverlaySubsetChars(svg: string): string {
  const zh = extractOverlayLineInnerText(svg, OVERLAY_TITLE_ZH_CLASS);
  const en = extractOverlayLineInnerText(svg, OVERLAY_TITLE_EN_CLASS);
  const merged = new Set<string>();
  for (const ch of collectCjkOverlayChars(zh)) merged.add(ch);
  for (const ch of collectLatinOverlayChars(en)) merged.add(ch);
  return [...merged].join("");
}

async function fetchGoogleSubsetWoff2Base64(
  familyParam: string,
  subsetText: string,
  cacheKeyRef: { key: string | null; value: string | null },
): Promise<string | null> {
  if (!subsetText) return null;
  if (cacheKeyRef.key === subsetText && cacheKeyRef.value) {
    return cacheKeyRef.value;
  }
  const cssUrl =
    "https://fonts.googleapis.com/css2?" +
    new URLSearchParams({
      family: familyParam,
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
  cacheKeyRef.key = subsetText;
  cacheKeyRef.value = b64;
  return b64;
}

async function fetchCjkSubsetWoff2Base64(subsetText: string): Promise<string | null> {
  return fetchGoogleSubsetWoff2Base64("Noto Serif TC:wght@700", subsetText, {
    key: cachedCjkSubsetKey,
    value: cachedCjkWoff2Base64,
  });
}

async function fetchLatinSubsetWoff2Base64(subsetText: string): Promise<string | null> {
  return fetchGoogleSubsetWoff2Base64("Noto Serif:wght@400", subsetText, {
    key: cachedLatinSubsetKey,
    value: cachedLatinWoff2Base64,
  });
}

async function loadBundledWoffBase64(
  spec: string,
  fallbackRelativePath: string[],
  cache: { current: string | null | undefined },
): Promise<string | null> {
  if (cache.current !== undefined) return cache.current;
  try {
    const resolved = requireForResolve.resolve(spec);
    const buf = await readFile(resolved);
    cache.current = buf.toString("base64");
    return cache.current;
  } catch {
    try {
      const localPath = path.join(process.cwd(), "node_modules", ...fallbackRelativePath);
      const buf = await readFile(localPath);
      cache.current = buf.toString("base64");
      return cache.current;
    } catch {
      cache.current = null;
      return null;
    }
  }
}

async function loadLocalCjkWoffBase64(): Promise<string | null> {
  return loadBundledWoffBase64(
    LOCAL_TC_FONT_SPEC,
    ["@fontsource", "noto-serif-tc", "files", "noto-serif-tc-chinese-traditional-700-normal.woff"],
    { current: cachedLocalCjkWoff2Base64 },
  );
}

async function loadLocalLatinWoffBase64(): Promise<string | null> {
  return loadBundledWoffBase64(
    LOCAL_LATIN_FONT_SPEC,
    ["@fontsource", "noto-serif", "files", "noto-serif-latin-ext-400-normal.woff"],
    { current: cachedLocalLatinWoff2Base64 },
  );
}

async function loadLocalSymbolWoffBase64(): Promise<string | null> {
  return loadBundledWoffBase64(
    LOCAL_SYMBOL_FONT_SPEC,
    ["@fontsource", "noto-sans-symbols-2", "files", "noto-sans-symbols-2-symbols-400-normal.woff"],
    { current: cachedLocalSymbolWoff2Base64 },
  );
}

function rewriteOverlayFontFamily(
  svg: string,
  className: string,
  quote: "'" | '"',
  newFamily: string,
): string {
  const escapedQuote = quote === "'" ? "'" : '"';
  const re = new RegExp(
    `(<text[^>]*class="${className}"[^>]*font-family=${quote})[^${escapedQuote}]*(${quote})`,
    "g",
  );
  return svg.replace(re, `$1${newFamily}$2`);
}

/**
 * Injects CJK + Latin @font-face rules and rewrites overlay title font-family values
 * so librsvg can render both Chinese and Legge romanization lines.
 */
export async function embedCjkFontInOverlaySvg(svg: string): Promise<string> {
  if (!svg.includes("<text")) return svg;

  const zhText = extractOverlayLineInnerText(svg, OVERLAY_TITLE_ZH_CLASS);
  const enText = extractOverlayLineInnerText(svg, OVERLAY_TITLE_EN_CLASS);
  const cjkSubset = collectCjkOverlayChars(zhText);
  const latinSubset = collectLatinOverlayChars(enText);
  if (!cjkSubset && !latinSubset) return svg;

  try {
    const cjkB64 =
      cjkSubset.length > 0
        ? ((await loadLocalCjkWoffBase64()) ?? (await fetchCjkSubsetWoff2Base64(cjkSubset)))
        : null;
    const latinB64 =
      latinSubset.length > 0
        ? ((await loadLocalLatinWoffBase64()) ?? (await fetchLatinSubsetWoff2Base64(latinSubset)))
        : null;
    if (!cjkB64 && !latinB64) return svg;

    const needsSymbolFont =
      zhText.includes("\u2192") || enText.includes("\u2192") || svg.includes("\u2192");
    const latinNeedsSymbol = enText.includes("\u2192");
    const symbolB64 = needsSymbolFont ? await loadLocalSymbolWoffBase64() : null;
    const faces: string[] = [];
    if (cjkB64) {
      faces.push(
        `@font-face{font-family:'${CJK_FONT_FAMILY}';font-style:normal;font-weight:700;src:url(data:font/woff;base64,${cjkB64}) format('woff');font-display:swap;}`,
      );
    }
    if (latinB64) {
      faces.push(
        `@font-face{font-family:'${LATIN_FONT_FAMILY}';font-style:normal;font-weight:400;src:url(data:font/woff;base64,${latinB64}) format('woff');font-display:swap;}`,
      );
    }
    if (symbolB64) {
      faces.push(
        `@font-face{font-family:'${SYMBOL_FONT_FAMILY}';font-style:normal;font-weight:400;src:url(data:font/woff;base64,${symbolB64}) format('woff');font-display:swap;}`,
      );
    }

    const face = `<defs><style type="text/css"><![CDATA[
${faces.join("\n")}
]]></style></defs>`;

    let result = svg.replace(/<svg\s([^>]*)>/, `<svg $1>${face}`);
    const cjkFamily = symbolB64
      ? `${SYMBOL_FONT_FAMILY}, ${CJK_FONT_FAMILY}, Noto Serif TC, Noto Serif SC, serif`
      : `${CJK_FONT_FAMILY}, Noto Serif TC, Noto Serif SC, serif`;
    const latinFamily =
      symbolB64 && latinNeedsSymbol
        ? `${SYMBOL_FONT_FAMILY}, ${LATIN_FONT_FAMILY}, Georgia, 'Noto Serif', serif`
        : `${LATIN_FONT_FAMILY}, Georgia, 'Noto Serif', serif`;

    if (cjkB64) {
      result = rewriteOverlayFontFamily(result, OVERLAY_TITLE_ZH_CLASS, "'", cjkFamily);
    }
    if (latinB64) {
      result = rewriteOverlayFontFamily(result, OVERLAY_TITLE_EN_CLASS, '"', latinFamily);
    }

    return result;
  } catch {
    return svg;
  }
}
