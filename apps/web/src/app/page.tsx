"use client";

import { OracleShell } from "@iching-oracle/ui";
import {
  allConsultationInProgressTitles,
  commonStrings,
  DEFAULT_LOCALE,
  formatChatLoadFailedStatus,
  formatConsultFailedMessage,
  formatHistoryLoadFailedStatus,
  formatThreadDepthStatusLine,
  formatTwoFactorSupportMailBody,
  getDocNavUiMessages,
  getFreeTierMarketing,
  getHomeChromeUiMessages,
  getHomeSessionUiMessages,
  getPackMarketingLine,
  getPricingUiMessages,
  getTokenPanelUiMessages,
  getTwoFactorUiMessages,
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
import { getManualWizardMessages } from "@/components/manual-iching/manual-wizard-messages";
import { AmbientParticles } from "@/components/AmbientParticles";
import BoneRitualAnimation, { type BoneOracleResult } from "@/components/BoneRitualAnimation";
import { InterpretationMarkdownSafe } from "@/components/InterpretationMarkdownSafe";
import Link from "next/link";
import { ReadingOracleImage } from "@/components/ReadingOracleImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { IchingManualLineTuple } from "@/lib/manual-iching-consult";
import { isPersistableUuid } from "@/lib/session-ids";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import {
  buildCanvasReadingLines,
  drawPdfContinuationChrome,
  interpretationMarkdownToPdfBlocks,
} from "@/lib/pdf-chat-export";
import { tierLabelForDisplay, type Tier } from "@/lib/credits";
import {
  creditsExhaustedBlock,
  tierToBillingTierCopy,
  type BillingTier,
  type CreditsNoticeReason,
} from "@/lib/credits-ui-copy";
import { PACK_IDS_ORDERED, TOKEN_PACKS } from "@/lib/token-packs";
import type { ChatSessionState } from "@/lib/chat-session-state";
import { mergeHydratedWithLocalDrafts, pickPreferredSessionLocalId } from "@/lib/chat-session-selection";
import { useChatSessionState } from "@/providers/chat-session-provider";
import { normalizeInterpretationPunctuation, stripInterpretationFluff } from "@/lib/response-clean";
import { buildPlansCheckoutUrl } from "@/lib/plans-checkout";
import { useProgressiveRevealSubstring } from "@/hooks/useProgressiveRevealSubstring";
import {
  ichingRitualProcessingBudgetMs,
  ichingRitualRevealTimingFromBudget,
  type IchingRitualRevealTiming,
} from "@/lib/iching-ritual-timing";
import { previewCastFromLineValues, type CastingMethod, type Line, type ManualCastPreview } from "@iching-oracle/iching-engine";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/** Default bone surface for API when UI no longer exposes the selector. */
const DEFAULT_BONES_MEDIUM: "turtle" | "ox" = "turtle";

const ICHING_CAST_MODE_STORAGE_KEY = "iching_cast_mode_v1";
const ICHING_CASTING_METHOD_STORAGE_KEY = "iching_casting_method_v1";

const ACCOUNT_SESSION_LIMIT_STORAGE_PREFIX = "iching_account_session_limit_v1:";
const PLAY_PROMO_STRIP_DISMISSED_KEY = "iching_play_promo_strip_dismissed_v1";

function readCachedAccountSessionLimit(userId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`${ACCOUNT_SESSION_LIMIT_STORAGE_PREFIX}${userId}`);
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
    window.sessionStorage.removeItem(`${ACCOUNT_SESSION_LIMIT_STORAGE_PREFIX}${userId}`);
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
  return values.map((value) => (value === 6 ? 7 : value === 9 ? 8 : value)) as Array<7 | 8>;
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

const RUNTIME_TEXT: Record<
  AppLocale,
  {
    ritualCoins: string;
    ritualBones: string;
    ritualBonesHint: string;
    line: string;
    signReading: string;
    oracleBones: string;
    medium: string;
    turtle: string;
    ox: string;
    chargePlus: string;
    chargeMinus: string;
    leansPositive: string;
    leansNegative: string;
  }
> = {
  es: {
    ritualCoins: "Ritual en curso · lanzando monedas",
    ritualBones: "Ritual en curso · calor sobre el hueso",
    ritualBonesHint: "Estilización del procedimiento shang: el patrón de grieta se fija al completar la consulta.",
    line: "Línea",
    signReading: "Lectura del signo:",
    oracleBones: "Huesos de oráculo",
    medium: "Medio",
    turtle: "Plastrón de tortuga",
    ox: "Escápula de buey",
    chargePlus: "Cargo +",
    chargeMinus: "Cargo −",
    leansPositive: "Inclina hacia el cargo positivo.",
    leansNegative: "Inclina hacia la negación del cargo.",
  },
  en: {
    ritualCoins: "Ritual in progress · tossing coins",
    ritualBones: "Ritual in progress · heat over bone",
    ritualBonesHint: "Stylized Shang procedure: the crack pattern is fixed when the consultation completes.",
    line: "Line",
    signReading: "Sign reading:",
    oracleBones: "Oracle bones",
    medium: "Medium",
    turtle: "Turtle plastron",
    ox: "Ox scapula",
    chargePlus: "Charge +",
    chargeMinus: "Charge −",
    leansPositive: "Leans toward the positive charge.",
    leansNegative: "Leans toward negating the charge.",
  },
  pt: {
    ritualCoins: "Ritual em curso · lançando moedas",
    ritualBones: "Ritual em curso · calor sobre o osso",
    ritualBonesHint: "Estilização do procedimento Shang: o padrão da fissura é fixado ao concluir a consulta.",
    line: "Linha",
    signReading: "Leitura do sinal:",
    oracleBones: "Ossos oraculares",
    medium: "Meio",
    turtle: "Plastrão de tartaruga",
    ox: "Escápula de boi",
    chargePlus: "Carga +",
    chargeMinus: "Carga −",
    leansPositive: "Inclina-se para a carga positiva.",
    leansNegative: "Inclina-se para negar a carga.",
  },
  fr: {
    ritualCoins: "Rituel en cours · lancer des pièces",
    ritualBones: "Rituel en cours · chaleur sur l'os",
    ritualBonesHint: "Stylisation du procédé Shang : le motif de fissure se fixe à la fin de la consultation.",
    line: "Ligne",
    signReading: "Lecture du signe :",
    oracleBones: "Os oraculaires",
    medium: "Support",
    turtle: "Plastron de tortue",
    ox: "Omoplate de bœuf",
    chargePlus: "Charge +",
    chargeMinus: "Charge −",
    leansPositive: "Penche vers la charge positive.",
    leansNegative: "Penche vers la négation de la charge.",
  },
  de: {
    ritualCoins: "Ritual läuft · Münzwurf",
    ritualBones: "Ritual läuft · Hitze auf dem Knochen",
    ritualBonesHint: "Stilisierung des Shang-Verfahrens: Das Rissmuster wird nach Abschluss der Anfrage festgelegt.",
    line: "Linie",
    signReading: "Zeichenlesung:",
    oracleBones: "Orakelknochen",
    medium: "Medium",
    turtle: "Schildkrötenpanzer",
    ox: "Rinderschulterblatt",
    chargePlus: "Ladung +",
    chargeMinus: "Ladung −",
    leansPositive: "Neigt zur positiven Ladung.",
    leansNegative: "Neigt zur Verneinung der Ladung.",
  },
  it: {
    ritualCoins: "Rituale in corso · lancio delle monete",
    ritualBones: "Rituale in corso · calore sull'osso",
    ritualBonesHint: "Stilizzazione del procedimento Shang: il pattern di crepa si fissa al termine della consultazione.",
    line: "Linea",
    signReading: "Lettura del segno:",
    oracleBones: "Ossa oracolari",
    medium: "Supporto",
    turtle: "Piastrone di tartaruga",
    ox: "Scapola di bue",
    chargePlus: "Carica +",
    chargeMinus: "Carica −",
    leansPositive: "Inclina verso la carica positiva.",
    leansNegative: "Inclina verso la negazione della carica.",
  },
  ja: {
    ritualCoins: "儀式進行中・コインを投げています",
    ritualBones: "儀式進行中・骨に熱を加えています",
    ritualBonesHint: "殷式手順の演出：相談が完了すると亀裂パターンが確定します。",
    line: "爻",
    signReading: "徴の読み:",
    oracleBones: "甲骨",
    medium: "媒体",
    turtle: "亀の腹甲",
    ox: "牛の肩甲骨",
    chargePlus: "命題 +",
    chargeMinus: "命題 −",
    leansPositive: "肯定命題の側に傾きます。",
    leansNegative: "否定命題の側に傾きます。",
  },
  zh: {
    ritualCoins: "仪式进行中 · 正在掷币",
    ritualBones: "仪式进行中 · 骨上加热",
    ritualBonesHint: "商式流程的风格化展示：咨询完成后裂纹图案会固定。",
    line: "爻",
    signReading: "征兆解读：",
    oracleBones: "甲骨占",
    medium: "介质",
    turtle: "龟甲腹甲",
    ox: "牛肩胛骨",
    chargePlus: "命题 +",
    chargeMinus: "命题 −",
    leansPositive: "倾向于肯定命题。",
    leansNegative: "倾向于否定命题。",
  },
  ko: {
    ritualCoins: "의식 진행 중 · 동전 투척",
    ritualBones: "의식 진행 중 · 뼈에 열 가하기",
    ritualBonesHint: "상(商)식 절차의 스타일화: 상담이 완료되면 균열 패턴이 확정됩니다.",
    line: "효",
    signReading: "징후 해석:",
    oracleBones: "갑골 점복",
    medium: "매체",
    turtle: "거북 배딱지",
    ox: "소 견갑골",
    chargePlus: "명제 +",
    chargeMinus: "명제 −",
    leansPositive: "긍정 명제 쪽으로 기웁니다.",
    leansNegative: "명제 부정 쪽으로 기웁니다.",
  },
  ar: {
    ritualCoins: "الطقس جارٍ · رمي العملات",
    ritualBones: "الطقس جارٍ · الحرارة على العظم",
    ritualBonesHint: "توصيف أسلوب شانغ: يُثبَّت نمط الشقوق عند اكتمال الاستشارة.",
    line: "خط",
    signReading: "قراءة العلامة:",
    oracleBones: "عظام الأوراكل",
    medium: "الوسيط",
    turtle: "بطن السلحفاة",
    ox: "لوح كتف الثور",
    chargePlus: "الشحنة +",
    chargeMinus: "الشحنة −",
    leansPositive: "يميل نحو الشحنة الموجبة.",
    leansNegative: "يميل نحو نفي الشحنة.",
  },
  hi: {
    ritualCoins: "अनुष्ठान जारी है · सिक्के फेंके जा रहे हैं",
    ritualBones: "अनुष्ठान जारी है · हड्डी पर ऊष्मा",
    ritualBonesHint: "शांग प्रक्रिया का शैलीकृत रूप: परामर्श पूरा होने पर दरार-पैटर्न तय होता है।",
    line: "रेखा",
    signReading: "चिह्न-पठन:",
    oracleBones: "अस्थि ओरेकल",
    medium: "माध्यम",
    turtle: "कछुए का प्लास्ट्रॉन",
    ox: "बैल की स्कैपुला",
    chargePlus: "प्रस्ताव +",
    chargeMinus: "प्रस्ताव −",
    leansPositive: "सकारात्मक प्रस्ताव की ओर झुकता है।",
    leansNegative: "प्रस्ताव के निषेध की ओर झुकता है।",
  },
};

const RITUAL_STATUS_COPY: Record<
  AppLocale,
  {
    question: string;
    consult: string;
    shape: string;
    seal: string;
  }
> = {
  es: {
    question: "Tomando tu pregunta",
    consult: "Llevándola al oráculo",
    shape: "El oráculo está consultando",
    seal: "Sellando la lectura",
  },
  en: {
    question: "Holding your question",
    consult: "Carrying it to the oracle",
    shape: "The oracle is consulting",
    seal: "Sealing the reading",
  },
  pt: {
    question: "Sustentando a tua pergunta",
    consult: "Levando-a ao oráculo",
    shape: "O oráculo está consultando",
    seal: "Selando a leitura",
  },
  fr: {
    question: "Accueillir votre question",
    consult: "La porter vers l'oracle",
    shape: "L'oracle consulte",
    seal: "Sceller la lecture",
  },
  de: {
    question: "Deine Frage aufnehmen",
    consult: "Zum Orakel tragen",
    shape: "Das Orakel befragt",
    seal: "Die Deutung wird versiegelt",
  },
  it: {
    question: "Accogliere la tua domanda",
    consult: "Portarla all'oracolo",
    shape: "L'oracolo sta consultando",
    seal: "Sigillando la lettura",
  },
  ja: {
    question: "問いを受け取っています",
    consult: "神託へ運んでいます",
    shape: "神託が照会しています",
    seal: "読みを封じています",
  },
  zh: {
    question: "承接你的问题",
    consult: "将它带向神谕",
    shape: "神谕正在推演",
    seal: "正在封印此次解读",
  },
  ko: {
    question: "질문을 받아들이는 중",
    consult: "신탁으로 옮기는 중",
    shape: "신탁이 살피는 중",
    seal: "해석을 봉인하는 중",
  },
  ar: {
    question: "استقبال سؤالك",
    consult: "نقله إلى الأوراكل",
    shape: "الأوراكل يتشاور",
    seal: "ختم القراءة",
  },
  hi: {
    question: "आपके प्रश्न को थामते हुए",
    consult: "उसे ओरेकल तक ले जाते हुए",
    shape: "ओरेकल परामर्श कर रहा है",
    seal: "पठन को सील किया जा रहा है",
  },
};

const DRAWER_TEXT: Record<
  AppLocale,
  {
    activity: string;
    streak: string;
    consultationsToday: string;
    chatsWithMessages: string;
    loadingChats: string;
    loadingConversation: string;
    onlyThreads: string;
    noSaved: string;
    messages: string;
    deleteConversation: string;
    deletingConversation: string;
  }
> = {
  es: {
    activity: "Tu actividad",
    streak: "Racha (días)",
    consultationsToday: "Consultas hoy",
    chatsWithMessages: "Chats con mensajes",
    loadingChats: "Cargando chats…",
    loadingConversation: "Cargando conversación…",
    onlyThreads: "Solo se listan hilos con al menos una lectura.",
    noSaved: "Aún no hay conversaciones guardadas. Envía una consulta para verla aquí.",
    messages: "mensajes",
    deleteConversation: "Eliminar conversación",
    deletingConversation: "Eliminando conversación…",
  },
  en: {
    activity: "Your activity",
    streak: "Streak (days)",
    consultationsToday: "Consultations today",
    chatsWithMessages: "Chats with messages",
    loadingChats: "Loading chats…",
    loadingConversation: "Loading conversation…",
    onlyThreads: "Only threads with at least one reading are listed.",
    noSaved: "No saved conversations yet. Send a consultation to see it here.",
    messages: "messages",
    deleteConversation: "Delete conversation",
    deletingConversation: "Deleting conversation…",
  },
  pt: {
    activity: "Sua atividade",
    streak: "Sequência (dias)",
    consultationsToday: "Consultas hoje",
    chatsWithMessages: "Chats com mensagens",
    loadingChats: "Carregando chats…",
    loadingConversation: "Carregando conversa…",
    onlyThreads: "Somente fios com ao menos uma leitura são listados.",
    noSaved: "Ainda não há conversas salvas. Envie uma consulta para vê-la aqui.",
    messages: "mensagens",
    deleteConversation: "Excluir conversa",
    deletingConversation: "Excluindo conversa…",
  },
  fr: {
    activity: "Votre activité",
    streak: "Série (jours)",
    consultationsToday: "Consultations aujourd'hui",
    chatsWithMessages: "Chats avec messages",
    loadingChats: "Chargement des chats…",
    loadingConversation: "Chargement de la conversation…",
    onlyThreads: "Seuls les fils avec au moins une lecture sont listés.",
    noSaved: "Aucune conversation enregistrée pour le moment.",
    messages: "messages",
    deleteConversation: "Supprimer la conversation",
    deletingConversation: "Suppression de la conversation…",
  },
  de: {
    activity: "Deine Aktivität",
    streak: "Serie (Tage)",
    consultationsToday: "Heutige Konsultationen",
    chatsWithMessages: "Chats mit Nachrichten",
    loadingChats: "Chats werden geladen…",
    loadingConversation: "Konversation wird geladen…",
    onlyThreads: "Nur Threads mit mindestens einer Lesung werden gelistet.",
    noSaved: "Noch keine gespeicherten Konversationen.",
    messages: "Nachrichten",
    deleteConversation: "Konversation löschen",
    deletingConversation: "Konversation wird gelöscht…",
  },
  it: {
    activity: "La tua attività",
    streak: "Serie (giorni)",
    consultationsToday: "Consultazioni oggi",
    chatsWithMessages: "Chat con messaggi",
    loadingChats: "Caricamento chat…",
    loadingConversation: "Caricamento conversazione…",
    onlyThreads: "Sono elencati solo i thread con almeno una lettura.",
    noSaved: "Nessuna conversazione salvata al momento.",
    messages: "messaggi",
    deleteConversation: "Elimina conversazione",
    deletingConversation: "Eliminazione conversazione…",
  },
  ja: {
    activity: "あなたの履歴",
    streak: "連続日数",
    consultationsToday: "本日の相談",
    chatsWithMessages: "メッセージ付きチャット",
    loadingChats: "チャットを読み込み中…",
    loadingConversation: "会話を読み込み中…",
    onlyThreads: "少なくとも1件の読みがあるスレッドのみ表示されます。",
    noSaved: "保存された会話はまだありません。",
    messages: "件のメッセージ",
    deleteConversation: "会話を削除",
    deletingConversation: "会話を削除中…",
  },
  zh: {
    activity: "你的活动",
    streak: "连续天数",
    consultationsToday: "今日咨询",
    chatsWithMessages: "有消息的聊天",
    loadingChats: "正在加载聊天…",
    loadingConversation: "正在加载会话…",
    onlyThreads: "仅显示至少含1次解读的线程。",
    noSaved: "暂时没有已保存的对话。",
    messages: "条消息",
    deleteConversation: "删除对话",
    deletingConversation: "正在删除对话…",
  },
  ko: {
    activity: "활동 내역",
    streak: "연속 일수",
    consultationsToday: "오늘의 상담",
    chatsWithMessages: "메시지가 있는 채팅",
    loadingChats: "채팅 불러오는 중…",
    loadingConversation: "대화 불러오는 중…",
    onlyThreads: "최소 한 번의 리딩이 있는 스레드만 표시됩니다.",
    noSaved: "저장된 대화가 아직 없습니다.",
    messages: "개의 메시지",
    deleteConversation: "대화 삭제",
    deletingConversation: "대화 삭제 중…",
  },
  ar: {
    activity: "نشاطك",
    streak: "التسلسل (أيام)",
    consultationsToday: "الاستشارات اليوم",
    chatsWithMessages: "المحادثات برسائل",
    loadingChats: "جارٍ تحميل المحادثات…",
    loadingConversation: "جارٍ تحميل المحادثة…",
    onlyThreads: "تُعرض فقط الخيوط ذات قراءة واحدة على الأقل.",
    noSaved: "لا توجد محادثات محفوظة بعد. أرسل استشارة لرؤيتها هنا.",
    messages: "رسائل",
    deleteConversation: "حذف المحادثة",
    deletingConversation: "جارٍ حذف المحادثة…",
  },
  hi: {
    activity: "आपकी गतिविधि",
    streak: "लगातार दिन (स्ट्रीक)",
    consultationsToday: "आज की परामर्श",
    chatsWithMessages: "संदेश वाली चैट",
    loadingChats: "चैट लोड हो रही हैं…",
    loadingConversation: "वार्ता लोड हो रही है…",
    onlyThreads: "केवल वे थ्रेड दिखाए जाते हैं जिनमें कम से कम एक रीडिंग हो।",
    noSaved: "अभी कोई सहेजी गई बातचीत नहीं है। यहाँ देखने के लिए एक परामर्श भेजें।",
    messages: "संदेश",
    deleteConversation: "बातचीत हटाएँ",
    deletingConversation: "बातचीत हटाई जा रही है…",
  },
};

/** English first in the UI selector (default app language). */
const LOCALE_SELECT_ORDER: AppLocale[] = [
  "en",
  ...SUPPORTED_LOCALES.filter((code): code is AppLocale => code !== "en"),
];

const LANGUAGE_LABELS: Record<AppLocale, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  ja: "日本語",
  zh: "中文",
  ko: "한국어",
  ar: "العربية",
  hi: "हिन्दी",
};

type UiCopy = {
  language: string;
  chats: string;
  signIn: string;
  signOut: string;
  options: string;
  writeConsultation: string;
  positiveCharge: string;
  threadLimitReached: string;
  /** aria-label for dismissing the thread-limit strip only; composer stays blocked. */
  dismissThreadLimitBannerAria: string;
  sessionNew: string;
  drawerClose: string;
  iChing: string;
  bones: string;
  iChingTagline: string;
  bonesTagline: string;
  emptyInviteMorning: string;
  emptyInviteAfternoon: string;
  emptyInviteNight: string;
};

const UI_COPY: Record<AppLocale, UiCopy> = {
  es: {
    language: "Idioma",
    chats: "Chats",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    options: "Opciones",
    writeConsultation: "Escribe tu consulta…",
    positiveCharge: "Cargo positivo (afirmación)…",
    threadLimitReached: "Límite de hilo alcanzado. Usa «Nueva sesión» arriba.",
    dismissThreadLimitBannerAria: "Ocultar aviso del límite de hilo",
    sessionNew: "Nueva sesión",
    drawerClose: "Cerrar",
    iChing: "I Ching",
    bones: "Huesos",
    iChingTagline: "Tres monedas · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Huesos de Oráculo · Grietas 兆 · estilo Shang",
    emptyInviteMorning:
      "Buen momento para escuchar al oráculo. ¿Qué inquietud trae este nuevo día? Escribe tu consulta con intención.",
    emptyInviteAfternoon:
      "El cambio sigue moviéndose. ¿Qué necesitas ver con más claridad en el curso de hoy?",
    emptyInviteNight: "La noche también pregunta. ¿Qué frente de tu vida quieres explorar?",
  },
  en: {
    language: "Language",
    chats: "Chats",
    signIn: "Sign in",
    signOut: "Sign out",
    options: "Options",
    writeConsultation: "Type your consultation…",
    positiveCharge: "Positive charge (affirmation)…",
    threadLimitReached: "Thread limit reached. Use \"New session\" above.",
    dismissThreadLimitBannerAria: "Dismiss thread limit notice",
    sessionNew: "New session",
    drawerClose: "Close",
    iChing: "I Ching",
    bones: "Bones",
    iChingTagline: "Three coins · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Oracle Bones · Cracks 兆 · Shang style",
    emptyInviteMorning: "Good time to consult the oracle. What concern comes with this new day?",
    emptyInviteAfternoon: "Change keeps moving. What do you need to see more clearly today?",
    emptyInviteNight: "The night also asks. Which part of your life do you want to explore?",
  },
  pt: {
    language: "Idioma",
    chats: "Conversas",
    signIn: "Entrar",
    signOut: "Sair",
    options: "Opções",
    writeConsultation: "Escreva sua consulta…",
    positiveCharge: "Cargo positivo (afirmação)…",
    threadLimitReached: "Limite do fio atingido. Use «Nova sessão» acima.",
    dismissThreadLimitBannerAria: "Ocultar aviso do limite do fio",
    sessionNew: "Nova sessão",
    drawerClose: "Fechar",
    iChing: "I Ching",
    bones: "Ossos",
    iChingTagline: "Três moedas · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Ossos de Oráculo · Fissuras 兆 · estilo Shang",
    emptyInviteMorning: "Bom momento para ouvir o oráculo. Que inquietação traz este novo dia?",
    emptyInviteAfternoon: "A mudança continua. O que você precisa ver com mais clareza hoje?",
    emptyInviteNight: "A noite também pergunta. Qual frente da sua vida você quer explorar?",
  },
  fr: {
    language: "Langue",
    chats: "Discussions",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    options: "Options",
    writeConsultation: "Écris ta consultation…",
    positiveCharge: "Charge positive (affirmation)…",
    threadLimitReached: "Limite du fil atteinte. Utilisez « Nouvelle session ».",
    dismissThreadLimitBannerAria: "Masquer l'avis de limite de fil",
    sessionNew: "Nouvelle session",
    drawerClose: "Fermer",
    iChing: "I Ching",
    bones: "Os",
    iChingTagline: "Trois pièces · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Os Oracle · Fissures 兆 · style Shang",
    emptyInviteMorning: "Bon moment pour écouter l'oracle. Quelle préoccupation t'accompagne aujourd'hui ?",
    emptyInviteAfternoon: "Le changement continue. Que dois-tu voir plus clairement aujourd'hui ?",
    emptyInviteNight: "La nuit pose aussi des questions. Quelle partie de ta vie veux-tu explorer ?",
  },
  de: {
    language: "Sprache",
    chats: "Chats",
    signIn: "Anmelden",
    signOut: "Abmelden",
    options: "Optionen",
    writeConsultation: "Schreibe deine Frage…",
    positiveCharge: "Positive Ladung (Bejahung)…",
    threadLimitReached: "Thread-Limit erreicht. Oben «Neue Sitzung» verwenden.",
    dismissThreadLimitBannerAria: "Hinweis zum Thread-Limit ausblenden",
    sessionNew: "Neue Sitzung",
    drawerClose: "Schließen",
    iChing: "I Ching",
    bones: "Knochen",
    iChingTagline: "Drei Münzen · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Orakelknochen · Risse 兆 · Shang-Stil",
    emptyInviteMorning: "Guter Zeitpunkt für das Orakel. Welche Frage bringt dieser Tag mit sich?",
    emptyInviteAfternoon: "Der Wandel geht weiter. Was musst du heute klarer sehen?",
    emptyInviteNight: "Auch die Nacht fragt. Welchen Bereich deines Lebens möchtest du erkunden?",
  },
  it: {
    language: "Lingua",
    chats: "Chat",
    signIn: "Accedi",
    signOut: "Esci",
    options: "Opzioni",
    writeConsultation: "Scrivi la tua consultazione…",
    positiveCharge: "Carica positiva (affermazione)…",
    threadLimitReached: "Limite del thread raggiunto. Usa «Nuova sessione».",
    dismissThreadLimitBannerAria: "Nascondi avviso limite thread",
    sessionNew: "Nuova sessione",
    drawerClose: "Chiudi",
    iChing: "I Ching",
    bones: "Ossa",
    iChingTagline: "Tre monete · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Ossa dell'Oracolo · Crepe 兆 · stile Shang",
    emptyInviteMorning: "Momento ideale per l'oracolo. Quale inquietudine porta questo nuovo giorno?",
    emptyInviteAfternoon: "Il cambiamento continua. Cosa devi vedere con più chiarezza oggi?",
    emptyInviteNight: "Anche la notte fa domande. Quale fronte della tua vita vuoi esplorare?",
  },
  ja: {
    language: "言語",
    chats: "チャット",
    signIn: "ログイン",
    signOut: "ログアウト",
    options: "オプション",
    writeConsultation: "相談内容を入力…",
    positiveCharge: "肯定の問い（肯定電荷）…",
    threadLimitReached: "スレッド上限です。上の「新しいセッション」を使用。",
    dismissThreadLimitBannerAria: "スレッド上限の通知を閉じる",
    sessionNew: "新しいセッション",
    drawerClose: "閉じる",
    iChing: "I Ching",
    bones: "骨占",
    iChingTagline: "三枚の硬貨 · 朱熹 · ヴィルヘルム/ベインズ",
    bonesTagline: "甲骨占 · 亀裂 兆 · 殷様式",
    emptyInviteMorning: "いまは託宣に向いた時間。今日の不安を問いにしてみましょう。",
    emptyInviteAfternoon: "変化は動き続けています。今日、何をより明確に見たいですか。",
    emptyInviteNight: "夜もまた問いを生みます。人生のどの面を探りますか。",
  },
  zh: {
    language: "语言",
    chats: "聊天",
    signIn: "登录",
    signOut: "退出登录",
    options: "选项",
    writeConsultation: "输入你的咨询…",
    positiveCharge: "正向命题（肯定）…",
    threadLimitReached: "线程已达上限，请使用“新会话”。",
    dismissThreadLimitBannerAria: "关闭线程上限提示",
    sessionNew: "新会话",
    drawerClose: "关闭",
    iChing: "I Ching",
    bones: "甲骨",
    iChingTagline: "三枚铜钱 · 朱熹 · Wilhelm/Baynes",
    bonesTagline: "甲骨 · 裂纹 兆 · 商式",
    emptyInviteMorning: "此刻适合聆听神谕。今天你带着什么问题而来？",
    emptyInviteAfternoon: "变化仍在流动。今天你需要看清什么？",
    emptyInviteNight: "夜晚也会发问。你想探索人生的哪一面？",
  },
  ko: {
    language: "언어",
    chats: "채팅",
    signIn: "로그인",
    signOut: "로그아웃",
    options: "옵션",
    writeConsultation: "질문을 입력하세요…",
    positiveCharge: "긍정 명제(affirmation)…",
    threadLimitReached: "스레드 한도 도달. 위의 «새 세션» 사용.",
    dismissThreadLimitBannerAria: "스레드 한도 알림 숨기기",
    sessionNew: "새 세션",
    drawerClose: "닫기",
    iChing: "I Ching",
    bones: "골복",
    iChingTagline: "세 동전 · 주희 · Wilhelm/Baynes",
    bonesTagline: "골복 · 균열 兆 · 상나라 방식",
    emptyInviteMorning: "지금은 오라클에 귀 기울이기 좋은 시간입니다. 어떤 고민이 있나요?",
    emptyInviteAfternoon: "변화는 계속 움직입니다. 오늘 무엇을 더 분명히 보고 싶나요?",
    emptyInviteNight: "밤도 질문합니다. 삶의 어떤 영역을 탐색하고 싶나요?",
  },
  ar: {
    language: "اللغة",
    chats: "المحادثات",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    options: "خيارات",
    writeConsultation: "اكتب استشارتك…",
    positiveCharge: "الشحنة الإيجابية (تأكيد)…",
    threadLimitReached: "تم بلوغ حد الخيط. استخدم «جلسة جديدة» أعلاه.",
    dismissThreadLimitBannerAria: "إخفاء إشعار حد الخيط",
    sessionNew: "جلسة جديدة",
    drawerClose: "إغلاق",
    iChing: "I Ching",
    bones: "عظام الكهانة",
    iChingTagline: "ثلاث عملات · تشو شي · فيلهلم/بينز",
    bonesTagline: "عظام الكهانة · الشقوق 兆 · أسلوب شانغ",
    emptyInviteMorning: "وقت مناسب للتشاور مع الأوراكل. ما القلق الذي يحمله هذا اليوم الجديد؟ اكتب استشارتك بنية صادقة.",
    emptyInviteAfternoon: "التغيير لا يتوقف. ما الذي تحتاج إلى رؤيته بوضوح أكبر اليوم؟",
    emptyInviteNight: "الليل أيضاً يسأل. أي جانب من حياتك تريد استكشافه؟",
  },
  hi: {
    language: "भाषा",
    chats: "चैट",
    signIn: "साइन इन",
    signOut: "साइन आउट",
    options: "विकल्प",
    writeConsultation: "अपनी सलाह लिखें…",
    positiveCharge: "सकारात्मक प्रस्ताव (पुष्टि)…",
    threadLimitReached: "थ्रेड सीमा पूरी। ऊपर «नई सत्र» का उपयोग करें।",
    dismissThreadLimitBannerAria: "थ्रेड सीमा सूचना छिपाएँ",
    sessionNew: "नई सत्र",
    drawerClose: "बंद करें",
    iChing: "I Ching",
    bones: "अस्थि ओरेकल",
    iChingTagline: "तीन सिक्के · झू शी · विल्हेल्म/बेयन्स",
    bonesTagline: "अस्थि ओरेकल · दरारें 兆 · शांग शैली",
    emptyInviteMorning: "ओरेकल से पूछने का अच्छा समय है। आज की आपकी मुख्य चिंता क्या है?",
    emptyInviteAfternoon: "परिवर्तन चलता रहता है। आज आपको किस बात को और स्पष्ट देखना है?",
    emptyInviteNight: "रात भी प्रश्न पूछती है। जीवन के किस हिस्से को आप समझना चाहते हैं?",
  },
};

function verdictLabel(v: OracleBonesVerdict, locale: AppLocale): string {
  const mapByLocale: Record<AppLocale, Record<OracleBonesVerdict, string>> = {
    es: {
      auspicious_clear: "吉: favorable claro (carga positiva)",
      auspicious_moderate: "吉: favorable moderado",
      inauspicious_moderate: "凶: desfavorable moderado",
      inauspicious_clear: "凶: desfavorable claro (carga negativa)",
      silent: "Sin respuesta clara. Silencio ancestral.",
    },
    en: {
      auspicious_clear: "吉: clear favorable (positive charge)",
      auspicious_moderate: "吉: moderate favorable",
      inauspicious_moderate: "凶: moderate unfavorable",
      inauspicious_clear: "凶: clear unfavorable (negative charge)",
      silent: "No clear answer. Ancestral silence.",
    },
    pt: {
      auspicious_clear: "吉: favorável claro (carga positiva)",
      auspicious_moderate: "吉: favorável moderado",
      inauspicious_moderate: "凶: desfavorável moderado",
      inauspicious_clear: "凶: desfavorável claro (carga negativa)",
      silent: "Sem resposta clara. Silêncio ancestral.",
    },
    fr: {
      auspicious_clear: "吉: favorable net (charge positive)",
      auspicious_moderate: "吉: favorable modéré",
      inauspicious_moderate: "凶: défavorable modéré",
      inauspicious_clear: "凶: défavorable net (charge négative)",
      silent: "Pas de réponse claire. Silence ancestral.",
    },
    de: {
      auspicious_clear: "吉: klar günstig (positive Ladung)",
      auspicious_moderate: "吉: mäßig günstig",
      inauspicious_moderate: "凶: mäßig ungünstig",
      inauspicious_clear: "凶: klar ungünstig (negative Ladung)",
      silent: "Keine klare Antwort. Ahnenstille.",
    },
    it: {
      auspicious_clear: "吉: favorevole chiaro (carica positiva)",
      auspicious_moderate: "吉: favorevole moderato",
      inauspicious_moderate: "凶: sfavorevole moderato",
      inauspicious_clear: "凶: sfavorevole chiaro (carica negativa)",
      silent: "Nessuna risposta chiara. Silenzio ancestrale.",
    },
    ja: {
      auspicious_clear: "吉：明確に吉（正の荷）",
      auspicious_moderate: "吉：中庸の吉",
      inauspicious_moderate: "凶：中庸の凶",
      inauspicious_clear: "凶：明確に凶（負の荷）",
      silent: "明確な答えなし。祖の沈黙。",
    },
    zh: {
      auspicious_clear: "吉：明确吉（正向命题）",
      auspicious_moderate: "吉：中度吉",
      inauspicious_moderate: "凶：中度凶",
      inauspicious_clear: "凶：明确凶（负向命题）",
      silent: "沉默：无明确答案，祖灵沉默。",
    },
    ko: {
      auspicious_clear: "吉: 뚜렷한 길(긍정 전하)",
      auspicious_moderate: "吉: 보통의 길",
      inauspicious_moderate: "凶: 보통의 흉",
      inauspicious_clear: "凶: 뚜렷한 흉(부정 전하)",
      silent: "명확한 답 없음. 조상의 침묵.",
    },
    ar: {
      auspicious_clear: "吉: إيجابي واضح (شحنة موجبة)",
      auspicious_moderate: "吉: إيجابي معتدل",
      inauspicious_moderate: "凶: سلبي معتدل",
      inauspicious_clear: "凶: سلبي واضح (شحنة سالبة)",
      silent: "لا إجابة واضحة. صمت الأجداد.",
    },
    hi: {
      auspicious_clear: "吉: स्पष्ट शुभ (सकारात्मक प्रस्ताव)",
      auspicious_moderate: "吉: मध्यम शुभ",
      inauspicious_moderate: "凶: मध्यम अशुभ",
      inauspicious_clear: "凶: स्पष्ट अशुभ (नकारात्मक प्रस्ताव)",
      silent: "कोई स्पष्ट उत्तर नहीं। पूर्वजों का मौन।",
    },
  };
  return mapByLocale[locale][v];
}

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
  mutationRule: string;
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
    ambiguous_passes: number;
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
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function createLocalSession(title = "Nueva sesión"): ChatSessionState<ConsultationItem> {
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
  const displayed = useProgressiveRevealSubstring(cleaned, Boolean(reveal), onRevealComplete);
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
  const id = consultationId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase();
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
    oracleBones: c.oracleBones
      ? {
          patternId: c.oracleBones.pattern_id,
          verdict: c.oracleBones.verdict,
          affirmsPositive: null,
          ambiguousPasses: c.oracleBones.ambiguous_passes,
          positiveCharge: c.oracleBones.positive_charge,
          negativeCharge: c.oracleBones.negative_charge,
          medium: c.oracleBones.medium,
        }
      : undefined,
  };
}

function detectInputLanguage(question: string, fallbackLocale: AppLocale): AppLocale {
  const text = question.trim().toLowerCase();
  if (!text) return fallbackLocale;
  if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text)) return "ko";
  if (/[ぁ-ゖァ-ヺ]/.test(text)) return "ja";
  if (/[一-鿿]/.test(text)) return "zh";

  const ptHits = (text.match(/\b(não|você|está|ção|ções|pra|queria)\b/g) ?? []).length;
  const frHits = (text.match(/\b(être|avec|pourquoi|où|ça|merci|vous)\b/g) ?? []).length;
  const deHits = (text.match(/\b(und|nicht|ich|dass|über|möchte|fragen)\b/g) ?? []).length;
  const itHits = (text.match(/\b(perché|con|sono|voglio|grazie|quindi|domanda)\b/g) ?? []).length;

  const esHits =
    (text.match(/\b(el|la|los|las|de|que|para|con|por|como|qué|dónde|cuál|mensaje|consulta|camino|relación)\b/g) ?? [])
      .length +
    (text.match(/[áéíóúñ¿¡]/g) ?? []).length;
  if (fallbackLocale === "es" && esHits > 0) return "es";
  if (ptHits >= 3 && ptHits > esHits + 1) return "pt";
  if (frHits >= 2) return "fr";
  if (deHits >= 2) return "de";
  if (itHits >= 2) return "it";
  const enHits =
    (text.match(/\b(the|and|what|where|when|why|how|message|relationship|question|path|oracle|reading)\b/g) ?? [])
      .length;
  if (enHits > esHits) return "en";
  if (esHits > 0) return "es";
  return fallbackLocale;
}

export default function HomePage() {
  const router = useRouter();
  const [locale, setLocale] = useState<AppLocale>(DEFAULT_LOCALE);
  const ui = UI_COPY[locale];
  const t = commonStrings[locale];
  const tokenPanel = useMemo(() => getTokenPanelUiMessages(locale), [locale]);
  const docNav = useMemo(() => getDocNavUiMessages(locale), [locale]);
  const presentation = useMemo(() => getOraclePresentationUiMessages(locale), [locale]);
  /** Official listing URL when published; empty shows “coming soon” on the Play card. */
  const playStoreUrl = (process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "").trim();
  const chrome = useMemo(() => getHomeChromeUiMessages(locale), [locale]);
  const manualWizardChrome = useMemo(() => getManualWizardMessages(locale), [locale]);
  const sessionUi = useMemo(() => getHomeSessionUiMessages(locale), [locale]);
  const tf = useMemo(() => getTwoFactorUiMessages(locale), [locale]);
  const pricingUi = useMemo(() => getPricingUiMessages(locale), [locale]);
  const runtimeText = RUNTIME_TEXT[locale];
  const drawerText = DRAWER_TEXT[locale];
  const exportPdfLabel = chrome.exportChatPdf;
  const downloadImageLabel = chrome.downloadImage;
  const openImageLabel = chrome.openFullImage;
  const symbolicImageAlt = chrome.symbolicImageAlt;
  const inProgressTitle = chrome.consultationInProgress;
  const knownNewSessionTitles = useMemo(() => {
    return new Set<string>(SUPPORTED_LOCALES.map((code) => UI_COPY[code].sessionNew));
  }, []);
  const knownInProgressTitles = useMemo(() => new Set<string>(allConsultationInProgressTitles()), []);
  const [tier, setTier] = useState<Tier>("free");
  const [tierReady, setTierReady] = useState(false);
  /** Per-thread reading cap from `/api/account/me` (`session_limit`, from pack / tier). */
  const [accountSessionLimit, setAccountSessionLimit] = useState(1);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  /** Last known Supabase user id (for clearing per-user sessionStorage on sign-out). */
  const lastSignedInUserIdForStorageRef = useRef<string | null>(null);
  const [supabaseConfigError, setSupabaseConfigError] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "coins" | "bones" | "reading">("idle");
  const [boneRitualResult, setBoneRitualResult] = useState<BoneOracleResult | null>(null);
  const [ritualLines, setRitualLines] = useState<ApiLine[] | null>(null);
  const [ritualRevealTick, setRitualRevealTick] = useState(0);
  const [ritualAwaitingTick, setRitualAwaitingTick] = useState(0);
  const [ritualStatusPhase, setRitualStatusPhase] = useState<"question" | "consult" | "shape" | "seal">("question");
  const [ritualParticles, setRitualParticles] = useState<
    Array<{ id: number; left: string; top: string; size: string; duration: string; delay: string }>
  >([]);
  const [ritualFinale, setRitualFinale] = useState(false);
  const [ritualDebugCastVector, setRitualDebugCastVector] = useState<Array<6 | 7 | 8 | 9> | null>(null);
  const [ritualDebugFinalVector, setRitualDebugFinalVector] = useState<Array<6 | 7 | 8 | 9> | null>(null);
  const [lastRitualDebugSnapshot, setLastRitualDebugSnapshot] = useState<RitualDebugSnapshot | null>(null);
  const [oracleMode, setOracleMode] = useState<OracleMode>("iching");
  type IchingCastMode = "auto" | "manual";
  const [ichingCastMode, setIchingCastMode] = useState<IchingCastMode>(() => {
    if (typeof window === "undefined") return "auto";
    try {
      return window.localStorage.getItem(ICHING_CAST_MODE_STORAGE_KEY) === "manual" ? "manual" : "auto";
    } catch {
      return "auto";
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(ICHING_CAST_MODE_STORAGE_KEY, ichingCastMode);
    } catch {
      /* ignore */
    }
  }, [ichingCastMode]);
  const [translatorId, setTranslatorId] = useState<"wilhelm" | "legge" | "zhouyi" | "master_combined">("wilhelm");
  const [ichingCastingMethod, setIchingCastingMethod] = useState<CastingMethod>(() => {
    if (typeof window === "undefined") return "three-coins";
    try {
      return window.localStorage.getItem(ICHING_CASTING_METHOD_STORAGE_KEY) === "yarrow-stalks"
        ? "yarrow-stalks"
        : "three-coins";
    } catch {
      return "three-coins";
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(ICHING_CASTING_METHOD_STORAGE_KEY, ichingCastingMethod);
    } catch {
      /* ignore */
    }
  }, [ichingCastingMethod]);
  const [manualWizardOpen, setManualWizardOpen] = useState(false);
  const [manualWizardQuestionSnapshot, setManualWizardQuestionSnapshot] = useState<string | null>(null);
  const [manualYarrowWizardOpen, setManualYarrowWizardOpen] = useState(false);
  const [manualYarrowQuestionSnapshot, setManualYarrowQuestionSnapshot] = useState<string | null>(null);
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
  const [twoFactorQrDataUrl, setTwoFactorQrDataUrl] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorEmailCode, setTwoFactorEmailCode] = useState("");
  const [twoFactorRecoveryCode, setTwoFactorRecoveryCode] = useState("");
  const [twoFactorChallengeFailures, setTwoFactorChallengeFailures] = useState(0);
  const [twoFactorRecoveryAssistMode, setTwoFactorRecoveryAssistMode] = useState<
    "hidden" | "options" | "enter_code" | "contact_support"
  >("hidden");
  const [twoFactorEmailSent, setTwoFactorEmailSent] = useState(false);
  const [twoFactorRecoveryCodes, setTwoFactorRecoveryCodes] = useState<string[]>([]);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorModalMode, setTwoFactorModalMode] = useState<"manage" | "challenge">("manage");
  const [twoFactorSetupMethod, setTwoFactorSetupMethod] = useState<"menu" | "totp" | "email">("menu");
  const [twoFactorChallengeMethod, setTwoFactorChallengeMethod] = useState<"totp" | "email">("totp");
  const [twoFactorRecoveryAck, setTwoFactorRecoveryAck] = useState(false);
  const [twoFactorInfo, setTwoFactorInfo] = useState<string | null>(null);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [secondFactorVerified, setSecondFactorVerified] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState<string | null | undefined>(undefined);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<"enter" | "confirm">("enter");
  const [onboardingInput, setOnboardingInput] = useState("");
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const [pendingUserQuestion, setPendingUserQuestion] = useState<string | null>(null);
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [tokenCenterMessage, setTokenCenterMessage] = useState<string | null>(null);
  const [tokenCenterOpen, setTokenCenterOpen] = useState(false);
  const [tokenCenterBusy, setTokenCenterBusy] = useState(false);
  const [tokenCenterError, setTokenCenterError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingSessionLocalId, setLoadingSessionLocalId] = useState<string | null>(null);
  const [pendingDeletedSessionLocalIds, setPendingDeletedSessionLocalIds] = useState<string[]>([]);
  const [historyLoadError, setHistoryLoadError] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
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
  const historyRef = useRef<HTMLElement | null>(null);
  const idleSignOutRef = useRef(false);
  const isSigningOutRef = useRef(false);
  const activeSessionLocalIdRef = useRef<string | null>(null);
  const pinnedLocalSessionIdRef = useRef<string | null>(null);
  const [chatsOpen, setChatsOpen] = useState(false);
  const [consultPanelOpen, setConsultPanelOpen] = useState(false);
  /** Hides only the thread-limit strip; composer stays read-only until a new session or another chat. */
  const [threadLimitBannerDismissed, setThreadLimitBannerDismissed] = useState(false);
  const [playPromoDismissed, setPlayPromoDismissed] = useState(false);
  const [revealConsultationId, setRevealConsultationId] = useState<string | null>(null);
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
      const cookieMatch = document.cookie.match(/(?:^|;\s*)iching_ui_locale=([^;]+)/);
      const cookieLocale = cookieMatch ? decodeURIComponent(cookieMatch[1] ?? "") : "";
      if ((SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
        next = cookieLocale as AppLocale;
      }
    }
    if (!next) return;
    setLocale(next);
    try {
      window.localStorage.setItem(UI_LOCALE_STORAGE_KEY, next);
      document.documentElement.lang = htmlLangFromAppLocale(next);
      document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      document.cookie = `iching_ui_locale=${encodeURIComponent(next)}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* private mode / cookies blocked */
    }
  }, []);

  /* RN `__rnSetLocale` + storage sync from other tabs — keep React state aligned */
  useEffect(() => {
    const onLocaleBridge = (e: Event) => {
      const raw = (e as CustomEvent<{ locale?: string }>).detail?.locale;
      if (!raw || !(SUPPORTED_LOCALES as readonly string[]).includes(raw)) return;
      const next = raw as AppLocale;
      setLocale((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("iching:locale-changed", onLocaleBridge);
    return () => window.removeEventListener("iching:locale-changed", onLocaleBridge);
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
    window.dispatchEvent(new CustomEvent("iching:locale-changed", { detail: { locale } }));
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
    const phases: Array<"question" | "consult" | "shape"> = ["question", "consult", "shape"];
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
      const stageFromQueryEl = document.querySelector<HTMLElement>('[data-testid="coin-throw"]');
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
        stageContainsGrid: Boolean(stageEl && gridEl ? stageEl.contains(gridEl) : false),
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
    const status = RITUAL_STATUS_COPY[locale] ?? RITUAL_STATUS_COPY.es;
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
    () => (ritualDebugCastVector ? transformLineVector(ritualDebugCastVector) : null),
    [ritualDebugCastVector],
  );
  const ritualDebugFinalTransformed = useMemo(
    () => (ritualDebugFinalVector ? transformLineVector(ritualDebugFinalVector) : null),
    [ritualDebugFinalVector],
  );
  const ritualDebugMatch = useMemo(() => {
    if (!ritualDebugCastTransformed || !ritualDebugFinalTransformed) return null;
    return ritualDebugCastTransformed.join(",") === ritualDebugFinalTransformed.join(",");
  }, [ritualDebugCastTransformed, ritualDebugFinalTransformed]);
  const [emptyThreadInvite, setEmptyThreadInvite] = useState(ui.emptyInviteMorning);
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
    return sessions.find((s) => s.localId === activeSessionLocalId) ?? sessions[0] ?? null;
  }, [sessions, activeSessionLocalId]);
  useEffect(() => {
    activeSessionLocalIdRef.current = activeSessionLocalId;
  }, [activeSessionLocalId]);
  const activeThread = activeSession?.thread ?? [];
  const result = activeThread.at(-1) ?? null;
  /** Per-thread cap from current plan (`/api/account/me` session_limit). API enforces this, not the DB session row. */
  const planThreadLimit = Math.max(1, accountSessionLimit);
  const threadDepthCap = planThreadLimit;
  const threadDepthCanDeepen = isAdmin || Boolean(result && result.sessionPosition < planThreadLimit);
  const threadLimitReached = !isAdmin && activeThread.length > 0 && result !== null && !threadDepthCanDeepen;
  /** Until `/api/account/me` hydrates `accountSessionLimit`, default `1` would falsely flag paid threads — never show limit UI until `tierReady`. */
  const threadLimitReachedUi = tierReady && threadLimitReached;
  const showThreadLimitBanner = threadLimitReachedUi && !threadLimitBannerDismissed;
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
  const dismissPlayPromoStrip = useCallback(() => {
    try {
      sessionStorage.setItem(PLAY_PROMO_STRIP_DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
    setPlayPromoDismissed(true);
  }, []);
  const tierDisplayNode = tierReady ? (
    isAdmin ? "admin" : tierLabelForDisplay(tier)
  ) : (
    <span className="plan-tier-skeleton" aria-hidden="true" />
  );
  const supportEmailFromEnv =
    typeof process !== "undefined" && typeof process.env.NEXT_PUBLIC_SUPPORT_EMAIL === "string"
      ? process.env.NEXT_PUBLIC_SUPPORT_EMAIL.trim()
      : "";
  const twoFactorSupportEmail = supportEmailFromEnv || "soporte@the-original-i-ching.app";
  const preferredTwoFactorMethod: "totp" | "email" = twoFactorMethod === "email" ? "email" : "totp";
  const questionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const QUESTION_INPUT_MAX_HEIGHT_PX = 160;
  const resizeQuestionInput = useCallback(() => {
    const el = questionInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(QUESTION_INPUT_MAX_HEIGHT_PX, el.scrollHeight);
    const narrow =
      typeof window !== "undefined" && window.matchMedia?.("(max-width: 520px)")?.matches;
    const minOneLinePx = narrow ? 38 : 44;
    el.style.height = `${Math.max(minOneLinePx, nextHeight)}px`;
    el.style.overflowY = el.scrollHeight > QUESTION_INPUT_MAX_HEIGHT_PX ? "auto" : "hidden";
  }, []);
  /** Browser + RN WebView: rounded top cap on auth strip when guest or signed-in strip is shown. */
  const showAuthExploreCap =
    authReady &&
    !supabaseConfigError &&
    (!accessToken || Boolean(accessToken && authEmail));
  const summaryCacheKey = authUserId ? `iching_chat_summaries_v1:${authUserId}` : null;
  const chatStateCacheKey = authUserId ? `iching_chat_state_v1:${authUserId}` : null;

  useEffect(() => {
    setPersistenceKeys(summaryCacheKey, chatStateCacheKey);
  }, [summaryCacheKey, chatStateCacheKey, setPersistenceKeys]);

  useEffect(() => {
    resizeQuestionInput();
  }, [question, resizeQuestionInput]);

  async function exportChatPdf(): Promise<void> {
    if (!activeThread.length) return;
    const { jsPDF } = await import("jspdf");
    const lang = detectInputLanguage(activeThread.at(-1)?.question ?? question, locale);
    const isEsPdf = lang === "es";
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const fileBase = formatPrintFilename(
      activeThread.at(-1)?.consultationId ?? activeThread[0]?.consultationId ?? "CHAT",
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
      "\"Noto Sans CJK JP\",\"Yu Gothic UI\",\"Meiryo\",\"Microsoft YaHei\",\"Malgun Gothic\",\"Segoe UI\",sans-serif";
    const serifFont = "\"Noto Serif CJK JP\",\"Yu Mincho\",\"MS Mincho\",serif";

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
      const lines: string[] = [];
      let line = "";
      for (const ch of Array.from(text.replace(/\r/g, ""))) {
        if (ch === "\n") {
          lines.push(line);
          line = "";
          continue;
        }
        const test = line + ch;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line.trimEnd());
          line = ch;
        } else {
          line = test;
        }
      }
      if (line.trim().length > 0) lines.push(line.trimEnd());
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
      const use = typeof maxLines === "number" ? lines.slice(0, maxLines) : lines;
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

      const accent = entry.oracleType === "oracle_bones" ? "#2a857a" : "#1f6f8f";

      // Header
      ctx.fillStyle = "#17212b";
      ctx.font = `700 42px ${serifFont}`;
      ctx.fillText(isEsPdf ? "Consulta del Oráculo" : "Oracle Consultation", 64, 76);
      ctx.font = `500 23px ${cjkFont}`;
      ctx.fillStyle = "#36515d";
      ctx.fillText(`${isEsPdf ? "Entrada" : "Entry"} ${i + 1} · ${new Date().toLocaleString(locale)}`, 64, 112);

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
      ctx.fillText(isEsPdf ? "Pregunta" : "Question", 86, 232);
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
      ctx.fillText(isEsPdf ? "Resumen" : "Summary", 84, cardY + 46);
      ctx.font = `500 25px ${cjkFont}`;
      ctx.fillStyle = "#22313f";
      let sy = cardY + 92;
      const summaryLine = (label: string, value: string) => {
        sy = drawWrapped(ctx, `${label} ${value}`, 84, sy, leftW - 60, 34, 2) + 6;
      };
      if (entry.oracleType === "oracle_bones" && entry.oracleBones) {
        summaryLine(isEsPdf ? "Tipo:" : "Type:", isEsPdf ? "Huesos" : "Bones");
        summaryLine(isEsPdf ? "Veredicto:" : "Verdict:", verdictLabel(entry.oracleBones.verdict, lang));
        summaryLine(isEsPdf ? "Cargo +:" : "Charge +:", entry.oracleBones.positiveCharge);
      } else {
        summaryLine(isEsPdf ? "Hexagrama:" : "Hexagram:", `#${entry.primaryHexagram} ${entry.primaryHexagramChinese}`);
        summaryLine(isEsPdf ? "Regla:" : "Rule:", entry.mutationRule);
        summaryLine(isEsPdf ? "En hilo:" : "In thread:", `${entry.sessionPosition}`);
      }

      const imgDataUrl =
        (await fetchImageDataUrl(entry.imageUrl)) ?? (await fetchImageDataUrl(entry.imageFallbackUrl ?? ""));
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
      ctx.fillText(isEsPdf ? "Lectura" : "Reading", 84, panelY + 44);

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
            isEsPdf,
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
        ctx.fillText(sl.text, sl.x, y);
        y += sl.lineHeight;
        lineIdx += 1;
      }

      flushCanvasToDoc();
    }

    doc.save(`${fileBase}.pdf`);
  }

  const updateActiveSession = (
    updater: (current: ChatSessionState<ConsultationItem>) => ChatSessionState<ConsultationItem>,
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
        document.getElementById(`reading-sheet-${revealConsultationId}`)?.scrollIntoView({
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
    // First render after mount/remount or session change: jump instantly to avoid visual slide
    const behavior = mountScrollDoneRef.current ? "smooth" : "instant";
    mountScrollDoneRef.current = true;
    endRef.current?.scrollIntoView({ behavior, block: "end" });
  }, [activeThread.length, phase, error, activeSessionLocalId, revealConsultationId]);

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
    setQuestion("");
    setError(null);
    setChatsOpen(false);
    setConsultPanelOpen(false);
  }, [ui.sessionNew]);

  const signOut = useCallback(async () => {
    if (!isSupabaseBrowserConfigured()) return;
    isSigningOutRef.current = true;
    const uid = authUserId;
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
  }, [authUserId]);

  const sessionsListed = useMemo(() => sessions.filter((s) => s.messageCount > 0), [sessions]);
  const visibleSessionsListed = useMemo(
    () => sessionsListed.filter((s) => !pendingDeletedSessionLocalIds.includes(s.localId)),
    [sessionsListed, pendingDeletedSessionLocalIds],
  );
  const loadSessionThread = useCallback(
    async (sessionId: string, localId: string) => {
      if (!accessToken) return;
      setHistoryLoading(true);
      setLoadingSessionLocalId(localId);
      setHistoryLoadError(null);
      try {
        const res = await fetch(`/api/account/chats?sessionId=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
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
          setHistoryLoadError(formatChatLoadFailedStatus(sessionUi, res.status));
          return;
        }
        const payload = (await res.json()) as AccountChatSessionResponse;
        if (!payload?.session) return;
        const planCap = Math.max(1, accountSessionLimit);
        const thread = payload.consultations.map((c) =>
          mapApiConsultationToItem(c, payload.session.publicId, planCap),
        );
        setSessions((prev) =>
          prev.map((s) => {
            if (s.localId !== localId) return s;
            return {
              ...s,
              title:
                payload.session.title &&
                !knownNewSessionTitles.has(payload.session.title) &&
                !knownInProgressTitles.has(payload.session.title)
                  ? payload.session.title
                  : (thread[0]?.question.slice(0, 60) ?? sessionUi.defaultSessionTitle),
              sessionId: payload.session.sessionId,
              publicSessionId: payload.session.publicId,
              threadMaxDepth: planCap,
              thread,
              messageCount: Math.max(thread.length, s.messageCount),
              updatedAt: thread.at(-1)?.createdAt ?? s.updatedAt,
              firstConsultationAt: thread[0]?.createdAt ?? s.firstConsultationAt,
            };
          }),
        );
        setHistoryLoadError(null);
      } catch {
        setHistoryLoadError(sessionUi.chatLoadNetworkError);
      } finally {
        setHistoryLoading(false);
        setLoadingSessionLocalId((current) => (current === localId ? null : current));
      }
    },
    [accessToken, knownInProgressTitles, knownNewSessionTitles, sessionUi, accountSessionLimit, signOut],
  );
  const removeSession = useCallback(
    async (session: ChatSessionState<ConsultationItem>) => {
      if (!accessToken || !session.sessionId) return;
      if (pendingDeletedSessionLocalIds.includes(session.localId)) return;
      const ok = window.confirm(sessionUi.deleteConfirm);
      if (!ok) return;
      setPendingDeletedSessionLocalIds((prev) => (prev.includes(session.localId) ? prev : [...prev, session.localId]));
      try {
        const res = await fetch(`/api/account/chats?sessionId=${encodeURIComponent(session.sessionId)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          setPendingDeletedSessionLocalIds((prev) => prev.filter((id) => id !== session.localId));
          setError(sessionUi.couldNotDeleteConversation);
          return;
        }
        setSessions((prev) => {
          const next = prev.filter((s) => s.localId !== session.localId);
          const nextActive = next[0]?.localId ?? null;
          setActiveSessionLocalId((current) => (current === session.localId ? nextActive : current));
          return next;
        });
      } catch {
        setPendingDeletedSessionLocalIds((prev) => prev.filter((id) => id !== session.localId));
        setError(sessionUi.couldNotDeleteConversation);
        return;
      }
      setPendingDeletedSessionLocalIds((prev) => prev.filter((id) => id !== session.localId));
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
    const storedStreak = Number(localStorage.getItem(streakDaysStorageKey) ?? "0");
    const storedDaily = Number(localStorage.getItem(dailyCountStorageKey(today)) ?? "0");
    setDailyCount(storedDaily);
    if (!lastDay) {
      setStreakDays(Math.max(storedStreak, 1));
      localStorage.setItem(streakDayStorageKey, today);
      localStorage.setItem(streakDaysStorageKey, String(Math.max(storedStreak, 1)));
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
    localStorage.setItem(streakDayStorageKey, today);
    localStorage.setItem(streakDaysStorageKey, String(nextStreak));
  }, [dailyCountStorageKey, streakDayStorageKey, streakDaysStorageKey]);

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
      setAuthUserId(session?.user?.id ?? null);
      setAuthReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
      setAuthEmail(session?.user?.email ?? null);
      setAuthUserId(session?.user?.id ?? null);
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
    let cancelled = false;
    if (authUserId) {
      const cached = readCachedAccountSessionLimit(authUserId);
      if (cached !== null) setAccountSessionLimit(cached);
    }
    setTierReady(false);
    function loadAccountTier() {
      if (isSigningOutRef.current) return;
      void fetch("/api/account/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: {
          last_pack?: string;
          tokens_available?: number;
          session_limit?: number;
          twoFactorEnabled?: boolean;
          twoFactorMethod?: string | null;
          display_name?: string | null;
          is_admin?: boolean;
          legal_acceptance_current?: boolean;
        } | null) => {
          if (cancelled) return;
          if (!j) {
            if (authUserId) {
              const cached = readCachedAccountSessionLimit(authUserId);
              if (cached !== null) setAccountSessionLimit(cached);
            }
            setTierReady(true);
            return;
          }
          if (j.legal_acceptance_current === false) {
            router.replace("/auth/complete-legal");
            return;
          }
          const lastPack = typeof j.last_pack === "string" ? j.last_pack : "free";
          setTier(lastPack as Tier);
          setTierReady(true);
          setIsAdmin(j.is_admin === true);
          if (typeof j.session_limit === "number" && Number.isFinite(j.session_limit)) {
            setAccountSessionLimit(j.session_limit);
            if (authUserId) writeCachedAccountSessionLimit(authUserId, j.session_limit);
          }
          setTokenBalance(typeof j.tokens_available === "number" ? j.tokens_available : null);
          setTwoFactorEnabled(Boolean(j.twoFactorEnabled));
          setTwoFactorMethod(j.twoFactorMethod ?? null);
          const dn = typeof j.display_name === "string" ? j.display_name : null;
          setDisplayName(dn);
          if (dn === null) {
            // Check provider to decide: auto-fill from Google or show modal for email
            void (async () => {
              const sb = getSupabaseBrowser();
              const { data: { session } } = await sb.auth.getSession();
              const provider = session?.user?.app_metadata?.provider;
              const fullName =
                typeof session?.user?.user_metadata?.full_name === "string"
                  ? session.user.user_metadata.full_name.trim()
                  : "";
              const firstName = fullName.split(" ")[0]?.trim() ?? "";
              if (provider === "google" && firstName) {
                // Silently save the first name — no modal shown
                try {
                  const res = await fetch("/api/account/display-name", {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ display_name: firstName }),
                  });
                  if (res.ok) setDisplayName(firstName);
                } catch { /* non-fatal */ }
              } else {
                setOnboardingStep("enter");
                setOnboardingInput("");
                setOnboardingOpen(true);
              }
            })();
          }
        })
        .catch(() => {
          if (cancelled) return;
          if (authUserId) {
            const cached = readCachedAccountSessionLimit(authUserId);
            if (cached !== null) setAccountSessionLimit(cached);
          }
          setTierReady(true);
        });
    }
    loadAccountTier();
    function onAccountRefresh() {
      if (!cancelled) loadAccountTier();
    }
    window.addEventListener("iching:account-refresh", onAccountRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener("iching:account-refresh", onAccountRefresh);
    };
  }, [accessToken, authReady, authUserId, router]);

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
    const activityEvents: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart", "mousemove", "scroll"];
    for (const eventName of activityEvents) {
      window.addEventListener(eventName, registerActivity, { passive: true });
    }
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(expireIfNeeded, SESSION_IDLE_CHECK_INTERVAL_MS);

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
  }, [authReady, accessToken, inProgressTitle, sessions, setSessions, setActiveSessionLocalId]);

  useEffect(() => {
    if (!authReady || !accessToken || !sessionsHydrated) return;
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
        const fetchSummary = async () => {
          const firstAttempt = await fetch("/api/account/chats?summary=1", {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
          });
          if (firstAttempt.ok || firstAttempt.status < 500) {
            return firstAttempt;
          }
          await new Promise((resolve) => window.setTimeout(resolve, 350));
          return fetch("/api/account/chats?summary=1", {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
          });
        };
        const res = await fetchSummary();
        if (!res.ok) {
          const err = parseApiErrorPayload(await res.text());
          if (err?.code === "CHAT_PERSISTENCE_NOT_CONFIGURED") {
            const msg = sessionUi.historySupabaseMissing;
            setError(msg);
            setHistoryLoadError(msg);
            return;
          }
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
          return;
        }
        const payload = (await res.json()) as AccountChatsSummaryResponse;
        if (cancelled || !payload) return;
        const hydrated = payload.sessions
          .map((entry): ChatSessionState<ConsultationItem> => {
            return {
              localId: `db-${entry.session.sessionId}`,
              title:
                entry.session.title && !knownNewSessionTitles.has(entry.session.title) && !knownInProgressTitles.has(entry.session.title)
                  ? entry.session.title
                  : (entry.firstQuestion?.trim().slice(0, 80) || sessionUi.defaultSessionTitle),
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
                existing.title && !knownNewSessionTitles.has(existing.title) && !knownInProgressTitles.has(existing.title)
                  ? existing.title
                  : next.title,
              thread: existing.thread,
              threadMaxDepth: existing.threadMaxDepth ?? next.threadMaxDepth,
              messageCount: Math.max(next.messageCount, existing.messageCount),
              updatedAt: Math.max(next.updatedAt, existing.updatedAt),
              firstConsultationAt: next.firstConsultationAt ?? existing.firstConsultationAt,
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
        const pinnedLocalId = pinnedLocalSessionIdRef.current;
        if (pinnedLocalId && !combinedSessions.some((s) => s.localId === pinnedLocalId)) {
          pinnedLocalSessionIdRef.current = null;
        }
        const activeLocalId = activeSessionLocalIdRef.current;
        const preferredLocalId = pickPreferredSessionLocalId({
          sessions: combinedSessions,
          pinnedLocalId: pinnedLocalSessionIdRef.current,
          activeLocalId,
        });
        setActiveSessionLocalId(preferredLocalId);
        const selected = combinedSessions.find((s) => s.localId === preferredLocalId) ?? combinedSessions[0];
        if (selected?.sessionId && selected.messageCount > 0 && selected.thread.length === 0) {
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
      const data = (await res.json()) as { recoveryCodes?: string[]; error?: string; code?: string };
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
      const data = (await res.json().catch(() => null)) as { ok?: boolean; code?: string; message?: string } | null;
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
            typeof data?.message === "string"
              ? data.message
              : null;
          setTwoFactorError(
            deliveryMessage
              ? interpolate(tf.emailDeliveryFailedReason, { reason: deliveryMessage })
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
      const data = (await res.json()) as { recoveryCodes?: string[]; code?: string };
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
    const payload: { token?: string; emailCode?: string; recoveryCode?: string } = {};
    const usingRecoveryCode = twoFactorRecoveryAssistMode === "enter_code";
    if (usingRecoveryCode && twoFactorRecoveryCode.trim().length >= 8) {
      payload.recoveryCode = twoFactorRecoveryCode.trim();
    }
    if (!usingRecoveryCode && twoFactorChallengeMethod === "totp" && twoFactorCode.trim().length >= 6) {
      payload.token = twoFactorCode.trim();
    }
    if (!usingRecoveryCode && twoFactorChallengeMethod === "email" && twoFactorEmailCode.trim().length >= 6) {
      payload.emailCode = twoFactorEmailCode.trim();
    }
    if (!payload.token && !payload.emailCode && !payload.recoveryCode) {
      setTwoFactorError(usingRecoveryCode ? tf.challengeNeedRecovery : tf.challengeNeedSixDigit);
      return;
    }
    setTwoFactorBusy(true);
    setTwoFactorError(null);
    setTwoFactorInfo(null);
    try {
      const res = await fetch("/api/auth/2fa/challenge/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { code?: string } | null;
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
    const built = await buildPlansCheckoutUrl(process.env.NEXT_PUBLIC_PLANS_URL, {
      appUserId: authUserId,
      /** Authenticated CTAs must send app_user_id; fail the open if we cannot resolve it. */
      requireAppUserId: Boolean(accessToken),
    });
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
      const data = (await res.json().catch(() => null)) as
        | {
            id?: string;
            last_pack?: string;
            tokens_available?: number;
            session_limit?: number;
          }
        | null;
      if (!res.ok || !data) {
        setTokenCenterError(tokenPanel.loadError);
        return;
      }
      if (typeof data.last_pack === "string") setTier(data.last_pack as Tier);
      if (typeof data.tokens_available === "number") setTokenBalance(data.tokens_available);
      if (typeof data.session_limit === "number") {
        setAccountSessionLimit(data.session_limit);
        if (authUserId) writeCachedAccountSessionLimit(authUserId, data.session_limit);
      }
      if (typeof data.tokens_available === "number" && data.tokens_available <= 0) {
        if (data.last_pack === "free") {
          setTokenCenterMessage(tokenPanel.messageFreeDepleted);
        } else {
          setTokenCenterMessage(tokenPanel.messageNoActivePurchase);
        }
      }
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
          ? "Escribe el cargo positivo (una afirmación clara) para consultar los huesos."
          : "Escribe una consulta antes de enviar.",
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
    const showRitualAnimation = oracleMode === "oracle_bones" || oracleMode === "iching";
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
          primaryHexagramChinese: manualCastPreviewEngine.primaryHexagram.chineseName,
          transformedHexagram: manualCastPreviewEngine.transformedHexagram?.number ?? null,
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
      setError("No hay una conversación activa. Abre o crea una sesión.");
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
        const ordered = [...engineLinesToApiLines(manualCastPreviewEngine.lines)].sort(
          (a, b) => a.position - b.position,
        );
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
          transformedHexagram: manualCastPreviewEngine.transformedHexagram?.number ?? null,
        });
        if (ichingCastMode === "manual") {
          const budgetMs = ichingRitualProcessingBudgetMs(lastIchingConsultWallMsRef.current);
          const timing = ichingRitualRevealTimingFromBudget(budgetMs);
          const phaseOneMs = Math.max(1200, timing.tickDelayMs * 12);
          logRitualTrace("manual:phase-switch-scheduled", { budgetMs, phaseOneMs });
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
    setPhase(showRitualAnimation ? (oracleMode === "oracle_bones" ? "bones" : "coins") : "idle");
    let ok = false;
    try {
      let sessionIdForRequest = consultSession.sessionId;
      if (!isPersistableUuid(sessionIdForRequest)) {
        sessionIdForRequest = newClientUuid();
        updateActiveSession((c) => ({ ...c, sessionId: sessionIdForRequest }));
      }
      ichingConsultWallClockStartedAtRef.current = oracleMode === "iching" ? Date.now() : null;
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          question: questionForRequest,
          language: detectInputLanguage(questionForRequest, locale),
          /** Manual cast must never request SSE — long tick reveal only applies to automatic mode. */
          responseMode:
            oracleMode === "iching" && ichingCastMode === "auto" ? "stream_ritual" : "ritual",
          sessionId: sessionIdForRequest,
          sessionTitle: consultSession.title,
          isDeepening: activeThread.length > 0,
          oracleMode,
            ...(oracleMode === "iching"
              ? manualLineValues
                ? { ichingCastMode: "manual" as const, ichingCastingMethod, ichingManualLineValues: [...manualLineValues] }
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
                  ambiguousPasses: item.oracleBones.ambiguousPasses,
                }
              : undefined,
          })),
        }),
      });
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
      const runIChingRitualReveal = async (linesPayload: ApiLine[], timing: IchingRitualRevealTiming) => {
        const ordered = [...linesPayload].sort((a, b) => a.position - b.position);
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
          setError("Respuesta del servidor inválida.");
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
        let finalPayload: (ConsultResponse & { error?: string; message?: string }) | null = null;
        let streamErrored = false;
        let revealStarted = false;
        let revealPromise: Promise<void> | null = null;
        let castVectorFromStream: Array<6 | 7 | 8 | 9> | null = null;

        const startLineReveal = (linesPayload: ApiLine[]) => {
          if (revealStarted) return;
          revealStarted = true;
          castVectorFromStream = apiLinesToVector(linesPayload);
          setRitualDebugCastVector(castVectorFromStream);
          const processingBudget = ichingRitualProcessingBudgetMs(lastIchingConsultWallMsRef.current);
          const timing = ichingRitualRevealTimingFromBudget(processingBudget);
          logRitualTrace("reveal:budget", { processingBudgetMs: processingBudget });
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
              if (Array.isArray(castPayload.lines) && castPayload.lines.length === 6) {
                startLineReveal(castPayload.lines);
              }
            } else if (eventName === "final_ready") {
              logRitualTrace("sse:event", { eventName });
              finalPayload = payload as ConsultResponse & { error?: string; message?: string };
            } else if (eventName === "error") {
              logRitualTrace("sse:event", { eventName });
              streamErrored = true;
              const err = payload as { message?: string };
              setError(err.message || "No se pudo completar la consulta.");
            }
          }
        }
        if (streamErrored || !finalPayload) {
          if (!streamErrored) setError("Respuesta del servidor inválida.");
          return;
        }
        if (revealPromise) {
          void revealPromise;
        }
        data = finalPayload;
        if (Array.isArray(finalPayload.lines) && finalPayload.lines.length === 6) {
          const finalVec = apiLinesToVector(finalPayload.lines);
          setRitualDebugFinalVector(finalVec);
          const castBaseForSnapshot = castVectorFromStream ?? ritualDebugCastVector ?? finalVec;
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
          data = JSON.parse(rawText) as ConsultResponse & { error?: string; message?: string };
        } catch {
          setError(
            res.ok
              ? "Respuesta del servidor inválida."
              : `Error del servidor (${res.status}). Inténtalo de nuevo en unos minutos.`,
          );
          return;
        }
      }
      if (!res.ok) {
        if (res.status === 401) {
          setError("Sesión caducada o no válida. Vuelve a iniciar sesión.");
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
        if (res.status === 403 && (data.error === "two_factor_required" || data.action === "setup_2fa")) {
          setConsultPanelOpen(true);
          setError(tf.twoFaRequiredByPolicy);
          return;
        }
        const serverMsg =
          typeof data.message === "string" && data.message.trim() ? data.message.trim() : undefined;
        const suffix = serverMsg ? ` ${serverMsg}` : "";
        if (data.error === "consult_failed") {
          setError(formatConsultFailedMessage(sessionUi, serverMsg));
          return;
        }
        setError(`${data.error ?? interpolate(sessionUi.requestFailedStatus, { status: res.status })}${suffix}`);
        return;
      }
      /** POST-HTTP beat: JSON ritual paints lines after one blob; SSE already ran `runIChingRitualReveal` during the stream. */
      const sseIchingAutoRitualComplete =
        showRitualAnimation &&
        contentType.includes("text/event-stream") &&
        oracleMode === "iching" &&
        ichingCastMode === "auto";
      const initialPauseAfterOkMs =
        !showRitualAnimation
          ? 0
          : sseIchingAutoRitualComplete
            ? 0
            : isManualCast && oracleMode === "iching"
              ? 0
              : 900;
      await new Promise((r) => window.setTimeout(r, initialPauseAfterOkMs));
      if (showRitualAnimation && oracleMode === "oracle_bones" && data.oracleBones) {
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
        const orderedLines = [...data.lines].sort((a, b) => a.position - b.position);
        if (ichingCastMode === "manual" && isManualCast) {
          const fetchStartedAt = ichingConsultWallClockStartedAtRef.current;
          const fetchMs =
            fetchStartedAt != null ? Math.max(0, Date.now() - fetchStartedAt) : 0;
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
            logRitualTrace("reveal:manual-lines-sync", { fetchMs, forcedOnResponse: true });
            await waitForRitualPaint();
          } else {
            logRitualTrace("reveal:manual-lines-sync", { fetchMs, forcedOnResponse: false });
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
              ? Math.max(0, Date.now() - ichingConsultWallClockStartedAtRef.current)
              : null;
          const jsonTimingBudget = ichingRitualProcessingBudgetMs(
            measuredThisJsonMs ?? lastIchingConsultWallMsRef.current,
          );
          const jsonRevealTiming = ichingRitualRevealTimingFromBudget(jsonTimingBudget);
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
          typeof data.sessionMaxDepth === "number" && Number.isFinite(data.sessionMaxDepth) && data.sessionMaxDepth > 0
            ? data.sessionMaxDepth
            : current.threadMaxDepth;
        return {
        ...current,
        threadMaxDepth: nextThreadMax ?? current.threadMaxDepth,
        thread: [...current.thread, item],
        messageCount: Math.max(current.messageCount, current.thread.length + 1),
        sessionId: data.sessionId,
        publicSessionId: data.publicSessionId ?? current.publicSessionId,
        title: knownInProgressTitles.has(current.title) || knownNewSessionTitles.has(current.title)
          ? item.question.slice(0, 60)
          : current.title,
        updatedAt: item.createdAt ?? Date.now(),
        firstConsultationAt: current.firstConsultationAt ?? item.createdAt ?? Date.now(),
        };
      });
      if (typeof item.consultationId === "string" && item.consultationId.length > 0) {
        setRevealConsultationId(item.consultationId);
      }
      setPendingUserQuestion(null);
      if (typeof data.remainingCredits === "number" && Number.isFinite(data.remainingCredits)) {
        setTokenBalance(data.remainingCredits);
      } else {
        // Fallback refresh for cases where response omits balance.
        window.dispatchEvent(new Event("iching:account-refresh"));
      }
      // Hard refresh from /api/account/me to guarantee UI/DB sync after consume_token.
      if (accessToken) {
        void fetch("/api/account/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((me: { tokens_available?: number } | null) => {
            if (typeof me?.tokens_available === "number" && Number.isFinite(me.tokens_available)) {
              setTokenBalance(me.tokens_available);
            }
          })
          .catch(() => {});
      }
      const today = new Date().toISOString().slice(0, 10);
      setDailyCount((prev) => {
        const next = prev + 1;
        localStorage.setItem(dailyCountStorageKey(today), String(next));
        return next;
      });
      if (oracleMode === "iching" && ichingConsultWallClockStartedAtRef.current != null) {
        const rawWallMs = Date.now() - ichingConsultWallClockStartedAtRef.current;
        lastIchingConsultWallMsRef.current = ichingRitualProcessingBudgetMs(rawWallMs);
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
      logRitualTrace("submit:error", { error: e instanceof Error ? e.message : String(e) });
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
        setRitualStatusPhase("question");
        setPhase("idle");
        setPendingUserQuestion(null);
        setManualCastPreview(null);
      }
    }
  }

  const creditsExhaustedCopy = creditsNotice
    ? creditsExhaustedBlock(creditsNotice.tier, creditsNotice.reason)
    : null;

  const onboardingUi = getOnboardingUiMessages(locale);
  const onboardingNameValid = onboardingInput.trim().length > 0;

  async function saveDisplayName() {
    if (!onboardingNameValid || !accessToken) return;
    setOnboardingSaving(true);
    try {
      const res = await fetch("/api/account/display-name", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ display_name: onboardingInput.trim() }),
      });
      if (res.ok) {
        setDisplayName(onboardingInput.trim());
        setOnboardingOpen(false);
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
        labels={LANGUAGE_LABELS}
        ariaLabel={ui.language}
      />
    </div>
  );

  return (
    <OracleShell title={t.appTitle} variant="chat">
      <div className="oracle-chat-app">
        <AmbientParticles />
        {!playPromoDismissed ? (
          <div className="oracle-play-promo-strip" role="region" aria-label={presentation.regionAria}>
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
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" focusable="false">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="oracle-play-promo-strip__titles">
                    <span className="oracle-play-promo-strip__title">{presentation.playBadgeTitle}</span>
                    <span className="oracle-play-promo-strip__subtitle">{presentation.playBadgeSubtitle}</span>
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
                  <span className="oracle-play-promo-strip__cta-label">{presentation.playInstall}</span>
                </a>
              ) : (
                <div className="oracle-play-promo-strip__main oracle-play-promo-strip__main--soon" role="status">
                  <span className="oracle-play-promo-strip__glyph" aria-hidden>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" focusable="false">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="oracle-play-promo-strip__titles">
                    <span className="oracle-play-promo-strip__title">{presentation.playBadgeTitle}</span>
                    <span className="oracle-play-promo-strip__subtitle">{presentation.playSoon}</span>
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
          <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
            <div className="onboarding-card" onClick={(e) => e.stopPropagation()}>
              {onboardingStep === "enter" ? (
                <>
                  <h2 id="onboarding-title" className="onboarding-title">{onboardingUi.title}</h2>
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
                      if (e.key === "Enter" && onboardingNameValid) setOnboardingStep("confirm");
                    }}
                  />
                  <button
                    type="button"
                    className={`composer-reading-pill${onboardingNameValid ? " is-active" : ""} onboarding-btn`}
                    disabled={!onboardingNameValid}
                    onClick={() => { if (onboardingNameValid) setOnboardingStep("confirm"); }}
                  >
                    {onboardingUi.button}
                  </button>
                </>
              ) : (
                <>
                  <h2 id="onboarding-title" className="onboarding-title">{onboardingUi.confirmTitle}</h2>
                  <p className="onboarding-name-display">{onboardingInput.trim()}</p>
                  <p className="onboarding-subtitle">{onboardingUi.confirmSubtitle}</p>
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
                <li>Plan gratuito: 2 consultas de prueba (lifetime)</li>
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
          inert={!chatsOpen}
          id="chat-drawer"
        >
          <div className="chat-drawer-header">
            <button type="button" className="chat-icon-btn" onClick={() => setChatsOpen(false)} aria-label={ui.drawerClose}>
              ✕
            </button>
            <h2>{ui.chats}</h2>
            <button
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
                <span className="sidebar-stat-key">{drawerText.consultationsToday}</span>
              </div>
              <div className="sidebar-stat-card">
                <span className="sidebar-stat-value">{visibleSessionsListed.length}</span>
                <span className="sidebar-stat-key">{drawerText.chatsWithMessages}</span>
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
                const isDeleting = pendingDeletedSessionLocalIds.includes(session.localId);
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
                      if (session.thread.length === 0 && session.sessionId) {
                        void loadSessionThread(session.sessionId, session.localId);
                      }
                    }}
                  >
                    <span className="chat-session-title">{session.title}</span>
                    <span className="chat-session-meta">
                      {isDeleting ? (
                        <>
                          <span>{drawerText.deletingConversation}</span>
                        </>
                      ) : null}
                      {loadingSessionLocalId === session.localId ? (
                        <>
                          {isDeleting ? <span aria-hidden="true">·</span> : null}
                          <span className="chat-session-loading">
                            <span className="chat-session-loading-spinner" aria-hidden="true" />
                            <span>{drawerText.loadingConversation}</span>
                          </span>
                        </>
                      ) : (
                        <>
                          {isDeleting ? <span aria-hidden="true">·</span> : null}
                          <span>
                            {session.messageCount} {drawerText.messages}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="chat-session-time">
                            {session.firstConsultationAt
                              ? new Date(session.firstConsultationAt).toLocaleString(locale, {
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
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
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

        <div className={`chat-surface${showAuthExploreCap ? " chat-surface--explore-cap" : ""}`}>
        {authReady && supabaseConfigError ? (
          <div className="auth-config-banner" role="alert">
            <span>
              {sessionUi.missingClientConfig}{" "}
              <code className="auth-gate-code">NEXT_PUBLIC_SUPABASE_URL</code> {sessionUi.missingClientConfigAnd}{" "}
              <code className="auth-gate-code">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </span>
          </div>
        ) : null}
        {authReady && !supabaseConfigError && !accessToken ? (
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
        {authReady && !supabaseConfigError && accessToken && authEmail ? (
          <div className="auth-explore-strip auth-explore-strip--session">
            <div className="auth-explore-strip-session__lead">{localeSelector}</div>
            <span className="auth-explore-strip-email" title={authEmail}>
              {authEmail}
            </span>
            <button type="button" className="auth-explore-strip-signout" onClick={() => void signOut()}>
              {ui.signOut}
            </button>
          </div>
        ) : null}
        <header className="chat-app-bar oracle-intro" style={{ marginBottom: 0, paddingBottom: 0 }}>
          <div className="chat-app-bar-row chat-app-bar-row--top">
            <div className="chat-bar-lead">
              <button
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
                border: "1px solid color-mix(in srgb, var(--accent) 68%, var(--input-border))",
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
                style={{ color: "var(--fg)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {oracleMode === "iching"
                  ? `${ichingCastingMethod === "yarrow-stalks" ? manualWizardChrome.castMethodYarrowLabel.split(" (")[0] : manualWizardChrome.castMethodCoinsLabel} · Zhu Xi · ${
                      translatorId === "wilhelm" ? "Wilhelm/Baynes" :
                      translatorId === "legge" ? "James Legge" :
                      translatorId === "zhouyi" ? "Zhou Yi" : "Master Synthesis"
                    }`
                  : ui.bonesTagline}
              </p>
            </div>
          </div>
        </header>

        <div className="chat-room">
          <section className="chat-history" ref={historyRef} style={{ paddingTop: 0, marginTop: 0 }}>
            {activeThread.length === 0 ? (
              <p className={`chat-empty-line ${historyLoading ? "chat-empty-line--loading" : ""}`}>
                {historyLoading ? drawerText.loadingConversation : emptyThreadInvite}
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
                  <div className="interpretation-stack" data-testid="interpretation-text">
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
                        mutationRule={entry.mutationRule}
                        oracleType={entry.oracleType ?? "iching"}
                        locale={locale}
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
                  {entry.oracleType === "oracle_bones" && entry.oracleBones ? (
                    <div className="reading-grid reading-grid--bones-solo">
                      <section className="hexagram-card">
                        <h3>{runtimeText.oracleBones}</h3>
                        <p className="meta-line">
                          {runtimeText.medium}: {entry.oracleBones.medium === "turtle" ? runtimeText.turtle : runtimeText.ox}
                          {entry.oracleBones.ambiguousPasses > 0
                            ? ` · ${chrome.ambiguousReadingsLabel}: ${entry.oracleBones.ambiguousPasses}`
                            : ""}
                        </p>
                        <p className="meta-line">
                          <strong>{runtimeText.chargePlus}:</strong> {entry.oracleBones.positiveCharge}
                        </p>
                        <p className="meta-line">
                          <strong>{runtimeText.chargeMinus}:</strong> {entry.oracleBones.negativeCharge}
                        </p>
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
                            {verdictLabel(entry.oracleBones.verdict, locale)}
                          </span>
                          {entry.oracleBones.affirmsPositive !== null ? (
                            <p className="meta-line">
                              {runtimeText.signReading}{" "}
                              <strong>
                                {entry.oracleBones.affirmsPositive
                                  ? runtimeText.leansPositive
                                  : runtimeText.leansNegative}
                              </strong>
                            </p>
                          ) : null}
                        </div>
                      </section>
                    </div>
                  ) : null}
                  <div className="session-actions">
                    <button type="button" className="secondary-btn" onClick={() => void exportChatPdf()}>
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

            {manualCastPreview && loading && pendingUserQuestion && phase !== "coins" ? (
              <div className="thread-block chat-entry manual-cast-preview-entry" aria-busy="true">
                <div className="chat-bubble chat-assistant manual-cast-preview-bubble">
                  <p className="meta-line manual-cast-preview-status">{manualWizardChrome.previewLoading}</p>
                  <div className="reading-record-visual-row">
                    <ConsultationRecordCard
                      consultationId="00000000-0000-4000-8000-000000000001"
                      question={pendingUserQuestion}
                      sessionPosition={activeThread.length + 1}
                      primaryHexagram={manualCastPreview.primaryHexagram}
                      primaryHexagramChinese={manualCastPreview.primaryHexagramChinese}
                      transformedHexagram={manualCastPreview.transformedHexagram}
                      mutationRule={manualCastPreview.mutationRule}
                      oracleType="iching"
                      locale={locale}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {phase === "bones" ? (
              <section className="coins-stage coins-stage--bones" data-testid="bone-ritual">
                <div className="crack-visual-wrap">
                  <BoneRitualAnimation
                    isProcessing={loading && boneRitualResult === null}
                    oracleResult={boneRitualResult}
                    verdictText={boneRitualResult ? verdictLabel(boneRitualResult, locale) : null}
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
                        const lineData = ritualLines?.find((l) => l.position === lineNum) ?? null;
                        const tick = ritualRevealTick;
                        const sourceVisible = !isAwaitingCast && tick >= lineNum * 2 - 1;
                        const transformedVisible = !isAwaitingCast && tick >= lineNum * 2;
                        const sourceYang = lineData ? lineData.value === 7 || lineData.value === 9 : lineNum % 2 === 0;
                        const transformedValue =
                          lineData?.value === 6 ? 7 : lineData?.value === 9 ? 8 : lineData?.value;
                        const transformedYang = transformedValue ? transformedValue === 7 : lineNum % 2 !== 0;
                        const isChanging = !isAwaitingCast && Boolean(lineData?.isChanging);
                        return (
                          <div key={lineNum} className="ritual-line-row" aria-hidden="true">
                            <div
                              className={`ritual-line-slot ritual-line-slot--source ${sourceVisible ? "is-visible" : ""} ${isChanging ? "is-changing" : ""} ${isAwaitingCast ? "is-placeholder" : ""}`}
                            >
                              {sourceVisible ? (sourceYang ? (
                                <span className="ritual-hex-line ritual-hex-line--yang" />
                              ) : (
                                <span className="ritual-hex-line ritual-hex-line--yin">
                                  <span />
                                  <span />
                                </span>
                              )) : null}
                            </div>
                            <div className={`ritual-arrow-slot ${sourceVisible ? "is-visible" : ""}`}>
                              <span className="ritual-arrow">→</span>
                            </div>
                            <div
                              className={`ritual-line-slot ritual-line-slot--transformed ${transformedVisible ? "is-visible" : ""} ${isChanging ? "is-changing" : ""} ${isAwaitingCast ? "is-placeholder" : ""}`}
                              style={{ transitionDelay: `${i * 60}ms` }}
                            >
                              {transformedVisible ? (transformedYang ? (
                                <span className="ritual-hex-line ritual-hex-line--yang" />
                              ) : (
                                <span className="ritual-hex-line ritual-hex-line--yin">
                                  <span />
                                  <span />
                                </span>
                              )) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ritual-final-focus" aria-hidden="true">
                      {ritualRenderOrder.map((lineNum, i) => {
                        const lineData = ritualLines?.find((l) => l.position === lineNum) ?? null;
                        const transformedValue = lineData?.value === 6 ? 7 : lineData?.value === 9 ? 8 : lineData?.value;
                        const transformedYang = transformedValue ? transformedValue === 7 : true;
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
                        cast base: <code>{ritualDebugCastVector ? ritualDebugCastVector.join(",") : "pending"}</code>
                      </p>
                      <p>
                        cast transformed:{" "}
                        <code>{ritualDebugCastTransformed ? ritualDebugCastTransformed.join(",") : "pending"}</code>
                      </p>
                      <p>
                        final base: <code>{ritualDebugFinalVector ? ritualDebugFinalVector.join(",") : "pending"}</code>
                      </p>
                      <p>
                        final transformed:{" "}
                        <code>{ritualDebugFinalTransformed ? ritualDebugFinalTransformed.join(",") : "pending"}</code>
                      </p>
                      <p>
                        match ritual/final transformed:{" "}
                        <strong>{ritualDebugMatch === null ? "pending" : ritualDebugMatch ? "YES" : "NO"}</strong>
                      </p>
                    </div>
                  ) : null}
                  </div>
              </section>
            ) : null}
            {ritualDebugEnabled && phase !== "coins" && lastRitualDebugSnapshot ? (
              <div className="ritual-debug-box ritual-debug-box--persisted">
                <p><strong>Ritual debug (persisted)</strong></p>
                <p>
                  mutationRule: <code>{lastRitualDebugSnapshot.mutationRule ?? "n/a"}</code> · transformedHex:{" "}
                  <code>{lastRitualDebugSnapshot.transformedHexagram ?? "n/a"}</code>
                </p>
                <p>
                  cast base: <code>{lastRitualDebugSnapshot.castBase.join(",")}</code>
                </p>
                <p>
                  cast transformed: <code>{lastRitualDebugSnapshot.castTransformed.join(",")}</code>
                </p>
                <p>
                  final base: <code>{lastRitualDebugSnapshot.finalBase.join(",")}</code>
                </p>
                <p>
                  final transformed: <code>{lastRitualDebugSnapshot.finalTransformed.join(",")}</code>
                </p>
                <p>
                  match ritual/final transformed: <strong>{lastRitualDebugSnapshot.match ? "YES" : "NO"}</strong>
                </p>
              </div>
            ) : null}

            {creditsExhaustedCopy ? (
              <div className="credits-notice-card" role="status">
                <p className="credits-notice-title">{creditsExhaustedCopy.title}</p>
                <p className="credits-notice-body">{creditsExhaustedCopy.body}</p>
                <p className="credits-notice-reset">{creditsExhaustedCopy.resetLine}</p>
                <div className="credits-notice-actions">
                  <button
                    type="button"
                    className="credits-notice-primary"
                    onClick={() => {
                      if (creditsExhaustedCopy.primaryCta.action === "sync-billing") {
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
                        if (creditsExhaustedCopy.secondaryCta?.action === "mailto" && creditsExhaustedCopy.secondaryCta.href) {
                          window.open(creditsExhaustedCopy.secondaryCta.href, "_blank", "noopener,noreferrer");
                          return;
                        }
                        setCreditsNotice(null);
                      }}
                    >
                      {creditsExhaustedCopy.secondaryCta.label}
                    </button>
                  ) : null}
                  <button type="button" className="credits-notice-dismiss" onClick={() => setCreditsNotice(null)}>
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

        <footer className={`chat-composer-wa${consultPanelOpen ? " is-expanded" : ""}`}>
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
                        className="composer-panel-close"
                        onClick={() => setConsultPanelOpen(false)}
                        aria-label={chrome.closeConsultPanelAria}
                      >
                        {ui.drawerClose}
                      </button>
                    </div>
                    <div className="composer-oracle-switch" role="group" aria-label={chrome.consultOracleTypeGroupAria}>
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
                            <span className="composer-switch-label">{ui.iChing}</span>
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
                            <span className="composer-switch-label">{ui.bones}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    {oracleMode === "iching" ? (
                      <>
                        <hr className="composer-panel-divider" aria-hidden />
                        <div className="cast-selector-block">
                          <span className="cast-selector-label">Traductor</span>
                          <div className="oracle-toggle-wrap oracle-toggle-wrap-4" role="group" aria-label="Fuente de Interpretación">
                            <div className="oracle-toggle-track">
                              <div className="oracle-toggle-glow" style={{ left: `${12.5 + ["wilhelm", "zhouyi", "legge", "master_combined"].indexOf(translatorId) * 25}%` }} />
                              <div className="oracle-toggle-track-line" />
                              <div className="oracle-toggle-thumb" style={{ left: `calc(${["wilhelm", "zhouyi", "legge", "master_combined"].indexOf(translatorId) * 25}% + 2px)` }}>
                                <div className="oracle-thumb-sweep" />
                              </div>
                              <div className="oracle-toggle-options-row">
                                <button
                                  type="button"
                                  className={`oracle-toggle-option ${translatorId === "wilhelm" ? "is-active" : ""}`}
                                  onClick={() => setTranslatorId("wilhelm")}
                                  disabled={loading}
                                >
                                  <span>Wilhelm</span>
                                </button>
                                <button
                                  type="button"
                                  className={`oracle-toggle-option ${translatorId === "zhouyi" ? "is-active" : ""}`}
                                  onClick={() => setTranslatorId("zhouyi")}
                                  disabled={loading}
                                >
                                  <span>Zhou Yi</span>
                                </button>
                                <button
                                  type="button"
                                  className={`oracle-toggle-option ${translatorId === "legge" ? "is-active" : ""}`}
                                  onClick={() => setTranslatorId("legge")}
                                  disabled={loading}
                                >
                                  <span>Legge</span>
                                </button>
                                <button
                                  type="button"
                                  className={`oracle-toggle-option ${translatorId === "master_combined" ? "is-active" : ""}`}
                                  onClick={() => setTranslatorId("master_combined")}
                                  disabled={loading}
                                >
                                  <span className="oracle-toggle-master-label">Master (3)</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr className="composer-panel-divider" aria-hidden />
                        <div className="cast-selector-block">
                          <span className="cast-selector-label">{manualWizardChrome.castMethodGroupAria}</span>
                          <label className="oracle-toggle-wrap">
                            <input
                              type="checkbox"
                              className="oracle-toggle-input"
                              checked={ichingCastingMethod === "yarrow-stalks"}
                              onChange={() =>
                                setIchingCastingMethod(
                                  ichingCastingMethod === "yarrow-stalks" ? "three-coins" : "yarrow-stalks",
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
                              <div className="oracle-toggle-option oracle-toggle-option--left" aria-hidden="true">
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                                  <rect x="5.5" y="5.5" width="3" height="3" stroke="currentColor" strokeWidth="1"/>
                                </svg>
                                <span>{manualWizardChrome.castMethodCoinsLabel.split(" (")[0]}</span>
                              </div>
                              <div className="oracle-toggle-option oracle-toggle-option--right" aria-hidden="true">
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                  <line x1="2.5" y1="2" x2="2.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  <line x1="5.5" y1="1" x2="5.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  <line x1="8.5" y1="2" x2="8.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  <line x1="11.5" y1="1" x2="11.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                                <span>{manualWizardChrome.castMethodYarrowLabel.split(" (")[0]}</span>
                              </div>
                            </div>
                          </label>
                        </div>
                        <hr className="composer-panel-divider" aria-hidden />
                        <div className="cast-selector-block">
                          <span className="cast-selector-label">{manualWizardChrome.castModeGroupAria}</span>
                          <label className="oracle-toggle-wrap">
                            <input
                              type="checkbox"
                              className="oracle-toggle-input"
                              checked={ichingCastMode === "manual"}
                              onChange={() =>
                                setIchingCastMode(ichingCastMode === "manual" ? "auto" : "manual")
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
                              <div className="oracle-toggle-option oracle-toggle-option--left" aria-hidden="true">
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                  <path d="M8 1.5L3.5 7.5H7L5.5 12.5L11 6H7.5L8 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
                                </svg>
                                <span>{manualWizardChrome.castAutoLabel}</span>
                              </div>
                              <div className="oracle-toggle-option oracle-toggle-option--right" aria-hidden="true">
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                  <path d="M2 10.5V12H3.5L9.5 6L8 4.5L2 10.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                                  <path d="M9.5 3L11 4.5L10 5.5L8.5 4L9.5 3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                                </svg>
                                <span>{manualWizardChrome.castManualLabel.split(" (")[0].split("（")[0].trim()}</span>
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
                            aria-label={interpolate(chrome.threadDepthReadingProgressAria, {
                              pos: result.sessionPosition,
                              cap: threadDepthCap,
                            })}
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
                    <div className="session-progress" role="group" aria-label={tokenPanel.ariaTokenGroup}>
                      <span>{tokenPanel.tokensHeading}</span>
                      <p className="meta-line tier-hint-line tier-hint-line--emphasis">
                        {tokenPanel.lastPack}{" "}
                        <strong>{tierDisplayNode}</strong>
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
                          {tokenCenterBusy ? tokenPanel.loading : tokenPanel.tokenCenter}
                        </button>
                      </div>
                      {tokenCenterMessage ? (
                        <p className="meta-line tier-hint-line tier-hint-line--emphasis" style={{ marginTop: 8 }}>
                          {tokenCenterMessage}
                        </p>
                      ) : null}
                    </div>
                    <hr className="composer-panel-divider" aria-hidden />
                    <div className="session-progress" role="group" aria-label={chrome.securityGroupAria}>
                      <span>{chrome.securityHeading}</span>
                      <p className="meta-line tier-hint-line tier-hint-line--emphasis">
                        {chrome.statusLabel}{" "}
                        <strong>
                          {twoFactorEnabled ? chrome.enabled : chrome.disabled}
                        </strong>
                        {twoFactorMethod ? `${chrome.methodPrefix}${twoFactorMethod.toUpperCase()}` : ""}
                      </p>
                      <p className="meta-line tier-hint-line">{chrome.securityConfigureHint}</p>
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
                    <div className="session-progress" role="group" aria-label={chrome.libraryGroupAria}>
                      <span>{chrome.libraryHeading}</span>
                      <p className="meta-line tier-hint-line">{chrome.libraryDescription}</p>
                      <div className="composer-panel-actions">
                        <button
                          type="button"
                          className="composer-reading-pill is-active"
                          onClick={() => router.push("/library")}
                          disabled={!accessToken || tier === "free"}
                        >
                          {chrome.openLibrary}
                        </button>
                      </div>
                    </div>
                    <div className="composer-doc-links" aria-label={chrome.docLinksAria}>
                      <Link href="/guia#primeros-pasos">{docNav.userGuide}</Link>
                      <Link href="/notes">{docNav.methodNotesLong}</Link>
                      <Link href="/privacy">{docNav.privacyPolicy}</Link>
                      <Link href="/terms">{docNav.termsOfService}</Link>
                      <Link href="/faqs">{docNav.faqs}</Link>
                      <Link href="/about">{docNav.aboutShort}</Link>
                    </div>
                  </section>
                </div>
              </div>

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
                      background: "linear-gradient(180deg, rgba(16,31,45,0.98), rgba(9,20,31,0.98))",
                      boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
                      padding: 14,
                      maxHeight: "82vh",
                      overflowY: "auto",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <strong style={{ color: "#d8edf5" }}>
                        {twoFactorModalMode === "challenge" ? tf.challengeTitle : tf.manageTitle}
                      </strong>
                      {twoFactorModalMode === "manage" ? (
                        <button
                          type="button"
                          className="modal-close-x"
                          aria-label={tf.closeDialogAria}
                          title={ui.drawerClose}
                          onClick={() => setTwoFactorModalOpen(false)}
                          disabled={twoFactorBusy || (twoFactorRecoveryCodes.length > 0 && !twoFactorRecoveryAck)}
                        >
                          ×
                        </button>
                      ) : null}
                    </div>
                    <p className="meta-line tier-hint-line" style={{ marginTop: 8 }}>
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
                      <p className="meta-line tier-hint-line tier-hint-line--error" style={{ marginTop: 6 }}>
                        {twoFactorError}
                      </p>
                    ) : null}
                    {twoFactorInfo ? (
                      <p className="meta-line tier-hint-line tier-hint-line--success" style={{ marginTop: 6 }}>
                        {twoFactorInfo}
                      </p>
                    ) : null}

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      {twoFactorModalMode === "challenge" ? (
                        <span
                          className="composer-reading-pill is-active"
                          style={{ flex: "0 1 auto", minWidth: 0, paddingInline: "0.9rem" }}
                        >
                          {preferredTwoFactorMethod === "email" ? tf.badgeEmailCode : tf.badgeTotp}
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
                          style={{ flex: "0 1 auto", minWidth: 0, paddingInline: "0.85rem" }}
                        >
                          {tf.chooseAnotherMethod}
                        </button>
                      ) : null}
                    </div>

                    {twoFactorModalMode === "challenge" &&
                    twoFactorChallengeMethod === "totp" &&
                    twoFactorRecoveryAssistMode === "hidden" ? (
                      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
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
                        <p className="meta-line tier-hint-line">{tf.totpSetupSteps}</p>
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
                          style={{ width: 160, height: 160, borderRadius: 8, background: "#fff" }}
                        />
                        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
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
                            disabled={twoFactorBusy || twoFactorCode.trim().length < 6}
                          >
                            {tf.verify}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {twoFactorModalMode === "challenge" &&
                    twoFactorChallengeMethod === "email" &&
                    !twoFactorEmailSent ? (
                      <p className="meta-line tier-hint-line" style={{ marginTop: 8 }}>
                        {tf.challengeEmailBeforeSend}
                      </p>
                    ) : null}

                    {twoFactorModalMode === "manage" &&
                    twoFactorSetupMethod === "email" &&
                    !twoFactorEmailSent &&
                    twoFactorRecoveryCodes.length === 0 ? (
                      <div style={{ marginTop: 10 }}>
                        <p className="meta-line tier-hint-line">{tf.sendEmailHintManage}</p>
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

                    {((twoFactorModalMode === "manage" && twoFactorSetupMethod === "email" && twoFactorEmailSent) ||
                      (twoFactorModalMode === "challenge" &&
                        twoFactorChallengeMethod === "email" &&
                        twoFactorRecoveryAssistMode === "hidden")) ? (
                      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          type="text"
                          value={twoFactorEmailCode}
                          onChange={(e) => setTwoFactorEmailCode(e.target.value)}
                          placeholder={tf.emailCodePlaceholder}
                          className="composer-input"
                          style={{ maxWidth: 220 }}
                        />
                        {twoFactorModalMode === "manage" ? (
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            onClick={() => void verifyEmailTwoFactorCode()}
                            disabled={twoFactorBusy || twoFactorEmailCode.trim().length < 6}
                          >
                            {tf.verifyEmail}
                          </button>
                        ) : null}
                      </div>
                    ) : null}

                    {twoFactorModalMode === "challenge" && twoFactorRecoveryAssistMode === "options" ? (
                      <div
                        style={{
                          marginTop: 10,
                          border: "1px solid rgba(84,160,186,0.35)",
                          borderRadius: 12,
                          padding: "10px 12px",
                        }}
                      >
                        <p className="meta-line tier-hint-line" style={{ margin: 0 }}>
                          {tf.recoveryOptionsIntro}
                        </p>
                        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            style={{ flex: "0 1 auto", minWidth: 0, paddingInline: "0.9rem" }}
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
                            style={{ flex: "0 1 auto", minWidth: 0, paddingInline: "0.9rem" }}
                            onClick={() => setTwoFactorRecoveryAssistMode("contact_support")}
                            disabled={twoFactorBusy}
                          >
                            {tf.iDontHaveRecoveryCodes}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {twoFactorModalMode === "challenge" && twoFactorRecoveryAssistMode === "enter_code" ? (
                      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          type="text"
                          value={twoFactorRecoveryCode}
                          onChange={(e) => setTwoFactorRecoveryCode(e.target.value)}
                          placeholder={tf.recoveryCodePlaceholder}
                          className="composer-input"
                          style={{ maxWidth: 320 }}
                        />
                      </div>
                    ) : null}

                    {twoFactorModalMode === "challenge" && twoFactorRecoveryAssistMode === "contact_support" ? (
                      <div
                        style={{
                          marginTop: 10,
                          border: "1px solid rgba(84,160,186,0.35)",
                          borderRadius: 12,
                          padding: "10px 12px",
                        }}
                      >
                        <p className="meta-line tier-hint-line" style={{ margin: 0 }}>
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

                    {twoFactorRecoveryCodes.length > 0 && twoFactorModalMode === "manage" ? (
                      <div style={{ marginTop: 10 }}>
                        <p className="meta-line tier-hint-line">
                          {tf.recoveryCodesShownOnce}{" "}
                          <code>{twoFactorRecoveryCodes.join(" · ")}</code>
                        </p>
                        <label
                          className="meta-line tier-hint-line"
                          style={{ display: "flex", gap: 8, alignItems: "center" }}
                        >
                          <input
                            type="checkbox"
                            checked={twoFactorRecoveryAck}
                            onChange={(e) => setTwoFactorRecoveryAck(e.target.checked)}
                          />
                          <span>{tf.recoveryAckCheckbox}</span>
                        </label>
                        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            disabled={twoFactorBusy || !twoFactorRecoveryAck}
                            style={{ flex: "0 1 auto", minWidth: 0, paddingInline: "0.95rem" }}
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
                      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {twoFactorChallengeMethod === "email" && twoFactorRecoveryAssistMode === "hidden" ? (
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            onClick={() => void sendEmailTwoFactorCode()}
                            disabled={twoFactorBusy || !accessToken}
                            style={{ flex: "0 1 auto", minWidth: 0, paddingInline: "0.95rem" }}
                          >
                            {twoFactorBusy ? tf.sending : tf.sendEmailCode}
                          </button>
                        ) : null}
                        {twoFactorRecoveryAssistMode === "hidden" || twoFactorRecoveryAssistMode === "enter_code" ? (
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
                            style={{ flex: "0 1 auto", minWidth: 0, paddingInline: "0.95rem" }}
                          >
                            {twoFactorRecoveryAssistMode === "enter_code"
                              ? tf.validateRecoveryCode
                              : tf.continueWithVerification}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                    {twoFactorModalMode === "challenge" ? (
                      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {twoFactorRecoveryAssistMode === "hidden" && twoFactorChallengeFailures >= 2 ? (
                          <button
                            type="button"
                            className="composer-reading-pill"
                            onClick={() => {
                              setTwoFactorRecoveryAssistMode("options");
                              setTwoFactorError(null);
                            }}
                            disabled={twoFactorBusy}
                            style={{ flex: "0 1 auto", minWidth: 0, paddingInline: "0.95rem" }}
                          >
                            {tf.cannotVerifyLink}
                          </button>
                        ) : null}
                        {twoFactorRecoveryAssistMode !== "hidden" ? (
                          <button
                            type="button"
                            className="composer-reading-pill"
                            style={{ flex: "0 1 auto", minWidth: 0, paddingInline: "0.95rem" }}
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
                          onClick={() => void signOut()}
                          style={{ flex: "0 1 auto", minWidth: 0, paddingInline: "0.95rem" }}
                        >
                          {ui.signOut}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {tokenCenterOpen ? (
                <div role="dialog" aria-modal="true" className="token-center-backdrop">
                  <div className="token-center-card">
                    <div className="token-center-header">
                      <strong className="token-center-title">{tokenPanel.tokenCenter}</strong>
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

                    <details className="token-center-pack-details" style={{ marginTop: 10 }}>
                      <summary className="meta-line tier-hint-line" style={{ cursor: "pointer" }}>
                        {chrome.tokenCenterPackDetailsSummary}
                      </summary>
                      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                        <p
                          className="meta-line tier-hint-line token-center-message"
                          style={{ margin: 0 }}
                        >
                          <strong>{chrome.freePlanLabel}</strong> {getFreeTierMarketing(locale)}
                        </p>
                        {PACK_IDS_ORDERED.map((packId) => {
                          const pack = TOKEN_PACKS[packId];
                          return (
                            <p
                              key={packId}
                              className="meta-line tier-hint-line token-center-message"
                              style={{ margin: 0 }}
                            >
                              <strong>{pack.label}:</strong> {getPackMarketingLine(packId, locale)}
                            </p>
                          );
                        })}
                      </div>
                    </details>

                    <div className="token-center-grid">
                      <p className="meta-line tier-hint-line token-center-row">
                        <span>{tokenPanel.lastPack}</span> <strong>{tierDisplayNode}</strong>
                      </p>
                      <p className="meta-line tier-hint-line token-center-row">
                        <span>{tokenPanel.availableBalance}</span> <strong>{tokenBalance ?? "…"}</strong>
                      </p>
                      <p className="meta-line tier-hint-line token-center-row">
                        <span>{tokenPanel.threadCapShort}</span> <strong>{accountSessionLimit}</strong>
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
                              setTokenCenterMessage(pricingUi.errorCheckout);
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
                      <Link href="/guia#planes">{tokenPanel.tokenCenterGuideLink}</Link>
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
                  <p className="composer-session-limit-text">{tokenPanel.consultThreadLimitStrip}</p>
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
                  type="button"
                  className="composer-options-btn"
                  aria-expanded={consultPanelOpen}
                  aria-controls="consult-panel"
                  aria-label={consultPanelOpen ? chrome.closeConsultOptionsAria : chrome.openConsultOptionsAria}
                  disabled={loading}
                  onClick={() => setConsultPanelOpen((o) => !o)}
                >
                  <span aria-hidden>{consultPanelOpen ? "▾" : "☰"}</span>
                  <span className="composer-mode-tag">{ui.options}</span>
                </button>
                <div className="composer-input-row">
                  <textarea
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
                    maxLength={1500}
                    readOnly={threadLimitReachedUi}
                    aria-disabled={threadLimitReachedUi}
                  />
                  <button
                    type="button"
                    data-testid="consult-btn"
                      disabled={loading || threadLimitReachedUi}
                    onClick={() => void onConsult()}
                    aria-label={loading ? chrome.sendAriaSending : chrome.sendAriaSend}
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
        style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
      >
        <h2>The Original I Ching App: AI Oracle, Hexagram Readings and Bone Oracle</h2>
        <p>Consult the I Ching or the Oracle Bones with AI-powered interpretations, ritual animation, hexagram image generation, and persistent chat history. Available in 11 languages. No subscriptions. Consumable token packs only. Free trial included.</p>
        <p>Divination methods: three-coin I Ching (Zhu Xi tradition, Wilhelm/Baynes), Oracle Bones (Shang-era crack reading), AI interpretation via Claude.</p>
        <p>Features: image generation by tier, chat export to PDF, 45-minute idle timeout, Google OAuth, two-factor authentication, dark and light mode, Android APK.</p>
      </section>
    </OracleShell>
  );
}