#!/usr/bin/env node
/**
 * line-reading-system-qa.mjs
 *
 * QA barrido del selector de reglas de lectura: cada caso de líneas cambiantes
 * × cada sistema (Huang | Zhu Xi) × N modelos Claude × traductores.
 * Usa el MISMO prompt y validadores de producción (sin temperature — default API),
 * exactamente como scripts/mutation-output-qa.mjs, extendido con el eje `system`.
 *
 * Requiere: `dist` compilado de iching-engine y backend/claude (npm run build en ambos).
 * Gasta tokens reales de la API — no se ejecuta automáticamente.
 *
 * Uso:
 *   node scripts/line-reading-system-qa.mjs
 *   node scripts/line-reading-system-qa.mjs --systems huang,zhuxi --models claude-sonnet-4-5-20250929,claude-sonnet-4-6
 *   node scripts/line-reading-system-qa.mjs --cases three_a,four --translators master_combined
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

// ─── Fixtures: una por clase de configuración de líneas cambiantes ───
// `lines` en orden 1–6 (6=yin viejo, 7=yang joven, 8=yin joven, 9=yang viejo).
// `expectLines` = posiciones que la regla DEBE citar por sistema; `expectJudgments`
// = el caso lee juicios (Zhu Xi 3 líneas), no líneas individuales.
const FIXTURES = [
  { id: "zero",    label: "0 cambian",            lines: [7, 8, 7, 8, 7, 8],
    question: "¿Cómo está realmente mi relación con mi hermano ahora mismo?",
    huang: { lines: [] }, zhuxi: { lines: [] } },
  { id: "one",     label: "1 cambia",             lines: [9, 8, 7, 8, 7, 8],
    question: "Estoy dudando si aceptar una oferta de trabajo en otra ciudad.",
    huang: { lines: [1] }, zhuxi: { lines: [1] } },
  { id: "two_yy",  label: "2 yin+yang",           lines: [6, 9, 7, 8, 7, 8],
    question: "Siento que mi pareja y yo estamos distanciándonos. ¿Qué pasa?",
    huang: { lines: [1] }, zhuxi: { lines: [1, 2], primary: 2 } },
  { id: "two_same",label: "2 mismo tipo (yang)",  lines: [7, 9, 7, 9, 7, 7],
    question: "¿Debería invertir mis ahorros en este proyecto con un amigo?",
    huang: { lines: [2] }, zhuxi: { lines: [2, 4], primary: 4 } },
  { id: "two_same_yin", label: "2 mismo tipo (yin)", lines: [6, 7, 6, 7, 7, 7],
    question: "¿Debería poner fin a esta amistad que ya no me suma?",
    huang: { lines: [1] }, zhuxi: { lines: [1, 3], primary: 3 } },
  { id: "three_a", label: "3 con pos 1 (Hacker A)", lines: [6, 9, 7, 9, 7, 7],
    question: "Mi vida está cambiando en muchos frentes a la vez y me siento perdido.",
    huang: { lines: [2] }, zhuxi: { judgments: true, emphasis: "primary" } },
  { id: "three_b", label: "3 sin pos 1 (Hacker B)", lines: [7, 9, 7, 9, 9, 7],
    question: "Tengo varias decisiones grandes pendientes este mes. ¿Por dónde empiezo?",
    huang: { lines: [4] }, zhuxi: { judgments: true, emphasis: "transformed" } },
  { id: "four",    label: "4 cambian",            lines: [9, 9, 9, 9, 7, 7],
    question: "Estoy reinventándome por completo tras un divorcio. ¿Hacia dónde voy?",
    huang: { lines: [6] }, zhuxi: { lines: [5, 6], primary: 5 } },
  { id: "five",    label: "5 cambian",            lines: [9, 9, 9, 9, 9, 7],
    question: "Todo en mi vida está en movimiento salvo una cosa. ¿Qué significa?",
    huang: { lines: [6] }, zhuxi: { lines: [6] } },
  { id: "six",     label: "6 cambian (no Qian/Kun)", lines: [9, 9, 9, 6, 6, 6],
    question: "Siento que estoy a punto de una transformación total. ¿Qué me espera?",
    huang: { lines: [] }, zhuxi: { lines: [] } },
  { id: "qian",    label: "6 Qian (用九)",        lines: [9, 9, 9, 9, 9, 9],
    question: "He liderado mucho últimamente y estoy agotado. ¿Qué necesito?",
    huang: { special: true }, zhuxi: { special: true } },
  { id: "kun",     label: "6 Kun (用六)",         lines: [6, 6, 6, 6, 6, 6],
    question: "Siento que solo estoy recibiendo y nunca tomo la iniciativa. ¿Está bien?",
    huang: { special: true }, zhuxi: { special: true } },
];

function parseArgs(argv) {
  const opts = {
    systems: ["huang", "zhuxi"],
    models: (process.env.LRS_QA_MODELS ?? "claude-sonnet-4-5-20250929,claude-sonnet-4-6")
      .split(",").map((s) => s.trim()).filter(Boolean),
    translators: ["wilhelm", "master_combined"],
    cases: null,
    language: "es",
    tier: "master",
    delayMs: 1200,
    outDir: resolve(ROOT, "reports"),
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--systems") opts.systems = next().split(",");
    else if (a === "--models") opts.models = next().split(",");
    else if (a === "--translators") opts.translators = next().split(",");
    else if (a === "--cases") opts.cases = next().split(",");
    else if (a === "--language") opts.language = next();
  }
  return opts;
}

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
 * Validaciones específicas del caso, sobre las del validador de producción.
 *
 * A diferencia de H1 (gate de producción, que solo compara un fingerprint de
 * los primeros 20 caracteres de cada línea — suficiente para decidir un retry
 * sin falsos negativos por espacios/puntuación), aquí se exige texto literal
 * completo carácter a carácter contra `cast.textsForClaude`: cada línea citada
 * y, en los casos Zhu Xi de 3 líneas, ambos Juicios (primario y transformado).
 * Esto cierra el hueco que H7 v1 deja sin gate automático en "El trazado
 * hacia…" para el hexagrama transformado.
 */
/**
 * Despoja blockquote (`> `) y énfasis (`*texto*`) línea por línea antes de
 * unir con espacio. Imprescindible: los Juicios/Imágenes/líneas de Wilhelm
 * suelen tener saltos de línea internos por estrofa (p. ej. "AFTER
 * COMPLETION...\nPerseverance furthers.\n..."), y el modelo correctamente
 * renderiza cada una como su propio `> *línea*` — un `.includes()` crudo
 * sobre el texto canónico con \n nunca matchea eso aunque el contenido sea
 * idéntico. Encontrado por smoke-literal-fidelity-2026-06-24.mjs: un primer
 * intento de este mismo fix (sin esta normalización) marcaba como FAIL un
 * caso 100% correcto. Misma normalización que usa el gate de producción H7
 * (`normalizeForVerbatimCompare`), más el despojo de marcadores markdown.
 */
function flattenQuoted(raw) {
  return normalizeForVerbatimCompare(
    raw
      .split("\n")
      .map((line) => line.trim().replace(/^>\s*/, "").replace(/^\*(.*)\*$/, "$1"))
      .join(" "),
  );
}

function caseChecks(text, fixture, system, cast) {
  const exp = fixture[system];
  const issues = [];
  const t = cast.textsForClaude;
  const haystack = flattenQuoted(text);
  const cites = (expected) => haystack.includes(flattenQuoted(expected));

  if (exp.judgments) {
    if (!t.primaryJudgment || !cites(t.primaryJudgment)) {
      issues.push("ZX 3-judgments: falta cita literal del Juicio primario");
    }
    if (!t.transformedJudgment || !cites(t.transformedJudgment)) {
      issues.push("ZX 3-judgments: falta cita literal del Juicio transformado");
    }
  }
  if (Array.isArray(exp.lines) && exp.lines.length > 0) {
    for (const pos of exp.lines) {
      const entry = t.selectedLineTexts.find((l) => l.position === pos);
      if (!entry) {
        issues.push(`línea ${pos}: no encontrada en cast.textsForClaude.selectedLineTexts`);
        continue;
      }
      if (!cites(entry.text)) {
        issues.push(`línea ${pos}: cita literal no encontrada en la respuesta`);
      }
    }
  }
  return issues;
}

async function main() {
  const opts = parseArgs(process.argv);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");

  const fixtures = opts.cases
    ? FIXTURES.filter((f) => opts.cases.includes(f.id))
    : FIXTURES;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync(opts.outDir, { recursive: true });
  const rows = [];
  const transcript = [`# Line Reading System QA — ${stamp}\n`];

  for (const fixture of fixtures) {
    for (const system of opts.systems) {
      for (const translator of opts.translators) {
        for (const model of opts.models) {
          const cast = performCastFromLineValues(
            fixture.question, opts.language, fixture.lines,
            { translator, lineReadingSystem: system },
          );
          const payload = buildAnthropicUserPayloadForCast(cast, opts.tier, opts.language, "ritual");
          const { max_tokens: maxTokens } = buildAnthropicInterpretationParams(process.env, {
            isMasterCombined: payload.isMasterCombined,
            hasContext: false,
            modelOverride: model,
          });

          let text = "", error = null, validation = null, extra = [];
          try {
            const r = await callAnthropic({ apiKey, model, system: payload.system, user: payload.user, maxTokens });
            text = r.text;
            validation = validateInterpretationOutput(text, cast, { mode: "ritual" });
            extra = caseChecks(text, fixture, system, cast);
          } catch (e) {
            error = e instanceof Error ? e.message : String(e);
          }
          await sleep(opts.delayMs);

          const pass = !error && validation?.passed && extra.length === 0;
          rows.push({
            case: fixture.id, system, translator, model,
            rule: cast.mutationRule, pass,
            blocking: validation?.blockingFailures?.map((f) => f.gate) ?? [],
            extra, error,
          });
          transcript.push(
            `## ${fixture.label} · ${system} · ${translator} · ${model}\n` +
            `- **Regla:** \`${cast.mutationRule}\` · **Pass:** ${pass ? "✅" : "❌"}` +
            `${error ? ` · **Error:** ${error}` : ""}` +
            `${(validation?.blockingFailures?.length ?? 0) > 0 ? ` · **Gates:** ${validation.blockingFailures.map((f) => f.gate).join(",")}` : ""}` +
            `${extra.length ? ` · **Notas:** ${extra.join("; ")}` : ""}\n\n` +
            `**Pregunta:** ${fixture.question}\n\n` +
            `${text || "(sin respuesta)"}\n\n---\n`,
          );
          process.stdout.write(pass ? "." : "x");
        }
      }
    }
  }

  const passN = rows.filter((r) => r.pass).length;
  const summary = { stamp, total: rows.length, pass: passN, fail: rows.length - passN, rows };
  writeFileSync(resolve(opts.outDir, `lrs-qa-${stamp}.json`), JSON.stringify(summary, null, 2));
  writeFileSync(resolve(opts.outDir, `lrs-qa-${stamp}-transcripts.md`), transcript.join("\n"));
  process.stdout.write(`\n\n${passN}/${rows.length} pass. Reports in ${opts.outDir}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
