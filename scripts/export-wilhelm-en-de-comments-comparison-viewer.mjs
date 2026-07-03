#!/usr/bin/env node

/**
 * QA code: VF-FID-W-039 export-wilhelm-en-de-comments-comparison-viewer · v1.0.0
 * Area: scripts/export-wilhelm-en-de-comments-comparison-viewer.mjs
 * Family: FID-W
 */

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildWilhelmCommentsEnDeRows,
  summarizeWilhelmCommentsEnDeRows,
  WILHELM_COMMENTS_FIELD_BLOCKS,
} from "./lib/wilhelm-comments-en-de-field-map.mjs";
import {
  compareWilhelmEnDeField,
  summarizeEnDeQualityVerdicts,
} from "./lib/wilhelm-en-de-quality-compare.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function parseArgs(argv) {
  /** @type {{ hex?: number; block?: string }} */
  const out = {};
  for (const arg of argv) {
    if (arg.startsWith("--hex=")) out.hex = Number(arg.slice(6));
    if (arg.startsWith("--block=")) out.block = arg.slice(8);
  }
  return out;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml({ generatedAt, summary, qualitySummary, rows, blocks }) {
  const payload = JSON.stringify({ summary, qualitySummary, rows, blocks });
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Wilhelm Ten Wings — Baynes EN vs DE 1924</title>
  <style>
    :root {
      color-scheme: light dark;
      --border: #ccc;
      --muted: #666;
      --pair: #1a7f37;
      --en-only: #cf222e;
      --de-only: #9a6700;
      --ok: #1a7f37;
      --warn: #9a6700;
      --bad: #cf222e;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --border: #444;
        --muted: #aaa;
        --pair: #3fb950;
        --en-only: #f85149;
        --de-only: #d29922;
        --ok: #3fb950;
        --warn: #d29922;
        --bad: #f85149;
      }
      body { background: #0d1117; color: #e6edf3; }
    }
    body { font-family: "Segoe UI", system-ui, sans-serif; margin: 0; padding: 1rem 1.25rem 3rem; line-height: 1.45; }
    h1 { font-size: 1.35rem; margin: 0 0 0.5rem; }
    h2 { font-size: 1.05rem; margin: 2rem 0 0.35rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; }
    h2 .sub { font-weight: 400; color: var(--muted); font-size: 0.88rem; }
    .meta, .legend { color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem; max-width: 80rem; }
    .stats { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
    .stat { border: 1px solid var(--border); border-radius: 8px; padding: 0.5rem 0.75rem; min-width: 7rem; }
    .stat strong { display: block; font-size: 1.05rem; }
    .toc { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; max-width: 80rem; }
    .toc a { font-size: 0.78rem; padding: 0.2rem 0.45rem; border: 1px solid var(--border); border-radius: 6px; text-decoration: none; color: inherit; }
    .controls { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: end; margin-bottom: 1rem; position: sticky; top: 0; background: Canvas; padding: 0.5rem 0; z-index: 2; }
    label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; color: var(--muted); }
    select, input { font: inherit; padding: 0.35rem 0.5rem; min-width: 6rem; }
    input[type=search] { min-width: 14rem; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 0.5rem; }
    th, td { border: 1px solid var(--border); vertical-align: top; padding: 0.45rem; }
    th { background: Canvas; text-align: left; font-size: 0.8rem; }
    col.c-hex { width: 3rem; }
    col.c-field { width: 8rem; }
    col.c-cmp { width: 11rem; }
    col.c-text { width: calc((100% - 22rem) / 2); }
    pre { white-space: pre-wrap; word-break: break-word; margin: 0; font-family: "Cascadia Mono", Consolas, monospace; font-size: 0.76rem; max-height: 18rem; overflow: auto; }
    .badge { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
    .badge.pair { color: var(--pair); }
    .badge.en_only { color: var(--en-only); }
    .badge.de_only { color: var(--de-only); }
    .verdict { font-weight: 600; font-size: 0.78rem; }
    .verdict.exact, .verdict.meta_ok, .verdict.structure_ok, .verdict.label_pair, .verdict.title_pair { color: var(--ok); }
    .verdict.structure_drift, .verdict.meta_drift { color: var(--warn); }
    .verdict.en_only, .verdict.de_only, .verdict.both_empty { color: var(--bad); }
    .notes { margin: 0.3rem 0 0; padding-left: 1rem; font-size: 0.74rem; color: var(--muted); }
    .block-count { color: var(--muted); font-size: 0.82rem; font-weight: 400; }
    code.field { font-size: 0.72rem; }
  </style>
</head>
<body>
  <h1>Wilhelm Ten Wings — Baynes EN (base) vs DE 1924 (Drittes Buch AU)</h1>
  <p class="meta">
    ${summary.fieldsPerHex} campos × 64 hex = ${summary.total} filas.
    EN: <code>wilhelm-64hex-comments-parsed.json</code> ·
    DE: <code>wilhelm-de-64hex-comments-merged.json</code>.
    Generado ${escapeHtml(generatedAt)}.
  </p>
  <p class="legend">
    Columna izquierda = inglés Baynes (1950). Columna derecha = alemán literal del maestro DE (JPG AU).
    La columna «Comparativa» es heurística estructural — <strong>no traduce</strong>; sirve para revisión visual y detectar OCR ruidoso.
    Filtra por <em>structure_drift</em> o <em>meta_drift</em> para sospechosos.
  </p>
  <div class="stats" id="stats"></div>
  <div class="stats" id="qualityStats"></div>
  <nav class="toc" id="toc"></nav>
  <div class="controls">
    <label>Bloque<select id="blockFilter"><option value="">Todos</option></select></label>
    <label>Hex<select id="hexFilter"><option value="">#1–64</option></select></label>
    <label>Estado<select id="classFilter"><option value="">Todos</option><option value="pair">Par EN+DE</option><option value="en_only">Solo EN</option><option value="de_only">Solo DE</option><option value="both_empty">Vacío</option></select></label>
    <label>Calidad<select id="verdictFilter"><option value="">Todas</option></select></label>
    <label>Buscar<input type="search" id="textFilter" placeholder="EN o DE…" /></label>
  </div>
  <div id="tableHost"></div>
  <script type="application/json" id="payload">${payload}</script>
  <script>
    const { summary, qualitySummary, rows, blocks } = JSON.parse(document.getElementById("payload").textContent);

    document.getElementById("stats").innerHTML = [
      ["Filas", summary.total],
      ["Par EN+DE", summary.pair],
      ["Solo EN", summary.en_only],
      ["Solo DE", summary.de_only],
      ["Vacío ambos", summary.both_empty],
    ].map(([k,v]) => '<div class="stat"><span>'+k+'</span><strong>'+v+'</strong></div>').join("");

    document.getElementById("qualityStats").innerHTML = Object.entries(qualitySummary)
      .sort((a,b)=>b[1]-a[1])
      .map(([k,v]) => '<div class="stat"><span>'+k+'</span><strong>'+v+'</strong></div>').join("");

    const blockFilter = document.getElementById("blockFilter");
    const hexFilter = document.getElementById("hexFilter");
    const verdictFilter = document.getElementById("verdictFilter");
    const toc = document.getElementById("toc");

    for (const b of blocks) {
      const o = document.createElement("option");
      o.value = b.id;
      o.textContent = b.title;
      blockFilter.appendChild(o);
      const a = document.createElement("a");
      a.href = "#block-" + b.id;
      a.textContent = b.title;
      toc.appendChild(a);
    }
    for (let i = 1; i <= 64; i++) {
      const o = document.createElement("option");
      o.value = String(i);
      o.textContent = "#" + i;
      hexFilter.appendChild(o);
    }
    for (const v of [...new Set(rows.map(r => r.compare?.verdict).filter(Boolean))].sort()) {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      verdictFilter.appendChild(o);
    }

    function badge(c) {
      const labels = { pair: "par", en_only: "solo EN", de_only: "solo DE", both_empty: "vacío" };
      return '<span class="badge '+c+'">'+(labels[c]||c)+'</span>';
    }

    function renderCompare(r) {
      const c = r.compare || {};
      let html = '<div class="verdict '+(c.verdict||'')+'">'+(c.label||c.verdict||"—")+'</div>';
      if (Array.isArray(c.notes) && c.notes.length) {
        html += '<ul class="notes">' + c.notes.map(n => '<li>'+escapeHtml(n)+'</li>').join('') + '</ul>';
      }
      return html;
    }

    function render() {
      const block = blockFilter.value;
      const hex = hexFilter.value;
      const klass = document.getElementById("classFilter").value;
      const verdict = verdictFilter.value;
      const q = document.getElementById("textFilter").value.trim().toLowerCase();

      let filtered = rows.filter(r => {
        if (block && r.blockId !== block) return false;
        if (hex && String(r.hex) !== hex) return false;
        if (klass && r.classification !== klass) return false;
        if (verdict && (r.compare?.verdict || "") !== verdict) return false;
        if (q && !(r.en + "\\n" + r.de).toLowerCase().includes(q)) return false;
        return true;
      });

      const host = document.getElementById("tableHost");
      if (!filtered.length) { host.innerHTML = "<p>Sin filas.</p>"; return; }

      let html = "";
      for (const b of blocks) {
        const group = filtered.filter(r => r.blockId === b.id);
        if (!group.length) continue;
        html += '<h2 id="block-'+b.id+'">'+escapeHtml(b.title)+' <span class="block-count">('+group.length+' filas)</span></h2>';
        html += '<table><colgroup><col class="c-hex"/><col class="c-field"/><col class="c-text"/><col class="c-text"/><col class="c-cmp"/></colgroup>';
        html += '<thead><tr><th>#</th><th>Campo</th><th>Inglés (Baynes)</th><th>Alemán (DE AU)</th><th>Comparativa</th></tr></thead><tbody>';
        for (const r of group.sort((a,b)=>a.hex-b.hex)) {
          html += '<tr><td>'+r.hex+'</td><td><code class="field">'+r.field+'</code><br/>'+badge(r.classification)+'</td>';
          html += '<td><pre>'+escapeHtml(r.en)+'</pre></td><td><pre>'+escapeHtml(r.de)+'</pre></td><td>'+renderCompare(r)+'</td></tr>';
        }
        html += '</tbody></table>';
      }
      host.innerHTML = html;
    }

    function escapeHtml(s) {
      return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    for (const el of [blockFilter, hexFilter, document.getElementById("classFilter"), verdictFilter, document.getElementById("textFilter")]) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    }
    render();
  </script>
</body>
</html>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let rows = await buildWilhelmCommentsEnDeRows({ hex: args.hex });
  if (args.block) {
    rows = rows.filter((row) => row.blockId === args.block);
  }

  for (const row of rows) {
    row.compare = compareWilhelmEnDeField({
      en: row.en,
      de: row.de,
      field: row.field,
      classification: row.classification,
    });
  }

  const summary = summarizeWilhelmCommentsEnDeRows(rows);
  const qualitySummary = summarizeEnDeQualityVerdicts(rows);
  const generatedAt = new Date().toISOString();
  const ts = generatedAt.replace(/[:.]/g, "-");
  const outDir = join(ROOT, "reports");
  await mkdir(outDir, { recursive: true });

  const blocks = WILHELM_COMMENTS_FIELD_BLOCKS.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle ?? "",
    fields: b.fields,
  }));

  const htmlPath = join(outDir, `wilhelm-en-de-comments-comparison-viewer-${ts}.html`);
  const latestPath = join(outDir, "wilhelm-en-de-comments-comparison-latest.html");
  const html = buildHtml({ generatedAt, summary, qualitySummary, rows, blocks });

  await writeFile(htmlPath, html, "utf8");
  await writeFile(latestPath, html, "utf8");

  console.log(`Rows: ${summary.total} (${summary.fieldsPerHex} fields × 64 hex)`);
  console.log(`Pairs EN+DE: ${summary.pair} · both_empty: ${summary.both_empty}`);
  console.log(`Quality:`, qualitySummary);
  console.log(`HTML: ${htmlPath}`);
  console.log(`Latest: ${latestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
