import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { ensureRevenueCatUserAligned } from "@/components/RevenueCatSupabaseSync";

/**
 * Resolves NEXT_PUBLIC_PLANS_URL to an external checkout URL.
 * Returns null if unset, invalid, or if it points only to /pricing (no external checkout).
 */
export function resolveBasePlansUrl(raw: string): string | null {
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

export type BuildPlansCheckoutUrlOptions = {
  /** Known Supabase user id (e.g. React state) — combined with getSession to avoid races. */
  appUserId?: string | null;
  /** If true, fail when no user id can be resolved (authenticated CTAs must pass app_user_id). */
  requireAppUserId?: boolean;
};

export type BuildPlansCheckoutUrlResult =
  | { ok: true; url: string }
  | { ok: false; code: "not_configured" | "build_failed" | "missing_app_user_id" };

/**
 * Builds the checkout URL: base from `NEXT_PUBLIC_PLANS_URL` plus `app_user_id` (and `rc_app_user_id`)
 * when a Supabase session / optional explicit id is available.
 * Call only from the browser (client components).
 */
export async function buildPlansCheckoutUrl(
  plansUrlEnv: string | undefined,
  options?: BuildPlansCheckoutUrlOptions,
): Promise<BuildPlansCheckoutUrlResult> {
  const base = resolveBasePlansUrl((plansUrlEnv ?? "").trim());
  if (!base) {
    return { ok: false, code: "not_configured" };
  }
  if (typeof window === "undefined") {
    return { ok: false, code: "build_failed" };
  }

  try {
    const target = new URL(base, window.location.origin);
    let appUserId: string | undefined = options?.appUserId?.trim() || undefined;

    if (isSupabaseBrowserConfigured()) {
      const sb = getSupabaseBrowser();
      const alignAndReadId = async (): Promise<string | undefined> => {
        const { data } = await sb.auth.getSession();
        await ensureRevenueCatUserAligned(data.session ?? null);
        return data.session?.user?.id?.trim();
      };

      if (appUserId) {
        await alignAndReadId();
      } else {
        const deadline = Date.now() + 2500;
        while (Date.now() < deadline) {
          const id = await alignAndReadId();
          if (id) {
            appUserId = id;
            break;
          }
          await new Promise((r) => setTimeout(r, 120));
        }
      }
    }

    if (options?.requireAppUserId && !appUserId) {
      return { ok: false, code: "missing_app_user_id" };
    }

    if (appUserId) {
      target.searchParams.set("app_user_id", appUserId);
      target.searchParams.set("rc_app_user_id", appUserId);
    }
    const pathOnly = target.pathname.replace(/\/+$/, "") || "/";
    if (target.origin === window.location.origin && pathOnly === "/") {
      console.warn(
        "[plans-checkout] NEXT_PUBLIC_PLANS_URL must be the full external checkout URL, not this app’s homepage.",
      );
      return { ok: false, code: "not_configured" };
    }
    return { ok: true, url: target.toString() };
  } catch {
    return { ok: false, code: "build_failed" };
  }
}
