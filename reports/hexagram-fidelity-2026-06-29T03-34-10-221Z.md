# Hexagram fidelity report

- Generated: 2026-06-29T03:34:10.222Z
- Mode: cache-first
- Gold cache: `tools/output/fidelity-gold/`

## wilhelm

| Match | Mismatch | Missing gold | Missing bundle | Skipped | Total | Match % |
|------:|---------:|-------------:|---------------:|--------:|------:|--------:|
| 48 | 0 | 464 | 0 | 0 | 512 | 9.38% |

### Mismatches (first 80)

| Hex | Field | Status | Hint |
|----:|-------|--------|------|
| 1 | judgment | missing_gold | both_empty |
| 1 | image | missing_gold | both_empty |
| 1 | line1 | missing_gold | both_empty |
| 1 | line2 | missing_gold | both_empty |
| 1 | line3 | missing_gold | both_empty |
| 1 | line4 | missing_gold | both_empty |
| 1 | line5 | missing_gold | both_empty |
| 1 | line6 | missing_gold | both_empty |
| 2 | judgment | missing_gold | both_empty |
| 2 | image | missing_gold | both_empty |
| 2 | line1 | missing_gold | both_empty |
| 2 | line2 | missing_gold | both_empty |
| 2 | line3 | missing_gold | both_empty |
| 2 | line4 | missing_gold | both_empty |
| 2 | line5 | missing_gold | both_empty |
| 2 | line6 | missing_gold | both_empty |
| 3 | judgment | missing_gold | both_empty |
| 3 | image | missing_gold | both_empty |
| 3 | line1 | missing_gold | both_empty |
| 3 | line2 | missing_gold | both_empty |
| 3 | line3 | missing_gold | both_empty |
| 3 | line4 | missing_gold | both_empty |
| 3 | line5 | missing_gold | both_empty |
| 3 | line6 | missing_gold | both_empty |
| 5 | judgment | missing_gold | both_empty |
| 5 | image | missing_gold | both_empty |
| 5 | line1 | missing_gold | both_empty |
| 5 | line2 | missing_gold | both_empty |
| 5 | line3 | missing_gold | both_empty |
| 5 | line4 | missing_gold | both_empty |
| 5 | line5 | missing_gold | both_empty |
| 5 | line6 | missing_gold | both_empty |
| 6 | judgment | missing_gold | both_empty |
| 6 | image | missing_gold | both_empty |
| 6 | line1 | missing_gold | both_empty |
| 6 | line2 | missing_gold | both_empty |
| 6 | line3 | missing_gold | both_empty |
| 6 | line4 | missing_gold | both_empty |
| 6 | line5 | missing_gold | both_empty |
| 6 | line6 | missing_gold | both_empty |
| 7 | judgment | missing_gold | both_empty |
| 7 | image | missing_gold | both_empty |
| 7 | line1 | missing_gold | both_empty |
| 7 | line2 | missing_gold | both_empty |
| 7 | line3 | missing_gold | both_empty |
| 7 | line4 | missing_gold | both_empty |
| 7 | line5 | missing_gold | both_empty |
| 7 | line6 | missing_gold | both_empty |
| 8 | judgment | missing_gold | both_empty |
| 8 | image | missing_gold | both_empty |
| 8 | line1 | missing_gold | both_empty |
| 8 | line2 | missing_gold | both_empty |
| 8 | line3 | missing_gold | both_empty |
| 8 | line4 | missing_gold | both_empty |
| 8 | line5 | missing_gold | both_empty |
| 8 | line6 | missing_gold | both_empty |
| 9 | judgment | missing_gold | both_empty |
| 9 | image | missing_gold | both_empty |
| 9 | line1 | missing_gold | both_empty |
| 9 | line2 | missing_gold | both_empty |
| 9 | line3 | missing_gold | both_empty |
| 9 | line4 | missing_gold | both_empty |
| 9 | line5 | missing_gold | both_empty |
| 9 | line6 | missing_gold | both_empty |
| 10 | judgment | missing_gold | both_empty |
| 10 | image | missing_gold | both_empty |
| 10 | line1 | missing_gold | both_empty |
| 10 | line2 | missing_gold | both_empty |
| 10 | line3 | missing_gold | both_empty |
| 10 | line4 | missing_gold | both_empty |
| 10 | line5 | missing_gold | both_empty |
| 10 | line6 | missing_gold | both_empty |
| 11 | judgment | missing_gold | both_empty |
| 11 | image | missing_gold | both_empty |
| 11 | line1 | missing_gold | both_empty |
| 11 | line2 | missing_gold | both_empty |
| 11 | line3 | missing_gold | both_empty |
| 11 | line4 | missing_gold | both_empty |
| 11 | line5 | missing_gold | both_empty |
| 11 | line6 | missing_gold | both_empty |

_… and 384 more (see JSON)._

## Notes

- Book-primary gold (2026-06-22+): local editions in tools/source-pdfs/.
- Wilhelm: Richard Wilhelm DE 1924 (Diederichs) — merged OCR book-primary; PDF arbiter when local scan available.
- Legge: James Legge SBE XVI Oxford scan (OCR) — Thwan, Great Symbolism, lines, yongJiu/yongLiu.
- Default gate (--gold=books): Wilhelm DE 1924 + Legge PDF. Baynes EN: --gold=pdf-wilhelm.
- Zhou Yi: operational gold = ctext.org (npm run verify:hexagram-fidelity:zhouyi-ctext). Local 注疏 PDF is academic reserve, not book-primary gate.
