# Pinyin gold audit — derivado vs hardcodeado

Generado 2026-06-24T02-24-43. Pinyin derivado algorítmicamente del hanzi (pinyin-pro) vs el valor en `scripts/iching_wilhelm_translation.mjs` (64 nombres de hexagrama, hardcodeado) y `packages/iching-data/src/generated/trigrams.json` (8 trigramas, ya generado por `scripts/build-trigrams.mjs` — regresión, no auditoría de hardcode).

Total checks: 72 · Total fails: 0

Sin discrepancias — el pinyin hardcodeado coincide con la derivación algorítmica en los 72 casos.