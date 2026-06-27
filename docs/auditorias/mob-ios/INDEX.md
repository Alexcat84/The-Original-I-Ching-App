# MOB-IOS — Lanzamiento iOS App Store

**Familia:** `MOB-IOS` · **Colección:** `docs/auditorias/mob-ios/`  
**Rama de trabajo:** `feature/ios-app-store-launch` (base: `staging`)  
**Registro:** [`../registry.json`](../registry.json) · Índice global: [`../INDEX.md`](../INDEX.md)

Subcategoría **exclusiva** para documentación del lanzamiento en iOS App Store: planes maestro e implementación, auditorías post-merge, gates de revisión y ops de release. Todo documento nuevo de este hilo vive aquí, no en `docs/plans/` sueltos.

---

## Flujo de aprobación (2026-06-27)

```text
PLAN-MOB-IOS-01 (maestro) → PLAN-MOB-IOS-02 v1.0 (Fase 2 detallada)
  → revisión Claude → ajustes → aprobación Alex
  → implementación Cursor (solo Fase 2 §4.1–4.7)
  → auditoría Claude vs matriz de trazabilidad
  → merge Alex a staging (manual)
```

**Regla:** sin luz verde explícita post-revisión, **no** se implementa código ni se mergea a `staging`/`main`.

---

## Documentos

| Código | Versión | Título | Estado | Documento |
|--------|---------|--------|--------|-----------|
| `20260627-PLAN-MOB-IOS-01 ios-app-store-launch` | — | Plan maestro lanzamiento iOS (fases 0–6) | open | [20260627-PLAN-MOB-IOS-01-ios-app-store-launch.md](./20260627-PLAN-MOB-IOS-01-ios-app-store-launch.md) |
| `20260627-PLAN-MOB-IOS-02 fase2-implementation-plan-v1` | **v1.0** | Plan de implementación Fase 2 (§4.1–4.7) | **reviewed — ajustes requeridos** | [20260627-PLAN-MOB-IOS-02-fase2-implementation-plan-v1.md](./20260627-PLAN-MOB-IOS-02-fase2-implementation-plan-v1.md) |

---

## Alcance por fase (referencia rápida)

| Fase | Responsable | Estado doc |
|------|-------------|------------|
| 0 — Decisiones negocio (D1–D6) | Alex | Cerradas en PLAN-01 §2 (D3–D6); D1–D2 pendientes humano |
| 1 — Cuentas Apple / RC / Supabase | Alex (portales) | Fuera de alcance Cursor |
| **2 — Código §4.1–4.7** | Cursor tras aprobación PLAN-02 | **En revisión (v1.0)** |
| 3 — Cumplimiento App Store | Alex + Cursor (copy) | Post Fase 2 |
| 4 — Build / TestFlight / QA | Alex | Post Fase 1+2 |
| 5 — Envío revisión | Alex | Post QA |
| 6 — Post-lanzamiento | Alex | Post publicación |

---

## Documentos futuros (reservados en esta carpeta)

| Tipo previsto | Cuándo |
|---------------|--------|
| `AUD-MOB-IOS-*` | Auditoría post-implementación Fase 2 vs PLAN-02 |
| `00000000-OPS-IOS-01 app-store-changelog` | Con item 4.6 (doc What's New App Store) |
| `GATE-MOB-IOS-*` | Criterios TestFlight / revisión Apple |

---

## Referencias externas a la colección

| Recurso | Path |
|---------|------|
| Play Store changelog (formato espejo) | [`docs/00000000-OPS-PLAY-01-play-store-changelog.md`](../../00000000-OPS-PLAY-01-play-store-changelog.md) |
| Play Data Safety (referencia privacy) | [`docs/auditorias/20260619-FIX-MOB-PLAY-01-play-data-safety.md`](../20260619-FIX-MOB-PLAY-01-play-data-safety.md) |
| Config mobile | `apps/mobile/app.config.js`, `apps/mobile/eas.json` |
