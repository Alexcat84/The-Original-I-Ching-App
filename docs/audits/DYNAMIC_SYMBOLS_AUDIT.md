# Auditoría — Símbolos Dinámicos en el Resultado del I Ching

**Última actualización:** 2026-06-06
**Branch de referencia:** `main` @ `e7cc89f`
**Alcance:** Verificación completa de todos los símbolos chinos que aparecen en la cadena de respuesta (prompt → Claude → UI → PDF → imagen)

---

## Estado · Changelog de cierre

> **Estado:** ✅ CERRADA — todos los símbolos dinámicos verificados y corregidos; un símbolo estático intencional documentado

| Campo | Valor |
|-------|-------|
| **Abierta** | 2026-06-06 |
| **Cerrada** | 2026-06-06 |
| **Disparador** | Usuario detectó "El trazado hacia el 之卦" siempre idéntico en todas las tiradas |
| **Commits de fix** | `10b0221`, `2857460`, `2c68a01` |

### Resolución de hallazgos

| # | Hallazgo | Resultado | Commits |
|---|---------|-----------|---------|
| 1 | `buildPromptData` enviaba `之卦` hardcodeado en los headings ES/EN del scroll | ✅ Corregido — usa `trChinese = tr?.chineseName` | `10b0221` |
| 2 | `buildPromptData` tenía `之卦` hardcodeado en la descripción de rol de sección | ✅ Corregido — usa `${trChinese}` | `10b0221` |
| 3 | `ConsultationRecordCard` mostraba `(之卦)` hardcodeado en el trace de la card | ✅ Corregido — prop `transformedHexagramChinese` propagada | `10b0221` |
| 4 | Export PDF en `page.tsx` mostraba `(之卦)` hardcodeado | ✅ Corregido — mismo prop | `10b0221` |
| 5 | `ConsultResponse` y `ApiChatConsultation` no tenían el campo `transformedHexagramChinese` | ✅ Corregido — campo añadido a ambos tipos | `10b0221` |
| 6 | `session-store.ts` no derivaba `transformedHexagramChinese` para consultas históricas | ✅ Corregido — derivado de `getHexagramRecordByNumber` | `10b0221` |
| 7 | `route.ts` no incluía `transformedHexagramChinese` en la respuesta de la API | ✅ Corregido — añadido en dos puntos de respuesta | `10b0221` |
| 8 | TRANSLATOR RULE en el prompt usaba `之卦` estático para nombrar la sección | ✅ Corregido — usa `${trChinese}` | `2857460` |
| 9 | Backticks sin escapar en línea 332 causaban error de sintaxis TypeScript en CI/Vercel | ✅ Corregido — escapados como `\`` | `2c68a01` |

---

## 1. Disparador de la auditoría

El usuario detectó que el heading `## El trazado hacia el 之卦` aparecía **idéntico en todas las tiradas** del I Ching, sin importar cuál fuera el hexagrama transformado real. El símbolo 之卦 (zhī guà = "hexagrama resultante") es un término genérico chino que debería reemplazarse por el nombre real del hexagrama transformado (e.g., 坤, 乾, 震…).

La investigación reveló que el bug tenía **dos capas independientes**: una en la construcción del prompt enviado a Claude (donde el modelo recibía 之卦 fijo en los headings) y otra en la capa de display de la UI (donde los componentes mostraban 之卦 hardcodeado independientemente de lo que devolviera la API).

---

## 2. Inventario completo de símbolos — resultado de la auditoría

### 2.1 Símbolos en el texto de respuesta de Claude

| Símbolo | Heading donde aparece | ¿Estático o dinámico? | Justificación |
|---|---|---|---|
| **卦辞** | `## El juicio (卦辞)` | **Estático — intencional** | 卦辞 (guà cí) es el nombre del tipo de texto en el canon del I Ching ("texto del hexagrama"). Es un término fijo equivalente a "Capítulo" — no es el nombre de un hexagrama. El prompt lo documenta explícitamente: `"Chinese label 卦辞 only as shown"`. |
| **[nombre real]** | `## El trazado hacia el [X]` | **Dinámico** | Debe ser el `chineseName` del hexagrama transformado real (e.g., 坤, 乾, 屯…). Bug corregido. |

### 2.2 Símbolos en el prompt (internos, no visibles al usuario)

| Símbolo | Ubicación en el código | Rol | Estado |
|---|---|---|---|
| 卦辞 | `scrollHeadingsEs/En` | Label fijo en el heading del juicio | ✅ Correcto — estático intencional |
| `${trChinese}` | `scrollHeadingsEs/En`, `headingsBlock`, TRANSLATOR RULE | Nombre real del hexagrama transformado | ✅ Correcto post-fix |
| 象傳 | `SYSTEM_PROMPT` línea 40 (instrucción de formato) + output de Claude | Etiqueta del tipo de texto "Comentario sobre la Imagen" — aparece como label en el response (`La imagen (象傳)`) | ✅ Correcto — estático intencional, igual que 卦辞 |
| 之卦 | `SYSTEM_PROMPT` línea 40 (instrucción de formato) | Etiqueta genérica de categoría en regla de tipografía | ✅ Correcto — no es un nombre de hexagrama específico; es para formatear el blockquote del juicio transformado |
| `${tr.chineseName}` | `textsBlock` (standard y master_combined) | Nombre del hexagrama transformado en el bloque de textos enviado a Claude | ✅ Siempre fue dinámico |

### 2.3 Símbolos en la UI (componentes React)

| Punto de display | Componente / Archivo | Estado post-fix |
|---|---|---|
| Card de resumen de consulta (`#1 乾 → #2 坤`) | `ConsultationRecordCard.tsx` | ✅ Dinámico — prop `transformedHexagramChinese` |
| Export PDF trace | `apps/web/src/app/page.tsx` | ✅ Dinámico — mismo prop |
| Consultas históricas (hydration desde DB) | `session-store.ts` | ✅ Derivado de `getHexagramRecordByNumber(number)` |

### 2.4 Símbolos en la imagen generada

| Elemento | Implementación | Estado |
|---|---|---|
| Líneas del hexagrama (overlay SVG) | `sumi-hexagram-art.ts` → `buildSumiHexagramOverlaySvgDataUrl` | ✅ Siempre fue dinámico — recibe `transformedChinese` como parámetro |
| Overlay Oracle Bones | `buildOracleBonesSymbolOverlaySvgDataUrl` | ✅ Siempre fue dinámico |

---

## 3. Cadena de propagación corregida

```
iching-engine (castResult)
  └─ castResult.transformedHexagram.chineseName
        │
        ├─→ backend/claude/src/interpretation.ts
        │     └─ trChinese = tr?.chineseName ?? "之卦"
        │           ├─→ scrollHeadingsEs: "## El trazado hacia el ${trChinese}"
        │           ├─→ scrollHeadingsEn: "## The turning pattern (${trChinese})"
        │           └─→ TRANSLATOR RULE: "El Trazado hacia el ${trChinese}"
        │
        ├─→ apps/web/src/app/api/consult/route.ts
        │     └─ response: { transformedHexagramChinese: castResult.transformedHexagram?.chineseName ?? null }
        │
        ├─→ apps/web/src/app/page.tsx
        │     ├─→ ConsultResponse.transformedHexagramChinese
        │     ├─→ ApiChatConsultation.transformedHexagramChinese
        │     ├─→ ConsultationRecordCard: transformedHexagramChinese={entry.transformedHexagramChinese}
        │     └─→ PDF export trace: "#1 乾 → #2 坤"
        │
        ├─→ apps/web/src/components/ConsultationRecordCard.tsx
        │     └─ trace = `#${primaryHexagram} ${primaryHexagramChinese} → #${transformedHexagram} ${transformedHexagramChinese}`
        │
        └─→ apps/web/src/lib/session-store.ts (consultas históricas)
              └─ transformedHexagramChinese: getHexagramRecordByNumber(number)?.chineseName ?? null
```

---

## 4. Símbolo estático intencional — 卦辞

**卦辞** (guà cí) es el término técnico del I Ching para "texto/veredicto del hexagrama". No es el nombre de un hexagrama concreto — es el nombre del tipo de texto, equivalente a "Juicio" en las traducciones occidentales. En el canon chino, cada uno de los 64 hexagramas tiene un 卦辞.

**Por qué aparece siempre igual:**
El heading `## El juicio (卦辞)` es comparable a `## Introducción` — el término no varía porque es la etiqueta del tipo de contenido, no del contenido específico. Sería incorrecto dinaminzarlo.

**Documentado en el prompt** (`interpretation.ts:293`):
```
"Chinese label 卦辞 only as shown; ${trChinese} is the specific transformed hexagram"
```

---

## 5. Símbolo estático intencional — 象傳

**象傳** (xiàng zhuàn) es el "Comentario sobre la Imagen" — el segundo tipo de texto canónico del I Ching, atribuido a la escuela confuciana. Cada uno de los 64 hexagramas tiene un 象傳 propio. Es un nombre de *tipo de texto*, no el nombre de un hexagrama concreto.

**Por qué aparece siempre igual:**
Igual que 卦辞, 象傳 es la etiqueta de la categoría de texto, no del contenido. El texto del Comentario sobre la Imagen varía con cada hexagrama; el label 象傳 nunca varía. Sería incorrecto dinamizarlo.

**Distinción clave frente a 之卦:**

| Símbolo | Tipo | ¿Varía? | Correcto |
|---|---|---|---|
| 卦辞 | Nombre de sección canónica (Juicio) | No — etiqueta de tipo | ✅ Estático intencional |
| 象傳 | Nombre de sección canónica (Imagen) | No — etiqueta de tipo | ✅ Estático intencional |
| 之卦 | Nombre genérico del hexagrama transformado | Sí — debe ser el nombre real | ✅ Dinámico post-fix |

---

## 6. Impacto en master_combined (Master 3)

El bug afectaba a todos los traductores, incluyendo master_combined. El fix en `buildPromptData` es compartido por todos los modos — `isMasterCombined` solo afecta al bloque de textos y a la instrucción de triangulación, no a los headings ni al TRANSLATOR RULE.

El `masterSynthesisInstruction` para master_combined menciona `"the turning pattern"` en inglés genérico (sin carácter chino fijo) — ese bloque era correcto desde antes.

---

## 7. Error de CI/Vercel — causa raíz

Al cambiar la descripción de la sección en línea 332 de comillas dobles a backticks para mostrar la interpolación, se introdujeron backticks sin escapar **dentro** de un template literal externo. TypeScript los interpretó como cierre prematuro del template literal, generando errores de sintaxis en cascada (`TS1005: ',' expected`).

El check local (`apps/web/tsc --noEmit`) no detectó el error porque el paquete `@iching-oracle/claude` se importa desde su dist compilado, no desde fuente. El CI corre `tsc --noEmit` directamente en `backend/claude/`, que sí detecta el error.

**Fix:** Escapar con `\`` → `\`El trazado hacia el ${trChinese}\`` (`commit 2c68a01`).

**Lección:** Siempre correr `tsc --noEmit` en `backend/claude/` además de `apps/web/` al modificar archivos de ese paquete.

---

## 8. Oracle Bones — auditoría de símbolos

Oracle Bones es estructuralmente distinto al I Ching: no maneja hexagramas individuales ni nombres chinos de figuras. El vector de bugs del 之卦 no aplica. Todo gira alrededor de `cast.verdict` (4 valores) y `cast.affirmsPositive` (booleano).

### 8.1 Inventario de símbolos Oracle Bones

| Símbolo / Dato | Fuente | ¿Dinámico? | Estado |
|---|---|---|---|
| Veredicto natural (`favorable claro`, etc.) | `verdictNaturalLabelLocalized(cast.verdict, language)` — 4 veredictos × 11 idiomas | **Dinámico** | ✅ correcto |
| Carga positiva / negativa | `cast.positiveCharge` / `cast.negativeCharge` — texto del usuario | **Dinámico** | ✅ correcto |
| Medium (turtle / ox) | `cast.medium` | **Dinámico** | ✅ correcto |
| Headings de sección | `interpretationHeadingLocalized(language)` + `finalGuidanceHeadingLocalized(language)` — 11 idiomas | **Dinámico** | ✅ correcto |
| Línea de veredicto estructural | `structuralVerdictLineLocalized(cast, language)` — construida desde `cast.verdict` + `affirmsPositive` + idioma | **Dinámico** | ✅ correcto |
| 吉 / 凶 en overlay de imagen | `oracleBonesVerdictChinese(verdict)` — devuelve 吉 o 凶 según veredicto | **Dinámico** | ✅ correcto |
| Gradiente SVG del glyph | `oracleBonesVerdictGlyphSvgStyle(verdict, idPrefix)` — colores distintos por veredicto | **Dinámico** | ✅ correcto |
| `甲骨` en `primaryHexagramChinese` | `route.ts` — valor fijo `"甲骨"` (= "huesos de oráculo") | **Estático — intencional** | ✅ identificador del tipo de oráculo; no se muestra en la card |

### 8.2 ConsultationRecordCard — rama oracle_bones

La card de Oracle Bones usa su propia rama de renderizado (sin trace de hexagramas). Muestra:
- Veredicto localizado — dinámico
- Medium (tortuga / buey) — dinámico
- Carga (positivo / negativo) — dinámico
- Posición en hilo + fecha — dinámico

No hay ningún nombre de hexagrama en esta rama — correcto por diseño.

### 8.3 甲骨 — símbolo estático intencional

`甲骨` (jiǎ gǔ) = "huesos de oráculo" en chino. Es el nombre del tipo de oráculo, no de un hexagrama concreto. Se almacena en `primaryHexagramChinese` para identificar internamente el tipo de consulta. No aparece en el display de la card ni en el PDF.

### 8.4 Conclusión

Oracle Bones no requiere ningún fix. Sin bugs equivalentes al 之卦. Todos los valores que aparecen al usuario son derivados dinámicamente del resultado del cast.

---

## 9. Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/claude/src/interpretation.ts` | `trChinese` variable; headings dinámicos; TRANSLATOR RULE dinámico; backtick escapado |
| `apps/web/src/app/api/consult/route.ts` | Campo `transformedHexagramChinese` en respuesta (2 puntos) |
| `apps/web/src/app/page.tsx` | Tipos `ConsultResponse` y `ApiChatConsultation`; hydration; prop a card; PDF trace |
| `apps/web/src/components/ConsultationRecordCard.tsx` | Prop `transformedHexagramChinese`; trace dinámico |
| `apps/web/src/lib/session-store.ts` | Derivación de `transformedHexagramChinese` desde número para historial |

---

*Auditoría realizada: 2026-06-06 | Cierre: 2026-06-06*
