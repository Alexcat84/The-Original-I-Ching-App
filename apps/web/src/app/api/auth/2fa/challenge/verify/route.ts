import { consumeRecoveryCode, decryptTotpSecret, shouldLockTwoFactor, verifyTotpToken } from "@iching-oracle/auth-backend";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createHash, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function normalizeCode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 6);
}

function hashEmailCode(code: string, secret: string): string {
  return createHash("sha256").update(`${code}:${secret}`).digest("hex");
}

function secureEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: Request) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }
  let body: { token?: string; recoveryCode?: string; emailCode?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiError(400, { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "fix_input" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(503, {
      error: "supabase_not_configured",
      code: "AUTH_PROVIDER_NOT_CONFIGURED",
      action: "check_config",
    });
  }

  const userId = authUser.userId;
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const { data: attempts } = await supabase
    .from("two_factor_attempts")
    .select("created_at, success")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const locked = shouldLockTwoFactor(
    (attempts ?? []).map((a) => ({
      timestampMs: new Date(a.created_at).getTime(),
      success: a.success,
    })),
  );
  if (locked) {
    return apiError(423, { error: "two_factor_locked", code: "TWO_FACTOR_LOCKED", action: "wait_and_retry" });
  }

  const { data: user } = await supabase
    .from("users")
    .select("two_factor_enabled, two_factor_method, totp_secret")
    .eq("id", userId)
    .maybeSingle();
  if (!user?.two_factor_enabled) {
    return NextResponse.json({ ok: true, skipped: true, reason: "two_factor_not_enabled" });
  }

  const configuredMethod = user.two_factor_method === "email" ? "email" : "totp";
  const normalizedToken = typeof body.token === "string" ? normalizeCode(body.token) : "";
  const normalizedEmailCode = typeof body.emailCode === "string" ? normalizeCode(body.emailCode) : "";
  let verified = false;

  if (configuredMethod === "totp" && normalizedToken.length === 6 && user.totp_secret) {
    const encryptionKey = process.env.TOTP_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return apiError(503, {
        error: "missing_totp_encryption_key",
        code: "TWO_FACTOR_ENCRYPTION_KEY_MISSING",
        action: "check_config",
      });
    }
    const decrypted = decryptTotpSecret(user.totp_secret, encryptionKey);
    verified = verifyTotpToken(decrypted, normalizedToken);
  }

  if (!verified && body.recoveryCode) {
    const { data: codes } = await supabase
      .from("two_factor_recovery_codes")
      .select("code_hash")
      .eq("user_id", userId)
      .is("used_at", null);
    const hashes = (codes ?? []).map((c) => c.code_hash);
    const consumed = await consumeRecoveryCode(body.recoveryCode, hashes);
    if (consumed.consumed) {
      verified = true;
      const usedCodeHash = hashes.find((h) => !consumed.remainingHashes.includes(h));
      if (usedCodeHash) {
        await supabase
          .from("two_factor_recovery_codes")
          .update({ used_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("code_hash", usedCodeHash);
      }
    }
  }

  if (!verified && configuredMethod === "email" && normalizedEmailCode.length === 6) {
    const codeSecret = process.env.TWO_FACTOR_EMAIL_CODE_SECRET?.trim();
    if (!codeSecret) {
      return apiError(503, {
        error: "two_factor_email_not_configured",
        code: "TWO_FACTOR_EMAIL_NOT_CONFIGURED",
        action: "check_config",
      });
    }
    const { data: row } = await supabase
      .from("two_factor_email_codes")
      .select("id, code_hash, expires_at")
      .eq("user_id", userId)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!row) {
      return apiError(400, {
        error: "two_factor_email_code_missing",
        code: "TWO_FACTOR_EMAIL_CODE_MISSING",
        action: "retry",
      });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return apiError(400, {
        error: "two_factor_email_code_expired",
        code: "TWO_FACTOR_EMAIL_CODE_EXPIRED",
        action: "retry",
      });
    }
    const expectedHash = hashEmailCode(normalizedEmailCode, codeSecret);
    if (secureEqualHex(expectedHash, row.code_hash)) {
      verified = true;
      await supabase
        .from("two_factor_email_codes")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", row.id)
        .eq("user_id", userId);
    }
  }

  if (!verified && configuredMethod === "totp" && normalizedToken.length > 0 && !user.totp_secret) {
    return apiError(400, {
      error: "totp_not_enrolled",
      code: "TWO_FACTOR_NOT_ENROLLED",
      action: "setup_2fa",
    });
  }

  if (
    !verified &&
    ((configuredMethod === "totp" && normalizedToken.length !== 6) ||
      (configuredMethod === "email" && normalizedEmailCode.length !== 6)) &&
    !body.recoveryCode
  ) {
    return apiError(400, {
      error: "invalid_code",
      code: "TWO_FACTOR_INVALID_CODE",
      action: "fix_input",
    });
  }

  await supabase.from("two_factor_attempts").insert({
    user_id: userId,
    ip_address: ip,
    success: verified,
  });

  if (!verified) {
    return apiError(401, { error: "invalid_2fa_code", code: "TWO_FACTOR_INVALID_CODE", action: "retry" });
  }

  return NextResponse.json({ ok: true });
}

