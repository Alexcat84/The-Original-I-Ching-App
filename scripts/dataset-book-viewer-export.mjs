#!/usr/bin/env node
/**
 * Book comparison viewer — Wilhelm + Legge EPUB-primary (production injectors).
 * No diff vs legacy baselines. Structured by hex 1→64, book section order.
 *
 * Output: reports/dataset-book-viewer-latest.html (+ timestamped copy)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "reports");

const W_SECTIONS = [
  { key: "intro", label: "Introducción (comentario Wilhelm, no oráculo)" },
  { key: "judgment", label: "1 · Juicio (卦辞) — THE JUDGMENT" },
  { key: "image", label: "2 · Imagen (象傳) — THE IMAGE" },
  { key: "L1", label: "3 · Línea 1" },
  { key: "L2", label: "4 · Línea 2" },
  { key: "L3", label: "5 · Línea 3" },
  { key: "L4", label: "6 · Línea 4" },
  { key: "L5", label: "7 · Línea 5" },
  { key: "L6", label: "8 · Línea 6" },
  { key: "yong_jiu", label: "9 · 用九" },
  { key: "yong_liu", label: "9 · 用六" },
];

const L_SECTIONS = [
  { key: "judgment", label: "1 · Thwan / Juicio (Rey Wen)" },
  { key: "image", label: "2 · Gran Symbolism (象 — Ap. II §I)" },
  { key: "L1", label: "3 · Línea 1 (Duque de Kâu)" },
  { key: "L2", label: "4 · Línea 2" },
  { key: "L3", label: "5 · Línea 3" },
  { key: "L4", label: "6 · Línea 4" },
  { key: "L5", label: "7 · Línea 5" },
  { key: "L6", label: "8 · Línea 6" },
  { key: "yong", label: "9 · Supernumerary (用九/用六)" },
];

async function loadMjs(rel) {
  return (await import(pathToFileURL(join(ROOT, rel)).href)).default;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatText(text) {
  return esc(text).replace(/\n/g, "<br>");
}

function extractWilhelm(row) {
  /** @type {Record<string, string>} */
  const out = {};
  if (row.wilhelm_symbolic?.trim()) out.intro = row.wilhelm_symbolic.trim();
  out.judgment = row.wilhelm_judgment?.text ?? "";
  out.image = row.wilhelm_image?.text ?? "";
  for (let p = 1; p <= 6; p++) {
    out[`L${p}`] = row.wilhelm_lines?.[String(p)]?.text ?? "";
  }
  if (row.yong_jiu) out.yong_jiu = row.yong_jiu;
  if (row.yong_liu) out.yong_liu = row.yong_liu;
  return out;
}

function extractLegge(row) {
  /** @type {Record<string, string>} */
  const out = {};
  out.judgment = row.legge_judgment?.text ?? "";
  out.image = row.legge_image?.text ?? "";
  for (let p = 1; p <= 6; p++) {
    out[`L${p}`] = row.legge_lines?.[String(p)]?.text ?? "";
  }
  if (row.yong_supernumerary) out.yong = row.yong_supernumerary;
  return out;
}

function renderSections(sections, fields, cssClass) {
  const blocks = [];
  for (const sec of sections) {
    const text = fields[sec.key] ?? "";
    if (!text.trim()) continue;
    const introClass = sec.key === "intro" ? " block-intro" : "";
    blocks.push(`
        <article class="text-block${introClass} ${cssClass}">
          <h4>${esc(sec.label)}</h4>
          <div class="text-body">${formatText(text)}</div>
        </article>`);
  }
  return blocks.join("\n");
}

function buildHexCard(n, wRow, lRow) {
  const wFields = extractWilhelm(wRow);
  const lFields = extractLegge(lRow);
  const wName = wRow.english ?? wRow.trad_chinese ?? "";
  const lName = lRow.name ?? "";
  const glyph = wRow.hex_font ?? lRow.hex_font ?? "";
  const trad = wRow.trad_chinese ?? "";

  return `
  <section class="hex-card" id="hex-${n}" data-hex="${n}" data-names="${esc(`${wName} ${lName} ${trad}`.toLowerCase())}">
    <header class="hex-head">
      <h2><span class="hex-num">${n}</span> ${glyph} <span class="hex-trad">${esc(trad)}</span></h2>
      <p class="hex-names">Wilhelm: <strong>${esc(wName)}</strong> · Legge: <strong>${esc(lName)}</strong></p>
    </header>
    <div class="hex-columns">
      <div class="translator-col col-wilhelm" data-tr="wilhelm">
        <h3>Wilhelm / Baynes <span class="tag">EPUB-primary · producción</span></h3>
        ${renderSections(W_SECTIONS, wFields, "w-block") || '<p class="empty">Sin texto</p>'}
      </div>
      <div class="translator-col col-legge" data-tr="legge">
        <h3>James Legge <span class="tag">EPUB-primary · producción</span></h3>
        ${renderSections(L_SECTIONS, lFields, "l-block") || '<p class="empty">Sin texto</p>'}
      </div>
    </div>
  </section>`;
}

function buildHtml(wData, lData, stamp) {
  const cards = [];
  for (let n = 1; n <= 64; n++) {
    const key = String(n);
    cards.push(buildHexCard(n, wData[key], lData[key]));
  }

  const hexOptions = Array.from({ length: 64 }, (_, i) => {
    const n = i + 1;
    const w = wData[String(n)];
    return `<option value="${n}">${n} · ${esc(w?.english ?? w?.trad_chinese ?? "")}</option>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>I Ching — visor libro (Wilhelm + Legge EPUB-primary)</title>
  <style>
    :root {
      --bg: #0f1419;
      --surface: #1a2332;
      --border: #2d3a4d;
      --text: #e7ecf3;
      --muted: #8b9cb3;
      --w: #a78bfa;
      --l: #34d399;
      --intro-bg: #252018;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Segoe UI", system-ui, sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; }
    .toolbar {
      position: sticky; top: 0; z-index: 20;
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 0.65rem 1.25rem; box-shadow: 0 4px 14px rgba(0,0,0,.35);
    }
    .toolbar h1 { margin: 0 0 0.35rem; font-size: 1.05rem; font-weight: 600; }
    .toolbar .sub { color: var(--muted); font-size: 0.78rem; }
    .controls { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-top: 0.45rem; }
    .controls label { font-size: 0.82rem; color: var(--muted); }
    input, select, button {
      background: var(--bg); border: 1px solid var(--border); color: var(--text);
      padding: 0.4rem 0.6rem; border-radius: 6px; font-size: 0.85rem;
    }
    button { cursor: pointer; }
    button.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
    main { max-width: 1400px; margin: 0 auto; padding: 1rem 1.25rem 3rem; }
    .hex-card {
      margin-bottom: 2rem; border: 1px solid var(--border); border-radius: 10px;
      background: var(--surface); overflow: hidden;
    }
    .hex-head {
      padding: 0.85rem 1rem; border-bottom: 1px solid var(--border);
      background: #1e2a3d;
    }
    .hex-head h2 { margin: 0; font-size: 1.15rem; }
    .hex-num { color: var(--muted); font-variant-numeric: tabular-nums; margin-right: 0.35rem; }
    .hex-trad { font-family: "Segoe UI", serif; }
    .hex-names { margin: 0.35rem 0 0; font-size: 0.85rem; color: var(--muted); }
    .hex-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
    @media (max-width: 960px) { .hex-columns { grid-template-columns: 1fr; } }
    .translator-col { padding: 0.85rem 1rem; min-width: 0; }
    .translator-col + .translator-col { border-left: 1px solid var(--border); }
    @media (max-width: 960px) {
      .translator-col + .translator-col { border-left: none; border-top: 1px solid var(--border); }
    }
    .translator-col h3 { margin: 0 0 0.75rem; font-size: 0.95rem; }
    .col-wilhelm h3 { color: var(--w); }
    .col-legge h3 { color: var(--l); }
    .tag { font-size: 0.68rem; font-weight: normal; color: var(--muted); margin-left: 0.35rem; }
    .text-block { margin-bottom: 0.85rem; }
    .text-block h4 {
      margin: 0 0 0.35rem; font-size: 0.78rem; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.03em; color: var(--muted);
    }
    .text-body {
      padding: 0.65rem 0.75rem; border-radius: 8px;
      font-family: Cambria, Georgia, serif; font-size: 0.88rem; line-height: 1.55;
      background: rgba(0,0,0,.2); border-left: 3px solid var(--border);
    }
    .w-block .text-body { border-left-color: var(--w); }
    .l-block .text-body { border-left-color: var(--l); }
    .block-intro .text-body { background: var(--intro-bg); border-left-color: #b45309; }
    .block-intro h4 { color: #fbbf24; }
    .empty { color: var(--muted); font-size: 0.85rem; }
    .hex-card.hidden { display: none; }
    .translator-col.hidden { display: none; }
    .hex-columns.single-col .translator-col { border-left: none; }
  </style>
</head>
<body>
  <div class="toolbar">
    <h1>Visor para comparar con el libro — Wilhelm + Legge (EPUB-primary, producción)</h1>
    <p class="sub">Generado ${stamp} · Orden del libro: juicio → imagen → líneas 1–6 → yong · Sin baseline Parma/sacred-texts</p>
    <div class="controls">
      <label>Ir a hex</label>
      <select id="jump">${hexOptions}</select>
      <button type="button" id="jumpBtn">Ir</button>
      <label>Buscar</label>
      <input type="search" id="q" placeholder="nombre, texto…" />
      <button type="button" id="showW" class="active">Wilhelm</button>
      <button type="button" id="showL" class="active">Legge</button>
    </div>
  </div>
  <main>${cards.join("\n")}</main>
  <script>
    const q = document.getElementById("q");
    const jump = document.getElementById("jump");
    const showW = document.getElementById("showW");
    const showL = document.getElementById("showL");
    let wOn = true, lOn = true;

    function applyView() {
      const term = q.value.trim().toLowerCase();
      document.querySelectorAll(".hex-card").forEach((card) => {
        const okQ = !term || card.dataset.names.includes(term) || card.textContent.toLowerCase().includes(term);
        card.classList.toggle("hidden", !okQ);
      });
      document.querySelectorAll(".col-wilhelm").forEach((el) => el.classList.toggle("hidden", !wOn));
      document.querySelectorAll(".col-legge").forEach((el) => el.classList.toggle("hidden", !lOn));
      document.querySelectorAll(".hex-columns").forEach((row) => {
        row.classList.toggle("single-col", (wOn && !lOn) || (!wOn && lOn));
      });
    }
    q.addEventListener("input", applyView);
    showW.addEventListener("click", () => { wOn = !wOn; showW.classList.toggle("active", wOn); applyView(); });
    showL.addEventListener("click", () => { lOn = !lOn; showL.classList.toggle("active", lOn); applyView(); });
    document.getElementById("jumpBtn").addEventListener("click", () => {
      const el = document.getElementById("hex-" + jump.value);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    applyView();
  </script>
</body>
</html>`;
}

async function main() {
  const wData = await loadMjs("scripts/iching_wilhelm_translation.mjs");
  const lData = await loadMjs("scripts/iching_legge_translation.mjs");
  mkdirSync(OUT, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const html = buildHtml(wData, lData, stamp);
  const latest = join(OUT, "dataset-book-viewer-latest.html");
  const dated = join(OUT, `dataset-book-viewer-${stamp}.html`);
  writeFileSync(latest, html, "utf8");
  writeFileSync(dated, html, "utf8");
  console.log(`Latest: ${latest}`);
  console.log(`Dated:  ${dated}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
