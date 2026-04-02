import Link from "next/link";
import { getDocNavUiMessages, getNotesPageUiMessages } from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function NotesPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const n = getNotesPageUiMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.quickGuide}</Link> ·{" "}
        <Link href="/quickstart">{nav.quickstart}</Link> · <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
        <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1>{n.title}</h1>
        <p className="doc-lead">{n.lead}</p>

        <h2>{n.ichingHeading}</h2>
        <p>{n.ichingBody}</p>

        <h2>{n.bonesHeading}</h2>
        <p>{n.bonesBody}</p>

        <h2>{n.interpretHeading}</h2>
        <ul>
          <li>{n.interpretLi1}</li>
          <li>{n.interpretLi2}</li>
          <li>{n.interpretLi3}</li>
        </ul>

        <h2>{n.sourcesHeading}</h2>
        <ul>
          <li>
            <a href="https://en.wikipedia.org/wiki/I_Ching" target="_blank" rel="noopener noreferrer">
              I Ching (Zhouyi 周易)
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Oracle_bone_script" target="_blank" rel="noopener noreferrer">
              Oracle bone script (甲骨文)
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Chinese_pyromancy" target="_blank" rel="noopener noreferrer">
              Chinese pyromancy
            </a>
          </li>
        </ul>
      </article>
    </div>
  );
}
