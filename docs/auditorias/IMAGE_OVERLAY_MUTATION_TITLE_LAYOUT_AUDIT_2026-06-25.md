# Overlay PNG — títulos mutación, flecha → y layout vertical (sumi fallback QA)

- **Fecha:** 2026-06-25
- **Estado:** ⚠️ **Abierto** — revertido forzado “todas las mutaciones en 2 líneas”; pendiente solución definitiva por producto
- **Relacionado:** [`IMAGE_OVERLAY_LEGGE_DIACRITICS_AUDIT_2026-06-24.md`](./IMAGE_OVERLAY_LEGGE_DIACRITICS_AUDIT_2026-06-24.md), [`IMAGE_OVERLAY_DUAL_FONT_FIX_PLAN_2026-06-24.md`](./IMAGE_OVERLAY_DUAL_FONT_FIX_PLAN_2026-06-24.md)
- **Artefactos QA:** `reports/sumi-fallback-glyphs/` (292 PNG), `npm run generate:sumi-fallback-glyphs`

---

## 1. Contexto

Tras el fix **dual font-stack** (commit `357fcf7`) para diacríticos Legge (`Hăng`, `Žin`…), se añadió un harness local de **292 PNG** sin consumir tokens Together (`buildSumiHexagramSvgDataUrl` → `embedCjkFontInOverlaySvg` → `renderSvgToPng`).

La revisión visual manual encontró tres clases de defecto en la **línea inglesa** (`overlay-title-en`):

| ID | Síntoma | Ejemplo |
|----|---------|---------|
| H1 | Tofu `□` donde debería ir `→` | `#3 Difficulty… □ #8 Holding Together` |
| H2 | Texto desborda ancho imagen | `#26 The Taming Power… → #18 Work on What Has Been Spoiled` |
| H3 | Espaciado vertical mal balanceado | Dos filas pegadas a hanzi arriba o al hex abajo |

---

## 2. Root causes confirmados

### 2.1 Diacríticos Legge (cerrado en `357fcf7`)

- `embedCjkFontInOverlaySvg` aplicaba Noto Serif TC a **toda** la línea inglesa.
- **Fix:** `NotoSerifLatinOverlay` (`@fontsource/noto-serif` latin-ext-400) + clases `overlay-title-zh` / `overlay-title-en`.
- Gate: `npm run verify:overlay-glyphs`.

### 2.2 Flecha `→` en línea inglesa (abierto)

- Noto Serif Latin **no incluye** U+2192 de forma fiable en resvg.
- La línea china sí muestra `→` (Noto Serif TC o `NotoSymbols2Overlay` en stack ZH).
- **Intento A:** Anteponer `NotoSymbols2Overlay` al `font-family` de toda la línea EN → siguió tofu en mutaciones una línea.
- **Intento B:** Separador ASCII ` -> ` → render OK, **rechazado por producto** (quiere la flecha Unicode igual que arriba).
- **Intento C (actual en código):** `<tspan font-family="'NotoSymbols2Overlay'" font-size="inherit">→</tspan>` dentro del `<text class="overlay-title-en">`.

### 2.3 Bug resvg — `<tspan>` en medio de línea (abierto, crítico)

**Hipótesis verificada en QA manual (no automatizada al 100%):**

Cuando el SVG tiene **texto + tspan(→) + texto** en un solo `<text>` (mutación **una línea**), **resvg-js puede omitir por completo** el nodo `<text>` — no solo la flecha.

- Casos afectados: mutaciones Wilhelm cortas que caben en una línea (#3→#8, #6→#10, #8→#3, #10→#6).
- Casos OK: mutaciones **dos líneas** donde `→` va al **inicio** de la segunda línea (#26→#18).
- La línea china no usa tspan intercalado; solo texto plano con `→`.

**Workaround descartado:** forzar **todas** las mutaciones a dos líneas → texto visible pero **UX rechazada** (2026-06-25).

### 2.4 Layout vertical (abierto)

Constantes en `apps/web/src/lib/overlay-title-layout.ts`:

| Constante | Valor actual | Rol |
|-----------|--------------|-----|
| `SUMI_FALLBACK_HEX_TOP_Y` | 240 | Barra superior del hex en escena sumi (sync con `sumi-hexagram-art.ts`) |
| `OVERLAY_EN_MAX_WIDTH` | 1000 | Ancho útil estimado (1344 − márgenes) |
| `OVERLAY_EN_SINGLE_Y` | 178 | Baseline título estático / mutación una línea |
| `EN_MARGIN_ABOVE_HEX` | 14 | Margen sobre hex en layout dos líneas |
| `EN_GAP_BELOW_ZH` | 24 | Margen bajo hanzi en layout dos líneas |

**Dilema:** Entre hanzi (`y=125`, `font-size=92`) y hex (`y=240`) hay ~93px útiles. Dos líneas a ~24–32px + márgenes compiten con una línea larga. Subir margen sobre hex empuja texto hacia hanzi; bajar margen invade el hex.

---

## 3. Cambios de código (sesión 2026-06-24 — 2026-06-25)

### 3.1 Ya mergeados (`357fcf7`, `86f9f9d`)

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/lib/embed-svg-overlay-font.ts` | Dual embed TC + Latin; `OVERLAY_TITLE_*_CLASS`; symbol font |
| `apps/web/src/lib/sumi-hexagram-art.ts` | Clases dual en overlay y fallback sumi |
| `apps/web/src/lib/__tests__/embed-svg-overlay-font.test.ts` | Tests embed |
| `scripts/verify-overlay-glyphs.mjs` | Gate corpus diacríticos |
| `package.json` | `verify:overlay-glyphs` |
| `@fontsource/noto-serif` | Dependencia (lockfile root sync en `86f9f9d`) |

### 3.2 Working tree (no mergeado a staging al cierre de esta AU)

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/lib/overlay-title-layout.ts` | **Nuevo** — layout ancho + dos líneas solo si no cabe una |
| `apps/web/src/lib/sumi-hexagram-art.ts` | `buildOverlayEnTextElements`, `buildOverlayEnInnerHtml` (tspan →), `hexTopY` |
| `apps/web/src/lib/embed-svg-overlay-font.ts` | `OVERLAY_SYMBOL_FONT_FAMILY`; strip tags al extraer texto; `needsSymbolFont`; Latin weight **400**; fix `needsSymbolFont` TDZ bug |
| `apps/web/src/lib/__tests__/overlay-title-layout.test.ts` | **Nuevo** |
| `apps/web/src/lib/__tests__/sumi-fallback-glyph-samples.test.ts` | **Nuevo** — genera 292 PNG + smoke Legge 32 |
| `scripts/generate-sumi-fallback-glyph-samples.mjs` | **Nuevo** — `npm run generate:sumi-fallback-glyphs` |
| `package.json` | Scripts `generate:sumi-fallback-glyphs` / `:quick` |
| `reports/sumi-fallback-glyphs/` | 292 PNG + manifest (local QA, no commiteado) |

### 3.3 Revertido en esta sesión (2026-06-25)

- **Forzar todas las mutaciones a 2 líneas** — eliminado de `buildOverlayEnglishTitleLayout`.
- `EN_MARGIN_ABOVE_HEX = 28` — vuelto a **14** (estado previo al empuje agresivo hacia el hex).
- Test smoke `#3→#8` que exigía 2 `<text class="overlay-title-en">` — eliminado.

---

## 4. Pipeline sumi fallback QA

```
buildSumiHexagramSvgDataUrl (sumi-hexagram-art.ts)
  → buildOverlayEnglishTitleLayout (overlay-title-layout.ts)
  → buildOverlayEnTextElements + buildOverlayEnInnerHtml (tspan →)
  → embedCjkFontInOverlaySvg
  → renderSvgToPng (@resvg/resvg-js)
  → reports/sumi-fallback-glyphs/
```

Cobertura manifest (292 PNG):

- `wilhelm/` + `legge/` — 64 estáticos c/u
- `trigrams/` — 8×2
- `mutations/by-hex/{wilhelm,legge}/` — 64×2 (una mutación por hex)
- `mutations/fixtures/{wilhelm,legge}/` — 10 fixtures Huang c/u

Comandos:

```bash
npm run verify:overlay-glyphs
npm run generate:sumi-fallback-glyphs        # ~2 min, 292 PNG
npm run generate:sumi-fallback-glyphs:quick  # smoke vitest sin dump
```

---

## 5. Matriz de casos smoke manual

| Caso | Archivo wilhelm (ejemplo) | Layout esperado | Estado conocido |
|------|---------------------------|-----------------|----------------|
| A | `legge/` estático `#32` | 1 línea, `Hăng` | ✅ diacríticos OK post-357fcf7 |
| B | `03-…-to-08-…` | 1 línea + `→` | ❌ línea EN invisible (H3 resvg tspan) |
| C | `06-conflict-to-10-…` | 1 línea + `→` | ❌ igual B |
| D | `26-…-to-18-…` | 2 líneas + `→` L2 | ⚠️ visible; revisar margen hex/hanzi |
| E | `mutations/fixtures/legge/QIAN_ALL_NINE` | 2 líneas | ⚠️ revisar |

---

## 6. Opciones futuras (no implementadas)

| Opción | Pros | Contras |
|--------|------|---------|
| **Tres `<text>`** centrados (antes / flecha / después) | Sin tspan intercalado; flecha Unicode | Posicionamiento manual frágil |
| **Flecha como `<path>` SVG** | Siempre renderiza | Distinto peso visual vs hanzi |
| **Un solo `<text>` + `→` como carácter con fuente symbol en todo el string** | Simple | Falló con stack font-family en EN |
| **Subir escena hex** (`baseY` 520→540) solo si 2 líneas | Más aire vertical | Cambia composición producto |
| **Rasterizar overlay EN con sharp/skia** en lugar de resvg | Otro motor | Nueva dependencia / pipeline |
| **Pre-render título a PNG pequeño** y `<image>` en SVG | Control total tipografía | Más complejidad |

---

## 7. Criterios de cierre sugeridos

1. **H1:** `#3→#8` wilhelm — línea inglesa completa visible con `→` (no `□`, no ausente).
2. **H2:** `#26→#18` — sin truncar; cabe en ancho 1344.
3. **H3:** Dos líneas solo cuando ancho lo exige; márgenes hanzi↔texto y texto↔hex ≥ ~20px visuales.
4. **Paridad:** mismo comportamiento en `buildSumiHexagramSvgDataUrl` y `buildSumiHexagramOverlaySvgDataUrl` (Together + fallback).
5. **Gates CI:** `verify:overlay-glyphs` + smoke vitest `sumi-fallback-glyph-samples` verde.

---

## 8. Referencia rápida de archivos

```
apps/web/src/lib/
  embed-svg-overlay-font.ts    # @font-face embed, clases overlay
  sumi-hexagram-art.ts         # SVG escena + overlay transparente
  overlay-title-layout.ts      # Layout EN (ancho, 1 vs 2 líneas, Y)
  __tests__/
    embed-svg-overlay-font.test.ts
    overlay-title-layout.test.ts
    sumi-fallback-glyph-samples.test.ts

scripts/
  verify-overlay-glyphs.mjs
  generate-sumi-fallback-glyph-samples.mjs
```

---

## 9. Notas de sesión

- El usuario prefirió **no** usar `->` ASCII; mantener **`→`** como en la fila china.
- Iteraciones de `font-weight` 600→**400** en EN para homogeneidad (mantener en working tree).
- Bug TDZ: `needsSymbolFont` usado antes de declararse en `embedCjkFontInOverlaySvg` — rompía embed silenciosamente (catch → SVG sin fuentes). **Corregido.**
- Reports en `reports/sumi-fallback-glyphs/` pueden quedar desactualizados respecto al revert; regenerar tras fix definitivo.
