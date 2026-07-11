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
 * hidden via CSS and a plain back-to-chat link is shown instead — these pages
 * are reached from the chat's doc links there, not from the marketing site.
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

  return (
    <div className="mk-root mk-doc">
      {inRnWebView ? null : <MarketingNav active={active} />}
      <main className="mk-doc-main">
        {inRnWebView ? (
          <Link href="/chat" className="mk-doc-apk-back" style={{ display: "inline-block" }}>
            {docNav.backToOracle}
          </Link>
        ) : null}
        {children}
      </main>
      {inRnWebView ? null : <MarketingFooter />}
    </div>
  );
}
