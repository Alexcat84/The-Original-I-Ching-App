"use client";

import { CONTEXT_LIMITS } from "@iching-oracle/context-engine";
import { OracleShell } from "@iching-oracle/ui";
import { commonStrings, DEFAULT_LOCALE } from "@iching-oracle/i18n";
import type { OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { ConsultationRecordCard } from "@/components/ConsultationRecordCard";
import { CrackPatternGraphic } from "@/components/CrackPatternGraphic";
import { OracleInterpretationMarkdown } from "@/components/OracleInterpretationMarkdown";
import Link from "next/link";
import { ReadingOracleImage } from "@/components/ReadingOracleImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  buildBonesDeepenPrompts,
  buildDeepenPrompts,
  type SuggestionConsultSnapshot,
} from "@/lib/chat-suggestions";
import { isPersistableUuid } from "@/lib/session-ids";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import {
  drawPdfReadingBlocks,
  interpretationMarkdownToPdfBlocks,
} from "@/lib/pdf-chat-export";
import { creditsExhaustedBlock, type BillingTier } from "@/lib/credits-ui-copy";
import { stripInterpretationFluff } from "@/lib/response-clean";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PLANS_HREF = process.env.NEXT_PUBLIC_PLANS_URL?.trim() || "/guia";

/** Default bone surface for API when UI no longer exposes the selector. */
const DEFAULT_BONES_MEDIUM: "turtle" | "ox" = "turtle";

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

function newClientUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function createLocalSession(title = "Nueva sesión"): ChatSessionState {
  return {
    localId: `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    sessionId: newClientUuid(),
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
  const [tier, setTier] = useState<Tier>("free");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [supabaseConfigError, setSupabaseConfigError] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "coins" | "bones" | "reading">("idle");
  const [coinTick, setCoinTick] = useState(0);
  const [oracleMode, setOracleMode] = useState<OracleMode>("iching");
  const [sessions, setSessions] = useState<ChatSessionState[]>([]);
  const [activeSessionLocalId, setActiveSessionLocalId] = useState<string | null>(null);
  const [sessionsHydrated, setSessionsHydrated] = useState(false);
  const [responseMode, setResponseMode] = useState<ResponseMode>("ritual");
  const [error, setError] = useState<string | null>(null);
  const [creditsNotice, setCreditsNotice] = useState<{
    tier: BillingTier;
    limit: number;
    cycleEndsAt: string | null;
  } | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<HTMLElement | null>(null);
  const [chatsOpen, setChatsOpen] = useState(false);
  const [consultPanelOpen, setConsultPanelOpen] = useState(false);
  const [deepenPromptsOpen, setDeepenPromptsOpen] = useState(false);
  const [sharingPersisted, setSharingPersisted] = useState(true);
  /** Shown when user tries to consult without a session (gentle CTA, UI stays visible). */
  const [authContinueOpen, setAuthContinueOpen] = useState(false);

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
  const [emptyThreadInvite, setEmptyThreadInvite] = useState(
    "¿Qué quieres explorar? Escribe tu consulta abajo cuando estés listo.",
  );
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) {
      setEmptyThreadInvite(
        "Buen momento para escuchar al oráculo. ¿Qué inquietud trae este nuevo día? Escribe tu consulta con intención: al enviar, el ritual de las tres monedas trazará el patrón.",
      );
    } else if (h < 20) {
      setEmptyThreadInvite(
        "El cambio sigue moviéndose. ¿Qué necesitas ver con más claridad en el curso de hoy? Tu pregunta abre la consulta; el I Ching mostrará el hexagrama que corresponda.",
      );
    } else {
      setEmptyThreadInvite(
        "La noche también pregunta. ¿Qué frente de tu vida quieres explorar? Deja tu consulta abajo: las monedas dispondrán las líneas del momento.",
      );
    }
  }, []);
  const activeSession = useMemo(() => {
    if (!sessions.length) return null;
    if (!activeSessionLocalId) return sessions[0] ?? null;
    return sessions.find((s) => s.localId === activeSessionLocalId) ?? sessions[0] ?? null;
  }, [sessions, activeSessionLocalId]);
  const activeThread = activeSession?.thread ?? [];
  const result = activeThread.at(-1) ?? null;
  const questionTrimmed = question.trim();
  const threadLimitReached =
    activeThread.length > 0 && result !== null && !result.canDeepen;
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
    const title =
      lang === "en"
        ? "The Original I Ching — Consultation export"
        : "The Original I Ching — Exportación de consulta";
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;
    const maxW = pageW - margin * 2;
    let y = margin;
    const heading = activeSession?.title?.trim() || (lang === "en" ? "Consultation" : "Consulta");
    const idRef = activeThread.at(-1)?.consultationId ?? activeThread[0]?.consultationId ?? "CHAT";
    const fileBase = formatPrintFilename(idRef);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(28, 32, 36);
    doc.text(title, margin, y);
    y += 24;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(88, 96, 104);
    doc.text(
      lang === "en"
        ? `Session: ${heading} · Entries: ${activeThread.length}`
        : `Hilo: ${heading} · Entradas: ${activeThread.length}`,
      margin,
      y,
    );
    y += 28;
    doc.setTextColor(28, 32, 36);

    for (let i = 0; i < activeThread.length; i++) {
      const entry = activeThread[i]!;
      const qLabel = lang === "en" ? "Question" : "Pregunta";
      const aLabel = lang === "en" ? "Reading" : "Lectura";
      const innerPad = 10;
      const innerW = maxW - innerPad * 2;

      const ensure = (h: number) => {
        if (y + h > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      };

      ensure(48);
      doc.setFillColor(241, 246, 248);
      doc.roundedRect(margin, y - 10, maxW, 36, 5, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(70, 110, 120);
      doc.text(`${qLabel} ${i + 1}`, margin + innerPad, y + 4);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(22, 26, 32);
      const qLines = doc.splitTextToSize(entry.question, innerW);
      ensure(qLines.length * 13 + 12);
      doc.text(qLines, margin + innerPad, y);
      y += qLines.length * 13 + 20;

      ensure(36);
      doc.setFillColor(252, 250, 246);
      doc.roundedRect(margin, y - 8, maxW, 28, 5, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(120, 82, 60);
      doc.text(`${aLabel} ${i + 1}`, margin + innerPad, y + 2);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(28, 32, 36);

      const blocks = interpretationMarkdownToPdfBlocks(entry.interpretation);
      y = drawPdfReadingBlocks(doc, blocks, margin + innerPad, innerW, pageH, y);
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

  useEffect(() => {
    if (!authContinueOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAuthContinueOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authContinueOpen]);

  const startNewSession = useCallback(() => {
    const created = createLocalSession("Nueva sesión");
    setSessions((prev) => [created, ...prev.filter((s) => s.thread.length > 0)]);
    setActiveSessionLocalId(created.localId);
    setQuestion("");
    setError(null);
    setChatsOpen(false);
    setConsultPanelOpen(false);
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseBrowserConfigured()) return;
    try {
      await getSupabaseBrowser().auth.signOut();
    } catch {
      // ignore
    }
    setAccessToken(null);
    setAuthEmail(null);
  }, []);

  const sessionsListed = useMemo(() => sessions.filter((s) => s.thread.length > 0), [sessions]);

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
    if (!isSupabaseBrowserConfigured()) {
      setSupabaseConfigError(true);
      setAuthReady(true);
      return;
    }
    let cancelled = false;
    const sb = getSupabaseBrowser();
    void sb.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setAccessToken(session?.access_token ?? null);
      setAuthEmail(session?.user?.email ?? null);
      setAuthReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
      setAuthEmail(session?.user?.email ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setTier("free");
      return;
    }
    let cancelled = false;
    void fetch("/api/account/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { tier?: Tier } | null) => {
        if (cancelled || !j?.tier) return;
        setTier(j.tier);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    async function loadPublicConfig() {
      try {
        const res = await fetch("/api/admin/public-config", { method: "GET" });
        const data = (await res.json()) as {
          ok: boolean;
          config?: {
            responseModeDefault?: ResponseMode;
          };
        };
        if (!res.ok || !data.ok || !data.config) return;
        if (data.config.responseModeDefault) setResponseMode(data.config.responseModeDefault);
      } catch {
        // ignore config load errors
      }
    }
    void loadPublicConfig();
  }, []);

  useEffect(() => {
    let nextSessions: ChatSessionState[] | null = null;
    let nextActive: string | null = null;
    try {
      const sessionsRaw = localStorage.getItem("iching_sessions_v2");
      if (sessionsRaw) {
        const parsed = JSON.parse(sessionsRaw) as { sessions: ChatSessionState[]; activeSessionLocalId: string | null };
        if (parsed.sessions?.length) {
          const normalized = parsed.sessions.map((s) => ({
            ...s,
            publicSessionId: s.publicSessionId ?? null,
            sessionId: isPersistableUuid(s.sessionId) ? s.sessionId : newClientUuid(),
          }));
          const withMessages = normalized.filter((s) => s.thread.length > 0);
          if (withMessages.length === 0) {
            const fresh = createLocalSession("Nueva sesión");
            nextSessions = [fresh];
            nextActive = fresh.localId;
          } else if (parsed.activeSessionLocalId && withMessages.some((s) => s.localId === parsed.activeSessionLocalId)) {
            nextSessions = withMessages;
            nextActive = parsed.activeSessionLocalId;
          } else {
            nextSessions = withMessages;
            nextActive = withMessages[0]!.localId;
          }
        }
      }

      if (!nextSessions) {
        const raw = localStorage.getItem("iching_session_v1");
        if (raw) {
          const parsed = JSON.parse(raw) as {
            thread: ConsultationItem[];
            sessionId: string | null;
            sessionTitle?: string;
          };
          const migrated = createLocalSession(parsed.sessionTitle ?? "Consulta en progreso");
          migrated.thread = parsed.thread ?? [];
          migrated.sessionId = isPersistableUuid(parsed.sessionId) ? parsed.sessionId : newClientUuid();
          migrated.publicSessionId = null;
          nextSessions = [migrated];
          nextActive = migrated.localId;
        }
      }
    } catch {
      nextSessions = null;
    }

    if (!nextSessions?.length) {
      const fresh = createLocalSession("Consulta en progreso");
      nextSessions = [fresh];
      nextActive = fresh.localId;
    }
    setSessions(nextSessions);
    setActiveSessionLocalId(nextActive);
    setSessionsHydrated(true);
  }, []);

  useEffect(() => {
    if (!sessionsHydrated) return;
    const activeId = activeSession?.localId ?? null;
    const storable = sessions.filter((s) => s.thread.length > 0 || s.localId === activeId);
    const isDataImageUrl = (url: string): boolean =>
      url.startsWith("data:image/svg+xml") || url.startsWith("data:image/png;base64,") || url.startsWith("data:image/jpeg;base64,");

    const sanitizeForLocalStorage = (item: ConsultationItem): ConsultationItem => {
      // Avoid stuffing large SVG/raster payloads into localStorage (QuotaExceeded happens fast).
      const safeImageUrl = isDataImageUrl(item.imageUrl) ? "/oracle-fallback.svg" : item.imageUrl;
      const safeFallbackUrl = isDataImageUrl(item.imageFallbackUrl) ? "/oracle-fallback.svg" : item.imageFallbackUrl;

      // imageProviderDebug is only diagnostic; it's not used by UI and adds size.
      const { imageProviderDebug: _ignoredDebug, ...rest } = item as ConsultationItem & { imageProviderDebug?: unknown };
      return {
        ...rest,
        imagePrompt: "",
        imageUrl: safeImageUrl,
        imageFallbackUrl: safeFallbackUrl,
      };
    };

    // Keep localStorage bounded; user can always regenerate images server-side.
    const maxSessionsToStore = 3;
    const maxThreadItemsPerSession = 6;

    const trimmed = [...storable]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, maxSessionsToStore)
      .map((s) => ({
        ...s,
        thread: s.thread.slice(-maxThreadItemsPerSession).map(sanitizeForLocalStorage),
      }));
    const payload = JSON.stringify({
      sessions: trimmed,
      activeSessionLocalId: activeId,
    });
    try {
      localStorage.setItem("iching_sessions_v2", payload);
    } catch (e) {
      // QuotaExceededError can happen when images are embedded as data URLs.
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        localStorage.removeItem("iching_sessions_v2");
      }
    }
  }, [sessions, activeSession, sessionsHydrated]);

  async function onConsult() {
    if (!activeSession) {
      const created = createLocalSession("Consulta en progreso");
      setSessions([created]);
      setActiveSessionLocalId(created.localId);
      return;
    }
    if (threadLimitReached) {
      return;
    }
    if (oracleMode === "oracle_bones" && !question.trim()) {
      setError("Escribe el cargo positivo (una afirmación clara) para consultar los huesos.");
      return;
    }
    if (!accessToken) {
      setAuthContinueOpen(true);
      return;
    }
    setLoading(true);
    setError(null);
    setCreditsNotice(null);
    const showRitualAnimation =
      (oracleMode === "iching" && responseMode !== "directo") ||
      (oracleMode === "oracle_bones" && responseMode !== "directo");
    setPhase(showRitualAnimation ? (oracleMode === "oracle_bones" ? "bones" : "coins") : "idle");
    let ok = false;
    const ticker = showRitualAnimation
      ? window.setInterval(() => setCoinTick((t0) => t0 + 1), 140)
      : null;
    try {
      let sessionIdForRequest = activeSession.sessionId;
      if (!isPersistableUuid(sessionIdForRequest)) {
        sessionIdForRequest = newClientUuid();
        updateActiveSession((c) => ({ ...c, sessionId: sessionIdForRequest }));
      }
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          question: question.trim() || "Silent consultation",
          language: detectInputLanguage(question),
          sessionId: sessionIdForRequest,
          sessionTitle: activeSession.title,
          isDeepening: activeThread.length > 0,
          responseMode,
          oracleMode,
          oracleBones:
            oracleMode === "oracle_bones"
              ? {
                  positiveCharge: question.trim(),
                  negativeCharge: undefined,
                  medium: DEFAULT_BONES_MEDIUM,
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
      const rawText = await res.text();
      let data: ConsultResponse & {
        error?: string;
        message?: string;
        tier?: string;
        creditsLimit?: number;
        cycleEndsAt?: string | null;
      };
      try {
        if (!rawText.trim()) {
          throw new SyntaxError("empty body");
        }
        data = JSON.parse(rawText) as ConsultResponse & { error?: string; message?: string };
      } catch {
        setError(
          res.ok
            ? "Respuesta del servidor inválida."
            : `Error del servidor (${res.status}). Inténtalo de nuevo en unos minutos.`,
        );
        return;
      }
      if (!res.ok) {
        if (res.status === 401) {
          setError("Sesión caducada o no válida. Vuelve a iniciar sesión.");
          void signOut();
          return;
        }
        if (res.status === 402 && data.error === "credits_exhausted") {
          const tiers: BillingTier[] = ["free", "seeker", "practitioner", "master", "oracle"];
          const t = tiers.includes(data.tier as BillingTier) ? (data.tier as BillingTier) : "free";
          const lim = typeof data.creditsLimit === "number" ? data.creditsLimit : 2;
          setCreditsNotice({
            tier: t,
            limit: lim,
            cycleEndsAt: typeof data.cycleEndsAt === "string" ? data.cycleEndsAt : null,
          });
          return;
        }
        const detail =
          typeof data.message === "string" && data.message
            ? ` ${data.message}`
            : "";
        setError(
          data.error === "consult_failed"
            ? `No se pudo completar la consulta.${detail || " Si persiste, revisa la configuración del servidor."}`
            : (data.error ?? `Solicitud fallida (${res.status})`) + detail,
        );
        return;
      }
      if (typeof data.sharingPersisted === "boolean") {
        setSharingPersisted(data.sharingPersisted);
      }
      await new Promise((r) => window.setTimeout(r, showRitualAnimation ? 900 : 0));
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
      if (ticker !== null) window.clearInterval(ticker);
      setLoading(false);
      if (!ok) {
        setPhase("idle");
      }
    }
  }

  const creditsExhaustedCopy = creditsNotice
    ? creditsExhaustedBlock(creditsNotice.tier, creditsNotice.limit, creditsNotice.cycleEndsAt)
    : null;

  return (
    <OracleShell title={t.appTitle} variant="chat">
      <div className="oracle-chat-app">
        {authContinueOpen ? (
          <div className="auth-soft-backdrop" role="presentation" onClick={() => setAuthContinueOpen(false)}>
            <div
              className="auth-soft-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-soft-title"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="auth-soft-eyebrow">Un paso más</p>
              <h2 id="auth-soft-title" className="auth-soft-title">
                Para recibir tu lectura
              </h2>
              <p className="auth-soft-body">
                Puedes explorar el ritual y escribir tu consulta con libertad. Cuando quieras el veredicto del oráculo,
                crea una cuenta gratuita o entra con Google.
              </p>
              <ul className="auth-soft-list">
                <li>Plan gratuito: 2 consultas al mes</li>
              </ul>
              <div className="auth-soft-actions">
                <Link href="/login" className="auth-soft-primary" onClick={() => setAuthContinueOpen(false)}>
                  Crear cuenta o entrar
                </Link>
                <button type="button" className="auth-soft-secondary" onClick={() => setAuthContinueOpen(false)}>
                  Seguir explorando
                </button>
              </div>
            </div>
          </div>
        ) : null}
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
              className="chat-drawer-new-session"
              data-testid="new-session-btn"
              onClick={() => startNewSession()}
              disabled={loading}
            >
              Nueva sesión
            </button>
          </div>
          <div className="sidebar-stats" aria-label="Estadísticas de uso">
            <p className="sidebar-stats-label">Tu actividad</p>
            <div className="sidebar-stats-grid">
              <div className="sidebar-stat-card">
                <span className="sidebar-stat-value">{streakDays}</span>
                <span className="sidebar-stat-key">Racha (días)</span>
              </div>
              <div className="sidebar-stat-card">
                <span className="sidebar-stat-value">{dailyCount}</span>
                <span className="sidebar-stat-key">Consultas hoy</span>
              </div>
              <div className="sidebar-stat-card">
                <span className="sidebar-stat-value">{sessionsListed.length}</span>
                <span className="sidebar-stat-key">Chats con mensajes</span>
              </div>
            </div>
            {loading ? (
              <p className="sidebar-stats-hint">Canalizando consulta…</p>
            ) : (
              <p className="sidebar-stats-hint">Solo se listan hilos con al menos una lectura.</p>
            )}
          </div>
          <div className="chat-drawer-list">
            {sessionsListed.length === 0 ? (
              <p className="chat-drawer-empty">Aún no hay conversaciones guardadas. Envía una consulta para verla aquí.</p>
            ) : null}
            {[...sessionsListed]
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
        {authReady && supabaseConfigError ? (
          <div className="auth-config-banner" role="alert">
            <span>
              Falta configuración del cliente:{" "}
              <code className="auth-gate-code">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code className="auth-gate-code">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </span>
          </div>
        ) : null}
        {authReady && !supabaseConfigError && !accessToken ? (
          <div className="auth-explore-strip">
            <span className="auth-explore-strip-text">
              Explora el oráculo con calma. La lectura completa pide una cuenta gratuita (correo o Google).
            </span>
            <Link href="/login" className="auth-explore-strip-cta">
              Entrar
            </Link>
          </div>
        ) : null}
        <header className="chat-app-bar oracle-intro">
          <div className="chat-app-bar-row chat-app-bar-row--top">
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
            </div>
            <div className="chat-title-logo-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset, responsive CSS sizing */}
              <img
                src="/brand/logo.png"
                alt="The Original I Ching App — 真正的易经"
                className="chat-header-logo"
                width={268}
                height={78}
                decoding="async"
              />
            </div>
            <div className="chat-bar-trail chat-bar-trail--top">
              {!accessToken ? (
                <Link href="/login" className="chat-icon-btn chat-entrar-link">
                  Entrar
                </Link>
              ) : null}
              <ThemeToggle />
            </div>
          </div>
          {accessToken && authEmail ? (
            <div className="chat-app-bar-account">
              <span className="chat-app-bar-account-email" title={authEmail}>
                {authEmail}
              </span>
              <button type="button" className="chat-app-bar-signout" onClick={() => void signOut()}>
                Cerrar sesión
              </button>
            </div>
          ) : null}
          <div className="chat-app-brand">
            <div className="oracle-brand-line">
              {oracleMode === "iching" ? (
                <span className="oracle-cn-mark" lang="zh-Hant">
                  周易
                </span>
              ) : (
                <span className="oracle-brand-mark-lat" lang="es">
                  Huesos
                </span>
              )}
              <span className="oracle-brand-rule" aria-hidden />
              <p className="oracle-tagline">
                {oracleMode === "iching"
                  ? "Tres monedas · Zhu Xi · Wilhelm/Baynes"
                  : "Grietas 兆 (estilo Shang) · sí / no sobre cargos"}
              </p>
            </div>
            <div className="oracle-mode-banner" aria-label="Configuración activa de la consulta">
              <div className="oracle-mode-banner-inner">
                <div className={`oracle-mode-banner-icon-wrap oracle-mode-banner-icon-wrap--${oracleMode === "iching" ? "iching" : "bones"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local mode assets */}
                  <img
                    src={oracleMode === "iching" ? "/brand/mode-iching-coin.png" : "/brand/mode-bones-symbol.png"}
                    alt=""
                    className={`oracle-mode-asset-img oracle-mode-asset-img--${oracleMode === "iching" ? "coin" : "bones"}`}
                    width={88}
                    height={88}
                    decoding="async"
                  />
                </div>
                <div className="oracle-mode-banner-main">
                  <span className="oracle-mode-banner-eyebrow">Oráculo activo</span>
                  <span className="oracle-mode-banner-title">
                    {oracleMode === "iching" ? "I Ching" : "Huesos de oráculo"}
                  </span>
                  <span className="oracle-mode-banner-sub">
                    {oracleMode === "iching"
                      ? "Seis líneas · tres monedas · Zhu Xi"
                      : "Sí / no sobre cargas · grietas al estilo 兆"}
                  </span>
                </div>
                <div className="oracle-mode-banner-reading">
                  <span className="oracle-mode-banner-reading-k">Modo lectura</span>
                  <span className="oracle-mode-banner-reading-v">{responseModeLabelEs(responseMode)}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="chat-room">
          <section className="chat-history" ref={historyRef}>
            {activeThread.length === 0 ? (
              <p className="chat-empty-line">{emptyThreadInvite}</p>
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
                        <h3>Huesos de oráculo</h3>
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
                        <div className="bones-background-pane">
                          <ReadingOracleImage
                            imageUrl={entry.imageUrl}
                            imageFallbackUrl={entry.imageFallbackUrl}
                            downloadBasename={`bones-${entry.consultationId.replace(/-/g, "").slice(0, 12)}`}
                          />
                          {entry.imageUrl.startsWith("data:image/svg+xml") ? (
                            <div className="bones-symbol-overlay" aria-hidden="true">
                              <CrackPatternGraphic
                                patternId={entry.oracleBones.patternId}
                                variant="overlay"
                              />
                            </div>
                          ) : null}
                        </div>
                        <div className="crack-visual-wrap crack-visual-wrap--summary">
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
                      className={`coin ${coin.flip ? "coin-heads" : "coin-tails"} coin-tone-${((coin.id - 1) % 5) + 1}`}
                      style={{ animationDelay: `${coin.delay}ms` }}
                    >
                      <span className="yin-yang" aria-hidden="true">
                        <span className="dot dot-light" />
                        <span className="dot dot-dark" />
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {creditsExhaustedCopy ? (
              <div className="credits-notice-card" role="status">
                <p className="credits-notice-title">{creditsExhaustedCopy.title}</p>
                <p className="credits-notice-body">{creditsExhaustedCopy.body}</p>
                <p className="credits-notice-reset">{creditsExhaustedCopy.resetLine}</p>
                <div className="credits-notice-actions">
                  <Link href={PLANS_HREF} className="credits-notice-primary">
                    {creditsExhaustedCopy.primaryCta}
                  </Link>
                  <button type="button" className="credits-notice-dismiss" onClick={() => setCreditsNotice(null)}>
                    Cerrar
                  </button>
                </div>
              </div>
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
                    <div className="composer-oracle-switch" role="group" aria-label="Tipo de consulta">
                      <div className="composer-oracle-switch-row">
                        <div
                          className="composer-switch-track composer-switch-track--visual"
                          role="tablist"
                          aria-label="I Ching o huesos de oráculo"
                        >
                          <button
                            type="button"
                            role="tab"
                            aria-selected={oracleMode === "iching"}
                            className={`composer-switch-seg composer-switch-seg--visual ${oracleMode === "iching" ? "is-active" : ""}`}
                            onClick={() => setOracleMode("iching")}
                            disabled={loading}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- local mode assets */}
                            <img
                              className="composer-switch-asset"
                              src="/brand/mode-iching-coin.png"
                              alt=""
                              width={44}
                              height={44}
                              decoding="async"
                            />
                            <span className="composer-switch-label">I Ching</span>
                          </button>
                          <button
                            type="button"
                            role="tab"
                            aria-selected={oracleMode === "oracle_bones"}
                            className={`composer-switch-seg composer-switch-seg--visual ${oracleMode === "oracle_bones" ? "is-active" : ""}`}
                            onClick={() => setOracleMode("oracle_bones")}
                            disabled={loading}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- local mode assets */}
                            <img
                              className="composer-switch-asset composer-switch-asset--bones"
                              src="/brand/mode-bones-symbol.png"
                              alt=""
                              width={44}
                              height={44}
                              decoding="async"
                            />
                            <span className="composer-switch-label">Huesos</span>
                          </button>
                        </div>
                        <p className="composer-switch-caption">
                          {oracleMode === "iching"
                            ? "Seis líneas y tres monedas por línea; mutación Zhu Xi."
                            : "Pregunta sí / no con cargo afirmativo; lectura por grietas 兆."}
                        </p>
                      </div>
                    </div>
                    <div className="composer-reading-row" role="group" aria-label="Modo de lectura">
                      <span className="composer-reading-label">Modo lectura</span>
                      <div className="composer-reading-segmented">
                        {(["directo", "ritual", "profundizar"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            className={`composer-reading-pill ${responseMode === m ? "is-active" : ""}`}
                            onClick={() => setResponseMode(m)}
                            disabled={loading}
                          >
                            {responseModeLabelEs(m)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="composer-doc-links">
                      <Link href="/guia">Guía rápida de uso</Link>
                      <Link href="/documentacion/iching#notas-metodos">Notas y origen de los métodos (I Ching y Huesos)</Link>
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

              {threadLimitReached ? (
                <div className="composer-session-limit-float" role="status" aria-live="polite">
                  <p className="composer-session-limit-text">
                    Este hilo ya no admite más consultas en tu plan. Para seguir, abre una sesión nueva.
                  </p>
                  <button
                    type="button"
                    className="composer-session-limit-btn"
                    data-testid="new-session-float-btn"
                    onClick={() => startNewSession()}
                    disabled={loading}
                  >
                    Nueva sesión
                  </button>
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
                        if (!loading && !threadLimitReached) void onConsult();
                      }
                    }}
                    placeholder={
                      threadLimitReached
                        ? "Límite de hilo alcanzado — usa «Nueva sesión» arriba"
                        : oracleMode === "oracle_bones"
                          ? "Cargo positivo (afirmación)…"
                          : "Escribe tu consulta…"
                    }
                    aria-label="Question"
                    rows={1}
                    readOnly={threadLimitReached}
                    aria-disabled={threadLimitReached}
                  />
                  <button
                    type="button"
                    data-testid="consult-btn"
                    disabled={loading || threadLimitReached}
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
