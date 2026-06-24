# Auditoría — Gap verbatim juicio/imagen en lecturas IA (prompt vs gates vs salida)

- **Fecha:** 2026-06-24
- **Estado:** 🟡 **Abierta** — pendiente verificación manual del propietario (2026-06-25)
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
