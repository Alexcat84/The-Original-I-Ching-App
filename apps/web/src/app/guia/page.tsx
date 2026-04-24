import Link from "next/link";
import {
  formatGuiaFreeLine,
  formatGuiaPackPrice,
  getAppTraceabilityUiMessages,
  getDocNavUiMessages,
  getFreeTierMarketing,
  getGuiaPacksUiMessages,
  getGuiaPageUiMessages,
  getPackMarketingLine,
  getPricingUiMessages,
  getQuickstartPageUiMessages,
  getTokenPackLabel,
} from "@iching-oracle/i18n";
import type { TokenPackMarketingId } from "@iching-oracle/i18n";
import { FaqAccordion } from "@/components/FaqAccordion";
import { resolveDocLocale } from "@/lib/doc-locale";
import { FREE_TOKENS, PACK_IDS_ORDERED, TOKEN_PACKS } from "@/lib/token-packs";

export default async function GuiaRapidaPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const g = getGuiaPageUiMessages(locale);
  const q = getQuickstartPageUiMessages(locale);
  const packsUi = getGuiaPacksUiMessages(locale);
  const tokensWord = getPricingUiMessages(locale).tokensWord;
  const trace = getAppTraceabilityUiMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="#faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/notes">{nav.methodNotes}</Link> · <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{g.title}</h1>
        <p className="doc-lead">
          {g.leadPart1}
          <strong>I Ching</strong>
          {g.leadPart2}
          <strong>{g.bonesLabel}</strong>
          {g.leadPart3}
        </p>

        <h2 id="primeros-pasos">{g.gettingStartedHeading}</h2>
        <p className="doc-lead">{q.lead}</p>

        <h3>{q.s1Heading}</h3>
        <ul>
          <li>
            <strong>I Ching</strong> — {q.ichingLi}
          </li>
          <li>
            <strong>{q.bonesLabel}</strong> — {q.bonesLi}
          </li>
        </ul>

        <h3>{q.s2Heading}</h3>
        <ul>
          <li>{q.s2Li1}</li>
          <li>{q.s2Li2}</li>
          <li>{q.s2Li3}</li>
          <li>{q.s2Li4}</li>
          <li>{q.s2Li5}</li>
        </ul>

        <h3>{q.s3Heading}</h3>
        <ul>
          <li>{q.s3Li1}</li>
          <li>{q.s3Li2}</li>
          <li>{q.s3Li3}</li>
        </ul>

        <h2>{g.privacyHeading}</h2>
        <ul>
          <li>{g.privacyLi1}</li>
          <li>{g.privacyLi2}</li>
          <li>{g.privacyLi3}</li>
        </ul>

        <h2>{g.chatsHeading}</h2>
        <ul>
          <li>
            <strong>{g.chatsLabel}</strong> {g.chatsOpensHistory}
          </li>
          <li>
            <strong>{g.newSessionLabel}</strong> {g.newSessionDesc}
          </li>
          <li>{g.chatsUnlimited}</li>
          <li>{g.packChangesLine}</li>
        </ul>

        <h2>{g.optionsHeading}</h2>
        <p>{g.optionsIntro}</p>
        <ul>
          <li>
            <strong>I Ching</strong> — {g.ichingBullet}
          </li>
          <li>
            <strong>{g.bonesLabel}</strong> — {g.bonesBulletSuffix}
          </li>
          <li>{g.threadDepthBullet}</li>
        </ul>

        <h2>{g.exportHeading}</h2>
        <p>{g.exportBody}</p>

        <p className="doc-meta" style={{ opacity: 0.9, marginTop: "0.75rem" }}>
          {g.legalMetaBeforePrivacy}
          <Link href="/privacy">{nav.privacyPolicy}</Link>
          {g.legalMetaBetween}
          <Link href="/terms">{nav.termsOfService}</Link>
          {g.legalMetaAfterTerms}
        </p>

        <h2 id="planes">{packsUi.sectionTitle}</h2>
        <p>{packsUi.currentPricing}</p>
        <ul>
          <li>
            <strong>{packsUi.freeProductName}:</strong> {formatGuiaFreeLine(packsUi, FREE_TOKENS)}
          </li>
          <li>
            <strong>{getTokenPackLabel("tokens_seeker_20", locale)}:</strong>{" "}
            {formatGuiaPackPrice(packsUi, TOKEN_PACKS.tokens_seeker_20.price, TOKEN_PACKS.tokens_seeker_20.tokens, tokensWord)}
          </li>
          <li>
            <strong>{getTokenPackLabel("tokens_practitioner_40", locale)}:</strong>{" "}
            {formatGuiaPackPrice(
              packsUi,
              TOKEN_PACKS.tokens_practitioner_40.price,
              TOKEN_PACKS.tokens_practitioner_40.tokens,
              tokensWord,
            )}
          </li>
          <li>
            <strong>{getTokenPackLabel("tokens_master_100", locale)}:</strong>{" "}
            {formatGuiaPackPrice(packsUi, TOKEN_PACKS.tokens_master_100.price, TOKEN_PACKS.tokens_master_100.tokens, tokensWord)}
          </li>
        </ul>
        <p>{packsUi.tokensAccumulate}</p>
        <p>{packsUi.perPlanDetailHeading}</p>
        <ul>
          <li>
            <strong>{packsUi.freeTierLabel}</strong> {getFreeTierMarketing(locale)}
          </li>
          {PACK_IDS_ORDERED.map((id) => (
            <li key={id}>
              <strong>{getTokenPackLabel(id as TokenPackMarketingId, locale)}:</strong>{" "}
              {getPackMarketingLine(id as TokenPackMarketingId, locale)}
            </li>
          ))}
        </ul>

        <p className="doc-footer-links">
          <Link href="/documentacion/iching">{nav.ichingDocLink}</Link> · <Link href="/privacy">{nav.privacyPolicy}</Link> ·{" "}
          <Link href="/terms">{nav.termsOfService}</Link>
        </p>

        <hr className="doc-major-divider" aria-hidden />

        <h2 id="faqs">{nav.faqs}</h2>
        <FaqAccordion locale={locale} nav={nav} />

        <section id="rn-app-trace-root" className="apk-traceability-section" aria-labelledby="apk-trace-heading">
          <hr className="doc-major-divider doc-major-divider--subtle" aria-hidden />
          <h2 id="apk-trace-heading">{trace.aboutHeading}</h2>
          <dl className="apk-trace-dl">
            <div className="apk-trace-row">
              <dt>{trace.appNameLabel}</dt>
              <dd>{trace.appNameValue}</dd>
            </div>
            <div className="apk-trace-native-metrics">
              <div className="apk-trace-row">
                <dt>{trace.versionLabel}</dt>
                <dd id="rn-trace-version">—</dd>
              </div>
              <div className="apk-trace-row">
                <dt>{trace.androidVersionCodeLabel}</dt>
                <dd id="rn-trace-code">—</dd>
              </div>
            </div>
          </dl>
          <p className="apk-trace-rights">{trace.rightsLine}</p>
        </section>
      </article>
    </div>
  );
}
