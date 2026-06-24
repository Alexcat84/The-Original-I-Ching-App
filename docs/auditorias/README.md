# Project audits (`docs/auditorias/`)

Single canonical location for audit reports, incident write-ups, post-fix follow-ups, and pre-production reviews.  
(`docs/audits/` was merged here and removed.)

**Naming:** English filenames with `_AUDIT_` or `_INCIDENT_` suffix and date when applicable.

---

## Recent incidents & follow-ups

| Date | Document | Topic | Status |
|---|---|---|---|
| 2026-06-24 | [LIBRARY_COMMENTARY_RIBBON_UI_FIX_PLAN_2026-06-24.md](./LIBRARY_COMMENTARY_RIBBON_UI_FIX_PLAN_2026-06-24.md) | Biblioteca: plan corrección UI acordeón ribbon (Juicio/Imagen/Líneas), toggle +/− full-width, footer −, 12 mitigaciones | 🟡 Plan — pendiente implementación |
| 2026-06-24 | [READING_QUALITY_QA_VERBATIM_BLOCKQUOTE_GAP_AUDIT_2026-06-24.md](./READING_QUALITY_QA_VERBATIM_BLOCKQUOTE_GAP_AUDIT_2026-06-24.md) | Gap verbatim juicio/imagen: gates H1–H6 no cubrían cita literal; Gate H7 (warn + telemetría Sentry) implementado mismo día | 🟢 Mitigada — reintento diferido |
| 2026-06-23 | [HEXAGRAM_PINYIN_GOLD_GATE_2026-06-23.md](./HEXAGRAM_PINYIN_GOLD_GATE_2026-06-23.md) | Gate nuevo: pinyin derivado (pinyin-pro) vs hardcodeado, 64 hexagramas + 8 trigramas — sin discrepancias reales | ✅ Cerrada |
| 2026-06-23 | [LIBRARY_HEXAGRAM_TITLE_FIDELITY_FIX_2026-06-23.md](./LIBRARY_HEXAGRAM_TITLE_FIDELITY_FIX_2026-06-23.md) | Biblioteca: fix campo `name` (167 instancias rotas, nunca auditado) + orden "Fuente" + nota Legge fuera de caja | ✅ Cerrada |
| 2026-06-23 | [LIBRARY_COMMENTARY_LAYER_2026-06-23.md](./LIBRARY_COMMENTARY_LAYER_2026-06-23.md) | Biblioteca: capa de comentario opcional W+L ("+" por punto), sin tocar motor/IA | ✅ Implementado |
| 2026-06-23 | [TXT_MAESTRO_NOTES_AND_FIDELITY_2026-06-23.md](./TXT_MAESTRO_NOTES_AND_FIDELITY_2026-06-23.md) | Política: solo W+L con notas · fidelidad 100% book-primary · Zhou Yi sin notas | ✅ Cerrada |
| 2026-06-23 | [LEGGE_TXT_AU_MAESTRO_2026-06-23.md](./LEGGE_TXT_AU_MAESTRO_2026-06-23.md) | Maestro Legge TXT Princeton + AU + gates 4/4 (sin ingest runtime) | ✅ Cerrada |
| 2026-06-23 | [WILHELM_TXT_AU_MAESTRO_2026-06-23.md](./WILHELM_TXT_AU_MAESTRO_2026-06-23.md) | Maestro Wilhelm TXT Princeton + AU Sheets + gates 100/100 (sin ingest runtime) | ✅ Cerrada |
| 2026-06-23 | [EPUB_PRIMARY_MIGRATION_2026-06-23.md](./EPUB_PRIMARY_MIGRATION_2026-06-23.md) | Bundle runtime EPUB-primary Wilhelm/Legge | ✅ Shipped |
| 2026-06-23 | [READING_QUALITY_QA_JUDGMENT_REGRESSION_AUDIT_2026-06-23.md](./READING_QUALITY_QA_JUDGMENT_REGRESSION_AUDIT_2026-06-23.md) | QA 128 lecturas reales — Hallazgo 1 (regresión judgment/image) y Hallazgo 2 (plenitud duplicada) | 🟡 H1 resuelto vía EPUB-primary · H2 diferido |
| 2026-06-21 | [ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md](./ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md) | Re-auditoría 1:1 Wilhelm/Legge/Zhou Yi vs fuentes oro (Fases 3 to 4) | ✅ Cerrada |
| 2026-06-19 | [RN_NAVIGATE_TO_ROUTER_RACE_AUDIT_2026-06-19.md](./RN_NAVIGATE_TO_ROUTER_RACE_AUDIT_2026-06-19.md) | `__rnNavigateTo` × Next.js App Router race condition | ✅ Fixed |
| 2026-06-19 | [AXIOM_LOGIN_SPIKE_AUDIT_2026-06-19.md](./AXIOM_LOGIN_SPIKE_AUDIT_2026-06-19.md) | `/login` traffic spike — Google WRS crawl, not real logins | ✅ Diagnosed |
| 2026-06-19 | [AUDIT_2026-06-19_data-safety-resolucion.md](./AUDIT_2026-06-19_data-safety-resolucion.md) | Play Console Data Safety rejection (vc49, Device or other IDs) | ✅ Resolved |
| 2026-06-18 | [RN_WEBVIEW_CHAT_BOTTOM_GAP_AUDIT_2026-06-18.md](./RN_WEBVIEW_CHAT_BOTTOM_GAP_AUDIT_2026-06-18.md) | Black gap below composer on Release A APK | ✅ `e4b04e5` |
| 2026-06-16 | [GENERAL_PRE_PRODUCCION_2026-06-16.md](./GENERAL_PRE_PRODUCCION_2026-06-16.md) | General pre-production | ✅ Go with conditions |
| 2026-06-16 | [NPM_AUDIT_2026-06-16.md](./NPM_AUDIT_2026-06-16.md) | npm dependencies | 📋 |
| 2026-06-15 | [PROMPT_MUTATION_RULES_AUDIT_2026-06-15.md](./PROMPT_MUTATION_RULES_AUDIT_2026-06-15.md) | Mutation rules / H1–H5 gates | ✅ Phase 2 |
| 2026-06-14 | [ICHING_CHANGING_LINES_AUDIT_2026-06-14.md](./ICHING_CHANGING_LINES_AUDIT_2026-06-14.md) | Mutating lines | ✅ |
| 2026-06-14 | [OBSERVABILITY_LOGGING_AUDIT_2026-06-14.md](./OBSERVABILITY_LOGGING_AUDIT_2026-06-14.md) | Logging / Axiom | ✅ |
| 2026-06-14 | [ANIMATION_TICK_PACING_AUDIT_2026-06-14.md](./ANIMATION_TICK_PACING_AUDIT_2026-06-14.md) | Ritual / tick pacing | ✅ |
| 2026-06-13 | [HYDRATION_GATE_AUDIT_2026-06-13.md](./HYDRATION_GATE_AUDIT_2026-06-13.md) | Per-session hydration gate + RN SQLite | ✅ |
| 2026-06-13 | [PRE_PRODUCTION_AUDIT_2026-06-13.md](./PRE_PRODUCTION_AUDIT_2026-06-13.md) | Pre-production (Jun 2026) | ✅ |
| 2026-06-10+ | [WARP_TIMEOUT_KILLS_AUDIT.md](./WARP_TIMEOUT_KILLS_AUDIT.md) | Warp / PostgREST pool | 🟡 |
| — | [SUPABASE_DB_STABILITY_AUDIT.md](./SUPABASE_DB_STABILITY_AUDIT.md) | Supabase stability (phases) | 🟡 |
| 2026-06-07 | [INCIDENT_2026-06-07_CONSULTATION_CONTENT_WIPE.md](./INCIDENT_2026-06-07_CONSULTATION_CONTENT_WIPE.md) | P0 `consultation_content` wipe | ✅ 068 |

---

## Architecture & platform

| Document | Topic |
|---|---|
| [ARCHITECTURE_AUDIT.md](./ARCHITECTURE_AUDIT.md) | Full-stack architecture |
| [DATA_INTEGRITY_AUDIT.md](./DATA_INTEGRITY_AUDIT.md) | Data integrity |
| [DIVINATION_METHODS_AUDIT.md](./DIVINATION_METHODS_AUDIT.md) | Divination methods |
| [DYNAMIC_SYMBOLS_AUDIT.md](./DYNAMIC_SYMBOLS_AUDIT.md) | Dynamic symbols |
| [PERF_OPTIMIZATION_AUDIT_2026-06-12.md](./PERF_OPTIMIZATION_AUDIT_2026-06-12.md) | Claude/image perf phases |
| [AUDIT_2026-06-13_animation-plan-v3-DEFINITIVO.md](./AUDIT_2026-06-13_animation-plan-v3-DEFINITIVO.md) | Animation plan v3 |
| [BRIEF_accion-3_submit-reveal-redesign.md](./BRIEF_accion-3_submit-reveal-redesign.md) | Action 3 submit/reveal |
| [REPORTE_AUDITORIA_ICHING_APP.md](./REPORTE_AUDITORIA_ICHING_APP.md) | General audit report (legacy) |

---

## Mobile & chat hydration

| Document | Topic |
|---|---|
| [CHAT_THREAD_HYDRATION_AUDIT.md](./CHAT_THREAD_HYDRATION_AUDIT.md) | Thread hydration |
| [SQLITE_CHAT_HYDRATION_AUDIT.md](./SQLITE_CHAT_HYDRATION_AUDIT.md) | Mobile SQLite cache |

---

## Related runbooks

- [`docs/runbooks/MIGRATION_DATA_INTEGRITY.md`](../runbooks/MIGRATION_DATA_INTEGRITY.md)
- [`docs/runbooks/SUPABASE_SCALABILITY.md`](../runbooks/SUPABASE_SCALABILITY.md)
- [`docs/runbooks/SMOKE_POST_SMALL_CHECKLIST.md`](../runbooks/SMOKE_POST_SMALL_CHECKLIST.md)

---

## Adding a new document

1. Create the `.md` file in **`docs/auditorias/`** only.
2. Include: date, commits (regression + fix), symptom, root cause, fix, verification, status.
3. Link from this README and, when relevant, from `CLAUDE.md` or runbooks.
