#!/usr/bin/env node
/**
 * Injects or refreshes mandatory QA header blocks from docs/qa/registry.json.
 *
 * QA code: GEN-DOC-003 inject-qa-headers · v1.0.0
 * Area: scripts/inject-qa-headers
 * Family: DOC
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const QA_HEADER_BLOCK_RE = /\/\*\*\n \* QA code:[\s\S]*?\*\/\n/;

/** @param {{ code: string; version: string; area: string; family: string }} entry */
export function buildQaHeader(entry) {
  return `/**\n * QA code: ${entry.code} · v${entry.version}\n * Area: ${entry.area}\n * Family: ${entry.family}\n */\n`;
}

/** @param {string} content @param {{ code: string; version: string; area: string; family: string }} entry */
export function injectQaHeader(content, entry) {
  content = content.replace(/\r\n/g, '\n');

  let shebang = '';
  if (content.startsWith('#!')) {
    const idx = content.indexOf('\n');
    shebang = content.slice(0, idx + 1);
    content = content.slice(idx + 1).replace(/^\n/, '');
  }

  content = content.replace(QA_HEADER_BLOCK_RE, '');
  const header = buildQaHeader(entry);
  const body = content.replace(/^\n+/, '');
  return shebang + (shebang ? '\n' : '') + header + (body ? `\n${body}` : '');
}

/** @param {string} content @param {{ code: string; version: string; area: string; family: string }} entry */
export function validateQaHeader(content, entry) {
  if (!content.includes(`QA code: ${entry.code}`)) {
    return `missing "QA code: ${entry.code}"`;
  }
  if (!content.includes(`Area: ${entry.area}`)) {
    return `missing "Area: ${entry.area}"`;
  }
  if (!content.includes(`Family: ${entry.family}`)) {
    return `missing "Family: ${entry.family}"`;
  }
  if (!content.includes(`· v${entry.version}`)) {
    return `missing version v${entry.version}`;
  }
  return null;
}

const HEADER_EXEMPT_PATHS = new Set(['package.json']);

/** @param {string} rootDir @param {{ dryRun?: boolean }} [options] */
export function injectAllQaHeaders(rootDir, options = {}) {
  const dryRun = options.dryRun ?? false;
  const registry = JSON.parse(readFileSync(join(rootDir, 'docs/qa/registry.json'), 'utf8'));
  let updated = 0;
  let skipped = 0;

  for (const entry of registry.entries ?? []) {
    if (!entry.path || HEADER_EXEMPT_PATHS.has(entry.path)) {
      skipped += 1;
      continue;
    }

    const fullPath = join(rootDir, entry.path);
    if (!existsSync(fullPath)) {
      console.warn(`skip missing path: ${entry.path}`);
      skipped += 1;
      continue;
    }

    const before = readFileSync(fullPath, 'utf8');
    const after = injectQaHeader(before, entry);
    const headerError = validateQaHeader(after, entry);

    if (headerError) {
      throw new Error(`inject failed for ${entry.path}: ${headerError}`);
    }

    if (before !== after) {
      updated += 1;
      if (!dryRun) writeFileSync(fullPath, after, 'utf8');
    }
  }

  return { updated, skipped, dryRun };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const dryRun = process.argv.includes('--dry-run');
  try {
    const { updated, skipped } = injectAllQaHeaders(root, { dryRun });
    console.log(
      `inject-qa-headers OK — ${updated} updated, ${skipped} skipped${dryRun ? ' (dry-run)' : ''}`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
