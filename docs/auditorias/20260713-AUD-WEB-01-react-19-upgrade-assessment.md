# Evaluación — Upgrade React 18.2 → 19.2 (web)

**Código:** `20260713-AUD-WEB-01 react-19-upgrade-assessment` · **Familia:** WEB · **Estado:** open

- **Fecha:** 2026-07-13
- **Rama objetivo:** `chore/react-19` (aún no creada)
- **Alcance:** `apps/web` (Next.js) + `packages/ui`. El shell nativo del APK y `apps/mobile` **no** entran en alcance.
- **Plan asociado:** [`20260713-PLAN-WEB-01-react-19-migration.md`](./20260713-PLAN-WEB-01-react-19-migration.md)
- **Motivación:** desbloquear la **View Transitions API nativa** (`experimental.viewTransition` + `<ViewTransition>` de React 19) para transiciones de página tipo crossfade / shared-element morph en el sitio de marketing, además de `use()`, Actions y mejoras de hidratación.

---

## 0. Veredicto

**Riesgo global: BAJO-MODERADO. Upgrade acotado y solo-web.**

- El código **no usa ninguna API eliminada** en React 19.
- **Todas** las librerías React en uso ya soportan React 19.
- `apps/mobile` **ya corre React 19.0.0** (Expo SDK 53) → React 19 ya está validado dentro del monorepo.
- El trabajo real se concentra en: (1) barrido de tipos `@types/react` 18→19 con `tsc`, y (2) **validar la hidratación dentro del WebView del APK** (único punto genuinamente sensible).

---

## 1. Estado actual — split de versiones

| Superficie | React | Runtime | Notas |
|---|---|---|---|
| **Web (Next.js)** | **18.2.0** | react-dom (browser) | `next@15.5.19` — Next 15 ya soporta React 19 |
| **APK — shell nativo** | **19.0.0** ✅ | `react-native@0.79.6` (Expo ^53) | renderer nativo, **no** usa react-dom |
| **`packages/ui`** | peerDep `^18.2.0` | DOM (web-only) | único consumidor: el web |
| **`packages/i18n`** | — | agnóstico | sin React; compartido web+mobile ✅ |

Versiones exactas hoy:
- `apps/web`: `react@18.2.0`, `react-dom@18.2.0`, `@types/react@^18.3.18`, `@types/react-dom@^18.3.5`, `next@15.5.19`.
- `apps/mobile`: `react@19.0.0`, `@types/react@~19.0.10`, `react-native@0.79.6`, `expo@^53`.
- `packages/ui`: peerDep `react@^18.2.0`; devDeps `react@18.2.0`, `@types/react@~18.2.79`.
- Raíz `package.json` → `overrides`: `"react-dom": "18.2.0"` (⚠️ no hay override de `react`).

**Objetivo:** `react@19.2.7` + `react-dom@19.2.7` (última estable, publicada 2026-06-01).

### Punto crítico sobre el APK — dos Reacts aislados

El APK son **dos runtimes React separados**:
1. **Shell nativo** (React Native, ya React 19) — barra nativa, WebView, SQLite, sync.
2. **Contenido web dentro del WebView** — la app Next (hoy React 18).

**No comparten instancia.** Se comunican por el bridge DOM/JS (`postMessage`, `injectedJavaScript`, `window.ReactNativeWebView`), no a nivel React. **Subir el web a React 19 NO toca el shell nativo** — solo cambia el React que corre dentro del WebView. El impacto en el APK es exclusivamente vía el contenido web que carga.

---

## 2. Análisis por superficie

### 2.1 Chat web (`app/chat/page.tsx`, ~7k líneas)
- Componente más grande → mayor superficie de smoke-test, pero **sin APIs rotas**.
- Usa `react-joyride` (tour de onboarding) → peer `"16.8 - 19"`, **compatible** ✅.
- Riesgo: **bajo**. Requiere smoke completo (consulta, historial, tokens, 2FA, export PDF).

### 2.2 Marketing web
- Server components + islas cliente; `createPortal` (×3, **sigue soportado** en 19); sin patrones rotos.
- **Beneficio directo:** desbloquea View Transitions nativas para el crossfade/morph.
- Riesgo: **muy bajo**.

### 2.3 APK — inyección web / hidratación (⚠️ punto más sensible)
El shell nativo inyecta JS que **manipula el DOM antes y después de la hidratación** (`apps/mobile/app/index.tsx`):
- `injectedJavaScriptBeforeContentLoaded`: setea CSS vars (`--rn-safe-area-inset-*`) + clase `iching-rn-webview` **antes** del paint.
- `injectedJavaScript` (≈ línea 306): **re-añade** `iching-rn-webview` después de cargar (la hidratación de React la quita).
- Web: 5× `suppressHydrationWarning` (en `layout.tsx` y `page.tsx`) para el theme-script + nonce.

**Cambio relevante en React 19:** el manejo de mismatch de hidratación mejoró — en vez de tirar error, React 19 hace *client re-render* del subárbol afectado y muestra un diff más claro. Con `suppressHydrationWarning` bien puesto (como está), **debería seguir funcionando**, pero es **exactamente aquí donde hay que probar en el APK real** (el baile de la clase `iching-rn-webview` + los estilos inyectados con `:has()`).
- Riesgo: **moderado, testeable**. Es el gate crítico del plan.

### 2.4 Packages compartidos
- `packages/ui`: web-only, DOM (`OracleShell.tsx`). Solo hay que subir el peerDep a `^19` (o `^18 || ^19`) + devDeps.
- `packages/i18n`: sin React → **cero impacto** ✅.

---

## 3. Compatibilidad de dependencias

Todas las librerías **en uso** soportan React 19:

| Lib | Versión | Peer / soporte React 19 | Veredicto |
|---|---|---|---|
| `next` | 15.5.19 | Next 15 soporta React 19 | ✅ |
| `react-joyride` | 3.1.0 | peer `16.8 - 19` | ✅ |
| `next-axiom` | 1.10.0 | peer react `>=18` | ✅ |
| `react-markdown` | 9.1.0 | peer `>=18` | ✅ |
| `@sentry/nextjs` | 10.58.0 | v8+ soporta 19 | ✅ |
| `@revenuecat/purchases-js` | 1.29.1 | SDK JS, no acopla React | ✅ |
| `@react-three/fiber` `^8` + `@react-three/drei` `^9` | — | fiber v8 = React 18 | ⚠️ **0 imports en el código** (solo aparece en `.next/cache`). Dep muerta, resto de la animación ritual pendiente. **Sin riesgo runtime.** Upgrade a fiber v9 / drei v10 **solo si** se llega a usar, o quitarlas. |

---

## 4. APIs eliminadas en React 19 — scan del código

Escaneo sobre `apps/web/src` + `packages/ui/src`. **Todo limpio:**

| API eliminada | Ocurrencias | Notas |
|---|---|---|
| `ReactDOM.render` / `hydrate` / `unmountComponentAtNode` / `findDOMNode` | **0** | solo `createPortal` (×3), que **sigue soportado** |
| string refs (`ref="foo"`) | **0** | los matches eran `href=` (falsos positivos) |
| `propTypes` / `defaultProps` en función | **0** | |
| legacy context (`contextTypes`/`childContextTypes`) / `createFactory` / `createClass` | **0** | |
| `forwardRef` | **0** | no hay que migrar a ref-as-prop |
| `createRoot` / `hydrateRoot` directos | **0** | los maneja Next internamente |

---

## 5. TypeScript (`@types/react` 18 → 19)

Fuente principal de churn en cualquier upgrade React 19. **Scan muy favorable:**

| Patrón que rompe con tipos v19 | Ocurrencias |
|---|---|
| `useRef()` sin argumento | **0** |
| `JSX.Element` (namespace movido) | **0** |
| `React.FC` / `FC<>` | **0** |

**Conclusión:** se esperan **pocos** errores de tipos (bordes de `ReactNode` / tipos de eventos / children). El número exacto solo se conoce corriendo `tsc` tras bumpear los tipos. Codemod oficial disponible: `npx types-react-codemod@latest preset-19 ./apps/web/src`.

---

## 6. Hidratación + inyección WebView

- 5× `suppressHydrationWarning` (patrón correcto, **sin cambios** en React 19).
- Sin `createRoot`/`hydrateRoot` en código de app (Next los maneja).
- `createPortal` (×3) soportado.
- Inyección nativa que toca `document.documentElement` (clase + CSS vars) — mismo patrón que hoy; React 19 no lo cambia estructuralmente pero **debe validarse en el APK**.
- **Aún no** se usa ningún hook exclusivo de React 19 (`use()`, `useActionState`, `useOptimistic`) → nada que migrar; quedarían **disponibles** tras el upgrade.

---

## 7. Superficie de testeo (dónde podría romper)

| Área | Prioridad | Motivo |
|---|---|---|
| **APK WebView — hidratación + clase `iching-rn-webview`** | 🔴 Alta | único punto sensible real; probar en dispositivo/emulador (`assembleRelease`) |
| **`tsc` del web** | 🔴 Alta | churn de tipos v19 |
| **Chat completo** (consulta, historial, tokens, 2FA, PDF) | 🟠 Media | componente más grande |
| **Tour (`react-joyride`)** | 🟠 Media | peer al límite (19) |
| **Build de producción (Vercel) + CI** | 🟠 Media | verificar build Next 15.5 + React 19 |
| **Marketing + docs (browser + APK)** | 🟢 Baja | código limpio |
| **Tests (vitest)** | 🟢 Baja | son de lógica, sin `@testing-library/react` → React no los afecta |

---

## 8. Conclusión

No hay ningún **bloqueador de código**: cero APIs rotas, cero patrones de tipos problemáticos, todas las libs en uso compatibles, y el mobile ya validó React 19 en el monorepo. Es **viable y de riesgo contenido**. El trabajo se concentra en el barrido de `tsc` y en validar la hidratación en el APK. Ejecución paso a paso en el plan asociado ([`20260713-PLAN-WEB-01-react-19-migration.md`](./20260713-PLAN-WEB-01-react-19-migration.md)).
