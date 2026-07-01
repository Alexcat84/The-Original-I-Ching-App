import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";

export const metadata: Metadata = {
  title: "User Guide | The Original I Ching App",
  description:
    "Learn how to consult the I Ching and Oracle Bones with AI: methods, token packs, image generation, and chat features.",
  openGraph: {
    title: "User Guide | The Original I Ching App",
    description:
      "How to use the I Ching oracle app: methods, token packs, AI interpretation, and more.",
  },
  ...buildCanonicalMetadata("/guia"),
};
import { getDocNavUiMessages, getGuiaPageUiMessages } from "@iching-oracle/i18n";

import { resolveDocLocale } from "@/lib/doc-locale";


export default async function GuiaRapidaPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const g = getGuiaPageUiMessages(locale);
  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> ·{" "}
        <Link href="/faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/audits">{nav.fidelityAudits}</Link> ·{" "}
        <Link href="/about">{nav.aboutShort}</Link> ·{" "}
        <Link href="/notes">{nav.methodNotes}</Link> ·{" "}
        <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{g.title}</h1>
        <p className="doc-lead">
          {g.leadPart1}I Ching
          {g.leadPart2}
          {g.bonesLabel}
          {g.leadPart3}
        </p>

        {/* Modo de oráculo (selector principal) */}
        <h2 id="modos-consulta">{g.s1Heading}</h2>
        <ul>
          <li>
            <strong>I Ching</strong>: {g.s1Iching}
          </li>
          <li>
            <strong>{g.bonesLabel}</strong>: {g.s1Bones}
          </li>
        </ul>

        {/* Panel de opciones — en el mismo orden que los selectores de la app */}
        <h2 id="panel-opciones">{g.optionsHeading}</h2>
        <p className="doc-note">{g.optionsIntro}</p>

        {/* Selector 1: Traductor */}
        <h3 id="traductor">{g.translatorsHeading}</h3>
        <ul>
          <li>
            <strong>Wilhelm (1924)</strong>: {g.translatorsWilhelm}
          </li>
          <li>
            <strong>James Legge</strong>: {g.translatorsLegge}
          </li>
          <li>
            <strong>Zhou Yi (Original)</strong>: {g.translatorsZhouyi}
          </li>
          <li>
            <strong>Master (3)</strong>: {g.translatorsMaster}
          </li>
        </ul>

        {/* Selector 2: Lectura de líneas cambiantes */}
        <h3 id="lectura-lineas">{g.lineReadingHeading}</h3>
        <p>{g.ichingTraditionNote}</p>

        {/* Selector 3: Método */}
        <h3 id="metodo">{g.methodsHeading}</h3>
        <p className="doc-note">{g.methodsIntro}</p>
        <ul>
          <li>
            <strong>{g.coinsPracticalHeading}</strong>: {g.coinsPracticalBody}
          </li>
          <li>
            <strong>{g.yarrowPracticalHeading}</strong>: {g.yarrowPracticalBody}
          </li>
          <li>
            <strong>{g.bonesPracticalHeading}</strong>: {g.bonesPracticalBody}
          </li>
        </ul>

        {/* Selector 4: Ejecución (automática o manual) */}
        <h3 id="ejecucion">{g.ichingCastModeHeading}</h3>
        <p>{g.ichingCastModeP1}</p>
        <ul>
          <li>{g.ichingCastAutoLi}</li>
          <li>{g.ichingCastManualLi}</li>
        </ul>

        {/* Sesiones y chats */}
        <h2 id="sesiones-mensajes">{g.s3Heading}</h2>
        <ul>
          <li>
            <strong>{g.s3NewSessionTitle}</strong>: {g.s3NewSession}
          </li>
          <li>
            <strong>{g.s3HistoryTitle}</strong>: {g.s3History}
          </li>
        </ul>

        {/* Tokens */}
        <h2 id="tokens">{g.tokensHeading}</h2>
        <p>{g.tokensIntro}</p>

        {/* Biblioteca y documentación */}
        <h2 id="biblioteca-docs">{g.s6Heading}</h2>
        <p>{g.libraryFeatureBody}</p>
        <ul>
          <li>{g.libraryTabsBullet}</li>
          <li>{g.libraryCommentaryBullet}</li>
          <li>{g.libraryWenYenBullet}</li>
          <li>{g.librarySearchBullet}</li>
          <li>{g.libraryMutationsBullet}</li>
          <li>{g.libraryCommentaryScopeBullet}</li>
        </ul>
        <ul>
          <li>
            <strong>{g.s6LibraryTitle}</strong>: {g.s6Library}
          </li>
          <li>
            <strong>{g.s6DocsTitle}</strong>: {g.s6Docs}
          </li>
        </ul>

        {/* Exportar y guardar */}
        <h2 id="exportar">{g.exportHeading}</h2>
        <p>{g.exportBody}</p>

        {/* Privacidad */}
        <h2 id="privacidad">{g.privacyHeading}</h2>
        <ul>
          <li>{g.privacyLi1}</li>
          <li>{g.privacyLi2}</li>
          <li>{g.privacyLi3}</li>
        </ul>

        <nav className="doc-nav" style={{ marginTop: "3rem" }}>
          <Link href="/">{nav.backToOracle}</Link> ·{" "}
          <Link href="/faqs">{nav.faqs}</Link> ·{" "}
          <Link href="/about">{nav.aboutShort}</Link> ·{" "}
          <Link href="/notes">{nav.methodNotes}</Link> ·{" "}
          <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
          <Link href="/terms">{nav.termsShort}</Link>
        </nav>
      </article>
    </div>
  );
}
