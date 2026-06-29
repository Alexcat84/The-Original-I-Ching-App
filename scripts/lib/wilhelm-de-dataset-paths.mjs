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

export const WILHELM_DE_DATASETS_ROOT = join(ROOT, "tools/datasets/wilhelm-de");

export const WILHELM_DE_BOOK_ONE_DIR = join(WILHELM_DE_DATASETS_ROOT, "book-one");
export const WILHELM_DE_BOOK_ONE_PARSED = join(
  WILHELM_DE_BOOK_ONE_DIR,
  "wilhelm-de-64hex-parsed.json",
);
export const WILHELM_DE_BOOK_ONE_MERGED = join(
  WILHELM_DE_BOOK_ONE_DIR,
  "wilhelm-de-64hex-merged.json",
);
export const WILHELM_DE_BOOK_ONE_MANIFEST = join(
  WILHELM_DE_BOOK_ONE_DIR,
  "manifest.json",
);

export const WILHELM_DE_COMMENTS_DIR = join(WILHELM_DE_DATASETS_ROOT, "comments");
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
