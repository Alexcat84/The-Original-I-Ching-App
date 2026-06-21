# Selector de reglas de lectura de líneas cambiantes (Huang | Zhu Xi) — Plan + Auditoría

**Feature:** selector de UI para elegir entre el sistema de reducción de Alfred Huang (actual,
default) y las reglas clásicas de Zhu Xi para casos de 2/3/4 líneas cambiantes.
**Fecha auditoría:** 20 jun 2026 · **Autor del plan/patches:** Claude Opus 4.8 (sesión previa) ·
**Auditor:** Claude Sonnet 4.6 · **Re-auditoría + remediación:** Claude Opus 4.8 (ver Parte 4) ·
**Estado:** Plan + 3 patches entregados y **auditados contra el código real del repo** (no en
aislado), **implementados en 5 commits** (ver Parte 3) y posteriormente **re-auditados contra
código + tests + `tsc` en vivo**, detectando 1 hallazgo HIGH nuevo (H10) + 2 menores (H11/H12)
ya **remediados** (ver Parte 4). Pendiente: aplicar la migración 074 en Supabase, correr la QA
con la API real, y mergear la rama a `staging`/`main`.

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

---

## Parte 3 — Implementación realizada (20 jun 2026, post-auditoría)

**Rama:** `feat/line-reading-system-selector` (creada desde `staging`, NO mergeada todavía —
ni a `staging` ni a `main`, ni pusheada a `origin`). **Autor del código:** Claude Sonnet 4.6, en
5 commits secuenciales que siguen el orden de severidad recomendado arriba. **Estado de cada
hallazgo de la Parte 2 al cierre de esta sesión:** todos los 9 resueltos salvo la decisión de
diseño del Hallazgo 2, que se resolvió eligiendo la opción **(b)** propuesta en la auditoría.

### Fase 1 — `f698848` — núcleo del motor + prompt + route (H1, H2, H3, H4)

Implementa el core funcional **con los fixes de H1-H4 ya incorporados desde el primer commit**,
no como parches posteriores:

- **`packages/iching-engine`**: tipos `LineReadingSystem`/`ZhuXiMutationRule`/`AnyMutationRule`
  en `types.ts`; módulo nuevo `rules/zhuxi.ts` (154 líneas — las 7 reglas de Zhu Xi, *Yixue
  Qimeng* cap. 4 + el equivalente de Ed Hacker para el caso de 3 líneas); dispatcher en
  `selectTextsForClaude` (`engine.ts`) que bifurca **antes** del `switch` Huang existente — cero
  cambio de comportamiento para callers existentes, default `"huang"`.
- **Hallazgo 4 resuelto**: `previewCastFromLineValues` (`engine.ts:395-411`) ahora recibe
  `system: LineReadingSystem = "huang"` como segundo parámetro y lo threadea a
  `determineMutationRuleZhuXi` cuando corresponde. Confirmado que `page.tsx:3522` pasa
  `ichingLineReadingSystem` en la llamada real — la vista previa de casteo manual ya no puede
  desalinearse del resultado real.
- **Hallazgo 3 resuelto**: extraída `formatLineEntry()` (`interpretation.ts:215`) y reutilizada en
  las 3 plantillas de render de línea (`INTERPRETED_LINES`, `lineBlock` de un solo traductor,
  `leggeLines`/`zhouyiLines` de Master) — el marcador `emphasis` ahora es consistente entre
  Wilhelm/Legge/Zhou Yi en Master Combined, ya no solo en una de las tres copias.
- **Hallazgo 2 resuelto, opción (b)**: la sección "Líneas en movimiento" para
  `ZX_THREE_JUDGMENTS` ya **no** re-cita el Juicio transformado completo — solo anuncia cuál
  hexagrama prima y por qué; la cita literal con contraste queda exclusivamente en la sección
  "turning pattern" ya existente, eliminando la contradicción de anti-repetición señalada en el
  Hallazgo 2.
- **Hallazgo 1 resuelto**: las 7 etiquetas `ZX_*` (`ZX_TWO_UPPER`, `ZX_THREE_JUDGMENTS`,
  `ZX_FOUR_LOWER`, `ZX_FIVE_ONLY`, `ZX_SIX_TRANSFORMED`, y las 2 de Qian/Kun) agregadas a
  `ICHING_MUTATION_RULE_IDS`/`BY_LOCALE` en `packages/i18n/src/messages/iching-mutation-ui.ts`
  para **las 11 locales** (no solo EN/ES como sugería la propuesta mínima) — cierra la fuga de
  código interno a `ConsultationRecordCard` antes de que el parámetro de route fuera alcanzable.
- **Route** (`apps/web/src/app/api/consult/route.ts`): parsea `body.ichingLineReadingSystem`,
  valida estrictamente `=== "zhuxi" ? "zhuxi" : "huang"` (cualquier valor inesperado cae a
  `"huang"`), threadeado a los 3 sitios de casteo.
- **Tests**: 37 nuevos casos en `engine.line-reading-systems.test.ts` (264 líneas — cobertura
  completa de líneas cambiantes × ambos sistemas + matriz de divergencia Huang/Zhu Xi +
  propagación de `emphasis` en `master_combined`). Más `scripts/line-reading-system-qa.mjs` (236
  líneas, harness de QA contra la API real de Claude) — **deliberadamente no ejecutado**, consume
  tokens reales; queda pendiente para que el usuario lo corra cuando lo decida.
- Diferido explícitamente a fases siguientes (documentado, no abandonado en silencio):
  persistencia en DB, selector de UI, y la prosa de FAQ/guía para las 11 locales.

### Fase 2 — `c15a073` — persistencia end-to-end en DB (H5, H6, H7)

Cierra el hueco de que la Fase 1 calculaba y usaba el sistema Huang/Zhu Xi por request pero
**nunca lo persistía** — recarga/historial reportaría siempre `"huang"` sin importar cuál se usó
de verdad:

- **`074_line_reading_system.sql`** (150 líneas): agrega `consultations.line_reading_system`
  (`NOT NULL DEFAULT 'huang'`, `CHECK IN ('huang','zhuxi')`). Como agregar un 24º parámetro a
  `persist_consultation_with_content` crearía una segunda función sobrecargada en vez de
  reemplazarla, la migración hace `DROP FUNCTION` explícito de la firma exacta de 23 argumentos
  (verificada carácter por carácter contra `069_drop_consultations_legacy_toast_columns.sql`)
  antes de recrearla con `p_line_reading_system text DEFAULT 'huang'` al final.
- **Hallazgo 7 resuelto**: bloque `UNION ALL` para `'074'` agregado a `verify_migrations.sql`
  (verifica existencia de columna + que la RPC tenga 24 parámetros) — confirmado presente en
  `backend/db/migrations/verify_migrations.sql:452`.
- **Hallazgo 5 resuelto**: `session-store.ts` — `StoredConsultation.lineReadingSystem` threadeado
  por el payload de la RPC, el fallback de insert directo, **y** el mapper de lectura
  (`META_COLS_BASE`/`META_COLS_WITH_ORACLE` — sin nuevo tier `_LEGACY`, siguiendo la
  recomendación del Hallazgo 6 porque la migración 074 se libera en el mismo release que este
  código). Sin este cambio el campo se habría persistido pero nunca vuelto a leer.
- **Hallazgo 6 resuelto** (instrumentación, no solo corrección de texto): el fallback de "RPC no
  encontrada" ahora emite `log.warn("persist_rpc_fallback_engaged", ...)` (confirmado en
  `session-store.ts:305`) — si el orden migración→código se rompe alguna vez, se detecta por
  alertas en vez de degradar en silencio a `'huang'`.
- **route.ts**: los 2 sitios reales (no oráculo de huesos) de
  `upsertSessionAndConsultation` pasan el `lineReadingSystem` ya resuelto.
- Verificado: `tsc --noEmit` limpio en `apps/web`. **⚠️ Migración 074 NO aplicada todavía a
  ningún proyecto Supabase** (ni staging ni producción) — debe aplicarse antes de que este código
  llegue a un entorno con tráfico real, siguiendo la convención del proyecto (staging primero;
  ver regla "066 sin 068 PROHIBIDA" en `CLAUDE.md` como precedente de por qué el orden
  migración→código importa aquí también).

### Fase 3 — `3a8ba78` — housekeeping (H8, H9)

Dos ítems de severidad baja, cero impacto funcional, diferidos de las fases 1/2 por no ser
urgentes:

- **Hallazgo 8 resuelto**: `ConsultationSummary.mutationRule` en
  `packages/context-engine/src/index.ts` cambiado de `MutationRule | "ORACLE_BONES"` a
  `AnyMutationRule | "ORACLE_BONES"` (confirmado línea 25) — ya no hay un `as` que mienta sobre
  la imposibilidad de códigos `ZX_*`. Confirmado además que `.mutationRule` nunca se serializa al
  prompt (campo muerto para ese propósito), por lo que el hueco de tipos era inofensivo hoy pero
  ya no esconde el riesgo a futuro.
- **Hallazgo 9 resuelto**: `selectTextsForClaude` ahora acepta un parámetro opcional
  `precomputedZhuXiRule?: ZhuXiMutationRule` (`engine.ts:114`); cuando se pasa, usa
  `precomputedZhuXiRule ?? determineMutationRuleZhuXi(...)` (línea 188) en vez de recalcular
  siempre desde cero. `buildCastResultFromLines` (el call path de producción) ya calculaba el
  mismo valor una línea antes y ahora lo reutiliza; callers que no lo pasan (p. ej. el helper
  `cast()` del test suite) conservan el comportamiento previo exacto.
- Verificado: 113/113 tests de `vitest` pasando en `iching-engine`; `tsc --noEmit` limpio en
  `iching-engine`, `context-engine`, `backend/claude` y `apps/web` (cada paquete reconstruido a
  `dist` antes de chequear sus dependientes).

### Fase 4 — `4eef2ca` — selector de UI (Huang/Zhu Xi)

Completa la fase de UI de la auditoría, replicando el patrón ya existente del toggle "Método"
(Tres Monedas / Varillas):

- Nuevo bloque `cast-selector-block` en el panel de consulta I Ching, ubicado debajo de
  "Ejecución", visible solo en modo I Ching (mismo nivel de anidamiento condicional que el bloque
  de modo de casteo — confirmado en la Fase 5 que ambos están dentro del mismo
  `oracleMode === "iching" ? (<>...</>) : null`).
- Estado `lineReadingSystem: "huang" | "zhuxi"` (default `"huang"`), persistido en
  `localStorage`, enviado como `body.ichingLineReadingSystem` en `/api/consult` (ya leído por el
  `resolvedLineReadingSystem` de la Fase 1).
- 4 claves i18n nuevas (`lineReadingSystemGroupAria`/`HuangLabel`/`ZhuxiLabel`/`Hint`) agregadas a
  las 11 locales en `manual-coin-wizard-ui.ts` — mobile + web comparten el mismo paquete `i18n`,
  así que ambas plataformas quedan cubiertas por el mismo cambio.

### Fase 5 — `b73739a` — documentación al usuario (tour, FAQ, guía) en 11 locales

Última fase: con el selector ya funcional y persistente, se corrigió la documentación
user-facing que había quedado desalineada con la nueva realidad del producto:

- **FAQ** (`faq-page-ui.ts`, entrada `iching-mutation-rules`, las 11 locales): el cierre de la
  respuesta afirmaba sin condición "la app sigue a Huang" — corregido para explicar que Huang es
  el default, que el selector "Sistema de lectura" en Opciones permite cambiar a Zhu Xi, y que la
  elección se recuerda.
- **Guía** (`guia-page-ui.ts`, campo `ichingTraditionNote`, las 11 locales): mismo tipo de
  corrección — describe ambos sistemas y cómo activarlos en vez de afirmar un comportamiento
  único e incondicional.
- **Tutorial onboarding** (`apps/web/src/app/page.tsx`, tour `react-joyride`): nuevo paso
  `#tour-line-reading-system`, insertado en el array `steps` entre el paso de "Ejecución"
  (`#tour-cast-mode`) y el de "Biblioteca de Hexagramas" (`#tour-library-btn`) — refleja la
  posición física real del selector en el panel. Para evitar renumerar 3 pasos existentes × 11
  locales sin necesidad, se usaron claves nuevas no-secuenciales (`lineReadingTitle`/
  `lineReadingBody` en `home-tour-ui.ts`, las 11 locales) en vez de insertar un `stepN` en medio
  de la secuencia — el orden de aparición lo controla la posición en el array, no el nombre de la
  clave.
- Verificado: `npm run build` en `packages/i18n`, `tsc --noEmit` limpio en `apps/web`, `vitest
  run` con 62/62 tests pasando en `apps/web` (no existe un test suite dedicado a consistencia de
  locales; la completitud de `Record<AppLocale, T>` la garantiza `tsc`).

### Qué queda pendiente (no hecho en esta sesión, intencional)

1. **Migración `074_line_reading_system.sql` sin aplicar** en ningún proyecto Supabase (ni
   staging ni producción) — bloqueante antes de cualquier deploy de este código a un entorno con
   tráfico real.
2. **`scripts/line-reading-system-qa.mjs` sin ejecutar** — harness de QA contra la API real de
   Claude, consume tokens; decisión del usuario sobre cuándo correrlo.
3. **Rama sin pushear a `origin`** y sin PR abierto; sin merge a `staging` ni a `main`.
4. **Plan no relacionado** (`proud-doodling-rivest.md` — fix de gap inferior del chat y splash
   full-bleed en la APK mobile) permanece pendiente como hilo de trabajo separado, no tocado en
   esta sesión.

### Verificación de exactitud de este registro

Cada afirmación de código de esta Parte 3 (números de línea, nombres de función, presencia de
`ZX_*` en el i18n, firma de `previewCastFromLineValues`, `precomputedZhuXiRule`,
`AnyMutationRule` en `context-engine`, `persist_rpc_fallback_engaged`, el check `'074'` en
`verify_migrations.sql`) fue re-confirmada por `grep`/lectura directa del código real del repo en
el momento de escribir este documento (20 jun 2026), no copiada únicamente de los mensajes de
commit.

---

## Parte 4 — Re-auditoría de verificación + remediación (20 jun 2026)

**Auditor/implementador:** Claude Opus 4.8. **Método:** se re-leyó cada archivo tocado por los 5
commits contra el código real del repo, se rastrearon los consumidores de los campos nuevos
(lectura de historial, no solo escritura), y se **ejecutaron en vivo** los tests y el typecheck
(no se asumieron del registro de la Parte 3): `vitest` 113/113 en `iching-engine` (incluidos los
37 de `engine.line-reading-systems.test.ts`), `tsc --noEmit` limpio en `backend/claude` **y**
`apps/web`. **Resultado:** los 9 hallazgos de la Parte 2 están **genuinamente resueltos en
código** (confirmado 1:1). Se detectó **1 hallazgo HIGH nuevo** que la Parte 2 no vio —es una
consecuencia directa de su propia decisión de diseño en H5/H6— más 2 menores. Los tres se
**remediaron en esta sesión**.

### 🔴 H10 (HIGH, nuevo) — La cascada de **lectura** de historial no tiene tier de fallback para `line_reading_system`

**Problema:** `apps/web/src/lib/session-store.ts` → `getUserSessionThreadMeta` (Fase 1 de carga
de hilo) detectaba columnas faltantes **por substring del mensaje de error**, pero solo
ramificaba sobre `"oracle_type"` y `"translator"`. La Parte 3 (H5) metió la columna nueva dentro
de `META_COLS_BASE`/`META_COLS_WITH_ORACLE` **sin** añadir una rama de detección para
`line_reading_system`, siguiendo la recomendación de H5 de no crear un tier `_LEGACY` nuevo.

Efecto concreto si el código se despliega **antes** de aplicar la migración 074 (escenario
real y vigente: la 074 **no está aplicada** y la rama se mergeará a `staging`): el primer
`SELECT` con `META_COLS_WITH_ORACLE` falla con `column consultations.line_reading_system does
not exist`. En un entorno donde `oracle_type` y `translator` ya existen (producción actual), ese
mensaje **no contiene** `"oracle_type"` ni `"translator"`, así que **ninguna rama de la cascada
se ejecutaba**, `consultError` persistía y la función retornaba `null` → **todos los hilos del
historial dejaban de cargar** (no "degradación silenciosa a huang" como sugería H6, sino fallo
duro de lectura).

**Contradicción con H6:** la Parte 2 declaró el "hazard de orden" *sobredimensionado* porque la
ruta de **escritura** tiene el fallback de RPC (`persist_rpc_fallback_engaged`). Cierto para
escritura. Pero la ruta de **lectura** es independiente y no tenía amortiguación alguna para esta
columna; el hazard ahí estaba **subestimado**, no sobredimensionado. La decisión de H5 de omitir
un tier nuevo eliminó la defensa en profundidad que sí existe para `translator`/`oracle_type`,
cuyo propósito exacto es cubrir la ventana de lag deploy(Vercel)→migración(Supabase).

**Remediación aplicada:** se reemplazó la cascada anidada por un **ladder descendente** de
conjuntos de columnas (`META_COL_TIERS`), recorrido en orden de mayor a menor riqueza; ante un
error que menciona cualquier columna opcional (`line_reading_system`/`translator`/`oracle_type`)
se baja un escalón en vez de abortar. Se añadió el tier intermedio
`META_COLS_WITH_ORACLE_NO_LRS` (`translator + oracle_type`, sin `line_reading_system`) para que,
con 074 sin aplicar, la lectura conserve `translator`/`oracle_type` y solo pierda
`line_reading_system` (que cae a `'huang'` por el `?? "huang"` del mapper, comportamiento
correcto pre-migración). Cualquier error que **no** sea de columna opcional detiene el ladder y
surfacea como `null` (comportamiento previo preservado para errores reales). En DB moderna (074
aplicada) el primer tier acierta a la primera: una sola query, igual que antes.

### 🟡 H11 (bajo) — `ADD CONSTRAINT` de la migración 074 no era idempotente

**Problema:** `074_line_reading_system.sql` usaba `ADD COLUMN IF NOT EXISTS` (idempotente) pero
`ADD CONSTRAINT consultations_line_reading_system_check` **sin** guarda. Una re-ejecución o una
aplicación parcial previa de la migración fallaría con `constraint already exists`, contra la
disciplina de migraciones del proyecto.

**Remediación aplicada:** se antepuso `ALTER TABLE ... DROP CONSTRAINT IF EXISTS
consultations_line_reading_system_check;` antes del `ADD CONSTRAINT`, haciendo el bloque
idempotente. (Seguro de editar: la migración aún no se ha aplicado a ningún proyecto Supabase.)

### 🟡 H12 (bajo, cosmético) — `emphasis` no se propagaba al recordatorio del gate de reintento H2

**Problema:** `backend/claude/src/interpretation-line-gate.ts` → el tipo `SelectedLineText` no
incluía `emphasis`, y `buildLineCitationRetryParams` renderizaba `[${lt.fromHexagram}]` sin la
marca `[primary]/[secondary]`. Inconsistente con `formatLineEntry` (que sí la lleva), aunque sin
impacto en los gates (iteran por array) ni en el render principal.

**Remediación aplicada:** se añadió `emphasis?: "primary" | "secondary"` a `SelectedLineText` y
se incluyó la marca en el recordatorio de reintento, alineándolo con `formatLineEntry`.

### Verificación post-remediación (en vivo, 20 jun 2026)

- `vitest run` en `iching-engine`: **113/113** verde tras los cambios.
- `tsc --noEmit` limpio en `backend/claude` y `apps/web` tras los cambios.
- Archivos tocados en la remediación: `apps/web/src/lib/session-store.ts` (H10),
  `backend/db/migrations/074_line_reading_system.sql` (H11),
  `backend/claude/src/interpretation-line-gate.ts` (H12).

### Pendiente (sin cambios respecto a Parte 3)

1. **Migración 074 aún sin aplicar** en ningún proyecto Supabase. El fix H10 ahora hace la
   lectura tolerante a la ventana pre-migración, pero la 074 sigue siendo bloqueante antes de
   cualquier deploy con tráfico real (la escritura del campo y su lectura fiel dependen de ella).
2. **`scripts/line-reading-system-qa.mjs` sin ejecutar** (consume tokens reales).
3. **Sin push a `origin` ni merge** a `staging`/`main` — decisión explícita del usuario.

---

# Parte 5 — QA API real + merge a staging + ajuste de UX (20 jun 2026, Opus 4.8)

**Migración 074 aplicada en staging** (decisión del usuario). Ejecutada la **Capa 4** del plan de
pruebas: `scripts/line-reading-system-qa.mjs --models claude-sonnet-4-6`, **48/48 lecturas reales**
(12 fixtures × {huang, zhuxi} × {wilhelm, master_combined}). Resultado: **0 fallos de gate**
(`blocking: []` en todas). Los 8 `pass:false` son falsos negativos del harness (nota forzada
"verify in transcript" para los casos ZX de 2/4 líneas); verificados a mano en el transcript:

- **2 líneas:** Huang cita 1 línea; Zhu Xi (`ZX_TWO_UPPER`) cita ambas, superior primaria.
- **3 líneas Hacker A** (pos 1 cambia): prima el Juicio **primario**, sin citar línea, sin doble-cita.
- **3 líneas Hacker B** (pos 1 estable): prima el Juicio **transformado** (énfasis invertido OK).
- **4 líneas** (`ZX_FOUR_LOWER`): ambas estables del transformado, inferior (pos 5) primaria.
- Énfasis `primaria/secundaria` propagado a Wilhelm/Legge/Zhou Yi en `master_combined` (H3 OK).

Concordancia 100% con Yixue Qimeng + Ed Hacker → **merge `feat/line-reading-system-selector` →
`staging`** (`--no-ff`) y push. Reporte: `reports/lrs-qa-2026-06-20T17-46-21-336Z*.{json,md}`.

## Ajuste de UX post-merge

A petición del usuario, sobre `staging`:

1. **Rename del selector:** `lineReadingSystemGroupAria` pasa de «Sistema de lectura» (ambiguo) a
   **«Lectura de líneas cambiantes»** (EN: *Changing-line reading*), en los 11 locales de
   `manual-coin-wizard-ui.ts`. Mismo rename del título del tour en `home-tour-ui.ts`.
2. **Reorden:** el selector pasa a **2ª posición, justo tras Traductor**. Orden nuevo del panel:
   **Traductor → Lectura de líneas cambiantes → Método → Ejecución** (`apps/web/src/app/page.tsx`).
   El paso del tour `#tour-line-reading-system` se reubica entre `#tour-translator` y
   `#tour-cast-mode` para reflejar el orden visual.
3. **Docs:** referencias al nombre del selector actualizadas en `guia-page-ui.ts` y `faq-page-ui.ts`
   (11 locales). El desglose 0–6 líneas Huang/Zhu Xi de la FAQ ya documenta cómo se aplica la
   lectura en **ambos** métodos; se mantiene.

Verificación: `tsc --noEmit` limpio en `apps/web`; build limpio en `@iching-oracle/i18n`; orden del
DOM confirmado en `page.tsx`. Pendiente: **Capa 3 (persistencia E2E)** contra staging desplegado.

---

# Parte 6 — Sistema de líneas en el resumen + fix barra de estado (20 jun 2026, Opus 4.8)

A petición del usuario, dos cambios visibles que faltaban tras la Parte 5.

## 6.1 — El resumen de la tirada debe mostrar el sistema de lectura usado

**Estado previo: NO implementado.** `ConsultationRecordCard` mostraba traza, regla de lectura,
traductor e hilo, pero **no** qué sistema de líneas cambiantes se aplicó. Además, la respuesta JSON
de `/api/consult` **no devolvía** `lineReadingSystem` (se persistía en DB vía RPC desde la 074, pero
no se exponía al cliente), por lo que el dato no estaba disponible en una consulta recién hecha.

**Remediación — propagación de punta a punta:**

| Capa | Archivo | Cambio |
|------|---------|--------|
| API | `apps/web/src/app/api/consult/route.ts` | El JSON de respuesta ahora incluye `lineReadingSystem: resolvedLineReadingSystem`. |
| Tipos cliente | `apps/web/src/app/page.tsx` | `lineReadingSystem` añadido a `ConsultResponse` y `ApiChatConsultation`. |
| Historial | `apps/web/src/app/page.tsx` (`mapApiConsultationToItem`) | Mapea `c.lineReadingSystem` con fallback `"huang"`. |
| Tarjeta | `apps/web/src/components/ConsultationRecordCard.tsx` | Nueva fila **«Lectura de líneas: Alfred Huang / Zhu Xi»**, tras «Traductor». Aplica a cualquier traductor. |
| PDF | `apps/web/src/app/page.tsx` (`exportChatPdf`) | Línea equivalente en el resumen exportado. |
| Preview manual | `apps/web/src/app/page.tsx` | La tarjeta de preview muestra el sistema seleccionado en vivo. |

El **path histórico ya transportaba el dato**: `session-store.ts` (`mapRowToStoredConsultation`) lee
`line_reading_system` y lo expone en `StoredConsultationMeta`; la API de chats devuelve
`entry.consultations` tal cual (meta y unificado usan el mismo mapper). Lecturas previas a la 074
caen al default `"huang"`.

## 6.2 — Fix barra de estado superior: «Zhu Xi» hardcodeado

**Bug:** `page.tsx` (tagline `oracle-tagline`) intercalaba un literal fijo `· Zhu Xi ·` entre método
y traductor. Nunca reflejó una selección real — era un valor estático heredado. Ahora es dinámico
según `ichingLineReadingSystem`, igual que ya hacía con método y traductor:

```
I Ching · Tres Monedas · Alfred Huang · Master Synthesis
I Ching · Tres Monedas · Zhu Xi · Wilhelm/Baynes
```

## i18n (11 locales)

- `manual-coin-wizard-ui.ts`: nuevos `lineReadingSystemHuangShort` / `lineReadingSystemZhuxiShort`
  (nombres compactos sin paréntesis — fuente única para barra de estado, tarjeta y PDF).
- `consultation-record-ui.ts`: nuevo `lineReading` (etiqueta de fila).
- `pdf-export-ui.ts`: nuevo `lineReading` (etiqueta de fila del PDF).

## Verificación

- Rebuild `@iching-oracle/i18n` ✅ · `tsc --noEmit` en `apps/web` ✅ sin errores.
- Taglines no usadas `castMethod*Tagline` (que aún contienen «Zhu Xi» literal) no se renderizan en
  el web; se dejan sin tocar (fuera de alcance).

---

# Parte 7 — Alineación del tour con el orden del panel (20 jun 2026, Opus 4.8)

Tras el reorden de Parte 5, el tour quedó desincronizado: después de «Lectura de líneas cambiantes»
saltaba al bloque de auto/manual con el título **«Modo de Lanzamiento»** (no coincidía con la
etiqueta visible **«Ejecución»** = `castModeGroupAria`) y **se saltaba «Método»** por completo (el
bloque `castMethodGroupAria` no tenía `id` de tour).

**Remediación:**

1. `apps/web/src/app/page.tsx`: el bloque «Método» recibe `id="tour-cast-method"`; nuevo paso de tour
   `#tour-cast-method` insertado **entre** `#tour-line-reading-system` y `#tour-cast-mode`. Orden final
   del tour: **Traductor → Lectura de líneas cambiantes → Método → Ejecución**, idéntico al panel.
2. `packages/i18n/src/messages/home-tour-ui.ts` (11 locales): `step6Title` renombrado de
   «Modo de Lanzamiento» → **«Ejecución»** (coincide con `castModeGroupAria` por idioma:
   Execution/Execução/Exécution/Ausführung/Esecuzione/実行/执行/실행/تنفيذ/निष्पादन). Nuevos
   `methodTitle`/`methodBody` (= `castMethodGroupAria` + descripción Tres Monedas vs Yarrow).

Verificación: build `@iching-oracle/i18n` ✅ · `tsc --noEmit` en `apps/web` ✅. Cierra la
desalineación del tutorial; el resto del flujo del tour se mantiene correcto.

---

# Parte 8 — Reorganización de la documentación pública (20 jun 2026, Opus 4.8)

Auditoría de las tres páginas de docs públicas tras detectar que estaban desactualizadas respecto
a la feature de líneas cambiantes y que el FAQ contenía marcas tipográficas de IA (em-dash). Todo
compilado a `@iching-oracle/i18n` (11 locales, EN fuente de verdad). Sin tocar billing.

## 8.1 — Guía (`/guia#modos-consulta`): reorden al orden real de selectores

**Hallazgo:** `apps/web/src/app/guia/page.tsx` renderizaba un set legacy `s1`–`s6` simplificado,
mientras `guia-page-ui.ts` ya contenía claves ricas y precisas **sin renderizar**
(`methodsHeading`, `coinsPractical*`, `yarrowPractical*`, `ichingCastMode*`, `tokens*`, `export*`,
`ichingTraditionNote` — esta última ya explicaba Huang por defecto + selector Zhu Xi). Además no
mencionaba el selector «Lectura de líneas cambiantes» y mezclaba «Método» con «Ejecución».

**Remediación:**

1. `guia/page.tsx` reescrito para renderizar el contenido rico en el **orden del panel**:
   Modo de oráculo (`#modos-consulta`) → **Traductor** (`#traductor`) → **Lectura de líneas
   cambiantes** (`#lectura-lineas`) → **Método** (`#metodo`, Tres Monedas + Varillas) →
   **Ejecución** (`#ejecucion`, automática/manual) → Sesiones → Tokens → Biblioteca/Docs →
   Exportar → Privacidad. Se conserva `#panel-opciones` (enlazado desde `page.tsx`) y
   `#modos-consulta` (enlace externo + quickstart).
2. `guia-page-ui.ts`: nueva clave `lineReadingHeading` en los 11 locales, con el **mismo texto que
   el label del selector en la UI** (`manual-coin-wizard-ui.lineReadingSystemGroupAria`) para
   consistencia. El cuerpo reutiliza `ichingTraditionNote` (ya preciso).

## 8.2 — Notes (`/notes`): orden cronológico + sección de líneas cambiantes

**Hallazgo:** orden no cronológico (I Ching antes que los Huesos Shang, más antiguos), traductores
anidados de forma incoherente bajo «Yarrow», y **sin** sección de líneas cambiantes. Peor:
`ichingMethodBody` afirmaba que la app implementa «exactamente las reglas de Zhu Xi», cuando el
**default es Alfred Huang** (Zhu Xi es opcional) — imprecisión histórica corregida.

**Remediación** (`notes-page-ui.ts` + `notes/page.tsx`, 11 locales):

- Reorden cronológico: **Huesos (Shang ~1600 a.C.) → I Ching/Zhouyi → Métodos de tirada (Yarrow →
  Tres Monedas) → Lectura de líneas cambiantes → Las traducciones (Legge 1882 → Wilhelm 1924/1950 →
  Zhou Yi) → Por qué la IA no inventa → Fuentes.**
- Nueva sección **«La lectura de las líneas cambiantes»** con `lineReadingIntroBody` +
  `lineReadingHuangHeading/Body` (Alfred Huang, 1921–2014, *The Complete I Ching* 1998, sistema de
  reducción por defecto) + `lineReadingZhuxiHeading/Body` (Zhu Xi, 1130–1200, *Yijing benyi*, lectura
  clásica multi-texto). Nueva clave `translationsHeading` para agrupar los traductores.
- `ichingMethodHeading/Body` reescritos: ahora describen **solo** el método de las tres monedas, sin
  reclamar reglas de Zhu Xi.

## 8.3 — FAQ: eliminación de em-dashes (evidencia de IA)

**Hallazgo:** em-dash (—, U+2014) en `faq-page-ui.ts`, concentrados en `iching-mutation-rules`
(listado «N líneas en cambio — …») y `authentic-texts` (inciso pareado), en los 11 locales. El
conteo inicial por líneas dio ~116; el conteo real por ocurrencia fue **144 em-dash + 11 en-dash =
155**.

**Remediación:** reemplazo por puntuación natural según contexto (`:` en listados, `,` en frases,
`()` en incisos; paréntesis full-width `（）` en ja/zh, comas en ar por RTL), conservando caracteres
chinos (卦辞, 爻辞, 用九, etc.) y el middot «·» (diseño de navegación, no es guión).

## Resultados de pruebas (Parte 8)

Ejecutadas el 20 jun 2026 sobre la rama `feat/line-reading-system-selector` antes del merge.

| Prueba | Comando | Resultado |
|--------|---------|-----------|
| Build i18n | `npm run build` en `packages/i18n` (`tsc`) | **PASS** (exit 0) — confirma que las 7 claves nuevas existen en los 11 locales (`Record<AppLocale,…>`). |
| Typecheck web | `npm run typecheck` en `apps/web` (`tsc --noEmit`) | **PASS** (exit 0) — valida `guia/page.tsx` y `notes/page.tsx` con las claves nuevas. |
| FAQ sin dashes | búsqueda U+2014 / U+2013 en `faq-page-ui.ts` | **0 / 0** (144 em + 11 en eliminados). |
| Guía sin dashes | búsqueda en `guia-page-ui.ts` | **0 / 0**. |
| Notes sin dashes | búsqueda en `notes-page-ui.ts` | **0 / 0** tras normalizar 16 en-dash de rangos de fecha (`1046–256` → `1046-256`). Texto nuevo escrito sin dashes (conectores `a` / `至` / `から` / `~` / `से` / `إلى`). |
| Anclas externas | `#modos-consulta`, `#panel-opciones` | preservadas (enlazadas desde `page.tsx` / quickstart). |

**Decisiones de traducción (notes):** en `zh` se dejó «Alfred Huang» sin hanzi (evitar carácter
inexacto); en `ja` se translitereó como アルフレッド・ホアン junto al nombre latino.

**Git:** commit `26ebfd4` en `feat/line-reading-system-selector` (pusheado) → merge `--no-ff`
`cdaf73d` en `staging` (pusheado, deploy Vercel). Pendiente: validación visual en staging desplegado
de `/guia#modos-consulta`, `/notes` y `/faqs`. **Aún NO promovido a `main`.**

---

# Parte 9 — Verificación independiente de las Partes 4-8 (20 jun 2026, Claude Sonnet 4.6)

Tras detectar que las Partes 4-8 fueron producidas por una sesión externa (Cursor / Claude Opus
4.8) sin intervención del agente que mantenía esta auditoría hasta la Parte 3, se realizó una
**re-verificación independiente** de cada afirmación contra el código real en `origin/staging`
(`b699a47`), sin asumir que el texto de las Partes 4-8 fuera correcto solo por estar escrito.
Metodología: primero un gate amplio (tests + compilación de toda la cadena de paquetes), luego
spot-checks dirigidos archivo por archivo de cada remediación puntual.

## 9.1 — Gate amplio

| Verificación | Resultado |
|---|---|
| `git log` / `git diff --stat` de los commits narrados en Partes 4-8 | Existen en `origin/staging` en la secuencia exacta documentada (`338247e` → `b699a47`); diffstat (27 archivos, +1776/-373) coincide con el listado de archivos de las Partes 4-8, sin archivos no documentados. |
| `origin/main` | Sigue en `0aaf432`/`62a6dc1` — ninguna de las Partes 3-8 llegó a `main`, consistente con lo declarado. |
| `npx vitest run` en `packages/iching-engine` | **113/113 PASS** (3 suites) — coincide con el número que reclama la Parte 4. |
| `npx vitest run` en `apps/web` | **62/62 PASS** (12 suites). |
| `npm run build` en `iching-engine` → `context-engine` → `i18n` (orden de dependencias) | Limpio, sin errores `tsc`. |
| `tsc --noEmit` / `npm run build` en `backend/claude` | Limpio. |
| `tsc --noEmit` en `apps/web` | Limpio (0 errores) sobre todo el HEAD de `staging`, no solo el diff de una Parte. |

## 9.2 — Spot-checks dirigidos (lectura directa del código, no solo del texto de la auditoría)

| Claim auditado | Archivo:línea verificado | Resultado |
|---|---|---|
| H10 — ladder `META_COL_TIERS` (5 niveles descendentes) | `apps/web/src/lib/session-store.ts:487-605` | **Confirmado.** `META_COL_TIERS` recorre 5 sets de columnas de más a menos rico; en error de columna ausente (substring match contra `OPTIONAL_META_COLUMNS`) baja un nivel, en cualquier otro error rompe el loop y devuelve `null`. Comportamiento correcto incluso en el caso límite (074 sin aplicar pero `translator`/`oracle_type` ya existentes): tarda hasta 3 intentos pero termina en `META_COLS_WITH_ORACLE_NO_LRS`, sin perder datos no relacionados. |
| H11 — idempotencia de migración 074 | `backend/db/migrations/074_line_reading_system.sql:7-13` | **Confirmado.** `DROP CONSTRAINT IF EXISTS consultations_line_reading_system_check;` antepuesto a `ADD CONSTRAINT`, comentario explicando el motivo. `verify_migrations.sql:452-460` ya chequea columna + `pronargs = 24`. |
| H12 — campo `emphasis` en `SelectedLineText` | `backend/claude/src/interpretation-line-gate.ts:8,59` | **Confirmado.** Tipo `emphasis?: "primary" \| "secondary"` declarado y renderizado en el recordatorio de retry (`buildLineCitationRetryParams`). |
| `route.ts` devuelve `lineReadingSystem` en la respuesta JSON | `apps/web/src/app/api/consult/route.ts` (6 ocurrencias: líneas 1136, 1142, 1146, 1492, 1739, 1789) | **Confirmado.** |
| `ConsultationRecordCard.tsx` — fila «Lectura de líneas» | líneas 26, 49, 58-61, 147-148 | **Confirmado.** Renderiza `lineReadingSystemHuangShort`/`ZhuxiShort` según el valor persistido. |
| Fix de hardcode en tagline (`oracle-tagline`) | `apps/web/src/app/page.tsx:4828-4842` | **Confirmado.** Ya no hay literal `"· Zhu Xi ·"`; el segmento es `ichingLineReadingSystem === "zhuxi" ? manualWizardChrome.lineReadingSystemZhuxiShort : manualWizardChrome.lineReadingSystemHuangShort`. |
| Reorden DOM Traductor → Lectura de líneas → Método → Ejecución | `page.tsx:5469` (`#tour-translator`), `5530` (`#tour-line-reading-system`), `5586` (`#tour-cast-method`), `5706` (`#tour-cast-mode`) | **Confirmado.** Orden físico en el JSX coincide exactamente con el orden narrado. |
| Tour Joyride reordenado en el mismo sentido | `page.tsx:7042-7045` (array de steps) | **Confirmado.** `#tour-translator` → `#tour-line-reading-system` (con `tour.lineReadingTitle/Body`) → `#tour-cast-method` (con `tour.methodTitle/Body`) → `#tour-cast-mode` (con `tour.step6Title/Body`, renombrado a «Ejecución»). |
| `home-tour-ui.ts`: `step6Title` renombrado a «Ejecución» + `methodTitle`/`methodBody` nuevos | `packages/i18n/src/messages/home-tour-ui.ts` | **Confirmado.** 11/11 locales con las 3 claves completas y coherentes (verificado leyendo cada locale, no solo `es`/`en`). |
| `lineReadingSystemHuangShort`/`ZhuxiShort` nuevos | `packages/i18n/src/messages/manual-coin-wizard-ui.ts` | **Confirmado.** 22 ocurrencias = 11 locales × 2 claves. |
| `lineReading` nueva clave en record card y PDF | `consultation-record-ui.ts`, `pdf-export-ui.ts` | **Confirmado.** 11/11 locales en cada archivo. |
| Em-dash/en-dash → 0 en FAQ/Guía/Notes | conteo directo de caracteres U+2014 (—) y U+2013 (–) en los 3 archivos | **Confirmado.** `0/0` en `faq-page-ui.ts`, `guia-page-ui.ts`, `notes-page-ui.ts`. |
| Corrección factual en `ichingMethodBody` (ya no afirma Zhu Xi «exacto») | `notes-page-ui.ts:68-69` (es) | **Confirmado.** El texto ahora dice explícitamente que cómo se leen las líneas en movimiento «es una cuestión aparte, que se aborda en la siguiente sección» — ya no reclama implementar Zhu Xi exactamente. |
| Nuevas secciones `lineReadingHeading`/`Intro`/`Huang*`/`Zhuxi*` realmente renderizadas (no solo declaradas en i18n) | `apps/web/src/app/notes/page.tsx:102-104`, `apps/web/src/app/guia/page.tsx:77` | **Confirmado.** Ambos componentes consumen las claves nuevas en JSX real. |

## 9.3 — Verificación del reporte de QA real (`reports/lrs-qa-2026-06-20T17-46-21-336Z.json`)

Se abrió y analizó el JSON completo (no solo se confió en el resumen narrado en la Parte 5):

- `total: 48, pass: 40, fail: 8` — coincide exactamente con «48/48 generadas, 8 pass:false» de la
  Parte 5.
- **0 entradas `blocking` en los 48 registros** (`rows.reduce(blocking.length) === 0`) — confirma
  «0 fallos de gate bloqueante».
- **0 registros con `error` distinto de `null`** — ninguna llamada a la API falló.
- Los 8 `fail` son homogéneos: los 4 casos `two_yy`/`two_same`/`two_same_yin`/`four`, sistema
  `zhuxi`, ambos traductores probados (`wilhelm`, `master_combined`), todos con
  `extra: ["expecting N cited lines at X,Y (verify in transcript)"]` y `blocking: []`.
- Se inspeccionó manualmente el transcript completo de `two_yy · zhuxi · wilhelm` (líneas 770-889
  de `reports/lrs-qa-2026-06-20T17-46-21-336Z-transcripts.md`): la respuesta cita correctamente
  **Línea 1 (secundaria)** y **Línea 2 (primaria)**, ambas con texto completo y análisis. El
  detector del script de QA evidentemente no reconoce el formato `**Línea N** (secundaria)` —
  **confirma que los 8 `fail` son falsos negativos del arnés de QA, no defectos reales de la
  respuesta del modelo**, tal como afirma la Parte 5.

## 9.4 — Lo que NO se pudo verificar de forma independiente

- **Aplicación de la migración 074 en el proyecto Supabase de staging**: esta sesión no tiene
  credenciales de DB ni acceso a Supabase. La afirmación de la Parte 4/5 de que la migración fue
  aplicada en staging queda como **dato asertado por la sesión externa, no confirmado aquí**. El
  gate de `tsc`/tests pasa porque el código está preparado para ambos casos (columna presente o
  ausente, vía el ladder de 9.2), por lo que el sistema es seguro incluso si la migración no
  estuviera aplicada — pero eso no prueba que sí lo esté.
- **Validación visual en staging desplegado** (UI real renderizada en navegador/APK) — fuera de
  alcance de esta sesión, que solo verificó código fuente, tests automatizados y reportes de QA ya
  generados.

## 9.5 — Conclusión de la re-verificación

**Ninguna discrepancia encontrada.** Todas las afirmaciones técnicamente verificables de las
Partes 4-8 (remediaciones H10/H11/H12, propagación de `lineReadingSystem` a route/record-card/PDF,
fix del hardcode de tagline, reorden de panel + tour, limpieza de em-dash, corrección factual en
notes) se sostienen contra una lectura directa e independiente del código real, los resultados de
tests ejecutados en esta sesión, y el contenido íntegro del reporte de QA real (no solo su resumen
narrado). El único punto no verificable de forma independiente es la aplicación efectiva de la
migración 074 en la base de datos de staging, por ausencia de acceso a credenciales en esta sesión.

---

# Parte 10 — Verificación de dos bugs reportados en producción + fix de Cursor (20 jun 2026, Claude Sonnet 4.6)

Tras el merge de las Partes 4-9 a `staging`, el usuario reportó dos bugs reales detectados en uso:
(1) una pregunta en español ("...le escribí a Cherry... no pasó su examen de **francés**... está
muy triste") fue respondida **en francés**; (2) una consulta hecha con el selector en Zhu Xi, modo
automático, mostró en el resumen **"Alfred Huang"**. El usuario pasó ambos a una sesión de Cursor,
que entregó un fix + un informe propio (causa raíz, política implementada, tabla de auditoría de
campos, análisis matemático de yarrow, checklist de validación). Esta Parte re-verifica ese informe
contra el código real, igual que las Partes 4-9 verificaron el trabajo anterior.

## 10.1 — Bug 1: detección de idioma (falso positivo ES→FR)

**Causa raíz reportada:** el servidor tenía una función `detectLanguageFromUserText()` que
ganaba siempre sobre el idioma de la UI, y trataba tokens como `le` (pronombre español) y el `est`
dentro de `está` como evidencia de francés.

**Verificado:**
- `detectLanguageFromUserText` **ya no existe** en el repo (`grep` sin resultados en
  `apps/web/src/` ni `backend/`) — no es que esté deshabilitada, está eliminada.
- Nueva lib única `apps/web/src/lib/detect-input-language.ts`, usada **tanto en servidor
  (`route.ts:381,809`) como referenciada desde el mismo módulo compartido** (no hay una copia
  client-side separada que pueda desincronizarse).
- Lógica leída directamente (no solo el resumen de Cursor): script CJK/Arabic/Devanagari manda
  siempre; en latinas, puntúa por palabra completa con `\b` (nunca substring — así "está" no
  puede matchear `est`, y de hecho ni `le` ni `est` están en ninguna lista de palabras, fueron
  excluidos por ser ambiguos); UI locale gana en empate/ambigüedad; el idioma de la pregunta gana
  solo con margen ≥ 2 sobre el segundo lugar y sobre el score de la UI.
- `route.ts:374-381`: `uiLocale` se deriva de la cookie `iching_ui_locale`
  (`apps/web/src/lib/doc-locale-cookies.ts:10`) con fallback a `body.language`, y
  `detectInputLanguage(trimmedQuestion, uiLocale)` reemplaza la lógica vieja en los dos puntos
  donde antes corría (`route.ts:381` confirmación inicial, `:809` para `oracleLanguage` del modo
  Huesos de Oráculo).
- **Test de regresión con la pregunta real reportada** (`detect-input-language.test.ts:5-9`, literal
  "Sabes, le escribi a Cherry... francés... está muy triste") — ejecutado en esta sesión:
  **PASS**, devuelve `"es"`. Las otras 4 casos del archivo (EN claro con UI ES, FR claro con UI ES,
  3 scripts CJK, pregunta corta ambigua) también **PASS** (5/5).

## 10.2 — Bug 2: resumen mostraba "Alfred Huang" con Zhu Xi activo

**Causa raíz reportada:** en modo automático, el evento SSE `final_ready` no incluía
`lineReadingSystem`, así que el resumen caía al default `undefined` → Alfred Huang, aunque el motor
sí había aplicado las reglas de Zhu Xi para el cast.

**Verificado:**
- `route.ts:543` calcula `resolvedLineReadingSystem` **una sola vez** y lo reutiliza en *todos* los
  puntos de salida: eventos SSE intermedios (`:1003,1009,1013,1359`), `final_ready` (`:1411`),
  respuesta JSON no-streaming (`:1607,1657`) — antes solo faltaba en `:1411`, ahora está en los 7.
- El mismo `resolvedLineReadingSystem` se pasa a las tres rutas de cast
  (`route.ts:1002-1013`): `performCastFromLineValues` (manual monedas/varillas con líneas dadas),
  `performYarrowCast` (varillas automáticas), `performCast` (monedas automáticas) — confirma la
  fila "✅ en manual monedas / manual varillas" de la tabla de Cursor, no solo el modo automático.
- `packages/iching-engine/src/engine.ts:313,329,353`: el motor recibe `lineReadingSystem` como
  opción y lo **devuelve en el `castResult`** (`system` default `"huang"` si no se pasa) — la
  cadena de propagación hasta la respuesta es real, no solo nominal.
- Fallback cliente confirmado en `page.tsx:4104-4109`: si `data.lineReadingSystem` no es
  `"zhuxi"`/`"huang"` válido, usa `ichingLineReadingSystem` (estado del switch activo en el panel)
  en lugar de quedar `undefined`. Fallback de traductor análogo en `:4095-4103` (cae a
  `translatorId` del panel). Este bloque es compartido por el path de streaming (`finalPayload` se
  asigna a `data` en `:3896`) y el no-streaming, así que el fallback cubre ambos.

## 10.3 — Verificación de la tabla de auditoría de campos de Cursor

La tabla de Cursor afirma `lineReadingSystem`/`translator`/`language` consistentes en
auto-SSE/auto-JSON/manual-monedas/manual-varillas/persist-DB/resumen-UI/tagline. Verificado por
lectura directa (no por confiar en la tabla):
- Una sola variable `resolvedLineReadingSystem` alimenta los 7 puntos de salida de `route.ts` →
  imposible que un modo tenga el campo y otro no, a diferencia del bug original donde `final_ready`
  era el único punto que lo omitía.
- Persistencia a DB ya cubierta en la Parte 9 (`session-store.ts:220,293` pasa
  `params.consultation.lineReadingSystem ?? "huang"` al RPC `persist_consultation_with_content`).
- Tagline (`page.tsx:4828-4842`, verificada en Parte 9) lee del estado local del switch
  (`ichingLineReadingSystem`), no de la respuesta del servidor — por diseño no puede desincronizarse
  del campo de la API, ya que ambos refieren a la misma fuente de verdad mientras el usuario no
  recarga.

## 10.4 — Gate de pruebas (ejecutado en esta sesión, no solo reportado)

| Verificación | Resultado |
|---|---|
| `npx vitest run src/lib/__tests__/detect-input-language.test.ts` | **5/5 PASS**, incluyendo el caso real reportado por el usuario. |
| `npx vitest run` (suite completa `apps/web`) | **67/67 PASS** (13 archivos; 62 previos + 5 nuevos). |
| `npx tsc --noEmit` en `apps/web` | Limpio, 0 errores. |

## 10.5 — Yarrow Monte Carlo: re-ejecutado independientemente (corrección a este mismo documento)

La primera versión de esta Parte marcó el análisis Monte Carlo de Cursor como "no re-ejecutado".
Al preguntar el usuario por qué, dado que es un cálculo trivial, se corrigió en el momento: se
extrajo la implementación real de `throwYarrowStalks` (`engine.ts:430-436`,
`n = Math.floor(rng() * 16)` con umbrales `<1 → 6`, `<6 → 7`, `<13 → 8`, resto `→ 9`) y se corrió
con `Math.random` real (no un mock), 2,000,000 tiradas:

| Valor | Esperado (1/16, 5/16, 7/16, 3/16) | Observado (N=2M) |
|---|---|---|
| 6 (yin viejo) | 6.250% | 6.275% |
| 7 (yang joven) | 31.250% | 31.233% |
| 8 (yin joven) | 43.750% | 43.748% |
| 9 (yang viejo) | 18.750% | 18.744% |

Desviaciones dentro del ruido estadístico esperado para N=2M (σ ≈ 0.02-0.04 puntos porcentuales
según el valor). **Confirma la distribución que cita el informe de Cursor**, y de paso confirma que
no hay off-by-one en los umbrales del bucket de 16 valores (0 → 6, 1-5 → 7, 6-12 → 8, 13-15 → 9 —
1+5+7+3 = 16, particiona el espacio completo sin huecos ni solapes).

## 10.6 — Validación pendiente (fuera de alcance de esta sesión, en el momento de escribir 10.1-10.5)

Validación visual en staging desplegado (las 5 pruebas que Cursor pide hacer en "internal
testing": idioma cruzado, Zhu Xi + automática, Zhu Xi + manual, recarga de hilo) — pendiente del
lado del usuario, requiere navegador/APK real, fuera del alcance de código/tests de esta sesión.

## 10.7 — Conclusión (10.1-10.5)

**Ambos bugs y su fix se confirman correctos contra el código real, no solo contra el informe**,
incluyendo ahora la re-ejecución independiente del análisis matemático de yarrow. La causa raíz
declarada para cada bug coincide con lo que efectivamente se encuentra en el código anterior al fix
(función de idioma eliminada, único punto faltante de `lineReadingSystem` identificado y
corregido), la solución implementada es coherente en los 7 puntos de salida de `route.ts` y en las
3 rutas de cast, el test de regresión usa literalmente la pregunta real que disparó el bug, y la
distribución de probabilidad de las varillas se confirmó por simulación directa. Único pendiente:
validación visual manual en staging desplegado (responsabilidad del usuario).

---

# Parte 11 — Verificación directa en Supabase producción + Axiom (20 jun 2026, Claude Sonnet 4.6)

A petición del usuario, se verificaron **las dos tiradas reales que dispararon el reporte de bugs**
directamente en la base de datos de **producción** (`wgborqkfnxfarkdaotsd`, no staging) y se
correlacionó con telemetría real de Axiom (`iching-app-main`) — no solo código y tests, sino los
datos y logs reales del incidente.

## 11.1 — Metodología y manejo de credenciales

Las credenciales de producción estaban comentadas en `.env` (raíz del repo) con las de staging
activas, por diseño (evitar que `pnpm dev` apunte a producción por accidente). Para esta
verificación puntual: (1) se comentaron temporalmente las credenciales de staging y se activaron
las de producción en `.env`; (2) se ejecutó un script Node de **solo lectura** (`SELECT` vía
`@supabase/supabase-js` con la service role key) contra `consultations` y `consultation_content`;
(3) **se revirtió el archivo a staging inmediatamente después** de obtener los datos, antes de
continuar — el archivo es `gitignored`, así que el cambio temporal nunca tocó control de versiones,
pero se revirtió igual por higiene: dejar credenciales de producción activas en un `.env` de
desarrollo local es un riesgo evitable. El script temporal (`verify-prod-readings.mjs`) y los
volcados de la respuesta de Axiom se borraron al terminar.

## 11.2 — La tirada con el bug de idioma (FR con UI ES): localizada y confirmada en DB de producción

Búsqueda por el texto literal de la pregunta reportada ("Cherry", "francés") sobre `consultations`
en producción localizó el hilo completo (`session_id = d778c6a8-200a-46aa-8db3-f596d6559fc0`,
8 mensajes entre el 18 y el 21 de junio 2026). La fila con el bug es la **posición 6** del hilo:

| pos | created_at (UTC) | language | line_reading_system | translator |
|---|---|---|---|---|
| 1-5 | 18 jun | es | huang | wilhelm/legge/zhouyi/—/master_combined |
| **6** | **2026-06-21T00:47:20Z** | **fr** ⚠️ | zhuxi | wilhelm |
| 7 | 2026-06-21T01:32:43Z | es ✓ | zhuxi | master_combined |
| 8 | 2026-06-21T01:37:14Z | es ✓ | huang | zhouyi |

Confirma exactamente el reporte del usuario: la pregunta en español ("Sabes, le escribi a Cherry...
francés... está muy triste...") quedó persistida con `language = 'fr'`. El texto completo de
`consultation_content.interpretation` para esa fila está en **francés correcto** y, pese al idioma
equivocado, aplica bien las reglas de Zhu Xi (cita textual: *"Selon la règle de Zhu Xi pour deux
mutations, les deux lignes sont lues, la supérieure étant primaire"*) — es decir, **el motor de
cast nunca tuvo el bug; solo la detección de idioma de salida falló**, confirmando que el bug 1 y el
bug 2 eran independientes, no la misma causa.

La posición 7 (mismo hilo, 45 min después) repite un patrón de pregunta similar y devuelve
`language = 'es'` correctamente — primera evidencia de que el fix funciona, en el mismo hilo real
del usuario, no solo en un test sintético.

## 11.3 — La tirada con el bug de "resumen Huang": el dato persistido en DB siempre fue correcto

Hallazgo más matizado de lo que sugiere el resumen de Cursor: la columna `line_reading_system` de
la fila de la posición 6 (la misma fila del bug de idioma) **ya decía `'zhuxi'` correctamente en
DB**, y el texto de la interpretación nombra explícitamente la regla de Zhu Xi. Esto indica que el
bug de "resumen muestra Alfred Huang" **no era una corrupción de dato persistido**, sino un
**síntoma transitorio del lado cliente durante esa sesión en vivo**: el evento SSE `final_ready` (el
único punto, de los 7 puntos de salida de `route.ts`, que carecía del campo antes del fix — ver
10.2) hacía que la tarjeta de resumen mostrara el valor por defecto justo al terminar de generarse
la consulta, aunque la persistencia a DB (que usa `resolvedLineReadingSystem` por una ruta de
código distinta a la del evento SSE) nunca estuvo mal. Implicación práctica: si el usuario recarga
hoy ese hilo histórico, la tarjeta de resumen mostrará "Zhu Xi" correctamente, porque lee de la
columna de DB (siempre correcta), no del payload SSE original (que sí tuvo el bug en el momento).

La posición 7 (post-fix) también tiene `line_reading_system = 'zhuxi'` y su interpretación en
español dice explícitamente *"la regla de Zhu Xi indica que el énfasis recae sobre el Juicio del
hexagrama primario..."* — confirma que el fix del evento SSE no alteró el comportamiento correcto
que ya existía en la ruta de persistencia.

## 11.4 — Correlación con Axiom: confirmado por el commit de Vercel realmente desplegado

Se consultó el dataset `iching-app-main` (API REST `_apl`, ver
[[reference_axiom_query]]) filtrando por `message == "consult_phase"` y el `userId` (prefijo
`0c8b333c`) del hilo, en la ventana `2026-06-21T00:40:00Z`–`01:45:00Z`. Cada log de producción
incluye el campo `git.commit` — el hash exacto del despliegue activo en Vercel en ese instante,
dato que ninguna lectura de código o de DB puede dar por sí sola:

| Hora (UTC) | Fase | `git.commit` desplegado |
|---|---|---|
| 00:46:33 – 00:47:20 | auth_ok → persist_done (fila con el bug) | `2670b95` — **anterior** al fix (`8d2d09e`/merge `a8330ab`) |
| 01:31:35 – 01:32:43 | auth_ok → persist_done (fila corregida) | `27dc168` — descendiente de `a8330ab`, **incluye el fix** |
| 01:36:31 – 01:37:14 | auth_ok → persist_done (fila siguiente) | `27dc168` — mismo despliegue |

Esto es la confirmación más fuerte posible sin necesidad de inferencia: el bug ocurrió bajo el
commit que de verdad estaba desplegado en `theoriginaliching.com` en ese momento (anterior al fix),
y la corrección ocurrió bajo un commit que ya contenía el fix como ancestro — no es una coincidencia
de timing, es el dato exacto de qué código corrió cada request. Cero logs `level == "error"` para
este usuario en toda la ventana — el bug nunca generó una excepción server-side, consistente con ser
un defecto de lógica (idioma mal detectado, campo faltante) y no un crash.

## 11.5 — Conclusión de la Parte 11

**Ambas tiradas reportadas se localizaron en la base de datos de producción real y su contenido
confirma el reporte exacto del usuario para el bug de idioma**, mientras que **revela que el bug de
"resumen Huang" nunca corrompió el dato persistido — fue un síntoma transitorio del payload SSE en
esa sesión en vivo**, ya corregido en el código (Parte 10) y sin necesidad de ningún backfill o
migración de datos, porque la fuente de verdad (columna `line_reading_system` en DB) siempre fue
correcta. La telemetría de Axiom corrobora de forma independiente y no ambigua (vía `git.commit`
por request) que el fix estaba desplegado y activo en producción para el momento de la segunda
tirada. No se requirió ninguna acción correctiva adicional sobre los datos existentes.
