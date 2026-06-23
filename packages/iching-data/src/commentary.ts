import wilhelmCommentaryRaw from "./generated/hexagrams.wilhelm.commentary.json" with { type: "json" };
import leggeCommentaryRaw from "./generated/hexagrams.legge.commentary.json" with { type: "json" };
import {
  wilhelmCommentaryFileSchema,
  leggeCommentaryFileSchema,
  type WilhelmCommentary,
  type LeggeCommentary,
} from "./commentary-schema.js";

const wilhelmCommentaries: readonly WilhelmCommentary[] = wilhelmCommentaryFileSchema.parse(
  wilhelmCommentaryRaw,
);
const leggeCommentaries: readonly LeggeCommentary[] = leggeCommentaryFileSchema.parse(
  leggeCommentaryRaw,
);

export function getAllWilhelmCommentary(): readonly WilhelmCommentary[] {
  return wilhelmCommentaries;
}

export function getWilhelmCommentaryByNumber(num: number): WilhelmCommentary {
  const found = wilhelmCommentaries.find((c) => c.number === num);
  if (!found) {
    throw new Error(`Unknown hexagram number for Wilhelm commentary: ${num}`);
  }
  return found;
}

export function getAllLeggeCommentary(): readonly LeggeCommentary[] {
  return leggeCommentaries;
}

export function getLeggeCommentaryByNumber(num: number): LeggeCommentary {
  const found = leggeCommentaries.find((c) => c.number === num);
  if (!found) {
    throw new Error(`Unknown hexagram number for Legge commentary: ${num}`);
  }
  return found;
}

export type {
  WilhelmCommentary,
  WilhelmPointCommentary,
  WilhelmAbout,
  WilhelmWenYen,
  LeggeCommentary,
  LeggeLineSymbolism,
} from "./commentary-schema.js";
