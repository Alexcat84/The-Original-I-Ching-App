#!/usr/bin/env node
/**
 * mutation-output-qa.mjs
 *
 * QA barrido: 10 reglas × 4 traductores × N modelos Claude.
 * Usa prompt y validadores idénticos a producción (sin temperature — default API).
 *
 * Uso:
 *   node scripts/mutation-output-qa.mjs
 *   node scripts/mutation-output-qa.mjs --rules THREE_MIDDLE,FIVE_ONLY_STABLE
 *   node scripts/mutation-output-qa.mjs --models claude-sonnet-4-5-20250929,claude-sonnet-4-6
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadEnv() {
  for (const rel of [".env", "apps/web/.env.local"]) {
    try {
      const content = readFileSync(resolve(ROOT, rel), "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
      }
    } catch {
      /* optional */
    }
  }
}

loadEnv();

const {
  listMutationQaCases,
  buildCastFixture,
  MUTATION_QA_FIXTURES,
} = await import("../packages/iching-engine/dist/index.js");

const {
  buildAnthropicUserPayloadForCast,
  buildAnthropicInterpretationParams,
  validateInterpretationOutput,
} = await import("../backend/claude/dist/index.js");

function parseArgs(argv) {
  const opts = {
    models: (process.env.MUTATION_QA_MODELS ??
      "claude-sonnet-4-5-20250929,claude-sonnet-4-6")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    translators: ["wilhelm", "legge", "zhouyi", "master_combined"],
    rules: null,
    language: "es",
    tier: "master",
    concurrency: 2,
    delayMs: 1200,
    outDir: resolve(ROOT, "reports"),
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--models" && argv[i + 1]) opts.models = argv[++i].split(",").map((s) => s.trim());
    else if (a === "--translators" && argv[i + 1])
      opts.translators = argv[++i].split(",").map((s) => s.trim());
    else if (a === "--rules" && argv[i + 1])
      opts.rules = new Set(argv[++i].split(",").map((s) => s.trim()));
    else if (a === "--concurrency" && argv[i + 1]) opts.concurrency = Number(argv[++i]);
    else if (a === "--delay-ms" && argv[i + 1]) opts.delayMs = Number(argv[++i]);
    else if (a === "--language" && argv[i + 1]) opts.language = argv[++i];
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callAnthropic({ apiKey, model, system, user, maxTokens }) {
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: [{ type: "text", text: system }],
        messages: [{ role: "user", content: user }],
      }),
    });
    if (res.status === 429 || res.status === 529) {
      const wait = Math.min(8000, 1000 * (attempt + 1) + Math.random() * 800);
      await sleep(wait);
      lastErr = new Error(`Anthropic ${res.status}: rate limited`);
      continue;
    }
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Anthropic ${res.status}: ${body.slice(0, 400)}`);
    }
    const data = await res.json();
    const text = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return {
      text,
      inputTokens: data.usage?.input_tokens ?? null,
      outputTokens: data.usage?.output_tokens ?? null,
      stopReason: data.stop_reason ?? null,
    };
  }
  throw lastErr ?? new Error("Anthropic call failed after retries");
}

async function runPool(tasks, concurrency) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
      await sleep(0);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

function stripForValidation(fullText) {
  return fullText
    .replace(/\[SNAPSHOT_START\][\s\S]*?\[SNAPSHOT_END\]/, "")
    .replace(/^#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*(?:\n|$)/im, "")
    .trim();
}

async function main() {
  const opts = parseArgs(process.argv);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY required");
    process.exit(1);
  }

  let cases = listMutationQaCases(opts.translators);
  if (opts.rules) {
    cases = cases.filter((c) => opts.rules.has(c.fixtureId));
  }

  console.log(
    `Mutation QA: ${cases.length} cases × ${opts.models.length} models = ${cases.length * opts.models.length} API calls`,
  );

  const started = Date.now();
  const rows = [];

  const tasks = cases.flatMap(({ fixtureId, translator }) =>
    opts.models.map((model) => async () => {
      const fixtureMeta = MUTATION_QA_FIXTURES.find((f) => f.id === fixtureId);
      const cast = buildCastFixture(fixtureId, translator);
      const payload = buildAnthropicUserPayloadForCast(
        cast,
        opts.tier,
        opts.language,
        "ritual",
      );
      const { max_tokens: maxTokens } = buildAnthropicInterpretationParams(process.env, {
        isMasterCombined: payload.isMasterCombined,
        hasContext: false,
        modelOverride: model,
      });

      const t0 = Date.now();
      let apiResult;
      let error = null;
      try {
        apiResult = await callAnthropic({
          apiKey,
          model,
          system: payload.system,
          user: payload.user,
          maxTokens,
        });
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }
      await sleep(opts.delayMs);

      const latencyMs = Date.now() - t0;
      let validation = null;
      if (apiResult?.text) {
        validation = validateInterpretationOutput(
          stripForValidation(apiResult.text),
          cast,
          { mode: "ritual" },
        );
      }

      const row = {
        fixtureId,
        translator,
        model,
        label: fixtureMeta?.label,
        referenceNote: fixtureMeta?.referenceNote,
        primaryHexagram: cast.primaryHexagram.number,
        transformedHexagram: cast.transformedHexagram?.number ?? null,
        mutationRule: cast.mutationRule,
        blockingPass: validation ? validation.blockingFailures.length === 0 : false,
        warnCount: validation?.warnFailures.length ?? 0,
        blockingFailures: validation?.blockingFailures ?? [],
        warnFailures: validation?.warnFailures ?? [],
        latencyMs,
        inputTokens: apiResult?.inputTokens ?? null,
        outputTokens: apiResult?.outputTokens ?? null,
        stopReason: apiResult?.stopReason ?? null,
        error,
        responsePreview: apiResult?.text?.slice(0, 500) ?? null,
        responseFull: apiResult?.text ?? null,
      };
      rows.push(row);
      const status = error
        ? "ERR"
        : row.blockingPass
          ? row.warnCount > 0
            ? "WARN"
            : "PASS"
          : "FAIL";
      console.log(
        `[${status}] ${fixtureId} / ${translator} / ${model} (${latencyMs}ms)`,
      );
      return row;
    }),
  );

  await runPool(tasks, opts.concurrency);

  mkdirSync(opts.outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonPath = resolve(opts.outDir, `mutation-qa-${stamp}.json`);
  const mdPath = resolve(opts.outDir, `mutation-qa-${stamp}.md`);

  const summary = {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    totalCalls: rows.length,
    blockingPass: rows.filter((r) => !r.error && r.blockingPass).length,
    withWarn: rows.filter((r) => !r.error && r.blockingPass && r.warnCount > 0).length,
    blockingFail: rows.filter((r) => !r.error && !r.blockingPass).length,
    errors: rows.filter((r) => r.error).length,
    limitation:
      "depth=1 without session context; Lines in motion invariant; Encuadre not validated",
    temperature: "none (Anthropic API default, matches production primary path)",
    rows,
  };

  writeFileSync(jsonPath, JSON.stringify(summary, null, 2), "utf8");

  const mdLines = [
    `# Mutation output QA — ${summary.generatedAt}`,
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total calls | ${summary.totalCalls} |`,
    `| Blocking pass | ${summary.blockingPass} |`,
    `| Pass with warns | ${summary.withWarn} |`,
    `| Blocking fail | ${summary.blockingFail} |`,
    `| API errors | ${summary.errors} |`,
    `| Duration | ${Math.round(summary.durationMs / 1000)}s |`,
    "",
    "## Limitation",
    summary.limitation,
    "",
    "## Results",
    "",
    "| Fixture | Translator | Model | Status | Warns | Rule |",
    "|---------|------------|-------|--------|-------|------|",
  ];
  for (const r of rows) {
    const st = r.error ? "ERR" : r.blockingPass ? (r.warnCount ? "WARN" : "OK") : "FAIL";
    mdLines.push(
      `| ${r.fixtureId} | ${r.translator} | ${r.model.split("-").slice(-2).join("-")} | ${st} | ${r.warnCount} | ${r.mutationRule} |`,
    );
  }
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  // Full-text transcripts grouped by (fixtureId, translator): each model's
  // complete interpretation side by side, for human qualitative review.
  const txPath = resolve(opts.outDir, `mutation-qa-${stamp}-transcripts.md`);
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.fixtureId} · ${r.translator}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const txLines = [`# Mutation QA transcripts — ${summary.generatedAt}`, ""];
  for (const [key, grp] of groups) {
    const g0 = grp[0];
    txLines.push(
      `## ${key}`,
      "",
      `Hexagram ${g0.primaryHexagram}${g0.transformedHexagram ? ` → ${g0.transformedHexagram}` : ""} · rule ${g0.mutationRule}`,
      "",
    );
    for (const r of grp) {
      const st = r.error ? "ERR" : r.blockingPass ? (r.warnCount ? "WARN" : "PASS") : "FAIL";
      txLines.push(`### ${r.model} — ${st}${r.warnCount ? ` (${r.warnCount} warn)` : ""}`, "");
      if (r.blockingFailures?.length)
        txLines.push(`> blocking: ${r.blockingFailures.map((f) => `${f.gate}${f.detail ? ` ${JSON.stringify(f.detail)}` : ""}`).join(" · ")}`, "");
      if (r.warnFailures?.length)
        txLines.push(`> warn: ${r.warnFailures.map((f) => f.gate).join(" · ")}`, "");
      txLines.push(
        r.error ? `(API error: ${r.error})` : (r.responseFull ?? "(no text)"),
        "",
        "---",
        "",
      );
    }
  }
  writeFileSync(txPath, txLines.join("\n"), "utf8");

  console.log(`\nReport: ${jsonPath}`);
  console.log(`Summary: ${mdPath}`);
  console.log(`Transcripts: ${txPath}`);
  process.exit(summary.blockingFail + summary.errors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
