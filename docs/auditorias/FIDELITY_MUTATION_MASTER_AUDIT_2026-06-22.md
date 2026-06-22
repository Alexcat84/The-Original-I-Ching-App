# Auditoría maestra — Fidelidad textos del oráculo + reglas de mutación

**App:** The Original I Ching  
**Fecha cierre documento:** 22 jun 2026  
**Merge a `staging`:** 22 jun 2026 (desde `feat/wilhelm-pdf-gold-sync`; **`main` pendiente**)  
**Estado global:** Textos W/L **book-primary PASS** · Mutaciones Huang/Zhu Xi **core PASS** · Zhu Xi **32 diagramas: Gate 0 CERRADO — ≡ reglas por conteo, no se implementa (§E.2.2)**  
**Página pública usuarios:** [`/audits`](https://theoriginaliching.com/audits) — solo fechas, fuente y resultado  
**Audiencia:** auditoría interna pre-implementación (32 charts); ingeniería + revisión académica

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Política Tier-0 y reproducibilidad](#2-política-tier-0-y-reproducibilidad)
3. [Parte A — Textos del oráculo (Wilhelm, Legge, Zhou Yi)](#parte-a--textos-del-oráculo)
4. [Parte B — Reglas de mutación (Huang, Zhu Xi)](#parte-b--reglas-de-mutación)
5. [Parte C — Producto y transparencia (`/audits`)](#parte-c--producto-y-transparencia)
6. [Parte D — Brechas abiertas y riesgo](#parte-d--brechas-abiertas)
7. [Parte E — Plan de implementación 32 diagramas Zhu Xi](#parte-e--plan-32-diagramas-zhu-xi)
8. [Parte F/G — Validación Opus + ejecutor](#parte-f-validación-externa-opus-48-v21-greenfield--acuerdo-implementación)
9. [Parte H — Zhou Yi trazabilidad](#parte-h-zhou-yi-trazabilidad-e-incidentes-históricos)
10. [Índice de evidencias por fuente](#8-índice-de-evidencias-por-fuente)
11. [Documentos relacionados](#9-documentos-relacionados)

---

## 1. Resumen ejecutivo

| Dominio | Fuente Tier-0 | Gate / evidencia | Resultado | Estado |
|---------|---------------|------------------|-----------|--------|
| **Wilhelm/Baynes** | Pantheon 1950 PDF local | `verify:hexagram-fidelity:pdf-wilhelm` | **513/513 (100%)** | ✅ Cerrado |
| **James Legge** | SBE XVI Oxford scan OCR | `verify:hexagram-fidelity:pdf-legge` | **514/514 (100%)** | ✅ Cerrado |
| **Zhou Yi** | ctext.org (API + HTML) | `verify` mirrors + `scan:zhouyi-corruption` | **514/514 + 0 corrupt** | ✅ Cerrado (gold = ctext, no PDF 注疏) |
| **Huang mutaciones** | Complete I Ching 10th ed. PDF | `audit:huang-rules-vs-pdf-gold` | **9/9 snippets, 90/90 tests** | ✅ Cerrado |
| **Zhu Xi mutaciones** | Adler trans. Yixue Qimeng ch. IV | `audit:zhuxi-rules-vs-adler-gold` | **10/10 snippets, 37/37 tests** | ✅ Core cerrado |
| **Zhu Xi 32 diagramas** | Adler Fig. 19 + 御纂折中 + reconstrucción | `tools/reconstruct-zhuxi-3line-chart.mjs` + visual PDF | **≡ reglas por conteo (10/10 boundary 恒/益)** | ✅ Cerrado — no se implementa (§E.2.2) |

**Línea de tiempo (commits clave en rama mergeada):**

| Commit | Descripción |
|--------|-------------|
| `800ff70` | Scaffold PDF Tier-0 gold verification |
| `73a74a8` | Parser Wilhelm PDF 64/64 hex |
| `da607cf` | Gate Wilhelm book-primary |
| `6f19218` | **Sync bundle Wilhelm desde PDF gold 513/513** |
| `0b9c5c6`–`4409062` | Pipeline Legge SBE OCR + **514/514** |
| `86f6b2b` | Zhu Xi Adler gold + `readBothJudgments` + `/audits` |
| `2dbfa76` | Huang PDF gold + simplificación pública `/audits` |

---

## 2. Política Tier-0 y reproducibilidad

**Decisión de producto (22 jun 2026):** la única fuente de verdad para fidelidad 1:1 es el **libro físico** (PDF/EPUB local en `tools/source-pdfs/`, gitignored). El manifest versionado es `tools/source-pdfs/manifest.json`.

**Mirrors web** (Parma, sacred-texts): deprecated como gate de producción; conservados solo como histórico en [`ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md`](ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md) §14.

**Excepción Zhou Yi (decisión Alexis, 22 jun 2026):** gold operativo = **ctext.org** — no PDF 注疏 local. Gate: `verify:hexagram-fidelity:zhouyi-ctext` + `scan:zhouyi-corruption` + `check:hex-glyph-uniqueness`.

**Comandos canónicos:**

```bash
npm run verify:hexagram-fidelity:pdf-wilhelm   # Wilhelm vs Pantheon PDF
npm run verify:hexagram-fidelity:pdf-legge      # Legge vs SBE XVI OCR gold
npm run verify:hexagram-fidelity:zhouyi-ctext   # Zhou Yi vs ctext.org (514/514)
npm run scan:zhouyi-corruption                  # 咸→鹹, cross-hex, etiquetas (exit 0)
npm run check:hex-glyph-uniqueness              # nombres/glyphs únicos por hex 1–64
npm run audit:huang-rules-vs-pdf-gold
npm run audit:zhuxi-rules-vs-adler-gold
npm run sync:wilhelm-oracle-from-pdf-gold      # re-inyección W (solo con PDF local)
npm run sync:legge-oracle-from-pdf-gold        # re-inyección L (solo con PDF local)
```

**Bundles de producción:**

- `packages/iching-data/src/generated/hexagrams.wilhelm.json`
- `packages/iching-data/src/generated/hexagrams.legge.json`
- `scripts/iching_wilhelm_translation.mjs` / `scripts/iching_legge_translation.mjs` (datasets fuente del build)

---

## Parte A — Textos del oráculo

### A.1 Wilhelm / Baynes (Pantheon 1950)

| Evidencia | Referencia |
|-----------|------------|
| **Libro** | Richard Wilhelm & Cary F. Baynes, *The I Ching or Book of Changes*, Pantheon Books, Bollingen Series XIX, 1950 |
| **Archivo local** | `tools/source-pdfs/wilhelm-baynes-1950-pantheon.pdf` |
| **Manifest** | `manifest.json` → `sources.wilhelm` |
| **Parser gold** | `scripts/lib/hexagram-fidelity-wilhelm-pdf.mjs`, `scripts/lib/wilhelm-pdf-gold.mjs` |
| **Sync / inyección** | `tools/sync-wilhelm-oracle-from-pdf-gold.mjs` → reescribe `scripts/iching_wilhelm_translation.mjs` |
| **Auditoría injector** | `tools/audit-wilhelm-injector-vs-datasets.mjs` — **512/512 exact** string match PDF gold vs bundle |
| **Gate PASS** | Reporte `reports/hexagram-fidelity-2026-06-22T14-55-38-200Z.json` — **513/513 match (100%)** |
| **Commit sync** | `6f19218` — «sync Wilhelm bundle from Pantheon PDF gold at 513/513» |

**Spot-checks calibrados (manifest `spotCheckPages`):**

| Hex | Campo | PDF página | Motivo histórico |
|-----|-------|------------|------------------|
| 56 | judgment | 231 | Oracle Baynes ausente en mirror Parma; resuelto vía PDF book-primary |
| 20 | L5 | 88–89 | Gap OCR Parma; verificado en Pantheon |
| 21 | L2, L3 | 92–93 | Idem |
| 26 | L3 | 112 | Idem |
| 52 | L2 | 215 | Idem |

**Overrides verificados en foto:** `scripts/lib/hexagram-fidelity-wilhelm-pdf-verified.mjs` (OCR gaps Pantheon — no suplementos web).

**Evidencia de no-regresión formato:** bundle mantiene schema `HexagramRecord` (judgment, image, lines[1–6], yongJiu/yongLiu); gate compara campo a campo sin normalización que oculte vacíos (fix Fase 3d documentado en auditoría 2026-06-21).

---

### A.2 James Legge (SBE XVI, Oxford scan)

| Evidencia | Referencia |
|-----------|------------|
| **Libro** | James Legge, *The Yî King*, Sacred Books of the East Vol. XVI, Oxford 1882 |
| **Archivo local (gold)** | `tools/source-pdfs/16_ The Sacred Books of China...Oxford University Press.pdf` |
| **EPUB** | `The Yi King or, Book of Changes -- James Legge.epub` — **solo diagnóstico** (`audit:legge-pdf-vs-epub`) |
| **Manifest** | `manifest.json` → `sources.legge` (OCR pp. 86–240 texto, 296–420 Great Symbolism) |
| **Parser OCR** | `scripts/lib/hexagram-fidelity-legge-sbe-pdf.mjs`, `hexagram-fidelity-legge-sbe-ocr.mjs` |
| **Parches book-primary** | `hexagram-fidelity-legge-sbe-book-primary.mjs` — **15 campos**, 8 hex (foto-verificados) |
| **Sync / inyección** | `tools/sync-legge-oracle-from-pdf-gold.mjs` — `epubGuide: false`, sin fallback bundle EPUB |
| **Auditoría proceso** | [`LEGGE_SBE_XVI_PDF_BOOK_PRIMARY_AUDIT_2026-06-22.md`](LEGGE_SBE_XVI_PDF_BOOK_PRIMARY_AUDIT_2026-06-22.md) |
| **Spot-check manual** | [`LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md`](LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md) |
| **Gate PASS** | `reports/hexagram-fidelity-2026-06-22T23-23-50-099Z.json` — **514/514 match (100%)** |
| **Rama / commit** | `fix/legge-pdf-fidelity-100` · `e8ba543` |

**Evidencia textual crítica (hex 1 yongJiu, escaneo Oxford):**

> «The lines of this hexagram are all strong and undivided, as appears from) the use of the **number nine**.»

Bundle alineado al escaneo (`nine`, no `line` del EPUB re-pack). Ver §A1 spot-check doc.

**Evidencia Gen→Sui (relevante mutaciones Zhu Xi fn. 144–145):** hex 18 → transformed hex 17; línea 2 estable de Sui es la correcta para 5 cambios — validada en gold Adler y en motor Legge/Wilhelm para citas.

---

### A.3 Zhou Yi (周易 canon)

| Evidencia | Referencia |
|-----------|------------|
| **Gold operativo (Tier-0 efectivo hoy)** | [ctext.org Book of Changes](https://ctext.org/book-of-changes): API gettext + HTML 大象傳 |
| **Ingest** | `tools/ingest-zhouyi-ctext.mjs` → `scripts/iching_zhouyi_translation.mjs` |
| **Bundle** | `packages/iching-data/src/generated/hexagrams.zhouyi.json` |
| **Gate canónico** | `node scripts/verify-hexagram-fidelity.mjs --gold=mirrors --translator=zhouyi` → **514/514** |
| **Gate corrupción** | `npm run scan:zhouyi-corruption` → **0** incidencias |
| **PDF local (NO gate hoy)** | `tools/source-pdfs/zhouyi-zhushu-song-er07.pdf` (南宋刊本影印, 爱如生 er07; manuscrito/OCR complejo) |
| **Estado PDF 注疏** | Manifest tracked; **parser book-primary pendiente** (`verify-hexagram-fidelity.mjs` L336: "pending local PDF 注疏 parser") |

**Honestidad de claims:** el producto verifica 1:1 contra **ctext**, no contra el PDF 注疏 local. El PDF es reserva académica / futuro Tier-0; no usarlo en `/audits` ni `licenseNote` como fuente primaria hasta tener extract+compare reproducible.

**T1 (22 jun 2026):** comas almacenadas en full-width `，` (`feat/t1-zhouyi-comma-normalize`).

Detalle histórico e incidentes: §Parte H.

---

## Parte B — Reglas de mutación

Documento detallado: [`MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md`](MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md)

### B.1 Alfred Huang — Master Yin method

| Evidencia | Referencia |
|-----------|------------|
| **Libro** | Taoist Master Alfred Huang, *The Complete I Ching — 10th Anniversary Edition*, 2010 |
| **PDF local** | `tools/source-pdfs/The Complete I Ching — 10th Anniversary Edition _ The -- Taoist Master Alfred Huang.pdf` |
| **Sección** | «Gaining Insight from the Oracle» — reglas 1–7 |
| **PDF páginas** | **48–55** (lista numerada en **~51**); All Nines comentario en **~62** |
| **Gold JSON** | `tools/output/fidelity-gold/huang-mutation-rules-gold.json` (gitignored output; regenerable) |
| **Extract cache** | `tools/output/fidelity-gold/huang-mutation-rules-p48-55.txt` |
| **Scripts** | `scripts/lib/huang-pdf-gold.mjs`, `npm run extract:gold:huang-pdf`, `npm run audit:huang-rules-vs-pdf-gold` |
| **Motor** | `packages/iching-engine/src/engine.ts` (Huang path) |
| **Tests** | `engine.mutation-rules.test.ts` (53) + `engine.line-reading-systems.test.ts` (37) = **90/90 PASS** |

**Cita literal libro (PDF ~51, reglas 1–7):**

1. «If there are two moving lines—one yin and the other yang—consult only the yin moving line.»
2. «If the two moving lines are both yin or both yang, consult the lower one.»
3. «If there are three moving lines, consult only the middle one.»
4. «If there are four moving lines, consult only the upper of the two nonmoving lines.»
5. «If there are five moving lines, consult only the other, nonmoving line.»
6. «If six lines are all moving, consult the Decision of the new gua, the approached gua.»
7. «…for these gua consult the seventh Yao Text, called All Nines or All Sixes.»

**Matriz motor:** 8 **exact** + 1 **equivalent** (Qian/Kun: `specialYaoText` + juicio transformado en cast; sin `readBothJudgments` en prompt Huang).

**Auditoría previa:** [`MUTATION_RULES_HUANG_ALIGNMENT_AUDIT_2026-06-19.md`](MUTATION_RULES_HUANG_ALIGNMENT_AUDIT_2026-06-19.md) — `FOUR_LOWEST_STABLE` = superior estable del transformado.

---

### B.2 Zhu Xi — Yixue Qimeng ch. IV (Adler)

| Evidencia | Referencia |
|-----------|------------|
| **Libro** | Zhu Xi (1186), *Yixue Qimeng* 易學啟蒙; trad. Joseph A. Adler, SUNY Press series Bilingual Texts |
| **PDF local** | `Introduction To The Study Of The Classic Of Change (...Adler...).pdf` |
| **Capítulo** | IV «Examining the Prognostications» 占筮 |
| **PDF core** | **150–158** (folio impreso **48–53**) — **no** PDF 113 (cap. III milfoil) |
| **PDF notas** | **205–215** (notas al pie **128–150**, folio impreso ~64–74) |
| **Fig. 19 (resuelta §E.2.2)** | PDF **159–204** — 32 diagramas (imágenes). Chart 乾/坤 = p.162; render `tools/output/zhuxi-32charts/`. Resultado: ≡ reglas por conteo |
| **Gold JSON** | `tools/output/fidelity-gold/zhuxi-adler-mutation-rules-gold.json` |
| **Extract** | `zhuxi-adler-ch4-core-p150-158.txt`, `zhuxi-adler-ch4-notes-p205-215.txt` |
| **Scripts** | `scripts/lib/zhuxi-adler-pdf-gold.mjs`, `npm run extract:gold:zhuxi-adler-pdf`, `npm run audit:zhuxi-rules-vs-adler-gold` |
| **Motor** | `packages/iching-engine/src/rules/zhuxi.ts` |
| **Prompt** | `backend/claude/src/interpretation.ts` — `readBothJudgments`, `judgmentEmphasis` |
| **DB** | migración **074** — `consultations.line_reading_system` |
| **Tests** | **37/37 PASS** `engine.line-reading-systems.test.ts` |
| **Selector audit** | [`LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md`](LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md) |

**Citas literales verificadas en extract (10/10 snippets PASS):**

| Regla | PDF | Folio | Texto Adler (extracto) | Código motor |
|-------|-----|-------|------------------------|--------------|
| 0 | 152 | 49 | «…all unchanging lines… T'uan statement… inner hexagram as chen… outer as hui» | `ZX_ZERO` |
| 1 | 154 | 50 | «…only one line changes… statement of the original hexagram's changing line» | `ZX_ONE` |
| 2 | 154 | 50 | «…two lines change… upper line [of the two] as ruler» | `ZX_TWO_UPPER` |
| 3 | 154 | 50 | «…three lines change… first ten hexagrams… chen the ruler; latter ten… hui the ruler» | `ZX_THREE_JUDGMENTS` (**equivalent** pos 1) |
| 4 | 156 | 51 | «…four lines change… lower line as ruler» (estables en transformado) | `ZX_FOUR_LOWER` |
| 5 | 156 | 51 | «…five lines change… unchanging line of the resulting hexagram» | `ZX_FIVE_ONLY` |
| 6 Q/K | 150,158 | 48,52 | Qian/Kun all-changing + 用九/用六; «both hexagram statements and their interrelationships» (fn. **148**) | `QIAN_ALL_NINE` / `KUN_ALL_SIX` + `readBothJudgments` |
| 6 otros | 158 | 52 | «…other hexagrams… T'uan statement of the resulting hexagram» | `ZX_SIX_TRANSFORMED` |
| 32 charts | 158 | 52 | «…up through the 32 use the lines of the **original** hexagram… after the 32 use the lines of the **changed** hexagram» | ≡ reglas por conteo (§E.2.2) — `ZX_*` ya equivalentes |

**Footnotes con peso académico:**

| # | PDF | Tema | Implicación motor |
|---|-----|------|-------------------|
| 128 | 205 | 用九/用六 Image appendix | Texto supernumerario Qian/Kun |
| 141 | 205 | chu = línea gobernante | 2 líneas Zhu Xi |
| 144–145 | 205 | Mu Chiang / Gen→Sui | **No** usar T'uan de Sui; línea 2 estable |
| 148 | 215 | Qian/Kun 6 cambios | Ambos juicios + interrelación |
| 149 | 215 | 4096 combinaciones | Hsi-tz'u A.9.8 → base 32 charts |

---

## Parte C — Producto y transparencia

| Capa | Ubicación | Contenido |
|------|-----------|-----------|
| **Usuarios** | `/audits` + i18n `audits-page-ui.ts` | Fecha, edición auditada, pass/fail — **sin** metodología ni códigos motor |
| **Interno** | `docs/auditorias/*.md` | Matrices, citas, commits, reports, planes |
| **FAQ / Notas** | Redirigen a `/audits` para fidelidad de datos |

---

## Parte D — Brechas abiertas

| ID | Brecha | Evidencia libro | Impacto si se implementa |
|----|--------|-----------------|--------------------------|
| **G1** | Zhu Xi 20 casos × 3 líneas (first-ten / latter-ten) | Adler p.154 | ✅ **CERRADO — no-op.** D0.1 confirmó `includes(1)` exacto (§E.2.2) |
| **G2** | Zhu Xi 32 diagramas Fig. 19 | Adler p.158 + 御纂折中 | ✅ **CERRADO — no diverge.** Fig. 19 ≡ reglas por conteo (§E.2.2). No hay bug latente 4/5 |
| **G3** | Huang Qian/Kun prompt dual-judgment | Huang p.62 + regla 6 | Solo prompt; motor ya entrega textos |
| **G4** | `licenseNote` Legge bundle metadata desactualizado | — | Cosmético; oracle 514/514 OK |

**Regla operativa:** G1/G2 **cerrados** — motor verificado correcto, **sin** cambios. No tocar `zhuxi.ts`.

---

## Parte F: Validación externa Opus 4.8 v2.1 (greenfield) + acuerdo implementación

**Documento:** [`EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md`](EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md)  
**Rama verificada por auditor:** `staging` `fe1f184`  
**Luz verde documental v2.1:** SÍ  
**Luz verde motor:** N/A — Gate 0 cerrado, motor verificado correcto, sin cambios  
**Gate 0:** ✅ **CERRADO** (22 jun 2026) — D0.1 confirmado + D0.2 resuelto (§E.2.2). Fases A→E canceladas.

> **DECISIÓN DE PRODUCTO (Alexis, 22 jun 2026): GREENFIELD.** Forward-only. **Actualización (2ª sesión):** los 32 charts resultaron ≡ reglas por conteo; no se implementa nada nuevo, el motor actual ya es canónico.

### F.1 Acuerdo del equipo (Cursor, post v2.1)

| Observación Opus 4.8 | ¿De acuerdo? | Notas |
|---------------------|--------------|-------|
| W/L re-ingesta 100% book-primary sólida; hex 18 OK | **Sí** | Reproducible con gates PDF 22 jun |
| G1 = combinatoria 10/10 ↔ `includes(1)` | **Sí, con reserva** | Confirmar orden Adler en D0.1 |
| G2 tensión reglas 4/5 vs Fig. 19 | **Sí, crítico** | Lectura técnica D0.2 obligatoria |
| Fase 0 gate duro antes de motor | **Sí, adoptado** | Plan v2.1 |
| Greenfield forward-only | **Sí, adoptado** | Neutraliza riesgos históricos; default ON al lanzar |
| Flag = andamio dev, no A/B paridad | **Sí, adoptado** | Fase D/E v2.1 |
| H2 en Fase C | **Sí** | Plan v2.1 |
| H1/H3 ambas fuentes | **Sí** | Plan v2.1 |
| Gen→Sui automatizado | **Sí** | Fase B |
| T1/T2 ejecutables ya | **Sí** | Orden ejecutor §Parte G |

### F.2 Checklist ejecutor

**Ejecutar YA (no bloquea Gate 0):**

- [x] **T2:** `sourceUrl` Wilhelm → Pantheon/Bollingen (Princeton bibliographic); `licenseNote` Legge 514/514 PDF gold (`feat/t2-wilhelm-metadata`, 22 jun 2026)
- [x] **T1:** coma Zhou Yi `,` → `，` en campos oráculo; re-gate 514/514 ctext; 0 half-width / 908 full-width (`feat/t1-zhouyi-comma-normalize`, 22 jun 2026)

**Gate 0 (bloqueante motor, sin código) — CERRADO:**

> **Estado (22 jun 2026): ✅ CERRADO.** D0.1 confirmado + D0.2 resuelto (§E.2.2). Veredicto: 32 charts ≡ reglas por conteo. Motor sin tocar (riesgo cero).

- [x] **D0.1:** ✅ `includes(1)` **confirmado exacto** — reconstrucción `tools/reconstruct-zhuxi-3line-chart.mjs` (10/10, boundary 恒/益) + visual PDF + Hacker/Cottrell
- [x] **D0.2:** ✅ Fig. 19 **NO diverge** — cita 朱子 (御纂折中) mapea exacto sobre n=1,2/4,5,6 del motor
- [x] Spot-check Fig. 4.19.1 (乾/坤) vs reconstrucción — primeros-10 en sub-grid 乾, últimos-10 en sub-grid 坤
- [x] Sign-off producto D0.2 (greenfield, forward-only)

**Tras Gate 0 — Fases A→E CANCELADAS (innecesarias, §E.2.2):**

- [x] ~~Fase A: gold JSON 32 entradas~~ — cancelada (producería salida idéntica)
- [x] ~~Fase B-D: motor + prompt + API~~ — cancelada (motor ya es el sistema de charts)
- [x] ~~Fase E: cutover~~ — cancelada (nada que migrar)

---

## Parte G: Para el ejecutor

Orden completo en [`EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md`](EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md) §Parte 6 y [`ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md`](ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md) §10.

**Regla operativa:** Gate 0 **cerrado** (§E.2.2). Motor de charts **no se escribe** — el motor por conteo actual ya es el sistema de 32 charts de Zhu Xi. No tocar `zhuxi.ts`.

---

## Parte H: Zhou Yi, trazabilidad e incidentes históricos

### H.1 Cadena de trazabilidad vigente (staging post-T1)

```
ctext.org (cache tools/output/fidelity-gold/ctext-*.json + HTML)
    ↓ tools/ingest-zhouyi-ctext.mjs  (toCanonicalZhouYiText + full-width punctuation)
scripts/iching_zhouyi_translation.mjs
    ↓ npm run build:data
packages/iching-data/src/generated/hexagrams.zhouyi.json
    ↓ app / biblioteca / prompt
Usuario ve 卦辞·爻辞·大象·用九/用六
```

| Eslabón | Reproducible | Evidencia |
|---------|--------------|-----------|
| Gold compare | Sí | `--gold=mirrors --translator=zhouyi` → 514/514 |
| Corrupción objetiva | Sí | `scan:zhouyi-corruption` = 0 |
| PDF 注疏 local | No (sin parser) | `tools/source-pdfs/manifest.json` → `zhouyi.file` |

### H.2 PDF 注疏 vs ctext: por qué NO es gold 1:1 hoy

El PDF `zhouyi-zhushu-song-er07.pdf` (影印南宋刊本 + 注疏) mezcla texto canónico, comentarios 注·疏 y escaneo/manuscrito denso. Extraer solo campos oráculo con paridad 1:1 tipo Wilhelm/Legge requiere pipeline OCR+segmentación dedicado (no existe). Gold operativo = **ctext**.

**Recomendación:** no prometer "verified against our local 注疏 PDF" hasta Fase PDF Zhou Yi. Claim vigente = **ctext.org** + escáner de corrupción.

### H.3 Incidente biblioteca · mismo glifo en dos hexagramas (cerrado)

**Síntoma reportado (Alexis):** al buscar o navegar en la **biblioteca**, el mismo carácter chino aparecía asociado a **dos hexagramas distintos**.

**Causa raíz (dataset `freizl/yijing`, commit `8063006` — lanzamiento biblioteca):** confusión **咸** (Influencia, hex **31**) vs **鹹** (salado, carácter distinto pero visualmente parecido). En freizl:

- Hex **31** tenía `name: "鹹"` y juicio `鹹，亨…` — el **nombre del hexagrama** era el glifo equivocado.
- Hex **19** (臨) incluía `鹹臨` en líneas — el mismo glifo **鹹** reaparecía en otro hex.

En la UI de biblioteca (nombre + búsqueda por carácter), **鹹** podía mostrarse como titular del hex 31 y también dentro del hex 19 → percepción de “símbolo duplicado entre hexagramas”. No era hex **32/34** (恆/大壯 verificados OK).

**P0 cerrado 21 jun 2026** (re-ingesta **ctext**, no parche sobre freizl ni PDF 注疏):

| Hex | Campo | Error (freizl) | Estado hoy |
|-----|-------|----------------|------------|
| **14** | L2 | Texto de hex **13** (`同人於宗`) | ✅ `大車以載，有攸往，無咎。` |
| **19** | L1-L2 | `鹹臨` vs `咸臨` | ✅ `咸臨，吉無不利。` |
| **31** | `name` + judgment + lines | **`鹹` por `咸`** | ✅ `name=咸`, juicio `咸，亨…` |
| **44** | L5 | Etiqueta `九五：` filtrada | ✅ limpio |

**Commits:** `0e003ea` (ingest ctext), `1fc4cbf` (Fase 3b), `bfbe8f6` (Fase 3d harness).

**Nota upstream (verificado 22 jun 2026):** `freizl/yijing` `zh-TW/64gua.json` **sigue** con `name: "鹹"` en hex 31 hoy. **ctext.org** tiene **咸** correcto. El error era del dataset intermedio inicial de la app, no del gold ctext actual.

### H.4 Verificación en vivo (22 jun 2026)

```bash
npm run scan:zhouyi-corruption              # TOTAL incidencias: 0
npm run check:hex-glyph-uniqueness          # dup name / hex_font: []
npm run verify:hexagram-fidelity:zhouyi-ctext   # 514/514 match (100%)
```

### H.5 Riesgo residual

| Riesgo | Mitigación |
|--------|------------|
| ctext ≠ edición impresa 注疏 | variant map + gate ctext |
| Sin gate book-primary chino | claims honestos; Fase PDF = proyecto separado |
| Regresión tipo freizl | `scan:zhouyi-corruption`; no reintroducir freizl como ingest |

---

## Parte E: Plan 32 diagramas Zhu Xi (v2.1 greenfield)

Plan completo: [`ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md`](ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md)

### E.1 Objetivo

Paridad motor vs gold Adler Fig. 19 sobre **inputs de chart distintos** (no 4096 literales exhaustivos). Comportamiento canónico **forward-only** desde lanzamiento (greenfield).

### E.2 Evidencia que obliga la implementación

**Texto primario (PDF 158, folio 52):**

> «The changes in the hexagrams up through the 32 use the lines of the **original** hexagram as prognostication. The changes of the hexagrams **after the 32** use the lines of the **changed** hexagram as prognostication.»

**Regla 3 líneas (PDF 154):** 20 casos. D0.1 pendiente (probable no-op con `includes(1)`).

### E.2.1 Gate 0 EJECUTADO (22 jun 2026, 1ª sesión) — tentativo, superado por E.2.2

Gate 0 cerrado documentalmente (ver plan §0.A). Resumen (⚠️ **conclusiones corregidas en E.2.2**):

| Decisión | Resultado (tentativo) |
|----------|-----------|
| **D0.1** (`includes(1)` exacto n=3) | Hipótesis fuerte (split 10/10 coincide) **no confirmada** entonces: orden de los 20 casos no derivable de `pdftotext` |
| **D0.2** (Fig. 19 override 4/5) | (Erróneo) creído sistema **paralelo** divergente — **corregido en E.2.2** |
| **Spot-check** | Figure 4.19.1 (乾 regente) leída vía `pdftoppm`; estructura de rejilla confirmada |
| **🔴 Go/No-Go (1ª sesión)** | Fig. 19 son diagramas escaneados; `pdftotext` no sirve → se buscó otra vía (E.2.2) |

### E.2.2 Gate 0 CERRADO DEFINITIVO (22 jun 2026, 2ª sesión) — Fases A→E CANCELADAS

**Veredicto: el aparente "sistema adicional de 32 charts" no es más que las MISMAS reglas por conteo, resumidas de otra forma.** Probado por reconstrucción algorítmica + comparativa visual contra la imagen del PDF + 3 autoridades. Detalle completo en plan **§0.B**.

| Decisión | Resultado **definitivo** |
|----------|-----------|
| **D0.2** (¿Fig. 19 diverge de reglas 4/5?) | ❌ **NO.** Cita de Zhu Xi (御纂折中 考變占第四): `一爻二爻變在前 → 本卦`; `四爻五爻六爻變在後 → 之卦`; `三爻變二十卦，十前十後`. Mapea **exacto** sobre n=1,2 (original) / 4,5,6 (transformado) del motor. Boundary autoconsistente 32/32 ✓ |
| **D0.1** (¿`includes(1)` exacto n=3?) | ✅ **CONFIRMADO.** Reconstrucción `tools/reconstruct-zhuxi-3line-chart.mjs` → split **10/10** con boundary 恒(#32)/益(#33) **idéntico** al texto clásico (`乾自姤至恒…乾自益至坤`). Comparativa visual: primeros-10 todos en sub-grid 乾, últimos-10 todos en sub-grid 坤 (Fig. 4.19.1). |
| **Autoridades** | Ed Hacker (biroco.com) + Russell Cottrell (russellcottrell.com): "if bottom/first line changing → first hexagram judgment; else second — gives the same result as Zhu Xi's 32 charts." |
| **Veredicto** | Motor actual (`zhuxi.ts`, incl. `includes(1)` L85) **ES** el sistema de 32 charts. Sin cambios de código (riesgo cero). **No** se añade tercera opción de lectura. |

**Mapeo de equivalencia (verbatim 朱子):**

| Líneas | 32 charts | Motor `zhuxi.ts` | ✓ |
|---|---|---|---|
| 1–2 | antes del 32 → 本卦 | `ZX_ONE`/`ZX_TWO_UPPER` (original) | ✅ |
| 4–5–6 | después del 32 → 之卦 | `ZX_FOUR_LOWER`/`ZX_FIVE_ONLY`/`ZX_SIX_TRANSFORMED` | ✅ |
| 3 (×20) | split 10/10 主貞/主悔 | `ZX_THREE_JUDGMENTS` `includes(1)` | ✅ |

**Evidencias guardadas:** `tools/reconstruct-zhuxi-3line-chart.mjs` (commiteado, reproducible); `tools/output/fidelity-gold/zhuxi-32charts-textual-sources.txt` + `zhuxi-fig19-qian-kun-chart-upright.png` + `tools/output/zhuxi-32charts/` (cache gitignored). Fuentes web: eee-learning.com/book/4716, taijizhidian.net/book/read/10202.html, ctext.org/wiki.pl?chapter=699485, russellcottrell.com/VirtualYarrowStalks/ChuHsiRules.htm, biroco.com/yijing/basics.htm.

**Recomendación final:** motor cerrado y verificado correcto. **Fases A→E canceladas** (innecesarias — producirían salida idéntica). No tocar `zhuxi.ts`.

### E.3 Fases (resumen) — A→E CANCELADAS tras §E.2.2

| Fase | Entregable | Estado |
|------|------------|------|
| **0** | D0.1 + D0.2 citadas | ✅ **CERRADO** (D0.1 confirmado, D0.2 resuelto) |
| **A** | `zhuxi-adler-32-charts-gold.json` | ❌ Cancelada (salida idéntica al motor) |
| **B** | `resolveZhuXiChart()` + flag scaffold | ❌ Cancelada (motor ya ≡ charts) |
| **C** | Prompt + H1/H3/H2 | ❌ Cancelada |
| **D** | API + Axiom | ❌ Cancelada |
| **E** | Cutover **default ON** | ❌ Cancelada (nada que migrar) |

### E.4 Decisiones producto (cerradas v2.1)

1. Greenfield forward-only: **sí** (22 jun 2026)
2. Cutover default ON: **sí**
3. Flag = andamio + interruptor: **sí**
4. T1/T2: ejecutables ya

### E.5 Compatibilidad histórica

**Neutralizado (greenfield):** no hay consultas de usuarios. Sin re-hidratación ni remediación retroactiva.

---

## 8. Índice de evidencias por fuente

| Fuente | Tipo evidencia | Artefacto reproducible |
|--------|----------------|------------------------|
| Wilhelm Pantheon 1950 | Gate automatizado | `reports/hexagram-fidelity-2026-06-22T14-55-38-200Z.json` |
| Wilhelm Pantheon 1950 | Injector audit | `node tools/audit-wilhelm-injector-vs-datasets.mjs` → 512/512 |
| Legge SBE XVI scan | Gate automatizado | `reports/hexagram-fidelity-2026-06-22T14-55-40-301Z.json` |
| Legge SBE XVI scan | Spot-check manual | `LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md` |
| Huang 2010 PDF | Rule extract | `huang-mutation-rules-gold.json` + 9/9 snippets |
| Adler Zhu Xi ch. IV | Rule extract | `zhuxi-adler-mutation-rules-gold.json` + 10/10 snippets |
| Adler Fig. 19 (32 charts) | Reconstrucción + visual | `tools/reconstruct-zhuxi-3line-chart.mjs` (10/10 boundary 恒/益); `zhuxi-fig19-qian-kun-chart-upright.png`; `zhuxi-32charts-textual-sources.txt` |
| Validación externa Opus 4.8 | Adoptada v2.1 greenfield | `EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md` |
| Motor iching-engine | Tests | 90 mutation + 37 line-reading |
| Prompt producción | Gates | H1–H5 `interpretation-output-validator.ts` |

---

## 9. Documentos relacionados

| Documento | Rol |
|-----------|-----|
| [`ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md`](ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md) | Historia mirrors → book-primary |
| [`MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md`](MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md) | Detalle Huang + Zhu Xi |
| [`ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md`](ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md) | Plan implementación G1/G2 |
| [`LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md`](LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md) | Selector dual + migración 074 |
| [`MUTATION_RULES_HUANG_ALIGNMENT_AUDIT_2026-06-19.md`](MUTATION_RULES_HUANG_ALIGNMENT_AUDIT_2026-06-19.md) | FOUR_LOWEST_STABLE |
| [`EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md`](EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md) | Validación externa v2.1 greenfield |
| [`PROMPT_MUTATION_RULES_AUDIT_2026-06-15.md`](PROMPT_MUTATION_RULES_AUDIT_2026-06-15.md) | Gates prompt mutación |

---

*Actualizado 22 jun 2026 (2ª sesión): **Gate 0 CERRADO** — 32 charts ≡ reglas por conteo (§E.2.2), Fases A→E canceladas; T1/T2 cerrados; Zhou Yi trazabilidad §Parte H (staging `9f2a170`).*
