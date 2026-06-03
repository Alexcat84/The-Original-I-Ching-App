import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PACK_IDS_ORDERED } from "@/lib/token-packs";

export const runtime = "nodejs";

/**
 * GET /api/library/access
 * Validates that the caller is an authenticated Seeker+ user (or admin).
 * Used by LibraryAccessGate to gate library pages client-side.
 */
export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return NextResponse.json({ allowed: false, reason: "auth_required" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ allowed: false, reason: "server_error" }, { status: 500 });
  }

  // Admin bypass: DB flag
  const { data: userRow } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", authUser.userId)
    .maybeSingle();

  if (userRow?.is_admin === true) {
    return NextResponse.json({ allowed: true, tier: "admin" });
  }

  // Admin bypass: email allowlist (same source as policy-engine)
  const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.includes(authUser.email.toLowerCase())) {
    return NextResponse.json({ allowed: true, tier: "admin" });
  }

  // Tier check: any paid pack (Seeker, Practitioner, Master) grants library access.
  // Free-tier users (last_pack = "free" or null) are not allowed.
  const { data: credits } = await supabase
    .from("query_credits")
    .select("last_pack")
    .eq("user_id", authUser.userId)
    .maybeSingle();

  const lastPack = credits?.last_pack ?? "free";
  const allowed = (PACK_IDS_ORDERED as readonly string[]).includes(lastPack);

  if (!allowed) {
    return NextResponse.json(
      { allowed: false, reason: "upgrade_required", tier: lastPack },
      { status: 403 },
    );
  }

  return NextResponse.json({ allowed: true, tier: lastPack });
}
