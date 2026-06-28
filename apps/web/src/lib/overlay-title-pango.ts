/**
 * Renders the overlay title (Chinese hexagram name(s) + English/Legge romanization,
 * with an optional mutation arrow) to a transparent PNG using @napi-rs/canvas (Skia —
 * the same rendering engine Chrome/Android use), instead of emitting <text> into the
 * SVG that resvg-js renders.
 *
 * WHY THIS EXISTS (see docs/auditorias/20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md):
 * resvg-js has a font/glyph-shaping defect for mixed embedded-font text that the team
 * proved (20260625-AUD-IMG-OVR-02 §10.2) is not predictable from text content alone —
 * fixing the cases found in QA does not guarantee every future hexagram pair is safe.
 *
 * WHY CANVAS, NOT PANGO/SHARP (revision 2 of this fix): the first version used sharp's
 * Pango-based `text()` feature, rendering each font/script segment to its own tightly
 * cropped image and re-stacking them. Two real problems surfaced once checked against
 * a real generated image instead of just a unit test: (1) each segment's tight crop has
 * a different effective height depending on its own ink (e.g. a lone "ă" crops shorter
 * than "Khw"), so stacking by a shared fixed `top` misaligned diacritics above the
 * baseline of the surrounding letters; (2) sharp's `text()` API renders one font per
 * call with no native stroke, so a readability outline had to be faked by dilating the
 * alpha channel — which looked blurry/blocky at real render size. @napi-rs/canvas is a
 * full Canvas2D implementation: `ctx.measureText()` gives real font metrics so multiple
 * fonts on one line share a true baseline with no manual height bookkeeping, and
 * `ctx.strokeText()` is a native, crisp text outline — no raster approximation. Every
 * font file is still registered explicitly via `GlobalFonts.registerFromPath` (no
 * fontconfig/system-font fallback): same "no environment-dependent font resolution"
 * guarantee as the first version, just on a more capable renderer.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GlobalFonts, createCanvas, type SKRSContext2D } from "@napi-rs/canvas";
import { FONTSOURCE_WOFF_PATHS } from "./fontsource-woff-paths";

export const OVERLAY_ARROW = "→";

/**
 * Fontsource's "latin-ext" file only covers U+0100+ (verified via fontkit) — basic
 * letters/digits/punctuation and Latin-1 Supplement (â, î, û, ü, Î, …) live in the
 * separate "latin" (non-ext) file. A romanized name almost always needs both files in
 * the same word (e.g. "Khwăn": K/h/w/n from one file, ă from the other) — there is no
 * single Latin font file that covers everything used in the hexagram name data.
 */
const LATIN_BASIC_FONT_FILE = FONTSOURCE_WOFF_PATHS.notoSerifLatin400;
const LATIN_EXT_FONT_FILE = FONTSOURCE_WOFF_PATHS.notoSerifLatinExt400;
/**
 * @fontsource/noto-serif-tc's pre-built "chinese-traditional-700" subset is missing 3
 * real characters used in production data (夬 #43, 姤 #44, 遯 Zhou Yi #33 — verified via
 * fontkit). This is a custom subset containing exactly the hanzi the real hexagram data
 * uses, fetched from Google's full upstream Noto Serif TC (which does have them) via
 * apps/web/scripts/generate-cjk-title-font-subset.mjs — re-run that script if a
 * translator's chineseName/name ever adds a character outside this set.
 */
const CJK_FONT_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "fonts",
  "noto-serif-tc-hexagram-titles.woff2",
);

const LATIN_BASIC_FAMILY = "IChingOverlayLatinBasic";
const LATIN_EXT_FAMILY = "IChingOverlayLatinExt";
const CJK_FAMILY = "IChingOverlayCJK";

let fontsRegistered = false;
/** Registers every font file this module uses, once per process, by explicit path —
 * never relies on fontconfig/system-font discovery (see module doc comment). */
function ensureFontsRegistered(): void {
  if (fontsRegistered) return;
  GlobalFonts.registerFromPath(LATIN_BASIC_FONT_FILE, LATIN_BASIC_FAMILY);
  GlobalFonts.registerFromPath(LATIN_EXT_FONT_FILE, LATIN_EXT_FAMILY);
  GlobalFonts.registerFromPath(CJK_FONT_FILE, CJK_FAMILY);
  fontsRegistered = true;
}

/** U+0000-U+00FF -> the "latin" file; U+0100+ -> "latin-ext" (exact boundary verified via fontkit). */
function fontFileForLatinChar(ch: string): string {
  return ch.codePointAt(0)! <= 0xff ? LATIN_BASIC_FONT_FILE : LATIN_EXT_FONT_FILE;
}

function familyForLatinChar(ch: string): string {
  return ch.codePointAt(0)! <= 0xff ? LATIN_BASIC_FAMILY : LATIN_EXT_FAMILY;
}

/** Splits a Latin run into the minimal number of contiguous chunks that each map to one font family. */
function splitLatinByFontCoverage(text: string): Array<{ text: string; family: string }> {
  const chunks: Array<{ text: string; family: string }> = [];
  let current = "";
  let currentFamily = "";
  for (const ch of text) {
    const family = familyForLatinChar(ch);
    if (family !== currentFamily && current) {
      chunks.push({ text: current, family: currentFamily });
      current = "";
    }
    current += ch;
    currentFamily = family;
  }
  if (current) chunks.push({ text: current, family: currentFamily });
  return chunks;
}

/** `gapBefore: false` segments are sub-runs of the same word split only because two
 * different font files cover them — they must render flush against the previous
 * segment, not spaced like a word/arrow boundary. */
type TitleSegment =
  | { kind: "text"; text: string; family: string }
  | { kind: "arrow" };

function splitOnArrow(text: string, script: "cjk" | "latin"): Array<{ segment: TitleSegment; gapBefore: boolean }> {
  const rawParts = text.split(OVERLAY_ARROW);
  const out: Array<{ segment: TitleSegment; gapBefore: boolean }> = [];
  rawParts.forEach((part, i) => {
    const trimmed = part.trim();
    if (trimmed.length > 0) {
      if (script === "cjk") {
        out.push({ segment: { kind: "text", text: trimmed, family: CJK_FAMILY }, gapBefore: true });
      } else {
        splitLatinByFontCoverage(trimmed).forEach((chunk, j) => {
          out.push({ segment: { kind: "text", text: chunk.text, family: chunk.family }, gapBefore: j === 0 });
        });
      }
    }
    if (i < rawParts.length - 1) {
      out.push({ segment: { kind: "arrow" }, gapBefore: true });
    }
  });
  return out;
}

/** Block-arrow path (shaft + triangular head), centred on (0,0) at unit scale ~100x65. */
function tracePath(ctx: SKRSContext2D, scale: number): void {
  const pts: Array<[number, number]> = [
    [5, 25],
    [60, 25],
    [60, 5],
    [95, 32.5],
    [60, 60],
    [60, 40],
    [5, 40],
  ];
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    const x = (px - 50) * scale;
    const y = (py - 32.5) * scale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function drawArrow(
  ctx: SKRSContext2D,
  centerX: number,
  centerY: number,
  sizePx: number,
  fillHex: string,
  strokeHex: string | undefined,
  strokeWidthPx: number,
): void {
  const scale = (sizePx * 0.95) / 100;
  ctx.save();
  ctx.translate(centerX, centerY);
  tracePath(ctx, scale);
  if (strokeHex && strokeWidthPx > 0) {
    ctx.lineJoin = "round";
    ctx.lineWidth = strokeWidthPx * 2;
    ctx.strokeStyle = strokeHex;
    ctx.stroke();
  }
  ctx.fillStyle = fillHex;
  ctx.fill();
  ctx.restore();
}

function arrowWidth(sizePx: number): number {
  return sizePx * 0.95;
}

export type OverlayTitleLineSpec = {
  text: string;
  /** Whether `text`'s non-arrow runs are Chinese (CJK font) or Latin/romanized (Latin Extended font). */
  script: "cjk" | "latin";
  fontSizePx: number;
  /** Baseline y in the target canvas. */
  baselineY: number;
  fill: string;
  stroke?: string;
  strokeWidthPx?: number;
};

/** Fraction of font-size used as the visual gap between segments (name / arrow / name). */
const SEGMENT_GAP_RATIO = 0.32;

function drawLine(ctx: SKRSContext2D, canvasWidth: number, spec: OverlayTitleLineSpec): void {
  const parts = splitOnArrow(spec.text, spec.script);
  if (parts.length === 0) return;

  const gapPx = spec.fontSizePx * SEGMENT_GAP_RATIO;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  const widths = parts.map(({ segment }) => {
    if (segment.kind === "arrow") return arrowWidth(spec.fontSizePx);
    ctx.font = `${spec.fontSizePx}px ${segment.family}`;
    return ctx.measureText(segment.text).width;
  });
  const gaps = parts.map((p, i) => (i > 0 && p.gapBefore ? gapPx : 0));
  const totalWidth = widths.reduce((sum, w, i) => sum + w + gaps[i]!, 0);

  const hasStroke = Boolean(spec.stroke) && (spec.strokeWidthPx ?? 0) > 0;
  let x = canvasWidth / 2 - totalWidth / 2;
  for (let i = 0; i < parts.length; i++) {
    x += gaps[i]!;
    const { segment } = parts[i]!;
    if (segment.kind === "arrow") {
      drawArrow(ctx, x + widths[i]! / 2, spec.baselineY - spec.fontSizePx * 0.32, spec.fontSizePx, spec.fill, spec.stroke, spec.strokeWidthPx ?? 0);
    } else {
      ctx.font = `${spec.fontSizePx}px ${segment.family}`;
      if (hasStroke) {
        ctx.lineJoin = "round";
        ctx.lineWidth = spec.strokeWidthPx!;
        ctx.strokeStyle = spec.stroke!;
        ctx.strokeText(segment.text, x, spec.baselineY);
      }
      ctx.fillStyle = spec.fill;
      ctx.fillText(segment.text, x, spec.baselineY);
    }
    x += widths[i]!;
  }
}

export type OverlayTitleLayerParams = {
  width: number;
  height: number;
  lines: OverlayTitleLineSpec[];
};

/** Renders one or more title lines to a single transparent PNG sized `width`x`height`. */
export async function renderOverlayTitleLayer(params: OverlayTitleLayerParams): Promise<Buffer> {
  ensureFontsRegistered();
  const canvas = createCanvas(params.width, params.height);
  const ctx = canvas.getContext("2d");
  for (const line of params.lines) {
    drawLine(ctx, params.width, line);
  }
  return canvas.toBuffer("image/png");
}

/** Renders just the mutation-arrow glyph standalone — exposed for the glyph test
 * ("no font/fallback dependency for U+2192 at all"). */
export function renderArrowGlyph(sizePx: number, colorHex: string): Buffer {
  const w = Math.ceil(sizePx);
  const h = Math.ceil(sizePx * 0.7);
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  drawArrow(ctx, w / 2, h / 2, sizePx, colorHex, undefined, 0);
  return canvas.toBuffer("image/png");
}

/** Exposed for the glyph-coverage test: every font file this module can render with, and
 * the exact selection rule the renderer itself uses (so the test can't drift from reality).
 * No "symbol" entry — the arrow is a drawn path, not a font glyph (see module doc comment). */
export const OVERLAY_TITLE_FONT_FILES = {
  latinBasic: LATIN_BASIC_FONT_FILE,
  latinExt: LATIN_EXT_FONT_FILE,
  cjk: CJK_FONT_FILE,
} as const;

export { fontFileForLatinChar };
