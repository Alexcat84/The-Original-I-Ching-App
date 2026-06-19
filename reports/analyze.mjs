import { readFileSync } from 'fs';

const main = JSON.parse(readFileSync('./reports/mutation-qa-2026-06-15T23-07-14.json', 'utf8'));
const recheck = JSON.parse(readFileSync('./reports/recheck-failures-2026-06-15T23-31-17.json', 'utf8'));

// Build clean dataset: replace false-negative H1 rows with recheck rows
const recheckKeys = new Set(
  recheck.rows.map(r => `${r.fixtureId}|${r.translator}|${r.model}`)
);

// Keep main rows that were NOT rechecked (they're legit), plus all recheck rows
const clean = [
  ...main.rows.filter(r => !recheckKeys.has(`${r.fixtureId}|${r.translator}|${r.model}`)),
  ...recheck.rows
];

console.log(`Clean dataset: ${clean.length} rows (${main.rows.length} main - ${recheckKeys.size} replaced + ${recheck.rows.length} rechecks)\n`);

// Stats by model
const stats = {};
for (const row of clean) {
  const m = row.model === 'claude-sonnet-4-6' ? '4.6' : '4.5';
  if (!stats[m]) stats[m] = { pass: 0, fail: 0, warn: 0, total: 0, latencies: [], outputTok: [], translators: {}, fixtures: {}, warns: [], fails: [] };
  const s = stats[m];
  s.total++;
  if (row.blockingPass) s.pass++; else { s.fail++; s.fails.push(row); }
  s.warn += row.warnCount || 0;
  if (row.warnCount > 0) s.warns.push(row);
  s.latencies.push(row.latencyMs);
  s.outputTok.push(row.outputTokens);

  const t = row.translator;
  if (!s.translators[t]) s.translators[t] = { pass: 0, fail: 0, warn: 0 };
  if (row.blockingPass) s.translators[t].pass++; else s.translators[t].fail++;
  if (row.warnCount > 0) s.translators[t].warn += row.warnCount;

  const f = row.fixtureId || row.mutationRule;
  if (!s.fixtures[f]) s.fixtures[f] = { pass: 0, fail: 0, warn: 0 };
  if (row.blockingPass) s.fixtures[f].pass++; else s.fixtures[f].fail++;
  if (row.warnCount > 0) s.fixtures[f].warn += row.warnCount;
}

const avg = a => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
const med = a => { const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };

for (const [m, s] of Object.entries(stats)) {
  console.log(`=== Sonnet ${m} (CLEAN) ===`);
  console.log(`Total: ${s.total}, Pass: ${s.pass}, Fail: ${s.fail}, Warns: ${s.warn}`);
  console.log(`Pass rate: ${(s.pass / s.total * 100).toFixed(1)}%`);
  console.log(`Latency avg: ${avg(s.latencies)}ms, median: ${med(s.latencies)}ms`);
  console.log(`Output tokens avg: ${avg(s.outputTok)}, median: ${med(s.outputTok)}`);
  
  console.log('\nBy translator:');
  for (const [t, v] of Object.entries(s.translators)) {
    const tot = v.pass + v.fail;
    console.log(`  ${t}: ${v.pass}/${tot} pass (${(v.pass / tot * 100).toFixed(0)}%)${v.warn ? ` [${v.warn} warns]` : ''}`);
  }
  
  console.log('\nBy fixture:');
  for (const [f, v] of Object.entries(s.fixtures)) {
    const tot = v.pass + v.fail;
    const status = v.fail === 0 && v.warn === 0 ? '✅' : v.fail > 0 ? '❌' : '⚠️';
    console.log(`  ${status} ${f}: ${v.pass}/${tot} pass${v.warn ? ` [${v.warn} warns]` : ''}`);
  }

  if (s.fails.length > 0) {
    console.log('\nGENUINE FAILURES:');
    for (const f of s.fails) {
      console.log(`  ${f.fixtureId}/${f.translator}: ${f.blockingFailures?.map(x => x.gate + ': ' + x.message).join('; ')}`);
    }
  }
  if (s.warns.length > 0) {
    console.log('\nGENUINE WARNINGS:');
    for (const w of s.warns) {
      console.log(`  ${w.fixtureId}/${w.translator}: ${w.warnFailures?.map(x => x.gate + ': ' + x.message).join('; ')}`);
    }
  }
  console.log('');
}

// Check Sonnet 4.6 — any structural pattern in the warns/fails?
console.log('=== SONNET 4.6 DEEP DIVE ===');
const s46 = clean.filter(r => r.model === 'claude-sonnet-4-6');
// Check SNAPSHOT completeness
let missingSymbols = 0;
let missingThreadLink = 0;
let missingActionCore = 0;
for (const r of s46) {
  const snap = r.responseFull?.match(/\[SNAPSHOT_START\]([\s\S]*?)\[SNAPSHOT_END\]/)?.[1] || '';
  if (!snap.includes('THREAD_LINK:')) missingThreadLink++;
  if (!snap.includes('ACTION_CORE:')) missingActionCore++;
  if (!snap.includes('SYMBOLS_MIN:')) missingSymbols++;
}
console.log(`SNAPSHOT analysis (${s46.length} responses):`);
console.log(`  THREAD_LINK present: ${s46.length - missingThreadLink}/${s46.length}`);
console.log(`  ACTION_CORE present: ${s46.length - missingActionCore}/${s46.length}`);
console.log(`  SYMBOLS_MIN present: ${s46.length - missingSymbols}/${s46.length} (${missingSymbols} missing)`);

// Same for 4.5
console.log('\n=== SONNET 4.5 DEEP DIVE ===');
const s45 = clean.filter(r => r.model === 'claude-sonnet-4-5-20250929');
let missingSymbols5 = 0, missingThreadLink5 = 0, missingActionCore5 = 0;
for (const r of s45) {
  const snap = r.responseFull?.match(/\[SNAPSHOT_START\]([\s\S]*?)\[SNAPSHOT_END\]/)?.[1] || '';
  if (!snap.includes('THREAD_LINK:')) missingThreadLink5++;
  if (!snap.includes('ACTION_CORE:')) missingActionCore5++;
  if (!snap.includes('SYMBOLS_MIN:')) missingSymbols5++;
}
console.log(`SNAPSHOT analysis (${s45.length} responses):`);
console.log(`  THREAD_LINK present: ${s45.length - missingThreadLink5}/${s45.length}`);
console.log(`  ACTION_CORE present: ${s45.length - missingActionCore5}/${s45.length}`);
console.log(`  SYMBOLS_MIN present: ${s45.length - missingSymbols5}/${s45.length} (${missingSymbols5} missing)`);

// Check section counts
console.log('\n=== SECTION COUNT ANALYSIS ===');
for (const label of ['4.6', '4.5']) {
  const rows = clean.filter(r => (r.model === 'claude-sonnet-4-6') === (label === '4.6'));
  const counts = rows.map(r => {
    const sections = (r.responseFull || '').match(/^## /gm) || [];
    return { id: `${r.fixtureId}/${r.translator}`, count: sections.length };
  });
  const below6 = counts.filter(c => c.count < 6);
  console.log(`Sonnet ${label}: ${below6.length}/${rows.length} with <6 sections`);
  for (const b of below6) {
    console.log(`  ${b.id}: ${b.count} sections`);
  }
}

// Check CATEGORY usage
console.log('\n=== CATEGORY DISTRIBUTION ===');
for (const label of ['4.6', '4.5']) {
  const rows = clean.filter(r => (r.model === 'claude-sonnet-4-6') === (label === '4.6'));
  const cats = {};
  for (const r of rows) {
    const cat = r.responseFull?.match(/^CATEGORY:\s*(.+)$/m)?.[1]?.trim() || 'MISSING';
    cats[cat] = (cats[cat] || 0) + 1;
  }
  console.log(`Sonnet ${label}:`, JSON.stringify(cats));
}
