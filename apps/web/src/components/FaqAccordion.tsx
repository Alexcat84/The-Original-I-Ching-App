import Link from "next/link";
import {
  getFaqPageUiMessages,
  getPricingUiMessages,
  resolveFaqRelatedHref,
  resolveFaqRelatedLabel,
  type DocNavUiMessages,
  type FaqItem,
  type FaqRelatedSlug,
} from "@iching-oracle/i18n";
import type { AppLocale } from "@iching-oracle/i18n";

export function FaqAccordion(props: { locale: AppLocale; nav: DocNavUiMessages }) {
  const { locale, nav } = props;
  const faq = getFaqPageUiMessages(locale);
  const pricingTitle = getPricingUiMessages(locale).title;

  return (
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
  );
}
