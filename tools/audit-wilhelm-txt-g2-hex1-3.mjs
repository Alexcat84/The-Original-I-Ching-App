#!/usr/bin/env node
/**
 * G2 gate: manual gold (hex 1–3) vs wilhelm-64hex-parsed.json
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { WILHELM_G2_META_TXT_KEYS, WILHELM_G2_ORACLE_KEYS } from "../scripts/lib/wilhelm-manual-fields.mjs";
import { normalizeWilhelmTxtText } from "../scripts/lib/wilhelm-64hex-txt.mjs";

import { WILHELM_BOOK_ONE_PARSED_JSON } from "../scripts/lib/wilhelm-dataset-paths.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PARSED = WILHELM_BOOK_ONE_PARSED_JSON;

/** Manual gold from user Sheets (2026-06-23) */
import { USER_MANUAL_GOLD } from "./wilhelm-manual-gold-hex1-3.mjs";

/**
 * @param {string} a
 * @param {string} b
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

const parsed = JSON.parse(readFileSync(PARSED, "utf8"));
const compareKeys = [...WILHELM_G2_ORACLE_KEYS, ...WILHELM_G2_META_TXT_KEYS];

for (const hexNum of [1, 2, 3]) {
  const user = USER_MANUAL_GOLD[hexNum];
  const fields = parsed.hexagrams[String(hexNum)]?.fields;
  if (!user || !fields) {
    console.error(`Missing data for hex ${hexNum}`);
    process.exitCode = 1;
    continue;
  }

  console.log(`\n=== G2 HEX ${hexNum} manual vs TXT parsed ===\n`);
  /** @type {string[]} */
  const diffs = [];
  for (const key of compareKeys) {
    const userVal = user[key] ?? "";
    if (WILHELM_G2_META_TXT_KEYS.includes(key) && !String(userVal).trim()) continue;
    const r = compareField(key, userVal, fields[key] ?? "");
    if (r.status === "OK") console.log(`OK  ${r.name}`);
    else if (r.status === "OK_WHITESPACE") console.log(`OK~ ${r.name} (solo saltos/espacios)`);
    else {
      console.log(`DIFF ${r.name} (user ${r.userLen} vs parsed ${r.parsedLen})`);
      console.log(`  user:   ${JSON.stringify(r.userSnippet)}`);
      console.log(`  parsed: ${JSON.stringify(r.parsedSnippet)}`);
      diffs.push(r.name);
    }
  }
  console.log(diffs.length ? `\nHex ${hexNum}: ${diffs.length} DIFF` : `\nHex ${hexNum}: ALL OK`);
  if (diffs.length) process.exitCode = 1;
}
