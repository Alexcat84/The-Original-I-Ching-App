"use client";

import { TOKEN_PACKS } from "@/lib/token-packs";
import { buildPlansCheckoutUrl, resolveBasePlansUrl } from "@/lib/plans-checkout";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PricingPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const baseUrl = resolveBasePlansUrl(process.env.NEXT_PUBLIC_PLANS_URL ?? "");

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

  async function openExternalCheckout() {
    if (!baseUrl) return;
    setBusy(true);
    setMessage(null);
    let appUserId: string | null = null;
    if (isSupabaseBrowserConfigured()) {
      const { data } = await getSupabaseBrowser().auth.getSession();
      appUserId = data.session?.user?.id?.trim() ?? null;
    }
    if (!appUserId) {
      setMessage("Para comprar tokens necesitas iniciar sesión.");
      setBusy(false);
      router.push("/login");
      return;
    }
    const built = await buildPlansCheckoutUrl(process.env.NEXT_PUBLIC_PLANS_URL, {
      appUserId,
      requireAppUserId: true,
    });
    if (!built.ok) {
      setMessage(
        "No se pudo preparar el enlace de compra. Revisa la URL de planes en variables de entorno.",
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
          width: "min(860px, 96vw)",
          borderRadius: 16,
          border: "1px solid rgba(84,160,186,0.35)",
          background: "linear-gradient(180deg, rgba(16,31,45,0.98), rgba(9,20,31,0.98))",
          boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
          padding: 18,
          color: "#d8edf5",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>Packs de tokens</h1>
        <p style={{ marginTop: 8, opacity: 0.95 }}>
          {typeof balance === "number" ? `Tienes ${balance} tokens disponibles` : "Inicia sesión para ver tu saldo"}
        </p>
        <p style={{ marginTop: 8, opacity: 0.85 }}>
          Las suscripciones ya no están activas. Ahora compras tokens consumibles por paquete.
        </p>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 14 }}>
          {Object.entries(TOKEN_PACKS).map(([packId, pack]) => (
            <article
              key={packId}
              style={{
                border: "1px solid rgba(84,160,186,0.4)",
                borderRadius: 14,
                padding: 12,
                background: "rgba(10, 20, 31, 0.72)",
              }}
            >
              <h2 style={{ margin: 0, fontSize: 17 }}>{pack.label}</h2>
              <p style={{ marginTop: 8, marginBottom: 0, fontSize: 26, fontWeight: 700 }}>{pack.tokens} tokens</p>
              <p style={{ marginTop: 6, marginBottom: 0, opacity: 0.95 }}>${pack.price.toFixed(2)} USD</p>
              <p style={{ marginTop: 6, marginBottom: 12, opacity: 0.8 }}>
                Hasta {pack.sessionLimit} preguntas por hilo
              </p>
              <button
                type="button"
                onClick={() => void openExternalCheckout()}
                disabled={!baseUrl || busy}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(84,160,186,0.6)",
                  background: "rgba(12, 23, 35, 0.95)",
                  color: "#d8edf5",
                  padding: "8px 14px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {busy ? "Abriendo..." : "Comprar tokens"}
              </button>
            </article>
          ))}
        </div>
        {balance === 0 ? <p style={{ marginTop: 12 }}>Has usado todos tus tokens. Compra un nuevo paquete para continuar.</p> : null}
        {message ? <p style={{ marginTop: 10 }}>{message}</p> : null}
      </section>
    </main>
  );
}
