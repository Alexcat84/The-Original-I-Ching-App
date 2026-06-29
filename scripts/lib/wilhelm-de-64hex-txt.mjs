/**
 * Parse Wilhelm Book I (64 hex) from German 1924 OCR stitched TXT.
 * Erstes Buch — oracle + Wilhelm inline commentary.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { stripWilhelmTxtFootnoteLine } from "./wilhelm-64hex-txt-footnotes.mjs";
import {
  formatWilhelmTrigram,
  WILHELM_MANUAL_FIELDS,
} from "./wilhelm-manual-fields.mjs";
import { WILHELM_DE_STITCHED } from "./wilhelm-de-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const WILHELM_DE_64HEX_DEFAULT_PATH = WILHELM_DE_STITCHED.bookOnePass03;

/** Stop before appendix / index duplicates at volume tail. */
export const WILHELM_DE_ZONE_END_MARKERS = [
  /^ZWEITES BUCH:\s*DAS MATERIAL/i,
  /^INHALT\s*$/i,
  /^DRITTES BUCH:\s*DIE\s/i,
];

const HEX_HEADER_NOISE =
  /^(?:Sohn|Tochter|Allgemeines|Grundzeichen|Vgl\.|Bifo)\b/i;

/**
 * @param {string} line
 */
export function normalizeWilhelmDeHeaderLine(line) {
  return String(line ?? "")
    .replace(/[\u200b\uFEFF\u2060\u180e\ufeff]/g, "")
    .replace(/^[\u4e00-\u9fff䷀-䷿\s]+/, "")
    .replace(/^[#*@\s\dA-Za-zäöüÄÖÜß]{0,12}\s+(?=\d{1,2}\.)/, "")
    .replace(/^#+\s*/, "")
    .trim();
}

/**
 * @param {string} line
 * @returns {{ n: number; chinese: string; title: string } | null}
 */
export function parseWilhelmDeHexHeaderLine(line) {
  const t = normalizeWilhelmDeHeaderLine(line);
  if (!t || HEX_HEADER_NOISE.test(t)) return null;
  const m = t.match(/^(\d{1,2})\.\s+(.+?)(?:\s*\/\s*(.+))?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 64) return null;
  const chinese = m[2].trim();
  const title = (m[3] ?? "").trim();
  if (/^§\s*\d/.test(chinese)) return null;
  return { n, chinese, title };
}

const JUDGMENT_RE = /^DAS URTEIL\s*$/i;
const IMAGE_RE = /^DAS BILD\s*$/i;
const LINES_HEADER_RE = /^Die einzelnen Linien(?:[\u00b9\u00b2\u00b3\d])?\s*:\s*$/i;

const LINE_LABEL_RE =
  /^(?:O\s+)?(?:Anfangs|Oben)\s+(?:eine\s+)?(?:Neun|Sechs)\s+bedeutet:|^(?:O\s+)?(?:Neun|Sechs)\s+auf\s+(?:zweitem|drittem|viertem|f[üu]nftem)\s+Platz\s+bedeutet:/i;

const YONG_LABEL_RE =
  /^Wenn lauter (?:Neunen|Sechsen) erscheinen/i;

const COMMENTARY_GROUP_MIN = 120;
const COMMENTARY_GAP_MIN = 5;

/**
 * @param {string} label
 * @returns {number | null}
 */
export function linePosFromGermanLabel(label) {
  const s = String(label ?? "").toLowerCase().replace(/^o\s+/, "");
  if (/anfangs/.test(s)) return 1;
  if (/zweitem/.test(s)) return 2;
  if (/drittem/.test(s)) return 3;
  if (/viertem/.test(s)) return 4;
  if (/f[üu]nftem/.test(s)) return 5;
  if (/oben/.test(s)) return 6;
  return null;
}

/**
 * @param {string} s
 */
export function normalizeWilhelmDeTxtText(s) {
  return String(s ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u201c\u201d„"]/g, '"')
    .replace(/\u2014/g, "—")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * @param {string} line
 */
function cleanLine(line) {
  const t = stripWilhelmTxtFootnoteLine(line).trim();
  if (/^--- page \d+ ---$/.test(t)) return "";
  if (/^[#*@\s]{8,}$/.test(t)) return "";
  if (/^NYPL RESEARCH LIBRARIES/i.test(t)) return "";
  if (/^\d+\s*$/.test(t) && t.length <= 3) return "";
  return t;
}

/**
 * @param {string[]} lines
 */
function paragraphGroups(lines) {
  /** @type {Array<{ lines: string[]; blankBefore: number }>} */
  const groups = [];
  /** @type {string[]} */
  let current = [];
  let blankRun = 0;
  let blankBefore = 0;

  for (const raw of lines) {
    const t = cleanLine(raw);
    if (!t) {
      blankRun++;
      if (current.length) {
        groups.push({ lines: current, blankBefore });
        current = [];
        blankBefore = 0;
      }
      continue;
    }
    if (current.length === 0) blankBefore = blankRun;
    blankRun = 0;
    current.push(t);
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
    oracle: normalizeWilhelmDeTxtText(
      oracleGroups.map((g) => g.lines.join("\n")).join("\n"),
    ),
    commentary: normalizeWilhelmDeTxtText(
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
    const cleaned = cleanLine(lines[i]);
    if (!cleaned) {
      i++;
      continue;
    }
    if (LINE_LABEL_RE.test(cleaned) || YONG_LABEL_RE.test(cleaned)) break;
    if (/^Vgl\.\s/i.test(cleaned)) break;
    if (/^\d+\s*$/.test(cleaned) && cleaned.length <= 2) break;
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
    const cleaned = cleanLine(lines[i]);
    if (!cleaned) {
      i++;
      continue;
    }

    if (YONG_LABEL_RE.test(cleaned)) {
      const { chunk, nextIndex } = sliceUntilNextLabel(lines, i + 1);
      const split = splitOracleCommentary(chunk);
      yong = { label: normalizeWilhelmDeTxtText(cleaned), ...split };
      i = nextIndex;
      continue;
    }

    if (LINE_LABEL_RE.test(cleaned)) {
      const pos = linePosFromGermanLabel(cleaned);
      const { chunk, nextIndex } = sliceUntilNextLabel(lines, i + 1);
      const split = splitOracleCommentary(chunk);
      if (typeof pos === "number" && pos >= 1 && pos <= 6) {
        out[pos] = {
          label: normalizeWilhelmDeTxtText(cleaned),
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
 * @param {RegExp} re
 */
function findSectionLine(lines, re) {
  return lines.findIndex((l) => re.test(cleanLine(l)));
}

/**
 * @param {number} n
 * @param {string[]} lines
 * @param {Record<string, unknown>} injectorRow
 * @param {{ chinese: string; title: string }} bookMeta
 */
function parseHexBlock(n, lines, injectorRow, bookMeta) {
  const jIdx = findSectionLine(lines, JUDGMENT_RE);
  const iIdx = findSectionLine(lines, IMAGE_RE);
  const lIdx = findSectionLine(lines, LINES_HEADER_RE);

  if (jIdx < 0 || iIdx < 0) {
    throw new Error(`hex ${n}: missing DAS URTEIL/DAS BILD (J=${jIdx} I=${iIdx})`);
  }

  const introLines = lines.slice(0, jIdx);
  const introGroups = paragraphGroups(introLines);
  const judgmentBody = lines.slice(jIdx + 1, iIdx);
  const imageEnd = lIdx >= 0 ? lIdx : lines.length;
  const imageBody = lines.slice(iIdx + 1, imageEnd);
  const linesBody = lIdx >= 0 ? lines.slice(lIdx + 1) : [];

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
    intro: normalizeWilhelmDeTxtText(
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
 * @param {string} rawText
 */
export function sliceWilhelmDe64HexZone(rawText) {
  const lines = String(rawText ?? "").replace(/\r\n/g, "\n").split("\n");
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const t = cleanLine(lines[i]);
    if (!t) continue;
    if (WILHELM_DE_ZONE_END_MARKERS.some((re) => re.test(t))) {
      end = i;
      break;
    }
  }
  return lines.slice(0, end);
}

/**
 * @param {string[]} zone
 * @param {number} lineIndex
 */
function isWilhelmDeHexHeaderAnchor(zone, lineIndex) {
  const slice = zone.slice(lineIndex, Math.min(zone.length, lineIndex + 100)).map((l) =>
    cleanLine(l) || normalizeWilhelmDeHeaderLine(l),
  );
  const hasUrteil = slice.some((l) => JUDGMENT_RE.test(l));
  const head = slice.slice(0, 20);
  const hasTrigram =
    head.some((l) => /^oben\s/i.test(l)) && head.some((l) => /^unten\s/i.test(l));
  return hasUrteil || hasTrigram;
}

/**
 * @param {string} rawText
 */
export function findWilhelmDe64HexStarts(rawText) {
  const zone = sliceWilhelmDe64HexZone(rawText);
  /** @type {Map<number, { n: number; lineIndex: number; chinese: string; title: string }>} */
  const firstByN = new Map();

  for (let i = 0; i < zone.length; i++) {
    const parsed = parseWilhelmDeHexHeaderLine(zone[i]);
    if (!parsed) continue;
    if (!isWilhelmDeHexHeaderAnchor(zone, i)) continue;
    if (!firstByN.has(parsed.n)) {
      firstByN.set(parsed.n, {
        n: parsed.n,
        lineIndex: i,
        chinese: parsed.chinese,
        title: parsed.title,
      });
    }
  }

  const starts = [...firstByN.values()].sort((a, b) => a.lineIndex - b.lineIndex);
  return { zone, starts, allHits: firstByN.size };
}

export async function loadWilhelmDeInjectorMap() {
  const mod = await import(
    pathToFileURL(join(ROOT, "scripts/iching_wilhelm_translation.baynes.mjs")).href
  );
  return mod.default;
}

/**
 * @param {string} [filePath]
 * @param {{ require64?: boolean }} [opts]
 */
export function parseWilhelmDe64HexTxt(filePath = WILHELM_DE_64HEX_DEFAULT_PATH, opts = {}) {
  const require64 = opts.require64 !== false;
  const raw = readFileSync(filePath, "utf8");
  const { zone, starts, allHits } = findWilhelmDe64HexStarts(raw);
  if (require64 && starts.length < 64) {
    throw new Error(
      `Expected 64 hex headers in Erstes Buch zone, found ${starts.length} (raw hits ${allHits})`,
    );
  }

  /** @type {Record<number, object>} */
  const hexagrams = {};
  for (let s = 0; s < starts.length; s++) {
    const { n, lineIndex, chinese, title } = starts[s];
    const endLine = s + 1 < starts.length ? starts[s + 1].lineIndex : zone.length;
    hexagrams[n] = {
      lineStart: lineIndex + 1,
      lineEnd: endLine,
      bookChinese: chinese,
      bookTitle: title,
      fields: {},
    };
  }

  return { zone, starts, hexagrams, zoneLineCount: zone.length, sourcePath: filePath };
}

/**
 * @param {string} [filePath]
 * @param {{ require64?: boolean }} [opts]
 */
export async function parseWilhelmDe64HexTxtFull(
  filePath = WILHELM_DE_64HEX_DEFAULT_PATH,
  opts = {},
) {
  const parsed = parseWilhelmDe64HexTxt(filePath, opts);
  const injector = await loadWilhelmDeInjectorMap();
  const { zone, starts } = parsed;

  for (let s = 0; s < starts.length; s++) {
    const { n, lineIndex, chinese, title } = starts[s];
    const endLine = s + 1 < starts.length ? starts[s + 1].lineIndex : zone.length;
    const block = zone.slice(lineIndex, endLine);
    const row = injector[String(n)];
    if (!row) throw new Error(`Missing injector row for hex ${n}`);
    parsed.hexagrams[n].bookHanzi = String(row.trad_chinese ?? "");
    parsed.hexagrams[n].bookHexFont = String(row.hex_font ?? "");
    try {
      parsed.hexagrams[n].fields = parseHexBlock(n, block, row, { chinese, title });
    } catch (err) {
      if (opts.require64 !== false) throw err;
      parsed.hexagrams[n].parseError = String(err);
      delete parsed.hexagrams[n];
    }
  }

  return parsed;
}

export function validateWilhelmDe64HexStructure(parsed) {
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
    if (!f.judgment_oraculo) errors.push(`hex ${n}: empty judgment_oraculo`);
    if (!f.image_oraculo) errors.push(`hex ${n}: empty image_oraculo`);
    for (let p = 1; p <= 6; p++) {
      if (!f[`L${p}_oraculo`]) errors.push(`hex ${n}: missing L${p}_oraculo`);
    }
    if (n === 1 || n === 2) {
      if (!f.yong_oraculo) errors.push(`hex ${n}: missing yong_oraculo`);
    }
  }

  return {
    pass: errors.length === 0,
    errors,
    warnings,
    fieldCount: WILHELM_MANUAL_FIELDS.length,
  };
}

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

export { txtFieldsToOracleGold as deTxtFieldsToOracleGold };
