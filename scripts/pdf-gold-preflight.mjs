#!/usr/bin/env node
/**
 * Phase 0 preflight: verify local Tier-0 PDFs exist and probe text extraction.
 *
 * Usage:
 *   node scripts/pdf-gold-preflight.mjs
 *   node scripts/pdf-gold-preflight.mjs --page wilhelm 231
 *
 * Requires poppler `pdftotext` on PATH for page probes (optional).
 */
import { spawnSync } from "node:child_process";
import { stat } from "node:fs/promises";
import { loadPdfManifest, resolvePdfPath, SOURCE_PDF_DIR } from "./lib/pdf-gold-paths.mjs";
import { hasLeggeOcrTools } from "./lib/legge-sbe-pdf-ocr.mjs";

const args = process.argv.slice(2);
const pageFlag = args.indexOf("--page");
const pageProbe =
  pageFlag >= 0
    ? { key: args[pageFlag + 1], page: Number(args[pageFlag + 2]) }
    : null;

function formatBytes(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} KB`;
  return `${n} B`;
}

function hasPdftotext() {
  const r = spawnSync("pdftotext", ["-v"], { encoding: "utf8" });
  return r.status === 0 || /pdftotext/i.test(r.stderr ?? "");
}

function extractPageText(pdfPath, page) {
  const r = spawnSync(
    "pdftotext",
    ["-f", String(page), "-l", String(page), "-layout", pdfPath, "-"],
    { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
  );
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(r.stderr?.trim() || `pdftotext exit ${r.status}`);
  }
  return (r.stdout ?? "").trim();
}

async function main() {
  console.log(`PDF gold preflight\nDirectory: ${SOURCE_PDF_DIR}\n`);

  const manifest = await loadPdfManifest();
  let ok = true;

  for (const [key, entry] of Object.entries(manifest.sources)) {
    try {
      const { abs } = await resolvePdfPath(key);
      const st = await stat(abs);
      console.log(`[ok] ${key}`);
      console.log(`     file: ${entry.file}`);
      console.log(`     size: ${formatBytes(st.size)}`);
      console.log(`     role: ${entry.role}`);
    } catch (err) {
      ok = false;
      console.error(`[missing] ${key}: ${err instanceof Error ? err.message : err}`);
    }
    console.log("");
  }

  const pdftotextOk = hasPdftotext();
  console.log(
    pdftotextOk
      ? "[ok] pdftotext found (poppler)"
      : "[warn] pdftotext not on PATH — install poppler for Wilhelm PDF extraction",
  );
  const leggeOcrOk = hasLeggeOcrTools();
  console.log(
    leggeOcrOk
      ? "[ok] pdftoppm + tesseract found (Legge SBE OCR)"
      : "[warn] pdftoppm/tesseract not on PATH — Legge SBE scan requires OCR tools",
  );

  if (pageProbe?.key && pageProbe.page) {
    console.log(`\nProbe: ${pageProbe.key} page ${pageProbe.page}`);
    if (!pdftotextOk) {
      console.error("Cannot probe without pdftotext.");
      process.exit(1);
    }
    const { abs } = await resolvePdfPath(pageProbe.key);
    const text = extractPageText(abs, pageProbe.page);
    const preview = text.slice(0, 1200);
    console.log(preview || "(empty — likely scan-only PDF; OCR phase required)");
    console.log(`\n(${text.length} chars extracted)`);
  } else if (pdftotextOk) {
    console.log("\nSpot probes (Wilhelm hex 56 judgment, hex 21 lines):");
    for (const [key, page] of [
      ["wilhelm", 231],
      ["wilhelm", 92],
    ]) {
      try {
        const { abs } = await resolvePdfPath(key);
        const text = extractPageText(abs, page);
        const snippet = text.replace(/\s+/g, " ").slice(0, 120);
        console.log(`  p.${page}: ${snippet || "(empty)"}${text.length > 120 ? "…" : ""}`);
      } catch (err) {
        ok = false;
        console.error(`  p.${page}: ${err instanceof Error ? err.message : err}`);
      }
    }
    if (leggeOcrOk) {
      console.log("\nLegge SBE scan (OCR probe — body start page 86):");
      try {
        const { ocrLeggePdfPage } = await import("./lib/legge-sbe-pdf-ocr.mjs");
        const { abs, entry } = await resolvePdfPath("legge");
        const start = Number(entry.ocrBodyStartPage) || 86;
        const text = ocrLeggePdfPage(abs, start, { dpi: 200 });
        const snippet = text.replace(/\s+/g, " ").slice(0, 140);
        console.log(`  p.${start}: ${snippet || "(empty)"}${text.length > 140 ? "…" : ""}`);
      } catch (err) {
        ok = false;
        console.error(`  legge OCR: ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  console.log("\nNext: npm run extract:gold:legge-sbe-pdf → verify --gold=pdf-legge");
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
