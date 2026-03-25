import type { ConsultationCategory } from "./categories.js";
import { VISUAL_THEMES } from "./categories.js";

/**
 * Archaeologically informed crack topology for Shang-style pyromancy (灼兆).
 * Each id matches engine verdict mapping; describes 兆 shape from drill + heat stress.
 */
export function describeOracleBoneCrackTopology(patternId: number): string {
  switch (patternId) {
    case 1:
      return (
        "Crack system 兆 type A (auspicious clear): a principal vertical fissure from a circular drill pit, with one clean horizontal branch forming a bold 'T'; " +
        "secondary hairline splits radiate within the burnt oval; grooves are incised, darker in the channel than the bone surface."
      );
    case 2:
      return (
        "Crack system 兆 type B (auspicious moderate): single dominant vertical 兆 rising from an elliptical drill scar; " +
        "slight curve like bamboo; no strong crossing branch — restrained, orderly fracture."
      );
    case 3:
      return (
        "Crack system 兆 type C (inauspicious moderate): two oblique cracks crossing from adjacent drill pits, forming an 'X' tension zone; " +
        "chatter marks at intersection suggest conflicted reading."
      );
    case 4:
      return (
        "Crack system 兆 type D (inauspicious clear): vertical main 兆 from pit, then bifurcation ('Y') toward lower field; " +
        "one branch longer — emphatic divergence, deep carved channels."
      );
    case 5:
    default:
      return (
        "Crack system 兆 type E (indeterminate / ancestral silence): several short irregular stress lines from multiple shallow drill points, " +
        "no single commanding 兆; porous bone around pits; ambiguous fracture network."
      );
  }
}

export function buildOracleBonesImagePrompt(params: {
  category: ConsultationCategory;
  medium: "turtle" | "ox";
  patternId: number;
  verdictLabel: string;
}): string {
  const theme = VISUAL_THEMES[params.category] ?? VISUAL_THEMES.general;
  const bone =
    params.medium === "turtle"
      ? "polished turtle plastron (ventral shell), natural polygonal scute boundaries, aged ivory-beige with fine pitting"
      : "large ox scapula, curved blade-like bone, porous spongy areas near spine edge, weathered beige-cream";

  const topology = describeOracleBoneCrackTopology(params.patternId);

  return [
    "Photorealistic Shang dynasty (c. 1200 BCE) oracle bone divination still life, museum diorama quality, widescreen 16:9, cinematic torchlight.",
    `Surface: ${bone}; subtle knife-work along edges; natural cracks from age separate from fresh pyromantic 兆.`,
    "Pyromancy evidence: paired circular/oval drill pits (鑽) where heat was applied; burnt halos; main divination cracks (兆) propagate upward from pits — not random scratches.",
    topology,
    "Inscriptions: several vertical columns of stylized oracle bone script (甲骨文) — pictographic, incised, thin angular strokes; characters are ornamental pseudo-glyphs, NOT readable modern Chinese sentences, no Latin letters.",
    `Altar context echoing mood (${params.verdictLabel}): ${theme.environment}; ${theme.mood}. Include bronze gu or jue silhouette, coarse woven mat, ochre and cinnabar dust.`,
    "Lighting: harsh warm torch from one side, deep shadows in carved grooves, specular highlights on bone rim.",
    "Negative: no clean digital gradient backdrops, no neon, no modern objects, no watermark, no logo.",
  ].join(" ");
}
