#!/usr/bin/env node

/**
 * QA code: VF-PINYIN-001 pinyin-gold · v1.0.0
 * Area: scripts/verify-pinyin-gold
 * Family: PINYIN
 */

/**
 * Pinyin gold gate — cross-checks hardcoded pinyin against pinyin-pro's
 * dictionary readings for the underlying hanzi, instead of trusting a
 * hand-typed value with no audit trail.
 *
 * Covers:
 *   - scripts/iching_wilhelm_translation.mjs (64 hexagram names, hand-typed
 *     field `pinyin`, no prior cross-check) — this is the real gate, since
 *     this value is hand-maintained and could drift.
 *   - packages/iching-data/src/generated/trigrams.json (8 trigrams) — this is
 *     a regression guard, not an audit of hand-typed data: its `pinyin` is
 *     already derived by scripts/build-trigrams.mjs at build time, never
 *     hand-typed, so a fail here would mean the build script itself is wrong.
 *
 * A single hanzi can have multiple valid classical readings (duoyinzi); the
 * I Ching deliberately uses a non-default reading for some hexagram names
 * (e.g. 屯 "zhūn", not the more common "tún"). This gate passes when the
 * hardcoded value is ANY dictionary-recognized reading, so it catches real
 * typos/unknown-character mistakes without flagging deliberate scholarly
 * disambiguation.
 *
 * The hanzi itself (`trad_chinese`) is already cross-checked 64/64 against
 * ctext.org via scripts/iching_zhouyi_translation.mjs (see
 * scripts/sync-wilhelm-hex-chinese-gold.mjs provenance.crossCheck) — this gate
 * only closes the remaining pinyin gap.
 *
 * Output: reports/pinyin-gold-audit-latest.{md,json} (+ timestamped copy)
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pinyin } from "pinyin-pro";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "reports");

function defaultPinyin(hanzi) {
  return pinyin(hanzi, { toneType: "symbol", v: true }).replace(/\s+/g, "");
}

/**
 * Single hanzi can have multiple valid classical readings (duoyinzi) — the
 * I Ching deliberately uses a non-default reading for some hexagram names
 * (e.g. 屯 "zhūn" not the more common "tún"). Accept any dictionary-known
 * reading, not just pinyin-pro's frequency-ranked default, so this gate
 * doesn't flag a deliberate scholarly choice as a typo.
 */
function knownReadings(hanzi) {
  if (hanzi.length !== 1) return [defaultPinyin(hanzi)];
  const all = pinyin(hanzi, { toneType: "symbol", multiple: true });
  return all.split(" ").filter(Boolean);
}

async function checkHexagramNames() {
  const w = (await import("./iching_wilhelm_translation.mjs")).default;
  const rows = [];
  for (let n = 1; n <= 64; n++) {
    const row = w[String(n)];
    const hanzi = String(row.trad_chinese ?? "");
    const current = String(row.pinyin ?? "");
    const expected = defaultPinyin(hanzi);
    const valid = knownReadings(hanzi);
    rows.push({
      source: "iching_wilhelm_translation.mjs",
      key: `hex ${n}`,
      hanzi,
      current,
      expected,
      validReadings: valid,
      pass: valid.includes(current),
    });
  }
  return rows;
}

async function checkTrigrams() {
  const jsonPath = join(ROOT, "packages/iching-data/src/generated/trigrams.json");
  const { trigrams } = JSON.parse(await readFile(jsonPath, "utf8"));
  const rows = trigrams.map((t) => {
    const expected = defaultPinyin(t.chinese);
    const valid = knownReadings(t.chinese);
    return {
      source: "trigrams.json",
      key: t.id,
      hanzi: t.chinese,
      current: t.pinyin,
      expected,
      validReadings: valid,
      pass: valid.includes(t.pinyin),
    };
  });
  if (rows.length !== 8) {
    throw new Error(`Expected 8 trigram entries in trigrams.json, found ${rows.length}`);
  }
  return rows;
}

async function main() {
  const rows = [...(await checkHexagramNames()), ...(await checkTrigrams())];
  const fails = rows.filter((r) => !r.pass);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  await mkdir(OUT, { recursive: true });

  const jsonOut = {
    generatedAt: new Date().toISOString(),
    method: "pinyin-pro derivation from hanzi vs hardcoded pinyin field",
    totalChecks: rows.length,
    totalFails: fails.length,
    fails,
  };
  await writeFile(join(OUT, "pinyin-gold-audit-latest.json"), JSON.stringify(jsonOut, null, 2), "utf8");
  await writeFile(join(OUT, `pinyin-gold-audit-${stamp}.json`), JSON.stringify(jsonOut, null, 2), "utf8");

  const md = [];
  md.push(`# Pinyin gold audit — derivado vs hardcodeado`);
  md.push(``);
  md.push(`Generado ${stamp}. Pinyin derivado algorítmicamente del hanzi (pinyin-pro) vs el valor en \`scripts/iching_wilhelm_translation.mjs\` (64 nombres de hexagrama, hardcodeado) y \`packages/iching-data/src/generated/trigrams.json\` (8 trigramas, ya generado por \`scripts/build-trigrams.mjs\` — regresión, no auditoría de hardcode).`);
  md.push(``);
  md.push(`Total checks: ${rows.length} · Total fails: ${fails.length}`);
  md.push(``);
  if (fails.length) {
    md.push(`## FAILS`);
    md.push(``);
    for (const r of fails) {
      md.push(`- **${r.source} / ${r.key}** — hanzi \`${r.hanzi}\`: hardcodeado \`${r.current}\`, lecturas válidas según diccionario \`${r.validReadings.join(", ")}\``);
    }
    md.push(``);
  } else {
    md.push(`Sin discrepancias — el pinyin hardcodeado coincide con la derivación algorítmica en los ${rows.length} casos.`);
  }
  await writeFile(join(OUT, "pinyin-gold-audit-latest.md"), md.join("\n"), "utf8");
  await writeFile(join(OUT, `pinyin-gold-audit-${stamp}.md`), md.join("\n"), "utf8");

  console.log(`Total checks: ${rows.length} · Total fails: ${fails.length}`);
  if (fails.length) {
    for (const r of fails) {
      console.log(`  FAIL ${r.source} ${r.key}: hanzi=${r.hanzi} current=${r.current} validReadings=${r.validReadings.join(",")}`);
    }
  }
  console.log(`Reports: reports/pinyin-gold-audit-latest.{md,json}`);
  if (fails.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
