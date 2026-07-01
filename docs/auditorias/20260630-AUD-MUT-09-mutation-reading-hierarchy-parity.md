# Jerarquía de lectura mutación — paridad explorer / prompt / motor

**Código:** `20260630-AUD-MUT-09 mutation-reading-hierarchy-parity` · **Familia:** MUT · **Estado:** closed

**Fecha:** 2026-06-30  
**Disparador:** Mutation Explorer mostraba juicios/imágenes en gris al anclar `isRead` solo a `mutation-rules.*.json` `textTypes` (slots de pronóstico lineal), divergiendo del pergamino ritual de consulta y de la jerarquía acordada de producto (primario J+I + línea(s) filtrada(s) + transformado J+I).  
**Alcance:** Motor (`textsToSelections`, `selectTextsForClaude`), prompt Claude (`interpretation.ts`), Mutation Explorer (`buildOracleTextBlocks`), gold JSON (rol documental).  
**Remediación:** commit en la misma sesión (explorer + motor + prompt imagen transformada single-translator).

---

## 1. Jerarquía canónica de producto (cerrada)

Tres capas siempre que aplican; **única omisión explícita:** textos de líneas mutantes **no seleccionadas** por Huang o Zhu Xi.

| Capa | Contenido | Peso interpretativo |
|------|-----------|---------------------|
| **1. Hexagrama original** | Juicio + Imagen | Base / diagnóstico / postura |
| **2. Línea(s) seleccionada(s)** | Solo las que marca la regla activa | Corazón / consejo preciso |
| **3. Hexagrama transformado** | Juicio + Imagen (si hay mutación) | Tendencia / clima futuro (más peso Zhu Xi en 4–6 mutantes) |

**Excepciones de línea:**

- **0 mutantes:** capas 1 solamente (sin transformado).
- **6 mutantes (≠ Qian/Kun):** capa 2 vacía; foco lineal en juicio transformado; capas 1 y 3 siguen en pergamino.
- **Qian/Kun 6/6:** 用九/用六 en capa 2 equivalente + juicios según sistema.

Reglas de filtrado de líneas: idénticas a Huang (Master Yin) y Zhu Xi (Yixue Qimeng) documentadas en `mutation-rules.{huang,zhuxi}.json` y `engine.ts`.

---

## 2. Estado previo vs hallazgos

### 2.1 Mutation Explorer (`buildOracleTextBlocks`)

| Aspecto | Antes | Hallazgo |
|---------|-------|----------|
| `isRead` | Derivado de gold `textTypes` vía `textsToSelections` estrecho | Juicio/imagen primario y transformado aparecían **gris** en casos 1–5 mutantes Huang |
| Bloques extra | Líneas mutantes omitidas como «referencia» expandible | **No aplican** a la lectura; confundían con contenido activo |
| Paridad prompt | No | Explorer contradecía lo que el usuario recibe en consulta |

### 2.2 Motor — líneas (`selectTextsForClaude`)

**Alineado** con reglas Huang/Zhu Xi para `selectedLineTexts` (posición, hexagrama origen, emphasis Zhu Xi). Sin cambio funcional en esta AU.

### 2.3 Motor — selecciones explorer (`textsToSelections`)

| Aspecto | Antes | Hallazgo |
|---------|-------|----------|
| Juicios/imágenes primarios | Omitidos salvo reglas gold con slot `judgment`/`image` | Contradecía jerarquía capa 1 |
| Juicio/imagen transformados | Solo si gold `readsFrom` incluía `transformed` | Contradecía capa 3 |
| Imágenes Zhu Xi Qian/Kun | Excluidas por bug `readBothJudgments` sin check `image` en gold | Imágenes debían formar parte del pergamino |

### 2.4 Prompt Claude (`backend/claude/src/interpretation.ts`)

| Aspecto | Antes | Hallazgo |
|---------|-------|----------|
| Pergamino 6 secciones | Juicio + Imagen primarios obligatorios; Líneas = `INTERPRETED_LINES`; Trazado = transformado | **Ya alineado** con jerarquía (AUD-MUT-02) |
| BIBLIOTECA single-translator | Juicio transformado sí; **imagen transformada no** en `textsBlock` | Gap: scroll pide citar imagen transformada «if supplied» pero no se suministraba en Wilhelm/Legge/Zhou Yi solo |
| Líneas mutantes omitidas | `OMITTED_CHANGING_POSITIONS`; gates H1/H3 | **Alineado** — no se envían textos verbatim de mutantes descartadas |
| Traductores / bundles | Textos vienen de `@iching-oracle/iching-data` runtime | **Sin defecto de traductor** identificado; el gap era de ensamblaje prompt, no de corpus |

### 2.5 Gold JSON (`mutation-rules.*.json`)

| Rol | Contenido |
|-----|-----------|
| **Sí documenta** | Reglas de **filtrado de líneas**, bookText EN, `readsFrom` por regla |
| **No documenta** | Regla transversal «siempre J+I primario + J+I transformado cuando muta» |

`textTypes` describe **slots de pronóstico lineal** (p. ej. `["line"]` en 4 mutantes Huang), no el conjunto completo del pergamino. **No usar `textTypes.length` como conteo de bloques explorer.**

---

## 3. Remediación aplicada (2026-06-30)

| Componente | Cambio |
|------------|--------|
| `textsToSelections` | Tres capas: primario J+I + líneas seleccionadas + transformado J+I (si muta) + 用 |
| `buildOracleTextBlocks` | Solo bloques aplicables; eliminadas líneas mutantes omitidas; todo visible = lectura activa |
| `interpretation.ts` | `THE IMAGE:` transformada añadida a BIBLIOTECA single-translator |
| i18n explorer | Hint/leyenda describen tres capas, no «gris = contexto» |
| Tests | `TS-WEB-015` v1.1.0, `TS-ENG-004` actualizado |

---

## 4. Matriz de paridad post-fix

| Caso | Capa 1 | Capa 2 | Capa 3 | Prompt | Explorer |
|------|--------|--------|--------|--------|----------|
| 0 mutantes | J+I primario | — | — | ✓ | ✓ |
| 1–5 mutantes Huang/Zhu Xi | J+I primario | Línea(s) regla | J+I transformado | ✓ | ✓ |
| Zhu Xi 3 mutantes | J+I primario | — (juicios con emphasis) | J+I transformado | ✓ | ✓ |
| 6 mutantes | J primario (+ I si no vacío) | — | J+I transformado | ✓ | ✓ |
| Qian/Kun 6/6 | J+I primario | 用九/用六 | J+I transformado | ✓ | ✓ |

---

## 5. Residual conocido (fuera de alcance inmediato)

1. **Peso narrativo Zhu Xi 4–6** — el prompt lo instruye en prosa (Trazado / MUTATION RULE); no hay metadato numérico de peso.
2. **Zhu Xi 3 mutantes — emphasis operacional** — motor usa regla posición 1 entre las tres (equivalente Adler); no lookup 32-chart (`systemMatch: not_implemented` en gold).
3. **Gold `textTypes` vs pergamino** — mantener ambos: gold para filtro lineal + QA fidelidad; jerarquía tres capas para UI y `textsToSelections`.

---

## 6. Referencias

- `20260615-AUD-MUT-02-prompt-mutation-gates.md` — diseño INTERPRETED_LINES + gates
- `20260619-AUD-MUT-03-huang-rules-alignment.md` — alineación FOUR_LOWEST_STABLE superior estable
- `20260622-AUD-MUT-04-mutation-rules-pdf-gold.md` — gold Huang/Zhu Xi
- `packages/iching-engine/src/mutation-explore.ts` — `textsToSelections`
- `apps/web/src/lib/mutation-explorer/explore-mutation.ts` — `buildOracleTextBlocks`
- `backend/claude/src/interpretation.ts` — `buildPromptData` / BIBLIOTECA

---

## 7. Tests

| Código | Área |
|--------|------|
| `TS-WEB-015` | `apps/web/src/lib/mutation-explorer/explore-mutation` |
| `TS-ENG-004` | `packages/iching-engine/src/mutation-explore` |
