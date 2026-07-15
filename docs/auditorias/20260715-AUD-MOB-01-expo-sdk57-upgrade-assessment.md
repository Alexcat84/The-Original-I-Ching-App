# Evaluación: migración apps/mobile a Expo SDK 57 (target API 36)

**Código:** `20260715-AUD-MOB-01 expo-sdk57-upgrade-assessment` · **Familia:** MOB · **Estado:** open

- **Fecha:** 2026-07-15
- **Motivo (deadline duro):** la política de Google Play anunciada el 15 de julio de 2026 exige **target API 36 (Android 16)** para toda app nueva y toda actualización enviada a partir del **2026-08-31** (extensión solicitable hasta 2026-11-01). Hoy `targetSdkVersion: 35`: la app cumple disponibilidad (no se cae de la tienda), pero sin subir **no se podrá publicar ni un bugfix** después de esa fecha.
- **Alcance:** SOLO `apps/mobile` + `overrides` raíz + `resolution-guard`. **NO se toca `apps/web` ni `packages/ui`** (quedan en react 18.2.0). Es el espejo exacto de la invariante protegida en [`20260713-AUD-WEB-02`](./20260713-AUD-WEB-02-monorepo-resolution-blocker.md), ahora al revés.
- **Plan asociado:** [`20260715-PLAN-MOB-01-expo-sdk57-migration.md`](./20260715-PLAN-MOB-01-expo-sdk57-migration.md)
- **Fuentes:** verificado contra npm registry (`npm view`), `bundledNativeModules.json` del tag `sdk-57` de expo/expo, changelog oficial de Expo SDK 57, releases de react-native-webview, blog de ingeniería de RevenueCat, documentación de Google Play sobre target API, y el código real de `expo-app-integrity` en `node_modules`. No de memoria.

---

## 0. Veredicto

**Viable dentro del plazo, con un cambio estructural obligatorio (New Architecture) y un candidato a blocker que resultó benigno (`expo-app-integrity`, camino "mantener con override" recomendado).** El salto es grande (4 majors de SDK, RN 0.79 a 0.86, react 19.0.0 a 19.2.3) pero el ecosistema del proyecto es pequeño y todo lo crítico tiene versión compatible publicada. El riesgo se concentra en dos puntos: la activación de New Architecture (afecta a todo módulo nativo) y el bump del WebView (toda la app es ese bridge). Ambos se cierran con el smoke en dispositivo físico del plan.

### Decisión ya tomada (documentada, no reevaluada): salto directo a SDK 57

- No se pasa por SDK 54: serían **dos migraciones grandes** en vez de una, y 54 nacería ya **tres majors desactualizado** (los SDK 55, 56 y 57 existen y 57 es el actual).
- El esfuerzo dominante (activar New Architecture, obligatoria desde SDK 55) es idéntico en 54+newArch que en 57: pagarlo dos veces no tiene retorno.
- SDK 57 es además la línea que Expo mantiene activamente hoy (react-native-webview 13.16.1, sentry 7.x, fixes de edge-to-edge en Android).

---

## 1. Matriz de versiones (verificada)

| Paquete | Hoy (SDK 53) | SDK 57 (bundled/objetivo) | Fuente |
|---|---|---|---|
| expo | ^53 (53.0.27) | **57.0.6** (último patch al 2026-07-15) | npm |
| react | 19.0.0 | **19.2.3** | bundledNativeModules sdk-57 |
| react-native | 0.79.6 | **0.86.0** | bundledNativeModules sdk-57 |
| react-native-webview | 13.13.5 | **13.16.1** | bundledNativeModules sdk-57 |
| expo-device | ~7.1.4 | **~57.0.1** | npm (versionado unificado del SDK) |
| expo-secure-store | ~14.2.4 | **~57.0.1** | npm |
| expo-build-properties | ~0.14.8 | **~57.0.5** | npm |
| expo-router | ~5.1.11 | **~57.0.6** | npm |
| expo-sqlite | ~15.2.14 | **~57.0.1** | npm |
| expo-linking / expo-localization | ~7.1.7 / ~16.1.6 | **~57.0.3 / ~57.0.1** | npm |
| @sentry/react-native | ^6.22.0 | **~7.11.0** (major 6 a 7) | bundledNativeModules sdk-57 |
| react-native-purchases | ^10.4.0 | **10.4.2** (misma línea 10.x) | npm |
| react-native-edge-to-edge | ^1.6.0 | 1.8.1 (latest; ver §5) | npm |
| expo-app-integrity | ^0.3.0 | **0.3.0 (sin versión nueva; ver §3)** | npm: última publicación 2023-04-09 |

Nota: a partir de SDK 57 Expo unificó el versionado de sus paquetes (todos en 57.x), por eso los saltos de número aparentan ser enormes (expo-device 7 a 57) pero son la misma línea del SDK.

---

## 2. New Architecture: OBLIGATORIA (el punto que define el tamaño del proyecto)

**Hallazgo:** desde **React Native 0.82 la New Architecture está siempre activa y no se puede desactivar**; Expo SDK 55 (RN 0.83) la hereda y la arquitectura legacy quedó congelada (sin features ni bugfixes) desde junio de 2025. **SDK 57 / RN 0.86 no tiene opción legacy.** Nuestro `app.config.js` tenía `newArchEnabled: false`: la migración **incluye activar New Architecture sí o sí**.

Auditoría de compatibilidad new-arch de cada dependencia nativa del árbol:

| Módulo nativo | Mecanismo | Compat new-arch | Riesgo |
|---|---|---|---|
| Todos los `expo-*` (device, secure-store, sqlite, router, linking, localization, build-properties...) | Expo Modules API | Garantizada por `expo-modules-core` del SDK 57 | Nulo |
| `expo-app-integrity` 0.3.0 | **Expo Modules API** (verificado en código: `expo.modules.kotlin.modules.Module` + `ModuleDefinition`) | La da `expo-modules-core` del SDK instalado, no la lib | Bajo (ver §3) |
| `react-native-webview` 13.16.1 | Fabric component (soporte new-arch desde 13.x) | Sí en la versión bundled | Medio por comportamiento, no por arquitectura (ver §4) |
| `react-native-purchases` 10.4.x | TurboModule/bridge compat | Sí (línea 10 es new-arch ready) | Bajo |
| `@sentry/react-native` 7.11.x | Sí (la 6.x tenía fricción con SDK 57; por eso el SDK bundlea 7.x) | Sí | Bajo (major 6 a 7: revisar init) |
| `react-native-edge-to-edge` | Config/API sobre activity | Sí | Bajo (ver §5) |

**Consecuencia práctica:** no hay ningún módulo de puente legacy custom en el proyecto (cero módulos nativos propios; los tres config plugins propios son de build, no de runtime). La activación de New Architecture es asumible; el gate real es el smoke completo en dispositivo.

---

## 3. expo-app-integrity 0.3.0: candidato número uno a blocker... resultó benigno

**Estado de la lib:** abandonada de verdad. Única línea publicada 0.1.0/0.2.0/0.3.0, **última publicación 2023-04-09** (era SDK 48/49), peers de esa era (`expo-device ~5.2.1`, `expo-secure-store ~12.1.1`, `expo-build-properties ~0.5.1`). Es el override load-bearing documentado en AUD-WEB-02 §2.a.

**Inspección real del código (node_modules):**
- **Nativo Android:** UN archivo Kotlin (`IntegrityModule.kt`), escrito sobre **Expo Modules API** (`Module`/`ModuleDefinition` de `expo.modules.kotlin`). No usa el bridge legacy de RN: el bridging lo hace `expo-modules-core`, que en SDK 57 es new-arch nativo. Dependencia Gradle: `com.google.android.play:integrity:1.1.0` (lib Java/Kotlin pura de Play Services, **sin código nativo .so**, por tanto sin exposición al requisito de 16KB page size).
- **Lado JS:** usa solo APIs estables que no cambiaron en la línea 57: `Device.isDevice`, `SecureStore.getItemAsync/setItemAsync`, `requireNativeModule` de expo-modules-core.
- **Nuestro uso:** `AppIntegrity.attestKey(challenge, cloudProjectNumber)` en `useIntegrityCheck.ts`. Superficie mínima.

**Evaluación de los tres caminos:**

| Camino | Evidencia | Veredicto |
|---|---|---|
| **(a) Mantener con override remapeado a ~57.x** | Módulo Expo Modules API puro (arch-agnóstico), JS sobre APIs estables, Gradle dep Java pura sin .so, sin pins de Kotlin propios (hereda del proyecto) | **RECOMENDADO.** Debe compilar contra SDK 36 / RN 0.86 sin cambios. Verificable en el primer `assembleRelease` del plan |
| (b) Fork/vendor | Solo si (a) no compila; el fix sería menor (1 archivo Kotlin) | Fallback barato, no default |
| (c) Reemplazo (wrapper propio de Play Integrity vía config plugin, u otra lib) | Máximo control pero reescribe attestación + backend `verifyIntegrityToken` en pleno deadline | Rechazado para este proyecto; candidato post-deadline si (a) da guerra |

**Riesgo residual del camino (a):** que el Gradle plugin de la lib (formato de 2023) fricción con el AGP de RN 0.86. Se detecta en minutos en el primer build del plan; si pasa, se activa (b) con un patch local del build.gradle.

---

## 4. react-native-webview 13.13.5 a 13.16.1: TODA la app es este bridge

Releases intermedios revisados (changelog oficial de GitHub):

| Versión | Cambios relevantes | Impacto en nuestro bridge |
|---|---|---|
| 13.16.1 (2026-02) | iOS: fix SIGABRT en conversión NSString a std::string | Nulo (Android-only) |
| 13.16.0 (2025-08) | **Android: revert de `setIgnoreErrFailedForThisURL`** · **Android: manejo de errores SSL en subrecursos** · TS: `clearCache` pasa de opcional a requerido | El manejo SSL de subrecursos es lo único que roza nuestro flujo (carga de imágenes R2 vía proxy https del mismo origen: sin certificados raros, impacto esperado nulo, pero entra al smoke). No usamos `setIgnoreErrFailedForThisURL` ni `clearCache` |
| 13.15.0 (2025-06) | Android: opt-in Payment Request API | No lo usamos (checkout va por browser externo) |

**Verificación clave:** en el rango NO hay cambios en `originWhitelist`, `onShouldStartLoadWithRequest`, `injectedJavaScriptBeforeContentLoaded`, `injectedJavaScript`, `postMessage/onMessage` ni en el timing de inyección. El origin guard, la inyección de sesión PKCE (`__rnInjectSession`), el integrity token y el CSS de `iching-rn-webview` no tienen cambios de API que los amenacen.

**Pero:** el salto a New Architecture (Fabric) SÍ cambia el componente por debajo aunque la API sea la misma. Por eso el smoke del plan verifica explícitamente: timing de inyección pre/post carga, persistencia de la clase `iching-rn-webview`, origin guard bloqueando cross-origin, y el ciclo completo de sesión.

---

## 5. Target API 36 y behavior changes de Android 16

- **Default del SDK 57:** compile/target **API 36**. Acción: **quitar los pins** `compileSdkVersion: 35` / `targetSdkVersion: 35` / `buildToolsVersion: "35.0.0"` de `expo-build-properties` (dejarlos pisaría el default y anularía la migración). Aplicado en la rama.
- **Edge-to-edge:** con target 36 es obligatorio y **el opt-out desaparece**. Ya usamos `react-native-edge-to-edge` y el layout ya es edge-to-edge aware (safe areas vía `--rn-safe-area-inset-*`). SDK 57 además trae fixes de edge-to-edge en Android. Riesgo: bajo; entra al smoke (status bar, insets, drawer).
- **Predictive back:** con target 36 el sistema lo activa por defecto. Nuestro back lo maneja el WebView/nativo (historial del WebView + BackHandler). Entra al smoke: navegación back en chat y docs.
- **16KB page size:** aplica a libs con código nativo `.so`. Las de nuestro árbol (RN core, sqlite, sentry, reanimated si aplica) van alineadas por el propio SDK 57/RN 0.86, que ya empaqueta soporte 16KB. `play:integrity` es Java puro (sin exposición).
- **USE_FULL_SCREEN_INTENT:** no usamos full-screen intents. Sin acción.

---

## 6. RevenueCat (dinero real: verificado, no asumido)

- **Compatibilidad:** `react-native-purchases` línea 10 es compatible con RN 0.86/new-arch; último patch 10.4.2 (hoy estamos en ^10.4.0: mismo major, sin migración de API).
- **Play Billing Library:** la línea 10 empaqueta **Billing Library 8.3.0** (la v9.0.0 del SDK de RevenueCat fue la primera con BL8; nuestra 10.x la incluye). **Ya cumplimos BL8 hoy.**
- **¿Deadline de Billing Library el 2026-08-31?:** no existe evidencia de un requisito de BL con esa fecha; el requisito del 2026-08-31 es **target API 36**. El patrón histórico de Google es exigir BL N+ en agosto de cada año (BL6 en 2024, BL7 en 2025); si 2026 exigiera BL8, **ya la llevamos** (8.3.0). Sin acción.
- **Nota del changelog v10 (ya aplicable hoy):** desde 10.0.0, los one-time products mal configurados como consumables se consumen sin restore. Nuestros token packs SON consumables por diseño; la configuración del dashboard ya pasó por esta línea al adoptar ^10.4.0. Sin acción, solo smoke de compra sandbox.

---

## 7. Config plugins propios (build-time)

| Plugin | Qué hace | Riesgo con AGP/Gradle de RN 0.86 |
|---|---|---|
| `withProguardRules` | Añade reglas a proguard-rules.pro | Bajo: los mod-plugins de dangerous file-append siguen soportados; verificar que el archivo target siga existiendo en el template nuevo |
| `withForceDarkDisabled` | Ajuste de estilos Android (force dark off) | Bajo: mismo mecanismo |
| `withAdiRegistrationFile` | Copia archivo de registro ADI | Bajo: file-copy plugin |

Los tres son plugins de **build**, no de runtime: no les afecta New Architecture. El gate es que `expo prebuild` (implícito en el build) los aplique sin error sobre el template de SDK 57. Recordatorio Windows: el fix de `glob` en `@expo/config-plugins` (CLAUDE.md) hay que re-aplicarlo tras `npm install`; solo afecta prebuild local, no EAS.

---

## 8. Impacto en el monorepo (split react)

Con mobile en react **19.2.3**, el split queda **web 18.2.0 / mobile 19.2.3**. La no-determinismo de hoisting de [`AUD-WEB-02`](./20260713-AUD-WEB-02-monorepo-resolution-blocker.md) §2.b **cambia de forma pero no desaparece** (un regen fresco ahora hoistearía 19.2.3 en vez de 19.0.0 al root; el web sigue necesitando su 18.2.0). Desaparece solo cuando el web unifique en react 19 con Next 16.

Acciones derivadas (en la rama):
- Nota actualizada en AUD-WEB-02 §2.b.
- `resolution-guard`: la aserción hardcodeada `mobile === "19.0.0"` pasa a **derivarse del react declarado en `apps/mobile/package.json`**, para que el guard sobreviva futuros bumps de SDK sin ediciones. La aserción del web en 18.x queda intacta.
- El override load-bearing `expo-app-integrity` se remapea a los peers nuevos (~57.x). Sigue siendo load-bearing (AUD-WEB-02 §2.a se mantiene válido).

---

## 9. Riesgos residuales y dónde se cierran

| Riesgo | Prob. | Se cierra en |
|---|---|---|
| Comportamiento del WebView bajo Fabric (timing de inyección, guard) | Media | Smoke en dispositivo (plan, gate 6) |
| `expo-app-integrity` no compila contra AGP nuevo | Baja | Primer `assembleRelease`; fallback (b) fork con patch menor |
| Sentry 6 a 7: cambios de init/API | Baja | tsc + smoke (init está en un solo punto) |
| Edge-to-edge/predictive back con target 36 | Baja | Smoke (insets, back) |
| Resolución npm del workspace (split 18/19.2.3) | Media | Gate fail-closed `npm ls` + resolution-guard actualizado |
| Pre-launch report de Play con API 36 | Baja | Rollout por closed testing primero (plan, fase de rollout) |
