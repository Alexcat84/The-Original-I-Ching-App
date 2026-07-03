/**
 * Canonical Wilhelm German 1924 (Diederichs) dataset locations.
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, statSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const W_GERMAN = join(ROOT, "tools/source-pdfs/W german");

export const WILHELM_DE_SOURCE_ROOT = W_GERMAN;

export const WILHELM_DE_PASS_DIRS = {
  bookOnePass01: join(W_GERMAN, "01"),
  bookOnePass03: join(W_GERMAN, "03"),
  bookThreePass02: join(W_GERMAN, "02"),
  bookThreePass04: join(W_GERMAN, "04"),
};

export const WILHELM_DE_STITCHED = {
  bookOnePass01: join(W_GERMAN, "wilhelm-de-erstes-buch-pass01.txt"),
  bookOnePass03: join(W_GERMAN, "wilhelm-de-erstes-buch-pass03.txt"),
  bookThreePass02: join(W_GERMAN, "wilhelm-de-drittes-buch-pass02.txt"),
  bookThreePass04: join(W_GERMAN, "wilhelm-de-drittes-buch-pass04.txt"),
};

export const WILHELM_DE_PDF_PATH = resolveWilhelmDePdfPath();

function resolveWilhelmDePdfPath() {
  const preferred = join(W_GERMAN, "I Ging_ Das Buch der Wandlungen.pdf");
  try {
    if (statSync(preferred).isFile()) return preferred;
  } catch {
    // fall through
  }
  try {
    const pdfs = readdirSync(W_GERMAN).filter((name) => name.toLowerCase().endsWith(".pdf"));
    const match = pdfs.find((name) => /I Ging.*Wandlungen/i.test(name));
    if (match) return join(W_GERMAN, match);
    if (pdfs.length === 1) return join(W_GERMAN, pdfs[0]);
  } catch {
    // missing folder
  }
  return preferred;
}

/** Canonical PD book — cite this in product/AU, not zeno.org. */
export const WILHELM_DE_PRIMARY_SOURCE = {
  citation:
    "Wilhelm, Richard (Übers.). I Ging. Das Buch der Wandlungen. Köln: Eugen Diederichs, 1924 (Erstausgabe).",
  apa7:
    "Wilhelm, R. (1924). I Ging: Das Buch der Wandlungen. Eugen Diederichs Verlag.",
  shortTitle: "Wilhelm DE 1924 Erstausgabe (Diederichs)",
  translator: "Richard Wilhelm",
  publisher: "Eugen Diederichs Verlag",
  place: "Köln",
  year: 1924,
  edition: "Erstausgabe",
  /** Product model: literal DE in blockquotes — same pattern as Zhou Yi 文言文. */
  displayPolicy: "literal-german-blockquote",
  /** Baynes EN is diagnostic only — not a fidelity target for this maestro. */
  fidelityBaseline: "wilhelm-de-1924-print",
};

/** HTML ingest mirror only — not the canonical citation. */
export const WILHELM_DE_ZENO_INGEST = {
  mirror: "http://www.zeno.org",
  zenoTreePath: "/Philosophie/M/Anonym/I+Ging+-+Buch+der+Wandlungen",
  zenoPermalinkRoot: "http://www.zeno.org/nid/20009134212",
  /** Zeno footer typo; resolves to 1924 via Erstausgabe TOC + book pagination (S. N). */
  zenoQuelleFieldTypo: "I Ging. Köln 141987",
  zenoLicenseClaim: "Gemeinfrei",
};

export const WILHELM_DE_DATASETS_ROOT = join(ROOT, "tools/datasets/wilhelm-de");

export const WILHELM_DE_OCR_INGEST_LOCK = join(
  WILHELM_DE_DATASETS_ROOT,
  "ocr-ingest.lock.json",
);

export const WILHELM_DE_BOOK_ONE_DIR = join(WILHELM_DE_DATASETS_ROOT, "book-one");
export const WILHELM_DE_BOOK_ONE_PARSED = join(
  WILHELM_DE_BOOK_ONE_DIR,
  "wilhelm-de-64hex-parsed.json",
);
export const WILHELM_DE_BOOK_ONE_MERGED = join(
  WILHELM_DE_BOOK_ONE_DIR,
  "wilhelm-de-64hex-merged.json",
);
export const WILHELM_DE_BOOK_ONE_BLANK = join(
  WILHELM_DE_BOOK_ONE_DIR,
  "wilhelm-de-64hex-blank.json",
);
export const WILHELM_DE_BOOK_ONE_ZENO_EXTRACT = join(
  WILHELM_DE_BOOK_ONE_DIR,
  "wilhelm-de-64hex-zeno-extract-latest.json",
);
export const WILHELM_DE_BOOK_ONE_PARSED_V2 = join(
  WILHELM_DE_BOOK_ONE_DIR,
  "wilhelm-de-64hex-parsed-v2.json",
);
export const WILHELM_DE_BOOK_ONE_MANIFEST = join(
  WILHELM_DE_BOOK_ONE_DIR,
  "manifest.json",
);

export const WILHELM_DE_ZENO_MATERIAL_JSON = join(
  WILHELM_DE_DATASETS_ROOT,
  "zeno",
  "wilhelm-de-zeno-material-latest.json",
);

export const WILHELM_DE_ZENO_MATERIAL_DIR = join(
  WILHELM_DE_DATASETS_ROOT,
  "zeno",
);

export const WILHELM_DE_COMMENTS_DIR = join(WILHELM_DE_DATASETS_ROOT, "comments");
export const WILHELM_DE_COMMENTS_BLANK = join(
  WILHELM_DE_COMMENTS_DIR,
  "wilhelm-de-64hex-comments-blank.json",
);
export const WILHELM_DE_COMMENTS_ZENO_EXTRACT = join(
  WILHELM_DE_COMMENTS_DIR,
  "wilhelm-de-64hex-comments-zeno-extract-latest.json",
);
export const WILHELM_DE_COMMENTS_PARSED = join(
  WILHELM_DE_COMMENTS_DIR,
  "wilhelm-de-64hex-comments-parsed.json",
);
export const WILHELM_DE_COMMENTS_MERGED = join(
  WILHELM_DE_COMMENTS_DIR,
  "wilhelm-de-64hex-comments-merged.json",
);
export const WILHELM_DE_COMMENTS_MANIFEST = join(
  WILHELM_DE_COMMENTS_DIR,
  "manifest.json",
);

/** Isolated Anna's Archive Drittes Buch sandbox — never runtimeIngest until AU promote. */
export const WILHELM_DE_COMMENTS_ANNA_DIR = join(
  WILHELM_DE_COMMENTS_DIR,
  "anna",
);
export const WILHELM_DE_COMMENTS_ANNA_PARSED_PASS02 = join(
  WILHELM_DE_COMMENTS_ANNA_DIR,
  "wilhelm-de-64hex-comments-anna-pass02.json",
);
export const WILHELM_DE_COMMENTS_ANNA_PARSED_PASS04 = join(
  WILHELM_DE_COMMENTS_ANNA_DIR,
  "wilhelm-de-64hex-comments-anna-pass04.json",
);
export const WILHELM_DE_COMMENTS_ANNA_MANIFEST = join(
  WILHELM_DE_COMMENTS_ANNA_DIR,
  "manifest.json",
);
export const WILHELM_DE_COMMENTS_ANNA_COVERAGE = join(
  WILHELM_DE_COMMENTS_ANNA_DIR,
  "coverage-latest.json",
);
export const WILHELM_DE_COMMENTS_ANNA_RECONCILED = join(
  WILHELM_DE_COMMENTS_ANNA_DIR,
  "wilhelm-de-64hex-comments-anna-reconciled.json",
);
export const WILHELM_DE_COMMENTS_ANNA_RECONCILE_REPORT = join(
  WILHELM_DE_COMMENTS_ANNA_DIR,
  "reconcile-report-latest.json",
);
export const WILHELM_DE_COMMENTS_ANNA_COMPARISON_HTML = join(
  WILHELM_DE_COMMENTS_ANNA_DIR,
  "comparison-viewer.html",
);
export const WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR = join(
  ROOT,
  "tools/manual-gold/wilhelm-de-comments-au",
);
export const WILHELM_DE_COMMENTS_ANNA_DISPUTES_FLAT_TSV = join(
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  "wilhelm-de-comments-anna-disputes-flat-latest.tsv",
);
export const WILHELM_DE_COMMENTS_ANNA_DISPUTES_BY_HEX_DIR = join(
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  "by-hex",
);
export const WILHELM_DE_COMMENTS_AU_CONTRACT_JSON = join(
  WILHELM_DE_COMMENTS_ANNA_AU_GOLD_DIR,
  "au-contract.json",
);
export const WILHELM_DE_COMMENTS_AU_GOLD_JSON = join(
  ROOT,
  "tools/output/fidelity-gold/wilhelm-de-64hex-comments-au-gold.json",
);
export const WILHELM_DE_COMMENTS_HEX_STARTS_JSON = join(
  WILHELM_DE_DATASETS_ROOT,
  "wilhelm-de-comments-hex-starts.json",
);
export const WILHELM_DE_BOOK_SECTION_STARTS_JSON = join(
  WILHELM_DE_DATASETS_ROOT,
  "wilhelm-de-book-section-starts.json",
);

export const WILHELM_DE_APPENDIX_DIR = join(WILHELM_DE_DATASETS_ROOT, "appendix");
export const WILHELM_DE_APPENDIX_PARSED = join(
  WILHELM_DE_APPENDIX_DIR,
  "wilhelm-de-appendix-parsed.json",
);
export const WILHELM_DE_APPENDIX_MANIFEST = join(
  WILHELM_DE_APPENDIX_DIR,
  "manifest.json",
);

export const WILHELM_DE_PDF_GOLD_JSON = join(
  ROOT,
  "tools/output/fidelity-gold/wilhelm-de-pdf-gold.json",
);

export const WILHELM_BAYNES_ARCHIVE_BUNDLE = join(
  ROOT,
  "tools/output/archive/hexagrams.wilhelm.baynes-2026.json",
);

export const WILHELM_BAYNES_BOOK_ONE_PARSED = join(
  ROOT,
  "tools/datasets/wilhelm-baynes/book-one/wilhelm-64hex-parsed.json",
);
