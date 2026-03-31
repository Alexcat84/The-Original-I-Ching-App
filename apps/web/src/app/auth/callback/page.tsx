"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();

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
      <p>Verificando acceso… si venís de correo, estamos finalizando la confirmación o el restablecimiento.</p>
    </div>
  );
}
