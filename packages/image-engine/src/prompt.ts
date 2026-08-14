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
  "Composition: cedar-lined gorge — tall trunks as vertical framing, narrow bright sky slot, stream gleam below.",
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
  "Rolling pastoral-hill fantasy rhythm: contours climbing into mist — illustration calm, rounded poetic silhouettes.",
  "Dramatic illustrated storm escarpment: turbulent painted sky, wet cliffs catching light — energetic fantasy clouds, not HDR photo.",
  "Quiet cedar-stream fairy tale: filtered emerald light, wet boulders, vapor among tall trunks — intimate vertical illustration space.",
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
  "Scene family: valley forests with humid haze, narrow rivers, and stepped slopes.",
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

/** Per-category environment rotation — prevents same mountain-lake on every cast. */
const CATEGORY_ENVIRONMENT_VARIANTS: Record<ConsultationCategory, readonly string[]> = {
  love_relationship: [
    "still lake or lagoon surrounded by weeping willows, soft mountains reflected in calm water",
    "misty river valley at dawn, willows trailing into slow current, rolling hills beyond",
    "hidden coastal cove at dusk, sea-smoothed stones, flowering cliff tops, silver surf",
    "forest glade with a clear brook, dappled canopy light, wild orchids along the bank",
    "mountain hot-spring terrace, rising steam, snow-capped peaks behind, delicate pink blossoms",
    "autumn riverside meadow, golden reflections, birch and maple canopy, wind-rippled water",
  ],
  career_work: [
    "imposing mountain peak above cloud sea, stone path ascending through mist",
    "sheer granite face at dawn, eagle circling, summit breaking first light",
    "high alpine ridge above cloud ocean, wind-scoured rock, crystalline sky",
    "stone stairway carved into clifftop, ascending ridgeline, far peaks beyond",
    "dark forested slope ascending to sunlit summit clearing above clouds",
    "canyon ascent with vertical walls, narrow sky strip, distant snow peak",
  ],
  health_wellbeing: [
    "fern forest with clear stream and filtered jade light",
    "highland meadow with wildflower field and cascading brook",
    "mountain hot spring pool, rising steam, snow-capped peaks beyond",
    "forest cathedral with canopy filtering green light onto mossy stream",
    "alpine meadow with clean air, distant glacier, wildflowers and dew",
    "river valley at dawn, mist lifting from water, fresh verdant banks",
  ],
  spiritual_inner: [
    "summit clarity — vast sky, forested slopes receding into haze, open altitude air",
    "moonlit high plateau, enormous stars overhead, dark ridges, single gnarled pine",
    "cloud-ocean above a mountain sea, summits as islands in white silence",
    "deep canyon at dusk, narrow sky strip of stars, waterfall mist far below",
    "ancient glacier basin, pale mineral water, ice-blue silence, reflected aurora tones",
    "wind-scoured ridge at twilight, distant burning horizon, lone boulder silhouette",
  ],
  family_home: [
    "meadow hedgerow with oak and willow, warm amber afternoon light, pastoral distance",
    "orchard hillside in blossom, field lane, gentle valley below in golden haze",
    "riverside belt of willows sheltering open meadow, distant rolling hills",
    "rolling hills with tree clusters, wildflower field, warm golden afternoon",
    "sheltering forest edge with sun-dappled clearing, still reflective pond",
    "old stone bridge over stream, meadow beyond, soft warm dusk glow",
  ],
  decision_path: [
    "mountain crossroads where two paths diverge into lifting mist",
    "high ridge spine with twin valleys revealed below in morning light",
    "narrow mountain pass opening to wide panorama, cloud sea below",
    "hilltop at dawn with two river valleys diverging toward horizon",
    "ancient forest clearing at trail fork, dappled light, two deep paths",
    "coastal headland with paths splitting toward open sea and wooded inland",
  ],
  conflict_challenge: [
    "stormy sea cliffs, lightning distant, lone pine on cliff edge above surf",
    "turbulent river gorge with dark canyon walls and breaking storm light",
    "wind-lashed ridge with storm parting to reveal sunlit valley below",
    "ocean headland at storm, iron sky, dramatic wave spray on ancient rocks",
    "dark forest in tempest, fallen timber, sudden sun shaft through cloud",
    "mountain face in gathering storm, clouds tearing, lone rock pinnacle",
  ],
  travel_change: [
    "river winding through vast open landscape toward distant horizon",
    "mountain pass opening to expansive new landscape beyond cloud sea",
    "coastal cliff path extending along ocean horizon, distant ship sails",
    "wide river delta with migrating birds in evening golden sky",
    "high plateau road curving toward distant horizon range, open sky",
    "winding valley river with forest banks converging at distant misty bend",
  ],
  general: [
    "layered ridges, river braid or lake/lagoon, forest pockets, varied sky and weather",
    "braided glacial river across a wide valley, gravel bars, conifer slopes rising each side",
    "high volcanic plateau, obsidian fields, turquoise crater lake, dramatic clouds",
    "mixed-forest hills with fog corridors between groves, stone path winding through",
    "wide estuary delta at golden hour, reed beds, sandbars, warm amber light on water",
    "deep forest gorge with river gleam below, layered canopy, afternoon shaft of light",
  ],
} as const;

/** Per-category element rotation — the specific objects FLUX draws; biggest driver of visual variety. */
const CATEGORY_ELEMENT_VARIANTS: Record<ConsultationCategory, readonly string[]> = {
  love_relationship: [
    "willow branches trailing water, lotus blossom, firefly sparks at dusk",
    "flowering orchids on coastal cliff, sea-smoothed stones, silver surf",
    "water lilies and mist on still lake, moonlit shimmer, dragonfly hover",
    "birch canopy with golden reflections, wild blooms along stream bank",
    "cherry blossom petals drifting on slow current, arched pine silhouette",
    "reed shadow on lagoon, water hyacinth, rose evening mist",
  ],
  career_work: [
    "ancient pine on cliff edge, morning mist lifting from deep valley floor",
    "stone stairway ascending through cloud sea, distant eagle soaring",
    "lone gnarled pine at summit wind-gap, granite ledge, crystalline air",
    "terraced rock slopes rising to clear blue zenith, sparse lichen outcrop",
    "ridgeline at first light breaking cloud wall, sunbeam on far snow peak",
    "dark cliff face with sunbeam splitting cloud layer above valley floor",
  ],
  health_wellbeing: [
    "flowing stream over smooth stones, wild orchids, morning dew on ferns",
    "fern fronds filtering green light, moss-covered boulders, clear pool",
    "mountain spring emerging from rock face, pale blossoms, delicate mist",
    "riverside meadow with healing herbs, dragonfly hovering over still water",
    "forest floor dappled through canopy, fern rings, creek gleam below",
    "highland meadow with wildflowers, gentle waterfall thread, fresh clear air",
  ],
  spiritual_inner: [
    "stone cairn on ridge, summit wind, stars at high altitude",
    "sun-shaft piercing cloud sea over mountain top, single ancient wind-bent tree",
    "moonlit summit snowfield, aurora suggestion in high-altitude sky",
    "deep canyon with narrow star-strip sky, distant waterfall mist far below",
    "ancient glacier basin, pale mineral water, ice-blue silence, mineral shore",
    "wind-scoured ridge at twilight, distant burning horizon, lone sacred boulder",
  ],
  family_home: [
    "wind-sculpted oak above meadow, wildflowers, distant hearth-smoke thread",
    "hedgerow and broad canopy, field stones, soft amber afternoon light",
    "riverside willows, gentle current, farmland beyond in golden haze",
    "orchard hillside, blossoms or fruit, soft green meadow slope below",
    "sheltering forest edge over grassy clearing, warm dusk sky above",
    "old stone wall in meadow, climbing vine, sunlit pastoral distance",
  ],
  decision_path: [
    "stone marker at mountain crossroads, lifting fog on two diverging paths",
    "eagle overhead at pass, two valleys revealed below, silver mist",
    "narrow ridge spine with twin descents, clouds in one valley, sun in other",
    "ancient waystone in forest clearing, dappled light, two branching trails",
    "hilltop in morning mist, two rivers visible diverging toward far horizon",
    "twin path fork in twilight forest, distant beacon light, owl silhouette",
  ],
  conflict_challenge: [
    "lone pine on cliff edge above turbulent sea, storm clouds parting above",
    "lightning distant over ocean, ancient rock stack, wave spray on cliff base",
    "stormy ridge with wind-bent trees, dramatic cloud break revealing sun",
    "dark canyon with rushing river, cliff faces, silver light shaft emerging",
    "headland with crashing surf below, iron-gray sky tearing open to gold",
    "forest in storm, fallen pine across path, sunbeam breaking cloud wall",
  ],
  travel_change: [
    "boat on river bending toward unknown horizon, migrating birds in V above",
    "mountain pass opening to vast new landscape, cloud highway far below",
    "winding road along river valley, cumulus towers, afternoon light",
    "coastal cliff path, sea extending to horizon, ship sails far out",
    "river delta fanning into wide sky, reeds, flight of egrets at dusk",
    "high pass with cairns and mule trail, vast alpine panorama beyond",
  ],
  general: [
    "distant peaks, ancient pine, sun shafts over river braid, drifting cloud",
    "layered ridges in morning mist, hawk soaring, rocky foreground pine",
    "mountain lake, twisted shore pine, dramatic cloud tower, reflected light",
    "gorge with silver river thread below, dense forest walls, pale sky",
    "highland meadow, boulder field, autumn color bands, far snow peaks",
    "pine grove with luminous fog corridor, stream gleam far below",
  ],
} as const;

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
  // `^` yields a SIGNED int32, and this is the only axis that mixes the raw `h`
  // (every other axis shifts first, so its top bit is already clear). When h's
  // top bit was set the index came out negative, OPENER_VARIANTS[-n] was
  // undefined, and the trailing .filter(Boolean) dropped the opening line
  // without a trace: 46.6% of prompts shipped with no scene-setting opener at
  // all, silently disabling one of the eight variation axes. `>>> 0` forces the
  // unsigned reading before the modulo.
  const openerIdx = ((h ^ (h >>> 11)) >>> 0) % OPENER_VARIANTS.length;
  const compIdx = ((h >>> 7) ^ (h >>> 19)) % COMPOSITION_VARIANTS.length;
  const lightIdx = ((h >>> 14) ^ (h >>> 5)) % ATMOSPHERE_ROTATIONS.length;
  const focalIdx = ((h >>> 21) ^ (h >>> 9)) % FOCAL_DIVERSITY_HINTS.length;
  const styleIdx = ((h >>> 3) ^ (h >>> 17)) % STYLE_MOOD_TAGS.length;
  const scenePrimaryIdx = ((h >>> 25) ^ (h >>> 4)) % SCENE_FAMILY_VARIANTS.length;
  const sceneSecondaryIdx =
    (scenePrimaryIdx + 3 + (((h >>> 10) ^ (h >>> 2)) % 5)) %
    SCENE_FAMILY_VARIANTS.length;
  const weatherIdx = ((h >>> 13) ^ (h >>> 23)) % WEATHER_VARIANTS.length;

  const envVariants = CATEGORY_ENVIRONMENT_VARIANTS[category];
  const environment = envVariants[((h >>> 6) ^ (h >>> 18)) % envVariants.length] ?? theme.environment;

  const elemVariants = CATEGORY_ELEMENT_VARIANTS[category];
  const elements = elemVariants[((h >>> 1) ^ (h >>> 27)) % elemVariants.length] ?? theme.elements;

  const settingBlock = [
    `PRIMARY SETTING (dominate the frame — no flat blank gradient): ${environment}.`,
    `Time and mood: ${theme.timeOfDay}; ${theme.mood}.`,
    `Palette: ${theme.colorPalette}.`,
    `Motifs (foreground and mid-ground): ${elements}.`,
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
    "Center open (water, forest aisle, mist, bright haze, or sky) for overlay — pure landscape in the central band.",
    "Frame edges: seamless landscape from corner to corner.",
    "Foreground: subtle rocks, pines, shore, or mist — purely natural elements.",
    `Emotional tone (${category}): ${theme.mood}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
