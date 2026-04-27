import Link from "next/link";
import { getDocNavUiMessages, getTermsPageMessages } from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";
import { TermsArticleContent } from "@/components/legal/TermsArticleContent";

export default async function TermsPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const t = getTermsPageMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/notes">{nav.methodNotes}</Link> · <Link href="/faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/about">{nav.aboutShort}</Link> · <Link href="/privacy">{nav.privacyShort}</Link>
      </nav>
      <article className="doc-article">
        <TermsArticleContent messages={t} nav={nav} />
      </article>
    </div>
  );
}
