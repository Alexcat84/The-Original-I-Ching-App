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
| `TS-WEB-OVR-004 overlay-title-pango` | `apps/web/src/lib/overlay-title-pango` | 1.1.0 | Cobertura fontkit vía `resolveOverlayTitleFontPaths` + gate `registerFromPath` + render real con ink ZH+EN (8064 pares en companion OVR-005). Corre por defecto | `npm run test --prefix apps/web -- overlay-title-pango` |
| `TS-WEB-OVR-005 overlay-title-pango-exhaustive` | `apps/web/src/lib/overlay-title-pango` | 1.0.0 | Grilla completa 64×63 × 2 traductores (8064 renders, ~5 min). Config vitest separada, **no** en `npm test` — paso explícito en `ci.yml`, nunca detrás de env-var opcional | `npm run test:overlay-exhaustive --prefix apps/web` |
| `TS-WEB-OVR-006 overlay-title-pango-e2e-samples` | `apps/web/src/lib/overlay-title-pango` | 1.0.0 | 4 muestras e2e: Together FLUX + overlay prod + resvg + composite. Config `vitest.overlay-samples.config.ts`; skip sin `TOGETHER_API_KEY` | `npm run gen:overlay-e2e-samples --prefix apps/web` |

### Data / context — `TS-DATA-*`, `TS-CTX-*`

| Código | Area | v | Archivo | Auditoría |
|--------|------|---|---------|-----------|
| `TS-DATA-001 iching-data-index` | `packages/iching-data/src/index` | 1.0.0 | `index.test.ts` | `FIX-LIB-02` |
| `TS-DATA-002 commentary-schema` | `packages/iching-data/src/commentary` | 1.0.0 | `commentary.test.ts` | `POL-DAT-MAESTRO-00` |
| `TS-CTX-001 context-limits` | `packages/context-engine/src/context-limits` | 1.0.0 | `context-limits.test.ts` | — |

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
