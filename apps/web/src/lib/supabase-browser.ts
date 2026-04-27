"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/**
 * Auth must use localStorage (not sessionStorage): checkout and other flows open `pay.rev.cat`
 * in a new tab; sessionStorage is per-tab, so the return URL would load the app logged out.
 * On read we migrate any legacy session from sessionStorage into localStorage once.
 */
function createBrowserAuthStorage():
  | {
      getItem: (key: string) => string | null;
      setItem: (key: string, value: string) => void;
      removeItem: (key: string) => void;
    }
  | undefined {
  if (typeof window === "undefined") return undefined;
  return {
    getItem(key: string) {
      try {
        const fromLocal = window.localStorage.getItem(key);
        if (fromLocal) return fromLocal;
        const legacy = window.sessionStorage.getItem(key);
        if (legacy) {
          window.localStorage.setItem(key, legacy);
          window.sessionStorage.removeItem(key);
        }
        return legacy;
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string) {
      try {
        window.localStorage.setItem(key, value);
        window.sessionStorage.removeItem(key);
      } catch {
        /* private mode / quota */
      }
    },
    removeItem(key: string) {
      try {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

/** Browser-only Supabase client (anon key). Session persisted in localStorage (shared across tabs). */
export function getSupabaseBrowser(): SupabaseClient {
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  browserClient = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: createBrowserAuthStorage(),
    },
  });
  if (typeof window !== "undefined") {
    (window as any).__supabase = browserClient; // APK WebView access
  }
  return browserClient;
}

export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
