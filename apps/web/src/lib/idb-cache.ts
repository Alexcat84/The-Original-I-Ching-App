const DB_NAME = "iching-cache-v1";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("chats")) db.createObjectStore("chats");
      if (!db.objectStoreNames.contains("threads")) db.createObjectStore("threads");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export type IdbChatEntry = {
  localId: string;
  title: string;
  sessionId: string;
  publicSessionId: string | null;
  messageCount: number;
  updatedAt: number;
  firstConsultationAt: number | null;
};

export type IdbThreadEntry = {
  consultations: unknown[];
  cachedAt: number;
};

const THREAD_TTL_MS = 60 * 1000;

export function isThreadFresh(entry: IdbThreadEntry): boolean {
  return Date.now() - entry.cachedAt < THREAD_TTL_MS;
}

export async function getIdbChats(userId: string): Promise<IdbChatEntry[]> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const req = db.transaction("chats", "readonly").objectStore("chats").get(userId);
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function putIdbChats(userId: string, chats: IdbChatEntry[]): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("chats", "readwrite");
      tx.objectStore("chats").put(chats, userId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* non-fatal */ }
}

export async function getIdbThread(sessionId: string): Promise<IdbThreadEntry | null> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const req = db.transaction("threads", "readonly").objectStore("threads").get(sessionId);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function putIdbThread(sessionId: string, consultations: unknown[]): Promise<void> {
  try {
    const db = await openDb();
    const entry: IdbThreadEntry = { consultations, cachedAt: Date.now() };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("threads", "readwrite");
      tx.objectStore("threads").put(entry, sessionId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* non-fatal */ }
}

export async function clearIdbUser(userId: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction("chats", "readwrite");
      tx.objectStore("chats").delete(userId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch { /* non-fatal */ }
}
