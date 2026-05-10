import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "User Guide | The Original I Ching App",
  description: "Learn how to consult the I Ching and Oracle Bones with AI: methods, token packs, image generation, and chat features.",
  openGraph: {
    title: "User Guide | The Original I Ching App",
    description: "How to use the I Ching oracle app: methods, token packs, AI interpretation, and more.",
  },
};
import {
  formatGuiaFreeLine,
  formatGuiaPackPrice,
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
import { resolveDocLocale } from "@/lib/doc-locale";
import { FREE_TOKENS, PACK_IDS_ORDERED, TOKEN_PACKS } from "@/lib/token-packs";

export default async function GuiaRapidaPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const g = getGuiaPageUiMessages(locale);
  const q = getQuickstartPageUiMessages(locale);
  const packsUi = getGuiaPacksUiMessages(locale);
  const tokensWord = getPricingUiMessages(locale).tokensWord;

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/about">{nav.aboutShort}</Link> ·{" "}
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

        {/* 1) Primeros pasos — preserves the legacy `/guia#primeros-pasos` anchor */}
        <h2 id="primeros-pasos">{g.gettingStartedHeading}</h2>
        <p className="doc-lead">{q.lead}</p>

        <h3>{q.s1Heading}</h3>
        <ul>
          <li>
            <strong>I Ching</strong>: {q.ichingLi}
          </li>
          <li>
            <strong>{q.bonesLabel}</strong>: {q.bonesLi}
          </li>
        </ul>

        <h3>{q.s3Heading}</h3>
        <ul>
          <li>{q.s3Li1}</li>
          <li>{q.s3Li2}</li>
          <li>{q.s3Li3}</li>
        </ul>

        {/* 2) Uso de la app y opciones disponibles */}
        <h2>{g.appUseHeading}</h2>
        <p>{g.appUseIntro}</p>

        <h3>{g.optionsHeading}</h3>
        <p>{g.optionsIntro}</p>
        <ul>
          <li>
            <strong>I Ching</strong>: {g.ichingBullet}
          </li>
          <li>
            <strong>{g.bonesLabel}</strong>: {g.bonesBulletSuffix}
          </li>
          <li>{g.threadDepthBullet}</li>
        </ul>

        <h3>{g.chatsHeading}</h3>
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

        <h3>{g.exportHeading}</h3>
        <p>{g.exportBody}</p>

        {/* 3) Cómo usar los métodos */}
        <h2>{g.methodsHeading}</h2>
        <p>{g.methodsIntro}</p>

        <h3>{g.ichingPracticalHeading}</h3>
        <p>{g.ichingPracticalBody}</p>

        <h3>{g.coinsPracticalHeading}</h3>
        <p>{g.coinsPracticalBody}</p>

        <h3>{g.yarrowPracticalHeading}</h3>
        <p>{g.yarrowPracticalBody}</p>

        <h3>{g.ichingCastModeHeading}</h3>
        <p>{g.ichingCastModeP1}</p>
        <ul>
          <li>{g.ichingCastAutoLi}</li>
          <li>{g.ichingCastManualLi}</li>
        </ul>

        <h3>{g.bonesPracticalHeading}</h3>
        <p>{g.bonesPracticalBody}</p>

        {/* 4) Tokens, límites y packs — preserves the legacy `/guia#planes` anchor */}
        <h2>{g.tokensHeading}</h2>
        <p>{g.tokensIntro}</p>

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

        {/* 5) Privacidad y documentos relacionados */}
        <h2>{g.privacyDocsHeading}</h2>
        <p>{g.privacyDocsIntro}</p>
        <ul>
          <li>{g.privacyLi1}</li>
          <li>{g.privacyLi2}</li>
          <li>{g.privacyLi3}</li>
        </ul>
        <p className="doc-meta" style={{ opacity: 0.9, marginTop: "0.75rem" }}>
          {g.legalMetaBeforePrivacy}
          <Link href="/privacy">{nav.privacyPolicy}</Link>
          {g.legalMetaBetween}
          <Link href="/terms">{nav.termsOfService}</Link>
          {g.legalMetaAfterTerms}
        </p>

        <p className="doc-footer-links">
          <Link href="/documentacion/iching">{nav.ichingDocLink}</Link> · <Link href="/faqs">{nav.faqs}</Link> ·{" "}
          <Link href="/about">{nav.aboutShort}</Link> · <Link href="/privacy">{nav.privacyPolicy}</Link> ·{" "}
          <Link href="/terms">{nav.termsOfService}</Link>
        </p>
      </article>
    </div>
  );
}
