#!/usr/bin/env node
/**
 * QA code: AU-FID-W-009 wilhelm-de-baynes-comparison · v1.0.0
 * Area: scripts/wilhelm-de-baynes-comparison-report.mjs
 * Family: FID-W
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WILHELM_DE_BOOK_ONE_MERGED,
  WILHELM_DE_COMMENTS_MERGED,
  WILHELM_BAYNES_BOOK_ONE_PARSED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function nonEmpty(text) {
  return String(text ?? "").trim().length > 0;
}

function classifyPair(deText, baynesText) {
  const de = nonEmpty(deText);
  const en = nonEmpty(baynesText);
  if (de && en) return "translation_pair";
  if (de && !en) return "de_only";
  if (!de && en) return "baynes_only";
  return "both_empty";
}

function preview(text, max = 120) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function tsvEscape(value) {
  return String(value ?? "").replace(/\t/g, " ").replace(/\r?\n/g, " ").replace(/"/g, '""');
}

function oracleFieldSpecs(hexNumber) {
  const specs = [
    ["intro", "intro", "intro"],
    ["judgment", "judgment_oraculo", "judgment_oraculo"],
    ["image", "image_oraculo", "image_oraculo"],
    ...Array.from({ length: 6 }, (_, i) => [
      `line:${i + 1}`,
      `L${i + 1}_oraculo`,
      `L${i + 1}_oraculo`,
    ]),
  ];
  if (hexNumber === 1 || hexNumber === 2) {
    specs.push(["yong", "yong_oraculo", "yong_oraculo"]);
  }
  return specs;
}

function commentaryFieldSpecs(hexNumber) {
  const specs = [
    ["judgment_ten_wings", "commentary_decision", "judgment_comentario"],
    ["image_ten_wings", "commentary_image", "image_comentario"],
    ...Array.from({ length: 6 }, (_, i) => [
      `line:${i + 1}_ten_wings`,
      `L${i + 1}_b_comentario`,
      `L${i + 1}_comentario`,
    ]),
  ];
  if (hexNumber === 1 || hexNumber === 2) {
    specs.push(["wen_yen", "wen_yen", null]);
  }
  if (hexNumber >= 3) {
    specs.push(["sequence", "sequence", null]);
  }
  return specs;
}

async function main() {
  const deOracle = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_MERGED, "utf8"));
  const deComments = JSON.parse(await readFile(WILHELM_DE_COMMENTS_MERGED, "utf8"));
  const baynesMaestro = JSON.parse(await readFile(WILHELM_BAYNES_BOOK_ONE_PARSED, "utf8"));

  /** @type {Array<object>} */
  const rows = [];

  for (let n = 1; n <= 64; n++) {
    const deFields = deOracle.hexagrams[String(n)]?.fields ?? {};
    const deCommentFields = deComments.hexagrams[String(n)]?.fields ?? {};
    const baynesFields = baynesMaestro.hexagrams[String(n)]?.fields ?? {};

    for (const [fieldKey, deKey, baynesKey] of oracleFieldSpecs(n)) {
      const deText = deFields[deKey] ?? "";
      const baynesText = baynesFields[baynesKey] ?? "";
      rows.push({
        section: "oracle",
        hex: n,
        field: fieldKey,
        classification: classifyPair(deText, baynesText),
        dePreview: preview(deText),
        baynesPreview: preview(baynesText),
      });
    }

    for (const [fieldKey, deKey, baynesKey] of commentaryFieldSpecs(n)) {
      const deText = deCommentFields[deKey] ?? "";
      const baynesText = baynesKey ? (baynesFields[baynesKey] ?? "") : "";
      rows.push({
        section: "ten_wings",
        hex: n,
        field: fieldKey,
        classification: classifyPair(deText, baynesText),
        dePreview: preview(deText),
        baynesPreview: preview(baynesText),
      });
    }
  }

  const summary = {
    total: rows.length,
    oracle: summarizeSection(rows, "oracle"),
    ten_wings: summarizeSection(rows, "ten_wings"),
    de_only: rows.filter((r) => r.classification === "de_only"),
    baynes_only: rows.filter((r) => r.classification === "baynes_only"),
    both_empty: rows.filter((r) => r.classification === "both_empty"),
  };

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = `wilhelm-de-baynes-comparison-${ts}`;
  const jsonPath = join(ROOT, "reports", `${baseName}.json`);
  const tsvPath = join(ROOT, "reports", `${baseName}.tsv`);

  await mkdir(join(ROOT, "reports"), { recursive: true });
  await writeFile(
    jsonPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), summary, rows }, null, 2)}\n`,
    "utf8",
  );

  const tsvHeader = ["section", "hex", "field", "classification", "de_preview", "baynes_preview"].join("\t");
  const tsvBody = rows
    .map((r) =>
      [r.section, r.hex, r.field, r.classification, r.dePreview, r.baynesPreview]
        .map(tsvEscape)
        .join("\t"),
    )
    .join("\n");
  await writeFile(tsvPath, `${tsvHeader}\n${tsvBody}\n`, "utf8");

  console.log(`Oracle translation pairs: ${summary.oracle.translation_pair}/${summary.oracle.total}`);
  console.log(`Ten Wings translation pairs: ${summary.ten_wings.translation_pair}/${summary.ten_wings.total}`);
  console.log(`DE-only gaps: ${summary.de_only.length}`);
  console.log(`Baynes-only gaps: ${summary.baynes_only.length}`);
  console.log(`Both empty: ${summary.both_empty.length}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`TSV: ${tsvPath}`);
}

function summarizeSection(rows, section) {
  const subset = rows.filter((r) => r.section === section);
  return {
    total: subset.length,
    translation_pair: subset.filter((r) => r.classification === "translation_pair").length,
    de_only: subset.filter((r) => r.classification === "de_only").length,
    baynes_only: subset.filter((r) => r.classification === "baynes_only").length,
    both_empty: subset.filter((r) => r.classification === "both_empty").length,
  };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
