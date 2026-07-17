# Deuda: hacer la cadena de migraciones replayable en cualquier entorno

**Código:** `20260716-PLAN-SUP-02 migration-chain-replayability` · **Familia:** SUP · **Estado:** open

- **Fecha:** 2026-07-16 · **Origen:** hallazgo del gate [`20260716-GATE-SEC-01`](./20260716-GATE-SEC-01-rls-isolation-test.md), confirmado y clasificado por auditoría externa.
- **Naturaleza:** deuda registrada para ejecución futura. NO ejecutar junto al Ticket B; es un ítem de disaster recovery por sí mismo.

## Hallazgo

La cadena de 74 migraciones **no es replayable en una base vacía** tal cual. Dos clases de dependencia, encontradas al intentar el replay completo en CI (base local de Supabase):

| Clase | Migraciones | Comportamiento en DB vacía | Mitigación actual (solo en el gate) |
|---|---|---|---|
| 1. Datos de producción | `037_seed_admin_user.sql` | RAISE EXCEPTION si el usuario admin del owner no existe en auth.users | Excluida del staging del gate (verificado: ninguna policy RLS usa `is_admin`; los checks de admin son de código de servidor) |
| 2. Extensión habilitada fuera de migraciones | `059` (EXCEPTION por diseño), `064` (~línea 108) y `065` (cron.* sin guard) | pg_cron se habilitó por Dashboard en prod; ninguna migración la crea; el replay muere | Preludio `000_ci_enable_pg_cron.sql` (CREATE EXTENSION IF NOT EXISTS) stageado dentro del reset. `053` no necesita nada: ya tiene guard con NOTICE |

**Por qué importa más allá del gate:** un restore/rebuild desde cero (disaster recovery, nuevo entorno, onboarding) tropieza con lo mismo. Hoy el conocimiento vive en el workflow del gate y en GATE-SEC-01; debería vivir en las migraciones mismas.

## Fix definitivo (candidatos, para cuando se ejecute)

1. **037 condicional:** convertir el RAISE EXCEPTION en el patrón de la 053 — `RAISE NOTICE` y skip si el usuario no existe. La migración queda idempotente y segura en cualquier entorno; en producción su efecto ya está aplicado.
2. **Guards en 064 y 065:** envolver los `cron.unschedule`/`cron.schedule` en el mismo guard `IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')` que usa la 053 (059 puede conservar su EXCEPTION intencional o alinearse; decisión al ejecutar).
3. Con 1+2, la cadena es replayable sin exclusiones y el preludio del gate queda solo como conveniencia de entorno.

## Reglas al ejecutar

- Son migraciones YA APLICADAS en prod/staging: el fix va como **migraciones nuevas** (075+) que no alteran el historial, o como edición de archivos históricos SOLO si se confirma que ningún entorno las tiene pendientes (regla: jamás editar migraciones ya aplicadas sin esa verificación).
- Actualizar `verify_migrations.sql` en el mismo commit (regla del proyecto).
- Smoke de replay: correr el staging del gate SIN exclusiones y confirmar 074/74 aplicadas.
