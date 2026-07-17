# Deuda: hacer la cadena de migraciones replayable en cualquier entorno

**Código:** `20260716-PLAN-SUP-02 migration-chain-replayability` · **Familia:** SUP · **Estado:** open

- **Fecha:** 2026-07-16 · **Origen:** hallazgo del gate [`20260716-GATE-SEC-01`](./20260716-GATE-SEC-01-rls-isolation-test.md), confirmado y clasificado por auditoría externa.
- **Naturaleza:** deuda registrada para ejecución futura. NO ejecutar junto al Ticket B; es un ítem de disaster recovery por sí mismo.

## Hallazgo

La cadena de 74 migraciones **no es replayable en una base vacía** tal cual. Dos clases de dependencia, encontradas al intentar el replay completo en CI (base local de Supabase):

| Clase | Migraciones | Comportamiento en DB vacía | Mitigación actual (solo en el gate) |
|---|---|---|---|
| 1. Datos de producción | `037_seed_admin_user.sql` | RAISE EXCEPTION si el usuario admin del owner no existe en auth.users | Excluida del staging del gate (verificado: ninguna policy RLS usa `is_admin`; los checks de admin son de código de servidor) |
| 2b. Trigger creado fuera de migraciones | `on_auth_user_created` (auth.users) | 029 define la FUNCION handle_new_auth_user pero NINGUNA migración crea el trigger (se creó por Dashboard); verify_migrations.sql:86 verifica su existencia sin que la cadena lo provea. Sin él: no se crean public.users ni query_credits al signup | Recreado en el archivo efímero 9999 del gate |
| 2. Extensión habilitada fuera de migraciones | `059` (EXCEPTION por diseño), `064` (~línea 108) y `065` (cron.* sin guard) | pg_cron se habilitó por Dashboard en prod; ninguna migración la crea; el replay muere | Preludio `000_ci_enable_pg_cron.sql` (CREATE EXTENSION IF NOT EXISTS) stageado dentro del reset. `053` no necesita nada: ya tiene guard con NOTICE |

**Por qué importa más allá del gate:** un restore/rebuild desde cero (disaster recovery, nuevo entorno, onboarding) tropieza con lo mismo. Hoy el conocimiento vive en el workflow del gate y en GATE-SEC-01; debería vivir en las migraciones mismas.

**Nota operativa descubierta en el gate:** la CLI de Supabase IGNORA EN SILENCIO archivos de migración sin prefijo numérico (`zzz_...` nunca se aplicó y no emitió warning). Cualquier tooling de staging debe usar prefijos numéricos.

## Fix definitivo (candidatos, para cuando se ejecute)

1. **037 condicional:** convertir el RAISE EXCEPTION en el patrón de la 053 — `RAISE NOTICE` y skip si el usuario no existe. La migración queda idempotente y segura en cualquier entorno; en producción su efecto ya está aplicado.
2. **Guards en 064 y 065:** envolver los `cron.unschedule`/`cron.schedule` en el mismo guard `IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')` que usa la 053 (059 puede conservar su EXCEPTION intencional o alinearse; decisión al ejecutar).
3. **Trigger 029-bis:** añadir una migración que cree `on_auth_user_created` con `DROP TRIGGER IF EXISTS` previo (idempotente en prod, donde ya existe).
4. Con 1+2+3, la cadena es replayable sin exclusiones y el preludio del gate queda solo como conveniencia de entorno.

## Reglas al ejecutar

- Son migraciones YA APLICADAS en prod/staging: el fix va como **migraciones nuevas** (075+) que no alteran el historial, o como edición de archivos históricos SOLO si se confirma que ningún entorno las tiene pendientes (regla: jamás editar migraciones ya aplicadas sin esa verificación).
- Actualizar `verify_migrations.sql` en el mismo commit (regla del proyecto).
- Smoke de replay: correr el staging del gate SIN exclusiones y confirmar 074/74 aplicadas.

## Ejecución (2026-07-17, rama chore/migrations-replayable — PLAN-SEC-02 Ticket 3)

- 037: condicional (NOTICE+skip si el owner no existe). **Edición in-place justificada:** una migración posterior no puede impedir que una anterior falle en replay fresco; las 4 están aplicadas en TODOS los entornos (prod y staging corren la app sobre 074) y Supabase registra por versión, así que la edición de contenido jamás re-ejecuta.
- 059: alineada al patrón 053 (decisión que este plan dejó abierta: NOTICE+skip; en prod corrió con pg_cron presente, comportamiento histórico intacto). Echo de verificación sobre cron.job también guardeado.
- 064/065: cron.schedule y verificación envueltos en guard pg_cron (los unschedule ya eran tolerantes via EXCEPTION WHEN OTHERS).
- 075 (NUEVA): codifica on_auth_user_created en la cadena (hallazgo 2b cerrado). verify_migrations.sql con entrada '075' en el mismo commit.
- Gate de CI simplificado: SIN preludio pg_cron y SIN exclusión de 037 — el staging del rls-test es ahora un replay completo 001..075 en base vacía en cada corrida. El archivo 9999 queda solo con los grants prod-like (artefacto del stack local, no defecto de la cadena).

## Veredicto de auditoría externa (2026-07-17): APROBADO, desviación RATIFICADA

- Las 4 ediciones in-place verificadas contra los diffs: quirúrgicas, solo el brazo de fallo cambia (EXCEPTION -> NOTICE+RETURN, guards pg_cron, SELECT final de 059 envuelto); comportamiento byte-idéntico donde las precondiciones se cumplen (todo entorno desplegado). El registro histórico de lo que corrió en producción se preserva.
- **La letra original de este plan ("jamás editar aplicadas; migraciones 075+ para los fixes") queda SUSTITUIDA en este punto por ratificación del auditor: era mecánicamente imposible** — una migración 075 no puede impedir que la 037 reviente durante un replay secuencial, porque la 037 corre primero. La edición justificada de archivos aplicados era la única vía.
- Sobre el hallazgo 2b (el más grave del plan): cualquier disaster recovery real anterior a esta rama habría producido una base que arranca, migra "bien" y rompe silenciosamente cada signup (auth.users sin fila en public.users, sin créditos free). El gate RLS lo desenterró antes de que existiera ese día.
- **Nota de ejecución en producción de la 075:** aplicarla dentro de UNA transacción (BEGIN/COMMIT o el SQL Editor de Supabase, que ya envuelve el script) para cerrar la ventana de milisegundos sin trigger entre el DROP y el CREATE. Anotado también en el header del archivo.
- **Trade-off consciente registrado:** sin el preludio 000_, el replay de CI corre sin pg_cron — los bloques de cron se saltan con NOTICE en vez de ejecutarse. El gate testea el escenario DR más duro (base virgen, sin extensión), a cambio de que el SQL interno de scheduling ya no se ejercita en CI. Aceptado.
