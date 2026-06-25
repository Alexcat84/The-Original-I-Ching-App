#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const auditDir = join(root, 'docs/auditorias');
const registry = JSON.parse(
  readFileSync(join(auditDir, 'registry.json'), 'utf8'),
);

function buildHeader(entry) {
  return `**Código:** \`${entry.code}\` · **Familia:** ${entry.family} · **Estado:** ${entry.status}\n\n`;
}

function fixCanonicalHeader(content, entry) {
  const header = buildHeader(entry);
  while (/^\*\*Código:\*\*[^\n]+\n\n/.test(content)) {
    content = content.replace(/^\*\*Código:\*\*[^\n]+\n\n/, '');
  }
  const match = content.match(/^#\s+.+\n+/);
  if (!match) return header + content;
  const insertAt = match.index + match[0].length;
  return content.slice(0, insertAt) + header + content.slice(insertAt);
}

for (const entry of registry.entries) {
  if (!entry.path?.startsWith('docs/auditorias/')) continue;
  const canonical = join(root, entry.path);
  if (!existsSync(canonical)) continue;

  let content = readFileSync(canonical, 'utf8');
  if (content.includes('(renamed)')) continue;

  content = fixCanonicalHeader(content, entry);
  writeFileSync(canonical, content, 'utf8');
}

for (const entry of registry.entries) {
  if (!entry.path?.startsWith('docs/auditorias/')) continue;
  const codedName = basename(entry.path);

  for (const name of readdirSync(auditDir)) {
    if (name === codedName || name === 'INDEX.md' || name === 'CONVENTIONS.md' || name === 'README.md')
      continue;
    const p = join(auditDir, name);
    let stub = readFileSync(p, 'utf8');
    if (!stub.includes('(renamed)') || !stub.includes(`./${codedName}`)) continue;

    stub = stub.replace(
      /\*\*Legacy filename:\*\* `[^`]+`/,
      `**Legacy filename:** \`${name}\``,
    );
    writeFileSync(p, stub, 'utf8');
  }
}

console.log('fix-audit-redirect-stubs OK');
