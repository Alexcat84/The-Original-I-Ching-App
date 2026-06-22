# Plan de implementación — Zhu Xi 32 diagramas + regla clásica 3 líneas

**Fecha:** 22 jun 2026  
**Estado:** Plan aprobación pendiente — **NO implementar sin sign-off explícito**  
**Prerequisito:** [`MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md`](MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md)  
**Rama sugerida:** `feat/zhuxi-32-charts-lookup` (desde `staging` actualizado)

---

## 0. Objetivo

Portar el motor Zhu Xi de **reglas por conteo** (operativas, validadas en tests actuales) a la práctica clásica completa de Adler/Yixue Qimeng:

1. **20 casos de 3 líneas cambiantes:** primeros 10 → chen (primario) gobierna; últimos 10 → hui (transformado) gobierna.
2. **32 diagramas (Fig. 19):** para 3, 4 y 5 líneas cambiantes, decidir si los textos de línea provienen del hexagrama **original** o **transformado** según el chart index.

**Criterio de éxito:** para cada uno de los 4096 estados de línea (6×4^6 combinaciones válidas de yarrow/coin), el motor Zhu Xi selecciona exactamente los mismos textos que prescribe el chart gold extraído del PDF Adler.

**Fuera de alcance:** cambiar reglas Huang; billing; product IDs; migraciones DB destructivas.

---

## 1. Por qué requiere plan estricto

| Riesgo | Evidencia actual |
|--------|------------------|
| **Regresión API** | `/api/consult` persiste `mutation_rule` + `line_reading_system`; consultas históricas Zhu Xi pueden mostrar regla distinta si se re-hidrata |
| **Tests verdes hoy** | 90 tests motor + gates H1–H5 + QA mutation-output validados contra reglas operativas |
| **Comportamiento usuario** | Interpretaciones Zhu Xi con 3/4/5 cambios pueden citar líneas/juicios diferentes |
| **Prompt** | `interpretation.ts` asume `judgmentEmphasis` pos-1 para 3 líneas; 32 charts cambian `fromHexagram` en 4/5 |

---

## 2. Fuentes primarias a codificar

| Artefacto | Ubicación PDF Adler | Contenido |
|-----------|---------------------|-----------|
| Reglas 0–6 Q/K | PDF 150–158 | Ya en gold JSON |
| Fig. 19 — 32 charts | PDF 159–204 | **Extraer en Fase A** |
| Nota 4096 | fn. 149, PDF 215 | Hsi-tz'u A.9.8 |
| Regla «hasta 32 / después 32» | PDF 158 | Original vs transformado para líneas |

Referencias cruzadas: Yijing Dao (biroco.com), Ts'ai Yuan-ting extrapolations documentadas en gold.

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

### 3.3 Compatibilidad hacia atrás

| Opción | Pros | Contras |
|--------|------|---------|
| **A — Flag runtime** `ZHUXI_CLASSICAL_CHARTS=1` | Staging A/B; rollback instantáneo | Dos comportamientos en prod |
| **B — Cutover limpio** | Un solo comportamiento | Rompe paridad con consultas pre-cutover |
| **Recomendación** | **A en staging** → validar QA → **B en prod** tras smoke | Documentar en changelog |

Consultas ya persistidas: **no re-calcular** al re-leer hilo; usar `mutation_rule` + textos guardados en `consultation_content`. Solo afecta **nuevas** consultas post-cutover.

---

## 4. Fases de implementación

### Fase A — Extracción gold (solo datos, sin motor)

**Entregables:**

- `scripts/lib/zhuxi-adler-charts-gold.mjs` — extrae Fig. 19 PDF 159–204
- `tools/extract-zhuxi-adler-charts.mjs`
- `tools/output/fidelity-gold/zhuxi-adler-32-charts-gold.json`
- Tabla 20 casos three-changing verificada contra texto Adler p.154

**Gate A:**

- [ ] Cada chart tiene mapping machine-readable (32 entradas)
- [ ] Spot-check manual ≥10 charts vs PDF
- [ ] Script `audit:zhuxi-charts-gold` PASS

**Duración estimada:** 2–3 días (OCR/layout Fig. 19 es el cuello de botella)

---

### Fase B — Motor (iching-engine)

**Entregables:**

- `resolveZhuXiChart(input)` puro, determinista
- `selectTextsZhuXi` usa chart cuando `lineReadingSystem === "zhuxi"` y flag activo
- Tests nuevos: `zhuxi-charts.test.ts` — matriz exhaustiva desde gold JSON (4096 o muestreo estratificado si runtime >30s)

**Gate B:**

- [ ] Gold JSON → 100% paridad en fixtures chart
- [ ] Tests existentes pasan **con flag OFF** (default hasta cutover)
- [ ] Tests nuevos pasan **con flag ON**
- [ ] Huang path untouched (misma batería 53 tests)

**Duración estimada:** 3–4 días

---

### Fase C — Prompt + gates (backend/claude)

**Archivos:**

- `interpretation.ts` — bloques INTERPRETED_LINES cuando líneas vienen de primario vs transformado por chart
- `interpretation-output-validator.ts` — H1/H3: permitir 2 líneas desde transformado en Zhu Xi 4-chart cases
- `response-clean.ts` — sin cambios de códigos

**Gate C:**

- [ ] Unit tests validator con fixtures 3/4/5 chart-edge
- [ ] `pnpm qa:mutation-output` con flag ON — JSON incluye `model`, `fixtureId`, `lineReadingSystem: zhuxi`, `zhuxiChartId`
- [ ] Comparar diff vs baseline flag OFF — documentar casos que cambian

**Duración estimada:** 2 días

---

### Fase D — API + telemetría

**Archivos:**

- `apps/web/src/app/api/consult/route.ts` — pasar flag env si staging
- `supabase-telemetry.ts` / Axiom — log `zhuxiChartId`, `zhuxiChartLineSource` en `consult_complete`

**Gate D:**

- [ ] Response JSON incluye mismos campos que hoy (+ opcional debug staging)
- [ ] Smoke staging: 5 consultas manuales 3/4/5 cambios Zhu Xi
- [ ] Logs Axiom correlacionados

**Duración estimada:** 1 día

---

### Fase E — Cutover staging → prod

**Checklist:**

- [ ] Merge `feat/zhuxi-32-charts-lookup` → `staging`
- [ ] Deploy Vercel staging + `ZHUXI_CLASSICAL_CHARTS=1`
- [ ] Smoke Warp/PostgREST + consultas Zhu Xi
- [ ] Actualizar doc interno + entrada `/audits` pública (solo «re-auditado, pass»)
- [ ] Tras validación usuario: merge staging → main, flag ON prod
- [ ] APK: no requiere rebuild (WebView remoto) salvo copy i18n

**Duración estimada:** 1–2 días validación humana

---

## 5. Matriz de tests obligatorios

| Suite | Comando | Flag OFF | Flag ON |
|-------|---------|----------|---------|
| Motor Huang | `engine.mutation-rules.test.ts` | PASS | PASS |
| Motor Zhu Xi legacy | `engine.line-reading-systems.test.ts` | PASS | PASS (casos no-chart) |
| Motor Zhu Xi charts | `zhuxi-charts.test.ts` | skip | PASS 4096 or stratified |
| Gates prompt | tests validator | PASS | PASS |
| QA interpretación | `pnpm qa:mutation-output` | baseline guardado | nuevo report fechado |

---

## 6. Casos límite a validar manualmente

1. **Gen → Sui** (5 cambios, línea 2 estable) — fn. 144–145 Adler  
2. **Qian all-9** — no debe activar chart lookup (regla 6 Q/K separada)  
3. **3 líneas con pos 1 estable** vs **pos 1 cambiante** — flip judgmentEmphasis  
4. **Chart boundary** — caso en chart 32 vs 33 (original vs transformado)  
5. **master_combined** translator — líneas chart desde record correcto por traductor  

---

## 7. Rollback

1. `ZHUXI_CLASSICAL_CHARTS=0` en Vercel → redeploy (< 5 min)
2. Motor default vuelve a reglas operativas
3. Consultas nuevas post-rollback usan reglas operativas; históricas intactas en DB

---

## 8. Estimación total

| Fase | Días dev | Bloqueante |
|------|----------|------------|
| A Extracción gold | 2–3 | Sí |
| B Motor | 3–4 | Sí |
| C Prompt/gates | 2 | Sí |
| D API/telemetría | 1 | No |
| E Cutover | 1–2 | Humano |
| **Total** | **~9–12 días** | |

---

## 9. Decisión requerida antes de Fase B

Confirmar con producto:

1. ¿Cutover **A/B flag** o directo? (recomendado: flag staging primero)
2. ¿Re-auditoría pública `/audits` al cerrar Fase E con texto «full classical Zhu Xi charts»?
3. ¿Regenerar baseline QA mutation-output como artefacto CI permanente?

---

## 10. Referencias

- `scripts/lib/zhuxi-adler-pdf-gold.mjs` — reglas core + `thirty_two_charts` not_implemented
- `packages/iching-engine/src/rules/zhuxi.ts` — regla operativa pos 1 (líneas 82–93)
- `backend/claude/src/interpretation.ts` — `readBothJudgments`, `judgmentEmphasis`
- `docs/auditorias/LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md` — selector dual original
