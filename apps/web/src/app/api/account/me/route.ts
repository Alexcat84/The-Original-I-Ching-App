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
  const credits = await (async () => {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return {
        creditsUsed: 0,
        creditsRemaining: CREDITS_PER_MONTH[tierKey],
        cycleEnd: null as string | null,
      };
    }
    const { data } = await supabase
      .from("query_credits")
      .select("credits_total, credits_used, cycle_end")
      .eq("user_id", user.userId)
      .maybeSingle();
    const total = typeof data?.credits_total === "number" ? data.credits_total : CREDITS_PER_MONTH[tierKey];
    const used = typeof data?.credits_used === "number" ? data.credits_used : 0;
    return {
      creditsUsed: used,
      creditsRemaining: Math.max(0, total - used),
      cycleEnd: typeof data?.cycle_end === "string" ? data.cycle_end : null,
    };
  })();
  return NextResponse.json({
    email: user.email,
    tier: tierKey,
    creditsLimit: CREDITS_PER_MONTH[tierKey],
    creditsType: TIER_CONFIG[tierKey].creditsType,
    sessionDepthLimit: CONTEXT_LIMITS[tierKey].sessionDepth,
    creditsUsed: credits.creditsUsed,
    creditsRemaining: credits.creditsRemaining,
    cycleEnd: credits.cycleEnd,
    twoFactorEnabled: twoFactor.enabled,
    twoFactorMethod: twoFactor.method,
  });
}
