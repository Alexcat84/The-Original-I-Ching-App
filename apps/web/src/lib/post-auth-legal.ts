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

export type LegalAcceptanceStatus = {
  /** Whether the user has accepted the CURRENT terms/privacy versions. */
  current: boolean;
  /** Whether the user has any prior acceptance (older version) on record. */
  hasPrior: boolean;
};

/**
 * Reads legal acceptance status from GET /api/account/me.
 * Lets the consent screen distinguish a first-time acceptance from a re-acceptance
 * triggered by an updated policy/terms version.
 * @returns the status, or null if the session token was rejected (401).
 */
export async function fetchLegalAcceptanceStatus(
  accessToken: string,
): Promise<LegalAcceptanceStatus | null> {
  const res = await fetch("/api/account/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) return { current: false, hasPrior: false };
  const data = (await res.json()) as {
    legal_acceptance_current?: boolean;
    legal_has_prior_acceptance?: boolean;
  };
  return {
    current: Boolean(data.legal_acceptance_current),
    hasPrior: Boolean(data.legal_has_prior_acceptance),
  };
}

/**
 * Where to send the user immediately after auth (OAuth callback or password login).
 */
export async function resolvePostAuthClientRoute(accessToken: string): Promise<PostAuthClientRoute> {
  const legal = await fetchLegalAcceptanceCurrent(accessToken);
  if (legal === null) return "/login";
  return legal ? "/" : "/auth/complete-legal";
}
