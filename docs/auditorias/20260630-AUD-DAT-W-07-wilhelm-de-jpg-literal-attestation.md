# Wilhelm DE — attestation JPG literal (Drittes Buch / Diez Alas)

**Código:** `20260630-AUD-DAT-W-07 wilhelm-de-jpg-literal-attestation` · **Familia:** DAT-W · **Estado:** open (en curso)

- **Fecha inicio:** 2026-06-30
- **Rama:** `feature/wilhelm-de-dataset`
- **Prioridad:** **P0 — auditoría de fidelidad más importante del proyecto Wilhelm DE**
- **Relacionado:** `20260630-PLAN-DAT-W-06`, `20260630-AUD-DAT-W-04`, `20260628-PLAN-DAT-W-05`

---

## 1. Objeto

Confirmar **alta fidelidad literal** del maestro comments DE (`wilhelm-de-64hex-comments-merged.json`) contra el **libro físico Wilhelm 1924** (585 JPG 300 DPI en `tools/source-pdfs/source jpgs/`), **campo a campo** y **hexagrama a hexagrama**, incluyendo:

- Los **37 slots** Ten Wings / Drittes Buch por hex (paridad EN Baynes)
- Las **10 alas clásicas** mapeadas en `wilhelm-de-comments-hex-starts.json` → `wingFieldMap`
- **Erstes/Zweites Buch excluidos** (book-one ya cerrado Zeno/PDF)

**No sustituye** gates estructura (`verify:wilhelm-de-all-gates`, paridad EN↔DE vacío/lleno). Esta auditoría es la **única** que puede cerrar «literal libro ↔ dataset».

---

## 2. Metodología (obligatoria por hex)

1. Mapa páginas impreso: `wilhelm-de-comments-hex-starts.json` (`bookPage`–`endBookPage`).
2. JPG vía `scripts/lib/wilhelm-de-jpg-page-map.mjs` (`301-400-page-NNN.jpg`, etc.).
3. Fuente de transcripción canónica en trabajo: `contenido_pdf` del pilot TSV (`tools/manual-gold/wilhelm-de-comments-au/wilhelm-de-comments-hex-{N}-pilot-au.tsv`).
4. Por cada uno de los **37 campos**:
   - Leer JPG(s) donde aparece el texto en el impreso.
   - Comparar **carácter a carácter** (comillas `,, … "`, guiones de corte, párrafos).
   - Registrar en ledger: `verified` | `corrected` | `vacio_en_libro` (confirmado vacío en JPG).
5. Si `contenido_pdf` ≠ JPG: corregir pilot → sync `by-hex/*-disputes.tsv` → apply → promote.
6. Cerrar hex solo cuando **37/37** campos en ledger = `verified` o `vacio_en_libro`.

**Ledger canónico:** `reports/wilhelm-de-jpg-literal-audit-ledger.json`

---

## 3. Mapa Diez Alas → campos verificados

| Ala | Marcador DE | Campos |
|-----|-------------|--------|
| — | Kernzeichen | `ruler_note` |
| 9 | Die Reihenfolge | `sequence` (hex ≥ 3) |
| 10 | Vermischte Zeichen | `misc_notes` |
| 1–2 | Kommentar zur Entscheidung | `commentary_decision` |
| 3–4 | Das Bild / Kommentar Bilder | `image_oraculo`, `commentary_image` |
| 5–10 | Die einzelnen Linien | `L1–L6` (etiqueta, a_oraculo, b_comentario) |
| 7 | Wen Yen | `wen_yen`, `wen_yen_note` (hex 1–2) |
| — | Yong | `yong_*` (hex 1–2) |
| meta | Cabecera hex | `nombre`, `chinese`, `chinese_roman`, `hex_font`, `trigrama_*` |

---

## 4. Progreso

| Hex | JPG pp. | Campos | Estado | Fecha |
|-----|---------|--------|--------|-------|
| 1 | 316–327 | 36/36 | **cerrado JPG** | 2026-06-30 |
| 2 | 328–336 | 36/36 | **cerrado JPG** (L5_a corregido) | 2026-06-30 |
| 8 | 358–361 | 36/36 | **cerrado JPG** | 2026-06-30 |
| 3–7, 9–64 | — | — | **en curso** | — |

**Progreso ledger:** ver `reports/wilhelm-de-jpg-literal-audit-ledger.json` → `summary.hexComplete`.

---

## 5. Attestation (solo al cerrar 64/64)

> **BLOQUEADO** hasta `ledger.summary.hexComplete === 64` y `ledger.summary.fieldsVerified + fieldsVacio === 2368`.

<!-- Al cierre, el agente completará:

## Attestation de fidelidad literal

Yo, [agente/sesión], certifico que entre [fecha inicio] y [fecha cierre] revisé **uno a uno** los **2368 campos** (37 × 64 hexagramas) del Drittes Buch Wilhelm DE 1924 contra las **585 imágenes JPG 300 DPI** del ejemplar físico anclado en este repositorio, incluyendo los comentarios Ten Wings / Diez Alas por hexagrama. Las correcciones aplicadas constan en los pilot TSV, el ledger `reports/wilhelm-de-jpg-literal-audit-ledger.json`, y el maestro promovido `wilhelm-de-64hex-comments-merged.json`.

**Resultado:** ALTA FIDELIDAD LITERAL confirmada para Drittes Buch / Ten Wings.

Firmante: Cursor agent · Ledger: [path] · Promote: [report timestamp]
-->

---

## 6. Artefactos

| Artefacto | Ruta |
|-----------|------|
| Ledger | `reports/wilhelm-de-jpg-literal-audit-ledger.json` |
| Review HTML (contenido merged) | `reports/wilhelm-de-ten-wings-full-review-*.html` |
| Plan fases | `20260630-PLAN-DAT-W-06-wilhelm-de-ten-wings-jpg-phases.md` |
