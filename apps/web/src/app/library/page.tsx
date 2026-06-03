import type { Metadata } from "next";
import Link from "next/link";

import { getDocNavUiMessages, getLibraryPageUiMessages, type LibraryPageUiSerialized } from "@iching-oracle/i18n";
import { LibraryIndex } from "@/components/library/LibraryIndex";
import { LibraryAccessGate } from "@/components/library/LibraryAccessGate";
import { resolveDocLocale } from "@/lib/doc-locale";
import { getLibrarySummaries } from "@/lib/library/library-data";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";

export const dynamic = "force-dynamic";

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
    ...buildCanonicalMetadata("/library"),
  };
}

export default async function LibraryIndexPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const messages = getLibraryPageUiMessages(locale);
  const summaries = getLibrarySummaries();
  // RSC risk (accepted): summaries are in the RSC payload and accessible before
  // LibraryAccessGate redirects. Content: hexagram numbers, names, glyphs, pinyin —
  // public-domain metadata with no premium translations. Gate is UX + redirect only.

  // Pre-resolve function fields so the client component only receives
  // JSON-serializable strings (Next.js RSC boundary constraint).
  const resultsCountInitial = messages.resultsCount(summaries.length);
  // Derive a template: "64 hexagrams" → "{count} hexagrams"
  const resultsCountTemplate = resultsCountInitial.replace(/\d+/, "{count}");

  const serializable: LibraryPageUiSerialized = {
    ...messages,
    resultsCount: resultsCountTemplate,
    lineLabel: "",
    mutationLine: "",
    detailMetaTitle: "",
  };

  return (
    <div className="oracle-shell doc-page library-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link>
      </nav>
      <LibraryAccessGate>
        <article className="doc-article">
          <h1>{messages.title}</h1>
          <p className="doc-lead">{messages.subtitle}</p>
          <LibraryIndex summaries={summaries} messages={serializable} />
        </article>
      </LibraryAccessGate>
    </div>
  );
}
