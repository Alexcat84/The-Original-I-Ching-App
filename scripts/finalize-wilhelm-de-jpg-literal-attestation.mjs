#!/usr/bin/env node
/**
 * QA code: AU-FID-W-041 finalize-wilhelm-de-jpg-literal-attestation · v1.0.0
 * Area: scripts/finalize-wilhelm-de-jpg-literal-attestation.mjs
 * Family: FID-W
 *
 * Promote ledger fields from `corrected` → `verified` after JPG literal batch audit.
 * `corrected` means the field was read against JPG and the pilot text was fixed; it counts
 * toward attestation once promoted.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadLedger,
  recomputeLedgerSummary,
  WILHELM_DE_JPG_LITERAL_LEDGER,
} from "./lib/wilhelm-de-jpg-literal-audit-ledger.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const ledger = await loadLedger();
  let promoted = 0;
  /** @type {Array<{ hex: number; field: string; priorNote?: string }>} */
  const promotedFields = [];

  for (const [hexKey, block] of Object.entries(ledger.hexagrams)) {
    for (const [field, row] of Object.entries(block.fields)) {
      if (row.status !== "corrected") continue;
      promotedFields.push({
        hex: Number(hexKey),
        field,
        priorNote: row.note,
      });
      if (!dryRun) {
        row.status = "verified";
        row.wasCorrectedFromJpg = true;
        row.note = row.note
          ? `${row.note}; promoted verified post-JPG correction`
          : "Promoted verified post-JPG correction";
        row.verifiedAt = new Date().toISOString();
      }
      promoted++;
    }
  }

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          wouldPromote: promoted,
          currentSummary: ledger.summary,
          projectedVerified: ledger.summary.fieldsVerified + promoted,
          projectedVacio: ledger.summary.fieldsVacio,
          projectedTotal:
            ledger.summary.fieldsVerified + promoted + ledger.summary.fieldsVacio,
        },
        null,
        2,
      ),
    );
    return;
  }

  ledger.summary.fieldsCorrectedHistorically = promoted;
  ledger.summary.fieldsCorrected = 0;
  const allDone = recomputeLedgerSummary(ledger);

  const attestationReady =
    ledger.summary.fieldsVerified + ledger.summary.fieldsVacio === ledger.summary.fieldsTotal;

  if (attestationReady && ledger.summary.fieldsPending === 0) {
    ledger.attestationIssued = true;
    ledger.attestationIssuedAt = new Date().toISOString();
    ledger.closedAt = ledger.closedAt ?? ledger.attestationIssuedAt;
  }

  await writeFile(WILHELM_DE_JPG_LITERAL_LEDGER, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportPath = join(REPORTS, `wilhelm-de-jpg-literal-attestation-finalize-${stamp}.json`);
  await mkdir(REPORTS, { recursive: true });
  const payload = {
    updatedAt: new Date().toISOString(),
    auditCode: "20260630-AUD-DAT-W-07",
    promotedCount: promoted,
    attestationReady,
    attestationIssued: ledger.attestationIssued ?? false,
    ledgerSummary: ledger.summary,
    samplePromoted: promotedFields.slice(0, 20),
  };
  await writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(JSON.stringify(payload, null, 2));
  console.error(`Ledger: ${WILHELM_DE_JPG_LITERAL_LEDGER}`);
  console.error(`Report: ${reportPath}`);
  if (!attestationReady) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
