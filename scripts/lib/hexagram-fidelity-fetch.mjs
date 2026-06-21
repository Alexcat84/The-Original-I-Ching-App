import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { ctextUrnForHex, ctextSlugForHex } from "./hexagram-fidelity-ctext-slugs.mjs";
import { parseCtextHtml } from "./hexagram-fidelity-ctext.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, "..", "..");
export const GOLD_DIR = join(ROOT, "tools", "output", "fidelity-gold");

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export const BROWSER_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const PARMA_URL =
  "http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html";

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchToCache(url, cachePath, headers = { "User-Agent": USER_AGENT }) {
  await mkdir(dirname(cachePath), { recursive: true });
  if (await exists(cachePath)) {
    const cached = await readFile(cachePath, "utf8");
    if (cached.length > 500) return cached;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const body = await res.text();
  await writeFile(cachePath, body, "utf8");
  return body;
}

export async function loadParmaHtml({ live = false } = {}) {
  const cachePath = join(GOLD_DIR, "parma-wilhelm.html");
  if (!live && (await exists(cachePath))) {
    return readFile(cachePath, "utf8");
  }
  return fetchToCache(PARMA_URL, cachePath, BROWSER_HEADERS);
}

export async function loadLeggeTextHtml(hex, { live = false } = {}) {
  const name = `ic${String(hex).padStart(2, "0")}.htm`;
  const cachePath = join(GOLD_DIR, "legge-sacred", name);
  if (!live && (await exists(cachePath))) {
    return readFile(cachePath, "utf8");
  }
  const liveUrl = `https://www.sacred-texts.com/ich/${name}`;
  try {
    return await fetchToCache(liveUrl, cachePath, BROWSER_HEADERS);
  } catch {
    const wayback = `https://web.archive.org/web/2024id_/https://www.sacred-texts.com/ich/${name}`;
    return fetchToCache(wayback, cachePath, BROWSER_HEADERS);
  }
}

let icap2Promise;
export async function loadLeggeSymbolismHtml({ live = false } = {}) {
  const cachePath = join(GOLD_DIR, "legge-sacred", "icap2-combined.html");
  if (!live && (await exists(cachePath))) {
    return readFile(cachePath, "utf8");
  }
  if (!icap2Promise) {
    icap2Promise = (async () => {
      const parts = ["icap2-1.htm", "icap2-2.htm"];
      let html = "";
      for (const part of parts) {
        const liveUrl = `https://www.sacred-texts.com/ich/${part}`;
        const partCache = join(GOLD_DIR, "legge-sacred", part);
        try {
          html += await fetchToCache(liveUrl, partCache, BROWSER_HEADERS);
        } catch {
          const wayback = `https://web.archive.org/web/2024id_/https://www.sacred-texts.com/ich/${part}`;
          html += await fetchToCache(wayback, partCache, BROWSER_HEADERS);
        }
        await sleep(400);
      }
      await mkdir(dirname(cachePath), { recursive: true });
      await writeFile(cachePath, html, "utf8");
      return html;
    })();
  }
  return icap2Promise;
}

export async function loadCtextHtml(hex, { live = false } = {}) {
  const slug = ctextSlugForHex(hex);
  const htmlUrl = `https://ctext.org/book-of-changes/${slug}?lang=zh`;
  const htmlCache = join(GOLD_DIR, "ctext-html", `${String(hex).padStart(2, "0")}.html`);
  if (!live && (await exists(htmlCache))) {
    return readFile(htmlCache, "utf8");
  }
  const res = await fetch(htmlUrl, { headers: BROWSER_HEADERS });
  if (!res.ok) throw new Error(`ctext HTML ${res.status} hex ${hex}`);
  const html = await res.text();
  await mkdir(dirname(htmlCache), { recursive: true });
  await writeFile(htmlCache, html, "utf8");
  await sleep(1200);
  return html;
}

export async function loadCtextJson(hex, { live = false } = {}) {
  const urn = ctextUrnForHex(hex);
  const cachePath = join(GOLD_DIR, "ctext", `${String(hex).padStart(2, "0")}.json`);
  if (!live && (await exists(cachePath))) {
    const cached = JSON.parse(await readFile(cachePath, "utf8"));
    if (cached?.error) {
      // stale error cache — refetch below
    } else if (Array.isArray(cached?.fulltext) && cached.fulltext.length > 0) {
      return cached;
    }
  }

  const url = `https://api.ctext.org/gettext?urn=${encodeURIComponent(urn)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) throw new Error(`ctext HTTP ${res.status} hex ${hex}`);
    const json = await res.json();
    if (json?.error) throw new Error(json.error.code ?? "ctext_error");
    if (!Array.isArray(json?.fulltext) || json.fulltext.length === 0) {
      throw new Error("ctext empty fulltext");
    }
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, JSON.stringify(json, null, 2), "utf8");
    await sleep(900);
    return json;
  } catch (apiErr) {
    const slug = ctextSlugForHex(hex);
    const htmlUrl = `https://ctext.org/book-of-changes/${slug}?lang=zh`;
    const htmlCache = join(GOLD_DIR, "ctext-html", `${String(hex).padStart(2, "0")}.html`);
    let html;
    if (!live && (await exists(htmlCache))) {
      html = await readFile(htmlCache, "utf8");
    } else {
      const res = await fetch(htmlUrl, { headers: BROWSER_HEADERS });
      if (!res.ok) throw new Error(`ctext HTML ${res.status} hex ${hex} (${apiErr.message})`);
      html = await res.text();
      await mkdir(dirname(htmlCache), { recursive: true });
      await writeFile(htmlCache, html, "utf8");
      await sleep(1200);
    }
    const parsed = parseCtextHtml(html);
    const payload = {
      ...parsed,
      title: `html-fallback-${slug}`,
      source: "ctext-html",
      _apiFallback: apiErr.message,
    };
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, JSON.stringify({ ...payload, _apiFallback: apiErr.message }, null, 2), "utf8");
    return payload;
  }
}

export async function loadBundle(translator) {
  const file = join(
    ROOT,
    "packages",
    "iching-data",
    "src",
    "generated",
    `hexagrams.${translator}.json`,
  );
  return JSON.parse(await readFile(file, "utf8"));
}
