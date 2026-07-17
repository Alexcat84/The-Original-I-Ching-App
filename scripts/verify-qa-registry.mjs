#!/usr/bin/env node

/**
 * QA code: VF-DOC-002 qa-registry-integrity · v1.4.0
 * Area: scripts/verify-qa-registry
 * Family: DOC
 */

/**
 * Validates docs/auditorias/registry.json, docs/qa/registry.json, docs/registry.json:
 * - unique codes, paths exist, cross-refs, mandatory `area` on QA entries
 * - mandatory QA header blocks in registered source files
 * - orphan *.test.ts files and unregistered npm gate scripts
 *
 * QA code: VF-DOC-002 qa-registry-integrity · v1.4.0
 * Area: scripts/verify-qa-registry
 * Family: DOC
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateQaHeader } from './inject-qa-headers.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const HEADER_EXEMPT_PATHS = new Set(['package.json']);
const TEST_ROOTS = ['apps', 'packages', 'backend'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.turbo', '.next', 'build']);
const GATE_PREFIXES = ['verify:', 'qa:', 'audit:', 'i18n:', 'generate:'];

function loadJson(relPath) {
  return JSON.parse(readFileSync(join(root, relPath), 'utf8'));
}

function fail(errors) {
  console.error('verify:qa-registry FAILED\n');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

/** @param {string} dir @param {string} base */
function walkTestFiles(dir, base) {
  /** @type {string[]} */
  const results = [];
  if (!existsSync(dir)) return results;

  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const rel = `${base}/${name}`;
    const full = join(root, rel);
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...walkTestFiles(full, rel));
    } else if (name.endsWith('.test.ts')) {
      results.push(rel.replace(/\\/g, '/'));
    }
  }
  return results;
}

const errors = [];

for (const rel of ['docs/auditorias/registry.json', 'docs/qa/registry.json', 'docs/registry.json']) {
  const data = loadJson(rel);
  const list = data.entries ?? [];
  const codes = new Set();
  for (const entry of list) {
    if (!entry.code) {
      errors.push(`${rel}: entry missing code (${entry.path ?? 'unknown'})`);
      continue;
    }
    if (codes.has(entry.code)) {
      errors.push(`${rel}: duplicate code ${entry.code}`);
    }
    codes.add(entry.code);

    if (entry.path && !entry.path.startsWith('package.json')) {
      if (!existsSync(join(root, entry.path))) {
        errors.push(`${rel}: missing path ${entry.path} for ${entry.code}`);
      }
    }
  }
}

const audits = loadJson('docs/auditorias/registry.json');
const tests = loadJson('docs/qa/registry.json');
const exempt = loadJson('docs/qa/exempt-paths.json');
const exemptPaths = new Set([
  ...(exempt.maintenanceScripts ?? []),
  ...(exempt.dataPipelineScripts ?? []),
  ...(exempt.archivedScripts ?? []),
]);

const auditCodes = new Set(audits.entries.map((e) => e.code.split(' ')[0]));
const testCodes = new Set(tests.entries.map((e) => e.code.split(' ')[0]));
const registeredPaths = new Set(tests.entries.map((e) => e.path).filter(Boolean));
const docs = loadJson('docs/registry.json');
const docCodes = new Set((docs.entries ?? []).map((e) => e.code.split(' ')[0]));
const allDocCodes = new Set([...auditCodes, ...docCodes]);

for (const entry of audits.entries) {
  for (const ref of entry.relatedTests ?? []) {
    const key = ref.split(' ')[0];
    if (!testCodes.has(key)) {
      errors.push(`audit ${entry.code}: unknown relatedTest ${ref}`);
    }
  }
}

for (const entry of tests.entries) {
  if (!entry.area || typeof entry.area !== 'string' || !entry.area.trim()) {
    errors.push(`qa ${entry.code}: missing required field "area"`);
  }
  if (!entry.version || !Array.isArray(entry.versionHistory) || entry.versionHistory.length === 0) {
    errors.push(`qa ${entry.code}: missing version or versionHistory`);
  }
  for (const ref of entry.relatedAuditCodes ?? []) {
    const key = ref.split(' ')[0];
    if (!auditCodes.has(key)) {
      errors.push(`test ${entry.code}: unknown relatedAuditCode ${ref}`);
    }
  }

  if (!entry.path || HEADER_EXEMPT_PATHS.has(entry.path)) continue;
  const fullPath = join(root, entry.path);
  if (!existsSync(fullPath)) continue;

  const headerError = validateQaHeader(readFileSync(fullPath, 'utf8'), entry);
  if (headerError) {
    errors.push(`qa ${entry.code} (${entry.path}): ${headerError}`);
  }
}

for (const entry of docs.entries ?? []) {
  for (const ref of entry.relatedTests ?? []) {
    const key = ref.split(' ')[0];
    if (!testCodes.has(key)) {
      errors.push(`docs ${entry.code}: unknown relatedTest ${ref}`);
    }
  }
  for (const ref of entry.relatedCodes ?? []) {
    const key = ref.split(' ')[0];
    if (!allDocCodes.has(key)) {
      errors.push(`docs ${entry.code}: unknown relatedCode ${ref}`);
    }
  }
}

const registryTestPaths = new Set(
  tests.entries.map((e) => e.path).filter((p) => typeof p === 'string' && p.endsWith('.test.ts')),
);

for (const testRoot of TEST_ROOTS) {
  for (const testPath of walkTestFiles(join(root, testRoot), testRoot)) {
    if (!registryTestPaths.has(testPath)) {
      errors.push(`orphan test file not in docs/qa/registry.json: ${testPath}`);
    }
  }
}

// Orphan coded-doc check (added 2026-07-17, docs sweep): every *.md in the doc
// trees whose FILENAME carries a code prefix (YYYYMMDD-TYPE-FAMILY-...) must be
// in a registry. Legacy redirect stubs ("(renamed)" marker) and
// README/CONVENTIONS/INDEX/MEMORY/CHANGELOG are exempt. Closes the gap where a
// coded doc could sit unregistered and still pass the gate.
const registeredDocPaths = new Set(
  [...audits.entries, ...(docs.entries ?? [])]
    .map((e) => e.path)
    .filter(Boolean)
    .map((p) => p.replace(/\\/g, '/')),
);
const CODED_FILENAME = /\/(\d{8})-[A-Z]+-[A-Z0-9]+/;
const DOC_EXEMPT = /(README|CONVENTIONS|INDEX|MEMORY|CHANGELOG)\.md$/i;
/** @param {string} dir @param {string} base */
function walkDocFiles(dir, base) {
  /** @type {string[]} */
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const rel = `${base}/${name}`;
    const st = statSync(join(root, rel));
    if (st.isDirectory()) out.push(...walkDocFiles(join(root, rel), rel));
    else if (name.endsWith('.md')) out.push(rel.replace(/\\/g, '/'));
  }
  return out;
}
for (const md of walkDocFiles(join(root, 'docs'), 'docs')) {
  if (DOC_EXEMPT.test(md)) continue;
  if (!CODED_FILENAME.test('/' + md.split('/').pop())) continue;
  if (registeredDocPaths.has(md)) continue;
  const head = readFileSync(join(root, md), 'utf8').slice(0, 300);
  if (head.includes('(renamed)')) continue; // legacy redirect stub
  errors.push(`coded doc not in any registry: ${md}`);
}

const pkg = loadJson('package.json');
for (const [name, cmd] of Object.entries(pkg.scripts ?? {})) {
  if ((exempt.npmScriptExempt ?? []).includes(name)) continue;
  if ((exempt.npmPrefixExempt ?? []).some((p) => name.startsWith(p))) continue;
  if (!GATE_PREFIXES.some((p) => name.startsWith(p))) continue;

  const match = cmd.match(/node\s+([^\s&]+)/);
  if (!match) continue;

  const scriptPath = match[1].replace(/^\.\//, '');
  if (registeredPaths.has(scriptPath) || exemptPaths.has(scriptPath)) continue;
  errors.push(`npm script "${name}" points to unregistered path ${scriptPath}`);
}

if (errors.length) fail(errors);

const docsCount = (docs.entries ?? []).length;
console.log(
  `verify:qa-registry OK — ${audits.entries.length} audits, ${tests.entries.length} tests, ${docsCount} docs`,
);
