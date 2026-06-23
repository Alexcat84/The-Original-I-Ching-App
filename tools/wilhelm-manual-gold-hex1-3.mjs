import { USER_HEX1 } from "./verify-hex1-manual.mjs";
import { USER_HEX2_3 } from "./verify-hex-manual-paste.mjs";

/** Manual gold (Sheets 2026-06-23) — hex 1–3, all 31 fields */
export const USER_MANUAL_GOLD = {
  1: USER_HEX1,
  2: {
    hex: "2",
    nombre: "The Receptive",
    chinese: "坤",
    trigrama_arriba: "above K'UN THE RECEPTIVE, EARTH",
    trigrama_abajo: "below K'UN THE RECEPTIVE, EARTH",
    ...USER_HEX2_3[2],
  },
  3: {
    hex: "3",
    nombre: "Difficulty at the Beginning",
    chinese: "屯",
    trigrama_arriba: "above K'AN THE ABYSMAL, WATER",
    trigrama_abajo: "below CHêN THE AROUSING, THUNDER",
    ...USER_HEX2_3[3],
  },
};
