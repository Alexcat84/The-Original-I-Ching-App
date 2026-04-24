import type { DocNavUiMessages, TermsPageMessages } from "@iching-oracle/i18n";
import Link from "next/link";

type TermsArticleContentProps = {
  messages: TermsPageMessages;
  nav: DocNavUiMessages;
};

export function TermsArticleContent({ messages: t, nav }: TermsArticleContentProps) {
  return (
    <>
      <h1>{t.title}</h1>
      <p className="doc-lead">{t.lead}</p>
      <p className="doc-meta" style={{ opacity: 0.85, fontSize: "0.95rem" }}>
        {t.lastUpdated}
      </p>

      <h2>{t.s1Title}</h2>
      <p>{t.s1Body}</p>

      <h2>{t.s2Title}</h2>
      <ul>
        {t.s2Items.map((item, i) => (
          <li key={`terms-s2-${i}`}>{item}</li>
        ))}
      </ul>

      <h2>{t.s3Title}</h2>
      <ul>
        {t.s3Items.map((item, i) => (
          <li key={`terms-s3-${i}`}>{item}</li>
        ))}
      </ul>

      <h2>{t.s4Title}</h2>
      <ul>
        {t.s4Items.map((item, i) => (
          <li key={`terms-s4-${i}`}>{item}</li>
        ))}
      </ul>

      <h2>{t.s5Title}</h2>
      <p>{t.s5p1}</p>
      <p>{t.s5p2}</p>

      <h2>{t.s6Title}</h2>
      <p>{t.s6Body}</p>

      <h2>{t.s7Title}</h2>
      <ul>
        {t.s7Items.map((item, i) => (
          <li key={`terms-s7-${i}`}>{item}</li>
        ))}
      </ul>

      <h2>{t.s8Title}</h2>
      <p>{t.s8Body}</p>

      <h2>{t.s9Title}</h2>
      <p>{t.s9Body}</p>

      <h2>{t.s10Title}</h2>
      <p>
        {t.s10BeforeLink}
        <Link href="/privacy">{nav.privacyPolicy}</Link>
        {t.s10AfterLink}
      </p>
    </>
  );
}
