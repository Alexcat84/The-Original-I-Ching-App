# Auditoría general de código — Pre-producción
**Código:** `20260616-AUD-PRD-02 general-pre-production` · **Familia:** PRD · **Estado:** closed


**Proyecto:** The Original I Ching App
**Fecha:** 2026-06-16
**HEAD auditado:** `970cf8e` (fix(gates+prompt): code-review Fase 2 — INTERPRETED_LINES alignment + H3/H5 gate fixes)
**Contexto:** lanzamiento a producción previsto en los próximos días. Prompt ya auditado y remediado (Fases 1/2 + barrido QA 80/80). Esta auditoría cubre el resto del código.

---

## Alcance y método

Auditado en profundidad, leyendo el código actual en `main`:

- Caminos financieros (consumo/refund/retry de tokens).
- Seguridad de la superficie HTTP (auth de los 30 endpoints, secretos, CSRF, SSRF, rate-limiting, validación de input).
- Confiabilidad del path de consulta (streaming, watchdog, retry de gates, cadena de fallback, manejo de errores).
- Integración de los 4 cambios de gates/prompt de esta sesión.
- Configuración y pipeline de build/deploy.

**No cubierto exhaustivamente** (y por qué): revisión línea por línea de cada archivo del monorepo; internals de la app móvil (shell nativo, puente IAP) más allá de su contrato con el backend; auditoría de dependencias/supply-chain (requiere `npm audit` con red, listado abajo como tarea de lanzamiento). Esta auditoría prioriza riesgo de lanzamiento, no completitud absoluta.

**Veredicto:** **Apto para lanzar, con condiciones de configuración.** No se hallaron bloqueadores de código. Los items de lanzamiento son de configuración/operación, no de corrección de bugs.

---

## 1. Los 4 cambios de esta sesión — verificados

| # | Cambio | Estado |
|---|--------|--------|
| 1 | `INTERPRETED_LINES (AUTHORITATIVE)` + `INTERPRETATION_LINE_COUNT` en scroll (L297) y master (L388); data block L430; firewall de labels internos L496 incluye `INTERPRETED_LINES`/`OMITTED_CHANGING_POSITIONS` | ✅ Sólido. Resuelve P2-5 nombrando el campo autoritativo. **Residual menor:** L388 mezcla "INTERPRETED_LINES" (nuevo) con "LINE TEXTS" (viejo) en la misma instrucción. No es crítico (el marco AUTHORITATIVE domina) pero conviene unificar nombres en una pasada futura. |
| 2 | H5 `extractLinesSectionBody(text) ?? text` (L180), consistente con H3 (L115) | ✅ Fabricación QIAN/KUN detectable en los 11 locales (sin falso-pass por sección no hallada). |
| 3 | Terminador de `lineEntryPattern` (L87): exige `(`/`:`/`)`/`]`/`,`/`.`, no espacio desnudo | ✅ "Line 1 is not interpreted" en prosa ya no dispara H3 falso. Mantiene detección de entradas estructuradas reales. |
| 4 | Retry de H5 inyecta `⚠️ MANDATORY SPECIAL YAO` verbatim (apply-interpretation-gates.ts L32/L42/L131/L140) | ✅ Cierra el hueco de reintento para 用九/用六. |

Limitación heredada conocida (no introducida por estos cambios): la detección de fabricación en ja/ko/ar/hi sigue siendo best-effort por numerales no-arábigos (第二爻). El fallback garantiza que H3/H5 **corren** en esos idiomas; el matching fino es follow-up. No bloquea (producción primaria en español/inglés/latinos).

---

## 2. Seguridad — sólida

| Área | Hallazgo | Estado |
|------|----------|--------|
| Auth de endpoints | Los 30 endpoints revisados: protegidos salvo los públicos por diseño | ✅ |
| `ritual-debug` | Devuelve **404 en producción** (`NODE_ENV==="production"`); no loguea payload del usuario; label sanitizado con CRLF removido (anti log-injection) | ✅ |
| `admin/config` | Sesión admin (`isValidAdminSession`) en GET; POST además exige same-origin (defensa CSRF) | ✅ |
| `webhooks/revenuecat` | Firma verificada con `timingSafeEqual`, idempotente (auditoría previa) | ✅ |
| `image-proxy` | Defendido contra SSRF (auditoría previa) | ✅ |
| Secretos | Sin secretos commiteados (escaneo de claves Anthropic/Stripe/Supabase/AWS/PEM) | ✅ |
| Rate-limiting | Presente en login, register, consult, feedback, 2FA email, integrity, display-name | ✅ |
| Validación input | consult: `MAX_CONSULT_QUESTION_CHARS=4000`, `question_too_long`, `invalid_json` | ✅ |
| 2FA | Endpoints de 2FA por email presentes (enroll/verify/disable/challenge) | ✅ |
| RLS / admin | RLS en ~20 tablas; admin con bcrypt (auditoría previa) | ✅ |

Endpoints públicos por diseño (correctos): `admin/logout`, `auth/register`, `auth/sign-out`, `feedback`, `health`, `image-proxy`, `ritual-debug` (404 en prod), `webhooks/revenuecat` (firmado).

---

## 3. Integridad financiera — bien diseñada

El path de tokens es el más cuidado del sistema:

- **Consumo atómico** una sola vez (`consumeToken`, route L861). Los reintentos de gates ocurren **después** del consumo, dentro de la generación, así que **no hay doble cobro**.
- **Refund sofisticado** (`attemptRefund`, helper CRIT-02):
  - **Pre-check §2.5:** antes de refundar, verifica que la consulta **no exista** en DB. Cubre el "éxito ambiguo" (si el upsert sí persistió, la lectura es recuperable por hydration — no se refunda).
  - `streamingStarted` → `persist_failed_no_refund` (el usuario ya recibió valor).
  - Supabase caído (verificación imposible) → **sesga a refundar** (un refund falso es más barato que un cobro fallido).
  - `refund_failed` → `Sentry.captureException` para compensación manual vía `grant_tokens`. Nunca se traga el error.

**Comportamiento aceptado conocido (decisión de producto, no bug):** si todos los proveedores fallan y cae a fallback offline que persiste una interpretación degradada, la consulta existe → no se refunda → **token consumido** (Issue 1, Opción B). Documentado; consciente.

---

## 4. Confiabilidad — robusta

| Área | Estado |
|------|--------|
| `runtime="nodejs"`, `maxDuration=300` en consult | ✅ (acomoda M3 largos) |
| Streaming SSE: heartbeat 25s, watchdog `AbortController`, `attemptThreadRecovery` desde EOF y catch externo | ✅ (trabajo de esta sesión + previo) |
| TDZ fix + `Sentry.captureException` en catch de streaming | ✅ (confirmado disparando en prod vía Axiom) |
| Cadena de fallback: fallo de quality-gate NO se trata como error de API → continúa OpenRouter → Groq → offline | ✅ (Issue 1) |
| Retry de gates (hasta 2) con recordatorios de citación/yao, posterior al consumo | ✅ |
| `InterpretationQualityError` → Sentry warning, no rompe la cadena | ✅ |

---

## 5. Gates/Prompt — validado por el barrido

- 80/80 PASS estructural tras corregir 10 falsos negativos de H1 (fingerprint multilínea/CJK). Fix de H1 principista (primera línea + recorte CJK + 20 chars distintivos), no aflojado.
- THREE_MIDDLE y FOUR_LOWEST_STABLE (casos de máximo riesgo) verificados: regla explicada al usuario, línea correcta citada, **sin fabricación**. La remediación de Fase 1/2 funciona.
- 4.6 validado: ~18% más rápido, ~3-7% más conciso, 0 warns, sin truncamiento. **Recomendado para producción.**

---

## 6. Configuración y build

- **`dist` gitignored** (.gitignore:7). El `prebuild` de `apps/web` ejecuta `npm run build --prefix ../../backend/claude`. **En Vercel, cada deploy reconstruye `dist`** — el riesgo de "stale dist" aplica **solo a QA local** (donde hay que rebuildear a mano antes de `pnpm qa:mutation-output`), **no a producción**.
- **Modelo:** el default de código es `claude-sonnet-4-5-20250929` (anthropic-model-id.ts L8). Para lanzar con 4.6 (validado), hay que setear la variable de entorno — no requiere cambio de código.

---

## ✅ CHECKLIST DE LANZAMIENTO

Items de **configuración/operación**, no de código. Verificar antes de abrir producción:

1. **`ANTHROPIC_MODEL=claude-sonnet-4-6`** en el entorno de producción (Vercel). 4.6 está validado; sin esta variable, prod corre 4.5.
2. **Migraciones aplicadas en el Supabase de producción** — confirmar que el esquema (incluyendo `token_refund_log` / `072_refund_token.sql` y el resto) está aplicado en el proyecto prod, no solo en dev/staging.
3. **RevenueCat en modo producción** — API keys de producción, webhook apuntando al endpoint prod, secret de firma configurado.
4. **Variables de entorno completas en Vercel prod:** `ANTHROPIC_API_KEY`, claves Supabase (URL + service role + anon), Upstash (rate-limiting), Sentry DSN, Axiom token, SMTP/Brevo, ImprovMX, claves de proveedores de imagen (Together / Fireworks si migras).
5. **`npm audit`** (o `pnpm audit`) con red disponible — no pude correrlo offline. Revisar vulnerabilidades de dependencias antes de exponer públicamente.
6. **Smoke test post-deploy en prod:** una consulta real de cada tipo crítico (M3, QIAN/KUN, una regla de mutación de 4+ líneas) verificando que el modelo es 4.6 y los gates pasan.
7. **(Opcional, recomendado) BRIEF de logging pendiente** — el `BRIEF_loggings-faltantes.md` y el retry 5xx de Together AI siguen sin aplicar. No bloquean el lanzamiento, pero mejoran la observabilidad desde el día 1.

---

## 7. Los 6 hallazgos diferidos — triaje de riesgo

| Hallazgo | Tipo | Riesgo para lanzar | Recomendación |
|----------|------|--------------------|---------------|
| Sentry duplicates | Monitoreo | Bajo (ruido) | Limpiar post-launch |
| omittedPositions duplication | Refactor | Bajo | Post-launch |
| fingerprint duplication | Refactor | Bajo | Post-launch |
| stale dist | Proceso | **Nulo en prod** (prebuild reconstruye); solo afecta QA local | Documentar para QA |
| STRUCTURAL FACTS label | Menor | Bajo | Cosmético |
| direct commits to main | **Proceso** | Medio | Ver abajo |

**Sobre "direct commits to main":** con Vercel auto-deploy, un commit roto a `main` va directo a producción sin gate de CI ni revisión. Para un dev solo en pre-lanzamiento es manejable, pero es el riesgo de proceso más real de la lista. Recomendación mínima de bajo costo: antes de `push origin main`, correr el build + el barrido QA localmente (o usar el deploy de staging como verificación antes de promover). No es bloqueador, pero un commit malo el día del lanzamiento es el escenario que más duele.

---

## Resumen ejecutivo

El código está en buen estado para producción. La seguridad es sólida (auth completa, sin secretos, rate-limiting, CSRF/SSRF defendidos, debug 404 en prod), el path financiero es de los mejor diseñados que he auditado (refund con pre-check de persistencia y sesgo pro-usuario), y la confiabilidad del path de consulta es robusta tras el trabajo de streaming/watchdog/gates de esta sesión. Los 4 cambios de gates/prompt están verificados y el barrido QA respalda adoptar 4.6.

**No hay bloqueadores de código.** Lo que queda son 7 items de configuración/operación (checklist arriba), de los cuales los críticos son: setear el modelo 4.6, confirmar migraciones en prod, y RevenueCat en modo producción. Atiende esos tres y el smoke test post-deploy, y estás listo.
