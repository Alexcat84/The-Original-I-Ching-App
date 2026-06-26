# Auditoría de Análisis de Raíz — Warp "Thread killed by timeout manager"
**Código:** `00000000-AUD-SUP-02 warp-timeout-kills` · **Familia:** SUP · **Estado:** closed


**Fecha:** 2026-06-10  
**Actualización:** 2026-06-10 — Monitor identificado; P0 implementado en `feat/warp-connection-efficiency`  
**Cierre confirmado:** 2026-06-25 — Warp/PostgREST (alcance original, puntos 1-3) verificado en vivo con dos fuentes independientes (Axiom 14d + MCP Supabase 24h contra prod `wgborqkfnxfarkdaotsd`), ver "Verificación en vivo" más abajo. Fase 8 / fix OOM Android (punto 4, hallazgo posterior) desplegada según confirmación del propietario; sin verificación de herramienta (Sentry no disponible en este workspace) — única pieza que sigue sin evidencia independiente.  
**Alcance:** Capa de PostgREST y Pool de Conexiones de Supabase / Concurrencia de la App  
**Herramientas:** Scripts Supabase (Grok), análisis arquitectónico (antigravity Claude Opus), inspección de codebase, **MCP Supabase (verificación en vivo 2026-06-25)**  
**Estado:** ✅ P0+P1 verificados en vivo en prod (2026-06-25); Phase 8 desplegada, confirmada por el propietario, sin verificación de herramienta para el componente Android/Sentry.  
**Relacionado:** [00000000-AUD-SUP-01-supabase-db-stability.md](file:///c:/Users/AlexDesk/Documents/iching-app/docs/auditorias/00000000-AUD-SUP-01-supabase-db-stability.md), [00000000-AUD-MOB-HYD-02-sqlite-chat-hydration.md](./00000000-AUD-MOB-HYD-02-sqlite-chat-hydration.md)

---

## Resumen Ejecutivo

Los errores de Warp que resultan en `Thread killed by timeout manager` son el resultado de la **saturación del pool de conexiones PostgREST** (~10 conexiones internas; el plan Pro no eleva este número — corregido 2026-06-25, ver §"Verificación en vivo" más abajo; la cifra "30" de una redacción anterior era un error material de diagnóstico). 

Este incidente no se debe a consultas masivas de base de datos aisladas, sino a una **amplificación de requests simultáneos por cliente**, agravada por endpoints críticos que realizan llamadas secuenciales sin semáforo o que bypasean por completo el rate-limiting local. Cuando el pool se satura, las consultas se encolan, superan el timeout interno de Warp (~60s) y son terminadas de forma abrupta, provocando fallos en cadena y reintentos infinitos por parte del cliente web/móvil.

---

## 1. Evidencia de Logs y Patrón Temporal

El análisis de los timestamps muestra dos patrones claros de saturación:

| Ventana Temporal (10 Jun) | Eventos (Kills) | Diagnóstico de Tráfico |
|---------------------------|-----------------|------------------------|
| **02:14 – 03:51 UTC**     | ~20+ kills      | **Patrón sostenido con separación de ~60s**: Coincide con polling del Health Check externo activo. |
| **16:30 – 16:50 UTC**     | 6 kills         | **Cluster rápido (burst)**: Login burst y sincronización de sesiones del usuario. |
| **17:20 – 17:22 UTC**     | 4 kills         | **Cluster rápido (burst)**: Actividad concurrente. |
| **19:30 – 19:35 UTC**     | 6 kills         | **Cluster rápido (burst)**: Login / bootstrap concurrente. |
| **21:17 – 21:38 UTC**     | 6 kills         | **Cluster rápido (burst)**: Actividad reciente. |

---

## 2. Diagnóstico Técnico: Vectores de Saturación

La saturación se produce por la acumulación de los siguientes vectores:

### 2.1 `/api/account/bootstrap` — 5 Queries Secuenciales en 1 Slot de Semáforo
El bootstrap de inicio del cliente (usado para refresh y logins) se encuentra protegido por el semáforo local `withSupabaseSemaphore` (máximo 2 concurrente local, cap global Redis de 20). Sin embargo, **mantiene ocupado el slot de semáforo** ejecutando secuencialmente 5 peticiones PostgREST:

1. `getAuthenticatedUser` (con cache intermedio de 60s).
2. `readCreditsRow` en `query_credits` (SELECT rápido por PK).
3. `getUserSessionSummaries` (1/2) en `consultation_sessions` (SELECT de sesiones por usuario).
4. `getUserSessionSummaries` (2/2) en `consultations` (SELECT de consultas asociadas al usuario con order por `session_position`).
5. Perfil de usuario (SELECT en `users` por PK).
6. Aceptaciones legales (SELECT en `user_legal_acceptances`).

> [!CAUTION]
> Aunque el semáforo limite la concurrencia a nivel de Node.js, la base de datos recibe hasta **5 queries por request de bootstrap**. Si una de ellas es lenta o se bloquea por I/O, el semáforo bloquea las solicitudes entrantes, encolando el resto de los hilos de Node y agotando el timeout de Warp.

### 2.2 `/api/consult` — Bypaseo Crítico del Semáforo
El endpoint de consulta (`/api/consult`) hace llamadas PostgREST que **no pasan por `withSupabaseSemaphore`**.

* **Problema:** Llama a `readCreditsRow()` en dos ocasiones distintas: una para obtener el tier de billing (`getUserBillingTier`) y otra para validar el límite de sesiones (`getSessionLimit`).
* **Consecuencia:** Estas 2 llamadas se ejecutan de forma directa y asíncrona, abriendo conexiones en PostgREST de forma invisible para los semáforos. Bajo carga moderada, evaden el límite global de 20 e inundan el pool de 30 conexiones.
* **Flujo actual de conexiones por consulta:**
  ```
  getAuthenticatedUser()    → auth.getUser() (Sin semáforo, cacheado 60s)
  getUserBillingTier()      → readCreditsRow() (SIN semáforo) ❌
  getSessionLimit()         → readCreditsRow() (SIN semáforo) ❌
  withSupabaseSemaphore()   → getUserSessionThreadMeta (2 queries)
  withSupabaseSemaphore()   → consumeToken RPC (1 query)
  withSupabaseSemaphore()   → upsertSessionAndConsultation (3-5 queries)
  ```
  *Total:* Hasta **6 conexiones PostgREST simultáneas/secuenciales** por una sola interacción.

### 2.3 Health Check Externo sin Caché — **Monitor Identificado**

El endpoint [`/api/health`](file:///c:/Users/AlexDesk/Documents/iching-app/apps/web/src/app/api/health/route.ts) ejecuta una query real a base de datos (`users?select=id&limit=1`) a través del semáforo.

**Monitor identificado (2026-06-10):** Los scripts PowerShell de smoke testing en `.tmp/` (`smoke-monitor.ps1`, `smoke-monitor-live.ps1`) hacen ping a `https://theoriginaliching.com/api/health` cada 60s durante las sesiones de testing. No son servicios persistentes — corren 10-15 min cuando se ejecutan manualmente. El smoke poll log confirma: `"Health check noise: ~20× GET users?select=id&limit=1 | node (200)"`. El User-Agent `node` en los logs de Supabase es el runtime Node.js de Vercel, no el cliente PowerShell.

`next-axiom` (en `middleware.ts` y `next.config.mjs`) también wrappea cada request pero solo reenvía logs a Axiom — no genera pings propios a `/api/health`.

### 2.4 pg_cron `prewarm-consultation-content` & I/O Contention
El prewarm de la tabla `consultation_content` y su respectiva tabla TOAST (migración `065_fix_prewarm_cron.sql`) corre cada 15 minutos. Al precalentar páginas de TOAST a shared buffers:
* Genera contención de I/O en disco.
* Causa retrasos en queries rápidas de metadata durante checkpoints de la DB.
* Las queries encoladas superan los límites de Warp.

### 2.5 Timeouts Permisivos en Roles de Postgres
El timeout por defecto para las sentencias ejecutadas por los roles `authenticated` y `authenticator` es de **30 segundos** en Supabase. Si una query se ralentiza por contención de I/O, el pool mantiene abierta esa conexión hasta por 30s en lugar de fallar rápido, lo que agota la disponibilidad para solicitudes rápidas.

### 2.6 TOAST Bloat no Reclamado
La migración 066 limpió los campos legacy de interpretación (`interpretation` y `oracle_bones`) pasándolos a NULL en la tabla `consultations`. Sin embargo, las páginas de TOAST huérfanas siguen ocupando espacio en disco (~270 MB de bloat) ya que nunca se corrió un `VACUUM FULL consultations` para reclamarlas físicamente.

### 2.7 Amplificación de Reintentos en Cliente (Cascada)
La función [`fetchWithAuthResilience`](file:///c:/Users/AlexDesk/Documents/iching-app/apps/web/src/app/page.tsx#L2659-L2694) en el frontend implementa reintentos automáticos (hasta 3 reintentos con 9s de retraso) si el bootstrap falla. Si un usuario experimenta un Warp kill por timeout:
1. El cliente espera y vuelve a enviar la ráfaga de 5 peticiones.
2. Si el pool sigue ocupado, el reintento agrava la saturación.
3. Si los 3 reintentos fallan, el WebView dispara una llamada fallback adicional al no encontrar el hilo en SQLite (`rn:thread-not-found`), duplicando el tráfico de bootstrap.

---

## 3. Sospechoso Principal: `getUserSessionSummaries`

El método [`getUserSessionSummaries`](file:///c:/Users/AlexDesk/Documents/iching-app/apps/web/src/lib/session-store.ts#L377-L454) hace dos queries separadas dentro del bloque de ejecución semaforizado. El segundo select:

```typescript
// session-store.ts:393-397
const { data: consultRows, error: consultError } = await supabase
  .from("consultations")
  .select("session_id, created_at, question, session_position")
  .eq("user_id", userId)
  .order("session_position", { ascending: true });
```

Este query recupera **todas** las consultas asociadas al usuario sin paginación ni filtro de sesión activa. Para usuarios con un histórico largo, esta consulta es pesada, consume más recursos de red y retiene el slot del semáforo, bloqueando a otros usuarios entrantes.

---

## 4. Plan de Remediación Propuesto

---

## 5. Plan de Remediación — Estado de Implementación

### P0 — Mitigación Inmediata ✅ Implementado en `feat/warp-connection-efficiency`

| # | Acción | Archivo | Estado | Impacto |
|---|--------|---------|--------|---------|
| 1 | Health check sin query PostgREST (solo Redis ping) | `apps/web/src/app/api/health/route.ts` | ✅ | -1 conexión permanente cada ~60s |
| 2 | Eliminar segundo `readCreditsRow` en `/api/consult` — derivar `sessionLimit` de `lastPack` ya leído | `apps/web/src/app/api/consult/route.ts` | ✅ | -1 conexión PostgREST por consulta |
| 3 | `BOOTSTRAP_CACHE_TTL_SECONDS` 30s → 120s | `apps/web/src/app/api/account/bootstrap/route.ts` | ✅ | -75% de cache misses en bootstrap |

**Reducción estimada con P0:** de ~8 requests PostgREST/login a ~6. El patrón de kills sostenidos cada 60s (health check) queda eliminado.

---

### P1 — Reducción Estructural ⬜ Siguiente rama

| # | Acción | Archivo | Estado | Impacto |
|---|--------|---------|--------|---------|
| 4 | RPC consolidado `get_user_bootstrap_summary` — reemplaza 2 SELECTs de `getUserSessionSummaries` con 1 JOIN server-side | Migración SQL + `session-store.ts` | ⬜ | -2 queries PostgREST/login |
| 5 | Cache Redis para session summaries (TTL 60s, invalidar en consult + delete) | `session-store.ts` | ⬜ | Elimina queries en reloads |
| 6 | Eliminar llamada duplicada `getUserBillingTier` — wrapper ya resuelto en P0 | `credits.ts` | ⬜ | Cleanup |

**Reducción estimada con P0+P1:** de ~8 a ~2 requests PostgREST/login.

---

### P2 — Infraestructura Supabase ⬜ Pendiente manual

| # | Acción | Estado |
|---|--------|--------|
| 7 | Upgrade a **Medium compute** (Supabase Dashboard → Settings → Compute) | ⬜ |
| 8 | Aplicar **migration 070** en producción (pg_cron VACUUM weekly) | ⬜ |
| 9 | **VACUUM FULL consultations** en ventana de mantenimiento (reclamar TOAST bloat ~270MB de migration 066) | ⬜ |
| 10 | Ticket **SU-392270** — aumentar `statement_timeout` 8s → 30s | ⬜ |

---

### P3 — Optimización adicional ⬜ Post-lanzamiento

| # | Acción | Impacto |
|---|--------|---------|
| 11 | Thread hydration lazy (solo al abrir chat, no en bootstrap automático) | -3 queries PostgREST/login |
| 12 | Reducir prewarm cron de 15min → 30min | Menos I/O contention |
| 13 | Limpiar scripts `.tmp/smoke-monitor*.ps1` (no ejecutar durante testing en producción) | Elimina health check noise |

---

## Phase 8 — OOM Crash Fix Android (2026-06-10)

### Hallazgo: Cadena Causal OOM → OAuth → Crash

**Sentry #7542347795** — `OutOfMemoryError` en Samsung Galaxy S24 Ultra (Android 16).

El crash de la app Android ("The Original I Ching keeps stopping") NO se origina en los Warp kills
sino en una cadena causal de 4 pasos:

1. **`GET /api/account/chats?thread=1`** devuelve interpretaciones TOAST completas (~15KB × N consultas)
2. OkHttp en el proceso del WebView intenta buffear el JSON completo → **OOM** (heap 256MB, <1% libre)
3. `onRenderProcessGone` reinicia el WebView → la web carga **sin localStorage** → muestra login
4. `onShouldStartLoadWithRequest` intercepta OAuth → abre Chrome → Back = crash

**Evidencia Sentry (breadcrumbs):**

| Timestamp | Evento | Duración |
|-----------|--------|----------|
| 17:20:18 | `GET /api/account/sessions-only` → 200 | ~3s |
| 17:20:33 | `GET /api/account/chats?thread=1` → 200 | **~15s** |
| 17:20:37 | **OOM crash** | 4s después de recibir response |

### Fix A: Two-Phase Thread Sync ✅

**Archivo:** `apps/mobile/src/sync/sync-service.ts` — función `syncChatThread`

**Antes:** Un solo `fetch` de `thread=1` que traía meta + TOAST completo en una sola respuesta HTTP.

**Después:** Dos fases:
- **Phase 1** (`meta=1`): Response pequeño (~2KB), timeout 8s. Señala `onReady` inmediatamente.
- **Phase 2** (`content=1`): TOAST columns en background, con `mergeContentIntoMessages` en SQLite.

Reduce el pico de memoria de ~120KB+ (interpretaciones) a ~5KB (solo metadatos).

### Fix B: Renderer Crash Session Recovery ✅

**Archivo:** `apps/mobile/app/index.tsx`

**Antes:** `onRenderProcessGone` solo llamaba `setWebViewKey(k+1)` — el WebView reiniciaba sin sesión.

**Después:**
1. `rendererCrashedRef.current = true` en `onRenderProcessGone`
2. En `onLoadEnd`, si el flag está activo:
   - Lee token de `SecureStore`
   - Valida JWT localmente (`validateStoredToken`)
   - Re-inyecta vía `__rnInjectSession`
   - Bloquea `auth_signout` transitorio durante 3s (`authTransitionRef`)

El usuario mantiene su sesión tras un OOM kill sin ver la pantalla de Google OAuth.

---

## Comentarios Cursor Auditor — 2026-05-26

> **Instrucción:** Solo validación del constructor. **No modifica** secciones anteriores. Señala texto obsoleto vs código/`main` actual.

### Metadatos del documento — desincronización

| Campo en doc | Valor actual en doc | Valor verificado en código/repo | Acción sugerida |
|--------------|--------------------|---------------------------------|-----------------|
| Línea 7 “Estado” | P0+P1 implementados; Phase 8 pendiente deploy | P0+P1 en `main` (`e542d7a`, `a3e8ac3`); Phase 8 merge `90a6650` + fixes posteriores (hydration gate, dist 54–55) | Constructor: actualizar “Phase 8 pendiente deploy” → validar APK/dist en dispositivo |
| Línea 4 “Actualización” | 2026-06-10, rama `feat/warp-connection-efficiency` | Rama mergeada; no usar nombre de rama como estado vigente | Actualizar fecha y quitar referencia a rama cerrada |
| Resumen ejecutivo L14 | Pool máximo **30** conexiones Pro | Runbook + logs: pool PostgREST **~10** (`00000000-RUN-SUP-02-supabase-scalability.md`, `GLOBAL_MAX_CONCURRENT=8`) | **Corregido 2026-06-25** — confirmado en vivo vía MCP Supabase (log de arranque del pool), ver "Verificación en vivo" más abajo |

---

### §2 Diagnóstico — secciones parcialmente obsoletas

#### §2.1 Bootstrap “5 queries”

- **Antes del P1:** 2 SELECTs en `getUserSessionSummaries` + credits + users + legal ≈ 5–6 round-trips.
- **Después del P1 (`a3e8ac3`):** 1 RPC `get_user_session_summaries` + cache Redis 60s (`session-store.ts`). Bootstrap bajo semáforo ≈ **4** queries (credits, RPC summaries, users, legal) en cache miss; **0** queries summaries en cache hit.
- El párrafo L39–46 y la lista numerada L41–46 describen el **estado pre-071**. Constructor: añadir subsección “Post-P1 (2026-06-10)” o marcar §2.1 como histórico.
- **Cap global Redis:** doc dice “20” (L39); código = **8** desde `05177a5`.

#### §2.2 `/api/consult` bypass semáforo

- **P0 aplicado:** eliminado segundo `readCreditsRow`; `sessionLimit` deriva de `getSessionLimitFromPack(lastPack)` tras un solo `getUserBillingTier()` (L613–614 `consult/route.ts`).
- **Residual válido:** `getUserBillingTier()` → `readCreditsRow()` sigue **sin** `withSupabaseSemaphore` (1 conexión/consulta). El diagrama L57–64 ya no aplica la línea `getSessionLimit() → readCreditsRow()` ❌.
- Constructor: reescribir flujo post-P0; mantener advertencia solo para `getUserBillingTier`.

#### §2.3 Health check

- **Obsoleto desde P0:** L69–71 afirman query `users?select=id&limit=1`. Código actual (`health/route.ts`): **sin Supabase**; Redis ping opcional.
- Patrón kills cada ~60s (§1, ventana 02:14–03:51): causa raíz **eliminada en código**; puede repetirse solo si prod aún sirve build anterior o scripts externos pegan otro endpoint que sí toque DB.
- Nota: user-agent `node` en logs Supabase = runtime Vercel, no solo PowerShell — sigue siendo válido.

#### §3 Sospechoso `getUserSessionSummaries`

- El bloque L97–106 cita el SELECT full-scan en `consultations` — **eliminado**; reemplazado por RPC JOIN en Postgres (071).
- Constructor: mover §3 a “Histórico pre-071” o sustituir por descripción del RPC.

---

### §5 Plan de remediación — estado real vs tabla del doc

#### P0 — ✅ Confirmado en `main`

Commits `e542d7a`. Coincide con tabla L120–124.

#### P1 — Doc dice ⬜; código dice ✅

| # | Acción doc | Estado auditor | Evidencia |
|---|-----------|----------------|-----------|
| 4 | RPC consolidado | ✅ Implementado | `071_bootstrap_summary_rpc.sql`, RPC name = **`get_user_session_summaries`** (no `get_user_bootstrap_summary` del texto plan) |
| 5 | Cache Redis summaries | ✅ Implementado | `SESSION_SUMMARIES_CACHE_TTL_SECONDS = 60`, invalidación en upsert/delete |
| 6 | Eliminar duplicado `getUserBillingTier` | ⬜ / mal formulado | P0 eliminó duplicado de **session limit**, no el billing tier call. Ítem 6 sigue siendo mejora opcional (cache tier 60s o semáforo) |

**Reducción estimada L138 “8 → 2”:** auditor considera **optimista**. Post-P0+P1 realista ≈ **4–6** PostgREST en login burst (bootstrap miss + thread hydration al abrir chats). Constructor: recalibrar métrica objetivo.

#### P2 — Sin cambio vs doc

070 prod, Medium, VACUUM FULL, ticket SU-392270 siguen ⬜. Infra actual = **Small**, no Medium — coherente con posponer 0C.

#### P3 — Item 13 smoke monitors

Sigue válido: scripts `.tmp/smoke-monitor*.ps1` ya no amplifican PostgREST vía health **si** prod tiene health P0. Riesgo residual = otros endpoints bajo carga.

---

### Phase 8 — estado post-auditoría (cerrado 2026-06-25)

- Fix A (two-phase sync) y Fix B (renderer recovery): presentes en repo.
- **Evolución posterior al doc:** hydration gate per-session (`2e8044e`), attestKey fix, dist **54–55**. Ver `docs/auditorias/00000000-AUD-MOB-HYD-01-chat-thread-hydration.md`.
- **Cierre:** confirmado con dos fuentes de telemetría independientes (ver verificación en vivo abajo) para los puntos 1-3; el punto 4 (OOM Android, Sentry) sigue apoyado solo en confirmación del propietario — ver nota al final de esta sección.

---

### Verificación en vivo — Supabase MCP (2026-06-25, solo lectura, prod `wgborqkfnxfarkdaotsd`)

Verificación cruzada pedida explícitamente para no cerrar el audit solo con confirmación verbal. Corrida vía MCP Supabase (Cursor) contra producción — Postgres 17.6.1.105, ca-central-1, ACTIVE_HEALTHY.

**1. Warp / timeout kills — Supabase vs Axiom**

| Patrón buscado | API (PostgREST), 24h | Postgres, 24h |
|---|---|---|
| `Thread killed by timeout manager` | 0 | 0 |
| `57014` / `canceling statement` | 0 | 0 |
| `warp` | 0 | 0 |
| HTTP 500/502/503/504 en `/rest/v1/*` | 0 | n/a |
| Pool agotado / connection exhausted | 0 | 0 |

Muestra API 24h (~100 entradas): solo 200/204/302 en REST; errores = 403 auth + 429 rate-limit en `/auth/v1/recover` (esperado, no relacionado). RPC 071 (`get_user_session_summaries`) respondiendo 200 en vivo.

**Correlación con Axiom** (consulta independiente, misma sesión, ventana de 14 días sobre `iching-app-main`): **0 eventos** de timeout/kill/57014 en esa ventana — confirmado en el turno anterior de esta misma conversación.

**Limitación documentada:** `get_logs` del MCP Supabase solo cubre ~24h (límite del propio tool). La ventana de 14 días queda confirmada por **Axiom únicamente**; para que Supabase cubra los mismos 14 días haría falta una pasada manual en Dashboard → Logs → Logs Explorer. No bloqueante para el cierre — dos fuentes independientes ya coinciden en 0 para el periodo que ambas pueden cubrir.

**2. Pool de conexiones — cifra real**

| Capa | Valor medido en prod | Fuente |
|---|---|---|
| Pool interno PostgREST | **~10 conexiones** | Log de arranque: `Connection Pool initialized with a maximum size of 10 connections`; consistente con `00000000-RUN-SUP-02-supabase-scalability.md` §2. Pro no lo eleva. |
| `max_connections` Postgres | 90 | `pg_settings`, prod |
| `statement_timeout` | 120000 ms (120s) | Ya no son los 8s/30s de versiones anteriores del audit |

Supavisor (puerto 6543, pooler de conexión) solo es visible en el Dashboard (Project Settings → Database → Connection pooling) — no expuesto vía MCP. No se verificó ese número específico; no afecta la conclusión porque el cuello de botella documentado siempre fue el pool **PostgREST** (~10), no Supavisor.

**3. Migraciones 070, 071, 073 en prod**

| # | Check | Estado |
|---|-------|--------|
| 070 | cron `weekly-vacuum-iching` | ✅ OK |
| 071 | RPC `get_user_session_summaries` | ✅ OK |
| 073 | revoke PUBLIC/anon/auth en 071 + RLS `token_refund_log` | ✅ OK |

Cron jobs activos confirmados en prod: `prewarm-consultation-content` (`*/15 * * * *`) y `weekly-vacuum-iching` (`0 4 * * 0`).

**4. OOM Android (Sentry #7542347795)** — confirmado fuera de alcance de Supabase: el crash ocurre en el proceso nativo del WebView, antes de que cualquier respuesta llegue al logging del servidor; no aparece ni puede aparecer en logs de API/Postgres. Cierre de este punto específico sigue pendiente de: (a) revisión directa en Sentry del issue (¿sin eventos nuevos desde el fix?), o (b) smoke en dispositivo real. Ninguna de las dos se hizo en esta sesión — el MCP de Cursor en este workspace no tiene Sentry conectado.

**Veredicto consolidado:**

| Punto | Veredicto | Evidencia |
|-------|-----------|-----------|
| 1. Warp/57014 | ✅ PASS | Axiom 14d = 0 + Supabase MCP 24h = 0, dos fuentes independientes |
| 2. Pool de conexiones | ✅ PASS (corregido) | PostgREST ~10 confirmado en vivo; cifra "30" del resumen ejecutivo era error de diagnóstico, ya corregida arriba |
| 3. Migraciones | ✅ PASS | 070/071/073 aplicadas y funcionando en prod |
| 4. OOM Android | ⚠️ Sin verificación independiente | Descansa en confirmación del propietario; herramienta de verificación (Sentry) no disponible en este workspace |

Los puntos 1-3, que son el alcance original de esta auditoría (Warp/PostgREST), quedan cerrados con evidencia reproducible de dos fuentes. El punto 4 es un hallazgo posterior (Phase 8) de un dominio distinto (crash nativo Android) y queda señalado explícitamente como la única pieza sin verificación de herramienta en este cierre.

---

### Evidencia operacional reciente (para validación smoke)

| Fuente | Ventana | Resultado auditor |
|--------|---------|-------------------|
| `supabase_logs.json` (usuario) | 2026-06-11 23:00–23:46 UTC | 51 entradas, 100% success, **0 Warp**, bootstrap + 4 sesiones OK |
| `00000000-RUN-SUP-03-smoke-post-small.md` | 2026-06-10 ~02:14 UTC | **FAIL** kick OAuth (pre-fix auth `eeea551`) |
| Conclusión | — | Logs prod recientes alentadores; **no sustituyen** smoke formal post-Fase 7 en dispositivo (Warp 0, 0 logout OAuth) |

---

### Hallazgos transversales (constructor)

1. **Dos documentos desincronizados entre sí:** WARP audit L7 dice P0+P1 implementados; §5 P1 tabla dice ⬜. `00000000-PLAN-SUP-07-scale-infrastructure.md` dice P1 en “próxima rama”. Unificar en una sola fuente de verdad.
2. **Migraciones prod:** 071 necesaria para que RPC funcione; si prod muestra sesiones en bootstrap (logs jun-11), RPC probablemente aplicada — **confirmar** con `verify_migrations.sql` (070/071/073).
3. **Auth vs pool:** fixes PR1–PR3 (`fetchWithAuthResilience`, mobile gate) no están en este audit; Warp 0 en logs no implica OAuth kick resuelto en APK viejo.
4. **Próximo paso código (opcional, no en P1):** meter `getUserBillingTier` bajo semáforo o cache Redis; tag Sentry `claude_429` explícito (Fase 6 plan).

*Auditor: Cursor Agent · inspección estática; sin query en vivo a Supabase en esta pasada.*
