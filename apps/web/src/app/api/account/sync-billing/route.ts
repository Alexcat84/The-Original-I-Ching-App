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
    if (result.error === "not_configured" || result.error === "upstream" || result.error === "invalid_response") {
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason:
          result.error === "not_configured"
            ? "billing_not_configured"
            : result.error === "upstream"
              ? "billing_upstream_unavailable"
              : "billing_invalid_response",
      });
    }
    return apiError(502, {
      error: "billing_sync_failed",
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
