import type {
  OracleBonesHistorySnapshot,
  OracleType,
} from "@iching-oracle/context-engine";
import { getHexagramRecordByNumber } from "@iching-oracle/iching-data";
import { getSupabaseAdmin, withSupabaseSemaphore } from "@/lib/supabase-admin";
import { getUpstashRedis } from "@/lib/rate-limit";
import type { SupabaseOpTelemetry } from "@/lib/supabase-telemetry";
import { isPersistableUuid } from "@/lib/session-ids";
import { randomBytes } from "node:crypto";
import { Logger } from "next-axiom";

const SESSION_SUMMARIES_CACHE_TTL_SECONDS = 60;

function sessionSummariesCacheKey(userId: string): string {
  return `session_summaries:${userId}`;
}

export async function invalidateSessionSummariesCache(userId: string): Promise<void> {
  try {
    await getUpstashRedis()?.del(sessionSummariesCacheKey(userId));
  } catch {
    // Non-fatal — cache will expire naturally via TTL
  }
}

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
  lineReadingSystem?: "huang" | "zhuxi" | null;
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
  semaphoreTelemetry?: SupabaseOpTelemetry;
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
    line_reading_system: params.consultation.lineReadingSystem ?? "huang",
    category: params.consultation.category,
    image_url: params.consultation.imageUrl,
    thumbnail_url:
      params.consultation.imageFallbackUrl ?? params.consultation.imageUrl,
    is_public: false,
  };

  const interpretationText = params.consultation.interpretation?.trim() ?? "";

  const persistOutcome = await withSupabaseSemaphore(async () => {
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
    let sessionPublicId = existingSession?.public_sharing_id as string | undefined;
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

    let persistedViaRpc = false;
    let readingPublicId: string | undefined;

    const { data: publicId, error: rpcError } = await supabase.rpc(
      "persist_consultation_with_content",
      {
        p_user_id: params.userId,
        p_id: params.consultation.consultationId,
        p_session_id: params.consultation.sessionId,
        p_session_position: params.consultation.sessionPosition,
        p_question: params.consultation.question,
        p_language: params.consultation.language,
        p_lines: params.consultation.lines,
        p_primary_hexagram_number: params.consultation.primaryHexagram,
        p_primary_hexagram_name: params.consultation.primaryHexagramName,
        p_primary_hexagram_chinese: params.consultation.primaryHexagramChinese,
        p_transformed_hexagram_number: params.consultation.transformedHexagram,
        p_transformed_hexagram_name: params.consultation.transformedHexagramName,
        p_changing_lines: params.consultation.changingLines,
        p_mutation_rule: params.consultation.mutationRule,
        p_translator: params.consultation.translator ?? null,
        p_category: params.consultation.category,
        p_interpretation_summary: params.consultation.interpretationSummary ?? null,
        p_image_url: params.consultation.imageUrl,
        p_thumbnail_url:
          params.consultation.imageFallbackUrl ?? params.consultation.imageUrl,
        p_oracle_type: params.consultation.oracleType,
        p_interpretation: params.consultation.interpretation,
        p_oracle_bones: params.consultation.oracleBones ?? null,
        p_is_public: false,
        p_line_reading_system: params.consultation.lineReadingSystem ?? "huang",
      },
    );

    if (rpcError) {
      const msg = rpcError.message ?? "";
      // Fallback for DBs without migration 067 (staging lag).
      if (
        msg.includes("persist_consultation_with_content") ||
        msg.includes("Could not find the function")
      ) {
        new Logger({ source: "lib/session-store" }).warn(
          "persist_rpc_fallback_engaged",
          {
            userId: params.userId,
            sessionId: params.consultation.sessionId,
            rpcError: msg,
          },
        );
        const withOraclePayload = {
          ...consultationBasePayload,
          interpretation: params.consultation.interpretation,
          oracle_type: params.consultation.oracleType,
          oracle_bones: params.consultation.oracleBones ?? null,
        };
        const withOracleRes = await supabase
          .from("consultations")
          .insert(withOraclePayload)
          .select("public_sharing_id")
          .single();
        if (!withOracleRes.error) {
          readingPublicId = withOracleRes.data?.public_sharing_id ?? undefined;
        } else {
          const fallbackMsg = withOracleRes.error.message ?? "";
          if (fallbackMsg.includes("oracle_type") || fallbackMsg.includes("oracle_bones")) {
            const fallbackRes = await supabase
              .from("consultations")
              .insert({
                ...consultationBasePayload,
                interpretation: params.consultation.interpretation,
              })
              .select("public_sharing_id")
              .single();
            if (fallbackRes.error) {
              return { error: fallbackRes.error.message };
            }
            readingPublicId = fallbackRes.data?.public_sharing_id ?? undefined;
          } else {
            return { error: fallbackMsg };
          }
        }
      } else {
        return { error: msg };
      }
    } else {
      persistedViaRpc = true;
      readingPublicId = (publicId as string | null) ?? undefined;
    }

    // RPC 069 already writes consultation_content; upsert only for legacy insert path.
    if (!persistedViaRpc && interpretationText.length > 0) {
      const { error: contentUpsertError } = await supabase
        .from("consultation_content")
        .upsert(
          {
            consultation_id: params.consultation.consultationId,
            user_id: params.userId,
            session_id: params.consultation.sessionId,
            interpretation: interpretationText,
            oracle_bones: params.consultation.oracleBones ?? null,
          },
          { onConflict: "consultation_id" },
        );
      if (contentUpsertError) {
        throw new Error(
          `consultation_content_upsert_failed:${contentUpsertError.message}`,
        );
      }
    }

    let finalSessionPublicId = sessionPublicId;
    if (!finalSessionPublicId) {
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
      finalSessionPublicId = sessionRefresh?.public_sharing_id as string | undefined;
    }

    return {
      publicReadingId: readingPublicId,
      publicSessionId: finalSessionPublicId,
    };
  }, params.semaphoreTelemetry);

  if ("error" in persistOutcome && persistOutcome.error) {
    throw new Error(`consultation_create_failed:${persistOutcome.error}`);
  }

  // Invalidate session summaries cache so next bootstrap sees the new consultation.
  void invalidateSessionSummariesCache(params.userId);

  return {
    publicReadingId: persistOutcome.publicReadingId ?? randomPublicId(8),
    publicSessionId: persistOutcome.publicSessionId ?? randomPublicId(8),
  };
}

export async function getUserSessionSummaries(
  userId: string,
): Promise<UserSessionSummary[]> {
  const redis = getUpstashRedis();
  const cacheKey = sessionSummariesCacheKey(userId);

  // Serve from Redis cache when available — avoids 2 PostgREST queries per bootstrap.
  if (redis) {
    try {
      const cached = await redis.get<UserSessionSummary[]>(cacheKey);
      if (cached) return cached;
    } catch {
      // Non-fatal — fall through to DB query
    }
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  // Single RPC replaces the previous 2-query pattern (sessions SELECT + consultations SELECT).
  const { data, error } = await supabase.rpc("get_user_session_summaries", {
    p_user_id: userId,
  });
  if (error || !data) return [];

  const result: UserSessionSummary[] = (data as Array<{
    session_id: string;
    title: string | null;
    theme_category: string | null;
    language: string | null;
    public_sharing_id: string | null;
    session_created_at: string;
    consultation_count: number | string;
    first_question: string | null;
    first_consultation_at: string | null;
    last_consultation_at: string | null;
  }>).map((row) => {
    const createdAt = new Date(row.session_created_at).getTime();
    return {
      session: {
        sessionId: row.session_id,
        title: row.title ?? "",
        themeCategory: row.theme_category ?? "",
        language: row.language ?? "",
        publicId: row.public_sharing_id ?? "",
        consultationIds: [],
        createdAt,
      },
      messageCount: Number(row.consultation_count),
      firstConsultationAt: row.first_consultation_at
        ? new Date(row.first_consultation_at).getTime()
        : null,
      updatedAt: row.last_consultation_at
        ? new Date(row.last_consultation_at).getTime()
        : createdAt,
      firstQuestion: row.first_question ?? null,
    };
  });

  if (redis && result.length > 0) {
    try {
      await redis.set(cacheKey, result, { ex: SESSION_SUMMARIES_CACHE_TTL_SECONDS });
    } catch {
      // Non-fatal
    }
  }

  return result;
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
const META_COLS_BASE = `${META_COLS_LEGACY}, translator, line_reading_system`;
const META_COLS_WITH_ORACLE_LEGACY = `${META_COLS_LEGACY}, oracle_type`;
const META_COLS_WITH_ORACLE = `${META_COLS_BASE}, oracle_type`;
// translator + oracle_type WITHOUT line_reading_system: recovers reads while
// migration 074 has not landed yet but translator/oracle_type already exist.
const META_COLS_WITH_ORACLE_NO_LRS = `${META_COLS_LEGACY}, translator, oracle_type`;

// Descending column ladder (richest first). The reader walks down this list on a
// "missing optional column" error so a lagging migration degrades to fewer columns
// instead of returning null (which would make the whole thread fail to load).
const META_COL_TIERS: readonly string[] = [
  META_COLS_WITH_ORACLE,
  META_COLS_BASE,
  META_COLS_WITH_ORACLE_NO_LRS,
  META_COLS_WITH_ORACLE_LEGACY,
  META_COLS_LEGACY,
];
const OPTIONAL_META_COLUMNS = ["line_reading_system", "translator", "oracle_type"] as const;

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
  line_reading_system?: string | null;
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
    lineReadingSystem: (data.line_reading_system as "huang" | "zhuxi" | null) ?? "huang",
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

  // Walk the column ladder: on a missing optional column (e.g. line_reading_system
  // before migration 074 lands, or translator/oracle_type on a lagging env) step
  // down to a smaller column set instead of failing the entire thread read. A
  // non-column error (network, RLS, etc.) stops the walk and surfaces as null.
  for (const cols of META_COL_TIERS) {
    const r = await supabase
      .from("consultations")
      .select(cols)
      .eq("user_id", userId)
      .eq("session_id", sessionId)
      .order("session_position", { ascending: true });
    consultRows = r.data as unknown[] | null;
    consultError = r.error;
    if (!consultError) break;
    const msg = consultError.message ?? "";
    if (!OPTIONAL_META_COLUMNS.some((c) => msg.includes(c))) break;
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
 *  Uses get_session_content_safe RPC (statement_timeout = 2s in migration 064).
 *  Returns [] on timeout; caller degrades gracefully to interpretation_summary placeholders. */
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

/** Merge TOAST content rows into meta-only consultations (shared by thread=1 API). */
export function mergeConsultationsWithContent(
  consultations: StoredConsultation[],
  contentRows: ThreadContentRow[],
): StoredConsultation[] {
  if (contentRows.length === 0) return consultations;
  const contentMap = new Map(contentRows.map((r) => [r.consultationId, r]));
  return consultations.map((c) => {
    const content = contentMap.get(c.consultationId);
    if (!content) return c;
    const mergedInterpretation =
      content.interpretation && content.interpretation.length > c.interpretation.length
        ? content.interpretation
        : c.interpretation || content.interpretation;
    return {
      ...c,
      interpretation: mergedInterpretation,
      oracleBones: content.oracleBones ?? c.oracleBones,
    };
  });
}

/** Single-pass thread load: meta then content, sequential (one semaphore slot in API). */
export async function getUserSessionThreadUnified(
  userId: string,
  sessionId: string,
): Promise<UserSessionWithConsultations | null> {
  const entry = await getUserSessionThreadMeta(userId, sessionId);
  if (!entry) return null;
  const contentRows = await getUserSessionThreadContent(userId, sessionId).catch(
    () => [] as ThreadContentRow[],
  );
  return {
    session: entry.session,
    consultations: mergeConsultationsWithContent(entry.consultations, contentRows),
  };
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

  const deleted = Array.isArray(deletedSessions) && deletedSessions.length > 0;
  if (deleted) void invalidateSessionSummariesCache(userId);
  return deleted;
}
