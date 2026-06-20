# Selector de reglas de lectura de líneas cambiantes (Huang | Zhu Xi) — Plan + Auditoría

**Feature:** selector de UI para elegir entre el sistema de reducción de Alfred Huang (actual,
default) y las reglas clásicas de Zhu Xi para casos de 2/3/4 líneas cambiantes.
**Fecha auditoría:** 20 jun 2026 · **Autor del plan/patches:** Claude Opus 4.8 (sesión previa) ·
**Auditor:** Claude Sonnet 4.6 · **Estado:** Plan + 3 patches entregados y **auditados contra el
código real del repo** (no en aislado). Pendiente de implementación — esta feature NO está
aplicada todavía.

---

## Parte 1 — Plan original (Claude Opus 4.8)

> Reproducido tal como se entregó, sin editar. Contexto: alineado con la corrección Huang/Zhu Xi
> ya mergeada en `main` (commit `8c6d311`, ver [`MUTATION_RULES_HUANG_ALIGNMENT_AUDIT_2026-06-19.md`](MUTATION_RULES_HUANG_ALIGNMENT_AUDIT_2026-06-19.md)).

### 0. Recomendación: ¿patch o instrucciones?

**Híbrido, no un patch monolítico.** Esta feature cruza 8 capas: motor, prompt, validador de
gates, UI mobile + web, i18n (11 idiomas), estado, persistencia (DB) y tests. Las partes
delicadas son los casos de Zhu Xi que leen **dos textos** (2 líneas = ambas; 3 líneas = ambos
juicios), porque tocan los gates de calidad (H1 fingerprint, H3 anti-fabricación) que hoy asumen
una sola línea citada.

Propuesta:
- **El núcleo del motor** (tipos + módulo `zhuxi.ts` + dispatcher) entregado como **código listo**
  (`patch-zhuxi-selector-core.patch`).
- **El cableado** (route, prompt, validador, UI, i18n, DB, tests) va como **spec ejecutable** con
  puntos de integración exactos.

Rama sugerida: `feat/line-reading-system-selector`.

### 1. Las reglas de Zhu Xi (fuente primaria)

**Fuente:** Zhu Xi (朱熹), *Yixue Qimeng* (易學啟蒙, 1186), cap. 4 "明蓍策", traducción de Joseph
Adler + exposición de Yijing Dao (biroco.com).

| Cambian | Zhu Xi lee | Énfasis / nota |
|---------|------------|----------------|
| 0 | Juicio (卦辞) del primario | — |
| 1 | La línea cambiante | Las líneas priman sobre el Juicio si contradicen |
| 2 | **AMBAS** líneas cambiantes | La **superior** es primaria |
| 3 | Los **JUICIOS de AMBOS** hexagramas (NO líneas) | Regla de los 32 diagramas; equivalente de Ed Hacker: si la línea inferior (pos 1) está entre las tres cambiantes → prima el **primario**; si no → prima el **transformado** |
| 4 | Las **DOS** líneas estables del transformado | La **inferior** es primaria |
| 5 | La única línea estable del transformado | — |
| 6 (no Qian/Kun) | Juicio del transformado | — |
| 6 Qian/Kun | 用九/用六 | idéntico a Huang |

Contraste con Huang: las únicas divergencias reales son en 2, 3 y 4 líneas.

### 2. Diseño — representación sin ambigüedad

`TextsForClaude.selectedLineTexts` es un array, así que puede llevar varias entradas. Se añaden
dos marcadores:
1. `emphasis?: "primary" | "secondary"` en cada entrada de `selectedLineTexts`.
2. `judgmentEmphasis?: "primary" | "transformed" | null` en `TextsForClaude` (caso de 3 líneas).

### 3. Código del núcleo del motor

- `types.ts`: `LineReadingSystem`, `ZhuXiMutationRule`, `AnyMutationRule`, `emphasis`,
  `judgmentEmphasis`, `CastResult.lineReadingSystem`.
- `rules/zhuxi.ts` (módulo separado, sin tocar las reglas Huang en `engine.ts`):
  `determineMutationRuleZhuXi` + `selectTextsZhuXi`.
- `engine.ts`: dispatcher `selectTextsForClaude(..., system="huang")` con bifurcación antes del
  `switch` Huang; threading de `system` en `PerformCastOptions`/`buildCastResultFromLines`.

### 4. Cableado backend

1. **Request body** (`route.ts`): leer `body.ichingLineReadingSystem`, validar
   `=== "zhuxi" ? "zhuxi" : "huang"` (default huang).
2. **Persistencia:** migración que añade `line_reading_system text not null default 'huang'` a
   `consultations`.
3. **Tipos de regla:** ampliar `INTERNAL_RULE_CODES` (`interpretation-output-validator.ts`) y la
   regex de `response-clean.ts` con los 7 códigos `ZX_*`.
4. **Prompt** (`interpretation.ts`): presentar líneas múltiples con `emphasis`; presentar
   `judgmentEmphasis` sin texto de línea.
5. **Validador de gates:** ajustar H1/H3 para tolerar hasta 2 líneas citadas en
   ZX_TWO_UPPER/ZX_FOUR_LOWER, y validar contra juicios (no líneas) en ZX_THREE_JUDGMENTS. *"Esta
   es la parte más delicada: implementar con tests antes de exponer en UI."*

### 5. UI — el selector

Replicar el patrón del selector **Método** (Tres Monedas / Varillas). Ubicación: panel de
consulta I Ching, debajo de "Ejecución", solo visible en modo I Ching. Estado
`lineReadingSystem: "huang" | "zhuxi"`, default `"huang"`, enviado como
`body.ichingLineReadingSystem`. Mobile + web.

### 6. i18n (11 idiomas)

Claves nuevas: `consult.lineReadingSystem.{label,huang,zhuxi,help}` + rótulos de las 7 reglas
`ZX_*` en `iching-mutation-ui.ts`.

### 7. Tests del motor

Uno por regla Zhu Xi (`ZX_TWO_UPPER`, `ZX_THREE_JUDGMENTS` ramas A/B, `ZX_FOUR_LOWER`,
`ZX_FIVE_ONLY`, `ZX_SIX_TRANSFORMED`, `QIAN/KUN`) + test de dispatcher (mismo casteo,
`system:"huang"` vs `"zhuxi"`, default no cambia comportamiento existente).

### 8. Rama, rollout y no-regresión

- **Default = `huang`**: comportamiento actual no cambia para nadie; selector aditivo y opt-in.
- Orden: (1) tipos + `rules/zhuxi.ts` + dispatcher + tests motor → (2) route param + persistencia
  + validador/regex → (3) prompt (2-líneas y 3-juicios) + ajuste de gates + tests de gates →
  (4) UI selector (mobile+web) + i18n es/en → (5) i18n restantes + barrido QA con
  `system:"zhuxi"`.

### Resumen de riesgo por capa (plan original)

| Capa | Acción | Riesgo (según el plan) |
|------|--------|--------|
| Motor (tipos + zhuxi.ts + dispatcher) | Código listo | Bajo |
| Route + persistencia | Param + migración + constantes | Bajo |
| Prompt | Presentar 2 líneas / 2 juicios con énfasis | Medio |
| Validador de gates | Permitir multi-texto en ZX | **Alto** |
| UI selector | Espejar "Método" en mobile+web | Bajo-medio |
| i18n | Claves nuevas en 11 idiomas | Bajo |
| Tests | Uno por regla ZX + dispatcher | Bajo |

### Entregables de la sesión posterior (3 patches + guía)

1. **`patch-zhuxi-selector-core.patch`** — motor + prompt + validador + tests. Tipos
   `LineReadingSystem`/`ZhuXiMutationRule`/`AnyMutationRule`/`emphasis`/`judgmentEmphasis`;
   `rules/zhuxi.ts`; dispatcher en `engine.ts`; render de `emphasis` y rama `JUDGMENT_EMPHASIS` en
   `interpretation.ts`; códigos `ZX_*` en `interpretation-output-validator.ts` y
   `response-clean.ts`; `engine.zhuxi.test.ts`.
2. **`patch-zhuxi-route.patch`** — 8 líneas en `route.ts`: tipo de body
   `ichingLineReadingSystem?`, `resolvedLineReadingSystem` (default huang), pasado a las 3
   llamadas de casteo. *"Con esto el motor ya recibe la elección del usuario... No toca
   persistencia ni DB: cero riesgo de romper consultas."*
3. **`074_line_reading_system.sql`** (persistencia, **opcional v1.1**) — columna
   `consultations.line_reading_system` + `persist_consultation_with_content` recreada con
   `p_line_reading_system text DEFAULT 'huang'` al final. **Hazard de orden señalado en rojo:**
   *"la migración 3a DEBE aplicarse ANTES que el cambio de session-store (3b). Si el mapper pasa
   `p_line_reading_system` y la RPC aún no lo declara, Supabase falla con 'no function matches' y
   rompe todas las consultas."* Incluye 3 ediciones puntuales propuestas para
   `session-store.ts` (tipo, llamada RPC, readback) y 8 sitios en `route.ts` para anotar
   `lineReadingSystem` en los objetos de persistencia.

Lo que el plan deja explícitamente para un incremento posterior (no en estos patches): selector
de UI, i18n de las 7 reglas `ZX_*` en 11 idiomas, actualización del FAQ.

---

## Parte 2 — Auditoría (Claude Sonnet 4.6)

**Método:** no se auditó el patch en aislado. Cada archivo tocado se leyó en su estado real
actual del repo, se comparó carácter a carácter contra el `old_string` de cada diff, y se
rastrearon los consumidores reales de cada campo nuevo (UI, prompt, DB, contexto de IA) para
encontrar efectos de segundo orden que el plan no podía ver sin ejecutar ese rastreo.

Orden: el mismo orden de severidad ya presentado en la sesión de auditoría. Cada hallazgo lleva
**Problema** (evidencia, archivo:línea) y **Propuesta de implementación**.

### 🔴 CRÍTICO — bloqueante antes de exponer la API, incluso con default `huang`

#### Hallazgo 1 — Fuga de código interno `ZX_*` al usuario en una tarjeta NO-debug

**Problema:** `apps/web/src/components/ConsultationRecordCard.tsx:127-129` renderiza
`getIchingMutationRuleLabel(ruleLocale, mutationRule)` en una fila visible ("Regla") de la
tarjeta normal de resumen de consulta (sin flag de debug). `getIchingMutationRuleLabel`
(`packages/i18n/src/messages/iching-mutation-ui.ts`) hace
`if (rule in map) return map[rule]; return rule;` — y el mapa `BY_LOCALE`/
`ICHING_MUTATION_RULE_IDS` no tiene ninguna entrada `ZX_*`. En cuanto `route.ts` persista/devuelva
`castResult.mutationRule = "ZX_THREE_JUDGMENTS"` (basta con que un caller —curl, una versión
mobile desfasada, un toggle de QA— mande `ichingLineReadingSystem:"zhuxi"`), la tarjeta imprime
literalmente el código interno al usuario. Confirmé que `castResult.mutationRule` llega a esa
tarjeta sin filtro desde 12+ sitios de `route.ts` (líneas 1228, 1301, 1382, 1482, 1509, 1533,
1667, 1728, 1755, 1777).

El plan afirma que `patch-zhuxi-route.patch` "funciona end-to-end y no puede romper consultas" —
cierto para crashes, falso para esta fuga: no rompe nada, pero expone jerga interna en
producción.

**Propuesta de implementación:** no mergear `patch-zhuxi-route.patch` de forma aislada. Antes (o
en el mismo commit), añadir las 7 etiquetas `ZX_*` a `ICHING_MUTATION_RULE_IDS`/`BY_LOCALE` en
`iching-mutation-ui.ts` — mínimo EN/ES para destrabar, resto de locales en el mismo barrido i18n
que ya se hizo para el FAQ/guía. Alternativa más conservadora: gatear `ichingLineReadingSystem`
tras un flag interno (admin/staff) hasta que UI + i18n estén listos, para que el parámetro no sea
alcanzable por tráfico real antes de eso.

(Nota menor relacionada, severidad baja: el evento SSE `cast_ready` en `route.ts:1228` también
manda `mutationRule` crudo al cliente. Confirmé que el único render visible de eso —
`lastRitualDebugSnapshot.mutationRule`, `page.tsx:5168`— está detrás de `ritualDebugEnabled`,
debug-only. El código va igual en el payload de red, inspeccionable vía devtools, pero no se
renderiza a usuarios normales. No requiere acción inmediata, solo queda anotado.)

#### Hallazgo 2 — El prompt da instrucciones contradictorias para `ZX_THREE_JUDGMENTS`, violando su propia regla anti-repetición

**Problema:** `backend/claude/src/interpretation.ts:300` (sección no tocada por el patch) ya
ordena, siempre que exista hexagrama transformado, en *"El trazado hacia..." / "The turning
pattern"*:
> "quote transformed judgment and image if supplied, then tension / opportunity vs primary"

El patch añade en *"Líneas en movimiento"* (cláusula `(d)` de la línea 299 parcheada):
> "lead with the indicated hexagram's Judgment and treat the other hexagram's Judgment as
> counterpoint"

Para `ZX_THREE_JUDGMENTS`, `transformed` siempre existe (3 líneas cambiantes → siempre hay
hexagrama transformado), así que ambas secciones se activan a la vez, pidiendo lo mismo: citar y
contrastar Juicio primario vs. transformado. La línea 301 del mismo archivo dice explícitamente
`"ANTI-REPETITION across sections as in global rules."` — instrucción que ahora se contradice a
sí misma para este caso: o el modelo repite la cita del Juicio en dos secciones (viola
anti-repetición), o omite una de las dos (incumple un requisito "mandatory"). Ningún patch ni el
plan original menciona este choque — es un efecto de segundo orden que solo aparece al rastrear
las dos secciones del prompt juntas para el caso de 3 líneas específicamente.

**Propuesta de implementación:** decisión de diseño explícita (pendiente de tu criterio) entre
dos opciones:
- (a) Cuando `judgmentEmphasis` está presente, la sección "turning pattern" se recorta a una
  frase de transición (sin re-citar el Juicio, que ya quedó citado en "Líneas en movimiento") —
  cambio en la condición de la línea 300 (`${tr ? ... : ...}`) para añadir un tercer caso
  `judgmentEmphasis`-aware.
- (b) "Líneas en movimiento" no cita el Juicio transformado en absoluto para este caso —solo
  anuncia cuál hexagrama prima y por qué—, dejando la cita literal completa exclusivamente a
  "turning pattern" (que ya está diseñada para citar judgment+image con contraste).
Recomiendo (b): es el cambio más acotado (no toca la sección ya existente y probada de "turning
pattern"), y mantiene "Líneas en movimiento" enfocada en la mecánica de selección de qué se lee,
como ya hace para los demás casos Huang.

### 🟠 ALTO — antes de pasar a la fase de persistencia/UI

#### Hallazgo 3 — `emphasis` solo se parcheó en 1 de 3 plantillas de render de línea idénticas

**Problema:** el patch toca solo el bloque `INTERPRETED_LINES` (`interpretation.ts` ~433-436).
Existen otras dos copias casi idénticas del mismo template
`` `  Line ${l.position} [${l.fromHexagram === "primary" ? "primary" : "transformed"}]: ${l.text}` ``
que el patch no tocó:
- `lineBlock` (`interpretation.ts:246`) — bloque "LINE TEXTS:" del modo de un solo traductor.
- `leggeLines`/`zhouyiLines` (`interpretation.ts:315` y `322`) — bloques Legge/Zhou Yi en modo
  Master.

Verifiqué que `attachMasterTraditions` (`engine.ts`) sí propaga `emphasis` a
`leggeSelectedLineTexts`/`zhouyiSelectedLineTexts` (hace spread de `...lineText`), pero el render
de esos arrays nunca lee `l.emphasis`. Resultado concreto: en **Master Combined + Zhu Xi + caso
de 2 o 4 líneas**, el bloque Wilhelm queda etiquetado `[primary]`/`[secondary]` y los bloques
Legge/Zhou Yi muestran las mismas dos líneas sin etiqueta — inconsistencia entre tradiciones
dentro del mismo prompt. En modo de un solo traductor, el "LINE TEXTS:" crudo (duplicado de
`INTERPRETED_LINES`) tampoco lleva la marca.

**Propuesta de implementación:** aplicar el mismo cambio
(`` `, ${l.emphasis}` `` condicional) a las 3 ubicaciones, no solo a `INTERPRETED_LINES`. Dado que
ya hay 3+ copias literales del mismo template en el archivo, vale la pena extraer un helper
`formatLineEntry(l)` usado por las 3 (reduce duplicación real, no es abstracción prematura — ya
existe la duplicación, la estamos consolidando).

#### Hallazgo 4 — La vista previa de casteo manual nunca conocerá el sistema elegido

**Problema:** `packages/iching-engine/src/engine.ts` → `previewCastFromLineValues` (no tocada por
ningún patch) siempre llama `determineMutationRule` (Huang puro), sin parámetro `system`.
Confirmé que esto alimenta una tarjeta visible al usuario:
`apps/web/src/app/page.tsx:3497-3555` → `manualCastPreview.mutationRule` →
`apps/web/src/app/page.tsx:4943` → `ConsultationRecordCard` (la tarjeta que se muestra mientras
`loading=true`, antes de que llegue la interpretación real). Cuando exista el selector de UI: un
usuario que elige Zhu Xi y hace una tirada manual de 4 líneas cambiantes verá en la vista previa
"regla Huang (superior estable)" y luego la interpretación real seguirá Zhu Xi (inferior, dos
líneas) — vista previa y resultado real desalineados. Ninguno de los 3 documentos entregados
menciona esta función.

**Propuesta de implementación:** añadir parámetro `system: LineReadingSystem = "huang"` a
`previewCastFromLineValues`, threadearlo hacia `determineMutationRule`/`determineMutationRuleZhuXi`
igual que en `buildCastResultFromLines`, y pasar el `lineReadingSystem` del estado de UI en la
llamada de `page.tsx:3497`.

### 🟡 MEDIO — gaps en la persistencia opcional (v1.1), no bloquean el core

#### Hallazgo 5 — Las "3 ediciones exactas" de `session-store.ts` están incompletas: el campo persistido nunca se leería de vuelta

**Problema:** verificado el mapper completo en `apps/web/src/lib/session-store.ts`. Faltan dos
cosas que la guía no menciona:
- Extender el tipo de fila de `consultationMetaFromDbRow` (líneas 483-505) con
  `line_reading_system?: string | null;` — sin esto, `tsc` falla al referenciar
  `data.line_reading_system`.
- Más importante: existen **4 constantes de columnas SELECT** (`META_COLS_LEGACY`,
  `META_COLS_BASE`, `META_COLS_WITH_ORACLE_LEGACY`, `META_COLS_WITH_ORACLE`, líneas 475-479) con
  una cadena de fallback en cascada (líneas 560-610) que detecta por substring del mensaje de
  error qué columnas existen aún en la DB — el mismo patrón usado históricamente para el rollout
  de `translator`/`oracle_type`. La guía no toca esto. Si no se añade `line_reading_system` a esas
  constantes, la columna se persiste bien pero **jamás se vuelve a leer**:
  `data.line_reading_system` siempre será `undefined`, y
  `lineReadingSystem: data.line_reading_system ?? "huang"` caerá siempre en `"huang"` en el
  historial, aunque la fila real diga `'zhuxi'`. Bug silencioso de exactitud histórica, no
  detectable por `tsc` ni por una prueba superficial (la consulta "funciona", solo el historial
  mostrado queda mal etiquetado).

**Propuesta de implementación:** añadir `line_reading_system` a `META_COLS_BASE` y
`META_COLS_WITH_ORACLE` (las variantes que ya incluyen `translator`); decidir si se necesita un
nuevo tier `_LEGACY` para staging-lag (mismo patrón que `translator`) o si, dado que la migración
074 añade la columna con `DEFAULT` en el mismo release que el código, ese tier extra es
innecesario porque la columna **siempre** existirá para cuando el código nuevo se ejecute (a
diferencia de `translator`/`oracle_type`, que se añadieron en momentos distintos al código que
los leía). Recomiendo la segunda opción (sin tier `_LEGACY` nuevo) si se respeta estrictamente el
orden migración→código del hallazgo 6.

#### Hallazgo 6 — El "hazard de orden" señalado en rojo está sobredimensionado

**Problema:** ya existe un fallback genérico en `session-store.ts:293-334` que detecta "función
RPC no encontrada" (por substring del mensaje de error) y degrada a un `insert()` directo a la
tabla vía `consultationBasePayload`, que es independiente de la RPC y no referencia el campo
nuevo. Si la migración 074 aún no corrió y el código ya manda `p_line_reading_system`, lo más
probable es que ese fallback amortigüe el golpe (degradando a `'huang'` por el DEFAULT de la
columna, silenciosamente) en vez de "romper TODAS las consultas" como afirma la guía
(`GUIA_auditoria_selector-zhuxi.md`, sección 3).

**Propuesta de implementación:** mantener la recomendación de aplicar la migración primero (buena
práctica, no depender de un fallback incidental no diseñado para esto), pero corregir el texto de
la guía para no sobredimensionar el riesgo, y — más útil — instrumentar este fallback con un log
(`log.warn("persist_rpc_fallback_engaged", {...})`) para que si el orden se rompe alguna vez, se
detecte por alertas en vez de quedar como degradación silenciosa indefinida.

#### Hallazgo 7 — Falta la entrada en `verify_migrations.sql`

**Problema:** confirmado que `backend/db/migrations/verify_migrations.sql` no tiene check para
`074` — viola la convención obligatoria del proyecto (memoria del proyecto
`feedback_verify_migrations.md`: cada migración nueva debe incluir su check en el mismo commit).

**Propuesta de implementación:** añadir bloque `UNION ALL` siguiendo el patrón de `073`:
```sql
UNION ALL
-- 074 · line_reading_system column + persist_consultation_with_content param
SELECT '074', 'line_reading_system column on consultations + RPC has p_line_reading_system param',
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='consultations' AND column_name='line_reading_system')
  AND EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='persist_consultation_with_content' AND p.pronargs = 24
  )
```

#### Hallazgo 8 — Deuda de tipos en `context-engine` (inofensiva hoy, trampa a futuro)

**Problema:** `packages/context-engine/src/index.ts:25` declara
`mutationRule: MutationRule | "ORACLE_BONES"` (no `AnyMutationRule`), y las líneas 123-125 lo
fuerzan con `as MutationRule | "ORACLE_BONES"` — un cast que miente de tipo si algún día ahí
dentro hay un código `ZX_*`. Rastreé el consumo completo en
`backend/claude/src/interpretation-context.ts` (`buildHistoricalContext`/`buildCurrentContext`/
`buildV2HistoricalUserBlock`) y confirmé que `.mutationRule` **nunca se serializa al prompt** —
es un campo muerto para ese propósito, así que hoy es inofensivo. Pero el `as` esconde el hueco
de tipos sin que `tsc` lo detecte.

**Propuesta de implementación:** cuando se toque este archivo (no urgente, no bloqueante), cambiar
el tipo a `AnyMutationRule | "ORACLE_BONES"` y quitar el `as` forzado, dejando que TS verifique
genuinamente la asignación.

### 🟢 BAJO / housekeeping

#### Hallazgo 9 — Llamada duplicada a `determineMutationRuleZhuXi`

**Problema:** `buildCastResultFromLines` calcula `determineMutationRuleZhuXi` una vez para
`rule: AnyMutationRule`, y `selectTextsForClaude` la vuelve a calcular internamente en su rama
`system === "zhuxi"` (ignora el parámetro `rule` recibido y recalcula `zxRule` desde cero).
Cosmético, cero impacto funcional — solo trabajo duplicado en cada cast con `system: "zhuxi"`.

**Propuesta de implementación:** pasar el `zxRule` ya calculado como argumento opcional, o aceptar
la duplicación (es barata: un `switch` sobre `changing.length`). No urgente.

---

## Lo que sí está sólido (verificado, no asumido)

- La rama `system==="zhuxi"` se bifurca **antes** del `switch` en `selectTextsForClaude`, así que
  el camino Huang queda 100% intacto — confirmado línea por línea contra `engine.ts` real.
- Los gates **H1, H1b, H3, H5** (`interpretation-output-validator.ts`,
  `interpretation-line-gate.ts`) generalizan correctamente a multi-línea sin necesitar cambios
  (iteran por array), incluyendo el caso `ZX_FOUR_LOWER`, que se comporta como el
  `FOUR_LOWEST_STABLE` de Huang ya en producción (mismo patrón "omitted = todas las posiciones
  cambiantes, solo se citan estables").
- La firma `DROP FUNCTION` de `074_line_reading_system.sql` coincide **carácter por carácter** con
  la firma real vigente de `persist_consultation_with_content` (verificada contra
  `068_sync_content_never_null_wipe.sql`, 23 parámetros) — la migración apunta a la función
  correcta, y el parámetro nuevo, al ir al final con `DEFAULT`, es compatible con la llamada real
  (confirmado: `session-store.ts` llama por parámetros nombrados vía PostgREST, no
  posicionalmente).
- `body = (await req.json()) as typeof body` en `route.ts:454` no usa Zod estricto — añadir el
  campo nuevo no rompe compatibilidad hacia atrás ni hacia adelante, y el check `=== "zhuxi"`
  estricto en el route patch es la barrera de seguridad real (cualquier valor inesperado cae a
  `huang`).

---

## Orden recomendado para resolver

1. **Hallazgo 2** (contradicción de prompt en `ZX_THREE_JUDGMENTS`) — decisión de diseño primero,
   no de código.
2. **Hallazgo 3** (`emphasis` en las 2 plantillas restantes) — mecánico, bajo riesgo.
3. **Hallazgo 1** (etiquetas `ZX_*` en `iching-mutation-ui.ts`, mínimo EN/ES) — antes de mergear
   `patch-zhuxi-route.patch` a una rama con tráfico real.
4. **Hallazgo 4** (`previewCastFromLineValues` con `system`).
5. **Hallazgos 5, 6, 7** (persistencia completa + `verify_migrations.sql`) — como unidad atómica,
   tal como ya estaba planeado, pero con el mapper de lectura completo esta vez.
6. **Hallazgo 8 y 9** — housekeeping, sin urgencia.
