import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
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

export default nextConfig;
