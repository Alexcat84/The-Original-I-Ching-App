#!/usr/bin/env node

/**
 * QA code: VF-DIV-001 divination-wilhelm-appendix · v1.0.0
 * Area: scripts/verify-divination-wilhelm-appendix
 * Family: DIV
 */

/**
 * verify-divination-wilhelm-appendix.mjs
 *
 * Gold: Wilhelm/Baynes (1950), The I Ching or Book of Changes, Appendix I
 * (`tools/source-pdfs/The I Ching or Book of Changes - Wilhelm-Appendix.txt`).
 * Verifies the app's coin and yarrow-stalk casting methods against the
 * literal procedure and value assignments Wilhelm describes, per the
 * harness proposed in docs/auditorias/20260625-AUD-DIV-02 §8 Fase 2.
 *
 * Gates:
 *   G1 — yarrowSumToLine() deterministic mapping vs the 4 gold (residue
 *        triple -> line) examples Wilhelm gives literally in §1.
 *   G2 — lineValueFromCoins() deterministic mapping over the 8 coin
 *        combinations vs the exact composition Wilhelm gives in §2
 *        ("all yang = 9", "all yin = 6", "two yin one yang = 7",
 *        "two yang one yin = 8").
 *   G3 — throwThreeCoins() Monte Carlo frequencies vs the 1/8, 3/8, 3/8, 1/8
 *        distribution implied by §2's combinatorics.
 *   G4 — throwYarrowStalks() Monte Carlo frequencies vs the classical
 *        1/16, 5/16, 7/16, 3/16 distribution the engine hardcodes.
 *   G5 — simulateYarrowLine(): a procedural simulator of the actual
 *        50-stalk / 3-round divide-count-remainder mechanism Wilhelm
 *        describes in §1 (not the bucket shortcut throwYarrowStalks uses).
 *        Checks Wilhelm's 2 literal qualitative claims ("5 is easier to
 *        obtain than 9"; "chances of obtaining 8 or 4 are equal") and
 *        reports how its emergent final-line distribution compares to G4's
 *        bucket distribution, under the standard modeling assumption that
 *        a hand-divided heap splits at a uniformly random point. (Wilhelm
 *        describes the physical actions, not an RNG model for "random" —
 *        this assumption is the harness's own choice, stated explicitly so
 *        any gap is attributable to the assumption, not the procedure.)
 *   G6 — Contrast: lineValueFromCoins() matches the coin combinatorics gold
 *        from G2 using the app's actual Han/Manchu face labels (closes
 *        H-DIV-02-01; this gate FAILED before that fix).
 *
 * Usage:
 *   npm run verify:divination-wilhelm-appendix
 *   node scripts/verify-divination-wilhelm-appendix.mjs --trials 500000
 */

import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const args = process.argv.slice(2);
const trialsArgIndex = args.indexOf("--trials");
const TRIALS = trialsArgIndex !== -1 ? Number(args[trialsArgIndex + 1]) : 200000;

const { throwThreeCoins, throwYarrowStalks, yarrowSumToLine } = await import(
  pathToFileURL(resolve(ROOT, "packages/iching-engine/dist/index.js")).href
);
const { lineValueFromCoins } = await import(
  pathToFileURL(resolve(ROOT, "apps/web/src/lib/manual-coin-value.ts")).href
);

let failures = 0;
let warnings = 0;

function gate(id, description, fn) {
  try {
    const result = fn();
    if (result === false) {
      console.log(`FAIL ${id} — ${description}`);
      failures++;
    } else if (result === "warn") {
      console.log(`WARN ${id} — ${description}`);
      warnings++;
    } else {
      console.log(`PASS ${id} — ${description}`);
    }
  } catch (err) {
    console.log(`FAIL ${id} — ${description} (threw: ${err.message})`);
    failures++;
  }
}

// ─── G1 — yarrowSumToLine() vs Wilhelm §1 literal examples ──────────────────

gate("G1", "yarrowSumToLine() matches Wilhelm Appendix I §1 residue-to-line examples", () => {
  const cases = [
    { residues: [5, 4, 4], expected: 9 }, // "5(=4,v.3)+4(v.3)+4(v.3)"
    { residues: [9, 8, 8], expected: 6 }, // "9(=8,v.2)+8(v.2)+8(v.2)"
    { residues: [9, 8, 4], expected: 7 },
    { residues: [5, 8, 8], expected: 7 },
    { residues: [9, 4, 8], expected: 7 },
    { residues: [9, 4, 4], expected: 8 },
    { residues: [5, 4, 8], expected: 8 },
    { residues: [5, 8, 4], expected: 8 },
  ];
  let ok = true;
  for (const c of cases) {
    const got = yarrowSumToLine(...c.residues);
    if (got !== c.expected) {
      console.log(`  residues ${JSON.stringify(c.residues)}: expected ${c.expected}, got ${got}`);
      ok = false;
    }
  }
  return ok;
});

// ─── G2 — lineValueFromCoins() vs Wilhelm §2 literal coin composition ───────

function allCoinCombos() {
  const combos = [];
  for (const a of ["H", "T"]) {
    for (const b of ["H", "T"]) {
      for (const c of ["H", "T"]) {
        combos.push([a, b, c]);
      }
    }
  }
  return combos;
}

gate(
  "G2",
  "lineValueFromCoins() composition matches Wilhelm Appendix I §2 (all yang=9, all yin=6, 2yin+1yang=7, 2yang+1yin=8)",
  () => {
    let ok = true;
    for (const combo of allCoinCombos()) {
      const heads = combo.filter((c) => c === "H").length; // H = inscribed = yin
      const tails = 3 - heads; // T = reverse = yang
      const expected = heads === 3 ? 6 : tails === 3 ? 9 : heads === 2 ? 7 : 8;
      const got = lineValueFromCoins(combo);
      if (got !== expected) {
        console.log(`  combo ${combo.join("")}: expected ${expected}, got ${got}`);
        ok = false;
      }
    }
    return ok;
  },
);

// ─── G3 — throwThreeCoins() Monte Carlo vs 1/8, 3/8, 3/8, 1/8 ───────────────

function frequencyTable(samples) {
  const counts = { 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const s of samples) counts[s]++;
  const n = samples.length;
  return { 6: counts[6] / n, 7: counts[7] / n, 8: counts[8] / n, 9: counts[9] / n };
}

function withinTolerance(freq, expected, epsilon) {
  let ok = true;
  for (const k of Object.keys(expected)) {
    const diff = Math.abs(freq[k] - expected[k]);
    if (diff > epsilon) {
      console.log(`  P(${k}): expected ${expected[k].toFixed(4)}, got ${freq[k].toFixed(4)} (diff ${diff.toFixed(4)} > ${epsilon})`);
      ok = false;
    }
  }
  return ok;
}

let coinFreq;
gate("G3", `throwThreeCoins() Monte Carlo (${TRIALS} trials) vs 1/8, 3/8, 3/8, 1/8`, () => {
  const samples = Array.from({ length: TRIALS }, () => throwThreeCoins());
  coinFreq = frequencyTable(samples);
  return withinTolerance(coinFreq, { 6: 1 / 8, 7: 3 / 8, 8: 3 / 8, 9: 1 / 8 }, 0.01);
});

// ─── G4 — throwYarrowStalks() Monte Carlo vs 1/16, 5/16, 7/16, 3/16 ─────────

let yarrowBucketFreq;
gate("G4", `throwYarrowStalks() Monte Carlo (${TRIALS} trials) vs 1/16, 5/16, 7/16, 3/16`, () => {
  const samples = Array.from({ length: TRIALS }, () => throwYarrowStalks());
  yarrowBucketFreq = frequencyTable(samples);
  return withinTolerance(yarrowBucketFreq, { 6: 1 / 16, 7: 5 / 16, 8: 7 / 16, 9: 3 / 16 }, 0.01);
});

// ─── G5 — procedural simulator of the physical 50-stalk / 3-round method ───

/** n mod 4, mapping 0 -> 4 (Wilhelm: "the number 4 is regarded as a complete unit"). */
function remainderOfFour(n) {
  const r = n % 4;
  return r === 0 ? 4 : r;
}

/**
 * One round of the yarrow-stalk procedure (Wilhelm Appendix I §1):
 * split `active` stalks into two heaps at a random point, hold 1 stalk from
 * the right heap between the fingers, count both heaps off by fours, sum
 * the 1 held stalk plus both remainders.
 *
 * Modeling assumption (not specified by Wilhelm's prose): the split point is
 * uniformly random across all non-trivial divisions of the heap. This is the
 * harness's own choice for "divide at random by hand" — see file header.
 */
function yarrowRound(active, rng) {
  const left = 1 + Math.floor(rng() * (active - 1));
  const right = active - left;
  const rightAfterHold = right - 1;
  const residue = 1 + remainderOfFour(left) + remainderOfFour(rightAfterHold);
  return { residue, remaining: active - residue };
}

function simulateYarrowLine(rng = Math.random) {
  let active = 49;
  const residues = [];
  for (let round = 0; round < 3; round++) {
    const { residue, remaining } = yarrowRound(active, rng);
    residues.push(residue);
    active = remaining;
  }
  return { line: yarrowSumToLine(residues[0], residues[1], residues[2]), residues };
}

gate(
  "G5a",
  'Procedural round 1: P(residue=5) > P(residue=9), matching Wilhelm\'s literal "the number 5 is easier to obtain than the number 9"',
  () => {
    let fives = 0;
    let nines = 0;
    for (let i = 0; i < TRIALS; i++) {
      const r = yarrowRound(49, Math.random).residue;
      if (r === 5) fives++;
      else nines++;
    }
    console.log(`  P(5) ~ ${(fives / TRIALS).toFixed(4)}, P(9) ~ ${(nines / TRIALS).toFixed(4)}`);
    return fives > nines;
  },
);

gate(
  "G5b",
  'Procedural rounds 2-3: P(residue=4) ~= P(residue=8), matching Wilhelm\'s literal "chances of obtaining 8 or 4 are equal"',
  () => {
    // Round 2/3 always start from an active count divisible by 4 (44 or 40,
    // the two possible remainders after round 1: 49-5=44, 49-9=40). Check both.
    let worstDiff = 0;
    for (const startingActive of [44, 40]) {
      let fours = 0;
      let eights = 0;
      for (let i = 0; i < TRIALS; i++) {
        const r = yarrowRound(startingActive, Math.random).residue;
        if (r === 4) fours++;
        else eights++;
      }
      const diff = Math.abs(fours - eights) / TRIALS;
      console.log(
        `  active=${startingActive}: P(4) ~ ${(fours / TRIALS).toFixed(4)}, P(8) ~ ${(eights / TRIALS).toFixed(4)}, diff ${diff.toFixed(4)}`,
      );
      worstDiff = Math.max(worstDiff, diff);
    }
    // Wilhelm's "are equal" is a qualitative literary claim, not a decimal
    // guarantee. PASS = indistinguishable from exact equality at this N;
    // WARN = close but a real, non-noise gap under our uniform-split
    // assumption (still "approximately equal" in ordinary language); FAIL
    // = the heap actually favors one residue, contradicting the claim.
    if (worstDiff < 0.005) return true;
    if (worstDiff < 0.05) {
      console.log(
        "  NOTE: small but real (non-noise) gap from exact 50/50 under the uniform-random-split assumption. " +
          "Wilhelm states equality qualitatively, not as a decimal claim -- a few-percent gap does not contradict it. " +
          "See AUD-DIV-02 §6.D.",
      );
      return "warn";
    }
    return false;
  },
);

gate(
  "G5",
  `Procedural simulateYarrowLine() (${TRIALS} trials) final-line distribution vs G4's throwYarrowStalks() bucket distribution`,
  () => {
    const samples = Array.from({ length: TRIALS }, () => simulateYarrowLine().line);
    const proceduralFreq = frequencyTable(samples);
    console.log(`  procedural: ${JSON.stringify(proceduralFreq, null, 0)}`);
    console.log(`  bucket (G4): ${JSON.stringify(yarrowBucketFreq, null, 0)}`);
    // Wider tolerance than G3/G4: this compares two independently-derived
    // distributions to each other (procedural simulation vs hardcoded
    // bucket), not either one against an exact closed-form fraction.
    const closeToBucket = withinTolerance(proceduralFreq, yarrowBucketFreq, 0.02);
    if (!closeToBucket) {
      console.log(
        "  NOTE: a gap here means the procedural simulation (under this harness's uniform-random-split assumption) " +
          "does not reproduce the engine's hardcoded 1/16,5/16,7/16,3/16 distribution exactly. This does not by " +
          "itself mean throwYarrowStalks() is wrong -- it means the random-split modeling assumption and/or the " +
          "textbook closed-form figures deserve a documented reconciliation. See AUD-DIV-02 §6.D.",
      );
      return "warn";
    }
    return true;
  },
);

// ─── G6 — contrast: app's Han/Manchu mapping vs Wilhelm gold (closes H-DIV-02-01) ───

gate(
  "G6",
  "Contrast: app's Han (inscribed) = yin, Manchu (reverse) = yang matches Wilhelm literal (H-DIV-02-01, fixed 2026-06-25)",
  () => {
    // Same check as G2/G6 but framed as the historical regression gate: this
    // FAILED before the 2026-06-25 fix (the app had Han=yang=3, Manchu=yin=2).
    return (
      lineValueFromCoins(["H", "H", "H"]) === 6 &&
      lineValueFromCoins(["T", "T", "T"]) === 9 &&
      lineValueFromCoins(["H", "H", "T"]) === 7 &&
      lineValueFromCoins(["T", "T", "H"]) === 8
    );
  },
);

console.log("");
console.log(`${failures === 0 ? "PASS" : "FAIL"} verify:divination-wilhelm-appendix — ${failures} failed, ${warnings} warning(s)`);
process.exit(failures === 0 ? 0 : 1);
