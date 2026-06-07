# Runbook — Integridad de datos en migraciones Supabase

**Aplica a:** cualquier migración que toque `consultations`, `consultation_content`, triggers de sync, o columnas TOAST.  
**Incidente de referencia:** [`INCIDENT_2026-06-07_CONSULTATION_CONTENT_WIPE.md`](../auditorias/INCIDENT_2026-06-07_CONSULTATION_CONTENT_WIPE.md)  
**Regla de oro:** si el texto del oráculo desaparece, el producto está roto aunque HTTP 200 y 0 Warp.

---

## Cuándo usar este runbook

- Migraciones que `NULL`en, mueven o eliminan `interpretation` / `oracle_bones`.
- Cambios a `sync_consultation_content`, `persist_consultation_with_content`, o `get_session_content_safe`.
- `VACUUM FULL` en tablas con historial de usuario.
- Cualquier deploy de “Fase TOAST” o reclaim de espacio.

---

## Pre-flight (obligatorio — prod)

### 1. Backup / PITR

- [ ] Confirmar en Supabase Dashboard → Database → Backups que **PITR está activo** (plan Pro).
- [ ] Anotar **timestamp** al que se restauraría si algo falla (ej. “5 min antes del apply”).
- [ ] **No** ejecutar `VACUUM FULL` antes del restore si hay incidente de datos.

### 2. Migración 068 (o equivalente) antes de NULL masivos

Si la migración incluye `UPDATE consultations SET interpretation = NULL`:

- [ ] **068 ya aplicada** en el entorno objetivo.
- [ ] Verificar cuerpo de `sync_consultation_content` contiene guard `IF NEW.interpretation IS NULL AND NEW.oracle_bones IS NULL`.

### 3. Baseline de integridad (R3)

Ejecutar y **guardar resultado** (screenshot o pegar en PR):

```sql
SELECT
  now() AS captured_at,
  (SELECT COUNT(*) FROM public.consultations) AS consults,
  (SELECT COUNT(*) FROM public.consultation_content
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS content_with_full_text,
  (SELECT COUNT(*) FROM public.consultations
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS legacy_toast_text;
```

**Abort si:** `consults > 0` AND se va a aplicar un wipe AND `content_with_full_text = 0` sin plan de backfill previo.

### 4. Staging dry-run

- [ ] Misma migración en staging (o branch DB) con datos clonados si es posible.
- [ ] Post-check R3 en staging — `content_with_full_text` no debe bajar.

### 5. Código alineado

- [ ] App en prod usa RPC 067 + upsert defensivo (`session-store.ts`).
- [ ] Lecturas usan `get_session_content_safe` / `thread=1`.

---

## Apply

1. Ventana de bajo tráfico (si hay lock o riesgo).
2. Aplicar migración(es) en orden documentado en el PR.
3. **Inmediatamente** ejecutar post-check R3 (misma query que baseline).
4. Ejecutar `backend/db/migrations/verify_migrations.sql` — checks **068** y **CONTENT** deben pasar.

---

## Post-flight smoke (obligatorio — 10 min)

| # | Acción | Éxito |
|---|--------|-------|
| 1 | Login web prod | 200 bootstrap |
| 2 | Abrir chat con consultas previas | Texto completo visible |
| 3 | Hard reload (F5) | Texto completo persiste |
| 4 | Nueva consulta (gasta token) | Texto completo en stream |
| 5 | Reload tras nueva consulta | Texto completo en DB |
| 6 | MCP `get_logs` api | 0× Warp, 0×500 |
| 7 | Query R3 | `content_with_full_text >= baseline` (o +1 tras nueva consulta) |

---

## Rollback

| Situación | Acción |
|-----------|--------|
| Post-check R3: texto = 0 | **PITR inmediato** al timestamp anotado en pre-flight. No VACUUM. |
| Solo regresión de código | Revert deploy Vercel; DB intacta. |
| Migración parcial | Supabase support + PITR; no improvisar UPDATE manual. |

---

## Checklist para PRs de migración DB

El PR **debe** incluir en la descripción:

```markdown
## Data integrity checklist
- [ ] 068 (or NULL-safe sync) applied before any mass NULL on consultations
- [ ] Baseline R3: content_with_full_text = ___
- [ ] Staging post-check R3: content_with_full_text = ___
- [ ] verify_migrations CONTENT + 068 pass
- [ ] Smoke R4 completed (reload test)
- [ ] PITR restore point noted: ___
```

Sin checklist completo → **no merge a main** para migraciones destructivas.

---

## Contactos / escalación

- Supabase Dashboard → Support (plan Pro): PITR restore, incidente de datos.
- Evidencia: logs PostgREST, resultado R3 before/after, `cron.job_run_details` si aplica.
