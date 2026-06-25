/** Layout helpers for overlay English subtitle lines (Wilhelm/Legge romanization). */

export const OVERLAY_EN_BASE_FONT_SIZE = 32;
export const OVERLAY_EN_MIN_FONT_SIZE = 19;
/** Prefer wrapping before shrinking English titles below this size. */
export const OVERLAY_EN_READABLE_MIN_FONT_SIZE = 24;
/** Usable width inside 1344px scene — conservative to match resvg serif metrics. */
export const OVERLAY_EN_MAX_WIDTH = 1000;
export const OVERLAY_EN_LINE_HEIGHT = 1.38;
/** Tighter leading when English title wraps to two lines. */
export const OVERLAY_EN_TWO_LINE_HEIGHT = 1.26;
export const OVERLAY_EN_SINGLE_Y = 178;
export const OVERLAY_EN_MUTATION_SEP = " \u2192 ";

/** Top y of uppermost hex bar — must stay in sync with sumi-hexagram-art scene geometry. */
export const SUMI_FALLBACK_HEX_TOP_Y = 240;
export const SUMI_OVERLAY_HEX_TOP_Y = 238;

/** Chinese title line geometry in sumi overlay (y baseline + font-size). */
const ZH_TITLE_BASELINE = 125;
const ZH_TITLE_SIZE = 92;
const ZH_VISUAL_BOTTOM = ZH_TITLE_BASELINE + Math.round(ZH_TITLE_SIZE * 0.24);
/** Min gap hanzi → English ascenders when block uses two lines. */
const EN_TWO_LINE_GAP_BELOW_ZH = 16;
/** Clearance between bottom English descenders and top hex bar (two-line mutations). */
const EN_TWO_LINE_MARGIN_ABOVE_HEX = 30;

/** Rough serif width estimate for center-anchored single-line fit checks. */
export function estimateOverlayEnTextWidth(text: string, fontSize: number): number {
  let units = 0;
  for (const ch of text) {
    if (ch === " " || ch === ".") units += 0.28;
    else if ("ilI1".includes(ch)) units += 0.34;
    else if ("MW".includes(ch)) units += 0.78;
    else if ("\u2192".includes(ch)) units += 0.62;
    else if ("[]()".includes(ch)) units += 0.36;
    else if (ch === "#") units += 0.42;
    else units += 0.52;
  }
  return units * fontSize;
}

export type OverlayEnglishTitleLayout = {
  lines: string[];
  fontSize: number;
  ys: number[];
};

export function buildOverlayEnglishTitleText(params: {
  primaryNumber: number;
  primaryName: string;
  transformedNumber?: number | null;
  transformedName?: string | null;
}): string {
  const primary = `#${params.primaryNumber} ${params.primaryName}`;
  if (!params.transformedNumber) return primary;
  return `${primary}${OVERLAY_EN_MUTATION_SEP}#${params.transformedNumber} ${params.transformedName ?? ""}`;
}

export function computeTwoLineYs(
  fontSize: number,
  hexTopY: number,
): [number, number] | null {
  const lineGap = fontSize * OVERLAY_EN_TWO_LINE_HEIGHT;
  const descent = fontSize * 0.22;
  const ascent = fontSize * 0.75;

  const bottomBaseline = hexTopY - EN_TWO_LINE_MARGIN_ABOVE_HEX - descent;
  const topBaseline = bottomBaseline - lineGap;
  const topVisual = topBaseline - ascent;

  if (topVisual < ZH_VISUAL_BOTTOM + EN_TWO_LINE_GAP_BELOW_ZH) {
    return null;
  }
  return [topBaseline, bottomBaseline];
}

function layoutTwoLineMutationTitle(params: {
  primaryNumber: number;
  primaryName: string;
  transformedNumber: number;
  transformedName?: string | null;
  maxWidth: number;
  hexTopY: number;
}): OverlayEnglishTitleLayout {
  const line1 = `#${params.primaryNumber} ${params.primaryName}`;
  const line2 = `\u2192 #${params.transformedNumber} ${params.transformedName ?? ""}`;

  for (let size = OVERLAY_EN_BASE_FONT_SIZE; size >= OVERLAY_EN_MIN_FONT_SIZE; size--) {
    const widest = Math.max(
      estimateOverlayEnTextWidth(line1, size),
      estimateOverlayEnTextWidth(line2, size),
    );
    if (widest > params.maxWidth) continue;
    const ys = computeTwoLineYs(size, params.hexTopY);
    if (!ys) continue;
    return { lines: [line1, line2], fontSize: size, ys: [...ys] };
  }

  const size = OVERLAY_EN_MIN_FONT_SIZE;
  const ys = computeTwoLineYs(size, params.hexTopY) ?? [
    ZH_VISUAL_BOTTOM + EN_TWO_LINE_GAP_BELOW_ZH + size * 0.75,
    params.hexTopY - EN_TWO_LINE_MARGIN_ABOVE_HEX - size * 0.22,
  ];
  return { lines: [line1, line2], fontSize: size, ys: [...ys] };
}

export function buildOverlayEnglishTitleLayout(
  params: {
    primaryNumber: number;
    primaryName: string;
    transformedNumber?: number | null;
    transformedName?: string | null;
  },
  options?: { hexTopY?: number },
): OverlayEnglishTitleLayout {
  const hexTopY = options?.hexTopY ?? SUMI_FALLBACK_HEX_TOP_Y;
  const full = buildOverlayEnglishTitleText(params);
  const maxWidth = OVERLAY_EN_MAX_WIDTH;

  const fitsAtBase = estimateOverlayEnTextWidth(full, OVERLAY_EN_BASE_FONT_SIZE) <= maxWidth;

  if (params.transformedNumber && !fitsAtBase) {
    return layoutTwoLineMutationTitle({
      primaryNumber: params.primaryNumber,
      primaryName: params.primaryName,
      transformedNumber: params.transformedNumber,
      transformedName: params.transformedName,
      maxWidth,
      hexTopY,
    });
  }

  for (let size = OVERLAY_EN_BASE_FONT_SIZE; size >= OVERLAY_EN_READABLE_MIN_FONT_SIZE; size--) {
    if (estimateOverlayEnTextWidth(full, size) <= maxWidth) {
      return { lines: [full], fontSize: size, ys: [OVERLAY_EN_SINGLE_Y] };
    }
  }

  if (params.transformedNumber) {
    return layoutTwoLineMutationTitle({
      primaryNumber: params.primaryNumber,
      primaryName: params.primaryName,
      transformedNumber: params.transformedNumber,
      transformedName: params.transformedName,
      maxWidth,
      hexTopY,
    });
  }

  for (let size = OVERLAY_EN_READABLE_MIN_FONT_SIZE - 1; size >= OVERLAY_EN_MIN_FONT_SIZE; size--) {
    if (estimateOverlayEnTextWidth(full, size) <= maxWidth) {
      return { lines: [full], fontSize: size, ys: [OVERLAY_EN_SINGLE_Y] };
    }
  }

  return {
    lines: [full],
    fontSize: OVERLAY_EN_MIN_FONT_SIZE,
    ys: [OVERLAY_EN_SINGLE_Y],
  };
}
