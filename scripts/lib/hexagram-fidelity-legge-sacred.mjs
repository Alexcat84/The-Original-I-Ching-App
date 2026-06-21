import { romanNumeral } from "./hexagram-fidelity-ctext-slugs.mjs";

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
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<a\b(?=[^>]*\sname=)(?![^>]*\shref=)[^>]*>[\s\S]*?<\/a>/gi, "")
      .replace(/<a\b[^>]*>(.*?)<\/a>/gis, "$1")
      .replace(/<img\b[^>]*>/gi, "")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\u200B/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function preprocessLeggeHtml(html) {
  return html
    .replace(/<(i|b|em|strong)\b[^>]*>/gi, "")
    .replace(/<\/(i|b|em|strong)>/gi, "");
}

function tokenize(html) {
  const out = [];
  const re = /<(h\d|p)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const text = stripTags(m[3]).trim();
    if (text) out.push({ tag, text });
  }
  return out;
}

function looksLikeLeggeJudgment(text) {
  return (
    /\((?:represents|indicates)\b/i.test(text) ||
    /\bintimates that\b/i.test(text) ||
    /\bhas\b.*\bsuccess\b/i.test(text)
  );
}

function isNumberedLine(text) {
  const m = text.match(/^(\d+)\.\s+([\s\S]+)$/);
  if (!m) return false;
  return /^(?:In the|The)\s+(?:first|second|third|fourth|fifth|topmost|sixth)/i.test(m[2]);
}

function mergeJudgmentFrom(tokens, startIdx) {
  const parts = [];
  for (let i = startIdx; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.tag !== "p") continue;
    if (isNumberedLine(t.text)) break;
    if (/^page_\d+/i.test(t.text)) continue;
    parts.push(t.text);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Parse sacred-texts.com icNN.htm (TEXT section I).
 * Supports ic01-style headers and ic03+ direct paragraphs.
 * @param {string} html
 */
export function parseLeggeTextPage(html) {
  const tokens = tokenize(preprocessLeggeHtml(html));
  let judgment = "";
  let sawKingWen = false;
  let sawLines = false;
  const lineByPos = {};
  let supernumerary = "";

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/Explanation of the entire figure by king W/i.test(t.text)) {
      sawKingWen = true;
      continue;
    }
    if (/Explanation of the separate lines by the duke/i.test(t.text)) {
      sawLines = true;
      sawKingWen = false;
      continue;
    }
    if (t.tag.startsWith("h")) continue;
    if (t.text.startsWith("Footnotes") || /^page_\d+/i.test(t.text)) continue;

    if (sawKingWen && !judgment && t.tag === "p") {
      judgment = mergeJudgmentFrom(tokens, i);
      sawKingWen = false;
      continue;
    }

    if (!judgment && t.tag === "p" && !sawLines) {
      if (isNumberedLine(t.text)) continue;
      if (looksLikeLeggeJudgment(t.text)) {
        judgment = mergeJudgmentFrom(tokens, i);
        continue;
      }
    }

    if (sawLines && t.tag === "p") {
      const m = t.text.match(/^(\d+)\.\s+([\s\S]+)$/);
      if (!m) continue;
      const idx = parseInt(m[1], 10);
      const body = m[2].trim();
      if (idx >= 1 && idx <= 6) lineByPos[idx] = body;
      else if (idx === 7) supernumerary = body;
      continue;
    }

    if (t.tag === "p" && isNumberedLine(t.text)) {
      const m = t.text.match(/^(\d+)\.\s+([\s\S]+)$/);
      if (!m) continue;
      const idx = parseInt(m[1], 10);
      const body = m[2].trim();
      if (idx >= 1 && idx <= 6) lineByPos[idx] = body;
      else if (idx === 7) supernumerary = body;
    }
  }

  return { judgment, lineByPos, supernumerary };
}

/**
 * Parse combined icap2 appendix (Great Symbolism section I).
 * @param {string} html
 * @returns {Record<number, string>}
 */
export function parseLeggeSymbolismAppendix(html) {
  const out = {};
  for (let n = 1; n <= 64; n++) {
    const roman = romanNumeral(n);
    const marker = `<FONT SIZE="1">${roman}</FONT></A>.`;
    const idx = html.indexOf(marker);
    if (idx < 0) {
      // Fallback: plain-text marker after strip
      continue;
    }
    const slice = html.slice(idx, idx + 1200);
    const pMatch = slice.match(/<P[^>]*>([\s\S]*?)<\/P>/i);
    if (!pMatch) continue;
    let text = stripTags(pMatch[1]);
    text = text.replace(new RegExp(`^${roman}\\.\\s*`, "i"), "").trim();
    if (text && !/^\d+\.\s/.test(text)) out[n] = text;
  }

  if (Object.keys(out).length < 64) {
    // Second pass: find all `<FONT SIZE="1">ROMAN</FONT></A>. text` in order
    const re =
      /<FONT SIZE="1">([IVXLCDM]+)<\/FONT><\/A>\.\s*([^<]+?)(?=<\/P>)/gi;
    const found = [];
    let m;
    while ((m = re.exec(html)) !== null) {
      const body = stripTags(m[2]).trim();
      if (!body || /^\d+\.\s/.test(body)) continue;
      found.push(body);
    }
    if (found.length >= 64) {
      for (let n = 1; n <= 64; n++) out[n] = found[n - 1];
    }
  }

  return out;
}
