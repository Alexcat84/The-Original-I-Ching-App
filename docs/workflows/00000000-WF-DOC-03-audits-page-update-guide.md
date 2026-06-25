# Guía paso a paso: actualizar la página pública `/audits`
**Código:** `00000000-WF-DOC-03 audits-page-update-guide` · **Familia:** DOC · **Estado:** reference

Documento operativo para **cualquier cambio** en la página que ve el usuario en
[`https://theoriginaliching.com/audits`](https://theoriginaliching.com/audits) (y staging equivalente).

**No sustituye** la documentación de ingeniería en `docs/auditorias/*.md` ni los harnesses de
fidelidad (`verify:hexagram-fidelity`, `verify:wilhelm-all-gates`, etc.). Es la guía del **canal
público**: copy, estructura, patrones de título y gates de regresión.

**Complementa (no reemplaza):**

| Documento | Cuándo usarlo |
|-----------|----------------|
| [`00000000-WF-DOC-01-docs-content-update-guide.md`](./00000000-WF-DOC-01-docs-content-update-guide.md) | Reglas generales de copy, APA 7, higiene de puntuación, 11 locales |
| [`00000000-WF-I18N-01-i18n-guide.md`](./00000000-WF-I18N-01-i18n-guide.md) | Añadir un idioma nuevo al producto |
| [`../auditorias/20260625-PLAN-DOC-04-audits-timeline-ui.md`](../auditorias/20260625-PLAN-DOC-04-audits-timeline-ui.md) | Historial del rediseño timeline (referencia UX) |

---

## 1. Qué es `/audits` y qué no es

| Sí | No |
|----|-----|
| Registro **público** de verificaciones de fidelidad (fechas, fuente APA, método, estándar, resultado, estado) | Informe técnico con logs, diffs, comandos internos, IDs de fixtures |
| Cuatro **auditorías independientes** documentadas en secciones distintas | Una sola línea temporal que mezcle oráculo, métodos de tirada, comentarios y mutación |
| Títulos **autodescriptivos** sin referencias cruzadas («ver entrada anterior») | «Reconfirmación», «verificación final», «edición publicada» sueltos sin contexto |
| Citas APA 7 en `CITATIONS` (no traducidas) | Decir «PDF Pantheon» o «Sacred Books» como título de entrada |

El usuario expande cada fila con `+` y ve **exactamente 6 campos** (ver §4). El círculo de fecha en
el rail usa formato **`YYYY.MM.DD`** vía `formatAuditTimelineDateCompact(verificationDateIso)`.

---

## 2. Mapa de archivos (solo tocar lo necesario)

| Archivo | Rol | ¿Cuándo editarlo? |
|---------|-----|-------------------|
| [`packages/i18n/src/messages/audits-page-ui.ts`](../../packages/i18n/src/messages/audits-page-ui.ts) | **Fuente de verdad** del contenido (11 locales × bloques) | **Siempre** al añadir/cambiar una entrada |
| [`apps/web/src/app/audits/page.tsx`](../../apps/web/src/app/audits/page.tsx) | Render: secciones, `<details>`, 6 campos fijos | Solo si cambias categorías, campos UI o layout |
| [`apps/web/src/app/globals.css`](../../apps/web/src/app/globals.css) (`.audit-timeline*`) | Estilos rail, chip verde claro, árbol | Solo cambios visuales del timeline |
| [`scripts/verify-docs-remediation.mjs`](../../scripts/verify-docs-remediation.mjs) | Gate P2.3 (conteos, orden, campos) | Cuando cambie el **número** de entradas o la entrada **más reciente** |
| [`packages/i18n/src/index.ts`](../../packages/i18n/src/index.ts) | Re-export tipos/getters | Solo si añades tipos o funciones nuevas |

**Build obligatorio** tras editar i18n:

```bash
npm run build --workspace=@iching-oracle/i18n
```

---

## 3. Modelo de datos

### 3.1 Tres categorías (auditorías separadas)

```text
oracle-text          → Textos del oráculo (514 campos: juicio/imagen/6 líneas/用九用六)
divination-method    → Métodos de tirada I Ching (tres monedas y varas de milenrama, auto/manual)
library-commentary   → Comentarios académicos de biblioteca W/L (auditoría independiente del oráculo)
mutation-rule        → Reglas de reducción de líneas cambiantes (Huang / Zhu Xi)
```

**Regla crítica:** aunque Wilhelm/Legge compartan la **misma edición APA** en oráculo y comentarios,
son **auditorías distintas** con título, método, estándar comparado y fecha propios. No reutilizar
el título «verificación inicial» de oráculo para comentarios; no mezclar fechas solo porque la
auditoría interna cerró el día anterior.

Orden de secciones en pantalla (fijo en `page.tsx`):

1. `oracle-text`
2. `library-commentary`
3. `divination-method`
4. `mutation-rule`

Dentro de cada sección, las filas siguen el **timeline global** ordenado por
`verificationDateIso` descendente + `sortOrder` (§3.4).

### 3.2 Un bloque = `AuditSourceBlock`

Cada entrada del timeline es un objeto en `BLOCKS_EN`, `BLOCKS_ES`, … `BLOCKS_HI`:

| Campo | Obligatorio | UI | Notas |
|-------|-------------|-----|-------|
| `id` | Sí | No (clave interna) | Estable; ver §3.3 |
| `category` | Sí | Agrupa sección | Una de las tres categorías |
| `title` | Sí | **Headline** colapsado | Patrón §5 |
| `source` | Sí | Campo «Fuente» | Entrada de `CITATIONS` (APA 7) |
| `verificationDate` | Sí | Campo «Fecha de verificación» | **Formateada por locale** (texto libre) |
| `method` | Sí | Campo «Método» | Qué se ejecutó; nombre del npm script si aplica |
| `standardCompared` | Sí | Campo «Estándar comparado» | Qué campos/casos entraron |
| `result` | Sí | Campo «Resultado» | Cifra verificable (514/514, 9/9, etc.) |
| `statusKind` | Sí | Color del círculo fecha | `current` \| `superseded` \| `permanent` |
| `statusLabel` | Sí | Campo «Estado» (parte 1) | Traducido: vigentes → «Vigente a la fecha» (o equivalente locale); obsoletos → «Obsoleto» |
| `currentStatusNote` | Sí | Campo «Estado» (parte 2) | Traducido; sin referencias a otras entradas ni auditorías futuras |

Validación en runtime al construir el timeline: `assertCompleteVerificationBlock()` lanza si falta
algún string o si `source` no es una entrada canónica de `CITATIONS`.

### 3.3 Convención de `id`

Formato recomendado:

```text
{traductor-o-dominio}-{tipo-fuente}-{YYYY-MM-DD}
```

Ejemplos vigentes:

| id | Categoría |
|----|-----------|
| `wilhelm-parma-initial-2026-06-21` | oracle-text (superseded) |
| `wilhelm-pantheon-pdf-2026-06-22` | oracle-text (current) |
| `legge-sacred-texts-initial-2026-06-21` | oracle-text (superseded) |
| `legge-oxford-pdf-2026-06-22` | oracle-text (current) |
| `zhouyi-ctext-initial-2026-06-21` | oracle-text (superseded) |
| `zhouyi-ctext-2026-06-21` | oracle-text (current) |
| `wilhelm-commentary-txt-maestro-2026-06-23` | library-commentary |
| `legge-commentary-txt-maestro-2026-06-23` | library-commentary |
| `huang-mutation-pdf-2026-06-22` | mutation-rule |
| `zhuxi-adler-mutation-pdf-2026-06-22` | mutation-rule |
| `coins-math-initial-2026-05-19` | divination-method (superseded) |
| `yarrow-math-initial-2026-05-19` | divination-method (superseded) |
| `wilhelm-appendix-coins-2026-06-25` | divination-method (current) |
| `wilhelm-appendix-yarrow-2026-06-25` | divination-method (current) |

**Nunca reutilizar un `id`** para otro alcance. Si la auditoría cambia de forma sustancial, crea
entrada nueva y marca la anterior `superseded` (oráculo) o deja histórico según §5.

### 3.4 `TIMELINE_META` (orden del rail)

Cada `id` debe tener entrada en `TIMELINE_META`:

```typescript
const TIMELINE_META: Record<string, { verificationDateIso: string; sortOrder: number }> = {
  "wilhelm-commentary-txt-maestro-2026-06-23": { verificationDateIso: "2026-06-24", sortOrder: 0 },
  // ...
};
```

| Campo | Uso |
|-------|-----|
| `verificationDateIso` | `YYYY-MM-DD` → círculo **`YYYY.MM.DD`** en el rail |
| `sortOrder` | Desempate **mismo día** (menor = más arriba tras sort descendente por fecha) |

`verificationDate` en el bloque (texto locale) puede redactarse distinto («23 jun 2026», «2026年6月23日»)
pero debe **corresponder al mismo día** que `verificationDateIso`.

Orden final: `buildTimeline()` sort `(fecha desc, sortOrder asc)`.

### 3.5 `CITATIONS` (APA 7 compartidas)

Definidas una sola vez; **no traducir** autor/título editorial. Solo el prose alrededor va en cada
locale.

| Clave | Uso típico |
|-------|------------|
| `wilhelmParma` | Oráculo W — verificación inicial (mirror web) |
| `wilhelmPantheon` | Oráculo W EPUB + comentarios biblioteca W |
| `leggeSacredTexts` | Oráculo L — verificación inicial (sacred-texts) |
| `leggeOxford` | Oráculo L EPUB + comentarios biblioteca L |
| `zhouyiCtext` | Zhou Yi (ctext.org) |
| `huang` | Reglas mutación Huang |
| `zhuxiAdler` | Reglas mutación Zhu Xi (Adler) |

Para añadir una fuente nueva: extiende `CITATIONS`, actualiza `CANONICAL_CITATIONS` implícitamente
(vía `Object.values`), y usa la misma clave en los 11 bloques.

Render UI: `{citation}<em>{title}</em>{rest}`.

### 3.6 `statusKind` y color del círculo

| Valor | Círculo | Cuándo |
|-------|---------|--------|
| `current` | Verde activo (`--audit-timeline-date-active`) | Fuente vigente en producción para ese alcance |
| `superseded` | Apagado (`--muted`) | Sustituida por otra entrada (p. ej. cambio de fuente web → EPUB) |
| `permanent` | Verde activo | Reservado; hoy no hay entradas `permanent` en el catálogo |

---

## 4. Los 6 campos que ve el usuario (fijos)

Implementados en `buildTimelineFields()` — **no añadir un séptimo campo** sin acuerdo de producto
y actualizar esta guía + gate.

1. Fecha de verificación (`blockVerificationDateLabel`)
2. Fuente (`blockSourceLabel`) — APA con título en cursiva
3. Método (`blockMethodLabel`)
4. Estándar comparado (`blockStandardLabel`)
5. Resultado (`blockResultLabel`)
6. Estado (`blockStatusLabel`) — concatena `statusLabel + ". " + currentStatusNote`

**Layout (CSS):** etiquetas de campo (`.audit-timeline__tree-label`) alineadas a la **izquierda**;
contenido (`.audit-timeline__tree-value`) **justificado** en todos los bloques y locales.

Etiquetas de campo: `{LOCALE}_BASE` (`blockVerificationDateLabel`, etc.). Traducir en los 11
locales si cambias el copy de la etiqueta (no el contenido del bloque).

---

## 5. Patrones de título (headline) — obligatorios

Referencia EN; adaptar al locale manteniendo la **misma estructura semántica**.

### 5.1 Textos del oráculo (`oracle-text`)

| Situación | Patrón EN | Patrón ES |
|-----------|-----------|-----------|
| Primera pasada sobre una fuente | `{Traductor}: initial verification` | `{Traductor}: verificación inicial` |
| **Cambio de fuente** (web → EPUB publicado) | `{Traductor}: verification (published edition)` | `{Traductor}: verificación (edición publicada)` |
| **Re-audit periódico** misma fuente (2.ª, 3.ª…) | `{Traductor}: second verification` | `{Traductor}: segunda verificación` |

Traductores: `Wilhelm/Baynes`, `James Legge`, `Zhou Yi` (o `周易` en JA/ZH según bloque existente).

**Prohibido en títulos:** `final verification`, `re-confirmation`, `reconfirmación`, `Sacred Books
of the East` como headline, `published edition` sin paréntesis de contexto.

Numeración futura: tercera verificación, cuarta verificación, … (documentar en `currentStatusNote`
de Zhou Yi el criterio de mejora continua).

### 5.2 Comentarios clásicos (`library-commentary`)

Auditoría **independiente**. No usar «verificación inicial» (confunde con oráculo). Los textos
auditados son comentarios de **Wilhelm**, **Legge** y **Confucio** (Diez Alas de Confucio), no
contenido editorial propio de la app.

| Patrón EN | Patrón ES |
|-----------|-----------|
| `Classical commentaries: Wilhelm/Baynes` | `Comentarios clásicos: Wilhelm/Baynes` |
| `Classical commentaries: James Legge` | `Comentarios clásicos: James Legge` |

Encabezado de sección (11 locales): plural y autores, p. ej. EN `Classical commentaries (Wilhelm,
Legge, Confucius)` / ES `Comentarios clásicos (Wilhelm, Legge, Confucio)`. Al mencionar Diez Alas
/ Ten Wings, atribuir siempre a Confucio (p. ej. «las Diez Alas de Confucio»). **No** «comentarios
de la biblioteca» ni formulaciones que suenen a contenido propio.

Estado recomendado: `statusLabel` = «Fuente actual de biblioteca» (no «fuente de producción» del
oráculo). `currentStatusNote` = frase pública neutra (p. ej. «Comentarios académicos verificados
para los 64 hexagramas»). Fecha en rail: **día de cierre de la auditoría de comentarios** (hoy
`2026-06-24`), aunque el trabajo interno haya terminado el día anterior.

**Copy público (obligatorio):** describir solo la **edición publicada** (APA en Fuente). En Método,
Estándar comparado, Resultado y Estado **no** mencionar: TXT, maestro, book-one, bundles, nombres
de scripts (`verify:*`), ni arquitectura interna (prompt de IA, capas de solo lectura, copyright
del algoritmo). Esos detalles viven en `docs/auditorias/` y en los harnesses, no en `/audits`.

### 5.3 Reglas de mutación (`mutation-rule`)

| Patrón EN | Patrón ES |
|-----------|-----------|
| `Changing-line rules: Alfred Huang` | `Reglas de líneas cambiantes: Alfred Huang` |
| `Changing-line rules: Zhu Xi (classical)` | `Reglas de líneas cambiantes: Zhu Xi (clásico)` |

### 5.4 Métodos de tirada (`divination-method`)

**Una entrada por método** (tres monedas y varas de milenrama son auditorías separadas).

Gold público (entradas `current`): **Apéndice I** de Wilhelm/Baynes (1950), misma cita APA que `wilhelmPantheon`.

Fuente inicial (`superseded`): **Nielsen 2003** (`CITATIONS.nielsen`); verificación combinatoria y Monte Carlo contra cuentas publicadas (Nielsen; Rutt 1996 citado en método). **No** citar Wilhelm como fuente de la pasada inicial.

| Situación | Patrón EN (monedas) | Patrón EN (varas) |
|-----------|---------------------|-------------------|
| Primera pasada (Monte Carlo, sin apéndice book-primary) | `Three coins: initial verification` | `Yarrow stalks: initial verification` |
| Verificación contra edición publicada (Apéndice I §2 / §1) | `Three coins: verification (published edition)` | `Yarrow stalks: verification (published edition)` |

Encabezado de sección (11 locales): EN `I Ching casting methods` / ES `Métodos de tirada del I Ching`.

**Copy público:** describir procedimiento por método (auto y manual). No mencionar harnesses, TXT, `verify:*`, ni simuladores internos. Huesos de Oráculo (Keightley) queda fuera de esta sección hasta AU book-primary dedicada.

---

## 6. Catálogo vigente (14 entradas)

Actualizar esta tabla cuando cambie el catálogo.

| id | Categoría | ISO rail | Título EN (headline) | statusKind |
|----|-----------|----------|----------------------|------------|
| `wilhelm-appendix-coins-2026-06-25` | divination-method | 2026-06-25 | Three coins: verification (published edition) | current |
| `wilhelm-appendix-yarrow-2026-06-25` | divination-method | 2026-06-25 | Yarrow stalks: verification (published edition) | current |
| `wilhelm-commentary-txt-maestro-2026-06-23` | library-commentary | 2026-06-24 | Classical commentaries: Wilhelm/Baynes | current |
| `legge-commentary-txt-maestro-2026-06-23` | library-commentary | 2026-06-24 | Classical commentaries: James Legge | current |
| `zhouyi-ctext-2026-06-21` | oracle-text | 2026-06-23 | Zhou Yi: second verification | current |
| `legge-oxford-pdf-2026-06-22` | oracle-text | 2026-06-23 | James Legge: verification (published edition) | current |
| `wilhelm-pantheon-pdf-2026-06-22` | oracle-text | 2026-06-23 | Wilhelm/Baynes: verification (published edition) | current |
| `huang-mutation-pdf-2026-06-22` | mutation-rule | 2026-06-22 | Changing-line rules: Alfred Huang | current |
| `zhuxi-adler-mutation-pdf-2026-06-22` | mutation-rule | 2026-06-22 | Changing-line rules: Zhu Xi (classical) | current |
| `wilhelm-parma-initial-2026-06-21` | oracle-text | 2026-06-21 | Wilhelm/Baynes: initial verification | superseded |
| `legge-sacred-texts-initial-2026-06-21` | oracle-text | 2026-06-21 | James Legge: initial verification | superseded |
| `zhouyi-ctext-initial-2026-06-21` | oracle-text | 2026-06-21 | Zhou Yi: initial verification | superseded |
| `coins-math-initial-2026-05-19` | divination-method | 2026-05-19 | Three coins: initial verification | superseded |
| `yarrow-math-initial-2026-05-19` | divination-method | 2026-05-19 | Yarrow stalks: initial verification | superseded |

Conteos esperados por categoría: **6** oráculo, **4** métodos de tirada, **2** biblioteca, **2** mutación.

---

## 7. Procedimiento: añadir una nueva verificación

### Paso 0 — Preparación

- [ ] Tener el **informe de auditoría interno** cerrado en `docs/auditorias/` con cifras finales
- [ ] Decidir **categoría** (§3.1) y **patrón de título** (§5)
- [ ] Elegir `id` nuevo (§3.3) y fecha ISO del rail

### Paso 1 — `TIMELINE_META`

Añadir clave con `verificationDateIso` y `sortOrder`. Si es el día más reciente del producto,
`sortOrder: 0` suele colocarla primera entre entradas del mismo día.

### Paso 2 — Bloque en `BLOCKS_EN`

Copiar un bloque vecino de la **misma categoría**; rellenar los 10 campos. Usar `CITATIONS.*`
existente salvo fuente nueva.

### Paso 3 — Traducir a los otros 10 locales

Orden recomendado: **EN → ES → PT, FR, DE, IT → JA, ZH, KO → AR, HI**.

Cada `BLOCKS_XX` debe tener:

- El **mismo conjunto de `id`** (mismos 10 u 11 tras el cambio)
- El **mismo `category` y `statusKind`** por id
- **Misma cita** (`source: CITATIONS.xxx`)
- Título y prose traducidos; nombres propios y títulos de libros en APA **sin traducir**

### Paso 4 — Actualizar gate `verify-docs-remediation.mjs`

En sección P2.3, revisar:

```javascript
audits.timeline.length === 14;  // incrementar si añades entradas
audits.timeline[0]?.id === "wilhelm-appendix-coins-2026-06-25";  // id más reciente
audits.timeline.filter((e) => e.category === "oracle-text").length === 6;
audits.timeline.filter((e) => e.category === "divination-method").length === 4;
audits.timeline.filter((e) => e.category === "library-commentary").length === 2;
audits.timeline.filter((e) => e.category === "mutation-rule").length === 2;
```

### Paso 5 — Build y verificación

```bash
npm run build --workspace=@iching-oracle/i18n
npm run verify:docs-remediation
npm run i18n:audit
```

Higiene en `audits-page-ui.ts` (gate automático):

```bash
# Debe ser 0 en ambos
grep -c "—" packages/i18n/src/messages/audits-page-ui.ts
grep -c "–" packages/i18n/src/messages/audits-page-ui.ts
```

Usar `1-2` con guion ASCII, no en-dash, en rangos de hexagramas.

### Paso 6 — Smoke visual

- [ ] `/audits` en **claro y oscuro**
- [ ] Entrada nueva en la **sección correcta**
- [ ] Círculo verde/gris según `statusKind`
- [ ] Expandir: 6 campos completos; título APA en cursiva
- [ ] Probar al menos **ES + EN** en selector de idioma

### Paso 7 — Catálogo y commit

- [ ] Actualizar tabla §6 de **esta guía**
- [ ] Si procede, enlace desde FAQ/guía hacia `/audits` (WF-DOC-01), sin duplicar el detalle técnico

---

## 8. Procedimiento: actualizar una entrada existente

| Cambio | Qué tocar |
|--------|-----------|
| Cifra de resultado, método, nota de estado | Solo strings del bloque en **11 locales** |
| Título (renombrar patrón) | `title` en 11 locales; verificar §5 |
| Sustituir fuente vigente | Nueva entrada `current` + antigua `superseded`; **no** sobrescribir histórico |
| Corregir fecha rail | `TIMELINE_META.verificationDateIso` + `verificationDate` coherente en 11 locales |
| Reordenar mismo día | Ajustar `sortOrder` en `TIMELINE_META` |

**No** parchear solo EN/ES: el gate exige paridad estructural en 11 locales.

---

## 9. Procedimiento: marcar superseded (oráculo)

Ejemplo: nueva verificación EPUB reemplaza mirror web.

1. Entrada antigua: `statusKind: "superseded"`, `statusLabel` traducido («Reemplazada», «Superseded», …).
2. `currentStatusNote`: explicar **solo** el rol histórico (p. ej. «Verificación cruzada contra el mirror de Parma»).
3. Entrada nueva: `statusKind: "current"`, título `(published edition)` o numeración de re-audit.
4. **No** escribir «ver siguiente entrada» ni «permanente».

---

## 10. Anti-patrones (regresiones reales)

| Error | Por qué está mal | Corrección |
|-------|------------------|------------|
| Mezclar comentarios con oráculo en un solo bloque | Son harnesses y alcances distintos | Dos entradas, dos categorías |
| «Verificación final» | Implica cierre; hay auditorías periódicas | `second verification`, `third verification`, … |
| «Reconfirmación» | No dice de qué | Numeración o `(published edition)` |
| Prefijo `Comentarios de biblioteca:` | Usuario cree que es contenido propio | `Comentarios clásicos:` + autores en encabezado de sección |
| Referencias cruzadas entre entradas | Rompe autonomía del bloque | Cada fila autocontenida |
| Editar solo `BLOCKS_EN` | UI rota en otros idiomas | 11 bloques en paralelo |
| Olvidar `TIMELINE_META` | Crash en runtime al cargar `/audits` | Añadir meta por id |
| Olvidar actualizar gate P2.3 | CI verde con catálogo incorrecto | Conteos + `timeline[0].id` |
| Guiones `—` / `–` en copy | Falla higiene WF-DOC-01 | Guion ASCII `-` o redacción sin dash |
| «Maestro TXT», `book-one`, `verify:*` en prose público | Revela pipeline interno | Solo edición publicada y alcance verificado |
| «Nunca se envía al prompt de IA» / «capa solo lectura» | Arquitectura y copyright internos | Nota de estado neutra para el usuario |
| Contenido del timeline no justificado | UX acordada | `.audit-timeline__tree-value { text-align: justify; }` |

---

## 11. Añadir una categoría nueva (raro)

Requiere cambio de tipo y UI:

1. Extender `AuditBlockCategory` en `audits-page-ui.ts`
2. Añadir `*SectionHeading` en `AuditsPageUiMessages` + 11 `{LOCALE}_BASE`
3. Actualizar `groupTimelineByCategory` y `sectionHeading()` en `page.tsx` (switch exhaustivo)
4. Ampliar checks P2.3 en `verify-docs-remediation.mjs`
5. Documentar patrón de título en §5 de esta guía

No hacerlo por una sola entrada; usar categorías existentes.

---

## 12. Checklist pre-commit (copiar)

```text
[ ] Informe interno docs/auditorias/ cerrado con cifras reproducibles
[ ] id nuevo en TIMELINE_META (iso + sortOrder)
[ ] Bloque completo en BLOCKS_EN … BLOCKS_HI (mismos ids)
[ ] Título sigue patrón §5 para la categoría
[ ] source = CITATIONS.* (APA intacta)
[ ] Oráculo / biblioteca / mutación no mezclados
[ ] statusKind correcto (current vs superseded)
[ ] Sin — ni – en audits-page-ui.ts
[ ] npm run build --workspace=@iching-oracle/i18n
[ ] npm run verify:docs-remediation
[ ] npm run i18n:audit
[ ] Smoke /audits claro + oscuro (EN + ES mínimo)
[ ] Tabla §6 de esta guía actualizada si cambió el catálogo
[ ] Gate P2.3 actualizado si cambió conteo o entrada más reciente
```

---

## 13. Comandos de referencia rápida

```bash
# Build i18n (obligatorio antes de verify:docs-remediation)
npm run build --workspace=@iching-oracle/i18n

# Gate específico página audits (P2.3 + higiene)
npm run verify:docs-remediation

# Paridad general i18n
npm run i18n:audit

# Dev local
npm run dev
# → http://localhost:3000/audits
```

---

## 14. Relación con auditorías internas

| Auditoría interna | Entrada pública típica |
|-------------------|------------------------|
| `verify:hexagram-fidelity` (514 campos) | `wilhelm-pantheon-*`, `legge-oxford-*`, `zhouyi-ctext-*` |
| `verify:wilhelm-all-gates` (comentarios) | `wilhelm-commentary-txt-maestro-*` |
| `verify:legge-all-gates` (footnotes + Ap. II) | `legge-commentary-txt-maestro-*` |
| `qa:mutation-output` / PDF gold mutación | `huang-mutation-*`, `zhuxi-adler-mutation-*` |
| `verify:divination-wilhelm-appendix` (Apéndice I) | `coins-math-initial-*`, `yarrow-math-initial-*`, `wilhelm-appendix-coins-*`, `wilhelm-appendix-yarrow-*` |

El informe interno puede ser largo; la entrada pública resume **una fuente, una fecha, un
resultado numérico**. Enlazar profundidad técnica vía `/notes`, FAQ o `docs/auditorias/` solo
cuando producto lo pida; no duplicar el informe entero en `/audits`.

---

*Última revisión catálogo: 2026-06-25 · 14 entradas · métodos de tirada por monedas/varas (Apéndice Wilhelm).*
