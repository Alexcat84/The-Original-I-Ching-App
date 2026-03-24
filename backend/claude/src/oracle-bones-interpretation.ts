import Anthropic from "@anthropic-ai/sdk";
import type { SessionContext } from "@iching-oracle/context-engine";
import type { OracleBonesCastResult } from "@iching-oracle/oracle-bones-engine";
import type { ConsultationCategory } from "@iching-oracle/image-engine";
import { buildContextBlock, type ResponseMode } from "./interpretation-context.js";
import { loadClaudeEnv } from "./env.js";
import { stripInterpretationFluff } from "./response-clean.js";

const ORACLE_BONES_SYSTEM = `You are the Royal Diviner (贞人 zhen ren) for a stylized Shang-era oracle bone session in a modern app.
The crack pattern, verdict code, and yes/no alignment are FIXED by the system — you must not contradict them.
Speak plainly about actions, timing, and risk; avoid I Ching hexagram poetry here.
One or two short flowing paragraphs, no bullet lists.
Write entirely in the user's requested language—no mixing Spanish and English (or other pairs) in the same response.
Do not append generic legal or symbolic-vs-prediction disclaimers; the app handles compliance elsewhere.`;

const MODEL_CONFIG = {
  free: { model: "claude-3-5-haiku-20241022", maxTokens: 500 },
  seeker: { model: "claude-3-5-haiku-20241022", maxTokens: 650 },
  practitioner: { model: "claude-3-5-sonnet-20241022", maxTokens: 800 },
  master: { model: "claude-3-5-sonnet-20241022", maxTokens: 950 },
  oracle: { model: "claude-3-5-sonnet-20241022", maxTokens: 1100 },
} as const;

function getLanguageName(language: string): string {
  const map: Record<string, string> = {
    es: "Spanish",
    en: "English",
    pt: "Portuguese",
    fr: "French",
    de: "German",
    it: "Italian",
    ja: "Japanese",
    zh: "Chinese",
    ko: "Korean",
  };
  return map[language] ?? "Spanish";
}

function buildOracleBonesUserContent(
  cast: OracleBonesCastResult,
  tier: string,
  language: string,
  hasContext: boolean,
  mode: ResponseMode,
): string {
  const wordCounts: Record<string, string> = {
    free: "120-150",
    seeker: "150-180",
    practitioner: "220-260",
    master: "300-340",
    oracle: "380-420",
  };
  const aff =
    cast.affirmsPositive === null
      ? "ANCESTORS SILENT — no clear yes/no after repeated indeterminate cracks."
      : cast.affirmsPositive
        ? "Verdict aligns with the POSITIVE charge (favorable to proceeding as stated)."
        : "Verdict aligns with the NEGATIVE charge (not favorable as the positive charge claims).";

  const modeNote =
    mode === "profundizar"
      ? language === "es"
        ? "Modo profundizar: conecta brevemente con la consulta previa (una frase) y aporta matices nuevos a ESTE resultado de grietas."
        : "Deepen mode: at most one sentence links to the prior message; add new nuance to THIS crack outcome only."
      : language === "es"
        ? "Explica en lenguaje directo qué implica el veredicto para la decisión del consultante."
        : "Explain plainly what the verdict implies for the querent’s decision.";

  return `
NEW ORACLE BONES CONSULTATION${hasContext ? " (same thread as prior readings)" : ""}:
Positive charge (affirmation tested): "${cast.positiveCharge}"
Negative charge: "${cast.negativeCharge}"
Medium: ${cast.medium} (turtle plastron vs ox scapula — aesthetic only; verdict is fixed)
Crack pattern id: ${cast.patternId}
System verdict code: ${cast.verdict}
Ambiguous rounds before result: ${cast.ambiguousPasses}
Alignment: ${aff}

${modeNote}

INSTRUCTIONS:
- On the FIRST line write exactly: CATEGORY: [category]
  Categories: love_relationship, career_work, health_wellbeing,
  spiritual_inner, family_home, decision_path, conflict_challenge,
  travel_change, general
- Do not invent a different crack shape or verdict.
- Length: ${wordCounts[tier] ?? wordCounts.free} words
- Respond in ${getLanguageName(language)}
`.trim();
}

export async function generateOracleBonesInterpretation(
  cast: OracleBonesCastResult,
  tier: string,
  context: SessionContext | null,
  mode: ResponseMode,
  language: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ text: string; category: ConsultationCategory }> {
  if (cast.verdict === "silent") {
    const text =
      language === "es"
        ? `Tras tres indeterminaciones seguidas en la lectura del patrón de grieta, la tradición shang sugería a veces dejar pasar el asunto y no forzar un sí o no en ese momento. Vuelve a formular la consulta cuando veas el curso más claro.`
        : `After three indeterminate crack readings in a row, Shang-era practice often meant pausing rather than forcing a yes/no. Reformulate when the situation feels clearer.`;
    return { text, category: "general" };
  }

  const { ANTHROPIC_API_KEY, GROQ_API_KEY, GROQ_MODEL } = loadClaudeEnv(env);
  const cfg = MODEL_CONFIG[tier as keyof typeof MODEL_CONFIG] ?? MODEL_CONFIG.free;
  const hasContext = Boolean(context && context.previousConsultations.length > 0);
  const userContent = hasContext && context
    ? `${buildContextBlock(context, language, mode)}\n\n${buildOracleBonesUserContent(cast, tier, language, true, mode)}`
    : buildOracleBonesUserContent(cast, tier, language, false, mode);

  const systemPrompt = `${ORACLE_BONES_SYSTEM}\n\nLANGUAGE: Respond only in ${getLanguageName(language)}.`;

  if (ANTHROPIC_API_KEY) {
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });
    const block = response.content[0];
    const fullText = block.type === "text" ? block.text : "";
    const catMatch = fullText.match(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im);
    const category = (catMatch?.[1] as ConsultationCategory) ?? "decision_path";
    const cleanText = stripInterpretationFluff(fullText.replace(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*\n/im, "").trim());
    return { text: cleanText, category };
  }

  if (GROQ_API_KEY) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL ?? "llama-3.3-70b-versatile",
        temperature: 0.45,
        max_tokens: cfg.maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });
    if (response.ok) {
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const fullText = data.choices?.[0]?.message?.content ?? "";
      const catMatch = fullText.match(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:\s*([\w_]+)/im);
      const category = (catMatch?.[1] as ConsultationCategory) ?? "decision_path";
      const cleanText = stripInterpretationFluff(fullText.replace(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*\n/im, "").trim());
      if (cleanText.trim().length > 0) return { text: cleanText, category };
    }
  }

  const fallback =
    language === "es"
      ? `El patrón de grieta (${cast.verdict}) ${cast.affirmsPositive === null ? "no ofrece un sí o no claro en este momento." : cast.affirmsPositive ? "inclina el peso hacia el cargo positivo." : "inclina el peso hacia la negación del cargo."}`
      : `The crack outcome (${cast.verdict}) ${cast.affirmsPositive === null ? "offers no clear yes/no at this time." : cast.affirmsPositive ? "leans toward the positive charge." : "leans toward the negative charge."}`;
  return { text: fallback, category: "decision_path" };
}
