import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(503, {
      error: "supabase_not_configured",
      code: "AUTH_PROVIDER_NOT_CONFIGURED",
      action: "check_config",
    });
  }

  const nowIso = new Date().toISOString();
  const { error: userError } = await supabase
    .from("users")
    .update({
      two_factor_enabled: false,
      two_factor_method: null,
      totp_secret: null,
      totp_verified_at: null,
    })
    .eq("id", authUser.userId);
  if (userError) {
    return apiError(500, {
      error: "two_factor_disable_failed",
      code: "TWO_FACTOR_DISABLE_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? userError.message : undefined,
    });
  }

  const { error: clearReplayError } = await supabase
    .from("users")
    .update({ totp_last_used_step: null })
    .eq("id", authUser.userId);
  if (clearReplayError && process.env.NODE_ENV === "development") {
    console.warn("[2fa/disable] totp_last_used_step reset failed:", clearReplayError.message);
  }

  await supabase.from("two_factor_recovery_codes").delete().eq("user_id", authUser.userId);
  await supabase.from("two_factor_email_codes").delete().eq("user_id", authUser.userId).is("consumed_at", null);
  await supabase.from("two_factor_attempts").insert({
    user_id: authUser.userId,
    ip_address: (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown",
    success: true,
    created_at: nowIso,
  });

  return NextResponse.json({ ok: true });
}

