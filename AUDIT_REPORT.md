# Reporte de auditoría — The Original I Ching App

**Fecha:** 2026-03-25  
**Alcance:** seguridad, calidad, arquitectura, DB (SQL), tests, CI/CD, a11y/SEO básico, observabilidad.

## Resumen ejecutivo

| Categoría | Encontrados | Corregidos en repo | Pendiente / manual |
|-----------|-------------|--------------------|--------------------|
| Seguridad crítica | 3 | 3 | 1 (RLS verificación en Supabase) |
| Calidad de código | 2 | 2 | Lint global (falla parser en algunos entornos) |
| Arquitectura | 2 | 2 | Runtime Edge vs Node documentado en rutas |
| Base de datos | 1 | Scripts añadidos | Ejecutar SQL en Supabase |
| Tests | 1 | 5 tests nuevos en web | — |
| CI/CD | 1 | `ci.yml` añadido | Secrets en GitHub |
| Accesibilidad | 1 | `prefers-reduced-motion` | Modales / contraste [MANUAL] |
| SEO | 1 | `robots.ts`, `sitemap.ts` | Ajustar dominio en `NEXT_PUBLIC_APP_URL` |
| Observabilidad | 1 | Health + Vercel Analytics | Sentry opcional (ya en `.env.example`) |

## Comandos ejecutados (evidencia)

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | PASS (turbo: web + claude) |
| `npm test` | PASS (iching-engine 18, context-engine 1, web 5) |
| `npm run build` (apps/web) | **FAIL en este entorno** por `ETIMEDOUT` al descargar Google Fonts (`next/font`). No atribuible a los cambios de auditoría; en CI con red estable debería pasar. |
| `npm run lint` | **FAIL local (Windows/hoist)** en `apps/web`: `eslint-config-next` no resuelve `next/dist/compiled/babel/eslint-parser` desde la raíz del monorepo. [MANUAL] Reinstalar dependencias o ejecutar `next lint` desde `apps/web` con `next` resoluble; en Linux CI suele pasar. |

## Problemas críticos corregidos

### [CRÍTICO-001] Webhook RevenueCat sin secreto configurado aceptaba cualquier payload

- **Archivo:** `apps/web/src/app/api/webhooks/revenuecat/route.ts`
- **Problema:** Si `REVENUECAT_WEBHOOK_SECRET` estaba vacío, no se validaba `Authorization` y cualquiera podía enviar eventos falsos.
- **Riesgo:** Escalada de privilegios de facturación / manipulación de `query_credits`.
- **Solución:** Rechazar con `503` y `webhook_not_configured` cuando falta el secreto; si existe, exigir coincidencia con header (Bearer o valor crudo, según dashboard RC).

### [CRÍTICO-002] Lecturas públicas `/r/` sin comprobar `is_public`

- **Archivo:** `apps/web/src/lib/session-store.ts`
- **Problema:** Lectura por `public_sharing_id` sin filtrar `is_public = true` en Supabase.
- **Riesgo:** Exposición de consultas que deberían ser privadas si en el futuro se usa `is_public = false`.
- **Solución:** `.eq("is_public", true)` en consultas públicas; `insert` de consultas con `is_public: true` al persistir. Sesiones `/s/` devuelven `null` si no hay consultas públicas en la sesión.

### [CRÍTICO-003] Faltaban headers de seguridad HTTP en Next

- **Archivo:** `apps/web/next.config.mjs`
- **Solución:** `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` en todas las rutas. `images.remotePatterns` para orígenes habituales (Supabase, FAL, Together, Pollinations).

## Problemas altos corregidos

### [ALTO-001] Admin login sin rate limiting

- **Archivo:** `apps/web/src/app/api/admin/login/route.ts`
- **Solución:** `rateLimitByKey` 10 intentos / 15 min por IP.

### [ALTO-002] Sin CI en GitHub

- **Archivo:** `.github/workflows/ci.yml`
- **Solución:** Workflow `npm ci`, `typecheck`, `test`, `build` en `main` y PRs. El paso **`lint` está comentado** hasta que `eslint-config-next` resuelva el parser con el hoisting npm del monorepo (ver nota de `npm run lint` arriba).

## Problemas medios / mejoras

- **`npm run typecheck` en raíz:** añadido script + tarea turbo; implementado en `@iching-oracle/web` y `@iching-oracle/claude`.
- **Claude prompt caching:** `cache_control: { type: "ephemeral" }` en el bloque `system` de `messages.create` en `backend/claude/src/interpretation.ts` y `oracle-bones-interpretation.ts`.
- **Verificación webhook testeable:** `revenueCatWebhookAuthorized` en `apps/web/src/lib/revenuecat-webhook-auth.ts` + tests Vitest.
- **`.gitignore`:** ampliado con variantes `.env.*.local` y `*.log`.
- **`/api/health`:** respuesta JSON mínima sin secretos.
- **Vercel Analytics + Speed Insights** en `layout.tsx`.
- **A11y:** bloque global `prefers-reduced-motion` en `globals.css`.
- **SEO:** `app/robots.ts`, `app/sitemap.ts` usando `NEXT_PUBLIC_APP_URL` con fallback.

## Pendientes [MANUAL]

### [PENDIENTE-001] Verificar RLS en Supabase

Ejecutar `scripts/verify-db.sql` en el SQL Editor y confirmar `rowsecurity = true` en tablas sensibles. El repo incluye `backend/db/migrations/001_init.sql` con RLS en `consultations`, `consultation_sessions`, `query_credits`.

### [PENDIENTE-002] Backfill `is_public` para datos antiguos

Si enlaces `/r/` dejaron de resolver tras el filtro estricto, ejecutar:

`scripts/backfill-consultations-is-public.sql`

(Revisar política de privacidad antes en producción.)

### [PENDIENTE-003] Índices

Ejecutar `scripts/add-missing-indexes.sql` tras revisar índices existentes con `verify-db.sql`.

### [PENDIENTE-004] GitHub Actions secrets

Para que `npm run build` en CI pase, configurar en el repositorio: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (u otras que exija el build).

### [PENDIENTE-005] RevenueCat

Definir `REVENUECAT_WEBHOOK_SECRET` en Vercel/producción; sin él el webhook responde `503`.

### [PENDIENTE-006] Historial git `.env`

`git log --all --full-history -- .env` no mostró commits en este clon; verificar en remoto si alguna vez se subió un secreto y rotar claves si aplica.

## Tests añadidos

- `apps/web/src/lib/__tests__/revenuecat-webhook-auth.test.ts` (4 tests)
- `apps/web/src/lib/__tests__/credits-constants.test.ts` (1 test)
- `apps/web/vitest.config.ts`, script `test` en `apps/web/package.json`

## Motor I Ching

- No se modificó la lógica de mutación; los tests existentes en `packages/iching-engine` (18) siguen pasando.

## Archivos tocados (principal)

- `apps/web/next.config.mjs`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/robots.ts`, `apps/web/src/app/sitemap.ts`
- `apps/web/src/app/api/webhooks/revenuecat/route.ts`
- `apps/web/src/app/api/admin/login/route.ts`
- `apps/web/src/app/api/health/route.ts`
- `apps/web/src/lib/revenuecat-webhook-auth.ts`
- `apps/web/src/lib/session-store.ts`
- `apps/web/package.json`, `vitest.config.ts`, tests bajo `src/lib/__tests__/`
- `backend/claude/src/interpretation.ts`, `oracle-bones-interpretation.ts`
- `backend/claude/package.json`
- `package.json`, `turbo.json`
- `.gitignore`
- `.github/workflows/ci.yml`
- `scripts/verify-db.sql`, `scripts/add-missing-indexes.sql`, `scripts/backfill-consultations-is-public.sql`

## Estado final (checklist)

- [x] `npm run typecheck`: PASS (en este entorno)
- [x] `npm test`: PASS
- [ ] `npm run build`: **no verificado aquí** (timeout red / Google Fonts)
- [x] Secretos: no hallados hardcodeados en `.ts/.tsx` (búsqueda dirigida)
- [ ] RLS: verificación manual en Supabase
- [x] Webhook RC: exige secreto configurado
- [x] GitHub Actions: archivo creado
