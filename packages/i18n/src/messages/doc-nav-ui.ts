import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/** Shared doc shell navigation and common legal link labels. */
export type DocNavUiMessages = {
  backToOracle: string;
  /** Short label for “home oracle” links (e.g. FAQs), without arrow prefix. */
  oracleHome: string;
  /** FAQ page (/faqs). */
  faqs: string;
  /** About / build info page (/about), short nav label. */
  aboutShort: string;
  /** Anchor to /guia#planes (packs & pricing copy in the guide). */
  guidePlansSection: string;
  /** Anchor to /guia#primeros-pasos. */
  guideFirstSteps: string;
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
    oracleHome: "Oráculo",
    faqs: "Preguntas frecuentes",
    aboutShort: "Sobre la app",
    guidePlansSection: "Planes y tokens (guía)",
    guideFirstSteps: "Primeros pasos (guía)",
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
    oracleHome: "Oracle",
    faqs: "FAQ",
    aboutShort: "About",
    guidePlansSection: "Plans & tokens (guide)",
    guideFirstSteps: "Getting started (guide)",
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
    oracleHome: "Oráculo",
    faqs: "Perguntas frequentes",
    aboutShort: "Sobre a app",
    guidePlansSection: "Planos e tokens (guia)",
    guideFirstSteps: "Primeiros passos (guia)",
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
    oracleHome: "Oracle",
    faqs: "FAQ",
    aboutShort: "À propos",
    guidePlansSection: "Forfaits et jetons (guide)",
    guideFirstSteps: "Premiers pas (guide)",
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
    oracleHome: "Orakel",
    faqs: "FAQ",
    aboutShort: "Über die App",
    guidePlansSection: "Pläne & Token (Leitfaden)",
    guideFirstSteps: "Erste Schritte (Leitfaden)",
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
    oracleHome: "Oracolo",
    faqs: "FAQ",
    aboutShort: "Informazioni",
    guidePlansSection: "Piani e token (guida)",
    guideFirstSteps: "Primi passi (guida)",
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
    oracleHome: "オラクル",
    faqs: "よくある質問",
    aboutShort: "アプリについて",
    guidePlansSection: "プランとトークン（ガイド）",
    guideFirstSteps: "はじめに（ガイド）",
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
    oracleHome: "占卜首页",
    faqs: "常见问题",
    aboutShort: "关于应用",
    guidePlansSection: "套餐与代币（指南）",
    guideFirstSteps: "入门（指南）",
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
    oracleHome: "오라클",
    faqs: "자주 묻는 질문",
    aboutShort: "앱 정보",
    guidePlansSection: "플랜 및 토큰(안내)",
    guideFirstSteps: "시작하기(안내)",
    userGuide: "사용 안내",
    methodNotes: "방법 노트",
    methodNotesLong: "방법 설명과 유래 (역경과 뼈 점)",
    privacyShort: "개인정보",
    termsShort: "약관",
    privacyPolicy: "개인정보 처리방침",
    termsOfService: "서비스 약관",
    ichingDocLink: "역경(I Ching) 문서",
  },
  ar: {
    backToOracle: "← العودة إلى الأوراكل",
    oracleHome: "الأوراكل",
    faqs: "أسئلة شائعة",
    aboutShort: "حول",
    guidePlansSection: "الخطط والرموز (الدليل)",
    guideFirstSteps: "البدء (الدليل)",
    userGuide: "دليل المستخدم",
    methodNotes: "ملاحظات المنهج",
    methodNotesLong: "ملاحظات المنهج وأصوله (I Ching والعظام)",
    privacyShort: "الخصوصية",
    termsShort: "الشروط",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    ichingDocLink: "وثائق I Ching",
  },
};

export function getDocNavUiMessages(locale: AppLocale): DocNavUiMessages {
  return DOC_NAV_UI[locale] ?? DOC_NAV_UI[DEFAULT_LOCALE];
}
