/**
 * Wilhelm DE Anna sandbox — dual-pass reconcile (pass02 + pass04 → reconciled draft).
 */
import { normalizeWilhelmDeTxtText } from "./wilhelm-de-64hex-txt.mjs";
import { pickWilhelmDeCommentsDualPassField } from "./wilhelm-de-comments-dual-pass-merge.mjs";
import {
  WILHELM_COMMENTS_MANUAL_FIELDS,
  WILHELM_COMMENTS_G2_ORACLE_KEYS,
} from "./wilhelm-comments-manual-fields.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_SCHEMA,
  computeWilhelmDeCommentsAnnaCoverage,
  validateWilhelmDeCommentsAnnaExtract,
} from "./wilhelm-de-comments-anna-extract.mjs";
import { validateWilhelmDe64HexCommentsStructure } from "./wilhelm-de-64hex-comments-txt.mjs";

export const WILHELM_DE_COMMENTS_ANNA_RECONCILED_STATUS = "sandbox-reconciled-pending-au";

export const WILHELM_DE_COMMENTS_ANNA_MERGE_FIELD_KEYS = WILHELM_COMMENTS_MANUAL_FIELDS.map(
  (f) => f.key,
);

/**
 * @param {string} value
 */
export function normalizeAnnaCommentsField(value) {
  return normalizeWilhelmDeTxtText(String(value ?? ""));
}

/**
 * @param {string} a
 * @param {string} b
 */
export function classifyAnnaFieldPair(a, b) {
  const na = normalizeAnnaCommentsField(a);
  const nb = normalizeAnnaCommentsField(b);
  if (!na && !nb) return "both_empty";
  if (na === nb) return "identical";
  if (na && !nb) return "pass02_only";
  if (!na && nb) return "pass04_only";
  return "disputed";
}

/**
 * @param {object} pass02
 * @param {object} pass04
 */
export function buildWilhelmDeCommentsAnnaCompareRows(pass02, pass04) {
  /** @type {Array<object>} */
  const rows = [];

  for (let n = 1; n <= 64; n++) {
    const hexKey = String(n);
    const f02 = pass02.hexagrams?.[hexKey]?.fields ?? {};
    const f04 = pass04.hexagrams?.[hexKey]?.fields ?? {};
    for (const { key: field } of WILHELM_COMMENTS_MANUAL_FIELDS) {
      const v02 = String(f02[field] ?? "");
      const v04 = String(f04[field] ?? "");
      const status = classifyAnnaFieldPair(v02, v04);
      if (status === "both_empty") continue;
      const picked = pickWilhelmDeCommentsDualPassField(v02, v04);
      rows.push({
        hex: n,
        field,
        status,
        pass02: v02,
        pass04: v04,
        reconciled: picked.value,
        pickReason: picked.reason,
        disputed: picked.disputed,
      });
    }
  }

  return rows;
}

/**
 * @param {Array<{ status: string }>} rows
 */
export function summarizeAnnaCompareRows(rows) {
  /** @type {Record<string, number>} */
  const byStatus = {};
  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
  }
  return {
    rowCount: rows.length,
    byStatus,
    identical: byStatus.identical ?? 0,
    disputed: byStatus.disputed ?? 0,
    pass02Only: byStatus.pass02_only ?? 0,
    pass04Only: byStatus.pass04_only ?? 0,
  };
}

/**
 * @param {object} pass02Payload
 * @param {object} pass04Payload
 */
export function reconcileWilhelmDeCommentsAnnaPasses(pass02Payload, pass04Payload) {
  /** @type {Array<object>} */
  const disputes = [];
  /** @type {Record<string, object>} */
  const hexagrams = {};

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const h02 = pass02Payload.hexagrams?.[key];
    const h04 = pass04Payload.hexagrams?.[key];
    if (!h02 || !h04) {
      throw new Error(`Missing hex ${n} in one or both Anna passes`);
    }

    /** @type {Record<string, string>} */
    const fields = {};
    for (const fieldKey of WILHELM_DE_COMMENTS_ANNA_MERGE_FIELD_KEYS) {
      const v02 = h02.fields?.[fieldKey] ?? "";
      const v04 = h04.fields?.[fieldKey] ?? "";
      const picked = pickWilhelmDeCommentsDualPassField(v02, v04);
      fields[fieldKey] = picked.value;
      const status = classifyAnnaFieldPair(v02, v04);
      if (status === "disputed") {
        disputes.push({
          hex: n,
          field: fieldKey,
          pass02: v02,
          pass04: v04,
          picked: picked.value,
          reason: picked.reason,
        });
      }
    }

    hexagrams[key] = {
      bookChinese: h02.bookChinese || h04.bookChinese,
      bookTitle: h02.bookTitle || h04.bookTitle,
      bookHanzi: h02.bookHanzi || h04.bookHanzi,
      bookHexFont: h02.bookHexFont || h04.bookHexFont,
      lineStart: h02.lineStart,
      lineEnd: h02.lineEnd,
      lineStartPass04: h04.lineStart,
      lineEndPass04: h04.lineEnd,
      fields,
    };
  }

  const payload = {
    schemaVersion: WILHELM_DE_COMMENTS_ANNA_SCHEMA,
    status: WILHELM_DE_COMMENTS_ANNA_RECONCILED_STATUS,
    runtimeIngest: false,
    reconciledAt: new Date().toISOString(),
    method: "anna-dual-pass-heuristic",
    sources: {
      pass02: pass02Payload.source,
      pass04: pass04Payload.source,
    },
    passes: ["02", "04"],
    headerCount: 64,
    fieldCount: WILHELM_COMMENTS_MANUAL_FIELDS.length,
    hexCount: 64,
    disputeCount: disputes.length,
    note: "Heuristic merge only — AU PDF required before promote to comments-merged.",
    hexagrams,
  };

  const compareRows = buildWilhelmDeCommentsAnnaCompareRows(pass02Payload, pass04Payload);
  const compareSummary = summarizeAnnaCompareRows(compareRows);
  const coverage = computeWilhelmDeCommentsAnnaCoverage(payload);
  const g0 = validateWilhelmDe64HexCommentsStructure(payload);

  return {
    payload,
    disputes,
    compareRows,
    compareSummary,
    coverage,
    g0,
  };
}

/**
 * @param {object} reconciledPayload
 */
export function validateWilhelmDeCommentsAnnaReconciled(reconciledPayload) {
  const g0 = validateWilhelmDe64HexCommentsStructure(reconciledPayload);
  const coverage = computeWilhelmDeCommentsAnnaCoverage(reconciledPayload);
  /** @type {string[]} */
  const errors = [...g0.errors];
  if (reconciledPayload.status !== WILHELM_DE_COMMENTS_ANNA_RECONCILED_STATUS) {
    errors.push(`unexpected status: ${reconciledPayload.status}`);
  }
  if (reconciledPayload.runtimeIngest !== false) {
    errors.push("runtimeIngest must be false for Anna reconciled sandbox");
  }
  if (reconciledPayload.headerCount !== 64) {
    errors.push(`headerCount must be 64, got ${reconciledPayload.headerCount}`);
  }
  return { ok: errors.length === 0, errors, coverage, g0 };
}
