"use client";

import { CONTEXT_LIMITS } from "@iching-oracle/context-engine";
import { OracleShell } from "@iching-oracle/ui";
import { commonStrings, DEFAULT_LOCALE, SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";
import type { OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { ConsultationRecordCard } from "@/components/ConsultationRecordCard";
import { CrackPatternGraphic } from "@/components/CrackPatternGraphic";
import { OracleInterpretationMarkdown } from "@/components/OracleInterpretationMarkdown";
import Link from "next/link";
import { ReadingOracleImage } from "@/components/ReadingOracleImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isPersistableUuid } from "@/lib/session-ids";
import { getSupabaseBrowser, isSupabaseBrowserConfigured } from "@/lib/supabase-browser";
import { interpretationMarkdownToPdfBlocks } from "@/lib/pdf-chat-export";
import { creditsExhaustedBlock, type BillingTier } from "@/lib/credits-ui-copy";
import { stripInterpretationFluff } from "@/lib/response-clean";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PLANS_HREF = "/pricing";

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
  createdAt?: number;
  sessionId: string | null;
  sessionPosition: number;
  canDeepen: boolean;
  publicReadingId: string;
  publicSessionId: string;
  sharingPersisted?: boolean;
};

type ConsultationItem = ConsultResponse & { question: string };
type Tier = "free" | "seeker" | "practitioner" | "master" | "oracle";
type CreditsType = "monthly" | "lifetime";
type ResponseMode = "directo" | "ritual" | "profundizar";
type OracleMode = "iching" | "oracle_bones";

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
};

const DRAWER_TEXT: Record<
  AppLocale,
  {
    activity: string;
    streak: string;
    consultationsToday: string;
    chatsWithMessages: string;
    loading: string;
    onlyThreads: string;
    noSaved: string;
    messages: string;
    deleteConversation: string;
  }
> = {
  es: {
    activity: "Tu actividad",
    streak: "Racha (días)",
    consultationsToday: "Consultas hoy",
    chatsWithMessages: "Chats con mensajes",
    loading: "Canalizando consulta…",
    onlyThreads: "Solo se listan hilos con al menos una lectura.",
    noSaved: "Aún no hay conversaciones guardadas. Envía una consulta para verla aquí.",
    messages: "mensajes",
    deleteConversation: "Eliminar conversación",
  },
  en: {
    activity: "Your activity",
    streak: "Streak (days)",
    consultationsToday: "Consultations today",
    chatsWithMessages: "Chats with messages",
    loading: "Channeling consultation…",
    onlyThreads: "Only threads with at least one reading are listed.",
    noSaved: "No saved conversations yet. Send a consultation to see it here.",
    messages: "messages",
    deleteConversation: "Delete conversation",
  },
  pt: {
    activity: "Sua atividade",
    streak: "Sequência (dias)",
    consultationsToday: "Consultas hoje",
    chatsWithMessages: "Chats com mensagens",
    loading: "Canalizando consulta…",
    onlyThreads: "Somente fios com ao menos uma leitura são listados.",
    noSaved: "Ainda não há conversas salvas. Envie uma consulta para vê-la aqui.",
    messages: "mensagens",
    deleteConversation: "Excluir conversa",
  },
  fr: {
    activity: "Votre activité",
    streak: "Série (jours)",
    consultationsToday: "Consultations aujourd'hui",
    chatsWithMessages: "Chats avec messages",
    loading: "Canalisation en cours…",
    onlyThreads: "Seuls les fils avec au moins une lecture sont listés.",
    noSaved: "Aucune conversation enregistrée pour le moment.",
    messages: "messages",
    deleteConversation: "Supprimer la conversation",
  },
  de: {
    activity: "Deine Aktivität",
    streak: "Serie (Tage)",
    consultationsToday: "Heutige Konsultationen",
    chatsWithMessages: "Chats mit Nachrichten",
    loading: "Konsultation wird kanalisiert…",
    onlyThreads: "Nur Threads mit mindestens einer Lesung werden gelistet.",
    noSaved: "Noch keine gespeicherten Konversationen.",
    messages: "Nachrichten",
    deleteConversation: "Konversation löschen",
  },
  it: {
    activity: "La tua attività",
    streak: "Serie (giorni)",
    consultationsToday: "Consultazioni oggi",
    chatsWithMessages: "Chat con messaggi",
    loading: "Canalizzazione in corso…",
    onlyThreads: "Sono elencati solo i thread con almeno una lettura.",
    noSaved: "Nessuna conversazione salvata al momento.",
    messages: "messaggi",
    deleteConversation: "Elimina conversazione",
  },
  ja: {
    activity: "あなたの履歴",
    streak: "連続日数",
    consultationsToday: "本日の相談",
    chatsWithMessages: "メッセージ付きチャット",
    loading: "相談を生成中…",
    onlyThreads: "少なくとも1件の読みがあるスレッドのみ表示されます。",
    noSaved: "保存された会話はまだありません。",
    messages: "件のメッセージ",
    deleteConversation: "会話を削除",
  },
  zh: {
    activity: "你的活动",
    streak: "连续天数",
    consultationsToday: "今日咨询",
    chatsWithMessages: "有消息的聊天",
    loading: "正在生成咨询…",
    onlyThreads: "仅显示至少含1次解读的线程。",
    noSaved: "暂时没有已保存的对话。",
    messages: "条消息",
    deleteConversation: "删除对话",
  },
  ko: {
    activity: "활동 내역",
    streak: "연속 일수",
    consultationsToday: "오늘의 상담",
    chatsWithMessages: "메시지가 있는 채팅",
    loading: "상담 생성 중…",
    onlyThreads: "최소 한 번의 리딩이 있는 스레드만 표시됩니다.",
    noSaved: "저장된 대화가 아직 없습니다.",
    messages: "개의 메시지",
    deleteConversation: "대화 삭제",
  },
};

const LOCALE_STORAGE_KEY = "iching_ui_locale_v1";

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
};

type UiCopy = {
  language: string;
  chats: string;
  signIn: string;
  signOut: string;
  plan: string;
  options: string;
  mode: string;
  readMode: string;
  writeConsultation: string;
  positiveCharge: string;
  threadLimitReached: string;
  sessionNew: string;
  drawerClose: string;
  iChing: string;
  bones: string;
  iChingTagline: string;
  bonesTagline: string;
  modeIChingHint: string;
  modeBonesHint: string;
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
    plan: "Plan",
    options: "Opciones",
    mode: "Modo",
    readMode: "Modo lectura",
    writeConsultation: "Escribe tu consulta…",
    positiveCharge: "Cargo positivo (afirmación)…",
    threadLimitReached: "Límite de hilo alcanzado — usa «Nueva sesión» arriba",
    sessionNew: "Nueva sesión",
    drawerClose: "Cerrar",
    iChing: "I Ching",
    bones: "Huesos",
    iChingTagline: "Tres monedas · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Grietas 兆 (estilo Shang) · sí / no sobre cargos",
    modeIChingHint: "Seis líneas y tres monedas por línea; mutación Zhu Xi.",
    modeBonesHint: "Pregunta sí / no con cargo afirmativo; lectura por grietas 兆.",
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
    plan: "Plan",
    options: "Options",
    mode: "Mode",
    readMode: "Reading mode",
    writeConsultation: "Type your consultation…",
    positiveCharge: "Positive charge (affirmation)…",
    threadLimitReached: "Thread limit reached — use \"New session\" above",
    sessionNew: "New session",
    drawerClose: "Close",
    iChing: "I Ching",
    bones: "Bones",
    iChingTagline: "Three coins · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Cracks 兆 (Shang style) · yes / no by charge",
    modeIChingHint: "Six lines and three coins per line; Zhu Xi mutation.",
    modeBonesHint: "Yes / no by affirmative charge; crack reading 兆.",
    emptyInviteMorning: "Good time to consult the oracle. What concern comes with this new day?",
    emptyInviteAfternoon: "Change keeps moving. What do you need to see more clearly today?",
    emptyInviteNight: "The night also asks. Which part of your life do you want to explore?",
  },
  pt: {
    language: "Idioma",
    chats: "Conversas",
    signIn: "Entrar",
    signOut: "Sair",
    plan: "Plano",
    options: "Opções",
    mode: "Modo",
    readMode: "Modo de leitura",
    writeConsultation: "Escreva sua consulta…",
    positiveCharge: "Cargo positivo (afirmação)…",
    threadLimitReached: "Limite do fio atingido — use «Nova sessão» acima",
    sessionNew: "Nova sessão",
    drawerClose: "Fechar",
    iChing: "I Ching",
    bones: "Ossos",
    iChingTagline: "Três moedas · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Fissuras 兆 (estilo Shang) · sim / não por cargo",
    modeIChingHint: "Seis linhas e três moedas por linha; mutação Zhu Xi.",
    modeBonesHint: "Pergunta sim / não com cargo afirmativo; leitura por fissuras 兆.",
    emptyInviteMorning: "Bom momento para ouvir o oráculo. Que inquietação traz este novo dia?",
    emptyInviteAfternoon: "A mudança continua. O que você precisa ver com mais clareza hoje?",
    emptyInviteNight: "A noite também pergunta. Qual frente da sua vida você quer explorar?",
  },
  fr: {
    language: "Langue",
    chats: "Discussions",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    plan: "Forfait",
    options: "Options",
    mode: "Mode",
    readMode: "Mode de lecture",
    writeConsultation: "Écris ta consultation…",
    positiveCharge: "Charge positive (affirmation)…",
    threadLimitReached: "Limite du fil atteinte — utilisez « Nouvelle session »",
    sessionNew: "Nouvelle session",
    drawerClose: "Fermer",
    iChing: "I Ching",
    bones: "Os",
    iChingTagline: "Trois pièces · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Fissures 兆 (style Shang) · oui / non par charge",
    modeIChingHint: "Six lignes et trois pièces par ligne ; mutation Zhu Xi.",
    modeBonesHint: "Question oui / non avec charge affirmative ; lecture des fissures 兆.",
    emptyInviteMorning: "Bon moment pour écouter l'oracle. Quelle préoccupation t'accompagne aujourd'hui ?",
    emptyInviteAfternoon: "Le changement continue. Que dois-tu voir plus clairement aujourd'hui ?",
    emptyInviteNight: "La nuit pose aussi des questions. Quelle partie de ta vie veux-tu explorer ?",
  },
  de: {
    language: "Sprache",
    chats: "Chats",
    signIn: "Anmelden",
    signOut: "Abmelden",
    plan: "Plan",
    options: "Optionen",
    mode: "Modus",
    readMode: "Lesemodus",
    writeConsultation: "Schreibe deine Frage…",
    positiveCharge: "Positive Ladung (Bejahung)…",
    threadLimitReached: "Thread-Limit erreicht — oben «Neue Sitzung» verwenden",
    sessionNew: "Neue Sitzung",
    drawerClose: "Schließen",
    iChing: "I Ching",
    bones: "Knochen",
    iChingTagline: "Drei Münzen · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Risse 兆 (Shang-Stil) · Ja / Nein nach Ladung",
    modeIChingHint: "Sechs Linien und drei Münzen pro Linie; Zhu-Xi-Mutation.",
    modeBonesHint: "Ja/Nein-Frage mit positiver Ladung; Risslesung 兆.",
    emptyInviteMorning: "Guter Zeitpunkt für das Orakel. Welche Frage bringt dieser Tag mit sich?",
    emptyInviteAfternoon: "Der Wandel geht weiter. Was musst du heute klarer sehen?",
    emptyInviteNight: "Auch die Nacht fragt. Welchen Bereich deines Lebens möchtest du erkunden?",
  },
  it: {
    language: "Lingua",
    chats: "Chat",
    signIn: "Accedi",
    signOut: "Esci",
    plan: "Piano",
    options: "Opzioni",
    mode: "Modalità",
    readMode: "Modalità lettura",
    writeConsultation: "Scrivi la tua consultazione…",
    positiveCharge: "Carica positiva (affermazione)…",
    threadLimitReached: "Limite del thread raggiunto — usa «Nuova sessione»",
    sessionNew: "Nuova sessione",
    drawerClose: "Chiudi",
    iChing: "I Ching",
    bones: "Ossa",
    iChingTagline: "Tre monete · Zhu Xi · Wilhelm/Baynes",
    bonesTagline: "Crepe 兆 (stile Shang) · sì / no per carica",
    modeIChingHint: "Sei linee e tre monete per linea; mutazione Zhu Xi.",
    modeBonesHint: "Domanda sì / no con carica affermativa; lettura delle crepe 兆.",
    emptyInviteMorning: "Momento ideale per l'oracolo. Quale inquietudine porta questo nuovo giorno?",
    emptyInviteAfternoon: "Il cambiamento continua. Cosa devi vedere con più chiarezza oggi?",
    emptyInviteNight: "Anche la notte fa domande. Quale fronte della tua vita vuoi esplorare?",
  },
  ja: {
    language: "言語",
    chats: "チャット",
    signIn: "ログイン",
    signOut: "ログアウト",
    plan: "プラン",
    options: "オプション",
    mode: "モード",
    readMode: "読解モード",
    writeConsultation: "相談内容を入力…",
    positiveCharge: "肯定の問い（肯定電荷）…",
    threadLimitReached: "スレッド上限です — 上の「新しいセッション」を使用",
    sessionNew: "新しいセッション",
    drawerClose: "閉じる",
    iChing: "I Ching",
    bones: "骨占",
    iChingTagline: "三枚の硬貨 · 朱熹 · ヴィルヘルム/ベインズ",
    bonesTagline: "亀裂 兆（殷様式）· 問いの肯否",
    modeIChingHint: "六爻、各爻に三枚の硬貨。朱熹の変爻法。",
    modeBonesHint: "肯定電荷による Yes/No。亀裂 兆 の読解。",
    emptyInviteMorning: "いまは託宣に向いた時間。今日の不安を問いにしてみましょう。",
    emptyInviteAfternoon: "変化は動き続けています。今日、何をより明確に見たいですか。",
    emptyInviteNight: "夜もまた問いを生みます。人生のどの面を探りますか。",
  },
  zh: {
    language: "语言",
    chats: "聊天",
    signIn: "登录",
    signOut: "退出登录",
    plan: "方案",
    options: "选项",
    mode: "模式",
    readMode: "解读模式",
    writeConsultation: "输入你的咨询…",
    positiveCharge: "正向命题（肯定）…",
    threadLimitReached: "线程已达上限 — 请使用“新会话”",
    sessionNew: "新会话",
    drawerClose: "关闭",
    iChing: "I Ching",
    bones: "甲骨",
    iChingTagline: "三枚铜钱 · 朱熹 · Wilhelm/Baynes",
    bonesTagline: "裂纹 兆（商式）· 依命题判断是/否",
    modeIChingHint: "六爻，每爻三枚铜钱；朱熹变爻法。",
    modeBonesHint: "以肯定命题进行是/否占；裂纹 兆 解读。",
    emptyInviteMorning: "此刻适合聆听神谕。今天你带着什么问题而来？",
    emptyInviteAfternoon: "变化仍在流动。今天你需要看清什么？",
    emptyInviteNight: "夜晚也会发问。你想探索人生的哪一面？",
  },
  ko: {
    language: "언어",
    chats: "채팅",
    signIn: "로그인",
    signOut: "로그아웃",
    plan: "플랜",
    options: "옵션",
    mode: "모드",
    readMode: "해석 모드",
    writeConsultation: "질문을 입력하세요…",
    positiveCharge: "긍정 명제(affirmation)…",
    threadLimitReached: "스레드 한도 도달 — 위의 «새 세션» 사용",
    sessionNew: "새 세션",
    drawerClose: "닫기",
    iChing: "I Ching",
    bones: "골복",
    iChingTagline: "세 동전 · 주희 · Wilhelm/Baynes",
    bonesTagline: "균열 兆 (상식) · 긍정 명제로 예/아니오",
    modeIChingHint: "육효, 효마다 동전 3개; 주희 변효 규칙.",
    modeBonesHint: "긍정 명제로 예/아니오 질문; 균열 兆 해석.",
    emptyInviteMorning: "지금은 오라클에 귀 기울이기 좋은 시간입니다. 어떤 고민이 있나요?",
    emptyInviteAfternoon: "변화는 계속 움직입니다. 오늘 무엇을 더 분명히 보고 싶나요?",
    emptyInviteNight: "밤도 질문합니다. 삶의 어떤 영역을 탐색하고 싶나요?",
  },
};

function responseModeLabel(mode: ResponseMode, locale: AppLocale): string {
  const byLocale: Record<AppLocale, Record<ResponseMode, string>> = {
    es: { directo: "Directo", ritual: "Ritual", profundizar: "Profundizar" },
    en: { directo: "Direct", ritual: "Ritual", profundizar: "Deepen" },
    pt: { directo: "Direto", ritual: "Ritual", profundizar: "Aprofundar" },
    fr: { directo: "Direct", ritual: "Rituel", profundizar: "Approfondir" },
    de: { directo: "Direkt", ritual: "Ritual", profundizar: "Vertiefen" },
    it: { directo: "Diretto", ritual: "Rituale", profundizar: "Approfondire" },
    ja: { directo: "直截", ritual: "儀礼", profundizar: "深化" },
    zh: { directo: "直接", ritual: "仪式", profundizar: "深入" },
    ko: { directo: "직접", ritual: "의식", profundizar: "심화" },
  };
  return byLocale[locale][mode];
}

function verdictLabel(v: OracleBonesVerdict, locale: AppLocale): string {
  const mapByLocale: Record<AppLocale, Record<OracleBonesVerdict, string>> = {
    es: {
      auspicious_clear: "吉 — favorable claro (carga positiva)",
      auspicious_moderate: "吉 — favorable moderado",
      inauspicious_moderate: "凶 — desfavorable moderado",
      inauspicious_clear: "凶 — desfavorable claro (carga negativa)",
      silent: "Sin respuesta clara — silencio ancestral",
    },
    en: {
      auspicious_clear: "吉 — clear favorable (positive charge)",
      auspicious_moderate: "吉 — moderate favorable",
      inauspicious_moderate: "凶 — moderate unfavorable",
      inauspicious_clear: "凶 — clear unfavorable (negative charge)",
      silent: "No clear answer — ancestral silence",
    },
    pt: {
      auspicious_clear: "吉 — favorável claro (carga positiva)",
      auspicious_moderate: "吉 — favorável moderado",
      inauspicious_moderate: "凶 — desfavorável moderado",
      inauspicious_clear: "凶 — desfavorável claro (carga negativa)",
      silent: "Sem resposta clara — silêncio ancestral",
    },
    fr: {
      auspicious_clear: "吉 — favorable net (charge positive)",
      auspicious_moderate: "吉 — favorable modéré",
      inauspicious_moderate: "凶 — défavorable modéré",
      inauspicious_clear: "凶 — défavorable net (charge négative)",
      silent: "Pas de réponse claire — silence ancestral",
    },
    de: {
      auspicious_clear: "吉 — klar günstig (positive Ladung)",
      auspicious_moderate: "吉 — mäßig günstig",
      inauspicious_moderate: "凶 — mäßig ungünstig",
      inauspicious_clear: "凶 — klar ungünstig (negative Ladung)",
      silent: "Keine klare Antwort — Ahnenstille",
    },
    it: {
      auspicious_clear: "吉 — favorevole chiaro (carica positiva)",
      auspicious_moderate: "吉 — favorevole moderato",
      inauspicious_moderate: "凶 — sfavorevole moderato",
      inauspicious_clear: "凶 — sfavorevole chiaro (carica negativa)",
      silent: "Nessuna risposta chiara — silenzio ancestrale",
    },
    ja: {
      auspicious_clear: "吉 — 明確に吉（正の荷）",
      auspicious_moderate: "吉 — 中庸の吉",
      inauspicious_moderate: "凶 — 中庸の凶",
      inauspicious_clear: "凶 — 明確に凶（負の荷）",
      silent: "明確な答えなし — 祖の沈黙",
    },
    zh: {
      auspicious_clear: "吉 — 明确吉（正向命题）",
      auspicious_moderate: "吉 — 中度吉",
      inauspicious_moderate: "凶 — 中度凶",
      inauspicious_clear: "凶 — 明确凶（负向命题）",
      silent: "无明确答案 — 祖灵沉默",
    },
    ko: {
      auspicious_clear: "吉 — 뚜렷한 길(긍정 전하)",
      auspicious_moderate: "吉 — 보통의 길",
      inauspicious_moderate: "凶 — 보통의 흉",
      inauspicious_clear: "凶 — 뚜렷한 흉(부정 전하)",
      silent: "명확한 답 없음 — 조상의 침묵",
    },
  };
  return mapByLocale[locale][v];
}
type ChatSessionState = {
  localId: string;
  title: string;
  sessionId: string | null;
  /** Last known public id for /s/… links (synced from API). */
  publicSessionId: string | null;
  thread: ConsultationItem[];
  messageCount: number;
  updatedAt: number;
  firstConsultationAt: number | null;
};

type ApiChatSession = {
  sessionId: string;
  title: string;
  themeCategory: string;
  language: string;
  publicId: string;
  consultationIds: string[];
  createdAt: number;
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
    messageCount: 0,
    updatedAt: Date.now(),
    firstConsultationAt: null,
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

function mapApiConsultationToItem(
  c: ApiChatConsultation,
  sessionPublicId: string,
): ConsultationItem {
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
    canDeepen: true,
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
  const [locale, setLocale] = useState<AppLocale>(DEFAULT_LOCALE);
  const ui = UI_COPY[locale];
  const t = commonStrings[locale];
  const isSpanish = locale === "es";
  const runtimeText = RUNTIME_TEXT[locale];
  const drawerText = DRAWER_TEXT[locale];
  const exportPdfLabel = isSpanish ? "Exportar chat PDF" : "Export chat PDF";
  const downloadImageLabel = isSpanish ? "Descargar imagen" : "Download image";
  const openImageLabel = isSpanish ? "Abrir imagen en tamaño completo" : "Open full-size image";
  const symbolicImageAlt = isSpanish ? "Representación simbólica del trazado" : "Symbolic reading image";
  const inProgressTitle = locale === "es" ? "Consulta en progreso" : "Consultation in progress";
  const knownNewSessionTitles = useMemo(() => {
    return new Set<string>(SUPPORTED_LOCALES.map((code) => UI_COPY[code].sessionNew));
  }, []);
  const knownInProgressTitles = useMemo(() => new Set<string>(["Consulta en progreso", "Consultation in progress"]), []);
  const [tier, setTier] = useState<Tier>("free");
  const [monthlyCreditsLimit, setMonthlyCreditsLimit] = useState(2);
  const [creditsType, setCreditsType] = useState<CreditsType>("lifetime");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(null);
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [twoFactorQrDataUrl, setTwoFactorQrDataUrl] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorEmailCode, setTwoFactorEmailCode] = useState("");
  const [twoFactorEmailSent, setTwoFactorEmailSent] = useState(false);
  const [twoFactorRecoveryCodes, setTwoFactorRecoveryCodes] = useState<string[]>([]);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorModalMode, setTwoFactorModalMode] = useState<"manage" | "challenge">("manage");
  const [secondFactorVerified, setSecondFactorVerified] = useState(false);
  const [subscriptionCreditsRemaining, setSubscriptionCreditsRemaining] = useState<number | null>(null);
  const [subscriptionCycleEnd, setSubscriptionCycleEnd] = useState<string | null>(null);
  const [pendingUserQuestion, setPendingUserQuestion] = useState<string | null>(null);
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [manageSubBusy, setManageSubBusy] = useState(false);
  const [manageSubMessage, setManageSubMessage] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<HTMLElement | null>(null);
  const [chatsOpen, setChatsOpen] = useState(false);
  const [consultPanelOpen, setConsultPanelOpen] = useState(false);
  /** Shown when user tries to consult without a session (gentle CTA, UI stays visible). */
  const [authContinueOpen, setAuthContinueOpen] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
      setLocale(raw as AppLocale);
      return;
    }
    const cookieMatch = document.cookie.match(/(?:^|;\s*)iching_ui_locale=([^;]+)/);
    const cookieLocale = cookieMatch ? decodeURIComponent(cookieMatch[1] ?? "") : "";
    if ((SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
      setLocale(cookieLocale as AppLocale);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.cookie = `iching_ui_locale=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

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
  const activeThread = activeSession?.thread ?? [];
  const result = activeThread.at(-1) ?? null;
  const threadLimitReached =
    activeThread.length > 0 && result !== null && !result.canDeepen;
  const questionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const summaryCacheKey = authUserId ? `iching_chat_summaries_v1:${authUserId}` : null;
  const chatStateCacheKey = authUserId ? `iching_chat_state_v1:${authUserId}` : null;

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

      const canvas = document.createElement("canvas");
      canvas.width = pageW;
      canvas.height = pageH;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

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
      const plain = blocks
        .map((b) => b.text)
        .join("\n\n")
        .replace(/\s+\n/g, "\n")
        .trim();
      ctx.fillStyle = "#1f2a36";
      let readingFontSize = 24;
      let readingLineHeight = 34;
      let maxReadingLines = Math.floor((panelH - 112) / readingLineHeight);
      ctx.font = `500 ${readingFontSize}px ${cjkFont}`;
      let readingLines = wrapText(ctx, plain, pageW - 168);
      while (readingLines.length > maxReadingLines && readingFontSize > 16) {
        readingFontSize -= 1;
        readingLineHeight = Math.round(readingFontSize * 1.38);
        maxReadingLines = Math.floor((panelH - 112) / readingLineHeight);
        ctx.font = `500 ${readingFontSize}px ${cjkFont}`;
        readingLines = wrapText(ctx, plain, pageW - 168);
      }
      readingLines.slice(0, maxReadingLines).forEach((line, index) => {
        ctx.fillText(line, 84, panelY + 84 + index * readingLineHeight);
      });
      if (readingLines.length > maxReadingLines) {
        ctx.fillText("…", 84, panelY + 84 + maxReadingLines * readingLineHeight);
      }

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      doc.addImage(dataUrl, "JPEG", 0, 0, 595.28, 841.89, undefined, "FAST");
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
    if (!authContinueOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAuthContinueOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authContinueOpen]);

  const startNewSession = useCallback(() => {
    const created = createLocalSession(ui.sessionNew);
    setSessions((prev) => [created, ...prev.filter((s) => s.messageCount > 0)]);
    setActiveSessionLocalId(created.localId);
    setQuestion("");
    setError(null);
    setChatsOpen(false);
    setConsultPanelOpen(false);
  }, [ui.sessionNew]);

  const signOut = useCallback(async () => {
    if (!isSupabaseBrowserConfigured()) return;
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
      } catch {
        // ignore cache clear errors
      }
    }
    setAccessToken(null);
    setAuthEmail(null);
    setAuthUserId(null);
    setSecondFactorVerified(false);
    setTwoFactorModalOpen(false);
  }, [authUserId]);

  const sessionsListed = useMemo(() => sessions.filter((s) => s.messageCount > 0), [sessions]);
  const loadSessionThread = useCallback(
    async (sessionId: string, localId: string) => {
      if (!accessToken) return;
      try {
        const res = await fetch(`/api/account/chats?sessionId=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return;
        const payload = (await res.json()) as AccountChatSessionResponse;
        if (!payload?.session) return;
        const thread = payload.consultations.map((c) => mapApiConsultationToItem(c, payload.session.publicId));
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
                  : (thread[0]?.question.slice(0, 60) ?? (isSpanish ? "Consulta" : "Consultation")),
              sessionId: payload.session.sessionId,
              publicSessionId: payload.session.publicId,
              thread,
              messageCount: Math.max(thread.length, s.messageCount),
              updatedAt: thread.at(-1)?.createdAt ?? s.updatedAt,
              firstConsultationAt: thread[0]?.createdAt ?? s.firstConsultationAt,
            };
          }),
        );
      } catch {
        // ignore network errors
      }
    },
    [accessToken, knownInProgressTitles, knownNewSessionTitles, isSpanish],
  );
  const removeSession = useCallback(
    async (session: ChatSessionState) => {
      if (!accessToken || !session.sessionId) return;
      const ok = window.confirm(
        isSpanish
          ? "¿Eliminar esta conversación de forma permanente?"
          : "Delete this conversation permanently?",
      );
      if (!ok) return;
      try {
        const res = await fetch(`/api/account/chats?sessionId=${encodeURIComponent(session.sessionId)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          setError(isSpanish ? "No se pudo eliminar la conversación." : "Could not delete conversation.");
          return;
        }
        setSessions((prev) => {
          const next = prev.filter((s) => s.localId !== session.localId);
          const nextActive = next[0]?.localId ?? null;
          setActiveSessionLocalId((current) => (current === session.localId ? nextActive : current));
          return next;
        });
      } catch {
        setError(isSpanish ? "No se pudo eliminar la conversación." : "Could not delete conversation.");
      }
    },
    [accessToken, isSpanish],
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
    if (!accessToken) {
      setTier("free");
      setMonthlyCreditsLimit(2);
      setCreditsType("lifetime");
      setSubscriptionCreditsRemaining(null);
      setSubscriptionCycleEnd(null);
      setTwoFactorEnabled(false);
      setTwoFactorMethod(null);
      setSecondFactorVerified(false);
      setTwoFactorModalOpen(false);
      return;
    }
    let cancelled = false;
    function loadAccountTier() {
      void fetch("/api/account/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((j: {
          tier?: Tier;
          creditsLimit?: number;
          creditsType?: CreditsType;
          creditsRemaining?: number;
          cycleEnd?: string | null;
          twoFactorEnabled?: boolean;
          twoFactorMethod?: string | null;
        } | null) => {
          if (cancelled || !j?.tier) return;
          setTier(j.tier);
          if (typeof j.creditsLimit === "number" && Number.isFinite(j.creditsLimit)) {
            setMonthlyCreditsLimit(j.creditsLimit);
          }
          setCreditsType(j.creditsType === "monthly" ? "monthly" : "lifetime");
          setSubscriptionCreditsRemaining(typeof j.creditsRemaining === "number" ? j.creditsRemaining : null);
          setSubscriptionCycleEnd(typeof j.cycleEnd === "string" ? j.cycleEnd : null);
          setTwoFactorEnabled(Boolean(j.twoFactorEnabled));
          setTwoFactorMethod(j.twoFactorMethod ?? null);
        })
        .catch(() => {});
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
  }, [accessToken]);

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
    setTwoFactorModalMode("challenge");
    setTwoFactorModalOpen(true);
  }, [accessToken, authUserId, twoFactorEnabled]);

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
    const fresh = createLocalSession(inProgressTitle);
    setSessions([fresh]);
    setActiveSessionLocalId(fresh.localId);
    setSessionsHydrated(true);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (accessToken) return;
    const fresh = createLocalSession(inProgressTitle);
    setSessions([fresh]);
    setActiveSessionLocalId(fresh.localId);
  }, [authReady, accessToken]);

  useEffect(() => {
    if (!authReady || !accessToken || !sessionsHydrated) return;
    let cancelled = false;
    if (chatStateCacheKey) {
      try {
        const stateRaw = sessionStorage.getItem(chatStateCacheKey);
        if (stateRaw) {
          const state = JSON.parse(stateRaw) as { sessions?: ChatSessionState[]; activeSessionLocalId?: string | null };
          if (Array.isArray(state.sessions) && state.sessions.length > 0) {
            setSessions(state.sessions);
            setActiveSessionLocalId(state.activeSessionLocalId ?? state.sessions[0]?.localId ?? null);
          }
        }
      } catch {
        // ignore chat state cache hydration errors
      }
    }
    if (summaryCacheKey) {
      try {
        const cachedRaw = sessionStorage.getItem(summaryCacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as ChatSessionState[];
          if (Array.isArray(cached) && cached.length > 0) {
            setSessions(cached);
            setActiveSessionLocalId(cached[0]?.localId ?? null);
          }
        }
      } catch {
        // ignore cache hydration errors
      }
    }
    void (async () => {
      try {
        const res = await fetch("/api/account/chats?summary=1", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          const err = (await res.json().catch(() => null)) as { code?: string } | null;
          if (err?.code === "CHAT_PERSISTENCE_NOT_CONFIGURED") {
            setError(
              isSpanish
                ? "No se puede cargar el historial: falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor."
                : "Could not load chat history: SUPABASE_SERVICE_ROLE_KEY is missing on the server.",
            );
          }
          return;
        }
        const payload = (await res.json()) as AccountChatsSummaryResponse;
        if (cancelled || !payload) return;
        const hydrated = payload.sessions
          .map((entry): ChatSessionState => {
            return {
              localId: `db-${entry.session.sessionId}`,
              title:
                entry.session.title && !knownNewSessionTitles.has(entry.session.title) && !knownInProgressTitles.has(entry.session.title)
                  ? entry.session.title
                  : (entry.firstQuestion?.trim().slice(0, 80) || (isSpanish ? "Consulta" : "Consultation")),
              sessionId: entry.session.sessionId,
              publicSessionId: entry.session.publicId,
              thread: [],
              messageCount: entry.messageCount,
              updatedAt: entry.updatedAt ?? entry.session.createdAt,
              firstConsultationAt: entry.firstConsultationAt ?? null,
            };
          })
          .filter((s) => s.messageCount > 0);
        if (hydrated.length === 0) return;
        setSessions((prev) =>
          hydrated.map((next) => {
            const existing = prev.find((s) => s.sessionId === next.sessionId);
            if (!existing) return next;
            return {
              ...next,
              title:
                existing.title && !knownNewSessionTitles.has(existing.title) && !knownInProgressTitles.has(existing.title)
                  ? existing.title
                  : next.title,
              thread: existing.thread,
              messageCount: Math.max(next.messageCount, existing.messageCount),
              updatedAt: Math.max(next.updatedAt, existing.updatedAt),
              firstConsultationAt: next.firstConsultationAt ?? existing.firstConsultationAt,
            };
          }),
        );
        if (summaryCacheKey) {
          try {
            sessionStorage.setItem(summaryCacheKey, JSON.stringify(hydrated));
          } catch {
            // ignore cache save errors
          }
        }
        const first = hydrated[0];
        setActiveSessionLocalId(first?.localId ?? null);
        if (first?.sessionId && first.thread.length === 0) {
          void loadSessionThread(first.sessionId, first.localId);
        }
      } catch {
        // ignore network errors
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, accessToken, sessionsHydrated, knownInProgressTitles, knownNewSessionTitles, isSpanish, loadSessionThread, summaryCacheKey, chatStateCacheKey]);

  useEffect(() => {
    if (!sessionsHydrated) return;
    if (!summaryCacheKey) return;
    const entries = sessions.filter((s) => s.messageCount > 0).map((s) => ({ ...s, thread: [] }));
    try {
      if (entries.length === 0) {
        sessionStorage.removeItem(summaryCacheKey);
      } else {
        sessionStorage.setItem(summaryCacheKey, JSON.stringify(entries));
      }
    } catch {
      // ignore cache persistence errors
    }
  }, [sessions, summaryCacheKey, sessionsHydrated]);

  useEffect(() => {
    if (!sessionsHydrated) return;
    if (!chatStateCacheKey) return;
    const entries = sessions.filter((s) => s.messageCount > 0);
    try {
      if (entries.length === 0) {
        sessionStorage.removeItem(chatStateCacheKey);
      } else {
        sessionStorage.setItem(
          chatStateCacheKey,
          JSON.stringify({
            sessions: entries,
            activeSessionLocalId,
          }),
        );
      }
    } catch {
      // ignore state cache persistence errors
    }
  }, [sessions, activeSessionLocalId, chatStateCacheKey, sessionsHydrated]);

  async function startTwoFactorEnrollment() {
    if (!accessToken) {
      setError("Inicia sesión para configurar la verificación en dos pasos.");
      return;
    }
    setTwoFactorBusy(true);
    setError(null);
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
          setError("2FA no está habilitado en servidor: falta configurar TOTP_ENCRYPTION_KEY.");
          return;
        }
        if (data.code === "AUTH_PROVIDER_NOT_CONFIGURED") {
          setError("2FA no disponible: falta configuración de Supabase en servidor.");
          return;
        }
        setError("No se pudo iniciar 2FA ahora. Inténtalo de nuevo en unos minutos.");
        return;
      }
      setTwoFactorQrDataUrl(data.qrDataUrl);
      setTwoFactorSetupOpen(true);
      setTwoFactorRecoveryCodes([]);
    } catch {
      setError("No se pudo iniciar 2FA ahora. Inténtalo de nuevo en unos minutos.");
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function confirmTwoFactorEnrollment() {
    if (!accessToken || !twoFactorCode.trim()) return;
    setTwoFactorBusy(true);
    setError(null);
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
          setError("Primero activa 2FA con Authenticator para generar el QR.");
          return;
        }
        if (data.code === "TWO_FACTOR_ENCRYPTION_KEY_MISSING") {
          setError("2FA no está habilitado en servidor: falta configurar TOTP_ENCRYPTION_KEY.");
          return;
        }
        setError("Código 2FA inválido o expirado. Revisa tu app Authenticator e inténtalo de nuevo.");
        return;
      }
      setTwoFactorEnabled(true);
      setTwoFactorMethod("totp");
      setTwoFactorRecoveryCodes(data.recoveryCodes);
      setTwoFactorCode("");
    } catch {
      setError("No se pudo verificar 2FA ahora. Inténtalo de nuevo.");
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function sendEmailTwoFactorCode() {
    if (!accessToken) {
      setError("Inicia sesión para configurar la verificación en dos pasos.");
      return;
    }
    setTwoFactorBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/2fa/email/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = (await res.json()) as { ok?: boolean; code?: string };
      if (!res.ok || !data.ok) {
        if (data.code === "TWO_FACTOR_EMAIL_NOT_CONFIGURED") {
          setError(
            "2FA por email no está habilitado en servidor. Revisa RESEND_API_KEY, TWO_FACTOR_EMAIL_FROM y TWO_FACTOR_EMAIL_CODE_SECRET.",
          );
          return;
        }
        if (data.code === "TWO_FACTOR_EMAIL_DELIVERY_FAILED") {
          const deliveryMessage =
            "message" in data && typeof (data as { message?: unknown }).message === "string"
              ? (data as { message: string }).message
              : null;
          setError(
            deliveryMessage
              ? `No se pudo enviar el código por email: ${deliveryMessage}`
              : "No se pudo enviar el código por email. Verifica que TWO_FACTOR_EMAIL_FROM esté validado en Resend y que la API key sea correcta.",
          );
          return;
        }
        setError("No se pudo enviar el código por email. Inténtalo de nuevo.");
        return;
      }
      setTwoFactorEmailSent(true);
    } catch {
      setError("No se pudo enviar el código por email. Inténtalo de nuevo.");
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function verifyEmailTwoFactorCode() {
    if (!accessToken || !twoFactorEmailCode.trim()) return;
    setTwoFactorBusy(true);
    setError(null);
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
          setError("El código por email expiró. Solicita uno nuevo.");
          return;
        }
        if (data.code === "TWO_FACTOR_EMAIL_CODE_MISSING") {
          setError("Primero solicita el código por email.");
          return;
        }
        setError("Código por email inválido. Revisa tu bandeja e inténtalo de nuevo.");
        return;
      }
      setTwoFactorEnabled(true);
      setTwoFactorMethod("email");
      setTwoFactorRecoveryCodes(data.recoveryCodes);
      setTwoFactorEmailCode("");
      setTwoFactorEmailSent(false);
    } catch {
      setError("No se pudo verificar el código por email. Inténtalo de nuevo.");
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function disableTwoFactor() {
    if (!accessToken) return;
    setTwoFactorBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        setError(isSpanish ? "No se pudo desactivar 2FA." : "Could not disable 2FA.");
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
    } catch {
      setError(isSpanish ? "No se pudo desactivar 2FA." : "Could not disable 2FA.");
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function verifyTwoFactorChallenge() {
    if (!accessToken) return;
    const payload: { token?: string; emailCode?: string; recoveryCode?: string } = {};
    if (twoFactorCode.trim().length >= 6) payload.token = twoFactorCode.trim();
    if (twoFactorEmailCode.trim().length >= 6) payload.emailCode = twoFactorEmailCode.trim();
    if (!payload.token && !payload.emailCode) {
      setError(isSpanish ? "Ingresa un código válido de 6 dígitos." : "Enter a valid 6-digit code.");
      return;
    }
    setTwoFactorBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/2fa/challenge/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError(isSpanish ? "Código 2FA inválido o expirado." : "Invalid or expired 2FA code.");
        return;
      }
      if (authUserId) {
        sessionStorage.setItem(`iching_2fa_passed_v1:${authUserId}`, "1");
      }
      setSecondFactorVerified(true);
      setTwoFactorCode("");
      setTwoFactorEmailCode("");
      setTwoFactorModalOpen(false);
      setTwoFactorModalMode("manage");
    } catch {
      setError(isSpanish ? "No se pudo verificar 2FA." : "Could not verify 2FA.");
    } finally {
      setTwoFactorBusy(false);
    }
  }

  async function openSubscriptionManagement() {
    if (!accessToken) {
      setError(isSpanish ? "Inicia sesión para gestionar tu suscripción." : "Sign in to manage your subscription.");
      return;
    }
    setManageSubBusy(true);
    setManageSubMessage(null);
    try {
      const res = await fetch("/api/account/subscription/manage", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; managementUrl?: string; code?: string; message?: string }
        | null;
      if (!res.ok || !data?.ok || !data.managementUrl) {
        const fallback = isSpanish
          ? "No se pudo abrir la gestión de suscripción. Inténtalo de nuevo en unos minutos."
          : "Could not open subscription management. Please try again in a few minutes.";
        if (data?.code === "BILLING_NOT_CONFIGURED") {
          setManageSubMessage(
            isSpanish
              ? "Falta configuración de billing (RevenueCat) en servidor."
              : "Billing (RevenueCat) is not fully configured on server.",
          );
        } else if (data?.code === "BILLING_NO_ACTIVE_SUBSCRIPTION") {
          const plansHref = "/pricing";
          window.open(plansHref, "_blank", "noopener,noreferrer");
          setManageSubMessage(
            isSpanish
              ? "Tu cuenta no tiene una suscripción activa para gestionar. Te abrimos los planes para elegir o actualizar."
              : "Your account has no active subscription to manage. We opened plans so you can subscribe or upgrade.",
          );
        } else if (data?.code === "BILLING_SYNC_FAILED") {
          setManageSubMessage(fallback);
        } else {
          setManageSubMessage(fallback);
        }
        return;
      }
      window.open(data.managementUrl, "_blank", "noopener,noreferrer");
      setManageSubMessage(
        isSpanish
          ? "Se abrió el portal de suscripción en una nueva pestaña."
          : "Subscription portal opened in a new tab.",
      );
    } catch {
      setManageSubMessage(
        isSpanish
          ? "No se pudo abrir la gestión de suscripción. Inténtalo de nuevo."
          : "Could not open subscription management. Please try again.",
      );
    } finally {
      setManageSubBusy(false);
    }
  }

  async function onConsult() {
    if (!activeSession) {
      const created = createLocalSession(inProgressTitle);
      setSessions([created]);
      setActiveSessionLocalId(created.localId);
      return;
    }
    if (threadLimitReached) {
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
      setTwoFactorModalMode("challenge");
      setTwoFactorModalOpen(true);
      setError(isSpanish ? "Verifica 2FA para continuar." : "Verify 2FA to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    setCreditsNotice(null);
    setPendingUserQuestion(questionForRequest || null);
    setQuestion("");
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
          question: questionForRequest,
          language: detectInputLanguage(questionForRequest, locale),
          sessionId: sessionIdForRequest,
          sessionTitle: activeSession.title,
          isDeepening: activeThread.length > 0,
          responseMode,
          oracleMode,
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
      const rawText = await res.text();
      let data: ConsultResponse & {
        error?: string;
        code?: string;
        action?: string;
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
        if (res.status === 409 && data.error === "thread_limit_reached") {
          setError(isSpanish ? "Límite de hilo alcanzado. Usa «Nueva sesión» para continuar." : "Thread limit reached. Use \"New session\" to continue.");
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
        if (res.status === 403 && (data.error === "two_factor_required" || data.action === "setup_2fa")) {
          setConsultPanelOpen(true);
          setError(
            isSpanish
              ? "Tu cuenta tiene 2FA obligatorio en este entorno. Actívalo en Opciones > Seguridad."
              : "Your account requires 2FA in this environment. Enable it in Options > Security.",
          );
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
      await new Promise((r) => window.setTimeout(r, showRitualAnimation ? 900 : 0));
      const item: ConsultationItem = {
        ...data,
        oracleType: data.oracleType ?? "iching",
        question:
          data.oracleType === "oracle_bones" && data.oracleBones?.positiveCharge
            ? data.oracleBones.positiveCharge
            : questionForRequest,
        createdAt: Date.now(),
      };
      updateActiveSession((current) => ({
        ...current,
        thread: [...current.thread, item],
        messageCount: Math.max(current.messageCount, current.thread.length + 1),
        sessionId: data.sessionId,
        publicSessionId: data.publicSessionId ?? current.publicSessionId,
        title: knownInProgressTitles.has(current.title) || knownNewSessionTitles.has(current.title)
          ? item.question.slice(0, 60)
          : current.title,
        updatedAt: item.createdAt ?? Date.now(),
        firstConsultationAt: current.firstConsultationAt ?? item.createdAt ?? Date.now(),
      }));
      setPendingUserQuestion(null);
      const today = new Date().toISOString().slice(0, 10);
      setDailyCount((prev) => {
        const next = prev + 1;
        localStorage.setItem(dailyCountStorageKey(today), String(next));
        return next;
      });
      setPhase("reading");
      setConsultPanelOpen(false);
      ok = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setPendingUserQuestion(null);
    } finally {
      if (ticker !== null) window.clearInterval(ticker);
      setLoading(false);
      if (!ok) {
        setPhase("idle");
        setPendingUserQuestion(null);
      }
    }
  }

  const creditsExhaustedCopy = creditsNotice
    ? creditsExhaustedBlock(creditsNotice.tier, creditsNotice.limit, creditsNotice.cycleEndsAt)
    : null;

  const localeSelector = (
    <label className="locale-control" htmlFor="ui-locale-select">
      <span>{ui.language}</span>
      <select
        id="ui-locale-select"
        className="locale-select"
        value={locale}
        onChange={(e) => setLocale(e.target.value as AppLocale)}
      >
        {SUPPORTED_LOCALES.map((code) => (
          <option key={code} value={code}>
            {LANGUAGE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );

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
          aria-hidden={!chatsOpen}
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
                <span className="sidebar-stat-value">{sessionsListed.length}</span>
                <span className="sidebar-stat-key">{drawerText.chatsWithMessages}</span>
              </div>
            </div>
            {loading ? (
              <p className="sidebar-stats-hint">{drawerText.loading}</p>
            ) : (
              <p className="sidebar-stats-hint">{drawerText.onlyThreads}</p>
            )}
          </div>
          <div className="chat-drawer-list">
            {sessionsListed.length === 0 ? (
              <p className="chat-drawer-empty">{drawerText.noSaved}</p>
            ) : null}
            {[...sessionsListed]
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((session) => (
                <div
                  key={session.localId}
                  className={`chat-session-item ${session.localId === activeSession?.localId ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className="chat-session-main-btn"
                    onClick={() => {
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
                    </span>
                  </button>
                  <button
                    type="button"
                    className="chat-session-delete"
                    aria-label={drawerText.deleteConversation}
                    title={drawerText.deleteConversation}
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
              ))}
          </div>
        </aside>

        <div className="chat-surface">
        {authReady && supabaseConfigError ? (
          <div className="auth-config-banner" role="alert">
            <span>
              {isSpanish ? "Falta configuración del cliente:" : "Missing client configuration:"}{" "}
              <code className="auth-gate-code">NEXT_PUBLIC_SUPABASE_URL</code> {isSpanish ? "y" : "and"}{" "}
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
          <div
            className="auth-explore-strip auth-explore-strip--session"
            style={{
              display: "grid",
              position: "relative",
              gridTemplateColumns: "1fr",
              alignItems: "center",
              minHeight: "2.55rem",
              paddingTop: "0.16rem",
              paddingBottom: "0.24rem",
              paddingInline: "1rem",
              overflow: "hidden",
            }}
          >
            <span
              className="auth-explore-strip-tier"
              aria-label={`${ui.plan} ${tier}`}
              style={{
                position: "absolute",
                left: "0.72rem",
                top: "50%",
                transform: "translateY(-50%)",
                height: "2.04rem",
                display: "inline-flex",
                alignItems: "center",
                fontSize: "0.76rem",
              }}
            >
              {ui.plan}: {tier}
            </span>
            <div
              style={{
                position: "absolute",
                left: "7.2rem",
                top: "50%",
                transform: "translateY(-50%)",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {localeSelector}
            </div>
            <span
              className="auth-explore-strip-email"
              title={authEmail}
              style={{
                height: "2.04rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.79rem",
                width: "100%",
                paddingInline: "12rem 5.6rem",
              }}
            >
              {authEmail}
            </span>
            <button
              type="button"
              className="auth-explore-strip-signout"
              onClick={() => void signOut()}
              style={{
                position: "absolute",
                right: "0.72rem",
                top: "calc(50% - 12px)",
                transform: "translateY(-50%)",
                height: "2.04rem",
                display: "inline-flex",
                alignItems: "center",
                lineHeight: 1,
                padding: "0 0.62rem",
                fontSize: "0.76rem",
              }}
            >
              {ui.signOut}
            </button>
          </div>
        ) : null}
        <header className="chat-app-bar oracle-intro" style={{ marginBottom: 0, paddingBottom: 0 }}>
          <div
            className="chat-app-bar-row chat-app-bar-row--top"
            style={{ minHeight: "2.45rem", paddingTop: "0.3rem", paddingBottom: "0.2rem" }}
          >
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
                alt="The Original I Ching App — 真正的易经"
                className="chat-header-logo"
                width={268}
                height={78}
                decoding="async"
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
              gap: "0.02rem",
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
                  ? ui.iChingTagline
                  : ui.bonesTagline}
              </p>
              <span className="oracle-reading-pill" aria-label={`${ui.readMode} ${responseModeLabel(responseMode, locale)}`}>
                {ui.mode}: {responseModeLabel(responseMode, locale)}
              </span>
            </div>
          </div>
        </header>

        <div className="chat-room">
          <section className="chat-history" ref={historyRef} style={{ paddingTop: 0, marginTop: 0 }}>
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
                            ? ` · ${isSpanish ? "Lecturas ambiguas previas" : "Previous ambiguous readings"}: ${entry.oracleBones.ambiguousPasses}`
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

            {phase === "bones" ? (
              <section className="coins-stage" data-testid="bone-ritual">
                <p className="coins-title">{runtimeText.ritualBones}</p>
                <p className="meta-line" style={{ textAlign: "center", maxWidth: "22rem", margin: "0 auto" }}>
                  {runtimeText.ritualBonesHint}
                </p>
                <div className="crack-visual-wrap">
                  <CrackPatternGraphic patternId={((coinTick % 4) + 1) as number} />
                </div>
              </section>
            ) : null}

            {phase === "coins" ? (
              <section className="coins-stage" data-testid="coin-throw">
                <p className="coins-title">{runtimeText.ritualCoins}</p>
                <div className="ritual-progress">
                  {Array.from({ length: 6 }, (_, i) => {
                    const line = i + 1;
                    const active = line === activeRitualLine;
                    const done = line < activeRitualLine;
                    return (
                      <div key={line} className={`ritual-line ${active ? "active" : ""} ${done ? "done" : ""}`}>
                        <span>{runtimeText.line} {line}</span>
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
                        <p className="composer-switch-caption">
                          {oracleMode === "iching"
                            ? ui.modeIChingHint
                            : ui.modeBonesHint}
                        </p>
                      </div>
                    </div>
                    <div className="composer-reading-row" role="group" aria-label="Modo de lectura">
                      <span className="composer-reading-label">{ui.readMode}</span>
                      <div className="composer-reading-segmented">
                        {(["directo", "ritual", "profundizar"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            className={`composer-reading-pill ${responseMode === m ? "is-active" : ""}`}
                            onClick={() => setResponseMode(m)}
                            disabled={loading}
                          >
                            {responseModeLabel(m, locale)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="composer-doc-links">
                      <Link href="/quickstart">{isSpanish ? "Quickstart (uso)" : "Quickstart (usage)"}</Link>
                      <Link href="/notes">
                        {isSpanish ? "Notas y origen de los métodos (I Ching y Huesos)" : "Method notes and origins (I Ching and Bones)"}
                      </Link>
                      <Link href="/privacy">{isSpanish ? "Política de Privacidad" : "Privacy Policy"}</Link>
                      <Link href="/terms">{isSpanish ? "Términos del Servicio" : "Terms of Service"}</Link>
                    </div>
                    <div className="session-progress" role="group" aria-label="Gestión de suscripción">
                      <span>{isSpanish ? "Suscripción" : "Subscription"}</span>
                      <p className="meta-line tier-hint-line">
                        {isSpanish ? "Plan actual:" : "Current plan:"} <strong>{tier}</strong>
                        {subscriptionCreditsRemaining !== null
                          ? ` · ${isSpanish ? "restantes" : "remaining"}: ${subscriptionCreditsRemaining}`
                          : ""}
                      </p>
                      {subscriptionCycleEnd ? (
                        <p className="meta-line tier-hint-line">
                          {isSpanish ? "Renovación / ciclo hasta:" : "Renewal / cycle end:"}{" "}
                          {new Date(subscriptionCycleEnd).toLocaleString(locale)}
                        </p>
                      ) : null}
                      <p className="meta-line tier-hint-line">
                        {isSpanish
                          ? "Auto-renovación y cancelación se gestionan desde tu portal de suscripción."
                          : "Auto-renewal and cancellation are managed from your subscription portal."}
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                        <button
                          type="button"
                          className="composer-reading-pill"
                          onClick={() => void openSubscriptionManagement()}
                          disabled={manageSubBusy || !accessToken}
                        >
                          {manageSubBusy
                            ? isSpanish
                              ? "Abriendo..."
                              : "Opening..."
                            : isSpanish
                              ? "Gestionar suscripción"
                              : "Manage subscription"}
                        </button>
                        <button
                          type="button"
                          className="composer-reading-pill"
                          onClick={() => window.open("/pricing", "_blank", "noopener,noreferrer")}
                        >
                          {isSpanish ? "Ver planes / upgrade" : "Plans / upgrade"}
                        </button>
                      </div>
                      {manageSubMessage ? (
                        <p className="meta-line tier-hint-line" style={{ marginTop: 8 }}>
                          {manageSubMessage}
                        </p>
                      ) : null}
                    </div>
                    <div className="session-progress" role="group" aria-label="Seguridad de cuenta">
                      <span>{isSpanish ? "Seguridad (2FA opcional)" : "Security (optional 2FA)"}</span>
                      <p className="meta-line tier-hint-line">
                        {isSpanish ? "Estado:" : "Status:"}{" "}
                        <strong>{twoFactorEnabled ? (isSpanish ? "Activado" : "Enabled") : (isSpanish ? "Desactivado" : "Disabled")}</strong>
                        {twoFactorMethod ? `${isSpanish ? " · método " : " · method "}${twoFactorMethod.toUpperCase()}` : ""}
                      </p>
                      <p className="meta-line tier-hint-line">
                        {isSpanish
                          ? "Configura Authenticator y/o código por email en una ventana segura."
                          : "Configure Authenticator and/or email code in a secure modal."}
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                        <button
                          type="button"
                          className="composer-reading-pill is-active"
                          onClick={() => {
                            setTwoFactorModalMode("manage");
                            setTwoFactorModalOpen(true);
                          }}
                          disabled={twoFactorBusy || !accessToken}
                        >
                          {isSpanish ? "Configurar 2FA" : "Configure 2FA"}
                        </button>
                        {twoFactorEnabled ? (
                          <button
                            type="button"
                            className="composer-reading-pill"
                            onClick={() => void disableTwoFactor()}
                            disabled={twoFactorBusy || !accessToken}
                          >
                            {isSpanish ? "Desactivar 2FA" : "Disable 2FA"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {result ? (
                      <div className="session-progress">
                        <span>{isSpanish ? "Profundidad del hilo" : "Thread depth"}</span>
                        <p className="meta-line tier-hint-line">
                          {isSpanish ? "Plan " : "Plan "}<strong>{tier}</strong>: {monthlyCreditsLimit}{" "}
                          {creditsType === "lifetime"
                            ? isSpanish
                              ? "consultas lifetime"
                              : "lifetime consultations"
                            : isSpanish
                              ? "consultas por mes"
                              : "consultations per month"}{" "}
                          · {isSpanish ? "hasta" : "up to"}{" "}
                          {CONTEXT_LIMITS[tier].sessionDepth} {isSpanish ? "en este hilo." : "in this thread."}
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
                        <small>
                          {result.canDeepen
                            ? isSpanish
                              ? "Puedes profundizar en este hilo."
                              : "You can deepen this thread."
                            : isSpanish
                              ? "Límite de hilo alcanzado."
                              : "Thread limit reached."}
                        </small>
                      </div>
                    ) : null}
                    {activeThread.length > 0 ? (
                      <p className="meta-line composer-hint-line">
                        {isSpanish ? "Siguiente mensaje sigue en este hilo." : "Your next message continues in this thread."}
                      </p>
                    ) : null}
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
                      width: "min(760px, 96vw)",
                      borderRadius: 16,
                      border: "1px solid rgba(84,160,186,0.35)",
                      background: "linear-gradient(180deg, rgba(16,31,45,0.98), rgba(9,20,31,0.98))",
                      boxShadow: "0 18px 48px rgba(0,0,0,0.45)",
                      padding: 16,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <strong style={{ color: "#d8edf5" }}>
                        {twoFactorModalMode === "challenge"
                          ? isSpanish
                            ? "Verificación 2FA requerida"
                            : "2FA verification required"
                          : isSpanish
                            ? "Configuración de seguridad 2FA"
                            : "2FA security setup"}
                      </strong>
                      {twoFactorModalMode === "manage" ? (
                        <button
                          type="button"
                          className="composer-reading-pill"
                          onClick={() => setTwoFactorModalOpen(false)}
                          disabled={twoFactorBusy}
                        >
                          {isSpanish ? "Cerrar" : "Close"}
                        </button>
                      ) : null}
                    </div>
                    <p className="meta-line tier-hint-line" style={{ marginTop: 8 }}>
                      {twoFactorModalMode === "challenge"
                        ? isSpanish
                          ? "Para continuar en esta sesión, verifica tu cuenta con Authenticator (TOTP) o código por email."
                          : "To continue in this session, verify your account with Authenticator (TOTP) or email code."
                        : isSpanish
                          ? "Activa o desactiva métodos 2FA de forma segura. Los códigos sensibles solo se muestran en esta ventana."
                          : "Enable or disable 2FA methods safely. Sensitive codes are shown only in this modal."}
                    </p>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      <button
                        type="button"
                        className="composer-reading-pill is-active"
                        onClick={() => void startTwoFactorEnrollment()}
                        disabled={twoFactorBusy || !accessToken}
                      >
                        {twoFactorBusy ? (isSpanish ? "Preparando..." : "Preparing...") : isSpanish ? "Authenticator (TOTP)" : "Authenticator (TOTP)"}
                      </button>
                      <button
                        type="button"
                        className="composer-reading-pill"
                        onClick={() => void sendEmailTwoFactorCode()}
                        disabled={twoFactorBusy || !accessToken}
                      >
                        {twoFactorBusy ? (isSpanish ? "Enviando..." : "Sending...") : isSpanish ? "Código por email" : "Email code"}
                      </button>
                      {twoFactorModalMode === "manage" && twoFactorEnabled ? (
                        <button
                          type="button"
                          className="composer-reading-pill"
                          onClick={() => void disableTwoFactor()}
                          disabled={twoFactorBusy}
                        >
                          {isSpanish ? "Desactivar 2FA" : "Disable 2FA"}
                        </button>
                      ) : null}
                    </div>

                    {twoFactorModalMode === "challenge" ? (
                      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          type="text"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          placeholder={isSpanish ? "Código TOTP (6 dígitos)" : "TOTP code (6 digits)"}
                          className="composer-input"
                          style={{ maxWidth: 220 }}
                        />
                      </div>
                    ) : null}

                    {twoFactorSetupOpen && twoFactorQrDataUrl ? (
                      <div style={{ marginTop: 12 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={twoFactorQrDataUrl}
                          alt="Authenticator QR"
                          style={{ width: 190, height: 190, borderRadius: 8, background: "#fff" }}
                        />
                        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <input
                            type="text"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            placeholder={isSpanish ? "Código TOTP de 6 dígitos" : "6-digit TOTP code"}
                            className="composer-input"
                            style={{ maxWidth: 220 }}
                          />
                          <button
                            type="button"
                            className="composer-reading-pill is-active"
                            onClick={() =>
                              void (twoFactorModalMode === "challenge"
                                ? verifyTwoFactorChallenge()
                                : confirmTwoFactorEnrollment())
                            }
                            disabled={twoFactorBusy || twoFactorCode.trim().length < 6}
                          >
                            {isSpanish ? "Verificar" : "Verify"}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {twoFactorEmailSent ? (
                      <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          type="text"
                          value={twoFactorEmailCode}
                          onChange={(e) => setTwoFactorEmailCode(e.target.value)}
                          placeholder={isSpanish ? "Código email (6 dígitos)" : "Email code (6 digits)"}
                          className="composer-input"
                          style={{ maxWidth: 220 }}
                        />
                        <button
                          type="button"
                          className="composer-reading-pill is-active"
                          onClick={() =>
                            void (twoFactorModalMode === "challenge"
                              ? verifyTwoFactorChallenge()
                              : verifyEmailTwoFactorCode())
                          }
                          disabled={twoFactorBusy || twoFactorEmailCode.trim().length < 6}
                        >
                          {isSpanish ? "Verificar email" : "Verify email"}
                        </button>
                      </div>
                    ) : null}

                    {twoFactorRecoveryCodes.length > 0 && twoFactorModalMode === "manage" ? (
                      <p className="meta-line tier-hint-line" style={{ marginTop: 10 }}>
                        {isSpanish ? "Guarda tus códigos de recuperación:" : "Save your recovery codes:"}{" "}
                        <code>{twoFactorRecoveryCodes.join(" · ")}</code>
                      </p>
                    ) : null}

                    {twoFactorModalMode === "challenge" ? (
                      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="composer-reading-pill is-active"
                          onClick={() => void verifyTwoFactorChallenge()}
                          disabled={twoFactorBusy || (twoFactorCode.trim().length < 6 && twoFactorEmailCode.trim().length < 6)}
                        >
                          {isSpanish ? "Continuar con verificación" : "Continue with verification"}
                        </button>
                        <button type="button" className="composer-reading-pill" onClick={() => void signOut()}>
                          {isSpanish ? "Cerrar sesión" : "Sign out"}
                        </button>
                      </div>
                    ) : null}
                  </div>
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
                    {ui.sessionNew}
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
                  <span className="composer-mode-tag">{ui.options}</span>
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
                        ? ui.threadLimitReached
                        : oracleMode === "oracle_bones"
                          ? ui.positiveCharge
                          : ui.writeConsultation
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
