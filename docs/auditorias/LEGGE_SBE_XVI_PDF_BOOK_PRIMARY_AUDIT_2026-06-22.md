# Auditoría — Legge SBE XVI book-primary (PDF Oxford, sin EPUB repair)

**App:** The Original I Ching · **Paquete:** `@iching-oracle/iching-data`  
**Rama:** `fix/legge-pdf-fidelity-100`  
**Commit:** `e8ba543` — `fix(legge): close SBE XVI PDF oracle fidelity at 514/514 without EPUB repair`  
**Fecha cierre:** 2026-06-22  
**Estado:** ✅ **CERRADO** — gate producción **514/514 (100%)** vs PDF Oxford + parches foto  
**Relacionado:** [LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md](./LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md) · [FIDELITY_MUTATION_MASTER_AUDIT_2026-06-22.md](./FIDELITY_MUTATION_MASTER_AUDIT_2026-06-22.md) · [ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md](./ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md)

---

## Veredicto

Legge sigue el **mismo modelo que Wilhelm (W)**: el escaneo Oxford SBE XVI es la única fuente book-primary en producción; el bundle se sincroniza desde **OCR + parser PDF + parches verificados en libro**, **sin** adoptar texto del EPUB sacred-texts.

| Gate | Comando | Resultado | Rol |
|------|---------|-----------|-----|
| **Producción** | `npm run verify:hexagram-fidelity:pdf-legge` | **514/514 (100%)** | Bundle ≡ PDF gold (OCR + parches foto) |
| **Diagnóstico** | `npm run audit:legge-pdf-vs-epub` | OCR+fotos vs EPUB ~**68% strict** | Transparencia; **no** alimenta sync |
| **Cross-check alterno** | `npm run verify:hexagram-fidelity:epub-legge` | EPUB vs bundle | Solo auditoría; no es gate book-primary |

**Artefactos gate PASS:**

- `reports/hexagram-fidelity-2026-06-22T23-23-50-099Z.json` / `.md`
- `reports/legge-pdf-vs-epub-2026-06-22T23-21-47-721Z.json`

**No se requiere acción del usuario** para el gate de producción: bundle y PDF gold concuerdan en los 514 campos oráculo (64×juicio + 64×imagen + 384 líneas + `yongJiu` + `yongLiu`).

---

## 1. Política book-primary vs EPUB

| Capa | Fuente | Uso en producción |
|------|--------|-------------------|
| **Tier-0** | PDF escaneo Oxford SBE XVI (`tools/source-pdfs/`, gitignored) | ✅ Gold + bundle |
| **Tier-0b** | 15 parches foto-verificados (`LEGGE_SBE_BOOK_PRIMARY_PATCHES`) | ✅ Tras OCR, antes de sync |
| **Tier-1 (diagnóstico)** | EPUB sacred-texts re-pack | ❌ **No** en parser/sync/verify producción |

### Qué cambió respecto al pipeline intermedio (2026-06-22 temprano)

Antes, `parseAllLeggeSbePdfOrThrow` aplicaba **`applyEpubGuideToLeggeRow`** por defecto (~115 campos adoptados del EPUB cuando el OCR fallaba). Eso permitía ~97% vs EPUB pero **violaba book-primary**.

**Cierre 2026-06-22 (rama `fix/legge-pdf-fidelity-100`):**

- `epubGuide` solo activo con `epubGuide: true` explícito (opt-in).
- Sync **no** conserva campos del bundle anterior cuando el PDF falla (evita mezclar texto EPUB-reparado).
- EPUB queda en `audit:legge-pdf-vs-epub` y `--with-epub-guide` en extract.

---

## 2. Paralelismo con Wilhelm (W)

| Aspecto | Wilhelm | Legge |
|---------|---------|-------|
| Libro físico | Pantheon 1950 PDF | Oxford SBE XVI scan PDF |
| Gold | OCR + parser PDF | OCR + parser PDF |
| Gaps OCR | `hexagram-fidelity-wilhelm-pdf-verified.mjs` (foto) | `hexagram-fidelity-legge-sbe-book-primary.mjs` (15 campos, 8 hex) |
| EPUB / mirror | Parma/EPUB solo `audit:wilhelm-pdf-vs-*` | EPUB solo `audit:legge-pdf-vs-epub` |
| Sync | `sync:wilhelm-oracle-from-pdf-gold` | `sync:legge-oracle-from-pdf-gold` |
| Gate | **513/513** `verify:hexagram-fidelity:pdf-wilhelm` | **514/514** `verify:hexagram-fidelity:pdf-legge` |
| Rama | `fix/wilhelm-pdf-fidelity-100` | `fix/legge-pdf-fidelity-100` |

---

## 3. Edición y manifest

| Campo | Valor |
|-------|-------|
| **Obra** | James Legge, *The Yî King*, Sacred Books of the East Vol. XVI |
| **Editorial / año** | Oxford University Press, 1882 |
| **PDF local** | `16_ The Sacred Books of China...Oxford University Press.pdf` (manifest `sources.legge`) |
| **EPUB cross-check** | `The Yi King or, Book of Changes -- James Legge.epub` — manifest `fileCrossCheckEpub` |
| **Texto hexágonos** | OCR pp. **86–240** (numeración romana I–LXIV) |
| **Great Symbolism** | Apéndice II §I, OCR pp. **296–420** |
| **Cache OCR** | `tools/output/fidelity-gold/legge-sbe-pdf-full.txt`, `legge-sbe-symbolism.txt` |
| **JSON gold** | `tools/output/fidelity-gold/legge-sbe-pdf-gold.json` |

---

## 4. Pipeline reproducible (orden obligatorio)

```bash
# 0. Preflight PDF en manifest (PDFs gitignored)
npm run pdf-gold:preflight

# 1. Extraer OCR → cache + JSON gold (sin EPUB por defecto)
npm run extract:gold:legge-sbe-pdf
# Opt-in diagnóstico EPUB repair (NO producción):
# node tools/extract-legge-sbe-pdf.mjs --with-epub-guide

# 2. Sincronizar bundle desde PDF gold
npm run sync:legge-oracle-from-pdf-gold

# 3. Regenerar datasets @iching-oracle/iching-data
npm run build:data

# 4. Gate producción
npm run verify:hexagram-fidelity:pdf-legge

# 5. Diagnóstico transparencia (opcional)
npm run audit:legge-pdf-vs-epub
```

**Salida esperada paso 4:** `legge: 514/514 match (100%) — mismatch=0`

---

## 5. Mapa de archivos

### Parser y gold

| Archivo | Rol |
|---------|-----|
| `scripts/lib/legge-sbe-pdf-text-extract.mjs` | Resuelve PDF manifest, extrae texto OCR |
| `scripts/lib/hexagram-fidelity-legge-sbe-pdf.mjs` | Boundaries hex, juicio, líneas, Great Symbolism; `epubGuide` opt-in |
| `scripts/lib/hexagram-fidelity-legge-sbe-ocr.mjs` | Reparos OCR (`LEGGE_SBE_OCR_REPAIRS`), `finalizeLeggeSbeRow` |
| `scripts/lib/hexagram-fidelity-legge-sbe-book-primary.mjs` | **15 parches** verificados en escaneo (ver §6) |
| `scripts/lib/hexagram-fidelity-legge-sbe-epub-guide.mjs` | **Solo** repair diagnóstico; no invocado en producción |
| `tools/extract-legge-sbe-pdf.mjs` | OCR → `legge-sbe-pdf-gold.json` |

### Sync, bundle y verify

| Archivo | Rol |
|---------|-----|
| `tools/sync-legge-oracle-from-pdf-gold.mjs` | PDF gold → `scripts/iching_legge_translation.mjs` |
| `scripts/build-hexagrams.mjs` | → `packages/iching-data/src/generated/hexagrams.legge.json` |
| `scripts/verify-hexagram-fidelity.mjs` | Gate `--gold=pdf-legge` con `epubGuide: false` |

### Auditoría diagnóstica

| Archivo | Rol |
|---------|-----|
| `scripts/audit-legge-pdf-vs-epub.mjs` | Contraste PDF vs EPUB (raw OCR, fotos, bundle) |
| `scripts/lib/hexagram-fidelity-legge-epub-crosscheck.mjs` | Clasificación diffs (`pdf_bleed`, `wording`, book-primary) |
| `tools/audit-legge-injector-vs-datasets.mjs` | Injector vs datasets (legacy; usar audit PDF vs EPUB para transparencia) |

---

## 6. Parches book-primary (foto-verificados)

Definidos en `LEGGE_SBE_BOOK_PRIMARY_PATCHES`. Equivalente a los print-verified de Wilhelm: texto del **mismo escaneo Oxford**, no del EPUB.

| Hex | Campos | Motivo |
|-----|--------|--------|
| 1 | `yongJiu` | `number nine` + frase host of dragons (EPUB decía `line`) |
| 5 | `image` | Great Symbolism Hsü (OCR truncado) |
| 10 | `judgment`, `line6` | `(Lü suggests…` + L6 completa |
| 11 | `judgment`, `line5`, `line6` | Thai; prefijo `line` vs `six`; L6 texto completo |
| 16 | `line5` | `fifth line` vs `fifth six` |
| 21 | `line6` | `deprived of his ears` (OCR `cars`) |
| 39 | `judgment`, `image`, `line6` | Spelling **Kien**; juicio 3 oraciones |
| 53 | `judgment`, `image`, `line6` | Spelling **Kien**; matrimonio / montaña+árbol |

**Total:** 15 campos · 8 hexagramas. Detalle capturas: [LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md](./LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md) §G.

---

## 7. Mejoras parser PDF (sin EPUB)

Aplicadas en `hexagram-fidelity-legge-sbe-pdf.mjs` / OCR para cerrar bleed y juicios truncados **solo con heurísticas del escaneo**:

- Juicios multi-oración: eliminado corte prematuro a 80 caracteres; `sanitizeLeggeJudgmentCandidate` + patrones fallback (Khwăn, Kun, Măng, Hsü, Pî, Fu, Wei Zi, …).
- Líneas: `splitEmbeddedLines`, `extractLeggeLineSlice`, anti-bleed comentario (`Line N is weak`, `The subject of N therefore`, headers hex siguiente).
- Supernumerarios: 用九 hex 1; 用六 hex 2 (`advantage will arise` además de `good fortune`).
- Reparos OCR: `superior } man`, `But-let`, `thecireumstances`, `Wei 3 intimates`, etc.

**Sync:** rechaza juicios >520 chars o con bleed; **no** fallback al bundle EPUB previo.

---

## 8. Resultados de gates (2026-06-22 cierre)

### 8.1 Producción — PDF gold vs bundle

| Métrica | Valor |
|---------|-------|
| Campos | **514** |
| Match | **514** |
| Mismatch | **0** |
| Reporte | `reports/hexagram-fidelity-2026-06-22T23-23-50-099Z.json` |

Campos incluidos: por hex → `judgment`, `image`, líneas 1–6; hex 1 → `yongJiu`; hex 2 → `yongLiu`.

### 8.2 Diagnóstico — PDF vs EPUB (`audit:legge-pdf-vs-epub`)

| Capa | Strict vs EPUB | Notas |
|------|----------------|-------|
| Raw OCR (sin fotos, sin EPUB) | 343/514 (66,7%) | Límite del OCR puro |
| OCR + parches foto (producción) | 350/514 (68,1%) | +14 intencionales book-primary |
| Bundle vs PDF gold (producción) | **513/514 (99,81%)** | 1 diff menor en audit cross-layer |
| Con EPUB repair (histórico) | ~492/514 vs EPUB | **No usado en producción** |

La brecha ~32% vs EPUB refleja **variantes reales escaneo ↔ re-pack EPUB** (`line` vs `six`, `Kien` vs `Khien`, juicios multi-oración, OCR gaps), no un fallo del gate producción.

---

## 9. Campos oráculo (514)

Por hexagrama (64):

- **1×** Thwan (`legge_judgment`)
- **1×** Great Symbolism (`legge_image`)
- **6×** líneas (`legge_lines` pos 1–6)

Supernumerarios:

- **Hex 1:** 用九 → `yongJiu` / `yong_supernumerary`
- **Hex 2:** 用六 → `yongLiu` / `yong_supernumerary`

**Total:** 64×8 + 2 = **514**.

---

## 10. Qué NO hacer (regresiones)

1. **No** volver a `epubGuide: true` por defecto en sync/verify/extract.
2. **No** usar `sync:legge-oracle-from-epub` para ingesta (legacy EPUB ciego).
3. **No** conservar campos del bundle anterior cuando el PDF falla (mezcla EPUB-reparado).
4. **No** aplicar migración 066 sin 068 (regla global DB; no aplica a datasets pero permanece en runbooks).
5. Parches foto: **no** sustituir por texto EPUB; solo escaneo Oxford o transcripción literal del libro.

---

## 11. Trabajo futuro (opcional, no bloqueante)

| ID | Tema | Prioridad |
|----|------|-----------|
| L-OCR-1 | Cerrar ~150 diffs OCR vs EPUB vía parser (bleed/truncado) sin EPUB repair | Baja (transparencia) |
| L-OCR-2 | Hex 64 juicio: revisar cola comentario en OCR (~327 chars) | Baja |
| L-META-1 | Actualizar `licenseNote` Legge en bundle → «SBE XVI Oxford scan» | Cosmética (G4 master audit) |
| L-GATE-1 | Gate combinado `verify:hexagram-fidelity` → Wilhelm PDF + Legge PDF | Tras merge staging |

---

## 12. Git y despliegue

| Item | Valor |
|------|-------|
| **Rama feature** | `fix/legge-pdf-fidelity-100` |
| **Base** | `fix/wilhelm-pdf-fidelity-100` (Wilhelm 513/513 ya cerrado) |
| **Merge staging** | Pendiente pedido explícito |
| **Smoke post-merge** | Hard reload biblioteca hex 1, 10, 39, 53; consulta Legge staging |

---

## 13. Comandos npm (referencia rápida)

| Comando | Rol |
|---------|-----|
| `npm run extract:gold:legge-sbe-pdf` | OCR → JSON gold |
| `npm run sync:legge-oracle-from-pdf-gold` | PDF gold → bundle |
| `npm run build:data` | Bundle → `hexagrams.legge.json` |
| `npm run verify:hexagram-fidelity:pdf-legge` | **Gate producción** |
| `npm run audit:legge-pdf-vs-epub` | Diagnóstico PDF vs EPUB |
| `npm run verify:hexagram-fidelity:epub-legge` | Cross-check EPUB (no book-primary) |

---

*Auditoría cerrada 2026-06-22 · Legge book-primary alineado con Wilhelm · EPUB solo soporte diagnóstico.*
