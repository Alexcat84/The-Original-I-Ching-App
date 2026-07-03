"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { useAppLocale } from "@/lib/use-app-locale";
import { getUpdatePasswordUiMessages } from "@iching-oracle/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const locale = useAppLocale();
  const L = useMemo(() => getUpdatePasswordUiMessages(locale), [locale]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }
    const sb = getSupabaseBrowser();
    void sb.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setSessionReady(false);
      } else {
        setSessionReady(true);
      }
    });
  }, [router]);

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
      const sb = getSupabaseBrowser();
      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) {
        setErr(error.message || L.errGeneric);
        return;
      }
      setMsg(L.successMsg);
      setTimeout(() => router.replace("/"), 1500);
    } finally {
      setLoading(false);
    }
  }

  if (sessionReady === null) {
    return (
      <div className="auth-pro-shell">
        <div className="auth-pro-form-panel auth-pro-form-panel--solo">
          <div className="auth-pro-card" />
        </div>
      </div>
    );
  }

  if (sessionReady === false) {
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
            <button type="submit" className="auth-pro-btn auth-pro-btn-primary" disabled={loading}>
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
