"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { useAppLocale } from "@/lib/use-app-locale";
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
        await sb.auth.getSession();
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
