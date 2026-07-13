"use client";

import { getDocNavUiMessages } from "@iching-oracle/i18n";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppLocale } from "@/lib/use-app-locale";
import { MarketingFooter } from "./MarketingFooter";
import { MarketingNav } from "./MarketingNav";

type NavKey = "oracle" | "guide" | "library" | "sources" | "pricing" | "faqs";

/**
 * Marketing-site shell for the documentation/legal pages: sticky nav + footer
 * around the existing localized `.doc-article` content. The `.mk-doc` class
 * re-maps the app theme variables to the dark-ink palette so the articles
 * (and their nested components like the audits timeline) render coherently
 * without touching their markup.
 *
 * Inside the APK WebView (html.iching-rn-webview) the marketing nav/footer are
 * hidden via CSS and the original inter-doc nav row is shown instead (back to
 * chat + the other docs), matching the pre-restructure APK experience — these
 * pages are reached from the chat's doc links there, not from the marketing site.
 */
export function MarketingDocShell({
  active,
  children,
}: {
  active?: NavKey;
  children: React.ReactNode;
}) {
  const locale = useAppLocale();
  const docNav = getDocNavUiMessages(locale);

  /* Hydration-safe APK detection. window.ReactNativeWebView is provided by the
     RN WebView at context creation, so it is immune to the html-class timing
     race (React hydration can rewrite <html className>). The CSS rules keyed
     on html.iching-rn-webview remain as a second layer. */
  const [inRnWebView, setInRnWebView] = useState(false);
  useEffect(() => {
    setInRnWebView(
      document.documentElement.classList.contains("iching-rn-webview") ||
        "ReactNativeWebView" in window,
    );
  }, []);

  /* APK WebView: restore the original inter-doc nav row (as before the
     marketing restructure) so users can jump between docs and back to the
     chat, styled by the app theme (globals.css .doc-nav), not the marketing
     chrome. Browser gets the marketing nav/footer instead. */
  const apkDocNav = (
    <nav className="doc-nav">
      <Link href="/chat">{docNav.backToOracle}</Link>
      {" · "}
      <Link href="/guia">{docNav.userGuide}</Link>
      {" · "}
      <Link href="/faqs">{docNav.faqs}</Link>
      {" · "}
      <Link href="/notes">{docNav.methodNotes}</Link>
      {" · "}
      <Link href="/audits">{docNav.fidelityAudits}</Link>
      {" · "}
      <Link href="/about">{docNav.aboutShort}</Link>
      {" · "}
      <Link href="/privacy">{docNav.privacyShort}</Link>
      {" · "}
      <Link href="/terms">{docNav.termsShort}</Link>
    </nav>
  );

  return (
    <div className="mk-root mk-doc">
      {inRnWebView ? null : <MarketingNav active={active} />}
      <main className="mk-doc-main">
        {inRnWebView ? apkDocNav : null}
        {children}
        {inRnWebView ? apkDocNav : null}
      </main>
      {inRnWebView ? null : <MarketingFooter />}
    </div>
  );
}
