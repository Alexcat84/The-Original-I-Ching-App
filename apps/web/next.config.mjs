/** @type {import('next').NextConfig} */
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
};

export default nextConfig;
