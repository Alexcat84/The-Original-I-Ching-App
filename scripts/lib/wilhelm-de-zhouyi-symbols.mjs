/**
 * Canonical hanzi + hex_font for Wilhelm DE maestro (Zhou Yi / ctext.org standard).
 */
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {Record<string, { chinese: string; hex_font: string }> | null} */
let _cache = null;

/**
 * @returns {Promise<Record<string, { chinese: string; hex_font: string }>>}
 */
export async function loadWilhelmDeZhouyiSymbols() {
  if (_cache) return _cache;
  const mod = await import(
    pathToFileURL(join(ROOT, "scripts/iching_zhouyi_translation.mjs")).href
  );
  /** @type {Record<string, { chinese: string; hex_font: string }>} */
  const out = {};
  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const row = mod.default[key];
    if (!row) throw new Error(`Missing Zhou Yi row for hex ${n}`);
    out[key] = {
      chinese: String(row.name ?? "").trim(),
      hex_font: String(row.hex_font ?? "").trim(),
    };
    if (!out[key].chinese || !out[key].hex_font) {
      throw new Error(`Incomplete Zhou Yi symbols for hex ${n}`);
    }
  }
  _cache = out;
  return out;
}

/**
 * Inject Zhou Yi hanzi + hex glyph into a 33-field maestro row.
 * @param {Record<string, string>} fields
 * @param {number} hex
 * @param {Record<string, { chinese: string; hex_font: string }>} symbols
 */
export function applyZhouyiSymbolsToFields(fields, hex, symbols) {
  const sym = symbols[String(hex)];
  if (!sym) throw new Error(`Missing Zhou Yi symbols for hex ${hex}`);
  fields.hex = String(hex);
  fields.chinese = sym.chinese;
  fields.hex_font = sym.hex_font;
  return fields;
}
