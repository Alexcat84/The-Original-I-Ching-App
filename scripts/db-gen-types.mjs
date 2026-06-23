#!/usr/bin/env node
/**
 * Generate TypeScript types from linked Supabase project.
 * Requires: npx supabase login && npx supabase link --project-ref wgborqkfnxfarkdaotsd
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_REF = "wgborqkfnxfarkdaotsd";
const outDir = join(process.cwd(), "packages", "database-types", "src");
const outFile = join(outDir, "database.types.ts");

mkdirSync(outDir, { recursive: true });

const result = spawnSync(
  "npx",
  ["supabase", "gen", "types", "typescript", "--project-id", PROJECT_REF],
  { encoding: "utf8", shell: true },
);

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  console.error("\nIf not linked yet, run:");
  console.error("  npx supabase login");
  console.error(`  npx supabase link --project-ref ${PROJECT_REF}`);
  process.exit(result.status ?? 1);
}

writeFileSync(outFile, result.stdout, "utf8");
console.log(`Wrote ${outFile}`);
