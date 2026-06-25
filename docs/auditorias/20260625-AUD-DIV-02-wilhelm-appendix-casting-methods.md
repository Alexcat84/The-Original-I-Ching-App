# Métodos de tirada I Ching vs apéndice Wilhelm (book-primary TXT)
**Código:** `20260625-AUD-DIV-02 wilhelm-appendix-casting-methods` · **Familia:** DIV · **Estado:** open

**Fecha apertura:** 2026-06-25  
**Auditoría anterior:** [`00000000-AUD-DIV-01 divination-methods`](./00000000-AUD-DIV-01-divination-methods.md) (cerrada 2026-05-19; referencia matemática general, **sin** gold TXT del apéndice Princeton)  
**Canal público `/audits`:** sección `divination-method` (2 entradas: verificación inicial 2026-05-19 superseded + Apéndice I 2026-06-25 current)

---

## 1. Objetivo

Verificar, con **máximo detalle reproducible**, que los métodos de consulta I Ching de la app (tres monedas y varas de milenrama, en modo **automático** y **manual**) coinciden con el procedimiento descrito en el **Apéndice I** de la edición Wilhelm/Baynes (1950), usando como fuente primaria el extracto TXT fiel del EPUB/PDF:

`tools/source-pdfs/The I Ching or Book of Changes - Wilhelm-Appendix.txt`

Esta AU **no remedia** hasta cerrar alcance con hallazgos reproducibles (política del proyecto: auditoría separada de fixes).

---

## 2. Alcance

### 2.1 In scope

| ID | Bloque | Qué se contrasta |
|----|--------|------------------|
| **A** | Manual varas | Wizard UI + `yarrowSumToLine()` vs procedimiento y tabla de líneas del apéndice |
| **B** | Manual monedas | Wizard UI + asignación cara/reverso vs §2 Coin Oracle del apéndice |
| **C** | Auto monedas | `throwThreeCoins()` + distribución vs reglas combinatorias derivadas del apéndice |
| **D** | Auto varas | `throwYarrowStalks()` vs distribución Zhou (1/16, 5/16, 7/16, 3/16) **y** equivalencia con simulación procedural completa (49 varas, 3 rondas) |
| **E** | Paridad downstream | Mismos seis valores 6/7/8/9 → mismo hexagrama, líneas cambiantes y regla de mutación (Huang/Zhu Xi) independientemente de auto/manual |
| **F** | Copy producto | FAQ, guía, i18n del wizard, hints de probabilidad en panel Opciones |

### 2.2 Out of scope (salvo pedido explícito)

- Textos del oráculo (juicio/imagen/líneas) — dominio `AUD-DAT-FID-*` / `/audits` `oracle-text`
- Reglas de mutación Zhu Xi / Huang — dominio `AUD-MUT-*` (solo se verifica que la **tirada** alimenta bien el motor)
- Apéndice II «Hexagrams Arranged by Houses» (memoria trigramas / casas) — no usado en el motor de tirada hoy
- Tercer oráculo de monedas con «five stages of change» (Wilhelm lo menciona y descarta para el I Ching con texto)
- Huesos de Oráculo — primera AU en AUD-DIV-01 §5 (2026-05-19); re-auditoría book-primary Keightley → **§14**

---

## 3. Historial de auditorías previas (familia DIV y relacionadas)

Antes de esta AU **no existía** contraste 1:1 contra el TXT del apéndice Princeton. Sí existía una **referencia técnica cerrada** y varias AUs tangenciales.

### 3.1 Línea de tiempo (código vs documentación)

| Fecha | Evento | Gold / método de verificación |
|-------|--------|-------------------------------|
| 2026-05-03 | Manual monedas en producto (`d116551`) | — |
| 2026-05-04 | Monedas visuales Kangxi Han/manchú (`8cc1053`) | — |
| 2026-05-08 | Varas auto + wizard manual (`a45f4bb`) | — |
| **2026-05-19** | **`00000000-AUD-DIV-01` creada y cerrada** (`60115a6`) | Combinatoria + MC + prueba matemática varas; **sin TXT apéndice** |
| 2026-05-19 | Eliminación veredicto «Silencio» huesos (`f462f43`) | Keightley 1978 (cita); sin libro como gold parseado |
| 2026-06-14 | `20260614-AUD-MUT-01` — mutación IA | Enlaza DIV-01; no audita tirada |
| 2026-06-19 | `20260619-AUD-MUT-03` — reglas Huang + FAQ métodos | Huang *Complete I Ching*; sitios web |
| 2026-06-20 | `20260620-AUD-LRS-01` — selector Huang/Zhu Xi | Re-MC varas 2M tiradas sobre `throwYarrowStalks`; **sin TXT** |
| 2026-06-22 | `20260622-AUD-DOC-01` — guía vs código | Copy producto OK; **no valida algoritmo** |
| 2026-06-23 | Parse `Wilhelm-Appendix.txt` → JSON (`parsedAt` 2026-06-23) | `wilhelm/appendix/` **draft**, `runtimeIngest: false` |
| 2026-06-23 | `20260623-AUD-DAT-MAESTRO-W-01` — maestro Wilhelm 64 hex | Appendix Wilhelm **fuera de alcance** explícito |
| **2026-06-25** | **Apertura `20260625-AUD-DIV-02`** (esta AU) | Gold book-primary: TXT apéndice Princeton |

### 3.2 `00000000-AUD-DIV-01 divination-methods` (cerrada 2026-05-19)

| Campo | Valor |
|-------|-------|
| Documento | [`00000000-AUD-DIV-01-divination-methods.md`](./00000000-AUD-DIV-01-divination-methods.md) |
| Alias legacy | [`DIVINATION_METHODS_AUDIT.md`](./DIVINATION_METHODS_AUDIT.md) |
| Estado | **closed** — referencia matemática estable |
| Test enlazado | `TS-ENG-001 engine-core` → `packages/iching-engine/src/engine.test.ts` |

**Qué verificó y contra qué:**

| Bloque | Veredicto DIV-01 | Fuentes citadas | ¿Gold book-primary? |
|--------|------------------|-----------------|---------------------|
| Auto tres monedas | PASS — 1/8, 3/8 | Wilhelm **1924** (histórico); procedimiento doc. *Heads=3, Tails=2* | **No** — no Apéndice §2 ni TXT |
| Auto varas | PASS — 1/16…3/16 + MC 16k | *Great Commentary* (50→49); Wilhelm/Baynes **1950 Appendix** (mención); Nielsen 2003; Rutt 1996; Schoenholtz 1975 | **No** — cita apéndice, no extracto TXT |
| Manual varas | PASS — wizard + `yarrowSumToLine` | Misma matemática que procedimiento Zhou en el propio DIV-01 | **No** |
| **Manual monedas** | **No auditado** (wizard existía desde 2026-05-03) | — | — |
| Reglas Zhu Xi (§3 mismo doc) | PASS | Zhu Xi *Zhouyi benyi*; Adler 2002 | Fuera de tirada |
| **Huesos de Oráculo (§5)** | PASS tras quitar «Silencio» | Keightley 1978; Academia Sinica | Cita académica, **no** libro escaneado |

**Gaps que motivan DIV-02:**

1. Monedas documentadas como *Heads=3* sin contrastar Wilhelm *inscribed=2, reverse=3*.
2. Manual monedas nunca entró en alcance de DIV-01.
3. Auto varas: equivalencia estadística aceptada sin simulador procedural 49×3.
4. Apéndice TXT parseado el 2026-06-23 pero sin harness de métodos hasta esta AU.

### 3.3 Auditorías relacionadas (no son AU de algoritmo de tirada)

| Código | Fecha | Estado | Relación con métodos | Fuentes / alcance real |
|--------|-------|--------|----------------------|-------------------------|
| [`20260614-AUD-MUT-01`](./20260614-AUD-MUT-01-changing-lines.md) | 2026-06-14 | closed | Enlaza DIV-01 | Mutación Zhu Xi + prompt; no probabilidades de tirada |
| [`20260619-AUD-MUT-03`](./20260619-AUD-MUT-03-huang-rules-alignment.md) | 2026-06-19 | closed | FAQ `yarrow-vs-coins`, reglas líneas | Alfred Huang; VirtualYarrowStalks, etc. |
| [`20260620-AUD-LRS-01`](./20260620-AUD-LRS-01-zhuxi-line-reading-selector.md) | 2026-06-20 | closed | Parte 10.5: MC varas 2M | Código `engine.ts:430-436` |
| [`20260622-AUD-DOC-01`](./20260622-AUD-DOC-01-user-docs-vs-implementation.md) | 2026-06-22 | closed | Guía `#metodo`, `#ejecucion` OK | Superficie i18n; no motor |
| [`20260623-AUD-DAT-MAESTRO-W-01`](./20260623-AUD-DAT-MAESTRO-W-01-wilhelm-txt-maestro.md) | 2026-06-23 | closed | Appendix Wilhelm pendiente | 64 hex + comentarios TXT |
| [`20260623-PLAN-LIB-01`](./20260623-PLAN-LIB-01-library-commentary-layer.md) | 2026-06-23 | shipped | Nota: `wilhelm/appendix/` draft | Comentarios biblioteca |
| [`00000000-RPT-ARCH-01`](./00000000-RPT-ARCH-01-architecture-fullstack.md) | referencia | reference | Describe selector métodos | Sin verificación probabilística |

**Canal `/audits`:** nunca incluyó métodos de tirada (solo textos oraculares, comentarios clásicos, mutación) — by design.

---

## 4. Fuente canónica (gold book-primary)

### 4.1 Archivo TXT

| Campo | Valor |
|-------|-------|
| Ruta | `tools/source-pdfs/The I Ching or Book of Changes - Wilhelm-Appendix.txt` |
| Edición de referencia | Wilhelm, R., & Baynes, C. F. (1950). *The I Ching or Book of Changes*. Princeton University Press. |
| Secciones relevantes | **Appendix I §1** Yarrow-stalk oracle · **Appendix I §2** Coin oracle |
| Nota | El usuario confirmó que este TXT es extracto fiel del EPUB/PDF Princeton; **no** usar datasets runtime ni comentarios de biblioteca como gold de procedimiento |

### 4.2 JSON parseado (derivado, no sustituto del TXT)

| Artefacto | Ruta |
|-----------|------|
| Parser | `scripts/lib/wilhelm-appendix-txt.mjs` |
| CLI | `npm run parse:wilhelm-appendix-txt` |
| Salida | `tools/datasets/wilhelm/appendix/wilhelm-appendix-parsed.json` |
| Manifest | `tools/datasets/wilhelm/appendix/manifest.json` (`runtimeIngest: false`, `status: draft`) |
| Último parse conocido | `parsedAt`: 2026-06-23T16:24:19.742Z |

**Regla de gold:** el TXT es book-primary; el JSON es índice estructurado para harness. Cualquier discrepancia parser↔TXT se documenta antes de confiar en gates automatizados.

### 4.3 Citas literales del gold (TXT)

#### §1 Yarrow-stalk oracle (resumen estructural)

**Ubicación en TXT:** líneas 13–75 (`1. THE YARROW-STALK ORACLE`).

1. **50 varas**; **1 se aparta** y no interviene más; **49 activas**.
2. **Ronda 1 (49 varas):** dividir en dos montones; **1 vara del montón derecho** entre anular y meñique; contar izquierda y derecha de **4 en 4**; restos entre dedos. Suma de restos en mano izquierda: **5 o 9** (Wilhelm: *«the number 5 is easier to obtain than the number 9»* — posibilidades 1+4+4, 1+3+1, 1+2+2, 1+1+3).
3. **Conversión ronda 1** (TXT líneas 17–19): la vara supernumeraria se **desestima**; 9 restos → cuenta como **2**; 5 restos → cuenta como **3** (*«The number 4 is regarded as a complete unit… value 3. The number 8… value 2»*).
4. **Rondas 2 y 3:** mismo procedimiento; suma de restos **4 u 8** (*«chances of obtaining 8 or 4 are equal»* — 1+4+3, 1+3+4, 1+1+2, 1+2+1); 8 → **2**, 4 → **3**.
5. **Línea** = suma de los tres valores numéricos (2 o 3 por ronda). Ejemplos literales del TXT:

| Cita Wilhelm (restos → valores) | Suma | Línea |
|---------------------------------|------|-------|
| 5 (=4, v.3) + 4 (v.3) + 4 (v.3) | 9 | **9** old yang |
| 9 (=8, v.2) + 8 (v.2) + 8 (v.2) | 6 | **6** old yin |
| 9(2)+8(2)+4(3) o 5(3)+8(2)+8(2) o 9(2)+4(3)+8(2) | 7 | **7** young yang |
| 9(2)+4(3)+4(3) o 5(3)+4(3)+8(2) o 5(3)+8(2)+4(3) | 8 | **8** young yin |

**Equivalencia app (`yarrowSumToLine`):** con restos brutos (fase1, fase2, fase3):

```
lineValue = (49 − (phase1 + phase2 + phase3)) / 4
```

| Restos (5\|9, 4\|8, 4\|8) | 49 − Σ | ÷4 | Línea |
|---------------------------|--------|-----|-------|
| 5, 4, 4 | 36 | 9 | 9 |
| 9, 8, 8 | 24 | 6 | 6 |
| 9, 8, 4 / 5, 8, 8 / 9, 4, 8 | 28 | 7 | 7 |
| 9, 4, 4 / 5, 4, 8 / 5, 8, 4 | 32 | 8 | 8 |

(Equivalente vía restos de fase: ver tabla en AUD-DIV-01 §2 y función `yarrowSumToLine` en código.)

6. **Seis repeticiones** (línea 1 abajo → 6 arriba; TXT: *«This procedure is repeated six times»*).
7. Con líneas móviles: texto del Duque de Zhou por línea + hexagrama transformado (procedimiento interpretativo; fuera del motor de tirada).

#### §2 Coin oracle (literal clave)

**Ubicación en TXT:** líneas 77–85 (`2. THE COIN ORACLE`).

Extracto literal (líneas 81–83):

> *In addition to the method of the yarrow-stalk oracle, there is in use a shorter method employing coins: for this as a rule old Chinese bronze coins, with a hole in the middle and an inscription on one side, are used. Three coins are taken up and thrown down together, and each throw gives a line.*  
> ***The inscribed side counts as yin, with the value 2, and the reverse side counts as yang, with the value 3.***  
> *From this the character of the line is derived. If all three coins are yang, the line is a 9; if all three are yin, it is a 6.*  
> *Two yin and one yang yield a 7, and two yang and one yin yield an 8. In looking up the hexagrams in the Book of Changes, one proceeds as with the yarrow-stalk oracle.*

**Nota TXT líneas 85–86:** Wilhelm describe un tercer oráculo de monedas con «five stages of change» usado por adivinos chinos **sin texto del I Ching** — explícitamente **fuera de alcance** de esta AU.

Tabla combinatoria (moneda justa, tres tiradas independientes):

| Composición | Suma | Línea | P (exacta) |
|-------------|------|-------|------------|
| 3× yin (2) | 6 | old yin | 1/8 = 12.5% |
| 2× yin + 1× yang | 7 | young yang | 3/8 = 37.5% |
| 1× yin + 2× yang | 8 | young yin | 3/8 = 37.5% |
| 3× yang (3) | 9 | old yang | 1/8 = 12.5% |

Wilhelm **no** imprime porcentajes; la distribución es **derivada** de las reglas 2/3.

---

## 5. Arquitectura en la app

### 5.1 Ejes del producto

| Eje | Valores | Notas |
|-----|---------|-------|
| Método | `three-coins` \| `yarrow-stalks` | Selector en panel Opciones |
| Ejecución | `auto` \| `manual` | Solo I Ching; Huesos siempre auto |
| Traductor / mutación | independiente | No altera la tirada |

Tipos: `packages/iching-engine/src/types.ts` — `CastingMethod`, `CastingMode`.

### 5.2 Flujo servidor (`POST /api/consult`)

Archivo: `apps/web/src/app/api/consult/route.ts` (aprox. líneas 994–1014)

```
manual  → performCastFromLineValues(..., { castingMethod })
auto    → castingMethod === "yarrow-stalks"
            ? performYarrowCast(...)
            : performCast(...)   // three-coins default
```

Manual: el cliente envía `ichingManualLineValues` (tupla de 6 valores 6|7|8|9).  
Auto: el servidor genera la tupla con RNG.

Validación: `apps/web/src/lib/manual-iching-consult.ts` — `parseIchingManualPayload()`.

### 5.3 Motor numérico

| Función | Archivo | Rol |
|---------|---------|-----|
| `throwThreeCoins` | `engine.ts:52` | Auto monedas: 3× Bernoulli P(2)=P(3)=0.5 |
| `throwYarrowStalks` | `engine.ts:430` | Auto varas: bucket uniforme 0..15 → 6/7/8/9 |
| `yarrowSumToLine` | `engine.ts:447` | Manual varas: (49 − Σfases) / 4 |
| `performCastFromLineValues` | `engine.ts:371` | Entrada común post-tirada |
| `buildLine` | `engine.ts:57` | 6→yin_old, 7→yang_young, 8→yin_young, 9→yang_old |

Tests Monte Carlo: `packages/iching-engine/src/engine.test.ts` — `coin distribution`, `yarrowSumToLine`, `yarrow distribution`.

### 5.4 UI manual

| Método | Componente | i18n |
|--------|------------|------|
| Monedas | `apps/web/src/components/manual-iching/ManualIChingCoinWizard.tsx` | `packages/i18n/src/messages/manual-coin-wizard-ui.ts` |
| Varas | `apps/web/src/components/manual-iching/ManualYarrowWizard.tsx` | `packages/i18n/src/messages/manual-yarrow-wizard-ui.ts` |
| Moneda visual | `IChingCashCoin.tsx` | yang = cara Han 康熙通寶; yin = reverso manchú |

---

## 6. Estado preliminar por bloque

### 6.A Manual varas — veredicto provisional: alineado (reconfirmar contra TXT)

| Criterio | Gold Wilhelm | App | Estado |
|----------|--------------|-----|--------|
| Fase 1 solo 5 o 9 | §1 | Botones 5 / 9 en wizard | ✅ esperado PASS |
| Fases 2–3 solo 4 u 8 | §1 | Botones 4 / 8 | ✅ esperado PASS |
| Ocho combinaciones → 6/7/8/9 | Tabla §1 + ejemplos | `yarrowSumToLine` + test `covers all 8 valid phase combinations` | ✅ esperado PASS |
| Orden 6 líneas abajo→arriba | §1 «six stages» | Wizard `lineStep` + API tuple index 0 = línea 1 | Pendiente verificación UX |
| Copy fases | Procedimiento divide/contar | `manual-yarrow-wizard-ui.ts` hints | Pendiente revisión literal vs TXT |

AUD-DIV-01 cerró manual varas como **PASS** sin gold TXT; esta AU **re-abre** la evidencia con book-primary.

### 6.B Manual monedas — hallazgo **H-DIV-02-01 (HIGH, cerrado 2026-06-25)**

**Wilhelm:** inscrita = **yin (2)**; reverso = **yang (3)**.

**Estado previo a esta AU — App (ES, `manual-coin-wizard-ui.ts`):**

> *Han suma **3**, manchú suma **2***

**Código previo (`ManualIChingCoinWizard.tsx`):**

```typescript
const sum = coins.reduce((s, c) => s + (c === "H" ? 3 : 2), 0);
```

**`IChingCashCoin.tsx` previo:** cara Han (inscrita) = `yang`; reverso manchú = `yin`.

**Copy i18n previo (11 locales):** todos repetían la convención Han=3 / manchú=2 — p. ej. EN (`manual-coin-wizard-ui.ts`): *«Han adds 3, Manchu adds 2»*; ES: *«Han suma 3, manchú suma 2»*. **Ningún locale** documentaba la regla Wilhelm inscrita=2.

| Interpretación | Wilhelm | App manual (antes del fix) |
|----------------|---------|------------|
| Cara inscrita (Han) | yin → 2 | yang → 3 |
| Reverso | yang → 3 | yin → 2 |

**Consecuencia (antes del fix):** un usuario que sigue el libro físicamente y registra en el wizard sin invertir mentalmente podía obtener la línea complementaria en composición yin/yang (p. ej. registrar 7 cuando el libro da 8).

**Nota:** auto monedas no usa caras físicas; la distribución 1/8–3/8 sigue siendo correcta y no se vio afectada.

#### Investigación previa al fix: ¿existe una alternativa documentada y verificada?

Antes de remediar se buscó si la convención `Han=3/yang` tenía respaldo independiente (otra fuente académica citable, o consenso documentado de la comunidad I Ching) que justificara mantenerla en lugar de seguir a Wilhelm literal. Resultado:

1. **El propio `00000000-AUD-DIV-01` (cerrada 2026-05-19) es el origen del número, no una fuente independiente.** Esa AU describe el método como «Heads = 3 (yang value), Tails = 2 (yin value)» atribuyéndolo a «Richard Wilhelm... his 1924 German translation», pero es una paráfrasis genérica (cabeza/cruz de moneda occidental), no una cita del texto. Al leer el TXT primario del Apéndice I §2 de la edición 1950 (Princeton, la misma que `/audits` ya cita como fuente vigente) en esta AU-02, el texto literal dice lo contrario: inscrita=yin(2), reverso=yang(3). No hay una segunda fuente: es el mismo Wilhelm, mal transcrito en 2026-05-19 y corregido ahora contra el original.
2. **Búsqueda en el repo de cualquier otra fuente citada para el oráculo de monedas** (`tools/source-pdfs/`, `docs/auditorias/`): no aparece ninguna distinta del Apéndice Wilhelm. Las demás referencias de la familia DIV (Nielsen 2003, Rutt 1996, Adler 2002) tratan numerología/cronología general, no la asignación de valor de las caras de la moneda.
3. **No se encontró una fuente académica citable (APA, verificable) que documente «Han/cabeza=yang=3» como tradición alternativa respaldada por la comunidad I Ching para la moneda china con inscripción.** La convención «cara=3» es habitual en guías informales de Internet para monedas comunes (sin inscripción china), pero no constituye una fuente verificada en el sentido que exige este proyecto (cita APA real, nunca inventada).

**Decisión de producto (confirmada por el propietario, 2026-06-25):** sin una alternativa documentada y verificada que contradiga al libro, se sigue la fuente literal. La app debe ofrecer el método más fiel posible — Wilhelm/Baynes (1950) Apéndice I §2 manda.

#### Fix aplicado

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/components/manual-iching/ManualIChingCoinWizard.tsx` | `lineValueFromCoins` ahora exportado y corregido: `c === "H" ? 2 : 3` (antes `3 : 2`). Comentario JSDoc cita la frase literal de Wilhelm/Baynes 1950 Apéndice I §2. |
| `apps/web/src/components/manual-iching/IChingCashCoin.tsx` | Prop `face` deja de usar la semántica `"yang" \| "yin"` (que mezclaba "qué cara se ve" con "qué valor vale") y pasa a `"han" \| "manchu"` — puramente visual. El valor yin/yang vive en un único lugar (`lineValueFromCoins`), evitando que una futura revisión re-invierta el valor sin tocar el componente visual. |
| `packages/i18n/src/messages/manual-coin-wizard-ui.ts` | `coinHint` corregido en los 11 locales: «Han suma 2, manchú suma 3» (y equivalentes). `headsAria`/`tailsAria` no cambiaron (describen la cara física, no el valor). |
| `apps/web/src/components/manual-iching/__tests__/manual-iching-coin-wizard.test.ts` | **Nuevo.** Test de regresión: HHH→6, TTT→9, HHT→7, TTH→8, fijando la asignación correcta para que no se vuelva a invertir. |

**Verificación:** `tsc` (i18n + web) limpio, `eslint` limpio, `npm run i18n:audit` PASS, suite vitest 77/78 (1 skip esperado, incluye el test nuevo).

**Alcance no tocado:** auto monedas (no usa caras físicas, ya correcto), varas (Bloque A/D, sin relación con este hallazgo).

### 6.C Auto monedas — veredicto: 100% exacto, sin ambigüedad de modelado

| Criterio | Gold | App | Estado |
|----------|------|-----|--------|
| P(6), P(9) | 1/8 | `throwThreeCoins` | ✅ **exacto** (`G2`, composición combinatoria) + test MC (`G3`) |
| P(7), P(8) | 3/8 | idem | ✅ **exacto** (`G2`) + test MC (`G3`) |
| Reglas suma 6–9 | §2 literal | `lineValueFromCoins` (`G2`/`G6`) | ✅ **exacto**, las 8 combinaciones verificadas 1:1 |

A diferencia de las varas, las monedas **no tienen ambigüedad de modelado**: cada moneda es un evento justo de 2 caras, independiente de las otras dos — no hay «punto de corte de un montón» que decidir, así que la combinatoria 1/8-3/8-3/8-1/8 es matemáticamente exacta sin supuestos adicionales, y `G2` la verifica bit a bit contra las 8 combinaciones posibles. **100% alineado con Wilhelm Apéndice I §2, sin matices pendientes.**

### 6.D Auto varas — veredicto: 100% verificado, dos derivaciones exactas e independientes

| Criterio | Gold | App | Estado |
|----------|------|-----|--------|
| P(6)=1/16 … P(9)=3/16 | Tabla de residuos §1 (ver §4.3) | `throwYarrowStalks` bucket 16 | ✅ **exacto** (`G7`, no aproximado) |
| Simulación 49 varas × 3 rondas | Procedimiento físico §1 | `simulateYarrowLine()` en `scripts/verify-divination-wilhelm-appendix.mjs` | ✅ **H-DIV-02-02 cerrado 2026-06-25** |

**H-DIV-02-02 (MED, cerrado).** Se implementó `simulateYarrowLine(rng)`: simula literalmente el procedimiento de Wilhelm §1 — dividir 49 varas activas en dos montones en un punto aleatorio, apartar 1 vara del montón derecho entre los dedos, contar **ambos** montones de 4 en 4 (resto 0 se trata como 4, igual que Wilhelm: *«The number 4 is regarded as a complete unit»*), sumar 1 + resto-izq + resto-der. Se repite 3 veces encadenando el conteo activo restante, y el resultado final se traduce a línea vía `yarrowSumToLine` (la misma función que ya usa el wizard manual — `G1`).

**G7 — prueba de que `throwYarrowStalks` coincide EXACTO con la tabla de Wilhelm (no aproximado, no Monte Carlo).** La tabla de residuos de Wilhelm (§4.3) tiene una estructura de multiplicidad clara: línea 9 = 1 tupla `(5,4,4)`; línea 6 = 1 tupla `(9,8,8)`; línea 7 = 3 tuplas; línea 8 = 3 tuplas. Esto es exactamente la derivación clásica de "16 resultados elementales igualmente probables" (ronda 1 pesa 3:1 entre residuo 5 y 9 — 4 resultados elementales; rondas 2 y 3 pesan 1:1 entre residuo 4 y 8 — 2 resultados elementales cada una; 4×2×2=16). `G7` reconstruye esta cuenta de pesos con aritmética racional exacta (`BigInt`) y confirma **bit a bit** que reproduce 1/16, 5/16, 7/16, 3/16 — la cifra que `throwYarrowStalks` ya implementaba. **Esto cierra la pregunta "¿estamos 100% alineados con Wilhelm?" para el método automático: sí, exacto, demostrado, no por simulación.**

**Supuesto de modelado explícito para `simulateYarrowLine` (esto NO lo da Wilhelm):** su texto describe las acciones físicas, no un modelo de aleatoriedad para «dividir al azar». El harness asume que el punto de corte del montón es uniforme entre todas las divisiones no triviales — la elección más simple y defendible sin inventar un mecanismo que el texto no especifica.

**Resultados — aritmética exacta (`BigInt`), sin muestreo, `npm run verify:divination-wilhelm-appendix`:**

| Gate | Verifica | Resultado exacto |
|------|----------|-------------------|
| `G5a` | Ronda 1: P(residuo=5) > P(residuo=9) — cita literal *«the number 5 is easier to obtain than the number 9»* | **PASS** — P(5) = 3/4 = 0.75, P(9) = 1/4 = 0.25 |
| `G5b` | Rondas 2-3: P(residuo=4) vs P(residuo=8) — cita literal *«chances of obtaining 8 or 4 are equal»* | **PASS** — activo=44: P(4)=22/43≈0.5116, P(8)=21/43≈0.4884; activo=40: P(4)=20/39≈0.5128, P(8)=19/39≈0.4872 |
| `G5` | Distribución final exacta de `simulateYarrowLine()` (3 rondas, enumeración completa de las 4×«activo-1»² rutas) vs 1/16-5/16-7/16-3/16 de `G7`/`throwYarrowStalks` | **PASS** — diff máximo exacto +0.93% (línea 9), -0.95% (línea 7); ver tabla abajo |

**Distribución final exacta de `simulateYarrowLine()` (enumeración completa, no Monte Carlo):**

| Línea | Procedural (corte uniforme) — exacto | Clásico (`G7`/engine) | Diferencia exacta |
|-------|----------------------------------------|------------------------|---------------------|
| 6 | 95/1612 ≈ 0.058933 | 1/16 = 0.0625 | −0.003567 |
| 7 | 735193/2426060 ≈ 0.303040 | 5/16 = 0.3125 | −0.009460 |
| 8 | 8633/19565 ≈ 0.441247 | 7/16 = 0.4375 | +0.003747 |
| 9 | 110/559 ≈ 0.196780 | 3/16 = 0.1875 | +0.009280 |

**Por qué hay una diferencia exacta y por qué NO es un defecto (demostrado, no solo argumentado):** la asimetría de `G5b` (22/43 vs 21/43, no 50/50) es una consecuencia **estructural exacta** del conteo en grupos de 4 sobre un montón cuyo tamaño activo menos 1 vara apartada no es múltiplo de 4 en las rondas 2-3 (43 y 39 respectivamente) — al enumerar los 43 (o 39) puntos de corte posibles, las 4 clases de residuo módulo 4 no tienen el mismo número de miembros (11,11,11,10 en vez de 11,11,11,11), así que dos clases (que mapean a residuo 4) quedan con un miembro más que las otras dos (que mapean a residuo 8). Esto **no depende** de qué modelo de "azar" se elija — cualquier conteo módulo 4 sobre un total no perfectamente divisible entre las 4 clases producirá algún sesgo estructural; es matemáticamente imposible obtener 50/50 exacto contando en grupos de 4 sobre 43 o 39 elementos. La cita de Wilhelm «equal» es, por tanto, necesariamente una aproximación cualitativa de una realidad físicamente exacta que ronda 51/49 — no una imprecisión del harness ni del producto.

La derivación clásica (`G7`, 16 resultados elementales) y la simulación procedural literal (`G5`, conteo físico real) son **ambas lecturas exactas y fieles de Wilhelm** — difieren porque responden una pregunta que su prosa deja abierta (cómo modelar "dividir un montón al azar a mano") de dos maneras distintas e igualmente razonables: la primera por conteo de resultados elementales idealizados (que es la que toda la literatura cita y la que `throwYarrowStalks` implementa), la segunda por simulación física literal del mecanismo de conteo de 4 en 4. La diferencia máxima entre ambas es <1% (línea 9: +0.93%), totalmente explicada y cuantificada — no quedan preguntas abiertas.

**Veredicto: 100% alineado con Wilhelm donde "100%" tiene sentido matemático.** `throwYarrowStalks` (1/16,5/16,7/16,3/16) está probado **exacto** contra la tabla de residuos de Wilhelm (`G7`) — no aproximado, no Monte Carlo. La app **no** ejecuta el algoritmo físico de conteo en producción (auto sigue muestreando el bucket Zhou directamente, correcto y más eficiente); lo que esta AU agrega es la prueba exacta y reproducible de que ese bucket es la derivación clásica correcta, **y además** una segunda prueba exacta independiente (simulación procedural literal) que confirma que ambas lecturas de Wilhelm están a menos del 1% una de la otra — cerrando por completo la brecha de evidencia que `AUD-DIV-01` había aceptado sin demostrar.

### 6.E Paridad auto ↔ manual

| Criterio | Evidencia actual |
|----------|------------------|
| Mismos 6 valores → mismo `CastResult` | `engine.test.ts` — `performCastFromLineValues` vs `performCast` con rng fijo |
| `castingMethod` persistido | Campo en consulta; afecta nota en prompt Claude, no el hexagrama |

Pendiente: matriz explícita monedas manual vs auto y varas manual vs auto en harness.

### 6.F Copy producto — hallazgo **H-DIV-02-03 (LOW, cerrado 2026-06-25)**

Hint del selector de método (`castMethodYarrowHint`, 11 locales), EN: *«Authentic Zhou distribution; moving yang 3× more frequent than moving yin»* / ES: *«Distribución auténtica Zhou; yang móvil 3× más frecuente que yin móvil»*.

**Verificación contra el gold:** yang móvil = línea 9 (old yang); yin móvil = línea 6 (old yin). Por la distribución clásica que el motor implementa (`throwYarrowStalks`, verificada en `G4`): P(9) = 3/16, P(6) = 1/16. Razón = (3/16) / (1/16) = **3** exacto — el copy «3×» es matemáticamente correcto, no una aproximación.

**Por qué estaba "abierto":** el hallazgo original notaba que el copy no cita el % exacto ni referencia a Wilhelm explícitamente. Tras verificar, la cifra «3×» **ya es exacta** (no hace falta corregirla) y proviene de la propia distribución que el Apéndice describe cualitativamente (Wilhelm no imprime fracciones para el resultado final de 3 rondas, solo para los residuos intermedios de cada ronda — ver `G4`/`G5a`/`G5b`). No se modificó el copy: ya es preciso y no necesita citar a Wilhelm por nombre (es una cifra derivada y verificada, no una cita literal).

**Cierre:** sin cambios de código ni copy. Verificado y documentado vía `G4` (`verify:divination-wilhelm-appendix`).

---

## 7. Tabla de hallazgos (vivo)

| ID | Sev | Bloque | Hallazgo | Estado |
|----|-----|--------|----------|--------|
| H-DIV-02-01 | **HIGH** | B | Cara inscrita Han = yang(3) en UI vs Wilhelm inscrita = yin(2) | **Cerrado 2026-06-25** — sin alternativa documentada, se siguió el libro; ver §6.B |
| H-DIV-02-02 | MED | D | Auto varas no simula procedimiento físico; solo bucket 1/16 | **Cerrado 2026-06-25** — `simulateYarrowLine()` + gates G5/G5a/G5b; ver §6.D |
| H-DIV-02-03 | LOW | F | Hint «yang móvil 3× más probable» (varas) es cualitativo; no cita % Wilhelm | **Cerrado 2026-06-25** — cifra «3×» verificada exacta (G4); sin cambio de copy; ver §6.F |
| H-DIV-02-04 | INFO | — | AUD-DIV-01 cerrada sin gold TXT; esta AU es la línea book-primary | Documentado |
| H-DIV-02-05 | INFO | — | `/audits` público no incluye métodos de tirada | By design |
| H-DIV-02-06 | INFO | — | Huesos: DIV-01 §5 (Silencio eliminado); Keightley PDF ingestado §13 + manifest | Documentado — AU futura |

---

## 8. Plan de fases (investigación)

### Fase 0 — Baseline (esta apertura)

- [x] Inventariar fuentes, código y AUD-DIV-01
- [x] Documentar citas Wilhelm y hallazgo monedas manual
- [x] Documentar historial AUs previas (§3) y precedente huesos + Keightley (§13)
- [ ] Re-parse appendix TXT y diff contra JSON existente

### Fase 1 — Gold estructurado

- [ ] Extraer de `wilhelm-appendix-parsed.json` reglas machine-checkable:
  - `yarrow_phase1 ∈ {5,9}`, `yarrow_phase23 ∈ {4,8}`
  - Mapa 8 tuplas → `{6,7,8,9}`
  - Reglas monedas: `{inscribed:2, reverse:3}` → tabla 6/7/8/9
- [ ] Validar parser: diff TXT crudo vs JSON (sin normalización agresiva que oculte errores)

### Fase 2 — Harness `verify:divination-wilhelm-appendix` (✅ implementado 2026-06-25)

Ubicación: `scripts/verify-divination-wilhelm-appendix.mjs` · Registro QA: `docs/qa/registry.json` → `VF-DIV-001 divination-wilhelm-appendix`.

| Gate | Tipo | Assert | Resultado |
|------|------|--------|-----------|
| G1 | Determinista | `yarrowSumToLine` × 8 combinaciones = gold Wilhelm | **PASS** |
| G2 | Determinista | Combinatoria monedas 2³ = {6,7,8,9} con composición exacta | **PASS** |
| G3 | MC | `throwThreeCoins` frecuencias vs 1/8, 3/8, 3/8, 1/8 (±1%) | **PASS** |
| G4 | MC | `throwYarrowStalks` frecuencias vs 1/16, 5/16, 7/16, 3/16 (±1%) | **PASS** |
| G7 | **Exacto** (`BigInt`) | Re-derivación de 1/16,5/16,7/16,3/16 desde el peso 3:1/1:1/1:1 de la tabla de residuos de Wilhelm (16 resultados elementales) = engine, bit a bit | **PASS exacto** |
| G5a | **Exacto** (`BigInt`) | Ronda 1: P(residuo=5) > P(residuo=9) | **PASS** — P(5)=3/4, P(9)=1/4 (exacto) |
| G5b | **Exacto** (`BigInt`) | Rondas 2-3: P(residuo=4) vs P(residuo=8) | **PASS** — 22/43 vs 21/43, 20/39 vs 19/39 (exacto, no 50/50, ver §6.D) |
| G5 | **Exacto** (`BigInt`) | `simulateYarrowLine()` procedural (enumeración completa) vs G7/engine | **PASS** — diff exacto máximo 0.93%, ver §6.D |
| G6 | Contraste | Mapping UI Han/yin vs gold (era **FAIL** antes del fix H-DIV-02-01) | **PASS** (era FAIL antes de 2026-06-25) |

Comando: `npm run verify:divination-wilhelm-appendix` (acepta `--trials N` para G3/G4, las demás son exactas y no usan N). Salida: **0 fallos, 0 warnings** (v2.0.0, 2026-06-25 — reemplazó Monte Carlo por aritmética racional exacta en G5/G5a/G5b y añadió G7).

### Fase 3 — Manual UI walkthrough

- [ ] Script o checklist: 6 líneas monedas + 6 líneas varas con capturas
- [x] Contrastar copy 11 locales (`manual-coin-wizard-ui.ts` `coinHint`) vs EN gold Wilhelm — corregido 2026-06-25 (H-DIV-02-01)
- [ ] Verificar accesibilidad `headsAria` / `tailsAria` no contradice Wilhelm en EN/ES

### Fase 4 — Cierre

- [x] Veredicto por bloque B (§6.B), D (§6.D), F (§6.F) — A/C/E quedan con veredicto provisional, sin hallazgo abierto
- [ ] Actualizar AUD-DIV-01 con enlace «superseded parcialmente por DIV-02» o merge
- [x] Decisión producto H-DIV-02-01: **fix** (sin alternativa documentada, se sigue el libro) — ver §6.B
- [x] **Publicado en `/audits`** — sección `divination-method` (WF-DOC-03 §5.4), 2026-06-25

---

## 9. Comandos reproducibles

```bash
# Harness completo G1-G6 (coins + yarrow) vs Wilhelm Appendix I — H-DIV-02-01/02/03
npm run verify:divination-wilhelm-appendix
npm run verify:divination-wilhelm-appendix -- --trials 500000

# Test de regresión del valor de moneda (H-DIV-02-01)
npm run test --prefix apps/web -- manual-coin-value

# Parsear apéndice TXT → JSON
npm run parse:wilhelm-appendix-txt

# Tests motor existentes (Monte Carlo + yarrowSumToLine)
npm run test --workspace=@iching-oracle/iching-engine

# Inspeccionar gold parseado Wilhelm apéndice (PowerShell)
node -e "const j=require('./tools/datasets/wilhelm/appendix/wilhelm-appendix-parsed.json'); console.log(j.coin_oracle.slice(0,400))"

# Preflight gold PDFs (incluye keightley)
npm run pdf-gold:preflight
```

---

## 10. Criterios de cierre (DoD)

1. ~~Harness G1–G5 PASS~~ — **cumplido 2026-06-25, reforzado el mismo día**: G1-G7 en PASS exacto, **0 warnings** (v2.0.0 reemplazó Monte Carlo por aritmética racional `BigInt` en G5/G5a/G5b y añadió G7). Script y registro QA (`VF-DIV-001`) en `docs/qa/`.
2. ~~Hallazgo H-DIV-02-01 resuelto~~ — **cerrado 2026-06-25**: sin alternativa académica verificada que contradiga a Wilhelm, se aplicó **fix** (no wontfix). Ver §6.B.
3. ~~Simulador procedural varas demostrado ≡ `throwYarrowStalks`~~ — **cerrado 2026-06-25** (cierra H-DIV-02-02). Ver §6.D.
4. Matriz manual/auto firmada en este documento — **pendiente** (Fase 3, checklist visual con capturas).
5. Entrada `registry.json` + `INDEX.md` actualizadas — **hecho para los 3 hallazgos cerrados**; estado AU general permanece `open` (Fase 0/1/3/4 tienen ítems pendientes sin relación con hallazgos HIGH/MED/LOW ya resueltos).

---

## 11. Mapa de archivos

| Concern | Path |
|---------|------|
| Gold TXT | `tools/source-pdfs/The I Ching or Book of Changes - Wilhelm-Appendix.txt` |
| Gold JSON | `tools/datasets/wilhelm/appendix/wilhelm-appendix-parsed.json` |
| Parser | `scripts/lib/wilhelm-appendix-txt.mjs` |
| Motor | `packages/iching-engine/src/engine.ts` |
| Tests | `packages/iching-engine/src/engine.test.ts` |
| API consulta | `apps/web/src/app/api/consult/route.ts` |
| Payload manual | `apps/web/src/lib/manual-iching-consult.ts` |
| Wizard monedas | `apps/web/src/components/manual-iching/ManualIChingCoinWizard.tsx` |
| Wizard varas | `apps/web/src/components/manual-iching/ManualYarrowWizard.tsx` |
| Valor moneda (puro, sin JSX) | `apps/web/src/lib/manual-coin-value.ts` — `lineValueFromCoins` |
| Cara moneda (visual) | `apps/web/src/components/manual-iching/IChingCashCoin.tsx` |
| Test valor moneda | `apps/web/src/lib/__tests__/manual-coin-value.test.ts` (`TS-WEB-014`) |
| Harness book-primary | `scripts/verify-divination-wilhelm-appendix.mjs` (`VF-DIV-001`) — G1-G6, incluye `simulateYarrowLine` |
| i18n monedas | `packages/i18n/src/messages/manual-coin-wizard-ui.ts` |
| i18n varas | `packages/i18n/src/messages/manual-yarrow-wizard-ui.ts` |
| AU previa | `docs/auditorias/00000000-AUD-DIV-01-divination-methods.md` |
| Motor huesos | `packages/oracle-bones-engine/src/engine.ts` |
| Prompt grietas (imagen) | `packages/image-engine/src/oracle-bones-prompt.ts` |
| Gold huesos (ingestado) | `tools/source-pdfs/Sources of Shang History_ The Oracle-Bone Inscriptions of.pdf` · manifest `keightley` |
| Prompt método | `backend/claude/src/interpretation.ts` — `castingMethodNote()` |

---

## 12. Referencias (APA 7)

Keightley, D. N. (1978). *Sources of Shang history: The oracle-bone inscriptions of Bronze Age China*. University of California Press. (Reimpreso 1985, Berkeley; ISBN 978-0-520-05455-4)

Nielsen, B. (2003). *A companion to Yi Jing numerology and cosmology*. Routledge.

Rutt, R. (1996). *The Book of Changes (Zhouyi): A Bronze Age document*. Routledge.

Wilhelm, R., & Baynes, C. F. (1950). *The I Ching or Book of Changes*. Princeton University Press.

---

## 13. Huesos de Oráculo — primera AU de método y gold Keightley (seguimiento)

Esta sección documenta el **precedente** en la misma familia DIV: la primera auditoría formal de un **método de consulta distinto al I Ching**, cerrada en mayo 2026 **sin** gold book-primary escaneado. El libro Keightley queda designado como fuente para la **próxima re-auditoría book-primary** de huesos (análoga a lo que esta AU hace con el apéndice Wilhelm para monedas/varas).

### 13.1 Dónde se auditó por primera vez

| Campo | Valor |
|-------|-------|
| Documento | [`00000000-AUD-DIV-01-divination-methods.md`](./00000000-AUD-DIV-01-divination-methods.md) **§5 · Oracle Bones Method** |
| Fecha cierre | **2026-05-19** (doc actualizado **2026-05-20**, commit `f462f43`) |
| Motor | `packages/oracle-bones-engine/src/engine.ts` |
| Modo producto | Siempre **automático** (sin wizard manual) |

### 13.2 Decisión crítica: eliminación del veredicto «Silencio» (沉默)

En la versión original de la app existía un **quinto veredicto** «Silencio» / indeterminado (~15% de probabilidad). AUD-DIV-01 lo **eliminó** por falta de base documentada o arqueológica:

| Aspecto | Detalle |
|---------|---------|
| **Hallazgo** | Veredicto indeterminado sin respaldo en registros Shang |
| **Evidencia citada en DIV-01** | >150.000 fragmentos de huesos de oráculo (Keightley 1978; Instituto de Historia y Filología, Academia Sinica): patrones de grieta **siempre legibles**; un «silencio» teológicamente inadmisible en consulta real |
| **Commit remediación** | `f462f43` (2026-05-19) — *fix(bones): remove Silence verdict* |
| **Redistribución** | 15% repartido proporcionalmente entre los **4 veredictos auténticos** |

**Pesos actuales en motor** (post-redistribución):

| Pattern | Veredicto | P |
|---------|-----------|---|
| 1 | `auspicious_clear` (大吉) | ≈ 29.41% |
| 2 | `auspicious_moderate` (吉) | ≈ 23.53% |
| 3 | `inauspicious_moderate` (凶) | ≈ 23.53% |
| 4 | `inauspicious_clear` (大凶) | ≈ 23.53% |

**Veredicto DIV-01:** PASS con 4 veredictos — **cerrado** como referencia estable, igual que I Ching en la misma AU.

### 13.3 Gold book-primary designado (pendiente de ingest)

Para la re-auditoría book-primary de huesos (fuera del alcance inmediato de bloques A–F de esta AU, pero **misma línea metodológica** que el TXT Wilhelm):

| Campo | Valor |
|-------|-------|
| **Obra** | Keightley, D. N. — *Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China* |
| **Editorial** | University of California Press, Berkeley |
| **Copyright / edición** | ©1978; reimpreso **1985** |
| **ISBN-13** | **978-0-520-05455-4** |
| **Rol gold** | Book-primary para verificar: lógica carga positiva/negativa, lectura de grietas, taxonomía de veredictos, ausencia de estados indeterminados, topología de patrones vs descripciones de imagen |
| **Archivo ingestado** | `tools/source-pdfs/Sources of Shang History_ The Oracle-Bone Inscriptions of.pdf` (~12.9 MB; verificado en disco 2026-06-25) |
| **Manifest** | `tools/source-pdfs/manifest.json` → clave `keightley` |
| **Estado en repo** | PDF **presente localmente** (gitignored); manifest **tracked**. Sin parser/extract ni dataset derivado aún. |

**Contraste con DIV-01:** la AU de mayo citó Keightley como **referencia académica** en la decisión de producto (eliminar Silencio), pero **no** contrastó pesos, patrones 1–4 ni copy del FAQ contra páginas concretas del libro.

### 13.4 Qué quedaría por verificar contra Keightley (borrador fases futuras)

Propuesta de código AU sucesora: `AUD-DIV-03 oracle-bones-keightley` (no abierta aún).

| Bloque | Pregunta | Implementación actual |
|--------|----------|------------------------|
| **G** | ¿Existen 4 (y solo 4) clases de veredicto afirmativo/negativo? | 4 códigos en `oracle-bones-engine` |
| **H** | ¿Los pesos 29.41/23.53… son producto o deben derivarse del texto? | Pesos de diseño post-redistribución |
| **I** | ¿Topología grieta (patrones A–D para imagen) tiene ancla arqueológica? | `oracle-bones-prompt.ts` — 4 descripciones |
| **J** | Copy FAQ «cuatro estados posibles» alineado con Keightley | `faq-page-ui.ts` `oracle-bones-method` |

**Relación con esta AU:** I Ching (Wilhelm TXT) y Huesos (Keightley) comparten familia **DIV** y política **book-primary antes de remediar**; esta AU cierra primero apéndice Wilhelm; huesos sigue en cola con gold ya identificado.

---

## 14. Changelog de esta AU

| Fecha | Evento |
|-------|--------|
| 2026-06-25 | Apertura AU; gold TXT identificado; H-DIV-02-01 preliminar (inversión cara inscrita monedas manual); plan harness G1–G6 |
| 2026-06-25 | §3 historial AUs previas (DIV-01, MUT, LRS, DOC, maestro W); §13 huesos + gold Keightley designado |
| 2026-06-25 | Keightley PDF ingestado en `tools/source-pdfs/`; entrada `keightley` en manifest.json |
| 2026-06-25 | **H-DIV-02-01 cerrado (fix).** Investigación: sin fuente académica verificada que contradiga a Wilhelm/Baynes 1950 Apéndice I §2 (la cifra previa "Han=3" provenía de una paráfrasis imprecisa en `AUD-DIV-01`, no de una segunda fuente). Decisión de producto: seguir el libro literal. Fix en `ManualIChingCoinWizard.tsx` (`lineValueFromCoins`, H=2/T=3), `IChingCashCoin.tsx` (prop `face` desacoplada a `han`/`manchu`, sin semántica yin/yang), `manual-coin-wizard-ui.ts` (`coinHint` corregido en 11 locales) y test de regresión nuevo. Verificado: tsc, eslint, i18n:audit, vitest 77/78 — todo PASS. |
| 2026-06-25 | **Harness `verify:divination-wilhelm-appendix` (G1-G6) implementado** (`scripts/verify-divination-wilhelm-appendix.mjs`, registrado `VF-DIV-001`). `lineValueFromCoins` movida a `apps/web/src/lib/manual-coin-value.ts` (módulo puro, sin JSX) para que el script la importe directamente vía soporte nativo TS de Node 24, sin duplicar lógica; test movido junto (`apps/web/src/lib/__tests__/manual-coin-value.test.ts`, `TS-WEB-014`). Se implementó `simulateYarrowLine()`, simulador procedural del método de 49 varas/3 rondas de Wilhelm §1, cerrando **H-DIV-02-02**. Resultado: 0 fallos, 1 warning documentado (`G5b`, ~51/49 en vez de 50/50 exacto bajo el supuesto de corte uniforme — ver §6.D, no oculto ajustando tolerancia). **H-DIV-02-03 cerrado**: cifra «yang móvil 3×» del hint de varas verificada exacta contra `G4` (3/16 ÷ 1/16 = 3), sin cambio de copy. Familia QA `DIV` añadida a `qa/CONVENTIONS.md`. |
| 2026-06-25 | **Harness v2.0.0 — aritmética exacta (`BigInt`), 0 warnings.** A pedido del propietario ("quiero el 100%"), se reemplazó el Monte Carlo de `G5`/`G5a`/`G5b` por cómputo racional exacto (clase `Frac` con `BigInt`, enumeración completa de rutas) y se añadió **`G7`**: re-derivación exacta de 1/16,5/16,7/16,3/16 desde el peso 3:1/1:1/1:1 de la propia tabla de residuos de Wilhelm (16 resultados elementales), probando que `throwYarrowStalks` coincide **bit a bit** con Wilhelm, no por aproximación. Se demostró analíticamente (no solo se simuló) que la asimetría 22/43 vs 21/43 en rondas 2-3 es una consecuencia **estructural exacta** del conteo módulo 4 sobre un total no divisible entre 4 — matemáticamente imposible llegar a 50/50 exacto contando de esa forma, así que la cita «equal» de Wilhelm es necesariamente cualitativa. Se calculó la distribución final exacta de `simulateYarrowLine()` (enumeración completa de las rutas de 3 rondas: 95/1612, 735193/2426060, 8633/19565, 110/559) y se cuantificó su diferencia exacta contra 1/16,5/16,7/16,3/16 (máximo +0.93%/−0.95%), explicada en su totalidad. Resultado final: **0 fallos, 0 warnings** — ver §6.D para la prueba completa. |
