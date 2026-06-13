import {
  upsertChats,
  upsertMessages,
  mergeContentIntoMessages,
  getSyncMeta,
  setSyncMeta,
  softDeleteStaleChats,
  getChatMessageCount,
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

// Deduplicates concurrent syncChatContent calls for the same session.
// Stores the in-flight Promise so late callers await the same work rather
// than being silently discarded — prevents the "stuck on meta placeholder"
// issue when prewarm and request_thread race for the same sessionId.
const inFlightContentSyncs = new Map<string, Promise<void>>();

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
  // Use the lightweight sessions-only endpoint (1 PostgREST query) instead of
  // /api/account/bootstrap (4 queries). Native only needs the sessions array;
  // using bootstrap was causing a double-bootstrap burst on every login.
  const res = await fetchWithTimeout(`${baseUrl}/api/account/sessions-only`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { sessions?: ApiSummaryEntry[] };
  return Array.isArray(body.sessions) ? body.sessions : [];
}

// Phase 1: fetch metadata only (no interpretation/oracle_bones TOAST).
// Uses a short 8s timeout — this path should always complete in <100ms.
const FETCH_META_TIMEOUT_MS = 8_000;

async function fetchChatThread(
  token: string,
  baseUrl: string,
  sessionId: string,
): Promise<{ session: ApiSession; consultations: ApiConsultation[] } | null> {
  const res = await fetchWithTimeout(
    `${baseUrl}/api/account/chats?sessionId=${encodeURIComponent(sessionId)}&thread=1`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!res.ok) return null;
  const body = (await res.json()) as { session?: ApiSession; consultations?: ApiConsultation[] };
  if (!body.session) return null;
  return {
    session: body.session,
    consultations: Array.isArray(body.consultations) ? body.consultations : [],
  };
}

// Legacy two-phase fetchers — kept for older APK builds; prefer syncChatThread.
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

    // Chat content (TOAST) is fetched lazily when the user opens each thread,
    // not eagerly at login. Prewarm-all at login caused 20+ sequential PostgREST
    // connections that saturated the pool=10 and triggered Warp thread kills.

    // Process any images that were previously queued but not downloaded.
    void syncPendingImages();
  } catch {
    // Non-fatal
  }
}

/** Two-phase thread sync — fetch meta first (small, fast, no TOAST),
 *  then fetch TOAST content in background and merge into SQLite.
 *
 *  The previous single-call approach (`thread=1`) returned the full
 *  interpretation text (~15KB × N consultations) in one JSON response.
 *  On Android devices under memory pressure, OkHttp's response buffer
 *  caused OutOfMemoryError during JSON deserialization (Sentry #7542347795).
 *
 *  Splitting into meta + content:
 *  - Phase 1 (meta=1): ~2KB response, signals onReady for instant UI
 *  - Phase 2 (content=1): TOAST columns fetched in background, merged lazily
 */
export function syncChatThread(
  token: string,
  baseUrl: string,
  sessionId: string,
  onReady?: (rows: MessageRow[]) => void,
): Promise<void> {
  const existing = inFlightContentSyncs.get(sessionId);
  if (existing) return existing;

  const work = (async () => {
    try {
      const syncKey = `chat_content_synced:${sessionId}`;
      const lastSync = await getSyncMeta(syncKey);
      if (lastSync) {
        const elapsed = Date.now() - new Date(lastSync).getTime();
        if (elapsed < CHAT_CONTENT_COOLDOWN_MS) {
          // Acción 5: bypass cooldown when SQLite is empty — previous sync may have
          // stored the meta key but failed before writing content rows.
          const rowCount = await getChatMessageCount(sessionId).catch(() => null);
          if (rowCount !== null && rowCount > 0) return;
        }
      }

      // Phase 1: fetch metadata only (no TOAST) — small payload, safe for low-memory devices.
      // Uses meta=1 endpoint with a short 8s timeout.
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

      // INSERT OR IGNORE — never overwrite rows that already have full content
      // from a previous content sync.
      await upsertMessages(metaRows, { ignoreConflict: true });
      onReady?.(metaRows);

      // Phase 2: fetch TOAST content (interpretation + oracle_bones) in background.
      // This runs after the UI has already rendered with interpretation_summary
      // placeholders. The content=1 response uses get_session_content_safe RPC
      // with a 2s statement_timeout — safe for constrained devices.
      try {
        const contentRows = await fetchChatContent(token, baseUrl, sessionId);
        if (contentRows && contentRows.length > 0) {
          await mergeContentIntoMessages(sessionId, contentRows);
        }
      } catch {
        // Non-fatal — content will be fetched on next request_thread
      }

      await setSyncMeta(syncKey, now);
      void syncPendingImages();
    } catch {
      // Non-fatal
    } finally {
      inFlightContentSyncs.delete(sessionId);
    }
  })();

  inFlightContentSyncs.set(sessionId, work);
  return work;
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
export function syncChatContent(
  token: string,
  baseUrl: string,
  sessionId: string,
): Promise<void> {
  const existing = inFlightContentSyncs.get(sessionId);
  if (existing) return existing;

  const work = (async () => {
    try {
      const syncKey = `chat_content_synced:${sessionId}`;
      const lastSync = await getSyncMeta(syncKey);
      if (lastSync) {
        const elapsed = Date.now() - new Date(lastSync).getTime();
        if (elapsed < CHAT_CONTENT_COOLDOWN_MS) return;
      }

      const contentRows = await fetchChatContent(token, baseUrl, sessionId);
      if (contentRows && contentRows.length > 0) {
        await mergeContentIntoMessages(sessionId, contentRows);
        await setSyncMeta(syncKey, new Date().toISOString());
        void syncPendingImages();
      }
      // No fallback to full ?sessionId= fetch — meta is already in SQLite from
      // syncChatMeta; retry on next request_thread if content RPC fails/empty.
    } catch {
      // Non-fatal
    } finally {
      inFlightContentSyncs.delete(sessionId);
    }
  })();

  inFlightContentSyncs.set(sessionId, work);
  return work;
}
