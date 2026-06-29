/**
 * Parse Wilhelm DE 1924 Drittes Buch (Ten Wings / classical commentaries) from stitched OCR TXT.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { stripWilhelmTxtFootnoteLine } from "./wilhelm-64hex-txt-footnotes.mjs";
import { formatWilhelmTrigram } from "./wilhelm-manual-fields.mjs";
import {
  normalizeWilhelmDeTxtText,
  parseWilhelmDeHexHeaderLine,
} from "./wilhelm-de-64hex-txt.mjs";
import { WILHELM_DE_STITCHED } from "./wilhelm-de-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const WILHELM_DE_COMMENTS_DEFAULT_PATH = WILHELM_DE_STITCHED.bookThreePass02;

export const WILHELM_DE_COMMENT_FIELD_KEYS = [
  "ruler_note",
  "sequence",
  "misc_notes",
  "commentary_decision",
  "commentary_image",
  "image_oraculo",
  "wen_yen",
  "wen_yen_note",
  "yong_b_comentario",
  "L1_b_comentario",
  "L2_b_comentario",
  "L3_b_comentario",
  "L4_b_comentario",
  "L5_b_comentario",
  "L6_b_comentario",
];

const MARKERS = {
  kernzeichen: /^Kernzeichen\s*:?\s*$/i,
  sequence: /^Die Reihenfolge\s*\.?\s*$/i,
  misc: /^Vermischte Zeichen\s*\.?\s*$/i,
  judgment: /^DAS URTEIL\s*\.?\s*$/i,
  commentaryDecision: /^Kommentar zur Entscheidung\s*\.?\s*$/i,
  commentaryImages: /^Kommentar zu den Bildern\s*\.?\s*$/i,
  image: /^DAS BILD\s*\.?\s*$/i,
  lines: /^(?:Zu den einzelnen Linien|Die einzelnen Linien)\s*\.?\s*$/i,
  wenYen: /^Kommentar (?:zu den Textworten|der Textworte)(?: \(Wen Y[aä]n\))?\s*\.?\s*$/i,
};

const COMMENT_LINE_LABEL_RE =
  /^(?:O\s+)?(?:Anfangs|Oben)\s+(?:Neun|Sechs)(?:\s+bedeutet)?\s*:?\s*$|^(?:O\s+)?(?:Neun|Sechs)\s+auf\s+(?:zweitem|drittem|viertem|f[üu]nftem)\s+Platz(?:\s+bedeutet)?\s*:?\s*$|^(?:Oberste|Obere)\s+(?:Neun|Sechs)\s*:?\s*$/i;

const ZUR_LINE_LABEL_RE =
  /^Zur\s+(?:Anfangs(?:neun|sechs)|Sechs auf|Neun auf|oberen Sechs|Oberen Sechs)/i;

const YONG_LABEL_RE = /^Alle Striche sind (?:Neunen|Sechsen)\.?\s*$/i;
const AB_LINE_RE = /^([abcd])\)\s*(.*)$/i;
const WEN_YEN_LINE_RE = /^([bcd]),\s*(\d+)\s+(.*)$/i;

/** @param {string} s */
export function normalizeWilhelmDeCommentsTxtText(s) {
  return normalizeWilhelmDeTxtText(s);
}

/** @param {string} line */
function cleanLine(line) {
  const t = stripWilhelmTxtFootnoteLine(line).trim();
  if (/^--- page \d+ ---$/.test(t)) return "";
  if (/^[\d\s*#@]{1,6}$/.test(t)) return "";
  if (/^ERSTE ABTEILUNG/i.test(t)) return "";
  if (/^DRITTES BUCH/i.test(t)) return "";
  if (/^DIE KOMMENTARE/i.test(t)) return "";
  return t;
}

/** @param {string[]} lines */
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
    } else if (/^Bemerkung\s*:/i.test(t) || /^Anmerkung\s*:/i.test(t) || /^Vorbemerkung\s*:/i.test(t)) {
      if (current.length) {
        groups.push({ lines: current });
        current = [];
      }
      current.push(t);
    } else {
      current.push(t);
    }
  }
  if (current.length) groups.push({ lines: current });
  return groups;
}

/** @param {string[]} lines */
function linesToText(lines) {
  return normalizeWilhelmDeCommentsTxtText(
    paragraphGroups(lines)
      .map((g) => g.lines.join("\n"))
      .join("\n"),
  );
}

/** @param {string[]} lines @param {RegExp} re */
function findMarker(lines, re) {
  return lines.findIndex((l) => re.test(cleanLine(l)));
}

/** @param {string[]} lines @param {number} start @param {number} end */
function sliceLines(lines, start, end) {
  return lines.slice(start, end >= 0 ? end : undefined);
}

/** @param {string} label */
function linePosFromGermanCommentLabel(label) {
  const s = String(label ?? "").toLowerCase().replace(/^o\s+/, "");
  if (/anfangs/.test(s)) return 1;
  if (/zweitem/.test(s)) return 2;
  if (/drittem/.test(s)) return 3;
  if (/viertem/.test(s)) return 4;
  if (/f[üu]nftem/.test(s)) return 5;
  if (/oben|ober/.test(s)) return 6;
  return null;
}

const ORACLE_GROUP_MAX = 8;

/** @param {string[]} lines */
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
  return {
    oracle: normalizeWilhelmDeCommentsTxtText(oracleParts.join("\n")),
    commentary: normalizeWilhelmDeCommentsTxtText(
      groups
        .slice(i)
        .map((g) => g.lines.join("\n"))
        .join("\n"),
    ),
  };
}

/** @param {string[]} lines */
function splitImageSection(lines) {
  const split = splitOracleCommentarySimple(lines);
  return {
    image_oraculo: split.oracle,
    commentary_image: split.commentary || split.oracle,
  };
}

/** @param {string[]} lines */
function splitWenYenSection(lines) {
  /** @type {string[]} */
  const noteLines = [];
  /** @type {string[]} */
  const bodyLines = [];
  let capturingNote = false;

  for (const raw of lines) {
    const t = cleanLine(raw);
    if (!t) continue;
    if (/^(?:Bemerkung|Anmerkung|Vorbemerkung)\s*:/i.test(t)) {
      capturingNote = true;
      noteLines.push(t);
      continue;
    }
    if (capturingNote) {
      if (/^Über das ganze Zeichen\s*:/i.test(t) || /^Zu:\s/i.test(t) || WEN_YEN_LINE_RE.test(t)) {
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
    wen_yen_note: normalizeWilhelmDeCommentsTxtText(noteLines.join("\n")),
    wen_yen: linesToText(bodyLines),
  };
}

/** @param {string} line */
function normalizeCommentLabelLine(line) {
  return cleanLine(line)
    .replace(/^[●•·\-]\s*/, "")
    .replace(/^O\s+(?=Anfangs|Oben|Neun|Sechs)/i, "")
    .trim();
}

/** @param {string[]} lines */
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

  /** @param {number | "yong"} key @param {"a"|"b"} part @param {string} text */
  function assign(key, part, text) {
    const val = normalizeWilhelmDeCommentsTxtText(text);
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
    if (MARKERS.lines.test(line)) continue;

    const labelLine = normalizeCommentLabelLine(line);

    if (COMMENT_LINE_LABEL_RE.test(labelLine) || ZUR_LINE_LABEL_RE.test(labelLine)) {
      flushBuffer();
      const pos = linePosFromGermanCommentLabel(labelLine);
      if (typeof pos === "number") {
        currentKey = pos;
        if (!out[pos]) out[pos] = { label: "", a: "", b: "" };
        out[pos].label = normalizeWilhelmDeCommentsTxtText(labelLine);
        phase = ZUR_LINE_LABEL_RE.test(labelLine) ? "b" : "label";
        if (phase === "b") buffer = [];
      }
      continue;
    }

    if (YONG_LABEL_RE.test(line)) {
      flushBuffer();
      currentKey = "yong";
      yong = { label: normalizeWilhelmDeCommentsTxtText(line), a: "", b: "" };
      phase = "b";
      buffer = [];
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
    } else if (ZUR_LINE_LABEL_RE.test(line)) {
      // handled above
    }
  }
  flushBuffer();

  for (const [pos, entry] of Object.entries(out)) {
    if (!entry.b?.trim() && entry.a?.trim()) {
      entry.b = entry.a;
      entry.a = "";
    }
  }

  return { lines: out, yong };
}

/** @param {string[]} lines @param {number} bookNumber @param {string} bookChinese @param {string} bookTitle */
function parseHexChunk(lines, bookNumber, bookChinese, bookTitle) {
  const idx = {
    kernzeichen: findMarker(lines, MARKERS.kernzeichen),
    sequence: findMarker(lines, MARKERS.sequence),
    misc: findMarker(lines, MARKERS.misc),
    judgment: findMarker(lines, MARKERS.judgment),
    commentaryDecision: findMarker(lines, MARKERS.commentaryDecision),
    commentaryImages: findMarker(lines, MARKERS.commentaryImages),
    image: findMarker(lines, MARKERS.image),
    lines: findMarker(lines, MARKERS.lines),
    wenYen: findMarker(lines, MARKERS.wenYen),
  };

  const rulerStart = idx.kernzeichen >= 0 ? idx.kernzeichen + 1 : 0;
  const rulerEndCandidates = [idx.sequence, idx.misc, idx.judgment, idx.commentaryDecision].filter(
    (n) => n >= 0,
  );
  const rulerEnd = rulerEndCandidates.length ? Math.min(...rulerEndCandidates) : 0;
  const ruler_note =
    idx.kernzeichen >= 0 && rulerEnd > rulerStart
      ? linesToText(sliceLines(lines, rulerStart, rulerEnd))
      : linesToText(sliceLines(lines, 0, rulerEnd > 0 ? rulerEnd : idx.judgment >= 0 ? idx.judgment : 0));

  const sequence =
    idx.sequence >= 0
      ? linesToText(
          sliceLines(
            lines,
            idx.sequence + 1,
            [idx.misc, idx.judgment, idx.commentaryDecision].filter((n) => n >= 0).sort((a, b) => a - b)[0] ??
              -1,
          ),
        )
      : "";

  const miscStart = idx.misc >= 0 ? idx.misc + 1 : -1;
  const miscEnd =
    idx.judgment >= 0 ? idx.judgment : idx.commentaryDecision >= 0 ? idx.commentaryDecision : -1;
  const misc_notes = miscStart >= 0 ? linesToText(sliceLines(lines, miscStart, miscEnd)) : "";

  const commentary_decision =
    idx.commentaryDecision >= 0
      ? linesToText(
          sliceLines(
            lines,
            idx.commentaryDecision + 1,
            [idx.commentaryImages, idx.image, idx.lines, idx.wenYen].filter((n) => n >= 0).sort((a, b) => a - b)[0] ??
              -1,
          ),
        )
      : "";

  let image_oraculo = "";
  let commentary_image = "";

  if (idx.commentaryImages >= 0) {
    const imageSectionEnd = [idx.lines, idx.wenYen].filter((n) => n >= 0).sort((a, b) => a - b)[0] ?? -1;
    const imageSlice = sliceLines(
      lines,
      idx.commentaryImages + 1,
      imageSectionEnd >= 0 ? imageSectionEnd : -1,
    );
    if (idx.image >= 0) {
      const relImage = idx.image - (idx.commentaryImages + 1);
      const beforeImage = sliceLines(imageSlice, 0, relImage);
      const afterImage = sliceLines(imageSlice, relImage + 1, -1);
      const preamble = linesToText(beforeImage);
      const { image_oraculo: imgOracle, commentary_image: imgCommentary } = splitImageSection(afterImage);
      image_oraculo = imgOracle;
      commentary_image = normalizeWilhelmDeCommentsTxtText(
        [preamble, imgOracle, imgCommentary].filter(Boolean).join("\n\n"),
      );
    } else {
      const split = splitImageSection(imageSlice);
      image_oraculo = split.image_oraculo;
      commentary_image = split.commentary_image;
    }
  } else if (idx.image >= 0) {
    const imageEnd = [idx.lines, idx.wenYen].filter((n) => n >= 0).sort((a, b) => a - b)[0] ?? -1;
    const split = splitImageSection(sliceLines(lines, idx.image + 1, imageEnd));
    image_oraculo = split.image_oraculo;
    commentary_image = split.commentary_image;
  }

  const linesSliceStart =
    idx.lines >= 0
      ? (() => {
          let start = idx.lines;
          for (let back = idx.lines - 1; back >= Math.max(0, idx.lines - 5); back--) {
            const label = normalizeCommentLabelLine(lines[back] ?? "");
            if (COMMENT_LINE_LABEL_RE.test(label) || ZUR_LINE_LABEL_RE.test(label)) {
              start = back;
              break;
            }
          }
          return start;
        })()
      : -1;

  const linesSlice =
    linesSliceStart >= 0
      ? sliceLines(lines, linesSliceStart, idx.wenYen >= 0 ? idx.wenYen : -1)
      : [];
  const parsedLinesFromSection = parseCommentLinesSection(linesSlice);
  let parsedLines = parsedLinesFromSection;
  if (Object.keys(parsedLines.lines).length === 0) {
    const fallbackStart =
      idx.image >= 0
        ? idx.image
        : idx.commentaryImages >= 0
          ? idx.commentaryImages
          : idx.commentaryDecision >= 0
            ? idx.commentaryDecision
            : -1;
    if (fallbackStart >= 0) {
      parsedLines = parseCommentLinesSection(
        sliceLines(lines, fallbackStart, idx.wenYen >= 0 ? idx.wenYen : -1),
      );
    }
  }

  const wenYenSlice = idx.wenYen >= 0 ? sliceLines(lines, idx.wenYen + 1, -1) : [];
  const { wen_yen, wen_yen_note } = splitWenYenSection(wenYenSlice);

  /** @type {Record<string, string>} */
  const fields = {
    hex: String(bookNumber),
    nombre: bookTitle,
    chinese: "",
    chinese_roman: bookChinese,
    hex_font: "",
    trigrama_arriba: "",
    trigrama_abajo: "",
    ruler_note,
    sequence,
    misc_notes,
    judgment_oraculo: "",
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

  return { bookNumber, bookChinese, bookTitle, fields };
}

/** @param {string} rawText */
export function parseWilhelmDe64HexCommentsTxt(rawText) {
  const text = String(rawText ?? "").replace(/\r\n/g, "\n");
  const lines = text.split("\n");

  let zoneStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/DIE KOMMENTARE/i.test(cleanLine(lines[i]))) {
      zoneStart = i;
      break;
    }
  }

  /** @type {Array<{ number: number; chinese: string; title: string; lineStart: number }>} */
  const headers = [];
  /** @type {Set<number>} */
  const seen = new Set();

  for (let i = zoneStart; i < lines.length; i++) {
    const h = parseWilhelmDeHexHeaderLine(lines[i]);
    if (!h || seen.has(h.n)) continue;
    seen.add(h.n);
    headers.push({
      number: h.n,
      chinese: h.chinese,
      title: h.title,
      lineStart: i,
    });
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

/** @param {string} filePath */
export function parseWilhelmDe64HexCommentsTxtFile(filePath = WILHELM_DE_COMMENTS_DEFAULT_PATH) {
  const raw = readFileSync(filePath, "utf8");
  return parseWilhelmDe64HexCommentsTxt(raw);
}

export async function loadWilhelmDeInjectorMap() {
  const mod = await import(
    pathToFileURL(join(ROOT, "scripts", "iching_wilhelm_de_translation.mjs")).href
  );
  return mod.default;
}

/**
 * @param {string} [filePath]
 */
export async function parseWilhelmDe64HexCommentsTxtFull(
  filePath = WILHELM_DE_COMMENTS_DEFAULT_PATH,
) {
  const parsed = parseWilhelmDe64HexCommentsTxtFile(filePath);
  const injector = await loadWilhelmDeInjectorMap();
  for (let n = 1; n <= 64; n++) {
    const hex = parsed.hexagrams[String(n)];
    if (!hex?.fields) continue;
    const row = injector[String(n)];
    hex.bookHanzi = String(row?.trad_chinese ?? "");
    hex.bookHexFont = String(row?.hex_font ?? "");
    hex.bookChinese = hex.bookChinese || hex.fields.chinese_roman;
    hex.bookTitle = hex.bookTitle || hex.fields.nombre;
    hex.fields.chinese = String(row?.trad_chinese ?? "");
    hex.fields.hex_font = String(row?.hex_font ?? "");
    hex.fields.trigrama_arriba = formatWilhelmTrigram(row?.wilhelm_above, "above");
    hex.fields.trigrama_abajo = formatWilhelmTrigram(row?.wilhelm_below, "below");
  }
  return {
    source: filePath,
    parsedAt: new Date().toISOString(),
    ...parsed,
  };
}

/** @param {Awaited<ReturnType<typeof parseWilhelmDe64HexCommentsTxtFull>>} parsed */
export function validateWilhelmDe64HexCommentsStructure(parsed) {
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
    if (!hex.fields.commentary_decision?.trim()) {
      errors.push(`hex ${n}: empty commentary_decision`);
    }
    if (!hex.fields.commentary_image?.trim()) {
      errors.push(`hex ${n}: empty commentary_image`);
    }
    if (n === 1 || n === 2) {
      if (!hex.fields.wen_yen?.trim()) {
        errors.push(`hex ${n}: empty wen_yen (expected for hex 1-2)`);
      }
    } else if (!hex.fields.sequence?.trim()) {
      errors.push(`hex ${n}: empty sequence (expected from hex 3+)`);
    }
    let lineCount = 0;
    for (let p = 1; p <= 6; p++) {
      if (hex.fields[`L${p}_b_comentario`]?.trim()) lineCount++;
    }
    if (lineCount < 4 && n > 2) {
      errors.push(`hex ${n}: only ${lineCount}/6 line commentaries parsed`);
    }
  }
  return { ok: errors.length === 0, errors };
}
