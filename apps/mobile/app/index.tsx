import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases from "react-native-purchases";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import * as SecureStore from "expo-secure-store";
import * as Sharing from "expo-sharing";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  DeviceEventEmitter,
  Dimensions,
  type GestureResponderEvent,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewNavigation,
} from "react-native-webview";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://the-original-i-ching-app-git-staging-alexs-projects-e8bf95b4.vercel.app";

// Supabase project — needed to construct the Google OAuth URL from native side.
// IMPORTANT: Add "theoriginaliching://auth/callback" to your Supabase project's
// Auth > URL Configuration > Redirect URLs for Google OAuth deep-link to work.
const SUPABASE_URL = "https://idirklxzohzthdgsuqzb.supabase.co";
// Anon key is public — same value as NEXT_PUBLIC_SUPABASE_ANON_KEY in the web app.
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaXJrbHh6b2h6dGhkZ3N1cXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDc2MzAsImV4cCI6MjA4OTkyMzYzMH0.qfSINYXkiGBDVdq7ojPRKGJkPlKXS-j_KKktqv0eyD4";

const SECURE_TOKEN_KEY = "supabase_access_token";
const LOCALE_STORAGE_KEY = "iching_native_locale";

type AppLocale = "es" | "en" | "pt" | "fr" | "de" | "it" | "ja" | "zh" | "ko";

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
];

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
 *  1. Hide the web top bar (.auth-explore-strip) — replaced by native bar
 *  2. Lock viewport zoom (zoom on chat images is handled natively)
 *  3. Intercept <a download> clicks AND native click events (images & PDFs)
 *  4. Patch Google OAuth button → postMessage to RN (opens in external browser)
 *  5. Extract & relay Supabase access token + email → RN stores in SecureStore
 *     (fast retries to avoid brief "limit reached" flash on navigation — P1)
 *  6. Intercept DELETE /api/account/chats → RN executes with stored token
 *  7. Expose __rnSetLocale() so RN can change the web app locale
 *  8. Expose __rnSignOut() so RN native sign-out button works
 *  9. Expose __rnNavigateTo() for SPA navigation without full reload
 * 10. Intercept taps on generated chat images → postMessage to open native zoom modal
 */
const INJECTED_JS = `
(function () {
  if (window.__rnBridgeInstalled) return;
  window.__rnBridgeInstalled = true;

  /* 1 ── Hide web top bar + neutralize vertical gaps (P7 — DEBUG + v4 fix) */
  var _st = document.createElement('style');
  _st.textContent = [
    '.auth-explore-strip{display:none!important}',
    'html,body{height:100%!important;min-height:100%!important;max-height:none!important;margin:0!important;padding:0!important;overflow:hidden!important}',
    '.iching-oracle-shell--chat{height:100%!important;min-height:100%!important;max-height:none!important;overflow:hidden!important;padding:0!important;margin:0!important;background:transparent!important}',
    '.chat-surface{margin-top:0!important;margin-bottom:0!important;padding:0!important;border-radius:0!important;border:none!important;box-shadow:none!important}',
    '.chat-history{padding-bottom:0!important}',
    '.composer-dock{padding-bottom:0!important}',
    '.composer-minibar{padding:0.5rem 0.65rem 0.55rem!important}'
  ].join(';');
  (document.head || document.documentElement).appendChild(_st);
  // Debug: confirm injection worked
  setTimeout(function(){if(window.ReactNativeWebView){var s=_st.textContent.replace(/!/g,'I');window.ReactNativeWebView.postMessage('CSS_INJECTED_OK|'+s.slice(0,200));}},1500);

  /* 1b ── Android WebView / API 35: dvh/vh and visualViewport can disagree → letterboxing.
          Use max(innerHeight, visualViewport.height), re-sync after shell mounts (SPA/hydration). */
  function _rnSyncShellToViewport() {
    try {
      var vv = window.visualViewport;
      var inner = typeof window.innerHeight === 'number' ? window.innerHeight : 0;
      var vvH = vv && typeof vv.height === 'number' ? vv.height : 0;
      var h = Math.max(inner, vvH);
      if (!h || h < 200) return;
      document.documentElement.style.height = h + 'px';
      document.body.style.minHeight = h + 'px';
      var shell = document.querySelector('.iching-oracle-shell--chat');
      if (shell) {
        shell.style.minHeight = h + 'px';
        shell.style.height = h + 'px';
        shell.style.maxHeight = 'none';
      }
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

  /* 7 ── Locale setter callable from RN ───────────────────────────────── */
  window.__rnSetLocale = function (locale) {
    var sel = document.getElementById('ui-locale-select');
    if (sel) {
      sel.value = locale;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

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

})();
true;
`;

type RNMessage =
  | { type: "auth_token"; token: string; email?: string | null }
  | { type: "auth_signout" }
  | { type: "open_google_auth" }
  | { type: "pkce_verifier"; verifier: string }
  | { type: "download_file"; filename: string; dataUrl: string }
  | { type: "download_file_start"; transferId: string; filename: string; mimeType?: string }
  | { type: "download_file_chunk"; transferId: string; chunk: string }
  | { type: "download_file_end"; transferId: string }
  | { type: "delete_chat"; url: string; reqId: string }
  | { type: "open_image"; url: string }
  | { type: "web_alert"; message: string }
  | { type: "web_confirm"; message: string }
  | { type: "web_prompt"; message: string; defaultValue?: string };

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

// ── Native alert modal (replaces Android system dialogs) ─────────────────────
function NativeAlertModal({
  config,
  onClose,
}: {
  config: NativeDialogConfig | null;
  onClose: () => void;
}) {
  if (!config) return null;
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={dialogStyles.backdrop}>
        <View style={dialogStyles.card}>
          {config.title ? (
            <Text style={dialogStyles.title}>{config.title}</Text>
          ) : null}
          <Text style={dialogStyles.message}>{config.message}</Text>
          <View style={dialogStyles.buttons}>
            {config.buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  dialogStyles.btn,
                  btn.style === "cancel" && dialogStyles.btnCancel,
                ]}
                onPress={() => {
                  btn.onPress?.();
                  onClose();
                }}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    dialogStyles.btnText,
                    btn.style === "cancel" && dialogStyles.btnTextCancel,
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

const dialogStyles = StyleSheet.create({
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

// ── Main screen ───────────────────────────────────────────────────────────────
export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState(BASE_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const splashHidden = useRef(false);
  const webReadyRef = useRef(false);

  /* ── Auth state (P3) ── */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const pkceVerifierRef = useRef<string | null>(null);
  const pendingSessionRef = useRef<object | null>(null);
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
  const [locale, setLocaleState] = useState<AppLocale>("es");
  const localeRef = useRef<AppLocale>("es");
  const [showLocalePicker, setShowLocalePicker] = useState(false);

  /* ── Keep localeRef in sync with locale state; re-inject when it changes post-load ── */
  useEffect(() => {
    localeRef.current = locale;
    if (webReadyRef.current) {
      webViewRef.current?.injectJavaScript(
        `window.__rnSetLocale && window.__rnSetLocale(${JSON.stringify(locale)}); true;`
      );
    }
  }, [locale]);

  /* ── Image zoom state (P4) ── */
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  /* ── Native dialog state (replaces Alert.alert + web window.alert) ── */
  const [nativeDialog, setNativeDialog] = useState<NativeDialogConfig | null>(null);
  const showNativeDialog = useCallback((config: NativeDialogConfig) => setNativeDialog(config), []);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setDebugLogs(prev => [...prev.slice(-10), `${new Date().toISOString().slice(11, 19)} ${msg}`]);
  };

  /* ── Safe area insets (status bar height on Android) ── */
  const insets = useSafeAreaInsets();

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

  /* ── Restore token + locale from storage on cold start ── */
  useEffect(() => {
    const RC_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? 'rcb_mEebmVMpfZYlBttOZNnKGUlmOzOd';
    Purchases.configure({ apiKey: RC_API_KEY });

    const purchaseSub = DeviceEventEmitter.addListener('rnPurchaseSuccess', () => {
      webViewRef.current?.injectJavaScript(
        `window.__rnForceAccountRefresh && window.__rnForceAccountRefresh(); true;`
      );
    });
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
      } else {
        accessTokenRef.current = null;
        setIsAuthenticated(false);
        setUserEmail(null);
        SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      }
    });
    AsyncStorage.getItem(LOCALE_STORAGE_KEY).then((saved) => {
      if (saved && LOCALES.some((l) => l.code === saved)) {
        setLocaleState(saved as AppLocale);
      }
    });
  }, [validateStoredToken]);

  const hideSplash = useCallback(() => {
    if (!splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync();
    }
  }, []);

  const onLoadEnd = useCallback(() => {
    webReadyRef.current = true;
    if (pendingSessionRef.current) {
      // Cold-start: exchange completed before WebView was ready; inject now.
      const session = pendingSessionRef.current;
      pendingSessionRef.current = null;
      webViewRef.current?.injectJavaScript(
        `window.__rnInjectSession && window.__rnInjectSession(${JSON.stringify(session)}); true;`
      );
    } else {
      webViewRef.current?.injectJavaScript(
        `window.__rnForceAccountRefresh && window.__rnForceAccountRefresh(); true;`
      );
    }
    // Always inject the saved locale so the web app reflects the native picker on every load.
    const currentLocale = localeRef.current;
    webViewRef.current?.injectJavaScript(
      `window.__rnSetLocale && window.__rnSetLocale(${JSON.stringify(currentLocale)}); true;`
    );
    hideSplash();
  }, [hideSplash]);

  /* ── PKCE token exchange (called from handleDeepLink and auth/callback route) ── */
  const performPkceExchange = useCallback(async (code: string): Promise<boolean> => {
    addLog(`exchange called code:${code?.substring(0, 10)}...`);

    const verifier =
      pkceVerifierRef.current ??
      (await SecureStore.getItemAsync("pkce_code_verifier"));
    addLog(`verifier:${verifier ? verifier.substring(0, 10) + '...' : 'NULL'}`);

    if (!verifier) {
      addLog('NO VERIFIER — abort');
      return false;
    }

    try {
      addLog('POST /auth/v1/token...');
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
      });
      pkceVerifierRef.current = null;
      await SecureStore.deleteItemAsync("pkce_code_verifier");

      addLog(`status:${res.status}`);
      const body = await res.json() as Record<string, unknown>;
      addLog(`body:${JSON.stringify(body).substring(0, 120)}`);

      if (res.ok) {
        const session = body as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
          token_type: string;
          user: { email?: string; id?: string };
        };
        accessTokenRef.current = session.access_token;
        await SecureStore.setItemAsync(SECURE_TOKEN_KEY, session.access_token);
        setIsAuthenticated(true);
        setUserEmail(session.user?.email ?? null);
        if (webReadyRef.current) {
          webViewRef.current?.injectJavaScript(
            `window.__rnInjectSession && window.__rnInjectSession(${JSON.stringify(session)}); true;`
          );
        } else {
          pendingSessionRef.current = session;
        }
        addLog('SUCCESS — session injected');
        return true;
      }
    } catch (e) {
      addLog(`EXCEPTION:${String(e)}`);
      pkceVerifierRef.current = null;
      await SecureStore.deleteItemAsync("pkce_code_verifier");
    }
    return false;
  }, []);

  /* ── Deep link handler (auth callback via Linking — only fires for double-slash URLs) ── */
  const handleDeepLink = useCallback(async (url: string) => {
    // Supabase can normalize redirect_to into a triple-slash URL
    // (theoriginaliching:///auth/callback). Collapse before parsing.
    const normalizedUrl = url.replace('theoriginaliching:///', 'theoriginaliching://');
    const parsed = Linking.parse(normalizedUrl);
    if (parsed.hostname !== "auth" || !parsed.path?.startsWith("/callback")) return;

    const code =
      typeof parsed.queryParams?.code === "string" ? parsed.queryParams.code : null;
    if (code) {
      const ok = await performPkceExchange(code);
      if (ok) return;
    }

    // Fallback: no verifier or exchange failed — let WebView handle the callback
    const webUrl = deepLinkToWebUrl(normalizedUrl);
    if (webUrl) setCurrentUrl(webUrl);
  }, [performPkceExchange]);

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

      // Extract access_token from hash fragment (Supabase implicit flow)
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
    webViewRef.current?.injectJavaScript(
      `window.__rnSetLocale && window.__rnSetLocale(${JSON.stringify(newLocale)}); true;`
    );
  }, []);

  /* ── P3: Sign out from native bar ── */
  const handleSignOut = useCallback(() => {
    accessTokenRef.current = null;
    setIsAuthenticated(false);
    setUserEmail(null);
    SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
    webViewRef.current?.injectJavaScript(
      `window.__rnSignOut && window.__rnSignOut(); true;`
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
          const sharingAvailable = await Sharing.isAvailableAsync();
          if (!sharingAvailable) {
            throw new Error("sharing_unavailable");
          }
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: "Compartir PDF",
          });
        } else {
          let granted = mediaPermission?.granted ?? false;
          if (!granted) {
            const result = await requestMediaPermission();
            granted = result.granted;
          }
          if (!granted) {
            showNativeDialog({
              title: "Permiso denegado",
              message: "Necesitamos acceso a tu galería para guardar imágenes.",
              buttons: [{ text: "OK" }],
            });
            return;
          }
          await MediaLibrary.saveToLibraryAsync(fileUri);
          showNativeDialog({
            title: "Imagen guardada",
            message: "Se guardó en tu galería.",
            buttons: [{ text: "OK" }],
          });
        }
      } catch {
        showNativeDialog({
          title: "Error",
          message: "No se pudo guardar el archivo.",
          buttons: [{ text: "OK" }],
        });
      }
    },
    [mediaPermission, requestMediaPermission, showNativeDialog]
  );

  /* ── P6: Execute DELETE from RN with stored token ── */
  const handleDeleteChat = useCallback(
    async (relativeUrl: string, reqId: string) => {
      const reply = (ok: boolean, status: number) => {
        webViewRef.current?.injectJavaScript(
          `window.__rnDelResponse && window.__rnDelResponse(${JSON.stringify(reqId)}, ${ok}, ${status}); true;`
        );
      };
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
      } catch {
        reply(false, 500);
      }
    },
    []
  );

  /* ── onMessage dispatcher ── */
  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data) as RNMessage;
        switch (msg.type) {
          case "auth_token":
            accessTokenRef.current = msg.token;
            setIsAuthenticated(true);
            if (msg.email) setUserEmail(msg.email);
            SecureStore.setItemAsync(SECURE_TOKEN_KEY, msg.token);
            webViewRef.current?.injectJavaScript(
              `window.__rnForceAccountRefresh && window.__rnForceAccountRefresh(); true;`
            );
            break;

          case "pkce_verifier":
            pkceVerifierRef.current = msg.verifier;
            SecureStore.setItemAsync("pkce_code_verifier", msg.verifier);
            break;

          case "auth_signout":
            if (authTransitionRef.current) break; // ignore during session injection reload
            accessTokenRef.current = null;
            setIsAuthenticated(false);
            setUserEmail(null);
            SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
            webViewRef.current?.injectJavaScript(
              `window.location.href = ${JSON.stringify(BASE_URL + "/login")}; true;`
            );
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

          case "open_image":
            setZoomImageUrl(msg.url);
            break;

          case "web_alert":
            showNativeDialog({
              message: msg.message,
              buttons: [{ text: "OK" }],
            });
            break;

          case "web_confirm":
            showNativeDialog({
              message: msg.message,
              buttons: [
                { text: "Cancelar", style: "cancel" },
                { text: "OK" },
              ],
            });
            break;

          case "web_prompt":
            showNativeDialog({
              message: msg.message,
              buttons: [{ text: "OK" }],
            });
            break;
        }
      } catch {
        // Ignore non-JSON bridge noise
      }
    },
    [handleFileDownload, handleDeleteChat, showNativeDialog]
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

      // Route same-origin navigation through SPA once WebView is ready.
      // This prevents full reload state resets that can flash false thread-limit UI.
      if (webReadyRef.current && url.startsWith(BASE_URL)) {
        const path = url.slice(BASE_URL.length) || "/";
        const isAuthCallbackPath =
          path.startsWith("/auth/callback") ||
          path.startsWith("/auth/callback?") ||
          path.startsWith("/auth/callback#");
        if (!isAuthCallbackPath) {
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
    // Re-apply saved locale after every navigation (SPA pages may reset locale state).
    const currentLocale = localeRef.current;
    webViewRef.current?.injectJavaScript(
      `window.__rnSetLocale && window.__rnSetLocale(${JSON.stringify(currentLocale)}); true;`
    );
  };

  /* ── Derive the active locale label for the compact picker button ── */
  const activeLocaleLabel =
    LOCALES.find((l) => l.code === locale)?.label ?? locale.toUpperCase();

  return (
    <View style={styles.container}>
      {/* ── P2 + P3: Native top bar — compact locale picker + user info ─── */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        {/* Compact locale picker button */}
        <TouchableOpacity
          style={styles.localePicker}
          onPress={() => setShowLocalePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.localePickerText}>{activeLocaleLabel}</Text>
          <Text style={styles.localePickerArrow}>▾</Text>
        </TouchableOpacity>

        {/* User info or sign-in */}
        {isAuthenticated ? (
          <View style={styles.userRow}>
            {userEmail ? (
              <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="middle">
                {userEmail}
              </Text>
            ) : null}
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={handleSignOut}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.signOutText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => {
              // Force navigation via JS injection — handles the edge case where
              // currentUrl is already the login URL (React state won't change,
              // so source.uri won't trigger a WebView reload without this).
              webViewRef.current?.injectJavaScript(
                `window.location.href = ${JSON.stringify(BASE_URL + "/login")}; true;`
              );
              setCurrentUrl(`${BASE_URL}/login`);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.signInText}>Iniciar sesión</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── P2: Locale picker dropdown modal ─────────────────────────────── */}
      <Modal
        visible={showLocalePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocalePicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowLocalePicker(false)}
        >
          <View style={[styles.pickerDropdown, { marginTop: insets.top + 44 }]}>
            {LOCALES.map(({ code, label, name }) => (
              <TouchableOpacity
                key={code}
                style={[styles.pickerItem, locale === code && styles.pickerItemActive]}
                onPress={() => {
                  changeLocale(code);
                  setShowLocalePicker(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerItemCode}>{label}</Text>
                <Text
                  style={[
                    styles.pickerItemName,
                    locale === code && styles.pickerItemNameActive,
                  ]}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── P4: Native image zoom modal ───────────────────────────────────── */}
      <ImageZoomModal
        uri={zoomImageUrl}
        onClose={() => setZoomImageUrl(null)}
      />

      {/* ── Native alert modal (replaces Android system dialogs) ─────────── */}
      <NativeAlertModal
        config={nativeDialog}
        onClose={() => setNativeDialog(null)}
      />

      {/* ── WebView ────────────────────────────────────────────────────────── */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onLoadEnd={onLoadEnd}
        onNavigationStateChange={onNavigationStateChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onMessage={onMessage}
        injectedJavaScript={INJECTED_JS}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={["*", "theoriginaliching://*"]}
        // P4: Disable global WebView zoom — images open in native modal instead
        scalesPageToFit={false}
        // P7: No shared/third-party cookies — auth lives in localStorage + SecureStore
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#c9a227" />
          </View>
        )}
        startInLoadingState
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
  /* ── Native top bar ── */
  topBar: {
    backgroundColor: "#0c0f14",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(201,162,39,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 8,
    minHeight: 44,
  },
  /* P2: Compact locale picker button */
  localePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.4)",
    backgroundColor: "rgba(201,162,39,0.06)",
  },
  localePickerText: {
    color: "#c9a227",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  localePickerArrow: {
    color: "rgba(201,162,39,0.6)",
    fontSize: 10,
  },
  /* P2: Locale dropdown */
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  pickerDropdown: {
    position: "absolute",
    left: 14,
    backgroundColor: "#161a22",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.25)",
    overflow: "hidden",
    minWidth: 160,
    elevation: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(201,162,39,0.1)",
  },
  pickerItemActive: {
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  pickerItemCode: {
    color: "#c9a227",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    width: 24,
  },
  pickerItemName: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },
  pickerItemNameActive: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  /* P3: User info row */
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
    maxWidth: "70%",
  },
  userEmail: {
    color: "rgba(201,162,39,0.75)",
    fontSize: 11,
    flexShrink: 1,
  },
  signOutBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(201,162,39,0.08)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.25)",
  },
  signOutText: {
    color: "rgba(201,162,39,0.6)",
    fontSize: 11,
    fontWeight: "700",
  },
  /* Sign-in button */
  signInBtn: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "rgba(201,162,39,0.08)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.35)",
  },
  signInText: {
    color: "#c9a227",
    fontSize: 12,
    fontWeight: "600",
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
