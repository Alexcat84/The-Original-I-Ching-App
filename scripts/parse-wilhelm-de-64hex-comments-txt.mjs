#!/usr/bin/env node
/**
 * QA code: VF-FID-W-015 parse-wilhelm-de-64hex-comments-txt · v1.0.0
 * Area: scripts/parse-wilhelm-de-64hex-comments-txt.mjs
 * Family: FID-W
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseWilhelmDe64HexCommentsTxtFull,
  validateWilhelmDe64HexCommentsStructure,
} from "./lib/wilhelm-de-64hex-comments-txt.mjs";
import { assertWilhelmDeOcrIngestAllowed } from "./lib/wilhelm-de-ocr-ingest-lock.mjs";
import {
  WILHELM_DE_COMMENTS_DIR,
  WILHELM_DE_COMMENTS_PARSED,
  WILHELM_DE_STITCHED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");

const passArg = process.argv.find((a) => a.startsWith("--pass="));
const pass = passArg?.split("=")[1] ?? "02";
const sourcePath =
  pass === "04" ? WILHELM_DE_STITCHED.bookThreePass04 : WILHELM_DE_STITCHED.bookThreePass02;
const outJson =
  pass === "04"
    ? join(WILHELM_DE_COMMENTS_DIR, "wilhelm-de-64hex-comments-parsed-pass04.json")
    : WILHELM_DE_COMMENTS_PARSED;

async function main() {
  await assertWilhelmDeOcrIngestAllowed({
    script: "parse-wilhelm-de-64hex-comments-txt",
    writes: outJson,
  });

  const parsed = await parseWilhelmDe64HexCommentsTxtFull(sourcePath);
  const g0 = validateWilhelmDe64HexCommentsStructure(parsed);

  /** @type {Record<string, object>} */
  const exportHex = {};
  for (const [n, hex] of Object.entries(parsed.hexagrams)) {
    exportHex[n] = {
      bookChinese: hex.bookChinese,
      bookTitle: hex.bookTitle,
      bookHanzi: hex.bookHanzi,
      bookHexFont: hex.bookHexFont,
      lineStart: hex.lineStart,
      lineEnd: hex.lineEnd,
      fields: hex.fields,
    };
  }

  const out = {
    source: parsed.source,
    parsedAt: parsed.parsedAt,
    pass,
    hexagrams: exportHex,
  };

  await mkdir(WILHELM_DE_COMMENTS_DIR, { recursive: true });
  await mkdir(REPORTS, { recursive: true });
  await writeFile(outJson, `${JSON.stringify(out, null, 2)}\n`, "utf8");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const report = [
    "# Wilhelm DE 64-hex comments TXT audit",
    "",
    `- Source: \`${sourcePath}\``,
    `- Parsed JSON: \`${outJson}\``,
    `- Pass: ${pass}`,
    "",
    "## G0 structure",
    "",
    g0.ok ? "**PASS**" : "**FAIL**",
    "",
    g0.errors.length ? g0.errors.map((e) => `- ${e}`).join("\n") : "No structural errors.",
    "",
  ].join("\n");

  await writeFile(
    join(REPORTS, `wilhelm-de-64hex-comments-audit-pass${pass}-${stamp}.md`),
    report,
    "utf8",
  );

  console.log(`Wrote ${outJson}`);
  console.log(`G0 structure: ${g0.ok ? "PASS" : "FAIL"} (${g0.errors.length} errors)`);
  if (!g0.ok) {
    for (const e of g0.errors.slice(0, 25)) console.log(`  - ${e}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
