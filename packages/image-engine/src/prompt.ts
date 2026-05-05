import type { Hexagram, Line } from "@iching-oracle/iching-engine";
import type { ConsultationCategory } from "./categories.js";
import { VISUAL_THEMES } from "./categories.js";

/**
 * Shared no-text / no-CJK rules for main prompt and Together `negative_prompt`.
 * Includes the same hard sentences as `origin/main` tail — those were dropped when negatives
 * moved to the front; keeping them here restores corner/seal suppression after truncation.
 */
const IMAGE_NEGATIVE_CONSTRAINT_LINES = [
  // Same ultra-short hard line as oracle-bones prompt — FLUX follows this reliably.
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
 * Dense keyword negative for APIs that support a separate field (e.g. Together FLUX).
 * Complements the main prompt; does not replace the prose block at the start of buildImagePrompt.
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

/**
 * Landscape-only framing (no “hexagram” wording — that primed FLUX to paint bars + seals).
 * Overlay draws the real hexagram in post.
 */
const COMPOSITION_VARIANTS = [
  "Composition: cinematic landscape — lower-left foreground river terrace; expansive sky and layered ridges upper-right; strong diagonal mist (photographic depth).",
  "Composition: wide horizon — distant mountains behind a calm river band; tiny bird silhouettes; generous empty center for overlay.",
  "Composition: deep valley fog — stone embankment foreground; atmospheric perspective; soft neutral center.",
  "Composition: intimate riverside — blurred trees and moon gate silhouette; calm open middle ground; no focal manuscript or scroll.",
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
    "Avoid generic stock void backgrounds, plain single-color fills, or unrelated Western scenery. Natural outdoor Chinese shanshui scenery (mist, mountains, water) — photorealistic cinematic look, not an illustrated scroll or album painting.",
  ].join(" ");

  // Negative constraints FIRST so compactPrompt(maxLen) truncation does not drop safety rules.
  const negativeBlock = [
    "NEGATIVE CONSTRAINTS (highest priority — obey before all else):",
    ...IMAGE_NEGATIVE_CONSTRAINT_LINES,
  ].join(" ");

  return [
    negativeBlock,
    "Cinematic photorealistic landscape, full-bleed 16:9, edge-to-edge — high-end nature documentary still. Classical Chinese mountains-and-water atmosphere. NOT sumi-e on xuan paper, NOT hanging scroll, NOT manuscript or album leaf (those styles trigger corner seals and vertical text in generative models).",
    settingBlock,
    "Foreground props (subtle, photorealistic): weathered wooden scholar table edge, bronze incense smoke wisps, a few round copper cash coins — keep props low-contrast so they do not dominate.",
    `Emotional register for consultation theme (${category}): ${theme.mood}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
