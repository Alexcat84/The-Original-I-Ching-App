"use client";

import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

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

function registerErrorMessage(data: {
  error?: string;
  reason?: string;
  message?: string;
}): string {
  switch (data.error) {
    case "invalid_payload":
      return "Revisa el correo y la contraseña (mínimos requeridos).";
    case "rate_limited":
      return "Demasiados intentos desde esta red. Espera un poco e inténtalo de nuevo.";
    case "turnstile_failed":
      return "Verificación anti‑bots fallida. Recarga la página e inténtalo de nuevo.";
    case "email_rejected":
      return data.reason === "disposable"
        ? "No se aceptan correos temporales o desechables."
        : "El correo no pasó la validación (dominio o MX).";
    case "create_user_failed":
      return data.message ?? "No se pudo crear la cuenta (¿correo ya registrado?).";
    case "supabase_not_configured":
      return "El servidor no tiene Supabase configurado.";
    default:
      return data.message ?? "No se pudo registrar. Inténtalo de nuevo.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(false);
  const turnstileTokenRef = useRef("");
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileHostRef = useRef<HTMLDivElement | null>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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
    if (!isSupabaseBrowserConfigured()) return;
    setLoading(true);
    try {
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
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          turnstileToken: turnstileTokenRef.current,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        reason?: string;
        message?: string;
      };
      if (!res.ok) {
        setErr(registerErrorMessage(data));
        return;
      }
      setMsg("Te enviamos un enlace de confirmación. Ábrelo y luego vuelve aquí a iniciar sesión.");
      setMode("signin");
    } catch {
      setErr("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (configError) {
    return (
      <div className="auth-pro-shell">
        <div className="auth-pro-form-panel auth-pro-form-panel--solo">
          <div className="auth-pro-card">
            <h1 className="auth-pro-heading">Acceso no disponible</h1>
            <p className="auth-pro-lead auth-pro-err">
              Faltan <code>NEXT_PUBLIC_SUPABASE_URL</code> o <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en el cliente.
            </p>
            <Link href="/" className="auth-pro-text-link">
              ← Volver al oráculo
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
          <p className="auth-pro-brand-text">
            Lectura clásica con Zhu Xi y Wilhelm/Baynes.
          </p>
        </div>
      </aside>

      <div className="auth-pro-form-panel">
        <div className="auth-pro-card">
          <div className="auth-pro-tabs" role="tablist" aria-label="Acceso">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              className={`auth-pro-tab ${mode === "signin" ? "active" : ""}`}
              onClick={() => {
                setMode("signin");
                setErr(null);
                setMsg(null);
              }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={`auth-pro-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => {
                setMode("signup");
                setErr(null);
                setMsg(null);
              }}
            >
              Crear cuenta
            </button>
          </div>

          {mode === "signin" ? (
            <form onSubmit={onSignIn} className="auth-pro-form">
              <p className="auth-pro-lead">Entra con el correo con el que te registraste (tras confirmar el enlace).</p>
              <div className="auth-pro-field">
                <label htmlFor="auth-email">Correo electrónico</label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </div>
              <div className="auth-pro-field">
                <label htmlFor="auth-password">Contraseña</label>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="auth-pro-btn auth-pro-btn-primary" disabled={loading}>
                {loading ? "Entrando…" : "Entrar"}
              </button>
            </form>
          ) : (
            <form onSubmit={onRegister} className="auth-pro-form">
              <p className="auth-pro-lead">Registro con validación de correo. Te pedimos una contraseña segura (mín. 8 caracteres).</p>
              <div className="auth-pro-field">
                <label htmlFor="auth-email-su">Correo electrónico</label>
                <input
                  id="auth-email-su"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </div>
              <div className="auth-pro-field">
                <label htmlFor="auth-password-su">Contraseña</label>
                <input
                  id="auth-password-su"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
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
                {loading ? "Enviando…" : "Registrarme"}
              </button>
            </form>
          )}

          <div className="auth-pro-divider">
            <span>o</span>
          </div>

          <button type="button" className="auth-pro-btn auth-pro-btn-google" disabled={loading} onClick={() => void onGoogle()}>
            <GoogleGlyph />
            Continuar con Google
          </button>

          {err ? <p className="auth-pro-err">{err}</p> : null}
          {msg ? <p className="auth-pro-msg">{msg}</p> : null}

          <Link href="/" className="auth-pro-text-link auth-pro-back">
            ← Volver al oráculo
          </Link>
        </div>
      </div>
    </div>
  );
}
