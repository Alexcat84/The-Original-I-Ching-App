#!/usr/bin/env node
/**
 * Migrates audit docs: rename to coded filenames, add headers, redirect stubs.
 * QA code: VF-DOC-003 audit-doc-migrate · v1.0.0
 */
import {
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const auditDir = join(root, 'docs/auditorias');
const registryPath = join(auditDir, 'registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

function codeToFilename(code) {
  const space = code.indexOf(' ');
  if (space === -1) return `${code}.md`;
  return `${code.slice(0, space)}-${code.slice(space + 1)}.md`;
}

function buildHeader(entry) {
  return `**Código:** \`${entry.code}\` · **Familia:** ${entry.family} · **Estado:** ${entry.status}\n\n`;
}

function hasCodeHeader(content, code) {
  return content.includes('**Código:**') && content.includes(entryCodePrefix(code));
}

function entryCodePrefix(code) {
  return code.split(' ')[0];
}

const renameMap = new Map();

for (const entry of registry.entries) {
  if (!entry.path?.startsWith('docs/auditorias/')) continue;
  if (entry.path.endsWith('INDEX.md') || entry.path.endsWith('CONVENTIONS.md')) continue;

  const oldPath = join(root, entry.path);
  if (!existsSync(oldPath)) {
    console.warn(`skip missing: ${entry.path}`);
    continue;
  }

  const newName = codeToFilename(entry.code);
  const newRel = `docs/auditorias/${newName}`;
  const newPath = join(root, newRel);

  if (basename(oldPath) === newName) {
    renameMap.set(basename(oldPath), newName);
    entry.path = newRel;
    let content = readFileSync(oldPath, 'utf8');
    if (!hasCodeHeader(content, entry.code)) {
      content = insertHeader(content, entry);
      writeFileSync(oldPath, content, 'utf8');
    }
    continue;
  }

  let content = readFileSync(oldPath, 'utf8');
  if (!hasCodeHeader(content, entry.code)) {
    content = insertHeader(content, entry);
  }

  writeFileSync(newPath, content, 'utf8');
  writeRedirectStub(oldPath, entry, newRel);
  renameMap.set(basename(oldPath), newName);
  entry.path = newRel;
}

function insertHeader(content, entry) {
  const header = buildHeader(entry);
  const match = content.match(/^#\s+.+\n+/);
  if (!match) return header + content;
  const insertAt = match.index + match[0].length;
  return content.slice(0, insertAt) + header + content.slice(insertAt);
}

function writeRedirectStub(oldPath, entry, newRel) {
  const title = entry.title;
  const stub = `# ${title} (renamed)

${buildHeader(entry)}> **Canonical path:** [\`${basename(newRel)}\`](./${basename(newRel)})

This file keeps the legacy filename for backward-compatible links. Do not edit here; update the canonical document.

**Legacy filename:** \`${basename(oldPath)}\`
`;
  writeFileSync(oldPath, stub, 'utf8');
}

registry.updatedAt = new Date().toISOString().slice(0, 10);
writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

// Update links across repo
const exts = new Set(['.md', '.tsx', '.ts', '.mjs', '.js', '.json', '.canvas.tsx']);
const skipDirs = new Set(['node_modules', '.git', 'reports', '.next', 'android', 'dist']);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (skipDirs.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else {
      const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
      if (exts.has(ext) || name.endsWith('.canvas.tsx')) files.push(p);
    }
  }
  return files;
}

let linkUpdates = 0;
for (const file of walk(root)) {
  if (file.includes('migrate-audit-docs.mjs')) continue;
  let text = readFileSync(file, 'utf8');
  let changed = false;
  for (const [oldName, newName] of renameMap) {
    if (oldName === newName) continue;
    const patterns = [oldName, oldName.replace(/_/g, '\\_')];
    for (const old of patterns) {
      if (text.includes(oldName)) {
        const next = text.split(oldName).join(newName);
        if (next !== text) {
          text = next;
          changed = true;
        }
      }
    }
  }
  if (changed) {
    writeFileSync(file, text, 'utf8');
    linkUpdates++;
  }
}

console.log(
  `migrate-audit-docs OK — ${renameMap.size} entries, ${linkUpdates} files updated`,
);
