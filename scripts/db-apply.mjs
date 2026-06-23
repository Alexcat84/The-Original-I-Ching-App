#!/usr/bin/env node
/**
 * Print migration SQL for apply via Supabase MCP or SQL Editor.
 * Does not execute against remote — keeps review step explicit.
 *
 * Usage: node scripts/db-apply.mjs 075_my_migration.sql
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const arg = process.argv[2]?.trim();
if (!arg) {
  console.error("Usage: node scripts/db-apply.mjs <NNN_slug.sql>");
  process.exit(1);
}

const filename = arg.endsWith(".sql") ? arg : `${arg}.sql`;
const filepath = join(process.cwd(), "backend", "db", "migrations", filename);

if (!existsSync(filepath)) {
  console.error(`Not found: ${filepath}`);
  process.exit(1);
}

const sql = readFileSync(filepath, "utf8");
const name = filename.replace(/^\d{3}_/, "").replace(/\.sql$/, "");

console.log("--- Migration apply checklist ---");
console.log(`File: backend/db/migrations/${filename}`);
console.log(`MCP name: ${name}`);
console.log("");
console.log("1. Review SQL below");
console.log("2. Run get_advisors(security) + get_advisors(performance) on project");
console.log("3. Apply with Supabase MCP apply_migration OR SQL Editor");
console.log("4. Run verify_migrations.sql checks relevant to this change");
console.log("");
console.log("--- SQL ---");
console.log(sql);
