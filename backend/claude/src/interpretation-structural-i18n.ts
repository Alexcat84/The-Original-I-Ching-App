import type { CastResult } from "@iching-oracle/iching-engine";

const ICHING_UI_LANGS = ["es", "en", "pt", "fr", "de", "it", "ja", "zh", "ko"] as const;
export type IchingUiLang = (typeof ICHING_UI_LANGS)[number];

export function normalizeIchingUiLang(language: string): IchingUiLang {
  const base = language.trim().toLowerCase().split("-")[0];
  return (ICHING_UI_LANGS as readonly string[]).includes(base) ? (base as IchingUiLang) : "en";
}

/** Spelled-out counts 0–6 for “changing lines” correction line. */
const COUNT_WORDS: Record<IchingUiLang, readonly [string, string, string, string, string, string, string]> = {
  es: ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis"],
  en: ["zero", "one", "two", "three", "four", "five", "six"],
  pt: ["zero", "uma", "duas", "três", "quatro", "cinco", "seis"],
  fr: ["zéro", "une", "deux", "trois", "quatre", "cinq", "six"],
  de: ["null", "eine", "zwei", "drei", "vier", "fünf", "sechs"],
  it: ["zero", "una", "due", "tre", "quattro", "cinque", "sei"],
  ja: ["零", "一", "二", "三", "四", "五", "六"],
  zh: ["零", "一", "二", "三", "四", "五", "六"],
  ko: ["영", "하나", "둘", "셋", "넷", "다섯", "여섯"],
};

export function spelledChangingLineCountLabel(count: number, language: string): string {
  const lang = normalizeIchingUiLang(language);
  const row = COUNT_WORDS[lang];
  return row[count] ?? String(count);
}

const NONE_LINES: Record<IchingUiLang, string> = {
  es: "ninguna",
  en: "none",
  pt: "nenhuma",
  fr: "aucune",
  de: "keine",
  it: "nessuna",
  ja: "なし",
  zh: "无",
  ko: "없음",
};

const NONE_HEX: Record<IchingUiLang, string> = {
  es: "ninguno",
  en: "none",
  pt: "nenhum",
  fr: "aucun",
  de: "keins",
  it: "nessuno",
  ja: "なし",
  zh: "无",
  ko: "없음",
};

export function ichingStructuralCorrectionAppendix(
  cast: CastResult,
  language: string,
  expected: number,
  lineList: string,
): string {
  const lang = normalizeIchingUiLang(language);
  const countLabel = spelledChangingLineCountLabel(expected, language);
  const transformedLabel =
    cast.transformedHexagram?.number !== undefined && cast.transformedHexagram !== null
      ? `#${cast.transformedHexagram.number}`
      : NONE_HEX[lang];

  switch (lang) {
    case "en":
      return `Structural correction: this cast has ${expected} changing line${expected === 1 ? "" : "s"} (${countLabel}). Positions: ${lineList}. Transformed hexagram: ${transformedLabel}.`;
    case "es":
      return `Corrección estructural: esta tirada tiene ${expected} línea${expected === 1 ? "" : "s"} en mutación (${countLabel}). Posiciones: ${lineList}. Hexagrama transformado: ${transformedLabel}.`;
    case "pt":
      return `Correção estrutural: esta leitura tem ${expected} linha${expected === 1 ? "" : "s"} em mutação (${countLabel}). Posições: ${lineList}. Hexagrama transformado: ${transformedLabel}.`;
    case "fr":
      return `Correction structurelle : ce jet comporte ${expected} ligne${expected === 1 ? "" : "s"} en mutation (${countLabel}). Positions : ${lineList}. Hexagramme transformé : ${transformedLabel}.`;
    case "de":
      return `Strukturelle Korrektur: Dieser Wurf hat ${expected} wechselnde Linie${expected === 1 ? "" : "n"} (${countLabel}). Positionen: ${lineList}. Transformiertes Hexagramm: ${transformedLabel}.`;
    case "it":
      return `Correzione strutturale: questa lettura ha ${expected} linea${expected === 1 ? "" : "e"} in mutazione (${countLabel}). Posizioni: ${lineList}. Esagramma trasformato: ${transformedLabel}.`;
    case "ja":
      return `構造上の訂正：この占いの変爻は${expected}本（${countLabel}）。位置：${lineList}。之卦：${transformedLabel}。`;
    case "zh":
      return `结构更正：本卦有${expected}条变爻（${countLabel}）。位置：${lineList}。之卦：${transformedLabel}。`;
    case "ko":
      return `구조적 수정: 이번 점의 변효는 ${expected}개(${countLabel}). 위치: ${lineList}. 지괘: ${transformedLabel}.`;
  }
}

export function changingLinePositionsLabel(cast: CastResult, language: string): string {
  const lang = normalizeIchingUiLang(language);
  if (cast.changingLines.length > 0) return cast.changingLines.join(", ");
  return NONE_LINES[lang];
}
