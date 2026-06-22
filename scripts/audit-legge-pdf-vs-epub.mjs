#!/usr/bin/env node
/**
 * Non-gate cross-check: Legge SBE XVI PDF gold vs sacred-texts EPUB.
 *
 * EPUB role: diagnostic cross-check for PDF OCR quality — NOT production gold.
 *
 * Usage: npm run audit:legge-pdf-vs-epub
 */
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseAllLeggeSbePdfOrThrow } from "./lib/hexagram-fidelity-legge-sbe-pdf.mjs";
import { parseAllLeggeEpubOrThrow } from "./lib/hexagram-fidelity-legge-epub.mjs";
import {
  classifyLeggePdfEpubField,
  leggeOracleFieldsFromRow,
} from "./lib/hexagram-fidelity-legge-epub-crosscheck.mjs";
import {
  listLeggeSbeBookPrimaryPatchFields,
  LEGGE_SBE_BOOK_PRIMARY_PATCHES,
} from "./lib/hexagram-fidelity-legge-sbe-book-primary.mjs";
import { textsMatch } from "./lib/hexagram-fidelity-normalize.mjs";

const ROOT = join(import.meta.dirname, "..");
const leggeModulePath = join(ROOT, "scripts", "iching_legge_translation.mjs");

/** @param {Record<number, object>} pdfGold @param {Record<number, object>} epubGold @param {string} label */
function auditPdfVsEpub(pdfGold, epubGold, label) {
  /** @type {Record<string, number>} */
  const counts = {
    strict_match: 0,
    book_primary_photo: 0,
    book_primary_label: 0,
    book_primary_spelling: 0,
    book_primary_yong: 0,
    pdf_bleed: 0,
    pdf_truncated: 0,
    pdf_corrupt: 0,
    wording: 0,
  };
  /** @type {object[]} */
  const rows = [];

  for (let n = 1; n <= 64; n++) {
    const pdfFields = leggeOracleFieldsFromRow(pdfGold[n], n);
    const epubFields = Object.fromEntries(
      leggeOracleFieldsFromRow(epubGold[n], n).map((f) => [f.field, f.text]),
    );
    for (const { field, text: pdf } of pdfFields) {
      const epub = String(epubFields[field] ?? "").trim();
      const status = classifyLeggePdfEpubField(pdf, epub, { hex: n, field });
      counts[status] = (counts[status] ?? 0) + 1;
      rows.push({ hex: n, field, status, pdf, epub });
    }
  }

  const compared = rows.length;
  const intentional =
    counts.book_primary_photo +
    counts.book_primary_label +
    counts.book_primary_spelling +
    counts.book_primary_yong;
  const actionable = compared - counts.strict_match - intentional;

  return {
    label,
    summary: {
      fieldsCompared: compared,
      ...counts,
      intentionalBookPrimary: intentional,
      actionable,
      bookReadyPct: Number(((counts.strict_match / compared) * 100).toFixed(2)),
      closurePct: Number((((counts.strict_match + intentional) / compared) * 100).toFixed(2)),
    },
    needsReview: rows.filter((r) =>
      ["pdf_bleed", "pdf_truncated", "pdf_corrupt", "wording"].includes(r.status),
    ),
    intentionalDiffs: rows.filter((r) =>
      ["book_primary_photo", "book_primary_label", "book_primary_spelling", "book_primary_yong"].includes(
        r.status,
      ),
    ),
  };
}

/** @param {Record<number, object>} raw @param {Record<number, object>} finalGold */
function epubRepairFields(raw, finalGold, epubGold) {
  /** @type {object[]} */
  const out = [];
  for (let n = 1; n <= 64; n++) {
    for (const { field, text: finalText } of leggeOracleFieldsFromRow(finalGold[n], n)) {
      const rawText = leggeOracleFieldsFromRow(raw[n], n).find((f) => f.field === field)?.text ?? "";
      const epubText = leggeOracleFieldsFromRow(epubGold[n], n).find((f) => f.field === field)?.text ?? "";
      if (
        !textsMatch(rawText, finalText, "legge") &&
        textsMatch(finalText, epubText, "legge")
      ) {
        out.push({ hex: n, field, raw: rawText, final: finalText });
      }
    }
  }
  return out;
}

async function main() {
  const [rawOcr, photoPatches, finalGold, epubGold, leggeModule] = await Promise.all([
    parseAllLeggeSbePdfOrThrow({ force: false, epubGuide: false, applyPatches: false }),
    parseAllLeggeSbePdfOrThrow({ force: false, epubGuide: false, applyPatches: true }),
    parseAllLeggeSbePdfOrThrow({ force: false, epubGuide: true, applyPatches: true }),
    parseAllLeggeEpubOrThrow(),
    import(pathToFileURL(leggeModulePath).href),
  ]);
  const bundle = leggeModule.default;

  const report = {
    generatedAt: new Date().toISOString(),
    policy: {
      bookPrimary: "Oxford SBE XVI scan OCR + photo-verified patches (no EPUB repair in production)",
      epubRole: "sacred-texts re-pack EPUB — diagnostic cross-check only, not production gold",
      photoPatches: listLeggeSbeBookPrimaryPatchFields(),
      photoPatchHexes: Object.keys(LEGGE_SBE_BOOK_PRIMARY_PATCHES).map(Number),
    },
    rawOcrVsEpub: auditPdfVsEpub(rawOcr, epubGold, "raw_ocr_no_epub_no_photo_patches"),
    photoPatchesVsEpub: auditPdfVsEpub(photoPatches, epubGold, "ocr_plus_photo_patches_no_epub"),
    finalGoldVsEpub: auditPdfVsEpub(finalGold, epubGold, "final_gold_epub_repair_plus_patches"),
    bundleVsPhotoGold: auditPdfVsEpub(
      Object.fromEntries(
        Array.from({ length: 64 }, (_, i) => {
          const n = i + 1;
          const row = bundle[String(n)] ?? {};
          return [
            n,
            {
              judgment: row.legge_judgment?.text ?? "",
              image: row.legge_image?.text ?? "",
              lines: Object.fromEntries(
                [1, 2, 3, 4, 5, 6].map((p) => [p, row.legge_lines?.[String(p)]?.text ?? ""]),
              ),
              yongJiu: n === 1 ? row.yong_supernumerary ?? "" : "",
              yongLiu: n === 2 ? row.yong_supernumerary ?? "" : "",
            },
          ];
        }),
      ),
      photoPatches,
      "bundle_vs_pdf_gold_no_epub",
    ),
    bundleVsFinalGold: auditPdfVsEpub(
      Object.fromEntries(
        Array.from({ length: 64 }, (_, i) => {
          const n = i + 1;
          const row = bundle[String(n)] ?? {};
          return [
            n,
            {
              judgment: row.legge_judgment?.text ?? "",
              image: row.legge_image?.text ?? "",
              lines: Object.fromEntries(
                [1, 2, 3, 4, 5, 6].map((p) => [p, row.legge_lines?.[String(p)]?.text ?? ""]),
              ),
              yongJiu: n === 1 ? row.yong_supernumerary ?? "" : "",
              yongLiu: n === 2 ? row.yong_supernumerary ?? "" : "",
            },
          ];
        }),
      ),
      finalGold,
      "bundle_vs_final_pdf_gold",
    ),
    epubRepairAdoptions: epubRepairFields(rawOcr, finalGold, epubGold),
  };

  await mkdir(join(ROOT, "reports"), { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = join(ROOT, "reports", `legge-pdf-vs-epub-${ts}.json`);
  await writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");

  console.log("=== Legge PDF vs EPUB (all oracle fields) ===");
  for (const block of [
    report.rawOcrVsEpub,
    report.photoPatchesVsEpub,
    report.bundleVsPhotoGold,
    report.finalGoldVsEpub,
    report.bundleVsFinalGold,
  ]) {
    console.log(`\n${block.label}:`);
    console.log(
      `  strict_match: ${block.summary.strict_match}/${block.summary.fieldsCompared} (${block.summary.bookReadyPct}%)`,
    );
    console.log(`  intentional book-primary: ${block.summary.intentionalBookPrimary}`);
    console.log(`  closure (match+intentional): ${block.summary.closurePct}%`);
    console.log(`  actionable: ${block.summary.actionable}`);
    console.log(`  pdf_bleed: ${block.summary.pdf_bleed}`);
    console.log(`  pdf_truncated: ${block.summary.pdf_truncated}`);
    console.log(`  pdf_corrupt: ${block.summary.pdf_corrupt}`);
    console.log(`  wording: ${block.summary.wording}`);
    if (block.label.includes("intentional") || block.intentionalDiffs?.length) {
      console.log(`  book_primary_photo: ${block.summary.book_primary_photo ?? 0}`);
      console.log(`  book_primary_label: ${block.summary.book_primary_label ?? 0}`);
    }
    if (block.needsReview?.length) {
      console.log(`  needsReview: ${block.needsReview.length}`);
    }
  }
  console.log(`\nEPUB repair adoptions (raw OCR → final via EPUB): ${report.epubRepairAdoptions.length}`);
  console.log(`Photo-verified patch fields: ${report.policy.photoPatches.length}`);
  console.log(`JSON: ${jsonPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
