/**
 * Canonical Legge SBE XVI TXT dataset locations.
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LEGGE_64HEX_TXT_PATH,
  LEGGE_APPENDIX_TXT_PATH,
} from "./legge-txt-clean.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

export const LEGGE_DATASETS_ROOT = join(ROOT, "tools/datasets/legge");

/** @type {const} */
export const LEGGE_DATASET_STATUS = {
  OFFICIAL: "official",
  DRAFT: "draft",
};

export const LEGGE_BOOK_ONE_DATASET_DIR = join(LEGGE_DATASETS_ROOT, "book-one");
export const LEGGE_BOOK_ONE_PARSED_JSON = join(
  LEGGE_BOOK_ONE_DATASET_DIR,
  "legge-64hex-parsed.json",
);
export const LEGGE_BOOK_ONE_MANIFEST_JSON = join(
  LEGGE_BOOK_ONE_DATASET_DIR,
  "manifest.json",
);

export const LEGGE_APPENDIX_DATASET_DIR = join(LEGGE_DATASETS_ROOT, "appendix");
export const LEGGE_APPENDIX_PARSED_JSON = join(
  LEGGE_APPENDIX_DATASET_DIR,
  "legge-appendix-parsed.json",
);
export const LEGGE_APPENDIX_MANIFEST_JSON = join(
  LEGGE_APPENDIX_DATASET_DIR,
  "manifest.json",
);

export { LEGGE_64HEX_TXT_PATH, LEGGE_APPENDIX_TXT_PATH };
