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

## 3. Duda pendiente de juicio del propietario (captura del libro)

**Legge hex 41, línea 2.** El EPUB termina sin puntuación terminal:

> "The second line, undivided, shows that it will be advantageous for its subject to maintain a firm correctness, and that action on his part will be evil. He can give increase (to his correlate) **without taking from himself**"

Esto es **idéntico en el EPUB y en el sacred-texts previo** (no es un defecto introducido por el EPUB). Probable falta del punto final. Pendiente de confirmar contra el libro físico si debe cerrar con `"…from himself."` o si continúa.

---

## 4. Notas de notación (Legge)

El EPUB usa `"The Nth line, divided/undivided"` (texto de Legge SBE XVI). El sacred-texts web usaba `"The Nth SIX/NINE, divided/undivided"`. Se adopta la redacción del EPUB (más fiel al libro de Legge); el test de regresión ya la fijaba como gold.

---

## 5. Pendientes (no ejecutados)

- Promover el escaneo anti-malformado a gate permanente (`verify:*`), según recomendación de la auditoría de regresión §4 (validación semántica además de "bundle == parse").
- Aplicar el fix de prompt (Hallazgo 2 de la auditoría de regresión: sección "plenitud" duplicada + fuga de meta-notas) — independiente de datos.
- Actualizar claims de fidelidad en docs de producto/UI (notes, FAQ, README) de "book-primary PDF" a "EPUB-primary".
