import type { Metadata } from "next";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";

export const metadata: Metadata = {
  title: "Token Packs & Pricing | The Original I Ching App",
  description:
    "Choose a token pack for I Ching AI oracle readings. Pay once, keep your tokens. No subscriptions.",
  openGraph: {
    title: "Token Packs & Pricing | The Original I Ching App",
    description: "Pay once, keep your tokens. No subscriptions.",
  },
  ...buildCanonicalMetadata("/pricing"),
};

export default async function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
