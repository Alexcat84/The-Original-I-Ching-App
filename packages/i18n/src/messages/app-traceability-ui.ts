import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/** End-of-guide “about” block (WebView only): consumer-facing build info, no internal package id. */
export type AppTraceabilityUiMessages = {
  aboutHeading: string;
  appNameLabel: string;
  /** Public product name (not the reverse-domain package id). */
  appNameValue: string;
  versionLabel: string;
  androidVersionCodeLabel: string;
  rightsLine: string;
};

const APP_TRACEABILITY_UI: Record<AppLocale, AppTraceabilityUiMessages> = {
  es: {
    aboutHeading: "Sobre esta aplicación",
    appNameLabel: "Nombre",
    appNameValue: "The Original I Ching",
    versionLabel: "Versión",
    androidVersionCodeLabel: "Compilación (Android)",
    rightsLine: "© 2026 theoriginaliching.com · Todos los derechos reservados",
  },
  en: {
    aboutHeading: "About this app",
    appNameLabel: "Name",
    appNameValue: "The Original I Ching",
    versionLabel: "Version",
    androidVersionCodeLabel: "Build (Android)",
    rightsLine: "© 2026 theoriginaliching.com · All rights reserved",
  },
  pt: {
    aboutHeading: "Sobre a aplicação",
    appNameLabel: "Nome",
    appNameValue: "The Original I Ching",
    versionLabel: "Versão",
    androidVersionCodeLabel: "Compilação (Android)",
    rightsLine: "© 2026 theoriginaliching.com · Todos os direitos reservados",
  },
  fr: {
    aboutHeading: "À propos de cette application",
    appNameLabel: "Nom",
    appNameValue: "The Original I Ching",
    versionLabel: "Version",
    androidVersionCodeLabel: "Build (Android)",
    rightsLine: "© 2026 theoriginaliching.com · Tous droits réservés",
  },
  de: {
    aboutHeading: "Über diese App",
    appNameLabel: "Name",
    appNameValue: "The Original I Ching",
    versionLabel: "Version",
    androidVersionCodeLabel: "Build (Android)",
    rightsLine: "© 2026 theoriginaliching.com · Alle Rechte vorbehalten",
  },
  it: {
    aboutHeading: "Informazioni sull’app",
    appNameLabel: "Nome",
    appNameValue: "The Original I Ching",
    versionLabel: "Versione",
    androidVersionCodeLabel: "Build (Android)",
    rightsLine: "© 2026 theoriginaliching.com · Tutti i diritti riservati",
  },
  ja: {
    aboutHeading: "アプリについて",
    appNameLabel: "名称",
    appNameValue: "The Original I Ching",
    versionLabel: "バージョン",
    androidVersionCodeLabel: "ビルド（Android）",
    rightsLine: "© 2026 theoriginaliching.com · 無断複写・転載を禁じます",
  },
  zh: {
    aboutHeading: "关于本应用",
    appNameLabel: "名称",
    appNameValue: "The Original I Ching",
    versionLabel: "版本",
    androidVersionCodeLabel: "构建号（Android）",
    rightsLine: "© 2026 theoriginaliching.com · 保留所有权利",
  },
  ko: {
    aboutHeading: "앱 정보",
    appNameLabel: "이름",
    appNameValue: "The Original I Ching",
    versionLabel: "버전",
    androidVersionCodeLabel: "빌드(Android)",
    rightsLine: "© 2026 theoriginaliching.com · 판권 소유",
  },
  ar: {
    aboutHeading: "حول التطبيق",
    appNameLabel: "الاسم",
    appNameValue: "The Original I Ching",
    versionLabel: "الإصدار",
    androidVersionCodeLabel: "رقم البناء (Android)",
    rightsLine: "© 2026 theoriginaliching.com · جميع الحقوق محفوظة",
  },
};

export function getAppTraceabilityUiMessages(locale: AppLocale): AppTraceabilityUiMessages {
  return APP_TRACEABILITY_UI[locale] ?? APP_TRACEABILITY_UI[DEFAULT_LOCALE];
}
