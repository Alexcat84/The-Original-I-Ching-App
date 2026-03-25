import type { OracleBonesHistorySnapshot, OracleType } from "@iching-oracle/context-engine";
import { Redis } from "@upstash/redis";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isPersistableUuid } from "@/lib/session-ids";

let shareKvRedis: Redis | null | undefined;

function shareKv(): Redis | null {
  if (shareKvRedis !== undefined) return shareKvRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  shareKvRedis = url && token ? new Redis({ url, token }) : null;
  return shareKvRedis;
}

/** Shared /r and /s links resolve across isolates only with Supabase and/or Upstash KV. */
export function isSharingPersistenceAvailable(): boolean {
  return Boolean(shareKv()) || Boolean(getSupabaseAdmin());
}

const KV_READING = "iching:reading:v1:";
const KV_SESSION = "iching:session:v1:";
const KV_TTL = 60 * 60 * 24 * 60;

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

async function persistSharedReadingKv(c: StoredConsultation): Promise<void> {
  const r = shareKv();
  if (!r) return;
  try {
    await r.set(KV_READING + c.publicId, JSON.stringify(c), { ex: KV_TTL });
  } catch {
    /* ignore */
  }
}

async function loadSharedReadingKv(publicId: string): Promise<StoredConsultation | null> {
  const r = shareKv();
  if (!r) return null;
  try {
    const raw = await r.get<string>(KV_READING + publicId);
    if (!raw || typeof raw !== "string") return null;
    return JSON.parse(raw) as StoredConsultation;
  } catch {
    return null;
  }
}

async function persistSharedSessionKv(session: StoredSession, consultations: StoredConsultation[]): Promise<void> {
  const r = shareKv();
  if (!r) return;
  try {
    await r.set(KV_SESSION + session.publicId, JSON.stringify({ session, consultations }), { ex: KV_TTL });
  } catch {
    /* ignore */
  }
}

async function loadSharedSessionKv(publicId: string): Promise<{
  session: StoredSession;
  consultations: StoredConsultation[];
} | null> {
  const r = shareKv();
  if (!r) return null;
  try {
    const raw = await r.get<string>(KV_SESSION + publicId);
    if (!raw || typeof raw !== "string") return null;
    const parsed = JSON.parse(raw) as { session: StoredSession; consultations: StoredConsultation[] };
    if (!parsed?.session || !Array.isArray(parsed.consultations)) return null;
    return parsed;
  } catch {
    return null;
  }
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

/** Replicate latest session snapshot to Upstash so /r and /s resolve on cold Edge isolates. */
async function mirrorSupabaseSessionToKv(sessionId: string): Promise<void> {
  if (!shareKv()) return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  try {
    const { data: session } = await supabase
      .from("consultation_sessions")
      .select("id, title, theme_category, language, public_sharing_id, created_at")
      .eq("id", sessionId)
      .maybeSingle();
    if (!session) return;
    const { data: rows } = await supabase
      .from("consultations")
      .select("*")
      .eq("session_id", sessionId)
      .order("session_position", { ascending: true });
    const mapped = (rows ?? []).map((row) => consultationFromDbRow(row as never));
    const storedSession: StoredSession = {
      sessionId: session.id,
      title: session.title ?? "",
      themeCategory: session.theme_category,
      language: session.language,
      publicId: session.public_sharing_id,
      consultationIds: mapped.map((m) => m.consultationId),
      createdAt: new Date(session.created_at).getTime(),
    };
    for (const c of mapped) {
      await persistSharedReadingKv(c);
    }
    await persistSharedSessionKv(storedSession, mapped);
  } catch {
    /* ignore mirror failures */
  }
}

const sessions = new Map<string, StoredSession>();
const consultations = new Map<string, StoredConsultation>();
const consultationByPublicId = new Map<string, string>();
const sessionByPublicId = new Map<string, string>();

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
  return Math.random().toString(36).slice(2, 2 + length);
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
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase
      .from("consultations")
      .select("*")
      .eq("public_sharing_id", publicId)
      .maybeSingle();
    if (data) {
      return consultationFromDbRow(data as never);
    }
  }
  const fromKv = await loadSharedReadingKv(publicId);
  if (fromKv) return fromKv;
  const id = consultationByPublicId.get(publicId);
  if (!id) return null;
  return consultations.get(id) ?? null;
}

export async function getSessionByPublicId(publicId: string): Promise<{
  session: StoredSession;
  consultations: StoredConsultation[];
} | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: session } = await supabase
      .from("consultation_sessions")
      .select("*")
      .eq("public_sharing_id", publicId)
      .maybeSingle();
    if (session) {
      const { data: rows } = await supabase
        .from("consultations")
        .select("*")
        .eq("session_id", session.id)
        .order("session_position", { ascending: true });
      const mapped = (rows ?? []).map((data) => consultationFromDbRow(data as never));
      return {
        session: {
          sessionId: session.id,
          title: session.title,
          themeCategory: session.theme_category,
          language: session.language,
          publicId: session.public_sharing_id,
          consultationIds: mapped.map((m) => m.consultationId),
          createdAt: new Date(session.created_at).getTime(),
        },
        consultations: mapped,
      };
    }
  }
  const fromKv = await loadSharedSessionKv(publicId);
  if (fromKv) return fromKv;
  const sessionId = sessionByPublicId.get(publicId);
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  const rows = session.consultationIds
    .map((id) => consultations.get(id))
    .filter((x): x is StoredConsultation => Boolean(x))
    .sort((a, b) => a.sessionPosition - b.sessionPosition);
  return { session, consultations: rows };
}

export async function upsertSessionAndConsultation(params: {
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
    const rows = session.consultationIds
      .map((cid) => consultations.get(cid))
      .filter((x): x is StoredConsultation => Boolean(x))
      .sort((a, b) => a.sessionPosition - b.sessionPosition);
    await persistSharedReadingKv(saved);
    await persistSharedSessionKv(session, rows);
    return { publicReadingId: saved.publicId, publicSessionId: session.publicId };
  }

  const { data: existingSession } = await supabase
    .from("consultation_sessions")
    .select("id, public_sharing_id")
    .eq("id", params.sessionId)
    .maybeSingle();
  let sessionPublicId = existingSession?.public_sharing_id as string | undefined;
  if (!existingSession) {
    const { data: created } = await supabase
      .from("consultation_sessions")
      .insert({
        id: params.sessionId,
        title: params.sessionTitle,
        theme_category: params.category,
        language: params.language,
        max_consultations: params.maxConsultations,
      })
      .select("public_sharing_id")
      .single();
    sessionPublicId = created?.public_sharing_id;
  }
  const { data: createdConsultation } = await supabase
    .from("consultations")
    .insert({
      id: params.consultation.consultationId,
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
      oracle_type: params.consultation.oracleType,
      oracle_bones: params.consultation.oracleBones ?? null,
    })
    .select("public_sharing_id")
    .single();

  const { data: sessionRefresh } = await supabase
    .from("consultation_sessions")
    .select("public_sharing_id")
    .eq("id", params.sessionId)
    .maybeSingle();
  const finalSessionPublicId =
    (sessionRefresh?.public_sharing_id as string | undefined) ?? sessionPublicId;

  await mirrorSupabaseSessionToKv(params.sessionId);

  return {
    publicReadingId: createdConsultation?.public_sharing_id ?? randomPublicId(8),
    publicSessionId: finalSessionPublicId ?? randomPublicId(8),
  };
}

