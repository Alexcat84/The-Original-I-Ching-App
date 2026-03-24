import Anthropic from "@anthropic-ai/sdk";
import type { SessionContext } from "@iching-oracle/context-engine";
import type { CastResult } from "@iching-oracle/iching-engine";
import type { ConsultationCategory } from "@iching-oracle/image-engine";
import { loadClaudeEnv } from "./env.js";
import { buildContextBlock, type ResponseMode } from "./interpretation-context.js";
import { stripInterpretationFluff } from "./response-clean.js";

export type { ResponseMode } from "./interpretation-context.js";

const SYSTEM_PROMPT = `You are the Sage of the Oracle — an interpreter of the I Ching with deep knowledge of Wilhelm/Baynes, Zhu Xi, and the Confucian commentaries.

ABSOLUTE RULES:
1. Interpret ONLY with the classical texts provided.
2. If there are previous consultations in context, explicitly reference earlier hexagrams for continuity.
3. Never invent meanings — only connect texts with the question.
4. Poetic, profound language in the requested language.
5. Use Markdown in the answer body: ## for section titles, **bold** for key terms, > blockquotes for classical judgment quotes, numbered lists (1. 2. …) for changing lines when applicable. MONOLINGUAL: the entire response in one language only (the user's). Headings and glosses in that language; classical Chinese only inside blockquotes with immediate translation in the same language—never mix e.g. English titles in a Spanish answer.
6. Never present unverified real-world facts (numbers, identities, private or biographical details) as certain truth.
7. If the user asks for factual external data that cannot be verified from the provided I Ching texts, explicitly say you cannot verify that fact and then continue with symbolic interpretation.
8. Never add generic legal or "simbólica vs predicción" disclaimer paragraphs (e.g. "Es importante tener en cuenta…"). Never end with an asterisk-wrapped footnote; compliance copy lives outside the reading in the app.
9. ANTI-REPETITION: Each concrete point (a line's counsel, a judgment phrase, a practical recommendation) appears at most once in the entire answer. Do not restate the same advice across sections with different wording.
10. GROUNDING: Every interpretive claim must tether to the supplied judgment, Image, or line text—paraphrase or quote in blockquote, then bridge to the question. Avoid vague uplift that could apply to any hexagram.`;

const MODEL_CONFIG = {
  free: { model: "claude-3-5-haiku-20241022", maxTokens: 520 },
  seeker: { model: "claude-3-5-haiku-20241022", maxTokens: 780 },
  practitioner: { model: "claude-3-5-sonnet-20241022", maxTokens: 1200 },
  master: { model: "claude-3-5-sonnet-20241022", maxTokens: 1600 },
  oracle: { model: "claude-3-5-sonnet-20241022", maxTokens: 2000 },
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

function buildCurrentCastPrompt(
  cast: CastResult,
  tier: string,
  language: string,
  hasContext: boolean,
  mode: ResponseMode,
): string {
  const { question, textsForClaude: t, primaryHexagram: p, transformedHexagram: tr, mutationRule } = cast;
  const wordCounts: Record<string, string> = {
    free: "200-260",
    seeker: "340-420",
    practitioner: "480-580",
    master: "600-720",
    oracle: "720-880",
  };

  const lineBlock =
    t.selectedLineTexts.length > 0
      ? `
LINE TEXTS:
${t.selectedLineTexts
  .map(
    (l) =>
      `  Line ${l.position} [${l.fromHexagram === "primary" ? "primary" : "transformed"}]: ${l.text}`,
  )
  .join("\n")}`
      : "";

  const looksFactual = /\b(cuant[oa]s?|n[uú]mero exacto|edad|fecha|donde vive|where|how many|exact number|biography|biographical)\b/i.test(
    question,
  );
  const scrollHeadingsEs = `Use these exact ## headings in Spanish (Chinese labels 卦辞 / 之卦 only as shown):
## Encuadre de la pregunta
## El juicio (卦辞)
## Líneas en movimiento
## El trazado hacia el 之卦
## Horizonte y síntesis`;

  const scrollHeadingsEn = `Use these exact ## headings in English (Chinese labels only as shown):
## Framing the question
## The judgment (卦辞)
## Lines in motion
## The turning pattern (之卦)
## Horizon and synthesis`;

  const headingsBlock =
    language === "es"
      ? scrollHeadingsEs
      : language === "en"
        ? scrollHeadingsEn
        : `Use the same section structure and roles as ${scrollHeadingsEn} but translate section titles fully into ${getLanguageName(language)} (keep 卦辞 之卦 next to the translated title).`;

  const modeInstruction =
    mode === "directo"
      ? `FORMAT MODE: DIRECT (Markdown)
- Exactly two ## sections in ${getLanguageName(language)}: (1) direct answer + limits of certainty + hexagram tie-in; (2) symbolic reading + one concrete step. Spanish example titles: ## Lectura directa / ## Lectura simbólica.
- If a transformed hexagram exists, weave it into section 2; do not add a third section.`
      : mode === "profundizar"
        ? `FORMAT MODE: DEEPEN (Markdown, follow-up cast in session)
- Exactly two ## sections only, titled in ${getLanguageName(language)}. Spanish: ## Continuidad del hilo / ## Apertura desde esta tirada. English: ## Thread continuity / ## Opening from this cast.
- Section 1: what is new vs the prior cast (no paste of prior interpretation).
- Section 2: one fresh angle from THIS cast's texts + one practical step.
- Do not use the five-part scroll headings.`
        : `FORMAT MODE: ORACLE SCROLL (Markdown, mandatory structure)
${headingsBlock}

Section roles (cognitive arc — dense paragraphs, 2–4 sentences each; avoid long abstract gaps):
- "Encuadre de la pregunta" / "Framing the question": name the emotional or practical stake in one tight opening, then the received figure (number, name, Chinese).
- "El juicio" / "The judgment": mandatory blockquote (>) of the classical judgment when provided; immediately after, one paragraph that names how that wording maps onto the user's situation (explicit bridge).
- "Líneas en movimiento" / "Lines in motion": changing lines only—numbered list with line text + one sentence of application each; if no changing lines, one crisp sentence stating stability.
- "El trazado hacia el 之卦" / "The turning pattern": ONLY if transformed hexagram exists—quote transformed judgment if supplied, then tension / opportunity vs primary.
- "Horizonte y síntesis" / "Horizon and synthesis": single closing paragraph—one concrete behavioral or attitudinal step, same language, no new quotes.
- ANTI-REPETITION across sections as in global rules.`;

  return `
NEW CONSULTATION${hasContext ? " (continues thematic session)" : ""}:
"${question}"

═══════════════════════════════════
PRIMARY HEXAGRAM: #${p.number} — ${p.name} (${p.chineseName} · ${p.pinyin})
${p.upperTrigram} over ${p.lowerTrigram}

JUDGMENT: ${t.primaryJudgment}
${t.primaryImage ? `THE IMAGE: ${t.primaryImage}` : ""}

ACTIVE RULE: ${mutationRule}
${t.ruleExplanation}
${lineBlock}
${t.specialYaoText ? `SPECIAL TEXT: ${t.specialYaoText}` : ""}

${tr && t.transformedJudgment ? `
TRANSFORMED HEXAGRAM: #${tr.number} — ${tr.name} (${tr.chineseName})
JUDGMENT: ${t.transformedJudgment}` : ""}

═══════════════════════════════════
INSTRUCTIONS:
- On the FIRST line write exactly: CATEGORY: [category]
  Categories: love_relationship, career_work, health_wellbeing,
  spiritual_inner, family_home, decision_path, conflict_challenge,
  travel_change, general
- ${hasContext ? "Hay consultas previas en sesión: continuidad breve según bloque de contexto (no re-pegues interpretaciones largas)." : "Primera consulta de la sesión."}
- Interpret ONLY with the texts given
- In the first sentence, answer the user's question clearly and directly, but do not invent factual data.
- ${looksFactual ? "This question appears to request factual real-world data: explicitly state when that fact cannot be verified from the provided oracle texts." : "Do not claim certainty about external facts unless they are explicitly provided in the input."}
- If the question is about another person's private feelings or intentions, avoid certainty language. Use probability language (e.g., "podría", "parece", "sugiere"), never "es un hecho".
- ANTI-REPETITION: if you already stated an idea, do not restate it in other words in another section.
- ${mode === "ritual" ? "Follow the scroll structure; keep paragraphs visually compact (avoid stacking many one-line paragraphs)." : mode === "profundizar" ? "Max 2 sections as specified." : "Max 2 titled sections as specified."}
- ${modeInstruction}
- Length: ${wordCounts[tier] ?? wordCounts.free} words
- If source excerpts arrive in a different language (often English), TRANSLATE them into the response language before quoting. Do not leave mixed-language fragments.
- Respond in ${getLanguageName(language)}
`.trim();
}

export async function generateInterpretation(
  castResult: CastResult,
  tier: string,
  context: SessionContext | null,
  mode: ResponseMode = "ritual",
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ text: string; category: ConsultationCategory }> {
  const { ANTHROPIC_API_KEY, GROQ_API_KEY, GROQ_MODEL } = loadClaudeEnv(env);
  const language = castResult.language;
  const cfg = MODEL_CONFIG[tier as keyof typeof MODEL_CONFIG] ?? MODEL_CONFIG.free;

  const hasContext = Boolean(context && context.previousConsultations.length > 0);
  const userContent = hasContext && context
    ? `${buildContextBlock(context, language, mode)}\n\n${buildCurrentCastPrompt(castResult, tier, language, true, mode)}`
    : buildCurrentCastPrompt(castResult, tier, language, false, mode);

  const systemPrompt = `${SYSTEM_PROMPT}\n\nLANGUAGE: Respond only in ${getLanguageName(language)}.`;

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
    const category = (catMatch?.[1] as ConsultationCategory) ?? "general";
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
        temperature: 0.5,
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
      const category = (catMatch?.[1] as ConsultationCategory) ?? "general";
      const cleanText = stripInterpretationFluff(fullText.replace(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*\n/im, "").trim());
      if (cleanText.trim().length > 0) {
        return { text: cleanText, category };
      }
    }

    const cat: ConsultationCategory = "general";
    const body = `[Offline / groq_error] Mock interpretation for hexagram #${castResult.primaryHexagram.number}. ${castResult.textsForClaude.ruleExplanation}`;
    return { text: body, category: cat };
  }

  const cat: ConsultationCategory = "general";
  const body = `[Offline / no_model_api_key] Mock interpretation for hexagram #${castResult.primaryHexagram.number}. ${castResult.textsForClaude.ruleExplanation}`;
  return { text: body, category: cat };
}
