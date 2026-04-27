"use client";

import type {
  DocNavUiMessages,
  LoginPageUiMessages,
  PrivacyPageMessages,
  TermsPageMessages,
} from "@iching-oracle/i18n";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PrivacyArticleContent } from "@/components/legal/PrivacyArticleContent";
import { TermsArticleContent } from "@/components/legal/TermsArticleContent";

type LegalConsentModalProps = {
  login: LoginPageUiMessages;
  nav: DocNavUiMessages;
  privacy: PrivacyPageMessages;
  terms: TermsPageMessages;
  busy: boolean;
  onAccept: () => void;
  onCancel: () => void;
};

export function LegalConsentModal({
  login,
  nav,
  privacy,
  terms,
  busy,
  onAccept,
  onCancel,
}: LegalConsentModalProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [canAccept, setCanAccept] = useState(false);

  function updateCanAccept() {
    const el = scrollRef.current;
    if (!el) return;
    setCanAccept(Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight - 24);
  }

  function scheduleCanAcceptUpdate() {
    window.setTimeout(updateCanAccept, 0);
  }

  useEffect(() => {
    updateCanAccept();
    const root = scrollRef.current;
    const end = endRef.current;
    if (!root || !end) return undefined;
    root.focus({ preventScroll: true });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setCanAccept(true);
      },
      { root, threshold: 0.95 },
    );
    observer.observe(end);
    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setCanAccept(true);
      },
      { threshold: 0.95 },
    );
    viewportObserver.observe(end);
    const id = window.setTimeout(updateCanAccept, 50);
    return () => {
      window.clearTimeout(id);
      observer.disconnect();
      viewportObserver.disconnect();
    };
  }, []);

  return (
    <div className="legal-consent-backdrop" role="presentation">
      <section
        className="legal-consent-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-consent-title"
        aria-describedby="legal-consent-intro legal-consent-status"
      >
        <header className="legal-consent-header">
          <div>
            <h2 id="legal-consent-title" className="legal-consent-title">
              {login.legalConsentTitle}
            </h2>
            <p id="legal-consent-intro" className="legal-consent-intro">
              {login.legalConsentIntro}
            </p>
          </div>
          <button
            type="button"
            className="legal-consent-close"
            aria-label={login.legalConsentCloseAria}
            onClick={onCancel}
            disabled={busy}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <nav className="legal-consent-links" aria-label={login.legalConsentTitle}>
          <Link href="/privacy">
            {nav.privacyPolicy}
          </Link>
          <Link href="/terms">
            {nav.termsOfService}
          </Link>
        </nav>

        <div
          ref={scrollRef}
          className="legal-consent-scroll"
          tabIndex={0}
          onScroll={updateCanAccept}
          onWheel={scheduleCanAcceptUpdate}
          onTouchEnd={scheduleCanAcceptUpdate}
          onKeyUp={scheduleCanAcceptUpdate}
        >
          <article className="doc-article">
            <PrivacyArticleContent messages={privacy} nav={nav} />
          </article>
          <article className="doc-article">
            <TermsArticleContent messages={terms} nav={nav} />
          </article>
          <div ref={endRef} aria-hidden="true" style={{ height: 1 }} />
        </div>

        <footer className="legal-consent-footer">
          <p id="legal-consent-status" className="legal-consent-status">
            {canAccept ? login.legalConsentReady : login.legalConsentPendingScroll}
          </p>
          <button
            type="button"
            className="auth-pro-btn auth-pro-btn-primary legal-consent-accept"
            disabled={!canAccept || busy}
            onClick={onAccept}
          >
            {busy ? login.sending : login.legalConsentAccept}
          </button>
        </footer>
      </section>
    </div>
  );
}
