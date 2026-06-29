# Índice maestro — auditorías y documentos QA

**Registro canónico:** [`registry.json`](./registry.json) · **Convenciones:** [`CONVENTIONS.md`](./CONVENTIONS.md)  
**Tests enlazados:** [`docs/qa/INDEX.md`](../qa/INDEX.md)

Consulta aquí el **código**, **nombre completo**, **fecha**, **estado** y **trazabilidad** de cada documento. Los archivos legacy conservan su nombre; el código es la clave estable.

---

## Cómo leer el índice

| Columna | Significado |
|---------|-------------|
| Código | `{YYYYMMDD}-{TIPO}-{FAMILIA}-{NN} {slug}` |
| Título | Nombre descriptivo completo |
| Estado | `closed` · `open` · `mitigated` · `decided` · `shipped` · `reference` |
| Tests | Códigos QA en `docs/qa/registry.json` |

---

## Familia IMG-OVR — Overlay PNG / tipografía

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `20260624-AUD-IMG-OVR-01 legge-diacritics` | 2026-06-24 | Overlay PNG: tofu en nombres Legge con diacríticos | closed | [20260624-AUD-IMG-OVR-01-legge-diacritics.md](./20260624-AUD-IMG-OVR-01-legge-diacritics.md) |
| `20260624-PLAN-IMG-OVR-01b dual-font-fix-plan` | 2026-06-24 | Plan dual font-stack CJK/Latin | closed | [20260624-PLAN-IMG-OVR-01b-dual-font-fix-plan.md](./20260624-PLAN-IMG-OVR-01b-dual-font-fix-plan.md) |
| `20260625-AUD-IMG-OVR-02 mutation-title-layout` | 2026-06-25 | Título mutación: resvg tspan, layout 1/2 líneas | closed | [20260625-AUD-IMG-OVR-02-mutation-title-layout.md](./20260625-AUD-IMG-OVR-02-mutation-title-layout.md) |
| `20260627-AUD-IMG-OVR-03 khwan-resvg-regression` | 2026-06-27 | Overlay Canvas — resvg→Skia, Zhou Yi `#N` mixto, cerrada | closed | [20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md](./20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md) |

**Tests:** `VF-WEB-OVR-001`, `TS-WEB-OVR-001`…`003`, `GEN-WEB-OVR-001`

---

## Familia DAT-FID — Fidelidad traductores / gold

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `00000000-RPT-DAT-FID-00 data-integrity-summary` | — | Resumen público integridad datos | reference | [00000000-RPT-DAT-FID-00-data-integrity-summary.md](./00000000-RPT-DAT-FID-00-data-integrity-summary.md) |
| `20260621-AUD-DAT-FID-01 translator-fidelity-reaudit` | 2026-06-21 | Re-auditoría 1:1 W/L/ZY vs oro | closed | [20260621-AUD-DAT-FID-01-translator-fidelity-reaudit.md](./20260621-AUD-DAT-FID-01-translator-fidelity-reaudit.md) |
| `20260622-AUD-DAT-FID-02 legge-oxford-spot-check` | 2026-06-22 | Legge SBE XVI Oxford spot check | closed | [20260622-AUD-DAT-FID-02-legge-oxford-spot-check.md](./20260622-AUD-DAT-FID-02-legge-oxford-spot-check.md) |
| `20260622-AUD-DAT-FID-03 legge-pdf-book-primary` | 2026-06-22 | Legge PDF book-primary | closed | [20260622-AUD-DAT-FID-03-legge-pdf-book-primary.md](./20260622-AUD-DAT-FID-03-legge-pdf-book-primary.md) |
| `20260622-AUD-DAT-FID-04 fidelity-mutation-master` | 2026-06-22 | Maestro fidelidad + mutación | closed | [20260622-AUD-DAT-FID-04-fidelity-mutation-master.md](./20260622-AUD-DAT-FID-04-fidelity-mutation-master.md) |
| `20260622-EXT-DAT-FID-05 external-opus-validation` | 2026-06-22 | Validación externa Opus 4.8 | reference | [20260622-EXT-DAT-FID-05-external-opus-validation.md](./20260622-EXT-DAT-FID-05-external-opus-validation.md) |
| `20260623-GATE-DAT-FID-06 pinyin-gold-gate` | 2026-06-23 | Gate pinyin 64+8 trigramas | closed | [20260623-GATE-DAT-FID-06-pinyin-gold-gate.md](./20260623-GATE-DAT-FID-06-pinyin-gold-gate.md) |

**Tests:** `VF-FID-001`, `VF-PINYIN-001`, variantes `verify:hexagram-fidelity:*`

---

## Familia DAT-MAESTRO — Maestros TXT + runtime

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `20260623-POL-DAT-MAESTRO-00 txt-maestro-notes-policy` | 2026-06-23 | Política notas W+L; Zhou Yi sin notas | closed | [20260623-POL-DAT-MAESTRO-00-txt-maestro-notes-policy.md](./20260623-POL-DAT-MAESTRO-00-txt-maestro-notes-policy.md) |
| `20260623-AUD-DAT-MAESTRO-W-01 wilhelm-txt-maestro` | 2026-06-23 | Maestro Wilhelm TXT Princeton | closed | [20260623-AUD-DAT-MAESTRO-W-01-wilhelm-txt-maestro.md](./20260623-AUD-DAT-MAESTRO-W-01-wilhelm-txt-maestro.md) |
| `20260623-AUD-DAT-MAESTRO-L-01 legge-txt-maestro` | 2026-06-23 | Maestro Legge TXT Princeton | closed | [20260623-AUD-DAT-MAESTRO-L-01-legge-txt-maestro.md](./20260623-AUD-DAT-MAESTRO-L-01-legge-txt-maestro.md) |
| `20260623-PLAN-DAT-RT-01 epub-primary-migration` | 2026-06-23 | Migración EPUB-primary runtime | shipped | [20260623-PLAN-DAT-RT-01-epub-primary-migration.md](./20260623-PLAN-DAT-RT-01-epub-primary-migration.md) |

---

## Familia MUT — Mutación IA / líneas cambiantes

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `20260614-AUD-MUT-01 changing-lines` | 2026-06-14 | Líneas mutantes I Ching | closed | [20260614-AUD-MUT-01-changing-lines.md](./20260614-AUD-MUT-01-changing-lines.md) |
| `20260615-AUD-MUT-02 prompt-mutation-gates` | 2026-06-15 | Reglas mutación + gates H1–H5 | closed | [20260615-AUD-MUT-02-prompt-mutation-gates.md](./20260615-AUD-MUT-02-prompt-mutation-gates.md) |
| `20260619-AUD-MUT-03 huang-rules-alignment` | 2026-06-19 | Alineación reglas Huang | closed | [20260619-AUD-MUT-03-huang-rules-alignment.md](./20260619-AUD-MUT-03-huang-rules-alignment.md) |
| `20260622-AUD-MUT-04 mutation-rules-pdf-gold` | 2026-06-22 | Reglas mutación vs PDF gold | closed | [20260622-AUD-MUT-04-mutation-rules-pdf-gold.md](./20260622-AUD-MUT-04-mutation-rules-pdf-gold.md) |
| `20260622-AUD-MUT-05 retry-fallback-economics` | 2026-06-22 | Economía reintentos vs fallback | decided | [20260622-AUD-MUT-05-retry-fallback-economics.md](./20260622-AUD-MUT-05-retry-fallback-economics.md) |

**Tests:** `QA-MUT-001`, `TS-ENG-002`, `TS-CLAUDE-001`…`004`, `AU-MUT-001`…`002`

---

## Familia DIV — Métodos de tirada

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `00000000-AUD-DIV-01 divination-methods` | 2026-05-19 | Métodos adivinación (referencia matemática) | closed | [00000000-AUD-DIV-01-divination-methods.md](./00000000-AUD-DIV-01-divination-methods.md) |
| `20260625-AUD-DIV-02 wilhelm-appendix-casting-methods` | 2026-06-25 | Métodos vs apéndice Wilhelm TXT (book-primary) | open | [20260625-AUD-DIV-02-wilhelm-appendix-casting-methods.md](./20260625-AUD-DIV-02-wilhelm-appendix-casting-methods.md) |
| `20260625-AUD-DIV-03 oracle-bones-keightley` | 2026-06-25 | Huesos vs Keightley PDF (cerrada: homenaje simbólico, no aplica book-primary) | closed | [20260625-AUD-DIV-03-oracle-bones-keightley.md](./20260625-AUD-DIV-03-oracle-bones-keightley.md) |
| `20260625-BRIEF-DIV-04 keightley-procedural-reference` | 2026-06-25 | Referencia procedimental Keightley (Ping-pien 8 + §3.7 12–21) | reference | [20260625-BRIEF-DIV-04-keightley-procedural-reference.md](./20260625-BRIEF-DIV-04-keightley-procedural-reference.md) |
| `20260625-BRIEF-DIV-05 guia-bones-sources-trace` | 2026-06-25 | Guía/notas: trazabilidad bibliografía huesos → fuentes externas | reference | [20260625-BRIEF-DIV-05-guia-bones-sources-trace.md](./20260625-BRIEF-DIV-05-guia-bones-sources-trace.md) |
| `20260625-AUD-DIV-04 oracle-bones-product-support` | 2026-06-25 | Huesos: matriz respaldo producto actual vs Keightley/Wikipedia/bibliografía (cerrada, decisión de negocio) | closed | [20260625-AUD-DIV-04-oracle-bones-product-support.md](./20260625-AUD-DIV-04-oracle-bones-product-support.md) |
| `00000000-RPT-DIV-00 procedural-integrity-summary` | — | **Fuentes de verdad procedurales** (monedas, varas, reglas Huang/Zhu Xi) | reference | [00000000-RPT-DIV-00-procedural-integrity-summary.md](./00000000-RPT-DIV-00-procedural-integrity-summary.md) |

**Gold:** `tools/source-pdfs/The I Ching or Book of Changes - Wilhelm-Appendix.txt` · **Tests:** `TS-ENG-001`, `VF-DIV-001 divination-wilhelm-appendix` (G1-G7, exacto)

---

## Familia RDG-QA — Calidad interpretación

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `20260623-AUD-RDG-QA-01 judgment-regression` | 2026-06-23 | QA 128 lecturas: regresión judgment/image | mitigated | [20260623-AUD-RDG-QA-01-judgment-regression.md](./20260623-AUD-RDG-QA-01-judgment-regression.md) |
| `20260624-AUD-RDG-QA-02 verbatim-blockquote-gap` | 2026-06-24 | Gap verbatim blockquote; Gate H7 | mitigated | [20260624-AUD-RDG-QA-02-verbatim-blockquote-gap.md](./20260624-AUD-RDG-QA-02-verbatim-blockquote-gap.md) |

**Tests:** `QA-RDG-001`, `TS-CLAUDE-004`

---

## Familia LRS — Line reading system (Huang / Zhu Xi)

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `20260620-AUD-LRS-01 zhuxi-line-reading-selector` | 2026-06-20 | Selector Huang/Zhu Xi (074) | closed | [20260620-AUD-LRS-01-zhuxi-line-reading-selector.md](./20260620-AUD-LRS-01-zhuxi-line-reading-selector.md) |
| `20260622-PLAN-LRS-02 zhuxi-32-charts-plan` | 2026-06-22 | Plan 32 cartas Zhu Xi | closed | [20260622-PLAN-LRS-02-zhuxi-32-charts-plan.md](./20260622-PLAN-LRS-02-zhuxi-32-charts-plan.md) |

---

## Familia LIB — Biblioteca hexagramas

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `20260623-PLAN-LIB-01 library-commentary-layer` | 2026-06-23 | Capa comentario W+L | closed | [20260623-PLAN-LIB-01-library-commentary-layer.md](./20260623-PLAN-LIB-01-library-commentary-layer.md) |
| `20260623-FIX-LIB-02 library-title-fidelity` | 2026-06-23 | Fix campo `name` biblioteca | closed | [20260623-FIX-LIB-02-library-title-fidelity.md](./20260623-FIX-LIB-02-library-title-fidelity.md) |
| `20260624-PLAN-LIB-03 library-ribbon-ui-fix` | 2026-06-24 | UI acordeón ribbon comentario | closed | [20260624-PLAN-LIB-03-library-ribbon-ui-fix.md](./20260624-PLAN-LIB-03-library-ribbon-ui-fix.md) |

---

## Familia SUP — Supabase / estabilidad

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `20260607-INC-SUP-INC-01 consultation-content-wipe` | 2026-06-07 | **P0** wipe `consultation_content` | closed | [20260607-INC-SUP-INC-01-consultation-content-wipe.md](./20260607-INC-SUP-INC-01-consultation-content-wipe.md) |
| `00000000-AUD-SUP-01 supabase-db-stability` | — | Estabilidad DB por fases | open | [00000000-AUD-SUP-01-supabase-db-stability.md](./00000000-AUD-SUP-01-supabase-db-stability.md) |
| `00000000-AUD-SUP-02 warp-timeout-kills` | — | Warp / timeout PostgREST (cerrada: Fase 8 confirmada en producción 2026-06-25) | closed | [00000000-AUD-SUP-02-warp-timeout-kills.md](./00000000-AUD-SUP-02-warp-timeout-kills.md) |

**Runbooks:** `RUN-SUP-01`…`05` · **Planes:** [`PLAN-SUP-07`](../plans/00000000-PLAN-SUP-07-scale-infrastructure.md), [`PLAN-SUP-08`](../plans/00000000-PLAN-SUP-08-anti-warp-serialize-burst.md) · Índice global: [`docs/INDEX.md`](../INDEX.md)

---

## Familia MOB — Mobile / WebView

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `00000000-AUD-MOB-HYD-01 chat-thread-hydration` | — | Hidratación hilos chat | closed | [00000000-AUD-MOB-HYD-01-chat-thread-hydration.md](./00000000-AUD-MOB-HYD-01-chat-thread-hydration.md) |
| `00000000-AUD-MOB-HYD-02 sqlite-chat-hydration` | — | Caché SQLite mobile | closed | [00000000-AUD-MOB-HYD-02-sqlite-chat-hydration.md](./00000000-AUD-MOB-HYD-02-sqlite-chat-hydration.md) |
| `20260613-AUD-MOB-HYD-03 hydration-gate` | 2026-06-13 | Hydration gate per-session | closed | [20260613-AUD-MOB-HYD-03-hydration-gate.md](./20260613-AUD-MOB-HYD-03-hydration-gate.md) |
| `20260618-AUD-MOB-UI-01 webview-bottom-gap` | 2026-06-18 | Gap negro bajo composer APK | closed | [20260618-AUD-MOB-UI-01-webview-bottom-gap.md](./20260618-AUD-MOB-UI-01-webview-bottom-gap.md) |
| `20260619-AUD-MOB-NAV-01 router-navigate-race` | 2026-06-19 | Race `__rnNavigateTo` × Router | closed | [20260619-AUD-MOB-NAV-01-router-navigate-race.md](./20260619-AUD-MOB-NAV-01-router-navigate-race.md) |
| `20260619-FIX-MOB-PLAY-01 play-data-safety` | 2026-06-19 | Play Console Data Safety | closed | [20260619-FIX-MOB-PLAY-01-play-data-safety.md](./20260619-FIX-MOB-PLAY-01-play-data-safety.md) |

---

## Familia PRD / PERF / OBS / ANM / DOC / SEC / ARCH

| Código | Familia | Título | Estado | Documento |
|--------|---------|--------|--------|-----------|
| `20260613-AUD-PRD-01 pre-production-jun13` | PRD | Pre-producción jun 2026 | closed | [20260613-AUD-PRD-01-pre-production-jun13.md](./20260613-AUD-PRD-01-pre-production-jun13.md) |
| `20260616-AUD-PRD-02 general-pre-production` | PRD | Pre-producción general | closed | [20260616-AUD-PRD-02-general-pre-production.md](./20260616-AUD-PRD-02-general-pre-production.md) |
| `20260612-AUD-PERF-01 claude-image-performance` | PERF | Perf Claude/imágenes | closed | [20260612-AUD-PERF-01-claude-image-performance.md](./20260612-AUD-PERF-01-claude-image-performance.md) |
| `20260614-AUD-OBS-01 observability-logging` | OBS | Logging / Axiom | closed | [20260614-AUD-OBS-01-observability-logging.md](./20260614-AUD-OBS-01-observability-logging.md) |
| `20260619-AUD-OBS-02 axiom-login-spike` | OBS | Spike tráfico `/login` | closed | [20260619-AUD-OBS-02-axiom-login-spike.md](./20260619-AUD-OBS-02-axiom-login-spike.md) |
| `20260613-PLAN-ANM-01 animation-plan-v3` | ANM | Plan animación v3 | reference | [20260613-PLAN-ANM-01-animation-plan-v3.md](./20260613-PLAN-ANM-01-animation-plan-v3.md) |
| `00000000-BRIEF-ANM-02 submit-reveal-redesign` | ANM | Brief submit/reveal | reference | [00000000-BRIEF-ANM-02-submit-reveal-redesign.md](./00000000-BRIEF-ANM-02-submit-reveal-redesign.md) |
| `20260614-AUD-ANM-03 tick-pacing` | ANM | Tick pacing ritual | closed | [20260614-AUD-ANM-03-tick-pacing.md](./20260614-AUD-ANM-03-tick-pacing.md) |
| `20260622-AUD-DOC-01 user-docs-vs-implementation` | DOC | Docs producto vs código | closed | [20260622-AUD-DOC-01-user-docs-vs-implementation.md](./20260622-AUD-DOC-01-user-docs-vs-implementation.md) |
| `20260625-PLAN-DOC-04 audits-timeline-ui` | DOC | Plan timeline único `/audits` | closed | [20260625-PLAN-DOC-04-audits-timeline-ui.md](./20260625-PLAN-DOC-04-audits-timeline-ui.md) |
| `20260616-AUD-SEC-01 npm-dependencies` | SEC | Dependencias npm | open | [20260616-AUD-SEC-01-npm-dependencies.md](./20260616-AUD-SEC-01-npm-dependencies.md) |
| `00000000-RPT-ARCH-01 architecture-fullstack` | ARCH | Arquitectura full-stack | reference | [00000000-RPT-ARCH-01-architecture-fullstack.md](./00000000-RPT-ARCH-01-architecture-fullstack.md) |
| `00000000-AUD-SYM-01 dynamic-symbols` | SYM | Símbolos dinámicos | closed | [00000000-AUD-SYM-01-dynamic-symbols.md](./00000000-AUD-SYM-01-dynamic-symbols.md) |
| `00000000-RPT-LEG-01 legacy-general-report` | LEG | Reporte general legacy | reference | [00000000-RPT-LEG-01-legacy-general-report.md](./00000000-RPT-LEG-01-legacy-general-report.md) |

---

## Runbooks indexados (tipo RUN)

| Código | Título | Path |
|--------|--------|------|
| `00000000-RUN-SUP-01 migration-data-integrity` | Integridad datos migraciones | [00000000-RUN-SUP-01-migration-data-integrity.md](../runbooks/00000000-RUN-SUP-01-migration-data-integrity.md) |
| `00000000-RUN-SUP-02 supabase-scalability` | Escalabilidad Supabase | [00000000-RUN-SUP-02-supabase-scalability.md](../runbooks/00000000-RUN-SUP-02-supabase-scalability.md) |
| `00000000-RUN-SUP-03 smoke-post-small` | Smoke post-Small | [00000000-RUN-SUP-03-smoke-post-small.md](../runbooks/00000000-RUN-SUP-03-smoke-post-small.md) |
| `00000000-RUN-SUP-04 post-restart` | Post-restart Supabase | [00000000-RUN-SUP-04-post-restart.md](../runbooks/00000000-RUN-SUP-04-post-restart.md) |
| `00000000-RUN-SUP-05 recover-pitr` | Recuperación PITR content | [00000000-RUN-SUP-05-recover-pitr.md](../runbooks/00000000-RUN-SUP-05-recover-pitr.md) |

**Plan infra:** [`00000000-PLAN-SUP-07-scale-infrastructure.md`](../plans/00000000-PLAN-SUP-07-scale-infrastructure.md) (`PLAN-SUP-07`) — runbook anti-Warp burst pendiente de archivo dedicado; ver [`00000000-AUD-SUP-02-warp-timeout-kills.md`](./00000000-AUD-SUP-02-warp-timeout-kills.md).

---

## Familia REPO — Inventario repositorio

| Código | Fecha | Título | Estado | Documento |
|--------|-------|--------|--------|-----------|
| `20260625-AUD-REPO-01 repo-root-inventory` | 2026-06-25 | Inventario raíz + limpieza residuos patch JS | closed | [20260625-AUD-REPO-01-repo-root-inventory.md](./20260625-AUD-REPO-01-repo-root-inventory.md) |

**Tests:** `VF-DOC-002`, `QA-LRS-001`, `QA-RDG-002`

---

## Alta rápida

1. Asignar código en [`registry.json`](./registry.json).
2. Añadir fila en la familia correspondiente de este índice.
3. Primera línea del `.md`: `**Código:** \`…\` · **Familia:** … · **Estado:** …`
4. Enlazar tests QA si aplica.

Ver [`CONVENTIONS.md`](./CONVENTIONS.md) para tipos, familias y estados.
