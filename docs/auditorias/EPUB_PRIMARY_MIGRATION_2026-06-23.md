# Migración EPUB-primary — inyectores Wilhelm + Legge

- **Fecha:** 2026-06-23
- **Estado:** EJECUTADO (inyectores W y L sincronizados desde EPUB) · 1 duda pendiente de juicio del propietario
- **Motivo:** La auditoría `READING_QUALITY_QA_JUDGMENT_REGRESSION_AUDIT_2026-06-23.md` demostró que extraer la fuente desde el scan PDF (OCR) corrompe `judgment`/`image` (corte a media palabra, mala detección de región). El EPUB es texto digital estructurado, sin esas patologías. Se invierte la política: **PDF book-primary → EPUB-primary** para Wilhelm y Legge.

---

## 1. Plan

1. **Reparar el extractor EPUB de Wilhelm** (`scripts/lib/hexagram-fidelity-wilhelm-epub.mjs`). Bug: `findWilhelmEpubSectionStart` usaba `[\s\S]*?` y anclaba en el primer `<blockquote>` del documento, por lo que `THE IMAGE`/`THE LINES` resolvían a la región de `THE JUDGMENT` (el campo `image` devolvía el juicio; 0/64 imágenes correctas).
2. **Crear sync Wilhelm EPUB-primary** (`tools/sync-wilhelm-oracle-from-epub.mjs`, `npm run sync:wilhelm-oracle-from-epub`). Sobrescribe solo campos de oráculo (judgment, image, lines, yong); preserva metadata estructural (binary, trigramas, pinyin, trad_chinese, english, wilhelm_symbolic, hex_font).
3. **Reusar sync Legge EPUB-primary** (`tools/sync-legge-oracle-from-epub.mjs`, ya existente).
4. **Re-sync + build** ambos bundles (`build:data`).
5. **Gate:** `verify:hexagram-fidelity:epub-wilhelm` + `:epub-legge` (bundle == EPUB) + escaneo de campos mal formados (anti-truncación, anti-minúscula, anti-fuga de líneas).
6. **Metadata veraz** (`licenseNote`/edition/sourceUrl) → EPUB-primary.
7. **Promover** a staging/main (arregla el fallo de CI de `iching-engine`).

---

## 2. Resultado

### Fidelidad bundle == EPUB
| Traductor | Gate EPUB | Reporte |
|---|---|---|
| Wilhelm | **514/514 (100%)** | `hexagram-fidelity-2026-06-23T02-10-31-945Z` |
| Legge | **514/514 (100%)** | `hexagram-fidelity-2026-06-23T02-10-32-509Z` |

Verificación inyector == EPUB (post-normalización): **0/512 discrepancias** en ambos.

### QA de campos mal formados (sobre datos EPUB)
- **Wilhelm: 0 banderas.** El bug de `image` quedó resuelto (ej. hex 1 ahora trae el 大象 `"The movement of heaven is full of power…"`, no el juicio).
- **Legge: 1 bandera** → ver §3.

### Anclajes de regresión (tests `iching-engine`) — todos verdes
- Legge hex 51 L4 = `"The fourth line, undivided, shows its subject, amid the startling movements, supinely sinking (deeper) in the mud."` (redacción EPUB "line", no "NINE").
- Wilhelm hex 51 L4 = `"Shock is mired."`; 用九 contiene "dragons"; 用六 contiene "perseverance".
- Legge 用九/用六 contienen "The lines of this hexagram".
- `iching-engine`: **113/113**. `iching-data`: **14/14**.

---

## 2.bis Segundo hallazgo (captura del libro del propietario) — Gran Símbolo truncado en Wilhelm

El propietario aportó capturas del libro Wilhelm/Baynes del hex 41. El contraste 1:1 reveló que el campo `image` (大象) **perdía versos** que el gate "bundle == EPUB" no podía detectar (circular: ambos lados pasaban por el mismo parser).

**Dos causas en cadena:**

1. **Filtro de blockquote demasiado amplio** (`blockquoteTextsFromDiv`). `/^THE (JUDGMEN|IMAGE|LINES)\b/i` descartaba no solo el encabezado de sección, sino también el verso de oráculo **"The image of <NOMBRE>."** (un `<blockquote>` propio en el EPUB). → ~51 hexagramas perdían esa línea. Fix: match del **título exacto** `/^THE (JUDGMENT|JUDGEMENT|IMAGE|LINES)\.?$/i`.
2. **Heurística OCR aplicada a texto EPUB limpio** (`wilhelmImageOracleOnly`). Su lista `WILHELM_ORACLE_COMMENTARY_START` (diseñada para cortar comentario en el pipeline PDF) incluye `He furthers and regulates`, truncando p. ej. el 大象 de hex 11 (`"…He furthers and regulates the gifts of heaven and earth, / And so aids the people."`). En el EPUB los blockquotes ya son solo oráculo (el comentario vive en `<p class="calibre21">`, que no se lee), así que la heurística sobra. Fix: el parser EPUB **no** llama a `wilhelmImageOracleOnly`; usa los blockquotes tal cual.

**Verificación contra las capturas (hex 41):** juicio (7 líneas), imagen (4 líneas, incl. "The image of DECREASE."), y las 6 líneas coinciden 1:1.

**Tras el fix:**
- Solo hex 1, 2 y 25 quedan sin línea "image of" — formatos especiales genuinos de Wilhelm/Baynes (verificado).
- QA anti-malformado Wilhelm: **0 banderas** (sin truncación, sin minúscula inicial, sin verso final sin puntuación, sin fuga de comentario >80 ch).
- Gate `epub-wilhelm`: **514/514**. `iching-engine` 113/113, `iching-data` 14/14.
- Reporte: `hexagram-fidelity-2026-06-23T02-36-34-538Z`.

> Lección: el gate "bundle == parse" es **circular** y no detecta defectos de extracción. La validación definitiva fue el contraste con el libro físico (juez propietario). Refuerza el pendiente §5 (gate semántico).

---

## 3. Adjudicación del propietario (captura del libro) — RESUELTO

**Legge hex 41, línea 2.** El EPUB termina sin puntuación terminal:

> "The second line, undivided, shows that it will be advantageous for its subject to maintain a firm correctness, and that action on his part will be evil. He can give increase (to his correlate) **without taking from himself**"

**Veredicto del propietario (captura SBE XVI, 2026-06-23):** el libro físico **cierra sin punto** — el texto salta directo a "3. The third line…". El EPUB es **fiel a la fuente**; no es un defecto. **No se modifica.**

### Spot-checks contra el libro físico (Wilhelm/Baynes)
| Hex | Campos verificados 1:1 | Resultado |
|---|---|---|
| 41 (DECREASE) | juicio, imagen (4 líneas), 6 líneas | ✓ tras fix §2.bis |
| 43 (BREAK-THROUGH) | juicio (6 líneas), imagen (5 líneas, incl. "The image of BREAK-THROUGH." + cierre "Dispenses riches downward / And refrains from resting on his virtue."), 6 líneas | ✓ idéntico |

---

## 4. Notas de notación (Legge)

El EPUB usa `"The Nth line, divided/undivided"` (texto de Legge SBE XVI). El sacred-texts web usaba `"The Nth SIX/NINE, divided/undivided"`. Se adopta la redacción del EPUB (más fiel al libro de Legge); el test de regresión ya la fijaba como gold.

---

## 5. Pendientes (no ejecutados)

- Promover el escaneo anti-malformado a gate permanente (`verify:*`), según recomendación de la auditoría de regresión §4 (validación semántica además de "bundle == parse").
- Aplicar el fix de prompt (Hallazgo 2 de la auditoría de regresión: sección "plenitud" duplicada + fuga de meta-notas) — independiente de datos.
- Actualizar claims de fidelidad en docs de producto/UI (notes, FAQ, README) de "book-primary PDF" a "EPUB-primary".
