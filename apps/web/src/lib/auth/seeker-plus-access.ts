import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PACK_IDS_ORDERED } from "@/lib/token-packs";
import type { AuthenticatedUser } from "./bearer-user";

export type SeekerPlusAccessResult =
  | { allowed: true; tier: string }
  | { allowed: false; reason: "upgrade_required" | "server_error"; tier?: string };

/**
 * Seeker+ gate shared by library and mutation explorer (admin bypass included).
 */
export async function getSeekerPlusAccess(
  authUser: AuthenticatedUser,
): Promise<SeekerPlusAccessResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { allowed: false, reason: "server_error" };
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", authUser.userId)
    .maybeSingle();

  if (userRow?.is_admin === true) {
    return { allowed: true, tier: "admin" };
  }

  const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.includes(authUser.email.toLowerCase())) {
    return { allowed: true, tier: "admin" };
  }

  const { data: credits } = await supabase
    .from("query_credits")
    .select("last_pack")
    .eq("user_id", authUser.userId)
    .maybeSingle();

  const lastPack = credits?.last_pack ?? "free";
  if (!(PACK_IDS_ORDERED as readonly string[]).includes(lastPack)) {
    return { allowed: false, reason: "upgrade_required", tier: lastPack };
  }

  return { allowed: true, tier: lastPack };
}
