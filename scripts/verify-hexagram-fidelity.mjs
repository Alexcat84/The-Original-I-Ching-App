#!/usr/bin/env node
/**
 * Verify @iching-oracle/iching-data bundles against Tier-0 gold sources:
 *  - Wilhelm → Uni Parma mirror (+ Baynes tier-2 for documented Parma gaps, hex 56)
 *  - Legge → sacred-texts.com (Wayback fallback when live 403)
 *  - Zhou Yi → ctext.org gettext API + HTML (大象傳)
 *
 * Usage:
 *   node scripts/verify-hexagram-fidelity.mjs [--live] [--translator wilhelm|legge|zhouyi|all]
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
import { parseLeggeTextPage, parseLeggeSymbolismAppendix } from "./lib/hexagram-fidelity-legge-sacred.mjs";
import { parseCtextZhouYi, parseCtextZhouYiFromHtml, mergeCtextGold } from "./lib/hexagram-fidelity-ctext.mjs";
import {
  makeDiff,
  summarizeDiffs,
  bundleHexToFields,
  goldWilhelmFields,
} from "./lib/hexagram-fidelity-diff.mjs";
import { writeJsonReport, writeMarkdownReport, buildTimestamp } from "./lib/hexagram-fidelity-report.mjs";

const args = new Set(process.argv.slice(2));
const live = args.has("--live");
const translatorArg = [...args].find((a) => a.startsWith("--translator="));
const selected = translatorArg?.split("=")[1] ?? "all";

function log(msg) {
  console.log(msg);
}

async function compareWilhelm(bundle) {
  log("Wilhelm: loading Parma gold (+ Baynes tier-2 supplements)…");
  const parmaHtml = await loadParmaHtml({ live });
  const parmaGold = parseAllParmaWilhelm(parmaHtml);
  const goldByHex = applyWilhelmBaynesSupplements(parmaGold);
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
        hint: "hex_not_in_parma",
        expected: "",
        actual: "",
      });
      continue;
    }

    const usedTier2 =
      Boolean(getWilhelmBaynesJudgmentSupplement(hex.number)) &&
      !String(parmaGold[hex.number]?.judgment ?? "").trim();

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
  log("Legge: loading sacred-texts gold (ic + icap2)…");
  const symbolismHtml = await loadLeggeSymbolismHtml({ live });
  const imageByHex = parseLeggeSymbolismAppendix(symbolismHtml);
  const diffs = [];

  for (let n = 1; n <= 64; n++) {
    const hex = bundle.hexagrams.find((h) => h.number === n);
    const html = await loadLeggeTextHtml(n, { live });
    const parsed = parseLeggeTextPage(html);
    const gold = {
      judgment: parsed.judgment,
      image: imageByHex[n] ?? "",
      lines: parsed.lineByPos,
      supernumerary: parsed.supernumerary,
    };

    const fields = [
      { field: "judgment", linePos: null, expected: gold.judgment, actual: hex?.judgment ?? "" },
      { field: "image", linePos: null, expected: gold.image, actual: hex?.image ?? "" },
    ];
    for (let p = 1; p <= 6; p++) {
      fields.push({
        field: "line",
        linePos: p,
        expected: gold.lines[p] ?? "",
        actual: hex?.lines?.find((l) => l.position === p)?.text ?? "",
      });
    }
    const yongField = n === 1 ? "yongJiu" : n === 2 ? "yongLiu" : null;
    if (yongField && gold.supernumerary) {
      fields.push({
        field: yongField,
        linePos: null,
        expected: gold.supernumerary,
        actual: hex?.[yongField] ?? "",
      });
    }

    for (const f of fields) {
      diffs.push(
        makeDiff({
          translator: "legge",
          hex: n,
          field: f.field,
          linePos: f.linePos,
          expected: f.expected,
          actual: f.actual,
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
  const notes = [
    "Wilhelm gold: Uni Parma mirror (+ Baynes tier-2 judgment for hex 56 where Parma omits THE JUDGMENT). Oracle judgment/image/lines only (Wilhelm commentary excluded by parser).",
    "Legge gold: sacred-texts.com ic01–ic64 (text) + icap2 (Great Symbolism). Live site may 403; Wayback used as fallback.",
    "Zhou Yi gold: ctext.org gettext API (卦辭+爻辭+用九/六) + HTML scrape (大象傳).",
    "Normalizer: lowercase + whitespace collapse (EN); NFKC + strip 爻 labels (ZH).",
    "Classify mismatches A–E in Fase 2 per ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md.",
  ];

  if (selected === "all" || selected === "wilhelm") {
    const bundle = await loadBundle("wilhelm");
    blocks.push(await compareWilhelm(bundle));
  }
  if (selected === "all" || selected === "legge") {
    const bundle = await loadBundle("legge");
    blocks.push(await compareLegge(bundle));
  }
  if (selected === "all" || selected === "zhouyi") {
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
