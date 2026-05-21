import {
  upsertChats,
  upsertMessages,
  getSyncMeta,
  setSyncMeta,
  type ChatRow,
  type MessageRow,
} from "../db/chat-store";
import { syncPendingImages } from "./image-sync";

const SYNC_COOLDOWN_MS = 5 * 60 * 1000;
const RECENT_CHATS_FOR_IMAGE_SYNC = 5;

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
  role?: string;
  question: string;
  interpretation: string;
  imageUrl: string;
  imageFallbackUrl?: string;
  createdAt: number;
};

type ApiFullEntry = {
  session: ApiSession;
  consultations: ApiConsultation[];
};

function msToIso(ms: number): string {
  return new Date(ms).toISOString();
}

async function fetchSummaries(
  token: string,
  baseUrl: string,
): Promise<ApiSummaryEntry[]> {
  const res = await fetch(`${baseUrl}/api/account/chats?summary=1`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const body = (await res.json()) as { sessions?: ApiSummaryEntry[] };
  return Array.isArray(body.sessions) ? body.sessions : [];
}

async function fetchChatDetail(
  token: string,
  baseUrl: string,
  sessionId: string,
): Promise<ApiFullEntry | null> {
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

/** Full sync: summaries → SQLite chats, then image records for recent chats. */
export async function syncChats(token: string, baseUrl: string): Promise<void> {
  try {
    const lastSync = await getSyncMeta("last_sync");
    if (lastSync) {
      const elapsed = Date.now() - new Date(lastSync).getTime();
      if (elapsed < SYNC_COOLDOWN_MS) return;
    }

    const entries = await fetchSummaries(token, baseUrl);
    if (entries.length === 0) return;

    const now = new Date().toISOString();
    const chatRows: ChatRow[] = entries.map((e) => ({
      id: e.session.sessionId,
      title:
        e.firstQuestion?.trim().slice(0, 120) || e.session.title || "",
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
    await setSyncMeta("last_sync", now);

    // Fetch image URLs for the most recent chats and queue downloads.
    const recentIds = chatRows
      .slice(0, RECENT_CHATS_FOR_IMAGE_SYNC)
      .map((c) => c.id);

    for (const sessionId of recentIds) {
      try {
        const detail = await fetchChatDetail(token, baseUrl, sessionId);
        if (!detail) continue;
        const msgRows: MessageRow[] = detail.consultations
          .filter((c) => c.imageUrl)
          .map((c) => ({
            id: c.consultationId,
            chat_id: sessionId,
            role: "assistant",
            content: "",
            created_at: msToIso(c.createdAt),
            synced_at: now,
            image_url: c.imageUrl,
            local_image_path: null,
            image_sync_status: "pending",
          }));
        await upsertMessages(msgRows);
      } catch {
        // Non-fatal — continue with next chat
      }
    }

    // Download queued images opportunistically.
    void syncPendingImages();
  } catch {
    // Non-fatal — cache is best-effort
  }
}
