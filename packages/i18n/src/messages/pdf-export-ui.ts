import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";
import { interpolate } from "./interpolate.js";

export type PdfExportUiMessages = {
  title: string;
  /** e.g. "Entry {{n}} · {{datetime}}" */
  entryLine: string;
  question: string;
  summary: string;
  verdict: string;
  medium: string;
  charge: string;
  inThread: string;
  /** e.g. "{{reading}} {{position}} · {{date}}" */
  threadReadingLine: string;
  reading: string;
  trace: string;
  rule: string;
  translator: string;
  turtle: string;
  ox: string;
  chargePositive: string;
  chargeNegative: string;
  /** e.g. "Entry {{n}} · Reading (continued)" */
  entryContinued: string;
};

const PDF_EXPORT_UI: Record<AppLocale, PdfExportUiMessages> = {
  es: {
    title: "Consulta del Oráculo",
    entryLine: "Entrada {{n}} · {{datetime}}",
    question: "Pregunta",
    summary: "Resumen",
    verdict: "Veredicto:",
    medium: "Medio:",
    charge: "Cargo:",
    inThread: "En hilo:",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "Lectura",
    trace: "Traza:",
    rule: "Regla:",
    translator: "Traductor:",
    turtle: "Caparazón de tortuga",
    ox: "Hueso de buey",
    chargePositive: "Positivo 吉",
    chargeNegative: "Negativo 凶",
    entryContinued: "Entrada {{n}} · Lectura (continuación)",
  },
  en: {
    title: "Oracle Consultation",
    entryLine: "Entry {{n}} · {{datetime}}",
    question: "Question",
    summary: "Summary",
    verdict: "Verdict:",
    medium: "Medium:",
    charge: "Charge:",
    inThread: "In thread:",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "Reading",
    trace: "Trace:",
    rule: "Rule:",
    translator: "Translator:",
    turtle: "Turtle shell",
    ox: "Ox bone",
    chargePositive: "Positive 吉",
    chargeNegative: "Negative 凶",
    entryContinued: "Entry {{n}} · Reading (continued)",
  },
  pt: {
    title: "Consulta do Oráculo",
    entryLine: "Entrada {{n}} · {{datetime}}",
    question: "Pergunta",
    summary: "Resumo",
    verdict: "Veredicto:",
    medium: "Médium:",
    charge: "Carga:",
    inThread: "Neste fio:",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "Tiragem",
    trace: "Traçado:",
    rule: "Regra:",
    translator: "Tradutor:",
    turtle: "Casco de tartaruga",
    ox: "Osso de boi",
    chargePositive: "Positivo 吉",
    chargeNegative: "Negativo 凶",
    entryContinued: "Entrada {{n}} · Tiragem (continuação)",
  },
  fr: {
    title: "Consultation de l'Oracle",
    entryLine: "Entrée {{n}} · {{datetime}}",
    question: "Question",
    summary: "Résumé",
    verdict: "Verdict :",
    medium: "Médium :",
    charge: "Charge :",
    inThread: "Dans ce fil :",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "Tirage",
    trace: "Tracé :",
    rule: "Règle :",
    translator: "Traducteur :",
    turtle: "Carapace de tortue",
    ox: "Os de bœuf",
    chargePositive: "Positif 吉",
    chargeNegative: "Négatif 凶",
    entryContinued: "Entrée {{n}} · Tirage (suite)",
  },
  de: {
    title: "Orakel-Beratung",
    entryLine: "Eintrag {{n}} · {{datetime}}",
    question: "Frage",
    summary: "Zusammenfassung",
    verdict: "Urteil:",
    medium: "Medium:",
    charge: "Ladung:",
    inThread: "In diesem Thread:",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "Lesung",
    trace: "Muster:",
    rule: "Regel:",
    translator: "Übersetzer:",
    turtle: "Schildkrötenpanzer",
    ox: "Ochsenknochen",
    chargePositive: "Positiv 吉",
    chargeNegative: "Negativ 凶",
    entryContinued: "Eintrag {{n}} · Lesung (Fortsetzung)",
  },
  it: {
    title: "Consultazione dell'Oracolo",
    entryLine: "Voce {{n}} · {{datetime}}",
    question: "Domanda",
    summary: "Riepilogo",
    verdict: "Verdetto:",
    medium: "Medium:",
    charge: "Carica:",
    inThread: "In questo thread:",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "Lettura",
    trace: "Traccia:",
    rule: "Regola:",
    translator: "Traduttore:",
    turtle: "Guscio di tartaruga",
    ox: "Osso di bue",
    chargePositive: "Positivo 吉",
    chargeNegative: "Negativo 凶",
    entryContinued: "Voce {{n}} · Lettura (continua)",
  },
  ja: {
    title: "神託相談",
    entryLine: "項目 {{n}} · {{datetime}}",
    question: "質問",
    summary: "概要",
    verdict: "判定:",
    medium: "媒介:",
    charge: "荷電:",
    inThread: "このスレッド:",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "占い",
    trace: "卦:",
    rule: "ルール:",
    translator: "翻訳者:",
    turtle: "亀甲",
    ox: "牛骨",
    chargePositive: "陽 吉",
    chargeNegative: "陰 凶",
    entryContinued: "項目 {{n}} · 占い（続き）",
  },
  zh: {
    title: "神谕咨询",
    entryLine: "条目 {{n}} · {{datetime}}",
    question: "问题",
    summary: "摘要",
    verdict: "判断：",
    medium: "媒介：",
    charge: "命：",
    inThread: "本线程：",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "占卜",
    trace: "卦象：",
    rule: "规则：",
    translator: "译者：",
    turtle: "龟甲",
    ox: "牛骨",
    chargePositive: "正命 吉",
    chargeNegative: "负命 凶",
    entryContinued: "条目 {{n}} · 占卜（续）",
  },
  ko: {
    title: "신탁 상담",
    entryLine: "항목 {{n}} · {{datetime}}",
    question: "질문",
    summary: "요약",
    verdict: "판결:",
    medium: "매개체:",
    charge: "전하:",
    inThread: "이 스레드:",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "리딩",
    trace: "괘:",
    rule: "규칙:",
    translator: "번역자:",
    turtle: "거북 등딱지",
    ox: "소뼈",
    chargePositive: "양성 吉",
    chargeNegative: "음성 凶",
    entryContinued: "항목 {{n}} · 리딩 (계속)",
  },
  ar: {
    title: "استشارة الأوراكل",
    entryLine: "إدخال {{n}} · {{datetime}}",
    question: "السؤال",
    summary: "الملخص",
    verdict: "الحكم:",
    medium: "الوسيط:",
    charge: "الشحنة:",
    inThread: "في هذا الخيط:",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "قراءة",
    trace: "الأثر:",
    rule: "القاعدة:",
    translator: "المترجم:",
    turtle: "صدفة سلحفاة",
    ox: "عظم ثور",
    chargePositive: "موجب 吉",
    chargeNegative: "سالب 凶",
    entryContinued: "إدخال {{n}} · قراءة (تابع)",
  },
  hi: {
    title: "ओरेकल परामर्श",
    entryLine: "प्रविष्टि {{n}} · {{datetime}}",
    question: "प्रश्न",
    summary: "सारांश",
    verdict: "निर्णय:",
    medium: "माध्यम:",
    charge: "आवेश:",
    inThread: "इस थ्रेड में:",
    threadReadingLine: "{{reading}} {{position}} · {{date}}",
    reading: "रीडिंग",
    trace: "ट्रेस:",
    rule: "नियम:",
    translator: "अनुवादक:",
    turtle: "कछुए का खोल",
    ox: "बैल की हड्डी",
    chargePositive: "सकारात्मक 吉",
    chargeNegative: "नकारात्मक 凶",
    entryContinued: "प्रविष्टि {{n}} · रीडिंग (जारी)",
  },
};

export function getPdfExportUiMessages(locale: AppLocale): PdfExportUiMessages {
  return PDF_EXPORT_UI[locale] ?? PDF_EXPORT_UI[DEFAULT_LOCALE];
}

export function formatPdfEntryLine(
  m: PdfExportUiMessages,
  n: number,
  datetime: string,
): string {
  return interpolate(m.entryLine, { n: String(n), datetime });
}

export function formatPdfThreadReadingLine(
  m: PdfExportUiMessages,
  position: number,
  date: string,
): string {
  return interpolate(m.threadReadingLine, {
    reading: m.reading,
    position: String(position),
    date,
  });
}

export function formatPdfEntryContinued(
  m: PdfExportUiMessages,
  n: number,
): string {
  return interpolate(m.entryContinued, { n: String(n) });
}
