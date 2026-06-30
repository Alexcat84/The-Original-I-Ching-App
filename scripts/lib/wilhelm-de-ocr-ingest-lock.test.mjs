/**
 * QA code: VF-FID-W-030 wilhelm-de-ocr-ingest-lock · v1.0.0
 * Area: scripts/lib/wilhelm-de-ocr-ingest-lock.mjs
 * Family: FID-W
 */
import { readFile } from "node:fs/promises";
import {
  assertWilhelmDeOcrIngestAllowed,
  isWilhelmDeOcrIngestUnlocked,
  WilhelmDeOcrIngestBlockedError,
  WILHELM_DE_OCR_INGEST_LOCK_PATH,
  WILHELM_DE_OCR_UNLOCK_FLAG,
  writeWilhelmDeOcrIngestLock,
} from "./wilhelm-de-ocr-ingest-lock.mjs";

let lockPresent = false;
try {
  await readFile(WILHELM_DE_OCR_INGEST_LOCK_PATH, "utf8");
  lockPresent = true;
} catch {
  await writeWilhelmDeOcrIngestLock({ reason: "test bootstrap" });
  lockPresent = true;
}

if (!isWilhelmDeOcrIngestUnlocked(["node", "test"])) {
  // ok
}

let blocked = false;
try {
  await assertWilhelmDeOcrIngestAllowed({
    script: "test-script",
    writes: "wilhelm-de-64hex-comments-merged.json",
    argv: ["node", "test"],
  });
} catch (e) {
  if (e instanceof WilhelmDeOcrIngestBlockedError) blocked = true;
  else throw e;
}

if (!blocked) {
  console.error("expected WilhelmDeOcrIngestBlockedError when lock present and no unlock");
  process.exit(1);
}

await assertWilhelmDeOcrIngestAllowed({
  script: "test-script",
  writes: "wilhelm-de-64hex-comments-merged.json",
  argv: ["node", "test", WILHELM_DE_OCR_UNLOCK_FLAG],
});

console.log("wilhelm-de-ocr-ingest-lock: PASS");
