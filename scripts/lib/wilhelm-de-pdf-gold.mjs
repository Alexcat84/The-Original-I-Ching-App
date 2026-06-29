/**
 * Load Wilhelm DE 1924 oracle gold for fidelity gates.
 * Primary: tools/output/fidelity-gold/wilhelm-de-pdf-gold.json
 * Built by tools/extract-wilhelm-de-pdf.mjs from merged OCR (PDF arbiter when available).
 */
import { readFile, stat } from "node:fs/promises";
import { WILHELM_DE_PDF_GOLD_JSON, WILHELM_DE_BOOK_ONE_MERGED } from "./wilhelm-de-dataset-paths.mjs";
import { txtFieldsToOracleGold } from "./wilhelm-de-64hex-txt.mjs";

/** @type {Promise<Record<number, object>> | null} */
let cache = null;

/**
 * @param {object} mergedPayload
 */
export function mergedPayloadToOracleGold(mergedPayload) {
  /** @type {Record<number, object>} */
  const gold = {};
  for (let n = 1; n <= 64; n++) {
    const fields = mergedPayload.hexagrams?.[String(n)]?.fields;
    if (!fields) throw new Error(`merged gold missing hex ${n}`);
    gold[n] = { hex: n, ...txtFieldsToOracleGold(fields, n) };
  }
  return gold;
}

/**
 * @param {{ force?: boolean }} [opts]
 */
export async function loadWilhelmDePdfGoldOrThrow(opts = {}) {
  if (!opts.force && cache) return cache;

  try {
    const st = await stat(WILHELM_DE_PDF_GOLD_JSON);
    if (st.size > 1000) {
      const payload = JSON.parse(await readFile(WILHELM_DE_PDF_GOLD_JSON, "utf8"));
      if (payload?.hexagrams && Object.keys(payload.hexagrams).length >= 64) {
        /** @type {Record<number, object>} */
        const gold = {};
        for (const [k, v] of Object.entries(payload.hexagrams)) {
          gold[Number(k)] = v;
        }
        cache = gold;
        return gold;
      }
    }
  } catch {
    /* build from merged */
  }

  const merged = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_MERGED, "utf8"));
  cache = mergedPayloadToOracleGold(merged);
  return cache;
}
