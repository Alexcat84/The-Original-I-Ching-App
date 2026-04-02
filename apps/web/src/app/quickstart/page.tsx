import Link from "next/link";
import { getDocNavUiMessages, getQuickstartPageUiMessages } from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function QuickStartPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const q = getQuickstartPageUiMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.quickGuide}</Link> ·{" "}
        <Link href="/notes">{nav.methodNotes}</Link> · <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{q.title}</h1>
        <p className="doc-lead">{q.lead}</p>

        <h2>{q.s1Heading}</h2>
        <ul>
          <li>
            <strong>I Ching</strong> — {q.ichingLi}
          </li>
          <li>
            <strong>{q.bonesLabel}</strong> — {q.bonesLi}
          </li>
        </ul>

        <h2>{q.s2Heading}</h2>
        <ul>
          <li>{q.s2Li1}</li>
          <li>{q.s2Li2}</li>
          <li>{q.s2Li3}</li>
          <li>{q.s2Li4}</li>
          <li>{q.s2Li5}</li>
        </ul>

        <h2>{q.s3Heading}</h2>
        <ul>
          <li>{q.s3Li1}</li>
          <li>{q.s3Li2}</li>
          <li>{q.s3Li3}</li>
        </ul>
      </article>
    </div>
  );
}
