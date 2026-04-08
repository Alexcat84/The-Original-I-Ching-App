"use client";

import { getCookieConsentUiMessages } from "@iching-oracle/i18n";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import DocumentLangSync from "@/components/DocumentLangSync";
import SessionDocLocaleBridge from "@/components/SessionDocLocaleBridge";
import { useAppLocale } from "@/lib/use-app-locale";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentValue,
  isCookieConsentValue,
} from "@/lib/cookie-consent";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type CookieConsentContextValue = {
  consent: CookieConsentValue | null;
  setConsent: (v: CookieConsentValue) => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function useCookieConsent(): CookieConsentContextValue | null {
  return useContext(CookieConsentContext);
}

function CookieConsentBanner({ onChoice }: { onChoice: (v: CookieConsentValue) => void }) {
  const locale = useAppLocale();
  const c = getCookieConsentUiMessages(locale);

  return (
    <div
      className="cookie-consent-bar"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-live="polite"
    >
      <div className="cookie-consent-inner">
        <p id="cookie-consent-title" className="cookie-consent-text">
          {c.bannerIntroBeforePrivacy}
          <Link href="/privacy">{c.bannerPrivacyLink}</Link>
          {c.bannerIntroAfterPrivacy}
        </p>
        <div className="cookie-consent-actions">
          <button
            type="button"
            className="cookie-consent-btn cookie-consent-btn--secondary"
            onClick={() => onChoice("essential")}
          >
            {c.necessaryOnly}
          </button>
          <button
            type="button"
            className="cookie-consent-btn cookie-consent-btn--primary"
            onClick={() => onChoice("all")}
          >
            {c.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CookieConsentGate({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<CookieConsentValue | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      if (isCookieConsentValue(raw)) {
        setConsentState(raw);
      }
    } catch {
      /* private mode */
    }
  }, []);

  const setConsent = useCallback((v: CookieConsentValue) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, v);
    } catch {
      /* */
    }
    setConsentState(v);
  }, []);

  return (
    <CookieConsentContext.Provider value={{ consent, setConsent }}>
      {hydrated ? <DocumentLangSync /> : null}
      {children}
      {hydrated && consent !== null ? <SessionDocLocaleBridge /> : null}
      {hydrated && consent === "all" ? (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}
      {hydrated && consent === null ? <CookieConsentBanner onChoice={setConsent} /> : null}
    </CookieConsentContext.Provider>
  );
}
