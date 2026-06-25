import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";
import {
  formatAuditTimelineDate,
  getAuditsPageUiMessages,
  getDocNavUiMessages,
  type AppLocale,
  type AuditsPageUiMessages,
  type AuditTimelineEntry,
} from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";

function timelineDotClass(statusKind: AuditTimelineEntry["statusKind"]): string {
  if (statusKind === "superseded") return "audit-timeline__dot audit-timeline__dot--muted";
  return "audit-timeline__dot audit-timeline__dot--active";
}

function AuditTimelineRow({
  a,
  entry,
  locale,
}: {
  a: AuditsPageUiMessages;
  entry: AuditTimelineEntry;
  locale: AppLocale;
}) {
  const dateLabel = formatAuditTimelineDate(entry.verificationDateIso, locale);

  return (
    <li className="audit-timeline__item">
      <div className="audit-timeline__rail" aria-hidden="true">
        <time className="audit-timeline__date" dateTime={entry.verificationDateIso}>
          {dateLabel}
        </time>
        <span className={timelineDotClass(entry.statusKind)} />
      </div>
      <div className="audit-timeline__body">
        <details className="audit-timeline__details">
          <summary className="audit-timeline__summary">
            <span className="audit-timeline__headline">{entry.headline}</span>
            <span className="audit-timeline__status">{entry.statusLabel}</span>
          </summary>
          <dl className="audit-timeline__fields">
            {entry.source ? (
              <>
                <dt>{a.blockSourceLabel}</dt>
                <dd>
                  {entry.source.citation}
                  <em>{entry.source.title}</em>
                  {entry.source.rest}
                </dd>
              </>
            ) : null}
            {entry.method ? (
              <>
                <dt>{a.blockMethodLabel}</dt>
                <dd>{entry.method}</dd>
              </>
            ) : null}
            {entry.standardCompared ? (
              <>
                <dt>{a.blockStandardLabel}</dt>
                <dd>{entry.standardCompared}</dd>
              </>
            ) : null}
            {entry.result ? (
              <>
                <dt>{a.blockResultLabel}</dt>
                <dd>{entry.result}</dd>
              </>
            ) : null}
            {entry.currentStatusNote && entry.kind === "verification" ? (
              <>
                <dt>{a.blockStatusLabel}</dt>
                <dd>{entry.currentStatusNote}</dd>
              </>
            ) : null}
          </dl>
        </details>
      </div>
    </li>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveDocLocale();
  const a = getAuditsPageUiMessages(locale);

  return {
    title: `${a.title} | The Original I Ching App`,
    description:
      "Audit dates, reference editions, and pass outcomes for I Ching oracle texts and changing-line rules.",
    openGraph: {
      title: `${a.title} | The Original I Ching App`,
      description: "Public audit log: dates, sources, and outcomes.",
    },
    ...buildCanonicalMetadata("/audits"),
  };
}

export default async function AuditsPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const a = getAuditsPageUiMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/faqs">{nav.faqs}</Link> · <Link href="/notes">{nav.methodNotes}</Link> ·{" "}
        <Link href="/audits">{nav.fidelityAudits}</Link> ·{" "}
        <Link href="/about">{nav.aboutShort}</Link> · <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article doc-article--audits-timeline">
        <ol className="audit-timeline">
          {a.timeline.map((entry) => (
            <AuditTimelineRow key={entry.id} a={a} entry={entry} locale={locale} />
          ))}
        </ol>
      </article>
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/faqs">{nav.faqs}</Link> · <Link href="/notes">{nav.methodNotes}</Link> ·{" "}
        <Link href="/audits">{nav.fidelityAudits}</Link> ·{" "}
        <Link href="/about">{nav.aboutShort}</Link> · <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
    </div>
  );
}
