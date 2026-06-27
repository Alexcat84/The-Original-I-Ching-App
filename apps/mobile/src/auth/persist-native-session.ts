import * as SecureStore from "expo-secure-store";
import type { RefObject } from "react";
import type WebView from "react-native-webview";

/** Mirrors web LegalConsentPayload for native → /api/auth/legal-consent. */
export type NativeLegalConsentPayload = {
  accepted: true;
  termsVersion: string;
  privacyVersion: string;
  acceptedAt: string;
  source: "apple_oauth" | "google_oauth" | "email_signup" | "post_login";
};

export type PersistNativeSessionInput = {
  accessToken: string;
  refreshToken?: string | null;
  email?: string | null;
  secureTokenKey: string;
  accessTokenRef: { current: string | null };
  authTransitionRef: { current: boolean };
  setIsAuthenticated: (value: boolean) => void;
  setUserEmail: (value: string | null) => void;
  webViewRef: RefObject<WebView | null>;
};

/** Post-OAuth session persist — paridad Google deep link L2285–2311. No Purchases.logIn. */
export async function persistNativeSession(input: PersistNativeSessionInput): Promise<void> {
  const {
    accessToken,
    refreshToken,
    email,
    secureTokenKey,
    accessTokenRef,
    authTransitionRef,
    setIsAuthenticated,
    setUserEmail,
    webViewRef,
  } = input;

  await SecureStore.setItemAsync(secureTokenKey, accessToken);
  accessTokenRef.current = accessToken;
  setIsAuthenticated(true);
  setUserEmail(email ?? null);

  authTransitionRef.current = true;
  setTimeout(() => {
    authTransitionRef.current = false;
  }, 3000);

  webViewRef.current?.injectJavaScript(`
    window.__rnInjectSession && window.__rnInjectSession({
      access_token: ${JSON.stringify(accessToken)},
      refresh_token: ${JSON.stringify(refreshToken ?? "")},
      expires_in: 3600,
      user: { email: ${JSON.stringify(email ?? null)} }
    }); true;
  `);
}

export async function postNativeLegalConsent(
  baseUrl: string,
  accessToken: string,
  consent: NativeLegalConsentPayload,
): Promise<void> {
  const res = await fetch(`${baseUrl}/api/auth/legal-consent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(consent),
  });
  if (!res.ok) {
    throw new Error(`legal_consent_http_${res.status}`);
  }
}
