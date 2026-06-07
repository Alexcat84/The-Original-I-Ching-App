import {
  upsertChats,
  upsertMessages,
  mergeContentIntoMessages,
  getSyncMeta,
  setSyncMeta,
  softDeleteStaleChats,
  type ChatRow,
  type MessageRow,
} from "../db/chat-store";
import { syncPendingImages } from "./image-sync";

const SUMMARY_COOLDOWN_MS = 5 * 60 * 1000;
const CHAT_CONTENT_COOLDOWN_MS = 5 * 60 * 1000;
// Abort network requests that hang — prevents request_thread from getting stuck
// waiting forever behind a stalled prewarm fetch.
// 25s gives headroom for TOAST-heavy queries (interpretation ~10-15KB × 8 rows)
// that can take 15s under cold-buffer conditions on the staging instance.
const FETCH_TIMEOUT_MS = 25_000;

// Prevents concurrent syncChatContent calls for the same session from firing
// duplicate API requests. The prewarm loop and request_thread handler can both
// call syncChatContent simultaneously; without this guard each call independently
// passes the cooldown check (cooldown not yet written) and fires its own fetch,
// saturating PostgREST connections with identical queries.
const inFlightContentSyncs = new Set<string>();

type ApiSession = {
  sessionId: string;
  title: string;
  publicId: string;
  createdAt: number;
  maxConsultations?: number | null;
};

type ApiSummaryEntry = {
  session: ApiSession;
  messageCount: number;
  firstConsultationAt: number | null;
  updatedAt: number;
  firstQuestion?: string | null;
};

type ApiConsultation = {
  consultationId: string;
  sessionId: string;
  createdAt: number;
  imageUrl?: string;
  [key: string]: unknown;
};

function msToIso(ms: number): string {
  return new Date(ms).toISOString();
}

/** Returns the server's session list, or null on network/auth error.
 *  Returning null vs [] lets callers distinguish "server unreachable"
 *  from "server confirmed account has no sessions". */
function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

async function fetchSummaries(
  token: string,
  baseUrl: string,
): Promise<ApiSummaryEntry[] | null> {
  const res = await fetchWithTimeout(`${baseUrl}/api/account/chats?summary=1`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { sessions?: ApiSummaryEntry[] };
  return Array.isArray(body.sessions) ? body.sessions : [];
}

async function fetchChatDetail(
  token: string,
  baseUrl: string,
  sessionId: string,
): Promise<{ session: ApiSession; consultations: ApiConsultation[] } | null> {
  const res = await fetchWithTimeout(
    `${baseUrl}/api/account/chats?sessionId=${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!res.ok) return null;
  const body = (await res.json()) as {
    session?: ApiSession;
    consultations?: ApiConsultation[];
  };
  if (!body.session) return null;
  return {
    session: body.session,
    consultations: Array.isArray(body.consultations) ? body.consultations : [],
  };
}

// Phase 1: fetch metadata only (no interpretation/oracle_bones TOAST).
// Uses a short 8s timeout — this path should always complete in <100ms.
const FETCH_META_TIMEOUT_MS = 8_000;

async function fetchChatMeta(
  token: string,
  baseUrl: string,
  sessionId: string,
): Promise<{ session: ApiSession; consultations: ApiConsultation[] } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_META_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${baseUrl}/api/account/chats?sessionId=${encodeURIComponent(sessionId)}&meta=1`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { session?: ApiSession; consultations?: ApiConsultation[] };
    if (!body.session) return null;
    return {
      session: body.session,
      consultations: Array.isArray(body.consultations) ? body.consultations : [],
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Phase 2: fetch only interpretation + oracle_bones (TOAST columns).
// May be slow on cold shared_buffers — called in background after meta inject.
type ContentRow = { consultationId: string; interpretation: string; oracleBones: unknown };

async function fetchChatContent(
  token: string,
  baseUrl: string,
  sessionId: string,
): Promise<ContentRow[] | null> {
  const res = await fetchWithTimeout(
    `${baseUrl}/api/account/chats?sessionId=${encodeURIComponent(sessionId)}&content=1`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!res.ok) return null;
  const body = (await res.json()) as { consultationContent?: ContentRow[] };
  return Array.isArray(body.consultationContent) ? body.consultationContent : null;
}

/** Tier 1: sync chat list metadata only. No message content. Runs on auth
 *  with a 5-minute cooldown to keep the sidebar fast without hammering the API. */
export async function syncChats(token: string, baseUrl: string, userId?: string): Promise<void> {
  try {
    const lastSync = await getSyncMeta("last_sync");
    if (lastSync) {
      const elapsed = Date.now() - new Date(lastSync).getTime();
      if (elapsed < SUMMARY_COOLDOWN_MS) return;
    }

    const entries = await fetchSummaries(token, baseUrl);
    // null = network/auth error; skip sync entirely to avoid wiping valid cache.
    // [] = server confirmed the account has no sessions; proceed to evict stale SQLite rows.
    if (entries === null) return;

    const now = new Date().toISOString();
    const chatRows: ChatRow[] = entries.map((e) => ({
      id: e.session.sessionId,
      title: e.firstQuestion?.trim().slice(0, 120) || e.session.title || "",
      created_at: msToIso(e.session.createdAt),
      updated_at: msToIso(e.updatedAt ?? e.session.createdAt),
      synced_at: now,
      message_count: e.messageCount,
      first_consultation_at: e.firstConsultationAt
        ? msToIso(e.firstConsultationAt)
        : null,
      is_deleted: 0,
    }));

    await upsertChats(chatRows);
    // Evict chats that exist in SQLite but were deleted on the server (e.g. via
    // the web UI or another device). This prevents deleted chats from flashing
    // in the sidebar on the next cold start before the server response arrives.
    await softDeleteStaleChats(chatRows.map((r) => r.id));
    await setSyncMeta("last_sync", now);
    // Record which user this sync belongs to. On cold start, the mount effect
    // compares this value against the stored JWT's UUID — if they differ, the
    // cache is wiped before injection, preventing cross-user data leaks.
    if (userId) await setSyncMeta("last_synced_user", userId);

    // Pre-warm message cache for all chats so every chat opens instantly from
    // SQLite (Tier 2). Runs sequentially in background to avoid two problems
    // that arise from firing all requests in parallel:
    //   1. SQLite lock contention: concurrent upsertMessages writes block the
    //      getCachedChatsForInjection read, leaving the sidebar stuck on
    //      "Loading chats...".
    //   2. HTTP connection pool exhaustion: mobile HTTP/1.1 allows ~6 concurrent
    //      connections per host; parallel prewarm fills the pool and delays
    //      request_thread syncs, leaving conversations stuck on "Loading...".
    // Sequential execution avoids both: each call completes (or hits the 5-min
    // cooldown and returns immediately) before the next starts.
    void (async () => {
      for (const r of chatRows) {
        await syncChatContent(token, baseUrl, r.id).catch(() => undefined);
      }
    })();

    // Process any images that were previously queued but not downloaded.
    void syncPendingImages();
  } catch {
    // Non-fatal
  }
}

/** Tier 3 Phase 1 — fast metadata sync (no TOAST).
 *  Stores meta rows in SQLite so getPagedThread can inject the thread structure
 *  to the WebView immediately (<5ms always). Does NOT set the content cooldown
 *  so Phase 2 can follow up with the full interpretation. */
export async function syncChatMeta(
  token: string,
  baseUrl: string,
  sessionId: string,
  onMetaReady?: (rows: MessageRow[]) => void,
): Promise<void> {
  try {
    const meta = await fetchChatMeta(token, baseUrl, sessionId);
    if (!meta || meta.consultations.length === 0) return;

    const now = new Date().toISOString();
    const metaRows: MessageRow[] = meta.consultations.map((c) => ({
      id: c.consultationId,
      chat_id: sessionId,
      role: "assistant",
      content: JSON.stringify(c),
      created_at: msToIso(c.createdAt),
      synced_at: now,
      image_url: (c.imageUrl as string) || null,
      local_image_path: null,
      image_sync_status: c.imageUrl ? "pending" : "none",
    }));

    // Use INSERT OR IGNORE — never overwrite rows that already have full content.
    // This prevents clobbering a previously cached interpretation with the
    // summary-as-placeholder value from the meta response.
    await upsertMessages(metaRows, { ignoreConflict: true });
    onMetaReady?.(metaRows);
  } catch {
    // Non-fatal
  }
}

/** Tier 3 Phase 2 — full content sync (includes TOAST interpretation/oracle_bones).
 *  Runs after syncChatMeta so the user already sees thread structure.
 *  Merges interpretation + oracle_bones into existing SQLite rows via ON CONFLICT UPDATE.
 *  Sets the 5-min cooldown so subsequent opens skip the network entirely. */
export async function syncChatContent(
  token: string,
  baseUrl: string,
  sessionId: string,
): Promise<void> {
  if (inFlightContentSyncs.has(sessionId)) return;
  inFlightContentSyncs.add(sessionId);
  try {
    const syncKey = `chat_content_synced:${sessionId}`;
    const lastSync = await getSyncMeta(syncKey);
    if (lastSync) {
      const elapsed = Date.now() - new Date(lastSync).getTime();
      if (elapsed < CHAT_CONTENT_COOLDOWN_MS) return;
    }

    // Try targeted content-only fetch first (only TOAST columns, smaller payload).
    // Fall back to full fetch if the endpoint isn't available (older deploy).
    let detail: { session: ApiSession; consultations: ApiConsultation[] } | null = null;
    const contentRows = await fetchChatContent(token, baseUrl, sessionId);
    if (contentRows && contentRows.length > 0) {
      // Merge interpretation + oracle_bones into existing SQLite rows.
      await mergeContentIntoMessages(sessionId, contentRows);
    } else {
      // Fallback: full fetch (backward compatible with older API versions).
      detail = await fetchChatDetail(token, baseUrl, sessionId);
      if (!detail || detail.consultations.length === 0) return;
      const now = new Date().toISOString();
      const msgRows: MessageRow[] = detail.consultations.map((c) => ({
        id: c.consultationId,
        chat_id: sessionId,
        role: "assistant",
        content: JSON.stringify(c),
        created_at: msToIso(c.createdAt),
        synced_at: now,
        image_url: (c.imageUrl as string) || null,
        local_image_path: null,
        image_sync_status: c.imageUrl ? "pending" : "none",
      }));
      await upsertMessages(msgRows);
    }

    await setSyncMeta(syncKey, new Date().toISOString());
    void syncPendingImages();
  } catch {
    // Non-fatal
  } finally {
    inFlightContentSyncs.delete(sessionId);
  }
}
