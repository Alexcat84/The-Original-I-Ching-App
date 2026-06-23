# TXT maestro — notas por traductor y fidelidad book-primary

- **Fecha:** 2026-06-23
- **Rama:** `feature/wilhelm-txt-au-maestro-2026-06-23` → `staging`
- **Estado:** **Política cerrada** · Wilhelm + Legge maestros **official** · Zhou Yi **sin notas** · **sin ingest runtime**

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
| Manifest | `book-one` + `comments` → **`official`** | `book-one` + `appendix` → **`official`** |
| Runtime `packages/iching-data` | **Sin cambio** (`runtimeIngest: false`) | **Sin cambio** |

Variantes homónimas, trigramas FIRE/FLAME, IDs `appendix-I-i`, etc. = **book-primary** (no normalizar).

---

## 3. Documentos de cierre

| Traductor | Auditoría |
|-----------|-----------|
| Wilhelm | [WILHELM_TXT_AU_MAESTRO_2026-06-23.md](./WILHELM_TXT_AU_MAESTRO_2026-06-23.md) |
| Legge | [LEGGE_TXT_AU_MAESTRO_2026-06-23.md](./LEGGE_TXT_AU_MAESTRO_2026-06-23.md) |

---

## 4. Próximo bloque (fuera de alcance)

- Zhou Yi maestro adicional: **no requerido** para notas (ctext ya cubre 经).
- TXT *Original Meaning* (Zhu Xi / Adler): **no** alimentar dataset Zhou Yi.
- Ingest runtime W/L → solo con gate de producto explícito.
