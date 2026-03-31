import { registerStep1Schema, validateEmailForRegistration } from "@iching-oracle/auth-backend";
import { createClient } from "@supabase/supabase-js";
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
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!publicUrl || !anonKey) {
    return apiError(503, {
      error: "supabase_public_client_not_configured",
      code: "AUTH_PROVIDER_NOT_CONFIGURED",
      action: "check_config",
    });
  }

  const authClient = createClient(publicUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const normalizedEmail = parsed.data.email.toLowerCase();
  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (existingUserError) {
    return apiError(500, {
      error: "register_precheck_failed",
      code: "REGISTER_PRECHECK_FAILED",
      action: "retry",
    });
  }
  if (existingUser?.id) {
    return apiError(409, {
      error: "email_exists",
      code: "REGISTER_EMAIL_EXISTS",
      action: "login",
      message: "Ese correo ya está registrado. Inicia sesión.",
    });
  }
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const signUp = await authClient.auth.signUp({
    email: normalizedEmail,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin.replace(/\/$/, "")}/auth/callback`,
    },
  });
  if (signUp.error) {
    const lower = signUp.error.message.toLowerCase();
    if (
      lower.includes("user already registered") ||
      lower.includes("already registered") ||
      lower.includes("database error creating new user")
    ) {
      return apiError(409, {
        error: "email_exists",
        code: "REGISTER_EMAIL_EXISTS",
        action: "login",
        message:
          "Este correo ya existe o quedó con registro previo. Intenta iniciar sesión o usar «Reenviar confirmación».",
      });
    }
    return apiError(400, {
      error: "sign_up_failed",
      code: "REGISTER_CREATE_USER_FAILED",
      action: "retry",
      message:
        process.env.NODE_ENV === "development"
          ? signUp.error.message
          : "No se pudo crear la cuenta en este momento. Intenta de nuevo.",
    });
  }

  const uid = signUp.data.user?.id;
  if (uid) {
    await supabase.from("users").upsert(
      { id: uid, email: normalizedEmail },
      { onConflict: "id" },
    );
  }
  return Response.json({ ok: true, userId: uid ?? null });
}

