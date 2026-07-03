#!/usr/bin/env node

/**
 * QA code: VF-FID-W-036 promote-wilhelm-de-comments-au-to-merged · v1.0.0
 * Area: scripts/promote-wilhelm-de-comments-au-to-merged.mjs
 * Family: FID-W
 *
 * Promote AU JPG gold (64×37 Ten Wings) → wilhelm-de-64hex-comments-merged.json.
 * Requires validate:wilhelm-de-comments-au-gold PASS first.
 */

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateWilhelmDe64HexCommentsStructure } from "./lib/wilhelm-de-64hex-comments-txt.mjs";
import {
  buildPromotedCommentsFromAuGold,
  validateCommentsAuGoldForPromote,
} from "./lib/wilhelm-de-comments-anna-au-gold.mjs";
import { buildAnnaCommentsAuDisputeRows } from "./lib/wilhelm-de-comments-anna-au-export.mjs";
import {
  loadWilhelmDeBlankCommentsMaestro,
  validateWilhelmDeBlankCommentsMaestro,
  WILHELM_DE_COMMENTS_PASTE_KEYS,
} from "./lib/wilhelm-de-blank-comments-maestro.mjs";
import {
  WILHELM_DE_COMMENTS_AU_GOLD_JSON,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
  WILHELM_DE_COMMENTS_ANNA_RECONCILED,
  WILHELM_DE_COMMENTS_BLANK,
  WILHELM_DE_COMMENTS_MANIFEST,
  WILHELM_DE_COMMENTS_MERGED,
  WILHELM_DE_OCR_INGEST_LOCK,
  WILHELM_DE_PRIMARY_SOURCE,
} from "./lib/wilhelm-de-dataset-paths.mjs";
import { applyZhouyiSymbolsToFields, loadWilhelmDeZhouyiSymbols } from "./lib/wilhelm-de-zhouyi-symbols.mjs";
import { applyErstesChineseRomanToFields } from "./lib/wilhelm-de-comments-erstes-meta.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARCHIVE_DIR = join(ROOT, "tools/output/archive");
const REPORTS = join(ROOT, "reports");

/**
 * @param {Record<string, object>} promotedHexagrams
 * @param {object} blank
 * @param {Record<string, { chinese: string; hex_font: string }>} symbols
 */
function buildCommentsMergedFromPromoted(promotedHexagrams, blank, symbols) {
  /** @type {Record<string, object>} */
  const hexagrams = {};
  let contentFilled = 0;
  const contentTotal = WILHELM_DE_COMMENTS_PASTE_KEYS.length * 64;

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const blankEntry = blank.hexagrams[key];
    const promoted = promotedHexagrams[key];
    if (!blankEntry?.fields) throw new Error(`blank maestro missing hex ${n}`);
    if (!promoted?.fields) throw new Error(`promoted payload missing hex ${n}`);

    /** @type {Record<string, string>} */
    const fields = { ...blankEntry.fields, ...promoted.fields };
    applyZhouyiSymbolsToFields(fields, n, symbols);
    applyErstesChineseRomanToFields(fields, n);

    for (const pasteKey of WILHELM_DE_COMMENTS_PASTE_KEYS) {
      if (String(fields[pasteKey] ?? "").trim()) contentFilled++;
    }

    hexagrams[key] = {
      bookChinese: String(fields.chinese_roman ?? "").trim(),
      bookTitle: String(fields.nombre ?? "").trim(),
      bookHanzi: fields.chinese,
      bookHexFont: fields.hex_font,
      fields,
      promoteSource: promoted.promoteSource ?? "au_jpg",
    };
  }

  return {
    schemaVersion: "1.0.0",
    promotedAt: new Date().toISOString(),
    source: WILHELM_DE_COMMENTS_AU_GOLD_JSON,
    primarySource: WILHELM_DE_PRIMARY_SOURCE,
    method: "drittes-buch-jpg-au",
    authority: "contenido_pdf",
    note: "Ten Wings from Diederichs 1924 Drittes Buch — AU book-primary JPG 64×37.",
    hexCount: 64,
    fillStats: { content: `${contentFilled}/${contentTotal}` },
    hexagrams,
  };
}

/**
 * @param {string} scriptName
 */
async function addPromoteToOcrLockSafeScripts(scriptName) {
  try {
    const lock = JSON.parse(await readFile(WILHELM_DE_OCR_INGEST_LOCK, "utf8"));
    const safe = new Set(lock.safeScripts ?? []);
    safe.add(scriptName);
    lock.safeScripts = [...safe].sort();
    lock.commentsAuPromotedAt = new Date().toISOString();
    await writeFile(WILHELM_DE_OCR_INGEST_LOCK, `${JSON.stringify(lock, null, 2)}\n`, "utf8");
  } catch {
    /* lock optional */
  }
}

async function main() {
  const auGold = JSON.parse(await readFile(WILHELM_DE_COMMENTS_AU_GOLD_JSON, "utf8"));
  const pass02 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02, "utf8"));
  const pass04 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04, "utf8"));
  const reconciled = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_RECONCILED, "utf8"));
  const disputeRows = buildAnnaCommentsAuDisputeRows(pass02, pass04);

  const validation = validateCommentsAuGoldForPromote(auGold, disputeRows);
  if (!validation.ok) {
    throw new Error(`AU gold validation failed:\n${validation.errors.slice(0, 12).join("\n")}`);
  }

  const promoted = buildPromotedCommentsFromAuGold(auGold, reconciled, pass02, pass04, disputeRows);
  if (!promoted.promotable) {
    throw new Error(
      `Promote blocked (${promoted.blocked.length} fields):\n${promoted.blocked
        .slice(0, 12)
        .map((b) => `hex ${b.hex} ${b.field}: ${b.reason}`)
        .join("\n")}`,
    );
  }

  const blank = await loadWilhelmDeBlankCommentsMaestro(WILHELM_DE_COMMENTS_BLANK);
  const symbols = await loadWilhelmDeZhouyiSymbols();
  const merged = buildCommentsMergedFromPromoted(promoted.hexagrams, blank, symbols);

  const g0 = validateWilhelmDe64HexCommentsStructure({
    headerCount: 64,
    hexagrams: merged.hexagrams,
  });
  if (!g0.ok) {
    throw new Error(`G0 comments structure failed:\n${g0.errors.slice(0, 15).join("\n")}`);
  }

  const structureCheck = validateWilhelmDeBlankCommentsMaestro(
    { hexagrams: merged.hexagrams },
    { requireEmptyPaste: false },
  );
  if (!structureCheck.pass) {
    throw new Error(
      `Maestro structure failed:\n${structureCheck.errors.slice(0, 10).join("\n")}`,
    );
  }

  await mkdir(ARCHIVE_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const archivePath = join(ARCHIVE_DIR, `wilhelm-de-64hex-comments-merged-pre-au-${stamp}.json`);
  try {
    await copyFile(WILHELM_DE_COMMENTS_MERGED, archivePath);
    console.log(`Archived prior merged → ${archivePath}`);
  } catch {
    console.log("No prior comments-merged to archive.");
  }

  await writeFile(WILHELM_DE_COMMENTS_MERGED, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(`Wrote ${WILHELM_DE_COMMENTS_MERGED}`);
  console.log(`Content fill: ${merged.fillStats.content}`);

  const manifest = {
    schemaVersion: "1.0.0",
    translator: "wilhelm",
    language: "de",
    edition: "Richard Wilhelm, I Ging — Das Buch der Wandlungen (Diederichs, 1924)",
    runtimeIngest: true,
    sourceMethod: "drittes-buch-jpg-au",
    symbolStandard: "iching_zhouyi_translation.mjs (ctext.org 周易 hanzi + hex_font)",
    blankJson: {
      path: "wilhelm-de-64hex-comments-blank.json",
      runtimeIngest: false,
      status: "blank",
    },
    mergedJson: "wilhelm-de-64hex-comments-merged.json",
    auGold: {
      path: "tools/output/fidelity-gold/wilhelm-de-64hex-comments-au-gold.json",
      runtimeIngest: false,
      promotedAt: merged.promotedAt,
    },
    annaSandbox: {
      path: "comments/anna/",
      runtimeIngest: false,
      note: "Anna pass02+04 + reconciled — diagnostic only post-AU promote",
    },
    ocrDualPassArchive: {
      runtimeIngest: false,
      note: "Former pass02+04 OCR merged — archived on zeno-clean",
    },
  };
  await writeFile(WILHELM_DE_COMMENTS_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Updated ${WILHELM_DE_COMMENTS_MANIFEST}`);

  await addPromoteToOcrLockSafeScripts("promote:wilhelm-de-comments-au-to-merged");

  await mkdir(REPORTS, { recursive: true });
  const reportPath = join(REPORTS, `wilhelm-de-comments-au-promotion-${stamp}.json`);
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        promotedAt: merged.promotedAt,
        source: merged.source,
        fillStats: merged.fillStats,
        g0: { ok: g0.ok, errorCount: g0.errors.length },
        archivePath,
        disputeRowsClosed: disputeRows.length,
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
