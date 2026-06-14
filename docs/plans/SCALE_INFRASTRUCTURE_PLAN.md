# Plan de Escalabilidad — The Original I Ching App
**Objetivo:** Sostener 10,000–100,000 descargas en el primer año con infraestructura estable y costos controlados.  
**Fecha inicio:** 2026-06-10  
**Última actualización:** 2026-06-10 — Fases 1-6 completas; Fase 7 (eficiencia PostgREST) en curso

---

## Estado general

| Fase | Descripción | Estado |
|---|---|---|
| Fase 0 | Ops — sin código | 🟡 En progreso |
| Fase 1 | Persistencia de imágenes en R2 | ✅ Completa |
| Fase 2 | Semáforo PostgREST global (Redis) | ✅ Completa |
| Fase 3 | Rate limit por usuario en `/api/consult` | ✅ Completa |
| Fase 4 | Timeouts explícitos Vercel (`vercel.json`) | ✅ Completa |
| Fase 5 | Mantenimiento automático DB (pg_cron) | ✅ Completa |
| Fase 6 | Monitoring / alertas Sentry | ✅ Completa |
| Fase 7 | Eficiencia PostgREST (Warp kill root cause) | 🟡 En progreso — P0 en rama |

---

## Fase 0 — Ops (sin código)

### 0A. Ticket Supabase — aumentar db_pool

> **Objetivo:** Aumentar el pool de conexiones de PostgREST de 10 → 25.  
> Supabase Small compute **no** escala `db_pool` automáticamente con el tier.  
> Sin este cambio, con múltiples instancias Vercel el pool sigue siendo el cuello de botella.

- [x] Ticket abierto: **SU-392270**
- [ ] Respuesta recibida de Supabase
- [ ] Confirmación de que db_pool fue aumentado a 25

**Nota:** El ticket fue enviado por email directo. La respuesta automática indica que se trató como free plan.  
Si no hay respuesta en 48h, reenviar desde el dashboard de Supabase en **supabase.help** para que quede asociado al plan Pro.

---

### 0B. VACUUM ANALYZE — limpiar bloat post-migración 066/068

> **Objetivo:** Eliminar dead tuples dejados por el incidente de migración 066/068.  
> Autovacuum los limpia en background compitiendo con queries de usuarios.  
> VACUUM manual lo resuelve de una vez.

- [x] `VACUUM ANALYZE public.consultation_content;` — ✅ ejecutado 2026-06-10
- [x] `VACUUM ANALYZE public.consultations;` — ✅ ejecutado 2026-06-10
- [x] `VACUUM ANALYZE public.consultation_sessions;` — ✅ ejecutado 2026-06-10

---

### 0C. Upgrade Supabase a Medium compute

> **Objetivo:** 4GB RAM (vs 2GB Small), 2 vCPU dedicados.  
> Autovacuum deja de competir con queries en el mismo core.  
> Hacer **después** de que toda la implementación de código esté deployada.

- [ ] Hacer upgrade en Supabase Dashboard → Settings → Compute → Medium (~$50/mes)
- [ ] Verificar que el proyecto sigue respondiendo después del upgrade (restart breve esperado)

---

### 0D. Cambios de código ya aplicados

- [x] `withSupabaseSemaphore` bajado de MAX_CONCURRENT=4 → **2** por instancia — commit `fb54ca2`
- [x] `/api/health` guarded con `withSupabaseSemaphore` — commit `4a510bf`

---

## Fase 1 — Persistencia de imágenes en R2

> **Prioridad: CRÍTICA antes del lanzamiento.**  
> Sin esto, el historial de consultas queda con imágenes rotas para todos los usuarios en días/semanas.

### El problema

Together AI genera una imagen → devuelve una URL efímera (expira en días) → se guarda en `consultations.image_url` → usuario abre historial 2 semanas después → imagen rota.

### La solución

```
Together AI → URL o base64
                  ↓
           fetch / decode
                  ↓
          upload a R2 bucket
          key: generated/{userId}/{consultationId}.jpeg
                  ↓
          URL permanente de R2 → guardada en DB
          servida por Cloudflare CDN (egreso $0)
```

### Infraestructura R2 existente

| Variable | Valor | Estado |
|---|---|---|
| `R2_ACCOUNT_ID` | `28cda3cc3f4a51d8beae2dfa889184ad` | ✅ configurado |
| `R2_BUCKET` | `iching-fallbacks` | ✅ configurado |
| `R2_ACCESS_KEY_ID` | configurado | ✅ configurado |
| `R2_SECRET_ACCESS_KEY` | configurado | ✅ configurado |
| `R2_PUBLIC_URL` | `https://pub-362f393594b0493aab473e2fad44b24f.r2.dev` | ✅ configurado |

El bucket `iching-fallbacks` se usa hoy solo para imágenes pre-built (fallbacks).  
Las imágenes generadas irán en el mismo bucket con prefix `generated/`.

### Estructura del bucket post-implementación

```
iching-fallbacks/
  ├── iching/{1-64}/{1-10}/{WxH}.webp      ← existente (fallbacks pre-built)
  ├── bones/{verdict}/{1-10}/{WxH}.webp    ← existente (fallbacks pre-built)
  └── generated/
        └── {userId}/
              └── {consultationId}.jpeg    ← NUEVO (imágenes de usuario)
```

### Archivos a crear / modificar

| Archivo | Cambio | Tipo |
|---|---|---|
| `apps/web/src/lib/upload-to-r2.ts` | Nuevo: `uploadGeneratedImageToR2()` | CREAR |
| `apps/web/src/app/api/consult/route.ts` | Upload a R2 antes de guardar URL en DB | MODIFICAR |
| `package.json` de web | Añadir `@aws-sdk/client-s3` (S3-compatible con R2) | DEPENDENCIA |

### Detalles de implementación

**`upload-to-r2.ts`:**
- Acepta URL de Together (fetch primero) o string base64 (decode)
- Sube a R2 con `PutObjectCommand` de `@aws-sdk/client-s3`
- Endpoint R2: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
- Content-Type: `image/jpeg`
- Cache-Control: `public, max-age=31536000` (1 año — las imágenes nunca cambian)
- Devuelve `${R2_PUBLIC_URL}/generated/{userId}/{consultationId}.jpeg` o `null` si falla

**En `consult/route.ts`:**
- Después de que Together genera la imagen, ANTES de `upsertSessionAndConsultation`
- Upload corre **concurrente con `consumeToken`** → latencia neta = 0ms
- Si upload falla → se guarda URL de Together como antes (degraded, no error fatal)

### Impacto en costos

| Concepto | Costo |
|---|---|
| R2 storage 400GB (1M imágenes × 400KB) | $6/mes |
| R2 egress | **$0** (Cloudflare CDN gratis) |
| Supabase egress equivalente | ~$67/mes — evitado |

### Checklist de implementación

- [x] Instalar `@aws-sdk/client-s3` en `apps/web`
- [x] Crear `apps/web/src/lib/upload-to-r2.ts`
- [x] Modificar `apps/web/src/app/api/consult/route.ts`
- [x] Verificar en staging que Together URL → R2 URL en DB — ✅ 2026-06-10
- [x] Verificar que si R2 falla, la consulta igual completa (URL de Together en DB) — comportamiento degradado confirmado
- [x] Variables R2 en Vercel (producción + staging) — ya estaban configuradas (token `iching-fallbacks-rw`)
- [x] Deploy a main + staging — ✅ 2026-06-10
- [x] Smoke test: `consultations.image_url` = `https://pub-362f...r2.dev/generated/...` — ✅ confirmado en staging

### Nota sobre imágenes existentes

Las consultas anteriores al deploy tienen URLs de Together AI en DB.  
Cuando expiren, se verá el `thumbnail_url` (fallback pre-built de R2).  
**Post-lanzamiento (Fase 1.5):** job de migración para re-procesar URLs expiradas.

---

## Fase 2 — Semáforo PostgREST global (Redis distribuido)

> **Prioridad: ALTA** para cuando haya más de ~500 DAU.

### El problema

El semáforo actual (MAX_CONCURRENT=2) es **por instancia Vercel**, no global.  
Con 6 instancias simultáneas: 6 × 2 = 12 conexiones potenciales vs pool de 10.

### La solución

Reemplazar el contador local por un contador Redis atómico en `supabase-admin.ts`:

```
GLOBAL_MAX_CONCURRENT = 8   (2 × db_pool/3 — deja margen para picos)

INCR supabase:concurrent → resultado ≤ 8 → procede
                         → resultado > 8 → DECR + espera local
TTL de 10s en la key (auto-libera si el servidor crashea)
```

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `apps/web/src/lib/supabase-admin.ts` | `withSupabaseSemaphore` → acquire desde Redis primero |

### Interacciones

- **Con Fase 0A:** Si Supabase sube db_pool a 25, se puede subir `GLOBAL_MAX_CONCURRENT` a 15.
- **Con Fase 1:** Las subidas a R2 NO pasan por `withSupabaseSemaphore`. No consumen slots.
- **Fail-open:** Si Upstash Redis está caído, cae al comportamiento local actual. Sin regresión.

### Checklist

- [x] Implementar contador Redis en `supabase-admin.ts` — ✅ 2026-06-10
- [ ] Test: simular 10 instancias concurrentes → verificar que no se pasa del global limit
- [ ] Ajustar `GLOBAL_MAX_CONCURRENT` basado en respuesta del ticket 0A (actualmente 8)
- [x] Deploy a main + staging — ✅ 2026-06-10

---

## Fase 3 — Rate limit por usuario en `/api/consult`

> **Prioridad: MEDIA** — evita doble-tap y abuso.

### El problema

Sin este gate: un bug en el cliente (o doble-tap del usuario) dispara 2 consultas paralelas.  
Cada una consume 1 token y 1 slot del semáforo PostgREST simultáneamente.

### La solución

Redis key `consult:inflight:{userId}` con TTL de 120s:
- `SET NX` antes de llamar a Claude
- Si ya existe: `429` con mensaje i18n "Consulta en proceso, por favor espera"
- `DEL` al terminar (éxito o error)

### Interacciones

- **Con Fase 2:** Reduce la presión sobre el semáforo global. Máximo 1 consulta activa por usuario.
- **Con Claude API:** Elimina el riesgo de que un solo usuario exceda el rate limit de Anthropic por doble-submit.
- **Con token model:** `consume_token` sigue siendo atómico — este gate es una capa adicional de UX, no de seguridad de tokens.

### Checklist

- [x] Añadir gate Redis `consult:inflight:{userId}` en `apps/web/src/app/api/consult/route.ts` — ✅ 2026-06-10
- [x] Añadir mensaje i18n en los 11 idiomas: `consultationInProgress` en `consult-api-ui.ts` — ✅ 2026-06-10
- [x] TTL 120s + DEL en `finally` (garantiza liberación incluso si el proceso muere)
- [ ] Smoke test: doble-tap rápido → segundo request devuelve 429 amigable
- [ ] Deploy

---

## Fase 4 — Timeouts explícitos Vercel (`vercel.json`)

> **Prioridad: BAJA-MEDIA** — mejora el comportamiento bajo carga.

### El problema

Sin `vercel.json`, el timeout default de Vercel para todas las funciones es 60s.  
Un bootstrap que se queda colgado (PostgREST lento) ocupa un worker 60s antes de morir.

### La solución

```json
// apps/web/vercel.json
{
  "functions": {
    "src/app/api/consult/route.ts":                { "maxDuration": 300 },
    "src/app/api/account/bootstrap/route.ts":      { "maxDuration": 15 },
    "src/app/api/account/chats/route.ts":           { "maxDuration": 15 },
    "src/app/api/account/me/route.ts":              { "maxDuration": 10 },
    "src/app/api/account/sessions-only/route.ts":   { "maxDuration": 10 }
  }
}
```

`/api/consult` ya tiene `export const maxDuration = 300` en el route — `vercel.json` lo confirma a nivel infraestructura.

### Interacciones

- **Con `fetchWithAuthResilience`:** Bootstrap que falla rápido (15s timeout) → el cliente recibe 504 rápido → reintentos ya implementados en PR1.
- **Con Fase 2:** Workers liberados más rápido → menos presión en el semáforo global.

### Checklist

- [x] Crear `apps/web/vercel.json` — ✅ 2026-06-10
- [x] Verificar que `/api/consult` sigue funcionando (maxDuration=300 en ambos lados) — confirmado, `export const maxDuration = 300` en route + vercel.json
- [ ] Deploy

---

## Fase 5 — Mantenimiento automático DB (pg_cron)

> **Prioridad: BAJA** — previene degradación gradual.

### La solución

```sql
-- Migración 070_scheduled_vacuum.sql
SELECT cron.schedule(
  'weekly-vacuum-consultations',
  '0 4 * * 0',  -- Domingos 4am UTC (bajo tráfico)
  $$
  VACUUM ANALYZE public.consultation_content;
  VACUUM ANALYZE public.consultations;
  VACUUM ANALYZE public.consultation_sessions;
  $$
);
```

### Checklist

- [x] Crear `backend/db/migrations/070_scheduled_vacuum.sql` — ✅ 2026-06-10
- [x] Actualizar `backend/db/migrations/verify_migrations.sql` — ✅ 2026-06-10
- [ ] Aplicar en producción (SQL Editor de Supabase)
- [ ] Verificar que el cron quedó registrado: `SELECT * FROM cron.job;`

---

## Fase 6 — Monitoring y alertas

> **Prioridad: MEDIA** — sin esto, los problemas en producción son invisibles.

### Qué instrumentar

| Métrica | Alerta cuando | Canal |
|---|---|---|
| PostgREST semaphore `queueDepth` | > 3 en producción | Sentry |
| Together AI success rate | < 85% en ventana de 5 min | Sentry |
| R2 upload failure rate | > 5% en ventana de 5 min | Sentry |
| Claude API 429 | Cualquier ocurrencia | Sentry |
| Warp kills (PostgREST timeout) | Cualquier ocurrencia | Supabase logs |

### Checklist

- [ ] Añadir `Sentry.captureMessage` en `withSupabaseSemaphore` cuando `queueDepth > 3`
- [ ] Añadir tracking en `upload-to-r2.ts` cuando falla el upload
- [ ] Añadir tracking en `consult/route.ts` cuando Claude devuelve 429
- [ ] Revisar Supabase Dashboard → Logs → PostgREST semanalmente

---

## Fase 7 — Eficiencia PostgREST (Warp Kill Root Cause)

> **Prioridad: CRÍTICA** — causa raíz confirmada de los Warp kills.  
> Diagnóstico: auditoría completa en [`docs/auditorias/WARP_TIMEOUT_KILLS_AUDIT.md`](../auditorias/WARP_TIMEOUT_KILLS_AUDIT.md)  
> Herramientas: scripts Supabase (Grok) + análisis arquitectónico (antigravity Claude Opus)

### El problema

Con un solo usuario, la app abre **~8 conexiones PostgREST por login** (5 bootstrap + 3 thread hydration). Combinado con 2 conexiones sin semáforo en `/api/consult` y el health check consultando la DB cada ~60s durante testing, el pool se satura y Warp mata los threads. No es un problema de compute — es un problema de eficiencia.

### P0 — Completado ✅ (rama `feat/warp-connection-efficiency`)

| Fix | Archivos | Reducción |
|-----|---------|-----------|
| Health check sin PostgREST — solo Redis ping | `api/health/route.ts` | -1 conexión permanente/60s |
| Eliminar segundo `readCreditsRow` en `/api/consult` — derivar `sessionLimit` de `lastPack` ya leído (sync) | `api/consult/route.ts` | -1 conexión/consulta |
| `BOOTSTRAP_CACHE_TTL` 30s → 120s | `api/account/bootstrap/route.ts` | -75% cache misses |

### P1 — Consolidación de queries bootstrap ⬜ (próxima rama)

| Fix | Reducción |
|-----|-----------|
| RPC `get_user_bootstrap_summary` — JOIN server-side de `consultation_sessions` + `consultations` (2 queries → 1) | -2 queries PostgREST/login |
| Cache Redis para session summaries (TTL 60s, invalida en consult + delete) | Elimina queries en reloads |

**Objetivo final P0+P1:** de 8 → 2 requests PostgREST por login.

### Checklist

- [x] Fix health check — P0
- [x] Fix `readCreditsRow` duplicado — P0
- [x] `BOOTSTRAP_CACHE_TTL` 120s — P0
- [ ] Migración `071_bootstrap_summary_rpc.sql` — P1
- [ ] Cache Redis session summaries en `session-store.ts` — P1
- [ ] Deploy P0 a staging + main
- [ ] Smoke test: login → verificar 0 Warp kills en ventana de 10 min
- [ ] Upgrade Medium compute (Fase 0C, Supabase Dashboard)
- [ ] VACUUM FULL consultations (ventana mantenimiento)
- [ ] Migration 070 en producción

---

## Proyección de costos a escala

### 10,000 MAU — 2 consultas/semana promedio

| Componente | Costo/mes |
|---|---|
| Supabase Medium | ~$50 |
| Vercel Pro | $20 |
| Claude API (80K consultas × $0.02) | $1,600 |
| Together AI (80K imágenes × $0.004) | $320 |
| R2 storage (400GB generadas + fallbacks) | $6 |
| R2 egress | **$0** |
| Upstash Redis | $20 |
| **Total infraestructura** | **~$2,016** |

### Ingresos estimados (30% conversión, $10 promedio por compra)

```
10,000 MAU × 30% × $10 = $30,000/mes
Margen operativo: ~93%
```

---

## Notas y decisiones de arquitectura

- **R2 vs Supabase Storage:** R2 egreso es $0 (Cloudflare CDN). Supabase Storage egreso es $0.09/GB. A 400GB/mes de imágenes: R2 = $6, Supabase = $36 solo en storage + ~$36 en egreso = $72. R2 gana por amplísimo margen.

- **Mismo bucket para fallbacks y generadas:** El bucket `iching-fallbacks` ya tiene el public URL configurado y R2_PUBLIC_URL apunta a él. Usar prefix `generated/` dentro del mismo bucket evita configurar un nuevo bucket y nuevas variables de entorno.

- **Upload síncrono vs async:** Se eligió síncrono (dentro del handler de `/api/consult`) porque: (a) Vercel no garantiza que el proceso siga vivo después de enviar la respuesta en serverless, (b) la latencia neta es 0ms al correr concurrente con `consumeToken`, (c) es más simple y auditable.

- **Semáforo global fail-open:** Si Upstash Redis está caído, `withSupabaseSemaphore` cae al comportamiento local (MAX_CONCURRENT=2 por instancia). Esto es intencional — Redis caído no debe bloquear consultas de pago.

- **Ticket SU-392270:** Enviado por email directo, recibido como free plan. Si no hay respuesta técnica en 48h, reenviar desde el dashboard Pro en supabase.help para priorización correcta.

---

## Comentarios Cursor Auditor — 2026-05-26

> **Instrucción:** Esta sección es solo para validación del constructor. **No sustituye** el cuerpo del plan anterior; señala desincronización detectada entre el documento y el repo/`main` al momento de la auditoría.

### Resumen ejecutivo (auditor)

| Fase | Estado sugerido tras revisión de código | Acción para constructor |
|------|----------------------------------------|-------------------------|
| 0 | 🟡 Parcial (0B ✅; 0A/0C ⬜) | Confirmar ticket SU-392270; documentar compute **Small** activo vs Medium del plan |
| 1 | ✅ Código alineado | Ninguna urgente |
| 2 | ✅ Código alineado | Ejecutar test 10 instancias; cap sigue en **8** (commit `05177a5`, no 20) |
| 3 | ✅ Código alineado | Cerrar smoke doble-tap; marcar deploy ✅ (merge `e39034b` / `12646b6`) |
| 4 | ✅ Código alineado | Marcar deploy ✅ (merge `a44a469` / `f223dd2`) |
| 5 | 🟡 Repo ✅ / prod ⬜ | Aplicar **070** en prod y verificar `cron.job` |
| 6 | 🟡 ~85% | Actualizar checklist §Fase 6 (ver abajo) |
| 7 | 🟡 Código P0+P1 ✅ / validación ⬜ | Actualizar tabla estado + checklist §Fase 7 (ver abajo) |

**Rama/commit de referencia:** `main` incluye P0 (`e542d7a`) y P1 (`a3e8ac3`); hardening RPC **073** (`ab19e52`). Documento aún dice “P0 en rama” y P1 pendiente.

---

### Por fase — hallazgos concretos

#### Fase 0

- **0D — `/api/health` con semáforo (`4a510bf`):** Supersedido por Fase 7 P0 (`e542d7a`). El health **ya no consulta PostgREST**; solo rate-limit + ping Redis opcional. El ítem 0D sigue siendo históricamente correcto pero **no describe el comportamiento actual**. Constructor: añadir nota de evolución o ítem 0E “health sin DB”.
- **0C Medium:** Infra real reportada = **Small** (~$10 add-on sobre Pro). Medium (~$50) sigue siendo opcional post-lanzamiento; alinear con `docs/runbooks/SUPABASE_SCALABILITY.md` §8 (ticket pide pool, no Medium).

#### Fase 1

- Implementación verificada: `apps/web/src/lib/upload-to-r2.ts`, `@aws-sdk/client-s3` en `apps/web/package.json`, llamadas en `consult/route.ts` (bones / stream / ritual).
- **Desviación menor vs spec:** el plan dice `image/jpeg` fijo; el código infiere extensión desde `Content-Type` (jpeg/png). Aceptable; constructor puede actualizar spec o dejar como está.
- Fase 1.5 (re-procesar URLs Together expiradas): sigue pendiente — correcto en el plan.

#### Fase 2

- `GLOBAL_MAX_CONCURRENT = 8` en `supabase-admin.ts` (audit CRIT-01; antes 20). El plan cita cap 8 en diagrama pero el audit WARP aún menciona “20” en §2.1 — desincronización entre docs.
- **TTL Redis:** código usa **30s** en key `supabase:concurrent` (no 10s del diagrama §Fase 2). Constructor: validar cuál es la fuente de verdad.
- Fail-open + Sentry `redis_semaphore_counter_elevated` cuando counter > cap: presente.

#### Fase 3

- Gate `consult:inflight:{userId}` con `SET NX`, TTL 120s, `DEL` en `finally`: verificado en `consult/route.ts`.
- i18n `consultationInProgress` en `packages/i18n/src/messages/consult-api-ui.ts` (11 locales).
- Checklist dice “Deploy ⬜” pero commits `12646b6` + merge `e39034b` indican deploy hecho. Constructor: marcar o confirmar entorno prod.

#### Fase 4

- `apps/web/vercel.json` coincide con el JSON del plan. Checklist “Deploy ⬜” — mismo comentario que Fase 3.

#### Fase 5

- Migración `070_scheduled_vacuum.sql` existe; job name real = **`weekly-vacuum-iching`** (el snippet del plan usa `weekly-vacuum-consultations` — nombre distinto, mismo propósito).
- **No hay evidencia en repo** de aplicación en prod (`verify_migrations` / runbook). Constructor: ejecutar en SQL Editor prod y cerrar checklist.

#### Fase 6

- **Contradicción interna del plan:** tabla “Estado general” marca Fase 6 ✅, pero checklist §Fase 6 tiene todo ⬜.
- **Código verificado (2026-05-26):**
  - ✅ `supabase_semaphore_queue_depth_high` cuando `queueDepth > 3` en prod — `supabase-admin.ts`
  - ✅ `r2_upload_failed` — `upload-to-r2.ts`
  - ✅ Together AI errors — `image-provider.ts` (no listado en plan original; bonus)
  - 🟡 Claude 429: solo `Sentry.captureException` genérico en catch de `consult/route.ts` (commit `8d4aed8`); **no hay tag/mensaje dedicado `claude_429`**
  - ⬜ Warp kills: revisión manual Supabase logs (sin alerta automatizada)
  - ⬜ Together “success rate < 85% en 5 min”: no implementado como agregado; solo per-request exceptions
- Constructor: alinear tabla vs checklist; decidir si Claude 429 explícito es requisito o suficiente el catch global.

#### Fase 7

- **P0 ✅ en `main`:** health sin PostgREST; `getSessionLimitFromPack(lastPack)` elimina segundo `readCreditsRow`; `BOOTSTRAP_CACHE_TTL_SECONDS` = 120 prod / 8 dev.
- **P1 ✅ en `main` (plan aún ⬜):**
  - Migración `071_bootstrap_summary_rpc.sql` — RPC `get_user_session_summaries`
  - `session-store.ts`: RPC + cache Redis TTL 60s + `invalidateSessionSummariesCache` en upsert/delete
  - Migración **073** revoca PUBLIC EXECUTE en RPC (linter security)
- Checklist plan: “Deploy P0 ⬜”, “071 ⬜”, “Redis cache ⬜” — **desactualizado** respecto a código.
- **Objetivo “8 → 2 requests/login”:** no alcanzado del todo. Tras P0+P1, bootstrap sigue ~4 queries bajo semáforo (credits, RPC summaries, users, legal). Consulta: 1× `getUserBillingTier` → `readCreditsRow` **fuera** del semáforo (ya no duplicado). Constructor: revisar si el objetivo numérico del plan debe rebajarse a ~4–5 o abrir P1.5 (cache billing tier).
- **Smoke “0 Warp en 10 min”:** no cerrado formalmente. `docs/runbooks/SMOKE_POST_SMALL_CHECKLIST.md` sigue FAIL (kick OAuth pre-`eeea551`). Logs prod 2026-06-11 23:00–23:46 UTC = ventana sana (51 entradas, 0 Warp) — evidencia positiva pero no sustituye smoke en dispositivo post-Fase 7.

---

### Trabajo relacionado fuera de este plan (informar al constructor)

No forman parte de las 7 fases pero impactan la misma superficie:

| Tema | Commits / archivos | Nota auditor |
|------|-------------------|--------------|
| Auth resilience PR1–PR3 | `fetch-with-auth-resilience.ts`, `page.tsx`, mobile `index.tsx` | Ataca kick OAuth; independiente del pool PostgREST |
| Phase 8 OOM Android | `sync-service.ts` two-phase, `index.tsx` recovery | Merge `90a6650`; APK dist 53+ |
| Hydration gate per-session | `2e8044e`, dist 54–55 | Reduce ráfagas thread sync |
| Semaphore cap 20→8 | `05177a5` | Posteriores a redacción inicial del plan |

---

### Checklist sugerido para el constructor (validar y editar plan original)

1. Actualizar línea 4 “Última actualización” y tabla §Estado general (Fase 7: P0+P1 código ✅, smoke/ops ⬜).
2. Fase 6: marcar ítems implementados en checklist o bajar fila “✅ Completa” a 🟡.
3. Fase 7: marcar 071, Redis cache, deploy P0+P1 como ✅; renombrar RPC en texto plan (`get_user_bootstrap_summary` → `get_user_session_summaries` real en 071).
4. Fase 5 + Fase 7 checklist: aplicar 070 (y confirmar 071/073) en prod vía `verify_migrations.sql`.
5. Fase 0D: nota de supersesión por health sin DB.
6. Alinear TTL semáforo Redis (10s plan vs 30s código) y nombre job cron 070.
7. Cerrar smoke post-Fase 7 en dispositivo + actualizar `SMOKE_POST_SMALL_CHECKLIST.md`.

*Auditor: Cursor Agent · basado en inspección estática del repo; migraciones prod no verificadas en vivo en esta pasada.*
