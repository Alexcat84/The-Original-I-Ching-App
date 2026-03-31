"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { normalizeBillingTier, type Tier } from "@/lib/credits";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 3000;
const POLL_MAX_MS = 30_000;
const SESSION_RETRY_DELAY_MS = 2000;

type Phase = "processing" | "success" | "pending" | "session-wait";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tierWelcomeLabel(tier: string): string {
  const t = normalizeBillingTier(tier);
  const labels: Record<Tier, string> = {
    free: "Free",
    seeker: "Seeker",
    seeker_monthly: "Seeker",
    seeker_annual: "Seeker",
    practitioner: "Practitioner",
    master: "Master",
    oracle: "Oracle",
  };
  return labels[t] ?? tier;
}

async function getAccessToken(): Promise<string | null> {
  if (!isSupabaseBrowserConfigured()) return null;
  const { data } = await getSupabaseBrowser().auth.getSession();
  return data.session?.access_token?.trim() ?? null;
}

async function fetchAccountMe(token: string): Promise<{ ok: true; tier: string } | { ok: false; status: number }> {
  const res = await fetch("/api/account/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  const body = (await res.json()) as { tier?: string };
  return { ok: true, tier: typeof body.tier === "string" ? body.tier : "free" };
}

function isPaidTier(tier: string): boolean {
  return normalizeBillingTier(tier) !== "free";
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const ranRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("processing");
  const [paidTierLabel, setPaidTierLabel] = useState<string>("");

  useEffect(() => {
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
      if (me.ok && isPaidTier(me.tier)) {
        setPaidTierLabel(tierWelcomeLabel(me.tier));
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
        if (me.ok && isPaidTier(me.tier)) {
          setPaidTierLabel(tierWelcomeLabel(me.tier));
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
            <h1 className="checkout-success-title">Redirigiendo…</h1>
            <div className="checkout-success-spinner" aria-hidden />
            <p className="checkout-success-sub">Estamos recuperando tu sesión.</p>
          </>
        ) : phase === "processing" ? (
          <>
            <h1 className="checkout-success-title">Procesando tu suscripción…</h1>
            <div className="checkout-success-spinner" aria-hidden />
          </>
        ) : phase === "success" ? (
          <>
            <h1 className="checkout-success-title">¡Bienvenido a {paidTierLabel}!</h1>
            <p className="checkout-success-sub">Tus consultas están listas.</p>
            <button
              type="button"
              className="composer-reading-pill is-active checkout-success-cta"
              onClick={() => router.replace("/")}
            >
              Ir al oráculo
            </button>
          </>
        ) : phase === "pending" ? (
          <>
            <h1 className="checkout-success-title">Tu pago está siendo procesado.</h1>
            <p className="checkout-success-sub">
              En unos minutos verás tu nuevo plan activo. Puedes seguir usando la app.
            </p>
            <button
              type="button"
              className="composer-reading-pill is-active checkout-success-cta"
              onClick={() => router.replace("/")}
            >
              Ir al oráculo
            </button>
          </>
        ) : null}
      </div>
    </main>
  );
}
