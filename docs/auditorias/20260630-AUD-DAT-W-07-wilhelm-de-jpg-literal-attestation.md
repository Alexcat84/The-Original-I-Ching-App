# Wilhelm DE — attestation JPG literal (Drittes Buch / Diez Alas)

**Código:** `20260630-AUD-DAT-W-07 wilhelm-de-jpg-literal-attestation` · **Familia:** DAT-W · **Estado:** structural-closed (§5 attestation pendiente)

- **Fecha inicio:** 2026-06-30
- **Fecha cierre estructural:** 2026-06-30
- **Rama:** `feature/wilhelm-de-dataset`
- **Prioridad:** **P0 — auditoría de fidelidad más importante del proyecto Wilhelm DE**
- **Relacionado:** `20260630-PLAN-DAT-W-06`, `20260630-AUD-DAT-W-04`, `20260628-PLAN-DAT-W-05`

---

## 1. Objeto

Confirmar **alta fidelidad literal** del maestro comments DE (`wilhelm-de-64hex-comments-merged.json`) contra el **libro físico Wilhelm 1924** (585 JPG 300 DPI en `tools/source-pdfs/source jpgs/`), **campo a campo** y **hexagrama a hexagrama**, incluyendo:

- Los **37 slots** Ten Wings / Drittes Buch por hex (paridad EN Baynes)
- Las **10 alas clásicas** mapeadas en `wilhelm-de-comments-hex-starts.json` → `wingFieldMap`
- **Erstes Buch** hex 1–2–8 (Wen Yen / Yong) incluidos en fases finales del plan JPG

**No sustituye** gates estructura (`verify:wilhelm-de-all-gates`, paridad EN↔DE vacío/lleno). Esta auditoría es la **única** que puede cerrar «literal libro ↔ dataset».

---

## 2. Metodología (obligatoria por hex)

1. Mapa páginas impreso: `wilhelm-de-comments-hex-starts.json` (`bookPage`–`endBookPage`).
2. JPG vía `scripts/lib/wilhelm-de-jpg-page-map.mjs` (`301-400-page-NNN.jpg`, etc.).
3. Fuente de transcripción canónica en trabajo: `contenido_pdf` del pilot TSV (`tools/manual-gold/wilhelm-de-comments-au/wilhelm-de-comments-hex-{N}-pilot-au.tsv`).
4. Por cada uno de los **37 campos** (36 en hex sin Yong; hex 1–2 tienen slots extra):
   - Leer JPG(s) donde aparece el texto en el impreso.
   - Comparar **carácter a carácter** (comillas `,, … "`, guiones de corte, párrafos).
   - Registrar en ledger: `verified` | `corrected` | `vacio_en_libro` (confirmado vacío en JPG).
5. Si `contenido_pdf` ≠ JPG: corregir pilot → sync `by-hex/*-disputes.tsv` → batch → verify → apply → promote.
6. Cerrar hex en ledger cuando todos los slots del pilot tienen `au_estado` ∈ {`cerrado`, `vacio_en_libro`} y batch JPG aplicado.

**Ledger canónico:** `reports/wilhelm-de-jpg-literal-audit-ledger.json`

**Ritual por lote:**

```bash
node scripts/lib/generate-wilhelm-de-jpg-literal-corrections-hex{N-M}.mjs   # si aplica
node scripts/run-wilhelm-de-jpg-literal-batch.mjs --from=N --to=M
npm run verify:wilhelm-de-comments-au-pilot -- --hex=N   # por hex o bucle 1..64
npm run apply:wilhelm-de-comments-au-gold
npm run validate:wilhelm-de-comments-au-gold
npm run promote:wilhelm-de-comments-au-to-merged
```

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

## 4. Progreso — lotes JPG literal cerrados

| Lote | Hex | Págs. libro (aprox.) | Módulo correcciones | Campos corregidos (lote) | Verify | Promote |
|------|-----|----------------------|---------------------|--------------------------|--------|---------|
| calibración | 8 | 358–361 | patches + batch | (incl. en total) | PASS | OK |
| 1 | 1 | 316–327 | `hex54-64-1-2-8` | 16 | PASS | OK |
| 2 | 2 | 328–336 | `hex54-64-1-2-8` | 9 | PASS | OK |
| 3 | 3–7 | 337–357 | `hex3-7` | — | PASS | OK |
| 4 | 9–13 | — | `hex9-13` | — | PASS | OK |
| 5 | 14–18 | — | `hex14-18` | — | PASS | OK |
| 6 | 19–23 | — | `hex19-23` | — | PASS | OK |
| 7 | 24–28 | — | `hex24-28` | — | PASS | OK |
| 8 | 29–33 | — | `hex29-33` | — | PASS | OK |
| 9 | 34–38 | 456–473 | `hex34-38` | — | PASS | OK |
| 10 | 39–43 | 474–495 | `hex39-43` | — | PASS | OK |
| 11 | 44–48 | 496–515 | `hex44-48` | 40 | PASS | OK |
| 12 | 49–53 | 516–535 | `hex49-53` | 41 | PASS | OK |
| 13 | 54–64 | 536–585 | `hex54-64-1-2-8` | 109 | PASS | OK |
| (8 repr.) | 8 | 358–361 | `hex54-64-1-2-8` | 10 | PASS | OK |

**Ledger al cierre estructural (2026-06-30T22:25:38Z):**

| Métrica | Valor |
|---------|-------|
| Hex completos (estructural) | **64 / 64** |
| Campos corregidos JPG literal (acumulado) | **422** |
| Campos verificados JPG (`verified`) | **1570 / 2304** |
| Campos `vacio_en_libro` | **312** |
| Campos pending | **0** |
| AU gold | 2368/2368 cerrado · disputas 551/551 |
| Merged fill post-promote | **1864 / 2176** |

**Hallazgos OCR recurrentes corregidos:** bleed hanzi al final de `L6_b`; split `image_oraculo` / `commentary_image` + líneas «Anfangs …»; `ruler_note` con trigramas basura; footer «Das Buch der Wandlungen II»; comillas `,,` → `„`; truncación `commentary_decision`; hex **58** L3 muy corrupto (etiqueta + `L3_b` + cierre `L4_b` desde pass04/JPG).

**Commits en remoto (referencia):** `97153a4` (hex 3–43), `e510d4c` (hex 44–48); cierre 49–64 + 1–2–8 en commit de esta sesión.

---

## 5. Attestation (solo al cerrar verificación JPG 2304/2304)

> **BLOQUEADO** — `ledger.summary.fieldsVerified + fieldsVacio` = **1882 ≠ 2304**. Los 64 hex están **estructuralmente cerrados** (pilot PASS, promote OK), pero **422 campos** recibieron corrección JPG literal y **732 slots** aún no tienen marca `verified` campo-a-campo contra JPG en el ledger (muchos hex tempranos se cerraron vía AU/OCR antes del barrido JPG página a página).

Para emitir attestation §5 hace falta:

1. Revisar hexágonos con `verified` parcial en el ledger (priorizar los sin entrada `jpgPagesRead` explícita por campo).
2. Alcanzar `fieldsVerified + fieldsVacio === fieldsTotal` (2304).
3. Completar el bloque de certificación abajo.

<!-- Plantilla al cierre definitivo:

## Attestation de fidelidad literal

Yo, [agente/sesión], certifico que entre 2026-06-30 y [fecha cierre] revisé **uno a uno** los campos del Drittes Buch Wilhelm DE 1924 contra las **585 imágenes JPG 300 DPI** del ejemplar físico anclado en este repositorio. Las correcciones constan en pilot TSV, ledger, y `wilhelm-de-64hex-comments-merged.json`.

**Resultado:** ALTA FIDELIDAD LITERAL confirmada para Drittes Buch / Ten Wings.

Firmante: · Ledger: `reports/wilhelm-de-jpg-literal-audit-ledger.json` · Promote: `reports/wilhelm-de-comments-au-promotion-*.json`
-->

---

## 6. Artefactos

| Artefacto | Ruta |
|-----------|------|
| Ledger | `reports/wilhelm-de-jpg-literal-audit-ledger.json` |
| Batch runner | `scripts/run-wilhelm-de-jpg-literal-batch.mjs` (`AU-FID-W-030`) |
| Módulos correcciones | `scripts/lib/wilhelm-de-jpg-literal-corrections-hex*.mjs` |
| Generadores | `scripts/lib/generate-wilhelm-de-jpg-literal-corrections-hex49-53.mjs` (`AU-FID-W-039`), `…hex54-64-1-2-8.mjs` (`AU-FID-W-040`) |
| Reports batch | `reports/wilhelm-de-jpg-literal-audit-{from}-{to}-*.json` |
| Pilot TSV | `tools/manual-gold/wilhelm-de-comments-au/wilhelm-de-comments-hex-{N}-pilot-au.tsv` |
| AU gold | `tools/output/fidelity-gold/wilhelm-de-64hex-comments-au-gold.json` |
| Merged | `tools/datasets/wilhelm-de/comments/wilhelm-de-64hex-comments-merged.json` |
| Plan fases | `20260630-PLAN-DAT-W-06-wilhelm-de-ten-wings-jpg-phases.md` |

---

## 7. Distinción cierre estructural vs attestation

| Nivel | Criterio | Estado 2026-06-30 |
|-------|----------|-------------------|
| **Estructural** | 64/64 hex pilot PASS; apply/validate/promote OK; ledger `hexComplete=64` | **CERRADO** |
| **JPG literal total** | Cada slot `verified` o `vacio_en_libro` en ledger | **1882/2304** — pendiente |
| **Attestation §5** | Bloque firmado en este doc | **NO emitida** |
