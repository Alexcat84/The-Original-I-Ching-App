#!/usr/bin/env node

/**
 * QA code: AU-FID-W-001 wilhelm-txt-g2 · v1.0.0
 * Area: tools/audit-wilhelm-txt-g2
 * Family: FID-W
 */

/**
 * G2 gate: manual gold vs wilhelm-64hex-parsed.json
 *
 * Usage:
 *   node tools/audit-wilhelm-txt-g2.mjs --deterministic     # fresh parse vs stored, all 64 hex (oracle fields)
 *   node tools/audit-wilhelm-txt-g2.mjs                     # hex 1–3 manual gold (oracle fields only)
 *   node tools/audit-wilhelm-txt-g2.mjs 4 5 6               # hex from built-in gold (if present)
 *   node tools/audit-wilhelm-txt-g2.mjs --tsv path          # parse paste file, compare hex in file
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WILHELM_G2_META_TXT_KEYS,
  WILHELM_G2_ORACLE_KEYS,
} from "../scripts/lib/wilhelm-manual-fields.mjs";
import {
  normalizeWilhelmTxtText,
  parseWilhelm64HexTxtFull,
} from "../scripts/lib/wilhelm-64hex-txt.mjs";
import { parseWilhelmManualTsv } from "../scripts/lib/parse-wilhelm-manual-tsv.mjs";
import { USER_MANUAL_GOLD } from "./wilhelm-manual-gold-hex1-3.mjs";
import { WILHELM_BOOK_ONE_PARSED_JSON } from "../scripts/lib/wilhelm-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PARSED = WILHELM_BOOK_ONE_PARSED_JSON;
const REPORTS = join(ROOT, "reports");

/**
 * @param {string} name
 * @param {string} userVal
 * @param {string} parsedVal
 */
function compareField(name, userVal, parsedVal) {
  const u = normalizeWilhelmTxtText(userVal);
  const p = normalizeWilhelmTxtText(parsedVal);
  if (u === p) return { name, status: "OK" };
  const uFlat = u.replace(/\n+/g, " ");
  const pFlat = p.replace(/\n+/g, " ");
  if (uFlat === pFlat) return { name, status: "OK_WHITESPACE" };
  let diffAt = 0;
  const minLen = Math.min(u.length, p.length);
  for (let i = 0; i < minLen; i++) {
    if (u[i] !== p[i]) {
      diffAt = i;
      break;
    }
  }
  return {
    name,
    status: "DIFF",
    userLen: u.length,
    parsedLen: p.length,
    userSnippet: u.slice(Math.max(0, diffAt - 30), diffAt + 90),
    parsedSnippet: p.slice(Math.max(0, diffAt - 30), diffAt + 90),
  };
}

/**
 * @param {Record<string, string>} left
 * @param {Record<string, string>} right
 * @param {string[]} keys
 */
function diffFields(left, right, keys) {
  /** @type {ReturnType<typeof compareField>[]} */
  const diffs = [];
  for (const key of keys) {
    const r = compareField(key, left[key] ?? "", right[key] ?? "");
    if (r.status !== "OK" && r.status !== "OK_WHITESPACE") diffs.push(r);
  }
  return diffs;
}

/**
 * @param {number[]} hexTargets
 * @param {Record<number, Record<string, string>>} manualGold
 * @param {Awaited<ReturnType<typeof parseWilhelm64HexTxtFull>>["hexagrams"]} storedHex
 * @param {boolean} verbose
 */
function runManualG2(hexTargets, manualGold, storedHex, verbose) {
  /** @type {number} */
  let totalDiffs = 0;

  for (const hexNum of hexTargets) {
    const user = manualGold[hexNum];
    const fields = storedHex[String(hexNum)]?.fields;
    if (!user) {
      console.error(`No manual gold for hex ${hexNum}`);
      process.exitCode = 1;
      continue;
    }
    if (!fields) {
      console.error(`No parsed TXT for hex ${hexNum}`);
      process.exitCode = 1;
      continue;
    }

    const oracleDiffs = diffFields(user, fields, WILHELM_G2_ORACLE_KEYS);
    const metaDiffs = diffFields(user, fields, WILHELM_G2_META_TXT_KEYS).filter(
      (d) => String(user[d.name] ?? "").trim(),
    );

    if (verbose) {
      console.log(`\n=== G2 HEX ${hexNum} manual vs TXT parsed (oracle fields) ===\n`);
      for (const key of WILHELM_G2_ORACLE_KEYS) {
        const r = compareField(key, user[key] ?? "", fields[key] ?? "");
        if (r.status === "OK") console.log(`OK  ${r.name}`);
        else if (r.status === "OK_WHITESPACE") console.log(`OK~ ${r.name} (solo saltos/espacios)`);
        else {
          console.log(`DIFF ${r.name} (user ${r.userLen} vs parsed ${r.parsedLen})`);
          console.log(`  user:   ${JSON.stringify(r.userSnippet)}`);
          console.log(`  parsed: ${JSON.stringify(r.parsedSnippet)}`);
        }
      }
      for (const r of metaDiffs) {
        console.log(`META DIFF ${r.name} (manual tiene valor distinto al TXT)`);
        console.log(`  user:   ${JSON.stringify(r.userSnippet)}`);
        console.log(`  parsed: ${JSON.stringify(r.parsedSnippet)}`);
      }
    }

    const hexDiffs = oracleDiffs.length + metaDiffs.length;
    if (verbose) {
      console.log(
        hexDiffs
          ? `\nHex ${hexNum}: ${hexDiffs} DIFF (${oracleDiffs.length} oracle, ${metaDiffs.length} meta)`
          : `\nHex ${hexNum}: ALL OK`,
      );
    } else if (hexDiffs) {
      console.log(
        `Hex ${hexNum}: FAIL oracle=${oracleDiffs.length} meta=${metaDiffs.length} — ${[
          ...oracleDiffs,
          ...metaDiffs,
        ]
          .map((d) => d.name)
          .join(", ")}`,
      );
    } else {
      console.log(`Hex ${hexNum}: PASS`);
    }

    totalDiffs += hexDiffs;
    if (hexDiffs) process.exitCode = 1;
  }

  console.log(
    `\n=== G2 MANUAL SUMMARY: ${hexTargets.length} hex, ${totalDiffs === 0 ? "PASS" : `${totalDiffs} field diffs`} ===`,
  );
}

async function runDeterministicG2() {
  const stored = JSON.parse(readFileSync(PARSED, "utf8"));
  const fresh = await parseWilhelm64HexTxtFull();

  /** @type {Array<{ hex: number; field: string; freshLen: number; storedLen: number; snippet: string }>} */
  const mismatches = [];

  for (let n = 1; n <= 64; n++) {
    const freshFields = fresh.hexagrams[n]?.fields ?? {};
    const storedFields = stored.hexagrams[String(n)]?.fields ?? {};
    const diffs = diffFields(freshFields, storedFields, WILHELM_G2_ORACLE_KEYS);
    for (const d of diffs) {
      mismatches.push({
        hex: n,
        field: d.name,
        freshLen: d.userLen ?? 0,
        storedLen: d.parsedLen ?? 0,
        snippet: d.parsedSnippet ?? "",
      });
    }
  }

  const totalChecks = WILHELM_G2_ORACLE_KEYS.length * 64;
  const stamp = new Date().toISOString();
  const lines = [
    "# Wilhelm book-one G2 deterministic (fresh parse vs stored JSON)",
    "",
    `- Generated: ${stamp}`,
    `- Oracle fields checked: ${WILHELM_G2_ORACLE_KEYS.length} × 64 = ${totalChecks}`,
    `- Mismatches: **${mismatches.length}**`,
    "",
    mismatches.length
      ? "## Mismatches\n\n| Hex | Field | Fresh len | Stored len | Snippet |\n|-----|-------|-----------|------------|---------|"
      : "## Result\n\n**PASS** — stored JSON matches fresh TXT parse for all oracle fields.",
    "",
  ];

  if (mismatches.length) {
    for (const m of mismatches) {
      lines.push(
        `| ${m.hex} | ${m.field} | ${m.freshLen} | ${m.storedLen} | ${JSON.stringify(m.snippet).slice(0, 80)} |`,
      );
    }
  }

  mkdirSync(REPORTS, { recursive: true });
  const reportPath = join(REPORTS, "wilhelm-txt-g2-deterministic-latest.md");
  writeFileSync(reportPath, lines.join("\n"), "utf8");

  console.log(
    mismatches.length
      ? `G2 deterministic: FAIL (${mismatches.length} mismatches)`
      : `G2 deterministic: PASS (${totalChecks}/${totalChecks})`,
  );
  console.log(`Report: ${reportPath}`);
  if (mismatches.length) {
    for (const m of mismatches.slice(0, 10)) {
      console.log(`  hex ${m.hex} ${m.field}`);
    }
    process.exitCode = 1;
  }
}

/** @type {Record<number, Record<string, string>>} */
let manualGold = { ...USER_MANUAL_GOLD };

const args = process.argv.slice(2);

if (args[0] === "--deterministic") {
  await runDeterministicG2();
} else {
  /** @type {number[]} */
  let hexTargets = [];

  if (args[0] === "--tsv") {
    const tsvPath = args[1];
    if (!tsvPath) {
      console.error("Usage: node tools/audit-wilhelm-txt-g2.mjs --tsv <file.tsv>");
      process.exit(1);
    }
    const parsedTsv = parseWilhelmManualTsv(readFileSync(join(ROOT, tsvPath), "utf8"));
    manualGold = { ...manualGold, ...parsedTsv };
    hexTargets = Object.keys(parsedTsv)
      .map(Number)
      .sort((a, b) => a - b);
  } else {
    hexTargets = args.length ? args.map(Number).filter(Boolean) : [1, 2, 3];
  }

  const stored = JSON.parse(readFileSync(PARSED, "utf8"));
  runManualG2(hexTargets, manualGold, stored.hexagrams, true);
}
