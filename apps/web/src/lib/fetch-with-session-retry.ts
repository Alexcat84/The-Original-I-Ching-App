import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";

function withBearer(accessToken: string, init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers ?? undefined);
  headers.set("Authorization", `Bearer ${accessToken}`);
  return { ...init, headers };
}

/**
 * Performs fetch with Bearer auth; on 401 attempts one Supabase refreshSession + retry.
 */
export async function fetchWithSessionRetry(
  url: string,
  accessToken: string,
  onTokenRefreshed: (token: string) => void,
  init?: RequestInit,
): Promise<Response> {
  let res = await fetch(url, withBearer(accessToken, init));
  if (res.status !== 401 || !isSupabaseBrowserConfigured()) {
    return res;
  }
  try {
    const { data, error } = await getSupabaseBrowser().auth.refreshSession();
    const refreshedToken = data.session?.access_token ?? null;
    if (error || !refreshedToken) {
      return res;
    }
    onTokenRefreshed(refreshedToken);
    return fetch(url, withBearer(refreshedToken, init));
  } catch {
    return res;
  }
}
