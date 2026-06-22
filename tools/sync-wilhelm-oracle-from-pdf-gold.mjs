#!/usr/bin/env node
/**
 * Sync Wilhelm/Baynes oracle fields from Pantheon 1950 PDF gold (book-primary).
 *
 * Source chain: PDF OCR → print-verified photo overrides → Baynes tier-2 supplements.
 * Images stored oracle-only (no Wilhelm commentary bleed).
 *
 * Usage:
 *   npm run extract:gold:wilhelm-pdf
 *   npm run sync:wilhelm-oracle-from-pdf-gold
 *   npm run build:data
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadWilhelmPdfGoldOrThrow } from "../scripts/lib/wilhelm-pdf-gold.mjs";
import {
  resolveWilhelmJudgmentForIngest,
  resolveWilhelmLineForIngest,
} from "../scripts/lib/hexagram-fidelity-wilhelm-baynes-supplement.mjs";
import { wilhelmImageOracleOnly } from "../scripts/lib/hexagram-fidelity-normalize.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const wilhelmOut = join(root, "scripts", "iching_wilhelm_translation.mjs");

function cleanOracleText(text) {
  return String(text ?? "")
    .replace(/\s+\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function fieldUsable(text, minLen = 10) {
  const t = String(text ?? "").trim();
  if (!t || t.length < minLen) return false;
  if (/^\d{1,3}$/.test(t)) return false;
  if (/^See pp\./i.test(t)) return false;
  return true;
}

function pickOracleField(pdfVal, prevVal, { image = false } = {}) {
  let pdfText = cleanOracleText(pdfVal);
  if (image) pdfText = cleanOracleText(wilhelmImageOracleOnly(pdfText));
  const prevText = cleanOracleText(prevVal);
  if (fieldUsable(pdfText, image ? 20 : 10)) return pdfText;
  if (fieldUsable(prevText, image ? 20 : 10)) return prevText;
  return pdfText || prevText;
}

async function main() {
  const existing = (await import(pathToFileURL(wilhelmOut).href)).default;
  console.log("Loading Wilhelm Pantheon PDF gold (OCR + print-verified + Baynes tier-2)…");
  const gold = await loadWilhelmPdfGoldOrThrow({ force: false });

  const keptFromBundle = [];
  const issues = [];

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const row = existing[key];
    const pdf = gold[n];
    if (!row) throw new Error(`Existing Wilhelm dataset missing hex ${n}`);
    if (!pdf) throw new Error(`PDF gold missing hex ${n}`);

    const prevJ = row.wilhelm_judgment?.text ?? "";
    const prevI = row.wilhelm_image?.text ?? "";
    const pdfJ = resolveWilhelmJudgmentForIngest(n, pdf.judgment ?? "", "");
    const judgment = pickOracleField(pdfJ, prevJ);
    if (!fieldUsable(judgment)) {
      issues.push({ n, field: "judgment", why: "empty after resolve" });
    } else if (!fieldUsable(pdfJ) && fieldUsable(prevJ)) {
      keptFromBundle.push({ n, field: "judgment" });
    }
    row.wilhelm_judgment = { text: judgment };

    const pdfImage = pickOracleField(pdf.image ?? "", prevI, { image: true });
    if (!fieldUsable(pdfImage, 20)) {
      issues.push({ n, field: "image", why: "empty" });
    } else if (!fieldUsable(cleanOracleText(wilhelmImageOracleOnly(pdf.image ?? "")), 20) && fieldUsable(prevI, 20)) {
      keptFromBundle.push({ n, field: "image" });
    }
    row.wilhelm_image = { text: pdfImage };

    const prevLines = row.wilhelm_lines ?? {};
    const lines = {};
    for (let pos = 1; pos <= 6; pos++) {
      const pdfLine = resolveWilhelmLineForIngest(n, pos, pdf.lines?.[pos] ?? "", "");
      const prevText = prevLines[String(pos)]?.text ?? "";
      const resolved = pickOracleField(pdfLine, prevText);
      lines[String(pos)] = { text: resolved };
      if (!fieldUsable(resolved, 8)) {
        issues.push({ n, pos, why: "empty line" });
      } else if (!fieldUsable(pdfLine, 8) && fieldUsable(prevText, 8)) {
        keptFromBundle.push({ n, field: `L${pos}` });
      }
    }
    row.wilhelm_lines = lines;

    if (pdf.yongJiu?.trim()) row.yong_jiu = cleanOracleText(pdf.yongJiu);
    if (pdf.yongLiu?.trim()) row.yong_liu = cleanOracleText(pdf.yongLiu);

    const filled = Object.values(lines).filter((l) => l.text.length > 0).length;
    console.log(
      `  Hex ${String(n).padStart(2, "0")}: J=${judgment.length}ch img=${pdfImage.length}ch lines=${filled}/6`,
    );
  }

  const body =
    "// Oracle text synced from Wilhelm/Baynes Pantheon 1950 PDF gold (book-primary).\n" +
    "// Source: tools/source-pdfs/wilhelm-baynes-1950-pantheon.pdf + print-verified overrides.\n" +
    `// Synced: ${new Date().toISOString()}\n\n` +
    "export default " +
    JSON.stringify(existing, null, 2) +
    ";\n";

  await writeFile(wilhelmOut, body, "utf8");
  console.log(`\nWrote ${wilhelmOut}`);

  if (keptFromBundle.length) {
    console.warn(`\nKept ${keptFromBundle.length} fields from previous bundle (PDF still broken):`);
    for (const it of keptFromBundle.slice(0, 25)) console.warn("  ", it);
  }

  if (issues.length) {
    console.warn(`\nFinished with ${issues.length} empty/unresolved fields:`);
    for (const it of issues.slice(0, 20)) console.warn("  ", it);
    process.exitCode = 1;
  } else {
    console.log("\nAll 64 hexagrams synced from PDF gold.");
  }
}

const isCli = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  await main();
}
