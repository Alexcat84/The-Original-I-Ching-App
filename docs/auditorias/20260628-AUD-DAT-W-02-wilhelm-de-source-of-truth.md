# Wilhelm DE 1924 — fuente de verdad de runtime

**Código:** `20260628-AUD-DAT-W-02 wilhelm-de-source-of-truth` · **Familia:** DAT-W · **Estado:** closed

## Objetivo

Sustituir el bundle runtime `hexagrams.wilhelm.json` (Baynes EN 1950) por el texto oracular **alemán Wilhelm 1924** (Diederichs), manteniendo el mismo `translator: "wilhelm"` y schema `HexagramRecord`.

## Jerarquía de fuentes

| Prioridad | Fuente | Rol |
|-----------|--------|-----|
| 1 | PDF `tools/source-pdfs/W german/*.pdf` (cuando disponible localmente) | Juez definitivo en discrepancias |
| 2 | OCR dual-pass (`01`/`03` Erstes Buch; `02`/`04` Drittes Buch) | Extracción masiva |
| 3 | Baynes EN archivado (`tools/output/archive/`, `tools/datasets/wilhelm-baynes/`) | Referencia diagnóstica |
| 4 | TSV / capturas manuales | Resolución campo a campo |

## Inventario físico

- **Vol. 1 (`01`/`03`):** *Erstes und Zweites Buch* — 64 hex oráculo + comentario inline Wilhelm + apéndices *Zweites Buch: Das Material*.
- **Vol. 2 (`02`/`04`):** *Drittes Buch: Die Kommentare* — capa confuciana (Ten Wings).
- Dos volúmenes × dos pasadas OCR (no cuatro ediciones distintas).

## Archivo Baynes

| Artefacto | Ubicación |
|-----------|-----------|
| Bundle runtime snapshot | `tools/output/archive/hexagrams.wilhelm.baynes-2026.json` |
| Commentary snapshot | `tools/output/archive/hexagrams.wilhelm.commentary.baynes-2026.json` |
| Módulo intermedio | `scripts/iching_wilhelm_translation.baynes.mjs` |
| Maestro EN parsed | `tools/datasets/wilhelm-baynes/book-one/wilhelm-64hex-parsed.json` |

## Pipeline DE

| Paso | Comando |
|------|---------|
| Stitch | `npm run stitch:wilhelm-de-txt` |
| Parse pass03 / pass01 | `npm run parse:wilhelm-de-64hex-txt` / `:pass01` |
| Merge | `npm run merge:wilhelm-de-dual-pass` |
| Sync módulo | `npm run sync:wilhelm-de-translation-module` |
| Gold | `npm run extract:gold:wilhelm-de-pdf` |
| Build | `npm run build:data` |
| Gate oráculo | `npm run verify:hexagram-fidelity:wilhelm-de` → **514/514** |
| Gates DE | `npm run verify:wilhelm-de-all-gates` |
| Triangulación | `npm run audit:wilhelm-de-triangulation` |

## Resultado gate (2026-06-29)

- **Oráculo:** 514/514 PASS vs gold merged OCR (`reports/hexagram-fidelity-2026-06-29T03-34-35-579Z.*`).
- **PDF local:** no presente en repo; gold operativo = merged pass01+pass03 hasta extracción PDF.
- **Drittes Buch (Ten Wings):** stub vacío pendiente parser completo; Erstes Buch inline en commentary bookOne.

## Producto

- Consultas IA: blockquotes Wilhelm en **alemán**; respuesta en idioma UI.
- Histórico DB con `translator: "wilhelm"` previo a este switch = citas Baynes; **no migrar retroactivamente**.

## Licencia

Wilhelm DE 1924 — dominio público USA. Baynes 1950 — no republicado; archivado solo para QA.
