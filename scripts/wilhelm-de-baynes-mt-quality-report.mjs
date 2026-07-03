#!/usr/bin/env node

/**
 * QA code: AU-FID-W-012 wilhelm-de-baynes-mt-quality · v1.0.0
 * Area: scripts/wilhelm-de-baynes-mt-quality-report.mjs
 * Family: FID-W
 *
 * Exhaustive field-by-field audit: DE (Wilhelm 1924) → MT EN vs Baynes EN.
 * Not a fidelity gate — semantic overlap via token Jaccard + structure signals.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildWilhelmBaynesDeRows,
  summarizeWilhelmBaynesDeRows,
  WILHELM_BAYNES_FIELD_BLOCKS,
} from "./lib/wilhelm-baynes-de-field-map.mjs";
import {
  compareWilhelmDeBaynesQuality,
  summarizeQualityVerdicts,
} from "./lib/wilhelm-de-baynes-quality-compare.mjs";
import { compareWilhelmEnDeField } from "./lib/wilhelm-en-de-quality-compare.mjs";
import {
  DEFAULT_MT_CACHE_PATH,
  purgeBadTranslationCache,
  translateDeTextsBatch,
} from "./lib/de-en-auto-translate.mjs";
import {
  WILHELM_DE_BOOK_ONE_ZENO_EXTRACT,
  WILHELM_DE_PRIMARY_SOURCE,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

const SKIP_MT_FIELDS = new Set(["hex", "chinese", "hex_font"]);

function parseArgs(argv) {
  /** @type {{
   *   deMaestro: string;
   *   hex?: number;
   *   block?: string;
   *   delayMs: number;
   *   html: boolean;
   *   refreshMt: boolean;
   * }} */
  const out = {
    deMaestro: WILHELM_DE_BOOK_ONE_ZENO_EXTRACT,
    delayMs: 250,
    html: true,
    refreshMt: false,
  };
  for (const arg of argv) {
    if (arg.startsWith("--de-maestro=")) out.deMaestro = arg.slice(13);
    if (arg.startsWith("--hex=")) out.hex = Number(arg.slice(6));
    if (arg.startsWith("--block=")) out.block = arg.slice(8);
    if (arg.startsWith("--delay-ms=")) out.delayMs = Number(arg.slice(11)) || 250;
    if (arg === "--no-html") out.html = false;
    if (arg === "--refresh-mt") out.refreshMt = true;
  }
  return out;
}

/**
 * @param {string} field
 * @param {string} de
 */
function shouldTranslate(field, de) {
  return Boolean(String(de ?? "").trim()) && !SKIP_MT_FIELDS.has(field);
}

function preview(text, max = 140) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function tsvEscape(value) {
  return String(value ?? "").replace(/\t/g, " ").replace(/\r?\n/g, " ").replace(/"/g, '""');
}

function pct(score) {
  if (score == null || Number.isNaN(score)) return "";
  return `${Math.round(score * 100)}%`;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {object} params
 */
function buildHtml({ generatedAt, summary, qualitySummary, rows, blocks, primarySource }) {
  const payload = JSON.stringify({ summary, qualitySummary, rows, blocks, primarySource });
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Wilhelm DE → MT EN vs Baynes — auditoría campo a campo</title>
  <style>
    :root { color-scheme: light dark; --border:#ccc; --muted:#666; --ok:#1a7f37; --warn:#9a6700; --bad:#cf222e; }
    @media (prefers-color-scheme: dark) {
      :root { --border:#444; --muted:#aaa; --ok:#3fb950; --warn:#d29922; --bad:#f85149; }
      body { background:#0d1117; color:#e6edf3; }
    }
    body { font-family:"Segoe UI",system-ui,sans-serif; margin:0; padding:1rem 1.25rem 3rem; line-height:1.45; }
    h1 { font-size:1.35rem; margin:0 0 0.5rem; }
    h2 { font-size:1.05rem; margin:2rem 0 0.35rem; border-bottom:1px solid var(--border); padding-bottom:0.25rem; }
    .meta { color:var(--muted); font-size:0.9rem; max-width:78rem; margin-bottom:1rem; }
    .stats { display:flex; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem; }
    .stat { border:1px solid var(--border); border-radius:8px; padding:0.5rem 0.75rem; min-width:7rem; }
    .stat strong { display:block; font-size:1.05rem; }
    .controls { display:flex; flex-wrap:wrap; gap:0.75rem; align-items:end; margin-bottom:1rem; position:sticky; top:0; background:Canvas; padding:0.5rem 0; z-index:2; }
    label { display:flex; flex-direction:column; gap:0.25rem; font-size:0.85rem; color:var(--muted); }
    select, input { font:inherit; padding:0.35rem 0.5rem; min-width:6rem; }
    table { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:0.5rem; }
    th, td { border:1px solid var(--border); vertical-align:top; padding:0.45rem; }
    th { font-size:0.8rem; text-align:left; }
    pre { white-space:pre-wrap; word-break:break-word; margin:0; font-family:Consolas,monospace; font-size:0.74rem; }
    .score { font-weight:700; font-size:0.85rem; }
    .score.high { color:var(--ok); }
    .score.mid { color:var(--warn); }
    .score.low { color:var(--bad); }
    .notes { margin:0.25rem 0 0; padding-left:1rem; font-size:0.72rem; color:var(--muted); }
    code.field { font-size:0.72rem; }
  </style>
</head>
<body>
  <h1>Wilhelm DE 1924 → MT EN vs Baynes (campo a campo)</h1>
  <p class="meta">
    Fuente canónica: ${escapeHtml(primarySource?.citation ?? "Wilhelm DE 1924")}.
    MT vía caché MyMemory/LibreTranslate — heurística Jaccard, no gate de fidelidad literal.
    Generado ${escapeHtml(generatedAt)}.
  </p>
  <div class="stats" id="stats"></div>
  <div class="stats" id="qualityStats"></div>
  <div class="controls">
    <label>Bloque<select id="blockFilter"><option value="">Todos</option></select></label>
    <label>Hex<select id="hexFilter"><option value="">#1–64</option></select></label>
    <label>Veredicto<select id="verdictFilter"><option value="">Todos</option></select></label>
    <label>Score mín<input type="number" id="minScore" min="0" max="100" step="5" placeholder="0–100" /></label>
    <label>Buscar<input type="search" id="textFilter" placeholder="DE, MT o Baynes…" /></label>
  </div>
  <div id="tableHost"></div>
  <script type="application/json" id="payload">${payload}</script>
  <script>
    const { summary, qualitySummary, rows, blocks } = JSON.parse(document.getElementById("payload").textContent);
    document.getElementById("stats").innerHTML = Object.entries(summary)
      .filter(([k]) => typeof summary[k] !== "object")
      .map(([k,v]) => '<div class="stat"><span>'+k+'</span><strong>'+v+'</strong></div>').join("");
    document.getElementById("qualityStats").innerHTML = Object.entries(qualitySummary)
      .sort((a,b)=>b[1]-a[1])
      .map(([k,v]) => '<div class="stat"><span>'+k+'</span><strong>'+v+'</strong></div>').join("");
    const blockFilter = document.getElementById("blockFilter");
    const hexFilter = document.getElementById("hexFilter");
    const verdictFilter = document.getElementById("verdictFilter");
    for (const b of blocks) {
      const o = document.createElement("option"); o.value = b.id; o.textContent = b.title; blockFilter.appendChild(o);
    }
    for (let i = 1; i <= 64; i++) {
      const o = document.createElement("option"); o.value = String(i); o.textContent = "#"+i; hexFilter.appendChild(o);
    }
    for (const v of [...new Set(rows.map(r => r.compare?.verdict).filter(Boolean))].sort()) {
      const o = document.createElement("option"); o.value = v; o.textContent = v; verdictFilter.appendChild(o);
    }
    function scoreClass(s) {
      if (s == null) return "";
      if (s >= 0.45) return "high";
      if (s >= 0.2) return "mid";
      return "low";
    }
    function render() {
      const block = blockFilter.value, hex = hexFilter.value, verdict = verdictFilter.value;
      const minScore = Number(document.getElementById("minScore").value) / 100;
      const q = document.getElementById("textFilter").value.trim().toLowerCase();
      const filtered = rows.filter(r => {
        if (block && r.blockId !== block) return false;
        if (hex && String(r.hex) !== hex) return false;
        if (verdict && (r.compare?.verdict || "") !== verdict) return false;
        if (!Number.isNaN(minScore) && document.getElementById("minScore").value !== "") {
          const s = r.compare?.score;
          if (s == null || s < minScore) return false;
        }
        if (q && !(r.de+"\\n"+r.enAuto+"\\n"+r.enBaynes).toLowerCase().includes(q)) return false;
        return true;
      });
      const host = document.getElementById("tableHost");
      if (!filtered.length) { host.innerHTML = "<p>Sin filas.</p>"; return; }
      let html = "";
      for (const b of blocks) {
        const group = filtered.filter(r => r.blockId === b.id);
        if (!group.length) continue;
        html += '<h2>'+escapeHtml(b.title)+' <span style="color:var(--muted);font-weight:400">('+group.length+' filas)</span></h2>';
        html += '<table><thead><tr><th>#</th><th>Campo</th><th>Baynes EN</th><th>DE literal</th><th>MT EN</th><th>Score</th><th>Veredicto / notas</th></tr></thead><tbody>';
        for (const r of group.sort((a,b) => (a.compare?.score ?? -1) - (b.compare?.score ?? -1) || a.hex - b.hex)) {
          const s = r.compare?.score;
          html += '<tr><td>'+r.hex+'</td><td><code class="field">'+r.field+'</code></td>';
          html += '<td><pre>'+escapeHtml(r.enBaynes)+'</pre></td>';
          html += '<td><pre>'+escapeHtml(r.de)+'</pre></td>';
          html += '<td><pre>'+escapeHtml(r.enAuto)+'</pre></td>';
          html += '<td class="score '+scoreClass(s)+'">'+(s == null ? "—" : Math.round(s*100)+"%")+'</td>';
          html += '<td><strong>'+escapeHtml(r.compare?.label || r.compare?.verdict || "")+'</strong>';
          if (Array.isArray(r.compare?.notes)) html += '<ul class="notes">'+r.compare.notes.map(n=>'<li>'+escapeHtml(n)+'</li>').join("")+'</ul>';
          html += '</td></tr>';
        }
        html += '</tbody></table>';
      }
      host.innerHTML = html;
    }
    function escapeHtml(s) {
      return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }
    for (const el of [blockFilter, hexFilter, verdictFilter, document.getElementById("minScore"), document.getElementById("textFilter")]) {
      el.addEventListener("input", render); el.addEventListener("change", render);
    }
    render();
  </script>
</body>
</html>`;
}

/**
 * @param {Array<object>} rows
 */
function buildSummary(rows, structural) {
  const scored = rows.filter((r) => r.compare?.score != null);
  const scores = scored.map((r) => r.compare.score);
  const avgScore =
    scores.length > 0 ? Math.round((1000 * scores.reduce((a, b) => a + b, 0)) / scores.length) / 10 : null;

  /** @type {Record<string, number>} */
  const byField = {};
  for (const row of scored) {
    byField[row.field] = byField[row.field] ?? 0;
    byField[row.field]++;
  }

  const divergent = rows
    .filter((r) => r.compare?.verdict === "divergent" || r.compare?.verdict === "weak_align")
    .sort((a, b) => (a.compare?.score ?? 0) - (b.compare?.score ?? 0));

  return {
    ...structural,
    mtTranslated: rows.filter((r) => r.mtApplied).length,
    mtSkipped: rows.filter((r) => r.mtSkipped).length,
    scoredPairs: scored.length,
    avgScorePct: avgScore,
    scoreBuckets: {
      strong_align: rows.filter((r) => r.compare?.verdict === "strong_align").length,
      moderate_align: rows.filter((r) => r.compare?.verdict === "moderate_align").length,
      weak_align: rows.filter((r) => r.compare?.verdict === "weak_align").length,
      divergent: rows.filter((r) => r.compare?.verdict === "divergent").length,
      mt_failed: rows.filter((r) => r.compare?.verdict === "mt_failed").length,
    },
    divergentCount: divergent.length,
    worstRows: divergent.slice(0, 40).map((r) => ({
      hex: r.hex,
      field: r.field,
      score: r.compare?.score,
      verdict: r.compare?.verdict,
      dePreview: preview(r.de, 80),
      enAutoPreview: preview(r.enAuto, 80),
      enBaynesPreview: preview(r.enBaynes, 80),
    })),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const purged = await purgeBadTranslationCache();
  console.log(`MT cache purge: removed ${purged.removed}, remaining ${purged.remaining}`);

  let rows = await buildWilhelmBaynesDeRows({
    hex: args.hex,
    deMaestroPath: args.deMaestro,
  });
  if (args.block) rows = rows.filter((r) => r.blockId === args.block);

  const toTranslate = rows.filter((r) => shouldTranslate(r.field, r.de)).map((r) => r.de);
  console.log(`Translating ${toTranslate.length} DE fields (cache: ${DEFAULT_MT_CACHE_PATH})…`);

  const mtMap = await translateDeTextsBatch(toTranslate, {
    delayMs: args.delayMs,
    skipMissing: false,
    onRow: (i, total) => {
      if (i % 25 === 0 || i === total) process.stdout.write(`\rMT progress: ${i}/${total}   `);
    },
  });
  console.log("\nMT batch done.");

  for (const row of rows) {
    const enBaynes = row.en;
    const mtApplied = shouldTranslate(row.field, row.de);
    const enAuto = mtApplied ? (mtMap.get(row.de) ?? "") : "";
    row.enBaynes = enBaynes;
    row.enAuto = enAuto;
    row.mtApplied = mtApplied;
    row.mtSkipped = !mtApplied && Boolean(row.de.trim());

    row.compare = mtApplied
      ? compareWilhelmDeBaynesQuality({
          de: row.de,
          enAuto,
          enBaynes,
          classification: row.classification,
          field: row.field,
        })
      : compareWilhelmEnDeField({
          en: enBaynes,
          de: row.de,
          field: row.field,
          classification: row.classification,
        });
  }

  const structural = summarizeWilhelmBaynesDeRows(rows);
  const qualitySummary = summarizeQualityVerdicts(rows);
  const summary = buildSummary(rows, structural);
  const generatedAt = new Date().toISOString();
  const ts = generatedAt.replace(/[:.]/g, "-");
  const outDir = join(ROOT, "reports");
  await mkdir(outDir, { recursive: true });

  const jsonPath = join(outDir, `wilhelm-de-mt-quality-${ts}.json`);
  const tsvPath = join(outDir, `wilhelm-de-mt-quality-${ts}.tsv`);
  const htmlPath = join(outDir, `wilhelm-de-mt-quality-viewer-${ts}.html`);

  const exportRows = rows.map((r) => ({
    hex: r.hex,
    blockId: r.blockId,
    blockTitle: r.blockTitle,
    field: r.field,
    classification: r.classification,
    score: r.compare?.score ?? null,
    scorePct: pct(r.compare?.score),
    openingScorePct: pct(r.compare?.openingScore),
    verdict: r.compare?.verdict ?? "",
    label: r.compare?.label ?? "",
    notes: r.compare?.notes ?? [],
    dePreview: preview(r.de),
    enAutoPreview: preview(r.enAuto),
    enBaynesPreview: preview(r.enBaynes),
    de: r.de,
    enAuto: r.enAuto,
    enBaynes: r.enBaynes,
  }));

  await writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        generatedAt,
        primarySource: WILHELM_DE_PRIMARY_SOURCE,
        deMaestro: args.deMaestro,
        summary,
        qualitySummary,
        rows: exportRows,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const tsvHeader = [
    "hex",
    "field",
    "classification",
    "score_pct",
    "opening_score_pct",
    "verdict",
    "label",
    "de_preview",
    "mt_en_preview",
    "baynes_en_preview",
    "notes",
  ].join("\t");
  const tsvBody = exportRows
    .map((r) =>
      [
        r.hex,
        r.field,
        r.classification,
        r.scorePct,
        r.openingScorePct,
        r.verdict,
        r.label,
        r.dePreview,
        r.enAutoPreview,
        r.enBaynesPreview,
        (r.notes ?? []).join(" | "),
      ]
        .map(tsvEscape)
        .join("\t"),
    )
    .join("\n");
  await writeFile(tsvPath, `${tsvHeader}\n${tsvBody}\n`, "utf8");

  if (args.html) {
    const blocks = WILHELM_BAYNES_FIELD_BLOCKS.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle ?? "",
    }));
    await writeFile(
      htmlPath,
      buildHtml({
        generatedAt,
        summary,
        qualitySummary,
        rows: exportRows,
        blocks,
        primarySource: WILHELM_DE_PRIMARY_SOURCE,
      }),
      "utf8",
    );
  }

  console.log(`Rows: ${summary.total} · Pairs EN+DE: ${summary.pair}`);
  console.log(`MT translated: ${summary.mtTranslated} · Scored: ${summary.scoredPairs} · Avg score: ${summary.avgScorePct}%`);
  console.log(`Verdicts:`, qualitySummary);
  console.log(`Divergent+weak: ${summary.divergentCount}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`TSV: ${tsvPath}`);
  if (args.html) console.log(`HTML: ${htmlPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
