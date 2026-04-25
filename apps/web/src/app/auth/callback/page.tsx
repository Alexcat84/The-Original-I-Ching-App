"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { useAppLocale } from "@/lib/use-app-locale";
import {
  isCurrentLegalConsentPayload,
  LEGAL_CONSENT_PENDING_STORAGE_KEY,
  PENDING_EMAIL_LEGAL_METADATA_KEY,
} from "@/lib/legal-consent";
import { getAuthCallbackUiMessages } from "@iching-oracle/i18n";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const locale = useAppLocale();
  const m = useMemo(() => getAuthCallbackUiMessages(locale), [locale]);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }
    const sb = getSupabaseBrowser();
    void (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          const { error } = await sb.auth.exchangeCodeForSession(code);
          if (error) {
            console.warn("[auth/callback] exchangeCodeForSession:", error.message);
          }
        }
        const {
          data: { session },
        } = await sb.auth.getSession();
        const rawConsent = sessionStorage.getItem(LEGAL_CONSENT_PENDING_STORAGE_KEY);
        if (session?.access_token && rawConsent) {
          try {
            const consent = JSON.parse(rawConsent) as unknown;
            if (isCurrentLegalConsentPayload(consent) && consent.source === "google_oauth") {
              const res = await fetch("/api/auth/legal-consent", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(consent),
              });
              if (res.ok) {
                sessionStorage.removeItem(LEGAL_CONSENT_PENDING_STORAGE_KEY);
              }
            }
          } catch (error) {
            console.warn("[auth/callback] legal consent sync failed:", error);
          }
        }

        const pendingMeta = session?.user?.user_metadata?.[PENDING_EMAIL_LEGAL_METADATA_KEY];
        if (session?.access_token && typeof pendingMeta === "string") {
          try {
            const consent = JSON.parse(pendingMeta) as unknown;
            if (isCurrentLegalConsentPayload(consent) && consent.source === "email_signup") {
              const res = await fetch("/api/auth/legal-consent", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(consent),
              });
              if (!res.ok) {
                console.warn("[auth/callback] email signup legal consent:", await res.text());
              }
            }
          } catch (error) {
            console.warn("[auth/callback] email signup legal consent parse failed:", error);
          }
        }
      } finally {
        router.replace("/");
      }
    })();
  }, [router]);

  return (
    <div className="auth-callback-wrap">
      <p>{m.verifying}</p>
    </div>
  );
}
