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

/**
 * 16:9 scene: rice-paper texture, misty hills, subtle ruyi clouds, distant pavilion —
 * hexagram and titles dominate the frame (main reading surface).
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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#f4efe4"/>
    <stop offset="40%" stop-color="#e8e0d2"/>
    <stop offset="100%" stop-color="#d8cfc0"/>
  </linearGradient>
  <radialGradient id="vignette" cx="50%" cy="42%" r="75%">
    <stop offset="50%" stop-color="rgba(28,26,22,0)" />
    <stop offset="100%" stop-color="rgba(35,30,24,0.12)" />
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
<path fill="rgba(72,68,62,0.11)" d="M0 520 Q180 360 430 445 T890 405 T1344 350 L1344 768 L0 768 Z"/>
<path fill="rgba(55,52,48,0.085)" d="M0 575 Q330 470 700 525 T1344 490 L1344 768 L0 768 Z"/>
<path fill="rgba(41,39,36,0.06)" d="M0 610 Q280 560 560 590 T1120 575 T1344 560 L1344 768 L0 768 Z"/>
<!-- mist ribbons -->
<path fill="none" stroke="rgba(255,255,255,0.26)" stroke-width="18" stroke-linecap="round" d="M120 470 Q390 420 650 460 T1210 445"/>
<path fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12" stroke-linecap="round" d="M90 520 Q360 485 610 520 T1170 505"/>
<!-- ruyi cloud scrolls -->
<path fill="none" stroke="rgba(88,82,74,0.14)" stroke-width="2.2" stroke-linecap="round"
  d="M110 170 Q190 130 275 195 Q360 260 318 336 Q278 400 196 378 Q130 360 110 300 Q94 238 110 170"/>
<path fill="none" stroke="rgba(88,82,74,0.11)" stroke-width="1.8" stroke-linecap="round"
  d="M965 154 Q1050 190 1118 270 Q1188 352 1104 394 Q1038 428 994 372"/>
<!-- bronze taotie-inspired side motifs -->
<path fill="none" stroke="rgba(120,90,52,0.18)" stroke-width="2" d="M58 248 q34 -26 66 0 q-34 26 -66 0 z"/>
<path fill="none" stroke="rgba(120,90,52,0.16)" stroke-width="1.8" d="M58 292 q34 -24 66 0 q-34 24 -66 0 z"/>
<path fill="none" stroke="rgba(120,90,52,0.18)" stroke-width="2" d="M1220 248 q34 -26 66 0 q-34 26 -66 0 z"/>
<path fill="none" stroke="rgba(120,90,52,0.16)" stroke-width="1.8" d="M1220 292 q34 -24 66 0 q-34 24 -66 0 z"/>
<!-- distant pavilion -->
<path fill="rgba(45,40,36,0.12)" d="M1010 330 L1080 286 L1150 330 L1150 376 L1010 376 Z"/>
<rect x="1072" y="306" width="18" height="70" fill="rgba(45,40,36,0.16)"/>
<!-- calligraphy waterfall hint -->
<path fill="none" stroke="rgba(35,31,28,0.14)" stroke-width="4" stroke-linecap="round" d="M978 248 Q956 314 944 372 Q936 424 930 474"/>
<path fill="none" stroke="rgba(35,31,28,0.09)" stroke-width="2.2" stroke-linecap="round" d="M994 254 Q976 322 968 376 Q962 428 958 472"/>
<!-- water band and scholar table -->
<path fill="rgba(42,58,62,0.07)" d="M0 642 Q390 596 810 628 T1344 606 L1344 768 L0 768 Z"/>
<path fill="rgba(48,38,28,0.2)" d="M0 670 L1344 670 L1344 768 L0 768 Z"/>
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
