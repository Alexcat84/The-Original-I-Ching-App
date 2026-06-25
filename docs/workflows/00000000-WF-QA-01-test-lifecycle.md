# Ciclo de vida de tests y gates QA

**Código:** `00000000-WF-QA-01 test-lifecycle` · **Familia:** QA · **Estado:** reference

**Complementa:** [`00000000-WF-DOC-02-mandatory-doc-qa-registration.md`](./00000000-WF-DOC-02-mandatory-doc-qa-registration.md) (checklists A/B base).

**Registro:** [`docs/qa/registry.json`](../qa/registry.json) · **Índice:** [`docs/qa/INDEX.md`](../qa/INDEX.md)

---

## Cuándo usar este workflow

| Situación | Sección |
|-----------|---------|
| Test o gate **nuevo** | §1 Creación |
| Cambio en criterio, casos o path | §2 Actualización |
| Solo fila de índice desactualizada | §3 Índice |
| Bump de versión | §4 Versionado |
| Script `*-qa.mjs` sin npm | §1 + registrar path manual |

---

## §1 — Creación (orden estricto)

### 1.1 Elegir código

Formato: `{TIPO}-{FAMILIA}-{NNN} {slug-kebab}`

1. Abrir [`docs/qa/INDEX.md`](../qa/INDEX.md) y localizar la familia (`TS-ENG`, `VF-FID`, `QA-MUT`, …).
2. `{NNN}` = siguiente libre **dentro de TIPO+FAMILIA** (no reutilizar números cerrados).
3. Definir **`area`** antes del código final — ver [`qa/CONVENTIONS.md`](../qa/CONVENTIONS.md).

### 1.2 Entrada en `docs/qa/registry.json`

Campos obligatorios:

| Campo | Regla |
|-------|--------|
| `code` | Código completo con slug |
| `title` | Descripción humana |
| `shortName` | Slug sin prefijo |
| `type` | `TS` `VF` `QA` `AU` `GEN` `SEC` `I18N` |
| `family` | Dominio (tabla convenciones) |
| **`area`** | Módulo bajo test, sin `__tests__`, sin extensión |
| `version` | `"1.0.0"` inicial |
| `versionHistory` | Al menos una entrada `{ version, date, change }` |
| `path` | Path repo-relative al `.test.ts` o `.mjs` |
| `npmScript` | Comando npm si existe; si solo `node scripts/foo.mjs`, documentarlo igual |
| `relatedAuditCodes` | Si cierra o valida una auditoría |

Opcionales: `variants[]`, `consumesTokens`, `artifacts`, `relatedTests` inverso en auditoría.

### 1.3 Fila en `docs/qa/INDEX.md` (NO NEGOCIABLE)

Añadir fila en la **sección de familia correcta**. Columnas mínimas:

| Columna | Obligatoria |
|---------|-------------|
| Código | Sí |
| **Area** | Sí |
| v | Sí |
| Archivo / npm script | Sí |
| Auditoría / notas | Si aplica |

Si abres familia nueva: sección `## …` + fila en tabla de familias de [`qa/CONVENTIONS.md`](../qa/CONVENTIONS.md).

### 1.4 Implementar archivo + cabecera

```typescript
/**
 * QA code: TS-WEB-001 detect-input-language · v1.0.0
 * Area: apps/web/src/lib/detect-input-language
 * Family: WEB
 */
```

O ejecutar: `npm run inject:qa-headers`

### 1.5 npm script (si aplica)

Prefijos registrables: `verify:`, `qa:`, `audit:`, `i18n:`, `security:`, `generate:` (solo si es gate GEN).

Añadir en `package.json` raíz. Variantes (`:pdf-legge`, `:quick`) van en `variants[]` del registro, no como entry separado salvo criterio distinto.

### 1.6 Trazabilidad

- Auditoría relacionada: `relatedTests` en audit registry + `relatedAuditCodes` en QA.
- Workflow relacionado: `relatedTests` en `docs/registry.json` si aplica.

### 1.7 Verificar (bloqueante)

```bash
npm run inject:qa-headers
npm run verify:qa-registry
npm test   # o npmScript concreto
```

---

## §2 — Actualización de test existente

### Matriz de decisión

| Cambio | `registry.json` | `INDEX.md` | Cabecera `vX.Y.Z` | Bump |
|--------|-----------------|------------|-------------------|------|
| Refactor interno, mismo pass/fail | No* | No | PATCH opcional | PATCH |
| Nuevos casos / flags / traductores | Sí (`versionHistory`) | Sí si cambia v o notas | Sí | MINOR |
| Criterio pass/fail o fixture incompatible | Sí | Sí | Sí | MAJOR |
| Renombrar archivo | Sí (`path`) | Sí (path en fila) | No | No |
| Mover módulo (`area` distinto) | Sí (`area`, `path`) | Sí (columna Area) | No | PATCH |
| Nuevo npm variant | Sí (`variants[]`) | Nota en columna Variantes | MINOR si afecta criterio | MINOR |
| Cerrar auditoría ligada | `relatedAuditCodes` | Enlace auditoría | No | No |

\*PATCH en `versionHistory` recomendado si el cambio es significativo para trazabilidad.

### Orden al actualizar

1. Editar código del test.
2. Bump semver según tabla §4.
3. Actualizar `registry.json` (`version` + `versionHistory`).
4. Actualizar fila en `INDEX.md` (versión, area, notas).
5. `npm run inject:qa-headers` (sincroniza cabecera).
6. `npm run verify:qa-registry`.

**Prohibido:** cambiar criterio MAJOR sin bump MAJOR en registro y cabecera.

---

## §3 — Reglas del índice (`docs/qa/INDEX.md`)

### Estructura

- Una sección por **tipo** (`TS-*`, `VF-*`, `QA-*`, …) o subfamilia (`TS-WEB-OVR-*`).
- Tablas Markdown con pipe alineado; enlaces solo a paths canónicos.
- Columna **`Area`** en toda fila — no usar solo el registro JSON como índice oculto.

### Al añadir fila

1. Insertar en la tabla de la familia (no al final del doc si hay sección dedicada).
2. Mantener orden numérico dentro de la familia (`001`, `002`, …).
3. Versiones recientes destacadas con **negrita** solo si es el criterio activo de release.
4. Variantes npm en columna propia o notas (`:quick`, `:pdf-legge`), no filas duplicadas salvo entry distinto en registry.

### Al cerrar o deprecar

- Mantener fila; añadir nota `(archived)` o mover a subsección `## Archivados` con enlace a `scripts/archive/`.
- No borrar filas históricas sin bump MAJOR y entrada `versionHistory` que documente retirada.

---

## §4 — Versionado (semver del criterio)

| Nivel | Cuándo | Ejemplo |
|-------|--------|---------|
| **MAJOR** | Cambia pass/fail, fixture incompatible, contrato público del gate | Gate H7 pasa de warn a block |
| **MINOR** | Nuevos casos, traductores, flags, variantes npm | +10 fixtures en QA-MUT |
| **PATCH** | Refactor, mensajes, paths, perf sin cambio de veredicto | Renombrar helper interno |

Siempre:

1. Entrada en `versionHistory[]` con `date` y `change`.
2. Campo `version` actualizado.
3. Cabecera archivo: `· vX.Y.Z` (via `inject:qa-headers`).

---

## §5 — Exenciones documentadas

| Caso | Tratamiento |
|------|-------------|
| `SEC-001` → `package.json` | Sin cabecera en JSON; `area: monorepo/root` |
| Scripts mantenimiento docs | En [`docs/qa/exempt-paths.json`](../qa/exempt-paths.json) — no registrar como gate |
| Pipeline dataset (`parse:*`, `sync:*`, …) | Exentos — no son gates QA |
| Harness efímero one-shot | Mover a `scripts/archive/ephemeral-qa/` + nota en auditoría |

---

## §6 — Anti-patrones

1. `.test.ts` nuevo sin entry en registry → `verify:qa-registry` falla (orphan).
2. `npm run qa:*` / `verify:*` / `audit:*` apuntando a script no registrado → falla verify.
3. Fila solo en registry sin `INDEX.md`.
4. `area` genérico (`apps/web`) — debe ser módulo concreto.
5. Editar cabecera manual sin sync registry → drift detectado por verify.

---

## Validación

```bash
npm run verify:qa-registry
```

Comprueba: registry, cross-refs, cabeceras, **orphan tests**, **npm gates no registrados**.

---

## Enlaces

- Registro obligatorio general: [WF-DOC-02](./00000000-WF-DOC-02-mandatory-doc-qa-registration.md)
- Convenciones QA: [`qa/CONVENTIONS.md`](../qa/CONVENTIONS.md)
- Inventario raíz repo: [`20260625-AUD-REPO-01`](../auditorias/20260625-AUD-REPO-01-repo-root-inventory.md)
