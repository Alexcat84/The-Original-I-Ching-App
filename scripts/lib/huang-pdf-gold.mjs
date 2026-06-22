/**
 * Tier-0 gold for Alfred Huang changing-line reduction rules.
 * Source: The Complete I Ching — 10th Anniversary Edition (2010), "Gaining Insight from the Oracle".
 */
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { GOLD_DIR } from "./hexagram-fidelity-fetch.mjs";
import { resolvePdfPath } from "./pdf-gold-paths.mjs";

export const HUANG_MUTATION_CORE_CACHE = join(GOLD_DIR, "huang-mutation-rules-p48-55.txt");
export const HUANG_GOLD_PATH = join(GOLD_DIR, "huang-mutation-rules-gold.json");

/** PDF page indices (pdftotext -f/-l) for Master Yin's reduction method. */
export const HUANG_PAGE_MAP = {
  section: "Gaining Insight from the Oracle — multiple moving lines (Master Yin method)",
  corePdfRange: [48, 55],
  rulesPdfPage: 51,
  qianAllNinesCrossRefPdfPage: 62,
  calibrationNote:
    "Rules 1–7 appear in the 'Gaining Insight from the Oracle' section (PDF ~48–55). " +
    "Qian/Kun All Nines / All Sixes seventh-yao commentary cross-referenced in hexagram chapters.",
};

function pdftotextPages(pdfPath, from, to) {
  const args = ["-layout", "-f", String(from), "-l", String(to), pdfPath, "-"];
  const r = spawnSync("pdftotext", args, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(r.stderr?.trim() || `pdftotext failed (${r.status})`);
  }
  return r.stdout ?? "";
}

function normalizeExtract(text) {
  return text
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
    .replace(/\u2014/g, "—")
    .replace(/\u00a0/g, " ")
    .replace(/[\u00ad\u200b]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Canonical Huang reduction rules verified against PDF extract 2026-06-22. */
export function buildHuangMutationRulesGold() {
  return [
    {
      id: "zero_unchanging",
      changingCount: 0,
      systemCode: "NO_CHANGING",
      pdfPage: 51,
      bookText:
        "When there is no moving line, you need only consult the name, symbol, and decision of the gua.",
      readsFrom: "primary",
      textTypes: ["judgment"],
      systemMatch: "exact",
    },
    {
      id: "one_changing",
      changingCount: 1,
      systemCode: "ONE_CHANGING",
      pdfPage: 51,
      bookText:
        "When you have exactly one moving line, you should pay special attention to the Yao Text for this line, " +
        "and then you should consult the approached gua, the new hexagram that will result when the moving line changes",
      readsFrom: "primary+transformed",
      textTypes: ["line", "judgment"],
      systemMatch: "exact",
      systemMatchNote: "Engine selects one primary line; transformed judgment included in cast texts per standard flow.",
    },
    {
      id: "two_yin_yang",
      changingCount: 2,
      variant: "yin+yang",
      systemCode: "TWO_YIN_YANG",
      pdfPage: 51,
      bookText:
        "If there are two moving lines—one yin and the other yang—consult only the yin moving line.",
      readsFrom: "primary",
      textTypes: ["line"],
      systemMatch: "exact",
    },
    {
      id: "two_same_lower",
      changingCount: 2,
      variant: "both yin or both yang",
      systemCode: "TWO_SAME_LOWER",
      pdfPage: 51,
      bookText: "If the two moving lines are both yin or both yang, consult the lower one.",
      readsFrom: "primary",
      textTypes: ["line"],
      systemMatch: "exact",
    },
    {
      id: "three_middle",
      changingCount: 3,
      systemCode: "THREE_MIDDLE",
      pdfPage: 51,
      bookText: "If there are three moving lines, consult only the middle one.",
      readsFrom: "primary",
      textTypes: ["line"],
      systemMatch: "exact",
    },
    {
      id: "four_upper_stable",
      changingCount: 4,
      systemCode: "FOUR_LOWEST_STABLE",
      pdfPage: 51,
      bookText:
        "If there are four moving lines, consult only the upper of the two nonmoving lines.",
      readsFrom: "transformed",
      textTypes: ["line"],
      systemMatch: "exact",
      systemMatchNote:
        "Stable positions are identical on primary and transformed; engine reads upper stable from transformed hexagram (code name FOUR_LOWEST_STABLE is historical).",
    },
    {
      id: "five_only_stable",
      changingCount: 5,
      systemCode: "FIVE_ONLY_STABLE",
      pdfPage: 51,
      bookText: "If there are five moving lines, consult only the other, nonmoving line.",
      readsFrom: "transformed",
      textTypes: ["line"],
      systemMatch: "exact",
    },
    {
      id: "six_all_transformed",
      changingCount: 6,
      specialHexagrams: null,
      systemCode: "SIX_ALL_CHANGING",
      pdfPage: 51,
      bookText:
        "If six lines are all moving, consult the Decision of the new gua, the approached gua.",
      readsFrom: "transformed",
      textTypes: ["judgment"],
      systemMatch: "exact",
    },
    {
      id: "qian_kun_all_nines_sixes",
      changingCount: 6,
      specialHexagrams: [1, 2],
      systemCode: "QIAN_ALL_NINE|KUN_ALL_SIX",
      pdfPage: 51,
      bookText:
        "Since there is a seventh invisible line in the first and second gua, Qian and Kun, for these gua consult " +
        "the seventh Yao Text, called All Nines or All Sixes.",
      readsFrom: "primary",
      textTypes: ["specialYaoText"],
      systemMatch: "equivalent",
      systemMatchNote:
        "Engine delivers 用九/用六 via specialYaoText. Huang's Qian/Kun chapter also instructs reading the approached gua's Decision; " +
        "transformed judgment is present in cast texts but Huang prompt path does NOT use readBothJudgments (Zhu Xi path does). " +
        "Strict Huang dual-judgment synthesis would require a planned prompt change — not implemented here.",
      engineChangeRequired: false,
    },
  ];
}

export function verifyRulesAgainstExtract(rules, coreText) {
  const normCore = normalizeExtract(coreText);
  return rules.map((rule) => {
    const needle = normalizeExtract(rule.bookText.slice(0, 72));
    const found = normCore.includes(needle);
    return { id: rule.id, found, systemMatch: rule.systemMatch };
  });
}

export async function loadHuangPdfExtract(opts = {}) {
  await mkdir(GOLD_DIR, { recursive: true });
  const { abs, entry } = await resolvePdfPath("huang");
  const [from, to] = HUANG_PAGE_MAP.corePdfRange;

  if (!opts.force) {
    try {
      const st = await stat(HUANG_MUTATION_CORE_CACHE);
      if (st.size > 500) {
        const coreText = await readFile(HUANG_MUTATION_CORE_CACHE, "utf8");
        return { abs, entry, coreText };
      }
    } catch {
      /* cache miss */
    }
  }

  const coreText = pdftotextPages(abs, from, to);
  await writeFile(HUANG_MUTATION_CORE_CACHE, coreText, "utf8");
  return { abs, entry, coreText };
}

export async function buildHuangGoldPayload(opts = {}) {
  const { abs, entry, coreText } = await loadHuangPdfExtract(opts);
  const rules = buildHuangMutationRulesGold();
  const extractChecks = verifyRulesAgainstExtract(rules, coreText);

  return {
    source:
      "Taoist Master Alfred Huang, The Complete I Ching — 10th Anniversary Edition (2010), " +
      "Master Yin reduction method",
    file: entry.file,
    role: "Tier-0 gold for Huang changing-line reduction rules (default line-reading system)",
    extractedAt: new Date().toISOString(),
    pdfPath: abs,
    pageMapping: HUANG_PAGE_MAP,
    rules,
    extractChecks,
    rawExtractPath: HUANG_MUTATION_CORE_CACHE,
    engineCodes: [
      "NO_CHANGING",
      "ONE_CHANGING",
      "TWO_YIN_YANG",
      "TWO_SAME_LOWER",
      "THREE_MIDDLE",
      "FOUR_LOWEST_STABLE",
      "FIVE_ONLY_STABLE",
      "SIX_ALL_CHANGING",
      "QIAN_ALL_NINE",
      "KUN_ALL_SIX",
    ],
  };
}

export async function loadHuangGoldOrThrow() {
  const raw = await readFile(HUANG_GOLD_PATH, "utf8");
  return JSON.parse(raw);
}

export async function writeHuangGold(opts = {}) {
  await mkdir(dirname(HUANG_GOLD_PATH), { recursive: true });
  const payload = await buildHuangGoldPayload(opts);
  await writeFile(HUANG_GOLD_PATH, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}
