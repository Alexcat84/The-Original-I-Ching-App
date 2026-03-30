"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { ensureRevenueCatUserAligned } from "@/components/RevenueCatSupabaseSync";
import Link from "next/link";
import { useState } from "react";

const FALLBACK_PATH = "/guia#planes";

function resolveBasePlansUrl(raw: string): string | null {
  const plansUrl = raw.trim();
  if (!plansUrl) return null;

  if (plansUrl === "/pricing" || plansUrl === "pricing" || plansUrl.startsWith("/pricing?")) {
    return null;
  }

  try {
    const parsed = new URL(plansUrl);
    const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    if (pathname === "/pricing") {
      return null;
    }
    return parsed.toString();
  } catch {
    return plansUrl;
  }
}

export default function PricingPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const baseUrl = resolveBasePlansUrl(process.env.NEXT_PUBLIC_PLANS_URL ?? "");

  async function openExternalCheckout() {
    if (!baseUrl) return;
    setBusy(true);
    setMessage(null);
    const target = new URL(baseUrl, window.location.origin);
    try {
      if (isSupabaseBrowserConfigured()) {
        const sb = getSupabaseBrowser();
        const deadline = Date.now() + 2500;
        let appUserId: string | undefined;
        while (Date.now() < deadline) {
          const { data } = await sb.auth.getSession();
          await ensureRevenueCatUserAligned(data.session ?? null);
          const id = data.session?.user?.id?.trim();
          if (id) {
            appUserId = id;
            break;
          }
          await new Promise((r) => setTimeout(r, 120));
        }
        if (appUserId) {
          target.searchParams.set("app_user_id", appUserId);
          target.searchParams.set("rc_app_user_id", appUserId);
        }
      }
      window.location.href = target.toString();
    } catch {
      setMessage("No se pudo abrir el checkout externo en este momento.");
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "65vh", display: "grid", placeItems: "center", padding: 20 }}>
      <section
        style={{
          width: "min(560px, 96vw)",
          borderRadius: 16,
          border: "1px solid rgba(84,160,186,0.35)",
          background: "linear-gradient(180deg, rgba(16,31,45,0.98), rgba(9,20,31,0.98))",
          boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
          padding: 18,
          color: "#d8edf5",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 18 }}>Planes y suscripción</h1>
        <p style={{ marginTop: 10, opacity: 0.9 }}>
          Puedes revisar los planes en la guía integrada. El checkout externo es opcional.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <Link
            href={FALLBACK_PATH}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(84,160,186,0.6)",
              padding: "8px 14px",
              textDecoration: "none",
              color: "#d8edf5",
            }}
          >
            Ver guía de planes
          </Link>
          {baseUrl ? (
            <button
              type="button"
              onClick={() => void openExternalCheckout()}
              disabled={busy}
              style={{
                borderRadius: 999,
                border: "1px solid rgba(84,160,186,0.6)",
                background: "rgba(12, 23, 35, 0.95)",
                color: "#d8edf5",
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              {busy ? "Abriendo..." : "Abrir checkout externo"}
            </button>
          ) : null}
        </div>
        {message ? <p style={{ marginTop: 10 }}>{message}</p> : null}
      </section>
    </main>
  );
}
