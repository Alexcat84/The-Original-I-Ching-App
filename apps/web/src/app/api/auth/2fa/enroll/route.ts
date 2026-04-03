import { createTotpEnrollment, encryptTotpSecret } from "@iching-oracle/auth-backend";
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
  const encryptionKey = process.env.TOTP_ENCRYPTION_KEY;
  if (!encryptionKey) {
    return apiError(503, {
      error: "missing_totp_encryption_key",
      code: "TWO_FACTOR_ENCRYPTION_KEY_MISSING",
      action: "check_config",
    });
  }
  const enrollment = await createTotpEnrollment(authUser.email);
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(503, {
      error: "supabase_not_configured",
      code: "AUTH_PROVIDER_NOT_CONFIGURED",
      action: "check_config",
    });
  }
  const encrypted = encryptTotpSecret(enrollment.secret, encryptionKey);
  const { error } = await supabase.from("users").upsert({
    id: authUser.userId,
    email: authUser.email,
    totp_secret: encrypted,
    two_factor_method: "totp",
  });
  if (error) {
    return apiError(500, {
      error: "two_factor_enroll_failed",
      code: "TWO_FACTOR_ENROLL_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  // Clear replay counter for the new secret. Done in a separate update so a schema/cache
  // mismatch on this column cannot break enrollment (QR generation).
  const { error: clearReplayError } = await supabase
    .from("users")
    .update({ totp_last_used_step: null })
    .eq("id", authUser.userId);
  if (clearReplayError && process.env.NODE_ENV === "development") {
    console.warn("[2fa/enroll] totp_last_used_step reset failed:", clearReplayError.message);
  }
  return NextResponse.json({
    ok: true,
    otpauthUrl: enrollment.otpauthUrl,
    qrDataUrl: enrollment.qrDataUrl,
  });
}

