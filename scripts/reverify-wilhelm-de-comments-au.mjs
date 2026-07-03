#!/usr/bin/env node
/**
 * QA code: AU-FID-W-045 reverify-wilhelm-de-comments-au · v1.1.0
 * Area: scripts/reverify-wilhelm-de-comments-au.mjs
 * Family: FID-W
 *
 * Post-attestation: pilot AU vs gold vs merged (content) vs ledger.
 * Meta overlays (chinese, hex_font, chinese_roman) excluded from merged diff.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  auTextsEqual,
  isAuEstadoClosed,
  parseAnnaCommentsAuVerticalTsv,
  readAuGoldFieldText,
  WILHELM_DE_COMMENTS_MERGED_META_OVERLAY_KEYS,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { WILHELM_COMMENTS_MANUAL_FIELDS } from "./lib/wilhelm-comments-manual-fields.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  WILHELM_DE_COMMENTS_AU_GOLD_JSON,
  WILHELM_DE_COMMENTS_MERGED,
} from "./lib/wilhelm-de-dataset-paths.mjs";
import { WILHELM_DE_JPG_LITERAL_LEDGER } from "./lib/wilhelm-de-jpg-literal-audit-ledger.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

function parseArgs(argv) {
  const from = Number(argv.find((a) => a.startsWith("--from="))?.split("=")[1] ?? 1);
  const to = Number(argv.find((a) => a.startsWith("--to="))?.split("=")[1] ?? 64);
  return { from, to };
}

function main() {
  const { from, to } = parseArgs(process.argv);
  const merged = JSON.parse(readFileSync(WILHELM_DE_COMMENTS_MERGED, "utf8"));
  const auGold = JSON.parse(readFileSync(WILHELM_DE_COMMENTS_AU_GOLD_JSON, "utf8"));
  const ledger = JSON.parse(readFileSync(WILHELM_DE_JPG_LITERAL_LEDGER, "utf8"));

  /** @type {Array<object>} */
  const findings = [];
  let pilotClosed = 0;
  let pilotPending = 0;
  let pilotVsMergedContent = 0;
  let pilotVsGold = 0;
  let goldVsMergedContent = 0;
  let ledgerIssues = 0;

  for (let hex = from; hex <= to; hex++) {
    const pilotPath = join(
      WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
      `wilhelm-de-comments-hex-${hex}-pilot-au.tsv`,
    );
    const pilot = parseAnnaCommentsAuVerticalTsv(readFileSync(pilotPath, "utf8"));
    const mFields = merged.hexagrams[String(hex)]?.fields ?? {};
    const gFields = auGold.hexagrams[String(hex)]?.fields ?? {};
    const ledgerHex = ledger.hexagrams[String(hex)];

    for (const { key } of WILHELM_COMMENTS_MANUAL_FIELDS) {
      if (key === "hex") continue;
      const au = pilot.fields[key] ?? {};
      const pdf = au.contenido_pdf ?? "";
      const estado = au.au_estado ?? "pendiente";

      if (!isAuEstadoClosed(estado)) {
        pilotPending++;
        findings.push({ hex, field: key, kind: "pilot_pending", au_estado: estado });
        continue;
      }
      pilotClosed++;

      const ledgerField = ledgerHex?.fields?.[key];
      if (!ledgerField) {
        ledgerIssues++;
        findings.push({ hex, field: key, kind: "ledger_missing_field" });
      } else if (!["verified", "vacio_en_libro"].includes(ledgerField.status)) {
        ledgerIssues++;
        findings.push({
          hex,
          field: key,
          kind: "ledger_bad_status",
          ledgerStatus: ledgerField.status,
        });
      }

      const goldPdf = readAuGoldFieldText(gFields[key]);
      const mergedValue = mFields[key] ?? "";
      const skipMergedCompare = WILHELM_DE_COMMENTS_MERGED_META_OVERLAY_KEYS.has(key);

      if (!auTextsEqual(pdf, goldPdf)) {
        pilotVsGold++;
        if (findings.filter((f) => f.kind === "pilot_ne_gold").length < 15) {
          findings.push({ hex, field: key, kind: "pilot_ne_gold" });
        }
      }

      if (!skipMergedCompare) {
        if (!auTextsEqual(pdf, mergedValue)) {
          pilotVsMergedContent++;
          if (findings.filter((f) => f.kind === "pilot_ne_merged").length < 15) {
            findings.push({ hex, field: key, kind: "pilot_ne_merged" });
          }
        }
        if (!auTextsEqual(goldPdf, mergedValue)) {
          goldVsMergedContent++;
          if (findings.filter((f) => f.kind === "gold_ne_merged").length < 15) {
            findings.push({ hex, field: key, kind: "gold_ne_merged" });
          }
        }
      }
    }
  }

  const findingsTotal =
    pilotPending + pilotVsGold + pilotVsMergedContent + goldVsMergedContent + ledgerIssues;

  const ok =
    findingsTotal === 0 &&
    pilotPending === 0 &&
    ledger.summary?.fieldsVerified + ledger.summary?.fieldsVacio ===
      ledger.summary?.fieldsTotal;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportPath = join(REPORTS, `wilhelm-de-comments-au-reverify-${from}-${to}-${stamp}.json`);
  mkdirSync(REPORTS, { recursive: true });
  const payload = {
    updatedAt: new Date().toISOString(),
    auditCode: "20260630-AUD-DAT-W-07",
    from,
    to,
    ok,
    summary: {
      pilotClosed,
      pilotPending,
      pilotVsGold,
      pilotVsMergedContent,
      goldVsMergedContent,
      ledgerIssues,
      findingsTotal,
      ledgerAttestation: ledger.summary,
      mergedMetaOverlayExcluded: [...WILHELM_DE_COMMENTS_MERGED_META_OVERLAY_KEYS],
    },
    findings: findings.slice(0, 50),
    findingsTruncated: findings.length > 50,
  };
  writeFileSync(reportPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(
    `Reverify ${from}-${to}: ${ok ? "PASS (sin hallazgos)" : `FAIL (${findingsTotal} hallazgos)`}`,
  );
  console.log(JSON.stringify(payload.summary, null, 2));
  console.error(`Report: ${reportPath}`);
  process.exit(ok ? 0 : 1);
}

main();
