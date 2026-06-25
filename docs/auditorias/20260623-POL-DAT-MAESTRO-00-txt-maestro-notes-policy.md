# TXT maestro — notas por traductor y fidelidad book-primary
**Código:** `20260623-POL-DAT-MAESTRO-00 txt-maestro-notes-policy` · **Familia:** DAT-MAESTRO · **Estado:** closed


- **Fecha:** 2026-06-23
- **Rama:** `feature/wilhelm-txt-au-maestro-2026-06-23` → `staging`
- **Estado:** **Política cerrada** · Wilhelm + Legge maestros **official** · Zhou Yi **sin notas** · **ingest runtime parcial desde 2026-06-23** (comentario display-only + campo `name` del bundle principal — ver §2 actualizado)

---

## 1. Regla de notas (biblioteca / datasets)

Solo **Wilhelm (W)** y **Legge (L)** llevan capa de **notas o comentario académico** en los datasets TXT parseados:

| Traductor | Dataset maestro | Campos con notas | Fuente primaria |
|-----------|-----------------|------------------|-----------------|
| **Wilhelm** | `tools/datasets/wilhelm/book-one/` + `comments/` | Book-one: comentario Wilhelm por hex (campos `comentario_*`, etc.). Comments: **Ten Wings** (彖/象/文言…) | TXT Princeton editado + gates 100/100 vs libro |
| **Legge** | `tools/datasets/legge/book-one/` + `appendix/` | `footnotes` por hex (book-one) y por sección/symbolism (appendix) | TXT Princeton SBE XVI editado + AU manual + gates 4/4 |
| **Zhou Yi** (周易) | `scripts/iching_zhouyi_translation.mjs` / runtime ctext | **Ninguno** — solo 经 (卦辞, 爻辞, 大象, 用九/六) | ctext.org · dominio público |
| **Zhu Xi** (朱熹) | *Fuera del maestro Zhou Yi* | Capa aparte (*Benyi*, *Yixue Qimeng* — mutación en app) | **No mezclar** con Zhou Yi ni con footnotes W/L |

**Whitespace (render biblioteca):** `compactLeggeTxtWhitespace` — cuerpo máx. `\n\n`; footnotes Legge sin líneas en blanco entre entradas.

---

## 2. Fidelidad 100% book-primary (W + L)

Los maestros W y L están **cerrados contra la fuente primaria** (TXT usuario = export limpio del libro), no contra el bundle runtime EPUB/PDF legacy:

| Suite | Wilhelm | Legge |
|-------|---------|-------|
| Gates automáticos | `npm run verify:wilhelm-all-gates` → **12/12 PASS** | `npm run verify:legge-all-gates` → **4/4 PASS** |
| AU manual (Sheets) | Book-one + comments **APROBADA** | Book-one + appendix sections + symbolism **APROBADA** |
| Manifest | `book-one` + `comments` → **`official`**, `runtimeIngest: true` | `book-one` + `appendix` → **`official`**, `runtimeIngest: true` |
| Runtime `packages/iching-data` — comentario | `hexagrams.wilhelm.commentary.json` (display-only, Biblioteca) | `hexagrams.legge.commentary.json` (display-only, Biblioteca) |
| Runtime `packages/iching-data` — oráculo | `hexagrams.wilhelm.json`: EPUB-primary (judgment/image/lines/yong) + book-one TXT-maestro solo para `name` | `hexagrams.legge.json`: ídem, `name` ← `chinese_roman` |

Variantes homónimas, trigramas FIRE/FLAME, IDs `appendix-I-i`, etc. = **book-primary** (no normalizar).

> **Actualización (2026-06-23, sesión posterior):** "sin ingest runtime" dejó de
> ser cierto el mismo día — primero por la capa de comentario
> (`20260623-PLAN-LIB-01-library-commentary-layer.md`), luego por el fix del campo `name`
> (`20260623-FIX-LIB-02-library-title-fidelity.md`, que detectó 167
> instancias rotas nunca auditadas contra fuente primaria). El oráculo
> (judgment/image/lines/yong) sigue siendo EPUB-primary, no este maestro.

---

## 3. Documentos de cierre

| Traductor | Auditoría |
|-----------|-----------|
| Wilhelm | [20260623-AUD-DAT-MAESTRO-W-01-wilhelm-txt-maestro.md](./20260623-AUD-DAT-MAESTRO-W-01-wilhelm-txt-maestro.md) |
| Legge | [20260623-AUD-DAT-MAESTRO-L-01-legge-txt-maestro.md](./20260623-AUD-DAT-MAESTRO-L-01-legge-txt-maestro.md) |

---

## 4. Próximo bloque (fuera de alcance)

- Zhou Yi maestro adicional: **no requerido** para notas (ctext ya cubre 经).
- TXT *Original Meaning* (Zhu Xi / Adler): **no** alimentar dataset Zhou Yi.
- ~~Ingest runtime W/L → solo con gate de producto explícito.~~ **Ejecutado** dos veces con gate explícito: comentario (`20260623-PLAN-LIB-01-library-commentary-layer.md`) y campo `name` (`20260623-FIX-LIB-02-library-title-fidelity.md`). El oráculo (judgment/image/lines/yong) sigue **fuera** — eso seguiría requiriendo gate de producto explícito si se decide migrar.
