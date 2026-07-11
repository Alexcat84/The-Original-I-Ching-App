import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | The Original I Ching App",
  description: "Privacy policy for The Original I Ching App at theoriginaliching.com.",
  robots: { index: false, follow: false },
};
import { getDocNavUiMessages, getPrivacyPageMessages } from "@iching-oracle/i18n";
import { MarketingDocShell } from "@/components/marketing/MarketingDocShell";
import { resolveDocLocale } from "@/lib/doc-locale";
import { PrivacyArticleContent } from "@/components/legal/PrivacyArticleContent";

export default async function PrivacyPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const p = getPrivacyPageMessages(locale);

  return (
    <MarketingDocShell>
      <div className="oracle-shell doc-page">
        <article className="doc-article">
          <PrivacyArticleContent messages={p} nav={nav} />
        </article>
      </div>
    </MarketingDocShell>
  );
}
