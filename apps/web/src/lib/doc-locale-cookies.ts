/**
 * Cookie names shared by server (`resolveDocLocale`) and client (`SessionDocLocaleBridge`).
 * Keep this module free of `next/headers` so client bundles stay valid.
 */

/** Set client-side when Supabase reports a session; server uses it to pick doc language. */
export const SESSION_PRESENT_COOKIE = "iching_session_present";

/** Mirrors app UI locale (same as home `document.cookie` for `iching_ui_locale`). */
export const UI_LOCALE_COOKIE = "iching_ui_locale";
