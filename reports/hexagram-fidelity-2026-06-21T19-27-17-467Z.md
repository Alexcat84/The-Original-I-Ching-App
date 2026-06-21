# Hexagram fidelity report

- Generated: 2026-06-21T19:27:17.468Z
- Mode: cache-first
- Gold cache: `tools/output/fidelity-gold/`

## wilhelm

| Match | Mismatch | Missing gold | Missing bundle | Skipped | Total | Match % |
|------:|---------:|-------------:|---------------:|--------:|------:|--------:|
| 507 | 0 | 7 | 0 | 0 | 514 | 98.64% |

### Mismatches (first 80)

| Hex | Field | Status | Hint |
|----:|-------|--------|------|
| 20 | line6 | missing_gold | missing_in_gold |
| 21 | line5 | missing_gold | missing_in_gold |
| 21 | line6 | missing_gold | missing_in_gold |
| 26 | line6 | missing_gold | missing_in_gold |
| 38 | image | missing_gold | missing_in_gold |
| 52 | line6 | missing_gold | missing_in_gold |
| 56 | judgment | missing_gold | missing_in_gold |

## legge

| Match | Mismatch | Missing gold | Missing bundle | Skipped | Total | Match % |
|------:|---------:|-------------:|---------------:|--------:|------:|--------:|
| 489 | 6 | 18 | 0 | 0 | 513 | 95.32% |

### Mismatches (first 80)

| Hex | Field | Status | Hint |
|----:|-------|--------|------|
| 8 | line3 | missing_gold | missing_in_gold |
| 10 | judgment | missing_gold | missing_in_gold |
| 12 | judgment | mismatch | mismatch |
| 12 | line3 | missing_gold | missing_in_gold |
| 13 | judgment | missing_gold | missing_in_gold |
| 19 | image | missing_gold | missing_in_gold |
| 28 | judgment | missing_gold | missing_in_gold |
| 29 | judgment | missing_gold | missing_in_gold |
| 35 | judgment | mismatch | mismatch |
| 37 | judgment | mismatch | mismatch |
| 39 | line1 | missing_gold | missing_in_gold |
| 40 | line4 | missing_gold | missing_in_gold |
| 41 | judgment | missing_gold | missing_in_gold |
| 41 | line2 | missing_gold | missing_in_gold |
| 43 | judgment | missing_gold | missing_in_gold |
| 44 | judgment | mismatch | mismatch |
| 45 | judgment | missing_gold | missing_in_gold |
| 48 | judgment | missing_gold | missing_in_gold |
| 50 | judgment | mismatch | mismatch |
| 52 | judgment | mismatch | mismatch |
| 53 | judgment | missing_gold | missing_in_gold |
| 55 | line4 | missing_gold | missing_in_gold |
| 60 | line3 | missing_gold | missing_in_gold |
| 61 | line1 | missing_gold | missing_in_gold |

## zhouyi

| Match | Mismatch | Missing gold | Missing bundle | Skipped | Total | Match % |
|------:|---------:|-------------:|---------------:|--------:|------:|--------:|
| 514 | 0 | 0 | 0 | 0 | 514 | 100% |

_No mismatches._

## Notes

- Wilhelm gold: Uni Parma mirror — oracle judgment/image/lines only (Wilhelm commentary excluded by parser).
- Legge gold: sacred-texts.com ic01–ic64 (text) + icap2 (Great Symbolism). Live site may 403; Wayback used as fallback.
- Zhou Yi gold: ctext.org gettext API (卦辭+爻辭+用九/六) + HTML scrape (大象傳).
- Normalizer: lowercase + whitespace collapse (EN); NFKC + strip 爻 labels (ZH).
- Classify mismatches A–E in Fase 2 per ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md.
