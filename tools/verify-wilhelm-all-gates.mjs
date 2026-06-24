#!/usr/bin/env node
/**
 * Run all Wilhelm dataset gates (book-one + comments) for 100/100 verification.
 */
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {Array<{ name: string; cmd: string }>} */
const gates = [
  { name: "book-one parse G0/G1", cmd: "node scripts/parse-wilhelm-64hex-txt.mjs" },
  { name: "comments parse G0", cmd: "node scripts/parse-wilhelm-64hex-comments-txt.mjs" },
  { name: "book-one orphans", cmd: "node tools/audit-wilhelm-64hex-txt-orphans.mjs" },
  { name: "book-one clean verify", cmd: "node tools/verify-wilhelm-64hex-txt-clean.mjs" },
  { name: "book-one G2 deterministic", cmd: "node tools/audit-wilhelm-txt-g2.mjs --deterministic" },
  { name: "book-one G2 manual TSV", cmd: "node tools/audit-wilhelm-txt-g2.mjs --tsv tools/manual-gold/hex-1-2-3-8.tsv" },
  { name: "comments G2 deterministic", cmd: "node tools/audit-wilhelm-comments-txt-g2.mjs --deterministic" },
  { name: "book-one meta fidelity", cmd: "node tools/audit-wilhelm-book-meta-fidelity.mjs" },
  { name: "comments meta fidelity", cmd: "node tools/audit-wilhelm-book-meta-fidelity.mjs --dataset=comments" },
  { name: "hex meta gate", cmd: "node tools/audit-wilhelm-hex-meta-gate.mjs" },
  { name: "trigram Parma", cmd: "node tools/audit-wilhelm-trigram-parma.mjs" },
  { name: "audit claims", cmd: "node tools/verify-wilhelm-audit-claims.mjs" },
];

/** @type {string[]} */
const failed = [];

console.log("=== Wilhelm all-gates ===\n");

for (const gate of gates) {
  try {
    execSync(gate.cmd, { cwd: ROOT, stdio: "pipe", encoding: "utf8" });
    console.log(`PASS\t${gate.name}`);
  } catch (err) {
    const output =
      (err instanceof Error && "stdout" in err && typeof err.stdout === "string"
        ? err.stdout
        : "") +
      (err instanceof Error && "stderr" in err && typeof err.stderr === "string"
        ? err.stderr
        : "");
    console.log(`FAIL\t${gate.name}`);
    if (output.trim()) console.log(output.trim().split("\n").slice(-4).join("\n"));
    failed.push(gate.name);
  }
}

console.log(
  failed.length
    ? `\n=== RESULT: FAIL (${failed.length}/${gates.length}) — ${failed.join(", ")} ===`
    : `\n=== RESULT: PASS (${gates.length}/${gates.length}) ===`,
);

if (failed.length) process.exitCode = 1;
