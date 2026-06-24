/**
 * Full Legge EPUB extract: oracle text + appendix symbolism + line commentary + footnotes.
 */

import { romanNumeral } from "./hexagram-fidelity-ctext-slugs.mjs";
import {
  parseLeggeEpubTextPage,
  preprocessLeggeEpubHtml,
} from "./hexagram-fidelity-legge-epub.mjs";
import {
  ensureLeggeEpubExtracted,
  readLeggeEpubHexHtml,
  readLeggeEpubSymbolismHtml,
} from "./legge-epub-extract.mjs";

function stripTags(s) {
  return String(s ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<a\b[^>]*>(.*?)<\/a>/gis, "$1")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRomanNumeral(roman) {
  const map = new Map();
  for (let n = 1; n <= 64; n++) map.set(romanNumeral(n).toUpperCase(), n);
  return map.get(String(roman).trim().toUpperCase()) ?? null;
}

/**
 * Appendix II §I: Great Symbolism + Duke line commentary per hex.
 * @param {string} html
 * @returns {Record<number, { image: string; lineCommentary: Record<number, string> }>}
 */
export function parseLeggeAppendixFull(html) {
  /** @type {Record<number, { image: string; lineCommentary: Record<number, string> }>} */
  const out = {};
  let currentHex = 0;
  const pRe = /<p([^>]*)>([\s\S]*?)<\/p>/gi;
  let m;

  while ((m = pRe.exec(html)) !== null) {
    const attrs = m[1];
    const content = m[2];
    if (/class="[^"]*contentcenter/i.test(attrs) && !/guanumber/i.test(content)) continue;
    if (/class="[^"]*smaller/i.test(attrs)) continue;

    const romanMatch = content.match(/guanumber">([IVXLCDM]+)<\/span>/i);
    if (romanMatch) {
      currentHex = parseRomanNumeral(romanMatch[1]) ?? 0;
      if (!currentHex) continue;
      if (!out[currentHex]) out[currentHex] = { image: "", lineCommentary: {} };
      const body = stripTags(
        content.replace(/[\s\S]*?guanumber">[IVXLCDM]+<\/span>[\s\S]*?<\/a>\.?\s*/i, ""),
      );
      out[currentHex].image = body.replace(/^[IVXLCDM]+\.\s*/i, "").trim();
      continue;
    }

    if (!currentHex) continue;
    const text = stripTags(content);
    if (!text || /^page_/i.test(text)) continue;

    const num = text.match(/^(\d+|S|[IVXLCDM]+)\.\s+/i);
    if (!num) continue;
    const raw = num[1].toUpperCase();
    let pos = parseInt(raw, 10);
    if (Number.isNaN(pos)) {
      const romanMap = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, S: 5 };
      pos = romanMap[raw] ?? 0;
    }
    if (pos >= 1 && pos <= 7) {
      out[currentHex].lineCommentary[pos] = text.replace(/^(\d+|S|[IVXLCDM]+)\.\s+/, "").trim();
    }
  }

  return out;
}

/**
 * @param {string} html
 */
function parseLeggeFootnotes(html) {
  const footnotes = [];
  const hrIdx = html.search(/<h3[^>]*>[\s\S]*?Footnotes/i);
  if (hrIdx < 0) return footnotes;
  const tail = html.slice(hrIdx);
  const pRe = /<p class="smaller"[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = pRe.exec(tail)) !== null) {
    const text = stripTags(m[1]);
    if (text) footnotes.push(text);
  }
  return footnotes;
}

/**
 * @param {string} html
 */
export function parseLeggeEpubFullHexHtml(html, appendixRow) {
  const processed = preprocessLeggeEpubHtml(html);
  const oracle = parseLeggeEpubTextPage(processed);

  /** @type {Record<number, { oracle: string }>} */
  const lines = {};
  for (const [pos, text] of Object.entries(oracle.lineByPos ?? {})) {
    lines[Number(pos)] = { oracle: text };
  }

  return {
    judgment: {
      header: "Explanation of the entire figure by king Wân.",
      oracle: oracle.judgment ?? "",
    },
    linesSection: {
      header: "Explanation of the separate lines by the duke of Kâu.",
      lines,
      ...(oracle.supernumerary
        ? { supernumerary: { oracle: oracle.supernumerary } }
        : {}),
    },
    appendix: {
      image: {
        oracle: appendixRow?.image ?? "",
      },
      lineCommentary: appendixRow?.lineCommentary ?? {},
    },
    footnotes: parseLeggeFootnotes(html),
    oracleSummary: {
      judgment: oracle.judgment ?? "",
      image: appendixRow?.image ?? "",
      lines: oracle.lineByPos ?? {},
      ...(oracle.supernumerary ? { supernumerary: oracle.supernumerary } : {}),
    },
  };
}

/**
 * @returns {Promise<Record<number, ReturnType<typeof parseLeggeEpubFullHexHtml>>>}
 */
export async function parseAllLeggeEpubFullOrThrow() {
  await ensureLeggeEpubExtracted();
  const symbolismHtml = await readLeggeEpubSymbolismHtml();
  const appendixByHex = parseLeggeAppendixFull(symbolismHtml);
  /** @type {Record<number, ReturnType<typeof parseLeggeEpubFullHexHtml>>} */
  const out = {};
  const issues = [];

  for (let n = 1; n <= 64; n++) {
    const html = await readLeggeEpubHexHtml(n);
    const appendixRow = appendixByHex[n];
    const parsed = parseLeggeEpubFullHexHtml(html, appendixRow);
    out[n] = parsed;

    if (!parsed.judgment.oracle?.trim()) issues.push(`hex ${n}: missing judgment`);
    if (!parsed.appendix.image.oracle?.trim()) issues.push(`hex ${n}: missing Great Symbolism`);
    const lc = Object.keys(parsed.appendix.lineCommentary).length;
    if (lc < 4) issues.push(`hex ${n}: sparse line commentary (${lc})`);
  }

  if (issues.length) {
    throw new Error(`Legge EPUB full extract issues:\n${issues.slice(0, 20).join("\n")}`);
  }
  return out;
}
