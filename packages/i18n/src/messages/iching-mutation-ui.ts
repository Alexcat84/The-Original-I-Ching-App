import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export const ICHING_MUTATION_RULE_IDS = [
  "NO_CHANGING",
  "ONE_CHANGING",
  "TWO_YIN_YANG",
  "TWO_SAME_LOWER",
  "THREE_MIDDLE",
  "FOUR_LOWEST_STABLE",
  "FIVE_ONLY_STABLE",
  "SIX_ALL_CHANGING",
  "QIAN_ALL_NINE",
  "KUN_ALL_SIX",
] as const;

export type IchingMutationRuleId = (typeof ICHING_MUTATION_RULE_IDS)[number];

type RuleMap = Record<IchingMutationRuleId, string>;

const ES: RuleMap = {
  NO_CHANGING: "Sin líneas mutantes",
  ONE_CHANGING: "Una línea en mutación",
  TWO_YIN_YANG: "Dos líneas: yin y yang en cambio",
  TWO_SAME_LOWER: "Dos líneas mutantes (trigrama inferior)",
  THREE_MIDDLE: "Tres líneas centrales en juego",
  FOUR_LOWEST_STABLE: "Cuatro líneas: la inferior estable",
  FIVE_ONLY_STABLE: "Cinco mutando; una estable",
  SIX_ALL_CHANGING: "Las seis líneas mutan",
  QIAN_ALL_NINE: "Qian: nueve al novenario",
  KUN_ALL_SIX: "Kun: seis al senario",
};

const EN: RuleMap = {
  NO_CHANGING: "No changing lines",
  ONE_CHANGING: "One changing line",
  TWO_YIN_YANG: "Two lines: yin and yang changing",
  TWO_SAME_LOWER: "Two changing lines (lower trigram)",
  THREE_MIDDLE: "Three middle lines in play",
  FOUR_LOWEST_STABLE: "Four lines: lowest remains stable",
  FIVE_ONLY_STABLE: "Five changing; one stable",
  SIX_ALL_CHANGING: "All six lines change",
  QIAN_ALL_NINE: "Qian: all nines",
  KUN_ALL_SIX: "Kun: all sixes",
};

const PT: RuleMap = {
  NO_CHANGING: "Sem linhas mutantes",
  ONE_CHANGING: "Uma linha em mutação",
  TWO_YIN_YANG: "Duas linhas: yin e yang a mudar",
  TWO_SAME_LOWER: "Duas linhas mutantes (trigrama inferior)",
  THREE_MIDDLE: "Três linhas centrais em jogo",
  FOUR_LOWEST_STABLE: "Quatro linhas: a inferior estável",
  FIVE_ONLY_STABLE: "Cinco a mutar; uma estável",
  SIX_ALL_CHANGING: "As seis linhas mudam",
  QIAN_ALL_NINE: "Qian: todos noves",
  KUN_ALL_SIX: "Kun: todos seis",
};

const FR: RuleMap = {
  NO_CHANGING: "Aucune ligne mobile",
  ONE_CHANGING: "Une ligne mobile",
  TWO_YIN_YANG: "Deux lignes : yin et yang en changement",
  TWO_SAME_LOWER: "Deux lignes mobiles (trigramme inférieur)",
  THREE_MIDDLE: "Trois lignes centrales en jeu",
  FOUR_LOWEST_STABLE: "Quatre lignes : la plus basse stable",
  FIVE_ONLY_STABLE: "Cinq mobiles ; une stable",
  SIX_ALL_CHANGING: "Les six lignes changent",
  QIAN_ALL_NINE: "Qian: tous les neuf",
  KUN_ALL_SIX: "Kun: tous les six",
};

const DE: RuleMap = {
  NO_CHANGING: "Keine wandelnden Linien",
  ONE_CHANGING: "Eine wandelnde Linie",
  TWO_YIN_YANG: "Zwei Linien: Yin und Yang wandeln",
  TWO_SAME_LOWER: "Zwei wandelnde Linien (unteres Trigramm)",
  THREE_MIDDLE: "Drei mittlere Linien im Spiel",
  FOUR_LOWEST_STABLE: "Vier Linien: die unterste bleibt stabil",
  FIVE_ONLY_STABLE: "Fünf wandelnd; eine stabil",
  SIX_ALL_CHANGING: "Alle sechs Linien wandeln",
  QIAN_ALL_NINE: "Qian: alle Neun",
  KUN_ALL_SIX: "Kun: alle Sechs",
};

const IT: RuleMap = {
  NO_CHANGING: "Nessuna linea mutante",
  ONE_CHANGING: "Una linea mutante",
  TWO_YIN_YANG: "Due linee: yin e yang in mutazione",
  TWO_SAME_LOWER: "Due linee mutanti (trigramma inferiore)",
  THREE_MIDDLE: "Tre linee centrali in gioco",
  FOUR_LOWEST_STABLE: "Quattro linee: la inferiore stabile",
  FIVE_ONLY_STABLE: "Cinque mutanti; una stabile",
  SIX_ALL_CHANGING: "Tutte e sei le linee mutano",
  QIAN_ALL_NINE: "Qian: tutti nove",
  KUN_ALL_SIX: "Kun: tutti sei",
};

const JA: RuleMap = {
  NO_CHANGING: "変爻なし",
  ONE_CHANGING: "変爻1本",
  TWO_YIN_YANG: "2本：陰と陽が変化",
  TWO_SAME_LOWER: "変爻2本（下卦）",
  THREE_MIDDLE: "中央3本が関与",
  FOUR_LOWEST_STABLE: "4本：最下爻は安定",
  FIVE_ONLY_STABLE: "5本が変化、1本は安定",
  SIX_ALL_CHANGING: "6本すべて変化",
  QIAN_ALL_NINE: "乾: 九が六爻すべて",
  KUN_ALL_SIX: "坤: 六が六爻すべて",
};

const ZH: RuleMap = {
  NO_CHANGING: "无变爻",
  ONE_CHANGING: "一变爻",
  TWO_YIN_YANG: "两爻：阴阳皆变",
  TWO_SAME_LOWER: "两变爻（下卦）",
  THREE_MIDDLE: "三爻居中互动",
  FOUR_LOWEST_STABLE: "四爻：初爻不变",
  FIVE_ONLY_STABLE: "五爻变，一爻不变",
  SIX_ALL_CHANGING: "六爻皆变",
  QIAN_ALL_NINE: "乾: 六爻皆九",
  KUN_ALL_SIX: "坤: 六爻皆六",
};

const KO: RuleMap = {
  NO_CHANGING: "변효 없음",
  ONE_CHANGING: "변효 1획",
  TWO_YIN_YANG: "2획: 음과 양이 변함",
  TWO_SAME_LOWER: "변효 2획 (하괘)",
  THREE_MIDDLE: "중앙 3획이 관여",
  FOUR_LOWEST_STABLE: "4획: 초획은 안정",
  FIVE_ONLY_STABLE: "5획 변함, 1획 안정",
  SIX_ALL_CHANGING: "6획 모두 변함",
  QIAN_ALL_NINE: "건: 육효 모두 구",
  KUN_ALL_SIX: "곤: 육효 모두 육",
};

const AR: RuleMap = {
  NO_CHANGING: "لا خطوط متغيرة",
  ONE_CHANGING: "خط متغير واحد",
  TWO_YIN_YANG: "خطان: ين ويانغ يتغيران",
  TWO_SAME_LOWER: "خطان متغيران (المثلث السفلي)",
  THREE_MIDDLE: "ثلاثة خطوط وسطى في اللعب",
  FOUR_LOWEST_STABLE: "أربعة خطوط: الأدنى ثابت",
  FIVE_ONLY_STABLE: "خمسة تتغير؛ واحد ثابت",
  SIX_ALL_CHANGING: "كل الخطوط الستة تتغير",
  QIAN_ALL_NINE: "Qian: كل التسعات",
  KUN_ALL_SIX: "Kun: كل الستات",
};

const HI: RuleMap = {
  NO_CHANGING: "कोई परिवर्तनशील रेखा नहीं",
  ONE_CHANGING: "एक परिवर्तनशील रेखा",
  TWO_YIN_YANG: "दो रेखाएं: यिन और यांग परिवर्तन",
  TWO_SAME_LOWER: "दो परिवर्तनशील रेखाएं (निचला त्रिग्राम)",
  THREE_MIDDLE: "तीन मध्य रेखाएं सक्रिय",
  FOUR_LOWEST_STABLE: "चार रेखाएं: सबसे निचली स्थिर",
  FIVE_ONLY_STABLE: "पांच परिवर्तनशील; एक स्थिर",
  SIX_ALL_CHANGING: "सभी छह रेखाएं बदलती हैं",
  QIAN_ALL_NINE: "Qian: सभी नौ",
  KUN_ALL_SIX: "Kun: सभी छह",
};

const BY_LOCALE: Record<AppLocale, RuleMap> = {
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

export function getIchingMutationRuleLabel(locale: AppLocale, rule: string): string {
  const map = BY_LOCALE[locale] ?? BY_LOCALE[DEFAULT_LOCALE];
  if (rule in map) return map[rule as IchingMutationRuleId];
  return rule;
}
