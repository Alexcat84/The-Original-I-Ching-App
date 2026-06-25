# Auditoría de fidelidad — Reglas de mutación vs fuentes primarias
**Código:** `20260619-AUD-MUT-03 huang-rules-alignment` · **Familia:** MUT · **Estado:** closed


**App:** The Original I Ching · **Motor:** `packages/iching-engine/src/engine.ts` (HEAD `59ea728`)
**Fecha:** 19 jun 2026 · **Alcance:** las 10 reglas de selección de texto gobernante vs las fuentes primarias reales.
**Estado:** Auditado, verificado contra el código real, y **corregido** en el mismo commit que documenta esta auditoría.

---

## Veredicto en una línea

El motor implementa **el sistema de reducción de Alfred Huang** (*The Complete I Ching*), no un "marco base Zhu Xi" como afirmaba el FAQ antes de esta corrección. **9 de 10 reglas eran Alfred Huang exacto.** Había **una sola divergencia real** (la regla de 4 líneas) y **dos imprecisiones de texto** (un gloss interno y la atribución del FAQ). Ninguna rompía el funcionamiento, pero las tres eran corregibles y justo lo que un usuario versado podría señalar. Las tres quedan resueltas en esta misma auditoría.

---

## Metodología

No se auditó de memoria. Se leyó el código exacto y se verificó cada regla contra:
- **Alfred Huang**, *The Complete I Ching* — reglas confirmadas en tres fuentes independientes (russellcottrell.com/VirtualYarrowStalks, onlineclarity.co.uk, en.wikibooks.org/wiki/I_Ching/The_Moving_Line).
- **Zhu Xi (朱熹)**, *Yixue Qimeng* (易學啟蒙, 1186), cap. 4 — vía la traducción de Joseph Adler y la exposición de Yijing Dao (biroco.com), que es la referencia académica estándar en inglés.

---

## Las 10 reglas exactas (del código, antes de esta corrección)

| Caso | Regla (constante) | Qué leía el motor | Líneas |
|------|-------------------|--------------------|--------|
| 0 cambian | `NO_CHANGING` | Juicio del primario | L87, L182 |
| 1 cambia | `ONE_CHANGING` | La línea cambiante del primario | L88, L190 |
| 2 (yin+yang) | `TWO_YIN_YANG` | Solo la línea **yin** | L93, L199 |
| 2 (mismo tipo) | `TWO_SAME_LOWER` | Solo la **inferior** (`Math.min`) | L94, L210 |
| 3 | `THREE_MIDDLE` | La **central** por posición (`sort[1]`) | L96, L221 |
| 4 | `FOUR_LOWEST_STABLE` | La estable más **baja** del transformado (`Math.min`) | L97, L232 |
| 5 | `FIVE_ONLY_STABLE` | La única estable del transformado | L98, L245 |
| 6 (no Qian/Kun) | `SIX_ALL_CHANGING` | Juicio del transformado | L85, L257 |
| 6 (Qian) | `QIAN_ALL_NINE` | 用九 (séptimo yao) | L83, L265 |
| 6 (Kun) | `KUN_ALL_SIX` | 用六 (séptimo yao) | L84, L275 |

---

## Las dos fuentes primarias (verificadas)

### Alfred Huang — reglas de reducción (*The Complete I Ching*)
1. 2 móviles, una yin y una yang → leer **solo la yin**.
2. 2 móviles, ambas del mismo tipo → leer la **inferior**.
3. 3 móviles → leer **solo la del medio**.
4. 4 móviles → leer **solo la superior de las dos no móviles**.
5. 5 móviles → leer la **única no móvil**.
6. 6 móviles → leer el **Juicio del nuevo hexagrama** (salvo Qian y Kun).
7. Qian y Kun → séptimo yao: **用九 / 用六**.

### Zhu Xi — reglas de 變爻 (*Yixue Qimeng*, cap. 4)
1. 0 → Juicio del primario.
2. 1 → la línea cambiante (las líneas tienen precedencia sobre el Juicio).
3. 2 → leer **ambas**, la **superior** es la primaria.
4. 3 → **no usa textos de línea**: lee los **Juicios de ambos hexagramas**, con 32 diagramas para decidir cuál enfatizar (equivalente simple de Ed Hacker: si la línea inferior está entre las tres, prima el primario; si no, el transformado).
5. 4 → la **inferior** de las dos no móviles del transformado.
6. 5 → la única no móvil del transformado.
7. 6 → Juicio del transformado; Qian/Kun usan 用九/用六.

**Diferencia clave entre las dos fuentes:** en 2, 3 y 4 líneas, Huang y Zhu Xi NO coinciden. Huang reduce siempre a una línea; Zhu Xi para 2 lee ambas (superior primaria) y para 3 lee Juicios (no líneas). Y en 4 líneas se invierten: **Huang lee la superior, Zhu Xi lee la inferior.**

---

## Mapeo regla por regla (el corazón de la auditoría)

| Caso | App leía (antes) | Alfred Huang | Zhu Xi | Veredicto |
|------|-------------------|---------------|--------|-----------|
| 0 | Juicio primario | (Juicio) | Juicio | ✅ Fiel a ambos |
| 1 | La línea cambiante | (La línea) | La línea | ✅ Fiel a ambos |
| 2 yin+yang | **yin** | **yin** | ambas, superior | ✅ **Huang exacto** · diverge de Zhu Xi |
| 2 mismo tipo | **inferior** | **inferior** | ambas, superior | ✅ **Huang exacto** · diverge de Zhu Xi |
| 3 | **central** | **central** | Juicios + 32 diagramas | ✅ **Huang exacto** · diverge de Zhu Xi |
| 4 | **inferior** estable | **SUPERIOR** no móvil | inferior no móvil | ❌ **DIVERGÍA de Huang** · coincidía con Zhu Xi |
| 5 | única estable | única no móvil | única no móvil | ✅ Fiel a ambos |
| 6 no QK | Juicio transformado | Juicio nuevo gua | Juicio transformado | ✅ Fiel a ambos |
| 6 Qian | 用九 | 用九 | 用九 | ✅ Fiel a ambos |
| 6 Kun | 用六 | 用六 | 用六 | ✅ Fiel a ambos |

**Resultado (antes de la corrección): 9/10 reglas eran Alfred Huang exacto. La única excepción era la regla de 4 líneas, que divergía de Huang y seguía a Zhu Xi.**

---

## Hallazgos

### HALLAZGO 1 (el importante) — `FOUR_LOWEST_STABLE` contradecía a Huang
El motor seguía a Huang en todo menos en el caso de 4 líneas. Huang dice leer la **superior** de las dos no móviles; el código leía la **inferior** (`Math.min(...stable)`, L235). Esa elección coincidía con Zhu Xi, no con Huang. Como las otras 9 reglas son Huang puro, esto era una **inconsistencia interna**: o un cambio deliberado (preferir Zhu Xi solo ahí) o un bug (se quiso Huang y se implementó al revés).

**Decisión tomada:** Huang puro. Se cambió `Math.min(...stable)` → `Math.max(...stable)` en `packages/iching-engine/src/engine.ts` (caso `FOUR_LOWEST_STABLE`), de modo que ahora lee la línea estable **superior** del transformado. El nombre interno de la constante (`FOUR_LOWEST_STABLE`) se mantiene sin renombrar para no abrir un blast radius amplio justo antes del lanzamiento — queda documentado con un comentario en el propio código, y es el punto exacto donde un futuro selector Huang/Zhu Xi tendría que ramificar.

### HALLAZGO 2 — gloss inexacto en `THREE_MIDDLE`
El `ruleExplanation` decía *"Línea central. Ambos juicios igual peso."* La segunda frase era incorrecta: bajo Huang se lee **la línea central**, no "ambos juicios". El "ambos juicios igual peso" era un eco del método de Zhu Xi (que sí usa juicios, pero con 32 diagramas para enfatizar uno, nunca "igual peso"). No correspondía ni a Huang ni a Zhu Xi.

**Corregido:** el gloss ahora dice *"Tres mutaciones. Solo se lee la línea central (pos N)."*

### HALLAZGO 3 — el FAQ atribuía la base a Zhu Xi; en realidad es Huang
El FAQ (`faq-page-ui.ts`, entradas EN/ES `iching-mutation-rules` e `iching-how-answers`) decía *"El marco base es Zhu Xi... para los casos que su regla dejaba a varios textos, la app aplica reducciones de maestros modernos."* La verificación muestra lo contrario: **la base operativa es Alfred Huang** (9/10 reglas, 10/10 tras esta corrección), y Zhu Xi solo aparecía como antecedente clásico de la estructura.

Además, el FAQ atribuía la regla de 3 líneas a *"la reducción de la línea mediana (Sherrill & Chu)"*. En rigor, "3 móviles → la del medio" es **una regla explícita de Alfred Huang**, no solo de Sherrill & Chu.

**Corregido (EN + ES):** se reescribió el Q&A de `iching-mutation-rules` para posicionar a Alfred Huang como sistema base (con cita explícita a *The Complete I Ching*) y Zhu Xi como antecedente clásico de la estructura. Se corrigió el caso de 4 líneas (ahora dice "superior"), se atribuyó bien la regla de 3 (Huang), se añadió la atribución de la de 2-mismo-tipo, y se ajustaron las menciones incidentales de "reglas de Zhu Xi" en `iching-how-answers` y en la pregunta de métodos de tirada (monedas/varillas).

---

## Propagación i18n — completada

El texto autoritativo (EN + ES) corregido en `faq-page-ui.ts` se propagó a los otros 9 locales del FAQ (PT, FR, DE, IT, JA, ZH, KO, AR, HI): las tres entradas `yarrow-vs-coins`, `iching-how-answers` e `iching-mutation-rules` ya no atribuyen la base de reglas a Zhu Xi en ningún idioma — cada locale fue reescrito espejando la estructura EN/ES (Alfred Huang como sistema base citado de *The Complete I Ching*, Zhu Xi como antecedente clásico de la estructura, caso de 4 líneas corregido a "superior" en los 9 idiomas).

`guia-page-ui.ts` también se corrigió en los 11 locales (es, en, pt, fr, de, it, ja, zh, ko, ar, hi): los campos `ichingPracticalBody`, `ichingTraditionNote` e `ichingCastModeP1` ya no describen "reglas clásicas de Zhu Xi" como base operativa — ahora atribuyen el sistema a Alfred Huang con Zhu Xi como antecedente histórico de la estructura.

Verificado con `npx tsc --noEmit` en `packages/i18n` (sin errores) tras todas las ediciones.

Los rótulos cortos de `iching-mutation-ui.ts` (`FOUR_LOWEST_STABLE`, el único campo afectado por el cambio de regla) **ya se habían actualizado en los 11 locales** en el commit original de esta auditoría (inferior→superior / lowest→highest y equivalentes nativos en JA/ZH/KO/AR/HI).

---

## Conclusión honesta (sin sorpresas)

No existe "el método ortodoxo único" del I Ching para líneas múltiples: hay al menos dos sistemas mayores en tensión (Zhu Xi, que lee varios textos; Huang, que reduce a uno), más la práctica antigua del Zuozhuan que nunca leía más de una línea. Esta app eligió **un sistema de reducción coherente y nombrado: el de Alfred Huang.** Tras esta corrección, el motor queda **10/10 fiel a Alfred Huang**, y el texto al usuario lo narra con precisión en los **11 locales** de `faq-page-ui.ts` y `guia-page-ui.ts`.
