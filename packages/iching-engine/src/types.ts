export type LineValue = 6 | 7 | 8 | 9;

export type LineType = "yin_old" | "yang_young" | "yin_young" | "yang_old";

export type CastingMethod = "three-coins" | "yarrow-stalks";

export type CastingMode = "auto" | "manual";

export type MutationRule =
  | "NO_CHANGING"
  | "ONE_CHANGING"
  | "TWO_YIN_YANG"
  | "TWO_SAME_LOWER"
  | "THREE_MIDDLE"
  | "FOUR_LOWEST_STABLE"
  | "FIVE_ONLY_STABLE"
  | "SIX_ALL_CHANGING"
  | "QIAN_ALL_NINE"
  | "KUN_ALL_SIX";

export interface Line {
  position: 1 | 2 | 3 | 4 | 5 | 6;
  value: LineValue;
  type: LineType;
  isChanging: boolean;
  symbol: string;
}

export interface Hexagram {
  number: number;
  name: string;
  chineseName: string;
  pinyin: string;
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string;
  image: string;
  lines: HexagramLine[];
  yongJiu?: string;
  yongLiu?: string;
}

export interface HexagramLine {
  position: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  type: "yin" | "yang";
}

/**
 * Interpretation mode for the AI oracle.
 */
export type InterpretationMode = "wilhelm" | "legge" | "zhouyi" | "master_combined";

export const DEFAULT_INTERPRETATION_MODE: InterpretationMode = "wilhelm";

export interface TextsForClaude {
  primaryJudgment: string;
  primaryImage: string;
  selectedLineTexts: Array<{
    position: number;
    text: string;
    fromHexagram: "primary" | "transformed";
  }>;
  transformedJudgment: string | null;
  transformedImage: string | null;
  specialYaoText: string | null;
  ruleExplanation: string;
  /** Textos para la versión Legge (sólo si el modo es master_combined) */
  leggeJudgment?: string;
  leggeImage?: string;
  leggeSelectedLineTexts?: Array<{ position: number; text: string; fromHexagram: "primary" | "transformed" }>;
  /** Textos para la versión Zhou Yi (sólo si el modo es master_combined) */
  zhouyiJudgment?: string;
  zhouyiImage?: string;
  zhouyiSelectedLineTexts?: Array<{ position: number; text: string; fromHexagram: "primary" | "transformed" }>;
}

export interface CastResult {
  id: string;
  question: string;
  language: string;
  lines: Line[];
  primaryHexagram: Hexagram;
  transformedHexagram: Hexagram | null;
  changingLines: number[];
  mutationRule: MutationRule;
  textsForClaude: TextsForClaude;
  timestamp: Date;
  castingMethod?: CastingMethod;
}
