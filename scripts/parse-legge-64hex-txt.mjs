#!/usr/bin/env node
/**
 * Parse Legge 64-hex TXT → JSON + G0/G1 audit.
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
  normalizeLeggeTxtText,
  parseLegge64HexTxtFull,
  txtFieldsToLeggeOracleGold,
  validateLegge64HexStructure,
  validateLegge64HexMeta,
} from "./lib/legge-64hex-txt.mjs";
import {
  LEGGE_64HEX_TXT_PATH,
  LEGGE_BOOK_ONE_DATASET_DIR,
  LEGGE_BOOK_ONE_PARSED_JSON,
} from "./lib/legge-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const OUT_JSON = LEGGE_BOOK_ONE_PARSED_JSON;
const REPORTS = join(ROOT, "reports");

/** Fields in 64hex TXT (Great Symbolism lives in appendix). */
const LEGGE_TXT_G1_FIELDS = new Set([
  "judgment",
  "line",
  "yongJiu",
  "yongLiu",
]);

/**
 * @param {Awaited<ReturnType<typeof parseLegge64HexTxtFull>>} parsed
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
      mismatches.push({ hex: hex.number, fieldKey: "*", reason: "missing_parsed_hex" });
      continue;
    }

    const txtGold = txtFieldsToLeggeOracleGold(fields, hex.number);
    const runtimeRows = runtimeHexToReviewRows(hex).filter((r) =>
      LEGGE_TXT_G1_FIELDS.has(r.field),
    );
    const txtRows = epubGoldToReviewRows(txtGold, hex.number).filter((r) =>
      LEGGE_TXT_G1_FIELDS.has(r.field),
    );
    const txtByKey = new Map(
      txtRows.map((r) => [fieldKeyString(r.field, r.linePos), r.text]),
    );

    for (const row of runtimeRows) {
      const key = fieldKeyString(row.field, row.linePos);
      const txtText = txtByKey.get(key) ?? "";
      const entry = {
        hex: hex.number,
        hexName: hex.name,
        fieldKey: key,
        runtime: row.text,
        txt: txtText,
      };

      if (
        verbatimTextsEqual(
          normalizeLeggeTxtText(row.text),
          normalizeLeggeTxtText(txtText),
        )
      ) {
        matches.push({ ...entry, status: "match" });
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
  const parsed = await parseLegge64HexTxtFull();
  const g0 = validateLegge64HexStructure(parsed);
  const g0meta = validateLegge64HexMeta(parsed);
  const bundle = await loadBundle("legge");
  const g1 = auditOracleVsRuntime(parsed, bundle);

  await mkdir(LEGGE_BOOK_ONE_DATASET_DIR, { recursive: true });
  await mkdir(REPORTS, { recursive: true });

  const payload = {
    source: LEGGE_64HEX_TXT_PATH,
    parsedAt: parsed.parsedAt,
    hexagrams: Object.fromEntries(
      Object.entries(parsed.hexagrams).map(([n, h]) => [
        n,
        {
          roman: h.roman,
          bookTitle: h.bookTitle,
          bookHanzi: h.bookHanzi,
          lineStart: h.lineStart,
          lineEnd: h.lineEnd,
          fields: h.fields,
        },
      ]),
    ),
  };

  await writeFile(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const ts = stamp();
  const report = [
    "# Legge 64-hex TXT audit",
    "",
    `- Source: \`${LEGGE_64HEX_TXT_PATH}\``,
    `- Parsed: \`${OUT_JSON}\``,
    `- Generated: ${new Date().toISOString()}`,
    "",
    "## G0 structure",
    "",
    g0.ok ? "**PASS**" : `**FAIL** (${g0.errors.length} errors)`,
    "",
    g0.errors.length ? g0.errors.map((e) => `- ${e}`).join("\n") : "",
    "",
    "## G0 meta (nombre, chinese_roman from TXT header; chinese + hex_font from zhouyi)",
    "",
    g0meta.ok ? "**PASS**" : `**FAIL** (${g0meta.errors.length} errors)`,
    "",
    ...(g0meta.errors.length ? g0meta.errors.map((e) => `- ${e}`).join("\n") : []),
    "",
    "## G1 oracle vs runtime (Thwan + lines + yong; image excluded — appendix)",
    "",
    `- Match: **${g1.matches.length}/${g1.total}**`,
    `- Mismatch: **${g1.mismatches.length}**`,
    "",
  ];

  if (g1.mismatches.length) {
    report.push("### Mismatches (first 20)\n");
    for (const m of g1.mismatches.slice(0, 20)) {
      report.push(
        `- Hex ${m.hex} ${m.fieldKey}: runtime ${JSON.stringify(String(m.runtime).slice(0, 60))} vs txt ${JSON.stringify(String(m.txt).slice(0, 60))}`,
      );
    }
  }

  const mdPath = join(REPORTS, `legge-64hex-txt-audit-${ts}.md`);
  const jsonPath = join(REPORTS, `legge-64hex-txt-audit-${ts}.json`);
  await writeFile(mdPath, report.join("\n"), "utf8");
  await writeFile(
    jsonPath,
    `${JSON.stringify({ g0, g1: { match: g1.matches.length, mismatch: g1.mismatches.length, total: g1.total, mismatches: g1.mismatches.slice(0, 50) } }, null, 2)}\n`,
    "utf8",
  );
  await writeFile(join(REPORTS, "legge-64hex-txt-audit-latest.md"), report.join("\n"), "utf8");

  console.log(`Wrote ${OUT_JSON}`);
  console.log(`G0 structure: ${g0.ok ? "PASS" : "FAIL"} (${g0.errors.length} errors)`);
  console.log(`G0 meta: ${g0meta.ok ? "PASS" : "FAIL"} (${g0meta.errors.length} errors)`);
  console.log(
    `G1 oracle (txt scope): ${g1.mismatches.length === 0 ? "PASS" : "FAIL"} (${g1.matches.length}/${g1.total} match, ${g1.mismatches.length} mismatch)`,
  );
  console.log(`Report: ${mdPath}`);

  if (!g0.ok || !g0meta.ok || g1.mismatches.length) process.exitCode = 1;
}

main();
