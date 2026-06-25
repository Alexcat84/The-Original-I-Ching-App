#!/usr/bin/env node

/**
 * QA code: AU-FID-W-006 wilhelm-pdf-vs-parma · v1.0.0
 * Area: scripts/audit-wilhelm-pdf-vs-parma
 * Family: FID-W
 */

/**
 * Non-gate cross-check: Wilhelm PDF gold vs Parma mirror (statement-only lines).
 *
 * Oracle scope: literal statement text + punctuation only — NO Wilhelm commentary.
 * Parma: structural hint for statement boundaries; NOT production gold (has omissions + bleed).
 *
 * Usage: npm run audit:wilhelm-pdf-vs-parma
 */
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { loadParmaHtml } from "./lib/hexagram-fidelity-fetch.mjs";
import { parseAllParmaWilhelm } from "./lib/hexagram-fidelity-parma.mjs";
import {
  applyWilhelmBaynesSupplements,
  resolveWilhelmLineForIngest,
} from "./lib/hexagram-fidelity-wilhelm-baynes-supplement.mjs";
import { loadWilhelmPdfGoldOrThrow } from "./lib/wilhelm-pdf-gold.mjs";
import { classifyWilhelmPdfParmaLine } from "./lib/hexagram-fidelity-wilhelm-parma-crosscheck.mjs";

const ROOT = join(import.meta.dirname, "..");

async function main() {
  const pdfGold = await loadWilhelmPdfGoldOrThrow({ force: false });
  const parmaGold = applyWilhelmBaynesSupplements(
    parseAllParmaWilhelm(await loadParmaHtml({ live: false })),
  );

  /** @type {object[]} */
  const rows = [];
  const counts = {
    strict_match: 0,
    pdf_bleed: 0,
    pdf_truncated: 0,
    parma_suspect_pdf_shorter: 0,
    wording: 0,
  };

  for (let n = 1; n <= 64; n++) {
    for (let p = 1; p <= 6; p++) {
      const pdf = String(pdfGold[n]?.lines?.[p] ?? "").trim();
      const parma = resolveWilhelmLineForIngest(
        n,
        p,
        parmaGold[n]?.lines?.[p] ?? "",
        "",
      );
      if (!pdf && !parma) continue;

      const status = classifyWilhelmPdfParmaLine(pdf, parma, n, p);
      counts[status] = (counts[status] ?? 0) + 1;
      rows.push({ hex: n, line: p, status, pdf, parma });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    policy: {
      inScope: "literal oracle statement + punctuation/signs (Pantheon 1950)",
      outOfScope: "Wilhelm/Baynes commentary after the statement",
      parmaRole: "cross-check for statement boundaries only — not production gold",
    },
    note:
      "Book-closed gate = PDF + print-verified + Baynes tier-2. This audit uses Parma cautiously: " +
      "pdf_bleed → trim PDF; pdf_truncated → photo/book (do NOT auto-fill from Parma); " +
      "parma_suspect → Parma likely wrong (known bleed).",
    summary: {
      linesCompared: rows.length,
      ...counts,
      bookReadyPct: Number(((counts.strict_match / rows.length) * 100).toFixed(2)),
    },
    needsPhotoOrManualReview: rows.filter(
      (r) =>
        r.status === "pdf_bleed" ||
        r.status === "wording" ||
        r.status === "pdf_truncated",
    ),
  };

  await mkdir(join(ROOT, "reports"), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = join(ROOT, "reports", `wilhelm-pdf-vs-parma-${stamp}.json`);
  await writeFile(outPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Wilhelm PDF vs Parma cross-check (non-gate)");
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(`\nReport: ${outPath}`);
  console.log("\nPDF bleed samples (first 8):");
  for (const r of rows.filter((x) => x.status === "pdf_bleed").slice(0, 8)) {
    console.log(`  #${r.hex} L${r.line}: PDF=${JSON.stringify(r.pdf.slice(0, 90))}`);
  }
}

await main();
