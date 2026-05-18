import type { Metadata } from "next";
import Link from "next/link";
import { getDeleteAccountPageMessages, getDocNavUiMessages } from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveDocLocale();
  const m = getDeleteAccountPageMessages(locale);
  return {
    title: m.pageTitle,
    description: m.pageDescription,
    robots: { index: true, follow: true },
  };
}

export default async function DeleteAccountPage() {
  const locale = await resolveDocLocale();
  const m = getDeleteAccountPageMessages(locale);
  const nav = getDocNavUiMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link>
        {" · "}
        <Link href="/privacy">{nav.privacyPolicy}</Link>
        {" · "}
        <Link href="/terms">{nav.termsOfService}</Link>
      </nav>
      <article className="doc-article">
        <h1>{m.h1}</h1>
        <p>{m.intro}</p>

        <h2>{m.howTitle}</h2>
        <ol>
          <li>{m.step1}</li>
          <li>{m.step2}</li>
          <li>{m.step3}</li>
          <li>{m.step4}</li>
        </ol>
        <p>{m.afterSteps}</p>

        <h2>{m.deletedTitle}</h2>
        <ul>
          {m.deletedItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h2>{m.retainedTitle}</h2>
        <p>{m.retainedBody}</p>

        <h2>{m.rcTitle}</h2>
        <p>{m.rcBody}</p>

        <h2>{m.noAccessTitle}</h2>
        <p>
          {m.noAccessBody.split("privacy@theoriginaliching.com").map((part, i, arr) =>
            i < arr.length - 1 ? (
              <span key={i}>
                {part}
                <a href="mailto:privacy@theoriginaliching.com">
                  privacy@theoriginaliching.com
                </a>
              </span>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </p>
      </article>
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link>
        {" · "}
        <Link href="/privacy">{nav.privacyPolicy}</Link>
        {" · "}
        <Link href="/terms">{nav.termsOfService}</Link>
      </nav>
    </div>
  );
}
