import { NextResponse } from "next/server";
import { z } from "zod";
import { Logger } from "next-axiom";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "@/lib/legal-consent";
import { clearPendingEmailLegalConsentMetadata, recordUserLegalAcceptance } from "@/lib/legal-consent-server";
import { getUpstashRedis } from "@/lib/rate-limit";

export const runtime = "nodejs";

const legalConsentSchema = z.object({
  accepted: z.literal(true),
  termsVersion: z.literal(CURRENT_TERMS_VERSION),
  privacyVersion: z.literal(CURRENT_PRIVACY_VERSION),
  acceptedAt: z.string().datetime(),
  source: z.enum(["google_oauth", "post_login", "email_signup"]),
});

export async function POST(req: Request) {
  const log = new Logger({ source: "api/auth/legal-consent" });
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return apiError(400, { error: "invalid_json", code: "REQUEST_INVALID_JSON", action: "fix_input" });
  }

  const parsed = legalConsentSchema.safeParse(rawBody);
  if (!parsed.success) {
    return apiError(400, {
      error: "legal_consent_required",
      code: "LEGAL_CONSENT_REQUIRED",
      action: "fix_input",
      details: parsed.error.flatten(),
    });
  }

  try {
    await recordUserLegalAcceptance(user.userId, parsed.data);
    if (parsed.data.source === "email_signup") {
      await clearPendingEmailLegalConsentMetadata(user.userId);
    }
    const redis = getUpstashRedis();
    if (redis) {
      await redis.del(`bootstrap:${user.userId}`).catch(() => {});
    }
  } catch (error) {
    log.error("legal_consent_store_failed", {
      userId: user.userId.slice(0, 8),
      source: parsed.data.source,
      message: error instanceof Error ? error.message : String(error),
    });
    console.error("[auth/legal-consent] insert failed", error);
    await log.flush();
    return apiError(500, {
      error: "legal_consent_store_failed",
      code: "LEGAL_CONSENT_STORE_FAILED",
      action: "apply_db_migration",
    });
  }

  log.info("legal_consent_recorded", {
    userId: user.userId.slice(0, 8),
    source: parsed.data.source,
    termsVersion: parsed.data.termsVersion,
    privacyVersion: parsed.data.privacyVersion,
  });
  await log.flush();
  return NextResponse.json({ ok: true });
}
