import { registerStep1Schema, validateEmailForRegistration } from "@iching-oracle/auth-backend";
import { createClient } from "@supabase/supabase-js";
import { apiError } from "@/lib/api-error";
import { rateLimitByKey } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyTurnstile } from "@/lib/turnstile";
import { initFreeUser } from "@/lib/credits";
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  PENDING_EMAIL_LEGAL_METADATA_KEY,
} from "@/lib/legal-consent";
import { clearPendingEmailLegalConsentMetadata, recordUserLegalAcceptance } from "@/lib/legal-consent-server";
import { z } from "zod";

export const runtime = "nodejs";

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
  const origin = safeAuthRedirectOrigin(req);
  const signUp = await authClient.auth.signUp({
    email: normalizedEmail,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin.replace(/\/$/, "")}/auth/callback`,
      data: {
        [PENDING_EMAIL_LEGAL_METADATA_KEY]: JSON.stringify(body.legalConsent),
      },
    },
  });
  if (signUp.error) {
    const errCode = "code" in signUp.error ? String((signUp.error as { code?: string }).code ?? "") : "";
    const lower = signUp.error.message.toLowerCase();
    if (
      errCode === "user_already_exists" ||
      lower.includes("user already registered") ||
      lower.includes("already registered") ||
      lower.includes("email already") ||
      lower.includes("already been registered") ||
      lower.includes("already exists") ||
      lower.includes("duplicate") ||
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

