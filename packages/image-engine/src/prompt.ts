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
  "No museum accession stamp, gallery chop, documentary corner logo, faux signature tile. No painter autograph, cursive signature flourish, gold name scribble, corner pen-tail.",
  "No vertical inscription bands, poem strips, carved lettering, marginal glyph columns.",
  "Center stays mist or sky — no faux-glyphs, lattice portals, stacked bars.",
  "No hexagram graphics in raster.",
  "Natural landscape fill — reject parchment poster look or ivory blank dominating the frame.",
] as const;

export function buildTogetherNegativePrompt(): string {
  const keywordPrefix =
    "typography, captions, watermark, logo, letters, numerals, chop stamp, red seal, vermilion blob, corner seal, margin stamp, top-left ornament, inset label rectangle, signature block, autograph scribble, vertical band, pseudo-calligraphy, fake glyphs, album leaf frame, poster layout, blank parchment, stock zen wallpaper, symmetrical corner sun disk, photorealistic snapshot, DSLR photograph, smartphone camera photo, documentary wildlife photography, stock photo HDR crush, harsh flash, crushed black silhouette filling frame center, hyperreal skin texture on rocks";
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

/**
 * Landscape-only framing (compare legacy `main`: scholar table / courtyard / coins primed seals — kept out).
 * Wide geographic spread reduces “same moon lake” convergence without naming script or stamps.
 */
const COMPOSITION_VARIANTS = [
  "Composition: panoramic — wide water or valley band low, stacked ridges climbing into haze, sky or mist dominant aloft.",
  "Composition: diagonal thrust — foreground cliff or pine at one lower corner, fog river drawing the eye toward distant peaks.",
  "Composition: river bend — near shore with rocks and trees, water guiding toward far silhouettes under layered clouds.",
  "Composition: aerial breadth — rolling summits emerging from cloud ocean, sense of vast horizontal span.",
  "Composition: gorge slice — steep opposing cliffs with narrow sky strip and silver thread of river far below.",
  "Composition: forest threshold — dark canopy frame opening to bright ridge gap or distant glacier silhouette.",
  "Composition: lake foreground — calm reflective surface occupying lower half, mountains mirrored softly.",
  "Composition: terraced slope — contour lines of fields or meadows stepping up into mist and peaks.",
  "Composition: alpine snowfield — cold pale glacier hints, mineral shadows, wind-scoured ridges, sparse foreground.",
  "Composition: coastal fog cliffs — sea mist swallowing rock bases, teal-gray atmosphere, layered headlands receding.",
  "Composition: autumn ridge slope — warm maple or oak color accents among rock, crisp angled sunlight, varied silhouette.",
  "Composition: ochre plateau — wide earthy foreground band, distant cooler peaks, open sky dominance.",
  "Composition: bamboo-lined gorge — tall stalks as vertical framing, narrow bright sky slot, stream gleam below.",
  "Composition: flooded terrace reflections — curved water surfaces stepping uphill, mirror fragments, mist above.",
  "Composition: night-noir silhouette ridge — deep blue atmosphere, rim-lit cloud tops, minimal warm accents.",
  "Composition: dry grassland rise — golden tawny grasses, lone wind-bent tree, vast sky.",
] as const;

const ATMOSPHERE_ROTATIONS = [
  "Light: cool dawn sidelight — ethereal pastel air, soft rim glow on distant snow, painterly not photographic.",
  "Light: heavy overcast — soft silver diffuse reflections, illustration-friendly mid-tones, gentle contrast.",
  "Light: romantic golden wash — long soft shadows in painted style, warm dust haze, emotional not harsh documentary sun.",
  "Light: thin moon behind thin cloud veil — diffuse fairy-tale glow, no crisp spotlight disk in a corner.",
  "Light: clearing storm — dramatic but illustrated sunbeams on one ridge, volumetric painted clouds.",
  "Light: misty drizzle — lowered contrast, soft greens and grays, silhouettes gentle not crushed black.",
  "Light: starfield twilight — deep blue zenith fading to warm horizon band, magical calm luminosity.",
  "Light: spring haze — pale lemon sky, subtle fresh foliage suggestion without large foreground blooms as focal subject.",
  "Light: autumn clarity — low amber angle, long shadows, crisp dry air, copper-green foliage accents.",
  "Light: winter high-key — pale sky, soft cyan shadows on snow or rock, restrained saturation.",
  "Light: humid summer veil — hazed distance, lush greens muted by atmospheric blue, sultry calm.",
] as const;

/** Rotating openers — fantasy-illustration forward (evocative shanshui), not documentary photography. */
const OPENER_VARIANTS = [
  "Epic fantasy East Asian wilderness: monumental ridges, mist valleys, water — lush 16:9 illustrated landscape, poetic atmosphere, dreamlike depth, painted not photo.",
  "Grand mythic mountain-and-water: layered peaks, fog, reflective water — ink-wash soul as luminous fantasy illustration, full frame.",
  "High fantasy highland vista: granite spires, twisted pines, sea of clouds — golden-age landscape concept art mood, painterly awe without poster symmetry.",
  "Dreamlike river-canyon illustration: carved cliffs, silver water thread, forested slopes — soft atmospheric fade, storybook emotion.",
  "Serene enchanted lakeshore: calm water, distant mountain wall, gentle sky gradation — romantic illustrative panorama, not snapshot.",
  "Rolling tea-hill fantasy rhythm: contours climbing into mist — pastoral illustration calm, rounded poetic silhouettes.",
  "Dramatic illustrated storm escarpment: turbulent painted sky, wet cliffs catching light — energetic fantasy clouds, not HDR photo.",
  "Quiet bamboo-stream fairy tale: filtered emerald light, wet boulders, vapor among stalks — intimate vertical illustration space.",
  "High-plateau windscape: ochre earth, distant violet peaks, sweeping cirrus — open-air epic scale.",
  "Coastal mist fantasy: fog horns implied only as mood, slate cliffs, pearl-gray surf glow below.",
  "Late autumn tapestry: ridge fires of color (trees only), moody sky — bittersweet illustrated season.",
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
  transformed: Hexagram | null,
  category: ConsultationCategory,
  _changingLines: number[],
  _castLines?: Line[],
  consultationId?: string,
): string {
  const theme = VISUAL_THEMES[category] ?? VISUAL_THEMES.general;

  /** Include transformed hexagram so changing readings diverge visually even when primary repeats. */
  const seed = `${consultationId ?? "na"}:${primary.number}:t${transformed?.number ?? 0}:${category}`;
  const h = hashToUint(seed);
  /** XOR-mix bits so opener vs composition vs light decorrelate (reduces synchronized repetition). */
  const openerIdx = (h ^ (h >>> 11)) % OPENER_VARIANTS.length;
  const compIdx = ((h >>> 7) ^ (h >>> 19)) % COMPOSITION_VARIANTS.length;
  const lightIdx = ((h >>> 14) ^ (h >>> 5)) % ATMOSPHERE_ROTATIONS.length;
  const focalIdx = ((h >>> 21) ^ (h >>> 9)) % FOCAL_DIVERSITY_HINTS.length;
  const styleIdx = ((h >>> 3) ^ (h >>> 17)) % STYLE_MOOD_TAGS.length;

  const settingBlock = [
    `PRIMARY SETTING (must dominate the image — do not use a flat blank gradient): ${theme.environment}.`,
    `Time and mood: ${theme.timeOfDay}; ${theme.mood}.`,
    `Palette: ${theme.colorPalette}.`,
    `Motifs to weave into mid-ground or background (choose what fits): ${theme.elements}.`,
    ATMOSPHERE_ROTATIONS[lightIdx],
    COMPOSITION_VARIANTS[compIdx],
    FOCAL_DIVERSITY_HINTS[focalIdx],
    STYLE_MOOD_TAGS[styleIdx],
    "Ground in illustrated landforms and weather — no beige voids, flat posters, or harsh snapshot realism.",
  ].join(" ");

  return [
    "Clean-plate raster: seamless illustrated landscape — unmarked sky/mist; no in-image text, labels, stamps, autographs, or lettering.",
    OPENER_VARIANTS[openerIdx],
    settingBlock,
    "Art direction: fantasy landscape illustration — poetic, luminous; never photograph or documentary snapshot.",
    "Middle band: soft diffused light/mist/haze for overlay readability — vary glow placement; avoid opaque shadow in central third.",
    "Terrain variety — avoid stock mist-mountain-sun-corner clichés.",
    "Center open (mist, sky, distant haze) for overlay — no symbols, stamps, faux-writing, bars, portals.",
    "Frame edges: seamless landscape — no inset seals, red boxes, marginal stamps, signatures.",
    "Foreground only subtle rocks, pines, shore, mist — no coins, talismans, letter-like props.",
    `Emotional register for consultation theme (${category}): ${theme.mood}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
