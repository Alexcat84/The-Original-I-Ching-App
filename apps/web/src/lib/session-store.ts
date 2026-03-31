import type { OracleBonesHistorySnapshot, OracleType } from "@iching-oracle/context-engine";
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
  mutationRule: string;
  lines: Array<{
    position: 1 | 2 | 3 | 4 | 5 | 6;
    value: 6 | 7 | 8 | 9;
    isChanging: boolean;
    symbol: string;
  }>;
  changingLines: number[];
  interpretation: string;
  category: string;
  imageProvider: "mock" | "svg-art" | "pollinations" | "fal" | "gpt-image" | "together";
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
    mutationRule: data.mutation_rule,
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

function imageProviderFromUrl(url: string | null | undefined): StoredConsultation["imageProvider"] {
  if (!url) return "mock";
  if (url.startsWith("data:image/svg+xml")) return "svg-art";
  if (url.includes("pollinations")) return "pollinations";
  if (url.includes("fal.ai")) return "fal";
  if (url.includes("openai")) return "gpt-image";
  if (url.includes("together") || url.includes("api.together")) return "together";
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

export function saveConsultation(input: Omit<StoredConsultation, "publicId" | "createdAt">): StoredConsultation {
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

export async function getConsultationByPublicId(publicId: string): Promise<StoredConsultation | null> {
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
    return { publicReadingId: saved.publicId, publicSessionId: session.publicId };
  }

  const { data: existingSession, error: existingSessionError } = await supabase
    .from("consultation_sessions")
    .select("id, public_sharing_id")
    .eq("id", params.sessionId)
    .maybeSingle();
  if (existingSessionError) {
    throw new Error(`consultation_session_lookup_failed:${existingSessionError.message}`);
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
      throw new Error(`consultation_session_create_failed:${createSessionError.message}`);
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
    category: params.consultation.category,
    interpretation: params.consultation.interpretation,
    image_url: params.consultation.imageUrl,
    thumbnail_url: params.consultation.imageFallbackUrl ?? params.consultation.imageUrl,
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
    throw new Error(`consultation_session_refresh_failed:${sessionRefreshError.message}`);
  }
  const finalSessionPublicId =
    (sessionRefresh?.public_sharing_id as string | undefined) ?? sessionPublicId;

  return {
    publicReadingId: createdConsultation?.public_sharing_id ?? randomPublicId(8),
    publicSessionId: finalSessionPublicId ?? randomPublicId(8),
  };
}

export async function getUserSessionsWithConsultations(userId: string): Promise<UserSessionWithConsultations[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data: sessionRows, error: sessionsError } = await supabase
    .from("consultation_sessions")
    .select("id, title, theme_category, language, public_sharing_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (sessionsError || !sessionRows?.length) return [];

  const sessionIds = sessionRows.map((s) => s.id);
  const baseConsultColumns =
    "id, session_id, session_position, question, language, lines, primary_hexagram_number, primary_hexagram_name, primary_hexagram_chinese, transformed_hexagram_number, transformed_hexagram_name, changing_lines, mutation_rule, category, interpretation, image_url, thumbnail_url, public_sharing_id, created_at";
  const withOracleColumns = `${baseConsultColumns}, oracle_type, oracle_bones`;

  let consultRows: unknown[] | null = null;
  let consultError: { message?: string } | null = null;

  const withOracleRes = await supabase
    .from("consultations")
    .select(withOracleColumns)
    .eq("user_id", userId)
    .in("session_id", sessionIds)
    .order("session_position", { ascending: true });
  consultRows = withOracleRes.data as unknown[] | null;
  consultError = withOracleRes.error;

  if (consultError) {
    const msg = consultError.message ?? "";
    // Backward-compatible path for DBs that still miss oracle columns.
    if (msg.includes("oracle_type") || msg.includes("oracle_bones")) {
      const fallbackRes = await supabase
        .from("consultations")
        .select(baseConsultColumns)
        .eq("user_id", userId)
        .in("session_id", sessionIds)
        .order("session_position", { ascending: true });
      consultRows = fallbackRes.data as unknown[] | null;
      consultError = fallbackRes.error;
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
    return {
      session: {
        sessionId: s.id,
        title: s.title ?? "",
        themeCategory: s.theme_category,
        language: s.language,
        publicId: s.public_sharing_id,
        consultationIds: rows.map((r) => r.consultationId),
        createdAt: new Date(s.created_at).getTime(),
      },
      consultations: rows.sort((a, b) => a.sessionPosition - b.sessionPosition),
    };
  });
}

export async function getUserSessionSummaries(userId: string): Promise<UserSessionSummary[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: sessionRows, error: sessionsError } = await supabase
    .from("consultation_sessions")
    .select("id, title, theme_category, language, public_sharing_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (sessionsError || !sessionRows?.length) return [];

  const sessionIds = sessionRows.map((s) => s.id);
  const { data: consultRows, error: consultError } = await supabase
    .from("consultations")
    .select("session_id, created_at, question, session_position")
    .eq("user_id", userId)
    .in("session_id", sessionIds)
    .order("session_position", { ascending: true });
  if (consultError) return [];

  const bySession = new Map<
    string,
    { count: number; firstAt: number | null; lastAt: number | null; firstQuestion: string | null }
  >();
  for (const row of consultRows ?? []) {
    const sessionId = String((row as { session_id: string }).session_id);
    const createdAt = new Date((row as { created_at: string }).created_at).getTime();
    const question = String((row as { question?: string }).question ?? "").trim();
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
    .select("id, title, theme_category, language, public_sharing_id, created_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (sessionError || !sessionRow) return null;

  const baseConsultColumns =
    "id, session_id, session_position, question, language, lines, primary_hexagram_number, primary_hexagram_name, primary_hexagram_chinese, transformed_hexagram_number, transformed_hexagram_name, changing_lines, mutation_rule, category, interpretation, image_url, thumbnail_url, public_sharing_id, created_at";
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
      const fallbackRes = await supabase
        .from("consultations")
        .select(baseConsultColumns)
        .eq("user_id", userId)
        .eq("session_id", sessionId)
        .order("session_position", { ascending: true });
      consultRows = fallbackRes.data as unknown[] | null;
      consultError = fallbackRes.error;
    }
  }
  if (consultError) return null;

  const consultations = (consultRows ?? []).map((row) => consultationFromDbRow(row as never));
  return {
    session: {
      sessionId: sessionRow.id,
      title: sessionRow.title ?? "",
      themeCategory: sessionRow.theme_category,
      language: sessionRow.language,
      publicId: sessionRow.public_sharing_id,
      consultationIds: consultations.map((r) => r.consultationId),
      createdAt: new Date(sessionRow.created_at).getTime(),
    },
    consultations: consultations.sort((a, b) => a.sessionPosition - b.sessionPosition),
  };
}

export async function deleteUserSession(userId: string, sessionId: string): Promise<boolean> {
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

  const { data: existing, error: existingError } = await supabase
    .from("consultation_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existingError || !existing) return false;

  const { error: consultDeleteError } = await supabase
    .from("consultations")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", userId);
  if (consultDeleteError) {
    throw new Error(`consultations_delete_failed:${consultDeleteError.message}`);
  }

  const { error: sessionDeleteError } = await supabase
    .from("consultation_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);
  if (sessionDeleteError) {
    throw new Error(`consultation_session_delete_failed:${sessionDeleteError.message}`);
  }

  return true;
}

