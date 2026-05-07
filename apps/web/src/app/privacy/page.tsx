import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | The Original I Ching App",
  description: "Privacy policy for The Original I Ching App at theoriginaliching.com.",
  robots: { index: false, follow: false },
};
import { getDocNavUiMessages, getPrivacyPageMessages } from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";
import { PrivacyArticleContent } from "@/components/legal/PrivacyArticleContent";

export default async function PrivacyPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const p = getPrivacyPageMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/notes">{nav.methodNotes}</Link> · <Link href="/faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/about">{nav.aboutShort}</Link> · <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <PrivacyArticleContent messages={p} nav={nav} />
      </article>
    </div>
  );
}
