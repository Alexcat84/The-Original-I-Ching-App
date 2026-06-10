import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;

export type AuthResilienceResult = {
  response: Response;
  /** True when retries (including refresh) are exhausted for this operation. */
  exhausted: boolean;
  attempts: number;
  refreshed: boolean;
};

function withBearer(accessToken: string, init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers ?? undefined);
  headers.set("Authorization", `Bearer ${accessToken}`);
  return { ...init, headers };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function transientDelayMs(retryIndex: number): number {
  return Math.min(2 ** retryIndex * 500 + Math.random() * 300, 4000);
}

function logAuthResilienceRetry(
  label: string,
  detail: Record<string, unknown>,
): void {
  console.warn("[auth_resilience_retry]", label, detail);
}

/**
 * Fetch with Bearer auth, one refreshSession on first 401, and jittered backoff
 * on transient PostgREST/Vercel statuses (429/5xx).
 */
export async function fetchWithAuthResilience(
  url: string,
  accessToken: string,
  onTokenRefreshed: (token: string) => void,
  init?: RequestInit,
  label = "fetch",
): Promise<AuthResilienceResult> {
  let token = accessToken;
  let attempts = 0;
  let refreshed = false;
  let refreshAttempted = false;

  while (attempts < MAX_ATTEMPTS) {
    attempts += 1;
    const response = await fetch(url, withBearer(token, init));

    if (response.ok) {
      return { response, exhausted: false, attempts, refreshed };
    }

    if (response.status === 401 && isSupabaseBrowserConfigured() && !refreshAttempted) {
      refreshAttempted = true;
      try {
        const { data, error } = await getSupabaseBrowser().auth.refreshSession();
        const refreshedToken = data.session?.access_token ?? null;
        if (!error && refreshedToken) {
          refreshed = true;
          token = refreshedToken;
          onTokenRefreshed(refreshedToken);
          continue;
        }
      } catch {
        // fall through to exhausted 401
      }
      return { response, exhausted: true, attempts, refreshed };
    }

    if (response.status === 401) {
      // After a successful refresh, 401 is usually server-side auth validation
      // flaking under PostgREST load — retry with backoff instead of signing out.
      if (refreshed && attempts < MAX_ATTEMPTS) {
        const delayMs = Math.round(transientDelayMs(attempts - 1));
        logAuthResilienceRetry(label, {
          url,
          status: 401,
          attempt: attempts,
          delayMs,
          reason: "post_refresh_401",
        });
        await sleep(delayMs);
        continue;
      }
      return { response, exhausted: true, attempts, refreshed };
    }

    if (!TRANSIENT_STATUSES.has(response.status)) {
      return { response, exhausted: false, attempts, refreshed };
    }

    if (attempts >= MAX_ATTEMPTS) {
      return { response, exhausted: true, attempts, refreshed };
    }

    const delayMs = Math.round(transientDelayMs(attempts - 1));
    logAuthResilienceRetry(label, {
      url,
      status: response.status,
      attempt: attempts,
      delayMs,
    });
    await sleep(delayMs);
  }

  return {
    response: new Response(null, { status: 503 }),
    exhausted: true,
    attempts,
    refreshed,
  };
}

export async function shouldSignOutAfterAuthResilience(
  result: AuthResilienceResult,
): Promise<boolean> {
  if (!result.exhausted || result.response.status !== 401) return false;
  if (!isSupabaseBrowserConfigured()) return true;
  try {
    const { data } = await getSupabaseBrowser().auth.getSession();
    if (data.session?.access_token) {
      console.warn("[auth_resilience_retry] skip_sign_out_valid_client_session", {
        refreshed: result.refreshed,
        attempts: result.attempts,
      });
      return false;
    }
  } catch {
    // fall through — no client session → sign out
  }
  return true;
}

export function isTransientAuthResilienceFailure(result: AuthResilienceResult): boolean {
  if (!result.exhausted) return false;
  if (TRANSIENT_STATUSES.has(result.response.status)) return true;
  // Post-refresh 401: JWT is valid client-side; server auth validation likely flaked.
  return result.response.status === 401 && result.refreshed;
}
