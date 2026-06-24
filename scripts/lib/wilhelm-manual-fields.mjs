/**
 * Canonical vertical field order for Wilhelm manual EPUB transcription.
 * Used by export template and future ingest from Google Sheets.
 */

/** @typedef {{ key: string; label: string; section: string; paste: boolean }} WilhelmManualFieldDef */

/** @type {readonly WilhelmManualFieldDef[]} */
export const WILHELM_MANUAL_FIELDS = [
  { key: "hex", label: "hex", section: "meta", paste: false },
  { key: "nombre", label: "nombre", section: "meta", paste: false },
  { key: "chinese", label: "chinese", section: "meta", paste: false },
  { key: "chinese_roman", label: "chinese_roman", section: "meta", paste: false },
  { key: "hex_font", label: "hex_font", section: "meta", paste: false },
  { key: "trigrama_arriba", label: "trigrama_arriba", section: "meta", paste: false },
  { key: "trigrama_abajo", label: "trigrama_abajo", section: "meta", paste: false },
  { key: "intro", label: "intro", section: "intro", paste: true },
  { key: "judgment_oraculo", label: "judgment_oraculo", section: "judgment", paste: true },
  { key: "judgment_comentario", label: "judgment_comentario", section: "judgment", paste: true },
  { key: "image_oraculo", label: "image_oraculo", section: "image", paste: true },
  { key: "image_comentario", label: "image_comentario", section: "image", paste: true },
  { key: "L1_etiqueta", label: "L1_etiqueta", section: "lines_l1", paste: true },
  { key: "L1_oraculo", label: "L1_oraculo", section: "lines_l1", paste: true },
  { key: "L1_comentario", label: "L1_comentario", section: "lines_l1", paste: true },
  { key: "L2_etiqueta", label: "L2_etiqueta", section: "lines_l2", paste: true },
  { key: "L2_oraculo", label: "L2_oraculo", section: "lines_l2", paste: true },
  { key: "L2_comentario", label: "L2_comentario", section: "lines_l2", paste: true },
  { key: "L3_etiqueta", label: "L3_etiqueta", section: "lines_l3", paste: true },
  { key: "L3_oraculo", label: "L3_oraculo", section: "lines_l3", paste: true },
  { key: "L3_comentario", label: "L3_comentario", section: "lines_l3", paste: true },
  { key: "L4_etiqueta", label: "L4_etiqueta", section: "lines_l4", paste: true },
  { key: "L4_oraculo", label: "L4_oraculo", section: "lines_l4", paste: true },
  { key: "L4_comentario", label: "L4_comentario", section: "lines_l4", paste: true },
  { key: "L5_etiqueta", label: "L5_etiqueta", section: "lines_l5", paste: true },
  { key: "L5_oraculo", label: "L5_oraculo", section: "lines_l5", paste: true },
  { key: "L5_comentario", label: "L5_comentario", section: "lines_l5", paste: true },
  { key: "L6_etiqueta", label: "L6_etiqueta", section: "lines_l6", paste: true },
  { key: "L6_oraculo", label: "L6_oraculo", section: "lines_l6", paste: true },
  { key: "L6_comentario", label: "L6_comentario", section: "lines_l6", paste: true },
  { key: "yong_etiqueta", label: "yong_etiqueta", section: "yong", paste: true },
  { key: "yong_oraculo", label: "yong_oraculo", section: "yong", paste: true },
  { key: "yong_comentario", label: "yong_comentario", section: "yong", paste: true },
];

/** Fields transcribed verbatim from Princeton TXT (G2 manual / deterministic). */
export const WILHELM_G2_ORACLE_KEYS = WILHELM_MANUAL_FIELDS.filter((f) => f.paste).map(
  (f) => f.key,
);

/** Meta from TXT header + injector trigrams (excludes gold enrichments hex_font / chinese_roman). */
export const WILHELM_G2_META_TXT_KEYS = [
  "nombre",
  "chinese",
  "trigrama_arriba",
  "trigrama_abajo",
];

/** @deprecated Use WILHELM_MANUAL_FIELDS keys — kept for ingest compatibility */
export const WILHELM_MANUAL_HEADERS = WILHELM_MANUAL_FIELDS.map((f) => f.key);

/**
 * @param {{ chinese?: string; symbolic?: string; alchemical?: string }} t
 * @param {"above"|"below"} position
 */
export function formatWilhelmTrigram(t, position) {
  if (!t) return "";
  const parts = [t.chinese, t.symbolic, t.alchemical]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return `${position} ${parts}`;
}

/**
 * @param {Record<string, unknown>} row
 * @param {string} key
 */
export function prefillWilhelmField(row, key) {
  switch (key) {
    case "hex":
      return String(row.hex ?? "");
    case "nombre":
      return String(row.english ?? "");
    case "chinese":
      return String(row.trad_chinese ?? "");
    case "chinese_roman":
      return "";
    case "hex_font":
      return String(row.hex_font ?? "");
    case "trigrama_arriba":
      return formatWilhelmTrigram(row.wilhelm_above, "above");
    case "trigrama_abajo":
      return formatWilhelmTrigram(row.wilhelm_below, "below");
    default:
      return "";
  }
}

/** Marker row between hexagram blocks (ingest delimiter). */
export const WILHELM_HEX_FIN = "hex_fin";

/**
 * @param {Record<string, unknown>} row
 * @returns {string[][]}
 */
export function buildWilhelmVerticalBlock(row) {
  /** @type {string[][]} */
  const out = [];
  for (const field of WILHELM_MANUAL_FIELDS) {
    const value = field.paste ? "" : prefillWilhelmField(row, field.key);
    out.push([field.key, value]);
  }
  out.push([WILHELM_HEX_FIN, ""]);
  return out;
}
