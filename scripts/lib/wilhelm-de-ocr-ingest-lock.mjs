/**
 * Block accidental OCR parse/merge from overwriting Zeno-only Wilhelm DE maestros.
 *
 * Unlock (intentional forensic re-run only):
 *   WILHELM_DE_ALLOW_OCR_INGEST=1 npm run merge:wilhelm-de-comments-dual-pass
 *   npm run merge:wilhelm-de-comments-dual-pass -- --allow-ocr-ingest
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { WILHELM_DE_DATASETS_ROOT, WILHELM_DE_OCR_INGEST_LOCK } from "./wilhelm-de-dataset-paths.mjs";

export const WILHELM_DE_OCR_INGEST_LOCK_PATH = WILHELM_DE_OCR_INGEST_LOCK;

export const WILHELM_DE_OCR_UNLOCK_ENV = "WILHELM_DE_ALLOW_OCR_INGEST";
export const WILHELM_DE_OCR_UNLOCK_FLAG = "--allow-ocr-ingest";

/**
 * @param {string[] | undefined} argv
 */
export function isWilhelmDeOcrIngestUnlocked(argv = process.argv) {
  return (
    process.env[WILHELM_DE_OCR_UNLOCK_ENV] === "1" ||
    (argv ?? process.argv).includes(WILHELM_DE_OCR_UNLOCK_FLAG)
  );
}

/**
 * @returns {Promise<{ blocked: boolean; reason?: string; since?: string; unlock?: string } | null>}
 */
export async function readWilhelmDeOcrIngestLock() {
  try {
    return JSON.parse(await readFile(WILHELM_DE_OCR_INGEST_LOCK_PATH, "utf8"));
  } catch {
    return null;
  }
}

export class WilhelmDeOcrIngestBlockedError extends Error {
  /**
   * @param {string} scriptName
   * @param {{ reason?: string; since?: string; unlock?: string }} lock
   * @param {string} writes
   */
  constructor(scriptName, lock, writes) {
    super(
      [
        `Wilhelm DE OCR ingest blocked: ${scriptName}`,
        `Would write: ${writes}`,
        lock.reason ?? "ocr-ingest.lock.json has blocked=true",
        `Lock since: ${lock.since ?? "unknown"}`,
        `To override (forensic only): ${WILHELM_DE_OCR_UNLOCK_ENV}=1 or ${WILHELM_DE_OCR_UNLOCK_FLAG}`,
        lock.unlock ?? "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    this.name = "WilhelmDeOcrIngestBlockedError";
  }
}

/**
 * @param {{ script: string; writes: string; argv?: string[] }} input
 */
export async function assertWilhelmDeOcrIngestAllowed(input) {
  if (isWilhelmDeOcrIngestUnlocked(input.argv)) {
    console.warn(
      `WARNING: ${input.script} running with OCR ingest unlock — do not promote output to runtime without AU.`,
    );
    return;
  }
  const lock = await readWilhelmDeOcrIngestLock();
  if (lock?.blocked) {
    throw new WilhelmDeOcrIngestBlockedError(input.script, lock, input.writes);
  }
}

/**
 * @param {{ reason?: string }} [options]
 */
export async function writeWilhelmDeOcrIngestLock(options = {}) {
  const payload = {
    blocked: true,
    since: new Date().toISOString(),
    reason:
      options.reason ??
      "Runtime maestro is Zeno-only book-one; comments Ten Wings scaffold empty until Drittes Buch extract.",
    blockedScripts: [
      "parse:wilhelm-de-64hex-txt",
      "parse:wilhelm-de-64hex-comments-txt",
      "merge:wilhelm-de-dual-pass",
      "merge:wilhelm-de-comments-dual-pass",
    ],
    unlock: `Set ${WILHELM_DE_OCR_UNLOCK_ENV}=1 or pass ${WILHELM_DE_OCR_UNLOCK_FLAG}`,
    safeScripts: [
      "extract:wilhelm-de-from-zeno:all",
      "promote:wilhelm-de-zeno-to-merged",
    "clean:wilhelm-de-zeno-dataset",
    "extract:wilhelm-de-comments-from-anna",
    "extract:wilhelm-de-comments-from-anna:pass02",
    "extract:wilhelm-de-comments-from-anna:pass04",
    "validate:wilhelm-de-comments-anna-gate",
    "reconcile:wilhelm-de-comments-from-anna",
    "export:wilhelm-de-comments-anna-comparison-viewer",
    "export:wilhelm-de-comments-anna-au-tsv",
  ],
  };
  await mkdir(WILHELM_DE_DATASETS_ROOT, { recursive: true });
  await writeFile(WILHELM_DE_OCR_INGEST_LOCK_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}
