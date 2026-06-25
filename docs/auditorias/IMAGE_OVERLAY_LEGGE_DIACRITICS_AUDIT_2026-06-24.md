# Overlay PNG — tofu en nombres Legge con diacríticos (Hăng, Ž…)

- **Fecha:** 2026-06-24
- **Estado:** ✅ **Fix diacríticos aplicado** — gate `verify:overlay-glyphs` verde; **layout mutación / flecha → abierto** → ver [`IMAGE_OVERLAY_MUTATION_TITLE_LAYOUT_AUDIT_2026-06-25.md`](./IMAGE_OVERLAY_MUTATION_TITLE_LAYOUT_AUDIT_2026-06-25.md)
- **Relacionado:** [`LIBRARY_HEXAGRAM_TITLE_FIDELITY_FIX_2026-06-23.md`](./LIBRARY_HEXAGRAM_TITLE_FIDELITY_FIX_2026-06-23.md) (origen del campo `name` Legge restaurado), [`HEXAGRAM_PINYIN_GOLD_GATE_2026-06-23.md`](./HEXAGRAM_PINYIN_GOLD_GATE_2026-06-23.md) (trigramas — superficie distinta), plan [`IMAGE_OVERLAY_DUAL_FONT_FIX_PLAN_2026-06-24.md`](./IMAGE_OVERLAY_DUAL_FONT_FIX_PLAN_2026-06-24.md)

---

## 1. Origen

Tras el fix de fidelidad del campo `name` (jun 2026), una consulta con traductor **Legge** e imagen compuesta mostró en el overlay PNG:

- `#32 H` + **tofu** + `ng` en lugar de `#32 Hăng`

El usuario sospechó relación con el reciente fix de **trigramas** (`trigrams.json`, `KEEPING STILL`, gate pinyin). La investigación separó ambas causas.

---

## 2. Síntoma

| Superficie | Legge hex 32 | Wilhelm hex 32 |
|------------|--------------|----------------|
| Biblioteca / chat | `Hăng` OK (navegador) | `Duration` OK |
| Overlay PNG (`subEn`) | `H□ng` (U+0103 tofu) | `#32 Duration` OK |

Ocurre en **Vercel/Linux** (resvg/librsvg sin fuentes del sistema). En dev Windows puede pasar desapercibido si el renderer cae en Georgia del SO.

---

## 3. Root cause

### 3.1 Datos — correctos, no regresión de bundle

- Legge hex 32: `name: "Hăng"` — ortografía auténtica SBE XVI (`chinese_roman` maestro).
- **40/64** nombres Legge llevan Latin Extended; **7 tipos** de diacríticos: `ă` U+0103, `â` U+00E2, `î` U+00EE, `û` U+00FB, `ü` U+00FC, `Ž` U+017D, `Î` U+00CE.
- Wilhelm `name`: **100% ASCII** — no afectado.

### 3.2 Trigramas — no entran al overlay

Los 8 trigramas (`乾 qián` … `離 lí`) se renderizan solo en **Biblioteca** (`formatTrigramLabel`). El overlay PNG pinta únicamente:

- `subZh`: `chineseName` (+ transformado) — 71 hanzi únicos
- `subEn`: `#N name` (+ flecha mutación) — sin trigramas ni pinyin

El fix de trigramas **no explica** el tofu; el desencadenante es el **restaurado `name` Legge** usado en `buildSumiHexagramOverlaySvgDataUrl`.

### 3.3 Pipeline — font CJK aplicada a la línea latina

```
buildSumiHexagramOverlaySvgDataUrl (sumi-hexagram-art.ts)
  → subEn con font-family CJK-only (igual que subZh)   ← bug
  → embedCjkFontInOverlaySvg (embed-svg-overlay-font.ts)
  → reemplaza TODAS las font-family con NotoSerifTCOverlay
  → renderSvgToPng (resvg) en Linux sin Georgia
  → glifos Latin Extended → tofu
```

El **fallback sumi completo** (`buildSumiHexagramSvgDataUrl`) ya usaba stack latino correcto en `subEn` (`Georgia, 'Noto Serif', …`). Solo el **overlay transparente** regresó.

`collectOverlaySubsetChars` ya incluye Latin Extended en el subset, pero la fuente embebida es **Noto Serif TC** (solo CJK). El comentario de regresión en `embed-svg-overlay-font.ts` (líneas 9–12) documentaba exactamente este riesgo.

---

## 4. Inventario de glifos overlay (referencia)

### 4.1 Línea ZH — 71 hanzi (`chineseName`)

Override intencional hex 33: `遁` U+9041 (`CHINESE_NAME_OVERRIDES`).

### 4.2 Línea EN Legge — 40 nombres con diacríticos

Ejemplos críticos para smoke: **#32 Hăng**, **#35 Žin**, **#13 Thung Zăn**, **#36 Ming Î**.

### 4.3 Opciones descartadas

| Opción | Veredicto |
|--------|-----------|
| Normalizar nombres Legge a ASCII | **Rechazada** — rompe fidelidad maestro SBE |
| Mostrar trigramas en overlay | Fuera de alcance — no corrige el bug |
| Un solo font CJK para todo | **Causa actual** |

---

## 5. Remediación acordada

**Dual font-stack:** CJK embebida solo en `overlay-title-zh`; Latin Extended embebida solo en `overlay-title-en`. Gate `npm run verify:overlay-glyphs`.

Ver plan detallado: [`IMAGE_OVERLAY_DUAL_FONT_FIX_PLAN_2026-06-24.md`](./IMAGE_OVERLAY_DUAL_FONT_FIX_PLAN_2026-06-24.md).

---

## 6. Smoke post-fix

| Caso | Traductor | Hex | Assert |
|------|-----------|-----|--------|
| A | Legge | 32 | `#32 Hăng` legible |
| B | Legge | 35 | `#35 Žin` — Ž correcto |
| C | Legge | 13 | `Thung Zăn` completo |
| D | Wilhelm | 32 | `#32 Duration` sin regresión |
| E | Legge | mutación | `→` + segundo nombre con diacríticos |

Comando gate: `npm run verify:overlay-glyphs`

Comando muestras visuales locales (sumi fallback, sin tokens Together): `npm run generate:sumi-fallback-glyphs` → `reports/sumi-fallback-glyphs/` (146 PNG). Smoke rápido: `npm run generate:sumi-fallback-glyphs:quick`.
