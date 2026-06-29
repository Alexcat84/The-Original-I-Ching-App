import type { Metadata } from "next";
import { Suspense } from "react";

import { getDocNavUiMessages, getMutationExplorerUiMessages } from "@iching-oracle/i18n";
import { MutationExplorerAccessGate } from "@/components/mutation-explorer/MutationExplorerAccessGate";
import { MutationExplorerDocNav } from "@/components/mutation-explorer/MutationExplorerDocNav";
import { MutationExplorer } from "@/components/mutation-explorer/MutationExplorer";
import { resolveDocLocale } from "@/lib/doc-locale";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveDocLocale();
  const messages = getMutationExplorerUiMessages(locale);
  const title = `${messages.title} | The Original I Ching App`;
  return {
    title,
    description: messages.metaDescription,
    openGraph: {
      title,
      description: messages.metaDescription,
    },
    ...buildCanonicalMetadata("/mutation-explorer"),
  };
}

export default async function MutationExplorerPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const messages = getMutationExplorerUiMessages(locale);

  return (
    <div className="oracle-shell doc-page mutation-explorer-page">
      <Suspense fallback={null}>
        <MutationExplorerDocNav backLabel={nav.backToOracle} />
      </Suspense>
      <MutationExplorerAccessGate>
        <article className="doc-article">
          <h1>{messages.title}</h1>
          <Suspense fallback={<p>{messages.loading}</p>}>
            <MutationExplorer locale={locale} />
          </Suspense>
        </article>
      </MutationExplorerAccessGate>
    </div>
  );
}
