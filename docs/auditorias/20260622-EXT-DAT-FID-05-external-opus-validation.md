# Validación + plan ajustado: Fidelidad de datos y reglas de mutación (Zhu Xi 32 charts)

**Código:** `20260622-EXT-DAT-FID-05 external-opus-validation` · **Familia:** DAT-FID · **Estado:** reference

**Valida documentos:**  
[`20260622-AUD-DAT-FID-04-fidelity-mutation-master.md`](20260622-AUD-DAT-FID-04-fidelity-mutation-master.md),  
[`20260622-AUD-MUT-04-mutation-rules-pdf-gold.md`](20260622-AUD-MUT-04-mutation-rules-pdf-gold.md),  
[`20260622-PLAN-LRS-02-zhuxi-32-charts-plan.md`](20260622-PLAN-LRS-02-zhuxi-32-charts-plan.md),  
[`20260622-AUD-DAT-FID-02-legge-oxford-spot-check.md`](20260622-AUD-DAT-FID-02-legge-oxford-spot-check.md)

**Validado por:** Claude Opus 4.8 (auditor externo)  
**Fecha:** 22 jun 2026  
**Rama verificada:** `staging` (`fe1f184`)  
**Versión:** v2.1 (greenfield)  
**Método:** verificación directa contra código, datos y fuentes primarias citadas. No se aceptó ninguna afirmación sin evidencia reproducible.

**Origen:** validación entregada por Alexis Rivas (`VALIDACION_fidelity-mutation-master_2026-06-22 (1).md`).

> **DECISIÓN DE PRODUCTO (Alexis, 22 jun 2026): GREENFIELD.** Aún no hay usuarios reales ni consultas históricas. No se corrige nada en retrospectiva: el comportamiento Zhu Xi actual es un **default pre-lanzamiento**, no producción a preservar. Cualquier cambio que salga de Gate 0 se implementa **forward-only**, fijando el comportamiento canónico desde el día 1. Esto **resuelve el sign-off de producto de D0.2** (no hay remediación) y **neutraliza** los riesgos de regresión/paridad de consultas históricas. NO altera el requisito técnico: Gate 0 (lecturas D0.1/D0.2 con cita de folio) sigue siendo prerequisito porque ESAS lecturas son la especificación del motor.

---

## Parte 1: Verificación de los cambios en código (con evidencia)

### 1.1 Wilhelm 513/513 (commit `6f19218`)

| Aspecto | Resultado |
|---------|-----------|
| Re-ingesta | Gold book-primary = PDF Pantheon 1950 vía `sync-wilhelm-oracle-from-pdf-gold.mjs`; injector `audit-wilhelm-injector-vs-datasets.mjs` 512/512 exact; gate 513/513 |
| Motivo | Mirror de Parma con gaps OCR (hex 56 judgment, 20 L5, 21, 26, 52); resueltos con el libro. Verificado contra `spotCheckPages` del manifest |
| **Verificación hex 18** | **Correcto en `staging`:** L1 padre, L2 madre. La re-ingesta NO introdujo el swap que el gold de la auditoría previa hacía sospechar |
| Observación | `sourceUrl` del bundle sigue apuntando al mirror de Parma, aunque el gold real es el PDF Pantheon. Actualizar metadata (ver T2) |

### 1.2 Legge 514/514 (pipeline `0b9c5c6`..`4409062`)

| Aspecto | Resultado |
|---------|-----------|
| Re-ingesta | Gold = scan SBE XVI Oxford OCR (fuente canónica 1882) |
| Motivo | El 77% anterior era desajuste de **edición/transcripción** (Baharna), no corrupción. Re-ingesta contra gold canónico cerró a 100%. Confirma predicción validación 2026-06-21 |
| Pendiente | `licenseNote` desactualizado (G4, cosmético) |

### 1.3 Zhou Yi 514/514 (sin cambio en esta rama)

| Aspecto | Resultado |
|---------|-----------|
| Corrupción | Resuelta en rama anterior, ya en `main` |
| **Hallazgo nuevo (display, no contenido)** | Dataset: **2.574 comas half-width `,` (U+002C), 0 full-width `，`**; puntos full-width `。`. Gate pasa porque `hexagram-fidelity-normalize.mjs` L65 normaliza `,` → `，` antes de comparar: **514/514 mide contenido, no display** |
| Asimetría del gate | Wilhelm/Legge: comparación exacta; Zhou Yi: normalizado. El 513/513 exact es más fuerte que 514/514 normalizado → **T1** |

---

## Parte 2: Observaciones sobre el plan de 32 charts

### Observación 1 (de-riesgo de G1): la regla actual de 3 líneas probablemente ya es EXACTA

Prueba combinatoria: los primeros 10 de los 20 casos de 3 líneas, en **orden lexicográfico ascendente por posición**, son exactamente los que contienen la línea 1; los últimos 10, los que no.

```
first 10: (1,2,3)(1,2,4)(1,2,5)(1,2,6)(1,3,4)(1,3,5)(1,3,6)(1,4,5)(1,4,6)(1,5,6)  → todos contienen 1
latter 10: (2,3,4)(2,3,5)(2,3,6)(2,4,5)(2,4,6)(2,5,6)(3,4,5)(3,4,6)(3,5,6)(4,5,6)  → ninguno contiene 1
```

Motor: `sorted.includes(1)` en `packages/iching-engine/src/rules/zhuxi.ts` L82-93.

**Conclusión auditor:** si Adler enumera los 20 casos en ese orden, G1 es **no-op** de verificación, no cambio de comportamiento. **Riesgo real: G2.**

### Observación 2: tensión reglas 4/5 vs Fig. 19 (crítica)

La matriz maestra marca reglas 4 y 5 como **exact** (líneas del transformado), pero G2/Fig. 19 indica que para ciertos charts las líneas vienen del **original**.

Hay que declarar con cita de folio si Fig. 19 **sobrescribe** reglas 4/5:

| Hipótesis | Implicación |
|-----------|-------------|
| Sobrescribe | `ZX_FOUR_LOWER` / `ZX_FIVE_ONLY` actuales pueden leer del hexagrama equivocado para algunos charts |
| Eje separado | Comportamiento actual = default correcto; charts añaden excepciones |

**Gate D0.2 (lectura técnica) obligatorio antes de motor.** Sign-off de producto: resuelto (greenfield, forward-only).

### Observaciones de detalle

| # | Tema | Acción adoptada |
|---|------|-----------------|
| 3 | **H2** no estaba en Fase C | Re-validar H2 (turning pattern vs Líneas en movimiento), audit 2026-06-20 opción (b) |
| 4 | Validador solo mencionaba transformado | H1/H3 deben aceptar líneas estables del primario y del transformado |
| 5 | Gen→Sui solo smoke manual | Fixture automatizado en `zhuxi-charts.test.ts` (Fase B) |
| 6 | Criterio «4096 estados» | Testear inputs de chart distintos desde gold, no 4096 literales |

---

## Parte 3: Plan ajustado v2.1 (adoptado en repo)

**Cambio estructural:** **Fase 0** gate duro de decisión de fuente **antes** de código de motor.

### Fase 0: Decisiones de fuente (gate duro, cero código motor)

Resolver desde PDF Adler (Fig. 19, p.154, p.158) con **cita literal + captura de folio**:

| ID | Pregunta | Outcome |
|----|----------|---------|
| **D0.1** | ¿Adler enumera los 20 casos de 3 líneas en orden ascendente por posición? | Sí → `includes(1)` exacto, G1 no-op. No → tabla explícita 20 casos |
| **D0.2** | ¿Fig. 19 sobrescribe reglas 4/5 (original vs transformado)? | Dictamen técnico (spec del motor). Producto: **forward-only** (greenfield) |

**Gate 0 (bloqueante):** D0.1 + D0.2 citadas por folio + spot-check ≥10 charts manual. Sin Gate 0 no se pasa a Fase A. Sign-off de producto D0.2: **dado** (greenfield).

### Fases A a E

Detalle en [`20260622-PLAN-LRS-02-zhuxi-32-charts-plan.md`](20260622-PLAN-LRS-02-zhuxi-32-charts-plan.md) §4 (v2.1).

Resumen:

- **A:** Gold Fig. 19 + campo JSON `equivalentToIncludesPos1: true|false`
- **B:** Motor flag scaffold; Gen→Sui automatizado; n=3 no-op si D0.1 confirma
- **C:** H1/H3 ambas fuentes + **H2** re-validado
- **D:** API + Axiom; flag = andamio de desarrollo, no A/B de paridad
- **E:** Cutover con **default ON** al lanzar (greenfield)

### Tareas paralelas (bajo riesgo, independientes, ejecutables ya)

| ID | Tarea | Recomendación auditor |
|----|-------|----------------------|
| **T1** | Coma Zhou Yi half vs full-width | Normalizar almacenamiento a `，` + re-gate + check display biblioteca |
| **T2** | Metadata procedencia W/L | Actualizar `sourceUrl` Wilhelm (Pantheon), `licenseNote` Legge |

---

## Parte 4: Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Implementar contra regla no confirmada | Fase 0 gate duro |
| Bug latente 4/5 (lectura técnica) | D0.2 antes de Fase B; greenfield → forward-only sin remediación |
| Reconstruir G1 sin cambio real | D0.1: no-op + cita si equivalente |
| ~~Regresión en consultas históricas~~ | **Neutralizado (greenfield):** no hay consultas de usuarios |
| ~~Paridad al re-hidratar hilos~~ | **Neutralizado (greenfield):** no hay hilos persistidos de usuarios |
| Choque H2 | Re-validación Fase C |
| Gate ciego a display ZY | T1 |
| Claim marketing | T2 |
| Gen→Sui roto en silencio | Fixture Fase B |

---

## Parte 5: Rollback

1. `ZHUXI_CLASSICAL_CHARTS=0` en Vercel → redeploy (<5 min).
2. Motor vuelve a reglas operativas pre-chart (andamio OFF).
3. Greenfield: no hay históricos de usuarios que preservar.

---

## Parte 6: Para el ejecutor (luz verde y orden)

**Luz verde documental:** SÍ (v2.1 greenfield).  
**Luz verde de implementación de motor:** pendiente **Gate 0 técnico** (D0.1/D0.2 con citas de folio).  
**Gate 0 (22 jun 2026): PENDIENTE.** Decisión Alexis: no iniciar aún. T1/T2 cerrados en staging `9f2a170`.  
**Sign-off de producto D0.2:** dado (forward-only).

**Zhou Yi (paralelo, no bloquea Gate 0):** gold operativo = ctext.org, no PDF 注疏 local. Ver [`20260622-AUD-DAT-FID-04-fidelity-mutation-master.md`](20260622-AUD-DAT-FID-04-fidelity-mutation-master.md) §Parte H.

**Puede ejecutar YA (no depende de Gate 0):**

1. **T2:** `sourceUrl`/`edition` Wilhelm → Pantheon PDF; `licenseNote` Legge (G4).
2. **T1:** decidir coma Zhou Yi (normalizar a `，` recomendado) + verificar display biblioteca + re-gate 514/514.

**Siguiente paso bloqueante (Gate 0, sin código de motor):** **PENDIENTE** (no iniciar hasta nueva decisión).

3. **D0.1:** Adler p.154 + Fig. 19: orden lexicográfico de los 20 tríos → `equivalentToIncludesPos1: true|false`.
4. **D0.2:** p.158 + reglas 4/5 p.156: ¿Fig. 19 cambia `fromHexagram` en 4/5? → dictamen técnico escrito.
5. **Spot-check ≥10 celdas** Fig. 19 (PDF 159-204) vs transcripción manual.

**Tras Gate 0:** Fase A (gold) → Fase B (motor, flag scaffold) → Fase C (prompt + H2 + validador ambas fuentes) → Fase D (telemetría) → Fase E (**default ON** al lanzar). Gen→Sui como fixture automatizado en Fase B.

**Regla operativa:** no se escribe la primera línea del motor de charts hasta cerrar Gate 0 con citas de folio. Flag OFF = comportamiento idéntico al actual (90 tests verdes). Si D0.1 confirma equivalencia, G1 es verificación documental, no refactor.

---

## Parte 7: Respuesta del equipo (Cursor)

Ver [`20260622-AUD-DAT-FID-04-fidelity-mutation-master.md`](20260622-AUD-DAT-FID-04-fidelity-mutation-master.md) §Parte F (v2.1 greenfield).

---

*Documento archivado en repo para auditoría interna. No publicar en `/audits` (usuarios).*
