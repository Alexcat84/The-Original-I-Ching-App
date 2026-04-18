"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { useAppLocale } from "@/lib/use-app-locale";
import { TOKEN_PACKS, type PackId } from "@/lib/token-packs";
import {
  formatCheckoutSuccessTitle,
  getCheckoutSuccessUiMessages,
  getGuiaPacksUiMessages,
  getTokenPackLabel,
} from "@iching-oracle/i18n";
import type { AppLocale, TokenPackMarketingId } from "@iching-oracle/i18n";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_MS = 30_000;
const SESSION_RETRY_DELAY_MS = 2000;

type Phase = "processing" | "success" | "pending" | "session-wait";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function packDisplayForCheckout(lastPack: string, locale: AppLocale): string {
  if (lastPack === "free") return getGuiaPacksUiMessages(locale).freeProductName;
  if (lastPack in TOKEN_PACKS) {
    return getTokenPackLabel(lastPack as TokenPackMarketingId, locale);
  }
  return TOKEN_PACKS[lastPack as PackId]?.label ?? lastPack;
}

async function getAccessToken(): Promise<string | null> {
  if (!isSupabaseBrowserConfigured()) return null;
  const { data } = await getSupabaseBrowser().auth.getSession();
  return data.session?.access_token?.trim() ?? null;
}

async function fetchAccountMe(
  token: string,
): Promise<{ ok: true; lastPack: string; tokensAvailable: number } | { ok: false; status: number }> {
  const res = await fetch("/api/account/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  const body = (await res.json()) as { last_pack?: string; tokens_available?: number };
  const lastPack = typeof body.last_pack === "string" ? body.last_pack : "free";
  const tokensAvailable = typeof body.tokens_available === "number" ? body.tokens_available : 0;
  console.log("[checkout/success] /api/account/me →", { lastPack, tokensAvailable, raw: body });
  return { ok: true, lastPack, tokensAvailable };
}

function hasPurchasedTokens(lastPack: string, tokensAvailable: number): boolean {
  return lastPack !== "free" || tokensAvailable > 2;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const locale = useAppLocale();
  const ui = useMemo(() => getCheckoutSuccessUiMessages(locale), [locale]);
  const ranRef = useRef(false);
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const [phase, setPhase] = useState<Phase>("processing");
  const [paidTierLabel, setPaidTierLabel] = useState<string>("");

  useEffect(() => {
    if (/android/i.test(navigator.userAgent)) {
      window.location.href = "theoriginaliching://purchase-success";
      return; // let the APK handle it; page stays visible as fallback
    }

    if (ranRef.current) return;
    ranRef.current = true;

    void (async () => {
      let token = await getAccessToken();

      if (!token) {
        setPhase("session-wait");
        await sleep(SESSION_RETRY_DELAY_MS);
        token = await getAccessToken();
        if (!token) {
          router.replace("/login");
          return;
        }
      }

      setPhase("processing");

      try {
        await fetch("/api/account/sync-billing", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
      } catch {
        /* non-fatal — polling will retry */
      }

      const deadline = Date.now() + POLL_MAX_MS;
      let me = await fetchAccountMe(token);
      if (!me.ok && me.status === 401) {
        router.replace("/login");
        return;
      }
      if (me.ok && hasPurchasedTokens(me.lastPack, me.tokensAvailable)) {
        setPaidTierLabel(packDisplayForCheckout(me.lastPack, localeRef.current));
        setPhase("success");
        return;
      }

      while (Date.now() < deadline) {
        await sleep(POLL_INTERVAL_MS);
        const t = await getAccessToken();
        if (!t) {
          router.replace("/login");
          return;
        }
        token = t;
        me = await fetchAccountMe(token);
        if (!me.ok && me.status === 401) {
          router.replace("/login");
          return;
        }
        if (me.ok && hasPurchasedTokens(me.lastPack, me.tokensAvailable)) {
          setPaidTierLabel(packDisplayForCheckout(me.lastPack, localeRef.current));
          setPhase("success");
          return;
        }
      }

      setPhase("pending");
    })();
  }, [router]);

  return (
    <main className="checkout-success-root">
      <div className="checkout-success-card">
        {phase === "session-wait" ? (
          <>
            <h1 className="checkout-success-title">{ui.sessionWaitTitle}</h1>
            <div className="checkout-success-spinner" aria-hidden />
            <p className="checkout-success-sub">{ui.sessionWaitSub}</p>
          </>
        ) : phase === "processing" ? (
          <>
            <h1 className="checkout-success-title">{ui.processingTitle}</h1>
            <div className="checkout-success-spinner" aria-hidden />
          </>
        ) : phase === "success" ? (
          <>
            <h1 className="checkout-success-title">{formatCheckoutSuccessTitle(ui, paidTierLabel)}</h1>
            <p className="checkout-success-sub">{ui.successSub}</p>
            <button
              type="button"
              className="composer-reading-pill is-active checkout-success-cta"
              onClick={() => router.replace("/")}
            >
              {ui.ctaOracle}
            </button>
          </>
        ) : phase === "pending" ? (
          <>
            <h1 className="checkout-success-title">{ui.pendingTitle}</h1>
            <p className="checkout-success-sub">{ui.pendingSub}</p>
            <button
              type="button"
              className="composer-reading-pill is-active checkout-success-cta"
              onClick={() => router.replace("/")}
            >
              {ui.ctaOracle}
            </button>
          </>
        ) : null}
      </div>
    </main>
  );
}
