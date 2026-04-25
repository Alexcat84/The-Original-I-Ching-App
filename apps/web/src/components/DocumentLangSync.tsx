"use client";

import {
  DEFAULT_LOCALE,
  htmlLangFromAppLocale,
  SUPPORTED_LOCALES,
  UI_LOCALE_STORAGE_KEY,
  type AppLocale,
} from "@iching-oracle/i18n";
import { UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";
import { useEffect } from "react";

const ONE_YEAR = 60 * 60 * 24 * 365;

function writeUiLocaleCookie(locale: AppLocale) {
  try {
    document.cookie = `${UI_LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  } catch {
    /* */
  }
}

function readLocale(): AppLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
      return raw as AppLocale;
    }
  } catch {
    /* */
  }
  return DEFAULT_LOCALE;
}

/** Keeps `<html lang>` aligned with the in-app locale selector even before cookie consent / auth bridge run. */
export default function DocumentLangSync() {
  useEffect(() => {
    const apply = () => {
      const loc = readLocale();
      document.documentElement.lang = htmlLangFromAppLocale(loc);
      writeUiLocaleCookie(loc);
    };
    apply();
    window.addEventListener("iching:locale-changed", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("iching:locale-changed", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return null;
}
