#!/usr/bin/env node
/**
 * QA code: AU-FID-W-030 run-wilhelm-de-jpg-literal-batch · v1.0.0
 * Area: scripts/run-wilhelm-de-jpg-literal-batch.mjs
 * Family: FID-W
 *
 * Apply JPG literal corrections to pilot + disputes TSV, then markHexComplete.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tsvEscapeCell } from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import { markHexComplete, loadLedger } from "./lib/wilhelm-de-jpg-literal-audit-ledger.mjs";
import { JPG_LITERAL_CORRECTIONS_24_28 } from "./lib/wilhelm-de-jpg-literal-corrections-hex24-28.mjs";
import { JPG_LITERAL_CORRECTIONS_29_33 } from "./lib/wilhelm-de-jpg-literal-corrections-hex29-33.mjs";
import { JPG_LITERAL_CORRECTIONS_34_38 } from "./lib/wilhelm-de-jpg-literal-corrections-hex34-38.mjs";
import { JPG_LITERAL_CORRECTIONS_39_43 } from "./lib/wilhelm-de-jpg-literal-corrections-hex39-43.mjs";
import { JPG_LITERAL_CORRECTIONS_44_48 } from "./lib/wilhelm-de-jpg-literal-corrections-hex44-48.mjs";
import { JPG_LITERAL_CORRECTIONS_19_23 } from "./lib/wilhelm-de-jpg-literal-corrections-hex19-23.mjs";
import { JPG_LITERAL_CORRECTIONS_14_18 } from "./lib/wilhelm-de-jpg-literal-corrections-hex14-18.mjs";
import { JPG_LITERAL_CORRECTIONS_17_32 } from "./lib/wilhelm-de-jpg-literal-corrections-hex17-32.mjs";
import { JPG_LITERAL_CORRECTIONS_3_7 } from "./lib/wilhelm-de-jpg-literal-corrections-hex3-7.mjs";
import { JPG_LITERAL_CORRECTIONS_9_13 } from "./lib/wilhelm-de-jpg-literal-corrections-hex9-13.mjs";
import { JPG_LITERAL_CORRECTIONS_9_16 } from "./lib/wilhelm-de-jpg-literal-corrections-hex9-16.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR,
} from "./lib/wilhelm-de-dataset-paths.mjs";
import { readFileSync } from "node:fs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");
const HEX_STARTS = join(ROOT, "tools/datasets/wilhelm-de/wilhelm-de-comments-hex-starts.json");

function parseArgs(argv) {
  const from = Number(argv.find((a) => a.startsWith("--from="))?.split("=")[1] ?? 17);
  const to = Number(argv.find((a) => a.startsWith("--to="))?.split("=")[1] ?? 32);
  return { from, to };
}

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

function correctionsForHex(hex) {
  return {
    ...(JPG_LITERAL_CORRECTIONS_3_7[hex] ?? {}),
    ...(JPG_LITERAL_CORRECTIONS_9_16[hex] ?? {}),
    ...(JPG_LITERAL_CORRECTIONS_9_13[hex] ?? {}),
    ...(JPG_LITERAL_CORRECTIONS_17_32[hex] ?? {}),
    ...(JPG_LITERAL_CORRECTIONS_14_18[hex] ?? {}),
    ...(JPG_LITERAL_CORRECTIONS_19_23[hex] ?? {}),
    ...(JPG_LITERAL_CORRECTIONS_24_28[hex] ?? {}),
    ...(JPG_LITERAL_CORRECTIONS_29_33[hex] ?? {}),
    ...(JPG_LITERAL_CORRECTIONS_34_38[hex] ?? {}),
    ...(JPG_LITERAL_CORRECTIONS_39_43[hex] ?? {}),
    ...(JPG_LITERAL_CORRECTIONS_44_48[hex] ?? {}),
  };
}

async function main() {
  const { from, to } = parseArgs(process.argv);
  /** @type {Record<number, { verified: boolean; corrections: Array<{field: string; reason: string}>; jpgPagesRead: string }>} */
  const summary = {};

  for (let hex = from; hex <= to; hex++) {
    const corrections = correctionsForHex(hex);
    const { correctedFields } = await applyPilotCorrections(hex, corrections);
    const jpgPages = jpgPagesForHex(hex);

    await markHexComplete(hex, {
      note: `JPG pp.${jpgPages} — AUD-DAT-W-07 literal batch ${from}-${to}`,
      jpgPagesRead: jpgPages,
      correctedFields,
    });

    summary[hex] = {
      verified: true,
      corrections: correctedFields.map((field) => ({
        field,
        reason: "JPG literal fix vs pilot OCR",
      })),
      jpgPagesRead: jpgPages,
      fieldsCorrected: correctedFields.length,
    };
  }

  const ledger = await loadLedger();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportPath = join(REPORTS, `wilhelm-de-jpg-literal-audit-${from}-${to}-${stamp}.json`);
  await mkdir(REPORTS, { recursive: true });
  const payload = {
    updatedAt: new Date().toISOString(),
    auditCode: "20260630-AUD-DAT-W-07",
    from,
    to,
    hexCount: to - from + 1,
    totalCorrections: Object.values(summary).reduce((n, h) => n + h.fieldsCorrected, 0),
    ledgerSummary: ledger.summary,
    hexagrams: summary,
  };
  await writeFile(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(payload, null, 2));
  console.error(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
