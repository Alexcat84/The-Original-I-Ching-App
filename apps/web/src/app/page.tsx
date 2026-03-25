"use client";

import { CONTEXT_LIMITS } from "@iching-oracle/context-engine";
import { OracleShell } from "@iching-oracle/ui";
import { commonStrings, DEFAULT_LOCALE } from "@iching-oracle/i18n";
import type { OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { ConsultationRecordCard } from "@/components/ConsultationRecordCard";
import { CrackPatternGraphic } from "@/components/CrackPatternGraphic";
import { OracleInterpretationMarkdown } from "@/components/OracleInterpretationMarkdown";
import { OracleMethodSources } from "@/components/OracleMethodSources";
import { ReadingOracleImage } from "@/components/ReadingOracleImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  buildBonesDeepenPrompts,
  buildDeepenPrompts,
  type SuggestionConsultSnapshot,
} from "@/lib/chat-suggestions";
import { stripInterpretationFluff } from "@/lib/response-clean";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ApiLine = {
  position: 1 | 2 | 3 | 4 | 5 | 6;
  value: 6 | 7 | 8 | 9;
  isChanging: boolean;
  symbol: string;
};

type ConsultResponse = {
  oracleType?: "iching" | "oracle_bones";
  oracleBones?: {
    patternId: number;
    verdict: OracleBonesVerdict;
    affirmsPositive: boolean | null;
    ambiguousPasses: number;
    positiveCharge: string;
    negativeCharge: string;
    medium: "turtle" | "ox";
  };
  consultationId: string;
  primaryHexagram: number;
  primaryHexagramName: string;
  primaryHexagramChinese: string;
  transformedHexagram: number | null;
  transformedHexagramName: string | null;
  mutationRule: string;
  lines: ApiLine[];
  changingLines: number[];
  interpretation: string;
  category: string;
  imageProvider?: "auto" | "mock" | "svg-art" | "pollinations" | "fal" | "gpt-image" | "together";
  imagePrompt: string;
  imageUrl: string;
  imageFallbackUrl: string;
  sessionId: string | null;
  sessionPosition: number;
  canDeepen: boolean;
  publicReadingId: string;
  publicSessionId: string;
  sharingPersisted?: boolean;
};

type ConsultationItem = ConsultResponse & { question: string };
type Tier = "free" | "seeker" | "practitioner" | "master" | "oracle";
type ResponseMode = "directo" | "ritual" | "profundizar";
type OracleMode = "iching" | "oracle_bones";

type QueryLanguage = "es" | "en";

function responseModeLabelEs(mode: ResponseMode): string {
  const labels: Record<ResponseMode, string> = {
    directo: "Directo",
    ritual: "Ritual",
    profundizar: "Profundizar",
  };
  return labels[mode];
}

function verdictLabelEs(v: OracleBonesVerdict): string {
  const m: Record<OracleBonesVerdict, string> = {
    auspicious_clear: "吉 — favorable claro (carga positiva)",
    auspicious_moderate: "吉 — favorable moderado",
    inauspicious_moderate: "凶 — desfavorable moderado",
    inauspicious_clear: "凶 — desfavorable claro (carga negativa)",
    silent: "Sin respuesta clara — silencio ancestral",
  };
  return m[v];
}
type ChatSessionState = {
  localId: string;
  title: string;
  sessionId: string | null;
  /** Last known public id for /s/… links (synced from API). */
  publicSessionId: string | null;
  thread: ConsultationItem[];
  updatedAt: number;
};

function createLocalSession(title = "Nueva sesión"): ChatSessionState {
  return {
    localId: `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    sessionId: null,
    publicSessionId: null,
    thread: [],
    updatedAt: Date.now(),
  };
}

function InterpretationBody({ text }: { text: string }) {
  const cleaned = useMemo(() => stripInterpretationFluff(text), [text]);
  if (!cleaned) return null;
  return (
    <div className="interpretation-text interpretation-text--body">
      <OracleInterpretationMarkdown text={cleaned} />
    </div>
  );
}

function formatPrintFilename(consultationId: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const id = consultationId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase();
  return `${y}${m}${d}-${hh}${mm}-${id}`;
}

function detectInputLanguage(question: string): QueryLanguage {
  const text = question.trim().toLowerCase();
  if (!text) return "es";
  const esHits =
    (text.match(/\b(el|la|los|las|de|que|para|con|por|como|qué|dónde|cuál|mensaje|consulta|camino|relación)\b/g) ?? [])
      .length +
    (text.match(/[áéíóúñ¿¡]/g) ?? []).length;
  const enHits =
    (text.match(/\b(the|and|what|where|when|why|how|message|relationship|question|path|oracle|reading)\b/g) ?? [])
      .length;
  return enHits > esHits ? "en" : "es";
}

export default function HomePage() {
  const locale = DEFAULT_LOCALE;
  const t = commonStrings[locale];
  const [tier] = useState<Tier>("seeker");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "coins" | "bones" | "reading">("idle");
  const [coinTick, setCoinTick] = useState(0);
  const [oracleMode, setOracleMode] = useState<OracleMode>("iching");
  const [bonesNegative, setBonesNegative] = useState("");
  const [bonesMedium, setBonesMedium] = useState<"turtle" | "ox">("turtle");
  const [sessions, setSessions] = useState<ChatSessionState[]>(() => [createLocalSession("Consulta en progreso")]);
  const [activeSessionLocalId, setActiveSessionLocalId] = useState<string | null>(null);
  const [responseMode, setResponseMode] = useState<ResponseMode>("ritual");
  const [error, setError] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(true);
  const [dailyCount, setDailyCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<HTMLElement | null>(null);
  const [chatsOpen, setChatsOpen] = useState(false);
  const [consultPanelOpen, setConsultPanelOpen] = useState(false);
  const [deepenPromptsOpen, setDeepenPromptsOpen] = useState(false);
  const [sharingPersisted, setSharingPersisted] = useState(true);

  const shuffledCoins = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        flip: (coinTick + i) % 2 === 0,
        delay: i * 80,
      })),
    [coinTick],
  );
  const activeRitualLine = (coinTick % 6) + 1;
  const emptyThreadInvite = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) {
      return "Buen momento para escuchar al oráculo. ¿Qué inquietud trae este nuevo día? Escribe tu consulta con intención: al enviar, el ritual de las tres monedas trazará el patrón.";
    }
    if (h < 20) {
      return "El cambio sigue moviéndose. ¿Qué necesitas ver con más claridad en el curso de hoy? Tu pregunta abre la consulta; el I Ching mostrará el hexagrama que corresponda.";
    }
    return "La noche también pregunta. ¿Qué frente de tu vida quieres explorar? Deja tu consulta abajo: las monedas dispondrán las líneas del momento.";
  }, []);
  const activeSession = useMemo(() => {
    if (!sessions.length) return null;
    if (!activeSessionLocalId) return sessions[0] ?? null;
    return sessions.find((s) => s.localId === activeSessionLocalId) ?? sessions[0] ?? null;
  }, [sessions, activeSessionLocalId]);
  const activeThread = activeSession?.thread ?? [];
  const result = activeThread.at(-1) ?? null;
  const questionTrimmed = question.trim();
  const showFloatingDeepen =
    activeThread.length > 0 &&
    Boolean(result?.canDeepen) &&
    !loading &&
    questionTrimmed === "" &&
    phase !== "coins" &&
    phase !== "bones";
  const suggestionSnapshots: SuggestionConsultSnapshot[] = useMemo(
    () =>
      activeThread.map((e) => ({
        consultationId: e.consultationId,
        question: e.question,
        interpretation: e.interpretation,
        category: e.category,
        primaryHexagram: e.primaryHexagram,
        changingLines: e.changingLines,
      })),
    [activeThread],
  );
  const deepenPromptList = useMemo(() => {
    const last = activeThread.at(-1);
    if (!last || oracleMode !== "iching") return [];
    if (last.oracleType === "oracle_bones") {
      return buildDeepenPrompts(null, suggestionSnapshots);
    }
    return buildDeepenPrompts(
      {
        consultationId: last.consultationId,
        question: last.question,
        interpretation: last.interpretation,
        category: last.category,
        primaryHexagram: last.primaryHexagram,
        changingLines: last.changingLines,
      },
      suggestionSnapshots,
    );
  }, [activeThread, oracleMode, suggestionSnapshots]);
  const bonesDeepenList = useMemo(() => {
    const last = activeThread.at(-1);
    return buildBonesDeepenPrompts(
      last ? { consultationId: last.consultationId, question: last.question } : null,
    );
  }, [activeThread]);
  const questionInputRef = useRef<HTMLTextAreaElement | null>(null);

  async function exportChatPdf(): Promise<void> {
    if (!activeThread.length) return;
    const { jsPDF } = await import("jspdf");
    const lang = detectInputLanguage(activeThread.at(-1)?.question ?? question);
    const title = lang === "en" ? "Authentic I Ching App — Chat Export" : "El autentico I ching app — Exportación de chat";
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 44;
    const maxW = pageW - margin * 2;
    let y = margin;
    const heading = activeSession?.title?.trim() || (lang === "en" ? "Consultation Chat" : "Chat de consulta");
    const idRef = activeThread.at(-1)?.consultationId ?? activeThread[0]?.consultationId ?? "CHAT";
    const fileBase = formatPrintFilename(idRef);
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text(title, margin, y);
    y += 24;
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text(`${lang === "en" ? "Thread" : "Hilo"}: ${heading}`, margin, y);
    y += 18;
    doc.text(`${lang === "en" ? "Entries" : "Entradas"}: ${activeThread.length}`, margin, y);
    y += 24;

    for (let i = 0; i < activeThread.length; i++) {
      const entry = activeThread[i]!;
      const qLabel = lang === "en" ? "Question" : "Pregunta";
      const aLabel = lang === "en" ? "Reading" : "Lectura";
      const questionLines = doc.splitTextToSize(`${qLabel} ${i + 1}: ${entry.question}`, maxW);
      const text = stripInterpretationFluff(entry.interpretation);
      const readingLines = doc.splitTextToSize(`${aLabel} ${i + 1}: ${text}`, maxW);
      const needed = questionLines.length * 13 + readingLines.length * 13 + 36;
      if (y + needed > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.text(questionLines, margin, y);
      y += questionLines.length * 13 + 8;
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text(readingLines, margin, y);
      y += readingLines.length * 13 + 14;
      doc.setDrawColor(185, 185, 185);
      doc.line(margin, y, pageW - margin, y);
      y += 16;
    }
    doc.save(`${fileBase}.pdf`);
  }

  const updateActiveSession = (updater: (current: ChatSessionState) => ChatSessionState) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.localId !== activeSession?.localId) return s;
        return updater(s);
      }),
    );
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeThread.length, phase, error, activeSession?.localId]);

  useEffect(() => {
    setDeepenPromptsOpen(false);
  }, [activeSession?.localId]);

  const startNewSession = useCallback(() => {
    const created = createLocalSession("Nueva sesión");
    setSessions((prev) => [created, ...prev]);
    setActiveSessionLocalId(created.localId);
    setQuestion("");
    setError(null);
    setChatsOpen(false);
    setConsultPanelOpen(false);
  }, []);

  useEffect(() => {
    function afterPrint() {
      document.body.removeAttribute("data-print-reading");
      document.querySelectorAll("[data-print-reading-sheet]").forEach((el) => {
        el.removeAttribute("data-print-reading-sheet");
      });
    }
    window.addEventListener("afterprint", afterPrint);
    return () => window.removeEventListener("afterprint", afterPrint);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (consultPanelOpen) {
        setConsultPanelOpen(false);
        return;
      }
      setChatsOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [consultPanelOpen]);

  useEffect(() => {
    if (!chatsOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [chatsOpen]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastDay = localStorage.getItem("iching_last_day");
    const storedStreak = Number(localStorage.getItem("iching_streak_days") ?? "0");
    const storedDaily = Number(localStorage.getItem(`iching_daily_count_${today}`) ?? "0");
    setDailyCount(storedDaily);
    if (!lastDay) {
      setStreakDays(Math.max(storedStreak, 1));
      localStorage.setItem("iching_last_day", today);
      localStorage.setItem("iching_streak_days", String(Math.max(storedStreak, 1)));
      return;
    }
    if (lastDay === today) {
      setStreakDays(Math.max(storedStreak, 1));
      return;
    }
    const last = new Date(`${lastDay}T00:00:00`);
    const curr = new Date(`${today}T00:00:00`);
    const diffDays = Math.round((curr.getTime() - last.getTime()) / (24 * 60 * 60 * 1000));
    const nextStreak = diffDays === 1 ? Math.max(storedStreak, 1) + 1 : 1;
    setStreakDays(nextStreak);
    localStorage.setItem("iching_last_day", today);
    localStorage.setItem("iching_streak_days", String(nextStreak));
  }, []);

  useEffect(() => {
    async function loadPublicConfig() {
      try {
        const res = await fetch("/api/admin/public-config", { method: "GET" });
        const data = (await res.json()) as {
          ok: boolean;
          config?: {
            responseModeDefault?: ResponseMode;
            insightsDefault?: boolean;
          };
        };
        if (!res.ok || !data.ok || !data.config) return;
        if (data.config.responseModeDefault) setResponseMode(data.config.responseModeDefault);
        if (typeof data.config.insightsDefault === "boolean") setShowInsights(data.config.insightsDefault);
      } catch {
        // ignore config load errors
      }
    }
    void loadPublicConfig();
  }, []);

  useEffect(() => {
    try {
      const sessionsRaw = localStorage.getItem("iching_sessions_v2");
      if (sessionsRaw) {
        const parsed = JSON.parse(sessionsRaw) as { sessions: ChatSessionState[]; activeSessionLocalId: string | null };
        if (parsed.sessions?.length) {
          setSessions(
            parsed.sessions.map((s) => ({
              ...s,
              publicSessionId: s.publicSessionId ?? null,
            })),
          );
          setActiveSessionLocalId(parsed.activeSessionLocalId ?? parsed.sessions[0]?.localId ?? null);
          return;
        }
      }

      const raw = localStorage.getItem("iching_session_v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        thread: ConsultationItem[];
        sessionId: string | null;
        sessionTitle?: string;
      };
      const migrated = createLocalSession(parsed.sessionTitle ?? "Consulta en progreso");
      migrated.thread = parsed.thread ?? [];
      migrated.sessionId = parsed.sessionId ?? null;
      migrated.publicSessionId = null;
      setSessions([migrated]);
      setActiveSessionLocalId(migrated.localId);
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    const payload = JSON.stringify({
      sessions,
      activeSessionLocalId: activeSession?.localId ?? null,
    });
    localStorage.setItem("iching_sessions_v2", payload);
  }, [sessions, activeSession]);

  async function onConsult() {
    if (!activeSession) {
      const created = createLocalSession("Consulta en progreso");
      setSessions([created]);
      setActiveSessionLocalId(created.localId);
      return;
    }
    if (activeThread.length > 0 && result && !result.canDeepen) {
      setError("Llegaste al límite de este hilo. Inicia una nueva sesión para continuar.");
      return;
    }
    if (oracleMode === "oracle_bones" && !question.trim()) {
      setError("Escribe el cargo positivo (una afirmación clara) para consultar los huesos.");
      return;
    }
    setLoading(true);
    setError(null);
    setPhase(oracleMode === "oracle_bones" ? "bones" : "coins");
    let ok = false;
    const ticker = window.setInterval(() => setCoinTick((t0) => t0 + 1), 140);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim() || "Silent consultation",
          language: detectInputLanguage(question),
          tier,
          sessionId: activeSession.sessionId,
          sessionTitle: activeSession.title,
          isDeepening: activeThread.length > 0,
          responseMode,
          oracleMode,
          oracleBones:
            oracleMode === "oracle_bones"
              ? {
                  positiveCharge: question.trim(),
                  negativeCharge: bonesNegative.trim() || undefined,
                  medium: bonesMedium,
                }
              : undefined,
          history: activeThread.map((item) => ({
            oracleType: item.oracleType ?? "iching",
            question: item.question,
            primaryHexagram: item.primaryHexagram,
            primaryHexagramName: item.primaryHexagramName,
            primaryHexagramChinese: item.primaryHexagramChinese,
            transformedHexagramName: item.transformedHexagramName,
            changingLines: item.changingLines,
            mutationRule: item.mutationRule,
            interpretation: item.interpretation,
            oracleBones: item.oracleBones
              ? {
                  patternId: item.oracleBones.patternId,
                  verdict: item.oracleBones.verdict,
                  positiveCharge: item.oracleBones.positiveCharge,
                  negativeCharge: item.oracleBones.negativeCharge,
                  medium: item.oracleBones.medium,
                  ambiguousPasses: item.oracleBones.ambiguousPasses,
                }
              : undefined,
          })),
        }),
      });
      const data = (await res.json()) as ConsultResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      if (typeof data.sharingPersisted === "boolean") {
        setSharingPersisted(data.sharingPersisted);
      }
      await new Promise((r) => window.setTimeout(r, 900));
      const item: ConsultationItem = {
        ...data,
        oracleType: data.oracleType ?? "iching",
        question:
          data.oracleType === "oracle_bones" && data.oracleBones?.positiveCharge
            ? data.oracleBones.positiveCharge
            : question.trim() || "Silent consultation",
      };
      updateActiveSession((current) => ({
        ...current,
        thread: [...current.thread, item],
        sessionId: data.sessionId,
        publicSessionId: data.publicSessionId ?? current.publicSessionId,
        title: current.title === "Consulta en progreso" || current.title === "Nueva sesión"
          ? item.question.slice(0, 60)
          : current.title,
        updatedAt: Date.now(),
      }));
      setQuestion("");
      const today = new Date().toISOString().slice(0, 10);
      setDailyCount((prev) => {
        const next = prev + 1;
        localStorage.setItem(`iching_daily_count_${today}`, String(next));
        return next;
      });
      setPhase("reading");
      setConsultPanelOpen(false);
      setDeepenPromptsOpen(false);
      ok = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      window.clearInterval(ticker);
      setLoading(false);
      if (!ok) {
        setPhase("idle");
      }
    }
  }

  return (
    <OracleShell title={t.appTitle} variant="chat">
      <div className="oracle-chat-app">
        {chatsOpen ? (
          <div
            className="chat-drawer-backdrop"
            role="presentation"
            onClick={() => setChatsOpen(false)}
          />
        ) : null}

        <aside
          className={`chat-drawer ${chatsOpen ? "open" : ""}`}
          aria-hidden={!chatsOpen}
          id="chat-drawer"
        >
          <div className="chat-drawer-header">
            <button type="button" className="chat-icon-btn" onClick={() => setChatsOpen(false)} aria-label="Cerrar">
              ✕
            </button>
            <h2>Chats</h2>
            <button
              type="button"
              className="chat-icon-btn"
              onClick={() => {
                startNewSession();
              }}
              disabled={loading}
              title="Nuevo chat"
            >
              +
            </button>
          </div>
          <div className="sidebar-presence">
            <p>Estado del oráculo</p>
            <strong>{loading ? "Canalizando…" : "Presencia serena"}</strong>
            <small>{loading ? "Lanzando monedas y abriendo patrón" : "Listo para una nueva pregunta"}</small>
          </div>
          <div className="chat-drawer-list">
            {[...sessions]
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((session) => (
                <button
                  key={session.localId}
                  type="button"
                  className={`chat-session-item ${session.localId === activeSession?.localId ? "active" : ""}`}
                  onClick={() => {
                    setActiveSessionLocalId(session.localId);
                    setError(null);
                    setChatsOpen(false);
                  }}
                >
                  <span className="chat-session-title">{session.title}</span>
                  <span className="chat-session-meta">{session.thread.length} mensajes</span>
                </button>
              ))}
          </div>
        </aside>

        <div className="chat-surface">
        <header className="chat-app-bar oracle-intro">
          <div className="chat-app-bar-row">
            <div className="chat-bar-lead">
              <button
                type="button"
                className="chat-icon-btn"
                onClick={() => setChatsOpen(true)}
                aria-expanded={chatsOpen}
                aria-controls="chat-drawer"
              >
                Chats
              </button>
              <button
                type="button"
                className="chat-icon-btn chat-icon-btn--session"
                data-testid="new-session-btn"
                onClick={() => startNewSession()}
                disabled={loading}
                title="Iniciar conversación nueva"
              >
                Nueva sesión
              </button>
            </div>
            <h1 className="chat-title-display">{t.appTitle}</h1>
            <div className="chat-bar-trail">
              <button
                type="button"
                className={`chat-icon-btn chat-icon-btn--stats${showInsights ? " chat-icon-btn--stats-on" : ""}`}
                onClick={() => setShowInsights((v) => !v)}
                aria-pressed={showInsights}
                aria-label={showInsights ? "Ocultar estadísticas" : "Mostrar estadísticas"}
              >
                Stats
              </button>
              <ThemeToggle />
            </div>
          </div>
          <div className="chat-app-brand">
            <div className="oracle-brand-line">
              <span className="oracle-cn-mark" lang={oracleMode === "iching" ? "zh-Hant" : "zh-Hans"}>
                {oracleMode === "iching" ? "周易" : "甲骨文"}
              </span>
              <span className="oracle-brand-rule" aria-hidden />
              <p className="oracle-tagline">
                {oracleMode === "iching"
                  ? "Tres monedas · Zhu Xi · Wilhelm/Baynes"
                  : "Grietas 兆 (estilo Shang) · sí / no sobre cargos"}
              </p>
            </div>
            <div className="oracle-status-strip" aria-label="Configuración activa de la consulta">
              <span
                className={`oracle-status-pill oracle-status-pill--oracle oracle-status-pill--${oracleMode === "iching" ? "iching" : "bones"}`}
              >
                <span className="oracle-status-pill-title">
                  {oracleMode === "iching" ? "I Ching · 易" : "甲骨 · huesos"}
                </span>
                {oracleMode === "oracle_bones" ? (
                  <span className="oracle-status-pill-sub">
                    {bonesMedium === "turtle" ? "Plastrón tortuga" : "Escápula buey"}
                  </span>
                ) : (
                  <span className="oracle-status-pill-sub">Seis líneas · mutación clásica</span>
                )}
              </span>
              <span className="oracle-status-pill oracle-status-pill--response" title="Modo de lectura del texto">
                <span className="oracle-status-pill-kicker">Lectura</span>
                <span className="oracle-status-pill-strong">{responseModeLabelEs(responseMode)}</span>
              </span>
              {oracleMode === "oracle_bones" ? (
                <span className="oracle-status-pill oracle-status-pill--hint">5 patrones de grieta · cargas</span>
              ) : null}
              {showInsights ? (
                <div className="insights-strip insights-strip--inline">
                  <span>Racha {streakDays}d</span>
                  <span>Hoy {dailyCount}</span>
                  <span>{sessions.length} chats</span>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="chat-room">
          <section className="chat-history" ref={historyRef}>
            {activeThread.length === 0 ? (
              <div className="chat-empty-hint chat-empty-hint--welcome">
                <p className="welcome-lead">{emptyThreadInvite}</p>
                <p className="welcome-hint-below">Escribe en el campo de abajo y envía cuando estés listo.</p>
              </div>
            ) : null}
            {activeThread.map((entry) => (
              <div
                key={entry.consultationId}
                id={`reading-sheet-${entry.consultationId}`}
                className="thread-block chat-entry"
              >
                <div className="chat-bubble chat-user">
                  <p className="question-chip">{entry.question}</p>
                </div>
                <div className="chat-bubble chat-assistant">
                  <div className="interpretation-stack" data-testid="interpretation-text">
                    <InterpretationBody text={entry.interpretation} />
                  </div>
                  {entry.oracleType !== "oracle_bones" ? (
                    <div className="reading-record-visual-row">
                      <ConsultationRecordCard
                        consultationId={entry.consultationId}
                        question={entry.question}
                        sessionPosition={entry.sessionPosition}
                        primaryHexagram={entry.primaryHexagram}
                        primaryHexagramChinese={entry.primaryHexagramChinese}
                        transformedHexagram={entry.transformedHexagram}
                        mutationRule={entry.mutationRule}
                        oracleType={entry.oracleType ?? "iching"}
                      />
                      <ReadingOracleImage
                        imageUrl={entry.imageUrl}
                        imageFallbackUrl={entry.imageFallbackUrl}
                        downloadBasename={`iching-${entry.consultationId.replace(/-/g, "").slice(0, 12)}`}
                      />
                    </div>
                  ) : null}
                  {entry.oracleType === "oracle_bones" && entry.oracleBones ? (
                    <div className="reading-grid reading-grid--bones-solo">
                      <section className="hexagram-card">
                        <h3>甲骨文 · Huesos de oráculo</h3>
                        <p className="meta-line">
                          Medio: {entry.oracleBones.medium === "turtle" ? "Plastrón de tortuga" : "Escápula de buey"}
                          {entry.oracleBones.ambiguousPasses > 0
                            ? ` · Lecturas ambiguas previas: ${entry.oracleBones.ambiguousPasses}`
                            : ""}
                        </p>
                        <p className="meta-line">
                          <strong>Cargo +:</strong> {entry.oracleBones.positiveCharge}
                        </p>
                        <p className="meta-line">
                          <strong>Cargo −:</strong> {entry.oracleBones.negativeCharge}
                        </p>
                        <div className="crack-visual-wrap">
                          <CrackPatternGraphic patternId={entry.oracleBones.patternId} />
                          <span
                            className={`verdict-pill ${
                              entry.oracleBones.verdict === "silent"
                                ? "verdict-pill--silent"
                                : entry.oracleBones.verdict.startsWith("auspicious")
                                  ? "verdict-pill--ji"
                                  : "verdict-pill--xiong"
                            }`}
                          >
                            {verdictLabelEs(entry.oracleBones.verdict)}
                          </span>
                          {entry.oracleBones.affirmsPositive !== null ? (
                            <p className="meta-line">
                              Lectura del signo:{" "}
                              <strong>
                                {entry.oracleBones.affirmsPositive
                                  ? "Inclina hacia el cargo positivo."
                                  : "Inclina hacia la negación del cargo."}
                              </strong>
                            </p>
                          ) : null}
                        </div>
                      </section>
                    </div>
                  ) : null}
                  <div className="session-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        const el = document.getElementById(`reading-sheet-${entry.consultationId}`);
                        el?.setAttribute("data-print-reading-sheet", "true");
                        document.body.setAttribute("data-print-reading", "1");
                        document.title = formatPrintFilename(entry.consultationId);
                        window.print();
                      }}
                    >
                      Imprimir / PDF
                    </button>
                    <button type="button" className="secondary-btn" onClick={() => void exportChatPdf()}>
                      Exportar chat PDF
                    </button>
                    <a
                      className={`secondary-btn${!sharingPersisted ? " secondary-btn--muted" : ""}`}
                      href={`/r/${entry.publicReadingId}`}
                      target="_blank"
                      rel="noreferrer"
                      title={
                        sharingPersisted
                          ? "Abrir lectura compartida"
                          : "Activa Supabase o Upstash Redis en el servidor para que este enlace funcione entre dispositivos y tras reinicios."
                      }
                    >
                      Compartir lectura
                    </a>
                    <a
                      className={`secondary-btn${!sharingPersisted ? " secondary-btn--muted" : ""}`}
                      href={`/s/${activeSession?.publicSessionId ?? entry.publicSessionId}`}
                      target="_blank"
                      rel="noreferrer"
                      title={
                        sharingPersisted
                          ? "Abrir sesión compartida"
                          : "Activa Supabase o Upstash Redis en el servidor para que este enlace funcione entre dispositivos y tras reinicios."
                      }
                    >
                      Compartir sesión
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {phase === "bones" ? (
              <section className="coins-stage" data-testid="bone-ritual">
                <p className="coins-title">Ritual en curso · calor sobre el hueso</p>
                <p className="meta-line" style={{ textAlign: "center", maxWidth: "22rem", margin: "0 auto" }}>
                  Estilización del procedimiento shang: el patrón de grieta se fija al completar la consulta.
                </p>
                <div className="crack-visual-wrap">
                  <CrackPatternGraphic patternId={((coinTick % 4) + 1) as number} />
                </div>
              </section>
            ) : null}

            {phase === "coins" ? (
              <section className="coins-stage" data-testid="coin-throw">
                <p className="coins-title">Ritual en curso · lanzando monedas</p>
                <div className="ritual-progress">
                  {Array.from({ length: 6 }, (_, i) => {
                    const line = i + 1;
                    const active = line === activeRitualLine;
                    const done = line < activeRitualLine;
                    return (
                      <div key={line} className={`ritual-line ${active ? "active" : ""} ${done ? "done" : ""}`}>
                        <span>Línea {line}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="coins-grid">
                  {shuffledCoins.map((coin) => (
                    <div
                      key={coin.id}
                      className={`coin ${coin.flip ? "coin-heads" : "coin-tails"}`}
                      style={{ animationDelay: `${coin.delay}ms` }}
                    >
                      {coin.flip ? "☯" : "◍"}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {error ? <div className="chat-error-bubble">{error}</div> : null}
            <div ref={endRef} />
          </section>

          {consultPanelOpen ? (
            <button
              type="button"
              className="composer-backdrop"
              aria-label="Cerrar panel de consulta"
              onClick={() => setConsultPanelOpen(false)}
            />
          ) : null}

          <footer className={`chat-composer-wa${consultPanelOpen ? " is-expanded" : ""}`}>
            <div className="composer-dock">
              <div
                id="consult-panel"
                className={`composer-sheet ${consultPanelOpen ? "is-open" : ""}`}
                aria-hidden={!consultPanelOpen}
              >
                <div className="composer-sheet-inner">
                  <section className="oracle-card composer-card">
                    <div className="composer-sheet-header">
                      <p className="card-title">{t.consult}</p>
                      <button
                        type="button"
                        className="composer-panel-close"
                        onClick={() => setConsultPanelOpen(false)}
                        aria-label="Cerrar panel de consulta"
                      >
                        Cerrar
                      </button>
                    </div>
                    <div className="oracle-mode-select" role="group" aria-label="Modo de oráculo">
                      <label>
                        <input
                          type="radio"
                          name="oracle-mode"
                          checked={oracleMode === "iching"}
                          onChange={() => setOracleMode("iching")}
                          disabled={loading}
                        />
                        I Ching (易)
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="oracle-mode"
                          checked={oracleMode === "oracle_bones"}
                          onChange={() => setOracleMode("oracle_bones")}
                          disabled={loading}
                        />
                        Huesos 甲骨
                      </label>
                    </div>
                    <OracleMethodSources />
                    {oracleMode === "oracle_bones" ? (
                      <div className="bones-extra-fields">
                        <label htmlFor="bones-negative" className="meta-line">
                          Cargo negativo (opcional; si lo dejas vacío se genera uno complementario)
                        </label>
                        <textarea
                          id="bones-negative"
                          value={bonesNegative}
                          onChange={(e) => setBonesNegative(e.target.value)}
                          placeholder='Ej.: "No aceptaré la oferta / no será favorable."'
                          rows={2}
                          disabled={loading}
                        />
                        <label htmlFor="bones-medium" className="meta-line">
                          Soporte ritual (solo estética de imagen)
                        </label>
                        <select
                          id="bones-medium"
                          value={bonesMedium}
                          onChange={(e) => setBonesMedium(e.target.value as "turtle" | "ox")}
                          disabled={loading}
                        >
                          <option value="turtle">Plastrón de tortuga (龟甲)</option>
                          <option value="ox">Escápula de buey (牛骨)</option>
                        </select>
                      </div>
                    ) : null}
                    <div className="composer-actions">
                      <label htmlFor="response-mode">Modo</label>
                      <select
                        id="response-mode"
                        value={responseMode}
                        onChange={(e) => setResponseMode(e.target.value as ResponseMode)}
                        disabled={loading}
                      >
                        <option value="directo">Directo</option>
                        <option value="ritual">Ritual</option>
                        <option value="profundizar">Profundizar</option>
                      </select>
                    </div>
                    {result ? (
                      <div className="session-progress">
                        <span>Profundidad del hilo</span>
                        <p className="meta-line tier-hint-line">
                          Plan <strong>{tier}</strong>: hasta {CONTEXT_LIMITS[tier].sessionDepth} consultas en este hilo
                          (límite de producto, no de tokens).
                        </p>
                        <div className="session-progress-bar">
                          <div
                            className="session-progress-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                ((result.sessionPosition ?? 1) /
                                  Math.max(result.sessionPosition + (result.canDeepen ? 1 : 0), 1)) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                        <small>{result.canDeepen ? "Puedes profundizar en este hilo." : "Límite de hilo alcanzado."}</small>
                      </div>
                    ) : null}
                    {activeThread.length > 0 ? (
                      <p className="meta-line composer-hint-line">Siguiente mensaje sigue en este hilo.</p>
                    ) : null}
                  </section>
                </div>
              </div>

              {showFloatingDeepen ? (
                <div className="composer-floating-suggestions" aria-live="polite">
                  <div className="composer-floating-toolbar">
                    <p className="composer-floating-label">Sugerencias para profundizar</p>
                    {deepenPromptsOpen ? (
                      <button
                        type="button"
                        className="composer-floating-toggle"
                        onClick={() => setDeepenPromptsOpen(false)}
                      >
                        Ocultar
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="composer-floating-toggle"
                        onClick={() => setDeepenPromptsOpen(true)}
                      >
                        Mostrar
                      </button>
                    )}
                  </div>
                  {deepenPromptsOpen ? (
                    <div
                      className="composer-floating-chips composer-floating-chips--scroll"
                      role="group"
                      aria-label="Preguntas sugeridas según la lectura"
                    >
                      {(oracleMode === "iching" ? deepenPromptList : bonesDeepenList).map((q) => (
                        <button
                          key={q}
                          type="button"
                          className="composer-floating-chip"
                          disabled={loading}
                          onClick={() => {
                            setQuestion(q);
                            questionInputRef.current?.focus();
                          }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="composer-minibar">
                <button
                  type="button"
                  className="composer-options-btn"
                  aria-expanded={consultPanelOpen}
                  aria-controls="consult-panel"
                  aria-label={consultPanelOpen ? "Cerrar opciones de consulta" : "Abrir opciones de consulta"}
                  disabled={loading}
                  onClick={() => setConsultPanelOpen((o) => !o)}
                >
                  <span aria-hidden>{consultPanelOpen ? "▾" : "☰"}</span>
                  <span className="composer-mode-tag">Opciones</span>
                </button>
                <div className="composer-input-row">
                  <textarea
                    ref={questionInputRef}
                    data-testid="question-input"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!loading) void onConsult();
                      }
                    }}
                    placeholder={
                      oracleMode === "oracle_bones"
                        ? "Cargo positivo (afirmación)…"
                        : "Escribe tu consulta…"
                    }
                    aria-label="Question"
                    rows={1}
                  />
                  <button
                    type="button"
                    data-testid="consult-btn"
                    disabled={loading}
                    onClick={() => void onConsult()}
                    aria-label={loading ? "Enviando" : "Enviar"}
                  >
                    {loading ? "…" : "➤"}
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
        </div>
      </div>
    </OracleShell>
  );
}
