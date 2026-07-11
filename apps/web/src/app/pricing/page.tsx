"use client";

import {
  formatPricingBalance,
  getMarketingUiMessages,
  getPricingUiMessages,
} from "@iching-oracle/i18n";
import { useEffect, useMemo, useState } from "react";
import { MarketingDocShell } from "@/components/marketing/MarketingDocShell";
import { MarketingPricingCards } from "@/components/marketing/MarketingPricingCards";
import { useAppLocale } from "@/lib/use-app-locale";

export default function PricingPage() {
  const locale = useAppLocale();
  const p = useMemo(() => getPricingUiMessages(locale), [locale]);
  const m = useMemo(() => getMarketingUiMessages(locale), [locale]);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/account/me", { cache: "no-store", credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { tokens_available?: number } | null) => {
        if (cancelled) return;
        setBalance(typeof j?.tokens_available === "number" ? j.tokens_available : null);
      })
      .catch(() => {
        if (!cancelled) setBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MarketingDocShell active="pricing">
      <div style={{ maxWidth: "72rem", margin: "0 auto" }}>
        <p className="mk-eyebrow">{m.pricing.eyebrow}</p>
        <h1
          className="mk-h2"
          style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.25 }}
        >
          {m.pricing.title}
        </h1>
        {typeof balance === "number" ? (
          <p
            style={{
              margin: "16px 0 0",
              fontFamily: "var(--mk-font-ui)",
              fontSize: 14,
              color: "var(--mk-gold-soft)",
            }}
          >
            {formatPricingBalance(p, balance)}
          </p>
        ) : null}
        <p className="mk-pricing-sub" style={{ maxWidth: "48rem" }}>
          {m.pricing.subtitle}
        </p>
        <p className="mk-pricing-sub" style={{ maxWidth: "48rem" }}>
          {p.threadLimitDepends}
        </p>
        <div style={{ marginTop: 40 }}>
          <MarketingPricingCards />
        </div>
        {balance === 0 ? (
          <p className="mk-pricing-sub" style={{ marginTop: 24 }}>
            {p.depleted}
          </p>
        ) : null}
      </div>
    </MarketingDocShell>
  );
}
