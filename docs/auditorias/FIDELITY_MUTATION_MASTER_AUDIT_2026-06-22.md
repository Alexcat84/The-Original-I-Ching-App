# Auditoría maestra — Fidelidad textos del oráculo + reglas de mutación

**App:** The Original I Ching  
**Fecha cierre documento:** 22 jun 2026  
**Merge a `staging`:** 22 jun 2026 (desde `feat/wilhelm-pdf-gold-sync`; **`main` pendiente**)  
**Estado global:** Textos W/L **book-primary PASS** · Mutaciones Huang/Zhu Xi **core PASS** · Zhu Xi **32 diagramas PENDIENTE**  
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
8. [Índice de evidencias por fuente](#8-índice-de-evidencias-por-fuente)
9. [Documentos relacionados](#9-documentos-relacionados)

---

## 1. Resumen ejecutivo

| Dominio | Fuente Tier-0 | Gate / evidencia | Resultado | Estado |
|---------|---------------|------------------|-----------|--------|
| **Wilhelm/Baynes** | Pantheon 1950 PDF local | `verify:hexagram-fidelity:pdf-wilhelm` | **513/513 (100%)** | ✅ Cerrado |
| **James Legge** | SBE XVI Oxford scan OCR | `verify:hexagram-fidelity:pdf-legge` | **514/514 (100%)** | ✅ Cerrado |
| **Zhou Yi** | 周易注疏 + ctext.org | `verify:hexagram-fidelity` (zhouyi) | **514/514 (100%)** | ✅ Cerrado (sin cambio en esta rama) |
| **Huang mutaciones** | Complete I Ching 10th ed. PDF | `audit:huang-rules-vs-pdf-gold` | **9/9 snippets, 90/90 tests** | ✅ Cerrado |
| **Zhu Xi mutaciones** | Adler trans. Yixue Qimeng ch. IV | `audit:zhuxi-rules-vs-adler-gold` | **10/10 snippets, 37/37 tests** | ✅ Core cerrado |
| **Zhu Xi 32 diagramas** | Adler Fig. 19 (PDF 159–204) | — | **not_implemented** | ⏳ Plan §E |

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

**Mirrors web** (Parma, sacred-texts, ctext): deprecated como gate de producción; conservados solo como histórico en [`ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md`](ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md) §14.

**Comandos canónicos:**

```bash
npm run verify:hexagram-fidelity:pdf-wilhelm   # Wilhelm vs Pantheon PDF
npm run verify:hexagram-fidelity:pdf-legge      # Legge vs SBE XVI OCR gold
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
| **Cross-check (repair-only)** | `The Yi King or, Book of Changes -- James Legge.epub` — **no** sustituye escaneo |
| **Manifest** | `manifest.json` → `sources.legge` (OCR pp. 86–240 texto, 296–420 Great Symbolism) |
| **Parser OCR** | `scripts/lib/hexagram-fidelity-legge-sbe-pdf.mjs`, `hexagram-fidelity-legge-sbe-ocr.mjs` |
| **Parches book-primary** | `hexagram-fidelity-legge-sbe-book-primary.mjs` (h5 Thwan, h21 L6, labels «line» vs «six») |
| **Sync / inyección** | `tools/sync-legge-oracle-from-pdf-gold.mjs` |
| **Auditoría injector** | `tools/audit-legge-injector-vs-datasets.mjs` — book_primary_label / yongJiu OK |
| **Spot-check manual** | [`LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md`](LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md) — capturas h01 yongJiu, h10 Thwan, patrón line/six |
| **Gate PASS** | `reports/hexagram-fidelity-2026-06-22T14-55-40-301Z.json` — **514/514 match (100%)** |
| **Commits** | `4409062`, `46aa80a` |

**Evidencia textual crítica (hex 1 yongJiu, escaneo Oxford):**

> «The lines of this hexagram are all strong and undivided, as appears from) the use of the **number nine**.»

Bundle alineado al escaneo (`nine`, no `line` del EPUB re-pack). Ver §A1 spot-check doc.

**Evidencia Gen→Sui (relevante mutaciones Zhu Xi fn. 144–145):** hex 18 → transformed hex 17; línea 2 estable de Sui es la correcta para 5 cambios — validada en gold Adler y en motor Legge/Wilhelm para citas.

---

### A.3 Zhou Yi (canon + 注疏)

| Evidencia | Referencia |
|-----------|------------|
| **Fuente** | 周易注疏 (南宋刊本影印); ingest ctext.org |
| **Archivo local** | `tools/source-pdfs/zhouyi-zhushu-song-er07.pdf` |
| **Bundle** | `packages/iching-data/src/generated/hexagrams.zhouyi.json` |
| **Estado** | 100% oracle fields — sin regresión en rama `feat/wilhelm-pdf-gold-sync` |

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
| **Fig. 19 (pendiente)** | PDF **159–204** — 32 diagramas |
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
| 32 charts | 158 | 52 | «…up through the 32 use the lines of the **original** hexagram… after the 32 use the lines of the **changed** hexagram» | **not_implemented** |

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
| **G1** | Zhu Xi 20 casos × 3 líneas (first-ten / latter-ten) | Adler p.154 | **Probable no-op** si D0.1 confirma orden lex = `includes(1)` (Opus 4.8). Si no → tabla explícita |
| **G2** | Zhu Xi 32 diagramas Fig. 19 | Adler p.158 + PDF 159–204 | Cambia `fromHexagram` en 3/4/5 — **Gate D0.2** decide si bug latente 4/5 |
| **G3** | Huang Qian/Kun prompt dual-judgment | Huang p.62 + regla 6 | Solo prompt; motor ya entrega textos |
| **G4** | `licenseNote` Legge bundle metadata desactualizado | — | Cosmético; oracle 514/514 OK |

**Regla operativa:** G2 requiere **Fase 0 (Gate 0)** + plan §E v2 antes de tocar motor. G1 puede ser verificación solamente.

---

## Parte F: Validación externa Opus 4.8 v2.1 (greenfield) + acuerdo implementación

**Documento:** [`EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md`](EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md)  
**Rama verificada por auditor:** `staging` `fe1f184`  
**Luz verde documental v2.1:** SÍ  
**Luz verde motor:** pendiente Gate 0 técnico (D0.1/D0.2)

> **DECISIÓN DE PRODUCTO (Alexis, 22 jun 2026): GREENFIELD.** Forward-only. Sign-off D0.2 (producto) dado. Gate 0 técnico sigue bloqueante.

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

**Gate 0 (bloqueante motor, sin código):**

- [ ] **D0.1:** Adler p.154 + Fig. 19 → `equivalentToIncludesPos1`
- [ ] **D0.2:** p.158 + reglas 4/5 p.156 → dictamen técnico escrito
- [ ] Spot-check ≥10 celdas Fig. 19 (PDF 159-204)
- [x] Sign-off producto D0.2 (greenfield, forward-only)

**Tras Gate 0:**

- [ ] Fase A: gold JSON 32 entradas
- [ ] Fase B-D: motor + prompt + API (flag scaffold)
- [ ] Fase E: cutover **default ON**

---

## Parte G: Para el ejecutor

Orden completo en [`EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md`](EXTERNAL_VALIDATION_FIDELITY_MUTATION_2026-06-22_OPUS48.md) §Parte 6 y [`ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md`](ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md) §10.

**Regla operativa:** no escribir motor de charts hasta Gate 0 cerrado con citas de folio.

## Parte E: Plan 32 diagramas Zhu Xi (v2.1 greenfield)

Plan completo: [`ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md`](ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md)

### E.1 Objetivo

Paridad motor vs gold Adler Fig. 19 sobre **inputs de chart distintos** (no 4096 literales exhaustivos). Comportamiento canónico **forward-only** desde lanzamiento (greenfield).

### E.2 Evidencia que obliga la implementación

**Texto primario (PDF 158, folio 52):**

> «The changes in the hexagrams up through the 32 use the lines of the **original** hexagram as prognostication. The changes of the hexagrams **after the 32** use the lines of the **changed** hexagram as prognostication.»

**Regla 3 líneas (PDF 154):** 20 casos. D0.1 pendiente (probable no-op con `includes(1)`).

### E.3 Fases (resumen)

| Fase | Entregable | Gate |
|------|------------|------|
| **0** | D0.1 + D0.2 citadas | Bloqueante motor |
| **A** | `zhuxi-adler-32-charts-gold.json` | 32 entradas + spot-check ≥10 |
| **B** | `resolveZhuXiChart()` + flag scaffold | 90 tests OFF; chart tests ON |
| **C** | Prompt + H1/H3/H2 | QA mutation-output |
| **D** | API + Axiom | Smoke 3/4/5 |
| **E** | Cutover **default ON** | `/audits` re-entrada |

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
| Adler Fig. 19 | Pendiente | PDF pp. 159–204 |
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

*Actualizado 22 jun 2026: validación Opus 4.8 v2.1 greenfield, luz verde documental.*
