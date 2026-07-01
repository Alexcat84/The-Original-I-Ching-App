#!/usr/bin/env node
/**
 * QA code: VF-FID-W-035 export-wilhelm-de-comments-anna-comparison-viewer · v1.0.0
 * Area: scripts/export-wilhelm-de-comments-anna-comparison-viewer.mjs
 * Family: FID-W
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildWilhelmDeCommentsAnnaCompareRows, summarizeAnnaCompareRows } from "./lib/wilhelm-de-comments-anna-reconcile.mjs";
import { WILHELM_COMMENTS_MANUAL_FIELDS } from "./lib/wilhelm-comments-manual-fields.mjs";
import {
  WILHELM_DE_COMMENTS_ANNA_COMPARISON_HTML,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02,
  WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04,
  WILHELM_DE_COMMENTS_ANNA_RECONCILED,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml({ generatedAt, summary, rows, fieldsPerHex }) {
  const payload = JSON.stringify({ summary, rows, fieldsPerHex });
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Wilhelm DE Ten Wings — Anna pass02 vs pass04</title>
  <style>
    :root {
      color-scheme: light dark;
      --border: #ccc;
      --muted: #666;
      --identical: #1a7f37;
      --disputed: #9a6700;
      --p02: #0969da;
      --p04: #8250df;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --border: #444;
        --muted: #aaa;
        --identical: #3fb950;
        --disputed: #d29922;
        --p02: #58a6ff;
        --p04: #bc8cff;
      }
      body { background: #0d1117; color: #e6edf3; }
    }
    body { font-family: "Segoe UI", system-ui, sans-serif; margin: 0; padding: 1rem 1.25rem 3rem; line-height: 1.45; }
    h1 { font-size: 1.35rem; margin: 0 0 0.5rem; }
    .meta { color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem; max-width: 80rem; }
    .stats { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
    .stat { border: 1px solid var(--border); border-radius: 8px; padding: 0.5rem 0.75rem; min-width: 7rem; }
    .stat strong { display: block; font-size: 1.05rem; }
    .controls { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: end; margin-bottom: 1rem; position: sticky; top: 0; background: Canvas; padding: 0.5rem 0; z-index: 2; }
    label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; color: var(--muted); }
    select, input { font: inherit; padding: 0.35rem 0.5rem; min-width: 6rem; }
    input[type=search] { min-width: 16rem; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 0.5rem; }
    th, td { border: 1px solid var(--border); vertical-align: top; padding: 0.45rem; }
    th { background: Canvas; text-align: left; font-size: 0.8rem; }
    col.c-hex { width: 3rem; }
    col.c-field { width: 9rem; }
    col.c-status { width: 8rem; }
    col.c-text { width: calc((100% - 20rem) / 3); }
    pre { white-space: pre-wrap; word-break: break-word; margin: 0; font-family: Consolas, monospace; font-size: 0.74rem; max-height: 14rem; overflow: auto; }
    .badge { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; }
    .badge.identical { color: var(--identical); }
    .badge.disputed { color: var(--disputed); }
    .badge.pass02_only { color: var(--p02); }
    .badge.pass04_only { color: var(--p04); }
    .col-head.p02 { color: var(--p02); }
    .col-head.p04 { color: var(--p04); }
    .pick-reason { font-size: 0.72rem; color: var(--muted); }
  </style>
</head>
<body>
  <h1>Wilhelm DE Drittes Buch — Anna OCR dual-pass</h1>
  <p class="meta">
    Sandbox: pass02 (carpeta 02) vs pass04 (carpeta 04) vs reconciliado heurístico.
    ${fieldsPerHex} campos × 64 hex · generado ${escapeHtml(generatedAt)}.
    <strong>No es runtime</strong> — AU PDF pendiente.
  </p>
  <div class="stats" id="stats"></div>
  <div class="controls">
    <label>Hex <select id="hexFilter"><option value="">Todos</option></select></label>
    <label>Estado <select id="statusFilter">
      <option value="">Todos</option>
      <option value="identical">identical</option>
      <option value="disputed">disputed</option>
      <option value="pass02_only">pass02_only</option>
      <option value="pass04_only">pass04_only</option>
    </select></label>
    <label>Solo disputas <input type="checkbox" id="disputedOnly" /></label>
    <label>Buscar <input type="search" id="search" placeholder="campo o texto…" /></label>
  </div>
  <table>
    <colgroup>
      <col class="c-hex" /><col class="c-field" /><col class="c-status" />
      <col class="c-text" /><col class="c-text" /><col class="c-text" />
    </colgroup>
    <thead>
      <tr>
        <th>Hex</th><th>Campo</th><th>Estado</th>
        <th class="col-head p02">Pass 02</th>
        <th class="col-head p04">Pass 04</th>
        <th>Reconciliado</th>
      </tr>
    </thead>
    <tbody id="tbody"></tbody>
  </table>
  <script>
    const DATA = ${payload};
    const tbody = document.getElementById("tbody");
    const hexFilter = document.getElementById("hexFilter");
    const statusFilter = document.getElementById("statusFilter");
    const disputedOnly = document.getElementById("disputedOnly");
    const search = document.getElementById("search");
    const stats = document.getElementById("stats");

    for (let n = 1; n <= 64; n++) {
      const o = document.createElement("option");
      o.value = String(n);
      o.textContent = String(n);
      hexFilter.appendChild(o);
    }

    function stat(label, value) {
      const d = document.createElement("div");
      d.className = "stat";
      d.innerHTML = "<strong>" + value + "</strong>" + label;
      return d;
    }

    stats.appendChild(stat("Filas comparables", DATA.summary.rowCount));
    stats.appendChild(stat("Idénticas", DATA.summary.identical));
    stats.appendChild(stat("Disputas", DATA.summary.disputed));
    stats.appendChild(stat("Solo pass02", DATA.summary.pass02Only));
    stats.appendChild(stat("Solo pass04", DATA.summary.pass04Only));

    function esc(s) {
      return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    function render() {
      const hx = hexFilter.value;
      const st = statusFilter.value;
      const q = search.value.trim().toLowerCase();
      const disp = disputedOnly.checked;
      tbody.replaceChildren();
      for (const row of DATA.rows) {
        if (hx && String(row.hex) !== hx) continue;
        if (st && row.status !== st) continue;
        if (disp && row.status !== "disputed") continue;
        if (q) {
          const blob = (row.field + " " + row.pass02 + " " + row.pass04 + " " + row.reconciled).toLowerCase();
          if (!blob.includes(q)) continue;
        }
        const tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + row.hex + "</td>" +
          "<td><code>" + esc(row.field) + "</code></td>" +
          "<td><span class=\\"badge " + row.status + "\\">" + row.status + "</span>" +
          (row.pickReason ? "<div class=\\"pick-reason\\">" + esc(row.pickReason) + "</div>" : "") +
          "</td>" +
          "<td><pre>" + esc(row.pass02) + "</pre></td>" +
          "<td><pre>" + esc(row.pass04) + "</pre></td>" +
          "<td><pre>" + esc(row.reconciled) + "</pre></td>";
        tbody.appendChild(tr);
      }
    }

    hexFilter.addEventListener("change", render);
    statusFilter.addEventListener("change", render);
    disputedOnly.addEventListener("change", render);
    search.addEventListener("input", render);
    render();
  </script>
</body>
</html>`;
}

async function main() {
  const pass02 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02, "utf8"));
  const pass04 = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04, "utf8"));
  let reconciled = null;
  try {
    reconciled = JSON.parse(await readFile(WILHELM_DE_COMMENTS_ANNA_RECONCILED, "utf8"));
  } catch {
    console.warn("Reconciled file missing — run npm run reconcile:wilhelm-de-comments-from-anna first");
  }

  const rows = buildWilhelmDeCommentsAnnaCompareRows(pass02, pass04);
  if (reconciled) {
    for (const row of rows) {
      const rec = reconciled.hexagrams?.[String(row.hex)]?.fields?.[row.field] ?? "";
      row.reconciled = String(rec);
    }
  }

  const summary = summarizeAnnaCompareRows(rows);
  const generatedAt = new Date().toISOString();
  const html = buildHtml({
    generatedAt,
    summary,
    rows,
    fieldsPerHex: WILHELM_COMMENTS_MANUAL_FIELDS.length,
  });

  await mkdir(dirname(WILHELM_DE_COMMENTS_ANNA_COMPARISON_HTML), { recursive: true });
  await writeFile(WILHELM_DE_COMMENTS_ANNA_COMPARISON_HTML, html, "utf8");

  const reportsCopy = join(ROOT, "reports", "wilhelm-de-comments-anna-comparison.html");
  await mkdir(join(reportsCopy, ".."), { recursive: true });
  await writeFile(reportsCopy, html, "utf8");

  console.log(`Wrote ${WILHELM_DE_COMMENTS_ANNA_COMPARISON_HTML}`);
  console.log(`Copy: ${reportsCopy}`);
  console.log(`Rows: ${summary.rowCount} · disputed: ${summary.disputed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
