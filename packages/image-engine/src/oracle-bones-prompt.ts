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
    "Photorealistic ancient Chinese ritual ambience, museum quality, widescreen 16:9, restrained cinematic lighting.",
    `Surface: ${bone}; subtle knife-work along edges; natural cracks from age separate from fresh pyromantic 兆.`,
    "Pyromancy evidence: paired circular/oval drill pits (鑽) where heat was applied; burnt halos; main divination cracks (兆) propagate upward from pits — not random scratches.",
    topology,
    `Background atmosphere (subtle, non-distracting): misty shanshui landscape, distant mountains, calm water, light incense haze; mood ${theme.mood}. Keep background soft and low-contrast so foreground symbol remains clear.`,
    "Lighting: soft dawn or dusk diffusion, gentle warm-cool balance, no harsh spotlight.",
    "Hard negative rules: no text, no letters, no numbers, no Chinese characters, no calligraphy, no logos, no watermark, no UI elements.",
    "Composition rule: keep center area visually calm and uncluttered for symbol overlay.",
  ].join(" ");
}
