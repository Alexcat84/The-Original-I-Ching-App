#!/usr/bin/env node

/**
 * QA code: VF-FID-W-027 clean-wilhelm-de-zeno-dataset · v1.0.0
 * Area: scripts/clean-wilhelm-de-zeno-dataset.mjs
 * Family: FID-W
 *
 * Reset Wilhelm DE maestro to Zeno-only book-one + symbol prefill.
 * Wipe OCR / dual-pass content from comments merged (Ten Wings stay empty).
 */

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_MANUAL_FIELDS } from "./lib/wilhelm-manual-fields.mjs";
import {
  buildWilhelmDeBlankMaestro,
  validateWilhelmDeBlankMaestro,
} from "./lib/wilhelm-de-blank-maestro.mjs";
import {
  buildWilhelmDeCommentsMergedFromBlank,
  validateWilhelmDeBlankCommentsMaestro,
  writeWilhelmDeBlankCommentsMaestro,
} from "./lib/wilhelm-de-blank-comments-maestro.mjs";
import {
  WILHELM_DE_BOOK_ONE_BLANK,
  WILHELM_DE_BOOK_ONE_DIR,
  WILHELM_DE_BOOK_ONE_MERGED,
  WILHELM_DE_BOOK_ONE_ZENO_EXTRACT,
  WILHELM_DE_COMMENTS_DIR,
  WILHELM_DE_COMMENTS_MANIFEST,
  WILHELM_DE_COMMENTS_MERGED,
  WILHELM_BAYNES_BOOK_ONE_PARSED,
} from "./lib/wilhelm-de-dataset-paths.mjs";
import { loadWilhelmDeZhouyiSymbols } from "./lib/wilhelm-de-zhouyi-symbols.mjs";
import { writeWilhelmDeOcrIngestLock } from "./lib/wilhelm-de-ocr-ingest-lock.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARCHIVE_DIR = join(ROOT, "tools/output/archive");
const REPORTS = join(ROOT, "reports");

/**
 * @param {object} zenoPayload
 * @param {Record<string, { chinese: string; hex_font: string }>} symbols
 */
function buildBlankFromZenoOnly(zenoPayload, symbols) {
  const blank = buildWilhelmDeBlankMaestro(symbols);
  const META_FROM_ZENO = new Set([
    "nombre",
    "chinese_roman",
    "trigrama_arriba",
    "trigrama_abajo",
  ]);
  const PASTE_FROM_ZENO = WILHELM_MANUAL_FIELDS.filter((f) => f.paste).map((f) => f.key);

  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    const src = zenoPayload.hexagrams[key]?.fields;
    const entry = blank.hexagrams[key];
    if (!src || !entry?.fields) continue;

    for (const fieldKey of PASTE_FROM_ZENO) {
      entry.fields[fieldKey] = String(src[fieldKey] ?? "").trim();
    }
    for (const fieldKey of META_FROM_ZENO) {
      entry.fields[fieldKey] = String(src[fieldKey] ?? "").trim();
    }
    if (src.nombre) entry.bookTitle = src.nombre;
    if (src.chinese) entry.bookHanzi = src.chinese;
    if (src.hex_font) entry.bookHexFont = src.hex_font;
    entry.zenoPath = zenoPayload.hexagrams[key]?.zenoPath ?? null;
    entry.zenoPermalink = zenoPayload.hexagrams[key]?.zenoPermalink ?? null;
  }

  blank.status = "zeno-only";
  blank.source = WILHELM_DE_BOOK_ONE_ZENO_EXTRACT;
  blank.cleanedAt = new Date().toISOString();
  blank.note =
    "Symbols from Zhou Yi; book-one text from Zeno Erstes Buch only. No OCR, no Baynes, no manual gold.";
  return blank;
}

async function archiveIfExists(srcPath, label) {
  try {
    await readFile(srcPath, "utf8");
  } catch {
    return null;
  }
  await mkdir(ARCHIVE_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const base = srcPath.split(/[/\\]/).pop()?.replace(/\.json$/, "") ?? label;
  const dest = join(ARCHIVE_DIR, `${base}-pre-zeno-clean-${stamp}.json`);
  await copyFile(srcPath, dest);
  return dest;
}

async function main() {
  const zeno = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_ZENO_EXTRACT, "utf8"));
  if (Object.keys(zeno.hexagrams ?? {}).length !== 64) {
    throw new Error(`zeno extract incomplete: ${Object.keys(zeno.hexagrams ?? {}).length}/64`);
  }
  if (zeno.errors?.length) {
    throw new Error(`zeno extract has errors: ${zeno.errors.join("; ")}`);
  }

  const baynes = JSON.parse(await readFile(WILHELM_BAYNES_BOOK_ONE_PARSED, "utf8"));
  const symbols = await loadWilhelmDeZhouyiSymbols();

  const archivedMerged = await archiveIfExists(WILHELM_DE_BOOK_ONE_MERGED, "book-one-merged");
  const archivedComments = await archiveIfExists(
    WILHELM_DE_COMMENTS_MERGED,
    "comments-merged-ocr",
  );

  const { spawnSync } = await import("node:child_process");
  const promote = spawnSync("node", ["scripts/promote-wilhelm-de-zeno-to-merged.mjs"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
  });
  if (promote.stdout) process.stdout.write(promote.stdout);
  if (promote.stderr) process.stderr.write(promote.stderr);
  if ((promote.status ?? 1) !== 0) {
    throw new Error("promote-wilhelm-de-zeno-to-merged failed");
  }

  const blank = buildBlankFromZenoOnly(zeno, symbols);
  const g0Book = validateWilhelmDeBlankMaestro(blank, baynes, { requireEmptyPaste: false });
  if (!g0Book.pass) {
    throw new Error(`book-one blank validation failed:\n${g0Book.errors.slice(0, 8).join("\n")}`);
  }
  await writeFile(WILHELM_DE_BOOK_ONE_BLANK, `${JSON.stringify(blank, null, 2)}\n`, "utf8");

  const commentsBlank = await writeWilhelmDeBlankCommentsMaestro();
  const g0Comments = validateWilhelmDeBlankCommentsMaestro(commentsBlank, {
    requireEmptyPaste: true,
  });
  if (!g0Comments.pass) {
    throw new Error(
      `comments blank validation failed:\n${g0Comments.errors.slice(0, 8).join("\n")}`,
    );
  }

  const commentsMerged = buildWilhelmDeCommentsMergedFromBlank(commentsBlank);
  await mkdir(WILHELM_DE_COMMENTS_DIR, { recursive: true });
  await writeFile(
    WILHELM_DE_COMMENTS_MERGED,
    `${JSON.stringify(commentsMerged, null, 2)}\n`,
    "utf8",
  );

  const commentsManifest = {
    schemaVersion: "1.0.0",
    translator: "wilhelm",
    language: "de",
    edition: "Richard Wilhelm, I Ging — Das Buch der Wandlungen (Diederichs, 1924)",
    runtimeIngest: true,
    sourceMethod: "blank-scaffold",
    symbolStandard: "iching_zhouyi_translation.mjs (ctext.org 周易 hanzi + hex_font)",
    blankJson: {
      path: "wilhelm-de-64hex-comments-blank.json",
      runtimeIngest: false,
      status: "blank",
    },
    mergedJson: "wilhelm-de-64hex-comments-merged.json",
    ocrDualPassArchive: {
      runtimeIngest: false,
      note: "Former pass02+04 OCR merged — archived on zeno-clean; never re-ingest without Drittes Buch extract",
      archivedAt: archivedComments ?? null,
    },
    pendingExtract: "Drittes Buch (Ten Wings) — not on zeno.org; PDF maestro extract TBD",
  };
  await writeFile(WILHELM_DE_COMMENTS_MANIFEST, `${JSON.stringify(commentsManifest, null, 2)}\n`, "utf8");

  const ocrLock = await writeWilhelmDeOcrIngestLock();
  console.log(`OCR ingest lock: ${ocrLock.blocked ? "ACTIVE" : "off"} → tools/datasets/wilhelm-de/ocr-ingest.lock.json`);

  const bookManifest = JSON.parse(
    await readFile(join(WILHELM_DE_BOOK_ONE_DIR, "manifest.json"), "utf8"),
  );
  bookManifest.blankJson.status = "zeno-only";
  bookManifest.blankJson.note =
    "Zhou Yi symbols + Zeno Erstes Buch only; cleaned by clean-wilhelm-de-zeno-dataset";
  bookManifest.notes =
    "Comments Ten Wings empty until Drittes Buch extract. Baynes EN diagnostic only.";
  await writeFile(
    join(WILHELM_DE_BOOK_ONE_DIR, "manifest.json"),
    `${JSON.stringify(bookManifest, null, 2)}\n`,
    "utf8",
  );

  const build = spawnSync("npm", ["run", "build", "--prefix", "packages/iching-data"], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
  });
  if (build.stdout) process.stdout.write(build.stdout);
  if (build.stderr) process.stderr.write(build.stderr);
  if ((build.status ?? 1) !== 0) {
    throw new Error("build:data failed");
  }

  await mkdir(REPORTS, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(REPORTS, `wilhelm-de-zeno-clean-${stamp}.json`);
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        cleanedAt: new Date().toISOString(),
        bookOne: {
          merged: WILHELM_DE_BOOK_ONE_MERGED,
          blank: WILHELM_DE_BOOK_ONE_BLANK,
          source: WILHELM_DE_BOOK_ONE_ZENO_EXTRACT,
          archivedPrior: archivedMerged,
        },
        comments: {
          merged: WILHELM_DE_COMMENTS_MERGED,
          blank: commentsBlank.source,
          fillStats: commentsMerged.fillStats,
          archivedPriorOcr: archivedComments,
        },
        structure: { bookOne: g0Book.pass, comments: g0Comments.pass },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("clean:wilhelm-de-zeno-dataset PASS");
  console.log(`  book-one merged ← Zeno (${WILHELM_DE_BOOK_ONE_MERGED})`);
  console.log(`  book-one blank  ← Zeno-only symbols + extract`);
  console.log(`  comments merged ← empty scaffold (OCR archived)`);
  console.log(`  report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
