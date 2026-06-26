# Huesos de Oráculo — matriz de respaldo del producto actual
**Código:** `20260625-AUD-DIV-04 oracle-bones-product-support` · **Familia:** DIV · **Estado:** closed (Fase 1 documental)

**Fecha:** 2026-06-25  
**Objetivo:** responder de forma reproducible **qué respalda y qué no respalda** el método Huesos de Oráculo tal como está hoy en la app (motor, copy, bibliografía, enlaces históricos).  
**Política:** documentación únicamente — **sin** remediación de producto hasta pedido explícito (misma política que `AUD-DIV-03`).

**Relacionado:**
- [`20260625-AUD-DIV-03-oracle-bones-keightley.md`](./20260625-AUD-DIV-03-oracle-bones-keightley.md) — hallazgos G–J app ↔ Keightley PDF
- [`20260625-BRIEF-DIV-04-keightley-procedural-reference.md`](./20260625-BRIEF-DIV-04-keightley-procedural-reference.md) — procedimiento Shang según libro
- [`20260625-BRIEF-DIV-05-guia-bones-sources-trace.md`](./20260625-BRIEF-DIV-05-guia-bones-sources-trace.md) — trazabilidad `/notes`, Wikipedia, sacred-texts
- [`00000000-AUD-DIV-01-divination-methods.md`](./00000000-AUD-DIV-01-divination-methods.md) §5 — cierre 4 veredictos post-Silence

---

## 1. Respuesta ejecutiva

| Pregunta | Respuesta |
|----------|-----------|
| ¿Hay algo que respalde lo que tenemos? | **Sí, en parte:** el **marco ritual Shang** (hueso/caparazón, calor, grieta 卜, carga ±, lectura por un experto/rey). |
| ¿El motor concreto (4 veredictos, pesos, un tiro, T/X/Y) está respaldado? | **No** en sentido book-primary académico. Es **diseño de producto** desde el initial commit, con anclaje Keightley **posterior** (anti-Silence, carga ±). |
| ¿Wikipedia añade respaldo independiente? | **No.** Redirige a la misma cadena (Keightley, Qiu, Chou). Un enlace histórico (`Chinese_pyromancy`) ya **404**. |
| ¿La bibliografía `/notes` respalda el motor? | **Solo Keightley** trata procedimiento óseo directo; el resto es **contexto I Ching** o arqueología general. |
| Formulación honesta — **aplicada 2026-06-25** | *Inspirado en la piromancia Shang documentada por Keightley; la mecánica de cuatro respuestas en un sorteo es una simplificación moderna para la app.* Ver F2-1 (§9). |

---

## 2. Alcance auditado

| Bloque | Rutas / artefactos |
|--------|-------------------|
| Motor | `packages/oracle-bones-engine/src/engine.ts`, `types.ts` |
| Copy producto | `packages/i18n/src/messages/faq-page-ui.ts` (`oracle-bones-method`), `notes-page-ui.ts` (sección huesos), `guia-page-ui.ts` (`bonesPracticalBody`) |
| Imagen FLUX | `packages/image-engine/src/oracle-bones-prompt.ts` |
| Bibliografía pública | `notes-page-ui.ts` → `ACADEMIC_SOURCES` |
| Genealogía git | `87c5c9b` (Initial commit), `f462f43` (elimina Silence), `fd1ce52` (retira Wikipedia) |
| Fuentes externas revisadas | Keightley 1978/1985 PDF + gold; Wikipedia EN (jun 2026); IHPH/Academia Sinica; Rutt 1996; Nielsen 2003; Shaughnessy 1996; Wilhelm/Legge (solo contexto) |

**Out of scope:** interpretación IA (`oracle-bones-interpretation.ts`), publicación `/audits`, remediación copy.

---

## 3. Genealogía del producto vs fuentes académicas

| Época | Qué entró al repo | Fuente citada en commit/copy |
|-------|-------------------|------------------------------|
| `87c5c9b` (may 2026) | Motor 4 veredictos + pesos + 5.º «Silence» + T/X/Y imagen | **Ninguna** en código |
| `47f0804` / `e4e80a2` | Bloque Wikipedia en `/notes` (9 URLs) | Wikipedia → Keightley (indirecto) |
| `f462f43` | Elimina veredicto Silence; redistribuye pesos | **`AUD-DIV-01`** cita Keightley + IHPH |
| `169af00` | Bibliografía APA en `/notes` | Keightley + 5 obras I Ching |
| `fd1ce52` | Retira enlaces Wikipedia | — |
| `20260625` | Gold Keightley, `AUD-DIV-03`, `BRIEF-DIV-04/05` | Book-primary procedural |

**Conclusión genealógica:** casi todo lo **jugable** es diseño inicial; Keightley **refuerza** ritual y anti-Silence, **no** define taxonomía 4×4 ni pesos.

---

## 4. Matriz maestra — elemento producto × fuente

Leyenda veredicto: **PASS** = respaldo directo · **PARTIAL** = analogía o contexto · **FAIL** = contradice o no existe en fuente · **N/A** = fuente no trata el tema · **PRODUCT** = diseño app sin cita académica

### 4.1 Marco histórico y ritual

| Elemento producto | Keightley | Wikipedia (*Oracle bone*) | IHPH corpus | Rutt 1996 | Nielsen 2003 | Wilhelm/Legge |
|-------------------|-----------|---------------------------|-------------|-----------|--------------|---------------|
| Práctica Shang con calor en hueso/caparazón | PASS | PASS | PASS (registros) | PARTIAL cap.1 | PARTIAL prefacio | N/A |
| Grieta en forma 卜 | PASS §2.5 | PASS | PASS (imágenes) | PARTIAL | N/A | N/A |
| «Práctica oracular más antigua documentada de China» | PASS (contexto) | PASS | PASS (escala corpus) | PARTIAL | PARTIAL | N/A |
| Rey/adivino lee y prognostica (王占曰) | PASS §2.7 | PASS | PASS (textos) | N/A | N/A | N/A |
| Sets multi-grieta (5+5 por tema) | PASS §2.5 | PASS | PASS | N/A | N/A | N/A |
| **Un sorteo → un veredicto** | FAIL | FAIL (sets) | N/A | N/A | N/A | N/A |

### 4.2 Carga y veredicto

| Elemento producto | Keightley | Wikipedia | IHPH | Resto bibliografía |
|-------------------|-----------|-----------|------|-------------------|
| **Carga positiva + carga negativa** (±) | **PASS** *命辭* Ping-pien 8 | PARTIAL («charge» pos/neg) | PASS (textos) | N/A |
| **Veredicto por «patrón»** en un paso | PARTIAL (grieta 卜 ≠ veredicto grabado) | PARTIAL (interpretación «not known») | N/A | N/A |
| **4 estados** 大吉/吉/凶/大凶 simétricos | **FAIL** notaciones I: solo 吉 graduado | **FAIL** | N/A | N/A |
| **凶 / 大凶** como resultado visible tipo motor | **FAIL** §2.6: inauspiciosas **no grabadas** en grieta | PARTIAL (auspicious/inauspicious ocasional en texto rey) | N/A | N/A |
| **Pesos** 29.41 / 23.53 ×3 | **FAIL** | N/A | N/A | N/A |
| **Eliminar Silence** (5.º veredicto) | **PASS** (no categoría epigráfica) | PARTIAL | N/A | **PRODUCT** (`f462f43`) |
| Gradación 吉 (上吉, 小吉, 大吉, 弘吉) | **PASS** §4.3.1.11 (todas auspiciosas) | PARTIAL | N/A | Analogía débil con 吉×2 app |

### 4.3 Motor e imagen

| Elemento producto | Keightley | Wikipedia | Evidencia repo |
|-------------------|-----------|-----------|----------------|
| `rollCrackPattern()` → id 1–4 | FAIL | N/A | `engine.ts` L20–28 |
| `WEIGHTS` 0.2941 / 0.2353×3 | FAIL | N/A | `engine.ts` L7–12; comentario redistribución post-15% Silence |
| `verdictForPattern()` → `affirmsPositive` | PARTIAL (carga ± sí; mapping 1–4 no) | N/A | `engine.ts` L30–41 |
| `defaultNegativeCharge()` | PARTIAL (negación de carga) | N/A | `engine.ts` L64–80 |
| Topología T / X / Y en prompt imagen | FAIL | N/A | `AUD-DIV-03` §4.I |
| FAQ «faithful to the original Shang tradition» | **FAIL** | N/A | `faq-page-ui.ts` EN L274; ES L494 |
| Notas «respeta la lógica estructural Shang» | **PARTIAL** (± sí; patrón+4 estados no) | N/A | `notes-page-ui.ts` `bonesOriginBody` |
| Guía «siempre automático» | **PRODUCT** (UX) | N/A | `guia-page-ui.ts` |

---

## 5. Detalle por fuente

### 5.1 Keightley (1978/1985) — única fuente seria procedimental

| Qué respalda | Referencia | Implicación producto |
|--------------|------------|----------------------|
| Piromancia Shang auténtica | Cap. 2, Ping-pien 8, §3.7 | Copy de **origen histórico** defendible |
| Carga ± emparejada | §2.3, fig. 8 | Motor `positiveCharge` / `negativeCharge` alineado |
| Prefacio → carga → grieta → prognosticación | §2.1 | Ritual UI puede evocar capas; motor comprime |
| Notaciones 上吉, 小吉, 大吉, 弘吉 | §4.3.1.11 | **No** mapean 1:1 a 大吉/吉/凶/大凶 |
| 凶 ausente en inscripciones de grieta | §2.6 n.64 | Emisión `inauspicious_*` = simplificación |
| Sin probabilidades fijas | §2.5 | Pesos = PRODUCT |
| Sets, no un tiro | §2.5, BRIEF-DIV-04 §6 | Un cast = PRODUCT |

**Veredicto Keightley:** respaldo **fuerte** al marco; **no** al motor numérico ni al claim de fidelidad total.

### 5.2 Wikipedia (9 URLs históricas en `/notes`, retiradas `fd1ce52`)

Inventario completo: `BRIEF-DIV-05` §1c.

| URL | Estado jun 2026 | ¿Respalda motor 4×4? |
|-----|-----------------|----------------------|
| `Oracle_bone_script` | Activo | No — enlaza a *Oracle bone* |
| `Oracle_bone` | Activo (vía redirección) | No — «interpretation not known» |
| `Chinese_pyromancy` | **404** | No — enlace muerto en versión histórica |
| `Shang_dynasty` | Activo | No — contexto; cita Keightley |
| `I_Ching`, `I_Ching_divination`, `Ten_Wings`, `Zhu_Xi`, `Wilhelm`, `Shaughnessy` | Activos | **No** — I Ching o biografías |

**Veredicto Wikipedia:** orientación enciclopédica hacia Keightley; **cero** respaldo independiente al motor 4×4.

### 5.3 Academia Sinica / IHPH

| Qué es | Qué respalda | Qué no |
|--------|--------------|--------|
| Corpus ~40k+ 拓片, búsqueda por tema (卜法) | Existencia masiva de inscripciones; texto de cargas reales | Procedimiento jugable 4 veredictos |
| Citado en `AUD-DIV-01` junto a Keightley | Argumento anti-Silence (hay lecturas grabadas) | **No** sustituye a Keightley como manual |

### 5.4 Rutt (1996), Nielsen (2003), Shaughnessy (1996)

| Obra | Rol real vs motor huesos |
|------|--------------------------|
| Rutt *Bronze Age Document* | Contexto Shang + distinción óseos vs Zhouyi/varas — **no** taxonomía app |
| Nielsen *I Ching Companion* | Descubrimiento óseos 1899; debate 数字卦 — puente arqueología↔hexagramas — **no** 4 veredictos |
| Shaughnessy (1996) *I Ching* en bibliografía | I Ching Zhou — **no** procedimiento óseo |
| Shaughnessy (1993) *Western Zhou History* | Citado en copy histórico varas/Wikipedia — **obra distinta**, no huesos |

### 5.5 Wilhelm / Legge

**N/A** para huesos. Apéndices y traducciones = monedas/varas I Ching (`AUD-DIV-02`).

### 5.6 Influencia implícita no documentada

| Factor | Tipo de «respaldo» |
|--------|-------------------|
| Gradación 吉/凶 estilo I Ching (misma app, traductores W/L) | Convención cultural compartida — **no** extracción Keightley |
| Abstracción ludificada (un tiro, cuatro etiquetas legibles) | Decisión UX — **PRODUCT** |

---

## 6. Detalle por bloque producto

### 6.G — Cuatro veredictos (`oracle-bones-engine`)

| ID | Hallazgo | Veredicto AU |
|----|----------|--------------|
| G1 | Sin Silence | **PASS** vs Keightley |
| G2 | `inauspicious_*` visibles | **GAP** — no epigráfico |
| G3 | 大吉/吉/凶/大凶 ≠ taxonomía Keightley | **FAIL** book-primary; **PASS** abstracción producto |
| G4 | Un cast vs sets | **INFO** — documentar en copy |

*(Heredado de `AUD-DIV-03` §4.G; cerrado aquí en matriz de respaldo.)*

### 6.H — Pesos aleatorios

| Dato | Veredicto |
|------|-----------|
| 29.41% / 23.53% ×3 post-15% Silence | **PRODUCT** — `DIV-01` §5, `engine.ts` L5–12 |
| Ninguna fuente citada define estas cifras | **INFO** — no FAIL si copy no afirma derivación del libro |

### 6.I — Imagen T/X/Y

| Dato | Veredicto |
|------|-----------|
| Metáfora visual FLUX | Aceptable como arte |
| Ancla arqueológica por patrón | **FAIL** — sin cita book-primary |

### 6.J — Copy sobreafirmación

| Texto | Ubicación | Veredicto |
|-------|-----------|-----------|
| «faithful to the original Shang tradition» | FAQ EN | **FAIL** |
| «fieles al método ancestral Shang» | FAQ ES (+ 9 locales) | **FAIL** |
| «respeta la lógica estructural del sistema Shang: carga positiva, carga negativa y veredicto por patrón» | `/notes` `bonesOriginBody` | **PARTIAL** — ± sí; «veredicto por patrón» en un paso no |
| «inspirado en la lectura de grietas» | FAQ ES (inicio) | **PASS** — formulación más honesta ya presente |

**Remediación propuesta (Fase 2, pendiente usuario):** unificar tono FAQ/notas hacia «inspirado en» / «simplificación moderna»; retirar «faithful» / «fieles al método ancestral».

---

## 7. Tabla resumen — ¿hay support?

| Categoría | ¿Support? | Fuentes |
|-----------|-----------|---------|
| **A. Ritual Shang existió** | ✅ Sí | Keightley, IHPH, Wikipedia, Rutt, Nielsen |
| **B. Calor + grieta 卜** | ✅ Sí | Keightley, Wikipedia |
| **C. Carga positiva + negativa** | ✅ Sí | Keightley (gold Ping-pien 8) |
| **D. Lectura / prognosticación por experto** | ✅ Sí (genérico) | Keightley §2.7 |
| **E. Cuatro veredictos simétricos en un tiro** | ❌ No | — |
| **F. Pesos 29.41/23.53…** | ❌ No | — |
| **G. Patrones T/X/Y ↔ veredicto** | ❌ No | — |
| **H. «Fiel a tradición Shang original»** | ❌ No | Contradice Keightley + sets + taxonomía |
| **I. Eliminar Silence** | ✅ Razonable | Keightley + DIV-01 |
| **J. Gradación 吉 (analogía)** | ⚠️ Débil | Keightley solo auspiciosos en grieta |
| **K. Bibliografía mezclada I Ching + Keightley** | ⚠️ Confunde | Solo Keightley = huesos procedimental |

---

## 8. Formulaciones recomendadas (referencia copy futura)

| Evitar (FAIL book-primary) | Preferir (PASS honesto) |
|----------------------------|-------------------------|
| «Faithful to the original Shang tradition» | «Inspired by Shang crack divination (Keightley 1978)» |
| «Arqueológicamente auténtico» (4 veredictos) | «Four readable outcomes in the app» |
| «Veredicto por patrón» (sin matiz) | «Positive/negative charge + a simplified crack verdict» |
| Implicar que Rutt/Nielsen/Wilhelm validan el motor | «Historical context in bibliography; procedure anchored in Keightley» |

---

## 9. Fase 2

| ID | Entrega | Estado |
|----|---------|--------|
| F2-1 | Remediación copy FAQ/notas (11 locales) | **Cerrado 2026-06-25** — «fiel a»/«respeta» → «inspirado en»; nota de legado añadida en `/notes`. `guia-page-ui.ts` (`bonesPracticalBody`) revisado, sin claim de fidelidad, sin cambio necesario. |
| F2-2 | Nota en `RPT-DIV-00` § huesos (PRODUCT vs Keightley) | **Cerrado 2026-06-25** — `00000000-RPT-DIV-00-procedural-integrity-summary.md` §5 actualizada |
| F2-3 | Entrada `/audits` huesos (WF-DOC-03) | Pendiente — sin fecha; bloqueada por F2-4 (no publicar book-primary sin harness automatizado) |
| F2-4 | Harness `VF-DIV-002` reglas G/J | Pendiente — sin fecha; depende de decisión de alcance (¿auditar 1 grieta o sets completos? ver `AUD-DIV-03` §4.G) |

---

## 10. Comandos y artefactos reproducibles

```bash
npm run extract:gold:keightley-procedural
# Gold: tools/datasets/keightley/procedural/keightley-procedural-gold.json

git log -S "wikipedia" --oneline -- apps/web/src/app/notes/page.tsx
git show f462f43 -- packages/oracle-bones-engine/
```

| Artefacto | Ruta |
|-----------|------|
| Motor | `packages/oracle-bones-engine/src/engine.ts` |
| Gold Keightley | `tools/datasets/keightley/procedural/keightley-procedural-gold.json` |
| Trazabilidad fuentes | `20260625-BRIEF-DIV-05-guia-bones-sources-trace.md` §1c |
| Procedimiento libro | `20260625-BRIEF-DIV-04-keightley-procedural-reference.md` §11 |

---

## 11. Changelog

| Fecha | Evento |
|-------|--------|
| 2026-06-25 | Apertura y cierre Fase 1 documental: matriz producto × fuentes (Keightley, Wikipedia, bibliografía, git); veredictos consolidados G–J + tabla resumen A–K |
| 2026-06-25 | **Sweep de deuda documental**: F2-1 y F2-2 cerrados (copy FAQ/notas corregido; `RPT-DIV-00` §5 actualizada). F2-3/F2-4 confirmados pendientes, sin fecha, bloqueados por la decisión de alcance del harness book-primary. |
