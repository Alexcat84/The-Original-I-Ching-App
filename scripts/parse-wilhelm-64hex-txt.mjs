#!/usr/bin/env node
/**
 * Parse Wilhelm 64-hex cleaned TXT → JSON + G0/G1 audit report.
 *
 * Input: tools/source-pdfs/...-64hex.txt (Book I zone only)
 * Output: tools/datasets/wilhelm/book-one/wilhelm-64hex-parsed.json
 *         reports/wilhelm-64hex-txt-audit-{ts}.{json,md}
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBundle } from "./lib/hexagram-fidelity-fetch.mjs";
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
import {
  normalizeWilhelmTxtText,
  parseWilhelm64HexTxtFull,
  txtFieldsToOracleGold,
  validateWilhelm64HexStructure,
} from "./lib/wilhelm-64hex-txt.mjs";
import {
  WILHELM_64HEX_TXT_PATH,
  WILHELM_BOOK_ONE_DATASET_DIR,
  WILHELM_BOOK_ONE_PARSED_JSON,
} from "./lib/wilhelm-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const OUT_JSON = WILHELM_BOOK_ONE_PARSED_JSON;
const REPORTS = join(ROOT, "reports");

/**
 * @param {Awaited<ReturnType<typeof parseWilhelm64HexTxtFull>>} parsed
 * @param {Awaited<ReturnType<typeof loadBundle>>} bundle
 */
function auditOracleVsRuntime(parsed, bundle) {
  /** @type {Array<object>} */
  const matches = [];
  /** @type {Array<object>} */
  const mismatches = [];

  for (const hex of bundle.hexagrams) {
    const fields = parsed.hexagrams[hex.number]?.fields;
    if (!fields) {
      mismatches.push({
        hex: hex.number,
        fieldKey: "*",
        reason: "missing_parsed_hex",
      });
      continue;
    }

    const txtGold = txtFieldsToOracleGold(fields, hex.number);
    const runtimeRows = runtimeHexToReviewRows(hex);
    const txtRows = epubGoldToReviewRows(txtGold, hex.number);
    const txtByKey = new Map(
      txtRows.map((r) => [fieldKeyString(r.field, r.linePos), r.text]),
    );

    for (const row of runtimeRows) {
      const key = fieldKeyString(row.field, row.linePos);
      let txtText = txtByKey.get(key) ?? "";
      if (row.field === "judgment") {
        txtText = applyWilhelmEpubJudgmentTypoFix(hex.number, txtText);
      }

      const entry = {
        hex: hex.number,
        hexName: hex.name,
        fieldKey: key,
        runtime: row.text,
        txt: txtByKey.get(key) ?? "",
        txtNormalized: txtText,
      };

      if (verbatimTextsEqual(
        normalizeWilhelmTxtText(row.text),
        normalizeWilhelmTxtText(txtText),
      )) {
        matches.push({ ...entry, status: "match" });
      } else if (isWilhelmIntentionalEpubDelta(hex.number, key)) {
        matches.push({ ...entry, status: "intentional_delta" });
      } else {
        mismatches.push({ ...entry, status: "mismatch" });
      }
    }
  }

  return { matches, mismatches, total: matches.length + mismatches.length };
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function main() {
  const parsed = await parseWilhelm64HexTxtFull();
  const g0 = validateWilhelm64HexStructure(parsed);
  const bundle = await loadBundle("wilhelm");
  const g1 = auditOracleVsRuntime(parsed, bundle);

  await mkdir(WILHELM_BOOK_ONE_DATASET_DIR, { recursive: true });
  await mkdir(REPORTS, { recursive: true });

  const payload = {
    source: WILHELM_64HEX_TXT_PATH,
    zoneLineCount: parsed.zoneLineCount,
    parsedAt: new Date().toISOString(),
    hexagrams: Object.fromEntries(
      Object.entries(parsed.hexagrams).map(([n, h]) => [
        n,
        {
          bookChinese: h.bookChinese,
          bookTitle: h.bookTitle,
          bookHanzi: h.bookHanzi,
          bookHexFont: h.bookHexFont,
          lineStart: h.lineStart,
          lineEnd: h.lineEnd,
          fields: h.fields,
        },
      ]),
    ),
  };

  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const ts = stamp();
  const reportBase = join(REPORTS, `wilhelm-64hex-txt-audit-${ts}`);
  const auditJson = {
    generatedAt: new Date().toISOString(),
    source: WILHELM_64HEX_TXT_PATH,
    outputJson: OUT_JSON,
    g0,
    g1: {
      pass: g1.mismatches.length === 0,
      matches: g1.matches.length,
      mismatches: g1.mismatches.length,
      totalOracleFields: g1.total,
      mismatchDetails: g1.mismatches.slice(0, 50),
    },
  };

  await writeFile(`${reportBase}.json`, `${JSON.stringify(auditJson, null, 2)}\n`, "utf8");

  const md = [
    "# Wilhelm 64-hex TXT audit",
    "",
    `- Source: \`${WILHELM_64HEX_TXT_PATH}\``,
    `- Parsed JSON: \`${OUT_JSON}\``,
    `- Zone lines: ${parsed.zoneLineCount}`,
    "",
    "## G0 structure",
    "",
    g0.pass ? "**PASS**" : "**FAIL**",
    "",
    ...(g0.errors.length
      ? ["### Errors", ...g0.errors.map((e) => `- ${e}`), ""]
      : ["No structural errors.", ""]),
    ...(g0.warnings.length
      ? ["### Warnings", ...g0.warnings.map((w) => `- ${w}`), ""]
      : []),
    "## G1 oracle vs runtime",
    "",
    g1.mismatches.length === 0 ? "**PASS**" : "**FAIL**",
    "",
    `- Match: ${g1.matches.length}/${g1.total}`,
    `- Mismatch: ${g1.mismatches.length}`,
    "",
  ];

  if (g1.mismatches.length) {
    md.push("### First mismatches", "");
    for (const m of g1.mismatches.slice(0, 25)) {
      md.push(
        `#### Hex ${m.hex} ${m.fieldKey}`,
        "",
        "**Runtime:**",
        "```",
        String(m.runtime ?? "").slice(0, 400),
        "```",
        "",
        "**TXT:**",
        "```",
        String(m.txtNormalized ?? m.txt ?? "").slice(0, 400),
        "```",
        "",
      );
    }
  }

  await writeFile(`${reportBase}.md`, `${md.join("\n")}\n`, "utf8");

  console.log(`Wrote ${OUT_JSON}`);
  console.log(`G0 structure: ${g0.pass ? "PASS" : "FAIL"} (${g0.errors.length} errors)`);
  console.log(
    `G1 oracle: ${g1.mismatches.length === 0 ? "PASS" : "FAIL"} (${g1.matches.length}/${g1.total} match, ${g1.mismatches.length} mismatch)`,
  );
  console.log(`Report: ${reportBase}.md`);

  if (!g0.pass || g1.mismatches.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
