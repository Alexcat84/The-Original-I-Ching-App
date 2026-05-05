import type { Hexagram, Line } from "@iching-oracle/iching-engine";
import type { ConsultationCategory } from "./categories.js";
import { VISUAL_THEMES } from "./categories.js";

/**
 * Anti-text / seal lines for Together `negative_prompt` only (never prepend to positive prompt).
 * Avoid repeating “Chinese/calligraphy” — describe stamps and margins visually instead.
 */
const IMAGE_NEGATIVE_CONSTRAINT_LINES = [
  "No readable text, numerals, logos, subtitles, watermark, UI chrome.",
  "No chop stamps, hanko, artist seals — forbid red or vermilion rectangles tucked into top-left, top-right, bottom corners, or margin strips.",
  "No museum accession stamp, gallery chop, documentary corner logo, or faux signature tile.",
  "No vertical inscription bands, poem strips, carved lettering, marginal glyph columns.",
  "Center stays mist or sky — no faux-glyphs, lattice portals, stacked bars.",
  "No hexagram graphics in raster.",
  "Natural landscape fill — reject parchment poster look or ivory blank dominating the frame.",
] as const;

export function buildTogetherNegativePrompt(): string {
  const keywordPrefix =
    "typography, captions, watermark, logo, letters, numerals, chop stamp, red seal, vermilion blob, corner seal, margin stamp, top-left ornament, inset label rectangle, signature block, vertical band, pseudo-calligraphy, fake glyphs, album leaf frame, poster layout, blank parchment, stock zen wallpaper, symmetrical corner sun disk";
  const scriptTail =
    "Hanzi-like tiles, Kanji-like tiles, Hangul, Cyrillic, Arabic script — forbid legible rendering";
  return [keywordPrefix, ...IMAGE_NEGATIVE_CONSTRAINT_LINES, scriptTail].join(" ");
}

/** Bottom-to-top line stack for image models (position 1 = lowest line in the hexagram). */
export function describeHexagramLinesForImage(lines: Line[]): string {
  const sorted = [...lines].sort((a, b) => a.position - b.position);
  return sorted
    .map((l) => {
      const yin = l.value === 6 || l.value === 8;
      const kind = yin ? "YIN broken line (two ink segments with a gap)" : "YANG solid line (single brush bar)";
      const glow = l.isChanging
        ? "CHANGING — paint in glowing metallic gold leaf / warm amber light, not black"
        : "stable — deep black sumi ink with dry-brush texture";
      return `Position ${l.position} from bottom: ${kind}. ${glow}.`;
    })
    .join(" ");
}

function hashToUint(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Landscape-only framing — varied layouts so FLUX does not converge on one mist-mountain-moon stock shot. */
const COMPOSITION_VARIANTS = [
  "Composition: panoramic — wide water or valley band low, stacked ridges climbing into haze, sky or mist dominant aloft.",
  "Composition: diagonal thrust — foreground cliff or pine at one lower corner, fog river drawing the eye toward distant peaks.",
  "Composition: river bend — near shore with rocks and trees, water guiding toward far silhouettes under layered clouds.",
  "Composition: aerial breadth — rolling summits emerging from cloud ocean, sense of vast horizontal span.",
  "Composition: gorge slice — steep opposing cliffs with narrow sky strip and silver thread of river far below.",
  "Composition: forest threshold — dark canopy frame opening to bright ridge gap or distant glacier silhouette.",
  "Composition: lake foreground — calm reflective surface occupying lower half, mountains mirrored softly.",
  "Composition: terraced slope — contour lines of fields or meadows stepping up into mist and peaks.",
] as const;

const ATMOSPHERE_ROTATIONS = [
  "Light: cool dawn sidelight, crisp air, pink-blue rim on distant snow.",
  "Light: heavy overcast, soft silver reflections on wet stone and river.",
  "Light: late afternoon gold, long shadows, warm dust or pollen haze.",
  "Light: thin moon behind thin cloud veil — glow diffuse, no crisp disk stuck in a corner.",
  "Light: clearing storm — dark cloud mass with sunbeam shafts hitting one ridge face.",
  "Light: misty drizzle — lowered contrast, saturated greens and grays, soft silhouettes.",
  "Light: starfield twilight — deep blue zenith fading to warm band at horizon.",
  "Light: spring haze — pale lemon sky, buds on branches, gentle luminosity.",
] as const;

/** Rotating openers — same geography-first rule, different wording so generations do not look cloned. */
const OPENER_VARIANTS = [
  "Vast East Asian wilderness landscape: monumental ridges, mist-filled valleys, rivers or lakes, atmospheric perspective — widescreen 16:9 immersive outdoor scene (real terrain scale, not empty parchment).",
  "Grand mountain-and-water tableau: layered peaks, fog in hollows, reflective water or wetlands, cinematic depth — classic brush-painting mood rendered as rich natural scenery filling the frame.",
  "Epic highland vista: granite spires, twisted pines on cliffs, sea of clouds between towers — painterly atmosphere without poster symmetry.",
  "Deep river-canyon scene: carved cliffs, silver water thread, forested slopes, distant blue atmospheric fade.",
  "Serene lakeshore panorama: broad calm water, distant mountain wall, soft sky gradation, foreground rocks or reeds.",
  "Rolling tea-hill / terrace rhythm: contour-farming curves climbing into mist, rounded silhouettes, pastoral calm.",
  "Dramatic storm-lit escarpment: turbulent sky breaks, wet rock catching spotlight, energetic clouds.",
  "Quiet bamboo-stream hollow: filtered green light, wet boulders, gentle vapor among tall stalks — intimate vertical space.",
] as const;

/** Extra focal diversity — reduces identical “hero moon top-right” compositions. */
const FOCAL_DIVERSITY_HINTS = [
  "Focal balance: weight interest toward lower-left foreground mass; sky stays calm.",
  "Focal balance: center-weighted luminous mist — no decorative corner ornaments.",
  "Focal balance: strong right-side cliff vs left open sky — asymmetric, natural.",
  "Focal balance: distant horizon band emphasized — tiny figures or structures forbidden.",
  "Focal balance: foreground tree group silhouette anchoring one third — celestial light diffuse, not a pasted disk.",
  "Focal balance: wide reflective water plane anchoring bottom half.",
  "Focal balance: zigzag river draws eye mid-frame toward notch in ridge line.",
  "Focal balance: layered horizontal strata of ridges — rhythm across the width.",
] as const;

const STYLE_MOOD_TAGS = [
  "Illustrative scenic concept art — lush readable geography.",
  "Traditional ink-wash color mood remapped onto volumetric landscape painting.",
  "Travel-documentary vista clarity — crisp depth cues, varied silhouettes.",
  "Romantic pastoral grandeur — soft poetic atmosphere without decorative framing devices.",
  "Highland expedition vista — crisp air, geological variety.",
  "Braided river through meadows — gravel bars, willow tangles, no buildings or bridges with signage.",
  "Seasonal diversity emphasis — distinct foliage or weather story.",
  "Heritage landscape through terrain only — nature carries cultural mood, zero built structures or totems.",
] as const;

export function buildImagePrompt(
  primary: Hexagram,
  _transformed: Hexagram | null,
  category: ConsultationCategory,
  _changingLines: number[],
  _castLines?: Line[],
  consultationId?: string,
): string {
  const theme = VISUAL_THEMES[category] ?? VISUAL_THEMES.general;

  const seed = `${consultationId ?? "na"}:${primary.number}:${category}`;
  const h = hashToUint(seed);
  const openerIdx = h % OPENER_VARIANTS.length;
  const compIdx = (h >>> 7) % COMPOSITION_VARIANTS.length;
  const lightIdx = (h >>> 14) % ATMOSPHERE_ROTATIONS.length;
  const focalIdx = (h >>> 21) % FOCAL_DIVERSITY_HINTS.length;
  const styleIdx = (h >>> 3) % STYLE_MOOD_TAGS.length;

  const settingBlock = [
    `PRIMARY SETTING (must dominate the image — do not use a flat blank gradient): ${theme.environment}.`,
    `Time and mood: ${theme.timeOfDay}; ${theme.mood}.`,
    `Palette: ${theme.colorPalette}.`,
    `Motifs to weave into mid-ground or background (choose what fits): ${theme.elements}.`,
    ATMOSPHERE_ROTATIONS[lightIdx],
    COMPOSITION_VARIANTS[compIdx],
    FOCAL_DIVERSITY_HINTS[focalIdx],
    STYLE_MOOD_TAGS[styleIdx],
    "Ground the image in specific landforms and weather — avoid empty beige voids, single-wash posters, or stock wallpaper symmetry.",
  ].join(" ");

  return [
    OPENER_VARIANTS[openerIdx],
    settingBlock,
    "Visual priority: distinct terrain, varied silhouettes, and clear depth — not the same mist-mountain-sun-in-corner template every time.",
    "Leave center softly open (mist, sky, or distant haze) for overlay — no symbols, stamps, faux-writing, bars, or decorative portals.",
    "Corners and frame edges: seamless landscape only — never inset seals, red boxes, marginal stamps, or signature ornaments.",
    "Foreground only if subtle: natural rocks, pine branches, shoreline, or mist — no inscribed coins, no talismans, no objects resembling lettering.",
    `Emotional register for consultation theme (${category}): ${theme.mood}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
