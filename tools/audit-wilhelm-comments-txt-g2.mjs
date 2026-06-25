#!/usr/bin/env node

/**
 * QA code: AU-FID-W-005 wilhelm-comments-txt-g2 · v1.0.0
 * Area: tools/audit-wilhelm-comments-txt-g2
 * Family: FID-W
 */

/**
 * G2 gate (comments): fresh parse vs stored wilhelm-64hex-comments-parsed.json
 *
 * Usage:
 *   node tools/audit-wilhelm-comments-txt-g2.mjs
 *   node tools/audit-wilhelm-comments-txt-g2.mjs --deterministic
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WILHELM_COMMENTS_G2_ORACLE_KEYS,
} from "../scripts/lib/wilhelm-comments-manual-fields.mjs";
import {
  normalizeWilhelmCommentsTxtText,
  parseWilhelm64HexCommentsTxtFull,
} from "../scripts/lib/wilhelm-64hex-comments-txt.mjs";
import { WILHELM_COMMENTS_PARSED_JSON } from "../scripts/lib/wilhelm-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PARSED = WILHELM_COMMENTS_PARSED_JSON;
const REPORTS = join(ROOT, "reports");

/**
 * @param {string} name
 * @param {string} leftVal
 * @param {string} rightVal
 */
function compareField(name, leftVal, rightVal) {
  const u = normalizeWilhelmCommentsTxtText(leftVal);
  const p = normalizeWilhelmCommentsTxtText(rightVal);
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
  const fresh = await parseWilhelm64HexCommentsTxtFull();

  /** @type {Array<{ hex: number; field: string; leftLen: number; rightLen: number; snippet: string }>} */
  const mismatches = [];

  for (let n = 1; n <= 64; n++) {
    const freshFields = fresh.hexagrams[n]?.fields ?? {};
    const storedFields = stored.hexagrams[String(n)]?.fields ?? {};
    const diffs = diffFields(freshFields, storedFields, WILHELM_COMMENTS_G2_ORACLE_KEYS);
    for (const d of diffs) {
      mismatches.push({
        hex: n,
        field: d.name,
        leftLen: d.leftLen ?? 0,
        rightLen: d.rightLen ?? 0,
        snippet: d.snippet ?? "",
      });
    }
  }

  const totalChecks = WILHELM_COMMENTS_G2_ORACLE_KEYS.length * 64;
  const stamp = new Date().toISOString();
  const lines = [
    "# Wilhelm comments G2 deterministic (fresh parse vs stored JSON)",
    "",
    `- Generated: ${stamp}`,
    `- Oracle fields checked: ${WILHELM_COMMENTS_G2_ORACLE_KEYS.length} × 64 = ${totalChecks}`,
    `- Mismatches: **${mismatches.length}**`,
    "",
    mismatches.length
      ? "## Mismatches\n\n| Hex | Field | Fresh len | Stored len | Snippet |\n|-----|-------|-----------|------------|---------|"
      : "## Result\n\n**PASS** — stored JSON matches fresh TXT parse for all comment fields.",
    "",
  ];

  if (mismatches.length) {
    for (const m of mismatches) {
      lines.push(
        `| ${m.hex} | ${m.field} | ${m.leftLen} | ${m.rightLen} | ${JSON.stringify(m.snippet).slice(0, 80)} |`,
      );
    }
  }

  mkdirSync(REPORTS, { recursive: true });
  const reportPath = join(REPORTS, "wilhelm-comments-txt-g2-deterministic-latest.md");
  writeFileSync(reportPath, lines.join("\n"), "utf8");

  console.log(
    mismatches.length
      ? `G2 comments deterministic: FAIL (${mismatches.length} mismatches)`
      : `G2 comments deterministic: PASS (${totalChecks}/${totalChecks})`,
  );
  console.log(`Report: ${reportPath}`);
  if (mismatches.length) process.exitCode = 1;
}

const args = process.argv.slice(2);
if (args[0] === "--deterministic" || args.length === 0) {
  await runDeterministicG2();
} else {
  console.error("Usage: node tools/audit-wilhelm-comments-txt-g2.mjs [--deterministic]");
  process.exit(1);
}
