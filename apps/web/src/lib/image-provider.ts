import type { OracleBoneMedium, OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { toContextTierKey } from "@/lib/credits";
import { embedCjkFontInOverlaySvg } from "@/lib/embed-svg-overlay-font";
import { oracleBonesVerdictChinese } from "@/lib/oracle-bones-verdict-glyph";
import { renderSvgToPng } from "@/lib/svg-to-png";
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

/** Mock / fallback oracle-bones art: fixed 16:9 canvas (historical); tier-based sizes apply only to remote generation. */
const ORACLE_BONES_MOCK_WIDTH = 1344;
const ORACLE_BONES_MOCK_HEIGHT = 768;

/**
 * Symbolic plastron / bone plate + verdict glyph only (no captions).
 * Rasterized to PNG with embedded CJK so `<img>` shows glyphs (isolated SVG does not use page fonts).
 */
function buildOracleBonesMockSvgString(params: {
  verdict: OracleBonesVerdict;
  medium: OracleBoneMedium;
  consultationId?: string;
  width: number;
  height: number;
}): string {
  const W = params.width;
  const H = params.height;
  const seedStr =
    params.consultationId ?? `oracle-bones|${params.verdict}|${params.medium}|${W}x${H}`;
  const rng = mulberry32(fnv1a32(seedStr));
  const uid = (fnv1a32(seedStr) >>> 0).toString(16).slice(0, 8);
  const bg = shiftHexForOracle("#1a1510", rng, 18);
  const boneTop = shiftHexForOracle("#e8dcc8", rng, 20);
  const boneBot = shiftHexForOracle("#c4b29a", rng, 20);
  const stroke = shiftHexForOracle("#5c4a3a", rng, 16);
  const grainA = (0.04 + rng() * 0.06).toFixed(3);
  const grainB = (0.03 + rng() * 0.05).toFixed(3);
  const cx = W * 0.5;
  const bw = W * (0.38 + rng() * 0.06);
  const bh = H * (0.58 + rng() * 0.06);
  const bx = cx - bw / 2;
  const by = H * (0.14 + rng() * 0.04);
  const br = Math.round(W * (0.025 + rng() * 0.008));
  const gradId = `obm-bone-${uid}`;
  const filterId = `obm-text-${uid}`;
  const glyph = oracleBonesVerdictChinese(params.verdict);
  const escaped = escapeXmlOracleOverlay(glyph);
  const fontSize = glyph.length > 1 ? Math.round(H * 0.13) : Math.round(Math.min(W, H) * 0.2);
  const letterSpacing = glyph.length > 1 ? Math.round(W * 0.012) : 0;
  const tcx = bx + bw / 2;
  const tcy = by + bh * 0.58;
  const swGrain = Math.max(1, W * 0.001);
  const swGrain2 = Math.max(0.8, W * 0.0007);
  const swStroke = Math.max(2, W * 0.002);
  const swTextStroke = Math.max(3, W * 0.004);
  const blur = Math.max(2, Math.min(W, H) * 0.003);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${boneTop}" />
      <stop offset="100%" stop-color="${boneBot}" />
    </linearGradient>
    <filter id="${filterId}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="${blur}" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}" />
  <path fill="none" stroke="rgba(200,180,140,${grainA})" stroke-width="${swGrain}" stroke-linecap="round" d="M0 ${Math.round(H * (0.22 + rng() * 0.12))} Q${Math.round(W * 0.35)} ${Math.round(H * (0.38 + rng() * 0.06))} ${Math.round(W * 0.55)} ${Math.round(H * (0.32 + rng() * 0.08))} T${W} ${Math.round(H * (0.25 + rng() * 0.08))}"/>
  <path fill="none" stroke="rgba(160,140,110,${grainB})" stroke-width="${swGrain2}" stroke-linecap="round" d="M0 ${Math.round(H * (0.68 + rng() * 0.08))} Q${Math.round(W * 0.42)} ${Math.round(H * (0.75 + rng() * 0.04))} ${Math.round(W * 0.72)} ${Math.round(H * (0.7 + rng() * 0.06))} T${W} ${Math.round(H * (0.78 + rng() * 0.05))}"/>
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${br}" fill="url(#${gradId})" stroke="${stroke}" stroke-width="${swStroke}"/>
  <text x="${tcx}" y="${tcy}" text-anchor="middle" fill="#1c1410" stroke="rgba(255,248,240,0.94)" stroke-width="${swTextStroke}" paint-order="stroke fill" font-size="${fontSize}" letter-spacing="${letterSpacing}" font-family='Noto Serif SC, SimSun, STSong, serif' font-weight="700" filter="url(#${filterId})">${escaped}</text>
</svg>`;
}

async function rasterizeOracleBonesMockSvgToPng(svg: string): Promise<string> {
  const embedded = await embedCjkFontInOverlaySvg(svg);
  const wMatch =
    embedded.match(/viewBox="0\s+0\s+(\d+)\s+(\d+)"/) ??
    embedded.match(/width="(\d+)"[^>]*height="(\d+)"/);
  const width = wMatch ? Number(wMatch[1]) : 1344;
  const buf = await renderSvgToPng(embedded, width);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function buildOracleBonesMockPngDataUrl(params: {
  verdict: OracleBonesVerdict;
  medium: OracleBoneMedium;
  consultationId?: string;
  width: number;
  height: number;
}): Promise<string> {
  const svg = buildOracleBonesMockSvgString(params);
  return rasterizeOracleBonesMockSvgToPng(svg);
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
  const fallbackImageUrl = await buildOracleBonesMockPngDataUrl({
    verdict: params.verdict,
    medium: params.medium,
    consultationId: params.consultationId,
    width: ORACLE_BONES_MOCK_WIDTH,
    height: ORACLE_BONES_MOCK_HEIGHT,
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

