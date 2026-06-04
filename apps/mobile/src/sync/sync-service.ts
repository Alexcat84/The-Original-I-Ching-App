import {
  upsertChats,
  upsertMessages,
  getSyncMeta,
  setSyncMeta,
  softDeleteStaleChats,
  type ChatRow,
  type MessageRow,
} from "../db/chat-store";
import { syncPendingImages } from "./image-sync";

const SUMMARY_COOLDOWN_MS = 5 * 60 * 1000;
const CHAT_CONTENT_COOLDOWN_MS = 5 * 60 * 1000;

// How many of the most-recently-updated chats to pre-warm after a Tier 1 sync.
// Pre-warming ensures opening a recent chat is served from SQLite instantly
// rather than waiting for a Tier 3 network fetch.
const PREWARM_CHAT_COUNT = 3;

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
async function fetchSummaries(
  token: string,
  baseUrl: string,
): Promise<ApiSummaryEntry[] | null> {
  const res = await fetch(`${baseUrl}/api/account/chats?summary=1`, {
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
  const res = await fetch(
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

    // Pre-warm message cache for the most recently active chats so that opening
    // any of them is served instantly from SQLite (Tier 2) rather than waiting
    // for a Tier 3 network fetch. Runs in background — does not block Tier 1.
    const recentIds = chatRows.slice(0, PREWARM_CHAT_COUNT).map((r) => r.id);
    void Promise.all(
      recentIds.map((id) => syncChatContent(token, baseUrl, id).catch(() => undefined)),
    );

    // Process any images that were previously queued but not downloaded.
    void syncPendingImages();
  } catch {
    // Non-fatal
  }
}

/** Tier 3: incremental per-chat content sync. Called when the user opens a
 *  specific chat. Fetches all consultations from Supabase and upserts into
 *  SQLite (ON CONFLICT preserves local_image_path). Updates a per-chat
 *  sync timestamp so subsequent opens within CHAT_CONTENT_COOLDOWN_MS are
 *  served from SQLite without hitting the network. */
export async function syncChatContent(
  token: string,
  baseUrl: string,
  sessionId: string,
): Promise<void> {
  try {
    const syncKey = `chat_content_synced:${sessionId}`;
    const lastSync = await getSyncMeta(syncKey);
    if (lastSync) {
      const elapsed = Date.now() - new Date(lastSync).getTime();
      if (elapsed < CHAT_CONTENT_COOLDOWN_MS) return;
    }

    const detail = await fetchChatDetail(token, baseUrl, sessionId);
    if (!detail || detail.consultations.length === 0) return;

    const now = new Date().toISOString();
    const msgRows: MessageRow[] = detail.consultations.map((c) => ({
      id: c.consultationId,
      chat_id: sessionId,
      role: "assistant",
      // Full consultation JSON — read back by getPagedThread and injected as
      // window.__rnCachedThreads so the web app can render offline.
      content: JSON.stringify(c),
      created_at: msToIso(c.createdAt),
      synced_at: now,
      image_url: (c.imageUrl as string) || null,
      local_image_path: null,
      image_sync_status: c.imageUrl ? "pending" : "none",
    }));

    await upsertMessages(msgRows);
    await setSyncMeta(syncKey, now);

    // Queue image downloads for this chat (processed opportunistically).
    void syncPendingImages();
  } catch {
    // Non-fatal
  }
}
