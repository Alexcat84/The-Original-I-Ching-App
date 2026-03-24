import { createTotpEnrollment, encryptTotpSecret } from "@iching-oracle/auth-backend";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { userId?: string; email?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.userId || !body.email) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const encryptionKey = process.env.TOTP_ENCRYPTION_KEY;
  if (!encryptionKey) {
    return NextResponse.json({ error: "missing_totp_encryption_key" }, { status: 503 });
  }
  const enrollment = await createTotpEnrollment(body.email);
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const encrypted = encryptTotpSecret(enrollment.secret, encryptionKey);
  await supabase.from("users").upsert({
    id: body.userId,
    email: body.email,
    totp_secret: encrypted,
    two_factor_method: "totp",
  });
  return NextResponse.json({
    ok: true,
    otpauthUrl: enrollment.otpauthUrl,
    qrDataUrl: enrollment.qrDataUrl,
  });
}

