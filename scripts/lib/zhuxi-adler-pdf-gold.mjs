/**
 * Tier-0 gold for Zhu Xi changing-line rules — Joseph Adler trans. of Yixue Qimeng ch. IV.
 */
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { GOLD_DIR } from "./hexagram-fidelity-fetch.mjs";
import { resolvePdfPath } from "./pdf-gold-paths.mjs";

export const ZHUXI_ADLER_CORE_CACHE = join(GOLD_DIR, "zhuxi-adler-ch4-core-p150-158.txt");
export const ZHUXI_ADLER_NOTES_CACHE = join(GOLD_DIR, "zhuxi-adler-ch4-notes-p205-215.txt");
export const ZHUXI_ADLER_GOLD_PATH = join(GOLD_DIR, "zhuxi-adler-mutation-rules-gold.json");

/** Calibrated Adler bilingual edition (Introduction to the Study of the Classic of Change). */
export const ZHUXI_ADLER_PAGE_MAP = {
  chapter: "IV. Examining the Prognostications of the Changes",
  chapterZh: "占筮",
  /** Printed folio → PDF page index (pdftotext -f/-l). */
  printedToPdf: {
    48: 150,
    49: 152,
    50: 154,
    51: 156,
    52: 158,
    53: 160,
    54: 205,
    74: 215,
  },
  corePdfRange: [150, 158],
  figuresPdfRange: [159, 204],
  notesPdfRange: [205, 215],
  notesPrintedRange: [64, 74],
  calibrationNote:
    "Printed page 48 maps to PDF 150 in this scan (not PDF 113, which is ch. III milfoil). " +
    "English + Chinese alternate on the same folio number. Notes for ch. IV footnotes 128–150 " +
    "appear in PDF 205–215 (printed ~64–74).",
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
    .replace(/\d+[™℠]/g, (m) => `${parseInt(m, 10)}`)
    .replace(/\s+/g, " ")
    .trim();
}

/** Canonical rule statements (English) verified against PDF extract 2026-06-20. */
export function buildZhuxiAdlerMutationRulesGold() {
  return [
    {
      id: "qian_kun_all_changing_preamble",
      changingCount: 6,
      specialHexagrams: [1, 2],
      systemCode: "QIAN_ALL_NINE|KUN_ALL_SIX",
      printedPage: 48,
      pdfPage: 150,
      bookText:
        "When we get Ch'ien with all six lines as 9 [in divination], or K'un with all six lines as 6, " +
        "we then use this as the prognostication. Thus \"a flight of dragons without heads\" is the image " +
        "of yang completely changing to yin. \"It is beneficial to be eternally steady\" is the meaning of " +
        "yin completely changing to yang.",
      readsFrom: "primary",
      textTypes: ["yongJiu", "yongLiu"],
      rulerNote: "用九 / 用六 appended texts for pure yang / pure yin hexagrams.",
      systemMatch: "exact",
      systemMatchNote:
        "Engine delivers 用九/用六 plus both hexagram judgments (readBothJudgments) per footnote 148.",
    },
    {
      id: "zero_unchanging",
      changingCount: 0,
      systemCode: "ZX_ZERO",
      printedPage: 49,
      pdfPage: 152,
      bookText:
        "Any hexagram may have all unchanging lines. In that case we prognosticate on the basis of the " +
        "original hexagram's T'uan statement, taking the inner hexagram as chen [the question, or present situation] " +
        "and the outer hexagram as hui [the prognostication].",
      readsFrom: "primary",
      textTypes: ["judgment"],
      rulerNote: null,
      systemMatch: "exact",
    },
    {
      id: "one_changing",
      changingCount: 1,
      systemCode: "ZX_ONE",
      printedPage: 50,
      pdfPage: 154,
      bookText:
        "When only one line changes, we take the statement of the original hexagram's changing line as the prognostication.",
      readsFrom: "primary",
      textTypes: ["line"],
      rulerNote: "Single changing line governs.",
      systemMatch: "exact",
    },
    {
      id: "two_changing",
      changingCount: 2,
      systemCode: "ZX_TWO_UPPER",
      printedPage: 50,
      pdfPage: 154,
      bookText:
        "When two lines change, we take the statements of the two changing lines of the original hexagram as the " +
        "prognostication, but we take the upper line [of the two] as ruler.",
      readsFrom: "primary",
      textTypes: ["line", "line"],
      rulerNote: "Upper of the two changing lines is chu (ruler). Footnote 141.",
      extrapolated: true,
      extrapolationNote:
        "Ts'ai Yuan-ting: 'In the Classic and the Appendices there is no [such] passage. Extrapolating from what is present yields this.'",
      systemMatch: "exact",
    },
    {
      id: "three_changing",
      changingCount: 3,
      systemCode: "ZX_THREE_JUDGMENTS",
      printedPage: 50,
      pdfPage: 154,
      bookText:
        "When three lines change, the prognostication is the T'uan statement of the original hexagram and the " +
        "resulting hexagram, and we use the original hexagram as chen and the resulting hexagram as hui. " +
        "In the first ten hexagrams [of this sort] we make chen the ruler; in the latter ten hexagrams we make hui the ruler.",
      readsFrom: "primary+transformed",
      textTypes: ["judgment", "judgment"],
      rulerNote: "20 three-changing cases; 32 charts (Fig. 19) refine which hexagram's lines apply.",
      systemMatch: "equivalent",
      systemMatchNote:
        "Book uses first-ten / latter-ten of 20 chart cases; engine uses bottom-line (pos 1) operational rule — documented equivalent per Adler ch. IV audit.",
    },
    {
      id: "four_changing",
      changingCount: 4,
      systemCode: "ZX_FOUR_LOWER",
      printedPage: 51,
      pdfPage: 156,
      bookText:
        "When four lines change, we use the two unchanging lines in the resulting hexagram as the prognostication. " +
        "But we take the lower line as ruler.",
      readsFrom: "transformed",
      textTypes: ["line", "line"],
      rulerNote: "Lower of the two stable lines in the transformed hexagram is chu.",
      extrapolated: true,
      extrapolationNote:
        "Ts'ai Yuan-ting: 'The Classic and the Appendices do not contain this line either. Extrapolating from what is present yields this.'",
      systemMatch: "exact",
    },
    {
      id: "five_changing",
      changingCount: 5,
      systemCode: "ZX_FIVE_ONLY",
      printedPage: 51,
      pdfPage: 156,
      bookText:
        "When five lines change, we use the unchanging line of the resulting hexagram as the prognostication.",
      readsFrom: "transformed",
      textTypes: ["line"],
      rulerNote: "Mu Chiang / Gen→Sui example (footnote 144–145): stable line 2 of Sui is correct, not Sui judgment.",
      systemMatch: "exact",
    },
    {
      id: "six_changing_qian_kun",
      changingCount: 6,
      specialHexagrams: [1, 2],
      systemCode: "QIAN_ALL_NINE|KUN_ALL_SIX",
      printedPage: 52,
      pdfPage: 158,
      bookText:
        "When six lines change, in the cases of Ch'ien and K'un, the prognostications of both are used.",
      readsFrom: "primary+transformed",
      textTypes: ["judgment", "judgment", "yongJiu|yongLiu"],
      rulerNote: "Ts'ai Mo example: Qian→Kun interrelates both statements (footnotes 146–148).",
      systemMatch: "exact",
      systemMatchNote: "Engine readBothJudgments + 用九/用六 per footnotes 128 and 148.",
    },
    {
      id: "six_changing_other",
      changingCount: 6,
      systemCode: "ZX_SIX_TRANSFORMED",
      printedPage: 52,
      pdfPage: 158,
      bookText:
        "For other hexagrams, the prognostication is the T'uan statement of the resulting hexagram.",
      readsFrom: "transformed",
      textTypes: ["judgment"],
      rulerNote: null,
      systemMatch: "exact",
    },
    {
      id: "thirty_two_charts",
      changingCount: null,
      systemCode: "ZX_THREE_JUDGMENTS|ZX_FOUR_LOWER|ZX_FIVE_ONLY",
      printedPage: 52,
      pdfPage: 158,
      bookText:
        "The changes in the hexagrams up through the 32 use the lines of the original hexagram as prognostication. " +
        "The changes of the hexagrams after the 32 use the lines of the changed hexagram as prognostication.",
      readsFrom: "chart-dependent",
      textTypes: ["line"],
      rulerNote: "4096 combinations arranged in 32 charts (Fig. 19); reversed yields 64 charts.",
      systemMatch: "not_implemented",
      systemMatchNote:
        "32-chart line-source rule applies to 3/4/5 changing cases in full classical practice; engine uses count-based rules without chart lookup.",
    },
  ];
}

/** Footnotes 128–150 (chapter IV notes, Adler pp. 71–74 / PDF 205–215). */
export function buildZhuxiAdlerFootnotesGold() {
  return {
    128: {
      printedPage: 71,
      topic: "用九/用六 Image appendix",
      text:
        "Hexagram for Chien. \"Using 9s\" and \"using 6s\" refers to the Ch'ien and K'un hexagrams, respectively, " +
        "obtained with all six lines changing (mature). The \"Image\" (Hsiang) is one of the Ten Wings that comments on the symbolism of the component trigrams.",
    },
    131: {
      printedPage: 72,
      topic: "Line naming 9/6 in any hexagram",
      text:
        "This applies to all the hexagrams. So, for example, a yin line in the second place (counting from the bottom) " +
        "is called \"6 in the second place,\" and a yang line in the fourth place is called \"9 in the fourth place,\" etc.",
    },
    141: {
      printedPage: 73,
      topic: "Two changing lines — ruler (chu)",
      text: "The ruler (chu) is the governing, or dominant, line of the hexagram.",
    },
    144: {
      printedPage: 73,
      topic: "Five changing — Gen→Sui example",
      text:
        "Tso chuan, Duke Hsiang, 9th year. Thus five lines all changed [all but the second]. Only the second yielded 8, which is why it was unchanging.",
    },
    145: {
      printedPage: 73,
      topic: "Five changing — diviner error",
      text:
        "Mu Chiang had been confined to the Eastern Palace… The proper method is to take line 2 of Sui… " +
        "But the diviner mistakenly indicated the T'uan statement of Sui in his response. So he was wrong.",
    },
    148: {
      printedPage: 73,
      topic: "Six changing Qian/Kun — both judgments",
      text:
        "The point here is that with six lines changing, both hexagram statements and their interrelationships " +
        "should be interpreted as the prognostication. Neither Chu nor Ts'ai Yuan-ting say why the line text for " +
        "\"all nines\" or \"all sixes\" should not be used.",
    },
    149: {
      printedPage: 74,
      topic: "4096 combinations citation",
      text: "Hsi-tz'u A.9.8.",
    },
  };
}

/**
 * @param {{ force?: boolean }} [opts]
 */
export async function loadZhuxiAdlerPdfExtracts(opts = {}) {
  await mkdir(GOLD_DIR, { recursive: true });
  const { abs, entry } = await resolvePdfPath("zhuxi-adler");
  const [coreFrom, coreTo] = ZHUXI_ADLER_PAGE_MAP.corePdfRange;
  const [notesFrom, notesTo] = ZHUXI_ADLER_PAGE_MAP.notesPdfRange;

  let coreText;
  let notesText;
  if (!opts.force) {
    try {
      const [cSt, nSt] = await Promise.all([stat(ZHUXI_ADLER_CORE_CACHE), stat(ZHUXI_ADLER_NOTES_CACHE)]);
      if (cSt.size > 500 && nSt.size > 500) {
        coreText = await readFile(ZHUXI_ADLER_CORE_CACHE, "utf8");
        notesText = await readFile(ZHUXI_ADLER_NOTES_CACHE, "utf8");
        return { abs, entry, coreText, notesText };
      }
    } catch {
      /* cache miss */
    }
  }

  coreText = pdftotextPages(abs, coreFrom, coreTo);
  notesText = pdftotextPages(abs, notesFrom, notesTo);
  await writeFile(ZHUXI_ADLER_CORE_CACHE, coreText, "utf8");
  await writeFile(ZHUXI_ADLER_NOTES_CACHE, notesText, "utf8");
  return { abs, entry, coreText, notesText };
}

/** Verify each gold rule's bookText appears (normalized) in the core extract. */
export function verifyRulesAgainstExtract(rules, coreText) {
  const normCore = normalizeExtract(coreText);
  return rules.map((rule) => {
    const needle = normalizeExtract(rule.bookText.slice(0, 80));
    const found = normCore.includes(needle);
    return { id: rule.id, found, systemMatch: rule.systemMatch };
  });
}

/**
 * @param {{ force?: boolean }} [opts]
 */
export async function buildZhuxiAdlerGoldPayload(opts = {}) {
  const { abs, entry, coreText, notesText } = await loadZhuxiAdlerPdfExtracts(opts);
  const rules = buildZhuxiAdlerMutationRulesGold();
  const footnotes = buildZhuxiAdlerFootnotesGold();
  const extractChecks = verifyRulesAgainstExtract(rules, coreText);

  return {
    source:
      "Zhu Xi (1130–1200), Yixue Qimeng (易學啟蒙, 1186), ch. IV — Joseph Adler trans., " +
      "Introduction to the Study of the Classic of Change (Bilingual Texts in Chinese History)",
    file: entry.file,
    role: "Tier-0 gold for changing-line / mutation rules (Huang | Zhu Xi dual selector)",
    extractedAt: new Date().toISOString(),
    pdfPath: abs,
    pageMapping: ZHUXI_ADLER_PAGE_MAP,
    rules,
    footnotes,
    extractChecks,
    rawExtractPaths: {
      core: ZHUXI_ADLER_CORE_CACHE,
      notes: ZHUXI_ADLER_NOTES_CACHE,
    },
    notesExtractSample: notesText.slice(0, 500),
  };
}

export async function loadZhuxiAdlerGoldOrThrow() {
  const raw = await readFile(ZHUXI_ADLER_GOLD_PATH, "utf8");
  return JSON.parse(raw);
}

export async function writeZhuxiAdlerGold(opts = {}) {
  await mkdir(dirname(ZHUXI_ADLER_GOLD_PATH), { recursive: true });
  const payload = await buildZhuxiAdlerGoldPayload(opts);
  await writeFile(ZHUXI_ADLER_GOLD_PATH, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}
