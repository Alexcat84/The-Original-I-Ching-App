# Pendientes conocidos: no críticos hoy, pero hay que hacerlos

**Código:** `00000000-PLAN-BACKLOG-01 pending-non-critical`
**Estado:** open (documento vivo)
**Creado:** 2026-08-23
**Última revisión:** 2026-08-23 (P-06 resuelto: migración 076 aplicada y verificada contra Postgres real)

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

**Cómo cerrarlo:** viaja en el próximo release normal. Bump correlativo de versión y `versionCode` +1 sobre el último **subido** (actual en repo: 4.2.5 / 65), changelog, y AAB con perfil `staging-aab`. Ver [`00000000-OPS-PLAY-02`](./00000000-OPS-PLAY-02-play-store-versioning.md) y [`00000000-OPS-PLAY-01`](./00000000-OPS-PLAY-01-play-store-changelog.md).

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
