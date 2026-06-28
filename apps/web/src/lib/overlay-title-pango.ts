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
const CJK_FONT_FILE = FONTSOURCE_WOFF_PATHS.notoSerifTc700;

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

type RenderedGlyphRun = { buffer: Buffer; width: number; height: number };

const glyphRunCache = new Map<string, Promise<RenderedGlyphRun>>();

async function renderGlyphRun(
  text: string,
  fontFile: string,
  sizePx: number,
  colorHex: string,
): Promise<RenderedGlyphRun> {
  const key = `${fontFile} ${sizePx} ${colorHex} ${text}`;
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
    return { buffer, width: meta.width ?? 1, height: meta.height ?? 1 };
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
async function renderArrowGlyph(sizePx: number, colorHex: string): Promise<RenderedGlyphRun> {
  const key = `${sizePx} ${colorHex}`;
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
    return { buffer, width, height };
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
  const renderSegment = (seg: TitleSegment, colorHex: string): Promise<RenderedGlyphRun> =>
    seg.kind === "arrow"
      ? renderArrowGlyph(spec.fontSizePx, colorHex)
      : renderGlyphRun(seg.text, seg.fontFile, spec.fontSizePx, colorHex);

  const fillRuns = await Promise.all(segments.map((seg) => renderSegment(seg, spec.fill)));
  const strokeRuns =
    spec.stroke && (spec.strokeWidthPx ?? 0) > 0
      ? await Promise.all(segments.map((seg) => renderSegment(seg, spec.stroke!)))
      : null;

  const gaps = segments.map((seg, i) => (i > 0 && seg.gapBefore ? gapPx : 0));
  const totalWidth = fillRuns.reduce((sum, run, i) => sum + run.width + gaps[i]!, 0);
  let x = Math.round(canvasWidth / 2 - totalWidth / 2);
  const textTop = Math.round(spec.baselineY - spec.fontSizePx * ASCENT_RATIO);
  // The arrow is a fixed-aspect box (renderArrowGlyph), not a text glyph with the same
  // ascent convention — center it on the visual middle of the surrounding text instead
  // of reusing textTop, or it sits too high relative to the letters beside it.
  const arrowCenterY = spec.baselineY - spec.fontSizePx * 0.32;
  const sw = Math.round(spec.strokeWidthPx ?? 0);
  const strokeOffsets: Array<[number, number]> =
    sw > 0
      ? [
          [-sw, 0],
          [sw, 0],
          [0, -sw],
          [0, sw],
          [-sw, -sw],
          [sw, -sw],
          [-sw, sw],
          [sw, sw],
        ]
      : [];

  const ops: CompositeOp[] = [];
  for (let i = 0; i < fillRuns.length; i++) {
    x += gaps[i]!;
    const fill = fillRuns[i]!;
    const isArrow = segments[i]!.kind === "arrow";
    const top = isArrow ? Math.round(arrowCenterY - fill.height / 2) : textTop;
    if (strokeRuns) {
      const stroke = strokeRuns[i]!;
      const strokeLeft = x + Math.round((fill.width - stroke.width) / 2);
      const strokeTop = isArrow ? Math.round(arrowCenterY - stroke.height / 2) : textTop;
      for (const [dx, dy] of strokeOffsets) {
        ops.push({ input: stroke.buffer, left: strokeLeft + dx, top: strokeTop + dy });
      }
    }
    ops.push({ input: fill.buffer, left: x, top });
    x += fill.width;
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
