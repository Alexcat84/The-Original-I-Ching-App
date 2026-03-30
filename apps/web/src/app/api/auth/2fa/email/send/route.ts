import { createHash, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const EMAIL_CODE_TTL_MINUTES = 10;

function isMissingTwoFactorEmailTableError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("42p01") ||
    (m.includes("does not exist") && m.includes("two_factor_email_codes")) ||
    m.includes("schema cache")
  );
}

function hashEmailCode(code: string, secret: string): string {
  return createHash("sha256").update(`${code}:${secret}`).digest("hex");
}

function createSixDigitCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

async function sendEmail2faCode(params: {
  apiKey: string;
  from: string;
  to: string;
  code: string;
  ttlMinutes: number;
}): Promise<{ ok: boolean; status: number; message?: string }> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: "Tu código de verificación (2FA) — The Original I Ching App",
      text: `Tu código de verificación es: ${params.code}. Expira en ${params.ttlMinutes} minutos.`,
      html: `<p>Tu código de verificación es:</p><p style="font-size:24px;font-weight:700;letter-spacing:3px">${params.code}</p><p>Expira en ${params.ttlMinutes} minutos.</p>`,
    }),
  });
  if (response.ok) {
    return { ok: true, status: response.status };
  }
  let message: string | undefined;
  try {
    const body = (await response.json()) as { message?: string; error?: { message?: string } };
    message = body.error?.message ?? body.message;
  } catch {
    message = undefined;
  }
  return { ok: false, status: response.status, message };
}

export async function POST(req: Request) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(503, {
      error: "supabase_not_configured",
      code: "AUTH_PROVIDER_NOT_CONFIGURED",
      action: "check_config",
    });
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const resendFrom = process.env.TWO_FACTOR_EMAIL_FROM?.trim();
  const codeSecret = process.env.TWO_FACTOR_EMAIL_CODE_SECRET?.trim();
  if (!resendApiKey || !resendFrom || !codeSecret) {
    return apiError(503, {
      error: "two_factor_email_not_configured",
      code: "TWO_FACTOR_EMAIL_NOT_CONFIGURED",
      action: "check_config",
      details: {
        missingResendKey: !resendApiKey,
        missingFromAddress: !resendFrom,
        missingCodeSecret: !codeSecret,
      },
    });
  }

  const code = createSixDigitCode();
  const codeHash = hashEmailCode(code, codeSecret);
  const expiresAt = new Date(Date.now() + EMAIL_CODE_TTL_MINUTES * 60_000).toISOString();

  const { error: clearError } = await supabase
    .from("two_factor_email_codes")
    .delete()
    .eq("user_id", authUser.userId)
    .is("consumed_at", null);
  if (clearError) {
    if (isMissingTwoFactorEmailTableError(clearError.message)) {
      return apiError(503, {
        error: "two_factor_email_schema_missing",
        code: "TWO_FACTOR_EMAIL_TABLE_MISSING",
        action: "apply_db_migration",
        message:
          "Table public.two_factor_email_codes is missing. Run backend/db/migrations/007_two_factor_email_codes.sql in Supabase SQL Editor.",
      });
    }
    return apiError(500, {
      error: "two_factor_email_cleanup_failed",
      code: "TWO_FACTOR_EMAIL_CLEANUP_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? clearError.message : undefined,
    });
  }

  const { error: insertError } = await supabase.from("two_factor_email_codes").insert({
    user_id: authUser.userId,
    code_hash: codeHash,
    expires_at: expiresAt,
  });
  if (insertError) {
    if (isMissingTwoFactorEmailTableError(insertError.message)) {
      return apiError(503, {
        error: "two_factor_email_schema_missing",
        code: "TWO_FACTOR_EMAIL_TABLE_MISSING",
        action: "apply_db_migration",
        message:
          "Table public.two_factor_email_codes is missing. Run backend/db/migrations/007_two_factor_email_codes.sql in Supabase SQL Editor.",
      });
    }
    return apiError(500, {
      error: "two_factor_email_insert_failed",
      code: "TWO_FACTOR_EMAIL_INSERT_FAILED",
      action: "retry",
      details: process.env.NODE_ENV === "development" ? insertError.message : undefined,
    });
  }

  const delivery = await sendEmail2faCode({
    apiKey: resendApiKey,
    from: resendFrom,
    to: authUser.email,
    code,
    ttlMinutes: EMAIL_CODE_TTL_MINUTES,
  });

  if (!delivery.ok) {
    await supabase
      .from("two_factor_email_codes")
      .delete()
      .eq("user_id", authUser.userId)
      .is("consumed_at", null);
    return apiError(502, {
      error: "two_factor_email_delivery_failed",
      code: "TWO_FACTOR_EMAIL_DELIVERY_FAILED",
      action: "retry",
      message: delivery.message,
      details: {
        providerStatus: delivery.status,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    expiresInMinutes: EMAIL_CODE_TTL_MINUTES,
  });
}

