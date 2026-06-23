/**
 * Parse Wilhelm classical commentaries (Ten Wings layer) from cleaned TXT.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { stripWilhelmTxtFootnoteLine } from "./wilhelm-64hex-txt-footnotes.mjs";
import {
  formatWilhelmTrigram,
} from "./wilhelm-manual-fields.mjs";
import {
  cleanWilhelmTxtText,
  WILHELM_64HEX_COMMENTS_TXT_PATH,
} from "./wilhelm-txt-clean.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export { WILHELM_64HEX_COMMENTS_TXT_PATH };

const HEX_HEADER_RE = /^(\d{1,2})\.\s+(.+?)\s+\/\s+(.+)$/;

const MARKERS = {
  sequence: /^The Sequence(?: of the Hexagrams)?\d*\s*$/i,
  misc: /^Miscellaneous Notes(?: on the Hexagrams)?\d*\s*$/i,
  judgment: /^THE JUDGMENT\d*\s*$/i,
  commentaryDecision: /^Commentary on the Decision\d*\s*$/i,
  commentaryImages: /^Commentary on the Images\d*\s*$/i,
  image: /^THE IMAGE\d*\s*$/i,
  lines: /^THE LINES\d*\s*$/i,
  wenYen: /^Commentary on the Words of the Text\d*\s*$/i,
};

const COMMENT_LINE_LABEL_RE =
  /^(Nine|Six) (?:at the beginning|in the second place|in the third place|in the fourth place|in the fifth place|at the top):\s*$/i;
const COMMENT_YONG_LABEL_RE = /^When all the lines are (nines|sixes):\s*$/i;
const AB_LINE_RE = /^([abcd])\)\s*(.*)$/i;

/** @param {string} s */
export function normalizeWilhelmCommentsTxtText(s) {
  return cleanWilhelmTxtText(s);
}

/**
 * @param {string} line
 */
function cleanLine(line) {
  return stripWilhelmTxtFootnoteLine(line).trim();
}

/**
 * @param {string[]} lines
 * @returns {Array<{ lines: string[] }>}
 */
function paragraphGroups(lines) {
  /** @type {Array<{ lines: string[] }>} */
  const groups = [];
  /** @type {string[]} */
  let current = [];
  for (const raw of lines) {
    const t = cleanLine(raw);
    if (!t) {
      if (current.length) {
        groups.push({ lines: current });
        current = [];
      }
    } else if (/^NOTE\.\s/i.test(t)) {
      if (current.length) {
        groups.push({ lines: current });
        current = [];
      }
    } else {
      current.push(t);
    }
  }
  if (current.length) groups.push({ lines: current });
  return groups;
}

/**
 * @param {string[]} lines
 */
function linesToText(lines) {
  return normalizeWilhelmCommentsTxtText(
    paragraphGroups(lines)
      .map((g) => g.lines.join("\n"))
      .join("\n"),
  );
}

/**
 * @param {string[]} lines
 * @param {RegExp} re
 */
function findMarker(lines, re) {
  return lines.findIndex((l) => re.test(cleanLine(l)));
}

/**
 * @param {string[]} lines
 * @param {number} start
 * @param {number} end
 */
function sliceLines(lines, start, end) {
  return lines.slice(start, end >= 0 ? end : undefined);
}

/** Prose Da Xiang often opens with "<Trigram> means …" (hex 58 and similar). */
const IMAGE_COMMENTARY_FALLBACK_RE =
  /^[A-Z][A-Za-z'()]+\s+means\b|^The repetition of\b/;

/**
 * @param {string[]} lines
 */
function splitImageSection(lines) {
  let split = splitOracleCommentarySimple(lines);
  if (!split.commentary.trim()) {
    const groups = paragraphGroups(lines);
    for (let i = 1; i < groups.length; i++) {
      const text = groups[i].lines.join("\n");
      if (IMAGE_COMMENTARY_FALLBACK_RE.test(text)) {
        split = {
          oracle: normalizeWilhelmCommentsTxtText(
            groups
              .slice(0, i)
              .map((g) => g.lines.join("\n"))
              .join("\n"),
          ),
          commentary: normalizeWilhelmCommentsTxtText(
            groups
              .slice(i)
              .map((g) => g.lines.join("\n"))
              .join("\n"),
          ),
        };
        break;
      }
    }
  }
  return {
    image_oraculo: split.oracle,
    commentary_image: split.commentary,
  };
}

/**
 * @param {string[]} lines
 */
function splitWenYenSection(lines) {
  /** @type {string[]} */
  const noteLines = [];
  /** @type {string[]} */
  const bodyLines = [];
  let capturingNote = false;

  for (const raw of lines) {
    const t = cleanLine(raw);
    if (!t) continue;
    if (/^NOTE\.\s/i.test(t)) {
      capturingNote = true;
      noteLines.push(t);
      continue;
    }
    if (capturingNote) {
      if (
        /^On the Hexagram as a Whole$/i.test(t) ||
        /^On the Lines$/i.test(t) ||
        /^a\)\s*\d+\./i.test(t)
      ) {
        capturingNote = false;
        bodyLines.push(t);
      } else {
        noteLines.push(t);
      }
      continue;
    }
    bodyLines.push(t);
  }

  return {
    wen_yen_note: normalizeWilhelmCommentsTxtText(noteLines.join("\n")),
    wen_yen: linesToText(bodyLines),
  };
}

const ORACLE_GROUP_MAX = 8;

/**
 * @param {string[]} lines
 */
function splitOracleCommentarySimple(lines) {
  const groups = paragraphGroups(lines);
  if (groups.length === 0) return { oracle: "", commentary: "" };
  /** @type {string[]} */
  const oracleParts = [];
  let i = 0;
  for (; i < groups.length; i++) {
    const g = groups[i];
    const text = g.lines.join("\n");
    const looksLikeOracle =
      oracleParts.length < ORACLE_GROUP_MAX &&
      (text.length < 120 || g.lines.length > 1) &&
      (i === 0 || text.length < 200);
    if (i > 0 && text.length >= 120 && g.lines.length === 1) break;
    if (i > 0 && oracleParts.length >= 1 && text.length >= 80 && !looksLikeOracle) break;
    oracleParts.push(text);
    if (oracleParts.length >= 3 && i + 1 < groups.length) {
      const nextLen = groups[i + 1].lines.join("\n").length;
      if (nextLen >= 120) break;
    }
  }
  const oracle = normalizeWilhelmCommentsTxtText(oracleParts.join("\n"));
  const commentary = normalizeWilhelmCommentsTxtText(
    groups
      .slice(i)
      .map((g) => g.lines.join("\n"))
      .join("\n"),
  );
  return { oracle, commentary };
}

/**
 * @param {string[]} lines
 */
function parseCommentLinesSection(lines) {
  /** @type {Record<number, { label: string; a: string; b: string }>} */
  const out = {};
  /** @type {{ label: string; a: string; b: string } | null} */
  let yong = null;

  /** @type {"label"|"a"|"b"|null} */
  let phase = null;
  /** @type {number | "yong" | null} */
  let currentKey = null;
  /** @type {string[]} */
  let buffer = [];

  /**
   * @param {number | "yong"} key
   * @param {"a"|"b"} part
   * @param {string} text
   */
  function assign(key, part, text) {
    const val = normalizeWilhelmCommentsTxtText(text);
    if (key === "yong") {
      if (!yong) yong = { label: "", a: "", b: "" };
      if (part === "a") yong.a = val;
      else yong.b = val;
      return;
    }
    if (!out[key]) out[key] = { label: "", a: "", b: "" };
    if (part === "a") out[key].a = val;
    else out[key].b = val;
  }

  function flushBuffer() {
    if (!currentKey || !phase || phase === "label" || buffer.length === 0) {
      buffer = [];
      return;
    }
    assign(currentKey, phase, buffer.join("\n"));
    buffer = [];
  }

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line) continue;

    if (COMMENT_LINE_LABEL_RE.test(line)) {
      flushBuffer();
      const pos = linePosFromCommentLabel(line);
      if (typeof pos === "number") {
        currentKey = pos;
        if (!out[pos]) out[pos] = { label: "", a: "", b: "" };
        out[pos].label = normalizeWilhelmCommentsTxtText(line);
        phase = "label";
      }
      continue;
    }

    if (COMMENT_YONG_LABEL_RE.test(line)) {
      flushBuffer();
      currentKey = "yong";
      yong = { label: normalizeWilhelmCommentsTxtText(line), a: "", b: "" };
      phase = "label";
      continue;
    }

    const ab = AB_LINE_RE.exec(line);
    if (ab) {
      flushBuffer();
      phase = ab[1] === "b" ? "b" : "a";
      buffer = ab[2] ? [ab[2]] : [];
      continue;
    }

    if (phase === "a" || phase === "b") {
      buffer.push(line);
    }
  }
  flushBuffer();

  return { lines: out, yong };
}

/**
 * @param {string} label
 */
function linePosFromCommentLabel(label) {
  if (/at the beginning/i.test(label)) return 1;
  if (/second place/i.test(label)) return 2;
  if (/third place/i.test(label)) return 3;
  if (/fourth place/i.test(label)) return 4;
  if (/fifth place/i.test(label)) return 5;
  if (/at the top/i.test(label)) return 6;
  return null;
}

/**
 * @param {string[]} lines
 * @param {number} bookNumber
 * @param {string} bookChinese
 * @param {string} bookTitle
 */
function parseHexChunk(lines, bookNumber, bookChinese, bookTitle) {
  const idx = {
    sequence: findMarker(lines, MARKERS.sequence),
    misc: findMarker(lines, MARKERS.misc),
    judgment: findMarker(lines, MARKERS.judgment),
    commentaryDecision: findMarker(lines, MARKERS.commentaryDecision),
    commentaryImages: findMarker(lines, MARKERS.commentaryImages),
    image: findMarker(lines, MARKERS.image),
    lines: findMarker(lines, MARKERS.lines),
    wenYen: findMarker(lines, MARKERS.wenYen),
  };

  /** @type {number[]} */
  const ordered = Object.values(idx).filter((n) => n >= 0).sort((a, b) => a - b);
  const firstBody = ordered[0] ?? lines.length;

  const ruler_note = linesToText(sliceLines(lines, 0, firstBody));

  const sequence =
    idx.sequence >= 0
      ? linesToText(
          sliceLines(
            lines,
            idx.sequence + 1,
            [idx.misc, idx.judgment].filter((n) => n >= 0).sort((a, b) => a - b)[0] ??
              -1,
          ),
        )
      : "";

  const miscStart = idx.misc >= 0 ? idx.misc + 1 : -1;
  const miscEnd =
    idx.judgment >= 0 ? idx.judgment : idx.commentaryDecision >= 0 ? idx.commentaryDecision : -1;
  const misc_notes =
    miscStart >= 0 ? linesToText(sliceLines(lines, miscStart, miscEnd)) : "";

  const judgment_oraculo =
    idx.judgment >= 0
      ? linesToText(
          sliceLines(
            lines,
            idx.judgment + 1,
            idx.commentaryDecision >= 0 ? idx.commentaryDecision : idx.image >= 0 ? idx.image : idx.lines,
          ),
        )
      : "";

  const commentary_decision =
    idx.commentaryDecision >= 0
      ? linesToText(
          sliceLines(
            lines,
            idx.commentaryDecision + 1,
            idx.commentaryImages >= 0
              ? idx.commentaryImages
              : idx.image >= 0
                ? idx.image
                : idx.lines,
          ),
        )
      : "";

  const imageStart = idx.image >= 0 ? idx.image + 1 : -1;
  const imageEnd = idx.lines >= 0 ? idx.lines : idx.wenYen >= 0 ? idx.wenYen : -1;
  const imageSlice = imageStart >= 0 ? sliceLines(lines, imageStart, imageEnd) : [];
  const { image_oraculo, commentary_image } = splitImageSection(imageSlice);

  const linesSlice =
    idx.lines >= 0
      ? sliceLines(lines, idx.lines + 1, idx.wenYen >= 0 ? idx.wenYen : -1)
      : [];
  const parsedLines = parseCommentLinesSection(linesSlice);

  const wenYenSlice =
    idx.wenYen >= 0 ? sliceLines(lines, idx.wenYen + 1, -1) : [];
  const { wen_yen, wen_yen_note } = splitWenYenSection(wenYenSlice);

  /** @type {Record<string, string>} */
  const fields = {
    hex: String(bookNumber),
    nombre: "",
    chinese: "",
    chinese_roman: "",
    hex_font: "",
    trigrama_arriba: "",
    trigrama_abajo: "",
    ruler_note,
    sequence,
    misc_notes,
    judgment_oraculo,
    commentary_decision,
    image_oraculo,
    commentary_image,
    wen_yen,
    wen_yen_note,
    yong_etiqueta: parsedLines.yong?.label ?? "",
    yong_a_oraculo: parsedLines.yong?.a ?? "",
    yong_b_comentario: parsedLines.yong?.b ?? "",
  };

  for (let p = 1; p <= 6; p++) {
    const L = parsedLines.lines[p];
    fields[`L${p}_etiqueta`] = L?.label ?? "";
    fields[`L${p}_a_oraculo`] = L?.a ?? "";
    fields[`L${p}_b_comentario`] = L?.b ?? "";
  }

  return {
    bookNumber,
    bookChinese,
    bookTitle,
    fields,
  };
}

/**
 * @param {string} rawText
 */
export function parseWilhelm64HexCommentsTxt(rawText) {
  const text = normalizeWilhelmTypographyOnly(rawText);
  const lines = text.split("\n");
  /** @type {Array<{ number: number; chinese: string; title: string; lineStart: number }>} */
  const headers = [];

  for (let i = 0; i < lines.length; i++) {
    const m = HEX_HEADER_RE.exec(cleanLine(lines[i]));
    if (m) {
      headers.push({
        number: Number(m[1]),
        chinese: m[2].trim(),
        title: m[3].trim(),
        lineStart: i,
      });
    }
  }

  /** @type {Record<string, ReturnType<typeof parseHexChunk> & { lineEnd: number }>} */
  const hexagrams = {};

  for (let h = 0; h < headers.length; h++) {
    const head = headers[h];
    const end = h + 1 < headers.length ? headers[h + 1].lineStart : lines.length;
    const chunk = sliceLines(lines, head.lineStart + 1, end);
    const parsed = parseHexChunk(chunk, head.number, head.chinese, head.title);
    hexagrams[String(head.number)] = {
      ...parsed,
      lineStart: head.lineStart + 1,
      lineEnd: end,
    };
  }

  return { hexagrams, headerCount: headers.length };
}

/**
 * @param {string} text
 */
function normalizeWilhelmTypographyOnly(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u2019/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2014/g, "—");
}

/**
 * @param {Awaited<ReturnType<typeof loadWilhelmInjectorMap>>} injector
 * @param {Record<string, string>} fields
 * @param {number} hexNum
 * @param {{ chinese: string; title: string }} bookMeta
 */
function applyInjectorMeta(injector, fields, hexNum, bookMeta) {
  fields.nombre = bookMeta.title;
  fields.chinese_roman = bookMeta.chinese;
  const row = injector[String(hexNum)];
  if (!row) return;
  fields.chinese = String(row.trad_chinese ?? "");
  fields.hex_font = String(row.hex_font ?? "");
  fields.trigrama_arriba = formatWilhelmTrigram(row.wilhelm_above, "above");
  fields.trigrama_abajo = formatWilhelmTrigram(row.wilhelm_below, "below");
}

export async function loadWilhelmInjectorMap() {
  const mod = await import(
    pathToFileURL(join(ROOT, "scripts", "iching_wilhelm_translation.mjs")).href
  );
  return mod.default;
}

/**
 * @param {string} [filePath]
 */
export function parseWilhelm64HexCommentsTxtFile(filePath = WILHELM_64HEX_COMMENTS_TXT_PATH) {
  const raw = readFileSync(filePath, "utf8");
  return parseWilhelm64HexCommentsTxt(raw);
}

/**
 * @param {string} [filePath]
 */
export async function parseWilhelm64HexCommentsTxtFull(
  filePath = WILHELM_64HEX_COMMENTS_TXT_PATH,
) {
  const parsed = parseWilhelm64HexCommentsTxtFile(filePath);
  const injector = await loadWilhelmInjectorMap();
  for (let n = 1; n <= 64; n++) {
    const hex = parsed.hexagrams[String(n)];
    if (hex?.fields) {
      const row = injector[String(n)];
      hex.bookHanzi = String(row?.trad_chinese ?? "");
      hex.bookHexFont = String(row?.hex_font ?? "");
      applyInjectorMeta(injector, hex.fields, n, {
        chinese: hex.bookChinese,
        title: hex.bookTitle,
      });
    }
  }
  return {
    source: filePath,
    parsedAt: new Date().toISOString(),
    ...parsed,
  };
}

/**
 * @param {Awaited<ReturnType<typeof parseWilhelm64HexCommentsTxtFull>>} parsed
 */
export function validateWilhelm64HexCommentsStructure(parsed) {
  /** @type {string[]} */
  const errors = [];
  if (parsed.headerCount !== 64) {
    errors.push(`expected 64 hex headers, got ${parsed.headerCount}`);
  }
  for (let n = 1; n <= 64; n++) {
    const hex = parsed.hexagrams[String(n)];
    if (!hex) {
      errors.push(`missing hex ${n}`);
      continue;
    }
    if (hex.fields.nombre !== hex.bookTitle) {
      errors.push(
        `hex ${n}: nombre "${hex.fields.nombre}" != bookTitle "${hex.bookTitle}"`,
      );
    }
    if (hex.fields.chinese !== hex.bookHanzi) {
      errors.push(
        `hex ${n}: chinese "${hex.fields.chinese}" != bookHanzi "${hex.bookHanzi}"`,
      );
    }
    if (hex.fields.chinese_roman !== hex.bookChinese) {
      errors.push(
        `hex ${n}: chinese_roman "${hex.fields.chinese_roman}" != bookChinese "${hex.bookChinese}"`,
      );
    }
    if (hex.fields.hex_font !== hex.bookHexFont) {
      errors.push(
        `hex ${n}: hex_font "${hex.fields.hex_font}" != bookHexFont "${hex.bookHexFont}"`,
      );
    }
    if (!hex.fields.commentary_decision?.trim()) {
      errors.push(`hex ${n}: empty commentary_decision`);
    }
    if (!hex.fields.commentary_image?.trim() && !hex.fields.image_oraculo?.trim()) {
      errors.push(`hex ${n}: empty image section`);
    }
    if (!hex.fields.commentary_image?.trim() && hex.fields.image_oraculo?.trim()) {
      errors.push(`hex ${n}: empty commentary_image`);
    }
    for (let p = 1; p <= 6; p++) {
      if (!hex.fields[`L${p}_b_comentario`]?.trim()) {
        errors.push(`hex ${n}: empty L${p}_b_comentario`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}
