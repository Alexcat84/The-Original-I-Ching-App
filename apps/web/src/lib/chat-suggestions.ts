/**
 * Context-aware suggestion chips (Spanish, app default locale).
 * Combines category templates, thread history, last question keywords, and hexagram id for variety.
 */

const STOP = new Set([
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "de",
  "en",
  "y",
  "o",
  "a",
  "que",
  "es",
  "por",
  "para",
  "con",
  "se",
  "no",
  "mi",
  "tu",
  "al",
  "del",
  "lo",
  "como",
  "más",
  "ya",
  "si",
  "me",
  "te",
  "le",
  "les",
  "hay",
  "sobre",
  "qué",
  "cuando",
  "donde",
  "cómo",
  "porque",
  "esta",
  "este",
  "esto",
  "hoy",
  "bien",
]);

export function stableSuggestionSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function keywordsFrom(text: string, max = 4): string[] {
  const raw = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 3 && !STOP.has(w));
  return [...new Set(raw)].slice(0, max);
}

function pick<T>(arr: readonly T[], seed: number, count: number): T[] {
  if (arr.length <= count) return [...arr];
  const out: T[] = [];
  let x = seed;
  const pool = [...arr];
  while (out.length < count && pool.length) {
    x = (x * 1103515245 + 12345) | 0;
    const i = Math.abs(x) % pool.length;
    out.push(pool.splice(i, 1)[0]!);
  }
  return out;
}

const CATEGORY_DEEPEN: Record<string, readonly string[]> = {
  love_relationship: [
    "¿Qué límite sano queda más alineado con el 卦 que acabo de recibir?",
    "¿Cómo se traduce esta lectura en un gesto concreto hacia la otra persona esta semana?",
    "¿Qué miedo mío podría estar coloreando lo que dice el texto clásico?",
    "Si repito la consulta, ¿qué matiz nuevo debería preguntar sobre vínculo y confianza?",
  ],
  career_work: [
    "¿Qué riesgo práctico del entorno laboral encaja con la tensión que marca esta tirada?",
    "¿Hasta cuándo conviene sostener el rumbo actual según lo que enfatiza el juicio?",
    "¿Qué habilidad o alianza debería reforzar antes del siguiente paso visible?",
    "¿Cómo separo ambición realista de prisa defensiva en mi situación?",
  ],
  health_wellbeing: [
    "¿Qué señal de ritmo (descanso / actividad) pide más atención según esta lectura?",
    "¿Dónde conviene pedir apoyo profesional sin dramatizar lo que aparece en el 卦?",
    "¿Qué hábito pequeño sostiene mejor el equilibrio que sugiere el texto?",
    "¿Qué parte del cuerpo o del ánimo quedó implícita en la pregunta y falta nombrar?",
  ],
  spiritual_inner: [
    "¿Qué práctica breve (silencio, diario, caminata) integra mejor este mensaje?",
    "¿Qué resistencia interior conviene observar sin juzgar, a la luz del juicio?",
    "¿Qué creencia vieja choca con la orientación que emerge aquí?",
    "¿Hacia qué tipo de claridad me empuja el trazado sin forzar respuestas mágicas?",
  ],
  family_home: [
    "¿Cómo digo esto en casa sin convertir la lectura en sermón?",
    "¿Qué rol me toca asumir y cuál no, según la tensión del hexagrama?",
    "¿Qué límite protege al grupo sin cortar el diálogo?",
    "¿Qué pregunta a un familiar ayudaría a bajar la abstracción?",
  ],
  decision_path: [
    "¿Qué criterio debería pesar más al decidir: tiempo, valor o relación?",
    "¿Qué coste asumo si elijo no decidir en las próximas semanas?",
    "¿Qué escenario alternativo merece una segunda lectura más acotada?",
    "¿Dónde está la duda real debajo de la pregunta formulada?",
  ],
  conflict_challenge: [
    "¿Qué parte del conflicto puedo desescalar yo primero, sin ceder lo esencial?",
    "¿Dónde está el equilibrio entre firmeza y apertura en este 卦?",
    "¿Qué malentendido podría estar alimentando el choque?",
    "¿Qué victoria silenciosa encaja mejor que imponerme?",
  ],
  travel_change: [
    "¿Qué dejo atrás con intención si avanzo con este cambio de contexto?",
    "¿Qué señal práctica (fecha, apoyo, logística) debería vigilar?",
    "¿Qué me ancla y qué me impulsa según la lectura?",
    "¿Hay un “no” implícito en el trazado que aún no he nombrado?",
  ],
  general: [
    "¿Qué matiz práctico añade esta lectura a lo que ya sabía de mi situación?",
    "¿Hacia dónde tiende el cambio si sigo el rumbo actual sin fantasía ni pesimismo?",
    "¿Qué debo vigilar para no malinterpretar un verso del juicio?",
    "¿Qué pregunta más concreta (fecha, persona, ámbito) aclararía el siguiente paso?",
  ],
};

const WELCOME_ROTATING: readonly string[][] = [
  [
    "¿Qué frente de mi vida necesita una lectura clara esta semana?",
    "¿Qué decisión me pesa y necesita el marco del 易?",
    "¿Dónde siento bloqueo y quiero otra perspectiva simbólica?",
    "¿Qué relación o proyecto merece una pregunta bien formulada al oráculo?",
  ],
  [
    "¿Qué debo priorizar para avanzar sin apresurar el destino?",
    "¿Cuál es el siguiente paso sabio en lo que me importa ahora?",
    "¿Qué patrón conviene reconocer antes de actuar?",
    "¿Cómo formulo la tensión real que llevo dentro?",
  ],
  [
    "¿Qué cambio externo refleja un movimiento interno que aún no nombré?",
    "¿En qué ámbito necesito contención y en cuál impulso?",
    "¿Qué pregunta evito hacer por miedo a la respuesta?",
    "¿Cómo invito al oráculo sin pedirle una predicción literal?",
  ],
];

function keywordPrompts(kws: string[], seed: number): string[] {
  if (!kws.length) return [];
  const [a, b] = [kws[0]!, kws[1] ?? kws[0]!];
  const pool = [
    `¿Cómo conecta lo dicho sobre “${a}” con la línea que muta en mi tirada?`,
    `Si centro la consulta en “${b}”, ¿qué ángulo del 卦 queda por explorar?`,
    `¿Qué pregunta más fina sobre “${a}” profundizaría sin repetir lo ya leído?`,
    `¿Qué consecuencia práctica de “${a}” encaja con el juicio clásico?`,
  ];
  return pick(pool, seed, 2);
}

export type SuggestionConsultSnapshot = {
  consultationId: string;
  question: string;
  interpretation: string;
  category: string;
  primaryHexagram: number;
  changingLines: number[];
};

export function buildWelcomePrompts(params: {
  threadLength: number;
  lastQuestion?: string;
  hour: number;
}): string[] {
  const seed = stableSuggestionSeed(`${params.threadLength}:${params.lastQuestion ?? ""}:${params.hour}`);
  const bucket = WELCOME_ROTATING[seed % WELCOME_ROTATING.length]!;
  const kws = params.lastQuestion ? keywordsFrom(params.lastQuestion, 2) : [];
  const extra =
    kws.length > 0
      ? [
          `¿Qué sigue siendo válido de “${kws[0]}” si miro el 易 con más calma?`,
          `¿Qué aspecto de “${kws[0] ?? "mi situación"}” no quedó dicho en la última tirada?`,
        ]
      : [];
  const merged = [...pick([...bucket, ...extra], seed, 4)];
  return merged.slice(0, 4);
}

export function buildDeepenPrompts(last: SuggestionConsultSnapshot | null, thread: SuggestionConsultSnapshot[]): string[] {
  if (!last) {
    return pick(CATEGORY_DEEPEN.general, stableSuggestionSeed("fallback"), 4);
  }
  const seed = stableSuggestionSeed(
    `${last.consultationId}:${last.question}:${last.primaryHexagram}:${last.changingLines.join(",")}`,
  );
  const cat = CATEGORY_DEEPEN[last.category] ?? CATEGORY_DEEPEN.general;
  const kws = keywordsFrom(`${last.question}\n${last.interpretation.slice(0, 400)}`, 4);
  const fromCat = pick([...cat], seed, 3);
  const fromKw = keywordPrompts(kws, seed + 17);
  const historyHint =
    thread.length > 1
      ? [
          `¿Cómo conversa esta tirada con la consulta anterior del hilo (pos. ${thread.length - 1})?`,
          "¿Qué quedó abierto en la pregunta previa que este 卦 ahora matiza?",
        ]
      : [];
  const merged = [...fromKw, ...fromCat, ...pick(historyHint, seed, 1)];
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const q of merged) {
    if (!seen.has(q)) {
      seen.add(q);
      unique.push(q);
    }
    if (unique.length >= 4) break;
  }
  let pad = 0;
  while (unique.length < 4 && pad < CATEGORY_DEEPEN.general.length * 2) {
    const q = CATEGORY_DEEPEN.general[pad % CATEGORY_DEEPEN.general.length]!;
    pad++;
    if (!seen.has(q)) {
      seen.add(q);
      unique.push(q);
    }
  }
  return unique.slice(0, 4);
}

export function buildBonesWelcomePrompts(seed: number): string[] {
  const pool = [
    "Aceptaré la oferta y será favorable para mí.",
    "Tomaré el camino nuevo y tendrá buen resultado.",
    "Invertiré en esto y se alineará con mi propósito.",
    "Si actúo ahora, el ancestro favorecerá el movimiento.",
    "La otra parte actuará de buena fe en este asunto.",
  ];
  return pick(pool, seed, 3);
}

export function buildBonesDeepenPrompts(last: { consultationId: string; question: string } | null): string[] {
  const seed = stableSuggestionSeed(last?.consultationId ?? "x");
  const kws = last ? keywordsFrom(last.question, 2) : [];
  const base = [
    "Si sigo adelante con el plan, ¿el resultado será propicio?",
    "¿Conviene esperar antes de actuar sobre este cargo?",
    "¿La otra parte actuará de buena fe en este asunto?",
    "¿Debo replantear el cargo positivo a la luz de lo leído?",
  ];
  const extra =
    kws.length > 0
      ? [
          `¿El veredicto sobre “${kws[0]}” cambia si acoto el plazo del cargo?`,
          `¿Qué cargo más preciso sustituye la vaguedad de “${kws[0]}”?`,
        ]
      : [];
  return pick([...extra, ...base], seed, 4);
}
