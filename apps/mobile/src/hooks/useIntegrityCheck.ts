import { useCallback, useEffect, useRef, useState } from "react";
import * as AppIntegrity from "expo-app-integrity";
import Constants from "expo-constants";

const BASE_URL: string =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "https://theoriginaliching.com";

/** How long (ms) before expiry we proactively refresh the token. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000; // 5 minutes before TTL

/** TTL of challenge nonces on the server (seconds). */
const CHALLENGE_TTL_S = 600;

interface TokenState {
  token: string;
  expiresAt: number; // Date.now() ms
}

/**
 * Manages a Play Integrity attestation token for the Android app.
 *
 * Flow:
 *  1. Fetches a challenge nonce from /api/integrity/challenge.
 *  2. Calls AppIntegrity.getAttestationAsync(challenge) — native only.
 *  3. Returns the token via `currentToken` ref for injection into the WebView.
 *  4. Auto-refreshes 5 minutes before the TTL expires.
 *
 * On emulators or in development, getAttestationAsync throws — errors are
 * swallowed and `currentToken` stays null (backend is permissive in dev).
 */
export function useIntegrityCheck() {
  const [tokenState, setTokenState] = useState<TokenState | null>(null);
  const currentTokenRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAndStore = useCallback(async (): Promise<string | null> => {
    try {
      // 1. Get a server-issued nonce.
      const res = await fetch(`${BASE_URL}/api/integrity/challenge`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      const { challenge } = (await res.json()) as { challenge: string };

      // 2. Attest — throws on emulator / dev build without Play Services.
      const token = await AppIntegrity.getAttestationAsync(challenge);

      // 3. Cache with expiry slightly shorter than server TTL.
      const expiresAt = Date.now() + (CHALLENGE_TTL_S - 60) * 1000;
      currentTokenRef.current = token;
      setTokenState({ token, expiresAt });

      // 4. Schedule next refresh.
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      const msUntilRefresh = Math.max(0, expiresAt - Date.now() - REFRESH_MARGIN_MS);
      refreshTimerRef.current = setTimeout(() => {
        void fetchAndStore();
      }, msUntilRefresh);

      return token;
    } catch {
      // Emulator / dev / no Play Services — stay null; backend is permissive.
      currentTokenRef.current = null;
      return null;
    }
  }, []);

  // Initial fetch on mount.
  useEffect(() => {
    void fetchAndStore();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [fetchAndStore]);

  return { currentTokenRef, tokenState, refreshToken: fetchAndStore };
}
