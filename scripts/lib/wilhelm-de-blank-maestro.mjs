/**
 * Build / validate Wilhelm DE blank maestro (Baynes EN field parity, empty pasteable cells).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_MANUAL_FIELDS } from "./wilhelm-manual-fields.mjs";
import { loadWilhelmDeZhouyiSymbols } from "./wilhelm-de-zhouyi-symbols.mjs";
import {
  WILHELM_DE_BOOK_ONE_BLANK,
  WILHELM_BAYNES_BOOK_ONE_PARSED,
} from "./wilhelm-de-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const WILHELM_DE_BLANK_FIELD_KEYS = WILHELM_MANUAL_FIELDS.map((f) => f.key);

export const WILHELM_DE_BLANK_PREFILL_KEYS = new Set(["hex", "chinese", "hex_font"]);

/**
 * @param {number} n
 * @param {{ chinese: string; hex_font: string }} symbolRow
 */
export function buildBlankFieldsForHex(n, symbolRow) {
  /** @type {Record<string, string>} */
  const fields = {};
  for (const { key } of WILHELM_MANUAL_FIELDS) {
    if (key === "hex") fields[key] = String(n);
    else if (key === "chinese") fields[key] = String(symbolRow.chinese ?? "");
    else if (key === "hex_font") fields[key] = String(symbolRow.hex_font ?? "");
    else fields[key] = "";
  }
  return fields;
}

/**
 * @param {Record<string, { chinese: string; hex_font: string }>} symbols
 */
export function buildWilhelmDeBlankMaestro(symbols) {
  /** @type {Record<string, object>} */
  const hexagrams = {};
  for (let n = 1; n <= 64; n++) {
    const row = symbols[String(n)] ?? {};
    hexagrams[String(n)] = {
      bookChinese: "",
      bookTitle: "",
      bookHanzi: String(row.chinese ?? ""),
      bookHexFont: String(row.hex_font ?? ""),
      lineStart: null,
      lineEnd: null,
      fields: buildBlankFieldsForHex(n, row),
    };
  }
  return {
    schemaVersion: "1.0.0",
    status: "blank",
    source: "init-wilhelm-de-blank-maestro",
    template: WILHELM_BAYNES_BOOK_ONE_PARSED,
    parsedAt: new Date().toISOString(),
    fieldCount: WILHELM_DE_BLANK_FIELD_KEYS.length,
    hexCount: 64,
    hexagrams,
  };
}

/**
 * @param {string} [outPath]
 */
export async function writeWilhelmDeBlankMaestro(outPath = WILHELM_DE_BOOK_ONE_BLANK) {
  const symbols = await loadWilhelmDeZhouyiSymbols();
  const payload = buildWilhelmDeBlankMaestro(symbols);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

/**
 * @param {object} blank
 * @param {object} [baynesParsed]
 * @param {{ requireEmptyPaste?: boolean }} [options]
 */
export function validateWilhelmDeBlankMaestro(blank, baynesParsed, options = {}) {
  const requireEmptyPaste = options.requireEmptyPaste ?? !blank?.pilotGoldAppliedAt;
  /** @type {string[]} */
  const errors = [];
  const hexKeys = Object.keys(blank?.hexagrams ?? {});
  if (hexKeys.length !== 64) {
    errors.push(`expected 64 hex entries, got ${hexKeys.length}`);
  }

  for (let n = 1; n <= 64; n++) {
    const entry = blank.hexagrams[String(n)];
    if (!entry?.fields) {
      errors.push(`hex ${n}: missing fields`);
      continue;
    }
    const keys = Object.keys(entry.fields);
    if (keys.length !== WILHELM_DE_BLANK_FIELD_KEYS.length) {
      errors.push(`hex ${n}: expected ${WILHELM_DE_BLANK_FIELD_KEYS.length} fields, got ${keys.length}`);
    }
    for (let i = 0; i < WILHELM_DE_BLANK_FIELD_KEYS.length; i++) {
      const expected = WILHELM_DE_BLANK_FIELD_KEYS[i];
      if (keys[i] !== expected) {
        errors.push(`hex ${n}: field order mismatch at ${i}: ${keys[i]} vs ${expected}`);
        break;
      }
    }
    for (const { key, paste } of WILHELM_MANUAL_FIELDS) {
      const value = String(entry.fields[key] ?? "");
      if (requireEmptyPaste && paste && value.trim().length > 0) {
        errors.push(`hex ${n}.${key}: pasteable field must be blank, got ${value.length} chars`);
      }
      if (WILHELM_DE_BLANK_PREFILL_KEYS.has(key) && !value.trim()) {
        errors.push(`hex ${n}.${key}: prefill id must be non-empty`);
      }
    }
  }

  if (baynesParsed?.hexagrams) {
    for (let n = 1; n <= 64; n++) {
      const enKeys = Object.keys(baynesParsed.hexagrams[String(n)]?.fields ?? {}).sort();
      const deKeys = Object.keys(blank.hexagrams[String(n)]?.fields ?? {}).sort();
      if (enKeys.join("|") !== deKeys.join("|")) {
        errors.push(`hex ${n}: field key set differs from Baynes EN`);
      }
    }
  }

  return { pass: errors.length === 0, errors };
}

/**
 * @param {string} [path]
 */
export async function loadWilhelmDeBlankMaestro(path = WILHELM_DE_BOOK_ONE_BLANK) {
  return JSON.parse(await readFile(path, "utf8"));
}
