import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/** Shared doc shell navigation and common legal link labels. */
export type DocNavUiMessages = {
  backToOracle: string;
  quickGuide: string;
  quickstart: string;
  methodNotes: string;
  privacyShort: string;
  termsShort: string;
  privacyPolicy: string;
  termsOfService: string;
  ichingDocLink: string;
};

const DOC_NAV_UI: Record<AppLocale, DocNavUiMessages> = {
  es: {
    backToOracle: "← Volver al oráculo",
    quickGuide: "Guía rápida",
    quickstart: "Quickstart",
    methodNotes: "Notas de métodos",
    privacyShort: "Privacidad",
    termsShort: "Términos",
    privacyPolicy: "Política de Privacidad",
    termsOfService: "Términos del Servicio",
    ichingDocLink: "Documentación sobre el I Ching",
  },
  en: {
    backToOracle: "← Back to oracle",
    quickGuide: "Quick guide",
    quickstart: "Quickstart",
    methodNotes: "Method notes",
    privacyShort: "Privacy",
    termsShort: "Terms",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    ichingDocLink: "I Ching documentation",
  },
  pt: {
    backToOracle: "← Voltar ao oráculo",
    quickGuide: "Guia rápido",
    quickstart: "Quickstart",
    methodNotes: "Notas sobre métodos",
    privacyShort: "Privacidade",
    termsShort: "Termos",
    privacyPolicy: "Política de Privacidade",
    termsOfService: "Termos de Serviço",
    ichingDocLink: "Documentação sobre o I Ching",
  },
  fr: {
    backToOracle: "← Retour à l’oracle",
    quickGuide: "Guide rapide",
    quickstart: "Quickstart",
    methodNotes: "Notes sur les méthodes",
    privacyShort: "Confidentialité",
    termsShort: "Conditions",
    privacyPolicy: "Politique de confidentialité",
    termsOfService: "Conditions d’utilisation",
    ichingDocLink: "Documentation sur le I Ching",
  },
  de: {
    backToOracle: "← Zurück zum Orakel",
    quickGuide: "Kurzanleitung",
    quickstart: "Quickstart",
    methodNotes: "Methodenhinweise",
    privacyShort: "Datenschutz",
    termsShort: "AGB",
    privacyPolicy: "Datenschutzerklärung",
    termsOfService: "Nutzungsbedingungen",
    ichingDocLink: "Dokumentation zum I Ging",
  },
  it: {
    backToOracle: "← Torna all’oracolo",
    quickGuide: "Guida rapida",
    quickstart: "Quickstart",
    methodNotes: "Note sui metodi",
    privacyShort: "Privacy",
    termsShort: "Termini",
    privacyPolicy: "Informativa sulla privacy",
    termsOfService: "Termini di servizio",
    ichingDocLink: "Documentazione sul I Ching",
  },
  ja: {
    backToOracle: "← オラクルに戻る",
    quickGuide: "クイックガイド",
    quickstart: "Quickstart",
    methodNotes: "方法の注記",
    privacyShort: "プライバシー",
    termsShort: "利用規約",
    privacyPolicy: "プライバシーポリシー",
    termsOfService: "利用規約",
    ichingDocLink: "易経（I Ching）のドキュメント",
  },
  zh: {
    backToOracle: "← 返回占卜",
    quickGuide: "快速指南",
    quickstart: "Quickstart",
    methodNotes: "方法说明",
    privacyShort: "隐私",
    termsShort: "条款",
    privacyPolicy: "隐私政策",
    termsOfService: "服务条款",
    ichingDocLink: "易经（I Ching）文档",
  },
  ko: {
    backToOracle: "← 오라클로 돌아가기",
    quickGuide: "빠른 안내",
    quickstart: "Quickstart",
    methodNotes: "방법 노트",
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
