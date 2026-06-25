# Biblioteca — fidelidad del campo `name` (título) + 3 hallazgos visuales

**Código:** `20260623-FIX-LIB-02 library-title-fidelity` · **Familia:** LIB · **Estado:** closed

- **Fecha:** 2026-06-23
- **Estado:** ✅ **Cerrado** · fix aplicado y verificado en `staging` (pendiente merge a `main`)
- **Relacionado:** `20260621-AUD-DAT-FID-01-translator-fidelity-reaudit.md` (excluyó explícitamente el campo `name` de su alcance), `20260623-PLAN-DAT-RT-01-epub-primary-migration.md` (cubrió judgment/image/lines, no `name`), `20260623-AUD-DAT-MAESTRO-W-01-wilhelm-txt-maestro.md` / `20260623-AUD-DAT-MAESTRO-L-01-legge-txt-maestro.md` (fuente del fix), `20260623-PLAN-LIB-01-library-commentary-layer.md` (ver nota de seguimiento ahí)

---

## 1. Origen

El propietario reportó, con capturas de la Biblioteca (hexagrama 1, tabs Wilhelm/
Legge), 3 hallazgos:

1. Nombre desactualizado ("Initiating" en vez del título correcto) en header,
   grid y breadcrumb.
2. Orden de la cita "Fuente": debía ir **después** de los toggles "Acerca de este
   hexagrama"/"Words on the Text" (Wilhelm) y de las notas eruditas (Legge), pero
   siempre antes de "Mutaciones".
3. Nota editorial corta de Legge (`thwanIntro`/`linesIntro`, ej. *"(Explanation of
   the entire figure by king Wǎn.)"*) renderizada **fuera de cualquier caja**,
   visualmente desordenada.

Los trigramas (glifo chino + pinyin) resultaron **no ser un bug** — diseño
intencional documentado en `apps/web/src/lib/library/trigram-meta.ts` (la
Biblioteca nunca traduce los 8 trigramas a los 11 locales).

---

## 2. Hallazgo 1 — `name` es la corrupción real

### 2.1 Root cause
`scripts/build-hexagrams.mjs` sourceaba `name` de Wilhelm desde
`iching_wilhelm_translation.mjs` (`w.english`) y de Legge desde
`iching_legge_translation.mjs` (`l.name`) — ninguno de los dos pasó por la
migración EPUB-primary (que solo cubrió judgment/image/lines) ni por la auditoría
de fidelidad 2026-06-21, que **excluyó explícitamente** "nombres modernos de hex"
de su alcance (`20260621-AUD-DAT-FID-01-translator-fidelity-reaudit.md`, línea 94).
Es decir: el campo nunca fue verificado contra una fuente primaria.

El mismo campo se inyecta en el prompt de IA
(`backend/claude/src/interpretation.ts`, `PRIMARY HEXAGRAM: #${p.number} — ${p.name} (...)`),
así que el bug no era solo cosmético de Biblioteca.

### 2.2 Auditoría literal 1:1 (antes de tocar nada)

A petición del propietario, se construyó `scripts/audit-bundle-vs-maestro.mjs`:
compara **cada campo relevante** del bundle de producción
(`hexagrams.{wilhelm,legge}.json`) contra los datasets TXT-maestro AU-verificados
(`tools/datasets/{wilhelm,legge}/book-one/*-64hex-parsed.json`), con igualdad
**estricta** (`.trim()` únicamente, sin normalizar comillas/Unicode — mismo
criterio que `verbatimTextsEqual` en `scripts/lib/runtime-dataset-fields.mjs`).

Resultado inicial (antes del fix): **1412 checks, 218 fails**.

| Categoría | Fails | Naturaleza |
|---|---|---|
| `name` (Wilhelm 62/64, Legge 40/64 + 63/64 vs columna `bookTitle` cruda) | 167 | **Corrupción real** — el campo nunca fue correcto |
| `chineseName` (hex 33, ambos traductores) | 2 | Override intencional de fuente tipográfica (`CHINESE_NAME_OVERRIDES`), no bug |
| judgment/image/líneas — comillas curvas vs rectas | 48 | Cosmético — mismo contenido, solo estilo tipográfico |
| judgment/image/líneas — contenido real | 3 | Ver §2.3 |

**Conclusión:** la "profundidad del problema" que el propietario detectó en su
revisión visual era real y estaba concentrada en `name` (167 instancias), **no**
en judgment/image/líneas (ya correctos, salvo 1 gap real — ver abajo). Reemplazar
el 100% del dataset habría sido innecesario y regresivo (ver §2.3).

### 2.3 Los 3 fails de contenido real

| Hex | Traductor | Campo | Actual (antes del fix) | Maestro | Veredicto |
|---|---|---|---|---|---|
| 1 | Wilhelm | `yongJiu` | falta `"Good fortune."` final | la incluye | **Maestro correcto → fix aplicado** |
| 19 | Wilhelm | `judgment` | `"APPROACH"` | `"APPPROACH"` (typo OCR) | **Actual correcto, maestro NO se adopta** (typo ya documentado en `20260623-PLAN-DAT-RT-01-epub-primary-migration.md`) |
| 47 | Wilhelm | `judgment` | `"OPPRESSION"` | `"OPPPRESSION"` (typo OCR) | **Actual correcto, maestro NO se adopta** (idéntico patrón) |

### 2.4 Fix aplicado

`scripts/build-hexagrams.mjs`:
- `name` de Wilhelm ← `wilhelmMaestro[n].fields.nombre` (book-one), con fallback a
  `base.englishName` si viniera vacío.
- `name` de Legge ← `leggeMaestro[n].fields.chinese_roman` (Title Case **con**
  diacríticos, ej. "Khwăn" en vez de "Khwan"), con fallback a `l.name` y luego a
  `base.englishName`.
- `yongJiu` del hex 1 (Wilhelm) ← `wilhelmMaestro["1"].fields.yong_oraculo`
  primero (incluye "Good fortune."), con el mismo fallback de antes.
- Zhou Yi: **sin cambios** (confirmado — el bundle regenerado solo difiere en
  `generatedAt`, datos idénticos byte a byte).

### 2.5 Verificación posterior

Re-corrida la misma auditoría 1:1 tras el fix:

| Campo | Antes | Después |
|---|---|---|
| `wilhelm.name` | 2/64 PASS | **64/64 PASS** |
| `legge.name` | 24/64 PASS | **64/64 PASS** |
| `wilhelm.yongJiu` | 0/1 PASS | **1/1 PASS** |
| Total fails | 218 | **115** (103 son ruido esperado: 63 de una columna de comparación que no se usa en producción + 2 de `chineseName` intencional + 48 cosméticos de comillas) |
| Fails de contenido real restantes | 3 | **2** (hex 19 y 47 — confirmados intencionales, ver §2.3) |

Tests: `packages/iching-data` → **25/25 PASS** (`commentary.test.ts` +
`index.test.ts`, sin tocar `schema.ts`). Reporte completo:
`reports/bundle-vs-maestro-audit-latest.{md,json}`.

---

## 3. Hallazgo 2 — orden de "Fuente"

`apps/web/src/components/library/HexagramTabs.tsx` (`TabPanel`): el bloque
`<p className="library-source">` se movió de su posición original (entre la
sección de Líneas y los toggles de comentario) al **final** del panel — después
de "Acerca de este hexagrama", "Words on the Text" (Wilhelm, solo hex 1-2) y
las notas eruditas de Legge. "Mutaciones" vive en el componente padre (fuera de
`TabPanel`), así que queda automáticamente después sin tocarlo.

Orden final confirmado: Juicio → Imagen → Líneas → Acerca de (W) → Words on the
Text (W, hex 1-2) → Notas eruditas (L) → **Fuente** → *(Mutaciones, fuera del
componente)*.

---

## 4. Hallazgo 3 — nota editorial suelta de Legge

Causa: `.library-editorial-note` (CSS) es un párrafo plano sin caja, mientras que
el Juicio/Imagen ya usan `.library-text-card` (caja con borde). El `thwanIntro`
se renderizaba como hermano suelto antes del `<h3>`, fuera de cualquier
contenedor visual.

Fix:
- `thwanIntro` ahora vive **dentro** de `.library-text-card`, como primer
  párrafo antes de las estrofas del Juicio.
- `linesIntro` (sección Líneas, sin caja propia hasta ahora) recibió su propia
  `.library-text-card` justo antes de la tabla de líneas.

Sin CSS nueva — se reutiliza `.library-text-card` ya existente.

---

## 5. Verificación de UI

- `npx tsc --noEmit -p apps/web/tsconfig.json` → **0 errores**.
- No existen tests de componente para `HexagramTabs.tsx` (tampoco existían antes
  del fix).
- **Pendiente manual:** abrir hex 1 en Wilhelm y Legge en el navegador antes de
  mergear a `main`, para confirmar visualmente el nuevo orden y las cajas.

---

## 6. Pendiente / fuera de alcance

- `scripts/audit-bundle-vs-maestro.mjs` queda como script reutilizable (no
  enganchado a `npm run verify:*` todavía) — candidato a gate permanente si se
  vuelve a tocar el dataset book-one.
- Los 48 fails cosméticos de comillas (curvas vs rectas) **no se tocan** — el
  bundle actual (EPUB) tiene mejor tipografía que el TXT maestro (OCR-derivado);
  adoptar el maestro sería una regresión tipográfica.
- Hallazgo 2 de `20260623-AUD-RDG-QA-01-judgment-regression.md`
  ("plenitud duplicada" en el prompt de IA) sigue diferido — no relacionado con
  este fix, decisión explícita del propietario de retomarlo en otra sesión.
