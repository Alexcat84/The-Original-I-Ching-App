#!/usr/bin/env node
/**
 * Runtime dataset viewer — exactly what @iching-oracle/iching-data serves to iching-engine / Claude.
 * Source: packages/iching-data/src/generated/hexagrams.{wilhelm,legge}.json (post build:data)
 *
 * Output: reports/runtime-dataset-viewer-latest.html
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "reports");
const W_BUNDLE = join(ROOT, "packages/iching-data/src/generated/hexagrams.wilhelm.json");
const L_BUNDLE = join(ROOT, "packages/iching-data/src/generated/hexagrams.legge.json");

const W_SECTIONS = [
  { key: "judgment", label: "1 · Juicio (卦辞) — THE JUDGMENT" },
  { key: "image", label: "2 · Imagen (象傳) — THE IMAGE" },
  { key: "L1", label: "3 · Línea 1" },
  { key: "L2", label: "4 · Línea 2" },
  { key: "L3", label: "5 · Línea 3" },
  { key: "L4", label: "6 · Línea 4" },
  { key: "L5", label: "7 · Línea 5" },
  { key: "L6", label: "8 · Línea 6" },
  { key: "yongJiu", label: "9 · 用九" },
  { key: "yongLiu", label: "9 · 用六" },
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
  { key: "yongJiu", label: "9 · 用九" },
  { key: "yongLiu", label: "9 · 用六" },
];

function loadBundle(path) {
  return JSON.parse(readFileSync(path, "utf8"));
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

/** @param {import('@iching-oracle/iching-data').HexagramRecord} hex */
function fieldsFromRuntimeHex(hex) {
  /** @type {Record<string, string>} */
  const out = {
    judgment: hex.judgment ?? "",
    image: hex.image ?? "",
  };
  for (const line of hex.lines ?? []) {
    out[`L${line.position}`] = line.text ?? "";
  }
  if (hex.yongJiu) out.yongJiu = hex.yongJiu;
  if (hex.yongLiu) out.yongLiu = hex.yongLiu;
  return out;
}

function renderSections(sections, fields, cssClass) {
  const blocks = [];
  for (const sec of sections) {
    const text = fields[sec.key] ?? "";
    if (!text.trim()) continue;
    blocks.push(`
        <article class="text-block ${cssClass}">
          <h4>${esc(sec.label)}</h4>
          <div class="text-body">${formatText(text)}</div>
        </article>`);
  }
  return blocks.join("\n") || '<p class="empty">Sin texto</p>';
}

function buildHexCard(wHex, lHex) {
  const n = wHex.number;
  const wFields = fieldsFromRuntimeHex(wHex);
  const lFields = fieldsFromRuntimeHex(lHex);

  return `
  <section class="hex-card" id="hex-${n}" data-hex="${n}" data-names="${esc(`${wHex.name} ${lHex.name} ${wHex.chineseName}`.toLowerCase())}">
    <header class="hex-head">
      <h2><span class="hex-num">${n}</span> ${esc(wHex.chineseName)} <span class="hex-glyph">${esc(wHex.binaryTopFirst ?? "")}</span></h2>
      <p class="hex-names">Wilhelm: <strong>${esc(wHex.name)}</strong> · Legge: <strong>${esc(lHex.name)}</strong></p>
    </header>
    <div class="hex-columns">
      <div class="translator-col col-wilhelm" data-tr="wilhelm">
        <h3>Wilhelm / Baynes <span class="tag">@iching-oracle/iching-data</span></h3>
        ${renderSections(W_SECTIONS, wFields, "w-block")}
      </div>
      <div class="translator-col col-legge" data-tr="legge">
        <h3>James Legge <span class="tag">@iching-oracle/iching-data</span></h3>
        ${renderSections(L_SECTIONS, lFields, "l-block")}
      </div>
    </div>
  </section>`;
}

function buildHtml(wBundle, lBundle, stamp) {
  const cards = [];
  for (let i = 0; i < 64; i++) {
    cards.push(buildHexCard(wBundle.hexagrams[i], lBundle.hexagrams[i]));
  }

  const hexOptions = wBundle.hexagrams
    .map((h) => `<option value="${h.number}">${h.number} · ${esc(h.name)}</option>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Runtime datasets — Wilhelm + Legge (@iching-oracle/iching-data)</title>
  <style>
    :root { --bg:#0f1419; --surface:#1a2332; --border:#2d3a4d; --text:#e7ecf3; --muted:#8b9cb3; --w:#a78bfa; --l:#34d399; --accent:#fde68a; }
    * { box-sizing:border-box; }
    body { margin:0; font-family:"Segoe UI",system-ui,sans-serif; background:var(--bg); color:var(--text); line-height:1.5; }
    .banner { margin:0; padding:0.5rem 1.25rem; background:#1e3a5f; color:#bfdbfe; font-size:0.82rem; border-bottom:1px solid #2563eb; }
    .toolbar { position:sticky; top:0; z-index:20; background:var(--surface); border-bottom:1px solid var(--border); padding:0.65rem 1.25rem; box-shadow:0 4px 14px rgba(0,0,0,.35); }
    .toolbar h1 { margin:0 0 0.3rem; font-size:1.05rem; }
    .meta { color:var(--muted); font-size:0.76rem; line-height:1.4; }
    .controls { display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center; margin-top:0.45rem; }
    .controls label { font-size:0.82rem; color:var(--muted); }
    input, select, button { background:var(--bg); border:1px solid var(--border); color:var(--text); padding:0.4rem 0.6rem; border-radius:6px; font-size:0.85rem; }
    button { cursor:pointer; }
    button.active { background:#3b82f6; color:#fff; border-color:#3b82f6; }
    main { max-width:1400px; margin:0 auto; padding:1rem 1.25rem 3rem; }
    .hex-card { margin-bottom:2rem; border:1px solid var(--border); border-radius:10px; background:var(--surface); overflow:hidden; }
    .hex-head { padding:0.85rem 1rem; border-bottom:1px solid var(--border); background:#1e2a3d; }
    .hex-head h2 { margin:0; font-size:1.15rem; }
    .hex-num { color:var(--muted); margin-right:0.35rem; }
    .hex-glyph { font-family:monospace; font-size:0.8rem; color:var(--accent); margin-left:0.35rem; }
    .hex-names { margin:0.35rem 0 0; font-size:0.85rem; color:var(--muted); }
    .hex-columns { display:grid; grid-template-columns:1fr 1fr; }
    @media (max-width:960px) { .hex-columns { grid-template-columns:1fr; } }
    .translator-col { padding:0.85rem 1rem; min-width:0; }
    .translator-col + .translator-col { border-left:1px solid var(--border); }
    @media (max-width:960px) { .translator-col + .translator-col { border-left:none; border-top:1px solid var(--border); } }
    .translator-col h3 { margin:0 0 0.75rem; font-size:0.95rem; }
    .col-wilhelm h3 { color:var(--w); }
    .col-legge h3 { color:var(--l); }
    .tag { font-size:0.68rem; font-weight:normal; color:var(--muted); }
    .text-block { margin-bottom:0.85rem; }
    .text-block h4 { margin:0 0 0.35rem; font-size:0.78rem; font-weight:600; text-transform:uppercase; letter-spacing:0.03em; color:var(--muted); }
    .text-body { padding:0.65rem 0.75rem; border-radius:8px; font-family:Cambria,Georgia,serif; font-size:0.88rem; line-height:1.55; background:rgba(0,0,0,.2); border-left:3px solid var(--border); }
    .w-block .text-body { border-left-color:var(--w); }
    .l-block .text-body { border-left-color:var(--l); }
    .empty { color:var(--muted); font-size:0.85rem; }
    .hex-card.hidden, .translator-col.hidden { display:none; }
    .hex-columns.single-col .translator-col { border-left:none; }
  </style>
</head>
<body>
  <p class="banner"><strong>Runtime / producción</strong> — textos que entran a Claude · revisión manual: importa <code>reports/dataset-manual-review-latest.xlsx</code> en Google Sheets (col F = pegar EPUB)</p>
  <div class="toolbar">
    <h1>Visor datasets en producción — Wilhelm + Legge</h1>
    <p class="meta">
      W build: ${esc(wBundle.generatedAt)} · L build: ${esc(lBundle.generatedAt)} ·
      Vista generada ${stamp}<br/>
      W: ${esc(wBundle.edition.slice(0, 120))}…<br/>
      L: ${esc(lBundle.edition.slice(0, 120))}…
    </p>
    <div class="controls">
      <label>Ir a hex</label><select id="jump">${hexOptions}</select>
      <button type="button" id="jumpBtn">Ir</button>
      <label>Buscar</label><input type="search" id="q" placeholder="nombre, texto…" />
      <button type="button" id="showW" class="active">Wilhelm</button>
      <button type="button" id="showL" class="active">Legge</button>
    </div>
  </div>
  <main>${cards.join("\n")}</main>
  <script>
    const q=document.getElementById("q"), jump=document.getElementById("jump");
    const showW=document.getElementById("showW"), showL=document.getElementById("showL");
    let wOn=true,lOn=true;
    function applyView(){
      const term=q.value.trim().toLowerCase();
      document.querySelectorAll(".hex-card").forEach(c=>{
        c.classList.toggle("hidden", term && !c.dataset.names.includes(term) && !c.textContent.toLowerCase().includes(term));
      });
      document.querySelectorAll(".col-wilhelm").forEach(el=>el.classList.toggle("hidden",!wOn));
      document.querySelectorAll(".col-legge").forEach(el=>el.classList.toggle("hidden",!lOn));
      document.querySelectorAll(".hex-columns").forEach(row=>row.classList.toggle("single-col",(wOn&&!lOn)||(!wOn&&lOn)));
    }
    q.addEventListener("input",applyView);
    showW.addEventListener("click",()=>{wOn=!wOn;showW.classList.toggle("active",wOn);applyView();});
    showL.addEventListener("click",()=>{lOn=!lOn;showL.classList.toggle("active",lOn);applyView();});
    document.getElementById("jumpBtn").addEventListener("click",()=>{
      document.getElementById("hex-"+jump.value)?.scrollIntoView({behavior:"smooth",block:"start"});
    });
    applyView();
  </script>
</body>
</html>`;
}

function main() {
  const wBundle = loadBundle(W_BUNDLE);
  const lBundle = loadBundle(L_BUNDLE);
  mkdirSync(OUT, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const html = buildHtml(wBundle, lBundle, stamp);
  const latest = join(OUT, "runtime-dataset-viewer-latest.html");
  const dated = join(OUT, `runtime-dataset-viewer-${stamp}.html`);
  writeFileSync(latest, html, "utf8");
  writeFileSync(dated, html, "utf8");
  console.log(`Latest: ${latest}`);
  console.log(`Dated:  ${dated}`);
  console.log(`Wilhelm bundle: ${W_BUNDLE}`);
  console.log(`Legge bundle:   ${L_BUNDLE}`);
}

main();
