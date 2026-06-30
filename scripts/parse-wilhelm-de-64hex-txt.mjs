#!/usr/bin/env node

/**
 * QA code: VF-FID-W-011 parse-wilhelm-de-64hex-txt · v1.0.0
 * Area: scripts/parse-wilhelm-de-64hex-txt.mjs
 * Family: FID-W
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseWilhelmDe64HexTxtFull,
  validateWilhelmDe64HexStructure,
  WILHELM_DE_64HEX_DEFAULT_PATH,
} from "./lib/wilhelm-de-64hex-txt.mjs";
import { assertWilhelmDeOcrIngestAllowed } from "./lib/wilhelm-de-ocr-ingest-lock.mjs";
import { WILHELM_DE_BOOK_ONE_DIR, WILHELM_DE_BOOK_ONE_PARSED, WILHELM_DE_BOOK_ONE_PARSED_V2 } from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

const passArg = process.argv.find((a) => a.startsWith("--pass="));
const variantArg = process.argv.find((a) => a.startsWith("--variant="));
const pass = passArg?.split("=")[1] ?? "03";
const variant = variantArg?.split("=")[1] ?? "merged";
const inputPath =
  pass === "01"
    ? join(ROOT, "tools/source-pdfs/W german/wilhelm-de-erstes-buch-pass01.txt")
    : WILHELM_DE_64HEX_DEFAULT_PATH;
const outputPath =
  pass === "01"
    ? join(WILHELM_DE_BOOK_ONE_DIR, "wilhelm-de-64hex-parsed-pass01.json")
    : variant === "v2"
      ? WILHELM_DE_BOOK_ONE_PARSED_V2
      : WILHELM_DE_BOOK_ONE_PARSED;

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function main() {
  await assertWilhelmDeOcrIngestAllowed({
    script: "parse-wilhelm-de-64hex-txt",
    writes: outputPath,
  });

  const parsed = await parseWilhelmDe64HexTxtFull(inputPath, { require64: pass !== "01" });
  const g0 = validateWilhelmDe64HexStructure(parsed);
  if (pass === "01") {
    const parsedCount = Object.keys(parsed.hexagrams).length;
    console.log(`Pass01 parsed ${parsedCount}/64 hex blocks (partial OK for merge)`);
  }

  await mkdir(WILHELM_DE_BOOK_ONE_DIR, { recursive: true });
  await mkdir(REPORTS, { recursive: true });

  const payload = {
    source: inputPath,
    pass,
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

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const reportPath = join(REPORTS, `wilhelm-de-64hex-txt-audit-pass${pass}-${stamp()}.json`);
  await writeFile(
    reportPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), pass, g0, outputPath }, null, 2)}\n`,
    "utf8",
  );

  console.log(`Wrote ${outputPath}`);
  console.log(`G0 structure: ${g0.pass ? "PASS" : "FAIL"} (${g0.errors.length} errors)`);
  if (!g0.pass && pass !== "01") {
    for (const e of g0.errors.slice(0, 20)) console.log(`  - ${e}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
