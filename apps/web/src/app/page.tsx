import { getMarketingUiMessages } from "@iching-oracle/i18n";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { HexaglifoCanvas } from "@/components/marketing/HexaglifoCanvas";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingPricingCards } from "@/components/marketing/MarketingPricingCards";
import { MarketingReveal } from "@/components/marketing/MarketingReveal";
import { resolveDocLocale } from "@/lib/doc-locale";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveDocLocale();
  const m = getMarketingUiMessages(locale);
  return {
    title: "The Original I Ching App",
    description: m.hero.subtitle,
    ...buildCanonicalMetadata("/"),
  };
}

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.theoriginaliching.app";

/**
 * The installed APK loads BASE_URL ("/") in its WebView; the chat now lives at
 * /chat. Redirect before paint so existing APKs keep working without a mobile
 * release. The native shell marks the WebView with the `iching-rn-webview`
 * class and injects window.ReactNativeWebView.
 */
const rnWebViewGuardScript = `(function(){try{if(document.documentElement.classList.contains("iching-rn-webview")||("ReactNativeWebView" in window)){location.replace("/chat");}}catch(e){}})();`;

const STALK_ANGLES = [-26, -19, -12, -5, 2, 9, 16, 23];

export default async function MarketingHomePage() {
  const locale = await resolveDocLocale();
  const m = getMarketingUiMessages(locale);
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <div className="mk-root">
      {/* suppressHydrationWarning: browsers hide the nonce attribute from the DOM,
          so the client sees "" vs the SSR value — same pattern as the root layout. */}
      <script
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: rnWebViewGuardScript }}
      />
      <MarketingNav active="oracle" />

      {/* ================= HERO ================= */}
      <div id="oraculo" className="mk-hero">
        <div className="mk-hero-glow-a" />
        <div className="mk-hero-glow-b" />
        <HexaglifoCanvas locale={locale} />
        <div className="mk-hero-copy">
          <p className="mk-hero-eyebrow">{m.hero.eyebrow}</p>
          <h1 className="mk-hero-title">{m.hero.title}</h1>
          <p className="mk-hero-sub">{m.hero.subtitle}</p>
          <div className="mk-hero-cta-row">
            <Link href="/login?mode=signup" className="mk-btn-red">
              {m.hero.cta}
            </Link>
          </div>
          <div className="mk-hero-play-row">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mk-play-badge"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/marketing/google-play-badge.png" alt="Android app on Google Play" />
            </a>
            <span className="mk-hero-play-hint">{m.hero.playHint}</span>
          </div>
        </div>
        <div id="hexaglifo-anchor" className="mk-hero-canvas-anchor" />
      </div>

      {/* ================= DOS MODOS ================= */}
      <div className="mk-section">
        <div className="mk-section-head">
          <div>
            <p className="mk-eyebrow">{m.modes.eyebrow}</p>
            <h2 className="mk-h2">{m.modes.title}</h2>
          </div>
          <span className="mk-section-head-glyphs">錢 · 骨</span>
        </div>
        <MarketingReveal className="mk-modes-grid">
          <div className="mk-mode-card mk-mode-card--gold">
            <div className="mk-mode-glow-gold" />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 34, flexWrap: "wrap" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/marketing/mode-iching-coin.png" alt="" className="mk-mode-coin" />
              <div className="mk-stalks" aria-hidden="true">
                {STALK_ANGLES.map((deg, i) => (
                  <div
                    key={deg}
                    className="mk-stalk-pivot"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <div
                      className="mk-stalk"
                      style={{ animationDelay: `${i * 0.3}s, ${i * 0.2}s` }}
                    />
                  </div>
                ))}
                <div className="mk-stalk-base" />
              </div>
            </div>
            <h3 className="mk-mode-title mk-mode-title--gold">
              {m.modes.ichingTitle} <span className="mk-cn">易經</span>
            </h3>
            <p className="mk-mode-desc">{m.modes.ichingDesc}</p>
            <div className="mk-mode-methods">
              <div className="mk-mode-method">
                <span className="mk-cn">錢</span>
                <span className="mk-mode-method-label">{m.modes.coinsLabel}</span>
                <span className="mk-mode-method-hint">{m.modes.coinsHint}</span>
              </div>
              <div className="mk-mode-method">
                <span className="mk-cn">蓍</span>
                <span className="mk-mode-method-label">{m.modes.yarrowLabel}</span>
                <span className="mk-mode-method-hint">{m.modes.yarrowHint}</span>
              </div>
            </div>
            <p className="mk-mode-cta-gold">
              <Link href="/login?mode=signup" style={{ color: "inherit" }}>
                {m.modes.ichingCta}
              </Link>
            </p>
          </div>
          <div className="mk-mode-card mk-mode-card--red">
            <div className="mk-mode-glow-red" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marketing/mode-bones-symbol.png" alt="" className="mk-mode-bone" />
            <h3 className="mk-mode-title mk-mode-title--red">
              {m.modes.bonesTitle} <span className="mk-cn">甲骨</span>
            </h3>
            <p className="mk-mode-desc">{m.modes.bonesDesc}</p>
            <p className="mk-mode-cta-red">
              <Link href="/login?mode=signup" style={{ color: "inherit" }}>
                {m.modes.bonesCta}
              </Link>
            </p>
          </div>
        </MarketingReveal>
      </div>

      {/* ================= EL RITUAL ================= */}
      <div id="guia" className="mk-section mk-section--alt">
        <div className="mk-section-head">
          <div>
            <p className="mk-eyebrow">{m.ritual.eyebrow}</p>
            <h2 className="mk-h2">{m.ritual.title}</h2>
          </div>
          <span className="mk-section-head-glyphs">問 · 選 · 擲 · 讀 · 話</span>
        </div>
        <MarketingReveal className="mk-ritual-grid">
          {(
            [
              ["一", "問", m.ritual.step1Title, m.ritual.step1Desc],
              ["二", "選", m.ritual.step2Title, m.ritual.step2Desc],
              ["三", "擲", m.ritual.step3Title, m.ritual.step3Desc],
              ["四", "讀", m.ritual.step4Title, m.ritual.step4Desc],
              ["五", "話", m.ritual.step5Title, m.ritual.step5Desc],
            ] as const
          ).map(([num, glyph, title, desc]) => (
            <div key={glyph} className="mk-ritual-card">
              <span className="mk-ritual-num">{num}</span>
              <h3 className="mk-ritual-title">
                {title} <span className="mk-cn">{glyph}</span>
              </h3>
              <p className="mk-ritual-desc">{desc}</p>
            </div>
          ))}
        </MarketingReveal>
        <p style={{ margin: "40px 0 0" }}>
          <Link href="/guia" className="mk-link-red">
            {m.ritual.guideCta}
          </Link>
        </p>
      </div>

      {/* ================= BIBLIOTECA ================= */}
      <div id="biblioteca" className="mk-section">
        <div className="mk-section-head" style={{ marginBottom: 20 }}>
          <div>
            <p className="mk-eyebrow">{m.library.eyebrow}</p>
            <h2 className="mk-h2">{m.library.title}</h2>
          </div>
        </div>
        <p className="mk-library-sub">{m.library.subtitle}</p>
        <div className="mk-library-grid">
          <div className="mk-library-sample">
            <div className="mk-library-sample-head">
              <div className="mk-library-tabs">
                <span className="mk-library-tab mk-library-tab--active">Wilhelm</span>
                <span className="mk-library-tab">Legge</span>
                <span className="mk-library-tab">周易</span>
              </div>
              <span className="mk-library-badge">{m.library.sampleBadge}</span>
            </div>
            <div className="mk-library-sample-body">
              <div className="mk-library-hexcol">
                <span className="mk-library-hexglyph">乾</span>
                <div className="mk-library-lines" aria-hidden="true">
                  {[0.9, 0.75, 0.6, 0.45, 0.3, 0.15].map((delay) => (
                    <div
                      key={delay}
                      className="mk-library-line"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
                <p className="mk-library-trigrams">{m.library.sampleTrigrams}</p>
              </div>
              <div>
                <p className="mk-library-hexname">{m.library.sampleHexName}</p>
                <p className="mk-library-judgment">{m.library.sampleJudgment}</p>
                <p className="mk-library-desc">{m.library.sampleJudgmentDesc}</p>
                <div className="mk-library-fade-wrap">
                  <p className="mk-library-fade">{m.library.sampleLinesTeaser}</p>
                  <div className="mk-library-unlock-row">
                    <Link href="/login?mode=signup" className="mk-library-unlock">
                      {m.library.unlockCta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mk-library-index">
            <p className="mk-library-index-heading">{m.library.indexHeading}</p>
            <div>
              {(
                [
                  ["乾", m.library.indexHex1],
                  ["坤", m.library.indexHex2],
                  ["泰", m.library.indexHex11],
                  ["既濟", m.library.indexHex63],
                  ["未濟", m.library.indexHex64],
                ] as const
              ).map(([glyph, name]) => (
                <div key={glyph} className="mk-library-index-row">
                  <span className="mk-cn">{glyph}</span>
                  <span className="mk-library-index-name">{name}</span>
                  <span className="mk-library-index-diamond">◆</span>
                </div>
              ))}
            </div>
            <p className="mk-library-index-legend">
              <span style={{ color: "var(--mk-gold)" }}>◆</span> {m.library.indexLegend}
            </p>
            <p style={{ margin: "18px 0 0" }}>
              <Link href="/login?mode=signup" className="mk-link-red" style={{ fontSize: 13 }}>
                {m.library.viewLibraryCta}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ================= FUENTES / DOCS ================= */}
      <div id="docs" className="mk-section mk-section--alt">
        <div className="mk-sources-grid">
          <div>
            <p className="mk-eyebrow">{m.sources.eyebrow}</p>
            <h2 className="mk-h2" style={{ lineHeight: 1.25 }}>
              {m.sources.title}
            </h2>
            <p className="mk-sources-intro-sub">{m.sources.subtitle}</p>
          </div>
          <MarketingReveal className="mk-sources-cards">
            <Link href="/notes" className="mk-source-card mk-source-card--gold">
              <span className="mk-source-vert" style={{ color: "rgba(201,162,75,.4)" }}>
                德文譯本
              </span>
              <p className="mk-source-year" style={{ color: "var(--mk-gold)" }}>
                1924
              </p>
              <div
                className="mk-source-rule"
                style={{ background: "linear-gradient(90deg,#c9a24b,transparent)" }}
              />
              <h3 className="mk-source-name">Richard Wilhelm</h3>
              <p className="mk-source-detail">{m.sources.wilhelmDetail}</p>
            </Link>
            <Link href="/notes" className="mk-source-card mk-source-card--ivory">
              <span className="mk-source-vert" style={{ color: "rgba(239,232,220,.35)" }}>
                英文譯本
              </span>
              <p className="mk-source-year" style={{ color: "#e5dccd" }}>
                1882
              </p>
              <div
                className="mk-source-rule"
                style={{ background: "linear-gradient(90deg,#e5dccd,transparent)" }}
              />
              <h3 className="mk-source-name">James Legge</h3>
              <p className="mk-source-detail">{m.sources.leggeDetail}</p>
            </Link>
            <Link href="/notes" className="mk-source-card mk-source-card--red">
              <span className="mk-source-vert" style={{ color: "rgba(197,61,46,.5)" }}>
                原文正典
              </span>
              <p className="mk-source-year mk-source-year--zhouyi">周易</p>
              <div
                className="mk-source-rule"
                style={{ background: "linear-gradient(90deg,#c53d2e,transparent)" }}
              />
              <h3 className="mk-source-name">Zhou Yi</h3>
              <p className="mk-source-detail">{m.sources.zhouyiDetail}</p>
            </Link>
          </MarketingReveal>
        </div>
        <div id="auditorias" className="mk-audits-box">
          <div className="mk-audits-head">
            <p>{m.sources.auditsHeading}</p>
            <Link href="/audits" className="mk-link-red" style={{ fontSize: 13 }}>
              {m.sources.auditsCta}
            </Link>
          </div>
          {(
            [
              ["30 jun 2026", m.sources.auditRow1Title, m.sources.auditRow1Detail],
              ["25 jun 2026", m.sources.auditRow2Title, m.sources.auditRow2Detail],
              ["25 jun 2026", m.sources.auditRow3Title, m.sources.auditRow3Detail],
              ["23 jun 2026", m.sources.auditRow4Title, m.sources.auditRow4Detail],
            ] as const
          ).map(([date, title, detail]) => (
            <div key={title} className="mk-audit-row">
              <span className="mk-audit-date">{date}</span>
              <span className="mk-audit-title">{title}</span>
              <span className="mk-audit-detail">{detail}</span>
              <span className="mk-audit-status">{m.sources.statusCurrent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PRECIOS ================= */}
      <div id="precios" className="mk-section">
        <div className="mk-pricing-grid">
          <div>
            <p className="mk-eyebrow">{m.pricing.eyebrow}</p>
            <h2 className="mk-h2" style={{ lineHeight: 1.3 }}>
              {m.pricing.title}
            </h2>
            <p className="mk-pricing-sub">{m.pricing.subtitle}</p>
            <Link href="/login?mode=signup" className="mk-pricing-free-cta">
              {m.pricing.registerFreeCta}
            </Link>
          </div>
          <MarketingPricingCards />
        </div>
      </div>

      {/* ================= FAQ ================= */}
      <div id="faqs" className="mk-section mk-section--alt">
        <div className="mk-faq-grid">
          <div>
            <p className="mk-eyebrow">{m.faq.eyebrow}</p>
            <h2 className="mk-h2" style={{ lineHeight: 1.3 }}>
              {m.faq.title}
            </h2>
            <p style={{ margin: "22px 0 0" }}>
              <Link href="/faqs" className="mk-link-red">
                {m.faq.viewAllCta}
              </Link>
            </p>
          </div>
          <div>
            <details className="mk-faq-item" open>
              <summary>
                {m.faq.q1}
                <span className="mk-faq-plus">−</span>
              </summary>
              <p className="mk-faq-answer">{m.faq.a1}</p>
            </details>
            {[m.faq.q2, m.faq.q3, m.faq.q4].map((q) => (
              <Link
                key={q}
                href="/faqs"
                className="mk-faq-item"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span style={{ fontSize: 17, color: "#e5dccd" }}>{q}</span>
                <span className="mk-faq-plus">+</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ================= CTA FINAL ================= */}
      <div className="mk-final">
        <div className="mk-final-glow" />
        <div className="mk-final-inner">
          <h2 className="mk-final-title">{m.finalCta.title}</h2>
          <p className="mk-final-sub">{m.finalCta.subtitle}</p>
          <div className="mk-final-cta-row">
            <Link
              href="/login?mode=signup"
              className="mk-btn-red"
              style={{ padding: "17px 48px", fontSize: 15 }}
            >
              {m.finalCta.registerCta}
            </Link>
          </div>
          <p className="mk-final-free">{m.finalCta.freeLine}</p>
          <div className="mk-final-play">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mk-play-badge"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/marketing/google-play-badge.png" alt="Android app on Google Play" />
            </a>
          </div>
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
