import Link from "next/link";

import { getDocNavUiMessages, getLibraryPageUiMessages } from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function LibraryNotFound() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const messages = getLibraryPageUiMessages(locale);

  return (
    <div className="oracle-shell doc-page library-page">
      <nav className="doc-nav">
        <Link href="/chat">{nav.backToOracle}</Link> · <Link href="/library">{messages.detailCrumb}</Link>
      </nav>
      <article className="doc-article">
        <h1>{messages.notFound}</h1>
        <p className="doc-lead">
          <Link href="/library">{messages.title}</Link>
        </p>
      </article>
    </div>
  );
}
