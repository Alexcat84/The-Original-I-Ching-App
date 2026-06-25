# Registro obligatorio — documentos y tests (NO NEGOCIABLE)

**Código:** `00000000-WF-DOC-02 mandatory-doc-qa-registration` · **Familia:** DOC · **Estado:** reference

**Aplica a:** cualquier agente, contribuidor o PR que cree o renombre documentación en `docs/` o tests/gates en el monorepo.

**Validación bloqueante:** `npm run verify:qa-registry` debe pasar antes de merge.

---

## Regla de oro

> **Sin entrada en `registry.json` + fila en `INDEX.md` + verificación verde, el documento o test no existe para el proyecto.**

No basta con crear el `.md` o el `.test.ts`. No basta con mencionarlo en un chat o auditoría informal.

---

## Mapa: dónde registrar cada cosa

| Qué creas | Registro (`registry.json`) | Índice (`INDEX.md`) | Convenciones |
|-----------|----------------------------|---------------------|--------------|
| Auditoría, incidente, plan, fix, gate en `docs/auditorias/` | [`docs/auditorias/registry.json`](../auditorias/registry.json) | [`docs/auditorias/INDEX.md`](../auditorias/INDEX.md) | [`auditorias/CONVENTIONS.md`](../auditorias/CONVENTIONS.md) |
| Runbook, plan, workflow, setup, ops fuera de auditorías | [`docs/registry.json`](../registry.json) | [`docs/INDEX.md`](../INDEX.md) | [`CONVENTIONS.md`](../CONVENTIONS.md) |
| Vitest, verify, qa, audit script, generador | [`docs/qa/registry.json`](../qa/registry.json) | [`docs/qa/INDEX.md`](../qa/INDEX.md) | [`qa/CONVENTIONS.md`](../qa/CONVENTIONS.md) |

Si un runbook o plan también aparece en auditorías (p. ej. `RUN-SUP-*`), **mantener el mismo código** en ambos registros con el mismo `path` canónico.

---

## Checklist A — Documento nuevo (OBLIGATORIO, en este orden)

### A1. Asignar código (antes de escribir el contenido)

Formato: `{YYYYMMDD}-{TIPO}-{FAMILIA}-{NN} {nombre-corto}`

- Buscar la **familia** en el índice; reutilizar si es continuación del mismo hilo.
- `{NN}` = siguiente secuencia libre en esa familia (no saltar números sin motivo).
- Tipos: ver [`auditorias/CONVENTIONS.md`](../auditorias/CONVENTIONS.md) (`AUD`, `PLAN`, `FIX`, `INC`, `GATE`, `POL`, `BRIEF`, `EXT`, `RPT`, `RUN`, `WF`, `SETUP`, `OPS`).

### A2. Actualizar registro JSON (NO NEGOCIABLE)

Añadir objeto completo en el `registry.json` correspondiente:

```json
{
  "code": "20260625-AUD-IMG-OVR-03 ejemplo-nuevo",
  "title": "Título completo descriptivo",
  "shortName": "ejemplo-nuevo",
  "type": "AUD",
  "family": "IMG-OVR",
  "date": "2026-06-25",
  "status": "open",
  "path": "docs/auditorias/20260625-AUD-IMG-OVR-03-ejemplo-nuevo.md",
  "relatedCodes": ["20260625-AUD-IMG-OVR-02 mutation-title-layout"],
  "relatedTests": ["VF-WEB-OVR-001 overlay-glyphs"]
}
```

Campos obligatorios: `code`, `title`, `shortName`, `type`, `family`, `status`, `path`.  
`date` obligatorio salvo documentos evergreen (`00000000-…` o `reference` sin fecha de cierre).

### A3. Actualizar índice Markdown (NO NEGOCIABLE)

Añadir **fila en la tabla de la familia** en el `INDEX.md` correspondiente:

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|

- Enlace al **path canónico** (nombre codificado), nunca solo al stub legacy.
- Si abres una familia nueva, crear sección `## Familia XXX`.

### A4. Crear archivo canónico

- **Nombre:** `{prefijo-código}-{slug}.md` (kebab-case).
- **Ubicación:** según tipo (`docs/auditorias/`, `docs/runbooks/`, etc.).
- **Encabezado** inmediatamente **después** del `# Título`:

  ```markdown
  **Código:** `20260625-AUD-IMG-OVR-03 ejemplo-nuevo` · **Familia:** IMG-OVR · **Estado:** open
  ```

### A5. Trazabilidad cruzada

- Enlazar docs relacionados por **código**, no solo por filename.
- Si hay test/gate: añadir `relatedTests` en auditoría y `relatedAuditCodes` en QA.
- Actualizar el registro del doc **padre** en la misma familia si aplica.

### A6. Verificar

```bash
npm run verify:qa-registry
```

**Prohibido merge** si falla.

---

## Checklist B — Test o gate nuevo (OBLIGATORIO, en este orden)

### B1. Asignar código

Formato: `{TIPO}-{FAMILIA}-{NNN} {nombre-corto}`

| Campo | Significado |
|-------|-------------|
| `TIPO` | `TS`, `VF`, `QA`, `AU`, `GEN`, `SEC`, `I18N` |
| `FAMILIA` | Dominio (tabla en [`qa/CONVENTIONS.md`](../qa/CONVENTIONS.md)) |
| `NNN` | Secuencia `001`…`999` **dentro de TIPO+FAMILIA** |
| `area` | Superficie concreta bajo test (ver B2) |

Ejemplo: `TS-WEB-OVR-004 overlay-mutation-spacing`

### B2. Definir `area` (OBLIGATORIO)

**`area`** = módulo o superficie que el test ejercita, path repo-relative **sin extensión**, sin segmento `__tests__`:

| Archivo de test | `area` |
|-----------------|--------|
| `apps/web/src/lib/__tests__/overlay-title-layout.test.ts` | `apps/web/src/lib/overlay-title-layout` |
| `packages/iching-engine/src/engine.mutation-rules.test.ts` | `packages/iching-engine/src/engine.mutation-rules` |
| `scripts/verify-overlay-glyphs.mjs` | `scripts/verify-overlay-glyphs` |
| `backend/claude/src/interpretation-line-gate.test.ts` | `backend/claude/src/interpretation-line-gate` |

Regla: quien lea el código debe saber **qué pieza del producto** cubre el test sin abrir el registro.

### B3. Actualizar `docs/qa/registry.json` (NO NEGOCIABLE)

```json
{
  "code": "TS-WEB-OVR-004 overlay-mutation-spacing",
  "title": "Overlay mutation EN vertical spacing",
  "shortName": "overlay-mutation-spacing",
  "type": "TS",
  "family": "WEB-OVR",
  "area": "apps/web/src/lib/overlay-title-layout",
  "version": "1.0.0",
  "versionHistory": [
    { "version": "1.0.0", "date": "2026-06-25", "change": "Initial cases" }
  ],
  "path": "apps/web/src/lib/__tests__/overlay-title-layout.test.ts",
  "npmScript": "npm run test --prefix apps/web -- overlay-title-layout",
  "relatedAuditCodes": ["20260625-AUD-IMG-OVR-02 mutation-title-layout"]
}
```

Campos obligatorios en todo entry: `code`, `title`, `shortName`, `type`, `family`, **`area`**, `version`, `versionHistory`, `path`, `npmScript` (si aplica).

### B4. Actualizar `docs/qa/INDEX.md` (NO NEGOCIABLE)

Añadir fila en la tabla de la familia/tipo con: código, versión, `area`, comando npm, auditoría ligada.

### B5. Cabecera en el archivo de test/script (OBLIGATORIO)

**Vitest / TypeScript:**

```typescript
/**
 * QA code: TS-WEB-OVR-004 overlay-mutation-spacing · v1.0.0
 * Area: apps/web/src/lib/overlay-title-layout
 * Family: WEB-OVR
 */
```

**Scripts `.mjs`:**

```javascript
/**
 * QA code: VF-WEB-OVR-001 overlay-glyphs · v1.1.0
 * Area: scripts/verify-overlay-glyphs
 * Family: WEB-OVR
 */
```

### B6. npm script (si VF / QA / AU / GEN)

Añadir script en `package.json` raíz (o documentar variante en `variants[]` del registro).

### B7. Bump de versión al cambiar criterio

| Cambio | Acción |
|--------|--------|
| Pass/fail o fixture incompatible | MAJOR + entrada en `versionHistory` |
| Nuevos casos / flags | MINOR |
| Refactor sin cambio de criterio | PATCH |

Actualizar **también** el comentario `vX.Y.Z` en el archivo.

### B8. Verificar

```bash
npm run inject:qa-headers    # si el archivo aún no tiene cabecera canónica
npm run verify:qa-registry   # bloqueante — registry + cabeceras en fuente
npm test                     # o el npmScript concreto
```

---

## Checklist C — Modificar documento existente

| Cambio | Registro | Índice | Versión test |
|--------|----------|--------|--------------|
| Solo contenido, mismo alcance | No | No | PATCH si aplica |
| Nuevo hallazgo / nuevo gate | Sí (`relatedCodes` / `relatedTests`) | Sí si cambia estado o título | MINOR o MAJOR |
| Renombrar archivo | Sí (`path`) | Sí (enlaces) | No |
| Cerrar auditoría | Sí (`status`) | Sí (columna Estado) | No |

## Checklist D — Modificar test o gate existente

Detalle completo: [`00000000-WF-QA-01-test-lifecycle.md`](./00000000-WF-QA-01-test-lifecycle.md) §2–§4.

| Cambio | `registry.json` | `INDEX.md` | Cabecera | Bump |
|--------|-----------------|------------|----------|------|
| Refactor, mismo pass/fail | PATCH opcional en history | No | `inject:qa-headers` | PATCH |
| Nuevos casos / flags | Sí | Sí (v, notas) | Sí | MINOR |
| Criterio pass/fail distinto | Sí | Sí | Sí | MAJOR |
| Mover módulo (`area`) | Sí (`area`, `path`) | Sí (columna Area) | Sí | PATCH |

Siempre cerrar con `npm run verify:qa-registry`.

---

## Prohibiciones explícitas

1. Crear `.md` en `docs/` sin código y registro.
2. Crear `.test.ts` o script `verify:*` / `qa:*` / `audit:*` sin entrada en `docs/qa/registry.json`.
3. Omitir fila en `INDEX.md` “para hacerlo después”.
4. Usar nombres legacy (`FOO_AUDIT_2026-06-25.md`) en docs nuevos.
5. Editar stubs `(renamed)` en lugar del archivo canónico.
6. Merge con `verify:qa-registry` en rojo.

---

## Referencia rápida de validación

```bash
npm run verify:qa-registry
```

Comprueba: códigos únicos, paths existentes, `area` en tests, cross-refs audit↔test, cabeceras QA, **orphan tests**, **npm gates no registrados**. Exenciones: [`docs/qa/exempt-paths.json`](../qa/exempt-paths.json).

---

## Enlaces

- Índice global: [`docs/INDEX.md`](../INDEX.md)
- Auditorías: [`docs/auditorias/INDEX.md`](../auditorias/INDEX.md)
- Tests: [`docs/qa/INDEX.md`](../qa/INDEX.md)
- Ciclo de vida tests: [`00000000-WF-QA-01-test-lifecycle.md`](./00000000-WF-QA-01-test-lifecycle.md)
