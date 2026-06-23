/**
 * Canonical Wilhelm Princeton TXT dataset locations.
 *
 * - comments/  → official (Ten Wings); ready for future ingest, not runtime yet
 * - book-one/  → draft until manual G2 audit on primary oracle TXT
 * - appendix/  → draft; separate from hex commentaries
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WILHELM_64HEX_TXT_PATH,
  WILHELM_64HEX_COMMENTS_TXT_PATH,
  WILHELM_APPENDIX_TXT_PATH,
} from "./wilhelm-txt-clean.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const WILHELM_DATASETS_ROOT = join(ROOT, "tools/datasets/wilhelm");

/** @type {const} */
export const WILHELM_DATASET_STATUS = {
  OFFICIAL: "official",
  DRAFT: "draft",
};

export const WILHELM_COMMENTS_DATASET_DIR = join(
  WILHELM_DATASETS_ROOT,
  "comments",
);
export const WILHELM_COMMENTS_PARSED_JSON = join(
  WILHELM_COMMENTS_DATASET_DIR,
  "wilhelm-64hex-comments-parsed.json",
);
export const WILHELM_COMMENTS_MANIFEST_JSON = join(
  WILHELM_COMMENTS_DATASET_DIR,
  "manifest.json",
);

export const WILHELM_BOOK_ONE_DATASET_DIR = join(
  WILHELM_DATASETS_ROOT,
  "book-one",
);
export const WILHELM_BOOK_ONE_PARSED_JSON = join(
  WILHELM_BOOK_ONE_DATASET_DIR,
  "wilhelm-64hex-parsed.json",
);
export const WILHELM_BOOK_ONE_MANIFEST_JSON = join(
  WILHELM_BOOK_ONE_DATASET_DIR,
  "manifest.json",
);

export const WILHELM_APPENDIX_DATASET_DIR = join(
  WILHELM_DATASETS_ROOT,
  "appendix",
);
export const WILHELM_APPENDIX_PARSED_JSON = join(
  WILHELM_APPENDIX_DATASET_DIR,
  "wilhelm-appendix-parsed.json",
);
export const WILHELM_APPENDIX_MANIFEST_JSON = join(
  WILHELM_APPENDIX_DATASET_DIR,
  "manifest.json",
);

export {
  WILHELM_64HEX_TXT_PATH,
  WILHELM_64HEX_COMMENTS_TXT_PATH,
  WILHELM_APPENDIX_TXT_PATH,
};
