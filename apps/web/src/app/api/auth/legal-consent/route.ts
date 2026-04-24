import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "@/lib/legal-consent";
import { recordUserLegalAcceptance } from "@/lib/legal-consent-server";

export const runtime = "nodejs";

const legalConsentSchema = z.object({
  accepted: z.literal(true),
  termsVersion: z.literal(CURRENT_TERMS_VERSION),
  privacyVersion: z.literal(CURRENT_PRIVACY_VERSION),
  acceptedAt: z.string().datetime(),
  source: z.enum(["google_oauth", "post_login"]),
});

export async function POST(req: Request) {
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
  } catch (error) {
    console.error("[auth/legal-consent] insert failed", error);
    return apiError(500, {
      error: "legal_consent_store_failed",
      code: "LEGAL_CONSENT_STORE_FAILED",
      action: "apply_db_migration",
    });
  }

  return NextResponse.json({ ok: true });
}
