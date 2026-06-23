#!/usr/bin/env node
/**
 * G2 gate: fresh Legge TXT parse vs stored legge-64hex-parsed.json
 *
 * Usage:
 *   node tools/audit-legge-txt-g2.mjs --deterministic
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LEGGE_G2_ORACLE_KEYS,
} from "../scripts/lib/legge-manual-fields.mjs";
import {
  normalizeLeggeTxtText,
  parseLegge64HexTxtFull,
} from "../scripts/lib/legge-64hex-txt.mjs";
import { LEGGE_BOOK_ONE_PARSED_JSON } from "../scripts/lib/legge-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PARSED = LEGGE_BOOK_ONE_PARSED_JSON;
const REPORTS = join(ROOT, "reports");

/**
 * @param {string} name
 * @param {string} leftVal
 * @param {string} rightVal
 */
function compareField(name, leftVal, rightVal) {
  const u = normalizeLeggeTxtText(leftVal);
  const p = normalizeLeggeTxtText(rightVal);
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
    leftLen: u.length,
    rightLen: p.length,
    snippet: p.slice(Math.max(0, diffAt - 30), diffAt + 90),
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

async function runDeterministicG2() {
  const stored = JSON.parse(readFileSync(PARSED, "utf8"));
  const fresh = await parseLegge64HexTxtFull();

  /** @type {Array<{ hex: number; field: string; freshLen: number; storedLen: number; snippet: string }>} */
  const mismatches = [];

  for (let n = 1; n <= 64; n++) {
    const freshFields = fresh.hexagrams[n]?.fields ?? {};
    const storedFields = stored.hexagrams[String(n)]?.fields ?? {};
    const diffs = diffFields(freshFields, storedFields, LEGGE_G2_ORACLE_KEYS);
    for (const d of diffs) {
      mismatches.push({
        hex: n,
        field: d.name,
        freshLen: d.leftLen ?? 0,
        storedLen: d.rightLen ?? 0,
        snippet: d.snippet ?? "",
      });
    }
  }

  const totalChecks = LEGGE_G2_ORACLE_KEYS.length * 64;
  const stamp = new Date().toISOString();
  const lines = [
    "# Legge book-one G2 deterministic (fresh parse vs stored JSON)",
    "",
    `- Generated: ${stamp}`,
    `- Oracle fields checked: ${LEGGE_G2_ORACLE_KEYS.length} × 64 = ${totalChecks}`,
    `- Mismatches: **${mismatches.length}**`,
    "",
    mismatches.length
      ? "## Mismatches\n\n| Hex | Field | Fresh len | Stored len | Snippet |"
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
  const reportPath = join(REPORTS, "legge-txt-g2-deterministic-latest.md");
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

const args = process.argv.slice(2);
if (args[0] === "--deterministic") {
  await runDeterministicG2();
} else {
  console.error("Usage: node tools/audit-legge-txt-g2.mjs --deterministic");
  process.exit(1);
}
