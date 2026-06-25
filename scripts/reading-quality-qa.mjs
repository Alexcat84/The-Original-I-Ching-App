#!/usr/bin/env node

/**
 * QA code: QA-RDG-001 reading-quality · v1.1.0
 * Area: scripts/reading-quality-qa
 * Family: RDG
 */

/**
 * reading-quality-qa.mjs
 *
 * Reading-quality QA for the NO-changing-lines path (NO_CHANGING rule):
 * the 64 King Wen hexagrams, each cast with only young lines (7/8) so there is
 * zero mutation. One Spanish question per hexagram (varied categories), sent in
 * order 1..64 to each translator (Wilhelm, Legge). Changing-line behaviour is
 * covered separately by the mutation QA; this run isolates base reading quality
 * and rendered output per translator.
 *
 * Production-identical pipeline: performCastFromLineValues → buildAnthropicUser
 * PayloadForCast → Anthropic API → validateInterpretationOutput. Model comes
 * from ANTHROPIC_MODEL (production standard: claude-sonnet-4-6). Token cost is
 * intentional (validates product reading quality); model is recorded per row.
 *
 * Usage:
 *   node scripts/reading-quality-qa.mjs
 *   node scripts/reading-quality-qa.mjs --translators wilhelm
 *   node scripts/reading-quality-qa.mjs --limit 2      # first 2 hexagrams/translator (smoke)
 *   node scripts/reading-quality-qa.mjs --random 3       # 3 random hexagrams per translator
 *   node scripts/reading-quality-qa.mjs --random 2 --translators wilhelm
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

// 64 Spanish questions, one per hexagram (index 0 → hex 1 … index 63 → hex 64).
// `cat` is the intended life category for spread; the model classifies on its own.
const QUESTIONS = [
  { cat: "love_relationship", q: "¿Debería abrirme de nuevo al amor después de mi última ruptura?" },
  { cat: "career_work", q: "Me ofrecieron un puesto en otra empresa, ¿me conviene aceptarlo?" },
  { cat: "health_wellbeing", q: "He estado agotado últimamente, ¿qué necesita mi cuerpo ahora?" },
  { cat: "spiritual_inner", q: "Siento un vacío que no sé nombrar, ¿hacia dónde debo mirar dentro de mí?" },
  { cat: "family_home", q: "Mi madre y yo discutimos seguido, ¿cómo sano esa relación en casa?" },
  { cat: "decision_path", q: "Estoy entre dos caminos de vida muy distintos, ¿cuál sigo?" },
  { cat: "conflict_challenge", q: "Tengo un conflicto abierto con un socio, ¿cómo lo enfrento?" },
  { cat: "travel_change", q: "Pienso mudarme a otra ciudad, ¿es el momento de hacerlo?" },
  { cat: "general", q: "¿Qué energía gobierna mi vida en este periodo?" },
  { cat: "love_relationship", q: "¿Mi pareja y yo estamos construyendo algo duradero?" },
  { cat: "career_work", q: "¿Es momento de emprender mi propio negocio?" },
  { cat: "health_wellbeing", q: "¿Cómo recupero el equilibrio entre el descanso y el trabajo?" },
  { cat: "spiritual_inner", q: "¿Qué lección espiritual estoy evitando aprender?" },
  { cat: "family_home", q: "Quiero comprar una casa con mi pareja, ¿es buen momento?" },
  { cat: "decision_path", q: "¿Debo terminar mis estudios o pausarlos para trabajar?" },
  { cat: "conflict_challenge", q: "Un amigo me traicionó, ¿debo confrontarlo o soltarlo?" },
  { cat: "travel_change", q: "¿Qué me espera en este viaje largo que estoy por hacer?" },
  { cat: "general", q: "¿Qué debo soltar para poder avanzar?" },
  { cat: "love_relationship", q: "¿Por qué sigo atrayendo el mismo tipo de relación?" },
  { cat: "career_work", q: "Mi proyecto está estancado, ¿cómo lo destrabo?" },
  { cat: "health_wellbeing", q: "¿Cómo cuido mejor mi salud mental este año?" },
  { cat: "spiritual_inner", q: "¿Cuál es mi propósito más profundo en esta vida?" },
  { cat: "family_home", q: "Mi hijo se aleja de mí, ¿cómo reconecto con él?" },
  { cat: "decision_path", q: "¿Acepto la propuesta de matrimonio o pido más tiempo?" },
  { cat: "conflict_challenge", q: "Enfrento una acusación injusta, ¿cómo me defiendo?" },
  { cat: "travel_change", q: "Estoy por emigrar a otro país, ¿qué debo prever?" },
  { cat: "general", q: "¿Qué me trae esta nueva etapa que comienza?" },
  { cat: "love_relationship", q: "¿Es sano seguir esperando a alguien que no se decide?" },
  { cat: "career_work", q: "¿Debo pedir un aumento ahora o esperar un poco más?" },
  { cat: "health_wellbeing", q: "Una enfermedad me asusta, ¿cómo afronto el tratamiento?" },
  { cat: "spiritual_inner", q: "¿Cómo cultivo más paz interior en medio del caos?" },
  { cat: "family_home", q: "Heredé una propiedad y hay disputa familiar, ¿cómo procedo?" },
  { cat: "decision_path", q: "¿Me quedo en mi trabajo seguro o persigo mi vocación?" },
  { cat: "conflict_challenge", q: "Mi jefe me presiona injustamente, ¿cómo respondo?" },
  { cat: "travel_change", q: "Siento que necesito un cambio radical, ¿por dónde empiezo?" },
  { cat: "general", q: "¿Qué fuerza invisible está actuando en mi situación?" },
  { cat: "love_relationship", q: "¿Debo perdonar una infidelidad y seguir, o cerrar el capítulo?" },
  { cat: "career_work", q: "¿Me conviene asociarme con esta persona en el negocio?" },
  { cat: "health_wellbeing", q: "¿Cómo recupero mi vitalidad después de meses difíciles?" },
  { cat: "spiritual_inner", q: "¿Qué me quiere enseñar este momento de soledad?" },
  { cat: "family_home", q: "Mis padres envejecen y debo cuidarlos, ¿cómo me organizo?" },
  { cat: "decision_path", q: "¿Invierto mis ahorros en este proyecto o los guardo?" },
  { cat: "conflict_challenge", q: "Hay rivalidad en mi equipo de trabajo, ¿cómo la manejo?" },
  { cat: "travel_change", q: "¿Es buen momento para dejar todo y viajar un año?" },
  { cat: "general", q: "¿Qué necesito comprender sobre mi vida ahora mismo?" },
  { cat: "love_relationship", q: "¿Esta nueva atracción vale la pena explorarla?" },
  { cat: "career_work", q: "¿Debo cambiar por completo de profesión?" },
  { cat: "health_wellbeing", q: "¿Cómo encuentro un ritmo de vida más sano y sostenible?" },
  { cat: "spiritual_inner", q: "¿Estoy escuchando mi intuición o mi miedo?" },
  { cat: "family_home", q: "Quiero reconciliarme con mi hermano, ¿cómo doy el primer paso?" },
  { cat: "decision_path", q: "¿Firmo este contrato importante o lo reviso más a fondo?" },
  { cat: "conflict_challenge", q: "Me siento atrapado en una disputa larga, ¿qué actitud tomo?" },
  { cat: "travel_change", q: "Una oportunidad lejos me llama, ¿la sigo?" },
  { cat: "general", q: "¿Cuál es el siguiente paso correcto para mí?" },
  { cat: "love_relationship", q: "¿Cómo reavivo la chispa en mi matrimonio?" },
  { cat: "career_work", q: "Mi empresa atraviesa una crisis, ¿me quedo o me voy?" },
  { cat: "health_wellbeing", q: "¿Cómo manejo la ansiedad que no me deja dormir?" },
  { cat: "spiritual_inner", q: "¿Qué parte de mí pide ser sanada?" },
  { cat: "family_home", q: "Vamos a recibir un hijo, ¿cómo me preparo para este cambio en casa?" },
  { cat: "decision_path", q: "¿Pongo límites o sigo cediendo por mantener la paz?" },
  { cat: "conflict_challenge", q: "Un vecino hostil complica mi día a día, ¿cómo lo resuelvo?" },
  { cat: "travel_change", q: "Después de años en el mismo lugar, ¿es hora de moverme?" },
  { cat: "general", q: "¿Qué cierre necesita esta etapa de mi vida?" },
  { cat: "spiritual_inner", q: "Al final de un ciclo, ¿qué me preparo para comenzar?" },
];

function buildHexToYoungLineValues() {
  // Enumerate all 64 young-only line combinations (7 = young yang, 8 = young yin),
  // map each to its hexagram number. Bijective → all 64 covered, zero changing.
  const map = {};
  for (let mask = 0; mask < 64; mask++) {
    const lineValues = [];
    for (let pos = 0; pos < 6; pos++) {
      const isYang = (mask >> pos) & 1;
      lineValues.push(isYang ? 7 : 8);
    }
    const lines = lineValues.map((v, i) => buildLine(v, (i + 1)));
    const hex = getHexagram(lines);
    if (!map[hex.number]) map[hex.number] = lineValues;
  }
  return map;
}

function parseArgs(argv) {
  const opts = {
    translators: ["wilhelm", "legge"],
    language: "es",
    tier: "master",
    limit: 64,
    random: 0,
    concurrency: 2,
    delayMs: 1200,
    model: process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6",
    outDir: resolve(ROOT, "reports"),
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--translators" && argv[i + 1])
      opts.translators = argv[++i].split(",").map((s) => s.trim());
    else if (a === "--limit" && argv[i + 1]) opts.limit = Number(argv[++i]);
    else if (a === "--random" && argv[i + 1]) opts.random = Number(argv[++i]);
    else if (a === "--model" && argv[i + 1]) opts.model = argv[++i];
    else if (a === "--concurrency" && argv[i + 1]) opts.concurrency = Number(argv[++i]);
    else if (a === "--delay-ms" && argv[i + 1]) opts.delayMs = Number(argv[++i]);
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pickHexNumbers(opts) {
  if (opts.random > 0) {
    const count = Math.min(opts.random, 64);
    const bag = Array.from({ length: 64 }, (_, i) => i + 1);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag.slice(0, count).sort((a, b) => a - b);
  }
  return Array.from({ length: Math.min(opts.limit, 64) }, (_, i) => i + 1);
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

function extractCategory(text) {
  const m = text.match(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im);
  return m?.[1] ?? null;
}

function renderForReview(fullText) {
  // What the user effectively sees: category stripped, machine SNAPSHOT removed.
  return fullText
    .replace(/\[SNAPSHOT_START\][\s\S]*?\[SNAPSHOT_END\]/, "")
    .replace(/^#{0,6}\s*(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*(?:\n|$)/im, "")
    .trim();
}

function stripForValidation(fullText) {
  return renderForReview(fullText);
}

async function main() {
  const opts = parseArgs(process.argv);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY required");
    process.exit(1);
  }

  const hexToLines = buildHexToYoungLineValues();
  const coverage = Object.keys(hexToLines).length;
  if (coverage !== 64) {
    console.error(`Expected 64 hexagrams mapped, got ${coverage}`);
    process.exit(1);
  }

  const hexNumbers = pickHexNumbers(opts);
  const hexCount = hexNumbers.length;
  const pickLabel = opts.random > 0 ? "random" : "sequential";
  console.log(
    `Reading-quality QA (${pickLabel}): ${opts.translators.join("+")} × ${hexCount} hexagrams = ${opts.translators.length * hexCount} API calls`,
  );
  if (opts.random > 0) console.log(`Hex picks: ${hexNumbers.join(", ")}`);
  console.log(`Model: ${opts.model} · tier=${opts.tier} · lang=${opts.language} · NO_CHANGING (zero mutation)`);

  const started = Date.now();
  const rows = [];

  const tasks = [];
  for (const translator of opts.translators) {
    for (const n of hexNumbers) {
      tasks.push(async () => {
        const lineValues = hexToLines[n];
        const { q, cat } = QUESTIONS[n - 1];
        const cast = performCastFromLineValues(q, opts.language, lineValues, {
          translator,
          id: `rq-${translator}-${n}`,
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
        if (apiResult?.text) {
          validation = validateInterpretationOutput(stripForValidation(apiResult.text), cast, {
            mode: "ritual",
          });
        }
        const detectedCategory = apiResult?.text ? extractCategory(apiResult.text) : null;
        // Gate H7 (judgment/image verbatim fidelity) already runs inside
        // validateInterpretationOutput and lands in warnFailures — surfaced
        // here as its own column per docs/auditorias/
        // 20260624-AUD-RDG-QA-02-verbatim-blockquote-gap.md §8.
        const judgmentImageVerbatimFailures = validation?.warnFailures.filter((f) => f.gate === "H7") ?? [];

        const row = {
          hexagram: n,
          hexagramName: cast.primaryHexagram.chineseName,
          hexagramEnglish: cast.primaryHexagram.name ?? null,
          translator,
          model: opts.model,
          question: q,
          intendedCategory: cat,
          detectedCategory,
          mutationRule: cast.mutationRule,
          changingLines: cast.changingLines,
          blockingPass: validation ? validation.blockingFailures.length === 0 : false,
          warnCount: validation?.warnFailures.length ?? 0,
          blockingFailures: validation?.blockingFailures ?? [],
          warnFailures: validation?.warnFailures ?? [],
          judgmentImageVerbatimFailures,
          latencyMs,
          inputTokens: apiResult?.inputTokens ?? null,
          outputTokens: apiResult?.outputTokens ?? null,
          stopReason: apiResult?.stopReason ?? null,
          error,
          rendered: apiResult?.text ? renderForReview(apiResult.text) : null,
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
          `[${status}] hex ${String(n).padStart(2, "0")} ${cast.primaryHexagram.chineseName} / ${translator} (${latencyMs}ms, out=${row.outputTokens})`,
        );
      });
    }
  }

  await runPool(tasks, opts.concurrency);

  rows.sort((a, b) =>
    a.hexagram - b.hexagram || a.translator.localeCompare(b.translator),
  );

  mkdirSync(opts.outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonPath = resolve(opts.outDir, `reading-quality-qa-${stamp}.json`);
  const mdPath = resolve(opts.outDir, `reading-quality-qa-${stamp}.md`);
  const txPath = resolve(opts.outDir, `reading-quality-qa-${stamp}-transcripts.md`);

  const summary = {
    generatedAt: new Date().toISOString(),
    model: opts.model,
    tier: opts.tier,
    language: opts.language,
    durationMs: Date.now() - started,
    totalCalls: rows.length,
    blockingPass: rows.filter((r) => !r.error && r.blockingPass).length,
    withWarn: rows.filter((r) => !r.error && r.blockingPass && r.warnCount > 0).length,
    blockingFail: rows.filter((r) => !r.error && !r.blockingPass).length,
    errors: rows.filter((r) => r.error).length,
    avgOutputTokens: Math.round(
      rows.filter((r) => r.outputTokens).reduce((s, r) => s + r.outputTokens, 0) /
        Math.max(1, rows.filter((r) => r.outputTokens).length),
    ),
    judgmentImageVerbatimFailRows: rows
      .filter((r) => r.judgmentImageVerbatimFailures.length > 0)
      .map((r) => `${r.hexagram}/${r.translator}`),
    scope:
      "NO_CHANGING reading quality; changing lines covered by mutation QA. " +
      "judgmentImageVerbatimFailures is the production Gate H7 (warn-only; backend/claude/src/interpretation-judgment-image-gate.ts).",
    hexNumbers,
    rows,
  };
  writeFileSync(jsonPath, JSON.stringify(summary, null, 2), "utf8");

  const mdLines = [
    `# Reading-quality QA (NO_CHANGING) — ${summary.generatedAt}`,
    "",
    `Model: \`${summary.model}\` · tier ${summary.tier} · lang ${summary.language}`,
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Total calls | ${summary.totalCalls} |`,
    `| Blocking pass | ${summary.blockingPass} |`,
    `| Pass with warns | ${summary.withWarn} |`,
    `| Blocking fail | ${summary.blockingFail} |`,
    `| API errors | ${summary.errors} |`,
    `| Avg output tokens | ${summary.avgOutputTokens} |`,
    `| Duration | ${Math.round(summary.durationMs / 1000)}s |`,
    `| Gate H7 verbatim fail (judgment/image) | ${summary.judgmentImageVerbatimFailRows.length}: [${summary.judgmentImageVerbatimFailRows.join(", ")}] |`,
    "",
    "| Hex | Name | Translator | Status | Warns | H7 | Cat (model) | Out tok |",
    "|-----|------|------------|--------|-------|----|-------------|---------|",
  ];
  for (const r of rows) {
    const st = r.error ? "ERR" : r.blockingPass ? (r.warnCount ? "WARN" : "OK") : "FAIL";
    const h7 = r.judgmentImageVerbatimFailures.length
      ? r.judgmentImageVerbatimFailures.map((f) => f.detail.field).join(",")
      : "ok";
    mdLines.push(
      `| ${r.hexagram} | ${r.hexagramName} | ${r.translator} | ${st} | ${r.warnCount} | ${h7} | ${r.detectedCategory ?? "-"} | ${r.outputTokens ?? "-"} |`,
    );
  }
  writeFileSync(mdPath, mdLines.join("\n"), "utf8");

  // Transcripts grouped by hexagram: Wilhelm and Legge side by side for review.
  const groups = new Map();
  for (const r of rows) {
    if (!groups.has(r.hexagram)) groups.set(r.hexagram, []);
    groups.get(r.hexagram).push(r);
  }
  const txLines = [`# Reading-quality QA transcripts — ${summary.generatedAt}`, ""];
  for (const [hex, grp] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
    const g0 = grp[0];
    txLines.push(
      `## Hexagram ${hex} · ${g0.hexagramName}`,
      "",
      `**Pregunta:** ${g0.question}`,
      "",
      `Categoría intencional: ${g0.intendedCategory} · regla: ${g0.mutationRule} · cambiantes: [${g0.changingLines.join(",")}]`,
      "",
    );
    for (const r of grp.sort((a, b) => a.translator.localeCompare(b.translator))) {
      const st = r.error ? "ERR" : r.blockingPass ? (r.warnCount ? "WARN" : "PASS") : "FAIL";
      txLines.push(
        `### ${r.translator} — ${st}${r.warnCount ? ` (${r.warnCount} warn)` : ""} · cat=${r.detectedCategory ?? "-"} · out=${r.outputTokens ?? "-"}`,
        "",
      );
      if (r.blockingFailures?.length)
        txLines.push(`> blocking: ${r.blockingFailures.map((f) => f.gate).join(" · ")}`, "");
      if (r.warnFailures?.length)
        txLines.push(`> warn: ${r.warnFailures.map((f) => f.gate).join(" · ")}`, "");
      txLines.push(r.error ? `(API error: ${r.error})` : (r.rendered ?? "(no text)"), "", "---", "");
    }
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
