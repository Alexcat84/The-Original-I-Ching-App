#!/usr/bin/env node
/**
 * One-shot: full Ten Wings review export from merged comments (64 hex).
 * Output: reports/wilhelm-de-ten-wings-full-review-{stamp}.json + .html
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const LINE_FIELDS = [];
for (let i = 1; i <= 6; i++) {
  LINE_FIELDS.push(`L${i}_etiqueta`, `L${i}_a_oraculo`, `L${i}_b_comentario`);
}

/** @param {Record<string, string>} f @param {number} hex */
function wingSections(f, hex) {
  /** @type {Array<{ wing: string; marker: string; fields: Record<string, string> }>} */
  const sections = [];
  sections.push({
    wing: "Kernzeichen",
    marker: "Kernzeichen (nota técnica)",
    fields: { ruler_note: f.ruler_note ?? "" },
  });
  if (hex >= 3) {
    sections.push({
      wing: "Ala 9",
      marker: "Die Reihenfolge",
      fields: { sequence: f.sequence ?? "" },
    });
  }
  sections.push({
    wing: "Ala 10",
    marker: "Vermischte Zeichen",
    fields: { misc_notes: f.misc_notes ?? "" },
  });
  sections.push({
    wing: "Alas 1-2",
    marker: "Kommentar zur Entscheidung (Tuan)",
    fields: { commentary_decision: f.commentary_decision ?? "" },
  });
  sections.push({
    wing: "Alas 3-4",
    marker: "Das Bild + Kommentar zu den Bildern",
    fields: {
      image_oraculo: f.image_oraculo ?? "",
      commentary_image: f.commentary_image ?? "",
    },
  });
  /** @type {Record<string, string>} */
  const lines = {};
  for (const k of LINE_FIELDS) lines[k] = f[k] ?? "";
  sections.push({
    wing: "Alas 5-10 (líneas)",
    marker: "Die einzelnen Linien",
    fields: lines,
  });
  if (hex <= 2) {
    sections.push({
      wing: "Ala 7",
      marker: "Wen Yen (Kommentar zu den Textworten)",
      fields: {
        wen_yen: f.wen_yen ?? "",
        wen_yen_note: f.wen_yen_note ?? "",
      },
    });
    sections.push({
      wing: "Yong",
      marker: "Alle Striche Neunen/Sechsen",
      fields: {
        yong_etiqueta: f.yong_etiqueta ?? "",
        yong_a_oraculo: f.yong_a_oraculo ?? "",
        yong_b_comentario: f.yong_b_comentario ?? "",
      },
    });
  }
  return sections;
}

/** @param {string} s */
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function main() {
  const merged = JSON.parse(
    await readFile(
      join(ROOT, "tools/datasets/wilhelm-de/comments/wilhelm-de-64hex-comments-merged.json"),
      "utf8",
    ),
  );
  const starts = JSON.parse(
    await readFile(join(ROOT, "tools/datasets/wilhelm-de/wilhelm-de-comments-hex-starts.json"), "utf8"),
  );
  const startByHex = Object.fromEntries(starts.starts.map((s) => [s.hex, s]));

  /** @type {Array<object>} */
  const hexagrams = [];
  for (let hex = 1; hex <= 64; hex++) {
    const meta = startByHex[hex];
    const fields = merged.hexagrams[String(hex)]?.fields ?? {};
    const filled = Object.entries(fields).filter(
      ([k, v]) => k !== "hex" && String(v ?? "").trim(),
    ).length;
    hexagrams.push({
      hex,
      nombre: fields.nombre ?? meta?.title ?? "",
      chinese: fields.chinese ?? "",
      chinese_roman: fields.chinese_roman ?? "",
      jpgPages: meta ? `${meta.bookPage}-${meta.endBookPage}` : "",
      fieldsFilled: filled,
      tenWings: wingSections(fields, hex),
      allFields: fields,
    });
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonPath = join(ROOT, "reports", `wilhelm-de-ten-wings-full-review-${stamp}.json`);
  const htmlPath = join(ROOT, "reports", `wilhelm-de-ten-wings-full-review-${stamp}.html`);

  const payload = {
    generatedAt: new Date().toISOString(),
    hexCount: 64,
    wingFieldMap: starts.wingFieldMap,
    hexagrams,
  };

  await mkdir(join(ROOT, "reports"), { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  let body = "";
  for (const h of hexagrams) {
    body += `<article class="hex" id="hex-${h.hex}"><h2>${h.hex}. ${esc(h.nombre)} (${esc(h.chinese)})</h2>`;
    body += `<p class="meta">JPG pp. ${esc(h.jpgPages)} · campos con texto: ${h.fieldsFilled}/37</p>`;
    for (const sec of h.tenWings) {
      body += `<section><h3>${esc(sec.wing)}: ${esc(sec.marker)}</h3>`;
      for (const [k, v] of Object.entries(sec.fields)) {
        if (!String(v).trim()) continue;
        body += `<div class="field"><h4>${esc(k)}</h4><pre>${esc(v)}</pre></div>`;
      }
      body += "</section>";
    }
    body += "</article>";
  }

  const nav = hexagrams.map((h) => `<a href="#hex-${h.hex}">${h.hex}</a>`).join("");
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8"/>
<title>Wilhelm DE Ten Wings — revisión completa</title>
<style>
body{font-family:Georgia,serif;max-width:920px;margin:2rem auto;padding:0 1rem;line-height:1.45}
h2{border-top:2px solid #333;padding-top:1.5rem}
pre{white-space:pre-wrap;background:#f6f6f6;padding:.75rem;font-size:.92rem}
.meta{color:#555;font-size:.9rem}
.field{margin-bottom:1rem}
nav{position:sticky;top:0;background:#fff;border-bottom:1px solid #ccc;padding:.5rem 0;flex-wrap:wrap;display:flex;gap:.35rem}
nav a{font-size:.85rem}
</style>
</head>
<body>
<h1>Wilhelm DE 1924 — Drittes Buch / Diez Alas (64 hex)</h1>
<p>Fuente: wilhelm-de-64hex-comments-merged.json · ${payload.generatedAt}</p>
<nav>${nav}</nav>
${body}
</body>
</html>`;

  await writeFile(htmlPath, html, "utf8");
  console.log(`JSON: ${jsonPath}`);
  console.log(`HTML: ${htmlPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
