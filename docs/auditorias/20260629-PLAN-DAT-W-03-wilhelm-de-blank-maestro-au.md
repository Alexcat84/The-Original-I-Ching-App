# Wilhelm DE — maestro vacío + AU por capturas (modelo W/L)

**Código:** `20260629-PLAN-DAT-W-03 wilhelm-de-blank-maestro-au` · **Familia:** DAT-W · **Estado:** open

- **Fecha:** 2026-06-29
- **Rama:** `feature/wilhelm-de-dataset`
- **Relacionado:** `20260628-AUD-DAT-W-02 wilhelm-de-source-of-truth`, `20260623-AUD-DAT-MAESTRO-W-01 wilhelm-txt-maestro`

---

## 1. Objetivo

Construir un **maestro alemán vacío** con la misma estructura que Baynes EN (33 campos × 64 hex), rellenar por **AU campo a campo** con capturas del libro Diederichs 1924, calibrar el parser OCR con marcadores alemanes, y solo entonces promover a runtime (sin tocar `wilhelm-de-64hex-merged.json` hasta cierre AU).

---

## 2. Anatomía Erstes Buch (DE)

| Sección libro | Marcador OCR | Campos maestro |
|---------------|--------------|----------------|
| Apertura hex | (antes de `DAS URTEIL`) | `intro`, `trigrama_arriba`, `trigrama_abajo`, `nombre` |
| Das Urteil | `DAS URTEIL` | `judgment_oraculo`, `judgment_comentario` |
| Das Bild | `DAS BILD` | `image_oraculo`, `image_comentario` |
| Die einzelnen Linien | `Die einzelnen Linien` | `L1–L6_etiqueta`, `L*_oraculo`, `L*_comentario` |
| Yong (hex 1–2) | `Wenn lauter Neunen/Sechsen` | `yong_etiqueta`, `yong_oraculo`, `yong_comentario` |

**Nota:** comentario Wilhelm **libro I** (33 campos Baynes) ≠ **Ten Wings** (Drittes Buch — maestro blank separado, fase posterior).

---

## 3. Tabla 33 campos (EN ↔ DE ↔ etiqueta libro)

| # | Campo maestro | Etiqueta EN (Baynes) | Sección DE |
|---|---------------|----------------------|------------|
| 1 | `hex` | meta | número |
| 2 | `nombre` | meta | título alemán |
| 3 | `chinese` | meta | hanzi |
| 4 | `chinese_roman` | meta | Wade-Giles |
| 5 | `hex_font` | meta | glifo |
| 6 | `trigrama_arriba` | meta | oben … |
| 7 | `trigrama_abajo` | meta | unten … |
| 8 | `intro` | intro | párrafos pre-Urteil |
| 9 | `judgment_oraculo` | judgment oracle | texto bajo `DAS URTEIL` (solo oráculo) |
| 10 | `judgment_comentario` | judgment commentary | Wilhelm hasta `DAS BILD` |
| 11 | `image_oraculo` | image oracle | texto bajo `DAS BILD` |
| 12 | `image_comentario` | image commentary | Wilhelm hasta `Die einzelnen Linien` |
| 13–15 | `L1_*` | line 1 | etiqueta / oráculo / comentario |
| 16–18 | `L2_*` | line 2 | … |
| 19–21 | `L3_*` | line 3 | … |
| 22–24 | `L4_*` | line 4 | … |
| 25–27 | `L5_*` | line 5 | … |
| 28–30 | `L6_*` | line 6 | … |
| 31–33 | `yong_*` | yong | hex 1 y 2 solamente |

---

## 4. Marcadores DE para partición oráculo / comentario

Inventario inicial (parser v2):

| Marcador | Uso |
|----------|-----|
| `Dem ursprünglichen Sinne nach` | Inicio comentario Urteil (hex 1) |
| `klärung des Kungtse` / `Klärung des Kungtse` | Comentario clásico inline |
| `Bemerkung:` | Nota Wilhelm |
| `Auf das menschliche Gebiet` | Transición macro → micro |
| `Der obere Strich` / `Der untere Strich` | Comentario de línea |
| `Kungtse sagt` | Cita atribuida |
| `Sehr früh hat sich das Nachdenken` | Comentario Urteil |
| `Der Weise entnimmt` / `Die Verdoppelung des Zeichens` | Comentario Bild |
| `Der Drache hat in China` | Comentario L1 hex 1 |
| `So macht der Edle` | Comentario Bild |
| `~~~~` | Artefacto OCR antes de bloque comentario |

Heurística residual (120 chars + gap 5 líneas) solo si ningún marcador coincide.

---

## 5. Artefactos y pipeline

```bash
npm run extract:wilhelm-de-from-zeno:all              # → zeno-extract-latest.json
npm run promote:wilhelm-de-zeno-to-merged             # → wilhelm-de-64hex-merged.json (runtime maestro)
npm run sync:wilhelm-de-translation-module
npm run extract:gold:wilhelm-de-pdf
npm run build:data
npm run verify:wilhelm-de-all-gates
npm run audit:wilhelm-de-contamination
npm run init:wilhelm-de-blank-maestro                 # scaffold AU (Zhou Yi symbols)
npm run export:wilhelm-de-64hex-audit-csv
npm run fill:wilhelm-de-book-one-au-pilot -- --hex=1,2,8   # bootstrap AU pilot Erstes Buch
npm run compare:wilhelm-de-book-one-au-sources -- --hex=1,2,8
npm run verify:wilhelm-de-book-one-au-pilot -- --hex=1
```

| Artefacto | Ruta | runtimeIngest |
|-----------|------|---------------|
| **Merged maestro (Zeno)** | `wilhelm-de-64hex-merged.json` | **true** |
| Zeno extract mirror | `wilhelm-de-64hex-zeno-extract-latest.json` | false |
| Blank / zeno-gold AU | `wilhelm-de-64hex-blank.json` | **false** |
| OCR merged archivado | `tools/output/archive/wilhelm-de-64hex-merged-ocr-*.json` | false |
| Parser v2 (legacy) | `wilhelm-de-64hex-parsed-v2.json` | false |
| Pilot TSV Erstes Buch | `tools/manual-gold/wilhelm-de-book-one-au/wilhelm-de-book-one-hex-{N}-pilot-au.tsv` | n/a |
| AU contract Erstes Buch | `tools/manual-gold/wilhelm-de-book-one-au/au-contract.json` | n/a |

---

## 6. Gates

| Gate | Comando | Alcance |
|------|---------|---------|
| **G0 blank** | `node scripts/lib/wilhelm-de-blank-maestro.test.mjs` | 64 hex, 33 campos, orden Baynes, pasteables vacíos |
| **G2-DE split (piloto)** | `node scripts/lib/validate-wilhelm-de-field-split-g2.test.mjs` | hex 1/2/8 vs gold TSV |
| **Split smoke** | `node scripts/lib/wilhelm-de-commentary-split.test.mjs` | marcadores + L*_comentario no vacíos |

---

## 7. AU piloto (hex 1, 2, 8)

Gold TSV bootstrap generado desde parser v2 (`fuente_captura=parser-v2-marker-bootstrap`). **Reemplazar** con capturas del libro físico:

| Campo | Captura sugerida |
|-------|-----------------|
| intro + trigramas | Página de apertura (antes de DAS URTEIL) |
| judgment_oraculo | Solo oráculo bajo DAS URTEIL |
| judgment_comentario | Bloque Wilhelm hasta DAS BILD |
| image_* | Igual bajo DAS BILD |
| L1–L6 | Etiqueta + oráculo + comentario por línea |
| yong | Solo hex 1 y 2 |

Formato TSV: `campo\tcontenido_de\tfuente_captura`

---

## 8. Estado actual

| Fase | Estado |
|------|--------|
| Fase 1 — scaffold blank + G0 + CSV | **Implementado** |
| Fase 2 — este documento | **Implementado** |
| Fase 3 — extract Zeno 64 hex + blank prefill | **Implementado** |
| Fase 4 — marcadores DE + split + tests | **Implementado** |
| Fase 5 — promote Zeno → merged | **Implementado** (2026-06-30) |
| Fase 6 — ingest runtime (sync + build + gates) | **Implementado** en `feature/wilhelm-de-dataset` |
| Fase 7 — AU PDF/JPG físico 64×33 | **En curso** (piloto 1/2/8 bootstrap 2026-06-30) |
| Fase 8 — `/audits` + merge staging | **Pendiente** |

Ver hitos cerrados en `20260628-AUD-DAT-W-02` § Switch runtime (2026-06-30).

---

## 9. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Mezclar merged con blank | Archivos separados; manifest `runtimeIngest: false` en blank/v2 |
| Gate 514/514 falsa confianza | G2-DE-field-split + comparador EN base |
| Confundir Ten Wings con libro I | Solo 33 campos Baynes en este hilo |
| Gold bootstrap ≠ capturas | Re-export TSV tras AU; gate G2 detecta drift |

---

## 10. Fase 7 — hallazgos (Erstes Buch AU)

### H1 — Drift Zeno runtime vs pass03/JPG-anchor (CERRADO diagnóstico piloto)

| Hex | Págs. | Coincide Zeno | Diff Zeno | Notas |
|-----|-------|---------------|-----------|-------|
| 1 | 23–27 | 19/33 | 14/33 | `judgment_comentario` +426 chars pass03 vs Zeno; intro −26 |
| 2 | 28–31 | 16/33 | 17/33 | Capitalización `Fördernd` vs `fördernd` en `judgment_oraculo` |
| 8 | 48–50 | 12/30* | 18/30 | `yong_*` vacío (3); `ob` vs `Ob` en `judgment_oraculo` |

\*30 campos pasteables (sin yong vacío).

**Implicación:** runtime `wilhelm-de-64hex-merged.json` (Zeno) **no** es attestation JPG. La AU Erstes Buch debe cerrar campo a campo contra JPG antes de re-promover merged.

Report: `npm run compare:wilhelm-de-book-one-au-sources -- --hex=1,2,8`

### H2 — Infraestructura AU Erstes Buch (CERRADO bootstrap)

| Artefacto | Ruta |
|-----------|------|
| Contrato AU | `tools/manual-gold/wilhelm-de-book-one-au/au-contract.json` |
| Pilot TSV | `wilhelm-de-book-one-hex-{N}-pilot-au.tsv` |
| Fill | `npm run fill:wilhelm-de-book-one-au-pilot` (`AU-FID-W-042`) |
| Verify | `npm run verify:wilhelm-de-book-one-au-pilot` (`AU-FID-W-043`) |
| Compare | `npm run compare:wilhelm-de-book-one-au-sources` (`AU-FID-W-044`) |

**Política bootstrap:** todos los campos no-vacíos arrancan `au_estado=pendiente`; `contenido_pdf` = pass03 anclado a páginas JPG (referencia OCR, **no** cierre AU).

### H3 — Próximo ritual por hex (PENDIENTE)

1. Transcribir/corregir `contenido_pdf` campo a campo vs JPG (`pp. 23–212` Erstes Buch).
2. Marcar `au_estado=cerrado` o `vacio_en_libro`.
3. `verify:wilhelm-de-book-one-au-pilot --hex=N` → PASS.
4. Tras 64/64: apply AU gold → promote merged (sin tocar runtime hasta entonces).

**Calibración piloto:** hex **1** (Wen Yen/yong), **2** (yong), **8** (sin yong, intro corta).
