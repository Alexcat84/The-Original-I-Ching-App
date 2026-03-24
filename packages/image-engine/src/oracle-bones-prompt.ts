import type { ConsultationCategory } from "./categories.js";
import { VISUAL_THEMES } from "./categories.js";

export function buildOracleBonesImagePrompt(params: {
  category: ConsultationCategory;
  medium: "turtle" | "ox";
  patternId: number;
  verdictLabel: string;
}): string {
  const theme = VISUAL_THEMES[params.category] ?? VISUAL_THEMES.general;
  const bone =
    params.medium === "turtle"
      ? "turtle plastron oracle bone, polished shell"
      : "ox scapula oracle bone, large shoulder blade";
  return [
    "Photorealistic ancient Chinese Shang dynasty divination scene, c. 1200 BCE, no readable modern text in frame.",
    `${bone} on rough stone altar, dramatic heat cracks on bone surface glowing faint orange from within,`,
    `crack motif variant ${params.patternId}, ritual verdict mood: ${params.verdictLabel}.`,
    `Background: ${theme.environment}, torchlight, bronze ritual vessels, ochre vermilion and deep black palette, harsh shadows.`,
    "Museum quality, wide 16:9, hyperdetailed bone texture, cinematic.",
  ].join(" ");
}
