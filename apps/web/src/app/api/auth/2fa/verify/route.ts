import {
  consumeRecoveryCode,
  decryptTotpSecret,
  hashRecoveryCodes,
  shouldLockTwoFactor,
  verifyTotpToken,
} from "@iching-oracle/auth-backend";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { userId?: string; token?: string; recoveryCode?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.userId) return NextResponse.json({ error: "missing_user" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const { data: attempts } = await supabase
    .from("two_factor_attempts")
    .select("created_at, success")
    .eq("user_id", body.userId)
    .order("created_at", { ascending: false })
    .limit(20);
  const locked = shouldLockTwoFactor(
    (attempts ?? []).map((a) => ({
      timestampMs: new Date(a.created_at).getTime(),
      success: a.success,
    })),
  );
  if (locked) {
    return NextResponse.json({ error: "two_factor_locked" }, { status: 423 });
  }
  const { data: user } = await supabase
    .from("users")
    .select("totp_secret")
    .eq("id", body.userId)
    .maybeSingle();
  if (!user?.totp_secret) {
    return NextResponse.json({ error: "totp_not_enrolled" }, { status: 400 });
  }
  const encryptionKey = process.env.TOTP_ENCRYPTION_KEY;
  if (!encryptionKey) {
    return NextResponse.json({ error: "missing_totp_encryption_key" }, { status: 503 });
  }

  let verified = false;
  if (body.token) {
    const decrypted = decryptTotpSecret(user.totp_secret, encryptionKey);
    verified = verifyTotpToken(decrypted, body.token);
  }

  if (!verified && body.recoveryCode) {
    const { data: codes } = await supabase
      .from("two_factor_recovery_codes")
      .select("id, code_hash")
      .eq("user_id", body.userId)
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
          .eq("user_id", body.userId)
          .eq("code_hash", usedCodeHash);
      }
    }
  }

  if (!verified) {
    await supabase.from("two_factor_attempts").insert({
      user_id: body.userId,
      ip_address: ip,
      success: false,
    });
    return NextResponse.json({ error: "invalid_2fa_code" }, { status: 401 });
  }
  await supabase.from("two_factor_attempts").insert({
    user_id: body.userId,
    ip_address: ip,
    success: true,
  });

  await supabase
    .from("users")
    .update({
      two_factor_enabled: true,
      totp_verified_at: new Date().toISOString(),
    })
    .eq("id", body.userId);

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
  await supabase.from("two_factor_recovery_codes").insert(
    hashed.map((hash) => ({
      user_id: body.userId!,
      code_hash: hash,
    })),
  );

  return NextResponse.json({
    ok: true,
    recoveryCodes,
  });
}

