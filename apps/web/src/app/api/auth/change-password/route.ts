import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  formatPasswordChangedEmail,
  getUpdatePasswordUiMessages,
  parseAppLocale,
} from "@iching-oracle/i18n";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser, invalidateAuthCache } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { UI_LOCALE_COOKIE } from "@/lib/doc-locale-cookies";

export const runtime = "nodejs";

// 2FA step-up must have occurred within this window for the change to be allowed.
const STEP_UP_TTL_MINUTES = 15;

export async function POST(req: Request) {
  // Extract raw JWT before getAuthenticatedUser consumes the body/headers,
  // so we can use it for global sign-out and cache invalidation afterward.
  const bearerToken = (req.headers.get("authorization") ?? "").slice(7).trim();

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

  // Update password using admin client (service role — bypasses RLS and recovery-session scope limits).
  const { error } = await supabase.auth.admin.updateUserById(authUser.userId, { password });
  if (error) {
    return apiError(500, {
      error: "password_update_failed",
      code: "PASSWORD_UPDATE_FAILED",
      action: "retry",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  // Send security notification email BEFORE invalidating the session.
  // (After global sign-out the bearer token is revoked and a separate
  //  client-side notify call would get 401 — so we do it here.)
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.TWO_FACTOR_EMAIL_FROM?.trim() ?? "noreply@theoriginaliching.com";
  if (resendApiKey) {
    try {
      const cookieStore = await cookies();
      const locale = parseAppLocale(cookieStore.get(UI_LOCALE_COOKIE)?.value);
      const { subject, text, html } = formatPasswordChangedEmail(
        getUpdatePasswordUiMessages(locale),
      );
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [authUser.email], subject, text, html }),
      });
    } catch {
      // Non-fatal — never block the password change response
    }
  }

  // Invalidate ALL active sessions for this user (global sign-out).
  // Standard security requirement: a stolen session should not remain valid
  // after the user resets their password.
  if (bearerToken) {
    try {
      await supabase.auth.admin.signOut(bearerToken, "global");
    } catch {
      // Non-fatal — password was already changed; sign-out failure is acceptable
    }
    // Also evict from the in-process JWT cache so this serverless instance
    // doesn't serve the now-revoked token for the remaining 60-second TTL.
    invalidateAuthCache(bearerToken);
  }

  return NextResponse.json({ ok: true });
}
