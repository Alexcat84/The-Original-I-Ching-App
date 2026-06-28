/**
 * Deterministic ink-wash style SVG for every cast — works offline and as reliable fallback
 * when remote image APIs fail or rate-limit.
 */

import {
  OVERLAY_SYMBOL_FONT_FAMILY,
  OVERLAY_TITLE_EN_CLASS,
  OVERLAY_TITLE_EN_FONT,
  OVERLAY_TITLE_EN_FONT_WEIGHT,
  OVERLAY_TITLE_ZH_CLASS,
  OVERLAY_TITLE_ZH_FONT,
} from "@/lib/embed-svg-overlay-font";
import {
  SUMI_FALLBACK_HEX_TOP_Y,
  SUMI_OVERLAY_HEX_TOP_Y,
  buildOverlayEnglishTitleLayout,
  estimateOverlayEnTextWidth,
} from "@/lib/overlay-title-layout";
import { OVERLAY_ARROW, renderOverlayTitleLayer } from "@/lib/overlay-title-pango";

export type SumiLineInput = {
  position: 1 | 2 | 3 | 4 | 5 | 6;
  value: number;
  isChanging: boolean;
};

/**
 * Renders one English title line as one or more sibling <text> elements,
 * never a <tspan> nested inside a <text>.
 *
 * Root cause (see 20260625-AUD-IMG-OVR-02-mutation-title-layout.md \u00a713):
 * resvg-js can silently drop an entire <text> node that mixes plain text with
 * a <tspan> for the arrow glyph \u2014 reproduced for specific name pairs (e.g.
 * "#6 Conflict \u2192 #10 Treading [Conduct]") while structurally identical
 * pairs rendered fine, so it isn't predictable from text length or content
 * alone. Splitting the line into separate, manually positioned <text>
 * elements (one per segment around the arrow) avoids the tspan-in-text
 * pattern entirely and was verified to fix every previously-failing case.
 */
function buildOverlayEnLineElements(params: {
  line: string;
  y: number;
  cx: number;
  fontSize: number;
  fill: string;
  strokeAttrs: string;
}): string {
  if (!params.line.includes("\u2192")) {
    return `<text x="${params.cx}" y="${params.y}" text-anchor="middle" class="${OVERLAY_TITLE_EN_CLASS}" fill="${params.fill}"${params.strokeAttrs} font-size="${params.fontSize}" font-family="${OVERLAY_TITLE_EN_FONT}" font-weight="${OVERLAY_TITLE_EN_FONT_WEIGHT}">${escapeXml(params.line)}</text>`;
  }

  // Trim each segment and account for inter-segment spacing as an explicit
  // gap rather than relying on a leading/trailing space inside the text
  // content: SVG's default xml:space handling collapses that whitespace once
  // each segment becomes its own <text> node, which otherwise glues the
  // arrow to the adjacent word.
  // estimateOverlayEnTextWidth() is a rough per-character heuristic tuned for
  // the fit-or-shrink decision in overlay-title-layout.ts, not pixel-precise
  // positioning (measured underestimate of ~60-80px on a 28-character
  // segment, "Holding Together [Union]"). A generous fixed gap absorbs that
  // error instead of needing a per-character correction.
  const gapWidth = params.fontSize;
  // NotoSymbols2Overlay's arrow glyph renders visually wider than the
  // generic per-character width heuristic assumes (verified: a gap sized
  // from estimateOverlayEnTextWidth("\u2192", \u2026) left the arrow touching the
  // following word even though the same gap before the arrow looked right).
  // Reserve extra room specifically for it rather than tuning the shared
  // estimator, which other layout decisions (1-line vs 2-line fit) depend on.
  const arrowWidth = params.fontSize * 1.05;
  const rawSegments = params.line.split("\u2192");
  const parts: Array<{ text: string; isArrow: boolean }> = [];
  rawSegments.forEach((segment, index) => {
    const trimmed = segment.trim();
    if (trimmed.length > 0) parts.push({ text: trimmed, isArrow: false });
    if (index < rawSegments.length - 1) parts.push({ text: "\u2192", isArrow: true });
  });

  // A trailing "]" (e.g. "Holding Together [Union]") renders visually wider
  // than the generic estimate when it sits right at a segment boundary,
  // eating into the gap reserved after it — pad that case specifically.
  const widths = parts.map((part) => {
    if (part.isArrow) return arrowWidth;
    const base = estimateOverlayEnTextWidth(part.text, params.fontSize);
    return part.text.endsWith("]") ? base + params.fontSize * 0.22 : base;
  });
  const totalWidth = widths.reduce((sum, w) => sum + w, 0) + gapWidth * (parts.length - 1);
  let x = params.cx - totalWidth / 2;

  return parts
    .map((part, index) => {
      const elX = x;
      x += widths[index]! + gapWidth;
      if (part.isArrow) {
        return `<text x="${elX}" y="${params.y}" text-anchor="start" fill="${params.fill}"${params.strokeAttrs} font-size="${params.fontSize}" font-family="'${OVERLAY_SYMBOL_FONT_FAMILY}'">${part.text}</text>`;
      }
      return `<text x="${elX}" y="${params.y}" text-anchor="start" class="${OVERLAY_TITLE_EN_CLASS}" fill="${params.fill}"${params.strokeAttrs} font-size="${params.fontSize}" font-family="${OVERLAY_TITLE_EN_FONT}" font-weight="${OVERLAY_TITLE_EN_FONT_WEIGHT}">${escapeXml(part.text)}</text>`;
    })
    .join("\n");
}

function buildOverlayEnTextElements(params: {
  cx: number;
  primaryNumber: number;
  primaryName: string;
  transformedNumber?: number | null;
  transformedName?: string | null;
  hexTopY: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  paintOrder?: string;
}): string {
  const layout = buildOverlayEnglishTitleLayout(
    {
      primaryNumber: params.primaryNumber,
      primaryName: params.primaryName,
      transformedNumber: params.transformedNumber,
      transformedName: params.transformedName,
    },
    { hexTopY: params.hexTopY },
  );
  const strokeAttrs =
    params.stroke !== undefined
      ? ` stroke="${params.stroke}" stroke-width="${params.strokeWidth ?? 3}" paint-order="${params.paintOrder ?? "stroke fill"}"`
      : "";
  return layout.lines
    .map((line, index) =>
      buildOverlayEnLineElements({
        line,
        y: layout.ys[index]!,
        cx: params.cx,
        fontSize: layout.fontSize,
        fill: params.fill,
        strokeAttrs,
      }),
    )
    .join("\n");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isYang(value: number): boolean {
  return value === 7 || value === 9;
}

export function fnv1a32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shiftHexColor(hex: string, rng: () => number, spread: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = () => Math.round((rng() - 0.5) * spread);
  const c = (x: number) => Math.max(0, Math.min(255, x));
  return `#${[c(r + d()), c(g + d()), c(b + d())]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}`;
}

function nudge(n: number, rng: () => number, spread: number): number {
  return Math.round(n + (rng() - 0.5) * spread);
}

function defaultArtSeedFromCast(params: {
  primaryNumber: number;
  category: string;
  changingLines: number[];
  lines: SumiLineInput[];
}): string {
  const lineSig = [...params.lines]
    .sort((a, b) => a.position - b.position)
    .map((l) => `${l.position}:${l.value}:${l.isChanging ? 1 : 0}`)
    .join("|");
  return `${params.primaryNumber}:${params.category}:${params.changingLines.join(",")}:${lineSig}`;
}

/**
 * 16:9 scene: rice-paper texture, misty hills, subtle ruyi clouds, distant pavilion —
 * hexagram and titles dominate the frame (main reading surface).
 * Background layers vary deterministically from `artSeed` (e.g. consultation id) so each cast looks distinct without remote APIs.
 */
export function buildSumiHexagramSvgDataUrl(params: {
  lines: SumiLineInput[];
  primaryNumber: number;
  primaryName: string;
  primaryChinese: string;
  pinyin?: string;
  transformedNumber?: number | null;
  transformedName?: string | null;
  transformedChinese?: string | null;
  /** Stable id per consultation — drives scenic variation. If omitted, derived from hex + lines + category. */
  artSeed?: string;
  category?: string;
  changingLines?: number[];
}): string {
  const W = 1344;
  const H = 768;
  const cx = W / 2;
  const sorted = [...params.lines].sort((a, b) => a.position - b.position);
  const lineGap = 56;
  const baseY = 520;
  const barH = 20;
  const halfW = 220;

  const lineEls: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const line = sorted[i]!;
    const y = baseY - i * lineGap;
    const yang = isYang(line.value);
    const gOpen = line.isChanging ? `<g filter="url(#goldGlow)">` : `<g>`;
    const fill = line.isChanging ? "#e8c547" : "#14120f";
    const stroke = line.isChanging ? "#fff6d0" : "#0a0908";
    const sw = line.isChanging ? 2.2 : 1.5;

    if (yang) {
      lineEls.push(
        `${gOpen}<rect x="${cx - halfW}" y="${y}" width="${halfW * 2}" height="${barH}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`,
      );
    } else {
      const gap = 56;
      const segW = halfW - gap / 2;
      lineEls.push(
        `${gOpen}<rect x="${cx - halfW}" y="${y}" width="${segW}" height="${barH}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
<rect x="${cx + gap / 2}" y="${y}" width="${segW}" height="${barH}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`,
      );
    }
  }

  const subZh = escapeXml(
    `${params.primaryChinese}${params.transformedChinese ? ` → ${params.transformedChinese}` : ""}`,
  );
  const subEnEls = buildOverlayEnTextElements({
    cx,
    primaryNumber: params.primaryNumber,
    primaryName: params.primaryName,
    transformedNumber: params.transformedNumber,
    transformedName: params.transformedName,
    hexTopY: SUMI_FALLBACK_HEX_TOP_Y,
    fill: "#3d3830",
  });

  const seedStr =
    params.artSeed ??
    defaultArtSeedFromCast({
      primaryNumber: params.primaryNumber,
      category: params.category ?? "",
      changingLines: params.changingLines ?? [],
      lines: sorted,
    });
  const rng = mulberry32(fnv1a32(seedStr));

  const paper0 = shiftHexColor("#f4efe4", rng, 22);
  const paper1 = shiftHexColor("#e8e0d2", rng, 22);
  const paper2 = shiftHexColor("#d8cfc0", rng, 22);
  const vigStrength = (0.085 + rng() * 0.1).toFixed(3);
  const hillA = (0.09 * (0.72 + rng() * 0.45)).toFixed(3);
  const hillB = (0.085 * (0.72 + rng() * 0.45)).toFixed(3);
  const hillC = (0.06 * (0.72 + rng() * 0.45)).toFixed(3);
  const mistA = (0.22 + rng() * 0.12).toFixed(3);
  const mistB = (0.16 + rng() * 0.12).toFixed(3);
  const cloudStroke = (0.12 + rng() * 0.06).toFixed(3);
  const cloudStroke2 = (0.09 + rng() * 0.05).toFixed(3);
  const bronzeA = (0.15 + rng() * 0.1).toFixed(3);
  const bronzeB = (0.13 + rng() * 0.1).toFixed(3);
  const pavilionFill = (0.1 + rng() * 0.05).toFixed(3);
  const pavilionCol = (0.14 + rng() * 0.06).toFixed(3);
  const waterA = (0.055 + rng() * 0.04).toFixed(3);
  const tableA = (0.17 + rng() * 0.08).toFixed(3);

  const h1y0 = nudge(520, rng, 52);
  const h1x1 = nudge(180, rng, 48);
  const h1y1 = nudge(360, rng, 55);
  const h1x2 = nudge(430, rng, 55);
  const h1y2 = nudge(445, rng, 40);
  const h1x3 = nudge(890, rng, 50);
  const h1y3 = nudge(405, rng, 40);
  const h1y4 = nudge(350, rng, 45);

  const h2y0 = nudge(575, rng, 35);
  const h2x1 = nudge(330, rng, 60);
  const h2y1 = nudge(470, rng, 45);
  const h2x2 = nudge(700, rng, 70);
  const h2y2 = nudge(525, rng, 38);
  const h2y3 = nudge(490, rng, 35);

  const h3y0 = nudge(610, rng, 30);
  const h3x1 = nudge(280, rng, 55);
  const h3y1 = nudge(560, rng, 40);
  const h3x2 = nudge(560, rng, 50);
  const h3y2 = nudge(590, rng, 35);
  const h3x3 = nudge(1120, rng, 60);
  const h3y3 = nudge(575, rng, 35);
  const h3y4 = nudge(560, rng, 30);

  const m1y = nudge(470, rng, 40);
  const m1x2 = nudge(390, rng, 50);
  const m1y2 = nudge(420, rng, 35);
  const m1x3 = nudge(650, rng, 55);
  const m1y3 = nudge(460, rng, 35);
  const m1x4 = nudge(1210, rng, 50);
  const m1y4 = nudge(445, rng, 30);

  const m2y = nudge(520, rng, 35);
  const m2x2 = nudge(360, rng, 45);
  const m2y2 = nudge(485, rng, 30);
  const m2x3 = nudge(610, rng, 50);
  const m2y3 = nudge(520, rng, 30);
  const m2x4 = nudge(1170, rng, 50);
  const m2y4 = nudge(505, rng, 30);

  const c1x = nudge(110, rng, 35);
  const c1y = nudge(170, rng, 30);
  const c2x = nudge(965, rng, 40);
  const c2y = nudge(154, rng, 28);

  const px = nudge(1010, rng, 95);
  const pyRoof = nudge(330, rng, 22);
  const pxMid = px + 70;
  const pyPeak = nudge(286, rng, 20);
  const pxR = px + 140;
  const pyBase = nudge(376, rng, 18);
  const pillarX = nudge(1072, rng, 85);
  const pillarY = nudge(306, rng, 18);

  const wf1 = nudge(978, rng, 25);
  const wf1y = nudge(248, rng, 20);
  const wf2 = nudge(994, rng, 22);
  const wf2y = nudge(254, rng, 18);

  const wbY = nudge(642, rng, 28);
  const wbQ1 = nudge(390, rng, 55);
  const wbQ1y = nudge(596, rng, 35);
  const wbQ2 = nudge(810, rng, 70);
  const wbQ2y = nudge(628, rng, 35);
  const wbTy = nudge(606, rng, 30);
  const tableY = nudge(670, rng, 22);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${paper0}"/>
    <stop offset="40%" stop-color="${paper1}"/>
    <stop offset="100%" stop-color="${paper2}"/>
  </linearGradient>
  <radialGradient id="vignette" cx="50%" cy="42%" r="75%">
    <stop offset="50%" stop-color="rgba(28,26,22,0)" />
    <stop offset="100%" stop-color="rgba(35,30,24,${vigStrength})" />
  </radialGradient>
  <filter id="goldGlow" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="6" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#paper)"/>
<!-- soft wash -->
<rect width="${W}" height="${H}" fill="url(#vignette)"/>
<!-- distant hills (shanshui layers) -->
<path fill="rgba(72,68,62,${hillA})" d="M0 ${h1y0} Q${h1x1} ${h1y1} ${h1x2} ${h1y2} T${h1x3} ${h1y3} T1344 ${h1y4} L1344 768 L0 768 Z"/>
<path fill="rgba(55,52,48,${hillB})" d="M0 ${h2y0} Q${h2x1} ${h2y1} ${h2x2} ${h2y2} T1344 ${h2y3} L1344 768 L0 768 Z"/>
<path fill="rgba(41,39,36,${hillC})" d="M0 ${h3y0} Q${h3x1} ${h3y1} ${h3x2} ${h3y2} T${h3x3} ${h3y3} T1344 ${h3y4} L1344 768 L0 768 Z"/>
<!-- mist ribbons -->
<path fill="none" stroke="rgba(255,255,255,${mistA})" stroke-width="18" stroke-linecap="round" d="M120 ${m1y} Q${m1x2} ${m1y2} ${m1x3} ${m1y3} T${m1x4} ${m1y4}"/>
<path fill="none" stroke="rgba(255,255,255,${mistB})" stroke-width="12" stroke-linecap="round" d="M90 ${m2y} Q${m2x2} ${m2y2} ${m2x3} ${m2y3} T${m2x4} ${m2y4}"/>
<!-- ruyi cloud scrolls -->
<path fill="none" stroke="rgba(88,82,74,${cloudStroke})" stroke-width="2.2" stroke-linecap="round"
  d="M${c1x} ${c1y} Q190 130 275 195 Q360 260 318 336 Q278 400 196 378 Q130 360 110 300 Q94 238 110 170"/>
<path fill="none" stroke="rgba(88,82,74,${cloudStroke2})" stroke-width="1.8" stroke-linecap="round"
  d="M${c2x} ${c2y} Q1050 190 1118 270 Q1188 352 1104 394 Q1038 428 994 372"/>
<!-- bronze taotie-inspired side motifs -->
<path fill="none" stroke="rgba(120,90,52,${bronzeA})" stroke-width="2" d="M58 248 q34 -26 66 0 q-34 26 -66 0 z"/>
<path fill="none" stroke="rgba(120,90,52,${bronzeB})" stroke-width="1.8" d="M58 292 q34 -24 66 0 q-34 24 -66 0 z"/>
<path fill="none" stroke="rgba(120,90,52,${bronzeA})" stroke-width="2" d="M1220 248 q34 -26 66 0 q-34 26 -66 0 z"/>
<path fill="none" stroke="rgba(120,90,52,${bronzeB})" stroke-width="1.8" d="M1220 292 q34 -24 66 0 q-34 24 -66 0 z"/>
<!-- distant pavilion -->
<path fill="rgba(45,40,36,${pavilionFill})" d="M${px} ${pyRoof} L${pxMid} ${pyPeak} L${pxR} ${pyRoof} L${pxR} ${pyBase} L${px} ${pyBase} Z"/>
<rect x="${pillarX}" y="${pillarY}" width="18" height="70" fill="rgba(45,40,36,${pavilionCol})"/>
<!-- calligraphy waterfall hint -->
<path fill="none" stroke="rgba(35,31,28,0.14)" stroke-width="4" stroke-linecap="round" d="M${wf1} ${wf1y} Q956 314 944 372 Q936 424 930 474"/>
<path fill="none" stroke="rgba(35,31,28,0.09)" stroke-width="2.2" stroke-linecap="round" d="M${wf2} ${wf2y} Q976 322 968 376 Q962 428 958 472"/>
<!-- water band and scholar table -->
<path fill="rgba(42,58,62,${waterA})" d="M0 ${wbY} Q${wbQ1} ${wbQ1y} ${wbQ2} ${wbQ2y} T1344 ${wbTy} L1344 768 L0 768 Z"/>
<path fill="rgba(48,38,28,${tableA})" d="M0 ${tableY} L1344 ${tableY} L1344 768 L0 768 Z"/>
<!-- hexagram (dominant) -->
<g>${lineEls.join("\n")}</g>
<!-- primary titles: large, centered -->
<text x="${cx}" y="125" text-anchor="middle" class="${OVERLAY_TITLE_ZH_CLASS}" fill="#1c1a16" font-size="92" font-family='${OVERLAY_TITLE_ZH_FONT}' font-weight="700">${subZh}</text>
${subEnEls}
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Transparent SVG overlay: hexagram bars + titles + seal.
 * Meant to be composited over a remotely generated background so the lines and text
 * are always correct (independent of how well the image model follows the prompt).
 */
export async function buildSumiHexagramOverlaySvgDataUrl(params: {
  lines: SumiLineInput[];
  primaryNumber: number;
  primaryName: string;
  primaryChinese: string;
  pinyin?: string;
  transformedNumber?: number | null;
  transformedName?: string | null;
  transformedChinese?: string | null;
  /** Output pixel size used by the compositor (SVG will scale via viewBox). */
  outputWidth?: number;
  outputHeight?: number;
}): Promise<string> {
  const W = 1344;
  const H = 768;
  const cx = W / 2;
  const sorted = [...params.lines].sort((a, b) => a.position - b.position);
  const lineGap = 58;
  const baseY = 528;
  const barH = 28;
  const halfW = 244;
  const yinGap = 60;
  const outputWidth = params.outputWidth ?? W;
  const outputHeight = params.outputHeight ?? H;

  const lineEls: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const line = sorted[i]!;
    const y = baseY - i * lineGap;
    const yang = isYang(line.value);
    const gOpen = line.isChanging ? `<g filter="url(#goldGlow)">` : `<g>`;
    const fill = line.isChanging ? "#c9a010" : "#4a2c18";
    const stroke = line.isChanging ? "#fffef8" : "#faf4eb";
    const sw = line.isChanging ? 4.2 : 3.5;

    if (yang) {
      lineEls.push(
        `${gOpen}<rect x="${cx - halfW}" y="${y}" width="${halfW * 2}" height="${barH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`,
      );
    } else {
      const segW = halfW - yinGap / 2;
      lineEls.push(
        `${gOpen}<rect x="${cx - halfW}" y="${y}" width="${segW}" height="${barH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
<rect x="${cx + yinGap / 2}" y="${y}" width="${segW}" height="${barH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></g>`,
      );
    }
  }

  const zhText = `${params.primaryChinese}${params.transformedChinese ? ` ${OVERLAY_ARROW} ${params.transformedChinese}` : ""}`;
  // Zhou Yi mode has no romanization — primaryName/transformedName are the bare hanzi
  // (e.g. "乾"), so the "EN" subtitle line is Chinese text too. Pick the script per name
  // content rather than assuming Latin, or it would render with the wrong font files.
  const enScript: "cjk" | "latin" = /[㐀-鿿]/.test(params.primaryName) ? "cjk" : "latin";
  const enLayout = buildOverlayEnglishTitleLayout(
    {
      primaryNumber: params.primaryNumber,
      primaryName: params.primaryName,
      transformedNumber: params.transformedNumber,
      transformedName: params.transformedName,
    },
    { hexTopY: SUMI_OVERLAY_HEX_TOP_Y },
  );

  // Title text is rendered to a transparent PNG via Pango (overlay-title-pango.ts) and
  // embedded as an <image>, not as SVG <text> — resvg-js has a font/glyph-shaping defect
  // for mixed embedded-font text that isn't predictable from content alone (see
  // docs/auditorias/20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md). resvg only ever
  // sees plain vector shapes here (bars + filter), which it renders correctly.
  const titlePng = await renderOverlayTitleLayer({
    width: W,
    height: H,
    lines: [
      {
        text: zhText,
        script: "cjk",
        fontSizePx: 92,
        baselineY: 125,
        fill: "#1c1a16",
        stroke: "rgba(255,248,242,0.94)",
        strokeWidthPx: 5,
      },
      ...enLayout.lines.map((line, index) => ({
        text: line,
        script: enScript,
        fontSizePx: enLayout.fontSize,
        baselineY: enLayout.ys[index]!,
        fill: "#2e2a22",
        stroke: "rgba(255,248,242,0.9)",
        strokeWidthPx: 3,
      })),
    ],
  });
  const titlePngBase64 = titlePng.toString("base64");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${W} ${H}">
<defs>
  <filter id="goldGlow" x="-80%" y="-80%" width="260%" height="260%">
    <feGaussianBlur stdDeviation="7" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<g>${lineEls.join("\n")}</g>
<!-- primary titles: rendered separately via Pango, embedded as a raster layer -->
<image x="0" y="0" width="${W}" height="${H}" href="data:image/png;base64,${titlePngBase64}"/>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
