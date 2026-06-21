# Nueva Base de Datos — Guía de Inicialización Completa

Guía canónica para inicializar un proyecto Supabase nuevo desde cero.
Aplica a: entorno de staging nuevo, entorno de producción, o cualquier reset de DB.

---

## Prerequisitos

- Proyecto Supabase creado (Free o Pro)
- Acceso al SQL Editor del proyecto
- Variables de entorno disponibles (ver sección final)
- Node.js 22+ y npm instalados

---

## Paso 1 — Migraciones SQL (orden estricto)

> **Lista canónica actual:** ejecutar **todos** los archivos numerados en
> `backend/db/migrations/` del **001** al **074** (`074_line_reading_system.sql`
> incluye `consultations.line_reading_system`). Al finalizar, ejecutar
> `verify_migrations.sql` y confirmar que todos los checks pasan.

Ejecutar **en este orden exacto** en el SQL Editor de Supabase.
Las migraciones marcadas con ⚠️ tienen partes obsoletas — ver nota al final.

**Nota:** el detalle histórico abajo cubre 001–038; continuar con 039–074 desde el directorio del repo antes del paso 2.

```
001_init.sql                          ← Schema base: todas las tablas principales
002_oracle_bones.sql                  ← Columnas oracle_bones en consultations
003_auth_public_users_sync.sql        ← Trigger handle_new_auth_user v1 + backfill
004_security_advisor_rls.sql          ← RLS en users, 2FA, notas, análisis
005_revenuecat_webhook_idempotency.sql ← Tabla revenuecat_webhook_events
006_disable_public_sharing.sql        ← Privacidad: is_public = false por defecto
007_two_factor_email_codes.sql        ← Tabla two_factor_email_codes + constraint email
008_chat_history_query_indexes.sql    ← Índices de performance para historial
⚠️  009_tiers_v4_free_lifetime.sql   ← OBSOLETA — ejecutar de todas formas (no daña)
010_auth_public_users_delete_sync.sql ← handle_deleted_auth_user v1 (AFTER DELETE)
011_two_factor_attempts_cascade.sql   ← FK cascade en two_factor_attempts
012_auth_delete_public_users_before.sql ← Cambia trigger a BEFORE DELETE (IMPORTANTE)
013_auth_public_users_resync.sql      ← handle_new_auth_user v2 + backfill
⚠️  014_query_credits_hardening.sql  ← OBSOLETA entre 009 y 021 — ejecutar de todas formas
⚠️  015_seeker_tier_variants.sql     ← OBSOLETA — no daña en DB vacía
016_totp_replay_guard.sql             ← Columna totp_last_used_step
017_admin_runtime_config.sql          ← Tabla admin_runtime_config
018_revenuecat_customer_aliases.sql   ← Tabla revenuecat_customer_aliases + RLS
019_revenuecat_internal_tables_rls.sql ← RLS hardening tablas RC
⚠️  020_free_lifetime_usage.sql      ← OBSOLETA — no daña en DB vacía
021_consumable_tokens.sql             ← DDL CRÍTICO: elimina modelo suscripción,
                                         agrega total_purchased + last_pack,
                                         UNIQUE INDEX en user_id
022_user_trial_log.sql                ← Tabla user_trial_log + init_free_user FINAL
023_auth_user_free_bootstrap_sync.sql ← handle_new_auth_user v3 + backfill
024_security_baseline_hardening.sql   ← grant_tokens + consume_token FINAL + RLS interno
025_display_name.sql                  ← Columna display_name en users
026_is_admin.sql                      ← Columna is_admin en users
027_user_legal_acceptances.sql        ← Tabla user_legal_acceptances
028_auth_email_registered_rpc.sql     ← Función auth_email_registered (service_role)
029_handle_new_auth_user_email_orphans.sql ← handle_new_auth_user FINAL (limpia orphans)
030_2fa_reset_recovery_codes_atomic.sql   ← reset_2fa_recovery_codes atómica
031_interpretation_summary.sql            ← columna interpretation_summary en consultations
032_atomic_token_consumption.sql          ← consume_token devuelve -1 si saldo vacío
033_drop_legacy_consume_token.sql         ← elimina versión anterior de consume_token
034_translator_column.sql                 ← columna translator en consultations
035_revoke_public_execute_on_secdef_functions.sql ← hardening de seguridad
036_consultations_session_id_index.sql    ← índice en consultations(session_id)
037_grant_is_admin_to_app_owner.sql       ← grant is_admin al owner account de producción
038_raise_statement_timeout.sql           ← statement_timeout: authenticated→30s, anon→10s, authenticator→30s
039_atomic_webhook_grant.sql              ← grant_tokens_idempotent
… (040–073: ver `backend/db/migrations/`)
074_line_reading_system.sql               ← consultations.line_reading_system (huang | zhuxi)
```

> **Nota sobre migraciones ⚠️**: Son obsoletas en el sentido de que agregan columnas
> que 021 luego elimina. En una DB vacía no causan error — simplemente 021 las dropea.
> Se incluyen por trazabilidad histórica. En una refactorización futura pueden eliminarse.

---

## Paso 2 — Verificación post-migraciones

Ejecutar en el SQL Editor para confirmar que todo quedó correcto:

```sql
-- Triggers en auth.users (deben existir ambos)
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users';
-- Esperado: on_auth_user_created (AFTER INSERT) + on_auth_user_deleted (BEFORE DELETE)

-- Schema final de query_credits (modelo consumable)
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'query_credits'
ORDER BY ordinal_position;
-- Debe tener: id, user_id, credits_total, credits_used, updated_at, total_purchased, last_pack
-- NO debe tener: tier, cycle_start, cycle_end, credits_type, free_lifetime_used

-- Funciones críticas
SELECT proname FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'handle_new_auth_user', 'handle_deleted_auth_user',
    'init_free_user', 'grant_tokens', 'consume_token',
    'auth_email_registered', 'reset_2fa_recovery_codes',
    'random_public_id'
  )
ORDER BY proname;
-- Deben aparecer las 8 funciones

-- Test del flujo de signup
DO $$
DECLARE v_test_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO public.users (id, email) VALUES (v_test_id, 'test-setup@noop.internal');
  PERFORM public.init_free_user(v_test_id);
  ASSERT EXISTS (SELECT 1 FROM public.query_credits  WHERE user_id = v_test_id), 'FALLO query_credits';
  ASSERT EXISTS (SELECT 1 FROM public.user_trial_log WHERE user_id = v_test_id), 'FALLO user_trial_log';
  DELETE FROM public.users WHERE id = v_test_id;
  RAISE NOTICE '✅ Signup flow OK';
END $$;
```

---

## Paso 3 — Datos iniciales de configuración

```sql
-- Configuración de runtime (proveedor de imágenes y modo de respuesta por defecto)
INSERT INTO public.admin_runtime_config (id, image_provider_default, response_mode_default, insights_default)
VALUES ('main', 'together', 'streaming', true)
ON CONFLICT (id) DO NOTHING;
```

---

## Paso 4 — Asignar admin

Después del primer signup con tu cuenta:

```sql
-- Busca tu UUID
SELECT id, email FROM public.users WHERE email = 'tu-email@ejemplo.com';

-- Asigna admin
UPDATE public.users SET is_admin = true WHERE id = 'TU-UUID';
```

---

## Paso 5 — Servicios externos

### Google OAuth

1. Google Cloud Console → APIs & Services → Credentials
2. OAuth 2.0 Client IDs → Web application
3. Authorized redirect URIs agregar:
   - `https://<proyecto>.supabase.co/auth/v1/callback`
   - `https://tu-dominio.com/auth/v1/callback` (producción)
4. En Supabase → Authentication → Providers → Google:
   - Client ID: `<GOOGLE_CLIENT_ID>`
   - Client Secret: `<GOOGLE_CLIENT_SECRET>`

### RevenueCat

1. RevenueCat Dashboard → Project → Apps → Web
2. En Entitlements: crear `seeker`, `practitioner`, `master`
3. En Products: crear los SKUs correspondientes con Stripe
4. Webhook URL: `https://tu-dominio.com/api/webhooks/revenuecat`
5. Copiar `REVENUECAT_WEBHOOK_SECRET` del panel de webhooks

### Resend (emails transaccionales)

1. Resend Dashboard → Domains → verificar `theoriginaliching.com`
2. Agregar registros DNS (SPF, DKIM, DMARC) en tu proveedor DNS
3. Crear API Key con permisos Send
4. `RESEND_API_KEY` → copiar al entorno Vercel

### Cloudflare Turnstile

1. Cloudflare Dashboard → Turnstile → Add Site
2. Tipo: Managed
3. Dominios permitidos: tu dominio de staging + producción
4. Copiar Site Key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
5. Copiar Secret Key → `TURNSTILE_SECRET_KEY`

---

## Paso 6 — Variables de entorno en Vercel

Configurar por entorno (Production / Preview) en Vercel → Settings → Environment Variables:

### Supabase

| Variable | Entorno | Valor |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | All | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | anon/public key |
| `SUPABASE_URL` | All | igual que la pública |
| `SUPABASE_ANON_KEY` | All | igual que la pública |
| `SUPABASE_SERVICE_ROLE_KEY` | All | service_role key (solo backend) |

### IA y pagos

| Variable | Entorno | Valor |
|---|---|---|
| `ANTHROPIC_API_KEY` | All | API key de Anthropic |
| `TOGETHER_API_KEY` | All | API key de Together AI |
| `REVENUECAT_WEBHOOK_SECRET` | All | Secret del webhook RC |
| `RESEND_API_KEY` | All | API key de Resend |

### Turnstile

| Variable | Entorno | Valor |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | All | Site key de Cloudflare |
| `TURNSTILE_SECRET_KEY` | All | Secret key de Cloudflare |

### Debug (solo staging/preview)

| Variable | Entorno | Valor |
|---|---|---|
| `LOG_TOKEN_BALANCE_DEBUG` | Preview | `true` |

> **Importante**: `SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al cliente.
> Solo se usa en API routes del servidor. Nunca agregar prefijo `NEXT_PUBLIC_`.

---

## Paso 7 — Verificación end-to-end

Orden de pruebas recomendado tras el deploy:

- [ ] Signup email/password → usuario aparece en auth.users y public.users con 2 créditos
- [ ] Login Google OAuth → mismo flujo, legal consent gate aparece
- [ ] Consulta I Ching → consume 1 token, remainingCredits actualiza en UI
- [ ] Compra RevenueCat + Stripe → webhook llega, `grant_tokens` suma créditos
- [ ] 2FA TOTP → setup y verificación
- [ ] Exportar PDF → funciona sin errores
- [ ] Generación de imagen → resolución correcta según tier

---

## Schema final de tablas (referencia rápida)

### `public.users`
```
id UUID PK | email TEXT UNIQUE | two_factor_enabled BOOL
two_factor_method TEXT | phone_number TEXT | phone_verified_at TIMESTAMPTZ
totp_secret TEXT | totp_verified_at TIMESTAMPTZ | totp_last_used_step BIGINT
language TEXT DEFAULT 'es' | display_name TEXT | is_admin BOOL DEFAULT false
created_at TIMESTAMPTZ
```

### `public.query_credits`
```
id UUID PK | user_id UUID UNIQUE FK→users | credits_total INT
credits_used INT DEFAULT 0 | total_purchased INT DEFAULT 0
last_pack TEXT DEFAULT 'free' | updated_at TIMESTAMPTZ
```

### `public.user_trial_log`
```
user_id UUID PK FK→users | granted_at TIMESTAMPTZ
```

### `public.revenuecat_webhook_events`
```
id BIGSERIAL PK | event_hash TEXT UNIQUE | event_type TEXT
app_user_id UUID | processed_at TIMESTAMPTZ
```

### `public.revenuecat_customer_aliases`
```
id BIGSERIAL PK | app_user_id TEXT UNIQUE | canonical_app_user_id TEXT
source TEXT DEFAULT 'webhook' | updated_at TIMESTAMPTZ
```

### `public.admin_runtime_config`
```
id TEXT PK | image_provider_default TEXT | response_mode_default TEXT
insights_default BOOL | updated_at TIMESTAMPTZ
```
