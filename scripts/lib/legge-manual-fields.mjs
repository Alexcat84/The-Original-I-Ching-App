/**
 * Vertical field order for Legge 64-hex TXT manual audit (Sheets export).
 */

/** @typedef {{ key: string; label: string; section: string; paste: boolean }} LeggeManualFieldDef */

/** @type {readonly LeggeManualFieldDef[]} */
export const LEGGE_MANUAL_FIELDS = [
  { key: "hex", label: "hex", section: "meta", paste: false },
  { key: "nombre", label: "nombre", section: "meta", paste: false },
  { key: "chinese", label: "chinese", section: "meta", paste: false },
  { key: "chinese_roman", label: "chinese_roman", section: "meta", paste: false },
  { key: "hex_font", label: "hex_font", section: "meta", paste: false },
  { key: "thwan_intro", label: "thwan_intro", section: "thwan", paste: true },
  { key: "thwan", label: "thwan", section: "thwan", paste: true },
  { key: "lines_intro", label: "lines_intro", section: "lines", paste: true },
  { key: "L1", label: "L1", section: "lines", paste: true },
  { key: "L2", label: "L2", section: "lines", paste: true },
  { key: "L3", label: "L3", section: "lines", paste: true },
  { key: "L4", label: "L4", section: "lines", paste: true },
  { key: "L5", label: "L5", section: "lines", paste: true },
  { key: "L6", label: "L6", section: "lines", paste: true },
  { key: "yong", label: "yong", section: "yong", paste: true },
  { key: "footnotes", label: "footnotes", section: "footnotes", paste: true },
];

export const LEGGE_HEX_FIN = "hex_fin";

/** Oracle fields present in 64hex TXT (excludes Great Symbolism — appendix). */
export const LEGGE_G2_ORACLE_KEYS = LEGGE_MANUAL_FIELDS.filter((f) => f.paste).map(
  (f) => f.key,
);

export const LEGGE_G2_META_TXT_KEYS = [
  "nombre",
  "chinese",
  "chinese_roman",
];

/**
 * @param {Record<string, string>} fields
 * @returns {string[][]}
 */
export function buildLeggeVerticalBlock(fields) {
  /** @type {string[][]} */
  const out = [];
  for (const field of LEGGE_MANUAL_FIELDS) {
    out.push([field.key, fields[field.key] ?? ""]);
  }
  out.push([LEGGE_HEX_FIN, ""]);
  return out;
}
