/**
 * Parse James Legge oracle gold from local EPUB (Sacred Books of the East XVI).
 * Reuses sacred-texts token logic after EPUB-specific HTML normalization.
 */

import { romanNumeral } from "./hexagram-fidelity-ctext-slugs.mjs";
import {
  parseLeggeTextPage,
  preprocessLeggeHtml,
} from "./hexagram-fidelity-legge-sacred.mjs";
import {
  ensureLeggeEpubExtracted,
  readLeggeEpubHexHtml,
  readLeggeEpubSymbolismHtml,
} from "./legge-epub-extract.mjs";

/** @param {string} html */
export function preprocessLeggeEpubHtml(html) {
  return (
    preprocessLeggeHtml(html)
      // EPUB occasionally splits "4.\n\n4. The fourth line…" across two <p> tags.
      .replace(/<p>(\d+)\.\s*<\/p>\s*<p>\1\.\s*/gi, "<p>$1. ")
      // EPUB uses <p class="guaheader"> instead of <h3> for hex titles.
      .replace(/<p class="guaheader"[^>]*>([\s\S]*?)<\/p>/i, "<h3>$1</h3>")
      // Drop diagram / decorative center blocks.
      .replace(/<p class="contentcenter"[^>]*>[\s\S]*?<\/p>/gi, "")
      // Drop inline “Explanation of…” headers (oracle follows in next <p>).
      .replace(/<p class="contentcenter brick[^"]*"[^>]*>[\s\S]*?<\/p>/gi, "")
      .replace(/<hr\s*\/?>/gi, "\n")
  );
}

function stripTags(s) {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
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
 * Great Symbolism (Appendix II §I) from icap2-1/2.xhtml in the Legge EPUB.
 * @param {string} html
 * @returns {Record<number, string>}
 */
export function parseLeggeSymbolismEpub(html) {
  const out = {};
  const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const inner = m[1];
    const romanMatch = inner.match(
      /guanumber">([IVXLCDM]+)<\/span><\/a>\.?\s*([\s\S]*)/i,
    );
    if (!romanMatch) continue;
    const hex = parseRomanNumeral(romanMatch[1]);
    if (!hex) continue;
    const body = stripTags(romanMatch[2]);
    if (!body) continue;
    if (/^\d+\.\s/.test(body)) continue;
    if (/^The (first|second|third|fourth|fifth|sixth|topmost) line/i.test(body)) {
      continue;
    }
    if (/^The lines of this hexagram/i.test(body)) continue;
    out[hex] = body;
  }
  return out;
}

/**
 * @param {string} html
 */
export function parseLeggeEpubTextPage(html) {
  return parseLeggeTextPage(preprocessLeggeEpubHtml(html));
}

/**
 * @returns {Promise<Record<number, { judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }>>}
 */
export async function parseAllLeggeEpubOrThrow() {
  await ensureLeggeEpubExtracted();
  const symbolismHtml = await readLeggeEpubSymbolismHtml();
  const imageByHex = parseLeggeSymbolismEpub(symbolismHtml);
  /** @type {Record<number, { judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }>} */
  const out = {};

  for (let n = 1; n <= 64; n++) {
    const html = await readLeggeEpubHexHtml(n);
    const parsed = parseLeggeEpubTextPage(html);
    const row = {
      judgment: parsed.judgment ?? "",
      image: imageByHex[n] ?? "",
      lines: parsed.lineByPos ?? {},
    };
    if (n === 1 && parsed.supernumerary) row.yongJiu = parsed.supernumerary;
    if (n === 2 && parsed.supernumerary) row.yongLiu = parsed.supernumerary;
    out[n] = row;
  }

  const missingImage = [];
  const missingJudgment = [];
  for (let n = 1; n <= 64; n++) {
    if (!out[n]?.judgment?.trim()) missingJudgment.push(n);
    if (!out[n]?.image?.trim()) missingImage.push(n);
  }
  if (missingJudgment.length) {
    throw new Error(`Legge EPUB: missing judgment for hex: ${missingJudgment.join(", ")}`);
  }
  if (missingImage.length) {
    throw new Error(`Legge EPUB: missing Great Symbolism for hex: ${missingImage.join(", ")}`);
  }

  return out;
}
