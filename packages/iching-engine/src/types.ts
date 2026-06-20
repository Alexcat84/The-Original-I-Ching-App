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

/**
 * Changing-line reading systems the user can choose between.
 * "huang"  = Alfred Huang's single-line reduction (default; reads fewer lines).
 * "zhuxi"  = Zhu Xi's classical system (may read two lines or both judgments).
 */
export type LineReadingSystem = "huang" | "zhuxi";
export const DEFAULT_LINE_READING_SYSTEM: LineReadingSystem = "huang";

/** Zhu Xi rule taxonomy (distinct names from Huang's — no collision in persistence). */
export type ZhuXiMutationRule =
  | "ZX_ZERO"
  | "ZX_ONE"
  | "ZX_TWO_UPPER"
  | "ZX_THREE_JUDGMENTS"
  | "ZX_FOUR_LOWER"
  | "ZX_FIVE_ONLY"
  | "ZX_SIX_TRANSFORMED"
  | "QIAN_ALL_NINE"
  | "KUN_ALL_SIX";

/** Any rule constant that may be persisted / validated, across both systems. */
export type AnyMutationRule = MutationRule | ZhuXiMutationRule;

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

export interface SelectedLineEntry {
  position: number;
  text: string;
  fromHexagram: "primary" | "transformed";
  /** Zhu Xi multi-text cases: which line leads (2-line = upper, 4-line = lower). */
  emphasis?: "primary" | "secondary";
}

export interface TextsForClaude {
  primaryJudgment: string;
  primaryImage: string;
  selectedLineTexts: SelectedLineEntry[];
  transformedJudgment: string | null;
  transformedImage: string | null;
  specialYaoText: string | null;
  ruleExplanation: string;
  /** Zhu Xi 3-changing case: both judgments are read; which one leads. */
  judgmentEmphasis?: "primary" | "transformed" | null;
  /** Textos para la versión Legge (sólo si el modo es master_combined) */
  leggeJudgment?: string;
  leggeImage?: string;
  leggeTransformedJudgment?: string | null;
  leggeTransformedImage?: string | null;
  leggeSelectedLineTexts?: SelectedLineEntry[];
  leggeSpecialYaoText?: string | null;
  /** Textos para la versión Zhou Yi (sólo si el modo es master_combined) */
  zhouyiJudgment?: string;
  zhouyiImage?: string;
  zhouyiTransformedJudgment?: string | null;
  zhouyiTransformedImage?: string | null;
  zhouyiSelectedLineTexts?: SelectedLineEntry[];
  zhouyiSpecialYaoText?: string | null;
}

export interface CastResult {
  id: string;
  question: string;
  language: string;
  interpretationMode: InterpretationMode;
  lineReadingSystem?: LineReadingSystem;
  lines: Line[];
  primaryHexagram: Hexagram;
  transformedHexagram: Hexagram | null;
  changingLines: number[];
  mutationRule: AnyMutationRule;
  textsForClaude: TextsForClaude;
  timestamp: Date;
  castingMethod?: CastingMethod;
}
