/**
 * Build Wilhelm DE manual gold TSV from book TXT with AU field boundaries.
 * Boundaries calibrated against 300 DPI scans (PLAN-DAT-W-03).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_MANUAL_FIELDS, WILHELM_HEX_FIN } from "./wilhelm-manual-fields.mjs";
import { normalizeWilhelmDeTxtText } from "./wilhelm-de-64hex-txt.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const BOOK_TXT = join(ROOT, "tools/source-pdfs/W german/wilhelm-de-erstes-buch-pass03.txt");
const GOLD_DIR = join(ROOT, "tools/manual-gold");
const SOURCE_TAG = "libro-fisico-300dpi";

const JUDGMENT_RE = /^DAS URTEIL\s*$/i;
const IMAGE_RE = /^DAS BILD\s*$/i;
const LINES_HEADER_RE = /^Die einzelnen Linien(?:[\u00b9\u00b2\u00b3\d])?\s*:\s*$/i;
const LINE_LABEL_RE =
  /^(?:O\s+)?(?:Anfangs|Oben)\s+(?:eine\s+)?(?:Neun|Sechs)\s+bedeutet:|^(?:O\s+)?(?:Neun|Sechs)\s+auf\s+(?:zweitem|drittem|viertem|f[üu]nftem)\s+Platz\s+bedeutet:/i;
const YONG_LABEL_RE = /^Wenn lauter (?:Neunen|Sechsen) erscheinen/i;
const NEXT_HEX_RE = /^\d+\.\s+[A-ZÄÖÜ]+\s+\/\s+DAS\s+/i;

/**
 * @param {string} line
 */
function cleanAuLine(line) {
  return String(line ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/^--- page \d+ ---$/i, "")
    .replace(/^~~~~+\s*$/, "")
    .replace(/^\d+\s*$/, "")
    .replace(/^NYPL RESEARCH LIBRARIES.*$/i, "")
    .replace(/^[#*@\s]{4,}.*$/, "")
    .trim();
}

/**
 * @param {string[]} lines
 */
function stripFootnoteBlocks(lines) {
  /** @type {string[]} */
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const t = cleanAuLine(lines[i]);
    if (!t) {
      i++;
      continue;
    }
    if (/^¹\s/.test(t) || /^\*\s/.test(t) || /^1\s*Das Buch der Wandlungen$/i.test(t)) {
      i++;
      while (i < lines.length) {
        const n = cleanAuLine(lines[i]);
        if (!n || NEXT_HEX_RE.test(n) || JUDGMENT_RE.test(n) || LINE_LABEL_RE.test(n)) break;
        if (/^(?:Neun|Sechs|Anfangs|Oben|O Neun|Wenn lauter)/i.test(n)) break;
        i++;
      }
      continue;
    }
    if (/^Strich, und seine Sonderbedeutung/i.test(t)) {
      i++;
      while (i < lines.length) {
        const n = cleanAuLine(lines[i]);
        if (!n || /^hinein\./i.test(n) || LINE_LABEL_RE.test(n)) break;
        i++;
      }
      continue;
    }
    out.push(t);
    i++;
  }
  return out;
}

/**
 * @param {string[]} lines
 * @param {number} start
 */
function sliceUntil(lines, start, stopRes) {
  /** @type {string[]} */
  const chunk = [];
  let i = start;
  while (i < lines.length) {
    const t = cleanAuLine(lines[i]);
    if (!t) {
      i++;
      continue;
    }
    if (stopRes.some((re) => re.test(t))) break;
    chunk.push(t);
    i++;
  }
  return { chunk, next: i };
}

/**
 * @param {string[]} chunk
 * @param {number} oracleLineCount
 */
function splitLineBlock(chunk, oracleLineCount = 1) {
  const cleaned = stripFootnoteBlocks(chunk);
  if (cleaned.length <= oracleLineCount) {
    return { oracle: cleaned.join("\n"), commentary: "" };
  }
  return {
    oracle: cleaned.slice(0, oracleLineCount).join("\n"),
    commentary: cleaned.slice(oracleLineCount).join("\n"),
  };
}

/**
 * @param {string[]} lines
 * @param {number} n
 */
export function extractWilhelmDeAuFieldsFromBookLines(lines, n) {
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = cleanAuLine(lines[i]);
    if (new RegExp(`^${n}\\.\\s+`, "i").test(t) && /DAS\s+/i.test(t)) {
      start = i;
      break;
    }
  }

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const t = cleanAuLine(lines[i]);
    if (NEXT_HEX_RE.test(t) && !new RegExp(`^${n}\\.`).test(t)) {
      end = i;
      break;
    }
  }

  const block = lines.slice(start, end);
  const jIdx = block.findIndex((l) => JUDGMENT_RE.test(cleanAuLine(l)));
  const iIdx = block.findIndex((l) => IMAGE_RE.test(cleanAuLine(l)));
  const lIdx = block.findIndex((l) => LINES_HEADER_RE.test(cleanAuLine(l)));

  const headerLines = block.slice(0, jIdx).map(cleanAuLine).filter(Boolean);
  const titleLine = headerLines.find((l) => /^\d+\./.test(l)) ?? "";
  const nombre = titleLine.split("/").pop()?.trim() ?? "";
  const chineseRoman = titleLine.split("/")[0]?.replace(/^\d+\.\s*/, "").trim() ?? "";

  const trigramLines = headerLines.filter((l) => /^oben|^unten/i.test(l));
  const introLines = headerLines.filter(
    (l) => !/^\d+\./.test(l) && !/^oben|^unten/i.test(l) && !/^[乾坤].*$/.test(l),
  );
  let intro = introLines.join("\n").replace(/^as Zeichen/, "Das Zeichen");
  const introFoot = block
    .slice(jIdx)
    .map(cleanAuLine)
    .find((l) => /^¹ Das Zeichen ist dem 4\. Monat/.test(l));
  if (introFoot) intro = `${intro}\n${introFoot}`;

  const judgmentBody = block.slice(jIdx + 1, iIdx).map(cleanAuLine).filter(Boolean);
  const jOracleEnd = judgmentBody.findIndex((l) => /^Dem ursprünglichen Sinne nach/i.test(l));
  const judgment_oraculo =
    jOracleEnd > 0
      ? judgmentBody.slice(0, jOracleEnd).join("\n")
      : judgmentBody.slice(0, 2).join("\n");
  const judgment_comentario = normalizeWilhelmDeTxtText(
    judgmentBody.slice(jOracleEnd > 0 ? jOracleEnd : 2).join("\n").replace(/^~~~~\n?/m, ""),
  );

  const imageBody = block.slice(iIdx + 1, lIdx >= 0 ? lIdx : block.length).map(cleanAuLine).filter(Boolean);
  const image_oraculo = imageBody.slice(0, 2).join("\n");
  const image_comentario = normalizeWilhelmDeTxtText(
    imageBody.slice(2).join("\n").replace(/^~~~~\n?/m, ""),
  );

  /** @type {Record<string, string>} */
  const fields = {
    hex: String(n),
    nombre,
    chinese: n === 1 ? "乾" : n === 2 ? "坤" : n === 8 ? "比" : "",
    chinese_roman: chineseRoman,
    hex_font: n === 1 ? "䷀" : n === 2 ? "䷁" : n === 8 ? "䷇" : "",
    trigrama_arriba: trigramLines[0] ?? "",
    trigrama_abajo: trigramLines[1] ?? "",
    intro: normalizeWilhelmDeTxtText(intro),
    judgment_oraculo: normalizeWilhelmDeTxtText(judgment_oraculo),
    judgment_comentario,
    image_oraculo: normalizeWilhelmDeTxtText(image_oraculo),
    image_comentario,
  };

  const linesBody = lIdx >= 0 ? block.slice(lIdx + 1) : [];
  /** @type {{ label: string; oracle: string; commentary: string } | null} */
  let yong = null;
  let i = 0;
  while (i < linesBody.length) {
    const t = cleanAuLine(linesBody[i]);
    if (!t) {
      i++;
      continue;
    }
    if (YONG_LABEL_RE.test(t)) {
      const { chunk, next } = sliceUntil(linesBody, i + 1, [NEXT_HEX_RE, /^\d+\.\s+/]);
      const parts = splitLineBlock([t, ...chunk], 1);
      yong = { label: t, ...parts };
      if (chunk.some((l) => /^坤$/.test(cleanAuLine(l)))) {
        yong.oracle = `${parts.oracle}\n坤`.trim();
      }
      i = next;
      continue;
    }
    if (LINE_LABEL_RE.test(t)) {
      const pos = /Anfangs|zweitem|drittem|viertem|fünftem|Oben/i.exec(t);
      let p = 0;
      if (/Anfangs/i.test(t)) p = 1;
      else if (/zweitem/i.test(t)) p = 2;
      else if (/drittem/i.test(t)) p = 3;
      else if (/viertem/i.test(t)) p = 4;
      else if (/f[üu]nftem/i.test(t)) p = 5;
      else if (/Oben/i.test(t)) p = 6;

      const { chunk, next } = sliceUntil(linesBody, i + 1, [
        LINE_LABEL_RE,
        YONG_LABEL_RE,
        NEXT_HEX_RE,
      ]);
      const oracleLines =
        p === 1 ? 1 : p === 2 ? 2 : p === 3 ? 4 : p === 4 ? 1 : p === 5 ? 2 : p === 6 ? 1 : 1;
      const split = splitLineBlock([t, ...chunk], oracleLines + 1);
      const oracleOnly = splitLineBlock(chunk, oracleLines);
      if (p >= 1 && p <= 6) {
        fields[`L${p}_etiqueta`] = t;
        fields[`L${p}_oraculo`] = normalizeWilhelmDeTxtText(oracleOnly.oracle);
        fields[`L${p}_comentario`] = normalizeWilhelmDeTxtText(oracleOnly.commentary);
      }
      i = next;
      continue;
    }
    i++;
  }

  if (yong) {
    fields.yong_etiqueta = yong.label;
    fields.yong_oraculo = normalizeWilhelmDeTxtText(yong.oracle.replace(yong.label, "").trim());
    fields.yong_comentario = normalizeWilhelmDeTxtText(yong.commentary);
  }

  for (const { key } of WILHELM_MANUAL_FIELDS) {
    if (!fields[key]) fields[key] = "";
  }

  return fields;
}

/**
 * @param {Record<string, string>} fields
 */
function toTsv(fields) {
  const lines = ["campo\tcontenido_de\tfuente_captura"];
  for (const { key } of WILHELM_MANUAL_FIELDS) {
    const value = String(fields[key] ?? "")
      .replace(/\t/g, " ")
      .replace(/\r?\n/g, "\\n");
    lines.push(`${key}\t${value}\t${SOURCE_TAG}`);
  }
  lines.push(`${WILHELM_HEX_FIN}\t\t`);
  return `${lines.join("\n")}\n`;
}

/**
 * @param {number[]} hexList
 */
export async function writeWilhelmDeAuGoldTsv(hexList) {
  const raw = await readFile(BOOK_TXT, "utf8");
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  await mkdir(GOLD_DIR, { recursive: true });
  /** @type {Record<number, Record<string, string>>} */
  const out = {};
  for (const n of hexList) {
    const fields = extractWilhelmDeAuFieldsFromBookLines(lines, n);
    const path = join(GOLD_DIR, `wilhelm-de-hex-${n}.tsv`);
    await writeFile(path, toTsv(fields), "utf8");
    out[n] = fields;
    console.log(`Wrote ${path}`);
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  const hexArg = process.argv.find((a) => a.startsWith("--hex="));
  const hexList = hexArg
    ? hexArg.slice(6).split(",").map((s) => Number(s.trim()))
    : [1, 2, 8];
  writeWilhelmDeAuGoldTsv(hexList).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
