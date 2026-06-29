# Auditoría — MUT-08 Antigravity (SSoT reglas de mutación)

**Código:** `20260628-AUD-MUT-08 mutation-rules-ssot-antigravity-audit` · **Familia:** MUT · **Estado:** closed

- **Fecha:** 2026-06-28
- **Plan de referencia:** [`20260628-PLAN-MUT-08-mutation-rules-ssot-migration.md`](./20260628-PLAN-MUT-08-mutation-rules-ssot-migration.md)
- **Remediación:** implementada en rama `fix/mut-08-ssot-completion` (este cierre documental)

---

## 1. Inventario Antigravity

### 1.1 Hecho correctamente (mantener)

| Artefacto | Archivo | Estado git (pre-remediación) |
|-----------|---------|------------------------------|
| Bundles runtime | `packages/iching-data/src/generated/mutation-rules.{huang,zhuxi}.json` | untracked |
| Build | `scripts/build-mutation-rules.mjs` | untracked / modified |
| Schema Zod | `packages/iching-data/src/schema.ts` | modified |
| Getters | `packages/iching-data/src/mutation-rules.ts` | untracked |
| Engine Huang/Zhu Xi | `packages/iching-engine/src/engine.ts`, `rules/zhuxi.ts` | modified |
| Types | `packages/iching-engine/src/types.ts` | `mutationRuleBookText` |
| Prompt Claude | `backend/claude/src/interpretation.ts` L464 | `MUTATION RULE: ${t.mutationRuleBookText}` |
| Gate VF-FID-003 | `scripts/verify-mutation-rules-fidelity.mjs` | untracked |
| Tests motor | `packages/iching-engine/src/engine.mutation-rules.test.ts` | 53/53 PASS |
| i18n parcial | `packages/i18n/src/messages/iching-mutation-ui.ts` | solo EN+ES parcial |

### 1.2 Hecho incorrectamente o incompleto (remediado)

| Problema | Archivo | Remediación |
|----------|---------|-------------|
| Regla eliminada del resumen | `ConsultationRecordCard.tsx` | Restaurada fila «Regla de lectura» vía `formatMutationRuleForUi` |
| PDF sin regla | `page.tsx` ~L1570 | Restaurado `summaryLine(pdfUi.rule, …)` |
| Explorer roto | `explore-mutation.ts` | `.ruleExplanation` → `getMutationRuleBookText` |
| Explorer layout invertido | `MutationExplorer.tsx` | EN primario (`lang="en"`), traducción muted debajo |
| i18n 9 locales | `iching-mutation-ui.ts` | Traducciones completas fieles al gold |
| Zhu Xi truncado | `iching-mutation-ui.ts` ES/EN | Texto completo sin `"..."` |
| Typecheck web | `page.tsx` | Props `mutationRule` alineadas con card |
| Test prompt | `interpretation.v2.test.ts` | Assert bundle EN ≠ traducción ES |
| Sin commit | git | Commit en r5 del plan de remediación |

### 1.3 Afirmaciones no verificables

- `walkthrough.md` — no existe en repo
- «Ecosistema completamente conectado» — falso en UI/i18n pre-remediación
- «typecheck/test PASS» — web typecheck fallaba (3× TS2322 `mutationRule` huérfana)

---

## 2. Matriz PASS/FAIL por fase MUT-08 (pre-remediación)

| Fase | Descripción | Antigravity | Post-remediación |
|------|-------------|-------------|------------------|
| 1 | schema + build + bundles + getters | PASS | PASS |
| 2 | VF-FID-003 gate | PASS | PASS |
| 3 | i18n fiel 11 locales | **FAIL** (2 locales, viñetas) | PASS |
| 4 | engine + interpretation.ts | PASS | PASS |
| 5 | Card, PDF, Explorer | **FAIL** (regresión UI) | PASS |
| 6 | gates + AGENTS.md | **FAIL** (typecheck web) | PASS |

---

## 3. Desviaciones de producto

Antigravity eliminó la fila «Regla de lectura» del resumen de tirada y del PDF con comentario «removed in favor of Explorer». El plan MUT-08 exige **bookText EN + traducción i18n** en resumen, PDF **y** Explorer (una sección, sin duplicar fila «Regla aplicada»).

---

## 4. Evidencia

```bash
npm run verify:mutation-rules-fidelity   # PASS 100% (pre y post)
npm run typecheck --prefix apps/web        # FAIL pre (3 errores mutationRule)
npm run test --prefix packages/iching-engine  # PASS 53/53 mutation-rules
```

Errores TS pre-remediación: `page.tsx` pasaba `mutationRule` a `ConsultationRecordCard` cuyo tipo ya no incluía la prop.

Runtime Explorer: `getReadingRuleExplanation` accedía a `textsForTranslator(...).ruleExplanation` (campo eliminado en `TextsForClaude`).

---

## 5. Remediación

Ver plan adjunto [`mut-08_audit_and_remediation`](../../.cursor/plans/mut-08_audit_and_remediation_52d78fb0.plan.md) Parte B:

- R1: `apps/web/src/lib/mutation-rule-display.ts` + `getMutationRuleTranslation`
- R2: Card, PDF, Explorer
- R3: `iching-mutation-ui.ts` 11 locales
- R4: test prompt, typecheck, verify scripts
- R5: commit + cierre PLAN-MUT-08

---

## 6. Veredicto final

Migración SSoT **cerrada** tras remediación: prompt Claude = bundle EN; UI = EN + traducción i18n fiel en 11 locales; gates verdes.
