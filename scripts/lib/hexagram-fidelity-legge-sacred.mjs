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
  if (text.length < 40) return false;
  return (
    /\((?:represents|indicates)\b/i.test(text) ||
    /\b(?:represents|indicates|intimates)\b/i.test(text) ||
    /\bhas\b.*\bsuccess\b/i.test(text) ||
    /\bthere will be good fortune\b/i.test(text)
  );
}

function isNumberedLine(text) {
  const m = text.match(/^(\d+|S)\.\s+([\s\S]+)$/i);
  if (!m) return false;
  const body = m[2];
  return (
    /^(?:In the|The)\s+(?:first|second|third|fourth|fifth|topmost|sixth)/i.test(body) ||
    /^The (?:first|second|third|fourth|fifth|topmost|sixth)/i.test(body)
  );
}

function lineIndexFromNumber(raw) {
  if (/^S$/i.test(raw)) return 5;
  return parseInt(raw, 10);
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

function findJudgmentFallback(tokens) {
  const h3Idx = tokens.findIndex((t) => t.tag === "h3" && /HEXAGRAM/i.test(t.text));
  if (h3Idx < 0) return "";
  for (let i = h3Idx + 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (isNumberedLine(t.text)) break;
    if (/Explanation of the separate lines/i.test(t.text)) break;
    if (t.tag !== "p") continue;
    if (/^page_\d+/i.test(t.text)) continue;
    if (/^Explanation of the entire figure/i.test(t.text)) continue;
    if (t.text.length < 20) continue;
    if (looksLikeLeggeJudgment(t.text)) {
      return mergeJudgmentFrom(tokens, i);
    }
  }
  return "";
}

/**
 * Parse sacred-texts.com icNN.htm (TEXT section I).
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

    if (!judgment && t.tag === "p" && !sawLines && !isNumberedLine(t.text)) {
      if (looksLikeLeggeJudgment(t.text)) {
        judgment = mergeJudgmentFrom(tokens, i);
        continue;
      }
    }

    if (sawLines && t.tag === "p") {
      const m = t.text.match(/^(\d+|S)\.\s+([\s\S]+)$/i);
      if (!m) continue;
      const idx = lineIndexFromNumber(m[1]);
      const body = m[2].trim();
      if (idx >= 1 && idx <= 6) lineByPos[idx] = body;
      else if (idx === 7) supernumerary = body;
      continue;
    }

    if (t.tag === "p" && isNumberedLine(t.text)) {
      const m = t.text.match(/^(\d+|S)\.\s+([\s\S]+)$/i);
      if (!m) continue;
      const idx = lineIndexFromNumber(m[1]);
      const body = m[2].trim();
      if (idx >= 1 && idx <= 6) lineByPos[idx] = body;
      else if (idx === 7) supernumerary = body;
    }
  }

  if (!judgment) judgment = findJudgmentFallback(tokens);

  return { judgment, lineByPos, supernumerary };
}

/** @param {string} roman */
function parseRomanNumeral(roman) {
  const map = new Map();
  for (let n = 1; n <= 64; n++) map.set(romanNumeral(n).toUpperCase(), n);
  return map.get(String(roman).trim().toUpperCase()) ?? null;
}

/**
 * Parse combined icap2 appendix (Great Symbolism section I).
 * @param {string} html
 * @returns {Record<number, string>}
 */
export function parseLeggeSymbolismAppendix(html) {
  const out = {};
  const re =
    /<FONT SIZE="1">([IVXLCDM]+)<\/FONT><\/A>\.\s*([\s\S]*?)<\/P>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const hex = parseRomanNumeral(m[1]);
    if (!hex) continue;
    let body = stripTags(m[2]).trim();
    body = body.replace(/^[IVXLCDM]+\.\s*/i, "").trim();
    if (!body || /^\d+\.\s/.test(body)) continue;
    if (/^The lines of this hexagram/i.test(body)) continue;
    if (/^'\w/.test(body)) continue;
    out[hex] = body;
  }
  return out;
}
