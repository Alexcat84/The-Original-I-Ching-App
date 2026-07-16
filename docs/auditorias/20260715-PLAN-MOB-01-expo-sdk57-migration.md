# Plan: migración apps/mobile a Expo SDK 57 (target API 36), paso a paso

**Código:** `20260715-PLAN-MOB-01 expo-sdk57-migration` · **Familia:** MOB · **Estado:** open

- **Fecha:** 2026-07-15
- **Evaluación previa (obligatoria):** [`20260715-AUD-MOB-01-expo-sdk57-upgrade-assessment.md`](./20260715-AUD-MOB-01-expo-sdk57-upgrade-assessment.md)
- **Rama:** `chore/expo-sdk57` (desde `main` verde). **No se mergea nada sin verificación externa.**
- **Deadline duro:** Play exige target API 36 para toda actualización desde el **2026-08-31**.
- **Restricciones:** NO tocar `apps/web` ni `packages/ui` (react 18.2.0 intacto). NO editar el lockfile a mano. NO usar `--legacy-peer-deps`. React 19 web y Next 16 siguen pausados y fuera de alcance.

---

## Resumen de fases y gates

| Fase | Qué | Gate de salida |
|---|---|---|
| 1 | Bumps vía `expo install --fix` + config | package.json alineado al SDK 57 |
| 2 | Overrides raíz + resolution-guard | guard deriva mobile de package.json |
| 3 | Install + GATE fail-closed | web intacto 18.2.0, mobile 19.2.3 |
| 4 | tsc --noEmit mobile | verde (gate del commit de bumps) |
| 5 | Build local + smoke en dispositivo | checklist completo verificado |
| 6 | CI verde (incluido guard) | PR checks en verde |
| 7 | Rollout Play por etapas | closed testing, luego production 10% |

---

## Fase 1: bumps

Todos los paquetes del SDK vía Expo, nunca a mano uno por uno:

```bash
cd apps/mobile
npx expo install expo@^57 --fix
```

Estado real observado en el dry-run (2026-07-15): el comando **edita `package.json` correctamente** (react 19.2.3, react-native 0.86.0, react-native-webview 13.16.1, todos los `expo-*` a 57.x) pero su `npm install` interno corre con el npm del PATH. Con npm 11.x falla con el ERESOLVE conocido (AUD-WEB-02 §1): **ignorar ese fallo del paso interno** (las ediciones persisten) y hacer el install en Fase 3 con npm@10.9.2. Alinear también lo que el `--fix` interrumpido no tocó:

```diff
apps/mobile/package.json
-    "@sentry/react-native": "^6.22.0",
+    "@sentry/react-native": "~7.11.0",
```

(`~7.11.0` es la versión bundled del SDK 57 según `bundledNativeModules.json`; la línea 6.x tiene fricción conocida con SDK 57.)

Config (aplicado en la rama):

```diff
apps/mobile/app.config.js
-  newArchEnabled: false,
+  // New Architecture is mandatory since RN 0.82 / Expo SDK 55; SDK 57 (RN 0.86)
+  // has no legacy option. See docs/auditorias/20260715-AUD-MOB-01.
+  newArchEnabled: true,
```

```diff
apps/mobile/app.config.js (expo-build-properties)
         android: {
-          compileSdkVersion: 35,
-          targetSdkVersion: 35,
-          buildToolsVersion: "35.0.0",
+          // No SDK pins: Expo SDK 57 defaults to compile/target API 36 (Android 16),
+          // which is the Play requirement for updates from 2026-08-31. Pinning 35
+          // here would silently defeat the whole migration.
           enableProguardInReleaseBuilds: true,
           enableShrinkResourcesInReleaseBuilds: true,
         },
```

## Fase 2: overrides raíz + resolution-guard

Override load-bearing de `expo-app-integrity` (AUD-WEB-02 §2.a) remapeado a las versiones nuevas. Camino elegido en el assessment: (a) mantener la lib.

```diff
package.json (raíz, overrides)
     "expo-app-integrity": {
-      "expo-build-properties": "~0.14.8",
-      "expo-secure-store": "~14.2.4",
-      "expo-device": "~7.1.4"
+      "expo-build-properties": "~57.0.5",
+      "expo-secure-store": "~57.0.1",
+      "expo-device": "~57.0.1"
     }
```

`resolution-guard` (`.github/scripts/check-react-resolution.mjs`): la aserción `mobile === "19.0.0"` hardcodeada pasa a derivarse del react declarado en `apps/mobile/package.json`, así el guard sobrevive futuros bumps de SDK sin ediciones. La aserción del web en 18.x queda intacta. (Aplicado en la rama.)

## Fase 3: install + GATE fail-closed

```bash
# desde la raíz; npm@10.9.2 es el packageManager declarado y el único
# que resuelve el árbol limpio (AUD-WEB-02 §1)
npx --yes npm@10.9.2 install
```

**GATE (parar si falla):**
- `apps/web` resuelve react **18.2.0** y react-dom **18.2.0** (intactos).
- `apps/mobile` resuelve react **19.2.3** (el del SDK).
- Sin `invalid` en `npm ls react react-dom`.
- **Si web se movió: PARAR y reportar. No continuar.**

Commitear el `package-lock.json` regenerado por npm@10.9.2 en el mismo commit de bumps (Vercel y EAS instalan con `npm ci`, que no re-resuelve).

## Fase 4: typecheck (gate del commit de bumps)

```bash
cd apps/mobile && npx tsc --noEmit
```

Lección del incidente @types/three: el typecheck corre sobre **cada commit que toca dependencias**, no solo sobre el build. Con react 19.2.3, `@types/react` queda en la línea que el SDK indique (verificar con `npx expo install --check`).

## Fase 5: build local + smoke en dispositivo físico

**Pre-check obligatorio (auditoría externa 2026-07-15), antes del smoke:**

```bash
grep -rl "absoluteFillObject" node_modules --include="*.js" | head
```

Motivo (verificado contra el tarball de npm): `StyleSheet.absoluteFillObject` **no existe en NINGUNA parte de react-native 0.86.0** (ni runtime ni tipos). El spread de `undefined` es **silencioso**: cualquier dependencia de terceros que lo use se rompería visualmente sin error. Nuestros 2 usos propios ya se reemplazaron por el valor literal en el dry-run; este grep confirma que ninguna dep del árbol lo referencia. Revisar cada hit que aparezca (hits en el propio `react-native/Libraries` serían del shim de compat si existiera; hits en libs de terceros requieren evaluación caso a caso).

**Gate de bundle (ejecutado 2026-07-15, ANTES del build nativo):** `npx expo export --platform android --no-bytecode` y verificar el bundle con el discriminador `absoluteFillObject` (existe en RN 0.79.6, no existe en 0.86.0). Resultado del dry-run: el primer export contenía la StyleSheet de **0.79.6** (mezcla JS 0.79.6 / nativo 0.86.0, crash garantizado). Causa: el lockfile mantiene un `react-native@0.79.6` huérfano en el root (placeholder del peer `react-native@"*"` de expo hoisteado; 0.86.0 no puede vivir ahí porque su peer `react@^19.2` choca con el `react@18.2.0` del root, que es del web). Los colapsos npm-nativos (update / install+uninstall temporal) no pueden arreglar esa forma. **Fix aplicado:** extender el `resolveRequest` de `metro.config.js` (que ya forzaba `react` singleton) para forzar también `react-native` y `react-native/*` a la copia anidada de mobile. Re-export verificado: discriminador en 0, instancia RN única. El mismo config aplica en EAS.

**INVARIANTE de builds (corregido 2026-07-15 tras desvío; precisado tras crash del primer APK):** el APK de smoke/staging se genera **SIEMPRE local** con `assembleRelease` y el `.env` **volteado a PREVIEW/staging siguiendo la convención auto-documentada del propio archivo** (`# PREVIEW = staging | PRODUCTION = comentado`): voltear TODOS los pares (Supabase URL+anon key, API_URL, APP_ENV/MOBILE_API_MODE), no solo la API_URL. El primer APK del dry-run se construyó con un `.env` de solo el flag de Metro y **crasheó al abrir**: `index.tsx` lanza throw al cargar si faltan las vars de Supabase, antes de que Sentry (también sin DSN) pueda reportar. Con el par de Supabase de producción tampoco sirve: el intercambio de sesión PKCE nativo↔web se rompe (proyectos Supabase distintos entre staging y producción). **EAS es solo la vía del AAB de producción (Fase 7).** El perfil `preview` de EAS NO fija esa variable y las env del dashboard apuntan a producción: un APK de EAS preview sale con la **URL de producción embebida**; nunca correr con él ítems del smoke que escriben (compra sandbox, consulta). El build EAS `19a6241c` del dry-run se conserva únicamente como **gate de compilación de SDK 57 en Linux** (dato útil para Fase 7): no instalar, no loguear, no smoke. Confirmado por runbook RUN-SUP-03 (instala desde `android/app/build/outputs/apk/release/`).

**Restriccion Windows del `assembleRelease` local: MAX_PATH.** Los object paths del codegen new-arch embeben la ruta fuente completa y superan los 260 caracteres (`ninja: error: Filename longer than 260 characters`; tambien se manifiesta como el loop `manifest build.ninja still dirty`). Orden de remediacion:
1. **`git worktree` en ruta fisica corta del MISMO disco** (`C:\w\iching-app`): ataca MAX_PATH por acortamiento real y evita el fallo de Metro del intento con `subst` (los realpaths de los symlinks del workspace se quedan en C:). El `.env` del worktree lleva SOLO `EXPO_NO_METRO_WORKSPACE_ROOT=1` (sin API URL: fallback staging).
2. Si aun excede 260: `LongPathsEnabled=1` en el registro + `git config core.longpaths true`; ultimo recurso, `buildDir` corto en gradle.
3. Solo si el local sigue bloqueado: perfil NUEVO `preview-staging` en `eas.json` con `"env": { "EXPO_PUBLIC_API_URL": "<URL staging>" }` explicito (sin tocar `production`), verificando en la pagina del build que variable se uso y en la app que carga staging, ANTES de cualquier item del smoke que escriba.

Nota del intento con `subst` (descartado): el C++ compilo pero el bundle JS fallo (symlinks del workspace resuelven a realpath C:\ fuera de los watchFolders de Metro; el soporte realpath con `fs.realpathSync.native` quedo en metro.config.js, inofensivo fuera de subst).

Nota Windows: el fix de `glob` en `@expo/config-plugins` (CLAUDE.md) quedó **obsoleto** en SDK 57 (config-plugins 10.1.2 lo arregló upstream); `expo prebuild --clean` corre limpio sin él.

```bash
cd apps/mobile
npx expo prebuild --platform android --clean   # regenera android/ para SDK 57 (newArch, API 36)
cd android
./gradlew --stop   # el daemon no relee env vars
./gradlew assembleRelease
# salida: android/app/build/outputs/apk/release/app-release.apk
```

Primer build = gate de `expo-app-integrity` (si su Gradle de 2023 fricción con el AGP de RN 0.86, activar camino (b): fork con patch menor del build.gradle).

**Checklist de smoke (cada ítem verificado en dispositivo, no asumido):**

- [ ] Arranque en frío con caché limpia (app recién instalada, sin estado).
- [ ] Login con PKCE e inyección de sesión (`__rnInjectSession`).
- [ ] OAuth Google: intercepción a browser externo y retorno por deep link `theoriginaliching://auth/callback`.
- [ ] Deep link de RevenueCat (`rc-340e77bf41`).
- [ ] Compra sandbox de un token pack (Billing 8.3.0). **Criterio en staging (verificado 2026-07-16):** la acreditación de tokens NO ocurre por diseño (webhook fail-closed, SEC-01 + hardening 2026-07-12; `REVENUECAT_ALLOW_TEST_EVENTS="false"` en Preview). El PASS es el log `webhook_non_production_event_skipped` con `environment=SANDBOX` en Axiom: prueba Billing 8.3 + RC SDK + entrega/auth del webhook + política aplicada. Acreditación real solo con el flag temporal en Preview (decisión del owner) o en producción real.
- [ ] Verificación de integrity token (Play Integrity attest + backend verify). **Criterio con APK sideloaded (verificado 2026-07-16):** `integrity_check_failed` ES el PASS de seguridad: el APK de smoke no es oficial (debug keystore, no instalado via Play) y el sistema lo rechaza correctamente en staging y producción (el enforcement corre donde llegue `x-integrity-token`; sin relajación por entorno). Ademas valida que `expo-app-integrity` bajo New Architecture obtiene token de Google y lo entrega end-to-end. El verdict PASSED completo se valida en closed testing (instalación via Play, firma oficial).
- [ ] Consulta completa al oráculo con streaming SSE (texto llega incremental). **Nota:** bloqueada en APK sideloaded por el punto anterior; para probarla pre-Play se requiere `INTEGRITY_FAIL_OPEN=true` temporal en Preview (decisión del owner, revertir al terminar) o validarla en closed testing.
- [ ] Signout con `rn_signout=1`.
- [ ] Safe areas y edge-to-edge (status bar, insets, drawer; target 36 sin opt-out).
- [ ] Navegación back (WebView history + predictive back de Android 16).
- [ ] Origin guard: navegar a URL externa desde el chat y confirmar bloqueo cross-origin.
- [ ] Clase `iching-rn-webview` presente tras hidratación (tema app en docs, CSS inyectado).
- [ ] Export PDF, descarga de imagen, zoom modal.
- [ ] SQLite cache: sidebar instantáneo offline, sync incremental.

**Estado de `expo doctor`: 20/20 (resuelto 2026-07-16).** La deuda de duplicados se cerro en cuatro movimientos, todos verificados con el resolution-guard (web react 18.2.0 intacto) y el gate de bundle (RN 0.86 unico):
1. Cadenas huerfanas de la era SDK 53 en el root (expo-device/secure-store/build-properties, y la cadena expo-router 5.1.11 -> expo-linking 7.1.7 -> expo-constants 17.1.8 que ademas retenia al react-native 0.79.6) colapsadas a 57.x con `npm update` dirigido. Efecto lateral positivo: el root quedo con react-native 0.86.0 (ya no hay mixed-RN en el arbol).
2. `react-native-screens` (4.25.2) y `react-native-safe-area-context` (~5.7.0) pinneados por override raiz a las versiones bundled del SDK (libs exclusivas de mobile, cero impacto web). **Mantenimiento: actualizar estos dos overrides en cada bump de SDK** (el propio doctor avisa si quedan desalineados).
3. `expo.autolinking.exclude: ["react"]` en apps/mobile/package.json: react no tiene modulo nativo, excluirlo del scan de autolinking es inerte para el build (verificado con expo config + gate de bundle). Era el unico flag estructural restante (split react 18 web / 19 mobile, AUD-WEB-02) y desaparece de verdad con Next 16.
4. metro.config.js: los targets del singleton (react/react-native) ahora se resuelven dinamicamente con `require.resolve` desde el projectRoot, robusto ante re-hoisting del arbol (el colapso del punto 1 movio react-native al root y el path anidado hardcodeado rompia el bundle).
Nota operativa: los `npm update` dirigidos + overrides son la via correcta para colapsar orphans; `npm dedupe` completo ERESOLVE por el split react y no debe usarse.

## Fase 6: CI

PR de la rama: job `ci` + `resolution-guard` (actualizado) en verde. El guard ahora valida web 18.x + mobile igual a lo declarado (19.2.3).

## Fase 7: rollout en Play (por etapas, con deadline el 2026-08-31)

1. Bump `versionCode` (+1 sobre el último usado) y `version` en `app.config.js`; `npm run changelog:update`.
2. `eas build --platform android --profile staging-aab` (AAB para Play; NUNCA el profile `preview` para Play Console).
3. Subir a **closed testing** primero. Revisar el **pre-launch report** de Play (crashes en dispositivos de Google con Android 16).
4. Solo con closed testing limpio: promover a **production con staged rollout 10%** inicial; subir gradualmente.
5. **Rollback documentado:** halt del staged rollout en Play Console + el AAB anterior sigue disponible en el track para re-promoción. El backend no cambia (el APK viejo sigue funcionando contra producción).

**Timeline con colchón:**

| Fecha objetivo | Hito |
|---|---|
| ~2026-08-10 | AAB en closed testing, pre-launch report revisado |
| ~2026-08-20 | Production staged rollout iniciado |
| 2026-08-31 | Deadline Play (margen real: ~10 días) |

## Bitacora de ejecucion (dry-run + Fases 5-6, 2026-07-15/16)

Registro cronologico de cada problema encontrado, su solucion y evidencia. Complementa las notas por fase.

| # | Problema | Causa | Solucion | Evidencia/estado |
|---|---|---|---|---|
| 1 | `expo install --fix` fallo en su npm interno | npm 11 del PATH (ERESOLVE conocido, AUD-WEB-02) | Ignorar el fallo interno (las ediciones de package.json persisten) + install con npm@10.9.2 | Fase 1; gate verde |
| 2 | `--fix` interrumpido dejo sentry 6.22 y @types/react 19.0 | El multi-paso quedo cortado por #1 | Alinear a mano: sentry ~7.11.0 (bundled), @types/react ~19.2.0 (peer de virtualized-lists 0.86) | tsc verde |
| 3 | tsc: `StyleSheet.absoluteFillObject` inexistente (2 sitios) y `expo-file-system` clasico (2 imports) | RN 0.86 elimino el simbolo POR COMPLETO (runtime y tipos, verificado contra tarball); SDK 54+ movio la API clasica a `/legacy` | Valor literal en los 2 sitios; imports a `expo-file-system/legacy` | tsc verde; pre-check de terceros en Fase 5 |
| 4 | Bundle de Metro contenia la StyleSheet de RN 0.79.6 (mezcla JS viejo / nativo nuevo) | Orphan `react-native@0.79.6` en root (placeholder del peer de expo; 0.86 no podia vivir ahi por el react 18 del web); libs hoisteadas resolvian el viejo | `resolveRequest` de metro.config extendido a `react-native` (singleton); luego targets dinamicos (#12) | Discriminador `absoluteFillObject` = 0 en TODO artefacto entregado |
| 5 | Colapsos npm-nativos del orphan RN fallaron (update / install+uninstall temporal) | `react-native@0.86` peer `react@^19.2` choca con root `react@18.2.0` (del web) | Aceptado + fix de Metro (#4); despues el colapso de la cadena expo-router vieja lo libero solo (#11) | Root RN hoy: 0.86.0 |
| 6 | `assembleRelease` local: loop `build.ninja still dirty` y luego `Filename longer than 260 characters` | MAX_PATH de Windows: los object paths del codegen new-arch embeben la ruta fuente completa | `subst X:` fallo (symlinks workspace a realpath C:); git worktree en `C:\\w\\iching-app` (ruta corta real, mismo disco) SI funciono | BUILD SUCCESSFUL 7m15s; orden de remediacion en Fase 5 |
| 7 | Primer APK de smoke crasheaba al abrir | Error del agente: .env del worktree solo con el flag de Metro; `index.tsx` lanza throw sin las vars de Supabase (antes de que Sentry, sin DSN, reporte) | Voltear TODOS los pares PREVIEW/staging del .env (convencion auto-documentada del archivo) | APK v2 verificado: Supabase staging in, prod out, Sentry/RC in |
| 8 | Compra sandbox sin tokens (2 cuentas) | Politica fail-closed del webhook (SEC-01 + hardening 2026-07-12) + `REVENUECAT_ALLOW_TEST_EVENTS="false"` en Preview | Diseno anti-intrusion funcionando; PASS = log `webhook_non_production_event_skipped` en Axiom (Billing 8.3 + RC SDK + webhook end-to-end probados) | Criterio en checklist Fase 5 |
| 9 | `integrity_check_failed` en consulta | APK sideloaded con debug keystore = build NO oficial; Play Integrity lo rechaza (enforcement donde llegue el header, staging incluido) | Es el PASS de seguridad; consulta/SSE se desbloquea con instalacion via Play | Criterio en checklist Fase 5 |
| 10 | Casi-incidente: AAB de EAS preview habria salido apuntando a PRODUCCION | Perfiles sin env pinneado; dashboard EAS + .env local = produccion; causa raiz documental: linea vieja de CLAUDE.md | Build cancelado a tiempo; perfil `internal-staging-aab` (extends staging-aab) con el quinteto staging pinneado en eas.json; invariante corregido en CLAUDE.md/memoria | Nombre REAL del perfil del fallback de Fase 5.3 |
| 11 | expo doctor 18/20 en logs de EAS | (a) typescript 5.8 vs ~6.0.3; (b) cadenas orphan SDK-53 en root (expo-router 5.1.11 -> expo-linking 7.1.7 -> expo-constants 17.1.8, que retenia al RN 0.79.6); (c) screens/safe-area root en latest vs bundled; (d) react 18/19 estructural | (a) bump ts; (b) `npm update` dirigido colapso las cadenas (y libero RN: root 0.86.0); (c) overrides raiz pinneando bundled (actualizar en cada bump de SDK); (d) `expo.autolinking.exclude: ["react"]`, inerte (react no tiene modulo nativo; verificado con expo config + gate de bundle) | 20/20; detalle en nota pre-Fase 6 |
| 12 | El colapso #11 rompio el bundle (`Unable to resolve react-native`) | El target hardcodeado de Metro apuntaba al RN anidado que ya no existia | Targets del singleton resueltos dinamicamente (`require.resolve` desde projectRoot) | Gate de bundle verde; robusto ante re-hoisting |
| 13 | Version 4.3.0 asignada por habito semver | El esquema del proyecto es CORRELATIVO PURO (4.2.2 -> 4.2.3; solo tras un 9 evoluciona el siguiente digito) | Corregido a 4.2.3 (versionCode 63 reutilizable: nunca se subio); doc [`00000000-OPS-PLAY-02`](../00000000-OPS-PLAY-02-play-store-versioning.md) + memoria | AAB 4.3.0 descartado sin subir |

| 14 | PROD: `No se pudo guardar el archivo` al descargar imagen (post-release 4.2.4) | El entry default de `expo-media-library` en SDK 57 es la API next SOLamente: `saveToLibraryAsync`/`usePermissions` clasicos viven en `/legacy`. tsc NO lo detecta porque los types del entry (`build/index.d.ts`) siguen anunciando la API clasica mientras el runtime (`src/index.ts`) es next-only: los tipos mienten | Import a `expo-media-library/legacy` (mismo patron que expo-file-system, #3). Barrido preventivo: NINGUNA otra lib expo en uso tiene split next/legacy. Evidencia Axiom: `GET /api/image-proxy 200` a las 19:16 UTC exactas del reporte del usuario (backend sano; fallo 100% nativo). Leccion: en libs con split de entries, verificar el RUNTIME export, no solo tsc | Fix en 4.2.5/65; item del checklist "descarga de imagen" quedo sin ejecutar en el smoke de internal (leccion: checklist completo antes de prod) |

### Registro de builds del dry-run

| Build | Perfil | Version | Proposito | Estado |
|---|---|---|---|---|
| local worktree | assembleRelease arm64 | 4.2.2/62 (APK v1) | smoke sideloaded | crasheo (#7), superseded |
| local worktree | assembleRelease arm64 | 4.2.2/62 (APK v2) | smoke sideloaded | OK; smoke parcial ejecutado (#8, #9) |
| `19a6241c` | preview (EAS) | 4.2.2/62 | (desvio #10) | conservado SOLO como gate de compilacion Linux SDK 57: finished. NO instalar |
| `a1bda5d7` | staging-aab (EAS) | 4.3.0/63 | AAB internal (apuntaba a prod) | cancelado a tiempo (#10) |
| `e20c2274` | internal-staging-aab | 4.3.0/63 | AAB internal staging | finished; descartado sin subir (#13) |
| `e18dd705` | internal-staging-aab | 4.2.3/63 | AAB internal staging | finished; superseded por el arbol limpio |
| `3fd83049` | internal-staging-aab | 4.2.3/63 FINAL | AAB internal testing | finished; artefacto verificado (staging in, prod out, RN 0.86 unico); logs con doctor 20/20; entregado para subir |
| `9be080ed` | staging-aab | 4.2.4/64 PRODUCCION | release de produccion | finished; verificacion inversa OK (Supabase prod in, staging OUT, RN 0.86 unico); entregado para staged rollout |
| (pendiente) | staging-aab | 4.2.5/65 | fix descarga imagen (media-library legacy) | en preparacion |

### Anatomia del tamano del AAB (consulta del owner, 2026-07-16)

El AAB pesa ~82 MB pero el usuario descarga 24.7 MB (+6.98 vs release anterior, esperado): el archivo empaqueta 92.9 MB de simbolos de debug + 73.5 MB de mapas de ofuscacion (BUNDLE-METADATA, solo para Play Console) y las 4 ABIs (~87 MB de nativo). El crecimiento por usuario viene de New Architecture (`libreactnative` con Fabric/TurboModules, `libappmodules.so` 4.1 MB y `react_codegen_*` que no existian en arquitectura vieja), la alineacion 16 KB de API 36 y el core RN 0.86. Proguard/R8 + shrinkResources ya activos; sin optimizacion pendiente.

### Estado final al cierre de la bitacora (2026-07-16)

- Rama `chore/expo-sdk57` mergeada a staging en cada hito; worktree `C:\\w\\iching-app` sincronizado.
- PR #7 a main abierto y verde (ci + resolution-guard + Vercel); marcado NO mergear hasta el smoke via Play.
- CERRADO 2026-07-16: internal testing subido (63 quemado), smoke via Play OK (integrity PASS, consulta/SSE OK), **PR #7 mergeado a main** (7674362d), release 4.2.4/64 buildeado desde main y verificado. Pendiente (usuario): subir 4.2.4/64 a Production con staged rollout 10% + pegar notas de los 11 idiomas (OPS-PLAY-01) + monitorear Sentry/pre-launch.
- Verificacion pendiente menor: entrega de eventos de Sentry 7.x en runtime (se cubre de facto en el smoke de internal testing).

## Rollback (pre-merge)

- Todo vive en `chore/expo-sdk57`; si un gate falla, no se mergea.
- `apps/web`/`packages/ui` nunca se tocan: cero rollback web.
- Si ya está mergeado y el APK nuevo falla en producción: halt del rollout (Fase 7.5); el código en main no afecta al APK viejo ya distribuido.

## Checklist de archivos tocados

- [x] `apps/mobile/package.json` (bumps SDK 57 + sentry ~7.11.0 + @types/react ~19.2.0)
- [x] `apps/mobile/app.config.js` (newArchEnabled true; sin pins de SDK)
- [x] `apps/mobile/metro.config.js` (singleton react-native, ver gate de bundle en Fase 5)
- [x] `apps/mobile/app/index.tsx` + `src/sync/image-sync.ts` (absoluteFillObject literal; expo-file-system/legacy)
- [x] `package.json` raíz (override expo-app-integrity a ~57.x)
- [x] `.github/scripts/check-react-resolution.mjs` (mobile derivado de package.json)
- [x] `package-lock.json` (regenerado por npm@10.9.2, nunca a mano)
- [x] `CLAUDE.md` (nota: fix de glob obsoleto desde SDK 57)
- [ ] `apps/mobile` versionCode/version (Fase 7, al preparar el AAB)

**No tocar:** `apps/web/**`, `packages/ui/**`, migraciones DB, product IDs RevenueCat.
