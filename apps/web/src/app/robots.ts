import type { MetadataRoute } from "next";

const BASE_URL = "https://theoriginaliching.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/guia", "/pricing", "/library", "/faqs", "/notes", "/about", "/terms", "/privacy"],
      disallow: ["/api/", "/admin", "/login", "/quickstart", "/documentacion"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
