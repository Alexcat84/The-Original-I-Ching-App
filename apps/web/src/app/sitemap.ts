import type { MetadataRoute } from "next";

const defaultHost = process.env.NEXT_PUBLIC_APP_URL ?? "https://theoriginaliching.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = defaultHost.replace(/\/$/, "");
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/guia`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faqs`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.55 },
    {
      url: `${base}/documentacion/iching`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
