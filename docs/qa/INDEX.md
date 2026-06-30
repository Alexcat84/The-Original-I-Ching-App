# Índice maestro — tests y gates QA

**Registro canónico:** [`registry.json`](./registry.json) · **Convenciones:** [`CONVENTIONS.md`](./CONVENTIONS.md)  
**Reglas obligatorias:** [`../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md`](../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md)  
**Auditorías enlazadas:** [`docs/auditorias/INDEX.md`](../auditorias/INDEX.md)

Alta de test nuevo: **`registry.json` + `INDEX.md` + cabecera con `QA code`, `Area`, `Family`** — no negociable.

Backfill cabeceras: `npm run inject:qa-headers` · Validación: `npm run verify:qa-registry`

---

## Ejecución global

```bash
npm test                          # Vitest en todo el monorepo (turbo)
npm run verify:hexagram-fidelity  # Gate runtime W+L
npm run verify:overlay-glyphs     # Gate overlay PNG
npm run qa:mutation-output        # Matriz mutación (⚠ consume API)
npm run qa:reading-quality        # Lecturas reales (⚠ consume API)
npm run verify:qa-registry        # Registry + cabeceras en archivos
```

---

## Vitest unitarios (`TS-*`)

### Engine — `TS-ENG-*`

| Código | Area | v | Archivo | Comando | Auditoría |
|--------|------|---|---------|---------|-----------|
| `TS-ENG-001 engine-core` | `packages/iching-engine/src/engine` | 1.0.0 | `engine.test.ts` | `npm run test --prefix packages/iching-engine` | `AUD-DIV-01` |
| `TS-ENG-002 mutation-rules` | `packages/iching-engine/src/engine.mutation-rules` | 1.1.0 | `engine.mutation-rules.test.ts` | idem | `AUD-MUT-01`, `AUD-MUT-02` |
| `TS-ENG-003 line-reading-systems` | `packages/iching-engine/src/engine.line-reading-systems` | 1.0.0 | `engine.line-reading-systems.test.ts` | idem | `AUD-LRS-01` |

### Claude / interpretación — `TS-CLAUDE-*`

| Código | Area | v | Archivo | Descripción | Auditoría |
|--------|------|---|---------|-------------|-----------|
| `TS-CLAUDE-001 line-gate` | `backend/claude/src/interpretation-line-gate` | 1.0.0 | `interpretation-line-gate.test.ts` | Gates H1/H3/H5 bloqueantes | `AUD-MUT-02` |
| `TS-CLAUDE-002 output-validator` | `backend/claude/src/interpretation-output-validator` | 1.0.0 | `interpretation-output-validator.test.ts` | Validación salida LLM | `AUD-MUT-02` |
| `TS-CLAUDE-003 interpretation-v2` | `backend/claude/src/interpretation.v2` | 1.0.0 | `interpretation.v2.test.ts` | Payload Anthropic v2 | `AUD-MUT-02` |
| `TS-CLAUDE-004 judgment-image-gate` | `backend/claude/src/interpretation-judgment-image-gate` | 1.0.0 | `interpretation-judgment-image-gate.test.ts` | Gate H7 warn-only | `AUD-RDG-QA-02` |

### Web app — `TS-WEB-*`

| Código | Area | v | Archivo | Dominio |
|--------|------|---|---------|---------|
| `TS-WEB-001 detect-input-language` | `apps/web/src/lib/detect-input-language` | 1.1.0 | `detect-input-language.test.ts` | Idioma pregunta |
| `TS-WEB-002 manual-iching-consult` | `apps/web/src/lib/manual-iching-consult` | 1.0.0 | `manual-iching-consult.test.ts` | Yarrow wizard |
| `TS-WEB-003 response-clean` | `apps/web/src/lib/response-clean` | 1.0.0 | `response-clean.test.ts` | Limpieza SSE |
| `TS-WEB-004 chat-session-selection` | `apps/web/src/lib/chat-session-selection` | 1.0.0 | `chat-session-selection.test.ts` | Selección sidebar |
| `TS-WEB-005 db-idempotency` | `apps/web/src/lib/db-idempotency` | 1.0.0 | `db-idempotency.test.ts` | Persist retry |
| `TS-WEB-006 post-auth-legal` | `apps/web/src/lib/post-auth-legal` | 1.0.0 | `post-auth-legal.test.ts` | Legal post-OAuth |
| `TS-WEB-007 legal-consent-pending-meta` | `apps/web/src/lib/legal-consent-pending-meta` | 1.0.0 | `legal-consent-pending-meta.test.ts` | Re-aceptación |
| `TS-WEB-008 token-packs` | `apps/web/src/token-packs` | 1.0.0 | `token-packs.test.ts` | Packs / tiers |
| `TS-WEB-009 token-refund` | `apps/web/src/lib/token-refund` | 1.0.0 | `token-refund.test.ts` | Refund 072 |
| `TS-WEB-010 tier-transition-simulation` | `apps/web/src/lib/tier-transition-simulation` | 1.0.0 | `tier-transition-simulation.test.ts` | Downgrade pack |
| `TS-WEB-011 revenuecat-webhook-auth` | `apps/web/src/lib/revenuecat-webhook-auth` | 1.0.0 | `revenuecat-webhook-auth.test.ts` | Webhook secret |
| `TS-WEB-012 revenuecat-webhook-idempotency` | `apps/web/src/lib/revenuecat-webhook-idempotency` | 1.0.0 | `revenuecat-webhook-idempotency.test.ts` | Idempotencia 039 |
| `TS-WEB-013 session-thread-hydration` | `apps/web/src/lib/session-thread-hydration` | 1.0.0 | `session-thread-hydration.test.ts` | Hydration gate |
| `TS-WEB-014 manual-coin-value` | `apps/web/src/lib/manual-coin-value` | 1.0.0 | `manual-coin-value.test.ts` | H-DIV-02-01 (`AUD-DIV-02`) |

### Overlay — `TS-WEB-OVR-*`

| Código | Area | v | Historial reciente | Comando |
|--------|------|---|-------------------|---------|
| `TS-WEB-OVR-001 embed-svg-overlay-font` | `apps/web/src/lib/embed-svg-overlay-font` | **1.2.0** | 1.1 dual font · 1.2 symbols + TDZ fix | `npm run test --prefix apps/web -- embed-svg-overlay-font` |
| `TS-WEB-OVR-002 overlay-title-layout` | `apps/web/src/lib/overlay-title-layout` | 1.0.0 | Layout 1/2 líneas mutación | `npm run test --prefix apps/web -- overlay-title-layout` |
| `TS-WEB-OVR-003 sumi-fallback-glyphs` | `apps/web/src/lib/sumi-fallback-glyph-samples` | 1.0.0 | Smoke 292 PNG manifest | `npm run generate:sumi-fallback-glyphs:quick` |
| `TS-WEB-OVR-004 overlay-title-pango` | `apps/web/src/lib/overlay-title-pango` | 1.2.0 | Segmentacion mixta Zhou Yi + fontkit por chunk + render real ZH+EN | `npm run test --prefix apps/web -- overlay-title-pango` |
| `TS-WEB-OVR-005 overlay-title-pango-exhaustive` | `apps/web/src/lib/overlay-title-pango` | 1.1.0 | Grilla 64×63 × **3** traductores (12096 renders, ~6 min). ZH+EN ink | `npm run test:overlay-exhaustive --prefix apps/web` |
| `TS-WEB-OVR-006 overlay-title-pango-e2e-samples` | `apps/web/src/lib/overlay-title-pango` | 1.0.0 | 4 muestras e2e: Together FLUX + overlay prod + resvg + composite. Config `vitest.overlay-samples.config.ts`; skip sin `TOGETHER_API_KEY` | `npm run gen:overlay-e2e-samples --prefix apps/web` |

### Data / context — `TS-DATA-*`, `TS-CTX-*`

| Código | Area | v | Archivo | Auditoría |
|--------|------|---|---------|-----------|
| `TS-DATA-001 iching-data-index` | `packages/iching-data/src/index` | 1.0.0 | `index.test.ts` | `FIX-LIB-02` |
| `TS-DATA-002 commentary-schema` | `packages/iching-data/src/commentary` | 1.0.0 | `commentary.test.ts` | `POL-DAT-MAESTRO-00` |
| `TS-DATA-003 iching-data-trigrams` | `packages/iching-data/src/trigrams` | 1.0.0 | `trigrams.test.ts` | `AUD-DAT-W-02` |
| `TS-CTX-001 context-limits` | `packages/context-engine/src/context-limits` | 1.0.0 | `context-limits.test.ts` | — |

### Library — `TS-WEB-LIB-*`

| Código | Area | v | Archivo | Auditoría |
|--------|------|---|---------|-----------|
| `TS-WEB-LIB-001 library-data` | `apps/web/src/lib/library` | 1.0.0 | `library-data.test.ts` | `AUD-DAT-W-02` |

---

## Verify gates (`VF-*`) — pass/fail local

| Código | Area | v | npm script | Artefactos | Variantes |
|--------|------|---|------------|------------|-----------|
| `VF-FID-001 hexagram-fidelity-runtime` | `scripts/verify-hexagram-fidelity` | 1.0.0 | `verify:hexagram-fidelity` | `reports/hexagram-fidelity-*.json` | `:pdf-wilhelm`, `:epub-wilhelm`, `:pdf-legge`, `:epub-legge`, `:zhouyi-ctext`, `:mirrors-deprecated` |
| `VF-PINYIN-001 pinyin-gold` | `scripts/verify-pinyin-gold` | 1.0.0 | `verify:pinyin-gold` | — | — |
| `VF-WEB-OVR-001 overlay-glyphs` | `scripts/verify-overlay-glyphs` | 1.1.0 | `verify:overlay-glyphs` | — | incluye `TS-WEB-OVR-001` |
| `VF-DOC-001 docs-remediation` | `scripts/verify-docs-remediation` | 1.0.0 | `verify:docs-remediation` | — | — |
| `VF-DOC-002 qa-registry-integrity` | `scripts/verify-qa-registry` | **1.3.0** | `verify:qa-registry` | Valida registry + cabeceras + orphans | — |
| `VF-FID-W-001 wilhelm-all-gates` | `tools/verify-wilhelm-all-gates` | 1.0.0 | `verify:wilhelm-all-gates` | — | — |
| `VF-FID-L-001 legge-all-gates` | `tools/verify-legge-all-gates` | 1.0.0 | `verify:legge-all-gates` | — | — |
| `VF-DIV-001 divination-wilhelm-appendix` | `scripts/verify-divination-wilhelm-appendix` | **2.0.0** | `verify:divination-wilhelm-appendix` | — | G1-G7 exact arithmetic, `AUD-DIV-02` |
| `VF-FID-W-002 wilhelm-64hex-txt-clean` | `tools/verify-wilhelm-64hex-txt-clean` | 1.0.0 | `verify:wilhelm-64hex-txt-clean` | — | pre-parse W |
| `VF-FID-W-010 stitch-wilhelm-de-txt` | `scripts/stitch-wilhelm-de-txt.mjs` | 1.0.0 | `stitch:wilhelm-de-txt` | 20260628-AUD-DAT-W-02 | DE stitch |
| `VF-FID-W-011 parse-wilhelm-de-64hex-txt` | `scripts/parse-wilhelm-de-64hex-txt.mjs` | 1.0.0 | `parse:wilhelm-de-64hex-txt` | 20260628-AUD-DAT-W-02 | DE parse |
| `VF-FID-W-012 merge-wilhelm-de-dual-pass` | `scripts/merge-wilhelm-de-dual-pass.mjs` | 1.0.0 | `merge:wilhelm-de-dual-pass` | 20260628-AUD-DAT-W-02 | DE merge |
| `VF-FID-W-013 sync-wilhelm-de-translation-module` | `scripts/sync-wilhelm-de-translation-module.mjs` | 1.0.0 | `sync:wilhelm-de-translation-module` | 20260628-AUD-DAT-W-02 | DE sync |
| `VF-FID-W-014 wilhelm-de-all-gates` | `tools/verify-wilhelm-de-all-gates.mjs` | 1.0.0 | `verify:wilhelm-de-all-gates` | 20260628-AUD-DAT-W-02 | DE gates |
| `VF-FID-W-015 wilhelm-de-runtime-smoke` | `tools/wilhelm-de-runtime-smoke.mjs` | 1.0.0 | `node tools/wilhelm-de-runtime-smoke.mjs` | 20260628-AUD-DAT-W-02 | Post-build names + trigrams |
| `AU-FID-W-008 wilhelm-de-triangulation` | `scripts/wilhelm-de-triangulation-report.mjs` | 1.0.0 | `audit:wilhelm-de-triangulation` | 20260628-AUD-DAT-W-02 | DE triangulation |
| `AU-FID-W-009 wilhelm-de-baynes-comparison` | `scripts/wilhelm-de-baynes-comparison-report.mjs` | 1.0.0 | `audit:wilhelm-de-baynes-comparison` | 20260628-AUD-DAT-W-02 | DE vs Baynes |
| `AU-FID-W-010 export-wilhelm-de-baynes-comparison-viewer` | `scripts/export-wilhelm-de-baynes-comparison-viewer.mjs` | 1.0.0 | `export:wilhelm-de-baynes-comparison-viewer` | 20260628-AUD-DAT-W-02 | DE + MT + Baynes HTML |
| `VF-FID-W-017 wilhelm-en-de-quality-compare` | `scripts/lib/wilhelm-en-de-quality-compare.test.mjs` | 2.0.0 | `node scripts/lib/wilhelm-en-de-quality-compare.test.mjs` | 20260628-AUD-DAT-W-02 | EN↔DE heuristics |
| `VF-FID-W-018 wilhelm-de-blank-maestro` | `scripts/lib/wilhelm-de-blank-maestro.test.mjs` | 1.0.0 | `node scripts/lib/wilhelm-de-blank-maestro.test.mjs` | 20260629-PLAN-DAT-W-03 | G0 blank structure |
| `VF-FID-W-023 init-wilhelm-de-blank-maestro` | `scripts/init-wilhelm-de-blank-maestro.mjs` | 1.0.0 | `init:wilhelm-de-blank-maestro` | 20260629-PLAN-DAT-W-03 | Blank JSON generator |
| `AU-FID-W-011 export-wilhelm-de-64hex-audit-csv` | `scripts/export-wilhelm-de-64hex-audit-csv.mjs` | 1.0.0 | `export:wilhelm-de-64hex-audit-csv` | 20260629-PLAN-DAT-W-03 | Blank AU CSV |
| `VF-FID-W-019 wilhelm-de-commentary-split` | `scripts/lib/wilhelm-de-commentary-split.test.mjs` | 1.0.0 | `node scripts/lib/wilhelm-de-commentary-split.test.mjs` | 20260629-PLAN-DAT-W-03 | DE marker split |
| `VF-FID-W-020 apply-wilhelm-de-manual-gold` | `scripts/apply-wilhelm-de-manual-gold.mjs` | 1.0.0 | `apply:wilhelm-de-manual-gold` | 20260629-PLAN-DAT-W-03 | Pilot gold → blank |
| `VF-FID-W-021 wilhelm-de-field-split-g2` | `scripts/lib/validate-wilhelm-de-field-split-g2.test.mjs` | 1.0.0 | `node scripts/lib/validate-wilhelm-de-field-split-g2.test.mjs` | 20260629-PLAN-DAT-W-03 | G2 pilot split |
| `VF-FID-W-022 promote-wilhelm-de-parsed-v2` | `scripts/promote-wilhelm-de-parsed-v2.mjs` | 1.0.0 | `promote:wilhelm-de-parsed-v2` | 20260629-PLAN-DAT-W-03 | V2 promotion report |
| `VF-FID-W-024 extract-wilhelm-de-from-jpg` | `scripts/extract-wilhelm-de-from-jpg.mjs` | 1.0.0 | `extract:wilhelm-de-from-jpg` | 20260629-PLAN-DAT-W-03 | JPG map + gold TSV |
| `VF-FID-W-024 wilhelm-de-jpg-page-map` | `scripts/lib/wilhelm-de-jpg-page-map.test.mjs` | 1.0.0 | `node scripts/lib/wilhelm-de-jpg-page-map.test.mjs` | 20260629-PLAN-DAT-W-03 | JPG page resolver |
| `VF-FID-W-025 extract-wilhelm-de-from-zeno` | `scripts/extract-wilhelm-de-from-zeno.mjs` | 1.0.0 | `extract:wilhelm-de-from-zeno:all` | 20260629-PLAN-DAT-W-03 | zeno.org 64 hex + material |
| `VF-FID-W-025 wilhelm-de-zeno-parse` | `scripts/lib/wilhelm-de-zeno-parse.test.mjs` | 1.0.0 | `node scripts/lib/wilhelm-de-zeno-parse.test.mjs` | 20260629-PLAN-DAT-W-03 | zeno HTML parser |
| `VF-FID-W-026 promote-wilhelm-de-zeno-to-merged` | `scripts/promote-wilhelm-de-zeno-to-merged.mjs` | 1.0.0 | `promote:wilhelm-de-zeno-to-merged` | 20260628-AUD-DAT-W-02 | Zeno → merged maestro |
| `VF-FID-W-027 clean-wilhelm-de-zeno-dataset` | `scripts/clean-wilhelm-de-zeno-dataset.mjs` | 1.0.0 | `clean:wilhelm-de-zeno-dataset` | 20260629-PLAN-DAT-W-03 | Zeno-only reset + empty Ten Wings |
| `VF-FID-W-028 wilhelm-de-blank-comments-maestro` | `scripts/lib/wilhelm-de-blank-comments-maestro.test.mjs` | 1.0.0 | `node scripts/lib/wilhelm-de-blank-comments-maestro.test.mjs` | 20260629-PLAN-DAT-W-03 | 37-field comments blank G0 |
| `VF-FID-W-029 extract-wilhelm-de-comments-from-zeno` | `scripts/extract-wilhelm-de-comments-from-zeno.mjs` | 1.0.0 | `extract:wilhelm-de-comments-from-zeno` | 20260629-PLAN-DAT-W-03 | Drittes Buch Zeno probe |
| `VF-FID-W-030 wilhelm-de-ocr-ingest-lock` | `scripts/lib/wilhelm-de-ocr-ingest-lock.test.mjs` | 1.0.0 | `node scripts/lib/wilhelm-de-ocr-ingest-lock.test.mjs` | 20260629-PLAN-DAT-W-03 | OCR re-ingest guard |
| `VF-FID-W-031 extract-wilhelm-de-comments-from-anna` | `scripts/extract-wilhelm-de-comments-from-anna.mjs` | 1.0.0 | `extract:wilhelm-de-comments-from-anna` | 20260628-PLAN-DAT-W-05 | Anna TXT → sandbox comments |
| `VF-FID-W-032 validate-wilhelm-de-comments-anna-gate` | `scripts/validate-wilhelm-de-comments-anna-gate.mjs` | 1.0.0 | `validate:wilhelm-de-comments-anna-gate` | 20260628-PLAN-DAT-W-05 | G-anna structure + dual-pass |
| `VF-FID-W-033 wilhelm-de-64hex-comments-txt` | `scripts/lib/wilhelm-de-64hex-comments-txt.test.mjs` | 1.0.0 | `node scripts/lib/wilhelm-de-64hex-comments-txt.test.mjs` | 20260628-PLAN-DAT-W-05 | Drittes Buch parser G0 pass02/04 |
| `VF-FID-W-034 reconcile-wilhelm-de-comments-from-anna` | `scripts/lib/wilhelm-de-comments-anna-reconcile.test.mjs` | 1.0.0 | `reconcile:wilhelm-de-comments-from-anna` | 20260628-PLAN-DAT-W-05 | Anna dual-pass → reconciled sandbox |
| `VF-FID-W-035 export-wilhelm-de-comments-anna-comparison-viewer` | `scripts/export-wilhelm-de-comments-anna-comparison-viewer.mjs` | 1.0.0 | `export:wilhelm-de-comments-anna-comparison-viewer` | 20260628-PLAN-DAT-W-05 | HTML pass02/04/reconciled |
| `VF-FID-W-036 promote-wilhelm-de-comments-au-to-merged` | `scripts/promote-wilhelm-de-comments-au-to-merged.mjs` | 1.0.0 | `promote:wilhelm-de-comments-au-to-merged` | 20260628-PLAN-DAT-W-05 | AU gold → comments merged |
| `AU-FID-W-012 wilhelm-de-baynes-mt-quality` | `scripts/wilhelm-de-baynes-mt-quality-report.mjs` | 1.0.0 | `audit:wilhelm-de-baynes-mt-quality` | 20260629-PLAN-DAT-W-03 | DE→MT EN vs Baynes por campo |
| `AU-FID-W-013 audit-wilhelm-de-contamination` | `scripts/audit-wilhelm-de-contamination.mjs` | 1.0.0 | `audit:wilhelm-de-contamination` | 20260630-AUD-DAT-W-04 | Contaminación línea a línea |
| `AU-FID-W-014 export-wilhelm-de-comments-anna-au-tsv` | `scripts/export-wilhelm-de-comments-anna-au-tsv.mjs` | 1.0.0 | `export:wilhelm-de-comments-anna-au-tsv` | 20260628-PLAN-DAT-W-05 | TSV disputas Ten Wings AU |
| `AU-FID-W-015 apply-wilhelm-de-comments-au-gold` | `scripts/apply-wilhelm-de-comments-au-gold.mjs` | 1.0.0 | `apply:wilhelm-de-comments-au-gold` | 20260628-PLAN-DAT-W-05 | Pilot → gold JSON |
| `AU-FID-W-016 validate-wilhelm-de-comments-au-gold` | `scripts/validate-wilhelm-de-comments-au-gold.mjs` | 1.0.0 | `validate:wilhelm-de-comments-au-gold` | 20260628-PLAN-DAT-W-05 | Gate pre-promote |
| `AU-FID-W-020 verify-wilhelm-de-comments-au-pilot` | `scripts/verify-wilhelm-de-comments-au-pilot.mjs` | 1.0.0 | `verify:wilhelm-de-comments-au-pilot` | 20260628-PLAN-DAT-W-05 | Per-hex 37-field gate |
| `AU-FID-W-023 fill-wilhelm-de-comments-au-pilot` | `scripts/fill-wilhelm-de-comments-au-pilot.mjs` | 1.0.0 | `fill:wilhelm-de-comments-au-pilot` | 20260628-PLAN-DAT-W-05 | JPG builder → pilot TSV |
| `AU-FID-W-027 spot-check-wilhelm-de-comments-au-pilot` | `scripts/spot-check-wilhelm-de-comments-au-pilot.mjs` | 1.0.0 | `spot-check:wilhelm-de-comments-au-pilot` | 20260628-PLAN-DAT-W-05 | vs pass04 flags |
| `AU-FID-W-028 jpg-audit-wilhelm-de-comments-au-pilot` | `scripts/jpg-audit-wilhelm-de-comments-au-pilot.mjs` | 1.0.0 | `jpg-audit:wilhelm-de-comments-au-pilot` | 20260628-PLAN-DAT-W-05 | pilot vs builder |
| `AU-FID-W-029 scan-wilhelm-de-pilot-real-artifacts` | `scripts/scan-wilhelm-de-pilot-real-artifacts.mjs` | 1.0.0 | `scan:wilhelm-de-pilot-artifacts` | 20260628-PLAN-DAT-W-05 | OCR artifact scan |

---

## QA harnesses (`QA-*`) — pueden consumir tokens/API

| Código | Area | v | npm script | Salida | Notas |
|--------|------|---|------------|--------|-------|
| `QA-MUT-001 mutation-output` | `scripts/mutation-output-qa` | **2.0.0** | `qa:mutation-output` | `reports/mutation-qa-*.json` | Trazabilidad `model` por fila |
| `QA-LRS-001 line-reading-system` | `scripts/line-reading-system-qa` | 1.0.0 | `node scripts/line-reading-system-qa.mjs` | `reports/line-reading-system-qa-*.json` | Huang \| Zhu Xi × fixtures |
| `QA-RDG-001 reading-quality` | `scripts/reading-quality-qa` | 1.1.0 | `qa:reading-quality` | `reports/reading-quality-qa-*.json` | 128+ transcripts reales |
| `QA-RDG-002 master-synthesis` | `scripts/master-synthesis-qa` | 1.0.0 | `node scripts/master-synthesis-qa.mjs` | `reports/master-synthesis-qa-*.json` | Master (3) triangulation |

---

## Audit scripts dataset (`AU-*`)

| Código | Area | npm script | Familia | Auditoría |
|--------|------|------------|---------|-----------|
| `AU-FID-001 epub-verbatim-vs-runtime` | `scripts/audit-epub-verbatim-vs-runtime` | `audit:epub-verbatim` | FID | `PLAN-DAT-RT-01` |
| `AU-FID-W-001 wilhelm-txt-g2` | `tools/audit-wilhelm-txt-g2` | `audit:wilhelm-txt-g2:deterministic` | FID-W | `AUD-DAT-MAESTRO-W-01` |
| `AU-FID-L-001 legge-txt-g2` | `tools/audit-legge-txt-g2` | `audit:legge-txt-g2:deterministic` | FID-L | `AUD-DAT-MAESTRO-L-01` |
| `AU-FID-L-003 legge-pdf-vs-epub` | `scripts/audit-legge-pdf-vs-epub` | `audit:legge-pdf-vs-epub` | FID-L | `AUD-DAT-FID-03` |
| `AU-MUT-001 huang-rules-vs-pdf-gold` | `tools/audit-huang-rules-vs-pdf-gold` | `audit:huang-rules-vs-pdf-gold` | MUT | `AUD-MUT-03`, `04` |
| `AU-MUT-002 zhuxi-rules-vs-adler-gold` | `tools/audit-zhuxi-rules-vs-adler-gold` | `audit:zhuxi-rules-vs-adler-gold` | MUT | `AUD-LRS-01` |
| `AU-FID-W-002 wilhelm-book-meta` | `tools/audit-wilhelm-book-meta-fidelity` | `audit:wilhelm-book-meta` | FID-W | maestro W |
| `AU-FID-W-003 wilhelm-hex-meta` | `tools/audit-wilhelm-hex-meta-gate` | `audit:wilhelm-hex-meta` | FID-W | maestro W |
| `AU-FID-W-004 wilhelm-trigram-parma` | `tools/audit-wilhelm-trigram-parma` | `audit:wilhelm-trigram-parma` | FID-W | fidelidad W |
| `AU-FID-W-005 wilhelm-comments-txt-g2` | `tools/audit-wilhelm-comments-txt-g2` | `audit:wilhelm-comments-txt-g2:deterministic` | FID-W | comentarios W |
| `AU-FID-W-006 wilhelm-pdf-vs-parma` | `scripts/audit-wilhelm-pdf-vs-parma` | `audit:wilhelm-pdf-vs-parma` | FID-W | PDF vs Parma |
| `AU-FID-W-007 wilhelm-pdf-vs-epub` | `scripts/audit-wilhelm-pdf-vs-epub` | `audit:wilhelm-pdf-vs-epub` | FID-W | PDF vs EPUB |
| `AU-FID-L-002 legge-book-meta` | `tools/audit-legge-book-meta-fidelity` | `audit:legge-book-meta` | FID-L | maestro L |

Detalle y versiones: [`registry.json`](./registry.json).

---

## Generadores (`GEN-*`)

| Código | Area | v | npm script | Artefactos |
|--------|------|---|------------|------------|
| `GEN-WEB-OVR-001 sumi-fallback-samples` | `scripts/generate-sumi-fallback-glyph-samples` | 1.0.0 | `generate:sumi-fallback-glyphs` | `reports/sumi-fallback-glyphs/` + manifest |
| — | — | — | `generate:sumi-fallback-glyphs:quick` | variante `:quick` → vitest smoke |

---

## Seguridad e i18n

| Código | Area | npm script | Descripción |
|--------|------|------------|-------------|
| `SEC-001 security-scan` | `monorepo/root` | `security:scan` | Trivy + Semgrep → `security/` (sin cabecera en `package.json`) |
| `I18N-001 i18n-audit` | `tools/i18n-audit` | `i18n:audit` | Cobertura claves `@iching-oracle/i18n` |

---

## Control de versiones del test

Cada entrada en [`registry.json`](./registry.json) incluye:

- `version` — versión actual (semver del **criterio** del test)
- `versionHistory[]` — `{ version, date, change }`
- `variants[]` — variantes npm del mismo gate (p. ej. gold PDF vs EPUB)
- `area` — módulo bajo test (columna obligatoria en este índice)

**Regla:** bump MAJOR si cambia pass/fail; MINOR si añade casos; PATCH si solo refactor.

---

## Alta de test nuevo

1. Entrada en [`registry.json`](./registry.json) con `version: "1.0.0"` y **`area`**.
2. Fila en este índice (incluir columna **Area**).
3. Cabecera en el archivo:

   ```typescript
   /**
    * QA code: TS-WEB-OVR-003 overlay-title-layout · v1.0.0
    * Area: apps/web/src/lib/overlay-title-layout
    * Family: WEB-OVR
    */
   ```

4. `npm run inject:qa-headers` (si el archivo ya existía sin cabecera).
5. `npm run verify:qa-registry` — bloqueante.
6. `relatedAuditCodes` si cierra una auditoría.

Ver [`CONVENTIONS.md`](./CONVENTIONS.md) y [`WF-DOC-02`](../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md).
