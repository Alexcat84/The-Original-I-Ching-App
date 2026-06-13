# Auditoría de Optimización de Performance — Prompt Caching + Streaming

## Estado · Lifecycle

| Campo | Valor |
|-------|-------|
| **Auditoría inicial** | 2026-06-12 — Claude Fable 5 |
| **Implementación** | 2026-06-12/13 — Claude Sonnet 4.6 |
| **Auditoría de seguimiento** | 2026-06-13 — Claude Opus 4.8 |
| **Commit auditado (Opus)** | `89a7716` — main |
| **Estado** | ✅ B1 + B2 RESUELTOS — listo para activar `ANTHROPIC_PARALLEL_IMAGE=1` tras smoke test |

---

## 1. Contexto y motivación

### Análisis de logs (baseline F0)

Se exportaron 8 consultas reales de Vercel y se midieron los patrones de cache hit/miss de Anthropic:

| Posición en hilo | Cache hit rate |
|-----------------|----------------|
| 2 | 27.56% |
| 3–8 | ~0% |

**Root cause**: La estructura V1 enviaba todo el historial como un bloque de texto plano creciente con `cache_control`. El prefijo cacheado cambiaba en cada consulta → 0% de hit rate a partir de la posición 3.

**TTL decision**: Datos F0 mostraron todas las consultas dentro de 10 min (avg 6.5 min), 100% dentro de 60 min → TTL 1h óptimo (`extended-cache-ttl-2025-04-11`).

---

## 2. Especificación implementada

Fuente: `SPEC_IMPLEMENTACION_PERF_v1.1_2026-06-12.md` (entregada por el usuario).

| Fase | Flag | Descripción |
|------|------|-------------|
| Phase 0 | — | Telemetría baseline (ya en prod) |
| Phase 1 | `ANTHROPIC_PROMPT_V2=1` | Prompt caching V2: pares reales user/assistant con breakpoint en último assistant |
| Phase 2 | `ANTHROPIC_STREAM_DELTAS=1` | Streaming deltas SSE; preview progresivo en cliente |
| Phase 3 | `ANTHROPIC_PARALLEL_IMAGE=1` | Imagen en paralelo con interpretación (requiere Phase 2 activo) |
| Phase 4 | — | **NO IMPLEMENTAR** (descartado por spec) |

---

## 3. Implementación por fase

### Phase 1 — Prompt caching V2 (`feat/perf-phase-1`)

**Archivos modificados:**
- `backend/claude/src/anthropic-client.ts` — parámetro `extendedTtl` + beta header `extended-cache-ttl-2025-04-11`
- `backend/claude/src/interpretation-context.ts` — `buildV2HistoricalUserBlock()`, `LANG_LABELS` (11 idiomas)
- `backend/claude/src/interpretation.ts` — `isPromptV2Enabled()`, `buildV2SystemBlock()`, `buildV2Messages()` con cache breakpoint en último assistant
- `backend/claude/src/oracle-bones-interpretation.ts` — path V2 para Oracle Bones
- `backend/claude/src/interpretation.v2.test.ts` — **22 tests nuevos** (cobertura idiomas, truncado, hexagramas, Oracle Bones)
- `backend/claude/vitest.config.ts` + `package.json` — suite de test añadida

**Comportamiento V2**: N pares user/assistant históricos con `cache_control: { type: "ephemeral" }` en el último mensaje assistant. El bloque system incluye nota de idioma fija por sesión. Historia real (no texto plano fusionado) → prefijo estable → alta tasa de hit a partir de posición 2.

**Gate de producción**: N≥50 consultas en staging confirmen telemetría + golden set manual aprobado por el owner antes de activar `ANTHROPIC_PROMPT_V2=1` en producción.

### Phase 2 — Streaming deltas (`feat/perf-phase-2`)

**Archivos modificados:**
- `backend/claude/src/anthropic-client.ts` — `callAnthropicStreamingWithRetry()` con retry pre-content solo
- `backend/claude/src/interpretation.ts` — parámetro opcional `onDelta?`; dispatch condicional streaming/non-streaming
- `apps/web/src/app/api/consult/route.ts`:
  - Evento SSE `oracle_delta` añadido al tipo union
  - Accumulator `deltaAcc` + flush timer 150ms hoisted a scope IIFE
  - `streamingStarted` movido al **primer `oracle_delta`** (no `oracle_ready`)
  - Fallback no-streaming mantiene `streamingStarted` en `oracle_ready`
- `apps/web/src/app/page.tsx`:
  - Estado `streamingText` + refs `streamingDeltaAccRef`/`streamingFlushTimerRef`
  - Handlers `oracle_delta` (throttle 150ms cliente) + `oracle_ready` (finaliza texto)
  - Preview progresivo renderizado después de `activeThread.map()` mientras `loading`
  - Limpieza de estado en ambos paths de `setPhase("reading")` (main + recovery)
- `apps/web/src/lib/__tests__/token-refund.test.ts` — case #4 actualizado: primer `oracle_delta` como umbral de content delivery

**Política de retry**:
- Pre-content (sin delta emitido) → retry normal (mismo manejo de 429)
- Post-content (delta ya emitido) → no retry; recovery-polling maneja

### Phase 3 — Imagen paralela (`feat/perf-phase-3`)

**Archivo modificado:** `apps/web/src/app/api/consult/route.ts`

**Lógica**: El `onDelta` acumula texto completo en `fullDeltaAcc` buscando `CATEGORY:` con regex `/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im`. Al primer match, lanza `buildImageAsset` como Promise no-awaited (`parallelImagePromise`) mientras la interpretación sigue streaming.

Después de `generateInterpretation`:
- Si `parallelImageCategory === category` (final) → `await parallelImagePromise` (imagen ya lleva ~20-30s de ventaja)
- Si mismatch → log `parallel_image:category_mismatch` + llama `buildImageAsset` secuencial con la categoría correcta

**Telemetría**:
- `parallel_image:start` — categoría detectada, imagen lanzada
- `parallel_image:await` — reutilizando resultado paralelo
- `parallel_image:category_mismatch` — fallback a secuencial (umbral de corte: >5-10%)

---

## 4. Auditoría de seguimiento — Claude Opus 4.8 (2026-06-13)

**Commit auditado**: `89a7716` (main post-merge de las 3 fases)

**Veredicto general**: La base es sólida. El código dormido en main es seguro de desplegar. Los flags de activación son el control correcto de rollout. Se identificaron 2 bloqueantes y 3 importantes antes de activar Phase 3 en producción.

### B1 — Promise huérfana → `unhandledRejection` ⛔ BLOQUEANTE

**Ubicación**: `apps/web/src/app/api/consult/route.ts` ~L1199

**Descripción**: `parallelImagePromise` se asigna pero no lleva `.catch()`. En el path de mismatch de categoría, la promesa paralela se abandona sin await. En el path de match, hay una ventana de ~20-30s entre el lanzamiento y el `await`. Si `buildImageAsset` rechaza en esa ventana, queda como rechazo no manejado.

**Fix**: Adjuntar `.catch(() => undefined)` al asignar `parallelImagePromise`. El error sigue propagándose cuando el `await` ocurre en L1262 (path match) o se abandona limpiamente en path mismatch.

**Estado**: ✅ RESUELTO — `fix/perf-b1-b2`

### B2 — `fal` y `gpt-image` sin try/catch en fetch ⛔ BLOQUEANTE (si se usa fal/gpt-image)

**Ubicación**: `apps/web/src/lib/image-provider.ts` — `generateWithFal` (~L436), `generateWithGptImage` (~L460)

**Descripción**: Ambas funciones hacen `await fetch(...)` sin try/catch — solo manejan `!res.ok`, no errores de red (DNS, reset, timeout). Solo `generateWithTogether` envuelve el fetch. Consecuencia doble:
1. Alimenta B1 (la promise huérfana puede rechazar de verdad)
2. En path secuencial con `streamingStarted=true`, el throw llega al catch → `attemptRefund` con `tokensToRefund=0` → usuario pierde el token sin persist ni refund

**Nota**: Con `together` como provider (default actual), B2 no se activa porque `generateWithTogether` ya tiene try/catch y degrada a R2/prebuilt/sumi. Bloqueante solo si se activa `fal` o `gpt-image`.

**Fix**: Envuelto fetch de `generateWithFal` y `generateWithGptImage` en try/catch que devuelve `null` en cualquier error de red, idéntico al patrón de `generateWithTogether`.

**Estado**: ✅ RESUELTO — `fix/perf-b1-b2`

---

### I1 — Política no-refund post-streamingStarted (decisión de producto)

**Descripción**: Una vez emitido el primer `oracle_delta`, cualquier fallo posterior resulta en 0 refund + ticket de soporte. El disparador real post-stream más probable es un fallo de `upsertSessionAndConsultation`. A escala, 0.5–1% de fallos de persist = decenas de tickets/semana.

**Recomendación Opus**: Reintentar el persist 1-2 veces antes de rendirse, en vez de enviar directo a soporte. El texto ya generado no cuesta tokens de Claude.

**Estado**: Decisión de producto pendiente de confirmación del owner.

### I2 — Mismatch de categoría = doble costo de imagen

**Descripción**: Si la categoría detectada en streaming difiere de la final, se ejecutan dos `buildImageAsset` (la paralela huérfana se factura igual + la secuencial correcta). La optimización se vuelve contraproducente si el mismatch es frecuente.

**Umbral de corte**: Si `parallel_image:category_mismatch` supera ~5-10% en canary, pausar y revisar que el system prompt emite `CATEGORY:` con el valor exacto del enum (`love_relationship`, no `love`) temprano en la respuesta.

### I3 — Re-validar detección paralela al activar PROMPT_V2

**Descripción**: Si Phase 1 (`ANTHROPIC_PROMPT_V2=1`) cambia el formato de salida del modelo, el regex de detección de categoría puede dejar de matchear → caída silenciosa a secuencial (fail-safe correcto, pero sin speedup).

**Acción**: Verificar que `parallel_image:start` sigue disparando temprano tras activar V2.

---

### Menores (sin bloquear activación)

| ID | Descripción | Ubicación |
|----|-------------|-----------|
| M1 | Falta `.on("error")` defensivo en el stream del SDK Anthropic | `anthropic-client.ts` L50 |
| M2 | `flushDeltaAcc()` en `finally` envía buffer parcial tras evento de error — considerar descartar en error | `route.ts` ~L1446 |
| M3 | Tests de `refundCtx` son spec (literales locales), no cobertura real del state machine de `route.ts` | `token-refund.test.ts` |

---

## 5. Checklist de activación (orden obligatorio)

### Fase 0 — Regresión (flags OFF)
- [ ] Path no-streaming idéntico al baseline
- [ ] Plan de Vercel soporta `maxDuration=300` (Fluid/Pro)

### Fase A — `ANTHROPIC_STREAM_DELTAS=1` en staging
- [ ] Happy path: `oracle_delta` progresivo → preview → `oracle_ready` consolida → `final_ready` con imagen
- [ ] Texto final == concatenación de deltas (sin duplicar, sin perder fragmento <150ms)
- [ ] Thread master largo (>90s) en **Android real**: ping 25s mantiene conexión
- [ ] Corte de red post-content: no reintenta, cliente entra en recovery/hydration
- [ ] Fallo pre-content (429 forzado): retry OK, sin cobro / con refund completo
- [ ] Forzar fallo persist post-delta: log `persist_failed_no_refund`, token NO devuelto (confirmar decisión I1)

### Fase B — `ANTHROPIC_PARALLEL_IMAGE=1` (requiere A activo + B1 corregido)
- [ ] **B1 corregido** (`.catch(() => {})` en parallelImagePromise)
- [ ] **B2 corregido si se usa fal/gpt-image** (try/catch en fetch de providers)
- [ ] Logs: `parallel_image:start` temprano → `parallel_image:await`; medir latencia total vs baseline
- [ ] Tasa de mismatch sobre N≥30 consultas reales < 5-10%
- [ ] Con el provider exacto de prod: confirmar cascade R2/sumi en fallo de imagen
- [ ] Cero `unhandledRejection` en logs (valida B1)
- [ ] `buildImageAsset` se llama **1 vez** por consulta en el caso match
- [ ] Vigilar factura del provider durante el canary

### Fase C — Rollback y carga
- [ ] Comando de rollback preparado (cambiar env var en Vercel + redeploy ~1-2 min)
- [ ] 20-50 consultas simultáneas: semáforo Supabase, rate-limit Upstash, maxDuration 300s

### Phase 1 — `ANTHROPIC_PROMPT_V2=1`
- [ ] N≥50 consultas en staging confirmen mejora de telemetría
- [ ] Golden set aprobado por owner en writing
- [ ] Re-ejecutar Fase B (I3): verificar `parallel_image:start` sigue disparando con V2

---

## 6. Variables de entorno y rollback

| Flag | Activa | Default | Rollback |
|------|--------|---------|----------|
| `ANTHROPIC_STREAM_DELTAS` | Phase 2 | OFF | Quitar var en Vercel + redeploy |
| `ANTHROPIC_PARALLEL_IMAGE` | Phase 3 | OFF | Quitar var en Vercel + redeploy |
| `ANTHROPIC_PROMPT_V2` | Phase 1 | OFF | Quitar var en Vercel + redeploy |

Todos los paths de rollback son no-destructivos y no requieren cambios de código.
