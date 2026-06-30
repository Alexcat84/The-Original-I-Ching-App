/**
 * Canonical Wilhelm DE trigram labels (1924 Diederichs) plus OCR aliases and
 * legacy Baynes EN join keys. Used by build-hexagrams.mjs and build-trigrams.mjs.
 */
export const WILHELM_TRIGRAMS = [
  {
    id: "heaven",
    chinese: "乾",
    wilhelmLabel: "das Schöpferische",
    aliases: ["der Himmel", "THE CREATIVE"],
  },
  {
    id: "earth",
    chinese: "坤",
    wilhelmLabel: "das Empfangende",
    aliases: ["THE RECEPTIVE"],
  },
  {
    id: "water",
    chinese: "坎",
    wilhelmLabel: "das Abgründige",
    aliases: ["das Wasser", "THE ABYSMAL"],
  },
  {
    id: "thunder",
    chinese: "震",
    wilhelmLabel: "das Erregende",
    aliases: ["THE AROUSING"],
  },
  {
    id: "mountain",
    chinese: "艮",
    wilhelmLabel: "das Stillehalten",
    aliases: ["KEEPING STILL"],
  },
  {
    id: "wind",
    chinese: "巽",
    wilhelmLabel: "das Sanfte",
    aliases: ["THE GENTLE"],
  },
  {
    id: "lake",
    chinese: "兌",
    wilhelmLabel: "das Heitere",
    aliases: ["das Heitre", "THE JOYOUS"],
  },
  {
    id: "fire",
    chinese: "離",
    wilhelmLabel: "das Haftende",
    aliases: ["THE CLINGING", "das Haßende"],
  },
];

/** Normalize raw Wilhelm trigram text to the canonical DE label. */
export function canonicalWilhelmTrigramLabel(raw) {
  const trimmed = String(raw ?? "")
    .replace(/,$/, "")
    .trim();
  if (!trimmed) return "";
  for (const trigram of WILHELM_TRIGRAMS) {
    if (trimmed === trigram.wilhelmLabel || trigram.aliases.includes(trimmed)) {
      return trigram.wilhelmLabel;
    }
  }
  return trimmed;
}

/** Resolve any Wilhelm/Baynes trigram label to a stable TrigramId. */
export function wilhelmTrigramIdFromLabel(label) {
  const canonical = canonicalWilhelmTrigramLabel(label);
  const found = WILHELM_TRIGRAMS.find((t) => t.wilhelmLabel === canonical);
  if (!found) {
    throw new Error(`Unknown Wilhelm trigram label: ${label}`);
  }
  return found.id;
}
