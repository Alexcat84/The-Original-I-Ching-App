# Ops: Reestructura del sitio — web de marketing en `/`, chat en `/chat`
**Código:** `20260711-OPS-WEB-01 marketing-site-restructure` · **Familia:** WEB · **Estado:** active

Registro de los cambios del 2026-07-11 que convierten theoriginaliching.com en una
página web completa (diseño "tinta y cinabrio", export de Cursor en `iching-export/`,
solo referencia local) y mueven el chat/oráculo a su propia ruta.

Commits (staging): `13f74044`, `da6bd195`, `5e993eab`, `3db3cc7d`.

---

## 1. Arquitectura de rutas

| Antes | Después |
|-------|---------|
| `/` = chat SPA (7 188 líneas) | `/` = home de marketing (server component + islas cliente) |
| — | `/chat` = chat SPA movido intacto (`app/chat/page.tsx`), **noindex** |
| Docs con `doc-nav` propio | Docs envueltas en `MarketingDocShell` (nav + footer marketing) |

## 2. Compatibilidad APK (sin release móvil)

- El APK instalado carga `BASE_URL` = `/`. Un script inline **pre-hidratación** en el
  home detecta el WebView (`ReactNativeWebView in window` o clase `iching-rn-webview`)
  y hace `location.replace("/chat")`.
- Detección endurecida: `window.ReactNativeWebView` es inmune a la carrera de timing
  en la que la hidratación de React reescribe `<html className>` y borra la clase
  inyectada por `injectedJavaScriptBeforeContentLoaded`.
- Dentro del APK: los links a docs/feedback **permanecen** en el panel del chat; las
  páginas doc ocultan el chrome marketing y muestran link de regreso a `/chat`.
- En browser: el chat ya no muestra links a docs/feedback; muestra "← Volver al
  oráculo" → `/`. Paso 8 del tour de onboarding (doc links) se omite en browser.

## 3. Flujo registro-primero

- CTAs de marketing (Consultar, Iniciar consulta, Regístrate, Desbloquear
  biblioteca) → `/login?mode=signup` (query nueva: abre el tab de registro).
- `resolvePostAuthClientRoute` (`src/lib/post-auth-legal.ts`) devuelve `/chat`
  (antes `/`) — cubre login, OAuth callback y sesión ya activa en `/login`.
- Retornos de superficies de app → `/chat`: complete-legal, checkout/success,
  gates de library/mutation-explorer, admin.

## 4. Checkout por tier

- RevenueCat Web Purchase Links soporta `?package_id=` para preseleccionar pack
  (docs oficiales RC). `buildPlansCheckoutUrl` acepta `packageId` opcional.
- Cada card de precio envía su product ID (`tokens_seeker_20`, etc.). Si el
  identifier no coincide en RC, degrada a la página de selección (flujo previo).
- **Pendiente:** verificar en el dashboard RC que los package identifiers
  coinciden con los product IDs; ajustar mapeo si difieren.
- Sin sesión, la card lleva a `/login?mode=signup` (registro primero).

## 5. i18n

- `packages/i18n/src/messages/marketing-ui.ts` — nav/footer/home completos en los
  11 locales como `Record<AppLocale, T>` (sin patrón L() de fallback).
- Home server-rendered con `resolveDocLocale()`; el selector de idioma del nav
  hace `router.refresh()` para que las secciones RSC sigan al picker.
- Docs re-skineadas reutilizan su contenido i18n existente sin cambios.

## 6. Sistema de diseño

- `apps/web/src/app/marketing.css` — tokens (paleta tinta #0d0b0b / cinabrio
  #c53d2e / oro #c9a24b), keyframes, clases `mk-*`, responsive (el export era
  desktop-only 1280px), `prefers-reduced-motion`.
- `.mk-doc` re-mapea las variables de tema de la app (`--fg`, `--accent`,
  `--title-shell`, `--bar-border`…) a la paleta tinta: las páginas doc y sus
  componentes anidados (timeline de audits, acordeón FAQ) se ven oscuros sin
  tocar su markup. Marketing es dark-only; el chat conserva su toggle.
- Hero: `HexaglifoCanvas` — 2 200 partículas morphing entre los 64 glifos
  (1 200 en móvil); datos compactos generados desde `@iching-oracle/iching-data`
  en `src/lib/marketing/hexagram-glyphs.ts`.

## 7. SEO

- `robots.ts`: disallow `/chat`; allow `/feedback`. `sitemap.ts`: + `/feedback`.
- `/chat` con `robots: noindex` en su layout.
- Canonical/hreflang sin cambios (esquema cookie-based, una URL por página).

## 8. Verificación realizada (local, dev server + Playwright)

- `/` y las 10 páginas doc renderizan el tema tinta (es/ja, 1440px y 390px).
- Simulación WebView: `/` redirige a `/chat`; doc-links visibles en chat APK,
  ocultos en browser; chrome marketing oculto en docs APK.
- Cero errores de hidratación en `/` (fix: `suppressHydrationWarning` en el
  nonce del script guard). Typecheck + `i18n:audit` + tests post-auth OK.

## 9. Pendientes

- [ ] Validación visual del usuario en staging → merge a main.
- [ ] Verificar package identifiers en dashboard RevenueCat (§4).
- [ ] Próximo release APK: apuntar `BASE_URL` directo a `/chat` (elimina el hop
      por el guard).
- [ ] Fase 2 diseño: profundizar re-skin por página (watermarks caligráficos,
      TOC sticky en guia/notes) si se desea fidelidad total al export.
