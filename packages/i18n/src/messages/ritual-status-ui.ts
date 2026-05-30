import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type RitualStatusUiMessages = {
  question: string;
  consult: string;
  shape: string;
  seal: string;
};

const RITUAL_STATUS_UI: Record<AppLocale, RitualStatusUiMessages> = {
  es: {
    question: "Tomando tu pregunta",
    consult: "Llevándola al oráculo",
    shape: "El oráculo está consultando",
    seal: "Sellando la lectura",
  },
  en: {
    question: "Holding your question",
    consult: "Carrying it to the oracle",
    shape: "The oracle is consulting",
    seal: "Sealing the reading",
  },
  pt: {
    question: "Sustentando a tua pergunta",
    consult: "Levando-a ao oráculo",
    shape: "O oráculo está consultando",
    seal: "Selando a leitura",
  },
  fr: {
    question: "Accueillir votre question",
    consult: "La porter vers l'oracle",
    shape: "L'oracle consulte",
    seal: "Sceller la lecture",
  },
  de: {
    question: "Deine Frage aufnehmen",
    consult: "Zum Orakel tragen",
    shape: "Das Orakel befragt",
    seal: "Die Deutung wird versiegelt",
  },
  it: {
    question: "Accogliere la tua domanda",
    consult: "Portarla all'oracolo",
    shape: "L'oracolo sta consultando",
    seal: "Sigillando la lettura",
  },
  ja: {
    question: "問いを受け取っています",
    consult: "神託へ運んでいます",
    shape: "神託が照会しています",
    seal: "読みを封じています",
  },
  zh: {
    question: "承接你的问题",
    consult: "将它带向神谕",
    shape: "神谕正在推演",
    seal: "正在封印此次解读",
  },
  ko: {
    question: "질문을 받아들이는 중",
    consult: "신탁으로 옮기는 중",
    shape: "신탁이 살피는 중",
    seal: "해석을 봉인하는 중",
  },
  ar: {
    question: "استقبال سؤالك",
    consult: "نقله إلى الأوراكل",
    shape: "الأوراكل يتشاور",
    seal: "ختم القراءة",
  },
  hi: {
    question: "आपके प्रश्न को थामते हुए",
    consult: "उसे ओरेकल तक ले जाते हुए",
    shape: "ओरेकल परामर्श कर रहा है",
    seal: "पठन को सील किया जा रहा है",
  },
};

export function getRitualStatusUiMessages(locale: AppLocale): RitualStatusUiMessages {
  return RITUAL_STATUS_UI[locale] ?? RITUAL_STATUS_UI[DEFAULT_LOCALE];
}
