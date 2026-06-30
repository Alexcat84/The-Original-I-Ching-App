# Wilhelm DE — fases JPG AU Ten Wings (Drittes Buch)

**Código:** `20260630-PLAN-DAT-W-06 wilhelm-de-ten-wings-jpg-phases` · **Familia:** DAT-W · **Estado:** closed (estructural 64/64; attestation §5 pendiente)

- **Fecha:** 2026-06-30
- **Rama:** `feature/wilhelm-de-dataset`
- **Relacionado:** `20260628-PLAN-DAT-W-05`, `20260629-PLAN-DAT-W-03`, `20260630-AUD-DAT-W-04`

---

## 1. Alcance

| Incluido | Excluido |
|----------|----------|
| **Drittes Buch** — 37 campos Ten Wings × 64 hex | **Erstes Buch** (book-one) — cerrado Zeno 514/514 vs PDF |
| Fidelidad **literal** `contenido_pdf` ↔ JPG 300 DPI | **Zweites Buch** — ya validado contra PDF |
| Pilot TSV → AU gold → promote merged comments | Gates estructura EN↔DE (vacío/lleno ≠ literal) |
| Anna pass02/04 solo como referencia de disputa | Gutenberg EPUB (sin Drittes) |
| | Merge a `staging` (solo con pedido explícito) |

**Ancla:** `tools/source-pdfs/source jpgs/` (585 páginas; Drittes ~315–585). Mapa hex → páginas: `tools/datasets/wilhelm-de/wilhelm-de-comments-hex-starts.json`.

**Contrato AU:** `tools/manual-gold/wilhelm-de-comments-au/au-contract.json` — solo `contenido_pdf` + `au_estado` ∈ {`cerrado`, `vacio_en_libro`} cierran fila; reconciliado heurístico no promueve disputas solo.

---

## 2. Definición de cerrado por hex

Un hex está **cerrado literal** cuando:

1. Las **37 filas** del pilot TSV tienen `au_estado` ∈ {`cerrado`, `vacio_en_libro`}.
2. Cada `contenido_pdf` transcrito campo a campo desde JPG (o vacío si el libro no tiene el campo).
3. `npm run verify:wilhelm-de-comments-au-pilot -- --hex=N` → **PASS** (0 pending).
4. Tras apply/validate, el hex puede promoverse al merged (promote global exige disputas cerradas en AU gold, no los 64 hex completos).

---

## 3. Fases (13 lotes, ~5 hex)

| Fase | Hex | JPG impreso (aprox.) | Notas |
|------|-----|----------------------|-------|
| **0** | **8** | 358–361 | Calibración; OCR sucio en `ruler_note`, `sequence`, `commentary_image` |
| 1 | 1 | 316–327 | Wen Yen + Yong (hex 1–2 únicos) |
| 2 | 2 | 328–336 | Wen Yen; OCR más sucio |
| 3 | 3–7 | 337–357 | Tras calibración hex 8 |
| 4 | 9–13 | — | Continuidad orden Wen |
| 5 | 14–18 | — | |
| 6 | 19–23 | — | |
| 7 | 24–28 | — | |
| 8 | 29–33 | — | |
| 9 | 34–38 | — | |
| 10 | 39–43 | — | Priorizar 39, 42 (disputas altas) |
| 11 | 44–48 | — | |
| 12 | 49–53 | — | |
| 13 | 54–64 | — | Priorizar 55; spot-check hex «limpios» al final |

**Prioridad disputas OCR (referencia, no sustituto JPG):** 13, 4, 22, 39, 42, 55.

---

## 4. Ritual por hex

```bash
# 1. Transcribir / corregir pilot TSV
#    tools/manual-gold/wilhelm-de-comments-au/wilhelm-de-comments-hex-N-pilot-au.tsv

npm run verify:wilhelm-de-comments-au-pilot -- --hex=N

# 2. Tras cerrar uno o más hex del lote:
npm run apply:wilhelm-de-comments-au-gold
npm run validate:wilhelm-de-comments-au-gold
npm run promote:wilhelm-de-comments-au-to-merged
npm run verify:wilhelm-de-en-structure-parity
```

**Gotcha apply:** si existe `by-hex/wilhelm-de-comments-hex-{NN}-disputes.tsv` (p. ej. `hex-08`), **sobrescribe** el pilot al apply. Tras editar pilot, sincronizar `contenido_pdf` al disputes del mismo hex (o borrar disputes obsoleto).

Visor EN↔DE (referencia): `npm run export:wilhelm-en-de-comments-comparison-viewer`

---

## 5. Reglas de transcripción

Ver `au-contract.json`:

- Unir cortes de línea con guión final (`be-\nHimmels` → `beHimmels`).
- Preservar comillas alemanas `,, … "` del impreso.
- No normalizar ortografía 1924.
- Párrafos como `\n` en TSV.
- `image_oraculo` = oráculo del Bild (2 líneas típicas); `commentary_image` = comentario Wilhelm posterior, sin mezclar líneas individuales.
- `sequence` = solo párrafos bajo «Die Reihenfolge», sin sangrado del Urteil del Erstes Buch.

---

## 6. Estado de avance

| Fase | Hex | Estado | Fecha cierre |
|------|-----|--------|--------------|
| 0 | 8 | cerrado (JPG literal calibrado) | 2026-06-30 |
| 1 | 1 | cerrado (AU pilot PASS; 9 disputas ≠ OCR) | 2026-06-30 |
| 2 | 2 | cerrado (AU pilot PASS; 10 disputas ≠ OCR) | 2026-06-30 |
| 3 | 3–7 | cerrado (AU pilot PASS) | 2026-06-30 |
| 4 | 9–13 | cerrado (batch JPG + verify PASS) | 2026-06-30 |
| 5 | 14–18 | cerrado | 2026-06-30 |
| 6 | 19–23 | cerrado | 2026-06-30 |
| 7 | 24–28 | cerrado | 2026-06-30 |
| 8 | 29–33 | cerrado | 2026-06-30 |
| 9 | 34–38 | cerrado | 2026-06-30 |
| 10 | 39–43 | cerrado | 2026-06-30 |
| 11 | 44–48 | cerrado (40 correcciones JPG) | 2026-06-30 |
| 12 | 49–53 | cerrado (41 correcciones JPG) | 2026-06-30 |
| 13 | 54–64 | cerrado (109 correcciones JPG) | 2026-06-30 |

**Nota:** 64/64 hex `verify:wilhelm-de-comments-au-pilot` PASS; promote merged **1864/2176** fill. **422** correcciones JPG literal acumuladas en ledger (`AUD-DAT-W-07`). Attestation §5 sigue bloqueada: **1570** campos `verified` + **312** `vacio_en_libro` = 1882/2304 (barrido JPG campo-a-campo incompleto en hex tempranos).

---

## 7. Artefactos

| Artefacto | Ruta |
|-----------|------|
| Pilot TSV por hex | `tools/manual-gold/wilhelm-de-comments-au/wilhelm-de-comments-hex-{N}-pilot-au.tsv` |
| AU gold | `tools/output/fidelity-gold/wilhelm-de-64hex-comments-au-gold.json` |
| Merged comments | `tools/datasets/wilhelm-de/comments/wilhelm-de-64hex-comments-merged.json` |
| Verify report | `reports/wilhelm-de-comments-au-pilot-hex{N}-verify-*.json` |
| Ledger JPG literal | `reports/wilhelm-de-jpg-literal-audit-ledger.json` |
| Batch JPG | `scripts/run-wilhelm-de-jpg-literal-batch.mjs` |
| Attestation | `20260630-AUD-DAT-W-07-wilhelm-de-jpg-literal-attestation.md` |

---

## 8. Distinción gates vs literal

| Gate | Qué prueba | Qué NO prueba |
|------|------------|---------------|
| `verify:wilhelm-de-all-gates` | Paridad estructura, parsers Anna | Literal JPG |
| `verify:wilhelm-de-en-structure-parity` | 2368/2368 vacío/lleno EN↔DE | Texto alemán |
| `jpg-audit:wilhelm-de-comments-au-pilot` | Pilot vs pass02/04 esperado | Literal JPG |
| **Este plan** | `contenido_pdf` vs JPG | Match % OCR automático |
