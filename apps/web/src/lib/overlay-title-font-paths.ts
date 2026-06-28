/**
 * Resolves overlay title font files for serverless (Vercel) and local dev.
 * Uses process.cwd() candidate bases — never import.meta.url (breaks after Next bundling).
 * See docs/auditorias/20260627-AUD-IMG-OVR-03-khwan-resvg-regression.md §12.
 */
import { access } from "node:fs/promises";
import path from "node:path";
import { GlobalFonts } from "@napi-rs/canvas";

export type OverlayTitleFontPaths = {
  latinBasic: string;
  latinExt: string;
  cjk: string;
};

export const LATIN_BASIC_FAMILY = "IChingOverlayLatinBasic";
export const LATIN_EXT_FAMILY = "IChingOverlayLatinExt";
export const CJK_FAMILY = "IChingOverlayCJK";

const FONT_REL = {
  latinBasic: path.join(
    "node_modules",
    "@fontsource",
    "noto-serif",
    "files",
    "noto-serif-latin-400-normal.woff",
  ),
  latinExt: path.join(
    "node_modules",
    "@fontsource",
    "noto-serif",
    "files",
    "noto-serif-latin-ext-400-normal.woff",
  ),
  cjk: path.join("fonts", "noto-serif-tc-hexagram-titles.woff2"),
} as const;

/** cwd layouts seen in dev (apps/web), monorepo root, and Vercel lambdas. */
function candidateBases(cwd: string): string[] {
  const seen = new Set<string>();
  const add = (p: string) => {
    const n = path.normalize(p);
    if (!seen.has(n)) seen.add(n);
  };
  add(cwd);
  add(path.join(cwd, "apps", "web"));
  add(path.join(cwd, ".."));
  add(path.join(cwd, "..", ".."));
  return [...seen];
}

function buildCandidates(relativePath: string): string[] {
  const cwd = process.cwd();
  const out: string[] = [];
  for (const base of candidateBases(cwd)) {
    out.push(path.join(base, relativePath));
  }
  return out;
}

async function firstExisting(relativePath: string, label: string): Promise<string> {
  const candidates = buildCandidates(relativePath);
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }
  throw new Error(
    `Overlay title font "${label}" not found (cwd=${process.cwd()}). Tried:\n${candidates.map((c) => `  - ${c}`).join("\n")}`,
  );
}

let cachedPaths: OverlayTitleFontPaths | undefined;

export async function resolveOverlayTitleFontPaths(): Promise<OverlayTitleFontPaths> {
  if (cachedPaths) return cachedPaths;
  const [latinBasic, latinExt, cjk] = await Promise.all([
    firstExisting(FONT_REL.latinBasic, "latinBasic"),
    firstExisting(FONT_REL.latinExt, "latinExt"),
    firstExisting(FONT_REL.cjk, "cjk"),
  ]);
  cachedPaths = { latinBasic, latinExt, cjk };
  return cachedPaths;
}

/** Registers all three fonts; throws if any registerFromPath returns null. */
export function assertOverlayTitleFontsRegistered(paths: OverlayTitleFontPaths): void {
  const entries: Array<{ filePath: string; family: string; label: string }> = [
    { filePath: paths.latinBasic, family: LATIN_BASIC_FAMILY, label: "latinBasic" },
    { filePath: paths.latinExt, family: LATIN_EXT_FAMILY, label: "latinExt" },
    { filePath: paths.cjk, family: CJK_FAMILY, label: "cjk" },
  ];
  for (const { filePath, family, label } of entries) {
    const result = GlobalFonts.registerFromPath(filePath, family);
    if (result == null) {
      throw new Error(`GlobalFonts.registerFromPath failed for ${label}: ${filePath}`);
    }
  }
}

/** U+0000–U+00FF → latin basic file; U+0100+ → latin-ext (fontkit-verified boundary). */
export function latinFontKeyForChar(ch: string): "latinBasic" | "latinExt" {
  return ch.codePointAt(0)! <= 0xff ? "latinBasic" : "latinExt";
}

/** Clears cached paths (tests only). */
export function resetOverlayTitleFontPathCacheForTests(): void {
  cachedPaths = undefined;
}
