import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";
import { withAxiom } from "next-axiom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  // CSP is set dynamically per-request in src/middleware.ts (nonce-based).
  // Do not add a static CSP here — next.config.js headers() run after middleware
  // and would overwrite the nonce header, defeating the purpose.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["sharp", "@resvg/resvg-js"],
  outputFileTracingIncludes: {
    "/api/**": ["./fonts/**"],
  },
  transpilePackages: [
    "@iching-oracle/iching-data",
    "@iching-oracle/iching-engine",
    "@iching-oracle/context-engine",
    "@iching-oracle/image-engine",
    "@iching-oracle/i18n",
    "@iching-oracle/sharing",
    "@iching-oracle/ui",
    "@iching-oracle/claude",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "**.supabase.in", pathname: "/**" },
      { protocol: "https", hostname: "fal.media", pathname: "/**" },
      { protocol: "https", hostname: "**.fal.media", pathname: "/**" },
      { protocol: "https", hostname: "api.together.xyz", pathname: "/**" },
      { protocol: "https", hostname: "pollinations.ai", pathname: "/**" },
      { protocol: "https", hostname: "image.pollinations.ai", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config, { webpack: webpackMod }) => {
    const skip =
      process.env.SKIP_GOOGLE_FONTS === "1" || process.env.SKIP_GOOGLE_FONTS === "true";
    if (skip) {
      const stub = path.join(__dirname, "src", "lib", "google-fonts-root.ci.ts");
      config.plugins.push(
        new webpackMod.NormalModuleReplacementPlugin(/google-fonts-root\.ts$/, stub),
      );
    }
    return config;
  },
};

export default withAxiom(withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: false,
}));
