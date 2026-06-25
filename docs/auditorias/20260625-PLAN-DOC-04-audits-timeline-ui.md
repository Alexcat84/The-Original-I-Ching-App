# `/audits` — plan de rediseño timeline único
**Código:** `20260625-PLAN-DOC-04 audits-timeline-ui` · **Familia:** DOC · **Estado:** closed

- **Fecha:** 2026-06-25
- **Estado:** ✅ **Cerrada** — implementado en rama de trabajo local; gates `i18n:audit` + `verify-docs-remediation` PASS
- **Relacionado:** [`audits-page-ui.ts`](../../packages/i18n/src/messages/audits-page-ui.ts), [`apps/web/src/app/audits/page.tsx`](../../apps/web/src/app/audits/page.tsx), [`00000000-WF-DOC-03-audits-page-update-guide.md`](../workflows/00000000-WF-DOC-03-audits-page-update-guide.md), [`20260622-AUD-DAT-FID-04-fidelity-mutation-master.md`](./20260622-AUD-DAT-FID-04-fidelity-mutation-master.md)
- **Alcance:** UI pública `/audits` + i18n · sin cambios en datasets, motor de fidelidad ni billing

---

## 1. Objetivo

Sustituir la página actual (intro + secciones oracle/mutación/reports) por **un único timeline vertical** con entradas expandibles (`+` / `<details>`). Solo timeline dentro del `<article>`; nav doc y tema global se mantienen. Sin lead, h1 visible, seeAlso ni meta “last updated”.

---

## 2. Decisiones UX (acordadas)

| Decisión | Detalle |
|----------|---------|
| Orden | Más reciente arriba; mismo día con `sortOrder` |
| Nodo rail | Verde (`current` + `permanent` + releases cerradas); apagado (`superseded`) |
| Contenido artículo | Solo `<ol class="audit-timeline">` |
| Expand | Fuente (APA), Método, Estándar, Resultado, Estado (campos omitidos si no aplican) |
| Fecha rail | ISO central + `Intl.DateTimeFormat` por locale UI |
| i18n | WF-DOC-01 · 11 locales · `npm run i18n:audit` |

---

## 3. Entradas del timeline (9)

| id | ISO | sortOrder | Tipo |
|----|-----|-----------|------|
| `library-commentary-2026-06-24` | 2026-06-24 | 0 | release |
| `legge-oxford-pdf-2026-06-22` | 2026-06-22 | 0 | verification |
| `wilhelm-pantheon-pdf-2026-06-22` | 2026-06-22 | 1 | verification |
| `huang-mutation-pdf-2026-06-22` | 2026-06-22 | 2 | verification |
| `zhuxi-adler-mutation-pdf-2026-06-22` | 2026-06-22 | 3 | verification |
| `zhouyi-ctext-2026-06-21` | 2026-06-23 | 0 | verification (reconfirmación) |
| `wilhelm-parma-initial-2026-06-21` | 2026-06-21 | 0 | verification |
| `legge-sacred-texts-initial-2026-06-21` | 2026-06-21 | 1 | verification |
| `line-reading-selector-2026-06-20` | 2026-06-20 | 0 | release |

---

## 4. Checklist de implementación

- [x] Tipos `AuditTimelineEntry` + `TIMELINE_META` + `buildTimeline()` en `audits-page-ui.ts`
- [x] Reducir `AuditsPageUiMessages` (title metadata + labels + `timeline[]`)
- [x] Reescribir `apps/web/src/app/audits/page.tsx` (solo timeline en artículo)
- [x] CSS `.audit-timeline*` en `globals.css` (rail + nodos + `<details>` con `+`)
- [x] Actualizar exports `packages/i18n/src/index.ts` + `formatAuditTimelineDate`
- [x] Ajustar `scripts/verify-docs-remediation.mjs` (checks sobre `timeline`)
- [x] `npm run i18n:audit` + `verify-docs-remediation` PASS
- [x] Registrar en `docs/auditorias/registry.json` + `INDEX.md`
- [ ] Smoke visual `/audits` en staging (pendiente deploy)

---

## 5. Verificación

```bash
npm run i18n:audit
node scripts/verify-docs-remediation.mjs
```

Smoke manual post-deploy: `/audits` en claro/oscuro · expand/collapse · orden descendente · nodos verde/gris correctos.
