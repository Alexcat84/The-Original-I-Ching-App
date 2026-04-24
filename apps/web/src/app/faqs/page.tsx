import Link from "next/link";
import {
  getDocNavUiMessages,
  getFaqPageUiMessages,
  getPricingUiMessages,
  resolveFaqRelatedHref,
  resolveFaqRelatedLabel,
  type FaqItem,
  type FaqRelatedSlug,
} from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function FaqsPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const faq = getFaqPageUiMessages(locale);
  const pricingTitle = getPricingUiMessages(locale).title;

  return (
    <div className="oracle-shell doc-page faqs-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/notes">{nav.methodNotes}</Link> · <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{faq.title}</h1>
        <p className="doc-lead">{faq.intro}</p>

        <div className="faq-accordion">
          {faq.items.map((item: FaqItem) => (
            <details key={item.id} className="faq-item">
              <summary className="faq-summary">{item.question}</summary>
              <div className="faq-body">
                <p>{item.answer}</p>
                {item.related?.length ? (
                  <div className="faq-related">
                    <p className="faq-related-heading">{faq.seeAlsoHeading}</p>
                    <ul className="faq-related-list">
                      {item.related.map((slug: FaqRelatedSlug) => (
                        <li key={slug}>
                          <Link href={resolveFaqRelatedHref(slug)}>
                            {resolveFaqRelatedLabel(slug, nav, pricingTitle)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </article>
    </div>
  );
}
