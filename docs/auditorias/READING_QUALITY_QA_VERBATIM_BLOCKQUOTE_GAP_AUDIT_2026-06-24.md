# Auditoría — Gap verbatim juicio/imagen en lecturas IA (prompt vs gates vs salida)

- **Fecha:** 2026-06-24
- **Estado:** 🟢 **Mitigada** — Gate H7 (warn + telemetría) implementado y verificado offline (§11); reintento automático diferido a decisión futura con datos reales de Sentry.
- **Modelo evaluado:** `claude-sonnet-4-6` (estándar de producción) · tier master · idioma `es`
- **Alcance:** Citas literales en blockquote de **Juicio** e **Imagen** (ruta `NO_CHANGING`, sin líneas mutantes). Comparación **carácter a carácter** contra bundle runtime local — no EPUB remoto, no git, no `% match` heurístico.
- **Artefactos smoke (reproducibles):**
  - `reports/reading-quality-qa-2026-06-24T03-15-06.json`
  - `reports/reading-quality-qa-2026-06-24T03-15-06-transcripts.md`
  - Harness: `scripts/reading-quality-qa.mjs` (`npm run qa:reading-quality -- --random 3 --translators wilhelm,legge`)
- **Relacionado (contexto distinto):** [READING_QUALITY_QA_JUDGMENT_REGRESSION_AUDIT_2026-06-23.md](./READING_QUALITY_QA_JUDGMENT_REGRESSION_AUDIT_2026-06-23.md) cubrió **corrupción del bundle** (dato roto en sync). Este documento cubre **salida del modelo** cuando el bundle **ya es correcto**.

---

## 1. Resumen ejecutivo

El prompt de interpretación exige citar Juicio e Imagen **VERBATIM** (mismo idioma de la biblioteca, sin parafrasear, truncar ni alterar). La BIBLIOTECA del payload incluye el texto exacto del bundle. Aun así, Claude **modifica** blockquotes en una fracción de consultas Legge (y ocasionalmente “normaliza” puntuación que en la fuente es atípica pero correcta).

Los validadores de producción (`validateInterpretationOutput`, gates H1/H3/H5) **no comprueban** fidelidad literal de juicio/imagen. En ruta `NO_CHANGING` (cero líneas cambiantes), H1 pasa **sin validar nada** porque `selectedLineTexts` está vacío.

**Conclusión:** un `[PASS]` estructural del harness **no implica** PASS 1:1 letra a letra en juicio/imagen.

| Criterio | Smoke 2026-06-24 (hex 1, 16, 29 × W+L) |
|---|---|
| Juicio + Imagen idénticos al bundle | **11/12** filas |
| Único FAIL reproducido | Hex **29** Legge **juicio** (puntuación) |
| Gates automáticos del script | 6/6 `[PASS]` pese al FAIL literal |

---

## 2. Método de verificación (criterio binario)

1. Smoke API real: `reading-quality-qa.mjs` con `--random N` (pipeline idéntico a prod: `performCastFromLineValues` → `buildAnthropicUserPayloadForCast` → Anthropic → `validateInterpretationOutput`).
2. Extraer blockquotes de `## El juicio` y `## La imagen` del campo `rendered`.
3. Unir líneas del blockquote con `\n` (como en el bundle).
4. Comparar con `packages/iching-data/src/generated/hexagrams.{wilhelm,legge}.json` usando **igualdad estricta** (`===`), carácter por carácter, incluyendo paréntesis y puntuación.
5. **PASS** solo si idéntico. Cualquier diferencia = **FAIL**. No hay grados intermedios.

Fuente de verdad local verificada para el caso de estudio (hex 29):

| Capa | Texto juicio (fragmento crítico) |
|---|---|
| TXT maestro `tools/source-pdfs/Yi King - James Legge-64hex.txt` L1527 | `…through which the mind is. penetrating. Action…` |
| Dataset `tools/datasets/legge/book-one/legge-64hex-parsed.json` | idem |
| Bundle runtime `hexagrams.legge.json` | idem |
| Sacred Texts SBE XVI (referencia externa) | idem |

---

## 3. Hallazgo principal — el modelo altera citas pese a VERBATIM

### 3.1 El prompt sí lo exige

Ubicación: `backend/claude/src/interpretation.ts`

| Capa | Regla |
|---|---|
| `SYSTEM_PROMPT` regla 5 / 59 / 60 | Blockquote verbatim; Legge: paréntesis editoriales obligatorios |
| Bloque `INSTRUCTIONS` | `SOURCE FIDELITY (ALL TRANSLATORS, NON-NEGOTIABLE): … Never translate, paraphrase, truncate, or alter …` |
| Modo ritual | `El juicio` / `La imagen`: blockquote obligatorio del texto clásico “when provided” |

### 3.2 La BIBLIOTECA sí inserta el texto exacto

Dump del payload para hex 29 Legge (`buildAnthropicUserPayloadForCast`):

```
JUDGMENT: Khan, here repeated, shows the possession of sincerity, through which the mind is. penetrating. Action (in accordance with this) will be of high value.
```

El punto tras `is` **está en el input**. No es un defecto de ingestión ni de cast.

### 3.3 Evidencia smoke — hex 29 Legge juicio (FAIL 1:1)

**Bundle (fuente de verdad):**

```
Khan, here repeated, shows the possession of sincerity, through which the mind is. penetrating. Action (in accordance with this) will be of high value.
```

**Blockquote en salida QA (`2026-06-24T03-15-06`):**

```
Khan, here repeated, shows the possession of sincerity, through which the mind is penetrating. Action (in accordance with this) will be of high value.
```

**Diff:** falta el carácter `.` entre `is` y `penetrating`. El modelo “corrige” una secuencia que parece error tipográfico del SBE (`is.` + `penetrating.` en renglones distintos en el original impreso).

### 3.4 Patrones adicionales observados (Legge imagen)

En barridos estrictos sobre reportes más amplios del mismo harness, Legge **imagen** muestra dos modos de desviación (ambos FAIL 1:1):

1. **Omisión de prefijo trigramático:** se cita solo la frase del “superior man”, omitiendo `(The trigram representing) … form Kwâi.` (ej. hex 43).
2. **Eliminación de paréntesis Legge:** el cuerpo semántico permanece pero sin `(The trigram representing)`, `(from among them)`, etc. (ej. hex 7).

Wilhelm juicio/imagen, en el mismo barrido estricto, fue **64/64** idéntico al bundle.

> Estos patrones requieren re-verificación manual mañana; el smoke de 3 hex confirma al menos el FAIL de puntuación en hex 29 Legge juicio.

---

## 4. Por qué los gates no lo detectan

`validateInterpretationOutput` (`backend/claude/src/interpretation-output-validator.ts`):

| Gate | Qué valida | ¿Juicio/Imagen? |
|---|---|---|
| H1 | Fingerprint de **líneas** en `selectedLineTexts` | No — vacío en NO_CHANGING → auto-PASS |
| H1b | Blockquote de **líneas** | No |
| H3 | Líneas fabricadas omitidas | No |
| H5 | 用九/用六 | No |
| H4 / H6 | Fuga códigos internos / estructura ## | No |

Retry de producción (`apply-interpretation-gates.ts`) solo se dispara por fallos **H1/H3/H5** — todos orientados a **líneas mutantes**, no a juicio/imagen.

El harness `reading-quality-qa.mjs` llama la API directamente y usa el mismo validador → puede reportar `[PASS]` con FAIL literal en juicio/imagen.

---

## 5. Hipótesis de causa (modelo, no dato)

1. **Normalización gramatical:** `mind is. penetrating` parece OCR/salt de línea; el LLM lo trata como error y unifica a `is penetrating`.
2. **Boilerplate Legge:** prefijos `(The trigram representing)…` se interpretan como redundantes pese a regla 60 del system prompt.
3. **Prioridad competidora del prompt:** tono poético, extensión 700–900 palabras, prosa en español, y reglas de mutación compiten con VERBATIM cuando no hay enforcement mecánico.
4. **Señal cultural de los gates de líneas:** H1 usa fingerprint tolerante (20 chars, normaliza puntuación CJK) solo para **líneas** — no generaliza a juicio, pero refuerza que el producto tolera deriva en citas salvo gate explícito.

No hay `temperature` override en interpretación (`anthropic-interpretation-params.ts` usa default API).

---

## 6. Impacto producto

- El usuario ve en la UI una cita que **no es** la del traductor seleccionado, incumpliendo la promesa de fidelidad book-primary en la capa de lectura IA.
- Wilhelm en la muestra smoke: **sin desviación** en los 3 hex probados.
- Legge: **riesgo sistemático** en imagen (prefijos/paréntesis) y puntual en juicio (puntuación atípica del SBE).
- Zhou Yi: fuera de alcance de este smoke (solo W+L).

---

## 7. Checklist verificación manual (propietario — 2026-06-25)

```bash
# Smoke pequeño (6 llamadas API con --random 3)
npm run qa:reading-quality -- --random 3 --translators wilhelm,legge

# Comparación estricta manual: abrir JSON generado, comparar blockquotes vs
# packages/iching-data/src/generated/hexagrams.{wilhelm,legge}.json
# Criterio: === carácter a carácter, sin excepciones
```

Puntos a confirmar:

- [ ] Reproducir FAIL hex 29 Legge juicio (punto tras `is`)
- [ ] Muestrear 5 hex Legge imagen con prefijo `(The trigram representing)` — ¿omisión sistemática?
- [ ] Confirmar Wilhelm sigue 100% en muestra ampliada (`--random 10` o `--limit 64`)
- [ ] Decidir si el punto `is.` es fidelidad obligatoria (SBE) o candidato a normalización **en bundle** (decisión editorial separada — no mezclar con gate de salida IA)

---

## 8. Remediación propuesta (NO EJECUTADA)

Opciones para sesión posterior (requieren aprobación explícita):

1. **Gate H7 (bloqueante o warn):** fingerprint o `===` de juicio/imagen citados vs `cast.textsForClaude.primaryJudgment` / `primaryImage` (y transformado si aplica).
2. **Retry dirigido:** si H7 falla, re-inyectar en user message el texto exacto exigido (patrón H2 de líneas).
3. **Extender `reading-quality-qa.mjs`:** reportar columna `judgmentVerbatim` / `imageVerbatim` en JSON (FAIL explícito, no solo gates H1–H6).

---

## 9. Commits / ramas

- Documento creado en sesión 2026-06-24; smoke artefactos en `reports/reading-quality-qa-2026-06-24T03-15-06.*`.
- Harness: flag `--random N` añadido a `scripts/reading-quality-qa.mjs`; npm script `qa:reading-quality`.

---

## 10. Addendum — el gap se confirma también en Master (3) / Wilhelm (2026-06-24, sesión posterior)

Se construyó `scripts/master-synthesis-qa.mjs` (nuevo harness, mismo patrón de
`reading-quality-qa.mjs`: `performCastFromLineValues` → `buildAnthropicUserPayloadForCast` →
Anthropic API real → `validateInterpretationOutput`, sin Supabase ni `/api/consult`) para
extender la cobertura de este hallazgo a `translatorId: "master_combined"`, donde el prompt exige
cita literal de **los 3 traductores** (Wilhelm + Legge + Zhou Yi) en bloques etiquetados dentro de
"El juicio"/"La imagen". El script implementa el **Gate H7 propuesto en §8.1** como chequeo
post-hoc (no productivo todavía): extrae el blockquote etiquetado por traductor y lo compara
`===` contra `cast.textsForClaude.{primary,legge,zhouyi}{Judgment,Image}` (el texto literal que de
hecho se inyectó en el prompt).

**Smoke ejecutado: 2 llamadas reales (hex 1, hex 2, `master_combined`, NO_CHANGING).** Resultado:

| Hex | Wilhelm | Legge | Zhou Yi |
|---|---|---|---|
| 1 | OK | OK | OK |
| 2 | **FAIL (Imagen)** | OK | OK |

**Diff hex 2, Imagen, Wilhelm:**

```
esperado: "The earth’s condition is receptive devotion. ..."   (U+2019 ’ tipográfico)
obtenido: "The earth's condition is receptive devotion. ..."   (U+0027 ' recto)
```

El modelo normalizó el apóstrofe tipográfico del bundle a uno recto ASCII. **Mismo patrón de causa
raíz que el hallazgo de Legge en §3** (el modelo "corrige" tipografía que percibe como atípica),
ahora confirmado también en **Wilhelm**, no solo Legge, y específicamente bajo síntesis Master (3)
donde se triangulan los 3 traductores a la vez. No se ejecutaron más llamadas tras este smoke
(decisión del propietario: el gap ya estaba confirmado por la Parte 1-9 de este documento; no se
requiere re-validación adicional, solo pasar a remediación). Artefactos:
`reports/master-synthesis-qa-2026-06-24T10-59-38.{json,md}` +
`-transcripts.md`.

**Conclusión del addendum:** el gap no es específico de Legge ni de un solo traductor: es
estructural a "el modelo no preserva tipografía/puntuación atípica del bundle al citar
verbatim", y afecta a cualquier traductor/modo que dependa de cita literal sin un gate mecánico
que la fuerce. Refuerza la prioridad de implementar el Gate H7 (opción 1 de §8) antes que seguir
ampliando muestras.

---

## 11. Remediación implementada (2026-06-24, mismo día)

Decisión del propietario: el gap ya estaba suficientemente probado (§1-10); no se necesitan más
smokes manuales, pasar directo a remediación. Severidad acordada explícitamente: **warn +
telemetría, sin reintento automático** (no bloqueante) — un mismatch aquí no debe duplicar costo
de API ni arriesgar que una consulta completa falle (`InterpretationQualityError`, 2 reintentos
agotados) por una normalización tipográfica menor; la opción de escalar a bloqueante (§8, opción
2) se revisita más adelante con volumen/patrón reales de Sentry, no con más smokes.

### 11.1 — Qué se implementó (opción 1 de §8)

- **`backend/claude/src/interpretation-judgment-image-gate.ts`** (nuevo) — `validateJudgmentImageVerbatim(text, cast, mode)`:
  - Solo corre en `mode === "ritual"` (directo/profundizar no tienen headings de Juicio/Imagen).
  - Extrae la cita por traductor: en modo single-translator, el primer blockquote de la sección;
    en `master_combined`, el bloque etiquetado (`**Wilhelm:**`/`**Legge:**`/`**Zhou Yi:**`) que el
    prompt ya exige (`interpretation.ts:383-389`).
  - Compara contra `cast.textsForClaude.{primary,legge,zhouyi}{Judgment,Image}` con
    `normalizeForVerbatimCompare` (NFC, comillas tipográficas → rectas, guiones → guion simple,
    colapso de espacios) — absorbe ruido tipográfico puro (el caso Wilhelm/apóstrofe del §10) pero
    **no** un drop de contenido real (paréntesis editorial Legge, frases completas) — verificado
    con tests dedicados para ambos casos.
  - Alcance v1 deliberadamente acotado a Juicio/Imagen **primario** (no transformado): en modo
    single-translator `transformedImage` ni siquiera se le pide al modelo
    (`interpretation.ts:368-369`), y el bloque "El trazado"/"turning pattern" no tiene todavía un
    listado de headings localizados propio — queda fuera de v1, no es un olvido.
  - Mismo patrón de cobertura de idiomas que H3 hoy (ES/EN explícitos + 4 más; fallback a texto
    completo si no reconoce el heading, igual que `extractLinesSectionBody`) — limitación
    heredada, no nueva.
  - `ValidationFailure.gate` extendido con `"H7"`; wireado dentro de `validateInterpretationOutput`
    (`interpretation-output-validator.ts`) como `warnFailures`, nunca `blockingFailures`.
- **Telemetría** — `apply-interpretation-gates.ts` → `logValidationWarnings` emite
  `Sentry.captureMessage("[iching] judgment_image_verbatim_drift", { tags: { translator, field } })`
  por cada warning H7. Esto es lo que reemplaza la necesidad de más smokes manuales: cada consulta
  real en producción que dispare H7 queda registrada sola, con volumen y patrón reales.
- **Exportado** desde `backend/claude/src/index.ts` (`validateJudgmentImageVerbatim`,
  `normalizeForVerbatimCompare`).

### 11.2 — Opción 3 de §8 (columna en `reading-quality-qa.mjs`)

`scripts/reading-quality-qa.mjs` ya llamaba `validateInterpretationOutput` (que ahora corre H7
internamente); se agregó la columna explícita `judgmentImageVerbatimFailures` por fila +
`judgmentImageVerbatimFailRows` en el resumen + columna `H7` en la tabla Markdown. No agrega
llamadas a la API — solo expone una señal que el harness ya tenía disponible.

`scripts/master-synthesis-qa.mjs` (el harness nuevo de la sesión, §10) se refactorizó para
**eliminar su lógica duplicada** de extracción/comparación (`extractSection`/
`extractLabeledBlockquote`/`checkVerbatimFidelity` ad-hoc) e importar
`validateJudgmentImageVerbatim` desde `backend/claude/dist/index.js` — fuente única, mismo
principio aplicado al resto de esta sesión (trigramas/pinyin en `packages/iching-data`).

### 11.3 — Opción 2 de §8 (reintento) — diferida, no descartada

No implementada en esta sesión. Razón (decisión explícita del propietario): el patrón de H1/H3/H5
reintenta hasta 2 veces (`apply-interpretation-gates.ts:138`) y si los 2 fallan lanza
`InterpretationQualityError` — la consulta completa falla para el usuario. Sin datos de producción
sobre qué fracción de los mismatches H7 son ruido tipográfico (que probablemente persistiría tras
reintentar, agotando los 2 intentos) vs. drops de contenido reales (donde el reintento sí
ayudaría), activar reintento ahora es apostar a ciegas con costo real (doble llamada a Anthropic
por cada warning) y riesgo real (fallar consultas válidas). Revisitar cuando Sentry tenga volumen
suficiente de `judgment_image_verbatim_drift` para caracterizar el patrón.

### 11.4 — Verificación (sin gastar tokens nuevos)

- `vitest run` en `backend/claude`: **62/62 PASS** (49 existentes + 13 nuevos en
  `interpretation-judgment-image-gate.test.ts`), sin regresión.
- `tsc` (build) en `backend/claude`: limpio.
- **Replay offline del hallazgo original de este documento** (§3.3, hex 29 Legge): se alimentó el
  texto ya guardado en `reports/reading-quality-qa-2026-06-24T03-15-06.json` a través del nuevo
  `validateInterpretationOutput` → el Gate H7 reprodujo **exactamente** el mismo mismatch
  (`judgment`, "Khan, here repeated... mind is[.] penetrating") sin ninguna llamada nueva a la API.
- **Replay offline del hallazgo de §10** (hex 2 Wilhelm, apóstrofe): correctamente **no** se
  reporta como warning — confirma que la normalización tipográfica funciona como se diseñó (ruido
  cosmético absorbido, no escondido del registro porque nunca hubo drop de contenido real).
- Tests dedicados confirman que un drop de contenido real (paréntesis editorial Legge eliminado)
  **sí** se reporta — la normalización no enmascara el caso que realmente importa.

### 11.5 — Pendiente (fuera de alcance de esta sesión)

- Headings localizados para "El trazado"/"turning pattern" (transformado) — H7 no lo cubre todavía.
- Decisión editorial separada (ya señalada en §7): si el punto `is.` de Legge hex 29 es fidelidad
  obligatoria del SBE o candidato a normalización en el bundle — no se mezcla con este gate.
- Revisar volumen/patrón de `judgment_image_verbatim_drift` en Sentry tras acumular tráfico real
  antes de decidir sobre reintento (§11.3). **Política de negocio (2026-06-22):** reintento H7
  descartado; ver [INTERPRETATION_RETRY_AND_FALLBACK_ECONOMICS_AUDIT_2026-06-22.md](./INTERPRETATION_RETRY_AND_FALLBACK_ECONOMICS_AUDIT_2026-06-22.md) para H2, fallback chain y entrega al usuario.
