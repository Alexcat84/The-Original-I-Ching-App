# Plan de implementación: P1 de la auditoría profunda (CVEs + test de RLS)

**Código:** `20260716-PLAN-SEC-01 p1-remediation` · **Familia:** SEC · **Estado:** open
**Fecha:** 2026-07-16 · **Motivación:** cerrar los dos hallazgos P1 de `20260715-EXT-SEC-02-full-repo-deep-audit`.
**Verificado contra main (`146bdad9`)** antes de escribir: versiones de CVE, cadenas de padres, e infraestructura de test confirmadas en el repo real.
**Naturaleza:** plan de auditoría externa, transcrito sin alterar contenido (solo codificación).

Dos tickets independientes, en este orden. El A es un fix rápido y de bajo riesgo; el B es el de mayor valor de seguridad y el que más trabajo tiene. Cada uno va en su propia rama, con dry-run, y pasa por auditoría externa antes de mergear, como todo el ciclo.

Invariantes que aplican a ambos: npm@10.9.2 (el `packageManager` declarado, el único que resuelve limpio, AUD-WEB-02). No editar el lockfile a mano. No `--legacy-peer-deps`. El `resolution-guard` debe quedar verde. No mergear nada sin auditoría externa.

---

## Ticket A — Cerrar los 2 CVEs `high` (form-data, ws)

**Rama:** `chore/deps-cve-form-data-ws`

**Contexto verificado:**
- `form-data` 4.0.0-4.0.5 (CRLF injection). Fix: 4.0.6. Único padre en el árbol: `@types/node-fetch` (^4.0.4).
- `ws` 8.0.0-8.20.1 (memory disclosure + DoS). Fix: 8.21.1. Padres: `@supabase/realtime-js` (^8.18.2, runtime web), y herramientas de dev/build de mobile (metro, @expo/cli, react-native, react-devtools-core). En mobile, `ws` vive solo en el árbol de build (metro), NO en el APK que se envía.
- Ambos fixes son **dentro del mismo major**, sobre libs-hoja de API estable, y todos los rangos de los padres los aceptan. Esto es distinto y mucho más seguro que el override de react que descartamos: aquel cruzaba un major hacia un renderer nativo version-locked; estos no tocan nada de eso.

**Pasos:**

1. En los `overrides` de `package.json` raíz, añadir (conservando los existentes):
   ```json
   "form-data": "^4.0.6",
   "ws": "^8.21.1"
   ```
   No añadir override de `react` (invariante de siempre).

2. Regenerar el lockfile con npm@10.9.2:
   ```bash
   npm install --package-lock-only
   ```

3. **GATE — CVEs cerrados:**
   ```bash
   cd apps/web && npm audit --omit=dev --audit-level=high
   ```
   Debe reportar 0 `high` y 0 `critical`. (Antes: 2 high.)

4. **GATE — split de react intacto:**
   ```bash
   node .github/scripts/check-react-resolution.mjs
   ```
   Debe salir verde: web en 18.x, mobile en 19.2.3. Si cambió, PARAR.

5. **GATE — resolución sin ERESOLVE:** confirmar que el `npm install --package-lock-only` salió exit 0 y que `form-data` y `ws` resuelven a las versiones parcheadas en el lockfile (grep del lockfile por las dos entradas).

6. **Stretch opcional en el mismo PR:** las 8 `moderate` restantes. Correr `npm audit --omit=dev` y, para las que sean transitivas con fix dentro del major, añadir su override igual. NO forzar ninguna que implique un cambio de major o que el `resolution-guard` marque en rojo; esas se documentan y se dejan.

7. Sin rebuild de mobile: `ws` no está en el APK enviado (es build-tooling), así que este cambio no requiere smoke en dispositivo. Sí confirmar que el job `ci` completo queda verde (incluye typecheck y build de web).

8. Commitear el `package-lock.json` actualizado. Push. Reportar la rama para auditoría externa. No mergear.

**Verificación externa (auditor):** contrasta que `npm audit` da 0 high, que los overrides son within-major, que el guard sigue verde y que mobile no se movió, antes de dar luz verde al merge.

---

## Ticket B — Test de integración de RLS (el P1 de más valor)

**Rama:** `feat/rls-integration-test`

**Por qué integración y no unit:** RLS lo enforce Postgres, no el código de la app. No se puede mockear. El test tiene que correr contra una base real con las policies aplicadas, autenticado como dos usuarios distintos, y confirmar que el usuario B no puede ver ni tocar las filas del usuario A.

**Infraestructura verificada (ya existe, no hay que crearla):**
- `supabase/config.toml`: Postgres 17 en el puerto 54322, API en 54321, migraciones y seed activados. `supabase db reset` aplica las 74 migraciones + seed a una base local.
- Runner: `vitest ^3.0.5` (script `test`). Ya usan configs de vitest separadas por proyecto (patrón `vitest.exhaustive.config.ts`), así que el test de RLS va en su propia config para no correr en el pase rápido de unit tests que no tiene DB.

**Policies a cubrir (todas `(select auth.uid()) = user_id`, verificadas en migraciones 001/004/007/060):**
`consultations`, `consultation_sessions`, `query_credits`, `users` (por `id`), `consultation_notes`, `pattern_analyses`, `two_factor_recovery_codes`, `two_factor_attempts`, `two_factor_email_codes`.

**Pasos:**

1. Crear `apps/web/vitest.rls.config.ts`: solo recoge `**/*.rls.test.ts`, timeout amplio (la DB tarda), sin el setup de los unit tests. Añadir script en `apps/web/package.json`: `"test:rls": "vitest run --config vitest.rls.config.ts"`.

2. Crear un helper de test (`apps/web/src/__tests__/rls/harness.ts`) que:
   - Lea `SUPABASE_URL` (http://localhost:54321), la `anon key` y la `service_role key` del entorno local (de `supabase status`; documentar que se toman de ahí, nunca hardcodear la service_role).
   - Con la service_role, cree dos usuarios de auth (A y B) vía `auth.admin.createUser`, y obtenga una sesión/JWT para cada uno.
   - Exponga tres clientes: `asA` y `asB` (cliente anon autenticado como cada usuario, para que `auth.uid()` resuelva a su id) y `anon` (sin autenticar).
   - Limpie A y B al final (`auth.admin.deleteUser`), para que el test sea repetible.

3. Crear `apps/web/src/__tests__/rls/cross-user-isolation.rls.test.ts`. Para CADA tabla scoped, con una fila sembrada como propiedad de A (sembrar vía service_role o como A):
   - **Control positivo:** `asA` lee su propia fila → la obtiene. (Confirma que la policy no es demasiado restrictiva.)
   - **Aislamiento de lectura (el crítico):** `asB` hace SELECT de las filas de A → devuelve **vacío**, no error (RLS filtra en silencio).
   - **Aislamiento de escritura:** `asB` intenta UPDATE y DELETE de la fila de A → 0 filas afectadas o rechazo.
   - **Sin sesión:** el cliente `anon` no puede leer ninguna fila.
   - Priorizar como casos de carga: `query_credits` (es el balance de tokens, o sea dinero) y `consultations` / `consultation_notes` (contenido privado del oráculo). Si algo va a romperse silenciosamente en producción, es más grave ahí.

4. **Correr local:**
   ```bash
   supabase db reset      # aplica migraciones + seed a la base local
   cd apps/web && npm run test:rls
   ```
   Debe salir verde: todos los controles positivos pasan, y TODAS las aserciones de aislamiento (B no ve/no toca lo de A, anon no ve nada) pasan.

5. **CI (patrón del resolution-guard):** añadir un job `rls-test`, **no bloqueante al principio** (`continue-on-error: true`, con el comentario "flip to blocking once trusted", igual que el guard). El job: instala la CLI de Supabase, `supabase db start` + `supabase db reset`, corre `npm run test:rls`, y reporta versiones de node/npm/supabase. Cuando haya corrido verde varias veces, se hace bloqueante en un cambio aparte (decisión del owner, como el guard).

6. Registrar un doc corto en `docs/auditorias/` (convención de nombres) que declare qué garantiza el test (aislamiento cross-user en las tablas scoped) y cómo correrlo local. Cruzar en `registry.json` con `EXT-SEC-02`.

7. Push. Reportar la rama para auditoría externa. No mergear.

**Verificación externa (auditor):** el foco no es que el test corra, sino que **realmente asserte la negación cross-user**. Un test de RLS que siembra mal, o que autentica ambos clientes como el mismo usuario, o que confunde "vacío" con "error", pasa en verde sin probar nada. Se leerá el harness y las aserciones contra las policies reales (que `auth.uid()` resuelva a ids distintos para A y B, que el SELECT de B espere longitud 0 y no un throw, que `query_credits` y `consultations` estén entre los casos). Ese es el punto ciego de este tipo de test y donde va el foco.

---

## Secuencia y encaje

- **Ticket A primero:** es rápido, mecánico, y cierra los 2 high. Bajo consumo.
- **Ticket B después:** más trabajo (harness + casos + job de CI), pero es el que cierra el único hueco real de verificación de seguridad del proyecto.
- Ambos son independientes: un PR no bloquea al otro. Se pueden solapar (avanzar B mientras se audita A).
- Ninguno toca `apps/mobile` en su artefacto ni el ciclo SDK 57. El override de `ws` roza el árbol de build de mobile pero no el APK.

## Restricciones duras (ambos tickets)
- npm@10.9.2. Lockfile sin editar a mano. Sin `--legacy-peer-deps`.
- `resolution-guard` verde (web 18.x / mobile 19.2.3).
- No mergear sin auditoría externa. El merge final lo aprueba Alexis.
