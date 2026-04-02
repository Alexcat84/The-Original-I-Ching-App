import Link from "next/link";
import {
  formatGuiaFreeLine,
  formatGuiaPackPrice,
  getDocNavUiMessages,
  getGuiaPacksUiMessages,
  getGuiaPageUiMessages,
  getPricingUiMessages,
  packMarketingLocale,
} from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";
import { FREE_TIER_MARKETING, FREE_TOKENS, PACK_IDS_ORDERED, TOKEN_PACKS } from "@/lib/token-packs";

export default async function GuiaRapidaPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const g = getGuiaPageUiMessages(locale);
  const packsUi = getGuiaPacksUiMessages(locale);
  const tokensWord = getPricingUiMessages(locale).tokensWord;
  const mkt = packMarketingLocale(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/quickstart">{nav.quickstart}</Link> ·{" "}
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
            <strong>{TOKEN_PACKS.tokens_seeker_20.label}:</strong>{" "}
            {formatGuiaPackPrice(packsUi, TOKEN_PACKS.tokens_seeker_20.price, TOKEN_PACKS.tokens_seeker_20.tokens, tokensWord)}
          </li>
          <li>
            <strong>{TOKEN_PACKS.tokens_practitioner_40.label}:</strong>{" "}
            {formatGuiaPackPrice(
              packsUi,
              TOKEN_PACKS.tokens_practitioner_40.price,
              TOKEN_PACKS.tokens_practitioner_40.tokens,
              tokensWord,
            )}
          </li>
          <li>
            <strong>{TOKEN_PACKS.tokens_master_100.label}:</strong>{" "}
            {formatGuiaPackPrice(packsUi, TOKEN_PACKS.tokens_master_100.price, TOKEN_PACKS.tokens_master_100.tokens, tokensWord)}
          </li>
        </ul>
        <p>{packsUi.tokensAccumulate}</p>
        <p>{packsUi.perPlanDetailHeading}</p>
        <ul>
          <li>
            <strong>{packsUi.freeTierLabel}</strong> {FREE_TIER_MARKETING[mkt]}
          </li>
          {PACK_IDS_ORDERED.map((id) => (
            <li key={id}>
              <strong>{TOKEN_PACKS[id].label}:</strong> {TOKEN_PACKS[id].marketingDetail[mkt]}
            </li>
          ))}
        </ul>

        <p className="doc-footer-links">
          <Link href="/documentacion/iching">{nav.ichingDocLink}</Link> · <Link href="/privacy">{nav.privacyPolicy}</Link> ·{" "}
          <Link href="/terms">{nav.termsOfService}</Link>
        </p>
      </article>
    </div>
  );
}
