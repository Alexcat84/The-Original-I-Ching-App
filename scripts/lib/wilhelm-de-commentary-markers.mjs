/**
 * German Wilhelm (Diederichs 1924) commentary boundary markers for OCR TXT split.
 * Calibrated against pilot hex 1, 2, 8 manual gold (PLAN-DAT-W-03).
 */

/** @type {RegExp[]} */
export const WILHELM_DE_COMMENTARY_START_RES = [
  /^Dem ursprünglichen Sinne nach/i,
  /^klärung des Kungtse/i,
  /^Klärung des Kungtse/i,
  /^Bemerkung:/i,
  /^Auf das menschliche Gebiet/i,
  /^Der (?:obere|untere) Strich/i,
  /^Kungtse sagt/i,
  /^Sehr früh hat sich das Nachdenken/i,
  /^Der Weise entnimmt/i,
  /^Die Verdoppelung des Zeichens/i,
  /^Ebenso wie es nur einen Himmel/i,
  /^Der Drache hat in China/i,
  /^Eine andere Spekulation/i,
  /^~~~~+/,
  /^In der Menschenwelt/i,
  /^Es handelt sich darum/i,
  // Line commentary (book-physical AU hex 1/2/8)
  /^Hier beginnen die Wirkungen/i,
  /^Ein Wirkungskreis eröffnet/i,
  /^Hier ist die Stelle des Übergangs/i,
  /^Hier ist der große Mann in der Sphäre/i,
  /^Wenn man so hoch emporsteigen/i,
  /^Wenn alle Linien Neunen/i,
  /^Wenn alle Linien Sechs/i,
  /^Wie die lichte Kraft/i,
  /^Genau so geht es im Leben/i,
  /^Das Schattige öffnet sich/i,
  /^Auf dem obersten Platz/i,
  /^Der Himmel hat als Symbol/i,
  /^Gelb ist die Farbe/i,
  /^Wenn man frei von Eitelkeit/i,
  /^Wenn es sich um Anknüpfen/i,
  /^Wenn man auf rechte und beharrliche/i,
  /^Man ist oft unter lauter/i,
  /^Die Beziehungen zu einem Mann/i,
  /^Bei den königlichen Treibjagden/i,
  /^Das Wasser auf der Erde/i,
  /^Das Wasser fließt von selbst/i,
  /^Es zeigt sich hier ein Herrscher/i,
  /^Das Haupt ist der Anfang/i,
  /^Die Natur kann nur darum/i,
  /^Die vier Grundrichtungen/i,
];

/**
 * @param {string} text
 */
export function isWilhelmDeCommentaryStart(text) {
  const t = String(text ?? "").trim();
  if (!t) return false;
  return WILHELM_DE_COMMENTARY_START_RES.some((re) => re.test(t));
}
