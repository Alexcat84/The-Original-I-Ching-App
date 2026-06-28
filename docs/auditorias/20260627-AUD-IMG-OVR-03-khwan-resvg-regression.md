# Overlay PNG — tofu + flecha superpuesta en producción (#2 Khwăn → #1 Khien, Legge)
**Código:** `20260627-AUD-IMG-OVR-03 khwan-resvg-regression` · **Familia:** IMG-OVR · **Estado:** open

- **Fecha:** 2026-06-27
- **Estado:** Causa raíz diagnosticada con alta confianza (consistente con el bug ya documentado y solo parcialmente mitigado en `20260625-AUD-IMG-OVR-02`) — **sin fix aplicado todavía**, pendiente decisión de remediación con el usuario.
- **Relacionado:** [`20260624-AUD-IMG-OVR-01-legge-diacritics.md`](./20260624-AUD-IMG-OVR-01-legge-diacritics.md), [`20260625-AUD-IMG-OVR-02-mutation-title-layout.md`](./20260625-AUD-IMG-OVR-02-mutation-title-layout.md)

---

## 1. Origen

El usuario reportó (captura de producción real) que una consulta con traductor **Legge**, mutación **#2 → #1** (坤 → 乾), mostró en el overlay:

- `#2 Khw` + **tofu** (□) + `n` en vez de `#2 Khwăn`
- La flecha `→` **superpuesta** sobre la última letra del nombre, no separada con el espaciado esperado

El usuario señaló correctamente que **ya se habían corrido tests exhaustivos** cubriendo los 64 hexagramas, sus líneas cambiantes y las flechas de mutación, todos en verde — y pidió un diagnóstico de por qué, aun así, esto pasó en producción real.

---

## 2. Síntoma

| Superficie | Legge #2→#1 |
|------------|-------------|
| Overlay PNG producción (Together + overlay transparente) | `Khw□n` + flecha pegada a la última letra |
| `verify:overlay-glyphs` (gate de datos) | Verde — no detecta este caso |
| Suite de tests (`apps/web` vitest) | Verde — no detecta este caso |

---

## 3. Por qué los tests en verde no detectan esto — los 3 gates existentes no renderizan lo que falla

| Gate | Qué verifica | Por qué no atrapa este bug |
|------|--------------|------------------------------|
| `npm run verify:overlay-glyphs` (`scripts/verify-overlay-glyphs.mjs`) | Que el **dato** (`hexagrams.legge.json`) tenga el carácter `ă` correcto en el string `"Khwăn"`, y que las clases `overlay-title-zh`/`overlay-title-en` existan en el SVG generado. | Es un check de **texto/markup**, nunca invoca `resvg` ni produce un PNG. El dato siempre fue correcto (confirmado: U+0103 precompuesto, sin normalización) — el bug no está en el dato. |
| `TS-WEB-OVR-001`/`002` (`embed-svg-overlay-font.test.ts`, `overlay-title-layout.test.ts`) | Que el SVG resultante tenga los `font-family` y las clases correctas, y que la decisión de layout (1 vs 2 líneas, posiciones Y) sea la esperada. | Tampoco invocan `resvg` — verifican el **string SVG antes de rasterizar**, no el PNG final. |
| `TS-WEB-OVR-003` (`sumi-fallback-glyph-samples.test.ts`) — el **único** test que sí renderiza con `resvg` real | Genera 292 PNG reales (`buildSumiHexagramSvgDataUrl` → `embedCjkFontInOverlaySvg` → `renderSvgToPng`) y permite inspección visual manual. | **Está deshabilitado por defecto** (`describe.skipIf(!GENERATE_SUMI_GLYPH_SAMPLES)`) — no corre en CI, solo si un desarrollador lo activa manualmente. Y aun cuando se corrió manualmente (cierre de `20260625-AUD-IMG-OVR-02` §10.4), la revisión visual fue una **muestra**, no las 4032 combinaciones posibles (64×63 pares × 2 traductores) — esa muestra incluyó `#6→#10 Legge` y `#32→#34 Legge` con diacríticos, pero **no incluyó `#2→#1`**. |

**Conclusión de este punto: "tests exhaustivos en verde" es objetivamente cierto para lo que esos tests miden (datos correctos, markup SVG correcto, decisiones de layout correctas) — pero ninguno de los 3 gates actuales verifica el **píxel final** que `resvg-js` produce para una combinación específica de texto + fuentes embebidas, salvo por una muestra manual no exhaustiva.**

---

## 4. La causa raíz real — no es nueva, ya está documentada y es, por diseño del propio hallazgo anterior, no 100% cerrable con el enfoque actual

`20260625-AUD-IMG-OVR-02` §10.2 ya demostró, con aislamiento deliberado de variables (intercambiando nombres entre pares que funcionaban y pares que fallaban), que `resvg-js` tiene un **bug de renderizado de texto/fuentes que no es predecible por el contenido**: pares de texto de longitud y estructura casi idénticas (`"#1 The Creative → #44 Coming to Meet"` vs `"#6 Conflict → #10 Treading [Conduct]"`) se comportan de forma distinta sin que ninguna propiedad medible del texto (longitud, palabras, estructura) explique por qué. La cita textual de esa auditoría:

> "Se probó aislar por nombre... sin encontrar una variable de contenido que prediga el fallo. Esto confirma que es un bug de resvg-js... no algo corregible ajustando el contenido o el font-family."

El fix aplicado entonces (`804dbe0`, ya en `main`/producción — confirmado vía `git log main -- sumi-hexagram-art.ts`) eliminó el patrón `<tspan>` dentro de `<text>` y lo reemplazó por elementos `<text>` hermanos independientes. Esto **cerró el síntoma que tenían identificado** (nodo de texto completo ausente, para los pares específicos `#3↔#8`, `#6↔#10`) — pero el equipo nunca afirmó (ni podía afirmar, dado que el bug es "no predecible por contenido") que esto cerraba el bug subyacente de `resvg-js` para **todos** los pares posibles. Solo afirmaron que cerraba los casos que habían encontrado y podían reproducir.

`#2 Khwăn → #1 Khien` es, con alta probabilidad, **otra manifestación del mismo defecto subyacente de `resvg-js`** en el manejo de múltiples fuentes embebidas (`NotoSerifTCOverlay`, `NotoSerifLatinOverlay`, `NotoSymbols2Overlay`) más `loadSystemFonts: true` en un mismo render — esta vez expresándose como un glifo tofu puntual (`ă` → □) y un mal cálculo de ancho consecuente (la flecha se posiciona con `estimateOverlayEnTextWidth`, una heurística JS que asume el ancho del glifo **correcto**; si `resvg` renderiza `ă` con un glifo de respaldo de ancho distinto al estimado, el espaciado fijo antes de la flecha queda corto), en vez de como nodo de texto ausente. Mismo mecanismo raíz (comportamiento de fuente/glifo no determinista de `resvg-js` ante ciertas combinaciones de texto+fuentes), síntoma distinto.

**Evidencia que descarta otras causas más simples:**
- El dato (`hexagrams.legge.json`, hex #2: `"Khwăn"`) usa el mismo carácter U+0103 que `"Hăng"` (hex #32), que **sí** se verificó visualmente OK — descarta un problema de codificación/normalización del dato.
- El archivo de fuente correcto (`@fontsource/noto-serif` subset `latin-ext-400`, que cubre Latin Extended-A) está correctamente referenciado en `fontsource-woff-paths.ts` y trazado para Vercel en `next.config.mjs` (`outputFileTracingIncludes`) — descarta que falte el archivo de fuente en el bundle de producción, aunque **no se puede confirmar al 100% sin inspeccionar el bundle desplegado real**.
- `collectLatinOverlayChars` (`embed-svg-overlay-font.ts`) incluye correctamente el rango `0x00a0–0x024f`, que cubre U+0103 — descarta un bug de rango en la función de subsetting.

---

## 5. Por qué "ya hicimos todo lo que pudimos hacer" es cierto y el problema persiste igual

No es una contradicción: el equipo hizo exactamente lo correcto dado lo que sabía — encontró un bug real de `resvg-js`, lo aisló lo mejor que pudo, confirmó que no es predecible por contenido, y cerró los casos concretos que pudo reproducir. El problema es que **un bug "no predecible por contenido" no se puede cerrar con una muestra de QA, sin importar cuán grande sea** — solo se cierra con (a) una verificación exhaustiva de las **4032 combinaciones reales** contra el renderer real en cada release, o (b) eliminando la dependencia del comportamiento no determinista del motor (ver opciones en §6).

---

## 6. Opciones de remediación (para decidir, no implementadas en este documento)

Esta sección documenta el diagnóstico, no prescribe un fix — la decisión de remediación queda con el usuario, igual que el patrón de `20260625-AUD-IMG-OVR-02` §6.

| Opción | Pros | Contras |
|--------|------|---------|
| **A. Gate exhaustivo automatizado** — extender `sumi-fallback-glyph-samples` para correr en CI sobre **todas** las 4032 combinaciones (64×63×2), comparando contra un hash/checksum de referencia o detectando glifos tofu por análisis de píxeles (ej. detectar el glifo `.notdef` característico de resvg) | Cierra el gap real de cobertura; detecta regresiones futuras automáticamente | Costoso en tiempo de CI (4032 renders); requiere una heurística confiable de "detección de tofu" por píxeles, no trivial |
| **B. Pre-renderizar el título como PNG pequeño** y componerlo como `<image>` en el SVG final (ya listada como opción futura en AUD-IMG-OVR-02 §6) | Control total de tipografía (ej. vía `sharp`/Skia/Canvas con su propio motor de texto, evitando el bug de `resvg-js` por completo) | Más complejidad de pipeline; requiere un segundo motor de rasterizado solo para el título |
| **C. Cambiar el motor de renderizado completo** (de `resvg-js` a otro, ej. `@napi-rs/canvas`, Skia-based) | Elimina la causa raíz de fondo | Reescritura no trivial; nueva dependencia; riesgo de introducir bugs distintos |
| **D. Mantener el riesgo conocido, monitorear** — no es una opción real para producción visible al usuario, se incluye solo por completitud | — | No resuelve nada, descartar |

---

## 7. Archivos relevantes (referencia rápida)

```
apps/web/src/lib/
  sumi-hexagram-art.ts          # buildOverlayEnLineElements — título + flecha, elementos <text> hermanos
  embed-svg-overlay-font.ts     # embed @font-face dual CJK/Latin/Symbols
  svg-to-png.ts                 # renderSvgToPng — config resvg-js (fontFiles, loadSystemFonts, defaultFontFamily)
  fontsource-woff-paths.ts      # rutas a los .woff vendored
  overlay-title-layout.ts       # estimateOverlayEnTextWidth, decisión 1 vs 2 líneas
  __tests__/
    embed-svg-overlay-font.test.ts        # markup únicamente
    overlay-title-layout.test.ts          # layout/matemática únicamente
    sumi-fallback-glyph-samples.test.ts   # único render real, gated GENERATE_SUMI_GLYPH_SAMPLES=1

scripts/verify-overlay-glyphs.mjs         # gate de datos, no renderiza
packages/iching-data/src/generated/hexagrams.legge.json   # hex #2: "Khwăn"
apps/web/next.config.mjs                  # outputFileTracingIncludes (fonts → Vercel)
```

---

## 8. Changelog

| Fecha | Evento |
|-------|--------|
| 2026-06-27 | Apertura. Diagnóstico completo: el bug es la misma clase de defecto "no predecible por contenido" de `resvg-js` ya documentada y parcialmente cerrada en `20260625-AUD-IMG-OVR-02`, manifestándose en un par de hexagramas (#2→#1 Legge) fuera de la muestra de QA visual revisada en esa sesión. Los 3 gates existentes no renderizan el píxel final, por lo que no pueden detectar esta clase de regresión. Sin fix aplicado — opciones de remediación documentadas en §6, pendiente decisión del usuario. |
