"use client";

import { buildPlansCheckoutUrl, resolveBasePlansUrl } from "@/lib/plans-checkout";
import Link from "next/link";
import { useState } from "react";

const FALLBACK_PATH = "/guia#planes";

export default function PricingPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const baseUrl = resolveBasePlansUrl(process.env.NEXT_PUBLIC_PLANS_URL ?? "");

  async function openExternalCheckout() {
    if (!baseUrl) return;
    setBusy(true);
    setMessage(null);
    const built = await buildPlansCheckoutUrl(process.env.NEXT_PUBLIC_PLANS_URL);
    if (!built.ok) {
      setMessage(
        "No se pudo preparar el enlace de pago. Comprueba que la URL de planes sea el enlace completo de la tienda, no la página principal.",
      );
      setBusy(false);
      return;
    }
    window.location.href = built.url;
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
