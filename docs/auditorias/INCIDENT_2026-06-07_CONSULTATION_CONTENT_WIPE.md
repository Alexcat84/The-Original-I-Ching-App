# Incidente P0 — Pérdida masiva de interpretaciones (consultation_content)

**Severidad:** P0 — pérdida silenciosa de datos de usuario  
**Fecha del incidente:** 2026-06-07 ~19:11 UTC  
**Proyecto:** Supabase prod `wgborqkfnxfarkdaotsd` (The Original I Ching)  
**Detectado por:** Usuario en producción post-deploy Fase 3  
**Estado datos:** Texto de interpretación **no recuperable vía SQL** sin PITR/backup  
**Fix preventivo:** Migración **068** + gates en `verify_migrations.sql` + runbook obligatorio  

---

## Resumen ejecutivo

Al aplicar la migración **066** (`consultations_toast_reclaim`) se ejecutó un `UPDATE` masivo que puso `interpretation` y `oracle_bones` en `NULL` en la tabla `consultations`. El trigger **`sync_consultation_content`** (activo en `UPDATE`) propagó esos `NULL` a **`consultation_content`**, que era la **única copia restante** del texto largo tras Fase 2.

**Resultado:** 66 consultas / 9 usuarios — **0 filas** con texto completo en DB. La app seguía mostrando pregunta, hexagrama e imagen (metadata); al recargar el hilo, la interpretación desaparecía o quedaba vacía.

> **Con usuarios reales en producción esto habría sido un incidente de pérdida de contenido íntimo/privado, no un error 500 visible.**

---

## Timeline (UTC)

| Hora | Evento |
|------|--------|
| Fase 2 previa | Backfill **063** copia texto a `consultation_content`. Lecturas vía `get_session_content_safe`. |
| 2026-06-07 19:09 | Migración **067** aplicada — RPC `persist_consultation_with_content`; trigger sync pasa a **UPDATE-only**. |
| 2026-06-07 19:11 | Migración **066** aplicada — `UPDATE consultations SET interpretation = NULL, oracle_bones = NULL`. |
| 2026-06-07 19:11+ | Trigger `sync_consultation_content` en cada fila UPDATE → **`consultation_content.interpretation = NULL`** en las 66 filas. |
| 2026-06-07 19:22 | Deploy código Fase 3 (main). |
| 2026-06-07 ~19:30+ | Usuario reporta: solo pregunta + resumen + imagen, sin texto completo. |
| 2026-06-07 post | Hotfix **068** (trigger + RPC con `COALESCE`); upsert defensivo en app; push `bf33b59`. |

---

## Impacto medido (prod)

| Métrica | Valor |
|---------|-------|
| Consultas totales | 66 |
| Usuarios con consultas | 9 |
| Filas `consultation_content` con `length(interpretation) > 100` | **0** |
| Texto residual en `consultations.interpretation` | **0** |
| Rango temporal afectado | 2026-05-19 → 2026-06-07 |
| Metadata conservada | ✅ pregunta, hexagrama, líneas, imagen, sesión |
| Texto largo conservado | ❌ perdido en DB |

---

## Causa raíz

### Mecanismo técnico

```
066: UPDATE consultations SET interpretation = NULL  (N filas)
         ↓
   AFTER UPDATE OF interpretation, oracle_bones
         ↓
   sync_consultation_content()
         ↓
   ON CONFLICT DO UPDATE SET interpretation = EXCLUDED.interpretation  -- EXCLUDED = NULL
         ↓
   consultation_content.interpretation = NULL  (borra la única copia del texto)
```

### Fallas de proceso (por qué no se previó)

1. **066 se diseñó como “limpieza de TOAST”**, no como operación sobre la fuente de verdad del producto.
2. El smoke test validó **Warp / HTTP 500**, no **integridad de contenido** tras reload.
3. `verify_migrations` comprobaba que existiera `consultation_content`, **no** que tuviera texto.
4. **068 debió preceder a 066** (trigger que ignore NULL o use `COALESCE`); se aplicó después del daño.
5. No hubo **snapshot/PITR confirmado** antes de migración destructiva.
6. No hubo **dry-run con COUNT before/after** en staging con datos representativos.

---

## Recuperación de datos

| Método | Notas |
|--------|-------|
| **PITR Supabase** a antes de 2026-06-07 19:11 UTC | Opción principal. Extraer `consultation_content` del snapshot y merge selectivo. |
| Caché IndexedDB (web) | Solo si el usuario no limpió datos / no recargó tras wipe. |
| SQLite APK (`__rnCachedChats`) | Solo dispositivos no resincronizados post-wipe. |
| PDF exportado por usuario | Caso a caso. |
| `SELECT` en Postgres hoy | **No** — columnas NULL en ambas tablas. |
| `VACUUM FULL` | **NO ejecutar** hasta decidir PITR — puede destruir TOAST muerto aún presente en disco (~274 MB en `consultations`). |

---

## Remediación aplicada

| Artefacto | Descripción |
|-----------|-------------|
| **068** `sync_content_never_null_wipe.sql` | Trigger ignora UPDATE con ambos NULL; `COALESCE` en upsert; RPC idem. |
| `session-store.ts` | Upsert explícito a `consultation_content` tras RPC; merge conserva texto más largo. |
| `page.tsx` | Al cargar hilo, no sobrescribir interpretación local más larga con placeholder del servidor. |
| Commit | `bf33b59` en `main` / `staging` |

**Consultas nuevas** (post-068 + deploy): deben persistir texto completo. **Histórico pre-incidente:** requiere restore desde backup.

---

## REGLAS PERMANENTES — NUNCA JAMÁS REPETIR

Estas reglas son **obligatorias** para cualquier migración, agente o humano que toque datos de consulta.

### R1 — Invariante de negocio (no negociable)

> **`consultation_content.interpretation` es la fuente de verdad del texto del oráculo.**  
> Ninguna migración, trigger, script ni `UPDATE` masivo puede dejar `COUNT(texto > 100 chars) = 0` mientras existan consultas.

### R2 — Orden de migraciones destructivas

| Paso | Acción |
|------|--------|
| 1 | Aplicar **068 o equivalente** (trigger a prueba de NULL) **ANTES** de cualquier NULL masivo en `consultations`. |
| 2 | Confirmar backup/PITR activo y ventana de rollback documentada. |
| 3 | Ejecutar query **BASELINE** (ver R3). |
| 4 | Aplicar migración destructiva. |
| 5 | Ejecutar query **POST** (ver R3). Si POST < BASELINE → **ROLLBACK / PITR inmediato**. |
| 6 | Smoke manual: abrir chat → reload → texto completo visible. |

**066 sin 068 previo está PROHIBIDO en todos los entornos.**

### R3 — Gate SQL obligatorio (before / after)

Ejecutar en SQL Editor **antes y después** de cualquier migración que toque `interpretation`, `oracle_bones` o `consultation_content`:

```sql
SELECT
  (SELECT COUNT(*) FROM public.consultations) AS consults,
  (SELECT COUNT(*) FROM public.consultation_content
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS content_with_full_text,
  (SELECT COUNT(*) FROM public.consultations
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS legacy_toast_text;
```

**Criterio de éxito POST-migración 066-like:**  
`content_with_full_text` debe ser **≥ baseline** (idealmente igual al número de consultas con texto antes del NULL en legacy).  
**Si `content_with_full_text = 0` y `consults > 0` → STOP. Incidente. No deploy. No VACUUM.**

También incluido como check **`CONTENT`** en `backend/db/migrations/verify_migrations.sql`.

### R4 — Smoke de integridad (no solo infra)

Post-deploy **obligatorio** además de “0 Warp”:

1. Login → abrir chat existente → **texto completo** (no solo summary).
2. Hard reload (F5) → **mismo texto**.
3. Nueva consulta → reload → **texto completo**.
4. MCP/logs: 0×500 **y** query R3 con `content_with_full_text > 0`.

### R5 — Triggers que sincronizan tablas

Todo trigger `sync_*` que copie columnas entre tablas **DEBE**:

- Ignorar propagación cuando `NEW.col IS NULL` (meta-only writes).
- Usar `COALESCE(EXCLUDED.col, target.col)` en `ON CONFLICT DO UPDATE`.
- Tener test en `verify_migrations` que inspeccione el cuerpo de la función.

### R6 — Migraciones masivas requieren runbook firmado

Ver [`docs/runbooks/MIGRATION_DATA_INTEGRITY.md`](../runbooks/MIGRATION_DATA_INTEGRITY.md).

Checklist mínimo antes de aplicar en prod:

- [ ] Backup/PITR confirmado (fecha/hora del punto de restore)
- [ ] 068 (o equivalente) aplicada si la migración NULLea columnas espejadas
- [ ] Baseline R3 registrado en el PR/commit message
- [ ] Staging dry-run con mismo SQL + post-check
- [ ] Smoke R4 en staging
- [ ] Ventana de mantenimiento comunicada si hay lock (`VACUUM FULL`)
- [ ] Post-check R3 en prod inmediatamente tras apply

### R7 — Prohibiciones explícitas

- ❌ Aplicar **066** (o cualquier `UPDATE … SET interpretation = NULL` masivo) sin **068** previo.
- ❌ Confiar en “el texto ya está en la otra tabla” sin verificar COUNT de texto.
- ❌ Cerrar fase de estabilidad DB solo con métricas Warp/pool.
- ❌ `VACUUM FULL` antes de intentar PITR tras incidente de datos.
- ❌ Triggers `ON CONFLICT DO UPDATE SET col = EXCLUDED.col` sin `COALESCE` cuando `EXCLUDED` puede ser NULL por diseño.

---

## Referencias

| Recurso | Ubicación |
|---------|-----------|
| Runbook operativo | `docs/runbooks/MIGRATION_DATA_INTEGRITY.md` |
| Fix trigger/RPC | `backend/db/migrations/068_sync_content_never_null_wipe.sql` |
| Migración que causó el wipe | `backend/db/migrations/066_consultations_toast_reclaim.sql` |
| Verificación automatizada | `backend/db/migrations/verify_migrations.sql` (checks 068, CONTENT) |
| Auditoría estabilidad | `docs/auditorias/SUPABASE_DB_STABILITY_AUDIT.md` §14 |
| Hotfix app | `apps/web/src/lib/session-store.ts` (upsert post-RPC) |

---

## Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-06-07 | Documento inicial post-incidente; reglas permanentes R1–R7 |
