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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(false);
  const turnstileTokenRef = useRef("");
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileHostRef = useRef<HTMLDivElement | null>(null);

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

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!turnstileSiteKey) return;

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
  }, [turnstileSiteKey]);

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
          email: registerEmail.trim(),
          password: registerPassword,
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
      setMsg("Revisa tu correo para confirmar la cuenta. Después podrás iniciar sesión.");
    } catch {
      setErr("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (configError) {
    return (
      <div className="auth-login-page">
        <div className="auth-login-card">
          <h1>Acceso</h1>
          <p className="auth-login-err">
            Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno del cliente.
          </p>
          <Link href="/" className="auth-login-back">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-login-page">
      <div className="auth-login-card">
        <h1>Acceso</h1>
        <p className="auth-login-sub">Correo verificado o Google. El plan gratuito incluye 2 consultas al mes.</p>

        <form onSubmit={onSignIn}>
          <div className="auth-login-field">
            <label htmlFor="login-email">Correo</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-login-field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="auth-login-actions">
            <button type="submit" disabled={loading}>
              Iniciar sesión
            </button>
            <button type="button" className="auth-login-google" disabled={loading} onClick={() => void onGoogle()}>
              Continuar con Google
            </button>
          </div>
        </form>

        {err ? <p className="auth-login-err">{err}</p> : null}
        {msg ? <p className="auth-login-msg">{msg}</p> : null}

        <hr style={{ margin: "1.5rem 0", border: "none", borderTop: "1px solid var(--input-border)" }} />

        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem", color: "var(--card-title)" }}>Crear cuenta</h2>
        <form onSubmit={onRegister}>
          <div className="auth-login-field">
            <label htmlFor="reg-email">Correo</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
          </div>
          <div className="auth-login-field">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div
            ref={turnstileHostRef}
            style={{
              marginBottom: "0.75rem",
              display: turnstileSiteKey ? "block" : "none",
            }}
            aria-hidden={!turnstileSiteKey}
          />
          <div className="auth-login-actions">
            <button type="submit" disabled={loading}>
              Registrarse
            </button>
          </div>
        </form>

        <Link href="/" className="auth-login-back">
          Volver al oráculo
        </Link>
      </div>
    </div>
  );
}
