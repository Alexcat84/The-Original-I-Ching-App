# Mapa de Mutaciones (Mutation Explorer) — Plan de implementación
**Código:** `20260628-PLAN-MUT-06 mutation-explorer` · **Familia:** MUT · **Estado:** open

- **Fecha:** 2026-06-28
- **Rama:** `feature/mutation-explorer`
- **Objetivo de producto:** permitir al usuario **verificar** que la lectura recibida en una consulta se basó estrictamente en las reglas preestablecidas (Huang o Zhu Xi), mostrando la regla aplicada y los textos oráculo exactos por traductor (Wilhelm, Legge, Zhou Yi).
- **Relacionado:** [`20260620-AUD-LRS-01-zhuxi-line-reading-selector.md`](./20260620-AUD-LRS-01-zhuxi-line-reading-selector.md), [`20260619-AUD-MUT-03-huang-rules-alignment.md`](./20260619-AUD-MUT-03-huang-rules-alignment.md), [`20260622-AUD-MUT-04-mutation-rules-pdf-gold.md`](./20260622-AUD-MUT-04-mutation-rules-pdf-gold.md), Biblioteca [`20260623-PLAN-LIB-01-library-commentary-layer.md`](./20260623-PLAN-LIB-01-library-commentary-layer.md)
- **Alcance inicial:** vista web dedicada (`/mutation-explorer`) + enlace desde resumen de consulta; datos locales `@iching-oracle/iching-data` (sin Supabase para textos); i18n 11 idiomas vía `@iching-oracle/i18n`.

---

## 1. Problema y oportunidad

### 1.1 Lo que el usuario ve hoy

Durante la animación ritual (`ritual-line-slot`, barras en `globals.css`) el usuario **sí** ve qué líneas mutan (resaltadas en dorado). Al terminar, el resumen del hilo (`ConsultationRecordCard`) muestra:

- Hexagrama primario y transformado (número + hanzi)
- Etiqueta corta de regla (`getIchingMutationRuleLabel`, p. ej. «Cuatro líneas: ambas estables, prima la inferior»)
- Traductor y sistema de lectura (Huang / Zhu Xi)

**No muestra:** qué línea(s) concretas gobiernan la lectura, de qué hexagrama provienen (primario vs transformado), ni el texto oráculo verbatim que el motor entregó a la IA.

### 1.2 Lo que proponemos

Un **laboratorio de mutaciones** separado del chat inmersivo:

| Entrada (usuario) | Salida (sistema) |
|-------------------|------------------|
| Hexagrama inicial (toque visual 1–64) | Líneas mutantes derivadas matemáticamente |
| Hexagrama final (toque visual 1–64) | Regla Huang o Zhu Xi + explicación textual i18n |
| Sistema de lectura: Huang \| Zhu Xi | Pestañas Wilhelm \| Legge \| Zhou Yi con textos del JSON local |

**Caso canónico de validación:** Hex **9** (Xiao Chu / 小畜) → Hex **54** (Gui Mei / 歸妹), regla **Zhu Xi**, 4 líneas mutantes (posiciones **3, 4, 5, 6**); estables **1 y 2**.

Verificado contra motor en vivo (2026-06-28):

| Sistema | Regla | Textos seleccionados (Wilhelm) |
|---------|-------|--------------------------------|
| **Zhu Xi** | `ZX_FOUR_LOWER` | Línea **1** del **54** (primaria) + Línea **2** del **54** (secundaria) |
| **Huang** | `FOUR_LOWEST_STABLE` | Línea **2** del **54** (transformado; estable superior) |

> **Corrección respecto al borrador externo:** Huang con 4 mutaciones lee la línea estable **superior** del hexagrama **transformado**, no la línea 2 del hexagrama primario (9). El motor en `packages/iching-engine/src/engine.ts` (`FOUR_LOWEST_STABLE`) y la auditoría [`20260619-AUD-MUT-03`](./20260619-AUD-MUT-03-huang-rules-alignment.md) son la fuente de verdad.

---

## 2. Análisis comparativo contra el código existente

### 2.1 Activos reutilizables (no reinventar)

| Capa | Ubicación | Reutilización |
|------|-----------|---------------|
| **Motor de reglas Huang** | `packages/iching-engine/src/engine.ts` → `determineMutationRule`, `selectTextsForClaude(..., system: "huang")` | Llamada directa; ya probada (`engine.mutation-rules.test.ts`, `engine.line-reading-systems.test.ts`) |
| **Motor Zhu Xi** | `packages/iching-engine/src/rules/zhuxi.ts` | `determineMutationRuleZhuXi`, `selectTextsZhuXi` |
| **Datasets W/L/Z** | `packages/iching-data/src/generated/hexagrams.{wilhelm,legge,zhouyi}.json` | Misma fuente que consultas, biblioteca y PDF; **514 campos** verificados book-primary |
| **API de datos** | `getHexagramRecordByNumber`, `getHexagramRecordByBinaryTopFirst` | Lookup por número y patrón binario |
| **Etiquetas de regla (11 idiomas)** | `packages/i18n/src/messages/iching-mutation-ui.ts` → `getIchingMutationRuleLabel` | Etiqueta corta ya traducida (`ZX_FOUR_LOWER`, `FOUR_LOWEST_STABLE`, etc.) |
| **Pestañas traductor** | `apps/web/src/components/library/HexagramTabs.tsx` | Patrón UI probado (tablist accesible, 3 traductores) |
| **Índice hexagramas** | `getLibrarySummaries()` + `LibraryIndex.tsx` | Grid 64 hexagramas con glifo, hanzi, pinyin, nombre EN |
| **Lista estática** | `apps/web/src/app/notes/hexagram-list.ts` | Metadatos King Wen sin tier |
| **Diff binario mutaciones** | `library-data.ts` → `buildMutations()` | Lógica flip bit por posición (1 = inferior) |
| **Barras visuales** | Ritual CSS (`.ritual-hex-line`) + overlay sumi | Reutilizar estilos; no cargar pipeline PNG completo |

### 2.2 Brechas (hay que construir)

| Brecha | Detalle |
|--------|---------|
| **Derivar líneas mutantes solo desde par de hexagramas** | No existe función pública. Hoy el motor parte de `Line[]` con valores 6/7/8/9. Hay que añadir `deriveChangingLinesFromHexPair(primaryNum, transformedNum)` comparando `binaryTopFirst` (Wilhelm canónico estructural). |
| **Reconstruir `Line[]` sintético** | Para `determineMutationRule` (Huang, caso 2 líneas) se necesitan tipos yin/yang de las mutantes. Ver §3.2. |
| **Explicación detallada i18n** | `ruleExplanation` en el motor está en **español hardcodeado** (prompt IA). La UI del explorer necesita claves i18n nuevas con walkthrough (posiciones, hex origen, primaria/secundaria). |
| **Vista dedicada** | No hay ruta `/mutation-explorer` ni módulo i18n `mutation-explorer-ui.ts`. |
| **Puente desde consulta** | `ConsultationRecordCard` no enlaza al explorer con query params pre-rellenados. |
| **Casos multi-texto Zhu Xi** | 2 líneas (ambas), 3 líneas (juicios, no líneas), 4 líneas (ambas estables): la UI debe renderizar **múltiples bloques**, no una sola línea. |

### 2.3 Lo que NO usaremos

- **Supabase** para textos oráculo (correcto: bundles locales empaquetados).
- **`master_combined`** como pestaña: el explorer muestra **3 traductores en paralelo** (W, L, Z), alineado con la biblioteca. Master sigue siendo modo de consulta/IA, no un cuarto dataset distinto.
- **Reimplementar reglas** en la UI: toda lógica pasa por `@iching-oracle/iching-engine`.

---

## 3. Decisiones de diseño críticas

### 3.1 Derivación matemática hex inicial → hex final

Algoritmo propuesto (nuevo en `iching-engine` o `packages/iching-engine/src/mutation-explore.ts`):

```typescript
function deriveChangingLinesFromHexPair(
  primaryNumber: number,
  transformedNumber: number,
): { changingLines: number[]; stableLines: number[] } {
  const primary = getHexagramRecordByNumber(primaryNumber, { translator: "wilhelm" });
  const transformed = getHexagramRecordByNumber(transformedNumber, { translator: "wilhelm" });
  const changing: number[] = [];
  for (let position = 1; position <= 6; position++) {
    const idx = 6 - position; // binaryTopFirst: line 6 first
    if (primary.binaryTopFirst[idx] !== transformed.binaryTopFirst[idx]) {
      changing.push(position);
    }
  }
  const stable = [1, 2, 3, 4, 5, 6].filter((p) => !changing.includes(p));
  return { changingLines: changing, stableLines: stable };
}
```

Validaciones UX:

- Si `primaryNumber === transformedNumber` → 0 mutaciones (`NO_CHANGING` / `ZX_ZERO`).
- Si el par no es alcanzable en **exactamente** un paso de flips independientes (distancia Hamming > 6 o imposible) → error amigable i18n («Este par no corresponde a una sola tirada con líneas mutantes»).
- Cualquier par con distancia 1–6 es válido (siempre existe al menos una configuración de viejos yin/yang).

### 3.2 Unicidad de la tirada (corrección 2026-06-28)

**Hallazgo verificado en motor:** para cualquier par válido (hex primario P, hex transformado T), existe **exactamente una** configuración de valores 6/7/8/9 compatible. Barrido 64×64 → **0 pares con más de una configuración**.

Ejemplo **9 → 54**:

- Máscara de mutación `60` (bits líneas 3–6)
- Valores únicos: `[7, 7, 9, 6, 9, 9]` (posiciones 1–6)
- Regla Huang y Zhu Xi **deterministas** a partir del par

La aparente ambigüedad Huang (`TWO_YIN_YANG` vs `TWO_SAME_LOWER` con 2 mutaciones) **se resuelve** porque el binario del hex primario fija si cada línea mutante era yin viejo (6) o yang viejo (9). No hace falta que el usuario ingrese tipos de línea manualmente.

**Conclusión:** hex inicial + hex final (+ sistema Huang/Zhu Xi) **sí identifica la tirada de forma única**. El problema real es de **UX**: el resumen no muestra esa información de forma explícita.

### 3.3 Índice de tiradas (`castIndex`) — un solo código

**Decisión cerrada (2026-06-28):** un **único identificador** por condición estructural entre las 4096 posibilidades. No doble codificación en el resumen (no combinar `castIndex` + firma hex/máscara + otro código).

#### Definición

| Campo | Rango | Significado |
|-------|-------|-------------|
| `primary` | 1–64 | Hexagrama primario (King Wen) |
| `mask` | 0–63 | 6 bits: bit `(pos−1)` = 1 si la línea `pos` muta (1 = inferior) |
| **`castIndex`** | **1–4096** | **`(primary − 1) × 64 + mask + 1`** — código visible e ingresable por el usuario (**sin 0**, evita confusión) |

Decodificación: `n = castIndex − 1` → `primary = floor(n / 64) + 1`, `mask = n % 64`.

Ejemplo **9 → 54** (mutan líneas 3, 4, 5, 6):

- `mask = 60`, **`castIndex = 573`**
- `changingLines = [3, 4, 5, 6]`

#### Dataset = motor índice (sin duplicar textos)

Nuevo artefacto: `packages/iching-data/src/generated/cast-catalog.json`

- **4096 filas** (incluye **64 casos sin mutación**, `mask = 0`; índice usuario **1–4096**)
- Cada fila vincula el caso a reglas y **referencias** a textos en los JSON W/L/Z existentes
- **Dos columnas lógicas por fila:** resolución **Huang** y **Zhu Xi** (mismo `castIndex`, no dos códigos)
- **No copia** juicios, imágenes ni líneas; solo `hex`, `position`, `kind` (line \| judgment \| image \| yong), `emphasis`

Generador: `scripts/generate-cast-catalog.mjs` · Gate: `verify:cast-catalog` (paridad 1:1 con motor).

#### Qué NO incluye el `castIndex`

- Sistema de lectura activo en la consulta → query param o estado UI al verificar
- Traductor → pestañas del explorer leen `@iching-oracle/iching-data`

### 3.4 Resumen de tirada — qué agregar (sin alterar lo existente)

**Regla:** los campos y filas que ya muestra `ConsultationRecordCard` **no se modifican** (copy, orden, etiquetas i18n, ni formato). Solo se **insertan filas nuevas** donde corresponda.

**Ya existente — intacto:**

| Fila actual | Ejemplo (captura real) |
|-------------|-------------------------|
| Título panel | IDENTIFICADOR DE TIRADA |
| Código consulta | 1B18·E563 |
| Trazado recibido | #9 小畜 → #54 歸妹 |
| Regla de lectura | Cuatro líneas: ambas estables, prima la inferior |
| Traductor | Zhou Yi *(fila propia)* |
| Lectura de líneas | Zhu Xi *(fila propia, distinta de Traductor)* |
| En este hilo | Tirada 2 · 28 jun 2026 |
| Pregunta asociada | (texto pregunta) |

**Solo agregar:**

| Campo nuevo | Ejemplo (9→54) | Fuente |
|-------------|----------------|--------|
| **Código de verificación** | `573` | `castIndex` (1–4096) al persistir |
| **Líneas mutantes** | `3, 4, 5, 6` (o copy i18n «Ninguna» si `[]`) | `changingLines` en DB |
| **CTA** (opcional fila o botón) | «Verificar reglas →» | link `/mutation-explorer?id=573&system=zhuxi` |

Ubicación sugerida de las filas nuevas: **después de «Regla de lectura»** y **antes de «Traductor»**, para que el flujo sea trazado → regla → detalle mutación → metadatos existentes. Sin reordenar ni fusionar filas actuales.

El usuario **no ingresa líneas manualmente**. `changingLines` ya se persiste; solo pasa a ser **visible** en el resumen.

### 3.5 Zhu Xi con 3 líneas mutantes

Regla `ZX_THREE_JUDGMENTS`: **no hay texto de línea**; se leen **Juicios** de primario y transformado con énfasis según presencia de línea 1 entre las mutantes (`judgmentEmphasis` en `TextsForClaude`).

La UI del explorer debe:

1. Mostrar regla i18n explicando ausencia de línea individual.
2. En pestañas W/L/Z, renderizar bloques **Juicio primario** + **Juicio transformado** con badge «primario» / «secundario».

### 3.6 Acceso (tier)

| Opción | Descripción |
|--------|-------------|
| **Seeker+** (como Biblioteca) | Coherente con «herramienta de estudio» premium; reutiliza `LibraryAccessGate` / `/api/library/access`. |
| **Autenticado free** | Credibilidad para trial; costo marginal cero (JSON local). |
| **Público sin auth** | Máxima transparencia; metadatos ya son dominio público. |

**Recomendación pendiente de producto:** **Seeker+** para paridad con Biblioteca, **excepto** deep link «Verificar esta lectura» desde un hilo propio (free con tokens ya consumidos puede verificar **su** consulta).

### 3.7 Ubicación en navegación y panel Opciones

- Ruta explorer: **`/mutation-explorer`**
- **Panel Opciones:** **solo** ampliar el bloque Biblioteca existente (`page.tsx` → `home-chrome-ui.ts`). Tokens, Seguridad y Zona de peligro **sin cambios**.
  - Título sección: p. ej. **«Estudio»** o **«Biblioteca y verificación»** (i18n 11 idiomas)
  - Descripción breve: textos clásicos + comprobar reglas de mutación
  - **Dos botones** en el mismo `composer-panel-actions` que hoy:
    - «Ir a la biblioteca» → `/library` (existente)
    - «Verificador de reglas» → `/mutation-explorer` (modo manual)
  - Mismo gate Seeker+ que biblioteca (salvo decisión tier §3.6)
- Modo A (desde consulta): enlace «Verificar reglas» en `ConsultationRecordCard`, no en este bloque
- Query params: `?cid=…` · `?id=573` · estado hex/toggles en manual

---

## 4. Arquitectura propuesta

```mermaid
flowchart TB
  subgraph inputs [Entradas UI]
    H1[Hex inicial 1-64]
    H2[Hex final 1-64]
    SYS[Huang / Zhu Xi]
  end

  subgraph engine [iching-engine]
    DERIVE[deriveChangingLinesFromHexPair]
    BUILD[buildSyntheticLines]
    RULE[determineMutationRule / ZhuXi]
    SELECT[selectTextsForClaude]
  end

  subgraph data [iching-data JSON local]
    W[wilhelm.json]
    L[legge.json]
    Z[zhouyi.json]
  end

  subgraph ui [apps/web]
    PAGE[/mutation-explorer]
    TABS[HexagramTabs pattern]
    I18N[mutation-explorer-ui.ts]
  end

  H1 --> DERIVE
  H2 --> DERIVE
  DERIVE --> BUILD
  BUILD --> RULE
  SYS --> SELECT
  RULE --> SELECT
  SELECT --> PAGE
  W --> TABS
  L --> TABS
  Z --> TABS
  I18N --> PAGE
```

### 4.1 Nuevo módulo motor (propuesta)

**Archivo:** `packages/iching-engine/src/mutation-explore.ts`

```typescript
export type MutationExploreInput = {
  primaryNumber: number;
  transformedNumber: number;
  lineReadingSystem: LineReadingSystem;
  /** When linking from a stored consultation — disambiguates Huang TWO_* */
  lines?: Line[];
};

export type MutationExploreResult = {
  changingLines: number[];
  stableLines: number[];
  mutationRule: AnyMutationRule;
  ruleLabelKey: IchingMutationRuleId; // for getIchingMutationRuleLabel
  textsByTranslator: Record<TranslatorId, TextsForClaude>;
  /** Structured selections for UI (hex number, line position, emphasis, kind: line|judgment|yong) */
  selections: MutationTextSelection[];
  huangTwoLineAmbiguous?: boolean;
};
```

Función principal: `exploreMutation(input): MutationExploreResult`

- Si `input.lines` presente → usar líneas reales (paridad 100% con consulta).
- Si no → sintetizar líneas (p. ej. mutantes = 6 o 9 alternando, estables = 7/8 según binario primario) y marcar `huangTwoLineAmbiguous` cuando `changing.length === 2`.

### 4.2 Capa web

| Archivo | Responsabilidad |
|---------|-----------------|
| `apps/web/src/app/mutation-explorer/page.tsx` | Página RSC + client island |
| `apps/web/src/components/mutation-explorer/MutationExplorer.tsx` | Estado, selectores, resultados |
| `apps/web/src/components/mutation-explorer/HexagramPairPicker.tsx` | Dos pickers + modal/grid 64 |
| `apps/web/src/components/mutation-explorer/MutationResultPanel.tsx` | Regla + diagrama líneas + tabs |
| `apps/web/src/components/mutation-explorer/InteractiveHexDiagram.tsx` | 6 barras tocables; toggle mutante (estilos ritual); recalcula transformado |
| `apps/web/src/components/mutation-explorer/ChangingLinesDiagram.tsx` | 6 barras solo lectura (modo A + panel resultados) |
| `apps/web/src/lib/mutation-explorer/explore-mutation.ts` | Thin wrapper server-safe sobre iching-engine |

### 4.3 i18n (11 idiomas)

**Nuevo módulo:** `packages/i18n/src/messages/mutation-explorer-ui.ts`

Contenido mínimo (EN fuente de verdad → 10 locales):

- Título, subtítulo, meta description
- Labels: hex primario, hex transformado, sistema de lectura
- Botones: abrir selector, intercambiar, limpiar
- Secciones: regla aplicada, líneas mutantes, líneas estables, textos oráculo
- Pestañas: reutilizar labels de `library-page-ui.ts` si existen (`wilhelmTab`, etc.)
- Badges: primaria, secundaria, juicio primario, juicio transformado, 用九/用六
- Errores: par inválido, ambigüedad Huang 2 líneas
- CTA desde consulta: «Verificar reglas de esta lectura»
- Claves de explicación extendida por regla (opcional Fase 2): `explainer_ZX_FOUR_LOWER`, etc.

Export en `packages/i18n/src/index.ts`: `getMutationExplorerUiMessages(locale)`.

**Nota:** `getIchingMutationRuleLabel` cubre el **nombre corto** de regla; las explicaciones largas (walkthrough posicional) van en claves nuevas parametrizadas (`{count}`, `{positions}`, `{primaryLine}`, `{hexNumber}`).

---

## 5. Experiencia de usuario — dos modos

### 5.1 Modo A — Verificación desde tu consulta (automático)

**Entrada:** clic «Verificar reglas →» en `ConsultationRecordCard`.

- URL: `/mutation-explorer?cid={consultationId}`
- **Sin formulario:** datos desde DB (`lines`, `changing_lines`, hex, regla, sistema).
- Diagrama de 6 barras **solo lectura** (mutantes resaltadas como en el ritual).
- Banner: «Tu tirada · Ref 1B18·E563 · {fecha}».
- Sistema Huang/Zhu Xi **prefilled** desde la consulta (editable solo para comparar el otro sistema).

**No aplica** selección manual de líneas: la tirada ya está fijada.

### 5.2 Modo B — Verificador manual (exploración)

**Entrada:** nav «Verificador de reglas» → `/mutation-explorer`.

Tres caminos equivalentes al mismo `castIndex` (1–4096):

| Camino | Input | Uso |
|--------|-------|-----|
| **B1 — Código** | Número 1–4096 + Huang/Zhu Xi | Atajo si anotó el código del resumen |
| **B2 — Hexágonos** | Primario + transformado + Huang/Zhu Xi | Quien piensa en par 9→54 |
| **B3 — Hexagrama interactivo** | Primario + **toggle de líneas** + Huang/Zhu Xi | Purista que piensa en «qué líneas mutan» |

#### B3 — Diagrama interactivo (decisión UX)

Componente central: **`InteractiveHexDiagram`** (reutilizar estilos ritual: `.ritual-hex-line`, mutante dorado/ámbar).

1. Usuario elige **hexagrama primario** (picker 1–64).
2. Se dibujan las **6 barras** (yin/yang del primario).
3. Usuario **toca cada línea** para alternar estable ↔ mutante (interruptor visual; línea mutante resaltada).
4. El **hexagrama transformado se recalcula en vivo** al cambiar toggles (flip bit por línea).
5. Debajo: código de verificación, lista «Mutan: …», Huang/Zhu Xi, [Verificar].

**Sincronización bidireccional (evitar ambigüedad en UI):**

- Si el usuario elige **también** hex transformado desde picker → los toggles **se actualizan** para reflejar el diff (o se muestra error si intenta combinar incompatible).
- Si cambia toggles → el picker de transformado **se actualiza** automáticamente.
- Una sola fuente de verdad en runtime: `(primary, mask)` → `castIndex`; la UI solo ofrece dos formas de editar el mismo `mask`.

**Accesibilidad:** cada línea es botón con `aria-pressed`; etiqueta «Línea N, mutante / estable».

#### Flujo manual unificado (resultado)

Tras Verificar (cualquier camino B1–B3):

- Diagrama resumen (mutantes resaltadas)
- Código de verificación + líneas mutantes
- Card regla (Huang o Zhu Xi elegido)
- Pestañas Wilhelm | Legge | Zhou Yi
- Enlace «Ver regla bajo [otro sistema]» (mismo `castIndex`)

### 5.3 Caso canónico 9 → 54 (copy de validación)

**Entrada:** Primario 9, Transformado 54, Zhu Xi.

**Salida esperada:**

- Regla: `ZX_FOUR_LOWER` → «Cuatro líneas: ambas estables, prima la inferior»
- Zhu Xi lee líneas **estables del transformado (54)**: pos 1 (primaria), pos 2 (secundaria)
- Pestaña Wilhelm — Línea 1 del 54: texto verbatim del bundle
- Pestaña Wilhelm — Línea 2 del 54: texto secundario

**Alternar a Huang:** regla `FOUR_LOWEST_STABLE` → solo Línea **2** del **54**.

---

## 6. Plan de implementación por fases

### Fase 0 — Documentación y rama ✅

- [x] Rama `feature/mutation-explorer`
- [x] Este plan (`20260628-PLAN-MUT-06`)
- [x] Verificación unicidad par hex (0 ambigüedades)

### Fase 0b — Resumen enriquecido (prioridad UX)

| Tarea | Archivo |
|-------|---------|
| Calcular `castIndex` al persistir consulta | `session-store.ts`, `/api/consult` |
| Mostrar **índice** + **líneas mutantes** | `ConsultationRecordCard.tsx` |
| i18n labels (`verificationCode`, `changingLinesLabel`) | `consultation-record-ui.ts` |
| Link «Verificar reglas» | `ConsultationRecordCard.tsx` |

**Sin esperar al explorer completo** — cierra la brecha de credibilidad visible.

### Fase 1 — Motor + catálogo + tests

| Tarea | Archivo |
|-------|---------|
| `deriveChangingLinesFromHexPair` | `mutation-explore.ts` |
| `buildSyntheticLinesFromHexPair` | idem |
| `exploreMutation` | idem |
| `encodeCastIndex` / `decodeCastIndex` | idem |
| Generador catálogo 4096 | `scripts/generate-cast-catalog.mjs` |
| JSON catálogo | `packages/iching-data/src/generated/cast-catalog.json` |
| Tests: 9→54 Zhu/Huang, 0 mut, 1 mut, 3 mut juicios, Qian/Kun 6 mut, 4096 parity | `mutation-explore.test.ts` |
| Export público | `packages/iching-engine/src/index.ts` |

**Gate:** `npm run test --workspace=@iching-oracle/iching-engine`

### Fase 2 — i18n

| Tarea | Archivo |
|-------|---------|
| Módulo UI 11 idiomas | `mutation-explorer-ui.ts` |
| Export | `packages/i18n/src/index.ts` |

**Gate:** `npm run i18n:audit` (si aplica a nuevo módulo)

### Fase 3 — UI web

| Tarea | Archivo |
|-------|---------|
| Página + layout doc shell | `app/mutation-explorer/page.tsx` |
| Componentes picker + resultados | `components/mutation-explorer/*` |
| Estilos (tokens existentes) | `globals.css` (bloque `.mutation-explorer-*`) |
| Nav link | `doc-nav-ui.ts` + shell links en guía/notas |

**Gate:** revisión visual claro/oscuro + mobile WebView

### Fase 4 — Puente consulta

| Tarea | Archivo |
|-------|---------|
| Link «Verificar reglas» | `ConsultationRecordCard.tsx` |
| Prefill query + hydration lines | `MutationExplorer.tsx` |
| Opcional: entrada en PDF export summary | `page.tsx` PDF builder |

### Fase 5 — Acceso y QA

| Tarea | Detalle |
|-------|---------|
| Gate tier | Decisión producto §3.4 |
| Test gate | `TS-ENG-004 mutation-explore` (propuesto) |
| Paridad consulta | Script smoke: N fixtures `qa:mutation-output` vs explorer |

### Fase 6 — Docs producto (post-validación staging)

- Entrada FAQ/guía (WF-DOC-01): «Cómo verificar las reglas de mutación»
- **No** incluir en `/audits` (no es fidelidad de dataset; es feature UX)

---

## 7. Rendimiento y offline

- Los 3 JSON ya se empaquetan con `@iching-oracle/iching-data`; el explorer **no añade peso** significativo.
- Cálculo O(1) por cambio de input; sin red excepto gate auth.
- APK offline: funciona en WebView **si** la ruta está en el bundle desplegado (requiere deploy web, no solo APK).

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Usuario confunde borrador externo (Huang lee hex 9) con motor real | Este plan + UI muestran hex **origen** explícito (`fromHexagram: primary \| transformed`) |
| Ambigüedad Huang 2 líneas en modo libre | Opción A §3.2 + copy honesto |
| `ruleExplanation` ES en motor | No reutilizar para UI; claves i18n dedicadas |
| Zhu Xi 3 líneas sin texto de línea | UI de juicios dual, tests dedicados |
| Scope creep (comentarios W/L, PDF, IA) | Fuera de alcance Fase 1; solo textos oráculo core |

---

## 9. Criterios de aceptación (definición de done)

1. Par 9→54 + Zhu Xi muestra regla `ZX_FOUR_LOWER` y textos L1+L2 del hex 54 en las 3 pestañas.
2. Mismo par + Huang muestra `FOUR_LOWEST_STABLE` y solo L2 del hex 54.
3. Deep link desde consulta real reproduce `mutationRule` y selección idénticos a `textsForClaude` del motor.
4. Toda cadena UI traducida en 11 idiomas.
5. Sin llamadas Supabase para textos.
6. Tests unitarios motor ≥ 20 casos incluyendo Qian/Kun y 3-mutación Zhu Xi.

---

## 10. Preguntas abiertas para revisión del producto

1. **Tier:** ¿Seeker+ global, free solo verificación de consulta propia, o público?
2. **Nombre UI:** «Mapa de Mutaciones» vs «Verificador de reglas».
3. **Master combined:** ¿Nota en explorer cuando la consulta usó master?
4. **Persistir `cast_index` en DB** vs derivar siempre en runtime desde `primary` + `changing_lines`.

**Cerradas:**

- ~~Ambigüedad hex par~~ → **No hay ambigüedad**; ver §3.2.
- ~~Usuario ingresa líneas~~ → **No**; índice + CTA desde consulta.
- ~~Doble codificación~~ → **Un solo código (1–4096)**.
- ~~Mostrar líneas mutantes~~ → **Sí**, en resumen junto al código.
- ~~4096 casos incl. sin mutación~~ → **Sí**; numeración usuario **1–4096** (nunca 0).
- ~~Etiqueta UI~~ → **«Código de verificación»** (EN: Verification code); ref consulta sigue siendo identificador único de la pregunta.
- ~~Orden en resumen~~ → Trazado → Código de verificación → Líneas mutantes → (resto intacto).
- ~~Modo manual B3~~ → Hexagrama interactivo con toggle de líneas mutantes (sync bidireccional con hex transformado); modo A sin edición manual.
- ~~Entrada panel Opciones~~ → Solo segundo botón junto a Biblioteca (Tokens/Seguridad intactos); modo A desde resumen de consulta.

---

## 11. Referencias de código

| Concepto | Ruta |
|----------|------|
| Reglas Huang | `packages/iching-engine/src/engine.ts` |
| Reglas Zhu Xi | `packages/iching-engine/src/rules/zhuxi.ts` |
| Labels regla i18n | `packages/i18n/src/messages/iching-mutation-ui.ts` |
| Datasets | `packages/iching-data/src/index.ts` |
| Resumen consulta | `apps/web/src/components/ConsultationRecordCard.tsx` |
| Tabs biblioteca | `apps/web/src/components/library/HexagramTabs.tsx` |
| Diff binario | `apps/web/src/lib/library/library-data.ts` → `buildMutations` |

---

**Próximo paso tras aprobación del plan:** Fase 1 (motor + tests), commit en `feature/mutation-explorer`, sin merge a `staging` hasta validación explícita.
