import type {
  OracleBonesHistorySnapshot,
  OracleType,
} from "@iching-oracle/context-engine";
import { getHexagramRecordByNumber } from "@iching-oracle/iching-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isPersistableUuid } from "@/lib/session-ids";
import { randomBytes } from "node:crypto";

/** Shared /r and /s links resolve across isolates only with Supabase and/or Upstash KV. */
export function isSharingPersistenceAvailable(): boolean {
  return false;
}

export interface StoredConsultation {
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
  lines: Array<{
    position: 1 | 2 | 3 | 4 | 5 | 6;
    value: 6 | 7 | 8 | 9;
    isChanging: boolean;
    symbol: string;
  }>;
  changingLines: number[];
  interpretation: string;
  interpretationSummary?: string;
  category: string;
  imageProvider:
    | "mock"
    | "svg-art"
    | "pollinations"
    | "fal"
    | "gpt-image"
    | "together";
  imageUrl: string;
  imageFallbackUrl?: string;
  publicId: string;
  createdAt: number;
  oracleType: OracleType;
  oracleBones?: OracleBonesHistorySnapshot | null;
}

export interface StoredSession {
  sessionId: string;
  title: string;
  themeCategory: string;
  language: string;
  publicId: string;
  consultationIds: string[];
  createdAt: number;
  /** Max chained readings per thread when the session was created (from `max_consultations`). */
  maxConsultations?: number | null;
}

export interface UserSessionWithConsultations {
  session: StoredSession;
  consultations: StoredConsultation[];
}

export interface UserSessionSummary {
  session: StoredSession;
  messageCount: number;
  firstConsultationAt: number | null;
  updatedAt: number;
  firstQuestion: string | null;
}

/** Map a Supabase consultations row to StoredConsultation (shared shape for reads + KV mirror). */
function consultationFromDbRow(data: {
  id: string;
  session_id: string;
  session_position: number;
  question: string;
  language: string;
  lines: StoredConsultation["lines"];
  primary_hexagram_number: number;
  primary_hexagram_name: string;
  primary_hexagram_chinese: string;
  transformed_hexagram_number: number | null;
  transformed_hexagram_name: string | null;
  changing_lines: number[];
  mutation_rule: string;
  translator?: string | null;
  category: string;
  interpretation: string;
  image_url: string | null;
  thumbnail_url: string | null;
  public_sharing_id: string;
  created_at: string;
  oracle_type?: string | null;
  oracle_bones?: OracleBonesHistorySnapshot | null;
}): StoredConsultation {
  return {
    consultationId: data.id,
    sessionId: data.session_id,
    sessionPosition: data.session_position,
    question: data.question,
    language: data.language,
    primaryHexagram: data.primary_hexagram_number,
    primaryHexagramName: data.primary_hexagram_name,
    primaryHexagramChinese: data.primary_hexagram_chinese,
    transformedHexagram: data.transformed_hexagram_number,
    transformedHexagramName: data.transformed_hexagram_name,
    transformedHexagramChinese: data.transformed_hexagram_number != null
      ? (getHexagramRecordByNumber(data.transformed_hexagram_number)?.chineseName ?? null)
      : null,
    mutationRule: data.mutation_rule,
    translator: data.translator ?? null,
    lines: data.lines,
    changingLines: data.changing_lines,
    interpretation: data.interpretation,
    category: data.category,
    imageProvider: imageProviderFromUrl(data.image_url),
    imageUrl: data.image_url ?? "/oracle-fallback.svg",
    imageFallbackUrl: data.thumbnail_url ?? undefined,
    publicId: data.public_sharing_id,
    createdAt: new Date(data.created_at).getTime(),
    oracleType: (data.oracle_type as OracleType) ?? "iching",
    oracleBones: data.oracle_bones ?? null,
  };
}

const sessions = new Map<string, StoredSession>();
const consultations = new Map<string, StoredConsultation>();
const consultationByPublicId = new Map<string, string>();
const sessionByPublicId = new Map<string, string>();

export function isChatPersistenceConfigured(): boolean {
  return Boolean(getSupabaseAdmin());
}

function imageProviderFromUrl(
  url: string | null | undefined,
): StoredConsultation["imageProvider"] {
  if (!url) return "mock";
  if (url.startsWith("data:image/svg+xml")) return "svg-art";
  if (url.includes("pollinations")) return "pollinations";
  if (url.includes("fal.ai")) return "fal";
  if (url.includes("openai")) return "gpt-image";
  if (url.includes("together") || url.includes("api.together"))
    return "together";
  return "mock";
}

function randomPublicId(length = 8): string {
  const bytesNeeded = Math.max(6, Math.ceil((length * 3) / 4));
  return randomBytes(bytesNeeded).toString("base64url").slice(0, length);
}

export function ensureSession(params: {
  sessionId: string;
  title: string;
  themeCategory: string;
  language: string;
}): StoredSession {
  const existing = sessions.get(params.sessionId);
  if (existing) return existing;
  const s: StoredSession = {
    sessionId: params.sessionId,
    title: params.title,
    themeCategory: params.themeCategory,
    language: params.language,
    publicId: randomPublicId(8),
    consultationIds: [],
    createdAt: Date.now(),
  };
  sessions.set(params.sessionId, s);
  sessionByPublicId.set(s.publicId, s.sessionId);
  return s;
}

export function saveConsultation(
  input: Omit<StoredConsultation, "publicId" | "createdAt">,
): StoredConsultation {
  const saved: StoredConsultation = {
    ...input,
    publicId: randomPublicId(8),
    createdAt: Date.now(),
  };
  consultations.set(saved.consultationId, saved);
  consultationByPublicId.set(saved.publicId, saved.consultationId);
  const s = sessions.get(saved.sessionId);
  if (s && !s.consultationIds.includes(saved.consultationId)) {
    s.consultationIds.push(saved.consultationId);
  }
  return saved;
}

export async function getConsultationByPublicId(
  publicId: string,
): Promise<StoredConsultation | null> {
  void publicId;
  return null;
}

export async function getSessionByPublicId(publicId: string): Promise<{
  session: StoredSession;
  consultations: StoredConsultation[];
} | null> {
  void publicId;
  return null;
}

export async function upsertSessionAndConsultation(params: {
  /** Required when persisting to Supabase (FK + RLS). */
  userId: string;
  sessionId: string;
  sessionTitle: string;
  language: string;
  category: string;
  maxConsultations: number;
  consultation: Omit<StoredConsultation, "publicId" | "createdAt">;
}): Promise<{ publicReadingId: string; publicSessionId: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !isPersistableUuid(params.sessionId)) {
    const session = ensureSession({
      sessionId: params.sessionId,
      title: params.sessionTitle,
      themeCategory: params.category,
      language: params.language,
    });
    const saved = saveConsultation(params.consultation);
    return {
      publicReadingId: saved.publicId,
      publicSessionId: session.publicId,
    };
  }

  const { data: existingSession, error: existingSessionError } = await supabase
    .from("consultation_sessions")
    .select("id, public_sharing_id")
    .eq("id", params.sessionId)
    .maybeSingle();
  if (existingSessionError) {
    throw new Error(
      `consultation_session_lookup_failed:${existingSessionError.message}`,
    );
  }
  let sessionPublicId = existingSession?.public_sharing_id as
    | string
    | undefined;
  if (!existingSession) {
    const { data: created, error: createSessionError } = await supabase
      .from("consultation_sessions")
      .insert({
        id: params.sessionId,
        user_id: params.userId,
        title: params.sessionTitle,
        theme_category: params.category,
        language: params.language,
        max_consultations: params.maxConsultations,
      })
      .select("public_sharing_id")
      .single();
    if (createSessionError) {
      throw new Error(
        `consultation_session_create_failed:${createSessionError.message}`,
      );
    }
    sessionPublicId = created?.public_sharing_id;
  }
  const consultationBasePayload = {
    id: params.consultation.consultationId,
    user_id: params.userId,
    session_id: params.consultation.sessionId,
    session_position: params.consultation.sessionPosition,
    question: params.consultation.question,
    language: params.consultation.language,
    lines: params.consultation.lines,
    primary_hexagram_number: params.consultation.primaryHexagram,
    primary_hexagram_name: params.consultation.primaryHexagramName,
    primary_hexagram_chinese: params.consultation.primaryHexagramChinese,
    transformed_hexagram_number: params.consultation.transformedHexagram,
    transformed_hexagram_name: params.consultation.transformedHexagramName,
    changing_lines: params.consultation.changingLines,
    mutation_rule: params.consultation.mutationRule,
    translator: params.consultation.translator ?? null,
    category: params.consultation.category,
    interpretation: params.consultation.interpretation,
    image_url: params.consultation.imageUrl,
    thumbnail_url:
      params.consultation.imageFallbackUrl ?? params.consultation.imageUrl,
    is_public: false,
  };
  let createdConsultation: { public_sharing_id?: string } | null = null;
  let createConsultationError: string | null = null;
  const withOraclePayload = {
    ...consultationBasePayload,
    oracle_type: params.consultation.oracleType,
    oracle_bones: params.consultation.oracleBones ?? null,
  };
  const withOracleRes = await supabase
    .from("consultations")
    .insert(withOraclePayload)
    .select("public_sharing_id")
    .single();
  if (!withOracleRes.error) {
    createdConsultation = withOracleRes.data;
  } else {
    const msg = withOracleRes.error.message ?? "";
    // Backward-compatible path for DBs missing oracle_bones/oracle_type columns.
    if (msg.includes("oracle_type") || msg.includes("oracle_bones")) {
      const fallbackRes = await supabase
        .from("consultations")
        .insert(consultationBasePayload)
        .select("public_sharing_id")
        .single();
      if (!fallbackRes.error) {
        createdConsultation = fallbackRes.data;
      } else {
        createConsultationError = fallbackRes.error.message;
      }
    } else {
      createConsultationError = msg;
    }
  }
  if (createConsultationError) {
    throw new Error(`consultation_create_failed:${createConsultationError}`);
  }

  const { data: sessionRefresh, error: sessionRefreshError } = await supabase
    .from("consultation_sessions")
    .select("public_sharing_id")
    .eq("id", params.sessionId)
    .maybeSingle();
  if (sessionRefreshError) {
    throw new Error(
      `consultation_session_refresh_failed:${sessionRefreshError.message}`,
    );
  }
  const finalSessionPublicId =
    (sessionRefresh?.public_sharing_id as string | undefined) ??
    sessionPublicId;

  return {
    publicReadingId:
      createdConsultation?.public_sharing_id ?? randomPublicId(8),
    publicSessionId: finalSessionPublicId ?? randomPublicId(8),
  };
}

export async function getUserSessionsWithConsultations(
  userId: string,
): Promise<UserSessionWithConsultations[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data: sessionRows, error: sessionsError } = await supabase
    .from("consultation_sessions")
    .select(
      "id, title, theme_category, language, public_sharing_id, created_at, max_consultations",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (sessionsError || !sessionRows?.length) return [];

  const legacyBaseColumns =
    "id, session_id, session_position, question, language, lines, primary_hexagram_number, primary_hexagram_name, primary_hexagram_chinese, transformed_hexagram_number, transformed_hexagram_name, changing_lines, mutation_rule, category, interpretation, interpretation_summary, image_url, thumbnail_url, public_sharing_id, created_at";
  const baseConsultColumns = `${legacyBaseColumns}, translator`;
  const withOracleLegacyColumns = `${legacyBaseColumns}, oracle_type, oracle_bones`;
  const withOracleColumns = `${baseConsultColumns}, oracle_type, oracle_bones`;

  let consultRows: unknown[] | null = null;
  let consultError: { message?: string } | null = null;

  const withOracleRes = await supabase
    .from("consultations")
    .select(withOracleColumns)
    .eq("user_id", userId)
    .order("session_position", { ascending: true });
  consultRows = withOracleRes.data as unknown[] | null;
  consultError = withOracleRes.error;

  if (consultError) {
    const msg = consultError.message ?? "";
    if (msg.includes("oracle_type") || msg.includes("oracle_bones")) {
      // DB missing oracle columns → try with translator, no oracle columns
      const fallbackRes = await supabase
        .from("consultations")
        .select(baseConsultColumns)
        .eq("user_id", userId)
        .order("session_position", { ascending: true });
      consultRows = fallbackRes.data as unknown[] | null;
      consultError = fallbackRes.error;
      if (consultError) {
        const msg2 = consultError.message ?? "";
        if (msg2.includes("translator")) {
          // Very old DB — no oracle columns and no translator
          const legacyRes = await supabase
            .from("consultations")
            .select(legacyBaseColumns)
            .eq("user_id", userId)
            .order("session_position", { ascending: true });
          consultRows = legacyRes.data as unknown[] | null;
          consultError = legacyRes.error;
        }
      }
    } else if (msg.includes("translator")) {
      // DB has oracle columns but translator column not yet migrated
      const fallbackRes = await supabase
        .from("consultations")
        .select(withOracleLegacyColumns)
        .eq("user_id", userId)
        .order("session_position", { ascending: true });
      consultRows = fallbackRes.data as unknown[] | null;
      consultError = fallbackRes.error;
      if (consultError) {
        // Very old DB — also missing oracle columns
        const legacyRes = await supabase
          .from("consultations")
          .select(legacyBaseColumns)
          .eq("user_id", userId)
          .order("session_position", { ascending: true });
        consultRows = legacyRes.data as unknown[] | null;
        consultError = legacyRes.error;
      }
    }
  }
  if (consultError) return [];

  const bySession = new Map<string, StoredConsultation[]>();
  for (const row of consultRows ?? []) {
    const mapped = consultationFromDbRow(row as never);
    const list = bySession.get(mapped.sessionId) ?? [];
    list.push(mapped);
    bySession.set(mapped.sessionId, list);
  }

  return sessionRows.map((s) => {
    const rows = bySession.get(s.id) ?? [];
    const maxFromDb =
      typeof (s as { max_consultations?: number | null }).max_consultations ===
      "number"
        ? (s as { max_consultations: number }).max_consultations
        : (s as { max_consultations?: number | null }).max_consultations ===
            null
          ? null
          : undefined;
    const maxConsultations =
      maxFromDb ??
      (rows.length ? Math.max(...rows.map((r) => r.sessionPosition), 1) : 1);
    return {
      session: {
        sessionId: s.id,
        title: s.title ?? "",
        themeCategory: s.theme_category,
        language: s.language,
        publicId: s.public_sharing_id,
        consultationIds: rows.map((r) => r.consultationId),
        createdAt: new Date(s.created_at).getTime(),
        maxConsultations,
      },
      consultations: rows.sort((a, b) => a.sessionPosition - b.sessionPosition),
    };
  });
}

export async function getUserSessionSummaries(
  userId: string,
): Promise<UserSessionSummary[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: sessionRows, error: sessionsError } = await supabase
    .from("consultation_sessions")
    .select(
      "id, title, theme_category, language, public_sharing_id, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (sessionsError || !sessionRows?.length) return [];


  const { data: consultRows, error: consultError } = await supabase
    .from("consultations")
    .select("session_id, created_at, question, session_position")
    .eq("user_id", userId)
    .order("session_position", { ascending: true });
  if (consultError) return [];

  const bySession = new Map<
    string,
    {
      count: number;
      firstAt: number | null;
      lastAt: number | null;
      firstQuestion: string | null;
    }
  >();
  for (const row of consultRows ?? []) {
    const sessionId = String((row as { session_id: string }).session_id);
    const createdAt = new Date(
      (row as { created_at: string }).created_at,
    ).getTime();
    const question = String(
      (row as { question?: string }).question ?? "",
    ).trim();
    const current = bySession.get(sessionId);
    if (!current) {
      bySession.set(sessionId, {
        count: 1,
        firstAt: createdAt,
        lastAt: createdAt,
        firstQuestion: question || null,
      });
      continue;
    }
    bySession.set(sessionId, {
      count: current.count + 1,
      firstAt: current.firstAt ?? createdAt,
      lastAt: createdAt,
      firstQuestion: current.firstQuestion ?? (question || null),
    });
  }

  return sessionRows.map((s) => {
    const agg = bySession.get(s.id);
    const createdAt = new Date(s.created_at).getTime();
    return {
      session: {
        sessionId: s.id,
        title: s.title ?? "",
        themeCategory: s.theme_category,
        language: s.language,
        publicId: s.public_sharing_id,
        consultationIds: [],
        createdAt,
      },
      messageCount: agg?.count ?? 0,
      firstConsultationAt: agg?.firstAt ?? null,
      updatedAt: agg?.lastAt ?? createdAt,
      firstQuestion: agg?.firstQuestion ?? null,
    };
  });
}

export async function getUserSessionWithConsultations(
  userId: string,
  sessionId: string,
): Promise<UserSessionWithConsultations | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: sessionRow, error: sessionError } = await supabase
    .from("consultation_sessions")
    .select(
      "id, title, theme_category, language, public_sharing_id, created_at, max_consultations",
    )
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (sessionError) {
    throw new Error(`db_session_lookup_failed:${sessionError.message}`);
  }
  if (!sessionRow) return null;

  const legacyBaseColumns =
    "id, session_id, session_position, question, language, lines, primary_hexagram_number, primary_hexagram_name, primary_hexagram_chinese, transformed_hexagram_number, transformed_hexagram_name, changing_lines, mutation_rule, category, interpretation, interpretation_summary, image_url, thumbnail_url, public_sharing_id, created_at";
  const baseConsultColumns = `${legacyBaseColumns}, translator`;
  const withOracleLegacyColumns = `${legacyBaseColumns}, oracle_type, oracle_bones`;
  const withOracleColumns = `${baseConsultColumns}, oracle_type, oracle_bones`;

  let consultRows: unknown[] | null = null;
  let consultError: { message?: string } | null = null;

  const withOracleRes = await supabase
    .from("consultations")
    .select(withOracleColumns)
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .order("session_position", { ascending: true });
  consultRows = withOracleRes.data as unknown[] | null;
  consultError = withOracleRes.error;

  if (consultError) {
    const msg = consultError.message ?? "";
    if (msg.includes("oracle_type") || msg.includes("oracle_bones")) {
      // DB missing oracle columns → try with translator, no oracle columns
      const fallbackRes = await supabase
        .from("consultations")
        .select(baseConsultColumns)
        .eq("user_id", userId)
        .eq("session_id", sessionId)
        .order("session_position", { ascending: true });
      consultRows = fallbackRes.data as unknown[] | null;
      consultError = fallbackRes.error;
      if (consultError) {
        const msg2 = consultError.message ?? "";
        if (msg2.includes("translator")) {
          // Very old DB — no oracle columns and no translator
          const legacyRes = await supabase
            .from("consultations")
            .select(legacyBaseColumns)
            .eq("user_id", userId)
            .eq("session_id", sessionId)
            .order("session_position", { ascending: true });
          consultRows = legacyRes.data as unknown[] | null;
          consultError = legacyRes.error;
        }
      }
    } else if (msg.includes("translator")) {
      // DB has oracle columns but translator column not yet migrated
      const fallbackRes = await supabase
        .from("consultations")
        .select(withOracleLegacyColumns)
        .eq("user_id", userId)
        .eq("session_id", sessionId)
        .order("session_position", { ascending: true });
      consultRows = fallbackRes.data as unknown[] | null;
      consultError = fallbackRes.error;
      if (consultError) {
        // Very old DB — also missing oracle columns
        const legacyRes = await supabase
          .from("consultations")
          .select(legacyBaseColumns)
          .eq("user_id", userId)
          .eq("session_id", sessionId)
          .order("session_position", { ascending: true });
        consultRows = legacyRes.data as unknown[] | null;
        consultError = legacyRes.error;
      }
    }
  }
  if (consultError) return null;

  const consultations = (consultRows ?? []).map((row) =>
    consultationFromDbRow(row as never),
  );
  const sorted = consultations.sort(
    (a, b) => a.sessionPosition - b.sessionPosition,
  );
  const maxFromDb =
    typeof (sessionRow as { max_consultations?: number | null })
      .max_consultations === "number"
      ? (sessionRow as { max_consultations: number }).max_consultations
      : (sessionRow as { max_consultations?: number | null })
            .max_consultations === null
        ? null
        : undefined;
  const maxConsultations =
    maxFromDb ??
    (sorted.length ? Math.max(...sorted.map((r) => r.sessionPosition), 1) : 1);
  return {
    session: {
      sessionId: sessionRow.id,
      title: sessionRow.title ?? "",
      themeCategory: sessionRow.theme_category,
      language: sessionRow.language,
      publicId: sessionRow.public_sharing_id,
      consultationIds: sorted.map((r) => r.consultationId),
      createdAt: new Date(sessionRow.created_at).getTime(),
      maxConsultations,
    },
    consultations: sorted,
  };
}

// ─── Two-phase thread loading ────────────────────────────────────────────────
// Phase 1 (meta): all columns EXCEPT interpretation and oracle_bones.
// These are the TOAST-heavy columns that can cause 10-15s reads on cold
// shared_buffers. Fetching metadata first lets the UI render the thread
// structure instantly (<5ms always) while Phase 2 loads content in background.
//
// Phase 2 (content): only id + interpretation + oracle_bones.
// Targeted TOAST fetch per session — replaces placeholders from Phase 1.
// ─────────────────────────────────────────────────────────────────────────────

const META_COLS_LEGACY =
  "id, session_id, session_position, question, language, lines, primary_hexagram_number, primary_hexagram_name, primary_hexagram_chinese, transformed_hexagram_number, transformed_hexagram_name, changing_lines, mutation_rule, category, interpretation_summary, image_url, thumbnail_url, public_sharing_id, created_at";
const META_COLS_BASE = `${META_COLS_LEGACY}, translator`;
const META_COLS_WITH_ORACLE_LEGACY = `${META_COLS_LEGACY}, oracle_type`;
const META_COLS_WITH_ORACLE = `${META_COLS_BASE}, oracle_type`;

/** Build a StoredConsultation from a meta-only row (no interpretation/oracle_bones).
 *  Sets interpretation = interpretation_summary so the UI has a readable placeholder. */
function consultationMetaFromDbRow(data: {
  id: string;
  session_id: string;
  session_position: number;
  question: string;
  language: string;
  lines: StoredConsultation["lines"];
  primary_hexagram_number: number;
  primary_hexagram_name: string;
  primary_hexagram_chinese: string;
  transformed_hexagram_number: number | null;
  transformed_hexagram_name: string | null;
  changing_lines: number[];
  mutation_rule: string;
  translator?: string | null;
  category: string;
  interpretation_summary?: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  public_sharing_id: string;
  created_at: string;
  oracle_type?: string | null;
}): StoredConsultation {
  return {
    consultationId: data.id,
    sessionId: data.session_id,
    sessionPosition: data.session_position,
    question: data.question,
    language: data.language,
    primaryHexagram: data.primary_hexagram_number,
    primaryHexagramName: data.primary_hexagram_name,
    primaryHexagramChinese: data.primary_hexagram_chinese,
    transformedHexagram: data.transformed_hexagram_number,
    transformedHexagramName: data.transformed_hexagram_name,
    transformedHexagramChinese:
      data.transformed_hexagram_number != null
        ? (getHexagramRecordByNumber(data.transformed_hexagram_number)?.chineseName ?? null)
        : null,
    mutationRule: data.mutation_rule,
    translator: data.translator ?? null,
    lines: data.lines,
    changingLines: data.changing_lines,
    interpretation: data.interpretation_summary ?? "",
    interpretationSummary: data.interpretation_summary ?? undefined,
    category: data.category,
    imageProvider: imageProviderFromUrl(data.image_url),
    imageUrl: data.image_url ?? "/oracle-fallback.svg",
    imageFallbackUrl: data.thumbnail_url ?? undefined,
    publicId: data.public_sharing_id,
    createdAt: new Date(data.created_at).getTime(),
    oracleType: (data.oracle_type as OracleType) ?? "iching",
    oracleBones: null,
  };
}

/** Phase 1 — fetch thread metadata without TOAST columns.
 *  Always completes in <5ms regardless of shared_buffers state.
 *  interpretation is set to interpretation_summary as a readable placeholder. */
export async function getUserSessionThreadMeta(
  userId: string,
  sessionId: string,
): Promise<UserSessionWithConsultations | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: sessionRow, error: sessionError } = await supabase
    .from("consultation_sessions")
    .select("id, title, theme_category, language, public_sharing_id, created_at, max_consultations")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (sessionError) throw new Error(`db_session_meta_failed:${sessionError.message}`);
  if (!sessionRow) return null;

  let consultRows: unknown[] | null = null;
  let consultError: { message?: string } | null = null;

  const res = await supabase
    .from("consultations")
    .select(META_COLS_WITH_ORACLE)
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .order("session_position", { ascending: true });
  consultRows = res.data as unknown[] | null;
  consultError = res.error;

  if (consultError) {
    const msg = consultError.message ?? "";
    if (msg.includes("oracle_type")) {
      const r2 = await supabase
        .from("consultations")
        .select(META_COLS_BASE)
        .eq("user_id", userId)
        .eq("session_id", sessionId)
        .order("session_position", { ascending: true });
      consultRows = r2.data as unknown[] | null;
      consultError = r2.error;
      if (consultError?.message?.includes("translator")) {
        const r3 = await supabase
          .from("consultations")
          .select(META_COLS_LEGACY)
          .eq("user_id", userId)
          .eq("session_id", sessionId)
          .order("session_position", { ascending: true });
        consultRows = r3.data as unknown[] | null;
        consultError = r3.error;
      }
    } else if (msg.includes("translator")) {
      const r2 = await supabase
        .from("consultations")
        .select(META_COLS_WITH_ORACLE_LEGACY)
        .eq("user_id", userId)
        .eq("session_id", sessionId)
        .order("session_position", { ascending: true });
      consultRows = r2.data as unknown[] | null;
      consultError = r2.error;
      if (consultError) {
        const r3 = await supabase
          .from("consultations")
          .select(META_COLS_LEGACY)
          .eq("user_id", userId)
          .eq("session_id", sessionId)
          .order("session_position", { ascending: true });
        consultRows = r3.data as unknown[] | null;
        consultError = r3.error;
      }
    }
  }
  if (consultError) return null;

  const sorted = (consultRows ?? [])
    .map((row) => consultationMetaFromDbRow(row as never))
    .sort((a, b) => a.sessionPosition - b.sessionPosition);

  const maxFromDb =
    typeof (sessionRow as { max_consultations?: number | null }).max_consultations === "number"
      ? (sessionRow as { max_consultations: number }).max_consultations
      : (sessionRow as { max_consultations?: number | null }).max_consultations === null
        ? null
        : undefined;
  const maxConsultations =
    maxFromDb ?? (sorted.length ? Math.max(...sorted.map((r) => r.sessionPosition), 1) : 1);

  return {
    session: {
      sessionId: sessionRow.id,
      title: sessionRow.title ?? "",
      themeCategory: sessionRow.theme_category,
      language: sessionRow.language,
      publicId: sessionRow.public_sharing_id,
      consultationIds: sorted.map((r) => r.consultationId),
      createdAt: new Date(sessionRow.created_at).getTime(),
      maxConsultations,
    },
    consultations: sorted,
  };
}

export interface ThreadContentRow {
  consultationId: string;
  interpretation: string;
  oracleBones: OracleBonesHistorySnapshot | null;
}

/** Phase 2 — fetch only the TOAST-heavy columns for a session.
 *  Uses get_session_content_safe RPC which sets statement_timeout = '8s' internally.
 *  This ensures a clean SQL error is returned if TOAST pages are cold, rather than
 *  letting Warp kill the HTTP thread after ~10 s (which floods logs with
 *  "Thread killed by timeout manager"). Caller degrades gracefully on error. */
export async function getUserSessionThreadContent(
  userId: string,
  sessionId: string,
): Promise<ThreadContentRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_session_content_safe", {
    p_user_id: userId,
    p_session_id: sessionId,
  });
  if (error || !data) return [];

  return (data as Array<{ consultation_id: string; interpretation: string; oracle_bones: OracleBonesHistorySnapshot | null }>).map((row) => ({
    consultationId: row.consultation_id,
    interpretation: row.interpretation ?? "",
    oracleBones: row.oracle_bones ?? null,
  }));
}

export async function deleteUserSession(
  userId: string,
  sessionId: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !isPersistableUuid(sessionId)) {
    const session = sessions.get(sessionId);
    if (!session) return false;
    if (session.consultationIds.length > 0) {
      for (const id of session.consultationIds) {
        const row = consultations.get(id);
        if (row) consultationByPublicId.delete(row.publicId);
        consultations.delete(id);
      }
    }
    sessionByPublicId.delete(session.publicId);
    sessions.delete(sessionId);
    return true;
  }

  const { error: consultDeleteError } = await supabase
    .from("consultations")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", userId);
  if (consultDeleteError) {
    throw new Error(
      `consultations_delete_failed:${consultDeleteError.message}`,
    );
  }

  const { data: deletedSessions, error: sessionDeleteError } = await supabase
    .from("consultation_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId)
    .select("id");
  if (sessionDeleteError) {
    throw new Error(
      `consultation_session_delete_failed:${sessionDeleteError.message}`,
    );
  }

  return Array.isArray(deletedSessions) && deletedSessions.length > 0;
}
