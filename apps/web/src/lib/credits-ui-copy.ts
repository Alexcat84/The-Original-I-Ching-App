import { DEFAULT_LOCALE, getCreditsNoticeUiMessages } from "@iching-oracle/i18n";
import type { AppLocale } from "@iching-oracle/i18n";
import { FREE_SESSION_LIMIT, getSessionLimit } from "@/lib/token-packs";

export type BillingTier = "free" | "seeker" | "practitioner" | "master";
export type CreditsNoticeReason = "credits_depleted" | "free_lifetime_depleted" | "billing_unavailable";

export type CreditsNoticeAction = "open_plans" | "sync-billing" | "mailto";
export type CreditsNoticeCta = { label: string; action: CreditsNoticeAction; href?: string };
export type CreditsNoticeCopy = {
  title: string;
  body: string;
  resetLine: string;
  primaryCta: CreditsNoticeCta;
  secondaryCta?: CreditsNoticeCta;
};

export function tierToBillingTierCopy(tier: string): BillingTier {
  if (tier === "tokens_seeker_20" || tier === "seeker") return "seeker";
  if (tier === "tokens_practitioner_40" || tier === "practitioner") return "practitioner";
  if (tier === "tokens_master_100" || tier === "master") return "master";
  return "free";
}

function packResetLine(m: ReturnType<typeof getCreditsNoticeUiMessages>, packName: string, limit: number): string {
  return `${m.packThreadLimitPrefix} ${packName}: ${limit} ${limit === 1 ? m.threadLimitSuffixSingular : m.threadLimitSuffix}.`;
}

export function creditsExhaustedBlock(
  tier: BillingTier,
  reason: CreditsNoticeReason,
  locale: AppLocale = DEFAULT_LOCALE,
): CreditsNoticeCopy {
  const m = getCreditsNoticeUiMessages(locale);

  if (reason === "billing_unavailable") {
    return {
      title: m.billingUnavailableTitle,
      body: m.billingUnavailableBody,
      resetLine: m.billingUnavailableReset,
      primaryCta: { label: m.billingUnavailableCta, action: "sync-billing" },
    };
  }

  if (reason === "credits_depleted") {
    const packKey =
      tier === "master"
        ? "tokens_master_100"
        : tier === "practitioner"
          ? "tokens_practitioner_40"
          : tier === "seeker"
            ? "tokens_seeker_20"
            : "free";
    const limit = getSessionLimit(packKey);
    return {
      title: m.depletedTitle,
      body: m.depletedBody,
      resetLine: `${m.freeDepletedReset} ${limit} ${limit === 1 ? m.threadLimitSuffixSingular : m.threadLimitSuffix}.`,
      primaryCta: { label: m.buyTokensCta, action: "open_plans" },
    };
  }

  switch (tier) {
    case "free":
      return {
        title: m.freeDepletedTitle,
        body: m.freeDepletedBody,
        resetLine: `${m.freeDepletedReset} ${FREE_SESSION_LIMIT} ${m.threadLimitSuffixSingular}.`,
        primaryCta: { label: m.buyTokensCta, action: "open_plans" },
      };
    case "seeker":
      return {
        title: m.seekerDepletedTitle,
        body: m.seekerDepletedBody,
        resetLine: packResetLine(m, "Seeker Pack", getSessionLimit("tokens_seeker_20")),
        primaryCta: { label: m.buyMoreTokensCta, action: "open_plans" },
      };
    case "practitioner":
      return {
        title: m.practitionerDepletedTitle,
        body: m.practitionerDepletedBody,
        resetLine: packResetLine(m, "Practitioner Pack", getSessionLimit("tokens_practitioner_40")),
        primaryCta: { label: m.buyMoreTokensCta, action: "open_plans" },
      };
    case "master":
      return {
        title: m.masterDepletedTitle,
        body: m.masterDepletedBody,
        resetLine: packResetLine(m, "Master Pack", getSessionLimit("tokens_master_100")),
        primaryCta: { label: m.buyMoreTokensCta, action: "open_plans" },
      };
  }
}
