# Plan — Migración SSoT reglas de mutación

**Código:** `20260628-PLAN-MUT-08 mutation-rules-ssot-migration` · **Familia:** MUT · **Estado:** closed

> Implementación parcial Antigravity 2026-06-28; remediación completa documentada en [`20260628-AUD-MUT-08-mutation-rules-ssot-antigravity-audit.md`](./20260628-AUD-MUT-08-mutation-rules-ssot-antigravity-audit.md).

- **Fecha:** 2026-06-28
- **Objetivo:** Una sola fuente de verdad para reglas de mutación (paridad W/L/Z en `@iching-oracle/iching-data`). Prompt Claude solo consume `bookText` EN del gold; UI muestra original + traducción i18n fiel en 11 locales.
- **Gold de referencia:** [`20260622-AUD-MUT-04 mutation-rules-pdf-gold`](./20260622-AUD-MUT-04-mutation-rules-pdf-gold.md)
- **Relacionado:** [`20260628-PLAN-MUT-07 mutation-explorer-implementation`](./20260628-PLAN-MUT-07-mutation-explorer-implementation.md) (Explorer ya desplegado en `staging`; esta migración lo refactoriza, no lo precede como greenfield)

---

## 0. Verificación de auditoría previa (2026-06-28)

### 0.1 Colisión documental — CONFIRMADO

`PLAN-MUT-07` ya está registrado como [`20260628-PLAN-MUT-07-mutation-explorer-implementation.md`](./20260628-PLAN-MUT-07-mutation-explorer-implementation.md) en `registry.json` + `INDEX.md` (WF-DOC-02).

**Resolución:** Este plan usa **`PLAN-MUT-08`** (`20260628-PLAN-MUT-08-mutation-rules-ssot-migration`).

### 0.2 Dependencia cruzada / orden de ejecución — CORRECCIÓN

La auditoría externa asumió que `MutationExplorer.tsx` y `explore-mutation.ts` «aún no existen». **Eso ya no es cierto:**

- Rama `staging` incluye el feature (`fbee84c` … `935ebaa`): `/mutation-explorer`, `ConsultationRecordCard` con «Verificar tirada», etc.
- Esos archivos **ya usan** `getIchingMutationRuleLabel` (deuda técnica activa en producción staging).

**Estrategia corregida (Opción A):**

1. Ejecutar migración SSoT (MUT-08) **ahora**.
2. Migrar **todas** las superficies existentes: `ConsultationRecordCard`, PDF, **y** Mutation Explorer (refactor, no greenfield).
3. No construir Explorer «después» con arquitectura limpia — ya está construido; hay que **limpiarlo** en Fase 5.

Opción B (implementar Explorer con deuda y limpiar después) **obsoleta** — Explorer ya está en staging con la deuda.

### 0.3 Lookup `systemCode` con pipe — CONFIRMADO

`QIAN_ALL_NINE|KUN_ALL_SIX` en gold → getter resuelve con `.split('|').includes(code)`. &lt;10 reglas por sistema; impacto performance cero. Evita duplicar `bookText` en JSON.

### 0.4 Assert prompt vs i18n — APROBADO

Test en `interpretation.v2.test.ts`: `MUTATION RULE` debe ser substring de bundle EN; nunca traducción i18n.

---

## 1. Diagnóstico (deuda técnica actual)

Tres capas de copy divergentes:

1. **Enum** (`THREE_MIDDLE`, …) — motor + DB. Correcto mantener; no es copy de usuario.
2. **Viñetas i18n inventadas** — `packages/i18n/src/messages/iching-mutation-ui.ts` → resumen, PDF, Explorer.
3. **`ruleExplanation` ES hardcodeado** — `engine.ts` / `zhuxi.ts` → prompt Claude + párrafo Explorer.

Gold verificado (Huang PDF, Adler ch. IV) solo en `scripts/lib/*-pdf-gold.mjs` — **sin bundle runtime**.

Textos oráculo W/L/Z **sí** siguen SSoT al 100% (`hexagrams.*.json` + `verify:hexagram-fidelity`). Reglas de mutación **no**.

---

## 2. Decisión de producto (cerrada)

| Canal | Contenido |
|-------|-----------|
| **Prompt / Claude** | Solo `bookText` EN del gold. Prohibido i18n localizado. |
| **UI** (resumen, PDF, Explorer) | `bookText` EN + traducción fiel al locale (11 idiomas). |
| **DB** | Solo `mutation_rule` enum. No persistir copy. |
| **Enum al usuario** | No mostrar códigos `THREE_MIDDLE` etc. |

---

## 3. Arquitectura objetivo

```
scripts/lib/huang-pdf-gold.mjs + zhuxi-adler-pdf-gold.mjs  (Tier-0, única definición bookText)
        ↓
scripts/build-mutation-rules.mjs
        ↓
packages/iching-data/src/generated/mutation-rules.{huang,zhuxi}.json
        ↓
packages/iching-data/src/mutation-rules.ts (getters Zod)
        ├→ iching-engine (prompt: bookText EN)
        ├→ backend/claude (MUTATION RULE)
        └→ i18n (traducciones fieles) → UI
```

---

## 4. Fases

### Fase 0 — Registro (este documento)

- Código `20260628-PLAN-MUT-08 mutation-rules-ssot-migration`
- `registry.json` + `INDEX.md`

### Fase 1 — Bundle `@iching-oracle/iching-data`

- Schema Zod en `schema.ts` (`mutationRuleRecordSchema`, `mutationRulesBundleSchema`)
- Bundles: `mutation-rules.huang.json`, `mutation-rules.zhuxi.json`
- Script `build-mutation-rules.mjs` integrado en `build:data`
- API: `getMutationRuleRecord`, `getMutationRuleBookText`

### Fase 2 — Gate `VF-MUT-001`

- `scripts/verify-mutation-rules-fidelity.mjs` — bundle ↔ gold builders
- Cobertura total de `MutationRule` + `ZhuXiMutationRule`
- `npm run verify:mutation-rules-fidelity`
- QA registry WF-DOC-02

### Fase 3 — i18n

- Reescribir `iching-mutation-ui.ts`: traducciones fieles al gold (eliminar viñetas inventadas)
- Export `getMutationRuleTranslation(locale, code)`
- UI: original EN + traducción muted debajo
- Explorer: una sola sección reglas (sin duplicado)

### Fase 4 — Motor

- Eliminar `ruleExplanation` ES literal en `engine.ts` / `zhuxi.ts`
- Sustituir por lookup bundle EN
- Renombrar a `mutationRuleBookText` en `TextsForClaude` (recomendado)
- Actualizar `interpretation.ts` L464
- Tests motor assert contra `bookText`

### Fase 5 — Consumidores UI (incluye Explorer ya en staging)

- `ConsultationRecordCard.tsx`
- `page.tsx` PDF export
- `MutationExplorer.tsx` + `explore-mutation.ts`

### Fase 6 — Limpieza

- Anti-regresión grep (no `ruleExplanation:` literal en engine; no viñetas inventadas)
- `verify:qa-registry`, typecheck, smoke staging
- Actualizar `AGENTS.md`

**Fuera de alcance:** traducir bookText al prompt; lookup 32 diagramas Zhu Xi; Huang Q/K dual-judgment prompt (AUD-MUT-04).

---

## 5. Orden de ejecución

1. Fase 1 bundle + Fase 2 gate (PASS antes de UI)
2. Fase 4 engine (prompt)
3. Fase 3 i18n
4. Fase 5 UI (incl. Explorer existente)
5. Fase 6

---

## 6. Criterios PASS

- `verify:mutation-rules-fidelity` → 100%
- Tests motor PASS
- Resumen: gold EN + traducción ES fiel
- Prompt: `MUTATION RULE` = bookText EN exacto
- Cero viñetas inventadas en UI/PDF/Explorer
- `interpretation.v2.test.ts` assert EN bundle, not i18n
- `verify:qa-registry` PASS

---

## 7. Riesgo principal

Desalineación prompt vs UI si i18n llega a Claude. Mitigación: getter EN único + test de integración.

---

## 8. Checklist consumidores

| Superficie | Hoy | Objetivo |
|------------|-----|----------|
| Prompt Claude | ruleExplanation ES | bookText EN (iching-data) |
| Resumen tirada | getIchingMutationRuleLabel | bookText EN + i18n |
| PDF | getIchingMutationRuleLabel | idem |
| Mutation Explorer | label + ruleExplanation | bookText EN + i18n (una sección) |
| DB | mutation_rule enum | sin cambio |

---

## 9. Backlog implementación

- [x] Fase 1: schema + build + bundles + getters
- [x] Fase 2: VF-FID-003 (`verify:mutation-rules-fidelity`)
- [x] Fase 4: engine + interpretation.ts
- [x] Fase 3: i18n fiel (11 locales)
- [x] Fase 5: ConsultationRecordCard, PDF, MutationExplorer
- [x] Fase 6: gates + AGENTS.md
