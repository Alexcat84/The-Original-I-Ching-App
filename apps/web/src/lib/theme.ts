export const THEME_STORAGE_KEY = "iching_theme";

export type ThemeMode = "light" | "dark";

export function readThemeFromDocument(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore quota / private mode
  }
}
