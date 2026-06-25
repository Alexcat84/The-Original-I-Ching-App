# Plan de Implementación DEFINITIVO (v3) — Streaming Server-Side + Reveal por Animación + Typewriter
**Código:** `20260613-PLAN-ANM-01 animation-plan-v3` · **Familia:** ANM · **Estado:** reference

## The Original I Ching App

| Campo | Valor |
|---|---|
| **Fecha** | 2026-06-13 |
| **Commit base** | `51f4546` |
| **Commit implementación** | `60dbee4` (Actions 2–7) · `b94e7bc` (Acción 1 TDZ) |
| **Commit fixes menores** | ver §10 más abajo |
| **Sustituye a** | `AUDIT_2026-06-13_animation-plan-v2-final.md` |
| **Incorpora** | Correcciones de dos auditorías de factibilidad independientes + auditoría de verificación post-implementación |
| **Enfoque** | Streaming **encendido server-side** (imagen paralela, total ~52 s); el cliente **no** pinta deltas; la animación gobierna el tiempo; reveal con typewriter acotado. |
| **Evidencia operativa** | Logs de Axiom confirman `ANTHROPIC_STREAM_DELTAS` y `ANTHROPIC_PARALLEL_IMAGE` **activos en producción** (`theoriginaliching.com`, commit `51f4546`). El TDZ **se está disparando ahora** en cada consulta stream_ritual — **Acción 1 es hotfix P0 inmediato.** |
| **Estado** | ✅ Acciones 1–7 implementadas y verificadas · ⏳ Acción 8 diferida (golden set N≥50) |

---

## 0. Cambios respecto a v2 (de las dos auditorías)

| # | Corrección | Origen | Estado |
|---|---|---|---|
| C1 | **Acción 3 NO es "quitar streamingText" — es un rediseño del ciclo submit→reveal** | Auditoría 2 | ✅ Verificado en código |
| C2 | **Reutilizar `useProgressiveRevealSubstring` existente** (no crear `TypewriterReveal` nuevo) | Auditoría 2 | ✅ Verificado (hook existe, 2.2–7.5 s por párrafos) |
| C3 | `dataReady` debe dispararse **dentro** del handler `final_ready` (L3848), no post-loop | Auditoría 2 | ✅ Verificado |
| C4 | Watchdog **relativo**: `max(budget × 2.5, 120_000)`, coordinado con `attemptThreadRecovery` | A1 (fórmula) + A2 (coordinación) | Adoptado |
| C5 | Validar `final_ready`: `imageUrl` puede ser null — shimmer/fallback | Auditoría 1 | Adoptado |
| C6 | Extender la máquina de estados a **huesos (JSON, no SSE)**; **manual cast fuera de alcance** | Auditoría 2 | Adoptado |
| C7 | Re-estimación realista **~22–30 h**, Acción 3 dominante | Auditoría 2 | Adoptado |

---

## 1. ACCIÓN 1 — Hotfix TDZ + Sentry (P0, primero, ya en producción)

**Por qué da valor al usuario:** sin este fix, `final_ready` lanza `Cannot access 'imagePrompt' before initialization` **después** de que la interpretación ya se generó y persistió; el cliente recibe `error` y la respuesta **desaparece de pantalla**. Es la causa directa de que el usuario vea su lectura y luego se borre. Confirmado en Axiom en producción.

**Diagnóstico verificado:** en el path streaming (IIFE `void (async () => {…})()`, L1112), `final_ready` (L1425) referenciaba `imagePrompt`, declarada solo en el path JSON (L1506, cuerpo de `POST`). La referencia resolvía por closure a esa binding sin ejecutar — TDZ. El fix declara `imagePrompt` en el scope del IIFE (sombra legal, sin redeclaración con L1506).

### Cambios exactos (archivo: `apps/web/src/app/api/consult/route.ts`)

> Patch aplicado: `action-1-tdz-sentry.patch` (`git apply action-1-tdz-sentry.patch`).  
> **Estado: ✅ APLICADO** en rama `fix/tdz-image-prompt-sentry`.

**1a — Declarar `imagePrompt` una vez y reutilizarlo (fix TDZ).** Tras el cierre del objeto `imageParams` (`} as const;`) y antes de `let image = await (…)`:

```ts
// TDZ fix (audit 2026-06-13): `imagePrompt` is referenced by the
// `final_ready` event below, but was only declared in the non-streaming
// path. Declare it once here in the streaming scope and reuse it for the
// sequential build, the B3 rebuild, and the final_ready payload.
const imagePrompt = buildImagePrompt(
  castResult.primaryHexagram,
  castResult.transformedHexagram,
  category,
  castResult.changingLines,
  castResult.lines,
  castResult.id,
);
```

Y reemplazar las **dos** llamadas inline a `buildImagePrompt(...)` (en la rama de mismatch del ternario y en el rebuild B3) por `prompt: imagePrompt`:

```ts
let image = await (parallelImagePromise && parallelImageCategory === category
  ? (ritualLog("parallel_image:await", { category }), parallelImagePromise)
  : (() => {
      if (parallelImagePromise) ritualLog("parallel_image:category_mismatch", { expected: parallelImageCategory, got: category });
      return buildImageAsset({ prompt: imagePrompt, ...imageParams });
    })()
);

if (!image) {
  ritualLog("parallel_image:failed_rebuild", { category });
  image = await buildImageAsset({ prompt: imagePrompt, ...imageParams });
}
```

**1b — Sentry en el catch streaming.** En `catch (streamError)`, tras `console.error("[api/consult][stream_ritual]", streamError)`:

```ts
Sentry.captureException(streamError, {
  tags: { api: "consult", mode: "stream_ritual" },
});
```

(`import * as Sentry from "@sentry/nextjs"` ya existe en L1.)

**Verificación post-fix:** confirmar en Axiom que desaparece `stream_consult_error: Cannot access 'imagePrompt'…` y que un error inducido aparece en Sentry.

---

## 2. ACCIÓN 2 — Presupuesto segmentado por modo + traductor

Nuevo `apps/web/src/lib/ritual-budget-store.ts`:

```ts
type RitualKey =
  | "iching:wilhelm" | "iching:legge" | "iching:zhouyi" | "iching:master_combined"
  | "bones";

const SEED_MS: Record<RitualKey, number> = {
  "iching:wilhelm": 40_000, "iching:legge": 40_000, "iching:zhouyi": 40_000,
  "iching:master_combined": 58_000,   // síntesis de 3 fuentes = más largo
  "bones": 25_000,
};
// localStorage "ritual_budget_v1:{key}" → ms medidos hasta final_ready (clamp 8s–120s)
export function getRitualBudget(key: RitualKey): number;     // measured ?? seed, clamped
export function recordRitualBudget(key: RitualKey, ms: number): void;
```

**Migración (C1 de A1):** `lastIchingConsultWallMsRef` se usa en **4 sitios** (`page.tsx` L3549, L3782, L4072, L4144). Los cuatro migran a `getRitualBudget(key)` / `recordRitualBudget(key, measured)`, con `key` compuesta de modo + `translatorId` real del request (`wilhelm`|`legge`|`zhouyi`|`master_combined`). El ref puede **coexistir como caché en sesión** sobre el store para evitar leer localStorage en hot paths. El `measured` es la pared hasta `final_ready` (texto + imagen).

---

## 3. ACCIÓN 3 — Rediseño del ciclo submit→reveal (núcleo, ~12–16 h)

**No es "quitar `streamingText`".** Hoy (`page.tsx`):
- `final_ready` solo **guarda** `finalPayload` dentro del loop SSE (L3850).
- La transición a lectura ocurre **post-loop**, inmediata: `updateActiveSession` (L4088), `setRevealConsultationId` (L4119), `setPhase("reading")` (L4154), `setLoading(false)` (L4188). Por eso la animación se corta apenas llega la respuesta.

Cambios:

1. **(C3) Disparar la señal dentro del handler `final_ready` (L3848)**, no post-loop: al parsear `final_ready`, guardar payload en ref, marcar `dataReady = true` y llamar `tryAdvanceToFinale()` **mientras los ticks siguen corriendo**.
2. **Diferir la transición de lectura:** mover `updateActiveSession` / `setRevealConsultationId` / `setPhase("reading")` / `setLoading(false)` para que se ejecuten **dentro de `tryAdvanceToFinale()`**, solo cuando `dataReady && buildMinSatisfied`. Mantener `phase === "coins"|"bones"` y `loading === true` durante la espera.
3. **Eliminar render progresivo:** quitar el handler `oracle_delta` (L3827–3837) y el render de `streamingText` (L4899–4907); el estado `streamingText`, `streamingDeltaAccRef`, `streamingFlushTimerRef` se eliminan. El texto del reveal viene de `final_ready.interpretation`.
4. **(C5) Validar el payload:** `interpretation` presente (si no → error/retry); `imageUrl` puede ser null → shimmer/fallback en el slot de imagen, no romper el reveal.

Máquina de estados (única señal autoritativa = `dataReady`):

```
onConsultStart(mode, translator): budget=getRitualBudget(key); startBuildStage(budget); dataReady=false
onFinalReady(payload):  // DENTRO del handler SSE (C3)
   if (!payload.interpretation) return onStreamError("incomplete")
   data=payload; dataReady=true; tryAdvanceToFinale()
onJsonResponse(body):    // (C6) huesos / auto-JSON: el trigger es el body completo
   data=body; dataReady=true; tryAdvanceToFinale()
tick/onBuildBudgetElapsed: if(!dataReady) holdBuildStage() else tryAdvanceToFinale()
tryAdvanceToFinale():
   if(!dataReady || !buildMinSatisfied()) return
   playFinale(data) → onFinaleMinDwellDone(() => revealWithTypewriter(data))
   commitReadingTransition(data)   // updateActiveSession/setPhase/setLoading DIFERIDOS aquí
```

---

## 4. ACCIÓN 4 — Pisos por etapa

| Modo | Etapa | Parámetro (env `NEXT_PUBLIC_*`) | Default |
|---|---|---|---|
| I Ching | Líneas (12 ticks) | `MIN_TICK` / `MAX_TICK` (existen) | 520 / 3000 ms |
| I Ching | Formación hexagrama | `ICHING_FINALE_MIN_MS` (nuevo) | 1200 ms |
| Huesos | Fuego | `BONES_FIRE_MIN_MS` (nuevo) | 2500 ms |
| Huesos | Grieta | `BONES_CRACK_MS` (de `CRACK_FADE_IN_MS`) | 900 ms |
| Huesos | Reveal | `BONES_REVEAL_MS` (de `REVEAL_HOLD_MS`) | 700 ms |

Nota: hoy el finale de I Ching ocurre tras los ticks sin espera; con los pisos + gate, el comportamiento cambia (espera `dataReady`). Es intencional.

---

## 5. ACCIÓN 5 — Typewriter: extender el hook existente (C2)

**No crear componente nuevo.** Ya existe `apps/web/src/hooks/useProgressiveRevealSubstring.ts` (revela markdown por párrafos en `min(7500, max(2200, len×22))` ms), usado en `InterpretationBody` (L414).

- **Parametrizar la duración por llamada** (no global, para no alterar el reveal del path no-streaming): aceptar `{ msPerChar, minMs, maxMs }`. Defaults para el reveal post-animación: `msPerChar ≈ 1.2`, `minMs = 1200`, `maxMs = 3500`.
- Mantener la granularidad **por párrafo/sección** (`\n\n`) que el hook ya usa — ~5–8 re-renders del markdown, no N (evita el problema de WebView que señaló A1).
- Respetar `prefers-reduced-motion` — texto de golpe. Flag `NEXT_PUBLIC_TYPEWRITER_ENABLED`.
- **Orden / imagen:** la imagen ya está lista en `final_ready` (antes del reveal visual por el gate). Mostrar shimmer hasta iniciar el typewriter y revelar la imagen al comenzar a "escribir" (o al terminar) — decisión de UX, pero **no** dejar la imagen esperando indefinidamente.

---

## 6. ACCIÓN 6 — Watchdog + manejo de error (coordinado con recovery) (C4)

- **Watchdog relativo:** `watchdogMs = max(budget × 2.5, 120_000)`. Un M3 (budget ~58 s) → ~145 s; un individual (~40 s) → ~120 s. Evita falsos positivos en consultas profundas legítimas (recordar `maxDuration = 300` en server).
- **Coordinación con `attemptThreadRecovery`** (RCA 2026-06-12, ya existe en EOF limpio y en catch): orden **watchdog → recovery → error**. No mostrar error si recovery está en curso.
- Evento `error` del stream → detener animación, mostrar reintento. Si `persist_done` ocurrió, la lectura está en DB y se recupera al recargar.

---

## 7. Reducción del tiempo

1. Imagen paralela conservada (streaming ON): ~52 s vs ~70–78 s secuencial.
2. **`ANTHROPIC_PROMPT_V2`** tras golden set N≥50: cachea texto canónico + system prompt — menor TTFT/costo (independiente de este plan).
3. Presupuesto preciso por traductor — sin "hold muerto".
4. Pisos cortos + typewriter acotado — respuestas rápidas revelan pronto.

---

## 8. Criterios de aceptación

1. **I Ching individual / Master 3 / huesos:** etapas completas, sin pintar deltas durante la animación, reveal con typewriter, imagen presente.
2. **TDZ resuelto:** sin `stream_consult_error: Cannot access 'imagePrompt'…` en Axiom; errores futuros llegan a Sentry.
3. **Respuesta rápida (cacheada):** pisos se cumplen, sin flash del hilo.
4. **Respuesta lenta (M3 + contexto largo):** build sostiene hasta `dataReady`; nada se adelanta al dato; watchdog no dispara falso positivo (~145 s).
5. **Stream error / watchdog → recovery → error:** sin pantalla colgada; sin error si recovery activo.
6. **Cambio de traductor:** presupuesto no contaminado (validar `key` con `translatorId` real).
7. **Huesos (JSON):** mismo gate, trigger = body completo.
8. **`prefers-reduced-motion`:** texto de golpe.
9. **#11 (A2):** con respuesta a ~52 s, la UI permanece en fase ritual hasta `build-min + finale + typewriter` — sin flash del hilo antes.
10. **Imagen:** medir `assets_ready` vs wall-clock del cliente (persist va después de oracle_ready).
11. **Fuera de alcance (C6):** manual cast I Ching (usa JSON + `ICHING_MANUAL_FINALE_*`) — los criterios 1–5 aplican a auto + stream_ritual + bones JSON.

---

## 9. Acciones, esfuerzo y secuencia

| # | Acción | Esfuerzo | Prioridad | Depende de |
|---|---|---|---|---|
| 1 | **Fix TDZ + Sentry** (hotfix P0, ya en prod) | ~30 min | **Crítica, primero** | — |
| 2 | Store de presupuesto segmentado | 2–3 h | Alta | — |
| 3 | **Rediseño submit→reveal + gate** | **12–16 h** | Alta (núcleo) | 1 |
| 4 | Pisos por etapa | 2–3 h | Media | — |
| 5 | Extender `useProgressiveRevealSubstring` + reduced-motion | 2–4 h | Media | 3 |
| 6 | Watchdog relativo + coordinación recovery | 3–4 h | Alta | 3 |
| 7 | (Opcional) suprimir deltas al cliente | 1 h | Baja | 1 |
| 8 | `ANTHROPIC_PROMPT_V2` tras golden set | — | Media | golden set |

**Total realista: ~22–30 h**, con la Acción 3 como trabajo dominante.  
**Orden:** 1 (ya, hotfix) → 2 → 3 → (4 + 6) → 5 → 7 → 8.

---

## 10. Verificación post-implementación (HEAD `9209da5`, 2026-06-13)

Auditoría independiente de los siete cambios contra código en main. Todas las acciones verificadas como correctas e internamente consistentes.

### Verificación por acción

| Acción | Veredicto | Notas clave |
|---|---|---|
| 1 — TDZ + Sentry | ✅ | `imagePrompt` declarada en scope streaming (L1292), reutilizada en 2 sitios (L1305, L1314). `Sentry.captureException` en catch (L1442). |
| 2 — Budget store | ✅ | Keys correctas, seeds (40s/58s/25s), clamp 8–120s, localStorage prefijado, try/catch SSR-safe. 4 sitios migrados: `lastIchingConsultWallMsRef.current ?? getRitualBudget(key)`. `recordRitualBudget` persiste por traductor en L4151. |
| 3 — Gate submit→reveal | ✅ | Más elegante que el brief: `await revealPromise + dwell` post-loop en lugar de máquina de estados. La salida del loop = señal de datos listos. `max(respuesta, animación) + 1.2s`. Early-return de error antes del await (L3886) — error no cuelga. |
| 4 — Pisos | ✅ | `ICHING_FINALE_MIN_MS=1200` (L142), `BONES_FIRE_MIN_MS=2500` (L146), ambos con override `NEXT_PUBLIC_*`. |
| 5 — Typewriter | ✅ | `RevealOptions { msPerChar, minMs, maxMs }`, `prefers-reduced-motion` vía `matchMedia`, `NEXT_PUBLIC_TYPEWRITER_ENABLED`. Default `msPerChar ?? 22` preserva comportamiento previo. No duplicó componente. |
| 6 — Watchdog | ✅ | `watchdogMs = max(budget×2.5, 120_000)` (L3640). `AbortController.signal` pasado al fetch (L3711). `.abort()` en timeout (L3646). Cleanup en `finally` (L4186–4190). Abort → catch → `attemptThreadRecovery`. Orden correcto. |
| 7 — streamingText eliminado | ✅ | Estado y refs (`streamingDeltaAccRef`, `streamingFlushTimerRef`) removidos. Sin referencias colgantes. |

**Vinculación de huesos confirmada:** `isProcessing={loading && boneRitualResult === null}` — `setBoneRitualResult(verdict)` voltea `isProcessing`. Crack+reveal del componente (~1600ms) cabe dentro del dwell `BONES_FIRE_MIN_MS` (2500ms).

### Observaciones menores — acciones aplicadas post-auditoría

| # | Observación | Fix aplicado |
|---|---|---|
| O1 | `BONES_FIRE_MIN_MS` es dwell post-respuesta, no piso real sobre el fuego. Respuesta cacheada → fuego apenas visible. | **Fix:** `boneAnimationStartMs` tracking antes de `setPhase("bones")`. Dwell = `max(0, BONES_FIRE_MIN_MS − elapsed)`. ✅ |
| O2 | `getRitualBudget` con key desconocida devuelve `undefined` (SEED_MS miss). | **Fix:** `SEED_MS[key] ?? 40_000` hardguard. ✅ |
| O3 | `prefersReduced` evaluado en cada render (matchMedia en hot-path). | **Fix:** Wrapped en `useMemo([], ...)` — evaluado una sola vez. ✅ |
| O4 | Seed individual 40s < 48s medido en producción → finale sostiene más en 1ª consulta. | **Acción futura:** tras medir N≥10, ajustar seed a ~46–48s o calibrar `PHASE1_WEIGHT`/`PHASE2_WEIGHT`. No bloqueante. |

### Foco de pruebas en Android real

| Caso | Qué observar |
|---|---|
| 1ª consulta sesión con M3 (seed 58s) | ¿Finale sostiene tiempo excesivo? Medir wall-clock real para calibrar seed |
| Respuesta cacheada/rápida | ¿Animación se siente larga? (`recordRitualBudget` auto-corrige en 2ª consulta) |
| Huesos respuesta lenta vs instantánea | ¿Fuego visible ≥2.5s desde start? (O1 fix) |
| Cortar red a mitad → watchdog | Spinner desaparece en ≤120s + recovery sin pantalla colgada |
| `prefers-reduced-motion` activo | Texto aparece de golpe, sin animación |

**Acción 8:** Correctamente diferida. Requiere golden set N≥50 de consultas medidas para calibrar prompt cache y tiempos TTFT. No es pendiente bloqueante — es secuenciado tras las pruebas de producción.

---

*Plan v3 generado el 2026-06-13 sobre el commit `51f4546`. Acciones 1–7 implementadas en `b94e7bc` + `60dbee4`. Fixes menores (O1–O3) aplicados post-auditoría independiente.*
