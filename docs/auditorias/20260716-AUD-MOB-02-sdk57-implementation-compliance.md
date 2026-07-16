# Auditoría: implementación vs documentación oficial Expo SDK 57

**Código:** `20260716-AUD-MOB-02 sdk57-implementation-compliance` · **Familia:** MOB · **Estado:** open

- **Fecha:** 2026-07-16
- **Motivación:** el bug de producción #14 (entry next/legacy de expo-media-library con types que mienten a tsc) demostró que la conformidad con SDK 57 debe verificarse contra el **runtime real y la doc oficial**, no contra el typechecker. Auditoría exhaustiva miembro por miembro.
- **Método:** censo automatizado de TODOS los imports externos de `apps/mobile` (app/ + src/) y sus miembros usados; verificación de cada miembro contra los **exports del entry runtime** del paquete instalado (parseo de los fuentes que Metro compila, no de los .d.ts); patrones de API de RN 0.86; campos de app.config contra los warnings reales de `expo prebuild`; evidencia en vivo del smoke en dispositivo via Play.
- **Relacionado:** [`20260715-AUD-MOB-01`](./20260715-AUD-MOB-01-expo-sdk57-upgrade-assessment.md), [`20260715-PLAN-MOB-01`](./20260715-PLAN-MOB-01-expo-sdk57-migration.md) (bitácora, problemas #1-#14)

---

## Checklist de conformidad SDK 57

### A. Versiones y arquitectura

| # | Item | Estado | Evidencia |
|---|---|---|---|
| A1 | Todas las versiones alineadas a bundledNativeModules del SDK 57 | ✅ CUMPLIDO | `expo doctor` 20/20 (era 18/20; deuda cerrada en bitácora #11) |
| A2 | New Architecture activada (obligatoria en SDK 57) | ✅ CUMPLIDO | `newArchEnabled: true`; `newArchEnabled=true` en gradle.properties del prebuild; APK corre en dispositivo |
| A3 | typescript en la línea esperada (~6.0.3) | ✅ CUMPLIDO | bump aplicado; tsc verde |
| A4 | react singleton en el bundle (split monorepo 18/19) | ✅ CUMPLIDO | resolveRequest de metro.config + discriminador verificado en cada artefacto |
| A5 | react-native singleton (0.86.0 único) | ✅ CUMPLIDO | discriminador `absoluteFillObject` = 0 en todos los AAB/APK entregados; targets dinámicos via require.resolve |

### B. Entries runtime por módulo (la lección del bug #14)

Cada miembro usado por nuestro código, verificado contra los exports del entry runtime instalado:

| # | Módulo (miembros usados) | Estado | Evidencia |
|---|---|---|---|
| B1 | `expo-file-system/legacy` (EncodingType, cacheDirectory, deleteAsync, documentDirectory, downloadAsync, getInfoAsync, makeDirectoryAsync, writeAsStringAsync) | ✅ CUMPLIDO | import migrado a `/legacy` en la migración (doc oficial: API clásica movida en SDK 54+); 8/8 exports presentes; módulo nativo legacy registrado en expo-module.config.json |
| B2 | `expo-media-library/legacy` (saveToLibraryAsync, usePermissions) | ✅ CUMPLIDO (post-fix 4.2.5) | era el bug #14: el entry default es next-only en runtime; doc oficial dice "import from legacy"; fix aplicado; 2/2 exports presentes |
| B3 | `expo-linking` (addEventListener, getInitialURL, openURL, parse) | ✅ CUMPLIDO | 4/4 exports en runtime; sin split next/legacy; probado en vivo (deep links OAuth + RC) |
| B4 | `expo-secure-store` (get/set/deleteItemAsync) | ✅ CUMPLIDO | 3/3; probado en vivo (persistencia de sesión) |
| B5 | `expo-sharing` (isAvailableAsync, shareAsync) | ✅ CUMPLIDO | 2/2; sin split |
| B6 | `expo-splash-screen` (hideAsync, preventAutoHideAsync) | ✅ CUMPLIDO | 2/2; probado en vivo (arranque sin cuelgue) |
| B7 | `expo-sqlite` (openDatabaseAsync, SQLiteDatabase) | ✅ CUMPLIDO | 2/2; probado en vivo (caché offline del sidebar) |
| B8 | `expo-application` (nativeApplicationVersion, nativeBuildVersion) | ✅ CUMPLIDO | 2/2 |
| B9 | `@sentry/react-native` 7.11 (init, captureException, captureMessage) | ✅ CUMPLIDO | 3/3; init minimal (dsn+debug), sin opciones removidas del 6→7 |
| B10 | `expo-app-integrity` (attestKey) | ✅ CUMPLIDO | probado en vivo: attestación PASÓ con instalación via Play |
| B11 | `expo-constants` (Constants.expoConfig) | ✅ CUMPLIDO | probado en vivo (BASE_URL/extra.apiUrl leído en runtime) |
| B12 | `expo-router` (Stack, router) | ✅ CUMPLIDO | probado en vivo (navegación + deep links) |
| B13 | `react-native-webview` 13.16.1 (WebView + props del bridge) | ✅ CUMPLIDO | changelog 13.13→13.16 sin cambios en props críticos (AUD-MOB-01 §4); probado en vivo (inyección, origin guard, SSE) |
| B14 | `react-native-purchases` (Purchases) | ✅ CUMPLIDO | probado en vivo (compra sandbox → webhook con Billing 8.3.0) |
| B15 | `react-native-safe-area-context` (SafeAreaProvider, insets) | ✅ CUMPLIDO | versión bundled pinneada por override; probado en vivo (insets correctos) |
| B16 | `react-native-edge-to-edge` (SystemBars) | ✅ CUMPLIDO | probado en vivo (edge-to-edge Android 16 sin opt-out) |
| B17 | Barrido de splits next/legacy en TODAS las libs expo usadas | ✅ CUMPLIDO | solo file-system y media-library tienen split; ambos migrados; el resto verificado sin split |

### C. Patrones de API React Native 0.86

| # | Item | Estado | Evidencia |
|---|---|---|---|
| C1 | `StyleSheet.absoluteFillObject` (eliminado por completo en 0.86) | ✅ CUMPLIDO | 2 usos propios reemplazados por el literal; grep de terceros: 0 en el bundle de producción |
| C2 | `BackHandler` patrón moderno (subscription.remove(), no removeEventListener) | ✅ CUMPLIDO | `const h = addEventListener(...); return () => h.remove()` |
| C3 | `Dimensions/AppState.removeEventListener` (eliminados) | ✅ CUMPLIDO | 0 usos de los patrones removidos |
| C4 | `StatusBar` de RN: solo lecturas válidas | ✅ CUMPLIDO | único uso: `StatusBar.currentHeight` (válido en 0.86; no usamos los setters afectados por edge-to-edge) |
| C5 | Imports named de RN core (Alert, Animated, Modal, etc.) | ✅ CUMPLIDO | todos presentes en RN 0.86; tsc verde + app en vivo |

### D. Configuración (app.config.js) vs SDK 57

| # | Item | Estado | Evidencia |
|---|---|---|---|
| D1 | `newArchEnabled: true` | ✅ CUMPLIDO | ver A2 |
| D2 | Sin pins de compile/targetSdk (default 36 del SDK) | ✅ CUMPLIDO | pins removidos; aapt + Play Console muestran 36 |
| D3 | `androidStatusBar` | ✅ CUMPLIDO (cerrado 2026-07-16, commit de mantenimiento config-only) | bloque REMOVIDO (no migrado a plugin: SystemBars ya cubre el styling en runtime, B16, per auditoría externa). Verificado: `expo prebuild --clean` sin warnings SYSTEM_BARS_PLUGIN |
| D4 | `androidNavigationBar` | ✅ CUMPLIDO (cerrado 2026-07-16, mismo commit) | bloque REMOVIDO junto a D3; misma verificación (prebuild limpio) |
| D5 | `splash` top-level + plugin expo-splash-screen | ✅ CUMPLIDO (con nota) | prebuild sin warnings de splash; conviven campo y plugin sin conflicto |
| D6 | `userInterfaceStyle: "dark"` | ✅ CUMPLIDO | campo vigente |
| D7 | Plugin expo-build-properties (proguard/shrink, sin pins) | ✅ CUMPLIDO | prebuild limpio |
| D8 | Plugin expo-media-library (savePhotosPermission, isAccessMediaLocationEnabled: false) | ✅ CUMPLIDO | opciones vigentes; coherente con blockedPermissions |
| D9 | blockedPermissions + permisos granulares de media-library | ✅ CUMPLIDO (cerrado 2026-07-16) | resuelto EN EL ORIGEN per auditoría externa: `granularPermissions: ["photo"]` en el plugin (verificado en withMediaLibrary.js: default photo+video+audio, opción soportada) — solo inyecta READ_MEDIA_IMAGES, que blockedPermissions ya bloquea. Verificado: manifest mergeado del prebuild SIN READ_MEDIA_AUDIO ni entradas activas de READ_MEDIA_* |
| D10 | Config plugins propios (withProguardRules, withForceDarkDisabled, withAdiRegistrationFile) | ✅ CUMPLIDO | prebuild los aplicó sin error sobre el template SDK 57 |

### E. Android 16 / Play (resumen; detalle en el checklist de cumplimiento Play del 2026-07-16)

| # | Item | Estado |
|---|---|---|
| E1 | Target API 36 | ✅ CUMPLIDO (aceptado por Play Console) |
| E2 | 16 KB page size | ✅ CUMPLIDO (25/25 libs arm64 con p_align >= 0x4000, verificado por parseo ELF) |
| E3 | Edge-to-edge sin opt-out + predictive back | ✅ CUMPLIDO (smoke en dispositivo) |
| E4 | Billing Library 8.3.0 | ✅ CUMPLIDO |

---

## Resumen ejecutivo

**43 items auditados: 43 cumplidos** (D3/D4/D9 cerrados el 2026-07-16 en un commit de mantenimiento config-only tras la verificación de la auditoría externa; originalmente 41/43). Los dos hallazgos de entries runtime (file-system, media-library) ya estaban corregidos al momento de esta auditoría (el segundo, por el bug #14 de producción que la motivó).

### Acciones derivadas (no bloqueantes)

1. Remover `androidStatusBar` y `androidNavigationBar` de app.config.js (o migrar a los plugins expo-status-bar / expo-navigation-bar) en el próximo release de mantenimiento.
2. Considerar añadir `android.permission.READ_MEDIA_AUDIO` a blockedPermissions (coherencia con la minimización de Data Safety).
3. Lección metodológica (REFINADA por la auditoría externa y verificada contra el paquete): el mecanismo real del bug #14 es más traicionero que "d.ts que anuncian APIs ausentes". El entry default de media-library hace `export * from './legacyWarnings'`: stubs que EXISTEN en runtime con tipos válidos pero cuyo cuerpo lanza Error con el mensaje de migración (`legacyWarnings.ts:46-48`). tsc pasa y el export existe; lo que miente es el CUERPO. Conclusión operativa: en libs con split next/legacy, la verificación concluyente es ejercitar el flujo en dispositivo o leer el cuerpo del export, no solo confirmar su existencia.
