import type { OracleBoneMedium, OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { buildSumiHexagramSvgDataUrl, type SumiLineInput } from "@/lib/sumi-hexagram-art";

export type ImageProvider = "auto" | "mock" | "svg-art" | "pollinations" | "fal" | "gpt-image" | "together";

/** Provider after resolving "auto" / env; never "auto". */
export type ResolvedImageProvider = Exclude<ImageProvider, "auto">;

function buildOracleBonesMockDataUrl(params: {
  patternId: number;
  verdict: OracleBonesVerdict;
  medium: OracleBoneMedium;
}): string {
  const bone = params.medium === "turtle" ? "Plastrón" : "Escápula";
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1344" height="768" viewBox="0 0 1344 768">
  <defs>
    <linearGradient id="bone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8dcc8" />
      <stop offset="100%" stop-color="#c4b29a" />
    </linearGradient>
  </defs>
  <rect width="1344" height="768" fill="#1a1510" />
  <rect x="420" y="120" width="504" height="528" rx="48" fill="url(#bone)" stroke="#5c4a3a" stroke-width="3"/>
  <text x="672" y="90" text-anchor="middle" fill="#c9a227" font-size="36" font-family="Segoe UI, Arial">甲骨文 · ${bone} · patrón ${params.patternId}</text>
  <text x="672" y="690" text-anchor="middle" fill="#8a7a68" font-size="24" font-family="Segoe UI, Arial">Vista simbólica (respaldo) · ${params.verdict}</text>
</svg>`.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function resolveProvider(override?: ImageProvider): ResolvedImageProvider {
  if (override && override !== "auto") return override;
  const raw = (process.env.IMAGE_PROVIDER ?? "").trim().toLowerCase();

  // Explicit choices (user forces a backend)
  if (raw === "mock") return "mock";
  if (raw === "pollinations") return "pollinations";
  if (raw === "fal") return "fal";
  if (raw === "gpt-image") return "gpt-image";
  if (raw === "together") {
    return process.env.TOGETHER_API_KEY ? "together" : "mock";
  }

  // Unset, "auto", or unknown: spend paid keys when present (Together first)
  if (!raw || raw === "auto") {
    if (process.env.TOGETHER_API_KEY) return "together";
    if (process.env.FAL_AI_KEY) return "fal";
    if (process.env.OPENAI_API_KEY) return "gpt-image";
    if (process.env.NODE_ENV !== "production") return "pollinations";
    return "mock";
  }

  return "mock";
}

function compactPrompt(prompt: string, maxLen: number): string {
  return prompt
    .replace(/\s+/g, " ")
    .replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, "")
    .slice(0, maxLen);
}

function resolveTierSize(tier?: string): { width: number; height: number } {
  const highRes = new Set(["practitioner", "master", "oracle"]);
  if (tier && highRes.has(tier)) {
    return { width: 2688, height: 1536 };
  }
  return { width: 1344, height: 768 };
}

async function generateWithFal(prompt: string, width: number, height: number): Promise<string | null> {
  const key = process.env.FAL_AI_KEY;
  if (!key) return null;
  const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: { width, height },
      num_images: 1,
      enable_safety_checker: true,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { images?: Array<{ url?: string }> };
  return data.images?.[0]?.url ?? null;
}

async function generateWithGptImage(prompt: string, width: number, height: number): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const supported = new Set(["1024x1024", "1536x1024", "1024x1536"]);
  const candidate = `${width}x${height}`;
  const size = supported.has(candidate) ? candidate : "1536x1024";
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1",
      prompt,
      size,
      quality: "high",
      n: 1,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
  const first = data.data?.[0];
  if (!first) return null;
  if (first.url) return first.url;
  if (first.b64_json) return `data:image/png;base64,${first.b64_json}`;
  return null;
}

async function generateWithTogether(prompt: string, width: number, height: number): Promise<string | null> {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) return null;
  const model =
    process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
  const stepsRaw = Number(process.env.TOGETHER_IMAGE_STEPS ?? "20");
  const steps = Math.min(40, Math.max(4, Number.isFinite(stepsRaw) ? stepsRaw : 20));
  const w = Math.min(Math.max(512, width), 1024);
  const h = Math.min(Math.max(512, height), 1024);
  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: prompt.slice(0, 1500),
      width: w,
      height: h,
      n: 1,
      steps,
      response_format: "url",
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { data?: Array<{ url?: string; b64_json?: string }> };
  const first = data.data?.[0];
  if (!first) return null;
  if (first.url) return first.url;
  if (first.b64_json) return `data:image/png;base64,${first.b64_json}`;
  return null;
}

function sumiUrlForIChing(params: {
  lines: SumiLineInput[];
  primaryHexagram: number;
  primaryHexagramName: string;
  primaryChinese: string;
  pinyin?: string;
  transformed?: { number: number; name: string; chineseName: string } | null;
}): string {
  return buildSumiHexagramSvgDataUrl({
    lines: params.lines,
    primaryNumber: params.primaryHexagram,
    primaryName: params.primaryHexagramName,
    primaryChinese: params.primaryChinese,
    pinyin: params.pinyin,
    transformedNumber: params.transformed?.number ?? null,
    transformedName: params.transformed?.name ?? null,
    transformedChinese: params.transformed?.chineseName ?? null,
  });
}

/** If true, skip remote APIs and use only the deterministic sumi-e SVG (no external cost). */
function sumiOnlyMode(): boolean {
  return process.env.IMAGE_SUMI_ONLY === "1" || process.env.IMAGE_SUMI_ONLY === "true";
}

export async function buildImageAsset(params: {
  prompt: string;
  primaryHexagram: number;
  primaryHexagramName: string;
  primaryChinese: string;
  pinyin?: string;
  transformedHexagram?: { number: number; name: string; chineseName: string } | null;
  category: string;
  mutationRule: string;
  changingLines: number[];
  lines: SumiLineInput[];
  tier?: string;
  providerOverride?: ImageProvider;
}): Promise<{ provider: ResolvedImageProvider; imageUrl: string; fallbackImageUrl: string }> {
  const sumiFallback = sumiUrlForIChing({
    lines: params.lines,
    primaryHexagram: params.primaryHexagram,
    primaryHexagramName: params.primaryHexagramName,
    primaryChinese: params.primaryChinese,
    pinyin: params.pinyin,
    transformed: params.transformedHexagram ?? null,
  });

  if (sumiOnlyMode()) {
    return { provider: "svg-art", imageUrl: sumiFallback, fallbackImageUrl: sumiFallback };
  }

  const provider = resolveProvider(params.providerOverride);
  const { width: tierWidth, height: tierHeight } = resolveTierSize(params.tier);
  const promptForRemote = compactPrompt(params.prompt, provider === "pollinations" ? 900 : 1100);
  const fallbackImageUrl = sumiFallback;

  if (provider === "pollinations") {
    const model = process.env.POLLINATIONS_MODEL ?? "flux";
    const width = Number(process.env.POLLINATIONS_WIDTH ?? String(tierWidth));
    const height = Number(process.env.POLLINATIONS_HEIGHT ?? String(tierHeight));
    const seed = Math.floor(Math.random() * 1_000_000_000);
    const encoded = encodeURIComponent(promptForRemote);
    const imageUrl =
      `https://image.pollinations.ai/prompt/${encoded}` +
      `?model=${encodeURIComponent(model)}&width=${width}&height=${height}&seed=${seed}&nologo=true`;
    return { provider, imageUrl, fallbackImageUrl };
  }

  if (provider === "fal") {
    const falImage = await generateWithFal(promptForRemote, tierWidth, tierHeight);
    if (falImage) {
      return { provider, imageUrl: falImage, fallbackImageUrl };
    }
  }

  if (provider === "gpt-image") {
    const gptImage = await generateWithGptImage(promptForRemote, tierWidth, tierHeight);
    if (gptImage) {
      return { provider, imageUrl: gptImage, fallbackImageUrl };
    }
  }

  if (provider === "together") {
    const togetherImage = await generateWithTogether(promptForRemote, tierWidth, tierHeight);
    if (togetherImage) {
      return { provider, imageUrl: togetherImage, fallbackImageUrl };
    }
  }

  return {
    provider: "svg-art",
    imageUrl: sumiFallback,
    fallbackImageUrl,
  };
}

export async function buildOracleBonesImageAsset(params: {
  prompt: string;
  patternId: number;
  verdict: OracleBonesVerdict;
  medium: OracleBoneMedium;
  tier?: string;
  providerOverride?: ImageProvider;
}): Promise<{ provider: ResolvedImageProvider; imageUrl: string; fallbackImageUrl: string }> {
  const provider = resolveProvider(params.providerOverride);
  const { width: tierWidth, height: tierHeight } = resolveTierSize(params.tier);
  const promptForRemote = compactPrompt(params.prompt, 900);
  const fallbackImageUrl = buildOracleBonesMockDataUrl({
    patternId: params.patternId,
    verdict: params.verdict,
    medium: params.medium,
  });

  if (provider === "pollinations") {
    const model = process.env.POLLINATIONS_MODEL ?? "flux";
    const width = Number(process.env.POLLINATIONS_WIDTH ?? String(tierWidth));
    const height = Number(process.env.POLLINATIONS_HEIGHT ?? String(tierHeight));
    const seed = Math.floor(Math.random() * 1_000_000_000);
    const encoded = encodeURIComponent(promptForRemote);
    const imageUrl =
      `https://image.pollinations.ai/prompt/${encoded}` +
      `?model=${encodeURIComponent(model)}&width=${width}&height=${height}&seed=${seed}&nologo=true`;
    return { provider, imageUrl, fallbackImageUrl };
  }

  if (provider === "fal") {
    const falImage = await generateWithFal(promptForRemote, tierWidth, tierHeight);
    if (falImage) return { provider, imageUrl: falImage, fallbackImageUrl };
  }

  if (provider === "gpt-image") {
    const gptImage = await generateWithGptImage(promptForRemote, tierWidth, tierHeight);
    if (gptImage) return { provider, imageUrl: gptImage, fallbackImageUrl };
  }

  if (provider === "together") {
    const togetherImage = await generateWithTogether(promptForRemote, tierWidth, tierHeight);
    if (togetherImage) return { provider, imageUrl: togetherImage, fallbackImageUrl };
  }

  return { provider: "mock", imageUrl: fallbackImageUrl, fallbackImageUrl };
}
