#!/usr/bin/env node
/**
 * Audit Anna's Archive TXT passes (01-04) for Wilhelm 1924 Ten Wings coverage.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_DE_PASS_DIRS } from "./lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const W_GERMAN = join(ROOT, "tools/source-pdfs/W german");

const MARKERS = {
  bookI: [
    /ERSTES BUCH/i,
    /DAS URTEIL/i,
    /Die einzelnen Linien/i,
  ],
  bookII: [
    /ZWEITES BUCH/i,
    /Das Material/i,
    /Da Dschuan/i,
    /Die Große Abhandlung/i,
    /Schuo Gua/i,
    /Besprechung der Zeichen/i,
    /Die Reihenfolge/i,
    /Vermischte Zeichen/i,
    /Zehn Flügel/i,
    /zehn Flügel/i,
  ],
  bookIII_perHex: [
    /DRITTES BUCH/i,
    /Die Kommentare/i,
    /DIE KOMMENTARE/i,
    /Kommentar zur Entscheidung/i,
    /Kommentar zu den Bildern/i,
    /Kommentar der Textworte/i,
    /Kommentar zu den Textworten/i,
    /Wen Y[aä]n/i,
    /Kernzeichen/i,
  ],
};

/** @param {string} dir */
async function stitchText(dir) {
  let files;
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".txt")).sort(
      (a, b) => Number(a.replace(".txt", "")) - Number(b.replace(".txt", "")),
    );
  } catch {
    return { pageCount: 0, text: "", error: "missing dir" };
  }
  const parts = [];
  for (const f of files) {
    parts.push(await readFile(join(dir, f), "utf8"));
  }
  return { pageCount: files.length, text: parts.join("\n") };
}

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function countHexHeaders(text) {
  // Drittes Buch hex headers like "1. Kiën" or "43. Guai"
  const re = /(?:^|\n)\s*(\d{1,2})\.\s+[A-ZÄÖÜa-zäöüß]/g;
  let n = 0;
  const seen = new Set();
  let m;
  while ((m = re.exec(text))) {
    const h = Number(m[1]);
    if (h >= 1 && h <= 64) seen.add(h);
  }
  return seen.size;
}

function auditText(label, text, pageCount) {
  /** @type {Record<string, number>} */
  const hits = {};
  for (const [group, patterns] of Object.entries(MARKERS)) {
    for (const re of patterns) {
      const key = `${group}:${re.source}`;
      hits[key] = countMatches(text, re);
    }
  }
  return {
    label,
    pageCount,
    chars: text.length,
    hexHeaders1to64: countHexHeaders(text),
    kommentarEntscheidung: countMatches(text, /Kommentar zur Entscheidung/gi),
    kommentarBildern: countMatches(text, /Kommentar zu den Bildern/gi),
    wenYen: countMatches(text, /Wen Y[aä]n/gi),
    drittesBuch: countMatches(text, /DRITTES BUCH|Drittes Buch/gi),
    zweitesBuch: countMatches(text, /ZWEITES BUCH|Zweites Buch/gi),
    erstesBuch: countMatches(text, /ERSTES BUCH|Erstes Buch/gi),
    hits,
  };
}

const passes = [
  ["01 → Erstes Buch pass A", WILHELM_DE_PASS_DIRS.bookOnePass01],
  ["02 → Drittes Buch pass A (Ten Wings)", WILHELM_DE_PASS_DIRS.bookThreePass02],
  ["03 → Erstes Buch pass B", WILHELM_DE_PASS_DIRS.bookOnePass03],
  ["04 → Drittes Buch pass B (Ten Wings)", WILHELM_DE_PASS_DIRS.bookThreePass04],
];

console.log("Wilhelm DE 1924 — Anna's Archive TXT audit\n");

/** @type {object[]} */
const results = [];
for (const [label, dir] of passes) {
  const { pageCount, text, error } = await stitchText(dir);
  if (error) {
    console.log(`${label}: ${error}`);
    continue;
  }
  const audit = auditText(label, text, pageCount);
  results.push(audit);
  console.log(`\n=== ${label} ===`);
  console.log(`  Pages: ${audit.pageCount} · Chars: ${audit.chars.toLocaleString()}`);
  console.log(`  Erstes Buch markers: ${audit.erstesBuch}`);
  console.log(`  Zweites Buch markers: ${audit.zweitesBuch}`);
  console.log(`  Drittes Buch markers: ${audit.drittesBuch}`);
  console.log(`  Kommentar zur Entscheidung: ${audit.kommentarEntscheidung} (expect ~64 in full Book III)`);
  console.log(`  Kommentar zu den Bildern: ${audit.kommentarBildern} (expect ~64)`);
  console.log(`  Wen Yen: ${audit.wenYen} (expect 1-2 blocks, hex 1-2 only)`);
  console.log(`  Distinct hex headers 1-64: ${audit.hexHeaders1to64}`);
}

// Book II might be inside 01/03 if full scan - check combined book-one passes
const p01 = await stitchText(WILHELM_DE_PASS_DIRS.bookOnePass01);
const p03 = await stitchText(WILHELM_DE_PASS_DIRS.bookOnePass03);
const combinedBookOne = p01.text + "\n" + p03.text;
const bookIIaudit = auditText("01+03 combined", combinedBookOne, p01.pageCount + p03.pageCount);
console.log("\n=== 01+03 combined (full Erstes Buch scan?) ===");
console.log(`  Pages: ${bookIIaudit.pageCount} · Chars: ${bookIIaudit.chars.toLocaleString()}`);
console.log(`  Zweites Buch: ${bookIIaudit.zweitesBuch}`);
console.log(`  Da Dschuan: ${countMatches(combinedBookOne, /Da Dschuan/gi)}`);
console.log(`  Schuo Gua: ${countMatches(combinedBookOne, /Schuo Gua/gi)}`);
console.log(`  Die Reihenfolge: ${countMatches(combinedBookOne, /Die Reihenfolge/gi)}`);
console.log(`  Vermischte Zeichen: ${countMatches(combinedBookOne, /Vermischte Zeichen/gi)}`);

const p02 = await stitchText(WILHELM_DE_PASS_DIRS.bookThreePass02);
const p04 = await stitchText(WILHELM_DE_PASS_DIRS.bookThreePass04);
console.log("\n=== VERDICT: Ten Wings in Anna TXT ===");
const tuan02 = countMatches(p02.text, /Kommentar zur Entscheidung/gi);
const tuan04 = countMatches(p04.text, /Kommentar zur Entscheidung/gi);
const bestTuan = Math.max(tuan02, tuan04);
if (bestTuan >= 60) {
  console.log(`  Drittes Buch per-hex (folders 02/04): PRESENT (~${bestTuan} Tuan blocks)`);
} else if (bestTuan > 0) {
  console.log(`  Drittes Buch per-hex: PARTIAL (${bestTuan}/64 Tuan markers in best pass)`);
} else {
  console.log(`  Drittes Buch per-hex: NOT FOUND in 02/04`);
}

const bookIIinOne = countMatches(combinedBookOne, /ZWEITES BUCH|Zweites Buch/gi);
const bookIIin02 = countMatches(p02.text, /ZWEITES BUCH|Zweites Buch/gi);
if (bookIIinOne > 0 || bookIIin02 > 0) {
  console.log(`  Zweites Buch (wings 5-10 essays): check 01+03 or mixed — markers=${bookIIinOne + bookIIin02}`);
} else {
  console.log(`  Zweites Buch: NOT in these four folders (may be separate download or omitted)`);
}
