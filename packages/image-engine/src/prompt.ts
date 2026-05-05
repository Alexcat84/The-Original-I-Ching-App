import type { Hexagram, Line } from "@iching-oracle/iching-engine";
import type { ConsultationCategory } from "./categories.js";
import { VISUAL_THEMES } from "./categories.js";

/**
 * Full anti-text / anti-seal lines for Together `negative_prompt` only.
 * Do not prepend to buildImagePrompt — that steals compactPrompt budget from PRIMARY SETTING.
 */
const IMAGE_NEGATIVE_CONSTRAINT_LINES = [
  "Hard negative rules: no text, no letters, no numbers, no Chinese characters, no calligraphy, no logos, no watermark, no UI elements.",
  "Do not draw any Chinese characters, seal script, vertical inscription columns, poem scrolls, or corner calligraphy bands.",
  "No red chops, stamps, seals, signatures, logos, watermarks, pinyin, roman words, or numbers anywhere.",
  "No decorative glyphs in margins — especially no vertical text columns on left or right edges.",
  "Center MUST be a large blank, uncluttered misty space with NO calligraphy characters, NO seal-script glyphs, and NO hexagram bars/lines.",
  "Hard rule: do not draw any Chinese characters, pinyin, roman text, numbers, symbols, or seal chops anywhere in the image.",
  "Absolutely forbidden: red stamps, signature seals, poem columns, vertical black calligraphy, logos, watermarks, decorative corner glyphs, hanko, or any textual mark in any corner.",
  "No hexagram bars or line graphics in the raster — those are composited in post; keep center visually empty for overlay.",
  "No ornate picture frame, no repeating geometric fret border, no carved wooden lattice mat, no decorative orange or red mount — image must be full-bleed edge-to-edge.",
] as const;

/**
 * Dense keyword + prose negatives for Together FLUX `negative_prompt`.
 * Main prompt stays landscape-first (sumi-e + themes); this field carries seal/text suppression.
 */
export function buildTogetherNegativePrompt(): string {
  const keywordPrefix =
    "Chinese characters, Hanzi, Kanji, Hangul, Hiragana, Katakana, Cyrillic, Arabic script, seal script, calligraphy, vertical inscription, poem scroll, carved stone text, subtitles, captions, typography, watermark, chop, stamp, seal, hanko, red corner seal, corner decoration, logo, letters, numerals, pinyin, hanging scroll, album leaf, decorative picture frame, patterned border, fretwork mat";
  return [keywordPrefix, ...IMAGE_NEGATIVE_CONSTRAINT_LINES].join(" ");
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

/** Same variants as origin/main — rich shanshui framing; hexagram bars come from overlay only. */
const COMPOSITION_VARIANTS = [
  "Composition: hexagram and scholar table in lower-left third; expansive ink-wash sky, distant ridges, and mist filling upper-right — strong diagonal depth.",
  "Composition: centered vertical axis — hexagram dominant; layered mountains recede behind a middle-ground river band; cranes or geese as small silhouettes.",
  "Composition: wide foreground — weathered stone terrace with table; hexagram slightly above center; deep atmospheric perspective into valley fog.",
  "Composition: intimate courtyard garden view — moon gate or lattice shadow; table near viewer; hexagram as focal vertical stack against soft bokeh foliage.",
] as const;

const ATMOSPHERE_ROTATIONS = [
  "Light: cool dawn sidelight with warm rim on incense smoke.",
  "Light: overcast diffusion, soft silver reflections on water or wet stone.",
  "Light: late afternoon gold, long shadows, amber haze.",
  "Light: moonlit high contrast, blue-gray shadows, paper lanterns as tiny warm points.",
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
  const compIdx = h % COMPOSITION_VARIANTS.length;
  const lightIdx = (h >>> 8) % ATMOSPHERE_ROTATIONS.length;

  const settingBlock = [
    `PRIMARY SETTING (must dominate the image — do not use a flat blank gradient): ${theme.environment}.`,
    `Time and mood: ${theme.timeOfDay}; ${theme.mood}.`,
    `Palette: ${theme.colorPalette}.`,
    `Motifs to weave into mid-ground or background (choose what fits): ${theme.elements}.`,
    ATMOSPHERE_ROTATIONS[lightIdx],
    COMPOSITION_VARIANTS[compIdx],
    "Avoid generic stock void backgrounds, plain single-color fills, or unrelated Western scenery. The scene must read as classical Chinese ink painting atmosphere tied to this setting.",
  ].join(" ");

  /**
   * Landscape-first order (matches origin/main): compactPrompt keeps the start, so PRIMARY SETTING
   * and themes reach Together/FAL. Anti-text duplicates live in buildTogetherNegativePrompt only.
   */
  return [
    "Elegant ancient Chinese ink wash painting (sumi-e) on textured handmade xuan paper, widescreen 16:9, museum quality, scholarly Zhouyi consultation.",
    settingBlock,
    "Center MUST be a large blank, uncluttered misty space with NO calligraphy characters, NO seal-script glyphs, and NO hexagram bars/lines.",
    "Hard rule: do not draw any Chinese characters, pinyin, roman text, numbers, symbols, or seal chops anywhere in the image.",
    "Absolutely forbidden: red stamps, signature seals, poem columns, vertical black calligraphy, logos, watermarks, decorative corner glyphs, or any textual mark in any corner.",
    "Foreground: weathered wooden scholar table with bronze incense burner (thin smoke trail), scattered round copper cash coins with square holes.",
    `Emotional register for consultation theme (${category}): ${theme.mood}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
