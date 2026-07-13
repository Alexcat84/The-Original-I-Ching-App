# Plan — Migración React 18.2 → 19.2 (web), paso a paso

**Código:** `20260713-PLAN-WEB-01 react-19-migration` · **Familia:** WEB · **Estado:** paused

> **⏸️ PAUSADO (2026-07-13).** Ejecución iniciada y detenida en Fase 1. Dos blockers confirmados: (1) `ViewTransition` **no está en React estable 19.2.7** (sin build experimental ni export en el tarball de npm) → el motivo del upgrade no existe en el canal estable; (2) el install limpio del árbol web dedupea las deps a `react@18.2.0` (sus peers lo aceptan) y solo un override **global** de `react` lo forzaría a 19.2.7, arrastrando `apps/mobile` fuera del 19.0.0 de Expo. Se revirtió la rama `chore/react-19`; **`apps/mobile` nunca se tocó (19.0.0)**. La Fase 1 §three.js (limpieza de `@react-three`) se rescató como commit independiente en staging/main. Reanudar solo cuando haya un consumidor real de una API de React 19 o `ViewTransition` se estabilice. Ver [`20260713-PLAN-WEB-01b`](./20260713-PLAN-WEB-01b-react-19-migration-corrections.md) §Estado.

- **Fecha:** 2026-07-13
- **Rama objetivo:** `chore/react-19` → `staging` → `main`
- **Evaluación previa (obligatoria):** [`20260713-AUD-WEB-01-react-19-upgrade-assessment.md`](./20260713-AUD-WEB-01-react-19-upgrade-assessment.md)
- **Target:** `react@19.2.7` + `react-dom@19.2.7` · **Alcance:** `apps/web` + `packages/ui` + `overrides` raíz. **No** tocar `apps/mobile` (ya React 19).
- **Gate crítico:** hidratación dentro del WebView del APK (Fase 4). Nada se mergea a `main` sin pasar ese gate en dispositivo.

---

## Resumen de fases

| Fase | Qué | Gate de salida |
|------|-----|----------------|
| 0 | Preparación + rama | working tree limpio, backup verificado |
| 1 | Bump de versiones + `npm install` | `npm ls react` muestra 19.2.7 en el árbol web |
| 2 | Barrido de tipos (`tsc`) | `tsc --noEmit` verde en `apps/web` |
| 3 | Build + smoke browser | `npm run build` OK + smoke chat/marketing/tour |
| 4 | **Gate APK** (hidratación) | `assembleRelease` instalado y validado en dispositivo |
| 5 | View Transitions (opcional, commit aparte) | crossfade verificado en browser |
| 6 | Merge staging → main | validación del usuario |

---

## Fase 0 — Preparación

```bash
# working tree limpio
git status --short
# partir de staging actualizado
git checkout staging && git pull origin staging
git checkout -b chore/react-19
```

- Confirmar que el backup local de `tools/`/`reports/` sigue en `backup/local-assets-2026-07-11` (no relacionado, pero regla de oro antes de tocar dependencias).

---

## Fase 1 — Bump de versiones

### 1.1 `apps/web/package.json`
```diff
-    "react": "18.2.0",
-    "react-dom": "18.2.0",
+    "react": "19.2.7",
+    "react-dom": "19.2.7",
```
```diff
-    "@types/react": "^18.3.18",
-    "@types/react-dom": "^18.3.5",
+    "@types/react": "^19.2.0",
+    "@types/react-dom": "^19.2.0",
```

### 1.2 Raíz `package.json` → `overrides`
```diff
   "overrides": {
-    "react-dom": "18.2.0",
+    "react": "19.2.7",
+    "react-dom": "19.2.7",
```
> ⚠️ **Crítico:** si se olvida el override de `react-dom`, quedará clavado en 18 y chocará con `react@19` → "two Reacts". Añadir también `react` al override para fijar una sola versión en todo el árbol web.

### 1.3 `packages/ui/package.json`
```diff
   "peerDependencies": {
-    "react": "^18.2.0"
+    "react": "^18.2.0 || ^19.0.0"
   },
   "devDependencies": {
-    "@types/react": "~18.2.79",
-    "react": "18.2.0",
+    "@types/react": "~19.2.0",
+    "react": "19.2.7",
```
> Se deja el peer con `||` para no romper si algún consumidor futuro sigue en 18. `packages/i18n` **no se toca** (sin React).

### 1.4 Instalar
```bash
npm install                 # desde la raíz del monorepo
npm ls react react-dom      # verificar: 19.2.7 resuelto en el árbol web, 19.0.0 en mobile
npm run build --workspace @iching-oracle/ui   # recompilar dist/ de packages/ui
```

**Gate de salida Fase 1:** `npm ls react` no muestra `react@18.x` colgando del árbol web; `packages/ui/dist` recompilado.

> **Windows (solo build local del APK):** tras cualquier `npm install` re-aplicar el fix de `glob` en `node_modules/@expo/config-plugins/build/android/{Paths,Package}.js` (ver `CLAUDE.md`). No afecta al build web ni a EAS cloud.

---

## Fase 2 — Barrido de tipos

```bash
# codemod oficial de tipos v19 (revisar el diff, no aplicar a ciegas)
npx types-react-codemod@latest preset-19 ./apps/web/src

# barrido manual
cd apps/web && npx tsc --noEmit
```

Errores esperados (pocos, según scan del assessment): bordes de `ReactNode`, tipos de eventos, `children` implícito. Arreglar iterando hasta verde. Repetir en `packages/ui` si su `tsc` marca algo.

**Gate de salida Fase 2:** `tsc --noEmit` verde en `apps/web` y `packages/ui`.

---

## Fase 3 — Build + smoke en browser

```bash
cd apps/web
npm run build        # build de producción Next 15.5 + React 19 — debe compilar
npm run dev          # smoke manual
```

Checklist smoke (browser):
- [ ] Home marketing carga; navegación entre páginas (con el fade actual) sin errores de consola.
- [ ] Chat: consulta I Ching completa, historial, centro de tokens, export PDF.
- [ ] Tour de onboarding (`react-joyride`) arranca y avanza.
- [ ] Login / 2FA / Google OAuth.
- [ ] Sin warnings de hidratación nuevos en consola.

**Gate de salida Fase 3:** build OK + smoke sin regresiones.

---

## Fase 4 — GATE CRÍTICO: APK (hidratación en WebView)

> Este es el único punto de riesgo real. **No mergear a `main` sin pasarlo en dispositivo.**

```bash
cd apps/mobile
# APK de prueba firmado con debug.keystore local (ver CLAUDE.md)
./gradlew assembleRelease
# salida: apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

Instalar en teléfono y validar (apuntando el WebView a staging con el web ya en React 19):
- [ ] La clase `iching-rn-webview` se aplica y **persiste** tras hidratación (tema app en docs, safe-area insets correctos).
- [ ] Sin flash blanco/celeste al abrir ni al navegar entre docs (recarga completa).
- [ ] Chat: layout correcto (composer, alturas `:has(.iching-oracle-shell--chat)`), sin gaps.
- [ ] Navegación nativa ↔ WebView (docs, back), OAuth externo, purchase deep-link.
- [ ] Zoom de imágenes, export PDF, eliminación de chat.
- [ ] Sin errores nuevos en Sentry (buscar "hydration"/"Connection closed").

Alternativa cloud: `eas build --platform android --profile preview` si no hay entorno local.

**Gate de salida Fase 4:** APK validado en dispositivo, hidratación intacta.

---

## Fase 5 — View Transitions (commit separado, opcional)

Solo tras Fases 1–4 verdes. Es el objetivo "wow" que motivó el upgrade.

### 5.1 Habilitar el flag
```ts
// apps/web/next.config.mjs
const nextConfig = {
  experimental: { viewTransition: true },
  // …resto
};
```

### 5.2 Crossfade global suave
```tsx
// envolver el contenido de marketing (o root) con <ViewTransition> de React 19
import { ViewTransition } from "react";
// <ViewTransition>{children}</ViewTransition>
```
- Reemplaza el `MarketingPageFade` actual (fade CSS) por el crossfade nativo GPU si se desea, o convivir.
- Respetar `prefers-reduced-motion` vía CSS `::view-transition-*`.

### 5.3 (Opcional) shared-element morph
- Dar `viewTransitionName` al logo/glifo compartido entre páginas para el efecto de continuidad.

**Gate de salida Fase 5:** crossfade verificado en browser (Chromium/Safari); degradación limpia donde no haya soporte.

---

## Fase 6 — Merge

```bash
git checkout staging && git merge --no-ff chore/react-19
git push origin staging          # deploy staging (Vercel)
# validación del usuario en staging (web + APK contra staging)
git checkout main && git merge --no-ff staging && git push origin main
```

---

## Rollback

- El upgrade vive en `chore/react-19`; si un gate falla → no se mergea, se descarta la rama.
- Si ya está en staging y aparece regresión: `git revert` del merge; el `overrides` fija una sola versión, así que el revert deja el árbol consistente en 18 otra vez.
- `apps/mobile` nunca se tocó → sin rollback mobile.

---

## Checklist de archivos tocados

- [ ] `apps/web/package.json` — react/react-dom/@types
- [ ] `package.json` (raíz) — `overrides` react + react-dom
- [ ] `packages/ui/package.json` — peerDep + devDeps
- [ ] `apps/web/**` — fixes de tipos post-codemod (si los hay)
- [ ] `apps/web/next.config.mjs` — `experimental.viewTransition` (Fase 5)
- [ ] `apps/web/src/components/marketing/*` — `<ViewTransition>` (Fase 5)

**No tocar:** `apps/mobile/**`, `packages/i18n/**`, datasets, migraciones DB, product IDs RevenueCat.
