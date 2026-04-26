import { NextRequest, NextResponse } from "next/server";

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
    // 'unsafe-inline' kept during Etapa 1-2 while nonce wiring is validated.
    // Removed in Etapa 3 once layout nonce propagation is confirmed.
    `script-src 'self' 'unsafe-inline' 'nonce-${nonce}' https://challenges.cloudflare.com https://js.stripe.com https://vercel.live`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' data: https://*.supabase.co https://*.supabase.in https://api.revenuecat.com https://*.revenuecat.com https://*.revenue.cat https://challenges.cloudflare.com",
    "frame-src https://challenges.cloudflare.com https://js.stripe.com https://vercel.live",
    "worker-src 'self'",
  ].join("; ");
}

export function middleware(req: NextRequest) {
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
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|fonts/).*)" ],
};
