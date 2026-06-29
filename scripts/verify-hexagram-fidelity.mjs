#!/usr/bin/env node

/**
 * QA code: VF-FID-001 hexagram-fidelity-runtime · v1.0.0
 * Area: scripts/verify-hexagram-fidelity
 * Family: FID
 */

/**
 * Verify @iching-oracle/iching-data bundles against Tier-0 gold from local books.
 *
 * Canonical gate (2026-06-22+): dataset vs text extracted from physical editions
 * in tools/source-pdfs/ (see manifest.json). No web mirrors or injected supplements.
 *
 * Usage:
 *   npm run verify:hexagram-fidelity              # Wilhelm + Legge vs PDF book-primary (canonical)
 *   npm run verify:hexagram-fidelity:pdf-wilhelm    # Wilhelm vs Pantheon 1950 PDF (alias)
 *   npm run verify:hexagram-fidelity:pdf-legge      # Legge vs SBE XVI Oxford scan (alias)
 *   npm run verify:hexagram-fidelity:epub-wilhelm   # Wilhelm vs EPUB cross-check (diagnostic only)
 *   npm run verify:hexagram-fidelity:epub-legge     # Legge vs EPUB cross-check (diagnostic only)
 *
 * Cache: tools/output/fidelity-gold/ (gitignored)
 * Reports: reports/hexagram-fidelity-{timestamp}.{json,md}
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { ROOT, GOLD_DIR, loadParmaHtml, loadLeggeTextHtml, loadLeggeSymbolismHtml, loadCtextJson, loadCtextHtml, loadBundle } from "./lib/hexagram-fidelity-fetch.mjs";
import { parseAllParmaWilhelm } from "./lib/hexagram-fidelity-parma.mjs";
import {
  applyWilhelmBaynesSupplements,
  getWilhelmBaynesJudgmentSupplement,
  resolveWilhelmJudgmentForIngest,
  resolveWilhelmLineForIngest,
} from "./lib/hexagram-fidelity-wilhelm-baynes-supplement.mjs";
import { loadWilhelmPdfGoldOrThrow } from "./lib/wilhelm-pdf-gold.mjs";
import { loadWilhelmDePdfGoldOrThrow } from "./lib/wilhelm-de-pdf-gold.mjs";
import { getWilhelmPrintVerifiedLine } from "./lib/hexagram-fidelity-wilhelm-pdf-verified.mjs";
import { parseLeggeTextPage, parseLeggeSymbolismAppendix } from "./lib/hexagram-fidelity-legge-sacred.mjs";
import { parseCtextZhouYi, parseCtextZhouYiFromHtml, mergeCtextGold } from "./lib/hexagram-fidelity-ctext.mjs";
import { parseAllWilhelmEpubOrThrow } from "./lib/hexagram-fidelity-wilhelm-epub.mjs";
import { parseAllLeggeEpubOrThrow } from "./lib/hexagram-fidelity-legge-epub.mjs";
import { parseAllLeggeSbePdfOrThrow } from "./lib/hexagram-fidelity-legge-sbe-pdf.mjs";
import {
  makeDiff,
  summarizeDiffs,
  bundleHexToFields,
  goldWilhelmFields,
  goldLeggeFields,
} from "./lib/hexagram-fidelity-diff.mjs";
import { writeJsonReport, writeMarkdownReport, buildTimestamp } from "./lib/hexagram-fidelity-report.mjs";

const args = new Set(process.argv.slice(2));
const live = args.has("--live");
const translatorArg = [...args].find((a) => a.startsWith("--translator="));
const selectedRaw = translatorArg?.split("=")[1] ?? "all";
const selectedSet = new Set(
  selectedRaw === "all"
    ? ["wilhelm", "legge", "zhouyi"]
    : selectedRaw.split(",").map((s) => s.trim()).filter(Boolean),
);

function isSelected(name) {
  return selectedSet.has(name);
}

function log(msg) {
  console.log(msg);
}

const goldArg = [...args].find((a) => a.startsWith("--gold="));
const goldMode = goldArg?.split("=")[1] ?? "books";

function wilhelmUsesDeBookGold(mode) {
  return mode === "wilhelm-de-books" || mode === "books";
}

function wilhelmUsesBookGold(mode) {
  return mode === "books" || mode === "pdf-wilhelm" || mode === "epub-wilhelm" || mode === "wilhelm-de-books";
}

function wilhelmUsesPdfGold(mode) {
  return mode === "pdf-wilhelm";
}

function wilhelmUsesLegacyEnPdfGold(mode) {
  return mode === "pdf-wilhelm" || (mode === "books" && false);
}

function wilhelmUsesEpubGold(mode) {
  return mode === "epub-wilhelm";
}

function leggeUsesBookGold(mode) {
  return mode === "books" || mode === "pdf-legge" || mode === "epub-legge";
}

function leggeUsesPdfGold(mode) {
  return mode === "books" || mode === "pdf-legge";
}

function leggeUsesEpubGold(mode) {
  return mode === "epub-legge";
}

function usesMirrorGold(mode) {
  return mode === "parma" || mode === "mirrors";
}

async function compareWilhelm(bundle) {
  /** @type {Record<number, object> | null} */
  let pdfGoldByHex = null;
  /** @type {Record<number, object> | null} */
  let parmaGoldRaw = null;
  let goldLabel;

  if (wilhelmUsesEpubGold(goldMode)) {
    log("Wilhelm: loading EPUB gold cross-check (Wilhelm/Baynes, Bollingen 2011)…");
    pdfGoldByHex = await parseAllWilhelmEpubOrThrow();
    goldLabel = "epub-wilhelm";
  } else if (wilhelmUsesDeBookGold(goldMode)) {
    log("Wilhelm: loading DE 1924 book-primary gold (merged OCR / PDF when available)…");
    pdfGoldByHex = await loadWilhelmDePdfGoldOrThrow({ force: false });
    goldLabel = "wilhelm-de-books";
  } else if (goldMode === "pdf-wilhelm") {
    log("Wilhelm: loading Baynes EN PDF gold (legacy diagnostic)…");
    pdfGoldByHex = await loadWilhelmPdfGoldOrThrow({ force: false });
    goldLabel = "pdf-wilhelm";
  } else {
    log("Wilhelm: loading Parma gold (+ Baynes tier-2 supplements)…");
    const parmaHtml = await loadParmaHtml({ live });
    parmaGoldRaw = parseAllParmaWilhelm(parmaHtml);
    pdfGoldByHex = applyWilhelmBaynesSupplements(parmaGoldRaw);
    goldLabel = "parma";
  }

  const diffs = [];

  for (const hex of bundle.hexagrams) {
    const pdfGold = pdfGoldByHex?.[hex.number];
    if (!pdfGold) {
      diffs.push({
        translator: "wilhelm",
        hex: hex.number,
        field: "*",
        linePos: null,
        status: "missing_gold",
        hint: wilhelmUsesPdfGold(goldMode)
          ? "hex_not_in_pdf"
          : wilhelmUsesEpubGold(goldMode)
            ? "hex_not_in_epub"
            : "hex_not_in_parma",
        expected: "",
        actual: "",
      });
      continue;
    }

    const usedTier2 =
      goldLabel === "parma" &&
      Boolean(getWilhelmBaynesJudgmentSupplement(hex.number)) &&
      !String(parmaGoldRaw?.[hex.number]?.judgment ?? "").trim();

    const bundleFields = bundleHexToFields(hex, "wilhelm");
    const byKey = new Map(bundleFields.map((f) => [f.field + (f.linePos ?? ""), f]));
    const diffTranslator = goldLabel === "wilhelm-de-books" ? "wilhelm-de" : "wilhelm";

    for (const gf of goldWilhelmFields(pdfGold)) {
      const key = gf.field + (gf.linePos ?? "");
      const bf = byKey.get(key);
      let expected = gf.expected;
      if (goldLabel !== "wilhelm-de-books") {
        if (gf.field === "line" && gf.linePos != null) {
          const printLine = getWilhelmPrintVerifiedLine(hex.number, gf.linePos);
          expected =
            printLine ||
            resolveWilhelmLineForIngest(hex.number, gf.linePos, pdfGold.lines?.[gf.linePos] ?? "", "");
        } else if (gf.field === "judgment") {
          expected = resolveWilhelmJudgmentForIngest(hex.number, pdfGold.judgment ?? "", "");
        }
      }
      diffs.push(
        makeDiff({
          translator: diffTranslator,
          hex: hex.number,
          field: gf.field,
          linePos: gf.linePos,
          expected,
          actual: bf?.actual ?? "",
          strict: gf.field === "line",
          ...(usedTier2 && gf.field === "judgment"
            ? { note: "tier2_baynes_judgment" }
            : {}),
        }),
      );
    }
  }

  return { translator: "wilhelm", diffs, summary: summarizeDiffs(diffs) };
}

async function compareLegge(bundle) {
  /** @type {Record<number, { judgment: string; image: string; lines: Record<number, string>; supernumerary?: string; yongJiu?: string; yongLiu?: string }>} */
  let goldByHex;

  if (leggeUsesPdfGold(goldMode)) {
    log("Legge: loading SBE XVI PDF gold (James Legge, Oxford scan + OCR)…");
    const parsed = await parseAllLeggeSbePdfOrThrow({
      onProgress: (msg) => log(`  ${msg}`),
      epubGuide: false,
    });
    goldByHex = {};
    for (let n = 1; n <= 64; n++) {
      const row = parsed[n];
      goldByHex[n] = {
        judgment: row.judgment,
        image: row.image,
        lines: row.lines,
        supernumerary: n === 1 ? row.yongJiu : n === 2 ? row.yongLiu : "",
      };
    }
  } else if (leggeUsesEpubGold(goldMode)) {
    log("Legge: loading EPUB gold cross-check (James Legge, sacred-texts re-pack)…");
    const parsed = await parseAllLeggeEpubOrThrow();
    goldByHex = {};
    for (let n = 1; n <= 64; n++) {
      const row = parsed[n];
      goldByHex[n] = {
        judgment: row.judgment,
        image: row.image,
        lines: row.lines,
        supernumerary: n === 1 ? row.yongJiu : n === 2 ? row.yongLiu : "",
      };
    }
  } else {
    log("Legge: loading sacred-texts gold (ic + icap2) [deprecated]…");
    const symbolismHtml = await loadLeggeSymbolismHtml({ live });
    const imageByHex = parseLeggeSymbolismAppendix(symbolismHtml);
    goldByHex = {};
    for (let n = 1; n <= 64; n++) {
      const html = await loadLeggeTextHtml(n, { live });
      const parsed = parseLeggeTextPage(html);
      goldByHex[n] = {
        judgment: parsed.judgment,
        image: imageByHex[n] ?? "",
        lines: parsed.lineByPos,
        supernumerary: parsed.supernumerary,
      };
    }
  }

  const diffs = [];

  for (const hex of bundle.hexagrams) {
    const gold = goldByHex[hex.number];
    if (!gold) {
      diffs.push({
        translator: "legge",
        hex: hex.number,
        field: "*",
        linePos: null,
        status: "missing_gold",
        hint: leggeUsesPdfGold(goldMode)
          ? "hex_not_in_sbe_pdf"
          : leggeUsesEpubGold(goldMode)
            ? "hex_not_in_epub"
            : "hex_not_in_sacred",
        expected: "",
        actual: "",
      });
      continue;
    }

    const goldFields = goldLeggeFields({
      hex: hex.number,
      judgment: gold.judgment,
      image: gold.image,
      lines: gold.lines,
      supernumerary: gold.supernumerary,
    });
    const bundleFields = bundleHexToFields(hex, "legge");
    const byKey = new Map(bundleFields.map((f) => [f.field + (f.linePos ?? ""), f]));

    for (const gf of goldFields) {
      const key = gf.field + (gf.linePos ?? "");
      const bf = byKey.get(key);
      diffs.push(
        makeDiff({
          translator: "legge",
          hex: hex.number,
          field: gf.field,
          linePos: gf.linePos,
          expected: gf.expected,
          actual: bf?.actual ?? "",
        }),
      );
    }
  }

  return { translator: "legge", diffs, summary: summarizeDiffs(diffs) };
}

async function compareZhouYi(bundle) {
  log("Zhou Yi: loading ctext.org gold (API + HTML 大象)…");
  const diffs = [];

  for (let n = 1; n <= 64; n++) {
    const hex = bundle.hexagrams.find((h) => h.number === n);
    const payload = await loadCtextJson(n, { live });
    const apiGold = parseCtextZhouYi(payload);
    let htmlGold = null;
    try {
      const html = await loadCtextHtml(n, { live });
      htmlGold = parseCtextZhouYiFromHtml(html);
    } catch (err) {
      log(`  warn hex ${n}: ctext HTML image fallback failed — ${err.message}`);
    }
    const gold = mergeCtextGold(apiGold, htmlGold);

    const comparisons = [
      { field: "judgment", linePos: null, expected: gold.judgment, actual: hex?.judgment ?? "" },
      { field: "image", linePos: null, expected: gold.image ?? "", actual: hex?.image ?? "" },
    ];
    for (let p = 1; p <= 6; p++) {
      comparisons.push({
        field: "line",
        linePos: p,
        expected: gold.lines[p] ?? "",
        actual: hex?.lines?.find((l) => l.position === p)?.text ?? "",
      });
    }
    if (n === 1) {
      comparisons.push({
        field: "yongJiu",
        linePos: null,
        expected: gold.yongJiu ?? "",
        actual: hex?.yongJiu ?? "",
      });
    }
    if (n === 2) {
      comparisons.push({
        field: "yongLiu",
        linePos: null,
        expected: gold.yongLiu ?? "",
        actual: hex?.yongLiu ?? "",
      });
    }

    for (const c of comparisons) {
      diffs.push(
        makeDiff({
          translator: "zhouyi",
          hex: n,
          field: c.field,
          linePos: c.linePos,
          expected: c.expected,
          actual: c.actual,
        }),
      );
    }
  }

  return { translator: "zhouyi", diffs, summary: summarizeDiffs(diffs) };
}

async function main() {
  await mkdir(GOLD_DIR, { recursive: true });
  await mkdir(join(ROOT, "reports"), { recursive: true });

  const blocks = [];
  const notes = usesMirrorGold(goldMode)
    ? [
        "OBSOLETE mirror gold (Parma / sacred-texts / ctext). Use --gold=books instead.",
        "Wilhelm gold: Uni Parma mirror (+ Baynes tier-2 supplements).",
        "Legge gold: sacred-texts.com ic01–ic64 + icap2.",
        "Zhou Yi gold: ctext.org API + HTML 大象傳.",
      ]
    : [
        "Book-primary gold (2026-06-22+): local editions in tools/source-pdfs/.",
        wilhelmUsesDeBookGold(goldMode)
          ? "Wilhelm: Richard Wilhelm DE 1924 (Diederichs) — merged OCR book-primary; PDF arbiter when local scan available."
          : wilhelmUsesPdfGold(goldMode)
            ? "Wilhelm: Pantheon 1950 PDF (Baynes EN legacy diagnostic)."
            : wilhelmUsesEpubGold(goldMode)
              ? "Wilhelm: Wilhelm/Baynes EPUB cross-check (Bollingen 2011) — diagnostic only, not book-primary gate."
              : null,
        leggeUsesPdfGold(goldMode)
          ? "Legge: James Legge SBE XVI Oxford scan (OCR) — Thwan, Great Symbolism, lines, yongJiu/yongLiu."
          : leggeUsesEpubGold(goldMode)
            ? "Legge: James Legge EPUB cross-check (sacred-texts re-pack) — diagnostic only, not book-primary gate."
            : null,
        goldMode === "books"
          ? "Default gate (--gold=books): Wilhelm DE 1924 + Legge PDF. Baynes EN: --gold=pdf-wilhelm."
          : null,
        goldMode === "books"
          ? "Zhou Yi: operational gold = ctext.org (npm run verify:hexagram-fidelity:zhouyi-ctext). Local 注疏 PDF is academic reserve, not book-primary gate."
          : null,
      ].filter(Boolean);

  if (isSelected("wilhelm") && (wilhelmUsesBookGold(goldMode) || usesMirrorGold(goldMode))) {
    const bundle = await loadBundle("wilhelm");
    blocks.push(await compareWilhelm(bundle));
  }
  if (isSelected("legge") && (leggeUsesBookGold(goldMode) || usesMirrorGold(goldMode))) {
    const bundle = await loadBundle("legge");
    blocks.push(await compareLegge(bundle));
  }
  if (isSelected("zhouyi") && usesMirrorGold(goldMode)) {
    const bundle = await loadBundle("zhouyi");
    blocks.push(await compareZhouYi(bundle));
  }

  const ts = buildTimestamp();
  const report = {
    generatedAt: new Date().toISOString(),
    mode: live ? "live-fetch" : "cache-first",
    translators: blocks,
    notes,
  };

  const jsonPath = join(ROOT, "reports", `hexagram-fidelity-${ts}.json`);
  const mdPath = join(ROOT, "reports", `hexagram-fidelity-${ts}.md`);
  await writeJsonReport(report, jsonPath);
  await writeMarkdownReport(report, mdPath);

  log("");
  log("=== Summary ===");
  for (const b of blocks) {
    log(
      `${b.translator}: ${b.summary.match}/${b.summary.total} match (${b.summary.matchPct}%) — mismatch=${b.summary.mismatch}`,
    );
  }
  log("");
  log(`JSON: ${jsonPath}`);
  log(`MD:   ${mdPath}`);

  const failed = blocks.some((b) => b.summary.mismatch > 0);
  if (failed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
