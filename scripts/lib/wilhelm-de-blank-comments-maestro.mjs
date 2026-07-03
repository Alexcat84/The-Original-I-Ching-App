/**
 * Build / validate Wilhelm DE comments blank maestro (Baynes EN Ten Wings field parity).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { WILHELM_COMMENTS_MANUAL_FIELDS } from "./wilhelm-comments-manual-fields.mjs";
import { loadWilhelmDeZhouyiSymbols } from "./wilhelm-de-zhouyi-symbols.mjs";
import {
  WILHELM_DE_COMMENTS_BLANK,
  WILHELM_DE_COMMENTS_MERGED,
} from "./wilhelm-de-dataset-paths.mjs";

export const WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS = WILHELM_COMMENTS_MANUAL_FIELDS.map(
  (f) => f.key,
);

export const WILHELM_DE_COMMENTS_BLANK_PREFILL_KEYS = new Set(["hex", "chinese", "hex_font"]);

/** Content fields that must stay empty until Zeno/PDF extract fills them. */
export const WILHELM_DE_COMMENTS_PASTE_KEYS = WILHELM_COMMENTS_MANUAL_FIELDS.filter(
  (f) => !WILHELM_DE_COMMENTS_BLANK_PREFILL_KEYS.has(f.key),
).map((f) => f.key);

/**
 * @param {number} n
 * @param {{ chinese: string; hex_font: string }} symbolRow
 */
export function buildBlankCommentsFieldsForHex(n, symbolRow) {
  /** @type {Record<string, string>} */
  const fields = {};
  for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
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
export function buildWilhelmDeBlankCommentsMaestro(symbols) {
  /** @type {Record<string, object>} */
  const hexagrams = {};
  for (let n = 1; n <= 64; n++) {
    const row = symbols[String(n)] ?? {};
    hexagrams[String(n)] = {
      bookChinese: "",
      bookTitle: "",
      bookHanzi: String(row.chinese ?? ""),
      bookHexFont: String(row.hex_font ?? ""),
      fields: buildBlankCommentsFieldsForHex(n, row),
    };
  }
  return {
    schemaVersion: "1.0.0",
    status: "blank",
    source: "init-wilhelm-de-blank-comments-maestro",
    method: "pending-drittes-buch-extract",
    fieldCount: WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS.length,
    hexCount: 64,
    hexagrams,
  };
}

/**
 * @param {string} [outPath]
 */
export async function writeWilhelmDeBlankCommentsMaestro(outPath = WILHELM_DE_COMMENTS_BLANK) {
  const symbols = await loadWilhelmDeZhouyiSymbols();
  const payload = buildWilhelmDeBlankCommentsMaestro(symbols);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

/**
 * @param {object} blank
 * @param {{ requireEmptyPaste?: boolean }} [options]
 */
export function validateWilhelmDeBlankCommentsMaestro(blank, options = {}) {
  const requireEmptyPaste = options.requireEmptyPaste ?? blank?.status === "blank";
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
    if (keys.length !== WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS.length) {
      errors.push(
        `hex ${n}: expected ${WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS.length} fields, got ${keys.length}`,
      );
    }
    for (let i = 0; i < WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS.length; i++) {
      const expected = WILHELM_DE_COMMENTS_BLANK_FIELD_KEYS[i];
      if (keys[i] !== expected) {
        errors.push(`hex ${n}: field order mismatch at ${i}: ${keys[i]} vs ${expected}`);
        break;
      }
    }
    for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
      const value = String(entry.fields[key] ?? "");
      if (requireEmptyPaste && WILHELM_DE_COMMENTS_PASTE_KEYS.includes(key) && value.trim()) {
        errors.push(`hex ${n}.${key}: pasteable field must be blank, got ${value.length} chars`);
      }
      if (WILHELM_DE_COMMENTS_BLANK_PREFILL_KEYS.has(key) && !value.trim()) {
        errors.push(`hex ${n}.${key}: prefill id must be non-empty`);
      }
    }
  }

  return { pass: errors.length === 0, errors };
}

/**
 * Promote blank comments scaffold to runtime merged (empty Ten Wings until extract).
 * @param {object} blank
 */
export function buildWilhelmDeCommentsMergedFromBlank(blank) {
  return {
    schemaVersion: "1.0.0",
    promotedAt: new Date().toISOString(),
    source: WILHELM_DE_COMMENTS_BLANK,
    method: "blank-scaffold",
    note: "Ten Wings content empty — no OCR. Fill via Drittes Buch extract only.",
    hexCount: 64,
    fillStats: { content: "0/1920" },
    hexagrams: blank.hexagrams,
  };
}

/**
 * @param {string} [path]
 */
export async function loadWilhelmDeBlankCommentsMaestro(path = WILHELM_DE_COMMENTS_BLANK) {
  return JSON.parse(await readFile(path, "utf8"));
}

export { WILHELM_DE_COMMENTS_BLANK, WILHELM_DE_COMMENTS_MERGED };
