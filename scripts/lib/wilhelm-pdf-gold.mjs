/**
 * Load Wilhelm/Baynes Pantheon 1950 PDF gold (book-primary injector source).
 */
import { loadWilhelmPdfFullText } from "./pdf-text-extract.mjs";
import { parseAllWilhelmPdfOrThrow } from "./hexagram-fidelity-wilhelm-pdf.mjs";
import { applyWilhelmPdfPrintVerified } from "./hexagram-fidelity-wilhelm-pdf-verified.mjs";
import { applyWilhelmBaynesSupplements } from "./hexagram-fidelity-wilhelm-baynes-supplement.mjs";

/**
 * @param {{ force?: boolean }} [opts]
 */
export async function loadWilhelmPdfGoldOrThrow(opts = {}) {
  const pdfText = await loadWilhelmPdfFullText({ force: opts.force === true });
  let gold = parseAllWilhelmPdfOrThrow(pdfText);
  gold = applyWilhelmPdfPrintVerified(gold);
  gold = applyWilhelmBaynesSupplements(gold);
  return gold;
}
