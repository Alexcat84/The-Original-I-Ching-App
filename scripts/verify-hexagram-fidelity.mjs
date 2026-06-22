#!/usr/bin/env node
/**
 * Verify @iching-oracle/iching-data bundles against Tier-0 gold from local books.
 *
 * Canonical gate (2026-06-22+): dataset vs text extracted from physical editions
 * in tools/source-pdfs/ (see manifest.json). No web mirrors or injected supplements.
 *
 * Usage:
 *   npm run verify:hexagram-fidelity              # Wilhelm vs Pantheon 1950 PDF (canonical)
 *   npm run verify:hexagram-fidelity:pdf-wilhelm    # same, explicit
 *   npm run verify:hexagram-fidelity:pdf-legge      # Legge vs SBE XVI Oxford scan (OCR)
 *   npm run verify:hexagram-fidelity:epub-legge     # Legge vs EPUB cross-check
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
} from "./lib/hexagram-fidelity-wilhelm-baynes-supplement.mjs";
import { loadWilhelmPdfFullText } from "./lib/pdf-text-extract.mjs";
import { parseAllWilhelmPdfOrThrow } from "./lib/hexagram-fidelity-wilhelm-pdf.mjs";
import { applyWilhelmPdfPrintVerified } from "./lib/hexagram-fidelity-wilhelm-pdf-verified.mjs";
import { parseLeggeTextPage, parseLeggeSymbolismAppendix } from "./lib/hexagram-fidelity-legge-sacred.mjs";
import { parseCtextZhouYi, parseCtextZhouYiFromHtml, mergeCtextGold } from "./lib/hexagram-fidelity-ctext.mjs";
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

function wilhelmUsesBookGold(mode) {
  return mode === "books" || mode === "pdf-wilhelm";
}

function leggeUsesBookGold(mode) {
  return mode === "books" || mode === "pdf-legge" || mode === "epub-legge";
}

function leggeUsesPdfGold(mode) {
  return mode === "pdf-legge";
}

function leggeUsesEpubGold(mode) {
  return mode === "books" || mode === "epub-legge";
}

function usesMirrorGold(mode) {
  return mode === "parma" || mode === "mirrors";
}

async function compareWilhelm(bundle) {
  let goldByHex;
  let goldLabel;
  /** @type {Record<number, { judgment?: string }> | null} */
  let parmaGoldRaw = null;

  if (wilhelmUsesBookGold(goldMode)) {
    log("Wilhelm: loading PDF gold (Wilhelm/Baynes 1950 Pantheon)…");
    const text = await loadWilhelmPdfFullText();
    goldByHex = applyWilhelmPdfPrintVerified(parseAllWilhelmPdfOrThrow(text));
    goldLabel = "pdf-wilhelm";
  } else {
    log("Wilhelm: loading Parma gold (+ Baynes tier-2 supplements)…");
    const parmaHtml = await loadParmaHtml({ live });
    const parmaGold = parseAllParmaWilhelm(parmaHtml);
    parmaGoldRaw = parmaGold;
    goldByHex = applyWilhelmBaynesSupplements(parmaGold);
    goldLabel = "parma";
  }

  const diffs = [];

  for (const hex of bundle.hexagrams) {
    const gold = goldByHex[hex.number];
    if (!gold) {
      diffs.push({
        translator: "wilhelm",
        hex: hex.number,
        field: "*",
        linePos: null,
        status: "missing_gold",
        hint: wilhelmUsesBookGold(goldMode) ? "hex_not_in_pdf" : "hex_not_in_parma",
        expected: "",
        actual: "",
      });
      continue;
    }

    const usedTier2 =
      goldLabel === "parma" &&
      Boolean(getWilhelmBaynesJudgmentSupplement(hex.number)) &&
      !String(parmaGoldRaw?.[hex.number]?.judgment ?? "").trim();

    const goldFields = goldWilhelmFields(gold);
    const bundleFields = bundleHexToFields(hex, "wilhelm");
    const byKey = new Map(bundleFields.map((f) => [f.field + (f.linePos ?? ""), f]));

    for (const gf of goldFields) {
      const key = gf.field + (gf.linePos ?? "");
      const bf = byKey.get(key);
      diffs.push(
        makeDiff({
          translator: "wilhelm",
          hex: hex.number,
          field: gf.field,
          linePos: gf.linePos,
          expected: gf.expected,
          actual: bf?.actual ?? "",
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
        wilhelmUsesBookGold(goldMode)
          ? "Wilhelm: Pantheon 1950 PDF — judgment/image/lines only."
          : null,
        leggeUsesPdfGold(goldMode)
          ? "Legge: James Legge SBE XVI Oxford scan (OCR) — Thwan, Great Symbolism, lines, yongJiu/yongLiu."
          : leggeUsesEpubGold(goldMode)
            ? "Legge: James Legge EPUB cross-check (sacred-texts re-pack)."
            : null,
        goldMode === "books" ? "Zhou Yi: pending local PDF 注疏 parser." : null,
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
