import type { MetadataRoute } from "next";

const BASE_URL = "https://theoriginaliching.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/guia", "/pricing", "/faqs", "/notes", "/about", "/terms", "/privacy"],
      disallow: ["/api/", "/admin", "/login", "/library", "/quickstart", "/documentacion"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
