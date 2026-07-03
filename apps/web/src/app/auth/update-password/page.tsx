"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { useAppLocale } from "@/lib/use-app-locale";
import { getTwoFactorUiMessages, getUpdatePasswordUiMessages } from "@iching-oracle/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PageState =
  | "init"
  | "expired"
  | "load-error"
  | "loading-2fa"
  | "2fa-totp"
  | "2fa-email"
  | "form"
  | "done";

function resolveVerifyError(
  code: string | undefined,
  TF: ReturnType<typeof getTwoFactorUiMessages>,
): string {
  switch (code) {
    case "TWO_FACTOR_LOCKED":
      return TF.challengeLocked;
    case "TWO_FACTOR_INVALID_CODE":
      return TF.challengeInvalidCode;
    case "TWO_FACTOR_EMAIL_CODE_MISSING":
      return TF.challengeEmailMissing;
    case "TWO_FACTOR_EMAIL_CODE_EXPIRED":
      return TF.challengeEmailExpired;
    case "TWO_FACTOR_EMAIL_NOT_CONFIGURED":
      return TF.challengeEmailServerMisconfig;
    case "TWO_FACTOR_SECRET_DECRYPT_FAILED":
      return TF.challengeDecryptFailed;
    case "TWO_FACTOR_METHOD_NOT_LINKED":
      return TF.challengeMethodNotLinked;
    default:
      return TF.challengeVerifyFailed;
  }
}

function resolveSendError(
  code: string | undefined,
  TF: ReturnType<typeof getTwoFactorUiMessages>,
): string {
  switch (code) {
    case "TWO_FACTOR_LOCKED":
      return TF.challengeLocked;
    case "TWO_FACTOR_SESSION_EXPIRED":
      return TF.sendSessionExpired;
    case "TWO_FACTOR_EMAIL_NOT_CONFIGURED":
      return TF.challengeEmailServerMisconfig;
    default:
      return TF.sendTryLater;
  }
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const locale = useAppLocale();
  const L = useMemo(() => getUpdatePasswordUiMessages(locale), [locale]);
  const TF = useMemo(() => getTwoFactorUiMessages(locale), [locale]);

  const [state, setState] = useState<PageState>("init");
  const [accessToken, setAccessToken] = useState("");

  // 2FA state
  const [tfCode, setTfCode] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [tfErr, setTfErr] = useState("");
  const [tfMsg, setTfMsg] = useState("");
  const [tfLoading, setTfLoading] = useState(false);

  // Password form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const checkedRef = useRef(false);

  const checkBootstrap = useCallback(async (token: string) => {
    setState("loading-2fa");
    try {
      const res = await fetch("/api/account/bootstrap", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      // Fail-closed: any non-OK response means we cannot determine 2FA state.
      if (!res.ok) {
        setState("load-error");
        return;
      }
      const bs = (await res.json()) as {
        twoFactorEnabled?: boolean;
        twoFactorMethod?: string;
      };
      if (bs.twoFactorEnabled) {
        setState(bs.twoFactorMethod === "email" ? "2fa-email" : "2fa-totp");
      } else {
        setState("form");
      }
    } catch {
      // Network failure or parse error — fail closed, not open.
      setState("load-error");
    }
  }, []);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }
    const sb = getSupabaseBrowser();
    void sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setState("expired");
        return;
      }
      const token = data.session.access_token;
      setAccessToken(token);
      await checkBootstrap(token);
    });
  }, [router, checkBootstrap]);

  async function sendEmailCode() {
    setTfMsg("");
    setTfErr("");
    setTfLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/email/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        setTfMsg(TF.infoCodeSent);
      } else {
        const d = (await res.json()) as { code?: string };
        setTfErr(resolveSendError(d.code, TF));
      }
    } catch {
      setTfErr(TF.sendTryLater);
    } finally {
      setTfLoading(false);
    }
  }

  async function verifyTwoFactor(e: React.FormEvent) {
    e.preventDefault();
    setTfErr("");
    setTfLoading(true);
    try {
      const body = showRecovery
        ? { recoveryCode }
        : state === "2fa-email"
          ? { emailCode: tfCode }
          : { token: tfCode };

      const res = await fetch("/api/auth/2fa/challenge/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setState("form");
      } else {
        const d = (await res.json()) as { code?: string };
        setTfErr(resolveVerifyError(d.code, TF));
      }
    } catch {
      setTfErr(TF.challengeVerifyFailed);
    } finally {
      setTfLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (newPassword.length < 8) {
      setErr(L.errTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr(L.errMismatch);
      return;
    }
    setLoading(true);
    try {
      // Server-side endpoint: re-validates Bearer token, checks 2FA step-up
      // from DB, and uses the admin client to update the password.
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) {
        const d = (await res.json()) as { code?: string; error?: string };
        if (d.code === "TWO_FACTOR_STEP_UP_REQUIRED") {
          // 2FA window expired server-side — send back to 2FA step
          setErr(TF.challengeSessionExpired);
          setState(state === "form" ? "form" : "form"); // keep showing error on form
          return;
        }
        setErr(d.error ?? L.errGeneric);
        return;
      }

      // Send security notification — best-effort, never blocks the flow
      void fetch("/api/auth/notify-password-changed", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setMsg(L.successMsg);
      setState("done");
      setTimeout(() => router.replace("/"), 1500);
    } catch {
      setErr(L.errGeneric);
    } finally {
      setLoading(false);
    }
  }

  // Loading / init skeleton
  if (state === "init" || state === "loading-2fa") {
    return (
      <div className="auth-pro-shell">
        <div className="auth-pro-form-panel auth-pro-form-panel--solo">
          <div className="auth-pro-card" />
        </div>
      </div>
    );
  }

  // Expired / invalid link
  if (state === "expired") {
    return (
      <div className="auth-pro-shell">
        <div className="auth-pro-form-panel auth-pro-form-panel--solo">
          <div className="auth-pro-card">
            <h1 className="auth-pro-heading">{L.title}</h1>
            <p className="auth-pro-err">{L.expiredMsg}</p>
            <Link href="/login" className="auth-pro-text-link" style={{ marginTop: 16, display: "block" }}>
              {L.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fail-closed: could not load 2FA status
  if (state === "load-error") {
    return (
      <div className="auth-pro-shell">
        <div className="auth-pro-form-panel auth-pro-form-panel--solo">
          <div className="auth-pro-card">
            <h1 className="auth-pro-heading">{L.title}</h1>
            <p className="auth-pro-err">{L.loadErrorMsg}</p>
            <button
              type="button"
              className="auth-pro-btn auth-pro-btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => void checkBootstrap(accessToken)}
            >
              {L.retryButton}
            </button>
            <Link href="/login" className="auth-pro-text-link" style={{ marginTop: 12, display: "block" }}>
              {L.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2FA challenge step
  if (state === "2fa-totp" || state === "2fa-email") {
    return (
      <div className="auth-pro-shell">
        <div className="auth-pro-form-panel auth-pro-form-panel--solo">
          <div className="auth-pro-card">
            <h1 className="auth-pro-heading">{TF.challengeTitle}</h1>
            <p style={{ marginBottom: 16, fontSize: "0.9rem", opacity: 0.8 }}>
              {showRecovery
                ? TF.recoveryOptionsIntro
                : state === "2fa-email"
                  ? TF.challengeIntroEmail
                  : TF.challengeIntroTotp}
            </p>
            <form onSubmit={(e) => void verifyTwoFactor(e)} noValidate>
              {showRecovery ? (
                <div className="auth-pro-field">
                  <input
                    type="text"
                    className="auth-pro-input"
                    placeholder={TF.recoveryCodePlaceholder}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              ) : (
                <>
                  {state === "2fa-email" && (
                    <button
                      type="button"
                      className="auth-pro-btn auth-pro-btn-primary"
                      onClick={() => void sendEmailCode()}
                      disabled={tfLoading}
                      style={{ marginBottom: 12 }}
                    >
                      {tfLoading ? "…" : TF.sendEmailCode}
                    </button>
                  )}
                  <div className="auth-pro-field">
                    <input
                      type="text"
                      inputMode="numeric"
                      className="auth-pro-input"
                      placeholder={
                        state === "2fa-email" ? TF.emailCodePlaceholder : TF.totpPlaceholderShort
                      }
                      value={tfCode}
                      onChange={(e) => setTfCode(e.target.value)}
                      autoComplete="one-time-code"
                      maxLength={6}
                    />
                  </div>
                </>
              )}
              {tfErr ? <p className="auth-pro-err">{tfErr}</p> : null}
              {tfMsg ? <p className="auth-pro-msg">{tfMsg}</p> : null}
              <button
                type="submit"
                className="auth-pro-btn auth-pro-btn-primary"
                disabled={tfLoading}
              >
                {tfLoading ? "…" : TF.verify}
              </button>
            </form>
            <button
              type="button"
              className="auth-pro-text-link"
              style={{
                marginTop: 12,
                display: "block",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              onClick={() => {
                setShowRecovery((v) => !v);
                setTfErr("");
                setTfMsg("");
              }}
            >
              {showRecovery ? TF.chooseAnotherMethod : TF.iHaveRecoveryCodes}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Password form (state === "form" | "done")
  return (
    <div className="auth-pro-shell">
      <div className="auth-pro-form-panel auth-pro-form-panel--solo">
        <div className="auth-pro-card">
          <h1 className="auth-pro-heading">{L.title}</h1>
          <form onSubmit={(e) => void onSubmit(e)} noValidate>
            <div className="auth-pro-field">
              <label className="auth-pro-label">{L.newPasswordLabel}</label>
              <div className="auth-pro-input-wrap">
                <input
                  type={showNew ? "text" : "password"}
                  className="auth-pro-input"
                  placeholder={L.newPasswordPlaceholder}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-pro-eye"
                  aria-label={showNew ? L.hidePasswordAria : L.showPasswordAria}
                  onClick={() => setShowNew((v) => !v)}
                >
                  {showNew ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="auth-pro-field">
              <label className="auth-pro-label">{L.confirmPasswordLabel}</label>
              <div className="auth-pro-input-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="auth-pro-input"
                  placeholder={L.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-pro-eye"
                  aria-label={showConfirm ? L.hidePasswordAria : L.showPasswordAria}
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            {err ? <p className="auth-pro-err">{err}</p> : null}
            {msg ? <p className="auth-pro-msg">{msg}</p> : null}
            <button
              type="submit"
              className="auth-pro-btn auth-pro-btn-primary"
              disabled={loading || state === "done"}
            >
              {loading ? "…" : L.submitButton}
            </button>
          </form>
          <Link href="/login" className="auth-pro-text-link" style={{ marginTop: 16, display: "block" }}>
            {L.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}
