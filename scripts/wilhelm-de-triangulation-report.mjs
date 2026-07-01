#!/usr/bin/env node

/**
 * QA code: AU-FID-W-008 wilhelm-de-triangulation · v1.0.0
 * Area: scripts/wilhelm-de-triangulation-report.mjs
 * Family: FID-W
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadWilhelmDePdfGoldOrThrow } from "./lib/wilhelm-de-pdf-gold.mjs";
import { normalizeWilhelmDeTxtText } from "./lib/wilhelm-de-64hex-txt.mjs";
import { loadBundle } from "./lib/hexagram-fidelity-fetch.mjs";
import { runtimeHexToReviewRows, fieldKeyString, verbatimTextsEqual } from "./lib/runtime-dataset-fields.mjs";
import { WILHELM_DE_BOOK_ONE_MERGED, WILHELM_BAYNES_ARCHIVE_BUNDLE } from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function classifyDelta({ merged, baynes, gold }) {
  const nm = normalizeWilhelmDeTxtText(merged);
  const nb = normalizeWilhelmDeTxtText(baynes);
  const ng = normalizeWilhelmDeTxtText(gold);
  if (verbatimTextsEqual(nm, ng)) return "match_gold";
  if (verbatimTextsEqual(nm, nb)) return "edition_diff_unlikely";
  if (nm.length < ng.length * 0.5) return "ocr_noise";
  if (!ng && nm) return "needs_human";
  return "edition_diff";
}

async function main() {
  const merged = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_MERGED, "utf8"));
  const goldMap = await loadWilhelmDePdfGoldOrThrow();
  let baynesBundle;
  try {
    baynesBundle = JSON.parse(await readFile(WILHELM_BAYNES_ARCHIVE_BUNDLE, "utf8"));
  } catch {
    baynesBundle = await loadBundle("wilhelm");
  }

  /** @type {Array<object>} */
  const rows = [];
  for (let n = 1; n <= 64; n++) {
    const fields = merged.hexagrams[String(n)]?.fields ?? {};
    const gold = goldMap[n];
    const baynesHex = baynesBundle.hexagrams?.find((h) => h.number === n);
    const runtimeRows = baynesHex ? runtimeHexToReviewRows(baynesHex) : [];
    const baynesByKey = new Map(runtimeRows.map((r) => [fieldKeyString(r.field, r.linePos), r.text]));

    const oracleKeys = [
      ["judgment", "judgment_oraculo", null],
      ["image", "image_oraculo", null],
      ...Array.from({ length: 6 }, (_, i) => [`line:${i + 1}`, `L${i + 1}_oraculo`, i + 1]),
    ];
    if (n === 1) oracleKeys.push(["yongJiu", "yong_oraculo", null]);
    if (n === 2) oracleKeys.push(["yongLiu", "yong_oraculo", null]);

    for (const [fieldKey, maestroKey] of oracleKeys) {
      const mergedText = fields[maestroKey] ?? "";
      const goldText =
        fieldKey === "judgment"
          ? gold?.judgment ?? ""
          : fieldKey === "image"
            ? gold?.image ?? ""
            : fieldKey.startsWith("line:")
              ? gold?.lines?.[Number(fieldKey.split(":")[1])] ?? ""
              : fieldKey === "yongJiu"
                ? gold?.yongJiu ?? ""
                : gold?.yongLiu ?? "";
      const baynesText = baynesByKey.get(fieldKey) ?? "";
      rows.push({
        hex: n,
        field: fieldKey,
        mergedOcr: mergedText,
        pdfGold: goldText,
        baynesRef: baynesText,
        classification: classifyDelta({ merged: mergedText, baynes: baynesText, gold: goldText }),
      });
    }
  }

  const summary = {
    total: rows.length,
    match_gold: rows.filter((r) => r.classification === "match_gold").length,
    edition_diff: rows.filter((r) => r.classification === "edition_diff").length,
    ocr_noise: rows.filter((r) => r.classification === "ocr_noise").length,
    needs_human: rows.filter((r) => r.classification === "needs_human").length,
  };

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = join(ROOT, "reports", `wilhelm-de-triangulation-${ts}.json`);
  await mkdir(join(ROOT, "reports"), { recursive: true });
  await writeFile(outPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, rows }, null, 2)}\n`, "utf8");

  console.log(`Triangulation: ${summary.match_gold}/${summary.total} match gold`);
  console.log(`Report: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
