# Auditoría profunda — The Original I Ching App (revisión externa)

**Código:** `20260715-EXT-SEC-02 full-repo-deep-audit` · **Familia:** SEC · **Estado:** open

- **Fecha:** 2026-07-15
- **Naturaleza:** **revisión externa** (terceros / modelo externo). Transcrita al sistema de docs **sin alterar hallazgos ni conclusiones**; solo se corrigió la codificación de caracteres y se añadió la cabecera de convención.
- **Commit auditado:** `9a021b9` (main)
- **Alcance:** repo completo (historial de git incluido), foco en producción
- **Escala:** 1738 commits, 69 ramas remotas, ~560 MB de repo
- **Método:** clon completo con historial, escaneo de secretos con gitleaks 8.24.3 sobre el historial, revisión estática por áreas (API, auth, pagos, base de datos, móvil, cabeceras, dependencias, CI)
- **Relacionado:** [`20260616-AUD-SEC-01`](./20260616-AUD-SEC-01-npm-dependencies.md) (deps npm — mismo eje que el P1), [`20260704-AUD-FABLE5-01`](./20260704-AUD-FABLE5-01-full-repo-audit.md) (auditoría full-repo previa), [`20260713-AUD-WEB-02`](./20260713-AUD-WEB-02-monorepo-resolution-blocker.md) (resolution-guard / patrón de `overrides` citado en §9)

---

## 0. Veredicto ejecutivo

Esta es una aplicación de producción con una madurez de seguridad muy por encima de lo típico en un proyecto de un solo fundador. La defensa no descansa en oscuridad, sino en mecanismos correctos: RLS comprensivo y auditado por linter, comparaciones en tiempo constante, Play Integrity, CSP con nonce, y una defensa SSRF de manual en el proxy de imágenes. La transición a repo público está bien contenida: no hay secretos reales en el historial.

**Postura general: sólida.** Un solo hallazgo accionable de verdad (vulnerabilidades transitivas de dependencias), más higiene menor y una recomendación de revisión focalizada que no se pudo cerrar por estática.

| Severidad | Cantidad | Resumen |
|---|---|---|
| Crítico | 0 | — |
| Alto | 1 | 2 CVEs `high` en dependencias transitivas (`form-data`, `ws`), con fix disponible |
| Medio | 3 | 8 CVEs `moderate` en deps; RLS habilitado pero lógica de políticas no verificada por estática; higiene de repo público |
| Bajo / higiene | 4 | 560 MB de historial, 69 ramas stale, anon key hardcodeado (estándar pero mejorable), exposición del modelo de seguridad |

---

## 1. Historial de git y transición a repo público

**El evento a auditar primero:** al volverse público, el repo expone no solo el HEAD sino los 1738 commits y las 69 ramas. Se escaneó el historial con gitleaks.

**Resultado:** 15 hallazgos crudos, de los cuales:
- **14 falsos positivos.** Nombres de claves de campos manuales i18n (`L1_comentario`, `L2_b_comentario`, …) en `scripts/lib/wilhelm-*-fields.mjs`, y nombres de storage keys del navegador (`iching_pending_legal_consent_v1`) en `apps/web/src/lib/legal-consent.ts`. Son identificadores, no secretos.
- **1 con forma de credencial:** un JWT en `apps/mobile/app/index.tsx`. Decodificado: `role: anon`, `iss: supabase`, `ref: idirklxzohzthdgsuqzb`. Es el **anon key público de Supabase**, diseñado para embeberse en clientes (está en cada build móvil y bundle web que descarga el usuario). Su seguridad depende de RLS, que está comprensivamente activo (ver §3). **No es una fuga.**

**Verificaciones negativas (todas limpias):**
- Cero archivos `.env` en el historial (solo `.env.example`, que está permitido).
- Cero claves service_role, cero patrones de API keys reales (`sk-ant-`, `sk_live_`, `whsec_`, `AIza`, `AKIA`) en HEAD ni en historial.
- `.gitignore` ignora correctamente `.env` y `.env.*`.
- El único keystore en historial es `apps/mobile/android/app/debug.keystore` — es el keystore de DEBUG de Android, público y compartido por diseño, **NO** la clave de firma de release.

**Caveat honesto:** gitleaks reportó 1324 commits escaneados (el conteo total con `rev-list --all` es 1738). Ambas corridas (default y `--all`) convergieron en los mismos 15 hallazgos, lo que da confianza razonable, pero no es una cobertura matemática del 100% de todas las ramas. Si se quiere certeza total, vale una corrida por-rama de las 69, aunque el resultado negativo tan consistente sugiere que no hay sorpresas.

**Fortaleza:** disciplina de secretos ejemplar. Volverse público fue seguro porque nunca se dependió de que el código fuera privado.

**Consideración (no vulnerabilidad):** ahora un atacante puede leer exactamente cómo funcionan las defensas (umbrales de rate-limit, flujo de integrity, rutas admin). Esto está bien porque la seguridad no es por oscuridad, pero conviene tenerlo presente: cualquier mecanismo que **sí** dependa de un secreto debe estar en variables de entorno, nunca en código.

---

## 2. Gestión de secretos y configuración

**Fortalezas:**
- `service_role` se referencia solo vía `process.env` (`apps/web/src/lib/supabase-admin.ts`, `startup-checks.ts`). Nunca hardcodeado.
- `startup-checks.ts` valida presencia de variables críticas al arranque (fail-fast si falta config).
- Variables `NEXT_PUBLIC_*` revisadas: son valores de configuración expuestos al cliente por diseño (URLs, versiones, tiempos de animación del ritual). Ningún secreto entre ellas.

**Debilidad menor:**
- El anon key está hardcodeado en `apps/mobile/app/index.tsx` en vez de inyectado por env. Es práctica estándar de Supabase (el anon key es público), pero moverlo a `app.config.js` vía env facilitaría una rotación futura sin recompilar. Prioridad baja.

---

## 3. Base de datos y RLS (Supabase) — la joya de la corona

Con el anon key público, TODA la seguridad de datos recae en Row Level Security. Se verificó y es el área más fuerte del proyecto.

**Fortalezas:**
- **23 sentencias `ENABLE ROW LEVEL SECURITY`** y **25 `CREATE POLICY`** en 74 migraciones. Todas las tablas sensibles cubiertas: `users`, `consultations`, `consultation_content`, `consultation_sessions`, `query_credits`, `two_factor_email_codes`, `user_legal_acceptances`, `revenuecat_webhook_events`.
- **Linaje de seguridad deliberado en las migraciones**, con sofisticación real:
  - Migración 035: revoca el `EXECUTE` público en funciones `SECURITY DEFINER`.
  - Migración 073: corrige dos warnings del linter de Supabase, incluida una trampa sutil (el grant implícito de `EXECUTE` a `PUBLIC` que `CREATE FUNCTION` añade por defecto del estándar SQL, que un `REVOKE` por-rol no cubre) y políticas deny-all explícitas en `token_refund_log`.
  - Migración 016: guard de replay para TOTP.
  - Migración 060: RLS initplan y `WITH CHECK`.
- Haber corrido el **linter de base de datos de Supabase** y arreglado lo que marcó es señal de madurez que raramente se ve.

**Debilidad / límite de la estática (recomendación P1):**
- Se verificó que RLS está HABILITADO y que existen 25 políticas, pero por estática **NO** se pudo confirmar que cada política sea **lógicamente** correcta (que la sesión anon del usuario A quede efectivamente bloqueada de las filas del usuario B). **"RLS activo" no es lo mismo que "RLS correcto".** La evidencia es fuerte (cobertura + linter), pero una revisión focalizada de la lógica de cada política, o mejor, un **test de integración** que intente leer datos ajenos con un token de otro usuario y confirme el rechazo, cerraría esto del todo. Es lo único que separa "muy probablemente seguro" de "verificado".

---

## 4. Superficie de API y autenticación

**Inventario:** 35 rutas en `apps/web/src/app/api`, bien organizadas (account, admin, auth/2fa, consult, webhooks, integrity, library, image-proxy, health, feedback).

**Fortalezas:**
- Autenticación por bearer token (`@/lib/auth/bearer-user`).
- **2FA robusto:** TOTP + código por email, con guard de replay (migración 016) y challenge/verify separados.
- **Turnstile de Cloudflare** en registro (anti-bot).
- **Play Integrity** (`verifyIntegrityToken`) para atestación del cliente móvil.
- Middleware con matcher que cubre todo excepto estáticos (`/((?!_next/static|_next/image|favicon|fonts/).*)`).

**Admin (`/api/admin/*`):**
- Login con `bcrypt.compare` sobre hash (no comparación en claro).
- Cookie de sesión con `httpOnly: true`, `secure` (fuera de dev), `sameSite: lax`, `path: /`, `maxAge: 8h`.
- `/api/admin/config` valida sesión admin y devuelve 401/403 sin ella.

**Rutas de debug:**
- `/api/ritual-debug` devuelve **404 en producción** (`NODE_ENV === "production"`). Correctamente gateada.

**Sin debilidades relevantes en esta área.** La cookie admin con `sameSite: lax` es defendible; si el panel admin es sensible, `strict` sería marginalmente mejor, pero lax es razonable para permitir navegación normal.

---

## 5. Integridad de pagos (webhook, créditos, reembolsos)

Área crítica por ser donde entra el dinero real.

**Fortalezas:**
- **Webhook de RevenueCat** (`revenuecat-webhook-auth.ts`): compara el secreto con `safeEqual` (**tiempo constante**, previene timing attacks), normaliza el prefijo `Bearer` para hacer una sola comparación. Rechaza si el secreto no está configurado. Textbook.
- **Ruta `/api/consult`** (la cara, que llama a Anthropic): apila auth + créditos + rate limit + verificación de integrity token antes de gastar.
- **Lógica de reembolso de tokens** con red de seguridad: si el stream no arrancó, reembolsa; si el reembolso falla, lo registra en Sentry para compensación manual vía `grant_tokens`, con comentario explícito de "nunca tragar el error en silencio". Diseño defensivo maduro.
- Tabla `revenuecat_webhook_events` con RLS (idempotencia de eventos).

**Sin debilidades relevantes.** El manejo del peor caso (token consumido + reembolso fallido → visible para compensación) es exactamente lo correcto.

---

## 6. Aplicación móvil / seguridad del WebView

El APK es una shell nativa sobre un WebView que carga el dominio propio. El vector clave es que el WebView no navegue fuera del origen.

**Fortalezas:**
- **Origin guard con comparación de origen parseado** (`onShouldStartLoadWithRequest`): `new URL(url).origin !== new URL(BASE_URL).origin`. El comentario explícitamente nota que esto previene el bypass por subdominio-prefijo (`https://tudominio.com.evil.com/` pasaría un `startsWith` ingenuo pero falla la comparación de origen). Esto es exactamente el error que la mayoría comete, y está evitado.
- Bloquea navegación cross-origin, con excepciones controladas y bien comentadas: OAuth de Google (reescribe `redirect_to` al deep link) y el reload de signout.
- **Bloqueo de contenido mixto** (HTTP sobre origen HTTPS), equivalente en Android WebView al `upgrade-insecure-requests` de CSP.
- El bridge inyectado (`INJECTED_JS`) expone `__RN_APP_INFO` (metadata no sensible), el integrity token, y la sesión vía intercambio PKCE nativo↔web. La sesión que viaja es la propia del usuario, no una fuga.

**Debilidad menor / matiz:**
- `originWhitelist={["*", "theoriginaliching://*"]}` es amplio. En la práctica no importa porque la aplicación real del guard está en `onShouldStartLoadWithRequest`, que sí enforce el origen; `originWhitelist` es la primera capa y el handler la definitiva. Es defensa en profundidad correcta, pero un `originWhitelist` más estrecho sería cinturón adicional. Prioridad baja.

---

## 7. Cabeceras HTTP de seguridad y middleware

**Fortalezas (en `next.config` + `middleware.ts`):**
- `X-Frame-Options: DENY` (anti-clickjacking).
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (HSTS con preload, un año).
- `Permissions-Policy` presente.
- **CSP basado en nonce, generado dinámicamente por request en el middleware**, con un comentario que explica correctamente por qué NO se pone CSP estático en `next.config` (los headers de `next.config` corren después del middleware y sobreescribirían el nonce). Esto demuestra entendimiento real de la mecánica, no copiar-pegar.

**Sin debilidades.** El set de cabeceras es de los más completos que se ven en un proyecto de este tamaño.

---

## 8. Proxy de imágenes y SSRF

`/api/image-proxy` es un vector clásico de SSRF (un proxy que busca URLs puede ser engañado para pegarle a IPs internas).

**Fortalezas:**
- Solo `https:` (rechaza cualquier otro protocolo).
- **Allowlist estricta:** solo `r2.dev`, `*.r2.dev` y el dominio R2 configurado vía `R2_PUBLIC_URL`. Todo lo demás → 403 `not_allowed`.
- **Seguimiento de redirects deshabilitado**, con comentario explícito: un redirect a una IP interna burlaría la allowlist. Redirect → 502 `redirect_not_allowed`.

**Sin debilidades.** Es una defensa SSRF de manual. El detalle del redirect es justo lo que se le escapa a la mayoría.

---

## 9. Dependencias y cadena de suministro — el hallazgo accionable

**Estado:** `npm audit --omit=dev` reporta **11 vulnerabilidades: 2 high, 8 moderate, 1 low.**

**Las dos `high` (con fix disponible):**
- **`form-data` 4.0.0-4.0.5** — CRLF injection vía nombres de campo/archivo multipart sin escapar. `fixAvailable: true`.
- **`ws` 8.0.0-8.20.1** — divulgación de memoria no inicializada + DoS por agotamiento de memoria con fragmentos diminutos. `fixAvailable: true`.

Ambas son **transitivas** (llegan por `next` / `@sentry/nextjs` / `next-axiom` y sus sub-deps), no dependencias directas. La reachability real depende de si esos code paths se ejercitan en el runtime, pero al haber fix disponible no hay razón para no cerrarlas.

**Acción recomendada (P1):**
1. `cd apps/web && npm audit fix` para las que se resuelvan sin cambio mayor.
2. Para las transitivas que no cierre `audit fix`, forzar la versión parcheada vía `overrides` en la raíz (el patrón ya existe). Ejemplo: `"overrides": { "form-data": "^4.0.6", "ws": "^8.21.0" }` (verificar las versiones parcheadas exactas en el advisory).
3. Correr el `resolution-guard` sobre el cambio para confirmar que no rompe el árbol.
4. Nota: `next@15.5.19` en sí no aparece con CVE directo `high` en este audit; las `high` son de `form-data` y `ws`. Aun así, mantener `next` parcheado dentro de la línea 15.5.x es buena higiene.

**Nota de coherencia con lo ya trabajado:** este cambio de `overrides` es exactamente el tipo de cosa que debe pasar por el `resolution-guard` que se blindó (ver [`AUD-WEB-02`](./20260713-AUD-WEB-02-monorepo-resolution-blocker.md)), y que además **NO** debe tocar `apps/mobile`. El patrón ya está establecido.

---

## 10. Testing y CI/CD

**Fortalezas:**
- 37 archivos de test.
- CI con dos jobs: `ci` (typecheck, i18n audit, test, overlay render check, build) y `resolution-guard` (bloqueante, regenera el lockfile desde cero y falla si hay ERESOLVE o si el split de react se rompe). Ambos sobre npm@10.9.2, el generador del lockfile.
- Reporte de toolchain (`node -v` / `npm -v`) en ambos jobs para diagnosticar deriva de versión.

**Debilidades:**
- No hay branch protection en `main` (`protected: false`), así que los checks bloqueantes pintan rojo pero no impiden el merge administrativamente. Es una decisión pendiente conocida.
- No se detectó un test que verifique la lógica de RLS end-to-end (ver §3). Sería el test de mayor valor de seguridad que se podría añadir.

---

## 11. Higiene del repositorio

**Debilidades (no de seguridad, de mantenibilidad):**
- **~560 MB de repo.** Para 1738 commits es grande; sugiere binarios en el historial (fuentes, imágenes, muestras como `reports/overlay-pango-*-samples`, `reports/sumi-fallback-glyphs`). Ahora que es público, todo ese peso es clonable por cualquiera. No es urgente, pero si crece, considerar Git LFS para binarios o limpiar historial de assets grandes (con cuidado, reescribir historial en público tiene costos).
- **69 ramas remotas.** Muchas parecen stale (`feat/*`, `docs/*`, `backup/local-assets-2026-07-11`, `chore/upgrade-expo-sdk53`). Borrar las ya mergeadas reduce ruido y superficie de confusión. La rama `backup/local-assets` conviene revisarla y borrarla si su contenido ya está en main o si no debería ser público.
- Directorios de config de múltiples asistentes de IA en el repo (`.continue`, `.qwen`, `.windsurf`, `.cache`). Inofensivos, pero conviene confirmar que no contengan nada sensible en `rules/` y considerar `.gitignore` para los de caché.

---

## 12. Recomendaciones priorizadas

| # | Prioridad | Área | Acción |
|---|---|---|---|
| 1 | **P1 (alta)** | Dependencias | Cerrar los 2 CVEs `high` (`form-data`, `ws`) vía `npm audit fix` + `overrides`, pasando por el `resolution-guard`. Sin tocar mobile. |
| 2 | **P1 (alta)** | Base de datos | Añadir un test de integración de RLS: intentar leer filas de otro usuario con su token y confirmar rechazo. Cierra el único hueco de verificación real. |
| 3 | P2 (media) | Dependencias | Revisar y cerrar las 8 `moderate` restantes en el mismo pase. |
| 4 | P2 (media) | Repo público | Revisar y borrar la rama `backup/local-assets-2026-07-11`; confirmar que `.continue`/`.qwen`/`.windsurf/rules` no contengan nada sensible. |
| 5 | P3 (baja) | CI | Decidir branch protection en `main` (los checks bloqueantes ya existen; falta el enforcement administrativo). |
| 6 | P3 (baja) | Higiene | Limpiar ramas stale mergeadas; evaluar Git LFS o limpieza de assets para el peso de 560 MB. |
| 7 | P3 (baja) | Secretos | Mover el anon key de Supabase de hardcode a env en `app.config.js` para facilitar rotación futura. |
| 8 | P3 (baja) | Móvil | Estrechar `originWhitelist` del WebView como cinturón adicional (el guard real ya está en el handler). |

---

## 13. Límites de esta auditoría (transparencia)

- Es una revisión **estática** del código y el historial. No se ejecutó la app ni se probaron exploits en vivo.
- No se verificó el estado de producción en Vercel ni la salud del sitio en vivo (eso se confirma abriendo la app).
- La corrección **lógica** de las políticas RLS no se verificó por estática (ver §3, recomendación 2); solo se confirmó que están habilitadas y que existen.
- El escaneo de secretos cubrió 1324 commits con resultados consistentes entre dos configuraciones, pero no es una cobertura matemática de las 69 ramas.
- El `npm audit` refleja el estado de los advisories al momento de la corrida.

**Conclusión:** un proyecto de producción notablemente bien asegurado para su escala. La transición a público fue segura. Cerrar los dos CVEs `high`, añadir el test de RLS, y está en muy buena forma.

---

## 14. Seguimiento (contexto interno, no parte de la auditoría)

Anotado al transcribir, para quien lea esto después:

- **Rec. 1 (deps `high`)** — pendiente. El cambio de `overrides` debe pasar por el `resolution-guard` (ya **bloqueante** en CI desde 2026-07-14) y **no** tocar `apps/mobile` (queda en React 19.0.0). Ver [`AUD-WEB-02`](./20260713-AUD-WEB-02-monorepo-resolution-blocker.md) §2 para las dos fragilidades de resolución a respetar.
- **Rec. 5 (branch protection)** — decisión conocida y pendiente del owner: `main` no está protegido, por lo que el `resolution-guard` bloqueante pinta rojo pero no impide el merge. Habilitarlo cambiaría el flujo actual de merges directos staging→main.
- **Rec. 4 (`backup/local-assets-2026-07-11`)** — esa rama es el respaldo de `tools/` y `reports/` desvinculados en la limpieza `732c40b1`; su contenido **no** está en main por diseño. Evaluar antes de borrar.

---

## Cierre (2026-07-17)

Los dos P1 quedaron cerrados via `20260716-PLAN-SEC-01` con verificacion externa en cada paso:
- **P1-1 (CVEs high):** PR #8 mergeado 2026-07-17 (form-data 4.0.6, ws 8.21.1 via overrides scopeados within-major; audit --omit=dev 0 high/0 critical).
  - **Sobre las 6 moderate restantes (corregido por auditoría externa, verificado en main 56b32732):** son **1 vulnerabilidad real y 5 ecos transitivos**. La real: **postcss** (XSS via `</style>` sin escapar en su CSS stringify). Las otras cinco (@sentry/nextjs, @vercel/analytics, @vercel/speed-insights, next-axiom y el propio next) están flagged solo por propagación: postcss → next → sus dependientes. El "fix = downgrade major" que sugiere npm es su heurística ingenua (última versión que no depende de un next vulnerable), no un consejo accionable. No son nuevas: las mismas seis estaban en el audit de la rama del Ticket A. **No hay acción posible sin romper el stack**; se cierran con la migración a Next 16 cuando next actualice su postcss. **Verificación pendiente registrada: tras el merge de Next 16, confirmar que las seis desaparecen juntas — si no lo hacen, ahí sí hay algo que mirar.**
- **P1-2 (test de RLS):** PR #9 mergeado 2026-07-17 (suite de integracion 9 tablas x 4 aserciones, Tests 9 passed (9) en CI contra la base real migrada; job rls-test no bloqueante hasta 3-5 verdes en main, ver GATE-SEC-01).
Hallazgos derivados registrados: `20260716-PLAN-SUP-02` (replayabilidad de la cadena de migraciones, deuda DR abierta).
