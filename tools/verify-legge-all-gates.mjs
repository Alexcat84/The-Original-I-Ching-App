#!/usr/bin/env node

/**
 * QA code: VF-FID-L-001 legge-all-gates · v1.0.0
 * Area: tools/verify-legge-all-gates
 * Family: FID-L
 */

/**
 * Run Legge TXT dataset gates (book-one + appendix draft).
 */
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** @type {Array<{ name: string; cmd: string; soft?: boolean }>} */
const gates = [
  { name: "book-one parse G0/G1", cmd: "node scripts/parse-legge-64hex-txt.mjs" },
  { name: "book-one meta fidelity", cmd: "node tools/audit-legge-book-meta-fidelity.mjs" },
  { name: "appendix parse G0", cmd: "node scripts/parse-legge-appendix-txt.mjs" },
  { name: "book-one G2 deterministic", cmd: "node tools/audit-legge-txt-g2.mjs --deterministic" },
];

/** @type {string[]} */
const failed = [];
/** @type {string[]} */
const softFailed = [];

console.log("=== Legge all-gates ===\n");

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
    console.log(`${gate.soft ? "SOFT-FAIL" : "FAIL"}\t${gate.name}`);
    if (output.trim()) console.log(output.trim().split("\n").slice(-6).join("\n"));
    if (gate.soft) softFailed.push(gate.name);
    else failed.push(gate.name);
  }
}

console.log(
  failed.length
    ? `\n=== RESULT: FAIL (${failed.length}/${gates.length}) — ${failed.join(", ")} ===`
    : softFailed.length
      ? `\n=== RESULT: PASS with G1 soft-fail (${softFailed.join(", ")}) — expected until runtime ingest ===`
      : `\n=== RESULT: PASS (${gates.length}/${gates.length}) ===`,
);

if (failed.length) process.exitCode = 1;
