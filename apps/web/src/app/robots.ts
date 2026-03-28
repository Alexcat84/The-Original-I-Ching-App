import type { MetadataRoute } from "next";

const defaultHost = process.env.NEXT_PUBLIC_APP_URL ?? "https://theoriginaliching.com";

export default function robots(): MetadataRoute.Robots {
  const base = defaultHost.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/guia", "/documentacion/"],
      disallow: ["/api/", "/admin", "/login"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
