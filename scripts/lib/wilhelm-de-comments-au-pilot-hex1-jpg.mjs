/**
 * Wilhelm DE comments AU — hex 1 pilot contenido_pdf (JPG 316–327 verified).
 * QA code: AU-FID-W-018 · v1.0.0
 * Area: scripts/lib/wilhelm-de-comments-au-pilot-hex1-jpg.mjs
 * Family: FID-W
 *
 * Source: 585 JPG scan pages 301-400-page-016..027 (book pp. 1–12 of Drittes Buch).
 * Do not promote from pass02/04/reconciled — only from returned contenido_pdf.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeWilhelmDeAuBookText } from "./wilhelm-de-comments-anna-au-gold.mjs";
import { resolveCommentsChineseRoman } from "./wilhelm-de-comments-erstes-meta.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const PASS02 = join(
  ROOT,
  "tools/datasets/wilhelm-de/comments/anna/wilhelm-de-64hex-comments-anna-pass02.json",
);

/** @param {string} t */
function fixHyphens(t) {
  return String(t ?? "").replace(/-\n(?=[a-zäöüß])/gi, "");
}

/** Opening ,, → „ per 1924 Diederichs scan (pages 4–5). */
/** @param {string} t */
function bookQuotes(t) {
  return fixHyphens(t).replace(/,,(?=[A-ZÄÖÜ„"])/g, "„");
}

/**
 * JPG page 16: Herr (not err); Weg des Himmels + Bild des Himmels (not OCR be-Himmels).
 * @param {string} raw
 */
export function fixHex1RulerNoteFromJpg(raw) {
  let t = fixHyphens(raw);
  t = t.replace(/^Kiän und\s*\nKiän\s*\n/, "");
  t = t.replace(/^err des Zeichens/, "Herr des Zeichens");
  t = t.replace(
    /Das Schöpferische be(?:-|\s)?(?:zeichnet den Weg zum Himmel und die Bewegung nach oben|Himmels)\.\s*Andererseits/,
    "Das Schöpferische bezeichnet den Weg des Himmels, und der fünfte Platz ist das Bild des Himmels. Andererseits",
  );
  return t.trim();
}

/** JPG page 19: hinführt (not hin- und herführt). */
/** @param {string} raw */
export function fixHex1L3FromJpg(raw) {
  return bookQuotes(fixHyphens(raw))
    .replace(/hinund herführt/, "hinführt")
    .replace(/hin- und herführt/, "hinführt")
    .trim();
}

/** @param {string} raw */
export function hex1CommentaryImageFromBook(raw) {
  const t = bookQuotes(fixHyphens(raw));
  const verdStart = t.indexOf("Die Verdoppelung des Zeichens");
  const lineStart = t.indexOf("\nAnfangs Neun:");
  if (verdStart === -1 || lineStart === -1) {
    return t.split("\nAnfangs Neun:")[0]?.trim() ?? t;
  }
  const bemerkung = t.slice(0, verdStart).trim();
  const verd = t.slice(verdStart, lineStart).trim();
  return `${bemerkung}\n\n${verd}`.trim();
}

/** First quoted oracle line in L*_b (JPG Kleine Bilder). */
/** @param {string} bRaw */
export function extractHex1LineAFromB(bRaw) {
  const line = bookQuotes(fixHyphens(bRaw)).split("\n")[0]?.trim() ?? "";
  return line;
}

/** @param {string} yongBRaw */
export function extractHex1YongAFromB(yongBRaw) {
  const t = bookQuotes(fixHyphens(yongBRaw));
  const m = t.match(/^([„"][^\n]+(?:\n[^\n"]+)?["""])/);
  if (m) return m[1].replace(/\n/g, " ").trim();
  return t.split("\n")[0]?.trim() ?? "";
}

/** JPG page 20: no em dash paragraph break before „Hier ist der Herr…". */
/** @param {string} raw */
export function fixHex1L5FromJpg(raw) {
  return bookQuotes(raw)
    .replace(/\n—\n(?=Hier ist der Herr)/, "\n")
    .trim();
}

/** @param {string} raw */
export function fixHex1LineBFromJpg(raw) {
  let t = bookQuotes(raw);
  t = t.replace(/\n""\n/, "\n");
  return t.trim();
}

/**
 * @returns {Record<string, { contenido_pdf: string; au_estado: string; jpgPages: string; note?: string }>}
 */
export function buildHex1JpgVerifiedFields() {
  const pass02 = JSON.parse(readFileSync(PASS02, "utf8"));
  const src = pass02.hexagrams["1"].fields;

  /** @type {Record<string, { contenido_pdf: string; au_estado: string; jpgPages: string; note?: string }>} */
  const out = {};
  const pages = "316-327";

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
    const raw = key === "chinese_roman" ? resolveCommentsChineseRoman(1, src[key]) : String(src[key] ?? "");
    out[key] = {
      contenido_pdf: raw,
      au_estado: "cerrado",
      jpgPages: pages,
      note: "JPG p.316 (book p.1 header)",
    };
  }

  out.ruler_note = {
    contenido_pdf: fixHex1RulerNoteFromJpg(src.ruler_note),
    au_estado: "cerrado",
    jpgPages: pages,
    note: "JPG p.316 Kernzeichen block — Herr + Himmel sentence",
  };

  out.sequence = {
    contenido_pdf: "",
    au_estado: "vacio_en_libro",
    jpgPages: pages,
    note: "Hex 1: no Die Reihenfolge in Drittes Buch",
  };

  out.misc_notes = {
    contenido_pdf: bookQuotes(src.misc_notes),
    au_estado: "cerrado",
    jpgPages: pages,
    note: "JPG p.316 Vermischte Zeichen",
  };

  out.judgment_oraculo = {
    contenido_pdf:
      "Das Schöpferische wirkt erhabenes Gelingen, fördernd durch Beharrlichkeit.",
    au_estado: "cerrado",
    jpgPages: pages,
    note: "JPG p.316 DAS URTEIL echo",
  };

  out.commentary_decision = {
    contenido_pdf: bookQuotes(fixHyphens(src.commentary_decision)),
    au_estado: "cerrado",
    jpgPages: "316-318",
    note: "JPG pp.1–3 Kommentar zur Entscheidung",
  };

  out.image_oraculo = {
    contenido_pdf:
      "Des Himmels Bewegung ist kraftvoll.\nSo macht der Edle sich stark und unermüdlich.",
    au_estado: "cerrado",
    jpgPages: "319",
    note: "JPG p.4 DAS BILD oracle echo",
  };

  out.commentary_image = {
    contenido_pdf: hex1CommentaryImageFromBook(src.commentary_image),
    au_estado: "cerrado",
    jpgPages: "319",
    note: "JPG p.4 Bemerkung + Verdoppelung (sin líneas)",
  };

  for (let n = 1; n <= 6; n++) {
    out[`L${n}_etiqueta`] = {
      contenido_pdf: String(src[`L${n}_etiqueta`] ?? ""),
      au_estado: "cerrado",
      jpgPages: "316-320",
    };
    const rawB = src[`L${n}_b_comentario`] ?? "";
    let pdf = bookQuotes(fixHyphens(rawB));
    if (n === 1 || n === 2) pdf = fixHex1LineBFromJpg(rawB);
    if (n === 3) pdf = fixHex1L3FromJpg(rawB);
    if (n === 5) pdf = fixHex1L5FromJpg(rawB);
    out[`L${n}_a_oraculo`] = {
      contenido_pdf: extractHex1LineAFromB(rawB),
      au_estado: "cerrado",
      jpgPages: "319-320",
    };
    out[`L${n}_b_comentario`] = {
      contenido_pdf: pdf,
      au_estado: "cerrado",
      jpgPages: "316-320",
      note: n <= 3 || n === 5 ? "JPG quote/dispute fix" : undefined,
    };
  }

  out.yong_etiqueta = {
    contenido_pdf: String(src.yong_etiqueta ?? ""),
    au_estado: "cerrado",
    jpgPages: "320",
  };
  out.yong_a_oraculo = {
    contenido_pdf: extractHex1YongAFromB(src.yong_b_comentario ?? ""),
    au_estado: "cerrado",
    jpgPages: "320",
  };
  out.yong_b_comentario = {
    contenido_pdf: bookQuotes(fixHyphens(src.yong_b_comentario)),
    au_estado: "cerrado",
    jpgPages: "320",
  };

  out.wen_yen = {
    contenido_pdf: bookQuotes(fixHyphens(src.wen_yen)),
    au_estado: "cerrado",
    jpgPages: "320-327",
    note: "JPG pp.5+ Kommentar zu den Textworten",
  };

  out.wen_yen_note = {
    contenido_pdf: bookQuotes(fixHyphens(src.wen_yen_note)),
    au_estado: "cerrado",
    jpgPages: "320",
    note: "JPG p.5 Vorbemerkung Wen Yän",
  };

  return out;
}

/**
 * @param {Record<string, { contenido_pdf: string; au_estado: string }>} fields
 */
export function serializeHex1PilotFields(fields) {
  /** @type {Record<string, string>} */
  const norm = {};
  for (const [k, v] of Object.entries(fields)) {
    norm[k] = normalizeWilhelmDeAuBookText(v.contenido_pdf);
  }
  return norm;
}
