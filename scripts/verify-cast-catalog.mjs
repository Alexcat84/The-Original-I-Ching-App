#!/usr/bin/env node
/**
 * QA code: VF-ENG-001 cast-catalog · v1.0.0
 * Area: scripts/verify-cast-catalog
 * Family: ENG
 */
/**
 * Verifies cast-catalog.json parity with live mutation-explore motor.
 * Run: npm run verify:cast-catalog
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(
  repoRoot,
  "packages/iching-data/src/generated/cast-catalog.json",
);

async function main() {
  const enginePath = pathToFileURL(
    join(repoRoot, "packages/iching-engine/dist/mutation-explore.js"),
  ).href;
  const { buildCastCatalogEntry } = await import(enginePath);

  let raw;
  try {
    raw = JSON.parse(readFileSync(catalogPath, "utf8"));
  } catch {
    console.error(`Missing catalog: ${catalogPath}. Run npm run generate:cast-catalog first.`);
    process.exit(1);
  }

  const entries = raw.entries ?? raw;
  if (!Array.isArray(entries) || entries.length !== 4096) {
    console.error(`Expected 4096 catalog entries, got ${entries?.length ?? 0}`);
    process.exit(1);
  }

  let mismatches = 0;
  for (const row of entries) {
    const live = buildCastCatalogEntry(row.primary, row.mask);
    if (JSON.stringify(live) !== JSON.stringify(row)) {
      mismatches++;
      if (mismatches <= 5) {
        console.error(`Mismatch castIndex=${row.castIndex} primary=${row.primary} mask=${row.mask}`);
      }
    }
  }

  if (mismatches > 0) {
    console.error(`verify:cast-catalog FAILED — ${mismatches} mismatches`);
    process.exit(1);
  }

  console.log(`verify:cast-catalog OK — ${entries.length}/4096 entries match motor`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
