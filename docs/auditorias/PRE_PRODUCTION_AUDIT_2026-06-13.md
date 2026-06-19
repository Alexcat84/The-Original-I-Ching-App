# Auditoría Pre-Producción — The Original I Ching App

## Estado · Lifecycle

| Campo | Valor |
|---|---|
| **Fecha** | 2026-06-13 |
| **Commit auditado** | `11d568a` — Merge staging into main (fix/perf-b3) |
| **Auditor** | Claude Opus 4.8 |
| **Alcance** | Límite de confianza servidor: rutas API, auth/créditos/pagos, migraciones SQL, fases de performance 1–3 |
| **Objetivo** | Veredicto de preparación para lanzamiento en vivo (Google Play + web) |
| **Veredicto** | ✅ APROBADO para producción (condicionado al checklist de operación §7) |
| **SEC-01 implementado** | `e6d425f` — `fix/sec-01-test-webhook` → staging → main (`2082871`) |
| **Commit final auditoría** | `2082871` |
| **Commit final sesión 2026-06-13** | `79f5a46` — hydration gate + attestKey + 3.5.7/vc55 |
| **Commit TDZ P0 fix** | `fix/tdz-image-prompt-sentry` — TDZ imagePrompt + Sentry en stream_ritual |
| **Estado post-remediación** | ✅ TODOS LOS HALLAZGOS CERRADOS + 3 post-audit fixes aplicados |

---

## 1. Resumen ejecutivo

El código del lado servidor está **listo para producción** en las dimensiones auditadas: seguridad del camino del dinero, autenticación, aislamiento de datos, inyección, abuso e higiene de secretos. La postura de seguridad está por encima del promedio para una app en esta etapa.

Los tres bloqueantes de performance identificados en la auditoría incremental (B1, B2, B3) están **resueltos y verificados en código**. Quedan dos hallazgos menores (uno con corrección ya provista e implementada) y un punto de diseño operativo ya mitigado.

El veredicto "listo para miles en vivo" se completa al confirmar el checklist de operación de §7.

---

## 2. Metodología

Revisión estática priorizada por riesgo sobre el límite de confianza servidor. Se inspeccionaron directamente: el webhook de pagos, el helper de autenticación, las funciones SQL de la economía de tokens, las migraciones de RLS y revocación de privilegios, los endpoints de administración, el proxy de imágenes, el parsing de entrada y la configuración de seguridad del repositorio.

**No cubierto** línea por línea: `page.tsx` (~6.900 líneas), lógica completa de interpretación/casting del backend, ejecución del build o suite de pruebas.

**Criterios:** OWASP Top 10 (auth, inyección, SSRF, exposición de datos), principio de mínimo privilegio sobre Supabase/PostgREST, idempotencia/atomicidad en operaciones de dinero.

---

## 3. Tabla de hallazgos

| ID | Área | Severidad | Estado |
|---|---|---|---|
| PERF-B2 | Proveedores de imagen lanzan a nivel de red → pérdida de token | Alta | ✅ Resuelto `80697a6` |
| PERF-B1 | Promise de imagen paralela sin handler → `unhandledRejection` | Media | ✅ Resuelto `80697a6` |
| PERF-B3 | `.catch(()=>undefined)` → `undefined` aguas abajo → crash match path | Media | ✅ Resuelto `11d568a` |
| SEC-01 | Evento `TEST` del webhook acredita tokens reales | Baja | ✅ Implementado `fix/sec-01-test-webhook` |
| SEC-02 | Play Integrity es opcional (header-dependiente) | Info | ✅ Por diseño — ver §5.2 |
| OPS-01 | Sin refund automático si persist falla tras iniciar streaming | Baja | ✅ Mitigado — ver §5.3 |

---

## 4. Controles verificados (conformes)

### 4.1 Camino del dinero — Fuerte
- **Verificación webhook RevenueCat:** comparación en tiempo constante (`sha256` + `timingSafeEqual`). Fail-closed (503) si el secreto no está configurado.
- **Idempotencia:** otorgamiento vía `grant_tokens_idempotent` con dedup por `event_hash` en una sola transacción — un reintento nunca duplica el crédito.
- **Consumo atómico:** `UPDATE public.query_credits SET ... WHERE credits_total >= tokens_to_consume`, devuelve −1 si insuficiente. Sin race condition ni saldo negativo.
- **Orden correcto:** cobra-primero / refund-en-fallo, con máquina de estados `refundCtx` (consumed/persisted/streamingStarted) y pre-check anti-doble-refund.

### 4.2 Autenticación — Fuerte
- `getAuthenticatedUser` valida el JWT contra Supabase server-side; `userId` derivado del token verificado, no spoofable por el cliente. Exige `email_confirmed_at`.
- Cache de validación en-proceso de 60s con salvedad documentada (operaciones sensibles evitan el cache).

### 4.3 Aislamiento de datos (RLS) — Completo
- Las 20 tablas creadas tienen Row Level Security habilitada. No se encontró ninguna tabla sensible sin RLS.
- Migración 035 **revoca EXECUTE** de `consume_token`, `grant_tokens`, `init_free_user` y triggers a `anon`/`authenticated` — solo `service_role` puede llamarlas. El anon key público no puede modificar balances vía PostgREST.

### 4.4 Administración — Fuerte
- Login con `bcrypt.compare` (o timing-safe como fallback), rate-limit 10/15 min por IP, fail-closed si no configurado, cookie `httpOnly` + `secure` + `sameSite=lax` con expiración de 8h.

### 4.5 Inyección / XSS — Sin superficie
- Cero interpolación de strings en SQL; todo acceso vía `.rpc()`/`.from()` parametrizado.
- Único `dangerouslySetInnerHTML`: script de tema con `nonce` de CSP, no controlado por usuario.
- CSP nonce-based en `next.config.mjs` + middleware.

### 4.6 SSRF (image-proxy) — Bien defendido
- Allowlist a `*.r2.dev`/dominio R2 configurado, solo HTTPS, `redirect: "manual"` con rechazo de 3xx. Nombre de archivo sanitizado contra header injection.

### 4.7 Abuso e higiene — Conforme
- Rate-limit en `/consult` por IP **y** por usuario, fail-closed si Upstash no responde.
- Validación de entrada: pregunta limitada a 4.000 caracteres.
- `ritual-debug` devuelve 404 en producción.
- Sin secretos hardcodeados ni `.env` commiteados.
- `.trivyignore` limitado a CVEs de `tar` del toolchain de Expo (build-time, fuera del runtime), con justificación y fecha de revisión.

---

## 5. Hallazgos — Detalle y resolución

### 5.1 SEC-01 — Evento `TEST` acredita tokens reales (Baja) ✅ IMPLEMENTADO

**Hallazgo:** `PURCHASE_EVENTS` incluía `"TEST"`, de modo que un evento TEST con un `product_id` de pack real acreditaba tokens reales. Mitigado por el secreto del webhook (solo el operador puede dispararlo), pero no es el control correcto para separar testing de producción.

**Implementación** (`fix/sec-01-test-webhook`):
- `"TEST"` separado de `REAL_PURCHASE_EVENTS = new Set(["NON_RENEWING_PURCHASE"])`
- Gate por `REVENUECAT_ALLOW_TEST_EVENTS` (default OFF)
- Cuando OFF: devuelve `200 { skipped: "test_event_disabled_in_production" }` — evita reintentos de RevenueCat
- Cuando ON (staging/preview): flujo completo como antes

**Variable de entorno requerida:**
- Producción: `REVENUECAT_ALLOW_TEST_EVENTS=false` (o no establecida) — comportamiento seguro por defecto
- Staging: `REVENUECAT_ALLOW_TEST_EVENTS=true` para pruebas de integración

**Estado de configuración:**
- `.env` local: `REVENUECAT_ALLOW_TEST_EVENTS=true` (staging) — con comentario explícito ⚠️ SOLO STAGING
- Vercel producción: `false` — confirmado por el owner
- Vercel staging: `true` — confirmado por el owner

### 5.2 SEC-02 — Play Integrity opcional (Info / Por diseño)

**Hallazgo:** la verificación de integridad corre solo si el header `x-integrity-token` está presente.

**Resolución por diseño:** Play Integrity es prioritario únicamente en la versión Android. La versión web usa Stripe + Turnstile y no transporta ese header. Dado que las consultas web ya se permiten sin integridad, quitar el header no otorga escalada de privilegio — el atacante cae en el modelo "web", que ya es válido. Los gates reales (auth + rate-limit + balance) permanecen activos en todos los caminos.

**Endurecimiento opcional:** si el shell nativo Android inyecta un header de plataforma, hacer la integridad obligatoria cuando ese header esté presente, para detectar clientes Android manipulados que aún se identifican como tales.

### 5.3 OPS-01 — Sin refund si persist falla tras iniciar streaming (Baja / Mitigado)

**Hallazgo:** una vez emitido el primer `oracle_delta`, un fallo posterior registra `persist_failed_no_refund` (0 tokens devueltos).

**Mitigación confirmada:** el flujo de recuperación (SSE heartbeat + thread recovery del lado cliente, stale-while-revalidate) recupera la lectura cuando sí quedó persistida en DB. El pre-check §2.5 cubre el "ambiguous success" — si la fila existe, no se refunda porque es recuperable. El caso genuinamente irrecuperable (persist realmente fallido + nada en DB + streaming iniciado) es extremadamente raro y se resuelve vía soporte.

---

## 6. Historial de remediación de performance (Fases 1–3)

| Bloqueante | Descripción | Resolución |
|---|---|---|
| B1 | `parallelImagePromise` sin `.catch()` → `unhandledRejection` en ventana 20–30s | `.catch(() => undefined)` en asignación — commit `80697a6` |
| B2 | `generateWithFal`/`generateWithGptImage` sin try/catch en fetch → reject de red con `streamingStarted=true` → pérdida de token | fetch envuelto en try/catch devolviendo `null` — commit `80697a6` |
| B3 | Efecto de B1: `.catch` resolvía a `undefined` → `finalizeReadingImages(undefined)` → TypeError → pérdida de token en match path | Guarda `if (!image)` con rebuild secuencial; `imageParams` constante unifica 3 paths — commit `11d568a` |

---

## 7. Checklist de operación pre-lanzamiento

Estos ítems no residen en el repositorio y deben confirmarse antes del go-live:

- [ ] Variables de entorno de producción en Vercel: `SUPABASE_SERVICE_ROLE_KEY`, `REVENUECAT_WEBHOOK_SECRET`, `ADMIN_PANEL_KEY_HASH`, credenciales Upstash, R2, Anthropic
- [x] **`REVENUECAT_ALLOW_TEST_EVENTS=false` en producción** — confirmado por owner (2026-06-13)
- [x] **`REVENUECAT_ALLOW_TEST_EVENTS=true` en staging** — confirmado por owner (2026-06-13)
- [x] **`ANTHROPIC_STREAM_DELTAS=false` en producción** — confirmado por owner (2026-06-13)
- [x] **`ANTHROPIC_PARALLEL_IMAGE=false` en producción** — confirmado por owner (2026-06-13)
- [x] **`ANTHROPIC_PROMPT_V2=false` en producción** — confirmado por owner (2026-06-13)
- [ ] Plan de Vercel soporta `maxDuration=300` (Fluid/Pro) en región `iad1`
- [ ] Migraciones aplicadas en la instancia de **producción** de Supabase (incl. 035 y grant idempotente), no solo en staging
- [ ] RevenueCat en modo **producción** (no sandbox); webhook apuntando a URL de producción; `product_id` coinciden con `getPackConfig`
- [ ] Sentry + Axiom recibiendo eventos de producción; alertas sobre `refund_failed` y `webhook_anonymous_unresolved`

---

## 8. Secuencia de activación recomendada

1. **Lanzamiento base** — flags OFF, tras confirmar §7
2. **`ANTHROPIC_STREAM_DELTAS=1`** — primer experimento post-lanzamiento
3. **`ANTHROPIC_PARALLEL_IMAGE=1`** — tras smoke test Fase B, vigilando `parallel_image:category_mismatch` (umbral ~5–10%)
4. **`ANTHROPIC_PROMPT_V2=1`** — tras golden set N≥50

---

---

## 9. Hallazgos post-auditoría — primera prueba en Android real (2026-06-13)

Descubiertos tras instalar APK 3.5.6/vc54 en dispositivo. Documentados en `HYDRATION_GATE_AUDIT_2026-06-13.md`.

| ID | Hallazgo | Severidad | Commit fix |
|---|---|---|---|
| HG-1 | Gate de consulta global bloquea sesión nueva durante hidratación de otros chats | Alta — bloqueante Android | `2e8044e` |
| HG-2 | Contador RN diverge del Set → spinner atascado permanentemente | Media | `2e8044e` |
| HG-3 | Sin watchdog ante `injectJavaScript` perdido → spinner eterno | Media | `2e8044e` |
| HG-4 | Sesiones sin SQLite: 250 ms de silencio antes del spinner | Baja | `2e8044e` |
| HG-5 | Cooldown ignora caché vacía → sync omitido incorrectamente | Baja | `2e8044e` |
| HG-6 | Sin telemetría de tiempos de hidratación RN | Baja | `2e8044e` |
| HG-7 | `getAttestationAsync` no existe en `expo-app-integrity` — Play Integrity nunca evaluado | Media (TS error) | `6d79c65` |

**Estado:** ✅ Todos implementados. APK resultante: v3.5.7 / versionCode 55.

---

## 10. Checklist de lanzamiento — estado actual (2026-06-13 EOD)

### Código (repo) — ✅ COMPLETO
- [x] Todos los hallazgos de auditoría Opus 4.8 cerrados
- [x] SEC-01 (TEST webhook gate)
- [x] HG-1 a HG-7 (hydration gate + attestKey)
- [x] APK 3.5.7 / vc55 compilado y disponible localmente
- [x] staging = main = `79f5a46`; working tree clean
- [x] **TDZ P0:** `imagePrompt` TDZ en `stream_ritual` + Sentry.captureException — rama `fix/tdz-image-prompt-sentry`
  - Documentado en `docs/auditorias/AUDIT_2026-06-13_animation-plan-v3-DEFINITIVO.md` (§1)
  - Brief de Acción 3 en `docs/auditorias/BRIEF_accion-3_submit-reveal-redesign.md`
- [x] **Animation plan v3 Acciones 2–7** — rama `feat/animation-plan-v3` (`60dbee4`), mergeada a staging+main (`9209da5`)
  - A2: `ritual-budget-store.ts` — budget persistido por traductor en localStorage
  - A3: Gate submit→reveal — `await revealPromise + ICHING_FINALE_MIN_MS` post-loop
  - A4: Pisos `ICHING_FINALE_MIN_MS=1200ms` / `BONES_FIRE_MIN_MS=2500ms` (env override)
  - A5: `useProgressiveRevealSubstring` parametrizable + `prefers-reduced-motion` + `NEXT_PUBLIC_TYPEWRITER_ENABLED`
  - A6: Watchdog `AbortController` `max(budget×2.5, 120s)` → abort → recovery
  - A7: `streamingText` + `oracle_delta`/`oracle_ready` render eliminados
  - **Verificado** por auditoría independiente — ver `AUDIT_2026-06-13_animation-plan-v3-DEFINITIVO.md` §10
- [x] **Fixes menores post-auditoría:**
  - Piso de fuego real bones: elapsed tracking (`boneAnimationStartMs`)
  - `getRitualBudget` fallback `?? 40_000` para key desconocida
  - `prefersReduced` en `useMemo([], ...)` — una evaluación por montaje
- [ ] **Acción 8** (ANTHROPIC_PROMPT_V2): diferida — requiere golden set N≥50

### Owner — ⏳ PENDIENTE
- [ ] **Smoke test APK 3.5.7** en dispositivo Android real (validar HG-1 principalmente)
- [ ] Variables de entorno de producción en Vercel (§7): `SUPABASE_SERVICE_ROLE_KEY`, `REVENUECAT_WEBHOOK_SECRET`, `ADMIN_PANEL_KEY_HASH`, Upstash, R2, Anthropic
- [ ] Plan Vercel soporta `maxDuration=300` (Fluid/Pro) en región `iad1`
- [ ] Migraciones aplicadas en Supabase **producción** (incl. 035, 039, 072, 073)
- [ ] RevenueCat en modo producción; webhook → `theoriginaliching.com`; product_ids coinciden con `getPackConfig`
- [ ] Sentry + Axiom recibiendo eventos de producción; alertas sobre `refund_failed` y `webhook_anonymous_unresolved`
- [ ] Verificación de identidad Google Play Console (1-3 días hábiles)
- [ ] Assets Play Store: icon 512×512, feature graphic 1024×500, screenshots
- [ ] Data Safety Form en Play Console
- [ ] EAS Build AAB (`staging-aab`) para Play Store — **solo tras smoke test exitoso**

---

*Auditoría realizada por Claude Opus 4.8 el 2026-06-13. Cubre el commit `11d568a`.*
*SEC-01 implementado en `fix/sec-01-test-webhook` (`e6d425f`) post-auditoría por Claude Sonnet 4.6.*
*Variables de entorno confirmadas por el owner en Vercel (producción + staging) el 2026-06-13.*
*Post-audit fixes (HG-1 a HG-7): Claude Sonnet 4.6, commit `79f5a46`.*
