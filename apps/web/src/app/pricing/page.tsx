"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { ensureRevenueCatUserAligned } from "@/components/RevenueCatSupabaseSync";
import { useEffect } from "react";

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
  useEffect(() => {
    const baseUrl = resolveBasePlansUrl(process.env.NEXT_PUBLIC_PLANS_URL ?? "");
    if (!baseUrl) {
      window.location.replace(FALLBACK_PATH);
      return;
    }

    const target = new URL(baseUrl, window.location.origin);

    const redirectToCheckout = async () => {
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
      window.location.replace(target.toString());
    };

    void redirectToCheckout().catch(() => {
      window.location.replace(target.toString());
    });
  }, []);

  return null;
}
