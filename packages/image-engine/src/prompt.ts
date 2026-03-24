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

export function buildImagePrompt(
  primary: Hexagram,
  transformed: Hexagram | null,
  category: ConsultationCategory,
  changingLines: number[],
  castLines?: Line[],
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

  return [
    "Elegant ancient Chinese ink wash painting (sumi-e) on textured handmade paper, widescreen 16:9, scholarly I Ching consultation.",
    "Center: large calligraphic hexagram as six horizontal strokes stacked vertically; obey the exact line pattern below.",
    stack,
    "Foreground: weathered wooden scholar table with bronze incense burner (thin smoke trail), scattered round copper coins with square holes.",
    "Background: misty mountain, resilient pine on a crag, optional flock of wild geese in soft clouds — minimalist atmospheric depth.",
    "Palette: ink blacks, warm greys, rice-paper beige; gold accents ONLY on changing lines. No legible text, no watermark, no logo.",
    `Primary hexagram: #${primary.number} ${primary.name} (${primary.chineseName}, ${primary.pinyin}).`,
    second,
    mut,
    `Mood for category (${category}): ${theme.mood}. Suggested atmosphere: ${theme.environment}.`,
  ]
    .filter(Boolean)
    .join(" ");
}
