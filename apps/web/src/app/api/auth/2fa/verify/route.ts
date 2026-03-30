import {
  consumeRecoveryCode,
  decryptTotpSecret,
  hashRecoveryCodes,
  shouldLockTwoFactor,
  verifyTotpToken,
} from "@iching-oracle/auth-backend";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function normalizeCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 6);
}

export async function POST(req: Request) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }
  let body: { token?: string; recoveryCode?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiError(400, { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "fix_input" });
  }
  const userId = authUser.userId;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(503, {
      error: "supabase_not_configured",
      code: "AUTH_PROVIDER_NOT_CONFIGURED",
      action: "check_config",
    });
  }
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const { data: attempts } = await supabase
    .from("two_factor_attempts")
    .select("created_at, success")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (!attempts) {
    return apiError(500, {
      error: "two_factor_attempts_read_failed",
      code: "TWO_FACTOR_ATTEMPTS_READ_FAILED",
      action: "retry",
    });
  }
  const locked = shouldLockTwoFactor(
    (attempts ?? []).map((a) => ({
      timestampMs: new Date(a.created_at).getTime(),
      success: a.success,
    })),
  );
  if (locked) {
    return apiError(423, { error: "two_factor_locked", code: "TWO_FACTOR_LOCKED", action: "wait_and_retry" });
  }
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("totp_secret")
    .eq("id", userId)
    .maybeSingle();
  if (userError) {
    return apiError(500, {
      error: "two_factor_user_read_failed",
      code: "TWO_FACTOR_USER_READ_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? userError.message : undefined,
    });
  }
  if (!user?.totp_secret) {
    return apiError(400, { error: "totp_not_enrolled", code: "TWO_FACTOR_NOT_ENROLLED", action: "setup_2fa" });
  }
  const encryptionKey = process.env.TOTP_ENCRYPTION_KEY;
  if (!encryptionKey) {
    return apiError(503, {
      error: "missing_totp_encryption_key",
      code: "TWO_FACTOR_ENCRYPTION_KEY_MISSING",
      action: "check_config",
    });
  }

  let verified = false;
  const normalizedToken = typeof body.token === "string" ? normalizeCode(body.token) : "";
  if (normalizedToken.length === 6) {
    const decrypted = decryptTotpSecret(user.totp_secret, encryptionKey);
    verified = verifyTotpToken(decrypted, normalizedToken);
  }

  if (!verified && body.recoveryCode) {
    const { data: codes, error: codesError } = await supabase
      .from("two_factor_recovery_codes")
      .select("id, code_hash")
      .eq("user_id", userId)
      .is("used_at", null);
    if (codesError) {
      return apiError(500, {
        error: "two_factor_recovery_read_failed",
        code: "TWO_FACTOR_RECOVERY_READ_FAILED",
        action: "retry",
        details: process.env.NODE_ENV === "development" ? codesError.message : undefined,
      });
    }
    const hashes = (codes ?? []).map((c) => c.code_hash);
    const consumed = await consumeRecoveryCode(body.recoveryCode, hashes);
    if (consumed.consumed) {
      verified = true;
      const usedCodeHash = hashes.find((h) => !consumed.remainingHashes.includes(h));
      if (usedCodeHash) {
        const { error: recoveryUpdateError } = await supabase
          .from("two_factor_recovery_codes")
          .update({ used_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("code_hash", usedCodeHash);
        if (recoveryUpdateError) {
          return apiError(500, {
            error: "two_factor_recovery_consume_failed",
            code: "TWO_FACTOR_RECOVERY_CONSUME_FAILED",
            action: "retry",
            details: process.env.NODE_ENV === "development" ? recoveryUpdateError.message : undefined,
          });
        }
      }
    }
  }

  if (!verified) {
    const { error: failAttemptError } = await supabase.from("two_factor_attempts").insert({
      user_id: userId,
      ip_address: ip,
      success: false,
    });
    if (failAttemptError) {
      return apiError(500, {
        error: "two_factor_attempt_write_failed",
        code: "TWO_FACTOR_ATTEMPT_WRITE_FAILED",
        action: "retry",
      });
    }
    return apiError(401, { error: "invalid_2fa_code", code: "TWO_FACTOR_INVALID_CODE", action: "retry" });
  }
  const { error: successAttemptError } = await supabase.from("two_factor_attempts").insert({
    user_id: userId,
    ip_address: ip,
    success: true,
  });
  if (successAttemptError) {
    return apiError(500, {
      error: "two_factor_attempt_write_failed",
      code: "TWO_FACTOR_ATTEMPT_WRITE_FAILED",
      action: "retry",
    });
  }

  const { error: userUpdateError } = await supabase
    .from("users")
    .update({
      two_factor_enabled: true,
      totp_verified_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (userUpdateError) {
    return apiError(500, {
      error: "two_factor_user_update_failed",
      code: "TWO_FACTOR_USER_UPDATE_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? userUpdateError.message : undefined,
    });
  }

  const recoveryCodes = [
    crypto.randomUUID().slice(0, 8).toUpperCase(),
    crypto.randomUUID().slice(0, 8).toUpperCase(),
    crypto.randomUUID().slice(0, 8).toUpperCase(),
    crypto.randomUUID().slice(0, 8).toUpperCase(),
    crypto.randomUUID().slice(0, 8).toUpperCase(),
    crypto.randomUUID().slice(0, 8).toUpperCase(),
    crypto.randomUUID().slice(0, 8).toUpperCase(),
    crypto.randomUUID().slice(0, 8).toUpperCase(),
  ];
  const hashed = await hashRecoveryCodes(recoveryCodes);
  await supabase
    .from("two_factor_recovery_codes")
    .delete()
    .eq("user_id", userId)
    .is("used_at", null);
  const { error: recoveryInsertError } = await supabase.from("two_factor_recovery_codes").insert(
    hashed.map((hash) => ({
      user_id: userId,
      code_hash: hash,
    })),
  );
  if (recoveryInsertError) {
    return apiError(500, {
      error: "two_factor_recovery_insert_failed",
      code: "TWO_FACTOR_RECOVERY_INSERT_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? recoveryInsertError.message : undefined,
    });
  }

  return NextResponse.json({
    ok: true,
    recoveryCodes,
  });
}

