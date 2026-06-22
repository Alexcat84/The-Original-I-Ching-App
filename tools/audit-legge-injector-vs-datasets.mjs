#!/usr/bin/env node
/**
 * Audit Legge PDF injector completeness vs current bundle and EPUB baseline.
 * Usage: node tools/audit-legge-injector-vs-datasets.mjs
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseAllLeggeSbePdfOrThrow } from "../scripts/lib/hexagram-fidelity-legge-sbe-pdf.mjs";
import { parseAllLeggeEpubOrThrow } from "../scripts/lib/hexagram-fidelity-legge-epub.mjs";
import {
  fieldLooksCorrupt,
  fieldLooksTruncated,
} from "../scripts/lib/hexagram-fidelity-legge-sbe-epub-guide.mjs";
import {
  normalizeHexText,
  textsMatch,
  similarityHint,
} from "../scripts/lib/hexagram-fidelity-normalize.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const leggeModulePath = join(root, "scripts", "iching_legge_translation.mjs");

const FIELD_LABELS = {
  judgment: "juicio",
  image: "imagen",
  yongJiu: "yongJiu",
  yongLiu: "yongLiu",
};

function fieldStatus(text) {
  const t = String(text ?? "").trim();
  if (!t) return "empty";
  if (fieldLooksCorrupt(t)) return "corrupt";
  if (fieldLooksTruncated(t)) return "truncated";
  return "ok";
}

function simulateSync(pdfRow, prevRow) {
  const pick = (pdfVal, prevVal) => {
    const pdf = String(pdfVal ?? "").trim();
    const prev = String(prevVal ?? "").trim();
    const pdfOk = fieldStatus(pdf) === "ok";
    const prevOk = fieldStatus(prev) === "ok";
    if (pdfOk) return { text: pdf, source: "pdf" };
    if (prevOk) return { text: prev, source: "bundle_fallback" };
    return { text: pdf || prev, source: pdf ? "pdf_unusable" : prev ? "bundle_unusable" : "empty" };
  };

  const lines = {};
  const lineSources = {};
  for (let p = 1; p <= 6; p++) {
    const r = pick(pdfRow.lines?.[p], prevRow.legge_lines?.[String(p)]?.text);
    lines[p] = r.text;
    lineSources[p] = r.source;
  }

  const judgment = pick(pdfRow.judgment, prevRow.legge_judgment?.text);
  const image = pick(pdfRow.image, prevRow.legge_image?.text);
  const yongPdf = pdfRow.yongJiu ?? pdfRow.yongLiu;
  const yongPrev = prevRow.yong_supernumerary;
  const yong = pick(yongPdf, yongPrev);

  return {
    judgment: judgment.text,
    image: image.text,
    lines,
    yongJiu: pdfRow.yongJiu !== undefined ? yong.text : undefined,
    yongLiu: pdfRow.yongLiu !== undefined ? yong.text : undefined,
    sources: {
      judgment: judgment.source,
      image: image.source,
      lines: lineSources,
      yong: yong.source,
    },
  };
}

function bundleRowToFields(row, n) {
  return {
    judgment: row.legge_judgment?.text ?? "",
    image: row.legge_image?.text ?? "",
    lines: Object.fromEntries(
      [1, 2, 3, 4, 5, 6].map((p) => [p, row.legge_lines?.[String(p)]?.text ?? ""]),
    ),
    yongJiu: n === 1 ? row.yong_supernumerary ?? "" : "",
    yongLiu: n === 2 ? row.yong_supernumerary ?? "" : "",
  };
}

function epubRowToFields(row, n) {
  return {
    judgment: row.judgment ?? "",
    image: row.image ?? "",
    lines: row.lines ?? {},
    yongJiu: n === 1 ? row.yongJiu ?? "" : "",
    yongLiu: n === 2 ? row.yongLiu ?? "" : "",
  };
}

function classifyImportance(field, hint, expected, actual) {
  const e = normalizeHexText(expected, "legge");
  const a = normalizeHexText(actual, "legge");
  if (hint === "exact" || textsMatch(expected, actual, "legge")) return "none";

  // Label-only: line vs six
  const labelOnly =
    field.startsWith("line") &&
    e.replace(/\bline\b/g, "X").replace(/\bsix\b/g, "X") ===
      a.replace(/\bline\b/g, "X").replace(/\bsix\b/g, "X");
  if (labelOnly) return "book_primary_label";

  // Spelling Kien/Khien
  if (
    e.replace(/\bkhien\b/g, "kien") === a.replace(/\bkhien\b/g, "kien") &&
    e !== a
  ) {
    return "book_primary_spelling";
  }

  // yong nine vs line
  if (field === "yongJiu" && /number (nine|line)/i.test(expected + actual)) {
    return "book_primary_yong";
  }

  // Punctuation / OCR noise only
  const stripNoise = (s) =>
    s.replace(/[^a-z0-9]/g, "").slice(0, Math.min(e.length, a.length, 80));
  if (stripNoise(e) === stripNoise(a) && Math.abs(e.length - a.length) < 15) {
    return "minor_punct_ocr";
  }

  if (hint.includes("truncated") || hint.includes("commentary_bleed")) {
    return "high_structural";
  }

  if (Math.abs(e.length - a.length) > 40) return "high_content";
  return "moderate";
}

function snippet(text, len = 72) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= len) return t;
  return `${t.slice(0, len)}…`;
}

async function main() {
  const legge = (await import(pathToFileURL(leggeModulePath).href)).default;
  const pdfGold = await parseAllLeggeSbePdfOrThrow({ force: false, epubGuide: true });
  const epubGold = await parseAllLeggeEpubOrThrow();

  const completeness = [];
  const injectorVsBundle = [];
  const bundleVsEpub = [];
  const pdfRawIssues = [];

  for (let n = 1; n <= 64; n++) {
    const pdf = pdfGold[n];
    const prev = legge[String(n)] ?? {};
    const injected = simulateSync(pdf, prev);
    const bundle = bundleRowToFields(prev, n);
    const epub = epubRowToFields(epubGold[n], n);

    for (const [field, label] of [
      ["judgment", "juicio"],
      ["image", "imagen"],
    ]) {
      const st = fieldStatus(pdf[field]);
      completeness.push({ hex: n, field: label, status: st, len: String(pdf[field] ?? "").length });
      if (st !== "ok") {
        pdfRawIssues.push({ hex: n, field: label, status: st, text: snippet(pdf[field], 90) });
      }
    }
    for (let p = 1; p <= 6; p++) {
      const st = fieldStatus(pdf.lines?.[p]);
      completeness.push({ hex: n, field: `L${p}`, status: st, len: String(pdf.lines?.[p] ?? "").length });
      if (st !== "ok") {
        pdfRawIssues.push({ hex: n, field: `L${p}`, status: st, text: snippet(pdf.lines?.[p], 90) });
      }
    }
    if (n === 1) {
      const st = fieldStatus(pdf.yongJiu);
      completeness.push({ hex: n, field: "yongJiu", status: st, len: String(pdf.yongJiu ?? "").length });
      if (st !== "ok") pdfRawIssues.push({ hex: n, field: "yongJiu", status: st, text: snippet(pdf.yongJiu, 90) });
    }
    if (n === 2) {
      const st = fieldStatus(pdf.yongLiu);
      completeness.push({ hex: n, field: "yongLiu", status: st, len: String(pdf.yongLiu ?? "").length });
      if (st !== "ok") pdfRawIssues.push({ hex: n, field: "yongLiu", status: st, text: snippet(pdf.yongLiu, 90) });
    }

    // Injector (simulated sync) vs current bundle
    for (const [field, label] of [
      ["judgment", "juicio"],
      ["image", "imagen"],
    ]) {
      const exp = injected[field];
      const act = bundle[field];
      if (!textsMatch(exp, act, "legge")) {
        const hint = similarityHint(exp, act, "legge");
        injectorVsBundle.push({
          hex: n,
          field: label,
          importance: classifyImportance(label, hint, exp, act),
          hint,
          injector: snippet(exp),
          bundle: snippet(act),
          source: injected.sources[field],
        });
      }
    }
    for (let p = 1; p <= 6; p++) {
      const exp = injected.lines[p];
      const act = bundle.lines[p];
      if (!textsMatch(exp, act, "legge")) {
        const hint = similarityHint(exp, act, "legge");
        injectorVsBundle.push({
          hex: n,
          field: `L${p}`,
          importance: classifyImportance(`line${p}`, hint, exp, act),
          hint,
          injector: snippet(exp),
          bundle: snippet(act),
          source: injected.sources.lines[p],
        });
      }
    }
    if (n === 1 && injected.yongJiu !== undefined) {
      const exp = injected.yongJiu;
      const act = bundle.yongJiu;
      if (!textsMatch(exp, act, "legge")) {
        injectorVsBundle.push({
          hex: n,
          field: "yongJiu",
          importance: classifyImportance("yongJiu", similarityHint(exp, act, "legge"), exp, act),
          hint: similarityHint(exp, act, "legge"),
          injector: snippet(exp),
          bundle: snippet(act),
          source: injected.sources.yong,
        });
      }
    }

    // Bundle (current) vs EPUB baseline (previous canonical source)
    for (const [field, label] of [
      ["judgment", "juicio"],
      ["image", "imagen"],
    ]) {
      const exp = epub[field];
      const act = bundle[field];
      if (!textsMatch(exp, act, "legge")) {
        const hint = similarityHint(exp, act, "legge");
        bundleVsEpub.push({
          hex: n,
          field: label,
          importance: classifyImportance(label, hint, exp, act),
          hint,
          epub: snippet(exp),
          bundle: snippet(act),
        });
      }
    }
    for (let p = 1; p <= 6; p++) {
      const exp = epub.lines[p];
      const act = bundle.lines[p];
      if (!textsMatch(exp, act, "legge")) {
        const hint = similarityHint(exp, act, "legge");
        bundleVsEpub.push({
          hex: n,
          field: `L${p}`,
          importance: classifyImportance(`line${p}`, hint, exp, act),
          hint,
          epub: snippet(exp),
          bundle: snippet(act),
        });
      }
    }
    if (n === 1) {
      const exp = epub.yongJiu;
      const act = bundle.yongJiu;
      if (!textsMatch(exp, act, "legge")) {
        bundleVsEpub.push({
          hex: n,
          field: "yongJiu",
          importance: classifyImportance("yongJiu", similarityHint(exp, act, "legge"), exp, act),
          hint: similarityHint(exp, act, "legge"),
          epub: snippet(exp),
          bundle: snippet(act),
        });
      }
    }
  }

  const totalFields = completeness.length;
  const okFields = completeness.filter((c) => c.status === "ok").length;
  const fallbacks = [];
  for (let n = 1; n <= 64; n++) {
    const injected = simulateSync(pdfGold[n], legge[String(n)] ?? {});
    for (const [k, v] of Object.entries(injected.sources)) {
      if (k === "lines") {
        for (const [p, s] of Object.entries(v)) {
          if (s === "bundle_fallback") fallbacks.push({ hex: n, field: `L${p}` });
        }
      } else if (v === "bundle_fallback") {
        fallbacks.push({ hex: n, field: k });
      }
    }
  }

  console.log("=== COMPLETITUD INJECTOR (PDF gold raw, post EPUB repair) ===");
  console.log(`Campos OK: ${okFields}/${totalFields} (${((okFields / totalFields) * 100).toFixed(1)}%)`);
  console.log(`Corrupt/truncated/empty: ${totalFields - okFields}`);
  if (pdfRawIssues.length) {
    console.log("\nPDF gold aún roto (primeros 25):");
    for (const r of pdfRawIssues.slice(0, 25)) {
      console.log(`  h${String(r.hex).padStart(2, "0")} ${r.field} [${r.status}]: ${r.text}`);
    }
  }

  console.log("\n=== FALLBACKS sync (bundle previo conservado) ===");
  console.log(fallbacks.length ? fallbacks : "Ninguno");

  console.log("\n=== INJECTOR (sim sync) vs BUNDLE ACTUAL ===");
  console.log(`Diffs: ${injectorVsBundle.length} (debería ser 0)`);
  if (injectorVsBundle.length) {
    for (const d of injectorVsBundle) console.log(`  h${d.hex} ${d.field}: ${d.hint}`);
  }

  console.log("\n=== BUNDLE ACTUAL vs EPUB (fuente previa) ===");
  const important = bundleVsEpub.filter((d) => d.importance !== "none" && d.importance !== "minor_punct_ocr");
  const byImportance = (arr) => {
    const order = ["book_primary_label", "book_primary_spelling", "book_primary_yong", "moderate", "high_content", "high_structural"];
    return [...arr].sort((a, b) => order.indexOf(a.importance) - order.indexOf(b.importance) || a.hex - b.hex);
  };

  console.log(`Total diffs: ${bundleVsEpub.length}`);
  console.log(`Importantes (excl. puntuación menor): ${important.length}`);

  console.log("\n--- TABLA: diferencias IMPORTANTES bundle vs EPUB ---");
  console.log("| Hex | Campo | Clase | EPUB (previo) | Bundle (actual/scan) |");
  console.log("|-----|-------|-------|---------------|----------------------|");
  for (const d of byImportance(important)) {
    const prev = d.epub ?? d.epub;
    const cur = d.bundle ?? d.bundle;
    console.log(`| ${d.hex} | ${d.field} | ${d.importance} | ${prev.replace(/\|/g, "\\|")} | ${cur.replace(/\|/g, "\\|")} |`);
  }

  // Also: pure PDF injector output vs EPUB (what would change on re-inject without fallback)
  const pdfVsEpub = [];
  for (let n = 1; n <= 64; n++) {
    const pdf = pdfGold[n];
    const epub = epubRowToFields(epubGold[n], n);
    for (const [field, label] of [
      ["judgment", "juicio"],
      ["image", "imagen"],
    ]) {
      if (!textsMatch(pdf[field], epub[field], "legge")) {
        pdfVsEpub.push({
          hex: n,
          field: label,
          importance: classifyImportance(label, similarityHint(pdf[field], epub[field], "legge"), pdf[field], epub[field]),
          pdf: snippet(pdf[field]),
          epub: snippet(epub[field]),
          pdfStatus: fieldStatus(pdf[field]),
        });
      }
    }
    for (let p = 1; p <= 6; p++) {
      if (!textsMatch(pdf.lines?.[p], epub.lines[p], "legge")) {
        pdfVsEpub.push({
          hex: n,
          field: `L${p}`,
          importance: classifyImportance(`line${p}`, similarityHint(pdf.lines?.[p], epub.lines[p], "legge"), pdf.lines?.[p], epub.lines[p]),
          pdf: snippet(pdf.lines?.[p]),
          epub: snippet(epub.lines[p]),
          pdfStatus: fieldStatus(pdf.lines?.[p]),
        });
      }
    }
    if (n === 1 && pdf.yongJiu && !textsMatch(pdf.yongJiu, epub.yongJiu, "legge")) {
      pdfVsEpub.push({
        hex: 1,
        field: "yongJiu",
        importance: "book_primary_yong",
        pdf: snippet(pdf.yongJiu),
        epub: snippet(epub.yongJiu),
        pdfStatus: fieldStatus(pdf.yongJiu),
      });
    }
  }

  const pdfVsEpubImportant = pdfVsEpub.filter(
    (d) => !["none", "minor_punct_ocr"].includes(d.importance) || d.pdfStatus !== "ok",
  );

  console.log("\n--- TABLA: PDF injector vs EPUB (cambios reales scan/book-primary) ---");
  console.log(`Total: ${pdfVsEpub.length} | Importantes o PDF roto: ${pdfVsEpubImportant.length}`);
  console.log("| Hex | Campo | Clase | PDF status | EPUB | PDF/scan |");
  console.log("|-----|-------|-------|------------|------|----------|");
  for (const d of byImportance(pdfVsEpubImportant).slice(0, 40)) {
    console.log(
      `| ${d.hex} | ${d.field} | ${d.importance} | ${d.pdfStatus ?? "ok"} | ${d.epub.replace(/\|/g, "\\|")} | ${d.pdf.replace(/\|/g, "\\|")} |`,
    );
  }
  if (pdfVsEpubImportant.length > 40) {
    console.log(`| … | +${pdfVsEpubImportant.length - 40} más | | | | |`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
