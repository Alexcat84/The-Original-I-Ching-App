# Legge SBE XVI TXT — auditoría AU y maestro book-primary

- **Fecha:** 2026-06-23
- **Rama:** `feature/wilhelm-txt-au-maestro-2026-06-23`
- **Estado:** **Gates 4/4 PASS** · **AU manual APROBADA** · datasets **`official`** · **sin ingest runtime**
- **Política notas:** ver [TXT_MAESTRO_NOTES_AND_FIDELITY_2026-06-23.md](./TXT_MAESTRO_NOTES_AND_FIDELITY_2026-06-23.md)

---

## 1. Fuentes y datasets

| Dataset | Directorio | TXT fuente | Manifest |
|---------|------------|------------|----------|
| **Book-one** (64 hex) | `tools/datasets/legge/book-one/` | `Yi King - James Legge-64hex.txt` | **official** |
| **Appendix** (I–VII + back matter) | `tools/datasets/legge/appendix/` | `Yi King - James Legge-Appendix.txt` | **official** |

Meta: `nombre` = header TXT; `chinese_roman` = title-case(header); `chinese` + `hex_font` = `iching_zhouyi_translation.mjs` (canónico ×64).

---

## 2. Pipeline

```bash
npm run parse:legge-64hex-txt
npm run parse:legge-appendix-txt
npm run export:legge-64hex-audit-csv
npm run export:legge-appendix-audit-csv
npm run verify:legge-all-gates
```

CSV AU: `reports/legge-64hex-txt-audit-latest.csv`, `legge-appendix-sections-audit-latest.csv`, `legge-appendix-symbolism-audit-latest.csv`.

---

## 3. Gates

| Gate | Resultado |
|------|-----------|
| Book-one G0/G1 | PASS (450/450 oracle scope) |
| Book-one meta fidelity | PASS |
| Book-one G2 deterministic | PASS |
| Appendix G0 (7 appendices, 64 symbolism, back matter) | PASS |

---

## 4. AU manual — cierre

### Book-one

- 64 hex × 17 campos + `hex_fin`.
- Homónimos `nombre`/`chinese_roman` (8 pares) = book-primary.
- Fixes parser: hex 21 footnotes sin `***`; hex 9 `chinese_roman`; línea `S.` → L5 en appendix symbolism (no aplica book-one).

### Appendix

- **Sections:** 12 bloques; Ap. VI footnotes repartidas (`vi:i`–`vi:6` / `vi:7`); Ap. VII sin footnotes (libro); back matter truncado antes de transliteración.
- **Symbolism:** 64 hex; L7 solo 1–2; hex 2 L5 recuperado (OCR `S.`).
- IDs `section-I-KHIEN`, `appendix-I-i` = cabeceras Oxford, no renombrar.

---

## 5. Notas Legge (`footnotes`)

Única capa de **notas académicas Legge** en el maestro (paralelo a comentarios Wilhelm). Zhou Yi **no** incluye footnotes en este modelo.

Compactación vertical aplicada en parse (footnotes: una sola `\n` entre entradas).

---

## 6. Runtime

`runtimeIngest: false` en ambos manifests. Bundle `packages/iching-data` sigue EPUB/PDF-primary hasta gate de producto explícito.
