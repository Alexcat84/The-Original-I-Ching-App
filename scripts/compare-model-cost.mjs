#!/usr/bin/env node
/**
 * Compares real Anthropic API cost/tokens between two model IDs, using the
 * ACTUAL production request path (generateInterpretation from backend/claude):
 * same system prompt, same max_tokens-per-tier logic, same request shape the
 * app sends in prod. Makes real API calls: costs real money (a handful of
 * cents per run) and requires ANTHROPIC_API_KEY in the environment.
 *
 * Why not just diff list prices: per-token price is not the whole story, since
 * a newer model's tokenizer and default "thinking" behavior can change how
 * many tokens a real consultation actually uses. This script measures that,
 * not just quotes it.
 *
 * Usage:
 *   node --env-file=.env scripts/compare-model-cost.mjs [modelA] [modelB]
 *   (defaults: claude-sonnet-4-6 claude-sonnet-5)
 *
 * Requires: packages/iching-engine and backend/claude built (npm run build
 * --prefix packages/iching-engine && npm run build --prefix backend/claude).
 *
 * Pricing table below is manually maintained; update it when Anthropic
 * changes list prices or a promo window closes (see
 * docs/00000000-RUN-AI-OPS-01-model-cost-comparison.md for the source and how
 * to re-run this after a promo ends).
 */
import { performCast } from "../packages/iching-engine/dist/engine.js";
import { generateInterpretation } from "../backend/claude/dist/interpretation.js";

// USD per 1M tokens. Add an entry here before comparing a model not listed.
const PRICING = {
  "claude-sonnet-4-6": { in: 3.0, out: 15.0 },
  "claude-sonnet-5": { in: 3.0, out: 15.0 }, // list price (from 2026-09-01)
  "claude-sonnet-5-promo": { in: 2.0, out: 10.0 }, // introductory, through 2026-08-31
  "claude-opus-5": { in: 5.0, out: 25.0 },
  "claude-opus-4-8": { in: 5.0, out: 25.0 },
  "claude-haiku-4-5": { in: 1.0, out: 5.0 },
};

function cost(usage, priceKey) {
  const p = PRICING[priceKey];
  if (!p) throw new Error(`No pricing entry for "${priceKey}": add one to PRICING in this script.`);
  const inTok = (usage?.inputTokens ?? 0) + (usage?.cacheCreationTokens ?? 0) + (usage?.cacheReadTokens ?? 0);
  const outTok = usage?.outputTokens ?? 0;
  return { inTok, outTok, usd: (inTok / 1e6) * p.in + (outTok / 1e6) * p.out };
}

function fakeContext() {
  return {
    sessionId: "cost-compare-session",
    theme: "carrera",
    patternHints: null,
    previousConsultations: [
      {
        position: 1,
        question: "¿Debo aceptar el nuevo trabajo?",
        primaryHexagramNumber: 1,
        primaryHexagramName: "Ch'ien / Lo Creativo",
        primaryHexagramChinese: "乾",
        transformedHexagramName: null,
        changingLines: [],
        mutationRule: "huang",
        interpretationSummary: "El momento favorece la iniciativa decidida.",
        oracleType: "iching",
      },
    ],
  };
}

async function runOne(label, tier, translator, withContext, model, promoKey) {
  const cast = performCast(
    "¿Cómo debo manejar un conflicto con un socio de negocios?",
    "es",
    { translator, castingMethod: "three-coins" },
  );
  const env = { ...process.env, ANTHROPIC_MODEL: model };
  const context = withContext ? fakeContext() : null;

  const start = Date.now();
  const result = await generateInterpretation(
    cast,
    tier,
    context,
    "ritual",
    env,
    undefined,
    "three-coins",
    null,
    undefined,
  );
  const ms = Date.now() - start;

  const c = cost(result.usage, model);
  const promoC = promoKey && PRICING[promoKey] ? cost(result.usage, promoKey) : null;

  console.log(`\n=== ${label} | model=${model} ===`);
  console.log(`  ms: ${ms}`);
  console.log(`  usage:`, result.usage);
  console.log(`  textLength: ${result.text.length} chars`);
  console.log(`  cost @ list: $${c.usd.toFixed(5)}  (in=${c.inTok} out=${c.outTok})`);
  if (promoC) console.log(`  cost @ ${promoKey}: $${promoC.usd.toFixed(5)}`);

  return { label, model, usage: result.usage, textLength: result.text.length, costList: c.usd, costPromo: promoC?.usd ?? null, ms };
}

const [modelA, modelB] = [process.argv[2] || "claude-sonnet-4-6", process.argv[3] || "claude-sonnet-5"];
const promoKeyForB = `${modelB}-promo`;

const rows = [];
rows.push(await runOne("Seeker/Wilhelm, sin contexto", "seeker", "wilhelm", false, modelA));
rows.push(await runOne("Seeker/Wilhelm, sin contexto", "seeker", "wilhelm", false, modelB, promoKeyForB));
rows.push(await runOne("Master Combined, CON contexto", "master", "master_combined", true, modelA));
rows.push(await runOne("Master Combined, CON contexto", "master", "master_combined", true, modelB, promoKeyForB));

console.log("\n\n=== RESUMEN ===");
console.table(
  rows.map((r) => ({
    caso: r.label,
    modelo: r.model,
    in: r.usage?.inputTokens,
    cacheEscritura: r.usage?.cacheCreationTokens,
    cacheLectura: r.usage?.cacheReadTokens,
    out: r.usage?.outputTokens,
    chars: r.textLength,
    "$ lista": r.costList.toFixed(5),
    "$ promo": r.costPromo ? r.costPromo.toFixed(5) : "-",
    ms: r.ms,
  })),
);
