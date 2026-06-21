# I Ching Data Integrity & Reliability Audit

This document records the 1:1 fidelity audits performed on the three translator bundles in `@iching-oracle/iching-data`.

**Master audit (open plan and harness):** [ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md](./ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md)

---

## Auditorías realizadas

### Última auditoría 1:1 · 21 de junio de 2026

| Traductor | Gold declarado | Resultado verify | Notas |
|-----------|----------------|------------------|-------|
| **Legge** | sacred-texts.com (ic + icap2) | **100%** (513/513 campos oráculo) | Juicio, imagen (Great Symbolism) y líneas |
| **Zhou Yi** | ctext.org (API + 大象) | **100%** (514/514 campos oráculo) | 卦辞, 爻辞, 用九/六, 大象 |
| **Wilhelm** | Uni Parma mirror + suplemento Baynes tier-2 | **100%** (514/514 campos oráculo) | Un único suplemento documentado: **hex 56 judgment**, donde Parma omite `THE JUDGMENT`; el oracle Baynes (edición Princeton) se aplica vía `hexagram-fidelity-wilhelm-baynes-supplement.mjs`, contrastado con wengu e iching-online |

**Reporte:** `reports/hexagram-fidelity-2026-06-21T19-45-04-900Z.json`

**Hallazgo y resolución (Wilhelm hex 56):** el HTML del mirror de Parma no incluye la sección `THE JUDGMENT` ni el oracle breve Baynes para el hexagrama 56 (Lu / The Wanderer). El bundle ya contenía el texto correcto; el gap era de verificación contra gold Parma vacío. **Solución:** gold tier-2 Baynes documentado solo para ese campo, sin cambiar nombres de campo ni forma JSON del dataset.

**Alcance del verify:** solo textos del oráculo (judgment/image/lines, yongJiu/yongLiu). Comentarios editoriales Wilhelm/Legge excluidos por diseño del parser.

**Comandos reproducibles:**

```bash
npm run ingest:translations
npm run build:data
npm run verify:hexagram-fidelity
npm run scan:zhouyi-corruption   # gate Zhou Yi = 0
```

---

## Precedente · hex 23 metadata (2026-05-10)

Corrección puntual del trigrama inferior en metadata Wilhelm (hex 23: Kūn, no Lì). Precedente válido; la auditoría 2026-06-21 es la referencia actual para fidelidad literaria 1:1.

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-05-10 |
| **Fix** | `scripts/iching_wilhelm_translation.mjs` + `npm run build:data` |
| **Alcance** | Solo metadata trigrama inferior hex 23 |

---

## Ongoing reliability

Los bundles se regeneran con `npm run build:data` desde los ingesters gold-aligned (`tools/ingest-wilhelm.mjs`, `tools/ingest-legge-sacred.mjs`, `tools/ingest-zhouyi-ctext.mjs`). El harness `npm run verify:hexagram-fidelity` debe pasar antes de promover cambios de dataset.

*Last 1:1 audit date: 21 June 2026*
