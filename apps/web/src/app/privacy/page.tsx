import Link from "next/link";
import { getDocNavUiMessages, getPrivacyPageMessages } from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function PrivacyPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const p = getPrivacyPageMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/faqs">{nav.faqs}</Link> · <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{p.title}</h1>
        <p className="doc-lead">{p.lead}</p>
        <p className="doc-meta" style={{ opacity: 0.85, fontSize: "0.95rem" }}>
          {p.lastUpdated}
        </p>

        <h2>{p.s1Title}</h2>
        <p>{p.s1Body}</p>

        <h2>{p.s2Title}</h2>
        <ul>
          {p.s2Items.map((item, i) => (
            <li key={`s2-${i}`}>{item}</li>
          ))}
        </ul>

        <h2>{p.s3Title}</h2>
        <ul>
          {p.s3Items.map((item, i) => (
            <li key={`s3-${i}`}>{item}</li>
          ))}
        </ul>
        <p>{p.s3LegalBasis}</p>

        <h2>{p.s4Title}</h2>
        <p>{p.s4Intro}</p>
        <p>
          <strong>{p.s4ControlTitle}</strong> {p.s4ControlBody}
        </p>
        <p>
          <strong>{p.s4DeleteTitle}</strong> {p.s4DeleteBody}
        </p>
        <p>
          <strong>{p.s4PdfTitle}</strong> {p.s4PdfBody}
        </p>

        <h2>{p.s5Title}</h2>
        <p>{p.s5p1}</p>
        <p>{p.s5p2}</p>

        <h2>{p.s6Title}</h2>
        <p>{p.s6Body}</p>

        <h2>{p.s7Title}</h2>
        <ul>
          {p.s7Items.map((item, i) => (
            <li key={`s7-${i}`}>{item}</li>
          ))}
        </ul>

        <h2>{p.s8Title}</h2>
        <p>{p.s8p1}</p>
        <p>{p.s8p2}</p>

        <h2>{p.s9Title}</h2>
        <p>{p.s9Body}</p>

        <h2>{p.s10Title}</h2>
        <p>
          {p.s10BeforeLink}
          <Link href="/terms">{nav.termsOfService}</Link>
          {p.s10AfterLink}
        </p>
      </article>
    </div>
  );
}
