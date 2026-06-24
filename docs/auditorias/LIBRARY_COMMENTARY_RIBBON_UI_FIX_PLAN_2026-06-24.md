# Biblioteca — plan de corrección UI acordeón ribbon (Juicio / Imagen / Líneas)

- **Fecha:** 2026-06-24
- **Estado:** 🟡 **Plan aprobado — pendiente implementación**
- **Relacionado:** [`LIBRARY_COMMENTARY_LAYER_2026-06-23.md`](./LIBRARY_COMMENTARY_LAYER_2026-06-23.md) (feature original), [`HexagramTabs.tsx`](../../apps/web/src/components/library/HexagramTabs.tsx), [`globals.css`](../../apps/web/src/app/globals.css) (~L5676–6044)
- **Alcance:** solo UI web Biblioteca · sin cambios en datasets, motor IA, billing ni API

---

## 1. Síntoma (staging actual)

Tras el merge de la capa de comentario opcional (2026-06-23), la UI en staging no cumple el diseño acordado:

| Área | Comportamiento actual (incorrecto) | Comportamiento esperado |
|------|-----------------------------------|-------------------------|
| Juicio / Imagen | Toggle `+` en `.library-section-head` (arriba a la derecha del título). Al abrir, el panel se inserta **encima** del `.library-text-card`. | Texto oráculo **siempre arriba**, fijo. Toggle abajo-derecha, **ancho completo** de columna. Solo la cinta de comentario se expande **debajo** del card. |
| Líneas | Columna estrecha `__plus` (2.5rem) con panel inline **y** fila duplicada `library-lines-row--commentary` con el mismo contenido. | Una fila por línea (siempre visible) + fila ribbon `colSpan` full-width debajo. **Sin duplicado**. |
| Icono | `+` que rota 45° (parece `×`). Solo un botón. | Círculo sólido estilo acordeón: `+` cerrado → `−` abierto (texto explícito, sin rotación). |
| Contenido extenso | Un solo toggle arriba; hay que volver arriba para colapsar. | `−` también al **final** del panel cuando está abierto. |
| Animación | `{isOpen ? panel : null}` (mount/unmount, sin transición). | Panel siempre en DOM; colapso con `grid-template-rows: 0fr → 1fr`. |

### Causa raíz (código)

1. `CommentaryPlusToggle` renderiza botón **y** panel como fragmento inline; en Juicio/Imagen el toggle vive en el head, por lo que el panel queda antes del card.
2. En la tabla, `WilhelmPointToggle` pinta panel dentro de `<td class="library-lines-table__plus">` mientras la fila `--commentary` repite el mismo JSX.
3. El icono usa `transform: rotate(45deg)` en `.library-commentary-plus.is-open span`.

---

## 2. Objetivo UX

Patrón único **`CommentaryRibbon`** para todos los puntos (Juicio, Imagen, cada Línea, yong):

```
h3 (solo Juicio/Imagen)
┌─ library-text-card ─────────────────────────┐
│  TEXTO ORÁCULO — siempre visible            │
└─────────────────────────────────────────────┘
┌─ library-ribbon__bar (full width) ──── [+] ┘  ← cerrado
┌─ library-ribbon__panel (colapsado) ─────────┐
│  COMENTARIO…                                │
│  ──────────────────────────────────── [−]   │  ← abierto: − al final
└─────────────────────────────────────────────┘
```

Reglas invariantes:

- El contenido oráculo **nunca** se oculta ni cambia de posición.
- Solo la **cinta de comentario** expande/colapsa (oculta por defecto).
- Al abrir: barra superior muestra `−`; barra inferior con `−` **siempre** presente (requisito para comentarios largos).
- Estilos reactivos **claro / oscuro** vía tokens CSS existentes (`--commentary-accent`, `--secondary-bg`, etc.).

Bloques hex-level (About, Wen Yen, footnotes Legge) mantienen `<details class="library-commentary">` en esta fase; unificación visual opcional en fase 2.

---

## 3. Diseño técnico

### 3.1 Componente nuevo

**Archivo:** [`apps/web/src/components/library/CommentaryRibbon.tsx`](../../apps/web/src/components/library/CommentaryRibbon.tsx)

```tsx
interface CommentaryRibbonProps {
  panelId: string;
  ariaLabel: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}
```

**DOM:**

```
.library-ribbon
  .library-ribbon__bar
    button.library-ribbon__toggle  → "+" | "−"
  .library-ribbon__panel[.is-open]
    .library-ribbon__panel-inner
      {children}
      .library-ribbon__bar.library-ribbon__bar--footer  (solo si isOpen)
        button.library-ribbon__toggle  → "−"
```

**Estado:** controlado con el `Set<string>` existente en `TabPanel` (necesario porque trigger y panel en tabla no pueden ser un solo `<details>`).

**Helpers de contenido** (sin botón):

- `CommentaryPanelBodyWilhelm` — Wilhelm book-one + Ten Wings sub-etiquetados.
- `CommentaryPanelBodySingle` — Legge Gran/Lesser Symbolism.

Eliminar: `CommentaryPlusToggle`, `WilhelmPointToggle`, `SingleSourceToggle` (lógica absorbida por ribbon + panel body).

### 3.2 Juicio e Imagen

Reestructurar [`HexagramTabs.tsx`](../../apps/web/src/components/library/HexagramTabs.tsx) ~L278–345:

- Quitar `.library-section-head` con toggle.
- Orden: `h3` → `.library-text-card` → `CommentaryRibbon` (si hay comentario).
- Legge Juicio: sin ribbon (asimetría documentada en capa original).

### 3.3 Líneas

- Tabla **3 columnas** (pos, symbol, text); eliminar `__plus`.
- Por línea con comentario: fila principal + fila `library-lines-row--ribbon` con `<td colSpan={3}><CommentaryRibbon>…</CommentaryRibbon></td>`.
- Eliminar bloque duplicado L407–424 y panel inline en celda estrecha.
- Yong: misma lógica.

### 3.4 CSS

**Añadir** en [`globals.css`](../../apps/web/src/app/globals.css):

| Clase | Rol |
|-------|-----|
| `.library-ribbon` | Contenedor full-width |
| `.library-ribbon__bar` | Flex, `justify-content: flex-end` |
| `.library-ribbon__bar--footer` | Borde superior + `−` al final del panel |
| `.library-ribbon__toggle` | Círculo accent, `+`/`−`, sombras inset |
| `.library-ribbon__panel` / `__panel-inner` | Grid 0fr/1fr + gradiente tema |

**Eliminar:** `.library-commentary-plus*`, `.library-section-head` (si sin uso), `.library-lines-table__plus`.

**Animación:**

```css
.library-ribbon__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.4s cubic-bezier(0.865, 0.14, 0.095, 0.87);
}
.library-ribbon__panel.is-open {
  grid-template-rows: 1fr;
}
.library-ribbon__panel-inner {
  overflow: hidden;
}
```

---

## 4. Plan de implementación (orden obligatorio)

| Fase | Tarea | Entregable |
|------|-------|------------|
| **1** | Crear `CommentaryRibbon.tsx` + CSS base | Componente con barra superior, panel animado, footer `−` |
| **2** | Migrar Juicio e Imagen | Oracle arriba; ribbon debajo; sin head toggle |
| **3** | Refactor tabla Líneas | 3 cols + fila ribbon; eliminar duplicado |
| **4** | Limpiar CSS muerto | Sin referencias a `library-commentary-plus` |
| **5** | Smoke visual | Checklist §6 en staging local o preview |

**Sin tocar:** `packages/iching-data`, API `/api/library`, prompt Claude, i18n (salvo clave opcional `commentaryHideLabel` para footer toggle).

---

## 5. Riesgos y mitigaciones

Cada riesgo incluye mitigación **obligatoria antes de merge** y verificación concreta.

### R1 — Animación CSS dentro de `<table>`

| | |
|---|---|
| **Riesgo** | Animar `<tr>` o `height` en celdas de tabla produce saltos de layout o transiciones rotas en Safari/Firefox. |
| **Impacto** | Panel parpadea, fila no colapsa, scroll horizontal indeseado. |
| **Mitigación** | Nunca animar la `<tr>`. La fila ribbon usa `colSpan={3}` con un `div.library-ribbon` block interno. La transición `grid-template-rows` vive solo en `.library-ribbon__panel`. |
| **Verificación** | DevTools: expandir Línea 1 hex 1 Wilhelm; inspeccionar `grid-template-rows` 0fr→1fr; sin reflow de columnas pos/symbol/text. |

### R2 — Doble render de comentario en líneas (regresión)

| | |
|---|---|
| **Riesgo** | Mantener `WilhelmPointToggle` inline **y** fila `--commentary` duplica contenido y DOM. |
| **Impacto** | Texto repetido, panel estrecho a la derecha (capturas del bug). |
| **Mitigación** | Eliminar por completo `CommentaryPlusToggle` y la fila `--commentary` con JSX duplicado. Una sola vía: `CommentaryRibbon` en fila `--ribbon`. |
| **Verificación** | `rg "library-lines-row--commentary"` → 0 usos duplicados de párrafos; DOM: un solo `#commentary-line-N` por línea. |

### R3 — Panel encima del oráculo (Juicio/Imagen)

| | |
|---|---|
| **Riesgo** | Toggle en `.library-section-head` inserta panel antes del `.library-text-card`. |
| **Impacto** | Comentario aparece arriba del juicio/imagen (captura con X roja). |
| **Mitigación** | JSX estricto: `h3` → `.library-text-card` → `CommentaryRibbon`. El ribbon nunca es hijo del head. |
| **Verificación** | Hex 1 Wilhelm: abrir Juicio; el card con bullets permanece arriba; cinta debajo. |

### R4 — Sin `−` al final en contenido extenso

| | |
|---|---|
| **Riesgo** | Un solo toggle arriba obliga scroll de vuelta para colapsar (Wilhelm hex 1, Ten Wings largos). |
| **Impacto** | UX rota en lecturas profundas. |
| **Mitigación** | Renderizar `.library-ribbon__bar--footer` con botón `−` **siempre que `isOpen === true`**, al final de `.library-ribbon__panel-inner`. No condicionar por altura. Ambos botones comparten `onToggle`. |
| **Verificación** | Hex 1 Juicio abierto: scroll hasta el final del comentario; `−` visible y colapsa el panel. |

### R5 — Icono `×` en lugar de `−`

| | |
|---|---|
| **Riesgo** | `transform: rotate(45deg)` sobre `+` se percibe como cerrar, no colapsar. |
| **Impacto** | Confusión visual; no coincide con referencia de diseño. |
| **Mitigación** | Contenido textual explícito: `"+"` cerrado, `"−"` (U+2212 o hyphen-minus consistente) abierto. Prohibido `rotate` en el icono. |
| **Verificación** | QA visual cerrado/abierto en claro y oscuro. |

### R6 — Mount/unmount sin transición

| | |
|---|---|
| **Riesgo** | `{isOpen ? panel : null}` impide animación de altura. |
| **Impacto** | Aparición brusca; sensación de bug. |
| **Mitigación** | Panel siempre montado; clase `.is-open` controla grid rows; `aria-hidden={!isOpen}` cuando colapsado. |
| **Verificación** | Abrir/cerrar ribbon: transición ~400ms visible. |

### R7 — Wilhelm + Legge en el mismo punto (Imagen / Línea)

| | |
|---|---|
| **Riesgo** | Dos ribbons o dos claves de estado compiten en el mismo slot. |
| **Impacto** | Doble `+` o panel parcial. |
| **Mitigación** | Un solo `CommentaryRibbon` por punto; un solo `panelId` y clave de estado (`image`, `line-N`, `yong`). Cuerpo concatena `CommentaryPanelBodyWilhelm` y/o `CommentaryPanelBodySingle` según tab activo (solo uno aplica por tab, pero la estructura soporta ambos bloques en el mismo panel si algún día se mezclan fuentes). |
| **Verificación** | Tab Wilhelm hex 1 Línea 1: un `+`. Tab Legge hex 1 Imagen: un `+`. |

### R8 — Contraste claro / oscuro

| | |
|---|---|
| **Riesgo** | Copiar gradientes fijos del ejemplo SCSS (`#444`, `#222`) rompe tema claro o pierde contraste en dark. |
| **Impacto** | Texto ilegible o panel que no respeta `--fg` / `--secondary-bg`. |
| **Mitigación** | Gradientes con `color-mix(in srgb, var(--secondary-bg) …, var(--fg))`; overrides en `html[data-theme="dark"]`. Reutilizar `--commentary-accent` para borde inset y botón. |
| **Verificación** | Toggle tema en hex 1: panel y botones legibles en ambos modos. |

### R9 — Accesibilidad (doble toggle + panel oculto)

| | |
|---|---|
| **Riesgo** | Dos botones confunden lectores de pantalla; contenido colapsado sigue siendo focusable. |
| **Impacto** | WCAG: foco atrapado en contenido invisible. |
| **Mitigación** | Ambos toggles: `aria-expanded`, `aria-controls={panelId}`. Footer: reutilizar `ariaLabel` o añadir `commentaryHideLabel` en i18n (11 locales). Panel colapsado: `aria-hidden="true"`; evaluar `inert` en el inner si el navegador objetivo lo soporta. `:focus-visible` en ambos botones. |
| **Verificación** | Tab con panel cerrado no entra al comentario; axe o inspección manual de árbol ARIA. |

### R10 — Viewport móvil estrecho

| | |
|---|---|
| **Riesgo** | Columna `__plus` eliminada pero ribbon no ocupa 100% o tabla desborda. |
| **Impacto** | Toggle fuera de pantalla; scroll horizontal. |
| **Mitigación** | `.library-ribbon { width: 100%; }`; mantener `.library-lines-table-wrap { overflow-x: auto; }`; padding simétrico en barras. |
| **Verificación** | 320px width: ribbon alineado a la derecha dentro de la columna; sin panel vertical partido. |

### R11 — Regresión Zhou Yi

| | |
|---|---|
| **Riesgo** | Ribbon accidental en tab sin comentario. |
| **Impacto** | UI inconsistente con política “Zhou Yi sin notas”. |
| **Mitigación** | Render condicional sin cambiar: `wilhelmCommentary` / `leggeCommentary` null en tab zhouyi → cero ribbons por punto. |
| **Verificación** | Tab Zhou Yi cualquier hex: sin botones `+` en Juicio/Imagen/Líneas. |

### R12 — CSS huérfano

| | |
|---|---|
| **Riesgo** | Estilos `.library-commentary-plus*` sin uso compiten con ribbon. |
| **Impacto** | Especificidad impredecible, botones fantasma en cache. |
| **Mitigación** | Eliminar clases muertas en el **mismo PR** que introduce ribbon. `rg library-commentary-plus` → 0 en TSX/CSS activo. |
| **Verificación** | Grep limpio post-merge. |

---

## 6. Criterios de aceptación (checklist pre-merge)

### Juicio / Imagen (Wilhelm hex 1)

- [ ] Título + bullets del oráculo siempre arriba, nunca se ocultan.
- [ ] Barra `+` abajo-derecha, ancho completo de columna.
- [ ] Al abrir: barra superior `−`; cinta Wilhelm + Diez Alas **debajo** del card.
- [ ] Al final del comentario: segunda barra con `−` que colapsa el panel.
- [ ] Al colapsar: vuelve a `+`; animación suave.

### Imagen (Legge hex 1)

- [ ] Gran Simbolismo solo en cinta; oráculo intacto arriba.

### Líneas

- [ ] Sin columna estrecha derecha.
- [ ] Texto de línea siempre en fila principal.
- [ ] Una sola cinta full-width; sin contenido duplicado.
- [ ] `−` al final accesible tras scroll en comentario largo.

### Tema y plataforma

- [ ] Contraste legible claro y oscuro.
- [ ] Zhou Yi sin ribbons.
- [ ] Viewport 320px sin regresión de layout.

---

## 7. Archivos a modificar

| Archivo | Acción |
|---------|--------|
| [`apps/web/src/components/library/CommentaryRibbon.tsx`](../../apps/web/src/components/library/CommentaryRibbon.tsx) | **Crear** |
| [`apps/web/src/components/library/HexagramTabs.tsx`](../../apps/web/src/components/library/HexagramTabs.tsx) | Reestructurar; eliminar toggles viejos |
| [`apps/web/src/app/globals.css`](../../apps/web/src/app/globals.css) | Estilos ribbon; limpiar plus/columna |
| [`packages/i18n/src/messages/library-page-ui.ts`](../../packages/i18n/src/messages/library-page-ui.ts) | **Opcional:** `commentaryHideLabel` (11 locales) para footer `−` |

---

## 8. Seguimiento post-implementación

Al cerrar el fix:

1. Actualizar este doc: estado → ✅ Cerrada, commits regression + fix.
2. Añadir nota breve en [`LIBRARY_COMMENTARY_LAYER_2026-06-23.md`](./LIBRARY_COMMENTARY_LAYER_2026-06-23.md) §8 apuntando a este plan.
3. Smoke en staging antes de promover a `main` (solo web; APK no afectado salvo WebView cache).

---

## 9. Fuera de alcance (esta iteración)

- Gate H7 verbatim juicio/imagen en prompt IA.
- Unificar `<details>` hex-level al patrón ribbon.
- Cambios en datasets o `HexagramRecord`.
