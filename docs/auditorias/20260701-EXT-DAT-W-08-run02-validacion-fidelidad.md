# Validación W-08 — Run 02 (post-remediación ronda 2)
**Código:** `20260701-EXT-DAT-W-08-RUN-02` · **Familia:** DAT-W · **Estado:** errores-aplicados

**Ejecutado por:** Claude Sonnet 5 (auditor externo bilingüe DE/EN)
**Fecha:** 1–2 jul 2026
**Script:** `scripts/validate-wilhelm-de-fidelity.py`
**Commit dataset al momento del run:** `1e9ea602` (round 2 + fix Hingebung)
**Correcciones derivadas aplicadas en:** `be47dede` (run02/run03, 6 fixes)

---

## Resultados por lote

### Lote 1–8
Todos perfectos.

### Lote 9–16
**ERROR: La API devolvió una respuesta vacía.**
*(Timeout/límite de tokens. Re-ejecutado en Run 03 con lote exclusivo.)*

### Lote 17–24

❌ **[Hexagrama 21]** `judgment.tenWings` — superíndice huérfano `¹` al final de "...worauf die Blitzlinie erscheint¹." sin nota al pie correspondiente.
❌ **[Hexagrama 24]** `judgment.tenWings` — garbage al inicio: `""\n"Wiederkehr hat Gelingen.'` (comillas duplicadas + cierre con `'` en vez de `"`); guiones sueltos `―\n-\n-\n` antes de "Fördernd ist es, zu haben".

### Lote 25–32
Todos perfectos.

### Lote 33–40
Todos perfectos.

### Lote 41–48
Todos perfectos.

### Lote 49–56
Todos perfectos.

### Lote 57–64
Todos perfectos.

---

## Acción tomada

- Hex 21 `judgment.tenWings`: eliminado superíndice `¹`.
- Hex 24 `judgment.tenWings`: corregido inicio garbled + eliminados guiones sueltos.
- Lote 9–16: re-ejecutado en Run 03 (ver doc adjunto).

Aplicados en commit `be47dede`.
