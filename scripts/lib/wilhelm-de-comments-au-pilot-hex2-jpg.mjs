/**
 * Wilhelm DE comments AU — hex 2 pilot (JPG pp. 328–336 verified).
 * QA code: AU-FID-W-022 · v1.0.0
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  bookQuotes,
  cleanCommentaryDecision,
  cleanWenYen,
  extractCommentaryImageFromImageOracleBlob,
  extractImageOracleTwoLines,
  extractLineAFromFirstQuoteLine,
  extractYongAFromB,
  fixHyphens,
  loadErstesJudgmentEcho,
} from "./wilhelm-de-comments-au-pilot-common.mjs";
import { resolveCommentsChineseRoman } from "./wilhelm-de-comments-erstes-meta.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const PASS02 = join(
  ROOT,
  "tools/datasets/wilhelm-de/comments/anna/wilhelm-de-64hex-comments-anna-pass02.json",
);

/** @param {string} raw */
export function fixHex2RulerNoteFromJpg(raw) {
  let t = fixHyphens(raw);
  t = t.replace(/^Kernzeichen: Kun und Kun\s*\n(?:He\s*\n)?/, "");
  t = t.replace(/^err des Zeichens/, "Herr des Zeichens");
  t = t.replace(
    /den als ,,?weich",,,hingebend",,,maßvoll", d\. h\. zentral,,,?recht", d\. h\. weich auf\s*\n?weichem Platz,/,
    'den als „weich", „hingebend", „maßvoll", d. h. zentral, „recht", d. h. weich auf weichem Platz,',
  );
  return bookQuotes(t).trim();
}

/** @param {string} raw */
export function fixHex2L3BFromJpg(raw) {
  return bookQuotes(fixHyphens(raw))
    .replace(
      /herausgehen\.,,?Geht man in die Dienste eines Königs" - das/,
      'herausgehen. „Geht man in die Dienste eines Königs" — das',
    )
    .trim();
}

/** @param {string} raw */
export function fixHex2L5BFromJpg(raw) {
  return bookQuotes(fixHyphens(raw)).replace(/^""\n,?/m, "„").trim();
}

/** @param {string} raw */
export function fixHex2L6BFromJpg(raw) {
  return bookQuotes(fixHyphens(raw)).replace(/^"Drachen/, "„Drachen").trim();
}

/** @param {string} bRaw */
export function extractHex2L2AFromB(bRaw) {
  const t = bookQuotes(fixHyphens(bRaw));
  const m = t.match(/„Ohne Absicht bleibt nichts ungefördert";/);
  return m?.[0] ?? extractLineAFromFirstQuoteLine(bRaw);
}

/** @param {string} bRaw */
export function fixHex2L2BFromJpg(bRaw) {
  return bookQuotes(fixHyphens(bRaw)).replace(/\bnadi\b/, "nach").trim();
}

/**
 * @returns {Record<string, { contenido_pdf: string; au_estado: string; jpgPages: string; note?: string }>}
 */
export function buildHex2JpgVerifiedFields() {
  const pass02 = JSON.parse(readFileSync(PASS02, "utf8"));
  const src = pass02.hexagrams["2"].fields;
  const pages = "328-336";

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
    const raw =
      key === "chinese_roman" ? resolveCommentsChineseRoman(2, src[key]) : String(src[key] ?? "");
    out[key] = { contenido_pdf: raw, au_estado: "cerrado", jpgPages: pages };
  }

  out.ruler_note = {
    contenido_pdf: fixHex2RulerNoteFromJpg(src.ruler_note),
    au_estado: "cerrado",
    jpgPages: "328-329",
    note: "JPG p.28–29 Herr + vierfache Charaktere",
  };

  out.sequence = {
    contenido_pdf: "",
    au_estado: "vacio_en_libro",
    jpgPages: pages,
    note: "Hex 2: no Die Reihenfolge in Drittes Buch",
  };

  out.misc_notes = {
    contenido_pdf: bookQuotes(src.misc_notes),
    au_estado: "cerrado",
    jpgPages: "329",
  };

  out.judgment_oraculo = {
    contenido_pdf: loadErstesJudgmentEcho(2),
    au_estado: "cerrado",
    jpgPages: "329",
    note: "JPG p.29 DAS URTEIL echo (cross-check Erstes TSV)",
  };

  out.commentary_decision = {
    contenido_pdf: cleanCommentaryDecision(src.commentary_decision),
    au_estado: "cerrado",
    jpgPages: "329-331",
  };

  out.image_oraculo = {
    contenido_pdf: extractImageOracleTwoLines(src.image_oraculo),
    au_estado: "cerrado",
    jpgPages: "331",
  };

  out.commentary_image = {
    contenido_pdf: extractCommentaryImageFromImageOracleBlob(src.image_oraculo),
    au_estado: "cerrado",
    jpgPages: "331",
  };

  for (let n = 1; n <= 6; n++) {
    out[`L${n}_etiqueta`] = {
      contenido_pdf: String(src[`L${n}_etiqueta`] ?? ""),
      au_estado: "cerrado",
      jpgPages: "331-333",
    };
    const rawB = src[`L${n}_b_comentario`] ?? "";
    let pdf = bookQuotes(fixHyphens(rawB));
    if (n === 2) pdf = fixHex2L2BFromJpg(rawB);
    if (n === 3) pdf = fixHex2L3BFromJpg(rawB);
    if (n === 4) pdf = pdf.replace(/\n-\s*$/, "").trim();
    if (n === 5) pdf = fixHex2L5BFromJpg(rawB);
    if (n === 6) pdf = fixHex2L6BFromJpg(rawB);
    const lineA =
      n === 2 ? extractHex2L2AFromB(rawB) : extractLineAFromFirstQuoteLine(rawB);
    out[`L${n}_a_oraculo`] = {
      contenido_pdf: lineA,
      au_estado: "cerrado",
      jpgPages: "331-333",
    };
    out[`L${n}_b_comentario`] = {
      contenido_pdf: pdf,
      au_estado: "cerrado",
      jpgPages: "331-333",
    };
  }

  out.yong_etiqueta = {
    contenido_pdf: String(src.yong_etiqueta ?? ""),
    au_estado: "cerrado",
    jpgPages: "333",
  };
  out.yong_a_oraculo = {
    contenido_pdf: extractYongAFromB(src.yong_b_comentario ?? ""),
    au_estado: "cerrado",
    jpgPages: "333",
  };
  out.yong_b_comentario = {
    contenido_pdf: bookQuotes(fixHyphens(src.yong_b_comentario)),
    au_estado: "cerrado",
    jpgPages: "333",
  };

  out.wen_yen = {
    contenido_pdf: cleanWenYen(src.wen_yen),
    au_estado: "cerrado",
    jpgPages: "333-336",
  };

  out.wen_yen_note = {
    contenido_pdf: bookQuotes(fixHyphens(src.wen_yen_note)),
    au_estado: "cerrado",
    jpgPages: "336",
    note: "JPG Anmerkung — Kiän (not Klän)",
  };

  return out;
}
