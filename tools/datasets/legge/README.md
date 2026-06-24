# Legge SBE XVI — TXT maestro datasets

Book-primary sources from user-edited Princeton TXT exports (not runtime ingest yet).

**Notas:** solo Wilhelm y Legge llevan footnotes/comentario en el maestro; Zhou Yi = 经 sin notas. Ver `docs/auditorias/TXT_MAESTRO_NOTES_AND_FIDELITY_2026-06-23.md`.
| Dataset | Source TXT | Parsed JSON | Status |
|---------|------------|-------------|--------|
| `book-one/` | `tools/source-pdfs/Yi King - James Legge-64hex.txt` | `legge-64hex-parsed.json` | **official** (AU 2026-06-23) |
| `appendix/` | `tools/source-pdfs/Yi King - James Legge-Appendix.txt` | `legge-appendix-parsed.json` | **official** (AU 2026-06-23) |

**Runtime ingest:** still `false` — maestro cerrado; no sync a `packages/iching-data` hasta Zhou Yi maestro + plan de ingest explícito.

**Whitespace:** `compactLeggeTxtWhitespace` en `legge-txt-clean.mjs` — cuerpo máx. `\n\n` entre párrafos; footnotes sin líneas en blanco (`\n` simple entre entradas).

## Structure (64hex)

```
I. THE KHIEN HEXAGRAM.
* * *
(Explanation of the entire figure by king Wăn.)
<thwan>
(Explanation of the separate lines by the duke of Kâu.)
1. … 6. …
7. …   ← yong (hex 1–2 only)
* * *
Footnotes
<commentary>
```

Great Symbolism (`image`) is **not** in the 64hex file; extract from appendix.

## Structure (appendix)

Main text stops before SBE back matter (`TRANSLITERATION OF ORIENTAL ALPHABETS` → hexagram key → `Table of Contents`).

```
THE APPENDIXES
APPENDIX I i
  <heading: Treatise on the Thwan…>
  SECTION I   → content + footnotes (hex I–XXX Thwan commentary)
  SECTION II  → content + footnotes (hex XXXI–LXIV)
APPENDIX II i
  SECTION I   → symbolismHex[1–30]  (Great Symbolism + line glosses)
  SECTION II  → symbolismHex[31–64]
APPENDIX III … APPENDIX VII
APPENDIX V/VII → single body (no SECTION headings)
```

Parsed JSON: `appendices[]` with nested `sections[]`, each with `content` / `footnotes`. Appendix II sections also expose `symbolismHex[]` (`hex`, `image`, `lineNotes`).

Back matter: `tableOfContents`, `transliteration`, `hexagramKey`.

## Commands

```bash
npm run parse:legge-64hex-txt
npm run parse:legge-appendix-txt
npm run export:legge-64hex-audit-csv
npm run export:legge-appendix-audit-csv
npm run verify:legge-all-gates
```

**AU CSVs appendix (texto completo):**
- `reports/legge-appendix-sections-audit-latest.csv` — 12 bloques (content + footnotes por apéndice/sección)
- `reports/legge-appendix-symbolism-audit-latest.csv` — 64 hex (Great Symbolism + glosas L1–L7, Appendix II)
- `reports/legge-appendix-structure-latest.csv` — solo índice campo/chars (sin texto)
