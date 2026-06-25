# Keightley — referencia procedimental (Huesos Shang)
**Código:** `20260625-BRIEF-DIV-04 keightley-procedural-reference` · **Familia:** DIV · **Estado:** reference

**Fecha:** 2026-06-25  
**Fuente book-primary:** Keightley, D. N. (1978/1985). *Sources of Shang History*. UC Press. ISBN `978-0-520-05455-4`.  
**PDF local:** `tools/source-pdfs/Sources of Shang History_ The Oracle-Bone Inscriptions of.pdf` (manifest `keightley`)  
**Texto extraído:** `tools/output/keightley-full.txt` (local, gitignored)  
**AU relacionada:** [`20260625-AUD-DIV-03-oracle-bones-keightley.md`](./20260625-AUD-DIV-03-oracle-bones-keightley.md) (contrast app ↔ libro)  
**Gold parcial:** `tools/datasets/keightley/procedural/keightley-procedural-gold.json` (§2.5–2.7, §4.3.1.11)

---

## 1. Para qué sirve este documento

Síntesis **operativa** del procedimiento Shang según Keightley, con dos estudios de caso canónicos del libro:

| Caso | Referencia Keightley | Rol |
|------|----------------------|-----|
| **Plantilla par ± + set en un plastrón** | Ping-pien 8 / fig. 8 (+ reverso Ping-pien 9 / fig. 9) | Modelo mínimo de cargas emparejadas, numeración, notaciones y prognosticación |
| **Set multi-plastrón completo** | Ping-pien 12–21 / §3.7 | Ritual real a escala (campaña + dolor de muelas + ancestros + rey) |

Objetivo: base documentada para **decisiones de producto** (motor, copy, imagen) sin mezclar aún veredicto AU app↔libro — eso queda en AUD-DIV-03.

---

## 2. Qué NO es la adivinación Shang (Keightley)

| Idea popular / app actual | Keightley |
|---------------------------|-----------|
| Un sorteo → una respuesta | **Sets** de muchas grietas (típ. 5+5 = 10 por tema en periodo I) |
| Cuatro estados simétricos 吉/凶 aleatorios | **Notaciones de grieta** casi siempre auspiciosas; **凶 no aparece** en inscripciones óseas |
| Patrones T/X/Y = taxonomía arqueológica | Grieta **卜** (vertical + transversal); forma física ≠ veredicto grabado |
| «Silencio» como quinto veredicto productizado | A veces **sin indicación** → más quemados u otra carga; no es categoría epigráfica |
| Probabilidades fijas (29/23/23/23) | **No documentadas** en el libro |

---

## 3. Unidades de registro (Cap. 2.1)

Cadena posible (no todas las piezas tienen todo):

```
Prefacio (± postfacio) → Carga → Nº de grieta → Notación de grieta → Prognosticación → Verificación
```

| Unidad | Término moderno | Quién / cuándo |
|--------|-----------------|----------------|
| Prefacio | *hsü-tz'u* 序辞 | Día kan-chih, adivino, a veces lugar |
| Carga | *ming-tz'u* 命辞 | Tema; **deseo/intención**, no pregunta interrogativa (§2.3, n. 7) |
| Nº grieta | *pu-chao* / *chi-shu* | Secuencia 1–10 (periodo I); ≤5 después |
| Notación | *shu-yü* 述语 / *chao-yü* 兆语 | Etiqueta corta junto a la grieta; **grabada antes** que la carga larga |
| Prognosticación | *chan-tz'u* 占辞 | **Rey**: 王占曰 *wang chan yüeh* |
| Verificación | *yen-tz'u* 验辞 | Qué ocurrió después; **minoría** |

Keightley limita «inscripción» a prefacio + carga + prognosticación + verificación; números y notaciones de grieta van aparte estadísticamente (§2.1, n. 1).

---

## 4. Capas de «estado» (no confundir)

### 4.1 Capa física — ¿hubo lectura?

| Estado | Comportamiento |
|--------|----------------|
| Grieta legible | Se numera y puede anotarse |
| Sin indicación | Se repiten quemados o se cambia carga (Preamble; §2.5 n. 48) |
| Grieta rechazada | Sin número; huecos gemelos no usados (Ping-pien 58) |

### 4.2 Capa epigráfica — notación de grieta (§2.6, §4.3.1.11)

Grabada al pie de la grieta vertical, mismo lado que la rama transversal (fig. 8). Contiene casi siempre **吉**.

**Periodo I** (frecuencia en Ping-pien, §4.3.1.11):

| Grafía | Lectura | Sentido |
|--------|---------|---------|
| 上吉 | *shang-chi* | Muy auspicioso (más frecuente) |
| 小吉 | *hsiao-chi* | Ligeramente auspicioso |
| 不再次命 (?) | *pu tsai ming* | «No volver a cargar (?)» — suele aparecer **temprano** en el set |
| 吉 | *chi* | Auspicioso genérico (raro en I) |

**Periodo III–IV:** 弘吉 *hung-chi*, 大吉 *ta-chi*; 吉 pasa a dominar.

**Regla explícita (§2.6):** «**Inauspicious crack notations were not recorded.**» El graph **凶** del *Yi Jing* **no aparece** en inscripciones Shang (§2.6 n. 64).

### 4.3 Capa real — prognosticación del rey (§2.7)

- Fórmula: **王占曰** — «El rey, leyendo las grietas, dijo: …»
- Adivinos **queman y proponen**; el rey **prognostica** (casi siempre).
- Puede ser eco de notación («吉»), repetir la carga, o ser **más específica e incluso inauspiciosa en prosa** (Ping-pien 248 / fig. 13: parto *jen-hsü* «será inauspicioso»).
- Solo **minoría** de cargas tienen prognosticación grabada.

### 4.4 Cargas emparejadas (*tui-chen* 對貞) — §2.5

Par positivo/negativo sobre **un mismo tema**:

> «Recibiremos cosecha de mijo / Quizá no recibiremos cosecha de mijo» (Ping-pien 8)

- Típico: **5 grietas** lado positivo + **5** lado negativo = **10 grietas/tema** en **un** plastrón (set regular).
- También: 5 plastrons × 2 grietas/tema; cargas repetidas o abreviadas en plastrons 2–5 (§3.7.1.1).

---

## 5. Estudio de caso A — Ping-pien 8 (fig. 8) + reverso 9 (fig. 9)

### 5.1 Identificación

| Campo | Valor |
|-------|-------|
| Colección | Ping-pien (Academia Sinica) |
| Especimen | Plastrón *Ocadia sinensis* (Os) |
| Set | **Regular**: un plastrón, **10 grietas** (5+5) para un tema |
| Adivino | Ch'üeh (Ch'iieh) |
| Día | *ping-ch'en* (día 53) |
| Postfacio | Cuarto mes |

### 5.2 Texto (transcripción Keightley, fig. 8–9)

**Frente — derecha (Ping-pien 8.1):**

> (Prefacio:) Crack-making on *ping-ch'en* (day 53), Ch'iieh divining:  
> (Carga:) **We will receive millet harvest.**

**Frente — izquierda (Ping-pien 8.2):**

> **We will not perhaps receive millet harvest.**

(*ch'i* 其 = «perhaps» en carga negativa deseable — §3.5.1 n. 41.)

**Postfacio:** «(In) the fourth month.»

**Reverso (Ping-pien 9 / fig. 9):**

> The king, reading the cracks, said: **«Auspicious. We will receive this harvest.»**

(Frase *shou yu nien* «recibir esta cosecha» — §3.7.1.2 n. 85.)

### 5.3 Layout físico (§2.9.4, fig. 8)

- Columnas en **espejo**: carga positiva a un lado, negativa al otro.
- Inscripciones en el lado de la grieta **sin** rama transversal.
- Numeración de grietas **1–5** por lado.
- Notaciones de grieta junto a grietas concretas; Keightley cita el ejemplo general: *«crack number four was highly auspicious»* (§2.6) — en fig. 8.

### 5.4 Flujo ritual (reconstrucción)

```mermaid
flowchart LR
  A[Prefacio + carga ±] --> B[Quemar 10 huecos]
  B --> C[Numerar grietas 1-5 por lado]
  C --> D[Notaciones 上吉/小吉/… junto a grietas]
  D --> E[Rey prognostica en reverso]
  E --> F[Postfacio mes 4]
```

### 5.5 Qué enseña como plantilla

1. **Un tema** = par ±, no un veredicto único.
2. **Notaciones** = grados de lo auspicioso; **no** par 吉/凶 simétrico grabado.
3. **Prognosticación** = capa del **rey**, puede cerrar interpretando el set («recibiremos esta cosecha»).
4. **Frente/reverso** pueden repartir carga vs prognosticación (8/9).

---

## 6. Estudio de caso B — Ping-pien 12–21 (§3.7)

Base del **Preamble** del libro (dolor de muelas de Wu Ding). **Cinco plastrons** formando un set (crack **1** en plastrón 12, **2** en 14, …).

### 6.1 Escala material (§3.7.2)

| Métrica | Valor |
|---------|-------|
| Plastrons | 5 |
| Huecos dobles por plastrón | 32 (16 izq. + 16 der.) |
| Huecos totales del set | **160** |
| Uso | Todos quemados (eficiencia plena en este set) |
| Numeración | Grieta nº **n** en plastrón n (con excepciones sin número) |

### 6.2 Frente — cargas (traducción combinada §3.7.1.2)

**Pares complementarios — estrategia militar** (día *hsin-yu*, día 58, Ch'iieh):

| # | Carga negativa (izq.) | Carga positiva (der.) |
|---|------------------------|------------------------|
| 1–2 | Esta estación el rey **no debe** seguir a Wang Ch'eng contra Hsia Wei → quizá **no** recibiremos asistencia | El rey **debe** seguir a Wang Ch'eng → **recibiremos** asistencia |
| 3–4 | El rey **no debe** seguir a Chih Kuo (contra Pa-fang) → quizá no asistencia | El rey **debe** seguir a Chih Kuo → recibiremos asistencia |
| 5–6 | **No debe ser** Chih Kuo a quien siga el rey (Pa-fang) → quizá no asistencia | **Debe ser** Chih Kuo a quien siga el rey → recibiremos asistencia |

*(«Atacar Pa-fang» no está grabado en el set; Keightley lo infiere de inscripciones relacionadas Ping-pien 22, 24+ — §3.7.1.2 nn. 86, 104–105.)*

**Dolor de muelas** (~10 días después, sin fecha en frente):

| # | Contenido |
|---|-----------|
| 7 | Yu sacrificio perro a Fu Keng + mao sacrificio oveja |
| 8 | Oración para alejar muela enferma; sacrificio *ting* será favorable |
| 9–10 | Par ±: «Muela enferma será favorable / quizá no será favorable» |

### 6.3 Reverso — subcargas de ancestros (§3.7.1.2, §3.7.4.2)

Cuatro pares «**es por** / **no es por**» (Fu Chia, Fu Keng, Fu Hsin, Fu Yi) — identificar qué ancestro **maldice** la muela.

| Subcarga | Forma |
|----------|-------|
| 1–2 | Es por Fu Chia / No es por Fu Chia |
| 3–4 | Es por Fu Keng / No es por Fu Keng |
| 5–6 | Es por Fu Hsin / No es por Fu Hsin |
| 7–8 | Es por Fu Yi / No es por Fu Yi |

### 6.4 Notaciones de grieta en el set (§3.7.3)

Solo **tres** notaciones conservadas en fragmentos actuales:

| Notación | Ubicación | Asociación (hipótesis Keightley) |
|----------|-----------|----------------------------------|
| 小吉 *hsiao-chi* | Ping-pien 14/15, hueco H6 | Carga 8 (oración muela + *ting*) |
| 上吉 *shang-chi* | Ping-pien 14, hueco H15 | Subcarga 5 «es por Fu Hsin» |
| 小吉 *hsiao-chi* | Ping-pien 18, hueco H16 | Subcarga 6 «no es por Fu Hsin» |

**Cargas militares (1–6):** ninguna notación en fragmentos conservados (posible en piezas perdidas). Plastrón relacionado 24+ tiene *shang-chi* junto a «seguir Chih Kuo» → rey pudo elegir esa campaña (§3.7.4.1 n. 111).

### 6.5 Prognosticaciones del rey (§3.7.1.2 reverso)

Solo en Ping-pien **17.9** y **19.9** — fenómeno natural 𠂇 (posible trueno/relámpago):

**Primera (17.9):**

> El rey dijo: «Quizá habrá fenómeno natural 𠂇. Si es día *wu* cuando ocurre, **será inauspicioso**.»

**Segunda (19.9):**

> «En *ting-ch'ou* (día 14) quizá habrá 𠂇; **inauspicioso**. Si es día *chia*, **auspicioso**. Si es día *hsin*, también **inauspicioso**.»

Aquí la **inauspiciosidad** vive en **prosa del rey**, no en notación 凶 al lado de la grieta.

### 6.6 Conteo de quemados por fase (§3.7.6)

| Fase | Grietas (aprox.) |
|------|------------------|
| Estrategia de campaña | 30 |
| Identificar ancestro (muela) | 70 |
| Sacrificio Fu Keng + oración | 20 |
| Días auspiciosos para sacrificio / fenómeno 𠂇 | 40 |
| **Total set** | **~160** |

Labor estimada del set: **~100 horas-hombre** (preparación huecos, quemado, grabado, pigmento) — §3.7.6.

### 6.7 Escenario interpretativo (§3.7.4 — hipótesis Keightley)

1. **Primero** campaña (30 grietas); **sin** prognosticación/verificación grabada para «seguir general X».
2. **~10 días después**, muela: subcargas de ancestros en **reverso**; Fu Hsin absuelto (*shang-chi*/*hsiao-chi*); Fu Keng implicado → sacrificio perro/oveja en frente.
3. Carga 8: *hsiao-chi* → oración + *ting* «ligeramente auspicioso».
4. Prognosticaciones 17.9/19.9 ligadas a 8 grietas «sin inscripción» (H25–H32) — subcargas no grabadas sobre días del fenómeno 𠂇.

Keightley enfatiza: correlación grieta↔texto es **hipotética**; hay que leer set completo, frente y reverso, antes de usar como fuente histórica (§3.7.6 cierre).

---

## 7. Tabla de símbolos — uso correcto al citar Keightley

| Símbolo / término | Uso en Shang (Keightley) | Evitar |
|--------------------|--------------------------|--------|
| 卜 | Forma de grieta + acto piromántico | Confundir con «patrón T de la app» |
| 吉 / 上吉 / 小吉 / 大吉 / 弘吉 | Notaciones de grieta grabadas | Traducir como «veredicto del motor» 1:1 |
| 凶 | **Ausente** en huesos Shang | UI con 凶 como notación epigráfica Shang |
| 王占曰 | Prognosticación real del rey | Atribuir al adivino o al RNG |
| 命辭 | Carga (± emparejada) | «Pregunta» al usuario |
| 述语 | Notación junto a grieta | Prognosticación |
| 验辞 | Verificación posterior | Resultado del sorteo único |

---

## 8. Preguntas abiertas para decisiones de producto

Documentar aquí respuestas cuando se cierre AUD-DIV-03 Fase 2:

| # | Pregunta | Ancla Keightley |
|---|----------|-----------------|
| Q1 | ¿El motor debe simular **un crack** o un **set**? | §2.5; §3.7.6 (160 grietas/set real) |
| Q2 | ¿Los 4 veredictos mapean a *shang-chi* / *hsiao-chi* / … o a prognosticación? | §2.6 vs §2.7 |
| Q3 | ¿Mostrar 凶 al usuario como notación Shang? | §2.6 n. 64 — **no epigráfico** |
| Q4 | ¿Copy «fiel al ritual Shang»? | Preamble + §3.7: multi-plastrón, rey, sets, sin 凶 grabado |
| Q5 | ¿Patrones imagen T/X/Y? | Cap. 1.6: grieta 卜; sin tabla T/X/Y en Keightley |
| Q6 | ¿Eliminar «silencio» fue acertado? | §2.5 n. 48: abandono de set ≠ categoría grabada — alineado con DIV-01 |

---

## 9. Extracción ampliada (gold JSON)

Secciones ya en `keightley-procedural-gold.json`:

- `2.5-divination-sets`
- `2.6-crack-notations`
- `2.7-prognostication`
- `4.3.1.11-crack-notation-taxonomy`

**Pendiente Fase 2 AU:** añadir bloques `3.7-ping-pien-12-21` y `fig-8-ping-pien-8` al gold + harness `VF-DIV-002` (ver AUD-DIV-03 §6).

Comando re-extracción procedural:

```bash
npm run extract:gold:keightley-procedural
```

---

## 10. Referencias rápidas en el PDF

| Sección libro | PDF pp. (manifest) | Contenido |
|---------------|-------------------|-----------|
| Preamble | ~xiii | Escena Ping-pien 12–21 |
| §1.6 | ~40–45 | Quemado, grieta 卜 |
| §2.3–2.8 | ~48–62 | Cargas, sets, notaciones, rey, verificación |
| §3.7 | ~76–89 | Caso Ping-pien 12–21 completo |
| §4.3.1.11 | ~136–137 | Taxonomía notaciones por periodo |
| Fig. 8–9 | láminas | Ping-pien 8 frente / 9 reverso |

---

## 11. Genealogía del motor en la app (AUD-DIV-01 + git)

**Pregunta:** ¿De dónde salió lo que construimos? ¿Hay otro autor además de Keightley?

**Respuesta corta:** casi todo el **procedimiento jugable** (4 veredictos, pesos, un sorteo, patrones T/X/Y) es **diseño de producto desde el Initial commit** (`87c5c9b`, mayo 2026). Keightley entra **después**, en `AUD-DIV-01` / `f462f43`, solo para **anclar** carga ±, existencia del ritual Shang y **eliminar** el 5.º veredicto «Silencio». **No hay segundo autor citado** en el repo para la taxonomía 4×4 ni para topología T/X/Y.

| Pieza del sistema | Origen documentado | Autor / evidencia |
|-------------------|-------------------|-------------------|
| Carga positiva + negación automática | Producto (estructura ±) | Paralelo Keightley §2.3 *命辭* — **no** verificado campo a campo en mayo 2026 |
| Tortuga / buey 50/50 | Producto | Keightley menciona ambos soportes; no este reparto |
| **4 veredictos** 大吉/吉/凶/大凶 | **Initial commit** | **Sin cita académica**; DIV-01 §5 los llama «archaeologically authentic» — **sobreafirmación** (AUD-DIV-03 G) |
| Pesos 25/20/20/20 (+15% silencio) | **Initial commit** | Inventados; redistribución 29.41/23.53… tras quitar silencio |
| Veredicto 5 «Silencio» / ancestros silenciosos | **Initial commit** | Eliminado `f462f43` citando Keightley + Academia Sinica (corpus, no procedimiento) |
| Un solo `rollCrackPattern()` | Producto | Keightley: **sets** multi-grieta (5+5, ~160/set) |
| Patrones imagen T / bambú / X / Y | Commit `0ae15d18+` | Comentario «archaeologically informed» **sin bibliografía** |
| Patrón 5 indeterminado (prompt + SVG) | Legacy pre-`f462f43` | Motor ya no lo emite; **deuda** en `oracle-bones-prompt.ts` + `CrackPatternGraphic.tsx` |
| FAQ «faithful to the original Shang tradition» | Copy producto | **OVERCLAIM** vs Keightley (AUD-DIV-03 J) |

### Autores en bibliografía DIV-01 §8 — alcance real

| Autor | Citado para huesos? | Rol en el repo |
|-------|---------------------|----------------|
| **Keightley 1978** | **Sí** (único gold huesos) | Ritual Shang, notaciones grieta, anti-silencio |
| **Academia Sinica / IHPH** | Mencionado junto a Keightley | Tamaño del corpus excavado — **no** define 4 veredictos |
| Wilhelm, Legge, Rutt, Nielsen, Shaughnessy, Adler, Zhu Xi | Bibliografía general I Ching | **Cero** procedimiento huesos Shang |

**Influencia implícita no documentada en código:** gradación 吉/凶 estilo I Ching (misma app, traductores W/L) — **convención cultural**, no extracción de Keightley (donde las notaciones grabadas son mayormente auspiciosas: 上吉, 小吉, 大吉, 弘吉; **凶 no se graba**).

### Línea temporal

1. **`87c5c9b`** — motor huesos con 5 pesos incl. `silent`, loop hasta 3 indeterminados.
2. **`60115a6` / `00000000-AUD-DIV-01`** — documenta matemática; cierra métodos I Ching + huesos **sin PDF Keightley parseado**.
3. **`f462f43`** — quita Silencio; redistribuye 15%; cita Keightley.
4. **`20260625-AUD-DIV-02` §13** — designa Keightley como gold book-primary; admite que DIV-01 **no** contrastó pesos/patrones/copy.
5. **`20260625-AUD-DIV-03` Fase 1** — hallazgos G–J: motor = abstracción ludificada, no procedimiento Shang 1:1.

**Conclusión para decisiones:** Keightley es la **única fuente seria** ya identificada para huesos; no aparece otro autor que haya originado los 4 estados o T/X/Y. Cualquier remediación de copy o mecánica debe distinguir «inspirado en ritual Shang (carga ±, piromancia real)» de «reproduce taxonomía/pesos Keightley».

**Trazabilidad guía/notas/FAQ → bibliografía → URLs:** [`20260625-BRIEF-DIV-05-guia-bones-sources-trace.md`](./20260625-BRIEF-DIV-05-guia-bones-sources-trace.md).

---

## Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-06-25 | §11 genealogía motor vs AUD-DIV-01 + commits (sin segundo autor para 4 veredictos) |
| 2026-06-25 | Creación: marco procedimental + Ping-pien 8 + §3.7.12–21 para decisiones producto |
