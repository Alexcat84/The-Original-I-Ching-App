import { createHash, timingSafeEqual } from "node:crypto";
import { generateRecoveryCodes, hashRecoveryCodes } from "@iching-oracle/auth-backend";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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

  let body: { code?: string };
  try {
    body = (await req.json()) as { code?: string };
  } catch {
    return apiError(400, { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "fix_input" });
  }

  const code = typeof body.code === "string" ? normalizeCode(body.code) : "";
  if (code.length !== 6) {
    return apiError(400, { error: "invalid_code", code: "TWO_FACTOR_EMAIL_INVALID_CODE", action: "fix_input" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(503, {
      error: "supabase_not_configured",
      code: "AUTH_PROVIDER_NOT_CONFIGURED",
      action: "check_config",
    });
  }

  const codeSecret = process.env.TWO_FACTOR_EMAIL_CODE_SECRET?.trim();
  if (!codeSecret) {
    return apiError(503, {
      error: "two_factor_email_not_configured",
      code: "TWO_FACTOR_EMAIL_NOT_CONFIGURED",
      action: "check_config",
    });
  }

  const nowIso = new Date().toISOString();
  const { data: row, error: rowError } = await supabase
    .from("two_factor_email_codes")
    .select("id, code_hash, expires_at")
    .eq("user_id", authUser.userId)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (rowError) {
    return apiError(500, {
      error: "two_factor_email_read_failed",
      code: "TWO_FACTOR_EMAIL_READ_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? rowError.message : undefined,
    });
  }

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

  const expectedHash = hashEmailCode(code, codeSecret);
  if (!secureEqualHex(expectedHash, row.code_hash)) {
    await supabase.from("two_factor_attempts").insert({
      user_id: authUser.userId,
      ip_address: (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown",
      success: false,
      created_at: nowIso,
    });
    return apiError(401, {
      error: "invalid_2fa_code",
      code: "TWO_FACTOR_INVALID_CODE",
      action: "retry",
    });
  }

  const { error: consumeError } = await supabase
    .from("two_factor_email_codes")
    .update({ consumed_at: nowIso })
    .eq("id", row.id)
    .eq("user_id", authUser.userId);
  if (consumeError) {
    return apiError(500, {
      error: "two_factor_email_consume_failed",
      code: "TWO_FACTOR_EMAIL_CONSUME_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? consumeError.message : undefined,
    });
  }

  const { data: userRow, error: userReadError } = await supabase
    .from("users")
    .select("two_factor_method, totp_secret")
    .eq("id", authUser.userId)
    .maybeSingle();
  if (userReadError) {
    return apiError(500, {
      error: "two_factor_user_read_failed",
      code: "TWO_FACTOR_USER_READ_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? userReadError.message : undefined,
    });
  }

  const nextMethod =
    typeof userRow?.totp_secret === "string" && userRow.totp_secret.length > 0
      ? "totp"
      : ((userRow?.two_factor_method ?? "email") as "totp" | "email");

  const { error: applyUserUpdateError } = await supabase
    .from("users")
    .update({
      two_factor_enabled: true,
      two_factor_method: nextMethod,
      totp_verified_at: nowIso,
    })
    .eq("id", authUser.userId);
  if (applyUserUpdateError) {
    return apiError(500, {
      error: "two_factor_user_update_failed",
      code: "TWO_FACTOR_USER_UPDATE_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? applyUserUpdateError.message : undefined,
    });
  }

  await supabase.from("two_factor_attempts").insert({
    user_id: authUser.userId,
    ip_address: (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown",
    success: true,
    created_at: nowIso,
  });

  const recoveryCodes = generateRecoveryCodes(8);
  const hashed = await hashRecoveryCodes(recoveryCodes);

  await supabase
    .from("two_factor_recovery_codes")
    .delete()
    .eq("user_id", authUser.userId)
    .is("used_at", null);

  const { error: recoveryInsertError } = await supabase.from("two_factor_recovery_codes").insert(
    hashed.map((hash) => ({
      user_id: authUser.userId,
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

