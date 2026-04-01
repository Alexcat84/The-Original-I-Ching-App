"use client";

import { Purchases } from "@revenuecat/purchases-js";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";

const BILLING_PULL_DEBOUNCE_MS = 900;

const revenueCatWebApiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY?.trim() ?? "";

/**
 * Keeps RevenueCat Web Billing `app_user_id` aligned with Supabase Auth:
 * logged-in users use `session.user.id` (UUID).
 * This app does not allow anonymous checkout, so we intentionally avoid generating anonymous RC ids.
 * Returns whether Purchases app_user_id now matches current Supabase user.
 */
export async function ensureRevenueCatUserAligned(session: Session | null): Promise<boolean> {
  if (typeof window === "undefined" || !revenueCatWebApiKey) return false;
  const supabaseUserId = session?.user?.id ?? null;
  if (!supabaseUserId) return false;

  try {
    if (!Purchases.isConfigured()) {
      Purchases.configure({ apiKey: revenueCatWebApiKey, appUserId: supabaseUserId });
      return Purchases.getSharedInstance().getAppUserId() === supabaseUserId;
    }

    const purchases = Purchases.getSharedInstance();

    if (purchases.getAppUserId() === supabaseUserId) return true;
    if (purchases.isAnonymous()) {
      try {
        await purchases.identifyUser(supabaseUserId);
      } catch {
        return false;
      }
    } else {
      try {
        await purchases.changeUser(supabaseUserId);
      } catch {
        return false;
      }
    }
    return purchases.getAppUserId() === supabaseUserId;
  } catch {
    // Do not break auth or the rest of the app
    return false;
  }
}

export function syncRevenueCatWithSupabaseSession(session: Session | null): void {
  void ensureRevenueCatUserAligned(session);
}

/** Mount once (e.g. in root layout) to sync RevenueCat on every Supabase auth change. */
export default function RevenueCatSupabaseSync() {
  const pullTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) return;

    const sb = getSupabaseBrowser();

    function scheduleBillingPullFromRest(session: Session | null) {
      if (pullTimerRef.current) {
        clearTimeout(pullTimerRef.current);
        pullTimerRef.current = null;
      }
      const uid = session?.user?.id;
      const token = session?.access_token;
      if (!uid || !token) return;

      pullTimerRef.current = setTimeout(() => {
        pullTimerRef.current = null;
        void fetch("/api/account/sync-billing", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (res.ok) {
              window.dispatchEvent(new Event("iching:account-refresh"));
            }
          })
          .catch(() => {
            // Non-fatal (e.g. REVENUECAT_SECRET_KEY not set yet)
          });
      }, BILLING_PULL_DEBOUNCE_MS);
    }

    void sb.auth.getSession().then(({ data: { session } }) => {
      syncRevenueCatWithSupabaseSession(session);
      scheduleBillingPullFromRest(session);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      syncRevenueCatWithSupabaseSession(session);
      scheduleBillingPullFromRest(session);
    });

    return () => {
      if (pullTimerRef.current) clearTimeout(pullTimerRef.current);
      sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}
