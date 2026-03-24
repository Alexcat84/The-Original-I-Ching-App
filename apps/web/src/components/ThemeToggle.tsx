"use client";

import { useEffect, useState } from "react";
import { applyTheme, readThemeFromDocument, type ThemeMode } from "@/lib/theme";

export function ThemeToggle() {
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
      aria-label={theme === "light" ? "Activar tema oscuro" : "Activar tema claro"}
    >
      {theme === "light" ? "Oscuro" : "Claro"}
    </button>
  );
}
