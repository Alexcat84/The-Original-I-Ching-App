/**
 * Generic Wilhelm DE comments AU pilot builder (pass02 + common JPG fixes).
 * Per-hex overrides in wilhelm-de-comments-au-pilot-hex-overrides.mjs
 * QA code: AU-FID-W-025 · v1.0.0
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  bookQuotes,
  cleanPassArtifacts,
  cleanRulerNote,
  pickBestPassText,
  cleanCommentaryDecision,
  cleanLineBCommon,
  cleanSequenceWing9,
  extractCommentaryImageAfterOracleEcho,
  extractCommentaryImageFromImageOracleBlob,
  extractImageOracleTwoLines,
  extractLineAFromFirstQuoteLine,
  extractYongAFromB,
  fixHyphens,
  isGarbageCommentaryExtract,
  loadErstesField,
  loadErstesJudgmentEcho,
  stripTrailingOcrGarbage,
  trimCommentaryLeadingGarbage,
} from "./wilhelm-de-comments-au-pilot-common.mjs";
import { hex1CommentaryImageFromBook } from "./wilhelm-de-comments-au-pilot-hex1-jpg.mjs";
import { HEX_OVERRIDES } from "./wilhelm-de-comments-au-pilot-hex-overrides.mjs";
import { buildWilhelmDeCommentsAnnaCompareRows } from "./wilhelm-de-comments-anna-reconcile.mjs";
import { normalizeWilhelmDeAuBookText } from "./wilhelm-de-comments-anna-au-gold.mjs";
import { resolveCommentsChineseRoman } from "./wilhelm-de-comments-erstes-meta.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const PASS02 = join(
  ROOT,
  "tools/datasets/wilhelm-de/comments/anna/wilhelm-de-64hex-comments-anna-pass02.json",
);
const PASS04 = join(
  ROOT,
  "tools/datasets/wilhelm-de/comments/anna/wilhelm-de-64hex-comments-anna-pass04.json",
);
const HEX_STARTS = join(ROOT, "tools/datasets/wilhelm-de/wilhelm-de-comments-hex-starts.json");

/** @param {number} hex */
function sequenceEmptyInBook(hex) {
  return hex === 1 || hex === 2;
}

/** @param {string} raw @param {number} hex */
function defaultSequence(raw, hex) {
  if (sequenceEmptyInBook(hex)) return "";
  const cleaned = cleanSequenceWing9(raw);
  return cleaned.trim() ? cleaned : bookQuotes(fixHyphens(raw));
}

/** @param {string} raw @param {number} hex @param {string} [imageEcho] @param {string} [fallbackRaw] */
function defaultCommentaryImage(raw, hex, imageEcho = "", fallbackRaw = "") {
  if (hex === 1) return hex1CommentaryImageFromBook(raw);
  let extracted = extractCommentaryImageAfterOracleEcho(raw);
  if (imageEcho && extracted) {
    const ne = normalizeWilhelmDeAuBookText(imageEcho);
    const nx = normalizeWilhelmDeAuBookText(extracted);
    if (nx.startsWith(ne.slice(0, Math.min(40, ne.length)))) {
      extracted = extracted.slice(imageEcho.length).trim();
    }
  }
  const fallback = cleanPassArtifacts(fallbackRaw);
  if (extracted && !isGarbageCommentaryExtract(extracted)) {
    return cleanPassArtifacts(extracted);
  }
  if (fallback && !isGarbageCommentaryExtract(fallback)) {
    return stripTrailingOcrGarbage(trimCommentaryLeadingGarbage(fallback));
  }
  const fromKun = extractCommentaryImageFromImageOracleBlob(raw);
  if (fromKun && !isGarbageCommentaryExtract(fromKun)) return cleanPassArtifacts(fromKun);
  return fallback || cleanPassArtifacts(raw);
}

/** @param {string} raw @param {number} n @param {import('./wilhelm-de-comments-au-pilot-hex-overrides.mjs').HexOverride} ov */
function defaultLineB(raw, n, ov) {
  const fn = ov?.lineB?.[n];
  if (fn) return fn(raw);
  return cleanLineBCommon(raw);
}

/** @param {string} raw @param {number} n @param {Record<string,string>} src */
function defaultLineA(raw, n, src) {
  const fromField = src[`L${n}_a_oraculo`]?.trim();
  if (fromField) return bookQuotes(fixHyphens(fromField));
  return extractLineAFromFirstQuoteLine(raw);
}

/**
 * @param {number} hex
 * @returns {Record<string, { contenido_pdf: string; au_estado: string; jpgPages: string; note?: string }>}
 */
export function buildGenericHexJpgVerifiedFields(hex) {
  const pass02Doc = JSON.parse(readFileSync(PASS02, "utf8"));
  const pass04Doc = JSON.parse(readFileSync(PASS04, "utf8"));
  const compare = buildWilhelmDeCommentsAnnaCompareRows(pass02Doc, pass04Doc).filter(
    (r) => r.hex === hex,
  );
  const byField = Object.fromEntries(compare.map((r) => [r.field, r]));
  const hexStarts = JSON.parse(readFileSync(HEX_STARTS, "utf8"));
  const row = hexStarts.starts.find((s) => s.hex === hex);
  const pages = row ? `${row.bookPage}-${row.endBookPage}` : "";
  const src = pass02Doc.hexagrams[String(hex)]?.fields ?? {};
  const ov = HEX_OVERRIDES[hex] ?? {};

  /** @param {string} field */
  const resolve = (field) => {
    const p2 = String(src[field] ?? "");
    const p4 = String(pass04Doc.hexagrams[String(hex)]?.fields?.[field] ?? "");
    return cleanPassArtifacts(pickBestPassText(p2, p4));
  };

  /** @type {Record<string, { contenido_pdf: string; au_estado: string; jpgPages: string; note?: string }>} */
  const out = {};
  const metaKeys = [
    "hex",
    "nombre",
    "chinese",
    "chinese_roman",
    "hex_font",
    "trigrama_arriba",
    "trigrama_abajo",
  ];
  for (const key of metaKeys) {
    let pdf = resolve(key);
    if (key === "nombre" && !pdf.trim()) pdf = loadErstesField(hex, "nombre");
    if (key === "chinese_roman") pdf = resolveCommentsChineseRoman(hex, pdf);
    out[key] = { contenido_pdf: pdf, au_estado: "cerrado", jpgPages: pages };
  }

  out.ruler_note = {
    contenido_pdf: ov.fixRulerNote?.(resolve("ruler_note")) ?? cleanRulerNote(resolve("ruler_note")),
    au_estado: "cerrado",
    jpgPages: pages,
  };

  const seqRaw = resolve("sequence");
  const seqPdf = ov.fixSequence?.(seqRaw) ?? defaultSequence(seqRaw, hex);
  out.sequence = {
    contenido_pdf: seqPdf,
    au_estado: sequenceEmptyInBook(hex) && !seqPdf.trim() ? "vacio_en_libro" : "cerrado",
    jpgPages: pages,
  };

  out.misc_notes = {
    contenido_pdf: ov.fixMiscNotes?.(resolve("misc_notes")) ?? bookQuotes(fixHyphens(resolve("misc_notes"))),
    au_estado: "cerrado",
    jpgPages: pages,
  };

  const judgment =
    ov.judgmentOracle ??
    (loadErstesJudgmentEcho(hex) || bookQuotes(fixHyphens(src.judgment_oraculo ?? "")));
  out.judgment_oraculo = {
    contenido_pdf: judgment,
    au_estado: "cerrado",
    jpgPages: pages,
  };

  out.commentary_decision = {
    contenido_pdf:
      ov.fixCommentaryDecision?.(resolve("commentary_decision")) ??
      cleanCommentaryDecision(resolve("commentary_decision")),
    au_estado: "cerrado",
    jpgPages: pages,
  };

  const imageBlob = resolve("image_oraculo") || resolve("commentary_image");
  const imageEcho =
    loadErstesField(hex, "image_oraculo") ||
    extractImageOracleTwoLines(imageBlob) ||
    cleanPassArtifacts(imageBlob);
  out.image_oraculo = {
    contenido_pdf: ov.fixImageOracle?.(imageBlob) ?? imageEcho,
    au_estado: "cerrado",
    jpgPages: pages,
  };

  out.commentary_image = {
    contenido_pdf:
      ov.fixCommentaryImage?.(imageBlob, resolve("commentary_image")) ??
      defaultCommentaryImage(
        imageBlob || resolve("commentary_image"),
        hex,
        imageEcho,
        resolve("commentary_image"),
      ),
    au_estado: "cerrado",
    jpgPages: pages,
  };

  for (let n = 1; n <= 6; n++) {
    out[`L${n}_etiqueta`] = {
      contenido_pdf: resolve(`L${n}_etiqueta`),
      au_estado: "cerrado",
      jpgPages: pages,
    };
    const rawB = resolve(`L${n}_b_comentario`);
    const srcB = src[`L${n}_b_comentario`] ?? "";
    out[`L${n}_a_oraculo`] = {
      contenido_pdf:
        ov.lineA?.[n]?.(rawB, src) ??
        (resolve(`L${n}_a_oraculo`).trim()
          ? bookQuotes(fixHyphens(resolve(`L${n}_a_oraculo`)))
          : defaultLineA(rawB, n, src)),
      au_estado: "cerrado",
      jpgPages: pages,
    };
    out[`L${n}_b_comentario`] = {
      contenido_pdf: defaultLineB(rawB, n, ov),
      au_estado: "cerrado",
      jpgPages: pages,
    };
  }

  if (hex <= 2) {
    out.wen_yen = {
      contenido_pdf: ov.fixWenYen?.(resolve("wen_yen")) ?? bookQuotes(fixHyphens(resolve("wen_yen"))),
      au_estado: "cerrado",
      jpgPages: pages,
    };
    out.wen_yen_note = {
      contenido_pdf:
        ov.fixWenYenNote?.(resolve("wen_yen_note")) ?? bookQuotes(fixHyphens(resolve("wen_yen_note"))),
      au_estado: "cerrado",
      jpgPages: pages,
    };
  } else {
    for (const key of ["wen_yen", "wen_yen_note", "yong_etiqueta", "yong_a_oraculo", "yong_b_comentario"]) {
      out[key] = { contenido_pdf: "", au_estado: "vacio_en_libro", jpgPages: pages };
    }
  }

  return out;
}
