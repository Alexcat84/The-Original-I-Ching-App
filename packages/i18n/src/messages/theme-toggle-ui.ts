import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type ThemeToggleUiMessages = {
  /** Button label when current theme is light (action: switch to dark). */
  dark: string;
  /** Button label when current theme is dark (action: switch to light). */
  light: string;
  darkAria: string;
  lightAria: string;
};

const THEME_TOGGLE_UI: Record<AppLocale, ThemeToggleUiMessages> = {
  es: {
    dark: "Oscuro",
    light: "Claro",
    darkAria: "Activar tema oscuro",
    lightAria: "Activar tema claro",
  },
  en: {
    dark: "Dark",
    light: "Light",
    darkAria: "Enable dark theme",
    lightAria: "Enable light theme",
  },
  pt: {
    dark: "Escuro",
    light: "Claro",
    darkAria: "Ativar tema escuro",
    lightAria: "Ativar tema claro",
  },
  fr: {
    dark: "Sombre",
    light: "Clair",
    darkAria: "Activer le thème sombre",
    lightAria: "Activer le thème clair",
  },
  de: {
    dark: "Dunkel",
    light: "Hell",
    darkAria: "Dunkles Design aktivieren",
    lightAria: "Helles Design aktivieren",
  },
  it: {
    dark: "Scuro",
    light: "Chiaro",
    darkAria: "Attiva tema scuro",
    lightAria: "Attiva tema chiaro",
  },
  ja: {
    dark: "ダーク",
    light: "ライト",
    darkAria: "ダークテーマを有効化",
    lightAria: "ライトテーマを有効化",
  },
  zh: {
    dark: "深色",
    light: "浅色",
    darkAria: "启用深色主题",
    lightAria: "启用浅色主题",
  },
  ko: {
    dark: "다크",
    light: "라이트",
    darkAria: "다크 테마 사용",
    lightAria: "라이트 테마 사용",
  },
  ar: {
    dark: "داكن",
    light: "فاتح",
    darkAria: "تفعيل الوضع الداكن",
    lightAria: "تفعيل الوضع الفاتح",
  },
  hi: {
    dark: "गहरा",
    light: "हल्का",
    darkAria: "गहरी थीम सक्षम करें",
    lightAria: "हल्की थीम सक्षम करें",
  },
};

export function getThemeToggleUiMessages(locale: AppLocale): ThemeToggleUiMessages {
  return THEME_TOGGLE_UI[locale] ?? THEME_TOGGLE_UI[DEFAULT_LOCALE];
}
