import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import * as SecureStore from "expo-secure-store";
import * as Sharing from "expo-sharing";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from "react-native-webview";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://the-original-i-ching-app-git-staging-alexs-projects-e8bf95b4.vercel.app";

// Supabase project — needed to construct the Google OAuth URL from native side.
// IMPORTANT: Add "theoriginaliching://auth/callback" to your Supabase project's
// Auth > URL Configuration > Redirect URLs for Google OAuth deep-link to work.
const SUPABASE_URL = "https://idirklxzohzthdgsuqzb.supabase.co";

const SECURE_TOKEN_KEY = "supabase_access_token";
const LOCALE_STORAGE_KEY = "iching_native_locale";

type AppLocale = "es" | "en" | "pt" | "fr" | "de" | "it" | "ja" | "zh" | "ko";

const LOCALES: { code: AppLocale; label: string }[] = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "it", label: "IT" },
  { code: "ja", label: "JA" },
  { code: "zh", label: "ZH" },
  { code: "ko", label: "KO" },
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
 *  2. Intercept <a download> clicks (images & PDFs) → postMessage to RN
 *  3. Patch Google OAuth button → postMessage to RN (opens in external browser)
 *  4. Extract & relay Supabase access token → RN stores in SecureStore
 *  5. Intercept DELETE /api/account/chats → RN executes with stored token
 *  6. Expose __rnSetLocale() so RN can change the web app locale
 *  7. Allow pinch-zoom by un-locking the viewport meta tag
 */
const INJECTED_JS = `
(function () {
  if (window.__rnBridgeInstalled) return;
  window.__rnBridgeInstalled = true;

  /* 1 ── Hide web top bar ─────────────────────────────────────────────── */
  var _st = document.createElement('style');
  _st.textContent = '.auth-explore-strip{display:none!important}';
  (document.head || document.documentElement).appendChild(_st);

  /* 7 ── Allow pinch-zoom ─────────────────────────────────────────────── */
  function _unlockZoom() {
    var vp = document.querySelector('meta[name="viewport"]');
    if (vp) {
      vp.setAttribute('content',
        'width=device-width, initial-scale=1, user-scalable=yes, maximum-scale=5');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _unlockZoom);
  } else {
    _unlockZoom();
  }

  /* 2 ── Intercept <a download> clicks ────────────────────────────────── */
  var _origAClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.download && this.href) {
      var href = this.href;
      var filename = this.download || 'download';
      var postDl = function (dataUrl) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'download_file', filename: filename, dataUrl: dataUrl })
        );
      };
      if (href.indexOf('data:') === 0) { postDl(href); return; }
      if (href.indexOf('blob:') === 0) {
        fetch(href).then(function (r) { return r.blob(); }).then(function (blob) {
          var rd = new FileReader();
          rd.onloadend = function () { postDl(rd.result); };
          rd.readAsDataURL(blob);
        }).catch(function () { _origAClick.call(this); }.bind(this));
        return;
      }
    }
    _origAClick.call(this);
  };

  /* 3 ── Patch Google OAuth buttons ───────────────────────────────────── */
  function _patchGoogle() {
    document.querySelectorAll('.auth-pro-btn-google:not([data-rn])').forEach(function (btn) {
      btn.setAttribute('data-rn', '1');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'open_google_auth' })
        );
      }, true);
    });
  }
  _patchGoogle();
  new MutationObserver(_patchGoogle).observe(document.documentElement, { childList: true, subtree: true });

  /* 4 ── Relay Supabase access token ──────────────────────────────────── */
  function _sendToken() {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key) continue;
      if (key.indexOf('auth-token') === -1 && key.indexOf('supabase.auth.token') === -1) continue;
      try {
        var d = JSON.parse(localStorage.getItem(key) || 'null');
        if (!d) continue;
        var tok = d.access_token || (d.currentSession && d.currentSession.access_token);
        if (tok) {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'auth_token', token: tok })
          );
          return;
        }
      } catch (_) {}
    }
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'auth_signout' })
    );
  }
  setTimeout(_sendToken, 900);
  window.addEventListener('storage', _sendToken);

  /* 5 ── Intercept DELETE /api/account/chats ───────────────────────────── */
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

  /* 6 ── Locale setter callable from RN ───────────────────────────────── */
  window.__rnSetLocale = function (locale) {
    var sel = document.getElementById('ui-locale-select');
    if (sel) {
      sel.value = locale;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };
})();
true;
`;

type RNMessage =
  | { type: "auth_token"; token: string }
  | { type: "auth_signout" }
  | { type: "open_google_auth" }
  | { type: "download_file"; filename: string; dataUrl: string }
  | { type: "delete_chat"; url: string; reqId: string };

export default function WebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState(BASE_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const splashHidden = useRef(false);

  /* ── Auth state ── */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const accessTokenRef = useRef<string | null>(null);

  /* ── Locale state ── */
  const [locale, setLocaleState] = useState<AppLocale>("es");

  /* ── Safe area insets (status bar height on Android) ── */
  const insets = useSafeAreaInsets();

  /* ── Media permission ── */
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  /* ── Restore token + locale from storage on cold start ── */
  useEffect(() => {
    SecureStore.getItemAsync(SECURE_TOKEN_KEY).then((tok) => {
      if (tok) {
        accessTokenRef.current = tok;
        setIsAuthenticated(true);
      }
    });
    AsyncStorage.getItem(LOCALE_STORAGE_KEY).then((saved) => {
      if (saved && LOCALES.some((l) => l.code === saved)) {
        setLocaleState(saved as AppLocale);
      }
    });
  }, []);

  const hideSplash = useCallback(() => {
    if (!splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync();
    }
  }, []);

  /* ── Deep link handler (auth callback) ── */
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        const webUrl = deepLinkToWebUrl(url);
        if (webUrl) setCurrentUrl(webUrl);
      }
    });
    const sub = Linking.addEventListener("url", ({ url }) => {
      const webUrl = deepLinkToWebUrl(url);
      if (webUrl) setCurrentUrl(webUrl);
    });
    return () => sub.remove();
  }, []);

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

  /* ── Change locale in the web app via injected JS ── */
  const changeLocale = useCallback((newLocale: AppLocale) => {
    setLocaleState(newLocale);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    webViewRef.current?.injectJavaScript(
      `window.__rnSetLocale && window.__rnSetLocale(${JSON.stringify(newLocale)}); true;`
    );
  }, []);

  /* ── P3 / P4: Handle file download ── */
  const handleFileDownload = useCallback(
    async (filename: string, dataUrl: string) => {
      try {
        const isPdf =
          filename.toLowerCase().endsWith(".pdf") ||
          dataUrl.startsWith("data:application/pdf");

        const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (isPdf) {
          // P4: Share PDF via native sheet
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/pdf",
            dialogTitle: "Compartir PDF",
          });
        } else {
          // P3: Save image to gallery
          let granted = mediaPermission?.granted ?? false;
          if (!granted) {
            const result = await requestMediaPermission();
            granted = result.granted;
          }
          if (!granted) {
            Alert.alert(
              "Permiso denegado",
              "Necesitamos acceso a tu galería para guardar imágenes."
            );
            return;
          }
          await MediaLibrary.saveToLibraryAsync(fileUri);
          Alert.alert("Imagen guardada", "Se guardó en tu galería.");
        }
      } catch {
        Alert.alert("Error", "No se pudo guardar el archivo.");
      }
    },
    [mediaPermission, requestMediaPermission]
  );

  /* ── P5: Execute DELETE from RN with stored token ── */
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
            SecureStore.setItemAsync(SECURE_TOKEN_KEY, msg.token);
            break;

          case "auth_signout":
            accessTokenRef.current = null;
            setIsAuthenticated(false);
            SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
            break;

          case "open_google_auth": {
            // P1: Open Google OAuth in external browser with deep-link redirect
            const redirectTo = encodeURIComponent("theoriginaliching://auth/callback");
            Linking.openURL(
              `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`
            );
            break;
          }

          case "download_file":
            handleFileDownload(msg.filename, msg.dataUrl);
            break;

          case "delete_chat":
            handleDeleteChat(msg.url, msg.reqId);
            break;
        }
      } catch {
        // Ignore non-JSON bridge noise
      }
    },
    [handleFileDownload, handleDeleteChat]
  );

  /* ── P1 backup: intercept Google OAuth navigation at the WebView level ── */
  const onShouldStartLoadWithRequest = useCallback(
    (request: { url: string }): boolean => {
      const { url } = request;
      if (url.includes("/auth/v1/authorize") && url.includes("provider=google")) {
        try {
          const parsed = new URL(url);
          parsed.searchParams.set("redirect_to", "theoriginaliching://auth/callback");
          const oauthUrl = parsed.toString();
          setTimeout(() => Linking.openURL(oauthUrl), 50);
        } catch {
          setTimeout(() => Linking.openURL(url), 50);
        }
        return false;
      }
      return true;
    },
    []
  );

  const onNavigationStateChange = (state: WebViewNavigation) => {
    setCanGoBack(state.canGoBack);
  };

  return (
    <View style={styles.container}>
      {/* ── P2: Native top bar ─────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        {/* Locale switcher — 9 languages, horizontally scrollable */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.localeScroll}
          contentContainerStyle={styles.localeScrollContent}
        >
          {LOCALES.map(({ code, label }) => (
            <TouchableOpacity
              key={code}
              style={[styles.localePill, locale === code && styles.localePillActive]}
              onPress={() => changeLocale(code)}
              activeOpacity={0.7}
            >
              <Text style={[styles.localeText, locale === code && styles.localeTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sign-in button — only visible when not authenticated */}
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => setCurrentUrl(`${BASE_URL}/login`)}
            activeOpacity={0.7}
          >
            <Text style={styles.signInText}>Iniciar sesión</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── WebView ────────────────────────────────────────────────────── */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onLoadEnd={hideSplash}
        onNavigationStateChange={onNavigationStateChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onMessage={onMessage}
        injectedJavaScript={INJECTED_JS}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={["*", "theoriginaliching://*"]}
        // P3: Enable pinch-to-zoom
        scalesPageToFit={false}
        pinchGestureEnabled
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#c9a227" />
          </View>
        )}
        startInLoadingState
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
      />
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
  localeScroll: {
    flexShrink: 1,
    flexGrow: 0,
  },
  localeScrollContent: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    paddingRight: 8,
  },
  localePill: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.25)",
  },
  localePillActive: {
    backgroundColor: "rgba(201,162,39,0.12)",
    borderColor: "rgba(201,162,39,0.6)",
  },
  localeText: {
    color: "rgba(201,162,39,0.45)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  localeTextActive: {
    color: "#c9a227",
  },
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
