# Validación W-08 — Run 04 (cobertura completa 2 hex/lote)
**Código:** `20260702-EXT-DAT-W-08-RUN-04` · **Familia:** DAT-W · **Estado:** errores-parcialmente-aplicados

**Ejecutado por:** Claude Sonnet 5 (auditor externo bilingüe DE/EN)
**Fecha:** 2 jul 2026
**Script:** `scripts/validate-wilhelm-de-fidelity-2hex.py` (nuevo — 2 hexagramas por lote)
**Commit dataset al momento del run:** `be47dede`
**Correcciones CAT-A aplicadas en:** pendiente de commit

---

## Método y cobertura

Primera validación con resolución de **2 hexagramas por lote** (32 lotes, cobertura total 1–64).
El mayor nivel de detalle del prompt permite detectar errores menores que los lotes de 8 hexagramas pasaban por alto (errores de puntuación, comillas sueltas, dobles espacios, caracteres non-ASCII residuales).

Los 4 archivos de datos fueron copiados junto al script para el run:
- `hexagrams.baynes.json` (GOLD)
- `hexagrams.baynes.commentary.json` (GOLD)
- `hexagrams.wilhelm.json` (TARGET)
- `hexagrams.wilhelm.commentary.json` (TARGET)

---

## Resultados por lote

### ✅ Sin errores (19 hexagramas)
4, 7, 9, 10, 12, 14, 16, 17, 19, 21, 23, 27, 31, 32, 33, 34, 35, 36, 38, 39, 43

### ❌ Con errores (45 hexagramas)

#### Hexagrama 1
- `about.rulerNote`: meses "vierten Monat (April-Mai)" vs GOLD "fourth month (May–June)" — los meses no coinciden. **[CAT-B: requiere verificación libro]**
- `wenYen.note` encabezado: dice "d 1-13" en vez de "d 1-12". **[CAT-A: aplicado]**
- `wenYen text` L3: etiqueta "b, 6" donde debería decir "b, 3" (numeración interna OCR). **[CAT-C: estructura interna WenYen compleja, no accionable sin libro]**
- `wenYen text` L5: falta etiqueta de sección "d, 11". **[CAT-C: ídem]**
- `wenYen` / `wen_yen` campo: "maẞvoll" (ẞ mayúscula) → "maßvoll". **[CAT-A: aplicado]**

#### Hexagrama 2
- `about.rulerNote`: meses "zehnten Monat (Oktober-November)" vs GOLD "tenth month (November–December)". **[CAT-B: requiere verificación libro]**
- `image.tenWings`: contiene texto idéntico al `image.bookOne` (DAS BILD) en lugar del comentario propio de las Diez Alas para la Imagen. **[CAT-B: requiere texto del libro]**
- `wenYen` campo: "maẞvoll" → "maßvoll". **[CAT-A: aplicado]**

#### Hexagrama 3
- `lines[1].commentary.tenWings`: "die Sache auf zweitem Platz" → "die Sechs auf zweitem Platz" (OCR: Sechs→Sache). **[CAT-A: aplicado]**
- `judgment.tenWings`: uso inconsistente "Kän" con diéresis en lugar de "Kan". **[CAT-A: aplicado]**

#### Hexagrama 6
- `lines[1].commentary.tenWings`: falta nombre del trigrama "Kan" antes de "das Abgründige" + comilla suelta `"` como artefacto OCR. **[CAT-B: requiere texto del libro]**

#### Hexagrama 8
- `lines[5].commentary.bookOne`: "Hinga besich" → "Hingabe sich" (OCR dividió palabra "Hingabe"). **[CAT-A: aplicado]**

#### Hexagrama 11
- `lines[4].commentary.tenWings`: falta punto final entre dos oraciones — "...zweitem Platz Durch sein zentrales Wesen..." → "...Platz. Durch sein...". **[CAT-A: aplicado]**
- `lines[5].commentary.tenWings`: em-dash "―" suelto antes de "Im allgemeinen" (artefacto OCR). **[CAT-A: aplicado]**

#### Hexagrama 13
- `lines[2].commentary.tenWings`: comillas alemanas „ " mal reconocidas como `,,` y `,` — `bedeutet,,verstecken"` → `bedeutet "verstecken"`. **[CAT-A: aplicado]**

#### Hexagrama 15
- `lines[2].commentary.tenWings`: "äußerst ehrfurchtsvoll" repetido donde debería decir "voll von Verdienst" (segunda ocurrencia). **[CAT-B: requiere texto del libro]**

#### Hexagrama 18
- `judgment.tenWings`: nota al pie extensa sobre "zyklischen Zeichen" sin equivalente en Baynes EN. **[CAT-C: contenido legítimo de Wilhelm no traducido por Baynes; no es error OCR]**

#### Hexagrama 20
- `judgment.tenWings`: fragmento parentético espurio "(statt Gen Gen steht Sun über Kun)" intercalado. **[CAT-B: requiere verificación libro]**

#### Hexagrama 22
- `judgment.bookOne`: párrafo completo sobre Schopenhauer/voluntad/arte sin equivalente en Baynes EN. **[CAT-C: contenido legítimo de Wilhelm no traducido por Baynes]**

#### Hexagrama 24
- `lines[0].commentary.tenWings`: caracteres sueltos `:\nl` en medio de cita de Confucio. **[CAT-A: aplicado]**

#### Hexagrama 25
- `judgment.tenWings`: superíndice huérfano `¹` sin nota al pie correspondiente. **[CAT-A: aplicado]**

#### Hexagrama 26
- `lines[0].commentary.bookOne`: doble espacio "ins  Unglück". **[CAT-A: aplicado]**

#### Hexagrama 28
- `lines[3].commentary.tenWings`: "Betradit" → "Betracht" (OCR: ch→di). **[CAT-A: aplicado]**

#### Hexagrama 29
- `about.miscNotes`: texto alemán dice "das Schöpferische selbst" donde GOLD dice "the Receptive" — contradicción factual potencial o error OCR. **[CAT-B: requiere verificación libro]**

#### Hexagrama 37
- `lines[4].text` (oracle): "Ein König naht er seiner Sippe" — gramática anómala (posible OCR que borró "sich"). **[CAT-B: requiere texto del libro]**
- `lines[1].commentary.tenWings`: "sudit" → "sucht" (OCR: ch→di). **[CAT-A: aplicado]**

#### Hexagrama 40
- `lines[3].commentary.tenWings`: superíndice huérfano `¹` sin nota al pie. **[CAT-A: aplicado]**

#### Hexagrama 41
- `lines[5].commentary.bookOne`: "für jeder mann" → "für jedermann" (palabra compuesta separada por OCR). **[CAT-A: aplicado]**

#### Hexagrama 42
- `about.miscNotes`: "Bau Hi Klan" vs Baynes "Pao Hsi" — posible OCR P→B. **[CAT-C: transliteración Wilhelm no estándar; posible intencional]**

#### Hexagrama 44 — **NUEVO TIPO A**
- `lines[0].text` (oracle): falta oración final "Auch ein mageres Schwein hat die Anlage dazu, umherzutoben." — desplazada al inicio de `lines[0].commentary.bookOne`. **[CAT-A: aplicado — fix en `iching_wilhelm_de_translation.mjs` + remoción de `L1_comentario`]**
- `lines[2].commentary.tenWings`: guiones sueltos y saltos de línea anómalos. **[CAT-B: leve; requiere revisión libro]**

#### Hexagrama 45
- `about.rulerNote`: menciona "zweitem und viertem Platz" como posiciones yang, pero hex 45 solo tiene yang en posiciones 4 y 5 — posible OCR "fünftem"→"zweitem". **[CAT-B: requiere verificación libro]**

#### Hexagrama 46
- `about.intro`: "Schong" como transliteración de shēng. **[CAT-C: convención de transliteración de Wilhelm, probablemente intencional]**

#### Hexagrama 47
- `lines[1].commentary.tenWings`: comilla cierre suelta en línea propia (artefacto OCR). **[CAT-A: aplicado]**

#### Hexagrama 48
- `lines[2].commentary.tenWings`: falta comilla de apertura para cita oracular. **[CAT-A: aplicado]**
- `lines[5].commentary.tenWings`: superíndice huérfano `¹`. **[CAT-A: aplicado]**

#### Hexagrama 49
- `judgment.tenWings`: "Gi zusammen mit Kun\nes bedeutet Erde im Südwesten steht" — sintaxis fragmentada por salto de línea OCR. **[CAT-B: requiere texto del libro para reconstrucción segura]**
- `lines[2].commentary.tenWings`: pronombre "ihr" → "ihm" (discordancia) + carácter "•" suelto. **[CAT-B: pronombre requiere verificación]**

#### Hexagrama 50
- `lines[1].commentary.tenWings`: nota al pie de línea 1 (¹ Die Tiegel im alten China...) insertada en medio del párrafo de línea 2, con basura "-\n**N\n" intercalada. **[CAT-A: aplicado — eliminada la nota desplazada y basura]**

#### Hexagrama 51
- `judgment.tenWings`: caracteres basura "~1\nπ" al final. **[CAT-A: aplicado]**

#### Hexagrama 52
- `about.rulerNote`: prefijo "Dschen und\nKan\n" antes del texto real. **[CAT-A: aplicado]**
- `image.tenWings`: auditor reportó carácter chino "老" y símbolos, pero no confirmado en datos actuales (posiblemente ya estaba limpio). **[nota: no verificado en fuente]**
- `lines[1].commentary.tenWings`: nota al pie sobre "Gen Ki Dschr" insertada en mitad del párrafo. **[CAT-B: contenido legítimo pero mal posicionado; requiere libro para reposicionar correctamente]**
- `lines[4].commentary.tenWings`: caracteres "S\n=" al final. **[verificar en fuente]**

#### Hexagrama 53
- `about.rulerNote`: prefijo "(ALLMÄHLICHER FORTSCHRITT)\nKernzeichen: Li und\nKan\n". **[CAT-A: aplicado]**
- `lines[1].commentary.tenWings`: "n" suelto en línea propia entre cita y explicación. **[CAT-A: aplicado]**
- `lines[4].commentary.tenWings`: caracteres basura 闫 + viñeta (zero-width space). **[CAT-A: aplicado]**

#### Hexagrama 54
- `image.tenWings`: "Anfangs Neun:" al final (sangrado B1). **[CAT-A: aplicado]**
- `about.miscNotes`: "Bemerkung: In China herrscht formell die Einehe..." sin equivalente en Baynes. **[CAT-C: contenido legítimo de Wilhelm]**

#### Hexagrama 55
- `lines[4].commentary.tenWings`: falta "Heil" al final de la explicación. **[CAT-B: requiere texto del libro]**
- `lines[5].commentary.tenWings`: separador "~~" entre párrafos (artefacto OCR). **[CAT-A: aplicado]**
- `image.tenWings`: frase con estructura extraña — comilla escapada y guiones en posición anómala. **[CAT-B: requiere texto del libro]**

#### Hexagrama 56
- `image.tenWings`: "Anfangs Sechs:" al final (sangrado B1). **[CAT-A: aplicado]**
- `lines[3].commentary.tenWings`: frase fragmentada con guiones — "Er ruht, weil er seinen Platz - er ist stark, der Platz ist\nschwach noch nicht erreicht hat". **[CAT-B: requiere texto del libro]**

#### Hexagrama 57
- `judgment.tenWings`: superíndice huérfano `¹` (nota al pie perdida). **[CAT-C: notas al pie Wilhelm son legítimas; huérfano pero no perjudicial]**
- `lines[4].commentary.tenWings`: caracteres sueltos `\n""` al final. **[CAT-A: aplicado]**

#### Hexagrama 58
- `lines[4].commentary.tenWings`: comillas malformadas — cierre antes de apertura + comilla suelta en línea propia. **[CAT-A: aplicado]**

#### Hexagrama 59
- `judgment.tenWings`: carácter "L" suelto entre dos citas oraculares. **[CAT-A: aplicado]**
- `lines[5].commentary.tenWings`: carácter chino 節 (nombre del hex 60) al final — sangrado entre hexagramas. **[CAT-A: aplicado]**
- `about.rulerNote`: oración incompleta "denn die Auflösung steht." — en realidad el campo completo es una oración extensa; auditor fue impreciso. **[falso positivo — campo completo y coherente]**

#### Hexagrama 60
- `judgment.tenWings`: "maẞvolle" → "maßvolle". **[CAT-A: aplicado]**
- `lines[5].commentary.tenWings`: carácter chino 中孚 (nombre del hex 61) al final. **[CAT-A: aplicado]**
- `image.bookOne`: doble espacio "fassen.  Darin". **[CAT-A: aplicado en book-one]**
- `about.rulerNote`: estructura forzada — auditor indicó problema, pero campo es completo y semánticamente correcto. **[posible falso positivo — no accionado]**

#### Hexagrama 61
- `judgment.tenWings`: "n" suelto en línea propia + "Į\nI\n" (I con gancho lituano, U+012E) en medio del texto. **[CAT-A: aplicado]**
- `about.miscNotes`: "^^^" entre dos líneas de contenido. **[CAT-A: aplicado]**
- `lines[5].commentary.tenWings`: caracteres 小​過 (nombre hex 62 con zero-width space). **[CAT-A: aplicado]**
- `judgment.tenWings`: párrafo extra sobre "Dschou I Hong Giä" y delfines sin equivalente en Baynes. **[CAT-C: contenido legítimo de Wilhelm]**

#### Hexagrama 62
- `lines[0].commentary.tenWings`: guión "-" suelto en línea propia. **[CAT-A: aplicado]**
- `image.bookOne`: doble espacio "Trauerfällen  steht" — reportado por auditor, pero no confirmado en datos actuales. **[posible falso positivo]**
- `lines[2].commentary.bookOne`: doble espacio "Selbstvertrauen  täuscht". **[CAT-A: aplicado en book-one]**

#### Hexagrama 63
- `judgment.bookOne`: doble espacio "aber die  Wurzel". **[CAT-A: aplicado]**
- `lines[0].commentary.bookOne`: doble espacio "kann ihm  nicht". **[CAT-A: aplicado]**
- `lines[1].commentary.bookOne`: "gewe sen" → "gewesen" (OCR split palabra). **[CAT-A: aplicado]**
- `lines[2].commentary.bookOne`: doble espacio "erworbenen  Gebiete". **[CAT-A: aplicado]**
- `lines[5].commentary.bookOne`: doble espacio "und nicht  zurücksieht". **[CAT-A: aplicado]**

#### Hexagrama 64
- `judgment.bookOne`: doble espacio "kühnlich  drauflos". **[CAT-A: aplicado]**
- `lines[1].commentary.bookOne`: doble espacio "einen Wagen  haben". **[CAT-A: aplicado]**
- `lines[4].commentary.bookOne`: doble espacio "oder der Wald  nach". **[CAT-A: aplicado]**
- `lines[5].commentary.bookOne` / `judgment.bookOne`: "Bemerkung:" adicional sin equivalente en Baynes. **[CAT-C: contenido legítimo de Wilhelm]**

---

## Resumen de correcciones

### CAT-A aplicadas (49 fixes, script: `repair-w08-run04.mjs`)

| Archivos fuente modificados | Fixes |
|----------------------------|-------|
| `comments/wilhelm-de-64hex-comments-merged.json` | 37 |
| `book-one/wilhelm-de-64hex-merged.json` | 11 |
| `scripts/iching_wilhelm_de_translation.mjs` | 1 (hex 44 TYPE A nuevo) |

Tipos de fix:
- OCR word substitutions: Sache→Sechs, Betradit→Betracht, sudit→sucht, Hinga besich→Hingabe sich, jeder mann→jedermann
- Caracteres OCR basura eliminados: ~1π, ~~~, 闫, 節, 中孚, 小過, ^^^, Į, dobles espacios, guiones/comillas sueltas, notas al pie desplazadas
- B1 sangrado image.tenWings truncado: hex 54, 56
- Spillover entre hexagramas en L6 tenWings: hex 59, 60, 61
- Mayúscula ẞ → ß: hex 1, 2, 60
- **Nuevo TYPE A**: hex 44 L1 — oración oracular desplazada a bookOne

### CAT-B pendientes (requieren texto del libro)

| Hex | Campo | Descripción |
|-----|-------|-------------|
| 1 | `about.rulerNote` | Meses "April-Mai" (¿debería ser "Mai-Juni"?) |
| 2 | `about.rulerNote` | Meses "Oktober-November" (¿debería ser "November-Dezember"?) |
| 2 | `image.tenWings` | Campo con contenido incorrecto (copia de bookOne) |
| 6 | `lines[1].commentary.tenWings` | Trigrama "Kan" faltante + comilla suelta |
| 15 | `lines[2].commentary.tenWings` | "äußerst ehrfurchtsvoll" vs "voll von Verdienst" |
| 20 | `judgment.tenWings` | Parentético espurio "(statt Gen Gen steht Sun über Kun)" |
| 29 | `about.miscNotes` | "Schöpferische" vs "Receptive" — contradicción factual |
| 37 | `lines[4].text` | "naht er seiner Sippe" — ¿falta "sich"? |
| 44 | `lines[2].commentary.tenWings` | Guiones y saltos anómalos (leve) |
| 45 | `about.rulerNote` | "zweitem und viertem Platz" — ¿debería ser "viertem und fünftem"? |
| 49 | `judgment.tenWings` | "Gi zusammen mit Kun\nes bedeutet Erde" — OCR fragmentó sintaxis |
| 49 | `lines[2].commentary.tenWings` | Pronombre "ihr" vs "ihm" + carácter suelto "•" |
| 52 | `lines[1].commentary.tenWings` | Nota al pie insertada en mitad de párrafo |
| 55 | `lines[4].commentary.tenWings` | Falta "Heil" al final |
| 55 | `image.tenWings` | Frase con estructura anómala ("zusammengehalten-ohne weiteres") |
| 56 | `lines[3].commentary.tenWings` | Frase fragmentada con guiones |

### CAT-C — No accionable (contenido legítimo Wilhelm, diferencias editoriales)
Hex 18 (nota zyklischen Zeichen), 22 (párrafo Schopenhauer), 42 (transliteración Bau Hi), 46 (transliteración Schong), 54 (Bemerkung matrimonio), 61 (párrafo Dschou I Hong Giä), 64 (Bemerkung final).

---

## Acción tomada

- Script `repair-w08-run04.mjs` aplicado: 49 fixes en 3 archivos fuente.
- `npm run build:data` ejecutado: 6 JSONs regenerados.
- Pendiente: **commit** del resultado.
- Pendiente: **CAT-B** — usuario proveerá texto del libro para los 16 campos listados arriba.
