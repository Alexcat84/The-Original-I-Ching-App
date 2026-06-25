# Wilhelm Princeton TXT datasets

Canonical parsed datasets from the user-edited EPUB exports. **Not ingested to runtime** until explicitly wired.

**Notas:** solo Wilhelm (book-one + comments) y Legge llevan capa de notas en el maestro; Zhou Yi no. Ver `docs/auditorias/20260623-POL-DAT-MAESTRO-00-txt-maestro-notes-policy.md`.
| Directory | Status | Source TXT (`tools/source-pdfs/`) |
|-----------|--------|-----------------------------------|
| `comments/` | **official** (notas Ten Wings) | `The I Ching or Book of Changes - Wilhelm-comments 64 hex.txt` |
| `book-one/` | **official** (oráculo + comentario Wilhelm) | `I Ching or Book of Changes (Bollingen Series), The - Wilhelm, Hellmut-64hex.txt` |
| `appendix/` | **draft** — separate file, future use | `The I Ching or Book of Changes - Wilhelm-Appendix.txt` |

## Regenerate

```bash
npm run parse:wilhelm-64hex-comments-txt   # → comments/wilhelm-64hex-comments-parsed.json
npm run parse:wilhelm-64hex-txt            # → book-one/wilhelm-64hex-parsed.json
npm run parse:wilhelm-appendix-txt         # → appendix/wilhelm-appendix-parsed.json
npm run export:wilhelm-64hex-audit-csv
npm run verify:wilhelm-all-gates          # 12/12 book-one + comments
```

Manual audit CSVs stay in `reports/` (`wilhelm-64hex-comments-audit-latest.csv`, etc.).

Trigram meta fields (`trigrama_arriba` / `trigrama_abajo`) are injected verbatim from `scripts/iching_wilhelm_translation.mjs` — not normalized. FIRE/FLAME and Wade-Giles variants match Wilhelm print (Parma audit). Run `npm run audit:wilhelm-trigram-parma`.
