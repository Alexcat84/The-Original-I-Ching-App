import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { apiError } from "@/lib/api-error";
import { CREDITS_PER_MONTH, getUserBillingTier, TIER_CONFIG } from "@/lib/credits";
import { CONTEXT_LIMITS, type TierKey } from "@iching-oracle/context-engine";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return apiError(401, { error: "auth_required", code: "AUTH_REQUIRED", action: "login" });
  }
  const tier = await getUserBillingTier(user.userId);
  const tierKey = (tier in CONTEXT_LIMITS ? tier : "free") as TierKey;
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
    tier: tierKey,
    creditsLimit: CREDITS_PER_MONTH[tierKey],
    creditsType: TIER_CONFIG[tierKey].creditsType,
    sessionDepthLimit: CONTEXT_LIMITS[tierKey].sessionDepth,
    twoFactorEnabled: twoFactor.enabled,
    twoFactorMethod: twoFactor.method,
  });
}
