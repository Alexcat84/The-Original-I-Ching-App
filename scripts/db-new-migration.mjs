#!/usr/bin/env node
/**
 * Create the next numbered migration in backend/db/migrations/.
 * Usage: node scripts/db-new-migration.mjs <slug>
 * Example: node scripts/db-new-migration.mjs add_foo_column
 */
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const slug = process.argv[2]?.trim().replace(/[^a-z0-9_]/gi, "_").toLowerCase();
if (!slug) {
  console.error("Usage: node scripts/db-new-migration.mjs <slug>");
  console.error("Example: node scripts/db-new-migration.mjs add_foo_column");
  process.exit(1);
}

const migrationsDir = join(process.cwd(), "backend", "db", "migrations");
const files = readdirSync(migrationsDir).filter((f) => /^\d{3}_.+\.sql$/.test(f));

let maxNum = 0;
for (const file of files) {
  const num = Number.parseInt(file.slice(0, 3), 10);
  if (Number.isFinite(num) && num > maxNum) maxNum = num;
}

const nextNum = String(maxNum + 1).padStart(3, "0");
const filename = `${nextNum}_${slug}.sql`;
const filepath = join(migrationsDir, filename);

if (existsSync(filepath)) {
  console.error(`Migration already exists: ${filename}`);
  process.exit(1);
}

const template = `-- Migration ${nextNum}: ${slug.replace(/_/g, " ")}
-- Apply via: npm run db:apply -- ${filename}
-- Verify via: npm run db:verify (remote SQL Editor or MCP execute_sql)

BEGIN;

-- TODO: schema change

COMMIT;
`;

writeFileSync(filepath, template, "utf8");
console.log(`Created ${filepath}`);
console.log(`Next: edit SQL, run advisors, then apply with npm run db:apply -- ${filename}`);
