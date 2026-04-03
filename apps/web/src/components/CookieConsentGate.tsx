"use client";

import { UI_LOCALE_STORAGE_KEY } from "@iching-oracle/i18n";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import SessionDocLocaleBridge from "@/components/SessionDocLocaleBridge";
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
  const [isSpanish, setIsSpanish] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(UI_LOCALE_STORAGE_KEY);
      setIsSpanish(raw === "es");
    } catch {
      setIsSpanish(false);
    }
  }, []);

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
          {isSpanish ? (
            <>
              Usamos cookies necesarias para la sesión y el idioma en las páginas legales; si aceptas, también
              analítica para mejorar el servicio. Más detalle en{" "}
              <Link href="/privacy">privacidad</Link>.
            </>
          ) : (
            <>
              We use necessary cookies for session and language on legal pages; if you accept, we also use
              analytics to improve the service. See{" "}
              <Link href="/privacy">privacy</Link>.
            </>
          )}
        </p>
        <div className="cookie-consent-actions">
          <button
            type="button"
            className="cookie-consent-btn cookie-consent-btn--secondary"
            onClick={() => onChoice("essential")}
          >
            {isSpanish ? "Solo necesarias" : "Necessary only"}
          </button>
          <button
            type="button"
            className="cookie-consent-btn cookie-consent-btn--primary"
            onClick={() => onChoice("all")}
          >
            {isSpanish ? "Aceptar todas" : "Accept all"}
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
