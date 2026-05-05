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
    "typography, captions, watermark, logo, letters, numerals, chop stamp, red seal, vermilion blob, corner seal, margin stamp, top-left ornament, inset label rectangle, signature block, vertical band, pseudo-calligraphy, fake glyphs, album leaf frame, poster layout, blank parchment, stock zen wallpaper, symmetrical corner sun disk, photorealistic snapshot, DSLR photograph, smartphone camera photo, documentary wildlife photography, stock photo HDR crush, harsh flash, crushed black silhouette filling frame center, hyperreal skin texture on rocks";
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
  "Light: cool dawn sidelight — ethereal pastel air, soft rim glow on distant snow, painterly not photographic.",
  "Light: heavy overcast — soft silver diffuse reflections, illustration-friendly mid-tones, gentle contrast.",
  "Light: romantic golden wash — long soft shadows in painted style, warm dust haze, emotional not harsh documentary sun.",
  "Light: thin moon behind thin cloud veil — diffuse fairy-tale glow, no crisp spotlight disk in a corner.",
  "Light: clearing storm — dramatic but illustrated sunbeams on one ridge, volumetric painted clouds.",
  "Light: misty drizzle — lowered contrast, soft greens and grays, silhouettes gentle not crushed black.",
  "Light: starfield twilight — deep blue zenith fading to warm horizon band, magical calm luminosity.",
  "Light: spring haze — pale lemon sky, buds on branches, luminous illustrative atmosphere.",
] as const;

/** Rotating openers — fantasy-illustration forward (evocative shanshui), not documentary photography. */
const OPENER_VARIANTS = [
  "Epic painted fantasy East Asian wilderness: monumental ridges, mist-filled valleys, rivers or lakes — widescreen 16:9 lush illustrated landscape, emotional poetic atmosphere, dreamlike depth (hand-painted epic, not a photo).",
  "Grand mythic mountain-and-water tableau: layered peaks, fog in hollows, reflective water — classic ink-wash soul rendered as luminous fantasy illustration filling the frame.",
  "High fantasy highland vista: granite spires, twisted pines, sea of clouds — golden-age landscape concept art mood, painterly awe without poster symmetry.",
  "Dreamlike river-canyon illustration: carved cliffs, silver water thread, forested slopes — soft atmospheric fade, storybook emotion.",
  "Serene enchanted lakeshore: calm water, distant mountain wall, gentle sky gradation — romantic illustrative panorama, not snapshot.",
  "Rolling tea-hill fantasy rhythm: contours climbing into mist — pastoral illustration calm, rounded poetic silhouettes.",
  "Dramatic illustrated storm escarpment: turbulent painted sky, wet cliffs catching light — energetic fantasy clouds, not HDR photo.",
  "Quiet bamboo-stream fairy tale: filtered emerald light, wet boulders, vapor among stalks — intimate vertical illustration space.",
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
  "Fantasy landscape concept art — lush emotional geography, storybook lighting, painterly readable forms.",
  "Traditional ink-wash soul remapped onto soft volumetric illustration — poetic not photographic.",
  "Luminous mythic vista — gentle depth cues and varied silhouettes in illustrated epic style.",
  "Romantic pastoral grandeur — bittersweet poetic mood, soft glow, no decorative framing devices.",
  "Painterly highland dreamscape — airy atmosphere, geological variety as painted fantasy not expedition photo.",
  "Braided river through meadows — illustration softness, willow tangles, no buildings or bridges with signage.",
  "Seasonal fairy-tale emphasis — foliage and weather as emotional metaphor in painted color.",
  "Heritage mood through terrain alone — cultural feeling via mist, rock, and trees — zero built structures or totems.",
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
    "Ground the scene in illustrated landforms and mood weather — avoid empty beige voids or flat posters; also avoid harsh snapshot realism.",
  ].join(" ");

  return [
    OPENER_VARIANTS[openerIdx],
    settingBlock,
    "Art direction: emotionally resonant fantasy landscape illustration — poetic, dreamlike, luminous — never a photograph, smartphone snapshot, or documentary realism.",
    "Preserve gentle luminous lift across the middle band (mist, moon-glow, soft gradients, pastel haze) so the scene stays airy — avoid heavy opaque shadow or near-black foliage dominating the central third.",
    "Visual priority: distinct illustrated terrain and depth variety — not the same mist-mountain-sun-in-corner stock shot every time.",
    "Leave center softly open (mist, sky, or distant haze) for overlay — no symbols, stamps, faux-writing, bars, or decorative portals.",
    "Corners and frame edges: seamless landscape only — never inset seals, red boxes, marginal stamps, or signature ornaments.",
    "Foreground only if subtle: natural rocks, pine branches, shoreline, or mist — no inscribed coins, no talismans, no objects resembling lettering.",
    `Emotional register for consultation theme (${category}): ${theme.mood}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
