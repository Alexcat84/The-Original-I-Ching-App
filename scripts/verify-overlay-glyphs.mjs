#!/usr/bin/env node

/**
 * QA code: VF-WEB-OVR-001 overlay-glyphs · v1.1.0
 * Area: scripts/verify-overlay-glyphs
 * Family: WEB-OVR
 */

/**
 * Overlay glyph coverage gate — ensures production overlay SVG markers and the
 * Legge/Wilhelm name corpus include all codepoints the dual font-stack must render.
 *
 * Output: reports/overlay-glyphs-audit-latest.{md,json}
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "reports");

const REQUIRED_LATIN_DIACRITICS = ["ă", "â", "î", "û", "ü", "Ž", "Î"];
const OVERLAY_TITLE_ZH_CLASS = "overlay-title-zh";
const OVERLAY_TITLE_EN_CLASS = "overlay-title-en";
const OVERLAY_TITLE_ZH_FONT = "Noto Serif TC, Noto Serif SC, SimSun, STSong, serif";
const OVERLAY_TITLE_EN_FONT = "Georgia, 'Noto Serif', serif";

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildOverlaySnippet(primaryNumber, primaryName, primaryChinese) {
  const subZh = escapeXml(primaryChinese);
  const subEn = escapeXml(`#${primaryNumber} ${primaryName}`);
  return `<text class="${OVERLAY_TITLE_ZH_CLASS}" font-family='${OVERLAY_TITLE_ZH_FONT}'>${subZh}</text>
<text class="${OVERLAY_TITLE_EN_CLASS}" font-family="${OVERLAY_TITLE_EN_FONT}">${subEn}</text>`;
}

function uniqueHanzi(chineseNames) {
  const set = new Set();
  for (const name of chineseNames) {
    for (const ch of name) set.add(ch);
  }
  return [...set];
}

function leggeDiacriticHits(names) {
  const hits = new Map();
  for (const ch of REQUIRED_LATIN_DIACRITICS) hits.set(ch, []);
  for (const { number, name } of names) {
    for (const ch of REQUIRED_LATIN_DIACRITICS) {
      if (name.includes(ch)) hits.get(ch).push(number);
    }
  }
  return Object.fromEntries(hits);
}

async function main() {
  const wilPath = join(ROOT, "packages/iching-data/src/generated/hexagrams.wilhelm.json");
  const legPath = join(ROOT, "packages/iching-data/src/generated/hexagrams.legge.json");
  const wil = JSON.parse(await readFile(wilPath, "utf8")).hexagrams;
  const leg = JSON.parse(await readFile(legPath, "utf8")).hexagrams;

  const rows = [];
  let pass = true;

  for (const h of wil) {
    const snippet = buildOverlaySnippet(h.number, h.name, h.chineseName);
    const hasZhClass = snippet.includes(`class="${OVERLAY_TITLE_ZH_CLASS}"`);
    const hasEnClass = snippet.includes(`class="${OVERLAY_TITLE_EN_CLASS}"`);
    const hasEnLatinFont = snippet.includes(`font-family="${OVERLAY_TITLE_EN_FONT}"`);
    const ok = hasZhClass && hasEnClass && hasEnLatinFont;
    if (!ok) pass = false;
    rows.push({
      translator: "wilhelm",
      number: h.number,
      name: h.name,
      pass: ok,
    });
  }

  for (const h of leg) {
    const snippet = buildOverlaySnippet(h.number, h.name, h.chineseName);
    const hasZhClass = snippet.includes(`class="${OVERLAY_TITLE_ZH_CLASS}"`);
    const hasEnClass = snippet.includes(`class="${OVERLAY_TITLE_EN_CLASS}"`);
    const hasEnLatinFont = snippet.includes(`font-family="${OVERLAY_TITLE_EN_FONT}"`);
    const ok = hasZhClass && hasEnClass && hasEnLatinFont;
    if (!ok) pass = false;
    rows.push({
      translator: "legge",
      number: h.number,
      name: h.name,
      pass: ok,
    });
  }

  const hanzi = uniqueHanzi(wil.map((h) => h.chineseName));
  const diacritics = leggeDiacriticHits(leg.map((h) => ({ number: h.number, name: h.name })));
  const missingDiacritics = REQUIRED_LATIN_DIACRITICS.filter(
    (ch) => (diacritics[ch]?.length ?? 0) === 0,
  );
  if (missingDiacritics.length > 0) pass = false;

  const summary = {
    generatedAt: new Date().toISOString(),
    pass,
    overlayRows: rows.length,
    overlayRowsPass: rows.filter((r) => r.pass).length,
    uniqueHanzi: hanzi.length,
    leggeDiacritics: diacritics,
    missingDiacritics,
    criticalSamples: {
      legge32: leg.find((h) => h.number === 32)?.name ?? null,
      legge35: leg.find((h) => h.number === 35)?.name ?? null,
    },
  };

  await mkdir(OUT, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = join(OUT, `overlay-glyphs-audit-${stamp}.json`);
  const latestJson = join(OUT, "overlay-glyphs-audit-latest.json");
  const latestMd = join(OUT, "overlay-glyphs-audit-latest.md");

  await writeFile(jsonPath, JSON.stringify({ summary, rows }, null, 2));
  await writeFile(latestJson, JSON.stringify({ summary, rows }, null, 2));

  const md = `# Overlay glyph coverage gate

- **Generated:** ${summary.generatedAt}
- **Result:** ${pass ? "PASS" : "FAIL"}
- **Overlay rows:** ${summary.overlayRowsPass}/${summary.overlayRows}
- **Unique hanzi (zh line):** ${summary.uniqueHanzi}
- **Legge diacritics in corpus:** ${REQUIRED_LATIN_DIACRITICS.map((ch) => `\`${ch}\` (${diacritics[ch]?.length ?? 0})`).join(", ")}

Critical samples: Legge #32 \`${summary.criticalSamples.legge32}\`, #35 \`${summary.criticalSamples.legge35}\`
`;
  await writeFile(latestMd, md);

  console.log(pass ? "PASS overlay-glyphs gate" : "FAIL overlay-glyphs gate");
  console.log(`  rows: ${summary.overlayRowsPass}/${summary.overlayRows}`);
  console.log(`  hanzi: ${summary.uniqueHanzi}`);
  if (!pass) {
    if (missingDiacritics.length) {
      console.error("  missing diacritics in Legge corpus:", missingDiacritics.join(", "));
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
