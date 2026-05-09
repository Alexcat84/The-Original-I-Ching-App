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
 * Interpretation mode for the AI oracle. PR1 ships only "wilhelm" wired to the
 * Claude prompt; the other modes are reserved for PR2 and currently rejected
 * by `assertSupportedInterpretationMode`.
 */
export type InterpretationMode = "wilhelm" | "legge" | "zhouyi" | "synthetic";

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
  /**
   * Reserved for PR2 (Legge mode). Engine does NOT populate this in PR1; the
   * field exists so backend/claude can be extended without another type churn.
   */
  leggeJudgment?: string;
  /** Reserved for PR2 (Legge mode). Inert in PR1. */
  leggeImage?: string;
  /** Reserved for PR2 (Zhou Yi mode). Inert in PR1. */
  zhouyiJudgment?: string;
  /** Reserved for PR2 (Zhou Yi mode). Inert in PR1. */
  zhouyiImage?: string;
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
