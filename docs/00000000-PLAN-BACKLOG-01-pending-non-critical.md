# Pendientes conocidos: no críticos hoy, pero hay que hacerlos

**Código:** `00000000-PLAN-BACKLOG-01 pending-non-critical`
**Estado:** open (documento vivo)
**Creado:** 2026-08-23
**Última revisión:** 2026-08-26 (alta de P-10; T-04 rediseñado tras el incidente de Vercel)

---

## Para qué sirve este documento

Registro único de trabajo **identificado, verificado y decidido conscientemente como aplazable**. No es una lista de ideas ni un backlog de producto: cada entrada es algo que ya se investigó, cuyo impacto real se midió, y que se dejó pendiente a propósito.

Reglas de esta lista:

- Nada entra aquí sin **evidencia verificada** en el repo, en Axiom o en Sentry. Si no se pudo confirmar, va a la sección "Requiere revisión", no a la tabla de pendientes.
- Cada entrada dice **por qué no es crítico hoy** y **qué lo vuelve urgente**. Sin eso, no se puede decidir cuándo atacarlo.
- Cuando algo se resuelve, se mueve a "Resueltos" con su fecha y el commit. No se borra.

Prioridades: **P1** hacer en el próximo ciclo natural, **P2** cuando toque el área, **P3** oportunista.

---

## Pendientes abiertos

| ID | Pendiente | Prioridad | Detectado |
|----|-----------|-----------|-----------|
| [P-01](#p-01) | Arreglo de integridad móvil esperando build | P1 | 2026-08-21 |
| [P-02](#p-02) | Runware sin probar: no se puede cablear como fallback 2 | P2 | 2026-08-14 |
| [P-03](#p-03) | fal.ai desplegado pero dormido (sin `FAL_AI_KEY`) | P2 | 2026-08-14 |
| [P-04](#p-04) | `apps/mobile` no tiene runner de tests | P2 | 2026-08-23 |
| [P-05](#p-05) | traceId de integridad repetido a 38 minutos, sin explicar | P3 | 2026-08-23 |
| [P-07](#p-07) | Endurecimiento opcional: exigir integridad a clientes que se declaran Android | P3 | 2026-06-13 |
| [P-08](#p-08) | Dos preferencias de `/chat` siguen leyendo `localStorage` durante la hidratación | P2 | 2026-08-24 |
| [P-09](#p-09) | Sentry no puede desminificar los errores web (sourcemaps sin subir) | P2 | 2026-08-24 |
| [P-10](#p-10) | `turbo run test` muere en Windows, la suite completa no corre en local | P3 | 2026-08-25 |

---

### P-01

**Arreglo de integridad móvil esperando build**

- **Detectado:** 2026-08-21 (evento Sentry `integrity_client_event`, dispositivo SM-S918U1)
- **Código:** hecho y mergeado a main el 2026-08-23, commits `24e7e905` y `5a505f64`
- **Falta:** solo el build. El código vive en el APK, no en Vercel.

Qué arregla: reintento acotado tras un fallo de atestación, guarda de concurrencia, y timeouts dimensionados contra el presupuesto de 15s del puente WebView.

**Por qué no es crítico hoy:** se verificó en Axiom que **ningún usuario fue bloqueado**. `integrity_check_failed` = 0 en 90 días, cero `bridge_timeout`, y el camino del 401 responde rápido con el token anterior, así que tampoco añade latencia. Afectó a 6 usuarios en 3 regiones (Montreal, US East, Frankfurt) sin consecuencia visible para ellos.

**Qué se pierde mientras tanto:** el control anti-manipulación deja de correr en silencio durante esas sesiones. El 2026-08-12 un dispositivo quedó 38 minutos sin atestación. Es postura de seguridad, no experiencia de usuario.

**Qué lo vuelve urgente:** que aparezca un `integrity_check_failed` real, o que suba la frecuencia de `integrity_challenge_denied` (base actual: 7 en 30 días sobre 71 intentos, 9.9%).

**Cómo cerrarlo:** viaja en el próximo release normal. Bump correlativo de versión y `versionCode` +1 sobre el último **subido** (actual en repo: 4.2.5 / 65), changelog, y AAB con el perfil que va a Play. Ver [`00000000-OPS-PLAY-02`](./00000000-OPS-PLAY-02-play-store-versioning.md) y [`00000000-OPS-PLAY-01`](./00000000-OPS-PLAY-01-play-store-changelog.md).

**Dos bloqueantes duros antes de generar el AAB** (auditoría externa del 2026-08-24, ver [`20260824-PLAN-OPS-01`](./auditorias/20260824-PLAN-OPS-01-backlog-remediation.md) T-05.0 y T-05.1):

1. **Pinnear `EXPO_PUBLIC_API_URL` de producción en `eas.json`.** Verificado: el perfil `staging-aab`, que es el que va a Play, **no fija ninguna variable de entorno**, así que la URL embebida depende del dashboard de EAS, estado no versionado e invisible en revisión de código. `internal-staging-aab` ya demuestra el patrón correcto para staging. Falta el equivalente de producción, y documentar por qué el AAB sale de `staging-aab` (`credentialsSource: remote`) y no de `production` (`credentialsSource: local`).
2. **Cobertura de tests de `useIntegrityCheck`** (ver P-04): backoff acotado, guarda de concurrencia y limpieza de timers. La auditoría lo elevó de recomendación a requisito, porque el código toca concurrencia y timers, salió sin cobertura, y revertir un release de Play es caro.

**Nota:** la mitad servidor de ese arreglo **ya está viva** en producción. Desde el 2026-08-23 las denegaciones aparecen en Axiom como `integrity_client_event_denied`; antes eran invisibles fuera de Sentry.

---

### P-02

**Runware sin probar: no se puede cablear como fallback 2**

- **Detectado:** 2026-08-14
- **Estado:** `tools/fallback-tools/probe-runware.mjs` existe y está listo, pero **nunca se ha ejecutado** (no hay `RUNWARE_API_KEY` disponible).

**Restricción dura, decidida por el dueño del proyecto:** no se conecta Runware a la app hasta que el probe corra y **pase**. Primero se prueba la operatividad, después se integra. No es opcional ni se salta.

**Por qué no es crítico hoy:** la cadena actual (Together, luego pool de R2, luego prebuilt, luego SVG) ya da contingencia suficiente. Se decidió explícitamente que había bastante respaldo por ahora.

**Qué lo vuelve urgente:** que Together falle de forma sostenida y el pool de R2 empiece a cargar tráfico real.

**Detalle completo:** [`20260814-PLAN-IMG-PROV-01`](./20260814-PLAN-IMG-PROV-01-image-fallback-providers-deferred.md)

---

### P-03

**fal.ai desplegado pero dormido**

- **Detectado:** 2026-08-14
- **Estado verificado:** el código está desplegado y en estado latente a propósito. `apps/web/src/lib/image-provider.ts:1019` lo documenta en el propio código: sin `FAL_AI_KEY` la rama no hace nada.

**Por qué no es crítico hoy:** decisión consciente de no encender más proveedores todavía, misma razón que P-02.

**Cómo activarlo:** basta definir `FAL_AI_KEY` en Vercel. No requiere cambio de código.

**Detalle completo:** [`20260814-PLAN-IMG-PROV-01`](./20260814-PLAN-IMG-PROV-01-image-fallback-providers-deferred.md)

---

### P-04

**`apps/mobile` no tiene runner de tests**

- **Detectado:** 2026-08-23, al arreglar el hook de integridad.
- **Estado verificado:** en `apps/mobile/package.json` el script `lint` es un no-op (`node -e "process.exit(0)"`) y no existe script `typecheck`. No hay ni un solo archivo de test bajo `apps/mobile`.

**Consecuencia concreta:** cambios de lógica delicada en el shell nativo (timers, refs, concurrencia, el puente con el WebView) se validan solo con `npx tsc --noEmit` y revisión manual. El arreglo de P-01 toca justamente ese tipo de lógica y salió sin cobertura automatizada.

**Por qué no es crítico hoy:** `tsc` en modo strict sí corre y atrapa errores de tipo; el área cambia poco; y montar el runner era ampliar el alcance de un arreglo puntual.

**Qué lo vuelve urgente:** la próxima vez que haya que tocar concurrencia o timers en `apps/mobile`. Ahí el costo de no tener red de seguridad se paga completo.

**Cómo cerrarlo:** tanda propia. Vitest más `@testing-library/react-native`, empezando por los hooks puros (`useIntegrityCheck`, sync) antes que por componentes.

---

### P-05

**traceId de integridad repetido a 38 minutos, sin explicar**

- **Detectado:** 2026-08-23, rastreando en Axiom.
- **Evidencia:** el traceId `itr_1786566479021_cqa0uawf` aparece en **dos peticiones distintas** (requestId `iad1::db57n-...` y `iad1::c8xdp-...`) el 2026-08-12 a las 20:28:02 y a las 21:06:10.

**Estado:** se revisaron todos los llamadores y **todos generan un id nuevo**, así que no se le encontró causa en el código. Queda señalado, no explicado. No se inventó una hipótesis para cerrarlo.

**Por qué no es crítico:** es una anomalía de correlación de telemetría. No afecta al usuario ni a la verificación.

**Qué lo vuelve urgente:** si empieza a repetirse, porque significaría que hay un camino de refresco que no está mapeado.

---

### P-07

**Endurecimiento opcional: exigir integridad a los clientes que se declaran Android**

- **Detectado:** 2026-06-13, auditoría de pre-producción, hallazgo `SEC-02`.
- **Clasificación original:** **Info**, resuelto **por diseño**. No es una vulnerabilidad abierta y nunca se catalogó como tal.
- **Referencias:** [`20260613-AUD-PRD-01`](./auditorias/20260613-AUD-PRD-01-pre-production-jun13.md) §5.2, y el comentario en `apps/web/src/app/api/consult/route.ts:400-408`.

**La situación:** la verificación de Play Integrity corre solo si llega la cabecera `x-integrity-token` (`if (integrityToken)`). Un APK modificado que la omita se salta la comprobación.

**Por qué se aceptó por diseño, y el argumento sigue siendo válido:** las consultas desde navegador web ya se permiten sin integridad, protegidas por Turnstile en el registro. Quitar la cabecera **no otorga escalada de privilegio**: el atacante simplemente cae en el modelo "web", que ya es un camino legítimo. Los gates que de verdad cuestan (autenticación, rate limit y saldo de créditos) siguen activos en todos los caminos. La auditoría externa profunda [`20260715-EXT-SEC-02`](./auditorias/20260715-EXT-SEC-02-full-repo-deep-audit.md) tampoco lo marcó como vulnerabilidad, y describe Play Integrity entre los mecanismos correctos del proyecto.

**Qué protege hoy:** scraping pasivo y emuladores sin modificar. No pretende detener a alguien decidido, y nunca pretendió hacerlo.

**El endurecimiento disponible, en dos variantes:**

1. La de la auditoría: que el shell nativo inyecte una cabecera de plataforma, y exigir integridad de forma obligatoria cuando esa cabecera esté presente. Detecta clientes Android manipulados que **aun así se identifican como Android**. Barato, pero eludible quitando también esa cabecera.
2. La del comentario en el código, más fuerte: atar la clase de dispositivo a la sesión de Supabase en el login mediante un claim HMAC en `user_metadata`, para que el backend pueda exigir el token de forma incondicional a cualquier sesión marcada como Android. No se elude desde el cliente, porque la marca viaja firmada en la sesión.

**Por qué no es crítico:** el modelo de negocio cubre el flanco caro. Cualquier cliente, modificado o no, necesita cuenta autenticada y saldo (`credits_total > 0`) para consultar. No se sacan consultas gratis, se pagan. El vector de abuso realista es crear cuentas en masa para cosechar los 2 tokens gratuitos, y contra eso ya hay Turnstile, `user_trial_log`, `trial_email_log` por hash de email y rate limiting fail-closed.

**Qué lo vuelve urgente:** dos cosas concretas. Que aparezca evidencia real de abuso desde clientes Android manipulados (hoy: cero `integrity_check_failed` en 90 días, ver P-01). O que los caminos web y Android dejen de tener el mismo privilegio: si alguna vez existe una capacidad exclusiva de Android, el argumento de "cae en el modelo web" deja de sostenerse y esto sube de prioridad de inmediato.

---

### P-08

**Dos preferencias de `/chat` siguen leyendo `localStorage` durante la hidratación**

- **Detectado:** 2026-08-24, investigando un `NotFoundError: removeChild` en producción.
- **Estado:** el caso grave (`cachedAuthEmail`) ya se arregló. Estos dos quedaron **deliberadamente sin tocar**.

**Qué son:** en `apps/web/src/app/chat/page.tsx`, `ichingCastingMethod` (línea ~663) e `ichingLineReadingSystem` (línea ~688) se inicializan con un `useState` perezoso que lee `localStorage`. El servidor no tiene `localStorage`, así que devuelve el default (`three-coins`, `huang`) mientras el cliente puede devolver otro valor (`yarrow-stalks`, `zhuxi`). Eso desalinea el primer render del cliente con el HTML del servidor y produce un mismatch de hidratación de React.

**Por qué NO se arreglaron junto con el otro:** cada uno tiene un `useEffect` que **reescribe el valor en `localStorage` al montar**, con `[valor]` como dependencia. Si se inicializan con el default y se lee después, ese efecto puede dispararse con el default todavía puesto y **sobrescribir la preferencia guardada del usuario**. Perder una preferencia real del usuario es peor que el mismatch que se estaría arreglando, así que el cambio ingenuo está descartado.

**Por qué es menos grave que el que sí se arregló:** estos dos afectan atributos (`checked`, `className`) y etiquetas, no la estructura del árbol. React parchea diferencias de atributos sin desmontar nada. `cachedAuthEmail` en cambio intercambiaba ramas enteras de JSX, que es el mismatch estructural que termina en `removeChild`.

**Cómo cerrarlo bien:** hace falta un guardia de hidratación, no solo mover la lectura. El patrón: un `useRef` que marque "ya leí el storage", que el efecto de escritura consulte para no grabar nada antes de esa lectura. Es un cambio pequeño pero necesita su propia verificación, porque el modo de fallo es pérdida de datos del usuario.

**Qué lo vuelve urgente:** que aparezcan más `removeChild` o mismatches en `/chat` después de que el arreglo de `cachedAuthEmail` esté desplegado. Si siguen, estos dos son los siguientes sospechosos.

---

### P-09

**Sentry no puede desminificar los errores web: los sourcemaps nunca se suben**

- **Detectado:** 2026-08-24, investigando el `NotFoundError: removeChild` de `/chat`.
- **Evidencia directa del propio evento:** `"errors": [{"type": "js_no_source", "symbolicator_type": "missing_source"}]` y `"symbolicated_in_app": false`.
- **Causa:** en `apps/web/next.config.mjs`, la subida de sourcemaps depende de `SENTRY_AUTH_TOKEN`. Sin ese token, `withSentryConfig` queda en modo silencioso y `widenClientFileUpload` en `false`, así que no sube nada.

**Los tres costos, todos pagados hoy en un caso real:**

1. **Stacks inservibles.** El error llegó como `ud`, `ug`, `uv` dentro de `chunks/87c73c54-...js`. No dice nada. El diagnóstico salió del breadcrumb, de leer el código y de reproducir el render del servidor en local, no del stack.
2. **La señal "es nuevo" no es fiable.** Sin símbolos, Sentry agrupa por nombres minificados, que cambian entre builds. "Primera aparición hoy" puede ser un artefacto de agrupación, no un hecho sobre el bug.
3. **Induce conclusiones causales equivocadas, y esto es lo más caro.** Sentry mostró las 6 ocurrencias bajo el release `aa248380` y de ahí salió la lectura de que "fue introducido en ese deploy". Es falso y se puede probar: ese commit cambió **un solo archivo markdown**, y se desplegó a las 18:24:49 UTC mientras los errores ocurrieron entre las 20:16 y las 20:18 UTC, casi dos horas después. "Todas del mismo release" solo significa "todas mientras ese release estuvo vivo". Sin sourcemaps no hay forma de contrastar esa inferencia con el código real que falló.

**Por qué no es crítico hoy:** el volumen de errores web es bajísimo y el caso concreto sí se pudo diagnosticar por otras vías. Es una brecha de observabilidad, no una falla de producto.

**Qué lo vuelve urgente:** el primer error web cuyo breadcrumb no alcance para explicarlo. Ahí, sin stack legible, la investigación se queda sin salida.

**Cómo cerrarlo:** crear un auth token en Sentry con permiso de releases y definir `SENTRY_AUTH_TOKEN` en Vercel (confirmar de paso que `SENTRY_ORG` y `SENTRY_PROJECT` también estén). El código ya está preparado y los consume: no hace falta cambiar nada en el repo. Después, verificar en un error de prueba que el stack llegue con nombres de función y archivo reales.

**Nota relacionada:** conviene vigilar si el `removeChild` de `/chat` reaparece tras el arreglo `cd5c91de`. Las 6 ocurrencias fueron de una sola sesión de usuario en dos minutos y no se repitieron, así que la ausencia por sí sola todavía no prueba que el arreglo lo eliminó.

---

### P-10

**`turbo run test` muere en Windows: la suite completa no corre en local**

- **Detectado:** 2026-08-25, ejecutando T-04.
- **Sintoma:** `npx turbo run test` falla en ~300 ms sin llegar a compilar nada, en un paquete **distinto en cada corrida** (`sharing`, `ui`, `oracle-bones-engine`, `iching-data`). El error es siempre `npm-cli.js run <task> exited (1)` sin salida. Los mismos paquetes compilan sin problema ejecutados de forma individual.
- **Verificado como PREEXISTENTE:** se revirtieron los archivos rastreados a HEAD y se reprodujo igual, asi que no lo introdujo el trabajo de T-04. Tampoco depende del paralelismo: falla igual con `--concurrency=1`.

**Por que no es critico:** CI corre en Linux (`ubuntu-latest`) y no esta afectado; los gates siguen protegiendo `main`. Cada paquete se puede correr por separado (`npm run test --prefix apps/web`, etc.), que es como se valido todo el trabajo reciente.

**Que se pierde mientras tanto:** no hay forma de correr la suite completa del monorepo en local antes de pushear. Eso empuja a validar paquete por paquete y aumenta la probabilidad de que algo entre a `main` sin haber pasado por todas las compuertas de golpe.

**Que lo vuelve urgente:** que alguien necesite validar un cambio que cruce varios paquetes a la vez, o que CI empiece a atrapar cosas que un local sano habria detectado antes.

**Pista para investigarlo:** el patron (paquete distinto cada vez, ~300 ms, sin salida) sugiere que turbo invoca `npm` de una forma que muere de inmediato en Windows. El proyecto declara `npm@10.9.2` pero la maquina corre npm 11.5.1; vale la pena descartar primero esa combinacion turbo 2.9.18 mas npm 11 en Windows.

---

## Requiere revisión (no verificado, no asumir)

_(vacío)_

---

## Revisión de la checklist de lanzamiento de `CLAUDE.md` (2026-08-23)

La sección "Pendiente para Lanzamiento" de `CLAUDE.md` estaba desactualizada y se corrigió. Auditoría ítem por ítem, con la evidencia usada:

| Ítem | Veredicto | Evidencia |
|------|-----------|-----------|
| Verificación de identidad Play Console | **Hecho** | `CHANGELOG.md`: `[4.2.5] 2026-07-17, Stage: Production`. Es requisito bloqueante de Google para publicar en cualquier track |
| Assets de tienda (icon, feature graphic, screenshots) | **Hecho** | Idem: la ficha de tienda es bloqueante para publicar |
| Data Safety Form | **Hecho** | Idem: bloqueante para cualquier actualización desde 2022 |
| APK final verificado en dispositivo | **Hecho** | 4.2.5 / versionCode 65 publicado en Production |
| Animación ritual de hueso (Three.js) | **Hecho** | `three@^0.183.2` instalado y `BoneRitualAnimation.tsx` importado desde `apps/web/src/app/chat/page.tsx:5122`, el flujo real, no solo el preview |
| i18n formal con next-intl | **Obsoleto, no hacer** | `next-intl` no está instalado y la guía oficial ([`WF-I18N-01`](./workflows/00000000-WF-I18N-01-i18n-guide.md)) dice literalmente "**No** usar `next-intl`". El proyecto se estandarizó en `@iching-oracle/i18n` |
| App Expo nativa completa (Fase 2) | **Sigue pendiente** | `apps/mobile/app/index.tsx` sigue siendo un shell WebView. Decisión de producto abierta, no se traslada a este documento |

También se corrigió la tabla de servicios de `CLAUDE.md`, que decía "cuenta creada, verificación pendiente" para Play Console, contradiciendo el estado Production.

**Corolario:** la progresión completa quedó registrada en el changelog como Internal Testing, luego Closed Testing, luego Production. La app está lanzada desde el 2026-07-17; la sección se renombró a "Estado de Lanzamiento".

---

## Resueltos

### P-06 · VACUUM semanal roto desde la migración 070

- **Detectado:** 2026-08-23, logs de Postgres de Supabase (producción).
- **Resuelto:** 2026-08-23. Migración `076_fix_scheduled_vacuum.sql`, commits `4503adff` (staging) y `84a1e4cb` (main). Aplicada en Supabase por el dueño del proyecto, que confirmó el `jobid` 7 devuelto por `cron.schedule` y el gate de migraciones en verde.

**El bug:** la `070` agendó el job con tres sentencias separadas por punto y coma. pg_cron manda el comando por el protocolo de consulta simple, y Postgres envuelve un comando multi-sentencia en un bloque de transacción implícito, donde `VACUUM` no puede correr. Falló con `25001` cada domingo a las 04:00 UTC desde el 2026-06-10 (commit `44c36f6a`), unas once ejecuciones consecutivas. Nunca funcionó ni una vez.

**Impacto real:** bajo. El autovacuum siguió corriendo, y la `052` lo tenía afinado agresivamente sobre `consultations`. Con el volumen de producción de entonces no había bloat que limpiar. El matiz: ese afinado cubre solo `consultations`, así que para `consultation_content` y `consultation_sessions` el job semanal sí era cobertura adicional que no existió.

**Verificación (Postgres 17.11 real, en contenedor):**

1. El comando multi-sentencia de la `070` reproduce el error **exacto** del log de producción: `ERROR: 25001: VACUUM cannot run inside a transaction block`. Reproducido con `psql -c`, que manda varias sentencias como una sola consulta simple, igual que pg_cron.
2. El comando de una sentencia de la `076` ejecuta sin error.
3. El predicado del gate `076` clasifica bien los 4 casos: rechaza la cadena del log, acepta la de la `076`, tolera un punto y coma final y rechaza que falte una tabla.
4. Con `VACUUM (ANALYZE, VERBOSE)`, el comando arreglado recupera **400 tuplas muertas en cada una de las tres tablas**, o sea hace trabajo real, no solo deja de fallar.

**Lección, más valiosa que el bug:** el gate de la `070` solo comprobaba que el job estuviera **registrado**, nunca que corriera, y por eso se quedó en verde once semanas mientras el job moría cada domingo. Un check que pregunta "¿existe?" no prueba "¿funciona?". El check nuevo valida la forma del comando, que es la condición que realmente causa el fallo.

---

_(las entradas resueltas se mueven aquí con fecha y commit, no se borran)_

---

## Mantenimiento

Al agregar una entrada: asignar el siguiente `P-NN`, llenar la fila de la tabla y la sección, y actualizar "Última revisión" arriba. Al resolver: mover a "Resueltos" con fecha y commit.

Revisar el documento completo en cada release, junto con el changelog.
