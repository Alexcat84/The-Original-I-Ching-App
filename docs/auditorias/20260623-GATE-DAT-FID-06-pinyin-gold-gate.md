# Gate de pinyin — derivado vs hardcodeado (chineseName + trigramas)
**Código:** `20260623-GATE-DAT-FID-06 pinyin-gold-gate` · **Familia:** DAT-FID · **Estado:** closed


- **Fecha:** 2026-06-23
- **Estado:** ✅ Cerrada — gate nuevo en verde (72/72)

---

## 1. Origen

Durante la revisión del fix de `20260623-FIX-LIB-02-library-title-fidelity.md`
se preguntó si `chineseName`/`pinyin`/trigramas podían tener el mismo problema que
tuvo `name` (campo compartido entre traductores, fuente sin auditar). Investigación:

1. **`chineseName`** (`build-hexagrams.mjs` → `base.chineseName` ← `w.trad_chinese`
   en `scripts/iching_wilhelm_translation.mjs`) — comparado byte a byte contra
   `scripts/iching_zhouyi_translation.mjs` (ctext.org, 64/64 fuente trazable):
   **0/64 discrepancias**. Ya documentado como `crossCheck` en
   `scripts/sync-wilhelm-hex-chinese-gold.mjs`. Sin acción requerida.
2. **`upperTrigram`/`lowerTrigram`** — el string crudo de Wilhelm (`"CH'IEN"`,
   `"THE CREATIVE"`) nunca se renderiza al usuario; solo se usa como clave interna
   (`trigramIdFromWilhelmLabel` en `apps/web/src/lib/library/trigram-meta.ts`) para
   resolver el glifo+pinyin neutral de la tabla de los 8 trigramas, idéntica en las
   tres pestañas. Sin contaminación cruzada W→L. Las etiquetas Wade-Giles en sí ya
   tienen gate contra un mirror académico externo (Parma,
   `tools/audit-wilhelm-trigram-parma.mjs` → `npm run audit:wilhelm-trigram-parma`).
3. **`pinyin`** (64 nombres de hexagrama + 8 trigramas) — **sin ningún cross-check
   previo**. Provenance documentada en `sync-wilhelm-hex-chinese-gold.mjs` no lista
   `crossCheck` para este campo, a diferencia de `chinese`. Gap real, cerrado por
   este documento.

---

## 2. Gate nuevo

`scripts/verify-pinyin-gold.mjs` (`npm run verify:pinyin-gold`):

- Deriva el pinyin esperado desde el hanzi con `pinyin-pro` (nueva devDependency,
  sin dependencias propias, sin llamadas de red — diccionario local).
- Compara contra el valor hardcodeado en:
  - `scripts/iching_wilhelm_translation.mjs` (64 hexagramas, campo `pinyin`)
  - `apps/web/src/lib/library/trigram-meta.ts` (8 trigramas, campo `pinyin`)
- Acepta **cualquier lectura reconocida por el diccionario** (`multiple: true`),
  no solo la lectura por defecto — necesario porque varios caracteres son
  heterónimos (多音字) y el I Ching usa deliberadamente la lectura clásica/menos
  común en algunos nombres.

## 3. Resultado de la primera corrida

72/72 checks (64 hexagramas + 8 trigramas). Primera pasada con matching estricto
(solo lectura por defecto) arrojó 4 "fallos" que resultaron ser falsos positivos
del propio método, no errores de dato:

| Hex | Hanzi | Hardcodeado | Lectura "default" del derivador | Lecturas válidas (diccionario) |
|---|---|---|---|---|
| 3 | 屯 | `zhūn` | `tún` | `tún`, `zhūn` |
| 12 | 否 | `pǐ` | `fǒu` | `fǒu`, `pǐ` |
| 23 | 剝 | `bō` | `bāo` | `bāo`, `bō` |
| 40 | 解 | `xiè` | `jiě` | `jiě`, `jiè`, `xiè` |

En los 4 casos el valor hardcodeado es una lectura clásica/especializada
correcta para el nombre del hexagrama (no la lectura moderna más frecuente),
confirmada como variante reconocida por el diccionario. Se ajustó el gate para
aceptar cualquier lectura válida — **no se modificó ningún dato**, los 4 valores
ya eran correctos.

Tras el ajuste: **72/72 PASS**, sin discrepancias reales en ningún campo.

---

## 4. Cambios

- `package.json` — nueva devDependency `pinyin-pro` (sin dependencias propias,
  0 vulnerabilidades nuevas vía `npm audit`); nuevo script `verify:pinyin-gold`.
- `scripts/verify-pinyin-gold.mjs` — nuevo gate.
- `scripts/build-hexagrams.mjs` — comentario de cabecera corregido: ya no dice
  que `name` viene de la transcripción de Wilhelm para los tres traductores
  (quedó desactualizado tras `20260623-FIX-LIB-02-library-title-fidelity.md`);
  ahora documenta que `name` se construye por traductor y enlaza los dos gates
  de `chineseName`/`pinyin`.

## 5. Conclusión

No había contaminación cruzada de datos entre traductores en `chineseName` ni en
trigramas — ambos ya estaban, directa o indirectamente, verificados o aislados
del contenido específico de traductor. El único gap real era `pinyin` sin
cross-check; ahora tiene un gate permanente y reproducible (`npm run
verify:pinyin-gold`) en vez de depender de un valor tecleado a mano sin
trazabilidad.

---

## 6. Seguimiento (mismo día) — fuente única real para los 8 trigramas

El §1.2 dejaba `trigram-meta.ts` como una tabla hardcodeada independiente,
sincronizada con el gate del §2 pero no derivada de una única fuente. Se cerró
esa brecha:

- **`scripts/build-trigrams.mjs`** (nuevo) — única pieza hand-maintained: los 8
  pares `{id, chinese, wilhelmLabel}` (constantes clásicas fijas). El `pinyin`
  ya **no se tipea a mano en ningún lugar** — se deriva con `pinyin-pro` en
  build time y se escribe en
  `packages/iching-data/src/generated/trigrams.json`.
- **`packages/iching-data/src/trigram-schema.ts` + `trigrams.ts`** — esquema Zod
  + accessor `getAllTrigrams()`, exportado desde `index.ts`, mismo patrón que
  `commentary.ts`.
- **`packages/iching-data/package.json`** → `build:data` ahora corre también
  `build-trigrams.mjs`.
- **`apps/web/src/lib/library/trigram-meta.ts`** — ya no contiene el array
  hardcodeado; importa `getAllTrigrams()` de `@iching-oracle/iching-data` y
  conserva solo las funciones de lookup de UI (`getTrigramById`,
  `trigramIdFromWilhelmLabel`, etc.), sin cambios de comportamiento.
- **`scripts/verify-pinyin-gold.mjs`** — el check de trigramas ahora lee
  `trigrams.json` generado (regresión: detectaría un bug en
  `build-trigrams.mjs`, no una auditoría de hardcode — ya no hay hardcode que
  auditar ahí).

Verificación corrida: `iching-data` build limpio, `vitest run` 25/25 sin
cambios, `verify:pinyin-gold` 72/72, `tsc --noEmit` en `apps/web` 0 errores,
`eslint` en el archivo tocado 0 errores.

Resultado: para los 8 trigramas, el pinyin pasó de "hardcodeado + gate de
verificación" a "nunca hardcodeado, siempre derivado" — una sola fuente real
(el hanzi) que se expande automáticamente al único consumidor (la Biblioteca)
en cada `build:data`.
