import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getDocNavUiMessages,
  getLibraryPageUiMessages,
  type LibraryPageUiSerialized,
} from "@iching-oracle/i18n";
import { LibraryContentLoader } from "@/components/library/LibraryContentLoader";
import { resolveDocLocale } from "@/lib/doc-locale";
import { getLibraryDetail } from "@/lib/library/library-data";
import { formatTrigramLabel, getTrigramById } from "@/lib/library/trigram-meta";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";
import type { ResolvedLineLabels } from "@/components/library/HexagramTabs";

// Dynamic — no CDN caching, no pre-generation of premium content.
export const dynamic = "force-dynamic";

interface DetailPageProps {
  params: Promise<{ number: string }>;
}

function parseHexagramNumber(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 1 || n > 64) return null;
  return n;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { number } = await params;
  const n = parseHexagramNumber(number);
  const locale = await resolveDocLocale();
  const messages = getLibraryPageUiMessages(locale);

  if (n === null) return { title: messages.notFound };
  const detail = getLibraryDetail(n);
  if (!detail) return { title: messages.notFound };

  const label = `${detail.summary.number}. ${detail.summary.chineseName} · ${detail.summary.pinyin}`;
  return {
    title: messages.detailMetaTitle(label),
    description: `${label} — ${messages.metaDescription}`,
    robots: { index: false, follow: false },
    ...buildCanonicalMetadata(`/library/${n}`),
  };
}

export default async function LibraryDetailPage({ params }: DetailPageProps) {
  const { number } = await params;
  const n = parseHexagramNumber(number);
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const messages = getLibraryPageUiMessages(locale);

  if (n === null) notFound();

  // Auth model: metadata (number, name, glyph, trigrams) is rendered server-side for
  // all requests — it is public-domain information equivalent to any I Ching table of
  // contents. Translations (records/sources) are never in the RSC payload; they are
  // fetched by LibraryContentLoader from /api/library/[number] (Bearer + Seeker+).
  //
  // An unauthenticated or free-tier user who navigates directly to /library/17 sees
  // metadata briefly before LibraryContentLoader redirects them to /. This is
  // intentional: the metadata flash is not a data leak of premium content.
  const detail = getLibraryDetail(n);
  if (!detail) notFound();

  const { summary, mutations } = detail;
  const upperMeta = getTrigramById(summary.upperTrigram);
  const lowerMeta = getTrigramById(summary.lowerTrigram);

  // Pre-compute mutation labels server-side (UI strings, not translations).
  const resolvedMutations = mutations.map((m) => ({
    position: m.position,
    toNumber: m.toNumber,
    toGlyph: m.toGlyph,
    toChineseName: m.toChineseName,
    toPinyin: m.toPinyin,
    toEnglishName: m.toEnglishName,
    label: messages.mutationLine(m.fromNumber, m.toNumber, m.position),
  }));

  const lineLabels: ResolvedLineLabels = {
    line1: messages.lineLabel(1),
    line2: messages.lineLabel(2),
    line3: messages.lineLabel(3),
    line4: messages.lineLabel(4),
    line5: messages.lineLabel(5),
    line6: messages.lineLabel(6),
  };

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
        {/* Public metadata — number, name, glyph, trigrams. No translations. */}
        <p className="library-breadcrumb">
          <Link href="/library">{messages.detailCrumb}</Link>
          <span aria-hidden="true"> / </span>
          <span>
            {summary.number}. {summary.chineseName} · {summary.pinyin}
          </span>
        </p>

        <header className="library-detail-header">
          <div className="library-detail-glyph-container">
            <span className="library-detail-glyph" aria-hidden="true">
              {summary.glyph}
            </span>
          </div>
          <div className="library-detail-content">
            <div className="library-detail-main">
              <span className="library-detail-number">#{summary.number}</span>
              <h1 lang="zh-Hant" className="library-detail-chinese">
                {summary.chineseName}
              </h1>
            </div>
            <p className="library-detail-names">
              <span className="library-detail-pinyin">{summary.pinyin}</span>
              <span className="library-detail-dot">·</span>
              <span className="library-detail-english">{summary.englishName}</span>
            </p>
            <div className="library-detail-info-grid">
              <div className="library-info-item">
                <span className="library-info-label">{messages.filterUpperLabel}</span>
                <span className="library-info-value">{formatTrigramLabel(upperMeta)}</span>
              </div>
              <div className="library-info-item">
                <span className="library-info-label">{messages.filterLowerLabel}</span>
                <span className="library-info-value">{formatTrigramLabel(lowerMeta)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Translations fetched client-side from /api/library/[number] after Bearer auth.
            Never present in the server-rendered RSC payload. */}
        <LibraryContentLoader
          hexagramNumber={n}
          messages={serializable}
          lineLabels={lineLabels}
          mutationsHeading={messages.mutationsHeading}
          mutationsIntro={messages.mutationsIntro}
          resolvedMutations={resolvedMutations}
        />
      </article>
    </div>
  );
}
