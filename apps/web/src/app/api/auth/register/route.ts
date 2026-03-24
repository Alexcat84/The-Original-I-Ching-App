import { registerStep1Schema, validateEmailForRegistration } from "@iching-oracle/auth-backend";
import { NextResponse } from "next/server";
import { rateLimitByKey } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyHCaptcha } from "@/lib/hcaptcha";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string; hcaptchaToken?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimitByKey({ key: `register:${ip}`, limit: 5, windowSeconds: 3600 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const parsed = registerStep1Schema.safeParse({
    email: body.email,
    password: body.password,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const hcaptchaOk = await verifyHCaptcha(body.hcaptchaToken ?? "", ip);
  if (!hcaptchaOk) {
    return NextResponse.json({ error: "hcaptcha_failed" }, { status: 400 });
  }

  const emailOk = await validateEmailForRegistration(parsed.data.email);
  if (!emailOk.ok) {
    return NextResponse.json({ error: "email_rejected", reason: emailOk.reason }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const created = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: false,
    user_metadata: { status: "pending" },
  });
  if (created.error) {
    return NextResponse.json({ error: "create_user_failed", message: created.error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, userId: created.data.user?.id ?? null });
}

