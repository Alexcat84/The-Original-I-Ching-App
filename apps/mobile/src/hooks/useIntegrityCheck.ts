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
const CHALLENGE_FETCH_TIMEOUT_MS = 15_000;

/**
 * Bounded backoff after a failed refresh. Before this existed, a single failure
 * left the shell with no attestation until something else happened to trigger a
 * refresh: the periodic timer is only armed on the success path, so nothing
 * retried. Past the last entry we stop rather than poll, because a session still
 * rejected after ~7 minutes needs a real auth change, not more requests.
 */
const RETRY_BACKOFF_MS = [30_000, 120_000, 300_000];

/**
 * Safety valve for the in-flight guard: if a refresh somehow never settles (a
 * hung attestation call), a later caller may start a fresh one instead of
 * awaiting a promise that will never resolve.
 */
const IN_FLIGHT_MAX_MS = 90_000;

/** Same shape the sync service uses: abort a request that never comes back. */
function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

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
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<{ promise: Promise<string | null>; startedAt: number } | null>(null);
  const failureCountRef = useRef(0);
  /**
   * False until mounted and again once unmounted, so a pending timer never fires
   * into a torn-down hook. It stays true while signed out on purpose: the WebView
   * bridge may still ask for a token, and that path must be able to arm the
   * periodic refresh if it succeeds.
   */
  const activeRef = useRef(false);
  const fetchAndStoreRef = useRef<(traceId?: string) => Promise<string | null>>(
    async () => null,
  );

  const clearTimers = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const scheduleRetry = useCallback(() => {
    if (!activeRef.current) return;
    if (failureCountRef.current >= RETRY_BACKOFF_MS.length) return; // exhausted: stop, do not poll
    const delay = RETRY_BACKOFF_MS[failureCountRef.current];
    failureCountRef.current += 1;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = null;
      if (!activeRef.current) return;
      void fetchAndStoreRef.current();
    }, delay);
  }, []);

  const runRefresh = useCallback(async (traceId?: string): Promise<string | null> => {
    const activeTraceId = traceId ?? createIntegrityTraceId();
    const attempt = failureCountRef.current + 1;
    let bearerToken: string | null = null;

    try {
      bearerToken = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
      if (!bearerToken) return null;

      void reportIntegrityClientEvent(bearerToken, {
        traceId: activeTraceId,
        phase: "refresh_start",
        ok: true,
      });

      const res = await fetchWithTimeout(
        `${BASE_URL}/api/integrity/challenge`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            [INTEGRITY_TRACE_HEADER]: activeTraceId,
          },
          cache: "no-store",
        },
        CHALLENGE_FETCH_TIMEOUT_MS,
      );

      if (!res.ok) {
        void reportIntegrityClientEvent(bearerToken, {
          traceId: activeTraceId,
          phase: "challenge_http",
          ok: false,
          reason: `http_${res.status}`,
          detail: `attempt_${attempt}`,
        });
        scheduleRetry();
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

      failureCountRef.current = 0;
      clearTimers();
      const msUntilRefresh = Math.max(0, expiresAt - Date.now() - REFRESH_MARGIN_MS);
      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        if (!activeRef.current) return;
        void fetchAndStoreRef.current();
      }, msUntilRefresh);

      return token;
    } catch (err) {
      const reportToken = bearerToken ?? (await SecureStore.getItemAsync(SECURE_TOKEN_KEY));
      if (reportToken) {
        void reportIntegrityClientEvent(reportToken, {
          traceId: activeTraceId,
          phase: "attest_error",
          ok: false,
          reason: err instanceof Error ? err.message.slice(0, 120) : "unknown",
          detail: `attempt_${attempt}`,
        });
      }
      currentTokenRef.current = null;
      currentTraceIdRef.current = null;
      scheduleRetry();
      return null;
    }
  }, [clearTimers, scheduleRetry]);

  /**
   * Collapses concurrent refreshes into one. The shell can ask for a token from
   * two places at once (the auth effect on cold start and the WebView bridge),
   * which previously fired two challenges milliseconds apart and burned two
   * slots of the endpoint's rate limit for a single token.
   */
  const fetchAndStore = useCallback(
    (traceId?: string): Promise<string | null> => {
      const inFlight = inFlightRef.current;
      if (inFlight && Date.now() - inFlight.startedAt < IN_FLIGHT_MAX_MS) {
        return inFlight.promise;
      }
      const startedAt = Date.now();
      const promise: Promise<string | null> = runRefresh(traceId).finally(() => {
        if (inFlightRef.current?.promise === promise) {
          inFlightRef.current = null;
        }
      });
      inFlightRef.current = { promise, startedAt };
      return promise;
    },
    [runRefresh],
  );

  fetchAndStoreRef.current = fetchAndStore;

  useEffect(() => {
    activeRef.current = true;

    if (!isAuthenticated) {
      currentTokenRef.current = null;
      currentTraceIdRef.current = null;
      setTokenState(null);
      failureCountRef.current = 0;
      clearTimers();
      return () => {
        activeRef.current = false;
        clearTimers();
      };
    }

    failureCountRef.current = 0;
    void fetchAndStore();
    return () => {
      activeRef.current = false;
      clearTimers();
    };
  }, [isAuthenticated, fetchAndStore, clearTimers]);

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
