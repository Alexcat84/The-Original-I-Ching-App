# Métodos de tirada I Ching vs apéndice Wilhelm (book-primary TXT)
**Código:** `20260625-AUD-DIV-02 wilhelm-appendix-casting-methods` · **Familia:** DIV · **Estado:** open

**Fecha apertura:** 2026-06-25  
**Auditoría anterior:** [`00000000-AUD-DIV-01 divination-methods`](./00000000-AUD-DIV-01-divination-methods.md) (cerrada 2026-05-19; referencia matemática general, **sin** gold TXT del apéndice Princeton)  
**Canal público `/audits`:** fuera de alcance (esta AU es algoritmo de tirada, no fidelidad de textos oraculares)

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

### 6.C Auto monedas — veredicto provisional: distribución OK; gold = combinatoria

| Criterio | Gold | App | Estado |
|----------|------|-----|--------|
| P(6), P(9) | 1/8 | `throwThreeCoins` | ✅ test MC |
| P(7), P(8) | 3/8 | idem | ✅ test MC |
| Reglas suma 6–9 | §2 | implícito en 2/3 | Pendiente gate determinista explícito en harness |

No existe «% en TXT» que contrastar; el gate es **derivación algebraica + MC**.

### 6.D Auto varas — veredicto provisional: distribución OK; procedural no simulado

| Criterio | Gold | App | Estado |
|----------|------|-----|--------|
| P(6)=1/16 … P(9)=3/16 | Matemática + §1 asimetría 5 vs 9 | `throwYarrowStalks` bucket 16 | ✅ test MC |
| Simulación 49 varas × 3 rondas | Procedimiento §1 | **No implementada** | ⚠️ **H-DIV-02-02 (MED)** |

La app **no** ejecuta el algoritmo de dividir/contar varas en auto; **muestrea** la distribución Zhou directamente. AUD-DIV-01 aceptó esto como equivalente estadístico; esta AU exige **demostración** (simulador procedural en harness) de equivalencia exacta, no solo MC del bucket.

### 6.E Paridad auto ↔ manual

| Criterio | Evidencia actual |
|----------|------------------|
| Mismos 6 valores → mismo `CastResult` | `engine.test.ts` — `performCastFromLineValues` vs `performCast` con rng fijo |
| `castingMethod` persistido | Campo en consulta; afecta nota en prompt Claude, no el hexagrama |

Pendiente: matriz explícita monedas manual vs auto y varas manual vs auto en harness.

---

## 7. Tabla de hallazgos (vivo)

| ID | Sev | Bloque | Hallazgo | Estado |
|----|-----|--------|----------|--------|
| H-DIV-02-01 | **HIGH** | B | Cara inscrita Han = yang(3) en UI vs Wilhelm inscrita = yin(2) | **Cerrado 2026-06-25** — sin alternativa documentada, se siguió el libro; ver §6.B |
| H-DIV-02-02 | MED | D | Auto varas no simula procedimiento físico; solo bucket 1/16 | **Abierto** — probar equivalencia |
| H-DIV-02-03 | LOW | F | Hint «yang móvil 3× más probable» (varas) es cualitativo; no cita % Wilhelm | **Abierto** — revisar copy |
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

### Fase 2 — Harness `verify:divination-wilhelm-appendix` (propuesto)

Ubicación propuesta: `scripts/verify-divination-wilhelm-appendix.mjs`  
Registro QA: `docs/qa/registry.json` (código propuesto `VF-DIV-002`)

| Gate | Tipo | Assert |
|------|------|--------|
| G1 | Determinista | `yarrowSumToLine` × 8 combinaciones = gold Wilhelm |
| G2 | Determinista | Combinatoria monedas 2³ = {6,7,8,9} con probs exactas |
| G3 | MC / exact | `throwThreeCoins` frecuencias ±ε |
| G4 | MC / exact | `throwYarrowStalks` frecuencias ±ε |
| G5 | Simulación | `simulateYarrowLine(rng)` procedural ≡ distribución G4 |
| G6 | Contraste | Documentar mapping UI Han/yin vs gold (expect **FAIL** hasta remediación) |

Comando npm propuesto: `npm run verify:divination-wilhelm-appendix`

### Fase 3 — Manual UI walkthrough

- [ ] Script o checklist: 6 líneas monedas + 6 líneas varas con capturas
- [ ] Contrastar copy 11 locales (`manual-*-wizard-ui.ts`) vs EN gold Wilhelm
- [ ] Verificar accesibilidad `headsAria` / `tailsAria` no contradice Wilhelm en EN/ES

### Fase 4 — Cierre

- [ ] Veredicto por bloque A–F
- [ ] Actualizar AUD-DIV-01 con enlace «superseded parcialmente por DIV-02» o merge
- [ ] Decisión producto H-DIV-02-01 (fix vs documentar convención alternativa)
- [ ] **No** publicar en `/audits` salvo decisión de producto explícita

---

## 9. Comandos reproducibles

```bash
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

1. Harness G1–G5 **PASS** (G6 documentado PASS/FAIL según decisión producto).
2. ~~Hallazgo H-DIV-02-01 resuelto~~ — **cerrado 2026-06-25**: sin alternativa académica verificada que contradiga a Wilhelm, se aplicó **fix** (no wontfix). Ver §6.B.
3. Simulador procedural varas demostrado ≡ `throwYarrowStalks` (cierra H-DIV-02-02).
4. Matriz manual/auto firmada en este documento.
5. Entrada `registry.json` + `INDEX.md` actualizadas; estado AU → `closed`.

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
| 2026-06-25 | **H-DIV-02-01 cerrado (fix).** Investigación: sin fuente académica verificada que contradiga a Wilhelm/Baynes 1950 Apéndice I §2 (la cifra previa "Han=3" provenía de una paráfrasis imprecisa en `AUD-DIV-01`, no de una segunda fuente). Decisión de producto: seguir el libro literal. Fix en `ManualIChingCoinWizard.tsx` (`lineValueFromCoins` exportado, H=2/T=3), `IChingCashCoin.tsx` (prop `face` desacoplada a `han`/`manchu`, sin semántica yin/yang), `manual-coin-wizard-ui.ts` (`coinHint` corregido en 11 locales) y test de regresión nuevo (`manual-iching-coin-wizard.test.ts`). Verificado: tsc, eslint, i18n:audit, vitest 77/78 — todo PASS. |
