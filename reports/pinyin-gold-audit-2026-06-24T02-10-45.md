# Pinyin gold audit — derivado vs hardcodeado

Generado 2026-06-24T02-10-45. Pinyin derivado algorítmicamente del hanzi (pinyin-pro) vs el valor hardcodeado en `scripts/iching_wilhelm_translation.mjs` (64 nombres de hexagrama) y `apps/web/src/lib/library/trigram-meta.ts` (8 trigramas).

Total checks: 72 · Total fails: 4

## FAILS

- **iching_wilhelm_translation.mjs / hex 3** — hanzi `屯`: hardcodeado `zhūn`, derivado `tún`
- **iching_wilhelm_translation.mjs / hex 12** — hanzi `否`: hardcodeado `pǐ`, derivado `fǒu`
- **iching_wilhelm_translation.mjs / hex 23** — hanzi `剝`: hardcodeado `bō`, derivado `bāo`
- **iching_wilhelm_translation.mjs / hex 40** — hanzi `解`: hardcodeado `xiè`, derivado `jiě`
