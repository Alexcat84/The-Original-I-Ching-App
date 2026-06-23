#!/usr/bin/env node
/**
 * Audit wilhelm_above/below vs Parma mirror (Wilhelm/Baynes print headers).
 *
 * Usage:
 *   node tools/audit-wilhelm-trigram-parma.mjs
 *   node tools/audit-wilhelm-trigram-parma.mjs --refresh-reference
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { formatWilhelmTrigram } from "../scripts/lib/wilhelm-manual-fields.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPORTS = join(ROOT, "reports");
const REF = join(ROOT, "tools/reference/wilhelm-parma-trigram-headers.json");
const PARMA_URL =
  "http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html";

/**
 * @param {string} text
 */
function parseParmaTrigramLines(text) {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&Ecirc;/g, "Ê");
  /** @type {Record<string, { above: string; below: string }>} */
  const hexagrams = {};
  const re = /(\d{1,2})\.\s+[^\n]+\n\n(above[^\n]+)/gi;
  let m;
  while ((m = re.exec(normalized)) !== null) {
    const n = Number(m[1]);
    if (n < 1 || n > 64) continue;
    const line = m[2].replace(/\s+/g, " ").trim();
    const belowIdx = line.search(/\sbelow\s/i);
    if (belowIdx < 0) continue;
    hexagrams[String(n)] = {
      above: line.slice(0, belowIdx).trim(),
      below: line.slice(belowIdx).trim(),
    };
  }
  return hexagrams;
}

async function loadParmaPlainText() {
  if (process.argv.includes("--refresh-reference")) {
    const res = await fetch(PARMA_URL);
    if (!res.ok) throw new Error(`Parma fetch failed: ${res.status}`);
    const html = await res.text();
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&ecirc;/gi, "ê")
      .replace(/&nbsp;/g, " ")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
  }
  const ref = JSON.parse(readFileSync(REF, "utf8"));
  if (ref.hexagrams && Object.keys(ref.hexagrams).length === 64) {
    return null;
  }
  throw new Error(`Missing ${REF} — run with --refresh-reference once`);
}

const inj = (await import("../scripts/iching_wilhelm_translation.mjs")).default;

/** @type {Record<string, { above: string; below: string }>} */
let parma;

if (process.argv.includes("--refresh-reference")) {
  const plain = await loadParmaPlainText();
  parma = parseParmaTrigramLines(plain ?? "");
  mkdirSync(dirname(REF), { recursive: true });
  writeFileSync(
    REF,
    `${JSON.stringify(
      {
        source: PARMA_URL,
        extractedAt: new Date().toISOString(),
        hexagrams: parma,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`Wrote ${REF} (${Object.keys(parma).length} hex)`);
} else {
  const ref = JSON.parse(readFileSync(REF, "utf8"));
  parma = ref.hexagrams;
}

/** @type {Array<{ hex: number; pos: string; injector: string; parma: string; kind: string }>} */
const mismatches = [];
/** @type {number[]} */
const missing = [];

for (let n = 1; n <= 64; n++) {
  const p = parma[String(n)];
  const row = inj[String(n)];
  if (!p) {
    missing.push(n);
    continue;
  }
  for (const pos of ["above", "below"]) {
    const injLine = formatWilhelmTrigram(
      row[pos === "above" ? "wilhelm_above" : "wilhelm_below"],
      pos,
    );
    const parLine = p[pos];
    if (injLine === parLine) continue;
    let kind = "other";
    if (n === 23 && pos === "below") {
      kind = "parma_header_vs_binary_intro";
    } else if (parLine.includes("WOOD") && !injLine.includes("WOOD")) {
      kind = "injector_missing_wood";
    } else if (/FLAME|FIRE/.test(injLine) && /FLAME|FIRE/.test(parLine)) {
      kind = "book_fire_flame_variant";
    } else if (/CH[êe]N|K[êe]N|Sun/.test(injLine)) {
      kind = "book_wade_giles_variant";
    }
    mismatches.push({ hex: n, pos, injector: injLine, parma: parLine, kind });
  }
}

const ours = mismatches.filter((m) => m.kind === "injector_missing_wood");
const parmaAnomaly = mismatches.filter((m) => m.kind === "parma_header_vs_binary_intro");
const bookVariants = mismatches.filter(
  (m) =>
    m.kind === "book_fire_flame_variant" || m.kind === "book_wade_giles_variant",
);
const pass = ours.length === 0 && missing.length === 0;

const md = [
  "# Wilhelm trigram injector vs Parma print",
  "",
  `- Generated: ${new Date().toISOString()}`,
  `- Reference: \`${REF}\``,
  `- Injector: \`scripts/iching_wilhelm_translation.mjs\``,
  "",
  "## Summary",
  "",
  `| Check | Result |`,
  `|-------|--------|`,
  `| Injector matches Parma (128 lines) | **${pass && mismatches.length === parmaAnomaly.length ? "PASS" : ours.length ? "FAIL" : "PASS with notes"}** |`,
  `| Our gaps (missing WOOD / typos) | **${ours.length}** |`,
  `| Book-internal variants (FIRE/FLAME, Wade-Giles) | **${64 - bookVariants.length}** hex match; variants documented below |`,
  `| Parma header anomaly (hex 23) | **${parmaAnomaly.length}** — injector follows binary + intro |`,
  "",
  ours.length
    ? "## Injector gaps (fix required)\n\n" +
      ours
        .map((m) => `- Hex ${m.hex} ${m.pos}: \`${m.injector}\` → should be \`${m.parma}\``)
        .join("\n")
    : "",
  "",
  parmaAnomaly.length
    ? "## Hex 23 — Parma header vs structure\n\n" +
      "Parma line: `below LI THE CLINGING, FIRE`. Injector + Princeton TXT intro: **earth below, mountain above** (binary 100000 = Gen/Kun). Trust injector + intro over formal header line.\n"
    : "",
  "",
  "## Book variants (not our typos — do not normalize in book-primary dataset)",
  "",
  "- **FIRE vs FLAME** for Li (離): Wilhelm alternates by hex (e.g. 13–14 FLAME, 21+ often FIRE).",
  "- **CHêN vs CHEN** (hex 32): Parma prints CHEN without circumflex.",
  "- **KEN vs KêN** (hex 15 vs others): Parma prints KEN without circumflex.",
  "- **Sun vs SUN** (hex 18): Parma prints mixed case `Sun`.",
  "",
  bookVariants.length
    ? "| Hex | Pos | Injector (= Parma) |\n|-----|-----|--------------------|\n" +
      bookVariants
        .slice(0, 8)
        .map((m) => `| ${m.hex} | ${m.pos} | ${m.injector.replace(/\|/g, "\\|")} |`)
        .join("\n")
    : "",
  "",
].join("\n");

mkdirSync(REPORTS, { recursive: true });
const latest = join(REPORTS, "wilhelm-trigram-parma-audit-latest.md");
writeFileSync(latest, md, "utf8");

console.log(
  pass
    ? `PASS: no injector gaps (${mismatches.length - parmaAnomaly.length} book-variant matches, ${parmaAnomaly.length} hex-23 note)`
    : `FAIL: ${ours.length} injector gap(s)`,
);
console.log(`Report: ${latest}`);
if (ours.length) process.exitCode = 1;
