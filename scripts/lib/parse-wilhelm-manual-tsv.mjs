/**
 * Parse Google Sheets vertical export: campo TAB contenido_epub
 * Blocks separated by hex_fin; multiple hex per paste supported.
 *
 * Continuation lines (no TAB) append to the previous field — required for
 * multiline cell content copied from Sheets or chat.
 */

/** @type {ReadonlySet<string>} */
const FIELD_KEYS = new Set([
  "hex",
  "hex_fin",
  "nombre",
  "chinese",
  "trigrama_arriba",
  "trigrama_abajo",
  "intro",
  "judgment_oraculo",
  "judgment_comentario",
  "image_oraculo",
  "image_comentario",
  "L1_etiqueta",
  "L1_oraculo",
  "L1_comentario",
  "L2_etiqueta",
  "L2_oraculo",
  "L2_comentario",
  "L3_etiqueta",
  "L3_oraculo",
  "L3_comentario",
  "L4_etiqueta",
  "L4_oraculo",
  "L4_comentario",
  "L5_etiqueta",
  "L5_oraculo",
  "L5_comentario",
  "L6_etiqueta",
  "L6_oraculo",
  "L6_comentario",
  "yong_etiqueta",
  "yong_oraculo",
  "yong_comentario",
]);

/**
 * @param {string} value
 */
function stripOuterQuotes(value) {
  const s = String(value ?? "");
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
    return s.slice(1, -1);
  }
  return s;
}

/**
 * @param {string} text
 * @returns {Record<number, Record<string, string>>}
 */
export function parseWilhelmManualTsv(text) {
  /** @type {Record<number, Record<string, string>>} */
  const out = {};
  /** @type {Record<string, string> | null} */
  let current = null;
  /** @type {string | null} */
  let lastKey = null;

  /**
   * @param {string} key
   * @param {string} val
   */
  function setField(key, val) {
    if (!current) return;
    current[key] = val;
    lastKey = key;
  }

  /**
   * @param {string} line
   */
  function appendContinuation(line) {
    if (!current || !lastKey) return;
    const prev = current[lastKey] ?? "";
    current[lastKey] = prev ? `${prev}\n${line}` : line;
  }

  for (const rawLine of String(text ?? "").split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/g, "");
    if (!line.trim()) continue;
    if (/^campo\t/i.test(line)) continue;

    const tab = line.indexOf("\t");
    if (tab < 0) {
      const bare = line.trim();
      if (FIELD_KEYS.has(bare)) {
        if (bare === "hex_fin") {
          if (current?.hex) {
            for (const k of Object.keys(current)) {
              if (k !== "hex") current[k] = stripOuterQuotes(current[k]);
            }
            out[Number(current.hex)] = current;
          }
          current = null;
          lastKey = null;
          continue;
        }
        if (bare === "hex") {
          if (current?.hex) {
            for (const k of Object.keys(current)) {
              if (k !== "hex") current[k] = stripOuterQuotes(current[k]);
            }
            out[Number(current.hex)] = current;
          }
          current = { hex: "" };
          lastKey = null;
          continue;
        }
        if (current) setField(bare, "");
        continue;
      }
      appendContinuation(line);
      continue;
    }

    const key = line.slice(0, tab).trim();
    const val = line.slice(tab + 1);

    if (key === "hex_fin") {
      if (current?.hex) {
        for (const k of Object.keys(current)) {
          if (k !== "hex") current[k] = stripOuterQuotes(current[k]);
        }
        out[Number(current.hex)] = current;
      }
      current = null;
      lastKey = null;
      continue;
    }

    if (key === "hex") {
      if (current?.hex) {
        for (const k of Object.keys(current)) {
          if (k !== "hex") current[k] = stripOuterQuotes(current[k]);
        }
        out[Number(current.hex)] = current;
      }
      current = { hex: val.trim() };
      lastKey = null;
      continue;
    }

    if (current) setField(key, val);
  }

  if (current?.hex) {
    for (const k of Object.keys(current)) {
      if (k !== "hex") current[k] = stripOuterQuotes(current[k]);
    }
    out[Number(current.hex)] = current;
  }

  return out;
}
