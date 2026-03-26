import { registerStep1Schema, validateEmailForRegistration } from "@iching-oracle/auth-backend";
import { apiError } from "@/lib/api-error";
import { rateLimitByKey } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string; turnstileToken?: string; hcaptchaToken?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiError(400, { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "fix_input" });
  }
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const rl = await rateLimitByKey({ key: `register:${ip}`, limit: 5, windowSeconds: 3600 });
  if (!rl.ok) {
    return apiError(429, { error: "rate_limited", code: "RATE_LIMITED", action: "wait_and_retry" });
  }

  const parsed = registerStep1Schema.safeParse({
    email: body.email,
    password: body.password,
  });
  if (!parsed.success) {
    return apiError(400, {
      error: "invalid_payload",
      code: "REGISTER_INVALID_PAYLOAD",
      action: "fix_input",
      details: parsed.error.flatten(),
    });
  }

  const captchaToken = body.turnstileToken ?? body.hcaptchaToken ?? "";
  const turnstileOk = await verifyTurnstile(captchaToken, ip);
  if (!turnstileOk) {
    return apiError(400, { error: "turnstile_failed", code: "BOT_CHECK_FAILED", action: "retry" });
  }

  const emailOk = await validateEmailForRegistration(parsed.data.email);
  if (!emailOk.ok) {
    return apiError(400, {
      error: "email_rejected",
      code: "REGISTER_EMAIL_REJECTED",
      action: "fix_input",
      details: { reason: emailOk.reason },
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(503, {
      error: "supabase_not_configured",
      code: "AUTH_PROVIDER_NOT_CONFIGURED",
      action: "check_config",
    });
  }
  const created = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: false,
    user_metadata: { status: "pending" },
  });
  if (created.error) {
    return apiError(400, {
      error: "create_user_failed",
      code: "REGISTER_CREATE_USER_FAILED",
      action: "retry",
      message: created.error.message,
    });
  }
  const uid = created.data.user?.id;
  if (uid) {
    await supabase.from("users").upsert(
      { id: uid, email: parsed.data.email.toLowerCase() },
      { onConflict: "id" },
    );
  }
  return Response.json({ ok: true, userId: uid ?? null });
}

