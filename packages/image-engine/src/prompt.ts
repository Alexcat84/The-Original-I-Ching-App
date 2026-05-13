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
  "Center softly open — sunlit haze, water shimmer, forest aisle, or pale sky — no faux-glyphs, lattice portals, stacked bars.",
  "No hexagram graphics in raster.",
  "Natural landscape fill — reject parchment poster look or ivory blank dominating the frame.",
] as const;

export function buildTogetherNegativePrompt(): string {
  const keywordPrefix =
    "typography, captions, watermark, logo, letters, numerals, chop stamp, red seal, vermilion blob, corner seal, margin stamp, top-left ornament, inset label rectangle, signature block, autograph scribble, vertical band, pseudo-calligraphy, fake glyphs, album leaf frame, poster layout, blank parchment, stock zen wallpaper, symmetrical corner sun disk, patio courtyard staging, bench rows, urn planters, outdoor seating slabs, photorealistic snapshot, DSLR photograph, smartphone snapshot, wildlife documentary vibe, HDR crush, harsh flash, crushed silhouette center fill";
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
  "Composition: panoramic — wide river, lake, or valley band low, stacked ridges; sunlit haze or soft clouds aloft.",
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
  "Composition: stepped wet-field reflections — curved water surfaces stepping uphill, mirror fragments, mist above.",
  "Composition: night-noir silhouette ridge — deep blue atmosphere, rim-lit cloud tops, minimal warm accents.",
  "Composition: dry grassland rise — golden tawny grasses, lone wind-bent tree, vast sky.",
  "Composition: sunlit river ford — shallow rushing water over stones, forest banks, bright sky wedge overhead.",
  "Composition: lagoon clarity — turquoise shallow basin or reed-lined pond, rim of jungle or pine, sun sparkle on water.",
  "Composition: forest nave — tall trunks converging toward luminous clearing, stream or pool catching a sun shaft.",
] as const;

const ATMOSPHERE_ROTATIONS = [
  "Light: cool dawn sidelight — ethereal pastel air, soft rim glow on distant snow, painterly not photographic.",
  "Light: heavy overcast — soft silver diffuse reflections, illustration-friendly mid-tones, gentle contrast.",
  "Light: romantic golden wash — long soft shadows in painted style, warm dust haze, emotional not harsh documentary sun.",
  "Light: thin moon behind thin cloud veil — diffuse fairy-tale glow, no crisp spotlight disk in a corner.",
  "Light: clear midday sun — turquoise river or lagoon sparkles, crisp painted shadows, saturated cheerful illustration.",
  "Light: golden hour on water — long amber reflections on lake or lagoon, warm forest rim, gentle flame-toned sky.",
  "Light: forest-floor sun shafts — dappled emerald light on moss and roots, stream gleam, intimate woodland depth.",
  "Light: bright valley day — wide river braid, stacked cumulus, fresh greens and cerulean sky washes.",
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
  "Sunlit river valley: braided sparkling water, forest banks, bold daytime sky — luminous illustrated epic.",
  "Forest cathedral opening onto lake or lagoon: emerald canopy, mirrored shallows, vivid painterly color.",
] as const;

/** Extra focal diversity — reduces identical “hero moon top-right” compositions. */
const FOCAL_DIVERSITY_HINTS = [
  "Focal balance: weight toward lower-left foreground mass — earth, trees, or shore as anchor.",
  "Focal balance: center-weighted luminous air — mist, sun haze, or water shimmer; no decorative corner ornaments.",
  "Focal balance: strong cliff vs open sky or bright water — asymmetric, natural.",
  "Focal balance: distant horizon band emphasized — tiny figures or structures forbidden.",
  "Focal balance: forest edge or tree group anchoring one third — light diffuse through canopy or off water, not a pasted disk.",
  "Focal balance: wide reflective lake, lagoon, or river plane anchoring bottom half.",
  "Focal balance: zigzag river draws eye mid-frame toward notch in ridge line.",
  "Focal balance: layered horizontal strata of ridges — rhythm across the width.",
  "Focal balance: sunlit water foreground — sparkles and shallow color leading toward forest or cliffs.",
] as const;

const STYLE_MOOD_TAGS = [
  "Fantasy landscape concept art — lush emotional geography, storybook lighting, painterly readable forms.",
  "Traditional ink-wash soul remapped onto soft volumetric illustration — poetic not photographic.",
  "Luminous mythic vista — gentle depth cues and varied silhouettes in illustrated epic style.",
  "Romantic pastoral grandeur — bittersweet poetic mood, soft glow, no decorative framing devices.",
  "Painterly highland dreamscape — airy atmosphere, geological variety as painted fantasy not expedition photo.",
  "Braided river through meadows — illustration softness, willow tangles, no buildings or bridges with signage.",
  "Seasonal fairy-tale emphasis — foliage and weather as emotional metaphor in painted color.",
  "Heritage mood through terrain alone — rock, forest, rivers, lakes, light, and weather — zero built structures or totems.",
] as const;

/** Scene-family macro diversity to avoid repeated mountain-lake compositions. */
const SCENE_FAMILY_VARIANTS = [
  "Scene family: alpine ridgelines and glacier-fed valleys with mineral water tones.",
  "Scene family: temperate conifer forest with streams, mossy rocks, and layered canopy depth.",
  "Scene family: bamboo valleys with humid haze, narrow rivers, and stepped slopes.",
  "Scene family: coastal cliffs with surf mist, sea inlets, and receding headlands.",
  "Scene family: broad grassland basin with distant hills, wind texture, and open sky.",
  "Scene family: canyon river corridor with stratified walls and bright water ribbons.",
  "Scene family: wetland delta with reeds, shallow reflective channels, and soft horizon.",
  "Scene family: high plateau with sparse trees, stone outcrops, and expansive clouds.",
  "Scene family: autumn mixed forest with layered color bands and river meanders.",
  "Scene family: winter highland with snow traces, dark pines, and pale atmospheric gradients.",
  "Scene family: spring hillside terraces with reflective water pockets and drifting mist.",
  "Scene family: volcanic valley geometry with dark basalt, luminous fog, and vivid sky breaks.",
] as const;

const WEATHER_VARIANTS = [
  "Weather: clear dry air with long visibility and soft illustrated contrast.",
  "Weather: passing cloud shadows and intermittent sunbeams, painterly not dramatic HDR.",
  "Weather: light drizzle haze with smooth depth falloff and muted greens.",
  "Weather: post-rain freshness with bright ground reflections and clean sky windows.",
  "Weather: morning mist layers separated by warm side light.",
  "Weather: humid summer veil with softened distance and richer foreground saturation.",
  "Weather: crisp cold air with restrained palette and clear ridge hierarchy.",
  "Weather: gentle sea fog pushing inland, preserving low-contrast readability.",
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
  const scenePrimaryIdx = ((h >>> 25) ^ (h >>> 4)) % SCENE_FAMILY_VARIANTS.length;
  const sceneSecondaryIdx =
    (scenePrimaryIdx + 3 + (((h >>> 10) ^ (h >>> 2)) % 5)) %
    SCENE_FAMILY_VARIANTS.length;
  const weatherIdx = ((h >>> 13) ^ (h >>> 23)) % WEATHER_VARIANTS.length;

  const settingBlock = [
    `PRIMARY SETTING (dominate the frame — no flat blank gradient): ${theme.environment}.`,
    `Time and mood: ${theme.timeOfDay}; ${theme.mood}.`,
    `Palette: ${theme.colorPalette}.`,
    `Motifs (mid-ground or background): ${theme.elements}.`,
    ATMOSPHERE_ROTATIONS[lightIdx],
    COMPOSITION_VARIANTS[compIdx],
    FOCAL_DIVERSITY_HINTS[focalIdx],
    STYLE_MOOD_TAGS[styleIdx],
    SCENE_FAMILY_VARIANTS[scenePrimaryIdx],
    `Secondary terrain accent: ${SCENE_FAMILY_VARIANTS[sceneSecondaryIdx]}`,
    WEATHER_VARIANTS[weatherIdx],
    "Ground in illustrated landforms and weather — no beige voids, flat posters, or harsh snapshot realism.",
  ].join(" ");

  return [
    "Clean-plate raster: seamless landscape — unmarked air, water, canopy, or pale sky; no in-image text, stamps, autographs, or lettering.",
    OPENER_VARIANTS[openerIdx],
    settingBlock,
    "Art direction: fantasy landscape illustration — poetic, luminous; never photograph or documentary snapshot.",
    "Middle band: readable softness — mist, sun haze, forest glow, water shimmer — vary glow; avoid opaque shadow in central third.",
    "Terrain variety is mandatory across generations — rotate biome, weather, and focal anchors; avoid repeating the same mountain-lake template.",
    "Center open (water, forest aisle, mist, bright haze, or sky) for overlay — no symbols, stamps, faux-writing, bars, portals.",
    "Frame edges: seamless landscape — no inset seals, red boxes, marginal stamps, signatures.",
    "Foreground: subtle rocks, pines, shore, mist — no coins, talismans, letter-like props.",
    `Emotional tone (${category}): ${theme.mood}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
