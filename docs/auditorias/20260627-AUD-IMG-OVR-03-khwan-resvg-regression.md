# Overlay PNG — tofu + flecha superpuesta en producción (#2 Khwăn → #1 Khien, Legge)
**Código:** `20260627-AUD-IMG-OVR-03 khwan-resvg-regression` · **Familia:** IMG-OVR · **Estado:** **open** (reabierta 2026-06-28)

- **Fecha:** 2026-06-27
- **Estado:** ⚠️ **Reabierta — §0 Zhou Yi (subtítulo `#N` tofu).** Cierres previos siguen válidos: migración resvg→Canvas (§9), gap CJK §10, rutas Vercel §12. W/L verificados en staging post-`dda9732`. **Pendiente:** subtítulo Zhou Yi (`#2 坤 → #1 乾`) — causa §0, opciones §14.
- **Relacionado:** [`20260624-AUD-IMG-OVR-01-legge-diacritics.md`](./20260624-AUD-IMG-OVR-01-legge-diacritics.md), [`20260625-AUD-IMG-OVR-02-mutation-title-layout.md`](./20260625-AUD-IMG-OVR-02-mutation-title-layout.md)

---

## 0. Hallazgo abierto — Zhou Yi (subtítulo `#N` tofu, 2026-06-28)

### 0.1 Síntoma (smoke staging, post-fix §12)

Tras validar **Wilhelm** y **Legge** en staging (overlay completo: hanzi/romanización + flecha), el usuario probó **Zhou Yi** (周易) en los tres traductores. Resultado:

| Banda | Zhou Yi `#2 → #1` (坤 → 乾) | W / L |
|-------|------------------------------|-------|
| **Superior (ZH)** | `坤 → 乾` correcto | OK |
| **Inferior (subtítulo)** | **Tofu** antes de cada hanzi: `☒☒坤 → ☒☒乾` | `#2 Khwăn → #1 Khien` OK |

La flecha vectorial y los hanzi del subtítulo **sí** renderizan; fallan exactamente **dos glifos tofu por bloque** — el prefijo `#2` / `#1`.

### 0.2 Causa raiz (confirmada con fontkit local, 2026-06-28)

**No** es un gap de hanzi Zhou Yi en el subset CJK. **No** son los símbolos del bloque Unicode Yijing Hexagram (U+4DC0–U+4DFF, p. ej. ䷁/䷀). La app en Zhou Yi usa el carácter clásico **`坤`**, no el pictograma compuesto **`䷁`**.

| Pieza | Comportamiento |
|-------|----------------|
| Línea ZH | Solo hanzi + flecha vectorial → fuente CJK subset (72 caracteres) → **OK** |
| Línea subtítulo Zhou Yi | Texto real: `#2 坤 → #1 乾` (vía `buildOverlayEnglishTitleText`) |
| Regla `enScript` | Si `primaryName` contiene hanzi → **`script: "cjk"`** para **toda** la línea (`sumi-hexagram-art.ts`) |
| Renderer Canvas | Con `script: "cjk"`, el segmento completo `#2 坤` usa `CJK_FAMILY` — **incluidos `#` y dígitos** |
| Subset `noto-serif-tc-hexagram-titles.woff2` | Solo los **72 hanzi** de datos reales — **sin** `#`, `0`–`9` |

Verificación fontkit (repo local):

| Carácter | En subset CJK | En Noto Latin basic |
|----------|---------------|---------------------|
| 72 hanzi Zhou Yi (`name` + `chineseName`) | **72/72 ✓** | — |
| `#`, `0`–`9` | **✗** | **✓** |
| U+4DC0, U+4DC1, U+4DFF (símbolos hexagrama) | **✗** | **✗** |

Wilhelm/Legge usan `enScript: "latin"` → `#N` + romanización van a Noto Latin basic/ext → sin tofu.

### 0.3 Por que los tests no lo detectaron

1. **`TS-WEB-OVR-004` fontkit CJK:** excluye codepoints &lt; U+3400 — no exige `#`/dígitos en la fuente CJK.
2. **Ink ratio banda EN:** 坤, 乾 y la flecha producen suficiente tinta aunque `#2`/`#1` sean tofu.
3. **8064 renders (`TS-WEB-OVR-005`):** mismo criterio de ink; Zhou Yi pasa con subtítulo parcialmente roto.
4. **Camino resvg antiguo:** `embed-svg-overlay-font.ts` separaba `collectLatinOverlayChars(enText)` y `collectCjkOverlayChars(zhText)` — el subtítulo Zhou Yi recibía **latin + CJK por separado**. Ese split **no se replicó** en Canvas al introducir `enScript: "cjk"` global.

### 0.4 Aclaracion: Zhou Yi vs «simbolos» Unicode

- **Datos runtime Zhou Yi** (`hexagrams.zhouyi.json`): `name` y `chineseName` son **hanzi** (經 clásico), p. ej. `"坤"`, `"乾"`. **Todos** están en el subset §10.
- **Bloque U+4DC0–U+4DFF** (䷀…䷿): símbolos compuestos del estándar Unicode para el Yijing. **No** aparecen en el overlay de esta app hoy.
- **Fuentes Noto Serif TC / CJK** ([especificacion Noto](https://notofonts.github.io/noto-docs/specimen/NotoSerifCJKtc/)): incluyen Basic Latin, CJK Unified Ideographs, etc., pero **no** listan el bloque Yijing Hexagram Symbols entre sus bloques soportados. Fuentes que sí suelen cubrir U+4DC0: Symbola, DejaVu Sans, BabelStone Han ([Alan Wood](https://www.alanwood.net/unicode/yijing_hexagram_symbols.html), [Unicode chart U+4DC0](https://www.unicode.org/charts/nameslist/n_4DC0.html)).
- Conclusión: cambiar a «una fuente que tenga simbolos Zhou Yi» **no resuelve el bug actual** (que es ASCII `#N`), salvo que se **rediseñe el producto** para mostrar ䷁ en lugar de 坤 — scope distinto.

### 0.5 Estado

**Implementación §15 Fase 1–3 en curso** (segmentación mixta + tests). Pendiente smoke staging §15 Fase 5 antes de cerrar AU.

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

## 9. Implementación (Opción B, 2026-06-27)

### 9.0 Historial del renderer (dos revisiones)

| Revisión | Commit / fecha | Motor | Motivo del cambio |
|----------|----------------|-------|-------------------|
| **1** | `dfaf9c6` / 2026-06-27 | Pango vía `sharp({ text })` | Elimina `<text>` en SVG/resvg; ancho real por segmento |
| **1b** | `4132614` / 2026-06-28 | Pango + dilatación alpha | Outline borroso con hack de 8 offsets — reemplazado por halo alpha-dilatado |
| **2 (vigente)** | `c028668` / 2026-06-28 | **`@napi-rs/canvas` (Skia)** | Revisión visual en imagen Together real: segmentos Pango con alturas distintas desalineaban diacríticos; outline alpha seguía borroso. Canvas: `measureText` + baseline compartido + `strokeText` nativo |

El módulo sigue llamándose `overlay-title-pango.ts` por continuidad del fix; el código **ya no usa Pango**.

### 9.1 Qué cambió (revisión 2 vigente)

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/lib/overlay-title-pango.ts` | Renderiza el título (CJK + EN + flecha) a PNG transparente vía **`@napi-rs/canvas` (Skia)**. Fuentes registradas con `GlobalFonts.registerFromPath` (sin fontconfig). Flecha = `<path>` vectorial rasterizado, no glifo de fuente. Outline = `strokeText` nativo. |
| `apps/web/src/lib/sumi-hexagram-art.ts` | `buildSumiHexagramOverlaySvgDataUrl` es `async`; título = `<image href="data:image/png;base64,...">`. `resvg` solo rasteriza barras hexagrama + brillo. |
| `apps/web/src/lib/image-provider.ts` | Call sites con `await` por async overlay. |
| `apps/web/next.config.mjs` | `@napi-rs/canvas` en `serverExternalPackages`. |
| `apps/web/fonts/noto-serif-tc-hexagram-titles.woff2` + `generate-cjk-title-font-subset.mjs` | Subset CJK propio (72 hanzi reales); ver §10. |

### 9.2 Dos hallazgos adicionales durante la implementación (ambos corregidos, ninguno era obvio de antemano)

**Hallazgo 1 — la fuente "latin-ext" NO cubre letras básicas.** Verificado con `fontkit` (no por renderizado, que puede mentir vía fallback): `noto-serif-latin-ext-400-normal.woff` solo cubre U+0100+ (`ă`, `Ž`...). Las letras básicas (K, h, w, n...) y Latin-1 Supplement (â, î, û, ü, Î) viven en un archivo **separado** (`noto-serif-latin-400-normal.woff`, sin "-ext"). Un nombre como "Khwăn" necesita **ambos** archivos en la misma palabra. El primer render de prueba "se veía perfecto" usando solo el archivo `-ext` — pero eso era el mismo tipo de espejismo que causó el bug original: Pango/fontconfig caía a una fuente del sistema para las letras básicas, en mi máquina de desarrollo, no garantizado en Vercel. Corregido: `overlay-title-pango.ts` divide cualquier texto latino carácter por carácter según cobertura real (verificada con `fontkit`) y usa el archivo correcto para cada fragmento, sin depender de fallback alguno.

**Hallazgo 2 — la fuente "symbols" dedicada para la flecha tampoco tiene el glifo.** El propio código (`embed-svg-overlay-font.ts`, `svg-to-png.ts`) ya asumía que `noto-sans-symbols-2` cubría U+2192 ("Yi Jing hexagram symbols"). Verificado con `fontkit`: **no la tiene**. Cada render anterior de la flecha (incluyendo los de esta misma sesión antes de verificar con `fontkit`) funcionaba por el mismo motivo — fallback silencioso a una fuente del sistema. Corregido de raíz, no con otro archivo de fuente: la flecha ahora se dibuja como un **`<path>` SVG simple** (una forma vectorial, sin fuente ni texto involucrado) y se rasteriza con `sharp` — cero dependencia de fuente para ese glifo, para siempre.

### 9.3 Verificación

- `TS-WEB-OVR-004` (corre por defecto): cobertura fontkit + render real — **17/17 verde**.
- `TS-WEB-OVR-005` (`vitest.exhaustive.config.ts`, paso explícito en CI): **8064 renders — 2/2 verde**.
- `TS-WEB-OVR-006` (`gen:overlay-e2e-samples`, requiere `TOGETHER_API_KEY`): 4 muestras pipeline completo Together + overlay + composite — ink-ratio > 0.4% en zona EN.
- Caso producción `#2 Khwăn → #1 Khien` (Legge): verificado en OVR-004 y muestra `reports/overlay-pango-e2e-samples/khwan-to-khien.png`.
- Suite `apps/web` vitest default: verde sin regresiones.
- `npm run verify:overlay-glyphs`: verde.

---

## 10. Gap de cobertura CJK pre-existente — encontrado y corregido (2026-06-27, follow-up)

El test exhaustivo de glifos (`TS-WEB-OVR-004`), al verificar **cada** carácter real en vez de una muestra, encontró 3 codepoints que la fuente CJK pre-construida de Fontsource (`@fontsource/noto-serif-tc`, subset `chinese-traditional-700`) **no cubre**, verificado con `fontkit`:

| Hexagrama | Carácter | Codepoint | Dónde aparece |
|-----------|----------|-----------|----------------|
| #43 | 夬 | U+592C | `chineseName` (Wilhelm + Legge) |
| #44 | 姤 | U+59E4 | `chineseName` (Wilhelm + Legge) |
| #33 (Zhou Yi) | 遯 | U+906F | `name` (traductor Zhou Yi) |

**Esto era pre-existente, no introducido por este fix** — la misma fuente, los mismos caracteres, ya estaban en uso antes de esta sesión. Con alta probabilidad, los títulos chinos de los hexagramas #43/#44 y el nombre de Zhou Yi #33 **ya mostraban tofu en producción**, de forma independiente a la regresión Khwăn.

**Aclaración sobre el origen** (el usuario recordaba "lo tomamos de un repo CtCx o algo así"): no hay ningún repo con ese nombre en este proyecto. Lo que existe es **ctext.org** (Chinese Text Project), que es la fuente del **texto** Zhou Yi (`tools/ingest-zhouyi-ctext.mjs`) — un asunto completamente distinto de dónde viene la **fuente tipográfica** que dibuja esos caracteres en pantalla. El dato (`hexagrams.*.json`) siempre tuvo los caracteres correctos; el problema nunca fue el texto, fue que el archivo de fuente de Fontsource (un *subset* pre-armado por Google/Fontsource para optimizar peso web) no incluye estos 3 caracteres específicos, aunque sí son chinos estándar y comunes.

### 10.1 Corrección aplicada

Verificado con `fontkit` que la fuente **completa** Noto Serif TC (la que sirve la API `css2` de Google Fonts cuando se le pide un subset por `text=` específico) **sí** tiene los 3 caracteres. Se generó un subset propio, mínimo y completo, con exactamente los 72 hanzi únicos que la app necesita (derivados de los datos reales de los 3 traductores, no una lista genérica):

| Archivo | Rol |
|---------|-----|
| `apps/web/scripts/generate-cjk-title-font-subset.mjs` (**nuevo**) | Deriva el set de caracteres desde `hexagrams.{wilhelm,legge,zhouyi}.json`, pide ese subset exacto a la API `css2` de Google Fonts, descarga el `.woff2`, y **se auto-verifica con `fontkit`** antes de terminar (falla si falta algún carácter). Re-ejecutar si algún `chineseName`/`name` cambia o se agrega un traductor. |
| `apps/web/fonts/noto-serif-tc-hexagram-titles.woff2` (**nuevo**, vendored, 18.4 KB) | El resultado — reemplaza al subset de Fontsource como fuente CJK de `overlay-title-pango.ts`. Ya cubierto por el glob existente `outputFileTracingIncludes: ["./fonts/**"]` en `next.config.mjs` — sin cambios ahí. |
| `apps/web/src/lib/overlay-title-pango.ts` | `CJK_FONT_FILE` ahora apunta al archivo nuevo en vez de `FONTSOURCE_WOFF_PATHS.notoSerifTc700`. |

El archivo viejo (`@fontsource/noto-serif-tc`, usado por `embed-svg-overlay-font.ts`/`svg-to-png.ts` para el camino **no tocado** `buildSumiHexagramSvgDataUrl`) sigue como estaba — fuera de alcance de este cierre, igual que el resto de esa función.

### 10.2 Verificación

- `TS-WEB-OVR-004`: la exclusión `KNOWN_PRE_EXISTING_CJK_GAPS` se **eliminó** del test — ahora verifica los 72 caracteres reales sin excepciones, 17/17 verde.
- Verificado visualmente (función de producción real, `buildSumiHexagramOverlaySvgDataUrl`): `#43 夬 → #44 姤` y `#33 遯` (Zhou Yi, en ambas líneas del título) renderizan correctamente, sin tofu.

---

## 11. Changelog

| Fecha | Evento |
|-------|--------|
| 2026-06-27 | Apertura. Diagnóstico completo: el bug es la misma clase de defecto "no predecible por contenido" de `resvg-js` ya documentada y parcialmente cerrada en `20260625-AUD-IMG-OVR-02`, manifestándose en un par de hexagramas (#2→#1 Legge) fuera de la muestra de QA visual revisada en esa sesión. Los 3 gates existentes no renderizan el píxel final, por lo que no pueden detectar esta clase de regresión. Sin fix aplicado — opciones de remediación documentadas en §6, pendiente decisión del usuario. |
| 2026-06-27 | Implementada Opción B (§9) en `fix/overlay-pango-title-render`: título renderizado vía Pango/sharp, embebido como `<image>`, ya no como `<text>` resvg. Dos hallazgos adicionales corregidos en el camino (cobertura Latin dividida en 2 archivos; fuente de símbolos sin el glifo de flecha — reemplazada por un `<path>` vectorial). Nuevo test exhaustivo `TS-WEB-OVR-004` (corre por defecto) + companion exhaustivo de 8064 renders wired a CI. Hallazgo nuevo y separado documentado en §10 (gap CJK pre-existente, no corregido). |
| 2026-06-27 | Follow-up: corregido también el gap CJK de §10 (no era el alcance original, pero se resolvió en la misma sesión). Aclarado el origen real (ctext.org = fuente del texto Zhou Yi, no de la fuente tipográfica — sin relación con ningún "repo CtCx"). Generado `apps/web/fonts/noto-serif-tc-hexagram-titles.woff2`, un subset propio con los 72 hanzi reales de los 3 traductores, vía script reproducible (`generate-cjk-title-font-subset.mjs`) que se auto-verifica con `fontkit`. `TS-WEB-OVR-004` ya no excluye ningún codepoint — 17/17 verde sin excepciones. |
| 2026-06-28 | Revisión 1b: outline Pango con dilatación alpha (`4132614`) tras feedback visual en imagen Together real (outline borroso con hack 8-offset). |
| 2026-06-28 | **Revisión 2 (vigente):** migración a `@napi-rs/canvas`/Skia (`c028668`) — baseline compartido CJK/Latin, `strokeText` nativo. Tests OVR-004/005 re-verificados en verde. |
| 2026-06-28 | `TS-WEB-OVR-006`: generador e2e Together + pipeline prod completo (`3bf77fd`); registrado en QA registry (corrige gap WF-DOC-02). |
| 2026-06-28 | **§12 follow-up:** regresión staging Vercel (solo flechas visibles, sin hanzi ni romanización). Causa: resolución de paths de fuente vía `import.meta.url`/`REPO_ROOT` inválida tras bundling Next; `GlobalFonts.registerFromPath` devolvía `null` silenciosamente en Linux sin fallback OS. Remedio: `overlay-title-font-paths.ts`, `TS-WEB-OVR-004` v1.1.0. Smoke W/L OK post-`dda9732`. |
| 2026-06-28 | **§0 + §13–§14 — reapertura AU:** smoke staging Zhou Yi — subtítulo `#N` tofu. Causa: `enScript: "cjk"` fuerza ASCII a subset solo-hanzi. |
| 2026-06-28 | **§15 plan + implementacion Opcion A:** `splitTextByOverlayFont` en `overlay-title-pango.ts`; `TS-WEB-OVR-004` v1.2.0; `TS-WEB-OVR-005` v1.1.0 (+4032 Zhou Yi, ZH+EN ink). Pendiente smoke §15.5. |

---

## 12. Regresión staging Vercel (solo flechas)

### 12.1 Síntoma

Tras desplegar el fix Canvas (§9) a **staging**, una consulta real con traductor **Legge** y mutación **#2 → #1** (坤 → 乾) produjo un overlay con:

- Barras del hexagrama correctas
- **Dos flechas** visibles (path vectorial)
- **Sin hanzi** (`坤`, `乾`) ni romanización (`#2 Khwăn → #1 Khien`)

Es decir: el pipeline de imagen funcionaba, pero el título pre-renderizado llegaba vacío de texto.

### 12.2 Causa raíz

| Componente | Comportamiento |
|------------|----------------|
| Flecha `→` | Dibujada como `<path>` SVG / path en canvas — **no depende de fuentes** → siempre visible |
| Texto CJK + Latin | `@napi-rs/canvas` + `GlobalFonts.registerFromPath` — **invisible si la fuente no carga** |

La versión previa de `overlay-title-pango.ts` resolvía rutas de fuente con `import.meta.url` y `REPO_ROOT` + paths estáticos de `fontsource-woff-paths.ts`:

| Entorno | Latin (`REPO_ROOT` + `node_modules`) | CJK (`../../../fonts`) |
|---------|--------------------------------------|-------------------------|
| Vitest (source) | OK | Roto (`apps/fonts/`) pero no se detectaba |
| Vercel (chunk `.next/server/chunks/…`) | **Roto** | A veces OK si `./fonts/**` estaba traced |

En Linux (Vercel lambda) no hay fallback a fuentes del sistema; `registerFromPath` devolvía `null` **sin throw** → render con canvas vacío de texto pero flechas intactas.

### 12.3 Por qué los tests v1.0.0 no lo detectaron

1. **Paths de test ≠ paths de producción:** importaban `OVERLAY_TITLE_FONT_FILES` estáticos derivados de `import.meta.url` en el módulo fuente — válidos en Vitest, inválidos en el chunk empaquetado.
2. **Ink solo en banda EN:** la mayoría de asserts medían `EN_TITLE_REGION`; el fallo de CJK en dev tampoco saltaba.
3. **Windows dev:** fallback OS puede enmascarar `registerFromPath` fallido en máquinas locales.

### 12.4 Remedio

| Pieza | Cambio |
|-------|--------|
| `apps/web/src/lib/overlay-title-font-paths.ts` (**nuevo**) | `resolveOverlayTitleFontPaths()` — candidatos desde `process.cwd()` + layouts monorepo/Vercel; `assertOverlayTitleFontsRegistered()` fail-fast si `registerFromPath === null` |
| `apps/web/src/lib/overlay-title-pango.ts` | `ensureFontsRegistered()` async + cache; elimina paths estáticos `import.meta.url`/`REPO_ROOT` |
| `apps/web/next.config.mjs` | Confirma `noto-serif-latin-400-normal.woff` en `outputFileTracingIncludes` (antes solo `latin-ext` explícito) |
| `TS-WEB-OVR-004` v1.1.0 | Mismo resolver que prod; gate `registerFromPath`; fontkit vía paths resueltos; ink **ZH + EN** |

### 12.5 Smoke post-fix

Deploy staging → consulta manual Legge, mutación `#2 Khwăn → #1 Khien` (6 tiradas manual H/H/H). El overlay debe mostrar `坤 → 乾` y `#2 Khwăn → #1 Khien`, no solo flechas.

---

## 13. Zhou Yi — analisis de cobertura 1:1 (datos vs fuentes)

Inventario reproducible (2026-06-28, `fontkit` + `hexagrams.zhouyi.json`):

| Conjunto | Cantidad | En subset CJK (18 KB) | En Noto Latin (overlay) | En overlay hoy |
|----------|----------|------------------------|-------------------------|----------------|
| Hanzi unicos Zhou Yi (`name` ∪ `chineseName`) | **72** | **72/72** | N/A | Linea ZH + parte hanzi subtítulo ✓ |
| Prefijo subtítulo `#` + `0`–`9` | 11 codepoints | **0/11** | **11/11** | Forzado a CJK → **tofu** |
| Bloque U+4DC0–U+4DFF (䷀…䷿) | 64 simbolos | **0/64** | **0/64** | **No usados** en strings overlay |

Script de regeneracion del subset (`generate-cjk-title-font-subset.mjs`) ya fusiona hanzi de **Wilhelm + Legge + Zhou Yi** — la comparacion 1:1 Zhou Yi vs subset es **100% en hanzi**; el desajuste es **solo mezcla ASCII+hanzi en una linea `script: "cjk"`**.

---

## 14. Estrategias de remediacion (pendiente decision)

Pregunta de producto: «Si la fuente nueva incluye simbolos Zhou Yi, migrar solo el pipe de imagenes?»

### 14.1 Lo que dice la tipografia / Unicode (externo)

| Fuente / fuente | Hanzi TC | Basic Latin `#0-9` | Bloque Yijing U+4DC0 |
|-----------------|----------|--------------------|----------------------|
| Subset propio (18 KB woff2) | 72 hanzi app | No | No |
| `@fontsource/noto-serif-tc` chinese-traditional-700 (~1.9 MB woff) | Miles | Subsets latin aparte en npm | **No** (no en bloques Noto CJK TC) |
| Noto Serif TC completo (Google) | ~43k caracteres | Si (Basic Latin en familia) | **No** |
| Symbola / DejaVu / BabelStone Han | Variable | Parcial | **Si** (U+4DC0) |

Referencias: [Noto Serif CJK TC specimen](https://notofonts.github.io/noto-docs/specimen/NotoSerifCJKtc/), [Unicode Yijing Hexagram Symbols](https://www.unicode.org/charts/nameslist/n_4DC0.html), [Alan Wood browser test U+4DC0](https://www.alanwood.net/unicode/yijing_hexagram_symbols.html).

**Implicacion:** no existe una sola fuente Noto «serif TC + simbolos hexagrama» lista para vendorear. Mostrar ䷁ ademas de 坤 exigiria **segunda fuente** (Symbola) o **dibujo vectorial** (como la flecha), no solo ampliar el subset actual.

### 14.2 Opcion A — Segmentacion mixta en Canvas (recomendada, minima)

Replicar el split del camino resvg: en lineas Zhou Yi, `#N ` → `LATIN_BASIC_FAMILY`; hanzi → `CJK_FAMILY`. Ya existen las tres fuentes registradas (`overlay-title-font-paths.ts`).

| Pros | Contras |
|------|---------|
| Diff pequeno; mismo peso bundle (~18 KB CJK) | Hay que implementar `splitMixedCjkLine` + test que detecte tofu en prefijo |
| Paridad con W/L (misma logica de `#N`) | Segmentacion manual (no Pango fallback) |

### 14.3 Opcion B — Ampliar subset con `#0-9` + espacio

Anadir 11 codepoints al `text=` de `generate-cjk-title-font-subset.mjs`.

| Pros | Contras |
|------|---------|
| Parche rapido; una familia por linea Zhou Yi | Fragil (puntuacion futura vuelve a romper) |
| Subset sigue ~20 KB | No resuelve si algun dia se mezclan otros ASCII |

### 14.4 Opcion C — Fuente Noto Serif TC «completa» solo en pipe imagen

Sustituir el subset de 18 KB por `noto-serif-tc-chinese-traditional-700` (~1.9 MB woff) **solo** en `overlay-title-font-paths.ts` / trace Vercel.

| Pros | Contras |
|------|---------|
| Una familia para toda linea hanzi (si incluye Latin en el mismo archivo — **no**: Fontsource TC chinese-traditional es **solo CJK**, Latin va en archivos separados) | **No elimina** la necesidad de multi-font: TC chinese file no trae `#` |
| Cobertura hanzi futura sin regenerar subset | **~100×** mas peso en lambda; trace + cold start |
| | **Sigue sin U+4DC0** |

**Veredicto factibilidad:** factible tecnicamente para **hanzi** adicionales, pero **no sustituye** Latin para `#N` ni anade simbolos hexagrama Unicode. Peor relación costo/beneficio que Opcion A.

### 14.5 Opcion D — Producto: simbolos U+4DC0 en overlay Zhou Yi

Comparar 1:1 `#n` → ䷀…䷿ y renderizar pictogramas en lugar de (o junto a) hanzi.

| Pros | Contras |
|------|---------|
| Estetica «clasica» Unicode Yijing | **Cambio de producto**; fuente extra (Symbola ~800 KB+) o SVG por hexagrama |
| | Noto TC **no** los incluye; dataset actual no usa esos codepoints |
| | Legge/Wilhelm no usarian lo mismo — inconsistencia entre traductores |

### 14.6 Recomendacion del equipo (documentacion, sin implementar aun)

1. **Cerrar bug actual:** Opcion **A** (segmentacion mixta) + test Zhou Yi que falle si `#` no tiene tinta en region prefijo.
2. **Mantener subset 72 hanzi** — la comparacion 1:1 confirma que Zhou Yi **ya esta cubierto** en hanzi.
3. **No** migrar a fuente completa solo por Zhou Yi — no arregla `#N` y penaliza bundle.
4. **Simbolos U+4DC0:** decision de producto aparte; requiere fuente distinta a Noto Serif, no es el tofu observado.

---

## 15. Plan de verificación e implementación — Zhou Yi segmentación mixta (2026-06-28)

**Decision:** Opcion **A** (§14.2). Auditoria estatica confirma **0 gaps** Wilhelm/Legge con el cambio; solo Zhou Yi subtitulo (`#N` + hanzi) se beneficia.

### 15.1 Analisis exhaustivo previo (baseline confirmado)

| Traductor | Gaps renderer **antes** | Gaps con segmentacion mixta | Pares mutacion |
|-----------|-------------------------|----------------------------|----------------|
| Wilhelm | 0 | 0 | 4032 OK |
| Legge | 0 | 0 | 4032 OK |
| Zhou Yi | **17 174** (`#`/digitos en CJK) | **0** | 4032 a cubrir en OVR-005 |

**Huecos de tests identificados (pre-fix):**

| Gate | Ciego a |
|------|---------|
| OVR-004 fontkit | ASCII en linea CJK (skip cp &lt; U+3400) |
| OVR-004 ink | Prefijo `#N` tofu enmascarado por tinta hanzi |
| OVR-005 | Sin Zhou Yi; solo banda EN |
| OVR-005 | Wilhelm 110 layouts 2 lineas sin assert por linea |

**No aplica:** simbolos U+4DC0 (app usa hanzi); fuente Noto TC completa (~1.9 MB) no sustituye Latin para `#N`.

### 15.2 Fases

| Fase | Entregable | Estado |
|------|------------|--------|
| **0** | AU §0–§14 + este §15 | Hecho |
| **1** | `splitTextByOverlayFont()` + `splitOnArrow` script cjk usa segmentacion mixta (`overlay-title-pango.ts`) | Hecho |
| **2** | `TS-WEB-OVR-004` v1.2.0: tests segmentacion + Zhou Yi `#2→#1` + gate fontkit por chunk | Hecho |
| **3** | `TS-WEB-OVR-005` v1.1.0: grid **zhouyi** 4032 + ink ZH+EN (12096 renders total) | Hecho (local PASS 2026-06-28) |
| **4** | Script `verify-overlay-title-glyphs.mjs` reproducible | **Diferido** (post-smoke) |
| **5** | Smoke manual staging (checklist abajo) | Pendiente |
| **6** | Cierre AU + promocion `main` | Pendiente Fase 5 |

### 15.3 Cambios de codigo (Fase 1)

- `splitTextByOverlayFont(text)`: hanzi → `CJK_FAMILY`; ASCII/Latin (mismos rangos que `collectLatinOverlayChars`) → basic/ext.
- `splitOnArrow(..., script: "cjk")`: N chunks con familias correctas (antes: 1 chunk CJK).
- Linea ZH pura hanzi: comportamiento identico (un chunk CJK).
- W/L (`script: "latin"`): **sin cambio** — `splitLatinByFontCoverage` intacto.

### 15.4 Tests nuevos (Fase 2–3)

| Test | Atrapa |
|------|--------|
| `splitTextByOverlayFont("#2 坤")` | Latin + CJK |
| Zhou Yi 64 standalone fontkit por chunk | `#N` en Latin |
| `#2 坤 → #1 乾` ink + banda prefijo | Regresion §0 |
| OVR-005 zhouyi 4032 | Mutaciones Zhou Yi |
| OVR-005 ZH+EN bandas | Linea grande + subtitulo |

### 15.5 Smoke manual (Fase 5 — checklist verificacion)

| # | Traductor | Caso | Verificar |
|---|-----------|------|-----------|
| 1 | Legge | #2→#1, 6× H/H/H | Sin regresion W/L |
| 2 | Wilhelm | #6→#10 mutacion | Subtitulo OK |
| 3 | **Zhou Yi** | **#2→#1** | **`#2 坤 → #1 乾` sin tofu** |
| 4 | Zhou Yi | #33→#34 | 遯/遁 |
| 5 | Legge | #43→#44 | 夬/姤 |

### 15.6 Criterios de cierre AU

- [ ] Smoke §15.5 PASS en staging
- [ ] `npm run test --prefix apps/web -- overlay-title-pango` verde
- [ ] `npm run test:overlay-exhaustive --prefix apps/web` verde (~12k renders)
- [ ] §0 marcado cerrado; `status: closed` en registry

---
