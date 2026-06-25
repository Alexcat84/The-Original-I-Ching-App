# Índice maestro — tests y gates QA

**Registro canónico:** [`registry.json`](./registry.json) · **Convenciones:** [`CONVENTIONS.md`](./CONVENTIONS.md)  
**Reglas obligatorias:** [`../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md`](../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md)  
**Auditorías enlazadas:** [`docs/auditorias/INDEX.md`](../auditorias/INDEX.md)

Alta de test nuevo: **`registry.json` + `INDEX.md` + cabecera con `QA code`, `Area`, `Family`** — no negociable. Ver `area` en registro para cada entry.

---

## Ejecución global

```bash
npm test                          # Vitest en todo el monorepo (turbo)
npm run verify:hexagram-fidelity  # Gate runtime W+L
npm run verify:overlay-glyphs     # Gate overlay PNG
npm run qa:mutation-output        # Matriz mutación (⚠ consume API)
npm run qa:reading-quality        # Lecturas reales (⚠ consume API)
```

---

## Vitest unitarios (`TS-*`)

### Engine — `TS-ENG-*`

| Código | v | Archivo | Comando | Auditoría |
|--------|---|---------|---------|-----------|
| `TS-ENG-001 engine-core` | 1.0.0 | `packages/iching-engine/src/engine.test.ts` | `npm run test --prefix packages/iching-engine` | `AUD-DIV-01` |
| `TS-ENG-002 mutation-rules` | 1.1.0 | `engine.mutation-rules.test.ts` | idem | `AUD-MUT-01`, `AUD-MUT-02` |
| `TS-ENG-003 line-reading-systems` | 1.0.0 | `engine.line-reading-systems.test.ts` | idem | `AUD-LRS-01` |

### Claude / interpretación — `TS-CLAUDE-*`

| Código | v | Archivo | Descripción | Auditoría |
|--------|---|---------|-------------|-----------|
| `TS-CLAUDE-001 line-gate` | 1.0.0 | `interpretation-line-gate.test.ts` | Gates H1/H3/H5 bloqueantes | `AUD-MUT-02` |
| `TS-CLAUDE-002 output-validator` | 1.0.0 | `interpretation-output-validator.test.ts` | Validación salida LLM | `AUD-MUT-02` |
| `TS-CLAUDE-003 interpretation-v2` | 1.0.0 | `interpretation.v2.test.ts` | Payload Anthropic v2 | `AUD-MUT-02` |
| `TS-CLAUDE-004 judgment-image-gate` | 1.0.0 | `interpretation-judgment-image-gate.test.ts` | Gate H7 warn-only | `AUD-RDG-QA-02` |

### Web app — `TS-WEB-*`

| Código | v | Archivo | Dominio |
|--------|---|---------|---------|
| `TS-WEB-001 detect-input-language` | 1.1.0 | `detect-input-language.test.ts` | Idioma pregunta |
| `TS-WEB-002 manual-iching-consult` | 1.0.0 | `manual-iching-consult.test.ts` | Yarrow wizard |
| `TS-WEB-003 response-clean` | 1.0.0 | `response-clean.test.ts` | Limpieza SSE |
| `TS-WEB-004 chat-session-selection` | 1.0.0 | `chat-session-selection.test.ts` | Selección sidebar |
| `TS-WEB-005 db-idempotency` | 1.0.0 | `db-idempotency.test.ts` | Persist retry |
| `TS-WEB-006 post-auth-legal` | 1.0.0 | `post-auth-legal.test.ts` | Legal post-OAuth |
| `TS-WEB-007 legal-consent-pending-meta` | 1.0.0 | `legal-consent-pending-meta.test.ts` | Re-aceptación |
| `TS-WEB-008 token-packs` | 1.0.0 | `token-packs.test.ts` | Packs / tiers |
| `TS-WEB-009 token-refund` | 1.0.0 | `token-refund.test.ts` | Refund 072 |
| `TS-WEB-010 tier-transition-simulation` | 1.0.0 | `tier-transition-simulation.test.ts` | Downgrade pack |
| `TS-WEB-011 revenuecat-webhook-auth` | 1.0.0 | `revenuecat-webhook-auth.test.ts` | Webhook secret |
| `TS-WEB-012 revenuecat-webhook-idempotency` | 1.0.0 | `revenuecat-webhook-idempotency.test.ts` | Idempotencia 039 |
| `TS-WEB-013 session-thread-hydration` | 1.0.0 | `session-thread-hydration.test.ts` | Hydration gate |

### Overlay — `TS-WEB-OVR-*`

| Código | v | Historial reciente | Comando |
|--------|---|-------------------|---------|
| `TS-WEB-OVR-001 embed-svg-overlay-font` | **1.2.0** | 1.1 dual font · 1.2 symbols + TDZ fix | `npm run test --prefix apps/web -- embed-svg-overlay-font` |
| `TS-WEB-OVR-002 overlay-title-layout` | 1.0.0 | Layout 1/2 líneas mutación | `npm run test --prefix apps/web -- overlay-title-layout` |
| `TS-WEB-OVR-003 sumi-fallback-glyphs` | 1.0.0 | Smoke 292 PNG manifest | `npm run generate:sumi-fallback-glyphs:quick` |

### Data / context — `TS-DATA-*`, `TS-CTX-*`

| Código | v | Archivo | Auditoría |
|--------|---|---------|-----------|
| `TS-DATA-001 iching-data-index` | 1.0.0 | `packages/iching-data/src/index.test.ts` | `FIX-LIB-02` |
| `TS-DATA-002 commentary-schema` | 1.0.0 | `commentary.test.ts` | `POL-DAT-MAESTRO-00` |
| `TS-CTX-001 context-limits` | 1.0.0 | `packages/context-engine/src/context-limits.test.ts` | — |

---

## Verify gates (`VF-*`) — pass/fail local

| Código | v | npm script | Artefactos | Variantes |
|--------|---|------------|------------|-----------|
| `VF-FID-001 hexagram-fidelity-runtime` | 1.0.0 | `verify:hexagram-fidelity` | `reports/hexagram-fidelity-*.json` | `:pdf-wilhelm`, `:epub-wilhelm`, `:pdf-legge`, `:epub-legge`, `:zhouyi-ctext`, `:mirrors-deprecated` |
| `VF-PINYIN-001 pinyin-gold` | 1.0.0 | `verify:pinyin-gold` | — | — |
| `VF-WEB-OVR-001 overlay-glyphs` | 1.1.0 | `verify:overlay-glyphs` | — | incluye `TS-WEB-OVR-001` |
| `VF-DOC-001 docs-remediation` | 1.0.0 | `verify:docs-remediation` | — | — |
| `VF-DOC-002 qa-registry-integrity` | 1.0.0 | `verify:qa-registry` | Valida registry.json | — |
| `VF-FID-W-001 wilhelm-all-gates` | 1.0.0 | `verify:wilhelm-all-gates` | — | — |
| `VF-FID-L-001 legge-all-gates` | 1.0.0 | `verify:legge-all-gates` | — | — |

---

## QA harnesses (`QA-*`) — pueden consumir tokens/API

| Código | v | npm script | Salida | Notas |
|--------|---|------------|--------|-------|
| `QA-MUT-001 mutation-output` | **2.0.0** | `qa:mutation-output` | `reports/mutation-qa-*.json` | Trazabilidad `model` por fila |
| `QA-RDG-001 reading-quality` | 1.1.0 | `qa:reading-quality` | `reports/reading-quality-qa-*.json` | 128+ transcripts reales |

---

## Audit scripts dataset (`AU-*`)

| Código | npm script | Familia | Auditoría |
|--------|------------|---------|-----------|
| `AU-FID-001 epub-verbatim-vs-runtime` | `audit:epub-verbatim` | FID | `PLAN-DAT-RT-01` |
| `AU-FID-W-001 wilhelm-txt-g2` | `audit:wilhelm-txt-g2:deterministic` | FID-W | `AUD-DAT-MAESTRO-W-01` |
| `AU-FID-L-001 legge-txt-g2` | `audit:legge-txt-g2:deterministic` | FID-L | `AUD-DAT-MAESTRO-L-01` |
| `AU-FID-L-003 legge-pdf-vs-epub` | `audit:legge-pdf-vs-epub` | FID-L | `AUD-DAT-FID-03` |
| `AU-MUT-001 huang-rules-vs-pdf-gold` | `audit:huang-rules-vs-pdf-gold` | MUT | `AUD-MUT-03`, `04` |
| `AU-MUT-002 zhuxi-rules-vs-adler-gold` | `audit:zhuxi-rules-vs-adler-gold` | MUT | `AUD-LRS-01` |
| `AU-FID-W-002 wilhelm-book-meta` | `audit:wilhelm-book-meta` | FID-W | maestro W |
| `AU-FID-W-003 wilhelm-hex-meta` | `audit:wilhelm-hex-meta` | FID-W | maestro W |
| `AU-FID-W-004 wilhelm-trigram-parma` | `audit:wilhelm-trigram-parma` | FID-W | fidelidad W |
| `AU-FID-W-005 wilhelm-comments-txt-g2` | `audit:wilhelm-comments-txt-g2:deterministic` | FID-W | comentarios W |
| `AU-FID-W-006 wilhelm-pdf-vs-parma` | `audit:wilhelm-pdf-vs-parma` | FID-W | PDF vs Parma |
| `AU-FID-W-007 wilhelm-pdf-vs-epub` | `audit:wilhelm-pdf-vs-epub` | FID-W | PDF vs EPUB |
| `AU-FID-L-002 legge-book-meta` | `audit:legge-book-meta` | FID-L | maestro L |
| `VF-FID-W-002 wilhelm-64hex-txt-clean` | `verify:wilhelm-64hex-txt-clean` | FID-W | pre-parse W |

Detalle y versiones: [`registry.json`](./registry.json).

---

## Generadores (`GEN-*`)

| Código | v | npm script | Artefactos |
|--------|---|------------|------------|
| `GEN-WEB-OVR-001 sumi-fallback-samples` | 1.0.0 | `generate:sumi-fallback-glyphs` | `reports/sumi-fallback-glyphs/` + manifest |
| — | — | `generate:sumi-fallback-glyphs:quick` | variante `:quick` → vitest smoke |

---

## Seguridad e i18n

| Código | npm script | Descripción |
|--------|------------|-------------|
| `SEC-001 security-scan` | `security:scan` | Trivy + Semgrep → `security/` |
| `I18N-001 i18n-audit` | `i18n:audit` | Cobertura claves `@iching-oracle/i18n` |

---

## Control de versiones del test

Cada entrada en [`registry.json`](./registry.json) incluye:

- `version` — versión actual (semver del **criterio** del test)
- `versionHistory[]` — `{ version, date, change }`
- `variants[]` — variantes npm del mismo gate (p. ej. gold PDF vs EPUB)

**Regla:** bump MAJOR si cambia pass/fail; MINOR si añade casos; PATCH si solo refactor.

---

## Alta de test nuevo

1. Entrada en [`registry.json`](./registry.json) con `version: "1.0.0"`.
2. Fila en este índice.
3. Comentario en el archivo: `/** QA code: TS-… · v1.0.0 */`
4. `relatedAuditCodes` si cierra una auditoría.

Ver [`CONVENTIONS.md`](./CONVENTIONS.md).
