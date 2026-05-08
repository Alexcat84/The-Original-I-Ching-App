import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQs | The Original I Ching App",
  description: "Frequently asked questions about The Original I Ching App: tokens, readings, payments, privacy, and technical support.",
  openGraph: {
    title: "FAQs | The Original I Ching App",
    description: "Answers to common questions about the I Ching oracle app.",
  },
};
import { getDocNavUiMessages, getFaqPageUiMessages } from "@iching-oracle/i18n";
import { FaqAccordion } from "@/components/FaqAccordion";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function FaqsPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const faq = getFaqPageUiMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/notes">{nav.methodNotes}</Link> · <Link href="/about">{nav.aboutShort}</Link> ·{" "}
        <Link href="/privacy">{nav.privacyShort}</Link> · <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{faq.title}</h1>
        <p className="doc-lead">{faq.intro}</p>
        <FaqAccordion locale={locale} nav={nav} />
      </article>
    </div>
  );
}
