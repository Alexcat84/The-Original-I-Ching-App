/**
 * Full Wilhelm/Baynes EPUB extract: oracle + Wilhelm commentary per section.
 * Oracle fields match hexagram-fidelity-wilhelm-epub.mjs; commentary from calibre21/22 <p>.
 */

import {
  blockquoteTextsFromDiv,
  findWilhelmEpubSectionStart,
  linePosFromLabel,
  parseWilhelmEpubHexHtml,
  stripWilhelmEpubTags,
} from "./hexagram-fidelity-wilhelm-epub.mjs";
import {
  buildWilhelmEpubHexFileMap,
  ensureWilhelmEpubExtracted,
  readWilhelmEpubHexHtml,
} from "./wilhelm-epub-extract.mjs";

const COMMENTARY_RE = /<p class="calibre(?:21|22)"[^>]*>([\s\S]*?)<\/p>/gi;

/**
 * @param {string} htmlFragment
 * @returns {string[]}
 */
export function extractWilhelmCommentaryParagraphs(htmlFragment) {
  const out = [];
  let m;
  const re = new RegExp(COMMENTARY_RE.source, COMMENTARY_RE.flags);
  while ((m = re.exec(htmlFragment)) !== null) {
    const t = stripWilhelmEpubTags(m[1]);
    if (t) out.push(t);
  }
  return out;
}

/**
 * @param {string} html
 * @param {"JUDGMENT"|"IMAGE"} section
 */
function extractJudgmentOrImageFull(html, section) {
  const start = findWilhelmEpubSectionStart(html, section);
  if (start < 0) {
    return { oracle: "", commentary: [] };
  }
  const rest = html.slice(start);
  const stops = ["JUDGMENT", "IMAGE", "LINES"].filter((s) => s !== section);
  let end = rest.length;
  for (const stop of stops) {
    const i = findWilhelmEpubSectionStart(rest, stop);
    if (i > 40 && i < end) end = i;
  }
  const sectionHtml = rest.slice(0, end);
  const divMatch = sectionHtml.match(/<div class="calibre12">([\s\S]*?)<\/div>/i);
  const oracle = divMatch ? blockquoteTextsFromDiv(divMatch[1]).join("\n").trim() : "";
  const afterDiv = divMatch ? sectionHtml.slice(sectionHtml.indexOf(divMatch[0]) + divMatch[0].length) : sectionHtml;
  return {
    oracle,
    commentary: extractWilhelmCommentaryParagraphs(afterDiv),
  };
}

/**
 * @param {string} html
 */
function extractWilhelmLinesFull(html) {
  /** @type {Record<string, { label: string; oracle: string; commentary: string[] }>} */
  const lines = {};
  const linesIdx = findWilhelmEpubSectionStart(html, "LINES");
  if (linesIdx < 0) return lines;

  const linesPart = html.slice(linesIdx);
  const divMatches = [...linesPart.matchAll(/<div class="calibre12">([\s\S]*?)<\/div>/gi)];

  for (let i = 0; i < divMatches.length; i++) {
    const m = divMatches[i];
    const bqs = blockquoteTextsFromDiv(m[1]);
    if (bqs.length < 2) continue;
    const label = bqs[0];
    if (!/means:/i.test(label)) continue;
    const pos = linePosFromLabel(label);
    let oracle = bqs.slice(1).join("\n").trim();
    const commentaryStart = m.index + m[0].length;
    const commentaryEnd =
      i + 1 < divMatches.length ? divMatches[i + 1].index : linesPart.length;
    const commentary = extractWilhelmCommentaryParagraphs(
      linesPart.slice(commentaryStart, commentaryEnd),
    );
    const key =
      pos === "yongJiu" ? "yongJiu" : pos === "yongLiu" ? "yongLiu" : String(pos);
    if (key !== "0") {
      lines[key] = { label, oracle, commentary };
    }
  }
  return lines;
}

/**
 * @param {string} html
 */
export function parseWilhelmEpubFullHtml(html) {
  const judgmentIdx = findWilhelmEpubSectionStart(html, "JUDGMENT");
  const introHtml = judgmentIdx > 0 ? html.slice(0, judgmentIdx) : "";
  const oracleOnly = parseWilhelmEpubHexHtml(html);

  return {
    introduction: {
      paragraphs: extractWilhelmCommentaryParagraphs(introHtml),
    },
    judgment: extractJudgmentOrImageFull(html, "JUDGMENT"),
    image: extractJudgmentOrImageFull(html, "IMAGE"),
    lines: extractWilhelmLinesFull(html),
    oracleSummary: {
      judgment: oracleOnly.judgment,
      image: oracleOnly.image,
      lines: oracleOnly.lines,
      ...(oracleOnly.yongJiu ? { yongJiu: oracleOnly.yongJiu } : {}),
      ...(oracleOnly.yongLiu ? { yongLiu: oracleOnly.yongLiu } : {}),
    },
  };
}

/**
 * @returns {Promise<Record<number, ReturnType<typeof parseWilhelmEpubFullHtml>>>}
 */
export async function parseAllWilhelmEpubFullOrThrow() {
  await ensureWilhelmEpubExtracted();
  await buildWilhelmEpubHexFileMap();
  /** @type {Record<number, ReturnType<typeof parseWilhelmEpubFullHtml>>} */
  const out = {};
  const issues = [];

  for (let n = 1; n <= 64; n++) {
    const html = await readWilhelmEpubHexHtml(n);
    const parsed = parseWilhelmEpubFullHtml(html);
    out[n] = parsed;

    if (!parsed.judgment.oracle?.trim()) issues.push(`hex ${n}: missing judgment oracle`);
    if (!parsed.image.oracle?.trim()) issues.push(`hex ${n}: missing image oracle`);
    if (!parsed.judgment.commentary.length) issues.push(`hex ${n}: missing judgment commentary`);
    if (!parsed.introduction.paragraphs.length) issues.push(`hex ${n}: missing intro`);
    const lineKeys = Object.keys(parsed.lines).filter((k) => /^[1-6]$/.test(k));
    if (lineKeys.length < 4) issues.push(`hex ${n}: sparse lines (${lineKeys.length})`);
  }

  if (issues.length) {
    throw new Error(`Wilhelm EPUB full extract issues:\n${issues.slice(0, 20).join("\n")}`);
  }
  return out;
}
