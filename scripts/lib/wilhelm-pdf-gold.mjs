/**
 * Load Wilhelm/Baynes Pantheon 1950 PDF gold (book-primary injector source).
 */
import { loadWilhelmPdfFullText } from "./pdf-text-extract.mjs";
import { parseAllWilhelmPdfOrThrow } from "./hexagram-fidelity-wilhelm-pdf.mjs";
import { applyWilhelmPdfPrintVerified } from "./hexagram-fidelity-wilhelm-pdf-verified.mjs";
import { applyWilhelmBaynesSupplements } from "./hexagram-fidelity-wilhelm-baynes-supplement.mjs";
import { applyWilhelmParmaStatementTrim } from "./hexagram-fidelity-wilhelm-parma-crosscheck.mjs";
import { loadParmaHtml } from "./hexagram-fidelity-fetch.mjs";
import { parseAllParmaWilhelm } from "./hexagram-fidelity-parma.mjs";

/** @type {Promise<Record<number, object>> | null} */
let parmaGoldCache = null;

async function loadParmaGoldForTrim() {
  if (!parmaGoldCache) {
    const html = await loadParmaHtml({ live: false });
    parmaGoldCache = applyWilhelmBaynesSupplements(parseAllParmaWilhelm(html));
  }
  return parmaGoldCache;
}

/**
 * @param {{ force?: boolean }} [opts]
 */
export async function loadWilhelmPdfGoldOrThrow(opts = {}) {
  const pdfText = await loadWilhelmPdfFullText({ force: opts.force === true });
  let gold = parseAllWilhelmPdfOrThrow(pdfText);
  gold = applyWilhelmPdfPrintVerified(gold);
  gold = applyWilhelmParmaStatementTrim(gold, await loadParmaGoldForTrim());
  gold = applyWilhelmBaynesSupplements(gold);
  return gold;
}
