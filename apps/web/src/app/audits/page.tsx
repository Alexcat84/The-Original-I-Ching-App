import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";
import {
  getAuditsPageUiMessages,
  getDocNavUiMessages,
  type AuditsPageUiMessages,
  type AuditSourceBlock,
} from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";

function AuditBlockCard({
  a,
  block,
}: {
  a: AuditsPageUiMessages;
  block: AuditSourceBlock;
}) {
  return (
    <div className="audit-block">
      <div className="audit-block__head">
        <h3 className="audit-block__title">{block.title}</h3>
        <span className={`audit-block__status audit-block__status--${block.statusKind}`}>
          {block.statusLabel}
        </span>
      </div>
      <dl className="audit-block__fields">
        <dt>{a.blockSourceLabel}</dt>
        <dd>
          {block.source.citation}
          <em>{block.source.title}</em>
          {block.source.rest}
        </dd>
        <dt>{a.blockDateLabel}</dt>
        <dd>{block.verificationDate}</dd>
        <dt>{a.blockMethodLabel}</dt>
        <dd>{block.method}</dd>
        <dt>{a.blockStandardLabel}</dt>
        <dd>{block.standardCompared}</dd>
        <dt>{a.blockResultLabel}</dt>
        <dd>{block.result}</dd>
        <dt>{a.blockStatusLabel}</dt>
        <dd>{block.currentStatusNote}</dd>
      </dl>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Fidelity Audits | The Original I Ching App",
  description:
    "Audit dates, reference editions, and pass outcomes for I Ching oracle texts and changing-line rules.",
  openGraph: {
    title: "Fidelity Audits | The Original I Ching App",
    description: "Public audit log: dates, sources, and outcomes.",
  },
  ...buildCanonicalMetadata("/audits"),
};

export default async function AuditsPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const a = getAuditsPageUiMessages(locale);

  const statusClass = (status: string) =>
    status === "closed" ? "audit-status audit-status--closed" : "audit-status audit-status--ongoing";

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/faqs">{nav.faqs}</Link> · <Link href="/notes">{nav.methodNotes}</Link> ·{" "}
        <Link href="/audits">{nav.fidelityAudits}</Link> ·{" "}
        <Link href="/about">{nav.aboutShort}</Link> · <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{a.title}</h1>
        <p className="doc-lead">{a.lead}</p>
        <p className="doc-meta">
          <strong>{a.lastUpdatedLabel}:</strong> {a.lastUpdated}
        </p>

        <h2>{a.introHeading}</h2>
        <p>{a.introBody}</p>

        <h2>{a.oracleTextsHeading}</h2>
        <p>{a.oracleTextsBody}</p>
        <div className="audit-block-list">
          {a.sourceBlocks
            .filter((block) => block.category === "oracle-text")
            .map((block) => (
              <AuditBlockCard key={block.id} a={a} block={block} />
            ))}
        </div>

        <h2>{a.mutationRulesHeading}</h2>
        <p>{a.mutationRulesIntro}</p>
        <div className="audit-block-list">
          {a.sourceBlocks
            .filter((block) => block.category === "mutation-rule")
            .map((block) => (
              <AuditBlockCard key={block.id} a={a} block={block} />
            ))}
        </div>

        <h2>{a.reportsHeading}</h2>
        <ul className="audit-log-list">
          {a.reports.map((report) => (
            <li key={report.id} className="audit-log-entry">
              <div className="audit-log-entry__head">
                <time dateTime={report.date}>{report.date}</time>
                <span className={statusClass(report.status)}>{report.statusLabel}</span>
              </div>
              <h3 className="audit-log-entry__title">{report.title}</h3>
              <p>{report.summary}</p>
            </li>
          ))}
        </ul>

        <p className="doc-see-also">{a.seeAlsoNotes}</p>
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
