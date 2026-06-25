# Huesos de Oráculo vs Keightley (book-primary PDF)
**Código:** `20260625-AUD-DIV-03 oracle-bones-keightley` · **Familia:** DIV · **Estado:** open (Fase 1)

**Fecha apertura:** 2026-06-25  
**Auditoría anterior:** [`00000000-AUD-DIV-01 divination-methods`](./00000000-AUD-DIV-01-divination-methods.md) §5 (cerrada 2026-05-19; cita académica, sin gold parseado)  
**Canal público `/audits`:** fuera de alcance hasta cierre AU + WF-DOC-03 (Huesos no entra en `divination-method` I Ching)  
**Referencia procedimental (contexto libro):** [`20260625-BRIEF-DIV-04-keightley-procedural-reference.md`](./20260625-BRIEF-DIV-04-keightley-procedural-reference.md) — Ping-pien 8 (fig. 8) + Ping-pien 12–21 (§3.7)

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

**Veredicto I:** Metáfora visual aceptable para FLUX; **sin** cita book-primary por patrón. Requiere nota de auditoría en prompt o doc producto antes de afirmar «arqueológicamente informado» en copy externo.

### 4.J — Copy FAQ · **OVERCLAIM**

FAQ EN (`oracle-bones-method`):

> «The verdict always falls into one of four possible states, **faithful to the original Shang tradition** …»

Keightley documenta ritual burocrático multi-grieta, rey prognosticando, notaciones mayormente auspiciosas grabadas en hueso. La app comprime a **un** sorteo sintético + cuatro etiquetas modernas.

**Veredicto J:** **FAIL** copy book-primary tal como está. Remediación propuesta (Fase 2, pendiente aprobación): matizar «inspirado en tradición Shang» / «cuatro respuestas posibles en la app» sin «faithful to the original Shang tradition».

---

## 5. Fase 2 (pendiente)

| ID | Entrega | Estado |
|----|---------|--------|
| F2-1 | Harness `verify:oracle-bones-keightley` (VF-DIV-002): citas gold JSON + reglas G/J automáticas | Pendiente |
| F2-2 | Revisión humana juez (campo a campo gold ↔ FAQ ES/EN) | Pendiente |
| F2-3 | Decisión producto: ¿ajustar copy solo, o también etiquetas 大吉/大凶? | Pendiente usuario |
| F2-4 | Entrada `/audits` sección dedicada (fuera `divination-method` I Ching) | Pendiente cierre |

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
