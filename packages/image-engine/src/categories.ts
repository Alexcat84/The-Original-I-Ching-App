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
    environment: "serene lake reflecting moonlight, misty mountains",
    mood: "contemplative, tender, bittersweet",
    elements: "lotus flower on still water, willow branches, two distant fireflies",
    colorPalette: "silver moonlight, deep indigo, soft rose mist",
    timeOfDay: "full moon night",
  },
  career_work: {
    environment: "imposing mountain peak above clouds, ascending stone path",
    mood: "determined, ambitious, focused",
    elements: "ancient pine on cliff, morning mist clearing, distant peaks",
    colorPalette: "golden dawn, dark stone, deep forest green",
    timeOfDay: "early dawn",
  },
  health_wellbeing: {
    environment: "bamboo forest with clear stream, filtered light",
    mood: "healing, peaceful, restorative",
    elements: "flowing water, smooth stones, wild orchids, morning dew",
    colorPalette: "jade green, soft white light, pale gold",
    timeOfDay: "morning",
  },
  spiritual_inner: {
    environment: "ancient mountain temple at summit, vast cosmic sky",
    mood: "transcendent, mysterious, profound",
    elements: "incense smoke spiraling, stone lantern, full moon, stars",
    colorPalette: "deep cosmic blue, gold starlight, white smoke",
    timeOfDay: "deep night",
  },
  family_home: {
    environment: "ancient courtyard garden, protected walls, old tree",
    mood: "rooted, warm, protective",
    elements: "gnarled tree with spreading branches, chrysanthemums, stone bench",
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
    environment: "layered mountain ridges, river or lake, mist between peaks, dramatic sky",
    mood: "timeless, balanced, mysterious",
    elements: "distant peaks, foreground pine or rocks, reflective water, soft clouds or moon glow",
    colorPalette: "deep ink shadows, cool mist grays, blue-gray distance, subtle warm light on horizon — avoid flat blank ivory filling most of the frame",
    timeOfDay: "timeless",
  },
};
