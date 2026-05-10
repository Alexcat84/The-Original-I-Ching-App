import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getDocNavUiMessages,
  getLibraryPageUiMessages,
  type LibraryPageUiSerialized,
} from "@iching-oracle/i18n";
import { HexagramTabs, type ResolvedLineLabels } from "@/components/library/HexagramTabs";
import { resolveDocLocale } from "@/lib/doc-locale";
import { getLibraryDetail, getLibrarySummaries } from "@/lib/library/library-data";
import { formatTrigramLabel, getTrigramById } from "@/lib/library/trigram-meta";

interface DetailPageProps {
  params: Promise<{ number: string }>;
}

function parseHexagramNumber(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 1 || n > 64) return null;
  return n;
}

export function generateStaticParams(): Array<{ number: string }> {
  return getLibrarySummaries().map((s) => ({ number: String(s.number) }));
}

export async function generateMetadata(
  { params }: DetailPageProps,
): Promise<Metadata> {
  const { number } = await params;
  const n = parseHexagramNumber(number);
  const locale = await resolveDocLocale();
  const messages = getLibraryPageUiMessages(locale);

  if (n === null) {
    return { title: messages.notFound };
  }
  const detail = getLibraryDetail(n);
  if (!detail) {
    return { title: messages.notFound };
  }
  const label = `${detail.summary.number}. ${detail.summary.chineseName} · ${detail.summary.pinyin}`;
  return {
    title: messages.detailMetaTitle(label),
    description: `${label} — ${messages.metaDescription}`,
  };
}

export default async function LibraryDetailPage({ params }: DetailPageProps) {
  const { number } = await params;
  const n = parseHexagramNumber(number);
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const messages = getLibraryPageUiMessages(locale);

  if (n === null) {
    notFound();
  }
  const detail = getLibraryDetail(n);
  if (!detail) {
    notFound();
  }

  const { summary, records, mutations, sources } = detail;
  const upperMeta = getTrigramById(summary.upperTrigram);
  const lowerMeta = getTrigramById(summary.lowerTrigram);

  // Pre-resolve function fields for the client component boundary.
  const lineLabels: ResolvedLineLabels = {
    line1: messages.lineLabel(1),
    line2: messages.lineLabel(2),
    line3: messages.lineLabel(3),
    line4: messages.lineLabel(4),
    line5: messages.lineLabel(5),
    line6: messages.lineLabel(6),
  };

  // Build serializable mutation labels (already plain strings from the server).
  const resolvedMutations = mutations.map((m) => ({
    ...m,
    label: messages.mutationLine(m.fromNumber, m.toNumber, m.position),
  }));

  const serializable: LibraryPageUiSerialized = {
    ...messages,
    resultsCount: "",
    lineLabel: "",
    mutationLine: "",
    detailMetaTitle: "",
  };

  return (
    <div className="oracle-shell doc-page library-page library-detail">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> ·{" "}
        <Link href="/library">{messages.detailCrumb}</Link>
      </nav>

      <article className="doc-article">
        <p className="library-breadcrumb">
          <Link href="/library">{messages.detailCrumb}</Link>
          <span aria-hidden="true"> / </span>
          <span>
            {summary.number}. {summary.chineseName} · {summary.pinyin}
          </span>
        </p>

        <header className="library-detail-header">
          <span className="library-detail-glyph" aria-hidden="true">
            {summary.glyph}
          </span>
          <div className="library-detail-titles">
            <p className="library-detail-number">{summary.number}</p>
            <h1 lang="zh-Hant" className="library-detail-chinese">
              {summary.chineseName}
            </h1>
            <p className="library-detail-pinyin">{summary.pinyin}</p>
            <p className="library-detail-english">{summary.englishName}</p>
            <dl className="library-detail-trigrams">
              <div>
                <dt>{messages.filterUpperLabel}</dt>
                <dd>{formatTrigramLabel(upperMeta)}</dd>
              </div>
              <div>
                <dt>{messages.filterLowerLabel}</dt>
                <dd>{formatTrigramLabel(lowerMeta)}</dd>
              </div>
            </dl>
          </div>
        </header>

        <h2 className="library-translations-heading">{messages.translationsHeading}</h2>
        <HexagramTabs records={records} sources={sources} messages={serializable} lineLabels={lineLabels} />

        <section className="library-mutations">
          <h2>{messages.mutationsHeading}</h2>
          <p className="library-mutations-intro">{messages.mutationsIntro}</p>
          <ul className="library-mutations-list">
            {resolvedMutations.map((m) => (
              <li key={m.position} className="library-mutation">
                <Link href={`/library/${m.toNumber}`} className="library-mutation__link">
                  <span className="library-mutation__glyph" aria-hidden="true">
                    {m.toGlyph}
                  </span>
                  <span className="library-mutation__body">
                    <span className="library-mutation__line">
                      {m.label}
                    </span>
                    <span className="library-mutation__name" lang="zh-Hant">
                      {m.toNumber}. {m.toChineseName} · {m.toPinyin}
                    </span>
                    <span className="library-mutation__english">{m.toEnglishName}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}
