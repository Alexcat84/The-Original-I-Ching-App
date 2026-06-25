# Convenciones de codificación — tests y gates QA

Fuente canónica: [`registry.json`](./registry.json).  
Índice legible: [`INDEX.md`](./INDEX.md) — **columna `area` obligatoria en cada fila nueva.**

**Reglas obligatorias:** [`../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md`](../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md)

---

## Formato de código

```
{TIPO}-{FAMILIA}-{NNN} {nombre-corto}
```

| Parte | Regla | Ejemplo |
|-------|--------|---------|
| `TIPO` | Clase de prueba (tabla abajo) | `TS` |
| `FAMILIA` | Dominio funcional | `WEB-OVR` |
| `NNN` | Secuencia `001`…`999` en TIPO+FAMILIA | `003` |
| `nombre-corto` | Slug kebab-case | `overlay-title-layout` |
| **`area`** | Módulo bajo test (campo registro + comentario archivo) | `apps/web/src/lib/overlay-title-layout` |

**Ejemplo completo:** código `TS-WEB-OVR-003 overlay-title-layout` · area `apps/web/src/lib/overlay-title-layout` · family `WEB-OVR`

---

## Campo `area` (OBLIGATORIO)

Identifica **qué superficie del producto** ejercita el test. Path repo-relative, sin extensión, sin `__tests__`:

| Test path | `area` |
|-----------|--------|
| `apps/web/src/lib/__tests__/foo.test.ts` | `apps/web/src/lib/foo` |
| `packages/iching-engine/src/engine.test.ts` | `packages/iching-engine/src/engine` |
| `scripts/verify-overlay-glyphs.mjs` | `scripts/verify-overlay-glyphs` |

`area` ≠ `family`: la familia agrupa por dominio; el area apunta al módulo concreto.

---

## Tipos de prueba (`TIPO`)

| Código | Qué es | Ejecución típica |
|--------|--------|------------------|
| `TS` | Test unitario Vitest | `npm test` (turbo) o `npm run test --prefix <pkg>` |
| `VF` | Verify gate (pass/fail CI-local) | `npm run verify:*` |
| `QA` | Harness QA (LLM, lecturas, matrices) | `npm run qa:*` |
| `AU` | Script de auditoría dataset | `npm run audit:*` |
| `GEN` | Generador de muestras / artefactos | `npm run generate:*` |
| `SEC` | Escaneo seguridad | `npm run security:scan` |
| `I18N` | Auditoría i18n | `npm run i18n:audit` |

---

## Familias (`FAMILIA`)

| Código | Ámbito |
|--------|--------|
| `ENG` | `@iching-oracle/iching-engine` |
| `CLAUDE` | `backend/claude` — gates interpretación |
| `WEB` | `apps/web` — lib/API helpers |
| `WEB-OVR` | Overlay PNG / tipografía |
| `DATA` | `@iching-oracle/iching-data` |
| `CTX` | `@iching-oracle/context-engine` |
| `FID` | Fidelidad hexagramas / gold |
| `FID-W` | Wilhelm maestro/runtime |
| `FID-L` | Legge maestro/runtime |
| `FID-ZY` | Zhou Yi |
| `MUT` | Reglas mutación / QA salida LLM |
| `RDG` | Reading quality harness |
| `PINYIN` | Gate pinyin gold |
| `DOC` | Docs producto vs código |
| `BILL` | Tokens / RevenueCat / webhooks |
| `AUTH` | Legal / post-auth |
| `CHAT` | Sesiones / hidratación |
| `SEC` | Vulnerabilidades dependencias |

Nueva familia: proponer código en PR + fila en esta tabla + sección en [`INDEX.md`](./INDEX.md).

---

## Control de versiones del test

Cada entrada en `registry.json` lleva `version` + `versionHistory[]` (obligatorio).

| Bump | Cuándo |
|------|--------|
| MAJOR | Cambio de criterio de pass/fail o fixture incompatible |
| MINOR | Nuevos casos, flags, traductores o variantes npm |
| PATCH | Refactor sin cambiar criterio (paths, mensajes, perf) |

**Variantes:** `variants[]` con `variantId`, `npmScript`, `version` propia.

---

## Alta de test nuevo (OBLIGATORIO)

Checklist completa: [`MANDATORY_DOC_AND_QA_REGISTRATION.md`](../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md)

| Paso | Acción | ¿Negociable? |
|------|--------|--------------|
| 1 | Código + familia + **`area`** | No |
| 2 | [`registry.json`](./registry.json) con `version` / `versionHistory` | **No** |
| 3 | Fila en [`INDEX.md`](./INDEX.md) (incluir `area`) | **No** |
| 4 | Cabecera en archivo (código, versión, area, family) | No |
| 5 | `npmScript` en `package.json` si VF/QA/AU/GEN | Si aplica |
| 6 | `npm run verify:qa-registry` | No |

Cabecera obligatoria en el archivo:

```typescript
/**
 * QA code: TS-WEB-OVR-003 overlay-title-layout · v1.0.0
 * Area: apps/web/src/lib/overlay-title-layout
 * Family: WEB-OVR
 */
```

Si cierra hallazgo de auditoría: `relatedAuditCodes` en registro y `relatedTests` en auditoría.

---

## Ejecución rápida

```bash
npm run verify:qa-registry                 # bloqueante — incluye validación de area
npm test
npm run verify:hexagram-fidelity
npm run verify:overlay-glyphs
npm run qa:mutation-output
npm run qa:reading-quality
```
