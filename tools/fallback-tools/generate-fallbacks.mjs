#!/usr/bin/env node
/**
 * Hexagram-specific fallback image generator for Cloudflare R2
 *
 * Generates 2,760 WebP images organized by hexagram/bones state → variant → tier.
 * Uses production-quality prompt structure from image-engine/src/prompt.ts,
 * with hexagram-specific PRIMARY SETTING and hash-rotated variety arrays.
 *
 * Includes automatic stamp/glyph detection: images with vermilion chop stamps
 * in corners are detected via sharp pixel analysis and regenerated (up to 2x).
 *
 * Usage:
 *   cd tools/fallback-tools
 *   npm install
 *   node --env-file="../../.env" generate-fallbacks.mjs --test    ← 8 QA images first
 *   node --env-file="../../.env" generate-fallbacks.mjs           ← full 2,760 images
 */

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pLimit from "p-limit";
import sharp from "sharp";

// ─── Config ──────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");
const PROGRESS_FILE = path.join(__dirname, "progress.json");
const TEST_MODE    = process.argv.includes("--test");
const VARIETY_MODE = process.argv.includes("--variety");

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY?.trim();
if (!TOGETHER_API_KEY) {
  console.error("❌  Missing TOGETHER_API_KEY environment variable");
  process.exit(1);
}

const MODEL = "black-forest-labs/FLUX.1-schnell";
const STEPS = 4;
const CONCURRENCY = 1;       // Together rate limit: 50 RPM — 1 worker keeps us safe
const DELAY_MS = 1500;       // ~25 RPM effective rate with avg 2.5s generation time
const MAX_RETRIES = 5;       // longer retry chain for rate-limit spikes
const MAX_STAMP_RETRIES = 2;
const VARIANTS = 10;

// ─── Tiers ───────────────────────────────────────────────────────────────────

const TIERS = [
  { key: "free",         w: 1024, h: 768  },
  { key: "seeker",       w: 1024, h: 1024 },
  { key: "practitioner", w: 1184, h: 1184 },
  { key: "master",       w: 1504, h: 1504 },
];

const COST = {
  free:         (1024 * 768)   / 1_000_000 * 0.0027,
  seeker:       (1024 * 1024)  / 1_000_000 * 0.0027,
  practitioner: (1184 * 1184)  / 1_000_000 * 0.0027,
  master:       (1504 * 1504)  / 1_000_000 * 0.0027,
};

// ─── Production variety arrays (ported from image-engine/src/prompt.ts) ──────

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
];

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
];

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
];

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
];

const STYLE_MOOD_TAGS = [
  "Fantasy landscape concept art — lush emotional geography, storybook lighting, painterly readable forms.",
  "Traditional ink-wash soul remapped onto soft volumetric illustration — poetic not photographic.",
  "Luminous mythic vista — gentle depth cues and varied silhouettes in illustrated epic style.",
  "Romantic pastoral grandeur — bittersweet poetic mood, soft glow, no decorative framing devices.",
  "Painterly highland dreamscape — airy atmosphere, geological variety as painted fantasy not expedition photo.",
  "Braided river through meadows — illustration softness, willow tangles, no buildings or bridges with signage.",
  "Seasonal fairy-tale emphasis — foliage and weather as emotional metaphor in painted color.",
  "Heritage mood through terrain alone — rock, forest, rivers, lakes, light, and weather — zero built structures or totems.",
];

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
];

const WEATHER_VARIANTS = [
  "Weather: clear dry air with long visibility and soft illustrated contrast.",
  "Weather: passing cloud shadows and intermittent sunbeams, painterly not dramatic HDR.",
  "Weather: light drizzle haze with smooth depth falloff and muted greens.",
  "Weather: post-rain freshness with bright ground reflections and clean sky windows.",
  "Weather: morning mist layers separated by warm side light.",
  "Weather: humid summer veil with softened distance and richer foreground saturation.",
  "Weather: crisp cold air with restrained palette and clear ridge hierarchy.",
  "Weather: gentle sea fog pushing inland, preserving low-contrast readability.",
];

// ─── Palette archetypes — drives FLUX color output ────────────────────────────
// 6 groups based on trigram/elemental character of hexagram families.

const PAL = [
  { palette: "vast sky blue, golden light rays, luminous cloud white — pure celestial expanse",      mood: "vast, luminous, majestic",           time: "golden dawn" },
  { palette: "deep amber, rich ochre earth, warm burnt sienna — dusk weight and depth",              mood: "deep, grounded, enduring",           time: "amber dusk"  },
  { palette: "silver mist blue, moonlit gray, deep midnight water — quiet reflective dark",          mood: "flowing, mysterious, reflective",    time: "silver evening or misty morning" },
  { palette: "warm amber gold, ember orange, deep forest green — radiant heat and vitality",         mood: "radiant, warm, transformative",      time: "golden hour" },
  { palette: "cool high-altitude blue-gray, pale mineral stone, restrained mist white",             mood: "still, enduring, contemplative",     time: "clear noon or misty overcast" },
  { palette: "jade green freshness, spring rose-gold haze, luminous morning white",                 mood: "fresh, awakening, gentle",           time: "spring morning" },
];

// ─── 64 Hexagrams ─────────────────────────────────────────────────────────────
// pal: index into PAL[] — drives color palette, mood, time of day

const HEXAGRAMS = [
  { n: 1,  name: "Qian",      pal: 0, theme: "vast open sky, towering cumulus clouds, golden light rays, pure yang energy, heavenly expanse" },
  { n: 2,  name: "Kun",       pal: 1, theme: "fertile dark earth, rolling plains at dusk, receptive yin energy, deep rich soil, endless horizon" },
  { n: 3,  name: "Zhun",      pal: 5, theme: "tender green shoots breaking through earth after rain, spring mud, new growth, early morning light" },
  { n: 4,  name: "Meng",      pal: 2, theme: "mountain spring trickling through moss and stone, gentle learning, morning mist in forest valley" },
  { n: 5,  name: "Xu",        pal: 4, theme: "heavy clouds gathering above ancient pine forest, patient waiting, storm approaching, still air" },
  { n: 6,  name: "Song",      pal: 2, theme: "two rivers colliding in narrow gorge, turbulent churning water, opposing currents meeting" },
  { n: 7,  name: "Shi",       pal: 1, theme: "vast disciplined army encampment at twilight, orderly rows on open earth, collective strength" },
  { n: 8,  name: "Bi",        pal: 2, theme: "multiple rivers converging into one great flow, union of waters, moving together toward the sea" },
  { n: 9,  name: "Xiao Xu",   pal: 5, theme: "gentle breeze moving through tall grass, small clouds drifting, subtle restraint, patience in wind" },
  { n: 10, name: "Lu",        pal: 4, theme: "narrow mountain path along cliff edge above clouds, careful steps, precision, treacherous beauty" },
  { n: 11, name: "Tai",       pal: 5, theme: "spring abundance, heaven and earth meeting at horizon, flowing harmony, cherry blossoms" },
  { n: 12, name: "Pi",        pal: 4, theme: "autumn stagnation, heaven and earth separated by dense immovable clouds, contemplative isolation" },
  { n: 13, name: "Tong Ren",  pal: 3, theme: "fire ascending toward open sky at night, community gathering around sacred flame, shared warmth" },
  { n: 14, name: "Da You",    pal: 0, theme: "midday sun at zenith over golden harvest fields, peak abundance and power, overflowing plenty" },
  { n: 15, name: "Qian",      pal: 4, theme: "great mountain hidden below ground level, humble valley, earth embracing depth, quiet modesty" },
  { n: 16, name: "Yu",        pal: 0, theme: "thunder rolling across open plains, earth vibrating with energy, enthusiasm, dynamic sky" },
  { n: 17, name: "Sui",       pal: 2, theme: "lake reflecting autumn moon in perfect stillness, gentle following, calm adaptation, clear water" },
  { n: 18, name: "Gu",        pal: 1, theme: "decayed ancient hollow tree with new green growth emerging, wind on mountain, renewal through decay" },
  { n: 19, name: "Lin",       pal: 5, theme: "approaching tide rolling over earth, lake expanding its reach, gentle oversight of vast plain" },
  { n: 20, name: "Guan",      pal: 4, theme: "ancient watchtower standing on cliff above vast plains, wind over earth, wide contemplative view" },
  { n: 21, name: "Shi He",    pal: 3, theme: "lightning striking through dense forest, dramatic illumination, justice breaking through, decisive force" },
  { n: 22, name: "Bi",        pal: 5, theme: "moonlight falling on mountain wildflowers, elegant natural adornment, soft silver illumination" },
  { n: 23, name: "Bo",        pal: 1, theme: "eroding cliff face slowly crumbling into dark sea, gradual dissolution, stone falling away" },
  { n: 24, name: "Fu",        pal: 5, theme: "first dawn light breaking under dark earth, winter solstice, return of warmth, rebirth of day" },
  { n: 25, name: "Wu Wang",   pal: 0, theme: "innocent deer in pristine ancient forest, unclouded sky above, spontaneous purity, natural freedom" },
  { n: 26, name: "Da Xu",     pal: 4, theme: "mountain containing and accumulating storm clouds within its peaks, great reservoir of potential" },
  { n: 27, name: "Yi",        pal: 5, theme: "ancient lotus pond with dragon turtle at rest, nourishment from still water, careful balance" },
  { n: 28, name: "Da Guo",    pal: 2, theme: "ancient stone bridge bending under great weight over flooded river, critical threshold moment" },
  { n: 29, name: "Kan",       pal: 2, theme: "rushing rapids cascading through deep mountain gorge, double danger, powerful waterfalls" },
  { n: 30, name: "Li",        pal: 3, theme: "twin flames clinging to each other in evening sky, double radiance, phoenix rising from embers" },
  { n: 31, name: "Xian",      pal: 2, theme: "serene lake resting in mountain hollow, magnetic stillness, mutual resonance of water and stone" },
  { n: 32, name: "Heng",      pal: 1, theme: "ancient gnarled tree enduring all seasons, thunder and wind together yet roots holding firm" },
  { n: 33, name: "Dun",       pal: 4, theme: "mountain peak retreating gracefully into clouds, dignified strategic withdrawal, dignified absence" },
  { n: 34, name: "Da Zhuang", pal: 0, theme: "great thunder rolling through heaven, sky charged with dynamic power, unleashed celestial energy" },
  { n: 35, name: "Jin",       pal: 0, theme: "sun rising steadily above flat earth horizon, steady progress of dawn light, advancing warmth" },
  { n: 36, name: "Ming Yi",   pal: 1, theme: "fire hidden beneath earth at sunset, concealed inner light, protective outer darkness" },
  { n: 37, name: "Jia Ren",   pal: 3, theme: "warm light glowing through paper windows of family home at dusk, shelter and fire within" },
  { n: 38, name: "Kui",       pal: 3, theme: "fire reflected above dark lake creating contrast of elements, opposition and complementary forces" },
  { n: 39, name: "Jian",      pal: 4, theme: "treacherous mountain path blocked by snow and ice, water rushing below, difficult obstruction" },
  { n: 40, name: "Jie",       pal: 5, theme: "spring storm passing, clearing sky after thunder, liberation, peaceful aftermath following tension" },
  { n: 41, name: "Sun",       pal: 4, theme: "mountain lake at low ebb, deliberate reduction to essentials, simplicity as offering, clarity" },
  { n: 42, name: "Yi",        pal: 5, theme: "wind over thunder, rapid natural growth in abundance, beneficial increase spreading outward" },
  { n: 43, name: "Guai",      pal: 0, theme: "lake overflowing past its banks toward heaven, decisive breakthrough, flooding as resolution" },
  { n: 44, name: "Gou",       pal: 5, theme: "wind sweeping unexpectedly under heaven, surprise encounter arriving, something coming from below" },
  { n: 45, name: "Cui",       pal: 2, theme: "great gathering at sacred lake, earth reflecting water perfectly, assembly of all elements" },
  { n: 46, name: "Sheng",     pal: 5, theme: "young sapling pushing steadily upward through rich earth, ascending, gradual natural rise" },
  { n: 47, name: "Kun",       pal: 1, theme: "dried ancient lake bed, cracked earth, bare winter trees, endurance in profound scarcity" },
  { n: 48, name: "Jing",      pal: 2, theme: "ancient stone well in deep forest, inexhaustible water source, community gathering, cool depth" },
  { n: 49, name: "Ge",        pal: 3, theme: "volcanic eruption transforming landscape completely, radical change, revolutionary renewal of earth" },
  { n: 50, name: "Ding",      pal: 3, theme: "sacred bronze cauldron on ritual mountain platform, fire below, alchemy of transformation" },
  { n: 51, name: "Zhen",      pal: 0, theme: "double thunderstorm, twin lightning striking earth, shocking awakening, sky fully alive" },
  { n: 52, name: "Gen",       pal: 4, theme: "lone mountain in absolute stillness, twin peaks in meditation, no movement, complete rest" },
  { n: 53, name: "Jian",      pal: 5, theme: "wild geese migrating in orderly formation over misty mountain, gradual ordered natural progress" },
  { n: 54, name: "Gui Mei",   pal: 2, theme: "young crescent moon reflected in still lake at night, subordinate gentle aspiration, quiet longing" },
  { n: 55, name: "Feng",      pal: 3, theme: "dramatic storm with lightning at peak abundance, fullness of sky, thunder at high noon" },
  { n: 56, name: "Lu",        pal: 4, theme: "lone traveler's small fire burning on dark mountainside, impermanence, wandering, transient shelter" },
  { n: 57, name: "Xun",       pal: 5, theme: "wind moving ceaselessly through endless bamboo forest, double gentle penetration, persistent breath" },
  { n: 58, name: "Dui",       pal: 2, theme: "twin lakes perfectly reflecting each other, joyful open exchange, mirrored water delight" },
  { n: 59, name: "Huan",      pal: 5, theme: "wind scattering morning mist over open water, dissolution into clarity, dispersion of fog" },
  { n: 60, name: "Jie",       pal: 4, theme: "bamboo segments defining measured space, river flowing within natural banks, conscious natural limit" },
  { n: 61, name: "Zhong Fu",  pal: 2, theme: "wind moving over perfectly calm lake, inner sincerity visible as gentle ripples, transparent depth" },
  { n: 62, name: "Xiao Guo",  pal: 4, theme: "lone bird flying carefully low over mountain ridge, small careful excess, close attention to detail" },
  { n: 63, name: "Ji Ji",     pal: 3, theme: "water and fire in perfect equilibrium, completion and stillness, all elements in balance" },
  { n: 64, name: "Wei Ji",    pal: 3, theme: "fire above water in active transition, fox crossing frozen river, before completion, becoming" },
];

// ─── Oracle Bones states ──────────────────────────────────────────────────────

const BONES_STATES = [
  {
    key: "ji_clear",
    palette: "triumphant golden dawn, celestial amber, luminous cloud white — sovereign light",
    mood: "auspicious, triumphant, serene",
    time: "golden dawn",
    theme: "dramatic ancient landscape at golden dawn, auspicious crane soaring above sacred mountain lake, victorious golden light breaking through clouds, spiritual triumph, serene sovereign power",
  },
  {
    key: "ji_moderate",
    palette: "warm amber dusk, soft bamboo green, tranquil river silver",
    mood: "calm, blessed, prosperous",
    time: "warm dusk",
    theme: "peaceful valley at warm dusk, gentle river flowing through bamboo forest, amber light on still water, moderate blessing, calm prosperity, soft favorable energy",
  },
  {
    key: "xiong_moderate",
    palette: "overcast silver-gray, muted sage, still charcoal lake",
    mood: "cautious, restrained, contemplative",
    time: "heavy overcast midday",
    theme: "overcast ancient mountain pass, heavy grey clouds over still lake, muted tones, contemplative caution, subdued restrained landscape, waiting atmosphere",
  },
  {
    key: "xiong_clear",
    palette: "stormy deep navy, crimson storm-lit cloud, iron-gray sea",
    mood: "intense, warning, turbulent",
    time: "dark stormy night",
    theme: "stormy coastal cliffs at night, dark churning sea below, dramatic storm over water, deep crimson storm clouds, powerful warning forces, vast turbulent ocean",
  },
  {
    key: "silence",
    palette: "absolute white, pale ice-blue void, silver-gray mineral quiet",
    mood: "absolute stillness, timeless, suspended",
    time: "deep winter fog",
    theme: "absolute stillness, empty zen garden in deep winter fog, snow-covered stones, no wind, profound silence, white void of winter, suspended timeless moment",
  },
];

// ─── Hash (FNV1a32 — same as production image-engine) ────────────────────────

function hashToUint(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────
// Mirrors production buildImagePrompt structure exactly.
// subject: hexagram (has .pal index) or bones state (has inline .palette/.mood/.time)

function buildPrompt(subject, variant) {
  const { palette, mood, time } = subject.pal !== undefined ? PAL[subject.pal] : subject;
  const seedKey = subject.key ?? `hex:${subject.n}`;
  const seed = `${seedKey}:v${variant}`;
  const h = hashToUint(seed);

  const openerIdx         = (h ^ (h >>> 11)) % OPENER_VARIANTS.length;
  const compIdx           = ((h >>> 7) ^ (h >>> 19)) % COMPOSITION_VARIANTS.length;
  const lightIdx          = ((h >>> 14) ^ (h >>> 5)) % ATMOSPHERE_ROTATIONS.length;
  const focalIdx          = ((h >>> 21) ^ (h >>> 9)) % FOCAL_DIVERSITY_HINTS.length;
  const styleIdx          = ((h >>> 3) ^ (h >>> 17)) % STYLE_MOOD_TAGS.length;
  const scenePrimaryIdx   = ((h >>> 25) ^ (h >>> 4)) % SCENE_FAMILY_VARIANTS.length;
  const sceneSecondaryIdx = (scenePrimaryIdx + 3 + (((h >>> 10) ^ (h >>> 2)) % 5)) % SCENE_FAMILY_VARIANTS.length;
  const weatherIdx        = ((h >>> 13) ^ (h >>> 23)) % WEATHER_VARIANTS.length;

  const settingBlock = [
    `PRIMARY SETTING (dominate the frame — no flat blank gradient): ${subject.theme}.`,
    `Time and mood: ${time}; ${mood}.`,
    `Palette: ${palette}.`,
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
  ].filter(Boolean).join(" ");
}

// ─── Glyph / stamp detector ───────────────────────────────────────────────────
// Resizes image to 400×400, checks 120×120 corner zones for vermilion pixels
// (R>160, G<90, B<90). If any corner exceeds THRESHOLD, image is flagged.
// Catches chop stamps; does not require OCR.

async function hasGlyphArtifacts(webpBuffer) {
  const SIZE = 400;
  const CORNER = 120;
  const THRESHOLD = 150; // ~1% of corner area

  const { data, info } = await sharp(webpBuffer)
    .resize(SIZE, SIZE, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const ch = info.channels;

  const corners = [
    { x0: 0,          y0: 0 },
    { x0: w - CORNER, y0: 0 },
    { x0: 0,          y0: w - CORNER },
    { x0: w - CORNER, y0: w - CORNER },
  ];

  for (const { x0, y0 } of corners) {
    let redCount = 0;
    for (let y = y0; y < y0 + CORNER; y++) {
      for (let x = x0; x < x0 + CORNER; x++) {
        const i = (y * w + x) * ch;
        if (data[i] > 160 && data[i + 1] < 90 && data[i + 2] < 90) redCount++;
      }
    }
    if (redCount >= THRESHOLD) return true;
  }
  return false;
}

// ─── Together AI ──────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateImage({ prompt, width, height }) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        width,
        height,
        n: 1,
        steps: STEPS,
        response_format: "url",
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const retriable = res.status === 429 || res.status >= 500;
      if (retriable && attempt < MAX_RETRIES) {
        const wait = 5000 * (attempt + 1); // 5s, 10s, 15s, 20s, 25s
        console.warn(`  ↻ Together ${res.status} — retrying in ${wait / 1000}s`);
        await sleep(wait);
        continue;
      }
      throw new Error(`Together ${res.status}: ${detail.slice(0, 200)}`);
    }

    const payload = await res.json();
    const url = payload?.data?.[0]?.url;
    if (!url) {
      if (attempt < MAX_RETRIES) { await sleep(3000 * (attempt + 1)); continue; }
      throw new Error("Together response had no image URL");
    }

    const imgRes = await fetch(url);
    if (!imgRes.ok) {
      if (attempt < MAX_RETRIES) { await sleep(3000 * (attempt + 1)); continue; }
      throw new Error(`Image fetch failed: ${imgRes.status}`);
    }

    const png = Buffer.from(await imgRes.arrayBuffer());
    return await sharp(png).webp({ quality: 85 }).toBuffer();
  }
  throw new Error("Max retries exceeded");
}

// ─── Generate with stamp filter ───────────────────────────────────────────────

async function generateClean({ prompt, width, height, label }) {
  let lastWebp;
  for (let attempt = 0; attempt <= MAX_STAMP_RETRIES; attempt++) {
    lastWebp = await generateImage({ prompt, width, height });
    const stamped = await hasGlyphArtifacts(lastWebp);
    if (!stamped) return { webp: lastWebp, stampRetries: attempt, forcedAccept: false };
    if (attempt < MAX_STAMP_RETRIES) {
      console.warn(`  ⚠️  stamp detected — regenerating ${label} (${attempt + 1}/${MAX_STAMP_RETRIES})`);
      await sleep(DELAY_MS);
    }
  }
  return { webp: lastWebp, stampRetries: MAX_STAMP_RETRIES, forcedAccept: true };
}

// ─── Progress tracking ────────────────────────────────────────────────────────

async function loadProgress() {
  try {
    const raw = await readFile(PROGRESS_FILE, "utf8");
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

async function saveProgress(done) {
  await writeFile(PROGRESS_FILE, JSON.stringify([...done]), "utf8");
}

// ─── Job builders ─────────────────────────────────────────────────────────────

function buildAllJobs() {
  const jobs = [];

  for (const hex of HEXAGRAMS) {
    for (let v = 1; v <= VARIANTS; v++) {
      for (const tier of TIERS) {
        jobs.push({
          key:     `iching/${hex.n}/${v}/${tier.key}`,
          outPath: path.join(OUTPUT_DIR, "iching", String(hex.n), String(v), `${tier.w}x${tier.h}.webp`),
          prompt:  buildPrompt(hex, v),
          w: tier.w, h: tier.h,
          cost: COST[tier.key],
          label: `iching/${hex.n}/v${v}`,
        });
      }
    }
  }

  for (const bone of BONES_STATES) {
    for (let v = 1; v <= VARIANTS; v++) {
      for (const tier of TIERS) {
        jobs.push({
          key:     `bones/${bone.key}/${v}/${tier.key}`,
          outPath: path.join(OUTPUT_DIR, "bones", bone.key, String(v), `${tier.w}x${tier.h}.webp`),
          prompt:  buildPrompt(bone, v),
          w: tier.w, h: tier.h,
          cost: COST[tier.key],
          label: `bones/${bone.key}/v${v}`,
        });
      }
    }
  }

  return jobs;
}

function buildVarietyJobs() {
  const jobs = [];
  // Hex 1 (Qian) variants 1–5 — same subject, 5 different compositions/lights/scenes
  for (let v = 1; v <= 5; v++) {
    jobs.push({ subject: HEXAGRAMS[0], v, tier: TIERS[3],
      filename: `variety_hex1_v${v}.webp`, key: `VARIETY/hex1_v${v}` });
  }
  // Hex 31 (Xian) variants 1–4 — different palette archetype (pal:2, silver/water)
  for (let v = 1; v <= 4; v++) {
    jobs.push({ subject: HEXAGRAMS[30], v, tier: TIERS[3],
      filename: `variety_hex31_v${v}.webp`, key: `VARIETY/hex31_v${v}` });
  }
  return jobs.map((j) => ({
    key:     j.key,
    outPath: path.join(OUTPUT_DIR, "VARIETY", j.filename),
    prompt:  buildPrompt(j.subject, j.v),
    w: j.tier.w, h: j.tier.h,
    cost: COST[j.tier.key],
    label: j.key,
  }));
}

function buildTestJobs() {
  return [
    { key: "TEST/iching_1_master",        subject: HEXAGRAMS[0],    v: 1, tier: TIERS[3], filename: "iching_1_master.webp" },
    { key: "TEST/iching_31_master",       subject: HEXAGRAMS[30],   v: 1, tier: TIERS[3], filename: "iching_31_master.webp" },
    { key: "TEST/iching_64_master",       subject: HEXAGRAMS[63],   v: 1, tier: TIERS[3], filename: "iching_64_master.webp" },
    { key: "TEST/bones_ji_clear_master",  subject: BONES_STATES[0], v: 1, tier: TIERS[3], filename: "bones_ji_clear_master.webp" },
    { key: "TEST/bones_silence_master",   subject: BONES_STATES[4], v: 1, tier: TIERS[3], filename: "bones_silence_master.webp" },
    { key: "TEST/iching_1_free",          subject: HEXAGRAMS[0],    v: 1, tier: TIERS[0], filename: "iching_1_free.webp" },
    { key: "TEST/iching_31_seeker",       subject: HEXAGRAMS[30],   v: 1, tier: TIERS[1], filename: "iching_31_seeker.webp" },
    { key: "TEST/iching_64_practitioner", subject: HEXAGRAMS[63],   v: 1, tier: TIERS[2], filename: "iching_64_practitioner.webp" },
  ].map((j) => ({
    key:     j.key,
    outPath: path.join(OUTPUT_DIR, "TEST", j.filename),
    prompt:  buildPrompt(j.subject, j.v),
    w: j.tier.w, h: j.tier.h,
    cost: COST[j.tier.key],
    label: j.key,
  }));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (VARIETY_MODE) {
    console.log("🎨 VARIETY MODE — hex 1 (v1–5) + hex 31 (v1–4) a master 1504×1504\n");
    const jobs = buildVarietyJobs();
    await mkdir(path.join(OUTPUT_DIR, "VARIETY"), { recursive: true });
    for (const job of jobs) {
      process.stdout.write(`  ${job.key} … `);
      try {
        const { webp, stampRetries, forcedAccept } = await generateClean({
          prompt: job.prompt, width: job.w, height: job.h, label: job.key,
        });
        await writeFile(job.outPath, webp);
        const note = forcedAccept ? " ⚠️ stamp forced" : stampRetries > 0 ? ` (regen ${stampRetries}x)` : "";
        console.log(`✅  ${(webp.length / 1024).toFixed(0)} KB${note}`);
      } catch (err) {
        console.log(`❌  ${err.message}`);
      }
      await sleep(DELAY_MS);
    }
    console.log("\n✅ VARIETY COMPLETO — revisa output/VARIETY/");
    return;
  }

  if (TEST_MODE) {
    console.log("🧪 TEST MODE — generating 8 QA images into output/TEST/\n");
    const testJobs = buildTestJobs();
    await mkdir(path.join(OUTPUT_DIR, "TEST"), { recursive: true });

    for (const job of testJobs) {
      process.stdout.write(`  ${job.key} (${job.w}×${job.h}) … `);
      try {
        const { webp, stampRetries, forcedAccept } = await generateClean({
          prompt: job.prompt, width: job.w, height: job.h, label: job.key,
        });
        await writeFile(job.outPath, webp);
        const note = forcedAccept
          ? " ⚠️ stamp forced-accepted"
          : stampRetries > 0 ? ` (clean after ${stampRetries} regen)` : "";
        console.log(`✅  ${(webp.length / 1024).toFixed(0)} KB${note}`);
      } catch (err) {
        console.log(`❌  ${err.message}`);
      }
      await sleep(DELAY_MS);
    }

    console.log(`
✅ TEST COMPLETO — revisa las 8 imágenes en output/TEST/
Si la calidad es correcta, ejecuta sin --test para la generación completa.
`);
    return;
  }

  // Full generation
  const allJobs = buildAllJobs();
  const done = await loadProgress();
  const pending = allJobs.filter((j) => !done.has(j.key));
  const totalCost = allJobs.reduce((s, j) => s + j.cost, 0);
  const pendingCost = pending.reduce((s, j) => s + j.cost, 0);
  const estMinutes = Math.ceil((pending.length / CONCURRENCY) * (3 / 60));

  console.log(`
📦 Total imágenes : ${allJobs.length}
✅ Ya completadas : ${done.size}
🔄 Pendientes     : ${pending.length}
💰 Costo estimado : $${pendingCost.toFixed(2)} (total proyecto: $${totalCost.toFixed(2)})
⏱  Tiempo est.    : ~${estMinutes} min (concurrencia ${CONCURRENCY})
`);

  if (pending.length === 0) {
    console.log("✅ Nada pendiente. Todo generado.");
    return;
  }

  const limit = pLimit(CONCURRENCY);
  let completed = 0;
  let spentSoFar = 0;
  let stampEvents = 0;

  const tasks = pending.map((job) =>
    limit(async () => {
      await mkdir(path.dirname(job.outPath), { recursive: true });
      const { webp, stampRetries, forcedAccept } = await generateClean({
        prompt: job.prompt, width: job.w, height: job.h, label: job.label,
      });
      await writeFile(job.outPath, webp);
      done.add(job.key);
      await saveProgress(done);
      completed++;
      spentSoFar += job.cost;
      if (stampRetries > 0) stampEvents++;

      if (completed % 50 === 0 || completed === pending.length) {
        const pct = ((completed / pending.length) * 100).toFixed(1);
        console.log(`[${completed}/${pending.length}] ${pct}% — ${job.key} — $${spentSoFar.toFixed(2)} gastados`);
      } else {
        const flag = forcedAccept ? " ⚠️stamp" : stampRetries > 0 ? " ✦regen" : "";
        console.log(`  ✅ ${job.key} — ${(webp.length / 1024).toFixed(0)} KB${flag}`);
      }
    })
  );

  try {
    await Promise.all(tasks);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    console.log("Progress guardado. Vuelve a ejecutar para continuar.");
    process.exitCode = 1;
    return;
  }

  console.log(`\n✅ Generación completa. ${allJobs.length} imágenes en output/`);
  console.log(`💰 Gasto total: $${spentSoFar.toFixed(2)}`);
  if (stampEvents > 0) console.log(`⚠️  ${stampEvents} imágenes tuvieron detección de sello (regeneradas).`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exitCode = 1;
});
