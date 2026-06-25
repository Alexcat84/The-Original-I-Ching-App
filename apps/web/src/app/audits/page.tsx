import type { Metadata } from "next";
import type { ReactNode } from "react";
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

type TimelineField = {
  label: string;
  value: ReactNode;
};

function timelineDateClass(statusKind: AuditTimelineEntry["statusKind"]): string {
  if (statusKind === "superseded") return "audit-timeline__date audit-timeline__date--muted";
  return "audit-timeline__date audit-timeline__date--active";
}

function timelineSpineDotClass(statusKind: AuditTimelineEntry["statusKind"]): string {
  if (statusKind === "superseded") return "audit-timeline__spine-dot audit-timeline__spine-dot--muted";
  return "audit-timeline__spine-dot audit-timeline__spine-dot--active";
}

function buildTimelineFields(
  a: AuditsPageUiMessages,
  entry: AuditTimelineEntry,
): TimelineField[] {
  const fields: TimelineField[] = [];

  if (entry.source) {
    fields.push({
      label: a.blockSourceLabel,
      value: (
        <>
          {entry.source.citation}
          <em>{entry.source.title}</em>
          {entry.source.rest}
        </>
      ),
    });
  }
  if (entry.method) {
    fields.push({ label: a.blockMethodLabel, value: entry.method });
  }
  if (entry.standardCompared) {
    fields.push({ label: a.blockStandardLabel, value: entry.standardCompared });
  }
  if (entry.result) {
    fields.push({ label: a.blockResultLabel, value: entry.result });
  }
  if (entry.currentStatusNote && entry.kind === "verification") {
    fields.push({ label: a.blockStatusLabel, value: entry.currentStatusNote });
  }

  return fields;
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
  const fields = buildTimelineFields(a, entry);

  return (
    <li className="audit-timeline__item">
      <div className="audit-timeline__marker">
        <span className={timelineSpineDotClass(entry.statusKind)} aria-hidden="true" />
        <time className={timelineDateClass(entry.statusKind)} dateTime={entry.verificationDateIso}>
          {dateLabel}
        </time>
      </div>
      <div className="audit-timeline__panel">
        <details className="audit-timeline__details">
          <summary className="audit-timeline__summary">
            <div className="audit-timeline__summary-main">
              <span className="audit-timeline__headline">{entry.headline}</span>
              <span className="audit-timeline__status">{entry.statusLabel}</span>
            </div>
            <span className="audit-timeline__toggle" aria-hidden="true" />
          </summary>
          {fields.length > 0 ? (
            <ul className="audit-timeline__tree">
              {fields.map((field, index) => (
                <li
                  key={field.label}
                  className={index === fields.length - 1 ? "audit-timeline__tree-item is-last" : "audit-timeline__tree-item"}
                >
                  <span className="audit-timeline__tree-label">{field.label}</span>
                  <span className="audit-timeline__tree-value">{field.value}</span>
                </li>
              ))}
            </ul>
          ) : null}
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
