"use client";

import { useEffect, useState } from "react";
import { applyTheme, readThemeFromDocument, type ThemeMode } from "@/lib/theme";

const THEME_LABELS: Record<string, { dark: string; light: string; darkAria: string; lightAria: string }> = {
  es: { dark: "Oscuro", light: "Claro", darkAria: "Activar tema oscuro", lightAria: "Activar tema claro" },
  en: { dark: "Dark", light: "Light", darkAria: "Enable dark theme", lightAria: "Enable light theme" },
  pt: { dark: "Escuro", light: "Claro", darkAria: "Ativar tema escuro", lightAria: "Ativar tema claro" },
  fr: { dark: "Sombre", light: "Clair", darkAria: "Activer le thème sombre", lightAria: "Activer le thème clair" },
  de: { dark: "Dunkel", light: "Hell", darkAria: "Dunkles Design aktivieren", lightAria: "Helles Design aktivieren" },
  it: { dark: "Scuro", light: "Chiaro", darkAria: "Attiva tema scuro", lightAria: "Attiva tema chiaro" },
  ja: { dark: "ダーク", light: "ライト", darkAria: "ダークテーマを有効化", lightAria: "ライトテーマを有効化" },
  zh: { dark: "深色", light: "浅色", darkAria: "启用深色主题", lightAria: "启用浅色主题" },
  ko: { dark: "다크", light: "라이트", darkAria: "다크 테마 사용", lightAria: "라이트 테마 사용" },
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [docLang, setDocLang] = useState("es");

  useEffect(() => {
    setTheme(readThemeFromDocument());
    const updateLang = () => setDocLang(document.documentElement.lang || "es");
    updateLang();
    const observer = new MutationObserver(updateLang);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);

  const langKey = docLang.slice(0, 2).toLowerCase();
  const labels = THEME_LABELS[langKey] ?? THEME_LABELS.en;
  const darkLabel = labels.dark;
  const lightLabel = labels.light;
  const darkAria = labels.darkAria;
  const lightAria = labels.lightAria;

  function onToggle() {
    const next: ThemeMode = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="chat-icon-btn"
      onClick={onToggle}
      aria-pressed={theme === "dark"}
      aria-label={theme === "light" ? darkAria : lightAria}
    >
      {theme === "light" ? darkLabel : lightLabel}
    </button>
  );
}
