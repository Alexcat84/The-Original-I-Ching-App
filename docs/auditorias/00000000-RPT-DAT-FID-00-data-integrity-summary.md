# I Ching Data Integrity & Reliability Audit

**Código:** `00000000-RPT-DAT-FID-00 data-integrity-summary` · **Familia:** DAT-FID · **Estado:** reference

This document records the 1:1 fidelity audits performed on the three translator bundles in `@iching-oracle/iching-data`.

**Master audit (open plan and harness):** [20260621-AUD-DAT-FID-01-translator-fidelity-reaudit.md](./20260621-AUD-DAT-FID-01-translator-fidelity-reaudit.md) — **§14 book-primary (2026-06-22)** es la política vigente de verificación.

---

## Política vigente · book-primary + ctext Zhou Yi (2026-06-22)

Wilhelm y Legge: fidelidad 1:1 contra **ediciones locales** (`tools/source-pdfs/`, ver `manifest.json`). Mirrors web (Parma, sacred-texts) **obsoletos** como gate — ver §14 del master audit.

**Zhou Yi (excepción deliberada):** gold operativo = **ctext.org** (Chinese Text Project), no PDF 注疏 local. Detalle e incidente 咸/鹹: [`20260622-AUD-DAT-FID-04-fidelity-mutation-master.md`](./20260622-AUD-DAT-FID-04-fidelity-mutation-master.md) §Parte H.

**Gate canónico Wilhelm + Legge (cerrado):**

```bash
npm run build:data
npm run verify:hexagram-fidelity   # 513/513 Wilhelm + 514/514 Legge vs libros locales
```

**Gate canónico Zhou Yi (cerrado):**

```bash
npm run build:data
npm run scan:zhouyi-corruption                  # exit 0
npm run check:hex-glyph-uniqueness              # sin nombres/glyphs duplicados
npm run verify:hexagram-fidelity:zhouyi-ctext   # 514/514 vs ctext.org
```

Reporte Wilhelm/Legge: `reports/hexagram-fidelity-2026-06-22T01-59-28-099Z.json`

---

## Auditorías realizadas

### Última auditoría 1:1 · 21 de junio de 2026 (corregida tras hallazgo de re-verificación)

| Traductor | Gold declarado | Resultado verify | Notas |
|-----------|----------------|------------------|-------|
| **Legge** | sacred-texts.com (ic + icap2) | **100%** (514/514 campos oráculo) | Juicio, imagen (Great Symbolism), líneas y `yongJiu`/`yongLiu` |
| **Zhou Yi** | ctext.org (API + 大象) | **100%** (514/514 campos oráculo) | 卦辞, 爻辞, 用九/六, 大象 |
| **Wilhelm** | Uni Parma mirror + suplemento Baynes (edición impresa 1950) | **100%** (514/514 campos oráculo) | 6 suplementos donde Parma omite la sección/línea: **hex 56 judgment**, hex 20 línea 5, hex 21 líneas 2 y 3, hex 26 línea 3, hex 52 línea 2. Los seis contrastados página a página contra *The I Ching or Book of Changes* (Wilhelm/Baynes, Princeton University Press, 1950) |

**Reporte:** `reports/hexagram-fidelity-2026-06-21T20-26-09-152Z.json`

**Corrección sobre el cierre anterior (mismo día):** una re-verificación independiente encontró que el cierre previo de esta auditoría (report `19-45-04-900Z`) tenía dos bugs en el propio harness que enmascaraban una regresión real:

1. **`textsMatch("", "")` devolvía `true`** (`hexagram-fidelity-normalize.mjs`) — un campo vacío en el gold **y** vacío en el bundle se contaba como "match" en vez de señalarse. Esto ocultaba que el re-ingest desde Parma (Fase 3, "líneas siempre desde Parma, sin merge adamblvck") había **vaciado 5 líneas Wilhelm** que antes tenían texto correcto (hex 20/L5, 21/L2, 21/L3, 26/L3, 52/L2) — Parma genuinamente no las tiene, igual que con el judgment del hex 56, pero a diferencia de ese campo no se les creó ningún suplemento.
2. **La matriz de Legge omitía `yongLiu`/`yongJiu` de la comparación por completo** si el propio parser gold no lo extraía (`if (yongField && gold.supernumerary)`, asimétrico respecto a Zhou Yi) — por eso el total de Legge daba 513 en vez de 514. El campo `yongLiu` del hex 2 estaba **completamente ausente** del bundle (no vacío: la clave no existía). El texto sí está en el HTML cacheado de sacred-texts; era un bug puro de parser (`isNumberedLine` exige que el párrafo empiece con "The first/second/.../sixth…", y el párrafo de `yongLiu`/`yongJiu` empieza con "(The lines of this hexagram are all…)", así que nunca matcheaba).

**Resolución:**
- `hexagram-fidelity-diff.mjs`: ambos lados vacíos → `missing_gold`, nunca `match`.
- `verify-hexagram-fidelity.mjs` (Legge): `yongJiu`/`yongLiu` siempre entran a la matriz (514 campos, simétrico con Zhou Yi).
- `hexagram-fidelity-legge-sacred.mjs`: nueva detección directa del párrafo supernumerario por su frase fija, independiente del heading de sección (ausente en algunas páginas individuales).
- `hexagram-fidelity-wilhelm-baynes-supplement.mjs`: extendido de "solo judgment" a también 5 líneas (`WILHELM_BAYNES_LINE_SUPPLEMENTS`). Los seis pasajes provienen de la edición impresa Wilhelm/Baynes (Princeton University Press, 1950); verificados página a página en libro físico el 2026-06-21 (ver tabla abajo).
- `tools/ingest-wilhelm.mjs`: las líneas ya no se sobrescriben con vacío cuando Parma no tiene el dato — aplican la misma política Parma→tier2→existente que ya regía para `judgment`/`image`.

**Alcance del verify:** solo textos del oráculo (judgment/image/lines, yongJiu/yongLiu). Comentarios editoriales Wilhelm/Legge excluidos por diseño del parser.

**Comandos reproducibles:**

```bash
npm run ingest:translations
npm run build:data
npm run verify:hexagram-fidelity
npm run scan:zhouyi-corruption   # gate Zhou Yi = 0
```

**Gate adicional (no estaba en los gates documentados de Fase 1-4; se incorpora aquí):** `npx vitest run` en `packages/iching-data` (`src/index.test.ts`) — verifica invariantes absolutos (todo campo oráculo no vacío, `yongJiu`/`yongLiu` presentes en hex 1/2) independientemente de cualquier fuente gold. Este test existía desde antes de la Fase 1 pero **no se había ejecutado** como parte de los gates de Fase 1-4; correrlo hubiera detectado la regresión de inmediato sin depender del harness de fidelidad.

### Cierre Legge book-primary PDF · 22 de junio de 2026

| Campo | Detalle |
|-------|---------|
| **Gold** | Escaneo Oxford SBE XVI (manifest) + 15 parches foto-verificados |
| **EPUB** | Solo diagnóstico — no entra en sync/verify producción |
| **Gate** | `npm run verify:hexagram-fidelity:pdf-legge` → **514/514** |
| **Auditoría** | [`20260622-AUD-DAT-FID-03-legge-pdf-book-primary.md`](20260622-AUD-DAT-FID-03-legge-pdf-book-primary.md) |
| **Rama** | `fix/legge-pdf-fidelity-100` · `e8ba543` |

### Verificación en libro físico · Wilhelm/Baynes 1950

**Obra:** Wilhelm, Richard; Baynes, Cary F. *The I Ching or Book of Changes*. Princeton University Press, 1950 (Bollingen Series XIX).

| Campo | Hex | Página (ed. 1950) | Texto oracle (verificado) |
|-------|-----|-------------------|---------------------------|
| judgment | 56 Lü / The Wanderer | p. 231 | THE WANDERER. Success through smallness… (+ comentario Wilhelm, 1.er párrafo) |
| line 5 | 20 Kuan / Contemplation | pp. 88-89 | Contemplation of my life. / The superior man is without blame. |
| line 2 | 21 Shih Ho / Biting Through | pp. 92-93 | Bites through tender meat… / No blame. |
| line 3 | 21 | pp. 92-93 | Bites on old dried meat… / Slight humiliation. No blame. |
| line 3 | 26 Ta Ch'u / Taming Power of the Great | p. 112 | A good horse that follows others… / It furthers one to have somewhere to go. |
| line 2 | 52 Kên / Keeping Still | p. 215 | Keeping his calves still… / His heart is not glad. |

**Módulo:** `scripts/lib/hexagram-fidelity-wilhelm-baynes-supplement.mjs` (`WILHELM_BAYNES_1950_CITATION`, `WILHELM_BAYNES_SUPPLEMENT_PAGES`).

---

## Precedente · biblioteca Zhou Yi 咸/鹹 (2026-06-21)

Dataset intermedio `freizl/yijing` (commit `8063006`): hex **31** llevaba `name: "鹹"` (salado) en lugar de **`咸`** (Influencia); hex **19** repetía **鹹** en `鹹臨`. En la biblioteca, el mismo glifo podía asociarse a dos hexagramas al buscar o navegar. Cierre: re-ingesta desde **ctext.org** (`0e003ea`); gates actuales confirman 0 corrupción y nombres únicos.

---

## Precedente · hex 23 metadata (2026-05-10)

Corrección puntual del trigrama inferior en metadata Wilhelm (hex 23: Kūn, no Lì). Precedente válido; la auditoría 2026-06-21 es la referencia actual para fidelidad literaria 1:1.

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-05-10 |
| **Fix** | `scripts/iching_wilhelm_translation.mjs` + `npm run build:data` |
| **Alcance** | Solo metadata trigrama inferior hex 23 |

---

## Ongoing reliability

Wilhelm/Legge: ingesters book-primary (`sync:*-from-pdf-gold`). Legge gate: `verify:hexagram-fidelity:pdf-legge` (514/514). Zhou Yi: `tools/ingest-zhouyi-ctext.mjs` → gold **ctext.org**. Antes de promover cambios de dataset: gates PDF W+L y, si tocó Zhou Yi, `scan:zhouyi-corruption` + `verify:hexagram-fidelity:zhouyi-ctext`.

*Last 1:1 audit date: 22 June 2026 (Zhou Yi ctext + W/L PDF gates)*
