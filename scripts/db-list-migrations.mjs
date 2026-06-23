#!/usr/bin/env node
/**
 * List local numbered migrations (backend/db/migrations).
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = join(process.cwd(), "backend", "db", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => /^\d{3}_.+\.sql$/.test(f))
  .sort();

console.log(`Local migrations (${files.length}):`);
for (const file of files) {
  console.log(`  ${file}`);
}

const latest = files.at(-1);
if (latest) {
  console.log(`\nLatest: ${latest}`);
  console.log(`Next number: ${String(Number.parseInt(latest.slice(0, 3), 10) + 1).padStart(3, "0")}`);
}
