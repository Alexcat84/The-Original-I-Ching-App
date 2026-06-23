/**
 * Parse Wilhelm Book I (64 hex) from cleaned Princeton TXT export.
 * Zone 1 only — stops before appendices / Wen Yen duplicate block.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { linePosFromLabel } from "./hexagram-fidelity-wilhelm-epub.mjs";
import { stripWilhelmTxtFootnotes, stripWilhelmTxtFootnoteLine } from "./wilhelm-64hex-txt-footnotes.mjs";
import {
  formatWilhelmTrigram,
  WILHELM_MANUAL_FIELDS,
} from "./wilhelm-manual-fields.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const WILHELM_64HEX_TXT_PATH = join(
  ROOT,
  "tools/source-pdfs/I Ching or Book of Changes (Bollingen Series), The - Wilhelm, Hellmut-64hex.txt",
);

export const WILHELM_64HEX_ZONE_END_MARKER =
  /The Book of Changes is a book of the future/i;

const HEX_HEADER_RE = /^(\d{1,2})\.\s+(.+?)\s+\/\s+(.+)$/;
const SECTION_RE = /^THE (JUDGMENT|IMAGE|LINES)\d*\s*$/i;
const LINE_LABEL_RE =
  /^(Nine|Six) (?:at the beginning|in the second place|in the third place|in the fourth place|in the fifth place|at the top)\d* means:\s*$/i;
const YONG_LABEL_RE = /^When all the lines are (nines|sixes), it means:\s*$/i;

/**
 * @param {string} s
 */
export function normalizeWilhelmTxtText(s) {
  return stripWilhelmTxtFootnotes(
    String(s ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/\u2019/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/\u2014/g, "—")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim(),
  );
}

/** First prose paragraph in Wilhelm TXT sections is typically >= ~120 chars. */
const COMMENTARY_GROUP_MIN = 120;
/** Blank lines before a paragraph group; wide gap = commentary boundary. */
const COMMENTARY_GAP_MIN = 5;

/**
 * @param {string[]} lines
 * @returns {Array<{ lines: string[]; blankBefore: number }>}
 */
function paragraphGroups(lines) {
  /** @type {Array<{ lines: string[]; blankBefore: number }>} */
  const groups = [];
  /** @type {string[]} */
  let current = [];
  let blankRun = 0;
  let blankBefore = 0;

  for (const raw of lines) {
    const t = stripWilhelmTxtFootnoteLine(raw).trim();
    if (!t) {
      blankRun++;
      if (current.length) {
        groups.push({ lines: current, blankBefore });
        current = [];
        blankBefore = 0;
      }
    } else {
      if (current.length === 0) blankBefore = blankRun;
      blankRun = 0;
      current.push(t);
    }
  }
  if (current.length) groups.push({ lines: current, blankBefore });
  return groups;
}

/**
 * @param {Array<{ lines: string[]; blankBefore: number }>} groups
 */
function splitOracleCommentaryGroups(groups) {
  /** @type {Array<{ lines: string[]; blankBefore: number }>} */
  const oracleGroups = [];
  /** @type {Array<{ lines: string[]; blankBefore: number }>} */
  const commentaryGroups = [];
  let phase = "oracle";

  for (const group of groups) {
    const text = group.lines.join("\n");
    if (phase === "oracle") {
      const wideGap = group.blankBefore >= COMMENTARY_GAP_MIN;
      const commentaryStart =
        oracleGroups.length > 0 &&
        (text.length >= COMMENTARY_GROUP_MIN ||
          (wideGap && group.lines.length === 1 && text.length >= 80));
      if (commentaryStart) {
        phase = "commentary";
        commentaryGroups.push(group);
      } else {
        oracleGroups.push(group);
      }
    } else {
      commentaryGroups.push(group);
    }
  }

  return {
    oracle: normalizeWilhelmTxtText(
      oracleGroups.map((g) => g.lines.join("\n")).join("\n"),
    ),
    commentary: normalizeWilhelmTxtText(
      commentaryGroups.map((g) => g.lines.join("\n")).join("\n"),
    ),
  };
}

/**
 * @param {string[]} lines
 */
function splitOracleCommentary(lines) {
  return splitOracleCommentaryGroups(paragraphGroups(lines));
}

/**
 * @param {string[]} lines
 * @param {number} start
 */
function sliceUntilNextLabel(lines, start) {
  /** @type {string[]} */
  const chunk = [];
  let i = start;
  while (i < lines.length) {
    const cleaned = stripWilhelmTxtFootnoteLine(lines[i]).trim();
    if (LINE_LABEL_RE.test(cleaned) || YONG_LABEL_RE.test(cleaned)) break;
    if (/^NOTE\.\s/i.test(cleaned)) break;
    chunk.push(lines[i]);
    i++;
  }
  return { chunk, nextIndex: i };
}

/**
 * @param {string[]} lines
 */
function parseLinesSection(lines) {
  /** @type {Record<number, { label: string; oracle: string; commentary: string }>} */
  const out = {};
  /** @type {{ label: string; oracle: string; commentary: string } | null} */
  let yong = null;

  let i = 0;
  while (i < lines.length) {
    const cleaned = stripWilhelmTxtFootnoteLine(lines[i]).trim();
    if (!cleaned) {
      i++;
      continue;
    }

    if (YONG_LABEL_RE.test(cleaned)) {
      const { chunk, nextIndex } = sliceUntilNextLabel(lines, i + 1);
      const split = splitOracleCommentary(chunk);
      yong = { label: normalizeWilhelmTxtText(cleaned), ...split };
      i = nextIndex;
      continue;
    }

    if (LINE_LABEL_RE.test(cleaned)) {
      const pos = linePosFromLabel(cleaned);
      const { chunk, nextIndex } = sliceUntilNextLabel(lines, i + 1);
      const split = splitOracleCommentary(chunk);
      if (typeof pos === "number" && pos >= 1 && pos <= 6) {
        out[pos] = {
          label: normalizeWilhelmTxtText(cleaned),
          ...split,
        };
      }
      i = nextIndex;
      continue;
    }

    i++;
  }

  return { lines: out, yong };
}

/**
 * @param {string[]} lines
 * @param {"JUDGMENT"|"IMAGE"|"LINES"} name
 */
function findSectionLine(lines, name) {
  const re = new RegExp(`^THE ${name}\\d*\\s*$`, "i");
  return lines.findIndex((l) => re.test(stripWilhelmTxtFootnoteLine(l).trim()));
}

/**
 * @param {string[]} lines
 * @param {number} start
 * @param {number} end
 */
function sectionBodyLines(lines, start, end) {
  return lines.slice(start + 1, end);
}

/**
 * @param {number} n
 * @param {string[]} lines
 * @param {Record<string, unknown>} injectorRow
 * @param {{ chinese: string; title: string }} bookMeta
 */
function parseHexBlock(n, lines, injectorRow, bookMeta) {
  const jIdx = findSectionLine(lines, "JUDGMENT");
  const iIdx = findSectionLine(lines, "IMAGE");
  const lIdx = findSectionLine(lines, "LINES");
  if (jIdx < 0 || iIdx < 0 || lIdx < 0) {
    throw new Error(`hex ${n}: missing section header (J=${jIdx} I=${iIdx} L=${lIdx})`);
  }

  const introLines = sectionBodyLines(lines, 0, jIdx);
  const introGroups = paragraphGroups(introLines);

  const judgmentBody = sectionBodyLines(lines, jIdx, iIdx);
  const imageBody = sectionBodyLines(lines, iIdx, lIdx);
  const linesBody = lines.slice(lIdx + 1);

  const judgment = splitOracleCommentary(judgmentBody);
  const image = splitOracleCommentary(imageBody);
  const { lines: parsedLines, yong } = parseLinesSection(linesBody);

  /** @type {Record<string, string>} */
  const fields = {
    hex: String(n),
    nombre: bookMeta.title,
    chinese: String(injectorRow.trad_chinese ?? ""),
    chinese_roman: bookMeta.chinese,
    hex_font: String(injectorRow.hex_font ?? ""),
    trigrama_arriba: formatWilhelmTrigram(injectorRow.wilhelm_above, "above"),
    trigrama_abajo: formatWilhelmTrigram(injectorRow.wilhelm_below, "below"),
    intro: normalizeWilhelmTxtText(
      introGroups.map((g) => g.lines.join("\n")).join("\n"),
    ),
    judgment_oraculo: judgment.oracle,
    judgment_comentario: judgment.commentary,
    image_oraculo: image.oracle,
    image_comentario: image.commentary,
  };

  for (let p = 1; p <= 6; p++) {
    const L = parsedLines[p];
    fields[`L${p}_etiqueta`] = L?.label ?? "";
    fields[`L${p}_oraculo`] = L?.oracle ?? "";
    fields[`L${p}_comentario`] = L?.commentary ?? "";
  }

  fields.yong_etiqueta = yong?.label ?? "";
  fields.yong_oraculo = yong?.oracle ?? "";
  fields.yong_comentario = yong?.commentary ?? "";

  return fields;
}

/**
 * @param {string} [rawText]
 */
export function sliceWilhelm64HexZone(rawText) {
  const lines = String(rawText ?? "").replace(/\r\n/g, "\n").split("\n");
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (WILHELM_64HEX_ZONE_END_MARKER.test(lines[i])) {
      end = i + 1;
      break;
    }
  }
  return lines.slice(0, end);
}

/**
 * @param {string} [rawText]
 */
export function findWilhelm64HexStarts(rawText) {
  const zone = sliceWilhelm64HexZone(rawText);
  /** @type {Array<{ n: number; lineIndex: number; chinese: string; title: string }>} */
  const starts = [];
  for (let i = 0; i < zone.length; i++) {
    const m = zone[i].match(HEX_HEADER_RE);
    if (!m) continue;
    const n = Number(m[1]);
    if (n < 1 || n > 64) continue;
    starts.push({ n, lineIndex: i, chinese: m[2].trim(), title: m[3].trim() });
  }
  return { zone, starts };
}

/**
 * @param {string} [filePath]
 */
export async function loadWilhelmInjectorMap() {
  const mod = await import(
    pathToFileURL(join(ROOT, "scripts/iching_wilhelm_translation.mjs")).href
  );
  return mod.default;
}

/**
 * @param {string} [filePath]
 */
export function parseWilhelm64HexTxt(filePath = WILHELM_64HEX_TXT_PATH) {
  const raw = readFileSync(filePath, "utf8");
  const { zone, starts } = findWilhelm64HexStarts(raw);
  if (starts.length < 64) {
    throw new Error(`Expected 64 hex headers in zone 1, found ${starts.length}`);
  }

  /** @type {Record<number, { lineStart: number; lineEnd: number; bookChinese: string; bookTitle: string; fields: Record<string, string> }>} */
  const hexagrams = {};

  for (let s = 0; s < 64; s++) {
    const { n, lineIndex, chinese, title } = starts[s];
    if (n !== s + 1) {
      throw new Error(`Hex order gap: expected ${s + 1} at index ${s}, got ${n}`);
    }
    const endLine = s + 1 < starts.length ? starts[s + 1].lineIndex : zone.length;
    hexagrams[n] = {
      lineStart: lineIndex + 1,
      lineEnd: endLine,
      bookChinese: chinese,
      bookTitle: title,
      fields: {},
    };
  }

  return { zone, starts, hexagrams, zoneLineCount: zone.length };
}

/**
 * @param {string} [filePath]
 */
export async function parseWilhelm64HexTxtFull(filePath = WILHELM_64HEX_TXT_PATH) {
  const parsed = parseWilhelm64HexTxt(filePath);
  const injector = await loadWilhelmInjectorMap();
  const { zone, starts } = parsed;

  for (let s = 0; s < 64; s++) {
    const { n, lineIndex, chinese, title } = starts[s];
    const endLine = s + 1 < starts.length ? starts[s + 1].lineIndex : zone.length;
    const block = zone.slice(lineIndex, endLine);
    const row = injector[String(n)];
    if (!row) throw new Error(`Missing injector row for hex ${n}`);
    parsed.hexagrams[n].bookHanzi = String(row.trad_chinese ?? "");
    parsed.hexagrams[n].bookHexFont = String(row.hex_font ?? "");
    parsed.hexagrams[n].fields = parseHexBlock(n, block, row, {
      chinese,
      title,
    });
  }

  return parsed;
}

/**
 * G0 structural validation.
 * @param {Awaited<ReturnType<typeof parseWilhelm64HexTxtFull>>} parsed
 */
export function validateWilhelm64HexStructure(parsed) {
  /** @type {string[]} */
  const errors = [];
  /** @type {string[]} */
  const warnings = [];

  for (let n = 1; n <= 64; n++) {
    const h = parsed.hexagrams[n];
    if (!h) {
      errors.push(`hex ${n}: missing`);
      continue;
    }
    const f = h.fields;
    if (f.nombre !== h.bookTitle) {
      errors.push(
        `hex ${n}: nombre "${f.nombre}" != bookTitle "${h.bookTitle}"`,
      );
    }
    if (f.chinese !== h.bookHanzi) {
      errors.push(
        `hex ${n}: chinese "${f.chinese}" != bookHanzi "${h.bookHanzi}"`,
      );
    }
    if (f.chinese_roman !== h.bookChinese) {
      errors.push(
        `hex ${n}: chinese_roman "${f.chinese_roman}" != bookChinese "${h.bookChinese}"`,
      );
    }
    if (f.hex_font !== h.bookHexFont) {
      errors.push(
        `hex ${n}: hex_font "${f.hex_font}" != bookHexFont "${h.bookHexFont}"`,
      );
    }
    if (!f.intro) errors.push(`hex ${n}: empty intro`);
    if (!f.judgment_oraculo) errors.push(`hex ${n}: empty judgment_oraculo`);
    if (!f.image_oraculo) errors.push(`hex ${n}: empty image_oraculo`);

    for (let p = 1; p <= 6; p++) {
      if (!f[`L${p}_etiqueta`]) errors.push(`hex ${n}: missing L${p}_etiqueta`);
      if (!f[`L${p}_oraculo`]) errors.push(`hex ${n}: missing L${p}_oraculo`);
    }

    if (n === 1 || n === 2) {
      if (!f.yong_oraculo) errors.push(`hex ${n}: missing yong_oraculo`);
      if (!f.yong_etiqueta) errors.push(`hex ${n}: missing yong_etiqueta`);
    } else if (f.yong_oraculo || f.yong_etiqueta || f.yong_comentario) {
      warnings.push(`hex ${n}: unexpected yong fields`);
    }
  }

  return {
    pass: errors.length === 0,
    errors,
    warnings,
    fieldCount: WILHELM_MANUAL_FIELDS.length,
  };
}

/**
 * @param {Record<string, string>} fields
 */
export function txtFieldsToOracleGold(fields, hexNumber) {
  /** @type {{ judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }} */
  const gold = {
    judgment: fields.judgment_oraculo ?? "",
    image: fields.image_oraculo ?? "",
    lines: {},
  };
  for (let p = 1; p <= 6; p++) {
    gold.lines[p] = fields[`L${p}_oraculo`] ?? "";
  }
  if (hexNumber === 1 && fields.yong_oraculo) gold.yongJiu = fields.yong_oraculo;
  if (hexNumber === 2 && fields.yong_oraculo) gold.yongLiu = fields.yong_oraculo;
  return gold;
}
