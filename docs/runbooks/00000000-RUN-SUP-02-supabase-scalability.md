# Runbook oficial — Escalabilidad Supabase (The Original I Ching)
**Código:** `00000000-RUN-SUP-02 supabase-scalability` · **Familia:** SUP · **Estado:** reference

**Documento de referencia** para operaciones internas y tickets a **Supabase Support**.  
**Proyecto prod:** `wgborqkfnxfarkdaotsd` (ca-central-1, Postgres 17.6, plan **Pro**)  
**Última revisión:** 2026-06-07  
**Relacionado:** [00000000-AUD-SUP-01-supabase-db-stability.md](../auditorias/00000000-AUD-SUP-01-supabase-db-stability.md), [00000000-RUN-SUP-04-post-restart.md](./00000000-RUN-SUP-04-post-restart.md), [00000000-RUN-SUP-01-migration-data-integrity.md](./00000000-RUN-SUP-01-migration-data-integrity.md)

---

## 1. Propósito

Este runbook define:

1. **Qué monitorear** antes de escalar infraestructura.
2. **Umbrales** que indican acción (app vs Supabase).
3. **Escalera oficial de escalado** según documentación Supabase.
4. **Acciones concretas** por fase de tráfico (lanzamiento → 1000 WAU).
5. **Plantilla de ticket** para Supabase Support.

> **Regla de oro:** escalar hardware sin reducir amplificación de requests suele ser dinero mal gastado. Supabase recomienda diagnosticar queries, conexiones e índices **antes** de subir compute ([Performance Tuning](https://supabase.com/docs/guides/platform/performance)).

---

## 2. Arquitectura relevante (dos capas distintas)

Nuestra app usa **`@supabase/supabase-js` vía HTTP → PostgREST** (no SQL directo desde Vercel). Hay **dos pools** que no deben confundirse:

| Capa | Qué es | Quién la usa | Límite observado |
|------|--------|--------------|------------------|
| **PostgREST** | API REST `/rest/v1/*` y RPC | Next.js API (`service_role`), cliente autenticado | Pool interno **~10 conexiones** (log: `Connection Pool initialized with a maximum size of 10 connections`) |
| **Postgres + Supavisor** | Conexiones directas / pooler puerto 6543 | Migraciones, `psql`, Prisma (si aplica), jobs `pg_cron` | Según **compute tier** ([Compute add-ons](https://supabase.com/docs/guides/platform/compute-add-ons)) |

**Implicación:** optimizar Supavisor (puerto 6543) **no sustituye** al cuello de botella PostgREST si el tráfico principal es REST/RPC — que es nuestro caso.

### Flujo de requests por acción de usuario (post Fase 3)

| Acción | Requests PostgREST objetivo | Implementación |
|--------|----------------------------|----------------|
| Login + home | ≤2 | `GET /api/account/bootstrap` (serial interno) |
| Abrir 1 chat | ≤2 | `GET /api/account/chats?thread=1` (meta + `get_session_content_safe` serial) |
| Nueva consulta | ≤2 (tramo DB) | `persist_consultation_with_content` + `consume_token` serializados |
| Mobile sync hilo | 1 HTTP | `syncChatThread` → API `thread=1` |

**Semáforo app:** `withSupabaseSemaphore` — máx. **2** ops concurrentes **por instancia** Vercel (`MAX_CONCURRENT = 2` en `apps/web/src/lib/supabase-admin.ts`). Cap global Redis: **8** (`GLOBAL_MAX_CONCURRENT = 8`, ajustado 2026-06-11 — audit CRIT-01). Varias instancias serverless pueden superar el pool PostgREST=10 si el cap global supera el pool.

### Schema post-migración 069

- Texto pesado: **`consultation_content`** (única fuente de verdad).
- **`consultations`:** solo metadata (sin columnas TOAST legacy).
- Lectura contenido: RPC **`get_session_content_safe`** (timeout local 2 s, fallback `[]`).
- Escritura: RPC **`persist_consultation_with_content`**.

---

## 3. Estado actual y límites conocidos

| Item | Estado (2026-06-07) | Notas |
|------|---------------------|-------|
| Fases estabilidad 0–3 + 069 | ✅ Aplicadas en prod | Ver auditoría §12–15 |
| Pool PostgREST | ~10 fijo | **Pro no lo eleva automáticamente** |
| TOAST huérfano `consultations` | ~248 MB disco, heap ~80 kB | Cosmético post-069; `VACUUM FULL` opcional |
| Warp / 57014 en smoke agresivo | Intermitente | Burst QA (varios chats + incógnito); uso normal single-user OK |
| Ticket P4 Supabase Support | ⏳ Pendiente | Ver §8 |
| Read Replicas | No desplegadas | Solo si workload ≥80% lecturas + analytics/geo |

---

## 4. Factores a monitorear

### 4.1 Dashboard Supabase

**Ruta:** Project → **Reports** → **Database**

| Métrica | Qué indica | Umbral revisión | Umbral acción |
|---------|------------|-----------------|---------------|
| **CPU utilization** | Carga compute | >50% sostenido 1 h | >70% sostenido → evaluar compute upgrade ([blog oficial](https://supabase.com/blog/read-replicas-vs-bigger-compute)) |
| **Database client connections** (desglose) | Saturación por rol | PostgREST >60% del máx. | PostgREST >70% sostenido → ticket Support + revisar burst app |
| **Disk IO % consumed** | I/O disco | >1% sostenido | >80% → compute tier mayor o IOPS |
| **Memory** | Presión RAM | Tendencia al alza | OOM / swap → subir compute |

**Ruta:** Project → **Logs** → **API** / **Postgres**

| Señal | Severidad | Acción |
|-------|-----------|--------|
| `Warp server error: Thread killed by timeout manager` | Alta | Correlacionar con burst; ver §6 |
| HTTP **500** en `GET /consultations` (meta) | Alta | No es TOAST; probable cola PostgREST |
| `57014 canceling statement due to statement timeout` | Media-Alta | Query lenta o espera en pool |
| `Connection Pool initialized with a maximum size of 10` | Info | Reinicio PostgREST; ventana frágil ~2 min |
| `Schema cache loaded` / `Config reloaded` | Info | Normal tras restart; no es error |

**Ruta:** Project → **Database** → **Settings** → **Connection pooling**

| Setting | Uso |
|---------|-----|
| **Pool size** (Supavisor) | Solo relevante para conexiones directas; regla oficial: ≤40% de `max_connections` si usas mucho PostgREST ([Connection management](https://supabase.com/docs/guides/database/connection-management)) |

### 4.2 SQL de diagnóstico (SQL Editor o psql)

Ejecutar semanalmente en prod o tras incidente:

```sql
-- Conexiones activas por rol (directo a Postgres)
SELECT usename, state, count(*) AS n
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY 1, 2
ORDER BY n DESC;

-- Top queries por tiempo total (requiere pg_stat_statements)
SELECT calls,
       round(mean_exec_time::numeric, 2) AS avg_ms,
       round(total_exec_time::numeric, 2) AS total_ms,
       left(query, 120) AS query_preview
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 15;

-- Ratio lectura/escritura (decidir Read Replicas)
SELECT sum(seq_tup_read + idx_tup_fetch) AS reads,
       sum(n_tup_ins + n_tup_upd + n_tup_del) AS writes,
       round(100.0 * sum(seq_tup_read + idx_tup_fetch) /
         nullif(sum(seq_tup_read + idx_tup_fetch + n_tup_ins + n_tup_upd + n_tup_del), 0), 1) AS read_pct
FROM pg_stat_user_tables;

-- Integridad contenido (gate de negocio — no escalabilidad pura pero obligatorio)
SELECT count(*) AS consultations,
       (SELECT count(*) FROM consultation_content cc
        JOIN consultations c ON c.id = cc.consultation_id
        WHERE cc.interpretation IS NOT NULL AND length(trim(cc.interpretation)) > 0) AS with_text
FROM consultations;

-- Tamaño tablas calientes
SELECT relname,
       pg_size_pretty(pg_total_relation_size(relid)) AS total,
       pg_size_pretty(pg_relation_size(relid)) AS heap
FROM pg_catalog.pg_statio_user_tables
WHERE relname IN ('consultations', 'consultation_content')
ORDER BY pg_total_relation_size(relid) DESC;
```

Script consolidado: `backend/db/scripts/db-health-check.sql`.

### 4.3 Vercel / aplicación

| Métrica | Dónde | Umbral |
|---------|-------|--------|
| 5xx en `/api/account/*`, `/api/consult` | Vercel Logs / Axiom | >0 en hora pico real (no smoke burst) |
| p95 `chats_get` (logging Axiom) | `apps/web/src/app/api/account/chats/route.ts` | meta <100 ms; thread completo <2 s |
| Concurrencia serverless | Vercel dashboard | Picos alineados con Warp en Supabase |

### 4.4 Métricas objetivo por acción (SLI internos)

| SLI | Target lanzamiento | Target 1000 WAU |
|-----|-------------------|-----------------|
| Warp en 10 min smoke realista | 0 | 0 |
| 500 PostgREST / login | 0 | 0 |
| Conexiones PostgREST / login | ≤2 | ≤2 |
| Conexiones PostgREST / abrir chat | ≤2 | ≤2 |
| Meta SELECT p95 | <100 ms | <100 ms |
| `get_session_content_safe` p95 | <500 ms | <500 ms |
| Usuarios concurrentes sin 5xx | ≥5 | ≥20 (requiere ticket pool) |

**Smoke realista:** login → esperar 3 s → abrir 1 chat → esperar → otro chat. **No** usar burst de 3+ hilos en <5 s como criterio de producción (eso es load test).

---

## 5. Escalera de escalado (oficial Supabase → aplicada a este proyecto)

Orden recomendado por [Performance Tuning](https://supabase.com/docs/guides/platform/performance) y [Read Replicas vs bigger compute](https://supabase.com/blog/read-replicas-vs-bigger-compute):

```
1. Optimizar app (menos requests concurrentes)     ← Fase 1–3 ✅ hecho
2. Optimizar queries e índices                     ← revisar pg_stat_statements
3. Connection pooling (Supavisor) para SQL directo ← solo si añadimos Prisma/workers
4. Subir compute (vertical)                        ← CPU >70% o I/O saturado
5. Read Replicas                                   ← ≥80% lecturas + analytics/geo
6. ETL / Analytics Buckets                         ← analytics masivo
7. Multigres (futuro)                              ← sharding writes
```

### Cuándo subir compute (Pro add-on)

| Sí subir | No subir todavía |
|----------|------------------|
| CPU >70% sostenido | Solo Warp en smoke QA agresivo |
| Disk IO >80% | Pocos usuarios, CPU <30% |
| Queries optimizadas e indexadas | “Más usuarios registrados” sin pico concurrente |
| Workload write-heavy | Problema solo PostgREST pool=10 (ticket Support primero) |

**Micro → Small → Medium:** [Compute add-ons](https://supabase.com/docs/guides/platform/compute-add-ons) — más CPU/RAM y más `max_connections` / clientes Supavisor.

| Compute | DB max connections | Pooler max clients |
|---------|-------------------|-------------------|
| Micro (actual típico Pro) | 60 | 200 |
| Small | 90 | 400 |
| Medium | 120 | 600 |
| Large | 160 | 800 |

> Pro compra **potencia**, no escala automática por número de cuentas.

### Cuándo Read Replicas

- Analytics pesado compitiendo con producción.
- Usuarios en múltiples regiones (latencia).
- Ya en tier alto y **≥80%** lecturas.

**No aplica ahora:** app chat con writes en cada consulta; réplicas no ayudan al tramo write.

---

## 6. Plan de acción por fase de tráfico

### Fase A — Lanzamiento soft (hoy → ~50 WAU, <5 concurrent)

**Objetivo:** 0 Warp en uso normal; integridad de contenido OK.

| # | Acción | Responsable | Frecuencia |
|---|--------|-------------|------------|
| A1 | Smoke realista post-deploy (§4.4) | Dev | Cada release prod |
| A2 | `db-health-check.sql` + gate R3 contenido | Dev/Ops | Semanal |
| A3 | Revisar logs API 500/Warp | Dev | Tras deploy + semanal |
| A4 | **No** re-aplicar migraciones 066–069 | Ops | Siempre |
| A5 | Runbook post-restart si hay mantenimiento | Ops | Event-driven |

**No requerido aún:** compute upgrade, Read Replicas.

### Fase B — Crecimiento (~50–200 WAU, 5–10 concurrent)

**Objetivo:** cero 5xx en hora pico real.

| # | Acción | Trigger |
|---|--------|---------|
| B1 | Abrir **ticket Supabase Support P4** (§8) | Antes de marketing activo |
| B2 | Habilitar monitoreo Grafana Supabase ([metrics](https://supabase.com/docs/guides/platform/metrics)) | Si plan lo permite |
| B3 | Alerta manual: PostgREST connections >70% | Dashboard semanal |
| B4 | Revisar `pg_stat_statements`; añadir índices si seq scan | CPU sube sin más tráfico |
| B5 | Evaluar compute **Small** si CPU >70% | Dashboard |

### Fase C — Escala (~200–1000 WAU, 10–20 concurrent peak)

**Objetivo:** SLI §4.4 en target 1000 WAU.

| # | Acción | Trigger |
|---|--------|---------|
| C1 | Compute **Medium+** según CPU/IO | Metrics 2 semanas |
| C2 | Respuesta Support: pool PostgREST / guidance chat-heavy | Ticket P4 |
| C3 | Rate limiting / cola en Vercel si burst externo | 5xx sostenidos |
| C4 | Read Replica solo si analytics o geo | Producto lo pida |
| C5 | `VACUUM FULL consultations` vía psql directo IPv6 | Reclaim disco TOAST huérfano |

---

## 7. Respuesta a incidentes de escalabilidad

### Síntoma: Warp + 500 en burst

1. Confirmar si es **smoke agresivo** o tráfico real (Vercel + hora).
2. Logs Supabase API: ¿500 en meta `consultations` (sin TOAST)? → **pool PostgREST**, no query lenta aislada.
3. Ver conexiones activas (SQL §4.2).
4. Mitigación inmediata: reducir pruebas burst; esperar 2 min post-restart PostgREST.
5. Si persiste en uso normal: escalar según §5 (ticket Support antes que compute aleatorio).

### Síntoma: `57014 statement timeout`

1. Identificar query en log PostgREST.
2. Si es `get_session_content_safe`: esperado bajo cold start; RPC devuelve `[]` — UI muestra summary.
3. Si es meta `consultations`: tratar como pool/contención (§6).

### Síntoma: `too many connections`

1. Revisar Supavisor pool size vs 40% regla ([Connection management](https://supabase.com/docs/guides/database/connection-management)).
2. Verificar que app serverless no abre SQL directo sin pooler 6543.
3. Subir compute o reducir `max_connections` consumidores (pg_cron jobs).

---

## 8. Plantilla ticket Supabase Support (P4)

**Portal:** [Supabase Dashboard → Support](https://supabase.com/dashboard/support/new)

**Subject:** PostgREST connection pool limit — chat-heavy Next.js app (Pro)

**Project ref:** `wgborqkfnxfarkdaotsd`  
**Region:** ca-central-1  
**Plan:** Pro

**Body:**

```
We operate a chat/oracle app (The Original I Ching) on Next.js 14 (Vercel serverless)
using @supabase/supabase-js → PostgREST (REST + RPC), not direct Postgres from the app.

Context:
- We completed schema separation (consultation_content table, migration 069).
- App-side: serial bootstrap, thread=1 API, server semaphore max 4 concurrent
  PostgREST ops per instance.
- PostgREST logs show: "Connection Pool initialized with a maximum size of 10
  connections" and intermittent "Warp server error: Thread killed by timeout manager"
  under concurrent chat opens (~5+ simultaneous users or aggressive QA burst).
- HTTP 500 on metadata SELECT consultations (no TOAST columns) correlates with
  pool contention, not slow single queries (indexed, <20 rows per session).

Target: ~1000 WAU, ~10–20 concurrent peak.

Questions:
1. Can PostgREST internal pool size be increased on Pro for project wgborqkfnxfarkdaotsd?
2. Recommended compute tier for this workload pattern?
3. Any Supabase guidance for Vercel serverless + heavy PostgREST RPC usage?

Evidence attached: PostgREST logs (Warp kills, pool=10, 57014 on consultations meta SELECT).
```

**Adjuntar:** export logs Postgres/API del dashboard (ventana incidente).

---

## 9. Guardrails de aplicación (no regresionar)

| Regla | Archivo / patrón |
|-------|------------------|
| Bootstrap único serial | `apps/web/src/app/api/account/bootstrap/route.ts` |
| Hilo unificado `?thread=1` | `apps/web/src/app/api/account/chats/route.ts` |
| Semáforo PostgREST | `apps/web/src/lib/supabase-admin.ts` |
| Sin full-fetch all sessions | chats route → 400 si falta `sessionId` |
| Mobile: `syncChatThread` 1 HTTP | `apps/mobile/src/sync/sync-service.ts` |
| Escritura vía RPC 067/069 | `persist_consultation_with_content` |
| Lectura contenido vía RPC | `get_session_content_safe` |
| Nunca 066 sin 068 | `docs/runbooks/00000000-RUN-SUP-01-migration-data-integrity.md` |

**Antipatrones prohibidos:**

- Login que dispare N× `users.upsert` + N× full chat hydration.
- SELECT `interpretation` desde `consultations` (columna eliminada 069).
- Smoke de producción con burst 3+ chats sin pausa como criterio go/no-go.

---

## 10. Checklist periódico (copiar en cada revisión mensual)

- [ ] CPU Supabase <70% promedio semana
- [ ] PostgREST connections <70% pico
- [ ] 0 Warp en smoke realista (§4.4)
- [ ] 0× HTTP 500 API Supabase en hora pico usuarios reales
- [ ] Gate R3 contenido OK (`db-health-check.sql`)
- [ ] `verify_migrations.sql` todo ✓
- [ ] pg_cron job `prewarm-consultation-content` activo
- [ ] Ticket P4: estado documentado
- [ ] Compute tier documentado y justificado

---

## 11. Referencias oficiales Supabase

| Tema | URL |
|------|-----|
| Connection management | https://supabase.com/docs/guides/database/connection-management |
| Performance tuning | https://supabase.com/docs/guides/platform/performance |
| Compute add-ons | https://supabase.com/docs/guides/platform/compute-add-ons |
| Max connections / pooler limits | https://supabase.com/docs/guides/troubleshooting/how-to-change-max-database-connections-_BQ8P5 |
| Read Replicas vs compute | https://supabase.com/blog/read-replicas-vs-bigger-compute |
| Supavisor feature | https://supabase.com/features/supavisor |
| Metrics / Grafana | https://supabase.com/docs/guides/platform/metrics |
| Prisma + Supabase troubleshooting | https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting |

---

## 12. Historial de cambios

| Fecha | Cambio |
|-------|--------|
| 2026-06-07 | Documento inicial post-cierre Fase 3 + 069; basado en auditoría estabilidad y smoke prod |
