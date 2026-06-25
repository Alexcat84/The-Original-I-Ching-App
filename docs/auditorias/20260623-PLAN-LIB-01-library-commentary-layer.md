# Biblioteca — capa de comentario opcional (Wilhelm + Legge)

**Código:** `20260623-PLAN-LIB-01 library-commentary-layer` · **Familia:** LIB · **Estado:** closed

- **Fecha:** 2026-06-23
- **Estado:** **Implementado** · UI ribbon cerrada 2026-06-24 · tests en verde · `HexagramRecord`/motor/IA sin cambios (capa comentario)
- **Relacionado:** `20260623-POL-DAT-MAESTRO-00-txt-maestro-notes-policy.md` (política de notas que habilita este feature), `20260623-AUD-DAT-MAESTRO-W-01-wilhelm-txt-maestro.md`, `20260623-AUD-DAT-MAESTRO-L-01-legge-txt-maestro.md`

---

## 1. Objetivo

Los datasets maestro de Wilhelm y Legge (ver docs relacionados) quedaron 100%
verificados contra fuente primaria y, además del oráculo ya usado en producción,
traen una capa de **comentario académico** que no existía antes (Wilhelm: comentario
propio + Diez Alas; Legge: footnotes + Gran Simbolismo del Appendix II). Este
documento registra cómo se decidió presentar esa capa en la **Biblioteca de
hexagramas** y qué se implementó.

Decisión de alcance (confirmada antes de implementar): **solo Biblioteca**. El
comentario nunca se inyecta en el prompt de IA (costo de tokens; la IA ya funciona
bien con judgment+image+lines) y `HexagramRecord`/`HexagramsBundle`
(`packages/iching-data/src/schema.ts`) no se tocan — el motor de tiradas
(`iching-engine`), el pipeline de imágenes (`image-engine`) y el prompt de Claude
(`backend/claude`) quedan exactamente igual.

Zhou Yi (周易) no cambia: nunca tuvo comentario y la política dice que no lo tendrá
— el tab Zhou Yi de la Biblioteca no recibió ningún `"+"` nuevo.

Verificación previa (antes de implementar): se confirmó que el pipeline de imágenes
(`packages/image-engine/src/prompt.ts`) y el mapeo de trigramas de la Biblioteca
(`apps/web/src/lib/library/trigram-meta.ts`) **no estaban afectados** por la
corrupción original de los datasets — solo usan el número de hexagrama o etiquetas
ya correctas. No requirieron ningún fix.

---

## 2. Diseño de producto

| Punto | Decisión |
|---|---|
| Wilhelm, por punto (Juicio/Imagen/cada Línea) | Un solo `"+"` combinado: revela el comentario propio de Wilhelm (book-one) y, debajo en el mismo panel, la nota de las Diez Alas — dos sub-bloques etiquetados |
| Wilhelm `intro` (ensayo general) | Sección propia colapsable ("Acerca de este hexagrama"), separada de los `"+"` por punto; incluye `ruler_note` y `misc_notes` (siempre presentes) y `sequence` (ausente solo hex 1–2) |
| Wilhelm `wen_yen`/`wen_yen_note` | Toggle propio ("Words on the Text"), visible solo en hex 1–2 |
| Legge `footnotes` | `"+"` general junto al título (mismo slot visual que "Acerca de" de Wilhelm) |
| Legge Gran Simbolismo (Appendix II) | Distribuido: `"+"` en Imagen (su versión del 象) y `"+"` por cada línea (glosa) |
| Legge Juicio (Thwan) | Sin `"+"` — no existe comentario propio de Thwan en estos datasets, asimetría aceptada |
| Legge `thwan_intro`/`lines_intro` | Nota en cursiva siempre visible (no `"+"`) arriba de Juicio/Líneas, solo hex 1 |

---

## 3. Verificación empírica de campos (hecha sobre los JSON, no asumida)

| Campo | Dataset | Vacío en | Conteo verificado |
|---|---|---|---|
| `intro`, `misc_notes`, `ruler_note` | Wilhelm book-one/comments | nunca | 64/64 |
| `sequence` | Wilhelm comments | hex 1–2 | 62/64 no-vacío |
| `wen_yen`/`wen_yen_note` | Wilhelm comments | hex 3–64 | solo hex 1, 2 |
| `L{1-6}_comentario` / `L{1-6}_b_comentario` | Wilhelm book-one/comments | nunca | 384/384 |
| `yong_comentario` / `yong_b_comentario` | Wilhelm book-one/comments | hex 3–64 | solo hex 1, 2 |
| `footnotes` | Legge book-one | nunca | 64/64 |
| `thwan_intro` / `lines_intro` | Legge book-one | todos excepto hex 1 | solo hex 1 |
| `symbolismHex[n].image` | Legge appendix (Appendix II, `roman === "II"`) | nunca | 64/64 |
| `symbolismHex[n].lineNotes[pos]` | Legge appendix | posición 7 (yong) solo hex 1–2 | 6/64, 7 en hex 1–2 |

---

## 4. Qué se implementó

### Datos (`packages/iching-data`)

- `src/commentary-schema.ts` — esquemas Zod nuevos (`WilhelmCommentary`, `LeggeCommentary`
  y tipos auxiliares), completamente separados de `src/schema.ts`.
- `src/commentary.ts` — accessors `getWilhelmCommentaryByNumber`, `getLeggeCommentaryByNumber`
  (+ variantes `getAll*`). **Sin accessor para Zhou Yi** — ausencia deliberada.
- `src/commentary.test.ts` — 11 tests nuevos (cobertura 64/64, edge cases hex 1/2/3/64).
- `scripts/build-hexagram-commentary.mjs` (raíz del repo) — lee
  `tools/datasets/{wilhelm,legge}/{book-one,comments,appendix}/*.json`, normaliza
  `""` → `null` donde corresponde, escribe
  `packages/iching-data/src/generated/hexagrams.{wilhelm,legge}.commentary.json`.
  Busca Appendix II por `roman === "II"`, nunca por índice fijo.
- Enganchado en `packages/iching-data/package.json` → `build:data`.

### UI (`apps/web`)

- `src/components/library/HexagramTabs.tsx` — toggles `"+"` por punto (Wilhelm
  combinado, Legge de única fuente), bloque "Acerca de"/footnotes general, toggle de
  *Wen Yen*, notas siempre visibles de `thwan_intro`/`lines_intro`. Reusa el patrón
  `<details>/<summary>` de `FaqAccordion.tsx`.
- `src/lib/library/library-data.ts` — nuevo campo `LibraryDetail.commentary`
  (`{ wilhelm, legge }`, sin campo `zhouyi`).
- `src/components/library/LibraryContentLoader.tsx` — `DetailPayload` ampliado.
- `src/app/api/library/[number]/route.ts` — **sin cambios de código**: ya devolvía
  `detail` completo, el comentario queda protegido por el mismo gate Seeker+.
- `src/app/globals.css` — clases nuevas `.library-commentary`,
  `.library-commentary-summary`, `.library-commentary-body`,
  `.library-commentary-source`, `.library-about-block`, `.library-editorial-note`,
  `.library-lines-table__commentary` (y ajuste de zebra-striping para no rayar las
  filas de comentario dentro de la tabla de líneas).

### Manifests

Los 4 manifests de `tools/datasets/{wilhelm,legge}/{book-one,comments,appendix}/manifest.json`
se actualizaron de `runtimeIngest: false` a `true`, con nota de a qué archivo
generado y a qué consumidor (solo `library-data.ts`) alimenta cada uno.

---

## 5. Verificación corrida

| Check | Resultado |
|---|---|
| `packages/iching-data` tests (`vitest run`) | **25/25 PASS** (14 existentes sin tocar + 11 nuevos en `commentary.test.ts`) |
| `packages/iching-engine` tests | **113/113 PASS**, sin diff (`git diff --stat` vacío) |
| `git diff --stat` en `packages/image-engine`, `backend/claude` | **vacío** — confirma que `HexagramRecord` no cambió |
| `apps/web` `tsc --noEmit` | **0 errores** |
| `apps/web` `eslint` (archivos tocados) | **0 errores** |
| `npm run i18n:audit` | **passed** |
| Tamaño JSON generados | `hexagrams.wilhelm.commentary.json` ≈ 795 KB, `hexagrams.legge.commentary.json` ≈ 280 KB (≈1.07 MB combinado vs ≈1.85 MB crudo de `tools/datasets`) |
| `npm run build` en `packages/iching-data` | `dist/generated/` incluye los 2 JSON nuevos vía `copy-generated.mjs` sin tocar ese script |

---

## 6. Textos i18n finales (11 claves × 11 locales)

Agregadas a `packages/i18n/src/messages/library-page-ui.ts`. Copia oficial en
inglés y español (las 9 traducciones restantes — pt, fr, de, it, ja, zh, ko, ar, hi
— viven en el mismo archivo, mismo criterio de tono que el resto de esa pantalla):

| Clave | en | es |
|---|---|---|
| `commentaryShowLabel` | Show classical commentary | Ver comentario clásico |
| `wilhelmCommentaryLabel` | Wilhelm's commentary | Comentario de Wilhelm |
| `tenWingsCommentaryLabel` | Ten Wings (Confucian commentary) | Diez Alas (comentario confuciano) |
| `greatSymbolismLabel` | Great Symbolism | Gran Simbolismo |
| `aboutHeading` | About this hexagram | Acerca de este hexagrama |
| `rulerNoteLabel` | The ruling line | La línea regente |
| `miscNotesLabel` | Notes | Notas |
| `sequenceLabel` | Sequence | Secuencia |
| `wenYenHeading` | Words on the Text (Wen Yen) | Palabras sobre el Texto (Wen Yen) |
| `wenYenNoteLabel` | Editorial note | Nota editorial |
| `scholarlyNotesHeading` | Scholarly notes | Notas eruditas |

`thwan_intro`/`lines_intro` de Legge (solo hex 1) se renderizan verbatim desde el
dataset (texto editorial original en inglés arcaico, p. ej. *"(Explanation of the
entire figure by king Wǎn.)"*) — no llevan clave i18n propia, son texto de fuente,
no chrome de UI.

---

## 7. Pendiente / fuera de alcance

- El comentario sigue **sin usarse en el prompt de IA** — decisión de producto
  explícita, no un olvido.
- Los otros 6 apéndices de Legge (I, III–VII) + `backMatter` (ensayos generales de
  teoría del I Ching, no por hexagrama) quedan fuera — podrían convertirse en una
  página de contenido estático separada en el futuro, no forman parte de este
  feature.
- El apéndice de Wilhelm (`tools/datasets/wilhelm/appendix/`) sigue en estado draft,
  fuera de alcance de este feature.

---

## 8. Nota de seguimiento UI (2026-06-24)

La capa de datos y la lógica de producto de este doc siguen válidas. Tras el deploy
inicial (2026-06-23) se detectaron defectos de layout en los toggles `"+"` por punto;
corregidos en la iteración ribbon documentada en
[`20260624-PLAN-LIB-03-library-ribbon-ui-fix.md`](./20260624-PLAN-LIB-03-library-ribbon-ui-fix.md).

---

## 10. Cierre UI Biblioteca (2026-06-24)

La Biblioteca (detalle hexagrama, tabs Wilhelm/Legge) queda **cerrada visualmente**
para la capa de comentario opcional:

- Componente `CommentaryRibbon` + tokens cian del tema (`--accent`).
- Juicio/Imagen: oráculo arriba, cinta debajo; footer `−` solo en textos extensos.
- Líneas y bloques hex (About, Wen Yen, Notas eruditas): toggle `+`/`−` inline en
  la misma fila.
- Promovido a producción: merge `staging` → `main` (`7679281`).

No quedan acciones abiertas de UI para este feature. Ver auditoría ribbon §10.

---

## 9. Nota de seguimiento (2026-06-23, sesión posterior)

La afirmación del §1 ("`HexagramRecord`/`HexagramsBundle` no se tocan") sigue
siendo cierta **para esta capa de comentario** — su `git diff --stat` en
`image-engine`/`backend/claude` se mantiene vacío. Pero en un fix **separado**
ese mismo día se detectó que el campo `name` de `HexagramRecord` (fuera del
alcance de este feature) estaba roto en 167 instancias y nunca había sido
auditado contra fuente primaria. Se corrigió usando **el mismo dataset
book-one** (`tools/datasets/{wilhelm,legge}/book-one/*-64hex-parsed.json`) pero
por una ruta de build distinta: `scripts/build-hexagrams.mjs` (el bundle
runtime principal), no `scripts/build-hexagram-commentary.mjs`. Ver
`20260623-FIX-LIB-02-library-title-fidelity.md`.

Consecuencia práctica: a partir de ahora `tools/datasets/.../book-one` tiene
**dos consumidores** en runtime — el comentario (display-only, este doc) y el
campo `name` (core, incluido el prompt de IA). El comentario sigue sin
inyectarse en el prompt; eso no cambió.
