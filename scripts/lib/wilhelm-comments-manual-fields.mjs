/**
 * Vertical field order for Wilhelm 64-hex classical commentaries (Ten Wings layer).
 */

/** @typedef {{ key: string; section: string }} WilhelmCommentsFieldDef */

/** @type {readonly WilhelmCommentsFieldDef[]} */
export const WILHELM_COMMENTS_MANUAL_FIELDS = [
  { key: "hex", section: "meta" },
  { key: "nombre", section: "meta" },
  { key: "chinese", section: "meta" },
  { key: "chinese_roman", section: "meta" },
  { key: "hex_font", section: "meta" },
  { key: "trigrama_arriba", section: "meta" },
  { key: "trigrama_abajo", section: "meta" },
  { key: "ruler_note", section: "preface" },
  { key: "sequence", section: "sequence" },
  { key: "misc_notes", section: "tsa_kua" },
  { key: "judgment_oraculo", section: "judgment_echo" },
  { key: "commentary_decision", section: "tuan" },
  { key: "image_oraculo", section: "image_echo" },
  { key: "commentary_image", section: "da_xiang" },
  { key: "L1_etiqueta", section: "lines_l1" },
  { key: "L1_a_oraculo", section: "lines_l1" },
  { key: "L1_b_comentario", section: "lines_l1" },
  { key: "L2_etiqueta", section: "lines_l2" },
  { key: "L2_a_oraculo", section: "lines_l2" },
  { key: "L2_b_comentario", section: "lines_l2" },
  { key: "L3_etiqueta", section: "lines_l3" },
  { key: "L3_a_oraculo", section: "lines_l3" },
  { key: "L3_b_comentario", section: "lines_l3" },
  { key: "L4_etiqueta", section: "lines_l4" },
  { key: "L4_a_oraculo", section: "lines_l4" },
  { key: "L4_b_comentario", section: "lines_l4" },
  { key: "L5_etiqueta", section: "lines_l5" },
  { key: "L5_a_oraculo", section: "lines_l5" },
  { key: "L5_b_comentario", section: "lines_l5" },
  { key: "L6_etiqueta", section: "lines_l6" },
  { key: "L6_a_oraculo", section: "lines_l6" },
  { key: "L6_b_comentario", section: "lines_l6" },
  { key: "yong_etiqueta", section: "yong" },
  { key: "yong_a_oraculo", section: "yong" },
  { key: "yong_b_comentario", section: "yong" },
  { key: "wen_yen", section: "wen_yen" },
  { key: "wen_yen_note", section: "wen_yen" },
];

/** Content fields from Princeton comments TXT (G2 deterministic / manual). */
export const WILHELM_COMMENTS_G2_ORACLE_KEYS = WILHELM_COMMENTS_MANUAL_FIELDS.filter(
  (f) =>
    ![
      "hex",
      "nombre",
      "chinese",
      "chinese_roman",
      "hex_font",
      "trigrama_arriba",
      "trigrama_abajo",
    ].includes(f.key),
).map((f) => f.key);

export const WILHELM_COMMENTS_G2_META_TXT_KEYS = [
  "nombre",
  "chinese",
  "trigrama_arriba",
  "trigrama_abajo",
];

export const WILHELM_COMMENTS_HEX_FIN = "hex_fin";

/**
 * @param {Record<string, string>} fields
 * @returns {string[][]}
 */
export function buildWilhelmCommentsVerticalBlock(fields) {
  /** @type {string[][]} */
  const out = [];
  for (const field of WILHELM_COMMENTS_MANUAL_FIELDS) {
    out.push([field.key, fields[field.key] ?? ""]);
  }
  out.push([WILHELM_COMMENTS_HEX_FIN, ""]);
  return out;
}
