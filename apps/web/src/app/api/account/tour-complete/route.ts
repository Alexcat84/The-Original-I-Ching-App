import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(500, { error: "db_unavailable", code: "DB_UNAVAILABLE", action: "retry" });
  }

  const { error } = await supabase
    .from("users")
    .update({ tour_v1_completed_at: new Date().toISOString() })
    .eq("id", user.userId)
    .is("tour_v1_completed_at", null); // idempotent: only update if not already set

  if (error) {
    console.error("[account/tour-complete] update failed", error);
    return apiError(500, { error: "update_failed", code: "UPDATE_FAILED", action: "retry" });
  }

  return NextResponse.json({ ok: true });
}
