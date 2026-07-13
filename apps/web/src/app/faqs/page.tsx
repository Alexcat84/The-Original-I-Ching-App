import type { Metadata } from "next";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";

export const metadata: Metadata = {
  title: "FAQs | The Original I Ching App",
  description: "Frequently asked questions about The Original I Ching App: tokens, readings, payments, privacy, and technical support.",
  openGraph: {
    title: "FAQs | The Original I Ching App",
    description: "Answers to common questions about the I Ching oracle app.",
  },
  ...buildCanonicalMetadata("/faqs"),
};
import { getDocNavUiMessages, getFaqPageUiMessages } from "@iching-oracle/i18n";
import { FaqAccordion } from "@/components/FaqAccordion";
import { MarketingDocShell } from "@/components/marketing/MarketingDocShell";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function FaqsPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const faq = getFaqPageUiMessages(locale);

  return (
    <MarketingDocShell active="faqs">
      <div className="oracle-shell doc-page">
        <article className="doc-article">
          <h1>{faq.title}</h1>
          <p className="doc-lead">{faq.intro}</p>
          <FaqAccordion locale={locale} nav={nav} />
        </article>
      </div>
    </MarketingDocShell>
  );
}
