import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";
import {
  formatAuditTimelineDateCompact,
  getAuditsPageUiMessages,
  getDocNavUiMessages,
  type AuditBlockCategory,
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

function groupTimelineByCategory(
  timeline: AuditTimelineEntry[],
): { category: NonNullable<AuditTimelineEntry["category"]>; entries: AuditTimelineEntry[] }[] {
  const order: NonNullable<AuditTimelineEntry["category"]>[] = [
    "oracle-text",
    "divination-method",
    "library-commentary",
    "mutation-rule",
  ];
  return order
    .map((category) => ({
      category,
      entries: timeline.filter((entry) => entry.category === category),
    }))
    .filter((section) => section.entries.length > 0);
}

function buildTimelineFields(
  a: AuditsPageUiMessages,
  entry: AuditTimelineEntry,
): TimelineField[] {
  return [
    { label: a.blockVerificationDateLabel, value: entry.verificationDate },
    {
      label: a.blockSourceLabel,
      value: (
        <>
          {entry.source.citation}
          <em>{entry.source.title}</em>
          {entry.source.rest}
        </>
      ),
    },
    { label: a.blockMethodLabel, value: entry.method },
    { label: a.blockStandardLabel, value: entry.standardCompared },
    { label: a.blockResultLabel, value: entry.result },
    {
      label: a.blockStatusLabel,
      value: `${entry.statusLabel}. ${entry.currentStatusNote}`,
    },
  ];
}

function AuditTimelineRow({
  a,
  entry,
}: {
  a: AuditsPageUiMessages;
  entry: AuditTimelineEntry;
}) {
  const dateLabel = formatAuditTimelineDateCompact(entry.verificationDateIso);
  const fields = buildTimelineFields(a, entry);

  return (
    <li className="audit-timeline__item">
      <details className="audit-timeline__details">
        <summary className="audit-timeline__summary">
          <span className="audit-timeline__toggle" aria-hidden="true" />
          <time className={timelineDateClass(entry.statusKind)} dateTime={entry.verificationDateIso}>
            {dateLabel}
          </time>
          <span className="audit-timeline__headline">{entry.headline}</span>
        </summary>
        {fields.length > 0 ? (
          <ul className="audit-timeline__tree">
            {fields.map((field, index) => (
              <li
                key={`${entry.id}-${field.label}`}
                className={
                  index === fields.length - 1
                    ? "audit-timeline__tree-item is-last"
                    : "audit-timeline__tree-item"
                }
              >
                <span className="audit-timeline__tree-label">{field.label}</span>
                <span className="audit-timeline__tree-value">{field.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </details>
    </li>
  );
}

function sectionHeading(
  a: AuditsPageUiMessages,
  category: AuditBlockCategory,
): string {
  switch (category) {
    case "oracle-text":
      return a.oracleTextSectionHeading;
    case "divination-method":
      return a.divinationMethodSectionHeading;
    case "library-commentary":
      return a.libraryCommentarySectionHeading;
    case "mutation-rule":
      return a.mutationRulesSectionHeading;
    default: {
      const _exhaustive: never = category;
      return _exhaustive;
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveDocLocale();
  const a = getAuditsPageUiMessages(locale);

  return {
    title: `${a.title} | The Original I Ching App`,
    description:
      "Audit dates, reference editions, and pass outcomes for I Ching oracle texts, casting methods, and changing-line rules.",
    openGraph: {
      title: `${a.title} | The Original I Ching App`,
      description: "Public audit log: dates, sources, and outcomes for texts, casting, and rules.",
    },
    ...buildCanonicalMetadata("/audits"),
  };
}

export default async function AuditsPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const a = getAuditsPageUiMessages(locale);
  const sections = groupTimelineByCategory(a.timeline);

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
        {sections.map((section) => (
          <section key={section.category} className="audit-timeline-section">
            <h2 className="audit-timeline-section__heading">{sectionHeading(a, section.category)}</h2>
            <ul className="audit-timeline">
              {section.entries.map((entry) => (
                <AuditTimelineRow key={entry.id} a={a} entry={entry} />
              ))}
            </ul>
          </section>
        ))}
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
