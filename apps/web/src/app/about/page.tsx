import type { Metadata } from "next";
import Link from "next/link";
import { getAppTraceabilityUiMessages, getDocNavUiMessages } from "@iching-oracle/i18n";
import { resolveDocLocale } from "@/lib/doc-locale";

export const metadata: Metadata = {
  title: "About — The Original I Ching App",
  description: "App version, build traceability, and credits for The Original I Ching App.",
  openGraph: {
    title: "About — The Original I Ching App",
    description: "App version, build traceability, and credits.",
  },
};

export default async function AboutPage() {
  const locale = await resolveDocLocale();
  const nav = getDocNavUiMessages(locale);
  const trace = getAppTraceabilityUiMessages(locale);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> · <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/notes">{nav.methodNotes}</Link> · <Link href="/faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/privacy">{nav.privacyShort}</Link> · <Link href="/terms">{nav.termsShort}</Link>
      </nav>
      <article className="doc-article">
        <h1 id="about-doc-title">{trace.aboutHeading}</h1>
        <section id="rn-app-trace-root" aria-labelledby="about-doc-title">
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
