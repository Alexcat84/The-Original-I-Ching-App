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
    void sb.auth.getSession().then(() => {
      router.replace("/");
    });
  }, [router]);

  return (
    <div className="auth-callback-wrap">
      <p>Finalizando sesión…</p>
    </div>
  );
}
