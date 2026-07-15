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

```bash
# Windows: re-aplicar el fix de glob en @expo/config-plugins tras npm install (CLAUDE.md)
cd apps/mobile
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
- [ ] Compra sandbox de un token pack (Billing 8.3.0; verificar acreditación de tokens).
- [ ] Verificación de integrity token (Play Integrity attest + backend verify).
- [ ] Consulta completa al oráculo con streaming SSE (texto llega incremental).
- [ ] Signout con `rn_signout=1`.
- [ ] Safe areas y edge-to-edge (status bar, insets, drawer; target 36 sin opt-out).
- [ ] Navegación back (WebView history + predictive back de Android 16).
- [ ] Origin guard: navegar a URL externa desde el chat y confirmar bloqueo cross-origin.
- [ ] Clase `iching-rn-webview` presente tras hidratación (tema app en docs, CSS inyectado).
- [ ] Export PDF, descarga de imagen, zoom modal.
- [ ] SQLite cache: sidebar instantáneo offline, sync incremental.

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

## Rollback (pre-merge)

- Todo vive en `chore/expo-sdk57`; si un gate falla, no se mergea.
- `apps/web`/`packages/ui` nunca se tocan: cero rollback web.
- Si ya está mergeado y el APK nuevo falla en producción: halt del rollout (Fase 7.5); el código en main no afecta al APK viejo ya distribuido.

## Checklist de archivos tocados

- [x] `apps/mobile/package.json` (bumps SDK 57 + sentry ~7.11.0)
- [x] `apps/mobile/app.config.js` (newArchEnabled true; sin pins de SDK)
- [x] `package.json` raíz (override expo-app-integrity a ~57.x)
- [x] `.github/scripts/check-react-resolution.mjs` (mobile derivado de package.json)
- [x] `package-lock.json` (regenerado por npm@10.9.2, nunca a mano)
- [ ] `apps/mobile` versionCode/version (Fase 7, al preparar el AAB)

**No tocar:** `apps/web/**`, `packages/ui/**`, migraciones DB, product IDs RevenueCat.
