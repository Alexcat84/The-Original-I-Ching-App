# Plan de implementación Fase 2 — iOS App Store (código)
**Código:** `20260627-PLAN-MOB-IOS-02 fase2-implementation-plan-v1` · **Familia:** MOB-IOS · **Estado:** implementado — 2 fixes typecheck requeridos antes de merge  
**Versión del documento:** v1.2 (implementación completada §4.1–4.7, auditoría post-implementación Claude)  
**Fecha:** 2026-06-27

**Plan maestro:** [`20260627-PLAN-MOB-IOS-01-ios-app-store-launch.md`](./20260627-PLAN-MOB-IOS-01-ios-app-store-launch.md) · **Índice colección:** [`INDEX.md`](./INDEX.md)

---

## 0. Metadatos de control

| Campo | Valor |
|-------|-------|
| Rama exclusiva | `feature/ios-app-store-launch` (ya en `origin`, base `staging`) |
| Alcance | **Solo** Fase 2 del maestro: items **4.1 – 4.7** |
| Fuera de alcance | Fase 0, Fase 1, Fases 3–6, merge a `staging`/`main`, billing/webhooks/product IDs |
| Autor implementación | Cursor (post-aprobación) |
| Revisor | Claude (pre-implementación y post-implementación) |
| Aprobador | Alex |
| Estado | **v1.2 — implementado en `feature/ios-app-store-launch` (2026-06-27).** Auditoría post-implementación Claude: arquitectura y ajustes previos correctos; 2 fixes mecánicos de typecheck requeridos antes de merge (ver §14) |

### Decisiones cerradas (PLAN-01 §2, no reabrir)

| ID | Decisión |
|----|----------|
| D3 | Bundle ID: `com.theoriginaliching.app` |
| D4 | Solo iPhone v1 (`supportsTablet: false`) |
| D5 | Omitir App Attest / equivalente Play Integrity en iOS v1 |
| D6 | Omitir push notifications (APNs) en v1 |

### Placeholders Fase 1 (env vars, no bloquean el resto)

| Variable / credencial | Origen | Comportamiento en código si falta |
|-----------------------|--------|-----------------------------------|
| `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` | RevenueCat → App Store app | `Purchases.configure` no-op + warn; Android sin cambio |
| Supabase Apple provider | Portal Apple + Supabase Auth | Sign in with Apple: error UI claro, no crash |
| ASC API key (EAS submit) | App Store Connect | Solo afecta `eas submit`; build preview OK sin ella |

---

## 1. Resumen ejecutivo

Este documento es el **plan concreto de implementación** que Cursor ejecutará en la rama `feature/ios-app-store-launch` una vez Claude y Alex lo aprueben. Traduce el PLAN-01 §4 en:

- **Orden de ejecución** con dependencias
- **Lista exacta de archivos** a crear, modificar o mover
- **Diffs conceptuales** (qué se agrega, no el diff literal)
- **Matriz de trazabilidad** plan § → archivo → criterio de done
- **Verificaciones** pre-merge
- **Puntos abiertos** para decisión de Alex antes o durante revisión

**Principio:** trazabilidad audit-able — cada ítem 4.x mapea a archivos y a un criterio verificable.

---

## 2. Orden de ejecución y dependencias

```text
4.7 (integrity iOS guard)
  └─► 4.1 (app.config.js + ios block + plugins)
        ├─► 4.2 (eas.json perfiles ios)
        ├─► 4.5 (icono 1024)
        └─► 4.3 (Sign in with Apple) ── requiere 4.1 plugin
4.4 (RevenueCat multi-key) ── paralelo tras 4.1, independiente de 4.3
4.6 (changelog tooling + doc OPS-IOS-01) ── totalmente paralelo
```

| Paso | Item | Bloquea |
|------|------|---------|
| 1 | **4.7** | Build iOS si `expo-app-integrity` autolinka nativo en iOS |
| 2 | **4.1** | EAS iOS, 4.2, 4.3, 4.5 |
| 3 | **4.2** | TestFlight / submit |
| 4 | **4.4** | Compras IAP iOS en runtime |
| 5 | **4.3** | Cumplimiento Guideline 4.8 (Sign in with Apple) |
| 6 | **4.5** | Upload metadata App Store Connect |
| 7 | **4.6** | Releases iOS documentados |

---

## 3. Item 4.7 — Excluir `expo-app-integrity` en build iOS

### 3.1 Contexto verificado en repo

- `expo-app-integrity` está en `apps/mobile/package.json` (^0.3.0).
- **No** está en el array `plugins` de `app.config.js`; se usa vía import en `useIntegrityCheck.ts`.
- `postinstall` ejecuta `fix-expo-app-integrity-gradle.js` (parche Android Gradle 8).
- `withAdiRegistrationFile` ya es mod **solo Android** (token Play Integrity).
- Decisión D5: omitir verificación en iOS v1; **no** eliminar paquete (Android producción lo necesita).

### 3.2 Archivos

#### A. `apps/mobile/react-native.config.js` (NUEVO)

```javascript
module.exports = {
  dependencies: {
    "expo-app-integrity": {
      platforms: {
        ios: null, // disable iOS autolinking — D5
      },
    },
  },
};
```

**Por qué:** evita que el pod/native module se compile en iOS sin desinstalar el paquete de Android.

#### B. `apps/mobile/src/hooks/useIntegrityCheck.ts` (MODIFICAR)

- Guard al inicio del hook: si `Platform.OS !== "android"`, comportamiento no-op:
  - `tokenState` siempre `null`
  - `currentTokenRef` / `currentTraceIdRef` sin uso
  - `refreshToken` resuelve `null` sin llamar nativo
  - `useEffect` de autenticación: return inmediato en iOS
- **Import nativo:** preferir `require("expo-app-integrity")` solo dentro de rama Android, o archivo separado `useIntegrityCheck.android.ts` / `.ios.ts` si Metro lo resuelve limpio (evaluar en implementación; objetivo = cero referencia al módulo en bundle iOS).

#### C. `apps/mobile/app/index.tsx` (MODIFICAR — mínimo)

- Handler bridge `integrity_token_request`: en iOS, responder al WebView con token vacío o no-op (mismo contrato que hoy cuando attestation falla), para no colgar consultas.
- Verificar que `useIntegrityCheck(isAuthenticated)` no dispara side effects en iOS.

#### D. `apps/mobile/scripts/fix-expo-app-integrity-gradle.js` (MODIFICAR)

- Salida temprana si no existe `node_modules/expo-app-integrity/android/build.gradle` (instalación sin parchear = OK en contexto iOS-only cloud build).

### 3.3 Criterio de done (4.7)

- [ ] `grep -r "attestKey" apps/mobile` solo alcanzable en ramas Android
- [ ] Android: Play Integrity sin regresión (mismo hook, mismo postinstall)
- [ ] iOS: `eas build --platform ios --profile preview` no falla por pod `expo-app-integrity`

---

## 4. Item 4.1 — `apps/mobile/app.config.js`

### 4.1 Cambios exactos

```javascript
// L13 — antes: platforms: ["android"]
platforms: ["android", "ios"],
```

**Bloque `ios` nuevo** (insertar después de cierre de `android: { ... }`):

```javascript
ios: {
  bundleIdentifier: "com.theoriginaliching.app",
  buildNumber: "1",
  supportsTablet: false,
  icon: "./assets/ios-app-icon-1024.png",
  backgroundColor: "#0c0f14",
  infoPlist: {
    NSPhotoLibraryAddUsageDescription:
      "Necesitamos permiso para guardar imágenes en tu galería.",
    NSPhotoLibraryUsageDescription:
      "Necesitamos permiso para guardar imágenes en tu galería.",
    CFBundleURLTypes: [
      {
        CFBundleURLSchemes: ["rc-340e77bf41"],
      },
    ],
    ITSAppUsesNonExemptEncryption: false,
  },
  config: {
    usesNonExemptEncryption: false,
  },
},
```

**Notas:**

| Tema | Detalle |
|------|---------|
| `buildNumber: "1"` | Independiente de `android.versionCode: 60`. iOS usa CFBundleVersion propio. **Punto abierto §10.1** |
| Deep link auth | `scheme: "theoriginaliching"` (raíz) cubre `theoriginaliching://auth/callback` |
| RC scheme | `rc-340e77bf41` explícito en `CFBundleURLTypes` (paridad `android.intentFilters`) |
| `associatedDomains` | **No** en v1 (custom URL scheme suficiente) |
| `expo-media-library` plugin | Mantener; `infoPlist` explícito como defensa (duplicar permission string OK) |

### 4.2 Plugins

| Plugin | Acción |
|--------|--------|
| `expo-apple-authentication` | **AGREGAR** al array `plugins` (requerido 4.3 + capability) |
| `react-native-edge-to-edge` | Sin cambio (sub-bloque `android` only) |
| `expo-build-properties` | Sin bloque iOS salvo fallo EAS (improbable SDK 53) |
| `withAdiRegistrationFile` | Sin cambio |
| Resto | Sin cambio |

### 4.3 `apps/mobile/app/index.tsx` — `__RN_APP_INFO`

Extender `resolveRnAppInfoForWeb()`:

```typescript
{
  version: string;
  androidVersionCode: number | null;
  iosBuildNumber: number | null;
  platform: "ios" | "android";
}
```

- `iosBuildNumber`: parsear de `Constants.expoConfig?.ios?.buildNumber`
- Consumido en WebView login para mostrar botón Apple solo en iOS nativo

### 4.4 Criterio de done (4.1)

- [ ] `npx expo config --type public` incluye bloque `ios` válido
- [ ] `bundleIdentifier` = `com.theoriginaliching.app`
- [ ] `supportsTablet: false`

---

## 5. Item 4.2 — `apps/mobile/eas.json`

### 5.1 Perfiles a modificar

| Perfil | Clave `ios` propuesta | Notas |
|--------|----------------------|-------|
| `development` | `{ "simulator": false }` + mantiene `developmentClient: true` | Dev client iOS |
| `preview` | `{ }` o omitir claves iOS-only | TestFlight interno; `"distribution": "internal"` ya está a nivel perfil (L15) — hereda a iOS |
| `production` | `{ "credentialsSource": "remote" }` | App Store release |
| `staging-aab` | **Sin ios** | Android-only; no duplicar |
| `apk`, `verification` | **Sin ios** | Android-only |

**Decisión v1.0:** no crear perfil `staging-ios` separado; `preview` + `production` bastan. **Punto abierto §10.2**

### 5.2 `submit.production`

```json
"submit": {
  "production": {
    "ios": {
      "ascApiKeyPath": "./credentials/asc-api-key.json",
      "ascApiKeyIssuerId": "PLACEHOLDER_POST_FASE1",
      "ascApiKeyId": "PLACEHOLDER_POST_FASE1"
    }
  }
}
```

### 5.3 Otros

- Agregar `apps/mobile/credentials/` a `.gitignore` si no está
- Comentario en `eas.json` o README mobile: valores reales vía App Store Connect API key (Fase 1) o EAS Secrets

### 5.4 Criterio de done (4.2)

- [ ] `preview` y `production` tienen clave `ios`
- [ ] JSON válido; `eas build --platform ios --profile preview --dry-run` (si disponible) o validación schema EAS

---

## 6. Item 4.3 — Sign in with Apple

### 6.1 Dependencia

```bash
cd apps/mobile && npx expo install expo-apple-authentication
```

Versión alineada a Expo SDK 53 (resolver vía `expo install`, no pin manual).

### 6.2 Arquitectura del flujo

**Google hoy (referencia):**

1. WebView carga `/login` → Supabase SDK `signInWithOAuth({ provider: "google" })`
2. `onShouldStartLoadWithRequest` intercepta `/auth/v1/authorize?provider=google`
3. Reescribe `redirect_to=theoriginaliching://auth/callback` → abre browser externo
4. Deep link vuelve → PKCE code handoff al WebView **o** implicit tokens → `SecureStore` + `__rnInjectSession`

**Apple propuesto (nativo, más directo):**

1. Login web muestra botón Apple **solo** si `window.__RN_APP_INFO?.platform === "ios"`
2. Click → (legal consent si aplica) → `postMessage({ type: "open_apple_auth", legalConsent? })`
3. Native: `AppleAuthentication.signInAsync({ requestedScopes: [FULL_NAME, EMAIL] })`
4. Native: POST Supabase `{SUPABASE_URL}/auth/v1/token?grant_type=id_token` body `{ provider: "apple", id_token: identityToken }` headers `apikey` + `Authorization: Bearer {ANON_KEY}`
5. Native: si `legalConsent` → `POST /api/auth/legal-consent` con bearer
6. Native: **misma persistencia que OAuth Google exitoso** (~L2285–2311 `index.tsx`): `SecureStore`, `setIsAuthenticated`, `setUserEmail`, `authTransitionRef`, `__rnInjectSession` — **sin** `Purchases.logIn` en este punto

**Regla RC (verificado en código, auditoría Claude):** el bloque post-OAuth Google (L2285–2311) **no** llama `Purchases.logIn`. RC identifica al usuario de forma **lazy** solo al comprar (`index.tsx` ~L2542 y ~L2597: compara `appUserID` vs `uid` antes de `purchasePackage`). Cold-start restore (~L2096) y `auth_token` bridge (~L2664) son paths distintos; el flujo Apple debe **paridad con Google OAuth callback**, no con esos paths. Apple hereda RC lazy en compra sin código extra.

**Fallback:** interceptar `/auth/v1/authorize?provider=apple` en `onShouldStartLoadWithRequest` → cancelar navegación → delegar a handler nativo (evita flujo web roto en WebKit).

### 6.3 Archivos nuevos (mobile)

| Archivo | Contenido |
|---------|-----------|
| `apps/mobile/src/auth/sign-in-with-apple.ts` | `isAppleSignInAvailable(): Promise<boolean>`, `signInWithAppleIdToken(): Promise<{ access_token, refresh_token, user }>` vía REST Supabase |
| `apps/mobile/src/auth/persist-native-session.ts` | Extraer lógica compartida post-auth: **solo** `SecureStore`, refs de estado (`accessTokenRef`, `setIsAuthenticated`, `setUserEmail`), `authTransitionRef`, inject `__rnInjectSession`. **Prohibido** incluir `Purchases.logIn` — paridad exacta con L2285–2311 |

### 6.4 Archivos modificados (mobile)

| Archivo | Cambio |
|---------|--------|
| `apps/mobile/app.config.js` | Plugin `expo-apple-authentication` |
| `apps/mobile/app/index.tsx` | Tipo bridge `open_apple_auth`; handler; fallback intercept Apple OAuth URL; errores UX (`ERR_REQUEST_CANCELED` silencioso) |

### 6.5 Archivos modificados (web — requiere deploy Vercel para TestFlight)

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/app/login/page.tsx` | Botón Apple condicional RN+iOS; `onApple()` → legal modal → postMessage |
| `packages/i18n/src/messages/login-page-ui.ts` | `continueApple: string` × 11 locales |
| `apps/web/src/lib/legal-consent.ts` | Añadir `"apple_oauth"` a `LegalConsentSource` + validación |
| `apps/web/src/app/api/auth/legal-consent/route.ts` | Zod enum incluye `apple_oauth` |
| Tests legales en `apps/web/src/lib/__tests__/` | Actualizar fixtures enum |

**CSS:** clase `auth-pro-btn-apple` (negro/blanco, HIG Apple); sin hardcode ES.

### 6.6 Relay email Apple

| Área | Impacto | Mitigación |
|------|---------|------------|
| Auth Supabase | Email puede ser `*@privaterelay.appleid.com` | Normal; Supabase lo acepta |
| RevenueCat | Identifica por JWT `sub` (UUID), no email | Sin cambio |
| Recibos email | Pueden ir a relay | Aceptable v1 |
| Nombre display | Apple solo envía nombre en primer login | Fallback email local-part o prompt posterior |

### 6.7 Criterio de done (4.3)

- [ ] Botón Apple visible solo WebView iOS nativo
- [ ] Flujo completo con Supabase Apple provider configurado (Fase 1)
- [ ] Sin provider: mensaje claro, no crash
- [ ] Google OAuth sigue funcionando en iOS (browser externo)
- [ ] Legal consent `apple_oauth` persistido
- [ ] Post-login Apple **no** invoca `Purchases.logIn` (grep en handler Apple = 0 matches)

---

## 7. Item 4.4 — RevenueCat multi-key

### 7.1 Cambio en `apps/mobile/app/index.tsx` (~L2053–2077)

```typescript
import { Platform } from "react-native";

const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? "";
const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? "";
const RC_API_KEY =
  Platform.select({
    ios: RC_API_KEY_IOS,
    android: RC_API_KEY_ANDROID,
    default: RC_API_KEY_ANDROID,
  }) ?? "";
```

### 7.2 Sin tocar

- Product IDs (`tokens_seeker_20`, `tokens_practitioner_40`, `tokens_master_100`)
- Webhooks Stripe/RC
- Lógica `handleNativePurchase`, deep link `rc-340e77bf41`

### 7.3 Documentación env

Bloque comentado en template (`.env` gitignored):

```bash
# Android (existente)
EXPO_PUBLIC_REVENUECAT_API_KEY=goog_...

# iOS — Fase 1 RevenueCat App Store app
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=appl_PLACEHOLDER_POST_FASE1
```

### 7.4 Criterio de done (4.4)

- [ ] Android sigue usando `EXPO_PUBLIC_REVENUECAT_API_KEY` sin renombrar
- [ ] iOS usa key distinta cuando env presente

---

## 8. Item 4.5 — Ícono 1024×1024 sin canal alfa

### 8.1 Entregables

| Archivo | Spec |
|---------|------|
| `apps/mobile/assets/ios-app-icon-1024.png` | 1024×1024 RGB, sin canal alpha |
| `apps/mobile/scripts/generate-ios-app-icon.mjs` | Script generación |
| `apps/mobile/package.json` | Script `"generate:ios-icon": "node ./scripts/generate-ios-app-icon.mjs"` |

### 8.2 Fuente

`apps/mobile/assets/icon.png` (mismo arte que adaptive Android).

### 8.3 Método

1. Resize a 1024×1024
2. Compositar sobre fondo sólido `#0c0f14` (flatten alpha)
3. Export PNG sin alpha

Agregar `sharp` como **devDependency** en `apps/mobile/package.json` (hoy vive en `apps/web` y `@img/sharp-linux-x64` en root — no confiar solo en hoisting npm workspaces). EAS Linux resuelve vía `@img/sharp-linux-x64` en root; validar en implementación.

### 8.4 Capturas iPhone

**Fuera del diff de código** — Alex las prepara en Fase 3. Recomendación: tamaño 6.9" Display; reusar composiciones Play Store si layout responsive.

### 8.5 Criterio de done (4.5)

- [ ] PNG existe y referenciado en `ios.icon`
- [ ] Verificación manual o script: sin canal alpha

---

## 9. Item 4.6 — Changelog tooling + doc App Store

### 9.1 Scripts

| Archivo | Cambio |
|---------|--------|
| `scripts/update-changelog.js` | `--buildNumber N` opcional; usage string actualizado |
| `scripts/changelog/render.js` | Header: `## [X.Y.Z] — date \| versionCode: N \| buildNumber: M \| Stage: …` (omitir segmento `buildNumber` si ausente) |
| `scripts/changelog/render.js` | Tabla summary: columna `buildNumber` opcional (`—` si ausente) |
| `scripts/update-changelog.js` | `parseVersionHeaders` regex retrocompatible — extraer `buildNumber` cuando presente |
| `scripts/update-changelog.js` | **Guard monotónico `buildNumber`** (obligatorio, auditoría Claude): mismo patrón que L119–122 para `versionCode` — si `--buildNumber` se pasa y `buildNumber <= maxExistingBn` en headers previos, emitir `console.warn` (Apple rechaza CFBundleVersion reusado igual que Play rechaza `versionCode` reusado) |
| `scripts/pre-release-checklist.sh` | Sección iOS: bump `ios.buildNumber`, ejemplo `--buildNumber` |

**Retrocompatibilidad:** entradas Android existentes sin `buildNumber` siguen parseando; guard solo corre cuando `--buildNumber` está presente.

**Implementación guard (referencia):**

```javascript
// Tras parseVersionHeaders, cuando buildNumber arg presente:
const maxExistingBn = existingVersions.reduce(
  (max, v) => Math.max(max, v.buildNumber ?? 0),
  0,
);
if (Number.isFinite(buildNumber) && buildNumber <= maxExistingBn) {
  console.warn(
    `Warning: buildNumber ${buildNumber} is not greater than latest ${maxExistingBn}`,
  );
}
```

### 9.2 Doc nuevo (WF-DOC-02)

| Campo | Valor |
|-------|-------|
| Código | `00000000-OPS-IOS-01 app-store-changelog` |
| Path | `docs/00000000-OPS-IOS-01-app-store-changelog.md` |
| Familia | `MOB-IOS` |
| Registro | `docs/registry.json` + `docs/INDEX.md` |
| Contenido | Espejo OPS-PLAY-01: tabla `Version \| buildNumber \| Date \| Stage`; tags locale Apple; bulk-paste App Store Connect |
| Primera entrada | Placeholder v4.2.0 buildNumber 1 — copy What's New en Fase 3 |

**Nota:** OPS-IOS-01 vive en `docs/` raíz (como OPS-PLAY-01), enlazado desde [`mob-ios/INDEX.md`](./INDEX.md).

### 9.3 Criterio de done (4.6)

- [ ] `node scripts/update-changelog.js --version 4.2.0 --versionCode 60 --buildNumber 1 --stage Production --dry-run` OK
- [ ] Re-ejecutar con `--buildNumber 0` o valor ≤ último registrado → warning monotónico visible
- [ ] `npm run verify:qa-registry` PASS

---

## 10. Puntos abiertos para revisión Claude / Alex

| ID | Pregunta | Propuesta v1.0 | Impacto |
|----|----------|----------------|---------|
| 10.1 | `buildNumber` inicial iOS | `"1"` (no alinear a Android 60) | Solo numeración App Store |
| 10.2 | Perfil EAS `staging-ios` | No crear; `preview` + `production` | Simetría staging |
| 10.3 | Apple en Safari iOS web | Botón solo RN WebView iOS | Usuarios web móvil sin Apple (OK v1) |
| 10.4 | Deploy web obligatorio para 4.3 | Sí — login/i18n/legal en Vercel staging antes de TestFlight E2E | Orden QA |

---

## 11. Matriz de trazabilidad (auditoría post-implementación)

| Plan § | Archivos | Criterio de done |
|--------|----------|------------------|
| 4.7 | `react-native.config.js`, `useIntegrityCheck.ts`, `fix-expo-app-integrity-gradle.js`, `index.tsx` (integrity bridge) | iOS build sin pod integrity; Android attestation intacto |
| 4.1 | `app.config.js`, `index.tsx` (`__RN_APP_INFO`) | `expo config` válido; bundle ID correcto |
| 4.2 | `eas.json`, `.gitignore` | Perfiles preview/production con `ios` |
| 4.3 | `package.json`, `app.config.js`, `index.tsx`, `src/auth/*.ts`, login web, i18n, legal API | Matriz §6.7 |
| 4.4 | `index.tsx` | `Platform.select` keys distintas |
| 4.5 | `ios-app-icon-1024.png`, script, `app.config.js` | 1024×1024 sin alpha |
| 4.6 | `update-changelog.js`, `render.js`, `pre-release-checklist.sh`, OPS-IOS-01, registries | dry-run + verify:qa-registry |

---

## 12. Verificaciones pre-merge (post-implementación)

```bash
# Raíz monorepo
npm run typecheck
npm run verify:qa-registry
npm run i18n:audit

# Changelog
node scripts/update-changelog.js \
  --version 4.2.0 --versionCode 60 --buildNumber 1 \
  --stage "Production" --dry-run

# Icono
cd apps/mobile && npm run generate:ios-icon

# Config Expo
cd apps/mobile && npx expo config --type public | head -80

# Build cloud (Alex, tras Fase 1 credenciales)
cd apps/mobile && npx eas build --platform ios --profile preview
```

---

## 13. Fuera de alcance explícito (este PR / esta fase)

- Fase 0: precios IAP iOS (D2)
- Fase 1: Apple Developer, ASC, RC products, Supabase Apple provider real
- Capturas, nutrition label, notas reviewer, cuenta demo
- Merge `staging` / `main`
- Cambios billing / webhooks / product IDs
- App Attest, push notifications
- Actualizar `CLAUDE.md` (opcional post-merge)

---

## 14. Historial del documento

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| v1.0 | 2026-06-27 | Cursor | Plan detallado Fase 2 §4.1–4.7 para revisión Claude; colección `docs/auditorias/mob-ios/` creada |
| v1.1 | 2026-06-27 | Cursor | Incorpora 2 ajustes obligatorios auditoría Claude: §6.2/6.3 sin `Purchases.logIn` en persist session; §9.1 guard monotónico `buildNumber`. Notas menores §5.1/§8.3 |
| v1.2 | 2026-06-27 | Cursor | **Implementación completada** §4.1–4.7 en rama `feature/ios-app-store-launch` (sin merge staging/main) |

### Implementación completada (v1.2, 2026-06-27)

Rama: `feature/ios-app-store-launch`. Items §4.1–4.7 implementados según matriz §11.

| Item | Estado | Notas |
|------|--------|-------|
| 4.7 integrity iOS no-op | ✅ | `react-native.config.js`, `useIntegrityCheck.{ios,android}.ts`, bridge no-op |
| 4.1 app.config + `__RN_APP_INFO` | ✅ | `platforms: ["android","ios"]`, bloque `ios`, plugin `expo-apple-authentication` |
| 4.2 eas.json | ✅ | Perfiles iOS + `submit.production.ios` placeholders; `credentials/` gitignored |
| 4.4 RC multi-key | ✅ | `Platform.select` + `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` |
| 4.5 ícono 1024 | ✅ | `generate-ios-app-icon.mjs`, `sharp` devDep, `ios-app-icon-1024.png` |
| 4.3 Sign in with Apple | ✅ | `sign-in-with-apple.ts`, `persist-native-session.ts` **sin** `Purchases.logIn`; bridge + login web + i18n + `apple_oauth` |
| 4.6 changelog + OPS-IOS-01 | ✅ | `--buildNumber`, guard `maxExistingBn`, `pre-release-checklist.sh`, doc WF-DOC-02 |

**Verificación §12 (2026-06-27):**

| Gate | Resultado |
|------|-----------|
| `npm run verify:qa-registry` | PASS (20 docs) |
| `npm run i18n:audit` | PASS |
| `apps/web` `tsc --noEmit` | PASS (tipos `__RN_APP_INFO` centralizados en `src/types/rn-bridge.d.ts`) |
| `update-changelog.js --dry-run --buildNumber 1` | PASS |
| `update-changelog.js --buildNumber 0` | Warning monotónico emitido |
| `npx expo config --type public` | PASS (`platforms` incluye `ios`, plugin Apple auth) |
| `npm run generate:ios-icon` | PASS (1024×1024 sin alpha) |
| `npm run typecheck` (turbo root) | Intermitente en Windows (fallo paralelo ~1s en builds deps; paquetes individuales OK) |

**Pendiente humano / Fase 1+3+4:** credenciales Apple Developer, ASC API key real, Supabase Apple provider, `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS`, deploy web staging, `eas build --platform ios --profile preview`, E2E Sign in with Apple.

### Auditoría post-implementación Claude (2026-06-27)

Verifiqué el commit `8e2bafb` archivo por archivo contra la matriz §11 (no solo la tabla de
verificación de Cursor). Confirmado independientemente, no solo leído:

- `persist-native-session.ts`: leído completo — **cero** referencia a `Purchases.logIn`, exacto
  a lo requerido. `sign-in-with-apple.ts`, bridge `open_apple_auth` (`index.tsx:2827`), fallback
  `onShouldStartLoadWithRequest` para `provider=apple` (`:3201`), `useIntegrityCheck.ios.ts` con
  shape idéntico al `.android.ts` (mismo objeto `{ currentTokenRef, currentTraceIdRef,
  tokenState, refreshToken }`, así que Metro resuelve ambos sin romper el contrato del hook),
  bridge `integrity_token_request` con no-op en iOS (`:2976`) — todos correctos.
- Re-ejecuté yo mismo (no solo leí el reporte): `update-changelog.js --buildNumber 0` → emite
  el warning monotónico correctamente; `verify:qa-registry` → PASS (20 docs); `i18n:audit` →
  PASS; tests `legal-consent`/`post-auth-legal` → 13/13 pass; ícono generado inspeccionado con
  `sharp` directamente → 1024×1024, `hasAlpha: false`, 3 canales — exacto.
- Legal consent: `apple_oauth` agregado correctamente a `legal-consent.ts`, la ruta API, y el
  test que de verdad enumera el union (`post-auth-legal.test.ts`); confirmé que
  `legal-consent-pending-meta.test.ts` no necesitaba el cambio (solo testea el caso
  `google_oauth` puntual, no una lista exhaustiva). El flujo de Apple en `onApple()` (login
  web) reusa el mismo patrón que `onGoogle()` — consentimiento siempre se resuelve post-auth en
  `/auth/complete-legal`, que confirmé es agnóstico de provider (sin ninguna referencia a
  `google_oauth`/`apple_oauth` en `post-auth-legal.ts` ni en la página `complete-legal`) — el
  parámetro `legalConsent` que nunca se popula desde el botón web no es un bug, es plumbing
  consistente con cómo Google ya funciona.

**2 ERRORES REALES encontrados, no reportados en la tabla de verificación de Cursor** — la fila
"`npm run typecheck` (turbo root) — Intermitente" oculta el problema real: corrí
`npx tsc --noEmit -p apps/mobile/tsconfig.json` directamente (el comando que de verdad ejercita
este paquete) y NO pasa:

```text
apps/mobile/app/index.tsx(94,59): error TS2307: Cannot find module '@/src/hooks/useIntegrityCheck'
apps/mobile/app/index.tsx(2063,11): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
apps/mobile/app/index.tsx(2064,11): error TS2322: Type 'string | undefined' is not assignable to type 'string'.
```

Causa raíz de ambos:

1. **Resolución de módulo `.ios.ts`/`.android.ts`** — `apps/mobile/tsconfig.json` no tiene
   `moduleSuffixes`. Metro (el bundler) sí sabe resolver `useIntegrityCheck.ios.ts`/`.android.ts`
   en runtime/build — por eso esto NO rompe el build de EAS — pero `tsc` (el compilador, usado
   para typecheck) no tiene ese conocimiento sin configurarlo explícitamente. Este es el
   **primer par** de archivos `.ios.ts`/`.android.ts` en todo el repo (confirmé con `find` — no
   hay precedente), así que nadie había topado este gap antes. Fix: agregar
   `"moduleSuffixes": [".ios", ".android", ""]` a `apps/mobile/tsconfig.json`.
2. **`SUPABASE_URL`/`SUPABASE_ANON_KEY` sin fallback** (`index.tsx:171-172`:
   `process.env.EXPO_PUBLIC_SUPABASE_URL` sin `?? ''`) — son `string | undefined` desde siempre,
   pero ningún call site anterior los pasaba a una función con parámetro tipado estrictamente
   `string`. `signInWithAppleSupabase({ supabaseUrl: string; supabaseAnonKey: string })` es el
   primer call site que lo expone. Fix más simple y consistente con el patrón ya usado para
   `RC_API_KEY` (`?? ''`): en la llamada (`index.tsx:2062-2065`), usar
   `supabaseUrl: SUPABASE_URL ?? ''` / `supabaseAnonKey: SUPABASE_ANON_KEY ?? ''` — no tocar las
   constantes compartidas (usadas en todo el archivo) para minimizar el blast radius.

**Por qué esto no se detectó antes de mi auditoría:** `apps/mobile/package.json` no tiene script
`"typecheck"` — confirmé con `grep` que solo aparece en `package.json` raíz (`turbo run
typecheck`) y `turbo.json`, nunca en `apps/mobile/package.json`. Turbo solo corre `typecheck` en
paquetes que lo definen, así que **`apps/mobile` nunca fue parte de la verificación "paquetes
individuales pasan"** — ese paquete específico no tiene cobertura de typecheck en el pipeline
del monorepo hoy. No es un problema introducido por este PR, pero sí explica cómo 2 errores
reales pasaron la revisión sin que la tabla de verificación los reflejara con precisión.

**Recomendación (no bloqueante para este PR, pero vale la pena):** agregar
`"typecheck": "tsc --noEmit"` a `apps/mobile/package.json` para que el gate exista hacia
adelante — evita que esto se repita.

VEREDICTO AUDITORÍA POST-IMPLEMENTACIÓN: La arquitectura, los dos ajustes obligatorios de la
ronda anterior, y el resto de items §4.1-4.7 están correctamente implementados — verificado
independientemente, no solo leído. **2 fixes mecánicos requeridos antes de merge** (moduleSuffixes
+ `?? ''` en las 2 líneas de `signInWithAppleSupabase`), ambos triviales y de bajo riesgo. Tras
esos 2 fixes, sin objeciones para merge a `staging` (sigue pendiente Fase 1 humana para probar
end-to-end, eso no cambia).

**Aprobación Alex:**

```text
(pendiente — validación en dispositivo / TestFlight tras Fase 1 credenciales; y tras Cursor
incorporar los 2 fixes de typecheck de la auditoría post-implementación Claude arriba)
```

### Checklist revisión Claude

- [x] Orden de ejecución y dependencias coherentes
- [x] Archivos y diffs conceptuales completos vs PLAN-01 §4
- [x] Decisiones D3–D6 respetadas
- [x] Placeholders Fase 1 no bloquean trabajo paralelo
- [x] Puntos abiertos §10 resueltos o aceptados
- [x] Matriz §11 cubre todos los items 4.1–4.7
- [x] **Aprobado sin condiciones** — ajustes §6 y §9 incorporados y re-verificados en v1.1

**Notas de revisión Claude (2026-06-27):**

```text
Verificación técnica directa contra el código real (no solo lectura del plan): confirmadas
exactas las citas de línea en index.tsx (L2053/L2077 RC configure, L249 resolveRnAppInfoForWeb,
L2285-2311 deep link handler), la estructura modular de scripts/changelog/ (render.js,
version-map.js, etc. — sí existen como archivos separados), legal-consent.ts (3-valor enum
confirmado) y route.ts (Zod enum confirmado). react-native.config.js no existe aún (sin
conflicto). app.config.js: platforms todavía solo ["android"], sin bloque ios (confirmado).
Trabajo de investigación de Cursor: alta precisión.

DOS AJUSTES REQUERIDOS antes de implementar (no bloquean el plan, sí el código):

1) §6.2 paso 6 y §6.3 (persist-native-session.ts) — INEXACTO. Verifiqué que Purchases.logIn(uid)
   NO ocurre en el bloque de persistencia post-OAuth (L2285-2311). Ese bloque solo hace
   SecureStore + setIsAuthenticated + __rnInjectSession. RC logIn es LAZY: se dispara recién al
   momento de comprar (L2542 y L2597, comparando appUserID actual vs uid antes de
   purchasePackage). Si se construye persist-native-session.ts asumiendo que debe incluir
   Purchases.logIn ahí, el flujo de Apple quedaría inconsistente con el de Google (que no lo
   hace en ese punto). Corrección: el helper compartido debe cubrir SOLO SecureStore/
   setIsAuthenticated/__rnInjectSession; RC logIn ya es lazy y platform-agnostic en los dos
   puntos de compra existentes — el flujo de Apple lo hereda gratis, sin tocar nada ahí.

2) §9.1 (changelog tooling) — FALTA un guard de buildNumber. update-changelog.js:119-122 ya
   tiene un guard "versionCode <= maxExistingVc → warning" (existe por una razón documentada en
   memoria del proyecto: Play Store rechaza versionCode reusado). Apple aplica la MISMA regla a
   CFBundleVersion (buildNumber debe ser estrictamente creciente o App Store Connect rechaza el
   build). El plan v1.0 no propone un guard equivalente para --buildNumber. Agregar el mismo
   patrón de warning (maxExistingBn) antes de implementar, para no repetir la misma clase de bug
   que el proyecto ya solucionó una vez para Android.

Notas menores, no bloqueantes:
- §8.3: el script de ícono necesita "sharp" resolvable desde apps/mobile. Hoy sharp está en
  apps/web/package.json y @img/sharp-linux-x64 en la raíz, pero no confirmado en
  apps/mobile/package.json — agregar como devDependency ahí o confirmar que el hoisting de npm
  workspaces ya lo resuelve, antes de escribir el script.
- §5.1: "ios": { "distribution": "internal" } en el perfil preview es redundante — eas.json:15
  ya tiene "distribution": "internal" a nivel de perfil (aplica a ambas plataformas por
  herencia). No es un error, solo puede simplificarse a "ios": {} si no hay otra clave iOS-
  específica que agregar ahí.

Puntos abiertos §10 — de acuerdo con las 4 propuestas v1.0 (buildNumber "1" independiente de
Android, sin perfil staging-ios, Apple solo en WebView RN iOS no en Safari web, deploy web
staging obligatorio antes de TestFlight E2E). Sin objeciones.

Resto del plan (orden de ejecución §2, archivos de §3/§4/§5/§7/§8, matriz §11, alcance fuera
§13): correcto y bien acotado. Decisiones D3-D6 respetadas sin reabrir.

VEREDICTO: Aprobado para implementación, condicionado a incorporar los 2 ajustes requeridos
(RC logIn NO en persist-native-session.ts; agregar guard de buildNumber monotónico) antes de
escribir el código de 4.3 y 4.6 respectivamente. El resto (4.1, 4.2, 4.4, 4.5, 4.7) puede
implementarse tal cual está descrito.
```

**Incorporación Cursor (v1.1, 2026-06-27):**

```text
Ajuste 1 — §6.2 paso 6, §6.3, §6.7: persist-native-session.ts excluye Purchases.logIn;
documentada regla RC lazy (L2542/L2597) y paridad con Google OAuth L2285-2311.

Ajuste 2 — §9.1, §9.3: guard monotónico buildNumber (maxExistingBn + warn), patrón L119-122.

Menores — §5.1 preview ios {} (distribution heredada); §8.3 sharp devDep apps/mobile.
```

**Re-verificación Claude (v1.1, 2026-06-27):**

```text
Releí §6.2/6.3/6.7, §5.1, §8.3-9.3 completos en el documento actualizado, no solo el resumen de
Cursor. Confirmado:

- §6.2 paso 6 + nota "Regla RC": ahora dice explícitamente "sin Purchases.logIn en este punto" y
  distingue correctamente los otros 2 paths que SÍ lo llaman (cold-start restore ~L2096, bridge
  auth_token ~L2664) de los que NO (callback OAuth Google ~L2285-2311) — esa distinción no la
  pedí explícitamente, es una precisión correcta que Cursor agregó por su cuenta, buena señal.
- §6.3: persist-native-session.ts ahora dice "Prohibido incluir Purchases.logIn" sin ambigüedad.
- §6.7: criterio de done nuevo y verificable ("grep en handler Apple = 0 matches").
- §9.1/9.3: guard implementado con el mismo patrón exacto de L119-122 (maxExistingBn, mismo
  mensaje de warning), y el criterio de done ahora incluye re-ejecutar con un valor ≤ último para
  confirmar que el warning realmente dispara — no solo "lo agregué", sino "está probado que
  funciona".
- §5.1: simplificado a "ios": {} con la razón correcta (distribution ya hereda del perfil).
- §8.3: sharp ahora explícitamente como devDependency de apps/mobile, no asumiendo hoisting.

Sin objeciones nuevas. La condición de mi aprobación anterior queda satisfecha íntegramente.

VEREDICTO FINAL (Claude): Aprobado sin condiciones para implementación de 4.1-4.7 contra la
matriz §11. Falta únicamente la luz verde explícita de Alex (gate de negocio, no técnico) para
que Cursor empiece a escribir código en feature/ios-app-store-launch.
```

**Aprobación Alex:**

```text
(pendiente — luz verde explícita para implementar)
```
