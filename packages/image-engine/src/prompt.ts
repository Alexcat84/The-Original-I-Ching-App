import type { Hexagram, Line } from "@iching-oracle/iching-engine";
import type { ConsultationCategory } from "./categories.js";
import { VISUAL_THEMES } from "./categories.js";

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

/** Compositional framing so backgrounds are not identical across readings. */
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
  transformed: Hexagram | null,
  category: ConsultationCategory,
  changingLines: number[],
  castLines?: Line[],
  consultationId?: string,
): string {
  const theme = VISUAL_THEMES[category] ?? VISUAL_THEMES.general;
  const mut =
    changingLines.length > 0
      ? `Changing lines (Zhu Xi method): positions ${changingLines.join(", ")} — only these lines get gold glow.`
      : "No changing lines; all six lines are stable black ink.";
  const second = transformed
    ? `Transformed hexagram (potential outcome): #${transformed.number} ${transformed.name} (${transformed.chineseName}).`
    : "Single-hexagram reading; no transformed figure.";

  const stack =
    castLines && castLines.length === 6
      ? `HEXAGRAM STACK (bottom to top, must match exactly): ${describeHexagramLinesForImage(castLines)}`
      : "";

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

  return [
    "Elegant ancient Chinese ink wash painting (sumi-e) on textured handmade xuan paper, widescreen 16:9, museum quality, scholarly Zhouyi consultation.",
    settingBlock,
    "Center: large calligraphic hexagram as six horizontal strokes stacked vertically; obey the exact line pattern below.",
    stack,
    "Foreground: weathered wooden scholar table with bronze incense burner (thin smoke trail), scattered round copper cash coins with square holes.",
    `Primary hexagram: #${primary.number} ${primary.name} (${primary.chineseName}, ${primary.pinyin}).`,
    second,
    mut,
    `Emotional register for consultation theme (${category}): ${theme.mood}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
