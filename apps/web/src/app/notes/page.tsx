import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Origen e Historia de los Métodos | The Original I Ching App",
  description:
    "Historia académica del I Ching (Zhouyi) y los Huesos de Oráculo Shang. Métodos auténticos, fuentes originales, sin invención.",
  openGraph: {
    title: "Origen e Historia de los Métodos | The Original I Ching App",
    description:
      "Historia académica del I Ching (Zhouyi) y los Huesos de Oráculo Shang. Métodos auténticos, fuentes originales, sin invención.",
  },
};

import { getDocNavUiMessages, getNotesPageUiMessages } from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";
import { HEXAGRAM_LIST } from "./hexagram-list";

export default async function NotesPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const n = getNotesPageUiMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/about">{nav.aboutShort}</Link> · <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{n.title}</h1>
        <p className="doc-lead">{n.lead}</p>
        <p className="doc-auth-notice">{n.authNotice}</p>

        {/* I Ching */}
        {n.ichingHeading && <h2>{n.ichingHeading}</h2>}

        {n.ichingOriginHeading && (
          <>
            <h3>{n.ichingOriginHeading}</h3>
            <p>{n.ichingOriginBody}</p>
          </>
        )}

        {n.ichingHexHeading && (
          <>
            <h3>{n.ichingHexHeading}</h3>
            <p>{n.ichingHexBody}</p>
          </>
        )}

        {n.ichingHexListHeading && (
          <>
            <h4>{n.ichingHexListHeading}</h4>
            <p>{n.ichingHexListIntro}</p>
            <ol className="hexagram-grid" aria-label={n.ichingHexListAriaLabel}>
              {HEXAGRAM_LIST.map((hex) => (
                <li key={hex.number} className="hexagram-grid__item">
                  <span className="hexagram-grid__number">{hex.number}</span>
                  <span className="hexagram-grid__body">
                    <span className="hexagram-grid__glyph" aria-hidden="true">
                      {hex.glyph}
                    </span>
                    <span className="hexagram-grid__meta">
                      <span className="hexagram-grid__name" lang="zh-Hant">
                        {hex.chineseName}
                      </span>
                      <span className="hexagram-grid__pinyin">{hex.pinyin}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        {n.ichingMethodHeading && (
          <>
            <h3>{n.ichingMethodHeading}</h3>
            <p>{n.ichingMethodBody}</p>
          </>
        )}

        {n.yarrowHeading && <h2>{n.yarrowHeading}</h2>}

        {n.yarrowOriginHeading && (
          <>
            <h3>{n.yarrowOriginHeading}</h3>
            <p>{n.yarrowOriginBody}</p>
          </>
        )}

        {n.yarrowProcedureHeading && (
          <>
            <h3>{n.yarrowProcedureHeading}</h3>
            <p>{n.yarrowProcedureBody}</p>
          </>
        )}

        {n.yarrowProbHeading && (
          <>
            <h3>{n.yarrowProbHeading}</h3>
            <p>{n.yarrowProbBody}</p>
          </>
        )}

        {n.ichingWilhelmHeading && (
          <>
            <h3>{n.ichingWilhelmHeading}</h3>
            <p>{n.ichingWilhelmBody}</p>
          </>
        )}

        {n.ichingLeggeHeading && (
          <>
            <h3>{n.ichingLeggeHeading}</h3>
            <p>{n.ichingLeggeBody}</p>
          </>
        )}

        {n.ichingZhouyiHeading && (
          <>
            <h3>{n.ichingZhouyiHeading}</h3>
            <p>{n.ichingZhouyiBody}</p>
          </>
        )}

        {n.ichingChainHeading && (
          <>
            <h3>{n.ichingChainHeading}</h3>
            <p>{n.ichingChain}</p>
          </>
        )}

        {/* Oracle Bones */}
        {n.bonesHeading && <h2>{n.bonesHeading}</h2>}

        {n.bonesOriginHeading && (
          <>
            <h3>{n.bonesOriginHeading}</h3>
            <p>{n.bonesOriginBody}</p>
          </>
        )}

        {n.bonesRitualHeading && (
          <>
            <h3>{n.bonesRitualHeading}</h3>
            <p>{n.bonesRitualBody}</p>
          </>
        )}

        {n.bonesVerdictsHeading && (
          <>
            <h3>{n.bonesVerdictsHeading}</h3>
            <ul>
              {n.bonesVerdictAuspClear && <li>{n.bonesVerdictAuspClear}</li>}
              {n.bonesVerdictAuspMod && <li>{n.bonesVerdictAuspMod}</li>}
              {n.bonesVerdictInauspMod && <li>{n.bonesVerdictInauspMod}</li>}
              {n.bonesVerdictInauspClear && <li>{n.bonesVerdictInauspClear}</li>}
              {n.bonesVerdictSilence && <li>{n.bonesVerdictSilence}</li>}
            </ul>
          </>
        )}

        {n.bonesAuthHeading && (
          <>
            <h3>{n.bonesAuthHeading}</h3>
            <p>{n.bonesAuthBody}</p>
          </>
        )}

        {/* Interpretation */}
        {n.interpretHeading && (
          <>
            <h2>{n.interpretHeading}</h2>
            <p style={{ whiteSpace: "pre-line" }}>{n.interpretBody}</p>
          </>
        )}

        {/* Sources */}
        {n.sourcesHeading && (
          <>
            <h2>{n.sourcesHeading}</h2>
            <ul className="doc-sources-list">
              {n.sourcesList.map((source, index) => (
                <li key={index}>{source}</li>
              ))}
            </ul>
          </>
        )}
      </article>
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/about">{nav.aboutShort}</Link> · <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
    </div>
  );
}
