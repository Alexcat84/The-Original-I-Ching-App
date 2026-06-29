#!/usr/bin/env node
/**
 * QA code: VF-FID-W-014 wilhelm-de-all-gates · v1.0.0
 * Area: tools/verify-wilhelm-de-all-gates.mjs
 * Family: FID-W
 */
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateWilhelmDe64HexStructure } from "../scripts/lib/wilhelm-de-64hex-txt.mjs";
import { WILHELM_DE_BOOK_ONE_MERGED } from "../scripts/lib/wilhelm-de-dataset-paths.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", shell: true });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status ?? 1;
}

async function main() {
  let failed = 0;

  const merged = JSON.parse(await readFile(WILHELM_DE_BOOK_ONE_MERGED, "utf8"));
  const pseudoParsed = {
    hexagrams: Object.fromEntries(
      Object.entries(merged.hexagrams).map(([n, h]) => [n, { fields: h.fields }]),
    ),
  };
  const g0 = validateWilhelmDe64HexStructure(pseudoParsed);
  console.log(`G0 merged structure: ${g0.pass ? "PASS" : "FAIL"}`);
  if (!g0.pass) {
    failed++;
    for (const e of g0.errors.slice(0, 10)) console.log(`  ${e}`);
  }

  if (run("npm", ["run", "verify:hexagram-fidelity:wilhelm-de"]) !== 0) failed++;

  console.log(failed === 0 ? "verify:wilhelm-de-all-gates PASS" : "verify:wilhelm-de-all-gates FAIL");
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
