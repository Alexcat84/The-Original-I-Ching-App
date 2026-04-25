import { registerStep1Schema, validateEmailForRegistration } from "@iching-oracle/auth-backend";
import { createClient } from "@supabase/supabase-js";
import { apiError } from "@/lib/api-error";
import { rateLimitByKey } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { initFreeUser } from "@/lib/credits";
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "@/lib/legal-consent";
import { clearPendingEmailLegalConsentMetadata, recordUserLegalAcceptance } from "@/lib/legal-consent-server";
import { z } from "zod";

export const runtime = "nodejs";

function parseRegisterRateLimit(): { limit: number; windowSeconds: number } {
  const rawLimit = process.env.REGISTER_RATE_LIMIT_PER_HOUR;
  const rawWindow = process.env.REGISTER_RATE_WINDOW_SECONDS;
  const limitParsed = rawLimit ? Number.parseInt(rawLimit, 10) : Number.NaN;
  const windowParsed = rawWindow ? Number.parseInt(rawWindow, 10) : Number.NaN;
  const limit =
    Number.isFinite(limitParsed) && limitParsed >= 1 ? Math.min(limitParsed, 120) : 15;
  const windowSeconds =
    Number.isFinite(windowParsed) && windowParsed >= 60 ? Math.min(windowParsed, 86_400) : 3600;
  return { limit, windowSeconds };
}

function readSupabaseAuthErrorFields(err: unknown): { code: string; message: string; status: number | undefined } {
  if (!err || typeof err !== "object") return { code: "", message: "", status: undefined };
  const o = err as Record<string, unknown>;
  const code =
    typeof o.code === "string"
      ? o.code
      : typeof o.error_code === "string"
        ? o.error_code
        : "";
  const message = typeof o.message === "string" ? o.message : "";
  const status = typeof o.status === "number" ? o.status : undefined;
  return { code, message, status };
}

function normalizeOrigin(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function safeAuthRedirectOrigin(req: Request): string {
  const configured = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ?? "http://localhost:3000";
  const requestOrigin = normalizeOrigin(req.headers.get("origin"));
  if (!requestOrigin) return configured;
  if (requestOrigin === configured) return requestOrigin;
  const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(requestOrigin);
  if (process.env.NODE_ENV !== "production" && isLocalDev) return requestOrigin;
  return configured;
}

const registerRequestSchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
  turnstileToken: z.string().optional(),
  hcaptchaToken: z.string().optional(),
  legalConsent: z.object({
    accepted: z.literal(true),
    termsVersion: z.literal(CURRENT_TERMS_VERSION),
    privacyVersion: z.literal(CURRENT_PRIVACY_VERSION),
    acceptedAt: z.string().datetime(),
    source: z.literal("email_signup"),
  }),
});

export async function POST(req: Request) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return apiError(400, { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "fix_input" });
  }
  const bodyResult = registerRequestSchema.safeParse(rawBody);
  if (!bodyResult.success) {
    const missingLegalConsent = bodyResult.error.issues.some((issue) => issue.path[0] === "legalConsent");
    return apiError(400, {
      error: missingLegalConsent ? "legal_consent_required" : "invalid_payload",
      code: missingLegalConsent ? "LEGAL_CONSENT_REQUIRED" : "REGISTER_INVALID_PAYLOAD",
      action: "fix_input",
      details: bodyResult.error.flatten(),
    });
  }
  const body = bodyResult.data;
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0]?.trim() ?? "unknown";
  const { limit: registerRlLimit, windowSeconds: registerRlWindow } = parseRegisterRateLimit();
  // Key prefix version: bump when raising defaults or after incidents so Redis counters reset
  // without waiting for TTL (Upstash keeps rl:register:v2:… separate from legacy rl:register:…).
  const rl = await rateLimitByKey({
    key: `register:v2:${ip}`,
    limit: registerRlLimit,
    windowSeconds: registerRlWindow,
  });
  if (!rl.ok) {
    const res = apiError(429, { error: "rate_limited", code: "RATE_LIMITED", action: "wait_and_retry" });
    res.headers.set("Retry-After", String(registerRlWindow));
    return res;
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
  // Case-insensitive: duplicate logical emails must block signup before Auth insert;
  // otherwise handle_new_auth_user() can hit UNIQUE(email) on public.users and GoTrue returns unexpected_failure.
  const { data: existingRows, error: existingUserError } = await supabase
    .from("users")
    .select("id")
    .ilike("email", normalizedEmail)
    .limit(1);
  if (existingUserError) {
    return apiError(500, {
      error: "register_precheck_failed",
      code: "REGISTER_PRECHECK_FAILED",
      action: "retry",
    });
  }
  const existingUser = existingRows?.[0];
  if (existingUser?.id) {
    return apiError(409, {
      error: "email_exists",
      code: "REGISTER_EMAIL_EXISTS",
      action: "login",
      message: "Ese correo ya está registrado. Inicia sesión.",
    });
  }

  // If this email already exists in auth.users (e.g. Google OAuth), anon signUp often fails with
  // unexpected_failure instead of a clear error. RPC requires migration 028 on the Supabase project.
  const { data: authEmailTaken, error: authEmailRpcError } = await supabase.rpc("auth_email_registered", {
    p_email: normalizedEmail,
  });
  if (authEmailRpcError) {
    console.warn("[auth/register] auth_email_registered RPC skipped or failed (run migration 028?)", {
      message: authEmailRpcError.message,
      code: authEmailRpcError.code,
    });
  } else if (authEmailTaken === true) {
    return apiError(409, {
      error: "email_exists",
      code: "REGISTER_EMAIL_EXISTS",
      action: "login",
      message:
        "Este correo ya tiene cuenta (por ejemplo con Google). Inicia sesión con ese método o usa otro correo para registro con contraseña.",
    });
  }

  const origin = safeAuthRedirectOrigin(req);
  // Do not pass options.data / user_metadata here. Google OAuth creates auth.users without
  // our custom keys; extra metadata on email signUp has correlated with GoTrue unexpected_failure.
  // Legal consent is validated above and persisted after signup via recordUserLegalAcceptance
  // (same insert as POST /api/auth/legal-consent). Callback still syncs legacy pending metadata.
  const signUp = await authClient.auth.signUp({
    email: normalizedEmail,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin.replace(/\/$/, "")}/auth/callback`,
    },
  });
  if (signUp.error) {
    const { code: errCode, message: errMessage, status: errStatus } = readSupabaseAuthErrorFields(signUp.error);
    const lower = errMessage.toLowerCase();
    console.error("[auth/register] signUp failed", {
      code: errCode,
      status: errStatus,
      message: errMessage,
      email: normalizedEmail,
    });

    if (errCode === "over_email_send_rate_limit" || errCode === "email_rate_limit_exceeded") {
      return apiError(429, { error: "rate_limited", code: "REGISTER_EMAIL_SEND_RATE_LIMIT", action: "wait_and_retry" });
    }

    if (errCode === "signup_disabled") {
      return apiError(403, {
        error: "signup_disabled",
        code: "REGISTER_SIGNUP_DISABLED",
        action: "check_config",
      });
    }

    // Must run before mail heuristics: GoTrue often puts "email" in generic unexpected_failure bodies.
    if (errCode === "unexpected_failure" || lower.includes("unexpected_failure")) {
      console.error(
        "[auth/register] Supabase Auth unexpected_failure — often a DB trigger on auth.users (e.g. public.handle_new_auth_user / init_free_user). Check Supabase Postgres logs.",
        { email: normalizedEmail, message: errMessage },
      );
      return apiError(503, {
        error: "signup_auth_internal_error",
        code: "REGISTER_AUTH_UNEXPECTED_FAILURE",
        action: "check_config",
      });
    }

    // Narrow match: avoid generic "error sending …" strings from non-mail flows.
    const looksLikeConfirmationOrMailFailure =
      lower.includes("sending confirmation") ||
      lower.includes("confirmation email") ||
      lower.includes("mailer") ||
      lower.includes("smtp") ||
      lower.includes("535 ") ||
      lower.includes("554 ") ||
      (lower.includes("error sending") &&
        (lower.includes("confirm") ||
          lower.includes("magic") ||
          lower.includes("mail") ||
          lower.includes("email"))) ||
      (lower.includes("unable to send") && (lower.includes("email") || lower.includes("mail")));

    if (looksLikeConfirmationOrMailFailure) {
      console.error("[auth/register] treating signUp error as confirmation/mail delivery failure", {
        email: normalizedEmail,
        authCode: errCode,
        message: errMessage,
      });
      // 502 = upstream (Auth/mailer) issue; avoids some platforms mishandling 503 on serverless.
      return apiError(502, {
        error: "signup_confirmation_failed",
        code: "REGISTER_CONFIRMATION_EMAIL_FAILED",
        action: "wait_and_retry",
      });
    }

    const looksLikeDuplicateOrDbEmailConflict =
      errCode === "user_already_exists" ||
      lower.includes("user already registered") ||
      lower.includes("already registered") ||
      lower.includes("email already") ||
      lower.includes("already been registered") ||
      lower.includes("this email address has already been registered") ||
      lower.includes("already exists") ||
      lower.includes("duplicate") ||
      lower.includes("unique constraint") ||
      lower.includes("violates unique constraint") ||
      lower.includes("23505") ||
      lower.includes("saving new user") ||
      lower.includes("creating new user") ||
      // Supabase surfaces trigger/constraint failures as (note: "saving", not "creating"):
      lower.includes("database error saving new user") ||
      lower.includes("database error creating new user") ||
      lower.includes("database error saving") ||
      lower.includes("database error creating");

    if (looksLikeDuplicateOrDbEmailConflict) {
      return apiError(409, {
        error: "email_exists",
        code: "REGISTER_EMAIL_EXISTS",
        action: "login",
        message:
          "Este correo ya existe o quedó con registro previo. Intenta iniciar sesión o usar «Reenviar confirmación».",
      });
    }

    const looksLikeWeakPassword =
      errCode === "weak_password" ||
      lower.includes("weak_password") ||
      lower.includes("password is known to be weak") ||
      lower.includes("password should be") ||
      (errStatus === 422 && (lower.includes("password") || lower.includes("weak")));

    if (looksLikeWeakPassword) {
      return apiError(400, {
        error: "weak_password",
        code: "REGISTER_WEAK_PASSWORD",
        action: "fix_input",
      });
    }

    // Do not send a localized `message` here: it overrides client i18n for sign_up_failed.
    return apiError(400, {
      error: "sign_up_failed",
      code: "REGISTER_CREATE_USER_FAILED",
      action: "retry",
      ...(process.env.NODE_ENV === "development" ? { message: errMessage } : {}),
      ...(errCode ? { authCode: errCode } : {}),
    });
  }

  const user = signUp.data.user;
  const identities = user?.identities;
  if (user && (!identities || identities.length === 0)) {
    console.warn("[auth/register] signUp returned user with no identities (treat as existing email)", {
      email: normalizedEmail,
    });
    return apiError(409, {
      error: "email_exists",
      code: "REGISTER_EMAIL_EXISTS",
      action: "login",
      message:
        "Este correo ya está asociado a una cuenta (p. ej. Google). Inicia sesión con ese método o usa otro correo.",
    });
  }

  const uid = user?.id;
  if (uid) {
    await supabase.from("users").upsert(
      { id: uid, email: normalizedEmail },
      { onConflict: "id" },
    );
    await initFreeUser(uid);
    try {
      await recordUserLegalAcceptance(uid, body.legalConsent);
      await clearPendingEmailLegalConsentMetadata(uid);
    } catch (error) {
      console.error("[auth/register] legal consent insert failed", error);
      return apiError(500, {
        error: "legal_consent_store_failed",
        code: "LEGAL_CONSENT_STORE_FAILED",
        action: "apply_db_migration",
      });
    }
  }
  return Response.json({ ok: true, userId: uid ?? null });
}

