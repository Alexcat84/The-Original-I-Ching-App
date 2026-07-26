# Brand Spec: The Original I Ching App

**Código:** `00000000-RPT-BRAND-01 brand-spec` · **Familia:** BRAND · **Estado:** reference · **Registro:** [`docs/registry.json`](docs/registry.json) · [`docs/INDEX.md`](docs/INDEX.md)

Especificación de marca extraída del código real (release 4.2.5). Todo lo que aparece
aquí está leído de los archivos fuente; donde un dato no existe en el código se escribe
**"no definido"** en vez de inventarlo. Este documento no modifica nada del sitio.

## Contexto: dos superficies de marca

El proyecto no usa Tailwind (no hay `tailwind.config.*` ni `postcss.config.*`; es CSS
plano con custom properties). Hay dos superficies con paletas distintas:

| Superficie | Archivo | Alcance | Tema |
|---|---|---|---|
| App / chat | `apps/web/src/app/globals.css` | producto (chat, oráculo, biblioteca) en `/chat` | claro + oscuro (`html[data-theme]`) |
| Sitio marketing | `apps/web/src/app/marketing.css` (scope `.mk-root`) | home `/` y páginas de docs re-skineadas | **solo oscuro** (tinta) |

Ambas comparten las mismas familias tipográficas (variables `--font-oracle-*` definidas en
`apps/web/src/lib/google-fonts-root.ts` y expuestas en `<html>`).

---

## 1. Paleta

### 1.1 App / chat (`globals.css`)

Tokens definidos por tema en `html[data-theme="light"]` (y `html:not([data-theme])` como
fallback claro) y `html[data-theme="dark"]`.

| Rol | Claro | Oscuro | Token |
|---|---|---|---|
| Fondo | `#e8f2f9` | `#000000` | `--bg` |
| Fondo profundo | `#dceaf4` | `#000000` | `--bg-deep` |
| Fondo medio | `#f2f8fc` | `#0a0a0a` | `--bg-mid` |
| Texto | `#1a2e3a` | `#eceff1` | `--fg` |
| Texto secundario | `#4a6573` | `#8ca5b3` | `--fg-muted` |
| Acento | `#2a9d8f` | `#4ecdc4` | `--accent` |
| Acento hover | `#238a7e` | `#3db9b0` | `--accent-hover` |
| Superficie (card) | `rgba(255,255,255,0.85)` | `rgba(26,34,44,0.92)` | `--oracle-card-bg` |
| Borde de card | `rgba(30,74,92,0.10)` | `rgba(255,255,255,0.10)` | `--oracle-card-border` |
| Borde de registro | `#b8d9e8` | `#3f5060` | `--record-card-border` |
| Divisor | `#c0dce9` | `#2c3d4e` | `--record-divider` |
| Barra / chrome | `#cfe8f2` | `#0d0d0d` | `--bar` |
| Input (fondo) | `#ffffff` | `#1a222c` | `--input-bg` |
| Input (borde) | `rgba(30,74,92,0.12)` | `rgba(255,255,255,0.12)` | `--input-border` |
| Oro decorativo (de / medio / a) | `#4a3810` / `#9a7418` / `#5c4812` | `#fff9e8` / `#f0d060` / `#c9a227` | `--oracle-gold-from` / `-mid` / `-to` |

Conmutación de tema:

- Atributo **`data-theme`** en `<html>`, con valores `"light"` o `"dark"`.
- Un script inline en `app/layout.tsx` lo fija antes de la hidratación: lee `localStorage`
  con la clave **`iching_theme`**; si no es `"light"` ni `"dark"`, cae a
  `window.matchMedia("(prefers-color-scheme: dark)")`.
- `html:not([data-theme])` comparte los tokens del tema claro (fallback sin flash).
- Cada bloque de tema declara además `color-scheme: light | dark`.

Colores de estado (app):

- Error: `--error-bg` / `--error-border` / `--error-fg` = `#fff5f5` / `#f5c2c0` / `#9b2c2c`
  (claro) y `#2a1c1c` / `#5c3535` / `#f0b0b0` (oscuro).
- Success / warning / info como tokens dedicados: **no definido** (no existen tokens
  `--success-*`, `--warning-*` ni `--info-*`; los estados positivos reusan `--accent`).

### 1.2 Sitio marketing (`marketing.css`, scope `.mk-root`)

Solo oscuro (`color-scheme: dark`, sin media query ni variante clara). Paleta de tinta.

| Rol | Valor | Token |
|---|---|---|
| Fondo | `#0d0b0b` | `--mk-bg` |
| Fondo alterno | `#0a0808` | `--mk-bg-alt` |
| Fondo footer | `#080606` | `--mk-bg-footer` |
| Fondo de card | `#0f0d0c` | `--mk-bg-card` |
| Texto | `#efe8dc` | `--mk-text` |
| Texto fuerte | `#f5efe3` | `--mk-text-strong` |
| Texto suave | `#b0a494` | `--mk-text-soft` |
| Texto atenuado | `#a5988a` / `#6b5f52` / `#544b40` | `--mk-text-muted` / `-dim` / `-faint` |
| Acento rojo | `#c53d2e` (hover `#d4483a`, texto sobre rojo `#fdf3e8`) | `--mk-red` / `--mk-red-hover` / `--mk-red-text` |
| Acento oro | `#c9a24b` (soft `#ecd9a8`, dim `#8a7a5c`) | `--mk-gold` / `--mk-gold-soft` / `--mk-gold-dim` |
| Link | `#d9cfc0` (hover -> rojo) | `--mk-link` |
| Borde / hairline | `rgba(255,255,255,0.07)` / `rgba(255,255,255,0.09)` | `--mk-line` / `--mk-line-soft` |

Conmutación de tema (marketing): **no aplica**. Es dark-only por diseño. El chat conserva
su toggle claro/oscuro; el marketing no.

Colores de estado (marketing): **no definido** (no hay tokens de estado; el rojo de marca
actúa como color de énfasis, no como semántica de error).

---

## 2. Tipografía

### 2.1 Familias cargadas por `next/font/google`

Origen: `apps/web/src/lib/google-fonts-root.ts` (self-hosted vía `next/font/google`, sin
`<link>` a CDN). Se exponen como variables CSS en `<html>` mediante `rootFontClassName`.

| Familia | Pesos | Estilos | Variable CSS | Uso |
|---|---|---|---|---|
| **Cinzel** | 400 / 500 / 600 / 700 | normal | `--font-oracle-display` | Títulos display (hero, headings, `.mk-h2`) |
| **Inter** | 400 / 500 / 600 / 700 | normal | `--font-oracle-sans` | Cuerpo y UI; primera en el stack de `<body>` (cobertura Latin Extended para tonos pinyin) |
| **Noto Serif** | 400 / 500 / 600 | normal + italic | `--font-oracle-serif` | Serif de presentación; cuerpo por defecto de `.mk-root`; citas del oráculo (italic 400) |
| **Ma Shan Zheng** | 400 | normal | `--font-oracle-cn` | Glifos chinos decorativos (p. ej. `.oracle-cn-mark`); subset `latin` + chino simplificado |

### 2.2 Familias cargadas por `@fontsource` (CSS import en `layout.tsx`)

Self-hosted vía imports CSS, no `next/font`. Sirven la cobertura CJK.

| Familia | Pesos | Origen | Uso |
|---|---|---|---|
| **Noto Serif SC** | 400 / 700 / 900 | `@fontsource/noto-serif-sc/{400,700,900}.css` | Serif chino simplificado; stack `--mk-font-cn-serif` |
| **Noto Serif TC** | 700 | `@fontsource/noto-serif-tc/700.css` | Serif chino tradicional; usado en stacks CJK del chat |

### 2.3 Variables referenciadas pero sin definición propia

Aparecen en `font-family` con fallback, pero no se declaran como custom property en ningún
tema (resuelven al segundo valor del stack):

- `--font-oracle-cjk`: **no definido como variable**. Fallback en el CSS: `"Noto Serif TC"`,
  `"Noto Serif SC"`, `"Noto Sans CJK TC"`, `serif`.
- `--font-oracle-mono`: **no definido como variable**. Fallback en el CSS: `monospace`.

### 2.4 Alias de marketing (`--mk-font-*` en `marketing.css`)

Reasignan las variables de arriba con nombres locales al sitio:

- `--mk-font-display` = `var(--font-oracle-display)`, "Cinzel", serif
- `--mk-font-serif` = `var(--font-oracle-serif)`, "Noto Serif", Georgia, serif (cuerpo de `.mk-root`)
- `--mk-font-cn` = `var(--font-oracle-cn)`, "Ma Shan Zheng", cursive
- `--mk-font-cn-serif` = "Noto Serif SC", serif
- `--mk-font-ui` = `var(--font-oracle-sans)`, "Inter", sans-serif

### 2.5 Nota de CI

`html.oracle-fonts-ci-stub` (activada cuando `SKIP_GOOGLE_FONTS=1`) sustituye
`--font-oracle-display`, `--font-oracle-cn` y `--font-oracle-serif` por Georgia / serif para
que el build offline no descargue fuentes de Google.

---

## 3. Escalas

### 3.1 Escala tipográfica (superficie marketing, es donde vive la jerarquía h1..pequeño)

| Nivel | Clase | Tamaño | Interlineado | Peso / familia |
|---|---|---|---|---|
| Hero (h1) | `.mk-hero-title` | `clamp(34px, 5vw, 58px)` | `1.12` | display (Cinzel) |
| Subtítulo hero | `.mk-hero-sub` | `clamp(16px, 1.6vw, 18px)` | `1.7` | ui / serif |
| Sección (h2) | `.mk-h2` | `clamp(26px, 4vw, 36px)` | hereda (sin valor explícito) | display, weight 500 |
| Título de modo | `.mk-mode-title` | `23px` | `1.7` | display |
| Nombre de hexagrama | `.mk-library-hexname` | `22px` | `1.8` | display |
| Cuerpo / serif | `.mk-root` (base) | `16px` | `1.7` (bloques de prosa) | serif |
| Enlace en texto | `.mk-link-red` | `13.5px` | - | ui |
| Nav link | `.mk-nav-links a` | `13.5px` | - | ui |
| Eyebrow / etiqueta | `.mk-eyebrow` | `11.5px` | - | ui, mayúsculas con tracking amplio |
| Glifo decorativo | `.mk-library-hexglyph` | `84px` | `1` | cn-serif |
| Número de ritual | `.mk-ritual-num` | `50px` | `1` | display |

Base de la app / chat: `<body>` en `globals.css` con `font-size: 16px` y `line-height: 1.5`.

### 3.2 Escala de espaciado

- **No hay escala de espaciado tokenizada**: no existen variables `--space-*` ni el sistema
  de spacing de Tailwind. Los espaciados se declaran ad-hoc por componente.
- **Unidad base**: `font-size: 16px` en `<body>`, por lo que `1rem = 16px`.
- **Pasos realmente usados**: valores en `px` en múltiplos de 4 (8, 10, 12, 14, 16, 20, 24)
  para gaps y paddings pequeños, y `clamp()` fluido para paddings de sección. Ejemplos reales:
  - Nav: `padding: 16px clamp(20px, 4.5vw, 56px)`, `gap: 16px`.
  - Sección marketing: `padding: clamp(56px, 9vw, 96px) clamp(20px, 4.5vw, 56px)`.
  - Footer: `padding: clamp(36px, 5vw, 56px) clamp(20px, 4.5vw, 56px)`.
  - Offset de anclaje del nav (scroll): `88px` (`NAV_HEADER_OFFSET`).

---

## 4. Radios y sombras

### 4.1 App / chat: tokens (`globals.css`, ambos temas salvo indicación)

| Token | Valor | Uso |
|---|---|---|
| `--radius` | `28px` | radio general de superficies del chat |
| `--radius-bubble` | `38px` | burbujas de mensaje |
| `--chat-surface-radius` | `clamp(26px, 5.5vw, 38px)` | contenedor de la superficie del chat |
| `--shadow` | `0 2px 12px rgba(26,46,58,0.08)` (claro) / `0 2px 16px rgba(0,0,0,0.35)` (oscuro) | sombra base de cards |
| `--composer-shadow` | `0 -4px 24px rgba(26,46,58,0.06)` (claro) / `0 -4px 24px rgba(0,0,0,0.35)` (oscuro) | dock del compositor |
| `--drawer-shadow` | `8px 0 32px rgba(26,46,58,0.12)` (claro) / `8px 0 40px rgba(0,0,0,0.45)` (oscuro) | drawer lateral |
| `--scroll-btn-shadow` | `0 4px 16px rgba(26,46,58,0.15)` (claro) / `0 4px 20px rgba(0,0,0,0.4)` (oscuro) | botón scroll-to-bottom |

### 4.2 Sitio marketing: valores literales (sin tokens de radio/sombra)

`marketing.css` no define custom properties de radio ni de sombra; los valores van inline
por componente.

Radios usados: `4px` (badges, pills), `5px`, `6px`, `8px` (cards, pills), `10px`, `12px`,
`14px` (feature cards), `100px` (pill completa) y `50%` (avatares, monedas, círculos de glifo).

Sombras usadas:

- `0 8px 32px rgba(197,61,46,0.35)` y hover `0 16px 44px rgba(197,61,46,0.5)`: glow rojo de
  botones CTA.
- `0 10px 30px rgba(197,61,46,0.4)`: CTA secundario.
- `0 24px 60px rgba(0,0,0,0.45)`: cards elevadas.
- `0 16px 40px rgba(0,0,0,0.55)`: menú móvil desplegado.
- `0 2px 8px rgba(0,0,0,0.5)`: chips pequeños.

---

## 5. Cabecera y pie

### 5.1 Cabecera de marketing (`MarketingNav`, clase `.mk-nav`)

Componente: `apps/web/src/components/marketing/MarketingNav.tsx`.

- **Comportamiento**: barra sticky (`position: sticky; top: 0; z-index: 50`) de ancho
  completo, fondo tinta translúcido `rgba(13,11,11,0.85)` con `backdrop-filter: blur(14px)`
  y hairline inferior de 1px (`--mk-line`). Se mantiene fija al hacer scroll.
- **Tres zonas** (`justify-content: space-between`):
  - Izquierda: marca (logo `logo-v3.jpg` + wordmark "THE ORIGINAL I CHING") que enlaza a `/`.
  - Centro (`.mk-nav-links`): Oráculo, Guía, Biblioteca, Fuentes, Precios, FAQs. En el home,
    Oráculo / Biblioteca / Precios son anclas de scroll suave con scroll-spy (el subrayado
    sigue a la sección visible); Guía / Fuentes / FAQs son rutas (`/guia`, `/notes`, `/faqs`).
    En páginas de docs, las anclas se vuelven enlaces `/#seccion`.
  - Derecha (`.mk-nav-actions`): selector de idioma, CTA rojo "Consultar" (a `/login`) y botón
    hamburguesa (`.mk-nav-burger`).
- **Responsive**: en desktop se ven los enlaces inline; por debajo del breakpoint colapsan y
  la hamburguesa abre `.mk-nav-mobile` (mismo listado en columna). Padding
  `16px clamp(20px, 4.5vw, 56px)`.
- **En scroll**: scroll-spy mueve el subrayado activo a la sección en vista; al hacer clic el
  subrayado se bloquea en el ítem clicado hasta que el usuario hace scroll a mano. El aterrizaje
  de anclas compensa 88px de altura de header.
- **Selector de idioma**: vive en la zona derecha del nav, componente `AuthLocalePicker`
  (variante `"ink"`), con inglés listado primero.

### 5.2 Pie de marketing (`MarketingFooter`, clase `.mk-footer`)

Componente: `apps/web/src/components/marketing/MarketingFooter.tsx`.

- **Comportamiento**: bloque estático al final de página, fondo más oscuro del sitio
  (`--mk-bg-footer` = `#080606`), padding `clamp(36px, 5vw, 56px) clamp(20px, 4.5vw, 56px)`.
- **Zona superior** (`.mk-footer-top`): bloque de marca (logo + wordmark) y tres columnas de
  enlaces (`.mk-footer-cols`):
  - Producto: Oráculo (`/#oraculo`), Guía (`/guia`), Precios (`/#precios`), Feedback
    (`/feedback`), Google Play (enlace externo).
  - Biblioteca: Fuentes (`/notes`), Auditorías (`/audits`).
  - Soporte: FAQs (`/faqs`), Privacidad (`/privacy`), Términos (`/terms`), Eliminar cuenta
    (`/delete-account`).
- **Zona inferior**: línea de copyright (`.mk-footer-copy`).
- Todas las etiquetas provienen de i18n (`getMarketingUiMessages(locale).footer.*`).

### 5.3 Nota sobre la app / chat

El chat (`/chat`) no usa este nav/footer de marketing: tiene su propio chrome (drawer +
header de sesión, en el shell de la app y en `home-chrome-ui`), que no es un componente
Header/Footer compartido.

---

## 6. Assets

Todos bajo `apps/web/public/`.

| Asset | Ruta | Tamaño |
|---|---|---|
| Logo / wordmark marketing | `/marketing/logo-v3.jpg` | 807 × 783 (se renderiza pequeño en nav y footer) |
| Logo de marca (app) | `/brand/logo.png` | 395 × 129 |
| Icono modo Huesos (marca) | `/brand/mode-bones-symbol.png` | 500 × 500 |
| Icono modo I Ching (marca) | `/brand/mode-iching-coin.png` | 500 × 500 |
| Icono modo Huesos (marketing) | `/marketing/mode-bones-symbol.png` | 500 × 500 |
| Icono modo I Ching (marketing) | `/marketing/mode-iching-coin.png` | 500 × 500 |
| Badge de Google Play | `/marketing/google-play-badge.png` | 539 × 153 |
| Fallback de oráculo | `/oracle-fallback.svg` | SVG (847 bytes) |
| Fallbacks prebuilt | `/fallbacks/prebuilt/` | carpeta de imágenes prebuild |

- **Favicon**: **no definido**. No hay `favicon.ico`, ni `app/icon.*`, ni `app/apple-icon.*`,
  ni un campo `icons` en el `metadata` de `layout.tsx`. El matcher de `middleware.ts` excluye
  `/favicon.ico` de su procesamiento, pero no se sirve ningún archivo de favicon.
- **OG image**: **no definido**. `generateMetadata` declara `openGraph` y `twitter`
  (`card: "summary_large_image"`) pero **sin** propiedad `images`, y no existe archivo
  `opengraph-image.*` en `app/`. No hay imagen social por defecto.

---

## 7. i18n

- **Biblioteca**: paquete propio del monorepo **`@iching-oracle/i18n`** (workspace, versión
  `0.0.1`). No usa `next-intl` ni `react-intl`. No hay `messages/*.json`: los mensajes son
  módulos TypeScript.
- **Códigos de locale (11, exactos, en el orden de `SUPPORTED_LOCALES`)**:
  `es`, `en`, `pt`, `fr`, `de`, `it`, `ja`, `zh`, `ko`, `ar`, `hi`.
- **Locale por defecto**: `en` (`DEFAULT_LOCALE`).
- **`<html lang>`**: `htmlLangFromAppLocale(locale)`, que es identidad salvo `zh -> "zh-Hans"`.
  El atributo `dir` es `"rtl"` solo para `ar`, `"ltr"` en el resto.
- **Estructura de los archivos de traducción**: `packages/i18n/src/messages/<feature>-ui.ts`
  (ejemplo: `packages/i18n/src/messages/marketing-ui.ts`). Cada archivo exporta un tipo
  TypeScript (p. ej. `MarketingUiMessages`) con claves anidadas en objetos (por ejemplo
  `nav.oracle`, `footer.productHeading`) y un `Record<AppLocale, T>` **completo** (los 11
  locales obligatorios, sin `Partial` ni merge de fallback, por convención del proyecto). Se
  consume con getters tipo `getMarketingUiMessages(locale)`.
- **Estrategia de rutas**: **sin prefijo de locale en la URL y sin routing por dominio**. Un
  solo juego de rutas; el idioma es **por cookie**. El middleware **no** hace routing de
  locale (solo nonce/CSP, rate limit de `/api/library` y 404 de sondas WordPress).
- **Detección y persistencia**:
  - Servidor: `resolveDocLocale()` lee la cookie **`iching_ui_locale`** (`UI_LOCALE_COOKIE`);
    si falta o es inválida, cae a `DEFAULT_LOCALE` (`en`).
  - Cliente: `setAppLocale()` escribe la cookie `iching_ui_locale`
    (`path=/; max-age=31536000; samesite=lax`), la clave de localStorage
    `iching_ui_locale_v1` (`UI_LOCALE_STORAGE_KEY`), y actualiza `<html lang/dir>`; luego
    `router.refresh()` re-renderiza los RSC para que la página siga al selector.
  - Detección por cabecera `Accept-Language`: **no definido** (no se usa; la fuente de verdad
    es la cookie, con fallback a `en`).
