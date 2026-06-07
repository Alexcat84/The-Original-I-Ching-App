"use client";

import { OracleShell } from "@iching-oracle/ui";
import {
  allConsultationInProgressTitles,
  commonStrings,
  DEFAULT_LOCALE,
  formatChatLoadFailedStatus,
  formatConsultFailedMessage,
  formatHistoryLoadFailedStatus,
  formatServerErrorStatus,
  formatThreadDepthStatusLine,
  formatTranslatorRequiresPack,
  formatTwoFactorSupportMailBody,
  getDocNavUiMessages,
  getFreeTierMarketing,
  getHomeChatUiMessages,
  getHomeChromeUiMessages,
  getHomeDrawerUiMessages,
  getHomeSessionUiMessages,
  getHomeTourUiMessages,
  getLanguageLabels,
  getManualWizardMessages,
  getOracleBonesVerdictLabel,
  getPackMarketingLine,
  getPdfExportUiMessages,
  formatPdfEntryLine,
  formatPdfThreadReadingLine,
  getPricingUiMessages,
  getRitualStatusUiMessages,
  getTokenPanelUiMessages,
  getTwoFactorUiMessages,
  getIchingMutationRuleLabel,
  getOnboardingUiMessages,
  getOraclePresentationUiMessages,
  htmlLangFromAppLocale,
  interpolate,
  SUPPORTED_LOCALES,
  UI_LOCALE_STORAGE_KEY,
  type AppLocale,
} from "@iching-oracle/i18n";
import type { OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { AuthLocalePicker } from "@/components/AuthLocalePicker";
import { ConsultationRecordCard } from "@/components/ConsultationRecordCard";
import { ManualIChingCoinWizard } from "@/components/manual-iching/ManualIChingCoinWizard";
import { ManualYarrowWizard } from "@/components/manual-iching/ManualYarrowWizard";
import { AmbientParticles } from "@/components/AmbientParticles";
import BoneRitualAnimation, {
  type BoneOracleResult,
} from "@/components/BoneRitualAnimation";
import { InterpretationMarkdownSafe } from "@/components/InterpretationMarkdownSafe";
import Link from "next/link";
import { ReadingOracleImage } from "@/components/ReadingOracleImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { readThemeFromDocument } from "@/lib/theme";
import { TourTooltip } from "@/components/TourTooltip";
import type { IchingManualLineTuple } from "@/lib/manual-iching-consult";
import { isPersistableUuid } from "@/lib/session-ids";
import {
  getSupabaseBrowser,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase-browser";
import {
  buildCanvasReadingLines,
  drawPdfContinuationChrome,
  interpretationMarkdownToPdfBlocks,
} from "@/lib/pdf-chat-export";
import {
  tierLabelForDisplay,
  toContextTierKey,
  type Tier,
} from "@/lib/credits";
import {
  creditsExhaustedBlock,
  tierToBillingTierCopy,
  type BillingTier,
  type CreditsNoticeReason,
} from "@/lib/credits-ui-copy";
import { PACK_IDS_ORDERED, TOKEN_PACKS } from "@/lib/token-packs";
import type { ChatSessionState } from "@/lib/chat-session-state";
import {
  mergeHydratedWithLocalDrafts,
  pickPreferredSessionLocalId,
} from "@/lib/chat-session-selection";
import { useChatSessionState } from "@/providers/chat-session-provider";
import {
  normalizeInterpretationPunctuation,
  stripInterpretationFluff,
} from "@/lib/response-clean";
import { buildPlansCheckoutUrl } from "@/lib/plans-checkout";
import {
  getIdbChats, putIdbChats, getIdbThread, isThreadFresh, clearIdbUser,
  type IdbChatEntry,
} from "@/lib/idb-cache";
import { useProgressiveRevealSubstring } from "@/hooks/useProgressiveRevealSubstring";
import {
  ichingRitualProcessingBudgetMs,
  ichingRitualRevealTimingFromBudget,
  type IchingRitualRevealTiming,
} from "@/lib/iching-ritual-timing";
import {
  previewCastFromLineValues,
  type CastingMethod,
  type Line,
  type ManualCastPreview,
} from "@iching-oracle/iching-engine";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { EventData, Step } from "react-joyride";
import { STATUS } from "react-joyride";
const JoyrideNoSSR = dynamic(
  () => import("react-joyride").then((mod) => ({ default: mod.Joyride })),
  { ssr: false },
);
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** Default bone surface for API when UI no longer exposes the selector. */
const DEFAULT_BONES_MEDIUM: "turtle" | "ox" = "turtle";

const ICHING_CAST_MODE_STORAGE_KEY = "iching_cast_mode_v1";
const ICHING_CASTING_METHOD_STORAGE_KEY = "iching_casting_method_v1";

const TOUR_STORAGE_KEY = "iching_tour_v1";


const ACCOUNT_SESSION_LIMIT_STORAGE_PREFIX = "iching_account_session_limit_v1:";
const PLAY_PROMO_STRIP_DISMISSED_KEY = "iching_play_promo_strip_dismissed_v1";

function readCachedAccountSessionLimit(userId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(
      `${ACCOUNT_SESSION_LIMIT_STORAGE_PREFIX}${userId}`,
    );
    if (raw == null || raw === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1) return null;
    return Math.floor(n);
  } catch {
    return null;
  }
}

function writeCachedAccountSessionLimit(userId: string, limit: number): void {
  if (typeof window === "undefined") return;
  try {
    if (!Number.isFinite(limit) || limit < 1) return;
    window.sessionStorage.setItem(
      `${ACCOUNT_SESSION_LIMIT_STORAGE_PREFIX}${userId}`,
      String(Math.floor(limit)),
    );
  } catch {
    /* quota / private mode */
  }
}

function clearCachedAccountSessionLimit(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(
      `${ACCOUNT_SESSION_LIMIT_STORAGE_PREFIX}${userId}`,
    );
  } catch {
    /* ignore */
  }
}

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
    affirmsPositive: boolean;
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
  transformedHexagramChinese: string | null;
  mutationRule: string;
  translator?: "wilhelm" | "legge" | "zhouyi" | "master_combined";
  lines: ApiLine[];
  changingLines: number[];
  interpretation: string;
  category: string;
  imageProvider?:
    | "auto"
    | "mock"
    | "svg-art"
    | "pollinations"
    | "fal"
    | "gpt-image"
    | "together";
  imagePrompt: string;
  imageUrl: string;
  imageFallbackUrl: string;
  createdAt?: number;
  sessionId: string | null;
  sessionPosition: number;
  canDeepen: boolean;
  /** Max readings allowed in this thread (same as server `maxDepth`). */
  sessionMaxDepth?: number;
  publicReadingId: string;
  publicSessionId: string;
  remainingCredits?: number;
  sharingPersisted?: boolean;
};

type ConsultationItem = ConsultResponse & { question: string };
type OracleMode = "iching" | "oracle_bones";

function apiLinesToVector(lines: ApiLine[]): Array<6 | 7 | 8 | 9> {
  return [...lines]
    .sort((a, b) => a.position - b.position)
    .map((line) => line.value);
}

function engineLinesToApiLines(lines: Line[]): ApiLine[] {
  return lines.map((l) => ({
    position: l.position,
    value: l.value,
    isChanging: l.isChanging,
    symbol: l.symbol,
  }));
}

function transformLineVector(values: Array<6 | 7 | 8 | 9>): Array<7 | 8> {
  return values.map((value) =>
    value === 6 ? 7 : value === 9 ? 8 : value,
  ) as Array<7 | 8>;
}

type RitualDebugSnapshot = {
  castBase: Array<6 | 7 | 8 | 9>;
  finalBase: Array<6 | 7 | 8 | 9>;
  castTransformed: Array<7 | 8>;
  finalTransformed: Array<7 | 8>;
  match: boolean;
  mutationRule?: string;
  transformedHexagram?: number | null;
};


/** English first in the UI selector (default app language). */
const LOCALE_SELECT_ORDER: AppLocale[] = [
  "en",
  ...SUPPORTED_LOCALES.filter((code): code is AppLocale => code !== "en"),
];

type ApiChatSession = {
  sessionId: string;
  title: string;
  themeCategory: string;
  language: string;
  publicId: string;
  consultationIds: string[];
  createdAt: number;
  maxConsultations?: number | null;
};

type ApiChatConsultation = {
  consultationId: string;
  sessionId: string;
  sessionPosition: number;
  question: string;
  language: string;
  primaryHexagram: number;
  primaryHexagramName: string;
  primaryHexagramChinese: string;
  transformedHexagram: number | null;
  transformedHexagramName: string | null;
  transformedHexagramChinese?: string | null;
  mutationRule: string;
  translator?: string | null;
  lines: ApiLine[];
  changingLines: number[];
  interpretation: string;
  category: string;
  imageProvider: ConsultResponse["imageProvider"];
  imageUrl: string;
  imageFallbackUrl?: string;
  createdAt: number;
  publicId: string;
  oracleType: "iching" | "oracle_bones";
  oracleBones?: {
    pattern_id: number;
    verdict: OracleBonesVerdict;
    positive_charge: string;
    negative_charge: string;
    medium: "turtle" | "ox";
  } | null;
};

type AccountChatsSummaryResponse = {
  sessions: Array<{
    session: ApiChatSession;
    messageCount: number;
    firstConsultationAt: number | null;
    updatedAt: number;
    firstQuestion?: string | null;
  }>;
};

type AccountChatSessionResponse = {
  session: ApiChatSession;
  consultations: ApiChatConsultation[];
};

type BootstrapResponse = AccountChatsSummaryResponse & {
  id: string;
  email: string;
  tokens_available: number;
  session_limit: number;
  last_pack: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: string | null;
  display_name: string | null;
  is_admin: boolean;
  tour_v1_completed: boolean;
  legal_acceptance_current: boolean;
};

const SESSION_IDLE_TIMEOUT_MS = 45 * 60 * 1000;
const SESSION_IDLE_CHECK_INTERVAL_MS = 30 * 1000;

type ApiErrorPayload = {
  error?: string;
  code?: string;
  action?: string;
  message?: string;
};

function parseApiErrorPayload(raw: string): ApiErrorPayload | null {
  try {
    if (!raw.trim()) return null;
    return JSON.parse(raw) as ApiErrorPayload;
  } catch {
    return null;
  }
}

function newClientUuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function createLocalSession(
  title = "Nueva sesión",
): ChatSessionState<ConsultationItem> {
  return {
    localId: `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    sessionId: newClientUuid(),
    publicSessionId: null,
    thread: [],
    threadMaxDepth: null,
    messageCount: 0,
    updatedAt: Date.now(),
    firstConsultationAt: null,
  };
}

function InterpretationBody({
  text,
  reveal,
  onRevealComplete,
}: {
  text: string;
  reveal?: boolean;
  onRevealComplete?: () => void;
}) {
  const cleaned = useMemo(
    () => normalizeInterpretationPunctuation(stripInterpretationFluff(text)),
    [text],
  );
  const displayed = useProgressiveRevealSubstring(
    cleaned,
    Boolean(reveal),
    onRevealComplete,
  );
  if (!cleaned) return null;
  return (
    <div className="interpretation-text interpretation-text--body">
      <InterpretationMarkdownSafe partial={displayed} full={cleaned} />
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
  const id = consultationId
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10)
    .toUpperCase();
  return `${y}${m}${d}-${hh}${mm}-${id}`;
}

function mapApiConsultationToItem(
  c: ApiChatConsultation,
  sessionPublicId: string,
  threadMaxDepth: number,
): ConsultationItem {
  const cap = Math.max(1, threadMaxDepth);
  return {
    oracleType: c.oracleType,
    consultationId: c.consultationId,
    primaryHexagram: c.primaryHexagram,
    primaryHexagramName: c.primaryHexagramName,
    primaryHexagramChinese: c.primaryHexagramChinese,
    transformedHexagram: c.transformedHexagram,
    transformedHexagramName: c.transformedHexagramName,
    transformedHexagramChinese: c.transformedHexagramChinese ?? null,
    mutationRule: c.mutationRule,
    lines: c.lines,
    changingLines: c.changingLines,
    interpretation: c.interpretation,
    category: c.category,
    imageProvider: c.imageProvider,
    imagePrompt: "",
    imageUrl: c.imageUrl,
    imageFallbackUrl: c.imageFallbackUrl ?? c.imageUrl,
    createdAt: c.createdAt,
    sessionId: c.sessionId,
    sessionPosition: c.sessionPosition,
    canDeepen: c.sessionPosition < cap,
    publicReadingId: c.publicId,
    publicSessionId: sessionPublicId,
    sharingPersisted: true,
    question: c.question,
    translator: (c.translator as ConsultResponse["translator"]) ?? undefined,
    oracleBones: c.oracleBones
      ? {
          patternId: c.oracleBones.pattern_id,
          verdict: c.oracleBones.verdict,
          affirmsPositive: c.oracleBones.verdict.startsWith("auspicious"),
          positiveCharge: c.oracleBones.positive_charge,
          negativeCharge: c.oracleBones.negative_charge,
          medium: c.oracleBones.medium,
        }
      : undefined,
  };
}

function detectInputLanguage(
  question: string,
  fallbackLocale: AppLocale,
): AppLocale {
  const text = question.trim().toLowerCase();
  if (!text) return fallbackLocale;
  if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text)) return "ko";
  if (/[ぁ-ゖァ-ヺ]/.test(text)) return "ja";
  if (/[一-鿿]/.test(text)) return "zh";

  const ptHits = (text.match(/\b(não|você|está|ção|ções|pra|queria)\b/g) ?? [])
    .length;
  const frHits = (
    text.match(/\b(être|avec|pourquoi|où|ça|merci|vous)\b/g) ?? []
  ).length;
  const deHits = (
    text.match(/\b(und|nicht|ich|dass|über|möchte|fragen)\b/g) ?? []
  ).length;
  const itHits = (
    text.match(/\b(perché|con|sono|voglio|grazie|quindi|domanda)\b/g) ?? []
  ).length;

  const esHits =
    (
      text.match(
        /\b(el|la|los|las|de|que|para|con|por|como|qué|dónde|cuál|mensaje|consulta|camino|relación)\b/g,
      ) ?? []
    ).length + (text.match(/[áéíóúñ¿¡]/g) ?? []).length;
  if (fallbackLocale === "es" && esHits > 0) return "es";
  if (ptHits >= 3 && ptHits > esHits + 1) return "pt";
  if (frHits >= 2) return "fr";
  if (deHits >= 2) return "de";
  if (itHits >= 2) return "it";
  const enHits = (
    text.match(
      /\b(the|and|what|where|when|why|how|message|relationship|question|path|oracle|reading)\b/g,
    ) ?? []
  ).length;
  if (enHits > esHits) return "en";
  if (esHits > 0) return "es";
  return fallbackLocale;
}

export default function HomePage() {
  const router = useRouter();
  const [locale, setLocale] = useState<AppLocale>(DEFAULT_LOCALE);
  const ui = useMemo(() => getHomeChatUiMessages(locale), [locale]);
  const tour = useMemo(() => getHomeTourUiMessages(locale), [locale]);
  const t = commonStrings[locale];
  const tokenPanel = useMemo(() => getTokenPanelUiMessages(locale), [locale]);
  const docNav = useMemo(() => getDocNavUiMessages(locale), [locale]);
  const presentation = useMemo(
    () => getOraclePresentationUiMessages(locale),
    [locale],
  );
  /** Official listing URL when published; empty shows “coming soon” on the Play card. */
  const playStoreUrl = (process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "").trim();
  const chrome = useMemo(() => getHomeChromeUiMessages(locale), [locale]);
  const manualWizardChrome = useMemo(
    () => getManualWizardMessages(locale),
    [locale],
  );
  const sessionUi = useMemo(() => getHomeSessionUiMessages(locale), [locale]);
  const tf = useMemo(() => getTwoFactorUiMessages(locale), [locale]);
  const pricingUi = useMemo(() => getPricingUiMessages(locale), [locale]);
  const drawerText = useMemo(() => getHomeDrawerUiMessages(locale), [locale]);
  const exportPdfLabel = chrome.exportChatPdf;
  const downloadImageLabel = chrome.downloadImage;
  const openImageLabel = chrome.openFullImage;
  const symbolicImageAlt = chrome.symbolicImageAlt;
  const inProgressTitle = chrome.consultationInProgress;
  const knownNewSessionTitles = useMemo(() => {
    return new Set<string>(
      SUPPORTED_LOCALES.map((code) => getHomeChatUiMessages(code).sessionNew),
    );
  }, []);
  const knownInProgressTitles = useMemo(
    () => new Set<string>(allConsultationInProgressTitles()),
    [],
  );
  const [tier, setTier] = useState<Tier>("free");
  const [tierReady, setTierReady] = useState(false);
  /** Per-thread reading cap from `/api/account/me` (`session_limit`, from pack / tier). */
  const [accountSessionLimit, setAccountSessionLimit] = useState(1);
  const accountSessionLimitRef = useRef(1);
  accountSessionLimitRef.current = accountSessionLimit;
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // Refs so event-handler closures (rn:thread-not-found) always see current values
  // without adding them to effect dependency arrays and re-registering listeners.
  const accessTokenRef = useRef<string | null>(null);
  accessTokenRef.current = accessToken;
  const [authReady, setAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  // Synchronous read on mount — eliminates the blank-bar flash while Supabase resolves.
  // Populated by the effect below whenever authReady resolves with a real session.
  const [cachedAuthEmail] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("_rnAuthEmail");
  });
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  /** Last known Supabase user id (for clearing per-user sessionStorage on sign-out). */
  const lastSignedInUserIdForStorageRef = useRef<string | null>(null);
  const [supabaseConfigError, setSupabaseConfigError] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "coins" | "bones" | "reading">(
    "idle",
  );
  const [boneRitualResult, setBoneRitualResult] =
    useState<BoneOracleResult | null>(null);
  const [ritualLines, setRitualLines] = useState<ApiLine[] | null>(null);
  const [ritualRevealTick, setRitualRevealTick] = useState(0);
  const [ritualAwaitingTick, setRitualAwaitingTick] = useState(0);
  const [ritualStatusPhase, setRitualStatusPhase] = useState<
    "question" | "consult" | "shape" | "seal"
  >("question");
  const [ritualParticles, setRitualParticles] = useState<
    Array<{
      id: number;
      left: string;
      top: string;
      size: string;
      duration: string;
      delay: string;
    }>
  >([]);
  const [ritualFinale, setRitualFinale] = useState(false);
  const [ritualDebugCastVector, setRitualDebugCastVector] = useState<Array<
    6 | 7 | 8 | 9
  > | null>(null);
  const [ritualDebugFinalVector, setRitualDebugFinalVector] = useState<Array<
    6 | 7 | 8 | 9
  > | null>(null);
  const [lastRitualDebugSnapshot, setLastRitualDebugSnapshot] =
    useState<RitualDebugSnapshot | null>(null);
  const [oracleMode, setOracleMode] = useState<OracleMode>("iching");
  type IchingCastMode = "auto" | "manual";
  const [ichingCastMode, setIchingCastMode] = useState<IchingCastMode>("auto");
  useEffect(() => {
    try {
      window.localStorage.setItem(ICHING_CAST_MODE_STORAGE_KEY, ichingCastMode);
    } catch {
      /* ignore */
    }
  }, [ichingCastMode]);
  const [translatorId, setTranslatorId] = useState<
      "wilhelm" | "legge" | "zhouyi" | "master_combined"
    >("wilhelm");

  const tierAccessKey = useMemo<
    "free" | "seeker" | "practitioner" | "master" | "oracle"
  >(() => {
    const raw = (tier ?? "free").toLowerCase();
    if (raw === "oracle") return "oracle";
    if (
      raw === "free" ||
      raw === "seeker" ||
      raw === "practitioner" ||
      raw === "master"
    ) {
      return raw;
    }
    return toContextTierKey(raw);
  }, [tier]);

  const tierAccessIndex = useMemo(() => {
    if (tierAccessKey === "oracle") return 4;
    const tiers = ["free", "seeker", "practitioner", "master"] as const;
    return tiers.indexOf(tierAccessKey);
  }, [tierAccessKey]);

  const handleTranslatorChange = (id: "wilhelm" | "legge" | "zhouyi" | "master_combined") => {
    if (isAdmin) {
      setError(null);
      setTranslatorId(id);
      return;
    }
    if (id === "legge" && tierAccessIndex < 1) {
      setError(formatTranslatorRequiresPack(sessionUi, "Seeker"));
      return;
    }
    if (id === "zhouyi" && tierAccessIndex < 2) {
      setError(formatTranslatorRequiresPack(sessionUi, "Practitioner"));
      return;
    }
    if (id === "master_combined" && tierAccessIndex < 3) {
      setError(formatTranslatorRequiresPack(sessionUi, "Master"));
      return;
    }
    setError(null);
    setTranslatorId(id);
  };

  const [ichingCastingMethod, setIchingCastingMethod] = useState<CastingMethod>(
    () => {
      if (typeof window === "undefined") return "three-coins";
      try {
        return window.localStorage.getItem(
          ICHING_CASTING_METHOD_STORAGE_KEY,
        ) === "yarrow-stalks"
          ? "yarrow-stalks"
          : "three-coins";
      } catch {
        return "three-coins";
      }
    },
  );
  useEffect(() => {
    try {
      window.localStorage.setItem(
        ICHING_CASTING_METHOD_STORAGE_KEY,
        ichingCastingMethod,
      );
    } catch {
      /* ignore */
    }
  }, [ichingCastingMethod]);
  const [manualWizardOpen, setManualWizardOpen] = useState(false);
  const [manualWizardQuestionSnapshot, setManualWizardQuestionSnapshot] =
    useState<string | null>(null);
  const [manualYarrowWizardOpen, setManualYarrowWizardOpen] = useState(false);
  const [manualYarrowQuestionSnapshot, setManualYarrowQuestionSnapshot] =
    useState<string | null>(null);
  const [manualCastPreview, setManualCastPreview] = useState<{
    primaryHexagram: number;
    primaryHexagramChinese: string;
    transformedHexagram: number | null;
    mutationRule: string;
  } | null>(null);
  const {
    sessions,
    setSessions,
    activeSessionLocalId,
    setActiveSessionLocalId,
    sessionsHydrated,
    setSessionsHydrated,
    sessionsServerHydrated,
    setSessionsServerHydrated,
    setPersistenceKeys,
    hydrateFromStorage,
  } = useChatSessionState<ConsultationItem>();
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;
  const serverHydratedRef = useRef(sessionsServerHydrated);
  serverHydratedRef.current = sessionsServerHydrated;
  const [error, setError] = useState<string | null>(null);
  const [creditsNotice, setCreditsNotice] = useState<{
    tier: BillingTier;
    reason: CreditsNoticeReason;
  } | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(null);
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [twoFactorQrDataUrl, setTwoFactorQrDataUrl] = useState<string | null>(
    null,
  );
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorEmailCode, setTwoFactorEmailCode] = useState("");
  const [twoFactorRecoveryCode, setTwoFactorRecoveryCode] = useState("");
  const [twoFactorChallengeFailures, setTwoFactorChallengeFailures] =
    useState(0);
  const [twoFactorRecoveryAssistMode, setTwoFactorRecoveryAssistMode] =
    useState<"hidden" | "options" | "enter_code" | "contact_support">("hidden");
  const [twoFactorEmailSent, setTwoFactorEmailSent] = useState(false);
  const [twoFactorRecoveryCodes, setTwoFactorRecoveryCodes] = useState<
    string[]
  >([]);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorModalMode, setTwoFactorModalMode] = useState<
    "manage" | "challenge"
  >("manage");
  const [twoFactorSetupMethod, setTwoFactorSetupMethod] = useState<
    "menu" | "totp" | "email"
  >("menu");
  const [twoFactorChallengeMethod, setTwoFactorChallengeMethod] = useState<
    "totp" | "email"
  >("totp");
  const [twoFactorRecoveryAck, setTwoFactorRecoveryAck] = useState(false);
  const [twoFactorInfo, setTwoFactorInfo] = useState<string | null>(null);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [secondFactorVerified, setSecondFactorVerified] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState<string | null | undefined>(
    undefined,
  );
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<"enter" | "confirm">(
    "enter",
  );
  const [onboardingInput, setOnboardingInput] = useState("");
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const [pendingUserQuestion, setPendingUserQuestion] = useState<string | null>(
    null,
  );
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [tokenCenterMessageKey, setTokenCenterMessage] = useState<"checkout_error" | null>(null);
  const tokenCenterMessage = tokenCenterMessageKey === "checkout_error"
    ? pricingUi.errorCheckout
    : null;
  const [tokenCenterOpen, setTokenCenterOpen] = useState(false);
  const [tokenCenterBusy, setTokenCenterBusy] = useState(false);
  const [tokenCenterError, setTokenCenterError] = useState<string | null>(null);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState("");
  const [deleteAccountBusy, setDeleteAccountBusy] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingSessionLocalId, setLoadingSessionLocalId] = useState<
    string | null
  >(null);
  const [pendingDeletedSessionLocalIds, setPendingDeletedSessionLocalIds] =
    useState<string[]>([]);
  const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [tourRun, setTourRun] = useState(false);
  const tourFiredRef = useRef(false);
  const [tourKey, setTourKey] = useState(0);
  const [tourTheme, setTourTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    setTourTheme(readThemeFromDocument());
    const obs = new MutationObserver(() => setTourTheme(readThemeFromDocument()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  const endRef = useRef<HTMLDivElement | null>(null);
  const ritualCoinsStageRef = useRef<HTMLElement | null>(null);
  const ritualLinesGridRef = useRef<HTMLDivElement | null>(null);
  const ritualDebugStartMsRef = useRef<number | null>(null);
  /** Wall-clock start of `/api/consult` for I Ching (manual + auto SSE). */
  const ichingConsultWallClockStartedAtRef = useRef<number | null>(null);
  /** Clamp-stored duration from last successful I Ching consult; feeds next auto ritual timing. */
  const lastIchingConsultWallMsRef = useRef<number | null>(null);
  /** Manual cast: timer that flips from phase-1 grid to phase-2 final focus. */
  const manualRitualPhaseSwitchTimerRef = useRef<number | null>(null);
  /** Manual cast: tracks whether phase-2 is already visible. */
  const manualRitualFinaleShownRef = useRef(false);
  const lastScrollWasRevealRef = useRef(false);
  const prevActiveSessionLocalIdForScrollRef = useRef<string | null>(null);
  const mountScrollDoneRef = useRef(false);
  const rnLoadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyRef = useRef<HTMLElement | null>(null);
  const idleSignOutRef = useRef(false);
  const isSigningOutRef = useRef(false);
  /** Tracks the authUserId for which bootstrap already completed successfully.
   *  Prevents redundant re-runs when deps like loadSessionThread recreate
   *  without an actual user change (e.g., after accountSessionLimit updates). */
  const bootstrapCompletedForRef = useRef<string | null>(null);
  /** User IDs already redirected to /auth/complete-legal this page session.
   *  Prevents a second redirect when TOKEN_REFRESHED fires while the DB write
   *  from the just-accepted consent hasn't propagated to the reader yet. */
  const legalRedirectSentForRef = useRef(new Set<string>());
  const activeSessionLocalIdRef = useRef<string | null>(null);
  const pinnedLocalSessionIdRef = useRef<string | null>(null);
  const [chatsOpen, setChatsOpen] = useState(false);
  const [consultPanelOpen, setConsultPanelOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  /** Hides only the thread-limit strip; composer stays read-only until a new session or another chat. */
  const [threadLimitBannerDismissed, setThreadLimitBannerDismissed] =
    useState(false);
  const [playPromoDismissed, setPlayPromoDismissed] = useState(false);
  const [revealConsultationId, setRevealConsultationId] = useState<
    string | null
  >(null);
  /** Shown when user tries to consult without a session (gentle CTA, UI stays visible). */
  const [authContinueOpen, setAuthContinueOpen] = useState(false);
  /**
   * Prevents the first `useEffect` pass from persisting the default `en` before `useLayoutEffect`
   * hydrates from `localStorage` (same bug on web and APK WebView after /docs → /).
   */
  const skipInitialLocalePersistenceRef = useRef(true);

  /**
   * Hydrate locale from storage/cookie **before** passive effects run.
   * Manual-only: do not infer from `navigator` (would fight the picker after docs → home).
   */
  useLayoutEffect(() => {
    let next: AppLocale | null = null;
    const raw = window.localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
      next = raw as AppLocale;
    } else {
      const cookieMatch = document.cookie.match(
        /(?:^|;\s*)iching_ui_locale=([^;]+)/,
      );
      const cookieLocale = cookieMatch
        ? decodeURIComponent(cookieMatch[1] ?? "")
        : "";
      if ((SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
        next = cookieLocale as AppLocale;
      }
    }
    if (next) {
      setLocale(next);
      try {
        window.localStorage.setItem(UI_LOCALE_STORAGE_KEY, next);
        document.documentElement.lang = htmlLangFromAppLocale(next);
        document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
        document.cookie = `iching_ui_locale=${encodeURIComponent(next)}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        /* private mode / cookies blocked */
      }
    }
    try {
      if (window.localStorage.getItem(ICHING_CAST_MODE_STORAGE_KEY) === "manual") {
        setIchingCastMode("manual");
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* RN `__rnSetLocale` + storage sync from other tabs — keep React state aligned */
  useEffect(() => {
    const onLocaleBridge = (e: Event) => {
      const raw = (e as CustomEvent<{ locale?: string }>).detail?.locale;
      if (!raw || !(SUPPORTED_LOCALES as readonly string[]).includes(raw))
        return;
      const next = raw as AppLocale;
      setLocale((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("iching:locale-changed", onLocaleBridge);
    return () =>
      window.removeEventListener("iching:locale-changed", onLocaleBridge);
  }, []);

  useEffect(() => {
    if (skipInitialLocalePersistenceRef.current) {
      skipInitialLocalePersistenceRef.current = false;
      return;
    }
    try {
      window.localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale);
      document.documentElement.lang = htmlLangFromAppLocale(locale);
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      document.cookie = `iching_ui_locale=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* private mode */
    }
    window.dispatchEvent(
      new CustomEvent("iching:locale-changed", { detail: { locale } }),
    );
  }, [locale]);

  useEffect(() => {
    if (phase !== "coins" || !loading || ritualLines !== null) {
      setRitualAwaitingTick(0);
      return;
    }
    setRitualStatusPhase("consult");
    const tickTimer = window.setInterval(() => {
      setRitualAwaitingTick((prev) => (prev >= 12 ? 1 : prev + 1));
    }, 380);
    const phases: Array<"question" | "consult" | "shape"> = [
      "question",
      "consult",
      "shape",
    ];
    let idx = 0;
    const statusTimer = window.setInterval(() => {
      idx = (idx + 1) % phases.length;
      setRitualStatusPhase(phases[idx]!);
    }, 1400);
    return () => {
      window.clearInterval(tickTimer);
      window.clearInterval(statusTimer);
    };
  }, [phase, loading, ritualLines]);

  const ritualTraceEnabled = process.env.NODE_ENV !== "production";
  const logRitualTrace = useCallback(
    (label: string, payload?: Record<string, unknown>) => {
      if (!ritualTraceEnabled) return;
      const start = ritualDebugStartMsRef.current;
      const elapsedMs = typeof start === "number" ? Date.now() - start : -1;
      if (payload) {
        console.info(`[ritual][+${elapsedMs}ms] ${label}`, payload);
      } else {
        console.info(`[ritual][+${elapsedMs}ms] ${label}`);
      }
      void fetch("/api/ritual-debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, elapsedMs, payload }),
        keepalive: true,
      }).catch(() => {});
    },
    [ritualTraceEnabled],
  );

  useEffect(() => {
    if (!ritualTraceEnabled) return;
    logRitualTrace("state", {
      phase,
      loading,
      ritualStatusPhase,
      ritualRevealTick,
      ritualAwaitingTick,
      ritualFinale,
      hasRitualLines: ritualLines !== null,
    });
  }, [
    phase,
    loading,
    ritualStatusPhase,
    ritualRevealTick,
    ritualAwaitingTick,
    ritualFinale,
    ritualLines,
    ritualTraceEnabled,
    logRitualTrace,
  ]);

  useEffect(() => {
    if (!ritualTraceEnabled || phase !== "coins") return;
    const measure = () => {
      const stageEl = ritualCoinsStageRef.current;
      const gridEl = ritualLinesGridRef.current;
      const stageRect = stageEl?.getBoundingClientRect();
      const gridRect = gridEl?.getBoundingClientRect();
      const stageFromQueryEl = document.querySelector<HTMLElement>(
        '[data-testid="coin-throw"]',
      );
      const stageFromQuery = stageFromQueryEl?.getBoundingClientRect();
      logRitualTrace("layout", {
        stageRect: stageRect
          ? {
              width: Math.round(stageRect.width),
              height: Math.round(stageRect.height),
              top: Math.round(stageRect.top),
              bottom: Math.round(stageRect.bottom),
            }
          : null,
        stageRectQuery: stageFromQuery
          ? {
              width: Math.round(stageFromQuery.width),
              height: Math.round(stageFromQuery.height),
              top: Math.round(stageFromQuery.top),
              bottom: Math.round(stageFromQuery.bottom),
            }
          : null,
        stageContainsGrid: Boolean(
          stageEl && gridEl ? stageEl.contains(gridEl) : false,
        ),
        stageParentClass: stageEl?.parentElement?.className ?? null,
        gridParentClass: gridEl?.parentElement?.className ?? null,
        stageComputed: stageEl
          ? {
              display: window.getComputedStyle(stageEl).display,
              position: window.getComputedStyle(stageEl).position,
              overflow: window.getComputedStyle(stageEl).overflow,
            }
          : null,
        gridComputed: gridEl
          ? {
              display: window.getComputedStyle(gridEl).display,
              position: window.getComputedStyle(gridEl).position,
            }
          : null,
        gridRect: gridRect
          ? {
              width: Math.round(gridRect.width),
              height: Math.round(gridRect.height),
              top: Math.round(gridRect.top),
              bottom: Math.round(gridRect.bottom),
            }
          : null,
      });
    };
    measure();
    const timer = window.setInterval(measure, 1000);
    window.addEventListener("resize", measure);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("resize", measure);
    };
  }, [phase, ritualTraceEnabled, logRitualTrace]);

  useEffect(() => {
    setRitualParticles(
      Array.from({ length: 90 }, (_, i) => {
        const left = `${Math.floor(Math.random() * 100)}%`;
        const top = `${Math.floor(Math.random() * 100)}%`;
        const size = `${1.7 + Math.random() * 3.1}px`;
        const duration = `${14 + Math.random() * 18}s`;
        const delay = `${Math.random() * 10}s`;
        return { id: i, left, top, size, duration, delay };
      }),
    );
  }, []);

  const ritualRenderOrder: Array<ApiLine["position"]> = [6, 5, 4, 3, 2, 1];
  const ritualDebugEnabled =
    process.env.NEXT_PUBLIC_ICHING_RITUAL_DEBUG === "1" ||
    process.env.NEXT_PUBLIC_ICHING_RITUAL_DEBUG === "true";
  const ritualStatusLine = useMemo(() => {
    const status = getRitualStatusUiMessages(locale);
    switch (ritualStatusPhase) {
      case "question":
        return status.question;
      case "consult":
        return status.consult;
      case "shape":
        return status.shape;
      case "seal":
        return status.seal;
    }
  }, [locale, ritualStatusPhase]);
  const ritualDebugCastTransformed = useMemo(
    () =>
      ritualDebugCastVector ? transformLineVector(ritualDebugCastVector) : null,
    [ritualDebugCastVector],
  );
  const ritualDebugFinalTransformed = useMemo(
    () =>
      ritualDebugFinalVector
        ? transformLineVector(ritualDebugFinalVector)
        : null,
    [ritualDebugFinalVector],
  );
  const ritualDebugMatch = useMemo(() => {
    if (!ritualDebugCastTransformed || !ritualDebugFinalTransformed)
      return null;
    return (
      ritualDebugCastTransformed.join(",") ===
      ritualDebugFinalTransformed.join(",")
    );
  }, [ritualDebugCastTransformed, ritualDebugFinalTransformed]);
  const [emptyThreadInvite, setEmptyThreadInvite] = useState(
    ui.emptyInviteMorning,
  );
  const userStorageScope = authUserId ?? "anon";
  const streakDayStorageKey = `iching_last_day_${userStorageScope}`;
  const streakDaysStorageKey = `iching_streak_days_${userStorageScope}`;
  const dailyCountStorageKey = useCallback(
    (day: string) => `iching_daily_count_${userStorageScope}_${day}`,
    [userStorageScope],
  );
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) {
      setEmptyThreadInvite(ui.emptyInviteMorning);
    } else if (h < 20) {
      setEmptyThreadInvite(ui.emptyInviteAfternoon);
    } else {
      setEmptyThreadInvite(ui.emptyInviteNight);
    }
  }, [ui.emptyInviteAfternoon, ui.emptyInviteMorning, ui.emptyInviteNight]);
  const activeSession = useMemo(() => {
    if (!sessions.length) return null;
    if (!activeSessionLocalId) return sessions[0] ?? null;
    return (
      sessions.find((s) => s.localId === activeSessionLocalId) ??
      sessions[0] ??
      null
    );
  }, [sessions, activeSessionLocalId]);
  useEffect(() => {
    activeSessionLocalIdRef.current = activeSessionLocalId;
  }, [activeSessionLocalId]);
  const activeThread = activeSession?.thread ?? [];
  const result = activeThread.at(-1) ?? null;
  /** Per-thread cap from current plan (`/api/account/me` session_limit). API enforces this, not the DB session row. */
  const planThreadLimit = Math.max(1, accountSessionLimit);
  const threadDepthCap = planThreadLimit;
  const threadDepthCanDeepen =
    isAdmin || Boolean(result && result.sessionPosition < planThreadLimit);
  const threadLimitReached =
    !isAdmin &&
    activeThread.length > 0 &&
    result !== null &&
    !threadDepthCanDeepen;
  /** Until `/api/account/me` hydrates `accountSessionLimit`, default `1` would falsely flag paid threads — never show limit UI until `tierReady`. */
  const threadLimitReachedUi = tierReady && threadLimitReached;
  const showThreadLimitBanner =
    threadLimitReachedUi && !threadLimitBannerDismissed;
  useEffect(() => {
    setThreadLimitBannerDismissed(false);
  }, [activeSessionLocalId]);
  useEffect(() => {
    if (!threadLimitReached) setThreadLimitBannerDismissed(false);
  }, [threadLimitReached]);
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(PLAY_PROMO_STRIP_DISMISSED_KEY) === "1") {
        setPlayPromoDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);


  const handleTourCallback = useCallback(
    ({ status }: EventData) => {
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setTourRun(false);
        tourFiredRef.current = false;
        setConsultPanelOpen(false);
        try { localStorage.setItem(TOUR_STORAGE_KEY, "1"); } catch { /* ignore */ }
        // Persist to DB so reinstalls don't replay the tour for this account.
        void fetch("/api/account/tour-complete", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessTokenRef.current ?? ""}` },
        }).catch(() => undefined);
      }
    },
    [setConsultPanelOpen, accessTokenRef],
  );

  // before-hook factories for drawer/panel steps — open the container, wait for
  // CSS transition, scroll the target into view, then wait before Joyride spotlights.
  const tourBeforeDrawer = useCallback(
    () =>
      new Promise<void>((resolve) => {
        setChatsOpen(true);
        setTimeout(() => {
          document.getElementById("tour-new-session-btn")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          setTimeout(resolve, 350);
        }, 240);
      }),
    [setChatsOpen],
  );

  const isRnWebView = useCallback(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("iching-rn-webview"),
    [],
  );

  const tourBeforeCloseDrawer = useCallback(
    () => new Promise<void>((resolve) => {
      setChatsOpen(false);
      setTimeout(resolve, 260);
    }),
    [setChatsOpen],
  );

  const tourBeforePanel = useCallback(
    (id: string, openPanel: boolean) =>
      () =>
        new Promise<void>((resolve) => {
          if (openPanel) { setChatsOpen(false); setConsultPanelOpen(true); }
          // Use "instant" scroll (no animation) so the element is already at
          // its final position when Joyride calls getBoundingClientRect().
          // On WebView Android, smooth scrolling has variable duration that
          // causes the spotlight to be measured mid-scroll and misaligned.
          const panelOpenDelay = openPanel ? 320 : 0;
          setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "center" });
            // Small settle tick for layout/paint after instant scroll.
            requestAnimationFrame(() => setTimeout(resolve, isRnWebView() ? 160 : 60));
          }, panelOpenDelay);
        }),
    [setChatsOpen, setConsultPanelOpen, isRnWebView],
  );
  const dismissPlayPromoStrip = useCallback(() => {
    try {
      sessionStorage.setItem(PLAY_PROMO_STRIP_DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
    setPlayPromoDismissed(true);
  }, []);
  const tierDisplayNode = tierReady ? (
    isAdmin ? (
      "admin"
    ) : (
      tierLabelForDisplay(tier)
    )
  ) : (
    <span className="plan-tier-skeleton" aria-hidden="true" />
  );
  const supportEmailFromEnv =
    typeof process !== "undefined" &&
    typeof process.env.NEXT_PUBLIC_SUPPORT_EMAIL === "string"
      ? process.env.NEXT_PUBLIC_SUPPORT_EMAIL.trim()
      : "";
  const twoFactorSupportEmail =
    supportEmailFromEnv || "soporte@the-original-i-ching.app";
  const preferredTwoFactorMethod: "totp" | "email" =
    twoFactorMethod === "email" ? "email" : "totp";
  const questionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const QUESTION_INPUT_MAX_HEIGHT_PX = 160;
  const QUESTION_INPUT_MAX_CHARS = 4000;
  const resizeQuestionInput = useCallback(() => {
    const el = questionInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(QUESTION_INPUT_MAX_HEIGHT_PX, el.scrollHeight);
    const narrow =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 520px)")?.matches;
    const minOneLinePx = narrow ? 38 : 44;
    el.style.height = `${Math.max(minOneLinePx, nextHeight)}px`;
    el.style.overflowY =
      el.scrollHeight > QUESTION_INPUT_MAX_HEIGHT_PX ? "auto" : "hidden";
  }, []);
  /** Browser + RN WebView: rounded top cap on auth strip when guest or signed-in strip is shown. */
  const showAuthExploreCap =
    authReady &&
    !supabaseConfigError &&
    (!accessToken || Boolean(accessToken && authEmail));
  const summaryCacheKey = authUserId
    ? `iching_chat_summaries_v1:${authUserId}`
    : null;
  const chatStateCacheKey = authUserId
    ? `iching_chat_state_v1:${authUserId}`
    : null;

  useEffect(() => {
    setPersistenceKeys(summaryCacheKey, chatStateCacheKey);
  }, [summaryCacheKey, chatStateCacheKey, setPersistenceKeys]);

  useEffect(() => {
    resizeQuestionInput();
  }, [question, resizeQuestionInput]);

  async function exportChatPdf(): Promise<void> {
    if (!activeThread.length) return;
    const { jsPDF } = await import("jspdf");
    const pdfUi = getPdfExportUiMessages(locale);
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const fileBase = formatPrintFilename(
      activeThread.at(-1)?.consultationId ??
        activeThread[0]?.consultationId ??
        "CHAT",
    );

    const toDataUrl = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("blob_to_data_url_failed"));
        reader.readAsDataURL(blob);
      });
    const fetchImageDataUrl = async (url: string): Promise<string | null> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await toDataUrl(await res.blob());
      } catch {
        return null;
      }
    };
    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("image_load_failed"));
        img.src = src;
      });

    const pageW = 1240;
    const pageH = 1754;
    const cjkFont =
      '"Noto Sans CJK JP","Yu Gothic UI","Meiryo","Microsoft YaHei","Malgun Gothic","Segoe UI",sans-serif';
    const serifFont = '"Noto Serif CJK JP","Yu Mincho","MS Mincho",serif';

    const wrapText = (
      ctx: CanvasRenderingContext2D,
      text: string,
      maxWidth: number,
    ): string[] => {
      const lines: string[] = [];
      for (const paragraph of text.replace(/\r/g, "").split("\n")) {
        const words = paragraph.split(" ");
        let line = "";
        for (const word of words) {
          if (!word) continue;
          const candidate = line ? `${line} ${word}` : word;
          if (ctx.measureText(candidate).width <= maxWidth) {
            line = candidate;
            continue;
          }
          if (line) { lines.push(line); line = ""; }
          if (ctx.measureText(word).width <= maxWidth) { line = word; continue; }
          // Word too wide — hyphenate character by character.
          let partial = "";
          for (const ch of Array.from(word)) {
            const probe = `${partial}${ch}-`;
            if (ctx.measureText(probe).width > maxWidth && partial) {
              lines.push(`${partial}-`);
              partial = ch;
            } else { partial += ch; }
          }
          if (partial) line = partial;
        }
        if (line.trim()) lines.push(line.trimEnd());
      }
      return lines;
    };

    const drawWrapped = (
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
      maxLines?: number,
    ): number => {
      const lines = wrapText(ctx, text, maxWidth);
      const use =
        typeof maxLines === "number" ? lines.slice(0, maxLines) : lines;
      use.forEach((l) => {
        ctx.fillText(l, x, y);
        y += lineHeight;
      });
      if (typeof maxLines === "number" && lines.length > maxLines) {
        ctx.fillText("…", x, y);
        y += lineHeight;
      }
      return y;
    };

    for (let i = 0; i < activeThread.length; i++) {
      const entry = activeThread[i]!;
      if (i > 0) doc.addPage();

      let canvas = document.createElement("canvas");
      canvas.width = pageW;
      canvas.height = pageH;
      const ctxInit = canvas.getContext("2d");
      if (!ctxInit) continue;
      let ctx: CanvasRenderingContext2D = ctxInit;

      // Background and subtle bands.
      ctx.fillStyle = "#f6fbfd";
      ctx.fillRect(0, 0, pageW, pageH);
      ctx.fillStyle = "rgba(30,131,148,0.08)";
      ctx.fillRect(0, 0, pageW, 140);
      ctx.fillStyle = "rgba(28,94,122,0.06)";
      ctx.fillRect(0, 146, pageW, 8);

      const accent =
        entry.oracleType === "oracle_bones" ? "#2a857a" : "#1f6f8f";

      // Header
      ctx.fillStyle = "#17212b";
      ctx.font = `700 42px ${serifFont}`;
      ctx.fillText(pdfUi.title, 64, 76);
      ctx.font = `500 23px ${cjkFont}`;
      ctx.fillStyle = "#36515d";
      ctx.fillText(
        formatPdfEntryLine(pdfUi, i + 1, new Date().toLocaleString(locale)),
        64,
        112,
      );

      // Question ribbon
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.strokeStyle = "rgba(52,117,145,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(54, 186, pageW - 108, 174, 22);
      ctx.fill();
      ctx.stroke();
      ctx.font = `700 24px ${cjkFont}`;
      ctx.fillStyle = accent;
      ctx.fillText(pdfUi.question, 86, 232);
      ctx.font = `500 29px ${cjkFont}`;
      ctx.fillStyle = "#1e2a35";
      drawWrapped(ctx, entry.question, 86, 276, pageW - 172, 40, 3);

      // Summary + image cards
      const cardY = 394;
      const cardH = 360;
      const leftW = 560;
      const rightW = pageW - 54 - 54 - leftW - 24;

      ctx.fillStyle = "rgba(242,249,251,0.96)";
      ctx.strokeStyle = "rgba(52,117,145,0.28)";
      ctx.beginPath();
      ctx.roundRect(54, cardY, leftW, cardH, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(245,250,252,0.98)";
      ctx.beginPath();
      ctx.roundRect(54 + leftW + 24, cardY, rightW, cardH, 20);
      ctx.fill();
      ctx.stroke();

      ctx.font = `700 24px ${cjkFont}`;
      ctx.fillStyle = accent;
      ctx.fillText(pdfUi.summary, 84, cardY + 46);
      ctx.font = `500 25px ${cjkFont}`;
      ctx.fillStyle = "#22313f";
      let sy = cardY + 92;
      const summaryLine = (label: string, value: string) => {
        sy =
          drawWrapped(ctx, `${label} ${value}`, 84, sy, leftW - 60, 34, 2) + 6;
      };
      const pdfDateStr = new Date(entry.createdAt ?? Date.now()).toLocaleDateString(
        locale,
        { year: "numeric", month: "short", day: "numeric" },
      );
      const pdfTranslatorName: Record<string, string> = {
        wilhelm: "Wilhelm / Baynes",
        legge: "James Legge",
        zhouyi: "Zhou Yi",
        master_combined: "Wilhelm · Legge · Zhou Yi",
      };
      if (entry.oracleType === "oracle_bones" && entry.oracleBones) {
        const mediumLabel = entry.oracleBones.medium === "turtle"
          ? pdfUi.turtle
          : pdfUi.ox;
        const chargeLabel = entry.oracleBones.verdict.startsWith("auspicious")
          ? pdfUi.chargePositive
          : pdfUi.chargeNegative;
        summaryLine(pdfUi.verdict, getOracleBonesVerdictLabel(locale, entry.oracleBones.verdict));
        summaryLine(pdfUi.medium, mediumLabel);
        summaryLine(pdfUi.charge, chargeLabel);
        summaryLine(
          pdfUi.inThread,
          formatPdfThreadReadingLine(pdfUi, entry.sessionPosition, pdfDateStr),
        );
      } else {
        const trace = entry.transformedHexagram != null
          ? `#${entry.primaryHexagram} ${entry.primaryHexagramChinese} → #${entry.transformedHexagram} ${entry.transformedHexagramChinese ?? ""}`
          : `#${entry.primaryHexagram} ${entry.primaryHexagramChinese}`;
        summaryLine(pdfUi.trace, trace);
        summaryLine(pdfUi.rule, getIchingMutationRuleLabel(locale, entry.mutationRule));
        if (entry.translator && pdfTranslatorName[entry.translator]) {
          summaryLine(pdfUi.translator, pdfTranslatorName[entry.translator]!);
        }
        summaryLine(
          pdfUi.inThread,
          formatPdfThreadReadingLine(pdfUi, entry.sessionPosition, pdfDateStr),
        );
      }

      const imgDataUrl =
        (await fetchImageDataUrl(entry.imageUrl)) ??
        (await fetchImageDataUrl(entry.imageFallbackUrl ?? ""));
      if (imgDataUrl) {
        try {
          const image = await loadImage(imgDataUrl);
          const ix = 54 + leftW + 24 + 16;
          const iy = cardY + 16;
          const iw = rightW - 32;
          const ih = cardH - 32;
          ctx.drawImage(image, ix, iy, iw, ih);
        } catch {
          // ignore rendering failures
        }
      }

      // Reading panel
      const panelY = 786;
      const panelH = pageH - panelY - 58;
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      ctx.strokeStyle = "rgba(52,117,145,0.3)";
      ctx.beginPath();
      ctx.roundRect(54, panelY, pageW - 108, panelH, 22);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.font = `700 24px ${cjkFont}`;
      ctx.fillText(pdfUi.reading, 84, panelY + 44);

      const blocks = interpretationMarkdownToPdfBlocks(entry.interpretation);
      const styledLines = buildCanvasReadingLines(
        ctx,
        blocks,
        pageW - 168,
        84,
        cjkFont,
        accent,
      );

      const flushCanvasToDoc = () => {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        doc.addImage(dataUrl, "JPEG", 0, 0, 595.28, 841.89, undefined, "FAST");
      };

      // Justify paragraph/list body lines on the canvas (not headings or italics).
      const fillCanvasJustified = (
        c: CanvasRenderingContext2D,
        text: string,
        x: number,
        yCur: number,
        maxW: number,
        isLast: boolean,
      ) => {
        if (isLast) { c.fillText(text, x, yCur); return; }
        const words = text.split(" ").filter(Boolean);
        if (words.length <= 1) { c.fillText(text, x, yCur); return; }
        const totalW = words.reduce((s, w) => s + c.measureText(w).width, 0);
        const spW = c.measureText(" ").width;
        const gap = (maxW - totalW) / (words.length - 1);
        if (gap < spW * 0.4 || gap > spW * 4) { c.fillText(text, x, yCur); return; }
        let cx = x;
        for (let wi = 0; wi < words.length; wi++) {
          c.fillText(words[wi]!, cx, yCur);
          if (wi < words.length - 1) cx += c.measureText(words[wi]!).width + gap;
        }
      };

      let readingBottom = pageH - 58;
      let y = panelY + 84;
      let lineIdx = 0;

      while (lineIdx < styledLines.length) {
        const sl = styledLines[lineIdx]!;
        if (y + sl.marginTop + sl.lineHeight > readingBottom) {
          flushCanvasToDoc();
          doc.addPage();
          const nextCanvas = document.createElement("canvas");
          nextCanvas.width = pageW;
          nextCanvas.height = pageH;
          const nctx = nextCanvas.getContext("2d");
          if (!nctx) break;
          canvas = nextCanvas;
          ctx = nctx;
          const cont = drawPdfContinuationChrome(
            ctx,
            pageW,
            pageH,
            pdfUi,
            i + 1,
            accent,
            cjkFont,
            serifFont,
          );
          y = cont.textTopY;
          readingBottom = cont.textBottomY;
          continue;
        }
        y += sl.marginTop;
        ctx.font = sl.font;
        ctx.fillStyle = sl.fillStyle;
        const isLastInBlock =
          lineIdx === styledLines.length - 1 ||
          (styledLines[lineIdx + 1]?.marginTop ?? 0) > 0;
        const canJustify = !sl.font.includes("italic") && !sl.font.includes("700");
        if (canJustify) {
          const lineMaxW = pageW - 84 - sl.x;
          fillCanvasJustified(ctx, sl.text, sl.x, y, lineMaxW, isLastInBlock);
        } else {
          ctx.fillText(sl.text, sl.x, y);
        }
        y += sl.lineHeight;
        lineIdx += 1;
      }

      flushCanvasToDoc();
    }

    doc.save(`${fileBase}.pdf`);
  }

  const updateActiveSession = (
    updater: (
      current: ChatSessionState<ConsultationItem>,
    ) => ChatSessionState<ConsultationItem>,
  ) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.localId !== activeSession?.localId) return s;
        return updater(s);
      }),
    );
  };

  const handleInterpretationRevealComplete = useCallback(() => {
    setRevealConsultationId(null);
  }, []);

  useEffect(() => {
    setRevealConsultationId(null);
  }, [activeSessionLocalId]);

  useEffect(() => {
    if (prevActiveSessionLocalIdForScrollRef.current !== activeSessionLocalId) {
      prevActiveSessionLocalIdForScrollRef.current = activeSessionLocalId;
      lastScrollWasRevealRef.current = false;
      mountScrollDoneRef.current = false;
    }
    if (revealConsultationId) {
      lastScrollWasRevealRef.current = true;
      requestAnimationFrame(() => {
        document
          .getElementById(`reading-sheet-${revealConsultationId}`)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      });
      return;
    }
    if (lastScrollWasRevealRef.current) {
      lastScrollWasRevealRef.current = false;
      return;
    }
    // First render after mount/remount or session change: jump instantly to avoid visual slide.
    // Don't mark as done until there's actual content — if the thread is still empty
    // (loading state), a subsequent render with cached data would use "smooth" and produce
    // the unwanted slide-up animation.
    if (activeThread.length === 0 && !mountScrollDoneRef.current) return;
    const behavior = mountScrollDoneRef.current ? "smooth" : "instant";
    mountScrollDoneRef.current = true;
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, [
    activeThread.length,
    phase,
    error,
    activeSessionLocalId,
    revealConsultationId,
  ]);

  useEffect(() => {
    if (!authContinueOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAuthContinueOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authContinueOpen]);

  const startNewSession = useCallback(() => {
    const created = createLocalSession(ui.sessionNew);
    pinnedLocalSessionIdRef.current = created.localId;
    setSessions((prev) => [created, ...prev.filter((s) => s.messageCount > 0)]);
    setActiveSessionLocalId(created.localId);
    setRevealConsultationId(null);
    setManualCastPreview(null);
    setQuestion("");
    setError(null);
    setLoading(false); // purga cualquier estado de carga pendiente al iniciar nueva sesión
    setPhase("idle");
    setChatsOpen(false);
    setConsultPanelOpen(false);
  }, [ui.sessionNew]);

  const signOut = useCallback(async () => {
    if (!isSupabaseBrowserConfigured()) return;
    isSigningOutRef.current = true;
    const uid = authUserId;
    // Best-effort: invalidate server-side JWT cache before Supabase revokes the token.
    // Prevents a 60-second window where the revoked JWT still passes the in-process cache.
    try {
      const { data: { session } } = await getSupabaseBrowser().auth.getSession();
      if (session?.access_token) {
        void fetch("/api/auth/sign-out", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      }
    } catch {
      // non-fatal
    }
    try {
      await getSupabaseBrowser().auth.signOut();
    } catch {
      // ignore
    }
    if (uid) {
      try {
        sessionStorage.removeItem(`iching_chat_summaries_v1:${uid}`);
        sessionStorage.removeItem(`iching_chat_state_v1:${uid}`);
        sessionStorage.removeItem(`iching_2fa_passed_v1:${uid}`);
        localStorage.removeItem(`iching_last_activity_v1:${uid}`);
      } catch {
        // ignore cache clear errors
      }
      void clearIdbUser(uid);
    }
    // Signal the native shell so it can clear SQLite content cooldowns (Fix 2),
    // achieving the same sign-out hygiene as the native-bar __rnSignOut path.
    try {
      (window as unknown as { ReactNativeWebView?: { postMessage(s: string): void } })
        .ReactNativeWebView?.postMessage(JSON.stringify({ type: "auth_signout" }));
    } catch {
      // non-fatal — only present inside the Android WebView shell
    }
    setAccessToken(null);
    setAuthEmail(null);
    setAuthUserId(null);
    setSecondFactorVerified(false);
    setTwoFactorModalOpen(false);
    setTwoFactorChallengeMethod("totp");
    setTwoFactorInfo(null);
    setTwoFactorError(null);
    setTokenCenterOpen(false);
    setTokenCenterError(null);
    setHistoryLoading(false);
    setLoadingSessionLocalId(null);
    setPendingDeletedSessionLocalIds([]);
    setHistoryLoadError(null);
    idleSignOutRef.current = false;
    pinnedLocalSessionIdRef.current = null;
    bootstrapCompletedForRef.current = null;
  }, [authUserId]);

  const deleteAccount = useCallback(async () => {
    if (!accessToken) return;
    const input = deleteAccountConfirm.trim().toUpperCase();
    if (input !== chrome.deleteAccountConfirmWord) return;
    setDeleteAccountBusy(true);
    setDeleteAccountError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ confirmation: input }),
      });
      if (!res.ok) {
        setDeleteAccountError(chrome.deleteAccountError);
        setDeleteAccountBusy(false);
        return;
      }
      setDeleteAccountOpen(false);
      // Notify the native shell to wipe the local SQLite cache before signing out.
      (window as unknown as { ReactNativeWebView?: { postMessage(s: string): void } })
        .ReactNativeWebView?.postMessage(JSON.stringify({ type: "account_deleted" }));
      await signOut();
    } catch {
      setDeleteAccountError(chrome.deleteAccountError);
      setDeleteAccountBusy(false);
    }
  }, [accessToken, deleteAccountConfirm, chrome.deleteAccountError, signOut]);

  const sessionsListed = useMemo(
    () => sessions.filter((s) => s.messageCount > 0),
    [sessions],
  );
  const visibleSessionsListed = useMemo(
    () =>
      sessionsListed.filter(
        (s) => !pendingDeletedSessionLocalIds.includes(s.localId),
      ),
    [sessionsListed, pendingDeletedSessionLocalIds],
  );
  const loadSessionThread = useCallback(
    async (sessionId: string, localId: string) => {
      if (!accessToken) return;

      // Tier 2/3 (React Native WebView only): signal the native shell to
      // serve the last 30 messages from SQLite immediately and run an
      // incremental Supabase sync in the background. The rn:thread-data
      // event handler above renders the result and clears the loading state
      // as soon as native responds — typically before this Supabase fetch
      // completes, giving an instant "WhatsApp-style" open.
      const rnBridge = (
        window as unknown as {
          ReactNativeWebView?: { postMessage(s: string): void };
        }
      ).ReactNativeWebView;
      if (rnBridge) {
        rnBridge.postMessage(
          JSON.stringify({ type: "request_thread", sessionId, localId }),
        );
        // Defer the loading indicator so SQLite cache (< 150 ms round-trip)
        // can arrive first. If rn:thread-data fires before the timer, it
        // cancels the timer and the user never sees "Loading conversation…".
        if (rnLoadingTimerRef.current !== null) {
          clearTimeout(rnLoadingTimerRef.current);
        }
        rnLoadingTimerRef.current = setTimeout(() => {
          rnLoadingTimerRef.current = null;
          setHistoryLoading(true);
          setLoadingSessionLocalId(localId);
        }, 250);
        // The native bridge owns Tier 2 (SQLite instant) + Tier 3 (background
        // Supabase sync). A parallel web API call would fire "session not found"
        // for any session that lives in SQLite but not the current Supabase project
        // (e.g., a staging session after an APK rebuild pointing to production),
        // overriding valid cached content with a false error. rn:thread-not-found
        // handles the genuinely-absent case instead.
        setHistoryLoadError(null);
        return;
      } else {
        // Desktop web: check IndexedDB before hitting Supabase.
        const idbCached = await getIdbThread(sessionId);
        if (idbCached && idbCached.consultations.length > 0) {
          const planCap = Math.max(1, accountSessionLimit);
          const cachedThread = (idbCached.consultations as ApiChatConsultation[]).map(
            (c) => mapApiConsultationToItem(c, "", planCap),
          );
          setSessions((prev) =>
            prev.map((s) =>
              s.localId !== localId ? s : {
                ...s,
                thread: cachedThread,
                messageCount: Math.max(cachedThread.length, s.messageCount),
                updatedAt: cachedThread.at(-1)?.createdAt ?? s.updatedAt,
                firstConsultationAt: cachedThread[0]?.createdAt ?? s.firstConsultationAt,
              },
            ),
          );
          if (isThreadFresh(idbCached)) {
            // Fresh enough — skip the network round-trip entirely.
            setHistoryLoading(false);
            setLoadingSessionLocalId((curr) => (curr === localId ? null : curr));
            return;
          }
          // Stale — content is visible; refresh silently without the loading indicator.
        } else {
          setHistoryLoading(true);
          setLoadingSessionLocalId(localId);
        }
      }
      setHistoryLoadError(null);
      try {
        // Phase 1: meta-only fetch (no TOAST interpretation/oracle_bones).
        // Renders thread structure in ~10ms so the user sees the correct message
        // count before the full interpretation arrives. Non-fatal on failure.
        const metaRes = await fetch(
          `/api/account/chats?sessionId=${encodeURIComponent(sessionId)}&meta=1`,
          { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
        );
        if (metaRes.ok) {
          const metaPayload = (await metaRes.json()) as AccountChatSessionResponse;
          if (metaPayload?.session && metaPayload.consultations.length > 0) {
            const planCap = Math.max(1, accountSessionLimit);
            const partialThread = metaPayload.consultations.map((c) =>
              mapApiConsultationToItem(c, metaPayload.session.publicId, planCap),
            );
            setSessions((prev) =>
              prev.map((s) => {
                if (s.localId !== localId) return s;
                // Only replace thread content if Phase 1 adds new rows not yet in
                // state. If state already has as many or more rows (e.g. from a
                // warm IndexedDB load), keep the existing full interpretations —
                // overwriting them with summary-only placeholders causes a visible
                // flash where all responses disappear before Phase 2 restores them.
                const addedNewRows = partialThread.length > s.thread.length;
                return {
                  ...s,
                  title:
                    metaPayload.session.title &&
                    !knownNewSessionTitles.has(metaPayload.session.title) &&
                    !knownInProgressTitles.has(metaPayload.session.title)
                      ? metaPayload.session.title
                      : (s.thread[0]?.question.slice(0, 60) ??
                        partialThread[0]?.question.slice(0, 60) ??
                        sessionUi.defaultSessionTitle),
                  sessionId: metaPayload.session.sessionId,
                  publicSessionId: metaPayload.session.publicId,
                  threadMaxDepth: planCap,
                  thread: addedNewRows ? partialThread : s.thread,
                  messageCount: Math.max(partialThread.length, s.messageCount),
                  updatedAt: addedNewRows
                    ? (partialThread.at(-1)?.createdAt ?? s.updatedAt)
                    : s.updatedAt,
                  firstConsultationAt: addedNewRows
                    ? (partialThread[0]?.createdAt ?? s.firstConsultationAt)
                    : s.firstConsultationAt,
                };
              }),
            );
            // Clear loading after Phase 1 — user sees thread structure immediately.
            setHistoryLoading(false);
            setLoadingSessionLocalId((curr) => (curr === localId ? null : curr));
          }
        }

        // Phase 2: content-only fetch (TOAST columns — interpretation + oracle_bones).
        // Use ?content=1 to avoid re-fetching meta already loaded in Phase 1.
        const res = await fetch(
          `/api/account/chats?sessionId=${encodeURIComponent(sessionId)}&content=1`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
          },
        );
        if (!res.ok) {
          const err = parseApiErrorPayload(await res.text());
          if (res.status === 401) {
            const authError = sessionUi.chatLoadSessionExpired;
            setHistoryLoadError(authError);
            setError(authError);
            void signOut();
            return;
          }
          if (res.status === 404 || err?.code === "SESSION_NOT_FOUND") {
            setHistoryLoadError(sessionUi.chatNoLongerExists);
            return;
          }
          setHistoryLoadError(
            formatChatLoadFailedStatus(sessionUi, res.status),
          );
          return;
        }
        // ?content=1 returns { consultationContent: ContentRow[], phase: "content" }
        type ContentRow = {
          consultationId: string;
          interpretation: string;
          oracleBones: {
            pattern_id: number;
            verdict: OracleBonesVerdict;
            positive_charge: string;
            negative_charge: string;
            medium: "turtle" | "ox";
          } | null;
        };
        const payload = (await res.json()) as { consultationContent: ContentRow[]; phase?: string };
        if (!payload?.consultationContent?.length) return;
        const contentMap = new Map(payload.consultationContent.map((r) => [r.consultationId, r]));
        setSessions((prev) =>
          prev.map((s) => {
            if (s.localId !== localId) return s;
            const mergedThread = s.thread.map((item) => {
              const content = contentMap.get(item.consultationId);
              if (!content) return item;
              return {
                ...item,
                interpretation: content.interpretation || item.interpretation,
                ...(content.oracleBones != null
                  ? {
                      oracleBones: {
                        patternId: content.oracleBones.pattern_id,
                        verdict: content.oracleBones.verdict,
                        affirmsPositive: content.oracleBones.verdict.startsWith("auspicious"),
                        positiveCharge: content.oracleBones.positive_charge,
                        negativeCharge: content.oracleBones.negative_charge,
                        medium: content.oracleBones.medium,
                      },
                    }
                  : {}),
              };
            });
            return { ...s, thread: mergedThread };
          }),
        );
        setHistoryLoadError(null);
      } catch {
        setHistoryLoadError(sessionUi.chatLoadNetworkError);
      } finally {
        setHistoryLoading(false);
        setLoadingSessionLocalId((current) =>
          current === localId ? null : current,
        );
      }
    },
    [
      accessToken,
      knownInProgressTitles,
      knownNewSessionTitles,
      sessionUi,
      accountSessionLimit,
      signOut,
    ],
  );
  const removeSession = useCallback(
    async (session: ChatSessionState<ConsultationItem>) => {
      if (!accessToken || !session.sessionId) return;
      if (pendingDeletedSessionLocalIds.includes(session.localId)) return;
      // In WebView the native bridge shows its own confirmation dialog after
      // intercepting the DELETE fetch — skip window.confirm() and the optimistic
      // pending state so the chat only disappears once the server confirms.
      const isWebView = document.documentElement.classList.contains("iching-rn-webview");
      if (!isWebView) {
        const ok = window.confirm(sessionUi.deleteConfirm);
        if (!ok) return;
        setPendingDeletedSessionLocalIds((prev) =>
          prev.includes(session.localId) ? prev : [...prev, session.localId],
        );
      }
      try {
        const res = await fetch(
          `/api/account/chats?sessionId=${encodeURIComponent(session.sessionId)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        // 499 means the user cancelled via the native dialog — no error to show.
        if (res.status === 499) {
          return;
        }
        if (!res.ok) {
          if (!isWebView) {
            setPendingDeletedSessionLocalIds((prev) =>
              prev.filter((id) => id !== session.localId),
            );
          }
          setError(sessionUi.couldNotDeleteConversation);
          return;
        }
        setSessions((prev) => {
          const next = prev.filter((s) => s.localId !== session.localId);
          const nextActive = next[0]?.localId ?? null;
          setActiveSessionLocalId((current) =>
            current === session.localId ? nextActive : current,
          );
          return next;
        });
      } catch {
        if (!isWebView) {
          setPendingDeletedSessionLocalIds((prev) =>
            prev.filter((id) => id !== session.localId),
          );
        }
        setError(sessionUi.couldNotDeleteConversation);
        return;
      }
      if (!isWebView) {
        setPendingDeletedSessionLocalIds((prev) =>
          prev.filter((id) => id !== session.localId),
        );
      }
    },
    [accessToken, sessionUi, pendingDeletedSessionLocalIds],
  );

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
    const lastDay = localStorage.getItem(streakDayStorageKey);
    const storedStreak = Number(
      localStorage.getItem(streakDaysStorageKey) ?? "0",
    );
    const storedDaily = Number(
      localStorage.getItem(dailyCountStorageKey(today)) ?? "0",
    );
    setDailyCount(storedDaily);
    if (!lastDay) {
      setStreakDays(Math.max(storedStreak, 1));
      localStorage.setItem(streakDayStorageKey, today);
      localStorage.setItem(
        streakDaysStorageKey,
        String(Math.max(storedStreak, 1)),
      );
      return;
    }
    if (lastDay === today) {
      setStreakDays(Math.max(storedStreak, 1));
      return;
    }
    const last = new Date(`${lastDay}T00:00:00`);
    const curr = new Date(`${today}T00:00:00`);
    const diffDays = Math.round(
      (curr.getTime() - last.getTime()) / (24 * 60 * 60 * 1000),
    );
    const nextStreak = diffDays === 1 ? Math.max(storedStreak, 1) + 1 : 1;
    setStreakDays(nextStreak);
    localStorage.setItem(streakDayStorageKey, today);
    localStorage.setItem(streakDaysStorageKey, String(nextStreak));
  }, [dailyCountStorageKey, streakDayStorageKey, streakDaysStorageKey]);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      setSupabaseConfigError(true);
      setAuthReady(true);
      localStorage.removeItem("_rnAuthEmail");
      return;
    }
    let cancelled = false;
    const sb = getSupabaseBrowser();
    void sb.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setAccessToken(session?.access_token ?? null);
      setAuthEmail(session?.user?.email ?? null);
      setAuthUserId(session?.user?.id ?? null);
      setAuthReady(true);
      // Persist email for instant re-render on next mount (eliminates blank-bar flash).
      if (session?.user?.email) {
        localStorage.setItem("_rnAuthEmail", session.user.email);
      } else {
        localStorage.removeItem("_rnAuthEmail");
      }
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
      setAuthEmail(session?.user?.email ?? null);
      setAuthUserId(session?.user?.id ?? null);
      if (session?.user?.email) {
        localStorage.setItem("_rnAuthEmail", session.user.email);
      } else {
        localStorage.removeItem("_rnAuthEmail");
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authUserId) lastSignedInUserIdForStorageRef.current = authUserId;
  }, [authUserId]);

  useEffect(() => {
    if (!authReady) return;
    if (!accessToken) {
      const uid = lastSignedInUserIdForStorageRef.current;
      if (uid) clearCachedAccountSessionLimit(uid);
      lastSignedInUserIdForStorageRef.current = null;
      setTier("free");
      setTierReady(true);
      setAccountSessionLimit(1);
      setTokenBalance(null);
      setTwoFactorEnabled(false);
      setTwoFactorMethod(null);
      setSecondFactorVerified(false);
      setTwoFactorModalOpen(false);
      setTwoFactorInfo(null);
      setTwoFactorError(null);
      setTokenCenterOpen(false);
      setTokenCenterError(null);
      setPendingDeletedSessionLocalIds([]);
      setIsAdmin(false);
      setDisplayName(undefined);
      setOnboardingOpen(false);
      isSigningOutRef.current = false;
      return;
    }
    // Initial account state is loaded by the bootstrap effect (below).
    // This effect only handles post-login refreshes (token balance after purchase/consult).
    let cancelled = false;
    function onAccountRefresh() {
      if (cancelled || isSigningOutRef.current) return;
      void fetch("/api/account/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      })
        .then((r) => (r.ok ? r.json() : null))
        .then(
          (j: {
            last_pack?: string;
            tokens_available?: number;
            session_limit?: number;
            twoFactorEnabled?: boolean;
            twoFactorMethod?: string | null;
            is_admin?: boolean;
            legal_acceptance_current?: boolean;
          } | null) => {
            if (cancelled || !j) return;
            if (j.legal_acceptance_current === false) {
              if (authUserId && !legalRedirectSentForRef.current.has(authUserId)) {
                legalRedirectSentForRef.current.add(authUserId);
                router.replace("/auth/complete-legal");
              }
              return;
            }
            if (typeof j.last_pack === "string") setTier(j.last_pack as Tier);
            setIsAdmin(j.is_admin === true);
            if (typeof j.session_limit === "number" && Number.isFinite(j.session_limit)) {
              setAccountSessionLimit(j.session_limit);
              if (authUserId) writeCachedAccountSessionLimit(authUserId, j.session_limit);
            }
            if (typeof j.tokens_available === "number") setTokenBalance(j.tokens_available);
            setTwoFactorEnabled(Boolean(j.twoFactorEnabled));
            setTwoFactorMethod(j.twoFactorMethod ?? null);
          },
        )
        .catch(() => { /* non-fatal */ });
    }
    window.addEventListener("iching:account-refresh", onAccountRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener("iching:account-refresh", onAccountRefresh);
    };
  }, [accessToken, authReady, authUserId, router]);

  // Native Google Play purchase events — emitted by the RN shell after purchasePackage()
  useEffect(() => {
    function onRnPurchaseSuccess() {
      window.dispatchEvent(new Event("iching:account-refresh"));
    }
    function onRnPurchaseError(e: Event) {
      const detail = (e as CustomEvent<{ message?: string }>).detail;
      setError(detail?.message ?? pricingUi.errorCheckout);
    }
    window.addEventListener("rnPurchaseSuccess", onRnPurchaseSuccess);
    window.addEventListener("rnPurchaseError", onRnPurchaseError);
    return () => {
      window.removeEventListener("rnPurchaseSuccess", onRnPurchaseSuccess);
      window.removeEventListener("rnPurchaseError", onRnPurchaseError);
    };
  }, [pricingUi.errorCheckout]);

  useEffect(() => {
    if (!accessToken || !authUserId) return;
    if (!twoFactorEnabled) {
      setSecondFactorVerified(true);
      return;
    }
    const key = `iching_2fa_passed_v1:${authUserId}`;
    const alreadyPassed = sessionStorage.getItem(key) === "1";
    if (alreadyPassed) {
      setSecondFactorVerified(true);
      return;
    }
    setSecondFactorVerified(false);
    setTwoFactorSetupOpen(false);
    setTwoFactorQrDataUrl(null);
    setTwoFactorRecoveryCodes([]);
    setTwoFactorCode("");
    setTwoFactorEmailCode("");
    setTwoFactorRecoveryCode("");
    setTwoFactorEmailSent(false);
    setTwoFactorChallengeFailures(0);
    setTwoFactorRecoveryAssistMode("hidden");
    setTwoFactorChallengeMethod(preferredTwoFactorMethod);
    setTwoFactorInfo(null);
    setTwoFactorError(null);
    setTwoFactorModalMode("challenge");
    setTwoFactorModalOpen(true);
  }, [accessToken, authUserId, preferredTwoFactorMethod, twoFactorEnabled]);

  useEffect(() => {
    if (!accessToken || !authUserId) {
      idleSignOutRef.current = false;
      return;
    }
    const activityStorageKey = `iching_last_activity_v1:${authUserId}`;
    const readLastActivity = (): number => {
      try {
        const raw = localStorage.getItem(activityStorageKey);
        const parsed = raw ? Number(raw) : NaN;
        return Number.isFinite(parsed) ? parsed : Date.now();
      } catch {
        return Date.now();
      }
    };
    const writeLastActivity = (timestamp: number) => {
      try {
        localStorage.setItem(activityStorageKey, String(timestamp));
      } catch {
        // ignore localStorage write errors
      }
    };
    const expireIfNeeded = () => {
      if (idleSignOutRef.current) return;
      const idleMs = Date.now() - readLastActivity();
      if (idleMs < SESSION_IDLE_TIMEOUT_MS) return;
      idleSignOutRef.current = true;
      setError(sessionUi.idleSignedOut);
      void signOut();
    };
    const registerActivity = () => {
      if (idleSignOutRef.current) return;
      writeLastActivity(Date.now());
    };

    idleSignOutRef.current = false;
    expireIfNeeded();
    registerActivity();

    const onStorage = (event: StorageEvent) => {
      if (event.key !== activityStorageKey) return;
      expireIfNeeded();
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      expireIfNeeded();
      registerActivity();
    };
    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "touchstart",
      "mousemove",
      "scroll",
    ];
    for (const eventName of activityEvents) {
      window.addEventListener(eventName, registerActivity, { passive: true });
    }
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(
      expireIfNeeded,
      SESSION_IDLE_CHECK_INTERVAL_MS,
    );

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, registerActivity);
      }
    };
  }, [accessToken, authUserId, sessionUi, signOut]);

  useEffect(() => {
    if (!accessToken) {
      setSessionsServerHydrated(false);
    }
  }, [accessToken, setSessionsServerHydrated]);

  useEffect(() => {
    if (sessionsHydrated) return;
    if (sessions.length > 0) {
      setSessionsHydrated(true);
      return;
    }
    if (!authReady) return;
    if (accessToken) {
      setSessionsHydrated(true);
      return;
    }
    const fresh = createLocalSession(inProgressTitle);
    setSessions([fresh]);
    setActiveSessionLocalId(fresh.localId);
    setSessionsHydrated(true);
  }, [
    authReady,
    accessToken,
    inProgressTitle,
    sessions.length,
    sessionsHydrated,
    setSessions,
    setActiveSessionLocalId,
    setSessionsHydrated,
  ]);

  useEffect(() => {
    if (!authReady) return;
    if (accessToken) return;
    if (sessions.length === 1 && sessions[0]?.messageCount === 0) return;
    const fresh = createLocalSession(inProgressTitle);
    setSessions([fresh]);
    setActiveSessionLocalId(fresh.localId);
  }, [
    authReady,
    accessToken,
    inProgressTitle,
    sessions,
    setSessions,
    setActiveSessionLocalId,
  ]);

  // IDB cache: populate chat sidebar instantly on auth before Supabase responds.
  // Runs once when authUserId is first set. The Supabase summary fetch below will
  // overwrite with fresh data via the existing setSessions merge logic.
  useEffect(() => {
    if (!authUserId) return;
    void getIdbChats(authUserId).then((cached) => {
      if (cached.length === 0) return;
      setSessions((prev) => {
        if (prev.some((s) => s.messageCount > 0)) return prev; // Supabase already arrived
        return cached.map((c) => ({
          localId: c.localId,
          title: c.title,
          sessionId: c.sessionId,
          publicSessionId: c.publicSessionId,
          thread: [] as never[],
          threadMaxDepth: null,
          messageCount: c.messageCount,
          updatedAt: c.updatedAt,
          firstConsultationAt: c.firstConsultationAt,
        }));
      });
    });
  }, [authUserId, setSessions]);

  // Native bridge: consume window.__rnCachedChats injected by the Android WebView shell
  // after onLoadEnd. Populates the session list with stale SQLite data before the
  // Supabase fetch below completes (stale-while-revalidate from native cache).
  useEffect(() => {
    type RnEntry = ChatSessionState<ConsultationItem>;
    function applyCache(entries: RnEntry[]) {
      if (!Array.isArray(entries)) return;
      setSessions((prev) => {
        // Never overwrite sessions that already have loaded message content.
        if (prev.some((s) => s.messageCount > 0)) return prev;
        // [] means SQLite confirmed empty (server-evicted stale chats) — clear sidebar.
        return entries;
      });
    }
    function onRnCached(e: Event) {
      applyCache((e as CustomEvent<RnEntry[]>).detail);
    }
    window.addEventListener("rn:cached-chats", onRnCached);
    const win = window as unknown as { __rnCachedChats?: RnEntry[] };
    if (Array.isArray(win.__rnCachedChats)) applyCache(win.__rnCachedChats);
    return () => window.removeEventListener("rn:cached-chats", onRnCached);
  }, [setSessions]);

  // Native bridge: receive thread data from SQLite (Tier 2 cache-first) and
  // after incremental Supabase sync (Tier 3). Fired by the request_thread
  // onMessage handler in the Android WebView shell.
  useEffect(() => {
    type RnThreadData = {
      localId: string;
      consultations: ApiChatConsultation[];
    };
    const onRnThread = (e: Event) => {
      const { localId, consultations } = (e as CustomEvent<RnThreadData>).detail;
      if (!Array.isArray(consultations) || consultations.length === 0) return;
      // Cancel deferred loading indicator — cache responded before the timer fired.
      if (rnLoadingTimerRef.current !== null) {
        clearTimeout(rnLoadingTimerRef.current);
        rnLoadingTimerRef.current = null;
      }
      const planCap = Math.max(1, accountSessionLimitRef.current);
      const thread = consultations.map((c) =>
        mapApiConsultationToItem(c, "", planCap),
      );
      setSessions((prev) =>
        prev.map((s) =>
          s.localId !== localId
            ? s
            : {
                ...s,
                thread,
                messageCount: Math.max(thread.length, s.messageCount),
                updatedAt: thread.at(-1)?.createdAt ?? s.updatedAt,
                firstConsultationAt:
                  thread[0]?.createdAt ?? s.firstConsultationAt,
              },
        ),
      );
      setHistoryLoading(false);
      setLoadingSessionLocalId((curr) => (curr === localId ? null : curr));
    };
    const onRnThreadNotFound = (e: Event) => {
      const { localId } = (e as CustomEvent<{ localId: string }>).detail;
      if (rnLoadingTimerRef.current !== null) {
        clearTimeout(rnLoadingTimerRef.current);
        rnLoadingTimerRef.current = null;
      }
      // Clear loading immediately so the UI is not stuck.
      setHistoryLoading(false);
      setLoadingSessionLocalId((curr) => (curr === localId ? null : curr));

      // Supabase fallback — restores behavior removed in 9bb3abc.
      // The original parallel call was removed because it produced false
      // "session not found" errors for staging sessions cached in SQLite
      // but absent in the production Supabase project. This sequential
      // fallback fires ONLY after native confirmed it cannot deliver
      // (SQLite empty + Tier 3 sync failed/timed-out), so it is safe:
      // no valid SQLite content can be overridden at this point.
      const tok = accessTokenRef.current;
      const session = sessionsRef.current.find((s) => s.localId === localId);
      if (!tok || !session?.sessionId) return;
      const { sessionId } = session;
      void (async () => {
        try {
          const res = await fetch(
            `/api/account/chats?sessionId=${encodeURIComponent(sessionId)}`,
            { headers: { Authorization: `Bearer ${tok}` }, cache: "no-store" },
          );
          if (!res.ok) return; // 404 = genuinely absent; silently leave empty
          const payload = (await res.json()) as AccountChatSessionResponse;
          if (!payload?.session || !Array.isArray(payload.consultations)) return;
          const planCap = Math.max(1, accountSessionLimitRef.current);
          const thread = payload.consultations.map((c) =>
            mapApiConsultationToItem(c, payload.session.publicId, planCap),
          );
          if (thread.length === 0) return;
          setSessions((prev) =>
            prev.map((s) =>
              s.localId !== localId
                ? s
                : {
                    ...s,
                    thread,
                    messageCount: Math.max(thread.length, s.messageCount),
                    updatedAt: thread.at(-1)?.createdAt ?? s.updatedAt,
                    firstConsultationAt:
                      thread[0]?.createdAt ?? s.firstConsultationAt,
                  },
            ),
          );
        } catch {
          // Truly unreachable — leave empty, spinner already cleared above.
        }
      })();
    };
    window.addEventListener("rn:thread-data", onRnThread);
    window.addEventListener("rn:thread-not-found", onRnThreadNotFound);
    return () => {
      window.removeEventListener("rn:thread-data", onRnThread);
      window.removeEventListener("rn:thread-not-found", onRnThreadNotFound);
    };
  }, [setSessions]);

  useEffect(() => {
    if (!authReady || !accessToken || !sessionsHydrated) return;
    // Guard: skip re-run if bootstrap already completed for this user in this session.
    // Prevents cascading re-runs when deps like loadSessionThread recreate after
    // accountSessionLimit or accessToken updates (e.g., TOKEN_REFRESHED).
    if (authUserId && bootstrapCompletedForRef.current === authUserId) return;
    // Optimistic lock: claim before the async starts so a second trigger (e.g.,
    // Google OAuth fires two SIGNED_IN events in quick succession, or TOKEN_REFRESHED
    // fires while bootstrap is in-flight) is blocked BEFORE launching a duplicate fetch.
    // Cleared only in signOut — page reload also resets it via useRef(null) re-init.
    if (authUserId) bootstrapCompletedForRef.current = authUserId;
    let cancelled = false;
    // Skip the loading spinner if sessions were already fetched from the server
    // (stale-while-revalidate: show existing data instantly, refresh silently in background)
    if (!serverHydratedRef.current) {
      setHistoryLoading(true);
    }
    setHistoryLoadError(null);
    hydrateFromStorage(summaryCacheKey, chatStateCacheKey);
    void (async () => {
      try {
        // Bootstrap: single call replaces concurrent /api/account/me + ?summary=1
        if (authUserId) {
          const cached = readCachedAccountSessionLimit(authUserId);
          if (cached !== null) setAccountSessionLimit(cached);
        }
        setTierReady(false);
        const res = await fetch("/api/account/bootstrap", {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
        if (!res.ok) {
          await res.text();
          if (res.status === 401) {
            const msg = sessionUi.historySessionExpired;
            setError(msg);
            setHistoryLoadError(msg);
            void signOut();
            return;
          }
          const msg = formatHistoryLoadFailedStatus(sessionUi, res.status);
          setError(msg);
          setHistoryLoadError(msg);
          setTierReady(true);
          return;
        }
        const payload = (await res.json()) as BootstrapResponse;
        if (cancelled || !payload) return;

        // ── Account state (was /api/account/me) ──────────────────────────
        if (payload.legal_acceptance_current === false) {
          if (authUserId && !legalRedirectSentForRef.current.has(authUserId)) {
            legalRedirectSentForRef.current.add(authUserId);
            router.replace("/auth/complete-legal");
          }
          return;
        }
        setTier((typeof payload.last_pack === "string" ? payload.last_pack : "free") as Tier);
        setTierReady(true);
        setIsAdmin(payload.is_admin === true);
        if (typeof payload.session_limit === "number" && Number.isFinite(payload.session_limit)) {
          setAccountSessionLimit(payload.session_limit);
          if (authUserId) writeCachedAccountSessionLimit(authUserId, payload.session_limit);
        }
        setTokenBalance(typeof payload.tokens_available === "number" ? payload.tokens_available : null);
        setTwoFactorEnabled(Boolean(payload.twoFactorEnabled));
        setTwoFactorMethod(payload.twoFactorMethod ?? null);
        if (payload.tour_v1_completed) {
          try { localStorage.setItem(TOUR_STORAGE_KEY, "1"); } catch { /* ignore */ }
        }
        const dn = typeof payload.display_name === "string" ? payload.display_name : null;
        setDisplayName(dn);
        if (dn === null) {
          void (async () => {
            const sb = getSupabaseBrowser();
            const { data: { user } } = await sb.auth.getUser();
            const provider = user?.app_metadata?.provider;
            const fullName = typeof user?.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name.trim() : "";
            const firstName = fullName.split(" ")[0]?.trim() ?? "";
            if (provider === "google" && firstName) {
              try {
                const r = await fetch("/api/account/display-name", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
                  body: JSON.stringify({ display_name: firstName }),
                });
                if (r.ok) {
                  setDisplayName(firstName);
                  try {
                    if (!localStorage.getItem(TOUR_STORAGE_KEY) && !tourFiredRef.current) {
                      tourFiredRef.current = true;
                      setTourKey((k) => k + 1);
                      setTourRun(true);
                    }
                  } catch { /* ignore */ }
                }
              } catch { /* non-fatal */ }
            } else {
              setOnboardingStep("enter");
              setOnboardingInput("");
              setOnboardingOpen(true);
            }
          })();
        } else {
          try {
            if (!localStorage.getItem(TOUR_STORAGE_KEY) && !tourFiredRef.current) {
              tourFiredRef.current = true;
              setTourKey((k) => k + 1);
              setTourRun(true);
            }
          } catch { /* ignore */ }
        }

        // ── Sessions (was /api/account/chats?summary=1) ──────────────────
        const hydrated = payload.sessions
          .map((entry): ChatSessionState<ConsultationItem> => {
            return {
              localId: `db-${entry.session.sessionId}`,
              title:
                entry.session.title &&
                !knownNewSessionTitles.has(entry.session.title) &&
                !knownInProgressTitles.has(entry.session.title)
                  ? entry.session.title
                  : entry.firstQuestion?.trim().slice(0, 80) ||
                    sessionUi.defaultSessionTitle,
              sessionId: entry.session.sessionId,
              publicSessionId: entry.session.publicId,
              thread: [],
              threadMaxDepth: null,
              messageCount: entry.messageCount,
              updatedAt: entry.updatedAt ?? entry.session.createdAt,
              firstConsultationAt: entry.firstConsultationAt ?? null,
            };
          })
          .filter((s) => s.messageCount > 0);
        if (hydrated.length === 0) {
          setHistoryLoadError(null);
          return;
        }
        let combinedSessions: ChatSessionState<ConsultationItem>[] = hydrated;
        setSessions((prev) => {
          const merged = hydrated.map((next) => {
            const existing = prev.find((s) => s.sessionId === next.sessionId);
            if (!existing) return next;
            return {
              ...next,
              title:
                existing.title &&
                !knownNewSessionTitles.has(existing.title) &&
                !knownInProgressTitles.has(existing.title)
                  ? existing.title
                  : next.title,
              // Preserve the thread only if it is already complete or it belongs
              // to the currently active session (avoid clearing a visible thread
              // mid-session on JWT refresh). In all other cases clear to [] so
              // Fix 3 can detect the stale state and trigger a fresh fetch.
              thread:
                existing.thread.length >= next.messageCount ||
                existing.localId === activeSessionLocalIdRef.current
                  ? existing.thread
                  : [],
              threadMaxDepth: existing.threadMaxDepth ?? next.threadMaxDepth,
              messageCount: Math.max(next.messageCount, existing.messageCount),
              updatedAt: Math.max(next.updatedAt, existing.updatedAt),
              firstConsultationAt:
                next.firstConsultationAt ?? existing.firstConsultationAt,
            };
          });
          combinedSessions = mergeHydratedWithLocalDrafts({
            previous: prev,
            hydrated: merged,
          });
          return combinedSessions;
        });
        if (summaryCacheKey) {
          try {
            sessionStorage.setItem(summaryCacheKey, JSON.stringify(hydrated));
          } catch {
            // ignore cache save errors
          }
        }
        if (authUserId) {
          void putIdbChats(authUserId, hydrated
            .filter((s) => s.sessionId !== null)
            .map((s): IdbChatEntry => ({
              localId: s.localId,
              title: s.title,
              sessionId: s.sessionId as string,
              publicSessionId: s.publicSessionId ?? null,
              messageCount: s.messageCount,
              updatedAt: s.updatedAt,
              firstConsultationAt: s.firstConsultationAt ?? null,
            })));
        }
        const pinnedLocalId = pinnedLocalSessionIdRef.current;
        if (
          pinnedLocalId &&
          !combinedSessions.some((s) => s.localId === pinnedLocalId)
        ) {
          pinnedLocalSessionIdRef.current = null;
        }
        const activeLocalId = activeSessionLocalIdRef.current;
        const preferredLocalId = pickPreferredSessionLocalId({
          sessions: combinedSessions,
          pinnedLocalId: pinnedLocalSessionIdRef.current,
          activeLocalId,
        });
        setActiveSessionLocalId(preferredLocalId);
        const selected =
          combinedSessions.find((s) => s.localId === preferredLocalId) ??
          combinedSessions[0];
        if (
          selected?.sessionId &&
          selected.thread.length < selected.messageCount
        ) {
          void loadSessionThread(selected.sessionId, selected.localId);
        }
        if (!cancelled) {
          setSessionsServerHydrated(true);
        }
        setHistoryLoadError(null);
      } catch {
        setHistoryLoadError(sessionUi.historyNetworkError);
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    authReady,
    accessToken,
    sessionsHydrated,
    authUserId,
    router,
    knownInProgressTitles,
    knownNewSessionTitles,
    sessionUi,
    loadSessionThread,
    summaryCacheKey,
    chatStateCacheKey,
    hydrateFromStorage,
    signOut,
    setSessionsServerHydrated,
  ]);

  async function startTwoFactorEnrollment() {
    if (!accessToken) {
      setTwoFactorError(tf.signInFor2fa);
      return;
    }
    setTwoFactorBusy(true);
    setTwoFactorError(null);
    setTwoFactorInfo(null);
    try {
      const res = await fetch("/api/auth/2fa/enroll", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = (await res.json()) as {
        qrDataUrl?: string;
        error?: string;
        code?: string;
      };
      if (!res.ok || !data.qrDataUrl) {
        if (data.code === "TWO_FACTOR_ENCRYPTION_KEY_MISSING") {
          setTwoFactorError(tf.enrollEncryptionKeyMissing);
          return;
        }
        if (data.code === "AUTH_PROVIDER_NOT_CONFIGURED") {
          setTwoFactorError(tf.enrollAuthProviderMissing);
          return;
        }
        setTwoFactorError(tf.enrollTryLater);
        return;
      }
      setTwoFactorQrDataUrl(data.qrDataUrl);
      setTwoFactorSetupOpen(true);
      setTwoFactorRecoveryCodes([]);
      setTwoFactorRecoveryAck(false);
    } catch {
      setTwoFactorError(tf.enrollTryLater);
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function confirmTwoFactorEnrollment() {
    if (!accessToken || !twoFactorCode.trim()) return;
    setTwoFactorBusy(true);
    setTwoFactorError(null);
    setTwoFactorInfo(null);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token: twoFactorCode.trim() }),
      });
      const data = (await res.json()) as {
        recoveryCodes?: string[];
        error?: string;
        code?: string;
      };
      if (!res.ok || !Array.isArray(data.recoveryCodes)) {
        if (data.code === "TWO_FACTOR_NOT_ENROLLED") {
          setTwoFactorError(tf.confirmNotEnrolled);
          return;
        }
        if (data.code === "TWO_FACTOR_ENCRYPTION_KEY_MISSING") {
          setTwoFactorError(tf.confirmEncryptionKeyMissing);
          return;
        }
        if (data.code === "TWO_FACTOR_SECRET_DECRYPT_FAILED") {
          setTwoFactorError(tf.confirmDecryptFailed);
          return;
        }
        setTwoFactorError(tf.confirmTotpInvalid);
        return;
      }
      if (authUserId) {
        sessionStorage.setItem(`iching_2fa_passed_v1:${authUserId}`, "1");
      }
      setSecondFactorVerified(true);
      setTwoFactorEnabled(true);
      setTwoFactorMethod("totp");
      setTwoFactorSetupOpen(false);
      setTwoFactorQrDataUrl(null);
      setTwoFactorRecoveryCodes(data.recoveryCodes);
      setTwoFactorCode("");
      setTwoFactorRecoveryAck(false);
      setTwoFactorInfo(tf.infoTwoFaEnabledSaveCodes);
    } catch {
      setTwoFactorError(tf.confirmTryLater);
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function sendEmailTwoFactorCode() {
    if (!accessToken) {
      setTwoFactorError(tf.signInFor2fa);
      return;
    }
    setTwoFactorBusy(true);
    setTwoFactorError(null);
    setTwoFactorInfo(null);
    try {
      const res = await fetch("/api/auth/2fa/email/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        message?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        if (data?.code === "AUTH_REQUIRED") {
          setTwoFactorError(tf.sendSessionExpired);
          return;
        }
        if (data?.code === "TWO_FACTOR_LOCKED") {
          setTwoFactorError(tf.sendLocked);
          return;
        }
        if (data?.code === "TWO_FACTOR_EMAIL_NOT_CONFIGURED") {
          setTwoFactorError(tf.sendEmailNotConfiguredServer);
          return;
        }
        if (data?.code === "TWO_FACTOR_EMAIL_DELIVERY_FAILED") {
          const deliveryMessage =
            typeof data?.message === "string" ? data.message : null;
          setTwoFactorError(
            deliveryMessage
              ? interpolate(tf.emailDeliveryFailedReason, {
                  reason: deliveryMessage,
                })
              : tf.emailDeliveryFailedResendHint,
          );
          return;
        }
        setTwoFactorError(tf.sendTryLater);
        return;
      }
      setTwoFactorEmailSent(true);
      setTwoFactorInfo(tf.infoCodeSent);
    } catch {
      setTwoFactorError(tf.sendTryLater);
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function verifyEmailTwoFactorCode() {
    if (!accessToken || !twoFactorEmailCode.trim()) return;
    setTwoFactorBusy(true);
    setTwoFactorError(null);
    setTwoFactorInfo(null);
    try {
      const res = await fetch("/api/auth/2fa/email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ code: twoFactorEmailCode.trim() }),
      });
      const data = (await res.json()) as {
        recoveryCodes?: string[];
        code?: string;
      };
      if (!res.ok || !Array.isArray(data.recoveryCodes)) {
        if (data.code === "TWO_FACTOR_EMAIL_CODE_EXPIRED") {
          setTwoFactorError(tf.verifyEmailExpired);
          return;
        }
        if (data.code === "TWO_FACTOR_EMAIL_CODE_MISSING") {
          setTwoFactorError(tf.verifyEmailRequestFirst);
          return;
        }
        setTwoFactorError(tf.verifyEmailInvalid);
        return;
      }
      if (authUserId) {
        sessionStorage.setItem(`iching_2fa_passed_v1:${authUserId}`, "1");
      }
      setSecondFactorVerified(true);
      setTwoFactorEnabled(true);
      setTwoFactorMethod("email");
      setTwoFactorSetupOpen(false);
      setTwoFactorQrDataUrl(null);
      setTwoFactorRecoveryCodes(data.recoveryCodes);
      setTwoFactorEmailCode("");
      setTwoFactorEmailSent(false);
      setTwoFactorRecoveryAck(false);
      setTwoFactorInfo(tf.infoTwoFaEnabledSaveCodes);
    } catch {
      setTwoFactorError(tf.verifyEmailTryLater);
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function disableTwoFactor() {
    if (!accessToken) return;
    setTwoFactorBusy(true);
    setTwoFactorError(null);
    setTwoFactorInfo(null);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        setTwoFactorError(tf.disableFailed);
        return;
      }
      setTwoFactorEnabled(false);
      setTwoFactorMethod(null);
      setTwoFactorSetupOpen(false);
      setTwoFactorQrDataUrl(null);
      setTwoFactorCode("");
      setTwoFactorEmailCode("");
      setTwoFactorEmailSent(false);
      setTwoFactorRecoveryCodes([]);
      if (authUserId) {
        sessionStorage.removeItem(`iching_2fa_passed_v1:${authUserId}`);
      }
      setSecondFactorVerified(false);
      setTwoFactorModalOpen(false);
      setTwoFactorInfo(tf.disabledOk);
    } catch {
      setTwoFactorError(tf.disableFailed);
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function verifyTwoFactorChallenge() {
    if (!accessToken) return;
    const payload: {
      token?: string;
      emailCode?: string;
      recoveryCode?: string;
    } = {};
    const usingRecoveryCode = twoFactorRecoveryAssistMode === "enter_code";
    if (usingRecoveryCode && twoFactorRecoveryCode.trim().length >= 8) {
      payload.recoveryCode = twoFactorRecoveryCode.trim();
    }
    if (
      !usingRecoveryCode &&
      twoFactorChallengeMethod === "totp" &&
      twoFactorCode.trim().length >= 6
    ) {
      payload.token = twoFactorCode.trim();
    }
    if (
      !usingRecoveryCode &&
      twoFactorChallengeMethod === "email" &&
      twoFactorEmailCode.trim().length >= 6
    ) {
      payload.emailCode = twoFactorEmailCode.trim();
    }
    if (!payload.token && !payload.emailCode && !payload.recoveryCode) {
      setTwoFactorError(
        usingRecoveryCode ? tf.challengeNeedRecovery : tf.challengeNeedSixDigit,
      );
      return;
    }
    setTwoFactorBusy(true);
    setTwoFactorError(null);
    setTwoFactorInfo(null);
    try {
      const res = await fetch("/api/auth/2fa/challenge/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          code?: string;
        } | null;
        if (data?.code === "AUTH_REQUIRED") {
          setTwoFactorError(tf.challengeSessionExpired);
          return;
        }
        if (data?.code === "TWO_FACTOR_LOCKED") {
          setTwoFactorError(tf.challengeLocked);
          return;
        }
        if (data?.code === "TWO_FACTOR_EMAIL_CODE_MISSING") {
          setTwoFactorError(tf.challengeEmailMissing);
          return;
        }
        if (data?.code === "TWO_FACTOR_EMAIL_CODE_EXPIRED") {
          setTwoFactorError(tf.challengeEmailExpired);
          return;
        }
        if (data?.code === "TWO_FACTOR_NOT_ENROLLED") {
          setTwoFactorError(tf.challengeMethodNotLinked);
          return;
        }
        if (data?.code === "TWO_FACTOR_EMAIL_NOT_CONFIGURED") {
          setTwoFactorError(tf.challengeEmailServerMisconfig);
          return;
        }
        if (data?.code === "TWO_FACTOR_SECRET_DECRYPT_FAILED") {
          setTwoFactorError(tf.challengeDecryptFailed);
          return;
        }
        if (data?.code === "TWO_FACTOR_INVALID_CODE") {
          const nextFailures = twoFactorChallengeFailures + 1;
          setTwoFactorChallengeFailures(nextFailures);
          if (!usingRecoveryCode && nextFailures >= 2) {
            setTwoFactorRecoveryAssistMode("options");
            setTwoFactorError(tf.challengeInvalidWithRecovery);
            return;
          }
        }
        setTwoFactorError(tf.challengeInvalidCode);
        return;
      }
      if (authUserId) {
        sessionStorage.setItem(`iching_2fa_passed_v1:${authUserId}`, "1");
      }
      setSecondFactorVerified(true);
      setTwoFactorChallengeFailures(0);
      setTwoFactorRecoveryAssistMode("hidden");
      setTwoFactorCode("");
      setTwoFactorEmailCode("");
      setTwoFactorRecoveryCode("");
      setTwoFactorModalOpen(false);
      setTwoFactorModalMode("manage");
      setTwoFactorChallengeMethod("totp");
    } catch {
      setTwoFactorError(tf.challengeVerifyFailed);
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function openPlansCheckoutNewTab(): Promise<boolean> {
    // In the React Native WebView shell, delegate to native Google Play Billing.
    const rnBridge = (window as unknown as { ReactNativeWebView?: { postMessage(s: string): void } })
      .ReactNativeWebView;
    if (rnBridge) {
      rnBridge.postMessage(JSON.stringify({ type: "purchase_tokens" }));
      return true;
    }

    // Web browser: use RevenueCat Web Billing (Stripe).
    const built = await buildPlansCheckoutUrl(
      process.env.NEXT_PUBLIC_PLANS_URL,
      {
        appUserId: authUserId,
        /** Authenticated CTAs must send app_user_id; fail the open if we cannot resolve it. */
        requireAppUserId: Boolean(accessToken),
      },
    );
    if (!built.ok) return false;
    window.open(built.url, "_blank", "noopener,noreferrer");
    return true;
  }

  async function openTokenCenter() {
    if (!accessToken) {
      setError(tokenPanel.signInForBalance);
      return;
    }
    setTokenCenterOpen(true);
    setTokenCenterBusy(true);
    setTokenCenterError(null);
    setTokenCenterMessage(null);
    try {
      const res = await fetch("/api/account/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as {
        id?: string;
        last_pack?: string;
        tokens_available?: number;
        session_limit?: number;
      } | null;
      if (!res.ok || !data) {
        setTokenCenterError(tokenPanel.loadError);
        return;
      }
      if (typeof data.last_pack === "string") setTier(data.last_pack as Tier);
      if (typeof data.tokens_available === "number")
        setTokenBalance(data.tokens_available);
      if (typeof data.session_limit === "number") {
        setAccountSessionLimit(data.session_limit);
        if (authUserId)
          writeCachedAccountSessionLimit(authUserId, data.session_limit);
      }
      // No contextual message set here — token balance is already shown in the center UI.
    } catch {
      setTokenCenterError(tokenPanel.loadError);
    } finally {
      setTokenCenterBusy(false);
    }
  }

  async function onConsult() {
    if (!activeSession) {
      const created = createLocalSession(inProgressTitle);
      setSessions([created]);
      setActiveSessionLocalId(created.localId);
      return;
    }
    if (threadLimitReachedUi) {
      if (threadLimitBannerDismissed) {
        setError(tokenPanel.consultThreadLimit);
      }
      return;
    }
    const questionForRequest = question.trim();
    if (!questionForRequest) {
      setError(
        oracleMode === "oracle_bones"
          ? sessionUi.emptyQueryBones
          : sessionUi.emptyQueryIching,
      );
      return;
    }
    if (!accessToken) {
      setAuthContinueOpen(true);
      return;
    }
    if (twoFactorEnabled && !secondFactorVerified) {
      setTwoFactorSetupOpen(false);
      setTwoFactorQrDataUrl(null);
      setTwoFactorRecoveryCodes([]);
      setTwoFactorCode("");
      setTwoFactorEmailCode("");
      setTwoFactorRecoveryCode("");
      setTwoFactorEmailSent(false);
      setTwoFactorChallengeFailures(0);
      setTwoFactorRecoveryAssistMode("hidden");
      setTwoFactorChallengeMethod(preferredTwoFactorMethod);
      setTwoFactorInfo(null);
      setTwoFactorError(null);
      setTwoFactorModalMode("challenge");
      setTwoFactorModalOpen(true);
      setError(tf.verify2faToContinue);
      return;
    }
    if (oracleMode === "iching" && ichingCastMode === "manual") {
      if (ichingCastingMethod === "yarrow-stalks") {
        setManualYarrowQuestionSnapshot(questionForRequest);
        setManualYarrowWizardOpen(true);
      } else {
        setManualWizardQuestionSnapshot(questionForRequest);
        setManualWizardOpen(true);
      }
      return;
    }
    await executeConsultationRequest(questionForRequest);
  }

  async function executeConsultationRequest(
    questionForRequest: string,
    manualLineValues?: IchingManualLineTuple,
  ) {
    if (manualRitualPhaseSwitchTimerRef.current != null) {
      window.clearTimeout(manualRitualPhaseSwitchTimerRef.current);
      manualRitualPhaseSwitchTimerRef.current = null;
    }
    manualRitualFinaleShownRef.current = false;
    const isManualCast = Boolean(manualLineValues);
    const showRitualAnimation =
      oracleMode === "oracle_bones" || oracleMode === "iching";
    let manualCastPreviewEngine: ManualCastPreview | null = null;
    setLoading(true);
    setError(null);
    setCreditsNotice(null);
    setPendingUserQuestion(questionForRequest || null);
    if (manualLineValues) {
      try {
        manualCastPreviewEngine = previewCastFromLineValues(manualLineValues);
        setManualCastPreview({
          primaryHexagram: manualCastPreviewEngine.primaryHexagram.number,
          primaryHexagramChinese:
            manualCastPreviewEngine.primaryHexagram.chineseName,
          transformedHexagram:
            manualCastPreviewEngine.transformedHexagram?.number ?? null,
          mutationRule: manualCastPreviewEngine.mutationRule,
        });
      } catch {
        manualCastPreviewEngine = null;
        setManualCastPreview(null);
      }
    } else {
      setManualCastPreview(null);
    }
    if (!activeSession) {
      setLoading(false);
      setManualCastPreview(null);
      setPendingUserQuestion(null);
      setError(sessionUi.noActiveSession);
      return;
    }
    const consultSession = activeSession;
    setBoneRitualResult(null);
    setRitualLines(null);
    setRitualRevealTick(0);
    setRitualAwaitingTick(0);
    setRitualStatusPhase("question");
    setRitualFinale(false);
    setRitualDebugCastVector(null);
    setRitualDebugFinalVector(null);
    setLastRitualDebugSnapshot(null);
    setQuestion("");
    requestAnimationFrame(() => resizeQuestionInput());
    ritualDebugStartMsRef.current = Date.now();
    logRitualTrace("submit:start", {
      oracleMode,
      questionLength: questionForRequest.length,
    });
    if (manualCastPreviewEngine && oracleMode === "iching") {
      try {
        const ordered = [
          ...engineLinesToApiLines(manualCastPreviewEngine.lines),
        ].sort((a, b) => a.position - b.position);
        setRitualLines(ordered);
        setRitualRevealTick(12);
        setRitualStatusPhase("consult");
        const vec = apiLinesToVector(ordered);
        setRitualDebugCastVector(vec);
        setRitualDebugFinalVector(vec);
        const transformed = transformLineVector(vec);
        setLastRitualDebugSnapshot({
          castBase: vec,
          finalBase: vec,
          castTransformed: transformed,
          finalTransformed: transformed,
          match: true,
          mutationRule: String(manualCastPreviewEngine.mutationRule),
          transformedHexagram:
            manualCastPreviewEngine.transformedHexagram?.number ?? null,
        });
        if (ichingCastMode === "manual") {
          const budgetMs = ichingRitualProcessingBudgetMs(
            lastIchingConsultWallMsRef.current,
          );
          const timing = ichingRitualRevealTimingFromBudget(budgetMs);
          const phaseOneMs = Math.max(1200, timing.tickDelayMs * 12);
          logRitualTrace("manual:phase-switch-scheduled", {
            budgetMs,
            phaseOneMs,
          });
          manualRitualPhaseSwitchTimerRef.current = window.setTimeout(() => {
            manualRitualFinaleShownRef.current = true;
            setRitualStatusPhase("seal");
            setRitualFinale(true);
            logRitualTrace("manual:phase-switch-fired");
          }, phaseOneMs);
        }
      } catch {
        /* leave ritual slots empty */
      }
    }
    setPhase(
      showRitualAnimation
        ? oracleMode === "oracle_bones"
          ? "bones"
          : "coins"
        : "idle",
    );
    let ok = false;
    try {
      let sessionIdForRequest = consultSession.sessionId;
      if (!isPersistableUuid(sessionIdForRequest)) {
        sessionIdForRequest = newClientUuid();
        updateActiveSession((c) => ({ ...c, sessionId: sessionIdForRequest }));
      }
      ichingConsultWallClockStartedAtRef.current =
        oracleMode === "iching" ? Date.now() : null;
      const requestPayload = {
        question: questionForRequest,
        language: detectInputLanguage(questionForRequest, locale),
        /** Manual cast must never request SSE — long tick reveal only applies to automatic mode. */
        responseMode:
          oracleMode === "iching" && ichingCastMode === "auto"
            ? "stream_ritual"
            : "ritual",
        sessionId: sessionIdForRequest,
        sessionTitle: consultSession.title,
        isDeepening: activeThread.length > 0,
        oracleMode,
        ...(oracleMode === "iching"
          ? manualLineValues
            ? {
                ichingCastMode: "manual" as const,
                ichingCastingMethod,
                ichingManualLineValues: [...manualLineValues],
              }
            : { ichingCastMode, ichingCastingMethod }
          : {}),
        translatorId,
        displayName: displayName ?? undefined,
        oracleBones:
          oracleMode === "oracle_bones"
            ? {
                positiveCharge: questionForRequest,
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
              }
            : undefined,
        })),
      };

      const sendConsultRequest = (bearerToken: string) =>
        fetch("/api/consult", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(requestPayload),
        });

      if (!accessToken) {
        setError(sessionUi.sessionExpiredInvalid);
        return;
      }
      let res = await sendConsultRequest(accessToken);
      if (res.status === 401 && isSupabaseBrowserConfigured()) {
        try {
          const sb = getSupabaseBrowser();
          const { data: refreshed, error: refreshError } =
            await sb.auth.refreshSession();
          const refreshedToken = refreshed.session?.access_token ?? null;
          if (!refreshError && refreshedToken) {
            setAccessToken(refreshedToken);
            res = await sendConsultRequest(refreshedToken);
          }
        } catch {
          // keep original 401 handling below
        }
      }
      let data: ConsultResponse & {
        error?: string;
        code?: string;
        action?: string;
        message?: string;
        tier?: string;
        creditsLimit?: number;
        creditsReason?: string | null;
      };
      const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
      logRitualTrace("response:headers", { contentType, status: res.status });
      const waitForRitualPaint = () =>
        new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => resolve());
          });
        });
      const runIChingRitualReveal = async (
        linesPayload: ApiLine[],
        timing: IchingRitualRevealTiming,
      ) => {
        const ordered = [...linesPayload].sort(
          (a, b) => a.position - b.position,
        );
        logRitualTrace("reveal:start", {
          orderedPositions: ordered.map((line) => line.position),
          tickDelayMs: timing.tickDelayMs,
          finaleHold: "until-response",
        });
        setRitualLines(ordered);
        setRitualRevealTick(0);
        setRitualAwaitingTick(0);
        setRitualStatusPhase("shape");
        setRitualFinale(false);
        for (let t = 1; t <= 12; t += 1) {
          setRitualRevealTick(t);
          logRitualTrace("reveal:tick", { tick: t });
          await new Promise((r) => window.setTimeout(r, timing.tickDelayMs));
        }
        setRitualStatusPhase("seal");
        setRitualFinale(true);
        logRitualTrace("reveal:finale-hold-until-response");
      };
      if (contentType.includes("text/event-stream")) {
        if (!res.body) {
          setError(sessionUi.invalidServerResponse);
          return;
        }
        /**
         * SSE ritual timing (auto I Ching):
         * - `cast_ready` starts `runIChingRitualReveal` with tick + finale delays derived from **last** consult wall time
         *   (fallback `ICHING_RITUAL_TARGET_MS`), split phase1:phase2 via env weights (default 25:15).
         * - Stream read runs in parallel; do **not** await reveal after close — reading shows when `final_ready` is processed.
         */
        const decoder = new TextDecoder();
        const reader = res.body.getReader();
        let buffer = "";
        let finalPayload:
          | (ConsultResponse & { error?: string; message?: string })
          | null = null;
        let streamErrored = false;
        let revealStarted = false;
        let revealPromise: Promise<void> | null = null;
        let castVectorFromStream: Array<6 | 7 | 8 | 9> | null = null;

        const startLineReveal = (linesPayload: ApiLine[]) => {
          if (revealStarted) return;
          revealStarted = true;
          castVectorFromStream = apiLinesToVector(linesPayload);
          setRitualDebugCastVector(castVectorFromStream);
          const processingBudget = ichingRitualProcessingBudgetMs(
            lastIchingConsultWallMsRef.current,
          );
          const timing = ichingRitualRevealTimingFromBudget(processingBudget);
          logRitualTrace("reveal:budget", {
            processingBudgetMs: processingBudget,
          });
          revealPromise = runIChingRitualReveal(linesPayload, timing);
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";
          for (const chunk of chunks) {
            const lines = chunk
              .split("\n")
              .map((line) => line.trimEnd())
              .filter(Boolean);
            let eventName = "message";
            const dataLines: string[] = [];
            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventName = line.slice("event:".length).trim();
              } else if (line.startsWith("data:")) {
                dataLines.push(line.slice("data:".length).trimStart());
              }
            }
            if (!dataLines.length) continue;
            let payload: unknown;
            try {
              payload = JSON.parse(dataLines.join("\n"));
            } catch {
              continue;
            }
            if (eventName === "cast_ready") {
              logRitualTrace("sse:event", { eventName });
              const castPayload = payload as { lines?: ApiLine[] };
              if (
                Array.isArray(castPayload.lines) &&
                castPayload.lines.length === 6
              ) {
                startLineReveal(castPayload.lines);
              }
            } else if (eventName === "final_ready") {
              logRitualTrace("sse:event", { eventName });
              finalPayload = payload as ConsultResponse & {
                error?: string;
                message?: string;
              };
            } else if (eventName === "error") {
              logRitualTrace("sse:event", { eventName });
              streamErrored = true;
              const err = payload as {
                message?: string;
                code?: string;
                action?: string;
                error?: string;
              };
              if (err.code === "AUTH_REQUIRED" || err.action === "login") {
                setError(sessionUi.sessionExpiredInvalid);
                void signOut();
              } else {
                setError(err.message || sessionUi.consultFailedGeneric);
              }
            }
          }
        }
        if (streamErrored || !finalPayload) {
          if (!streamErrored) {
            setError(sessionUi.streamInterrupted);
          }
          return;
        }
        if (revealPromise) {
          void revealPromise;
        }
        data = finalPayload;
        if (
          Array.isArray(finalPayload.lines) &&
          finalPayload.lines.length === 6
        ) {
          const finalVec = apiLinesToVector(finalPayload.lines);
          setRitualDebugFinalVector(finalVec);
          const castBaseForSnapshot =
            castVectorFromStream ?? ritualDebugCastVector ?? finalVec;
          const castTransformed = transformLineVector(castBaseForSnapshot);
          const finalTransformed = transformLineVector(finalVec);
          setLastRitualDebugSnapshot({
            castBase: castBaseForSnapshot,
            finalBase: finalVec,
            castTransformed,
            finalTransformed,
            match: castTransformed.join(",") === finalTransformed.join(","),
            mutationRule: finalPayload.mutationRule,
            transformedHexagram: finalPayload.transformedHexagram ?? null,
          });
        }
      } else {
        const rawText = await res.text();
        try {
          if (!rawText.trim()) {
            throw new SyntaxError("empty body");
          }
          data = JSON.parse(rawText) as ConsultResponse & {
            error?: string;
            message?: string;
          };
        } catch {
          setError(
            res.ok
              ? sessionUi.invalidServerResponse
              : formatServerErrorStatus(sessionUi, res.status),
          );
          return;
        }
      }
      if (!res.ok) {
        if (res.status === 401) {
          setError(sessionUi.sessionExpiredInvalid);
          void signOut();
          return;
        }
        if (res.status === 429 && data.error === "session_limit") {
          setError(tokenPanel.consultThreadLimit);
          return;
        }
        if (res.status === 402 && data.error === "no_tokens") {
          setTokenBalance(0);
          setCreditsNotice({
            tier: tierToBillingTierCopy(tier),
            reason: "credits_depleted",
          });
          setError(tokenPanel.noTokensDepleted);
          return;
        }
        if (
          res.status === 403 &&
          (data.error === "two_factor_required" || data.action === "setup_2fa")
        ) {
          setConsultPanelOpen(true);
          setError(tf.twoFaRequiredByPolicy);
          return;
        }
        const serverMsg =
          typeof data.message === "string" && data.message.trim()
            ? data.message.trim()
            : undefined;
        const suffix = serverMsg ? ` ${serverMsg}` : "";
        if (data.error === "consult_failed") {
          setError(formatConsultFailedMessage(sessionUi, serverMsg));
          return;
        }
        setError(
          `${data.error ?? interpolate(sessionUi.requestFailedStatus, { status: res.status })}${suffix}`,
        );
        return;
      }
      /** POST-HTTP beat: JSON ritual paints lines after one blob; SSE already ran `runIChingRitualReveal` during the stream. */
      const sseIchingAutoRitualComplete =
        showRitualAnimation &&
        contentType.includes("text/event-stream") &&
        oracleMode === "iching" &&
        ichingCastMode === "auto";
      const initialPauseAfterOkMs = !showRitualAnimation
        ? 0
        : sseIchingAutoRitualComplete
          ? 0
          : isManualCast && oracleMode === "iching"
            ? 0
            : 900;
      await new Promise((r) => window.setTimeout(r, initialPauseAfterOkMs));
      if (
        showRitualAnimation &&
        oracleMode === "oracle_bones" &&
        data.oracleBones
      ) {
        setBoneRitualResult(data.oracleBones.verdict);
        await new Promise((r) => window.setTimeout(r, 4050));
      }
      if (
        showRitualAnimation &&
        oracleMode === "iching" &&
        !contentType.includes("text/event-stream") &&
        Array.isArray(data.lines) &&
        data.lines.length === 6
      ) {
        const orderedLines = [...data.lines].sort(
          (a, b) => a.position - b.position,
        );
        if (ichingCastMode === "manual" && isManualCast) {
          const fetchStartedAt = ichingConsultWallClockStartedAtRef.current;
          const fetchMs =
            fetchStartedAt != null
              ? Math.max(0, Date.now() - fetchStartedAt)
              : 0;
          const finalVec = apiLinesToVector(orderedLines);
          const castBaseForSnapshot = ritualDebugCastVector ?? finalVec;
          setRitualDebugFinalVector(finalVec);
          const castTransformed = transformLineVector(castBaseForSnapshot);
          const finalTransformed = transformLineVector(finalVec);
          setLastRitualDebugSnapshot({
            castBase: castBaseForSnapshot,
            finalBase: finalVec,
            castTransformed,
            finalTransformed,
            match: castTransformed.join(",") === finalTransformed.join(","),
            mutationRule: data.mutationRule,
            transformedHexagram: data.transformedHexagram ?? null,
          });
          setRitualLines(orderedLines);
          setRitualRevealTick(12);
          if (!manualRitualFinaleShownRef.current) {
            manualRitualFinaleShownRef.current = true;
            setRitualStatusPhase("seal");
            setRitualFinale(true);
            logRitualTrace("reveal:manual-lines-sync", {
              fetchMs,
              forcedOnResponse: true,
            });
            await waitForRitualPaint();
          } else {
            logRitualTrace("reveal:manual-lines-sync", {
              fetchMs,
              forcedOnResponse: false,
            });
          }
        } else {
          const vec = apiLinesToVector(orderedLines);
          setRitualDebugCastVector(vec);
          setRitualDebugFinalVector(vec);
          const transformed = transformLineVector(vec);
          setLastRitualDebugSnapshot({
            castBase: vec,
            finalBase: vec,
            castTransformed: transformed,
            finalTransformed: transformed,
            match: true,
            mutationRule: data.mutationRule,
            transformedHexagram: data.transformedHexagram ?? null,
          });
          const measuredThisJsonMs =
            ichingConsultWallClockStartedAtRef.current != null
              ? Math.max(
                  0,
                  Date.now() - ichingConsultWallClockStartedAtRef.current,
                )
              : null;
          const jsonTimingBudget = ichingRitualProcessingBudgetMs(
            measuredThisJsonMs ?? lastIchingConsultWallMsRef.current,
          );
          const jsonRevealTiming =
            ichingRitualRevealTimingFromBudget(jsonTimingBudget);
          void runIChingRitualReveal(orderedLines, jsonRevealTiming);
        }
      }
      const item: ConsultationItem = {
        ...data,
        oracleType: data.oracleType ?? "iching",
        question:
          data.oracleType === "oracle_bones" && data.oracleBones?.positiveCharge
            ? data.oracleBones.positiveCharge
            : questionForRequest,
        createdAt: Date.now(),
      };
      updateActiveSession((current) => {
        const nextThreadMax =
          typeof data.sessionMaxDepth === "number" &&
          Number.isFinite(data.sessionMaxDepth) &&
          data.sessionMaxDepth > 0
            ? data.sessionMaxDepth
            : current.threadMaxDepth;
        return {
          ...current,
          threadMaxDepth: nextThreadMax ?? current.threadMaxDepth,
          thread: [...current.thread, item],
          messageCount: Math.max(
            current.messageCount,
            current.thread.length + 1,
          ),
          sessionId: data.sessionId,
          publicSessionId: data.publicSessionId ?? current.publicSessionId,
          title:
            knownInProgressTitles.has(current.title) ||
            knownNewSessionTitles.has(current.title)
              ? item.question.slice(0, 60)
              : current.title,
          updatedAt: item.createdAt ?? Date.now(),
          firstConsultationAt:
            current.firstConsultationAt ?? item.createdAt ?? Date.now(),
        };
      });
      if (
        typeof item.consultationId === "string" &&
        item.consultationId.length > 0
      ) {
        setRevealConsultationId(item.consultationId);
      }
      setPendingUserQuestion(null);
      if (
        typeof data.remainingCredits === "number" &&
        Number.isFinite(data.remainingCredits)
      ) {
        setTokenBalance(data.remainingCredits);
      }
      // No fallback /api/account/me fetch here — /api/consult always returns
      // remainingCredits. A hard fetch added 4 PostgREST calls per consultation
      // and caused accountSessionLimit to change, which re-created loadSessionThread
      // and re-ran the bootstrap effect in a cascade.
      const today = new Date().toISOString().slice(0, 10);
      setDailyCount((prev) => {
        const next = prev + 1;
        localStorage.setItem(dailyCountStorageKey(today), String(next));
        return next;
      });
      if (
        oracleMode === "iching" &&
        ichingConsultWallClockStartedAtRef.current != null
      ) {
        const rawWallMs =
          Date.now() - ichingConsultWallClockStartedAtRef.current;
        lastIchingConsultWallMsRef.current =
          ichingRitualProcessingBudgetMs(rawWallMs);
        logRitualTrace("iching:stored-wall-ms", {
          rawWallMs,
          storedBudgetMs: lastIchingConsultWallMsRef.current,
        });
      }
      setPhase("reading");
      logRitualTrace("submit:complete");
      setConsultPanelOpen(false);
      setManualCastPreview(null);
      ok = true;
    } catch (e) {
      logRitualTrace("submit:error", {
        error: e instanceof Error ? e.message : String(e),
      });
      setError(e instanceof Error ? e.message : "Error");
      setPendingUserQuestion(null);
      setManualCastPreview(null);
    } finally {
      ichingConsultWallClockStartedAtRef.current = null;
      if (manualRitualPhaseSwitchTimerRef.current != null) {
        window.clearTimeout(manualRitualPhaseSwitchTimerRef.current);
        manualRitualPhaseSwitchTimerRef.current = null;
      }
      manualRitualFinaleShownRef.current = false;
      setLoading(false);
      if (!ok) {
        setQuestion(questionForRequest);
        requestAnimationFrame(() => resizeQuestionInput());
        setRitualStatusPhase("question");
        setPhase("idle");
        setPendingUserQuestion(null);
        setManualCastPreview(null);
      }
    }
  }

  const creditsExhaustedCopy = creditsNotice
    ? creditsExhaustedBlock(creditsNotice.tier, creditsNotice.reason, locale)
    : null;

  const onboardingUi = getOnboardingUiMessages(locale);
  const onboardingNameValid = onboardingInput.trim().length > 0;

  async function saveDisplayName() {
    if (!onboardingNameValid || !accessToken) return;
    setOnboardingSaving(true);
    try {
      const res = await fetch("/api/account/display-name", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ display_name: onboardingInput.trim() }),
      });
      if (res.ok) {
        setDisplayName(onboardingInput.trim());
        setOnboardingOpen(false);
        try {
          if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
            setTourKey((k) => k + 1);
            setTourRun(true);
          }
        } catch { /* ignore */ }
      }
    } finally {
      setOnboardingSaving(false);
    }
  }

  const localeSelector = (
    <div className="locale-control">
      <AuthLocalePicker
        locale={locale}
        onChange={setLocale}
        order={LOCALE_SELECT_ORDER}
        labels={getLanguageLabels()}
        ariaLabel={ui.language}
      />
    </div>
  );

  return (
    <OracleShell title={t.appTitle} variant="chat">
      <div className="oracle-chat-app">
        <AmbientParticles />
        {!playPromoDismissed ? (
          <div
            className="oracle-play-promo-strip"
            role="region"
            aria-label={presentation.regionAria}
          >
            <div className="oracle-play-promo-strip__inner">
              {playStoreUrl ? (
                <a
                  className="oracle-play-promo-strip__main"
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={presentation.playCtaAria}
                >
                  <span className="oracle-play-promo-strip__glyph" aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                      focusable="false"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="oracle-play-promo-strip__titles">
                    <span className="oracle-play-promo-strip__title">
                      {presentation.playBadgeTitle}
                    </span>
                    <span className="oracle-play-promo-strip__subtitle">
                      {presentation.playBadgeSubtitle}
                    </span>
                  </span>
                  <img
                    className="oracle-play-promo-strip__badge"
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    alt=""
                    width={135}
                    height={40}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="oracle-play-promo-strip__cta-label">
                    {presentation.playInstall}
                  </span>
                </a>
              ) : (
                <div
                  className="oracle-play-promo-strip__main oracle-play-promo-strip__main--soon"
                  role="status"
                >
                  <span className="oracle-play-promo-strip__glyph" aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="currentColor"
                      focusable="false"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="oracle-play-promo-strip__titles">
                    <span className="oracle-play-promo-strip__title">
                      {presentation.playBadgeTitle}
                    </span>
                    <span className="oracle-play-promo-strip__subtitle">
                      {presentation.playSoon}
                    </span>
                  </span>
                </div>
              )}
              <button
                type="button"
                className="oracle-play-promo-strip__dismiss"
                aria-label={presentation.playStripDismissAria}
                data-testid="play-promo-strip-dismiss"
                onClick={dismissPlayPromoStrip}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
        ) : null}
        {onboardingOpen && (
          <div
            className="onboarding-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
          >
            <div
              className="onboarding-card"
              onClick={(e) => e.stopPropagation()}
            >
              {onboardingStep === "enter" ? (
                <>
                  <h2 id="onboarding-title" className="onboarding-title">
                    {onboardingUi.title}
                  </h2>
                  <p className="onboarding-subtitle">{onboardingUi.subtitle}</p>
                  <input
                    className="onboarding-input"
                    type="text"
                    placeholder={onboardingUi.placeholder}
                    value={onboardingInput}
                    maxLength={60}
                    autoFocus
                    onChange={(e) => setOnboardingInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && onboardingNameValid)
                        setOnboardingStep("confirm");
                    }}
                  />
                  <button
                    type="button"
                    className={`composer-reading-pill${onboardingNameValid ? " is-active" : ""} onboarding-btn`}
                    disabled={!onboardingNameValid}
                    onClick={() => {
                      if (onboardingNameValid) setOnboardingStep("confirm");
                    }}
                  >
                    {onboardingUi.button}
                  </button>
                </>
              ) : (
                <>
                  <h2 id="onboarding-title" className="onboarding-title">
                    {onboardingUi.confirmTitle}
                  </h2>
                  <p className="onboarding-name-display">
                    {onboardingInput.trim()}
                  </p>
                  <p className="onboarding-subtitle">
                    {onboardingUi.confirmSubtitle}
                  </p>
                  <div className="onboarding-confirm-actions">
                    <button
                      type="button"
                      className="composer-reading-pill is-active onboarding-btn"
                      disabled={onboardingSaving}
                      onClick={() => void saveDisplayName()}
                    >
                      {onboardingUi.confirmYes}
                    </button>
                    <button
                      type="button"
                      className="onboarding-edit-btn"
                      disabled={onboardingSaving}
                      onClick={() => setOnboardingStep("enter")}
                    >
                      {onboardingUi.confirmEdit}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {authContinueOpen ? (
          <div
            className="auth-soft-backdrop"
            role="presentation"
            onClick={() => setAuthContinueOpen(false)}
          >
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
                Puedes explorar el ritual y escribir tu consulta con libertad.
                Cuando quieras el veredicto del oráculo, crea una cuenta
                gratuita o entra con Google.
              </p>
              <ul className="auth-soft-list">
                <li>Plan gratuito: 2 consultas de prueba (lifetime)</li>
              </ul>
              <div className="auth-soft-actions">
                <Link
                  href="/login"
                  className="auth-soft-primary"
                  onClick={() => setAuthContinueOpen(false)}
                >
                  Crear cuenta o entrar
                </Link>
                <button
                  type="button"
                  className="auth-soft-secondary"
                  onClick={() => setAuthContinueOpen(false)}
                >
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
          inert={!chatsOpen}
          id="chat-drawer"
        >
          <div className="chat-drawer-header">
            <button
              type="button"
              className="chat-icon-btn"
              onClick={() => setChatsOpen(false)}
              aria-label={ui.drawerClose}
            >
              ✕
            </button>
            <h2>{ui.chats}</h2>
            <button
              id="tour-new-session-btn"
              type="button"
              className="chat-drawer-new-session"
              data-testid="new-session-btn"
              onClick={() => startNewSession()}
              disabled={loading}
            >
              {ui.sessionNew}
            </button>
          </div>
          <div className="sidebar-stats" aria-label="Estadísticas de uso">
            <p className="sidebar-stats-label">{drawerText.activity}</p>
            <div className="sidebar-stats-grid">
              <div className="sidebar-stat-card">
                <span className="sidebar-stat-value">{streakDays}</span>
                <span className="sidebar-stat-key">{drawerText.streak}</span>
              </div>
              <div className="sidebar-stat-card">
                <span className="sidebar-stat-value">{dailyCount}</span>
                <span className="sidebar-stat-key">
                  {drawerText.consultationsToday}
                </span>
              </div>
              <div className="sidebar-stat-card">
                <span className="sidebar-stat-value">
                  {visibleSessionsListed.length}
                </span>
                <span className="sidebar-stat-key">
                  {drawerText.chatsWithMessages}
                </span>
              </div>
            </div>
            {loading || historyLoading ? (
              <p className="sidebar-stats-hint">{drawerText.loadingChats}</p>
            ) : historyLoadError ? (
              <p className="sidebar-stats-hint">{historyLoadError}</p>
            ) : (
              <p className="sidebar-stats-hint">{drawerText.onlyThreads}</p>
            )}
          </div>
          <div className="chat-drawer-list">
            {visibleSessionsListed.length === 0 ? (
              <p className="chat-drawer-empty">{drawerText.noSaved}</p>
            ) : null}
            {[...visibleSessionsListed]
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((session) => {
                const isDeleting = pendingDeletedSessionLocalIds.includes(
                  session.localId,
                );
                return (
                  <div
                    key={session.localId}
                    className={`chat-session-item ${session.localId === activeSession?.localId ? "active" : ""} ${
                      isDeleting ? "is-deleting" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="chat-session-main-btn"
                      disabled={isDeleting}
                      onClick={() => {
                        pinnedLocalSessionIdRef.current = null;
                        setActiveSessionLocalId(session.localId);
                        setError(null);
                        setChatsOpen(false);
                        if (session.thread.length < session.messageCount && session.sessionId) {
                          void loadSessionThread(
                            session.sessionId,
                            session.localId,
                          );
                        }
                      }}
                    >
                      <span className="chat-session-title">
                        {session.title}
                      </span>
                      <span className="chat-session-meta">
                        {isDeleting ? (
                          <>
                            <span>{drawerText.deletingConversation}</span>
                          </>
                        ) : null}
                        {loadingSessionLocalId === session.localId ? (
                          <>
                            {isDeleting ? (
                              <span aria-hidden="true">·</span>
                            ) : null}
                            <span className="chat-session-loading">
                              <span
                                className="chat-session-loading-spinner"
                                aria-hidden="true"
                              />
                              <span>{drawerText.loadingConversation}</span>
                            </span>
                          </>
                        ) : (
                          <>
                            {isDeleting ? (
                              <span aria-hidden="true">·</span>
                            ) : null}
                            <span>
                              {session.messageCount} {drawerText.messages}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="chat-session-time">
                              {session.firstConsultationAt
                                ? new Date(
                                    session.firstConsultationAt,
                                  ).toLocaleString(locale, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </>
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="chat-session-delete"
                      aria-label={drawerText.deleteConversation}
                      title={drawerText.deleteConversation}
                      disabled={isDeleting}
                      onClick={() => void removeSession(session)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          d="M6 7h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm3 3v9h2v-9H9Zm4 0v9h2v-9h-2ZM9 2h6a2 2 0 0 1 2 2v1h4v2H3V5h4V4a2 2 0 0 1 2-2Zm0 3h6V4H9v1Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
          </div>
        </aside>

        <div
          className={`chat-surface${showAuthExploreCap ? " chat-surface--explore-cap" : ""}`}
        >
          {authReady && supabaseConfigError ? (
            <div className="auth-config-banner" role="alert">
              <span>
                {sessionUi.missingClientConfig}{" "}
                <code className="auth-gate-code">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
                {sessionUi.missingClientConfigAnd}{" "}
                <code className="auth-gate-code">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>
                .
              </span>
            </div>
          ) : null}
          {!supabaseConfigError && (authReady ? !accessToken : !cachedAuthEmail) ? (
            <div
              className="auth-explore-strip"
              style={{
                minHeight: "2.2rem",
                paddingTop: "0.4rem",
                paddingBottom: "0.5rem",
              }}
            >
              {localeSelector}
              <Link href="/login" className="auth-explore-strip-cta">
                {ui.signIn}
              </Link>
            </div>
          ) : null}
          {!supabaseConfigError && (authReady ? !!(accessToken && authEmail) : !!cachedAuthEmail) ? (
            <div className="auth-explore-strip auth-explore-strip--session">
              <div className="auth-explore-strip-session__lead">
                {localeSelector}
              </div>
              <span className="auth-explore-strip-email" title={authEmail ?? cachedAuthEmail ?? ""}>
                {authEmail ?? cachedAuthEmail}
              </span>
              <button
                type="button"
                className="auth-explore-strip-signout"
                onClick={() => setLogoutConfirmOpen(true)}
              >
                {ui.signOut}
              </button>
            </div>
          ) : null}
          <header
            className="chat-app-bar oracle-intro"
            style={{ marginBottom: 0, paddingBottom: 0 }}
          >
            <div className="chat-app-bar-row chat-app-bar-row--top">
              <div className="chat-bar-lead">
                <button
                  id="tour-menu-btn"
                  type="button"
                  className="chat-icon-btn"
                  onClick={() => setChatsOpen(true)}
                  aria-expanded={chatsOpen}
                  aria-controls="chat-drawer"
                >
                  {ui.chats}
                </button>
              </div>
              <div className="chat-title-logo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element -- local brand asset, responsive CSS sizing */}
                <img
                  src="/brand/logo.png"
                  alt="The Original I Ching App: 真正的易经"
                  className="chat-header-logo"
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
              <div className="chat-bar-trail chat-bar-trail--top">
                <ThemeToggle />
              </div>
            </div>
            <div
              className="chat-app-brand"
              style={{
                paddingTop: 0,
                paddingBottom: 0,
                paddingInline: 0,
                paddingLeft: 0,
                paddingRight: 0,
                marginBottom: 0,
                gap: 0,
                background: "transparent",
                width: "100%",
                marginLeft: 0,
                marginRight: 0,
              }}
            >
              <div
                className="oracle-brand-line"
                style={{
                  width: "100vw",
                  maxWidth: "none",
                  marginBottom: 0,
                  marginLeft: "calc(50% - 50vw)",
                  marginRight: "calc(50% - 50vw)",
                  borderRadius: 0,
                  flexWrap: "nowrap",
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--accent) 22%, var(--secondary-bg)) 0%, color-mix(in srgb, var(--accent) 10%, var(--secondary-bg)) 100%)",
                  border:
                    "1px solid color-mix(in srgb, var(--accent) 68%, var(--input-border))",
                  color: "var(--fg)",
                  paddingTop: "0.04rem",
                  paddingBottom: "0.04rem",
                  paddingLeft: "calc((100vw - 100%) / 2 + 0.6rem)",
                  paddingRight: "calc((100vw - 100%) / 2 + 0.6rem)",
                  boxSizing: "border-box",
                }}
              >
                <span
                  className="oracle-brand-mark-lat"
                  lang={oracleMode === "iching" ? "en" : "es"}
                  style={{
                    letterSpacing: "0.04em",
                    textTransform: "none",
                    fontSize: "clamp(1.05rem, 3.6vw, 1.45rem)",
                    padding: "0.08rem 0",
                  }}
                >
                  {oracleMode === "iching" ? ui.iChing : ui.bones}
                </span>
                <span className="oracle-brand-rule" aria-hidden />
                <p
                  className="oracle-tagline"
                  style={{
                    color: "var(--fg)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {oracleMode === "iching"
                    ? `${ichingCastingMethod === "yarrow-stalks" ? manualWizardChrome.castMethodYarrowLabel.split(" (")[0] : manualWizardChrome.castMethodCoinsLabel} · Zhu Xi · ${
                        translatorId === "wilhelm"
                          ? "Wilhelm/Baynes"
                          : translatorId === "legge"
                            ? "James Legge"
                            : translatorId === "zhouyi"
                              ? "Zhou Yi"
                              : "Master Synthesis"
                      }`
                    : ui.bonesTagline}
                </p>
              </div>
            </div>
          </header>

          <div className="chat-room">
            <section
              className="chat-history"
              ref={historyRef}
              style={{ paddingTop: 0, marginTop: 0 }}
            >
              {activeThread.length === 0 ? (
                <p
                  className={`chat-empty-line ${historyLoading ? "chat-empty-line--loading" : ""}`}
                >
                  {historyLoading
                    ? drawerText.loadingConversation
                    : emptyThreadInvite}
                </p>
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
                    <div
                      className="interpretation-stack"
                      data-testid="interpretation-text"
                    >
                      <InterpretationBody
                        text={entry.interpretation}
                        reveal={revealConsultationId === entry.consultationId}
                        onRevealComplete={handleInterpretationRevealComplete}
                      />
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
                          transformedHexagramChinese={entry.transformedHexagramChinese}
                          mutationRule={entry.mutationRule}
                          translator={entry.translator}
                          oracleType={entry.oracleType ?? "iching"}
                          locale={locale}
                          createdAt={entry.createdAt}
                        />
                        <ReadingOracleImage
                          imageUrl={entry.imageUrl}
                          imageFallbackUrl={entry.imageFallbackUrl}
                          downloadBasename={`iching-${entry.consultationId.replace(/-/g, "").slice(0, 12)}`}
                          downloadLabel={downloadImageLabel}
                          openLabel={openImageLabel}
                          imageAlt={symbolicImageAlt}
                        />
                      </div>
                    ) : null}
                    {entry.oracleType === "oracle_bones" &&
                    entry.oracleBones ? (
                      <div className="reading-record-visual-row">
                        <ConsultationRecordCard
                          consultationId={entry.consultationId}
                          question={entry.question}
                          sessionPosition={entry.sessionPosition}
                          primaryHexagram={0}
                          primaryHexagramChinese=""
                          transformedHexagram={null}
                          mutationRule=""
                          oracleType="oracle_bones"
                          locale={locale}
                          createdAt={entry.createdAt}
                          oracleBones={{
                            verdictStr: getOracleBonesVerdictLabel(locale, entry.oracleBones.verdict),
                            medium: entry.oracleBones.medium,
                            verdict: entry.oracleBones.verdict,
                          }}
                        />
                        <section className="hexagram-card">
                          <div className="bones-background-pane">
                            <ReadingOracleImage
                              imageUrl={entry.imageUrl}
                              imageFallbackUrl={entry.imageFallbackUrl}
                              downloadBasename={`bones-${entry.consultationId.replace(/-/g, "").slice(0, 12)}`}
                              downloadLabel={downloadImageLabel}
                              openLabel={openImageLabel}
                              imageAlt={symbolicImageAlt}
                            />
                          </div>
                        </section>
                      </div>
                    ) : null}
                    <div className="session-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => void exportChatPdf()}
                      >
                        {exportPdfLabel}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingUserQuestion ? (
                <div className="thread-block chat-entry">
                  <div className="chat-bubble chat-user">
                    <p className="question-chip">{pendingUserQuestion}</p>
                  </div>
                </div>
              ) : null}

              {manualCastPreview &&
              loading &&
              pendingUserQuestion &&
              phase !== "coins" ? (
                <div
                  className="thread-block chat-entry manual-cast-preview-entry"
                  aria-busy="true"
                >
                  <div className="chat-bubble chat-assistant manual-cast-preview-bubble">
                    <p className="meta-line manual-cast-preview-status">
                      {manualWizardChrome.previewLoading}
                    </p>
                    <div className="reading-record-visual-row">
                      <ConsultationRecordCard
                        consultationId="00000000-0000-4000-8000-000000000001"
                        question={pendingUserQuestion}
                        sessionPosition={activeThread.length + 1}
                        primaryHexagram={manualCastPreview.primaryHexagram}
                        primaryHexagramChinese={
                          manualCastPreview.primaryHexagramChinese
                        }
                        transformedHexagram={
                          manualCastPreview.transformedHexagram
                        }
                        mutationRule={manualCastPreview.mutationRule}
                        oracleType="iching"
                        locale={locale}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              {phase === "bones" ? (
                <section
                  className="coins-stage coins-stage--bones"
                  data-testid="bone-ritual"
                >
                  <div className="crack-visual-wrap">
                    <BoneRitualAnimation
                      isProcessing={loading && boneRitualResult === null}
                      oracleResult={boneRitualResult}
                      verdictText={
                        boneRitualResult
                          ? getOracleBonesVerdictLabel(locale, boneRitualResult)
                          : null
                      }
                    />
                  </div>
                </section>
              ) : null}

              {phase === "coins" ? (
                <section
                  ref={ritualCoinsStageRef}
                  className="coins-stage ritual-coins-stage"
                  data-testid="coin-throw"
                >
                  <div className="ritual-stage-particles" aria-hidden="true">
                    {ritualParticles.map((particle) => (
                      <span
                        key={particle.id}
                        className="ritual-stage-particle"
                        style={{
                          left: particle.left,
                          top: particle.top,
                          width: particle.size,
                          height: particle.size,
                          animationDuration: particle.duration,
                          animationDelay: `-${particle.delay}`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="ritual-stage-content">
                    <p className="coins-title ritual-status-line">
                      <span>{ritualStatusLine}</span>
                      <span className="ritual-loading-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                    </p>
                    {!ritualFinale ? (
                      <div
                        ref={ritualLinesGridRef}
                        className={`ritual-lines-grid ${ritualLines === null ? "is-awaiting-cast" : ""}`}
                      >
                        {ritualRenderOrder.map((lineNum, i) => {
                          const isAwaitingCast = ritualLines === null;
                          const lineData =
                            ritualLines?.find((l) => l.position === lineNum) ??
                            null;
                          const tick = ritualRevealTick;
                          const sourceVisible =
                            !isAwaitingCast && tick >= lineNum * 2 - 1;
                          const transformedVisible =
                            !isAwaitingCast && tick >= lineNum * 2;
                          const sourceYang = lineData
                            ? lineData.value === 7 || lineData.value === 9
                            : lineNum % 2 === 0;
                          const transformedValue =
                            lineData?.value === 6
                              ? 7
                              : lineData?.value === 9
                                ? 8
                                : lineData?.value;
                          const transformedYang = transformedValue
                            ? transformedValue === 7
                            : lineNum % 2 !== 0;
                          const isChanging =
                            !isAwaitingCast && Boolean(lineData?.isChanging);
                          return (
                            <div
                              key={lineNum}
                              className="ritual-line-row"
                              aria-hidden="true"
                            >
                              <div
                                className={`ritual-line-slot ritual-line-slot--source ${sourceVisible ? "is-visible" : ""} ${isChanging ? "is-changing" : ""} ${isAwaitingCast ? "is-placeholder" : ""}`}
                              >
                                {sourceVisible ? (
                                  sourceYang ? (
                                    <span className="ritual-hex-line ritual-hex-line--yang" />
                                  ) : (
                                    <span className="ritual-hex-line ritual-hex-line--yin">
                                      <span />
                                      <span />
                                    </span>
                                  )
                                ) : null}
                              </div>
                              <div
                                className={`ritual-arrow-slot ${sourceVisible ? "is-visible" : ""}`}
                              >
                                <span className="ritual-arrow">→</span>
                              </div>
                              <div
                                className={`ritual-line-slot ritual-line-slot--transformed ${transformedVisible ? "is-visible" : ""} ${isChanging ? "is-changing" : ""} ${isAwaitingCast ? "is-placeholder" : ""}`}
                                style={{ transitionDelay: `${i * 60}ms` }}
                              >
                                {transformedVisible ? (
                                  transformedYang ? (
                                    <span className="ritual-hex-line ritual-hex-line--yang" />
                                  ) : (
                                    <span className="ritual-hex-line ritual-hex-line--yin">
                                      <span />
                                      <span />
                                    </span>
                                  )
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="ritual-final-focus" aria-hidden="true">
                        {ritualRenderOrder.map((lineNum, i) => {
                          const lineData =
                            ritualLines?.find((l) => l.position === lineNum) ??
                            null;
                          const transformedValue =
                            lineData?.value === 6
                              ? 7
                              : lineData?.value === 9
                                ? 8
                                : lineData?.value;
                          const transformedYang = transformedValue
                            ? transformedValue === 7
                            : true;
                          const isChanging = Boolean(lineData?.isChanging);
                          return (
                            <div
                              key={`final-${lineNum}`}
                              className={`ritual-final-line ${isChanging ? "is-changing" : ""}`}
                              style={{ animationDelay: `${i * 70}ms` }}
                            >
                              {transformedYang ? (
                                <span className="ritual-hex-line ritual-hex-line--yang" />
                              ) : (
                                <span className="ritual-hex-line ritual-hex-line--yin">
                                  <span />
                                  <span />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {ritualDebugEnabled ? (
                      <div className="ritual-debug-box">
                        <p>
                          cast base:{" "}
                          <code>
                            {ritualDebugCastVector
                              ? ritualDebugCastVector.join(",")
                              : "pending"}
                          </code>
                        </p>
                        <p>
                          cast transformed:{" "}
                          <code>
                            {ritualDebugCastTransformed
                              ? ritualDebugCastTransformed.join(",")
                              : "pending"}
                          </code>
                        </p>
                        <p>
                          final base:{" "}
                          <code>
                            {ritualDebugFinalVector
                              ? ritualDebugFinalVector.join(",")
                              : "pending"}
                          </code>
                        </p>
                        <p>
                          final transformed:{" "}
                          <code>
                            {ritualDebugFinalTransformed
                              ? ritualDebugFinalTransformed.join(",")
                              : "pending"}
                          </code>
                        </p>
                        <p>
                          match ritual/final transformed:{" "}
                          <strong>
                            {ritualDebugMatch === null
                              ? "pending"
                              : ritualDebugMatch
                                ? "YES"
                                : "NO"}
                          </strong>
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}
              {ritualDebugEnabled &&
              phase !== "coins" &&
              lastRitualDebugSnapshot ? (
                <div className="ritual-debug-box ritual-debug-box--persisted">
                  <p>
                    <strong>Ritual debug (persisted)</strong>
                  </p>
                  <p>
                    mutationRule:{" "}
                    <code>{lastRitualDebugSnapshot.mutationRule ?? "n/a"}</code>{" "}
                    · transformedHex:{" "}
                    <code>
                      {lastRitualDebugSnapshot.transformedHexagram ?? "n/a"}
                    </code>
                  </p>
                  <p>
                    cast base:{" "}
                    <code>{lastRitualDebugSnapshot.castBase.join(",")}</code>
                  </p>
                  <p>
                    cast transformed:{" "}
                    <code>
                      {lastRitualDebugSnapshot.castTransformed.join(",")}
                    </code>
                  </p>
                  <p>
                    final base:{" "}
                    <code>{lastRitualDebugSnapshot.finalBase.join(",")}</code>
                  </p>
                  <p>
                    final transformed:{" "}
                    <code>
                      {lastRitualDebugSnapshot.finalTransformed.join(",")}
                    </code>
                  </p>
                  <p>
                    match ritual/final transformed:{" "}
                    <strong>
                      {lastRitualDebugSnapshot.match ? "YES" : "NO"}
                    </strong>
                  </p>
                </div>
              ) : null}

              {creditsExhaustedCopy ? (
                <div className="credits-notice-card" role="status">
                  <p className="credits-notice-title">
                    {creditsExhaustedCopy.title}
                  </p>
                  <p className="credits-notice-body">
                    {creditsExhaustedCopy.body}
                  </p>
                  <p className="credits-notice-reset">
                    {creditsExhaustedCopy.resetLine}
                  </p>
                  <div className="credits-notice-actions">
                    <button
                      type="button"
                      className="credits-notice-primary"
                      onClick={() => {
                        if (
                          creditsExhaustedCopy.primaryCta.action ===
                          "sync-billing"
                        ) {
                          void openTokenCenter();
                          setCreditsNotice(null);
                          return;
                        }
                        void (async () => {
                          const ok = await openPlansCheckoutNewTab();
                          if (ok) {
                            setCreditsNotice(null);
                            return;
                          }
                          setError(pricingUi.errorCheckout);
                        })();
                      }}
                    >
                      {creditsExhaustedCopy.primaryCta.label}
                    </button>
                    {creditsExhaustedCopy.secondaryCta ? (
                      <button
                        type="button"
                        className="credits-notice-dismiss"
                        onClick={() => {
                          if (
                            creditsExhaustedCopy.secondaryCta?.action ===
                              "mailto" &&
                            creditsExhaustedCopy.secondaryCta.href
                          ) {
                            window.open(
                              creditsExhaustedCopy.secondaryCta.href,
                              "_blank",
                              "noopener,noreferrer",
                            );
                            return;
                          }
                          setCreditsNotice(null);
                        }}
                      >
                        {creditsExhaustedCopy.secondaryCta.label}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="credits-notice-dismiss"
                      onClick={() => setCreditsNotice(null)}
                    >
                      {ui.drawerClose}
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
                aria-label={chrome.closeConsultBackdropAria}
                onClick={() => setConsultPanelOpen(false)}
              />
            ) : null}
          </div>

          <footer
            className={`chat-composer-wa${consultPanelOpen ? " is-expanded" : ""}`}
          >
            <div className="composer-dock">
              <div
                id="consult-panel"
                className={`composer-sheet ${consultPanelOpen ? "is-open" : ""}`}
                inert={!consultPanelOpen}
              >
                <div className="composer-sheet-inner">
                  <section className="oracle-card composer-card">
                    <div className="composer-sheet-header">
                      <p className="card-title">{t.consult}</p>
                      <button
                        type="button"
                        className="composer-panel-close tour-replay-btn"
                        onClick={() => { setTourKey((k) => k + 1); setTourRun(true); }}
                        aria-label={tour.replayLabel}
                        style={{
                          border: "1px solid color-mix(in srgb, #22c55e 38%, var(--icon-btn-border))",
                          background: "linear-gradient(165deg, color-mix(in srgb, #22c55e 22%, var(--icon-btn-bg)) 0%, color-mix(in srgb, #22c55e 10%, var(--icon-btn-bg)) 100%)",
                          color: "color-mix(in srgb, #22c55e 85%, var(--icon-btn-fg))",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3em",
                        }}
                      >
                        {tour.tutorialLabel} ⓘ
                      </button>
                      <button
                        type="button"
                        className="composer-panel-close"
                        onClick={() => setConsultPanelOpen(false)}
                        aria-label={chrome.closeConsultPanelAria}
                      >
                        {ui.drawerClose}
                      </button>
                    </div>
                    <div
                      id="tour-oracle-mode"
                      className="composer-oracle-switch"
                      role="group"
                      aria-label={chrome.consultOracleTypeGroupAria}
                    >
                      <div className="composer-oracle-switch-row">
                        <div
                          className="composer-switch-track composer-switch-track--visual"
                          role="tablist"
                          aria-label={chrome.oracleModeTablistAria}
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
                            <span className="composer-switch-label">
                              {ui.iChing}
                            </span>
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
                            <span className="composer-switch-label">
                              {ui.bones}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                    {oracleMode === "iching" ? (
                      <>
                        <hr className="composer-panel-divider" aria-hidden />
                        <div className="cast-selector-block">
                          <span className="cast-selector-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            {chrome.translatorLabel}
                            <span
                              className="master-token-tooltip"
                              tabIndex={0}
                              role="img"
                              aria-label={chrome.translatorMasterCostAria}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "2px",
                                padding: "2px 5px",
                                borderRadius: "10px",
                                background: "rgba(217,119,6,0.13)",
                                border: "1px solid rgba(217,119,6,0.38)",
                                color: "#D97706",
                                fontSize: 9,
                                fontWeight: "bold",
                                cursor: "help",
                                flexShrink: 0,
                                lineHeight: 1.3,
                                marginRight: "calc(12.5% - 7px)",
                              }}
                            >
                              ◈ 2
                              <span className="master-token-tooltip-text">
                                <span className="master-token-tooltip-line">
                                  {chrome.translatorMasterCostLabel}
                                </span>
                                <span className="master-token-tooltip-line">
                                  {chrome.translatorMasterCostValue}
                                </span>
                              </span>
                            </span>
                          </span>
                          <div
                            id="tour-translator"
                            className="oracle-toggle-wrap oracle-toggle-wrap-4"
                            role="group"
                            aria-label="Fuente de Interpretación"
                          >
                            <div className="oracle-toggle-track">
                              <div
                                className="oracle-toggle-glow"
                                style={{
                                  left: `${12.5 + ["wilhelm", "legge", "zhouyi", "master_combined"].indexOf(translatorId) * 25}%`,
                                }}
                              />
                              <div className="oracle-toggle-track-line" />
                              <div
                                className="oracle-toggle-thumb"
                                style={{
                                  left: `calc(${["wilhelm", "legge", "zhouyi", "master_combined"].indexOf(translatorId) * 25}% + 2px)`,
                                }}
                              >
                                <div className="oracle-thumb-sweep" />
                              </div>
                              <div className="oracle-toggle-options-row">
                                <button
                                  type="button"
                                  className={`oracle-toggle-option ${translatorId === "wilhelm" ? "is-active" : ""}`}
                                  onClick={() => handleTranslatorChange("wilhelm")}
                                  disabled={loading}
                                >
                                  <span>Wilhelm</span>
                                </button>
                                <button
                                  type="button"
                                  className={`oracle-toggle-option ${translatorId === "legge" ? "is-active" : ""} ${!isAdmin && tierAccessIndex < 1 ? "is-locked" : ""}`}
                                  onClick={() => handleTranslatorChange("legge")}
                                  disabled={loading}
                                >
                                  <span>Legge</span>{!isAdmin && tierAccessIndex < 1 && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.6, display: "inline-block", verticalAlign: "middle", marginTop: -2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                                </button>
                                <button
                                  type="button"
                                  className={`oracle-toggle-option ${translatorId === "zhouyi" ? "is-active" : ""} ${!isAdmin && tierAccessIndex < 2 ? "is-locked" : ""}`}
                                  onClick={() => handleTranslatorChange("zhouyi")}
                                  disabled={loading}
                                >
                                  <span>Zhou Yi</span>{!isAdmin && tierAccessIndex < 2 && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.6, display: "inline-block", verticalAlign: "middle", marginTop: -2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                                </button>
                                <button
                                  type="button"
                                  className={`oracle-toggle-option ${translatorId === "master_combined" ? "is-active" : ""} ${!isAdmin && tierAccessIndex < 3 ? "is-locked" : ""}`}
                                  onClick={() => handleTranslatorChange("master_combined")}
                                  disabled={loading}
                                >
                                  <span>{chrome.translatorMasterCombined}</span>
                                  {!isAdmin && tierAccessIndex < 3 && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, marginLeft: 4, opacity: 0.6, display: "inline-block", verticalAlign: "middle", marginTop: -2 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr className="composer-panel-divider" aria-hidden />
                        <div className="cast-selector-block">
                          <span className="cast-selector-label">
                            {manualWizardChrome.castMethodGroupAria}
                          </span>
                          <label className="oracle-toggle-wrap">
                            <input
                              type="checkbox"
                              className="oracle-toggle-input"
                              checked={ichingCastingMethod === "yarrow-stalks"}
                              onChange={() =>
                                setIchingCastingMethod(
                                  ichingCastingMethod === "yarrow-stalks"
                                    ? "three-coins"
                                    : "yarrow-stalks",
                                )
                              }
                              disabled={loading}
                              aria-label={`${manualWizardChrome.castMethodCoinsLabel} / ${manualWizardChrome.castMethodYarrowLabel}`}
                            />
                            <div className="oracle-toggle-track">
                              <div className="oracle-toggle-glow" />
                              <div className="oracle-toggle-track-line" />
                              <div className="oracle-toggle-thumb">
                                <div className="oracle-thumb-sweep" />
                              </div>
                              <div
                                className="oracle-toggle-option oracle-toggle-option--left"
                                aria-hidden="true"
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                  aria-hidden="true"
                                >
                                  <circle
                                    cx="7"
                                    cy="7"
                                    r="5.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                  <rect
                                    x="5.5"
                                    y="5.5"
                                    width="3"
                                    height="3"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                  />
                                </svg>
                                <span>
                                  {
                                    manualWizardChrome.castMethodCoinsLabel.split(
                                      " (",
                                    )[0]
                                  }
                                </span>
                              </div>
                              <div
                                className="oracle-toggle-option oracle-toggle-option--right"
                                aria-hidden="true"
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                  aria-hidden="true"
                                >
                                  <line
                                    x1="2.5"
                                    y1="2"
                                    x2="2.5"
                                    y2="12"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                  <line
                                    x1="5.5"
                                    y1="1"
                                    x2="5.5"
                                    y2="12"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                  <line
                                    x1="8.5"
                                    y1="2"
                                    x2="8.5"
                                    y2="12"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                  <line
                                    x1="11.5"
                                    y1="1"
                                    x2="11.5"
                                    y2="12"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span>
                                  {
                                    manualWizardChrome.castMethodYarrowLabel.split(
                                      " (",
                                    )[0]
                                  }
                                </span>
                              </div>
                            </div>
                          </label>
                        </div>
                        <hr className="composer-panel-divider" aria-hidden />
                        <div id="tour-cast-mode" className="cast-selector-block">
                          <span className="cast-selector-label">
                            {manualWizardChrome.castModeGroupAria}
                          </span>
                          <label className="oracle-toggle-wrap">
                            <input
                              type="checkbox"
                              className="oracle-toggle-input"
                              checked={ichingCastMode === "manual"}
                              onChange={() =>
                                setIchingCastMode(
                                  ichingCastMode === "manual"
                                    ? "auto"
                                    : "manual",
                                )
                              }
                              disabled={loading}
                              aria-label={`${manualWizardChrome.castAutoLabel} / ${manualWizardChrome.castManualLabel}`}
                            />
                            <div className="oracle-toggle-track">
                              <div className="oracle-toggle-glow" />
                              <div className="oracle-toggle-track-line" />
                              <div className="oracle-toggle-thumb">
                                <div className="oracle-thumb-sweep" />
                              </div>
                              <div
                                className="oracle-toggle-option oracle-toggle-option--left"
                                aria-hidden="true"
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M8 1.5L3.5 7.5H7L5.5 12.5L11 6H7.5L8 1.5Z"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span>{manualWizardChrome.castAutoLabel}</span>
                              </div>
                              <div
                                className="oracle-toggle-option oracle-toggle-option--right"
                                aria-hidden="true"
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 14 14"
                                  fill="none"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M2 10.5V12H3.5L9.5 6L8 4.5L2 10.5Z"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M9.5 3L11 4.5L10 5.5L8.5 4L9.5 3Z"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span>
                                  {manualWizardChrome.castManualLabel
                                    .split(" (")[0]
                                    .split("（")[0]
                                    .trim()}
                                </span>
                              </div>
                            </div>
                          </label>
                        </div>
                      </>
                    ) : null}
                    {activeThread.length > 0 && result ? (
                      <>
                        <hr className="composer-panel-divider" aria-hidden />
                        <div
                          className="session-progress session-progress--thread-depth"
                          role="region"
                          aria-label={chrome.threadDepthRegionAria}
                        >
                          <span>{chrome.threadDepthHeading}</span>
                          <div
                            className="session-progress-bar session-progress-bar--prominent"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={threadDepthCap}
                            aria-valuenow={result.sessionPosition}
                            aria-label={interpolate(
                              chrome.threadDepthReadingProgressAria,
                              {
                                pos: result.sessionPosition,
                                cap: threadDepthCap,
                              },
                            )}
                          >
                            <div
                              className="session-progress-fill"
                              style={{
                                width: `${Math.min(100, (result.sessionPosition / threadDepthCap) * 100)}%`,
                              }}
                            />
                          </div>
                          <small>
                            {formatThreadDepthStatusLine(
                              chrome,
                              threadDepthCanDeepen,
                              threadDepthCap,
                              result.sessionPosition,
                            )}
                          </small>
                        </div>
                      </>
                    ) : null}
                    <hr className="composer-panel-divider" aria-hidden />
                    <div
                      className="session-progress"
                      role="group"
                      aria-label={tokenPanel.ariaTokenGroup}
                    >
                      <span>{tokenPanel.tokensHeading}</span>
                      <p className="meta-line tier-hint-line tier-hint-line--emphasis">
                        {tokenPanel.lastPack} <strong>{tierDisplayNode}</strong>
                        {tokenBalance !== null
                          ? ` · ${tokenPanel.remaining}: ${tokenBalance}`
                          : ""}
                      </p>
                      <div className="composer-panel-actions">
                        <button
                          type="button"
                          className="composer-reading-pill is-active"
                          onClick={() => void openTokenCenter()}
                          disabled={tokenCenterBusy || !accessToken}
                        >
                          {tokenCenterBusy
                            ? tokenPanel.loading
                            : tokenPanel.tokenCenter}
                        </button>
                      </div>
                      {tokenCenterMessage ? (
                        <p
                          className="meta-line tier-hint-line tier-hint-line--emphasis"
                          style={{ marginTop: 8 }}
                        >
                          {tokenCenterMessage}
                        </p>
                      ) : null}
                    </div>
                    <hr className="composer-panel-divider" aria-hidden />
                    <div
                      className="session-progress"
                      role="group"
                      aria-label={chrome.securityGroupAria}
                    >
                      <span>{chrome.securityHeading}</span>
                      <p className="meta-line tier-hint-line tier-hint-line--emphasis">
                        {chrome.statusLabel}{" "}
                        <strong>
                          {twoFactorEnabled ? chrome.enabled : chrome.disabled}
                        </strong>
                        {twoFactorMethod
                          ? `${chrome.methodPrefix}${twoFactorMethod.toUpperCase()}`
                          : ""}
                      </p>
                      <p className="meta-line tier-hint-line">
                        {chrome.securityConfigureHint}
                      </p>
                      <div className="composer-panel-actions">
                        <button
                          type="button"
                          className="composer-reading-pill is-active"
                          onClick={() => {
                            setTwoFactorModalMode("manage");
                            setTwoFactorSetupMethod("menu");
                            setTwoFactorChallengeMethod("totp");
                            setTwoFactorSetupOpen(false);
                            setTwoFactorQrDataUrl(null);
                            setTwoFactorRecoveryCodes([]);
                            setTwoFactorCode("");
                            setTwoFactorEmailCode("");
                            setTwoFactorRecoveryCode("");
                            setTwoFactorEmailSent(false);
                            setTwoFactorRecoveryAck(false);
                            setTwoFactorInfo(null);
                            setTwoFactorError(null);
                            setTwoFactorModalOpen(true);
                          }}
                          disabled={twoFactorBusy || !accessToken}
                        >
                          {chrome.configure2fa}
                        </button>
                        {twoFactorEnabled ? (
                          <button
                            type="button"
                            className="composer-reading-pill"
                            onClick={() => void disableTwoFactor()}
                            disabled={twoFactorBusy || !accessToken}
                          >
                            {chrome.disable2fa}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <hr className="composer-panel-divider" aria-hidden />
                    <div
                      className="session-progress"
                      role="group"
                      aria-label={chrome.libraryGroupAria}
                    >
                      <span>{chrome.libraryHeading}</span>
                      <p className="meta-line tier-hint-line">
                        {chrome.libraryDescription}
                      </p>
                      <div className="composer-panel-actions">
                        <button
                          id="tour-library-btn"
                          type="button"
                          className="composer-reading-pill is-active"
                          onClick={() => router.push("/library")}
                          disabled={!accessToken || (!isAdmin && tierAccessKey === "free")}
                        >
                          {chrome.openLibrary}
                        </button>
                      </div>
                    </div>
                    <hr className="composer-panel-divider" aria-hidden />
                    <div
                      className="session-progress"
                      role="group"
                      aria-label={chrome.deleteAccountGroupAria}
                    >
                      <span>{chrome.deleteAccountHeading}</span>
                      <p className="meta-line tier-hint-line">
                        {chrome.deleteAccountHint}
                      </p>
                      <div className="composer-panel-actions">
                        <button
                          type="button"
                          className="composer-reading-pill is-active composer-reading-pill--danger"
                          onClick={() => {
                            setDeleteAccountConfirm("");
                            setDeleteAccountError(null);
                            setDeleteAccountOpen(true);
                          }}
                          disabled={!accessToken}
                        >
                          {chrome.deleteAccountButton}
                        </button>
                      </div>
                    </div>
                    <div
                      className="composer-doc-links"
                      aria-label={chrome.docLinksAria}
                    >
                      <div id="tour-doc-links" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        <Link href="/guia#primeros-pasos">
                          {docNav.userGuide}
                        </Link>
                        <Link href="/notes">{docNav.methodNotesLong}</Link>
                        <Link href="/privacy">{docNav.privacyPolicy}</Link>
                        <Link href="/terms">{docNav.termsOfService}</Link>
                        <Link href="/faqs">{docNav.faqs}</Link>
                        <Link href="/about">{docNav.aboutShort}</Link>
                      </div>
                      <hr className="composer-doc-links-divider" aria-hidden />
                      <Link
                        href="/feedback"
                        className="composer-reading-pill is-active composer-reading-pill--feedback"
                        style={{ textAlign: "center", textDecoration: "none" }}
                      >
                        {docNav.feedback}
                      </Link>
                    </div>
                  </section>
                </div>
              </div>

              {deleteAccountOpen ? (
                <div
                  role="dialog"
                  aria-modal="true"
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1300,
                    background: "rgba(5, 8, 14, 0.85)",
                    display: "grid",
                    placeItems: "center",
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      width: "min(480px, 96vw)",
                      borderRadius: 16,
                      border: "1px solid rgba(192,57,43,0.45)",
                      background:
                        "linear-gradient(180deg, rgba(16,31,45,0.98), rgba(9,20,31,0.98))",
                      boxShadow: "0 18px 48px rgba(0,0,0,0.55)",
                      padding: 20,
                    }}
                  >
                    <p
                      className="card-title"
                      style={{ color: "var(--color-error, #c0392b)", marginBottom: 10 }}
                    >
                      {chrome.deleteAccountModalTitle}
                    </p>
                    <p className="meta-line tier-hint-line" style={{ marginBottom: 14 }}>
                      {chrome.deleteAccountModalDesc}
                    </p>
                    <input
                      type="text"
                      value={deleteAccountConfirm}
                      onChange={(e) => setDeleteAccountConfirm(e.target.value)}
                      placeholder={chrome.deleteAccountConfirmPlaceholder}
                      className="composer-input"
                      style={{ width: "100%", marginBottom: 12 }}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      disabled={deleteAccountBusy}
                    />
                    {deleteAccountError ? (
                      <p
                        className="meta-line tier-hint-line"
                        style={{ color: "var(--color-error, #c0392b)", marginBottom: 8 }}
                      >
                        {deleteAccountError}
                      </p>
                    ) : null}
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="composer-reading-pill"
                        onClick={() => setDeleteAccountOpen(false)}
                        disabled={deleteAccountBusy}
                      >
                        {ui.drawerClose}
                      </button>
                      <button
                        type="button"
                        className="composer-reading-pill"
                        style={{ color: "var(--color-error, #c0392b)" }}
                        onClick={() => void deleteAccount()}
                        disabled={
                          deleteAccountBusy ||
                          deleteAccountConfirm.trim().toUpperCase() !== chrome.deleteAccountConfirmWord
                        }
                      >
                        {deleteAccountBusy ? "…" : chrome.deleteAccountConfirmBtn}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {twoFactorModalOpen ? (
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
                      width: "min(560px, 96vw)",
                      borderRadius: 16,
                      border: "1px solid rgba(84,160,186,0.35)",
                      background:
                        "linear-gradient(180deg, rgba(16,31,45,0.98), rgba(9,20,31,0.98))",
                      boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
                      padding: 14,
                      maxHeight: "82vh",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <strong style={{ color: "#d8edf5" }}>
                        {twoFactorModalMode === "challenge"
                          ? tf.challengeTitle
                          : tf.manageTitle}
                      </strong>
                      {twoFactorModalMode === "manage" ? (
                        <button
                          type="button"
                          className="modal-close-x"
                          aria-label={tf.closeDialogAria}
                          title={ui.drawerClose}
                          onClick={() => setTwoFactorModalOpen(false)}
                          disabled={
                            twoFactorBusy ||
                            (twoFactorRecoveryCodes.length > 0 &&
                              !twoFactorRecoveryAck)
                          }
                        >
                          ×
                        </button>
                      ) : null}
                    </div>
                    <p
                      className="meta-line tier-hint-line"
                      style={{ marginTop: 8 }}
                    >
                      {twoFactorModalMode === "challenge"
                        ? preferredTwoFactorMethod === "email"
                          ? tf.challengeIntroEmail
                          : tf.challengeIntroTotp
                        : twoFactorSetupMethod === "menu"
                          ? tf.setupMenuHint
                          : twoFactorSetupMethod === "totp"
                            ? tf.setupTotpOnlyHint
                            : tf.setupEmailOnlyHint}
                    </p>
                    {twoFactorError ? (
                      <p
                        className="meta-line tier-hint-line tier-hint-line--error"
                        style={{ marginTop: 6 }}
                      >
                        {twoFactorError}
                      </p>
                    ) : null}
                    {twoFactorInfo ? (
                      <p
                        className="meta-line tier-hint-line tier-hint-line--success"
                        style={{ marginTop: 6 }}
                      >
                        {twoFactorInfo}
                      </p>
                    ) : null}

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginTop: 10,
                      }}
                    >
                      {twoFactorModalMode === "challenge" ? (
                        <span
                          className="composer-reading-pill is-active"
                          style={{
                            flex: "0 1 auto",
                            minWidth: 0,
                            paddingInline: "0.9rem",
                          }}
                        >
                          {preferredTwoFactorMethod === "email"
                            ? tf.badgeEmailCode
                            : tf.badgeTotp}
                        </span>
                      ) : twoFactorSetupMethod === "menu" ? (
                        <>
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            onClick={() => {
                              setTwoFactorSetupMethod("totp");
                              setTwoFactorInfo(null);
                              setTwoFactorError(null);
                              setTwoFactorEmailCode("");
                              setTwoFactorRecoveryCode("");
                              setTwoFactorEmailSent(false);
                            }}
                            disabled={twoFactorBusy || !accessToken}
                          >
                            {tf.authenticatorTotp}
                          </button>
                          <button
                            type="button"
                            className="composer-reading-pill"
                            onClick={() => {
                              setTwoFactorSetupMethod("email");
                              setTwoFactorInfo(null);
                              setTwoFactorError(null);
                              setTwoFactorCode("");
                              setTwoFactorSetupOpen(false);
                              setTwoFactorQrDataUrl(null);
                            }}
                            disabled={twoFactorBusy || !accessToken}
                          >
                            {tf.emailCode}
                          </button>
                          {twoFactorEnabled ? (
                            <button
                              type="button"
                              className="composer-reading-pill"
                              onClick={() => void disableTwoFactor()}
                              disabled={twoFactorBusy}
                            >
                              {chrome.disable2fa}
                            </button>
                          ) : null}
                        </>
                      ) : twoFactorRecoveryCodes.length === 0 ? (
                        <button
                          type="button"
                          className="composer-reading-pill"
                          onClick={() => {
                            setTwoFactorSetupMethod("menu");
                            setTwoFactorSetupOpen(false);
                            setTwoFactorQrDataUrl(null);
                            setTwoFactorCode("");
                            setTwoFactorEmailCode("");
                            setTwoFactorRecoveryCode("");
                            setTwoFactorEmailSent(false);
                            setTwoFactorInfo(null);
                            setTwoFactorError(null);
                          }}
                          disabled={twoFactorBusy}
                          style={{
                            flex: "0 1 auto",
                            minWidth: 0,
                            paddingInline: "0.85rem",
                          }}
                        >
                          {tf.chooseAnotherMethod}
                        </button>
                      ) : null}
                    </div>

                    {twoFactorModalMode === "challenge" &&
                    twoFactorChallengeMethod === "totp" &&
                    twoFactorRecoveryAssistMode === "hidden" ? (
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          type="text"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          placeholder={tf.totpPlaceholderShort}
                          className="composer-input"
                          style={{ maxWidth: 220 }}
                        />
                      </div>
                    ) : null}
                    {twoFactorModalMode === "manage" &&
                    twoFactorSetupMethod === "totp" &&
                    !twoFactorSetupOpen &&
                    twoFactorRecoveryCodes.length === 0 ? (
                      <div style={{ marginTop: 10 }}>
                        <p className="meta-line tier-hint-line">
                          {tf.totpSetupSteps}
                        </p>
                        <button
                          type="button"
                          className="composer-reading-pill is-active"
                          onClick={() => void startTwoFactorEnrollment()}
                          disabled={twoFactorBusy || !accessToken}
                        >
                          {twoFactorBusy ? tf.preparing : tf.generateQr}
                        </button>
                      </div>
                    ) : null}

                    {twoFactorModalMode === "manage" &&
                    twoFactorSetupMethod === "totp" &&
                    twoFactorSetupOpen &&
                    twoFactorQrDataUrl &&
                    twoFactorRecoveryCodes.length === 0 ? (
                      <div style={{ marginTop: 12 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={twoFactorQrDataUrl}
                          alt={chrome.authenticatorQrAlt}
                          style={{
                            width: 160,
                            height: 160,
                            borderRadius: 8,
                            background: "#fff",
                          }}
                        />
                        <div
                          style={{
                            marginTop: 8,
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <input
                            type="text"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            placeholder={tf.totpPlaceholderLong}
                            className="composer-input"
                            style={{ maxWidth: 220 }}
                          />
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            onClick={() => void confirmTwoFactorEnrollment()}
                            disabled={
                              twoFactorBusy || twoFactorCode.trim().length < 6
                            }
                          >
                            {tf.verify}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {twoFactorModalMode === "challenge" &&
                    twoFactorChallengeMethod === "email" &&
                    !twoFactorEmailSent ? (
                      <p
                        className="meta-line tier-hint-line"
                        style={{ marginTop: 8 }}
                      >
                        {tf.challengeEmailBeforeSend}
                      </p>
                    ) : null}

                    {twoFactorModalMode === "manage" &&
                    twoFactorSetupMethod === "email" &&
                    !twoFactorEmailSent &&
                    twoFactorRecoveryCodes.length === 0 ? (
                      <div style={{ marginTop: 10 }}>
                        <p className="meta-line tier-hint-line">
                          {tf.sendEmailHintManage}
                        </p>
                        <button
                          type="button"
                          className="composer-reading-pill is-active"
                          onClick={() => void sendEmailTwoFactorCode()}
                          disabled={twoFactorBusy || !accessToken}
                        >
                          {twoFactorBusy ? tf.sending : tf.sendEmailCode}
                        </button>
                      </div>
                    ) : null}

                    {(twoFactorModalMode === "manage" &&
                      twoFactorSetupMethod === "email" &&
                      twoFactorEmailSent) ||
                    (twoFactorModalMode === "challenge" &&
                      twoFactorChallengeMethod === "email" &&
                      twoFactorRecoveryAssistMode === "hidden") ? (
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          type="text"
                          value={twoFactorEmailCode}
                          onChange={(e) =>
                            setTwoFactorEmailCode(e.target.value)
                          }
                          placeholder={tf.emailCodePlaceholder}
                          className="composer-input"
                          style={{ maxWidth: 220 }}
                        />
                        {twoFactorModalMode === "manage" ? (
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            onClick={() => void verifyEmailTwoFactorCode()}
                            disabled={
                              twoFactorBusy ||
                              twoFactorEmailCode.trim().length < 6
                            }
                          >
                            {tf.verifyEmail}
                          </button>
                        ) : null}
                      </div>
                    ) : null}

                    {twoFactorModalMode === "challenge" &&
                    twoFactorRecoveryAssistMode === "options" ? (
                      <div
                        style={{
                          marginTop: 10,
                          border: "1px solid rgba(84,160,186,0.35)",
                          borderRadius: 12,
                          padding: "10px 12px",
                        }}
                      >
                        <p
                          className="meta-line tier-hint-line"
                          style={{ margin: 0 }}
                        >
                          {tf.recoveryOptionsIntro}
                        </p>
                        <div
                          style={{
                            marginTop: 8,
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            style={{
                              flex: "0 1 auto",
                              minWidth: 0,
                              paddingInline: "0.9rem",
                            }}
                            onClick={() => {
                              setTwoFactorRecoveryAssistMode("enter_code");
                              setTwoFactorError(null);
                            }}
                            disabled={twoFactorBusy}
                          >
                            {tf.iHaveRecoveryCodes}
                          </button>
                          <button
                            type="button"
                            className="composer-reading-pill"
                            style={{
                              flex: "0 1 auto",
                              minWidth: 0,
                              paddingInline: "0.9rem",
                            }}
                            onClick={() =>
                              setTwoFactorRecoveryAssistMode("contact_support")
                            }
                            disabled={twoFactorBusy}
                          >
                            {tf.iDontHaveRecoveryCodes}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {twoFactorModalMode === "challenge" &&
                    twoFactorRecoveryAssistMode === "enter_code" ? (
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          type="text"
                          value={twoFactorRecoveryCode}
                          onChange={(e) =>
                            setTwoFactorRecoveryCode(e.target.value)
                          }
                          placeholder={tf.recoveryCodePlaceholder}
                          className="composer-input"
                          style={{ maxWidth: 320 }}
                        />
                      </div>
                    ) : null}

                    {twoFactorModalMode === "challenge" &&
                    twoFactorRecoveryAssistMode === "contact_support" ? (
                      <div
                        style={{
                          marginTop: 10,
                          border: "1px solid rgba(84,160,186,0.35)",
                          borderRadius: 12,
                          padding: "10px 12px",
                        }}
                      >
                        <p
                          className="meta-line tier-hint-line"
                          style={{ margin: 0 }}
                        >
                          {tf.supportRecoveryBody}
                        </p>
                        <a
                          className="secondary-btn"
                          style={{ marginTop: 8 }}
                          href={`mailto:${twoFactorSupportEmail}?subject=${encodeURIComponent(
                            tf.supportRecoverySubject,
                          )}&body=${encodeURIComponent(
                            formatTwoFactorSupportMailBody(tf, authEmail ?? ""),
                          )}`}
                        >
                          {tf.contactSupportEmail}
                        </a>
                      </div>
                    ) : null}

                    {twoFactorRecoveryCodes.length > 0 &&
                    twoFactorModalMode === "manage" ? (
                      <div style={{ marginTop: 10 }}>
                        <p className="meta-line tier-hint-line">
                          {tf.recoveryCodesShownOnce}{" "}
                          <code>{twoFactorRecoveryCodes.join(" · ")}</code>
                        </p>
                        <label
                          className="meta-line tier-hint-line"
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={twoFactorRecoveryAck}
                            onChange={(e) =>
                              setTwoFactorRecoveryAck(e.target.checked)
                            }
                          />
                          <span>{tf.recoveryAckCheckbox}</span>
                        </label>
                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            disabled={twoFactorBusy || !twoFactorRecoveryAck}
                            style={{
                              flex: "0 1 auto",
                              minWidth: 0,
                              paddingInline: "0.95rem",
                            }}
                            onClick={() => {
                              setTwoFactorModalOpen(false);
                              setTwoFactorRecoveryCodes([]);
                              setTwoFactorRecoveryAck(false);
                              setTwoFactorInfo(tf.modalAfterSaveCodes);
                            }}
                          >
                            {tf.acceptAndClose}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {twoFactorModalMode === "challenge" ? (
                      <div
                        style={{
                          marginTop: 12,
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        {twoFactorChallengeMethod === "email" &&
                        twoFactorRecoveryAssistMode === "hidden" ? (
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            onClick={() => void sendEmailTwoFactorCode()}
                            disabled={twoFactorBusy || !accessToken}
                            style={{
                              flex: "0 1 auto",
                              minWidth: 0,
                              paddingInline: "0.95rem",
                            }}
                          >
                            {twoFactorBusy ? tf.sending : tf.sendEmailCode}
                          </button>
                        ) : null}
                        {twoFactorRecoveryAssistMode === "hidden" ||
                        twoFactorRecoveryAssistMode === "enter_code" ? (
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            onClick={() => void verifyTwoFactorChallenge()}
                            disabled={
                              twoFactorBusy ||
                              (twoFactorRecoveryAssistMode === "enter_code"
                                ? twoFactorRecoveryCode.trim().length < 8
                                : twoFactorChallengeMethod === "totp"
                                  ? twoFactorCode.trim().length < 6
                                  : twoFactorEmailCode.trim().length < 6)
                            }
                            style={{
                              flex: "0 1 auto",
                              minWidth: 0,
                              paddingInline: "0.95rem",
                            }}
                          >
                            {twoFactorRecoveryAssistMode === "enter_code"
                              ? tf.validateRecoveryCode
                              : tf.continueWithVerification}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                    {twoFactorModalMode === "challenge" ? (
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {twoFactorRecoveryAssistMode === "hidden" &&
                        twoFactorChallengeFailures >= 2 ? (
                          <button
                            type="button"
                            className="composer-reading-pill"
                            onClick={() => {
                              setTwoFactorRecoveryAssistMode("options");
                              setTwoFactorError(null);
                            }}
                            disabled={twoFactorBusy}
                            style={{
                              flex: "0 1 auto",
                              minWidth: 0,
                              paddingInline: "0.95rem",
                            }}
                          >
                            {tf.cannotVerifyLink}
                          </button>
                        ) : null}
                        {twoFactorRecoveryAssistMode !== "hidden" ? (
                          <button
                            type="button"
                            className="composer-reading-pill"
                            style={{
                              flex: "0 1 auto",
                              minWidth: 0,
                              paddingInline: "0.95rem",
                            }}
                            onClick={() => {
                              setTwoFactorRecoveryAssistMode("hidden");
                              setTwoFactorError(null);
                            }}
                            disabled={twoFactorBusy}
                          >
                            {tf.tryCodeAgain}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="composer-reading-pill"
                          onClick={() => setLogoutConfirmOpen(true)}
                          style={{
                            flex: "0 1 auto",
                            minWidth: 0,
                            paddingInline: "0.95rem",
                          }}
                        >
                          {ui.signOut}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {logoutConfirmOpen ? (
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="logout-confirm-title"
                  className="token-center-backdrop"
                  onClick={() => setLogoutConfirmOpen(false)}
                >
                  <div
                    className="token-center-card"
                    style={{ maxWidth: 340, padding: "1.5rem" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <strong
                      id="logout-confirm-title"
                      style={{ display: "block", fontSize: "1rem", marginBottom: "0.65rem" }}
                    >
                      {ui.logoutConfirmTitle}
                    </strong>
                    <p style={{ margin: "0 0 1.25rem", color: "var(--fg-muted)", fontSize: "0.88rem" }}>
                      {ui.logoutConfirmMessage}
                    </p>
                    <div style={{ display: "flex", gap: "0.65rem", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="composer-panel-close"
                        onClick={() => setLogoutConfirmOpen(false)}
                      >
                        {ui.logoutConfirmNo}
                      </button>
                      <button
                        type="button"
                        className="composer-panel-close"
                        onClick={() => { setLogoutConfirmOpen(false); void signOut(); }}
                        style={{
                          border: "1px solid color-mix(in srgb, #ef4444 40%, var(--input-border))",
                          background: "color-mix(in srgb, #ef4444 12%, var(--icon-btn-bg))",
                          color: "#ef4444",
                        }}
                      >
                        {ui.logoutConfirmYes}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {tokenCenterOpen ? (
                <div
                  role="dialog"
                  aria-modal="true"
                  className="token-center-backdrop"
                >
                  <div className="token-center-card">
                    <div className="token-center-header">
                      <strong className="token-center-title">
                        {tokenPanel.tokenCenter}
                      </strong>
                      <button
                        type="button"
                        className="composer-panel-close"
                        aria-label={chrome.tokenCenterCloseAria}
                        title={ui.drawerClose}
                        onClick={() => setTokenCenterOpen(false)}
                      >
                        {ui.drawerClose}
                      </button>
                    </div>
                    <p className="meta-line tier-hint-line token-center-subtitle">
                      {chrome.tokenCenterSubtitle}
                    </p>

                    <details
                      className="token-center-pack-details"
                      style={{ marginTop: 10 }}
                    >
                      <summary
                        className="meta-line tier-hint-line"
                        style={{ cursor: "pointer" }}
                      >
                        {chrome.tokenCenterPackDetailsSummary}
                      </summary>
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <p
                          className="meta-line tier-hint-line token-center-message"
                          style={{ margin: 0 }}
                        >
                          <strong>{chrome.freePlanLabel}</strong>{" "}
                          {getFreeTierMarketing(locale)}
                        </p>
                        {PACK_IDS_ORDERED.map((packId) => {
                          const pack = TOKEN_PACKS[packId];
                          return (
                            <p
                              key={packId}
                              className="meta-line tier-hint-line token-center-message"
                              style={{ margin: 0 }}
                            >
                              <strong>{pack.label}:</strong>{" "}
                              {getPackMarketingLine(packId, locale)}
                            </p>
                          );
                        })}
                      </div>
                    </details>

                    <div className="token-center-grid">
                      <p className="meta-line tier-hint-line token-center-row">
                        <span>{tokenPanel.lastPack}</span>{" "}
                        <strong>{tierDisplayNode}</strong>
                      </p>
                      <p className="meta-line tier-hint-line token-center-row">
                        <span>{tokenPanel.availableBalance}</span>{" "}
                        <strong>{tokenBalance ?? "…"}</strong>
                      </p>
                      <p className="meta-line tier-hint-line token-center-row">
                        <span>{tokenPanel.threadCapShort}</span>{" "}
                        <strong>{accountSessionLimit}</strong>
                      </p>
                    </div>

                    {tokenCenterError ? (
                      <p className="meta-line tier-hint-line tier-hint-line--error token-center-message">
                        {tokenCenterError}
                      </p>
                    ) : null}
                    {tokenCenterMessage ? (
                      <p className="meta-line tier-hint-line token-center-message">
                        {tokenCenterMessage}
                      </p>
                    ) : null}

                    <div className="token-center-actions">
                      <button
                        type="button"
                        className="composer-reading-pill is-active"
                        onClick={() => {
                          void (async () => {
                            const ok = await openPlansCheckoutNewTab();
                            if (!ok) {
                              setTokenCenterMessage("checkout_error");
                            }
                          })();
                        }}
                      >
                        {chrome.viewTokenPacks}
                      </button>
                    </div>
                    <p
                      className="meta-line tier-hint-line token-center-message"
                      style={{ marginTop: 8 }}
                    >
                      {tokenPanel.accumulation}
                    </p>
                    <p
                      className="meta-line tier-hint-line token-center-message"
                      style={{ marginTop: 8 }}
                    >
                      <Link href="/guia#planes">
                        {tokenPanel.tokenCenterGuideLink}
                      </Link>
                    </p>
                  </div>
                </div>
              ) : null}

              {showThreadLimitBanner ? (
                <div
                  className="composer-session-limit-float"
                  role="status"
                  aria-live="polite"
                  aria-label={tokenPanel.consultThreadLimit}
                  title={tokenPanel.consultThreadLimit}
                >
                  <p className="composer-session-limit-text">
                    {tokenPanel.consultThreadLimitStrip}
                  </p>
                  <div className="composer-session-limit-actions">
                    <button
                      type="button"
                      className="composer-session-limit-btn"
                      data-testid="new-session-float-btn"
                      onClick={() => startNewSession()}
                      disabled={loading}
                    >
                      {ui.sessionNew}
                    </button>
                    <button
                      type="button"
                      className="composer-session-limit-dismiss"
                      data-testid="thread-limit-banner-dismiss"
                      aria-label={ui.dismissThreadLimitBannerAria}
                      onClick={() => setThreadLimitBannerDismissed(true)}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="composer-minibar">
                <button
                  id="tour-options-btn"
                  type="button"
                  className="composer-options-btn"
                  aria-expanded={consultPanelOpen}
                  aria-controls="consult-panel"
                  aria-label={
                    consultPanelOpen
                      ? chrome.closeConsultOptionsAria
                      : chrome.openConsultOptionsAria
                  }
                  disabled={loading}
                  onClick={() => setConsultPanelOpen((o) => !o)}
                >
                  <span aria-hidden>{consultPanelOpen ? "▾" : "☰"}</span>
                  <span className="composer-mode-tag">{ui.options}</span>
                </button>
                <div className="composer-input-row">
                  <textarea
                    id="tour-chat-input"
                    ref={questionInputRef}
                    data-testid="question-input"
                    value={question}
                    onChange={(e) => {
                      setQuestion(e.target.value);
                      resizeQuestionInput();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (loading) return;
                        if (threadLimitReachedUi) {
                          if (threadLimitBannerDismissed) {
                            setError(tokenPanel.consultThreadLimit);
                          }
                          return;
                        }
                        void onConsult();
                      }
                    }}
                    placeholder={
                      threadLimitReachedUi
                        ? ui.threadLimitReached
                        : oracleMode === "oracle_bones"
                          ? ui.positiveCharge
                          : ui.writeConsultation
                    }
                    aria-label={chrome.questionInputAria}
                    rows={1}
                    maxLength={QUESTION_INPUT_MAX_CHARS}
                    readOnly={threadLimitReachedUi}
                    aria-disabled={threadLimitReachedUi}
                  />
                  <button
                    type="button"
                    data-testid="consult-btn"
                    disabled={loading || threadLimitReachedUi}
                    onClick={() => void onConsult()}
                    aria-label={
                      loading ? chrome.sendAriaSending : chrome.sendAriaSend
                    }
                  >
                    {loading ? "…" : "➤"}
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <ManualIChingCoinWizard
        open={manualWizardOpen}
        onClose={() => {
          setManualWizardOpen(false);
          setManualWizardQuestionSnapshot(null);
        }}
        onComplete={(lines) => {
          setManualWizardOpen(false);
          const q = manualWizardQuestionSnapshot?.trim() ?? question.trim();
          setManualWizardQuestionSnapshot(null);
          void executeConsultationRequest(q, lines);
        }}
        locale={locale}
        questionPreview={manualWizardQuestionSnapshot ?? ""}
      />
      <ManualYarrowWizard
        open={manualYarrowWizardOpen}
        onClose={() => {
          setManualYarrowWizardOpen(false);
          setManualYarrowQuestionSnapshot(null);
        }}
        onComplete={(lines) => {
          setManualYarrowWizardOpen(false);
          const q = manualYarrowQuestionSnapshot?.trim() ?? question.trim();
          setManualYarrowQuestionSnapshot(null);
          void executeConsultationRequest(q, lines);
        }}
        locale={locale}
        questionPreview={manualYarrowQuestionSnapshot ?? ""}
      />
      <section
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
        }}
      >
        <h2>
          The Original I Ching App: AI Oracle, Hexagram Readings and Bone Oracle
        </h2>
        <p>
          Consult the I Ching or the Oracle Bones with AI-powered
          interpretations, ritual animation, hexagram image generation, and
          persistent chat history. Available in 11 languages. No subscriptions.
          Consumable token packs only. Free trial included.
        </p>
        <p>
          Divination methods: three-coin I Ching (Zhu Xi tradition,
          Wilhelm/Baynes), Oracle Bones (Shang-era crack reading), AI
          interpretation via Claude.
        </p>
        <p>
          Features: image generation by tier, chat export to PDF, 45-minute idle
          timeout, Google OAuth, two-factor authentication, dark and light mode,
          Android APK.
        </p>
      </section>
      <JoyrideNoSSR
        key={tourKey}
        run={tourRun}
        steps={
          [
            { target: "#tour-menu-btn",        title: tour.step1Title, content: tour.step1Body, placement: "bottom" },
            { target: "#tour-new-session-btn", title: tour.step2Title, content: tour.step2Body, placement: "bottom", before: tourBeforeDrawer },
            { target: "#tour-options-btn",     title: tour.step3Title, content: tour.step3Body, placement: "top",    before: tourBeforeCloseDrawer },
            { target: "#tour-oracle-mode",     title: tour.step4Title, content: tour.step4Body, placement: "bottom", before: tourBeforePanel("tour-oracle-mode", true) },
            { target: "#tour-translator",      title: tour.step5Title, content: tour.step5Body, placement: "bottom", before: tourBeforePanel("tour-translator",  false) },
            { target: "#tour-cast-mode",       title: tour.step6Title, content: tour.step6Body, placement: "top",    before: tourBeforePanel("tour-cast-mode",   false) },
            { target: "#tour-library-btn",     title: tour.step7Title, content: tour.step7Body, placement: "top",    before: tourBeforePanel("tour-library-btn", false) },
            { target: "#tour-doc-links",       title: tour.step8Title, content: tour.step8Body, placement: "top",    before: tourBeforePanel("tour-doc-links",   false) },
            { target: "#tour-chat-input",      title: tour.step9Title, content: tour.step9Body, placement: "top",    before: () => new Promise<void>(resolve => { setConsultPanelOpen(false); setTimeout(resolve, 220); }) },
          ] satisfies Step[]
        }
        continuous
        tooltipComponent={TourTooltip}
        onEvent={handleTourCallback}
        locale={{
          back: tour.back,
          last: tour.finish,
          next: tour.next,
          skip: tour.skip,
        }}
        styles={tourTheme === "dark" ? {
          spotlight: {
            stroke: "#4ecdc4",
            strokeWidth: 2.5,
            style: { animation: "tour-spotlight-pulse 2s ease-in-out infinite" },
          },
        } : undefined}
        options={{
          skipBeacon: true,
          skipScroll: true,
          zIndex: 10000,
          overlayColor: tourTheme === "dark" ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.52)",
        }}
      />
    </OracleShell>
  );
}
