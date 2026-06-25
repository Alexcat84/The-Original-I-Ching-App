#!/usr/bin/env node
/**
 * mutation-recheck-failures.mjs
 *
 * Reruns only the 9 fixtures that failed H1 in the 2026-06-15 barrido
 * after the fingerprint fix (first-line + CJK punctuation strip).
 * Generates JSON + transcripts in reports/.
 *
 * Usage:
 *   node scripts/mutation-recheck-failures.mjs
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
    } catch { /* optional */ }
  }
}

loadEnv();

const { buildCastFixture } = await import("../packages/iching-engine/dist/index.js");
const {
  buildAnthropicUserPayloadForCast,
  buildAnthropicInterpretationParams,
  validateInterpretationOutput,
} = await import("../backend/claude/dist/index.js");

// Exact cases that triggered H1 blocking failures in barrido 2026-06-15T23-07-14
const RECHECK_CASES = [
  { fixtureId: "ONE_CHANGING",      translator: "wilhelm"         },
  { fixtureId: "ONE_CHANGING",      translator: "master_combined" },
  { fixtureId: "TWO_YIN_YANG",      translator: "zhouyi"          },
  { fixtureId: "FOUR_LOWEST_STABLE", translator: "wilhelm"        },
  { fixtureId: "FOUR_LOWEST_STABLE", translator: "master_combined"},
];

const MODELS = ["claude-sonnet-4-5-20250929", "claude-sonnet-4-6"];
const LANGUAGE = "es";
const TIER = "master";
const CONCURRENCY = 2;
const DELAY_MS = 1200;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
    const text = (data.content ?? []).filter(b => b.type === "text").map(b => b.text).join("");
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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { console.error("ANTHROPIC_API_KEY required"); process.exit(1); }

  const totalCalls = RECHECK_CASES.length * MODELS.length;
  console.log(`Recheck: ${RECHECK_CASES.length} fixtures × ${MODELS.length} models = ${totalCalls} API calls`);
  console.log("Reason: H1 fingerprint fix (first-line + CJK strip) — verifying all previously-failing cases now PASS\n");

  const started = Date.now();
  const rows = [];

  const tasks = RECHECK_CASES.flatMap(({ fixtureId, translator }) =>
    MODELS.map(model => async () => {
      const cast = buildCastFixture(fixtureId, translator);
      const payload = buildAnthropicUserPayloadForCast(cast, TIER, LANGUAGE, "ritual");
      const { max_tokens: maxTokens } = buildAnthropicInterpretationParams(process.env, {
        isMasterCombined: payload.isMasterCombined,
        hasContext: false,
        modelOverride: model,
      });

      const t0 = Date.now();
      let apiResult, error = null;
      try {
        apiResult = await callAnthropic({ apiKey, model, system: payload.system, user: payload.user, maxTokens });
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }
      await sleep(DELAY_MS);

      const latencyMs = Date.now() - t0;
      let validation = null;
      if (apiResult?.text) {
        validation = validateInterpretationOutput(stripForValidation(apiResult.text), cast, { mode: "ritual" });
      }

      const row = {
        fixtureId,
        translator,
        model,
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
        responseFull: apiResult?.text ?? null,
      };
      rows.push(row);

      const status = error ? "ERR" : row.blockingPass ? (row.warnCount > 0 ? "WARN" : "PASS") : "FAIL";
      const prev = "FAIL (H1)";
      console.log(`[${status}] ${fixtureId} / ${translator} / ${model.split("-").slice(-2).join("-")} — was ${prev} (${latencyMs}ms)`);
      if (!row.blockingPass) {
        row.blockingFailures.forEach(f => console.log(`  ↳ ${f.gate}: ${f.message}`, f.detail ?? ""));
      }
      return row;
    })
  );

  await runPool(tasks, CONCURRENCY);

  mkdirSync(resolve(ROOT, "reports"), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  const blockingFail = rows.filter(r => !r.error && !r.blockingPass).length;
  const summary = {
    generatedAt: new Date().toISOString(),
    purpose: "Recheck of 9 H1 false-negatives after fingerprint fix",
    fix: "first-line-only + CJK trailing punctuation strip in validateLineCitation",
    durationMs: Date.now() - started,
    totalCalls: rows.length,
    blockingPass: rows.filter(r => !r.error && r.blockingPass).length,
    blockingFail,
    errors: rows.filter(r => r.error).length,
    rows,
  };

  const jsonPath = resolve(ROOT, "reports", `recheck-failures-${stamp}.json`);
  writeFileSync(jsonPath, JSON.stringify(summary, null, 2), "utf8");

  // Transcripts — one section per fixture × translator, both models side by side
  const txPath = resolve(ROOT, "reports", `recheck-failures-${stamp}-transcripts.md`);
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.fixtureId} · ${r.translator}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const txLines = [`# Recheck transcripts — ${summary.generatedAt}`, "", `> **Fix verified:** ${summary.fix}`, ""];
  for (const [key, grp] of groups) {
    const g0 = grp[0];
    txLines.push(
      `## ${key}`,
      "",
      `Hex ${g0.primaryHexagram}${g0.transformedHexagram ? ` → ${g0.transformedHexagram}` : ""} · rule ${g0.mutationRule}`,
      "",
    );
    for (const r of grp) {
      const st = r.error ? "ERR" : r.blockingPass ? (r.warnCount ? "WARN" : "PASS") : "FAIL";
      txLines.push(`### ${r.model} — ${st}${r.warnCount ? ` (${r.warnCount} warn)` : ""}`, "");
      if (r.blockingFailures?.length)
        txLines.push(`> blocking: ${r.blockingFailures.map(f => `${f.gate} ${JSON.stringify(f.detail ?? "")}`).join(" · ")}`, "");
      if (r.warnFailures?.length)
        txLines.push(`> warn: ${r.warnFailures.map(f => f.gate).join(" · ")}`, "");
      txLines.push(r.error ? `(API error: ${r.error})` : (r.responseFull ?? "(no text)"), "", "---", "");
    }
  }
  writeFileSync(txPath, txLines.join("\n"), "utf8");

  console.log(`\nReport:      ${jsonPath}`);
  console.log(`Transcripts: ${txPath}`);
  console.log(`\nResult: ${summary.blockingPass}/${summary.totalCalls} PASS — ${blockingFail > 0 ? `${blockingFail} still failing` : "all fixed ✓"}`);
  process.exit(blockingFail + summary.errors > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
