import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type SiteMetaUiMessages = {
  title: string;
  description: string;
};

const SITE_META_UI: Record<AppLocale, SiteMetaUiMessages> = {
  es: {
    title: "Oráculo I Ching",
    description: "I Ching clásico con reglas de mutación Zhu Xi",
  },
  en: {
    title: "I Ching Oracle",
    description: "Classical I Ching with Zhu Xi mutation rules",
  },
  pt: {
    title: "Oráculo I Ching",
    description: "I Ching clássico com regras de mutação Zhu Xi",
  },
  fr: {
    title: "Oracle I Ching",
    description: "I Ching classique avec règles de mutation Zhu Xi",
  },
  de: {
    title: "I-Ging Orakel",
    description: "Klassisches I Ging mit Zhu-Xi-Mutationsregeln",
  },
  it: {
    title: "Oracolo I Ching",
    description: "I Ching classico con regole di mutazione Zhu Xi",
  },
  ja: {
    title: "易経オラクル",
    description: "朱熹の変爻ルールに基づく古典的易経",
  },
  zh: {
    title: "易经神谕",
    description: "遵循朱熹变爻规则的经典易经",
  },
  ko: {
    title: "역경 오라클",
    description: "주희 변효 규칙을 따른 고전 역경",
  },
  ar: {
    title: "أوراكل I Ching",
    description: "I Ching الكلاسيكي وفق قواعد تحوّل Zhu Xi",
  },
  hi: {
    title: "I Ching ओरेकल",
    description: "ज़ू शी उत्परिवर्तन नियमों के साथ क्लासिकल I Ching",
  },
};

export function getSiteMetaUiMessages(locale: AppLocale): SiteMetaUiMessages {
  return SITE_META_UI[locale] ?? SITE_META_UI[DEFAULT_LOCALE];
}

/** BCP 47 language tag for <html lang="…"> */
export function htmlLangFromAppLocale(locale: AppLocale): string {
  if (locale === "zh") return "zh-Hans";
  return locale;
}
