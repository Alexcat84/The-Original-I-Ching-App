"use client";

import {
  DEFAULT_LOCALE,
  htmlLangFromAppLocale,
  SUPPORTED_LOCALES,
  UI_LOCALE_STORAGE_KEY,
  type AppLocale,
} from "@iching-oracle/i18n";
import { useEffect } from "react";

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
      document.documentElement.lang = htmlLangFromAppLocale(readLocale());
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
