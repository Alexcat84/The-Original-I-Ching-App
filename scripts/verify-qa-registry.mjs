#!/usr/bin/env node
/**
 * Validates docs/auditorias/registry.json and docs/qa/registry.json:
 * - unique codes
 * - paths exist (when under repo)
 * - cross-ref audit ↔ test codes resolve
 *
 * QA code: VF-DOC-002 qa-registry-integrity · v1.0.0
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadJson(relPath) {
  const full = join(root, relPath);
  return JSON.parse(readFileSync(full, 'utf8'));
}

function fail(errors) {
  console.error('verify:qa-registry FAILED\n');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
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
      const p = join(root, entry.path);
      if (!existsSync(p)) {
        errors.push(`${rel}: missing path ${entry.path} for ${entry.code}`);
      }
    }
  }
}

const audits = loadJson('docs/auditorias/registry.json');
const tests = loadJson('docs/qa/registry.json');

const auditCodes = new Set(audits.entries.map((e) => e.code.split(' ')[0]));
const testCodes = new Set(tests.entries.map((e) => e.code.split(' ')[0]));
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
  for (const ref of entry.relatedAuditCodes ?? []) {
    const key = ref.split(' ')[0];
    if (!auditCodes.has(key)) {
      errors.push(`test ${entry.code}: unknown relatedAuditCode ${ref}`);
    }
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

if (errors.length) fail(errors);

const docsCount = (docs.entries ?? []).length;
console.log(
  `verify:qa-registry OK — ${audits.entries.length} audits, ${tests.entries.length} tests, ${docsCount} docs`,
);
