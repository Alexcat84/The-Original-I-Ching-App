import type { OracleBoneMedium, OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { access } from "node:fs/promises";
import path from "node:path";
import { toContextTierKey } from "@/lib/credits";
import { embedCjkFontInOverlaySvg } from "@/lib/embed-svg-overlay-font";
import {
  oracleBonesVerdictChinese,
  oracleBonesVerdictGlyphSvgStyle,
} from "@/lib/oracle-bones-verdict-glyph";
import { renderSvgToPng } from "@/lib/svg-to-png";
import {
  buildTogetherNegativePrompt,
  compactTogetherFluxPromptSegment,
  TOGETHER_FLUX_NEGATIVE_PROMPT_MAX_CHARS,
  TOGETHER_FLUX_PROMPT_MAX_CHARS,
} from "@iching-oracle/image-engine";
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

type PrebuiltFallbackKind = "iching" | "bones";

const PREBUILT_FALLBACKS_PER_BUCKET = 10;
const prebuiltFallbackExistsCache = new Map<string, boolean>();

function toTransformedHexagramLines(lines: SumiLineInput[], hasChanges: boolean): SumiLineInput[] {
  if (!hasChanges) return lines;
  return lines.map((line) => {
    if (line.value === 6) {
      return { ...line, value: 7, isChanging: false };
    }
    if (line.value === 9) {
      return { ...line, value: 8, isChanging: false };
    }
    return { ...line, isChanging: false };
  });
}

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
 *
 * viewBox MUST match output width/height so resvg does not letterbox (e.g. 16:9 viewBox inside 1024×1024 → black side bars on composite).
 */
function buildOracleBonesSymbolOverlaySvgDataUrl(params: {
  verdict: OracleBonesVerdict;
  outputWidth: number;
  outputHeight: number;
}): string {
  const W = Math.max(1, Math.round(params.outputWidth));
  const H = Math.max(1, Math.round(params.outputHeight));
  const cx = W / 2;
  const cy = H / 2;
  const idPrefix = `obov${params.verdict.replace(/_/g, "")}`;
  const gStyle = oracleBonesVerdictGlyphSvgStyle(params.verdict, idPrefix);
  const filterId = `${idPrefix}-glow`;
  const raw = oracleBonesVerdictChinese(params.verdict);
  const escaped = escapeXmlOracleOverlay(raw);
  const fontSize = raw.length > 1 ? Math.round((176 / 768) * H) : Math.round((300 / 768) * H);
  const letterSpacing = raw.length > 1 ? Math.round((22 / 1344) * W) : 0;
  const strokeW = Math.max(2, (gStyle.overlayStrokeWidth * W) / 1344);
  const blur = Math.max(1.5, (4 * Math.min(W, H)) / 768);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  ${gStyle.glyphGradientDefs}
  <filter id="${filterId}" x="-45%" y="-45%" width="190%" height="190%">
    <feGaussianBlur stdDeviation="${blur}" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="${gStyle.glyphFill}" stroke="${gStyle.glyphStroke}" stroke-width="${strokeW}" paint-order="stroke fill" font-size="${fontSize}" letter-spacing="${letterSpacing}" font-family='Noto Serif TC, Noto Serif SC, SimSun, STSong, serif' font-weight="700" filter="url(#${filterId})">${escaped}</text>
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
  const gStyle = oracleBonesVerdictGlyphSvgStyle(params.verdict, `obm${uid}`);
  const glyph = oracleBonesVerdictChinese(params.verdict);
  const escaped = escapeXmlOracleOverlay(glyph);
  const fontSize = glyph.length > 1 ? Math.round(H * 0.175) : Math.round(Math.min(W, H) * 0.28);
  const letterSpacing = glyph.length > 1 ? Math.round(W * 0.014) : 0;
  const tcx = W / 2;
  const tcy = H / 2;
  const swGrain = Math.max(1, W * 0.001);
  const swGrain2 = Math.max(0.8, W * 0.0007);
  const swStroke = Math.max(2, W * 0.002);
  const swTextStroke = Math.max(
    3,
    Math.round(gStyle.overlayStrokeWidth * (W / 1344)),
  );
  const blur = Math.max(2, Math.min(W, H) * 0.003);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${gStyle.glyphGradientDefs}
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
  <text x="${tcx}" y="${tcy}" text-anchor="middle" dominant-baseline="middle" fill="${gStyle.glyphFill}" stroke="${gStyle.glyphStroke}" stroke-width="${swTextStroke}" paint-order="stroke fill" font-size="${fontSize}" letter-spacing="${letterSpacing}" font-family='Noto Serif TC, Noto Serif SC, SimSun, STSong, serif' font-weight="700" filter="url(#${filterId})">${escaped}</text>
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

function svgStringToDataUrl(svg: string): string {
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

function resolveTierKey(lastPack?: string): "free" | "seeker" | "practitioner" | "master" {
  return lastPack ? toContextTierKey(lastPack) : "free";
}

function prebuiltFallbackRelativePath(params: {
  kind: PrebuiltFallbackKind;
  tier: "free" | "seeker" | "practitioner" | "master";
  width: number;
  height: number;
  index: number;
}): string {
  const file = `${String(params.index).padStart(2, "0")}.png`;
  return `/fallbacks/prebuilt/${params.kind}/${params.tier}/${params.width}x${params.height}/${file}`;
}

function candidatePublicAbsolutePaths(relativePath: string): string[] {
  const noSlash = relativePath.replace(/^\//, "");
  return [
    path.join(process.cwd(), "public", noSlash),
    path.join(process.cwd(), "apps", "web", "public", noSlash),
  ];
}

async function prebuiltFallbackFileExists(relativePath: string): Promise<boolean> {
  const cached = prebuiltFallbackExistsCache.get(relativePath);
  if (cached !== undefined) return cached;
  let exists = false;
  const candidates = candidatePublicAbsolutePaths(relativePath);
  for (const absPath of candidates) {
    try {
      await access(absPath);
      exists = true;
      break;
    } catch {
      // try next candidate
    }
  }
  prebuiltFallbackExistsCache.set(relativePath, exists);
  return exists;
}

function indexProbeOrder(seedIndex: number, count: number): number[] {
  const list: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const idx = ((seedIndex - 1 + i) % count) + 1;
    list.push(idx);
  }
  return list;
}

async function pickPrebuiltFallbackImageUrl(params: {
  kind: PrebuiltFallbackKind;
  tier?: string;
  width: number;
  height: number;
  seed?: string;
}): Promise<string | null> {
  const tier = resolveTierKey(params.tier);
  const startIndex = params.seed ? (fnv1a32(params.seed) % PREBUILT_FALLBACKS_PER_BUCKET) + 1 : Math.floor(Math.random() * PREBUILT_FALLBACKS_PER_BUCKET) + 1;
  const order = indexProbeOrder(startIndex, PREBUILT_FALLBACKS_PER_BUCKET);
  for (const index of order) {
    const rel = prebuiltFallbackRelativePath({
      kind: params.kind,
      tier,
      width: params.width,
      height: params.height,
      index,
    });
    if (await prebuiltFallbackFileExists(rel)) return rel;
  }
  return null;
}

function resolveTierSize(lastPack?: string): { width: number; height: number } {
  const key = resolveTierKey(lastPack);
  const highRes = new Set(["practitioner", "master"]);
  if (highRes.has(key)) {
    return { width: 2688, height: 1536 };
  }
  return { width: 1344, height: 768 };
}

/** Together AI: dimensions must be multiples of 32 (1184≈1200, 1504≈1500). */
function resolveTogetherImageSize(lastPack?: string): { width: number; height: number } {
  const key = resolveTierKey(lastPack);
  switch (key) {
    case "free":
      return { width: 1024, height: 1024 };
    case "seeker":
      return { width: 1216, height: 1216 };
    case "practitioner":
      return { width: 1504, height: 1504 };
    case "master":
      return { width: 1792, height: 1792 };
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

function togetherImageGenerationOptionalFields(): {
  guidance_scale?: number;
  seed?: number;
  output_format?: "jpeg" | "png";
} {
  const fields: {
    guidance_scale?: number;
    seed?: number;
    output_format?: "jpeg" | "png";
  } = {};
  const gs = process.env.TOGETHER_GUIDANCE_SCALE?.trim();
  if (gs) {
    const n = Number(gs);
    if (Number.isFinite(n) && n > 0) fields.guidance_scale = n;
  }
  const seedRaw = process.env.TOGETHER_IMAGE_SEED?.trim();
  if (seedRaw) {
    const s = Number(seedRaw);
    if (Number.isFinite(s)) fields.seed = Math.trunc(s);
  }
  const fmt = process.env.TOGETHER_OUTPUT_FORMAT?.trim().toLowerCase();
  if (fmt === "jpeg" || fmt === "png") fields.output_format = fmt;
  return fields;
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
    process.env.TOGETHER_IMAGE_MODEL ?? "black-forest-labs/FLUX.2-dev";
  // Together (FLUX.2-dev) permite más steps para mayor detalle.
  const stepsRaw = Number(process.env.TOGETHER_IMAGE_STEPS ?? "28");
  const steps = Math.min(50, Math.max(1, Number.isFinite(stepsRaw) ? stepsRaw : 28));
  const promptForApi = compactTogetherFluxPromptSegment(prompt, TOGETHER_FLUX_PROMPT_MAX_CHARS);
  const negativePrompt = compactTogetherFluxPromptSegment(
    buildTogetherNegativePrompt(),
    TOGETHER_FLUX_NEGATIVE_PROMPT_MAX_CHARS,
  );
  const optionalApi = togetherImageGenerationOptionalFields();
  debugLog("together: prompt lens", {
    incomingPromptChars: prompt.length,
    outgoingPromptChars: promptForApi.length,
    negativePromptChars: negativePrompt.length,
    includesPrimarySetting: promptForApi.includes("PRIMARY SETTING"),
    budgetPrompt: TOGETHER_FLUX_PROMPT_MAX_CHARS,
    budgetNegative: TOGETHER_FLUX_NEGATIVE_PROMPT_MAX_CHARS,
    apiOptional: optionalApi,
  });
  const res = await fetch("https://api.together.xyz/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: promptForApi,
      negative_prompt: negativePrompt,
      width,
      height,
      n: 1,
      steps,
      response_format: "url",
      ...optionalApi,
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
  const hasChanges = params.changingLines.length > 0;
  const displayLines = toTransformedHexagramLines(params.lines, hasChanges);
  const sumiFallback = sumiUrlForIChing({
    lines: displayLines,
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
  const { width: togetherFallbackW, height: togetherFallbackH } = resolveTogetherImageSize(params.tier);
  const promptForRemote = compactPrompt(
    params.prompt,
    provider === "pollinations" ? 900 : provider === "together" ? TOGETHER_FLUX_PROMPT_MAX_CHARS : 1100,
  );
  let fallbackImageUrl = sumiFallback;
  if (provider === "together") {
    const prebuilt = await pickPrebuiltFallbackImageUrl({
      kind: "iching",
      tier: params.tier,
      width: togetherFallbackW,
      height: togetherFallbackH,
      seed: params.consultationId ?? `${params.primaryHexagram}-${params.transformedHexagram?.number ?? "none"}`,
    });
    if (prebuilt) fallbackImageUrl = prebuilt;
  }

  const overlayBase = {
    lines: displayLines,
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

  const preferPrebuiltFallback =
    provider === "together" && fallbackImageUrl.startsWith("/fallbacks/prebuilt/");
  if (preferPrebuiltFallback) {
    debugLog("buildImageAsset: together failed, using prebuilt fallback as primary", {
      fallbackImageUrl,
      togetherDebug: debug.together,
    });
    return {
      provider: "mock",
      imageUrl: fallbackImageUrl,
      fallbackImageUrl,
      debug: { ...debug, together: debug.together ?? undefined },
    };
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
  const { width: togetherFallbackW, height: togetherFallbackH } = resolveTogetherImageSize(params.tier);
  const promptForRemote = compactPrompt(params.prompt, 900);
  const prebuiltTogetherFallback =
    provider === "together"
      ? await pickPrebuiltFallbackImageUrl({
          kind: "bones",
          tier: params.tier,
          width: togetherFallbackW,
          height: togetherFallbackH,
          seed: params.consultationId ?? `${params.patternId}-${params.verdict}`,
        })
      : null;
  const fallbackSvg = buildOracleBonesMockSvgString({
    verdict: params.verdict,
    medium: params.medium,
    consultationId: params.consultationId,
    width: ORACLE_BONES_MOCK_WIDTH,
    height: ORACLE_BONES_MOCK_HEIGHT,
  });
  const fallbackSvgDataUrl = svgStringToDataUrl(fallbackSvg);
  let fallbackImageUrl = prebuiltTogetherFallback ?? fallbackSvgDataUrl;
  if (!prebuiltTogetherFallback) {
    try {
      fallbackImageUrl = await rasterizeOracleBonesMockSvgToPng(fallbackSvg);
    } catch (error) {
      console.warn("[image-provider] oracle bones fallback PNG rasterization failed, using SVG data URL", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

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

