import { useCallback, useEffect, useRef, useState } from "react";
import * as AppIntegrity from "expo-app-integrity";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const BASE_URL: string =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "https://theoriginaliching.com";

const ANDROID_CLOUD_PROJECT_NUMBER: number =
  Constants.expoConfig?.extra?.androidCloudProjectNumber ?? 564428602412;

const SECURE_TOKEN_KEY = "supabase_access_token";

/** How long (ms) before expiry we proactively refresh the token. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

/** TTL of challenge nonces on the server (seconds). */
const CHALLENGE_TTL_S = 600;

interface TokenState {
  token: string;
  expiresAt: number;
}

/**
 * Manages a Play Integrity attestation token for the Android app.
 *
 * Flow:
 *  1. Reads the stored Bearer token (requires the user to be logged in).
 *  2. Fetches a challenge nonce from /api/integrity/challenge (authenticated).
 *  3. Calls AppIntegrity.getAttestationAsync(challenge) — native only.
 *  4. Returns the token via `currentToken` ref for injection into the WebView.
 *  5. Auto-refreshes 5 minutes before the TTL expires.
 *
 * On emulators or in development, getAttestationAsync throws — errors are
 * swallowed and `currentToken` stays null (backend is permissive in dev).
 *
 * Security note: the challenge endpoint requires Bearer auth so nonces are
 * bound to a real authenticated user and cannot be minted anonymously.
 */
export function useIntegrityCheck() {
  const [tokenState, setTokenState] = useState<TokenState | null>(null);
  const currentTokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAndStore = useCallback(async (): Promise<string | null> => {
    try {
      // 1. Read the stored Bearer token — challenge requires auth.
      const bearerToken = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
      if (!bearerToken) return null; // Not logged in yet; will retry on next auth change.

      // 2. Get a server-issued nonce (authenticated, rate-limited).
      const res = await fetch(`${BASE_URL}/api/integrity/challenge`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const { challenge } = (await res.json()) as { challenge: string };

      // 3. Attest — throws on emulator / dev build without Play Services.
      const token = await AppIntegrity.getAttestationAsync(challenge, ANDROID_CLOUD_PROJECT_NUMBER);

      // 4. Cache with expiry slightly shorter than server TTL.
      const expiresAt = Date.now() + (CHALLENGE_TTL_S - 60) * 1000;
      currentTokenRef.current = token;
      setTokenState({ token, expiresAt });

      // 5. Schedule next refresh.
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      const msUntilRefresh = Math.max(0, expiresAt - Date.now() - REFRESH_MARGIN_MS);
      refreshTimerRef.current = setTimeout(() => {
        void fetchAndStore();
      }, msUntilRefresh);

      return token;
    } catch {
      // Emulator / dev / no Play Services — stay null; backend is permissive in dev.
      currentTokenRef.current = null;
      return null;
    }
  }, []);

  useEffect(() => {
    void fetchAndStore();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [fetchAndStore]);

  return { currentTokenRef, tokenState, refreshToken: fetchAndStore };
}
