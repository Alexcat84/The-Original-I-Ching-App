import type { OracleBoneMedium, OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import {
  buildSumiHexagramSvgDataUrl,
  fnv1a32,
  mulberry32,
  type SumiLineInput,
} from "@/lib/sumi-hexagram-art";

export type ImageProvider = "auto" | "mock" | "svg-art" | "pollinations" | "fal" | "gpt-image" | "together";

/** Provider after resolving "auto" / env; never "auto". */
export type ResolvedImageProvider = Exclude<ImageProvider, "auto">;

function shiftHexForOracle(hex: string, rng: () => number, spread: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = () => Math.round((rng() - 0.5) * spread);
  const c = (x: number) => Math.max(0, Math.min(255, x));
  return `#${[c(r + d()), c(g + d()), c(b + d())]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}`;
}

function buildOracleBonesMockDataUrl(params: {
  patternId: number;
  verdict: OracleBonesVerdict;
  medium: OracleBoneMedium;
  consultationId?: string;
}): string {
  const bone = params.medium === "turtle" ? "Plastrón" : "Escápula";
  const seedStr =
    params.consultationId ?? `oracle-bones|${params.patternId}|${params.verdict}|${params.medium}`;
  const rng = mulberry32(fnv1a32(seedStr));
  const bg = shiftHexForOracle("#1a1510", rng, 18);
  const boneTop = shiftHexForOracle("#e8dcc8", rng, 20);
  const boneBot = shiftHexForOracle("#c4b29a", rng, 20);
  const stroke = shiftHexForOracle("#5c4a3a", rng, 16);
  const accent = shiftHexForOracle("#c9a227", rng, 22);
  const sub = shiftHexForOracle("#8a7a68", rng, 18);
  const grainA = (0.04 + rng() * 0.06).toFixed(3);
  const grainB = (0.03 + rng() * 0.05).toFixed(3);
  const bx = Math.round(400 + rng() * 80);
  const by = Math.round(108 + rng() * 36);
  const bw = Math.round(480 + rng() * 60);
  const bh = Math.round(500 + rng() * 56);
  const br = Math.round(40 + rng() * 16);
  const cx = bx + bw / 2;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1344" height="768" viewBox="0 0 1344 768">
  <defs>
    <linearGradient id="bone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${boneTop}" />
      <stop offset="100%" stop-color="${boneBot}" />
    </linearGradient>
  </defs>
  <rect width="1344" height="768" fill="${bg}" />
  <path fill="none" stroke="rgba(200,180,140,${grainA})" stroke-width="1.2" d="M0 ${Math.round(180 + rng() * 120)} Q400 ${Math.round(320 + rng() * 80)} 800 ${Math.round(260 + rng() * 100)} T1344 ${Math.round(200 + rng() * 90)}"/>
  <path fill="none" stroke="rgba(160,140,110,${grainB})" stroke-width="0.9" d="M0 ${Math.round(520 + rng() * 60)} Q500 ${Math.round(580 + rng() * 50)} 1000 ${Math.round(540 + rng() * 70)} T1344 ${Math.round(600 + rng() * 40)}"/>
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${br}" fill="url(#bone)" stroke="${stroke}" stroke-width="3"/>
  <text x="${cx}" y="90" text-anchor="middle" fill="${accent}" font-size="36" font-family="Segoe UI, Arial">甲骨文 · ${bone} · patrón ${params.patternId}</text>
  <text x="${cx}" y="690" text-anchor="middle" fill="${sub}" font-size="24" font-family="Segoe UI, Arial">Vista simbólica (respaldo) · ${params.verdict}</text>
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
  consultationId?: string;
  category: string;
  changingLines: number[];
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
    artSeed: params.consultationId,
    category: params.category,
    changingLines: params.changingLines,
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
  /** Drives unique sumi-e background per consultation when APIs are off. */
  consultationId?: string;
}): Promise<{ provider: ResolvedImageProvider; imageUrl: string; fallbackImageUrl: string }> {
  const sumiFallback = sumiUrlForIChing({
    lines: params.lines,
    primaryHexagram: params.primaryHexagram,
    primaryHexagramName: params.primaryHexagramName,
    primaryChinese: params.primaryChinese,
    pinyin: params.pinyin,
    transformed: params.transformedHexagram ?? null,
    consultationId: params.consultationId,
    category: params.category,
    changingLines: params.changingLines,
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
  consultationId?: string;
}): Promise<{ provider: ResolvedImageProvider; imageUrl: string; fallbackImageUrl: string }> {
  const provider = resolveProvider(params.providerOverride);
  const { width: tierWidth, height: tierHeight } = resolveTierSize(params.tier);
  const promptForRemote = compactPrompt(params.prompt, 900);
  const fallbackImageUrl = buildOracleBonesMockDataUrl({
    patternId: params.patternId,
    verdict: params.verdict,
    medium: params.medium,
    consultationId: params.consultationId,
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
