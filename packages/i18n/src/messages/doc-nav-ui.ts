import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/** Shared doc shell navigation and common legal link labels. */
export type DocNavUiMessages = {
  backToOracle: string;
  /** Single user-facing guide (/guia); replaces former “quick guide” + “Quickstart” split. */
  userGuide: string;
  methodNotes: string;
  /** Long link label in the home composer footer (I Ching + Bones). */
  methodNotesLong: string;
  privacyShort: string;
  termsShort: string;
  privacyPolicy: string;
  termsOfService: string;
  ichingDocLink: string;
};

const DOC_NAV_UI: Record<AppLocale, DocNavUiMessages> = {
  es: {
    backToOracle: "← Volver al oráculo",
    userGuide: "Guía de uso",
    methodNotes: "Notas de métodos",
    methodNotesLong: "Notas y origen de los métodos (I Ching y Huesos)",
    privacyShort: "Privacidad",
    termsShort: "Términos",
    privacyPolicy: "Política de Privacidad",
    termsOfService: "Términos del Servicio",
    ichingDocLink: "Documentación sobre el I Ching",
  },
  en: {
    backToOracle: "← Back to oracle",
    userGuide: "User guide",
    methodNotes: "Method notes",
    methodNotesLong: "Method notes and origins (I Ching and Bones)",
    privacyShort: "Privacy",
    termsShort: "Terms",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    ichingDocLink: "I Ching documentation",
  },
  pt: {
    backToOracle: "← Voltar ao oráculo",
    userGuide: "Guia de utilização",
    methodNotes: "Notas sobre métodos",
    methodNotesLong: "Notas e origem dos métodos (I Ching e Ossos)",
    privacyShort: "Privacidade",
    termsShort: "Termos",
    privacyPolicy: "Política de Privacidade",
    termsOfService: "Termos de Serviço",
    ichingDocLink: "Documentação sobre o I Ching",
  },
  fr: {
    backToOracle: "← Retour à l’oracle",
    userGuide: "Guide d’utilisation",
    methodNotes: "Notes sur les méthodes",
    methodNotesLong: "Notes et origines des méthodes (I Ching et Os)",
    privacyShort: "Confidentialité",
    termsShort: "Conditions",
    privacyPolicy: "Politique de confidentialité",
    termsOfService: "Conditions d’utilisation",
    ichingDocLink: "Documentation sur le I Ching",
  },
  de: {
    backToOracle: "← Zurück zum Orakel",
    userGuide: "Nutzungsanleitung",
    methodNotes: "Methodenhinweise",
    methodNotesLong: "Methodennotizen und Ursprünge (I Ging und Knochen)",
    privacyShort: "Datenschutz",
    termsShort: "AGB",
    privacyPolicy: "Datenschutzerklärung",
    termsOfService: "Nutzungsbedingungen",
    ichingDocLink: "Dokumentation zum I Ging",
  },
  it: {
    backToOracle: "← Torna all’oracolo",
    userGuide: "Guida all’uso",
    methodNotes: "Note sui metodi",
    methodNotesLong: "Note e origini dei metodi (I Ching e Ossa)",
    privacyShort: "Privacy",
    termsShort: "Termini",
    privacyPolicy: "Informativa sulla privacy",
    termsOfService: "Termini di servizio",
    ichingDocLink: "Documentazione sul I Ching",
  },
  ja: {
    backToOracle: "← オラクルに戻る",
    userGuide: "利用ガイド",
    methodNotes: "方法の注記",
    methodNotesLong: "方法の注記と由来（易経と甲骨占い）",
    privacyShort: "プライバシー",
    termsShort: "利用規約",
    privacyPolicy: "プライバシーポリシー",
    termsOfService: "利用規約",
    ichingDocLink: "易経（I Ching）のドキュメント",
  },
  zh: {
    backToOracle: "← 返回占卜",
    userGuide: "使用指南",
    methodNotes: "方法说明",
    methodNotesLong: "方法说明与渊源（易经与甲骨）",
    privacyShort: "隐私",
    termsShort: "条款",
    privacyPolicy: "隐私政策",
    termsOfService: "服务条款",
    ichingDocLink: "易经（I Ching）文档",
  },
  ko: {
    backToOracle: "← 오라클로 돌아가기",
    userGuide: "사용 안내",
    methodNotes: "방법 노트",
    methodNotesLong: "방법 설명과 유래 (역경과 뼈 점)",
    privacyShort: "개인정보",
    termsShort: "약관",
    privacyPolicy: "개인정보 처리방침",
    termsOfService: "서비스 약관",
    ichingDocLink: "역경(I Ching) 문서",
  },
};

export function getDocNavUiMessages(locale: AppLocale): DocNavUiMessages {
  return DOC_NAV_UI[locale] ?? DOC_NAV_UI[DEFAULT_LOCALE];
}
