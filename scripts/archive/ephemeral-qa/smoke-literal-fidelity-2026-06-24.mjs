#!/usr/bin/env node
/**
 * smoke-literal-fidelity-2026-06-24.mjs
 *
 * Smoke test puntual (no recurrente) pedido por el usuario tras el fix del
 * falso FAIL en line-reading-system-qa.mjs: 20 llamadas reales a la API,
 * 10 de fidelidad literal base (Juicio/Imagen, 0-1 línea, system-agnóstico)
 * y 10 del eje de líneas cambiantes (5 Zhu Xi + 5 Huang), rotando los 3
 * traductores base + master_combined en ambos bloques. Compara 1:1 contra
 * `cast.textsForClaude` (fuente única de verdad del motor) carácter a
 * carácter, igual que el fix de line-reading-system-qa.mjs.
 *
 * Gasta tokens reales de la API. Uso: node scripts/smoke-literal-fidelity-2026-06-24.mjs
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

const { performCastFromLineValues } = await import(
  "../packages/iching-engine/dist/index.js"
);
const {
  buildAnthropicUserPayloadForCast,
  buildAnthropicInterpretationParams,
  validateInterpretationOutput,
  normalizeForVerbatimCompare,
} = await import("../backend/claude/dist/index.js");

const QUESTIONS = {
  zero: "¿Cómo está realmente mi relación con mi hermano ahora mismo?",
  one: "Estoy dudando si aceptar una oferta de trabajo en otra ciudad.",
  two_yy: "Siento que mi pareja y yo estamos distanciándonos. ¿Qué pasa?",
  two_same: "¿Debería invertir mis ahorros en este proyecto con un amigo?",
  two_same_yin: "¿Debería poner fin a esta amistad que ya no me suma?",
  three_a: "Mi vida está cambiando en muchos frentes a la vez y me siento perdido.",
  three_b: "Tengo varias decisiones grandes pendientes este mes. ¿Por dónde empiezo?",
  four: "Estoy reinventándome por completo tras un divorcio. ¿Hacia dónde voy?",
  five: "Todo en mi vida está en movimiento salvo una cosa. ¿Qué significa?",
};
const LINES = {
  zero: [7, 8, 7, 8, 7, 8],
  one: [9, 8, 7, 8, 7, 8],
  two_yy: [6, 9, 7, 8, 7, 8],
  two_same: [7, 9, 7, 9, 7, 7],
  two_same_yin: [6, 7, 6, 7, 7, 7],
  three_a: [6, 9, 7, 9, 7, 7],
  three_b: [7, 9, 7, 9, 9, 7],
  four: [9, 9, 9, 9, 7, 7],
  five: [9, 9, 9, 9, 9, 7],
};

// ─── Bloque A: fidelidad literal base (Juicio/Imagen, 0-1 línea) ───
const BLOCK_A = [
  { case: "zero", system: "huang", translator: "wilhelm", model: "claude-sonnet-4-6" },
  { case: "zero", system: "huang", translator: "legge", model: "claude-sonnet-4-6" },
  { case: "zero", system: "huang", translator: "zhouyi", model: "claude-sonnet-4-6" },
  { case: "zero", system: "huang", translator: "master_combined", model: "claude-sonnet-4-6" },
  { case: "one", system: "huang", translator: "wilhelm", model: "claude-sonnet-4-6" },
  { case: "one", system: "huang", translator: "legge", model: "claude-sonnet-4-6" },
  { case: "one", system: "huang", translator: "zhouyi", model: "claude-sonnet-4-6" },
  { case: "one", system: "huang", translator: "master_combined", model: "claude-sonnet-4-6" },
  { case: "zero", system: "huang", translator: "wilhelm", model: "claude-sonnet-4-5-20250929" },
  { case: "one", system: "huang", translator: "legge", model: "claude-sonnet-4-5-20250929" },
];

// ─── Bloque B: líneas cambiantes — 5 Zhu Xi + 5 Huang ───
const BLOCK_B = [
  { case: "two_yy", system: "zhuxi", translator: "wilhelm", model: "claude-sonnet-4-6" },
  { case: "two_same", system: "zhuxi", translator: "legge", model: "claude-sonnet-4-6" },
  { case: "two_same_yin", system: "zhuxi", translator: "zhouyi", model: "claude-sonnet-4-6" },
  { case: "three_a", system: "zhuxi", translator: "master_combined", model: "claude-sonnet-4-6" },
  { case: "four", system: "zhuxi", translator: "wilhelm", model: "claude-sonnet-4-6" },
  { case: "two_yy", system: "huang", translator: "legge", model: "claude-sonnet-4-6" },
  { case: "two_same", system: "huang", translator: "zhouyi", model: "claude-sonnet-4-6" },
  { case: "three_b", system: "huang", translator: "master_combined", model: "claude-sonnet-4-6" },
  { case: "four", system: "huang", translator: "wilhelm", model: "claude-sonnet-4-6" },
  { case: "five", system: "huang", translator: "legge", model: "claude-sonnet-4-6" },
];

async function callAnthropic({ apiKey, model, system, user, maxTokens }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return { text: (data.content ?? []).map((b) => b.text ?? "").join("\n") };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Despoja marcadores de blockquote (`> `) y énfasis (`*texto*`) línea por
 * línea antes de unir con espacio. Necesario porque los Juicios/Imágenes de
 * Wilhelm suelen tener saltos de línea internos por estrofa (p. ej. "AFTER
 * COMPLETION...\nPerseverance furthers.\n..."), y el modelo correctamente
 * los renderiza como un blockquote por línea (`> *línea*` repetido) — un
 * `.includes()` crudo sobre el texto canónico con \n nunca matchea contra
 * eso aunque el contenido sea idéntico. Misma normalización que usa el gate
 * de producción H7 (`normalizeForVerbatimCompare`), más el despojo de
 * marcadores markdown que H7 hace por separado en `extractQuote()`.
 */
function flattenQuoted(raw) {
  return normalizeForVerbatimCompare(
    raw
      .split("\n")
      .map((line) => line.trim().replace(/^>\s*/, "").replace(/^\*(.*)\*$/, "$1"))
      .join(" "),
  );
}

/** Comparación literal 1:1 contra cast.textsForClaude (misma lógica del fix en line-reading-system-qa.mjs). */
function literalChecks(text, t, judgments) {
  const issues = [];
  const haystack = flattenQuoted(text);
  const cites = (expected) => haystack.includes(flattenQuoted(expected));

  if (judgments) {
    if (!t.primaryJudgment || !cites(t.primaryJudgment)) {
      issues.push("falta cita literal del Juicio primario");
    }
    if (!t.transformedJudgment || !cites(t.transformedJudgment)) {
      issues.push("falta cita literal del Juicio transformado");
    }
  }
  if (!judgments && !cites(t.primaryJudgment)) {
    issues.push("falta cita literal del Juicio primario");
  }
  if (!judgments && !cites(t.primaryImage)) {
    issues.push("falta cita literal de la Imagen primaria");
  }
  for (const entry of t.selectedLineTexts) {
    if (!cites(entry.text)) {
      issues.push(`línea ${entry.position}: cita literal no encontrada`);
    }
  }
  return issues;
}

async function runBlock(label, plan) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
  const rows = [];
  const transcript = [`# ${label}\n`];

  for (const item of plan) {
    const question = QUESTIONS[item.case];
    const lines = LINES[item.case];
    const cast = performCastFromLineValues(question, "es", lines, {
      translator: item.translator,
      lineReadingSystem: item.system,
    });
    const payload = buildAnthropicUserPayloadForCast(cast, "master", "es", "ritual");
    const { max_tokens: maxTokens } = buildAnthropicInterpretationParams(process.env, {
      isMasterCombined: payload.isMasterCombined,
      hasContext: false,
      modelOverride: item.model,
    });

    let text = "", error = null, validation = null, extra = [];
    const isJudgmentsCase = !!cast.textsForClaude.judgmentEmphasis;
    try {
      const r = await callAnthropic({
        apiKey, model: item.model, system: payload.system, user: payload.user, maxTokens,
      });
      text = r.text;
      validation = validateInterpretationOutput(text, cast, { mode: "ritual" });
      extra = literalChecks(text, cast.textsForClaude, isJudgmentsCase);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    await sleep(1200);

    const pass = !error && validation?.passed && extra.length === 0;
    rows.push({
      case: item.case, system: item.system, translator: item.translator, model: item.model,
      rule: cast.mutationRule, pass,
      blocking: validation?.blockingFailures?.map((f) => f.gate) ?? [],
      extra, error,
    });
    transcript.push(
      `## ${item.case} · ${item.system} · ${item.translator} · ${item.model}\n` +
      `- **Regla:** \`${cast.mutationRule}\` · **Pass:** ${pass ? "PASS" : "FAIL"}` +
      `${error ? ` · **Error:** ${error}` : ""}` +
      `${(validation?.blockingFailures?.length ?? 0) > 0 ? ` · **Gates:** ${validation.blockingFailures.map((f) => f.gate).join(",")}` : ""}` +
      `${extra.length ? ` · **Issues:** ${extra.join("; ")}` : ""}\n\n` +
      `**Pregunta:** ${question}\n\n${text || "(sin respuesta)"}\n\n---\n`,
    );
    process.stdout.write(pass ? "." : "x");
  }
  process.stdout.write("\n");
  return { label, rows, transcript };
}

async function main() {
  const a = await runBlock("Bloque A — fidelidad literal base (Juicio/Imagen, 0-1 línea)", BLOCK_A);
  const b = await runBlock("Bloque B — líneas cambiantes (5 Zhu Xi + 5 Huang)", BLOCK_B);

  const all = [...a.rows, ...b.rows];
  const passN = all.filter((r) => r.pass).length;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = resolve(ROOT, "reports");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    resolve(outDir, `smoke-literal-fidelity-${stamp}.json`),
    JSON.stringify({ stamp, total: all.length, pass: passN, fail: all.length - passN, blockA: a.rows, blockB: b.rows }, null, 2),
  );
  writeFileSync(
    resolve(outDir, `smoke-literal-fidelity-${stamp}-transcripts.md`),
    [...a.transcript, ...b.transcript].join("\n"),
  );

  console.log("\n=== Resumen ===");
  console.log(`Bloque A: ${a.rows.filter((r) => r.pass).length}/${a.rows.length} PASS`);
  console.log(`Bloque B: ${b.rows.filter((r) => r.pass).length}/${b.rows.length} PASS`);
  console.log(`Total: ${passN}/${all.length} PASS`);
  for (const r of all) {
    console.log(
      `${r.pass ? "PASS" : "FAIL"} | ${r.case.padEnd(13)} | ${r.system.padEnd(6)} | ${r.translator.padEnd(15)} | ${r.model.padEnd(28)} | blocking=${r.blocking.join(",") || "-"} | issues=${r.extra.join("; ") || "-"}${r.error ? ` | ERROR: ${r.error}` : ""}`,
    );
  }
  console.log(`\nReportes en ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
