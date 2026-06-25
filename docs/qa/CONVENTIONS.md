# Convenciones de codificación — tests y gates QA

Fuente canónica: [`registry.json`](./registry.json).  
Índice legible: [`INDEX.md`](./INDEX.md).

---

## Formato de código

```
{TIPO}-{FAMILIA}-{NNN} {nombre-corto}
```

| Parte | Regla | Ejemplo |
|-------|--------|---------|
| `TIPO` | Clase de prueba (tabla abajo) | `TS` |
| `FAMILIA` | Dominio (alineado con auditorías cuando aplique) | `WEB-OVR` |
| `NNN` | Secuencia `001`…`999` | `003` |
| `nombre-corto` | Slug kebab-case | `overlay-title-layout` |

**Ejemplo:** `TS-WEB-OVR-003 overlay-title-layout`

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

Alineadas con [`docs/auditorias/CONVENTIONS.md`](../auditorias/CONVENTIONS.md) donde tiene sentido:

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

---

## Control de versiones del test

Cada entrada en `registry.json` lleva:

```json
{
  "version": "1.0.0",
  "versionHistory": [
    {
      "version": "1.0.0",
      "date": "2026-06-24",
      "change": "Initial gate"
    }
  ]
}
```

**Semver del test (convención del repo):**

| Bump | Cuándo |
|------|--------|
| MAJOR | Cambio de criterio de pass/fail o fixture incompatible |
| MINOR | Nuevos casos, flags, traductores o variantes npm |
| PATCH | Refactor sin cambiar criterio (paths, mensajes, perf) |

**Variantes:** mismo código base + sufijo en `npmScript` (p. ej. `verify:hexagram-fidelity:pdf-legge`) registradas como `variants[]` con `variantId` y `version` propia.

---

## Alta de test nuevo

1. Añadir entrada en [`registry.json`](./registry.json).
2. Fila en [`INDEX.md`](./INDEX.md).
3. Comentario en el archivo de test:

   ```typescript
   /** QA code: TS-WEB-OVR-003 overlay-title-layout · v1.0.0 */
   ```

4. Si cierra un hallazgo de auditoría, `relatedAuditCodes: ["20260625-AUD-IMG-OVR-02 ..."]`.

---

## Ejecución rápida

```bash
npm test                                    # todos los Vitest (turbo)
npm run verify:hexagram-fidelity            # gate W+L runtime
npm run verify:overlay-glyphs               # gate overlay + vitest embed
npm run qa:mutation-output                  # matriz mutación (consume API)
npm run qa:reading-quality                  # lecturas reales (consume API)
```
