#!/usr/bin/env node
/**
 * Literal 1:1 audit — current runtime bundles (hexagrams.wilhelm.json /
 * hexagrams.legge.json) vs the new verified TXT-maestro book-one datasets
 * (tools/datasets/{wilhelm,legge}/book-one). Strict equality only
 * (.trim(), no Unicode/punctuation normalization) — same standard as
 * scripts/lib/runtime-dataset-fields.mjs#verbatimTextsEqual.
 *
 * Output: reports/bundle-vs-maestro-audit-latest.{md,json} (+ timestamped copy)
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "reports");

async function loadJson(rel) {
  return JSON.parse(await readFile(join(ROOT, rel), "utf8"));
}

function eq(a, b) {
  return String(a ?? "").trim() === String(b ?? "").trim();
}

function extractTrigramLabel(str) {
  const m = String(str || "").match(/^(above|below)\s+\S+\s+(.+?),/i);
  return m ? m[2].trim() : null;
}

async function main() {
  const wb = await loadJson("packages/iching-data/src/generated/hexagrams.wilhelm.json");
  const lb = await loadJson("packages/iching-data/src/generated/hexagrams.legge.json");
  const wm = (await loadJson("tools/datasets/wilhelm/book-one/wilhelm-64hex-parsed.json")).hexagrams;
  const lm = (await loadJson("tools/datasets/legge/book-one/legge-64hex-parsed.json")).hexagrams;

  /** @type {Array<{translator: string; hex: number; field: string; current: string; maestro: string; pass: boolean}>} */
  const rows = [];

  for (let n = 1; n <= 64; n++) {
    const wr = wb.hexagrams.find((h) => h.number === n);
    const wf = wm[String(n)].fields;
    const lr = lb.hexagrams.find((h) => h.number === n);
    const lf = lm[String(n)].fields;

    const wUpperMaestro = extractTrigramLabel(wf.trigrama_arriba);
    const wLowerMaestro = extractTrigramLabel(wf.trigrama_abajo);

    const wChecks = [
      ["name", wr.name, wf.nombre],
      ["chineseName", wr.chineseName, wf.chinese],
      ["upperTrigram", wr.upperTrigram, wUpperMaestro],
      ["lowerTrigram", wr.lowerTrigram, wLowerMaestro],
      ["judgment", wr.judgment, wf.judgment_oraculo],
      ["image", wr.image, wf.image_oraculo],
      ...[1, 2, 3, 4, 5, 6].map((p) => [
        `L${p}`,
        wr.lines.find((l) => l.position === p)?.text,
        wf[`L${p}_oraculo`],
      ]),
    ];
    if (n === 1) wChecks.push(["yongJiu", wr.yongJiu, wf.yong_oraculo]);
    if (n === 2) wChecks.push(["yongLiu", wr.yongLiu, wf.yong_oraculo]);

    for (const [field, current, maestro] of wChecks) {
      rows.push({ translator: "wilhelm", hex: n, field, current, maestro, pass: eq(current, maestro) });
    }

    const lChecks = [
      ["name", lr.name, lf.chinese_roman],
      ["name_raw_bookTitle", lr.name, lf.nombre],
      ["chineseName", lr.chineseName, lf.chinese],
      ["judgment", lr.judgment, lf.thwan],
      ...[1, 2, 3, 4, 5, 6].map((p) => [`L${p}`, lr.lines.find((l) => l.position === p)?.text, lf[`L${p}`]]),
    ];
    if (n === 1 && lr.yongJiu) lChecks.push(["yongJiu", lr.yongJiu, lf.yong]);
    if (n === 2 && lr.yongLiu) lChecks.push(["yongLiu", lr.yongLiu, lf.yong]);

    for (const [field, current, maestro] of lChecks) {
      rows.push({ translator: "legge", hex: n, field, current, maestro, pass: eq(current, maestro) });
    }
  }

  const byField = {};
  for (const r of rows) {
    const key = `${r.translator}.${r.field}`;
    byField[key] ??= { pass: 0, fail: 0 };
    byField[key][r.pass ? "pass" : "fail"]++;
  }

  const fails = rows.filter((r) => !r.pass);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  await mkdir(OUT, { recursive: true });

  const jsonOut = { generatedAt: new Date().toISOString(), totalChecks: rows.length, totalFails: fails.length, byField, fails };
  await writeFile(join(OUT, "bundle-vs-maestro-audit-latest.json"), JSON.stringify(jsonOut, null, 2), "utf8");
  await writeFile(join(OUT, `bundle-vs-maestro-audit-${stamp}.json`), JSON.stringify(jsonOut, null, 2), "utf8");

  const md = [];
  md.push(`# Bundle vs maestro — auditoría literal 1:1`);
  md.push(``);
  md.push(`Generado ${stamp}. Comparación estricta (.trim() únicamente, sin normalizar comillas/Unicode) — mismo criterio que \`verbatimTextsEqual\`.`);
  md.push(``);
  md.push(`Total checks: ${rows.length} · Total fails: ${fails.length}`);
  md.push(``);
  md.push(`## Resumen por campo`);
  md.push(``);
  md.push(`| Campo | PASS | FAIL |`);
  md.push(`|---|---|---|`);
  for (const [key, v] of Object.entries(byField)) {
    md.push(`| ${key} | ${v.pass} | ${v.fail} |`);
  }
  md.push(``);
  md.push(`## Detalle de cada FAIL`);
  md.push(``);
  for (const r of fails) {
    md.push(`### ${r.translator} hex ${r.hex} — ${r.field}`);
    md.push(`- CURRENT: ${JSON.stringify(r.current)}`);
    md.push(`- MAESTRO: ${JSON.stringify(r.maestro)}`);
    md.push(``);
  }
  await writeFile(join(OUT, "bundle-vs-maestro-audit-latest.md"), md.join("\n"), "utf8");
  await writeFile(join(OUT, `bundle-vs-maestro-audit-${stamp}.md`), md.join("\n"), "utf8");

  console.log(`Total checks: ${rows.length} · Total fails: ${fails.length}`);
  for (const [key, v] of Object.entries(byField)) {
    console.log(`  ${key}: PASS ${v.pass} / FAIL ${v.fail}`);
  }
  console.log(`Reports: reports/bundle-vs-maestro-audit-latest.{md,json}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
