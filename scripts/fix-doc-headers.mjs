#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function buildHeader(entry) {
  return `**Código:** \`${entry.code}\` · **Familia:** ${entry.family} · **Estado:** ${entry.status}\n\n`;
}

function fixHeader(content, entry) {
  if (content.includes('(renamed)')) return content;

  content = content.replace(/\r\n/g, '\n');
  const header = buildHeader(entry);
  const h1Match = content.match(/^#\s+.+\n/m);
  if (!h1Match || h1Match.index === undefined) {
    return header + content.replace(/^\*\*Código:\*\*[^\n]+\n+/g, '');
  }

  const beforeH1 = content.slice(0, h1Match.index);
  const fromH1 = content.slice(h1Match.index);
  const cleanedBefore = beforeH1.replace(/^\*\*Código:\*\*[^\n]+\n+/g, '');
  const body = cleanedBefore + fromH1;

  // Remove duplicate código block immediately after H1 if present
  const withoutDup = body.replace(
    /^(#\s+.+\n+)\*\*Código:\*\*[^\n]+\n+/m,
    '$1',
  );

  const h1Again = withoutDup.match(/^#\s+.+\n/m);
  if (!h1Again) return header + withoutDup;
  const insertAt = h1Again[0].length;
  return withoutDup.slice(0, insertAt) + header + withoutDup.slice(insertAt);
}

for (const rel of ['docs/auditorias/registry.json', 'docs/registry.json']) {
  const registry = JSON.parse(readFileSync(join(root, rel), 'utf8'));
  for (const entry of registry.entries ?? []) {
    if (!entry.path) continue;
    const p = join(root, entry.path);
    if (!existsSync(p)) continue;
    writeFileSync(p, fixHeader(readFileSync(p, 'utf8'), entry), 'utf8');
  }
}

console.log('fix-doc-headers OK');
