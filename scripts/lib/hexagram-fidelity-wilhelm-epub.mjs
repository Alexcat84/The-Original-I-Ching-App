/**
 * Parse Wilhelm/Baynes Book I oracle fields from Princeton Bollingen EPUB (2011).
 * Statement-only: blockquote oracle text; commentary in <p class="calibre21"> is ignored.
 */

import { wilhelmImageOracleOnly } from "./hexagram-fidelity-normalize.mjs";
import {
  buildWilhelmEpubHexFileMap,
  ensureWilhelmEpubExtracted,
  readWilhelmEpubHexHtml,
} from "./wilhelm-epub-extract.mjs";

/**
 * @param {string} html
 */
export function stripWilhelmEpubInline(html) {
  return String(html ?? "")
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/<span[^>]*>\s*<img\b[^>]*>\s*<\/span>/gi, "")
    .replace(/<img\b[^>]*>/gi, "");
}

/**
 * @param {string} html
 */
export function stripWilhelmEpubTags(html) {
  return stripWilhelmEpubInline(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * @param {string} divHtml
 */
function blockquoteTextsFromDiv(divHtml) {
  const texts = [];
  const re = /<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi;
  let m;
  while ((m = re.exec(divHtml)) !== null) {
    const t = stripWilhelmEpubTags(m[1]);
    if (!t) continue;
    if (/^THE (JUDGMEN|IMAGE|LINES)\b/i.test(t)) continue;
    texts.push(t);
  }
  return texts;
}

/**
 * @param {string} label
 */
function linePosFromLabel(label) {
  if (/all the lines are nines/i.test(label)) return "yongJiu";
  if (/all the lines are sixes/i.test(label)) return "yongLiu";
  if (/at the beginning|in the beginning/i.test(label)) return 1;
  if (/second place/i.test(label)) return 2;
  if (/third place/i.test(label)) return 3;
  if (/fourth place/i.test(label)) return 4;
  if (/fifth place/i.test(label)) return 5;
  if (/at the top/i.test(label)) return 6;
  return 0;
}

/**
 * @param {string} html
 * @param {"JUDGMENT"|"IMAGE"|"LINES"} section
 */
function findWilhelmEpubSectionStart(html, section) {
  const re = new RegExp(
    `<blockquote[^>]*>[\\s\\S]*?<span class="calibre9">\\s*THE ${section}(?:\\s*<a\\b[^>]*>[\\s\\S]*?<\\/a>)?\\s*<\\/span>`,
    "i",
  );
  const m = re.exec(html);
  return m ? m.index : -1;
}

/**
 * @param {string} html
 * @param {"JUDGMENT"|"IMAGE"} section
 */
function extractJudgmentOrImage(html, section) {
  const start = findWilhelmEpubSectionStart(html, section);
  if (start < 0) return "";
  const rest = html.slice(start);
  const stops = ["JUDGMENT", "IMAGE", "LINES"].filter((s) => s !== section);
  let end = rest.length;
  for (const stop of stops) {
    const i = findWilhelmEpubSectionStart(rest, stop);
    if (i > 40 && i < end) end = i;
  }
  const sectionHtml = rest.slice(0, end);
  const divMatch = sectionHtml.match(/<div class="calibre12">([\s\S]*?)<\/div>/i);
  if (!divMatch) return "";
  return blockquoteTextsFromDiv(divMatch[1]).join("\n").trim();
}

/**
 * @param {string} html
 */
export function parseWilhelmEpubHexHtml(html) {
  const judgment = extractJudgmentOrImage(html, "JUDGMENT");
  const image = wilhelmImageOracleOnly(extractJudgmentOrImage(html, "IMAGE"));
  /** @type {Record<number, string>} */
  const lines = {};
  let yongJiu = "";
  let yongLiu = "";

  const linesIdx = findWilhelmEpubSectionStart(html, "LINES");
  if (linesIdx >= 0) {
    const linesPart = html.slice(linesIdx);
    const divRe = /<div class="calibre12">([\s\S]*?)<\/div>/gi;
    let dm;
    while ((dm = divRe.exec(linesPart)) !== null) {
      const bqs = blockquoteTextsFromDiv(dm[1]);
      if (bqs.length < 2) continue;
      const label = bqs[0];
      if (!/means:/i.test(label)) continue;
      const pos = linePosFromLabel(label);
      const oracleParts = bqs.slice(1);
      let text = oracleParts.join("\n").trim();
      if (pos === "yongJiu" || pos === "yongLiu") {
        text = text.replace(/\s+Good fortune\.?\s*$/i, "").trim();
      }
      if (pos === "yongJiu") yongJiu = text;
      else if (pos === "yongLiu") yongLiu = text;
      else if (typeof pos === "number" && pos >= 1 && pos <= 6 && text) lines[pos] = text;
    }
  }

  return {
    judgment,
    image,
    lines,
    ...(yongJiu ? { yongJiu } : {}),
    ...(yongLiu ? { yongLiu } : {}),
  };
}

/**
 * @returns {Promise<Record<number, { judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }>>}
 */
export async function parseAllWilhelmEpubOrThrow() {
  await ensureWilhelmEpubExtracted();
  await buildWilhelmEpubHexFileMap();
  /** @type {Record<number, object>} */
  const out = {};
  const missingJudgment = [];
  const missingImage = [];
  const missingLines = [];

  for (let n = 1; n <= 64; n++) {
    const html = await readWilhelmEpubHexHtml(n);
    const parsed = parseWilhelmEpubHexHtml(html);
    out[n] = parsed;
    if (!parsed.judgment?.trim()) missingJudgment.push(n);
    if (!parsed.image?.trim()) missingImage.push(n);
    const filled = Object.keys(parsed.lines ?? {}).length;
    if (filled < 4) missingLines.push(`${n}(${filled})`);
  }

  if (missingJudgment.length) {
    throw new Error(`Wilhelm EPUB: missing judgment for hex: ${missingJudgment.join(", ")}`);
  }
  if (missingImage.length) {
    throw new Error(`Wilhelm EPUB: missing image for hex: ${missingImage.join(", ")}`);
  }
  if (missingLines.length) {
    throw new Error(`Wilhelm EPUB: sparse lines: ${missingLines.slice(0, 12).join(", ")}`);
  }
  return out;
}
