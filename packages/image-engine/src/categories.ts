export type ConsultationCategory =
  | "love_relationship"
  | "career_work"
  | "health_wellbeing"
  | "spiritual_inner"
  | "family_home"
  | "decision_path"
  | "conflict_challenge"
  | "travel_change"
  | "general";

export const VISUAL_THEMES: Record<
  ConsultationCategory,
  {
    environment: string;
    mood: string;
    elements: string;
    colorPalette: string;
    timeOfDay: string;
  }
> = {
  love_relationship: {
    environment: "still lake or lagoon, soft mountains, reflective water",
    mood: "contemplative, tender, bittersweet",
    elements: "lotus or water lilies, willow branches, subtle firefly sparks",
    colorPalette: "rose-gold dawn or silver dusk — moonlit calm optional — deep indigo accents",
    timeOfDay: "dawn, dusk, or reflective calm (not only night)",
  },
  career_work: {
    environment: "imposing mountain peak above clouds, ascending stone path",
    mood: "determined, ambitious, focused",
    elements: "ancient pine on cliff, morning mist clearing, distant peaks",
    colorPalette: "golden dawn, dark stone, deep forest green",
    timeOfDay: "early dawn",
  },
  health_wellbeing: {
    environment: "fern forest with clear stream, filtered light",
    mood: "healing, peaceful, restorative",
    elements: "flowing water, smooth stones, wild orchids, morning dew",
    colorPalette: "jade green, soft white light, pale gold",
    timeOfDay: "morning",
  },
  spiritual_inner: {
    environment: "summit clarity — vast sky, forested slopes or quiet altitude air",
    mood: "transcendent, mysterious, profound",
    elements: "stone cairn, stars or bright zenith sun-shaft over ridges, summit wind mist",
    colorPalette: "deep cosmic blue, gold light, white smoke or sunlit mist",
    timeOfDay: "deep night or clear high-altitude day",
  },
  family_home: {
    environment: "meadow hedgerow or riverside belt — warmth and shelter suggested by trees and distance, not a walled patio",
    mood: "rooted, warm, protective",
    elements: "wind-sculpted trees, wildflowers, field stones, distant smoke — no patio furniture clusters",
    colorPalette: "warm amber, deep earth, soft green",
    timeOfDay: "golden hour",
  },
  decision_path: {
    environment: "mountain crossroads, two paths diverging into mist",
    mood: "contemplative, searching, uncertain",
    elements: "stone marker, lifting fog, eagle overhead",
    colorPalette: "silver gray mist, charcoal, glimpses of gold",
    timeOfDay: "early morning mist",
  },
  conflict_challenge: {
    environment: "stormy sea against ancient cliffs, lightning distant",
    mood: "intense, challenging, transformative",
    elements: "lone pine on cliff edge, turbulent waves, storm clouds parting",
    colorPalette: "dramatic dark gray, electric white, deep ocean blue",
    timeOfDay: "storm at dusk",
  },
  travel_change: {
    environment: "river winding through vast landscape toward horizon",
    mood: "expansive, transitional, anticipatory",
    elements: "boat on river, distant mountains, birds migrating",
    colorPalette: "wide sky blue, river silver, warm earth tones",
    timeOfDay: "midday open sky",
  },
  general: {
    environment: "layered ridges, river braid or lake/lagoon, forest pockets, varied sky and weather",
    mood: "timeless, balanced, mysterious",
    elements: "distant peaks, pine or rocks, sun shafts over water, forest light, soft clouds or dusk glow",
    colorPalette: "ink shadows, cool distance, warm sun accents — no flat ivory void",
    timeOfDay: "day or twilight",
  },
};
