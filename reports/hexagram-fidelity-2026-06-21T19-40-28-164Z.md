# Hexagram fidelity report

- Generated: 2026-06-21T19:40:28.165Z
- Mode: cache-first
- Gold cache: `tools/output/fidelity-gold/`

## wilhelm

| Match | Mismatch | Missing gold | Missing bundle | Skipped | Total | Match % |
|------:|---------:|-------------:|---------------:|--------:|------:|--------:|
| 513 | 0 | 1 | 0 | 0 | 514 | 99.81% |

### Mismatches (first 80)

| Hex | Field | Status | Hint |
|----:|-------|--------|------|
| 56 | judgment | missing_gold | missing_in_gold |

## legge

| Match | Mismatch | Missing gold | Missing bundle | Skipped | Total | Match % |
|------:|---------:|-------------:|---------------:|--------:|------:|--------:|
| 513 | 0 | 0 | 0 | 0 | 513 | 100% |

_No mismatches._

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
