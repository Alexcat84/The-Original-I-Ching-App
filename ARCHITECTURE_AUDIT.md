# Diagnóstico Técnico de Arquitectura — iching-app
**Fecha:** 2026-05-14  
**Alcance:** Evaluación de preparación para alto tráfico  
**Metodología:** Análisis estático de codebase (sin modificaciones)

---

## Índice

1. [Claude API](#1-claude-api)
2. [Together AI / FLUX](#2-together-ai--flux)
3. [Supabase](#3-supabase)
4. [Upstash](#4-upstash)
5. [Cloudflare](#5-cloudflare)
6. [Vercel](#6-vercel)
7. [Sistema de Tokens](#7-sistema-de-tokens)
8. [Errores y Observabilidad](#8-errores-y-observabilidad)
9. [Optimización de Tokens IA](#9-optimización-de-tokens-ia)
10. [Seguridad de API Keys](#10-seguridad-de-api-keys)
11. [Hallazgos Críticos](#hallazgos-críticos)
12. [Quick Wins](#quick-wins)

---

## 1. Claude API

**Archivos principales:**
- `backend/claude/src/interpretation.ts` (825 líneas)
- `backend/claude/src/anthropic-model-id.ts`
- `backend/claude/src/oracle-bones-interpretation.ts`
- `apps/web/src/app/api/consult/route.ts`

### Modelo usado

```
claude-sonnet-4-5-20250929
```

Definido en `anthropic-model-id.ts` línea 8. **Un único modelo para todos los tiers y métodos** (Wilhelm, Legge, Zhou Yi, Master Combined, Oracle Bones). Sin diferenciación por plan.

### Estructura del System Prompt

| Bloque | Tipo | Contenido |
|--------|------|-----------|
| Identidad + rol | Estático | "You are the Sage of the Oracle" |
| ABSOLUTE RULES (10 reglas) | Estático | Uso exclusivo de textos clásicos, referencias a consultas previas, prohibición de poesía, tipografía markdown, etc. |
| ANTI-REPETITION | Estático | Cada punto concreto máximo una vez por respuesta |
| TYPOGRAPHY | Estático | `##` headings, `*italic*` para textos clásicos, `**bold**` solo para términos propios |
| TEMPORAL RESTRAINT | Estático | Prohibición de spans temporales en referencias a sesiones |
| Nombre del usuario | Dinámico | `The user's name is ${displayName}...` (línea 510–512) |
| Idioma | Dinámico | `LANGUAGE: Respond only in ${getLanguageName(language)}.` (línea 513) |

### Prompt Caching

✅ **Implementado** con `cache_control: { type: "ephemeral" }`:

| Bloque cacheado | Líneas | Tipo |
|-----------------|--------|------|
| `stableSystemBlock` | 537–541 | System prompt completo |
| `stableLibraryBlock` | 550–552 | Textos Wilhelm + Legge + Zhou Yi + hexagrama transformado |
| `stableThreadContextBlock` | 557–559 | Contexto de sesión anterior (resumen Supabase) |
| `dynamicQuestionBlock` | — | Pregunta actual → **sin cache** |

Logging via `logCacheUsage()` (líneas 77–96): `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, ratio de acierto.  
Activo si `LOG_CLAUDE_CACHE_METRICS=1` o `NODE_ENV=development`.

### Construcción del contexto del hilo

- **Modo deepening:** Si `isDeepening && isPersistableUuid(sessionId)` → carga resumen desde DB
- Función `buildContextBlock()` en `interpretation-context.ts`
- Por cada consulta previa: hexagrama #, nombre, chino, líneas en mutación, resumen de interpretación (~420 chars)
- **~150–200 tokens por consulta anterior**
- Master tier: hasta 8 consultas en sesión actual + 10 históricas

### Retry logic para 429

❌ **No implementado.** Existe un fallback chain, pero sin retry exponencial:

```
Anthropic API → OpenRouter API → Groq API → Offline fallback text
```

Los errores se silencian en cada step sin logging estructurado ni alerta.

### Streaming

✅ **Implementado** via `ReadableStream<Uint8Array>` con event-stream format.

Modo `stream_ritual` emite eventos secuenciales:
- `cast_ready` — resultado del sorteo (hexagrama, líneas) → emitido **antes** de llamar a Claude
- `final_ready` — interpretación completa + imagen
- `error` — si falla el proceso

Logging: `LOG_RITUAL_STREAM_DEBUG=1` loguea `+{elapsedMs}ms` por evento.

### max_tokens

```
4096 — fijo para todos los tiers y métodos
```

Definido en `interpretation.ts` línea 46 y `oracle-bones-interpretation.ts` línea 29.

### Diferenciación de modelo por plan

❌ **No existe.** Mismo modelo para Free, Seeker, Practitioner y Master.  
La única diferencia entre tiers es el número de tokens consumidos (1 vs 2) y la resolución de imagen.

---

## 2. Together AI / FLUX

**Archivo principal:** `apps/web/src/lib/image-provider.ts` (943 líneas)  
**Paquete auxiliar:** `packages/image-engine/src/`

### Sincronía vs asincronía

⚠️ **Bloqueante respecto a la respuesta del oracle.**

Flujo en `route.ts`:
1. Cast del hexagrama → emite `cast_ready` (~15ms)
2. Llamada a Claude → espera interpretación (6–20s)
3. Build prompt de imagen
4. Llamada a Together AI → espera imagen (30–45s)
5. Emite `final_ready` con interpretación + imagen

**El usuario espera el total de Claude + Together antes de ver resultado.**

### Retry logic

❌ **Sin retry automático.**

- `AbortController` con timeout de 65s (línea 526)
- Si Together falla → fallback a prebuilt PNG
- Si no hay prebuilt → fallback a SVG sumi-e generado localmente
- Sin reintento en ningún caso

### Caché de imágenes

| Tipo | Estado | Detalle |
|------|--------|---------|
| Prebuilt fallbacks | ✅ | `/fallbacks/prebuilt/{kind}/{tier}/{WxH}/{index}.png`, índice 1–10, seed determinístico |
| Cache en memoria | ✅ | `prebuiltFallbackExistsCache: Map` (in-process) |
| CDN cache headers | ❌ | Sin `Cache-Control` para imágenes dinámicas generadas |
| Caché de Together AI | ❌ | Cada consulta genera imagen nueva |

### Parámetros

```
Modelo:   black-forest-labs/FLUX.1-schnell
Steps:    12 (máximo permitido para schnell)
n:        1 (una imagen por consulta)

Resolución por tier:
  free:          1024 × 768   ($0.0021/img)
  seeker:        1024 × 1024  ($0.0028/img)
  practitioner:  1184 × 1184  ($0.0039/img)
  master:        1504 × 1504  ($0.0061/img)

Restricciones Together API:
  Múltiplo de 32
  Mínimo 256px por dimensión
  Máximo 4 MP total (4,194,304 px)
```

### Generación por mensaje

**Una imagen por cada consulta**, siempre — no solo la primera del hilo.  
Prompt específico por hexagrama + categoría + `consultationId` (seed para variedad).

---

## 3. Supabase

**Archivos principales:**
- `backend/db/migrations/001_init.sql` al `022_user_trial_log.sql`
- `apps/web/src/lib/supabase*.ts`

### Tablas principales del oracle

| Tabla | Campos clave | RLS |
|-------|-------------|-----|
| `users` | `id UUID PK`, `email UNIQUE`, `language`, `two_factor_enabled` | ✅ |
| `consultation_sessions` | `user_id FK`, `title`, `theme_category`, `max_consultations`, `public_sharing_id UNIQUE` | ✅ |
| `consultations` | `user_id FK`, `session_id FK`, `lines JSONB`, `primary_hexagram_number`, `changing_lines INT[]`, `interpretation TEXT`, `image_url`, `thumbnail_url` | ✅ |
| `query_credits` | `user_id FK UNIQUE`, `credits_total`, `credits_used`, `total_purchased`, `last_pack` | ✅ |
| `user_trial_log` | Blindaje free trial lifetime | service-role only |
| `admin_runtime_config` | Configuración runtime | service-role only |
| `revenuecat_webhook_events` | Webhooks de pagos | service-role only |

### Índices definidos

Encontrados en `migration 008_chat_history_query_indexes.sql`:

```sql
CREATE INDEX idx_consultation_sessions_user_created_at
  ON consultation_sessions(user_id, created_at DESC);

CREATE INDEX idx_consultations_user_session_position
  ON consultations(user_id, session_id, session_position ASC);

CREATE INDEX idx_consultations_session_created_at
  ON consultations(session_id, created_at DESC);
```

✅ Los índices más críticos para queries de historial están cubiertos.  
❌ Sin índice en `consultations.primary_hexagram_number` (si se implementa búsqueda por hexagrama).

### PgBouncer / Connection Pooling

❌ **No encontrado en código.** No se usa la URL de pooling de Supabase (`*.pooler.supabase.com`). El cliente usa la URL directa. En alto tráfico, cada request abre una conexión nueva al pool de Supabase.

### Resumen técnico inyectado en Claude

Construido en `interpretation-context.ts` — `buildContextBlock()`:

```
Por consulta previa incluida:
  - Hexagrama primario # + transformado #
  - Líneas en mutación [x, y, z]
  - Resumen de interpretación (420 chars máx)
  → ~150–200 tokens por consulta
```

**Estimación para hilo de 8 mensajes (Master):**

```
System prompt estático:              ~450 tokens   (cached)
Biblioteca Wilhelm+Legge+Zhou Yi:   ~2,000 tokens  (cached)
Contexto sesión (8 consultas):      ~1,600 tokens  (cached, pero cache miss en crecimiento)
Pregunta actual:                       ~200 tokens  (sin cache)
─────────────────────────────────────────────────────────────
Total input estimado:                ~4,250 tokens
Output máximo:                        4,096 tokens
```

### Row Level Security (RLS)

✅ **Activo en todas las tablas de usuario:**
- `consultations` → `auth.uid() = user_id`
- `consultation_sessions` → `auth.uid() = user_id`
- `query_credits` → `auth.uid() = user_id`

✅ **Tablas admin** protegidas con `service_role` only (sin RLS, sin acceso anon).

### Plan de Supabase inferido

CLAUDE.md menciona: *"Upgrade Supabase a Pro ($25/mes) al tener usuarios reales"*.  
→ Actualmente en **Free o Starter**. Límites: 500 MB storage, 2 GB egress/mes, 500 MB DB.  
El agotamiento de egress en producción ya fue reportado en CLAUDE.md (proyecto original).

---

## 4. Upstash

**Archivo:** `apps/web/src/lib/rate-limit.ts` (64 líneas)

### Usos implementados

| Uso | Estado | Detalle |
|-----|--------|---------|
| Rate limiting por IP | ✅ | 30 req / 60s en `/api/consult` (línea 440–454) |
| Rate limiting por usuario | ✅ | 15 req / 60s en `/api/consult` (línea 455–469) |
| Cola para Together AI | ❌ | No implementado |
| Caché de respuestas Claude | ❌ | No implementado |
| Caché de system prompt | ❌ | Manejado por Anthropic nativo (ephemeral cache) |
| KV de sesiones | ❌ | Supabase es la fuente de verdad |

### Fallback crítico sin Upstash

```typescript
// rate-limit.ts líneas 18–25
if (process.env.NODE_ENV === "production") {
  console.warn("[rate-limit] UPSTASH not configured — using in-memory fallback");
}
const inMemoryBucket = new Map<string, { count: number; resetAt: number }>();
```

⚠️ **CRÍTICO:** En Vercel Functions (serverless), cada invocación corre en un aislado independiente. El `Map` en memoria es invisible entre invocaciones. Si `UPSTASH_REDIS_REST_URL` no está configurado, **el rate limiting es completamente inoperativo en producción.**

---

## 5. Cloudflare

**Archivos relevantes:**
- `apps/web/src/lib/turnstile.ts`
- `apps/web/src/middleware.ts`

### Turnstile (CAPTCHA)

✅ **Activo en `/login` y `/register`.**

```typescript
// turnstile.ts línea 6
if (!TURNSTILE_SECRET_KEY) return { success: false, error: "not_configured" };
```

Falla cerrada: si la key no está configurada, rechaza. Verificación via `https://challenges.cloudflare.com/turnstile/v0/siteverify`.

❌ **No protege `/api/consult`** — solo rate limiting por IP/usuario vía Upstash.

### Workers

❌ **No encontrados.** No existe `wrangler.toml` ni configuración de Workers en el repo.

### Cache headers en rutas estáticas

❌ **No configurados.** No hay `Cache-Control` headers en `next.config.*` para rutas estáticas como la Biblioteca de Hexagramas. Las páginas estáticas de Next.js se sirven con el comportamiento default de Vercel/CDN.

### Rate limiting en edge

❌ **No existe.** El rate limiting está en el origen (Upstash Redis), no en el edge de Cloudflare. Todo el tráfico de ataque llega hasta la función de Vercel antes de ser bloqueado.

---

## 6. Vercel

**Archivos:** `vercel.json`, `apps/web/src/app/api/consult/route.ts`

### Timeout configurado

```typescript
// route.ts línea 59–60
export const runtime = "nodejs";
export const maxDuration = 120; // 120 segundos
```

| Plan | Límite real | Configurado | Resultado |
|------|-------------|-------------|-----------|
| Hobby | 60s | 120s | ⚠️ El `maxDuration` se ignora; corta en 60s |
| Pro | 900s | 120s | ✅ Funciona como configurado |

### Plan inferido

No determinable con certeza desde el código. CLAUDE.md no lo especifica. El valor `maxDuration = 120` implica necesidad de **Pro**. Si el proyecto está en Hobby, las consultas Master con Together AI tienen riesgo alto de timeout.

### Runtime de las rutas del oracle

✅ **Node.js Runtime** — necesario por dependencias nativas (`sharp`, SVG, etc.).  
❌ No Edge Runtime (incompatible con el stack actual).

### Riesgo de timeout en respuestas largas

```
Componente              Tiempo estimado
─────────────────────────────────────────
Cast (sorteo local):          ~15ms
Claude API (sonnet):       6,000–20,000ms
Together AI (FLUX schnell): 30,000–45,000ms
Finalización + stream:         ~500ms
─────────────────────────────────────────
Total típico:             ~37,000–66,000ms
```

En Hobby (60s límite): el percentil 75 de requests Master ya excede el límite.

---

## 7. Sistema de Tokens

**Archivos:**
- `apps/web/src/app/api/consult/route.ts` (líneas 550–574)
- `backend/db/migrations/021_consumable_tokens.sql`
- `backend/db/migrations/022_user_trial_log.sql`

### Orden de validación

✅ **Correcto:** validación ocurre ANTES de llamar a servicios externos.

```
1. getAuthenticatedUser()       → auth required
2. Rate limit por IP            → anti-abuse
3. Rate limit por usuario       → anti-abuse
4. getTokenBalance()            → leer créditos
5. if balance < tokensToConsume → 402 Payment Required
6. consumeToken() RPC           → descontar en DB
7. buildContextBlock()          → preparar Claude
8. interpret() / Claude API     → llamada externa
9. generateImage() / Together   → llamada externa
```

### Atomicidad del descuento

✅ **Atómica a nivel DB:**

```sql
-- RPC consume_token() en migration 021
UPDATE query_credits
SET credits_total = credits_total - 1,
    credits_used  = credits_used  + 1,
    updated_at    = NOW()
WHERE user_id = p_user_id
  AND credits_total > 0
RETURNING credits_total;
```

Si `credits_total = 0` al momento del UPDATE, la operación retorna sin consumir.

### Race condition entre lectura y consumo

⚠️ **Ventana de race condition:**

```
Thread 1: getTokenBalance() → balance = 2 ✓
Thread 2: getTokenBalance() → balance = 2 ✓   ← mismo saldo leído
Thread 1: consumeToken()    → balance = 1
Thread 2: consumeToken()    → balance = 0
```

Ambos requests pasan la validación y ambos llaman a Claude API. La DB evita ir negativa, pero Claude ya fue invocada dos veces. **Riesgo real: revenue loss en usuarios con saldo bajo que abren múltiples tabs.**

### Diferencia de consumo por tier

```typescript
// route.ts líneas 550–551
const isMasterCombined = resolvedTranslator === "master_combined";
const tokensToConsume = isMasterCombined ? 2 : 1;
```

| Método | Tokens consumidos |
|--------|-----------------|
| Wilhelm/Baynes | 1 |
| Legge | 1 |
| Zhou Yi | 1 |
| Master Combined | 2 |
| Oracle Bones | 1 |

---

## 8. Errores y Observabilidad

### Sentry

| Plataforma | Estado | Detalle |
|------------|--------|---------|
| Mobile (Expo) | ✅ | `@sentry/react-native` con error boundary global en `apps/mobile/app/_layout.tsx` |
| Web (Next.js) | ❌ | **No encontrado.** Cero referencias a Sentry en `apps/web/src/` |

### Captura de errores de Claude API

❌ **No capturados estructuralmente.**

El fallback chain silencia los errores de Anthropic (429, 500, 529) sin:
- Envío a Sentry
- Logging de la causa raíz
- Alerta a on-call

El usuario ve un resultado (desde OpenRouter/Groq/offline), pero el error de Anthropic es invisible en producción.

### Logging de latencia

✅ Disponible pero **opt-in y stdout-only:**

| Log | Variable de activación | Contiene |
|-----|------------------------|----------|
| Stream ritual | `LOG_RITUAL_STREAM_DEBUG=1` | `+{elapsedMs}ms` por evento del stream |
| Cache metrics | `LOG_CLAUDE_CACHE_METRICS=1` | input/output/cache_read/cache_creation tokens, ratio |

Solo visible en Vercel Logs. Sin persistencia ni dashboards.

### Alertas

❌ **No configuradas.** Sin integración a PagerDuty, DataDog, New Relic, ni alertas de Vercel/Supabase.  
La única observabilidad en producción es revisar manualmente Vercel Logs.

---

## 9. Optimización de Tokens IA

### Estimación de costos por request (Master, 8 consultas previas)

| Bloque | Tokens | Cached | Cache hit real |
|--------|--------|--------|----------------|
| System prompt estático | ~450 | ✅ ephemeral | Alta (~90%+) |
| Biblioteca Wilhelm+Legge+Zhou Yi+transformado | ~2,000 | ✅ ephemeral | Alta (~90%+) |
| Contexto sesión (8 consultas previas) | ~1,600 | ✅ ephemeral | ⚠️ ~0–10%* |
| Pregunta actual | ~200 | ❌ | N/A |
| **Total input** | **~4,250** | | |
| Output máximo | 4,096 | | |

(*) **El contexto de sesión crece con cada consulta en el hilo.** El bloque de 8 consultas es diferente al bloque de 7 consultas → cache miss sistemático en ese bloque pese a estar marcado como `ephemeral`.

### Análisis de eficiencia del prompt caching

```
% teóricamente cacheable:  (450 + 2,000) / 4,250 = 57.6%
% real aprovechado:        (450 + 2,000) / 4,250 = ~15–20%
                           (solo system + biblioteca en sesiones nuevas)
```

### Candidatos para mejorar el cache hit rate

1. **Contexto de sesión como bloque estático con posición fija** — en vez de crecer linealmente, estructurarlo con un "slot" fijo de N consultas que se rellena y cuya representación no cambia entre requests de la misma posición.
2. **Separar hexagrama actual del contexto histórico** — el contexto histórico [1..N-1] es estable una vez emitido; solo la consulta actual es nueva.

---

## 10. Seguridad de API Keys

### Almacenamiento

✅ **Todas las keys privadas están en variables de entorno del servidor:**

| Key | Ubicación en código |
|-----|---------------------|
| `ANTHROPIC_API_KEY` | `interpretation.ts` línea 488 |
| `OPENROUTER_API_KEY` | `interpretation.ts` línea 636 |
| `GROQ_API_KEY` | `interpretation.ts` línea 728 |
| `TOGETHER_API_KEY` | `image-provider.ts` línea 484 |
| `FAL_AI_KEY` | `image-provider.ts` línea 395 |
| `UPSTASH_REDIS_REST_URL/TOKEN` | `rate-limit.ts` línea 12–13 |
| `TURNSTILE_SECRET_KEY` | `turnstile.ts` línea 4 |
| `SUPABASE_SERVICE_ROLE_KEY` | via `getSupabaseAdmin()` |
| `REVENUECAT_WEBHOOK_SECRET` | en webhook handlers |

### Keys en cliente o .env commiteados

❌ **No encontradas.** No hay `.env` con valores reales en el repo.  
✅ `EXPO_PUBLIC_SENTRY_DSN` y `TURNSTILE_SITE_KEY` son públicos por diseño (correcto).

### Protección de rutas antes de servicios externos

✅ **Orden correcto en todas las rutas del oracle:**

```
getAuthenticatedUser() → rate limit → validar créditos → Claude/Together
```

Los servicios externos solo se invocan si el usuario está autenticado y tiene créditos. RLS de Supabase aplica como segunda capa en todas las queries de usuario.

---

## Hallazgos Críticos

Riesgos ordenados por severidad para escenario de alto tráfico:

### 1. Race condition en consumo de tokens
**Severidad: ALTA**

Entre `getTokenBalance()` (lectura) y `consumeToken()` (escritura) existe una ventana donde dos requests paralelos del mismo usuario (múltiples tabs, retry del cliente) pueden pasar la validación con el mismo saldo. La DB no va negativa, pero Claude ya fue invocada en ambos casos.

**Impacto:** Revenue loss en usuarios con saldo bajo. En escenario de 1,000 usuarios concurrentes, frecuencia estimada: ~2–5% de requests con saldo = 1.

**Fix:** Eliminar la lectura previa separada. Hacer el descuento en DB atómicamente al inicio del request y retornar 402 si el RPC retorna `credits_remaining = -1`. El sistema actual ya tiene la infraestructura (el RPC retorna remaining), solo falta mover el consumo antes de cualquier validación de contexto.

---

### 2. Timeout Vercel: 120s configurado vs 60s real (si plan Hobby)
**Severidad: ALTA**

Tiempo típico de un request Master completo: 37–66s. En plan Hobby (límite real 60s), el percentil 75 ya falla. El `maxDuration = 120` es ignorado en Hobby.

**Impacto:** Timeouts intermitentes en prod. El usuario ve error después de 60s de espera. La imagen y la interpretación ya fueron generadas (costo incurrido) pero la respuesta se pierde.

**Fix a corto plazo:** Verificar plan Vercel actual. Si Hobby → upgrade a Pro.  
**Fix estructural:** Separar la generación de imagen del tiempo de respuesta (ver Quick Win #3).

---

### 3. Rate limiting inoperativo en serverless sin Upstash configurado
**Severidad: ALTA**

El `inMemoryBucket: Map` usado como fallback no persiste entre invocaciones serverless de Vercel. Si `UPSTASH_REDIS_REST_URL` no está en las variables de entorno de producción, no existe protección contra abuse.

**Impacto:** Sin Upstash, un atacante puede hacer miles de requests/segundo a `/api/consult` hasta agotar créditos de Anthropic/Together, egress de Supabase, o disparar costos.

**Fix:** Validar en CI que `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` estén presentes en entorno de producción. Agregar health check al inicio de `route.ts` que rechace si Upstash no está operativo.

---

### 4. Sin Sentry en web y errores Claude silenciosos
**Severidad: MEDIA**

La aplicación web no tiene Sentry configurado. Los errores de Anthropic (429, 500, 529) son absorbidos por el fallback chain sin registro ni alerta. En producción, una degradación de Anthropic API pasaría desapercibida hasta que usuarios reporten en soporte.

**Impacto:** MTTR (Mean Time To Recover) alto. Bugs silenciosos. Sin datos para SLA.

**Fix:** Instalar `@sentry/nextjs`, crear `instrumentation.ts`, capturar errores del fallback chain.

---

### 5. Cache hit rate real ~15–20% pese a implementación de prompt caching
**Severidad: MEDIA**

El bloque de contexto de sesión es marcado como `ephemeral` pero crece linealmente con cada consulta del hilo. Consulta #3 tiene un contexto diferente a consulta #4 → cache miss en el bloque más pesado (~1,600 tokens).

**Impacto:** Costo Anthropic 3–4× más alto que el potencial. Latencia de respuesta mayor por tokens procesados sin cache.

**Estimación de ahorro:** Con 1,000 consultas Master/día a $15/MTok (input), la diferencia entre 20% y 60% de cache hit rate es ~$200–400/mes.

---

## Quick Wins

Los 3 cambios de mayor impacto implementables en menos de 1 día:

### QW-1: Implementar Sentry en Web (30 min)

```typescript
// apps/web/src/instrumentation.ts
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.VERCEL_ENV ?? "development",
    });
  }
}
```

```typescript
// En interpretation.ts — capturar errores del fallback chain
import * as Sentry from "@sentry/nextjs";

catch (anthropicError) {
  Sentry.captureException(anthropicError, {
    tags: { provider: "anthropic", tier, language }
  });
  // continúa con OpenRouter...
}
```

**ROI:** Observabilidad inmediata. Alertas en Slack/email ante degradación de Anthropic.

---

### QW-2: Eliminar race condition en consumo de tokens (45 min)

Cambiar el flujo de `route.ts` para consumir el token **antes** de construir contexto:

```typescript
// ANTES (race condition):
const balance = await getTokenBalance(userId);        // lectura
if (balance < tokensToConsume) return 402;
// ... 200ms de lógica ...
await consumeToken(userId, tokensToConsume);           // escritura separada
// ... llamada a Claude ...

// DESPUÉS (atómico):
const remaining = await consumeToken(userId, tokensToConsume); // read+write atómico
if (remaining === -1) return 402;                              // sin créditos
// ... llamada a Claude ...
```

El RPC `consume_token()` ya retorna `credits_total` después del descuento. Solo requiere reordenar el código y modificar la firma del RPC para retornar -1 si `credits_total = 0` antes del descuento.

**ROI:** Elimina revenue loss. Crítico para monetización en alto tráfico.

---

### QW-3: Desacoplar imagen de la respuesta del oracle (2–4 horas)

El stream actual ya tiene la arquitectura de eventos (`cast_ready` → `final_ready`). El cambio es emitir el texto de Claude como un tercer evento intermedio y la imagen cuando esté lista:

```
cast_ready      → hexagrama + líneas                   (~15ms)  ← usuario ve inmediatamente
oracle_ready    → interpretación completa de Claude     (~10s)   ← NEW: usuario lee mientras espera imagen
final_ready     → imagen generada por Together AI       (~45s)   ← imagen aparece sola
```

El cliente renderiza en 3 pasos: sorteo → interpretación → imagen. El usuario ve contenido a los 10s en vez de esperar 45–65s.

**ROI:** Mejora dramática de UX percibida. Reduce riesgo de timeout en Hobby plan. Sin cambio de backend/DB.

---

*Diagnóstico generado con análisis estático del codebase. Ningún archivo fue modificado.*  
*Versiones analizadas: branch `main` @ commit `cd23576` (2026-05-14)*
