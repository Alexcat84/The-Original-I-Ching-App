import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | The Original I Ching App",
  description: "Terms of service for The Original I Ching App at theoriginaliching.com.",
  robots: { index: false, follow: false },
};
import { getDocNavUiMessages, getTermsPageMessages } from "@iching-oracle/i18n";
import { MarketingDocShell } from "@/components/marketing/MarketingDocShell";
import { resolveDocLocale } from "@/lib/doc-locale";
import { TermsArticleContent } from "@/components/legal/TermsArticleContent";

export default async function TermsPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const t = getTermsPageMessages(locale);

  return (
    <MarketingDocShell>
      <div className="oracle-shell doc-page">
        <article className="doc-article">
          <TermsArticleContent messages={t} nav={nav} />
        </article>
      </div>
    </MarketingDocShell>
  );
}
