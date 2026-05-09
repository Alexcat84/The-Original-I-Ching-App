/**
 * Ingest James Legge 1882/1899 I Ching translation from baharna.com.
 *
 * Source: https://baharna.com/iching/legge/{binaryBottomFirst}.htm
 * Translator: James Legge, Sacred Books of the East vol. 16 (1882, 1899 revised).
 * Legge died 1897; the text is firmly in the public domain.
 *
 * Why baharna.com:
 *  - Provides Thwan (judgment), Great Symbolism (Da Xiang / IMAGE), and Line Statements
 *    in one page per hexagram, all 64 published.
 *  - Editorial framing notes are © Joseph F. Morales 2012-2018, but the *quoted Legge
 *    paragraphs* themselves are public domain.
 *  - Pages mark non-Legge translators with bracket tags (e.g. `[Whincup]`,
 *    `[Christensen]`, `[Pearson]`, `[Redmond]`, `[Smaller Symbolism]`,
 *    `[Explanation of the Sentences]`, `[Legge]` for Legge's own commentary). We only
 *    keep the unbracketed Legge primary text under each section heading.
 *
 * Pipeline:
 *  1. For each hexagram 1..64 derive the bottom-first binary id from the existing
 *     Wilhelm dataset (top-first) and fetch baharna.com page.
 *  2. Cache raw HTML to tools/output/legge-raw/{binaryBottomFirst}.html.
 *  3. Parse: extract Thwan paragraph, Great Symbolism paragraph, and the six
 *     Line Statements paragraphs (plus any supernumerary line 7 for hex 1 & 2).
 *  4. Write tools/output/legge-raw/legge.json (intermediate) and
 *     scripts/iching_legge_translation.mjs (consumed by the generic builder).
 *
 * Run: node tools/ingest-legge.mjs
 */

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cacheDir = join(root, "tools", "output", "legge-raw");
const intermediateOut = join(cacheDir, "legge.json");
const finalOut = join(root, "scripts", "iching_legge_translation.mjs");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const COMMON_HEADERS = {
  "User-Agent": USER_AGENT,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const FETCH_DELAY_MS = 1500;

const wilhelmModule = await import(
  pathToFileURL(join(root, "scripts", "iching_wilhelm_translation.mjs")).href
);
const wilhelm = wilhelmModule.default;

function topFirstToBottomFirst(top) {
  const padded = String(top).padStart(6, "0").slice(-6);
  return padded.split("").reverse().join("");
}

const HEX_BINARY_BOTTOM_FIRST = {};
const HEX_GLYPH = {};
for (let n = 1; n <= 64; n++) {
  const w = wilhelm[String(n)];
  if (!w) throw new Error(`Wilhelm dataset missing hex ${n}`);
  HEX_BINARY_BOTTOM_FIRST[n] = topFirstToBottomFirst(w.binary);
  HEX_GLYPH[n] = w.hex_font;
}

const HEXAGRAM_URL = (n) =>
  `https://baharna.com/iching/legge/${HEX_BINARY_BOTTOM_FIRST[n]}.htm`;

async function fileExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function fetchCached(url, cachePath) {
  if (await fileExists(cachePath)) {
    const cached = await readFile(cachePath, "utf8");
    if (cached.length > 1000) return cached;
  }
  const res = await fetch(url, { headers: COMMON_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  await writeFile(cachePath, html, "utf8");
  await sleep(FETCH_DELAY_MS);
  return html;
}

const HTML_ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&[a-zA-Z][a-zA-Z0-9]+;/g, (m) => HTML_ENTITIES[m] ?? m);
}

function stripTags(s) {
  return decodeEntities(
    s
      .replace(/<a\b(?=[^>]*\sname=)(?![^>]*\shref=)[^>]*>[\s\S]*?<\/a>/gi, "")
      .replace(/<a\b[^>]*>(.*?)<\/a>/gis, "$1")
      .replace(/<img\b[^>]*>/gi, "")
      .replace(/<sup\b[^>]*>.*?<\/sup>/gis, "")
      .replace(/<style\b[^>]*>.*?<\/style>/gis, "")
      .replace(/<script\b[^>]*>.*?<\/script>/gis, "")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\u200B/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \u00a0]+/g, " ")
    .trim();
}

function tokenize(html) {
  const out = [];
  const re = /<(h\d|p)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const inner = m[3];
    const text = stripTags(inner).trim();
    if (text.length === 0) continue;
    out.push({ tag, text });
  }
  return out;
}

function parseHexagramHtml(n, html) {
  const tokens = tokenize(html);

  const sectionLabels = {
    thwan: /^Thwan,?\s+or\s+Overall\s+Judgment/i,
    image: /^Great\s+Symbolism/i,
    lines: /^(?:Line\s+Statements|Lines?)\b/i,
  };

  const sectionStart = { thwan: -1, image: -1, lines: -1 };
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t.tag.startsWith("h")) continue;
    for (const key of Object.keys(sectionLabels)) {
      if (sectionStart[key] < 0 && sectionLabels[key].test(t.text)) {
        sectionStart[key] = i;
      }
    }
  }

  function isLeggePrimary(text) {
    if (text.startsWith("[")) return false;
    if (/^Matching Line in Adjacent Hexagram/i.test(text)) return false;
    if (/^Previous|^Next|^Contents/i.test(text)) return false;
    return true;
  }

  function firstParagraphAfter(idx) {
    if (idx < 0) return "";
    for (let i = idx + 1; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.tag.startsWith("h")) return "";
      if (t.tag !== "p") continue;
      if (!isLeggePrimary(t.text)) continue;
      return t.text;
    }
    return "";
  }

  const judgment = firstParagraphAfter(sectionStart.thwan);
  const image = firstParagraphAfter(sectionStart.image);

  const lineByPos = {};
  let supernumerary = "";
  if (sectionStart.lines >= 0) {
    let expecting = 1;
    for (let i = sectionStart.lines + 1; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.tag.startsWith("h")) break;
      if (t.tag !== "p") continue;
      if (!isLeggePrimary(t.text)) continue;
      const m = t.text.match(/^(\d+)\s*\.\s+([\s\S]+)$/);
      if (!m) continue;
      const idx = parseInt(m[1], 10);
      if (idx !== expecting && idx !== 7) continue;
      const body = m[2].trim();
      if (idx >= 1 && idx <= 6) {
        lineByPos[idx] = body;
        expecting = idx + 1;
      } else if (idx === 7) {
        supernumerary = body;
      }
    }
  }

  let chapterName = "";
  for (const t of tokens) {
    if (!t.tag.startsWith("h")) continue;
    const m = t.text.match(/^(\d+)\.\s+(.+?)(?:\s+\[.*\])?\s*$/);
    if (m && parseInt(m[1], 10) === n) {
      chapterName = m[2].trim();
      break;
    }
  }

  return {
    hex: n,
    name: chapterName,
    judgment,
    image,
    lineByPos,
    supernumerary,
    glyph: HEX_GLYPH[n],
  };
}

async function main() {
  await mkdir(cacheDir, { recursive: true });

  const dataset = {};
  const issues = [];

  console.log("Fetching 64 Legge hexagrams from baharna.com...");
  for (let n = 1; n <= 64; n++) {
    try {
      const id = HEX_BINARY_BOTTOM_FIRST[n];
      const cachePath = join(cacheDir, `${id}.html`);
      const html = await fetchCached(HEXAGRAM_URL(n), cachePath);
      const parsed = parseHexagramHtml(n, html);
      const lineCount = Object.keys(parsed.lineByPos).length;
      const judgmentLen = parsed.judgment.length;
      const imageLen = parsed.image.length;
      console.log(
        `  Hex ${String(n).padStart(2, "0")} (${id}): name="${parsed.name}" J=${judgmentLen}ch I=${imageLen}ch lines=${lineCount}/6 yong=${parsed.supernumerary ? "Y" : "—"}`,
      );
      if (judgmentLen === 0) issues.push({ n, why: "missing judgment" });
      if (imageLen === 0) issues.push({ n, why: "missing image" });
      if (lineCount < 6) issues.push({ n, why: `lines=${lineCount}/6` });
      dataset[String(n)] = {
        hex: n,
        hex_font: parsed.glyph,
        name: parsed.name,
        legge_judgment: { text: parsed.judgment },
        legge_image: { text: parsed.image },
        legge_lines: Object.fromEntries(
          [1, 2, 3, 4, 5, 6].map((p) => [String(p), { text: parsed.lineByPos[p] ?? "" }]),
        ),
        yong_supernumerary: parsed.supernumerary || undefined,
      };
    } catch (err) {
      console.error(`  Hex ${n}: FAIL`, err.message);
      issues.push({ n, error: err.message });
    }
  }

  await writeFile(intermediateOut, JSON.stringify(dataset, null, 2), "utf8");
  console.log("\nWrote intermediate", intermediateOut);

  const body =
    "// Generated by tools/ingest-legge.mjs from baharna.com Legge edition.\n" +
    "// Source: https://baharna.com/iching/legge/{binaryBottomFirst}.htm\n" +
    "// Translator: James Legge (1882/1899). Public domain.\n" +
    "// Editorial framing of baharna.com © Joseph F. Morales (not reused).\n\n" +
    "export default " +
    JSON.stringify(dataset, null, 2) +
    ";\n";
  await writeFile(finalOut, body, "utf8");
  console.log("Wrote", finalOut);

  if (issues.length > 0) {
    console.warn(`\nFinished with ${issues.length} issues:`);
    for (const it of issues) console.warn("  ", it);
    process.exitCode = 1;
  } else {
    console.log("\nAll 64 hexagrams ingested cleanly.");
  }
}

await main();
