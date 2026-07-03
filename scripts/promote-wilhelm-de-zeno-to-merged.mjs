#!/usr/bin/env node

/**
 * QA code: VF-FID-W-026 promote-wilhelm-de-zeno-to-merged · v1.0.0
 * Area: scripts/promote-wilhelm-de-zeno-to-merged.mjs
 * Family: FID-W
 *
 * Promote zeno-extract (clean DE oracle/commentary split) to wilhelm-de-64hex-merged.json,
 * with hanzi + hex_font from Zhou Yi (ctext.org) — not OCR/Baynes injectors.
 */

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WILHELM_DE_BOOK_ONE_MERGED,
  WILHELM_DE_BOOK_ONE_ZENO_EXTRACT,
  WILHELM_DE_PRIMARY_SOURCE,
  WILHELM_DE_ZENO_INGEST,
} from "./lib/wilhelm-de-dataset-paths.mjs";
import { WILHELM_MANUAL_FIELDS } from "./lib/wilhelm-manual-fields.mjs";
import {
  applyZhouyiSymbolsToFields,
  loadWilhelmDeZhouyiSymbols,
} from "./lib/wilhelm-de-zhouyi-symbols.mjs";
import { validateWilhelmDeBlankMaestro } from "./lib/wilhelm-de-blank-maestro.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARCHIVE_DIR = join(ROOT, "tools/output/archive");
const REPORTS = join(ROOT, "reports");

/**
 * @param {object} zenoPayload
 * @param {Record<string, { chinese: string; hex_font: string }>} symbols
 */
function buildMergedFromZeno(zenoPayload, symbols) {
  /** @type {Record<string, object>} */
  const hexagrams = {};
  let oracleFilled = 0;
  let oracleTotal = 0;
  let commentaryFilled = 0;
  let commentaryTotal = 0;

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const src = zenoPayload.hexagrams[key];
    if (!src?.fields) throw new Error(`zeno extract missing hex ${n}`);

    /** @type {Record<string, string>} */
    const fields = { ...src.fields };
    applyZhouyiSymbolsToFields(fields, n, symbols);

    for (const { key: fieldKey } of WILHELM_MANUAL_FIELDS) {
      if (!/_oraculo$/.test(fieldKey) && fieldKey !== "yong_oraculo") continue;
      oracleTotal++;
      if (String(fields[fieldKey] ?? "").trim()) oracleFilled++;
    }
    for (const { key: fieldKey } of WILHELM_MANUAL_FIELDS) {
      if (!/_comentario$/.test(fieldKey)) continue;
      commentaryTotal++;
      if (String(fields[fieldKey] ?? "").trim()) commentaryFilled++;
    }

    hexagrams[key] = {
      bookChinese: fields.chinese_roman ?? "",
      bookTitle: String(fields.nombre ?? src.bookTitle ?? "").trim(),
      bookHanzi: fields.chinese,
      bookHexFont: fields.hex_font,
      lineStart: null,
      lineEnd: null,
      fields,
      zenoPath: src.zenoPath ?? null,
      zenoPermalink: src.zenoPermalink ?? null,
    };
  }

  return {
    schemaVersion: "1.0.0",
    promotedAt: new Date().toISOString(),
    source: WILHELM_DE_BOOK_ONE_ZENO_EXTRACT,
    primarySource: WILHELM_DE_PRIMARY_SOURCE,
    ingestMirror: WILHELM_DE_ZENO_INGEST,
    method: "zeno.org-html",
    symbolStandard: {
      chinese: "scripts/iching_zhouyi_translation.mjs → name (ctext.org 周易)",
      hex_font: "scripts/iching_zhouyi_translation.mjs → hex_font (Unicode I Ching block)",
    },
    replacedArtifact: "wilhelm-de-64hex-merged.json (former OCR pass01+03 dual-pass)",
    hexCount: 64,
    fillStats: {
      oracle: `${oracleFilled}/${oracleTotal}`,
      commentaryInline: `${commentaryFilled}/${commentaryTotal}`,
    },
    hexagrams,
  };
}

async function main() {
  const zeno = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_ZENO_EXTRACT, "utf8"));
  if (Object.keys(zeno.hexagrams ?? {}).length !== 64) {
    throw new Error(`zeno extract incomplete: ${Object.keys(zeno.hexagrams ?? {}).length}/64 hex`);
  }
  if (zeno.errors?.length) {
    throw new Error(`zeno extract has errors: ${zeno.errors.join("; ")}`);
  }

  const symbols = await loadWilhelmDeZhouyiSymbols();
  const merged = buildMergedFromZeno(zeno, symbols);

  const baynesParsed = JSON.parse(
    await readFile(
      join(ROOT, "tools/datasets/wilhelm-baynes/book-one/wilhelm-64hex-parsed.json"),
      "utf8",
    ),
  );
  const structureCheck = validateWilhelmDeBlankMaestro(
    { hexagrams: merged.hexagrams },
    baynesParsed,
    { requireEmptyPaste: false },
  );
  if (!structureCheck.pass) {
    throw new Error(`structure validation failed:\n${structureCheck.errors.slice(0, 10).join("\n")}`);
  }

  await mkdir(ARCHIVE_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const archivePath = join(ARCHIVE_DIR, `wilhelm-de-64hex-merged-ocr-${stamp}.json`);
  try {
    await copyFile(WILHELM_DE_BOOK_ONE_MERGED, archivePath);
    console.log(`Archived prior merged OCR → ${archivePath}`);
  } catch {
    console.log("No prior merged.json to archive (first promotion).");
  }

  await writeFile(WILHELM_DE_BOOK_ONE_MERGED, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`Wrote ${WILHELM_DE_BOOK_ONE_MERGED}`);
  console.log(`Oracle fill: ${merged.fillStats.oracle}`);
  console.log(`Commentary inline: ${merged.fillStats.commentaryInline}`);
  console.log(`Symbol standard: Zhou Yi (ctext.org)`);

  await mkdir(REPORTS, { recursive: true });
  const reportPath = join(REPORTS, `wilhelm-de-zeno-promotion-${stamp}.json`);
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        promotedAt: merged.promotedAt,
        source: merged.source,
        fillStats: merged.fillStats,
        structureCheck: { pass: structureCheck.pass, errors: structureCheck.errors },
        archivePath: archivePath,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`Report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
