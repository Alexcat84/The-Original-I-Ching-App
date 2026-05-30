"use client";

import { getThemeToggleUiMessages } from "@iching-oracle/i18n";
import { useEffect, useState } from "react";
import { useAppLocale } from "@/lib/use-app-locale";
import { applyTheme, readThemeFromDocument, type ThemeMode } from "@/lib/theme";

export function ThemeToggle() {
  const locale = useAppLocale();
  const labels = getThemeToggleUiMessages(locale);
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    setTheme(readThemeFromDocument());
  }, []);

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
      aria-label={theme === "light" ? labels.darkAria : labels.lightAria}
    >
      {theme === "light" ? labels.dark : labels.light}
    </button>
  );
}
