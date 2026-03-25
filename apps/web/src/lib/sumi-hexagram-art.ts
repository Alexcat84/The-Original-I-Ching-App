/**
 * Deterministic ink-wash style SVG for every cast — works offline and as reliable fallback
 * when remote image APIs fail or rate-limit.
 */

export type SumiLineInput = {
  position: 1 | 2 | 3 | 4 | 5 | 6;
  value: number;
  isChanging: boolean;
};

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
  const subEn = escapeXml(
    `#${params.primaryNumber} ${params.primaryName}${
      params.transformedNumber ? ` → #${params.transformedNumber} ${params.transformedName ?? ""}` : ""
    }`,
  );
  const subPy = params.pinyin ? escapeXml(params.pinyin) : "";

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
<!-- seal chop -->
<rect x="1188" y="48" width="58" height="58" rx="5" fill="none" stroke="rgba(168,52,52,0.5)" stroke-width="2"/>
<text x="1217" y="88" text-anchor="middle" fill="rgba(168,52,52,0.48)" font-size="30" font-family="serif">易</text>
<!-- primary titles: large, centered -->
<text x="${cx}" y="125" text-anchor="middle" fill="#1c1a16" font-size="92" font-family='Noto Serif SC, SimSun, STSong, serif' font-weight="700">${subZh}</text>
<text x="${cx}" y="178" text-anchor="middle" fill="#3d3830" font-size="34" font-family="Georgia, 'Noto Serif', serif" font-weight="600">${subEn}</text>
${subPy ? `<text x="${cx}" y="212" text-anchor="middle" fill="rgba(61,56,48,0.65)" font-size="22" font-family="Georgia, serif" font-style="italic">${subPy}</text>` : ""}
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
