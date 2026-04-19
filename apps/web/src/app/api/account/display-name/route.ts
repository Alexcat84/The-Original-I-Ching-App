import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  let body: { display_name?: unknown };
  try {
    body = (await req.json()) as { display_name?: unknown };
  } catch {
    return apiError(400, { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "fix_input" });
  }

  const rawName = typeof body.display_name === "string" ? body.display_name.trim() : "";
  if (!rawName) {
    return apiError(400, { error: "display_name_required", code: "DISPLAY_NAME_REQUIRED", action: "fix_input" });
  }
  if (rawName.length > 60) {
    return apiError(400, { error: "display_name_too_long", code: "DISPLAY_NAME_TOO_LONG", action: "fix_input" });
  }

  const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(500, { error: "db_unavailable", code: "DB_UNAVAILABLE", action: "retry" });
  }

  const { error } = await supabase
    .from("users")
    .update({ display_name: rawName })
    .eq("id", user.userId);

  if (error) {
    console.error("[account/display-name] update failed", error);
    return apiError(500, { error: "update_failed", code: "UPDATE_FAILED", action: "retry" });
  }

  return NextResponse.json({ ok: true, display_name: rawName });
}
