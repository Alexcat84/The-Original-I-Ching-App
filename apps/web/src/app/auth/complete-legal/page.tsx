"use client";

import { LegalConsentModal } from "@/components/LegalConsentModal";
import { createLegalConsentPayload, LEGAL_CONSENT_PENDING_STORAGE_KEY } from "@/lib/legal-consent";
import { fetchLegalAcceptanceStatus } from "@/lib/post-auth-legal";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { useAppLocale } from "@/lib/use-app-locale";
import {
  getAuthCallbackUiMessages,
  getDocNavUiMessages,
  getLoginPageUiMessages,
  getPrivacyPageMessages,
  getTermsPageMessages,
} from "@iching-oracle/i18n";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function CompleteLegalPage() {
  const router = useRouter();
  const locale = useAppLocale();
  const L = useMemo(() => getLoginPageUiMessages(locale), [locale]);
  const nav = useMemo(() => getDocNavUiMessages(locale), [locale]);
  const privacy = useMemo(() => getPrivacyPageMessages(locale), [locale]);
  const terms = useMemo(() => getTermsPageMessages(locale), [locale]);
  const mCallback = useMemo(() => getAuthCallbackUiMessages(locale), [locale]);

  const [phase, setPhase] = useState<"checking" | "modal">("checking");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // True when the user already accepted an earlier version and must re-accept an update.
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }
    const sb = getSupabaseBrowser();
    void (async () => {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session?.access_token) {
        router.replace("/login");
        return;
      }
      const legal = await fetchLegalAcceptanceStatus(session.access_token);
      if (legal === null) {
        router.replace("/login");
        return;
      }
      if (legal.current) {
        window.location.replace("/chat");
        return;
      }
      setIsUpdate(legal.hasPrior);
      setPhase("modal");
    })();
  }, [router]);

  /**
   * `busy` se levanta ANTES del primer await y solo se baja en los caminos que
   * dejan al usuario en esta pantalla.
   *
   * El patrón anterior lo levantaba después de `getSession()` y lo bajaba en un
   * `finally` que corría justo después de `window.location.replace()`. Como esa
   * navegación se inicia pero no termina de inmediato, el botón volvía a quedar
   * habilitado mientras la página seguía visible, y un segundo toque lanzaba un
   * POST que la navegación mataba a medio vuelo. Safari reporta eso como
   * `TypeError: Load failed`, que es el error que llegó a Sentry el 2026-08-28.
   *
   * En los caminos que navegan, `busy` se queda arriba a propósito: la pantalla
   * está por desaparecer y rehabilitar el botón solo abre esa ventana de doble
   * envío.
   *
   * El `catch` no es decorativo: `onAccept` descarta la promesa con `void`, así
   * que sin él un fallo real de red se convierte en un rechazo no manejado en vez
   * de en un mensaje para el usuario.
   */
  const handleAccept = useCallback(async () => {
    setErr(null);
    if (!isSupabaseBrowserConfigured()) return;
    setBusy(true);
    try {
      const sb = getSupabaseBrowser();
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session?.access_token) {
        router.replace("/login");
        return; // navegando: `busy` sigue arriba
      }
      const consent = createLegalConsentPayload("post_login");
      const res = await fetch("/api/auth/legal-consent", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consent),
      });
      if (!res.ok) {
        setErr(L.errNetwork);
        setBusy(false); // el usuario se queda aquí y puede reintentar
        return;
      }
      try {
        sessionStorage.removeItem(LEGAL_CONSENT_PENDING_STORAGE_KEY);
      } catch {
        // ignore
      }
      window.location.replace("/chat");
      // `busy` se queda arriba: la página se va.
    } catch {
      setErr(L.errNetwork);
      setBusy(false);
    }
  }, [L.errNetwork, router]);

  const handleCancel = useCallback(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }
    void getSupabaseBrowser()
      .auth.signOut()
      .finally(() => {
        router.replace("/login");
      });
  }, [router]);

  if (phase === "checking") {
    return (
      <div className="auth-callback-wrap">
        <p>{mCallback.verifying}</p>
      </div>
    );
  }

  return (
    <div className="auth-pro-shell" style={{ minHeight: "100dvh", placeItems: "center", display: "grid" }}>
      {err ? (
        <p className="auth-pro-err" style={{ maxWidth: "28rem", textAlign: "center", marginBottom: 12 }}>
          {err}
        </p>
      ) : null}
      <LegalConsentModal
        login={L}
        nav={nav}
        privacy={privacy}
        terms={terms}
        busy={busy}
        title={isUpdate ? L.legalConsentUpdateTitle : L.legalConsentReviewTitle}
        intro={isUpdate ? L.legalConsentUpdateIntro : L.legalConsentReviewIntro}
        onAccept={() => void handleAccept()}
        onCancel={handleCancel}
      />
    </div>
  );
}
