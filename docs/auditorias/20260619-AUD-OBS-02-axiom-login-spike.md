# Auditoría: Spike de 96+ requests a /login en producción
**Código:** `20260619-AUD-OBS-02 axiom-login-spike` · **Familia:** OBS · **Estado:** closed


**Fecha del incidente:** 2026-06-19 ~08:05–08:10 EDT (12:05–12:10 UTC)  
**Dataset Axiom:** `iching-app-main`  
**Release en producción:** `6210f52` (4.1.5/vc54, deploy `dpl_9uShzGgjD5wT4ekSGu6tJPHaL6D1`)  
**Autor:** Agente automatizado  
**Estado:** Diagnóstico completo — sin impacto en usuarios reales

---

## Resumen ejecutivo

Los **103 requests a `/login`** observados en Axiom durante la ventana de 6 horas **no corresponden a 96 inicios de sesión de usuarios reales**. El 87% del tráfico proviene de IPs del rango `66.249.84.0/24` (Google LLC — Google Web Rendering Service / Googlebot), y otro 12% de una segunda IP con comportamiento de crawler. **No hay evidencia de un incidente de seguridad ni de un loop de login en la app.**

---

## 1. Desglose del tráfico a `/login`

### 1.1 Por origen IP

| Rango IP | Requests | Propietario | User-Agent | Diagnóstico |
|----------|----------|-------------|------------|-------------|
| `66.249.84.32–38` | **90** (87%) | Google LLC (AS15169) | `OnePlus8Pro Build/QKR1.191246.002; wv` | **Google WRS** renderizando con UA del dispositivo del Sentry |
| `72.10.128.4` | **6** (en esta ventana) | **EBOX (AS1403), ISP residencial — Montreal, QC, Canadá** | `SM-S918U1; wv`, Android 16, Chrome/149 | **Usuario real autenticado** — no es crawler (ver corrección abajo) |
| `100.57.4.5` | **1** (1%) | — | `HeadlessChrome/138.0.7204.23` | Vercel preview bot o test |

> **IMPORTANTE:** El rango `66.249.84.0/24` es **propiedad verificada de Google** y se usa para Googlebot y el Google Web Rendering Service (WRS). El UA que envía coincide con el dispositivo del error Sentry (OnePlus8Pro/Android 11/WebView 90) porque WRS replica las condiciones del dispositivo que originó la visita.

> **CORRECCIÓN (Claude, verificado en vivo contra Axiom, dataset `iching-app-main`, vía API REST con `AXIOM_PAT`):** la atribución original de `72.10.128.4` como "segundo dispositivo/crawler" es incorrecta. WHOIS confirma que es un rango residencial de EBOX (Montreal, Canadá), no un datacenter ni rango de bot conocido. La traza completa de esta IP el 2026-06-19 muestra navegación humana normal durante todo el día: páginas de marketing, `/notes`, `/terms`, `/guia`, `/faqs`, `/feedback`, llamadas autenticadas a `/api/account/*` (incluye `chats`, `me`, `bootstrap`, `sessions-only`), `/api/integrity/challenge` + `/api/integrity/client-event` (Play Integrity, normal), y recorrido del catálogo `/library/1` a `/library/64`. La secuencia exacta dentro de la ventana del spike (12:09:38–12:11:30 UTC) es: `GET /api/account/me` → 9× `GET /api/account/chats` (polling normal, ~5-6s de intervalo) → `GET /api/account/me` → `POST /api/auth/sign-out` → `GET /login`. Es decir: el usuario cerró sesión y la app lo redirigió a `/login` — comportamiento esperado, no un patrón de bot ni parte real del spike de Google. El recuento de "12%" del resumen original no debe leerse como tráfico anómalo.

### 1.2 IPs individuales de Google

| IP | Requests |
|----|----------|
| `66.249.84.36` | 19 |
| `66.249.84.35` | 19 |
| `66.249.84.34` | 19 |
| `66.249.84.32` | 10 |
| `66.249.84.33` | 9 |
| `66.249.84.38` | 8 |
| `66.249.84.37` | 6 |
| **Total Google** | **90** |

### 1.3 Distribución temporal (por minuto, UTC)

```
10:11  ██               (2)   ← 72.10.128.4
10:12  █                (1)
10:13  █                (1)   ← 100.57.4.5
11:26  █                (1)   ← 72.10.128.4
11:27  ██               (2)
12:01  █                (1)
12:02  ████             (4)   ← 72.10.128.4
12:06  ███████████████  (15)  ← Google WRS inicio
12:07  ████████████████████████████ (28)  ← pico
12:08  █████████████████████████ (25)
12:09  ██████████████████████ (22)
12:11  █                (1)   ← 72.10.128.4
```

> **NOTA:** El spike se concentra en **3.5 minutos** (12:06–12:09 UTC) con 90 requests de 7 IPs de Google, a un ritmo de ~26 req/min. Es un patrón típico de crawl burst de Google WRS.

---

## 2. Secuencia completa del crawl de Google

Google WRS primero carga la landing (`/`) y assets de marca, luego martillea `/login`:

```
12:05:19  GET /                          ← landing page
12:05:24  GET /brand/logo.png            ← assets estáticos
12:05:24  GET /brand/mode-bones-symbol.png
12:05:24  GET /brand/mode-iching-coin.png
12:06:24  GET /login                     ← inicio del spike
12:06:27  GET /login                     
12:06:30  GET /login                     ← ~3s entre requests
...       (90 requests en 3.5 minutos)
12:09:57  GET /login                     ← fin del spike
```

---

## 3. Correlación con error Sentry

El error Sentry reportado (`Router action dispatched before initialization`, Issue 7562273839) se disparó a las **12:11:14 UTC** — **2 minutos después** del fin del spike de Google. 

### Hipótesis de correlación

El error Sentry viene de un **usuario real** (o de Google WRS ejecutando JS del WebView). La cadena causal:

1. Google WRS renderiza `/login` ~90 veces con el UA del OnePlus8Pro
2. En algún momento, WRS o el usuario real intenta navegar vía `window.__rnNavigateTo`
3. El App Router de Next.js 15 no ha completado hydration → `Router action dispatched before initialization`

> **ADVERTENCIA:** El error Sentry **puede no ser de un usuario real**. El UA del Sentry (`Chrome Mobile WebView 90.0.4430`) coincide exactamente con el UA de los requests de Google WRS. Es posible que Google WRS ejecutó el INJECTED_JS y disparó `__rnNavigateTo` durante el rendering.

### Bug subyacente: Race en `__rnNavigateTo`

Independientemente del origen, el bug es real:

- `__rnNavigateTo` (línea 935, `apps/mobile/app/index.tsx`) usa `window.next.router.push()` (API interna de Pages Router)
- En App Router (Next.js 15.5.19), `window.next.router` existe pero requiere inicialización completa
- El `catch` hace fallback a `window.location.href` (funciona, pero el error ya se reportó a Sentry)

---

## 4. Distribución completa de rutas (ventana analizada)

| Ruta | Requests | Nota |
|------|----------|------|
| (null/middleware) | 126 | Middleware edge sin ruta explícita |
| `/login` | 103 | **87% Google WRS** |
| `/api/integrity/client-event` | 39 | Bridge Play Integrity (normal) |
| `/` | 27 | Landing + Vercel favicon bots |
| `/api/account/chats` | 20 | Usuarios reales |
| `/privacy` | 14 | SEO crawlers |
| `/brand/logo.png` | 14 | Assets estáticos |
| `/api/integrity/challenge` | 13 | Play Integrity (normal) |
| `/brand/mode-*` | 22 | Assets estáticos |
| `/api/account/me` | 7 | Usuarios reales |
| `/notes` | 6 | — |
| `/robots.txt` | 8 | Crawlers (Googlebot, AhrefsBot) |
| `/api/account/bootstrap` | 4 | Usuarios reales |
| `/api/auth/sign-out` | 3 | Sign-outs (¿automáticos?) |
| `/wp-admin/install.php` | 4 | **WordPress probing** ⚠️ |
| `/xmlrpc.php` | 1 | **WordPress probing** ⚠️ |

---

## 5. Hallazgos secundarios de seguridad

### 5.1 WordPress probing

Se detectaron **5 requests** a paths de WordPress:

```
07:11:52  GET /wp-admin/install.php  | 104.23.217.35  | UA: http://theoriginaliching.com/wp-admin/install.php?step=1
08:54:34  GET /wp-admin/install.php  | 104.23.223.6   | UA: (mismo patrón)
10:31:43  GET /wp-admin/install.php  | 162.158.94.94  | UA: (mismo patrón)
10:57:05  POST /xmlrpc.php          | 185.159.162.16 | UA: Opera/Android
12:08:29  GET /wp-admin/install.php  | 162.158.110.54 | UA: (mismo patrón)
```

> **PRECAUCIÓN:** Los requests a `/wp-admin/install.php` tienen como User-Agent la **propia URL del destino**, lo cual es un patrón común de scanners automatizados buscando instalaciones WordPress vulnerables. Las IPs `104.23.*` y `162.158.*` pertenecen a Cloudflare (probablemente proxied). La app responde 200 (Next.js catch-all) pero no expone nada vulnerable.

**Mitigación recomendada:** Añadir middleware que retorne 404 para paths de WordPress conocidos (`/wp-admin/*`, `/wp-login.php`, `/xmlrpc.php`, `/wp-content/*`) para reducir ruido y evitar indexación accidental.

### 5.2 HeadlessChrome request

```
10:13:51  GET /login | 100.57.4.5 | HeadlessChrome/138.0.7204.23
```

Un request aislado de Chrome headless — probablemente un bot de Vercel, Lighthouse audit, o crawler comercial. Sin impacto.

---

## 6. Conclusiones

| Pregunta | Respuesta |
|----------|-----------|
| ¿Hay 96 logins reales? | **No.** 90 son Google WRS; el resto es 1 usuario real (EBOX, Montreal) cerrando sesión normalmente + 1 HeadlessChrome aislado |
| ¿Es un ataque? | **No.** Es crawling legítimo de Google |
| ¿Hay impacto en usuarios? | **No.** Los requests son GET 200 de 0-3ms, no generan carga |
| ¿El error Sentry es de un usuario real? | **Probablemente no** — el UA coincide con Google WRS |
| ¿El bug `__rnNavigateTo` es real? | **Sí** — race condition que afecta a cualquier WebView lento |
| ¿Hay probing de seguridad? | **Sí** — WordPress scanning menor, sin riesgo |

---

## 7. Acciones recomendadas

| Prioridad | Acción | Detalle |
|-----------|--------|---------|
| P2 | Fix `__rnNavigateTo` race | ✅ Aplicado — ver `20260619-AUD-MOB-NAV-01-router-navigate-race.md` |
| P3 | Bloquear WordPress paths | ❌ Pendiente — Middleware 404 para `/wp-admin/*`, `/xmlrpc.php` |
| P4 | Rate-limit `/login` por IP | ❌ Pendiente — verificado contra `apps/web/src/middleware.ts`: el rate limiting existente (`rateLimitByKey`) solo cubre `/api/library/*`; `/login` (page render) no tiene límite. No es redundante con el rate limiting ya documentado en `CLAUDE.md` (ese es para endpoints de auth/2FA, no para el render de la página) |
| P4 | Monitorear recurrencia | Verificar si el crawl burst de Google se repite y a qué frecuencia |

> **Nota de verificación (Claude, mismo día — actualizada):** Auditoría re-verificada en dos pasadas. Primera pasada: contra el código real (sin acceso a Axiom). Segunda pasada: con acceso directo a Axiom vía API REST (`AXIOM_PAT` + `AXIOM_ORG_ID` en `.env`, dataset `iching-app-main`) — se confirmaron los 90 requests de Google WRS (mismas 7 IPs `66.249.84.32–38`, mismo UA, GET 200 0-3ms) y se corrigió la atribución de `72.10.128.4` (ver nota en sección 1.1: es un usuario real, no un segundo crawler). El resto de hallazgos (WordPress probing, ausencia de rate-limit en `/login`) no requirió corrección.

---

## Apéndice: Queries APL usadas

```apl
-- Total /login requests
['iching-app-main']
| where ['vercel.route'] == "/login"
| summarize count=count() by ['request.ip']
| order by count desc

-- Full session from Google IPs
['iching-app-main']
| where ['request.ip'] startswith "66.249.84"
| order by _time asc

-- Route distribution
['iching-app-main']
| summarize count=count() by ['vercel.route']
| order by count desc
```
