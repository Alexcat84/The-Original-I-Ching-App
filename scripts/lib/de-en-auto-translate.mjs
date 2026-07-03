/**
 * Best-effort German → English machine translation for audit viewers (not production i18n).
 * Uses MyMemory (free, 500 chars/query) with disk cache and optional LibreTranslate API key.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const DEFAULT_MT_CACHE_PATH = join(ROOT, ".cache", "wilhelm-de-en-mt.json");

const MYMEMORY_MAX = 450;
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

/**
 * @param {string} text
 */
export function isBadMachineTranslation(text) {
  const t = String(text ?? "");
  return (
    !t.trim() ||
    /MYMEMORY WARNING:/i.test(t) ||
    /QUERY LENGTH LIMIT EXCEEDED/i.test(t) ||
    /INVALID SOURCE LANGUAGE/i.test(t) ||
    /AUTO ('DE' IS DISABLED)/i.test(t)
  );
}

/**
 * @param {string} text
 */
async function translateViaGoogleGtx(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; iching-app-qa/1.0)" },
  });
  if (!res.ok) throw new Error(`Google GTX ${res.status}`);
  const data = /** @type {Array<Array<[string]>>} */ (await res.json());
  const translated = (data[0] ?? []).map((part) => part[0]).join("");
  const out = translated.trim();
  if (!out || isBadMachineTranslation(out)) throw new Error("Google GTX empty response");
  return out;
}

/**
 * @param {string} text
 */
export function hashTranslationKey(text) {
  return createHash("sha256").update(String(text ?? "")).digest("hex").slice(0, 24);
}

/**
 * @param {string} text
 * @param {number} maxLen
 */
export function splitTextForTranslation(text, maxLen = MYMEMORY_MAX) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLen) return [trimmed];

  /** @type {string[]} */
  const chunks = [];
  const paragraphs = trimmed.split(/\n{2,}/);

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxLen) {
      chunks.push(paragraph);
      continue;
    }

    const lines = paragraph.split("\n");
    let buffer = "";
    for (const line of lines) {
      const candidate = buffer ? `${buffer}\n${line}` : line;
      if (candidate.length <= maxLen) {
        buffer = candidate;
        continue;
      }
      if (buffer) chunks.push(buffer);
      if (line.length <= maxLen) {
        buffer = line;
        continue;
      }
      let rest = line;
      while (rest.length > maxLen) {
        let cut = rest.lastIndexOf(". ", maxLen);
        if (cut < maxLen * 0.4) cut = rest.lastIndexOf(" ", maxLen);
        if (cut < maxLen * 0.25) cut = maxLen;
        chunks.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
      }
      buffer = rest;
    }
    if (buffer) chunks.push(buffer);
  }

  return chunks.filter(Boolean);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {string} text
 */
async function translateViaLibreTranslate(text) {
  const apiKey = process.env.LIBRETRANSLATE_API_KEY?.trim();
  const baseUrl = process.env.LIBRETRANSLATE_URL?.trim() || "https://libretranslate.com";
  if (!apiKey) return null;

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "de",
      target: "en",
      format: "text",
      api_key: apiKey,
    }),
  });
  if (!res.ok) return null;
  const data = /** @type {{ translatedText?: string }} */ (await res.json());
  return String(data.translatedText ?? "").trim() || null;
}

/**
 * @param {string} text
 */
async function translateViaMyMemory(text) {
  const email = process.env.MYMEMORY_EMAIL?.trim();
  const params = new URLSearchParams({
    q: text,
    langpair: "de|en",
  });
  if (email) params.set("de", email);

  const res = await fetch(`${MYMEMORY_URL}?${params.toString()}`);
  const data = /** @type {{
    responseData?: { translatedText?: string };
    responseStatus?: number;
    responseDetails?: string;
  }} */ (await res.json());

  const translated = String(data.responseData?.translatedText ?? "").trim();
  const details = String(data.responseDetails ?? "");
  if (isBadMachineTranslation(translated) || /QUERY LENGTH LIMIT EXCEEDED/i.test(details)) {
    throw new Error(details || `MyMemory status ${data.responseStatus ?? res.status}`);
  }
  return translated;
}

/**
 * @param {string} text
 */
async function translateChunk(text) {
  const libre = await translateViaLibreTranslate(text);
  if (libre && !isBadMachineTranslation(libre)) return libre;

  try {
    return await translateViaGoogleGtx(text);
  } catch {
    // fall through to MyMemory
  }

  return translateViaMyMemory(text);
}

/**
 * @param {string} cachePath
 */
export async function loadTranslationCache(cachePath = DEFAULT_MT_CACHE_PATH) {
  try {
    const raw = JSON.parse(await readFile(cachePath, "utf8"));
    return new Map(Object.entries(raw));
  } catch {
    return new Map();
  }
}

/**
 * @param {string} cachePath
 */
export async function purgeBadTranslationCache(cachePath = DEFAULT_MT_CACHE_PATH) {
  const cache = await loadTranslationCache(cachePath);
  let removed = 0;
  for (const [key, value] of cache.entries()) {
    if (isBadMachineTranslation(value)) {
      cache.delete(key);
      removed++;
    }
  }
  await saveTranslationCache(cache, cachePath);
  return { removed, remaining: cache.size };
}

/**
 * @param {Map<string, string>} cache
 * @param {string} cachePath
 */
export async function saveTranslationCache(cache, cachePath = DEFAULT_MT_CACHE_PATH) {
  await mkdir(dirname(cachePath), { recursive: true });
  const obj = Object.fromEntries(cache.entries());
  await writeFile(cachePath, `${JSON.stringify(obj, null, 2)}\n`, "utf8");
}

/**
 * @param {string} text
 * @param {{
 *   cache?: Map<string, string>;
 *   delayMs?: number;
 *   onProgress?: (info: { done: number; total: number; cached: boolean }) => void;
 * }} [options]
 */
export async function translateDeToEn(text, options = {}) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return "";

  const cache = options.cache ?? new Map();
  const key = hashTranslationKey(trimmed);
  if (cache.has(key)) {
    const cached = cache.get(key) ?? "";
    if (!isBadMachineTranslation(cached)) {
      options.onProgress?.({ done: 1, total: 1, cached: true });
      return cached;
    }
    cache.delete(key);
  }

  const chunks = splitTextForTranslation(trimmed);
  const translated = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkKey = hashTranslationKey(chunk);
    if (cache.has(chunkKey)) {
      const cached = cache.get(chunkKey) ?? "";
      if (!isBadMachineTranslation(cached)) {
        translated.push(cached);
        options.onProgress?.({ done: i + 1, total: chunks.length, cached: true });
        continue;
      }
      cache.delete(chunkKey);
    }

    let attempt = 0;
    while (attempt < 4) {
      try {
        const result = await translateChunk(chunk);
        if (isBadMachineTranslation(result)) throw new Error("bad MT payload");
        cache.set(chunkKey, result);
        translated.push(result);
        options.onProgress?.({ done: i + 1, total: chunks.length, cached: false });
        if (options.delayMs && i < chunks.length - 1) await sleep(options.delayMs);
        break;
      } catch (err) {
        attempt++;
        if (attempt >= 4) throw err;
        await sleep(800 * attempt);
      }
    }
  }

  const joined = translated.join(chunks.length > 1 ? "\n\n" : "");
  cache.set(key, joined);
  return joined;
}

/**
 * @param {string[]} texts
 * @param {{
 *   cachePath?: string;
 *   delayMs?: number;
 *   skipMissing?: boolean;
 *   onRow?: (index: number, total: number) => void;
 * }} [options]
 */
export async function translateDeTextsBatch(texts, options = {}) {
  const cachePath = options.cachePath ?? DEFAULT_MT_CACHE_PATH;
  const cache = await loadTranslationCache(cachePath);
  const delayMs = options.delayMs ?? 300;
  const unique = [...new Set(texts.map((t) => String(t ?? "").trim()).filter(Boolean))];

  for (let i = 0; i < unique.length; i++) {
    options.onRow?.(i + 1, unique.length);
    const text = unique[i];
    const key = hashTranslationKey(text);
    if (cache.has(key)) continue;
    if (options.skipMissing) continue;

    try {
      await translateDeToEn(text, { cache, delayMs });
    } catch (err) {
      cache.set(key, "");
      console.warn(
        `MT failed for ${text.slice(0, 60).replace(/\s+/g, " ")}…: ${
          err instanceof Error ? err.message : err
        }`,
      );
    }

    if (i % 10 === 9) {
      await saveTranslationCache(cache, cachePath);
    }
  }

  await saveTranslationCache(cache, cachePath);

  /** @type {Map<string, string>} */
  const byText = new Map();
  for (const text of texts) {
    const trimmed = String(text ?? "").trim();
    if (!trimmed) {
      byText.set(text, "");
      continue;
    }
    byText.set(text, cache.get(hashTranslationKey(trimmed)) ?? "");
  }
  return byText;
}
