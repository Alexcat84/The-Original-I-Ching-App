import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { getAccountBillingSnapshot, toContextTierKey } from "@/lib/credits";
import { CONTEXT_LIMITS, type TierKey } from "@iching-oracle/context-engine";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }
  const billing = await getAccountBillingSnapshot(user.userId);
  const tier = billing.tier;
  const tierKey = toContextTierKey(tier) as TierKey;
  const twoFactor = await (async () => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const supabase = getSupabaseAdmin();
    if (!supabase) return { enabled: false, method: null as string | null };
    const { data } = await supabase
      .from("users")
      .select("two_factor_enabled, two_factor_method")
      .eq("id", user.userId)
      .maybeSingle();
    return {
      enabled: Boolean(data?.two_factor_enabled),
      method: (data?.two_factor_method as string | null) ?? null,
    };
  })();
  return NextResponse.json({
    email: user.email,
    tier,
    creditsLimit: billing.creditsLimit,
    creditsType: billing.creditsType,
    sessionDepthLimit: CONTEXT_LIMITS[tierKey].sessionDepth,
    creditsUsed: billing.creditsUsed,
    creditsRemaining: billing.creditsRemaining,
    cycleEnd: billing.cycleEnd,
    twoFactorEnabled: twoFactor.enabled,
    twoFactorMethod: twoFactor.method,
  });
}
