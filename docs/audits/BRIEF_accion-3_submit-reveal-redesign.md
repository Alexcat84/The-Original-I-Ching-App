# Brief de Implementación — Acción 3: Rediseño del ciclo submit→reveal
## The Original I Ching App — para Claude Code

| Campo | Valor |
|---|---|
| **Fecha** | 2026-06-13 |
| **Commit base** | `51f4546` |
| **Archivo principal** | `apps/web/src/app/page.tsx` |
| **Plan padre** | `AUDIT_2026-06-13_animation-plan-v3-DEFINITIVO.md` (§3) |
| **Prerequisito** | Acción 1 (TDZ + Sentry) ya aplicada (`action-1-tdz-sentry.patch`) |
| **Esfuerzo** | ~12–16 h. Es un rediseño, no una limpieza. |

---

## 1. Objetivo

Hoy la animación del ritual y la transición a la lectura **no están coordinadas**: la transición corre al **cerrar el stream**, no al **terminar la animación**. Resultado observado en producción: la respuesta aparece mientras la animación aún corre (layout shift) y, con el TDZ, desaparecía.

Objetivo: la transición a lectura debe ocurrir **solo cuando se cumplan dos condiciones** — (a) la animación alcanzó su build-min/finale, y (b) los datos están listos (`final_ready` en SSE, o body completo en JSON). El texto se revela con efecto máquina de escribir (reutilizando el hook existente). Sin pintar deltas durante la animación.

---

## 2. Estado actual (verificado en código)

### 2.1 Animación (I Ching, SSE)
- `runIChingRitualReveal` (función local en `submitConsult`): dibuja 12 ticks (`tickDelayMs` c/u), luego `setRitualStatusPhase("seal")` + `setRitualFinale(true)`, y **resuelve**. No espera la respuesta; el "hold" del finale lo da que la transición a lectura ocurre aparte.
- Se arranca en `startLineReveal()` desde el evento `cast_ready`. Su promesa (`revealPromise`) **no se espera** (`if (revealPromise) void revealPromise;` post-loop).

### 2.2 Loop SSE
- `oracle_delta` (L~3827): acumula en `streamingDeltaAccRef`, flush c/150ms → `setStreamingText`. **(A eliminar.)**
- `oracle_ready` (L~3838): `setStreamingText(interpretation)`. **(A eliminar el render; el dato autoritativo es `final_ready`.)**
- `final_ready` (L~3848): **solo** `finalPayload = payload`. **(Aquí debe dispararse `dataReady` + `tryAdvanceToFinale`.)**
- `error` (L~3865): `streamErrored = true` + `setError`.

### 2.3 Transición a lectura (post-loop, corre al cerrar el stream)
Bloque tras `data = finalPayload` (L~3886) y luego ~L4088–4188, en orden:
1. construye `item`
2. `updateActiveSession(...)` (L4088) — añade al hilo
3. `setRevealConsultationId(item.consultationId)` (L4119) — **dispara el reveal progresivo existente**
4. `setTokenBalance`, `setDailyCount`, store de wall-ms (L4144)
5. `setStreamingText(null)` + `setPhase("reading")` (L4154)
6. `finally`: `setLoading(false)` (L4188)

### 2.4 El typewriter YA existe
`setRevealConsultationId` → `InterpretationBody` (L4814, con `reveal`) → `useProgressiveRevealSubstring` (`apps/web/src/hooks/useProgressiveRevealSubstring.ts`, revela por párrafos en 2.2–7.5 s). **No hay que crear un componente nuevo** — solo (Acción 5) parametrizar su duración y (Acción 3) disparar el reveal en el momento correcto.

### 2.5 Huesos (JSON, no SSE)
Path JSON: el dato es el body completo de la respuesta, no `final_ready`. La animación de huesos (`BoneRitualAnimation`) se gobierna por props `isProcessing`/`oracleResult`; tras la respuesta corre `crack → reveal`. Hoy hay un delay fijo (~4050 ms). Debe usar el **mismo** `commitReadingTransition` gated.

### 2.6 Fuera de alcance
**Manual cast I Ching** (usa JSON + `ICHING_MANUAL_FINALE_*`, `manualRitualPhaseSwitchTimerRef`). No se toca en esta acción.

---

## 3. Arquitectura objetivo

Señal autoritativa única de "datos listos" = `dataReady`. La transición se difiere a una función `commitReadingTransition(data)` que **solo** corre cuando `dataReady && buildMinReached`.

```
estado coordinador (refs, no state, para evitar stale closures):
  dataReadyRef            = false
  finalPayloadRef         = null
  buildMinReachedRef      = false
  committedRef            = false   // idempotencia: commit una sola vez

onCastReady(lines):       startBuildStage()      // runIChingRitualReveal (ticks)
onBuildMinReached():      buildMinReachedRef=true; tryAdvanceToFinale()   // tras 12 ticks
onFinalReady(payload):    // DENTRO del handler SSE (C3)
   if (!payload?.interpretation) return onStreamError("incomplete")
   finalPayloadRef=payload; dataReadyRef=true; tryAdvanceToFinale()
onJsonResponse(body):     // huesos / auto-JSON
   finalPayloadRef=body; dataReadyRef=true; buildMinReachedRef=true (o gate por fire-min); tryAdvanceToFinale()

tryAdvanceToFinale():
   if (committedRef || !dataReadyRef || !buildMinReachedRef) return
   committedRef = true
   playFinaleThenReveal(finalPayloadRef)   // finale (ya seteado) → dwell min → reveal

playFinaleThenReveal(data):
   // el estado de finale (seal / hexagrama único) ya está visible
   await dwell(ICHING_FINALE_MIN_MS)        // §Acción 4
   commitReadingTransition(data)            // el bloque 2.3, ahora aquí
```

**Invariante anti-carrera:** `commitReadingTransition` se llama **una sola vez**, desde `tryAdvanceToFinale`, y solo con ambas condiciones. Nunca desde el cierre del stream directamente.

---

## 4. Pasos concretos

### Paso A — Extraer la transición
Mover el bloque 2.3 (construcción de `item` + pasos 2–6) a una función `commitReadingTransition(data)`. **No** llamarla post-loop; llamarla solo desde `playFinaleThenReveal`.

### Paso B — Coordinador
Añadir refs: `dataReadyRef`, `finalPayloadRef`, `buildMinReachedRef`, `committedRef` (resetear todos al iniciar cada `submitConsult`). Implementar `tryAdvanceToFinale()` y `playFinaleThenReveal()` como en §3.

### Paso C — Handler `final_ready`
Reemplazar el cuerpo actual (`finalPayload = payload`) por: validar `interpretation` (si falta → tratar como error/recovery), `finalPayloadRef = payload`, `dataReadyRef = true`, `tryAdvanceToFinale()`. Mantener `finalPayload` local si otras ramas post-loop lo usan, pero **la transición ya no depende del cierre del loop**.

### Paso D — Animación señaliza build-min
En `runIChingRitualReveal`, tras el `for` de 12 ticks: además de `setRitualFinale(true)`, marcar `buildMinReachedRef = true` y llamar `tryAdvanceToFinale()`. El finale permanece visible (no cambia) hasta que `commitReadingTransition` haga `setPhase("reading")`.

### Paso E — Eliminar render progresivo
- Quitar la rama `oracle_delta` del loop (L~3827–3837).
- Quitar el set de `setStreamingText` en `oracle_ready` (L~3838–3847) — el evento puede seguir llegando, se ignora para render.
- Eliminar el estado `streamingText` (L622) y refs `streamingDeltaAccRef`, `streamingFlushTimerRef`, y su limpieza.
- Quitar el render `{streamingText && loading ? <InterpretationBody text={streamingText} reveal={false} /> : …}` (L~4899–4907).

### Paso F — Huesos (JSON)
En el path JSON, al recibir el body: `finalPayloadRef = body`, `dataReadyRef = true`, gatear `buildMinReachedRef` con el piso de fuego (`BONES_FIRE_MIN_MS`, Acción 4), `tryAdvanceToFinale()`. Reemplazar el delay fijo (~4050 ms) por el gate. El `crack → reveal` de `BoneRitualAnimation` ocurre en su finale tras `commitReadingTransition`.

### Paso G — Watchdog + recovery (Acción 6, integrar aquí)
- Watchdog `max(budget × 2.5, 120_000)` armado al iniciar `submitConsult`; si dispara y `!committedRef` → orden **watchdog → `attemptThreadRecovery()` → error**. No mostrar error si recovery está en curso o tuvo éxito.
- Limpiar el watchdog en `commitReadingTransition` y en el `finally`.

### Paso H — Typewriter (Acción 5, ya disparado por D/A)
El reveal lo dispara `setRevealConsultationId` dentro de `commitReadingTransition`. Parametrizar `useProgressiveRevealSubstring` por llamada (`msPerChar≈1.2`, `minMs=1200`, `maxMs=3500`) y respetar `prefers-reduced-motion`. **No** alterar el default global (otros usos del hook).

---

## 5. Variables de estado — alta/baja

| Acción | Símbolo | Nota |
|---|---|---|
| Añadir | `dataReadyRef`, `finalPayloadRef`, `buildMinReachedRef`, `committedRef` | refs; reset por submit |
| Añadir | watchdog timer ref | Paso G |
| Eliminar | `streamingText` (state), `streamingDeltaAccRef`, `streamingFlushTimerRef` | Paso E |
| Conservar | `ritualFinale`, `ritualStatusPhase`, `revealConsultationId`, `phase`, `loading` | la transición ahora los setea diferidos |

---

## 6. Casos borde / invariantes

1. **Respuesta antes que la animación:** `dataReadyRef=true` pero `buildMinReachedRef=false` → `tryAdvanceToFinale` no commitea; la animación termina sus 12 ticks y entonces commitea. (Las etapas se cumplen.)
2. **Animación antes que la respuesta:** `buildMinReachedRef=true` pero `!dataReadyRef` → el finale (seal/hexagrama) **se mantiene visible** hasta `final_ready`. (Hold hasta la respuesta.)
3. **`final_ready` con `imageUrl: null`** (B1/B2/B3): commitear igual; el slot de imagen usa shimmer/fallback. No romper el reveal.
4. **Stream error / EOF sin `final_ready`:** no commitear; Paso G (recovery → error). La lectura, si persistió, se recupera al recargar.
5. **Idempotencia:** `committedRef` evita doble transición si ambas señales llegan casi simultáneas.
6. **Doble reveal:** asegurar que NO queda ningún render de `streamingText` activo en paralelo al reveal de `InterpretationBody` (Paso E completo).

---

## 7. Criterios de aceptación

1. I Ching individual: 12 líneas → hexagrama → (espera datos) → typewriter; sin texto durante la animación; sin layout shift.
2. I Ching M3: igual, ritual ~58 s (presupuesto segmentado, Acción 2), sin hold muerto.
3. Huesos (JSON): fuego ≥ `BONES_FIRE_MIN_MS` → crack → reveal del veredicto → typewriter; mismo gate.
4. Respuesta rápida (cacheada): pisos se cumplen, sin flash del hilo antes del finale.
5. Respuesta lenta (M3 largo): finale se mantiene hasta `dataReady`; watchdog ~145 s no dispara falso positivo.
6. Error/EOF: watchdog → recovery → error; sin pantalla colgada; sin error si recovery activo.
7. `prefers-reduced-motion`: texto de golpe.
8. **#11:** con respuesta a ~52 s, la UI permanece en fase ritual hasta `build-min + finale + typewriter` — sin flash del hilo antes.
9. Sin regresión del manual cast (fuera de alcance).

---

## 8. Anclas de código (commit `51f4546`, `page.tsx`)

| Referencia | Línea aprox. |
|---|---|
| `runIChingRitualReveal` (def) | ~3700 (justo antes del bloque SSE) |
| `startLineReveal` | ~3786 |
| loop SSE / `oracle_delta` | ~3827 |
| `oracle_ready` | ~3838 |
| `final_ready` handler | ~3848 |
| `error` handler | ~3865 |
| post-loop `data = finalPayload` | ~3886 |
| `updateActiveSession` | ~4088 |
| `setRevealConsultationId` | ~4119 |
| store wall-ms (`lastIchingConsultWallMsRef`) | ~4144 |
| `setStreamingText(null)` + `setPhase("reading")` | ~4154 |
| `finally` / `setLoading(false)` | ~4188 |
| `streamingText` state | ~622 |
| render `streamingText` | ~4899 |
| `InterpretationBody` (def / uso) | ~401 / ~4814 |
| `useProgressiveRevealSubstring` | `hooks/useProgressiveRevealSubstring.ts` |

> Nota: si `main` avanzó desde `51f4546`, las líneas se desplazan — usar los nombres de símbolos como ancla primaria, no los números.

---

*Brief generado el 2026-06-13. Define la Acción 3 (rediseño submit→reveal con gate animación/datos) para Claude Code. Núcleo del plan v3.*
