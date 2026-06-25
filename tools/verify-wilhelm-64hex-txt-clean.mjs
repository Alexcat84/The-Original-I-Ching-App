#!/usr/bin/env node

/**
 * QA code: VF-FID-W-002 wilhelm-64hex-txt-clean · v1.0.0
 * Area: tools/verify-wilhelm-64hex-txt-clean
 * Family: FID-W
 */

/**
 * Post-cleanup verification: orphans in source, G0/G1/G2, spot-checks on key hex.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_G2_META_TXT_KEYS, WILHELM_G2_ORACLE_KEYS } from "../scripts/lib/wilhelm-manual-fields.mjs";
import { normalizeWilhelmTxtText } from "../scripts/lib/wilhelm-64hex-txt.mjs";
import { parseWilhelmManualTsv } from "../scripts/lib/parse-wilhelm-manual-tsv.mjs";
import { USER_MANUAL_GOLD } from "./wilhelm-manual-gold-hex1-3.mjs";
import { WILHELM_BOOK_ONE_PARSED_JSON } from "../scripts/lib/wilhelm-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(
  ROOT,
  "tools/source-pdfs/I Ching or Book of Changes (Bollingen Series), The - Wilhelm, Hellmut-64hex.txt",
);
const PARSED = WILHELM_BOOK_ONE_PARSED_JSON;

/** @type {Array<[RegExp, string]>} */
const ORPHAN_PATTERNS = [
  [/Furthering\d/g, "Furthering+digit"],
  [/means:\d/g, "digit in line label"],
  [/THE LINES\d/g, "THE LINES+digit"],
  [/(?<=[\p{L},])\d{1,2}(?=\s)/gu, "letter/comma + digit + space"],
  [/(?<=["])\d{1,2}(?=\s)/gu, "quote + digit + space"],
  [/(?<=\.)\d{1,2}(?=\s|$)/gu, "period + digit"],
  [/,\d{1,2}\]/g, "comma+digit+]"],
];

/**
 * @param {string} userVal
 * @param {string} parsedVal
 */
function fieldsMatch(userVal, parsedVal) {
  const u = normalizeWilhelmTxtText(userVal);
  const p = normalizeWilhelmTxtText(parsedVal);
  if (u === p) return true;
  return u.replace(/\n+/g, " ") === p.replace(/\n+/g, " ");
}

function main() {
  const raw = readFileSync(RAW, "utf8");
  const parsed = JSON.parse(readFileSync(PARSED, "utf8"));

  console.log("=== 1. Orphan footnote markers in cleaned source ===\n");
  /** @type {string[]} */
  const orphanHits = [];
  for (const [re, label] of ORPHAN_PATTERNS) {
    const matches = raw.match(re);
    const n = matches?.length ?? 0;
    console.log(`${n}\t${label}`);
    if (n > 0 && matches) orphanHits.push(...matches.slice(0, 3).map((m) => `${label}: ${JSON.stringify(m)}`));
  }

  console.log("\n=== 2. G2 manual gold (hex 1–3–8, oracle fields) ===\n");
  const compareKeys = [...WILHELM_G2_ORACLE_KEYS, ...WILHELM_G2_META_TXT_KEYS];
  const manualGold = {
    ...USER_MANUAL_GOLD,
    ...parseWilhelmManualTsv(
      readFileSync(join(ROOT, "tools/manual-gold/hex-1-2-3-8.tsv"), "utf8"),
    ),
  };
  /** @type {number} */
  let g2Fails = 0;
  for (const hexNum of [1, 2, 3, 8]) {
    const user = manualGold[hexNum];
    const fields = parsed.hexagrams[String(hexNum)]?.fields;
    /** @type {string[]} */
    const diffs = [];
    for (const key of compareKeys) {
      const userVal = user[key] ?? "";
      if (WILHELM_G2_META_TXT_KEYS.includes(key) && !String(userVal).trim()) continue;
      if (!fieldsMatch(userVal, fields?.[key] ?? "")) diffs.push(key);
    }
    console.log(`Hex ${hexNum}: ${diffs.length ? `FAIL (${diffs.join(", ")})` : "PASS"}`);
    g2Fails += diffs.length;
  }

  console.log("\n=== 3. Spot-checks (automated manual QA) ===\n");
  const checks = [
    {
      name: "Hex 1 L5 Confucius quote complete",
      ok: (parsed.hexagrams["1"].fields.L5_comentario ?? "").includes(
        "Things that accord in tone vibrate together",
      ),
    },
    {
      name: "Hex 1 yong present",
      ok: Boolean(parsed.hexagrams["1"].fields.yong_oraculo?.trim()),
    },
    {
      name: "Hex 2 yong present",
      ok: Boolean(parsed.hexagrams["2"].fields.yong_oraculo?.trim()),
    },
    {
      name: "Hex 3 yong empty",
      ok: !parsed.hexagrams["3"].fields.yong_oraculo?.trim(),
    },
    {
      name: "Hex 1 L4 oracle has No blame",
      ok: (parsed.hexagrams["1"].fields.L4_oraculo ?? "").includes("No blame"),
    },
    {
      name: "Hex 64 ends with NOTE in source",
      ok: /Book of Changes is a book of the future/.test(raw),
    },
    {
      name: "No Shuo Kua appendix",
      ok: !/Shuo Kua/i.test(raw),
    },
    {
      name: "All 64 hex have judgment_oraculo",
      ok: Array.from({ length: 64 }, (_, i) => i + 1).every(
        (n) => Boolean(parsed.hexagrams[String(n)]?.fields.judgment_oraculo?.trim()),
      ),
    },
    {
      name: "Hex 29 (Abysmal) L2 oracle",
      ok: (parsed.hexagrams["29"]?.fields.L2_oraculo ?? "").includes("abyss is dangerous"),
    },
  ];

  /** @type {number} */
  let spotFails = 0;
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}\t${c.name}`);
    if (!c.ok) spotFails++;
  }

  console.log("\n=== SUMMARY ===");
  const orphanTotal = ORPHAN_PATTERNS.reduce((s, [re]) => s + (raw.match(re)?.length ?? 0), 0);
  console.log(`Orphan markers in source: ${orphanTotal}`);
  console.log(`G2 field diffs: ${g2Fails}`);
  console.log(`Spot-check failures: ${spotFails}`);
  if (orphanTotal || g2Fails || spotFails) process.exitCode = 1;
  else console.log("\nAll post-cleanup checks PASS.");
}

main();
