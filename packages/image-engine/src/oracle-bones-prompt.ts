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
    default:
      return (
        "Crack system 兆 type D (inauspicious clear): vertical main 兆 from pit, then bifurcation ('Y') toward lower field; " +
        "one branch longer — emphatic divergence, deep carved channels."
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
  const elementIdx = ((h >>> 3) ^ (h >>> 21)) % ORACLE_ELEMENT_ACCENTS.length;
  const paletteIdx = ((h >>> 17) ^ (h >>> 9)) % ORACLE_PALETTE_ACCENTS.length;

  const topology = describeOracleBoneCrackTopology(params.patternId);
  const mediumMood =
    params.medium === "turtle"
      ? "Cool-aqua serenity influence — jade, teal, and silver tones welcome"
      : "Warm-earth gravitas influence — ochre, sienna, and bronze tones welcome";

  return [
    "Nature-only fantasy landscape illustration, widescreen 16:9, no ritual object closeups.",
    ORACLE_SCENE_FAMILIES[sceneIdx],
    ORACLE_LIGHTING_VARIANTS[lightIdx],
    ORACLE_COMPOSITION_VARIANTS[compIdx],
    ORACLE_ELEMENT_ACCENTS[elementIdx],
    ORACLE_PALETTE_ACCENTS[paletteIdx],
    `Atmospheric mood: ${theme.mood}. ${mediumMood}.`,
    `Pattern energy reference: ${topology}. Translate this into terrain rhythm and light tension, not literal bone object depiction.`,
    "Scene surfaces: pristine natural terrain throughout, clean and unmarked. Purely natural elements from edge to edge.",
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
  "Scene family: narrow river gorge with mossy walls, cascades, and luminous fog pockets.",
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
  "Composition: aerial view of river bend, gravel bars, forested banks.",
  "Composition: gorge slice with steep walls and narrow bright sky strip.",
] as const;

const ORACLE_ELEMENT_ACCENTS = [
  "Foreground accent: ancient mossy stone at forest edge, mist-wrapped and still.",
  "Foreground accent: dark basalt outcrop at river bend, smooth water rushing past.",
  "Foreground accent: solitary pine on cliff ledge, roots gripping ancient rock.",
  "Foreground accent: fern fringe at stream edge, pale light filtering through fronds.",
  "Foreground accent: wind-shaped boulder field, lichen-covered, open sky above.",
  "Foreground accent: reed beds at lake margin, still water reflecting pale sky.",
  "Foreground accent: twisted driftwood on pebbled shore, fog behind, water ahead.",
  "Foreground accent: fallen ancient tree bridging narrow gorge, ferns, deep shadow.",
  "Foreground accent: granite slab at cliff top, wind-bent shrubs, valley far below.",
  "Foreground accent: tidal rocks at coast, kelp fringe, sea spray, layered headlands.",
] as const;

const ORACLE_PALETTE_ACCENTS = [
  "Palette: deep indigo and teal shadows, pale horizon glow, silver water.",
  "Palette: warm amber and ochre earth tones, cool violet far distance.",
  "Palette: silver-gray mist with dark pine silhouette and pale ice sky.",
  "Palette: jade green and mist white, dark rock anchors, soft light.",
  "Palette: golden hour warmth over cold blue-gray canyon depths.",
  "Palette: moonlit pale luminosity, near-black terrain silhouettes, silver water.",
  "Palette: storm iron-gray with bright silver light breaking through cloud.",
  "Palette: earth sienna and ochre foreground, pale sky, bright water gleam.",
  "Palette: cool dawn pink and lavender cloud base, dark ridges, silver river.",
  "Palette: deep forest green, charcoal shadow, warm amber sun shaft.",
] as const;
