/**
 * Renders the overlay title (Chinese hexagram name(s) + English/Legge romanization,
 * with an optional mutation arrow) to a transparent PNG using Pango text shaping
 * (via sharp/libvips), instead of emitting <text> into the SVG that resvg-js renders.
 *
 * WHY THIS EXISTS (see docs/auditorias/20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md):
 * resvg-js has a font/glyph-shaping defect for mixed embedded-font text that the team
 * proved (20260625-AUD-IMG-OVR-02 §10.2) is not predictable from text content alone —
 * fixing the cases found in QA does not guarantee every future hexagram pair is safe.
 * Pango is a much more mature text-shaping engine for exactly this kind of mixed-script
 * rendering. Every glyph used here comes from an explicitly bundled font file (no
 * fontconfig/system-font fallback): verified per-character with fontkit, not just by
 * eyeballing a render — a render alone can look correct purely from font-fallback
 * (confirmed empirically: the dedicated "symbols" font this app already ships for
 * U+2192 does NOT actually contain that glyph; every render that looked right was
 * silently borrowing an unrelated system font). The mutation arrow is therefore drawn
 * as a small hand-authored SVG path rasterized by sharp, not as a text glyph at all —
 * zero font/fallback dependency for it, ever.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
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

/** U+0000-U+00FF -> the "latin" file; U+0100+ -> "latin-ext" (exact boundary verified via fontkit). */
function fontFileForLatinChar(ch: string): string {
  return ch.codePointAt(0)! <= 0xff ? LATIN_BASIC_FONT_FILE : LATIN_EXT_FONT_FILE;
}

/** Splits a Latin run into the minimal number of contiguous chunks that each map to one font file. */
function splitLatinByFontCoverage(text: string): Array<{ text: string; fontFile: string }> {
  const chunks: Array<{ text: string; fontFile: string }> = [];
  let current = "";
  let currentFont = "";
  for (const ch of text) {
    const font = fontFileForLatinChar(ch);
    if (font !== currentFont && current) {
      chunks.push({ text: current, fontFile: currentFont });
      current = "";
    }
    current += ch;
    currentFont = font;
  }
  if (current) chunks.push({ text: current, fontFile: currentFont });
  return chunks;
}

/** Pango span `size` is in 1024ths of a point; at sharp's default dpi (72) 1pt = 1px. */
function pangoSizeAttr(px: number): number {
  return Math.round(px * 1024);
}

function escapePangoMarkup(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Pango markup's `foreground` span attribute only accepts opaque colors (hex or named) —
 * `rgba(...)` and `foreground_alpha` both fail to parse on the Pango/libvips build sharp
 * ships (verified empirically). Existing callers pass CSS rgba() strings (carried over from
 * the SVG <text> era); drop the alpha channel and convert to hex rather than requiring every
 * caller to pre-convert. The stroke/outline is a cosmetic readability aid, not the bug being
 * fixed, so losing partial transparency there is an acceptable, deliberate simplification.
 */
function toOpaquePangoHex(color: string): string {
  const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    const toHex = (n: string) => Number(n).toString(16).padStart(2, "0");
    return `#${toHex(r!)}${toHex(g!)}${toHex(b!)}`;
  }
  return color;
}

/**
 * `width`/`height` are the glyph's own tight bounding box, used for layout spacing —
 * unaffected by any stroke halo. `offsetX`/`offsetY` are how far `buffer`'s top-left
 * corner sits from the glyph's true top-left (negative when a stroke halo padded the
 * buffer); add them to the computed (left, top) when compositing so the glyph itself
 * lands at the intended position regardless of how much halo padding surrounds it.
 */
type RenderedGlyphRun = {
  buffer: Buffer;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

function hexToRgbObject(hex: string): { r: number; g: number; b: number; alpha: number } {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return { r: 0, g: 0, b: 0, alpha: 1 };
  return { r: parseInt(m[1]!, 16), g: parseInt(m[2]!, 16), b: parseInt(m[3]!, 16), alpha: 1 };
}

/**
 * Adds a readability halo around a rasterized (already-rendered) glyph by dilating its
 * alpha channel — blur the alpha mask by ~strokeWidthPx, then threshold it back to fully
 * opaque, which expands the opaque region by roughly strokeWidthPx in every direction
 * with a clean, solid edge. This replaces an earlier approach that stamped 8 offset
 * copies of the glyph in the stroke color, which looked blurry/smeared at render size
 * (overlapping anti-aliased edges at slightly different offsets blend into a haze
 * instead of a crisp outline — reported by the user against a real generated image).
 * Padding the canvas first gives the blur room to expand into without clipping.
 */
async function addStrokeHalo(
  glyph: { buffer: Buffer; width: number; height: number },
  strokeHex: string,
  strokeWidthPx: number,
): Promise<RenderedGlyphRun> {
  const pad = Math.ceil(strokeWidthPx * 2.2);
  const paddedW = glyph.width + pad * 2;
  const paddedH = glyph.height + pad * 2;
  const padded = await sharp(glyph.buffer)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Gaussian blur + low threshold dilates by roughly ~1.9x the blur sigma at threshold=8
  // (erfc math on the blurred step edge) — halving sigma here targets a dilation close
  // to the requested strokeWidthPx instead of ~2x it. A first attempt without the 0.5
  // factor dilated CJK glyphs enough to bridge the gaps between strokes and filled the
  // whole character into a solid block instead of a thin outline (reported by the user).
  const dilatedAlpha = await sharp(padded)
    .extractChannel("alpha")
    .blur(Math.max(0.3, strokeWidthPx * 0.5))
    .threshold(8)
    .toBuffer();
  // channels: 3 (RGB, no alpha) so joinChannel below ADDS the dilated mask as the alpha
  // channel instead of appending a stray 5th channel on top of an already-opaque alpha
  // (that exact mistake is what produced a solid opaque rectangle on the first attempt).
  const strokeFlat = await sharp({
    create: { width: paddedW, height: paddedH, channels: 3, background: hexToRgbObject(toOpaquePangoHex(strokeHex)) },
  })
    .png()
    .toBuffer();
  const strokeLayer = await sharp(strokeFlat).joinChannel(dilatedAlpha).png().toBuffer();

  const combined = await sharp({
    create: { width: paddedW, height: paddedH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: strokeLayer, left: 0, top: 0 },
      { input: padded, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();

  return { buffer: combined, width: glyph.width, height: glyph.height, offsetX: -pad, offsetY: -pad };
}

const glyphRunCache = new Map<string, Promise<RenderedGlyphRun>>();

async function renderGlyphRun(
  text: string,
  fontFile: string,
  sizePx: number,
  colorHex: string,
  strokeHex?: string,
  strokeWidthPx?: number,
): Promise<RenderedGlyphRun> {
  const key = `${fontFile} ${sizePx} ${colorHex} ${strokeHex ?? ""} ${strokeWidthPx ?? 0} ${text}`;
  const cached = glyphRunCache.get(key);
  if (cached) return cached;

  const task = (async (): Promise<RenderedGlyphRun> => {
    const markup = `<span size="${pangoSizeAttr(sizePx)}" foreground="${toOpaquePangoHex(colorHex)}">${escapePangoMarkup(text)}</span>`;
    const buffer = await sharp({
      text: { text: markup, fontfile: fontFile, rgba: true, align: "centre" },
    })
      .png()
      .toBuffer();
    const meta = await sharp(buffer).metadata();
    const glyph = { buffer, width: meta.width ?? 1, height: meta.height ?? 1 };
    if (strokeHex && (strokeWidthPx ?? 0) > 0) return addStrokeHalo(glyph, strokeHex, strokeWidthPx!);
    return { ...glyph, offsetX: 0, offsetY: 0 };
  })();
  glyphRunCache.set(key, task);
  return task;
}

const arrowGlyphCache = new Map<string, Promise<RenderedGlyphRun>>();

/**
 * Draws the mutation arrow as a plain SVG path (block arrow: shaft + triangular head)
 * instead of a font glyph — see the module doc comment for why. Pure vector shapes are
 * exactly what resvg/sharp's SVG rasterizer handles correctly; the bug class this whole
 * module exists to avoid is specific to font/glyph shaping, not vector geometry.
 */
async function renderArrowGlyph(
  sizePx: number,
  colorHex: string,
  strokeHex?: string,
  strokeWidthPx?: number,
): Promise<RenderedGlyphRun> {
  const key = `${sizePx} ${colorHex} ${strokeHex ?? ""} ${strokeWidthPx ?? 0}`;
  const cached = arrowGlyphCache.get(key);
  if (cached) return cached;

  const task = (async (): Promise<RenderedGlyphRun> => {
    const width = Math.round(sizePx * 0.95);
    const height = Math.round(sizePx * 0.62);
    const hex = toOpaquePangoHex(colorHex);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 65">
<path d="M5,25 L60,25 L60,5 L95,32.5 L60,60 L60,40 L5,40 Z" fill="${hex}"/>
</svg>`;
    const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
    const glyph = { buffer, width, height };
    if (strokeHex && (strokeWidthPx ?? 0) > 0) return addStrokeHalo(glyph, strokeHex, strokeWidthPx!);
    return { ...glyph, offsetX: 0, offsetY: 0 };
  })();
  arrowGlyphCache.set(key, task);
  return task;
}

/** Fraction of font-size used as the visual gap between segments (name / arrow / name). */
const SEGMENT_GAP_RATIO = 0.32;
/** Approximate baseline-to-top offset as a fraction of font size, used to position every
 * text segment on a line. Calibrated by rendering and visually comparing against the
 * hexagram bars below (see docs/auditorias/20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md §9). */
const ASCENT_RATIO = 0.74;

/** `gapBefore: false` segments are sub-runs of the same word split only because two
 * different font files cover them — they must render flush against the previous
 * segment, not spaced like a word/arrow boundary. */
type TitleSegment =
  | { kind: "text"; text: string; fontFile: string; gapBefore: boolean }
  | { kind: "arrow"; gapBefore: true };

function splitOnArrow(text: string, script: "cjk" | "latin"): TitleSegment[] {
  const rawParts = text.split(OVERLAY_ARROW);
  const segments: TitleSegment[] = [];
  rawParts.forEach((part, i) => {
    const trimmed = part.trim();
    if (trimmed.length > 0) {
      if (script === "cjk") {
        segments.push({ kind: "text", text: trimmed, fontFile: CJK_FONT_FILE, gapBefore: true });
      } else {
        splitLatinByFontCoverage(trimmed).forEach((chunk, j) => {
          segments.push({ kind: "text", text: chunk.text, fontFile: chunk.fontFile, gapBefore: j === 0 });
        });
      }
    }
    if (i < rawParts.length - 1) {
      segments.push({ kind: "arrow", gapBefore: true });
    }
  });
  return segments;
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

type CompositeOp = { input: Buffer; left: number; top: number };

async function layoutLine(spec: OverlayTitleLineSpec, canvasWidth: number): Promise<CompositeOp[]> {
  const segments = splitOnArrow(spec.text, spec.script);
  if (segments.length === 0) return [];

  const gapPx = Math.round(spec.fontSizePx * SEGMENT_GAP_RATIO);
  const runs = await Promise.all(
    segments.map((seg) =>
      seg.kind === "arrow"
        ? renderArrowGlyph(spec.fontSizePx, spec.fill, spec.stroke, spec.strokeWidthPx)
        : renderGlyphRun(seg.text, seg.fontFile, spec.fontSizePx, spec.fill, spec.stroke, spec.strokeWidthPx),
    ),
  );

  const gaps = segments.map((seg, i) => (i > 0 && seg.gapBefore ? gapPx : 0));
  const totalWidth = runs.reduce((sum, run, i) => sum + run.width + gaps[i]!, 0);
  let x = Math.round(canvasWidth / 2 - totalWidth / 2);
  const textTop = Math.round(spec.baselineY - spec.fontSizePx * ASCENT_RATIO);
  // The arrow is a fixed-aspect box (renderArrowGlyph), not a text glyph with the same
  // ascent convention — center it on the visual middle of the surrounding text instead
  // of reusing textTop, or it sits too high relative to the letters beside it.
  const arrowCenterY = spec.baselineY - spec.fontSizePx * 0.32;

  const ops: CompositeOp[] = [];
  for (let i = 0; i < runs.length; i++) {
    x += gaps[i]!;
    const run = runs[i]!;
    const isArrow = segments[i]!.kind === "arrow";
    const top = isArrow ? Math.round(arrowCenterY - run.height / 2) : textTop;
    ops.push({ input: run.buffer, left: x + run.offsetX, top: top + run.offsetY });
    x += run.width;
  }
  return ops;
}

export type OverlayTitleLayerParams = {
  width: number;
  height: number;
  lines: OverlayTitleLineSpec[];
};

/** Renders one or more title lines to a single transparent PNG sized `width`x`height`. */
export async function renderOverlayTitleLayer(params: OverlayTitleLayerParams): Promise<Buffer> {
  const allOps: CompositeOp[] = [];
  for (const line of params.lines) {
    allOps.push(...(await layoutLine(line, params.width)));
  }
  if (allOps.length === 0) {
    return sharp({
      create: { width: params.width, height: params.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .png()
      .toBuffer();
  }
  return sharp({
    create: { width: params.width, height: params.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(allOps)
    .png()
    .toBuffer();
}

/** Exposed for the glyph-coverage test: every font file this module can render with, and
 * the exact selection rule the renderer itself uses (so the test can't drift from reality).
 * No "symbol" entry — the arrow is a drawn vector, not a font glyph (see module doc comment). */
export const OVERLAY_TITLE_FONT_FILES = {
  latinBasic: LATIN_BASIC_FONT_FILE,
  latinExt: LATIN_EXT_FONT_FILE,
  cjk: CJK_FONT_FILE,
} as const;

export { fontFileForLatinChar, renderArrowGlyph };
