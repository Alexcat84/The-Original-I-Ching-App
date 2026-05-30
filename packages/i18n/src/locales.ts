export const SUPPORTED_LOCALES = ["es", "en", "pt", "fr", "de", "it", "ja", "zh", "ko", "ar", "hi"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export const commonStrings: Record<AppLocale, { appTitle: string; consult: string; deepen: string; newSession: string }> = {
  es: {
    appTitle: "El auténtico I Ching App",
    consult: "Consultar",
    deepen: "Profundizar",
    newSession: "Nueva sesión",
  },
  en: {
    appTitle: "The Original I Ching App",
    consult: "Consult",
    deepen: "Deepen",
    newSession: "New session",
  },
  pt: {
    appTitle: "O autêntico I Ching App",
    consult: "Consultar",
    deepen: "Aprofundar",
    newSession: "Nova sessão",
  },
  fr: {
    appTitle: "L'authentique I Ching App",
    consult: "Consulter",
    deepen: "Approfondir",
    newSession: "Nouvelle session",
  },
  de: {
    appTitle: "Die authentische I-Ching-App",
    consult: "Befragen",
    deepen: "Vertiefen",
    newSession: "Neue Sitzung",
  },
  it: {
    appTitle: "L'autentico I Ching App",
    consult: "Consultare",
    deepen: "Approfondire",
    newSession: "Nuova sessione",
  },
  ja: {
    appTitle: "オリジナル易経アプリ",
    consult: "占う",
    deepen: "深める",
    newSession: "新しいセッション",
  },
  zh: {
    appTitle: "正宗易经应用",
    consult: "占卜",
    deepen: "深入",
    newSession: "新会话",
  },
  ko: {
    appTitle: "오리지널 주역 앱",
    consult: "점치기",
    deepen: "심화",
    newSession: "새 세션",
  },
  ar: {
    appTitle: "تطبيق I Ching الأصلي",
    consult: "استشر",
    deepen: "أعمق",
    newSession: "جلسة جديدة",
  },
  hi: {
    appTitle: "मूल I Ching ऐप",
    consult: "परामर्श करें",
    deepen: "गहराएं",
    newSession: "नया सत्र",
  },
};
