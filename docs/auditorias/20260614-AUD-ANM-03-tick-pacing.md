# Auditoría — Ajuste de pacing de animación ritual I Ching

**Código:** `20260614-AUD-ANM-03 tick-pacing` · **Familia:** ANM · **Estado:** closed

**Fecha:** 2026-06-14
**Rama:** `feat/animation-tick-pacing`
**Commit base:** `9209da5`
**Decisión de producto:** NO se toca el prompt (Stage 8 / `ANTHROPIC_PROMPT_V2`) — meses de calibración, riesgo de drift de calidad, y el costo ya es manejable (~$0.06–0.07/M3). Solo se ajusta el reparto de la animación.

---

## Contexto

Análisis de logs de Axiom de la consulta `master_combined` con `sessionPosition: 8`:

| Evento | Timestamp | elapsedMs |
|--------|-----------|-----------|
| `consult_phase: persist_start` | 00:42:56 | 92,402ms |
| `supabase_op: persist_consultation` | 00:42:57 | 798ms exec |
| `consult_phase: persist_done` | 00:42:57 | 93,222ms |
| `stream_consult_complete` | 00:42:57 | — |
| `consult_ritual: close` | 00:42:57 | 90,945ms |

**Tiempo total de API: ~93,222ms (93.2 segundos)**

El gap de 19s entre el fin de la consulta (00:42:57) y el siguiente integrity check (00:43:16) corresponde a tiempo de lectura del usuario.

---

## Problema identificado

Con el cap de tick anterior (3,000ms/tick) y un presupuesto real de 93s:

| | Antes | Después |
|--|-------|---------|
| Presupuesto fase 1 | 93,222 × 60/90 = 62,148ms | igual |
| Tick delay calculado | 62,148/12 = 5,179ms | igual |
| Cap aplicado | 3,000ms | 4,000ms |
| **Fase 1 total (ticks)** | **12 × 3,000 = 36,000ms** | **12 × 4,000 = 48,000ms** |
| **Fase 2 hold (hexagrama estático)** | **~57,222ms** | **~45,222ms** |

Con el seed anterior de `master_combined` (58,000ms), el sistema asignaba un presupuesto erróneo en la primera consulta de cada usuario. El seed correcto basado en medición real es ~90,000ms.

---

## Cambios aplicados

### Cambio 1 — Pacing de ticks

**`apps/web/src/lib/ritual-budget-store.ts`**
- Seed `iching:master_combined`: `58_000 → 90_000` (medición real M3 + contexto profundo)

**`apps/web/src/lib/iching-ritual-timing.ts`**
- `ICHING_RITUAL_TICK_DELAY_MAX_MS` default: `3000 → 4000`
- Actualizado doc comment: "Default: 4000"

Efecto neto con budget ~93s:
- Traductores individuales (Wilhelm/Legge/ZhouYi, budget ~40s, tick delay ~2,222ms): **sin cambio** — el raw delay ya está bajo el cap anterior.
- `master_combined` con contexto profundo: **+12,000ms de animación activa**, −12,000ms de hold estático.

### Cambio 2 — Finale "respirando" (flag OFF por defecto)

Da movimiento ambiental sutil al hexagrama del finale durante la fase 2, para que el hold de ~45s no sea completamente estático.

**`apps/web/src/lib/iching-ritual-timing.ts`** — nuevo export:
```ts
export const ICHING_FINALE_BREATHING =
  typeof process !== "undefined" &&
  (process.env.NEXT_PUBLIC_ICHING_FINALE_BREATHING === "1" ||
    process.env.NEXT_PUBLIC_ICHING_FINALE_BREATHING === "true");
```

**`apps/web/src/app/globals.css`** — keyframe + clase:
```css
@keyframes iching-finale-breathe {
  0%, 100% { transform: scale(1); opacity: 0.92; }
  50%       { transform: scale(1.018); opacity: 1;
              filter: drop-shadow(0 0 10px var(--ritual-glow, rgba(212,175,55,0.35))); }
}
.iching-finale-breathing {
  animation: ritualFinalBloom 520ms ease-out both, iching-finale-breathe 4.2s ease-in-out 600ms infinite;
  will-change: transform, opacity;
}
@media (prefers-reduced-motion: reduce) {
  .iching-finale-breathing { animation: ritualFinalBloom 520ms ease-out both; }
}
```

**`apps/web/src/app/page.tsx`** — clase condicional en el div `.ritual-final-focus`.

> No aplica a oracle-bones (su hold post-respuesta es corto, ~2.5s) ni al cast manual.

---

## Activación del Cambio 2

Actualmente inerte (flag OFF). Para activar en staging o producción:
```
NEXT_PUBLIC_ICHING_FINALE_BREATHING=1
```
Requiere redeploy (variable `NEXT_PUBLIC_*` se bake en el bundle en build time).

---

## Verificación

1. Build sin errores TypeScript.
2. Consulta M3 nueva sesión → ~48s de líneas antes del finale (vs 36s anteriores).
3. Traductor individual (Wilhelm/Legge/ZhouYi) → sin cambio perceptible (~27s).
4. Con `NEXT_PUBLIC_ICHING_FINALE_BREATHING=1` → hexagrama del finale "respira" durante el hold; con `prefers-reduced-motion` activo → estático.
5. Sin regresión en oracle-bones ni cast manual.
