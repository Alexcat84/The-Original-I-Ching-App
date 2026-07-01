# Wilhelm DE 1924 — fuente de verdad de runtime

**Código:** `20260628-AUD-DAT-W-02 wilhelm-de-source-of-truth` · **Familia:** DAT-W · **Estado:** open (switch runtime en `feature/wilhelm-de-dataset`; pendiente merge staging)

## Objetivo

Sustituir el bundle runtime `hexagrams.wilhelm.json` (Baynes EN 1950) por el texto oracular **alemán Wilhelm 1924** (Diederichs), manteniendo el mismo `translator: "wilhelm"` y schema `HexagramRecord`. Blockquotes en **alemán literal** (modelo Zhou Yi); cita APA 7: Wilhelm, R. (1924). *I Ging: Das Buch der Wandlungen*. Eugen Diederichs Verlag.

## Jerarquía de fuentes (2026-06-30)

| Prioridad | Fuente | Rol |
|-----------|--------|-----|
| 1 | PDF `tools/source-pdfs/W german/*.pdf` (cuando disponible localmente) | Juez definitivo en discrepancias AU |
| 2 | **zeno.org HTML extract** (`extract:wilhelm-de-from-zeno:all`) | Maestro Erstes Buch limpio (split oráculo/comentario) |
| 3 | OCR dual-pass (`01`/`03`) | **Archivado** — sustituido por Zeno; snapshot en `tools/output/archive/wilhelm-de-64hex-merged-ocr-*.json` |
| 4 | Baynes EN archivado | Triangulación / comparador estructural **solo diagnóstico** (no gate fidelidad DE) |
| 5 | TSV / capturas manuales | AU campo a campo vs PDF físico (pendiente cierre 64×33) |

**Símbolos canónicos:** `chinese` + `hex_font` desde Zhou Yi (`iching_zhouyi_translation.mjs` / ctext.org), no Baynes ni OCR.

## Archivo Baynes

| Artefacto | Ubicación |
|-----------|-----------|
| Bundle runtime snapshot | `tools/output/archive/hexagrams.wilhelm.baynes-2026.json` |
| Commentary snapshot | `tools/output/archive/hexagrams.wilhelm.commentary.baynes-2026.json` |
| Módulo intermedio | `scripts/iching_wilhelm_translation.baynes.mjs` |
| Maestro EN parsed | `tools/datasets/wilhelm-baynes/book-one/wilhelm-64hex-parsed.json` |

Baynes **no** es fuente canónica del maestro alemán ni objetivo de `% match` MT DE→EN (ver `20260630-AUD-DAT-W-04`).

## Pipeline DE (activo)

| Paso | Comando |
|------|---------|
| Extract Zeno 64 hex | `npm run extract:wilhelm-de-from-zeno:all` |
| Promover maestro | `npm run promote:wilhelm-de-zeno-to-merged` |
| Sync módulo oráculo | `npm run sync:wilhelm-de-translation-module` |
| Gold fidelity | `npm run extract:gold:wilhelm-de-pdf` |
| Build bundles | `npm run build:data` |
| Gate oráculo | `npm run verify:hexagram-fidelity:wilhelm-de` → **514/514** |
| Gates DE | `npm run verify:wilhelm-de-all-gates` |
| Contaminación | `npm run audit:wilhelm-de-contamination` |
| Comparador EN (diag.) | `npm run export:wilhelm-de-baynes-comparison-viewer` |

Maestro runtime: `tools/datasets/wilhelm-de/book-one/wilhelm-de-64hex-merged.json` (zeno-promoted). Mirror extract: `wilhelm-de-64hex-zeno-extract-latest.json`. Blank AU: `wilhelm-de-64hex-blank.json` (`runtimeIngest: false`).

## Switch runtime (2026-06-30)

| Hito | Estado |
|------|--------|
| Extract Zeno 64/64, 514/514 comentario inline | **PASS** |
| Promoción Zeno → merged (OCR archivado) | **Hecho** |
| `sync` + `build:data` + bundles generated | **Hecho** |
| Hex 1 judgment runtime sin fuga comentario (74 vs 777 chars OCR) | **Verificado** |
| Fidelity gold rebasado desde maestro Zeno | **514/514** (`reports/hexagram-fidelity-2026-06-30T13-22-55-080Z.*`) |
| `verify:wilhelm-de-all-gates` | **PASS** |
| Contaminación slots oráculo | **0** |
| Commentary bookOne inline (Erstes Buch) | **Relleno desde Zeno** |
| Ten Wings (Drittes Buch) | Parcial (~82% merged OCR legacy) |
| `/audits` Pantheon → Obsoleto + entrada Diederichs 1924 | **Pendiente** |
| `/notes` i18n 9 locales | **Pendiente** (ES/EN OK) |
| Merge `feature/wilhelm-de-dataset` → `staging` | **Pendiente** smoke Preview |

## Producto

- Consultas IA: blockquotes Wilhelm en **alemán**; respuesta en idioma UI.
- Histórico DB con `translator: "wilhelm"` previo al switch = citas Baynes; **no migrar retroactivamente**.

## Licencia

Wilhelm DE 1924 — dominio público USA. Baynes 1950 — copyright; archivado solo para QA, no runtime.

## Relacionado

- `20260629-PLAN-DAT-W-03` — anatomía 33 campos + AU capturas PDF
- `20260630-AUD-DAT-W-04` — política fidelidad APA 7, MT diagnóstico
