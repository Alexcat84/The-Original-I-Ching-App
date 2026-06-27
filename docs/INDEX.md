# Índice maestro — `docs/`

**Registro:** [`registry.json`](./registry.json) · **Convenciones:** [`CONVENTIONS.md`](./CONVENTIONS.md) · **Reglas obligatorias:** [`workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md`](./workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md)

---

## Sub-índices especializados

| Colección | Entradas | Índice |
|-----------|----------|--------|
| Auditorías e incidentes | 57+ | [`auditorias/INDEX.md`](./auditorias/INDEX.md) |
| **iOS App Store (MOB-IOS)** | 2 | [`auditorias/mob-ios/INDEX.md`](./auditorias/mob-ios/INDEX.md) |
| Tests y gates QA | 54+ | [`qa/INDEX.md`](./qa/INDEX.md) |

---

## Runbooks (`RUN-SUP-*`)

| Código | Título | Documento |
|--------|--------|-----------|
| `00000000-RUN-SUP-01 migration-data-integrity` | Integridad datos en migraciones | [00000000-RUN-SUP-01-migration-data-integrity.md](./runbooks/00000000-RUN-SUP-01-migration-data-integrity.md) |
| `00000000-RUN-SUP-02 supabase-scalability` | Escalabilidad Supabase | [00000000-RUN-SUP-02-supabase-scalability.md](./runbooks/00000000-RUN-SUP-02-supabase-scalability.md) |
| `00000000-RUN-SUP-03 smoke-post-small` | Smoke post-Small | [00000000-RUN-SUP-03-smoke-post-small.md](./runbooks/00000000-RUN-SUP-03-smoke-post-small.md) |
| `00000000-RUN-SUP-04 post-restart` | Post-restart Supabase | [00000000-RUN-SUP-04-post-restart.md](./runbooks/00000000-RUN-SUP-04-post-restart.md) |
| `00000000-RUN-SUP-05 recover-pitr` | Recuperación PITR content | [00000000-RUN-SUP-05-recover-pitr.md](./runbooks/00000000-RUN-SUP-05-recover-pitr.md) |
| `00000000-RUN-REST-01 restoration-manual` | Manual restauración contenido | [00000000-RUN-REST-01-restoration-manual.md](./restoration-manual/00000000-RUN-REST-01-restoration-manual.md) |

---

## Planes (`PLAN-SUP-*`)

| Código | Título | Documento |
|--------|--------|-----------|
| `00000000-PLAN-SUP-07 scale-infrastructure` | Escala infraestructura | [00000000-PLAN-SUP-07-scale-infrastructure.md](./plans/00000000-PLAN-SUP-07-scale-infrastructure.md) |
| `00000000-PLAN-SUP-08 anti-warp-serialize-burst` | Anti-Warp: serializar burst | [00000000-PLAN-SUP-08-anti-warp-serialize-burst.md](./plans/00000000-PLAN-SUP-08-anti-warp-serialize-burst.md) |

## Colección MOB-IOS — Lanzamiento iOS App Store

Índice dedicado: [`auditorias/mob-ios/INDEX.md`](./auditorias/mob-ios/INDEX.md)

| Código | Título | Documento |
|--------|--------|-----------|
| `20260627-PLAN-MOB-IOS-01 ios-app-store-launch` | Plan maestro (fases 0–6) | [20260627-PLAN-MOB-IOS-01-ios-app-store-launch.md](./auditorias/mob-ios/20260627-PLAN-MOB-IOS-01-ios-app-store-launch.md) |
| `20260627-PLAN-MOB-IOS-02 fase2-implementation-plan-v1` | Implementación Fase 2 v1.0 (reviewed — ajustes requeridos) | [20260627-PLAN-MOB-IOS-02-fase2-implementation-plan-v1.md](./auditorias/mob-ios/20260627-PLAN-MOB-IOS-02-fase2-implementation-plan-v1.md) |

Legacy stub: [`plans/20260627-PLAN-MOB-IOS-01-ios-app-store-launch.md`](./plans/20260627-PLAN-MOB-IOS-01-ios-app-store-launch.md) (renamed)

---

## Workflows (`WF-*`)

| Código | Título | Documento |
|--------|--------|-----------|
| `00000000-WF-I18N-01 i18n-guide` | Agregar idioma | [00000000-WF-I18N-01-i18n-guide.md](./workflows/00000000-WF-I18N-01-i18n-guide.md) |
| `00000000-WF-I18N-02 i18n-standardization` | Estandarización i18n DoD | [00000000-WF-I18N-02-i18n-standardization.md](./workflows/00000000-WF-I18N-02-i18n-standardization.md) |
| `00000000-WF-DOC-01 docs-content-update-guide` | Actualizar docs producto | [00000000-WF-DOC-01-docs-content-update-guide.md](./workflows/00000000-WF-DOC-01-docs-content-update-guide.md) |
| `00000000-WF-DOC-03 audits-page-update-guide` | **Actualizar página `/audits`** | [00000000-WF-DOC-03-audits-page-update-guide.md](./workflows/00000000-WF-DOC-03-audits-page-update-guide.md) |
| `00000000-WF-DOC-02 mandatory-doc-qa-registration` | **Registro obligatorio docs/tests** | [00000000-WF-DOC-02-mandatory-doc-qa-registration.md](./workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md) |
| `00000000-WF-QA-01 test-lifecycle` | Ciclo de vida tests (crear, actualizar, índice) | [00000000-WF-QA-01-test-lifecycle.md](./workflows/00000000-WF-QA-01-test-lifecycle.md) |
| `00000000-WF-AUTH-01 legal-post-auth` | Legal post-auth | [00000000-WF-AUTH-01-legal-post-auth.md](./workflows/00000000-WF-AUTH-01-legal-post-auth.md) |

---

## Setup y ops

| Código | Título | Documento |
|--------|--------|-----------|
| `00000000-SETUP-DB-01 new-db-setup` | Nuevo proyecto Supabase | [00000000-SETUP-DB-01-new-db-setup.md](./setup/00000000-SETUP-DB-01-new-db-setup.md) |
| `00000000-OPS-PLAY-01 play-store-changelog` | Changelog Play Store | [00000000-OPS-PLAY-01-play-store-changelog.md](./00000000-OPS-PLAY-01-play-store-changelog.md) |

---

## Trazabilidad cruzada

- Auditoría ↔ test: campos `relatedTests` / `relatedAuditCodes` en registros JSON.
- Incidente P0 content wipe: `20260607-INC-SUP-INC-01` → runbooks `RUN-SUP-01`, `RUN-SUP-05`, `RUN-REST-01`.
- Warp / pool: `AUD-SUP-02` → plan `PLAN-SUP-08`, runbook escalabilidad `RUN-SUP-02`.

---

## Scripts de mantenimiento

| Script | Uso |
|--------|-----|
| `node scripts/migrate-audit-docs.mjs` | Renombrar auditorías (ya ejecutado) |
| `node scripts/migrate-other-docs.mjs` | Renombrar runbooks/planes/workflows |
| `node scripts/fix-doc-headers.mjs` | Corregir posición del bloque **Código:** |
| `npm run inject:qa-headers` | Sincronizar cabeceras QA en archivos fuente |
| `npm run verify:qa-registry` | Validar integridad de registros + orphans |
