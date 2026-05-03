import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Origen e Historia de los Métodos — The Original I Ching App",
  description:
    "Historia académica del I Ching (Zhouyi) y los Huesos de Oráculo Shang. Métodos auténticos, fuentes originales, sin invención.",
  openGraph: {
    title: "Origen e Historia de los Métodos — The Original I Ching App",
    description:
      "Historia académica del I Ching (Zhouyi) y los Huesos de Oráculo Shang. Métodos auténticos, fuentes originales, sin invención.",
  },
};

import { getDocNavUiMessages, getNotesPageUiMessages } from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function NotesPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const n = getNotesPageUiMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/faqs">{nav.faqs}</Link> · <Link href="/about">{nav.aboutShort}</Link> ·{" "}
        <Link href="/privacy">{nav.privacyShort}</Link> · <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{n.title}</h1>
        <p className="doc-lead">{n.lead}</p>
        <p className="doc-auth-notice">{n.authNotice}</p>

        {/* ── I Ching ── */}
        <h2>{n.ichingHeading}</h2>

        <h3>{n.ichingOriginHeading}</h3>
        <p>{n.ichingOriginBody}</p>

        <h3>{n.ichingHexHeading}</h3>
        <p>{n.ichingHexBody}</p>

        <h3>{n.ichingMethodHeading}</h3>
        <p>{n.ichingMethodBody}</p>

        <h3>{n.ichingWilhelmHeading}</h3>
        <p>{n.ichingWilhelmBody}</p>

        <h3>{n.ichingChainHeading}</h3>
        <p>{n.ichingChain}</p>

        {/* ── Oracle Bones ── */}
        <h2>{n.bonesHeading}</h2>

        <h3>{n.bonesOriginHeading}</h3>
        <p>{n.bonesOriginBody}</p>

        <h3>{n.bonesRitualHeading}</h3>
        <p>{n.bonesRitualBody}</p>

        <h3>{n.bonesVerdictsHeading}</h3>
        <ul>
          <li>{n.bonesVerdictAuspClear}</li>
          <li>{n.bonesVerdictAuspMod}</li>
          <li>{n.bonesVerdictInauspMod}</li>
          <li>{n.bonesVerdictInauspClear}</li>
          <li>{n.bonesVerdictSilence}</li>
        </ul>

        <h3>{n.bonesAuthHeading}</h3>
        <p>{n.bonesAuthBody}</p>

        {/* ── Interpretation ── */}
        <h2>{n.interpretHeading}</h2>
        <p>{n.interpretBody}</p>

        {/* ── Sources ── */}
        <h2>{n.sourcesHeading}</h2>
        <ul>
          <li>
            <a href="https://en.wikipedia.org/wiki/I_Ching" target="_blank" rel="noopener noreferrer">
              I Ching (Zhouyi 周易) — Wikipedia
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Oracle_bone_script" target="_blank" rel="noopener noreferrer">
              Oracle bone script (甲骨文) — Wikipedia
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Chinese_pyromancy" target="_blank" rel="noopener noreferrer">
              Chinese pyromancy — Wikipedia
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Zhu_Xi" target="_blank" rel="noopener noreferrer">
              Zhu Xi (朱熹) — Wikipedia
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Richard_Wilhelm_(sinologist)" target="_blank" rel="noopener noreferrer">
              Richard Wilhelm — Wikipedia
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Shang_dynasty" target="_blank" rel="noopener noreferrer">
              Shang dynasty (商朝) — Wikipedia
            </a>
          </li>
        </ul>
      </article>
    </div>
  );
}
