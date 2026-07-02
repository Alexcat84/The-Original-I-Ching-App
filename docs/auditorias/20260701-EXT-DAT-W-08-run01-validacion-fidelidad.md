# Validación W-08 — Run 01 (post-remediación ronda 1)
**Código:** `20260701-EXT-DAT-W-08-RUN-01` · **Familia:** DAT-W · **Estado:** errores-aplicados

**Ejecutado por:** Claude Sonnet 5 (auditor externo bilingüe DE/EN)
**Fecha:** 1 jul 2026
**Script:** `scripts/validate-wilhelm-de-fidelity.py`
**Commit dataset al momento del run:** `b485d92a` (remediación ronda 1)
**Correcciones derivadas aplicadas en:** `652e9e57` (round 2, 35 fixes)

---

## Resultados por lote

### Lote 1–8

❌ **[Hexagrama 2]** `comentarios.about.rulerNote` — "Herr" partido en "He\nerr" (OCR line break).
❌ **[Hexagrama 2]** `comentarios.image.tenWings` — campo comienza a mitad de frase; contenido corresponde al comentario de línea 2, no a la Imagen.
❌ **[Hexagrama 8]** `lines[0].commentary.tenWings` — "ist\n—" intercalado + "ist\n-1" al final (OCR notas de margen).
❌ **[Hexagrama 8]** `lines[5].commentary.tenWings` — secuencia "((" sin sentido en medio del comentario.

Hexagramas 1, 3, 4, 5, 6, 7: correctos.

### Lote 9–16

❌ **[Hexagrama 9]** `judgment.tenWings` — carácter suelto "M" en línea propia.
❌ **[Hexagrama 12]** `lines[4].commentary.tenWings` — prefijo "bj" antes del comentario real.
❌ **[Hexagrama 13]** `about.sequence` — palabra intrusa "gemein" rompe la sintaxis.

### Lote 17–24

❌ **[Hexagrama 19]** `image.tenWings` — "O Anfangs Neun:" al final (sangrado B1).
❌ **[Hexagrama 21]** `about.sequence` — script tibetano ཤི་དུས་ནི་རྣ་ intercalado en texto alemán.
❌ **[Hexagrama 21]** `lines[1].commentary.tenWings` — nota al pie completa + "W" suelto en medio del comentario.
❌ **[Hexagrama 24]** `lines[2].commentary.bookOne` — "Unbestän digkeit" (palabra compuesta partida).

### Lote 25–32

❌ **[Hexagrama 27]** `about.miscNotes` — prefijo "Kun und\nKun" + basura "感 / BE AP / O / I" cortando "Mundwinkel".
❌ **[Hexagrama 27]** `lines[0].commentary.tenWings` — "nidit" en vez de "nicht".

### Lote 33–40

❌ **[Hexagrama 37]** `judgment.tenWings` — nota al pie completa + "d" suelto parten "Neun auf fünftem und Sechs auf zweitem Platz".
❌ **[Hexagrama 40]** `about.miscNotes` — "dab" en vez de "daß".
❌ **[Hexagrama 40]** `lines[5].commentary.tenWings` — nota al pie de posición 4 desplazada al final de posición 6.

### Lote 41–48

Todos perfectos.

### Lote 49–56

❌ **[Hexagrama 49]** `about.rulerNote` — frase incompleta: falta "auf geehrtem Platz weilen" entre "muß" y "um".
❌ **[Hexagrama 49]** `judgment.tenWings` — nota al pie parte "Zwei Töchter" en dos fragmentos.
❌ **[Hexagrama 50]** `about.rulerNote` — prefijo "Dui und\nKiän" antes del texto real.
❌ **[Hexagrama 50]** `lines[1].commentary.bookOne` — nota al pie de línea 1 + basura "-\n-\n**N" en comentario de línea 2. *(Verificado como limpio en inspección directa — posiblemente corregido antes del run.)*
❌ **[Hexagrama 51]** `about.rulerNote` — prefijo de encabezado incorrecto "(DAS ERSCHUTTERN...)\nKernzeichen: Kan und\nGen\n".

### Lote 57–64

❌ **[Hexagrama 57]** `image.tenWings` — "Anfangs Sechs:" al final (sangrado B1).
❌ **[Hexagrama 57]** `lines[1].commentary.tenWings` — nota al pie "Vgl. Die modernen Theorien..." en medio del comentario.
❌ **[Hexagrama 58]** `image.tenWings` — "Anfangs Neun:" al final (sangrado B1).
❌ **[Hexagrama 59]** `judgment.tenWings` — encabezado de página "16 Das Buch der Wandlungen II" insertado.
❌ **[Hexagrama 60]** `image.tenWings` — "Anfangs Neun:" al final (sangrado B1).
❌ **[Hexagrama 60]** `about.rulerNote` — falta "Grad aufzustellen, damit die Welt in Schranken gehalten werde, das" entre "Maß und" y "vermag".
❌ **[Hexagrama 61]** `about.rulerNote` — "leer\nDas\nPlatz" en lugar de "leer ist; darum sind die Sechs auf drittem Platz und die Sechs auf viertem Platz".
❌ **[Hexagrama 62]** `image.tenWings` — "Anfangs Sechs:" al final (sangrado B1).
❌ **[Hexagrama 63]** `lines[2].commentary.tenWings` — encabezado de página "17 Das Buch der Wandlungen II" insertado.
❌ **[Hexagrama 63]** `about.rulerNote` — comilla suelta `"` en línea propia + "der Zeichens" en vez de "des Zeichens".

---

## Acción tomada

Todos los errores de este run fueron corregidos en commit `652e9e57` (35 fixes, round 2).
Los tres `ruler_note` (hex 49, 60, 61) completados con texto exacto del libro en `50705abf`.
