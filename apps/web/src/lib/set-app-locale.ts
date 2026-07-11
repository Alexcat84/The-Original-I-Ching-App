"use client";

import {
  htmlLangFromAppLocale,
  UI_LOCALE_STORAGE_KEY,
  type AppLocale,
} from "@iching-oracle/i18n";
import { UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";

/**
 * Persist the UI locale and broadcast the change — same contract as the chat
 * page (`app/chat/page.tsx`): localStorage + cookie + <html lang/dir> + the
 * `iching:locale-changed` custom event that `useAppLocale`,
 * `SessionDocLocaleBridge` and the RN WebView bridge all listen to.
 */
export function setAppLocale(locale: AppLocale): void {
  try {
    window.localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = htmlLangFromAppLocale(locale);
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.cookie = `${UI_LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent("iching:locale-changed", { detail: { locale } }));
}
