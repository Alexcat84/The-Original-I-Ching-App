import path from "node:path";
import { fileURLToPath } from "node:url";

/** Monorepo root (apps/web/src/lib → four levels up). */
const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

/** Static paths so webpack does not warn on createRequire().resolve() expressions. */
export const FONTSOURCE_WOFF_PATHS = {
  notoSerifTc700: path.join(
    REPO_ROOT,
    "node_modules",
    "@fontsource",
    "noto-serif-tc",
    "files",
    "noto-serif-tc-chinese-traditional-700-normal.woff",
  ),
  notoSerifLatinExt400: path.join(
    REPO_ROOT,
    "node_modules",
    "@fontsource",
    "noto-serif",
    "files",
    "noto-serif-latin-ext-400-normal.woff",
  ),
  notoSansSymbols400: path.join(
    REPO_ROOT,
    "node_modules",
    "@fontsource",
    "noto-sans-symbols-2",
    "files",
    "noto-sans-symbols-2-symbols-400-normal.woff",
  ),
} as const;

export type FontsourceWoffKey = keyof typeof FONTSOURCE_WOFF_PATHS;
