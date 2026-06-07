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
           first_consultation_at = excluded.first_consultation_at`,
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

export async function upsertMessages(
  rows: MessageRow[],
  opts?: { ignoreConflict?: boolean },
): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const m of rows) {
      if (opts?.ignoreConflict) {
        // INSERT OR IGNORE: never overwrite an existing row that already has
        // full interpretation content (used by Phase 1 meta sync).
        await db.runAsync(
          `INSERT OR IGNORE INTO messages
             (id, chat_id, role, content, created_at, synced_at, image_url, image_sync_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          m.id, m.chat_id, m.role, m.content, m.created_at,
          m.synced_at, m.image_url, m.image_sync_status,
        );
      } else {
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
          m.id, m.chat_id, m.role, m.content, m.created_at,
          m.synced_at, m.image_url, m.image_sync_status,
        );
      }
    }
  });
}

/** Phase 2 content merge: updates interpretation + oracleBones in existing SQLite
 *  message rows without touching any other fields. Uses json_set so the merge is
 *  atomic at the SQLite level and never clobbers local_image_path or image_sync_status. */
export async function mergeContentIntoMessages(
  chatId: string,
  contentRows: Array<{ consultationId: string; interpretation: string; oracleBones: unknown }>,
): Promise<void> {
  if (contentRows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const row of contentRows) {
      await db.runAsync(
        `UPDATE messages
         SET content = json_set(
           CASE WHEN content IS NULL OR content = '' THEN '{}' ELSE content END,
           '$.interpretation', ?,
           '$.oracleBones', json(?)
         ),
         synced_at = ?
         WHERE id = ? AND chat_id = ?`,
        row.interpretation,
        row.oracleBones !== null ? JSON.stringify(row.oracleBones) : "null",
        new Date().toISOString(),
        row.consultationId,
        chatId,
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

/** Returns up to `limit` messages for a chat, newest first (caller reverses
 *  for chronological display). Uses OFFSET for scroll-up pagination. */
export async function getPagedThread(
  sessionId: string,
  limit = 30,
  offset = 0,
): Promise<MessageRow[]> {
  const db = await getDb();
  return db.getAllAsync<MessageRow>(
    `SELECT id, chat_id, role, content, created_at, synced_at,
            image_url, local_image_path, image_sync_status
     FROM messages
     WHERE chat_id = ? AND content != ''
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    sessionId,
    limit,
    offset,
  );
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

/** Marks as deleted any chats in SQLite whose IDs are NOT in `serverIds`.
 *  Called after a successful server summary fetch so that chats deleted on
 *  another device (or via the web UI) are evicted from the local cache and
 *  no longer flash on the next app launch.
 *
 *  When serverIds is empty the server has confirmed the account has no sessions
 *  (the caller already filtered out network/auth errors), so ALL local chats are
 *  marked deleted. This prevents stale chats from a previous account or environment
 *  from persisting in the local cache indefinitely. */
export async function softDeleteStaleChats(serverIds: string[]): Promise<void> {
  const db = await getDb();
  if (serverIds.length === 0) {
    await db.runAsync(`UPDATE chats SET is_deleted = 1 WHERE is_deleted = 0`);
    return;
  }
  // SQLite has no native NOT IN with a dynamic list via parameterized arrays,
  // so we build the placeholders manually. Batch in chunks to stay under the
  // SQLITE_MAX_VARIABLE_NUMBER limit (999 by default).
  const CHUNK = 900;
  for (let i = 0; i < serverIds.length; i += CHUNK) {
    const chunk = serverIds.slice(i, i + CHUNK);
    const placeholders = chunk.map(() => "?").join(", ");
    await db.runAsync(
      `UPDATE chats SET is_deleted = 1
       WHERE is_deleted = 0 AND id NOT IN (${placeholders})`,
      ...chunk,
    );
  }
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

/** Deletes a single sync_meta entry by exact key. Used to invalidate a specific
 *  per-chat content cooldown (e.g. `chat_content_synced:{sessionId}`) without
 *  touching other entries. */
export async function deleteSyncMeta(key: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM sync_meta WHERE key = ?", key);
}

/** Deletes all sync_meta entries whose key starts with `prefix`. Used on
 *  sign-out to bulk-invalidate all per-chat content cooldowns so the next
 *  login always fetches fresh message content from the API. */
export async function deleteSyncMetaByPrefix(prefix: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM sync_meta WHERE key LIKE ?", [`${prefix}%`]);
}

/** Returns the expected message count for a chat from SQLite metadata.
 *  Returns null if the chat is not found or has been soft-deleted.
 *  Used in request_thread to detect a stale content cache (fewer SQLite
 *  rows than the chat header advertises) and bypass the sync cooldown. */
export async function getChatMessageCount(chatId: string): Promise<number | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ message_count: number }>(
    "SELECT message_count FROM chats WHERE id = ? AND is_deleted = 0",
    chatId,
  );
  return row?.message_count ?? null;
}
