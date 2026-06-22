/**
 * Print-verified oracle overrides where pdftotext OCR corrupts Wilhelm/Baynes 1950.
 * Transcribed from physical Pantheon edition photos (2026-06-22).
 *
 * @see hexagram-fidelity-wilhelm-baynes-supplement.mjs (Parma gaps)
 * @see WILHELM_BAYNES_1950_CITATION
 */
import { WILHELM_BAYNES_1950_CITATION } from "./hexagram-fidelity-wilhelm-baynes-supplement.mjs";

export const WILHELM_PDF_PRINT_VERIFIED_PAGES = {
  "8:judgment": "p. 37",
  "8:image": "p. 38",
  "11:image": "p. 33",
  "21:judgment": "p. 92",
  "21:image": "p. 92",
  "21:5": "p. 94",
};

/** @type {Record<number, Partial<{ judgment: string; image: string; lines: Record<number, string> }>>} */
export const WILHELM_PDF_PRINT_VERIFIED = {
  11: {
    image:
      "Heaven and earth unite: the image of PEACE.\n" +
      "Thus the ruler\n" +
      "Divides and completes the course of heaven and earth,\n" +
      "And so aids the people.",
  },
  8: {
    judgment:
      "HOLDING TOGETHER brings good fortune.\n" +
      "Inquire of the oracle once again\n" +
      "Whether you possess sublimity, constancy, and perseverance;\n" +
      "Then there is no blame.\n" +
      "Those who are uncertain gradually join.\n" +
      "Whoever comes too late\n" +
      "Meets with misfortune.",
    image:
      "On the earth is water:\n" +
      "The image of HOLDING TOGETHER.\n" +
      "Thus the kings of antiquity\n" +
      "Bestowed the different states as fiefs\n" +
      "And cultivated friendly relations\n" +
      "With the feudal lords.",
  },
  21: {
    judgment:
      "BITING THROUGH has success.\n" +
      "It is favorable to let justice be administered.",
    image:
      "Thunder and lightning:\n" +
      "The image of BITING THROUGH.\n" +
      "Thus the kings of former times made firm the laws\n" +
      "Through clearly defined penalties.",
    lines: {
      5:
        "Bites on dried lean meat.\n" +
        "Receives yellow gold.\n" +
        "Perseveringly aware of danger.\n" +
        "No blame.",
    },
  },
};

/**
 * Apply photo-verified oracle fields onto PDF-parsed gold (mutates copy).
 * @param {Record<number, { judgment?: string; image?: string; lines?: Record<number, string> }>} parsed
 */
export function applyWilhelmPdfPrintVerified(parsed) {
  const out = structuredClone(parsed);
  for (const [hexKey, fields] of Object.entries(WILHELM_PDF_PRINT_VERIFIED)) {
    const n = Number(hexKey);
    const row = out[n];
    if (!row) continue;
    const sources = [...(row._printVerifiedSources ?? [])];
    if (fields.judgment) {
      row.judgment = fields.judgment;
      sources.push(`${WILHELM_BAYNES_1950_CITATION} ${WILHELM_PDF_PRINT_VERIFIED_PAGES[`${n}:judgment`] ?? ""}`.trim());
    }
    if (fields.image) {
      row.image = fields.image;
      sources.push(`${WILHELM_BAYNES_1950_CITATION} ${WILHELM_PDF_PRINT_VERIFIED_PAGES[`${n}:image`] ?? ""}`.trim());
    }
    if (fields.lines) {
      row.lines = { ...(row.lines ?? {}), ...fields.lines };
      for (const pos of Object.keys(fields.lines)) {
        sources.push(`${WILHELM_BAYNES_1950_CITATION} ${WILHELM_PDF_PRINT_VERIFIED_PAGES[`${n}:${pos}`] ?? `L${pos}`}`.trim());
      }
    }
    out[n] = { ...row, _printVerifiedSources: sources };
  }
  return out;
}
