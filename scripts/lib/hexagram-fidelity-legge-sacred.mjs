import { romanNumeral } from "./hexagram-fidelity-ctext-slugs.mjs";

const HTML_ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&icirc;": "î",
  "&acirc;": "â",
  "&ucirc;": "û",
  "&ecirc;": "ê",
  "&ocirc;": "ô",
  "&Icirc;": "Î",
  "&Acirc;": "Â",
  "&Ucirc;": "Û",
  "&Ecirc;": "Ê",
  "&Ocirc;": "Ô",
  "&ccedil;": "ç",
  "&Ccedil;": "Ç",
  "&aelig;": "æ",
  "&AElig;": "Æ",
  "&eth;": "ð",
  "&mdash;": "—",
  "&ndash;": "–",
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

export function preprocessLeggeHtml(html) {
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

const ORDINAL_TO_POS = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  topmost: 6,
};

function isLineCommentary(text) {
  return (
    /^The (?:first|second|third|fourth|fifth|sixth) line is\b/i.test(text) ||
    /^Line \d+ (?:is|represents)\b/i.test(text) ||
    /^\d{3}:L\b/.test(text) ||
    /^'\w/.test(text)
  );
}

function isLineStatementBody(body) {
  return (
    /^(?:From the|In the|The|T he)\s+(?:first|second|third|fourth|fifth|topmost|sixth)/i.test(body) ||
    /^The (?:first|second|third|fourth|fifth|topmost|sixth)/i.test(body) ||
    /^\(To the subject of\)\s+the (?:first|second|third|fourth|fifth|topmost|sixth)/i.test(body)
  );
}

function isNumberedLine(text) {
  const m = text.match(/^(\d+|S|[IVXLCDM]+)\s*\.\s*(?:\.\s*)?([\s\S]+)$/i);
  if (!m) return false;
  return isLineStatementBody(m[2]);
}

/**
 * The "use of the number nine/six" supernumerary paragraph (hex 1/2 only) never
 * opens with an ordinal ("The first…"), so isNumberedLine() always rejects it.
 * Detect it directly by its fixed Legge phrasing instead of relying on the
 * "Explanation of the separate lines" heading, which is absent on some
 * per-hexagram pages (e.g. ic02.htm) even though the paragraph itself is present.
 */
function isSupernumeraryStatement(text) {
  return /^\(The lines of this hexagram are all (?:strong and undivided|weak and divided)/i.test(
    text,
  );
}

function ordinalFromLineBody(body) {
  let m = body.match(/^(?:From the|In the|The|T he)\s+(first|second|third|fourth|fifth|topmost|sixth)\b/i);
  if (m) return ORDINAL_TO_POS[m[1].toLowerCase()] ?? 0;
  m = body.match(/^\(To the subject of\)\s+the (first|second|third|fourth|fifth|topmost|sixth)\b/i);
  if (m) return ORDINAL_TO_POS[m[1].toLowerCase()] ?? 0;
  m = body.match(/^The (first|second|third|fourth|fifth|topmost|sixth)\b/i);
  if (m) return ORDINAL_TO_POS[m[1].toLowerCase()] ?? 0;
  return 0;
}

function parseUnprefixedLine(text) {
  const pos = ordinalFromLineBody(text);
  if (!pos) return null;
  return { pos, body: text.trim() };
}

function lineIndexFromNumber(raw) {
  if (/^S$/i.test(raw)) return 5;
  const roman = String(raw).trim().toUpperCase();
  const romanMap = new Map([
    ["I", 1],
    ["II", 2],
    ["III", 3],
    ["IV", 4],
    ["V", 5],
    ["VI", 6],
    ["VII", 7],
  ]);
  if (romanMap.has(roman)) return romanMap.get(roman);
  const n = parseInt(raw, 10);
  if (n >= 1 && n <= 6) return n;
  if (n === 7) return 7;
  return 0;
}

/** Thwan = first substantive paragraph after HEXAGRAM heading, before line 1. */
function findThwanJudgment(tokens) {
  const h3Idx = tokens.findIndex((t) => t.tag === "h3" && /HEXAGRAM/i.test(t.text));
  const start = h3Idx >= 0 ? h3Idx + 1 : 0;

  for (let i = start; i < tokens.length; i++) {
    const t = tokens[i];
    if (isNumberedLine(t.text)) break;
    if (/Explanation of the separate lines/i.test(t.text)) break;
    if (t.tag !== "p") continue;
    if (/^page_\d+/i.test(t.text)) continue;
    if (/^Explanation of the entire figure/i.test(t.text)) continue;
    if (isLineCommentary(t.text)) continue;
    if (isLineStatementBody(t.text)) continue;
    if (t.text.length < 20) continue;
    if (/^The character giving its name/i.test(t.text)) continue;
    if (/^The I Ching, Legge tr/i.test(t.text)) continue;
    return t.text.replace(/\s+/g, " ").trim();
  }
  return "";
}

function normalizeLineParagraphText(text) {
  return String(text)
    .replace(/^(\d+)\.\s*(?:\r?\n+\s*)?\1\.\s*/, "$1. ")
    .trim();
}

function parseLineEntries(tokens) {
  const lineByPos = {};
  let supernumerary = "";
  let sawLinesSection = false;

  for (const t of tokens) {
    if (/Explanation of the separate lines by the duke/i.test(t.text)) {
      sawLinesSection = true;
    }

    if (t.tag !== "p") continue;
    const lineText = normalizeLineParagraphText(t.text);
    if (lineText.startsWith("Footnotes") || /^page_\d+/i.test(lineText)) continue;

    const numbered = lineText.match(/^(\d+|S|[IVXLCDM]+)\s*\.\s*(?:\.\s*)?([\s\S]+)$/i);
    if (numbered && !supernumerary && isSupernumeraryStatement(numbered[2])) {
      supernumerary = numbered[2].trim();
      continue;
    }
    if (numbered && isNumberedLine(lineText)) {
      const idx = lineIndexFromNumber(numbered[1]);
      const body = numbered[2].trim();
      if (idx >= 1 && idx <= 6) lineByPos[idx] = body;
      else if (idx === 7) supernumerary = body;
      continue;
    }

    const unprefixed = parseUnprefixedLine(lineText);
    if (unprefixed && !lineByPos[unprefixed.pos]) {
      lineByPos[unprefixed.pos] = unprefixed.body;
      continue;
    }

    if (sawLinesSection && numbered) {
      const idx = lineIndexFromNumber(numbered[1]);
      const body = numbered[2].trim();
      if (idx >= 1 && idx <= 6 && !lineByPos[idx]) lineByPos[idx] = body;
      else if (idx === 7 && !supernumerary) supernumerary = body;
    }
  }

  return { lineByPos, supernumerary };
}

/** @deprecated Kept for tests; Thwan detection no longer relies on this alone. */
export function looksLikeLeggeJudgment(text) {
  if (text.length < 40) return false;
  if (isLineCommentary(text)) return false;
  return (
    /\((?:represents|indicates|suggests)\b/i.test(text) ||
    /\b(?:represents|indicates how|indicates|intimates)\b/i.test(text) ||
    /\bshows\b/i.test(text) ||
    /\bthere will be good fortune\b/i.test(text)
  );
}

/**
 * Parse sacred-texts.com icNN.htm (TEXT section I).
 * @param {string} html
 */
export function parseLeggeTextPage(html) {
  const tokens = tokenize(preprocessLeggeHtml(html));
  let judgment = "";
  let sawKingWen = false;
  const { lineByPos, supernumerary } = parseLineEntries(tokens);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (/Explanation of the entire figure by king W/i.test(t.text)) {
      sawKingWen = true;
      continue;
    }
    if (sawKingWen && !judgment && t.tag === "p") {
      judgment = t.text.replace(/\s+/g, " ").trim();
      sawKingWen = false;
      break;
    }
  }

  if (!judgment) judgment = findThwanJudgment(tokens);

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
    /<FONT SIZE="1">([IVXLCDM]+)<\/FONT><\/A>\.?\s*([\s\S]*?)<\/P>/gi;
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
