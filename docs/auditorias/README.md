# Project audits (`docs/auditorias/`)

Ubicación canónica de auditorías, incidentes, planes y gates documentados.

**Consulta principal:** [`INDEX.md`](./INDEX.md) — índice maestro con códigos, fechas, familias y trazabilidad a tests.  
**Reglas obligatorias:** [`../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md`](../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md)  
**Documentación global:** [`docs/INDEX.md`](../INDEX.md)  
**Convenciones de codificación:** [`CONVENTIONS.md`](./CONVENTIONS.md) · registro machine-readable: [`registry.json`](./registry.json)  
**Tests QA:** [`docs/qa/INDEX.md`](../qa/INDEX.md)

---

## Recientes (referencia rápida)

| Código | Fecha | Título | Estado |
|--------|-------|--------|--------|
| `20260625-AUD-IMG-OVR-02 mutation-title-layout` | 2026-06-25 | Overlay: layout título mutación | closed |
| `20260624-AUD-IMG-OVR-01 legge-diacritics` | 2026-06-24 | Overlay: diacríticos Legge | closed |
| `20260624-AUD-RDG-QA-02 verbatim-blockquote-gap` | 2026-06-24 | QA verbatim + Gate H7 | mitigated |
| `20260622-AUD-DOC-01 user-docs-vs-implementation` | 2026-06-22 | Docs producto vs impl | closed |
| `20260607-INC-SUP-INC-01 consultation-content-wipe` | 2026-06-07 | P0 wipe content | closed |

Índice completo por familia: [`INDEX.md`](./INDEX.md).

---

## Alta de documento nuevo

1. Asignar código en [`registry.json`](./registry.json) y fila en [`INDEX.md`](./INDEX.md).
2. Incluir en el `.md`: fecha, commits, síntoma, causa, fix, verificación, estado.
3. Línea de metadatos: `**Código:** \`YYYYMMDD-TIPO-FAMILIA-NN slug\` · **Familia:** … · **Estado:** …`
4. Enlazar tests QA (`docs/qa/`) y runbooks si aplica.

(`docs/audits/` fue fusionado aquí y eliminado.)
