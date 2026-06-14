import { useCallback, useEffect, useRef, useState } from "react";
import * as AppIntegrity from "expo-app-integrity";
import * as SecureStore from "expo-secure-store";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

const BASE_URL: string =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "https://theoriginaliching.com";

const ANDROID_CLOUD_PROJECT_NUMBER: number =
  Constants.expoConfig?.extra?.androidCloudProjectNumber ?? 564428602412;

const SECURE_TOKEN_KEY = "supabase_access_token";
const INTEGRITY_TRACE_HEADER = "x-integrity-trace-id";

const REFRESH_MARGIN_MS = 5 * 60 * 1000;
const CHALLENGE_TTL_S = 600;

interface TokenState {
  token: string;
  expiresAt: number;
  traceId: string | null;
}

async function reportIntegrityClientEvent(
  bearerToken: string,
  payload: {
    traceId: string;
    phase: string;
    ok: boolean;
    reason?: string;
    detail?: string;
    nonceFp?: string;
    tokenLen?: number;
  },
): Promise<void> {
  if (!payload.ok) {
    Sentry.captureMessage("integrity_client_event", {
      level: "warning",
      tags: {
        api: "integrity",
        source: "mobile",
        phase: payload.phase,
        reason: payload.reason ?? payload.phase,
      },
      extra: {
        traceId: payload.traceId,
        detail: payload.detail ?? null,
        nonceFp: payload.nonceFp ?? null,
        tokenLen: payload.tokenLen ?? null,
      },
    });
  }

  try {
    await fetch(`${BASE_URL}/api/integrity/client-event`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-fatal — telemetry only
  }
}

/**
 * Manages Play Integrity attestation for the Android shell.
 * Optional traceId correlates native → challenge → consult in Axiom.
 */
export function useIntegrityCheck(isAuthenticated: boolean) {
  const [tokenState, setTokenState] = useState<TokenState | null>(null);
  const currentTokenRef = useRef<string | null>(null);
  const currentTraceIdRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAndStore = useCallback(async (traceId?: string): Promise<string | null> => {
    const activeTraceId =
      traceId ?? `itr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    try {
      const bearerToken = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
      if (!bearerToken) return null;

      void reportIntegrityClientEvent(bearerToken, {
        traceId: activeTraceId,
        phase: "refresh_start",
        ok: true,
      });

      const res = await fetch(`${BASE_URL}/api/integrity/challenge`, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          [INTEGRITY_TRACE_HEADER]: activeTraceId,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        void reportIntegrityClientEvent(bearerToken, {
          traceId: activeTraceId,
          phase: "challenge_http",
          ok: false,
          reason: `http_${res.status}`,
        });
        return null;
      }

      const body = (await res.json()) as {
        challenge: string;
        nonceFp?: string;
      };

      void reportIntegrityClientEvent(bearerToken, {
        traceId: activeTraceId,
        phase: "challenge_ok",
        ok: true,
        nonceFp: body.nonceFp,
        detail: `len_${body.challenge.length}`,
      });

      const token = await AppIntegrity.attestKey(body.challenge, ANDROID_CLOUD_PROJECT_NUMBER);

      void reportIntegrityClientEvent(bearerToken, {
        traceId: activeTraceId,
        phase: "attest_ok",
        ok: true,
        nonceFp: body.nonceFp,
        tokenLen: token.length,
      });

      const expiresAt = Date.now() + (CHALLENGE_TTL_S - 60) * 1000;
      currentTokenRef.current = token;
      currentTraceIdRef.current = activeTraceId;
      setTokenState({ token, expiresAt, traceId: activeTraceId });

      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      const msUntilRefresh = Math.max(0, expiresAt - Date.now() - REFRESH_MARGIN_MS);
      refreshTimerRef.current = setTimeout(() => {
        void fetchAndStore();
      }, msUntilRefresh);

      return token;
    } catch (err) {
      const bearerToken = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
      if (bearerToken) {
        void reportIntegrityClientEvent(bearerToken, {
          traceId: activeTraceId,
          phase: "attest_error",
          ok: false,
          reason: err instanceof Error ? err.message.slice(0, 120) : "unknown",
        });
      }
      currentTokenRef.current = null;
      currentTraceIdRef.current = null;
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      currentTokenRef.current = null;
      currentTraceIdRef.current = null;
      setTokenState(null);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      return;
    }
    void fetchAndStore();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [isAuthenticated, fetchAndStore]);

  return {
    currentTokenRef,
    currentTraceIdRef,
    tokenState,
    refreshToken: fetchAndStore,
  };
}

export function createIntegrityTraceId(): string {
  return `itr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
