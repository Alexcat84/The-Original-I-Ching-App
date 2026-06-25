# Convenciones — documentación del proyecto (`docs/`)

Registro maestro: [`registry.json`](./registry.json) · Índice: [`INDEX.md`](./INDEX.md)

Este árbol agrupa **auditorías**, **runbooks**, **planes**, **workflows**, **setup**, **QA** y **ops**. Los sub-registros especializados siguen siendo canónicos para su dominio.

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

## Redirects legacy

Tras renombrar, el **archivo antiguo** queda como stub `(renamed)` con enlace al canónico. No editar stubs; actualizar solo el path codificado.

---

## Validación

```bash
npm run verify:qa-registry   # auditorías + QA + docs/registry.json
```

---

## Alta de documento

1. Asignar código único en el registro correspondiente.
2. Crear archivo con nombre codificado (o stub si migras legacy).
3. Tras el `# Título`, insertar:  
   `**Código:** \`…\` · **Familia:** … · **Estado:** …`
4. Actualizar índice de la colección y, si aplica, `relatedTests` / `relatedCodes`.
