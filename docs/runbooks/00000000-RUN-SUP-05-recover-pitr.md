# Runbook — Recuperación PITR consultation_content (incidente 2026-06-07)

**Código:** `00000000-RUN-SUP-05 recover-pitr` · **Familia:** SUP · **Estado:** reference

**Objetivo:** Restaurar `interpretation` y `oracle_bones` en prod `wgborqkfnxfarkdaotsd` sin revertir migraciones 067/068 ni el código actual.

**Estrategia:** Clone/PITR → **proyecto nuevo** en punto pre-066 → exportar texto → **merge selectivo** en prod.

**NO** restaurar in-place sobre prod (borraría consultas nuevas y rompería el deploy).

---

## Punto de restore recomendado

| Campo | Valor |
|-------|-------|
| **Timestamp UTC** | `2026-06-07 19:10:00` |
| **Motivo** | Inmediatamente **antes** de migración 066 (19:11:40 UTC) que propagó NULL |
| **Alternativa conservadora** | `2026-06-07 19:00:00 UTC` (antes de 067 también) |

En tu zona (EDT, UTC-4): **15:10 del 7 jun 2026**.

---

## Fase 1 — Crear proyecto de recuperación (Dashboard, manual)

1. Abre [Supabase Dashboard](https://supabase.com/dashboard/project/wgborqkfnxfarkdaotsd).
2. **Project Settings → Database → Backups** (o **Database → Backups** según UI).
3. Pestaña **「Restore to a new project」** / **「Point in Time」**.
4. Si tienes **PITR** habilitado:
   - Selector de fecha/hora → `2026-06-07` → `19:10:00` **UTC** (ajusta timezone del picker si muestra local).
   - Revisa coste del proyecto clon (se cobra como proyecto adicional).
   - Confirma **Restore**.
5. Si **no** tienes PITR:
   - Usa el **daily backup** más reciente **anterior** al 7 jun ~19:11 UTC (p. ej. backup nocturno del 6 jun).
   - Pierdes consultas hechas entre ese backup y el incidente (pocas en prod: revisa COUNT).
6. Espera a que el clon esté **ACTIVE_HEALTHY** (puede tardar 10–30+ min).
7. Anota el **project ref** del clon: `________________`

---

## Fase 2 — Verificar que el clon tiene el texto

> **Backup 07 Jun 05:44 UTC:** puede **no tener** tabla `consultation_content` (migración 062 posterior).
> El texto estará en **`consultations.interpretation`** — usar script v2 abajo.

En **SQL Editor del proyecto CLON** (no prod), ejecuta **§1** de
`backend/db/scripts/recover_consultation_content_2026-06-07.sql`:

```sql
SELECT
  (SELECT COUNT(*) FROM public.consultations) AS consults,
  (SELECT COUNT(*) FROM public.consultations
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS legacy_with_full_text,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'consultation_content') AS has_content_table;
```

**Éxito:** `legacy_with_full_text` **> 0** (esperado decenas de filas). `has_content_table` puede ser **0** — normal.

Si `legacy_with_full_text = 0` → probar backup del **6 jun** en otro clon.

Muestra de calidad:

```sql
SELECT id, left(question, 50) AS q, length(interpretation) AS text_len
FROM public.consultations
WHERE interpretation IS NOT NULL AND length(interpretation) > 100
ORDER BY created_at DESC LIMIT 5;
```

---

## Fase 3 — Exportar datos del clon

En **SQL Editor del CLON**, genera UPDATEs para prod **`consultation_content`** desde legacy columns (**§2**):

```sql
SELECT format(
  $u$UPDATE public.consultation_content SET
  interpretation = %L,
  oracle_bones = %s
WHERE consultation_id = %L::uuid
  AND (interpretation IS NULL OR length(COALESCE(interpretation, '')) < 100);$u$,
  c.interpretation,
  CASE
    WHEN c.oracle_bones IS NULL THEN 'NULL'
    ELSE quote_literal(c.oracle_bones::text) || '::jsonb'
  END,
  c.id::text
) AS merge_sql
FROM public.consultations c
WHERE c.interpretation IS NOT NULL
  AND length(c.interpretation) > 100
ORDER BY c.id;
```

1. Ejecuta la query.
2. Exporta resultados (Download CSV) o copia columna `merge_sql`.
3. Guarda como `recovery_consultation_content_updates.sql`.

**Opcional — resúmenes en meta** (si también quieres `interpretation_summary` en clon):

```sql
SELECT format(
  $u$UPDATE public.consultations SET interpretation_summary = %L
WHERE id = %L::uuid AND interpretation_summary IS NULL;$u$,
  left(cc.interpretation, 420),
  cc.consultation_id::text
)
FROM public.consultation_content cc
WHERE length(cc.interpretation) > 100;
```

---

## Fase 4 — Aplicar merge en PROD (wgborqkfnxfarkdaotsd)

### Pre-check prod (obligatorio)

```sql
SELECT COUNT(*) AS null_text FROM public.consultation_content
WHERE interpretation IS NULL OR length(COALESCE(interpretation, '')) < 100;
-- Anota: debe ser ~66
```

### Apply

1. Abre **SQL Editor de PROD** (`wgborqkfnxfarkdaotsd`).
2. **NO** envuelvas en `BEGIN`/`COMMIT` si mezclas muchos UPDATEs — un bloque grande está bien en SQL Editor.
3. Pega y ejecuta los `UPDATE` generados en Fase 3.
4. Si son 66 filas, puedes ejecutar en un solo batch.

### Post-check prod (obligatorio)

```sql
SELECT
  (SELECT COUNT(*) FROM public.consultations) AS consults,
  (SELECT COUNT(*) FROM public.consultation_content
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS content_with_full_text;

-- Debe coincidir con número de consultas que tenían texto en el clon
```

Ejecuta también `backend/db/migrations/verify_migrations.sql` — check **CONTENT** debe pasar.

---

## Fase 5 — Smoke en la app

1. [theoriginaliching.com](https://theoriginaliching.com) → login.
2. Abrir 2–3 chats antiguos → **texto completo** tras F5.
3. Nueva consulta → texto persiste tras reload.
4. Logs Supabase API: 0×500.

---

## Fase 6 — Limpieza

1. **Pausar o eliminar** el proyecto clon en Dashboard (evita coste mensual).
2. Documentar en incidente: fecha restore, filas recuperadas, project ref clon usado.
3. **No** ejecutar `VACUUM FULL` en `consultations` hasta confirmar smoke OK.

---

## Rollback del merge

Si algo sale mal en prod tras aplicar UPDATEs:

- Los UPDATE solo tocaron filas con `interpretation IS NULL` — no hay backup automático.
- Restaurar desde el clon (re-ejecutar export) o PITR prod si aplicaste algo incorrecto.

---

## Alternativa: pg_dump tabla desde clon (CLI)

Si prefieres CLI y tienes connection strings:

```bash
# Desde clon — solo consultation_content (data)
pg_dump "postgresql://postgres.[CLON_REF]:[PASSWORD]@aws-0-ca-central-1.pooler.supabase.com:6543/postgres" \
  --data-only --table=public.consultation_content \
  --column-inserts \
  -f consultation_content_clone.sql
```

Editar el SQL para usar `INSERT ... ON CONFLICT (consultation_id) DO UPDATE SET interpretation = EXCLUDED.interpretation, oracle_bones = EXCLUDED.oracle_bones` en lugar de INSERT puro, o filtrar solo filas con texto.

---

## Checklist rápido

- [ ] Proyecto clon creado (PITR 2026-06-07 19:10 UTC)
- [ ] Clon: `content_with_full_text > 0`
- [ ] SQL de UPDATE exportado del clon
- [ ] Prod: UPDATE aplicado
- [ ] Prod: post-check CONTENT OK
- [ ] App: chats antiguos con texto completo
- [ ] Proyecto clon pausado/eliminado
