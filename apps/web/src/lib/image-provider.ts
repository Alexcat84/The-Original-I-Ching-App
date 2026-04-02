import type { OracleBoneMedium, OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { toContextTierKey } from "@/lib/credits";
import { oracleBonesVerdictChinese } from "@/lib/oracle-bones-verdict-glyph";
import {
  buildSumiHexagramSvgDataUrl,
  buildSumiHexagramOverlaySvgDataUrl,
  fnv1a32,
  mulberry32,
  type SumiLineInput,
} from "@/lib/sumi-hexagram-art";

export type ImageProvider = "auto" | "mock" | "svg-art" | "pollinations" | "fal" | "gpt-image" | "together";

/** Provider after resolving "auto" / env; never "auto". */
export type ResolvedImageProvider = Exclude<ImageProvider, "auto">;

export type TogetherDebug = {
  attempted: boolean;
  hasKey: boolean;
  status?: number;
  errorSnippet?: string;
};

export type ImageProviderDebug = {
  providerResolved: ResolvedImageProvider;
  providerOverride?: ImageProvider;
  imageProviderEnv?: string | null;
  sumiOnlyMode: boolean;
  together?: TogetherDebug;
};

function isDebugImageProvider(): boolean {
  return process.env.DEBUG_IMAGE_PROVIDER === "1" || process.env.DEBUG_IMAGE_PROVIDER === "true";
}

function debugLog(message: string, details?: Record<string, unknown>): void {
  if (!isDebugImageProvider()) return;
  // eslint-disable-next-line no-console
  console.info("[image-provider]", message, details ?? {});
}

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

function escapeXmlOracleOverlay(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Transparent SVG overlay: verdict glyph(s) in simplified Chinese, same approach as sumi hexagram overlay
 * (Noto Serif SC stack; @font-face embedded at finalize via embedCjkFontInOverlaySvg).
 */
function buildOracleBonesSymbolOverlaySvgDataUrl(params: {
  verdict: OracleBonesVerdict;
  outputWidth: number;
  outputHeight: number;
}): string {
  const W = 1344;
  const H = 768;
  const cx = W / 2;
  /** Baseline near visual center of shell in 16:9 frame */
  const baselineY = 400;
  const raw = oracleBonesVerdictChinese(params.verdict);
  const escaped = escapeXmlOracleOverlay(raw);
  const fontSize = raw.length > 1 ? 132 : 224;
  const letterSpacing = raw.length > 1 ? 18 : 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${params.outputWidth}" height="${params.outputHeight}" viewBox="0 0 ${W} ${H}">
<defs>
  <filter id="ob-verdict-glow" x="-45%" y="-45%" width="190%" height="190%">
    <feGaussianBlur stdDeviation="3.5" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<text x="${cx}" y="${baselineY}" text-anchor="middle" fill="#1c1410" stroke="rgba(255,248,240,0.94)" stroke-width="5" paint-order="stroke fill" font-size="${fontSize}" letter-spacing="${letterSpacing}" font-family='Noto Serif SC, SimSun, STSong, serif' font-weight="700" filter="url(#ob-verdict-glow)">${escaped}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function oracleBonesVerdictLabelEs(verdict: OracleBonesVerdict): string {
  const m: Record<OracleBonesVerdict, string> = {
    auspicious_clear: "吉 — favorable claro",
    auspicious_moderate: "吉 — favorable moderado",
    inauspicious_moderate: "凶 — desfavorable moderado",
    inauspicious_clear: "凶 — desfavorable claro",
    silent: "Silencio / sin respuesta clara",
  };
  return m[verdict];
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
  <text x="${cx}" y="690" text-anchor="middle" fill="${sub}" font-size="24" font-family="Segoe UI, Arial">Vista simbólica (respaldo) · ${oracleBonesVerdictLabelEs(params.verdict)}</text>
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

function resolveTierSize(lastPack?: string): { width: number; height: number } {
  const key = lastPack ? toContextTierKey(lastPack) : "free";
  const highRes = new Set(["practitioner", "master"]);
  if (highRes.has(key)) {
    return { width: 2688, height: 1536 };
  }
  return { width: 1344, height: 768 };
}

/** Together AI: dimensions must be multiples of 32 (1184≈1200, 1504≈1500). */
function resolveTogetherImageSize(lastPack?: string): { width: number; height: number } {
  const key = lastPack ? toContextTierKey(lastPack) : "free";
  switch (key) {
    case "free":
      return { width: 1024, height: 768 };
    case "seeker":
      return { width: 1024, height: 1024 };
    case "practitioner":
      return { width: 1184, height: 1184 };
    case "master":
      return { width: 1504, height: 1504 };
  }
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

async function generateWithTogether(prompt: string, width: number, height: number): Promise<{ url: string | null; debug: TogetherDebug }> {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) {
    return {
      url: null,
      debug: {
        attempted: true,
        hasKey: false,
      },
    };
  }
  debugLog("together: generating image", { model: process.env.TOGETHER_IMAGE_MODEL, width, height });
  const model =
    process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.1-schnell";
  // Together (FLUX.1-schnell) rechaza steps fuera de 1..12.
  const stepsRaw = Number(process.env.TOGETHER_IMAGE_STEPS ?? "10");
  const steps = Math.min(12, Math.max(1, Number.isFinite(stepsRaw) ? stepsRaw : 10));
  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: prompt.slice(0, 1500),
      width,
      height,
      n: 1,
      steps,
      response_format: "url",
    }),
  });
  if (!res.ok) {
    let err = "";
    try {
      err = await res.text();
    } catch {
      err = "";
    }
    debugLog("together: request failed", { status: res.status, snippet: err.slice(0, 500) });
    return {
      url: null,
      debug: {
        attempted: true,
        hasKey: true,
        status: res.status,
        errorSnippet: err.slice(0, 300),
      },
    };
  }
  const data = (await res.json()) as { data?: Array<{ url?: string; b64_json?: string }> };
  const first = data.data?.[0];
  if (!first) {
    debugLog("together: missing data.data[0]", { hasData: Boolean(data.data?.length) });
    return {
      url: null,
      debug: {
        attempted: true,
        hasKey: true,
        errorSnippet: "missing data.data[0]",
      },
    };
  }
  if (first.url) {
    debugLog("together: got url", { urlPrefix: first.url.slice(0, 40) });
    return {
      url: first.url,
      debug: {
        attempted: true,
        hasKey: true,
      },
    };
  }
  if (first.b64_json) {
    debugLog("together: got b64_json", { bytesApprox: first.b64_json.length });
    return {
      url: `data:image/png;base64,${first.b64_json}`,
      debug: {
        attempted: true,
        hasKey: true,
      },
    };
  }
  debugLog("together: unexpected response shape", { keys: Object.keys(first ?? {}) });
  return {
    url: null,
    debug: {
      attempted: true,
      hasKey: true,
      errorSnippet: "unexpected response shape",
    },
  };
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
}): Promise<{
  provider: ResolvedImageProvider;
  imageUrl: string;
  fallbackImageUrl: string;
  debug?: ImageProviderDebug;
  /** When present, the compositor will overlay deterministic bars/text on top of the remote background. */
  overlaySvgDataUrl?: string;
}> {
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
    const debug: ImageProviderDebug = {
      providerResolved: "svg-art",
      providerOverride: params.providerOverride,
      imageProviderEnv: process.env.IMAGE_PROVIDER ?? null,
      sumiOnlyMode: true,
    };
    return { provider: "svg-art", imageUrl: sumiFallback, fallbackImageUrl: sumiFallback, debug };
  }

  const provider = resolveProvider(params.providerOverride);
  const debug: ImageProviderDebug = {
    providerResolved: provider,
    providerOverride: params.providerOverride,
    imageProviderEnv: process.env.IMAGE_PROVIDER ?? null,
    sumiOnlyMode: sumiOnlyMode(),
  };
  debugLog("buildImageAsset: provider resolved", {
    provider,
    override: params.providerOverride ?? null,
    imageProviderEnv: process.env.IMAGE_PROVIDER ?? null,
    togetherHasKey: Boolean(process.env.TOGETHER_API_KEY),
    sumiOnlyMode: sumiOnlyMode(),
  });
  const { width: tierWidth, height: tierHeight } = resolveTierSize(params.tier);
  const promptForRemote = compactPrompt(params.prompt, provider === "pollinations" ? 900 : 1100);
  const fallbackImageUrl = sumiFallback;

  const overlayBase = {
    lines: params.lines,
    primaryNumber: params.primaryHexagram,
    primaryName: params.primaryHexagramName,
    primaryChinese: params.primaryChinese,
    pinyin: params.pinyin,
    transformedNumber: params.transformedHexagram?.number ?? null,
    transformedName: params.transformedHexagram?.name ?? null,
    transformedChinese: params.transformedHexagram?.chineseName ?? null,
  };

  if (provider === "pollinations") {
    const model = process.env.POLLINATIONS_MODEL ?? "flux";
    const width = Number(process.env.POLLINATIONS_WIDTH ?? String(tierWidth));
    const height = Number(process.env.POLLINATIONS_HEIGHT ?? String(tierHeight));
    const seed = Math.floor(Math.random() * 1_000_000_000);
    const encoded = encodeURIComponent(promptForRemote);
    const imageUrl =
      `https://image.pollinations.ai/prompt/${encoded}` +
      `?model=${encodeURIComponent(model)}&width=${width}&height=${height}&seed=${seed}&nologo=true`;
    const overlaySvgDataUrl = buildSumiHexagramOverlaySvgDataUrl({
      ...overlayBase,
      outputWidth: width,
      outputHeight: height,
    });
    return { provider, imageUrl, fallbackImageUrl, debug, overlaySvgDataUrl };
  }

  if (provider === "fal") {
    const falImage = await generateWithFal(promptForRemote, tierWidth, tierHeight);
    if (falImage) {
      const overlaySvgDataUrl = buildSumiHexagramOverlaySvgDataUrl({
        ...overlayBase,
        outputWidth: tierWidth,
        outputHeight: tierHeight,
      });
      return { provider, imageUrl: falImage, fallbackImageUrl, debug, overlaySvgDataUrl };
    }
  }

  if (provider === "gpt-image") {
    const gptImage = await generateWithGptImage(promptForRemote, tierWidth, tierHeight);
    if (gptImage) {
      const overlaySvgDataUrl = buildSumiHexagramOverlaySvgDataUrl({
        ...overlayBase,
        outputWidth: tierWidth,
        outputHeight: tierHeight,
      });
      return { provider, imageUrl: gptImage, fallbackImageUrl, debug, overlaySvgDataUrl };
    }
  }

  if (provider === "together") {
    const { width: tw, height: th } = resolveTogetherImageSize(params.tier);
    const { url, debug: togetherDebug } = await generateWithTogether(promptForRemote, tw, th);
    debug.together = togetherDebug;
    if (url) {
      const overlaySvgDataUrl = buildSumiHexagramOverlaySvgDataUrl({
        ...overlayBase,
        outputWidth: tw,
        outputHeight: th,
      });
      return { provider, imageUrl: url, fallbackImageUrl, debug, overlaySvgDataUrl };
    }
  }

  return {
    provider: "svg-art",
    imageUrl: sumiFallback,
    fallbackImageUrl,
    debug: { ...debug, together: debug.together ?? undefined },
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
}): Promise<{
  provider: ResolvedImageProvider;
  imageUrl: string;
  fallbackImageUrl: string;
  overlaySvgDataUrl?: string;
}> {
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
    const overlaySvgDataUrl = buildOracleBonesSymbolOverlaySvgDataUrl({
      verdict: params.verdict,
      outputWidth: width,
      outputHeight: height,
    });
    return { provider, imageUrl, fallbackImageUrl, overlaySvgDataUrl };
  }

  if (provider === "fal") {
    const falImage = await generateWithFal(promptForRemote, tierWidth, tierHeight);
    if (falImage) {
      const overlaySvgDataUrl = buildOracleBonesSymbolOverlaySvgDataUrl({
        verdict: params.verdict,
        outputWidth: tierWidth,
        outputHeight: tierHeight,
      });
      return { provider, imageUrl: falImage, fallbackImageUrl, overlaySvgDataUrl };
    }
  }

  if (provider === "gpt-image") {
    const gptImage = await generateWithGptImage(promptForRemote, tierWidth, tierHeight);
    if (gptImage) {
      const overlaySvgDataUrl = buildOracleBonesSymbolOverlaySvgDataUrl({
        verdict: params.verdict,
        outputWidth: tierWidth,
        outputHeight: tierHeight,
      });
      return { provider, imageUrl: gptImage, fallbackImageUrl, overlaySvgDataUrl };
    }
  }

  if (provider === "together") {
    const { width: tw, height: th } = resolveTogetherImageSize(params.tier);
    const { url } = await generateWithTogether(promptForRemote, tw, th);
    if (url) {
      const overlaySvgDataUrl = buildOracleBonesSymbolOverlaySvgDataUrl({
        verdict: params.verdict,
        outputWidth: tw,
        outputHeight: th,
      });
      return { provider, imageUrl: url, fallbackImageUrl, overlaySvgDataUrl };
    }
  }

  return { provider: "mock", imageUrl: fallbackImageUrl, fallbackImageUrl };
}
