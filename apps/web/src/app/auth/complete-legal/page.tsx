"use client";

import { LegalConsentModal } from "@/components/LegalConsentModal";
import { createLegalConsentPayload, LEGAL_CONSENT_PENDING_STORAGE_KEY } from "@/lib/legal-consent";
import { fetchLegalAcceptanceCurrent } from "@/lib/post-auth-legal";
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
      const legal = await fetchLegalAcceptanceCurrent(session.access_token);
      if (legal === null) {
        router.replace("/login");
        return;
      }
      if (legal) {
        router.replace("/");
        return;
      }
      setPhase("modal");
    })();
  }, [router]);

  const handleAccept = useCallback(async () => {
    setErr(null);
    if (!isSupabaseBrowserConfigured()) return;
    const sb = getSupabaseBrowser();
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (!session?.access_token) {
      router.replace("/login");
      return;
    }
    const consent = createLegalConsentPayload("post_login");
    setBusy(true);
    try {
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
        return;
      }
      try {
        sessionStorage.removeItem(LEGAL_CONSENT_PENDING_STORAGE_KEY);
      } catch {
        // ignore
      }
      router.replace("/");
    } finally {
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
        onAccept={() => void handleAccept()}
        onCancel={handleCancel}
      />
    </div>
  );
}
