# Validación W-08 — Run 03 (re-run lote 9–16)
**Código:** `20260702-EXT-DAT-W-08-RUN-03` · **Familia:** DAT-W · **Estado:** errores-aplicados

**Ejecutado por:** Claude Sonnet 5 (auditor externo bilingüe DE/EN)
**Fecha:** 2 jul 2026
**Script:** `scripts/validate-wilhelm-de-fidelity.py` (solo lote 9–16)
**Motivo:** Lote 9–16 devolvió respuesta vacía en Run 02 (timeout API).
**Commit dataset al momento del run:** `1e9ea602`
**Correcciones derivadas aplicadas en:** `be47dede` (run02/run03, 6 fixes)

---

## Resultados

### Lote 9–16

❌ **[Hexagrama 13]** `lines[2].commentary.tenWings` — "verstekken" en vez de "verstecken" (OCR kk→ck).
❌ **[Hexagrama 11]** `about.sequence` — mes asignado "Januar-Februar" en vez de "Februar-März". Baynes EN usa consistentemente "February–March".
❌ **[Hexagrama 12]** `about.sequence` — mes asignado "Juli-August" en vez de "August-September". Baynes EN usa consistentemente "August–September".

Hexagramas 9, 10, 14, 15, 16: correctos. Structure general (judgment, image, líneas 1–6, rulerNote, sequence) completa y coherente en todos.

---

## Acción tomada

- Hex 11 `sequence`: `Januar-Februar` → `Februar-März`.
- Hex 12 `sequence`: `Juli-August` → `August-September`.
- Hex 13 `lines[2].commentary.tenWings`: `verstekken` → `verstecken`.

Aplicados en commit `be47dede`.

---

## Estado W-08 tras run03

Todos los lotes del validador han sido cubiertos. Pendiente: ejecutar run final (lotes 1–64 completos) con el dataset en estado `be47dede` para confirmar cierre.
