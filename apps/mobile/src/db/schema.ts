import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync("iching_cache.db");
  }
  return _db;
}

export async function initDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS chats (
      id                    TEXT    PRIMARY KEY,
      title                 TEXT    NOT NULL DEFAULT '',
      created_at            TEXT    NOT NULL,
      updated_at            TEXT    NOT NULL,
      synced_at             TEXT    NOT NULL,
      message_count         INTEGER NOT NULL DEFAULT 0,
      first_consultation_at TEXT,
      is_deleted            INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_chats_updated ON chats(updated_at DESC);

    CREATE TABLE IF NOT EXISTS messages (
      id                TEXT PRIMARY KEY,
      chat_id           TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
      role              TEXT NOT NULL CHECK(role IN ('user','assistant')),
      content           TEXT NOT NULL DEFAULT '',
      created_at        TEXT NOT NULL,
      synced_at         TEXT NOT NULL,
      image_url         TEXT,
      local_image_path  TEXT,
      image_sync_status TEXT NOT NULL DEFAULT 'none'
                             CHECK(image_sync_status IN ('none','pending','done','error'))
    );
    CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at ASC);
    CREATE INDEX IF NOT EXISTS idx_messages_img ON messages(image_sync_status)
      WHERE image_url IS NOT NULL;

    CREATE TABLE IF NOT EXISTS sync_meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
