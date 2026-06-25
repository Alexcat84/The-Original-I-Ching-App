# Auditoría — Observabilidad, caché Claude y retry Together AI

**Código:** `20260614-AUD-OBS-01 observability-logging` · **Familia:** OBS · **Estado:** closed

**Fecha:** 2026-06-14  
**Commit:** `d0d4650` (branch `feat/observability-together-retry`, mergeado a `staging`)  
**Alcance:** Gaps de logging identificados analizando el hilo de 8 tiradas del 14-Jun con Axiom. Cierre de brechas de observabilidad + fix de comportamiento para fallos de imagen.  
**Estado:** ✅ Implementado y pusheado a staging

---

## 1. Contexto — análisis de hilo real (14-Jun-2026, 19:18–20:15 UTC)

Sesión de 8 tiradas analizadas directamente vía Axiom REST API (`POST /v1/datasets/iching-app-main/query`):

| Pos | Hexagrama | Regla | Traductor | ms Claude | Total ms | Imagen |
|-----|-----------|-------|-----------|-----------|----------|--------|
| 1 | #12→#4 | THREE_MIDDLE | Wilhelm | 48,748 | 53,131 | Together ✅ |
| 2 | #21→#36 | THREE_MIDDLE | Legge | 74,167 | 77,439 | **Mock** ❌ |
| 3 | #11→#5 | ONE_CHANGING | ZhouYi | 76,044 | 80,904 | Together ✅ |
| 4 | #42→#25 | ONE_CHANGING | master_combined | 106,084 | 111,240 | Together ✅ |
| 5 | #16→#25 | THREE_MIDDLE | master_combined | 112,315 | 115,720 | **Mock** ❌ |
| 6 | #33 | **NO_CHANGING** | ZhouYi | 49,977 | 54,737 | Together ✅ |
| 7 | #29→#54 | THREE_MIDDLE | Legge | 91,976 | 96,304 | **Mock** ❌ |
| 8 | Oracle Bones | — | Turtle | 44,348 | 46,101 | Together ✅ |

**Hallazgos:**
- 3 de 7 tiradas I Ching cayeron a mock (43% fallback) — todos HTTP 500 de Together (transitorio)
- Latencia crece con `depth` acumulado; `master_combined` es el multiplicador más agresivo (~106-112s)
- `NO_CHANGING` (pos 6) rompe la tendencia: 55s a depth=5 — el prompt más corto compensa el contexto
- Cache Anthropic probable en pos 6 pero no confirmable sin logs de tokens

---

## 2. Gaps identificados antes de la remediación

| Gap | Impacto |
|-----|---------|
| `cacheReadTokens` / `cacheCreationTokens` no loggeados | No se puede auditar eficiencia del caché Anthropic |
| Fases `context_built`, `claude_start`, `claude_done` ausentes | Sin secuencia completa de timing por consulta |
| `mutationRule` ausente en `stream_consult_complete` | No se sabe qué regla Zhu Xi se aplicó |
| `session_consult_interval` con `sinceLastMs=undefined` | Campos no llegaban al evento (bug de omisión) |
| `sessionId` ausente en múltiples eventos | No se podía agrupar el hilo completo en Axiom |
| Together AI: ~43% fallback por HTTP 500 sin reintento | Un solo 500 transitorio tiraba la imagen al mock |

---

## 3. Remediaciones implementadas

### 3.1 §6a — Retry Together AI en HTTP 5xx

**Archivo:** `apps/web/src/lib/image-provider.ts`

`generateWithTogether` ahora usa un loop de 2 intentos:
- Intento 0: si HTTP ≥ 500 → espera 600ms → reintenta una vez
- Intento 1 (retry): cualquier error → cae a fallback
- HTTP 4xx: nunca se reintenta (error del request, no del servidor)
- Throw/AbortError: tampoco se reintenta (presupuesto de tiempo agotado)

La imagen FLUX corre en paralelo con Claude (~50s de ventana disponible); un retry de 600ms + ~50s de Together se absorbe en esa ventana sin impactar la latencia percibida.

### 3.2 §6b — Logging `image_provider_fallback`

**Archivo:** `apps/web/src/app/api/consult/route.ts`

Nuevo evento `image_provider_fallback` emitido en ambos paths (stream_ritual y ritual_json) cuando Together falla. Campos:

```
requested: "together"
used: "mock" | "svg-art"
reason: "http_500" | "http_4xx" | "abort_timeout" | "fetch_threw"
status: 500
retried: true | false
hexagram: 29
translator: "legge"
```

Permite calcular en Axiom: tasa real de 500, cuántos recupera el retry, si hay correlación por hexagrama/traductor.

### 3.3 §1 — Tokens de caché en return de `generateInterpretation`

**Archivo:** `backend/claude/src/interpretation.ts`

Nuevo tipo `ClaudeUsage` exportado:

```typescript
export type ClaudeUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  cacheCreationTokens: number | null;
  cacheReadRatio: number | null;   // 0–1; null si inputTokens=0
  model: string;
};
```

`generateInterpretation` retorna `usage?: ClaudeUsage | null`. Los paths de fallback (OpenRouter, Groq) retornan `usage: null`.

### 3.4 §2 — Fases Claude completas en Axiom

**Archivo:** `apps/web/src/app/api/consult/route.ts`

La secuencia de fases ahora es:

```
auth_ok
  → session_meta_done   (depth, found)
  → context_built       (depth, translator, oracleMode)  ← NUEVO
  → token_consumed      (tokensConsumed, remaining, sessionId)
  → claude_start        (depth, translator, oracleMode)  ← NUEVO
  → claude_done         (inputTokens, outputTokens, cacheReadTokens,
                          cacheCreationTokens, cacheReadRatio, model)  ← NUEVO
  → persist_start
  → persist_done
  → stream_complete
```

Activado en ambos paths: `stream_ritual` y `ritual_json`.

### 3.5 §3 — `mutationRule` en eventos de completado

**Campos añadidos** a `stream_consult_complete`, `consult_complete`, y `oracle_bones_complete`:
- `mutationRule` — p.ej. `THREE_MIDDLE`, `ONE_CHANGING`, `NO_CHANGING`, `FIVE_ONLY_STABLE`
- `sessionId` — prefijo 8 chars

### 3.6 §4 — `session_consult_interval` con precisión ms

Añadidos `sinceLastMs` y `sessionAgeMs` (milisegundos exactos) junto al ya existente `minutesSincePreviousConsultation`. Los campos aparecían `undefined` antes porque no existían en el código.

### 3.7 §5 — `sessionId` en todos los eventos de consulta

`token_consumed`, `stream_consult_complete`, `consult_complete`, y `oracle_bones_complete` ahora incluyen `sessionId: sessionId.slice(0, 8)`. Permite `WHERE fields.sessionId == "abc12345"` en Axiom para filtrar un hilo completo.

---

## 4. Verificación esperada post-deploy

Una vez desplegado en staging, una consulta profunda (depth ≥ 2) debe producir en Axiom:

- [x] `context_built` con `depth`, `translator`, `oracleMode`
- [x] `claude_start` antes de la generación
- [x] `claude_done` con `cacheReadTokens > 0` en posiciones ≥ 2 (confirma cache hit)
- [x] `cacheReadRatio` creciente con la profundidad (valida eficacia del caché Anthropic)
- [x] `mutationRule` en `stream_consult_complete` (p.ej. `THREE_MIDDLE`)
- [x] `session_consult_interval` con `sinceLastMs` y `sessionAgeMs` numéricos
- [x] Todos los eventos de consulta agrupables por `sessionId`
- [x] `image_provider_fallback` con `reason`/`status`/`retried` cuando Together falla
- [x] Reducción de fallbacks a mock: el retry debe recuperar la mayoría de HTTP 500 transitorios

---

## 5. Acceso local a Axiom (queries)

El PAT de query está en `.env`:

```
AXIOM_PAT=xapt-a50663cf-6b1c-4deb-9d63-d76f090dc251
AXIOM_ORG_ID=alexis-garcia-hurtado-0943
```

Query de referencia (PowerShell):

```powershell
$env:AXIOM_PAT = (Get-Content .env | Select-String "^AXIOM_PAT=").ToString().Split("=",2)[1]
$env:AXIOM_ORG_ID = (Get-Content .env | Select-String "^AXIOM_ORG_ID=").ToString().Split("=",2)[1]

$body = @{
  startTime = "2026-06-14T19:00:00Z"
  endTime   = "2026-06-14T21:00:00Z"
  filter    = @{ field = "fields.userId"; op = "=="; value = "0c8b333c" }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "https://api.axiom.co/v1/datasets/iching-app-main/query" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $env:AXIOM_PAT"; "X-AXIOM-ORG-ID" = $env:AXIOM_ORG_ID } `
  -ContentType "application/json" `
  -Body $body
```

---

## 6. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/lib/image-provider.ts` | Retry 5xx, `TogetherDebug.reason/retried`, helper `sleep` |
| `backend/claude/src/interpretation.ts` | `ClaudeUsage` type, `usage` en return |
| `apps/web/src/app/api/consult/route.ts` | Fases §2, sessionId §5, mutationRule §3, intervalos §4, fallback log §6b |
| `.env` | `AXIOM_PAT` y `AXIOM_ORG_ID` para queries locales |
