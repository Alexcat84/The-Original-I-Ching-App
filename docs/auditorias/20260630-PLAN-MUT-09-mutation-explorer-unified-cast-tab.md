# Plan — Mutation Explorer: pestaña única de tirada (hex + líneas)

**Código:** `20260630-PLAN-MUT-09 mutation-explorer-unified-cast-tab` · **Familia:** MUT · **Estado:** closed

- **Fecha:** 2026-06-30
- **Implementado:** 2026-06-30 · rama `staging`
- **Rama objetivo:** `staging`
- **Relacionado:** [`20260628-PLAN-MUT-06-mutation-explorer.md`](./20260628-PLAN-MUT-06-mutation-explorer.md), [`20260628-PLAN-MUT-07-mutation-explorer-implementation.md`](./20260628-PLAN-MUT-07-mutation-explorer-implementation.md), [`20260628-PLAN-MUT-08-mutation-rules-ssot-migration.md`](./20260628-PLAN-MUT-08-mutation-rules-ssot-migration.md)
- **Contexto producto:** Wilhelm runtime en staging sigue en **inglés (Baynes)** hasta merge de `feature/wilhelm-de-dataset`; este plan no toca datasets ni billing.

---

## 1. Problema UX (motivación)

Hoy el modo manual Seeker+ expone **tres pestañas**:

| Tab | Rol actual | Problema |
|-----|------------|----------|
| Código de verificación | Atajo numérico 1–4096 | Correcto; se mantiene |
| Par de hexagramas | Primario + transformado | Duplica estado con tab 3 |
| Hexagrama interactivo | Primario + toggle líneas | Duplica estado con tab 2 |

El plan original (`PLAN-MUT-06` §B2/B3) ya definía **sincronización bidireccional** `(primary, mask)` ↔ transformado ↔ toggles. Separar en dos pestañas sugiere dos modos distintos cuando el motor tiene **una sola fuente de verdad**: `mask` (0–63) → `castIndex` (1–4096).

Además, el desplegable transformado sin filtrar permite elegir pares **inválidos** (distancia Hamming imposible como tirada única), generando `invalid_hex_pair` aunque el usuario crea tener un par lógico.

---

## 2. Aclaración matemática — ¿mismo hex destino por caminos mutantes distintos?

### Pregunta del producto

> «¿Puede llegarse al mismo hex transformado desde el mismo primario por caminos mutantes distintos, cambiando las líneas mutantes y el significado?»

### Respuesta: **no**, en el modelo estructural de esta app

Para un **hex primario P fijo** y un **hex transformado T fijo**:

1. Las **posiciones mutantes** son exactamente los bits donde difieren los binarios Wilhelm (`deriveChangingLinesFromHexPair`) — conjunto único.
2. La **máscara** `mask` queda fijada por ese conjunto — única.
3. Los valores 6/7/8/9 por línea quedan fijados por `buildSyntheticLinesFromMask` (estables 7/8; mutantes 6/9 según yin/yang del primario en esa posición) — **una sola** configuración.

**Evidencia en repo:** test `64×64 hex pair sweep` en `packages/iching-engine/src/mutation-explore.test.ts` — barrido 4096 pares; cada par válido produce una sola tupla de valores; `applyMaskToPrimary(primary, mask) === transformed`.

**Corolario:** distinta máscara desde el mismo P → **distinto** T. No existen dos conjuntos de líneas mutantes distintos que produzcan el mismo par P→T.

### Qué sí cambia la lectura (y puede confundir)

| Variación | ¿Cambia líneas mutantes? | ¿Cambia textos oráculo seleccionados? |
|-----------|--------------------------|--------------------------------------|
| Mismo P, mismo T, **Huang** vs **Zhu Xi** | No | **Sí** — regla distinta (`FOUR_LOWEST_STABLE` vs `ZX_FOUR_LOWER`, etc.) |
| Mismo `castIndex`, distinto **traductor** W/L/Z | No | Sí — bundle distinto, misma selección estructural |
| Mismo par P→T descrito por **dropdown** o **toggles** | No | No — mismo `mask` |
| Distinto P con mismo número T | Sí (otra tirada) | Sí |

La aparente ambigüedad Huang **dos líneas** (`TWO_YIN_YANG` vs `TWO_SAME_LOWER`) no es «dos caminos al mismo T»: el binario del primario **elige una sola regla**; no hay elección del usuario entre caminos.

### Implicación para el plan UI

No hace falta UI de «desambiguación de caminos» al unificar pestañas. Hace falta **una pantalla sincronizada** que deje claro que dropdown y diagrama editan lo mismo, más **filtro de transformados alcanzables** desde el primario (≤64 opciones, siempre válidas).

---

## 3. Decisión de producto (revisada 2026-06-30)

### 3.1 Pestañas manuales: **2**, no 3

| # | Id interno | Etiqueta i18n | Contenido |
|---|------------|---------------|-----------|
| 1 | `code` | Código de verificación | Input numérico + desplegables (B1 intacto) + **diagrama inicial→final** + Huang/Zhu Xi + Verificar |
| 2 | `hex` | Par de hexagramas | Primario + transformado filtrado + **diagrama inicial→final** + Huang/Zhu Xi + Verificar |

**Eliminar** tab `interactive` (toggles línea a línea). La pestaña hex sola basta estructuralmente.

### 3.2 Diagrama visual inicial → final (ambas pestañas)

Reutilizar [`CastRitualDiagram`](../../apps/web/src/components/mutation-explorer/CastRitualDiagram.tsx) — misma lógica que modo consulta `?cid=` y la UI **Verificación de lectura** (primario | flechas mutantes | transformado).

- **Datos:** `buildSyntheticLinesFromMask(primary, mask)` + headers Wilhelm de ambos hex.
- **Cuándo:** actualización **en vivo** al cambiar código, desplegables o mask; también en bloque resultados (sustituye el diagrama de una sola columna actual).
- **Solo lectura** — no es entrada; los dropdowns/código siguen siendo la fuente de verdad.

Contenedor: `coins-stage ritual-coins-stage mutation-explorer-cast-stage` (paridad con modo consulta).

### 3.3 Layout pestaña hex (sin diagrama clicable)

1. Desplegable **hex primario**
2. Desplegable **hex transformado** — solo `{ applyMaskToPrimary(primary, m) | m ∈ 0..63 }`
3. **`CastRitualDiagram`** (preview en vivo)
4. Radio **Huang / Zhu Xi**
5. Botón **Verificar**

**Sincronización (fuente de verdad `mask`):**

- Cambio primario → **anclar T**; `deriveChangingLinesFromHexPair(P_nuevo, T)` → `mask` + diagrama
- Cambio transformado → `deriveChangingLinesFromHexPair(P, T_nuevo)` → `mask` + diagrama
- Tab código → sin cambio de flujo B1; diagrama sincronizado vía `syncFromMask` / decode castIndex

### 3.4 Lo que **no** cambia

- Modo A `?cid=` (consulta propia, free+): solo lectura; sin pestañas manuales
- Motor `@iching-oracle/iching-engine`, `cast-catalog.json`, gates `verify:cast-catalog`
- Resumen corto regla en tarjeta/PDF (`formatMutationRuleSummaryForUi`) — permitido copyright
- Textos oráculo verbatim en Explorer (W/L/Z) — datos `@iching-oracle/iching-data`
- Sección larga «Reglas de lectura aplicadas» (bookText + traducción) — **eliminada** por copyright Huang/Zhu Xi (decisión 2026-06-30, fuera de este plan)

---

## 4. Alcance técnico

### 4.1 Archivos principales

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/components/mutation-explorer/MutationExplorer.tsx` | 2 tabs; quitar `interactive`; `CastRitualDiagram` en tabs 1+2 y resultados; helper reachable; fix anclaje primario |
| `apps/web/src/components/mutation-explorer/CastRitualDiagram.tsx` | Reutilizar sin cambio funcional esperado |
| `packages/i18n/src/messages/mutation-explorer-ui.ts` | Retirar `inputModeInteractive` / `interactiveHint` huérfanas; **11 locales** si aplica |
| `apps/web/src/app/globals.css` | Reutilizar clases ritual existentes (`mutation-explorer-cast-grid`, etc.) |

### 4.2 Helper (`reachableCastsFromPrimary`)

Export en `@iching-oracle/iching-engine` (`mutation-explore.ts`); test `reachableCastsFromPrimary` en `mutation-explore.test.ts`.

### 4.3 i18n (regla producto)

- Citas textuales oráculo/reglas: **nunca** en i18n (bundles)
- Copy UI y traducciones: **11 locales** cuando se toque i18n en implementación

---

## 5. Fuera de alcance

- Merge Wilhelm DE / switch traductor runtime
- Persistir `cast_index` en Postgres
- Cuarta pestaña traductor en manual (sigue tablist W/L/Z solo en resultados)
- Reintroducir bookText largo de reglas en Explorer
- Cambios al prompt Claude / bundles `mutation-rules.*`

---

## 6. Criterios de aceptación (definición de done)

1. Modo manual: **2 pestañas** (código + par hex).
2. **Ambas pestañas** muestran diagrama inicial→final (`CastRitualDiagram`) en vivo.
3. En pestaña hex: ningún par seleccionable es inválido (`invalid_hex_pair` = 0 en uso normal).
4. Cambio primario ancla T; diagrama coherente al instante.
5. Caso 9→54 y 2→1 (Kun→Qian): diagrama correcto antes de Verificar.
6. Modo A `?cid=` sin regresión.
7. i18n claves nuevas/modificadas en **11 locales** (si aplica).
8. Smoke staging.

---

## 7. Smoke manual (post-implementación)

1. Pestaña hex: primario 9, transformado 54 → diagrama 9→54 con mutantes 3–6 **antes** de Verificar.
2. Pestaña código: castIndex 573 → mismo diagrama 9→54.
3. Primario 2, transformado 1 → diagrama Kun→Qian, 6 líneas mutantes resaltadas.
4. Cambiar primario con T anclado → diagrama coherente, sin `invalid_hex_pair`.
5. Dropdown transformado: solo destinos alcanzables (64 opciones).
6. Huang vs Zhu Xi mismo par → mismo diagrama; textos/regla distintos tras Verificar.
7. Modo `?cid=` sin regresión visual ni funcional.

---

## 11. Registro de implementación (2026-06-30)

| Entrega | Detalle |
|---------|---------|
| Engine | `reachableCastsFromPrimary()` + test 64×64 destinos únicos por primario |
| UI | 2 tabs (`code`, `hex`); eliminada tab `interactive` y `HexLine` clicable |
| Diagrama | `ManualCastDiagram` → `CastRitualDiagram` en panel manual y bloque resultados |
| Sync | `syncFromHexPair`: anclar extremo opuesto al cambiar primario o transformado |
| Dropdown | Transformado filtrado vía `reachableCastsFromPrimary(primaryNumber)` |
| i18n | Retiradas `inputModeInteractive`, `interactiveHint` (EN fuente + ES override) |
| Tests | `npm test -- mutation-explore.test.ts` — 22/22 PASS |

**Pendiente operativo:** smoke manual §7 en staging web tras deploy.

---

## 8. Relación con planes anteriores

| Plan | Acción tras este plan |
|------|------------------------|
| `PLAN-MUT-06` | Marcar §B2+B3 superseded by §3.2 aquí; mantener §3.2 unicidad |
| `PLAN-MUT-07` | Actualizar checklist Fase 3 (UI tabs); cerrar cuando smoke OK |
| `PLAN-MUT-08` | Sin cambio (SSoT reglas cerrado) |

---

## 9. Orden de implementación sugerido

1. Helper `reachableCastsFromPrimary` + tests unitarios web o reutilizar engine exports
2. Refactor `MutationExplorer.tsx` (UI unificada, 2 tabs)
3. i18n 11 locales
4. Smoke §7
5. Actualizar estado `PLAN-MUT-09` → `closed`; nota en `PLAN-MUT-06/07`

---

## 10. Preguntas abiertas

*(Cerradas en revisión 2026-06-30)*

1. ~~Nombre pestaña unificada~~ → mantener **Par de hexagramas** (tab `hex`).
2. ~~Al cambiar primario~~ → **anclar T**, recalcular `mask`.
3. ~~Tab código desplegables~~ → **mantener** (B1 intacto).
4. ~~Diagrama~~ → **`CastRitualDiagram` read-only en ambas tabs**, no toggles.

---

**Estado:** cerrado tras implementación local; smoke staging pendiente de deploy.
