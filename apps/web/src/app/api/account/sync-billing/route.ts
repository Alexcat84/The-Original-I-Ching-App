import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { syncUserTierFromRevenueCatRest } from "@/lib/revenuecat-rest";

export const runtime = "nodejs";

/**
 * Pulls the current subscriber from RevenueCat (REST) and updates Postgres tier/credits.
 * Complements webhooks (e.g. after Web SDK identify, or if a webhook was missed).
 */
export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const result = await syncUserTierFromRevenueCatRest(user.userId);
  if (!result.ok) {
    if (result.error === "not_configured") {
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: "billing_not_configured",
      });
    }
    const status = 502;
    return apiError(status, {
      error: result.error,
      code: "BILLING_SYNC_FAILED",
      action: "retry",
    });
  }

  return NextResponse.json({
    ok: true,
    tier: result.tier,
    source: result.source,
  });
}
