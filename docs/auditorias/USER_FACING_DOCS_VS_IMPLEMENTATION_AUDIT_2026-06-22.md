# Auditoría — Documentación de producto vs implementación (jun 2026)

- **Fecha:** 2026-06-22
- **Estado:** 🟡 **Abierta** — inventario verificado; remediación P0–P3 pendiente de aprobación
- **Alcance:** Todo lo que lee el usuario final, **excluyendo** `/privacy` y `/terms`
- **Disparador:** Verificar que guía, notas, FAQ, auditorías públicas, pricing e in-app copy reflejen lo implementado, especialmente biblioteca (comentario W+L, ribbon UI, jun 2026)
- **Relacionado:**
  - [LIBRARY_COMMENTARY_LAYER_2026-06-23.md](./LIBRARY_COMMENTARY_LAYER_2026-06-23.md) — capa comentario implementada
  - [LIBRARY_COMMENTARY_RIBBON_UI_FIX_PLAN_2026-06-24.md](./LIBRARY_COMMENTARY_RIBBON_UI_FIX_PLAN_2026-06-24.md) — UI ribbon cerrada en `main`
  - [LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md](./LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md) — selector Huang/Zhu Xi
  - [DATA_INTEGRITY_AUDIT.md](./DATA_INTEGRITY_AUDIT.md) — fidelidad bundles (página `/audits`)

---

## 1. Resumen ejecutivo

| Estado | ~% features core |
|--------|------------------|
| Alineado | ~70% |
| Parcial | Biblioteca comentario, tokens Master, fidelidad pública |
| Incorrecto / roto | 2 textos erróneos + 2 anclas rotas |
| Copy muerto | `libraryFeatureBody` traducido en i18n pero **no renderizado** en `/guia` |

**Conclusión:** Oráculo, traductores, Huang/Zhu Xi, métodos, tiers y acceso Seeker+ a biblioteca están bien documentados. Lo nuevo de **junio 2026** (comentario académico W+L, ribbon `+`/`−`, búsqueda/trigramas, mutaciones enlazadas) **casi no aparece** en guía/notas; FAQ lo cubre **solo en parte** (Zhou Yi sin `+`). Hay **frases incorrectas** sobre reglas Zhu Xi y **deuda de copy** sin publicar.

---

## 2. Superficies auditadas

| Ruta / superficie | Fuente de texto | Shell |
|-------------------|-----------------|-------|
| `/guia` | `packages/i18n/src/messages/guia-page-ui.ts` | `apps/web/src/app/guia/page.tsx` |
| `/notes` | `notes-page-ui.ts` | `apps/web/src/app/notes/page.tsx` |
| `/faqs` | `faq-page-ui.ts` | `apps/web/src/app/faqs/page.tsx` |
| `/audits` | `audits-page-ui.ts` | `apps/web/src/app/audits/page.tsx` |
| `/pricing` | `pricing-ui.ts` + `token-pack-marketing-ui.ts` | `apps/web/src/app/pricing/page.tsx` |
| `/about` | `app-traceability-ui.ts` | `apps/web/src/app/about/page.tsx` |
| `/library` | `library-page-ui.ts` | `HexagramTabs.tsx`, `CommentaryRibbon.tsx`, etc. |
| In-app | `home-tour-ui.ts`, `home-chrome-ui.ts`, `token-panel-ui.ts`, `pdf-export-ui.ts` | `apps/web/src/app/page.tsx` |

**Excluido:** `/privacy`, `/terms`. **No hay `.md` en `apps/web`** — documentación = TSX + i18n.

---

## 3. Panel de consulta (I Ching)

| Feature | Implementación | ¿Doc? | Dónde | Notas |
|---------|----------------|-------|-------|-------|
| Orden Traductor → Lectura → Método → Ejecución | `page.tsx` panel | ✅ | `/guia#panel-opciones` | Orden coincide |
| 4 traductores + tiers | `page.tsx`, `credits.ts` | ✅ | Guía, FAQ, pricing | OK |
| Master (3) = 2 tokens | `consult/route.ts` L728 | ⚠️ | FAQ, marketing packs | **Guía `#tokens` dice 1 token sin excepción** |
| Huang / Zhu Xi + persistencia | `074`, `page.tsx` | ✅ | Guía, notas, FAQ, tour | OK |
| Tres monedas + varas Zhou | wizards + engine | ✅ | Guía `#metodo` | OK |
| Auto vs manual | `page.tsx` | ✅ | Guía `#ejecucion` | OK |
| Huesos (4 veredictos, auto) | `oracle-bones-engine` | ✅ | Guía `#modos-consulta` | OK |
| Idioma respuesta = pregunta | `detect-input-language.ts` | ✅ | FAQ | OK |
| PDF: traductor + lectura líneas | `pdf-chat-export.ts` | ❌ | Labels en PDF only | Guía `#exportar` no lo menciona |
| Imagen por tier (resolución) | `image-provider.ts` | ⚠️ | `/pricing` marketing | No en guía/FAQ |

### 3.1 Errores factuales (P0)

**A — Guía ejecución (`ichingCastModeP1`, 11 locales)**

Texto actual (EN): *"the server applies the same **Zhu Xi rules**…"*

Realidad: aplica el sistema **seleccionado** (Huang default, Zhu Xi opcional). Auto/manual no cambia la regla; la cambia el selector «Lectura de líneas cambiantes».

**B — Tour paso 4 (`home-tour-ui.ts` `step4Body`)**

Texto: *"I Ching (coins, **Zhu Xi tradition**)…"* — implica Zhu Xi como tradición default del I Ching; default es **Huang**.

---

## 4. Biblioteca (`/library`) — mayor brecha

| Feature | Implementación | ¿Doc? | Dónde | Notas |
|---------|----------------|-------|-------|-------|
| Gate Seeker+ | `LibraryAccessGate.tsx` | ✅ | FAQ, tour, pricing | OK |
| 64 hex × 3 tabs W/L/Zhou Yi | `HexagramTabs.tsx` | ⚠️ | Guía 1 línea, FAQ | Superficial |
| Búsqueda (número, pinyin, nombre) | `LibraryIndex.tsx` | ❌ | — | |
| Filtro trigramas sup/inf | `TrigramPicker.tsx` | ❌ | — | |
| Sección mutaciones (hex derivados) | `LibraryContentLoader.tsx` | ❌ | — | |
| Capa comentario W+L (About, J/I, líneas, Wen Yen, notas Legge) | `library-data.ts`, JSON commentary | ⚠️ | FAQ `zhouyi-no-commentary` | Explica Zhou Yi sin `+`; **no** qué hay en W/L |
| Ribbon `+`/`−` cian, inline en líneas | `CommentaryRibbon.tsx` | ❌ | Labels solo en UI (`library-page-ui.ts`) | |
| Wen Yen solo hex **1–2** (fuente Wilhelm) | bundle commentary | ❌ | — | Riesgo percepción “falta contenido” |
| Comentario **no** en prompt IA | `library-data.ts` (solo biblioteca) | ❌ | — | Expectativa producto |
| Textos idioma fuente (EN/ZH) | bundles | ✅ | FAQ `library-source-language` | Muy bien |
| Zhou Yi sin comentario | producto | ✅ | FAQ `zhouyi-no-commentary` | Excelente |

### 4.1 Copy muerto en `/guia`

`guia-page-ui.ts` define `libraryFeatureHeading` + `libraryFeatureBody` (párrafo completo sobre 3 fuentes y fidelidad). **`guia/page.tsx` no los renderiza** — solo:

> *«Biblioteca de Hexagramas: Consulta directa de los 64 hexagramas y obras.»*

El copy largo ya está traducido a 11 idiomas pero **no llega al usuario**.

---

## 5. Fidelidad pública (`/audits`)

| Implementado (jun 2026) | ¿En `/audits`? |
|-------------------------|----------------|
| Bundles EPUB-primary W/L + 514/514 Zhou Yi | ⚠️ Cita Pantheon/SBE/ctext; no EPUB-primary ni comentario W+L |
| Capa comentario biblioteca + ribbon UI | ❌ Sin entrada log |
| Selector Huang/Zhu Xi | ✅ 20 jun 2026 |
| Reglas mutación Huang + Zhu Xi | ✅ 22 jun 2026 |
| `lastUpdated: 22 jun 2026` | Desactualizado vs hitos 23–24 jun |

FAQ `data-fidelity` apunta a `/audits` con fecha 22 jun — coherente con la página pero **incompleto** vs producto.

---

## 6. Otras páginas

| Página | Alineación |
|--------|------------|
| `/notes` | ✅ Métodos, Huang/Zhu Xi, traductores. ❌ Sin sección producto Biblioteca. |
| `/pricing` | ✅ Tokens, hilo, imagen por tier, biblioteca Seeker, Master 2 tok (marketing). |
| `/about` | ✅ Versión/traceability — OK. |
| Tour | ⚠️ Error Zhu Xi paso 4; biblioteca sin comentario `+`. |
| Token panel | ❌ Enlace `/guia#planes` — ancla inexistente. |

---

## 7. Enlaces rotos

| Origen | Enlace | Fix propuesto |
|--------|--------|---------------|
| FAQ (`userGuide` → `faq-page-ui.ts`) | `/guia#primeros-pasos` | `#modos-consulta` |
| Token panel (`token-panel-ui.ts`) | `/guia#planes` | `#tokens` |
| `doc-nav-ui.ts` | `#primeros-pasos` | `#modos-consulta` |

Anclas válidas en guía: `#modos-consulta`, `#panel-opciones`, `#traductor`, `#lectura-lineas`, `#metodo`, `#ejecucion`, `#sesiones-mensajes`, `#tokens`, `#biblioteca-docs`, `#exportar`, `#privacidad`.

---

## 8. Matriz resumen

| Área | OK | Parcial | Falta / Error |
|------|-----|---------|---------------|
| Modos I Ching + Huesos | ✓ | | |
| Traductores + tiers | ✓ | | |
| Huang / Zhu Xi | ✓ | | Texto erróneo guía/tour |
| Métodos monedas/varas | ✓ | | |
| Tokens + hilo | ✓ | Master 2 tok guía | |
| Biblioteca acceso | ✓ | | |
| Biblioteca UI (búsqueda, trigramas, mutaciones) | | | ✓ |
| Comentario W+L + ribbon | | FAQ Zhou Yi | ✓ guía/notas/audits |
| Fidelidad `/audits` | ✓ base | EPUB/comentario | ✓ log |
| PDF / imagen tier | | pricing | guía/FAQ |
| Enlaces internos | | | ✓ 2 anclas |

---

## 9. Plan de remediación (pendiente aprobación)

### P0 — Corrección factual + enlaces

- [ ] `ichingCastModeP1` (11 locales): reglas de lectura **seleccionadas** (Huang default), no “Zhu Xi rules”
- [ ] `home-tour-ui.ts` `step4Body`: quitar Zhu Xi como tradición default I Ching
- [ ] FAQ / token-panel / doc-nav: `#primeros-pasos` → `#modos-consulta`; `#planes` → `#tokens`

### P1 — Biblioteca (producto jun 2026)

- [ ] `/guia#biblioteca-docs`: renderizar `libraryFeatureBody` + párrafo nuevo:
  - tabs W/L/Zhou Yi;
  - `+`/`−` comentario clásico (Wilhelm/Legge);
  - Wen Yen solo hex 1–2;
  - búsqueda y filtro trigramas;
  - sección mutaciones;
  - comentario solo biblioteca, no consultas IA
- [ ] FAQ opcional: «¿Qué es el comentario clásico con + en la Biblioteca?»

### P2 — Completitud

- [ ] Guía `#tokens`: «1 token (2 en Master Combined)»
- [ ] Guía `#exportar`: PDF incluye traductor y lectura de líneas
- [ ] `/audits`: entrada comentario biblioteca + `lastUpdated`
- [ ] Tour paso 7: comentario expandible, no solo «interpretación completa»

### P3 — Limpieza i18n guía

- [ ] Integrar o podar strings no usados en `guia-page-ui.ts` (`appUseHeading`, `gettingStartedHeading`, `s5Heading`, `ichingPractical*`, etc.)

**Regla producto:** no editar `/privacy`, `/terms`, ni docs internos de producto en `guia/` FAQ copy salvo pedido explícito — esta auditoría propone cambios en **guía operativa, FAQ, tour, audits, doc-nav** alineados con implementación.

---

## 10. Verificación reproducible

1. Listar anclas en `apps/web/src/app/guia/page.tsx` vs enlaces en `faq-page-ui.ts`, `token-panel-ui.ts`, `doc-nav-ui.ts`.
2. Grep `libraryFeatureBody` — debe aparecer en `guia/page.tsx` tras P1.
3. Comparar `HexagramTabs.tsx` + `CommentaryRibbon.tsx` con texto guía/FAQ post-fix.
4. Smoke manual: `/guia`, `/faqs`, `/library/1` (tabs W/L, toggles `+`), tour desde Opciones.

---

## 11. Estado y siguiente paso

| Ítem | Estado |
|------|--------|
| Inventario docs vs código | ✅ Este documento |
| Remediación P0–P3 | ⏳ Pendiente propietario |
| Cierre auditoría | Tras deploy staging + smoke docs |

**Siguiente paso sugerido:** aprobar P0+P1 → PR i18n + `guia/page.tsx` (+ FAQ/anclas) → smoke → actualizar §11 a ✅ Cerrada.
