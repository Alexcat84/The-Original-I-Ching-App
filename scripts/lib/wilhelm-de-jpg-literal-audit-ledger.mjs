/**
 * Ledger helpers for AUD-DAT-W-07 JPG literal attestation.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const WILHELM_DE_JPG_LITERAL_LEDGER = join(
  ROOT,
  "reports/wilhelm-de-jpg-literal-audit-ledger.json",
);

/** @typedef {'pending'|'verified'|'corrected'|'vacio_en_libro'} FieldAuditStatus */

/**
 * @param {object} ledger
 */
export function recomputeLedgerSummary(ledger) {
  let hexComplete = 0;
  let fieldsVerified = 0;
  let fieldsCorrected = 0;
  let fieldsPending = 0;
  let fieldsVacio = 0;

  for (const block of Object.values(ledger.hexagrams)) {
    let hexOk = true;
    for (const row of Object.values(block.fields)) {
      if (row.status === "verified") fieldsVerified++;
      else if (row.status === "corrected") fieldsCorrected++;
      else if (row.status === "vacio_en_libro") fieldsVacio++;
      else {
        fieldsPending++;
        hexOk = false;
      }
    }
    block.fieldsComplete = fieldsVerified + fieldsCorrected + fieldsVacio - (hexComplete > 0 ? 0 : 0);
    if (hexOk) {
      block.closedAt = block.closedAt ?? new Date().toISOString();
      hexComplete++;
    } else {
      block.closedAt = null;
    }
  }

  // re-count per hex complete
  hexComplete = 0;
  for (const block of Object.values(ledger.hexagrams)) {
    const ok = Object.values(block.fields).every((r) =>
      ["verified", "corrected", "vacio_en_libro"].includes(r.status),
    );
    block.fieldsComplete = Object.values(block.fields).filter((r) =>
      ["verified", "corrected", "vacio_en_libro"].includes(r.status),
    ).length;
    if (ok) hexComplete++;
  }

  ledger.summary = {
    hexComplete,
    hexTotal: 64,
    fieldsTotal: fieldsVerified + fieldsCorrected + fieldsPending + fieldsVacio,
    fieldsVerified,
    fieldsCorrected,
    fieldsVacio,
    fieldsPending,
  };

  const allDone =
    hexComplete === 64 &&
    fieldsPending === 0 &&
    ledger.summary.fieldsVerified + ledger.summary.fieldsCorrected + fieldsVacio ===
      ledger.summary.fieldsTotal;

  if (allDone && !ledger.attestationIssued) {
    ledger.closedAt = new Date().toISOString();
  }

  return allDone;
}

export async function loadLedger() {
  return JSON.parse(await readFile(WILHELM_DE_JPG_LITERAL_LEDGER, "utf8"));
}

/**
 * @param {number} hex
 * @param {Record<string, { status: FieldAuditStatus; note?: string; jpgPagesRead?: string }>} updates
 */
export async function markHexFields(hex, updates) {
  const ledger = await loadLedger();
  const key = String(hex);
  const block = ledger.hexagrams[key];
  if (!block) throw new Error(`Unknown hex ${hex}`);

  for (const [field, patch] of Object.entries(updates)) {
    if (!block.fields[field]) throw new Error(`hex ${hex} unknown field ${field}`);
    block.fields[field] = {
      ...block.fields[field],
      ...patch,
      verifiedAt: new Date().toISOString(),
    };
  }

  const allDone = recomputeLedgerSummary(ledger);
  await writeFile(WILHELM_DE_JPG_LITERAL_LEDGER, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
  return { ledger, allDone, hexComplete: ledger.summary.hexComplete };
}

/**
 * Mark all fields of a hex verified (or keep vacio_en_libro).
 * @param {number} hex
 * @param {{ note?: string; jpgPagesRead?: string; correctedFields?: string[] }} opts
 */
export async function markHexComplete(hex, opts = {}) {
  const ledger = await loadLedger();
  const key = String(hex);
  const block = ledger.hexagrams[key];
  const corrected = new Set(opts.correctedFields ?? []);
  /** @type {Record<string, object>} */
  const updates = {};
  for (const [field, row] of Object.entries(block.fields)) {
    if (row.status === "vacio_en_libro") {
      updates[field] = { status: "vacio_en_libro", note: opts.note ?? "Confirmado vacío en JPG" };
    } else if (corrected.has(field)) {
      updates[field] = { status: "corrected", note: opts.note ?? "Corregido vs JPG" };
    } else {
      updates[field] = { status: "verified", note: opts.note ?? "Literal JPG OK" };
    }
    if (opts.jpgPagesRead) updates[field].jpgPagesRead = opts.jpgPagesRead;
  }
  return markHexFields(hex, updates);
}
