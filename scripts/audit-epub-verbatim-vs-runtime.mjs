#!/usr/bin/env node

/**
 * QA code: AU-FID-001 epub-verbatim-vs-runtime · v1.0.0
 * Area: scripts/audit-epub-verbatim-vs-runtime
 * Family: FID
 */

/**
 * Phase 1+3 gate: runtime bundles vs EPUB oracle text (verbatim parser, no post-strip heuristics).
 * Reports: reports/epub-verbatim-audit-{ts}.{json,md}
 * Exit 1 if any mismatch (blocking gate).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBundle } from "./lib/hexagram-fidelity-fetch.mjs";
import { parseAllWilhelmEpubOrThrow } from "./lib/hexagram-fidelity-wilhelm-epub.mjs";
import { parseAllLeggeEpubOrThrow } from "./lib/hexagram-fidelity-legge-epub.mjs";
import {
  epubGoldToReviewRows,
  fieldKeyString,
  runtimeHexToReviewRows,
  verbatimTextsEqual,
} from "./lib/runtime-dataset-fields.mjs";
import {
  applyWilhelmEpubJudgmentTypoFix,
  isWilhelmIntentionalEpubDelta,
} from "./lib/wilhelm-epub-typo-fixes.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const OUT = join(ROOT, "reports");

/**
 * @param {"wilhelm"|"legge"} translator
 * @param {Awaited<ReturnType<typeof loadBundle>>} bundle
 * @param {Record<number, object>} epubGold
 */
function auditTranslator(translator, bundle, epubGold) {
  /** @type {Array<object>} */
  const mismatches = [];
  /** @type {Array<object>} */
  const matches = [];

  for (const hex of bundle.hexagrams) {
    const gold = epubGold[hex.number];
    if (!gold) {
      mismatches.push({
        translator,
        hex: hex.number,
        field: "*",
        fieldKey: "*",
        runtime: "",
        epub: "",
        reason: "missing_epub_gold",
      });
      continue;
    }

    const runtimeRows = runtimeHexToReviewRows(hex);
    const epubRows = epubGoldToReviewRows(gold, hex.number);
    const epubByKey = new Map(
      epubRows.map((r) => [fieldKeyString(r.field, r.linePos), r.text]),
    );

    for (const row of runtimeRows) {
      const key = fieldKeyString(row.field, row.linePos);
      let epubText = epubByKey.get(key) ?? "";
      if (translator === "wilhelm" && row.field === "judgment") {
        epubText = applyWilhelmEpubJudgmentTypoFix(hex.number, epubText);
      }
      const entry = {
        translator,
        hex: hex.number,
        hexName: hex.name,
        field: row.field,
        fieldKey: key,
        label: row.label,
        runtime: row.text,
        epub: epubByKey.get(key) ?? "",
        epubNormalized: epubText,
      };
      if (verbatimTextsEqual(row.text, epubText)) {
        matches.push({ ...entry, status: "match" });
      } else if (
        translator === "wilhelm" &&
        isWilhelmIntentionalEpubDelta(hex.number, key)
      ) {
        matches.push({ ...entry, status: "intentional_fix", reason: "epub_typo_fix" });
      } else {
        mismatches.push({ ...entry, status: "mismatch", reason: "text_diff" });
      }
    }
  }

  return { mismatches, matches };
}

function buildMarkdown(report) {
  const lines = [
    "# EPUB verbatim vs runtime audit",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    "| Translator | Total | Match | Mismatch |",
    "|------------|-------|-------|----------|",
  ];
  for (const s of report.summary) {
    lines.push(`| ${s.translator} | ${s.total} | ${s.match} | ${s.mismatch} |`);
  }
  lines.push("", "## Mismatches", "");
  if (!report.mismatches.length) {
    lines.push("_None — runtime matches EPUB verbatim._");
  } else {
    for (const m of report.mismatches) {
      lines.push(
        `### Hex ${m.hex} · ${m.translator} · ${m.fieldKey} (${m.label})`,
        "",
        "**Runtime:**",
        "```",
        m.runtime,
        "```",
        "",
        "**EPUB verbatim:**",
        "```",
        m.epub,
        "```",
        "",
      );
    }
  }
  return lines.join("\n");
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  console.log("Loading EPUB gold (verbatim parsers)…");
  const [wEpub, lEpub, wBundle, lBundle] = await Promise.all([
    parseAllWilhelmEpubOrThrow(),
    parseAllLeggeEpubOrThrow(),
    loadBundle("wilhelm"),
    loadBundle("legge"),
  ]);

  const w = auditTranslator("wilhelm", wBundle, wEpub);
  const l = auditTranslator("legge", lBundle, lEpub);
  const mismatches = [...w.mismatches, ...l.mismatches];
  const matches = [...w.matches, ...l.matches];

  const summary = [
    {
      translator: "wilhelm",
      total: w.matches.length + w.mismatches.length,
      match: w.matches.length,
      mismatch: w.mismatches.length,
    },
    {
      translator: "legge",
      total: l.matches.length + l.mismatches.length,
      match: l.matches.length,
      mismatch: l.mismatches.length,
    },
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    gate: "epub-verbatim-vs-runtime",
    summary,
    mismatches,
    matchCount: matches.length,
    mismatchCount: mismatches.length,
  };

  await mkdir(OUT, { recursive: true });
  const jsonPath = join(OUT, `epub-verbatim-audit-${stamp}.json`);
  const mdPath = join(OUT, `epub-verbatim-audit-${stamp}.md`);
  const latestJson = join(OUT, "epub-verbatim-audit-latest.json");
  const latestMd = join(OUT, "epub-verbatim-audit-latest.md");
  const body = JSON.stringify(report, null, 2);
  const md = buildMarkdown(report);
  await writeFile(jsonPath, body, "utf8");
  await writeFile(mdPath, md, "utf8");
  await writeFile(latestJson, body, "utf8");
  await writeFile(latestMd, md, "utf8");

  console.log(`Wilhelm: ${summary[0].match}/${summary[0].total} match`);
  console.log(`Legge:   ${summary[1].match}/${summary[1].total} match`);
  console.log(`Latest:  ${latestMd}`);

  if (mismatches.length) {
    console.error(`\nFAIL: ${mismatches.length} mismatch(es). First:`);
    const first = mismatches[0];
    console.error(`  hex ${first.hex} ${first.translator} ${first.fieldKey}`);
    process.exit(1);
  }
  console.log("\nPASS: runtime bundles match EPUB verbatim.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
