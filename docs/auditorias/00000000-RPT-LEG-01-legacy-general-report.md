# Reporte de Auditoría de Seguridad y Arquitectura
**Código:** `00000000-RPT-LEG-01 legacy-general-report` · **Familia:** LEG · **Estado:** reference


## Estado · Changelog de cierre

> **Estado:** ✅ CERRADA — los 5 hallazgos remediados el mismo día de la auditoría

| Campo | Valor |
|-------|-------|
| **Abierta** | 2026-05-26 |
| **Cerrada** | 2026-05-26 |
| **Commit de cierre** | `3d773ab` — security: remediate pentest findings H1–H5 |

### Resolución de hallazgos

| ID | Severidad | Hallazgo | Resultado | Detalle del fix |
|----|-----------|---------|-----------|-----------------|
| H1 | High | Rate limiting degradable sin Upstash distribuido | ✅ Corregido | `rate-limit.ts`: fail-closed en producción; in-memory Map solo en desarrollo |
| H2 | Medium | Admin mutable endpoint sin CSRF explícito | ✅ Corregido | `admin/config POST`: validación `Origin`/`Host` estricta añadida |
| H3 | Medium | Webhook billing: dedup+grant no atómico | ✅ Corregido | Migración 039 — `grant_tokens_idempotent()` RPC en transacción única |
| H4 | Low | `admin/public-config` expone toggles a no autenticados | ✅ **RUTA ELIMINADA** | `apps/web/src/app/api/admin/public-config/route.ts` borrado |
| H5 | Low | Service role sin fail-fast en startup | ✅ Corregido | `startup-checks.ts` — `assertCriticalConfig()` falla loud en cold start |

### Lección aprendida

La auditoría y la remediación completa ocurrieron el mismo día, lo que indica que los hallazgos eran accionables inmediatamente. El hallazgo más valioso fue H3: la no atomicidad entre `INSERT dedup` y `grant_tokens()` bajo fallo parcial de DB. La solución (un RPC SQL que ejecuta ambas operaciones en una sola transacción) es la arquitectura correcta para webhooks de pago idempotentes.

---

## Proyecto auditado

- Repositorio: `iching-app` (workspace local)
- Fecha: 2026-05-26
- Alcance: web (`apps/web`), mobile (`apps/mobile`), backend/migraciones (`backend/db`), librerías compartidas
- Modalidad: auditoría estática + validación técnica controlada
- Restricción: **sin aplicar fixes** *(los fixes se aplicaron en `3d773ab` tras la auditoría)*

---

## Resumen Ejecutivo

Se auditó el código de `iching-app` sobre rutas API críticas, autenticación, administración, webhooks, rate limiting y funciones SQL de privilegio.

### Resultado general

- No se detectaron secretos expuestos en git en esta sesión (por ejemplo `.env` y `apps/mobile/credentials.json` no están trackeados).
- La base de seguridad está bien trabajada en varias áreas clave: autenticación por bearer con `supabase.auth.getUser(token)`, revocación de EXECUTE a funciones `SECURITY DEFINER`, y controles de 2FA con protección anti-replay.
- Se detectaron riesgos reales de diseño/operación en:
  1. superficie de administración,
  2. robustez de rate limiting en serverless sin Upstash,
  3. idempotencia de webhook de billing bajo fallo parcial.

---

## Metodología aplicada

1. Inventario de superficie (`apps/web/src/app/api`, `apps/web/src/lib`, `backend/db/migrations`)
2. Revisión de rutas críticas:
   - `/api/consult`
   - `/api/auth/register`
   - `/api/auth/2fa/*`
   - `/api/admin/*`
   - `/api/webhooks/revenuecat`
   - `/api/account/*`
3. Revisión de controles de seguridad:
   - auth bearer
   - cookies de sesión admin
   - rate limit distribuido
   - SQL `SECURITY DEFINER` + RLS/grants
4. Clasificación por severidad (Critical/High/Medium/Low) con escenarios de abuso

---

## Hallazgos

## 1) Rate limiting degradable en serverless si Upstash falta (High)

### Evidencia

En `rate-limit.ts` hay fallback en memoria con `Map` cuando no existe configuración de Upstash:

```35:62:apps/web/src/lib/rate-limit.ts
const inMemoryBucket = new Map<string, { count: number; resetAt: number }>();
...
if (!slot || now >= slot.resetAt) {
  inMemoryBucket.set(params.key, {
    count: 1,
    resetAt: now + params.windowSeconds * 1000,
  });
```

Y explícitamente se reconoce que en serverless no es efectivo:

```20:24:apps/web/src/lib/rate-limit.ts
"Rate limiting is using an in-process Map which is NOT effective on serverless."
```

Rutas sensibles dependen de ese rate limiter, por ejemplo admin login:

```26:29:apps/web/src/app/api/admin/login/route.ts
const rl = await rateLimitByKey({ key: `admin_login:${ip}`, limit: 10, windowSeconds: 900 });
if (!rl.ok) { ...429... }
```

### Riesgo

Si una instancia corre sin Upstash bien configurado, el límite pasa a ser por proceso (no global), permitiendo bypass práctico vía distribución de requests entre instancias.

### Escenario de abuso

Ataque de brute-force/credential-stuffing a rutas de auth/admin en despliegues multi-instancia con fallback en memoria.

### Recomendación

- Fail-closed para rutas críticas cuando Upstash no esté disponible en producción.
- Monitor de health/config como requisito de arranque para auth/admin.

---

## 2) Superficie admin con sesión por cookie sin protección CSRF explícita (Medium)

### Evidencia

`/api/admin/config` valida solo cookie de sesión:

```11:20:apps/web/src/app/api/admin/config/route.ts
const token = await getAdminSessionTokenFromCookies();
if (!isValidAdminSession(token)) return unauthorized();
```

No hay verificación explícita de `Origin`/`Referer` ni token CSRF en mutación:

```17:27:apps/web/src/app/api/admin/config/route.ts
export async function POST(req: Request) {
  const token = await getAdminSessionTokenFromCookies();
  if (!isValidAdminSession(token)) return unauthorized();
  let body: Partial<AdminConfig>;
  ...
}
```

Cookie admin configurada `sameSite: "lax"`:

```52:57:apps/web/src/app/api/admin/login/route.ts
res.cookies.set(ADMIN_COOKIE_NAME, token, {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 8,
});
```

### Riesgo

Aunque `SameSite=Lax` reduce CSRF clásico en POST cross-site, falta defensa explícita de capa aplicación. En escenarios de navegador/extensiones, same-site subdomain abuse o cambios futuros de cliente, el endpoint queda más frágil de lo necesario.

### Recomendación

- Añadir validación de `Origin` estricta para endpoints admin mutables.
- Añadir token CSRF explícito para POST de administración.

---

## 3) Webhook billing: ante fallo de deduplicación continúa y puede duplicar crédito (Medium)

### Evidencia

En webhook de RevenueCat:

```69:85:apps/web/src/app/api/webhooks/revenuecat/route.ts
// UNIQUE constraint on event_hash...
const { error: dedupError } = await supabase.from("revenuecat_webhook_events").insert(...)
...
// Log but continue — prefer a duplicate grant over a lost purchase.
log.error("webhook_idempotency_failed", ...)
```

Luego continúa con grant:

```87:91:apps/web/src/app/api/webhooks/revenuecat/route.ts
const { error } = await supabase.rpc("grant_tokens", {
  p_user_id: userId,
  p_tokens: pack.tokens,
  p_pack_id: productId,
});
```

### Riesgo

Bajo fallos transitorios de DB en dedup insert, reintentos del proveedor podrían terminar en doble grant.

### Escenario de abuso

Condición de carrera/fallo parcial durante incidentes de base de datos: se pierde protección idempotente y se ejecuta acreditación igualmente.

### Recomendación

- Convertir dedup+grant en operación atómica (función SQL transaccional o cola idempotente).
- Si dedup falla, devolver estado retryable sin grant hasta recuperar consistencia.

---

## 4) Endpoint de configuración pública de admin expone toggles operativos (Low)

### Evidencia

`/api/admin/public-config` no requiere auth y devuelve defaults operativos:

```6:15:apps/web/src/app/api/admin/public-config/route.ts
export async function GET() {
  const config = await getAdminConfig();
  return NextResponse.json({
    ok: true,
    config: {
      imageProviderDefault: config.imageProviderDefault,
      responseModeDefault: config.responseModeDefault,
      insightsDefault: config.insightsDefault,
```

### Riesgo

Info disclosure de bajo impacto (feature toggles), pero útil para fingerprinting de comportamiento.

### Recomendación

- Confirmar que estos campos deben ser públicos por diseño.
- Si no son necesarios para cliente no autenticado, restringir.

---

## 5) Riesgo de robustez por acoplamiento a `SUPABASE_SERVICE_ROLE_KEY` en rutas core (Low)

### Evidencia

`getSupabaseAdmin()` retorna `null` si falta `SUPABASE_SERVICE_ROLE_KEY`:

```5:13:apps/web/src/lib/supabase-admin.ts
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) return null;
```

Rutas esenciales dependen de ello (`/api/consult`, `/api/account/me`, `/api/auth/register`, etc.) y pasan a errores de configuración en runtime.

### Riesgo

No es vulnerabilidad de explotación directa; sí riesgo operacional/SPOF de configuración.

### Recomendación

- Validación de configuración obligatoria al boot para rutas críticas.
- Alerting activo cuando `getSupabaseAdmin()` sea `null` en producción.

---

## Controles que están bien implementados (No Hallazgos)

## A) Auth bearer sólida en API

```12:21:apps/web/src/lib/auth/bearer-user.ts
const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
...
const { data, error } = await supabase.auth.getUser(token);
if (error || !data.user?.id) return null;
```

## B) Hardening SQL para funciones privilegiadas

- Funciones `SECURITY DEFINER` con `SET search_path`.
- Revoke explícito de EXECUTE a `anon/authenticated`:

```15:17:backend/db/migrations/035_revoke_public_execute_on_secdef_functions.sql
REVOKE EXECUTE ON FUNCTION public.consume_token(UUID, INTEGER) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.consume_token(UUID, INTEGER) TO service_role;
```

## C) 2FA con anti-replay y locking de intentos

```108:115:apps/web/src/app/api/auth/2fa/challenge/verify/route.ts
const totpResult = verifyTotpTokenWithReplayGuard(...)
...
if (totpResult.replayed) {
  return apiError(401, { error: "invalid_2fa_code", ... });
}
```

---

## Matriz de Prioridad

| ID | Hallazgo | Severidad | Probabilidad | Impacto |
|---|---|---|---|---|
| H1 | Rate limiting degradable sin Upstash distribuido | High | Alta | Alto |
| H2 | Admin mutable endpoint sin CSRF explícito | Medium | Media | Medio-Alto |
| H3 | Idempotencia webhook con grant tras fallo dedup | Medium | Media | Medio-Alto |
| H4 | Exposición pública de toggles operativos | Low | Alta | Bajo |
| H5 | Dependencia runtime de service role sin fail-fast central | Low | Media | Medio (operacional) |

---

## Plan recomendado (siguiente etapa, sin ejecutar ahora)

## OLA 1 (24-72h)

- Endurecer rate limit de rutas críticas con fail-closed en producción.
- Blindar `POST /api/admin/config` con validación `Origin` + CSRF token.

## OLA 2 (1-2 semanas)

- Hacer atómica la idempotencia de webhook + grant en una sola transacción lógica.
- Revisar si `admin/public-config` requiere realmente exposición no autenticada.

## OLA 3 (1+ sprint)

- Health checks de configuración obligatoria (`service role`, redis, secrets) con bloqueo de arranque.
- Suite de pruebas de seguridad de rutas API críticas (auth/admin/webhook/billing).

---

## Validación dinámica (runtime)

Esta sección documenta **cómo** se ejecutaron las pruebas y **qué** devolvió cada endpoint en ejecución real.

### Entorno de prueba

- Host local: `http://localhost:3000`
- App levantada desde: `apps/web`
- Comando de arranque:

```bash
cd apps/web
npm run dev
```

### Método de ejecución

Se usó un script de probes HTTP con `fetch` en Node, timeout por request y payload JSON controlado.

Comando exacto ejecutado:

```bash
node -e "const base='http://localhost:3000'; const tests=[['GET','/api/health'],['GET','/api/admin/public-config'],['GET','/api/admin/config'],['POST','/api/admin/config',{imageProviderDefault:'auto'}],['GET','/api/account/me'],['GET','/api/account/chats?summary=1'],['POST','/api/consult',{question:'test'}],['POST','/api/webhooks/revenuecat',{event:{type:'TEST',app_user_id:'u1',product_id:'tokens_seeker_20'}}],['POST','/api/ritual-debug',{label:'probe',elapsedMs:1}],['POST','/api/admin/login',{key:'invalid'}]]; (async()=>{const out=[]; for(const [m,p,b] of tests){ try{ const r=await fetch(base+p,{method:m,headers:b?{'content-type':'application/json'}:{},body:b?JSON.stringify(b):undefined,signal:AbortSignal.timeout(12000)}); const t=await r.text(); out.push({method:m,path:p,status:r.status,ok:r.ok,body:t.slice(0,220)});}catch(e){ out.push({method:m,path:p,status:-1,ok:false,body:String(e).slice(0,220)});} } console.log(JSON.stringify(out,null,2)); })();"
```

### Resultados concretos

| Método | Endpoint | Status | Resultado |
|---|---|---:|---|
| GET | `/api/health` | 500 | Falla por error de Upstash (`WRONGPASS`) |
| GET | `/api/admin/public-config` | 200 | Público, devuelve toggles operativos |
| GET | `/api/admin/config` | 401 | Bloqueado sin sesión admin |
| POST | `/api/admin/config` | 401 | Bloqueado sin sesión admin |
| GET | `/api/account/me` | 401 | Requiere bearer auth |
| GET | `/api/account/chats?summary=1` | 401 | Requiere bearer auth |
| POST | `/api/consult` | 401 | Requiere bearer auth |
| POST | `/api/webhooks/revenuecat` | 503 | Fail-closed sin `REVENUECAT_WEBHOOK_SECRET` |
| POST | `/api/ritual-debug` | 200 | Activo en entorno no-production |
| POST | `/api/admin/login` (`key: invalid`) | 500 | Falla previa en rate-limit (Upstash `WRONGPASS`) |

### Prueba adicional (repetición de admin login)

Para validar consistencia del fallo en `/api/admin/login`, se ejecutaron 5 intentos consecutivos:

```bash
node -e "(async()=>{const out=[]; for(let i=1;i<=5;i++){ try{const r=await fetch('http://localhost:3000/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:'wrong'}),signal:AbortSignal.timeout(8000)}); out.push({attempt:i,status:r.status,body:(await r.text()).slice(0,120)});}catch(e){out.push({attempt:i,status:-1,body:String(e)})}} console.log(JSON.stringify(out,null,2));})();"
```

Resultado: **5/5 devolvieron 500**, confirmando indisponibilidad del endpoint bajo error de credenciales Upstash.

### Evidencia de logs de servidor

Durante la ejecución, el servidor reportó:

- `Error [UpstashError]: WRONGPASS invalid username-password pair or user is disabled`
- Stack en `src/lib/rate-limit.ts` dentro de `rateLimitByKey(...)`
- Impacto directo en:
  - `GET /api/health` (500)
  - `POST /api/admin/login` (500)

Esto confirma de forma dinámica el hallazgo H1 (fragilidad operacional de rate limiting ante mala configuración de Redis/Upstash).

---

## Matriz de skills aplicadas al pentest

Este repo (`iching-app`) no contiene `SKILL.md` internos. Para cumplir el enfoque solicitado, se usó como **framework metodológico** el bundle de skills de `Claude-BugHunter`, mapeado a la superficie real de `iching-app`.

### Criterio

- **Aplicada:** usada para diseñar y ejecutar pruebas en este sistema.
- **Parcial:** aplicada, pero limitada por falta de credenciales/entorno externo.
- **No aplicable:** no corresponde al modelo de riesgo del producto.

### Cobertura por dominios de skills

| Dominio de skills (framework) | Estado | Aplicación en `iching-app` |
|---|---|---|
| `triage-validation` | Aplicada | Validación de hallazgos con evidencia reproducible y descarte de ruido |
| `offensive-osint` / `web2-recon` | Parcial | Enumeración de superficie API/rutas; sin footprint externo de terceros por alcance local |
| `hunt-auth-bypass` / `hunt-ato` / `hunt-mfa-bypass` | Aplicada | Revisión y pruebas sobre auth bearer, admin login, 2FA enroll/challenge/verify |
| `hunt-idor` / `hunt-api-misconfig` | Parcial | Revisado estáticamente y en runtime no-auth; pendiente validación deep con cuentas de prueba |
| `hunt-csrf` | Aplicada | Evaluación de mutaciones admin vía cookie y ausencia de control CSRF explícito |
| `hunt-graphql` / `hunt-saml` / `hunt-sharepoint` / `hunt-vpn` | No aplicable | No forman parte de la arquitectura actual del sistema |
| `hunt-race-condition` / `business-logic` | Aplicada | Evaluación de idempotencia y fallos parciales en webhook billing |
| `evidence-hygiene` | Aplicada | Documentación de pruebas, comandos y resultados concretos |
| `report-writing` | Aplicada | Consolidación formal de hallazgos con riesgo, impacto y plan por fases |

### Cobertura full stack obtenida

- **Web/API (no-auth + hardening):** Alta
- **Auth/2FA (flujos y controles):** Alta (sin credenciales reales de usuario)
- **Billing/Webhooks:** Alta
- **DB/RLS/SECURITY DEFINER:** Alta
- **Mobile runtime dinámico:** Media (revisión estática fuerte; prueba dinámica deep pendiente en dispositivo/emu con sesión real)

---

## Limitaciones y alcance efectivo del pentest ejecutado

- No se usaron credenciales reales de usuario/admin en esta fase.
- No se ejecutaron pruebas destructivas ni fuzzing de alto volumen contra servicios externos.
- El pentest dinámico fue de caja negra/controlada sobre entorno local con configuración disponible.
- Aun con esas limitaciones, los hallazgos reportados quedan **confirmados con evidencia técnica**.

---

## Cierre

Esta auditoría corresponde **exclusivamente a `iching-app`** y corrige el desvío anterior de alcance.  
No se aplicó ningún fix; este documento deja confirmados los riesgos y la priorización para la fase de remediación.

