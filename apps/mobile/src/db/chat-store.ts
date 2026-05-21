import { getDb } from "./schema";
export { initDb } from "./schema";

export type ChatRow = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  synced_at: string;
  message_count: number;
  first_consultation_at: string | null;
  is_deleted: number;
};

export type MessageRow = {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  synced_at: string;
  image_url: string | null;
  local_image_path: string | null;
  image_sync_status: "none" | "pending" | "done" | "error";
};

export type PendingImageRow = {
  id: string;
  chat_id: string;
  image_url: string;
  local_image_path: string | null;
};

/** Shape injected into window.__rnCachedChats — matches web ChatSessionState<ConsultationItem>. */
export type RnCachedChatEntry = {
  localId: string;
  title: string;
  sessionId: string;
  publicSessionId: null;
  thread: never[];
  threadMaxDepth: null;
  messageCount: number;
  updatedAt: number;
  firstConsultationAt: number | null;
};

export async function upsertChats(chats: ChatRow[]): Promise<void> {
  if (chats.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const c of chats) {
      await db.runAsync(
        `INSERT INTO chats
           (id, title, created_at, updated_at, synced_at, message_count, first_consultation_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)
         ON CONFLICT(id) DO UPDATE SET
           title                 = excluded.title,
           updated_at            = excluded.updated_at,
           synced_at             = excluded.synced_at,
           message_count         = excluded.message_count,
           first_consultation_at = excluded.first_consultation_at,
           is_deleted            = 0`,
        c.id,
        c.title,
        c.created_at,
        c.updated_at,
        c.synced_at,
        c.message_count,
        c.first_consultation_at,
      );
    }
  });
}

export async function upsertMessages(rows: MessageRow[]): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const m of rows) {
      await db.runAsync(
        `INSERT INTO messages
           (id, chat_id, role, content, created_at, synced_at, image_url, image_sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           content           = CASE WHEN excluded.content != '' THEN excluded.content ELSE messages.content END,
           image_url         = excluded.image_url,
           image_sync_status = CASE
             WHEN messages.local_image_path IS NOT NULL THEN 'done'
             ELSE excluded.image_sync_status
           END`,
        m.id,
        m.chat_id,
        m.role,
        m.content,
        m.created_at,
        m.synced_at,
        m.image_url,
        m.image_sync_status,
      );
    }
  });
}

export async function setLocalImagePath(
  messageId: string,
  localPath: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE messages
     SET local_image_path = ?, image_sync_status = 'done'
     WHERE id = ?`,
    localPath,
    messageId,
  );
}

export async function markImageError(messageId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE messages SET image_sync_status = 'error' WHERE id = ?`,
    messageId,
  );
}

export async function getPendingImages(limit = 20): Promise<PendingImageRow[]> {
  const db = await getDb();
  return db.getAllAsync<PendingImageRow>(
    `SELECT m.id, m.chat_id, m.image_url, m.local_image_path
     FROM messages m
     JOIN chats c ON c.id = m.chat_id
     WHERE m.image_sync_status = 'pending'
       AND m.image_url IS NOT NULL
       AND c.is_deleted = 0
     ORDER BY c.updated_at DESC
     LIMIT ?`,
    limit,
  );
}

/** Returns the count of fully-synced messages (content != '') per sessionId. */
export async function getStoredContentCounts(
  sessionIds: string[],
): Promise<Record<string, number>> {
  if (sessionIds.length === 0) return {};
  const db = await getDb();
  const placeholders = sessionIds.map(() => "?").join(",");
  const rows = await db.getAllAsync<{ chat_id: string; cnt: number }>(
    `SELECT chat_id, COUNT(*) as cnt FROM messages
     WHERE chat_id IN (${placeholders}) AND content != ''
     GROUP BY chat_id`,
    ...sessionIds,
  );
  return Object.fromEntries(rows.map((r) => [r.chat_id, r.cnt]));
}

/** Returns full cached threads for the 20 most recent chats, keyed by sessionId.
 *  Each value is an array of raw ApiChatConsultation objects parsed from the
 *  content column. Used to inject window.__rnCachedThreads into the WebView. */
export async function getCachedThreadsForInjection(): Promise<
  Record<string, unknown[]>
> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ chat_id: string; content: string }>(
    `SELECT m.chat_id, m.content
     FROM messages m
     JOIN chats c ON c.id = m.chat_id
     WHERE m.content != '' AND c.is_deleted = 0
       AND c.id IN (
         SELECT id FROM chats
         WHERE is_deleted = 0 AND message_count > 0
         ORDER BY updated_at DESC LIMIT 20
       )
     ORDER BY m.created_at ASC`,
  );
  const result: Record<string, unknown[]> = {};
  for (const row of rows) {
    try {
      const item = JSON.parse(row.content) as unknown;
      if (!result[row.chat_id]) result[row.chat_id] = [];
      result[row.chat_id].push(item);
    } catch {
      // Skip malformed rows
    }
  }
  return result;
}

/** Looks up the local cached path for a given remote image URL. */
export async function getLocalImagePath(imageUrl: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ local_image_path: string }>(
    `SELECT local_image_path FROM messages
     WHERE image_url = ? AND image_sync_status = 'done'
     LIMIT 1`,
    imageUrl,
  );
  return row?.local_image_path ?? null;
}

/** Returns the payload for window.__rnCachedChats, sorted by recency. */
export async function getCachedChatsForInjection(): Promise<RnCachedChatEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ChatRow>(
    `SELECT id, title, updated_at, message_count, first_consultation_at
     FROM chats
     WHERE is_deleted = 0 AND message_count > 0
     ORDER BY updated_at DESC
     LIMIT 50`,
  );
  return rows.map((row) => ({
    localId: `db-${row.id}`,
    title: row.title,
    sessionId: row.id,
    publicSessionId: null,
    thread: [] as never[],
    threadMaxDepth: null,
    messageCount: row.message_count,
    updatedAt: new Date(row.updated_at).getTime(),
    firstConsultationAt: row.first_consultation_at
      ? new Date(row.first_consultation_at).getTime()
      : null,
  }));
}

export async function softDeleteChat(chatId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE chats SET is_deleted = 1 WHERE id = ?`,
    chatId,
  );
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM messages");
    await db.runAsync("DELETE FROM chats");
    await db.runAsync("DELETE FROM sync_meta");
  });
}

export async function getSyncMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM sync_meta WHERE key = ?",
    key,
  );
  return row?.value ?? null;
}

export async function setSyncMeta(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO sync_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    key,
    value,
  );
}
