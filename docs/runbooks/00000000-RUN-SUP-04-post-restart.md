# Runbook — Post-restart Supabase (The Original I Ching)

**Código:** `00000000-RUN-SUP-04 post-restart` · **Familia:** SUP · **Estado:** reference

**Proyecto prod:** `wgborqkfnxfarkdaotsd` (ca-central-1)

Ejecutar tras **restart de proyecto**, ventana de mantenimiento, o antes de smoke test pre-lanzamiento.

**Escalabilidad y monitoreo continuo:** [00000000-RUN-SUP-02-supabase-scalability.md](./00000000-RUN-SUP-02-supabase-scalability.md)

---

## 1. Verificar estado del proyecto

Dashboard → proyecto **ACTIVE_HEALTHY**.

---

## 2. Health check SQL

Ejecutar `backend/db/scripts/db-health-check.sql` en SQL Editor.

| Check | OK |
|-------|-----|
| `consultations` total | < 5 MB (post-069 + VACUUM FULL) |
| `consultation_content` with_full_text | ≈ content_rows (≤2 empty post-PITR gap OK) |
| `legacy_*_dropped` | `true` (post-069) |
| prewarm job | `prewarm-consultation-content` active |
| waiting connections | bajo (< 5 en operación normal) |

---

## 3. Prewarm manual (opcional, cold start)

Solo si acabas de reiniciar y el primer chat-open es lento:

```sql
SELECT pg_prewarm('consultation_content'::regclass);
SELECT pg_prewarm(c.reltoastrelid)
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'consultation_content' AND n.nspname = 'public' AND c.reltoastrelid <> 0;
```

---

## 4. verify_migrations

Ejecutar `backend/db/migrations/verify_migrations.sql` — todas las filas **✓ OK** (CONTENT puede tolerar ≤2 filas vacías documentadas).

---

## 5. Smoke app (10 min)

1. Login web → **1×** `GET /api/account/bootstrap`
2. Abrir chat antiguo → `?thread=1` → interpretación completa
3. Hard reload (F5) → texto persiste
4. Nueva consulta → token consumido + texto en `consultation_content`
5. Logs Vercel + Supabase API: **0×** HTTP 500, **0×** `Warp server error`

---

## 6. VACUUM FULL (solo post-069 DROP columnas)

`VACUUM` **no** funciona en SQL Editor (transacción). Usar psql session pooler:

```powershell
docker run --rm --dns 8.8.8.8 `
  -e PGHOST=aws-1-ca-central-1.pooler.supabase.com `
  -e PGPORT=5432 `
  -e PGDATABASE=postgres `
  -e PGUSER=postgres.wgborqkfnxfarkdaotsd `
  -e PGPASSWORD='...' `
  -e PGSSLMODE=require `
  postgres:17 psql -c "VACUUM FULL public.consultations;"
```

---

## 7. Ticket Support (P4 — escala)

Si >10 usuarios concurrentes abren chats a la vez y ves Warp timeouts:

- [Supabase Support](https://supabase.com/dashboard/support/new)
- Proyecto `wgborqkfnxfarkdaotsd`, plan Pro
- Asunto: PostgREST pool limit for chat-heavy Next.js app
- Adjuntar logs: `Connection Pool initialized with a maximum size of 10 connections`

---

## 8. Auth connection strategy (Dashboard)

Project Settings → **Database** → Auth DB connections: cambiar a **percentage-based** si escalas compute (advisor INFO `auth_db_connections_absolute`).

---

## Referencias

- [`00000000-AUD-SUP-01-supabase-db-stability.md`](../auditorias/00000000-AUD-SUP-01-supabase-db-stability.md)
- [`00000000-RUN-SUP-01-migration-data-integrity.md`](./00000000-RUN-SUP-01-migration-data-integrity.md)
- [`restoration-manual/README.md`](../restoration-manual/README.md)
