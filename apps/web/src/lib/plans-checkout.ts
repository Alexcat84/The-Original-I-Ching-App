import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { ensureRevenueCatUserAligned } from "@/components/RevenueCatSupabaseSync";

/**
 * Resolves NEXT_PUBLIC_PLANS_URL to an external checkout URL.
 * Returns null if unset, invalid, or if it points only to /pricing (no external checkout).
 */
export function resolveBasePlansUrl(raw: string): string | null {
  const plansUrl = raw.trim();
  if (!plansUrl) return null;

  // Reject known internal-only paths (relative form).
  // /checkout/* are return URLs from RevenueCat, not the checkout entry point.
  if (
    plansUrl === "/pricing" ||
    plansUrl === "pricing" ||
    plansUrl.startsWith("/pricing?") ||
    plansUrl.startsWith("/checkout")
  ) {
    return null;
  }

  try {
    const parsed = new URL(plansUrl);
    const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    if (pathname === "/pricing" || pathname.startsWith("/checkout")) {
      return null;
    }
    return parsed.toString();
  } catch {
    // Relative path not blocked by string checks above — return as-is for buildPlansCheckoutUrl to validate.
    return plansUrl;
  }
}

export type BuildPlansCheckoutUrlOptions = {
  /** Known Supabase user id (e.g. React state) — combined with getSession to avoid races. */
  appUserId?: string | null;
  /** User email — passed as ?email= query param so RC pre-fills the checkout form. */
  email?: string | null;
  /** If true, fail when no user id can be resolved (authenticated CTAs must pass app_user_id). */
  requireAppUserId?: boolean;
  /**
   * RevenueCat package identifier — passed as ?package_id= so the hosted Web
   * Purchase Link skips pack selection and lands on that pack's checkout.
   * Unknown ids degrade gracefully: RC shows the normal pack selection page.
   * @see https://www.revenuecat.com/docs/web/web-billing/web-purchase-links
   */
  packageId?: string | null;
};

export type BuildPlansCheckoutUrlResult =
  | { ok: true; url: string }
  | { ok: false; code: "not_configured" | "build_failed" | "missing_app_user_id" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_PATH_RE = /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/i;

/**
 * Builds the RevenueCat Web Billing checkout URL.
 *
 * RC Web Billing identifies the customer via the app_user_id in the URL **path**:
 *   https://pay.rev.cat/{billing-token}/{appUserId}?email=user@example.com
 *
 * Passing the UUID only as a query parameter (?app_user_id=...) is ignored by RC's hosted
 * checkout and results in anonymous purchases. The UUID must be the last path segment.
 *
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

    // Strip any UUID that was accidentally embedded as a path segment in the env var
    // (NEXT_PUBLIC_PLANS_URL should be the base billing URL without a user ID).
    if (UUID_PATH_RE.test(target.pathname)) {
      target.pathname = target.pathname.replace(UUID_PATH_RE, "/");
    }

    let appUserId: string | undefined = options?.appUserId?.trim() || undefined;
    let email: string | undefined = options?.email?.trim() || undefined;

    if (isSupabaseBrowserConfigured()) {
      const sb = getSupabaseBrowser();
      const alignAndReadSession = async () => {
        const { data } = await sb.auth.getSession();
        await ensureRevenueCatUserAligned(data.session ?? null);
        return data.session;
      };

      if (appUserId) {
        const session = await alignAndReadSession();
        if (!email) email = session?.user?.email?.trim() || undefined;
      } else {
        const deadline = Date.now() + 2500;
        while (Date.now() < deadline) {
          const session = await alignAndReadSession();
          const id = session?.user?.id?.trim();
          if (id) {
            appUserId = id;
            if (!email) email = session?.user?.email?.trim() || undefined;
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
      // UUID goes in the path — RC Web Billing uses this to identify the customer.
      // Query params like ?app_user_id= are not used by the hosted checkout for attribution.
      const cleanPath = target.pathname.replace(/\/+$/, "");
      if (UUID_RE.test(appUserId)) {
        target.pathname = cleanPath + "/" + appUserId;
      }
    }

    if (email) {
      target.searchParams.set("email", email);
    }

    const packageId = options?.packageId?.trim();
    if (packageId) {
      target.searchParams.set("package_id", packageId);
    }

    const pathOnly = target.pathname.replace(/\/+$/, "") || "/";
    const isSameOrigin = target.origin === window.location.origin;
    // Block same-origin homepage and any internal path that is a return URL, not a checkout entry.
    if (isSameOrigin && (pathOnly === "/" || pathOnly === "/pricing" || pathOnly.startsWith("/checkout"))) {
      console.warn(
        "[plans-checkout] NEXT_PUBLIC_PLANS_URL resolves to an internal page. It must be the full external checkout URL (e.g. https://pay.rev.cat/...).",
      );
      return { ok: false, code: "not_configured" };
    }
    return { ok: true, url: target.toString() };
  } catch {
    return { ok: false, code: "build_failed" };
  }
}
