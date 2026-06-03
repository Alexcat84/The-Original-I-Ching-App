import { NextRequest, NextResponse } from "next/server";
import { withAxiom } from "next-axiom";
import { rateLimitByKey } from "@/lib/rate-limit";

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // 'unsafe-eval' is required by Cloudflare Turnstile — the challenge JS uses dynamic code
    // execution internally. See https://developers.cloudflare.com/turnstile/reference/csp/
    //
    // Known third-party DevTools noise (not actionable from our code):
    //   1. "CSP blocks eval" on /login — the violation originates inside the Turnstile cross-origin
    //      iframe (challenges.cloudflare.com), which runs under Cloudflare's own CSP headers, not
    //      ours. DevTools surfaces it in the parent page's Issues panel — misleading but harmless.
    //   2. TrustedHTML / TrustedScript violations on the Turnstile iframe — Cloudflare's widget
    //      uses innerHTML and dynamic script injection internally. These are closed-source and
    //      uncontrollable from our side; Cloudflare acknowledges them as expected behavior.
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://challenges.cloudflare.com https://js.stripe.com https://vercel.live`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' data: https://*.supabase.co https://*.supabase.in https://api.revenuecat.com https://*.revenuecat.com https://*.revenue.cat https://challenges.cloudflare.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
    "frame-src https://challenges.cloudflare.com https://js.stripe.com https://vercel.live",
    "worker-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

export const middleware = withAxiom(async function middlewareFn(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate-limit only the authenticated data endpoint /api/library/*.
  // /library/* page renders are NOT rate-limited — they now return only public
  // metadata (no translations), so there is nothing premium to protect at the
  // page level. The actual premium content (translations) is gated by Bearer
  // auth + Seeker+ check inside /api/library/[number].
  //
  // Limit: 120 requests per 10 minutes per IP (~12/min).
  // A user browsing all 64 hexagrams makes 64 API calls. This allows normal
  // browsing of the full library while still blocking rapid automated scraping.
  if (pathname.startsWith("/api/library")) {
    const ip =
      req.headers.get("x-vercel-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "unknown";
    const rl = await rateLimitByKey({
      key: `library_api:${ip}`,
      limit: 120,
      windowSeconds: 600,
    });
    if (!rl.ok) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "600" },
      });
    }
  }

  const nonce = generateNonce();

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-nonce", nonce);

  // [SUPABASE SLOT] When Supabase SSR session refresh is needed:
  // const supabaseRes = await applySupabaseSession(req, reqHeaders);
  // if (supabaseRes) {
  //   supabaseRes.headers.set("content-security-policy", buildCsp(nonce));
  //   return supabaseRes;
  // }

  const res = NextResponse.next({ request: { headers: reqHeaders } });
  res.headers.set("content-security-policy", buildCsp(nonce));
  return res;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|fonts/).*)" ],
};
