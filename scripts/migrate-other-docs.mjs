#!/usr/bin/env node
/**
 * Renames coded docs (runbooks, plans, workflows, etc.) and adds headers + redirect stubs.
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsRegistryPath = join(root, 'docs/registry.json');
const auditRegistryPath = join(root, 'docs/auditorias/registry.json');
const docsRegistry = JSON.parse(readFileSync(docsRegistryPath, 'utf8'));
const auditRegistry = JSON.parse(readFileSync(auditRegistryPath, 'utf8'));

function codeToFilename(code) {
  const space = code.indexOf(' ');
  return space === -1 ? `${code}.md` : `${code.slice(0, space)}-${code.slice(space + 1)}.md`;
}

function buildHeader(entry) {
  return `**Código:** \`${entry.code}\` · **Familia:** ${entry.family} · **Estado:** ${entry.status}\n\n`;
}

function insertHeaderAfterH1(content, entry) {
  const header = buildHeader(entry);
  while (/^\*\*Código:\*\*[^\n]+\n\n/.test(content)) {
    content = content.replace(/^\*\*Código:\*\*[^\n]+\n\n/, '');
  }
  const match = content.match(/^#\s+.+\n+/);
  if (!match) return header + content;
  const insertAt = match.index + match[0].length;
  return content.slice(0, insertAt) + header + content.slice(insertAt);
}

const renameMap = new Map();

for (const entry of docsRegistry.entries) {
  if (!entry.path?.startsWith('docs/')) continue;
  if (entry.path.includes('registry.json') || entry.path.endsWith('INDEX.md') || entry.path.endsWith('CONVENTIONS.md') || entry.path.endsWith('README.md')) continue;

  const oldPath = join(root, entry.path);
  if (!existsSync(oldPath)) {
    console.warn(`skip missing: ${entry.path}`);
    continue;
  }

  const newName = codeToFilename(entry.code);
  const dir = dirname(oldPath);
  const newPath = join(dir, newName);
  const newRel = newPath.replace(/\\/g, '/').replace(`${root.replace(/\\/g, '/')}/`, '');

  let content = readFileSync(oldPath, 'utf8');
  if (content.includes('(renamed)')) continue;

  content = insertHeaderAfterH1(content, entry);

  if (basename(oldPath) === newName) {
    writeFileSync(oldPath, content, 'utf8');
    entry.path = newRel;
    continue;
  }

  writeFileSync(newPath, content, 'utf8');
  const stub = `# ${entry.title} (renamed)

${buildHeader(entry)}> **Canonical path:** [\`${newName}\`](./${newName})

This file keeps the legacy filename for backward-compatible links. Do not edit here; update the canonical document.

**Legacy filename:** \`${basename(oldPath)}\`
`;
  writeFileSync(oldPath, stub, 'utf8');
  renameMap.set(basename(oldPath), newName);
  entry.path = newRel;

  for (const auditEntry of auditRegistry.entries) {
    if (auditEntry.code === entry.code) {
      auditEntry.path = newRel;
    }
  }
}

docsRegistry.updatedAt = new Date().toISOString().slice(0, 10);
writeFileSync(docsRegistryPath, `${JSON.stringify(docsRegistry, null, 2)}\n`, 'utf8');
auditRegistry.updatedAt = docsRegistry.updatedAt;
writeFileSync(auditRegistryPath, `${JSON.stringify(auditRegistry, null, 2)}\n`, 'utf8');

const skipDirs = new Set(['node_modules', '.git', 'reports', '.next', 'android', 'dist']);
const exts = new Set(['.md', '.tsx', '.ts', '.mjs', '.js', '.json']);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (skipDirs.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else {
      const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
      if (exts.has(ext)) files.push(p);
    }
  }
  return files;
}

let linkUpdates = 0;
for (const file of walk(root)) {
  if (file.includes('migrate-other-docs.mjs')) continue;
  let text = readFileSync(file, 'utf8');
  let changed = false;
  for (const [oldName, newName] of renameMap) {
    if (text.includes(oldName)) {
      text = text.split(oldName).join(newName);
      changed = true;
    }
  }
  if (changed) {
    writeFileSync(file, text, 'utf8');
    linkUpdates++;
  }
}

console.log(`migrate-other-docs OK — ${renameMap.size} renames, ${linkUpdates} files updated`);
