# Auditoría — Test de calidad de lectura (W + L, 64 hexagramas sin mutación) y regresión del campo `judgment`

**Código:** `20260623-AUD-RDG-QA-01 judgment-regression` · **Familia:** RDG-QA · **Estado:** mitigated

- **Fecha:** 2026-06-23
- **Estado:** 🟡 **Hallazgo 1 resuelto** vía migración EPUB-primary (`20260623-PLAN-DAT-RT-01-epub-primary-migration.md`, gates 514/514 ambos traductores) · **Hallazgo 2 diferido** — decisión explícita del propietario de retomarlo en otra sesión, sin fecha fijada
- **Modelo evaluado:** `claude-sonnet-4-6` (estándar de producción) · tier master · idioma `es`
- **Alcance:** Wilhelm + Legge (Zhou Yi excluido: no fue tocado por el sync PDF y no tenemos forma de validarlo book-primary). Solo regla `NO_CHANGING` (cero líneas cambiantes). Las líneas cambiantes ya se cubrieron en `PROMPT_MUTATION_RULES_AUDIT` / `qa:mutation-output`.
- **Artefactos:**
  - `reports/reading-quality-qa-2026-06-23T01-03-30.json`
  - `reports/reading-quality-qa-2026-06-23T01-03-30.md`
  - `reports/reading-quality-qa-2026-06-23T01-03-30-transcripts.md`
  - Harness: `scripts/reading-quality-qa.mjs`
  - Escáner de evidencia: `scripts/_tmp-scan-judgments.mjs`

---

## 1. Resumen ejecutivo

Se generaron **128 lecturas reales** (64 hexagramas × 2 traductores) con cero mutación, una pregunta distinta por hexagrama distribuida en 9 categorías, enviadas en orden 1→64 por el pipeline idéntico a producción. El objetivo: evaluar a profundidad cómo se renderiza cada lectura y si el texto es correcto.

El test destapó **dos problemas, ninguno atribuible al oráculo/algoritmo ni al modelo de IA en sí**:

1. **Regresión de datos en producción (alta prioridad).** El sync "book-primary PDF" (commits `6f19218`, `46aa80a`, `3802fae`) degradó el campo `judgment` (y algunas `image`) de ambos bundles. El parser del scan OCR toma la región equivocada o trunca el texto. El bundle **pre-sync era limpio**.
2. **Defecto de generación del prompt (prioridad media).** La sección `## El hexagrama en su plenitud` se duplica en ~31 lecturas y a veces filtra meta-notas internas al texto visible del usuario.

**Los validadores de producción (H1/H3/H5) dieron 128/128 PASS** y los gates de fidelidad siguen verdes (Wilhelm 513/513, Legge 514/514). Ambos son **ciegos** a este defecto por construcción (ver §4).

| Tramo | CLEAN | MINOR | DEFECT |
|---|---|---|---|
| Hex 1–16 | 16 | 8 | 8 |
| Hex 17–32 | 12 | 13 | 7 |
| Hex 33–48 | 15 | 6 | 11 |
| Hex 49–64 | 14 | 7 | 11 |
| **Total** | **57** | **34** | **37** |

---

## 2. Método

- Mapeo determinista de los 64 hexagramas a valores de línea jóvenes (7/8) → cero líneas cambiantes (biyección verificada: 64/64).
- Por hexagrama y traductor: `performCastFromLineValues` → `buildAnthropicUserPayloadForCast(cast, "master", "es", "ritual")` → API Anthropic → `validateInterpretationOutput`.
- Pregunta `i` idéntica para W y L con el mismo hexagrama `i` (única variable: traductor). Trazabilidad de modelo registrada por respuesta.
- Análisis profundo lectura por lectura (rúbrica: fidelidad gold, corrección NO_CHANGING, estructura, idioma, em-dash, alucinación, relevancia, calidad), más verificación directa contra el bundle y contra el estado pre-sync vía `git show`.

---

## 3. Hallazgo 1 — Regresión de datos en `judgment` / `image`

### 3.1 Naturaleza
El campo `judgment` del bundle dejó de contener el juicio (Thwan / Juicio) limpio:

- **Legge (el más grave, ≈22/64 juicios + 7 imágenes):** el parser detecta mal el límite de la región y entrega **comentario editorial, notas del traductor o texto de líneas / del hexagrama vecino** en vez del juicio. Patrón aproximado de desplazamiento de región (35 toma comentario que arranca en línea 4, 47/48 texto desplazado del vecino).
- **Wilhelm (≈42/64 juicios):** el contenido del juicio es correcto pero el parser **anexó el comienzo del comentario y lo cortó a media palabra / media frase**.

### 3.2 Evidencia verbatim (bundle actual de producción)
| Campo | Contenido actual (roto) |
|---|---|
| Wilhelm #5 judgment | `"…cross the great water. Waiting is not mere empty hoping. It has the inner cer-"` |
| Wilhelm #14 judgment | `"…determined by fate and ac-"` (+ "The two trigrams indicate…") |
| Wilhelm #23 / #36 / #46 / #58 / #63 | cortes a media palabra: `for-`, `un-`, `ob-`, `degen-`, `ac-` |
| Legge #13 judgment | `"hich fact suggests… does not carry his purpose into effect."` (comentario, arranca a media palabra) |
| Legge #14 judgment | `"and there is no error… 2. In the second line… 3. The third line… 4."` (textos de línea) |
| Legge #22 judgment | comentario "yellow metal" perteneciente al hex 21 |
| Legge #35 judgment | `"and moreover there is no proper correlate in 4. Hence comes the evil auspice…"` |

### 3.3 Prueba de que es dato, no modelo
- Se dumpeó el payload exacto enviado a Claude: el modelo **reproduce fielmente** el texto corrupto que recibe en `JUDGMENT:` / `THE IMAGE:`. No alucina; renderiza lo que el bundle le entrega.
- Comparación contra el bundle **pre-sync** (`git show 6f19218~1` / `46aa80a~1`), que era limpio:

| | Antes del sync (limpio) | Producción actual (roto) |
|---|---|---|
| Wilhelm #5 | `"WAITING. If you are sincere… It furthers one to cross the great water."` | `"…cross the great water. Waiting is not mere empty hoping. It has the inner cer-"` |
| Legge #13 | `"Thung Zăn (or 'Union of men')… firm correctness of the superior man."` | `"hich fact suggests… into effect."` |

**Conclusión:** la regresión la introdujo el sync PDF book-primary. Los bundles previos (base EPUB/Parma) tenían juicios correctos.

### 3.4 Scope cuantificado (escáner de señales fiables)
- Wilhelm: **42/64** juicios marcados (truncación a media palabra / fin sin puntuación terminal = comentario anexado y cortado).
- Legge: **22/64** juicios + **7/64** imágenes marcados (arranque en minúscula/media palabra, fuga de texto de líneas, referencias numeradas de línea).

---

## 4. Por qué los gates verdes no lo detectan

- **Gates de fidelidad (`verify:hexagram-fidelity:pdf-*`):** comparan el bundle contra **un reparse del mismo PDF con el mismo parser**. Ambos lados arrastran la misma corrupción → "match" → 513/513 y 514/514. El gate prueba que el sync es *determinista y fiel al parser*, **no** que el juicio parseado sea el Thwan correcto y bien formado. La métrica "100% fidelidad" midió lo equivocado para `judgment`/`image`.
- **Validadores de interpretación (H1/H3/H5):** validan citación de líneas y ausencia de fabricación de líneas omitidas; no validan que el juicio citado sea el juicio real ni que esté completo. De ahí 128/128 PASS pese al defecto.

Recomendación de gate (no aplicada): añadir un check que rechace `judgment`/`image` que (a) terminen a media palabra/sin puntuación terminal, (b) arranquen en minúscula, (c) contengan enumeración de líneas. Validación semántica mínima además de "bundle == parse".

---

## 5. Hallazgo 2 — Duplicación de sección (prompt/modelo)

- `## El hexagrama en su plenitud` aparece **duplicada en ~31 lecturas** (ambos traductores).
- En varias se **filtra una meta-nota interna al texto visible del usuario**: `"(Esta sección se integra…)"`, `"Esta sección ya fue tratada arriba"`, `"*(Continúa en Horizonte y síntesis.)*"`.
- Error puntual de atributo: hex 1 Wilhelm describe Ch'ien (cielo) como "trueno".

Esto **sí es del prompt/generación**, independiente del bundle, y es visible para el usuario final. Candidato a ajuste del prompt de interpretación (instrucción de sección única + prohibición de meta-notas) — no aplicado.

> **Estado (2026-06-23, sesión posterior):** el propietario revisó este hallazgo
> junto con el fix de `20260623-FIX-LIB-02-library-title-fidelity.md` y decidió
> explícitamente diferirlo ("lo haremos otro momento") — no forma parte de ese fix.
> Sigue sin fecha de retomada; el plan de remediación (instrucción de sección única
> + prohibición de meta-notas) descrito arriba sigue siendo el candidato.

---

## 6. Lo que funciona (positivos firmes)

- **NO_CHANGING perfecto: 128/128.** Ninguna lectura inventa líneas móviles ni hexagrama transformado; todas declaran correctamente la ausencia de mutación. El comportamiento que este test venía a validar funciona.
- **Em-dash respetado:** sin guiones largos como separador en prosa española (solo dentro de citas gold en inglés).
- **Idioma limpio:** prosa en español consistente (1 caso menor de nombre de trigrama en inglés, hex 15 W).
- **Diferenciación W/L correcta:** sin contaminación cruzada de *wording* entre traductores. Wilhelm es fiel al gold en contenido en los 64 (sus fallos son truncación + duplicación). Legge mantiene romanización arcaica.
- **Relevancia y calidad literaria altas:** las lecturas responden a la pregunta/categoría; no son relleno.

---

## 7. Opciones de remediación (NO EJECUTADAS — pendiente de decisión)

> Decisión del propietario (2026-06-23): se considera **seriamente migrar a EPUB como fuente PRIMARIA**, dado que los PDFs semilla (scan OCR) son complejos y han generado esta regresión.

1. **EPUB-primary (recomendada por el propietario).** El EPUB es texto digital, no OCR: evita el corte a media palabra, la mala detección de región y el ruido de glifos. Implicaría invertir la política actual (PDF book-primary → EPUB-primary) y reconstruir el gate en torno al texto EPUB. Requiere plan dedicado y validación de alcance antes de ejecutar.
2. **Reparar el parser de `judgment`/`image` del scan PDF** (detección de región + anti-truncación) y re-sync, con nuevo gate anti-comentario. Mayor complejidad sostenida.
3. **Fix de prompt** (Hallazgo 2) — independiente y aplicable por separado.

Ninguna se ha aplicado. Pendiente de aprobación de alcance y de un plan de implementación validado.

---

## 8. Reproducción

```bash
# Test de calidad (128 llamadas reales; requiere ANTHROPIC_API_KEY y bundles compilados)
node scripts/reading-quality-qa.mjs

# Smoke (2 llamadas)
node scripts/reading-quality-qa.mjs --limit 1

# Escaneo de corrupción en los bundles (sin API)
node scripts/_tmp-scan-judgments.mjs

# Estado pre-sync (limpio) de un campo
git show 6f19218~1:packages/iching-data/src/generated/hexagrams.wilhelm.json
```
