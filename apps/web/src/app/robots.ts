import type { MetadataRoute } from "next";

const BASE_URL = "https://theoriginaliching.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/guia", "/pricing", "/faqs", "/notes", "/audits", "/mutation-explorer", "/about", "/terms", "/privacy", "/feedback"],
      // /chat is the app surface (formerly served at "/") — marketing pages own search presence.
      disallow: ["/api/", "/admin", "/login", "/chat", "/library", "/quickstart", "/documentacion", "/delete-account"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
