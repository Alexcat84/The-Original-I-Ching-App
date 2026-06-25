#!/usr/bin/env node

/**
 * QA code: VF-DOC-001 docs-remediation · v1.0.0
 * Area: scripts/verify-docs-remediation
 * Family: DOC
 */

/**
 * Point-by-point verification for the P0-P3 remediation in
 * docs/auditorias/20260622-AUD-DOC-01-user-docs-vs-implementation.md.
 *
 * Checks both STRUCTURE (the key exists, non-empty, in all 11 locales — a
 * Record<AppLocale,T> already guarantees this at compile time, this is an
 * independent runtime proof against the built dist) and CONTENT (the actual
 * wording says what it should, e.g. no leftover "Zhu Xi rules" claim, the
 * new Library bullets are non-empty, the one real broken FAQ anchor now
 * resolves to a real heading id).
 *
 * Usage: node scripts/verify-docs-remediation.mjs
 * Exits non-zero and prints every failing check if anything is incomplete.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const {
  SUPPORTED_LOCALES,
  getGuiaPageUiMessages,
  getHomeTourUiMessages,
  getAuditsPageUiMessages,
  getFaqPageUiMessages,
  resolveFaqRelatedHref,
} = await import("../packages/i18n/dist/index.js");

const failures = [];
function check(label, condition) {
  if (!condition) failures.push(label);
}

const GUIA_PAGE_TSX = readFileSync(
  join(ROOT, "apps/web/src/app/guia/page.tsx"),
  "utf8",
);

const GUIA_ANCHOR_IDS = [...GUIA_PAGE_TSX.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);

// ---------------------------------------------------------------------------
// P0 — factual corrections + the one real broken anchor
// ---------------------------------------------------------------------------

for (const locale of SUPPORTED_LOCALES) {
  const g = getGuiaPageUiMessages(locale);
  check(
    `P0.1 [${locale}] ichingCastModeP1 does not claim a single default tradition`,
    !/Zhu\s*Xi/i.test(g.ichingCastModeP1),
  );

  const tour = getHomeTourUiMessages(locale);
  check(
    `P0.2 [${locale}] tour step4Body does not claim Zhu Xi as the I Ching default`,
    !/Zhu\s*Xi/i.test(tour.step4Body),
  );
}

check(
  "P0.3 resolveFaqRelatedHref(userGuideGettingStarted) points to a real heading id",
  GUIA_ANCHOR_IDS.includes(
    resolveFaqRelatedHref("userGuideGettingStarted").split("#")[1],
  ),
);
check(
  "P0.3 the old broken anchor #primeros-pasos is gone from resolveFaqRelatedHref",
  resolveFaqRelatedHref("userGuideGettingStarted") !== "/guia#primeros-pasos",
);

// Every FAQ entry that links to the user guide must resolve to a real anchor.
for (const locale of SUPPORTED_LOCALES) {
  const faq = getFaqPageUiMessages(locale);
  for (const category of faq.categories) {
    for (const item of category.items) {
      for (const slug of item.related ?? []) {
        const href = resolveFaqRelatedHref(slug);
        if (href.startsWith("/guia#")) {
          check(
            `P0.3 [${locale}] FAQ item "${item.id}" related slug "${slug}" -> ${href} is a real anchor`,
            GUIA_ANCHOR_IDS.includes(href.split("#")[1]),
          );
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// P1 — Library section in /guia (the session's main focus)
// ---------------------------------------------------------------------------

const LIBRARY_BULLET_KEYS = [
  "libraryTabsBullet",
  "libraryCommentaryBullet",
  "libraryWenYenBullet",
  "librarySearchBullet",
  "libraryMutationsBullet",
  "libraryCommentaryScopeBullet",
];

for (const locale of SUPPORTED_LOCALES) {
  const g = getGuiaPageUiMessages(locale);
  check(
    `P1 [${locale}] libraryFeatureBody is non-empty`,
    typeof g.libraryFeatureBody === "string" && g.libraryFeatureBody.trim().length > 20,
  );
  for (const key of LIBRARY_BULLET_KEYS) {
    check(
      `P1 [${locale}] ${key} is non-empty`,
      typeof g[key] === "string" && g[key].trim().length > 10,
    );
  }
}

check(
  "P1 guia/page.tsx renders libraryFeatureBody",
  GUIA_PAGE_TSX.includes("g.libraryFeatureBody"),
);
for (const key of LIBRARY_BULLET_KEYS) {
  check(`P1 guia/page.tsx renders ${key}`, GUIA_PAGE_TSX.includes(`g.${key}`));
}
check(
  "P1 no new dedicated Library-commentary FAQ entry was added (per explicit instruction; the pre-existing zhouyi-no-commentary entry is expected and excluded)",
  !(() => {
    const faq = getFaqPageUiMessages("en");
    return faq.items.some(
      (i) => i.id.includes("commentary") && i.id !== "zhouyi-no-commentary",
    );
  })(),
);

// ---------------------------------------------------------------------------
// P2 — completeness
// ---------------------------------------------------------------------------

for (const locale of SUPPORTED_LOCALES) {
  const g = getGuiaPageUiMessages(locale);
  // "Master" is transliterated into the local script in ja/ko/ar/hi (マスター/
  // 마스터/ماستر/मास्टर), so checking the Latin word would false-negative on
  // those locales — "(3)" and the digit "2" are kept in Arabic numerals
  // everywhere, including those four, so they're the script-agnostic signal.
  // Arabic marks "two tokens" with a grammatical dual noun (رمزين) rather
  // than the digit 2 — correct, idiomatic Arabic, not a gap — so the digit
  // is checked where it is expected to appear (everywhere except ar) and
  // "(3)" alone (unique to this sentence) is the universal signal.
  check(
    `P2.1 [${locale}] tokensIntro mentions the Master (3) 2-token exception`,
    /\(3\)/.test(g.tokensIntro) && (locale === "ar" || /2/.test(g.tokensIntro)),
  );
  check(
    `P2.2 [${locale}] exportBody mentions the PDF carries translator/line-reading info`,
    /pdf/i.test(g.exportBody) &&
      /traduct|translat|tradutor|traduttor|übersetz|翻訳者|译本|번역|مترجم|अनुवाद/i.test(
        g.exportBody,
      ),
  );

  const tour = getHomeTourUiMessages(locale);
  check(
    `P2.4 [${locale}] tour step7Body mentions the classical commentary, not just "full interpretation"`,
    /coment|comment|kommentar|注釈|注释|주석|تعليق|टिप्पणी/i.test(tour.step7Body),
  );

  const audits = getAuditsPageUiMessages(locale);
  check(
    `P2.3 [${locale}] audits timeline has 12 verification entries`,
    audits.timeline.length === 12,
  );
  check(
    `P2.3 [${locale}] audits timeline is sorted newest first`,
    audits.timeline[0]?.id === "wilhelm-appendix-casting-2026-06-25",
  );
  check(
    `P2.3 [${locale}] audits timeline has zhouyi initial corruption-fix entry`,
    audits.timeline.some((entry) => entry.id === "zhouyi-ctext-initial-2026-06-21"),
  );
  check(
    `P2.3 [${locale}] audits oracle, divination, library commentary, and mutation sections are present`,
    audits.timeline.filter((e) => e.category === "oracle-text").length === 6 &&
      audits.timeline.filter((e) => e.category === "divination-method").length === 2 &&
      audits.timeline.filter((e) => e.category === "library-commentary").length === 2 &&
      audits.timeline.filter((e) => e.category === "mutation-rule").length === 2,
  );
  check(
    `P2.3 [${locale}] audits section headings are defined`,
    typeof audits.oracleTextSectionHeading === "string" &&
      audits.oracleTextSectionHeading.length > 0 &&
      typeof audits.divinationMethodSectionHeading === "string" &&
      audits.divinationMethodSectionHeading.length > 0 &&
      typeof audits.libraryCommentarySectionHeading === "string" &&
      audits.libraryCommentarySectionHeading.length > 0 &&
      typeof audits.mutationRulesSectionHeading === "string" &&
      audits.mutationRulesSectionHeading.length > 0 &&
      typeof audits.blockVerificationDateLabel === "string" &&
      audits.blockVerificationDateLabel.length > 0,
  );
  for (const entry of audits.timeline) {
    check(
      `P2.3 [${locale}] ${entry.id} has all six standard fields`,
      Boolean(
        entry.verificationDate?.trim() &&
          entry.source?.citation?.trim() &&
          entry.source.title?.trim() &&
          entry.source.rest?.trim() &&
          entry.method?.trim() &&
          entry.standardCompared?.trim() &&
          entry.result?.trim() &&
          entry.statusLabel?.trim() &&
          entry.currentStatusNote?.trim(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// P3 — i18n cleanup (pruned fields gone, bonesPractical integrated)
// ---------------------------------------------------------------------------

const PRUNED_KEYS = [
  "privacyDocsHeading", "privacyDocsIntro", "appUseHeading", "appUseIntro",
  "chatsHeading", "chatsLabel", "chatsOpensHistory", "newSessionLabel",
  "newSessionDesc", "chatsUnlimited", "packChangesLine", "libraryFeatureHeading",
  "ichingBullet", "bonesBulletSuffix", "threadDepthBullet", "translatorOptionsBullet",
  "ichingPracticalHeading", "ichingPracticalBody", "legalMetaBeforePrivacy",
  "legalMetaBetween", "legalMetaAfterTerms", "gettingStartedHeading", "promptLengthHint",
  "s2Heading", "s2TranslatorsTitle", "s2Translators", "s2TokensTitle", "s2Tokens",
  "s2SecurityTitle", "s2Security", "s5Heading", "s5AutoTitle", "s5Auto",
  "s5ManualTitle", "s5Manual",
];

const enGuia = getGuiaPageUiMessages("en");
for (const key of PRUNED_KEYS) {
  check(`P3 pruned field "${key}" is gone from GuiaPageUiMessages`, !(key in enGuia));
}
for (const locale of SUPPORTED_LOCALES) {
  const g = getGuiaPageUiMessages(locale);
  check(
    `P3 [${locale}] bonesPracticalHeading/Body kept (activated, not pruned)`,
    typeof g.bonesPracticalHeading === "string" &&
      g.bonesPracticalHeading.length > 0 &&
      typeof g.bonesPracticalBody === "string" &&
      g.bonesPracticalBody.length > 0,
  );
}
check(
  "P3 guia/page.tsx renders the new bonesPractical bullet",
  GUIA_PAGE_TSX.includes("g.bonesPracticalHeading") &&
    GUIA_PAGE_TSX.includes("g.bonesPracticalBody"),
);

// ---------------------------------------------------------------------------
// Hygiene — zero em/en dashes in every touched i18n file (no AI-tell punctuation)
// ---------------------------------------------------------------------------

const TOUCHED_FILES = [
  "packages/i18n/src/messages/guia-page-ui.ts",
  "packages/i18n/src/messages/home-tour-ui.ts",
  "packages/i18n/src/messages/faq-page-ui.ts",
  "packages/i18n/src/messages/audits-page-ui.ts",
  "packages/i18n/src/messages/doc-nav-ui.ts",
  "packages/i18n/src/messages/token-panel-ui.ts",
];
for (const rel of TOUCHED_FILES) {
  const text = readFileSync(join(ROOT, rel), "utf8");
  check(`Hygiene: zero em-dash (—) in ${rel}`, !text.includes("—"));
  check(`Hygiene: zero en-dash (–) in ${rel}`, !text.includes("–"));
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log(`Docs remediation verification: ${failures.length} checks failed.`);
if (failures.length > 0) {
  console.log("\nFAILURES:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("P0-P3 remediation verified complete: structure and content, all 11 locales.");
