# Plan de Escalabilidad — The Original I Ching App
**Objetivo:** Sostener 10,000–100,000 descargas en el primer año con infraestructura estable y costos controlados.  
**Fecha inicio:** 2026-06-10  
**Última actualización:** 2026-06-10

---

## Estado general

| Fase | Descripción | Estado |
|---|---|---|
| Fase 0 | Ops — sin código | 🟡 En progreso |
| Fase 1 | Persistencia de imágenes en R2 | 🟡 En progreso |
| Fase 2 | Semáforo PostgREST global (Redis) | ⬜ Pendiente |
| Fase 3 | Rate limit por usuario en `/api/consult` | ⬜ Pendiente |
| Fase 4 | Timeouts explícitos Vercel (`vercel.json`) | ⬜ Pendiente |
| Fase 5 | Mantenimiento automático DB (pg_cron) | ⬜ Pendiente |
| Fase 6 | Monitoring / alertas Sentry | ⬜ Pendiente |

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
- [ ] Verificar en staging que Together URL → R2 URL en DB
- [ ] Verificar que si R2 falla, la consulta igual completa (URL de Together en DB)
- [ ] Añadir variables a Vercel (producción + staging si aún no están)
- [ ] Deploy a main + staging
- [ ] Smoke test: hacer una consulta, revisar `consultations.image_url` en Supabase → debe ser URL de R2

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

- [ ] Implementar contador Redis en `supabase-admin.ts`
- [ ] Test: simular 10 instancias concurrentes → verificar que no se pasa del global limit
- [ ] Ajustar `GLOBAL_MAX_CONCURRENT` basado en respuesta del ticket 0A
- [ ] Deploy a main + staging

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

- [ ] Añadir gate Redis en `apps/web/src/app/api/consult/route.ts`
- [ ] Añadir mensaje i18n en todos los idiomas: "consultation_in_progress"
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

- [ ] Crear `apps/web/vercel.json`
- [ ] Verificar que `/api/consult` sigue funcionando (maxDuration=300 en ambos lados)
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

- [ ] Crear `backend/db/migrations/070_scheduled_vacuum.sql`
- [ ] Actualizar `backend/db/migrations/verify_migrations.sql`
- [ ] Aplicar en producción
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
