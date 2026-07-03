import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// 2FA step-up must have occurred within this window for the change to be allowed.
const STEP_UP_TTL_MINUTES = 15;

export async function POST(req: Request) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  let body: { password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiError(400, { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "fix_input" });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8) {
    return apiError(400, {
      error: "password_too_short",
      code: "PASSWORD_TOO_SHORT",
      action: "fix_input",
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(503, {
      error: "supabase_not_configured",
      code: "SUPABASE_NOT_CONFIGURED",
      action: "check_config",
    });
  }

  // Authoritative 2FA check: fetch from DB, never trust client claims.
  const { data: user } = await supabase
    .from("users")
    .select("two_factor_enabled, two_factor_method, totp_verified_at")
    .eq("id", authUser.userId)
    .maybeSingle();

  if (user?.two_factor_enabled) {
    const cutoff = new Date(Date.now() - STEP_UP_TTL_MINUTES * 60_000).toISOString();
    const method = user.two_factor_method === "email" ? "email" : "totp";

    if (method === "totp") {
      // totp_verified_at is written by /api/auth/2fa/challenge/verify after TOTP success
      const verified = user.totp_verified_at && user.totp_verified_at > cutoff;
      if (!verified) {
        return apiError(403, {
          error: "two_factor_step_up_required",
          code: "TWO_FACTOR_STEP_UP_REQUIRED",
          action: "setup_2fa",
        });
      }
    } else {
      // email method: check the most recently consumed code is within the window
      const { data: code } = await supabase
        .from("two_factor_email_codes")
        .select("consumed_at")
        .eq("user_id", authUser.userId)
        .not("consumed_at", "is", null)
        .order("consumed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const verified = code?.consumed_at && code.consumed_at > cutoff;
      if (!verified) {
        return apiError(403, {
          error: "two_factor_step_up_required",
          code: "TWO_FACTOR_STEP_UP_REQUIRED",
          action: "setup_2fa",
        });
      }
    }
  }

  // Use the service-role admin client — bypasses RLS and is not subject to
  // the user's session state (which may be a recovery session with limited scope).
  const { error } = await supabase.auth.admin.updateUserById(authUser.userId, { password });
  if (error) {
    return apiError(500, {
      error: "password_update_failed",
      code: "PASSWORD_UPDATE_FAILED",
      action: "retry",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  return NextResponse.json({ ok: true });
}
