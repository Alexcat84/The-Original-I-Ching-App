/**
 * Wilhelm DE Drittes Buch — Anna TXT sandbox extract helpers (isolated from runtime maestro).
 */
import {
  WILHELM_COMMENTS_G2_ORACLE_KEYS,
  WILHELM_COMMENTS_MANUAL_FIELDS,
} from "./wilhelm-comments-manual-fields.mjs";
import { validateWilhelmDe64HexCommentsStructure } from "./wilhelm-de-64hex-comments-txt.mjs";

export const WILHELM_DE_COMMENTS_ANNA_SCHEMA = "1.0.0";
export const WILHELM_DE_COMMENTS_ANNA_STATUS = "sandbox-pending-au";

/** Fields counted for fill ratio (oracle/commentary content, excludes meta ids). */
export const WILHELM_DE_COMMENTS_ANNA_COVERAGE_KEYS = WILHELM_COMMENTS_G2_ORACLE_KEYS;

/**
 * @param {Awaited<import("./wilhelm-de-64hex-comments-txt.mjs").parseWilhelmDe64HexCommentsTxtFull>} parsed
 * @param {{ pass: string; sourcePath: string }} meta
 */
export function buildWilhelmDeCommentsAnnaExport(parsed, meta) {
  /** @type {Record<string, object>} */
  const hexagrams = {};
  for (const [n, hex] of Object.entries(parsed.hexagrams ?? {})) {
    hexagrams[n] = {
      bookChinese: hex.bookChinese,
      bookTitle: hex.bookTitle,
      bookHanzi: hex.bookHanzi,
      bookHexFont: hex.bookHexFont,
      lineStart: hex.lineStart,
      lineEnd: hex.lineEnd,
      fields: hex.fields,
    };
  }

  return {
    schemaVersion: WILHELM_DE_COMMENTS_ANNA_SCHEMA,
    status: WILHELM_DE_COMMENTS_ANNA_STATUS,
    runtimeIngest: false,
    source: parsed.source ?? meta.sourcePath,
    sourceKind: "annas-archive-ocr-txt",
    pass: meta.pass,
    parsedAt: parsed.parsedAt ?? new Date().toISOString(),
    headerCount: parsed.headerCount ?? Object.keys(hexagrams).length,
    fieldCount: WILHELM_COMMENTS_MANUAL_FIELDS.length,
    hexCount: 64,
    note: "Sandbox only — do not copy to wilhelm-de-64hex-comments-merged.json until AU + dual-pass promote.",
    hexagrams,
  };
}

/**
 * @param {ReturnType<typeof buildWilhelmDeCommentsAnnaExport>} payload
 */
export function computeWilhelmDeCommentsAnnaCoverage(payload) {
  const keys = WILHELM_DE_COMMENTS_ANNA_COVERAGE_KEYS;
  const totalSlots = keys.length * 64;
  let filled = 0;
  /** @type {Record<string, { filled: number; total: number }>} */
  const byField = {};
  /** @type {Record<string, { filled: number; total: number }>} */
  const byHex = {};

  for (const key of keys) {
    byField[key] = { filled: 0, total: 64 };
  }

  for (let n = 1; n <= 64; n++) {
    const hexKey = String(n);
    byHex[hexKey] = { filled: 0, total: keys.length };
    const fields = payload.hexagrams?.[hexKey]?.fields ?? {};
    for (const key of keys) {
      const value = String(fields[key] ?? "").trim();
      if (value) {
        filled++;
        byField[key].filled++;
        byHex[hexKey].filled++;
      }
    }
  }

  /** @type {string[]} */
  const emptyHexes = [];
  for (let n = 1; n <= 64; n++) {
    if ((byHex[String(n)]?.filled ?? 0) === 0) emptyHexes.push(String(n));
  }

  return {
    pass: payload.pass,
    parsedAt: payload.parsedAt,
    contentKeys: keys.length,
    totalSlots,
    filled,
    fillRatio: totalSlots ? filled / totalSlots : 0,
    fillLabel: `${filled}/${totalSlots}`,
    byField,
    byHex,
    emptyHexes,
  };
}

/**
 * @param {ReturnType<typeof buildWilhelmDeCommentsAnnaExport>} payload
 */
export function validateWilhelmDeCommentsAnnaExtract(payload) {
  const g0 = validateWilhelmDe64HexCommentsStructure(payload);
  const coverage = computeWilhelmDeCommentsAnnaCoverage(payload);
  /** @type {string[]} */
  const errors = [...g0.errors];

  if (payload.status !== WILHELM_DE_COMMENTS_ANNA_STATUS) {
    errors.push(`unexpected status: ${payload.status}`);
  }
  if (payload.runtimeIngest !== false) {
    errors.push("runtimeIngest must be false for Anna sandbox");
  }
  if (payload.headerCount !== 64) {
    errors.push(`headerCount must be 64, got ${payload.headerCount}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    g0,
    coverage,
  };
}

/**
 * @param {ReturnType<typeof buildWilhelmDeCommentsAnnaExport>} a
 * @param {ReturnType<typeof buildWilhelmDeCommentsAnnaExport>} b
 */
export function diffWilhelmDeCommentsAnnaPasses(a, b) {
  /** @type {Array<{ hex: string; field: string; passA: number; passB: number }>} */
  const fieldLengthDiffs = [];
  let identicalFields = 0;
  let comparableFields = 0;

  for (let n = 1; n <= 64; n++) {
    const hexKey = String(n);
    const fa = a.hexagrams?.[hexKey]?.fields ?? {};
    const fb = b.hexagrams?.[hexKey]?.fields ?? {};
    for (const key of WILHELM_DE_COMMENTS_ANNA_COVERAGE_KEYS) {
      const sa = String(fa[key] ?? "").trim();
      const sb = String(fb[key] ?? "").trim();
      if (!sa && !sb) continue;
      comparableFields++;
      if (sa === sb) {
        identicalFields++;
        continue;
      }
      fieldLengthDiffs.push({
        hex: hexKey,
        field: key,
        passA: sa.length,
        passB: sb.length,
      });
    }
  }

  return {
    passA: a.pass,
    passB: b.pass,
    comparableFields,
    identicalFields,
    identicalRatio: comparableFields ? identicalFields / comparableFields : 0,
    differingFieldCount: fieldLengthDiffs.length,
    differingFieldsSample: fieldLengthDiffs.slice(0, 40),
  };
}
