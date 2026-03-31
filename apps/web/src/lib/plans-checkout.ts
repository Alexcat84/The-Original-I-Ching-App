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

export type BuildPlansCheckoutUrlResult =
  | { ok: true; url: string }
  | { ok: false; code: "not_configured" | "build_failed" };

/**
 * Builds the full checkout URL with RevenueCat app user id when Supabase session exists.
 * Call only from the browser (client components).
 */
export async function buildPlansCheckoutUrl(plansUrlEnv: string | undefined): Promise<BuildPlansCheckoutUrlResult> {
  const base = resolveBasePlansUrl((plansUrlEnv ?? "").trim());
  if (!base) {
    return { ok: false, code: "not_configured" };
  }
  if (typeof window === "undefined") {
    return { ok: false, code: "build_failed" };
  }

  try {
    const target = new URL(base, window.location.origin);
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
    return { ok: true, url: target.toString() };
  } catch {
    return { ok: false, code: "build_failed" };
  }
}
