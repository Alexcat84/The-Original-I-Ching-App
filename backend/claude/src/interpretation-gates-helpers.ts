import type { CastResult } from "@iching-oracle/iching-engine";
import {
  changingLinePositionsLabel,
  ichingStructuralCorrectionAppendix,
} from "./interpretation-structural-i18n.js";

function claimedChangingCount(text: string): number | null {
  const lower = text.toLowerCase();
  if (
    /sin l[ií]neas?\s+(en\s+)?(movimiento|mutaci[oó]n|mutantes?)/i.test(
      lower,
    ) ||
    /no changing lines?/i.test(lower) ||
    /without changing lines?/i.test(lower)
  ) {
    return 0;
  }
  if (/l[ií]nea\s+[uú]nica|[uú]nica\s+l[ií]nea|one changing line/i.test(lower))
    return 1;
  if (/dos\s+l[ií]neas|2\s+l[ií]neas|two changing lines?/i.test(lower))
    return 2;
  if (/tres\s+l[ií]neas|3\s+l[ií]neas|three changing lines?/i.test(lower))
    return 3;
  if (/cuatro\s+l[ií]neas|4\s+l[ií]neas|four changing lines?/i.test(lower))
    return 4;
  if (/cinco\s+l[ií]neas|5\s+l[ií]neas|five changing lines?/i.test(lower))
    return 5;
  if (/seis\s+l[ií]neas|6\s+l[ií]neas|six changing lines?/i.test(lower))
    return 6;
  return null;
}

/**
 * Logs when the response mentions a changing-line count that differs from the cast.
 * Does not modify user-visible text.
 */
export function enforceIChingStructuralConsistency(
  text: string,
  cast: CastResult,
  language: string,
): string {
  const expected = cast.changingLines.length;
  const claimed = claimedChangingCount(text);
  if (claimed === null || claimed === expected) return text;
  const lineList = changingLinePositionsLabel(cast, language);
  console.warn("[enforceIChingStructuralConsistency] count mismatch", {
    expected,
    claimed,
    lineList,
    correction: ichingStructuralCorrectionAppendix(cast, language, expected, lineList),
    hexagram: cast.primaryHexagram?.number,
    language,
  });
  return text;
}
