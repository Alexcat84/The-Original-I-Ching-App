# Convenciones de codificación — auditorías y documentos QA

Fuente canónica de metadatos: [`registry.json`](./registry.json).  
Índice legible: [`INDEX.md`](./INDEX.md).

Los **nombres de archivo canónicos** siguen `{YYYYMMDD}-{TIPO}-{FAMILIA}-{NN}-{slug}.md`. Los paths legacy conservan un stub `(renamed)` con enlace al canónico.

---

## Formato de código

```
{YYYYMMDD}-{TIPO}-{FAMILIA}-{NN} {nombre-corto}
```

| Parte | Regla | Ejemplo |
|-------|--------|---------|
| `YYYYMMDD` | Fecha del documento o del cierre principal | `20260625` |
| `TIPO` | Ver tabla de tipos | `AUD` |
| `FAMILIA` | Dominio corto (3–12 chars, mayúsculas) | `IMG-OVR` |
| `NN` | Secuencia dentro de familia (`01`…`99`) | `02` |
| `nombre-corto` | Slug kebab-case, ≤40 chars | `mutation-title-layout` |

**Ejemplo completo:** `20260625-AUD-IMG-OVR-02 mutation-title-layout`

---

## Tipos (`TIPO`)

| Código | Significado | Cuándo usar |
|--------|-------------|-------------|
| `AUD` | Auditoría / investigación | Diagnóstico, hallazgos, alcance |
| `PLAN` | Plan de implementación | Pasos futuros antes o durante el fix |
| `FIX` | Solución / remediación cerrada | Documento centrado en el fix aplicado |
| `INC` | Incidente | P0/P1 con impacto en datos o usuarios |
| `GATE` | Gate de calidad documentado | Criterio de aceptación reproducible |
| `POL` | Política de producto/datos | Reglas duraderas (p. ej. maestros TXT) |
| `BRIEF` | Brief corto | Alcance UI/UX acotado |
| `EXT` | Validación externa | Revisión por terceros o modelo externo |
| `RPT` | Reporte general | Resumen transversal o legacy |
| `RUN` | Runbook (referencia) | Vive en `docs/runbooks/`; solo enlace aquí |

---

## Familias (`FAMILIA`)

| Código | Dominio |
|--------|---------|
| `ARCH` | Arquitectura full-stack |
| `SUP` | Supabase, migraciones, Warp/PostgREST |
| `SUP-INC` | Incidentes Supabase/datos |
| `MOB-HYD` | Hidratación chat / SQLite |
| `MOB-UI` | UI WebView / layout APK |
| `MOB-NAV` | Navegación RN ↔ App Router |
| `MOB-PLAY` | Play Console / Data Safety |
| `DAT-FID` | Fidelidad traductores / gold / gates |
| `DAT-MAESTRO` | Maestros TXT Princeton (W/L) |
| `DAT-MAESTRO-W` | Maestro Wilhelm |
| `DAT-MAESTRO-L` | Maestro Legge |
| `DAT-RT` | Bundles runtime (EPUB-primary, sync) |
| `MUT` | Reglas mutación IA / líneas cambiantes |
| `LRS` | Line reading system (Huang / Zhu Xi) |
| `RDG-QA` | Calidad interpretación / verbatim |
| `LIB` | Biblioteca hexagramas UI/datos |
| `IMG-OVR` | Overlay PNG sumi / tipografía |
| `DOC` | Docs de producto vs implementación |
| `PRD` | Pre-producción / go-live |
| `PERF` | Rendimiento Claude/imágenes |
| `OBS` | Observabilidad / Axiom / logs |
| `ANM` | Animación ritual / tick pacing |
| `SEC` | Seguridad dependencias |
| `DIV` | Métodos de adivinación |
| `SYM` | Símbolos dinámicos |
| `LEG` | Legacy / reportes históricos |

Varios documentos **comparten familia** cuando rastrean el mismo hilo (p. ej. `IMG-OVR-01` auditoría + `IMG-OVR-01b` plan).

---

## Estados

| Estado | Significado |
|--------|-------------|
| `closed` | Cerrada; fix verificado o decisión tomada |
| `mitigated` | Mitigada; seguimiento opcional |
| `open` | Abierta / en curso |
| `decided` | Decisión de producto sin cambio de código |
| `shipped` | Desplegado en runtime |
| `reference` | Documento de referencia evergreen |

---

## Alta de documento nuevo

1. Asignar código único en [`registry.json`](./registry.json) (fecha, tipo, familia, seq).
2. Añadir fila en [`INDEX.md`](./INDEX.md) (o regenerar sección de la familia).
3. Primera línea del `.md` (después del título H1):

   ```markdown
   **Código:** `20260625-AUD-IMG-OVR-02 mutation-title-layout` · **Familia:** IMG-OVR · **Estado:** open
   ```

4. Enlazar documentos relacionados por **código**, no solo por path.
5. Si hay gate o test asociado, enlazar código QA en [`docs/qa/INDEX.md`](../qa/INDEX.md).

---

## Documentos fuera de `docs/auditorias/`

| Ubicación | Tratamiento |
|-----------|-------------|
| `docs/runbooks/` | Tipo `RUN`; entrada en registro con `path` externo |
| `docs/plans/` | Tipo `PLAN`; familia según dominio |
| Raíz (`00000000-RPT-DAT-FID-00-data-integrity-summary.md` en auditorias) | Tipo `RPT` si es resumen público |

---

## Trazabilidad

Cada entrada del registro incluye:

- `code`, `title`, `shortName`, `type`, `family`, `date`, `status`
- `path` — ruta al `.md`
- `relatedCodes` — otros códigos de la misma familia o dependencia
- `relatedTests` — códigos de [`docs/qa/registry.json`](../qa/registry.json)
- `commits` — opcional, hash(es) fix/regresión
- `reports` — opcional, artefactos en `reports/`
