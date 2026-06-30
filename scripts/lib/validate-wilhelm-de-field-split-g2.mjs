/**
 * G2-DE field split gate — compare parsed v2 oracle/commentary fields vs pilot gold TSV.
 */
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_G2_ORACLE_KEYS } from "./wilhelm-manual-fields.mjs";
import { WILHELM_DE_BOOK_ONE_PARSED_V2 } from "./wilhelm-de-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const GOLD_DIR = join(ROOT, "tools/manual-gold");
const PILOT_HEX = [1, 2, 8];

/** Fields that must split oracle vs commentary (26 × 64 in full G2; pilot subset here). */
export const WILHELM_DE_G2_SPLIT_KEYS = WILHELM_G2_ORACLE_KEYS.filter((k) =>
  /_(oraculo|comentario)$/.test(k),
);

/**
 * @param {string} tsvPath
 */
async function loadGoldTsv(tsvPath) {
  const raw = await readFile(tsvPath, "utf8");
  /** @type {Record<string, string>} */
  const fields = {};
  for (const line of raw.split("\n")) {
    if (!line.trim() || line.startsWith("campo")) continue;
    const parts = line.split("\t");
    const key = parts[0]?.trim();
    const valueRaw = (parts[1] ?? "").trim();
    const value = valueRaw.replace(/\\n/g, "\n");
    if (key && key !== "hex_fin") fields[key] = value;
  }
  return fields;
}

/**
 * @param {object} parsedV2
 * @param {number[]} [hexList]
 */
export async function validateWilhelmDeFieldSplitG2(parsedV2, hexList = PILOT_HEX) {
  /** @type {string[]} */
  const errors = [];
  let checked = 0;
  let matched = 0;

  for (const n of hexList) {
    const parsedFields = parsedV2.hexagrams[String(n)]?.fields ?? {};
    const goldPath = join(GOLD_DIR, `wilhelm-de-hex-${n}.tsv`);
    let gold;
    try {
      gold = await loadGoldTsv(goldPath);
    } catch {
      errors.push(`hex ${n}: missing gold ${goldPath}`);
      continue;
    }

    for (const key of WILHELM_DE_G2_SPLIT_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(gold, key)) continue;
      const expected = String(gold[key] ?? "").trim();
      if (!expected) continue;
      checked++;
      const actual = String(parsedFields[key] ?? "").trim();
      const ok =
        actual === expected ||
        (actual.length > 0 &&
          expected.length > 0 &&
          (actual.includes(expected.slice(0, Math.min(60, expected.length))) ||
            expected.includes(actual.slice(0, Math.min(60, actual.length)))));
      if (ok) matched++;
      else {
        errors.push(
          `hex ${n}.${key}: split drift (actual ${actual.length} vs gold ${expected.length} chars)`,
        );
      }
    }

    for (const key of WILHELM_DE_G2_SPLIT_KEYS) {
      const com = String(parsedFields[key.replace("_oraculo", "_comentario")] ?? "").trim();
      if (key.endsWith("_comentario") && com.length > 0 && com.length < 15) {
        errors.push(`hex ${n}.${key}: commentary suspiciously short (${com.length})`);
      }
    }
  }

  return {
    pass: errors.length === 0,
    checked,
    matched,
    errors,
  };
}

/**
 * @param {string} [parsedPath]
 */
export async function runWilhelmDeFieldSplitG2(parsedPath = WILHELM_DE_BOOK_ONE_PARSED_V2) {
  const parsed = JSON.parse(await readFile(parsedPath, "utf8"));
  return validateWilhelmDeFieldSplitG2(parsed);
}
