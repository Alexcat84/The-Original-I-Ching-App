import type { AppLocale } from "@iching-oracle/i18n";

type LangScore = { lang: AppLocale; score: number };

const LATIN_LANG_PATTERNS: Array<{ lang: AppLocale; words: readonly string[] }> = [
  {
    lang: "es",
    words: [
      "el",
      "la",
      "los",
      "las",
      "de",
      "que",
      "para",
      "con",
      "por",
      "como",
      "qué",
      "dónde",
      "cuál",
      "mensaje",
      "consulta",
      "camino",
      "relación",
      "estoy",
      "está",
      "tengo",
      "puedo",
      "sabes",
    ],
  },
  {
    lang: "en",
    words: [
      "the",
      "and",
      "what",
      "where",
      "when",
      "why",
      "how",
      "message",
      "relationship",
      "question",
      "path",
      "oracle",
      "reading",
      "should",
      "would",
      "could",
      "about",
      "because",
    ],
  },
  {
    lang: "pt",
    words: ["não", "você", "está", "ção", "ções", "pra", "queria", "com", "para", "porque"],
  },
  {
    lang: "fr",
    words: ["être", "avec", "pourquoi", "où", "ça", "merci", "vous", "nous", "dans", "cette"],
  },
  {
    lang: "de",
    words: ["und", "nicht", "ich", "dass", "über", "möchte", "fragen", "warum", "wenn"],
  },
  {
    lang: "it",
    words: ["perché", "sono", "voglio", "grazie", "quindi", "domanda", "questo", "della"],
  },
];

function countWordHits(text: string, words: readonly string[]): number {
  let score = 0;
  for (const word of words) {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    score += text.match(re)?.length ?? 0;
  }
  return score;
}

function scoreLatinLanguages(text: string): LangScore[] {
  const lower = text.toLowerCase();
  const scores = LATIN_LANG_PATTERNS.map(({ lang, words }) => ({
    lang,
    score: countWordHits(lower, words),
  }));

  const esEntry = scores.find((s) => s.lang === "es");
  if (esEntry && /[áíóúñ¿¡]/i.test(text)) {
    esEntry.score += 3;
  }

  const frEntry = scores.find((s) => s.lang === "fr");
  if (frEntry && /[àâçèêëîïôùû]/i.test(text)) {
    frEntry.score += 2;
  }

  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Detect output language from question text vs UI locale.
 * - UI locale wins when the question is ambiguous.
 * - Question language wins when clearly dominant (margin ≥ 2 over UI score).
 * - Script detection (CJK/Arabic/Devanagari) overrides Latin heuristics.
 */
export function detectInputLanguage(question: string, uiLocale: AppLocale): AppLocale {
  const text = question.trim();
  if (!text) return uiLocale;

  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return "ja";
  if (/[\u4e00-\u9fff]/.test(text)) return "zh";

  const ranked = scoreLatinLanguages(text);
  const best = ranked[0];
  const second = ranked[1];
  const uiScore = ranked.find((r) => r.lang === uiLocale)?.score ?? 0;

  if (!best || best.score < 2) return uiLocale;

  if (best.lang !== uiLocale && best.score >= uiScore + 2) {
    return best.lang;
  }

  if (best.score - (second?.score ?? 0) >= 2 && best.score >= 2) {
    return best.lang;
  }

  if (uiScore > 0) return uiLocale;

  return best.lang;
}
