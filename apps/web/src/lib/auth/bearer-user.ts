import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type AuthenticatedUser = {
  userId: string;
  email: string;
};

/**
 * Validates Supabase access token from Authorization: Bearer …
 * Requires a confirmed email (Google OAuth sets this; email/password after clicking confirm link).
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthenticatedUser | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) return null;

  const email = data.user.email ?? "";
  if (!email) return null;

  if (!data.user.email_confirmed_at) {
    return null;
  }

  return { userId: data.user.id, email };
}
