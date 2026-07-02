# Auditoría externa: Contaminación OCR y sangrado de campos en Wilhelm DE 1924
**Código:** `20260701-EXT-DAT-W-08 wilhelm-de-ocr-field-contamination` · **Familia:** DAT-W · **Estado:** remediado-pendiente-verificacion

**Validado por:** Claude Sonnet 5 (auditor externo bilingüe DE/EN)
**Fecha:** 1 jul 2026
**Método:** Comparación semántica campo a campo entre Baynes EN 1950 (EPUB gold, garantizado) y Wilhelm DE 1924 (PDF/OCR runtime) en 8 lotes de 8 hexagramas. Script: `scripts/validate-wilhelm-de-fidelity.py`.
**Datasets comparados:**
- GOLD: `packages/iching-data/src/generated/hexagrams.baynes.json` + `hexagrams.baynes.commentary.json`
- TARGET: `packages/iching-data/src/generated/hexagrams.wilhelm.json` + `hexagrams.wilhelm.commentary.json`

**Relacionado con:** `20260628-AUD-DAT-W-02`, `20260630-AUD-DAT-W-07`

---

## Resumen ejecutivo

La auditoría detectó **dos categorías de defectos estructurales** en el dataset Wilhelm DE runtime:

| Categoría | Descripción | Archivos afectados |
|-----------|-------------|-------------------|
| **A — Sangrado text→bookOne** | El campo `text` de una línea oracular está truncado; el fragmento faltante aparece desplazado al inicio del campo `commentary.bookOne` de esa misma línea (o de la siguiente). | `hexagrams.wilhelm.json` |
| **B — Contaminación OCR** | Caracteres de escaneo, índices de libro, sellos de biblioteca y texto de otro hexagrama incrustados en campos de comentario. También: `image.tenWings` de hex 1 y 2 contiene el bloque completo de comentarios de líneas duplicado. | `hexagrams.wilhelm.commentary.json` |

**Total de defectos:** 28 (22 tipo A, 6 tipo B — sin contar las dos instancias estructurales de hex 1/2 `image.tenWings`).

---

## Defectos Tipo A — Sangrado `text` → `bookOne` (hexagrams.wilhelm.json)

El patrón es uniforme: el texto oracular de la línea fue cortado en el proceso de ingesta OCR/build, y la parte faltante quedó pegada al inicio del comentario `bookOne` de esa línea (o, en un caso, del comentario de la línea siguiente).

| # | Hexagrama | Línea | Texto truncado termina en... | Fragmento desplazado al commentary |
|---|-----------|-------|------------------------------|-------------------------------------|
| 1 | 11 | 2 | `...die Genossen nicht berücksichtigen:` | `So mag man es fertigbringen, in der Mitte zu wandeln` |
| 2 | 12 | 5 | `(parcial)` | `Dadurch bindet er es an ein Bündel von Maulbeerstauden` |
| 3 | 13 | 5 | `(parcial)` | `Nach großen Kämpfen gelingt es ihnen, sich zu treffen` |
| 4 | 15 | 6 | `...Heere marschieren zu lassen,` | `um die eigene Stadt und das eigene Land zu züchtigen` |
| 5 | 21 | 4 | `Fördernd ist es,` | `der Schwierigkeiten eingedenk und beharrlich zu sein. Heil!` |
| 6 | 24 | 6 | `Wenn man so Heere marschieren läßt,` | `wird man schließlich eine große Niederlage erleiden...` |
| 7 | 27 | 3 | `Beharrlichkeit bringt Unheil.` | `Zehn Jahre handle nicht danach. Nichts ist fördernd.` |
| 8 | 30 | 3→4 | `...schlagen die Menschen entweder auf den Topf und singen,` | En bookOne de línea 4: `oder sie seufzen laut über das nahende Greisenalter. Unheil.` |
| 9 | 34 | 4 | `Die Hecke öffnet sich, es gibt keine Verwicklung.` | `Die Macht beruht auf der Achse eines großen Wagens` |
| 10 | 35 | 1 | `Beharrlichkeit bringt Heil.` | `Wenn man kein Vertrauen findet, so bleibe man gelassen. Kein Fehler.` |
| 11 | 36 | 1 | `Er senkt seine Flügel.` | `Der Edle auf seiner Wanderschaft ißt drei Tage nichts...` |
| 12 | 38 | 1 | `Es kommt von selber wieder.` | `Wenn du böse Menschen siehst, so hüte dich vor Fehlern.` |
| 13 | 42 | 5 | `Erhabenes Heil!` | `Wahrhaftig wird Güte als deine Tugend anerkannt werden.` |
| 14 | 45 | 1 | `...bald Verwirrung, bald Sammlung.` | `Wenn du rufst, so kannst du nach einem Griff wieder lachen. Bedaure nichts. Hingehen ist ohne Makel.` |
| 15 | 45 | 2 | `Wenn man wahrhaftig ist,` | `so ist es auch fördernd, ein kleines Opfer zu bringen` |
| 16 | 47 | 3 | `und stützt sich auf Dornen und Disteln.` | `Er geht in sein Haus und sieht nicht seine Frau. Unheil!` |
| 17 | 49 | 3 | `Wenn die Rede von der Umwälzung dreimal ergangen ist,` | `dann mag man sich ihm zuwenden und findet Glauben` |
| 18 | 50 | 3 | `Das Fett des Fasans wird nicht gegessen.` | `Wenn erst der Regen fällt, dann erschöpft sich die Reue. Endlich kommt Heil.` |
| 19 | 53 | 3 | `Der Mann zieht aus und kehrt nicht wieder.` | `Die Frau trägt ein Kind, aber bringt es nicht zur Welt. Unheil! Fördernd ist es, Räuber abzuwehren.` |
| 20 | 59 | 1 | `Er bringt Hilfe mit der Macht eines Pferdes.` | Falta `Heil!` (frase final) |
| 21 | 61 | 2 | `Sein Junges antwortet ihm.` | `Ich habe einen guten Becher. Ich will ihn mit dir teilen.` |
| 22 | 63 | 5 | `bekommt nicht soviel wirkliches Glück` | `wie der Nachbar im Westen mit seinem kleinen Opfer` |
| 23 | 64 | 4 | `Erschütterung, um das Teufelsland zu züchtigen.` | `Drei Jahre lang gibt es Belohnungen mit großen Reichen` |

---

## Defectos Tipo B — Contaminación OCR y mezcla estructural (hexagrams.wilhelm.commentary.json)

### B1 — Mezcla estructural: `image.tenWings` contiene comentarios de líneas (hex 1 y 2)
`hex1.image.tenWings` y `hex2.image.tenWings`: tras el pasaje correcto de la Imagen, el campo contiene TODO el bloque de comentarios por línea (Anfangs Neun, Neun auf zweitem Platz...) que ya existe correctamente en `lines[].commentary`. Duplicación que mezcla dos secciones de las Diez Alas.

### B2 — OCR basura en campos de comentario

| # | Hexagrama | Campo | Descripción del defecto |
|---|-----------|-------|------------------------|
| 1 | 1 | `wenYen.note` | Carácter chino suelto `坤:` al final (filtración del hexagrama 2) |
| 2 | 8 | `about.rulerNote` | Texto interleaveado / garbled: dos oraciones mezcladas palabra por palabra por el OCR |
| 3 | 12 | `image.tenWings` | Cadena `wwww` al final del párrafo (artefacto de escaneo) |
| 4 | 21 | `judgment.tenWings` | Carácter chino `曰` y letras sueltas `t`, `K`, `a` incrustados en medio del texto |
| 5 | 57 | `about.rulerNote` | Prefijo `Li und\nDui\nObw` antes del texto real (encabezado de página OCR) |
| 6 | 61 | `about.rulerNote` | Prefijo `Gen und\nDschen\nas` mezclado con texto real |
| 7 | 64 | `lines[5].commentary.tenWings` | Volcado masivo: índice completo del libro (VERZEICHNIS DER ZEICHEN 1-64) + caracteres sueltos + sello bibliotecario `UNIVERSITY OF ILLINOIS-URBANA 3 0112 067330040` |

---

## Impacto en producto

- **Tipo A**: Los textos oraculares mostrados en consultas y en la Biblioteca son **incompletos** para los 23 hexagramas afectados. El usuario lee una línea cortada — sin el verso de cierre, el significado del oráculo queda truncado.
- **B1 (hex 1-2)**: El comentario de `image.tenWings` en la Biblioteca muestra contenido duplicado y desordenado para los dos hexagramas más consultados.
- **B2**: Caracteres sin sentido y basura de escaneo visibles en los campos de comentario de la Biblioteca para los hexagramas afectados.

---

## Remediación aplicada (2026-07-01)

**Archivos editados (fuentes upstream):**
- `scripts/iching_wilhelm_de_translation.mjs` — 23 textos oraculares restaurados (Tipo A)
- `tools/datasets/wilhelm-de/book-one/wilhelm-de-64hex-merged.json` — 23 fragmentos extraídos del inicio de `_comentario` (Tipo A) + fixes previos de `_oraculo`
- `tools/datasets/wilhelm-de/comments/wilhelm-de-64hex-comments-merged.json` — 9 campos Tipo B saneados

**Archivos regenerados (`npm run build:data`):**
- `packages/iching-data/src/generated/hexagrams.wilhelm.json`
- `packages/iching-data/src/generated/hexagrams.wilhelm.commentary.json`

**Metodología de restauración (Tipo A):** los fragmentos faltantes estaban desplazados al inicio del campo `_comentario` (o `L{n}_comentario`) del mismo hexagrama. Se movieron al campo `_oraculo` / oracle text correspondiente. El contenido fue validado semánticamente por Sonnet 5 contra Baynes EN gold antes de su aplicación.

**Limitación conocida:** los fragmentos restaurados provienen del mismo OCR que generó los defectos originales. Es posible que contengan errores sutiles de escritura alemana (sustituciones `ch`→`dl`, `ß`→`b`, palabras compuestas mal divididas). Se requiere verificación contra fuente impresa para cierre definitivo.

**Script de validación actualizado:** `scripts/validate-wilhelm-de-fidelity.py` actualizado con patrones OCR conocidos y verificación completa campo a campo. Ejecutar para re-auditoría post-remediación.

**Criterio de cierre:** re-ejecución de `scripts/validate-wilhelm-de-fidelity.py` devuelve `"Todos perfectos."` en los 8 lotes, confirmado por revisión manual de casos dudosos contra fuente impresa.
