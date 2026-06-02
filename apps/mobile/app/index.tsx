import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases, { type PurchasesPackage } from "react-native-purchases";
import { initDb, getCachedChatsForInjection, getPagedThread, getLocalImagePath, softDeleteChat, clearAllData, getSyncMeta, setSyncMeta, type RnCachedChatEntry } from "@/src/db/chat-store";
import { syncChats, syncChatContent } from "@/src/sync/sync-service";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import * as SecureStore from "expo-secure-store";
import * as Sharing from "expo-sharing";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import * as Application from "expo-application";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  DeviceEventEmitter,
  Dimensions,
  type GestureResponderEvent,
  I18nManager,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const OFFLINE_LOGO = require("../assets/logo.png") as number;
// Pack icons — replace placeholder PNGs in assets/ with real artwork before EAS build
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PACK_ICON_SEEKER = require("../assets/pack-seeker.png") as number;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PACK_ICON_PRACTITIONER = require("../assets/pack-practitioner.png") as number;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PACK_ICON_MASTER = require("../assets/pack-master.png") as number;

function cleanProductTitle(title: string): string {
  return title.replace(/\s*\(.*?\)\s*$/, "").trim();
}

function packIconFor(productIdentifier: string): number {
  if (productIdentifier.includes("practitioner")) return PACK_ICON_PRACTITIONER;
  if (productIdentifier.includes("master")) return PACK_ICON_MASTER;
  return PACK_ICON_SEEKER; // seeker + fallback
}

/** Extracts the Supabase user UUID (sub claim) from a JWT without external deps. */
function getUserIdFromJwt(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    // JWT uses base64url (- and _ instead of + and /). atob requires standard base64.
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    const claims = JSON.parse(json) as { sub?: string };
    return typeof claims.sub === "string" && claims.sub.length > 0 ? claims.sub : null;
  } catch {
    return null;
  }
}
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from "react-native-webview";
import {
  DEFAULT_LOCALE,
  UI_LOCALE_STORAGE_KEY,
  getMobileNativeUiMessages,
  type AppLocale,
} from "@iching-oracle/i18n";

const STAGING_WEB_FALLBACK =
  "https://the-original-i-ching-app-git-staging-alexs-projects-e8bf95b4.vercel.app";


/** Same URL as app.config.js `extra.apiUrl` (set at native build). Prefer this over Metro-inlined env to avoid .env vs APK mismatch. */
function resolveWebBaseUrl(): string {
  const extra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  const fromExtra = typeof extra === "string" ? extra.trim().replace(/\/$/, "") : "";
  if (fromExtra.length > 0) return fromExtra;
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_API_URL === "string"
      ? process.env.EXPO_PUBLIC_API_URL.trim().replace(/\/$/, "")
      : "";
  if (fromEnv.length > 0) return fromEnv;
  return STAGING_WEB_FALLBACK;
}

const BASE_URL = resolveWebBaseUrl();

/**
 * Paths where the WebView should perform a normal navigation (not SPA-injected).
 * Next.js App Router does not reliably handle `history.pushState` + synthetic `popstate`
 * for these routes; cancelling the request (`return false`) + `__rnNavigateTo` left the
 * shell stuck when opening /guia#faqs, /guia#rn-app-trace-root, etc. from the composer.
 */
function isPublicDocInternalPath(path: string): boolean {
  const pathOnly = (path.split("#")[0] ?? "").split("?")[0] ?? "";
  const n = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return (
    n === "/faqs" ||
    n === "/about" ||
    n === "/guia" ||
    n.startsWith("/guia/") ||
    n === "/notes" ||
    n.startsWith("/notes/") ||
    n === "/privacy" ||
    n === "/terms" ||
    n.startsWith("/documentacion")
  );
}

// Supabase project — needed to construct the Google OAuth URL from native side.
// IMPORTANT: Add "theoriginaliching://auth/callback" to your Supabase project's
// Auth > URL Configuration > Redirect URLs for Google OAuth deep-link to work.
// Both EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set in apps/mobile/.env.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set in apps/mobile/.env",
  );
}

const SECURE_TOKEN_KEY = "supabase_access_token";
const LOCALE_STORAGE_KEY = "iching_native_locale";

const LOCALES: { code: AppLocale; label: string; name: string }[] = [
  { code: "es", label: "ES", name: "Español" },
  { code: "en", label: "EN", name: "English" },
  { code: "pt", label: "PT", name: "Português" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "it", label: "IT", name: "Italiano" },
  { code: "ja", label: "JA", name: "日本語" },
  { code: "zh", label: "ZH", name: "中文" },
  { code: "ko", label: "KO", name: "한국어" },
  { code: "ar", label: "AR", name: "العربية" },
  { code: "hi", label: "HI", name: "हिन्दी" },
];

const RTL_LOCALES = new Set<AppLocale>(["ar"]);

const SUPPORTED_LOCALE_CODES_JSON = JSON.stringify(LOCALES.map((l) => l.code));

/**
 * After SPA navigation / load, do not blindly push native `localeRef` into the WebView:
 * the user may have chosen a language only in the web UI (`UI_LOCALE_STORAGE_KEY`), while
 * native state can still be default `en` until AsyncStorage resolves — that was overwriting
 * Korean/Chinese/etc. on every `onNavigationStateChange`.
 */
function buildSyncLocaleFromWebOrNativeScript(nativeFallback: AppLocale): string {
  const storageKey = JSON.stringify(UI_LOCALE_STORAGE_KEY);
  const fallback = JSON.stringify(nativeFallback);
  return `(function(){try{var k=${storageKey};var w=localStorage.getItem(k);var codes=${SUPPORTED_LOCALE_CODES_JSON};if(w&&codes.indexOf(w)!==-1){window.__rnSetLocale&&window.__rnSetLocale(w);return;}}catch(_){}window.__rnSetLocale&&window.__rnSetLocale(${fallback});})();true;`;
}

/**
 * Layout debug — APK only; does not touch apps/web source.
 * - Native: colored borders on root / top bar / WebView wrapper.
 * - WebView: extra injected stylesheet with outlines on main chat DOM selectors.
 *
 * `assembleRelease` → __DEV__ is false → no outlines (Play-ready).
 * `assembleDebug` → __DEV__ is true → outlines on so you can verify layers without editing flags.
 * For a one-off diagnostic *release* APK, temporarily set both to `true` and rebuild release.
 */
const DEBUG_NATIVE_CHAT_SHELL_RECTS = __DEV__;
const DEBUG_WEBVIEW_CHAT_DOM_OUTLINES = __DEV__;

/** Converts an incoming deep link back to the web URL so the WebView can complete auth. */
function deepLinkToWebUrl(deepLink: string): string | null {
  try {
    const parsed = Linking.parse(deepLink);
    if (parsed.hostname === "auth" && parsed.path?.startsWith("/callback")) {
      const params = new URLSearchParams(
        Object.entries(parsed.queryParams ?? {}).map(([k, v]) => [k, String(v)])
      );
      return `${BASE_URL}/auth/callback?${params.toString()}`;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * JavaScript injected into every WebView page.
 *
 * Responsibilities:
 *  1. Web auth/locale strip (.auth-explore-strip) is visible in the WebView (no native duplicate bar)
 *  2. Lock viewport zoom (zoom on chat images is handled natively)
 *  3. Intercept <a download> clicks AND native click events (images & PDFs)
 *  4. Patch Google OAuth button → postMessage to RN (opens in external browser)
 *  5. Extract & relay Supabase access token + email → RN stores in SecureStore
 *     (fast retries to avoid brief "limit reached" flash on navigation — P1)
 *  6. Intercept DELETE /api/account/chats → RN executes with stored token
 *  7. Expose __rnSetLocale() so RN can change the web app locale
 *  8. Expose __rnSignOut() for the web session strip (native bar removed)
 *  9. Expose __rnNavigateTo() for SPA navigation without full reload
 * 10. Intercept taps on generated chat images → postMessage to open native zoom modal
 * 11. Expose __RN_APP_INFO and fill /about trace cells (#rn-trace-*) from the native shell
 */
/** Prefer manifest/Gradle values — `expoConfig` embedded in the JS bundle can stay stale after only editing build.gradle. */
function resolveRnAppInfoForWeb(): { version: string; androidVersionCode: number | null } {
  const nativeVer = Application.nativeApplicationVersion?.trim();
  if (nativeVer && nativeVer.length > 0) {
    const buildStr = Application.nativeBuildVersion?.trim();
    const parsed = buildStr && buildStr.length > 0 ? parseInt(buildStr, 10) : NaN;
    return {
      version: nativeVer,
      androidVersionCode: Number.isFinite(parsed) ? parsed : null,
    };
  }
  return {
    version: String(Constants.expoConfig?.version ?? ""),
    androidVersionCode:
      (Constants.expoConfig?.android as { versionCode?: number } | undefined)?.versionCode ?? null,
  };
}

const RN_APP_INFO_FOR_WEB = JSON.stringify(resolveRnAppInfoForWeb());

const INJECTED_JS = `
(function () {
  try {
    window.__RN_APP_INFO = ${RN_APP_INFO_FOR_WEB};
  } catch (_) {}
  if (window.__rnBridgeInstalled) return;
  window.__rnBridgeInstalled = true;
  document.documentElement.classList.add('iching-rn-webview');

  /* 1 ── Layout parity + neutralize vertical gaps (P7 — DEBUG + v4 fix) */
  var _st = document.createElement('style');
  _st.textContent = [
    /* Chat-only: locking overflow on html/body breaks /guia, /notes, etc. (no .iching-oracle-shell--chat). */
    'html.iching-rn-webview:has(.iching-oracle-shell--chat){height:100%!important;min-height:100%!important;overflow:hidden!important}',
    'html.iching-rn-webview:has(.iching-oracle-shell--chat) body{height:100%!important;min-height:100%!important;max-height:none!important;margin:0!important;padding:0!important;overflow:hidden!important}',
    'html.iching-rn-webview:not(:has(.iching-oracle-shell--chat)){height:auto!important;min-height:100%!important}',
    'html.iching-rn-webview:not(:has(.iching-oracle-shell--chat)) body{height:auto!important;min-height:100%!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;margin:0!important;padding:0!important;padding-bottom:max(0.75rem,var(--rn-safe-area-inset-bottom, 0px))!important}',
    '.iching-oracle-shell--chat{height:100%!important;min-height:100%!important;max-height:none!important;overflow:hidden!important;padding:0!important;margin:0!important;background:transparent!important}',
    /* Layout parity with latest globals.css — APK must not depend on stale CDN/CSS deploy */
    '.iching-oracle-shell--chat > *:only-child{flex:1 1 0%!important;min-height:0!important;align-self:stretch!important;display:flex!important;flex-direction:column!important;max-width:none!important;padding:0!important}',
    '.oracle-chat-app{flex:1 1 0%!important;min-height:0!important;align-self:stretch!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;position:relative!important;isolation:isolate!important}',
    /* .chat-surface: base layout; do NOT force square top when .chat-surface--explore-cap (auth strip rounds like former native card) */
    '.chat-surface{margin-top:0!important;margin-bottom:calc(0.25rem + max(18px, var(--rn-safe-area-inset-bottom, 0px)))!important;padding:0!important;flex:1 1 0%!important;align-self:stretch!important;min-width:0!important;min-height:0!important;border-radius:0 0 clamp(26px,5.5vw,38px) clamp(26px,5.5vw,38px)!important}',
    'html.iching-rn-webview .chat-surface.chat-surface--explore-cap{border-radius:clamp(26px,5.5vw,38px)!important}',
    'html.iching-rn-webview .chat-surface--explore-cap>.auth-explore-strip:first-child{border-top-left-radius:clamp(26px,5.5vw,38px)!important;border-top-right-radius:clamp(26px,5.5vw,38px)!important}',
    /* Stale web deploy: hide legacy "Language" label; restyle strip like native chrome */
    'html.iching-rn-webview .locale-control>span{display:none!important}',
    'html.iching-rn-webview[data-theme=dark] .auth-explore-strip{background:#080808!important;border-bottom:1px solid rgba(201,162,39,.22)!important;color:rgba(255,255,255,.72)!important}',
    'html.iching-rn-webview[data-theme=light] .auth-explore-strip{background:#d4ebf5!important;border-bottom:1px solid rgba(15,23,42,.1)!important;color:rgba(15,23,42,.62)!important}',
    'html.iching-rn-webview[data-theme=dark] .auth-explore-strip .locale-picker-trigger{min-width:4.25rem!important;min-height:28px!important;padding:5px 10px 5px 12px!important;border-radius:14px!important;border:1px solid rgba(201,162,39,.4)!important;font-size:13px!important;font-weight:700!important;letter-spacing:.5px!important;color:#c9a227!important;background:rgba(201,162,39,.06)!important;display:inline-flex!important;align-items:center!important;gap:.35rem!important;font-family:inherit!important}',
    'html.iching-rn-webview[data-theme=light] .auth-explore-strip .locale-picker-trigger{min-width:4.25rem!important;min-height:28px!important;padding:5px 10px 5px 12px!important;border-radius:14px!important;border:1px solid rgba(13,148,136,.45)!important;font-size:13px!important;font-weight:700!important;letter-spacing:.5px!important;color:#0f766e!important;background:rgba(255,255,255,.75)!important;display:inline-flex!important;align-items:center!important;gap:.35rem!important;font-family:inherit!important}',
    'html.iching-rn-webview .locale-picker-menu{z-index:260!important;min-width:11.5rem!important;border-radius:12px!important}',
    'html.iching-rn-webview[data-theme=dark] .locale-picker-menu{background:#161a22!important;border:1px solid rgba(201,162,39,.25)!important}',
    'html.iching-rn-webview[data-theme=light] .locale-picker-menu{background:#f8fafc!important;border:1px solid rgba(15,23,42,.12)!important}',
    'html.iching-rn-webview[data-theme=dark] .auth-explore-strip a.auth-explore-strip-cta{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:5px 13px!important;border-radius:14px!important;border:1px solid rgba(201,162,39,.35)!important;background:rgba(201,162,39,.08)!important;color:#c9a227!important;font-size:12px!important;font-weight:600!important;box-shadow:none!important;background-image:none!important}',
    'html.iching-rn-webview[data-theme=light] .auth-explore-strip a.auth-explore-strip-cta{display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:5px 13px!important;border-radius:14px!important;border:1px solid rgba(13,148,136,.4)!important;background:rgba(13,148,136,.1)!important;color:#0f766e!important;font-size:12px!important;font-weight:600!important;box-shadow:none!important;background-image:none!important}',
    'html.iching-rn-webview[data-theme=dark] .auth-explore-strip--session .auth-explore-strip-signout{border-radius:10px!important;padding:4px 7px!important;font-size:11px!important;font-weight:700!important;border:1px solid rgba(201,162,39,.25)!important;background:rgba(201,162,39,.08)!important;color:rgba(201,162,39,.6)!important;min-height:auto!important}',
    'html.iching-rn-webview[data-theme=light] .auth-explore-strip--session .auth-explore-strip-signout{border-radius:10px!important;padding:4px 7px!important;font-size:11px!important;font-weight:700!important;border:1px solid rgba(15,23,42,.12)!important;background:rgba(255,255,255,.6)!important;color:rgba(15,23,42,.5)!important;min-height:auto!important}',
    'html.iching-rn-webview .auth-explore-strip-tier{display:none!important}',
    'html.iching-rn-webview .auth-explore-strip--session{display:flex!important;flex-wrap:nowrap!important;justify-content:space-between!important;align-items:center!important;min-height:2.65rem!important;overflow:visible!important}',
    'html.iching-rn-webview .auth-explore-strip-session__lead{flex:0 0 auto!important;display:flex!important;align-items:center!important;min-width:0!important}',
    'html.iching-rn-webview .auth-explore-strip--session .auth-explore-strip-email{flex:1 1 0!important;min-width:0!important;max-width:none!important}',
    '.chat-room{flex:1 1 0%!important;min-height:0!important}',
    '.chat-history{flex:1 1 0%!important;min-height:0!important;padding-bottom:0!important}',
    '.chat-app-bar-row--top{padding-top:0!important;padding-bottom:0!important}',
    'header.oracle-intro{margin-top:0!important;padding-top:0!important}',
    '.composer-dock{position:relative!important;padding-bottom:0!important}',
    '.composer-sheet{position:absolute!important;left:0!important;right:0!important;bottom:100%!important;z-index:58!important;max-height:0!important;min-height:0!important;overflow:hidden!important;pointer-events:none!important;transition:max-height 0.28s ease!important;border-bottom:1px solid transparent!important}',
    '.composer-sheet.is-open{max-height:min(52vh,26rem)!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain!important;pointer-events:auto!important;background:var(--composer-bg)!important;border-top-left-radius:calc(var(--radius) * 0.55)!important;border-top-right-radius:calc(var(--radius) * 0.55)!important;box-shadow:0 10px 28px color-mix(in srgb,var(--fg) 6%,transparent)!important}',
    '@media (max-width:520px){.composer-minibar{padding-top:0.28rem!important;padding-left:0.55rem!important;padding-right:0.55rem!important;padding-bottom:calc(0.25rem + max(14px, var(--rn-safe-area-inset-bottom, 0px)))!important;gap:0.35rem!important;align-items:center!important}.composer-minibar .composer-input-row{gap:0.35rem!important;margin-top:0!important}.composer-minibar .composer-input-row textarea{min-height:2.08rem!important;padding:0.42rem 0.72rem!important;font-size:0.92rem!important}.composer-minibar .composer-input-row>button{width:2.42rem!important;height:2.42rem!important;font-size:1rem!important}.composer-options-btn{min-width:2.7rem!important;padding:0.24rem 0.26rem!important;border-radius:18px!important}}',
    'html.iching-rn-webview footer.chat-composer-wa{padding-bottom:0!important}',
    'html.iching-rn-webview .composer-minibar{padding-bottom:0.42rem!important}',
    /* Match globals: RN chat width was still capped by 34–40rem bubbles + 40–48rem surface (wide side margins). */
    'html.iching-rn-webview .chat-surface{max-width:min(120rem,calc(100vw - 0.35rem))!important}',
    '@media (min-width:480px){html.iching-rn-webview .chat-surface{max-width:min(120rem,calc(100vw - 0.55rem))!important}}',
    '@media (min-width:768px){html.iching-rn-webview .chat-surface{max-width:min(120rem,calc(100vw - 0.75rem))!important}}',
    'html.iching-rn-webview .chat-history{padding-left:0.42rem!important;padding-right:0.42rem!important}',
    'html.iching-rn-webview .chat-bubble,html.iching-rn-webview .chat-bubble.chat-user,html.iching-rn-webview .chat-bubble.chat-assistant{max-width:100%!important}',
    'html.iching-rn-webview .chat-empty-hint,html.iching-rn-webview .credits-notice-card,html.iching-rn-webview .chat-error-bubble{max-width:min(100%,calc(100vw - 1.1rem))!important}',
    /* Legal consent modal: keep it above WebView chrome and avoid injected chat sizing from crushing it. */
    'html.iching-rn-webview .legal-consent-backdrop{z-index:2147483000!important;padding:max(.75rem,env(safe-area-inset-top,0px)) .75rem max(.75rem,var(--rn-safe-area-inset-bottom,0px))!important}',
    'html.iching-rn-webview .legal-consent-modal{max-height:calc(100vh - 1.5rem)!important;width:100%!important}',
    'html.iching-rn-webview .legal-consent-scroll{overscroll-behavior:contain!important;-webkit-overflow-scrolling:touch!important}',
    /* Chat drawer: non-scrollable spacer at the bottom of the drawer's flex column.
       Targeting .chat-drawer (not .chat-drawer-list) makes this a flex sibling, which
       reduces .chat-drawer-list (flex:1) so the scroll area ends above the Android nav bar.
       A spacer inside the scroll container only adds scrollable whitespace — it does not
       shorten the visible scroll boundary, so the last item stays covered by the nav bar. */
    'html.iching-rn-webview .chat-drawer::after{content:"";display:block;flex-shrink:0!important;min-height:max(20px, var(--rn-safe-area-inset-bottom, 20px))!important}',
    /* Hide Vercel preview toolbar — staging deployments inject a floating Vercel icon that confuses testers */
    'vercel-toolbar,#__vercel-toolbar,.__vercel-toolbar,div[id*="vercel-toolbar"],iframe[src*="vercel.live"]{display:none!important}'
  ].join(';');
  (document.head || document.documentElement).appendChild(_st);
  // Debug: confirm injection worked
  setTimeout(function(){if(window.ReactNativeWebView){var s=_st.textContent.replace(/!/g,'I');window.ReactNativeWebView.postMessage('CSS_INJECTED_OK|'+s.slice(0,200));}},1500);

  /* 1b ── Android WebView / API 35: dvh/vh and visualViewport can disagree → letterboxing.
          Use max(innerHeight, visualViewport.height), re-sync after shell mounts (SPA/hydration). */
  function _rnSyncShellToViewport() {
    try {
      var shell = document.querySelector('.iching-oracle-shell--chat');
      if (!shell) {
        document.documentElement.style.height = '';
        document.documentElement.style.minHeight = '';
        document.body.style.minHeight = '';
        document.body.style.height = '';
        return;
      }
      var vv = window.visualViewport;
      var inner = typeof window.innerHeight === 'number' ? window.innerHeight : 0;
      var vvH = vv && typeof vv.height === 'number' ? vv.height : 0;
      var h = Math.max(inner, vvH);
      if (!h || h < 200) return;
      document.documentElement.style.height = h + 'px';
      document.body.style.minHeight = h + 'px';
      shell.style.minHeight = h + 'px';
      shell.style.height = h + 'px';
      shell.style.maxHeight = 'none';
    } catch (_) {}
  }
  var _rnVpRaf = null;
  function _rnScheduleViewportSync() {
    if (_rnVpRaf != null) return;
    _rnVpRaf = requestAnimationFrame(function () {
      _rnVpRaf = null;
      _rnSyncShellToViewport();
    });
  }
  _rnScheduleViewportSync();
  window.addEventListener('resize', _rnScheduleViewportSync);
  window.addEventListener('orientationchange', _rnScheduleViewportSync);
  window.addEventListener('popstate', _rnScheduleViewportSync);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', _rnScheduleViewportSync);
    window.visualViewport.addEventListener('scroll', _rnScheduleViewportSync);
  }
  if (!window.__rnShellViewportMo) {
    window.__rnShellViewportMo = new MutationObserver(function () {
      _rnScheduleViewportSync();
    });
    window.__rnShellViewportMo.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
  [0, 100, 300, 800, 2000].forEach(function (ms) {
    setTimeout(_rnScheduleViewportSync, ms);
  });

  /* 2 ── Lock viewport zoom and keep it locked (P3) ──────────────────── */
  function _lockZoom() {
    var vp = document.querySelector('meta[name="viewport"]');
    if (!vp) {
      vp = document.createElement('meta');
      vp.setAttribute('name', 'viewport');
      (document.head || document.documentElement).appendChild(vp);
    }
    var locked = 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no, maximum-scale=1';
    if (vp.getAttribute('content') !== locked) vp.setAttribute('content', locked);
  }
  function _watchZoom() {
    // Re-apply whenever Next.js or the page updates the viewport meta
    new MutationObserver(function(ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === 'attributes' && m.target.getAttribute &&
            m.target.getAttribute('name') === 'viewport') { _lockZoom(); return; }
        for (var j = 0; j < (m.addedNodes || []).length; j++) {
          var n = m.addedNodes[j];
          if (n.tagName === 'META' && n.getAttribute &&
              n.getAttribute('name') === 'viewport') { _lockZoom(); return; }
        }
      }
    }).observe(document.documentElement, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['content', 'name']
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { _lockZoom(); _watchZoom(); });
  } else {
    _lockZoom(); _watchZoom();
  }

  /* 3a ── Blob cache — fixes jsPDF "revoke before read" race (P2) ──────── */
  // jsPDF calls URL.revokeObjectURL synchronously right after link.click(),
  // so we must cache the Blob object before the URL is revoked.
  var _blobCache = {};
  var _origCreateObjURL = URL.createObjectURL;
  URL.createObjectURL = function(blob) {
    var url = _origCreateObjURL.call(URL, blob);
    if (blob instanceof Blob) { _blobCache[url] = blob; }
    return url;
  };
  var _origRevokeObjURL = URL.revokeObjectURL;
  URL.revokeObjectURL = function(url) {
    // Delay actual revoke so async FileReader has time to finish
    setTimeout(function() {
      delete _blobCache[url];
      _origRevokeObjURL.call(URL, url);
    }, 2000);
  };

  /* 3b ── Download helper ─────────────────────────────────────────────── */
  function _postDownload(filename, dataUrl) {
    var payload = dataUrl || '';
    var maxInline = 180000;
    if (payload.length <= maxInline) {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'download_file', filename: filename, dataUrl: payload })
      );
      return;
    }
    var m = payload.match(/^data:([^;]+);base64,(.*)$/);
    if (!m) {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'download_file', filename: filename, dataUrl: payload })
      );
      return;
    }
    var mimeType = m[1] || 'application/octet-stream';
    var b64 = m[2] || '';
    var transferId = 'dl_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'download_file_start', transferId: transferId, filename: filename, mimeType: mimeType })
    );
    var chunkSize = 120000;
    for (var i = 0; i < b64.length; i += chunkSize) {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'download_file_chunk',
          transferId: transferId,
          chunk: b64.slice(i, i + chunkSize)
        })
      );
    }
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'download_file_end', transferId: transferId })
    );
  }

  function _handleDownload(href, filename) {
    if (href.indexOf('data:') === 0) { _postDownload(filename, href); return; }
    var readBlob = function(blob) {
      var rd = new FileReader();
      rd.onloadend = function() { if (rd.result) _postDownload(filename, rd.result); };
      rd.readAsDataURL(blob);
    };
    // Use cached Blob directly — avoids fetch on a revoked blob: URL
    if (href.indexOf('blob:') === 0 && _blobCache[href]) { readBlob(_blobCache[href]); return; }
    fetch(href)
      .then(function(r) { return r.blob(); })
      .then(readBlob)
      .catch(function() {});
  }

  // Patch .click() on anchor elements
  var _origAClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.download && this.href) {
      _handleDownload(this.href, this.download || 'download');
      return;
    }
    _origAClick.call(this);
  };
  // jsPDF/FileSaver often dispatches synthetic click events on detached anchors.
  // Intercept dispatchEvent too, otherwise document-level listeners never see it.
  var _origADispatch = HTMLAnchorElement.prototype.dispatchEvent;
  HTMLAnchorElement.prototype.dispatchEvent = function (evt) {
    if (evt && evt.type === 'click' && this.download && this.href) {
      _handleDownload(this.href, this.download || 'download');
      return true;
    }
    return _origADispatch.call(this, evt);
  };

  // Also intercept native user taps on download links (P5 — PDF export)
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a[download]') : null;
    if (!el || !el.href) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    _handleDownload(el.href, el.download || 'download');
  }, true);

  /* 4 ── Google OAuth: handled natively by Supabase SDK (see onShouldStartLoadWithRequest).
          We no longer intercept the button click here because doing so bypasses the SDK's
          PKCE flow — the code verifier would never be stored, so the callback exchange
          would always fail. The navigation intercept in RN replaces redirect_to instead. */

  /* 5 ── Relay Supabase access token + email (P1 — fast retries) ──────── */
  function _sendToken() {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key) continue;
      if (key.indexOf('auth-token') === -1 && key.indexOf('supabase.auth.token') === -1) continue;
      try {
        var d = JSON.parse(localStorage.getItem(key) || 'null');
        if (!d) continue;
        var session = d.currentSession || d;
        var tok = session.access_token || d.access_token;
        var email = (session.user && session.user.email) || (d.user && d.user.email) || null;
        if (tok) {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'auth_token', token: tok, email: email })
          );
          return true;
        }
      } catch (_) {}
    }
    return false;
  }

  /* 5b ── Override localStorage.setItem to detect same-window auth writes ─── */
  // The 'storage' event only fires in OTHER tabs/windows. Supabase writes the session
  // to localStorage from within this same WebView after login, so the storage listener
  // below is deaf to it. Intercepting setItem directly fixes the gap.
  // Separate path for the PKCE verifier: relay it to native BEFORE the SDK navigates
  // to the Supabase authorize URL, so native can complete the exchange independently.
  var _origLSSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value) {
    _origLSSetItem(key, value);
    if (key.indexOf('auth-code-verifier') !== -1) {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'pkce_verifier', verifier: value })
      );
    } else if (key.indexOf('auth-token') !== -1 || key.indexOf('supabase') !== -1 || key.startsWith('sb-')) {
      setTimeout(_sendToken, 50);
    }
  };

  // Try immediately; retry quickly for delayed Supabase hydration.
  // Do NOT auto-signout on startup misses: that creates false auth churn in WebView.
  if (!_sendToken()) {
    setTimeout(function () {
      if (!_sendToken()) {
        setTimeout(function () {
          if (!_sendToken()) {
            setTimeout(function () {
              _sendToken();
            }, 500);
          }
        }, 400);
      }
    }, 150);
  }

  // Re-check when localStorage changes (sign-in / sign-out events)
  // When a Supabase auth key is cleared, notify native immediately (P1 fix)
  window.addEventListener('storage', function(e) {
    var k = e.key || '';
    var isAuthKey = k.indexOf('auth-token') !== -1 || k.indexOf('supabase') !== -1 || k.startsWith('sb-');
    if (!isAuthKey) return;
    if (!_sendToken()) {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'auth_signout' })
      );
    }
  });
  // Re-check when returning via back-forward cache (P1)
  window.addEventListener('pageshow', function (e) { if (e.persisted) _sendToken(); });
  // Re-check when tab becomes visible (P1)
  window.addEventListener('visibilitychange', function () { if (!document.hidden) _sendToken(); });

  /* 6 ── Intercept DELETE /api/account/chats (P6) ─────────────────────── */
  window.__rnPendingDel = {};
  window.__rnDelResponse = function (reqId, ok, status) {
    var cb = window.__rnPendingDel[reqId];
    if (!cb) return;
    delete window.__rnPendingDel[reqId];
    if (ok) {
      cb(new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { 'Content-Type': 'application/json' }
      }));
    } else {
      cb(new Response(JSON.stringify({ error: 'delete_failed' }), {
        status: status || 500, headers: { 'Content-Type': 'application/json' }
      }));
    }
  };
  var _origFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (init && init.method === 'DELETE' && url.indexOf('/api/account/chats') !== -1) {
      return new Promise(function (resolve) {
        var id = 'rnd_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        window.__rnPendingDel[id] = resolve;
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'delete_chat', url: url, reqId: id })
        );
        setTimeout(function () {
          if (window.__rnPendingDel[id]) {
            delete window.__rnPendingDel[id];
            resolve(new Response('timeout', { status: 504 }));
          }
        }, 12000);
      });
    }
    return _origFetch.apply(this, arguments);
  };

  /* 7 ── Locale setter callable from RN (home + /login + any useAppLocale page) */
  window.__rnSetLocale = function (locale) {
    try {
      var storageKey = ${JSON.stringify(UI_LOCALE_STORAGE_KEY)};
      localStorage.setItem(storageKey, locale);
      if (document.documentElement) document.documentElement.lang = locale;
      document.cookie =
        'iching_ui_locale=' +
        encodeURIComponent(locale) +
        '; path=/; max-age=31536000; samesite=lax';
      window.dispatchEvent(
        new CustomEvent('iching:locale-changed', { detail: { locale: locale } })
      );
      var sel = document.getElementById('ui-locale-select');
      if (sel && sel.tagName === 'SELECT') {
        sel.value = locale;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (e) {}
  };

  var _rnSupportedLocaleCodes = ${SUPPORTED_LOCALE_CODES_JSON};
  function _rnNormalizeLocale(locale) {
    return typeof locale === 'string' ? locale.toLowerCase() : '';
  }
  function _rnIsSupportedLocale(locale) {
    return _rnSupportedLocaleCodes.indexOf(locale) !== -1;
  }
  // Bridge web locale updates back to RN.
  window.__rnReportLocale = function (locale) {
    try {
      var normalized = _rnNormalizeLocale(locale);
      if (!_rnIsSupportedLocale(normalized)) return;
      window.ReactNativeWebView &&
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'locale_changed', locale: normalized })
        );
    } catch (e) {}
  };
  if (!window.__rnLocaleBridgeInstalled) {
    window.__rnLocaleBridgeInstalled = true;
    window.addEventListener('iching:locale-changed', function (event) {
      var nextLocale = event && event.detail ? event.detail.locale : null;
      window.__rnReportLocale && window.__rnReportLocale(nextLocale);
    });
  }
  try {
    var _rnInitialLocale = localStorage.getItem(${JSON.stringify(UI_LOCALE_STORAGE_KEY)});
    window.__rnReportLocale && window.__rnReportLocale(_rnInitialLocale);
  } catch (e) {}

  /* 7b ── Report data-theme to native chrome (light/dark) ───────────────── */
  function _rnReadShellTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark'
      ? 'dark'
      : 'light';
  }
  function _rnPostShellTheme() {
    try {
      var t = _rnReadShellTheme();
      window.ReactNativeWebView &&
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'shell_theme', theme: t })
        );
    } catch (e) {}
  }
  _rnPostShellTheme();
  if (!window.__rnShellThemeMo) {
    window.__rnShellThemeMo = new MutationObserver(_rnPostShellTheme);
    window.__rnShellThemeMo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  /* 8 ── Sign-out callable from RN native bar (P3) ─────────────────────── */
  window.__rnSignOut = function () {
    // Clear Supabase auth keys from both storages. The custom auth adapter in
    // supabase-browser.ts reads sessionStorage as a legacy fallback, so both
    // must be wiped to prevent the client from re-hydrating the session.
    var _clearAuth = function(store) {
      for (var i = store.length - 1; i >= 0; i--) {
        var k = store.key(i);
        if (k && (k.indexOf('auth-token') !== -1 || k.indexOf('supabase') !== -1 || k.startsWith('sb-'))) {
          store.removeItem(k);
        }
      }
    };
    _clearAuth(localStorage);
    _clearAuth(sessionStorage);
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'auth_signout' })
    );
    // Navigate to /login?rn_signout=1 — the rn_signout param signals onShouldStartLoadWithRequest
    // to allow a hard reload (bypassing the SPA navigation intercept that would otherwise
    // keep the Supabase singleton alive in memory, leaving the session active).
    window.location.href = window.location.origin + '/login?rn_signout=1';
  };

  /* 9 ── SPA navigation to avoid full reload (P1) ─────────────────────── */
  window.__rnNavigateTo = function (path) {
    try {
      if (window.next && window.next.router) {
        window.next.router.push(path);
      } else {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    } catch (e) {
      window.location.href = path;
    }
  };
  // Force account refresh after auth/navigation to avoid stale session_limit=1 flashes.
  window.__rnForceAccountRefresh = function () {
    try { window.dispatchEvent(new Event('iching:account-refresh')); } catch (_) {}
  };

  /* 9b ── Inject Supabase session from native PKCE exchange ────────────── */
  // Called by native after exchanging the OAuth code server-side. Writes the session
  // to localStorage in Supabase v2 format using _origLSSetItem (bypasses our override
  // to avoid a false auth_token ping — native already has the token). Then navigates
  // to root so the Supabase singleton re-initializes and picks up the session.
  // Direct localStorage writes alone don't trigger Supabase's onAuthStateChange.
  window.__rnInjectSession = function(session) {
    var supaInstance = window.__supabase;
    if (supaInstance && supaInstance.auth && supaInstance.auth.setSession) {
      supaInstance.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token || ''
      }).then(function() {
        window.__rnForceAccountRefresh && window.__rnForceAccountRefresh();
      });
    }
  };

  /* 10 ── Intercept taps on generated chat images ─────────────────────── */
  function _patchImages() {
    // Exact selectors matching ReadingOracleImage component classes
    var sel = [
      'img.oracle-image',
      'img.reading-visual-thumb',
      'img[data-testid="consultation-image"]',
      '.reading-visual-pane img',
      // Legacy / fallback selectors
      '.chat-message img',
      '.ai-response img',
      '.message-content img',
      'img[data-generated]',
      'img[src*="supabase.co/storage"]',
    ].join(', ');
    document.querySelectorAll(sel).forEach(function(img) {
      if (img.dataset.rnZoom) return;
      img.dataset.rnZoom = '1';
      img.addEventListener('click', function(e) {
        var src = img.currentSrc || img.src;
        if (!src || src.startsWith('blob:') || src.startsWith('data:')) return;
        e.preventDefault();
        e.stopPropagation();
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'open_image', url: src })
        );
      }, true);
    });
  }
  _patchImages();
  new MutationObserver(_patchImages).observe(document.documentElement, { childList: true, subtree: true });

  /* 12 ── Intercept window.alert / confirm / prompt ───────────────────── */
  var _origAlert = window.alert;
  window.alert = function(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'web_alert', message: String(msg === undefined ? '' : msg) })
      );
    } else {
      _origAlert && _origAlert.call(window, msg);
    }
  };
  var _origConfirm = window.confirm;
  window.confirm = function(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'web_confirm', message: String(msg === undefined ? '' : msg) })
      );
      return true;
    }
    return _origConfirm ? _origConfirm.call(window, msg) : true;
  };
  var _origPrompt = window.prompt;
  window.prompt = function(msg, defaultVal) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'web_prompt', message: String(msg === undefined ? '' : msg), defaultValue: String(defaultVal === undefined ? '' : defaultVal) })
      );
      return null;
    }
    return _origPrompt ? _origPrompt.call(window, msg, defaultVal) : null;
  };

  /* 10b ── Intercept "Abrir imagen" button (.reading-visual-zoom-link) ── */
  // Belt-and-suspenders: also intercept the wrapper button around oracle images.
  // This fires when the user taps the button area outside the img itself.
  function _patchZoomLinks() {
    document.querySelectorAll('.reading-visual-zoom-link:not([data-rn-zl])').forEach(function(btn) {
      btn.setAttribute('data-rn-zl', '1');
      btn.addEventListener('click', function(e) {
        var img = btn.querySelector('img');
        if (!img) return;
        var src = img.currentSrc || img.src || img.getAttribute('src');
        // Only intercept if we have a real http(s) URL — let data/blob fall through
        if (!src || !src.match(/^https?:/)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'open_image', url: src })
        );
      }, true);
    });
  }
  _patchZoomLinks();
  new MutationObserver(_patchZoomLinks).observe(document.documentElement, { childList: true, subtree: true });

  /* 3c ── Patch window.open — handle blob/data URLs for images & PDFs ─── */
  // openFullImage() calls window.open(blobUrl) which is a no-op in WebView.
  // We intercept blob: opens, read from _blobCache, and route to native.
  var _origWindowOpen = window.open;
  window.open = function(url, target, features) {
    var urlStr = url ? String(url) : '';
    if (urlStr.indexOf('blob:') === 0) {
      var cachedBlob = _blobCache[urlStr];
      if (cachedBlob) {
        var rd = new FileReader();
        rd.onloadend = function() {
          if (!rd.result) return;
          var isImg = cachedBlob.type.indexOf('image') !== -1;
          var isPdf = cachedBlob.type.indexOf('pdf') !== -1;
          if (isImg) {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
              JSON.stringify({ type: 'open_image', url: rd.result })
            );
          } else if (isPdf) {
            _postDownload('consulta-i-ching.pdf', rd.result);
          }
        };
        rd.readAsDataURL(cachedBlob);
      }
      return null; // suppress the window.open attempt
    }
    return _origWindowOpen.apply(window, arguments);
  };

  /* 11 ── Suppress "thread limit" flash after back-navigation (P1 fix) ─── */
  // Problem: on SPA back-navigation (popstate), Next.js re-renders the page
  // component which resets accountSessionLimit to 1. If the active thread has
  // sessionPosition >= 2, threadLimitReached briefly flashes true.
  // injectedJavaScript only runs on full page loads, NOT on popstate, so the
  // section-11 CSS from initial load is already gone. We need a persistent
  // MutationObserver that watches for the limit element appearing and hides it
  // for 3s if we just navigated.
  (function() {
    // Also suppress on initial load (full-page reload case)
    var s = document.createElement('style');
    s.id = 'rn-no-limit-flash';
    s.textContent = '.composer-session-limit-float{visibility:hidden!important}';
    (document.head || document.documentElement).appendChild(s);
    setTimeout(function() {
      var el = document.getElementById('rn-no-limit-flash');
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 3000);

    // Track last navigation event for the SPA-navigation guard below
    var _lastNavAt = Date.now();
    function _markNav() { _lastNavAt = Date.now(); }
    window.addEventListener('popstate', _markNav);
    window.addEventListener('pageshow', _markNav);
    window.addEventListener('visibilitychange', function() { if (!document.hidden) _markNav(); });

    // Watch for the limit element being added to the DOM after navigation
    new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var nodes = mutations[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          if (node.nodeType !== 1) continue;
          var el = null;
          if (node.classList && node.classList.contains('composer-session-limit-float')) {
            el = node;
          } else if (node.querySelector) {
            el = node.querySelector('.composer-session-limit-float');
          }
          if (!el) continue;
          // Only suppress within 2s of a navigation event
          if (Date.now() - _lastNavAt > 2000) continue;
          el.style.setProperty('display', 'none', 'important');
          // Remove suppression after 3s so real limit messages still show
          setTimeout(function(target) {
            if (target && target.style) target.style.removeProperty('display');
          }, 3000, el);
        }
      }
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });
  })();

  /* 13 ── APK traceability (/about): fill version and Android versionCode from native shell
     Guard: writing textContent on #rn-trace-* mutates the subtree; a document-level
     MutationObserver that always re-fills can recurse synchronously on Android → freeze. */
  function _fillRnAppTrace() {
    try {
      var info = window.__RN_APP_INFO;
      if (!info) return;
      function _set(id, v) {
        if (v === null || v === undefined || v === '') return;
        var el = document.getElementById(id);
        if (!el) return;
        var s = String(v);
        if (el.textContent === s) return;
        el.textContent = s;
      }
      _set('rn-trace-version', info.version);
      _set('rn-trace-code', info.androidVersionCode);
    } catch (_) {}
  }
  _fillRnAppTrace();
  if (!window.__rnTraceMo) {
    var _rnTraceObsRaf = 0;
    window.__rnTraceMo = new MutationObserver(function () {
      if (!document.getElementById('rn-trace-version')) return;
      if (_rnTraceObsRaf) return;
      _rnTraceObsRaf = requestAnimationFrame(function () {
        _rnTraceObsRaf = 0;
        _fillRnAppTrace();
      });
    });
    window.__rnTraceMo.observe(document.documentElement, { childList: true, subtree: true });
  }

})();
true;
`;

/** Appended to INJECTED_JS when DEBUG_WEBVIEW_CHAT_DOM_OUTLINES is true (mobile file only). */
const WEBVIEW_DOM_LAYOUT_DEBUG_JS = `
(function(){
  if (window.__rnDomLayoutDebug) return;
  window.__rnDomLayoutDebug = true;
  function inject(){
    if (document.getElementById('rn-dom-layout-debug')) return;
    var st = document.createElement('style');
    st.id = 'rn-dom-layout-debug';
    st.setAttribute('data-rn-temp','layout-debug');
    st.textContent = [
      'html{outline:2px solid #7c3aed!important;outline-offset:-2px}',
      'body{outline:2px solid #a78bfa!important;outline-offset:-2px}',
      '.iching-oracle-shell--chat{outline:3px solid #e11d48!important;outline-offset:-3px}',
      '.oracle-chat-app{outline:3px solid #0891b2!important;outline-offset:-3px}',
      '.ambient-particles-layer{outline:3px dashed #65a30d!important;outline-offset:-3px}',
      '.chat-surface{outline:3px solid #ea580c!important;outline-offset:-3px}',
      'header.chat-app-bar,header.oracle-intro{outline:3px solid #2563eb!important;outline-offset:-3px}',
      '.chat-room{outline:3px solid #16a34a!important;outline-offset:-3px}',
      '.chat-history{outline:3px solid #ca8a04!important;outline-offset:-3px}',
      '.chat-composer-wa{outline:3px solid #4f46e5!important;outline-offset:-3px}',
      '.composer-dock{outline:3px solid #9333ea!important;outline-offset:-3px}',
      '.composer-sheet{outline:2px solid #db2777!important;outline-offset:-2px}'
    ].join('');
    (document.head||document.documentElement).appendChild(st);
  }
  inject();
  document.addEventListener('readystatechange', inject);
  [0,500,2000].forEach(function(ms){ setTimeout(inject, ms); });
})();
true;
`;

const COMBINED_INJECTED_JS = DEBUG_WEBVIEW_CHAT_DOM_OUTLINES
  ? `${INJECTED_JS}\n${WEBVIEW_DOM_LAYOUT_DEBUG_JS}`
  : INJECTED_JS;

type RNMessage =
  | { type: "auth_token"; token: string; email?: string | null }
  | { type: "auth_signout" }
  | { type: "locale_changed"; locale: AppLocale }
  | { type: "open_google_auth" }
  | { type: "pkce_verifier"; verifier: string }
  | { type: "download_file"; filename: string; dataUrl: string }
  | { type: "download_file_start"; transferId: string; filename: string; mimeType?: string }
  | { type: "download_file_chunk"; transferId: string; chunk: string }
  | { type: "download_file_end"; transferId: string }
  | { type: "delete_chat"; url: string; reqId: string }
  | { type: "account_deleted" }
  | { type: "open_image"; url: string }
  | { type: "request_thread"; sessionId: string; localId: string }
  | { type: "purchase_tokens" }
  | { type: "web_alert"; message: string }
  | { type: "web_confirm"; message: string }
  | { type: "web_prompt"; message: string; defaultValue?: string }
  | { type: "shell_theme"; theme: "light" | "dark" };

function isPurchasesError(e: unknown): e is { userCancelled: boolean; message: string } {
  return (
    typeof e === "object" &&
    e !== null &&
    "userCancelled" in e &&
    typeof (e as { userCancelled: unknown }).userCancelled === "boolean"
  );
}

type NativeDialogConfig = {
  title?: string;
  message: string;
  buttons: Array<{ text: string; style?: "default" | "cancel"; onPress?: () => void }>;
};

// ── P4: Native pinch-to-zoom modal for chat images ───────────────────────────
interface ImageZoomModalProps {
  uri: string | null;
  onClose: () => void;
}

/* ── Offline / WebView error screen ──────────────────────────────────────── */
function OfflineScreen({ onRetry }: { onRetry: () => void }) {
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(contentAnim, {
      toValue: 1,
      tension: 55,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [contentAnim]);

  const contentStyle = {
    opacity: contentAnim,
    transform: [
      {
        scale: contentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.88, 1],
        }),
      },
    ],
  };

  return (
    // Root is always fully opaque — hides native WebView error from frame 1
    <View style={offlineStyles.root}>
      <Image source={OFFLINE_LOGO} style={StyleSheet.absoluteFill} resizeMode="cover" />
      {/* Dark gradient band so text is readable over the image bottom */}
      <View style={offlineStyles.bottomBand} />
      <Animated.View style={[offlineStyles.content, contentStyle]}>
        <Text style={offlineStyles.title}>Signal Lost</Text>
        <Text style={offlineStyles.body}>The oracle is waiting for you.</Text>
        <TouchableOpacity style={offlineStyles.btn} onPress={onRetry} activeOpacity={0.75}>
          <Text style={offlineStyles.btnText}>Try Again</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const offlineStyles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0c0f14",
  },
  // Semi-transparent dark band at the bottom to ensure text contrast
  bottomBand: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "38%",
    backgroundColor: "rgba(12, 15, 20, 0.78)",
  },
  content: {
    position: "absolute",
    bottom: 64,
    left: 40,
    right: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e8d5a3",
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    color: "#b8a98a",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
  },
  btn: {
    backgroundColor: "#c9a227",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 10,
  },
  btnText: {
    color: "#0c0f14",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.4,
  },
});

function ImageZoomModal({ uri, onClose }: ImageZoomModalProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const savedScale = useRef(1);
  const currentScaleValue = useRef(1);
  const initialDistance = useRef<number | null>(null);
  const pinchStarted = useRef(false);
  const commitScale = useCallback(() => {
    savedScale.current = Math.max(1, currentScaleValue.current);
    if (currentScaleValue.current < 1) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      savedScale.current = 1;
      currentScaleValue.current = 1;
    }
    initialDistance.current = null;
    pinchStarted.current = false;
  }, [scale]);
  const onTouchStart = useCallback((evt: GestureResponderEvent) => {
    if (evt.nativeEvent.touches.length !== 2) return;
    const t = evt.nativeEvent.touches;
    initialDistance.current = Math.hypot(
      t[1].pageX - t[0].pageX,
      t[1].pageY - t[0].pageY
    );
    pinchStarted.current = true;
  }, []);
  const onTouchMove = useCallback(
    (evt: GestureResponderEvent) => {
      if (evt.nativeEvent.touches.length !== 2) return;
      const t = evt.nativeEvent.touches;
      const dist = Math.hypot(
        t[1].pageX - t[0].pageX,
        t[1].pageY - t[0].pageY
      );
      if (initialDistance.current === null || !pinchStarted.current) {
        initialDistance.current = dist;
        pinchStarted.current = true;
        return;
      }
      const newScale = Math.min(
        4,
        Math.max(0.5, (dist / initialDistance.current) * savedScale.current)
      );
      scale.setValue(newScale);
      currentScaleValue.current = newScale;
    },
    [scale]
  );
  const onTouchEnd = useCallback(
    (evt: GestureResponderEvent) => {
      if (evt.nativeEvent.touches.length < 2) {
        commitScale();
      }
    },
    [commitScale]
  );

  // Reset zoom when modal opens/closes
  useEffect(() => {
    if (!uri) {
      scale.setValue(1);
      savedScale.current = 1;
      currentScaleValue.current = 1;
      initialDistance.current = null;
      pinchStarted.current = false;
    }
  }, [uri, scale]);

  const { width, height } = Dimensions.get("window");

  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={zoomStyles.overlay}>
        <TouchableOpacity
          style={zoomStyles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={zoomStyles.closeTxt}>✕</Text>
        </TouchableOpacity>
        <View
          style={zoomStyles.imageWrap}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          <Animated.Image
            source={{ uri: uri ?? undefined }}
            style={{ width, height: height * 0.82, transform: [{ scale }] }}
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
  );
}

const zoomStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 48,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
  },
  closeTxt: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  imageWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});

type ShellChromeTheme = "light" | "dark";

// ── Native alert modal (replaces Android system dialogs) ─────────────────────
function NativeAlertModal({
  config,
  onClose,
  appearance = "dark",
}: {
  config: NativeDialogConfig | null;
  onClose: () => void;
  appearance?: ShellChromeTheme;
}) {
  if (!config) return null;
  const d = appearance === "light" ? dialogStylesLight : dialogStylesDark;
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={d.backdrop}>
        <View style={d.card}>
          {config.title ? (
            <Text style={d.title}>{config.title}</Text>
          ) : null}
          <Text style={d.message}>{config.message}</Text>
          <View style={d.buttons}>
            {config.buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  d.btn,
                  btn.style === "cancel" && d.btnCancel,
                ]}
                onPress={() => {
                  btn.onPress?.();
                  onClose();
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    d.btnText,
                    btn.style === "cancel" && d.btnTextCancel,
                  ]}
                >
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const dialogStylesDark = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#161a22",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.22)",
    paddingVertical: 24,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 340,
  },
  title: {
    color: "#e8d5a3",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  btn: {
    flex: 1,
    backgroundColor: "rgba(201,162,39,0.14)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.35)",
    paddingVertical: 11,
    alignItems: "center",
  },
  btnCancel: {
    backgroundColor: "transparent",
    borderColor: "rgba(255,255,255,0.1)",
  },
  btnText: {
    color: "#c9a227",
    fontSize: 14,
    fontWeight: "600",
  },
  btnTextCancel: {
    color: "rgba(255,255,255,0.4)",
    fontWeight: "400",
  },
});

const dialogStylesLight = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.12)",
    paddingVertical: 24,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    color: "#0f172a",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    color: "rgba(15,23,42,0.75)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  btn: {
    flex: 1,
    backgroundColor: "rgba(13,148,136,0.12)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(13,148,136,0.35)",
    paddingVertical: 11,
    alignItems: "center",
  },
  btnCancel: {
    backgroundColor: "transparent",
    borderColor: "rgba(15,23,42,0.15)",
  },
  btnText: {
    color: "#0d9488",
    fontSize: 14,
    fontWeight: "600",
  },
  btnTextCancel: {
    color: "rgba(15,23,42,0.45)",
    fontWeight: "400",
  },
});

// ── Pack Picker Modal ─────────────────────────────────────────────────────────
interface PackPickerModalProps {
  visible: boolean;
  packages: PurchasesPackage[];
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
  appearance: "dark" | "light";
  ui: { title: string; confirmBtn: string; cancel: string };
}

function PackPickerModal({
  visible, packages, selectedIdx, onSelect, onConfirm, onCancel, busy, appearance, ui,
}: PackPickerModalProps) {
  const insets = useSafeAreaInsets();
  const isDark = appearance === "dark";
  const c = {
    backdrop:      isDark ? "rgba(0,0,0,0.80)"              : "rgba(0,0,0,0.52)",
    card:          isDark ? "#1a222c"                        : "#ffffff",
    headerBorder:  isDark ? "rgba(255,255,255,0.08)"         : "rgba(15,23,42,0.08)",
    packBg:        isDark ? "#0f1720"                        : "#f4f8fb",
    packBorder:    isDark ? "rgba(255,255,255,0.09)"         : "rgba(15,23,42,0.10)",
    packSelBg:     isDark ? "rgba(78,205,196,0.11)"          : "rgba(42,157,143,0.08)",
    packSelBorder: isDark ? "#4ecdc4"                        : "#2a9d8f",
    title:         isDark ? "#eceff1"                        : "#1a2e3a",
    price:         isDark ? "#4ecdc4"                        : "#2a9d8f",
    desc:          isDark ? "rgba(236,239,241,0.52)"         : "rgba(26,46,58,0.55)",
    confirm:       "#2a9d8f",
    confirmDis:    isDark ? "rgba(255,255,255,0.15)"         : "rgba(15,23,42,0.12)",
    confirmTxt:    "#ffffff",
    confirmTxtDis: isDark ? "rgba(255,255,255,0.35)"         : "rgba(15,23,42,0.30)",
    cancelTxt:     isDark ? "rgba(255,255,255,0.45)"         : "rgba(15,23,42,0.45)",
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={[ppStyles.backdrop, { backgroundColor: c.backdrop }]} onPress={onCancel}>
        <Pressable
          style={[ppStyles.sheet, { backgroundColor: c.card }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[ppStyles.header, { borderBottomColor: c.headerBorder }]}>
            <Text style={[ppStyles.headerTitle, { color: c.title }]}>{ui.title}</Text>
            <TouchableOpacity onPress={onCancel} hitSlop={12} activeOpacity={0.7}>
              <Text style={[ppStyles.closeX, { color: c.cancelTxt }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Pack cards */}
          <ScrollView
            style={ppStyles.list}
            contentContainerStyle={ppStyles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {packages.map((pkg, idx) => {
              const selected = idx === selectedIdx;
              return (
                <TouchableOpacity
                  key={pkg.product.identifier}
                  activeOpacity={0.78}
                  onPress={() => onSelect(idx)}
                  style={[
                    ppStyles.packCard,
                    {
                      backgroundColor: selected ? c.packSelBg : c.packBg,
                      borderColor: selected ? c.packSelBorder : c.packBorder,
                    },
                  ]}
                >
                  <Image
                    source={packIconFor(pkg.product.identifier)}
                    style={ppStyles.packIcon}
                    resizeMode="contain"
                  />
                  <View style={ppStyles.packInfo}>
                    <Text style={[ppStyles.packTitle, { color: c.title }]} numberOfLines={1}>
                      {cleanProductTitle(pkg.product.title)}
                    </Text>
                    <Text style={[ppStyles.packDesc, { color: c.desc }]} numberOfLines={2}>
                      {pkg.product.description}
                    </Text>
                  </View>
                  <Text style={[ppStyles.packPrice, { color: c.price }]}>
                    {pkg.product.priceString}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Confirm button */}
          <View style={[ppStyles.footer, { borderTopColor: c.headerBorder, paddingBottom: Math.max(16, insets.bottom + 8) }]}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={onConfirm}
              disabled={selectedIdx === null || busy}
              style={[
                ppStyles.confirmBtn,
                {
                  backgroundColor:
                    selectedIdx !== null && !busy ? c.confirm : c.confirmDis,
                },
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={[
                    ppStyles.confirmTxt,
                    { color: selectedIdx !== null ? c.confirmTxt : c.confirmTxtDis },
                  ]}
                >
                  {ui.confirmBtn}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const ppStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "88%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  closeX: {
    fontSize: 17,
    fontWeight: "600",
    paddingHorizontal: 4,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  packCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    gap: 12,
  },
  packIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    flexShrink: 0,
  },
  packInfo: {
    flex: 1,
    gap: 3,
  },
  packTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  packDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  packPrice: {
    fontSize: 15,
    fontWeight: "800",
    flexShrink: 0,
  },
  footer: {
    paddingHorizontal: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  confirmBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTxt: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState(BASE_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const splashHidden = useRef(false);
  const webReadyRef = useRef(false);
  /** Pre-fetched SQLite cache — populated on mount, injected synchronously in onLoadEnd. */
  const cachedChatsRef = useRef<RnCachedChatEntry[]>([]);

  /* ── Auth state (P3) ── */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const authTransitionRef = useRef(false);
  const downloadTransfersRef = useRef<
    Record<
      string,
      {
        filename: string;
        mimeType: string;
        chunks: string[];
      }
    >
  >({});

  /* ── Locale state (P2) ── */
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);
  const localeRef = useRef<AppLocale>(DEFAULT_LOCALE);
  /** False until AsyncStorage locale is read — avoids injecting default `en` over web `localStorage`. */
  const localeStorageHydratedRef = useRef(false);
  /** Matches web `html[data-theme]` for native modals / WebView chrome padding. */
  const [shellTheme, setShellTheme] = useState<ShellChromeTheme>("dark");

  const nativeUi = useMemo(() => getMobileNativeUiMessages(locale), [locale]);

  /* ── Keep localeRef in sync; push locale only after native storage hydrated (see AsyncStorage effect). ── */
  useEffect(() => {
    localeRef.current = locale;
    if (!webReadyRef.current || !localeStorageHydratedRef.current) return;
    // Prefer web `localStorage` so a web-only picker choice is never clobbered by native default `en`.
    webViewRef.current?.injectJavaScript(buildSyncLocaleFromWebOrNativeScript(locale));
  }, [locale]);

  /* ── Image zoom state (P4) ── */
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  /* ── Pack picker state ── */
  const [packPickerPackages, setPackPickerPackages] = useState<PurchasesPackage[]>([]);
  const [packPickerOpen, setPackPickerOpen] = useState(false);
  const [packPickerSelectedIdx, setPackPickerSelectedIdx] = useState<number | null>(null);
  const [packPickerBusy, setPackPickerBusy] = useState(false);

  /* ── Native dialog state (replaces Alert.alert + web window.alert) ── */
  const [nativeDialog, setNativeDialog] = useState<NativeDialogConfig | null>(null);
  const showNativeDialog = useCallback((config: NativeDialogConfig) => setNativeDialog(config), []);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [webViewError, setWebViewError] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  const addLog = (msg: string) => {
    setDebugLogs(prev => [...prev.slice(-10), `${new Date().toISOString().slice(11, 19)} ${msg}`]);
  };

  /* ── Safe area insets (status bar height on Android) ── */
  const insets = useSafeAreaInsets();
  const insetsBottomRef = useRef(insets.bottom);
  useEffect(() => {
    insetsBottomRef.current = insets.bottom;
    if (webReadyRef.current) {
      webViewRef.current?.injectJavaScript(
        `document.documentElement.style.setProperty('--rn-safe-area-inset-bottom', '${insets.bottom}px'); true;`
      );
    }
  }, [insets.bottom]);

  /* Android: status bar + band under it stay dark so system icons stay readable (product: always black chrome). */
  useEffect(() => {
    RNStatusBar.setBarStyle("light-content", true);
    if (Platform.OS === "android") {
      RNStatusBar.setBackgroundColor("#080808", true);
      RNStatusBar.setTranslucent(false);
    }
  }, []);

  /* ── Media permission ── */
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  const validateStoredToken = useCallback(
    async (token: string): Promise<{ valid: boolean; email: string | null }> => {
      try {
        const res = await fetch(`${BASE_URL}/api/account/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return { valid: false, email: null };
        const data = (await res.json().catch(() => null)) as
          | { user?: { email?: string | null } }
          | null;
        const email = typeof data?.user?.email === "string" ? data.user.email : null;
        return { valid: true, email };
      } catch {
        return { valid: false, email: null };
      }
    },
    []
  );

  /* ── SQLite: initialize schema on mount, then pre-fetch cached chats into ref.
     Pre-fetching starts before onLoadEnd fires (WebView loading takes ~1-3s),
     so the ref is ready for synchronous injection when the page finishes loading.
     SECURITY: only populate the ref if the cached data belongs to the currently
     stored user. A mismatch (different user, deleted account, fresh install) wipes
     the stale SQLite rows before the WebView can inject them. ── */
  useEffect(() => {
    void (async () => {
      try {
        await initDb();
        const [chats, storedTok, lastSyncedUser] = await Promise.all([
          getCachedChatsForInjection(),
          SecureStore.getItemAsync(SECURE_TOKEN_KEY),
          getSyncMeta("last_synced_user"),
        ]);
        const storedUid = getUserIdFromJwt(storedTok ?? "");
        if (storedUid && lastSyncedUser && storedUid === lastSyncedUser) {
          // Cache verified: belongs to the currently stored user.
          cachedChatsRef.current = chats;
        } else {
          // Mismatch or no sync record — wipe stale data before any injection.
          await clearAllData();
          cachedChatsRef.current = [];
        }
      } catch {
        cachedChatsRef.current = [];
      }
    })();
  }, []);

  /* ── Restore token + locale from storage on cold start ── */
  useEffect(() => {
    const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '';

    // Set up purchase success listener synchronously — must not wait on async ops.
    const purchaseSub = DeviceEventEmitter.addListener('rnPurchaseSuccess', () => {
      webViewRef.current?.injectJavaScript(
        `window.__rnForceAccountRefresh && window.__rnForceAccountRefresh(); true;`
      );
    });

    // Configure RC after checking SecureStore for a stored UID. If we already
    // have a token, configure with appUserId so any purchase that fires before
    // Purchases.logIn() resolves (in the effect below) is attributed to the
    // correct user — not an anonymous $RCAnonymousID that the webhook rejects.
    (async () => {
      if (!RC_API_KEY) return;
      let appUserId: string | undefined;
      try {
        const tok = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
        if (tok) {
          const uid = getUserIdFromJwt(tok);
          if (uid) appUserId = uid;
        }
      } catch { /* SecureStore unavailable — fall back to anonymous */ }
      try {
        Purchases.configure({ apiKey: RC_API_KEY, appUserID: appUserId });
      } catch (e) {
        console.warn('[RevenueCat] configure failed:', e);
      }
    })();

    return () => { purchaseSub.remove(); };
  }, []);

  useEffect(() => {
    SecureStore.getItemAsync(SECURE_TOKEN_KEY).then(async (tok) => {
      if (!tok) return;
      const check = await validateStoredToken(tok);
      if (check.valid) {
        accessTokenRef.current = tok;
        setIsAuthenticated(true);
        setUserEmail(check.email);
        // Re-identify with RevenueCat on cold start so purchases are attributed correctly
        const uid = getUserIdFromJwt(tok);
        if (uid) { try { await Purchases.logIn(uid); } catch { /* non-fatal */ } }
      } else {
        accessTokenRef.current = null;
        setIsAuthenticated(false);
        setUserEmail(null);
        SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      }
    });
    AsyncStorage.getItem(LOCALE_STORAGE_KEY).then((saved) => {
      const storedOk = saved && LOCALES.some((l) => l.code === saved);
      let resolved: AppLocale;
      if (storedOk) {
        resolved = saved as AppLocale;
      } else {
        /* Manual-first: do not persist device locale — avoids native `en` fighting web LS after docs. */
        resolved = DEFAULT_LOCALE;
      }
      localeRef.current = resolved;
      setLocaleState(resolved);
      localeStorageHydratedRef.current = true;
      if (webReadyRef.current) {
        webViewRef.current?.injectJavaScript(buildSyncLocaleFromWebOrNativeScript(localeRef.current));
      }
    });
  }, [validateStoredToken]);

  const hideSplash = useCallback(() => {
    if (!splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync();
    }
  }, []);

  /** Reads current SQLite state and pushes the chat list to the WebView (Tier 1).
   *  Thread content is loaded on demand via request_thread bridge messages (Tier 2/3). */
  const injectCachedChats = useCallback(() => {
    void getCachedChatsForInjection().then((chats) => {
      cachedChatsRef.current = chats;
      const payloadStr = JSON.stringify(JSON.stringify(chats));
      webViewRef.current?.injectJavaScript(
        `(function(){try{` +
          `window.__rnCachedChats=JSON.parse(${payloadStr});` +
          `window.dispatchEvent(new CustomEvent('rn:cached-chats',{detail:window.__rnCachedChats}));` +
        `}catch(_){}})();true;`
      );
    }).catch(() => undefined);
  }, []);

  const onLoadEnd = useCallback(() => {
    webReadyRef.current = true;
    webViewRef.current?.injectJavaScript(
      `window.__rnForceAccountRefresh && window.__rnForceAccountRefresh(); true;`
    );
    // Re-inject bottom inset in case it changed between first render and page load.
    webViewRef.current?.injectJavaScript(
      `document.documentElement.style.setProperty('--rn-safe-area-inset-bottom', '${insetsBottomRef.current}px'); true;`
    );
    if (localeStorageHydratedRef.current) {
      webViewRef.current?.injectJavaScript(buildSyncLocaleFromWebOrNativeScript(localeRef.current));
    }
    hideSplash();
    // Fast path: inject pre-fetched chat list from ref synchronously.
    // Thread content is loaded lazily via request_thread bridge messages.
    if (cachedChatsRef.current.length > 0) {
      const payloadStr = JSON.stringify(JSON.stringify(cachedChatsRef.current));
      webViewRef.current?.injectJavaScript(
        `(function(){try{` +
          `window.__rnCachedChats=JSON.parse(${payloadStr});` +
          `window.dispatchEvent(new CustomEvent('rn:cached-chats',{detail:window.__rnCachedChats}));` +
        `}catch(_){}})();true;`
      );
    }
    // Async refresh: covers the case where syncChats() ran after mount and updated SQLite.
    injectCachedChats();
  }, [hideSplash, injectCachedChats]);

  /* ── Deep link handler — OAuth callback + RevenueCat redemption ── */
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      if (!url?.includes('auth/callback') && !url?.includes('rc-340e77bf41')) return;

      // RevenueCat web purchase redemption link
      try {
        const redemption = await Purchases.parseAsWebPurchaseRedemption(url);
        if (redemption) {
          showNativeDialog({ title: 'RevenueCat', message: 'Redemption link detectado, procesando...', buttons: [{ text: 'OK' }] });
          const result = await Purchases.redeemWebPurchase(redemption);
          showNativeDialog({ title: 'RC Result', message: JSON.stringify(result).substring(0, 100), buttons: [{ text: 'OK' }] });
          webViewRef.current?.injectJavaScript(
            `window.__rnForceAccountRefresh && window.__rnForceAccountRefresh(); true;`
          );
          return;
        }
      } catch {
        // Not a redemption link — continue to auth flow
      }

      // RevenueCat post-purchase redirect back to the app
      if (url.includes('purchase-success') || url === 'theoriginaliching://') {
        webViewRef.current?.injectJavaScript(
          `window.__rnForceAccountRefresh && window.__rnForceAccountRefresh(); true;`
        );
        return;
      }

      if (!url?.includes('auth/callback')) return;

      // PKCE code flow — Supabase JS SDK stores the verifier in the WebView's localStorage.
      // We can't do the exchange natively, so we hand the callback URL back to the WebView.
      const normalizedUrl = url.replace('theoriginaliching:///', 'theoriginaliching://');
      const codeMatch = normalizedUrl.match(/[?&]code=([^&#]+)/);
      if (codeMatch) {
        const webUrl = deepLinkToWebUrl(normalizedUrl);
        if (webUrl) setCurrentUrl(webUrl);
        return;
      }

      // Extract access_token from hash fragment (Supabase implicit flow fallback)
      const hashMatch = url.match(/#access_token=([^&]+)/);
      const accessToken = hashMatch ? decodeURIComponent(hashMatch[1]) : null;

      const refreshMatch = url.match(/[#&]refresh_token=([^&]+)/);
      const refreshToken = refreshMatch ? decodeURIComponent(refreshMatch[1]) : null;

      if (accessToken) {
        await SecureStore.setItemAsync(SECURE_TOKEN_KEY, accessToken);
        accessTokenRef.current = accessToken;

        // Decode JWT payload (base64url → base64 before atob)
        let email: string | null = null;
        try {
          const b64 = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(b64)) as { email?: string };
          email = payload.email ?? null;
        } catch { /* non-fatal */ }

        setIsAuthenticated(true);
        setUserEmail(email);

        // Block auth_signout messages during the reload triggered by __rnInjectSession
        authTransitionRef.current = true;
        setTimeout(() => { authTransitionRef.current = false; }, 3000);

        webViewRef.current?.injectJavaScript(`
          window.__rnInjectSession && window.__rnInjectSession({
            access_token: ${JSON.stringify(accessToken)},
            refresh_token: ${JSON.stringify(refreshToken ?? '')},
            expires_in: 3600,
            user: { email: ${JSON.stringify(email)} }
          }); true;
        `);
      }
    };

    // Warm start — app already running when deep link arrives
    const sub = Linking.addEventListener('url', handleDeepLink);

    // Cold start — app opened by the deep link
    Linking.getInitialURL().then(url => {
      if (url?.includes('auth/callback') || url?.includes('rc-340e77bf41')) void handleDeepLink({ url });
    });

    return () => sub.remove();
  }, [showNativeDialog]);

  /* ── Android hardware back ── */
  useEffect(() => {
    const h = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => h.remove();
  }, [canGoBack]);

  /* ── Change locale in the web app via injected JS (P2) ── */
  const changeLocale = useCallback((newLocale: AppLocale) => {
    setLocaleState(newLocale);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    const isRtl = RTL_LOCALES.has(newLocale);
    if (I18nManager.isRTL !== isRtl) {
      I18nManager.forceRTL(isRtl);
    }
    webViewRef.current?.injectJavaScript(
      `window.__rnSetLocale && window.__rnSetLocale(${JSON.stringify(newLocale)}); true;`
    );
  }, []);

  /* ── Handle file download (P5) ── */
  const handleFileDownload = useCallback(
    async (filename: string, dataUrl: string) => {
      try {
        const inferredPdf = dataUrl.startsWith("data:application/pdf");
        const safeBaseName = (filename || "download")
          .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
          .replace(/\s+/g, " ")
          .trim();
        const normalizedName =
          safeBaseName.length > 0
            ? safeBaseName
            : inferredPdf
              ? "consulta-i-ching.pdf"
              : "download";
        const isPdf = normalizedName.toLowerCase().endsWith(".pdf") || inferredPdf;
        const finalName = isPdf
          ? normalizedName.toLowerCase().endsWith(".pdf")
            ? normalizedName
            : `${normalizedName}.pdf`
          : normalizedName;

        const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        if (!base64) {
          throw new Error("invalid_download_payload");
        }
        const targetDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
        if (!targetDir) {
          throw new Error("filesystem_unavailable");
        }
        const fileUri = `${targetDir}${finalName}`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (isPdf) {
          if (Platform.OS === "android") {
            // Ask media permission first — mirrors the photo flow UX.
            let granted = mediaPermission?.granted ?? false;
            if (!granted) {
              const result = await requestMediaPermission();
              granted = result.granted;
            }
            if (!granted) {
              showNativeDialog({
                title: nativeUi.permissionDeniedTitle,
                message: nativeUi.permissionDeniedBody,
                buttons: [{ text: nativeUi.ok }],
              });
              return;
            }
            try {
              // Android 10+: MediaStore.Downloads receives non-media assets.
              await MediaLibrary.createAssetAsync(fileUri);
              showNativeDialog({
                title: nativeUi.fileSavedTitle,
                message: nativeUi.fileSavedBody,
                buttons: [{ text: nativeUi.ok }],
              });
              return;
            } catch {
              // MediaLibrary rejected this file type; fall through to share sheet.
            }
          }

          const sharingAvailable = await Sharing.isAvailableAsync();
          if (!sharingAvailable) {
            throw new Error("sharing_unavailable");
          }
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: nativeUi.sharePdfTitle,
          });
        } else {
          let granted = mediaPermission?.granted ?? false;
          if (!granted) {
            const result = await requestMediaPermission();
            granted = result.granted;
          }
          if (!granted) {
            showNativeDialog({
              title: nativeUi.permissionDeniedTitle,
              message: nativeUi.permissionDeniedBody,
              buttons: [{ text: nativeUi.ok }],
            });
            return;
          }
          await MediaLibrary.saveToLibraryAsync(fileUri);
          showNativeDialog({
            title: nativeUi.imageSavedTitle,
            message: nativeUi.imageSavedBody,
            buttons: [{ text: nativeUi.ok }],
          });
        }
      } catch {
        showNativeDialog({
          title: nativeUi.fileSaveErrorTitle,
          message: nativeUi.fileSaveErrorBody,
          buttons: [{ text: nativeUi.ok }],
        });
      }
    },
    [mediaPermission, nativeUi, requestMediaPermission, showNativeDialog]
  );

  /* ── P6: Execute DELETE from RN with stored token ── */
  const handleDeleteChat = useCallback(
    (relativeUrl: string, reqId: string) => {
      const reply = (ok: boolean, status: number) => {
        webViewRef.current?.injectJavaScript(
          `window.__rnDelResponse && window.__rnDelResponse(${JSON.stringify(reqId)}, ${ok}, ${status}); true;`
        );
      };
      const doDelete = async () => {
        try {
          const token =
            accessTokenRef.current ??
            (await SecureStore.getItemAsync(SECURE_TOKEN_KEY));
          if (!token) {
            reply(false, 401);
            return;
          }
          const fullUrl = relativeUrl.startsWith("http")
            ? relativeUrl
            : `${BASE_URL}${relativeUrl}`;
          const res = await fetch(fullUrl, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          reply(res.ok, res.status);
          if (res.ok) {
            // Mirror the deletion in local SQLite so the chat doesn't
            // reappear in the cached list on next app launch.
            const sessionId = new URL(fullUrl).searchParams.get("sessionId");
            if (sessionId) void softDeleteChat(sessionId).catch(() => undefined);
          }
        } catch {
          reply(false, 500);
        }
      };
      showNativeDialog({
        message: nativeUi.deleteConfirm,
        buttons: [
          { text: nativeUi.cancel, style: "cancel", onPress: () => reply(false, 499) },
          { text: nativeUi.ok, onPress: () => void doDelete() },
        ],
      });
    },
    [showNativeDialog, nativeUi]
  );

  /* ── Native Google Play Billing ── */
  const executePurchaseFromPicker = useCallback(async () => {
    if (packPickerSelectedIdx === null) return;
    const pkg = packPickerPackages[packPickerSelectedIdx];
    if (!pkg) return;
    setPackPickerBusy(true);

    const currentToken = accessTokenRef.current;
    const uid = currentToken ? getUserIdFromJwt(currentToken) : null;
    if (!uid) {
      setPackPickerBusy(false);
      showNativeDialog({
        title: nativeUi.purchaseErrorTitle,
        message: nativeUi.storeUnavailable,
        buttons: [{ text: nativeUi.ok }],
      });
      return;
    }

    try {
      const appUserId = await Purchases.getAppUserID();
      if (appUserId !== uid) {
        await Purchases.logIn(uid);
      }
    } catch (e) {
      console.warn("[RevenueCat] logIn failed during purchase:", e);
      setPackPickerBusy(false);
      showNativeDialog({
        title: nativeUi.purchaseErrorTitle,
        message: nativeUi.identityCheckFailed,
        buttons: [{ text: nativeUi.ok }],
      });
      return;
    }

    try {
      await Purchases.purchasePackage(pkg);
      setPackPickerOpen(false);
      DeviceEventEmitter.emit("rnPurchaseSuccess");
      const productId = pkg.product.identifier;
      webViewRef.current?.injectJavaScript(
        `(function(){try{window.dispatchEvent(new CustomEvent('rnPurchaseSuccess',` +
        `{detail:{productId:${JSON.stringify(productId)}}}));}catch(_){}})();true;`
      );
    } catch (e: unknown) {
      if (isPurchasesError(e) && e.userCancelled) { setPackPickerBusy(false); return; }
      setPackPickerOpen(false);
      const errMsg = isPurchasesError(e) ? e.message : nativeUi.storeUnavailable;
      webViewRef.current?.injectJavaScript(
        `(function(){try{window.dispatchEvent(new CustomEvent('rnPurchaseError',` +
        `{detail:{message:${JSON.stringify(errMsg)}}}));}catch(_){}})();true;`
      );
      showNativeDialog({
        title: nativeUi.purchaseErrorTitle,
        message: errMsg,
        buttons: [{ text: nativeUi.ok }],
      });
    } finally {
      setPackPickerBusy(false);
    }
  }, [packPickerSelectedIdx, packPickerPackages, nativeUi, showNativeDialog]);

  const handleNativePurchase = useCallback(async () => {
    const currentToken = accessTokenRef.current;
    const uid = currentToken ? getUserIdFromJwt(currentToken) : null;
    if (!uid) {
      showNativeDialog({
        title: nativeUi.purchaseErrorTitle,
        message: nativeUi.storeUnavailable,
        buttons: [{ text: nativeUi.ok }],
      });
      return;
    }

    try {
      const appUserId = await Purchases.getAppUserID();
      if (appUserId !== uid) {
        await Purchases.logIn(uid);
      }
    } catch (e) {
      console.warn("[RevenueCat] logIn failed before purchase:", e);
      showNativeDialog({
        title: nativeUi.purchaseErrorTitle,
        message: nativeUi.identityCheckFailed,
        buttons: [{ text: nativeUi.ok }],
      });
      return;
    }

    let offerings: Awaited<ReturnType<typeof Purchases.getOfferings>>;
    try {
      offerings = await Purchases.getOfferings();
    } catch {
      showNativeDialog({
        title: nativeUi.purchaseErrorTitle,
        message: nativeUi.storeUnavailable,
        buttons: [{ text: nativeUi.ok }],
      });
      return;
    }

    const pkgs = offerings.current?.availablePackages ?? [];
    if (pkgs.length === 0) {
      showNativeDialog({
        title: nativeUi.purchaseErrorTitle,
        message: nativeUi.storeUnavailable,
        buttons: [{ text: nativeUi.ok }],
      });
      return;
    }

    setPackPickerPackages(pkgs);
    setPackPickerSelectedIdx(null);
    setPackPickerBusy(false);
    setPackPickerOpen(true);
  }, [showNativeDialog, nativeUi]);

  /* ── onMessage dispatcher ── */
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data) as RNMessage;
        switch (msg.type) {
          case "auth_token": {
            // Detect user switch (or first login after sign-out):
            // clear SQLite AND the in-memory ref so stale chats from a previous
            // user never reach the new user's sidebar even for a single frame.
            const prevUid = getUserIdFromJwt(accessTokenRef.current ?? "");
            const newUid  = getUserIdFromJwt(msg.token);
            if (newUid && prevUid !== newUid) {
              cachedChatsRef.current = [];
              void clearAllData().catch(() => undefined);
            }
            accessTokenRef.current = msg.token;
            setIsAuthenticated(true);
            if (msg.email) setUserEmail(msg.email);
            SecureStore.setItemAsync(SECURE_TOKEN_KEY, msg.token);
            // Identify user to RevenueCat so webhook receives a valid UUID instead of $RCAnonymousID
            void (async () => {
              if (newUid) { try { await Purchases.logIn(newUid); } catch { /* non-fatal */ } }
            })();
            webViewRef.current?.injectJavaScript(
              `window.__rnForceAccountRefresh && window.__rnForceAccountRefresh(); true;`
            );
            void syncChats(msg.token, BASE_URL, newUid ?? undefined)
              .then(() => injectCachedChats())
              .catch(() => undefined);
            break;
          }

          case "auth_signout":
            if (authTransitionRef.current) break; // ignore during session injection reload
            accessTokenRef.current = null;
            setIsAuthenticated(false);
            setUserEmail(null);
            SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
            Purchases.logOut().catch(() => undefined);
            // Clear SQLite and memory cache on sign-out so the next user (or the
            // same user on re-login) starts with a clean slate.
            cachedChatsRef.current = [];
            void clearAllData().catch(() => undefined);
            webViewRef.current?.injectJavaScript(
              `window.location.href = ${JSON.stringify(BASE_URL + "/login")}; true;`
            );
            break;

          case "locale_changed":
            if (!LOCALES.some((l) => l.code === msg.locale)) break;
            AsyncStorage.setItem(LOCALE_STORAGE_KEY, msg.locale);
            if (localeRef.current !== msg.locale) {
              setLocaleState(msg.locale);
            }
            break;

          case "open_google_auth": {
            const redirectTo = encodeURIComponent("theoriginaliching://auth/callback");
            Linking.openURL(
              `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`
            );
            break;
          }

          case "download_file":
            handleFileDownload(msg.filename, msg.dataUrl);
            break;

          case "download_file_start":
            downloadTransfersRef.current[msg.transferId] = {
              filename: msg.filename,
              mimeType: msg.mimeType || "application/octet-stream",
              chunks: [],
            };
            break;

          case "download_file_chunk": {
            const transfer = downloadTransfersRef.current[msg.transferId];
            if (transfer) {
              transfer.chunks.push(msg.chunk);
            }
            break;
          }

          case "download_file_end": {
            const transfer = downloadTransfersRef.current[msg.transferId];
            if (!transfer) break;
            const base64 = transfer.chunks.join("");
            delete downloadTransfersRef.current[msg.transferId];
            const dataUrl = `data:${transfer.mimeType};base64,${base64}`;
            handleFileDownload(transfer.filename, dataUrl);
            break;
          }

          case "delete_chat":
            handleDeleteChat(msg.url, msg.reqId);
            break;

          case "account_deleted":
            // Wipe both the SQLite disk cache AND the in-memory ref.
            // clearAllData() alone is insufficient: cachedChatsRef.current holds
            // an in-memory snapshot loaded at mount time that onLoadEnd would
            // re-inject even after the disk is cleared.
            cachedChatsRef.current = [];
            void clearAllData().catch(() => undefined);
            break;

          case "open_image":
            // Prefer locally cached file; fall back to remote URL.
            void getLocalImagePath(msg.url).then((local) => {
              setZoomImageUrl(local ?? msg.url);
            }).catch(() => setZoomImageUrl(msg.url));
            break;

          case "request_thread": {
            // Tier 2: serve the last 30 messages from SQLite immediately.
            // Tier 3: run incremental sync in background, re-inject if new
            // messages arrived, so the next open is fully up to date.
            const { sessionId, localId } = msg;
            void (async () => {
              const dispatchThread = (rows: Awaited<ReturnType<typeof getPagedThread>>) => {
                if (rows.length === 0) return;
                const consultations = rows
                  .map((r) => { try { return JSON.parse(r.content) as unknown; } catch { return null; } })
                  .filter(Boolean)
                  .reverse(); // DESC from DB → reverse for chronological display
                const payloadStr = JSON.stringify(JSON.stringify({ localId, consultations }));
                webViewRef.current?.injectJavaScript(
                  `(function(){try{` +
                    `window.dispatchEvent(new CustomEvent('rn:thread-data',{detail:JSON.parse(${payloadStr})}));` +
                  `}catch(_){}})();true;`
                );
              };

              const cached = await getPagedThread(sessionId).catch(() => []);
              dispatchThread(cached);

              // Background incremental sync (Tier 3).
              if (accessTokenRef.current) {
                await syncChatContent(accessTokenRef.current, BASE_URL, sessionId).catch(() => undefined);
                const updated = await getPagedThread(sessionId).catch(() => []);
                if (updated.length !== cached.length) {
                  dispatchThread(updated);
                }
                // Neither SQLite nor Supabase returned content — signal the web
                // so it can clear the loading state rather than spinning forever.
                if (updated.length === 0 && cached.length === 0) {
                  const notFoundPayloadStr = JSON.stringify(JSON.stringify({ localId }));
                  webViewRef.current?.injectJavaScript(
                    `(function(){try{` +
                      `window.dispatchEvent(new CustomEvent('rn:thread-not-found',{detail:JSON.parse(${notFoundPayloadStr})}));` +
                    `}catch(_){}})();true;`
                  );
                }
              } else if (cached.length === 0) {
                // No auth token and no SQLite data — clear loading immediately.
                const notFoundPayloadStr = JSON.stringify(JSON.stringify({ localId }));
                webViewRef.current?.injectJavaScript(
                  `(function(){try{` +
                    `window.dispatchEvent(new CustomEvent('rn:thread-not-found',{detail:JSON.parse(${notFoundPayloadStr})}));` +
                  `}catch(_){}})();true;`
                );
              }
            })();
            break;
          }

          case "shell_theme":
            if (msg.theme === "light" || msg.theme === "dark") {
              setShellTheme(msg.theme);
            }
            break;

          case "purchase_tokens":
            void handleNativePurchase();
            break;

          case "web_alert":
            showNativeDialog({
              message: msg.message,
              buttons: [{ text: nativeUi.ok }],
            });
            break;

          case "web_confirm":
            showNativeDialog({
              message: msg.message,
              buttons: [
                { text: nativeUi.cancel, style: "cancel" },
                { text: nativeUi.ok },
              ],
            });
            break;

          case "web_prompt":
            showNativeDialog({
              message: msg.message,
              buttons: [{ text: nativeUi.ok }],
            });
            break;
        }
      } catch {
        // Ignore non-JSON bridge noise
      }
    },
    [handleFileDownload, handleDeleteChat, nativeUi, showNativeDialog, injectCachedChats, handleNativePurchase]
  );

  /* ── Intercept Google OAuth + internal doc navigation ── */
  const onShouldStartLoadWithRequest = useCallback(
    (request: { url: string }): boolean => {
      const { url } = request;

      // Google / Supabase OAuth → intercept and open in external browser.
      // For /auth/v1/authorize URLs we rewrite redirect_to to the app deep-link so the
      // OAuth callback always returns to this app, even when the Supabase SDK on the web
      // page built the URL with the web redirect (redirect_to=BASE_URL/auth/callback).
      if (
        url.includes('accounts.google.com') ||
        url.includes('provider=google') ||
        url.includes('/auth/v1/authorize')
      ) {
        Linking.openURL(
          url.includes('/auth/v1/authorize') && url.includes('redirect_to=')
            ? url.replace(
                /redirect_to=[^&]*/g,
                'redirect_to=' + encodeURIComponent('theoriginaliching://auth/callback')
              )
            : url
        );
        return false;
      }

      // rn_signout=1 signals a hard reload triggered by __rnSignOut — allow it through so
      // the Supabase singleton is destroyed and the session is fully cleared.
      if (url.includes('rn_signout=1')) {
        return true;
      }

      // Cross-origin guard: the WebView must never leave the BASE_URL domain.
      // Applies equally in staging and production builds — there is no legitimate
      // reason for the APK to navigate outside its configured domain outside of the
      // Google OAuth flow (handled above) and the rn_signout reload (handled above).
      if (!url.startsWith(BASE_URL)) {
        if (__DEV__) console.warn("[WebView] cross-origin navigation blocked:", url);
        return false;
      }

      // Route same-origin navigation through SPA once WebView is ready.
      // This prevents full reload state resets that can flash false thread-limit UI.
      if (webReadyRef.current && url.startsWith(BASE_URL)) {
        const path = url.slice(BASE_URL.length) || "/";
        const isAuthCallbackPath =
          path.startsWith("/auth/callback") ||
          path.startsWith("/auth/callback?") ||
          path.startsWith("/auth/callback#");
        if (!isAuthCallbackPath) {
          if (isPublicDocInternalPath(path)) {
            return true;
          }
          webViewRef.current?.injectJavaScript(
            `window.__rnNavigateTo && window.__rnNavigateTo(${JSON.stringify(path)}); true;`
          );
          return false;
        }
      }

      return true;
    },
    []
  );

  const onNavigationStateChange = (state: WebViewNavigation) => {
    setCanGoBack(state.canGoBack);
    // Fix 2 — suppress fake "session limit" banner
    webViewRef.current?.injectJavaScript(`
      (function(){
        var el = document.querySelector('.composer-session-limit-float');
        if (el) el.style.setProperty('display','none','important');
      })();
    `);
    if (localeStorageHydratedRef.current) {
      webViewRef.current?.injectJavaScript(buildSyncLocaleFromWebOrNativeScript(localeRef.current));
    }
  };

  return (
    <View style={[styles.container, DEBUG_NATIVE_CHAT_SHELL_RECTS && styles.debugNativeRoot]}>
      <StatusBar style="light" />
      {/* ── WebView (safe-area top padding; black band under system status bar for contrast) ─ */}
      <View
        style={[
          styles.webviewShell,
          DEBUG_NATIVE_CHAT_SHELL_RECTS && styles.debugNativeWebViewWrap,
          {
            paddingTop: insets.top,
            backgroundColor: "#080808",
          },
        ]}
      >
        <WebView
        key={webViewKey}
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={[styles.webview, webViewError && { opacity: 0 }]}
        onLoadEnd={onLoadEnd}
        onNavigationStateChange={onNavigationStateChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onMessage={onMessage}
        onError={() => setWebViewError(true)}
        injectedJavaScriptBeforeContentLoaded={`document.documentElement.classList.add('iching-rn-webview'); document.documentElement.style.setProperty('--rn-safe-area-inset-bottom', '${insets.bottom}px'); true;`}
        injectedJavaScript={COMBINED_INJECTED_JS}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={["*", "theoriginaliching://*"]}
        // P4: Disable global WebView zoom — images open in native modal instead
        scalesPageToFit={false}
        // Security: block HTTP mixed content on our HTTPS origin (Android WebView equivalent of CSP upgrade-insecure-requests)
        mixedContentMode="never"
        // Security: block file:// URI access from the WebView — app only ever loads from HTTPS
        allowFileAccess={false}
        // P7: No shared/third-party cookies — auth lives in localStorage + SecureStore (enforced at OS level)
        thirdPartyCookiesEnabled={false}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#c9a227" />
          </View>
        )}
        startInLoadingState
        />
        {webViewError && (
          <OfflineScreen onRetry={() => { setWebViewError(false); setWebViewKey(k => k + 1); }} />
        )}
      </View>

      {/* ── P4: Native image zoom modal ───────────────────────────────────── */}
      <ImageZoomModal uri={zoomImageUrl} onClose={() => setZoomImageUrl(null)} />

      {/* ── Native alert modal (replaces Android system dialogs) ─────────── */}
      <NativeAlertModal
        config={nativeDialog}
        onClose={() => setNativeDialog(null)}
        appearance={shellTheme}
      />

      {/* ── Pack picker modal (Google Play Billing) ──────────────────────── */}
      <PackPickerModal
        visible={packPickerOpen}
        packages={packPickerPackages}
        selectedIdx={packPickerSelectedIdx}
        onSelect={setPackPickerSelectedIdx}
        onConfirm={() => { void executePurchaseFromPicker(); }}
        onCancel={() => setPackPickerOpen(false)}
        busy={packPickerBusy}
        appearance={shellTheme}
        ui={{
          title: nativeUi.purchaseTitle,
          confirmBtn: nativeUi.ok,
          cancel: nativeUi.cancel,
        }}
      />

      {debugLogs.length > 0 && (
        <View style={{ position: 'absolute', bottom: 100, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', padding: 8, zIndex: 9999 }}>
          {debugLogs.map((log, i) => (
            <Text key={i} style={{ color: '#0f0', fontSize: 10, fontFamily: 'monospace' }}>{log}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0f14",
  },
  debugNativeRoot: {
    borderWidth: 3,
    borderColor: "#c026d3",
    backgroundColor: "rgba(192, 38, 211, 0.07)",
  },
  webviewShell: {
    flex: 1,
    minHeight: 0,
  },
  debugNativeWebViewWrap: {
    borderWidth: 3,
    borderColor: "#ca8a04",
    backgroundColor: "rgba(234, 179, 8, 0.07)",
  },
  /* ── WebView ── */
  webview: {
    flex: 1,
    backgroundColor: "#0c0f14",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0c0f14",
  },
});
