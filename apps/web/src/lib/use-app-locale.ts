"use client";

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  UI_LOCALE_STORAGE_KEY,
  type AppLocale,
} from "@iching-oracle/i18n";
import { useEffect, useState } from "react";
import { UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";

export type { AppLocale };

/** Same key as home `page.tsx` — imported from `@iching-oracle/i18n`. */
export const LOCALE_STORAGE_KEY = UI_LOCALE_STORAGE_KEY;

function readClientLocale(): AppLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = window.localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
      return raw as AppLocale;
    }
  } catch {
    /* ignore */
  }
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${UI_LOCALE_COOKIE}=([^;]+)`));
  if (match?.[1]) {
    try {
      const cookieLocale = decodeURIComponent(match[1].trim());
      if ((SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
        return cookieLocale as AppLocale;
      }
    } catch {
      /* ignore */
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * Client UI locale aligned with home page (localStorage → cookie → default).
 * Listens for `storage` and `iching:locale-changed` (same event as home `page.tsx`).
 */
export function useAppLocale(): AppLocale {
  const [locale, setLocale] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(readClientLocale());
    const onStorage = (e: StorageEvent) => {
      if (e.key === UI_LOCALE_STORAGE_KEY || e.key === null) {
        setLocale(readClientLocale());
      }
    };
    const onCustom = () => setLocale(readClientLocale());
    window.addEventListener("storage", onStorage);
    window.addEventListener("iching:locale-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("iching:locale-changed", onCustom);
    };
  }, []);

  return locale;
}
