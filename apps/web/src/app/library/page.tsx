import type { Metadata } from "next";
import Link from "next/link";

import { getDocNavUiMessages, getLibraryPageUiMessages } from "@iching-oracle/i18n";
import { LibraryIndex } from "@/components/library/LibraryIndex";
import { resolveDocLocale } from "@/lib/doc-locale";
import { getLibrarySummaries } from "@/lib/library/library-data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveDocLocale();
  const messages = getLibraryPageUiMessages(locale);
  const title = `${messages.title} | The Original I Ching App`;
  return {
    title,
    description: messages.metaDescription,
    openGraph: {
      title,
      description: messages.metaDescription,
    },
  };
}

export default async function LibraryIndexPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const messages = getLibraryPageUiMessages(locale);
  const summaries = getLibrarySummaries();

  return (
    <div className="oracle-shell doc-page library-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/notes">{nav.methodNotes}</Link> · <Link href="/faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/about">{nav.aboutShort}</Link> · <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{messages.title}</h1>
        <p className="doc-lead">{messages.subtitle}</p>
        <LibraryIndex summaries={summaries} messages={messages} />
      </article>
    </div>
  );
}
