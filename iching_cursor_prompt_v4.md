# 🏯 I CHING ORACLE — MASTER BUILD PROMPT v4.0
# Para Cursor con agency-agents instalado
#
# CHANGELOG v4 vs v3:
#   ✦ Contexto persistente por sesión temática desde tier Seeker
#   ✦ Análisis histórico de patrones para Master y Oracle
#   ✦ Arquitectura de sesiones temáticas (Deepen vs New Session)
#   ✦ Precios actualizados: Seeker $6.99, Oracle $44.99
#   ✦ Prompt caching agresivo para contexto (90% descuento)
#   ✦ Costos recalculados con contexto acumulativo
#   ✦ Tests E2E actualizados para flujos contextuales
# ─────────────────────────────────────────────────────────────

## ⚙ ACTIVACIÓN DE AGENTES EN CURSOR

```
@engineering-software-architect
@engineering-frontend-developer
@engineering-ai-engineer
@design-whimsy-injector
@design-ui-designer
@design-image-prompt-engineer
@engineering-mobile-app-builder
@product-manager
@marketing-growth-hacker
@testing-reality-checker
@engineering-devops-automator
```

---

## 🎯 MISIÓN

Construir I Ching Oracle: la app más fiel al método clásico y visualmente
más impresionante del mercado. Diferenciadores clave sobre la competencia:

1. Fidelidad absoluta al método de Zhu Xi — 9 reglas de mutación sin errores
2. Contexto persistente por sesión temática — el oráculo recuerda y profundiza
3. Imágenes únicas por consulta + sharing viral — marketing orgánico automático
4. 2FA robusto + auth anti-abuso
5. Multi-idioma desde el día 1 (9 idiomas)
6. Escalable a 1000+ usuarios simultáneos sin degradación

DOS plataformas que comparten engine y backend:
  Web App  → Next.js 14 App Router → Vercel
  Mobile   → React Native + Expo SDK 51 → iOS + Android

IDIOMAS: ES, EN, PT, FR, DE, IT, JA, ZH, KO

---

## 📁 ESTRUCTURA DEL MONOREPO

```
iching-oracle/
├── apps/
│   ├── web/                      ← Next.js 14 App Router
│   └── mobile/                   ← React Native + Expo SDK 51
├── packages/
│   ├── iching-engine/             ← Motor I Ching puro (TypeScript, shared)
│   ├── iching-data/               ← Dataset Wilhelm/Baynes JSON
│   ├── context-engine/            ← NUEVO v4: gestor de sesiones y contexto
│   ├── image-engine/              ← Generador imágenes + watermark
│   ├── sharing/                   ← Sharing viral + landing pública
│   ├── i18n/                      ← Traducciones 9 idiomas
│   └── ui/                        ← Componentes compartidos
├── backend/
│   ├── api/                       ← Next.js API routes (Edge Runtime)
│   ├── claude/                    ← Claude API + contexto + caching
│   ├── image/                     ← Flux Schnell + Sharp watermark + Storage
│   ├── auth/                      ← Supabase Auth + 2FA TOTP + SMS
│   └── db/                        ← Schema Supabase + migrations
└── package.json                   ← Turborepo workspace
```

---

## 🔐 FASE 1 — AUTH CON 2FA COMPLETO
### Agente: @engineering-backend-architect + @engineering-security-engineer

### 1.1 — Flujo de registro

```
PASO 1 — Datos básicos:
  email + password (8+ chars, 1 número, 1 mayúscula)
  → Validar: no email desechable (disposable-email-domains + MX record DNS)
  → hCaptcha obligatorio en el formulario
  → Rate limit: 5 intentos de registro por IP por hora

PASO 2 — Confirmación de email:
  → Supabase envía link (expira 24h)
  → Sin confirmar: cuenta "pending" — puede ver la app, no consultar
  → Al confirmar: cuenta "active" — recibe 3 créditos de bienvenida

PASO 3 — 2FA (obligatorio Practitioner+, opcional Free/Seeker):
  OPCIÓN A — TOTP (Authenticator App):
    → Generar secret con otplib → QR code → verificar con código de 6 dígitos
    → Secret guardado encriptado AES-256 en DB
    → Compatible: Google Authenticator, Authy, Microsoft Authenticator
  OPCIÓN B — SMS (Twilio Verify):
    → Número en formato E.164 (+15551234567)
    → OTP de 6 dígitos, expira 10 minutos
  RECUPERACIÓN: 8 códigos de un solo uso, bcrypt hash en DB,
    mostrados UNA SOLA VEZ al activar 2FA
  SEGURIDAD: bloqueo tras 5 intentos fallidos en 15 minutos
```

### 1.2 — Schema DB auth

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  two_factor_enabled    BOOLEAN DEFAULT FALSE,
  two_factor_method     TEXT CHECK (two_factor_method IN ('sms','totp',NULL)),
  phone_number          TEXT,
  phone_verified_at     TIMESTAMPTZ,
  totp_secret           TEXT,        -- AES-256 encrypted
  totp_verified_at      TIMESTAMPTZ,
  language              TEXT DEFAULT 'es';

CREATE TABLE two_factor_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,           -- bcrypt hash
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE two_factor_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  ip_address TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_2fa_attempts ON two_factor_attempts(user_id, created_at DESC);
```

---

## 🪙 FASE 2 — ENGINE DE I CHING
### Agente: @engineering-ai-engineer

### 2.1 — Tipos base

```typescript
// packages/iching-engine/src/types.ts

export type LineValue = 6 | 7 | 8 | 9;
// Probabilidades con 3 monedas (cara=3, sello=2):
// 6 → 1/8  (2+2+2) Yin Viejo  MUTA → Yang
// 7 → 3/8  Yang Joven  estable
// 8 → 3/8  Yin Joven   estable
// 9 → 1/8  (3+3+3) Yang Viejo MUTA → Yin

export type LineType = 'yin_old' | 'yang_young' | 'yin_young' | 'yang_old';

export type MutationRule =
  | 'NO_CHANGING'
  | 'ONE_CHANGING'
  | 'TWO_YIN_YANG'
  | 'TWO_SAME_LOWER'
  | 'THREE_MIDDLE'
  | 'FOUR_LOWEST_STABLE'
  | 'FIVE_ONLY_STABLE'
  | 'SIX_ALL_CHANGING'
  | 'QIAN_ALL_NINE'
  | 'KUN_ALL_SIX';

export interface Line {
  position: 1|2|3|4|5|6;
  value: LineValue;
  type: LineType;
  isChanging: boolean;
  symbol: string;
}

export interface Hexagram {
  number: number;
  name: string;
  chineseName: string;
  pinyin: string;
  upperTrigram: string;
  lowerTrigram: string;
  judgment: string;
  image: string;
  lines: HexagramLine[];
  yongJiu?: string;  // Hexagrama 1 — texto 用九
  yongLiu?: string;  // Hexagrama 2 — texto 用六
}

export interface HexagramLine {
  position: 1|2|3|4|5|6;
  text: string;
  type: 'yin' | 'yang';
}

export interface TextsForClaude {
  primaryJudgment: string;
  primaryImage: string;
  selectedLineTexts: Array<{
    position: number;
    text: string;
    fromHexagram: 'primary' | 'transformed';
  }>;
  transformedJudgment: string | null;
  transformedImage: string | null;
  specialYaoText: string | null;
  ruleExplanation: string;
}

export interface CastResult {
  id: string;
  question: string;
  language: string;
  lines: Line[];
  primaryHexagram: Hexagram;
  transformedHexagram: Hexagram | null;
  changingLines: number[];
  mutationRule: MutationRule;
  textsForClaude: TextsForClaude;
  timestamp: Date;
}
```

### 2.2 — Motor de monedas y mutaciones (9 reglas completas)

```typescript
// packages/iching-engine/src/engine.ts

export function throwThreeCoins(): LineValue {
  const c = () => Math.random() < 0.5 ? 2 : 3;
  return (c() + c() + c()) as LineValue;
}

export function buildLine(value: LineValue, position: Line['position']): Line {
  const map = {
    6: { type: 'yin_old'    as LineType, isChanging: true,  symbol: '——✕——' },
    7: { type: 'yang_young' as LineType, isChanging: false, symbol: '———————' },
    8: { type: 'yin_young'  as LineType, isChanging: false, symbol: '—— ——' },
    9: { type: 'yang_old'   as LineType, isChanging: true,  symbol: '——○——' },
  };
  return { value, position, ...map[value] };
}

export function castSixLines(): Line[] {
  return ([1,2,3,4,5,6] as const).map(pos => buildLine(throwThreeCoins(), pos));
}

export function applyMutations(lines: Line[]): Line[] {
  return lines.map(l => {
    if (!l.isChanging) return l;
    if (l.type === 'yin_old')  return buildLine(7, l.position);
    if (l.type === 'yang_old') return buildLine(8, l.position);
    return l;
  });
}

export function determineMutationRule(
  primary: Hexagram,
  lines: Line[],
  changing: number[]
): MutationRule {
  const n = changing.length;
  if (n === 6) {
    if (primary.number === 1) return 'QIAN_ALL_NINE';
    if (primary.number === 2) return 'KUN_ALL_SIX';
    return 'SIX_ALL_CHANGING';
  }
  if (n === 0) return 'NO_CHANGING';
  if (n === 1) return 'ONE_CHANGING';
  if (n === 2) {
    const cl = lines.filter(l => changing.includes(l.position));
    const yins  = cl.filter(l => l.type === 'yin_old').length;
    const yangs = cl.filter(l => l.type === 'yang_old').length;
    if (yins === 1 && yangs === 1) return 'TWO_YIN_YANG';
    return 'TWO_SAME_LOWER';
  }
  if (n === 3) return 'THREE_MIDDLE';
  if (n === 4) return 'FOUR_LOWEST_STABLE';
  if (n === 5) return 'FIVE_ONLY_STABLE';
  return 'NO_CHANGING';
}

export function selectTextsForClaude(
  primary: Hexagram,
  transformed: Hexagram | null,
  lines: Line[],
  changing: number[],
  rule: MutationRule
): TextsForClaude {
  const base: TextsForClaude = {
    primaryJudgment: primary.judgment,
    primaryImage: primary.image,
    selectedLineTexts: [],
    transformedJudgment: transformed?.judgment ?? null,
    transformedImage: transformed?.image ?? null,
    specialYaoText: null,
    ruleExplanation: '',
  };
  const gl = (hex: Hexagram, pos: number) =>
    hex.lines.find(l => l.position === pos)?.text ?? '';

  switch (rule) {
    case 'NO_CHANGING':
      return { ...base, transformedJudgment: null, transformedImage: null,
        ruleExplanation: 'Sin mutaciones. Solo Juicio e Imagen del hexagrama primario.' };

    case 'ONE_CHANGING': {
      const pos = changing[0];
      return { ...base,
        selectedLineTexts: [{ position: pos, text: gl(primary, pos), fromHexagram: 'primary' }],
        ruleExplanation: `Una mutación en línea ${pos}. Es el elemento más importante.` };
    }

    case 'TWO_YIN_YANG': {
      const yin = lines.find(l => changing.includes(l.position) && l.type === 'yin_old')!;
      return { ...base,
        selectedLineTexts: [{ position: yin.position, text: gl(primary, yin.position), fromHexagram: 'primary' }],
        ruleExplanation: `Dos mutaciones yin+yang. Solo se lee la línea Yin (pos ${yin.position}).` };
    }

    case 'TWO_SAME_LOWER': {
      const low = Math.min(...changing);
      return { ...base,
        selectedLineTexts: [{ position: low, text: gl(primary, low), fromHexagram: 'primary' }],
        ruleExplanation: `Dos mutaciones mismo tipo. Solo se lee la inferior (pos ${low}).` };
    }

    case 'THREE_MIDDLE': {
      const mid = [...changing].sort((a,b) => a-b)[1];
      return { ...base,
        selectedLineTexts: [{ position: mid, text: gl(primary, mid), fromHexagram: 'primary' }],
        ruleExplanation: `Tres mutaciones. Línea central (pos ${mid}). Ambos juicios igual peso.` };
    }

    case 'FOUR_LOWEST_STABLE': {
      if (!transformed) return base;
      const stable = [1,2,3,4,5,6].filter(p => !changing.includes(p));
      const low = Math.min(...stable);
      return { ...base,
        selectedLineTexts: [{ position: low, text: gl(transformed, low), fromHexagram: 'transformed' }],
        ruleExplanation: `Cuatro mutaciones. Línea estable más baja del TRANSFORMADO (pos ${low}).` };
    }

    case 'FIVE_ONLY_STABLE': {
      if (!transformed) return base;
      const only = [1,2,3,4,5,6].find(p => !changing.includes(p))!;
      return { ...base,
        selectedLineTexts: [{ position: only, text: gl(transformed, only), fromHexagram: 'transformed' }],
        ruleExplanation: `Cinco mutaciones. Único testigo estable del TRANSFORMADO (pos ${only}).` };
    }

    case 'SIX_ALL_CHANGING':
      return { ...base, primaryImage: '', selectedLineTexts: [],
        ruleExplanation: 'Mutación total. Solo Juicio del hexagrama transformado.' };

    case 'QIAN_ALL_NINE':
      return { ...base, selectedLineTexts: [],
        specialYaoText: primary.yongJiu ?? 'Todos los Nueves (用九): "Rebaño de dragones sin cabeza — ventura."',
        ruleExplanation: 'Qian (1) con todos Yang Viejos. Séptimo Yao 用九.' };

    case 'KUN_ALL_SIX':
      return { ...base, selectedLineTexts: [],
        specialYaoText: primary.yongLiu ?? 'Todos los Seises (用六): "Ventajoso la perseverancia duradera."',
        ruleExplanation: 'Kun (2) con todos Yin Viejos. Séptimo Yao 用六.' };

    default: return base;
  }
}

export function performCast(question: string, language = 'es'): CastResult {
  const lines = castSixLines();
  const changing = lines.filter(l => l.isChanging).map(l => l.position);
  const primary = getHexagram(lines);
  const transformedLines = changing.length > 0 ? applyMutations(lines) : null;
  const transformed = transformedLines ? getHexagram(transformedLines) : null;
  const rule = determineMutationRule(primary, lines, changing);
  const texts = selectTextsForClaude(primary, transformed, lines, changing, rule);
  return {
    id: crypto.randomUUID(),
    question, language, lines,
    primaryHexagram: primary,
    transformedHexagram: transformed,
    changingLines: changing,
    mutationRule: rule,
    textsForClaude: texts,
    timestamp: new Date(),
  };
}
```

---

## 🧠 FASE 3 — CONTEXTO PERSISTENTE POR SESIÓN (NUEVO v4)
### Agente: @engineering-ai-engineer + @engineering-software-architect

### 3.1 — Concepto de Sesión Temática

```
Una SESIÓN TEMÁTICA es un grupo de consultas relacionadas sobre
el mismo tema, donde Claude mantiene memoria de todas las anteriores.

REGLAS:
  - Una sesión = máximo N consultas según el tier
  - El usuario inicia una sesión con su primera consulta
  - Puede "Profundizar" (añadir al contexto) o "Nueva sesión" (limpiar)
  - Cada sesión tiene un tema detectado automáticamente
  - Una sesión puede guardarse, compartirse como hilo completo

DIFERENCIA CON jenova.ai:
  jenova pide al usuario "mantén todo en una conversación" — es manual,
  frágil y no está controlado. Nosotros lo hacemos de forma estructurada,
  con límites claros, prompt caching para eficiencia, y UX explícita.

FLUJO UX:

  [Consulta 1] → Resultado → [ 🔮 Profundizar ] [ ✨ Nueva consulta ]
                                      ↓
  [Consulta 2 en contexto] → Claude recuerda consulta 1
                                      ↓
  [Consulta 3 en contexto] → Claude recuerda consultas 1 y 2
                                      ↓
  [ ✨ Nueva sesión — tema diferente ] → limpia contexto
```

### 3.2 — Schema DB para sesiones

```sql
-- Sesiones temáticas
CREATE TABLE consultation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,                          -- Generado por Claude del tema
  theme_category TEXT NOT NULL,        -- love_relationship, career_work, etc.
  language TEXT NOT NULL DEFAULT 'es',
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'closed', 'shared')),
  consultation_count INTEGER DEFAULT 0,
  max_consultations INTEGER NOT NULL,  -- Límite según tier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  public_sharing_id TEXT UNIQUE DEFAULT gen_random_id(8)
);

-- Consultas (actualizada con FK a sesión)
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES consultation_sessions(id),
  session_position INTEGER NOT NULL DEFAULT 1, -- Posición dentro de la sesión
  question TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'es',
  lines JSONB NOT NULL,
  primary_hexagram_number INTEGER NOT NULL,
  primary_hexagram_name TEXT NOT NULL,
  primary_hexagram_chinese TEXT NOT NULL,
  transformed_hexagram_number INTEGER,
  transformed_hexagram_name TEXT,
  changing_lines INTEGER[] NOT NULL,
  mutation_rule TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  interpretation TEXT NOT NULL,
  image_url TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  public_sharing_id TEXT UNIQUE DEFAULT gen_random_id(8),
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notas del usuario
CREATE TABLE consultation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Análisis histórico de patrones (Master y Oracle)
CREATE TABLE pattern_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis_text TEXT NOT NULL,          -- Análisis de Claude de los patrones
  consultations_analyzed INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créditos con reset por fecha de renovación
CREATE TABLE query_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  credits_total INTEGER NOT NULL,
  credits_used INTEGER DEFAULT 0,
  cycle_start TIMESTAMPTZ NOT NULL,    -- Fecha de activación/renovación
  cycle_end TIMESTAMPTZ NOT NULL,      -- cycle_start + 1 mes o 1 año
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS en todas las tablas
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_data" ON consultations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_sessions" ON consultation_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_credits" ON query_credits FOR ALL USING (auth.uid() = user_id);
```

### 3.3 — Context Engine

```typescript
// packages/context-engine/src/index.ts

export interface SessionContext {
  sessionId: string;
  theme: string;
  previousConsultations: ConsultationSummary[];
  patternHints: string | null;   // Solo Master/Oracle — análisis histórico
}

export interface ConsultationSummary {
  position: number;              // 1, 2, 3... dentro de la sesión
  question: string;
  primaryHexagramNumber: number;
  primaryHexagramName: string;
  primaryHexagramChinese: string;
  transformedHexagramName: string | null;
  changingLines: number[];
  mutationRule: MutationRule;
  interpretationSummary: string; // Primeras 200 chars para contexto
}

// Límites de contexto por tier
export const CONTEXT_LIMITS = {
  free:         { sessionDepth: 0,  historyCount: 0  }, // Sin contexto
  seeker:       { sessionDepth: 3,  historyCount: 0  }, // 3 en sesión
  practitioner: { sessionDepth: 5,  historyCount: 0  }, // 5 en sesión
  master:       { sessionDepth: 8,  historyCount: 10 }, // 8 en sesión + 10 historial
  oracle:       { sessionDepth: 10, historyCount: 30 }, // 10 en sesión + 30 historial
} as const;

// Tokens extra por consulta anterior en contexto (con prompt caching)
// Primera vez: ~800 tokens × $0.003/1K = $0.0024 por consulta previa
// Cache hit: ~800 tokens × $0.0003/1K = $0.00024 por consulta previa (90% descuento)
export const CONTEXT_COST_PER_PRIOR = 0.00024; // Con caching

export async function buildSessionContext(
  userId: string,
  sessionId: string | null,
  tier: string,
  isDeepening: boolean,
): Promise<SessionContext | null> {
  const limits = CONTEXT_LIMITS[tier as keyof typeof CONTEXT_LIMITS];
  if (limits.sessionDepth === 0) return null; // Free: sin contexto

  if (!sessionId || !isDeepening) return null;

  // Obtener consultas anteriores de esta sesión
  const { data: previous } = await supabase
    .from('consultations')
    .select(`
      session_position,
      question,
      primary_hexagram_number,
      primary_hexagram_name,
      primary_hexagram_chinese,
      transformed_hexagram_name,
      changing_lines,
      mutation_rule,
      interpretation
    `)
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('session_position', { ascending: true })
    .limit(limits.sessionDepth - 1); // Dejar espacio para la nueva consulta

  if (!previous || previous.length === 0) return null;

  const summaries: ConsultationSummary[] = previous.map(c => ({
    position: c.session_position,
    question: c.question,
    primaryHexagramNumber: c.primary_hexagram_number,
    primaryHexagramName: c.primary_hexagram_name,
    primaryHexagramChinese: c.primary_hexagram_chinese,
    transformedHexagramName: c.transformed_hexagram_name,
    changingLines: c.changing_lines,
    mutationRule: c.mutation_rule,
    interpretationSummary: c.interpretation.substring(0, 200),
  }));

  // Para Master/Oracle: obtener análisis histórico de patrones
  let patternHints: string | null = null;
  if (limits.historyCount > 0) {
    patternHints = await getHistoricalPatterns(userId, limits.historyCount);
  }

  const { data: session } = await supabase
    .from('consultation_sessions')
    .select('title, theme_category')
    .eq('id', sessionId)
    .single();

  return {
    sessionId,
    theme: session?.title ?? 'Consulta en progreso',
    previousConsultations: summaries,
    patternHints,
  };
}

async function getHistoricalPatterns(
  userId: string,
  count: number,
): Promise<string | null> {
  // Obtener las últimas N consultas del usuario (de todas las sesiones)
  const { data: history } = await supabase
    .from('consultations')
    .select('primary_hexagram_number, primary_hexagram_name, category, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(count);

  if (!history || history.length < 3) return null;

  // Detectar hexagramas recurrentes
  const hexCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  history.forEach(c => {
    hexCounts[c.primary_hexagram_name] = (hexCounts[c.primary_hexagram_name] ?? 0) + 1;
    catCounts[c.category] = (catCounts[c.category] ?? 0) + 1;
  });

  const topHex = Object.entries(hexCounts)
    .sort(([,a],[,b]) => b - a).slice(0,3)
    .map(([name, count]) => `${name} (${count}x)`).join(', ');

  const topCat = Object.entries(catCounts)
    .sort(([,a],[,b]) => b - a)[0]?.[0] ?? 'general';

  return `PATRONES HISTÓRICOS DEL CONSULTANTE (últimas ${count} consultas):
Hexagramas más frecuentes: ${topHex}
Categoría temática principal: ${topCat}
Total de consultas analizadas: ${history.length}`;
}
```

### 3.4 — Prompt de Claude con contexto

```typescript
// backend/claude/interpretation.ts

const SYSTEM_PROMPT = `Eres el Sabio del Oráculo — un intérprete del I Ching
con profundo conocimiento de Wilhelm/Baynes, Zhu Xi y los comentarios confucianos.

REGLAS ABSOLUTAS:
1. Interpreta ÚNICAMENTE con los textos clásicos proporcionados.
2. Si hay consultas previas en el contexto, referencia explícitamente
   los hexagramas anteriores para mostrar continuidad y profundidad.
3. Nunca inventas significados — solo conectas textos con la pregunta.
4. Lenguaje poético, profundo, en el idioma indicado.
5. Sin listas ni bullets — solo párrafos fluidos.
6. Siempre termina con el disclaimer requerido.`;

export async function generateInterpretation(
  castResult: CastResult,
  tier: string,
  context: SessionContext | null,
): Promise<{ text: string; category: ConsultationCategory }> {

  const { model, maxTokens } = MODEL_CONFIG[tier] ?? MODEL_CONFIG.free;
  const language = castResult.language;

  // Construir messages array — el contexto previo va CACHEADO
  const messages: Anthropic.MessageParam[] = [];

  // Si hay contexto de sesión, añadirlo como mensaje de sistema cacheado
  if (context && context.previousConsultations.length > 0) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: buildContextBlock(context, language),
          // PROMPT CACHING: el contexto histórico se cachea
          // después del primer uso → 90% descuento en tokens de input
          cache_control: { type: 'ephemeral' },
        },
        {
          type: 'text',
          text: buildCurrentCastPrompt(castResult, tier, language, true),
        }
      ],
    });
  } else {
    messages.push({
      role: 'user',
      content: buildCurrentCastPrompt(castResult, tier, language, false),
    });
  }

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: [
      {
        type: 'text',
        text: `${SYSTEM_PROMPT}\n\nIDIOMA: Responde únicamente en ${getLanguageName(language)}.\nDISCLAIMER: Termina siempre con: "${DISCLAIMERS[language]}"`,
        cache_control: { type: 'ephemeral' }, // System prompt cacheado
      }
    ],
    messages,
  });

  const fullText = response.content[0].type === 'text' ? response.content[0].text : '';

  // Extraer categoría del response (Claude la incluye en primera línea)
  const catMatch = fullText.match(/^CATEGORY:\s*(\w+)/m);
  const category = (catMatch?.[1] as ConsultationCategory) ?? 'general';
  const cleanText = fullText.replace(/^CATEGORY:.*\n/m, '').trim();

  return { text: cleanText, category };
}

function buildContextBlock(
  context: SessionContext,
  language: string,
): string {
  const lang = language === 'es' ? 'es' : 'en';
  const labels = {
    es: {
      session: 'CONTEXTO DE SESIÓN TEMÁTICA',
      theme: 'Tema de la sesión',
      prior: 'Consulta previa',
      hex: 'Hexagrama',
      mutated: 'Transformado en',
      summary: 'Interpretación anterior (resumen)',
      patterns: 'PATRONES HISTÓRICOS',
    },
    en: {
      session: 'THEMATIC SESSION CONTEXT',
      theme: 'Session theme',
      prior: 'Previous consultation',
      hex: 'Hexagram',
      mutated: 'Transformed into',
      summary: 'Previous interpretation (summary)',
      patterns: 'HISTORICAL PATTERNS',
    },
  }[lang] ?? {
    session: 'SESSION CONTEXT',
    theme: 'Theme', prior: 'Prior', hex: 'Hexagram',
    mutated: 'Transformed', summary: 'Summary', patterns: 'PATTERNS',
  };

  let block = `═══════════════════════════════════
${labels.session}: "${context.theme}"
═══════════════════════════════════\n\n`;

  context.previousConsultations.forEach(c => {
    block += `${labels.prior} #${c.position}:
  Pregunta: "${c.question}"
  ${labels.hex}: #${c.primaryHexagramNumber} ${c.primaryHexagramName} (${c.primaryHexagramChinese})
  ${c.transformedHexagramName ? `${labels.mutated}: ${c.transformedHexagramName}` : 'Sin transformación'}
  Líneas cambiantes: [${c.changingLines.join(', ')}]
  ${labels.summary}: "${c.interpretationSummary}..."

`;
  });

  if (context.patternHints) {
    block += `${labels.patterns}:\n${context.patternHints}\n`;
  }

  block += `═══════════════════════════════════
INSTRUCCIÓN DE CONTEXTO:
Al interpretar la nueva consulta, referencia explícitamente las
consultas anteriores de esta sesión. Muestra cómo los hexagramas
se relacionan entre sí y qué hilo conductor emerge.
═══════════════════════════════════\n`;

  return block;
}

function buildCurrentCastPrompt(
  cast: CastResult,
  tier: string,
  language: string,
  hasContext: boolean,
): string {
  const { question, textsForClaude: t, primaryHexagram: p, transformedHexagram: tr, mutationRule } = cast;
  const wordCounts = {
    free: '180-220', seeker: '300-350',
    practitioner: '420-470', master: '520-570', oracle: '620-680',
  };

  return `
NUEVA CONSULTA${hasContext ? ' (continúa la sesión temática)' : ''}:
"${question}"

═══════════════════════════════════
HEXAGRAMA PRIMARIO: #${p.number} — ${p.name} (${p.chineseName} · ${p.pinyin})
${p.upperTrigram} sobre ${p.lowerTrigram}

JUICIO: ${t.primaryJudgment}
${t.primaryImage ? `LA IMAGEN: ${t.primaryImage}` : ''}

REGLA ACTIVA: ${mutationRule}
${t.ruleExplanation}

${t.selectedLineTexts.length > 0 ? `
TEXTOS DE LÍNEAS:
${t.selectedLineTexts.map(l =>
  `  Línea ${l.position} [${l.fromHexagram === 'primary' ? 'primario' : 'transformado'}]: ${l.text}`
).join('\n')}` : ''}

${t.specialYaoText ? `TEXTO ESPECIAL: ${t.specialYaoText}` : ''}

${tr && t.transformedJudgment ? `
HEXAGRAMA TRANSFORMADO: #${tr.number} — ${tr.name} (${tr.chineseName})
JUICIO: ${t.transformedJudgment}` : ''}

═══════════════════════════════════
INSTRUCCIONES:
- En la PRIMERA línea escribe exactamente: CATEGORY: [categoría]
  Categorías: love_relationship, career_work, health_wellbeing,
  spiritual_inner, family_home, decision_path, conflict_challenge,
  travel_change, general
- ${hasContext ? 'Referencia las consultas anteriores de esta sesión explícitamente.' : 'Primera consulta de esta sesión.'}
- Interpreta SOLO con los textos proporcionados
- Longitud: ${wordCounts[tier] ?? wordCounts.free} palabras
- Responde en ${getLanguageName(language)}
`.trim();
}

// Configuración de modelos por tier
const MODEL_CONFIG = {
  free:         { model: 'claude-haiku-4-5-20251001', maxTokens: 400  },
  seeker:       { model: 'claude-haiku-4-5-20251001', maxTokens: 600  },
  practitioner: { model: 'claude-sonnet-4-20250514',  maxTokens: 900  },
  master:       { model: 'claude-sonnet-4-20250514',  maxTokens: 1200 },
  oracle:       { model: 'claude-sonnet-4-20250514',  maxTokens: 1500 },
};

const DISCLAIMERS: Record<string, string> = {
  es: '*Esta interpretación se basa en los textos clásicos del I Ching de Wilhelm/Baynes. El oráculo revela patrones, no predice el futuro.*',
  en: '*This interpretation is based on the classical I Ching texts by Wilhelm/Baynes. The oracle reveals patterns, it does not predict the future.*',
  pt: '*Esta interpretação baseia-se nos textos clássicos do I Ching de Wilhelm/Baynes. O oráculo revela padrões, não prediz o futuro.*',
  fr: '*Cette interprétation est basée sur les textes classiques du Yi Jing de Wilhelm/Baynes. L\'oracle révèle des schémas, il ne prédit pas l\'avenir.*',
  de: '*Diese Interpretation basiert auf den klassischen I Ging-Texten von Wilhelm/Baynes. Das Orakel enthüllt Muster, es sagt nicht die Zukunft voraus.*',
  it: '*Questa interpretazione si basa sui testi classici dell\'I Ching di Wilhelm/Baynes. L\'oracolo rivela schemi, non predice il futuro.*',
  ja: '*この解釈はウィルヘルム/ベインズの古典的な易経テキストに基づいています。易は未来を予測するのではなく、パターンを示すものです。*',
  zh: '*此解读基于卫礼贤/贝恩斯翻译的经典易经文本。易经揭示规律，而非预测未来。*',
  ko: '*이 해석은 Wilhelm/Baynes의 역경 텍스트에 기반합니다. 역경은 미래를 예측하는 것이 아니라 패턴을 드러냅니다。*',
};
```

### 3.5 — API endpoint orquestador completo

```typescript
// backend/api/consult/route.ts

export async function POST(req: Request) {
  const {
    question, language, userId, tier,
    sessionId,       // null = nueva sesión
    isDeepening,     // true = "Profundizar", false = "Nueva consulta"
  } = await req.json();

  // 1. Verificar créditos disponibles
  const hasCredits = await checkAndDecrementCredits(userId, tier);
  if (!hasCredits) {
    return Response.json({ error: 'credits_exhausted' }, { status: 402 });
  }

  // 2. Realizar el cast del I Ching
  const castResult = performCast(question, language);

  // 3. Crear o recuperar sesión temática
  let activeSessionId = sessionId;
  if (!sessionId || !isDeepening) {
    // Nueva sesión
    const { data: newSession } = await supabase
      .from('consultation_sessions')
      .insert({
        user_id: userId,
        language,
        theme_category: 'general', // Se actualiza cuando Claude clasifique
        max_consultations: CONTEXT_LIMITS[tier].sessionDepth || 1,
      })
      .select('id').single();
    activeSessionId = newSession!.id;
  }

  // 4. Construir contexto de sesión (si aplica)
  const context = await buildSessionContext(
    userId, activeSessionId, tier, isDeepening ?? false
  );

  // 5. Lanzar EN PARALELO: interpretación + imagen
  const interpretationPromise = generateInterpretation(castResult, tier, context);

  // 6. Esperar interpretación (para obtener categoría antes de generar imagen)
  const { text: interpretation, category } = await interpretationPromise;

  // 7. Generar imagen con la categoría correcta
  const imagePrompt = buildImagePrompt(
    castResult.primaryHexagram,
    castResult.transformedHexagram,
    category,
    castResult.changingLines,
  );
  const image = await generateConsultationImage(imagePrompt, userId, castResult.id, tier);

  // 8. Guardar consulta en DB
  const sessionConsultCount = isDeepening
    ? await getSessionConsultationCount(activeSessionId!) + 1
    : 1;

  const { data: saved } = await supabase
    .from('consultations')
    .insert({
      id: castResult.id,
      user_id: userId,
      session_id: activeSessionId,
      session_position: sessionConsultCount,
      question,
      language,
      lines: castResult.lines,
      primary_hexagram_number: castResult.primaryHexagram.number,
      primary_hexagram_name: castResult.primaryHexagram.name,
      primary_hexagram_chinese: castResult.primaryHexagram.chineseName,
      transformed_hexagram_number: castResult.transformedHexagram?.number ?? null,
      transformed_hexagram_name: castResult.transformedHexagram?.name ?? null,
      changing_lines: castResult.changingLines,
      mutation_rule: castResult.mutationRule,
      category,
      interpretation,
      image_url: image.url,
      thumbnail_url: image.thumbnailUrl,
    })
    .select().single();

  // 9. Actualizar categoría de la sesión si es primera consulta
  if (sessionConsultCount === 1) {
    await supabase
      .from('consultation_sessions')
      .update({ theme_category: category })
      .eq('id', activeSessionId);
  }

  return Response.json({
    consultationId: castResult.id,
    sessionId: activeSessionId,
    interpretation,
    imageUrl: image.url,
    thumbnailUrl: image.thumbnailUrl,
    publicSharingId: saved!.public_sharing_id,
    canDeepen: sessionConsultCount < (CONTEXT_LIMITS[tier].sessionDepth || 0),
    sessionPosition: sessionConsultCount,
  });
}
```

---

## 🖼 FASE 4 — IMÁGENES + WATERMARK
### Agente: @design-image-prompt-engineer + @engineering-ai-engineer

### 4.1 — Categorías y prompts visuales

```typescript
// packages/image-engine/src/categories.ts

export type ConsultationCategory =
  | 'love_relationship' | 'career_work' | 'health_wellbeing'
  | 'spiritual_inner'   | 'family_home' | 'decision_path'
  | 'conflict_challenge'| 'travel_change' | 'general';

export const VISUAL_THEMES: Record<ConsultationCategory, {
  environment: string; mood: string; elements: string;
  colorPalette: string; timeOfDay: string;
}> = {
  love_relationship: {
    environment: 'serene lake reflecting moonlight, misty mountains',
    mood: 'contemplative, tender, bittersweet',
    elements: 'lotus flower on still water, willow branches, two distant fireflies',
    colorPalette: 'silver moonlight, deep indigo, soft rose mist',
    timeOfDay: 'full moon night',
  },
  career_work: {
    environment: 'imposing mountain peak above clouds, ascending stone path',
    mood: 'determined, ambitious, focused',
    elements: 'ancient pine on cliff, morning mist clearing, distant peaks',
    colorPalette: 'golden dawn, dark stone, deep forest green',
    timeOfDay: 'early dawn',
  },
  health_wellbeing: {
    environment: 'bamboo forest with clear stream, filtered light',
    mood: 'healing, peaceful, restorative',
    elements: 'flowing water, smooth stones, wild orchids, morning dew',
    colorPalette: 'jade green, soft white light, pale gold',
    timeOfDay: 'morning',
  },
  spiritual_inner: {
    environment: 'ancient mountain temple at summit, vast cosmic sky',
    mood: 'transcendent, mysterious, profound',
    elements: 'incense smoke spiraling, stone lantern, full moon, stars',
    colorPalette: 'deep cosmic blue, gold starlight, white smoke',
    timeOfDay: 'deep night',
  },
  family_home: {
    environment: 'ancient courtyard garden, protected walls, old tree',
    mood: 'rooted, warm, protective',
    elements: 'gnarled tree with spreading branches, chrysanthemums, stone bench',
    colorPalette: 'warm amber, deep earth, soft green',
    timeOfDay: 'golden hour',
  },
  decision_path: {
    environment: 'mountain crossroads, two paths diverging into mist',
    mood: 'contemplative, searching, uncertain',
    elements: 'stone marker, lifting fog, eagle overhead',
    colorPalette: 'silver gray mist, charcoal, glimpses of gold',
    timeOfDay: 'early morning mist',
  },
  conflict_challenge: {
    environment: 'stormy sea against ancient cliffs, lightning distant',
    mood: 'intense, challenging, transformative',
    elements: 'lone pine on cliff edge, turbulent waves, storm clouds parting',
    colorPalette: 'dramatic dark gray, electric white, deep ocean blue',
    timeOfDay: 'storm at dusk',
  },
  travel_change: {
    environment: 'river winding through vast landscape toward horizon',
    mood: 'expansive, transitional, anticipatory',
    elements: 'boat on river, distant mountains, birds migrating',
    colorPalette: 'wide sky blue, river silver, warm earth tones',
    timeOfDay: 'midday open sky',
  },
  general: {
    environment: 'classic Chinese ink wash landscape, mountains and water',
    mood: 'timeless, balanced, mysterious',
    elements: 'mountains, mist, water, ancient pine, moon',
    colorPalette: 'black ink, white space, touches of gold',
    timeOfDay: 'timeless',
  },
};
```

### 4.2 — Watermark por tier (estándar en todos)

```typescript
// Watermark es SIEMPRE presente — es canal de marketing
// La escala va de prominente (free) a casi invisible (oracle)

const WATERMARK_CONFIG = {
  free:         { fontSize: 18, opacity: 0.88, text: '☯ IChingOracle.app', prominent: true  },
  seeker:       { fontSize: 15, opacity: 0.75, text: '☯ IChingOracle.app', prominent: false },
  practitioner: { fontSize: 12, opacity: 0.55, text: '☯ IChingOracle.app', prominent: false },
  master:       { fontSize: 10, opacity: 0.40, text: '☯ IChing',           prominent: false },
  oracle:       { fontSize:  9, opacity: 0.28, text: '☯',                  prominent: false },
};
// Resolución imagen:
// free/seeker:  1344×768 (full 16:9)
// practitioner: 1344×768 + opción 2688×1536
// master/oracle: 2688×1536 por defecto
```

---

## 📤 FASE 5 — SHARING VIRAL
### Agente: @marketing-growth-hacker

```typescript
// Compartir consulta individual O sesión completa como hilo

// URL de consulta individual: ichingora.app/r/xK3mP9qR
// URL de sesión completa:     ichingora.app/s/yM7nQ4wT

// Open Graph para sesión:
// og:title    "Mi jornada con el I Ching — 3 consultas sobre [tema]"
// og:image    Collage de las 3 imágenes de la sesión (generado por Sharp)
// og:description  Resumen de los hexagramas consultados

// Botones de share: WhatsApp, X, Facebook, Telegram, Instagram, Descargar
// UTM tracking: ?utm_source=sharing&utm_medium=[platform]&utm_campaign=viral
// CTA en landing pública: "🔮 Consulta tu propio I Ching — Gratis"
// → /register?utm_source=sharing → conversión de nuevos usuarios
```

---

## 💰 FASE 6 — PRECIOS ACTUALIZADOS v4
### Agente: @product-manager

```
COSTOS REALES POR CONSULTA (con contexto + imagen + caching):

  BASE (sin contexto):
    Haiku + imagen:  $0.002 + $0.003 = $0.0050
    Sonnet + imagen: $0.005 + $0.003 = $0.0080

  CONTEXTO ADICIONAL (con prompt caching, 90% descuento):
    Por cada consulta previa en contexto: +$0.00024
    Seeker (3 previas max):    +$0.0005
    Practitioner (5 previas):  +$0.0010
    Master (8 sesión + 10 hist): +$0.0043
    Oracle (10 sesión + 30 hist): +$0.0096

  COSTO TOTAL POR CONSULTA:
    Free:         $0.0050  (Haiku, sin contexto)
    Seeker:       $0.0055  (Haiku + contexto 3)
    Practitioner: $0.0090  (Sonnet + contexto 5)
    Master:       $0.0123  (Sonnet + contexto extendido)
    Oracle:       $0.0176  (Sonnet + contexto profundo)

COMISIONES: 35% total (30% stores + 5% otros)
─────────────────────────────────────────────────────────────

TIER: FREE
  Consultas:      3 / ciclo de 30 días desde primer uso
  Contexto:       ✗ — cada consulta independiente
  Historial:      ✅ persistente (gancho de conversión)
  Imagen:         ✅ watermark prominente
  Resolución:     1344×768
  2FA:            Opcional
  Modelo:         Haiku
  Precio:         $0
  Costo max:      3 × $0.005 = $0.015
  Objetivo:       Demostrar valor → convertir a Seeker

─────────────────────────────────────────────────────────────

TIER: SEEKER — $6.99/mes | $67.10/año (20% off → $5.59/mes equiv.)
  Consultas:      15 / ciclo desde fecha de suscripción
  Contexto:       ✅ sesión temática hasta 3 consultas
  Historial:      ✅ 90 días
  Imagen:         ✅ watermark medio
  Resolución:     1344×768
  2FA:            Opcional
  Modelo:         Haiku
  Costo max:      15 × $0.0055 = $0.083
  Ingreso neto:   $6.99 × 0.65 = $4.54
  Margen neto:    $4.54 - $0.08 = $4.46 ✅

─────────────────────────────────────────────────────────────

TIER: PRACTITIONER — $11.99/mes | $115.10/año (20% off)
  Consultas:      40 / ciclo desde fecha de suscripción
  Contexto:       ✅ sesión temática hasta 5 consultas
  Historial:      ✅ ilimitado + notas personales
  Imagen:         ✅ watermark discreto
  Resolución:     1344×768 + alta 2688×1536
  Exportar PDF:   ✅ (incluye imagen)
  2FA:            ✅ OBLIGATORIO
  Modelo:         Sonnet
  Costo max:      40 × $0.009 = $0.36
  Ingreso neto:   $11.99 × 0.65 = $7.79
  Margen neto:    $7.79 - $0.36 = $7.43 ✅

─────────────────────────────────────────────────────────────

TIER: MASTER — $19.99/mes | $191.90/año (20% off)
  Consultas:      100 / ciclo desde fecha de suscripción
  Contexto:       ✅ sesión hasta 8 + análisis histórico 10 consultas
  Historial:      ✅ ilimitado + notas + etiquetas
  Imagen:         ✅ watermark mínimo + alta resolución
  Análisis:       ✅ patrones entre consultas (Claude analiza últimas 10)
  Journaling:     ✅ integrado
  Estadísticas:   ✅ hexagramas frecuentes, categorías, rachas
  Exportar:       ✅ PDF, sesiones completas
  2FA:            ✅ OBLIGATORIO
  Modelo:         Sonnet
  Costo max:      100 × $0.0123 = $1.23
  Ingreso neto:   $19.99 × 0.65 = $12.99
  Margen neto:    $12.99 - $1.23 = $11.76 ✅

─────────────────────────────────────────────────────────────

TIER: ORACLE — $44.99/mes | $431.90/año (20% off → $36/mes equiv.)
  Consultas:      500 / ciclo desde fecha de suscripción
  Contexto:       ✅ sesión hasta 10 + análisis histórico 30 consultas
  Historial:      ✅ completo, exportable en todos los formatos
  Imagen:         ✅ watermark casi invisible + ultra alta resolución
  Análisis:       ✅ patrones profundos (últimas 30 consultas)
  Todo de Master + acceso prioritario a nuevas features
  2FA:            ✅ OBLIGATORIO
  Modelo:         Sonnet (extended context)
  Costo max:      500 × $0.0176 = $8.80
  Ingreso neto:   $44.99 × 0.65 = $29.24
  Margen neto:    $29.24 - $8.80 = $20.44 ✅

─────────────────────────────────────────────────────────────

RESUMEN COMPARATIVO DE PRECIOS:
  Free:          $0
  Seeker:        $6.99/mes  | $67.10/año
  Practitioner:  $11.99/mes | $115.10/año
  Master:        $19.99/mes | $191.90/año
  Oracle:        $44.99/mes | $431.90/año

TODOS LOS MÁRGENES SON POSITIVOS ✅
```

---

## 🧪 FASE 7 — TESTS COMPLETOS
### Agente: @testing-reality-checker

### 7.1 — Tests del engine (sin cambios desde v3 — ya correctos)

```typescript
// Ver sección de tests del engine en v3
// Las 9 reglas de mutación + casos Qian/Kun
// Probabilidades de monedas
// Mapeo de 64 hexagramas
```

### 7.2 — Tests del contexto de sesión

```typescript
describe('Session Context Engine', () => {

  test('Free tier has NO session context', async () => {
    const context = await buildSessionContext(FREE_USER_ID, 'session-1', 'free', true);
    expect(context).toBeNull();
  });

  test('Seeker gets context with up to 3 previous consultations', async () => {
    const sessionId = await createTestSessionWith3Consultations(SEEKER_USER_ID);
    const context = await buildSessionContext(SEEKER_USER_ID, sessionId, 'seeker', true);
    expect(context).not.toBeNull();
    expect(context!.previousConsultations.length).toBeLessThanOrEqual(2); // 3-1 para la nueva
  });

  test('Context includes correct hexagram data from previous consultations', async () => {
    const sessionId = await createTestSessionWithKnownData(PRACTITIONER_USER_ID);
    const context = await buildSessionContext(PRACTITIONER_USER_ID, sessionId, 'practitioner', true);
    expect(context!.previousConsultations[0].primaryHexagramNumber).toBe(31);
    expect(context!.previousConsultations[0].question).toBe('¿Debo cambiar de trabajo?');
  });

  test('Master gets historical pattern analysis', async () => {
    await createMultipleConsultationsForUser(MASTER_USER_ID, 12);
    const context = await buildSessionContext(MASTER_USER_ID, 'session-1', 'master', true);
    expect(context!.patternHints).not.toBeNull();
    expect(context!.patternHints).toContain('PATRONES');
  });

  test('Oracle gets historical analysis of up to 30 consultations', async () => {
    await createMultipleConsultationsForUser(ORACLE_USER_ID, 35);
    const context = await buildSessionContext(ORACLE_USER_ID, 'session-1', 'oracle', true);
    expect(context!.patternHints).toContain('30');
  });

  test('Session is limited to tier depth', async () => {
    // Seeker max 3 — intento de 4ta consulta en misma sesión
    const sessionId = await createTestSessionWith3Consultations(SEEKER_USER_ID);
    const response = await attemptFourthConsultationInSession(SEEKER_USER_ID, sessionId);
    // canDeepen debe ser false
    expect(response.canDeepen).toBe(false);
  });

  test('New session clears context', async () => {
    const context = await buildSessionContext(SEEKER_USER_ID, null, 'seeker', false);
    expect(context).toBeNull(); // isDeepening=false → sin contexto
  });

  test('Claude prompt includes previous hexagrams when context present', async () => {
    const castResult = performCast('¿Cuáles son los riesgos?');
    const context: SessionContext = {
      sessionId: 'test-session',
      theme: 'Cambio de trabajo',
      previousConsultations: [{
        position: 1,
        question: '¿Debo aceptar este trabajo?',
        primaryHexagramNumber: 31,
        primaryHexagramName: 'Xian',
        primaryHexagramChinese: '咸',
        transformedHexagramName: 'Pi',
        changingLines: [3, 6],
        mutationRule: 'TWO_SAME_LOWER',
        interpretationSummary: 'La influencia existe pero el estancamiento...',
      }],
      patternHints: null,
    };
    const prompt = buildContextBlock(context, 'es');
    expect(prompt).toContain('咸');
    expect(prompt).toContain('¿Debo aceptar este trabajo?');
    expect(prompt).toContain('CONTEXTO DE SESIÓN TEMÁTICA');
  });
});
```

### 7.3 — Tests E2E completos

```typescript
describe('Full E2E Flows', () => {

  test('Complete session flow: 3 consultations with context', async ({ page }) => {
    await loginAsTestUser(page, 'seeker');

    // Consulta 1
    await page.fill('[data-testid="question-input"]', '¿Debo aceptar esta oferta de trabajo?');
    await page.click('[data-testid="consult-btn"]');
    await page.waitForSelector('[data-testid="interpretation-text"]', { timeout: 60000 });

    const interpretation1 = await page.locator('[data-testid="interpretation-text"]').textContent();
    expect(interpretation1!.length).toBeGreaterThan(100);

    // Imagen presente
    await expect(page.locator('[data-testid="consultation-image"]')).toBeVisible();

    // Profundizar
    await page.click('[data-testid="deepen-btn"]');
    await page.fill('[data-testid="question-input"]', '¿Cuáles son los riesgos principales?');
    await page.click('[data-testid="consult-btn"]');
    await page.waitForSelector('[data-testid="interpretation-text"]', { timeout: 60000 });

    const interpretation2 = await page.locator('[data-testid="interpretation-text"]').textContent();
    // La segunda interpretación debe referenciar la primera
    expect(interpretation2).toMatch(/consulta anterior|hexagrama anterior|anteriormente/i);

    // Profundizar de nuevo (3ra — máximo Seeker)
    await page.click('[data-testid="deepen-btn"]');
    await page.fill('[data-testid="question-input"]', '¿Cuándo sería el momento correcto?');
    await page.click('[data-testid="consult-btn"]');
    await page.waitForSelector('[data-testid="interpretation-text"]', { timeout: 60000 });

    // El botón "Profundizar" debe desaparecer (límite alcanzado)
    await expect(page.locator('[data-testid="deepen-btn"]')).not.toBeVisible();
    // El botón "Nueva sesión" debe aparecer
    await expect(page.locator('[data-testid="new-session-btn"]')).toBeVisible();
  });

  test('Sharing a session shows all 3 consultations', async ({ page }) => {
    const sessionId = await createPublicTestSession();
    await page.goto(`/s/${SESSION_PUBLIC_ID}`);
    await expect(page.locator('[data-testid="session-consultation"]')).toHaveCount(3);
    await expect(page.locator('[data-testid="cta-register-btn"]')).toBeVisible();
  });

  test('Credits reset on renewal date not on 1st of month', async () => {
    await simulateRevenueCatRenewal({
      userId: TEST_USER_ID, tier: 'seeker',
      renewalDate: new Date('2026-04-15'),
    });
    const credits = await getCreditsFromDB(TEST_USER_ID);
    expect(credits.credits_used).toBe(0);
    expect(new Date(credits.cycle_start).getDate()).toBe(15);
  });

  test('2FA blocks login without code', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', '2fa_user@test.com');
    await page.fill('[data-testid="password"]', 'TestPass123!');
    await page.click('[data-testid="login-btn"]');
    await expect(page.locator('[data-testid="2fa-challenge"]')).toBeVisible();
  });

  test('Image has watermark in all tiers', async () => {
    for (const tier of ['free', 'seeker', 'practitioner', 'master', 'oracle']) {
      const { imageUrl } = await generateTestImageForTier(tier);
      expect(await hasWatermarkPixels(imageUrl)).toBe(true);
    }
  });

  test('Oracle watermark is smaller than Free watermark', async () => {
    const freeImage = await generateTestImageForTier('free');
    const oracleImage = await generateTestImageForTier('oracle');
    const freeWatermarkArea = await measureWatermarkArea(freeImage.imageUrl);
    const oracleWatermarkArea = await measureWatermarkArea(oracleImage.imageUrl);
    expect(oracleWatermarkArea).toBeLessThan(freeWatermarkArea);
  });
});
```

---

## 🚀 FASE 8 — VARIABLES DE ENTORNO

```bash
# Claude API
ANTHROPIC_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Flux AI (imágenes)
FAL_AI_KEY=

# RevenueCat
REVENUECAT_SECRET_KEY=
REVENUECAT_WEBHOOK_SECRET=
NEXT_PUBLIC_REVENUECAT_API_KEY=

# Twilio (SMS 2FA)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

# 2FA TOTP encryption
TOTP_ENCRYPTION_KEY=          # AES-256 — generar con: openssl rand -hex 32

# Rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cloudflare Turnstile
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=https://ichingora.app
```

---

## 📋 CHECKLIST FINAL v4

```
ENGINE I CHING:
[ ] 64 hexagramas mapeados correctamente
[ ] Probabilidades: 6=12.5%, 7=37.5%, 8=37.5%, 9=12.5%
[ ] 9 reglas de mutación + Qian/Kun implementadas
[ ] Reglas 4 y 5 usan textos del TRANSFORMADO
[ ] Tests de las 9 reglas passing

AUTH + 2FA:
[ ] Emails desechables rechazados (domains + MX)
[ ] Confirmación email obligatoria
[ ] TOTP: QR code + verificación + window=1
[ ] SMS: Twilio Verify funcional
[ ] 8 códigos de recuperación bcrypt single-use
[ ] Bloqueo tras 5 intentos fallidos / 15 min
[ ] 2FA obligatorio Practitioner, Master, Oracle
[ ] TOTP secret encriptado AES-256 en DB

CONTEXTO DE SESIÓN (NUEVO v4):
[ ] Free: sin contexto (each consultation independent)
[ ] Seeker: sesión hasta 3 consultas en contexto
[ ] Practitioner: sesión hasta 5 consultas
[ ] Master: sesión 8 + análisis histórico 10 consultas
[ ] Oracle: sesión 10 + análisis histórico 30 consultas
[ ] Prompt caching activo para contexto histórico
[ ] buildContextBlock genera texto en idioma del usuario
[ ] Claude referencia hexagramas previos explícitamente
[ ] canDeepen=false cuando se alcanza el límite
[ ] Nueva sesión limpia el contexto correctamente
[ ] Sesión completa compartible como hilo (/s/[id])

IMÁGENES (core en todos los tiers):
[ ] Imagen en CADA consulta sin excepción
[ ] 9 categorías temáticas con temas visuales distintos
[ ] Claude clasifica categoría en el mismo call
[ ] Flux Schnell genera 1344×768 en <8s
[ ] Watermark presente en TODOS los tiers (estándar)
[ ] Watermark escala: prominente (free) → casi invisible (oracle)
[ ] Resolución alta 2688×1536 para Practitioner+
[ ] Supabase Storage CDN con URL permanente
[ ] Thumbnail 400×225 para previews

SHARING VIRAL:
[ ] URL individual: /r/[8chars]
[ ] URL sesión completa: /s/[8chars]
[ ] Open Graph completo (og:image, og:title, og:description)
[ ] Twitter card configurado
[ ] Botones: WhatsApp, X, Facebook, Telegram, Instagram, Download
[ ] CTA conversión en landing pública con UTM tracking
[ ] Collage de imágenes para compartir sesión completa

PRECIOS ACTUALIZADOS:
[ ] Free: $0 / 3 consultas
[ ] Seeker: $6.99/mes | $67.10/año
[ ] Practitioner: $11.99/mes | $115.10/año
[ ] Master: $19.99/mes | $191.90/año
[ ] Oracle: $44.99/mes | $431.90/año
[ ] Todos los márgenes positivos verificados
[ ] Reset créditos por fecha renovación (no 1ro del mes)
[ ] RevenueCat webhook RENEWAL funcional

MULTI-IDIOMA:
[ ] 9 idiomas en UI completos
[ ] Claude responde en idioma del usuario
[ ] Prompts de imagen siempre en inglés (Flux funciona mejor)
[ ] buildContextBlock genera en idioma correcto

ESCALABILIDAD:
[ ] Edge Runtime en todas las API routes
[ ] Upstash Redis rate limiting
[ ] Prompt caching Claude (system prompt + contexto)
[ ] Supabase pgBouncer activo
[ ] Anthropic API tier adecuado solicitado

TESTS:
[ ] Engine: 9 reglas de mutación passing
[ ] Auth: email validation, 2FA TOTP, 2FA SMS passing
[ ] Contexto: sesión 3/5/8/10 consultas por tier passing
[ ] Análisis histórico Master/Oracle passing
[ ] Imágenes: generación, watermark, categorías passing
[ ] Sharing: URL pública, OG tags, CTAs passing
[ ] E2E: flujo completo de sesión 3 consultas passing
[ ] E2E: precios y reset de créditos por renovación passing
```

---

## ⚡ ORDEN DE EJECUCIÓN v4

```
SEMANA 1 — Foundation:
  Día 1:   iching-engine — tipos + monedas + mapeo hexagramas
  Día 2:   iching-engine — motor de mutaciones (9 reglas)
  Día 3:   iching-data   — dataset Wilhelm/Baynes verificado
  Día 4:   auth          — registro + email validation + 2FA
  Día 5:   Tests engine  — 9 reglas passing antes de continuar

SEMANA 2 — Backend Core:
  Día 6:   context-engine — sesiones temáticas + buildSessionContext
  Día 7:   claude/        — interpretación + clasificación + contexto
  Día 8:   image/         — Flux + categorías + watermark Sharp
  Día 9:   sharing/       — URLs públicas + Open Graph + collage sesión
  Día 10:  db/            — schema completo + RLS + RevenueCat webhooks

SEMANA 3 — Frontend Web:
  Día 11:  OracleEntrance + CoinThrow (animaciones)
  Día 12:  HexagramDisplay + imagen con skeleton loader
  Día 13:  InterpretationScroll + botones Profundizar/Nueva sesión
  Día 14:  ShareConsultation + ShareSession + landing pública /r/ y /s/
  Día 15:  2FA UI + SubscriptionModal + LanguageSelector + historial

SEMANA 4 — Mobile:
  Día 16:  Pantalla principal + CoinThrow (Reanimated + Skia)
  Día 17:  HexagramDisplay mobile + imagen full-width + zoom
  Día 18:  Botones Profundizar/Nueva sesión + share nativo
  Día 19:  2FA mobile + RevenueCat SDK + notificaciones
  Día 20:  EAS Build config + tests en dispositivo real

SEMANA 5 — QA y Launch:
  Día 21:  Tests unitarios completos (engine + context + auth)
  Día 22:  Tests E2E completos (Playwright)
  Día 23:  Performance audit + Sentry + monitoring
  Día 24:  Deploy Vercel + App Store / Play Store submission
  Día 25:  Buffer para fixes críticos pre-launch
```

---

## ⚡ EMPEZAR AQUÍ

Cursor: iniciar con `packages/iching-engine/src/types.ts`
Construir el engine completo antes de tocar UI, contexto o backend.
No avanzar hasta que todos los tests del engine pasen.
TypeScript estricto en todo el proyecto.
Código production-ready. Sin pseudocódigo. Sin TODOs abiertos.
