"use client";

import { Purchases } from "@revenuecat/purchases-js";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";

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
  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) return;

    const sb = getSupabaseBrowser();

    void sb.auth.getSession().then(({ data: { session } }) => {
      syncRevenueCatWithSupabaseSession(session);
    });

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      syncRevenueCatWithSupabaseSession(session);
      // SIGNED_IN is handled by the bootstrap effect in page.tsx — firing
      // iching:account-refresh here would add a duplicate /api/account/me call
      // (4 more PostgREST queries) on top of the bootstrap, saturating pool=10.
      // Keep the refresh for TOKEN_REFRESHED (post-purchase) and other events.
      if (event !== "SIGNED_IN") {
        window.dispatchEvent(new Event("iching:account-refresh"));
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}
