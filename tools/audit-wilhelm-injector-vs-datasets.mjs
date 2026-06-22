#!/usr/bin/env node
/**
 * Audit Wilhelm injector (PDF gold + print-verified) vs current bundle vs legacy sources.
 */
import { readFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadWilhelmPdfGoldOrThrow } from "../scripts/lib/wilhelm-pdf-gold.mjs";
import { parseAllParmaWilhelm } from "../scripts/lib/hexagram-fidelity-parma.mjs";
import { loadParmaHtml } from "../scripts/lib/hexagram-fidelity-fetch.mjs";
import {
  normalizeHexText,
  textsMatch,
  similarityHint,
} from "../scripts/lib/hexagram-fidelity-normalize.mjs";
import { getWilhelmBaynesJudgmentSupplement } from "../scripts/lib/hexagram-fidelity-wilhelm-baynes-supplement.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function wilhelmFields(row, n) {
  return {
    judgment: row.wilhelm_judgment?.text ?? row.judgment ?? "",
    image: row.wilhelm_image?.text ?? row.image ?? "",
    lines: Object.fromEntries(
      [1, 2, 3, 4, 5, 6].map((p) => [
        p,
        row.wilhelm_lines?.[String(p)]?.text ?? row.lines?.[p] ?? "",
      ]),
    ),
    yongJiu: n === 1 ? row.yong_jiu ?? row.yongJiu ?? "" : "",
    yongLiu: n === 2 ? row.yong_liu ?? row.yongLiu ?? "" : "",
  };
}

function classifyWilhelm(field, hint, expected, actual) {
  if (textsMatch(expected, actual, "wilhelm")) return "none";
  const e = normalizeHexText(expected, "wilhelm");
  const a = normalizeHexText(actual, "wilhelm");
  if (e.replace(/[^a-z0-9]/g, "") === a.replace(/[^a-z0-9]/g, "")) return "minor_format";
  if (hint.includes("commentary_bleed") || hint.includes("truncated")) return "high_structural";
  if (Math.abs(e.length - a.length) > 50) return "high_content";
  if (field.startsWith("line") && e.length > 30 && a.length > 30) {
    const ew = e.split(" ").slice(0, 8).join(" ");
    const aw = a.split(" ").slice(0, 8).join(" ");
    if (ew !== aw) return "high_content";
  }
  return "moderate";
}

function snippet(t, n = 70) {
  const s = String(t ?? "").replace(/\s+/g, " ").trim();
  return s.length <= n ? s : `${s.slice(0, n)}…`;
}

function diffPair(label, gold, bundle, out) {
  for (let n = 1; n <= 64; n++) {
    const g = wilhelmFields(gold[n] ?? gold[String(n)] ?? {}, n);
    const b = wilhelmFields(bundle[String(n)] ?? bundle[n] ?? {}, n);
    for (const [field, key] of [
      ["judgment", "judgment"],
      ["image", "image"],
    ]) {
      if (!textsMatch(g[key], b[key], "wilhelm")) {
        out.push({
          label,
          hex: n,
          field,
          importance: classifyWilhelm(field, similarityHint(g[key], b[key], "wilhelm"), g[key], b[key]),
          gold: snippet(g[key]),
          bundle: snippet(b[key]),
        });
      }
    }
    for (let p = 1; p <= 6; p++) {
      if (!textsMatch(g.lines[p], b.lines[p], "wilhelm")) {
        out.push({
          label,
          hex: n,
          field: `L${p}`,
          importance: classifyWilhelm(`line${p}`, similarityHint(g.lines[p], b.lines[p], "wilhelm"), g.lines[p], b.lines[p]),
          gold: snippet(g.lines[p]),
          bundle: snippet(b.lines[p]),
        });
      }
    }
    if (n === 1 && g.yongJiu && !textsMatch(g.yongJiu, b.yongJiu, "wilhelm")) {
      out.push({ label, hex: 1, field: "yongJiu", importance: "moderate", gold: snippet(g.yongJiu), bundle: snippet(b.yongJiu) });
    }
    if (n === 2 && g.yongLiu && !textsMatch(g.yongLiu, b.yongLiu, "wilhelm")) {
      out.push({ label, hex: 2, field: "yongLiu", importance: "moderate", gold: snippet(g.yongLiu), bundle: snippet(b.yongLiu) });
    }
  }
}

async function loadGitSnapshot(ref) {
  const raw = execSync(`git show ${ref}:scripts/iching_wilhelm_translation.mjs`, {
    cwd: root,
    encoding: "utf8",
  });
  const m = raw.match(/export default (\{[\s\S]*\});?\s*$/);
  return m ? JSON.parse(m[1]) : null;
}

async function main() {
  const current = (await import(pathToFileURL(join(root, "scripts/iching_wilhelm_translation.mjs")).href)).default;
  const pdfGold = await loadWilhelmPdfGoldOrThrow({ force: false });
  const parmaHtml = await readFile(join(root, "tools/output/fidelity-gold/parma-wilhelm.html"), "utf8").catch(() => null);
  const parmaGold = parseAllParmaWilhelm(parmaHtml ?? (await loadParmaHtml({ live: false })));

  const legacyAdamblvck = await loadGitSnapshot("617a144");
  const prePdfGate = await loadGitSnapshot("bfbe8f6^");
  const preSyncParma = await loadGitSnapshot("da607cf");

  const pdfVsBundle = [];
  const parmaVsBundle = [];
  const legacyVsCurrent = [];
  const prePdfVsCurrent = [];

  const preSyncVsCurrent = [];
  if (preSyncParma) diffPair("pre_sync_parma_bundle", preSyncParma, current, preSyncVsCurrent);

  diffPair("pdf_gold", pdfGold, current, pdfVsBundle);
  diffPair("parma", parmaGold, current, parmaVsBundle);
  if (legacyAdamblvck) diffPair("adamblvck_2025", legacyAdamblvck, current, legacyVsCurrent);
  if (prePdfGate) diffPair("pre_pdf_gate", prePdfGate, current, prePdfVsCurrent);

  // PDF gold completeness
  let pdfOk = 0;
  let pdfEmpty = 0;
  const printVerified = [8, 11, 21];
  for (let n = 1; n <= 64; n++) {
    const g = wilhelmFields(pdfGold[n], n);
    for (const [k, v] of Object.entries({ ...g, ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((p) => [`L${p}`, g.lines[p]])) })) {
      if (k === "lines") continue;
      if (String(v ?? "").trim().length > 10) pdfOk++;
      else pdfEmpty++;
    }
  }

  const tier2 = [{ hex: 56, field: "judgment", note: "Baynes supplement (Parma omits THE JUDGMENT)" }];

  console.log("=== WILHELM INJECTOR (PDF Pantheon 1950 + print-verified) vs BUNDLE ===");
  console.log(`Diffs (harness-normalized): ${pdfVsBundle.length} (target 0)`);
  console.log(`Print-verified overrides: hex ${printVerified.join(", ")}`);
  console.log(`Tier-2 Baynes supplements in pipeline: ${tier2.length} hex`);

  console.log("\n=== PARMA mirror vs BUNDLE (ingest-wilhelm source) ===");
  console.log(`Diffs: ${parmaVsBundle.length}`);

  console.log("\n=== PRE-SYNC PARMA BUNDLE (da607cf) vs BUNDLE PDF-SYNCED ===");
  console.log(`Diffs: ${preSyncVsCurrent.length}`);
  const preSyncImportant = preSyncVsCurrent.filter((d) => !["none", "minor_format"].includes(d.importance));
  console.log(`Importantes: ${preSyncImportant.length}`);

  console.log("\n=== LEGACY adamblvck (617a144, pre-Parma ingest) vs BUNDLE ACTUAL ===");
  console.log(`Diffs: ${legacyVsCurrent.length}`);
  const legacyImportant = legacyVsCurrent.filter((d) => !["none", "minor_format"].includes(d.importance));
  console.log(`Importantes: ${legacyImportant.length}`);

  console.log("\n=== PRE-PDF-GATE (bfbe8f6^, post-Parma pre-da607cf) vs BUNDLE ACTUAL ===");
  console.log(`Diffs: ${prePdfVsCurrent.length}`);
  const preImportant = prePdfVsCurrent.filter((d) => !["none", "minor_format"].includes(d.importance));
  console.log(`Importantes: ${preImportant.length}`);

  function printTable(title, rows, limit = 35) {
    const imp = rows.filter((d) => !["none", "minor_format"].includes(d.importance));
    console.log(`\n--- ${title} (${imp.length} important) ---`);
    console.log("| Hex | Campo | Clase | Antes | Ahora |");
    console.log("|-----|-------|-------|-------|-------|");
    for (const d of imp.slice(0, limit)) {
      console.log(`| ${d.hex} | ${d.field} | ${d.importance} | ${d.gold.replace(/\|/g, "/")} | ${d.bundle.replace(/\|/g, "/")} |`);
    }
    if (imp.length > limit) console.log(`| … | +${imp.length - limit} más | | | |`);
  }

  printTable("PDF gold vs bundle (inyector)", pdfVsBundle, 10);
  printTable("pre-sync Parma bundle vs PDF-synced", preSyncVsCurrent, 30);
  printTable("adamblvck legacy vs bundle", legacyVsCurrent, 25);
  printTable("pre-PDF-gate vs bundle (cambios da607cf)", prePdfVsCurrent, 25);

  // Exact string match bundle vs pdf
  let exact = 0;
  let total = 0;
  for (let n = 1; n <= 64; n++) {
    const g = wilhelmFields(pdfGold[n], n);
    const b = wilhelmFields(current[String(n)], n);
    for (const k of ["judgment", "image"]) {
      total++;
      if (String(g[k]).trim() === String(b[k]).trim()) exact++;
    }
    for (let p = 1; p <= 6; p++) {
      total++;
      if (String(g.lines[p]).trim() === String(b.lines[p]).trim()) exact++;
    }
  }
  console.log(`\nExact string match PDF gold vs bundle: ${exact}/${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
