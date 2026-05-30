# Estandarización i18n — Resumen del cambio completo

Documento de referencia del trabajo realizado en la rama `feat/i18n-standardization` (base: `staging`).  
**PR:** [#4 — feat(i18n): standardize copy across 11 locales](https://github.com/Alexcat84/The-Original-I-Ching-App/pull/4)

**Fecha del trabajo:** mayo 2026  
**Idiomas soportados:** 11 (`es`, `en`, `pt`, `fr`, `de`, `it`, `ja`, `zh`, `ko`, `ar`, `hi`)  
**Locale de referencia:** `en` (`DEFAULT_LOCALE` en `packages/i18n/src/locales.ts`)

---

## 1. Situación anterior (problemas)

### Arquitectura fragmentada

| Área | Antes |
|------|--------|
| **Paquete central** | `@iching-oracle/i18n` existía con ~30 módulos, pero la UI principal seguía con islas grandes fuera del paquete |
| **`page.tsx`** | ~1.100+ líneas de copy inline: `UI_COPY`, `TOUR_COPY`, `LANGUAGE_LABELS`, mapas de veredictos huesos, función `verdictLabel()` |
| **Wizards manuales** | `manual-wizard-messages.ts` y `yarrow-wizard-messages.ts` en `apps/web` con `Partial<Record<AppLocale, …>>` |
| **ConsultationRecordCard** | ~200 líneas de strings embebidas por locale |
| **PDF export** | Bifurcación `isEsPdf` + detección de idioma del input para el chrome del PDF (no el locale de la app) |
| **Emails 2FA** | Plantillas hardcodeadas (solo ES/EN implícito) |
| **2FA / token panel** | `Partial<Record<AppLocale, …>>`; hindi (`hi`) con spread desde `en` |
| **SEO hreflang** | `HREFLANG_LOCALES` desalineado (9 códigos; faltaban `ar`, `hi`) |
| **Backend / motores** | Fallbacks en español (`"Consulta en progreso"`, yong 用九/用六); detección de idioma oracle-bones más débil que I Ching |
| **`commonStrings.appTitle`** | Mismo título en español repetido en los 11 locales |
| **`/api/consult` errores** | Mensajes `auth_required`, `session_limit`, `insufficient_credits` solo en español |
| **Gobernanza** | Sin auditoría CI; fácil reintroducir `Record<AppLocale>` o `Partial` en web |
| **Código muerto** | `chat-suggestions.ts` (solo español, sin referencias) |
| **README** | Decía "9 Languages" |

### Patrón no deseado

```text
apps/web/src/app/page.tsx
  └── const UI_COPY: Record<AppLocale, { … }> = { es: { … }, en: { … }, … }
  └── const TOUR_COPY: Record<AppLocale, …>
  └── const LANGUAGE_LABELS: Record<AppLocale, string>
```

La web mezclaba getters del paquete **y** bloques locales enormes, lo que impedía escalar idiomas con typecheck como red de seguridad.

---

## 2. Objetivo alcanzado

Centralizar **toda la copy de usuario** en `@iching-oracle/i18n` con:

- Tipos `Record<AppLocale, T>` completos (sin `Partial` en producto)
- Getters `getXxxMessages(locale)` / helpers de formato
- Fallback único a `en` vía `parseAppLocale` / `DEFAULT_LOCALE`
- **Sin** `next-intl` ni `apps/web/messages/*.json` (Fase 2 post-lanzamiento)
- Auditoría CI que falla si la copy vuelve a colarse en web

---

## 3. Commits de la rama (8)

| # | Commit | Descripción |
|---|--------|-------------|
| 1 | `c5f155f` | Theme toggle → `theme-toggle-ui.ts` |
| 2 | `6a14b38` | **Stage 1** — `i18n-audit` + CI; islas UI migradas a `packages/i18n` |
| 3 | `e49a395` | **Stage 2** — `token-panel-ui` y `two-factor-ui` `Record` completos (hi sin spread) |
| 4 | `0d7cd40` | **Stage 3** — PDF export + email 2FA por locale de la app |
| 5 | `573045d` | **Stage 4** — hreflang 11 locales; context-engine; iching-engine; oracle-bones |
| 6 | `9f5fc8b` | **Stage 5** — guía i18n actualizada; eliminar `chat-suggestions.ts` |
| 7 | `3b28870` | README → 11 idiomas |
| 8 | `7f8a2a9` | `appTitle` localizado + `consult-api-ui` para errores de `/api/consult` |

---

## 4. Qué se hizo, por fase

### Stage 0 — Theme toggle (previo al plan principal)

- Nuevo `packages/i18n/src/messages/theme-toggle-ui.ts`
- `ThemeToggle.tsx` consume getter; sin mapas locales

### Stage 1 — Gobierno + islas grandes

**Herramientas**

- `tools/i18n-audit.mjs` — falla CI si detecta:
  - `Partial<Record<AppLocale` en `packages/i18n` o `apps/web`
  - `isEsPdf` en web
  - `Record<AppLocale` en `apps/web/src` (whitelist: `AuthLocalePicker.tsx` props)
  - `HREFLANG_LOCALES` no alineado con `SUPPORTED_LOCALES` (acepta `[...SUPPORTED_LOCALES]`)
- `package.json` → script `npm run i18n:audit`
- `.github/workflows/ci.yml` → paso tras `typecheck`

**Nuevos módulos i18n (extraídos de `page.tsx` y componentes)**

| Módulo | Origen | Getter principal |
|--------|--------|------------------|
| `home-chat-ui.ts` | `UI_COPY` | `getHomeChatUiMessages` |
| `home-tour-ui.ts` | `TOUR_COPY` | `getHomeTourUiMessages` |
| `home-drawer-ui.ts` | drawer lateral | `getHomeDrawerUiMessages` |
| `ritual-status-ui.ts` | estados del ritual | `getRitualStatusUiMessages` |
| `language-labels.ts` | `LANGUAGE_LABELS` | `getLanguageLabels` |
| `oracle-bones-verdict-ui.ts` | `verdictLabel()` | `getOracleBonesVerdictLabel` |
| `consultation-record-ui.ts` | `ConsultationRecordCard` | `getConsultationRecordUiMessages` |
| `manual-coin-wizard-ui.ts` | `manual-wizard-messages.ts` | `getManualWizardMessages` |
| `manual-yarrow-wizard-ui.ts` | `yarrow-wizard-messages.ts` | `getYarrowWizardMessages` |
| `pdf-export-ui.ts` | chrome PDF | `getPdfExportUiMessages`, `formatPdfEntryLine`, … |
| `two-factor-email-ui.ts` | Resend 2FA | `getTwoFactorEmailUiMessages`, `formatTwoFactorEmailBody` |

**Refactors web**

- `apps/web/src/app/page.tsx` — eliminados bloques `UI_COPY`, `TOUR_COPY`, `LANGUAGE_LABELS`, `verdictLabel`; usa `useMemo(() => getXxx(locale), [locale])`
- `ConsultationRecordCard.tsx`, wizards manuales — importan desde `@iching-oracle/i18n`
- **Eliminados:** `manual-wizard-messages.ts`, `yarrow-wizard-messages.ts` (movidos al paquete)

### Stage 2 — Records completos

- `two-factor-ui.ts`: `Partial` → `Record`; bloque `hi` completo (~85 claves)
- `token-panel-ui.ts`: mismo patrón; `hi` standalone

### Stage 3 — PDF y emails

- `exportChatPdf()` en `page.tsx`: sin `isEsPdf`; usa `locale` de la app + `getPdfExportUiMessages`
- `pdf-chat-export.ts`: `drawPdfContinuationChrome` recibe `PdfExportUiMessages` (no `isEs: boolean`)
- `api/auth/2fa/email/send/route.ts`: locale desde cookie `UI_LOCALE_COOKIE` → plantilla i18n

### Stage 4 — SEO y backend

- `seo-canonical.ts`: `HREFLANG_LOCALES = [...SUPPORTED_LOCALES]` (11 locales)
- `context-engine`: depende de `@iching-oracle/i18n`; `resolveSessionContext({ locale })` → `getHomeChromeUiMessages`
- `consult/route.ts`: pasa `locale` al context engine
- `iching-engine`: fallbacks 用九/用六 en inglés neutro
- `oracle-bones-interpretation.ts`: `isLikelyWrongLanguage` alineado con `interpretation.ts` (it/pt)
- `CLAUDE.md`: 9 → 11 idiomas

### Stage 5 — Limpieza y docs

- `docs/workflows/I18N_GUIDE.md` actualizado (módulos, audit, sin Records en `page.tsx`)
- Eliminado `apps/web/src/lib/chat-suggestions.ts`

### Post-stage — Deuda menor

- `locales.ts` → `commonStrings.appTitle` localizado por locale
- Nuevo `consult-api-ui.ts` → errores API consulta en 11 idiomas
- `README.md` → tabla y lista de idiomas con AR/HI

---

## 5. Estructura actual

### Paquete `@iching-oracle/i18n`

```text
packages/i18n/
├── src/
│   ├── locales.ts              # SUPPORTED_LOCALES, DEFAULT_LOCALE, commonStrings
│   ├── locale-resolve.ts       # parseAppLocale, isAppLocale
│   ├── locale-storage.ts       # UI_LOCALE_STORAGE_KEY
│   ├── index.ts                # re-exporta todos los getters y tipos
│   └── messages/               # 41 archivos *.ts
│       ├── home-*.ts           # chat, tour, drawer, chrome, session
│       ├── *-page-ui.ts        # login, pricing, faq, guia, legal, …
│       ├── manual-*-wizard-ui.ts
│       ├── pdf-export-ui.ts
│       ├── two-factor-*.ts
│       ├── consult-api-ui.ts
│       ├── token-panel-ui.ts
│       ├── language-labels.ts
│       ├── oracle-bones-verdict-ui.ts
│       ├── consultation-record-ui.ts
│       ├── theme-toggle-ui.ts
│       ├── mobile-native-ui.ts
│       └── interpolate.ts
└── dist/                       # build tsc (requerido antes de typecheck web)
```

**Patrón de cada módulo**

```typescript
const HOME_CHAT_UI: Record<AppLocale, HomeChatUiMessages> = {
  en: { … },
  es: { … },
  // … los 11 locales
};

export function getHomeChatUiMessages(locale: AppLocale): HomeChatUiMessages {
  return HOME_CHAT_UI[locale] ?? HOME_CHAT_UI[DEFAULT_LOCALE];
}
```

### Consumo en web (`apps/web`)

```text
apps/web/src/
├── app/
│   ├── page.tsx                 # getters + useMemo por locale (sin Record local)
│   ├── layout.tsx               # site meta, html lang/dir (RTL: ar)
│   └── api/
│       ├── consult/route.ts     # consult-api-ui + locale cookie/body
│       └── auth/2fa/email/send/ # two-factor-email-ui
├── components/
│   ├── AuthLocalePicker.tsx     # única whitelist Record<AppLocale> (props)
│   ├── ConsultationRecordCard.tsx
│   ├── ThemeToggle.tsx
│   └── manual-iching/*.tsx
└── lib/
    ├── seo-canonical.ts         # hreflang = SUPPORTED_LOCALES
    ├── pdf-chat-export.ts
    └── use-app-locale.ts        # cookie/localStorage UI locale
```

### Mobile (`apps/mobile`)

- Sin cambios estructurales en esta rama: ya tenía 11 locales en `LOCALES` + sync WebView vía `__rnSetLocale` / `UI_LOCALE_STORAGE_KEY`
- Copy nativa en `mobile-native-ui.ts` del paquete i18n

### Backend / motores

| Paquete | Cambio |
|---------|--------|
| `@iching-oracle/context-engine` | Fallback tema sesión localizado |
| `@iching-oracle/iching-engine` | Fallbacks yong en EN |
| `@iching-oracle/claude` (oracle-bones) | Detección idioma ampliada |

---

## 6. Flujo de locale en runtime

```mermaid
flowchart LR
  subgraph client [Cliente web / WebView]
    UI[Selector idioma]
    LS[localStorage iching_ui_locale]
    CK[cookie UI_LOCALE_COOKIE]
  end
  subgraph pkg [@iching-oracle/i18n]
    PARSE[parseAppLocale]
    GET[getXxxMessages]
  end
  subgraph server [API]
    CONSULT[/api/consult]
    EMAIL[/api/auth/2fa/email/send]
  end
  UI --> LS
  LS --> CK
  CK --> PARSE
  PARSE --> GET
  CK --> CONSULT
  CK --> EMAIL
  GET --> UI
```

- **UI:** locale de la app (cookie/storage) → getters i18n
- **Oráculo (respuesta IA):** idioma de la pregunta del usuario (puede diferir del locale UI)
- **PDF / email 2FA / errores API consulta:** locale UI, no idioma detectado del texto

---

## 7. Definition of Done (cumplido en código)

| Criterio | Estado |
|----------|--------|
| `rg "Partial<Record<AppLocale"` en repo productivo | Vacío |
| `rg "isEsPdf"` | Vacío |
| `rg "Record<AppLocale" apps/web/src` | Solo `AuthLocalePicker` (tipos props) |
| `npm run typecheck` | Verde |
| `npm run i18n:audit` | Verde |
| 11 locales en hreflang | Sí |
| PDF / 2FA email / errores consult API | Por locale UI |

---

## 8. Pendiente (fuera del merge de código)

- [ ] QA manual en `en`, `es`, `ar`, `hi` (tour, 2FA, PDF, RTL, APK)
- [ ] CI verde en PR #4 y merge → `staging` → `main`
- [ ] Entrada en `CHANGELOG.md`
- [ ] Panel `/admin` — rehacer más adelante (Axiom, Sentry, feedback); fuera de alcance i18n
- [ ] Fase 2 post-lanzamiento: `next-intl` formal (opcional, documentado en guía)

---

## 8.1 Auditoría externa (2026-05-30)

Auditoría sobre `feat/i18n-standardization` vs `staging`. **Resultado:** Definition of Done en verde (`typecheck`, `i18n:audit`, sin `Partial`/`isEsPdf`, hreflang 11, PDF/2FA/consult API por locale UI).

| Hallazgo | Severidad | Estado |
|----------|-----------|--------|
| `creditsExhaustedBlock(..., locale = "es")` en `credits-ui-copy.ts` | Corregir pre-merge | **Corregido** → `DEFAULT_LOCALE` (`en`) |
| `ruleExplanation` en español en `iching-engine` (prompt LLM, no UI) | Baja | Aceptado; no bloquea merge |
| Encoding PowerShell al leer `locales.ts` | N/A | Artefacto de consola, no bug en fuente |

El único fix de código aplicado tras la auditoría fue el default de locale en `creditsExhaustedBlock`. El call site en `page.tsx` ya pasaba `locale` explícito; el default incorrecto era riesgo latente.

---

## 9. Comandos útiles

```bash
# Build paquete i18n (requerido tras cambios)
npm run build --workspace=@iching-oracle/i18n

# Verificación local
npm run typecheck
npm run i18n:audit

# Buscar regresiones
rg "Partial<Record<AppLocale" packages/i18n apps/web
rg "Record<AppLocale" apps/web/src
rg "isEsPdf" apps/web
```

---

## 10. Documentos relacionados

- [`I18N_GUIDE.md`](./I18N_GUIDE.md) — checklist operativo para **añadir un idioma nuevo**
- [`CLAUDE.md`](../../CLAUDE.md) — contexto del proyecto (11 idiomas)
- PR [#4](https://github.com/Alexcat84/The-Original-I-Ching-App/pull/4) — diff completo vs `staging`
