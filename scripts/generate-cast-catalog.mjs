#!/usr/bin/env node
/**
 * QA code: GEN-ENG-001 cast-catalog · v1.0.0
 * Area: scripts/generate-cast-catalog
 * Family: ENG
 */
/**
 * Generates packages/iching-data/src/generated/cast-catalog.json (4096 entries).
 * Run: npm run generate:cast-catalog
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const enginePath = pathToFileURL(
    join(repoRoot, "packages/iching-engine/dist/mutation-explore.js"),
  ).href;
  const { buildCastCatalogEntry } = await import(enginePath);

  const entries = [];
  for (let primary = 1; primary <= 64; primary++) {
    for (let mask = 0; mask < 64; mask++) {
      entries.push(buildCastCatalogEntry(primary, mask));
    }
  }

  if (entries.length !== 4096) {
    throw new Error(`Expected 4096 entries, got ${entries.length}`);
  }

  const outPath = join(
    repoRoot,
    "packages/iching-data/src/generated/cast-catalog.json",
  );
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify({ schemaVersion: 1, entries }, null, 2)}\n`, "utf8");
  console.log(`Wrote ${entries.length} cast catalog entries → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
