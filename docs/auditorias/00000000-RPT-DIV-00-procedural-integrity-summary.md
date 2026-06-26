# Procedural Integrity Summary (casting methods + changing-line rules)

**Código:** `00000000-RPT-DIV-00 procedural-integrity-summary` · **Familia:** DIV · **Estado:** reference

This document is the procedural counterpart to
[`00000000-RPT-DAT-FID-00-data-integrity-summary.md`](./00000000-RPT-DAT-FID-00-data-integrity-summary.md)
(textual fidelity of the oracle's source texts). That document tracks *what the
oracle says* against named editions; this one tracks *how a reading is cast* —
the coin and yarrow-stalk procedures, and the changing-line reduction rules —
against the same kind of named, citable sources, one source of truth per
method/author, each cross-referenced to the test or gate that verifies it.

**Master audit (open plan and full proofs):**
[`20260625-AUD-DIV-02-wilhelm-appendix-casting-methods.md`](./20260625-AUD-DIV-02-wilhelm-appendix-casting-methods.md)
— this summary is the index; that document has the derivations.

---

## How to read this document

For each method/author below:

| Field | Meaning |
|-------|---------|
| **Gold** | The named source (APA 7) the procedure or rule is verified against |
| **Scope** | Exactly what was checked (not the whole book — the specific procedural claims) |
| **Result** | The verified outcome, exact where exactness is possible |
| **Tests** | `docs/qa/registry.json` codes that gate this in CI/local verification |
| **Audit** | The `docs/auditorias/` document with the full derivation/evidence |

---

## 1. Coin oracle (three-coin method)

| Field | Detail |
|-------|--------|
| **Gold** | Wilhelm, R., & Baynes, C. F. (1950). *The I Ching or Book of Changes* (Bollingen Series XIX). Princeton University Press. — Appendix I §2, "The Coin Oracle." Local extract: `tools/source-pdfs/The I Ching or Book of Changes - Wilhelm-Appendix.txt` (lines 77–88). |
| **Scope** | Value assignment (inscribed face = yin = 2, reverse face = yang = 3) and the resulting 6/7/8/9 composition rule for both auto (`throwThreeCoins`) and manual (`lineValueFromCoins`, wizard) casting. |
| **Result** | **Exact, 100% match — no modeling ambiguity.** Each coin is an independent fair 2-sided event; the 1/8, 3/8, 3/8, 1/8 distribution is closed-form combinatorics, not an approximation. The manual wizard's Han (inscribed) = yin = 2 / Manchu (reverse) = yang = 3 mapping was inverted until 2026-06-25 (`H-DIV-02-01`) — fixed and now matches Wilhelm literally. |
| **Tests** | `VF-DIV-001 divination-wilhelm-appendix` (gates `G2`, `G3`, `G6`) · `TS-WEB-014 manual-coin-value` |
| **Audit** | `20260625-AUD-DIV-02-wilhelm-appendix-casting-methods.md` §6.B (manual, `H-DIV-02-01`), §6.C (auto) |

```bash
npm run verify:divination-wilhelm-appendix   # G2, G3, G6
npm run test --prefix apps/web -- manual-coin-value
```

---

## 2. Yarrow-stalk oracle

| Field | Detail |
|-------|--------|
| **Gold** | Wilhelm, R., & Baynes, C. F. (1950). *The I Ching or Book of Changes* (Bollingen Series XIX). Princeton University Press. — Appendix I §1, "The Yarrow-Stalk Oracle." Local extract: `tools/source-pdfs/The I Ching or Book of Changes - Wilhelm-Appendix.txt` (lines 13–75). |
| **Scope** | Residue-to-line mapping (`yarrowSumToLine`, both auto and manual), and whether the engine's hardcoded 1/16, 5/16, 7/16, 3/16 distribution (`throwYarrowStalks`) is a faithful reading of Wilhelm's residue-tuple table. |
| **Result** | **Exact, 100% match against the table — by construction, not approximation.** Wilhelm's own residue-tuple multiplicities (1 tuple for line 9, 1 for line 6, 3 each for lines 7/8) encode a 4×2×2 = 16 equally-weighted elementary-outcome derivation; `G7` reconstructs that exact weighting with `BigInt` rational arithmetic and confirms it reproduces 1/16, 5/16, 7/16, 3/16 bit for bit. **Independently**, a literal procedural simulator (`simulateYarrowLine`, the actual 49-stalk / 3-round divide-count-remainder mechanism) was built and proven exact under one explicit, stated modeling assumption (heap divides at a uniformly random point — Wilhelm describes the actions, not an RNG model). That simulation's exact final distribution differs from the classical figures by at most 0.93% (line 9) — a fully explained, structurally-proven, non-fixable artifact of counting in groups of 4 over a heap size not divisible by 4 in rounds 2-3, not a defect in either reading. Wilhelm's literal qualitative claims ("5 easier than 9"; "chances of 4 or 8 are equal") are both confirmed exactly: P(5)=3/4 > P(9)=1/4 (round 1); P(4)≈51%, P(8)≈49% (rounds 2-3, "equal" in the qualitative sense Wilhelm states it, not a literal 50.00%). |
| **Tests** | `VF-DIV-001 divination-wilhelm-appendix` (gates `G1`, `G4`, `G5`, `G5a`, `G5b`, `G7`) |
| **Audit** | `20260625-AUD-DIV-02-wilhelm-appendix-casting-methods.md` §6.A (manual), §6.D (auto, full exact derivation) |

```bash
npm run verify:divination-wilhelm-appendix   # G1, G4, G5, G5a, G5b, G7
npm run test --workspace=@iching-oracle/iching-engine   # yarrowSumToLine, throwYarrowStalks MC
```

---

## 3. Changing-line reduction rules — Alfred Huang

| Field | Detail |
|-------|--------|
| **Gold** | Huang, A. (2010). *The Complete I Ching* (10th anniversary ed.). Inner Traditions. (Original work published 1998). |
| **Scope** | The 9 published rule cases for reducing changing lines to a single governing line text (0 through 6 changing lines, plus the 用九/用六 special cases for hexagrams 1 and 2). |
| **Result** | **9/9 rule cases matched.** 8 exact textual matches + 1 verified equivalent (the engine doesn't literally activate a `readBothJudgments` branch for Qian/Kun in the Huang prompt path, but the case is confirmed an equivalent mapping, not a missed case). |
| **Tests** | `AU-MUT-001 huang-rules-vs-pdf-gold` · `TS-ENG-002 mutation-rules` |
| **Audit** | `20260619-AUD-MUT-03-huang-rules-alignment.md` · `20260622-AUD-MUT-04-mutation-rules-pdf-gold.md` |

```bash
npm run audit:huang-rules-vs-pdf-gold
npm run test --workspace=@iching-oracle/iching-engine
```

---

## 4. Changing-line reduction rules — Zhu Xi (classical)

| Field | Detail |
|-------|--------|
| **Gold** | Adler, J. A. (2002). *Introduction to the study of the classic of change* (I-hsüeh ch'i-meng). Global Scholarly Publications. — translation of Zhu Xi's *Yixue Qimeng* (易學啟蒙), ch. IV. |
| **Scope** | The published rule cases for reducing changing lines to a single governing line text, across the full 0-6 changing-line range plus 用九/用六 — not only the "2, 3, 4, 5 changing lines" subset an earlier (now-corrected) draft of the public `/audits` copy described; see `20260625-AUD-DIV-02` §6.D and the `audits-page-ui.ts` fix on 2026-06-25 for that correction. |
| **Result** | **10/10 rule snippets matched.** 8 exact/equivalent matches in the core PDF extract + the 32-diagram chart system (Adler's appendix), independently proven mathematically equivalent to the engine's count-based reduction rules (closed in `20260622-AUD-DAT-FID-04` §E.2.2 — not implemented as a separate code path because it isn't needed, the count-based rules already produce the same result). |
| **Tests** | `AU-MUT-002 zhuxi-rules-vs-adler-gold` · `TS-ENG-002 mutation-rules` · `TS-ENG-003 line-reading-systems` |
| **Audit** | `20260620-AUD-LRS-01-zhuxi-line-reading-selector.md` · `20260622-AUD-MUT-04-mutation-rules-pdf-gold.md` · `20260622-AUD-DAT-FID-04-fidelity-mutation-master.md` §E.2.2 (32-diagram equivalence proof) |

```bash
npm run audit:zhuxi-rules-vs-adler-gold
npm run test --workspace=@iching-oracle/iching-engine
```

---

## 5. Oracle Bones (Shang divination) — symbolic homage by deliberate design, not a fidelity-audited procedure

| Field | Detail |
|-------|--------|
| **Gold (historical anchor only)** | Keightley, D. N. (1978). *Sources of Shang history: The oracle-bone inscriptions of Bronze Age China*. University of California Press. (Reprinted 1985). |
| **Scope** | The 4-verdict taxonomy (`auspicious_clear`/`moderate`, `inauspicious_moderate`/`clear`) was decided in `00000000-AUD-DIV-01` §5 (2026-05-19, removal of a 5th "Silence" verdict) citing Keightley as the academic basis for that one decision. The full support matrix (`20260625-AUD-DIV-04-oracle-bones-product-support.md`) confirms the ritual framework (heat, crack, paired charge, expert reading) is real and Keightley-backed; the playable mechanic itself (4 symmetric verdicts, fixed weights, one roll, T/X/Y image patterns) is **product design**, not derived from the book. |
| **Business decision (2026-06-25, final)** | This method is an explicitly **symbolic homage** to a tradition far older than the I Ching, not a literal reconstruction — even Keightley's own book cannot say with certainty how the full ritual operated. Because the product makes **no 1:1 fidelity claim**, there is no book-primary pattern left to audit the mechanic against. This is categorically different from the I Ching casting methods in §1-§2, which DO carry an exact fidelity claim and ARE verified against Wilhelm to that standard. |
| **Public copy** | **Corrected 2026-06-25**: FAQ (`oracle-bones-method`) and `/notes` (`bonesOriginBody`, new `bonesLegacyHeading`/`bonesLegacyBody`) say "inspired by," not "faithful to"/"respects," and `/notes` states plainly that the full original ritual isn't known with certainty. Verdict labels (大吉/吉/凶/大凶) and weights were deliberately left unchanged — a legitimate, disclosed product abstraction. |
| **Closed, not deferred** | No automated book-primary gate (`VF-DIV-002`) and no `/audits` entry for this method — **permanently, by design**, not pending. `/audits` verifies fidelity claims; this method doesn't make one. See `20260625-AUD-DIV-03-oracle-bones-keightley.md` §5 and `20260625-AUD-DIV-04-oracle-bones-product-support.md` §9 for the closure record. |
| **Tests** | `oracle-bones-engine`'s existing unit tests cover determinism only — intentionally, since there's no book-primary fidelity target to gate against. |
| **Audit** | `00000000-AUD-DIV-01-divination-methods.md` §5 (original decision) · `20260625-AUD-DIV-02-wilhelm-appendix-casting-methods.md` §13 (gold designated) · `20260625-AUD-DIV-03-oracle-bones-keightley.md` (findings G-J, closed) · `20260625-AUD-DIV-04-oracle-bones-product-support.md` (full product-vs-source matrix, closed) |

---

## Cross-method parity (auto ↔ manual)

| Criterion | Evidence |
|-----------|----------|
| Same 6 line values → same `CastResult` | `packages/iching-engine/src/engine.test.ts` — `performCastFromLineValues` vs `performCast` with a fixed `rng` |
| `castingMethod` persisted, doesn't change the hexagram | Stored on the consultation; only affects the prompt's casting-method note (`backend/claude/src/interpretation.ts` — `castingMethodNote()`), never the line values themselves |

Pending: an explicit coins-manual-vs-auto and yarrow-manual-vs-auto matrix in the harness (`20260625-AUD-DIV-02` §6.E, not yet built — tracked there, not blocking, since both sides independently match their own gold).

---

## What this document is *not*

- Not a substitute for `00000000-RPT-DAT-FID-00-data-integrity-summary.md` (oracle text fidelity — judgment/image/lines) or the `library-commentary` audits (classical commentary fidelity). Those are textual; this is procedural (how a reading is cast and reduced, not what it says).
- Not published on the public `/audits` page for oracle-bones, permanently and by design (it makes no fidelity claim to audit); I Ching casting methods **are** on `/audits` under `divination-method` (see WF-DOC-03 §5.4), because they DO carry an exact fidelity claim.

---

## Ongoing reliability

Re-run `npm run verify:divination-wilhelm-appendix` after any change to `packages/iching-engine/src/engine.ts`'s `throwThreeCoins`/`throwYarrowStalks`/`yarrowSumToLine`, or to `apps/web/src/lib/manual-coin-value.ts`. Re-run the Huang/Zhu Xi `audit:*` scripts after any change to `packages/iching-engine/src/engine.ts`'s `determineMutationRule`/`determineMutationRuleZhuXi`. All four gates are exact/closed-form except the illustrative Monte Carlo cross-checks (`G3`, `G4`), which use a default 200,000-trial sample and accept `--trials N`.

*Last full verification: 25 June 2026 (`verify:divination-wilhelm-appendix` v2.0.0, 0 failures, 0 warnings).*
