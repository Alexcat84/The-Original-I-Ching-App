# Hexagram fidelity report

- Generated: 2026-06-29T11:24:57.085Z
- Mode: cache-first
- Gold cache: `tools/output/fidelity-gold/`

## wilhelm

| Match | Mismatch | Missing gold | Missing bundle | Skipped | Total | Match % |
|------:|---------:|-------------:|---------------:|--------:|------:|--------:|
| 514 | 0 | 0 | 0 | 0 | 514 | 100% |

_No mismatches._

## Notes

- Book-primary gold (2026-06-22+): local editions in tools/source-pdfs/.
- Wilhelm: Richard Wilhelm DE 1924 (Diederichs) — merged OCR book-primary; PDF arbiter when local scan available.
- Legge: James Legge SBE XVI Oxford scan (OCR) — Thwan, Great Symbolism, lines, yongJiu/yongLiu.
- Default gate (--gold=books): Wilhelm DE 1924 + Legge PDF. Baynes EN: --gold=pdf-wilhelm.
- Zhou Yi: operational gold = ctext.org (npm run verify:hexagram-fidelity:zhouyi-ctext). Local 注疏 PDF is academic reserve, not book-primary gate.
