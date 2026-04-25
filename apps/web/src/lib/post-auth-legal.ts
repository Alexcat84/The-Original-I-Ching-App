/**
 * Client-side helpers: after Supabase session exists, decide whether the user
 * must complete current legal acceptance before entering the app.
 */

export type PostAuthClientRoute = "/" | "/auth/complete-legal" | "/login";

/**
 * Reads legal_acceptance_current from GET /api/account/me.
 * @returns true/false from API body, or null if the session token was rejected (401).
 */
export async function fetchLegalAcceptanceCurrent(accessToken: string): Promise<boolean | null> {
  const res = await fetch("/api/account/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) return false;
  const data = (await res.json()) as { legal_acceptance_current?: boolean };
  return Boolean(data.legal_acceptance_current);
}

/**
 * Where to send the user immediately after auth (OAuth callback or password login).
 */
export async function resolvePostAuthClientRoute(accessToken: string): Promise<PostAuthClientRoute> {
  const legal = await fetchLegalAcceptanceCurrent(accessToken);
  if (legal === null) return "/login";
  return legal ? "/" : "/auth/complete-legal";
}
