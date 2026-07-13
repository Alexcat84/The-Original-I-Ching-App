import type { Metadata } from "next";
import { getAppTraceabilityUiMessages } from "@iching-oracle/i18n";
import { MarketingDocShell } from "@/components/marketing/MarketingDocShell";
import { resolveDocLocale } from "@/lib/doc-locale";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";

export const metadata: Metadata = {
  title: "About | The Original I Ching App",
  description: "App version, build traceability, and credits for The Original I Ching App.",
  openGraph: {
    title: "About | The Original I Ching App",
    description: "App version, build traceability, and credits.",
  },
  ...buildCanonicalMetadata("/about"),
};

export default async function AboutPage() {
  const locale = await resolveDocLocale();
  const trace = getAppTraceabilityUiMessages(locale);

  return (
    <MarketingDocShell>
      <div className="oracle-shell doc-page">
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
                  <dd id="rn-trace-version">…</dd>
                </div>
                <div className="apk-trace-row">
                  <dt>{trace.androidVersionCodeLabel}</dt>
                  <dd id="rn-trace-code">…</dd>
                </div>
              </div>
            </dl>
            <p className="apk-trace-rights">{trace.rightsLine}</p>
          </section>
        </article>
      </div>
    </MarketingDocShell>
  );
}
