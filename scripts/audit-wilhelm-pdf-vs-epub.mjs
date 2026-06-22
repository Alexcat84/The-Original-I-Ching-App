#!/usr/bin/env node
/**
 * Non-gate cross-check: Wilhelm PDF gold vs Bollingen EPUB (statement-only blockquotes).
 *
 * EPUB role: repair-only anchor for PDF OCR bleed/truncation — NOT production gold alone.
 *
 * Usage: npm run audit:wilhelm-pdf-vs-epub
 */
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { loadWilhelmPdfFullText } from "./lib/pdf-text-extract.mjs";
import { parseAllWilhelmPdfOrThrow } from "./lib/hexagram-fidelity-wilhelm-pdf.mjs";
import { applyWilhelmPdfPrintVerified } from "./lib/hexagram-fidelity-wilhelm-pdf-verified.mjs";
import { applyWilhelmBaynesSupplements } from "./lib/hexagram-fidelity-wilhelm-baynes-supplement.mjs";
import { loadWilhelmPdfGoldOrThrow } from "./lib/wilhelm-pdf-gold.mjs";
import { parseAllWilhelmEpubOrThrow } from "./lib/hexagram-fidelity-wilhelm-epub.mjs";
import { classifyWilhelmPdfEpubLine } from "./lib/hexagram-fidelity-wilhelm-epub-crosscheck.mjs";

const ROOT = join(import.meta.dirname, "..");

async function loadRawPdfGold() {
  const pdfText = await loadWilhelmPdfFullText({ force: false });
  return applyWilhelmPdfPrintVerified(parseAllWilhelmPdfOrThrow(pdfText));
}

async function main() {
  const [rawPdfGold, finalPdfGold, epubGold] = await Promise.all([
    loadRawPdfGold(),
    loadWilhelmPdfGoldOrThrow({ force: false }),
    parseAllWilhelmEpubOrThrow(),
  ]);

  /** @param {Record<number, object>} pdfGold @param {string} label */
  function auditPdfVsEpub(pdfGold, label) {
    const counts = {
      strict_match: 0,
      pdf_bleed: 0,
      pdf_truncated: 0,
      wording: 0,
    };
    /** @type {object[]} */
    const rows = [];

    for (let n = 1; n <= 64; n++) {
      for (let p = 1; p <= 6; p++) {
        const pdf = String(pdfGold[n]?.lines?.[p] ?? "").trim();
        const epub = String(epubGold[n]?.lines?.[p] ?? "").trim();
        if (!pdf && !epub) continue;
        const status = classifyWilhelmPdfEpubLine(pdf, epub);
        counts[status] = (counts[status] ?? 0) + 1;
        rows.push({ hex: n, line: p, status, pdf, epub });
      }
    }

    return {
      label,
      summary: {
        linesCompared: rows.length,
        ...counts,
        bookReadyPct: Number(((counts.strict_match / rows.length) * 100).toFixed(2)),
      },
      needsReview: rows.filter(
        (r) => r.status === "pdf_bleed" || r.status === "wording" || r.status === "pdf_truncated",
      ),
    };
  }

  const report = {
    generatedAt: new Date().toISOString(),
    policy: {
      bookPrimary: "Pantheon 1950 PDF + print-verified + Baynes tier-2",
      epubRole: "Princeton Bollingen EPUB 2011 — statement-only cross-check / repair-only",
      outOfScope: "Wilhelm/Baynes commentary (EPUB blockquote boundary is clean)",
    },
    rawPdfVsEpub: auditPdfVsEpub(rawPdfGold, "raw_pdf_before_epub_trim"),
    finalPdfVsEpub: auditPdfVsEpub(finalPdfGold, "final_pdf_after_epub_trim"),
  };

  await mkdir(join(ROOT, "reports"), { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = join(ROOT, "reports", `wilhelm-pdf-vs-epub-${ts}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");

  console.log("=== Wilhelm PDF vs EPUB (lines) ===");
  for (const block of [report.rawPdfVsEpub, report.finalPdfVsEpub]) {
    console.log(`\n${block.label}:`);
    console.log(`  strict_match: ${block.summary.strict_match}/${block.summary.linesCompared} (${block.summary.bookReadyPct}%)`);
    console.log(`  pdf_bleed: ${block.summary.pdf_bleed}`);
    console.log(`  pdf_truncated: ${block.summary.pdf_truncated}`);
    console.log(`  wording: ${block.summary.wording}`);
  }
  console.log(`\nJSON: ${jsonPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
