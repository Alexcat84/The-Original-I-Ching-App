# Plan de remediación del backlog de pendientes no críticos

**Código:** `20260824-PLAN-OPS-01 backlog-remediation` · **Familia:** OPS · **Estado:** open
**Fecha:** 2026-08-24
**Verificado contra `main` (`754b4198`)** antes de escribir: cada estado declarado aquí se comprobó en el repo real, en Axiom o en Sentry. Las afirmaciones que no se pudieron verificar están marcadas como tales.
**Origen:** [`00000000-PLAN-BACKLOG-01`](../00000000-PLAN-BACKLOG-01-pending-non-critical.md), registro vivo de pendientes.
**Destinatario:** auditoría externa.

---

## 1. Contexto para quien no conoce el proyecto

"The Original I Ching" es una app de consultas al I Ching con interpretación por IA. Monorepo Turborepo con tres piezas relevantes:

- **`apps/web`**: Next.js 15 App Router en Vercel. Es donde vive toda la lógica de negocio: motor del I Ching, prompts, generación de imágenes, créditos.
- **`apps/mobile`**: shell Expo/React Native que carga la web en un WebView. Publicado en Google Play (`4.2.5` / versionCode 65, en Production desde el 2026-07-17).
- **`backend/db/migrations`**: cadena de 76 migraciones SQL sobre Supabase, replayable en base vacía, con un gate de verificación propio.

Modelo de negocio: tokens consumibles, sin suscripción. El acceso a consultar depende de `credits_total > 0`.

Observabilidad: Axiom para logs estructurados de servidor, Sentry para errores de cliente (web y móvil).

**Volumen de producción actual: muy bajo.** 4 consultas en 30 días. Este dato es esencial para leer las prioridades: varios hallazgos son latentes precisamente porque el tráfico todavía no los ejercita.

---

## 2. Resumen ejecutivo

Ocho pendientes abiertos. **Ninguno es crítico y ninguno tiene impacto de usuario confirmado.** Se agrupan en tres categorías:

| Categoría | Ítems | Naturaleza |
|-----------|-------|------------|
| Observabilidad | T-01 | Impide diagnosticar; bloquea la verificación de los demás |
| Corrección latente | T-02, T-03, T-06 | Bugs reales que el tráfico actual casi no ejercita |
| Endurecimiento y capacidad | T-04, T-05, T-07, T-08 | Trabajo opcional o diferido a propósito |

Un noveno ítem (P-06, job de `VACUUM` semanal roto once semanas) **ya se cerró** el 2026-08-23 y se documenta aquí solo como precedente metodológico, porque su lección explica el diseño de varios gates de este plan.

**Recomendación de secuencia:** T-01 primero, aunque no sea el de mayor prioridad nominal. Sin él, la verificación en producción de T-02 es ciega.

---

## 3. Precedente metodológico: por qué varios gates de este plan son como son

El 2026-08-23 se descubrió que el job semanal de `VACUUM` llevaba **once semanas fallando en producción**, todos los domingos, con `SQLSTATE 25001`. La migración que lo creó agendó tres sentencias separadas por punto y coma; pg_cron las envía por el protocolo de consulta simple y Postgres las envuelve en un bloque de transacción implícito, donde `VACUUM` no puede correr.

Pasó inadvertido once semanas porque **el gate comprobaba que el job estuviera registrado, nunca que corriera**. Estuvo en verde todo ese tiempo sobre un job muerto.

De ahí sale una regla que este plan aplica en todos sus criterios de cierre:

> **Un gate que pregunta "¿existe?" no prueba "¿funciona?".** Todo criterio de cierre de este plan verifica comportamiento observable, no presencia de configuración.

---

## 4. Secuencia recomendada

```
Ola 1 (desbloquea el resto)
  T-01  Sourcemaps de Sentry            sin cambios de repo
  T-02  Verificar el arreglo de hidratación ya desplegado

Ola 2 (correctitud, requiere cuidado)
  T-03  Mismatches de hidratación restantes   riesgo de pérdida de datos
  T-04  Runner de tests en mobile             habilita T-05 con red

Ola 3 (entrega y capacidad)
  T-05  Release móvil con el arreglo de integridad
  T-06  Anomalía de traceId sin explicar

Ola 4 (opcional, sin urgencia)
  T-07  Proveedores de imagen de respaldo
  T-08  Endurecimiento de Play Integrity
```

**Dependencias reales:**
- T-02 depende de T-01. Sin símbolos no se puede confirmar si un `removeChild` que reaparezca es el mismo bug u otro.
- T-05 se beneficia de T-04. El código que va en ese release toca concurrencia y timers, y se escribió sin cobertura automatizada.
- El resto son independientes.

---

## T-01 · Sentry no desminifica los errores web

**Origen:** P-09 · **Prioridad:** P2 · **Esfuerzo estimado:** 30 a 60 minutos · **Riesgo del cambio:** ninguno (no toca el repo)

### Estado verificado

El evento de Sentry lo declara literalmente:

```json
"errors": [{"type": "js_no_source", "symbolicator_type": "missing_source"}]
"symbolicated_in_app": false
```

En `apps/web/next.config.mjs` la subida de sourcemaps está condicionada a `SENTRY_AUTH_TOKEN`. Sin ese token, `withSentryConfig` corre en modo silencioso y `widenClientFileUpload` queda en `false`. El código **ya consume** las tres variables (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`): no hay nada que cambiar en el repo.

### Impacto medido, no teórico

Los tres costos se pagaron el 2026-08-24 investigando un error real:

1. **Stacks inservibles.** El error llegó como `ud`, `ug`, `uv` dentro de `chunks/87c73c54-...js`. El diagnóstico tuvo que salir del breadcrumb, de leer el código y de reproducir el render del servidor en local.
2. **La señal "primera aparición" no es fiable.** Sin símbolos, Sentry agrupa por nombres minificados, que cambian entre builds.
3. **Induce conclusiones causales falsas.** Sentry mostró las 6 ocurrencias bajo el release `aa248380` y de ahí salió la lectura de que ese deploy lo introdujo. Es demostrablemente falso: ese commit cambió **un solo archivo markdown**, y se desplegó a las 18:24:49 UTC mientras los errores ocurrieron entre 20:16 y 20:18 UTC, casi dos horas después. "Todas del mismo release" solo significa "todas mientras ese release estuvo vivo".

### Pasos

1. Crear un auth token en Sentry con permiso de escritura de releases.
2. Definir `SENTRY_AUTH_TOKEN` en Vercel (Production y Preview).
3. Confirmar que `SENTRY_ORG` y `SENTRY_PROJECT` también estén definidos en ambos entornos.
4. Redesplegar.

### Criterio de cierre

No basta con que las variables existan (ver §3). Provocar un error de prueba en producción y **verificar en Sentry que el stack llega con nombre de archivo fuente real, función real y número de línea**. Si sigue mostrando `ud`/`ug`, el ticket no está cerrado.

### Riesgo y reversión

Ninguno sobre el runtime: solo habilita la subida de artefactos en build. Reversión: quitar la variable.

---

## T-02 · Confirmar el arreglo de hidratación ya desplegado

**Origen:** seguimiento de `cd5c91de` · **Prioridad:** P2 · **Esfuerzo:** observación, sin desarrollo · **Riesgo:** ninguno

### Estado verificado

El 2026-08-24 Sentry reportó `NotFoundError: Failed to execute 'removeChild'` en `/chat`. Seis ocurrencias en ~2 minutos, todas de una misma sesión de usuario, sin repetirse desde entonces.

La causa raíz se identificó y se arregló en `cd5c91de`: `cachedAuthEmail` se inicializaba con un `useState` perezoso que leía `localStorage`. El servidor no tiene `localStorage`, así que devolvía `null` mientras el cliente devolvía el email real. Ese valor **intercambia ramas enteras de JSX**, no texto, y React se recupera de un mismatch estructural desmontando y reconstruyendo el subárbol.

Comprobado contra el servidor real levantando la app: el HTML emitido contiene `auth-explore-strip-cta` (rama no autenticada) y **cero** `auth-explore-strip-email`.

Seguridad del arreglo, verificada y no supuesta: se comparó el markup emitido por el servidor antes y después del cambio. **Idéntico byte a byte** (33155 bytes, `cta=1 email=0` en ambos). El primer pintado no cambió.

### Lo que queda sin confirmar

**Que la ausencia del error pruebe que el arreglo funcionó.** Las 6 ocurrencias fueron de una sola sesión y nunca se repitieron por sí solas, así que no se puede distinguir "arreglado" de "condición rara que no se ha vuelto a dar".

### Pasos

1. Completar T-01 primero.
2. Vigilar Sentry 30 días buscando reaparición de `removeChild` en `/chat`.
3. Buscar además si existe un issue separado de **"Minified React error #418"** y con qué fecha de primera aparición. Si existe y es anterior al 2026-08-24, confirma que el mismatch llevaba semanas activo y que solo la escalada a `removeChild` era nueva.

### Criterio de cierre

30 días sin reaparición **con sourcemaps activos**, de forma que un error nuevo sea atribuible con certeza.

---

## T-03 · Dos preferencias de `/chat` leen `localStorage` durante la hidratación

**Origen:** P-08 · **Prioridad:** P2 · **Esfuerzo estimado:** medio día con verificación · **Riesgo del cambio: ALTO si se hace ingenuamente**

### Estado verificado

En `apps/web/src/app/chat/page.tsx`, dos estados conservan el mismo patrón que causó T-02:

| Estado | Línea aprox. | Servidor | Cliente puede dar |
|--------|--------------|----------|-------------------|
| `ichingCastingMethod` | 663 | `"three-coins"` | `"yarrow-stalks"` |
| `ichingLineReadingSystem` | 688 | `"huang"` | `"zhuxi"` |

### Por qué no se arreglaron junto con el otro

**Cada uno tiene un `useEffect` que reescribe el valor en `localStorage` al montar**, con `[valor]` como dependencia. Si se inicializan con el default y se lee después, ese efecto puede dispararse con el default todavía puesto y **sobrescribir la preferencia real del usuario**.

Perder una preferencia del usuario es peor que el mismatch que se estaría arreglando. El cambio ingenuo está descartado por decisión explícita.

`cachedAuthEmail` no tenía este problema: se escribe solo dentro de manejadores de eventos de auth, nunca en un efecto de montaje. Por eso sí se pudo arreglar de inmediato.

### Por qué es menos grave que T-02

Estos dos afectan **atributos** (`checked`, `className`) y etiquetas, no la estructura del árbol. React parchea diferencias de atributo sin desmontar nada, que es justamente lo que evita el `removeChild`.

### Requisito, no implementación

Este plan **no prescribe** la solución, porque el modo de fallo es pérdida de datos y la decisión merece su propio análisis. Fija el requisito y el gate:

> **Requisito:** en ninguna secuencia de montaje puede escribirse en `localStorage` un valor de preferencia antes de haber leído el que ya estaba guardado.

Enfoques candidatos, con su contrapartida:

| Enfoque | Contrapartida |
|---------|---------------|
| Guardia de hidratación (`useRef`) que el efecto de escritura consulte | Hay que verificar el orden real de efectos: un `setState` dentro de `useLayoutEffect` provoca un re-render síncrono, y el efecto pasivo del primer commit puede llegar a correr con el valor viejo en su clausura |
| Omitir la primera ejecución del efecto de escritura | Más simple, pero depende del mismo detalle de orden |
| `suppressHydrationWarning` en los elementos afectados | Mínimo y legítimo para mismatches de atributo, pero silencia en vez de corregir |

### Criterio de cierre

Un test que **simule un montaje con un valor no-default guardado** y afirme que ese valor **sobrevive** al ciclo de montaje. Ese test es obligatorio: es el único que distingue el arreglo correcto del que borra datos.

### Reversión

`git revert` del commit. El cambio es local a un archivo.

---

## T-04 · `apps/mobile` no tiene runner de tests

**Origen:** P-04 · **Prioridad:** P2 · **Esfuerzo estimado:** 1 a 2 días · **Riesgo:** bajo (solo añade infraestructura)

### Estado verificado

- `apps/mobile/package.json`: el script `lint` es un no-op literal (`node -e "process.exit(0)"`).
- No existe script `typecheck`.
- **Cero archivos de test** bajo `apps/mobile`.

### Consecuencia concreta

La lógica más delicada del shell nativo (timers, refs, concurrencia, el puente con el WebView) se valida solo con `npx tsc --noEmit` y revisión manual. El arreglo que espera release en T-05 toca exactamente ese tipo de lógica y **salió sin cobertura automatizada**.

### Pasos

1. Añadir Vitest y `@testing-library/react-native` a `apps/mobile`.
2. Añadir scripts `test` y `typecheck` reales, y engancharlos en Turborepo.
3. Empezar por los hooks puros (`useIntegrityCheck`, servicios de sync) antes que por componentes.
4. Cubrir explícitamente el backoff acotado, la guarda de concurrencia y la limpieza de timers de `useIntegrityCheck`.

### Criterio de cierre

`npm run test --prefix apps/mobile` corre y pasa en CI, con al menos la lógica de reintento y concurrencia de `useIntegrityCheck` cubierta. El script `lint` deja de ser un no-op.

---

## T-05 · Release móvil con el arreglo de integridad

**Origen:** P-01 · **Prioridad:** P1 · **Esfuerzo estimado:** medio día más revisión de Play · **Riesgo:** medio (release a producción)

### Estado verificado

El código **ya está mergeado a main**, commits `24e7e905` y `5a505f64`. Falta únicamente el build: vive en el APK, no en Vercel. Versión actual en repo: `4.2.5` / versionCode 65.

Qué arregla:

1. **Sin reintento tras un fallo de atestación.** El timer periódico se armaba solo en el camino de éxito, así que una denegación dejaba el dispositivo sin atestación indefinidamente. El 2026-08-12 un dispositivo quedó 38 minutos sin atestar. Se añadió backoff acotado (30s, 2min, 5min) que **para** en vez de hacer polling.
2. **Refrescos concurrentes.** El 2026-08-18 dos challenges se dispararon con 40ms de diferencia para un solo token. Se añadió guarda de concurrencia con válvula de seguridad.
3. **Timeouts mal dimensionados.** El fetch del challenge no tenía timeout. Se dimensionaron contra el presupuesto de 15s del puente WebView, usando medición real de Axiom: 66 ciclos, p50 2.2s, p95 4.6s, máximo 8.5s.

### Impacto medido del problema que arregla

**Ningún usuario fue bloqueado.** `integrity_check_failed` = 0 en 90 días, cero `bridge_timeout`. Afectó a 6 usuarios en 3 regiones sin consecuencia visible. Lo que se perdía era la ejecución silenciosa del control anti-manipulación, es decir postura de seguridad, no experiencia de usuario.

La mitad servidor **ya está viva** en producción desde el 2026-08-23: las denegaciones ahora aparecen en Axiom como `integrity_client_event_denied`.

### Pasos

Seguir el procedimiento documentado del proyecto, sin desviarse:

1. Bump correlativo de versión y `versionCode` +1 sobre el último **subido** (no sobre el del repo si difieren). Ver [`00000000-OPS-PLAY-02`](../00000000-OPS-PLAY-02-play-store-versioning.md).
2. Actualizar changelog. Ver [`00000000-OPS-PLAY-01`](../00000000-OPS-PLAY-01-play-store-changelog.md).
3. Commit a `staging`, merge a `main`.
4. AAB de producción con el perfil `staging-aab` de EAS. **Nunca el perfil `preview` para Play Console.**
5. Smoke previo con APK **local** (`assembleRelease`) apuntando a staging, según el invariante del proyecto.

### Criterio de cierre

Tras el despliegue, en Axiom: aparición de eventos `integrity_client_event` con fase de fallo (hoy hay **cero** registrados históricamente, porque el reporte de fallo se enviaba con el token que acababa de ser rechazado), y ausencia de crecimiento en `integrity_challenge_denied` sobre la base actual de 7 en 30 días sobre 71 intentos (9.9%).

### Riesgo y reversión

Es un release a Play Store. Reversión: publicar el versionCode anterior o detener el rollout. Por eso el smoke previo con APK local es obligatorio y no negociable.

---

## T-06 · TraceId de integridad repetido, sin explicar

**Origen:** P-05 · **Prioridad:** P3 · **Esfuerzo estimado:** 2 a 4 horas de investigación · **Riesgo:** ninguno (solo investigación)

### Estado verificado

El traceId `itr_1786566479021_cqa0uawf` aparece en **dos peticiones distintas** (requestId `iad1::db57n-...` y `iad1::c8xdp-...`) el 2026-08-12 a las 20:28:02 y a las 21:06:10. Treinta y ocho minutos de diferencia, mismo id.

Se revisaron todos los llamadores del refresco y **todos generan un id nuevo**. No se le encontró causa en el código.

**Queda señalado, no explicado. No se inventó una hipótesis para poder cerrarlo.**

### Por qué no es crítico

Es una anomalía de correlación de telemetría. No afecta al usuario ni a la verificación de integridad.

### Criterio de cierre

Explicación con evidencia, o confirmación de que no reaparece en 90 días. **Cerrar por hipótesis no es aceptable.**

---

## T-07 · Proveedores de imagen de respaldo, diferidos a propósito

**Origen:** P-02 y P-03 · **Prioridad:** P2 · **Esfuerzo estimado:** medio día cada uno · **Riesgo:** bajo

### Estado verificado

- **Runware:** `tools/fallback-tools/probe-runware.mjs` existe y está listo, pero **nunca se ha ejecutado** por falta de `RUNWARE_API_KEY`.
- **fal.ai:** el código está desplegado y **dormido a propósito**. `apps/web/src/lib/image-provider.ts` lo documenta en el propio código: sin `FAL_AI_KEY`, la rama no hace nada.

### Restricción dura del proyecto

> **Runware no se conecta a la app hasta que el probe corra y pase.** Primero se prueba la operatividad, después se integra. Decisión explícita del dueño del proyecto, no negociable ni saltable.

### Por qué no es crítico

La cadena actual de contingencia (Together, luego pool precomputado en R2, luego prebuilt, luego SVG) ya da respaldo suficiente. Fue una decisión consciente de no encender más proveedores todavía, no un olvido.

### Criterio de cierre

- Runware: probe ejecutado con veredicto **pass** documentado, y solo entonces cableado como fallback 2.
- fal.ai: `FAL_AI_KEY` definida en Vercel y una generación real servida por esa rama, confirmada en logs.

**Detalle completo:** [`20260814-PLAN-IMG-PROV-01`](../20260814-PLAN-IMG-PROV-01-image-fallback-providers-deferred.md)

---

## T-08 · Endurecimiento opcional de Play Integrity

**Origen:** P-07 · **Prioridad:** P3 · **Esfuerzo estimado:** 1 a 2 días para la variante fuerte · **Riesgo:** medio (toca el camino de autenticación)

### Estado verificado y clasificación previa

Auditado el 2026-06-13 como hallazgo `SEC-02` en [`20260613-AUD-PRD-01`](./20260613-AUD-PRD-01-pre-production-jun13.md) §5.2, clasificado **Info** y **resuelto por diseño**. **No es una vulnerabilidad abierta y nunca se catalogó como tal.** La auditoría externa profunda [`20260715-EXT-SEC-02`](./20260715-EXT-SEC-02-full-repo-deep-audit.md) tampoco lo marcó como vulnerabilidad, y describe Play Integrity entre los mecanismos correctos del proyecto.

### La situación

La verificación corre solo si llega la cabecera `x-integrity-token` (`if (integrityToken)` en `apps/web/src/app/api/consult/route.ts`). Un APK modificado que la omita se salta la comprobación.

### Por qué se aceptó, y por qué el argumento sigue en pie

Las consultas desde navegador web ya se permiten sin integridad, protegidas por Turnstile en el registro. Quitar la cabecera **no otorga escalada de privilegio**: el atacante cae en el modelo "web", que ya es un camino legítimo. Los gates que de verdad cuestan (autenticación, rate limit y saldo de créditos) siguen activos en todos los caminos.

El flanco caro lo cubre el modelo de negocio: cualquier cliente, modificado o no, necesita cuenta autenticada y `credits_total > 0`. No se obtienen consultas gratis. El vector de abuso realista es crear cuentas en masa para cosechar los 2 tokens gratuitos, y contra eso ya operan Turnstile, `user_trial_log`, `trial_email_log` por hash de email y rate limiting fail-closed.

### Variantes disponibles

| Variante | Fuerza | Contrapartida |
|----------|--------|---------------|
| Cabecera de plataforma inyectada por el shell nativo, exigiendo integridad cuando esté presente | Baja | Eludible quitando también esa cabecera |
| Atar la clase de dispositivo a la sesión de Supabase con un claim HMAC en `user_metadata` | Alta | No se elude desde el cliente: la marca viaja firmada en la sesión |

### Disparadores que subirían la prioridad

1. Evidencia real de abuso desde clientes Android manipulados. Base actual: **cero** `integrity_check_failed` en 90 días.
2. **Que los caminos web y Android dejen de tener el mismo privilegio.** Si alguna vez existe una capacidad exclusiva de Android, el argumento de "cae en el modelo web" deja de sostenerse y esto sube de prioridad de inmediato.

El segundo disparador es el importante: hoy el diseño se sostiene por una simetría que podría romperse sin que nadie lo note.

---

## 5. Invariantes que aplican a todos los tickets

Estas reglas son del proyecto y no se relajan por conveniencia de este plan:

1. **Flujo de ramas.** Todo commit va a `staging` primero. `main` solo se actualiza por merge desde `staging`, nunca commit directo.
2. **Gates verdes antes de mergear.** `typecheck`, suite de tests de `apps/web`, y `npm run verify:qa-registry`.
3. **Registro obligatorio.** Cada test nuevo necesita su cabecera de código QA y su entrada en `docs/qa/registry.json` en el mismo commit. Cada migración nueva necesita su check en `verify_migrations.sql` en el mismo commit.
4. **Gates de comportamiento, no de presencia.** Ver §3.
5. **Cero em-dashes** en texto nuevo del proyecto.
6. **Versionado de Play Store:** correlativo puro, `versionCode` +1 sobre el último **subido**.
7. **APK de smoke:** siempre build local con el `.env` volteado a staging. El perfil `preview` de EAS sale con la URL de **producción** embebida y no sirve para smoke.

---

## 6. Fuera de alcance explícito

Para que el auditor no lo lea como omisión:

- **App Expo nativa completa (Fase 2).** El shell WebView sigue siendo la arquitectura. Es una decisión de producto abierta, no deuda técnica.
- **i18n con `next-intl`.** Descartado. El proyecto se estandarizó en `@iching-oracle/i18n` y la guía oficial lo prohíbe explícitamente. Aparecía como pendiente en documentación desactualizada, ya corregida.
- **Migración 076.** Ya aplicada y verificada en ambos entornos el 2026-08-23.

---

## 7. Trazabilidad

| Ticket | Backlog | Prioridad | Esfuerzo | Riesgo del cambio | Bloquea |
|--------|---------|-----------|----------|-------------------|---------|
| T-01 | P-09 | P2 | 30-60 min | Ninguno | T-02 |
| T-02 | seguimiento `cd5c91de` | P2 | Observación | Ninguno | - |
| T-03 | P-08 | P2 | Medio día | **Alto si es ingenuo** | - |
| T-04 | P-04 | P2 | 1-2 días | Bajo | - |
| T-05 | P-01 | P1 | Medio día | Medio (release) | - |
| T-06 | P-05 | P3 | 2-4 h | Ninguno | - |
| T-07 | P-02, P-03 | P2 | Medio día c/u | Bajo | - |
| T-08 | P-07 | P3 | 1-2 días | Medio | - |

**Cerrado antes de este plan:** P-06, migración 076, commits `4503adff` y `84a1e4cb`.

---

## 8. Nota de honestidad metodológica

Dos afirmaciones de este plan **no** están verificadas de forma independiente y se marcan como tales:

1. **Que el arreglo de T-02 haya eliminado el error.** No se pudo confirmar: el error nunca se repitió por sí solo. Sin sourcemaps (T-01) tampoco se podría atribuir con certeza una reaparición.
2. **La causa del traceId duplicado (T-06).** Se revisaron todos los llamadores y ninguno la explica. Se dejó abierta en vez de cerrarla con una hipótesis plausible.

Todo lo demás de este documento se comprobó contra el repo en `754b4198`, contra los logs de Axiom, contra los eventos de Sentry, o ejecutando el código.
