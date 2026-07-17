# Fix: desalineamiento del diagrama de tirada sin líneas cambiantes

**Código:** `20260717-FIX-UI-01 cast-diagram-header-misalignment` · **Familia:** UI · **Estado:** closed

- **Fecha:** 2026-07-17
- **Reportado por:** owner (capturas de sesiones anteriores: hexagramas #1, #7, #27, #29)
- **Componente:** [`apps/web/src/components/mutation-explorer/CastRitualDiagram.tsx`](../../apps/web/src/components/mutation-explorer/CastRitualDiagram.tsx) + `apps/web/src/app/globals.css`

---

## Síntoma

En la vista "Verificación de lectura" (MutationExplorer, a la que enlaza el registro de consulta), el hexagrama de la **derecha** aparecía corrido hacia **arriba** respecto al de la **izquierda**: las líneas no cuadraban fila-por-fila y las flechas `→` alineaban solo con la columna izquierda. Visible en toda tirada con "Líneas mutantes: Ninguna".

## Determinismo (no fue transitorio)

Es un bug de layout **determinista** que afecta a **cualquier** tirada sin líneas cambiantes, sin depender del hexagrama. Los cuatro reportados (#1 乾, #7 師, #27 頤, #29 坎) coincidían todos en "Ninguna" línea mutante. Con líneas cambiantes el diagrama sí alineaba (ambas columnas tenían encabezado).

## Causa raíz

`CastRitualDiagram` renderiza tres columnas (hexagrama origen, flechas, hexagrama transformado). Cada columna baja su stack de líneas por la altura de su encabezado (`#N 名` + nombre). El encabezado de la columna transformada se renderizaba solo `if (transformedHeader)`:

- **Sin líneas cambiantes** → `transformedHeader = null` (MutationExplorer.tsx: `consultationTransformedHex ? {...} : null`, y `transformedHexagram` es null cuando no hay mutación).
- Columna izquierda: encabezado presente → stack baja.
- Columna de flechas: `arrow-spacer` reservaba la altura → flechas bajan (alineadas con la izquierda).
- Columna derecha: sin encabezado → stack **no** baja → queda más arriba.

El `arrow-spacer` compensaba la altura para las flechas, pero **no** para la columna derecha.

## Fix

Un `HeaderSlot` que, cuando una columna no tiene encabezado pero la otra sí (`reserve = primaryHeader || transformedHeader`), renderiza un **placeholder invisible con la misma estructura** del encabezado (`data-placeholder="true"` + `visibility: hidden` en CSS, contenido `&nbsp;`). Reutiliza `.mutation-explorer-cast-header` (misma `min-height: 2.35rem` + `margin-bottom: 0.45rem`), así reserva la altura exacta sin importar el largo del nombre. Ambos stacks arrancan a la misma `y`.

Simétrico: si en algún caso solo existiera `transformedHeader`, la columna izquierda recibiría el placeholder.

## Verificación

- `tsc --noEmit` verde.
- Sin test unitario: es alineación pura de CSS/layout; se valida visualmente (tirada sin mutación → derecha cuadra con izquierda; tirada con mutación → sigue alineada, caso no tocado).
- Alcance: fix del **web**; la vista se carga en el WebView del APK, así que llega a web + móvil en el próximo deploy, sin nueva versión de APK.

## Commit

`fix(mutation-explorer): align left/right hex stacks when there are no changing lines` (rama staging → main, 2026-07-17).
