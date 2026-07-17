# Gate: test de integración de aislamiento RLS cross-user

**Código:** `20260716-GATE-SEC-01 rls-isolation-test` · **Familia:** SEC · **Estado:** open

- **Fecha:** 2026-07-16
- **Origen:** Ticket B de [`20260716-PLAN-SEC-01`](./20260716-PLAN-SEC-01-p1-remediation.md); cierra el P1-2 de [`20260715-EXT-SEC-02`](./20260715-EXT-SEC-02-full-repo-deep-audit.md) §3 ("RLS activo no es lo mismo que RLS correcto").
- **Rama:** `feat/rls-integration-test` (pendiente de auditoría externa; no mergear sin aprobación).

---

## Qué garantiza

Contra una base Supabase REAL (Postgres 17 local con las 74 migraciones aplicadas), autenticado como dos usuarios distintos (A y B) creados vía `auth.admin`, para CADA tabla user-scoped:

| Aserción | Qué prueba |
|---|---|
| Control positivo | A lee su propia fila (la policy no es demasiado restrictiva) |
| Aislamiento de lectura | B hace SELECT de las filas de A y recibe **vacío, no error** (RLS filtra en silencio; esperar un throw pasaría sin probar nada) |
| Aislamiento de escritura | UPDATE y DELETE de B sobre la fila de A afectan **0 filas**, y la fila se verifica intacta después vía service role (incluida la no-filtración del patch) |
| Sin sesión | El cliente anon no ve ninguna fila |

**Tablas cubiertas** (todas las policies `(select auth.uid()) = user_id`, o `id` en users): `users`, `consultation_sessions`, `consultations`, `consultation_notes`, `pattern_analyses`, `query_credits`, `two_factor_recovery_codes`, `two_factor_attempts`, `two_factor_email_codes`.

**Casos de carga explícitos:** `query_credits` (el patch de ataque es literal: `credits_total: 999999` — acuñar tokens) y `consultations`/`consultation_notes` (contenido privado del oráculo).

**Guardas anti-punto-ciego del harness** (los que señaló la verificación externa del plan): aserción de que `auth.uid()` resuelve a ids DISTINTOS para A y B (falla el setup si ambos clientes quedaron como el mismo usuario); lectura cruzada asserta `toEqual([])` (vacío exacto, no throw); claves del stack desde el entorno (`supabase status`), nunca hardcodeadas; cleanup vía `auth.admin.deleteUser` (el trigger de la migración 012 + cascadas FK limpian las filas públicas) para que el test sea repetible.

## Cómo correrlo local

```bash
# requiere Docker corriendo
supabase start
# la CLI solo aplica supabase/migrations, que esta VACIO en el repo: las 74
# migraciones viven en backend/db/migrations. Stagearlas primero (excluyendo
# verify_migrations.sql, que es un script de gate, no una migracion):
mkdir -p supabase/migrations
# Clase 2 de no-replayabilidad (auditoria externa): pg_cron se habilito por
# Dashboard en prod, ninguna migracion la crea. 053 tiene guard (NOTICE), pero
# 059 lanza EXCEPTION por diseno y 064/065 llaman cron.* SIN guard. Preludio
# 000_ dentro del reset (un psql pre-reset se borraria: reset recrea la base):
echo "CREATE EXTENSION IF NOT EXISTS pg_cron;" > supabase/migrations/000_ci_enable_pg_cron.sql
cp backend/db/migrations/[0-9]*.sql supabase/migrations/
# Clase 1: datos de produccion. 037 asserta que el usuario admin de PRODUCCION
# exista; unica exclusion (verificado por auditoria externa: ninguna policy RLS
# usa is_admin, los checks de admin son de codigo de servidor).
rm supabase/migrations/037_seed_admin_user.sql
supabase db reset       # ahora si aplica el schema completo
# Ademas: grants prod-like (archivo 9999_, corre al final; OJO: la CLI ignora en silencio prefijos no numericos como zzz_): el staging local no
# replica las default privileges de Supabase prod; service_role necesita ALL y
# authenticated/anon sus grants de tabla (RLS filtra filas). Ver el step del
# workflow para el contenido exacto (no re-otorga sobre las tablas internas
# revocadas por 018/019/024/027/073). Hallazgo asociado: public.users y
# query_credits se AUTO-siembran por handle_new_auth_user + init_free_user
# (029): el harness verifica el pipeline real en vez de insertar a mano.
eval "$(supabase status -o env | sed 's/^/export /')"   # ANON_KEY / SERVICE_ROLE_KEY / API_URL
cd apps/web && SUPABASE_URL="$API_URL" npm run test:rls
```

## CI

Job `rls-test` en `.github/workflows/ci.yml`: instala la CLI de Supabase (pinneada 2.109.1), levanta el stack, stagea migraciones + preludio/grants efímeros, y corre la suite. **No bloqueante al inicio** (`continue-on-error: true`, mismo patrón que `resolution-guard`).

**Criterio del flip a bloqueante (fijado por auditoría externa en la aprobación del merge):** primer 9/9 el **2026-07-17** (run 29548233095); el flip va en un **cambio aparte** tras **3-5 corridas verdes en main**, igual que se hizo con resolution-guard.

## Estado de ejecución

- 2026-07-16: suite escrita y tipada (tsc verde). Run local bloqueado (Docker apagado); validación vía CI.
- 2026-07-17: **VERDE — Tests 9 passed (9)** en CI (run 29548233095, job rls-test 3m32s, commit aa43e2e8): las 9 tablas con sus 4 aserciones (control positivo, lectura cruzada vacía, escritura 0 filas + fila intacta verificada, anon sin filas). El camino al verde descubrió y documentó las capas de infra registradas arriba y en PLAN-SUP-02 (staging de migraciones, 037, pg_cron, grants, trigger on_auth_user_created, skip silencioso de prefijos no numéricos, rate-limit de setup-cli "latest" → CLI pinneada 2.109.1). Bonus de fidelidad: el gate rechazó un seed con schema pre-069 (`interpretation` dropeada), prueba de que corre contra el schema real. Pendiente: revisión completa del harness por auditoría externa antes del merge.
