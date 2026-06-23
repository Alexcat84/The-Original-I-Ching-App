#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  flattenLeggeAppendixBlocks,
  parseLeggeAppendixTxt,
  validateLeggeAppendixStructure,
} from "./lib/legge-appendix-txt.mjs";
import {
  LEGGE_APPENDIX_DATASET_DIR,
  LEGGE_APPENDIX_PARSED_JSON,
  LEGGE_APPENDIX_TXT_PATH,
} from "./lib/legge-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

async function main() {
  const parsed = parseLeggeAppendixTxt();
  const g0 = validateLeggeAppendixStructure(parsed);

  await mkdir(LEGGE_APPENDIX_DATASET_DIR, { recursive: true });
  await mkdir(REPORTS, { recursive: true });

  const out = {
    source: LEGGE_APPENDIX_TXT_PATH,
    parsedAt: parsed.parsedAt,
    mainLineCount: parsed.mainLineCount,
    appendixCount: parsed.appendixCount,
    appendices: parsed.appendices,
    backMatter: parsed.backMatter,
  };

  await writeFile(LEGGE_APPENDIX_PARSED_JSON, `${JSON.stringify(out, null, 2)}\n`, "utf8");

  const symbolismTotal = parsed.appendices
    .find((a) => a.roman === "II")
    ?.sections.reduce((n, s) => n + (s.symbolismHexCount ?? 0), 0);

  const report = [
    "# Legge appendix TXT audit",
    "",
    `- Source: \`${LEGGE_APPENDIX_TXT_PATH}\``,
    `- Main text lines: ${parsed.mainLineCount}`,
    `- Appendices: ${parsed.appendixCount}`,
    `- Great Symbolism hex blocks (Appendix II): ${symbolismTotal ?? 0}/64`,
    `- Back matter: ${parsed.backMatter ? "yes" : "no"}`,
    "",
    "## G0 structure",
    "",
    g0.ok ? "**PASS**" : `**FAIL** (${g0.errors.length} errors)`,
    "",
    ...(g0.errors.length ? g0.errors.map((e) => `- ${e}`) : ["- All 7 appendices with expected sections"]),
    "",
    "## Outline",
    "",
    ...parsed.appendices.map((a) => {
      if (a.sections.length) {
        return `- **${a.id}** (${a.sections.length} sections): ${a.sections.map((s) => `${s.id}${s.symbolismHexCount ? ` [${s.symbolismHexCount} hex]` : ""}`).join(", ")}`;
      }
      return `- **${a.id}** (single body, ${a.content.length} chars)`;
    }),
  ].join("\n");

  await writeFile(join(REPORTS, "legge-appendix-txt-audit-latest.md"), report, "utf8");

  const flat = flattenLeggeAppendixBlocks(parsed);
  const csvRows = [
    ["appendix", "section", "field", "chars"],
    ...flat.map((r) => [r.appendix, r.section, r.field, String(r.content.length)]),
  ];
  const csv = `\uFEFF${csvRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n")}`;
  await writeFile(join(REPORTS, "legge-appendix-structure-latest.csv"), csv, "utf8");

  console.log(`Wrote ${LEGGE_APPENDIX_PARSED_JSON}`);
  console.log(`G0: ${g0.ok ? "PASS" : "FAIL"} (${g0.errors.length} errors)`);
  console.log(`Symbolism hex: ${symbolismTotal ?? 0}/64`);
  console.log(`Full-text AU: npm run export:legge-appendix-audit-csv`);
  if (!g0.ok) {
    for (const e of g0.errors.slice(0, 10)) console.log(`  - ${e}`);
    process.exitCode = 1;
  }
}

main();
