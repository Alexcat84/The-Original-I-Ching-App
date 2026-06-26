# Guía y notas — trazabilidad de fuentes (Huesos de Oráculo)

**Código:** `20260625-BRIEF-DIV-05 guia-bones-sources-trace` · **Familia:** DIV · **Estado:** reference

**Alcance:** documentación únicamente — **sin** cambios a copy, motor ni FAQ.  
**Relacionado:** [`20260625-BRIEF-DIV-04-keightley-procedural-reference.md`](./20260625-BRIEF-DIV-04-keightley-procedural-reference.md) §11 · [`20260625-AUD-DIV-03-oracle-bones-keightley.md`](./20260625-AUD-DIV-03-oracle-bones-keightley.md) · [`20260625-AUD-DIV-04-oracle-bones-product-support.md`](./20260625-AUD-DIV-04-oracle-bones-product-support.md)

---

## 1. Mapa de enlaces en la documentación pública (huesos)

La **guía de uso** (`/guia`, `packages/i18n/src/messages/guia-page-ui.ts`) **no incluye URLs externas** sobre huesos. Solo describe el método en prosa y enlaza a otras páginas internas.

| Desde | Enlace / referencia | Destino | ¿Huesos? |
|-------|---------------------|---------|----------|
| `/guia` | Nav + §6 Documentación | `/notes` («Notas y origen de los métodos») | **Sí** — sección huesos al inicio |
| `/guia` | Nav | `/faqs` | **Sí** — id `oracle-bones-method` |
| `/guia` | Nav | `/audits` | **No** — solo verificaciones I Ching (textos + métodos monedas/varas) |
| `/faqs` | `related: ["methodNotes"]` en `oracle-bones-method` | `/notes` | **Sí** |
| `/notes` | Bibliografía final (`ACADEMIC_SOURCES`) | Texto APA **sin hipervínculo** | **Parcial** — Keightley es la única entrada claramente huesos |

**Conclusión navegación:** la cadena operativa del usuario es **Guía → Notas / FAQ → bibliografía APA**. No hay «enlace que salga» a un manual procedimental de 4 veredictos en otro sitio; hay **seis citas bibliográficas compartidas** (I Ching + contexto general), de las cuales **solo Keightley** trata la adivinación Shang de forma directa.

---

## 1b. Lo que había en `/notes` con «enlaces» (memoria correcta del usuario)

**Sí hubo referencias a sitios externos en `/notes`**, pero **no en la sección de huesos** ni como `<a href>` clicables: eran **nombres de dominio en prosa** dentro de la sección **«Auditorías de fidelidad 1:1»** (`ichingDataAuditHeading` / `ichingDataAuditBody`), visible **~21–22 jun 2026** y **eliminada** al centralizar en `/audits`.

| Commit | Cambio |
|--------|--------|
| `26469c9` / `0da877b` / `8c33479` (21 jun 2026) | Se añade `ichingDataAuditBody` con dominios en texto |
| `86f6b2b` (22 jun 2026) | Se **quita** el bloque de `/notes`; nav gana enlace a `/audits`; contenido migra a `audits-page-ui.ts` |

### Texto histórico EN (paráfrasis del commit `0da877b`)

> Last audit: 21 June 2026. … James Legge (1882, Sacred Books of the East **via sacred-texts.com**), the canonical Zhou Yi (**Chinese Text Project, ctext.org**), and the Wilhelm/Baynes English rendering (**University of Parma academic mirror** of the Princeton 1950 edition). … hex 56 … verified against **wengu and iching-online** …

Versión posterior (`8c33479`): sustituye wengu/iching-online por **páginas del libro físico** Princeton 1950 (hex 56 p. 231, etc.).

### Tabla: dominios mencionados en `/notes` (histórico) → hacia dónde apuntan

| Mención en `/notes` (prosa) | URL canónica hoy | Qué verifica | ¿Relacionado con huesos? |
|-----------------------------|------------------|--------------|------------------------|
| **sacred-texts.com** | https://sacred-texts.com/ich/index.htm | Textos oráculo **Legge** (ic01–ic64 + icap2) | **No** — I Ching |
| **ctext.org** / Chinese Text Project | https://ctext.org/book-of-changes | **Zhou Yi** canónico (卦辞+爻辞+用九/六) | **No** — I Ching |
| **Universidad de Parma** / Parma mirror | http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html | Traducción **Wilhelm** EN (secundario vs PDF Pantheon) | **No** — I Ching |
| **wengu** / **iching-online** | (sitios de consulta Wilhelm; ya no citados en producto) | Contrastes auxiliares hex 56 / gaps Parma | **No** — I Ching |
| **Princeton University Press, 1950** | Edición impresa Bollingen (sin URL en producto) | Suplementos Wilhelm donde Parma omite pasajes | **No** — I Ching |

**Hoy:** esas URLs viven en **`/audits`** (`packages/i18n/src/messages/audits-page-ui.ts`, bloques `CITATIONS.wilhelmParma`, `leggeSacredTexts`, `zhouyiCtext`) con enlaces renderizados en la página pública de auditorías.

### Sección huesos en `/notes` — nunca tuvo URLs

| Época | Contenido huesos | Enlaces |
|-------|------------------|---------|
| `355f864` (may 2026) | 5 veredictos + «Silencio» + `bonesAuthBody` (150k fragmentos, museos) | **Ninguno** |
| `f462f43` (may 2026) | Elimina silencio; queda 4 veredictos | **Ninguno** |
| `169af00` (jun 2026) | Bibliografía APA estructurada (`ACADEMIC_SOURCES`) | **Ninguno** — solo texto |
| **Hoy** | Mismo + nav a `/audits` | **Ninguno** en cuerpo huesos |

### Otra cita histórica en `/notes` (yarrow, no huesos)

En `355f864`, la sección varas citaba en prosa **«Edward Shaughnessy's *Sources of Western Zhou History* (1993)»** — obra distinta del Shaughnessy (1996) *I Ching* en la bibliografía actual. Esa frase ya **no está** en el copy vigente de varas.

---

## 1c. Enlaces Wikipedia históricos en `/notes` (eliminados 10 may 2026)

Entre **`07f9d35`** (may 2026, bloque «Further reading» con `<a href>`) y **`fd1ce52`** (10 may 2026, «Remove Wikipedia links from notes page») la página `/notes` renderizaba **nueve** URLs de Wikipedia EN. Hoy **ninguna** permanece en producto.

| URL Wikipedia (histórica) | Etiqueta en app | ¿Huesos Shang? | Estado URL (jun 2026) | Hacia dónde apunta el artículo |
|---------------------------|-----------------|----------------|----------------------|--------------------------------|
| https://en.wikipedia.org/wiki/I_Ching | I Ching (Zhouyi) | No | ✅ Activo | Hexagramas, 十翼, traducciones; puente a *I Ching divination* (varas/monedas) |
| https://en.wikipedia.org/wiki/Oracle_bone_script | Oracle bone script (甲骨文) | **Sí** (contexto) | ✅ Activo | Escritura + piromancia; enlaza a **Oracle bone**, scapulimancy/plastromancy; bibliografía **Keightley 1978a/1985**, Qiu, Luo Zhenyu |
| https://en.wikipedia.org/wiki/Chinese_pyromancy | Chinese pyromancy | **Sí** (temática) | ❌ **404** — artículo borrado | Sustitutos: **Oracle bone** (procedimiento completo), **Pyromancy** §China (cita Keightley 1985) |
| https://en.wikipedia.org/wiki/Shang_dynasty | Shang dynasty | **Sí** (contexto) | ✅ Activo | Yinxu, rey como sumo sacerdote/divinador; múltiples citas **Keightley**; corpus óseo |
| https://en.wikipedia.org/wiki/Zhu_Xi | Zhu Xi | No | ✅ Activo | Neo-confucianismo; selector lectura líneas Zhu Xi en app |
| https://en.wikipedia.org/wiki/Richard_Wilhelm_(sinologist) | Richard Wilhelm | No | ✅ Activo | Biografía traductor; no procedimiento óseo |
| https://en.wikipedia.org/wiki/I_Ching_divination | I Ching divination (yarrow) | No | ✅ Activo | **Solo** varas/monedas/dados; tras Shang la piromancia cede al milfoil → hexagramas |
| https://en.wikipedia.org/wiki/Ten_Wings | Ten Wings / Dàzhuàn | No | ✅ Activo | Comentarios clásicos I Ching |
| https://en.wikipedia.org/wiki/Edward_Shaughnessy | Shaughnessy (*Sources of Western Zhou History*, 1993) | No (desalineación) | ✅ Activo | Perfil del académico; la app etiquetaba obra **1993** distinta del Shaughnessy **1996** en bibliografía APA |

**Commit `07f9d35`** también colocaba los tres primeros (I Ching, Oracle bone script, Chinese pyromancy) en el **panel de opciones** con notas explicativas en código — mismo retiro en `fd1ce52`.

### Qué dice Wikipedia sobre procedimiento óseo (relevante al motor app)

Artículo canónico hoy: **Oracle bone** (destino de *Oracle bone script* y sustituto de *Chinese pyromancy*).

| Tema en Wikipedia | Contenido | Paridad con app / Keightley |
|-------------------|-----------|----------------------------|
| Preparación | Perforaciones, sangre, prefacio (fecha + adivino) | ✅ Alineado con Keightley §2 |
| Carga (*charge*) | Tema en positivo/negativo, a veces repetido | ✅ Alineado |
| Calor + grieta 卜 | Intensidad en foso; forma de grieta | ✅ Alineado |
| Interpretación | «How exactly the cracks were interpreted is **not known**» | ⚠️ No respalda taxonomía cerrada |
| Resultado grabado | A veces «auspicious» / «inauspicious»; rey añade *prognostication*; rara *verification* | ⚠️ Binario + grados en texto, **no** 4×4 simétrico jugable |
| Post-Shang | Milfoil (yarrow) + hexagramas sustituyen piromancia inscrita | Coherente con separar huesos vs varas en producto |
| Referencias bibliográficas del artículo | **Keightley 1978a** (pp. 33–35, 40–42, xiii, 185–187), Keightley 2000, Qiu 2000, Chou 1976 | Misma cadena académica que bibliografía `/notes`, **no** motor 4 veredictos |

Artículo **Pyromancy**: menciona huesos chinos; referencia #8 = **Keightley 1985** (*Sources of Shang History* vol. supplementary).

### Matriz Wikipedia → outbound → motor app

| Enlace histórico en `/notes` | Referencias académicas que Wikipedia empuja | ¿Sustenta motor 4 veredictos (吉×2 / 凶×2)? |
|------------------------------|-----------------------------------------------|---------------------------------------------|
| Oracle bone script / Oracle bone | Keightley 1978a, Keightley 2000, Qiu, Wilkinson | **No** — describe ritual real; interpretación grieta explícitamente incierta |
| Chinese pyromancy (roto) | (artículo ausente) | **No** — enlace muerto en versión histórica |
| Shang dynasty | Keightley (múltiple), Fairbank, Xu | **No** — contexto político-religioso |
| I Ching / I Ching divination / Ten Wings / Zhu Xi / Wilhelm | Tradición Zhou posterior | **No** — métodos monedas/varas |
| Edward Shaughnessy | Obras del sinólogo (perfil WP) | **No** — etiqueta app mezclaba obra 1993 no listada en APA actual |

**Conclusión documental:** los Wikipedia históricos **orientaban** al usuario hacia **Keightley vía artículos Oracle bone / Shang**, no hacia un manual de cuatro veredictos. Uno de los tres enlaces «de huesos» (**Chinese pyromancy**) ya **no existe**; restaurarlo sin sustituir por **Oracle bone** dejaría un 404. La cadena Wikipedia → Keightley **coincide** con la bibliografía APA actual; la cadena Wikipedia → motor 4×4 **no** está respaldada en ningún artículo revisado.

---

## 2. Qué afirma la app sobre huesos (puntos a contrastar)

Fuente copy: `notes-page-ui.ts` (sección huesos) + `faq-page-ui.ts` (`oracle-bones-method`).

| Afirmación en docs producto | Ubicación |
|----------------------------|-----------|
| Práctica más antigua documentada de China; calor en hueso/caparazón; lectura de grietas | `/notes` `bonesOriginBody` |
| «Respeta la lógica estructural Shang: carga positiva, carga negativa, veredicto por patrón» | `/notes` |
| Cuatro estados: 吉 claro / 吉 moderado / 凶 moderado / 凶 claro | `/notes` + FAQ |
| FAQ: «fieles al método ancestral Shang» / «faithful to the original Shang tradition» | FAQ todos los locales |
| Guía: lectura sí/no, automático, patrón + veredicto | `/guia` `bonesPracticalBody` |

Nada de lo anterior enlaza a página concreta del libro; el usuario debe ir a la bibliografía al pie de `/notes`.

---

## 3. Bibliografía en `/notes` — qué dice cada obra sobre huesos

Lista canónica: `ACADEMIC_SOURCES` en `packages/i18n/src/messages/notes-page-ui.ts` (misma lista en `00000000-AUD-DIV-01` §8 + Sturgeon/ctext solo en DIV-01, **no** en `/notes`).

### 3.1 Keightley, D. N. (1978). *Sources of Shang History…*

| Campo | Detalle |
|-------|---------|
| **Rol en la app** | Única cita explícita para huesos en bibliografía pública; gold book-primary designado (`AUD-DIV-02` §13, `RPT-DIV-00` §5) |
| **Qué documenta el libro** | Procedimiento Shang real: *命辭* (carga ±), perforación + calor, grieta 卜, **sets** multi-grieta, capas prefacio / carga / prognosticación del rey (王占曰) / verificación; notaciones grabadas mayormente auspiciosas (上吉, 小吉, 大吉, 弘吉); **凶 no epigráfico** en huesos |
| **Qué NO documenta** | Un sorteo único → 4 veredictos simétricos 大吉/吉/凶/大凶; pesos 29.41/23.53…; topología T/X/Y por nivel de veredicto |
| **Uso real en el repo** | Ancla de `AUD-DIV-01` para **eliminar** veredicto «Silencio» (`f462f43`); no verificación book-primary de la taxonomía 4×4 hasta `AUD-DIV-03` |
| **Acceso externo útil** | Internet Archive: https://archive.org/details/sourcesofshanghi0000keig · PDF local gitignored: `tools/source-pdfs/` manifest `keightley` · ISBN 978-0-520-05455-4 |

**Otras obras del mismo autor (no citadas en `/notes`, relevantes al tema):**

| Obra | Aporte |
|------|--------|
| Keightley (1999+) *Ancestral Landscape* / CRM53 | Repite esquema carga → calor → grieta 卜 → rey «lucky/unlucky in varying degrees»; remite a *Sources* §2 para introducción; **no** define motor app |
| Keightley (1999c) citado en notas al CRM | «Diviners' notebooks» — hipótesis, no categoría «silencio» del motor inicial |

### 3.2 Academia Sinica — Instituto de Historia y Filología (IHPH)

| Campo | Detalle |
|-------|---------|
| **Rol en la app** | Citado **junto a Keightley** en `AUD-DIV-01` (>150.000 fragmentos); **no** aparece como entrada separada en `/notes` |
| **Qué es en la práctica** | Custodio del corpus (拓片 ~40.000+); base de datos digital, no manual de adivinación |
| **URLs investigadas (2026-06-25)** | https://ihparchive.ihp.sinica.edu.tw/ihpkmc/ihpkm_op · https://rub.ihp.sinica.edu.tw/~oracle/ · catálogo https://ascdc.digitalarchives.tw/site_3749.html |
| **Qué ofrece** | Búsqueda por 合集, tema (p. ej. 20.卜法), transcripción punctuada, imagen↔texto; referencias a *小屯* 甲/乙/丙编, *铁云藏龟*, etc. |
| **Qué NO es** | Definición de 4 veredictos ponderados ni procedimiento jugable de la app; es **archivo epigráfico** |
| **Hacia dónde «apunta» la cita en DIV-01** | Existencia masiva de inscripciones legibles → argumento anti-«Silencio», no procedimiento completo |

### 3.3 Wilhelm / Baynes (1950)

| Campo | Detalle |
|-------|---------|
| **Rol en `/notes`** | Traducción I Ching; apéndice monedas/varas (`AUD-DIV-02`) |
| **Sobre huesos Shang** | **Nada** en el apéndice de métodos de tirada; el I Ching post-Shang no es piromancia ósea |
| **URLs en `/audits` (no en `/notes`)** | Parma mirror · Princeton edition — **solo fidelidad textos/métodos I Ching** |

### 3.4 James Legge (1882)

| Campo | Detalle |
|-------|---------|
| **Rol en `/notes`** | Traducción filológica I Ching |
| **Sobre huesos** | **No** procedimiento Shang en la obra citada |
| **URL en `/audits`** | https://sacred-texts.com/ich/index.htm — oráculo L, no huesos |

### 3.5 Rutt, R. (1996). *The Book of Changes (Zhouyi): A Bronze Age Document*

| Campo | Detalle |
|-------|---------|
| **Rol en `/notes`** | Contexto Zhou Yi como manual de adivinación real Zhou |
| **Sobre huesos (cap. 1 «Bronze Age China», § divination)** | Shang: plastrón preferido, calor, adivinación antes de sacrificio; **admite** que no se sabe del todo cómo se aplicaba calor a tortuga; distingue **inscripciones óseas** vs **Zhouyi = manual de varas** (yarrow), no taxonomía 4 veredictos app |
| **Relación con app huesos** | **Contexto histórico** (Shang piromancia existió antes del Zhou Yi); **no** origen del motor 4×4 |
| **Acceso** | https://archive.org/details/bookofchangeszho0000unse |

### 3.6 Shaughnessy, E. L. (1996). *I Ching: The Classic of Changes*

| Campo | Detalle |
|-------|---------|
| **Rol en `/notes`** | Traducción/estudio I Ching |
| **Sobre huesos en esta edición 1996** | Enfoque hexagramas; la conexión ósea→Changes es **programática**, no manual procedimental de la app |
| **Obra posterior (no en bibliografía `/notes`)** | *The Origin and Early Development of the Zhou Changes* (Brill, 2019) — cap. 3 «Turtle-Shell Divination», cap. 4 milfoil; **referencia académica más cercana** a procedimiento tortuga **desde la óptica del Zhou Yi**, no del motor app |
| **Otras líneas Shaughnessy** | *Writing Early China* — óseos como inicio de escritura; *Collège de France* lectures — óseos Shang reorientaron estudio del Yijing |

### 3.7 Nielsen, B. (2003). *A Companion to Yi Jing Numerology and Cosmology*

| Campo | Detalle |
|-------|---------|
| **Rol en `/notes`** | Enciclopedia tradición **xiangshu** (imagen/número) del Yijing |
| **Sobre huesos** | Prefacio: descubrimiento óseos 1899; cita **Keightley** como obra estándar en inglés sobre inscripciones; discute **数字卦** (hexagramas numéricos en óseos/bronce) — debate Zhang Zhenglang / Li Xueqin — **puente I Ching ↔ arqueología**, no 4 veredictos 吉/凶 app |
| **Hacia dónde apunta** | Cosmología/numerología **posterior** al Shang; relación controvertida óseos↔hexagramas |

### 3.8 Adler, J. A. (2002). *Introduction to the study of the classic of change*

| Campo | Detalle |
|-------|---------|
| **Rol en `/notes`** | Zhu Xi / Yixue Qimeng — **cero** procedimiento huesos |
| **Relación huesos** | Ninguna directa en la cita producto |

### 3.9 Sturgeon / ctext.org (solo `AUD-DIV-01` §8, no `/notes`)

| Campo | Detalle |
|-------|---------|
| **URL** | https://ctext.org |
| **Sobre huesos** | CTP es corpus pre-Qin/Han; **no** hay sección producto «Shang oracle» equivalente al Zhou Yi verificado en `/audits`; usado en repo para **Zhou Yi** (`/book-of-changes`), no para motor huesos |

---

## 4. `/audits` — enlaces externos y huesos

La guía enlaza a `/audits` en el nav, pero la sección **divination-method** y **oracle-text** documentan **solo I Ching**:

| URL pública en `/audits` | Verifica | ¿Aplica huesos? |
|--------------------------|----------|-----------------|
| http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html | Wilhelm (secundario) | No |
| https://sacred-texts.com/ich/index.htm | Legge (legacy) | No |
| https://ctext.org/book-of-changes | Zhou Yi | No |

**Política documentada:** WF-DOC-03 §5.4 — huesos Keightley **fuera** de `/audits` hasta AU book-primary (`AUD-DIV-03`).

---

## 5. Matriz: afirmación producto ↔ fuente bibliográfica

| Afirmación en guía/notas/FAQ | Keightley | IHPH corpus | Rutt | Shaughnessy | Nielsen | Wilhelm/Legge/Adler |
|------------------------------|-----------|-------------|------|-------------|---------|---------------------|
| Piromancia Shang (calor + grieta) | ✅ | ✅ (registros) | ✅ (contexto) | ⚠️ (vía Zhou Changes, otra obra) | ✅ (historia descubrimiento) | ❌ |
| Carga positiva + negación | ✅ *命辭* ± | ✅ (textos) | ❌ no procedimiento | ❌ | ❌ | ❌ |
| Veredicto por «patrón» único | ⚠️ sets, no 1 sorteo | ❌ | ❌ | ❌ | ❌ | ❌ |
| Exactamente 4 estados 吉/凶 graduados | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 凶 como notación grabada | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| «Método ancestral Shang» (FAQ) | ⚠️ ritual real ≠ motor | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tortuga / buey | ✅ | ✅ | ✅ plastrón | ⚠️ cap. tortuga (2019) | ❌ | ❌ |

Leyenda: ✅ apoya · ⚠️ parcial / distinto matiz · ❌ no trata o contradice

---

## 6. ¿De dónde pudo salir la percepción de «otro autor»?

Tras revisar guía + notas + primeras AUs:

1. **No hay segundo autor citado** para la mecánica 4×4 + pesos + T/X/Y (ver `BRIEF-DIV-04` §11).
2. **Confusión plausible en bibliografía compartida:**
   - **Rutt / Shaughnessy / Nielsen** hablan de **Bronze Age + I Ching + óseos como arqueología**, lo que puede leerse como «respaldan huesos» cuando en realidad respaldan **contexto histórico** o **puente hacia hexagramas**, no el motor.
   - **Wilhelm/Legge** en la misma lista refuerzan sensación de «fuentes académicas» pero son **100 % I Ching**.
3. **Academia Sinica** en DIV-01 suena a «autoridad procedimental»; es **corpus + IHPH**, no Keightley ni otro tratado alternativo.
4. **Diez Alas (十翼)** aparecen en `/notes` solo en la sección **I Ching** (`ichingOriginBody`), no en huesos — no son fuente del método óseo.

---

## 7. URLs de investigación recomendadas (documentación interna)

Para profundizar **sin cambiar producto**:

| Recurso | URL | Uso |
|---------|-----|-----|
| Keightley 1978 (scan) | https://archive.org/details/sourcesofshanghi0000keig | Paridad con PDF local |
| IHPH 甲骨文拓片 | https://ihparchive.ihp.sinica.edu.tw/ihpkmc/ihpkm_op | Textos reales, tema 卜法 |
| Rutt 1996 (scan) | https://archive.org/details/bookofchangeszho0000unse | Cap. 1 Shang + divination |
| Nielsen 2003 (preview) | DOI 10.4324/9780203357927 | Prefacio óseos + 数字卦 |
| Gold procedural parcial | `tools/datasets/keightley/procedural/keightley-procedural-gold.json` | §2.5–2.7 ya extraídos |
| Síntesis operativa | `20260625-BRIEF-DIV-04-keightley-procedural-reference.md` | Ping-pien 8 + §3.7 |

---

## 8. Implicaciones solo documentales (sin remediación)

| Hallazgo | Acción |
|----------|--------|
| Guía/notas no enlazan URLs sobre huesos | Esperado; bibliografía APA sin links by design (`notes-page-ui.ts`) |
| Solo Keightley + corpus IHPH anclan ritual Shang | Coherente con `AUD-DIV-03`; resto de bibliografía es **contexto I Ching** |
| FAQ/notas sobreafirman vs Keightley | Ya marcado `AUD-DIV-03` J — pendiente Fase 2 **si** se pide remediación |
| `/audits` no cubre huesos | By design WF-DOC-03 |
| Posible doc futuro | Añadir URLs opcionales en notas (Keightley + IHPH) — **fuera de alcance** de este brief |

---

## Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-06-25 | §1c: inventario Wikipedia histórico `/notes` (9 URLs, `fd1ce52`); estado jun 2026 + cadena hacia Keightley vs motor 4×4 |
| 2026-06-25 | Enlace a [`20260625-AUD-DIV-04-oracle-bones-product-support.md`](./20260625-AUD-DIV-04-oracle-bones-product-support.md) (matriz respaldo producto) |
| 2026-06-25 | §1b: sección histórica `/notes` ichingDataAudit (sacred-texts, ctext, Parma) → migrada a `/audits`; huesos nunca tuvo URLs |
| 2026-06-25 | Creación: trazabilidad guía/notas/FAQ → bibliografía → fuentes externas investigadas |
