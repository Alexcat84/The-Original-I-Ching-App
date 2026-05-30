#!/usr/bin/env node
/**
 * i18n governance audit — fails CI when copy drifts outside @iching-oracle/i18n.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

const errors = [];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "dist" || name === ".next") continue;
      walk(p, out);
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

function rel(p) {
  return relative(ROOT, p).replace(/\\/g, "/");
}

function scanPartialRecord() {
  const dirs = [
    join(ROOT, "packages/i18n/src"),
    join(ROOT, "apps/web/src"),
  ];
  for (const dir of dirs) {
    for (const file of walk(dir)) {
      const src = readFileSync(file, "utf8");
      if (src.includes("Partial<Record<AppLocale")) {
        errors.push(`${rel(file)}: uses Partial<Record<AppLocale, …>> (must be Record<AppLocale, …>)`);
      }
    }
  }
}

function scanIsEsPdf() {
  const dir = join(ROOT, "apps/web/src");
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    if (/\bisEsPdf\b/.test(src)) {
      errors.push(`${rel(file)}: contains isEsPdf (use pdf-export-ui + app locale)`);
    }
  }
}

/** Record<AppLocale in apps/web is only allowed for prop types (e.g. AuthLocalePicker). */
function scanWebRecordBlocks() {
  const whitelist = new Set(["apps/web/src/components/AuthLocalePicker.tsx"]);
  const dir = join(ROOT, "apps/web/src");
  for (const file of walk(dir)) {
    const r = rel(file);
    if (whitelist.has(r)) continue;
    const src = readFileSync(file, "utf8");
    if (/Record<\s*AppLocale/.test(src)) {
      errors.push(`${rel(file)}: inline Record<AppLocale, …> copy block (move to packages/i18n)`);
    }
  }
}

function scanHreflang() {
  const seoPath = join(ROOT, "apps/web/src/lib/seo-canonical.ts");
  const localesPath = join(ROOT, "packages/i18n/src/locales.ts");
  const seo = readFileSync(seoPath, "utf8");
  const locales = readFileSync(localesPath, "utf8");

  if (/HREFLANG_LOCALES\s*=\s*\[\s*\.\.\.\s*SUPPORTED_LOCALES\s*\]/.test(seo)) {
    if (!/import\s*\{[^}]*SUPPORTED_LOCALES[^}]*\}\s*from\s*"@iching-oracle\/i18n"/.test(seo)) {
      errors.push("seo-canonical.ts: HREFLANG_LOCALES must import SUPPORTED_LOCALES from @iching-oracle/i18n");
    }
    return;
  }

  const hrefMatch = seo.match(/HREFLANG_LOCALES\s*=\s*\[([^\]]+)\]/);
  const supportedMatch = locales.match(
    /SUPPORTED_LOCALES\s*=\s*\[([\s\S]*?)\]\s*as\s*const/,
  );
  if (!hrefMatch || !supportedMatch) {
    errors.push("Could not parse HREFLANG_LOCALES or SUPPORTED_LOCALES");
    return;
  }
  const parseCodes = (block) =>
    [...block.matchAll(/"([a-z]{2})"/g)].map((m) => m[1]).sort();
  const href = parseCodes(hrefMatch[1]);
  const supported = parseCodes(supportedMatch[1]);
  if (href.length !== supported.length || href.some((c, i) => c !== supported[i])) {
    errors.push(
      `HREFLANG_LOCALES [${href.join(", ")}] !== SUPPORTED_LOCALES [${supported.join(", ")}]`,
    );
  }
}

scanPartialRecord();
scanIsEsPdf();
scanWebRecordBlocks();
scanHreflang();

if (errors.length > 0) {
  console.error("i18n audit failed:\n");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("i18n audit passed");
