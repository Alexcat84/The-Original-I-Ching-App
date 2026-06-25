# Convenciones — documentación del proyecto (`docs/`)

Registro maestro: [`registry.json`](./registry.json) · Índice: [`INDEX.md`](./INDEX.md)

**Reglas obligatorias (no negociables):** [`workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md`](./workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md)

---

## Jerarquía

| Ruta | Registro | Índice |
|------|----------|--------|
| `docs/auditorias/` | [`auditorias/registry.json`](./auditorias/registry.json) | [`auditorias/INDEX.md`](./auditorias/INDEX.md) |
| `docs/qa/` | [`qa/registry.json`](./qa/registry.json) | [`qa/INDEX.md`](./qa/INDEX.md) |
| Resto de `docs/` | [`registry.json`](./registry.json) | [`INDEX.md`](./INDEX.md) |

---

## Formato de código (unificado)

```
{YYYYMMDD}-{TIPO}-{FAMILIA}-{NN} {nombre-corto}
```

| TIPO | Uso |
|------|-----|
| `AUD` `PLAN` `FIX` `INC` `GATE` `POL` `EXT` `RPT` | Ver [`auditorias/CONVENTIONS.md`](./auditorias/CONVENTIONS.md) |
| `RUN` | Runbook operativo |
| `WF` | Workflow / guía operativa |
| `SETUP` | Procedimiento de bootstrap |
| `OPS` | Operaciones release (Play Store, etc.) |

**Nombre de archivo canónico:** `{prefijo-código}-{slug}.md`  
Ejemplo: `00000000-RUN-SUP-01-migration-data-integrity.md`

---

## Alta de documento (resumen — detalle en workflow obligatorio)

1. Asignar código único (familia + secuencia).
2. **`registry.json`** — entrada completa.
3. **`INDEX.md`** — fila en la familia (mismo PR, no diferir).
4. Crear archivo canónico; metadata `**Código:**` tras `# Título`.
5. `npm run verify:qa-registry`.

Sin pasos 2–3 el documento **no se considera registrado**.

---

## Redirects legacy

Tras renombrar, el **archivo antiguo** queda como stub `(renamed)` con enlace al canónico. No editar stubs; actualizar solo el path codificado.

---

## Validación

```bash
npm run verify:qa-registry
```

Fallo = bloqueante para merge.
