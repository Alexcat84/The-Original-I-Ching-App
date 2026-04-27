import { toContextTierKey } from "@/lib/credits";
import type { TierKey } from "@iching-oracle/context-engine";
import type { AuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const EMAIL_EXACT_PATTERN = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

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
      .filter((value) => value.length > 3 && value.length <= 254 && EMAIL_EXACT_PATTERN.test(value)),
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

async function getIsAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { data: user } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  return user?.is_admin === true;
}

export async function resolveConsultPolicy(input: ConsultPolicyInput): Promise<ConsultPolicyDecision> {
  const allowlist = parseEmailAllowlist(process.env.ADMIN_EMAIL_ALLOWLIST);
  const adminByAllowlist = allowlist.has(input.authUser.email.trim().toLowerCase());
  const adminByDB = await getIsAdmin(input.authUser.userId);
  const adminBypassAllowed = adminByAllowlist || adminByDB;
  const adminUnlimitedCredits = adminBypassAllowed;
  const tierEffective = adminBypassAllowed ? "tokens_master_100" : input.tierResolved;
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
