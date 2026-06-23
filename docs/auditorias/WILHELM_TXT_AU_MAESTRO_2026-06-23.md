# Wilhelm Princeton TXT — auditoría de usuario (AU) y maestro definitivo

- **Fecha:** 2026-06-23
- **Rama:** `feature/wilhelm-txt-au-maestro-2026-06-23`
- **Estado:** **Gates 100/100 PASS** · datasets parseados listos · **sin ingest a runtime** (`packages/iching-data`)
- **Relacionado:** `EPUB_PRIMARY_MIGRATION_2026-06-23.md` (bundle runtime EPUB-primary, capa distinta), `ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md`

---

## 1. Objetivo

Construir el **maestro book-primary** de Wilhelm a partir de los TXT Princeton editados por el usuario (export EPUB → limpieza → parse), con trazabilidad campo a campo para AU en Google Sheets, **sin promover al bundle de producción** hasta cierre explícito.

| Capa | Ubicación | Runtime |
|------|-----------|---------|
| Injector estructural + hanzi | `scripts/iching_wilhelm_translation.mjs` | Sí (metadata/trigramas; `english` = naming producto) |
| Datasets TXT parseados | `tools/datasets/wilhelm/` | **No** (`runtimeIngest: false`) |
| Bundle consultas | `packages/iching-data/src/generated/` | Sí (hoy EPUB-primary, no TXT maestro) |

---

## 2. Fuentes y datasets

| Dataset | Directorio | TXT fuente | Estado manifest |
|---------|------------|------------|-----------------|
| **Book-one** (64 hex oráculo) | `book-one/` | `…Wilhelm, Hellmut-64hex.txt` | draft → **gates cerrados** |
| **Comments** (Ten Wings) | `comments/` | `…Wilhelm-comments 64 hex.txt` | **official** (G0+G2 PASS) |
| **Appendix** | `appendix/` | `…Wilhelm-Appendix.txt` | draft (fuera de alcance AU actual) |

Meta **hanzi** (`chinese`): gold `tools/datasets/wilhelm/wilhelm-hex-chinese-gold.json` ← `trad_chinese` del injector (64/64 vs Zhou Yi/ctext). Cabecera TXT solo trae Wade-Giles (`chinese_roman`); hanzi del EPUB van como imágenes, no extractibles.

---

## 3. Pipeline operativo

```bash
# Limpieza + parse
npm run clean:wilhelm-64hex-txt
npm run parse:wilhelm-64hex-txt              # → book-one/wilhelm-64hex-parsed.json + G0/G1

npm run clean:wilhelm-64hex-comments-txt
npm run parse:wilhelm-64hex-comments-txt     # → comments/…-parsed.json + G0

# CSV para AU (Sheets)
npm run export:wilhelm-64hex-audit-csv
npm run export:wilhelm-64hex-comments-audit-csv

# Suite 100/100
npm run verify:wilhelm-all-gates
```

Salida CSV: `reports/wilhelm-64hex-txt-audit-latest.csv` (33 campos + `hex_fin` × 64) y `reports/wilhelm-64hex-comments-audit-latest.csv` (37 campos + `hex_fin` × 64).

---

## 4. Gates de fidelidad

| Gate | Alcance | Resultado 2026-06-23 |
|------|---------|----------------------|
| **G0** estructura | 64 hex, campos obligatorios | PASS |
| **G1** book-one vs runtime bundle | 514/514 (oráculo; deltas EPUB documentados) | PASS |
| **G2 determinista** book-one | 1664/1664 (26 campos oraculares × 64) | PASS |
| **G2 determinista** comments | 1920/1920 (30 campos × 64) | PASS |
| **G2 manual** | Gold hex 1–3–8 (`tools/manual-gold/hex-1-2-3-8.tsv`) | PASS |
| **Meta fidelity** | `nombre`, `chinese_roman`, `chinese` vs libro | PASS |
| **Hex meta gate** | 128 checks (book-one + comments) | PASS |
| **Trigram Parma** | Injector vs impreso Parma | PASS (0 gaps; variantes libro documentadas) |
| **Huellas/notas** | Orphans en TXT limpio | 0 |

Comando único: `npm run verify:wilhelm-all-gates` → **12/12 PASS**.

---

## 5. AU manual (Sheets) — hallazgos y adjudicación

### 5.1 Book-one (64 hex)

Auditoría completa del CSV vertical. Conclusión: **integridad estructural sólida**; variaciones reportadas clasificadas así:

| Hallazgo | Veredicto |
|----------|-----------|
| Trigramas FIRE/FLAME, CHêN/CHEN, KêN/KEN, Sun/SUN, WIND vs WIND WOOD | **Variante book-primary Parma** — no normalizar |
| `hex_fin` vacío | **Delimitador de diseño** entre hex en CSV |
| `yong_*` solo hex 1–2 | **Correcto** (用九/用六) |
| `chinese_roman` duplicado (homónimos Wade-Giles) | **Correcto** — ID = `hex` + `chinese` + `hex_font` |
| 34 filas/hex, `hex_font` ䷀…䷿ | **Correcto** |

**Fix nuestro cerrado (ya en staging/main, commit `6fc8ced`):** 7 posiciones Sun `WIND,` → `WIND, WOOD` (hex 28, 46, 48, 50, 53, 57) vs Parma.

**Fix manual gold (esta rama):** títulos `nombre` alineados al header TXT Wilhelm; hex 8 `L3_oraculo` con punto final.

### 5.2 Comments (64 hex)

Mismas reglas de trigramas y `hex_fin`. `sequence` vacío en hex 1–2 = fiel al libro. Etiquetas de campo en español + contenido en inglés = diseño del template AU.

---

## 6. G2 manual — muestra verificada

Gold en `tools/manual-gold/hex-1-2-3-8.tsv` + módulos `tools/wilhelm-manual-gold-hex1-3.mjs`, `tools/verify-hex1-manual.mjs`.

Tras corrección de `nombre` y puntuación hex 8:

- Hex **1–3–8**: todos los campos oraculares **OK** vs parsed JSON.
- Meta TXT (`nombre`, `chinese`, trigramas) **OK** cuando el gold incluye valor (no se exige `chinese_roman`/`hex_font` en paste manual).

---

## 7. Política book-primary (no negociable en maestro)

1. **No normalizar** variantes del impreso Wilhelm (FIRE/FLAME, acentos Wade-Giles, mayúsculas Sun).
2. **No ingestar** `tools/datasets/wilhelm/` al runtime hasta gate de producto explícito.
3. **`nombre` en dataset** = título del header TXT; **`english` en bundle** = naming producto (62/64 drift documentado, esperado).
4. Re-ingesta runtime solo desde gold verificado; parches manuales en JSON parseado prohibidos salvo hotfix documentado.

---

## 8. Herramientas añadidas en esta rama

| Script npm | Rol |
|------------|-----|
| `verify:wilhelm-all-gates` | Suite 12 gates |
| `audit:wilhelm-txt-g2:deterministic` | G2 book-one 64/64 |
| `audit:wilhelm-comments-txt-g2:deterministic` | G2 comments 64/64 |
| `audit:wilhelm-trigram-parma` | Injector vs Parma |
| `audit:wilhelm-book-meta` / `audit:wilhelm-hex-meta` | Meta hanzi + cabecera |
| `export:wilhelm-64hex-audit-csv` / `…comments…` | CSV AU |
| `parse:wilhelm-64hex-txt` / `…comments…` | Regenerar JSON |

Librerías clave: `scripts/lib/wilhelm-64hex-txt.mjs`, `wilhelm-64hex-comments-txt.mjs`, `wilhelm-manual-fields.mjs`, `wilhelm-comments-manual-fields.mjs`, `wilhelm-dataset-paths.mjs`.

---

## 9. Pendiente (fuera de 100/100 actual)

- [ ] **Ingest runtime** desde maestro TXT (decisión producto; hoy bundle EPUB-primary).
- [ ] **Appendix** parse + AU (`tools/datasets/wilhelm/appendix/`).
- [ ] Ampliar gold manual TSV a más hex (muestreo 4–64) si se desea doble verificación humana además del G2 determinista.
- [ ] Publicar resumen en `/audits` cuando se promueva el maestro TXT a fuente canónica de producto.

---

## 10. Cómo reproducir PASS

```bash
npm run verify:wilhelm-all-gates
# Esperado: === RESULT: PASS (12/12) ===
```

Reportes locales (no versionados): `reports/wilhelm-*-latest.md`, CSV `reports/wilhelm-64hex-*-audit-latest.csv`.
