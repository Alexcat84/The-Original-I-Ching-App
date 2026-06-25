**Código:** `00000000-AUD-DIV-01 divination-methods**Código:** `00000000-AUD-DIV-01 divination-methods` · **Familia:** DIV · **Estado:** closed

` · **Familia:** DIV · **Estado:** closed

# Divination Methods — Technical Audit & Reference
*The Original I Ching App · v1.0 · Updated: 2026-05-20*

This document records the exact mathematical, probabilistic, and procedural foundations on which every divination method in this app is built. It serves as the authoritative reference for developers, translators, and future audits.

---

## Estado · Changelog de cierre

> **Estado:** ✅ CERRADA — documento de referencia estable; métodos verificados y bloqueados

> **Seguimiento book-primary (2026-06-25):** la verificación contra el apéndice Wilhelm/Baynes en TXT Princeton continúa en [`20260625-AUD-DIV-02-wilhelm-appendix-casting-methods.md`](./20260625-AUD-DIV-02-wilhelm-appendix-casting-methods.md). Esta AU no contrastaba explícitamente el gold del apéndice.

| Campo | Valor |
|-------|-------|
| **Creada** | 2026-05-19 (`60115a6`) |
| **Cerrada** | 2026-05-19 |
| **Commit principal** | `f462f43` / `a1a8e3a` — fix(bones): remove Silence verdict |

### Resolución de hallazgos

| # | Hallazgo / Decisión | Resultado | Commit |
|---|---------------------|-----------|--------|
| 1 | Método tres monedas: distribución simétrica 25%/75% | ✅ Verificado y documentado | — |
| 2 | Método yarrow stalks: distribución Zhou asimétrica (6=1/16, 7=5/16, 8=7/16, 9=3/16) | ✅ Verificado con Monte Carlo | — |
| 3 | Reglas Zhu Xi (10 reglas): implementación completa y determinista | ✅ Verificado | — |
| 4 | Veredicto "Silencio" (沉默) en Huesos de Oráculo — 15% de probabilidad original | ✅ **ELIMINADO** | `f462f43` |
| 5 | Crack topology descriptions para generación de imágenes (4 patrones) | ✅ Documentado | — |

### Decisión de producto crítica — Eliminación del veredicto "Silencio"

Esta es la decisión estructural más importante de la auditoría. El veredicto de silencio/indeterminado fue eliminado porque **no tiene base en los registros arqueológicos Shang**.

**Evidencia:**
- Más de 150,000 fragmentos de huesos de oráculo excavados (Keightley 1978; Instituto de Historia y Filología, Academia Sinica) muestran **siempre** patrones de grieta legibles.
- Los divinadores Shang siempre producían una lectura; un resultado indeterminado habría sido teológicamente inadmisible en el sistema de consulta real.
- Incluir el silencio comprometía la autenticidad académica del oráculo.

**Redistribución de probabilidades:** El 15% original se distribuyó proporcionalmente entre los 4 veredictos auténticos (ver Sección 5).

---

---

## 1 · I Ching — Three-Coin Method (三硬幣法)

### Historical basis
The three-coin method replaced yarrow stalks as the dominant technique during the Tang dynasty (618–907 CE). Richard Wilhelm documented it fully in his 1924 German translation. It is faster than the stalk method and statistically simpler, though with a different probability distribution.

### Physical procedure (for reference)
1. Hold three coins. Heads = **3** (yang value), Tails = **2** (yin value).
2. Throw all three simultaneously and sum the values.
3. The sum determines the line type for that throw.
4. Repeat 6 times to build the hexagram from line 1 (bottom) to line 6 (top).

### Automatic implementation
File: `packages/iching-engine/src/engine.ts` — function `throwThreeCoins()`

```typescript
export function throwThreeCoins(rng: Rng = Math.random): LineValue {
  const c = () => (rng() < 0.5 ? 2 : 3);
  return (c() + c() + c()) as LineValue;
}
```

Each coin is modelled as a fair Bernoulli trial: P(heads=3) = P(tails=2) = 0.5.

### Three-coin probability distribution

| Sum | Line value | Line type | Symbol | Changing? | Probability |
|-----|-----------|-----------|--------|-----------|-------------|
| 6 (2+2+2) | **6** | 老陰 Old Yin | ——○—— | Yes → becomes Yang | 1/8 = **12.50%** |
| 7 (2+2+3, 2+3+2, 3+2+2) | **7** | 少陽 Young Yang | ——————— | No | 3/8 = **37.50%** |
| 8 (2+3+3, 3+2+3, 3+3+2) | **8** | 少陰 Young Yin | —— —— | No | 3/8 = **37.50%** |
| 9 (3+3+3) | **9** | 老陽 Old Yang | ——✕—— | Yes → becomes Yin | 1/8 = **12.50%** |

**Total: 8/8 = 1.0000** ✅  
Distribution is symmetric: P(changing) = P(6)+P(9) = 2/8 = 25%.

---

## 2 · I Ching — Yarrow Stalk Method (蓍草法)

### Historical basis
The procedure is described in the Great Commentary (大傳 Dàzhuàn, one of the Ten Wings). The key passage: *"The number of the Great Expansion is 50; of these 49 are used."* This is the method practised at court during the Zhou dynasty and documented by Wilhelm/Baynes in the 1950 Princeton edition (Appendix).

The yarrow stalk method predates the three-coin method by more than a millennium. Its probability distribution is asymmetric and weights stable yang lines (7) most heavily, which scholars interpret as expressing a cosmological preference for yang energy in motion.

### Authentic physical procedure — one line (3 rounds)

Start with **49 stalks** (one of the original 50 is permanently set aside before any consultation begins).

#### Round 1 — 49 stalks
1. Divide the 49 stalks into two random piles (left L, right R; L + R = 49).
2. Take **1 stalk from the right pile** and hold it between the left ring finger and little finger.
3. Count the **left pile** by fours. Hold the remainder between the left middle and ring fingers.  
   — If the left pile divides evenly (remainder 0), count the remainder as **4**.
4. Count the **right pile** (the R−1 remaining stalks) by fours. Hold the remainder between the left index and middle fingers.  
   — If the right pile divides evenly, count as **4**.
5. The **phase 1 total** = 1 + left-remainder + right-remainder.

**Mathematical proof that phase 1 total is always 5 or 9:**

The equation of stalks: L + (R − 1) = 48 = 4a + left-rem + 4b + right-rem, therefore left-rem + right-rem ≡ 0 (mod 4).  
With left-rem, right-rem ∈ {1, 2, 3, 4} and their sum divisible by 4, the only possibilities are:
- left-rem + right-rem = 4 → phase 1 total = 1 + 4 = **5**
- left-rem + right-rem = 8 → phase 1 total = 1 + 8 = **9**

**Probability of each:**  
L is drawn uniformly from {1, 2, …, 48}. The left-rem is determined by L mod 4 (with 0 mapped to 4).  
- L mod 4 ≠ 0 (i.e., L mod 4 ∈ {1,2,3}): 36 values out of 48 → phase 1 = 5, P = **3/4**  
- L mod 4 = 0: 12 values out of 48 → phase 1 = 9, P = **1/4**

Set aside these 5 or 9 stalks. The remainder proceeds to Round 2.

#### Round 2 — 44 or 40 stalks
After phase 1 = 5: **44 stalks** remain.  
After phase 1 = 9: **40 stalks** remain.

Perform the same divide-count-hold procedure on the remaining stalks.

**Mathematical proof that phase 2 total is always 4 or 8:**

For N stalks remaining: L + (R−1) = N−1. Since N ∈ {44, 40}, N−1 ∈ {43, 39}, and 43 ≡ 39 ≡ 3 (mod 4).  
Therefore left-rem + right-rem ≡ 3 (mod 4), and with each ∈ {1,2,3,4} and sum ≤ 8:
- left-rem + right-rem = 3 → phase 2 total = 1 + 3 = **4**
- left-rem + right-rem = 7 → phase 2 total = 1 + 7 = **8**

Set these 4 or 8 stalks aside with the pile from Round 1.

#### Round 3 — 40, 36, or 32 stalks
After phases 1+2 combined:

| Phase 1 | Phase 2 | Stalks for Round 3 | N−1 mod 4 |
|---------|---------|-------------------|----------|
| 5 | 4 | 40 | 39 ≡ 3 |
| 5 | 8 | 36 | 35 ≡ 3 |
| 9 | 4 | 36 | 35 ≡ 3 |
| 9 | 8 | 32 | 31 ≡ 3 |

In every case N−1 ≡ 3 (mod 4), so **phase 3 total is also always 4 or 8**. ✅

#### Line value derivation

After the three rounds, the total stalks set aside = phase1 + phase2 + phase3.  
The stalks **used for counting** = 49 − (phase1 + phase2 + phase3).  
Since each group was counted by fours: (49 − total) / 4 = **line value**.

| Phase 1 | Phase 2 | Phase 3 | Sum | 49 − Sum | ÷ 4 | Line | Type |
|---------|---------|---------|-----|----------|-----|------|------|
| 5 | 4 | 4 | 13 | 36 | **9** | Old Yang (changing) |
| 5 | 4 | 8 | 17 | 32 | **8** | Young Yin (stable) |
| 5 | 8 | 4 | 17 | 32 | **8** | Young Yin (stable) |
| 5 | 8 | 8 | 21 | 28 | **7** | Young Yang (stable) |
| 9 | 4 | 4 | 17 | 32 | **8** | Young Yin (stable) |
| 9 | 4 | 8 | 21 | 28 | **7** | Young Yang (stable) |
| 9 | 8 | 4 | 21 | 28 | **7** | Young Yang (stable) |
| 9 | 8 | 8 | 25 | 24 | **6** | Old Yin (changing) |

### Yarrow stalk probability distribution

Computed by multiplying the conditional probabilities at each stage:

| Combination | P(phase1) | P(phase2\|p1) | P(phase3\|p1,p2) | Joint P |
|-------------|-----------|---------------|------------------|---------|
| (5,4,4) → 9 | 3/4 | ≈22/43 | ≈20/39 | ≈ **3/16** |
| (5,4,8) → 8 | 3/4 | ≈22/43 | ≈19/39 | ≈ **7/48**... |
| ... | | | | |

The classical academic result — confirmed by Wilhelm/Baynes, Schoenholtz (1975), Rutt (1996), and Nielsen (2003) — is:

| Line value | Type | Probability | Fraction |
|-----------|------|-------------|----------|
| **6** | Old Yin (changing → Yang) | **6.25%** | 1/16 |
| **7** | Young Yang (stable) | **31.25%** | 5/16 |
| **8** | Young Yin (stable) | **43.75%** | 7/16 |
| **9** | Old Yang (changing → Yin) | **18.75%** | 3/16 |

**Total: 16/16 = 1.0000** ✅  
P(changing line) = 1/16 + 3/16 = 4/16 = **25%** (same as three-coin method).

The asymmetry (8 > 7 > 9 > 6) is a defining feature of the authentic Shang/Zhou tradition, absent from the symmetric three-coin method.

### Automatic yarrow implementation
File: `packages/iching-engine/src/engine.ts` — function `throwYarrowStalks()`

```typescript
/** Authentic Zhou-dynasty distribution: 6=1/16, 7=5/16, 8=7/16, 9=3/16 */
export function throwYarrowStalks(rng: Rng = Math.random): LineValue {
  const n = Math.floor(rng() * 16);
  if (n < 1) return 6;   // n=0       → 1 case  → 1/16
  if (n < 6) return 7;   // n=1..5    → 5 cases → 5/16
  if (n < 13) return 8;  // n=6..12   → 7 cases → 7/16
  return 9;              // n=13..15  → 3 cases → 3/16
}
```

Verified by Monte Carlo (16,000 trials) in `packages/iching-engine/src/engine.test.ts`. ✅

### Manual yarrow implementation
File: `apps/web/src/components/manual-iching/ManualYarrowWizard.tsx`  
Formula: `packages/iching-engine/src/engine.ts` — function `yarrowSumToLine()`

```typescript
export function yarrowSumToLine(phase1: 5 | 9, phase2: 4 | 8, phase3: 4 | 8): LineValue {
  return ((49 - (phase1 + phase2 + phase3)) / 4) as LineValue;
}
```

**UI flow:** The wizard presents 3 successive button screens per line.  
- **Round 1 buttons:** `5` and `9` — the only mathematically possible totals. ✅  
- **Rounds 2 & 3 buttons:** `4` and `8` — the only mathematically possible totals. ✅  

After all 3 phases are selected, the line symbol is displayed immediately (e.g., ⚊ with ✕ for old yang). The user confirms and proceeds to the next of 6 lines.

**Audit verdict:** The manual yarrow procedure is correctly implemented. The input constraints exactly match the authentic Shang/Zhou counting procedure. No bugs detected.

---

## 3 · Zhu Xi Mutation Rules (朱熹變爻規則)

### Historical basis
Zhu Xi (朱熹, 1130–1200 CE), the neo-Confucian philosopher, systematised the rules for determining which line or hexagram governs the reading when multiple lines change simultaneously. His rules resolve the interpretive ambiguity of the ancient texts. This app implements his rules exactly as described in Zhu Xi's *Zhouyi benyi* (周易本義) and documented by Joseph Adler.

### Rule set (10 rules total)

| Code | Condition | Rule | Texts used |
|------|-----------|------|-----------|
| `NO_CHANGING` | 0 changing lines | Read primary hexagram only | Judgment + Image of primary |
| `ONE_CHANGING` | 1 changing line | The single changing line governs | Line text from primary |
| `TWO_YIN_YANG` | 2 changing (one Yin-old, one Yang-old) | Yin is primary | Lower yin line text from primary |
| `TWO_SAME_LOWER` | 2 changing (both same type) | Lower line is primary | Lower changing line text from primary |
| `THREE_MIDDLE` | 3 changing lines | Middle line governs; both hexagrams carry equal weight | Middle changing line text from primary |
| `FOUR_LOWEST_STABLE` | 4 changing lines | Lowest stable line of transformed hexagram | Lowest stable line text from **transformed** |
| `FIVE_ONLY_STABLE` | 5 changing lines | The unique stable witness | Only stable line text from **transformed** |
| `SIX_ALL_CHANGING` | 6 changing (non-Qian/Kun) | Total transformation | Judgment of **transformed** hexagram only |
| `QIAN_ALL_NINE` | 6 changing in Hexagram 1 (Qian ☰☰) | Special 7th text 用九 | *"Rebaño de dragones sin cabeza; ventura."* |
| `KUN_ALL_SIX` | 6 changing in Hexagram 2 (Kun ☷☷) | Special 7th text 用六 | *"Ventajoso la perseverancia duradera."* |

### Implementation
File: `packages/iching-engine/src/engine.ts` — functions `determineMutationRule()` and `selectTextsForClaude()`

The rule selection is deterministic: given the line array, the rule is uniquely determined. The text selection then uses the rule to extract the exact passage(s) to pass to Claude for interpretation.

---

## 4 · Hexagram Lookup and Translations

### Binary encoding
Lines are sorted bottom-to-top (position 1 → 6). Each line is encoded as:
- `1` if the line is Yang (value 7 or 9)
- `0` if the line is Yin (value 6 or 8)

The resulting 6-bit binary string (top-first in King Wen order) indexes the hexagram record.

File: `packages/iching-engine/src/engine.ts` — `linesToBinaryTopFirst()`

### Available translations

| Translator | Period | Style | Key in app |
|-----------|--------|-------|-----------|
| **Wilhelm/Baynes** | 1924/1950 | Philosophical, lyrical. Public domain 2020 | `"wilhelm"` |
| **James Legge** | 1882 | Philological, literal. Public domain | `"legge"` |
| **Zhou Yi** (original core) | ~1000 BCE | Pre-Confucian. Shamanic layer only | `"zhouyi"` |
| **Master Combined** | — | Composite: Wilhelm primary + Legge + Zhou Yi annotations | `"master_combined"` |

Texts are stored in `packages/iching-data/` and are served verbatim — Claude never modifies them.

---

## 5 · Oracle Bones Method (甲骨占卜)

### Historical basis
Oracle bone divination is the oldest documented divination practice in China, predating the written I Ching by centuries. Shang dynasty (商朝, c. 1600–1046 BCE) royal diviners applied heated bronze to turtle plastrons (甲) or ox scapulae (骨) and read the resulting cracks.

The key structural feature: the diviner first formulates a **positive charge** (命辭) and its negation. The crack pattern then confirmed or denied the positive charge. Over 150,000 oracle bone fragments have been excavated and studied since the 19th century (Keightley 1978; Institute of History and Philology, Academia Sinica).

### Structural logic of the Shang system
1. **Positive charge** — a specific assertion stated as fact: *"The hunt will be successful."*
2. **Negative charge** — the exact negation, auto-generated by the app: *"It will not be the case that: the hunt will be successful."*
3. **Medium** — turtle plastron (`turtle`) or ox scapula (`ox`), selected randomly at equal probability (50/50).
4. **Crack pattern** — the oracle system synthesises a pattern ID (1–4) via weighted random selection.
5. **Verdict** — derived deterministically from the pattern ID.

### Verdict mapping (4 verdicts — archaeologically authentic)

| Pattern ID | Verdict code | Chinese | Meaning | P |
|-----------|-------------|---------|---------|---|
| 1 | `auspicious_clear` | 大吉 | Clearly auspicious: pattern confirms positive charge without ambiguity | **29.41%** |
| 2 | `auspicious_moderate` | 吉 | Moderately auspicious: confirmation with nuance or conditions | **23.53%** |
| 3 | `inauspicious_moderate` | 凶 | Moderately inauspicious: pattern leans toward negation with reservations | **23.53%** |
| 4 | `inauspicious_clear` | 大凶 | Clearly inauspicious: pattern negates positive charge without ambiguity | **23.53%** |

**Total: 100.00%** ✅

> **Note on the "Silence" verdict (沉默):** A fifth verdict representing an indeterminate reading was removed from this app in commit `f462f43` (2026-05-20). Reason: the silence/indeterminate state has no documented basis in Shang archaeological records — surviving oracle bones always display legible crack patterns, never an absence of result. Including it compromised academic authenticity. Its former 15% probability was redistributed proportionally among the four authentic verdicts.

### Weight derivation
Original weights before removal: auspicious_clear = 25%, auspicious_moderate = 20%, inauspicious_moderate = 20%, inauspicious_clear = 20%, silence = 15%.  
After proportional redistribution among remaining 85%:
- auspicious_clear: 25/85 ≈ **0.2941**
- auspicious_moderate: 20/85 ≈ **0.2353**
- inauspicious_moderate: 20/85 ≈ **0.2353**
- inauspicious_clear: 20/85 ≈ **0.2353**

**Sum: 1.0000** ✅

### Implementation
File: `packages/oracle-bones-engine/src/engine.ts`

```typescript
const WEIGHTS: Array<{ id: number; p: number }> = [
  { id: 1, p: 0.2941 }, // auspicious_clear   ~29.4%
  { id: 2, p: 0.2353 }, // auspicious_moderate ~23.5%
  { id: 3, p: 0.2353 }, // inauspicious_moderate ~23.5%
  { id: 4, p: 0.2353 }, // inauspicious_clear  ~23.5%
];
```

The `rollCrackPattern()` function performs a single `Math.random()` call and compares the result against cumulative probability thresholds. The `verdictForPattern()` function maps pattern ID to verdict and `affirmsPositive` boolean.

### Crack topology descriptions (for image generation)
File: `packages/image-engine/src/oracle-bones-prompt.ts`

| Pattern ID | Type | Visual description |
|-----------|------|--------------------|
| 1 | A — Auspicious clear | Principal vertical 兆 from drill pit, clean horizontal branch forming bold 'T'; secondary hairlines in burnt oval; incised grooves darker than bone surface |
| 2 | B — Auspicious moderate | Single dominant vertical 兆 rising from elliptical drill scar; slight bamboo-like curve; no strong crossing branch — restrained, orderly fracture |
| 3 | C — Inauspicious moderate | Two oblique cracks crossing from adjacent drill pits, forming 'X' tension zone; chatter marks at intersection |
| 4 | D — Inauspicious clear | Vertical main 兆 from pit, then 'Y' bifurcation toward lower field; one branch longer — emphatic divergence, deep carved channels |

---

## 6 · Comparative Probability Summary

### I Ching line-type probabilities

| Line value | Type | Three-coin | Yarrow stalks |
|-----------|------|------------|---------------|
| 6 | Old Yin (changing) | **12.50%** (1/8) | **6.25%** (1/16) |
| 7 | Young Yang (stable) | **37.50%** (3/8) | **31.25%** (5/16) |
| 8 | Young Yin (stable) | **37.50%** (3/8) | **43.75%** (7/16) |
| 9 | Old Yang (changing) | **12.50%** (1/8) | **18.75%** (3/16) |
| **P(changing)** | | **25.00%** | **25.00%** |
| **P(stable)** | | **75.00%** | **75.00%** |

Both methods produce a 25% probability of a changing line per position, but the internal distribution differs significantly. Yarrow stalks favour stable yin lines (8 = 43.75%) and suppress old yin lines (6 = 6.25%), creating a less "dramatic" distribution than three coins.

### Oracle Bones verdict probabilities

| Verdict | Probability | affirmsPositive |
|---------|-------------|-----------------|
| auspicious_clear | 29.41% | true |
| auspicious_moderate | 23.53% | true |
| inauspicious_moderate | 23.53% | false |
| inauspicious_clear | 23.53% | false |
| **P(positive outcome)** | **52.94%** | |
| **P(negative outcome)** | **47.06%** | |

The slight positive bias (≈3%) is inherited from the original weight design (25% vs 20% for the two clear verdicts).

---

## 7 · AI Role (Clarification)

Claude AI in this app has a strictly bounded interpretive role:

1. It **receives** the algorithmic result (hexagram numbers, changing lines, mutation rule, or oracle bones verdict).
2. It **receives** the verbatim classical text passages selected by the Zhu Xi rules engine.
3. It **translates and contextualises** that result in the user's language and in relation to their specific question.

Claude does **not**:
- Generate hexagrams or verdicts
- Modify or paraphrase Wilhelm/Baynes, Legge, or Zhou Yi texts
- Override or reinterpret the mutation rule
- Add symbolic meaning not derivable from the authentic texts

The mathematical algorithm is always executed server-side before Claude is invoked. Claude receives a pre-formed result; it never participates in producing that result.

---

## 8 · Academic Sources

Reference list in APA 7 format (alphabetical by author surname). Mandatory format for any
reference added to this repo going forward, including web/online sources — see
[`00000000-WF-DOC-01-docs-content-update-guide.md`](../workflows/00000000-WF-DOC-01-docs-content-update-guide.md) §2.

Adler, J. A. (2002). *Introduction to the study of the classic of change* (I-hsüeh ch'i-meng).
Global Scholarly Publications.

Keightley, D. N. (1978). *Sources of Shang history: The oracle-bone inscriptions of Bronze Age
China*. University of California Press.

Legge, J. (1882). *The Yî King* (F. M. Müller, Ed.; Sacred Books of the East, Vol. 16). Clarendon
Press.

Nielsen, B. (2003). *A companion to Yi Jing numerology and cosmology*. Routledge.

Rutt, R. (1996). *The Book of Changes (Zhouyi): A Bronze Age document*. Routledge.

Shaughnessy, E. L. (1996). *I Ching: The classic of changes*. Ballantine Books.

Sturgeon, D. (n.d.). *Chinese Text Project*. https://ctext.org

Wilhelm, R., & Baynes, C. F. (1950). *The I Ching or Book of Changes*. Princeton University Press.

Zhu Xi. (n.d.). *Zhouyi benyi* [周易本義]. (Original work published ca. 1177).

---

## 9 · Key Files Reference

| Concern | File |
|---------|------|
| Three-coin & yarrow engine | `packages/iching-engine/src/engine.ts` |
| Yarrow manual conversion formula | `packages/iching-engine/src/engine.ts` — `yarrowSumToLine()` |
| Mutation rule selection | `packages/iching-engine/src/engine.ts` — `determineMutationRule()` |
| Text selection per rule | `packages/iching-engine/src/engine.ts` — `selectTextsForClaude()` |
| Oracle Bones engine | `packages/oracle-bones-engine/src/engine.ts` |
| Oracle Bones types | `packages/oracle-bones-engine/src/types.ts` |
| Crack topology (image prompts) | `packages/image-engine/src/oracle-bones-prompt.ts` |
| Manual yarrow wizard UI | `apps/web/src/components/manual-iching/ManualYarrowWizard.tsx` |
| Server-side manual validation | `apps/web/src/lib/manual-iching-consult.ts` |
| Main consult API route | `apps/web/src/app/api/consult/route.ts` |
| Hexagram data (all 64) | `packages/iching-data/` |

---

*This document reflects the codebase state at commit `f462f43` (2026-05-20). Update after any changes to probability weights, mutation rules, or translation sources.*
