# Guía para agregar un nuevo idioma — The Original I Ching App

Documento operativo para agentes de desarrollo en cada expansión de idioma.

**Arquitectura vigente (post-estandarización, mayo 2026):** toda la copy de usuario vive en `@iching-oracle/i18n` (`packages/i18n`) con `Record<AppLocale, T>` completos y getters `getXxxMessages(locale)`. **No** usar `next-intl` ni `apps/web/messages/*.json` (Fase 2 post-lanzamiento).

**Historial del cambio de arquitectura:** [`I18N_STANDARDIZATION.md`](./I18N_STANDARDIZATION.md)

---

## Principios (obligatorios)

| Regla | Detalle |
|-------|---------|
| **Fuente de verdad** | `packages/i18n` — un módulo por superficie de producto |
| **Locale de referencia** | `en` (`DEFAULT_LOCALE` en `locales.ts`) |
| **Tipos** | `Record<AppLocale, …>` completo — **prohibido** `Partial<Record<AppLocale, …>>` |
| **Web** | **Prohibido** añadir bloques `Record<AppLocale, …>` en `apps/web/src` (whitelist: props de `AuthLocalePicker.tsx`) |
| **Fallback** | `parseAppLocale()` / getters → `DEFAULT_LOCALE` si el código no es válido |
| **Defaults en APIs** | Usar `DEFAULT_LOCALE`, nunca `"es"` hardcodeado como fallback silencioso |
| **CI** | `npm run i18n:audit` debe pasar antes del merge |

---

## Idiomas actuales (11)

`EN`, `ES`, `PT`, `FR`, `DE`, `IT`, `JA`, `ZH`, `KO`, `AR`, `HI`

| Código | Idioma |
|--------|--------|
| `en` | English (**referencia / default**) |
| `es` | Español |
| `pt` | Português |
| `fr` | Français |
| `de` | Deutsch |
| `it` | Italiano |
| `ja` | 日本語 |
| `zh` | 中文 (`zh-Hans` en `<html lang>` vía `htmlLangFromAppLocale`) |
| `ko` | 한국어 |
| `ar` | العربية (**RTL**) |
| `hi` | हिन्दी |

**Registro central:** `SUPPORTED_LOCALES` y `AppLocale` en [`packages/i18n/src/locales.ts`](../../packages/i18n/src/locales.ts)

---

## Tres canales de locale (no mezclar)

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. UI locale (app)                                          │
│    Cookie iching_ui_locale + localStorage iching_ui_locale  │
│    → getters i18n, PDF chrome, emails 2FA, errores /consult │
├─────────────────────────────────────────────────────────────┤
│ 2. Idioma del oráculo (respuesta IA)                         │
│    Detectado del texto de la pregunta; puede ≠ UI locale    │
│    → prompt Claude / interpretación                         │
├─────────────────────────────────────────────────────────────┤
│ 3. Instrucciones técnicas LLM (no UI)                       │
│    p. ej. ruleExplanation en iching-engine — fuera de guía  │
└─────────────────────────────────────────────────────────────┘
```

Al añadir un idioma, la UI y los mensajes server-side usan el **canal 1**. Probar también **canal 2** con una consulta real en el idioma nuevo.

---

## Pre-requisitos

- [ ] Código ISO 639-1 (2 letras, minúsculas, coherente con `AppLocale`)
- [ ] ¿**RTL**? → pasos marcados **[RTL]**
- [ ] Traducciones revisadas por hablante nativo — **nunca** solo traducción automática
- [ ] Etiqueta nativa para el selector (ej. `Русский`, no `Russian`)

---

## Paso 0 — Registro central (obligatorio primero)

- [ ] Añadir código a `SUPPORTED_LOCALES` en [`packages/i18n/src/locales.ts`](../../packages/i18n/src/locales.ts)
- [ ] Añadir bloque en `commonStrings` (`appTitle`, `consult`, `deepen`, `newSession`) — **`appTitle` localizado**, no repetir español en todos los locales
- [ ] `npm run build --workspace=@iching-oracle/i18n`
- [ ] `npm run typecheck` — TypeScript exigirá el nuevo locale en **todos** los `Record<AppLocale, …>` del paquete

> Tras este paso, el typecheck fallará hasta completar los ~41 módulos de mensajes. Eso es esperado.

---

## Paso 1 — Paquete `@iching-oracle/i18n`

Traducir **todas** las claves en **cada** archivo de `packages/i18n/src/messages/` (~41 módulos). Patrón:

```typescript
const EXAMPLE_UI: Record<AppLocale, ExampleUiMessages> = {
  en: { … },
  // … idiomas existentes …
  xx: { … }, // nuevo
};

export function getExampleUiMessages(locale: AppLocale): ExampleUiMessages {
  return EXAMPLE_UI[locale] ?? EXAMPLE_UI[DEFAULT_LOCALE];
}
```

### Módulos por superficie

| Módulo | Uso |
|--------|-----|
| **Chat principal** | |
| `home-chrome-ui.ts` | Barra, opciones, biblioteca, `consultationInProgress` |
| `home-chat-ui.ts` | Copy del chat (`page.tsx`): logout, chips, avisos |
| `home-tour-ui.ts` | Tour 9 pasos |
| `home-drawer-ui.ts` | Drawer / historial lateral |
| `home-session-ui.ts` | Errores de sesión, historial, consulta en cliente |
| `ritual-status-ui.ts` | Estados del ritual |
| `language-labels.ts` | Etiquetas nativas del selector |
| `oracle-bones-verdict-ui.ts` | Veredictos huesos en UI |
| `theme-toggle-ui.ts` | Tema claro/oscuro |
| **Componentes** | |
| `consultation-record-ui.ts` | `ConsultationRecordCard` |
| `manual-coin-wizard-ui.ts` / `manual-yarrow-wizard-ui.ts` | Wizards manuales |
| **API / server-side copy** | |
| `consult-api-ui.ts` | Errores JSON de `POST /api/consult` (auth, límite hilo, tokens) |
| `pdf-export-ui.ts` | Chrome del export PDF |
| `two-factor-email-ui.ts` | Plantillas email 2FA (Resend) |
| **Auth, tokens, legal** | |
| `login-page-ui.ts` | Login/registro, toggles contraseña |
| `two-factor-ui.ts` | Modal 2FA (Record completo) |
| `token-panel-ui.ts` | Panel de tokens |
| `credits-notice-ui.ts` | Avisos de créditos agotados |
| `auth-callback-ui.ts` | Callback OAuth |
| `delete-account-page-ui.ts` | Baja de cuenta |
| `privacy-page-ui.ts` / `terms-page-ui.ts` | Legal |
| **Marketing y docs** | |
| `pricing-ui.ts` / `token-pack-marketing-ui.ts` / `guia-packs-ui.ts` | Precios y packs |
| `faq-page-ui.ts` | FAQs (arrays largos por locale) |
| `feedback-page-ui.ts` | `/feedback` |
| `guia-page-ui.ts` / `quickstart-page-ui.ts` / `doc-nav-ui.ts` | Documentación |
| `library-page-ui.ts` / `notes-page-ui.ts` | Biblioteca y notas |
| `site-meta-ui.ts` | SEO title/description |
| `cookie-consent-ui.ts` / `checkout-success-ui.ts` | Consent, checkout |
| `onboarding-ui.ts` | Nombre del oráculo |
| **Presentación I Ching** | |
| `oracle-presentation-ui.ts` / `iching-mutation-ui.ts` / `app-traceability-ui.ts` | Presentación y trazabilidad |
| **Mobile nativo** | |
| `mobile-native-ui.ts` | Diálogos APK (PDF, imagen, borrar chat) |

- [ ] Traducir **todas** las keys — sin spread `{ ...en, … }` para rellenar idiomas nuevos
- [ ] Actualizar textos que citen el **número de idiomas** (FAQ, marketing, OG) → N+1
- [ ] Exportaciones en [`packages/i18n/src/index.ts`](../../packages/i18n/src/index.ts): solo si añades módulo nuevo (bloques en módulos existentes no requieren cambio de exports)

---

## Paso 2 — Web (`apps/web`)

> **No** crear `apps/web/messages/[codigo].json`. **No** añadir mapas locales en `page.tsx`.

### Selector y persistencia

- [ ] Etiqueta nativa en `language-labels.ts`
- [ ] Orden en `LOCALE_SELECT_ORDER` en [`page.tsx`](../../apps/web/src/app/page.tsx) (inglés primero)
- [ ] [`AuthLocalePicker.tsx`](../../apps/web/src/components/AuthLocalePicker.tsx) — recibe `labels` del padre; no hardcodear
- [ ] Cookie `iching_ui_locale` + storage vía [`SessionDocLocaleBridge`](../../apps/web/src/components/SessionDocLocaleBridge.tsx) y [`use-app-locale`](../../apps/web/src/lib/use-app-locale.ts)

### Chat principal

[`page.tsx`](../../apps/web/src/app/page.tsx) solo usa getters con `useMemo`:

```typescript
const ui = useMemo(() => getHomeChatUiMessages(locale), [locale]);
const tour = useMemo(() => getHomeTourUiMessages(locale), [locale]);
// … home-chrome, drawer, ritual-status, token-panel, etc.
```

- [ ] Completar módulos home-* listados arriba — **no** editar `page.tsx` para añadir strings

### Rutas API (locale UI)

| Ruta | Resolución locale | Módulo i18n |
|------|-------------------|-------------|
| `POST /api/consult` | `body.language` → cookie `UI_LOCALE_COOKIE` → `parseAppLocale` | `consult-api-ui.ts` |
| `POST /api/auth/2fa/email/send` | Cookie `UI_LOCALE_COOKIE` | `two-factor-email-ui.ts` |
| Export PDF (cliente) | `locale` de `useAppLocale` | `pdf-export-ui.ts` |

- [ ] [`credits-ui-copy.ts`](../../apps/web/src/lib/credits-ui-copy.ts): si hay parámetro `locale` opcional, default = `DEFAULT_LOCALE` (no `"es"`)

### Componentes

- [ ] `ConsultationRecordCard` → `getConsultationRecordUiMessages`
- [ ] Wizards → `getManualWizardMessages` / `getYarrowWizardMessages`
- [ ] Resto de páginas (`login`, `pricing`, `feedback`, `guia`, …) → getters existentes del paquete

### RTL **[RTL]**

- [ ] `RTL_LOCALES` en [`DocumentLangSync.tsx`](../../apps/web/src/components/DocumentLangSync.tsx)
- [ ] `htmlDir` en [`layout.tsx`](../../apps/web/src/app/layout.tsx)
- [ ] Probar drawer, formularios, FAQ; monedas del wizard pueden quedar `dir="ltr"`

### SEO y marketing

- [ ] `site-meta-ui.ts` + `htmlLangFromAppLocale`
- [ ] [`seo-canonical.ts`](../../apps/web/src/lib/seo-canonical.ts): mantener `HREFLANG_LOCALES = [...SUPPORTED_LOCALES]` — **no** lista manual de códigos
- [ ] Contador de idiomas en [`layout.tsx`](../../apps/web/src/app/layout.tsx) (OG/Twitter), `faq-page-ui.ts`, [`README.md`](../../README.md)

### Legal

- [ ] FAQs, términos, privacidad completos; si no hay revisión jurídica, fallback documentado a `en` (no mezclar idiomas en la misma página)

---

## Paso 3 — Mobile (`apps/mobile`)

- [ ] Entrada en `LOCALES` en [`app/index.tsx`](../../apps/mobile/app/index.tsx) (`code`, `label`, `name`)
- [ ] `SUPPORTED_LOCALE_CODES_JSON` / scripts inyectados alineados
- [ ] `mobile-native-ui.ts` en el paquete i18n
- [ ] **[RTL]** `RTL_LOCALES` + `I18nManager.forceRTL`
- [ ] Sync WebView: `__rnSetLocale`, `UI_LOCALE_STORAGE_KEY` — no pisar idioma elegido en web
- [ ] Tour, logout, login, tutorial: copy en módulos web (WebView); validar en APK

---

## Paso 4 — Backend y motores

| Componente | Acción |
|------------|--------|
| [`interpretation.ts`](../../backend/claude/src/interpretation.ts) | `getLanguageName()` + `isLikelyWrongLanguage` si aplica |
| [`oracle-bones-interpretation.ts`](../../backend/claude/src/oracle-bones-interpretation.ts) | Idem |
| [`interpretation-structural-i18n.ts`](../../backend/claude/src/interpretation-structural-i18n.ts) | Encabezados del scroll |
| [`oracle-bones-structural-i18n.ts`](../../backend/claude/src/oracle-bones-structural-i18n.ts) | Veredictos / etiquetas |
| [`packages/oracle-bones-engine`](../../packages/oracle-bones-engine) | `defaultNegativeCharge` u otros fallbacks por locale |
| [`packages/context-engine`](../../packages/context-engine/src/index.ts) | `resolveSessionContext({ locale })` usa `getHomeChromeUiMessages` |
| `npm run build --prefix backend/claude` | Tras cambios en claude |

> `ruleExplanation` en `iching-engine` es copy **para el LLM**, no UI — fuera del checklist de traducción de producto.

---

## Paso 5 — Gobernanza CI (`tools/i18n-audit.mjs`)

El audit falla si detecta:

- `Partial<Record<AppLocale` en `packages/i18n` o `apps/web`
- `isEsPdf` en `apps/web`
- `Record<AppLocale` en `apps/web/src` fuera de `AuthLocalePicker.tsx`
- `HREFLANG_LOCALES` desalineado de `SUPPORTED_LOCALES` (válido: `[...SUPPORTED_LOCALES]` importado del paquete)

```bash
npm run build --workspace=@iching-oracle/i18n
npm run typecheck
npm run i18n:audit
```

El paso `i18n audit` corre en [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) tras `typecheck`.

---

## Verificación técnica (antes del merge)

- [ ] `npm run typecheck` (monorepo)
- [ ] `npm run i18n:audit` verde
- [ ] `rg "Partial<Record<AppLocale"` → vacío
- [ ] `rg "Record<AppLocale" apps/web/src` → solo `AuthLocalePicker.tsx`
- [ ] `rg "isEsPdf" apps/web` → vacío
- [ ] Nuevo código en API usa `parseAppLocale` + getters, no strings inline

---

## QA final (obligatorio)

- [ ] Flujo completo: registro → consulta → biblioteca → ajustes → logout
- [ ] Consulta **real** en el idioma nuevo (I Ching + Huesos si aplica)
- [ ] Profundizar en hilo (`deepen`) en el idioma nuevo
- [ ] PDF export — etiquetas en idioma UI
- [ ] Email 2FA — subject/body en idioma UI
- [ ] Errores de tokens / auth en `/api/consult` en idioma UI
- [ ] Modo claro y oscuro
- [ ] Web desktop + móvil (~390px)
- [ ] APK: selector nativo, login WebView, tour 9 pasos
- [ ] **[RTL]** dispositivo físico o emulador
- [ ] Cambio de idioma en caliente + persistencia
- [ ] `/feedback` en el idioma nuevo
- [ ] UI en un idioma + pregunta del oráculo en otro (canal 1 ≠ canal 2)

---

## Play Store (si aplica)

- [ ] Título, descripción, IAP, screenshots, Data Safety coherentes con idiomas ofrecidos

---

## Commit y post-merge

```
feat(i18n): add [nombre idioma] ([codigo]) language support
```

Post-merge:

- [ ] `CHANGELOG.md`
- [ ] Contador de idiomas: `layout.tsx`, `faq-page-ui.ts`, `README.md`
- [ ] Play Console si hubo traducciones de ficha

---

## Referencia rápida — archivos clave

```text
packages/i18n/src/locales.ts
packages/i18n/src/messages/*.ts          (todos — ~41 módulos)
packages/i18n/src/index.ts
apps/web/src/app/page.tsx                (solo getters + useMemo)
apps/web/src/lib/credits-ui-copy.ts       (DEFAULT_LOCALE en defaults)
apps/web/src/lib/seo-canonical.ts         (HREFLANG = [...SUPPORTED_LOCALES])
apps/web/src/app/api/consult/route.ts     (consult-api-ui)
apps/web/src/app/api/auth/2fa/email/send/ (two-factor-email-ui)
apps/web/src/lib/pdf-chat-export.ts
apps/web/src/app/layout.tsx
apps/web/src/components/DocumentLangSync.tsx
apps/web/src/components/AuthLocalePicker.tsx   (única whitelist Record)
apps/mobile/app/index.tsx
packages/context-engine/src/index.ts
backend/claude/src/interpretation.ts
backend/claude/src/oracle-bones-interpretation.ts
tools/i18n-audit.mjs
docs/workflows/I18N_STANDARDIZATION.md    (historial arquitectura)
```

---

## Orden recomendado para el agente

1. `locales.ts` + `commonStrings`
2. Completar **todos** los módulos en `packages/i18n` (typecheck guiará)
3. `language-labels.ts` + mobile `LOCALES`
4. Backend Claude + motores (structural i18n, oracle-bones)
5. SEO / README / contadores de idiomas
6. `npm run build --workspace=@iching-oracle/i18n` → `typecheck` → `i18n:audit`
7. QA manual (UI + oráculo + PDF + 2FA + APK)

**No asumir next-intl.** **No reintroducir mapas en `page.tsx`.** Contenido legal: exactitud jurídica > traducción automática.
