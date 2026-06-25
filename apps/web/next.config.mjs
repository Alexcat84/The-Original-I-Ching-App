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
  // Monorepo root for serverless file tracing (single lockfile at repo root).
  outputFileTracingRoot: path.join(__dirname, "../.."),
  serverExternalPackages: ["sharp", "@resvg/resvg-js"],
  outputFileTracingIncludes: {
    "/api/**": [
      "./fonts/**",
      "../../node_modules/@fontsource/noto-serif-tc/files/noto-serif-tc-chinese-traditional-700-normal.woff",
      "../../node_modules/@fontsource/noto-serif/files/noto-serif-latin-ext-400-normal.woff",
      "../../node_modules/@fontsource/noto-sans-symbols-2/files/noto-sans-symbols-2-symbols-400-normal.woff",
    ],
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
  async redirects() {
    return [
      {
        source: "/quickstart",
        destination: "/guia",
        permanent: true,
      },
    ];
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
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Suppress all build output when no auth token (avoids "no auth token" noise on preview deploys)
  silent: !process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: Boolean(process.env.SENTRY_AUTH_TOKEN),
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: false,
  },
}));
