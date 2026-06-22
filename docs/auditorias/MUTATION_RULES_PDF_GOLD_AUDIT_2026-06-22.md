# Mutation rules — PDF gold audit (Huang + Zhu Xi)

**Fecha:** 22 jun 2026  
**Rama:** mergeada a `staging` (22 jun 2026) · `main` pendiente  
**Estado:** Cerrada (core rules) · **Pendiente:** lookup 32 diagramas Zhu Xi (ver plan dedicado)  
**Índice maestro:** [`FIDELITY_MUTATION_MASTER_AUDIT_2026-06-22.md`](FIDELITY_MUTATION_MASTER_AUDIT_2026-06-22.md)  
**Página pública:** `/audits` — resumen solo fechas/fuentes/resultado  
**Scripts:** `npm run extract:gold:huang-pdf`, `npm run audit:huang-rules-vs-pdf-gold`, `npm run extract:gold:zhuxi-adler-pdf`, `npm run audit:zhuxi-rules-vs-adler-gold`

---

## 1. Alcance

Verificación book-primary de las reglas de **reducción Huang** (default app) y **Zhu Xi** (selector) contra PDFs locales Tier-0. No incluye re-implementación del lookup clásico de 32 diagramas (documentado como gap).

---

## 2. Alfred Huang — The Complete I Ching (10th ed.)

### Fuente

| Campo | Valor |
|-------|-------|
| Archivo | `tools/source-pdfs/The Complete I Ching — 10th Anniversary Edition _ The -- Taoist Master Alfred Huang.pdf` |
| Sección | «Gaining Insight from the Oracle» — método Master Yin |
| PDF páginas | 48–55 (reglas 1–7 en ~51) |
| Gold | `scripts/lib/huang-pdf-gold.mjs` → `tools/output/fidelity-gold/huang-mutation-rules-gold.json` |

### Resultado extract

- **9/9** fragmentos de reglas encontrados en extracto PDF
- **8 exact** + **1 equivalent** vs motor
- Tests: `engine.mutation-rules.test.ts` + `engine.line-reading-systems.test.ts` → **90/90 PASS**

### Matriz libro ↔ motor

| # | Libro (Huang) | Código motor | Match |
|---|---------------|--------------|-------|
| 0 | nombre, símbolo, decisión | `NO_CHANGING` | exact |
| 1 | Yao + gua aproximado | `ONE_CHANGING` | exact |
| 2a | yin+yang → solo yin | `TWO_YIN_YANG` | exact |
| 2b | ambas iguales → inferior | `TWO_SAME_LOWER` | exact |
| 3 | central | `THREE_MIDDLE` | exact |
| 4 | superior de 2 estables | `FOUR_LOWEST_STABLE` | exact |
| 5 | única estable | `FIVE_ONLY_STABLE` | exact |
| 6 | decisión gua aproximado | `SIX_ALL_CHANGING` | exact |
| 7 | Qian/Kun → All Nines / All Sixes | `QIAN_ALL_NINE` / `KUN_ALL_SIX` | **equivalent** |

### Equivalente documentado (Qian/Kun, Huang)

- Regla 7: séptimo Yao (用九/用六).
- Capítulo Qian añade: leer también la **Decision** del gua aproximado cuando las seis líneas cambian.
- Motor: entrega `specialYaoText` + juicio transformado en el cast; **no** activa `readBothJudgments` en prompt (solo ruta Zhu Xi).
- **No se cambió motor** — cambio futuro sería solo prompt/gates Huang, plan aparte.

---

## 3. Zhu Xi — Yixue Qimeng ch. IV (Adler)

### Fuente

| Campo | Valor |
|-------|-------|
| Archivo | `Introduction To The Study Of The Classic Of Change (...Adler...).pdf` |
| Capítulo | IV «Examining the Prognostications» (占筮) |
| PDF core | 150–158 (folio impreso 48–53) |
| PDF notas | 205–215 (notas al pie 128–150) |
| Gold | `scripts/lib/zhuxi-adler-pdf-gold.mjs` |

### Calibración página (corrección 2026-06-20)

- Cap. IV empieza en **PDF 150** (folio 48), **no** PDF 113 (cap. III milfoil).
- Notas cap. IV: PDF 205–215.

### Resultado extract

- **10/10** snippets en extracto core
- **8 exact/equivalent** + **1 not_implemented** (32 diagramas)
- Tests: `engine.line-reading-systems.test.ts` → **37/37 PASS**

### Matriz libro ↔ motor

| Cambios | Adler / Zhu Xi | Código motor | Match |
|---------|----------------|--------------|-------|
| 0 | T'uan primario (chen/hui inner/outer) | `ZX_ZERO` | exact |
| 1 | línea cambiante original | `ZX_ONE` | exact |
| 2 | ambas líneas; superior chu | `ZX_TWO_UPPER` | exact |
| 3 | ambos T'uan; primeros 10 / últimos 10 de 20 casos | `ZX_THREE_JUDGMENTS` | **equivalent** (regla operativa pos 1) |
| 4 | 2 estables transformado; inferior chu | `ZX_FOUR_LOWER` | exact |
| 5 | única estable transformado | `ZX_FIVE_ONLY` | exact |
| 6 (no Q/K) | T'uan transformado | `ZX_SIX_TRANSFORMED` | exact |
| 6 Qian/Kun | 用九/用六 + ambos juicios + interrelación | `QIAN_ALL_NINE` / `KUN_ALL_SIX` + `readBothJudgments` | exact |
| 3/4/5 | 32 diagramas: líneas del original vs transformado | — | **not_implemented** |

### Footnotes críticas (Adler)

- **128:** 用九/用六 como apéndice Image
- **141:** chu = línea gobernante (2 líneas)
- **144–145:** Gen→Sui, error de usar T'uan en vez de línea 2
- **148:** seis cambios Qian/Kun → ambos juicios e interrelación
- **149:** 4096 combinaciones (Hsi-tz'u A.9.8)

---

## 4. Divergencias que requieren plan estricto

Ver [`ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md`](ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md).

| Gap | Impacto si se implementa |
|-----|--------------------------|
| Regla 3 líneas first-ten/latter-ten (20 casos) | Cambia `judgmentEmphasis` en casos donde pos 1 no está entre las tres |
| 32 diagramas (Fig. 19, PDF 159–204) | Cambia `selectedLineTexts` / `fromHexagram` en 3/4/5 cambios |
| API `/api/consult` | `mutation_rule` puede diferir para misma tirada |
| Prompt gates H1/H3/H5 | Nuevos fixtures multi-línea desde transformado |
| QA `pnpm qa:mutation-output` | Baseline JSON debe regenerarse con trazabilidad modelo |

**Regla operativa:** no mergear cambios de motor sin gates + tests + smoke staging.

---

## 5. Comandos de verificación

```bash
npm run extract:gold:huang-pdf
npm run audit:huang-rules-vs-pdf-gold
npm run extract:gold:zhuxi-adler-pdf
npm run audit:zhuxi-rules-vs-adler-gold
cd packages/iching-engine && npx vitest run src/engine.mutation-rules.test.ts src/engine.line-reading-systems.test.ts
```

---

## 6. Relación con auditorías previas

- [`MUTATION_RULES_HUANG_ALIGNMENT_AUDIT_2026-06-19.md`](MUTATION_RULES_HUANG_ALIGNMENT_AUDIT_2026-06-19.md) — alineación FOUR_LOWEST_STABLE (superior estable)
- [`LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md`](LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md) — selector dual + migración 074
