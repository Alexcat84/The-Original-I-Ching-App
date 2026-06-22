# Plan de implementación — Zhu Xi 32 diagramas + regla clásica 3 líneas

**Fecha:** 22 jun 2026 · **Revisión:** v2.1 (greenfield, post-validación Opus 4.8)  
**Estado:** **Luz verde documental.** Motor: **NO implementar sin Gate 0 (Fase 0) técnico**  
**Gate 0 (22 jun 2026): EJECUTADO** — ver §0.A. Resultado: **Fases A→E bloqueadas** (Fig. 19 es imagen, no texto extraíble). Motor actual (reglas por conteo) intacto.  
**Audiencia:** ejecutor + auditoría interna  
**Validación externa:** [`EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md`](EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md) (v2.1)  
**Índice maestro:** [`FIDELITY_MUTATION_MASTER_AUDIT_2026-06-22.md`](FIDELITY_MUTATION_MASTER_AUDIT_2026-06-22.md) §Parte E-F  
**Prerequisito:** [`MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md`](MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md)  
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
| Regla 32/64 charts | **158** | **52** | ❌ not_implemented | Cita: «…up through the 32… **original** hexagram… after the 32… **changed** hexagram» |
| Fig. 19 — 32 diagrams | **159–204** | — | ❌ Pendiente Fase A | Manifest `zhuxi-adler.chapterIv` figures range |
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
| [`LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md`](LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md) | Baseline motor actual + gates H1–H5 |

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

| ID | Pregunta | Si sí | Si no | Producto |
|----|----------|-------|-------|----------|
| **D0.1** | ¿Los 20 casos de 3 líneas en Adler siguen orden lex ascendente? | G1 = **no-op** (`includes(1)` exacto) | Tabla explícita 20 casos | N/A |
| **D0.2** | ¿Fig. 19 sobrescribe reglas 4/5 (original vs transformado)? | Spec: chart decide `fromHexagram` | Spec: default + excepciones chart | **Resuelto:** forward-only |

**Gate 0 (bloqueante para motor):**

- [x] D0.1 respondida con cita folio p.154 (ver §0.A abajo)
- [x] D0.2 respondida con cita folio p.158 + chino folio 52 + lectura cruzada (ver §0.A)
- [x] Spot-check Fig. 19 — Figure 4.19.1 (乾 regente) renderizada y leída (ver §0.A)
- [x] Resultado documentado en este plan antes de Fase A
- [x] Sign-off producto D0.2 (greenfield, forward-only)
- [x] **Gate 0 EJECUTADO 22 jun 2026** — resultado abajo

**Duración real:** lectura PDF + render Fig. 19 (1 sesión).

---

### 0.A — RESULTADO GATE 0 (ejecutado 22 jun 2026)

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

**Estado tras Gate 0:** Fases A→E **siguen bloqueadas** por falta de gold Fig. 19 extraíble. Gate 0 cerrado documentalmente; **sin cambios de código de motor** (riesgo cero).

---

### Fase A — Extracción gold (solo datos, sin motor)

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

Ver [`EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md`](EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md) §Parte 6.

1. **T2** (ya): metadata Wilhelm Pantheon + `licenseNote` Legge  
2. **T1** (ya): coma Zhou Yi + re-gate + biblioteca  
3. **Gate 0:** D0.1 + D0.2 + spot-check ≥10 (sin código motor)  
4. **Fases A→E:** gold → motor (flag scaffold) → prompt → API → cutover **default ON**

---

## 11. Validación externa

- [`EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md`](EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md) — Opus 4.8, v2.1 greenfield, 22 jun 2026

---

## 12. Referencias

- `scripts/lib/zhuxi-adler-pdf-gold.mjs` — reglas core + `thirty_two_charts` not_implemented
- `packages/iching-engine/src/rules/zhuxi.ts` — regla operativa pos 1 (líneas 82–93)
- `backend/claude/src/interpretation.ts` — `readBothJudgments`, `judgmentEmphasis`
- `docs/auditorias/LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md` — selector dual original
