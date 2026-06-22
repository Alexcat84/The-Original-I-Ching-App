# Validación externa + plan ajustado — Fidelidad y mutaciones (Zhu Xi 32 charts)

**Valida documentos:**  
[`FIDELITY_MUTATION_MASTER_AUDIT_2026-06-22.md`](FIDELITY_MUTATION_MASTER_AUDIT_2026-06-22.md),  
[`MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md`](MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md),  
[`ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md`](ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md),  
[`LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md`](LEGGE_SBE_XVI_OXFORD_SCAN_SPOT_CHECK_2026-06-22.md)

**Validado por:** Claude Opus 4.8 (auditor externo)  
**Fecha:** 22 jun 2026  
**Rama verificada:** `staging` (`86bddef`)  
**Método:** verificación directa contra código, datos y fuentes primarias citadas. No se aceptó ninguna afirmación sin evidencia reproducible.

**Estado de adopción en repo:** plan maestro actualizado a **v2** (Fase 0 + ajustes) — ver [`ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md`](ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md) §4.

**Origen:** validación entregada por Alexis Rivas (`VALIDACION_fidelity-mutation-master_2026-06-22.md`).

---

## Parte 1 — Verificación de cambios en código (con evidencia)

### 1.1 Wilhelm 513/513 (commit `6f19218`)

| Aspecto | Resultado |
|---------|-----------|
| Re-ingesta | Gold book-primary = PDF Pantheon 1950 vía `sync-wilhelm-oracle-from-pdf-gold.mjs`; injector `audit-wilhelm-injector-vs-datasets.mjs` **512/512 exact**; gate **513/513** |
| Motivo | Mirror Parma con gaps OCR (hex 56 judgment, 20 L5, 21, 26, 52); resueltos con el libro. Verificado contra `spotCheckPages` del manifest |
| **Verificación hex 18** | **Correcto en `staging`:** L1 padre, L2 madre. La re-ingesta **no** introdujo el swap que el gold de la auditoría previa hacía sospechar |
| Observación | `sourceUrl` del bundle sigue apuntando al mirror Parma aunque el gold real es Pantheon PDF → **T2** |

### 1.2 Legge 514/514 (pipeline `0b9c5c6`–`4409062`)

| Aspecto | Resultado |
|---------|-----------|
| Re-ingesta | Gold = scan SBE XVI Oxford OCR (fuente canónica 1882) |
| Motivo | El 77% anterior era desajuste de **edición/transcripción** (Baharna), no corrupción. Re-ingesta contra gold canónico → 100%. Confirma predicción validación 2026-06-21 |
| Pendiente | `licenseNote` desactualizado → **G4 / T2** (cosmético) |

### 1.3 Zhou Yi 514/514 (sin cambio en esta rama)

| Aspecto | Resultado |
|---------|-----------|
| Corrupción | Resuelta en rama anterior, ya en `main` |
| **Hallazgo nuevo (display, no contenido)** | Dataset: **2.574 comas half-width `,` (U+002C), 0 full-width `，`**; puntos full-width `。`. Gate pasa porque `hexagram-fidelity-normalize.mjs` L65 normaliza `,` → `，` antes de comparar: **514/514 mide contenido, no display** |
| Asimetría del gate | Wilhelm/Legge: comparación exacta; Zhou Yi: normalizado. El 513/513 exact es más fuerte que 514/514 normalizado → **T1** |

---

## Parte 2 — Observaciones sobre el plan de 32 charts

### Observación 1 — G1 probablemente ya EXACTA (de-riesgo)

Prueba combinatoria: los primeros 10 de los 20 tríos de posiciones, en **orden lexicográfico ascendente**, son exactamente los que contienen la línea 1; los últimos 10, los que no.

```
first 10: (1,2,3)(1,2,4)(1,2,5)(1,2,6)(1,3,4)(1,3,5)(1,3,6)(1,4,5)(1,4,6)(1,5,6)  → todos contienen 1
latter 10: (2,3,4)(2,3,5)(2,3,6)(2,4,5)(2,4,6)(2,5,6)(3,4,5)(3,4,6)(3,5,6)(4,5,6)  → ninguno contiene 1
```

Motor: `sorted.includes(1)` en `packages/iching-engine/src/rules/zhuxi.ts` L82–93.

**Conclusión auditor:** si Adler enumera los 20 casos en ese orden, G1 es **no-op** de verificación, no cambio de comportamiento. **Riesgo real: G2.**

### Observación 2 — Tensión reglas 4/5 vs Fig. 19 (crítica)

La matriz maestra marca reglas 4 y 5 como **exact** (líneas del transformado), pero G2/Fig. 19 indica que para ciertos charts las líneas vienen del **original**.

Hay que declarar con cita de folio si Fig. 19 **sobrescribe** reglas 4/5:

| Hipótesis | Implicación |
|-----------|-------------|
| Sobrescribe | `ZX_FOUR_LOWER` / `ZX_FIVE_ONLY` actuales pueden servir líneas del hexagrama **equivocado** → **bug latente en producción hoy** (solo Zhu Xi, casos chart-specific) |
| Eje separado | Comportamiento actual = default correcto; charts añaden excepciones |

**Gate D0.2 obligatorio antes de motor.**

### Observaciones de detalle

| # | Tema | Acción adoptada |
|---|------|-----------------|
| 3 | **H2** no estaba en Fase C del plan original | Re-validar H2 (turning pattern vs Líneas en movimiento) — audit 2026-06-20 opción (b) |
| 4 | Validador solo mencionaba líneas desde transformado | H1/H3 deben aceptar líneas estables del **primario y** transformado |
| 5 | Gen→Sui solo smoke manual | Fixture automatizado en `zhuxi-charts.test.ts` (Fase B) |
| 6 | Criterio «4096 estados» | Testear inputs de chart **distintos** desde gold, no 4096 literales |

---

## Parte 3 — Plan ajustado v2 (adoptado en repo)

**Cambio estructural:** **Fase 0** gate duro de decisión de fuente **antes** de código de motor.

### Fase 0 — Decisiones de fuente (gate duro, cero código motor)

Resolver desde PDF Adler (Fig. 19, p.154, p.158) con **cita literal + captura de folio**:

| ID | Pregunta | Outcome |
|----|----------|---------|
| **D0.1** | ¿Adler enumera los 20 casos de 3 líneas en orden ascendente por posición? | Sí → `includes(1)` exacto, G1 no-op. No → tabla explícita 20 casos |
| **D0.2** | ¿Fig. 19 sobrescribe reglas 4/5 (fuente original vs transformado)? | Determina bug latente vs excepciones chart |

**Gate 0 (bloqueante):** ambas respuestas citadas + spot-check ≥10 charts manual. Sin Gate 0 → no Fase A.

### Fases A–E

Ver detalle completo en [`ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md`](ZHUXI_32_CHARTS_IMPLEMENTATION_PLAN_2026-06-22.md) §4 (v2).

Resumen:

- **A:** Gold Fig. 19 + campo JSON `equivalentToIncludesPos1: true|false`
- **B:** Motor flag-gated; Gen→Sui automatizado; n=3 no-op si D0.1 confirma
- **C:** H1/H3 ambas fuentes + **H2** re-validado
- **D:** API + Axiom; no recalcular históricos
- **E:** Cutover staging → main

### Tareas paralelas (bajo riesgo, independientes)

| ID | Tarea | Recomendación auditor |
|----|-------|----------------------|
| **T1** | Coma Zhou Yi half vs full-width | Normalizar almacenamiento a `，` o documentar; re-gate + check display biblioteca |
| **T2** | Metadata procedencia W/L | Actualizar `sourceUrl` Wilhelm (Pantheon), `licenseNote` Legge |

---

## Parte 4 — Riesgos y mitigaciones (tabla auditor)

| Riesgo | Mitigación |
|--------|------------|
| Implementar contra regla no confirmada | Fase 0 gate duro |
| Bug latente 4/5 | D0.2 explícito |
| Reconstruir G1 sin cambio real | D0.1: no-op + cita si equivalente |
| Regresión consultas históricas | No recalcular; flag + rollback |
| Choque H2 | Re-validación Fase C |
| Gate ciego a display ZY | T1 |
| Claim marketing | T2 |
| Gen→Sui roto en silencio | Fixture Fase B |

---

## Parte 5 — Rollback

1. `ZHUXI_CLASSICAL_CHARTS=0` en Vercel → redeploy (<5 min)
2. Motor = reglas operativas actuales
3. Históricos intactos en `consultation_content`

---

## Parte 6 — Respuesta del equipo (Cursor / implementación)

Ver sección «Acuerdo y pre-implementación» en [`FIDELITY_MUTATION_MASTER_AUDIT_2026-06-22.md`](FIDELITY_MUTATION_MASTER_AUDIT_2026-06-22.md) §Parte F (añadida 22 jun 2026 post-validación Opus 4.8).

---

*Documento archivado en repo para auditoría interna. No publicar en `/audits` (usuarios).*
