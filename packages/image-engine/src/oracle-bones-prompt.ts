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
  consultationId?: string;
}): string {
  const theme = VISUAL_THEMES[params.category] ?? VISUAL_THEMES.general;
  const seed = `${params.consultationId ?? ""}:${params.category}:${params.medium}:${params.patternId}:${params.verdictLabel}`;
  const h = hashToUint(seed);
  const sceneIdx = (h ^ (h >>> 11)) % ORACLE_SCENE_FAMILIES.length;
  const lightIdx = ((h >>> 7) ^ (h >>> 19)) % ORACLE_LIGHTING_VARIANTS.length;
  const compIdx = ((h >>> 14) ^ (h >>> 5)) % ORACLE_COMPOSITION_VARIANTS.length;

  const topology = describeOracleBoneCrackTopology(params.patternId);
  const mediumMood =
    params.medium === "turtle"
      ? "Subtle cool-aqua serenity influence"
      : "Subtle warm-earth gravitas influence";

  return [
    "Nature-only fantasy landscape illustration, widescreen 16:9, no ritual object closeups.",
    ORACLE_SCENE_FAMILIES[sceneIdx],
    ORACLE_LIGHTING_VARIANTS[lightIdx],
    ORACLE_COMPOSITION_VARIANTS[compIdx],
    `Atmospheric mood: ${theme.mood}. ${mediumMood}.`,
    `Pattern energy reference: ${topology}. Translate this into terrain rhythm and light tension, not literal bone object depiction.`,
    "Keep landscapes varied across generations: avoid repeating same moon-lake framing.",
    "Hard negative rules: no text, no letters, no numbers, no Chinese characters, no calligraphy, no logos, no watermark, no UI elements.",
    "Composition rule: keep center area visually calm and uncluttered for symbol overlay.",
  ].join(" ");
}

function hashToUint(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const ORACLE_SCENE_FAMILIES = [
  "Scene family: misty river basin with layered conifer ridges and soft dawn horizon.",
  "Scene family: coastal pine cliffs above calm sea haze and receding headlands.",
  "Scene family: forest ravine with stream cascades, moss, and filtered emerald light.",
  "Scene family: high plateau grassland with distant ridgelines and open cloud deck.",
  "Scene family: autumn valley with warm foliage accents and reflective river bend.",
  "Scene family: winter mountain pass with sparse pines and pale high-key sky.",
  "Scene family: canyon corridor with braided water and stratified stone walls.",
  "Scene family: wetland mirror plain with reeds and atmospheric pastel gradients.",
  "Scene family: bamboo gorge with cool humidity and luminous fog pockets.",
  "Scene family: volcanic dark-rock valley with bright atmospheric openings.",
] as const;

const ORACLE_LIGHTING_VARIANTS = [
  "Lighting: soft sunrise diffusion with warm horizon and cool mid-ground.",
  "Lighting: overcast silver light, low contrast, poetic calm readability.",
  "Lighting: golden-hour side light with gentle long shadows.",
  "Lighting: post-rain clarity with subtle reflective highlights.",
  "Lighting: mist-filtered twilight glow, no harsh spotlight.",
  "Lighting: crisp midday atmosphere with balanced painterly saturation.",
] as const;

const ORACLE_COMPOSITION_VARIANTS = [
  "Composition: panoramic horizontal layers with open middle atmosphere.",
  "Composition: diagonal terrain flow leading to distant luminous gap.",
  "Composition: foreground water band and distant mountain silhouettes.",
  "Composition: asymmetrical cliff mass balanced by open sky third.",
  "Composition: forest frame opening toward reflective valley center.",
  "Composition: stepped terrain rhythm guiding eye toward horizon line.",
] as const;
