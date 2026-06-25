# Manual de restauración — interpretaciones I Ching App
**Código:** `00000000-RUN-REST-01 restoration-manual` · **Familia:** SUP-REST · **Estado:** reference


**Proyecto prod:** Supabase `wgborqkfnxfarkdaotsd`  
**Dominio web:** [theoriginaliching.com](https://theoriginaliching.com)  
**Última revisión:** 2026-06-07 (incidente P0 + recovery validado)

Este manual describe cómo **recuperar el texto de las interpretaciones** tras pérdida en base de datos, sin revertir el proyecto entero ni el código desplegado.

---

## Índice

1. [Arquitectura: dónde está el texto](#1-arquitectura-dónde-está-el-texto)
2. [Síntomas del incidente](#2-síntomas-del-incidente)
3. [Qué NO hacer](#3-qué-no-hacer)
4. [Prevención (para que no se repita)](#4-prevención-para-que-no-se-repita)
5. [Procedimiento de restore](#5-procedimiento-de-restore)
6. [Verificación](#6-verificación)
7. [Limpieza post-restore](#7-limpieza-post-restore)
8. [Preguntas frecuentes](#8-preguntas-frecuentes)
9. [Referencias](#9-referencias)

---

## 1. Arquitectura: dónde está el texto

Desde **Fase 2/3** (migraciones 062–068), el contenido está **split**:

```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│  public.consultations       │     │  public.consultation_content │
│  (metadata — sin TOAST)     │     │  (texto largo — TOAST)        │
├─────────────────────────────┤     ├──────────────────────────────┤
│  question, hexagrama, lines │     │  interpretation  ← TEXTO     │
│  image_url, category        │     │  oracle_bones    ← bones     │
│  interpretation_summary     │     │  consultation_id (PK/FK)     │
│  interpretation = NULL (*)  │     │  user_id, session_id         │
│  oracle_bones = NULL (*)    │     └──────────────────────────────┘
└─────────────────────────────┘
         (*) normal tras migración 066 — NO buscar texto aquí
```

| Pregunta | Tabla correcta |
|----------|----------------|
| ¿Dónde está el texto completo del oráculo? | **`consultation_content.interpretation`** |
| ¿Dónde está la pregunta y la imagen? | `consultations` |
| ¿Por qué `consultations.interpretation` es NULL? | Diseño Fase 3: legacy TOAST vaciado (066). **Es esperado.** |
| ¿Cómo lee la app? | API `thread=1` → `get_session_content_safe` → **`consultation_content`** |

**Error típico post-incidente:** abrir Table Editor en `consultations`, ver `interpretation` NULL y pensar que los datos se perdieron. **Siempre revisar `consultation_content` primero.**

---

## 2. Síntomas del incidente

| Síntoma en la app | Síntoma en DB |
|-------------------|---------------|
| Pregunta + imagen + hexagrama visibles | `consultations` intacta |
| Solo resumen corto o texto vacío al recargar | `consultation_content.interpretation` NULL o vacío |
| Tras F5 desaparece el texto largo | Mismo |
| Consultas nuevas tampoco persisten texto | RPC/upsert roto (otro incidente) |

**Query de diagnóstico (prod):**

```sql
SELECT
  (SELECT COUNT(*) FROM public.consultations) AS consults,
  (SELECT COUNT(*) FROM public.consultation_content
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS content_with_full_text;
```

| `content_with_full_text` | Interpretación |
|--------------------------|----------------|
| = `consults` (o cercano) | ✅ Datos OK — revisar app/caché |
| = 0 con `consults` > 0 | 🔴 Pérdida de contenido — iniciar restore |
| Entre 0 y consults | ⚠️ Pérdida parcial — restore + identificar huecos |

---

## 3. Qué NO hacer

| Acción | Por qué |
|--------|---------|
| **Restore in-place** del backup sobre prod (botón Restore que dice *"project will be offline"*) | Borra datos posteriores al snapshot, revierte migraciones, caída total |
| Buscar texto solo en `consultations.interpretation` | Columna vacía por diseño post-066 |
| Importar CSV con columna `merge_sql` a Table Editor | Es SQL, no datos tabulares |
| Ejecutar `SELECT format(...)` en **prod** para generar UPDATEs | Prod no tiene texto en `consultations` → 0 filas |
| `VACUUM FULL` antes de intentar PITR | Puede destruir TOAST muerto recuperable |
| Aplicar migración 066 sin 068 previo | Repite el incidente P0 |

**Regla:** restore = **proyecto clon** + **merge selectivo** en prod, nunca reemplazar prod entero.

---

## 4. Prevención (para que no se repita)

Antes de cualquier migración que toque `interpretation` / `oracle_bones`:

1. **068 aplicada** (trigger NULL-safe) antes de NULL masivos.
2. **Backup/PITR** confirmado; anotar timestamp de rollback.
3. **Gate R3** before/after:

```sql
SELECT COUNT(*) AS content_with_full_text
FROM public.consultation_content
WHERE interpretation IS NOT NULL AND length(interpretation) > 100;
```

4. Smoke: abrir chat → **hard reload (F5)** → texto completo visible.
5. `verify_migrations.sql` — checks **068** y **CONTENT** deben pasar.

Documentación detallada:

- [`docs/runbooks/00000000-RUN-SUP-01-migration-data-integrity.md`](../runbooks/00000000-RUN-SUP-01-migration-data-integrity.md)
- [`docs/auditorias/20260607-INC-SUP-INC-01-consultation-content-wipe.md`](../auditorias/20260607-INC-SUP-INC-01-consultation-content-wipe.md)

---

## 5. Procedimiento de restore

### Resumen visual

```
Prod (texto perdido)     Clon (backup)              Prod (recuperado)
        │                      │                           │
        │   Restore to new     │                           │
        │◄─────────────────────┤                           │
        │                      │  export CSV (id + texto)    │
        │                      ├──────────────────────────►│
        │                      │  staging table + UPSERT   │
        │                      │      consultation_content │
```

**Tiempo estimado:** 30–90 min (clon 10–45 min + export/import/merge 15 min).

---

### Paso 1 — Crear proyecto clon (Dashboard)

1. [Supabase Dashboard → Backups](https://supabase.com/dashboard/project/wgborqkfnxfarkdaotsd/database/backups)
2. Pestaña **「Restore to a new project」** (NO el Restore in-place de daily backups).
3. Elegir backup **anterior al incidente**:
   - **PITR:** timestamp justo antes del wipe (ej. 5–15 min antes).
   - **Daily backup:** el más reciente **anterior** al incidente (ej. 05:44 UTC del mismo día).
4. Confirmar coste del proyecto nuevo → **Restore**.
5. Esperar estado **ACTIVE** (~10–45 min).
6. Anotar project ref del clon: `________________`

> **Nota:** backups antiguos (pre-062) **no tienen** tabla `consultation_content`. El texto estará en `consultations.interpretation` — el flujo del Paso 3 cubre ambos casos.

---

### Paso 2 — Verificar clon

**SQL Editor del CLON** (no prod):

```sql
SELECT
  (SELECT COUNT(*) FROM public.consultations) AS consults,
  (SELECT COUNT(*) FROM public.consultation_content
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS content_text,
  (SELECT COUNT(*) FROM public.consultations
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS legacy_text;
```

| Resultado | Acción |
|-----------|--------|
| `content_text` > 0 | Exportar desde `consultation_content` (Paso 3A) |
| `content_text` = 0 pero `legacy_text` > 0 | Exportar desde `consultations` (Paso 3B — backup pre-062) |
| Ambos = 0 | Probar backup más antiguo |

---

### Paso 3A — Export (clon con `consultation_content`)

**CLON → SQL Editor → sin límite de filas:**

```sql
SELECT id::text AS consultation_id, interpretation, oracle_bones
FROM public.consultation_content
WHERE interpretation IS NOT NULL AND length(interpretation) > 100
ORDER BY id;
```

Download **CSV** — columnas: `consultation_id`, `interpretation`, `oracle_bones`.

---

### Paso 3B — Export (clon sin `consultation_content` — backup legacy)

**CLON → SQL Editor:**

```sql
SELECT id::text AS consultation_id, interpretation, oracle_bones
FROM public.consultations
WHERE interpretation IS NOT NULL AND length(interpretation) > 100
ORDER BY id;
```

Download **CSV** — mismas 3 columnas.

---

### Paso 4 — Staging en prod

**PROD** (`wgborqkfnxfarkdaotsd`) — confirmar URL del proyecto.

**4.1 Crear tabla puente** (una sola vez por incidente):

```sql
CREATE TABLE IF NOT EXISTS public.recovery_consultation_import (
  consultation_id uuid PRIMARY KEY,
  interpretation  text NOT NULL,
  oracle_bones    jsonb
);
```

**4.2 Import CSV:**

- Table Editor → `recovery_consultation_import` → **Import data from CSV**
- Mapear: `consultation_id` → uuid, `interpretation` → text, `oracle_bones` → jsonb
- `oracle_bones` vacío/NULL en filas I Ching es **normal**

**Errores comunes al importar:**

| Error | Causa | Solución |
|-------|-------|----------|
| *column merge_sql is not present* | CSV de UPDATEs, no de datos | Re-exportar con Paso 3A/3B |
| *DATA INCOMPATIBLE* | Columnas no coinciden | CSV debe tener exactamente 3 columnas arriba |

---

### Paso 5 — Merge a `consultation_content` (prod)

**PROD → SQL Editor:**

```sql
INSERT INTO public.consultation_content (
  consultation_id,
  user_id,
  session_id,
  interpretation,
  oracle_bones
)
SELECT
  r.consultation_id,
  c.user_id,
  c.session_id,
  r.interpretation,
  r.oracle_bones
FROM public.recovery_consultation_import AS r
JOIN public.consultations AS c ON c.id = r.consultation_id
ON CONFLICT (consultation_id) DO UPDATE SET
  interpretation = EXCLUDED.interpretation,
  oracle_bones   = COALESCE(EXCLUDED.oracle_bones, public.consultation_content.oracle_bones);
```

Respuesta esperada: **`UPDATE N`** donde N ≈ filas importadas (filas que ya existían con NULL).

**Opcional — resumen en meta:**

```sql
UPDATE public.consultations AS c
SET interpretation_summary = left(r.interpretation, 420)
FROM public.recovery_consultation_import AS r
WHERE c.id = r.consultation_id
  AND (c.interpretation_summary IS NULL OR c.interpretation_summary = '');
```

---

### Alternativa — CSV `merge_sql` (solo si ya lo generaste)

Si tienes un CSV con columna `merge_sql` (líneas `UPDATE public.consultation_content SET...`):

1. Abrir en **Bloc de notas** (no Excel).
2. Copiar todas las líneas `UPDATE`.
3. Pegar en **PROD → SQL Editor → Run**.

No importar ese CSV a Table Editor.

---

## 6. Verificación

### 6.1 Base de datos (prod)

```sql
SELECT
  (SELECT COUNT(*) FROM public.recovery_consultation_import) AS imported,
  (SELECT COUNT(*) FROM public.consultation_content
   WHERE interpretation IS NOT NULL AND length(interpretation) > 100) AS recovered,
  (SELECT COUNT(*) FROM public.consultations) AS total_consults;
```

Consultas creadas **después** del snapshot del backup **no** se recuperan — listar huecos:

```sql
SELECT c.id, c.created_at, left(c.question, 50) AS q
FROM public.consultations c
LEFT JOIN public.consultation_content cc ON cc.consultation_id = c.id
WHERE cc.interpretation IS NULL OR length(COALESCE(cc.interpretation, '')) < 100
ORDER BY c.created_at DESC;
```

Ejecutar `backend/db/migrations/verify_migrations.sql` — check **CONTENT** debe pasar (o reflejar solo huecos post-backup).

### 6.2 Aplicación

| # | Acción | Éxito |
|---|--------|-------|
| 1 | Login en [theoriginaliching.com](https://theoriginaliching.com) | OK |
| 2 | Abrir chat **anterior** al incidente | Texto completo visible |
| 3 | **F5** (hard reload) | Texto persiste |
| 4 | Nueva consulta de prueba | Texto persiste tras reload |
| 5 | Logs Supabase API (opcional) | 0×500 en `thread=1` |

### 6.3 Dónde mirar en Table Editor

| Tabla | Campo | Valor esperado post-restore |
|-------|-------|---------------------------|
| `consultation_content` | `interpretation` | Texto markdown largo |
| `consultations` | `interpretation` | **NULL** (normal) |
| `consultations` | `interpretation_summary` | Opcional (~420 chars) |

---

## 7. Limpieza post-restore

Ejecutar **solo tras smoke OK**:

```sql
-- Prod: eliminar tabla puente
DROP TABLE IF EXISTS public.recovery_consultation_import;
```

**Dashboard Supabase:**

- Pausar o **eliminar** el proyecto clon (evita coste mensual extra).
- Documentar en incidente: fecha, backup usado, filas recuperadas, filas no recuperables.

**No ejecutar** `VACUUM FULL public.consultations` hasta estabilizar y cerrar incidente.

---

## 8. Preguntas frecuentes

**¿Por qué `consultations.interpretation` sigue NULL después del restore?**  
Por diseño (066). El texto vive en `consultation_content`. NULL ahí es correcto.

**¿Por qué algunas filas en `recovery_import` tienen `oracle_bones` NULL?**  
Consultas I Ching no usan huesos de oráculo. Solo ~12 filas bones tienen JSON.

**¿Recupero consultas hechas después del backup?**  
No. Solo existían en prod post-snapshot. Opciones: caché local (IndexedDB/APK), PDF exportado, o aceptar pérdida.

**¿Cuántas consultas puedo perder con daily backup vs PITR?**  
Daily: desde último snapshot nocturno (~24 h). PITR: granularidad de minutos (si add-on activo).

**¿El restore afecta usuarios, tokens o auth?**  
No, si usas merge selectivo. Usuarios y `query_credits` no se tocan.

**¿Puedo borrar `recovery_consultation_import` antes de verificar?**  
No. Mantener hasta confirmar `consultation_content` y smoke app.

---

## 9. Referencias

| Recurso | Ubicación |
|---------|-----------|
| Scripts SQL recovery | [`backend/db/scripts/recover_consultation_content_2026-06-07.sql`](../../backend/db/scripts/recover_consultation_content_2026-06-07.sql) |
| Import CSV → prod | [`backend/db/scripts/recover_import_csv_to_prod.sql`](../../backend/db/scripts/recover_import_csv_to_prod.sql) |
| Runbook PITR (detalle) | [`docs/runbooks/00000000-RUN-SUP-05-recover-pitr.md`](../runbooks/00000000-RUN-SUP-05-recover-pitr.md) |
| Gates migraciones | [`docs/runbooks/00000000-RUN-SUP-01-migration-data-integrity.md`](../runbooks/00000000-RUN-SUP-01-migration-data-integrity.md) |
| Incidente P0 | [`docs/auditorias/20260607-INC-SUP-INC-01-consultation-content-wipe.md`](../auditorias/20260607-INC-SUP-INC-01-consultation-content-wipe.md) |
| Estabilidad Supabase | [`docs/auditorias/00000000-AUD-SUP-01-supabase-db-stability.md`](../auditorias/00000000-AUD-SUP-01-supabase-db-stability.md) |

---

## Checklist rápido (imprimible)

```
[ ] Confirmado: content_with_full_text = 0 (o parcial) — hay incidente
[ ] Clon creado (Restore to new project) — NO in-place
[ ] Clon verificado: legacy_text o content_text > 0
[ ] CSV exportado (consultation_id, interpretation, oracle_bones)
[ ] recovery_consultation_import creada en PROD
[ ] CSV importado en PROD (3 columnas, NO merge_sql)
[ ] UPSERT ejecutado — UPDATE N > 0
[ ] Post-check: recovered ≈ filas importadas
[ ] App smoke: chat antiguo + F5 OK
[ ] DROP recovery_consultation_import
[ ] Proyecto clon pausado/eliminado
[ ] Incidente documentado
```
