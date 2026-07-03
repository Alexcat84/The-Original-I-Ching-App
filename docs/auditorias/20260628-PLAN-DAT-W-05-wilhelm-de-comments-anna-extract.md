# Wilhelm DE — extract Ten Wings desde Anna TXT (sandbox aislado)

**Código:** `20260628-PLAN-DAT-W-05 wilhelm-de-comments-anna-extract` · **Familia:** DAT-W · **Estado:** open (fase E promote cerrada; fase F runtime build OK en feature)

- **Fecha:** 2026-06-28
- **Rama:** `feature/wilhelm-de-dataset`
- **Relacionado:** `20260629-PLAN-DAT-W-03`, `20260628-AUD-DAT-W-02`, `20260630-AUD-DAT-W-04`

---

## 1. Objetivo

Extraer **Drittes Buch** (*Die Kommentare*, Ten Wings por hex) desde los TXT OCR de Anna's Archive (carpetas **02** y **04**), en un **sandbox aislado** que **no** escribe `wilhelm-de-64hex-comments-merged.json` ni activa runtime hasta AU cerrada.

**Book-one** sigue siendo **Zeno-only** (Erstes Buch). **Comments** siguen en scaffold vacío en runtime hasta promote explícito post-AU.

---

## 2. Fuentes

| Carpeta | Libro | Stitched TXT |
|---------|-------|--------------|
| `tools/source-pdfs/W german/02` | Drittes Buch pass A | `wilhelm-de-drittes-buch-pass02.txt` |
| `tools/source-pdfs/W german/04` | Drittes Buch pass B | `wilhelm-de-drittes-buch-pass04.txt` |

**No usar** 01/03 para Ten Wings (Erstes Buch + cola Zweites Buch).

Zeno.org **no** publica Drittes Buch — Anna es la única fuente digital disponible hoy.

---

## 3. Anatomía Drittes Buch (37 campos × 64 hex)

Paridad con maestro comments EN (Baynes Ten Wings). Marcadores DE del parser:

| Sección | Marcador OCR | Campos |
|---------|--------------|--------|
| Kernzeichen | `Kernzeichen` | `ruler_note` |
| Reihenfolge | `Die Reihenfolge` | `sequence` (hex 3+) |
| Vermischte | `Vermischte Zeichen` | `misc_notes` |
| Tuan | `Kommentar zur Entscheidung` | `commentary_decision` |
| Da Xiang | `Kommentar zu den Bildern` / `DAS BILD` | `image_oraculo`, `commentary_image` |
| Líneas | `Die einzelnen Linien` + etiquetas DE | `L1–L6_*` |
| Yong | `Alle Striche sind Neunen/Sechsen` | `yong_*` (hex 1–2) |
| Wen Yen | `Kommentar zu den Textworten` | `wen_yen`, `wen_yen_note` (hex 1–2) |

**Caveat OCR:** el header `Kommentar zu den Bildern` a menudo no aparece como línea suelta; el parser usa `DAS BILD` + heurística de párrafos.

---

## 4. Sandbox (runtimeIngest: false)

```
tools/datasets/wilhelm-de/comments/anna/
├── manifest.json
├── coverage-latest.json
├── wilhelm-de-64hex-comments-anna-pass02.json
├── wilhelm-de-64hex-comments-anna-pass04.json
├── wilhelm-de-64hex-comments-anna-reconciled.json   # fase C
├── reconcile-report-latest.json
└── comparison-viewer.html
```

**Prohibido escribir** (hasta fase promote post-AU):

- `comments/wilhelm-de-64hex-comments-merged.json`
- `packages/iching-data/.../hexagrams.wilhelm.commentary.json`

El lock `ocr-ingest.lock.json` sigue bloqueando los scripts legacy `parse/merge:wilhelm-de-*-comments-*` hacia rutas oficiales. Los scripts Anna están en `safeScripts`.

---

## 5. Pipeline (fase actual)

```bash
# Re-stitch si cambian páginas en 01-04
npm run stitch:wilhelm-de-txt

# Extract sandbox (pass 02, 04, o ambos)
npm run extract:wilhelm-de-comments-from-anna

# Gate estructura + cobertura + diff dual-pass
npm run validate:wilhelm-de-comments-anna-gate

# Fase C: merge heurístico + comparador HTML
npm run reconcile:wilhelm-de-comments-from-anna
npm run export:wilhelm-de-comments-anna-comparison-viewer

# Fase D: TSV disputas para AU PDF (Sheets)
npm run export:wilhelm-de-comments-anna-au-tsv

# Auditoría fuente TXT (no escribe maestro)
node scripts/audit-wilhelm-de-annas-txt.mjs
```

---

## 6. Fases y criterios de cierre

| Fase | Entregable | Criterio |
|------|------------|----------|
| **A** (actual) | Sandbox pass02 + pass04 | 64 headers; reporte cobertura; G0 documentado |
| **B** | Parser fixes | G0 PASS pass02+04 (VF-FID-W-033) |
| **C** | Dual-pass reconcile | Diff + merge heurístico → `anna-reconciled` + HTML viewer |
| **D** | AU PDF 64×37 | Capturas libro físico; TSV vertical |
| **E** | Promote maestro | Copia a `comments-merged` + sync + gates 1920+ |
| **F** | Runtime | `build:data` + smoke; **solo tras pedido merge staging** |

---

## 7. Gates

| Gate | Script | Bloqueante para promote |
|------|--------|-------------------------|
| G-anna struct | `validate:wilhelm-de-comments-anna-gate` | Sí (estructura 64 hex) |
| G0 comments | `validateWilhelmDe64HexCommentsStructure` | Sí |
| AU campo a campo | Manual + TSV | Sí |
| G2 dual-pass | Diff pass02/04 | Recomendado |
| Runtime | `verify:wilhelm-de-all-gates` | Post-promote |

---

## 9. Fase B — fixes parser (cerrada 2026-06-30)

| Bug | Causa | Fix |
|-----|-------|-----|
| pass04 hex 6 vacío | `cleanLine` borraba `DIE KOMMENTARE` → `zoneStart=0` → front matter `6. 8. TAUSEND` | `findCommentsZoneStart()` sin `cleanLine` |
| hex 19 sequence vacío | ZWSP antes de `Die Reihenfolge` | `normalizeMarkerLine()` en `findMarker` |
| sequence vacío (misc antes) | `misc` anterior cortaba slice | `firstMarkerAfter()` solo marcadores posteriores |
| hex 27 ausente | `I` rechazado por `length < 2` | Permitir chinese de 1 letra si hay título |
| headers Schuo Gua | `6. Berg und Erde ist: … Nr. 23` | Rechazo en `parseWilhelmDeHexHeaderLine` + anchor |

Test: `node scripts/lib/wilhelm-de-64hex-comments-txt.test.mjs` (VF-FID-W-033).

---

## 10. Fase C — reconcile (cerrada 2026-06-30)

| Artefacto | Ruta |
|-----------|------|
| Reconciliado | `comments/anna/wilhelm-de-64hex-comments-anna-reconciled.json` |
| Reporte disputas | `comments/anna/reconcile-report-latest.json` |
| Comparador HTML | `comments/anna/comparison-viewer.html` (+ copia en `reports/`) |

| Métrica | Valor |
|---------|-------|
| Cobertura reconciliada | **1530/1920** (79.7%) — +3 vs mejor pass solo |
| Filas comparables | 1970 (37 campos, excl. vacíos en ambos) |
| Idénticas pass02=04 | 1419 |
| Disputas heurísticas | **535** (prioridad AU) |
| G0 reconciliado | **PASS** |

Heurística merge: `pickWilhelmDeCommentsDualPassField` (umlauts, menos ruido OCR, prefer pass04 en empate).

---

## 11. Fase D — export TSV AU (2026-06-30)

```bash
npm run export:wilhelm-de-comments-anna-au-tsv
# pilot distinto: npm run export:wilhelm-de-comments-anna-au-tsv -- --pilot=1,2,8,19
```

| Salida | Uso |
|--------|-----|
| `tools/manual-gold/wilhelm-de-comments-au/wilhelm-de-comments-anna-disputes-flat-latest.tsv` | Import Sheets — 551 filas (535 disputed + 12 pass02 + 4 pass04) |
| `tools/manual-gold/wilhelm-de-comments-au/by-hex/hex-NN-disputes.tsv` | Vertical por hex — solo campos en disputa |
| `tools/manual-gold/wilhelm-de-comments-au/wilhelm-de-comments-hex-N-pilot-au.tsv` | Pilot 1/2/8 — 37 campos completos + columnas `contenido_pdf` / `au_estado` |

Columnas AU (contrato en `au-contract.json`):

| Columna | Rol |
|---------|-----|
| `jpg_paginas` | Rango JPG libro (p. ej. `316-327`) — dónde transcribir |
| `contenido_pdf` | **Definitivo** — transcripción literal del impreso |
| `au_estado` | `cerrado` \| `vacio_en_libro` \| `pendiente` |
| `resolucion_disputa` | Auto: `coincide_pass02` \| `coincide_pass04` \| `coincide_ambos` \| `coincide_ninguno` |

**Regla promote:** solo `contenido_pdf` con `au_estado=cerrado|vacio_en_libro` entra al maestro. El reconciliado **nunca** cierra una fila `disputed` sola.

```bash
npm run export:wilhelm-de-comments-anna-au-tsv   # regenerar TSV + jpg_paginas
# Rellenar contenido_pdf + au_estado en pilot/disputes TSV
npm run apply:wilhelm-de-comments-au-gold        # → tools/output/fidelity-gold/wilhelm-de-64hex-comments-au-gold.json
npm run validate:wilhelm-de-comments-au-gold     # gate antes de fase E promote
```

---

## 12. Fase D — AU book-primary JPG (cerrada 2026-06-30)

**Fuente canónica:** JPG 300 DPI `tools/source-pdfs/source jpgs/` (585 páginas, mapa `wilhelm-de-comments-hex-starts.json` + `wilhelm-de-jpg-page-map.mjs`). Erstes Buch (`tools/manual-gold/wilhelm-de-hex-{N}.tsv`) como eco DAS URTEIL / DAS BILD cuando pass02/04 está corrupto.

### Pipeline AU cerrado

```bash
# Rellenar pilot TSV por hex (builder dedicado 1–3; genérico 4–64)
node scripts/fill-wilhelm-de-comments-au-pilot.mjs --hex=N

# Gate por hex (37 campos, au_estado, vacíos esperados hex>2 wen/yong)
node scripts/verify-wilhelm-de-comments-au-pilot.mjs --hex=N

# QA local post-fill
node scripts/jpg-audit-wilhelm-de-comments-au-pilot.mjs --from=1 --to=64
node scripts/scan-wilhelm-de-pilot-real-artifacts.mjs

# Promote gold
npm run apply:wilhelm-de-comments-au-gold
npm run validate:wilhelm-de-comments-au-gold
```

### Resultado final (2026-06-30)

| Gate | Resultado |
|------|-----------|
| Pilot verify hex 1–64 | **64/64 PASS** |
| `scan-wilhelm-de-pilot-real-artifacts` | **0 artefactos** en `contenido_pdf` |
| `jpg-audit` pilot vs builder | **0 mismatches** |
| `validate:wilhelm-de-comments-au-gold` | **PASS** |
| Gold | **2368/2368** campos · **551/551** disputas cerradas |

**Gold:** `tools/output/fidelity-gold/wilhelm-de-64hex-comments-au-gold.json`

**Pilotos:** `tools/manual-gold/wilhelm-de-comments-au/wilhelm-de-comments-hex-{1..64}-pilot-au.tsv` (columna `contenido_pdf` = texto JPG-verificado; `contenido_reconciliado` = pass02 crudo para trazabilidad).

### Builders

| Hex | Builder |
|-----|---------|
| 1–3 | `wilhelm-de-comments-au-pilot-hex{1,2,3}-jpg.mjs` (JPG dedicado) |
| 4–64 | `wilhelm-de-comments-au-pilot-generic.mjs` + overrides en `hex-overrides.mjs` |

**Helpers compartidos** (`wilhelm-de-comments-au-pilot-common.mjs`): `pickBestPassText` (rechaza pass04 basura / back-matter), `cleanPassArtifacts`, `stripBackMatterBleed`, `stripTrailingOcrGarbage`, `cleanRulerNote`, `loadErstesField` para `image_oraculo`, fallback `commentary_image` anclado en párrafo alemán.

**Overrides JPG** (hex con OCR irrecuperable en pass02/04): **10, 25, 43, 64** (+ existentes **3**, **59**).

### Spot-check JPG (muestras verificadas página a página)

| Hex | Páginas libro | Campos |
|-----|---------------|--------|
| 4 | 343 | `ruler_note` |
| 10 | 365 | `ruler_note` (override) |
| 25 | 421 | `ruler_note` (override) |
| 43 | 491 | `ruler_note` (override) |
| 50 | 520–521 | `commentary_image` («Feuer über Holz…») |
| 53 | 533–534 | `image_oraculo`, `commentary_image` |
| 64 | 574, 584–585 | `ruler_note`, `L6_b` sin bleed VERZEICHNIS |

Los ~286 `coincide_ninguno` del jpg-audit son **esperados**: texto limpio ≠ pass02/04 OCR; no indican error si pilot = builder.

### Reglas de campo

- Hex **>2:** `wen_yen`, `wen_yen_note`, `yong_*` → `au_estado=vacio_en_libro` (ausentes en Diederichs 1924).
- Hex **1–2:** sin `sequence` (vacio en libro).
- `image_oraculo`: 2 líneas eco DAS BILD (desde Erstes cuando aplica).
- `commentary_image`: párrafos tras eco BILD, sin duplicar oracle ni bleed de hex siguiente.
- **`chinese_roman`:** siempre desde Erstes Buch (`wilhelm-de-64hex-merged.fields.chinese_roman`); Drittes OCR no gana sobre Zeno.

---

## 13. Meta sync Erstes → Ten Wings (2026-06-30)

Cierre paridad estructural EN↔DE en `chinese_roman` (25 hex vacíos + 8 drift OCR):

```bash
npm run sync:wilhelm-de-comments-meta-from-erstes -- --promote
npm run verify:wilhelm-de-en-structure-parity   # 2368/2368 fill parity
```

| Artefacto | Rol |
|-----------|-----|
| `wilhelm-de-comments-erstes-meta.mjs` | `resolveCommentsChineseRoman` desde book-one |
| `sync-wilhelm-de-comments-meta-from-erstes.mjs` | Patch pilot TSV + optional promote chain |
| `verify-wilhelm-de-en-structure-parity.mjs` | Gate VF-FID-W-038 |

---

## 8. Estado

- [x] Carpetas Anna 02/04 confirmadas (284 + 288 páginas)
- [x] Sandbox `comments/anna/` + scripts extract/gate (VF-FID-W-031/032)
- [x] Primera extracción (2026-06-30): pass02 **1527/1920** (79.5%), pass04 **1519/1920** (79.1%)
- [x] **G0 PASS** en ambos passes (fase B parser — 2026-06-30)
- [x] Dual-pass reconcile (fase C — **1530/1920**, 535 disputas, G0 PASS)
- [x] Export TSV AU disputas + pilot hex 1/2/8 (fase D — `export:wilhelm-de-comments-anna-au-tsv`)
- [x] **AU book-primary JPG 64×37** — gold PASS, 2368/2368 (2026-06-30)
- [x] Promote a merged maestro (fase E — `promote:wilhelm-de-comments-au-to-merged`, 1839/2176 content fill)
- [x] Runtime bundle (`build-hexagram-commentary` → `hexagrams.wilhelm.commentary.json`) — feature branch
- [ ] Merge `feature/wilhelm-de-dataset` → `staging` + smoke app (fase F deploy)
