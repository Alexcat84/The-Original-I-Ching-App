import { toContextTierKey } from "@/lib/credits";
import type { TierKey } from "@iching-oracle/context-engine";
import type { AuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ConsultPolicyInput = {
  authUser: AuthenticatedUser;
  tierResolved: string;
};

export type ConsultPolicyDecision = {
  adminBypassAllowed: boolean;
  adminUnlimitedCredits: boolean;
  tierEffective: string;
  tierKey: TierKey;
  twoFactorRequired: boolean;
};

function parseEmailAllowlist(raw: string | undefined | null): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(/[,\n;]/g)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

function shouldEnforceTierTwoFactor(): boolean {
  const raw = (process.env.ENFORCE_TIER_2FA ?? "").trim().toLowerCase();
  if (!raw) return false;
  return raw === "1" || raw === "true";
}

function shouldAllowAdminTwoFactorBypass(): boolean {
  const raw = (process.env.ALLOW_ADMIN_2FA_BYPASS ?? "").trim().toLowerCase();
  return raw === "1" || raw === "true";
}

function shouldAllowAdminUnlimitedCredits(): boolean {
  const raw = (process.env.ALLOW_ADMIN_UNLIMITED_CREDITS ?? "").trim().toLowerCase();
  if (!raw) return true;
  return raw === "1" || raw === "true";
}

function resolveTierKey(tier: string): TierKey {
  return toContextTierKey(tier);
}

function tierRequiresTwoFactor(tierKey: TierKey): boolean {
  void tierKey;
  return false;
}

async function getTwoFactorEnabled(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { data: user } = await supabase
    .from("users")
    .select("two_factor_enabled")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(user?.two_factor_enabled);
}

export async function resolveConsultPolicy(input: ConsultPolicyInput): Promise<ConsultPolicyDecision> {
  const allowlist = parseEmailAllowlist(process.env.ADMIN_EMAIL_ALLOWLIST);
  const adminBypassAllowed = allowlist.has(input.authUser.email.trim().toLowerCase());
  const adminUnlimitedCredits = adminBypassAllowed && shouldAllowAdminUnlimitedCredits();
  // For allowlisted admin sessions, unlock full in-thread depth/features.
  const tierEffective = adminUnlimitedCredits ? "oracle" : input.tierResolved;
  const tierKey = resolveTierKey(tierEffective);
  const twoFactorRequiredByTier = shouldEnforceTierTwoFactor() && tierRequiresTwoFactor(tierKey);
  const twoFactorEnabled = twoFactorRequiredByTier ? await getTwoFactorEnabled(input.authUser.userId) : true;
  const adminCanBypassTwoFactor = adminBypassAllowed && shouldAllowAdminTwoFactorBypass();

  return {
    adminBypassAllowed,
    adminUnlimitedCredits,
    tierEffective,
    tierKey,
    twoFactorRequired: twoFactorRequiredByTier && !adminCanBypassTwoFactor && !twoFactorEnabled,
  };
}
