import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PACK_IDS_ORDERED } from "@/lib/token-packs";
import { getLibraryDetail } from "@/lib/library/library-data";

export const runtime = "nodejs";

function parseHexagramNumber(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 1 || n > 64) return null;
  return n;
}

/**
 * GET /api/library/[number]
 * Returns full hexagram data (translations) for authenticated Seeker+ users.
 * The translations NEVER appear in the server-rendered RSC payload — they are
 * only delivered through this authenticated endpoint.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  const { number } = await params;
  const n = parseHexagramNumber(number);
  if (n === null) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  // Admin bypass
  const { data: userRow } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", authUser.userId)
    .maybeSingle();

  if (userRow?.is_admin !== true) {
    const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdminEmail = allowlist.includes(authUser.email.toLowerCase());

    if (!isAdminEmail) {
      // Tier check: Seeker+ required
      const { data: credits } = await supabase
        .from("query_credits")
        .select("last_pack")
        .eq("user_id", authUser.userId)
        .maybeSingle();

      const lastPack = credits?.last_pack ?? "free";
      if (!(PACK_IDS_ORDERED as readonly string[]).includes(lastPack)) {
        return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
      }
    }
  }

  const detail = getLibraryDetail(n);
  if (!detail) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(detail, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
