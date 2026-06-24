# Plan — dual font-stack overlay PNG (Legge diacríticos)

- **Fecha:** 2026-06-24
- **Estado:** ✅ **Implementado** — gate verde; pendiente smoke visual staging + deploy
- **Auditoría:** [`IMAGE_OVERLAY_LEGGE_DIACRITICS_AUDIT_2026-06-24.md`](./IMAGE_OVERLAY_LEGGE_DIACRITICS_AUDIT_2026-06-24.md)
- **Alcance:** overlay SVG/PNG consulta · sin cambios en datasets, trigramas, billing ni prompt IA

---

## 1. Objetivo

Renderizar correctamente en Linux/Vercel:

- `subZh`: 71 hanzi + `→` en mutaciones (Noto Serif TC embebida)
- `subEn`: nombres Wilhelm (ASCII) y Legge (Latin Extended) sin tofu

---

## 2. Cambios de código

### Fase A — Marcadores semánticos (`sumi-hexagram-art.ts`)

| Elemento | Clase | Font stack pre-embed |
|----------|-------|----------------------|
| Título chino | `overlay-title-zh` | `Noto Serif TC, Noto Serif SC, SimSun, STSong, serif` |
| Título EN | `overlay-title-en` | `Georgia, 'Noto Serif', serif` |

Alinear overlay con el fallback sumi completo (L279) que ya usaba stack latino en `subEn`.

### Fase B — Embed dual (`embed-svg-overlay-font.ts`)

1. Exportar constantes `OVERLAY_TITLE_*` compartidas.
2. `collectCjkOverlayChars(zhText)` — solo texto de línea zh.
3. `collectLatinOverlayChars(enText)` — solo texto de línea en (incl. U+0103, U+017D…).
4. `@font-face` **NotoSerifTCOverlay** (existente) → reescribe solo `.overlay-title-zh`.
5. `@font-face` **NotoSerifLatinOverlay** desde `@fontsource/noto-serif` latin-ext-600 → reescribe solo `.overlay-title-en`.
6. Fallback Google Fonts `Noto Serif:wght@600` con `text=` subset si falta bundle local.
7. **No** reemplazar stack latino con face CJK (regresión documentada).

### Fase C — Dependencia

- `apps/web/package.json`: `@fontsource/noto-serif` (latin-ext subset).

### Fase D — Gate automatizado

| Artefacto | Rol |
|-----------|-----|
| `scripts/verify-overlay-glyphs.mjs` | Corpus 64×2 nombres + 71 hanzi; assert marcadores SVG |
| `apps/web/src/lib/__tests__/embed-svg-overlay-font.test.ts` | Embed dual: dos `@font-face`, en line sin TC |
| `package.json` → `verify:overlay-glyphs` | CI local / pre-release |

### Fase E — Alineación auxiliar

- `scripts/test-image-pipe.mjs`: mismas clases/font markers que producción (evitar drift).

---

## 3. Fuera de alcance

- Trigramas en overlay PNG
- Normalización ASCII de nombres Legge
- Cambios en FLUX prompt o watermark tier

---

## 4. Criterios de cierre (DoD)

- [x] `npm run verify:overlay-glyphs` verde
- [x] `npm run test --prefix apps/web -- embed-svg-overlay-font` verde
- [ ] Smoke visual staging: casos A–E de la auditoría
- [x] AGENTS.md actualizado
- [ ] Deploy staging + consulta Legge hex 32 en web

---

## 5. Orden de ejecución

```
Fase A + B + C (código)
  → Fase D (gate)
  → smoke local verify:overlay-glyphs
  → commit feature (usuario)
  → deploy staging
  → smoke visual A–E
  → merge staging cuando usuario lo pida
```
