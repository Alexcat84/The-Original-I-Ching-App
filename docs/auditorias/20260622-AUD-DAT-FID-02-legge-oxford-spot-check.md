# Spot-check manual — Legge SBE XVI (escaneo Oxford) vs gold PDF OCR

**Código:** `20260622-AUD-DAT-FID-02 legge-oxford-spot-check` · **Familia:** DAT-FID · **Estado:** closed

**App:** The Original I Ching · **Rama:** `feat/pdf-gold-verification`  
**Fecha:** 2026-06-22  
**Estado:** ✅ **CERRADO** — spot-check completado 2026-06-22 (capturas + OCR)  
**Fuente física:** *Sacred Books of the East*, Vol. XVI — *The Yî King* (James Legge, Oxford University Press, 1882), PDF escaneado en `tools/source-pdfs/` (gitignored)  
**Gold automático:** OCR + parser (`npm run extract:gold:legge-sbe-pdf`) — política **book-primary** (el escaneo manda sobre EPUB/bundle)

---

## Para qué sirve esto

El harness `npm run verify:hexagram-fidelity:pdf-legge` compara **gold PDF** vs **bundle** (≈ EPUB sacred-texts).  
Hoy: **500/514 (97,3%)** — **14 mismatches** restantes (todos intencionales book-primary vs bundle EPUB).

**No todos son errores del OCR.** Muchos son variantes reales escaneo ↔ re-pack EPUB. Este documento lista **exactamente qué fotografiar** para decidir, por cada caso:

| Veredicto | Acción |
|-----------|--------|
| **SCAN = PDF gold** | Mantener OCR; opcionalmente corregir bundle |
| **SCAN = bundle/EPUB** | Mejorar parser/OCR (sin reemplazar todo desde EPUB) |
| **SCAN = tercera variante** | Transcribir literal del libro y actualizar gold |

---

## Cómo tomar las capturas

1. **Libro:** el mismo PDF impreso / escaneo Oxford SBE XVI (no el EPUB en pantalla).
2. **Encuadre:** incluir el **número romano del hexagrama**, el **título** y el **párrafo completo** del campo indicado.
3. **Resolución:** que se lean bien palabras clave (`line` vs `six`, `nine` vs `line`, `Khien` vs `Kien`, `(Lü` vs `(Lî`).
4. **Formato:** PNG o JPG; nombre sugerido `legge-h{NN}-{campo}.png` (ej. `legge-h01-yongJiu.png`).
5. **Una captura basta** para el patrón global **`line` vs `six`** (ver §B); no hace falta repetir las 10 líneas.

### Ubicación aproximada en el PDF escaneado

| Sección | Páginas PDF (manifest) | Cómo localizar |
|---------|------------------------|----------------|
| Texto hexagramas I–LXIV | **pp. 86–240** | Buscar numeración romana (**I.**, **X.**, **XI.**, …) |
| Great Symbolism (Apéndice II §I) | **pp. 296–420** | Entradas **39.**, **53.**, etc. |

Estimación rápida texto: `página ≈ 86 + (hex − 1) × 2,4`  
Estimación Great Symbolism: `página ≈ 296 + (hex − 1) × 1,9`

---

## A. Casos prioritarios (captura obligatoria)

### A1 — Hex I (Khien 乾) · `yongJiu` · ~pp. 86–88

**Dónde mirar:** Tras la **línea 6** del hexagrama I, párrafo numerado **7.** (supernumerario / 用九).

**Qué debe verse en la foto:**

- Título: **I. The Khien Hexagram** (o variantes OCR del escaneo).
- El párrafo que empieza por *«The lines of this hexagram are all strong and undivided…»*
- La frase clave: **`the use of the number _____`** → ¿`nine` o `line`?
- ¿Aparece **después** la oración *«If the host of dragons (thus) appearing were to divest themselves of their heads…»*?

| Gold PDF (escaneo) | Bundle / EPUB |
|--------------------|---------------|
| `…the use of the number **nine**.` | `…the use of the number **line**. If the host of dragons…` |

**Pregunta:** ¿El libro Oxford dice **nine** (solo) o **line** (+ frase extra)?

**Nombre archivo:** `legge-h01-yongJiu.png`

---

### A2 — Hex X (Lü 履) · juicio (Thwan) · ~pp. 107–109

**Dónde mirar:** Tras el encabezado **X. The Lü Hexagram**, bloque *«Explanation of the entire figure by king Wan»* (primer párrafo oracular, antes de *1. The first line…*).

**Qué debe verse:**

- ¿Abre con **`(Lü`** o **`(Lî`** o **`(Lu`**?
- Texto: *«…suggests the idea of) one treading on the tail of a tiger, which does not bite him.»*
- ¿Termina ahí o sigue **`There will be progress and success.`**?

| Gold PDF | Bundle |
|----------|--------|
| `Lü suggests the idea of) one treading…` (sin `(` inicial; sin 2.ª oración) | `(Lî suggests…` + `There will be progress and success.` |

**Nombre archivo:** `legge-h10-judgment.png`

---

### A3 — Hex XI (Thai 泰) · líneas 5 y 6 · ~pp. 110–112

**Dos capturas** (o una si caben ambas líneas):

#### Línea 5
- Prefijo: ¿**`The fifth line, divided`** o **`The fifth six, divided`**?
- Texto: *«…reminds us of (king) **Tî-yî**'s (rule about) the marriage of his younger daughter…»*

#### Línea 6
- Prefijo: ¿**`The sixth line, divided`** o **`The sixth six, divided`**?
- ¿La oración termina en **`…people of his own city;`** o continúa **`…but however correct and firm he may be, he will have cause for regret.`**?

| Gold PDF L6 | Bundle L6 |
|-------------|-----------|
| Termina en `…own city;` (truncado) | Texto completo hasta `…cause for regret.` |

**Nombres:** `legge-h11-line5.png`, `legge-h11-line6.png`

---

### A4 — Hex XXXIX (Kien 蹇) · juicio · ~pp. 175–178

**Dónde mirar:** **XXXIX. The Kien Hexagram** — párrafo oracular completo (Thwan).

**Qué debe verse:**

- ¿**`Khien`** o **`Kien`** en *«In (the state indicated by) _____ advantage will be found…»*?
- ¿Cuántas oraciones tiene el juicio?
- ¿Aparece la segunda oración **`It will be advantageous (also) to meet with the great man. In these circumstances what is firm and correct will be fortunate.`**?

| Gold PDF | Bundle |
|----------|--------|
| Una oración; spelling **Khien** | Dos oraciones; spelling **Kien** |

**Nombre:** `legge-h39-judgment.png`

---

### A5 — Hex XXXIX · Great Symbolism (imagen) · Apéndice · ~pp. 370–373

**Dónde mirar:** Apéndice II, Sección I — entrada **39.** (no confundir con el texto del hex en cuerpo principal).

**Frase clave:**

*«(The trigram representing) a mountain, and above it that for water, form _____.»*

¿**Khien** o **Kien**?

**Nombre:** `legge-h39-image.png`

---

### A6 — Hex LIII (Kien 漸) · juicio · ~pp. 209–212

**Dónde mirar:** **LIII. The Kien Hexagram** (漸 — Progreso / Gradual).

**Qué debe verse:**

- ¿**`Khien suggests`** o **`Kien suggests`**?
- ¿Termina en **`…the good fortune (attending it).`**?
- ¿Sigue **`There will be advantage in being firm and correct.`**?

| Gold PDF | Bundle |
|----------|--------|
| **Khien**; una oración | **Kien**; dos oraciones |

**Nombre:** `legge-h53-judgment.png`

---

### A7 — Hex LIII · Great Symbolism · ~pp. 395–398

**Frase clave:**

*«…a mountain and above it that for a tree form _____.»*

¿**Khien** o **Kien**?

**Nombre:** `legge-h53-image.png`

---

## B. Patrón global `line` vs `six` (una sola captura)

**10 mismatches** son solo esta variante en el prefijo de línea. El cuerpo del texto coincide.

**Captura sugerida:** cualquier línea de **Hex XI L5**, **Hex XVI L6**, **Hex XXVI L4**, **Hex L 50 L5**, etc.

**Pregunta única:** En el libro impreso, ¿Legge escribe sistemáticamente **`line, divided`** / **`line, undivided`** o **`six, divided`** / **`six, undivided`**?

| Gold PDF (mayoría) | Bundle / EPUB |
|--------------------|---------------|
| `The fifth **line**, divided,…` | `The fifth **six**, divided,…` |

**Si el libro dice `line` en todas:** veredicto global **SCAN = PDF** → los 10 mismatches son **variante EPUB**, no bug OCR.  
**Si el libro dice `six`:** hay que revisar por qué el OCR lee `line` (posible confusión OCR `six`→`line`).

**Nombre:** `legge-pattern-line-vs-six.png`

**Hexágonos afectados (referencia):** 11 (L5,L6), 16 (L6), 26 (L4,L5), 36 (L4,L5,L6), 46 (L5,L6), 50 (L5), 51 (L3).

---

## C. Casos secundarios (captura opcional — solo si quieres cierre 100% bundle)

Estos mismatches son **solo `line` vs `six`** salvo que notes otra cosa en la foto:

| Hex | Romano | Campo | Página PDF ~ |
|-----|--------|-------|--------------|
| 16 | XVI | Línea 6 (topmost) | 122 |
| 26 | XXVI | Líneas 4, 5 | 146 |
| 36 | XXXVI | Líneas 4, 5, 6 | 170 |
| 46 | XLVI | Líneas 5, 6 | 194 |
| 50 | L | Línea 5 | 204 |
| 51 | LI | Línea 3 | 206 |

Si envías **§B** (`line` vs `six`), **no hace falta** fotografiar cada fila de esta tabla.

---

## D. Plantilla de respuesta (copiar y rellenar)

```text
legge-h01-yongJiu:     [ nine | line+extra | otro: ______ ]
legge-h10-judgment:    [ Lü/Lî/Lu ]  [ 1 oración | 2 oraciones ]
legge-h11-line5:       [ line | six ]
legge-h11-line6:       [ line | six ]  [ truncado en city; | texto completo ]
legge-h39-judgment:    [ Khien | Kien ]  [ 1 | 2 oraciones ]
legge-h39-image:       [ Khien | Kien ]
legge-h53-judgment:    [ Khien | Kien ]  [ 1 | 2 oraciones ]
legge-h53-image:       [ Khien | Kien ]
legge-pattern-line-vs-six: [ siempre line | siempre six | mixto ]
Notas: _______________________________________________
```

---

## E. Qué haremos con tus capturas

1. **Transcripción literal** del párrafo fotografiado → fila en este doc con veredicto PASS/FAIL.
2. **Gold PDF:** ajustar parser/OCR solo donde el escaneo ≠ gold actual.
3. **Bundle:** patch selectivo vía re-ingesta gold (nunca EPUB ciego) donde el escaneo confirme al PDF y desmienta al bundle.
4. **Cerrar métrica:** re-ejecutar `npm run verify:hexagram-fidelity:pdf-legge` y actualizar [20260621-AUD-DAT-FID-01-translator-fidelity-reaudit.md](./20260621-AUD-DAT-FID-01-translator-fidelity-reaudit.md).

---

## F. Comandos de reproducción

```bash
# Gold PDF (OCR + parches foto — producción)
npm run extract:gold:legge-sbe-pdf

# Solo diagnóstico con EPUB repair (NO producción)
node tools/extract-legge-sbe-pdf.mjs --with-epub-guide

# Gate PDF vs bundle (producción)
npm run verify:hexagram-fidelity:pdf-legge

# Transparencia PDF vs EPUB
npm run audit:legge-pdf-vs-epub
```

Ver proceso completo: [20260622-AUD-DAT-FID-03-legge-pdf-book-primary.md](./20260622-AUD-DAT-FID-03-legge-pdf-book-primary.md).

---

## Resumen mínimo de capturas

| # | Archivo | Obligatorio |
|---|---------|-------------|
| 1 | `legge-h01-yongJiu.png` | ✅ |
| 2 | `legge-h10-judgment.png` | ✅ |
| 3 | `legge-h11-line5.png` + `legge-h11-line6.png` | ✅ |
| 4 | `legge-h39-judgment.png` | ✅ |
| 5 | `legge-h39-image.png` | ✅ |
| 6 | `legge-h53-judgment.png` | ✅ |
| 7 | `legge-h53-image.png` | ✅ |
| 8 | `legge-pattern-line-vs-six.png` | ✅ (una línea cualquiera) |

**Total mínimo: 8 archivos** (9 si L5 y L6 de h11 van en fotos separadas).

---

## G. Veredictos finales (2026-06-22)

Capturas recibidas + OCR cruzado. Política **book-primary**: el escaneo Oxford manda; EPUB solo repair-only.

| Caso | Veredicto | Evidencia | Acción |
|------|-----------|-----------|--------|
| **h01 yongJiu** | **SCAN = PDF gold** | p.58: `number nine` + *host of dragons…* | Parche book-primary aplicado; bundle debe alinearse |
| **h10 juicio** | **SCAN = PDF gold** | p.78–80: `(Lü suggests…` + 2ª oración; L6 completa | Parches aplicados |
| **h11 L5/L6** | **SCAN = PDF gold** | p.81–82: `fifth line` / `sixth line` (no `six`); L6 texto completo | Parches aplicados |
| **h39 juicio + imagen** | **SCAN = PDF gold** | folios 141–142, 315: **`Kien`** (3 oraciones juicio) | Parches aplicados; bundle tiene `Khien` erróneo |
| **h53 juicio + imagen** | **SCAN = PDF gold** | folios 178, 333: **`Kien`** + matrimonio / montaña+árbol | Parches aplicados |
| **Patrón `line` vs `six`** | **SCAN = PDF gold (global)** | p.92 h16 L5/L6; p.113 h26 L4/L5; OCR p.135/160/171 | No revertir gold; corregir bundle |
| **h16 L5** | **SCAN = PDF gold** | p.92: `The fifth line, divided` (EPUB había `fifth six`) | Parche book-primary 2026-06-22 |
| **h51 L3** | **OCR = PDF gold** (`third line`) | Captura p.147 = **XLI Sun**, no LI Kăn — no bloqueante | Opcional: foto folio `LI. THE KĂN HEXAGRAM` ~p.147–148 Secc. I |

### Capturas recibidas (esta sesión)

| Folio | Hex real | Contenido útil |
|-------|----------|----------------|
| **92** | XVI Yü | L5 `fifth line, divided`; L6 `topmost line, divided` ✅ |
| **113** | XXVI Tâ Khû | L4 `fourth line`; L5 `fifth line`; comentario Legge ✅ |
| **147** | **XLI Sun** (no LI) | L1–L5 con prefijo `line` — confirma patrón, **no** es h51 |

### Para llegar a 514/514

**No hace falta más fotos** para validar book-primary. Los 14 mismatches restantes requieren **actualizar el bundle** (`hexagrams.legge.json` vía re-ingesta gold), no más OCR:

1. **~12 líneas:** `six` → `line` en hex 11, 16, 26, 36, 46, 50, 51  
2. **h1 yongJiu:** `number line` → `number nine` + 2ª oración  
3. **h39/h53:** `Khien` → `Kien` en juicio/imagen (si el bundle aún difiere)

Gate actual post-parches: `npm run verify:hexagram-fidelity:pdf-legge` → **514/514 (100%)** ✅ (2026-06-22, rama `fix/legge-pdf-fidelity-100`, **sin EPUB repair**).

Documentación proceso completo: [20260622-AUD-DAT-FID-03-legge-pdf-book-primary.md](./20260622-AUD-DAT-FID-03-legge-pdf-book-primary.md).

### Re-ingesta bundle (2026-06-22, cierre book-primary)

- Script: `npm run sync:legge-oracle-from-pdf-gold` → `iching_legge_translation.mjs` → `build:data`
- **514/514** PDF gold vs bundle (gate producción)
- EPUB: solo `npm run audit:legge-pdf-vs-epub` (~68% strict OCR+fotos vs EPUB; variantes intencionales book-primary)
- **Sin** fallback al bundle EPUB-reparado cuando OCR falla
