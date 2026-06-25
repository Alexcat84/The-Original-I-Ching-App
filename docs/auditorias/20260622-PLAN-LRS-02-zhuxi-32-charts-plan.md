# Plan de implementación — Zhu Xi 32 diagramas + regla clásica 3 líneas
**Código:** `20260622-PLAN-LRS-02 zhuxi-32-charts-plan` · **Familia:** LRS · **Estado:** open


**Fecha:** 22 jun 2026 · **Revisión:** v2.2 (Gate 0 cerrado definitivamente)  
**Estado:** **CERRADO.** Gate 0 resuelto al 100%. **Fases A→E CANCELADAS** — innecesarias.  
**Gate 0 (22 jun 2026): EJECUTADO Y CERRADO** — ver §0.A (primera sesión, tentativo) y **§0.B (cierre definitivo)**.  
**VEREDICTO FINAL:** El sistema de 32 charts (Fig. 19) **no es un método adicional** — es una re-derivación geométrica de **las mismas reglas por conteo** que el motor ya implementa. Una "tercera opción Zhu Xi 32-charts" produciría salida **idéntica** al Zhu Xi clásico ya en staging. **No se implementa.** Motor actual verificado **correcto** (incl. `includes(1)` para n=3, ahora **confirmado exacto**).  
**Audiencia:** ejecutor + auditoría interna  
**Validación externa:** [`20260622-EXT-DAT-FID-05-external-opus-validation.md`](20260622-EXT-DAT-FID-05-external-opus-validation.md) (v2.1)  
**Índice maestro:** [`20260622-AUD-DAT-FID-04-fidelity-mutation-master.md`](20260622-AUD-DAT-FID-04-fidelity-mutation-master.md) §Parte E-F  
**Prerequisito:** [`20260622-AUD-MUT-04-mutation-rules-pdf-gold.md`](20260622-AUD-MUT-04-mutation-rules-pdf-gold.md)  
**Rama sugerida:** `feat/zhuxi-32-charts-lookup` (desde `staging` actualizado)

> **DECISIÓN DE PRODUCTO (Alexis, 22 jun 2026): GREENFIELD.** Sin usuarios reales ni consultas históricas. Comportamiento Zhu Xi actual = default pre-lanzamiento. Cambios post Gate 0 = **forward-only** (comportamiento canónico día 1). Resuelve sign-off de producto D0.2. **No elimina** Gate 0 técnico (D0.1/D0.2 con cita de folio = especificación del motor).

---

## 0. Objetivo

Portar el motor Zhu Xi de **reglas por conteo** (operativas, validadas en tests actuales) a la práctica clásica completa de Adler/Yixue Qimeng:

1. **20 casos de 3 líneas cambiantes:** primeros 10 → chen (primario) gobierna; últimos 10 → hui (transformado) gobierna.  
   **Nota v2 (Opus 4.8):** si D0.1 confirma orden lexicográfico en Adler, la regla actual `includes(1)` ya es **exacta** — G1 puede ser no-op.
2. **32 diagramas (Fig. 19):** para 3, 4 y 5 líneas cambiantes, decidir si los textos de línea provienen del hexagrama **original** o **transformado** según el chart index. **Riesgo principal: G2 + D0.2.**

**Criterio de éxito (v2):** 100% paridad motor vs `zhuxi-adler-32-charts-gold.json` sobre **inputs de chart distintos** extraídos del gold (no 4096 literales exhaustivos salvo que el gold lo exija).

**Fuera de alcance:** cambiar reglas Huang; billing; product IDs; migraciones DB destructivas.

---

## 1. Por qué requiere plan estricto

| Riesgo | Evidencia actual | Postura v2.1 |
|--------|------------------|--------------|
| **Regresión API / históricos** | N/A en greenfield | **Neutralizado:** no hay usuarios ni hilos que preservar |
| **Tests verdes hoy** | 90 tests motor + gates H1-H5 + QA mutation-output | Flag OFF mantiene baseline durante desarrollo |
| **Comportamiento usuario** | Interpretaciones Zhu Xi 3/4/5 pueden cambiar vs default pre-lanzamiento | **Forward-only:** canónico desde día 1 |
| **Prompt** | `interpretation.ts` + 32 charts cambian `fromHexagram` en 4/5 | Gate 0 + Fase C (H2) |

---

## 2. Fuentes primarias y evidencias (obligatorias para implementación)

### 2.1 Artefactos PDF Adler

| Artefacto | PDF índice | Folio impreso | Estado gold | Evidencia en repo |
|-----------|------------|---------------|-------------|-------------------|
| Reglas 0–6 + Q/K | 150–158 | 48–53 | ✅ Extraído | `scripts/lib/zhuxi-adler-pdf-gold.mjs` → `zhuxi-adler-mutation-rules-gold.json` |
| Regla 3 (20 casos) | **154** | **50** | ⚠️ **D0.1 pendiente** | Combinatoria sugiere `includes(1)` exacto; confirmar orden Adler en Fig. 19 |
| Regla 32/64 charts | **158** | **52** | ✅ Resuelto (§0.B): ≡ reglas por conteo | Cita: «…up through the 32… **original** hexagram… after the 32… **changed** hexagram» |
| Fig. 19 — 32 diagrams | **159–204** | — | ✅ Reconstruido (§0.B) sin OCR | Chart 乾/坤 = p.162; `tools/reconstruct-zhuxi-3line-chart.mjs` |
| Nota 4096 | **215** | **74** fn.149 | Referencia | «Hsi-tz'u A.9.8» — base combinatoria |
| Nota Gen→Sui | **205** | **73** fn.144–145 | Caso test | Mu Chiang: línea 2 de Sui, **no** T'uan — gate manual Fase E |
| Nota Q/K 6 cambios | **215** | **73–74** fn.148 | Implementado | «both hexagram statements and their interrelationships» → `readBothJudgments` |

### 2.2 Extractos verificados (gold `bookText` → PDF extract match)

Regenerar y verificar:

```bash
npm run extract:gold:zhuxi-adler-pdf
npm run audit:zhuxi-rules-vs-adler-gold
```

Salida esperada: **10/10** snippets en `zhuxi-adler-ch4-core-p150-158.txt`; regla `thirty_two_charts` marcada `not_implemented`.

### 2.3 Referencias cruzadas académicas

| Referencia | Uso en plan |
|------------|-------------|
| Joseph Adler, *Introduction to the Study of the Classic of Change* (SUNY) | Fuente primaria Tier-0 |
| Yijing Dao (biroco.com) — exposición Yixue Qimeng | Validación secundaria post-gold |
| Ts'ai Yuan-ting extrapolations | Documentadas en gold como `extrapolated: true` (reglas 2, 4) |
| [`20260620-AUD-LRS-01-zhuxi-line-reading-selector.md`](20260620-AUD-LRS-01-zhuxi-line-reading-selector.md) | Baseline motor actual + gates H1–H5 |

### 2.4 Evidencia motor actual (baseline pre-chart)

| Artefacto | Ubicación | Evidencia |
|-----------|-----------|-----------|
| Regla operativa 3 líneas | `packages/iching-engine/src/rules/zhuxi.ts` L82–93 | `sorted.includes(1) ? "primary" : "transformed"` |
| Tests regresión | `engine.line-reading-systems.test.ts` | **37/37 PASS** — no cambiar sin flag |
| QA interpretación | `pnpm qa:mutation-output` | Baseline JSON con `model`, `fixtureId`, `lineReadingSystem` |
| Persistencia | migración **074** | `line_reading_system` en `consultations` |

---

## 3. Diseño propuesto

### 3.1 Nuevo módulo de datos

```
packages/iching-engine/src/rules/zhuxi-charts/
  chart-index.ts      # primary+changing → chartId (0..31)
  chart-table.ts      # chartId → lineSource: "primary" | "transformed" per rule bucket
  three-changing.ts   # 20-case first-ten / latter-ten table
  types.ts
```

**Entrada del lookup:**

```typescript
type ZhuXiChartInput = {
  primaryBinary: string;      // 6-bit top-first
  changingPositions: number[];
  changingCount: 3 | 4 | 5;
};
```

**Salida:**

```typescript
type ZhuXiChartResolution = {
  chartId: number;
  lineSource: "primary" | "transformed";
  judgmentEmphasis?: "primary" | "transformed"; // solo n=3
  selectedStablePositions?: number[];           // n=4,5 según chart
};
```

### 3.2 Integración en `selectTextsZhuXi`

- `ZX_THREE_JUDGMENTS`: reemplazar `sorted.includes(1)` por tabla 20 casos **o** derivación desde chartId.
- `ZX_FOUR_LOWER` / `ZX_FIVE_ONLY`: si chart dice `primary`, leer líneas estables del **primario** (posiciones no cambiantes — mismas coords, textos del record primario).
- Mantener códigos `ZX_*` existentes en API — **no renombrar**; solo cambiar selección interna de textos.
- Añadir campo opcional en `TextsForClaude`: `zhuxiChartId?: number` (telemetría + debug; no exponer en UI usuario).

### 3.3 Flag y cutover (greenfield v2.1)

| Rol | Comportamiento |
|-----|----------------|
| **`ZHUXI_CLASSICAL_CHARTS` OFF** | Andamio de desarrollo: reglas operativas actuales; mantiene 90 tests verdes mientras se construye charts |
| **`ZHUXI_CLASSICAL_CHARTS` ON** | Camino canónico (charts Adler); validación del motor nuevo |
| **Lanzamiento (Fase E)** | **Default ON** en `main`/prod. No hay A/B de paridad con usuarios legados |
| **Rollback** | Flag OFF = interruptor de seguridad (<5 min redeploy). Greenfield: sin históricos que remediar |

---

## 4. Fases de implementación (v2.1 greenfield)

### Fase 0: Decisiones de fuente (gate duro, **sin código motor**)

Resolver desde PDF Adler con **cita literal + captura de folio**:

| ID | Pregunta | Resultado |
|----|----------|-----------|
| **D0.1** | ¿`includes(1)` es exacto para los 20 casos de 3 líneas? | ✅ **CONFIRMADO EXACTO** (§0.B). G1 = **no-op**. |
| **D0.2** | ¿Fig. 19 sobrescribe reglas 4/5 (original vs transformado)? | ✅ **NO** — coincide con reglas por conteo (§0.B). Sin divergencia. |

**Gate 0 (bloqueante para motor) — CERRADO:**

- [x] D0.1 respondida con cita folio p.154 (ver §0.A)
- [x] D0.2 respondida con cita folio p.158 + chino folio 52 + lectura cruzada (ver §0.A)
- [x] Spot-check Fig. 19 — Figure 4.19.1 (乾 regente) renderizada y leída (ver §0.A)
- [x] Resultado documentado en este plan antes de Fase A
- [x] Sign-off producto D0.2 (greenfield, forward-only)
- [x] **Gate 0 EJECUTADO 22 jun 2026** — resultado §0.A
- [x] **D0.1 CONFIRMADO + D0.2 RESUELTO 22 jun 2026 (2ª sesión)** — reconstrucción algorítmica + comparativa visual vs PDF + 3 autoridades (§0.B). **Gate 0 cerrado; Fases A→E canceladas.**

**Duración real:** lectura PDF + render Fig. 19 (1 sesión).

---

### 0.A — RESULTADO GATE 0 (primera sesión, 22 jun 2026 — TENTATIVO)

> ⚠️ **SUPERSEDIDO POR §0.B.** Esta primera pasada quedó con D0.1 como "hipótesis no confirmada" y D0.2 como "sistema paralelo divergente" porque la extracción se detuvo al ver que Fig. 19 son imágenes. La 2ª sesión (§0.B) **resolvió ambas** con reconstrucción algorítmica + comparativa visual contra la imagen del PDF + tres autoridades independientes. **Conclusión corregida:** Fig. 19 **NO diverge** del método por conteo; lo confirma.

**Fuente:** PDF Adler local (`tools/source-pdfs/Introduction To The Study…`). Extracción `pdftotext`/`pdftoppm` cacheada en `tools/output/fidelity-gold/` (gitignored): `zhuxi-adler-folio154.txt`, `zhuxi-adler-folio158.txt`, `zhuxi-adler-fig19-p159-204.txt`, `fig19-chart-162.png`.

#### Citas literales verificadas

**Folio 50 (PDF 154) — regla 3 líneas (D0.1):**
> «When three lines change, the prognostication is the T'uan statement of the original hexagram and the resulting hexagram, and we use the original hexagram as *chen* and the resulting hexagram as *hui*. **In the first ten hexagrams [of this sort] we make *chen* the ruler; in the latter ten hexagrams we make *hui* the ruler.**»

**Folio 52 (PDF 158) — regla 32 charts (D0.2), inglés:**
> «We now take the changes [combinations] of the sixty-four hexagrams and arrange them into thirty-two charts (Fig. 19). To obtain the first [32] hexagrams we go from beginning to end and from top to bottom… **The changes in the hexagrams up through the 32 use the lines of the original hexagram as prognostication. The changes of the hexagrams after the 32 use the lines of the changed hexagram as prognostication.**»

**Folio 52 (PDF 159) — chino original:**
> 「今以六十四卦之變，列為三十二圖。得初卦者自初而終，自上而下。得末卦者自終而初，自下而上。**變在第三十二卦以前者占本卦爻之辭。變在第三十(二)卦以後者，占變卦爻之辭。**凡言初終上下者，據圖而言。」

**Nota Ts'ai Yüan-ting (PDF 160):**
> «Whenever we speak of earlier and later hexagrams, the order proceeds from the original hexagram.»

#### D0.1 — ¿`includes(1)` es exacto para los 20 casos de 3 líneas?

**Dictamen: HIPÓTESIS FUERTE, NO CONFIRMADA al 100% por texto.**

- Combinatoria: C(6,3)=20 patrones; los que incluyen la posición 1 = C(5,2)=**10**; los que no = **10**. El split `includes(1)` da exactamente **10/10**, que coincide numéricamente con «first ten / latter ten» de Adler.
- **Pero** el *orden* de los 20 casos en Adler lo fija Fig. 19 («order proceeds from the original hexagram»), no el patrón de líneas cambiantes. Confirmar que «first ten» ≡ «patrones que incluyen pos 1» exige leer el orden real de los charts (imágenes), no derivable de `pdftotext`.
- **Conclusión:** la regla actual del motor (`sorted.includes(1) ? "primary" : "transformed"`) es **plausiblemente exacta** pero queda como hipótesis hasta transcribir el orden de Fig. 19.

#### D0.2 — ¿Fig. 19 sobrescribe las reglas 4/5?

**Dictamen técnico: Fig. 19 es un SISTEMA PARALELO de 爻辭 (line statements), no un override limpio de las reglas por conteo.**

- La regla de 32 charts habla de **爻之辭 (textos de línea)** para las **4096** combinaciones completas, asignando fuente (original/changed) por posición del par en el orden de charts (primeros 32 → original; tras el 32 → changed).
- Las reglas por conteo operan sobre tipos de texto distintos según n: n=3 lee **彖辭 (juicios)**, no líneas; n=4/5 lee líneas del transformado. Es decir, el sistema de charts y el de conteo **no operan sobre el mismo campo** para n=3.
- Adler/Ts'ai presentan Fig. 19 como la tabulación sistemática de Chu Xi siguiendo el *I-lin* de Chiao Kan, con «aspects… not expressed by former scholars» — es una innovación comprehensiva, no una corrección de las reglas estándar (Shao Yung) que el motor implementa.
- **Conclusión:** adoptar Fig. 19 implicaría **reemplazar** la selección por conteo en 3/4/5 por lookup de chart — divergencia mayor del método estándar (el que usan Wilhelm/Baynes y la mayoría de apps). No es un ajuste menor.

#### Spot-check Fig. 19 — Figure 4.19.1 (PDF 162)

Renderizada y leída visualmente. Estructura confirmada: rejilla donde la celda superior-izquierda marca el **hexagrama regente** (乾 Qian) y el resto de celdas son los 63 hexagramas en que Qian se transforma (姤, 同人, 履, 小畜, 大有, 夬, 遯, 訟…). Cada uno de los 32 charts = un regente × 63 + sí mismo. Chart 1 (Qian) cae en «primeros 32» → líneas del **original**.

#### 🔴 HALLAZGO GO/NO-GO (crítico)

**Fig. 19 (los 32 charts) son DIAGRAMAS xilográficos escaneados — NO texto.** `pdftotext` sobre PDF 159-204 devuelve ruido OCR; el contenido real son imágenes (confirmado con `pdftoppm`).

**Implicación para Fase A:** el entregable «`tools/extract-zhuxi-adler-charts.mjs` → `zhuxi-adler-32-charts-gold.json` (32 entradas machine-readable)» **NO es factible con el pipeline `pdftotext` actual.** Opciones:

| Opción | Esfuerzo | Riesgo |
|--------|----------|--------|
| **A. Transcripción manual** de 32 charts × 64 celdas = ~2048 entradas | Alto | Error humano; necesita doble verificación |
| **B. Dataset digital publicado** de Fig. 19 (si existe) | Medio (búsqueda) | Procedencia/fidelidad a validar vs Adler |
| **C. OCR de visión** por chart (modelo) + validación celda a celda | Medio-alto | Alucinación; gate de verificación obligatorio |

**Recomendación del ejecutor:** **NO abrir Fase A→E todavía.** El motor actual (reglas por conteo, 37/37 tests, `includes(1)` plausiblemente exacto en n=3) es el método clásico estándar y está cerrado. Adoptar el sistema de 32 charts:
1. Requiere resolver primero la fuente machine-readable de Fig. 19 (opción A/B/C) — decisión de Alexis.
2. Cambia el comportamiento de n=3/4/5 frente al método estándar — decisión de producto, no solo técnica.

**Estado tras Gate 0 (1ª sesión):** Fases A→E bloqueadas por falta de gold Fig. 19 extraíble. **Superado por §0.B.**

---

### 0.B — CIERRE DEFINITIVO GATE 0 (22 jun 2026, 2ª sesión)

**Pregunta del producto:** ¿El sistema de 32 charts de Zhu Xi (Fig. 19) es un método de interpretación *adicional/distinto* que justificaría una tercera opción de lectura de líneas, o es lo mismo que ya tenemos?

**RESPUESTA: Es lo mismo, resumido de otra forma.** Los 32 charts son una **re-derivación geométrica** de las reglas por conteo que el motor ya implementa. Probado por tres vías independientes que convergen.

#### B.1 — El sistema de 32 charts ≡ reglas por conteo (D0.2 resuelto)

Cita literal de **Zhu Xi** (vía 御纂周易折中 考變占第四, edición imperial Kangxi校對 completada, y 易經大全會解 en ctext.org):

> 朱子曰：變在三十二卦以前，占本卦辭；變在三十二卦以後，占之卦辭。**蓋一爻二爻，變在三十二卦之前；四爻五爻六爻，變在三十二卦之後**，此甚易見。**獨三爻變者凡二十卦，十卦在三十二卦之前，十卦在三十二卦之後。**然占法三爻變者雖占兩卦彖辭，而變在前十卦者，主貞；變在後十卦者，主悔。

Es decir, el "antes/después del 32" del sistema de charts **mapea exactamente** sobre el número de líneas cambiantes:

| Líneas cambiantes | Sistema 32 charts | Motor actual `zhuxi.ts` | Coincide |
|---|---|---|---|
| 1–2 | "antes del 32" → 本卦 (original) | `ZX_ONE`, `ZX_TWO_UPPER` (original) | ✅ |
| 4–5–6 | "después del 32" → 之卦 (transformado) | `ZX_FOUR_LOWER`, `ZX_FIVE_ONLY`, `ZX_SIX_TRANSFORMED` | ✅ |
| 3 (20 casos) | split 10/10, 主貞/主悔 | `ZX_THREE_JUDGMENTS` con `includes(1)` | ✅ (B.2) |

Verificación de conteo del boundary (autoconsistencia):
- antes(32) = 0-chg(1) + 1-chg(6) + 2-chg(15) + 3-chg primeros 10 = **32** ✓
- después(32) = 3-chg últimos 10 + 4-chg(15) + 5-chg(6) + 6-chg(1) = **32** ✓

**Conclusión D0.2:** Fig. 19 NO sobrescribe ni diverge de las reglas 4/5. Para n=1,2,4,5,6 produce el **mismo** resultado que el motor por definición del propio Zhu Xi. El único matiz está en n=3 (B.2).

#### B.2 — `includes(1)` es exacto para los 20 casos de 3 líneas (D0.1 confirmado)

El único punto que la 1ª sesión dejó como hipótesis. Resuelto por **tres fuentes independientes que convergen**:

**(a) Texto clásico — anclaje de boundary.** La fuente fija el orden: `乾自姤至恒` (los primeros 32 terminan en 恒) y `乾自益至坤` (los últimos 32 empiezan en 益).

**(b) Reconstrucción algorítmica.** Script `tools/reconstruct-zhuxi-3line-chart.mjs` (reproducible): enumera los C(6,3)=20 patrones de 3 líneas para el regente 乾, calcula el 之卦 resultante y clasifica por `includes(1)`. Resultado **10/10 exacto**, con boundary 恒(#32)/益(#33) **idéntico al texto clásico**:

| Grupo | Casos: líneas cambiantes → 之卦 (#KingWen) | Regla |
|---|---|---|
| **Primeros 10** (主貞/chen, incluyen línea 1) | {1,2,3}→否(12), {1,2,4}→漸(53), {1,2,5}→旅(56), {1,2,6}→咸(31), {1,3,4}→渙(59), {1,3,5}→未濟(64), {1,3,6}→困(47), {1,4,5}→蠱(18), {1,4,6}→井(48), {1,5,6}→**恆(32)** | 本卦 (original) gobierna |
| **Últimos 10** (主悔/hui, sin línea 1) | {2,3,4}→**益(42)**, {2,3,5}→噬嗑(21), {2,3,6}→隨(17), {2,4,5}→賁(22), {2,4,6}→既濟(63), {2,5,6}→豐(55), {3,4,5}→損(41), {3,4,6}→節(60), {3,5,6}→歸妹(54), {4,5,6}→泰(11) | 之卦 (transformado) gobierna |

**(c) Comparativa visual contra la imagen pura del PDF.** Renderizado de **Figure 4.19.1** (Adler PDF p.162, chart 乾/坤) a PNG y enderezado. Mapeo celda a celda:
- Los 10 "primeros" (否, 漸, 旅, 咸, 渙, 未濟, 困, 蠱, 井, **恆**) aparecen **todos en el sub-grid de 乾** (regente, con 恆 al fondo = posición 32). ✓
- Los 10 "últimos" (**益**, 噬嗑, 隨, 賁, 既濟, 豐, 損, 節, 歸妹, 泰) aparecen **todos en el sub-grid de 坤** (= "después del 32" de 乾 por reverso). ✓

**(d) Autoridades modernas (validación secundaria).** Dos eruditos, analizando los charts de Adler de forma independiente, llegan a la misma regla:
- **Ed Hacker** (vía Yijing Dao / biroco.com): *"when three lines change, if the bottom line of the hexagram is among those changing then the first hexagram's judgment should take precedence… it just happens to give the same result as Zhu Xi's 32 charts."*
- **Russell Cottrell** (russellcottrell.com, reproduciendo el chart 乾/坤 con los primeros 10 sombreados): *"If the first line is a changing line we make chen the ruler; otherwise we make hui the ruler."*

**Conclusión D0.1:** `packages/iching-engine/src/rules/zhuxi.ts` L85 (`sorted.includes(1) ? "primary" : "transformed"`) **reproduce exactamente** el sistema de 32 charts para n=3. No es heurística aproximada — es matemáticamente equivalente, confirmado contra la imagen del PDF, el texto clásico chino, y dos eruditos.

#### B.3 — Evidencias guardadas

| Evidencia | Ubicación | Tipo |
|---|---|---|
| Script reconstrucción (reproducible) | `tools/reconstruct-zhuxi-3line-chart.mjs` | Commiteado |
| Fuentes textuales chinas (御纂折中 + 田閒易學 + 朱子) | `tools/output/fidelity-gold/zhuxi-32charts-textual-sources.txt` | Cache (gitignored) |
| Salida de reconstrucción (20 casos) | `tools/output/zhuxi-32charts/reconstruction-qian-3line.txt` | Cache (gitignored) |
| Imagen pura PDF chart 乾/坤 (enderezada) | `tools/output/fidelity-gold/zhuxi-fig19-qian-kun-chart-upright.png` | Cache (gitignored) |
| Render original PDF p.162 | `tools/output/zhuxi-32charts/qian-kun-chart-hires-162.png` | Cache (gitignored) |

**Regenerar imagen del PDF:**
```bash
pdftoppm -png -r 240 -f 162 -l 162 "tools/source-pdfs/Introduction To The Study…Adler….pdf" tools/output/zhuxi-32charts/qian-kun-chart-hires
```
**Regenerar reconstrucción:** `node tools/reconstruct-zhuxi-3line-chart.mjs`

Fuentes web consultadas:
- 御纂周易折中 考變占第四 — https://www.eee-learning.com/book/4716
- 田閒易學 啟蒙三十二卦變圖例 — http://www.taijizhidian.net/book/read/10202.html
- 易經大全會解 (ctext.org) — https://ctext.org/wiki.pl?chapter=699485
- Russell Cottrell, "Chu Hsi's Rules" — https://russellcottrell.com/VirtualYarrowStalks/ChuHsiRules.htm
- Yijing Dao (biroco.com), "How to consult the Yijing" — https://biroco.com/yijing/basics.htm

#### B.4 — Veredicto y decisión

1. **Gate 0 cerrado al 100%.** D0.1 confirmado, D0.2 resuelto (sin divergencia).
2. **Fases A→E CANCELADAS.** No hay valor en extraer el gold de Fig. 19 ni en construir el módulo de charts: produciría salida idéntica al motor actual. La opción C (OCR de visión) y la transcripción manual quedan descartadas.
3. **Motor actual verificado correcto.** Las reglas por conteo de `zhuxi.ts` (incl. `includes(1)` en n=3) **son** el sistema de 32 charts de Zhu Xi. Sin cambios de código (riesgo cero).
4. **Producto:** NO se añade una "tercera opción Zhu Xi 32-charts". Quedan las dos lecturas actuales (Huang default / Zhu Xi clásico), siendo la de Zhu Xi ya fiel a Yixue Qimeng cap. IV.

---

### Fase A — Extracción gold (solo datos, sin motor) — ❌ CANCELADA (ver §0.B.4)

**Entregables:**

- `scripts/lib/zhuxi-adler-charts-gold.mjs` — extrae Fig. 19 PDF 159–204
- `tools/extract-zhuxi-adler-charts.mjs`
- `tools/output/fidelity-gold/zhuxi-adler-32-charts-gold.json`
- Tabla 20 casos three-changing vs `includes(1)` → campo **`equivalentToIncludesPos1: true|false`**

**Gate A:**

- [ ] 32 entradas machine-readable
- [ ] Spot-check ≥10 charts vs PDF
- [ ] `npm run audit:zhuxi-charts-gold` PASS (script por crear)
- [ ] Campo D0.1 resuelto en JSON

**Duración estimada:** 2–3 días

---

### Fase B — Motor (iching-engine, flag-gated)

**Entregables:**

- `resolveZhuXiChart(input)` puro, determinista
- **n=3:** si D0.1 confirmó equivalencia → sin cambio comportamiento; solo telemetría `zhuxiChartId`
- **n=4/5:** si D0.2 confirma override → chart decide `fromHexagram`; default actual = transformado + excepciones
- Flag `ZHUXI_CLASSICAL_CHARTS`: OFF = hoy; ON = charts
- `zhuxi-charts.test.ts`: matriz desde gold + **Gen→Sui automatizado** (fn. 144–145) + Qian/Kun sin chart

**Gate B:**

- [ ] 100% paridad vs gold JSON (inputs distintos)
- [ ] 90 tests existentes PASS flag OFF
- [ ] Nuevos tests PASS flag ON
- [ ] Huang 53 tests intactos

**Duración estimada:** 3–4 días

---

### Fase C — Prompt + gates (backend/claude)

**Archivos:**

- `interpretation.ts` — `INTERPRETED_LINES` primario vs transformado por chart
- `interpretation-output-validator.ts` — **H1/H3: líneas desde primario Y transformado**
- **H2 re-validado** — turning pattern vs Líneas en movimiento (audit 2026-06-20, opción b si choque)
- `response-clean.ts` — sin cambio de códigos

**Gate C:**

- [ ] Unit tests validator fixtures 3/4/5 **ambas fuentes**
- [ ] `pnpm qa:mutation-output` flag ON con trazabilidad
- [ ] Diff vs baseline flag OFF documentado
- [ ] **H2 sin choque**

**Duración estimada:** 2 días

---

### Fase D: API + telemetría

**Entregables:**

- `apps/web/src/app/api/consult/route.ts`: pasar flag env en staging/dev
- Axiom: log `zhuxiChartId` + `zhuxiChartLineSource` en `consult_complete`

**Greenfield:** flag = **andamio de desarrollo** (OFF = 90 tests verdes; ON = validar camino charts). No es A/B de paridad con producción legada.

**Gate D:**

- [ ] Response JSON mismos campos que hoy (+ debug opcional staging)
- [ ] Smoke 5 consultas 3/4/5 cambios Zhu Xi
- [ ] Logs Axiom correlacionados

**Duración estimada:** 1 día

---

### Fase E: Cutover (default ON al lanzar)

**Checklist:**

- [ ] Validar staging con flag ON
- [ ] Merge a `main` con **charts default ON** (sin A/B legado)
- [ ] Flag conservado como interruptor de seguridad; retirable cuando estable
- [ ] Actualizar doc interno + `/audits` ("re-auditado, pass")
- [ ] APK: sin rebuild salvo copy i18n (WebView remoto)

**Duración estimada:** 1-2 días validación humana

---

### Tareas paralelas (independientes, bajo riesgo)

| ID | Tarea | Gate |
|----|-------|------|
| **T1** | Coma Zhou Yi `,` vs `，` en bundle | Re-gate 514/514 + smoke biblioteca |
| **T2** | `sourceUrl` Wilhelm → Pantheon; `licenseNote` Legge actualizado | Copy notes/faq coherente |

---

## 5. Matriz de tests obligatorios

| Suite | Comando | Flag OFF | Flag ON |
|-------|---------|----------|---------|
| Motor Huang | `engine.mutation-rules.test.ts` | PASS | PASS |
| Motor Zhu Xi legacy | `engine.line-reading-systems.test.ts` | PASS | PASS (casos no-chart) |
| Motor Zhu Xi charts | `zhuxi-charts.test.ts` | skip | PASS gold inputs + Gen→Sui |
| Gates prompt | tests validator | PASS | PASS |
| QA interpretación | `pnpm qa:mutation-output` | baseline guardado | nuevo report fechado |

---

## 6. Casos límite a validar manualmente

1. **Gen → Sui** (5 cambios, línea 2 estable) — fn. 144–145 Adler — **automatizado Fase B, no solo manual**
2. **Qian all-9** — no debe activar chart lookup (regla 6 Q/K separada)  
3. **3 líneas con pos 1 estable** vs **pos 1 cambiante** — flip judgmentEmphasis  
4. **Chart boundary** — caso en chart 32 vs 33 (original vs transformado)  
5. **master_combined** translator — líneas chart desde record correcto por traductor  

---

## 7. Rollback

1. `ZHUXI_CLASSICAL_CHARTS=0` en Vercel → redeploy (<5 min)
2. Motor vuelve a reglas operativas pre-chart (andamio OFF)
3. Greenfield: no hay históricos de usuarios que preservar ni recalcular

---

## 8. Estimación total

| Fase | Días dev | Bloqueante |
|------|----------|------------|
| **0 Decisiones fuente** | **1–2** | **Sí (Gate 0)** |
| A Extracción gold | 2–3 | Sí |
| B Motor | 3–4 | Sí |
| C Prompt/gates | 2 | Sí |
| D API/telemetría | 1 | No |
| E Cutover | 1–2 | Humano |
| **Total** | **~10–14 días** | |

---

## 9. Decisiones de producto (v2.1)

| Tema | Decisión |
|------|----------|
| Greenfield / D0.2 producto | **Forward-only.** Sign-off dado 22 jun 2026 |
| Cutover | **Default ON** al lanzar. Flag = andamio + interruptor |
| Re-auditoría `/audits` | Sí al cerrar Fase E |
| Baseline QA en CI | Pendiente confirmación |
| T1/T2 | **Ejecutables ya** (no bloquean Gate 0) |

---

## 10. Para el ejecutor (orden de trabajo)

Ver [`20260622-EXT-DAT-FID-05-external-opus-validation.md`](20260622-EXT-DAT-FID-05-external-opus-validation.md) §Parte 6.

1. **T2** (ya): metadata Wilhelm Pantheon + `licenseNote` Legge  
2. **T1** (ya): coma Zhou Yi + re-gate + biblioteca  
3. **Gate 0:** D0.1 + D0.2 + spot-check ≥10 (sin código motor)  
4. **Fases A→E:** gold → motor (flag scaffold) → prompt → API → cutover **default ON**

---

## 11. Validación externa

- [`20260622-EXT-DAT-FID-05-external-opus-validation.md`](20260622-EXT-DAT-FID-05-external-opus-validation.md) — Opus 4.8, v2.1 greenfield, 22 jun 2026

---

## 12. Referencias

- `scripts/lib/zhuxi-adler-pdf-gold.mjs` — reglas core + `thirty_two_charts` not_implemented
- `packages/iching-engine/src/rules/zhuxi.ts` — regla operativa pos 1 (líneas 82–93)
- `backend/claude/src/interpretation.ts` — `readBothJudgments`, `judgmentEmphasis`
- `docs/auditorias/20260620-AUD-LRS-01-zhuxi-line-reading-selector.md` — selector dual original
