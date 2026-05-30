# Guía para agregar un nuevo idioma — The Original I Ching App

Documento operativo para agentes de desarrollo en cada expansión de idioma.  
**Arquitectura actual:** i18n centralizado en `@iching-oracle/i18n` (`packages/i18n`) con objetos `Record<AppLocale, …>` por módulo — **no** usa `next-intl` ni `apps/web/messages/*.json` (Fase 2 post-lanzamiento).

---

## Idiomas actuales

`EN`, `ES`, `PT`, `FR`, `DE`, `IT`, `JA`, `ZH`, `KO`, `AR`, `HI` (**11 idiomas**)

| Código | Idioma |
|--------|--------|
| `en` | English (referencia / default) |
| `es` | Español |
| `pt` | Português |
| `fr` | Français |
| `de` | Deutsch |
| `it` | Italiano |
| `ja` | 日本語 |
| `zh` | 中文 (BCP 47: `zh-Hans` en `<html lang>`) |
| `ko` | 한국어 |
| `ar` | العربية (**RTL**) |
| `hi` | हिन्दी |

**Idioma base de referencia:** `en` (`DEFAULT_LOCALE` en `packages/i18n/src/locales.ts`)

**Fuente de verdad del tipo:** `SUPPORTED_LOCALES` y `AppLocale` en `packages/i18n/src/locales.ts`

---

## Pre-requisitos

- [ ] Confirmar código ISO 639-1 del idioma nuevo (2 letras, minúsculas, coherente con `AppLocale`)
- [ ] Confirmar si es **RTL** — pasos adicionales marcados **[RTL]**
- [ ] Obtener traducciones revisadas por hablante nativo
- [ ] **Nunca** usar traducción automática sin revisión humana
- [ ] Definir etiqueta nativa para el selector (ej. `Русский`, no `Russian`)

---

## Paso 0 — Registro central del locale (obligatorio primero)

- [ ] Añadir el código a `SUPPORTED_LOCALES` en [`packages/i18n/src/locales.ts`](../../packages/i18n/src/locales.ts)
- [ ] Añadir bloque en `commonStrings` del mismo archivo (`appTitle`, `consult`, `deepen`, `newSession`)
- [ ] Ejecutar `pnpm typecheck` en `packages/i18n` — TypeScript exigirá el nuevo locale en todos los `Record<AppLocale, …>` completos

---

## Paquete `@iching-oracle/i18n` (`packages/i18n/src/messages/`)

Traducir **todas** las claves en **cada** archivo del paquete (30 módulos). Patrón: añadir bloque `xx: { … }` al `Record<AppLocale, …>` correspondiente.

| Módulo | Uso |
|--------|-----|
| `login-page-ui.ts` | Login/registro, `showPasswordAria` / `hidePasswordAria` |
| `theme-toggle-ui.ts` | Botón tema claro/oscuro (`ThemeToggle`) |
| `home-chrome-ui.ts` | Barra del chat, opciones, biblioteca |
| `home-session-ui.ts` | Errores de consulta, historial |
| `faq-page-ui.ts` | FAQs completas por categoría (arrays largos por locale) |
| `privacy-page-ui.ts` / `terms-page-ui.ts` | Legal |
| `feedback-page-ui.ts` | Formulario `/feedback` y categorías |
| `pricing-ui.ts` / `token-pack-marketing-ui.ts` / `guia-packs-ui.ts` | Precios y packs |
| `guia-page-ui.ts` / `quickstart-page-ui.ts` / `doc-nav-ui.ts` | Documentación |
| `library-page-ui.ts` / `notes-page-ui.ts` | Biblioteca y notas |
| `two-factor-ui.ts` | 2FA (verificar si el objeto es `Partial` — debe quedar completo) |
| `token-panel-ui.ts` | Panel de tokens (idem `Partial`) |
| `onboarding-ui.ts` | Flujo nombre del oráculo |
| `mobile-native-ui.ts` | Diálogos nativos APK (guardar imagen, PDF, eliminar chat) |
| `site-meta-ui.ts` | Título/descripción SEO por locale |
| `cookie-consent-ui.ts` / `credits-notice-ui.ts` / `checkout-success-ui.ts` | Consent, avisos, checkout |
| `oracle-presentation-ui.ts` / `iching-mutation-ui.ts` / `app-traceability-ui.ts` | Presentación y trazabilidad |
| `auth-callback-ui.ts` / `delete-account-page-ui.ts` | Auth callback y baja de cuenta |

- [ ] Traducir **todas** las keys en cada módulo — ninguna string de referencia `en` sin traducir
- [ ] Archivos marcados `Partial<Record<AppLocale, …>>`: completar el nuevo locale o el fallback silencioso romperá UX
- [ ] Actualizar textos que mencionen el **número de idiomas** (p. ej. FAQ “11 languages”) en `faq-page-ui.ts` y equivalentes
- [ ] Exportaciones en [`packages/i18n/src/index.ts`](../../packages/i18n/src/index.ts): no suelen cambiar si solo se añaden bloques a módulos existentes

---

## Web (Next.js — `apps/web`)

> **No** crear `apps/web/messages/[codigo].json`. La web consume getters de `@iching-oracle/i18n` y copias locales grandes en componentes.

### Selector de idioma y cookies

- [ ] Añadir etiqueta nativa en `LANGUAGE_LABELS` en [`apps/web/src/app/page.tsx`](../../apps/web/src/app/page.tsx)
- [ ] Verificar orden en `LOCALE_SELECT_ORDER` (inglés primero por convención del producto)
- [ ] [`apps/web/src/components/AuthLocalePicker.tsx`](../../apps/web/src/components/AuthLocalePicker.tsx): recibe `labels` desde el padre — no hardcodear ahí
- [ ] Cookie / storage: `UI_LOCALE_STORAGE_KEY` (`iching_ui_locale`) vía [`SessionDocLocaleBridge`](../../apps/web/src/components/SessionDocLocaleBridge.tsx) y [`use-app-locale`](../../apps/web/src/lib/use-app-locale.ts)

### Bloques grandes en `page.tsx` (crítico)

Los únicos `Record<AppLocale, …>` en este archivo son **`LANGUAGE_LABELS`**, **`UI_COPY`** y **`TOUR_COPY`** (más mapas inline p. ej. veredictos huesos en funciones). Buscar con `rg "Record<AppLocale" apps/web/src/app/page.tsx`.

- [ ] `UI_COPY` — toda la UI del chat (incl. **logout**: `logoutConfirmTitle`, `logoutConfirmMessage`, `logoutConfirmYes`, `logoutConfirmNo`)
- [ ] `TOUR_COPY` — **tour de 9 pasos** (`step1`…`step9`, `back`, `next`, `skip`, `finish`, `replayLabel`, `tutorialLabel`)
- [ ] `LANGUAGE_LABELS` — nombre nativo en el selector (ej. `Русский`, no `Russian`)

### Páginas y componentes con strings propias

- [ ] [`apps/web/src/components/manual-iching/yarrow-wizard-messages.ts`](../../apps/web/src/components/manual-iching/yarrow-wizard-messages.ts) (`Partial` → completar)
- [ ] [`apps/web/src/components/manual-iching/manual-wizard-messages.ts`](../../apps/web/src/components/manual-iching/manual-wizard-messages.ts)
- [ ] [`apps/web/src/components/ConsultationRecordCard.tsx`](../../apps/web/src/components/ConsultationRecordCard.tsx) — mapas embebidos `turtle` / `ox` por locale (no usa `packages/i18n`; fácil de olvidar)
- [ ] Resto de rutas: `login`, `pricing`, `feedback`, `guia`, `library`, etc. — usan getters de `packages/i18n`; validar tras ampliar el paquete

### RTL [RTL]

- [ ] Añadir código a `RTL_LOCALES` en [`apps/web/src/components/DocumentLangSync.tsx`](../../apps/web/src/components/DocumentLangSync.tsx) (cliente)
- [ ] Añadir rama en [`apps/web/src/app/layout.tsx`](../../apps/web/src/app/layout.tsx) (`htmlDir`: hoy solo `ar === "rtl"`)
- [ ] Probar layouts con `dir="rtl"` en formularios, drawer y chat; mantener `dir="ltr"` en filas de monedas si aplica (`ManualIChingCoinWizard`)

### Legal, FAQs y feedback

- [ ] FAQs en `faq-page-ui.ts` — **todas** las entradas y categorías para el nuevo locale
- [ ] Términos legales: `terms-page-ui.ts` y `privacy-page-ui.ts`; si no hay traducción jurídica aprobada, documentar fallback explícito a `en` (no mezclar idiomas en la misma página)
- [ ] [`apps/web/src/app/feedback/page.tsx`](../../apps/web/src/app/feedback/page.tsx) — categorías vía `getFeedbackPageUiMessages`; API acepta `locale` del formulario

### SEO y metadatos

- [ ] `getSiteMetaUiMessages` + `htmlLangFromAppLocale` en [`packages/i18n/src/messages/site-meta-ui.ts`](../../packages/i18n/src/messages/site-meta-ui.ts) (mapear variantes regionales si aplica, ej. `zh` → `zh-Hans`)
- [ ] Añadir locale a `HREFLANG_LOCALES` en [`apps/web/src/lib/seo-canonical.ts`](../../apps/web/src/lib/seo-canonical.ts) — **deuda actual:** solo 9 códigos (`ar` e `hi` faltan); alinear siempre al añadir un idioma
- [ ] Actualizar contador en Open Graph/Twitter en [`layout.tsx`](../../apps/web/src/app/layout.tsx) (“11 languages” → N+1)
- [ ] Revisar copy de marketing en `page.tsx` / `faq-page-ui.ts` que cite el número de idiomas
- [ ] Actualizar [`README.md`](../../README.md) (hoy la tabla de features dice “9 Languages”; producción tiene 11)

### Export PDF y emails

- [ ] [`apps/web/src/lib/pdf-chat-export.ts`](../../apps/web/src/lib/pdf-chat-export.ts) — revisar strings fijas al exportar chat
- [ ] Rutas `apps/web/src/app/api/auth/2fa/email/` — verificar plantillas Resend / copy de códigos 2FA si solo están en `en`/`es`

### Login / contraseña

- [ ] `login-page-ui.ts`: `showPasswordAria` / `hidePasswordAria` y todo el formulario
- [ ] Verificar alineación del icono ojo: clases `.auth-password-wrapper` / `.auth-password-toggle` con `margin: 0` (el global `button { margin-top }` desalinea toggles absolutos)

### Tema claro / oscuro

- [ ] `theme-toggle-ui.ts` — etiquetas y `aria-label` del botón en la barra del chat (no hardcodear en `ThemeToggle.tsx`)

---

## App Mobile (Expo — `apps/mobile`)

- [ ] Añadir entrada en `LOCALES` en [`apps/mobile/app/index.tsx`](../../apps/mobile/app/index.tsx) (`code`, `label`, `name` nativo)
- [ ] Actualizar `SUPPORTED_LOCALE_CODES_JSON` / scripts inyectados que serializan la lista de códigos
- [ ] Traducir strings en `packages/i18n/src/messages/mobile-native-ui.ts` (diálogos nativos: permisos, PDF, confirmación borrar chat)
- [ ] **[RTL]** Añadir a `RTL_LOCALES` y verificar `I18nManager.forceRTL` (mismo archivo, ~línea 1700)
- [ ] Sincronización WebView ↔ nativo: `__rnSetLocale`, `UI_LOCALE_STORAGE_KEY` — probar que elegir idioma en web no lo pisa el shell nativo en `en`
- [ ] Tour de 9 pasos: vive en **`TOUR_COPY` en `page.tsx` web** (WebView) — no en un JSON aparte del shell
- [ ] Diálogo logout (4 keys): en **`UI_COPY` de `page.tsx`** (`logoutConfirm*`) — visible en WebView
- [ ] Visibilidad contraseña (2 keys): `login-page-ui.ts` en web `/login` dentro del WebView
- [ ] Botón **Tutorial**: `tutorialLabel` / `replayLabel` en `TOUR_COPY`
- [ ] Tras cambiar lista de locales, recompilar APK y validar selector nativo + strip `.auth-explore-strip`

---

## Backend — interpretación IA (`backend/claude`)

- [ ] Añadir idioma a `getLanguageName()` en [`backend/claude/src/interpretation.ts`](../../backend/claude/src/interpretation.ts)
- [ ] Idem en [`backend/claude/src/oracle-bones-interpretation.ts`](../../backend/claude/src/oracle-bones-interpretation.ts)
- [ ] Ampliar mapas estructurales en [`interpretation-structural-i18n.ts`](../../backend/claude/src/interpretation-structural-i18n.ts) (encabezados de sección del scroll)
- [ ] Ampliar [`oracle-bones-structural-i18n.ts`](../../backend/claude/src/oracle-bones-structural-i18n.ts) (veredictos / etiquetas localizadas)
- [ ] Si el locale es nuevo para el motor: valorar ampliar `isLikelyWrongLanguage` (hoy optimizado sobre todo para `es`/`en`)
- [ ] `pnpm run build --prefix backend/claude` (predev de web lo invoca)

---

## Chat interno y respuestas del oráculo

- [ ] El prompt de Claude ya instruye responder en el idioma de la pregunta con fallback al locale de la app (`/api/consult` envía `language: AppLocale`)
- [ ] Consulta de prueba **real** en el nuevo idioma (I Ching y, si aplica, Huesos de Oráculo)
- [ ] Verificar coherencia de nombres de hexagramas y citas clásicas (no mezclar EN/ES en la misma respuesta)
- [ ] Probar profundización en hilo (`deepen`) en el nuevo idioma
- [ ] Probar traductores (Wilhelm / Legge / Zhou Yi / Master) si el copy de opciones los menciona

---

## Play Store listing (si el mercado lo justifica)

- [ ] Traducción de título y descripción en Play Console
- [ ] Traducción de los productos IAP (packs de tokens) en Play Console
- [ ] Screenshots localizados si hay cambios visuales relevantes
- [ ] Data Safety / políticas: coherente con idiomas ofrecidos en la ficha

---

## Verificación técnica (antes del merge)

- [ ] `pnpm typecheck` (monorepo) — especialmente `packages/i18n` y `apps/web`
- [ ] `pnpm test` en paquetes afectados si existen tests de i18n
- [ ] Buscar locale huérfano: `rg "Record<AppLocale" --type ts` y `rg "Partial<Record<AppLocale"` — completar todos
- [ ] Buscar strings hardcodeadas: `rg '"es":|"en":' apps/web/src` en archivos no migrados
- [ ] Confirmar que `parseAppLocale` / API rechazan códigos no soportados con fallback a `en`

---

## QA final — obligatorio antes del merge

- [ ] Flujo completo en nuevo idioma: registro → consulta → biblioteca → ajustes → logout
- [ ] Sin keys sin traducir (no deben aparecer textos en inglés residual ni placeholders tipo `[missing: …]`)
- [ ] Modo claro y modo oscuro con el nuevo idioma activo
- [ ] Web desktop + viewport móvil (~390px)
- [ ] APK: selector nativo, WebView `/login`, chat principal, tour 9 pasos
- [ ] **[RTL]** Layout RTL en dispositivo físico o emulador (formularios, drawer, FAQ)
- [ ] Cambio de idioma en caliente (sin recargar) y persistencia tras cerrar app
- [ ] `/feedback` envía categorías y labels en el nuevo idioma

---

## Commit

```
feat(i18n): add [nombre idioma] ([codigo]) language support
```

---

## Actualizaciones post-merge

- [ ] Actualizar `CHANGELOG.md` (entrada manual; **no** hay `scripts/update-changelog.js` en el repo)
- [ ] Actualizar contador de idiomas en: `layout.tsx` (OG/Twitter), `faq-page-ui.ts`, `page.tsx` (marketing), `README.md`, `docs/audits/ARCHITECTURE_AUDIT.md` si aplica
- [ ] Play Store listing si se añadieron traducciones allí
- [ ] Comunicar al equipo si hay copy legal pendiente de revisión jurídica en el nuevo locale

---

## Referencia rápida — archivos “siempre tocar”

```
packages/i18n/src/locales.ts
packages/i18n/src/messages/*.ts          (todos, incl. theme-toggle-ui.ts)
apps/web/src/app/page.tsx                (LANGUAGE_LABELS, UI_COPY, TOUR_COPY)
apps/web/src/components/ThemeToggle.tsx  (solo getter i18n; sin mapas locales)
apps/web/src/components/ConsultationRecordCard.tsx
apps/web/src/lib/seo-canonical.ts
apps/web/src/lib/pdf-chat-export.ts
apps/web/src/app/layout.tsx              (htmlDir, OG copy)
apps/web/src/components/DocumentLangSync.tsx
apps/mobile/app/index.tsx                (LOCALES, RTL_LOCALES)
backend/claude/src/interpretation.ts
backend/claude/src/interpretation-structural-i18n.ts
backend/claude/src/oracle-bones-interpretation.ts
backend/claude/src/oracle-bones-structural-i18n.ts
README.md
```

---

## Notas para el agente

1. **Orden recomendado:** `locales.ts` → `packages/i18n` (typecheck fallará hasta completar Records) → `page.tsx` (3 Records) → wizards Partial → `ConsultationRecordCard` → mobile → backend claude (+ structural i18n) → SEO/README/layout → PDF/email → QA.
2. **No asumir next-intl:** el proyecto usa locale en cookie/localStorage + getters tipados.
3. **Contenido legal:** priorizar exactitud jurídica; mejor fallback `en` documentado que traducción automática.
4. **Idioma del oráculo:** la UI puede estar en un idioma y la pregunta en otro; el motor prioriza el idioma de la pregunta — probar ambos casos.
