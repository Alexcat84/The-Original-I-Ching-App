/**
 * Parse James Legge 64-hex TXT (SBE XVI user export).
 * Structure: roman header → *** → Thwan + lines → *** → Footnotes.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  cleanLeggeTxtText,
  cleanLeggeTxtFootnotes,
  LEGGE_64HEX_TXT_PATH,
  LEGGE_TXT_SEPARATOR_RE,
  leggeBookTitleToChineseRoman,
} from "./legge-txt-clean.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {RegExp} */
export const LEGGE_HEX_HEADER_RE =
  /^([IVXLCDM]+)\.\s+THE\s+(.+?)\s+HEXAGRAM\.?\s*$/i;

/** @type {RegExp} */
const LEGGE_LINE_RE = /^(\d+|[IVX]+)\s*\.\s*(.*)$/i;

/**
 * @param {string} token
 */
function parseLeggeLineNumber(token) {
  if (/^\d+$/.test(token)) return Number(token);
  return parseRomanNumeral(token);
}

/**
 * @param {string} text
 * @param {number} num
 */
function normalizeLeggeLineText(text, num) {
  let t = String(text ?? "").trim();
  const dup = new RegExp(`^(?:${num}\\.\\s*)+`, "i");
  t = t.replace(dup, "");
  t = t.replace(/^\.\s+/, "");
  return t.trim();
}

/** @type {RegExp} */
const LEGGE_THWAN_INTRO_RE =
  /^\(Explanation of the entire figure by king W[ăa]n\.\)$/i;

/** @type {RegExp} */
const LEGGE_LINES_INTRO_RE =
  /^\(Explanation of the separate lines by the duke of K[âa]u\.\)$/i;

/**
 * @param {string} s
 */
export function normalizeLeggeTxtText(s) {
  return cleanLeggeTxtText(String(s ?? ""));
}

/**
 * @param {string} roman
 */
export function parseRomanNumeral(roman) {
  const s = String(roman ?? "").toUpperCase();
  /** @type {Record<string, number>} */
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  let prev = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const val = map[s[i]];
    if (!val) throw new Error(`Invalid roman numeral: ${roman}`);
    total += val < prev ? -val : val;
    prev = val;
  }
  return total;
}

/**
 * Split block after header into oracle + footnotes using *** delimiters.
 * @param {string} body
 */
export function splitOracleAndFootnotes(body) {
  const lines = body.split("\n");
  /** @type {string[]} */
  const oracleLines = [];
  /** @type {string[]} */
  const footnoteLines = [];
  let section = "pre";
  for (const raw of lines) {
    const t = raw.trim();
    if (LEGGE_TXT_SEPARATOR_RE.test(t)) {
      if (section === "pre") section = "oracle";
      else if (section === "oracle") section = "footnotes";
      continue;
    }
    // Hex 21 (and rare exports) omit the second *** before Footnotes.
    if (section === "oracle" && /^Footnotes$/i.test(t)) {
      section = "footnotes";
      continue;
    }
    if (section === "oracle") oracleLines.push(raw);
    else if (section === "footnotes") footnoteLines.push(raw);
  }
  return { oracleLines, footnoteLines };
}

/**
 * @param {string[]} oracleLines
 */
export function parseLeggeOracleSection(oracleLines) {
  const nonEmpty = oracleLines.map((l) => l.trim()).filter(Boolean);

  let thwanIntro = "";
  let linesIntro = "";
  let thwan = "";
  /** @type {Record<number, string>} */
  const lines = {};
  let yong = "";

  for (const line of nonEmpty) {
    const m = line.match(LEGGE_LINE_RE);
    if (m) {
      const num = parseLeggeLineNumber(m[1]);
      const text = normalizeLeggeLineText(m[2], num);
      if (num >= 1 && num <= 6) lines[num] = text;
      else if (num === 7) yong = text;
      continue;
    }
    if (LEGGE_THWAN_INTRO_RE.test(line)) {
      thwanIntro = line;
      continue;
    }
    if (LEGGE_LINES_INTRO_RE.test(line)) {
      linesIntro = line;
      continue;
    }
    if (!lines[1] && !Object.keys(lines).length) {
      thwan = thwan ? `${thwan}\n${line}` : line;
    }
  }

  return { thwanIntro, thwan, linesIntro, lines, yong };
}

/**
 * @param {string[]} footnoteLines
 */
export function parseLeggeFootnotes(footnoteLines) {
  const trimmed = footnoteLines.map((l) => l.trim());
  const start = trimmed.findIndex((l) => l && !/^Footnotes$/i.test(l));
  if (start < 0) return "";
  return cleanLeggeTxtFootnotes(trimmed.slice(start).join("\n"));
}

/**
 * @param {string} [filePath]
 */
export function findLegge64HexStarts(filePath = LEGGE_64HEX_TXT_PATH) {
  const raw = readFileSync(filePath, "utf8");
  const text = cleanLeggeTxtText(raw);
  const lines = text.split("\n");
  /** @type {Array<{ n: number; roman: string; title: string; lineIndex: number }>} */
  const starts = [];

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].trim().match(LEGGE_HEX_HEADER_RE);
    if (!m) continue;
    const n = parseRomanNumeral(m[1]);
    starts.push({
      n,
      roman: m[1],
      title: m[2].trim(),
      lineIndex: i,
    });
  }
  return { lines, starts, rawLineCount: lines.length };
}

/**
 * @param {string} [filePath]
 */
export function parseLegge64HexTxt(filePath = LEGGE_64HEX_TXT_PATH) {
  const { lines, starts } = findLegge64HexStarts(filePath);
  if (starts.length !== 64) {
    throw new Error(`Expected 64 hex headers, found ${starts.length}`);
  }

  /** @type {Record<number, { roman: string; bookTitle: string; lineStart: number; lineEnd: number; fields: Record<string, string> }>} */
  const hexagrams = {};

  for (let s = 0; s < 64; s++) {
    const { n, roman, title, lineIndex } = starts[s];
    if (n !== s + 1) {
      throw new Error(`Hex order gap: expected ${s + 1} at index ${s}, got ${n}`);
    }
    const endLine = s + 1 < starts.length ? starts[s + 1].lineIndex : lines.length;
    const blockLines = lines.slice(lineIndex + 1, endLine);
    const body = blockLines.join("\n");
    const { oracleLines, footnoteLines } = splitOracleAndFootnotes(body);
    const oracle = parseLeggeOracleSection(oracleLines);
    const footnotes = parseLeggeFootnotes(footnoteLines);

    hexagrams[n] = {
      roman,
      bookTitle: title,
      lineStart: lineIndex + 1,
      lineEnd: endLine,
      fields: {
        hex: String(n),
        nombre: title,
        thwan_intro: normalizeLeggeTxtText(oracle.thwanIntro),
        thwan: normalizeLeggeTxtText(oracle.thwan),
        lines_intro: normalizeLeggeTxtText(oracle.linesIntro),
        L1: normalizeLeggeTxtText(oracle.lines[1] ?? ""),
        L2: normalizeLeggeTxtText(oracle.lines[2] ?? ""),
        L3: normalizeLeggeTxtText(oracle.lines[3] ?? ""),
        L4: normalizeLeggeTxtText(oracle.lines[4] ?? ""),
        L5: normalizeLeggeTxtText(oracle.lines[5] ?? ""),
        L6: normalizeLeggeTxtText(oracle.lines[6] ?? ""),
        yong: normalizeLeggeTxtText(oracle.yong),
        footnotes,
      },
    };
  }

  return { hexagrams, starts, source: filePath };
}

export async function loadZhouyiHanziMap() {
  const mod = await import(
    pathToFileURL(join(ROOT, "scripts/iching_zhouyi_translation.mjs")).href
  );
  return mod.default;
}

/**
 * Canonical hex meta shared across translators (hanzi + Unicode hexagram glyph).
 * @param {number} hexNumber
 * @param {Awaited<ReturnType<typeof loadZhouyiHanziMap>>} zhouyi
 * @param {string} bookTitle
 */
export function enrichLeggeHexMeta(hexNumber, zhouyi, bookTitle) {
  const z = zhouyi[String(hexNumber)];
  if (!z) throw new Error(`Missing zhouyi row for hex ${hexNumber}`);
  return {
    bookHanzi: String(z.name ?? ""),
    chinese: String(z.name ?? ""),
    hex_font: String(z.hex_font ?? ""),
    chinese_roman: leggeBookTitleToChineseRoman(bookTitle),
  };
}

/**
 * @param {Record<string, string>} fields
 * @param {number} hexNumber
 */
export function txtFieldsToLeggeOracleGold(fields, hexNumber) {
  return {
    judgment: fields.thwan ?? "",
    lines: {
      1: fields.L1 ?? "",
      2: fields.L2 ?? "",
      3: fields.L3 ?? "",
      4: fields.L4 ?? "",
      5: fields.L5 ?? "",
      6: fields.L6 ?? "",
    },
    yongJiu: hexNumber === 1 ? fields.yong ?? "" : "",
    yongLiu: hexNumber === 2 ? fields.yong ?? "" : "",
  };
}

/**
 * @param {Awaited<ReturnType<typeof parseLegge64HexTxtFull>>} parsed
 */
export function validateLegge64HexMeta(parsed) {
  /** @type {string[]} */
  const errors = [];
  for (let n = 1; n <= 64; n++) {
    const h = parsed.hexagrams[n];
    if (!h) continue;
    const f = h.fields;
    if (f.nombre !== h.bookTitle) {
      errors.push(`hex ${n}: nombre "${f.nombre}" != bookTitle "${h.bookTitle}"`);
    }
    const expectedRoman = leggeBookTitleToChineseRoman(h.bookTitle);
    if (f.chinese_roman !== expectedRoman) {
      errors.push(
        `hex ${n}: chinese_roman "${f.chinese_roman}" != expected "${expectedRoman}"`,
      );
    }
    if (f.chinese !== h.bookHanzi) {
      errors.push(`hex ${n}: chinese "${f.chinese}" != bookHanzi "${h.bookHanzi}"`);
    }
    if (!f.hex_font?.trim()) errors.push(`hex ${n}: empty hex_font`);
  }
  return { ok: errors.length === 0, errors };
}

/**
 * @param {Awaited<ReturnType<typeof parseLegge64HexTxtFull>>} parsed
 */
export function validateLegge64HexStructure(parsed) {
  /** @type {string[]} */
  const errors = [];
  for (let n = 1; n <= 64; n++) {
    const h = parsed.hexagrams[n];
    if (!h) {
      errors.push(`missing hex ${n}`);
      continue;
    }
    const f = h.fields;
    if (!f.thwan?.trim()) errors.push(`hex ${n}: empty thwan`);
    for (let p = 1; p <= 6; p++) {
      if (!f[`L${p}`]?.trim()) errors.push(`hex ${n}: empty L${p}`);
    }
    if ((n === 1 || n === 2) && !f.yong?.trim()) {
      errors.push(`hex ${n}: empty yong`);
    }
    if (n >= 3 && f.yong?.trim()) {
      errors.push(`hex ${n}: unexpected yong`);
    }
  }
  return { ok: errors.length === 0, errors };
}

/**
 * @param {string} [filePath]
 */
export async function parseLegge64HexTxtFull(filePath = LEGGE_64HEX_TXT_PATH) {
  const parsed = parseLegge64HexTxt(filePath);
  const zhouyi = await loadZhouyiHanziMap();

  for (let n = 1; n <= 64; n++) {
    const bookTitle = parsed.hexagrams[n].bookTitle;
    const meta = enrichLeggeHexMeta(n, zhouyi, bookTitle);
    parsed.hexagrams[n].bookHanzi = meta.bookHanzi;
    parsed.hexagrams[n].fields.chinese = meta.chinese;
    parsed.hexagrams[n].fields.chinese_roman = meta.chinese_roman;
    parsed.hexagrams[n].fields.hex_font = meta.hex_font;
  }

  return {
    ...parsed,
    parsedAt: new Date().toISOString(),
  };
}
