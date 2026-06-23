#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseWilhelm64HexCommentsTxtFull,
  validateWilhelm64HexCommentsStructure,
} from "./lib/wilhelm-64hex-comments-txt.mjs";
import {
  WILHELM_64HEX_COMMENTS_TXT_PATH,
  WILHELM_COMMENTS_DATASET_DIR,
  WILHELM_COMMENTS_PARSED_JSON,
} from "./lib/wilhelm-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const OUT_JSON = WILHELM_COMMENTS_PARSED_JSON;
const REPORTS = join(ROOT, "reports");

async function main() {
  const parsed = await parseWilhelm64HexCommentsTxtFull();
  const g0 = validateWilhelm64HexCommentsStructure(parsed);

  /** @type {Record<string, { fields: Record<string, string> }>} */
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
    hexagrams: exportHex,
  };

  await mkdir(WILHELM_COMMENTS_DATASET_DIR, { recursive: true });
  await mkdir(REPORTS, { recursive: true });
  await writeFile(OUT_JSON, `${JSON.stringify(out, null, 2)}\n`, "utf8");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const report = [
    "# Wilhelm 64-hex comments TXT audit",
    "",
    `- Source: \`${WILHELM_64HEX_COMMENTS_TXT_PATH}\``,
    `- Parsed JSON: \`${OUT_JSON}\``,
    "",
    "## G0 structure",
    "",
    g0.ok ? "**PASS**" : "**FAIL**",
    "",
    g0.errors.length ? g0.errors.map((e) => `- ${e}`).join("\n") : "No structural errors.",
    "",
  ].join("\n");

  await writeFile(
    join(REPORTS, `wilhelm-64hex-comments-audit-${stamp}.md`),
    report,
    "utf8",
  );

  console.log(`Wrote ${OUT_JSON}`);
  console.log(`G0 structure: ${g0.ok ? "PASS" : "FAIL"} (${g0.errors.length} errors)`);
  if (!g0.ok) {
    for (const e of g0.errors.slice(0, 20)) console.log(`  - ${e}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
