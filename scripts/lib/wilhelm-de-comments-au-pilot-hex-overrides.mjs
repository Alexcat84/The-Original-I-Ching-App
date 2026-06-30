/**
 * Per-hex field fix overrides for generic AU pilot builder.
 * Add entries when JPG review finds hex-specific OCR issues.
 * QA code: AU-FID-W-026 · v1.0.0
 */
import { fixHex3L3BFromJpg, fixHex3L5BFromJpg, fixHex3L6BFromJpg, fixHex3RulerNoteFromJpg } from "./wilhelm-de-comments-au-pilot-hex3-jpg.mjs";
import { cleanLineBCommon } from "./wilhelm-de-comments-au-pilot-common.mjs";

/**
 * @typedef {{
 *   fixRulerNote?: (raw: string) => string;
 *   fixSequence?: (raw: string) => string;
 *   fixMiscNotes?: (raw: string) => string;
 *   fixCommentaryDecision?: (raw: string) => string;
 *   fixImageOracle?: (raw: string) => string;
 *   fixCommentaryImage?: (blob: string, commentary: string) => string;
 *   judgmentOracle?: string;
 *   fixWenYen?: (raw: string) => string;
 *   fixWenYenNote?: (raw: string) => string;
 *   lineA?: Record<number, (rawB: string, src: Record<string, string>) => string>;
 *   lineB?: Record<number, (raw: string) => string>;
 * }} HexOverride
 */

/** @type {Record<number, HexOverride>} */
export const HEX_OVERRIDES = {
  3: {
    fixRulerNote: fixHex3RulerNoteFromJpg,
    lineB: {
      3: fixHex3L3BFromJpg,
      4: (raw) => cleanLineBCommon(raw).replace(/Klarheit,\n/, "Klarheit.\n"),
      5: fixHex3L5BFromJpg,
      6: fixHex3L6BFromJpg,
    },
  },
  10: {
    fixRulerNote: () =>
      'Der Herr, der das Zeichen konstituiert, ist die Sechs auf drittem Platz; die Neun auf fünftem Platz ist der beherrschende Herr des Zeichens. Die Sechs auf drittem Platz tritt als einzig Weiches inmitten der Menge der Festen auf unter Furcht und Zittern. Daher hat das Zeichen den Namen „das Auftreten". Wer auf geehrtem Platz weilt, muß besonders fortwährend Gefahr und Furcht im Herzen tragen. Darum heißt das Urteil zur Neun auf fünftem Platz: „Beharrlichkeit bringt Gefahr." Im Kommentar zur Entscheidung heißt es von diesem Strich: „Fest, zentral und korrekt tritt er auf den Platz des Herrn und bleibt ohne Makel."',
  },
  25: {
    fixRulerNote: () =>
      'Die Herren des Zeichens sind die Anfangsneun und die Neun auf fünftem Platz. Die Anfangsneun ist der Anfang der Bewegung des Lichts wie die Anfangsbewegung des aufrichtigen Herzens der Menschen. Die Neun auf fünftem Platz ist die Essenz der Art des Schöpferischen wie die Unermüdlichkeit des höchst Wahrhaftigen. Darum heißt es im Kommentar zur Entscheidung: „Das Feste kommt von außen und wird zum Herrn im Innern." Das bezieht sich auf den Anfangsstrich. Ferner heißt es: „Das Feste ist in der Mitte und findet Entsprechung." Das bezieht sich auf den fünften Strich.',
  },
  43: {
    fixRulerNote: () =>
      "Der Sinn des Zeichens geht daraus hervor, daß ein dunkler Strich am äußersten Platz ganz oben steht, darum ist die obere Sechs der konstituierende Herr des Zeichens. Aber die fünf lichten Striche wenden sich entschlossen gegen den dunklen. Der fünfte ist an ihrer Spitze und außerdem an geehrtem Platz, darum ist die Neun auf fünftem Platz der beherrschende Herr des Zeichens.",
  },
  59: {
    lineB: {
      5: (raw) =>
        cleanLineBCommon(raw).replace(/^Ein König weilt ohne Makel\."?/, '„Ein König weilt ohne Makel."'),
    },
  },
  64: {
    fixRulerNote: () =>
      'Der Herr des Zeichens ist die Sechs auf fünftem Platz; denn die Zeit vor der Vollendung ist eine Zeit, da anfangs Wirren und am Ende Ordnung herrschen. Die Sechs auf fünftem Platz ist im äußeren Zeichen und eröffnet gerade die Zeit der Ordnung. Darum heißt es im Kommentar zur Entscheidung: „Vor der Vollendung. Gelingen. Denn das Weiche erlangt die Mitte."',
  },
};
