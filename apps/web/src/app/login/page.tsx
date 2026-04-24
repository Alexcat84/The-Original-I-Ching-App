"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { useAppLocale } from "@/lib/use-app-locale";
import {
  formatLoginConfigErrorBody,
  formatLoginRegisterApiError,
  getDocNavUiMessages,
  getLoginPageUiMessages,
  getPrivacyPageMessages,
  getTermsPageMessages,
} from "@iching-oracle/i18n";
import { LegalConsentModal } from "@/components/LegalConsentModal";
import {
  createLegalConsentPayload,
  isCurrentLegalConsentPayload,
  LEGAL_CONSENT_PENDING_STORAGE_KEY,
  type LegalConsentPayload,
} from "@/lib/legal-consent";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

function GoogleGlyph() {
  return (
    <svg className="auth-pro-google-icon" viewBox="0 0 24 24" width={20} height={20} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function isEmailNotConfirmedError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("email not confirmed") || lower.includes("email_not_confirmed");
}

export default function LoginPage() {
  type RegisterModalKind = "verify" | "exists";
  type PendingLegalAction = "email_signup" | "google_oauth";
  const router = useRouter();
  const locale = useAppLocale();
  const L = useMemo(() => getLoginPageUiMessages(locale), [locale]);
  const nav = useMemo(() => getDocNavUiMessages(locale), [locale]);
  const privacy = useMemo(() => getPrivacyPageMessages(locale), [locale]);
  const terms = useMemo(() => getTermsPageMessages(locale), [locale]);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [registerModalKind, setRegisterModalKind] = useState<RegisterModalKind | null>(null);
  const [legalConsent, setLegalConsent] = useState<LegalConsentPayload | null>(null);
  const [pendingLegalAction, setPendingLegalAction] = useState<PendingLegalAction | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(false);
  const turnstileTokenRef = useRef("");
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileHostRef = useRef<HTMLDivElement | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  function switchMode(nextMode: "signin" | "signup") {
    setMode(nextMode);
    setPassword("");
    setErr(null);
    setMsg(null);
  }

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      setConfigError(true);
      return;
    }
    const sb = getSupabaseBrowser();
    void sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) router.replace("/");
    });
  }, [router]);

  useEffect(() => {
    if (!turnstileSiteKey || mode !== "signup") {
      const id = turnstileWidgetIdRef.current;
      if (id && window.turnstile) {
        try {
          window.turnstile.reset(id);
        } catch {
          // ignore
        }
      }
      turnstileWidgetIdRef.current = null;
      return;
    }

    const host = turnstileHostRef.current;
    if (!host) return;

    let cancelled = false;

    const mountWidget = () => {
      if (cancelled || !turnstileHostRef.current || !window.turnstile) return;
      const el = turnstileHostRef.current;
      el.innerHTML = "";
      turnstileWidgetIdRef.current = window.turnstile.render(el, {
        sitekey: turnstileSiteKey,
        callback: (token: string) => {
          turnstileTokenRef.current = token;
        },
        "error-callback": () => {
          turnstileTokenRef.current = "";
        },
      });
    };

    const existing = document.querySelector('script[src*="turnstile/v0/api"]');
    if (existing) {
      mountWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => mountWidget();
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      const id = turnstileWidgetIdRef.current;
      if (id && window.turnstile) {
        try {
          window.turnstile.reset(id);
        } catch {
          // ignore
        }
      }
      turnstileWidgetIdRef.current = null;
    };
  }, [turnstileSiteKey, mode]);

  async function onSignIn(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!isSupabaseBrowserConfigured()) return;
    setLoading(true);
    try {
      const sb = getSupabaseBrowser();
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        if (isEmailNotConfirmedError(error.message)) {
          setErr(L.errEmailNotConfirmed);
          return;
        }
        setErr(error.message);
        return;
      }
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setMsg(null);
    if (!isCurrentLegalConsentPayload(legalConsent)) {
      setPendingLegalAction("google_oauth");
      return;
    }
    await startGoogleOAuth(createLegalConsentPayload("google_oauth"));
  }

  async function startGoogleOAuth(consent: LegalConsentPayload) {
    if (!isSupabaseBrowserConfigured()) return;
    setLoading(true);
    try {
      try {
        sessionStorage.setItem(LEGAL_CONSENT_PENDING_STORAGE_KEY, JSON.stringify(consent));
      } catch {
        // If storage is blocked, callback cannot persist consent; fail before OAuth.
        setErr(L.errNetwork);
        return;
      }
      const sb = getSupabaseBrowser();
      const origin = window.location.origin;
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/auth/callback` },
      });
      if (error) setErr(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!isCurrentLegalConsentPayload(legalConsent)) {
      setPendingLegalAction("email_signup");
      return;
    }
    await registerWithEmail(createLegalConsentPayload("email_signup"));
  }

  async function registerWithEmail(consent: LegalConsentPayload) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          turnstileToken: turnstileTokenRef.current,
          legalConsent: consent,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        reason?: string;
        message?: string;
      };
      if (!res.ok) {
        if (data.error === "email_exists") {
          setPendingVerificationEmail(email.trim());
          setRegisterModalKind("exists");
          switchMode("signin");
          return;
        }
        setErr(formatLoginRegisterApiError(L, data));
        return;
      }
      const normalizedEmail = email.trim();
      setPendingVerificationEmail(normalizedEmail);
      setRegisterModalKind("verify");
      setMsg(null);
      setErr(null);
      switchMode("signin");
    } catch {
      setErr(L.errNetwork);
    } finally {
      setLoading(false);
    }
  }

  async function acceptLegalConsentAndContinue() {
    if (!pendingLegalAction) return;
    const action = pendingLegalAction;
    const consent = createLegalConsentPayload(action);
    setLegalConsent(consent);
    setPendingLegalAction(null);
    setErr(null);
    setMsg(null);
    if (action === "google_oauth") {
      await startGoogleOAuth(consent);
    } else {
      await registerWithEmail(consent);
    }
  }

  function cancelLegalConsent() {
    setPendingLegalAction(null);
    setErr(L.legalConsentRequired);
  }

  function closeRegisterModal() {
    setRegisterModalKind(null);
    setMode("signin");
  }

  async function onResendConfirmation() {
    setErr(null);
    setMsg(null);
    if (!isSupabaseBrowserConfigured()) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErr(L.errResendNeedEmail);
      return;
    }
    setLoading(true);
    try {
      const sb = getSupabaseBrowser();
      const origin = window.location.origin;
      const { error } = await sb.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (error) {
        setErr(error.message);
        return;
      }
      setMsg(L.msgResendOk);
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword() {
    setErr(null);
    setMsg(null);
    if (!isSupabaseBrowserConfigured()) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setErr(L.errResetNeedEmail);
      return;
    }
    setLoading(true);
    try {
      const sb = getSupabaseBrowser();
      const origin = window.location.origin;
      const { error } = await sb.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${origin}/auth/callback`,
      });
      if (error) {
        setErr(error.message);
        return;
      }
      setMsg(L.msgResetOk);
    } finally {
      setLoading(false);
    }
  }

  if (configError) {
    return (
      <div className="auth-pro-shell">
        <div className="auth-pro-form-panel auth-pro-form-panel--solo">
          <div className="auth-pro-card">
            <h1 className="auth-pro-heading">{L.configErrorTitle}</h1>
            <p className="auth-pro-lead auth-pro-err">{formatLoginConfigErrorBody(L)}</p>
            <Link href="/" className="auth-pro-text-link">
              {L.backToOracle}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-pro-shell">
      <aside className="auth-pro-brand" aria-hidden={false}>
        <div className="auth-pro-brand-inner">
          <p className="auth-pro-brand-eyebrow" lang="zh-Hant">
            周易
          </p>
          <h1 className="auth-pro-brand-title">The Original I Ching</h1>
          <p className="auth-pro-brand-text">{L.brandSubtitle}</p>
        </div>
      </aside>

      <div className="auth-pro-form-panel">
        <div className="auth-pro-card">
          <div className="auth-pro-tabs" role="tablist" aria-label={L.tablistAria}>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              className={`auth-pro-tab ${mode === "signin" ? "active" : ""}`}
              onClick={() => {
                switchMode("signin");
              }}
            >
              {L.signInTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={`auth-pro-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => {
                switchMode("signup");
              }}
            >
              {L.signUpTab}
            </button>
          </div>

          {mode === "signin" ? (
            <form onSubmit={onSignIn} className="auth-pro-form">
              <p className="auth-pro-lead">{L.signInLead}</p>
              <div className="auth-pro-field">
                <label htmlFor="auth-email">{L.emailLabel}</label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={L.emailPlaceholder}
                  required
                />
              </div>
              <div className="auth-pro-field">
                <label htmlFor="auth-password">{L.passwordLabel}</label>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={L.passwordPlaceholderSignin}
                  required
                />
              </div>
              <div className="auth-pro-actions-row">
                <button
                  type="button"
                  className="auth-pro-inline-btn"
                  onClick={() => void onForgotPassword()}
                  disabled={loading}
                >
                  {L.forgotPassword}
                </button>
                <button
                  type="button"
                  className="auth-pro-inline-btn"
                  onClick={() => void onResendConfirmation()}
                  disabled={loading}
                >
                  {L.resendConfirmation}
                </button>
              </div>
              <button type="submit" className="auth-pro-btn auth-pro-btn-primary" disabled={loading}>
                {loading ? L.signingIn : L.signInSubmit}
              </button>
            </form>
          ) : (
            <form onSubmit={onRegister} className="auth-pro-form">
              <p className="auth-pro-lead">{L.signUpLead}</p>
              <div className="auth-pro-field">
                <label htmlFor="auth-email-su">{L.emailLabel}</label>
                <input
                  id="auth-email-su"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={L.emailPlaceholder}
                  required
                />
              </div>
              <div className="auth-pro-field">
                <label htmlFor="auth-password-su">{L.passwordLabel}</label>
                <input
                  id="auth-password-su"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={L.passwordPlaceholderSignup}
                  required
                  minLength={8}
                />
              </div>
              <div
                ref={turnstileHostRef}
                className="auth-pro-turnstile"
                style={{ display: turnstileSiteKey ? "flex" : "none" }}
                aria-hidden={!turnstileSiteKey}
              />
              <button type="submit" className="auth-pro-btn auth-pro-btn-primary" disabled={loading}>
                {loading ? L.sending : L.registerSubmit}
              </button>
            </form>
          )}

          <div className="auth-pro-divider">
            <span>{L.dividerOr}</span>
          </div>

          <button type="button" className="auth-pro-btn auth-pro-btn-google" disabled={loading} onClick={() => void onGoogle()}>
            <GoogleGlyph />
            {L.continueGoogle}
          </button>

          {err ? <p className="auth-pro-err">{err}</p> : null}
          {msg ? <p className="auth-pro-msg">{msg}</p> : null}

          <Link href="/" className="auth-pro-text-link auth-pro-back">
            {L.backToOracle}
          </Link>
        </div>
      </div>

      {pendingLegalAction ? (
        <LegalConsentModal
          login={L}
          nav={nav}
          privacy={privacy}
          terms={terms}
          busy={loading}
          onAccept={() => void acceptLegalConsentAndContinue()}
          onCancel={cancelLegalConsent}
        />
      ) : null}

      {registerModalKind ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(5, 8, 14, 0.78)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              width: "min(460px, 94vw)",
              borderRadius: 14,
              border: "1px solid rgba(84,160,186,0.35)",
              background: "linear-gradient(180deg, rgba(16,31,45,0.98), rgba(9,20,31,0.98))",
              boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
              padding: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <strong style={{ color: "#d8edf5" }}>
                {registerModalKind === "verify" ? L.modalVerifyTitle : L.modalExistsTitle}
              </strong>
              <button type="button" className="modal-close-x" aria-label={L.closeModalAria} onClick={closeRegisterModal}>
                ×
              </button>
            </div>
            <p className="auth-pro-msg" style={{ marginTop: 10 }}>
              {registerModalKind === "verify" ? (
                <>
                  {L.modalVerifyLine1} <strong>{pendingVerificationEmail}</strong>.
                  <br />
                  {L.modalVerifyLine2}
                </>
              ) : (
                <>
                  {L.modalExistsLine1} <strong>{pendingVerificationEmail}</strong> {L.modalExistsLine2}
                </>
              )}
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="auth-pro-btn auth-pro-btn-primary" onClick={closeRegisterModal}>
                {L.modalOk}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
