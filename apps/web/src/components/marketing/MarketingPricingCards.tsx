"use client";

import {
  formatPerThreadCap,
  getMarketingUiMessages,
  getPricingUiMessages,
  getTokenPackLabel,
  type TokenPackMarketingId,
} from "@iching-oracle/i18n";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { buildPlansCheckoutUrl } from "@/lib/plans-checkout";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { PACK_IDS_ORDERED, TOKEN_PACKS, type PackId } from "@/lib/token-packs";
import { useAppLocale } from "@/lib/use-app-locale";

/**
 * Marketing Home pricing cards (#precios). Whole card is the CTA:
 * - signed in  → RevenueCat hosted checkout with ?package_id= preselecting the
 *   tier (unknown ids degrade to RC's pack selection page).
 * - signed out → /login?mode=signup (registration-first flow; post-auth lands
 *   in /chat where the token center handles purchase).
 */
export function MarketingPricingCards() {
  const router = useRouter();
  const locale = useAppLocale();
  const m = useMemo(() => getMarketingUiMessages(locale), [locale]);
  const p = useMemo(() => getPricingUiMessages(locale), [locale]);
  const [busyPack, setBusyPack] = useState<PackId | null>(null);

  const detailByPack: Record<PackId, string> = {
    tokens_seeker_20: m.pricing.seekerDetail,
    tokens_practitioner_40: m.pricing.practitionerDetail,
    tokens_master_100: m.pricing.masterDetail,
  };
  const cardClassByPack: Record<PackId, string> = {
    tokens_seeker_20: "mk-price-card",
    tokens_practitioner_40: "mk-price-card mk-price-card--popular",
    tokens_master_100: "mk-price-card mk-price-card--gold",
  };

  async function onPickPack(packId: PackId) {
    if (busyPack) return;
    setBusyPack(packId);
    try {
      let appUserId: string | null = null;
      let email: string | null = null;
      if (isSupabaseBrowserConfigured()) {
        const { data } = await getSupabaseBrowser().auth.getSession();
        appUserId = data.session?.user?.id?.trim() ?? null;
        email = data.session?.user?.email?.trim() ?? null;
      }
      if (!appUserId) {
        router.push("/login?mode=signup");
        return;
      }
      const built = await buildPlansCheckoutUrl(process.env.NEXT_PUBLIC_PLANS_URL, {
        appUserId,
        email,
        requireAppUserId: true,
        packageId: packId,
      });
      if (built.ok) {
        window.location.href = built.url;
      } else {
        router.push("/login?mode=signup");
      }
    } finally {
      setBusyPack(null);
    }
  }

  return (
    <div className="mk-pricing-cards">
      {PACK_IDS_ORDERED.map((packId) => {
        const pack = TOKEN_PACKS[packId];
        return (
          <button
            key={packId}
            type="button"
            className={cardClassByPack[packId]}
            onClick={() => void onPickPack(packId)}
            disabled={busyPack !== null}
            aria-busy={busyPack === packId}
          >
            {packId === "tokens_practitioner_40" ? (
              <span className="mk-price-popular-badge">{m.pricing.popularBadge}</span>
            ) : null}
            <p className="mk-price-name">
              {getTokenPackLabel(packId as TokenPackMarketingId, locale)}
            </p>
            <p className="mk-price-amount">${pack.price.toFixed(2)}</p>
            <p className="mk-price-line">
              {pack.tokens} {p.tokensWord} · {formatPerThreadCap(p, pack.sessionLimit)}
            </p>
            <p className="mk-price-detail">{detailByPack[packId]}</p>
          </button>
        );
      })}
    </div>
  );
}
