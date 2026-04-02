"use client";

import { SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { SESSION_PRESENT_COOKIE, UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";
import { useEffect } from "react";

const LOCALE_STORAGE_KEY = "iching_ui_locale_v1";
const ONE_YEAR = 60 * 60 * 24 * 365;

function setSessionPresentCookie(on: boolean) {
  if (on) {
    document.cookie = `${SESSION_PRESENT_COOKIE}=1; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  } else {
    document.cookie = `${SESSION_PRESENT_COOKIE}=; path=/; max-age=0; samesite=lax`;
  }
}

function syncUiLocaleCookieFromStorage() {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
      document.cookie = `${UI_LOCALE_COOKIE}=${encodeURIComponent(raw)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    }
  } catch {
    /* private mode */
  }
}

function applyLocaleCookie(locale: AppLocale) {
  document.cookie = `${UI_LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

/**
 * Keeps cookies in sync so server-rendered doc/legal pages can apply the same rules as the SPA:
 * session flag + UI locale (from storage or in-app changes).
 */
export default function SessionDocLocaleBridge() {
  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      setSessionPresentCookie(false);
      return;
    }
    const sb = getSupabaseBrowser();

    const syncSession = () => {
      void sb.auth.getSession().then(({ data: { session } }) => {
        setSessionPresentCookie(Boolean(session));
        if (session) {
          syncUiLocaleCookieFromStorage();
        }
      });
    };

    syncSession();

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setSessionPresentCookie(Boolean(session));
      if (session) {
        syncUiLocaleCookieFromStorage();
      }
    });

    function onLocaleSynced(e: Event) {
      const detail = (e as CustomEvent<{ locale?: string }>).detail;
      const loc = detail?.locale;
      if (loc && (SUPPORTED_LOCALES as readonly string[]).includes(loc)) {
        applyLocaleCookie(loc as AppLocale);
      }
    }

    window.addEventListener("iching:locale-changed", onLocaleSynced);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("iching:locale-changed", onLocaleSynced);
    };
  }, []);

  return null;
}
