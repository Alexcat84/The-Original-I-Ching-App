# Estandarización i18n — Resumen del cambio completo

Documento de referencia del trabajo en la rama `feat/i18n-standardization` (base: `staging`).

| Meta | Valor |
|------|--------|
| **PR** | [#4 — feat(i18n): standardize copy across 11 locales](https://github.com/Alexcat84/The-Original-I-Ching-App/pull/4) |
| **HEAD rama** | `957e277` (`chore(agents): refresh learned preferences after i18n standardization`) |
| **Sincronizado con** | `origin/feat/i18n-standardization` |
| **Fecha trabajo** | mayo 2026 |
| **Idiomas** | 11 — `es`, `en`, `pt`, `fr`, `de`, `it`, `ja`, `zh`, `ko`, `ar`, `hi` |
| **Locale referencia** | `en` (`DEFAULT_LOCALE` en `packages/i18n/src/locales.ts`) |
| **Módulos i18n** | 41 módulos UI + `interpolate.ts` (42 archivos en `messages/`) |

**Documentos relacionados**

- [`I18N_GUIDE.md`](./I18N_GUIDE.md) — checklist operativo para añadir un idioma (actualizado al proceso post-estandarización)
- [`CLAUDE.md`](../../CLAUDE.md) — contexto del proyecto (11 idiomas)

---

## 1. Situación anterior (problemas)

### Arquitectura fragmentada

| Área | Antes |
|------|--------|
| Paquete central | `@iching-oracle/i18n` con ~30 módulos, pero la UI principal tenía islas grandes fuera del paquete |
| `page.tsx` | ~1.100+ líneas de copy inline: `UI_COPY`, `TOUR_COPY`, `LANGUAGE_LABELS`, mapas de veredictos huesos, `verdictLabel()` |
| Wizards manuales | `apps/web/src/components/manual-iching/manual-wizard-messages.ts` y `yarrow-wizard-messages.ts` con `Partial<Record<AppLocale, …>>` |
| `ConsultationRecordCard` | ~200 líneas de strings embebidas por locale |
| PDF export | Bifurcación `isEsPdf` + idioma del input para chrome PDF (no locale UI) |
| Emails 2FA | Plantillas hardcodeadas |
| 2FA / token panel | `Partial<Record<AppLocale, …>>`; `hi` con spread desde `en` |
| SEO hreflang | 9 códigos; faltaban `ar`, `hi` |
| Backend / motores | Fallbacks ES (`"Consulta en progreso"`, yong 用九/用六); oracle-bones con detección de idioma más débil |
| `commonStrings.appTitle` | Título en español repetido en los 11 locales |
| `/api/consult` errores | `auth_required`, `session_limit`, `insufficient_credits` solo en español |
| `credits-ui-copy.ts` | Default `locale = "es"` en `creditsExhaustedBlock` |
| Gobernanza | Sin auditoría CI |
| Código muerto | `apps/web/src/lib/chat-suggestions.ts` |
| README | "9 Languages" |

### Patrón eliminado

```text
apps/web/src/app/page.tsx
  └── const UI_COPY: Record<AppLocale, { … }>
  └── const TOUR_COPY: Record<AppLocale, …>
  └── const LANGUAGE_LABELS: Record<AppLocale, string>
```

---

## 2. Objetivo alcanzado

Centralizar **toda la copy de usuario** en `@iching-oracle/i18n`:

- `Record<AppLocale, T>` completos — **sin** `Partial` en producto
- Getters `getXxxMessages(locale)` y helpers de formato
- Fallback único a `en` vía `parseAppLocale` / `DEFAULT_LOCALE`
- Sin `next-intl` ni `apps/web/messages/*.json`
- CI: `npm run i18n:audit` tras `typecheck`

### Tres canales de locale (estado actual)

| Canal | Uso | Resolución |
|-------|-----|------------|
| **UI** | Getters, PDF chrome, email 2FA, errores `/api/consult` | Cookie `iching_ui_locale` + `localStorage` (`iching_ui_locale_v1`) + `body.language` en consult |
| **Oráculo** | Respuesta IA | Idioma detectado de la pregunta (puede ≠ UI) |
| **LLM técnico** | `ruleExplanation` en `iching-engine` | Español — solo prompt interno, no UI |

---

## 3. Commits de la rama (10)

| # | Commit | Descripción |
|---|--------|-------------|
| 1 | `c5f155f` | Theme toggle → `theme-toggle-ui.ts` |
| 2 | `6a14b38` | **Stage 1** — `i18n-audit` + CI; islas UI → `packages/i18n` |
| 3 | `e49a395` | **Stage 2** — `token-panel-ui` y `two-factor-ui` `Record` completos (`hi` sin spread) |
| 4 | `0d7cd40` | **Stage 3** — PDF export + email 2FA por locale UI |
| 5 | `573045d` | **Stage 4** — hreflang; `context-engine`; `iching-engine`; oracle-bones |
| 6 | `9f5fc8b` | **Stage 5** — primera actualización `I18N_GUIDE.md`; eliminar `chat-suggestions.ts` |
| 7 | `3b28870` | README → 11 idiomas |
| 8 | `7f8a2a9` | `appTitle` localizado por locale + `consult-api-ui.ts` |
| 9 | `30ab092` | `creditsExhaustedBlock` → `DEFAULT_LOCALE`; crea este documento |
| 10 | `957e277` | `AGENTS.md` — preferencias i18n y commits por stages |

---

## 4. Cambios por fase

### Stage 0 — Theme toggle

- `packages/i18n/src/messages/theme-toggle-ui.ts`
- `apps/web/src/components/ThemeToggle.tsx` → `getThemeToggleUiMessages(locale)`

### Stage 1 — Gobierno + islas UI

**CI / audit**

- `tools/i18n-audit.mjs`
- `package.json` → `"i18n:audit": "node tools/i18n-audit.mjs"`
- `.github/workflows/ci.yml` → paso `i18n audit` después de `typecheck`

**Audit falla si hay:** `Partial<Record<AppLocale`, `isEsPdf`, `Record<AppLocale` en web (whitelist: `AuthLocalePicker.tsx`), hreflang desalineado.

**Módulos nuevos (extraídos de web)**

| Módulo | Origen | Getter |
|--------|--------|--------|
| `home-chat-ui.ts` | `UI_COPY` | `getHomeChatUiMessages` |
| `home-tour-ui.ts` | `TOUR_COPY` | `getHomeTourUiMessages` |
| `home-drawer-ui.ts` | drawer | `getHomeDrawerUiMessages` |
| `ritual-status-ui.ts` | ritual | `getRitualStatusUiMessages` |
| `language-labels.ts` | `LANGUAGE_LABELS` | `getLanguageLabels` |
| `oracle-bones-verdict-ui.ts` | `verdictLabel()` | `getOracleBonesVerdictLabel` |
| `consultation-record-ui.ts` | `ConsultationRecordCard` | `getConsultationRecordUiMessages` |
| `manual-coin-wizard-ui.ts` | `manual-wizard-messages.ts` | `getManualWizardMessages` |
| `manual-yarrow-wizard-ui.ts` | `yarrow-wizard-messages.ts` | `getYarrowWizardMessages` |
| `pdf-export-ui.ts` | export PDF | `getPdfExportUiMessages`, `formatPdfEntryLine`, … |
| `two-factor-email-ui.ts` | Resend 2FA | `getTwoFactorEmailUiMessages`, `formatTwoFactorEmailBody` |

**Web**

- `page.tsx`: solo getters + `useMemo`; eliminados `UI_COPY`, `TOUR_COPY`, `LANGUAGE_LABELS`, `verdictLabel`
- Wizards y `ConsultationRecordCard` importan desde `@iching-oracle/i18n`
- **Eliminados:** `apps/web/src/components/manual-iching/manual-wizard-messages.ts`, `yarrow-wizard-messages.ts`

### Stage 2 — Records completos

- `two-factor-ui.ts`: `Partial` → `Record`; bloque `hi` completo
- `token-panel-ui.ts`: idem

### Stage 3 — PDF y emails

- `exportChatPdf()`: `getPdfExportUiMessages(locale)` — sin `isEsPdf`
- `pdf-chat-export.ts`: `drawPdfContinuationChrome(pdfUi: PdfExportUiMessages)`
- `api/auth/2fa/email/send/route.ts`: locale desde `UI_LOCALE_COOKIE`

### Stage 4 — SEO y backend

- `seo-canonical.ts`: `HREFLANG_LOCALES = [...SUPPORTED_LOCALES]`
- `context-engine`: depende de `@iching-oracle/i18n`; `resolveSessionContext({ locale })`
- `consult/route.ts`: pasa `locale` al context engine
- `iching-engine`: fallbacks yong 用九/用六 en inglés
- `oracle-bones-interpretation.ts`: `isLikelyWrongLanguage` alineado con `interpretation.ts`
- `CLAUDE.md`: 11 idiomas

### Stage 5 — Limpieza

- Eliminado `apps/web/src/lib/chat-suggestions.ts`
- Primera pasada de actualización de `I18N_GUIDE.md`

### Post-stages

| Commit | Cambio |
|--------|--------|
| `3b28870` | README: "11 Languages" + AR/HI en lista |
| `7f8a2a9` | `commonStrings.appTitle` localizado (11 títulos distintos); `consult-api-ui.ts` |
| `30ab092` | `credits-ui-copy.ts`: default `DEFAULT_LOCALE`; creación de `I18N_STANDARDIZATION.md` |
| `957e277` | `AGENTS.md`: i18n EN-first, commits por stages, WebView consolidado |

---

## 5. Inventario actual — `packages/i18n/src/messages/`

**41 módulos UI** (+ `interpolate.ts`). Todos exportados desde `packages/i18n/src/index.ts`.

| Grupo | Archivos |
|-------|----------|
| Chat / home | `home-chrome-ui`, `home-chat-ui`, `home-tour-ui`, `home-drawer-ui`, `home-session-ui`, `ritual-status-ui`, `language-labels`, `oracle-bones-verdict-ui`, `theme-toggle-ui` |
| Componentes | `consultation-record-ui`, `manual-coin-wizard-ui`, `manual-yarrow-wizard-ui` |
| API / server copy | `consult-api-ui`, `pdf-export-ui`, `two-factor-email-ui` |
| Auth / tokens | `login-page-ui`, `two-factor-ui`, `token-panel-ui`, `credits-notice-ui`, `auth-callback-ui`, `delete-account-page-ui` |
| Legal | `privacy-page-ui`, `terms-page-ui` |
| Marketing / docs | `pricing-ui`, `token-pack-marketing-ui`, `guia-packs-ui`, `faq-page-ui`, `feedback-page-ui`, `guia-page-ui`, `quickstart-page-ui`, `doc-nav-ui`, `library-page-ui`, `notes-page-ui`, `site-meta-ui` |
| Checkout / consent | `cookie-consent-ui`, `checkout-success-ui`, `onboarding-ui` |
| I Ching presentación | `oracle-presentation-ui`, `iching-mutation-ui`, `app-traceability-ui` |
| Mobile | `mobile-native-ui` |
| Utilidad | `interpolate.ts` |

**Patrón**

```typescript
const EXAMPLE_UI: Record<AppLocale, ExampleUiMessages> = { en: { … }, es: { … }, /* 11 */ };

export function getExampleUiMessages(locale: AppLocale): ExampleUiMessages {
  return EXAMPLE_UI[locale] ?? EXAMPLE_UI[DEFAULT_LOCALE];
}
```

---

## 6. Estructura en runtime

### Paquete

```text
packages/i18n/
├── src/
│   ├── locales.ts           # SUPPORTED_LOCALES, DEFAULT_LOCALE, commonStrings
│   ├── locale-resolve.ts    # parseAppLocale, isAppLocale
│   ├── locale-storage.ts    # UI_LOCALE_STORAGE_KEY = iching_ui_locale_v1
│   ├── index.ts             # exports públicos
│   └── messages/            # 42 archivos
└── dist/                    # npm run build --workspace=@iching-oracle/i18n
```

### Web (`apps/web`)

```text
apps/web/src/
├── app/
│   ├── page.tsx                          # useMemo + getters (sin Record local)
│   ├── layout.tsx                        # OG, html lang/dir (RTL: ar)
│   └── api/
│       ├── consult/route.ts              # getConsultApiUiMessages(uiLocale)
│       └── auth/2fa/email/send/route.ts  # two-factor-email-ui + cookie
├── components/
│   ├── AuthLocalePicker.tsx              # única whitelist Record<AppLocale>
│   ├── ConsultationRecordCard.tsx
│   ├── ThemeToggle.tsx
│   └── manual-iching/*.tsx
└── lib/
    ├── seo-canonical.ts                  # [...SUPPORTED_LOCALES]
    ├── pdf-chat-export.ts
    ├── credits-ui-copy.ts                # DEFAULT_LOCALE en default param
    └── use-app-locale.ts
```

### Mobile

- 11 locales en `apps/mobile/app/index.tsx` (`LOCALES`, `RTL_LOCALES`)
- Sync WebView: `__rnSetLocale`, `UI_LOCALE_STORAGE_KEY`
- Copy nativa: `mobile-native-ui.ts`

### Backend / motores

| Paquete | Cambio |
|---------|--------|
| `@iching-oracle/context-engine` | `getHomeChromeUiMessages` para fallback `consultationInProgress` |
| `@iching-oracle/iching-engine` | Fallbacks yong en EN (UI); `ruleExplanation` sigue en ES (LLM) |
| `@iching-oracle/claude` | Oracle-bones: `isLikelyWrongLanguage` ampliado (it/pt) |
| `@iching-oracle/oracle-bones-engine` | `defaultNegativeCharge` cubre 11 locales |

### Archivos eliminados (confirmado)

| Ruta | Estado |
|------|--------|
| `apps/web/src/lib/chat-suggestions.ts` | Eliminado |
| `apps/web/src/components/manual-iching/manual-wizard-messages.ts` | Eliminado (→ paquete) |
| `apps/web/src/components/manual-iching/yarrow-wizard-messages.ts` | Eliminado (→ paquete) |

---

## 7. Flujo de locale

```mermaid
flowchart LR
  subgraph client [Cliente / WebView]
    UI[Selector idioma]
    LS[localStorage iching_ui_locale_v1]
    CK[cookie iching_ui_locale]
  end
  subgraph pkg [@iching-oracle/i18n]
    PARSE[parseAppLocale]
    GET[getXxxMessages]
  end
  subgraph server [API]
    CONSULT[POST /api/consult]
    EMAIL[POST /api/auth/2fa/email/send]
  end
  UI --> LS --> CK --> PARSE --> GET --> UI
  CK --> CONSULT
  CK --> EMAIL
```

---

## 8. Definition of Done — verificación (mayo 2026)

Verificado en rama `feat/i18n-standardization` (auditoría externa 2026-05-30 + local):

| Criterio | Estado |
|----------|--------|
| `Partial<Record<AppLocale` en `packages/i18n` o `apps/web` | Vacío |
| `isEsPdf` en `apps/web` | Vacío |
| `Record<AppLocale` en `apps/web/src` | Solo `AuthLocalePicker.tsx` |
| `npm run typecheck` | Verde (12/12 tasks) |
| `npm run i18n:audit` | Verde |
| hreflang 11 locales | `[...SUPPORTED_LOCALES]` |
| PDF por locale UI | `getPdfExportUiMessages(locale)` |
| Email 2FA por locale UI | cookie → `two-factor-email-ui` |
| Errores `/api/consult` | `getConsultApiUiMessages(uiLocale)` |
| `creditsExhaustedBlock` default | `DEFAULT_LOCALE` (no `"es"`) |
| `appTitle` por locale | 11 títulos localizados en `locales.ts` |
| README | 11 idiomas |

---

## 9. Deuda técnica aceptada (no bloquea merge)

| Item | Alcance | Notas |
|------|---------|-------|
| `ruleExplanation` en `iching-engine/src/engine.ts` | Prompt LLM (~11 strings ES) | No visible en UI; bajo riesgo |
| Panel `/admin` | Español, config runtime | Rehacer más adelante (Axiom, Sentry, feedback) |
| Fase 2 `next-intl` | Opcional post-lanzamiento | Documentado en guía |

---

## 10. Pendiente operativo (humano / proceso)

- [ ] QA manual en `en`, `es`, `ar`, `hi` (tour, 2FA, PDF, RTL, APK)
- [ ] CI verde en PR #4 → merge a `staging` → `main`
- [ ] `CHANGELOG.md`
- [ ] Commit final de docs si hay cambios locales pendientes en `I18N_GUIDE.md` / este archivo

---

## 11. Comandos

```bash
npm run build --workspace=@iching-oracle/i18n
npm run typecheck
npm run i18n:audit

# Regresiones
rg "Partial<Record<AppLocale" packages/i18n apps/web
rg "Record<AppLocale" apps/web/src
rg "isEsPdf" apps/web
```

---

## 12. Referencias

- [I18N_GUIDE.md](./I18N_GUIDE.md) — añadir idioma nuevo (proceso vigente)
- [CLAUDE.md](../../CLAUDE.md)
- [PR #4](https://github.com/Alexcat84/The-Original-I-Ching-App/pull/4)
