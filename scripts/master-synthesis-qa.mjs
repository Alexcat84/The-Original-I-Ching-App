#!/usr/bin/env node
/**
 * master-synthesis-qa.mjs
 *
 * Master (3) synthesis QA: 20 fixed hexagrams (1..20, sequential, zero
 * mutation so the run isolates triangulation quality from changing-line
 * selection, which is covered separately by line-reading-system-qa.mjs),
 * each cast with translator "master_combined" so the engine attaches
 * Wilhelm + Legge + Zhou Yi simultaneously (attachMasterTraditions in
 * packages/iching-engine/src/engine.ts) and the prompt instructs Claude to
 * triangulate all three with labeled literal quotes (backend/claude/src/
 * interpretation.ts, masterSynthesisInstruction).
 *
 * Production-identical pipeline: performCastFromLineValues → buildAnthropicUser
 * PayloadForCast → Anthropic API → validateInterpretationOutput, same as
 * reading-quality-qa.mjs. Bypasses the Next.js /api/consult route and
 * Supabase entirely — no auth, no token consumption, direct ANTHROPIC_API_KEY
 * call. Token/API cost is intentional (validates triangulated reading
 * quality); model is recorded per row.
 *
 * Also closes part of the open checklist in docs/auditorias/
 * READING_QUALITY_QA_VERBATIM_BLOCKQUOTE_GAP_AUDIT_2026-06-24.md (§8.1,
 * proposed Gate H7): H1-H6 never check verbatim fidelity of Judgment/Image,
 * only changing lines. This script extracts each translator's labeled
 * blockquote ("**Wilhelm:**" / "**Legge:**" / "**Zhou Yi:**" under "El
 * juicio" / "La imagen") and compares it character-for-character against
 * cast.textsForClaude (the literal text actually placed in the prompt for
 * that translator), reporting per-translator verbatim pass/fail — across all
 * three traditions simultaneously, since Master(3) triangulates all of them.
 *
 * Usage:
 *   node scripts/master-synthesis-qa.mjs
 *   node scripts/master-synthesis-qa.mjs --limit 4      # first 4 hexagrams (smoke)
 *   node scripts/master-synthesis-qa.mjs --concurrency 1 --delay-ms 1500
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

const { getHexagram, buildLine, performCastFromLineValues } = await import(
  "../packages/iching-engine/dist/index.js"
);
const {
  buildAnthropicUserPayloadForCast,
  buildAnthropicInterpretationParams,
  validateInterpretationOutput,
} = await import("../backend/claude/dist/index.js");

const FIXED_HEXAGRAMS = Array.from({ length: 20 }, (_, i) => i + 1);

// One Spanish question per fixed hexagram (index 0 → hex 1 … index 19 → hex 20).
const QUESTIONS = [
  "¿Debería abrirme de nuevo al amor después de mi última ruptura?",
  "Me ofrecieron un puesto en otra empresa, ¿me conviene aceptarlo?",
  "He estado agotado últimamente, ¿qué necesita mi cuerpo ahora?",
  "Siento un vacío que no sé nombrar, ¿hacia dónde debo mirar dentro de mí?",
  "Mi madre y yo discutimos seguido, ¿cómo sano esa relación en casa?",
  "Estoy entre dos caminos de vida muy distintos, ¿cuál sigo?",
  "Tengo un conflicto abierto con un socio, ¿cómo lo enfrento?",
  "Pienso mudarme a otra ciudad, ¿es el momento de hacerlo?",
  "¿Qué energía gobierna mi vida en este periodo?",
  "¿Mi pareja y yo estamos construyendo algo duradero?",
  "¿Es momento de emprender mi propio negocio?",
  "¿Cómo recupero el equilibrio entre el descanso y el trabajo?",
  "¿Qué lección espiritual estoy evitando aprender?",
  "Quiero comprar una casa con mi pareja, ¿es buen momento?",
  "¿Debo terminar mis estudios o pausarlos para trabajar?",
  "Un amigo me traicionó, ¿debo confrontarlo o soltarlo?",
  "¿Qué me espera en este viaje largo que estoy por hacer?",
  "¿Qué debo soltar para poder avanzar?",
  "¿Por qué sigo atrayendo el mismo tipo de relación?",
  "Mi proyecto está estancado, ¿cómo lo destrabo?",
];

function buildHexToYoungLineValues() {
  // Same bijective young-only (7/8) enumeration as reading-quality-qa.mjs:
  // zero changing lines, isolates triangulation from mutation selection.
  const map = {};
  for (let mask = 0; mask < 64; mask++) {
    const lineValues = [];
    for (let pos = 0; pos < 6; pos++) {
      const isYang = (mask >> pos) & 1;
      lineValues.push(isYang ? 7 : 8);
    }
    const lines = lineValues.map((v, i) => buildLine(v, i + 1));
    const hex = getHexagram(lines);
    if (!map[hex.number]) map[hex.number] = lineValues;
  }
  return map;
}

function parseArgs(argv) {
  const opts = {
    language: "es",
    tier: "master",
    limit: FIXED_HEXAGRAMS.length,
    concurrency: 2,
    delayMs: 1200,
    model: process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6",
    outDir: resolve(ROOT, "reports"),
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit" && argv[i + 1]) opts.limit = Number(argv[++i]);
    else if (a === "--model" && argv[i + 1]) opts.model = argv[++i];
    else if (a === "--concurrency" && argv[i + 1]) opts.concurrency = Number(argv[++i]);
    else if (a === "--delay-ms" && argv[i + 1]) opts.delayMs = Number(argv[++i]);
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
      await sleep(Math.min(8000, 1000 * (attempt + 1) + Math.random() * 800));
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
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      await tasks[i]();
      await sleep(0);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
}

function renderForReview(fullText) {
  return fullText
    .replace(/\[SNAPSHOT_START\][\s\S]*?\[SNAPSHOT_END\]/, "")
    .replace(/^#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*(?:\n|$)/im, "")
    .trim();
}

/**
 * Soft check, separate from the H1-H6 gates (which don't know about
 * triangulation): confirms all three traditions are actually attributed by
 * name in the rendered text, as masterSynthesisInstruction requires.
 */
function checkTriangulationLabels(text) {
  const labels = { wilhelm: /wilhelm/i, legge: /legge/i, zhouyi: /zhou\s*yi/i };
  const missing = Object.entries(labels)
    .filter(([, re]) => !re.test(text))
    .map(([name]) => name);
  return { passed: missing.length === 0, missing };
}

// ── Gate H7 (proposed, not yet wired into production validators) ──────────
// Extracts the labeled blockquote for one translator under a given ## section
// and compares it verbatim against the literal text placed in the prompt.

function extractSection(text, headingPattern) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => /^##\s+/.test(l) && headingPattern.test(l));
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n");
}

function extractLabeledBlockquote(sectionText, labelPattern) {
  if (!sectionText) return null;
  const lines = sectionText.split("\n");
  const start = lines.findIndex((l) => labelPattern.test(l.trim()));
  if (start === -1) return null;
  const quoteLines = [];
  for (let i = start + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith(">")) {
      quoteLines.push(trimmed.replace(/^>\s*/, "").replace(/^\*(.*)\*$/, "$1"));
    } else if (trimmed === "" && quoteLines.length === 0) {
      continue;
    } else if (quoteLines.length > 0) {
      break;
    } else {
      break;
    }
  }
  return quoteLines.length > 0 ? quoteLines.join("\n").trim() : null;
}

/** "wilhelm=OK/FAIL, legge=OK/FAIL, zhouyi=OK/FAIL" for console/MD; null means quote not found (parser miss, not necessarily a real fail — see transcripts). */
function summarizeVerbatim(verbatim) {
  if (!verbatim) return "n/a";
  const fmt = (v) => (v.judgment === null && v.image === null ? "?" : v.judgment !== false && v.image !== false ? "OK" : "FAIL");
  return `W=${fmt(verbatim.wilhelm)},L=${fmt(verbatim.legge)},Z=${fmt(verbatim.zhouyi)}`;
}

const JUDGMENT_HEADING = /juicio|judgment/i;
const IMAGE_HEADING = /imagen|image/i;
const TRANSLATOR_LABELS = {
  wilhelm: /^\*\*wilhelm.*\*\*:?\s*$|^\*\*wilhelm.*:\*\*\s*$/i,
  legge: /^\*\*legge.*\*\*:?\s*$|^\*\*legge.*:\*\*\s*$/i,
  zhouyi: /^\*\*zhou\s*yi.*\*\*:?\s*$|^\*\*zhou\s*yi.*:\*\*\s*$/i,
};

function checkVerbatimFidelity(text, cast) {
  const judgmentSection = extractSection(text, JUDGMENT_HEADING);
  const imageSection = extractSection(text, IMAGE_HEADING);
  const expected = {
    wilhelm: { judgment: cast.textsForClaude.primaryJudgment, image: cast.textsForClaude.primaryImage },
    legge: { judgment: cast.textsForClaude.leggeJudgment, image: cast.textsForClaude.leggeImage },
    zhouyi: { judgment: cast.textsForClaude.zhouyiJudgment, image: cast.textsForClaude.zhouyiImage },
  };
  const result = {};
  for (const translator of ["wilhelm", "legge", "zhouyi"]) {
    const labelRe = TRANSLATOR_LABELS[translator];
    const judgmentQuote = extractLabeledBlockquote(judgmentSection, labelRe);
    const imageQuote = extractLabeledBlockquote(imageSection, labelRe);
    result[translator] = {
      judgment:
        judgmentQuote === null || expected[translator].judgment === undefined
          ? null
          : judgmentQuote === expected[translator].judgment.trim(),
      image:
        imageQuote === null || expected[translator].image === undefined
          ? null
          : imageQuote === expected[translator].image.trim(),
      judgmentQuote,
      judgmentExpected: expected[translator].judgment ?? null,
      imageQuote,
      imageExpected: expected[translator].image ?? null,
    };
  }
  return result;
}

async function main() {
  const opts = parseArgs(process.argv);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY required");
    process.exit(1);
  }

  const hexToLines = buildHexToYoungLineValues();
  const hexNumbers = FIXED_HEXAGRAMS.slice(0, Math.min(opts.limit, FIXED_HEXAGRAMS.length));

  console.log(
    `Master synthesis QA (fixed): master_combined × ${hexNumbers.length} hexagrams = ${hexNumbers.length} API calls`,
  );
  console.log(`Hex picks: ${hexNumbers.join(", ")}`);
  console.log(`Model: ${opts.model} · tier=${opts.tier} · lang=${opts.language} · NO_CHANGING (zero mutation)`);

  const started = Date.now();
  const rows = [];

  const tasks = hexNumbers.map((n) => async () => {
    const lineValues = hexToLines[n];
    const q = QUESTIONS[n - 1];
    const cast = performCastFromLineValues(q, opts.language, lineValues, {
      translator: "master_combined",
      id: `master-qa-${n}`,
    });
    const payload = buildAnthropicUserPayloadForCast(cast, opts.tier, opts.language, "ritual");
    const { max_tokens: maxTokens } = buildAnthropicInterpretationParams(process.env, {
      isMasterCombined: payload.isMasterCombined,
      hasContext: false,
      modelOverride: opts.model,
    });

    const t0 = Date.now();
    let apiResult = null;
    let error = null;
    try {
      apiResult = await callAnthropic({
        apiKey,
        model: opts.model,
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
    let triangulation = null;
    let verbatim = null;
    if (apiResult?.text) {
      const rendered = renderForReview(apiResult.text);
      validation = validateInterpretationOutput(rendered, cast, { mode: "ritual" });
      triangulation = checkTriangulationLabels(rendered);
      verbatim = checkVerbatimFidelity(rendered, cast);
    }

    const row = {
      hexagram: n,
      hexagramName: cast.primaryHexagram.chineseName,
      hexagramEnglish: cast.primaryHexagram.name ?? null,
      isMasterCombined: payload.isMasterCombined,
      model: opts.model,
      question: q,
      mutationRule: cast.mutationRule,
      changingLines: cast.changingLines,
      blockingPass: validation ? validation.blockingFailures.length === 0 : false,
      warnCount: validation?.warnFailures.length ?? 0,
      blockingFailures: validation?.blockingFailures ?? [],
      warnFailures: validation?.warnFailures ?? [],
      triangulationPass: triangulation?.passed ?? false,
      triangulationMissing: triangulation?.missing ?? [],
      verbatim,
      latencyMs,
      inputTokens: apiResult?.inputTokens ?? null,
      outputTokens: apiResult?.outputTokens ?? null,
      stopReason: apiResult?.stopReason ?? null,
      error,
      rendered: apiResult?.text ? renderForReview(apiResult.text) : null,
    };
    rows.push(row);
    const status = error
      ? "ERR"
      : row.blockingPass && row.triangulationPass
        ? row.warnCount > 0
          ? "WARN"
          : "PASS"
        : "FAIL";
    console.log(
      `[${status}] hex ${String(n).padStart(2, "0")} ${cast.primaryHexagram.chineseName} (${latencyMs}ms, out=${row.outputTokens}, triangulation=${row.triangulationPass ? "ok" : `missing:${row.triangulationMissing.join(",")}`}, verbatim=${summarizeVerbatim(verbatim)})`,
    );
  });

  await runPool(tasks, opts.concurrency);

  rows.sort((a, b) => a.hexagram - b.hexagram);

  mkdirSync(opts.outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonPath = resolve(opts.outDir, `master-synthesis-qa-${stamp}.json`);
  const mdPath = resolve(opts.outDir, `master-synthesis-qa-${stamp}.md`);
  const txPath = resolve(opts.outDir, `master-synthesis-qa-${stamp}-transcripts.md`);

  const summary = {
    generatedAt: new Date().toISOString(),
    model: opts.model,
    tier: opts.tier,
    language: opts.language,
    durationMs: Date.now() - started,
    totalCalls: rows.length,
    blockingPass: rows.filter((r) => !r.error && r.blockingPass).length,
    triangulationPass: rows.filter((r) => !r.error && r.triangulationPass).length,
    withWarn: rows.filter((r) => !r.error && r.blockingPass && r.warnCount > 0).length,
    blockingFail: rows.filter((r) => !r.error && !r.blockingPass).length,
    errors: rows.filter((r) => r.error).length,
    avgOutputTokens: Math.round(
      rows.filter((r) => r.outputTokens).reduce((s, r) => s + r.outputTokens, 0) /
        Math.max(1, rows.filter((r) => r.outputTokens).length),
    ),
    verbatimFailRows: rows
      .filter((r) => r.verbatim)
      .filter((r) =>
        ["wilhelm", "legge", "zhouyi"].some(
          (t) => r.verbatim[t].judgment === false || r.verbatim[t].image === false,
        ),
      )
      .map((r) => r.hexagram),
    scope:
      "Master (3) synthesis, NO_CHANGING fixed hexagrams; changing lines covered by line-reading-system-qa.mjs. " +
      "verbatim* fields are a proposed Gate H7 (docs/auditorias/READING_QUALITY_QA_VERBATIM_BLOCKQUOTE_GAP_AUDIT_2026-06-24.md), not a production gate yet.",
    hexNumbers,
    rows,
  };
  writeFileSync(jsonPath, JSON.stringify(summary, null, 2), "utf8");

  const mdLines = [
    `# Master (3) synthesis QA — ${summary.generatedAt}`,
    "",
    `Model: \`${summary.model}\` · tier ${summary.tier} · lang ${summary.language}`,
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total calls | ${summary.totalCalls} |`,
    `| Blocking pass (H1-H6) | ${summary.blockingPass} |`,
    `| Triangulation pass (3 traditions named) | ${summary.triangulationPass} |`,
    `| Pass with warns | ${summary.withWarn} |`,
    `| Blocking fail | ${summary.blockingFail} |`,
    `| API errors | ${summary.errors} |`,
    `| Avg output tokens | ${summary.avgOutputTokens} |`,
    `| Duration | ${Math.round(summary.durationMs / 1000)}s |`,
    `| Verbatim Gate H7 fail (any translator) | ${summary.verbatimFailRows.length} hex: [${summary.verbatimFailRows.join(", ")}] |`,
    "",
    "| Hex | Name | Status | Warns | Triangulation | Verbatim W/L/Z | Out tok |",
    "|-----|------|--------|-------|----------------|----------------|---------|",
  ];
  for (const r of rows) {
    const st = r.error
      ? "ERR"
      : r.blockingPass && r.triangulationPass
        ? r.warnCount
          ? "WARN"
          : "OK"
        : "FAIL";
    mdLines.push(
      `| ${r.hexagram} | ${r.hexagramName} | ${st} | ${r.warnCount} | ${r.triangulationPass ? "ok" : r.triangulationMissing.join(",")} | ${summarizeVerbatim(r.verbatim)} | ${r.outputTokens ?? "-"} |`,
    );
  }
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  const txLines = [`# Master (3) synthesis QA transcripts — ${summary.generatedAt}`, ""];
  for (const r of rows) {
    const st = r.error
      ? "ERR"
      : r.blockingPass && r.triangulationPass
        ? r.warnCount
          ? "WARN"
          : "PASS"
        : "FAIL";
    txLines.push(
      `## Hexagram ${r.hexagram} · ${r.hexagramName} — ${st}${r.warnCount ? ` (${r.warnCount} warn)` : ""}`,
      "",
      `**Pregunta:** ${r.question}`,
      "",
      `out=${r.outputTokens ?? "-"} · triangulation=${r.triangulationPass ? "ok" : `missing:${r.triangulationMissing.join(",")}`} · verbatim=${summarizeVerbatim(r.verbatim)}`,
      "",
    );
    if (r.blockingFailures?.length)
      txLines.push(`> blocking: ${r.blockingFailures.map((f) => f.gate).join(" · ")}`, "");
    if (r.warnFailures?.length)
      txLines.push(`> warn: ${r.warnFailures.map((f) => f.gate).join(" · ")}`, "");
    if (r.verbatim) {
      for (const t of ["wilhelm", "legge", "zhouyi"]) {
        const v = r.verbatim[t];
        for (const field of ["judgment", "image"]) {
          if (v[field] === false) {
            txLines.push(
              `> H7 FAIL [${t}/${field}]\n> expected: ${JSON.stringify(v[`${field}Expected`])}\n> got:      ${JSON.stringify(v[`${field}Quote`])}`,
              "",
            );
          }
        }
      }
    }
    txLines.push(r.error ? `(API error: ${r.error})` : (r.rendered ?? "(no text)"), "", "---", "");
  }
  writeFileSync(txPath, txLines.join("\n"), "utf8");

  console.log(`\nReport:      ${jsonPath}`);
  console.log(`Summary:     ${mdPath}`);
  console.log(`Transcripts: ${txPath}`);
  process.exit(summary.blockingFail + summary.errors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
