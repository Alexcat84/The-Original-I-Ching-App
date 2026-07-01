/**
 * Wilhelm DE comments AU — hex 3 pilot (JPG pp. 337–342 verified).
 * QA code: AU-FID-W-024 · v1.0.0
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  bookQuotes,
  cleanCommentaryDecision,
  cleanLineBCommon,
  cleanSequenceWing9,
  extractCommentaryImageAfterOracleEcho,
  extractImageOracleTwoLines,
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
export function fixHex3RulerNoteFromJpg(raw) {
  let t = fixHyphens(raw);
  t = t.replace(/^Gen und Kun\s*\n/, "");
  t = t.replace(/^as Zeichen Dschun/, "Das Zeichen Dschun");
  t = t.replace(
    /die Anfangsneun und die Neun auf fünftem(?: Platz)?\s*\nDas\s*\nneun ist unten/,
    "die Anfangsneun und die Neun auf fünftem Platz zu Herren. Das Zeichen hat nur diese beiden Yang. Die Anfangsneun ist unten",
  );
  if (!t.includes("zu Herren")) {
    t = t.replace(
      /(die Anfangsneun und die Neun auf fünftem Platz)(?! zu Herren)/,
      "$1 zu Herren. Das Zeichen hat nur diese beiden Yang",
    );
  }
  return bookQuotes(t).trim();
}

/** @param {string} raw */
export function fixHex3L3BFromJpg(raw) {
  return cleanLineBCommon(raw)
    .replace(
      /^"Er jagt den Hirsch ohne Förster",\nd\. h\. er begehrt das Wild\.\n,,Der Edle/,
      '„Er jagt den Hirsch ohne Förster", d. h. er begehrt das Wild. „Der Edle',
    )
    .replace(/,,Der Edle/, "„Der Edle")
    .replace(/Beschämung\."\nEs führt/, 'Beschämung." Es führt')
    .trim();
}

/** @param {string} raw */
export function fixHex3L5BFromJpg(raw) {
  return cleanLineBCommon(raw)
    .replace(/^Schwierigkeiten im Segnen";/, '„Schwierigkeiten im Segnen";')
    .replace(/Rivale\n\.in Betracht/, "Rivale in Betracht")
    .trim();
}

/** @param {string} raw */
export function fixHex3L6BFromJpg(raw) {
  let t = cleanLineBCommon(raw);
  t = t.replace(/^Blutige Tränen/, '„Blutige Tränen');
  t = t.replace(
    /schwachen Plätze 2, 4, 6 sind auf Hilfe von außen angewiesen: "wenn nur/,
    'schwachen Plätze 2, 4, 6 sind auf Hilfe von außen angewiesen: „wenn nur',
  );
  t = t.replace(/mich mitnähme"\./, 'mich mitnähme".');
  return t.trim();
}

/**
 * @returns {Record<string, { contenido_pdf: string; au_estado: string; jpgPages: string; note?: string }>}
 */
export function buildHex3JpgVerifiedFields() {
  const pass02 = JSON.parse(readFileSync(PASS02, "utf8"));
  const src = pass02.hexagrams["3"].fields;
  const pages = "337-342";

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
      key === "chinese_roman" ? resolveCommentsChineseRoman(3, src[key]) : String(src[key] ?? "");
    out[key] = { contenido_pdf: raw, au_estado: "cerrado", jpgPages: pages };
  }

  out.ruler_note = {
    contenido_pdf: fixHex3RulerNoteFromJpg(src.ruler_note),
    au_estado: "cerrado",
    jpgPages: "337",
    note: "JPG p.37 Das Zeichen Dschun + Herren",
  };

  out.sequence = {
    contenido_pdf: cleanSequenceWing9(src.sequence),
    au_estado: "cerrado",
    jpgPages: "338",
    note: "JPG p.38 Die Reihenfolge",
  };

  out.misc_notes = {
    contenido_pdf: bookQuotes(fixHyphens(src.misc_notes)),
    au_estado: "cerrado",
    jpgPages: "338",
  };

  out.judgment_oraculo = {
    contenido_pdf: loadErstesJudgmentEcho(3),
    au_estado: "cerrado",
    jpgPages: "338",
  };

  out.commentary_decision = {
    contenido_pdf: cleanCommentaryDecision(src.commentary_decision),
    au_estado: "cerrado",
    jpgPages: "338-339",
  };

  out.image_oraculo = {
    contenido_pdf: extractImageOracleTwoLines(src.image_oraculo),
    au_estado: "cerrado",
    jpgPages: "339",
  };

  out.commentary_image = {
    contenido_pdf: extractCommentaryImageAfterOracleEcho(src.image_oraculo),
    au_estado: "cerrado",
    jpgPages: "339",
  };

  for (let n = 1; n <= 6; n++) {
    out[`L${n}_etiqueta`] = {
      contenido_pdf: String(src[`L${n}_etiqueta`] ?? ""),
      au_estado: "cerrado",
      jpgPages: "339-342",
    };
    const rawB = src[`L${n}_b_comentario`] ?? "";
    let pdf = cleanLineBCommon(rawB);
    if (n === 3) pdf = fixHex3L3BFromJpg(rawB);
    if (n === 5) pdf = fixHex3L5BFromJpg(rawB);
    if (n === 6) pdf = fixHex3L6BFromJpg(rawB);
    if (n === 4) pdf = pdf.replace(/Klarheit,\n/, "Klarheit.\n");
    out[`L${n}_a_oraculo`] = {
      contenido_pdf: bookQuotes(fixHyphens(src[`L${n}_a_oraculo`] ?? "")),
      au_estado: "cerrado",
      jpgPages: "339-342",
    };
    out[`L${n}_b_comentario`] = {
      contenido_pdf: pdf,
      au_estado: "cerrado",
      jpgPages: "339-342",
    };
  }

  for (const key of ["yong_etiqueta", "yong_a_oraculo", "yong_b_comentario", "wen_yen", "wen_yen_note"]) {
    out[key] = {
      contenido_pdf: String(src[key] ?? ""),
      au_estado: key.startsWith("yong") || key.startsWith("wen") ? "vacio_en_libro" : "cerrado",
      jpgPages: pages,
    };
  }

  return out;
}
