import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { getAccountBillingSnapshot } from "@/lib/credits";
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "@/lib/legal-consent";
import { getSessionLimit as getSessionLimitFromPack } from "@/lib/token-packs";
import { withSupabaseSemaphore } from "@/lib/supabase-admin";
import {
  buildSupabaseOpTelemetry,
  createApiLogger,
  isSupabaseTelemetryEnabled,
} from "@/lib/supabase-telemetry";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const startedAt = Date.now();
  const api = createApiLogger("api/account/me", req, "/api/account/me");

  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }

  const billing = await withSupabaseSemaphore(
    () => getAccountBillingSnapshot(user.userId),
    buildSupabaseOpTelemetry(api, "account_billing_snapshot", { userId: user.userId }),
  );

  const userProfile = await withSupabaseSemaphore(async () => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return {
        enabled: false,
        method: null as string | null,
        displayName: null as string | null,
        isAdmin: false,
        legalAccepted: false,
      };
    }
    const { data } = await supabase
      .from("users")
      .select("two_factor_enabled, two_factor_method, display_name, is_admin, tour_v1_completed_at")
      .eq("id", user.userId)
      .maybeSingle();
    const { data: legalAcceptance, error: legalAcceptanceError } = await supabase
      .from("user_legal_acceptances")
      .select("id")
      .eq("user_id", user.userId)
      .eq("terms_version", CURRENT_TERMS_VERSION)
      .eq("privacy_version", CURRENT_PRIVACY_VERSION)
      .maybeSingle();
    if (legalAcceptanceError) {
      api.log.warn("account_me_legal_lookup_failed", {
        userId: user.userId.slice(0, 8),
        error: legalAcceptanceError.message,
      });
      console.warn("[account/me] legal acceptance lookup failed", legalAcceptanceError.message);
    }
    return {
      enabled: Boolean(data?.two_factor_enabled),
      method: (data?.two_factor_method as string | null) ?? null,
      displayName: (data?.display_name as string | null) ?? null,
      isAdmin: data?.is_admin === true,
      legalAccepted: Boolean(legalAcceptance?.id),
      tourV1Completed: Boolean(data?.tour_v1_completed_at),
    };
  }, buildSupabaseOpTelemetry(api, "account_me_profile", { userId: user.userId }));

  if (isSupabaseTelemetryEnabled()) {
    api.log.info("account_me_get", {
      requestId: api.requestId,
      durationMs: Date.now() - startedAt,
      userId: user.userId.slice(0, 8),
    });
  }

  await api.log.flush();
  return NextResponse.json({
    id: user.userId,
    email: user.email,
    tokens_available: billing.creditsRemaining,
    tokens_used_lifetime: billing.creditsUsed,
    tokens_purchased_lifetime: billing.tokensPurchasedLifetime,
    session_limit: getSessionLimitFromPack(billing.lastPack),
    last_pack: billing.lastPack,
    twoFactorEnabled: userProfile.enabled,
    twoFactorMethod: userProfile.method,
    display_name: userProfile.displayName,
    is_admin: userProfile.isAdmin,
    tour_v1_completed: userProfile.tourV1Completed,
    legal_terms_version: CURRENT_TERMS_VERSION,
    legal_privacy_version: CURRENT_PRIVACY_VERSION,
    legal_acceptance_current: userProfile.legalAccepted,
  });
}
