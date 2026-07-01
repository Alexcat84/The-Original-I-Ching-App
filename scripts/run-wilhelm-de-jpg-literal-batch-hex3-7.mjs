#!/usr/bin/env node
/**
 * QA code: AU-FID-W-033 run-wilhelm-de-jpg-literal-batch-hex3-7 · v1.0.0
 * Area: scripts/run-wilhelm-de-jpg-literal-batch-hex3-7.mjs
 * Family: FID-W
 *
 * Apply JPG literal corrections (hex 3–7), verify pilot, markHexComplete, report.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tsvEscapeCell } from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import { markHexComplete, loadLedger } from "./lib/wilhelm-de-jpg-literal-audit-ledger.mjs";
import { JPG_LITERAL_CORRECTIONS_3_7 } from "./lib/wilhelm-de-jpg-literal-corrections-hex3-7.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");
const HEX_STARTS = join(ROOT, "tools/datasets/wilhelm-de/wilhelm-de-comments-hex-starts.json");

/**
 * @param {number} hex
 * @param {Record<string, string>} corrections
 */
async function applyPilotCorrections(hex, corrections) {
  const pilotPath = join(
    WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
    `wilhelm-de-comments-hex-${hex}-pilot-au.tsv`,
  );
  const raw = await readFile(pilotPath, "utf8");
  const lines = raw.split("\n");
  const header = lines[0];
  /** @type {string[]} */
  const out = [header];
  const correctedFields = Object.keys(corrections);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.startsWith("hex_fin")) {
      out.push(line);
      continue;
    }
    const tab = line.indexOf("\t");
    if (tab < 0) {
      out.push(line);
      continue;
    }
    const field = line.slice(0, tab);
    if (corrections[field]) {
      const parts = line.split("\t");
      parts[3] = tsvEscapeCell(corrections[field]);
      parts[4] = parts[4] || "cerrado";
      out.push(parts.join("\t"));
    } else {
      out.push(line);
    }
  }
  await writeFile(pilotPath, `${out.join("\n")}\n`, "utf8");

  const disputesPath = join(
    WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
    `wilhelm-de-comments-hex-${String(hex).padStart(2, "0")}-disputes.tsv`,
  );
  try {
    const dRaw = await readFile(disputesPath, "utf8");
    const dLines = dRaw.split("\n");
    /** @type {string[]} */
    const dOut = [dLines[0]];
    for (let i = 1; i < dLines.length; i++) {
      const line = dLines[i];
      if (!line.trim() || line.startsWith("hex_fin")) {
        dOut.push(line);
        continue;
      }
      const field = line.slice(0, line.indexOf("\t"));
      if (corrections[field]) {
        const parts = line.split("\t");
        parts[6] = tsvEscapeCell(corrections[field]);
        parts[7] = parts[7] || "cerrado";
        dOut.push(parts.join("\t"));
      } else {
        dOut.push(line);
      }
    }
    await writeFile(disputesPath, `${dOut.join("\n")}\n`, "utf8");
  } catch {
    // disputes file may not exist for some hex
  }

  return { pilotPath, correctedFields };
}

/** @param {number} hex */
function jpgPagesForHex(hex) {
  const hexStarts = JSON.parse(readFileSync(HEX_STARTS, "utf8"));
  const row = hexStarts.starts.find((s) => s.hex === hex);
  return row ? `${row.bookPage}-${row.endBookPage}` : "";
}

/** @param {number} hex */
function verifyHex(hex) {
  const r = spawnSync(
    process.execPath,
    ["scripts/verify-wilhelm-de-comments-au-pilot.mjs", `--hex=${hex}`],
    { cwd: ROOT, encoding: "utf8" },
  );
  return { ok: r.status === 0, stdout: r.stdout, stderr: r.stderr };
}

async function main() {
  /** @type {Record<number, object>} */
  const hexResults = {};
  /** @type {string[]} */
  const verifyFailed = [];

  for (let hex = 3; hex <= 7; hex++) {
    const corrections = JPG_LITERAL_CORRECTIONS_3_7[hex] ?? {};
    const { correctedFields } = await applyPilotCorrections(hex, corrections);
    const jpgPages = jpgPagesForHex(hex);
    const verify = verifyHex(hex);

    let markedComplete = false;
    if (verify.ok) {
      await markHexComplete(hex, {
        note: `JPG pp.${jpgPages} — AUD-DAT-W-07 literal hex 3-7`,
        jpgPagesRead: jpgPages,
        correctedFields,
      });
      markedComplete = true;
    } else {
      verifyFailed.push(String(hex));
    }

    hexResults[hex] = {
      jpgPagesRead: jpgPages,
      corrections: correctedFields.map((field) => ({
        field,
        reason: "JPG literal fix vs pilot OCR",
      })),
      fieldsCorrected: correctedFields.length,
      verifyPass: verify.ok,
      markedComplete,
    };
  }

  const ledger = await loadLedger();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportPath = join(REPORTS, `wilhelm-de-jpg-literal-audit-3-7-${stamp}.json`);
  await mkdir(REPORTS, { recursive: true });
  const payload = {
    updatedAt: new Date().toISOString(),
    auditCode: "20260630-AUD-DAT-W-07",
    from: 3,
    to: 7,
    hexCount: 5,
    totalCorrections: Object.values(hexResults).reduce((n, h) => n + h.fieldsCorrected, 0),
    verifyFailed,
    ledgerSummary: ledger.summary,
    hexResults,
    reportPath,
  };
  await writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(payload, null, 2));
  console.error(`Report: ${reportPath}`);
  process.exit(verifyFailed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
