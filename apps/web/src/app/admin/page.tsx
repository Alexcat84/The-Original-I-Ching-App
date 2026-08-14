"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { useEffect, useState } from "react";

// pollinations/gpt-image removed: their generation paths no longer exist.
type AdminImageProvider = "auto" | "mock" | "fal" | "together";
type DefaultResponseMode = "directo" | "ritual" | "profundizar";

interface AdminConfig {
  imageProviderDefault: AdminImageProvider;
  responseModeDefault: DefaultResponseMode;
  insightsDefault: boolean;
}

const EMPTY_CONFIG: AdminConfig = {
  imageProviderDefault: "auto",
  responseModeDefault: "ritual",
  insightsDefault: true,
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [config, setConfig] = useState<AdminConfig>(EMPTY_CONFIG);
  const [message, setMessage] = useState<string>("");

  async function loadConfig() {
    setLoading(true);
    const res = await fetch("/api/admin/config", { method: "GET" });
    const data = (await res.json()) as { ok: boolean; config?: AdminConfig };
    if (!res.ok || !data.ok || !data.config) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    setAuthenticated(true);
    setConfig(data.config);
    setLoading(false);
  }

  useEffect(() => {
    void loadConfig();
  }, []);

  async function onLogin() {
    setMessage("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: adminKey }),
    });
    if (!res.ok) {
      setMessage("Clave inválida o panel no configurado.");
      return;
    }
    await loadConfig();
    setMessage("Sesión admin iniciada.");
  }

  async function onSave() {
    setMessage("");
    const res = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      setMessage("No se pudo guardar configuración.");
      return;
    }
    setMessage("Configuración guardada.");
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setMessage("Sesión cerrada.");
  }

  if (loading) {
    return (
      <main className="oracle-shell">
        <div className="admin-toolbar">
          <ThemeToggle />
        </div>
        <section className="oracle-card">
          <p>Cargando panel admin...</p>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="oracle-shell">
        <div className="admin-toolbar">
          <ThemeToggle />
        </div>
        <section className="oracle-card">
          <h1>Admin Dashboard</h1>
          <p>Ingresa tu clave de administrador.</p>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="ADMIN_PANEL_KEY"
          />
          <div className="composer-actions">
            <button type="button" onClick={() => void onLogin()}>Entrar</button>
            <Link className="secondary-btn" href="/chat">Volver al chat</Link>
          </div>
          {message ? <p className="meta-line">{message}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="oracle-shell">
      <div className="admin-toolbar">
        <ThemeToggle />
      </div>
      <section className="oracle-card">
        <h1>Admin Dashboard</h1>
        <p>Centro de control operativo del oráculo.</p>
        <p className="meta-line">
          Acceso solo para operadores: guarda la URL <strong>/admin</strong> y tu clave; no está enlazada desde la app pública.
        </p>

        <label className="admin-label">
          Proveedor de imagen por defecto
          <select
            value={config.imageProviderDefault}
            onChange={(e) => setConfig((prev) => ({ ...prev, imageProviderDefault: e.target.value as AdminImageProvider }))}
          >
            <option value="auto">auto (Together si hay TOGETHER_API_KEY, etc.)</option>
            <option value="fal">fal (Flux)</option>
            <option value="together">together (FLUX · Together.ai)</option>
            <option value="mock">mock</option>
          </select>
        </label>

        <label className="admin-label">
          Modo de respuesta por defecto
          <select
            value={config.responseModeDefault}
            onChange={(e) => setConfig((prev) => ({ ...prev, responseModeDefault: e.target.value as DefaultResponseMode }))}
          >
            <option value="directo">directo</option>
            <option value="ritual">ritual</option>
            <option value="profundizar">profundizar</option>
          </select>
        </label>

        <label className="admin-switch">
          <input
            type="checkbox"
            checked={config.insightsDefault}
            onChange={(e) => setConfig((prev) => ({ ...prev, insightsDefault: e.target.checked }))}
          />
          Insights visibles por defecto
        </label>

        <div className="composer-actions">
          <button type="button" onClick={() => void onSave()}>Guardar cambios</button>
          <button type="button" className="secondary-btn" onClick={() => void onLogout()}>Cerrar sesión admin</button>
          <Link className="secondary-btn" href="/chat">Abrir chat</Link>
        </div>

        {message ? <p className="meta-line">{message}</p> : null}
      </section>
    </main>
  );
}

