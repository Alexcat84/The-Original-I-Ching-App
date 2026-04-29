export const SUPPORTED_LOCALES = ["es", "en", "pt", "fr", "de", "it", "ja", "zh", "ko", "ar"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

export const commonStrings: Record<AppLocale, { appTitle: string; consult: string; deepen: string; newSession: string }> = {
  es: {
    appTitle: "El autentico I ching app",
    consult: "Consultar",
    deepen: "Profundizar",
    newSession: "Nueva sesión",
  },
  en: {
    appTitle: "El autentico I ching app",
    consult: "Consult",
    deepen: "Deepen",
    newSession: "New session",
  },
  pt: {
    appTitle: "El autentico I ching app",
    consult: "Consultar",
    deepen: "Aprofundar",
    newSession: "Nova sessão",
  },
  fr: {
    appTitle: "El autentico I ching app",
    consult: "Consulter",
    deepen: "Approfondir",
    newSession: "Nouvelle session",
  },
  de: {
    appTitle: "El autentico I ching app",
    consult: "Befragen",
    deepen: "Vertiefen",
    newSession: "Neue Sitzung",
  },
  it: {
    appTitle: "El autentico I ching app",
    consult: "Consultare",
    deepen: "Approfondire",
    newSession: "Nuova sessione",
  },
  ja: {
    appTitle: "El autentico I ching app",
    consult: "占う",
    deepen: "深める",
    newSession: "新しいセッション",
  },
  zh: {
    appTitle: "El autentico I ching app",
    consult: "占卜",
    deepen: "深入",
    newSession: "新会话",
  },
  ko: {
    appTitle: "El autentico I ching app",
    consult: "점치기",
    deepen: "심화",
    newSession: "새 세션",
  },
  ar: {
    appTitle: "El autentico I ching app",
    consult: "استشر",
    deepen: "أعمق",
    newSession: "جلسة جديدة",
  },
};
