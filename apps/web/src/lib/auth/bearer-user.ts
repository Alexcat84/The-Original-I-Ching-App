import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type AuthenticatedUser = {
  userId: string;
  email: string;
};

// In-process JWT validation cache — avoids redundant auth.getUser round-trips
// for the same token within a 60-second window. Invalidated on logout (token changes).
// Key: raw JWT string. Value: { user, expiresAt }.
const jwtCache = new Map<string, { user: AuthenticatedUser; expiresAt: number }>();
const JWT_CACHE_TTL_MS = 60_000;

function pruneJwtCache() {
  const now = Date.now();
  for (const [k, v] of jwtCache) {
    if (v.expiresAt <= now) jwtCache.delete(k);
  }
}

/**
 * Validates Supabase access token from Authorization: Bearer …
 * Requires a confirmed email (Google OAuth sets this; email/password after clicking confirm link).
 * Caches valid tokens for 60 s to avoid a PostgREST round-trip on every API call.
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  // Cache hit — skip network round-trip.
  const cached = jwtCache.get(token);
  if (cached && cached.expiresAt > Date.now()) return cached.user;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) return null;

  const email = data.user.email ?? "";
  if (!email) return null;

  if (!data.user.email_confirmed_at) {
    return null;
  }

  const user: AuthenticatedUser = { userId: data.user.id, email };
  pruneJwtCache();
  jwtCache.set(token, { user, expiresAt: Date.now() + JWT_CACHE_TTL_MS });
  return user;
}

/**
 * Invalidates any cached entry for this token (call on logout or token revocation).
 * Sensitive operations (delete account, 2FA changes) should call auth.getUser directly
 * rather than relying on getAuthenticatedUser to bypass the cache.
 */
export function invalidateAuthCache(token: string) {
  jwtCache.delete(token);
}
