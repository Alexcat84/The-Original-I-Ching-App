# Huesos de Oráculo vs Keightley (book-primary PDF)
**Código:** `20260625-AUD-DIV-03 oracle-bones-keightley` · **Familia:** DIV · **Estado:** closed (decisión de negocio 2026-06-25)

**Fecha apertura:** 2026-06-25 · **Fecha cierre:** 2026-06-25  
**Auditoría anterior:** [`00000000-AUD-DIV-01 divination-methods`](./00000000-AUD-DIV-01-divination-methods.md) §5 (cerrada 2026-05-19; cita académica, sin gold parseado)  
**Canal público `/audits`:** fuera de alcance, **permanente, por diseño** (no por pendiente) — ver §6 cierre  
**Referencia procedimental (contexto libro):** [`20260625-BRIEF-DIV-04-keightley-procedural-reference.md`](./20260625-BRIEF-DIV-04-keightley-procedural-reference.md) — Ping-pien 8 (fig. 8) + Ping-pien 12–21 (§3.7)  
**Matriz de respaldo producto (síntesis):** [`20260625-AUD-DIV-04-oracle-bones-product-support.md`](./20260625-AUD-DIV-04-oracle-bones-product-support.md)

**Decisión de negocio (cierre definitivo):** el método Huesos de Oráculo es una **homenaje simbólico** a una tradición milenaria, no una reconstrucción literal — declarado así explícitamente en el copy público (`FAQ` + `/notes`, §4.J). Como el producto **no afirma** fidelidad 1:1 a Keightley, **no existe un patrón contra el cual auditar** book-primary la mecánica (4 veredictos, pesos, T/X/Y): no hay nada que verificar porque no hay claim de equivalencia que sostener o refutar. Por eso esta AU se cierra sin Fase 2 (sin harness `VF-DIV-002`, sin entrada en `/audits`) — no por falta de tiempo, sino porque, tras la corrección del copy, la pregunta que la Fase 2 intentaba responder dejó de aplicar.

---

## 1. Objetivo

Contrastar el **método Huesos de Oráculo** de la app (motor, copy FAQ, topología de imagen) contra el gold book-primary:

**Keightley, D. N. (1978/1985).** *Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China*. University of California Press. ISBN **978-0-520-05455-4**.

Esta AU **no remedia** hasta cerrar alcance con hallazgos reproducibles (misma política que DIV-02).

---

## 2. Gold ingestado (Fase 1)

| Campo | Valor |
|-------|-------|
| PDF local | `tools/source-pdfs/Sources of Shang History_ The Oracle-Bone Inscriptions of.pdf` (gitignored) |
| Manifest | `tools/source-pdfs/manifest.json` → clave `keightley` |
| Dataset derivado | `tools/datasets/keightley/procedural/keightley-procedural-gold.json` |
| Extractor | `tools/extract-keightley-procedural-gold.mjs` |
| Comando | `npm run extract:gold:keightley-procedural` |
| `runtimeIngest` | **false** (solo auditoría; no bundles producción) |

### 2.1 Secciones extraídas (PDF index)

| ID gold | Sección libro | PDF pp. | Uso AU |
|---------|---------------|---------|--------|
| `2.5-divination-sets` | §2.5 Divination Sets | 54–55 | Contexto multi-grieta; no pesos 29.41% |
| `2.6-crack-notations` | §2.6 Crack Notations | 56–57 | Notación vs prognosticación; inauspiciosas no grabadas |
| `2.7-prognostication` | §2.7 The Prognostication | 57–58 | Rey prognostica; casos inauspiciosos en texto formal |
| `4.3.1.11-crack-notation-taxonomy` | §4.3.1.11 Crack Notations | 136–137 | Taxonomía shang-chi / hsiao-chi / chi / pu tsai ming |

Casos de estudio detallados (transcripciones + flujo): ver **BRIEF-DIV-04** §5–§6.

---

## 3. Alcance por bloque (heredado de DIV-02 §13.4)

| Bloque | Pregunta | Implementación |
|--------|----------|----------------|
| **G** | ¿4 veredictos del motor = clases Keightley? | `packages/oracle-bones-engine/src/engine.ts` |
| **H** | ¿Pesos 29.41/23.53… derivados del libro? | `WEIGHTS` en mismo archivo |
| **I** | ¿Patrones A–D de imagen tienen ancla arqueológica? | `packages/image-engine/src/oracle-bones-prompt.ts` |
| **J** | ¿Copy FAQ/guía sobreafirma fidelidad Shang? | `packages/i18n/.../faq-page-ui.ts` `oracle-bones-method` |

**Out of scope Fase 1:** interpretación IA (`backend/claude/src/oracle-bones-interpretation.ts`), ritual UI, publicación `/audits`.

---

## 4. Hallazgos preliminares (Fase 1 — sin remediación)

### 4.G — Taxonomía de veredictos · **MIXTO**

| Hallazgo | Evidencia Keightley | App | Veredicto |
|----------|---------------------|-----|-----------|
| **G1** Sin veredicto «Silencio» / indeterminado | §2.5 n.48: a veces el adivino abandona un set sin respuesta; no es un quinto estado productizado. §2.6: grietas leídas y numeradas. | 4 veredictos; Silence eliminado (`f462f43`) | **PASS** (decisión DIV-01 reforzada) |
| **G2** Notaciones de grieta inauspiciosas **no se grababan** | §2.6: «Inauspicious crack notations were not recorded.» Nota §2.6 n.64: graph 凶 estándar Yi Jing no aparece en inscripciones Shang. | Motor emite `inauspicious_*` como resultado visible al usuario | **GAP** — simplificación de producto, no registro epigráfico |
| **G3** Taxonomía Keightley ≠ 大吉/吉/凶/大凶 aleatorios | §4.3.1.11 period I: shang-chi, hsiao-chi, pu tsai ming (?), chi — **todas auspiciosas** en notación de grieta. Prognosticación §2.7 puede ser inauspicious en texto del rey (ej. parto jen-hsü). | Un solo `rollCrackPattern()` → 4 códigos con etiquetas 大吉/吉/凶/大凶 | **FAIL book-primary** como procedimiento Shang; **PASS** como abstracción ludificada |
| **G4** Procedimiento real = sets multi-grieta | §2.5: 5+5 grietas por tema, cargas positiva/negativa emparejadas | Una síntesis + un patrón | **INFO** — no pretendido en motor; copy debe reflejarlo |

**Conclusión G:** Mantener 4 estados es **defendible** frente a «Silencio»; **no** es fidelidad 1:1 a notaciones Keightley ni a un solo sorteo.

### 4.H — Pesos aleatorios · **INFO (esperado)**

Keightley no define probabilidades 29.41/23.53/23.53/23.53. Los pesos son **diseño de producto** (redistribución post-15% Silence, DIV-01 §5).

**Veredicto H:** Documentar como **INFO** en RPT-DIV-00; no FAIL si copy no afirma derivación del libro.

### 4.I — Topología A–D (imagen) · **FAIL ancla**

`describeOracleBoneCrackTopology()` asigna T / bambú / X / Y a patrones 1–4. Keightley describe lectura de grietas desde huecos de perforación, ramas transversales y **sets** — **no** una tabla T/X/Y ↔ cuatro niveles de veredicto.

**Veredicto I (cerrado 2026-06-25):** metáfora visual aceptable para FLUX; sin cita book-primary por patrón. Se corrigió el comentario interno de `describeOracleBoneCrackTopology()` (`packages/image-engine/src/oracle-bones-prompt.ts`) de «Archaeologically informed crack topology» a «Stylized crack topology inspired by Shang-style pyromancy... not a documented archaeological taxonomy», con cita a esta sección — no público, pero evita que el overclaim se propague a futuras decisiones de ingeniería.

### 4.J — Copy FAQ · **OVERCLAIM — cerrado 2026-06-25**

FAQ EN (`oracle-bones-method`), estado previo:

> «The verdict always falls into one of four possible states, **faithful to the original Shang tradition** …»

Keightley documenta ritual burocrático multi-grieta, rey prognosticando, notaciones mayormente auspiciosas grabadas en hueso. La app comprime a **un** sorteo sintético + cuatro etiquetas modernas.

**Veredicto J (cerrado):** decisión de producto del propietario: cambio mínimo y quirúrgico, «fiel a»/«respeta» → «inspirado en»/«se inspira en», sin reescribir el resto de la frase ni añadir disclaimers nuevos. Aplicado en los 11 locales donde aplicaba:

| Ubicación | Antes | Después |
|-----------|-------|---------|
| FAQ `oracle-bones-method` (11 locales) | «faithful to the original Shang tradition» / «fieles al método ancestral Shang» | «inspired by the Shang tradition» / «inspirados en el método ancestral Shang» |
| `/notes` `bonesOriginBody` (solo EN/ES/PT/FR/DE/IT tenían el claim; JA/ZH/KO/AR/HI ya eran descriptivos, sin cambio) | «respects the structural logic» / «respeta la lógica estructural» | «is inspired by the structural logic» / «se inspira en la lógica estructural» |

Verificado: `tsc` (i18n + image-engine + web), `i18n:audit`, `verify:docs-remediation`, vitest 77/78 — todo PASS. No se tocó la mecánica (4 estados, pesos, patrones T/X/Y) — solo el lenguaje de fidelidad, per decisión de producto.

---

## 5. Fase 2 — cancelada por decisión de negocio (2026-06-25)

| ID | Entrega | Estado final |
|----|---------|--------------|
| F2-1 | Harness `verify:oracle-bones-keightley` (VF-DIV-002): citas gold JSON + reglas G/J automáticas | **No aplica.** Sin claim de fidelidad 1:1, no hay patrón book-primary contra el cual gatear el motor. Construir el harness habría sido auditar una equivalencia que el producto ya no afirma. |
| F2-2 | Revisión humana juez (campo a campo gold ↔ FAQ ES/EN) | **No aplica**, misma razón — el FAQ ya no afirma fidelidad campo a campo; queda como nota cualitativa («inspirado en»), no como dato verificable 1:1. |
| F2-3 | Decisión producto: ¿ajustar copy solo, o también etiquetas 大吉/大凶? | **Resuelto 2026-06-25**: copy solo («fiel a» → «inspirado en», FAQ + `/notes`, 11 locales); etiquetas 大吉/吉/凶/大凶 sin cambio — son abstracción de producto, declarada explícitamente como simbólica, no como reconstrucción literal. Ver §4.J y `00000000-RPT-DIV-00` §5. |
| F2-4 | Entrada `/audits` sección dedicada (fuera `divination-method` I Ching) | **No aplica, permanente.** `/audits` es el canal de verificaciones de fidelidad; un método que se declara explícitamente simbólico (no literal) no tiene una verificación de fidelidad que publicar ahí. Esto no es una brecha pendiente — es la consecuencia correcta de la decisión F2-3. |

**Cierre de la AU:** los 4 hallazgos originales (G, H, I, J) quedan resueltos: G y H documentados como diseño de producto reconocido (sin pretensión de derivación del libro); I y J corregidos en el copy público. No queda ningún ítem abierto en esta familia.

---

## 6. Comandos reproducibles

```bash
npm run pdf-gold:preflight
npm run extract:gold:keightley-procedural
# Gold: tools/datasets/keightley/procedural/keightley-procedural-gold.json
```

---

## 7. Referencias código

| Pieza | Ruta |
|-------|------|
| Motor | `packages/oracle-bones-engine/src/engine.ts` |
| Prompt grietas | `packages/image-engine/src/oracle-bones-prompt.ts` |
| FAQ | `packages/i18n/src/messages/faq-page-ui.ts` |
| Gold | `tools/datasets/keightley/procedural/keightley-procedural-gold.json` |
| DIV-01 §5 | `docs/auditorias/00000000-AUD-DIV-01-divination-methods.md` |

---

## 8. Changelog

| Fecha | Evento |
|-------|--------|
| 2026-06-25 | Apertura AU; extract gold §2.5–2.7 + §4.3.1.11; hallazgos preliminares G–J (Fase 1) |
| 2026-06-25 | **Hallazgos I y J cerrados.** Decisión de producto: copy público (FAQ + `/notes`, 11 locales) y comentario interno corregidos de «fiel a»/«arqueológicamente informado» a «inspirado en» — cambio mínimo, sin alterar la mecánica (4 estados, pesos, patrones T/X/Y). G y H permanecen abiertos (Fase 2: harness `VF-DIV-002`, decisión sobre topología de imagen y matriz/sets). |
| 2026-06-25 | **AU cerrada por decisión de negocio.** El propietario confirma: el método es homenaje simbólico, no reconstrucción literal — ya declarado así en el copy. Sin claim de fidelidad, no aplica AU book-primary contra Keightley (nada que comparar). Fase 2 completa cancelada (F2-1/F2-2/F2-4 no aplican; F2-3 ya resuelto). Hallazgos G/H quedan documentados como diseño de producto reconocido, sin pendiente de remediación. |
