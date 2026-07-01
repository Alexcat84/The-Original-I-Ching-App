import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";
import {
  ICHING_MUTATION_RULE_IDS,
  type IchingMutationRuleId,
} from "./iching-mutation-ui.js";

/**
 * One-line mutation rule summaries for consultation record + PDF (MUT-08 display split).
 *
 * NOT the full gold bookText — that lives in Explorer via `getMutationRuleBookText` +
 * `getMutationRuleTranslation`. Summaries are concise, localized, and faithful to the
 * selected line reading system (Huang vs Zhu Xi), not the oracle translator.
 *
 * Rule codes: Huang uses `NO_CHANGING`, `THREE_MIDDLE`, …; Zhu Xi uses `ZX_*` for
 * count-based rules. Qian/Kun all-changing share `QIAN_ALL_NINE` / `KUN_ALL_SIX` —
 * pass `system: "zhuxi"` to `getMutationRuleSummaryLabel` for Zhu Xi wording
 * (both judgments + 用九/用六) vs Huang (seventh yao / 用九/用六 only).
 */
/** One-line summary for consultation record / PDF — not the full gold bookText. */
type SummaryMap = Record<IchingMutationRuleId, string>;

const ES: SummaryMap = {
  NO_CHANGING: "Sin líneas mutantes: solo el dictamen del hexagrama primario.",
  ONE_CHANGING: "Una línea mutante: se lee esa línea y el hexagrama resultante.",
  TWO_YIN_YANG: "Dos líneas (yin y yang): se lee solo la yin.",
  TWO_SAME_LOWER: "Dos líneas del mismo tipo: se lee la inferior.",
  THREE_MIDDLE: "Tres líneas mutantes: se lee la del medio.",
  FOUR_LOWEST_STABLE: "Cuatro mutantes: se lee la estable superior del transformado.",
  FIVE_ONLY_STABLE: "Cinco mutantes: se lee la única estable del transformado.",
  SIX_ALL_CHANGING: "Seis mutantes: se lee el dictamen del transformado.",
  QIAN_ALL_NINE: "Seis mutantes en Qian: se lee 用九 (Todos los Nueves).",
  KUN_ALL_SIX: "Seis mutantes en Kun: se lee 用六 (Todos los Seises).",
  ZX_ZERO: "Sin mutaciones: dictamen del hexagrama primario.",
  ZX_ONE: "Una mutante: se lee el dictamen de esa línea.",
  ZX_TWO_UPPER: "Dos mutantes: se leen ambas; rige la superior.",
  ZX_THREE_JUDGMENTS: "Tres mutantes: dictámenes del primario y del transformado.",
  ZX_FOUR_LOWER: "Cuatro mutantes: las dos estables del transformado; rige la inferior.",
  ZX_FIVE_ONLY: "Cinco mutantes: se lee la única estable del transformado.",
  ZX_SIX_TRANSFORMED: "Seis mutantes: dictamen del hexagrama transformado.",
};

const EN: SummaryMap = {
  NO_CHANGING: "No moving lines: primary hexagram judgment only.",
  ONE_CHANGING: "One moving line: read that line and the resulting hexagram.",
  TWO_YIN_YANG: "Two lines (yin and yang): read the yin line only.",
  TWO_SAME_LOWER: "Two lines of the same type: read the lower one.",
  THREE_MIDDLE: "Three moving lines: read the middle one.",
  FOUR_LOWEST_STABLE: "Four moving lines: read the upper stable line of the transformed hexagram.",
  FIVE_ONLY_STABLE: "Five moving lines: read the only stable line of the transformed hexagram.",
  SIX_ALL_CHANGING: "All six lines moving: read the transformed hexagram judgment.",
  QIAN_ALL_NINE: "All six moving in Qian: read All Nines (用九).",
  KUN_ALL_SIX: "All six moving in Kun: read All Sixes (用六).",
  ZX_ZERO: "No changing lines: primary hexagram judgment.",
  ZX_ONE: "One changing line: read that line's statement.",
  ZX_TWO_UPPER: "Two changing lines: read both; the upper rules.",
  ZX_THREE_JUDGMENTS: "Three changing lines: judgments of primary and transformed hexagrams.",
  ZX_FOUR_LOWER: "Four changing lines: both stable lines of transformed hexagram; lower rules.",
  ZX_FIVE_ONLY: "Five changing lines: the only stable line of the transformed hexagram.",
  ZX_SIX_TRANSFORMED: "All six changing: transformed hexagram judgment.",
};

const PT: SummaryMap = {
  NO_CHANGING: "Sem linhas móveis: apenas o dictame do hexagrama primário.",
  ONE_CHANGING: "Uma linha móvel: lê-se essa linha e o hexagrama resultante.",
  TWO_YIN_YANG: "Duas linhas (yin e yang): lê-se apenas a yin.",
  TWO_SAME_LOWER: "Duas linhas do mesmo tipo: lê-se a inferior.",
  THREE_MIDDLE: "Três linhas móveis: lê-se a do meio.",
  FOUR_LOWEST_STABLE: "Quatro móveis: lê-se a estável superior do transformado.",
  FIVE_ONLY_STABLE: "Cinco móveis: lê-se a única estável do transformado.",
  SIX_ALL_CHANGING: "Seis móveis: lê-se o dictame do transformado.",
  QIAN_ALL_NINE: "Seis móveis em Qian: lê-se 用九 (Todos os Noves).",
  KUN_ALL_SIX: "Seis móveis em Kun: lê-se 用六 (Todos os Seises).",
  ZX_ZERO: "Sem mutações: dictame do hexagrama primário.",
  ZX_ONE: "Uma mutante: lê-se o dictame dessa linha.",
  ZX_TWO_UPPER: "Duas mutantes: lêem-se ambas; prevalece a superior.",
  ZX_THREE_JUDGMENTS: "Três mutantes: dictames do primário e do transformado.",
  ZX_FOUR_LOWER: "Quatro mutantes: as duas estáveis do transformado; prevalece a inferior.",
  ZX_FIVE_ONLY: "Cinco mutantes: lê-se a única estável do transformado.",
  ZX_SIX_TRANSFORMED: "Seis mutantes: dictame do hexagrama transformado.",
};

const FR: SummaryMap = {
  NO_CHANGING: "Aucune ligne mobile : jugement de l'hexagramme primaire seulement.",
  ONE_CHANGING: "Une ligne mobile : lire cette ligne et l'hexagramme résultant.",
  TWO_YIN_YANG: "Deux lignes (yin et yang) : lire la yin seulement.",
  TWO_SAME_LOWER: "Deux lignes du même type : lire l'inférieure.",
  THREE_MIDDLE: "Trois lignes mobiles : lire celle du milieu.",
  FOUR_LOWEST_STABLE: "Quatre mobiles : lire la stable supérieure de l'hexagramme transformé.",
  FIVE_ONLY_STABLE: "Cinq mobiles : lire l'unique stable de l'hexagramme transformé.",
  SIX_ALL_CHANGING: "Six mobiles : jugement de l'hexagramme transformé.",
  QIAN_ALL_NINE: "Six mobiles en Qian : lire Tous les Neuf (用九).",
  KUN_ALL_SIX: "Six mobiles en Kun : lire Tous les Six (用六).",
  ZX_ZERO: "Sans mutation : jugement de l'hexagramme primaire.",
  ZX_ONE: "Une mutante : lire l'énoncé de cette ligne.",
  ZX_TWO_UPPER: "Deux mutantes : lire les deux ; la supérieure domine.",
  ZX_THREE_JUDGMENTS: "Trois mutantes : jugements du primaire et du transformé.",
  ZX_FOUR_LOWER: "Quatre mutantes : les deux stables du transformé ; l'inférieure domine.",
  ZX_FIVE_ONLY: "Cinq mutantes : l'unique stable du transformé.",
  ZX_SIX_TRANSFORMED: "Six mutantes : jugement de l'hexagramme transformé.",
};

const DE: SummaryMap = {
  NO_CHANGING: "Keine wandelnden Linien: nur das Urteil des Primärhexagramms.",
  ONE_CHANGING: "Eine wandelnde Linie: diese Linie und das resultierende Hexagramm lesen.",
  TWO_YIN_YANG: "Zwei Linien (Yin und Yang): nur die Yin-Linie lesen.",
  TWO_SAME_LOWER: "Zwei Linien gleichen Typs: die untere lesen.",
  THREE_MIDDLE: "Drei wandelnde Linien: die mittlere lesen.",
  FOUR_LOWEST_STABLE: "Vier wandelnd: die obere stabile Linie des Transformierten lesen.",
  FIVE_ONLY_STABLE: "Fünf wandelnd: die einzige stabile Linie des Transformierten lesen.",
  SIX_ALL_CHANGING: "Alle sechs wandelnd: Urteil des Transformierten lesen.",
  QIAN_ALL_NINE: "Alle sechs in Qian: Alle Neun (用九) lesen.",
  KUN_ALL_SIX: "Alle sechs in Kun: Alle Sechs (用六) lesen.",
  ZX_ZERO: "Keine Mutation: Urteil des Primärhexagramms.",
  ZX_ONE: "Eine Mutante: Aussage dieser Linie lesen.",
  ZX_TWO_UPPER: "Zwei Mutante: beide lesen; die obere führt.",
  ZX_THREE_JUDGMENTS: "Drei Mutante: Urteile von Primär- und Transformiertem.",
  ZX_FOUR_LOWER: "Vier Mutante: beide stabilen des Transformierten; untere führt.",
  ZX_FIVE_ONLY: "Fünf Mutante: einzige stabile Linie des Transformierten.",
  ZX_SIX_TRANSFORMED: "Sechs Mutante: Urteil des Transformierten.",
};

const IT: SummaryMap = {
  NO_CHANGING: "Nessuna linea mutante: solo il giudizio dell'esagramma primario.",
  ONE_CHANGING: "Una linea mutante: si legge quella linea e l'esagramma risultante.",
  TWO_YIN_YANG: "Due linee (yin e yang): si legge solo la yin.",
  TWO_SAME_LOWER: "Due linee dello stesso tipo: si legge l'inferiore.",
  THREE_MIDDLE: "Tre linee mutanti: si legge quella centrale.",
  FOUR_LOWEST_STABLE: "Quattro mutanti: si legge la stabile superiore del transformato.",
  FIVE_ONLY_STABLE: "Cinque mutanti: si legge l'unica stabile del transformato.",
  SIX_ALL_CHANGING: "Sei mutanti: giudizio dell'esagramma trasformato.",
  QIAN_ALL_NINE: "Sei mutanti in Qian: si legge Tutti i Nove (用九).",
  KUN_ALL_SIX: "Sei mutanti in Kun: si legge Tutti i Sei (用六).",
  ZX_ZERO: "Senza mutazioni: giudizio dell'esagramma primario.",
  ZX_ONE: "Una mutante: si legge l'enunciato di quella linea.",
  ZX_TWO_UPPER: "Due mutanti: si leggono entrambe; prevale la superiore.",
  ZX_THREE_JUDGMENTS: "Tre mutanti: giudizi del primario e del trasformato.",
  ZX_FOUR_LOWER: "Quattro mutanti: entrambe le stabili del trasformato; prevale l'inferiore.",
  ZX_FIVE_ONLY: "Cinque mutanti: l'unica stabile del trasformato.",
  ZX_SIX_TRANSFORMED: "Sei mutanti: giudizio dell'esagramma trasformato.",
};

const JA: SummaryMap = {
  NO_CHANGING: "変爻なし：本卦の判辞のみ。",
  ONE_CHANGING: "変爻1本：その爻と之卦を読む。",
  TWO_YIN_YANG: "2本（陰と陽）：陰の爻のみ読む。",
  TWO_SAME_LOWER: "同型2本：下の爻を読む。",
  THREE_MIDDLE: "変爻3本：中央の爻を読む。",
  FOUR_LOWEST_STABLE: "4本変化：変卦の上の不変爻を読む。",
  FIVE_ONLY_STABLE: "5本変化：変卦の唯一の不変爻を読む。",
  SIX_ALL_CHANGING: "6本すべて変化：変卦の判辞を読む。",
  QIAN_ALL_NINE: "乾で6本変化：用九を読む。",
  KUN_ALL_SIX: "坤で6本変化：用六を読む。",
  ZX_ZERO: "変爻なし：本卦の判辞。",
  ZX_ONE: "1本変化：その爻辞を読む。",
  ZX_TWO_UPPER: "2本変化：両方読む；上が主。",
  ZX_THREE_JUDGMENTS: "3本変化：本卦と変卦の彖辞。",
  ZX_FOUR_LOWER: "4本変化：変卦の2不変爻；下が主。",
  ZX_FIVE_ONLY: "5本変化：変卦の不変爻。",
  ZX_SIX_TRANSFORMED: "6本変化：変卦の判辞。",
};

const ZH: SummaryMap = {
  NO_CHANGING: "无变爻：仅读本卦卦辞。",
  ONE_CHANGING: "一变爻：读该爻与之卦。",
  TWO_YIN_YANG: "两爻（阴阳）：只读阴爻。",
  TWO_SAME_LOWER: "两爻同型：读下爻。",
  THREE_MIDDLE: "三变爻：读中间一爻。",
  FOUR_LOWEST_STABLE: "四变爻：读变卦上不变爻。",
  FIVE_ONLY_STABLE: "五变爻：读变卦唯一不变爻。",
  SIX_ALL_CHANGING: "六爻皆变：读变卦卦辞。",
  QIAN_ALL_NINE: "乾六爻皆变：读用九。",
  KUN_ALL_SIX: "坤六爻皆变：读用六。",
  ZX_ZERO: "无变爻：读本卦卦辞。",
  ZX_ONE: "一变：读该爻辞。",
  ZX_TWO_UPPER: "两变：皆读；以上为主。",
  ZX_THREE_JUDGMENTS: "三变：本卦与变卦彖辞。",
  ZX_FOUR_LOWER: "四变：变卦两不变爻；以下为主。",
  ZX_FIVE_ONLY: "五变：变卦不变爻。",
  ZX_SIX_TRANSFORMED: "六变：变卦卦辞。",
};

const KO: SummaryMap = {
  NO_CHANGING: "변효 없음: 본괘 판사만.",
  ONE_CHANGING: "변효 1획: 그 효와 지괘.",
  TWO_YIN_YANG: "2획(음·양): 음 효만.",
  TWO_SAME_LOWER: "같은 유형 2획: 아래 효.",
  THREE_MIDDLE: "변효 3획: 가운데 효.",
  FOUR_LOWEST_STABLE: "4획 변화: 변괘 위 불변효.",
  FIVE_ONLY_STABLE: "5획 변화: 변괘 유일 불변효.",
  SIX_ALL_CHANGING: "6획 모두 변화: 변괘 판사.",
  QIAN_ALL_NINE: "건 6획 변화: 용구.",
  KUN_ALL_SIX: "곤 6획 변화: 용육.",
  ZX_ZERO: "변효 없음: 본괘 판사.",
  ZX_ONE: "1획 변화: 그 효사.",
  ZX_TWO_UPPER: "2획 변화: 둘 다; 위 효가 주.",
  ZX_THREE_JUDGMENTS: "3획 변화: 본괘·변괘 단사.",
  ZX_FOUR_LOWER: "4획 변화: 변괘 두 불변효; 아래가 주.",
  ZX_FIVE_ONLY: "5획 변화: 변괘 불변효.",
  ZX_SIX_TRANSFORMED: "6획 변화: 변괘 판사.",
};

const AR: SummaryMap = {
  NO_CHANGING: "لا خطوط متحركة: حكم السداسي الأصلي فقط.",
  ONE_CHANGING: "خط متحرك واحد: يُقرأ ذلك الخط والسداسي الناتج.",
  TWO_YIN_YANG: "خطان (yin وyang): يُقرأ yin فقط.",
  TWO_SAME_LOWER: "خطان من النوع نفسه: يُقرأ السفلي.",
  THREE_MIDDLE: "ثلاثة خطوط متحركة: يُقرأ الأوسط.",
  FOUR_LOWEST_STABLE: "أربعة متحركة: الخط الثابت العلوي للسداسي الناتج.",
  FIVE_ONLY_STABLE: "خمسة متحركة: الخط الثابت الوحيد للسداسي الناتج.",
  SIX_ALL_CHANGING: "الستة متحركة: حكم السداسي الناتج.",
  QIAN_ALL_NINE: "ستة في Qian: 用九 (All Nines).",
  KUN_ALL_SIX: "ستة في Kun: 用六 (All Sixes).",
  ZX_ZERO: "بلا تغيير: حكم السداسي الأصلي.",
  ZX_ONE: "خط واحد يتغير: بيان ذلك الخط.",
  ZX_TWO_UPPER: "خطان يتغيران: كلاهما؛ العلوي هو الأساس.",
  ZX_THREE_JUDGMENTS: "ثلاثة يتغيرون: حكما الأصلي والناتج.",
  ZX_FOUR_LOWER: "أربعة يتغيرون: الثابتان في الناتج؛ السفلي أساس.",
  ZX_FIVE_ONLY: "خمسة يتغيرون: الخط الثابت الوحيد في الناتج.",
  ZX_SIX_TRANSFORMED: "ستة يتغيرون: حكم السداسي الناتج.",
};

const HI: SummaryMap = {
  NO_CHANGING: "कोई चल रेखा नहीं: केवल प्राथमिक हेक्साग्राम का निर्णय.",
  ONE_CHANGING: "एक चल रेखा: वह रेखा और परिणामी हेक्साग्राम पढ़ें.",
  TWO_YIN_YANG: "दो रेखाएं (yin और yang): केवल yin पढ़ें.",
  TWO_SAME_LOWER: "समान प्रकार की दो रेखाएं: निचली पढ़ें.",
  THREE_MIDDLE: "तीन चल रेखाएं: बीच वाली पढ़ें.",
  FOUR_LOWEST_STABLE: "चार चल रही: परिणामी की ऊपरी स्थिर रेखा.",
  FIVE_ONLY_STABLE: "पांच चल रही: परिणामी की एकमात्र स्थिर रेखा.",
  SIX_ALL_CHANGING: "सभी छह चल रही: परिणामी का निर्णय.",
  QIAN_ALL_NINE: "Qian में सभी छह: 用九 (All Nines).",
  KUN_ALL_SIX: "Kun में सभी छह: 用六 (All Sixes).",
  ZX_ZERO: "कोई परिवर्तन नहीं: प्राथमिक का निर्णय.",
  ZX_ONE: "एक परिवर्तन: उस रेखा का कथन.",
  ZX_TWO_UPPER: "दो परिवर्तन: दोनों; ऊपरी प्रमुख.",
  ZX_THREE_JUDGMENTS: "तीन परिवर्तन: प्राथमिक और परिणामी के निर्णय.",
  ZX_FOUR_LOWER: "चार परिवर्तन: परिणामी की दो स्थिर; निचली प्रमुख.",
  ZX_FIVE_ONLY: "पांच परिवर्तन: परिणामी की स्थिर रेखा.",
  ZX_SIX_TRANSFORMED: "छह परिवर्तन: परिणामी का निर्णय.",
};

const BY_LOCALE: Record<AppLocale, SummaryMap> = {
  es: ES,
  en: EN,
  pt: PT,
  fr: FR,
  de: DE,
  it: IT,
  ja: JA,
  zh: ZH,
  ko: KO,
  ar: AR,
  hi: HI,
};

/** Shared Qian/Kun codes — Zhu Xi reads both judgments plus 用九/用六 (Adler p.48). */
type QianKunSummaryMap = Pick<SummaryMap, "QIAN_ALL_NINE" | "KUN_ALL_SIX">;

const QIAN_KUN_ZHUXI_ES: QianKunSummaryMap = {
  QIAN_ALL_NINE: "Seis mutantes en Qian: ambos dictámenes y 用九 (Todos los Nueves).",
  KUN_ALL_SIX: "Seis mutantes en Kun: ambos dictámenes y 用六 (Todos los Seises).",
};

const QIAN_KUN_ZHUXI_EN: QianKunSummaryMap = {
  QIAN_ALL_NINE: "All six moving in Qian: read both judgments and All Nines (用九).",
  KUN_ALL_SIX: "All six moving in Kun: read both judgments and All Sixes (用六).",
};

const QIAN_KUN_ZHUXI_PT: QianKunSummaryMap = {
  QIAN_ALL_NINE: "Seis móveis em Qian: ambos dictames e 用九 (Todos os Noves).",
  KUN_ALL_SIX: "Seis móveis em Kun: ambos dictames e 用六 (Todos os Seises).",
};

const QIAN_KUN_ZHUXI_FR: QianKunSummaryMap = {
  QIAN_ALL_NINE: "Six mobiles en Qian : les deux jugements et Tous les Neuf (用九).",
  KUN_ALL_SIX: "Six mobiles en Kun : les deux jugements et Tous les Six (用六).",
};

const QIAN_KUN_ZHUXI_DE: QianKunSummaryMap = {
  QIAN_ALL_NINE: "Alle sechs in Qian: beide Urteile und Alle Neun (用九).",
  KUN_ALL_SIX: "Alle sechs in Kun: beide Urteile und Alle Sechs (用六).",
};

const QIAN_KUN_ZHUXI_IT: QianKunSummaryMap = {
  QIAN_ALL_NINE: "Sei mutanti in Qian: entrambi i giudizi e Tutti i Nove (用九).",
  KUN_ALL_SIX: "Sei mutanti in Kun: entrambi i giudizi e Tutti i Sei (用六).",
};

const QIAN_KUN_ZHUXI_JA: QianKunSummaryMap = {
  QIAN_ALL_NINE: "乾で6本変化：両卦の彖辞と用九。",
  KUN_ALL_SIX: "坤で6本変化：両卦の彖辞と用六。",
};

const QIAN_KUN_ZHUXI_ZH: QianKunSummaryMap = {
  QIAN_ALL_NINE: "乾六爻皆变：读本卦与变卦卦辞及用九。",
  KUN_ALL_SIX: "坤六爻皆变：读本卦与变卦卦辞及用六。",
};

const QIAN_KUN_ZHUXI_KO: QianKunSummaryMap = {
  QIAN_ALL_NINE: "건 6획 변화: 본괘·변괘 판사와 용구.",
  KUN_ALL_SIX: "곤 6획 변화: 본괘·변괘 판사와 용육.",
};

const QIAN_KUN_ZHUXI_AR: QianKunSummaryMap = {
  QIAN_ALL_NINE: "ستة في Qian: حكما الأصلي والناتج و用九.",
  KUN_ALL_SIX: "ستة في Kun: حكما الأصلي والناتج و用六.",
};

const QIAN_KUN_ZHUXI_HI: QianKunSummaryMap = {
  QIAN_ALL_NINE: "Qian में सभी छह: दोनों निर्णय और 用九.",
  KUN_ALL_SIX: "Kun में सभी छह: दोनों निर्णय और 用六.",
};

const QIAN_KUN_ZHUXI_BY_LOCALE: Record<AppLocale, QianKunSummaryMap> = {
  es: QIAN_KUN_ZHUXI_ES,
  en: QIAN_KUN_ZHUXI_EN,
  pt: QIAN_KUN_ZHUXI_PT,
  fr: QIAN_KUN_ZHUXI_FR,
  de: QIAN_KUN_ZHUXI_DE,
  it: QIAN_KUN_ZHUXI_IT,
  ja: QIAN_KUN_ZHUXI_JA,
  zh: QIAN_KUN_ZHUXI_ZH,
  ko: QIAN_KUN_ZHUXI_KO,
  ar: QIAN_KUN_ZHUXI_AR,
  hi: QIAN_KUN_ZHUXI_HI,
};

export type MutationRuleSummarySystem = "huang" | "zhuxi";

function isQianKunSharedRule(rule: string): rule is keyof QianKunSummaryMap {
  return rule === "QIAN_ALL_NINE" || rule === "KUN_ALL_SIX";
}

/** Short one-line label for consultation summary and PDF export. */
export function getMutationRuleSummaryLabel(
  locale: AppLocale,
  rule: string,
  system: MutationRuleSummarySystem = "huang",
): string {
  if (system === "zhuxi" && isQianKunSharedRule(rule)) {
    const zxMap =
      QIAN_KUN_ZHUXI_BY_LOCALE[locale] ?? QIAN_KUN_ZHUXI_BY_LOCALE[DEFAULT_LOCALE];
    return zxMap[rule];
  }
  const map = BY_LOCALE[locale] ?? BY_LOCALE[DEFAULT_LOCALE];
  if (rule in map) return map[rule as IchingMutationRuleId];
  return rule;
}

export { ICHING_MUTATION_RULE_IDS };
