#!/usr/bin/env node

/**
 * QA code: AU-FID-W-013 audit-wilhelm-de-contamination · v1.0.0
 * Area: scripts/audit-wilhelm-de-contamination.mjs
 * Family: FID-W
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildWilhelmBaynesDeRows, summarizeWilhelmBaynesDeRows } from "./lib/wilhelm-baynes-de-field-map.mjs";
import {
  auditWilhelmDeContamination,
  summarizeContamination,
} from "./lib/wilhelm-de-contamination-audit.mjs";
import {
  WILHELM_DE_BOOK_ONE_ZENO_EXTRACT,
  WILHELM_DE_PRIMARY_SOURCE,
} from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function parseArgs(argv) {
  /** @type {{ deMaestro: string; hex?: number; html: boolean }} */
  const out = { deMaestro: WILHELM_DE_BOOK_ONE_ZENO_EXTRACT, html: true };
  for (const arg of argv) {
    if (arg.startsWith("--de-maestro=")) out.deMaestro = arg.slice(13);
    if (arg.startsWith("--hex=")) out.hex = Number(arg.slice(6));
    if (arg === "--no-html") out.html = false;
  }
  return out;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function severityClass(severity) {
  if (severity === "error") return "sev-error";
  if (severity === "warn") return "sev-warn";
  if (severity === "info") return "sev-info";
  return "sev-ok";
}

/**
 * @param {object} params
 */
function buildHtml({ generatedAt, summary, rows, primarySource }) {
  const payload = JSON.stringify({ summary, rows });
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Wilhelm DE — auditoría contaminación línea a línea</title>
  <style>
    :root { --border:#ccc; --muted:#666; --err:#cf222e; --warn:#9a6700; --info:#0969da; --ok:#1a7f37; }
    @media (prefers-color-scheme: dark) {
      :root { --border:#444; --muted:#aaa; --err:#f85149; --warn:#d29922; --info:#58a6ff; --ok:#3fb950; }
      body { background:#0d1117; color:#e6edf3; }
    }
    body { font-family: system-ui, sans-serif; margin: 1rem; line-height: 1.4; }
    .meta { color: var(--muted); max-width: 80rem; }
    .stats { display:flex; flex-wrap:wrap; gap:0.5rem; margin:1rem 0; }
    .stat { border:1px solid var(--border); border-radius:8px; padding:0.4rem 0.7rem; }
    .controls { display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:1rem; position:sticky; top:0; background:Canvas; padding:0.5rem 0; }
    table { width:100%; border-collapse:collapse; margin-bottom:1.5rem; }
    th, td { border:1px solid var(--border); vertical-align:top; padding:0.35rem; font-size:0.82rem; }
    pre { margin:0; white-space:pre-wrap; font-family:Consolas,monospace; font-size:0.76rem; }
    .level-contaminated { color: var(--err); font-weight:700; }
    .level-review { color: var(--warn); font-weight:700; }
    .level-de_book_extra { color: var(--info); }
    .level-clean { color: var(--ok); }
    .sev-error { background: color-mix(in srgb, var(--err) 15%, transparent); }
    .sev-warn { background: color-mix(in srgb, var(--warn) 15%, transparent); }
    .sev-info { background: color-mix(in srgb, var(--info) 12%, transparent); }
    .tag { font-size:0.68rem; color:var(--muted); }
    .card { border:1px solid var(--border); border-radius:8px; padding:0.75rem; margin-bottom:1rem; }
    .card h3 { margin:0 0 0.5rem; font-size:0.95rem; }
  </style>
</head>
<body>
  <h1>Contaminación DE vs Baynes — línea a línea</h1>
  <p class="meta">Fuente: ${escapeHtml(primarySource?.citation ?? "")}. Busca comentario en oráculo, footers, Bemerkung fuera de lugar. Generado ${escapeHtml(generatedAt)}.</p>
  <div class="stats" id="stats"></div>
  <div class="controls">
    <label>Nivel<select id="levelFilter"><option value="">Todos</option><option value="contaminated">contaminated</option><option value="review">review</option><option value="de_book_extra">de_book_extra</option><option value="clean">clean</option></select></label>
    <label>Hex<input type="number" id="hexFilter" min="1" max="64" placeholder="1–64" /></label>
    <label>Buscar<input type="search" id="q" placeholder="texto DE…" /></label>
  </div>
  <div id="host"></div>
  <script type="application/json" id="payload">${payload}</script>
  <script>
    const { summary, rows } = JSON.parse(document.getElementById("payload").textContent);
    document.getElementById("stats").innerHTML = Object.entries(summary.byLevel||{}).map(([k,v])=>'<div class="stat"><span>'+k+'</span><strong>'+v+'</strong></div>').join("");
    function render() {
      const level = document.getElementById("levelFilter").value;
      const hex = document.getElementById("hexFilter").value;
      const q = document.getElementById("q").value.trim().toLowerCase();
      let list = rows.filter(r => {
        if (level && r.audit.level !== level) return false;
        if (hex && String(r.hex) !== hex) return false;
        if (q && !r.de.toLowerCase().includes(q)) return false;
        return r.audit.level !== "clean" && r.audit.level !== "empty";
      });
      list.sort((a,b) => (a.audit.level === "contaminated" ? 0 : 1) - (b.audit.level === "contaminated" ? 0 : 1) || a.hex - b.hex);
      const host = document.getElementById("host");
      if (!list.length) { host.innerHTML = "<p>Sin hallazgos con filtros actuales.</p>"; return; }
      host.innerHTML = list.map(r => {
        const deRows = (r.audit.deLines||[]).map(l =>
          '<tr class="'+l.severity+'"><td>'+l.lineNo+'</td><td><span class="tag">'+l.tag+'</span> '+escapeHtml(l.text)+'</td></tr>'
        ).join("");
        const enRows = (r.audit.enLines||[]).map(l =>
          '<tr><td>'+l.lineNo+'</td><td>'+escapeHtml(l.text)+'</td></tr>'
        ).join("");
        return '<div class="card"><h3>#'+r.hex+' · '+r.field+' · <span class="level-'+r.audit.level+'">'+r.audit.level+'</span></h3>'+
          (r.audit.notes||[]).map(n=>'<p class="meta">'+escapeHtml(n)+'</p>').join("")+
          '<table><tr><th colspan="2">DE ('+r.audit.deLineCount+' líneas)</th><th colspan="2">Baynes EN ('+r.audit.enLineCount+' líneas)</th></tr>'+
          '<tr><th>#</th><th>Texto DE + tag</th><th>#</th><th>Texto EN</th></tr>'+
          deRows + enRows.replace(/<tr>/g,'<tr class="en">') +
          '</table></div>';
      }).join("");
    }
    function escapeHtml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
    ["levelFilter","hexFilter","q"].forEach(id=>document.getElementById(id).addEventListener("input", render));
    render();
  </script>
</body>
</html>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let rows = await buildWilhelmBaynesDeRows({ hex: args.hex, deMaestroPath: args.deMaestro });

  for (const row of rows) {
    row.audit = auditWilhelmDeContamination({
      hex: row.hex,
      field: row.field,
      de: row.de,
      en: row.en,
      classification: row.classification,
    });
  }

  const structural = summarizeWilhelmBaynesDeRows(rows);
  const contamination = summarizeContamination(rows);
  const generatedAt = new Date().toISOString();
  const ts = generatedAt.replace(/[:.]/g, "-");
  const outDir = join(ROOT, "reports");
  await mkdir(outDir, { recursive: true });

  const flagged = rows.filter(
    (r) => r.audit.level === "contaminated" || r.audit.level === "review",
  );

  const exportRows = rows.map((r) => ({
    hex: r.hex,
    field: r.field,
    blockId: r.blockId,
    classification: r.classification,
    level: r.audit.level,
    deLineCount: r.audit.deLineCount,
    enLineCount: r.audit.enLineCount,
    errorCount: r.audit.errorCount,
    flags: r.audit.flags,
    notes: r.audit.notes,
    de: r.de,
    en: r.en,
    audit: r.audit,
  }));

  const jsonPath = join(outDir, `wilhelm-de-contamination-${ts}.json`);
  const tsvPath = join(outDir, `wilhelm-de-contamination-${ts}.tsv`);

  await writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        generatedAt,
        primarySource: WILHELM_DE_PRIMARY_SOURCE,
        deMaestro: args.deMaestro,
        structural,
        contamination,
        flaggedCount: flagged.length,
        flagged: flagged.map((r) => ({
          hex: r.hex,
          field: r.field,
          level: r.audit.level,
          notes: r.audit.notes,
          flags: r.audit.flags,
          dePreview: r.de.slice(0, 200),
        })),
        rows: exportRows,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const tsvHeader = ["hex", "field", "level", "de_lines", "en_lines", "errors", "notes", "de_first_line"].join("\t");
  const tsvBody = exportRows
    .filter((r) => r.level !== "clean" && r.level !== "empty")
    .map((r) =>
      [
        r.hex,
        r.field,
        r.level,
        r.deLineCount,
        r.enLineCount,
        r.errorCount,
        (r.notes ?? []).join(" | "),
        (r.audit.deLines?.[0]?.text ?? "").replace(/\t/g, " "),
      ].join("\t"),
    )
    .join("\n");
  await writeFile(tsvPath, `${tsvHeader}\n${tsvBody}\n`, "utf8");

  if (args.html) {
    const htmlPath = join(outDir, `wilhelm-de-contamination-viewer-${ts}.html`);
    await writeFile(
      htmlPath,
      buildHtml({ generatedAt, summary: contamination, rows: exportRows, primarySource: WILHELM_DE_PRIMARY_SOURCE }),
      "utf8",
    );
    console.log(`HTML: ${htmlPath}`);
  }

  console.log(`Structural: ${structural.pair} pairs, ${structural.en_only} en_only`);
  console.log(`Contamination levels:`, contamination.byLevel);
  console.log(`Flagged (review+contaminated): ${flagged.length}`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`TSV: ${tsvPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
